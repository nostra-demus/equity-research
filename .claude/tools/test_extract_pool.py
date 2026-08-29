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
import json
import shutil
import subprocess
import sys
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


def test_machine_json_stdout_contract() -> None:
    """A noisy/corrupt-tolerant parser can never corrupt the CLI JSON protocol."""
    with tempfile.TemporaryDirectory() as root_td:
        root = Path(root_td)
        pool = root / "pool"
        out = root / "out"
        pool.mkdir()
        out.mkdir()

        # Appending one byte preserves this synthetic OLE2 workbook's readable
        # contents but makes xlrd print the same ``WARNING *** file size`` line
        # that the live KAR Capital IQ exports produced.  xlrd retains stdout
        # in default arguments, so a mere ``sys.stdout = sys.stderr`` does not
        # contain it; the CLI FD shield must.
        noisy = pool / "noisy.xls"
        noisy.write_bytes((_FX / "ciq_synth.xls").read_bytes() + b"!")
        script = _HERE / "extract_pool.py"

        readiness = subprocess.run(
            [sys.executable, str(script), "--readiness-json", str(pool), str(out)],
            capture_output=True, text=True, timeout=120,
        )
        try:
            readiness_payload = json.loads(readiness.stdout)
        except Exception as exc:
            readiness_payload = None
            readiness_error = f"{exc}: {readiness.stdout[:240]!r}"
        else:
            readiness_error = ""
        check("readiness CLI: noisy workbook still emits one valid JSON document",
              readiness.returncode == 0 and readiness_payload is not None,
              readiness_error or readiness.stderr[-500:])
        check("readiness CLI: parser warning is kept off stdout",
              "WARNING" not in readiness.stdout and readiness_payload.get("file_count") == 1,
              readiness.stdout[:240])

        listed = subprocess.run(
            [sys.executable, str(script), "--list-json", str(noisy)],
            capture_output=True, text=True, timeout=120,
        )
        try:
            listed_payload = json.loads(listed.stdout)
        except Exception as exc:
            listed_payload = None
            listed_error = f"{exc}: {listed.stdout[:240]!r}"
        else:
            listed_error = ""
        check("list CLI: noisy workbook still emits one valid JSON document",
              listed.returncode == 0 and listed_payload is not None,
              listed_error or listed.stderr[-500:])
        check("list CLI: parser warning is kept off stdout",
              "WARNING" not in listed.stdout and listed_payload.get("status") == "ok",
              listed.stdout[:240])


def test_durable_relationship_artifact() -> None:
    """The chain graph must cross the git/deployment boundary, not live only in ignored cache."""
    with tempfile.TemporaryDirectory() as root_td:
        root = Path(root_td)
        pool = root / "data" / "ANCHOR"
        out = root / "analyses" / "ANCHOR_2099-01-01" / "_pool_extracts"
        pool.mkdir(parents=True)
        out.mkdir(parents=True)
        ep._write_relationships(str(pool), str(out))
        cache = out / "relationships.json"
        durable = out.parent / "relationships.json"
        check("relationships: ignored cache sidecar still written", cache.is_file())
        check("relationships: committed run-root artifact is written", durable.is_file())
        check("relationships: cache and durable artifact are byte-identical",
              cache.read_bytes() == durable.read_bytes())

        durable.unlink()
        ep._ensure_durable_relationships(str(pool), str(out))
        check("relationships: a fresh cache hit republishes a missing durable artifact",
              durable.is_file() and durable.read_bytes() == cache.read_bytes())

        durable.write_text('{"schema_version":"stale"}\n')
        ep._ensure_durable_relationships(str(pool), str(out))
        check("relationships: a cache hit repairs a divergent durable artifact",
              durable.read_bytes() == cache.read_bytes())


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
        corpus = Path(td) / "corpus.txt"
        manifest = ep.extract_pool(str(_FX), td, corpus_path=str(corpus), vision=False)
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
        corpus_text = corpus.read_text()
        check("pipeline: manifest-approved workbook sheets and original text reach the corpus",
              "Net Debt" in corpus_text and "watch the covenant headroom" in corpus_text, corpus_text[-800:])
        check("pipeline: unchanged guarded extracts are cache-eligible",
              ep.is_fresh(td, str(_FX), str(_HERE / "extract_pool.py")) is not None)
        html_extract = next(s["extract"] for s in manifest["sources"] if s["file"] == "mislabeled.xls")
        (Path(td) / html_extract).write_text("What I Learned This Week — stale derived output")
        check("pipeline: tampered/stale derived text invalidates the cached manifest",
              ep.is_fresh(td, str(_FX), str(_HERE / "extract_pool.py")) is None)


def test_pool_path_boundary() -> None:
    """A configured root symlink is valid; no descendant link/special file is evidence."""
    import os

    with tempfile.TemporaryDirectory() as td, tempfile.TemporaryDirectory() as out_td:
        base = Path(td)
        real_pool = base / "real-pool"
        real_pool.mkdir()
        alias_pool = base / "pool-alias"
        alias_pool.symlink_to(real_pool, target_is_directory=True)
        (real_pool / "safe.txt").write_text("safe pool evidence")
        outside_file = base / "outside-secret.txt"
        outside_file.write_text("OUTSIDE-CANARY-MUST-NOT-ENTER")
        outside_dir = base / "outside-dir"
        outside_dir.mkdir()
        (outside_dir / "nested.txt").write_text("OUTSIDE-NESTED-CANARY")
        (real_pool / "leak.txt").symlink_to(outside_file)
        (real_pool / "linked-dir").symlink_to(outside_dir, target_is_directory=True)
        fifo = real_pool / "blocking.fifo"
        if hasattr(os, "mkfifo"):
            os.mkfifo(fifo)

        corpus = Path(out_td) / "corpus.txt"
        manifest = ep.extract_pool(
            str(alias_pool), out_td, force=True, corpus_path=str(corpus), vision=False,
        )
        serialized = __import__("json").dumps(manifest) + corpus.read_text()
        check("pool boundary: configured root symlink remains supported",
              any(row.get("file") == "safe.txt" and row.get("status") == "in-place"
                  for row in manifest["sources"]), str(manifest["sources"]))
        check("pool boundary: descendant file/directory symlinks and special files are not ingested",
              "OUTSIDE-CANARY-MUST-NOT-ENTER" not in serialized
              and "OUTSIDE-NESTED-CANARY" not in serialized
              and not any(row.get("file") in {"leak.txt", "nested.txt", "blocking.fifo"}
                          for row in manifest["sources"]), serialized[-1000:])
        refused = False
        try:
            ep._read_pool_regular_bytes(str(alias_pool), "leak.txt")
        except ValueError:
            refused = True
        check("pool boundary: direct safe-reader use rejects a descendant symlink", refused)

        # A second hard-link name is a writable alias to the same inode. Even
        # when both names stay inside the pool, neither the pool reader nor the
        # canonical-pointer reader may return those bytes as settled evidence.
        hardlink_alias = real_pool / "safe-hardlink-alias.txt"
        os.link(real_pool / "safe.txt", hardlink_alias)
        pool_multilink_refused = canonical_multilink_refused = False
        try:
            ep._read_pool_regular_bytes(str(alias_pool), "safe.txt")
        except ValueError:
            pool_multilink_refused = True
        try:
            ep._read_regular_nofollow_bytes(str(real_pool / "safe.txt"))
        except ValueError:
            canonical_multilink_refused = True
        check("pool boundary: writable hard-link aliases are never accepted as settled evidence",
              pool_multilink_refused and canonical_multilink_refused)


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
        # a peer_transcript (a competitor's own call, ceiling 6) declaring tier 6 → accepted, no flag.
        (ext / "peer.txt").write_text("competitor earnings call transcript")
        (ext / "peer.txt.source.json").write_text(_json.dumps({
            "provider": "CapitalIQ", "source_type": "peer_transcript", "tier": 6}))
        # a peer_transcript over-claiming tier 5 (more trusted than a transcript earns) → clamp to 6 + flag.
        (ext / "peerlie.txt").write_text("competitor call mislabelled as vendor-grade")
        (ext / "peerlie.txt.source.json").write_text(_json.dumps({
            "provider": "CapitalIQ", "source_type": "peer_transcript", "tier": 5}))

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
        peer = prov.get("peer.txt", {})
        check("tier-ceiling: peer_transcript at its ceiling (6) unchanged (no flag)",
              peer.get("tier") == 6 and "tier_corrected" not in peer, str(peer))
        peerlie = prov.get("peerlie.txt", {})
        check("tier-ceiling: peer_transcript over-claim clamped 5→6 + flagged",
              peerlie.get("tier") == 6 and (peerlie.get("tier_corrected") or {}).get("declared") == 5, str(peerlie))
        md = (Path(out_td) / "manifest.md").read_text()
        check("tier-ceiling: manifest.md flags the over-claim", "⚠ tier corrected" in md, md[-800:])


def test_malformed_sidecar() -> None:
    """A `<doc>.source.json` sidecar that is NOT a JSON object — a bare array/scalar, or a dict whose
    `tier_corrected` field is itself not an object — must never crash the fold. A non-object sidecar
    degrades to path-derived provenance (exactly like no sidecar at all); a non-object `tier_corrected`
    is ignored, not rendered. A hand-edited or auto-connector-written sidecar is precisely the untrusted
    input EXTERNAL_DATA.md §4 guards against, so it must fail CLOSED (path-derived / ignored), never raise."""
    import json as _json

    with tempfile.TemporaryDirectory() as pool_td, tempfile.TemporaryDirectory() as out_td:
        pool = Path(pool_td)
        ext = pool / "external" / "acme"
        ext.mkdir(parents=True)
        # sidecar is a valid-JSON ARRAY, not an object → the loader stored it verbatim and the fold called
        # .get() on a list → AttributeError, crashing the whole pool extract. Must degrade to path-derived.
        (ext / "arr.txt").write_text("doc whose sidecar is a bare JSON array")
        (ext / "arr.txt.source.json").write_text(_json.dumps(["not", "an", "object"]))
        # sidecar is a valid object but pre-declares tier_corrected as a STRING (not a dict) → the manifest
        # summary called tc.get('declared') on a str → AttributeError. Must be ignored, not rendered.
        (ext / "badtc.txt").write_text("doc whose sidecar pre-declares a non-object tier_corrected")
        (ext / "badtc.txt.source.json").write_text(_json.dumps({
            "provider": "Acme", "source_type": "alt_data_panel", "tier": 5, "tier_corrected": "boom"}))

        manifest = ep.extract_pool(str(pool), out_td, vision=False)  # must NOT raise
        prov = {s["file"]: (s.get("provenance") or {}) for s in manifest["sources"] if s.get("external")}

        arr = prov.get("arr.txt", {})
        check("malformed-sidecar: non-object sidecar degrades to path-derived (provider=folder, tier 9)",
              arr.get("provider") == "acme" and arr.get("tier") == 9
              and arr.get("source_type") == "external_other", str(arr))
        badtc = prov.get("badtc.txt", {})
        check("malformed-sidecar: object sidecar with non-dict tier_corrected still folds (tier 5 kept)",
              badtc.get("tier") == 5, str(badtc))
        md = (Path(out_td) / "manifest.md").read_text()  # building the summary must not raise
        check("malformed-sidecar: manifest.md renders, non-object tier_corrected not shown as a flag",
              "boom" not in md, md[-400:])


def test_wiltw_gold_runtime_exclusion() -> None:
    """Golden boundary: WILTW is a methodology source, never GOLD runtime evidence.

    Exercise all deterministic identities: the shipped filename family, the
    expanded title in renamed content and post-OCR image text, and the explicit
    sidecar marker.  A normal lawfully-provenanced research report (including a
    scanned image) in the same folder must remain usable, proving this is not a
    blanket broker/research-report or visual-source ban.
    """
    import base64 as _base64
    import json as _json

    with tempfile.TemporaryDirectory() as root_td, tempfile.TemporaryDirectory() as out_td:
        gold = Path(root_td) / "data" / "GOLD"
        ext = gold / "external" / "weeklydesk"
        ext.mkdir(parents=True)

        named = ext / "WILTW_2026-07-30 (1).pdf"
        named.write_text("FORBIDDEN_NAMED_GOLD_ASSERTION=5597")
        (ext / f"{named.name}.source.json").write_text(_json.dumps({
            "provider": "Weekly Desk", "source_type": "broker_research", "tier": 7,
            "origin": named.name,
        }))

        renamed = ext / "renamed-metals-note.txt"
        renamed.write_text("What I Learned This Week\nFORBIDDEN_RENAMED_GOLD_ASSERTION=4192")

        marked = ext / "methods-only-input.txt"
        marked.write_text("FORBIDDEN_MARKED_GOLD_ASSERTION=1405")
        (ext / f"{marked.name}.source.json").write_text(_json.dumps({
            "provider": "Research Methods", "source_type": "external_other", "tier": 9,
            "methodology_only": True,
        }))

        # A real PNG path has no text for the bounded pre-sniff.  Stub only the
        # fragile OCR engine's deterministic return, so the test still drives
        # format sniffing and the complete standalone-image extraction branch.
        one_pixel_png = _base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk"
            "+A8AAQUBAScY42YAAAAASUVORK5CYII="
        )
        renamed_scan = ext / "renamed-metals-scan.png"
        renamed_scan.write_bytes(one_pixel_png)
        lawful_scan = ext / "lawful-market-scan.png"
        lawful_scan.write_bytes(one_pixel_png)
        for image_path in (renamed_scan, lawful_scan):
            (ext / f"{image_path.name}.source.json").write_text(_json.dumps({
                "provider": "Lawful Scanned Research", "source_type": "broker_research", "tier": 7,
                "as_of": "2026-07-30", "license": "subscriber-only",
            }))

        lawful = ext / "lawful-gold-research-report.txt"
        lawful.write_text("LAWFUL_GOLD_SOURCE=official-provider-observation")
        (ext / f"{lawful.name}.source.json").write_text(_json.dumps({
            "provider": "Lawful Research", "source_type": "broker_research", "tier": 7,
            "as_of": "2026-07-30", "license": "subscriber-only",
        }))

        corpus = Path(root_td) / "gold-corpus.txt"
        real_image_reader = ep._read_image_file

        def fixture_image_reader(path):
            if Path(path).name == renamed_scan.name:
                return ("What I Learned This Week\nFORBIDDEN_SCANNED_GOLD_ASSERTION=7000",
                        "OCR'd image (fixture)", None)
            if Path(path).name == lawful_scan.name:
                return ("LAWFUL_SCANNED_GOLD_SOURCE=primary-market-observation",
                        "OCR'd image (fixture)", None)
            return real_image_reader(path)
        ep._read_image_file = fixture_image_reader
        try:
            manifest = ep.extract_pool(
                str(gold), out_td, force=True, corpus_path=str(corpus), vision=False,
            )
        finally:
            ep._read_image_file = real_image_reader
        by = {source["file"]: source for source in manifest["sources"]}
        forbidden = [by[named.name], by[renamed.name], by[marked.name], by[renamed_scan.name]]
        check("WILTW filename, expanded title, post-OCR scan, and explicit marker all fail GOLD extraction",
              all(row.get("status") == "fail" and row.get("kind") == "methodology-only"
                  and ep.METHODOLOGY_ONLY_ERROR in row.get("error", "") for row in forbidden),
              str(forbidden))
        check("rejected WILTW rows expose no citable report provenance",
              all(row.get("provenance") == {"integrity_status": "failed", "usable": False}
                  for row in forbidden), str(forbidden))
        check("ordinary lawful GOLD research remains usable with its provenance",
              by[lawful.name].get("status") == "in-place"
              and (by[lawful.name].get("provenance") or {}).get("provider") == "Lawful Research",
              str(by[lawful.name]))
        check("ordinary lawful scanned GOLD research remains usable after the post-OCR gate",
              by[lawful_scan.name].get("status") == "ok"
              and (by[lawful_scan.name].get("provenance") or {}).get("provider") == "Lawful Scanned Research"
              and by[lawful_scan.name].get("extract"), str(by[lawful_scan.name]))
        check("post-OCR rejected scan writes no manifest-approved extract",
              not by[renamed_scan.name].get("extract"), str(by[renamed_scan.name]))
        corpus_text = corpus.read_text()
        check("GOLD corpus contains the lawful report but no WILTW/report-derived assertions",
              "LAWFUL_GOLD_SOURCE" in corpus_text
              and "LAWFUL_SCANNED_GOLD_SOURCE" in corpus_text
              and "FORBIDDEN_NAMED_GOLD_ASSERTION" not in corpus_text
              and "FORBIDDEN_RENAMED_GOLD_ASSERTION" not in corpus_text
              and "FORBIDDEN_MARKED_GOLD_ASSERTION" not in corpus_text
              and "FORBIDDEN_SCANNED_GOLD_ASSERTION" not in corpus_text,
              corpus_text)

    # A visual source can be unreadable at pre-flight and become identifiable
    # later when OCR/vision finishes.  Adding that full-text cache must break
    # manifest freshness and drive the post-reader quarantine on the next call.
    with tempfile.TemporaryDirectory() as root_td, tempfile.TemporaryDirectory() as out_td:
        gold = Path(root_td) / "data" / "GOLD"; gold.mkdir(parents=True)
        scan = gold / "renamed-weekly-scan.png"
        scan.write_bytes(_base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk"
            "+A8AAQUBAScY42YAAAAASUVORK5CYII="
        ))
        real_image_reader = ep._read_image_file
        ep._read_image_file = lambda _path: ("", None, "fixture OCR not ready")
        try:
            first = ep.extract_pool(str(gold), out_td, force=True, vision=False)
        finally:
            ep._read_image_file = real_image_reader
        check("visual cache: initially unreadable renamed scan is cached only as a failed source",
              first["sources"][0].get("status") == "fail", str(first["sources"]))
        cache_path = Path(ep._visual_cache_path(str(scan), "tesseract"))
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        cache_path.write_text(
            "What I Learned This Week\nFORBIDDEN_LATE_OCR_GOLD_ASSERTION=8000",
        )
        check("visual cache: newly available OCR identity invalidates prior manifest freshness",
              ep.is_fresh(out_td, str(gold), str(_HERE / "extract_pool.py")) is None)
        rebuilt = ep.extract_pool(str(gold), out_td, vision=False)
        row = rebuilt["sources"][0]
        check("visual cache: rebuilt manifest quarantines late-discovered WILTW content",
              row.get("kind") == "methodology-only" and row.get("status") == "fail"
              and "FORBIDDEN_LATE_OCR_GOLD_ASSERTION" not in "".join(
                  p.read_text(errors="ignore") for p in Path(out_td).glob("*.txt")
              ), str(row))
        cache_path.unlink(missing_ok=True)


def test_connector_projection_integrity() -> None:
    """A canonical connector sidecar seals the projected JSON; partial/mismatched pairs are unusable."""
    import hashlib as _hashlib
    import json as _json
    import sys as _sys
    if ep.SCRIPTS_DIR not in _sys.path:
        _sys.path.insert(0, ep.SCRIPTS_DIR)
    from connector_contract import canonical_json_bytes as _connector_json_bytes

    with tempfile.TemporaryDirectory() as pool_td, tempfile.TemporaryDirectory() as out_td:
        ext = Path(pool_td) / "external" / "official"
        ext.mkdir(parents=True)
        payload = {"series": "sealed", "as_of": "2026-08-01", "value": 1.0}
        doc = ext / "sealed.json"
        canonical = _connector_json_bytes(payload)
        doc.write_bytes(canonical)
        sidecar = {"provider": "Official", "source_type": "official_data", "tier": 5,
                   "as_of": "2026-08-01", "content_sha256": "0" * 64}
        (ext / "sealed.json.source.json").write_text(_json.dumps(sidecar))
        bad = ep.extract_pool(pool_td, out_td, force=True, vision=False)
        row = next(s for s in bad["sources"] if s["file"] == "sealed.json")
        check("connector projection: mismatched payload/sidecar hash is rejected as bad extraction",
              row.get("status") == "fail" and "content_sha256 mismatch" in row.get("error", ""), str(row))

        sidecar["content_sha256"] = _hashlib.sha256(canonical).hexdigest()
        (ext / "sealed.json.source.json").write_text(_json.dumps(sidecar))
        good = ep.extract_pool(pool_td, out_td, force=True, vision=False)
        row = next(s for s in good["sources"] if s["file"] == "sealed.json")
        check("connector projection: matching canonical payload/sidecar pair is usable",
              row.get("status") == "in-place", str(row))


def test_routed_raw_hash_binding() -> None:
    """The inbox router's raw-byte hash is rechecked at consumption time."""
    import hashlib as _hashlib
    import json as _json

    with tempfile.TemporaryDirectory() as root_td, tempfile.TemporaryDirectory() as out_td:
        pool = Path(root_td) / "AAA"
        ext = pool / "external" / "vendor"
        ext.mkdir(parents=True)
        doc = ext / "routed-note.txt"
        original = b"lawful original channel-check bytes\n"
        doc.write_bytes(original)
        sidecar = {
            "provider": "Vendor", "source_type": "channel_check", "tier": 9,
            "as_of": "2026-08-01", "license": "user-supplied",
            "routed_by": "ingest_external.py", "sha256": _hashlib.sha256(original).hexdigest(),
        }
        (ext / "routed-note.txt.source.json").write_text(_json.dumps(sidecar))
        good = ep.extract_pool(str(pool), out_td, force=True, vision=False)
        good_row = next(row for row in good["sources"] if row["file"] == "routed-note.txt")
        doc.write_bytes(b"mutated after ingest\n")
        bad = ep.extract_pool(str(pool), out_td, force=True, vision=False)
        bad_row = next(row for row in bad["sources"] if row["file"] == "routed-note.txt")
        check("ordinary routed bytes are usable only while their ingest sha256 still matches",
              good_row.get("status") != "fail"
              and bad_row.get("status") == "fail"
              and "sha256 does not match" in bad_row.get("error", ""), str(bad_row))


def test_v2_projection_is_anchored_to_current() -> None:
    """A self-consistent sidecar cannot impersonate a different canonical current."""
    import json as _json
    import sys as _sys
    from datetime import datetime as _datetime, timezone as _timezone

    if str(_HERE) not in _sys.path:
        _sys.path.insert(0, str(_HERE))
    import run_connectors as _runner

    with tempfile.TemporaryDirectory() as root_td, tempfile.TemporaryDirectory() as out_td:
        root = Path(root_td); data = root / "data"; pool = data / "AAA"; pool.mkdir(parents=True)
        croot = root / ".claude" / "connectors"; cdir = croot / "anchored"; cdir.mkdir(parents=True)
        manifest = {
            "manifest_version": 2, "schema_version": 1, "id": "anchored",
            "dataset_id": "test.anchored", "series_id": "test.anchored", "series": "Anchored series",
            "satisfies": ["anchored"], "subjects": ["AAA"], "provider": "Official",
            "authority_class": "government_official", "provider_priority": 100,
            "acquisition": "official_api", "source_type": "official_data", "tier": 5,
            "license": "test", "licensing": {"access": "public", "use": "allowed",
                "redistribution": "allowed", "terms_url": "https://example.test/terms"},
            "host_allowlist": ["example.test"], "credential_env": [],
            "release": {"cadence": "daily", "timezone": "UTC", "expected_lag_days": 0,
                "grace_days": 10, "revision_policy": "revisable"},
            "entry": "fetch.py", "verify": "fetch.py --verify",
            "output_path": "data/<SUBJECT>/external/official/sealed_<as_of>.json",
            "output_schema": {"series": "string", "as_of": "date", "value": "float"},
            "units": {"value": "index"}, "minimum_history": {"observations": 1},
        }
        (cdir / "connector.json").write_text(_json.dumps(manifest)); (cdir / "fetch.py").write_text("# fixture\n")
        payload = {"series": manifest["series"], "as_of": "2026-08-01", "value": 1.0}
        fetched = {"payload": payload, "as_of": payload["as_of"], "sidecar": {
            "provider": manifest["provider"], "source_type": manifest["source_type"], "tier": 5,
            "license": manifest["license"], "licensing": manifest["licensing"], "connector_id": manifest["id"],
            "dataset_id": manifest["dataset_id"], "series_id": manifest["series_id"], "schema_version": 1,
            "as_of": payload["as_of"], "source_url": "https://example.test/source",
        }}
        _runner.publish_validated(manifest, "AAA", str(data), fetched,
                                  _datetime(2026, 8, 2, tzinfo=_timezone.utc),
                                  connector_hash=_runner.connector_fingerprint(str(cdir)), commit="fixture")
        eligible_now = _datetime(2026, 8, 4, tzinfo=_timezone.utc)
        previous_registry = ep.CONNECTOR_REGISTRY_ROOT; ep.CONNECTOR_REGISTRY_ROOT = str(croot)
        try:
            good = ep.extract_pool(
                str(pool), out_td, force=True, vision=False, now=eligible_now,
            )
            row = next(source for source in good["sources"] if source["file"] == "sealed_2026-08-01.json")
            check("v2 projection: verified current payload + exact provenance is usable",
                  row.get("status") == "in-place", str(row))
            payload_path = pool / "external" / "official" / "sealed_2026-08-01.json"
            original_payload = payload_path.read_bytes()

            # Deterministically replace the live projection after sidecar/current
            # verification but before extract_pool snapshots and parses it. The
            # earlier provenance must never authenticate these later bytes.
            raced_payload = _runner.canonical_json_bytes({**payload, "value": 999.0})
            real_collect_sidecars = ep._collect_sidecars
            def collect_then_replace(*args, **kwargs):
                verified = real_collect_sidecars(*args, **kwargs)
                payload_path.write_bytes(raced_payload)
                return verified
            ep._collect_sidecars = collect_then_replace
            try:
                raced = ep.extract_pool(
                    str(pool), out_td, force=True, vision=False, now=eligible_now,
                )
            finally:
                ep._collect_sidecars = real_collect_sidecars
                payload_path.write_bytes(original_payload)
            raced_row = next(source for source in raced["sources"]
                             if source["file"] == "sealed_2026-08-01.json")
            check("v2 projection: a post-verification snapshot race fails before parsing with old provenance",
                  raced_row.get("status") == "fail"
                  and "changed after provenance verification" in raced_row.get("error", ""),
                  str(raced_row))
            # Restore the clean manifest/cache baseline so the following cache
            # invalidation checks still test their named condition independently.
            ep.extract_pool(
                str(pool), out_td, force=True, vision=False, now=eligible_now,
            )
            check("v2 projection: unchanged canonical state is cache-eligible",
                  ep.is_fresh(
                      out_td, str(pool), str(_HERE / "extract_pool.py"), now=eligible_now,
                  ) is not None)
            # is_fresh mtime-checks extract_pool.py alone, but the verdict also depends on policy imported
            # at run time from the shared modules. Tightening one of those (e.g. a new methodology-only
            # rule) previously left every cached manifest valid, so evidence that had just become forbidden
            # kept being served as usable until something unrelated touched the pool. Asserted on the guard
            # itself rather than through is_fresh, because file identity includes mtime/ctime: restoring the
            # bytes cannot restore the identity, so an is_fresh round-trip could not isolate this rule.
            _policy_rels = {
                "scripts/connector_contract.py",
                "scripts/connector_vintages.py",
                ".claude/tools/run_connectors.py",
            }
            _guard_now = ep._cache_guard_snapshot(str(pool), out_td, {})
            check("cache guard: the shared policy modules are part of the cache identity",
                  _policy_rels <= set((_guard_now.get("policy_modules") or {}).keys()),
                  str(sorted((_guard_now.get("policy_modules") or {}).keys())))
            _policy_src = _HERE.parent.parent / "scripts" / "connector_contract.py"
            _policy_before = _policy_src.read_bytes()
            try:
                _policy_src.write_bytes(_policy_before + b"\n# policy tightened\n")
                _guard_after = ep._cache_guard_snapshot(str(pool), out_td, {})
            finally:
                _policy_src.write_bytes(_policy_before)
            check("cache guard: tightening a shared policy changes the guard, forcing one rebuild",
                  _guard_after != _guard_now
                  and _guard_after.get("policy_modules") != _guard_now.get("policy_modules"))
            # A projection can be individually perfect — canonical bytes, exact provenance, in date — and
            # still be one half of a contradiction: run_connectors records provider_disagreement only after
            # BOTH providers have published, so integrity and expiry alone cannot catch it. Detection of the
            # disagreement itself is covered in test_run_connectors; what is pinned here is that extraction
            # actually re-asks at decision_at and refuses to serve a disputed series as citable evidence.
            _real_disagreement = _runner._point_in_time_disagreement
            _runner._point_in_time_disagreement = (
                lambda data_root, man, subject, cutoff=None: {"kind": "provider_disagreement"}
            )
            try:
                disputed = ep.extract_pool(
                    str(pool), out_td, force=True, vision=False, now=eligible_now,
                )
            finally:
                _runner._point_in_time_disagreement = _real_disagreement
            disputed_row = next(source for source in disputed["sources"]
                                if source["file"] == "sealed_2026-08-01.json")
            check("v2 projection: a disputed series is visible but never citable evidence",
                  disputed_row.get("status") == "skipped"
                  and disputed_row.get("provenance") == {
                      "integrity_status": "disputed", "usable": False,
                  }
                  and "disputed connector series" in disputed_row.get("error", "")
                  and disputed["totals"]["failures"] == 0, str(disputed_row))
            check("v2 projection: a disputed series cannot count as a usable source",
                  not any(source.get("status") in ep.USABLE_STATUSES
                          for source in disputed["sources"]), str(disputed["sources"]))
            current_path = Path(_runner.connector_storage_paths(
                str(data), {**manifest, "_dir": str(cdir)}, "AAA",
            )["current"])
            current_bytes = current_path.read_bytes()
            current_path.write_text("{corrupt")
            check("v2 projection: canonical corruption outside the subject pool invalidates cached extraction",
                  ep.is_fresh(
                      out_td, str(pool), str(_HERE / "extract_pool.py"), now=eligible_now,
                  ) is None)
            current_path.write_bytes(current_bytes)
            sidecar_path = pool / "external" / "official" / "sealed_2026-08-01.json.source.json"
            original_sidecar = sidecar_path.read_text()
            sidecar_path.unlink()
            missing = ep.extract_pool(
                str(pool), out_td, force=True, vision=False, now=eligible_now,
            )
            row = next(source for source in missing["sources"] if source["file"] == "sealed_2026-08-01.json")
            check("v2 projection: missing sidecar fails extraction, never degrades to an ordinary tier-9 drop",
                  row.get("status") == "fail" and "missing sidecar" in row.get("error", "")
                  and row.get("provenance") == {"integrity_status": "failed", "usable": False}, str(row))
            sidecar_path.write_text("{not-json")
            corrupt = ep.extract_pool(
                str(pool), out_td, force=True, vision=False, now=eligible_now,
            )
            row = next(source for source in corrupt["sources"] if source["file"] == "sealed_2026-08-01.json")
            check("v2 projection: corrupt sidecar fails extraction, never degrades to path-derived provenance",
                  row.get("status") == "fail" and "sidecar is unreadable" in row.get("error", "")
                  and "provenance_basis" not in (row.get("provenance") or {}), str(row))
            sidecar_path.write_text(original_sidecar)
            def duplicate_first_field(raw):
                text = raw.decode("utf-8"); comma = text.find(",")
                return ("{" + text[1:comma] + "," + text[1:]).encode("utf-8")
            payload_path.write_bytes(duplicate_first_field(original_payload))
            duplicate_payload = ep.extract_pool(
                str(pool), out_td, force=True, vision=False, now=eligible_now,
            )
            row = next(source for source in duplicate_payload["sources"]
                       if source["file"] == "sealed_2026-08-01.json")
            check("v2 projection: duplicate-key payload bytes fail exact canonical binding",
                  row.get("status") == "fail" and "not canonical" in row.get("error", ""), str(row))
            payload_path.write_bytes(original_payload)
            sidecar_path.write_bytes(duplicate_first_field(original_sidecar.encode("utf-8")))
            duplicate_sidecar = ep.extract_pool(
                str(pool), out_td, force=True, vision=False, now=eligible_now,
            )
            row = next(source for source in duplicate_sidecar["sources"]
                       if source["file"] == "sealed_2026-08-01.json")
            check("v2 projection: duplicate-key sidecar bytes fail exact canonical binding",
                  row.get("status") == "fail" and "not canonical" in row.get("error", ""), str(row))
            sidecar_path.write_text(original_sidecar)
            (cdir / "fetch.py").write_text("# changed transform\n")
            drifted = ep.extract_pool(str(pool), out_td, vision=False, now=eligible_now)
            row = next(source for source in drifted["sources"] if source["file"] == "sealed_2026-08-01.json")
            check("v2 projection: live connector-transform drift is rejected until a new retrieval",
                  row.get("status") == "fail" and "different connector transform" in row.get("error", ""), str(row))
            (cdir / "fetch.py").write_text("# fixture\n")
            forged = _json.loads(sidecar_path.read_text()); forged["provider"] = "Forged"
            sidecar_path.write_bytes(_runner.canonical_json_bytes(forged))
            bad = ep.extract_pool(
                str(pool), out_td, force=True, vision=False, now=eligible_now,
            )
            row = next(source for source in bad["sources"] if source["file"] == "sealed_2026-08-01.json")
            check("v2 projection: self-consistent payload hash cannot bypass canonical-current provenance",
                  row.get("status") == "fail" and "exactly match canonical current" in row.get("error", ""), str(row))

            # A dated output template intentionally leaves prior projections in
            # the pool. Once the next commit becomes current, the exact older
            # pair is audit/replay material: valid but not citable, not a failed
            # extraction, and never copied into the research corpus.
            sidecar_path.write_text(original_sidecar)
            payload2 = {"series": manifest["series"], "as_of": "2026-08-02", "value": 2.0}
            fetched2 = {"payload": payload2, "as_of": payload2["as_of"], "sidecar": {
                "provider": manifest["provider"], "source_type": manifest["source_type"], "tier": 5,
                "license": manifest["license"], "licensing": manifest["licensing"],
                "connector_id": manifest["id"], "dataset_id": manifest["dataset_id"],
                "series_id": manifest["series_id"], "schema_version": 1,
                "as_of": payload2["as_of"], "source_url": "https://example.test/source",
            }}
            _runner.publish_validated(manifest, "AAA", str(data), fetched2,
                                      _datetime(2026, 8, 3, tzinfo=_timezone.utc),
                                      connector_hash=_runner.connector_fingerprint(str(cdir)), commit="fixture")
            corpus = Path(out_td) / "corpus.txt"
            superseded = ep.extract_pool(
                str(pool), out_td, force=True, vision=False, corpus_path=str(corpus),
                now=eligible_now,
            )
            old_row = next(source for source in superseded["sources"]
                           if source["file"] == "sealed_2026-08-01.json")
            new_row = next(source for source in superseded["sources"]
                           if source["file"] == "sealed_2026-08-02.json")
            corpus_text = corpus.read_text()
            check("v2 projection: an exact older committed projection is non-citable, not a failure",
                  old_row.get("status") == "skipped"
                  and old_row.get("provenance") == {"integrity_status": "superseded", "usable": False}
                  and new_row.get("status") == "in-place"
                  and superseded["totals"]["failures"] == 0, str(superseded["sources"]))
            check("v2 projection: superseded payload is excluded from the corpus",
                  '"value": 1.0' not in corpus_text, corpus_text)

            # File mtimes and canonical integrity are unchanged at the release
            # boundary. The decision clock alone must invalidate the formerly
            # usable cache and make the latest projection non-citable.
            expired_now = _datetime(2026, 8, 14, tzinfo=_timezone.utc)
            check("v2 projection: crossing the frozen release deadline invalidates an eligible cache",
                  ep.is_fresh(
                      out_td, str(pool), str(_HERE / "extract_pool.py"), now=expired_now,
                  ) is None)
            expired_corpus = Path(out_td) / "expired-corpus.txt"
            expired = ep.extract_pool(
                str(pool), out_td, vision=False, corpus_path=str(expired_corpus),
                now=expired_now,
            )
            expired_row = next(source for source in expired["sources"]
                               if source["file"] == "sealed_2026-08-02.json")
            check("v2 projection: latest-but-expired current is visible but unusable evidence",
                  expired_row.get("status") == "skipped"
                  and expired_row.get("provenance") == {
                      "eligibility_status": "expired", "usable": False,
                  }
                  and "expired connector projection" in expired_row.get("error", "")
                  and expired["totals"]["failures"] == 0, str(expired_row))
            check("v2 projection: expired current cannot enter corpus or usable source count",
                  '"value": 2.0' not in expired_corpus.read_text()
                  and not any(source.get("status") in ep.USABLE_STATUSES
                              for source in expired["sources"]), str(expired["sources"]))
            check("v2 projection: an unchanged expired manifest remains cache-eligible as unusable",
                  ep.is_fresh(
                      out_td, str(pool), str(_HERE / "extract_pool.py"), now=expired_now,
                  ) is not None)

            old_payload_path = pool / "external" / "official" / "sealed_2026-08-01.json"
            old_payload_path.write_bytes(_runner.canonical_json_bytes({**payload, "value": 999.0}))
            tampered_old = ep.extract_pool(
                str(pool), out_td, force=True, vision=False, now=eligible_now,
            )
            tampered_old_row = next(source for source in tampered_old["sources"]
                                    if source["file"] == "sealed_2026-08-01.json")
            check("v2 projection: only an exact superseded pair is ignored; mutation fails closed",
                  tampered_old_row.get("status") == "fail"
                  and "payload does not match sidecar" in tampered_old_row.get("error", "")
                  and tampered_old["totals"]["failures"] == 1, str(tampered_old_row))
        finally:
            ep.CONNECTOR_REGISTRY_ROOT = previous_registry


def test_snapshot_bound_to_attested_digest() -> None:
    """A projection that changes AFTER its provenance was verified must not be parsed under it.

    _collect_sidecars verifies a projection's bytes against content_sha256 (and, for a v2 projection,
    against canonical current / the committed vintage) strictly before _snapshot_pool_file reads them.
    Without binding the snapshot to that attested digest, a Drive projection re-synced or tampered with
    in between is parsed and emitted into the manifest under the earlier trusted provenance — the sealed
    source's attribution applied to bytes it never attested (Codex review on PR #407).
    """
    import hashlib

    verified = b'{"series":"gold","value":1}'
    tampered = b'{"series":"gold","value":9}'
    attested = hashlib.sha256(verified).hexdigest()
    rel = "external/acme/projection.json"

    with tempfile.TemporaryDirectory() as pool, tempfile.TemporaryDirectory() as snap:
        doc = Path(pool) / rel
        doc.parent.mkdir(parents=True, exist_ok=True)
        doc.write_bytes(verified)
        snapshot = ep._snapshot_pool_file(pool, rel, snap, attested)
        check("unchanged projection snapshots under its attested digest",
              Path(snapshot).read_bytes() == verified)

    with tempfile.TemporaryDirectory() as pool, tempfile.TemporaryDirectory() as snap:
        doc = Path(pool) / rel
        doc.parent.mkdir(parents=True, exist_ok=True)
        doc.write_bytes(verified)          # what verification attested
        doc.write_bytes(tampered)          # re-synced/tampered before the snapshot read
        try:
            ep._snapshot_pool_file(pool, rel, snap, attested)
            changed_rejected = False
            detail = "tampered projection was snapshotted under the verified provenance"
        except ValueError as exc:
            changed_rejected = "changed after provenance verification" in str(exc)
            detail = str(exc)
        check("projection changed after verification fails closed", changed_rejected, detail)

    with tempfile.TemporaryDirectory() as pool, tempfile.TemporaryDirectory() as snap:
        plain = Path(pool) / "ordinary.txt"
        plain.write_bytes(b"hello")
        snapshot = ep._snapshot_pool_file(pool, "ordinary.txt", snap)
        check("a file with no attested digest still snapshots (backward compatible)",
              Path(snapshot).read_bytes() == b"hello")


def test_cloud_sync_metadata_churn() -> None:
    """A metadata-only touch during a read must NOT reject a file whose bytes never moved.

    The data pool is a Google Drive for Desktop mount. Drive writes its `com.google.drivefs.item-id`
    xattr — and macOS its `com.apple.lastuseddate#PS` — onto pool files independently of content.
    That bumps st_ctime_ns and NOTHING else. The readers used to compare ctime across the read and
    reject any delta, so one sync pass landing mid-extraction turned a whole 87-file evidence pool
    into `unsafe-input` / "pool input rejected" rows and left the readiness gate with nothing usable.

    os.chmod is the portable stand-in for that touch: it moves ctime while leaving content, size and
    mtime untouched, so this test reproduces the exact mechanism on Linux CI and macOS alike.
    """
    import hashlib as _hashlib
    import os as _os

    payload = bytes(range(256)) * 8192            # 2 MiB, wide enough to race the read window
    digest = _hashlib.sha256(payload).hexdigest()

    # (1) ctime moved BEFORE the read: must read clean.
    with tempfile.TemporaryDirectory() as pool:
        target = Path(pool) / "filing.pdf"
        target.write_bytes(payload)
        _os.chmod(target, 0o644)
        check("cloud-sync: a ctime-only touch before the read is not a failure",
              ep._read_pool_regular_bytes(pool, "filing.pdf") == payload)

    # (2) ctime moved DURING the read — the reported failure. The reader must still return the
    #     correct bytes (it re-reads the pinned fd and compares digests rather than trusting ctime).
    with tempfile.TemporaryDirectory() as pool:
        target = Path(pool) / "filing.pdf"
        target.write_bytes(payload)
        real_read, calls = _os.read, {"n": 0}

        def touching_read(descriptor, size):
            chunk = real_read(descriptor, size)
            calls["n"] += 1
            if calls["n"] == 1:                   # a sync pass lands mid-read: metadata only
                _os.chmod(target, 0o600 if calls["n"] % 2 else 0o644)
            return chunk

        _os.read = touching_read
        try:
            got = ep._read_pool_regular_bytes(pool, "filing.pdf")
        except Exception as exc:                  # noqa: BLE001 — any raise is the regression
            got = f"raised {type(exc).__name__}: {exc}"
        finally:
            _os.read = real_read
        check("cloud-sync: a ctime-only touch DURING the read returns the correct bytes",
              got == payload, str(got)[:200])
        check("cloud-sync: those bytes hash to the untouched content",
              isinstance(got, bytes) and _hashlib.sha256(got).hexdigest() == digest)

    # (3) the same touch must not silently re-cost the vision/OCR cache. The key is a content
    #     digest; when a touch landed mid-read the identity fell through to `unreadable:<path>`,
    #     which scopes the key to a pathname and MISSES the cache — re-paying Claude vision token
    #     spend for a file whose bytes never moved, against the module's "paid once per file, ever".
    with tempfile.TemporaryDirectory() as pool:
        target = Path(pool) / "scan.pdf"
        target.write_bytes(payload)
        settled_key = ep._visual_source_identity(str(target))
        real_read, calls = _os.read, {"n": 0}

        def touching_read(descriptor, size):
            chunk = real_read(descriptor, size)
            calls["n"] += 1
            if calls["n"] == 1:
                _os.chmod(target, 0o644)
            return chunk

        _os.read = touching_read
        try:
            raced_key = ep._visual_source_identity(str(target))
        finally:
            _os.read = real_read
        check("cloud-sync: a metadata touch mid-read keeps the vision/OCR cache key stable",
              raced_key == settled_key and settled_key.startswith("sha256:"),
              f"{settled_key} -> {raced_key}")

    # (4) the security invariant the ctime check was standing in for must still hold: a genuine
    #     mid-read CONTENT change is never returned as settled evidence under an earlier digest.
    with tempfile.TemporaryDirectory() as pool, tempfile.TemporaryDirectory() as snap:
        rel = "sealed.json"
        target = Path(pool) / rel
        target.write_bytes(b'{"v":1}')
        attested = _hashlib.sha256(b'{"v":1}').hexdigest()
        target.write_bytes(b'{"v":9}')            # re-synced/tampered after verification
        rejected = False
        try:
            ep._snapshot_pool_file(pool, rel, snap, attested)
        except ValueError as exc:
            rejected = "changed after provenance verification" in str(exc)
        check("cloud-sync: tolerating metadata churn did not loosen the attested-digest binding",
              rejected)


def test_cache_guard_survives_metadata_touch() -> None:
    """One Drive xattr touch must not discard the whole cached manifest.

    `_file_guard_identity` fed ctime_ns into the cache-freshness guard, which `is_fresh` compares
    whole across every pool file. Measured on the live 85-file INDIAMART pool: exactly ONE entry
    differed, in ctime_ns alone, with size and mtime_ns byte-identical — turning a ~1.3s cache hit
    into a ~24s full re-extraction. On a Drive mount that fires on essentially every run.
    """
    import os as _os

    with tempfile.TemporaryDirectory() as pool, tempfile.TemporaryDirectory() as out:
        (Path(pool) / "a.txt").write_text("audited annual report extract")
        (Path(pool) / "b.txt").write_text("second filing")
        manifest = ep.extract_pool(pool, out, force=True, vision=False)
        check("cache guard: a freshly built manifest is fresh",
              ep.is_fresh(out, pool, str(_HERE / "extract_pool.py")) is not None)

        _os.chmod(Path(pool) / "a.txt", 0o644)      # ctime-only touch, content untouched
        check("cache guard: a metadata-only touch does NOT force a full re-extraction",
              ep.is_fresh(out, pool, str(_HERE / "extract_pool.py")) is not None)

        # A real content change must still invalidate it — the guard's actual job.
        (Path(pool) / "a.txt").write_text("audited annual report extract — REVISED")
        check("cache guard: a real content change still invalidates the cache",
              ep.is_fresh(out, pool, str(_HERE / "extract_pool.py")) is None)
        check("cache guard: the manifest it guards is the one just built",
              isinstance(manifest, dict) and manifest.get("cache_guard", {}).get("version") == ep._CACHE_GUARD_VERSION)


def test_transient_cloud_filesystem_errors() -> None:
    """Drive hydrating a streamed placeholder raises ETIMEDOUT; that must be retried, not fatal.

    The engine runs with MaterializeDatalessFiles=true against a Drive *Stream*-mode pool, so pool
    files are dataless placeholders that download on first read. A slow hydration surfaced as
    `pool input rejected: [Errno 60] Operation timed out` and permanently failed the row.
    """
    import errno as _errno
    import os as _os

    payload = b"audited annual report text" * 4096
    with tempfile.TemporaryDirectory() as pool:
        (Path(pool) / "filing.pdf").write_bytes(payload)
        real_read, calls = _os.read, {"n": 0}

        def flaky_read(descriptor, size):
            calls["n"] += 1
            if calls["n"] == 1:                   # first touch blocks while Drive hydrates
                raise OSError(_errno.ETIMEDOUT, "Operation timed out")
            return real_read(descriptor, size)

        _os.read = flaky_read
        try:
            got = ep._read_pool_regular_bytes(pool, "filing.pdf")
        except Exception as exc:                  # noqa: BLE001
            got = f"raised {type(exc).__name__}: {exc}"
        finally:
            _os.read = real_read
        check("streamed pool: a transient ETIMEDOUT is retried, not a permanent failure",
              got == payload, str(got)[:200])

    # A non-transient OSError must still fail immediately — retry is for blips, not for real errors.
    with tempfile.TemporaryDirectory() as pool:
        (Path(pool) / "filing.pdf").write_bytes(payload)
        real_read = _os.read

        def refusing_read(descriptor, size):
            raise OSError(_errno.EACCES, "Permission denied")

        _os.read = refusing_read
        try:
            ep._read_pool_regular_bytes(pool, "filing.pdf")
            surfaced = "no error"
        except OSError as exc:
            surfaced = exc.errno
        except Exception as exc:                  # noqa: BLE001
            surfaced = f"{type(exc).__name__}"
        finally:
            _os.read = real_read
        check("streamed pool: a non-transient OSError still fails closed", surfaced == _errno.EACCES,
              str(surfaced))


def test_entity_addressee_is_not_the_registrant() -> None:
    """An Indian filing is ADDRESSED to the exchanges and SIGNED by the issuer.

    A real INDIAMART cover letter flattens to a two-column addressee line in the PDF text layer:
        "BSE Limited                     National Stock Exchange of India Limited"
    The CIQ-header pattern allowed `\\s*` (which matches newlines) between the name and its
    (EXCH:TICKER) tag, so it spanned the line break and slid its start forward until the span fit —
    emitting the left-truncated garbage names "ited National Stock Exchange of India Limited",
    "ed National Stock Exchange…" and "d National Stock Exchange…". Three fake companies from one
    line, which then read as a mixed-entity pool and HARD-BLOCKED the run on a clean pool.
    """
    cover = (
        "April 29, 2025\n\nTo,\n"
        "BSE Limited                                     National Stock Exchange of India Limited\n"
        "(BSE: 542726)                                   (NSE: INDIAMART)\n\n"
        " Subject:         Audited (Standalone and Consolidated) Financial Statements\n\n"
        " Dear Sir/Ma'am,\n\n Please find enclosed herewith the copy of Audited Financial Statements.\n\n"
        " Yours faithfully,\n For IndiaMART InterMESH Limited\n\n"
    )
    got = ep.entity_from_header(cover)
    check("entity: an Indian cover letter reads its SIGNATORY as the registrant",
          got == "IndiaMART InterMESH Limited", repr(got))
    check("entity: the exchange the letter is addressed TO is never the registrant",
          "Stock Exchange" not in got, repr(got))
    check("entity: no left-truncated mid-word name survives",
          not got.startswith(("ited", "ed ", "d ")), repr(got))

    # The two-column line alone (no signature) must yield nothing rather than a sliced fake name.
    unsigned = (
        "To,\nBSE Limited                                     National Stock Exchange of India Limited\n"
        "(BSE: 542726)                                   (NSE: INDIAMART)\n\n Dear Sir,\n"
    )
    got = ep.entity_from_header(unsigned)
    check("entity: an addressee block with no signatory yields no registrant", got == "", repr(got))

    # An exchange that is ITSELF the subject must still be readable from its own title page.
    own = "BSE Limited\n(Formerly Bombay Stock Exchange)\nAnnual Report 2025\n"
    check("entity: an exchange analysed as the SUBJECT is still read from its own cover page",
          ep.entity_from_header(own) == "BSE Limited", repr(ep.entity_from_header(own)))

    # A genuine CIQ export header still resolves — the tightened pattern must not break the good case.
    ciq = "IndiaMART InterMESH Limited (NSEI:INDIAMART) > Financials > Key Stats\nAs of Aug-13-2026\n"
    check("entity: a genuine one-line CIQ export header still resolves",
          ep.entity_from_header(ciq) == "IndiaMART InterMESH Limited", repr(ep.entity_from_header(ciq)))

    # The signatory pattern must never OVERRIDE a document that names its registrant outright, and
    # must not fire on capitalised boilerplate. "For Further Information Contact Investor Relations
    # Group" ends in a _CORP_SUFFIX ("Group"), so an un-cued "For <Name>" rule invented a company
    # from it — and, checked first, replaced the real registrant on US and data-vendor documents.
    us_10k = (
        "Acme Robotics Holdings\n(Exact name of registrant as specified in its charter)\n\n"
        "Title of each class   Trading Symbol(s)   Name of each exchange on which registered\n"
        "Common stock          ACME                NasdaqGS\n\n"
        "For Further Information Contact Investor Relations Group\n"
    )
    got = ep.entity_from_header(us_10k)
    check("entity: a US 10-K keeps its charter registrant, not IR boilerplate",
          got == "Acme Robotics Holdings", repr(got))

    vendor = ("Tata Elxsi Limited (NSEI:TATAELXSI) > Financials\nTrading Symbol: TATAELXSI\n"
              "For Further Information Contact Investor Relations Group\n")
    got = ep.entity_from_header(vendor)
    check("entity: a data-vendor export keeps its subject, not IR boilerplate",
          got == "Tata Elxsi Limited", repr(got))

    prose = ("The group continues\nto, among other things, expand capacity.\n"
             "For Further Information Contact Investor Relations Group\n")
    got = ep.entity_from_header(prose)
    check("entity: capitalised boilerplate is never read as a company",
          got == "", repr(got))

    sec = "Amazon.com, Inc.\n(Exact name of registrant as specified in its charter)\n"
    got = ep.entity_from_header(sec)
    check("entity: the SEC charter-registrant pattern is unaffected",
          got == "Amazon.com, Inc", repr(got))


def main() -> int:
    print("== sniff: content beats extension ==")
    test_sniff()
    print("== deterministic readers (per physical form) ==")
    test_readers()
    print("== machine JSON protocol stays clean under noisy parsers ==")
    test_machine_json_stdout_contract()
    print("== supply-chain relationship graph crosses the cache/deployment boundary ==")
    test_durable_relationship_artifact()
    print("== full extract_pool pipeline (statuses + corpus) ==")
    test_pipeline()
    print("== pool filesystem boundary (root alias allowed; descendants pinned) ==")
    test_pool_path_boundary()
    print("== external-data provenance (sidecars, paths, entity-gate skip) ==")
    test_external_provenance()
    print("== external tier-ceiling masquerade guard (§4/§5) ==")
    test_external_tier_ceiling()
    print("== malformed sidecar fails closed (non-object / non-dict tier_corrected) ==")
    test_malformed_sidecar()
    print("== GOLD methodology-only WILTW runtime exclusion ==")
    test_wiltw_gold_runtime_exclusion()
    print("== connector projection integrity (canonical content hash) ==")
    test_connector_projection_integrity()
    print("== ordinary ingest raw-byte hash binding ==")
    test_routed_raw_hash_binding()
    print("== v2 connector projection anchored to canonical current ==")
    test_v2_projection_is_anchored_to_current()
    print("== snapshot bound to the attested projection digest ==")
    test_snapshot_bound_to_attested_digest()
    print("== cloud-sync metadata churn does not reject unchanged bytes ==")
    test_cloud_sync_metadata_churn()
    print("== cache guard survives a Drive metadata touch ==")
    test_cache_guard_survives_metadata_touch()
    print("== transient cloud-filesystem errors are retried ==")
    test_transient_cloud_filesystem_errors()
    print("== entity: addressee exchange is never the registrant ==")
    test_entity_addressee_is_not_the_registrant()
    print(f"\n{_passed} passed, {_failed} failed, {_skipped} skipped")
    return 1 if _failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
