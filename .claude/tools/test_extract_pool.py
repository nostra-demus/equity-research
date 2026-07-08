#!/usr/bin/env python3
"""Extraction verification bench for extract_pool.py.

PROVES the deterministic text-out readers still extract, per physical file form, and that content-sniffing
beats the file extension. Before this, the ONLY end-to-end extraction test in the repo was the CIQ FACT
path (test_ciq_facts.py, on the ciq-facts branch); every OTHER reader — legacy .xls (xlrd), OOXML (openpyxl),
text-layer PDF (pdftotext -> pypdf), .rtf (textutil), plain text, and the HTML-mislabeled-as-.xls sniff —
was untested, yet these feed EVERY narrative module (governance, catalyst, earnings, solvency). A silent
xlrd / poppler / openpyxl / textutil regression would degrade every run with nothing to catch it; this is
the CLAUDE.md §11/§20 bad-extraction guard, mechanized.

Fixtures live in testdata/extract_bench/ and are SYNTHETIC — authored here, tiny, no proprietary data
(the same principle test_ciq_facts.py follows). Platform-specific readers that aren't installed (macOS
`textutil` for .rtf; a PDF reader) SKIP with a visible note instead of failing, so the bench is portable:
it asserts fully where the readers exist and never false-fails where they don't.

Run: python3 test_extract_pool.py   (exit 0 = all pass; skips are not failures)
"""
from __future__ import annotations

import importlib.util
import shutil
import tempfile
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_FX = _HERE / "testdata" / "extract_bench"

# Import extract_pool as a module. Its dependency self-bootstrap (_ensure_deps -> os.execv into .venv) runs
# ONLY inside main()/__main__ (extract_pool.py:1425/1461), never at import — so importing here is side-effect
# free and re-uses whatever xlrd/openpyxl/pdftotext/pypdf/textutil this interpreter already has.
_spec = importlib.util.spec_from_file_location("extract_pool", _HERE / "extract_pool.py")
ep = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ep)

_passed = 0
_failed = 0
_skipped = 0


def check(name: str, cond: bool, detail: str = "") -> None:
    global _passed, _failed
    if cond:
        _passed += 1
        print(f"  ok   {name}")
    else:
        _failed += 1
        print(f"  FAIL {name}   {detail}")


def skip(name: str, why: str) -> None:
    global _skipped
    _skipped += 1
    print(f"  skip {name}   ({why})")


def _cells(tabs) -> list[str]:
    return [c for _n, _r, _c, rows in tabs for row in rows for c in row]


# Skip a platform reader only when it is genuinely ABSENT — never on a present-but-broken reader (that must
# FAIL). Keyed on tool/module availability, NOT on matching the reader's error string (which varies): a
# poppler-absent + pypdf-absent box returns 'pypdf unavailable ...', not 'no text', so a substring guard
# there false-FAILS the very no-reader case it means to skip.
def _pdf_reader_available() -> bool:
    if shutil.which("pdftotext"):
        return True
    try:
        import pypdf  # noqa: F401
        return True
    except Exception:
        return False


def _rtf_reader_available() -> bool:
    return bool(shutil.which("textutil"))  # extract_pool._read_rtf has no non-textutil fallback


def test_sniff() -> None:
    # content beats extension — sniff_format keys off the magic bytes, not the suffix (the exact Capital IQ
    # mislabel case: an .xls that is really an HTML table, a .rtf that is really binary Word).
    check("sniff .xls  -> ole2 (BIFF)", ep.sniff_format(str(_FX / "ciq_synth.xls")) == "ole2")
    check("sniff .xlsx -> zip (OOXML)", ep.sniff_format(str(_FX / "synth.xlsx")) == "zip")
    check("sniff .pdf  -> pdf", ep.sniff_format(str(_FX / "textlayer.pdf")) == "pdf")
    check("sniff .rtf  -> rtf", ep.sniff_format(str(_FX / "transcript.rtf")) == "rtf")
    check("sniff HTML-as-.xls -> html (content beats extension)",
          ep.sniff_format(str(_FX / "mislabeled.xls")) == "html")


def test_readers() -> None:
    # legacy .xls via xlrd — the format real Capital IQ financial exports arrive as
    xls = ep.read_workbook(str(_FX / "ciq_synth.xls"), "xls")
    check("xls/xlrd: both tabs read + 'Net Debt' cell extracted",
          [t[0] for t in xls] == ["Income Statement", "Balance Sheet"] and any("Net Debt" in c for c in _cells(xls)),
          str([t[0] for t in xls]))
    # OOXML via openpyxl
    xlsx = ep.read_workbook(str(_FX / "synth.xlsx"), "xlsx")
    check("xlsx/openpyxl: 'Widget' + 'Alpha' cells extracted",
          any("Widget" in c for c in _cells(xlsx)) and any("Alpha" in c for c in _cells(xlsx)))
    # text-layer PDF via pdftotext, falling back to pypdf — SKIP only when neither reader is installed;
    # if a reader IS present it must extract the text (a present-but-broken reader FAILS, never skips).
    if _pdf_reader_available():
        pdf_txt, pdf_err = ep._read_pdf_text(str(_FX / "textlayer.pdf"))
        check("pdf: 'Total Revenue 42' text-layer extracted", "Total Revenue 42" in pdf_txt, f"err={pdf_err!r}")
    else:
        skip("pdf: text-layer extracted", "no PDF reader (pdftotext/pypdf) installed")
    # .rtf via macOS textutil — SKIP where textutil is absent (non-mac); assert where it exists
    if _rtf_reader_available():
        rtf_txt, rtf_err = ep._read_rtf(str(_FX / "transcript.rtf"))
        check("rtf: 'Earnings Call' text extracted", "Earnings Call" in rtf_txt, f"err={rtf_err!r}")
    else:
        skip("rtf: text extracted", "textutil not available (macOS-only reader)")


# formats read with pure-Python, no external tool — MUST never fail on any platform
_ALWAYS = {"ciq_synth.xls", "synth.xlsx", "note.txt", "mislabeled.xls"}
# formats whose reader is platform/tool-specific — a 'fail' here is a missing tool, recorded as a skip
_PLATFORM = {"textlayer.pdf", "transcript.rtf"}


def test_pipeline() -> None:
    # a platform file is exempt ONLY when its reader is genuinely absent — a present-but-broken pdf/rtf
    # reader must FAIL the pipeline check, never be waved through as a skip (keyed on availability, not on
    # the 'fail' status, which cannot tell 'tool missing' from 'tool present but produced nothing').
    reader_present = {"textlayer.pdf": _pdf_reader_available(), "transcript.rtf": _rtf_reader_available()}
    with tempfile.TemporaryDirectory() as td:
        manifest = ep.extract_pool(str(_FX), td, vision=False)
        by = {s["file"]: s for s in manifest["sources"]}
        for f in _ALWAYS | _PLATFORM:
            s = by.get(f, {})
            usable = s.get("status") in ("ok", "in-place")
            if f in _PLATFORM and not reader_present[f]:
                skip(f"pipeline: {f} usable", "reader tool not installed")
            else:
                check(f"pipeline: {f} status ok/in-place", usable, str(s))
        # the pure-Python formats must contribute ZERO extraction failures on every platform
        pure_fail = [by[f] for f in _ALWAYS if by.get(f, {}).get("status") == "fail"]
        check("pipeline: pure-Python formats (xls/xlsx/txt/html) never fail", not pure_fail, str(pure_fail))
        # content-over-extension, end to end: the HTML-as-.xls cell value must reach a written extract
        blob = "".join(p.read_text(errors="ignore") for p in Path(td).rglob("*") if p.is_file())
        check("pipeline: HTML-as-.xls value reaches the corpus (sniff beats extension)",
              "Sniff Test Revenue" in blob)


def main() -> int:
    print("== sniff: content beats extension ==")
    test_sniff()
    print("== deterministic readers (per physical form) ==")
    test_readers()
    print("== full extract_pool pipeline (statuses + corpus) ==")
    test_pipeline()
    print(f"\n{_passed} passed, {_failed} failed, {_skipped} skipped")
    return 1 if _failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
