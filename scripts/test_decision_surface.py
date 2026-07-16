#!/usr/bin/env python3
"""Unit + fixture tests for scripts/decision_surface.py (the incremental-rerun early-cutoff differ).

Two tiers, mirroring the repo's testing conventions (test_confidence.py / ci.yml self-terminating
fixtures):
  1. The module's own embedded selftest — fixture-free, always runs, locks the line-level regex
     behavior on real rendered shapes.
  2. Committed-run fixture assertions — run only when the golden run folder exists on this ref
     (the ci.yml tied-to-fixtures pattern), and lock the END-TO-END properties the rerun cascade
     relies on: every committed module synthesis yields a parseable surface; a surface is
     regeneration-stable under prose rewording; and each class of decision change (score, verdict,
     cap row, fired tag) reads as changed.

Run: python3 scripts/test_decision_surface.py
"""

import glob
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from decision_surface import (  # noqa: E402
    diff_files,
    diff_surfaces,
    extract_surface,
    selftest,
)

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GOLDEN = os.path.join(REPO, "analyses", "EMAAR_2026-07-10")

failures = []


def check(cond, msg):
    if not cond:
        failures.append(msg)
        print(f"FAIL: {msg}")


def main():
    # tier 1 — embedded selftest (fixture-free)
    check(selftest(), "embedded selftest failed")

    # tier 2 — committed-run fixtures (self-terminating: skip cleanly before the golden run
    # exists on this ref; the moment it does, these assertions are required)
    syntheses = sorted(glob.glob(os.path.join(GOLDEN, "*", "99_*-synthesis.md")))
    if not syntheses:
        print(f"skip: golden run not on this ref ({GOLDEN}) — fixture tier skipped")
    else:
        check(len(syntheses) >= 6, f"golden run should carry >=6 module syntheses, found {len(syntheses)}")
        for path in syntheses:
            with open(path, encoding="utf-8") as f:
                md = f.read()
            s = extract_surface(md)
            mod = os.path.basename(os.path.dirname(path))
            check(s["parse_ok"], f"{mod}: committed synthesis must yield a parseable surface")
            check(bool(s["verdict"]), f"{mod}: verdict category must extract")
            check(len(s["scores"]) >= 3, f"{mod}: expected >=3 score bullets, got {len(s['scores'])}")
            # determinism: extracting twice is byte-identical
            check(extract_surface(md) == s, f"{mod}: extraction must be deterministic")
            # identity: a file diffed against itself is unchanged
            check(diff_files(path, path) == {
                "changed": False, "reasons": [], "byte_identical": True, "old": path, "new": path,
            }, f"{mod}: self-diff must be unchanged and byte_identical")

        bm_path = next((p for p in syntheses if "/business-model/" in p), None)
        check(bm_path is not None, "golden run must carry the business-model synthesis")
        if bm_path:
            with open(bm_path, encoding="utf-8") as f:
                bm = f.read()
            a = extract_surface(bm)
            # regeneration stability: heavy prose rewording with untouched decision values is UNCHANGED
            reworded = (bm
                        .replace("Emaar Properties is a Dubai-based property developer",
                                 "Emaar Properties, headquartered in Dubai, is a developer")
                        .replace("Its biggest weakness is single-city concentration",
                                 "The largest vulnerability is concentration in one city"))
            check(reworded != bm, "rewording fixture must actually change the text")
            check(diff_surfaces(a, extract_surface(reworded))["changed"] is False,
                  "prose rewording with identical decision values must be UNCHANGED")
            # each decision-change class must read as changed
            cases = {
                "score move": bm.replace("- Moat /100: **68**", "- Moat /100: **62**"),
                "verdict flip": bm.replace(
                    "**Verdict:** **Cyclical business — worth deeper work only with a strong timing edge**",
                    "**Verdict:** **Low-quality business — avoid deeper work**"),
                "filter trip": bm.replace("- **Filter 4 — Serial acquirers:** **Not tripped.**",
                                          "- **Filter 4 — Serial acquirers:** **Tripped.**"),
            }
            for name, mutated in cases.items():
                check(mutated != bm, f"{name}: mutation fixture must actually change the text")
                check(diff_surfaces(a, extract_surface(mutated))["changed"] is True,
                      f"{name}: must read as changed")

    # diff_files fail-toward-changed on a missing side
    res = diff_files(os.path.join(REPO, "nonexistent_old.md"), os.path.join(REPO, "nonexistent_new.md"))
    check(res["changed"] is True, "missing files must fail toward changed")

    if failures:
        print(f"\n{len(failures)} failure(s)")
        return 1
    print("\nAll decision_surface tests passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
