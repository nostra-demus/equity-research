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
    """A pre-cutoff record that passes the other live checks. Only the audit
    table varies, so a populated table must produce a real GATE: PASS."""
    os.makedirs(root, exist_ok=True)
    rec = {
        "ticker": "TEST", "decision_date": PRE_CUTOFF_DATE, "decision": "Watchlist",
        "entry_price": 100, "confidence_score": 50, "data_sufficiency_score": 60,
        "scenarios": [
            {"label": label, "probability": probability, "return_pct": return_pct,
             "probability_basis": "judgment", "conditions": [condition],
             "joint_probability_basis": None}
            for label, probability, return_pct, condition in [
                ("bull", 30, 20, "Operating demand grows faster than expected"),
                ("base", 40, 5, "Operating demand grows at the current rate"),
                ("bear", 30, -15, "Operating demand contracts"),
            ]
        ],
        "expected_return_pct": 3.5, "downside_risk_pct": 15,
        "kill_criteria": [{
            "condition": "Audited operating cash flow turns negative in the next annual filing.",
            "comparable_basis": "Annual audited operating cash flow, same currency and accounting basis.",
            "fired_last_two_periods": False,
        }],
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
    root (its `sys.path.insert(0, "scripts")` is relative), argv[1] = run root.
    A crashed or hung validator must fail the test, never count as AJ silence."""
    proc = subprocess.run(
        [sys.executable, block_path, run_root],
        cwd=REPO_ROOT, capture_output=True, text=True, check=True, timeout=30,
    )
    return proc.stdout


def main():
    with open(FULL_MD, encoding="utf-8") as f:
        md = f.read()
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

        cases = [
            ("missing table", THESIS_NO_DAT, "PROVISIONAL", [
                "'## Decision Audit Trail' section not found",
            ]),
            ("populated table", THESIS_WITH_DAT, "PASS", []),
            ("italic placeholders", THESIS_WITH_DAT.replace("equity funded", "_N/A_")
             .replace("no near-term break", "_-_"), "PROVISIONAL", [
                 "blank 'Bear Evidence' cell", "blank 'Why?' cell",
             ]),
            ("malformed header", THESIS_WITH_DAT.replace("| Bear Evidence |", "| Other details |"),
             "PROVISIONAL", ["Decision Audit Trail header column 3"]),
            ("thin table", THESIS_WITH_DAT.replace(
                "| Solvency | net cash | equity funded | Bull | no near-term break |\n", ""),
             "PROVISIONAL", ["only 2 Decision Audit Trail row(s)"]),
            ("non-PART dossier", THESIS_WITH_DAT.replace(
                "# PART II — CROSS-CUTTING ANALYSIS\n\n", ""), "PASS", []),
            ("table under a later H1", THESIS_WITH_DAT.replace(
                "# PART II — CROSS-CUTTING ANALYSIS\n\n", "").replace(
                    "## Decision Audit Trail\n\n",
                    "## Decision Audit Trail\n\nNo audit table.\n\n# Appendix\n\n"),
             "PROVISIONAL", ["'## Decision Audit Trail' table has no data rows"]),
            ("audit section after Part II ends", THESIS_WITH_DAT.replace(
                "## Decision Audit Trail\n\n", "# Appendix\n\n## Decision Audit Trail\n\n"),
             "PROVISIONAL", ["'## Decision Audit Trail' section not found"]),
            ("empty leading header cell", THESIS_WITH_DAT.replace(
                "| Decision Driver |", "|| Decision Driver |"),
             "PROVISIONAL", ["Decision Audit Trail header column 1"]),
            ("empty driver beside populated evidence", THESIS_WITH_DAT.replace(
                "| Solvency | net cash | equity funded | Bull | no near-term break |",
                "|| net cash | equity funded | Bull | no near-term break | 50 |"),
             "PROVISIONAL", ["blank 'Decision Driver' cell"]),
            ("empty trailing Why cell", THESIS_WITH_DAT.replace(
                "| Solvency | net cash | equity funded | Bull | no near-term break |",
                "| Solvency | net cash | equity funded | Bull ||"),
             "PROVISIONAL", ["blank 'Why?' cell"]),
            ("underscore emphasis in header", THESIS_WITH_DAT.replace(
                "| Decision Driver | Bull Evidence | Bear Evidence | Which Side Wins? | Why? |",
                "| _Decision_ Driver | Bull _Evidence_ | _Bear Evidence_ | Which Side _Wins_? | _Why_? |"),
             "PASS", []),
        ]
        for index, (name, thesis, verdict, diagnostics) in enumerate(cases):
            run_root = os.path.join(tmp, f"case{index}", f"TEST_{PRE_CUTOFF_DATE}")
            write_fixture(run_root, thesis)
            output = run_block(block_path, run_root)
            gates = [line for line in output.splitlines() if line.startswith("GATE:")]
            # The PASS summary also names Decision Audit Trail. Check the actual
            # verdict and the specific failure diagnostics, not a generic substring.
            if (len(gates) == 1 and gates[0].startswith(f"GATE: {verdict} — ")
                    and all(message in gates[0] for message in diagnostics)):
                print(f"  [ok] pre-cutoff folder, {name} -> {verdict}")
            else:
                bad += 1
                print(f"  [XX] pre-cutoff folder, {name}: expected {verdict} "
                      f"with {diagnostics!r}. Got:\n{output}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    if bad:
        print(f"LIVE-GATE AJ SELFTEST FAIL ({bad} case(s))")
        sys.exit(1)
    print("LIVE-GATE AJ SELFTEST PASS — missing, placeholder, malformed, and thin audit tables "
          "produce PROVISIONAL; a populated table produces PASS on a pre-AJ_DATE rerun folder")


if __name__ == "__main__":
    main()
