#!/usr/bin/env python3
"""Unit + fixture tests for scripts/decision_surface.py (the incremental-rerun early-cutoff differ).

Two tiers, mirroring the repo's testing conventions (test_confidence.py / ci.yml self-terminating
fixtures):
  1. The module's own embedded selftest — fixture-free, always runs, locks the line-level regex
     behavior on real rendered shapes (including the cap-row and fired-tag change classes).
  2. FROZEN fixture assertions — full real module syntheses copied under
     scripts/testdata/decision_surface/ (snapshot of the EMAAR_2026-07-10 run). Deliberately NOT
     the live analyses/ folder: the incremental rerun mutates the latest run in place and commits
     it to main, so pinning the live files would turn every routine data commit into a CI break
     (adversarial review, confirmed). The frozen copies lock the END-TO-END properties the rerun
     cascade relies on: every synthesis yields a parseable surface; a surface is
     regeneration-stable under prose rewording; and each decision-change class (score, verdict,
     cap row — annotated included, filter, red-flag tag transition) reads as changed.

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

HERE = os.path.dirname(os.path.abspath(__file__))
FIXTURES = os.path.join(HERE, "testdata", "decision_surface")

failures = []


def check(cond, msg):
    if not cond:
        failures.append(msg)
        print(f"FAIL: {msg}")


def main():
    # tier 1 — embedded selftest (fixture-free)
    check(selftest(), "embedded selftest failed")

    # tier 2 — frozen full-document fixtures (self-terminating: skip cleanly if the fixture dir is
    # somehow absent on this ref; the moment it exists, these assertions are required)
    syntheses = sorted(glob.glob(os.path.join(FIXTURES, "*__99-synthesis.md")))
    if not syntheses:
        print(f"skip: no frozen fixtures at {FIXTURES} — fixture tier skipped")
    else:
        check(len(syntheses) >= 6, f"expected >=6 frozen syntheses, found {len(syntheses)}")
        for path in syntheses:
            with open(path, encoding="utf-8") as f:
                md = f.read()
            s = extract_surface(md)
            mod = os.path.basename(path).split("__")[0]
            check(s["parse_ok"], f"{mod}: frozen synthesis must yield a parseable surface")
            check(bool(s["verdict"]), f"{mod}: verdict category must extract")
            check(len(s["scores"]) >= 3, f"{mod}: expected >=3 score bullets, got {len(s['scores'])}")
            # determinism: extracting twice is byte-identical
            check(extract_surface(md) == s, f"{mod}: extraction must be deterministic")
            # identity: a file diffed against itself is unchanged
            check(diff_files(path, path) == {
                "changed": False, "reasons": [], "byte_identical": True, "old": path, "new": path,
            }, f"{mod}: self-diff must be unchanged and byte_identical")

        def fixture(mod):
            path = os.path.join(FIXTURES, f"{mod}__99-synthesis.md")
            with open(path, encoding="utf-8") as f:
                return f.read()

        bm = fixture("business-model")
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
        # each decision-change class must read as changed — on the real documents
        bm_cases = {
            "score move": bm.replace("- Moat /100: **68**", "- Moat /100: **62**"),
            "verdict flip": bm.replace(
                "**Verdict:** **Cyclical business — worth deeper work only with a strong timing edge**",
                "**Verdict:** **Low-quality business — avoid deeper work**"),
            "filter trip": bm.replace("- **Filter 4 — Serial acquirers:** **Not tripped.**",
                                      "- **Filter 4 — Serial acquirers:** **Tripped.**"),
            "tag transition": bm.replace(
                "RF-BQ-005 (fast-changing industry: rate-of-change ≤40): NOT emitted",
                "RF-BQ-005 (fast-changing industry: rate-of-change ≤40): FIRED"),
        }
        for name, mutated in bm_cases.items():
            check(mutated != bm, f"{name}: mutation fixture must actually change the text")
            check(diff_surfaces(a, extract_surface(mutated))["changed"] is True,
                  f"{name}: must read as changed")
        # annotated cap-row flip on the real valuation synthesis (the confirmed blind spot)
        val = fixture("valuation")
        val_flip = val.replace("**N (reconciled)**", "**Y (unreconciled)**")
        check(val_flip != val, "valuation cap-row fixture must actually change the text")
        check(diff_surfaces(extract_surface(val), extract_surface(val_flip))["changed"] is True,
              "annotated cap-row flip on the real valuation synthesis must read as changed")
        # red-flag clearing-line transition on the real MG synthesis
        mg = fixture("management-governance")
        mg_flip = mg.replace("NOT triggered this run", "FIRED AGAIN this run")
        check(mg_flip != mg, "MG tag fixture must actually change the text")
        check(diff_surfaces(extract_surface(mg), extract_surface(mg_flip))["changed"] is True,
              "fired-in-prior-run clearing line flipping to a re-fire must read as changed")

    # diff_files fail-toward-changed on a missing side
    res = diff_files(os.path.join(HERE, "nonexistent_old.md"), os.path.join(HERE, "nonexistent_new.md"))
    check(res["changed"] is True, "missing files must fail toward changed")

    if failures:
        print(f"\n{len(failures)} failure(s)")
        return 1
    print("\nAll decision_surface tests passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
