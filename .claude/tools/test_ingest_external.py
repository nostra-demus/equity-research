#!/usr/bin/env python3
"""Tests for ingest_external.py — the EXTERNAL-INBOX router (frameworks/EXTERNAL_DATA.md).

Deterministic, text-fixture-based (no xlrd/openpyxl/poppler needed): builds a throwaway
pool in a tempdir, drops files in the inbox, runs the router in-process, and asserts the
routing, sidecar, ledger-dedup, fan-out-cap, and stability behaviors. Run:
  python3 .claude/tools/test_ingest_external.py     (exit 0 = all pass)
"""
import importlib.util
import json
import os
import shutil
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))


def load_router():
    spec = importlib.util.spec_from_file_location("ingest_external", os.path.join(HERE, "ingest_external.py"))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    # tests must not wait on the Drive-sync stability window
    m.STABLE_AGE_S = 0
    m.STABLE_RECHECK_S = 0
    return m


def build_pool(root):
    """A minimal fake pool: AMZN + BUNGE with harvestable filenames; NEWS-ARCHIVE reserved."""
    for t, fname in [
        ("AMZN", "Amazon com Inc NasdaqGS AMZN Competitors.rtf"),
        ("BUNGE", "Bunge Global Inc NYSE BG Financials.xls"),
    ]:
        os.makedirs(os.path.join(root, t), exist_ok=True)
        open(os.path.join(root, t, fname), "w").write("placeholder")
    os.makedirs(os.path.join(root, "NEWS-ARCHIVE"), exist_ok=True)
    os.makedirs(os.path.join(root, "EXTERNAL-INBOX"), exist_ok=True)


def drop(root, rel, text):
    fp = os.path.join(root, "EXTERNAL-INBOX", rel)
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    open(fp, "w").write(text)
    return fp


def drop_bytes(root, rel, data):
    fp = os.path.join(root, "EXTERNAL-INBOX", rel)
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    open(fp, "wb").write(data)
    return fp


failures = []


def check(name, cond, detail=""):
    if cond:
        print(f"  PASS: {name}")
    else:
        print(f"  FAIL: {name}  {detail}")
        failures.append(name)


def sidecar(root, ticker, provider, fname):
    p = os.path.join(root, ticker, "external", provider, fname + ".source.json")
    return json.load(open(p)) if os.path.exists(p) else None


def main():
    m = load_router()

    # ---- 1. body-mention routing (symbol, case-sensitive) + sidecar + ledger ----
    root = tempfile.mkdtemp()
    build_pool(root)
    drop(root, "cloud_panel_note.txt",
         "Our panel data with a stated margin of error tracks AMZN spend. "
         + "AMZN AMZN AMZN AMZN growth accelerated. Do not forward or share this communication.")
    res = m.run(root)
    check("symbol body-mentions route to AMZN",
          any(b == "cloud_panel_note.txt" and ts == ["AMZN"] for b, ts, *_ in res["routed"]),
          str(res))
    dst = os.path.join(root, "AMZN", "external", "unfiled", "cloud_panel_note.txt")
    check("routed copy exists at external/<provider>/", os.path.exists(dst))
    sc = sidecar(root, "AMZN", "unfiled", "cloud_panel_note.txt")
    check("sidecar written with provenance", bool(sc))
    if sc:
        check("source_type inferred alt_data_panel", sc["source_type"] == "alt_data_panel", sc["source_type"])
        check("tier mapped to 5", sc["tier"] == 5, str(sc["tier"]))
        check("license inferred subscriber-only", sc["license"] == "subscriber-only", sc["license"])
        check("tickers recorded", sc["tickers"] == ["AMZN"])
    check("original archived under _routed/",
          os.path.exists(os.path.join(root, "EXTERNAL-INBOX", "_routed", "cloud_panel_note.txt")))
    check("README bootstrapped", os.path.exists(os.path.join(root, "EXTERNAL-INBOX", "README.md")))
    # dedup: same content re-dropped is skipped by the ledger
    drop(root, "cloud_panel_note.txt",
         "Our panel data with a stated margin of error tracks AMZN spend. "
         + "AMZN AMZN AMZN AMZN growth accelerated. Do not forward or share this communication.")
    res2 = m.run(root)
    check("sha256 ledger dedups a re-drop",
          any("already routed" in why for _, why in res2["skipped"]), str(res2["skipped"]))
    shutil.rmtree(root)

    # ---- 2. lowercase symbol does NOT route (case-sensitive); alias name DOES ----
    root = tempfile.mkdtemp()
    build_pool(root)
    drop(root, "lowercase_note.txt", "amzn amzn amzn amzn amzn nothing else here")
    res = m.run(root)
    check("lowercase 'amzn' body mentions do not route",
          any(b == "lowercase_note.txt" for b, _ in res["unrouted"]), str(res))
    drop(root, "brand_note.txt",
         "Amazon results: Amazon grew, Amazon margins up, Amazon capex, Amazon guidance intact.")
    res = m.run(root)
    check("harvested first-token alias ('amazon') routes",
          any(b == "brand_note.txt" and ts == ["AMZN"] for b, ts, *_ in res["routed"]), str(res))
    shutil.rmtree(root)

    # ---- 3. user .aliases.json teaches product names (AWS -> AMZN) ----
    root = tempfile.mkdtemp()
    build_pool(root)
    drop(root, ".aliases.json", "")  # placeholder; real content below (dotfile is never routed)
    open(os.path.join(root, "EXTERNAL-INBOX", ".aliases.json"), "w").write(
        json.dumps({"AMZN": ["AWS", "Amazon Web Services"]}))
    drop(root, "infra_spend.txt", "AWS revenue reaccelerated. AWS AI, AWS Bedrock, AWS Graviton, AWS margins.")
    res = m.run(root)
    check(".aliases.json product alias routes AWS note to AMZN",
          any(b == "infra_spend.txt" and ts == ["AMZN"] for b, ts, *_ in res["routed"]), str(res))
    shutil.rmtree(root)

    # ---- 3b. a wrong-TYPE .aliases.json (valid JSON, but an array/string, not an object) must degrade,
    #          not crash the whole pass. harvest_aliases runs once per pass BEFORE the file loop, so an
    #          uncaught AttributeError here wedged the entire lane (inbox never routes) until noticed. ----
    root = tempfile.mkdtemp()
    build_pool(root)
    open(os.path.join(root, "EXTERNAL-INBOX", ".aliases.json"), "w").write('["AMZN", "AWS"]')  # array, not object
    drop(root, "brand_note2.txt",
         "Amazon results: Amazon grew, Amazon margins up, Amazon capex, Amazon guidance intact.")
    res = m.run(root)  # used to raise AttributeError: 'list' object has no attribute 'get'
    check("wrong-type .aliases.json degrades (pass completes; harvested alias still routes)",
          any(b == "brand_note2.txt" and ts == ["AMZN"] for b, ts, *_ in res["routed"]), str(res))
    shutil.rmtree(root)

    # ---- 4. multi-ticker copies to every matching pool ----
    root = tempfile.mkdtemp()
    build_pool(root)
    drop(root, "ags_and_cloud.txt",
         "AMZN AMZN AMZN AMZN AMZN versus Bunge: Bunge crush margins, Bunge volumes, Bunge outlook, Bunge debt.")
    res = m.run(root)
    routed_ts = next((ts for b, ts, *_ in res["routed"] if b == "ags_and_cloud.txt"), [])
    check("multi-ticker doc routes to both pools", sorted(routed_ts) == ["AMZN", "BUNGE"], str(res))
    check("copy exists in second pool",
          os.path.exists(os.path.join(root, "BUNGE", "external", "unfiled", "ags_and_cloud.txt")))
    sc = sidecar(root, "AMZN", "unfiled", "ags_and_cloud.txt")
    check("multi-ticker sidecar lists all tickers", sc and sorted(sc["tickers"]) == ["AMZN", "BUNGE"])
    shutil.rmtree(root)

    # ---- 5. provider folder + forced ticker routing (incl. pool-less ticker) ----
    root = tempfile.mkdtemp()
    build_pool(root)
    drop(root, "YipitData/MSFT/azure_note.txt", "Azure growth panel read. No obvious names here.")
    drop(root, "Tegus/expert_call_notes.txt",
         "Expert call (Tegus) on AMZN logistics. AMZN AMZN AMZN AMZN capacity discussion.")
    res = m.run(root)
    check("forced <Provider>/<TICKER>/ routes without detection (creates pool)",
          os.path.exists(os.path.join(root, "MSFT", "external", "yipitdata", "azure_note.txt")), str(res))
    sc = sidecar(root, "MSFT", "yipitdata", "azure_note.txt")
    check("forced route provider from folder", sc and sc["provider"] == "YipitData", str(sc))
    sc = sidecar(root, "AMZN", "tegus", "expert_call_notes.txt")
    check("expert call classified + tier 9", sc and sc["source_type"] == "expert_call" and sc["tier"] == 9, str(sc))
    shutil.rmtree(root)

    # ---- 6. first-level folder that IS a pool ticker = forced ----
    root = tempfile.mkdtemp()
    build_pool(root)
    drop(root, "AMZN/anything.txt", "no names at all in this body")
    res = m.run(root)
    check("first-level ticker folder force-routes",
          os.path.exists(os.path.join(root, "AMZN", "external", "unfiled", "anything.txt")), str(res))
    shutil.rmtree(root)

    # ---- 7. unrouted stays in place; fan-out cap trips ----
    root = tempfile.mkdtemp()
    build_pool(root)
    for t in ["TICK1", "TICK2", "TICK3", "TICK4", "TICK5", "TICK6"]:
        os.makedirs(os.path.join(root, t))
    fp = drop(root, "mystery.txt", "a note about nothing recognizable")
    wide = ("TICK1 TICK2 TICK3 TICK4 TICK5 TICK6 ") * 6
    drop(root, "macro_sweep.txt", wide)
    res = m.run(root)
    check("unmatched file stays + reported", any(b == "mystery.txt" for b, _ in res["unrouted"]), str(res))
    check("unmatched file still in inbox", os.path.exists(fp))
    check("fan-out cap: >5 tickers stays with 'too broad'",
          any(b == "macro_sweep.txt" and "too broad" in why for b, why in res["unrouted"]), str(res))
    shutil.rmtree(root)

    # ---- 8. stability guard: a too-young file is deferred ----
    root = tempfile.mkdtemp()
    build_pool(root)
    m.STABLE_AGE_S = 9999  # everything is "too young" now
    drop(root, "fresh.txt", "AMZN AMZN AMZN AMZN AMZN")
    res = m.run(root)
    check("young file deferred as still-syncing",
          any(b == "fresh.txt" and "syncing" in why for b, why in res["skipped"]), str(res))
    m.STABLE_AGE_S = 0
    shutil.rmtree(root)

    # ---- 8b. commodity subject: forced routing + /commodity:rerun hint ----
    # GOLD is a real `## GOLD` heading in frameworks/commodity/COMMODITY_PROFILES.md (tests run
    # from the repo root, like CI) — the hint must switch to the commodity swarm's rerun.
    root = tempfile.mkdtemp()
    build_pool(root)
    drop(root, "SatCrop/GOLD/mine_supply_read.txt", "quarterly mine supply analytics readout")
    res = m.run(root)
    check("commodity: forced routing lands in the commodity pool",
          os.path.exists(os.path.join(root, "GOLD", "external", "satcrop", "mine_supply_read.txt")), str(res))
    hints = next((h for b, ts, p, s, h in res["routed"] if b == "mine_supply_read.txt"), [])
    check("commodity: hint is /commodity:rerun supply-demand GOLD",
          hints == ["/commodity:rerun supply-demand GOLD"], str(hints))
    drop(root, "Vendor/AMZN/equity_note.txt", "an equity note")
    res = m.run(root)
    hints = next((h for b, ts, p, s, h in res["routed"] if b == "equity_note.txt"), [])
    check("commodity: equity hint unchanged (/research:rerun …)",
          hints and hints[0].startswith("/research:rerun "), str(hints))
    shutil.rmtree(root)

    # ---- 8c. GOLD methodology boundary: WILTW is never routed; ordinary reports remain admissible ----
    root = tempfile.mkdtemp()
    build_pool(root)
    named = drop(root, "WeeklyDesk/GOLD/WILTW_2026-07-30 (1).pdf",
                 "A point-in-time gold view whose filename identifies the methodology source.")
    renamed = drop(root, "WeeklyDesk/GOLD/renamed-metals-note.txt",
                   "What I Learned This Week — point-in-time gold conclusions and assertions.")
    late_title = drop(root, "WeeklyDesk/GOLD/late-title-note.txt",
                      ("ordinary preamble " * 5000) +
                      "\nWhat I Learned This Week — point-in-time assertions must not enter runtime data.")
    renamed_scan = drop_bytes(root, "WeeklyDesk/GOLD/renamed-metals-scan.png",
                              b"\x89PNG\r\n\x1a\nrenamed-scan-fixture")
    unreadable_scan = drop_bytes(root, "WeeklyDesk/GOLD/unreadable-gold-scan.png",
                                 b"\x89PNG\r\n\x1a\nunreadable-scan-fixture")
    lawful_scan = drop_bytes(root, "WeeklyDesk/GOLD/lawful-gold-report-scan.png",
                             b"\x89PNG\r\n\x1a\nlawful-scan-fixture")
    drop(root, "WeeklyDesk/GOLD/lawful-gold-research-report.txt",
         "Lawfully licensed gold-market research with original-provider provenance.")
    ep = m._load_extract_pool()
    original_image_reader = ep._read_image_file

    def fixture_image_reader(path):
        if os.path.basename(path) == "renamed-metals-scan.png":
            return "What I Learned This Week — transcribed from the renamed scan.", "fixture vision", None
        if os.path.basename(path) == "lawful-gold-report-scan.png":
            return "Lawfully licensed gold-market research transcribed from its scan.", "fixture vision", None
        if os.path.basename(path) == "unreadable-gold-scan.png":
            return "", None, "fixture OCR/vision could not read the image"
        return original_image_reader(path)

    ep._read_image_file = fixture_image_reader
    res = m.run(root, extractor=ep)
    rejected = {base: why for base, why in res["skipped"] if "methodology-only source rejected" in why}
    check("WILTW filename, late complete-text title, and OCR/vision identity are rejected before GOLD routing",
          set(rejected) == {"WILTW_2026-07-30 (1).pdf", "renamed-metals-note.txt",
                            "late-title-note.txt", "renamed-metals-scan.png"}, str(res))
    check("rejected methodology files stay in the inbox for explicit operator handling",
          os.path.exists(named) and os.path.exists(renamed) and os.path.exists(late_title)
          and os.path.exists(renamed_scan), str(res))
    check("unreadable GOLD visual fails closed before routing or provenance",
          os.path.exists(unreadable_scan)
          and any(base == "unreadable-gold-scan.png" and "unreadable GOLD-sensitive visual rejected" in why
                  for base, why in res["skipped"]), str(res))
    gold_external = os.path.join(root, "GOLD", "external", "weeklydesk")
    check("WILTW creates no GOLD payload or provenance sidecar",
          not os.path.exists(os.path.join(gold_external, "WILTW_2026-07-30 (1).pdf"))
          and not os.path.exists(os.path.join(gold_external, "WILTW_2026-07-30 (1).pdf.source.json"))
          and not os.path.exists(os.path.join(gold_external, "renamed-metals-note.txt"))
          and not os.path.exists(os.path.join(gold_external, "renamed-metals-note.txt.source.json"))
          and not os.path.exists(os.path.join(gold_external, "late-title-note.txt"))
          and not os.path.exists(os.path.join(gold_external, "late-title-note.txt.source.json"))
          and not os.path.exists(os.path.join(gold_external, "renamed-metals-scan.png"))
          and not os.path.exists(os.path.join(gold_external, "renamed-metals-scan.png.source.json"))
          and not os.path.exists(os.path.join(gold_external, "unreadable-gold-scan.png"))
          and not os.path.exists(os.path.join(gold_external, "unreadable-gold-scan.png.source.json")),
          str(res))
    check("ordinary lawful readable GOLD text and scan remain admissible",
          os.path.exists(os.path.join(gold_external, "lawful-gold-research-report.txt"))
          and sidecar(root, "GOLD", "weeklydesk", "lawful-gold-research-report.txt") is not None
          and os.path.exists(os.path.join(gold_external, "lawful-gold-report-scan.png"))
          and sidecar(root, "GOLD", "weeklydesk", "lawful-gold-report-scan.png") is not None,
          str(res))
    ledger = open(os.path.join(root, "EXTERNAL-INBOX", ".ingest_ledger.ndjson"), encoding="utf-8").read()
    check("WILTW rejection writes no GOLD runtime provenance ledger row",
          "WILTW_2026-07-30" not in ledger and "renamed-metals-note" not in ledger
          and "late-title-note" not in ledger and "renamed-metals-scan" not in ledger
          and "unreadable-gold-scan" not in ledger, ledger)
    shutil.rmtree(root)

    # ---- 8d. review fixes (PR #210 P2s) ----
    # suffix loop: three DISTINCT docs with the same basename all survive
    root = tempfile.mkdtemp()
    build_pool(root)
    for i, body in enumerate(["v1 content", "v2 content", "v3 content"]):
        drop(root, "Vendor/AMZN/report.txt", body)
        m.run(root)
    provdir = os.path.join(root, "AMZN", "external", "vendor")
    names = sorted(n for n in os.listdir(provdir) if not n.endswith(".source.json"))
    check("collision suffixes keep every distinct version",
          names == ["report (2).txt", "report (3).txt", "report.txt"], str(names))
    shutil.rmtree(root)

    # forced re-route: a doc auto-routed earlier can later be FORCED to a missed ticker
    root = tempfile.mkdtemp()
    build_pool(root)
    drop(root, "auto_note.txt", "AMZN AMZN AMZN AMZN AMZN panel readout")
    m.run(root)
    drop(root, "Vendor/BUNGE/auto_note.txt", "AMZN AMZN AMZN AMZN AMZN panel readout")
    res = m.run(root)
    check("forced route bypasses the sha ledger for a missed ticker",
          os.path.exists(os.path.join(root, "BUNGE", "external", "vendor", "auto_note.txt")), str(res))
    shutil.rmtree(root)

    # server-parity ticker shape: digit-led symbols route (sandbox.ts TICKER_RE parity)
    root = tempfile.mkdtemp()
    build_pool(root)
    os.makedirs(os.path.join(root, "360ONE"))
    drop(root, "Vendor/360ONE/wealth_note.txt", "no detectable names")
    res = m.run(root)
    check("digit-led ticker force-routes (server TICKER_RE parity)",
          os.path.exists(os.path.join(root, "360ONE", "external", "vendor", "wealth_note.txt")), str(res))
    shutil.rmtree(root)

    # provider folder sets the source_type when content is silent (round-2 review)
    root = tempfile.mkdtemp()
    build_pool(root)
    drop(root, "YipitData/AMZN/opaque_export.txt", "rows of numbers, no vendor words at all")
    drop(root, "Tegus/AMZN/opaque_call.txt", "notes, nothing signal-bearing")
    res = m.run(root)
    sc = sidecar(root, "AMZN", "yipitdata", "opaque_export.txt")
    check("known alt-data provider folder -> alt_data_panel tier 5",
          sc and sc["source_type"] == "alt_data_panel" and sc["tier"] == 5, str(sc))
    sc = sidecar(root, "AMZN", "tegus", "opaque_call.txt")
    check("known expert-network folder -> expert_call tier 9",
          sc and sc["source_type"] == "expert_call" and sc["tier"] == 9, str(sc))
    shutil.rmtree(root)

    # lowercase filename symbol routes (filename is metadata; body stays case-sensitive)
    root = tempfile.mkdtemp()
    build_pool(root)
    drop(root, "amzn_panel_readout.txt", "no readable signals in the body")
    res = m.run(root)
    check("lowercase filename symbol routes",
          any(b == "amzn_panel_readout.txt" and ts == ["AMZN"] for b, ts, *_ in res["routed"]), str(res))
    shutil.rmtree(root)

    # period-shaped provider subfolders are never forced tickers
    root = tempfile.mkdtemp()
    build_pool(root)
    drop(root, "Vendor/2026/undetectable.txt", "no names")
    drop(root, "Vendor/Q1-2026/undetectable2.txt", "no names")
    res = m.run(root)
    check("date folders are not force-routed as tickers",
          not os.path.isdir(os.path.join(root, "2026")) and not os.path.isdir(os.path.join(root, "Q1-2026")),
          str(res))
    check("date-folder files fall back to detection (unrouted here)",
          len(res["unrouted"]) == 2, str(res))
    shutil.rmtree(root)

    # day-first data-through dates are detected + validated
    check("day-first 'data through 31/03/2026' parses as 2026-03-31",
          m._parse_dates("x.txt", "data through 31/03/2026")[0] == "2026-03-31",
          str(m._parse_dates("x.txt", "data through 31/03/2026")))
    check("month-first 'data thru 3/31/2026' parses as 2026-03-31",
          m._parse_dates("x.txt", "data thru 3/31/2026")[0] == "2026-03-31")
    check("impossible date is dropped, not written",
          m._parse_dates("x.txt", "data through 45/77/2026")[0] is None)

    # Symlinked inbox inputs and subject pools are never followed, including
    # aliases whose target remains inside the nominal data root.
    root = tempfile.mkdtemp(); build_pool(root)
    outside = os.path.join(root, "outside-note.txt")
    open(outside, "w").write("AMZN AMZN AMZN AMZN AMZN")
    linked_input = os.path.join(root, "EXTERNAL-INBOX", "linked-note.txt")
    os.symlink(outside, linked_input)
    res = m.run(root)
    check("symlinked inbox file is ignored without routing target bytes",
          os.path.islink(linked_input)
          and not os.path.exists(os.path.join(root, "AMZN", "external", "unknown", "linked-note.txt")),
          str(res))
    shutil.rmtree(root)

    root = tempfile.mkdtemp(); build_pool(root)
    real_subject = os.path.join(root, "real-amzn"); os.makedirs(real_subject)
    shutil.rmtree(os.path.join(root, "AMZN")); os.symlink(real_subject, os.path.join(root, "AMZN"))
    drop(root, "Vendor/AMZN/symlink-target.txt", "forced route")
    try:
        m.run(root)
        subject_symlink_rejected = False
    except RuntimeError as exc:
        subject_symlink_rejected = "subject pool" in str(exc)
    check("symlinked subject pool fails closed before any external write",
          subject_symlink_rejected and not os.path.exists(os.path.join(real_subject, "external")))
    shutil.rmtree(root)

    # ---- 9. dry-run writes nothing ----
    root = tempfile.mkdtemp()
    build_pool(root)
    drop(root, "dry.txt", "AMZN AMZN AMZN AMZN AMZN")
    res = m.run(root, dry_run=True)
    check("dry-run reports the route", any(b == "dry.txt" for b, ts, *_ in res["routed"]), str(res))
    check("dry-run copies nothing", not os.path.exists(os.path.join(root, "AMZN", "external")))
    check("dry-run leaves the original", os.path.exists(os.path.join(root, "EXTERNAL-INBOX", "dry.txt")))
    shutil.rmtree(root)

    print()
    if failures:
        print(f"FAILED: {len(failures)} check(s): {failures}")
        return 1
    print("ALL PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
