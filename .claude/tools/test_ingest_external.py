#!/usr/bin/env python3
"""Tests for ingest_external.py — the EXTERNAL-INBOX router (frameworks/EXTERNAL_DATA.md).

Deterministic, text-fixture-based (no xlrd/openpyxl/poppler needed): builds a throwaway
pool in a tempdir, drops files in the inbox, runs the router in-process, and asserts the
routing, sidecar, ledger-dedup, fan-out-cap, and stability behaviors. Run:
  python3 .claude/tools/test_ingest_external.py     (exit 0 = all pass)
"""
import hashlib
import importlib.util
import json
import os
import shutil
import sys
import tempfile
import time

HERE = os.path.dirname(os.path.abspath(__file__))


def load_router():
    spec = importlib.util.spec_from_file_location("ingest_external", os.path.join(HERE, "ingest_external.py"))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    # tests must not wait on the Drive-sync stability window
    m.STABLE_AGE_S = 0
    m.STABLE_RECHECK_S = 0
    # The router's production default shells into the canonical TypeScript owner/data-needs readers.
    # These isolated pool fixtures test publication mechanics, so give them an explicit sole-owner seam.
    m._default_manual_authority = lambda _intent: (True, None)
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


def stage_manual(m, root, key_path, request_id, payload=b"opaque observation", overrides=None,
                 extra_files=None):
    """Write the exact server/router request envelope used by focused router tests."""
    key = bytes.fromhex("42" * 32)
    with open(key_path, "wb") as fh:
        fh.write(("42" * 32 + "\n").encode("ascii"))
    os.chmod(key_path, 0o600)
    envelope = os.path.join(root, "EXTERNAL-INBOX", m.MANUAL_REQUEST_DIR, request_id)
    os.makedirs(envelope, mode=0o700)
    payload_path = os.path.join(envelope, m.MANUAL_PAYLOAD_NAME)
    with open(payload_path, "wb") as fh:
        fh.write(payload)
    base = {
        "contract_version": m.MANUAL_INTENT_CONTRACT,
        "request_id": request_id,
        "subject": "AMZN",
        "swarm": "research",
        "run_root": "analyses/AMZN_2026-08-13",
        "decision_fingerprint": "sha256:" + "a" * 64,
        "need_id": "aws-growth",
        "series": "AWS growth rate",
        "provider": "YipitData / operator label",
        "source_url": "https://example.test/report",
        "source_url_basis": "user_supplied_unverified",
        "filename": "Yipit FY30 panel.txt",
        "payload_sha256": hashlib.sha256(payload).hexdigest(),
        "payload_size": len(payload),
        "staged_at": "2026-08-13T10:11:12.000Z",
        "requested_by": "operator@example.test",
    }
    base.update(overrides or {})
    intent = m._signed_value(base, key)
    with open(os.path.join(envelope, m.MANUAL_INTENT_NAME), "w", encoding="utf-8") as fh:
        json.dump(intent, fh, indent=2); fh.write("\n")
    for name, contents in (extra_files or {}).items():
        with open(os.path.join(envelope, name), "wb") as fh:
            fh.write(contents)
    return envelope, intent, key


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

    # ---- 8b-peer: competitor earnings-call transcript -> peer_transcript (tier 6) + whole-module hint ----
    # A CIQ "Competitor Transcripts" drop must classify as peer_transcript (tier 6 about the peer), broker
    # precedence must hold (a sell-side earnings-call NOTE with a verdict block stays broker_research), and a
    # new peer call must hint a FULL rerun — a single-orb rerun leaves the sibling orbs stale and the module
    # command alone never re-synthesises the master thesis/decision the new peer set should update.
    check("infer_source_type: verbatim earnings-call transcript -> peer_transcript",
          m.infer_source_type("Whirlpool_Q2-2026_EarningsCall.txt",
                              "Whirlpool Corporation, Q2 2026 Earnings Call. Prepared remarks. "
                              "Question-and-Answer session with analysts.") == "peer_transcript",
          m.infer_source_type("Whirlpool_Q2-2026_EarningsCall.txt", "earnings call prepared remarks q&a"))
    check("infer_source_type: prepared-remarks + Q&A structure -> peer_transcript",
          m.infer_source_type("call.txt", "Prepared Remarks by the CEO. Q & A.") == "peer_transcript",
          m.infer_source_type("call.txt", "prepared remarks q & a"))
    # a results release that merely SCHEDULES a call (no prepared-remarks/Q&A body, no "call transcript"
    # marker) is not a transcript — it must not be tiered at 6 or fire the whole-module rerun hint.
    check("infer_source_type: a scheduling mention in a results release is NOT a peer_transcript",
          m.infer_source_type("WHR_Q2-2026_Results.pdf",
                              "Whirlpool Corporation announces Q2 2026 results. The company will host an "
                              "earnings conference call on August 5, 2026 at 8:00 a.m. ET; to access the "
                              "call, dial 1-800-000-0000.") != "peer_transcript",
          m.infer_source_type("WHR_Q2-2026_Results.pdf", "will host an earnings conference call"))
    # ---- 8c-peer: a peer RESULTS RELEASE is the module's numbers anchor, not external_other ----
    # competitive-intel MODULE_RULES ranks the release FIRST in its own source hierarchy — "in ANY conflict
    # with the call, the filed/released figure wins" — so a release landing after a transcript retro-
    # invalidates figures already extracted. Falling through to external_other put a tier-9 label and an
    # earnings/guidance-consensus hint on the one document the module treats as authoritative.
    check("infer_source_type: a peer results release -> peer_results",
          m.infer_source_type("WHR_Q2-2026_Results.pdf",
                              "Whirlpool Corporation announces Q2 2026 results. The company will host an "
                              "earnings conference call on August 5, 2026 at 8:00 a.m. ET.") == "peer_results",
          m.infer_source_type("WHR_Q2-2026_Results.pdf", "announces Q2 2026 results"))
    check("infer_source_type: 'results for the year ended' -> peer_results",
          m.infer_source_type("MIDEA_FY25.pdf",
                              "Midea Group reports results for the year ended December 31, 2025.") == "peer_results",
          "results for the year ended")
    # precedence in BOTH directions: a real call body stays a transcript, a verdict block stays broker
    check("infer_source_type: a transcript is never demoted to peer_results",
          m.infer_source_type("WHR_call.txt",
                              "Whirlpool announces Q2 2026 results. Earnings Call Transcript. Prepared "
                              "remarks. Question-and-Answer session.") == "peer_transcript",
          "transcript precedence over release")
    check("infer_source_type: a broker note about a peer's results stays broker_research",
          m.infer_source_type("WHR_note.pdf",
                              "Equity Research. Rating: Overweight. Target Price $130. Whirlpool reports "
                              "Q2 2026 results below our estimate.") == "broker_research",
          "broker precedence over release")
    # the tier is the whole point: the release outranks the call it supersedes
    check("TIER: peer_results is §4 tier 2 and outranks peer_transcript",
          m.TIER["peer_results"] == 2 and m.TIER["peer_results"] < m.TIER["peer_transcript"],
          f'peer_results={m.TIER.get("peer_results")} peer_transcript={m.TIER.get("peer_transcript")}')
    check("rerun hint: a new peer_results hints a FULL rerun, like a new peer call",
          m._rerun_hint("peer_results", "MIDEA") == "/research:full MIDEA",
          m._rerun_hint("peer_results", "MIDEA"))
    check("rerun hint: peer_results no longer falls through to earnings/guidance-consensus",
          m.RERUN_HINT["peer_results"][0] == "competitive-intel",
          str(m.RERUN_HINT.get("peer_results")))

    check("infer_source_type: sell-side earnings-call NOTE stays broker_research (precedence)",
          m.infer_source_type("WHR_EarningsCallInsight.pdf",
                              "Equity Research. Rating: Overweight. Target Price $130. "
                              "Our summary of the Whirlpool earnings call.") == "broker_research",
          "broker precedence over transcript")
    check("TIER: peer_transcript maps to §4 tier 6", m.TIER["peer_transcript"] == 6, str(m.TIER.get("peer_transcript")))
    check("rerun hint: a new peer_transcript hints a FULL rerun (module orbs + master cascade)",
          m._rerun_hint("peer_transcript", "MIDEA") == "/research:full MIDEA",
          m._rerun_hint("peer_transcript", "MIDEA"))
    check("rerun hint: an ordinary single-orb type stays /research:rerun",
          m._rerun_hint("expert_call", "MIDEA").startswith("/research:rerun "),
          m._rerun_hint("expert_call", "MIDEA"))

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
    archive_dir = os.path.join(root, "EXTERNAL-INBOX", "_routed", "Vendor", "AMZN")
    archived_names = sorted(os.listdir(archive_dir))
    check("archive collision suffixes also keep every distinct version",
          archived_names == ["report (2).txt", "report (3).txt", "report.txt"],
          str(archived_names))
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
    original = drop(root, "hardlinked-note.txt", "AMZN AMZN AMZN AMZN AMZN")
    alias = os.path.join(root, "hardlinked-alias.txt")
    os.link(original, alias)
    res = m.run(root)
    check("hardlinked inbox input is rejected before hashing or routing",
          any(base == "hardlinked-note.txt" and "hardlink" in why for base, why in res["skipped"])
          and not os.path.exists(os.path.join(root, "AMZN", "external", "unfiled", "hardlinked-note.txt")),
          str(res))
    shutil.rmtree(root)

    root = os.path.realpath(tempfile.mkdtemp()); build_pool(root)
    src = drop(root, "copy-source.txt", "AMZN original evidence")
    expected = hashlib.sha256(b"AMZN original evidence").hexdigest()
    open(src, "w").write("AMZN modified evidence")
    dst = os.path.join(root, "AMZN", "external", "unfiled", "copy-source.txt")
    try:
        m.copy_contents(src, dst, root, expected_sha256=expected)
        changed_copy_rejected = False
    except ValueError as exc:
        changed_copy_rejected = "provenance hashing" in str(exc)
    check("copy bytes must match the provenance hash before atomic publication",
          changed_copy_rejected and not os.path.exists(dst))
    shutil.rmtree(root)

    root = os.path.realpath(tempfile.mkdtemp()); build_pool(root)
    src = drop(root, "claim-source.txt", "new evidence")
    dst = os.path.join(root, "AMZN", "external", "unfiled", "claim-source.txt")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    open(dst, "w").write("incumbent evidence")
    expected = hashlib.sha256(b"new evidence").hexdigest()
    try:
        m.copy_contents(src, dst, root, expected_sha256=expected)
        no_clobber_rejected = False
    except FileExistsError:
        no_clobber_rejected = True
    check("atomic copy claim never overwrites a concurrent incumbent",
          no_clobber_rejected and open(dst).read() == "incumbent evidence")
    shutil.rmtree(root)

    root = os.path.realpath(tempfile.mkdtemp()); build_pool(root)
    src = drop(root, "fuse-source.txt", "FUSE-compatible evidence")
    dst = os.path.join(root, "AMZN", "external", "unfiled", "fuse-source.txt")
    expected = hashlib.sha256(b"FUSE-compatible evidence").hexdigest()
    real_link = m.os.link

    def hardlinks_unsupported(*_args, **_kwargs):
        raise OSError(m.errno.EOPNOTSUPP, "simulated Drive FUSE")

    m.os.link = hardlinks_unsupported
    try:
        m.copy_contents(src, dst, root, expected_sha256=expected)
        fuse_fallback_published = True
    except Exception:
        fuse_fallback_published = False
    finally:
        m.os.link = real_link
    check("FUSE without hardlinks uses an O_EXCL no-clobber publication",
          fuse_fallback_published and open(dst).read() == "FUSE-compatible evidence"
          and not any(name.startswith(".tmp-route-") for name in os.listdir(os.path.dirname(dst))))
    shutil.rmtree(root)

    root = os.path.realpath(tempfile.mkdtemp()); build_pool(root)
    src = drop(root, "Vendor/AMZN/recover-sidecar.txt", "recoverable evidence")
    real_write_json = m._write_json_safe
    injected = {"done": False}

    def fail_first_sidecar(path, value, safe_root):
        if path.endswith("recover-sidecar.txt.source.json") and not injected["done"]:
            injected["done"] = True
            raise OSError("simulated death after payload publication")
        return real_write_json(path, value, safe_root)

    m._write_json_safe = fail_first_sidecar
    try:
        m.run(root)
        first_sidecar_failed = False
    except OSError as exc:
        first_sidecar_failed = "simulated death" in str(exc)
    finally:
        m._write_json_safe = real_write_json
    payload = os.path.join(root, "AMZN", "external", "vendor", "recover-sidecar.txt")
    check("a sidecar failure leaves no citable payload and keeps the source retryable",
          first_sidecar_failed and not os.path.exists(payload)
          and not os.path.exists(payload + ".source.json") and os.path.exists(src)
          and not os.path.exists(os.path.join(root, "EXTERNAL-INBOX", ".ingest_ledger.ndjson")))
    res = m.run(root)
    check("retry repairs the missing hash-bound sidecar without a duplicate payload",
          os.path.exists(payload + ".source.json")
          and not os.path.exists(os.path.join(root, "AMZN", "external", "vendor", "recover-sidecar (2).txt"))
          and any(base == "recover-sidecar.txt" for base, *_ in res["routed"]),
          str(res))
    shutil.rmtree(root)

    root = os.path.realpath(tempfile.mkdtemp()); build_pool(root)
    drop(root, "Vendor/AMZN/crash-prefix.txt", "complete routed evidence")
    real_publish = m._publish_temp_no_clobber
    crashed = {"done": False}

    def hard_death_during_payload(_tmp, destination):
        if destination.endswith("crash-prefix.txt") and not crashed["done"]:
            crashed["done"] = True
            with open(destination, "xb") as handle:
                handle.write(b"strict prefix")
                handle.flush()
                os.fsync(handle.fileno())
            raise SystemExit("simulated SIGKILL during FUSE payload write")
        return real_publish(_tmp, destination)

    m._publish_temp_no_clobber = hard_death_during_payload
    try:
        try:
            m.run(root)
        except SystemExit:
            pass
    finally:
        m._publish_temp_no_clobber = real_publish
    crashed_payload = os.path.join(root, "AMZN", "external", "vendor", "crash-prefix.txt")
    ep = m._load_extract_pool()
    with tempfile.TemporaryDirectory() as extracted:
        manifest = ep.extract_pool(
            os.path.join(root, "AMZN"), extracted, force=True, vision=False,
        )
    crashed_row = next(source for source in manifest["sources"]
                       if source["file"] == "crash-prefix.txt")
    check("sidecar-first publication makes a hard-death payload prefix non-citable",
          os.path.exists(crashed_payload + ".source.json")
          and crashed_row.get("status") == "fail"
          and "ordinary ingest sha256" in crashed_row.get("error", "")
          and crashed_row.get("provenance") == {"integrity_status": "failed", "usable": False},
          str(crashed_row))
    m.run(root)
    with tempfile.TemporaryDirectory() as extracted:
        retried_manifest = ep.extract_pool(
            os.path.join(root, "AMZN"), extracted, force=True, vision=False,
        )
    retry_rows = {source["file"]: source for source in retried_manifest["sources"]}
    check("retry preserves the failed prefix and publishes a separate complete pair",
          retry_rows["crash-prefix.txt"].get("status") == "fail"
          and retry_rows["crash-prefix (2).txt"].get("status") == "in-place",
          str(retry_rows))
    shutil.rmtree(root)

    root = os.path.realpath(tempfile.mkdtemp()); build_pool(root)
    src = drop(root, "swap-before-archive.txt", "original archive bytes")
    expected = hashlib.sha256(b"original archive bytes").hexdigest()
    real_copy = m.copy_contents

    def swap_after_archive_copy(source, destination, safe_root=None, expected_sha256=None):
        result = real_copy(source, destination, safe_root, expected_sha256)
        replacement = source + ".replacement"
        open(replacement, "w").write("replacement must survive")
        os.replace(replacement, source)
        return result

    m.copy_contents = swap_after_archive_copy
    try:
        m.move_to_routed(src, os.path.join(root, "EXTERNAL-INBOX"), expected)
        swapped_source_rejected = False
    except ValueError as exc:
        swapped_source_rejected = "quarantined" in str(exc)
    finally:
        m.copy_contents = real_copy
    archived = os.path.join(root, "EXTERNAL-INBOX", "_routed", "swap-before-archive.txt")
    quarantined = []
    for directory, _dirs, files in os.walk(os.path.join(root, "EXTERNAL-INBOX")):
        if os.path.basename(directory).startswith(".route-consume-"):
            quarantined.extend(os.path.join(directory, name) for name in files)
    check("a source swap cannot enter the archive or delete the replacement pathname",
          swapped_source_rejected and open(archived).read() == "original archive bytes"
          and len(quarantined) == 1 and open(quarantined[0]).read() == "replacement must survive",
          str(quarantined))
    shutil.rmtree(root)

    root = os.path.realpath(tempfile.mkdtemp()); build_pool(root)
    src = drop(root, "late-swap.txt", "verified source bytes")
    expected, identity = m._sha256_file_with_identity(src)
    real_pinned_hash = m._sha256_open_fd
    swapped = {"done": False}

    def swap_after_pinned_hash(path, fd, pinned_identity):
        result = real_pinned_hash(path, fd, pinned_identity)
        if ".route-consume-" in path and not swapped["done"]:
            swapped["done"] = True
            replacement = path + ".replacement"
            open(replacement, "w").write("late replacement survives")
            os.replace(replacement, path)
        return result

    m._sha256_open_fd = swap_after_pinned_hash
    try:
        m._consume_source(src, identity, expected)
        late_swap_rejected = False
    except ValueError as exc:
        late_swap_rejected = "quarantined" in str(exc)
    finally:
        m._sha256_open_fd = real_pinned_hash
    quarantined = []
    for directory, _dirs, files in os.walk(os.path.join(root, "EXTERNAL-INBOX")):
        if os.path.basename(directory).startswith(".route-consume-"):
            quarantined.extend(os.path.join(directory, name) for name in files)
    check("a swap after hashing is detected before the held pathname is unlinked",
          late_swap_rejected and len(quarantined) == 1
          and open(quarantined[0]).read() == "late replacement survives",
          str(quarantined))
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

    # ---- 10. sha256_file rejects a hardlinked source (TOCTOU) ----
    # A file with st_nlink > 1 can be rewritten through its OTHER path between hashing and copying,
    # so the recorded digest would not describe the bytes that land in the pool. The sibling reader
    # extract_pool._read_regular_nofollow_bytes already enforces st_nlink != 1; this closes the same
    # hole in the digest path (Gemini review on PR #407), matching the PR's stated integrity boundary
    # that hard-link attacks fail closed.
    root = tempfile.mkdtemp()
    real_doc = os.path.join(root, "unique.json")
    with open(real_doc, "wb") as fh:
        fh.write(b'{"panel":"gold","value":1}')
    hardlink_rejected = False
    try:
        m.sha256_file(real_doc)
    except ValueError:
        hardlink_rejected = True
    check("a unique (nlink==1) regular file still hashes", not hardlink_rejected)

    alias = os.path.join(root, "alias.json")
    os.link(real_doc, alias)  # nlink == 2 — mutable through a second path
    hardlink_rejected = False
    try:
        m.sha256_file(real_doc)
    except ValueError as exc:
        hardlink_rejected = "unique regular non-symlink file" in str(exc)
    check("hardlinked source is rejected before hashing", hardlink_rejected)
    shutil.rmtree(root)

    # ---- 11. basename-only relative paths retain same-directory atomicity ----
    # dirname("file") is empty. Publication, hard-death alias recovery, and source
    # consumption must treat that spelling as the current directory rather than
    # falling back to the system temp directory or failing os.scandir/os.makedirs.
    root = tempfile.mkdtemp()
    previous_cwd = os.getcwd()
    try:
        os.chdir(root)
        with open("relative-source.txt", "wb") as fh:
            fh.write(b"relative-path payload")
        expected = hashlib.sha256(b"relative-path payload").hexdigest()
        actual, identity = m.copy_contents(
            "relative-source.txt", "relative-destination.txt", expected_sha256=expected
        )
        check("basename-only destination is published in the current directory",
              actual == expected and open("relative-destination.txt", "rb").read() == b"relative-path payload")

        os.link("relative-destination.txt", ".tmp-route-recovery")
        m._recover_publication_alias("relative-destination.txt", ".tmp-route-")
        check("basename-only publication alias recovery scans the current directory",
              not os.path.exists(".tmp-route-recovery")
              and os.lstat("relative-destination.txt").st_nlink == 1)

        m._consume_source("relative-source.txt", identity, expected)
        check("basename-only source consumption uses a same-directory hold",
              not os.path.exists("relative-source.txt")
              and not any(name.startswith(".route-consume-") for name in os.listdir(".")))
    finally:
        os.chdir(previous_cwd)
        shutil.rmtree(root)

    # ---- 12. signed decision-scoped requests: forced context, conservative inference, archive/replay ----
    root = tempfile.mkdtemp(); build_pool(root)
    key_state = os.path.join(root, "state"); os.mkdir(key_state, 0o700)
    key_path = os.path.join(key_state, "intent.key")
    request_id = "DNU-" + "8" * 32
    _envelope, intent, _key = stage_manual(m, root, key_path, request_id)
    result = m.run(root, manual_request=request_id, intent_key_path=key_path)
    check("manual request routes only through the signed router lane",
          result["manual"] and result["manual"][0][0] == "routed", str(result))
    provider_slug = m.slug(intent["provider"])
    routed = os.path.join(root, "AMZN", "external", provider_slug, intent["filename"])
    sc_path = routed + ".source.json"
    sc = json.load(open(sc_path)) if os.path.exists(sc_path) else {}
    check("manual request forces subject/provider and copies exact request context",
          os.path.exists(routed) and sc.get("provider") == intent["provider"]
          and sc.get("tickers") == ["AMZN"]
          and sc.get("request_context", {}).get("decision_fingerprint") == intent["decision_fingerprint"]
          and sc.get("request_context", {}).get("provider_basis") == "operator_supplied_unverified"
          and sc.get("request_context", {}).get("source_url") == intent["source_url"]
          and sc.get("request_context", {}).get("source_url_basis") == "user_supplied_unverified")
    check("filename/provider metadata cannot upgrade inferred type/tier/date/license",
          sc.get("source_type") == "external_other" and sc.get("tier") == 9
          and sc.get("as_of") is None and sc.get("license") == "unspecified", str(sc))
    archived = os.path.join(root, "EXTERNAL-INBOX", m.ROUTED_DIR, m.MANUAL_REQUEST_DIR, request_id)
    result_value = json.load(open(os.path.join(archived, m.MANUAL_RESULT_NAME)))
    check("manual archive has a signed hash-bound verified result",
          m._valid_manual_result(result_value, bytes.fromhex("42" * 32), intent,
                                 sc.get("upload_intent_sha256"))
          and result_value.get("status") == "routed_provenance_verified"
          and result_value.get("sidecar_sha256") == m.sha256_file(sc_path))

    # A same-name sidecar may echo all identity fields yet lie about evidence quality. It must never be
    # accepted by subset matching: exact router-generated bytes are required, so this poison wins no
    # authority and the router publishes a clean suffixed pair instead.
    poison_id = "DNU-" + "d" * 32
    poison_payload = b"second opaque observation"
    poison_envelope, poison_intent, _key = stage_manual(
        m, root, key_path, poison_id, payload=poison_payload,
    )
    poison_first = os.path.join(root, "AMZN", "external", provider_slug, poison_intent["filename"])
    os.unlink(poison_first)  # retain the original clean sidecar at the base name, then replace it below
    clean = json.load(open(poison_first + ".source.json"))
    poison = {
        **clean,
        "sha256": hashlib.sha256(poison_payload).hexdigest(),
        "provider": poison_intent["provider"],
        "tickers": ["AMZN"],
        "source_type": "alt_data_panel", "tier": 5, "license": "public_domain",
        "as_of": "2099-12-31",
        "upload_intent_sha256": hashlib.sha256(open(
            os.path.join(poison_envelope, m.MANUAL_INTENT_NAME), "rb").read()).hexdigest(),
        "request_context": m._manual_context(poison_intent),
    }
    with open(poison_first + ".source.json", "w") as fh:
        json.dump(poison, fh, indent=2)
    poison_result = m.run(root, manual_request=poison_id, intent_key_path=key_path)
    poison_status = json.load(open(os.path.join(
        root, "EXTERNAL-INBOX", m.ROUTED_DIR, m.MANUAL_REQUEST_DIR, poison_id, m.MANUAL_RESULT_NAME)))
    clean_routed = os.path.join(root, poison_status["routed_path"][len("data/"):])
    clean_sc = json.load(open(clean_routed + ".source.json"))
    check("pre-existing quality-poisoned sidecar is never accepted or reused",
          poison_result["manual"][0][0] == "routed" and clean_routed != poison_first
          and clean_sc.get("source_type") == "external_other" and clean_sc.get("tier") == 9
          and clean_sc.get("as_of") is None and clean_sc.get("license") == "unspecified"
          and poison_status.get("sidecar_sha256") == m.sha256_file(clean_routed + ".source.json"),
          str({"result": poison_result, "sidecar": clean_sc}))

    # Exact replay is consumed from the active lane without a second publication.
    replay = os.path.join(root, "EXTERNAL-INBOX", m.MANUAL_REQUEST_DIR, request_id)
    os.makedirs(replay, mode=0o700)
    shutil.copyfile(os.path.join(archived, m.MANUAL_PAYLOAD_NAME), os.path.join(replay, m.MANUAL_PAYLOAD_NAME))
    shutil.copyfile(os.path.join(archived, m.MANUAL_INTENT_NAME), os.path.join(replay, m.MANUAL_INTENT_NAME))
    replay_result = m.run(root, manual_request=request_id, intent_key_path=key_path)
    check("signed replay is idempotent and cannot create a second routed payload",
          replay_result["manual"][0][0] == "skipped" and not os.path.exists(replay)
          and len([name for name in os.listdir(os.path.dirname(routed))
                   if name.startswith("Yipit FY30 panel") and not name.endswith(".source.json")]) == 1,
          str(replay_result))
    shutil.rmtree(root)

    # The server staged this while research was sole owner; before the async router got here, a finished
    # commodity run claimed the same AMZN label. The terminal CAS must publish zero bytes and must NOT turn
    # a transient owner ambiguity into a signed terminal failure — the exact envelope stays retryable.
    root = tempfile.mkdtemp(); build_pool(root)
    key_state = os.path.join(root, "state"); os.mkdir(key_state, 0o700)
    key_path = os.path.join(key_state, "intent.key")
    ambiguous_id = "DNU-" + "4" * 32
    ambiguous_envelope, _ambiguous_intent, _ambiguous_key = stage_manual(
        m, root, key_path, ambiguous_id,
    )
    ambiguous = m.run(
        root, manual_request=ambiguous_id, intent_key_path=key_path,
        manual_authority=lambda _intent: (
            False, "shared data-pool owner is absent or ambiguous",
        ),
    )
    check("stage then second finished owner: terminal router CAS publishes zero bytes and stays staged",
          ambiguous["manual"][0][0] == "waiting"
          and sorted(os.listdir(ambiguous_envelope)) == [m.MANUAL_INTENT_NAME, m.MANUAL_PAYLOAD_NAME]
          and not os.path.exists(os.path.join(ambiguous_envelope, m.MANUAL_RESULT_NAME))
          and not os.path.exists(os.path.join(root, "AMZN", "external"))
          and not os.path.exists(os.path.join(root, "EXTERNAL-INBOX", m.LEDGER_NAME)),
          str(ambiguous))
    shutil.rmtree(root)

    # A forged signature is ignored; changed payload and multiple files get a signed failure and publish none.
    root = tempfile.mkdtemp(); build_pool(root)
    key_state = os.path.join(root, "state"); os.mkdir(key_state, 0o700)
    key_path = os.path.join(key_state, "intent.key")
    forged_id = "DNU-" + "9" * 32
    forged, _intent, _key = stage_manual(m, root, key_path, forged_id)
    intent_path = os.path.join(forged, m.MANUAL_INTENT_NAME)
    forged_value = json.load(open(intent_path)); forged_value["signature"] = "hmac-sha256:" + "0" * 64
    with open(intent_path, "w") as fh:
        json.dump(forged_value, fh)
    forged_result = m.run(root, manual_request=forged_id, intent_key_path=key_path)
    check("forged manual intent is ignored and cannot publish",
          forged_result["manual"][0][0] == "ignored"
          and not os.path.exists(os.path.join(root, "AMZN", "external")), str(forged_result))
    shutil.rmtree(root)

    root = tempfile.mkdtemp(); build_pool(root)
    key_state = os.path.join(root, "state"); os.mkdir(key_state, 0o700)
    key_path = os.path.join(key_state, "intent.key")
    changed_id = "DNU-" + "a" * 32
    changed, _intent, key = stage_manual(m, root, key_path, changed_id,
                                          extra_files={"second.txt": b"forged second file"})
    changed_result = m.run(root, manual_request=changed_id, intent_key_path=key_path)
    failure = json.load(open(os.path.join(changed, m.MANUAL_RESULT_NAME)))
    check("multiple-file request fails closed with a signed tamper result",
          changed_result["manual"][0][0] == "failed"
          and failure.get("reason") == "tampered_request" and m._signature_valid(failure, key)
          and not os.path.exists(os.path.join(root, "AMZN", "external")), str(changed_result))
    shutil.rmtree(root)

    root = tempfile.mkdtemp(); build_pool(root)
    key_state = os.path.join(root, "state"); os.mkdir(key_state, 0o700)
    key_path = os.path.join(key_state, "intent.key")
    linked_id = "DNU-" + "b" * 32
    linked, _intent, key = stage_manual(m, root, key_path, linked_id)
    os.link(os.path.join(linked, m.MANUAL_PAYLOAD_NAME), os.path.join(linked, "payload-alias"))
    os.unlink(os.path.join(linked, "payload-alias"))  # retain nlink==1 for the first control read
    # Recreate an outside alias after the envelope shape is exact: the router must still reject nlink>1.
    outside_alias = os.path.join(root, "payload-alias")
    os.link(os.path.join(linked, m.MANUAL_PAYLOAD_NAME), outside_alias)
    linked_result = m.run(root, manual_request=linked_id, intent_key_path=key_path)
    linked_failure = json.load(open(os.path.join(linked, m.MANUAL_RESULT_NAME)))
    check("manual router rejects a hardlinked payload before publication",
          linked_result["manual"][0][0] == "failed"
          and linked_failure.get("reason") == "tampered_request"
          and m._signature_valid(linked_failure, key)
          and not os.path.exists(os.path.join(root, "AMZN", "external")), str(linked_result))
    shutil.rmtree(root)

    root = tempfile.mkdtemp(); build_pool(root)
    key_state = os.path.join(root, "state"); os.mkdir(key_state, 0o700)
    key_path = os.path.join(key_state, "intent.key")
    outside = tempfile.mkdtemp()
    symlink_id = "DNU-" + "c" * 32
    stage_manual(m, outside, os.path.join(outside, "intent.key"), symlink_id)
    os.makedirs(os.path.join(root, "EXTERNAL-INBOX", m.MANUAL_REQUEST_DIR), exist_ok=True)
    os.symlink(os.path.join(outside, "EXTERNAL-INBOX", m.MANUAL_REQUEST_DIR, symlink_id),
               os.path.join(root, "EXTERNAL-INBOX", m.MANUAL_REQUEST_DIR, symlink_id))
    with open(key_path, "w") as fh:
        fh.write("42" * 32 + "\n")
    symlink_result = m.run(root, manual_request=symlink_id, intent_key_path=key_path)
    check("manual router ignores a symlinked request envelope",
          symlink_result["manual"][0][0] == "ignored"
          and not os.path.exists(os.path.join(root, "AMZN", "external")), str(symlink_result))
    shutil.rmtree(root); shutil.rmtree(outside)

    # ---- 13. manual retry/policy/identity security regressions ----
    root = tempfile.mkdtemp(); build_pool(root)
    key_state = os.path.join(root, "state"); os.mkdir(key_state, 0o700)
    key_path = os.path.join(key_state, "intent.key")
    retry_id = "DNU-" + "e" * 32
    retry_envelope, _retry_intent, _retry_key = stage_manual(m, root, key_path, retry_id)
    original_copy = m.copy_contents
    failed_once = {"done": False}

    def one_shot_eio(src, dst, safe_root=None, expected_sha256=None):
        if not failed_once["done"]:
            failed_once["done"] = True
            raise OSError(5, "fixture EIO")
        return original_copy(src, dst, safe_root, expected_sha256)

    m.copy_contents = one_shot_eio
    first = m.run(root, manual_request=retry_id, intent_key_path=key_path)
    m.copy_contents = original_copy
    check("one-shot router EIO stays staged and retryable without a terminal result",
          first["manual"][0][0] == "retrying"
          and sorted(os.listdir(retry_envelope)) == [m.MANUAL_INTENT_NAME, m.MANUAL_PAYLOAD_NAME]
          and not os.path.exists(os.path.join(retry_envelope, m.MANUAL_RESULT_NAME)), str(first))
    recovered = m.run(root, manual_request=retry_id, intent_key_path=key_path)
    check("the next healthy scheduled pass recovers a transient manual request",
          recovered["manual"][0][0] == "routed" and not os.path.exists(retry_envelope), str(recovered))
    shutil.rmtree(root)

    root = tempfile.mkdtemp(); build_pool(root)
    key_state = os.path.join(root, "state"); os.mkdir(key_state, 0o700)
    key_path = os.path.join(key_state, "intent.key")
    policy_id = "DNU-" + "f" * 32
    policy_envelope, policy_intent, policy_key = stage_manual(
        m, root, key_path, policy_id, payload=b"point in time gold assertions",
        overrides={"subject": "GOLD", "swarm": "commodity", "filename": "WILTW_2026-08-13.pdf"},
    )
    policy = m.run(root, manual_request=policy_id, intent_key_path=key_path)
    policy_result = json.load(open(os.path.join(policy_envelope, m.MANUAL_RESULT_NAME)))
    check("signed manual GOLD WILTW is a distinct terminal policy rejection",
          policy["manual"][0][0] == "failed" and policy_result.get("status") == "rejected_policy"
          and policy_result.get("reason") == "policy_rejected"
          and m._valid_manual_result(policy_result, policy_key, policy_intent,
                                     hashlib.sha256(open(os.path.join(policy_envelope, m.MANUAL_INTENT_NAME), "rb").read()).hexdigest())
          and not os.path.exists(os.path.join(policy_envelope, m.MANUAL_PAYLOAD_NAME))
          and not os.path.exists(os.path.join(root, "GOLD", "external"))
          and not os.path.exists(os.path.join(root, "EXTERNAL-INBOX", m.LEDGER_NAME)), str(policy))

    visual_id = "DNU-" + "1" * 31 + "f"
    visual_envelope, visual_intent, visual_key = stage_manual(
        m, root, key_path, visual_id, payload=b"\x89PNG\r\n\x1a\nfixture",
        overrides={"subject": "GOLD", "swarm": "commodity", "filename": "unreadable-gold.png"},
    )
    ep = m._load_extract_pool(); ep._read_image_file = lambda _path: ("", None, "fixture unreadable")
    visual = m.run(root, manual_request=visual_id, intent_key_path=key_path, extractor=ep)
    visual_result = json.load(open(os.path.join(visual_envelope, m.MANUAL_RESULT_NAME)))
    check("signed unreadable GOLD visual produces no runtime evidence",
          visual["manual"][0][0] == "failed" and visual_result.get("status") == "rejected_policy"
          and visual_result.get("reason") == "policy_rejected"
          and not os.path.exists(os.path.join(visual_envelope, m.MANUAL_PAYLOAD_NAME))
          and not os.path.exists(os.path.join(root, "GOLD", "external"))
          and not os.path.exists(os.path.join(root, "EXTERNAL-INBOX", m.LEDGER_NAME)), str(visual))
    shutil.rmtree(root)

    root = tempfile.mkdtemp(); build_pool(root)
    key_state = os.path.join(root, "state"); os.mkdir(key_state, 0o700)
    key_path = os.path.join(key_state, "intent.key")
    swap_id = "DNU-" + "2" * 31 + "f"
    swap_envelope, _swap_intent, _swap_key = stage_manual(m, root, key_path, swap_id)
    original_identity = m._complete_identity_text

    def mutate_signed_payload_during_extract(ep, snapshot):
        answer = original_identity(ep, snapshot)
        with open(os.path.join(swap_envelope, m.MANUAL_PAYLOAD_NAME), "wb") as fh:
            fh.write(b"What I Learned This Week renamed content")
        return answer

    m._complete_identity_text = mutate_signed_payload_during_extract
    swapped = m.run(root, manual_request=swap_id, intent_key_path=key_path)
    m._complete_identity_text = original_identity
    check("payload mutation during extraction fails closed before WILTW can be published",
          swapped["manual"][0][0] == "retrying"
          and not os.path.exists(os.path.join(root, "AMZN", "external"))
          and not os.path.exists(os.path.join(root, "EXTERNAL-INBOX", m.LEDGER_NAME))
          and not os.path.exists(os.path.join(swap_envelope, m.MANUAL_RESULT_NAME)), str(swapped))
    shutil.rmtree(root)

    root = tempfile.mkdtemp(); build_pool(root)
    key_state = os.path.join(root, "state"); os.mkdir(key_state, 0o700)
    key_path = os.path.join(key_state, "intent.key")
    parent_id = "DNU-" + "3" * 31 + "f"
    parent_envelope, parent_intent, _parent_key = stage_manual(m, root, key_path, parent_id)
    destination_parent = os.path.join(
        os.path.realpath(root), "AMZN", "external", m.slug(parent_intent["provider"]),
    )
    outside_parent = os.path.join(os.path.realpath(root), "outside-destination")
    os.mkdir(outside_parent, 0o700)
    held_parent = destination_parent + ".held"
    original_mkstemp = m.tempfile.mkstemp
    swapped_parent = {"done": False}

    def swap_destination_parent(*args, **kwargs):
        target_dir = kwargs.get("dir")
        if target_dir == destination_parent and not swapped_parent["done"]:
            swapped_parent["done"] = True
            os.rename(destination_parent, held_parent)
            os.symlink(outside_parent, destination_parent)
        return original_mkstemp(*args, **kwargs)

    m.tempfile.mkstemp = swap_destination_parent
    parent_swap = m.run(root, manual_request=parent_id, intent_key_path=key_path)
    m.tempfile.mkstemp = original_mkstemp
    check("destination parent symlink-swap is detected before payload/sidecar/result publication",
          parent_swap["manual"][0][0] == "retrying"
          and not os.path.exists(os.path.join(outside_parent, parent_intent["filename"]))
          and not os.path.exists(os.path.join(outside_parent, parent_intent["filename"] + ".source.json"))
          and not os.path.exists(os.path.join(parent_envelope, m.MANUAL_RESULT_NAME))
          and not os.path.exists(os.path.join(root, "EXTERNAL-INBOX", m.LEDGER_NAME)), str(parent_swap))
    shutil.rmtree(root)

    root = tempfile.mkdtemp(); key_state = os.path.join(root, "state"); os.mkdir(key_state, 0o700)
    key_path = os.path.join(key_state, "intent.key")
    with open(key_path, "w") as fh: fh.write("42" * 32 + "\n")
    os.chmod(key_path, 0o644)
    check("world-readable HMAC key is rejected", m._manual_key(key_path) is None)
    os.chmod(key_path, 0o600); os.chmod(key_state, 0o777)
    check("world-writable HMAC state directory is rejected", m._manual_key(key_path) is None)
    os.chmod(key_state, 0o700)
    linked_state = os.path.join(root, "linked-state"); os.symlink(key_state, linked_state)
    check("symlinked HMAC state directory is rejected",
          m._manual_key(os.path.join(linked_state, "intent.key")) is None)
    shutil.rmtree(root)

    lock_root = tempfile.mkdtemp(); lock_path = os.path.join(lock_root, "ingest.lock")
    first_lock = m.acquire_lock(lock_path)
    os.utime(lock_path, (time.time() - 7200, time.time() - 7200))
    second_lock = m.acquire_lock(lock_path)
    check("a live retained singleton lease is never stolen merely because its mtime is old",
          first_lock is not None and second_lock is None)
    m.release_lock(first_lock)
    third_lock = m.acquire_lock(lock_path)
    check("singleton lock can be reacquired only after its retained owner releases", third_lock is not None)
    m.release_lock(third_lock)
    os.chmod(lock_path, 0o000)
    check("singleton lock fails closed on a permission error", m.acquire_lock(lock_path) is None)
    os.chmod(lock_path, 0o600)
    os.unlink(lock_path)
    os.symlink(os.path.join(lock_root, "elsewhere"), lock_path)
    check("singleton lock fails closed on a symlink/open error", m.acquire_lock(lock_path) is None)
    shutil.rmtree(lock_root)

    print()
    if failures:
        print(f"FAILED: {len(failures)} check(s): {failures}")
        return 1
    print("ALL PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
