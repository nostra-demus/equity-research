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
