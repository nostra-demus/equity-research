#!/usr/bin/env python3
"""Tests for scripts/ledger_records.py — the standing/corrected decision-record resolver.

Two tiers (mirrors test_decision_surface.py):
  1. Embedded selftest — fixture-free, always runs.
  2. Live-ledger fixture — asserts the standing set is internally consistent (no run appears twice
     per ticker unless a sidecar explains it; a superseded run is dropped and its target exists).
     Self-terminating: skips cleanly if analyses/ is absent.

Run: python3 scripts/test_ledger_records.py
"""

import glob
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ledger_records import (  # noqa: E402
    load_standing_records,
    read_corrections,
    selftest,
    superseded_target,
)

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
failures = []


def check(cond, msg):
    if not cond:
        failures.append(msg)
        print(f"FAIL: {msg}")


def main():
    check(selftest(), "embedded selftest failed")

    analyses = os.path.join(REPO, "analyses")
    if not os.path.isdir(analyses):
        print("skip: analyses/ absent — live-ledger tier skipped")
    else:
        standing = load_standing_records(analyses)
        # every standing run has a real decision record and is not itself superseded
        for e in standing:
            check(isinstance(e["record"], dict) and e["record"].get("ticker"),
                  f"{e['run_root']}: standing record must carry a ticker")
            check(superseded_target(read_corrections(os.path.join(REPO, e["run_root"]))) is None,
                  f"{e['run_root']}: a superseded run must not appear in the standing set")

        # any superseded run's target must itself be a real, existing run folder
        for rec_path in glob.glob(os.path.join(analyses, "*", "decision_record.json")):
            run_dir = os.path.dirname(rec_path)
            tgt = superseded_target(read_corrections(run_dir))
            if tgt:
                check(os.path.isdir(os.path.join(REPO, tgt)),
                      f"{run_dir}: superseded_by target {tgt} must exist")
                check(not any(e["run_root"] == run_dir.replace(os.sep, "/") for e in standing),
                      f"{run_dir}: superseded run must be dropped from the standing set")

        # no ticker should have two STANDING records on the same decision_date (the double-count class)
        seen = {}
        for e in standing:
            rec = e["record"]
            key = (rec.get("ticker"), rec.get("decision_date"))
            check(key not in seen, f"duplicate standing call for {key} ({e['run_root']} vs {seen.get(key)})")
            seen[key] = e["run_root"]

    if failures:
        print(f"\n{len(failures)} failure(s)")
        return 1
    print("\nAll ledger_records tests passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
