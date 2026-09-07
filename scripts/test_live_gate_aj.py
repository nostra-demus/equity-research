#!/usr/bin/env python3
"""Live-gate regression for check AJ (Decision Audit Trail) — CLAUDE.md §8/§22.

This test executes the ACTUAL, unmodified Step 10B.1 finish-gate Python block
extracted verbatim from `.claude/commands/research/full.md` against a synthetic
run folder, so it guards the live PRE-PUBLISH wiring — not just the pure
`eval_aj_decision_audit_trail` function that `eval.py selftest` already covers.

The bug it locks down (review r-live-aj): the live AJ call must gate on
`_live_date` (today's execution date), NOT on `ddte` (the run's stored
`decision_date`). A standalone `/research:rerun` runs this exact block against an
EXISTING folder whose `decision_date` stays pinned to that folder's original
YYYY-MM-DD (synthesizer.md), so a pre-AJ_DATE folder (BG/HCG_2026-06-01,
TMCV_2026-06-07, EMAAR_2026-07-03) evaluated at `ddte` returns N/A — the freshly
rewritten `final_thesis.md` could ship with NO Decision Audit Trail, print
GATE: PASS, and reach main. Gating on `_live_date` (always >= AJ_DATE) closes
that hole. Retrospective `eval.py` check AJ intentionally keeps the true
`decision_date`, so historical fixtures retain their pre-AJ_DATE N/A status —
that split is exactly why this live-only regression exists.

Expected verdicts are pinned to synthesizer.md Step 5 ("a genuine, non-blank,
non-placeholder ... cell") and CLAUDE.md §8/§22 — never to current code output.

Self-contained, fixture-free (temp sandbox only, never touches analyses/), and
exits nonzero on failure so CI fails loudly.
"""
import os
import re
import sys
import json
import shutil
import tempfile
import subprocess

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FULL_MD = os.path.join(REPO_ROOT, ".claude", "commands", "research", "full.md")

# A pre-AJ_DATE (2026-07-10) decision_date — the rerun-on-stale-date case. At this
# date the retrospective (ddte-gated) AJ is N/A; the live gate must still apply.
PRE_CUTOFF_DATE = "2026-06-01"

AJ_SUBSTR = "Decision Audit Trail"  # the AJ violation string; absent => AJ did not fire


def extract_step_10b1_block(md_text):
    """Return the Python body of the Step 10B.1 finish-gate heredoc from full.md —
    the `python3 - "<RUN_ROOT>" <<'PY' ... PY` block whose argv[1] is the run root."""
    lines = md_text.splitlines()
    start = None
    for i, l in enumerate(lines):
        s = l.strip()
        if s.startswith('python3 - "<RUN_ROOT>" <<') and s.endswith("'PY'"):
            start = i + 1
            break
    if start is None:
        raise AssertionError("could not locate the Step 10B.1 `python3 - \"<RUN_ROOT>\" <<'PY'` block in full.md")
    end = None
    for j in range(start, len(lines)):
        if lines[j].strip() == "PY":
            end = j
            break
    if end is None:
        raise AssertionError("Step 10B.1 heredoc has no closing PY marker")
    return "\n".join(lines[start:end])


def write_fixture(root, thesis_md):
    """A synthetic run folder with a pre-cutoff decision_date. Only the Decision
    Audit Trail presence varies between cases; other checks may also flag — the
    assertions isolate AJ by the presence/absence of its own violation string."""
    os.makedirs(root, exist_ok=True)
    rec = {
        "ticker": "TEST", "decision_date": PRE_CUTOFF_DATE, "decision": "Watchlist",
        "scenarios": [
            {"name": "bull", "probability": 30, "return_pct": 20},
            {"name": "base", "probability": 40, "return_pct": 5},
            {"name": "bear", "probability": 30, "return_pct": -15},
        ],
        "expected_return_pct": 3.5, "downside_risk_pct": 15,
        "kill_criteria": [{"metric": "x", "threshold": "y",
                           "comparable_basis": "YoY same period", "fired_last_two_periods": False}],
    }
    with open(os.path.join(root, "decision_record.json"), "w", encoding="utf-8") as f:
        json.dump(rec, f)
    with open(os.path.join(root, "final_thesis.md"), "w", encoding="utf-8") as f:
        f.write(thesis_md)


THESIS_NO_DAT = (
    "# Thesis\n\n# PART II — CROSS-CUTTING ANALYSIS\n\n"
    "SIGN CHECK: bear return is negative, ok.\n\n## Some Section\n\nno audit trail here.\n"
)
THESIS_WITH_DAT = (
    "# Thesis\n\n# PART II — CROSS-CUTTING ANALYSIS\n\n"
    "SIGN CHECK: bear return is negative, ok.\n\n## Decision Audit Trail\n\n"
    "| Decision Driver | Bull Evidence | Bear Evidence | Which Side Wins? | Why? |\n"
    "|---|---|---|---|---|\n"
    "| Valuation | cheap vs peers | priced for perfection | Bear | DCF below price |\n"
    "| Growth | demand up | mix headwind | Bull | volume compounding |\n"
    "| Solvency | net cash | equity funded | Bull | no near-term break |\n"
)


def run_block(block_path, run_root):
    """Execute the extracted gate block exactly as full.md does: from the repo
    root (its `sys.path.insert(0, "scripts")` is relative), argv[1] = run root."""
    proc = subprocess.run(
        [sys.executable, block_path, run_root],
        cwd=REPO_ROOT, capture_output=True, text=True,
    )
    return (proc.stdout or "") + (proc.stderr or "")


def main():
    md = open(FULL_MD, encoding="utf-8").read()
    block = extract_step_10b1_block(md)

    bad = 0

    # Static guard: the live AJ call must gate on _live_date, not ddte. A silent
    # revert to ddte reintroduces the rerun-bypass even if execution somehow masked it.
    if not re.search(r"eval_aj_decision_audit_trail\(\s*_live_date\s*,", block):
        bad += 1
        print("  [XX] full.md Step 10B.1 AJ call does NOT gate on `_live_date` "
              "(rerun on a pre-AJ_DATE folder would bypass the Decision Audit Trail gate)")
    else:
        print("  [ok] full.md Step 10B.1 AJ call gates on `_live_date`")

    tmp = tempfile.mkdtemp(prefix="aj_live_gate_")
    try:
        block_path = os.path.join(tmp, "step10b1.py")
        with open(block_path, "w", encoding="utf-8") as f:
            f.write(block)

        # Case 1 — pre-cutoff folder, NO Decision Audit Trail: the live gate MUST flag it.
        run_a = os.path.join(tmp, "runA")
        write_fixture(run_a, THESIS_NO_DAT)
        out_a = run_block(block_path, run_a)
        if AJ_SUBSTR in out_a and "GATE: PROVISIONAL" in out_a:
            print("  [ok] pre-cutoff folder, missing Decision Audit Trail -> AJ flags PROVISIONAL")
        else:
            bad += 1
            print("  [XX] pre-cutoff folder, missing Decision Audit Trail -> AJ did NOT fire "
                  "(expected PROVISIONAL naming the Decision Audit Trail). Got:\n" + out_a)

        # Case 2 — pre-cutoff folder, POPULATED Decision Audit Trail: AJ must NOT fire
        # (other checks may still flag; we assert only the AJ string is absent).
        run_b = os.path.join(tmp, "runB")
        write_fixture(run_b, THESIS_WITH_DAT)
        out_b = run_block(block_path, run_b)
        if AJ_SUBSTR not in out_b:
            print("  [ok] pre-cutoff folder, populated Decision Audit Trail -> AJ does not fire")
        else:
            bad += 1
            print("  [XX] pre-cutoff folder, populated Decision Audit Trail -> AJ fired unexpectedly. Got:\n" + out_b)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    if bad:
        print(f"LIVE-GATE AJ SELFTEST FAIL ({bad} case(s))")
        sys.exit(1)
    print("LIVE-GATE AJ SELFTEST PASS — Step 10B.1 gates AJ on _live_date; missing/placeholder "
          "Decision Audit Trail -> PROVISIONAL, populated -> pass, even on a pre-AJ_DATE rerun folder")


if __name__ == "__main__":
    main()
