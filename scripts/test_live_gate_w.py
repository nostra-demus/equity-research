#!/usr/bin/env python3
"""Live-gate regression for check W (§16 sector ↔ valuation-method consistency).

This test executes the ACTUAL, unmodified Step 10B.1 finish-gate Python block
extracted verbatim from `.claude/commands/research/full.md` against synthetic run
folders, so it guards the live PRE-PUBLISH wiring of check W — not just the pure
`eval_w_sector_valuation` function that `eval.py selftest` already covers.

It locks down the rerun-safety precedent this check follows (mirroring AA/AB/BB/BD/BE):
the live call must gate on `_live_date` (today), NOT `ddte` (the run's stored
decision_date). A standalone `/research:rerun` runs this exact block against an
EXISTING folder whose decision_date stays pinned to its original YYYY-MM-DD
(synthesizer.md), so a folder first created before check W's SECTOR_DATE
(2026-06-18) — re-run today over a freshly regenerated `primary_valuation_method`
that uses a forbidden token — would evaluate `ddte < SECTOR_DATE` → N/A and ship
the mismatch with `GATE: PASS` if the live call gated on `ddte`. This test uses a
PRE-SECTOR_DATE folder, so the check W violation can ONLY appear if the live call
gates on `_live_date`.

Also covers: N/A when either field is blank/absent (the additive/optional
convention shared with `scenarios[]`/`edge_score`), and clean when the method is
not on the forbidden list for that sector (including REIT-on-FCFF, which
SECTOR_OVERLAYS.md does NOT forbid).

Assertions check presence/absence of the check-W-SPECIFIC violation substring in
the GATE line, so unrelated checks firing on the fixture never give a false result.
Expected behaviour is pinned to CLAUDE.md §16 / frameworks/SECTOR_OVERLAYS.md —
never to current code output.

Self-contained, fixture-free (temp sandbox only, never touches analyses/), and exits
nonzero on failure so CI fails loudly.
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

# A pre-SECTOR_DATE (2026-06-18) decision_date — the rerun-on-stale-date case.
# At this date the retrospective (ddte-gated) check W is N/A; the live gate must still apply.
PRE_CUTOFF_DATE = "2026-06-01"

# check-W-specific violation substring emitted by scripts/sector_valuation_checks.py.
W_MSG = "uses forbidden method token(s)"

THESIS = "# Thesis\n\nSIGN CHECK: bear return is negative, ok.\n"


def extract_step_10b1_block(md_text):
    """Return the Python body of the Step 10B.1 finish-gate heredoc from full.md."""
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


def write_fixture(root, business_type, primary_valuation_method):
    os.makedirs(root, exist_ok=True)
    rec = {
        "ticker": "TEST", "decision_date": PRE_CUTOFF_DATE, "decision": "Watchlist",
        "entry_price": 100, "confidence_score": 50, "data_sufficiency_score": 60,
        "thesis_type": ["Company-specific"],
        "business_type": business_type, "primary_valuation_method": primary_valuation_method,
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
        f.write(THESIS)


def run_block(block_path, run_root):
    try:
        proc = subprocess.run(
            [sys.executable, block_path, run_root],
            cwd=REPO_ROOT, capture_output=True, text=True, check=True, timeout=30,
        )
    except subprocess.CalledProcessError as exc:
        print(f"Validator exited {exc.returncode}\nstdout:\n{exc.stdout}\nstderr:\n{exc.stderr}",
              file=sys.stderr)
        raise
    return proc.stdout


def gate_line(output):
    gates = [line for line in output.splitlines() if line.startswith("GATE:")]
    return gates[0] if len(gates) == 1 else ""


def main():
    with open(FULL_MD, encoding="utf-8") as f:
        md = f.read()
    block = extract_step_10b1_block(md)

    bad = 0

    # Static guard: the live W call must gate on _live_date, not ddte. A silent revert to ddte
    # reintroduces the rerun bypass even if an execution case happened to mask it.
    if re.search(r"_isdate\(_live_date\)\s+and\s+_live_date\s*>=\s*svc\.SECTOR_DATE", block):
        print("  [ok] full.md Step 10B.1 check W call gates on `_live_date`")
    else:
        bad += 1
        print("  [XX] full.md Step 10B.1 check W call does NOT gate on `_live_date` "
              "(a pre-SECTOR_DATE rerun would bypass the §16 sector-valuation-method check)")

    # (name, business_type, primary_valuation_method, must-be-present, must-be-absent)
    cases = [
        ("Bank on FCFF DCF (forbidden)", "Bank / lender", "FCFF DCF", [W_MSG], []),
        ("REIT on EBITDA-DCF (forbidden)", "REIT / real estate", "EBITDA-DCF", [W_MSG], []),
        ("REIT on FCFF DCF (doctrine does NOT forbid this)", "REIT / real estate", "FCFF DCF", [], [W_MSG]),
        ("Bank on DDM (clean)", "Bank / lender", "DDM / residual income", [], [W_MSG]),
        ("Generic operator on FCFF DCF (untracked sector)", "Generic operating company", "FCFF DCF", [], [W_MSG]),
        ("business_type unset -> N/A", None, "FCFF DCF", [], [W_MSG]),
        ("primary_valuation_method unset -> N/A", "Bank / lender", None, [], [W_MSG]),
        # A non-string field (malformed decision_record.json) must degrade to N/A, never crash the gate
        # before it emits a GATE: line. run_block uses check=True, so a crash surfaces as a hard failure.
        ("non-string business_type -> N/A (no crash)", ["Bank / lender"], "FCFF DCF", [], [W_MSG]),
        ("bank quoted on EV/Revenue (forbidden EV method)", "Bank / lender", "EV/Revenue", [W_MSG], []),
    ]

    tmp = tempfile.mkdtemp(prefix="w_live_gate_")
    try:
        block_path = os.path.join(tmp, "step10b1.py")
        with open(block_path, "w", encoding="utf-8") as f:
            f.write(block)
        for index, (name, bt, pvm, must, mustnot) in enumerate(cases):
            run_root = os.path.join(tmp, f"case{index}", f"TEST_{PRE_CUTOFF_DATE}")
            write_fixture(run_root, bt, pvm)
            gl = gate_line(run_block(block_path, run_root))
            ok = bool(gl) and all(m in gl for m in must) and all(m not in gl for m in mustnot)
            if ok:
                print(f"  [ok] pre-cutoff folder, {name}")
            else:
                bad += 1
                print(f"  [XX] pre-cutoff folder, {name}: expected present={must!r} absent={mustnot!r}\n"
                      f"       GATE: {gl!r}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    if bad:
        print(f"LIVE-GATE W SELFTEST FAIL ({bad} case(s))")
        sys.exit(1)
    print("LIVE-GATE W SELFTEST PASS — on a pre-SECTOR_DATE rerun folder the §16 sector ↔ "
          "valuation-method check fires live on a forbidden method, stays clean on an allowed "
          "one, and is N/A when either field is unset")


if __name__ == "__main__":
    main()
