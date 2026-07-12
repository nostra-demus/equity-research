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


def test_external_provenance() -> None:
    """External-data lane (frameworks/EXTERNAL_DATA.md): a `<doc>.source.json` sidecar is never a
    source row, its provenance rides on the document's row, nested files carry a pool-relative
    `path`, and the readiness entity gate ignores deliberately multi-company external docs."""
    import json as _json
    import os as _os

    with tempfile.TemporaryDirectory() as pool_td, tempfile.TemporaryDirectory() as out_td:
        pool = Path(pool_td)
        (pool / "note.txt").write_text("Amazon results commentary, top-level user note.")
        ext = pool / "external" / "yipitdata"
        ext.mkdir(parents=True)
        (ext / "panel.txt").write_text("Cloud panel: AWS growth estimate 29.3% with margin of error.")
        (ext / "panel.txt.source.json").write_text(_json.dumps({
            "provider": "YipitData", "source_type": "alt_data_panel", "tier": 5,
            "as_of": "2026-03-31", "tickers": ["AMZN", "MSFT", "GOOGL"]}))
        (ext / "note.txt").write_text("external doc sharing a basename with a top-level file")
        tegus = pool / "external" / "tegus"
        tegus.mkdir(parents=True)
        (tegus / "call.txt").write_text("direct drop with NO sidecar — path-derived provenance")

        manifest = ep.extract_pool(str(pool), out_td, vision=False)
        files = [s["file"] for s in manifest["sources"]]
        check("external: sidecar is not a source row", "panel.txt.source.json" not in files, str(files))
        panel = next((s for s in manifest["sources"] if s["file"] == "panel.txt"), {})
        check("external: doc flagged external", panel.get("external") is True, str(panel))
        check("external: provenance attached from sidecar",
              (panel.get("provenance") or {}).get("provider") == "YipitData", str(panel))
        check("external: nested path recorded",
              panel.get("path") == "external/yipitdata/panel.txt", str(panel))
        nested_note = [s for s in manifest["sources"] if s["file"] == "note.txt"]
        check("external: duplicate basenames distinguishable via path",
              sorted(s.get("path", "") for s in nested_note) == ["", "external/yipitdata/note.txt"],
              str(nested_note))
        md = (Path(out_td) / "manifest.md").read_text()
        check("external: manifest.md carries the provenance summary",
              "external: YipitData · alt_data_panel · tier 5 · as-of 2026-03-31" in md, md[-500:])
        # a direct drop with no sidecar still gets path-derived provenance (provider = folder,
        # conservative tier 9) — never `unknown provider · unclassified` (PR #210 review)
        call = next((s for s in manifest["sources"] if s["file"] == "call.txt"), {})
        fallback = call.get("provenance") or {}
        check("external: sidecar-less drop gets path-derived provenance",
              fallback.get("provider") == "tegus" and fallback.get("tier") == 9
              and fallback.get("source_type") == "external_other", str(call))
        check("external: manifest.md shows the fallback provider/tier",
              "external: tegus · external_other · tier 9" in md, md[-500:])
        # sidecar edits invalidate the mtime freshness check (a provenance fix must rebuild)
        future = __import__("time").time() + 60
        _os.utime(str(ext / "panel.txt.source.json"), (future, future))
        check("external: sidecar edit breaks is_fresh (manifest rebuilds)",
              ep.is_fresh(out_td, str(pool), str(_HERE / "extract_pool.py")) is None)

    # entity gate: two same-name foreign-company files under external/ must NOT trip the
    # contamination blocker (multi-company external docs are normal)…
    with tempfile.TemporaryDirectory() as pool_td, tempfile.TemporaryDirectory() as out_td:
        pool = Path(pool_td)
        (pool / "Amazon com Inc Annual Report.txt").write_text("Amazon com Inc. filing text.")
        (pool / "Amazon com Inc Profile.txt").write_text("Amazon com Inc. profile text.")
        ext = pool / "external" / "somepanel"
        ext.mkdir(parents=True)
        (ext / "Microsoft Corporation Panel A.txt").write_text("Azure spend text")
        (ext / "Microsoft Corporation Panel B.txt").write_text("Azure token text")
        summary = ep.readiness_summary(str(pool), out_td)
        codes = [i["code"] for i in summary["issues"]]
        check("external: entity gate ignores external/ files", "entity_disagreement" not in codes, str(codes))
    # …while the SAME files at top level still do (the skip, not a broken gate, is what saved it)
    with tempfile.TemporaryDirectory() as pool_td, tempfile.TemporaryDirectory() as out_td:
        pool = Path(pool_td)
        (pool / "Amazon com Inc Annual Report.txt").write_text("Amazon com Inc. filing text.")
        (pool / "Amazon com Inc Profile.txt").write_text("Amazon com Inc. profile text.")
        (pool / "Microsoft Corporation Panel A.txt").write_text("Azure spend text")
        (pool / "Microsoft Corporation Panel B.txt").write_text("Azure token text")
        summary = ep.readiness_summary(str(pool), out_td)
        codes = [i["code"] for i in summary["issues"]]
        check("external: same foreign files at top level DO trip the gate",
              "entity_disagreement" in codes, str(codes))


def test_external_tier_ceiling() -> None:
    """§4/§5 masquerade guard (EXTERNAL_DATA.md §4): a sidecar can never fold in stamped at a tier MORE
    trusted than its source_type earns. An over-claim is clamped DOWN to the ceiling and flagged; a missing
    tier is derived from the source_type; a MORE conservative tier is left as-is."""
    import json as _json

    with tempfile.TemporaryDirectory() as pool_td, tempfile.TemporaryDirectory() as out_td:
        pool = Path(pool_td)
        ext = pool / "external" / "acme"
        ext.mkdir(parents=True)
        # a channel check (ceiling 9) that LIES it is tier 5 → must clamp to 9 + flag
        (ext / "liar.txt").write_text("a channel check masquerading as vendor-grade")
        (ext / "liar.txt.source.json").write_text(_json.dumps({
            "provider": "Acme", "source_type": "channel_check", "tier": 5, "as_of": "2026-07-01"}))
        # a broker note (ceiling 7) claiming tier 5 → clamp to 7 + flag
        (ext / "broker.txt").write_text("sell-side initiation")
        (ext / "broker.txt.source.json").write_text(_json.dumps({
            "provider": "BankCo", "source_type": "broker_research", "tier": 5}))
        # a legit alt-data panel at its ceiling (5) → unchanged, no flag
        (ext / "panel.txt").write_text("licensed panel estimate")
        (ext / "panel.txt.source.json").write_text(_json.dumps({
            "provider": "Yip", "source_type": "alt_data_panel", "tier": 5}))
        # an expert call with NO tier → derived from the source_type (9)
        (ext / "call.txt").write_text("expert network call")
        (ext / "call.txt.source.json").write_text(_json.dumps({
            "provider": "GLG", "source_type": "expert_call"}))
        # an alt-data panel voluntarily MORE conservative (9) → left as-is (conservative is always allowed)
        (ext / "cons.txt").write_text("panel cited conservatively")
        (ext / "cons.txt.source.json").write_text(_json.dumps({
            "provider": "Yip", "source_type": "alt_data_panel", "tier": 9}))
        # an OFF-LIST source_type (not in the trust table) claiming tier 1 → must FAIL CLOSED: clamp to the
        # conservative external_other ceiling (9) + flag. An unclassified sidecar can't buy a filing-grade tier.
        (ext / "scrape.txt").write_text("a web scrape with a made-up source_type")
        (ext / "scrape.txt.source.json").write_text(_json.dumps({
            "provider": "Reddit", "source_type": "social_scrape", "tier": 1}))
        # a sidecar with NO source_type at all, claiming tier 1 → same fail-closed clamp to 9 + flag.
        (ext / "notype.txt").write_text("sidecar missing its source_type")
        (ext / "notype.txt.source.json").write_text(_json.dumps({
            "provider": "Mystery", "tier": 1}))
        # a FLOAT over-claim (3.0) on a panel (ceiling 5) → floats are numeric tiers: clamp to 5 + flag.
        (ext / "flt.txt").write_text("panel with a float tier")
        (ext / "flt.txt.source.json").write_text(_json.dumps({
            "provider": "Yip", "source_type": "alt_data_panel", "tier": 3.0}))

        manifest = ep.extract_pool(str(pool), out_td, vision=False)
        prov = {s["file"]: (s.get("provenance") or {}) for s in manifest["sources"] if s.get("external")}

        liar = prov.get("liar.txt", {})
        check("tier-ceiling: channel_check over-claim clamped 5→9 + flagged",
              liar.get("tier") == 9 and (liar.get("tier_corrected") or {}).get("declared") == 5, str(liar))
        broker = prov.get("broker.txt", {})
        check("tier-ceiling: broker_research over-claim clamped 5→7",
              broker.get("tier") == 7 and "tier_corrected" in broker, str(broker))
        check("tier-ceiling: legit alt_data_panel tier 5 unchanged (no flag)",
              prov.get("panel.txt", {}).get("tier") == 5 and "tier_corrected" not in prov.get("panel.txt", {}),
              str(prov.get("panel.txt")))
        check("tier-ceiling: missing tier derived from source_type (expert_call → 9)",
              prov.get("call.txt", {}).get("tier") == 9, str(prov.get("call.txt")))
        check("tier-ceiling: a MORE conservative tier is left as-is (panel voluntarily tier 9)",
              prov.get("cons.txt", {}).get("tier") == 9 and "tier_corrected" not in prov.get("cons.txt", {}),
              str(prov.get("cons.txt")))
        scrape = prov.get("scrape.txt", {})
        check("tier-ceiling: off-list source_type fails closed (tier 1 → 9 + flag)",
              scrape.get("tier") == 9 and (scrape.get("tier_corrected") or {}).get("declared") == 1, str(scrape))
        notype = prov.get("notype.txt", {})
        check("tier-ceiling: sidecar with no source_type fails closed (tier 1 → 9 + flag)",
              notype.get("tier") == 9 and "tier_corrected" in notype, str(notype))
        flt = prov.get("flt.txt", {})
        check("tier-ceiling: float over-claim clamped (3.0 → 5 + flag)",
              flt.get("tier") == 5 and "tier_corrected" in flt, str(flt))
        md = (Path(out_td) / "manifest.md").read_text()
        check("tier-ceiling: manifest.md flags the over-claim", "⚠ tier corrected" in md, md[-800:])


def main() -> int:
    print("== sniff: content beats extension ==")
    test_sniff()
    print("== deterministic readers (per physical form) ==")
    test_readers()
    print("== full extract_pool pipeline (statuses + corpus) ==")
    test_pipeline()
    print("== external-data provenance (sidecars, paths, entity-gate skip) ==")
    test_external_provenance()
    print("== external tier-ceiling masquerade guard (§4/§5) ==")
    test_external_tier_ceiling()
    print(f"\n{_passed} passed, {_failed} failed, {_skipped} skipped")
    return 1 if _failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
