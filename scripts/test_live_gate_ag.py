#!/usr/bin/env python3
"""Live-gate regression for check AG (§18 Phase 6 calibration-feedback gate) — DECISION_LEDGER.md §18.

This test executes the ACTUAL, unmodified Step 10B.1 finish-gate Python block
extracted verbatim from `.claude/commands/research/full.md` against a synthetic
run folder, so it guards the live PRE-PUBLISH wiring — not just the pure
`eval_ag_calibration_feedback_gate` function that `eval.py selftest` already
covers.

The bug class this locks down (the same one review found in an earlier draft
of the sibling AA/AB live-gate blocks): the live AG call must gate on
`_live_date` (today's execution date), NOT on `ddte` (the run's stored
`decision_date`). A standalone `/research:rerun` re-runs the synthesizer's
Pre-Write Gate step 4C fresh — producing a brand-new `calibration_feedback`
object against whatever `calibration_summary.json` exists TODAY — but the
folder's `decision_date` stays pinned to its original YYYY-MM-DD suffix
(synthesizer.md) and never advances. Gating on `ddte` would make this check
permanently N/A for a rerun of any pre-AG_DATE (2026-07-06) folder, exactly
the hole the sibling checks close by using `_live_date` instead. This test's
fixtures use a pre-AG_DATE `decision_date` specifically to prove the live gate
still applies.

Expected verdicts are pinned to DECISION_LEDGER.md §18 and synthesizer.md's
Pre-Write Gate step 4C / Confidence Scoring Rules step 1 — never to current
code output.

Self-contained, fixture-free (temp sandbox only, never touches analyses/ or
analyses/performance/), and exits nonzero on failure so CI fails loudly.
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

# A pre-AG_DATE (2026-07-06) decision_date — the rerun-on-stale-date case. At this
# date the retrospective (ddte-gated) AG is N/A; the live gate must still apply.
PRE_CUTOFF_DATE = "2026-06-01"
# A calibration_summary date safely before both PRE_CUTOFF_DATE's rerun and "today"
# in this fictional-clock environment, well after AG_DATE.
SUMMARY_DATE = "2026-07-10"


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


THESIS_WITH_DAT = (
    "# Thesis\n\n# PART II — CROSS-CUTTING ANALYSIS\n\n"
    "SIGN CHECK: bear return is negative, ok.\n\n## Decision Audit Trail\n\n"
    "| Decision Driver | Bull Evidence | Bear Evidence | Which Side Wins? | Why? |\n"
    "|---|---|---|---|---|\n"
    "| Valuation | cheap vs peers | priced for perfection | Bear | DCF below price |\n"
    "| Growth | demand up | mix headwind | Bull | volume compounding |\n"
    "| Solvency | net cash | equity funded | Bull | no near-term break |\n"
)


def write_fixture(root, calibration_feedback, confidence_inputs=None):
    """A pre-cutoff record that passes every OTHER live check (scenario math, §7/§11/§14
    caps, §24 rejector filters, Decision Audit Trail, sign-check, kill-criteria schema).
    Only calibration_feedback / confidence_inputs vary, so any GATE: PROVISIONAL in a
    test case is attributable to AG alone."""
    os.makedirs(root, exist_ok=True)
    rec = {
        "ticker": "TEST", "decision_date": PRE_CUTOFF_DATE, "decision": "Watchlist",
        "entry_price": 100, "confidence_score": 50, "data_sufficiency_score": 60,
        "thesis_type": ["Company-specific"],
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
        "calibration_feedback": calibration_feedback,
        "confidence_inputs": confidence_inputs,
    }
    with open(os.path.join(root, "decision_record.json"), "w", encoding="utf-8") as f:
        json.dump(rec, f)
    with open(os.path.join(root, "final_thesis.md"), "w", encoding="utf-8") as f:
        f.write(THESIS_WITH_DAT)


def write_calib_summary(sandbox, verdict, error_taxonomy_distribution=None):
    """A minimal analyses/performance/<SUMMARY_DATE>_calibration_summary.json under the
    sandbox CWD, so `calibration_gate_checks._calib_summary_asof` (globbing relative to
    CWD) resolves it without touching the real repo's analyses/performance/."""
    perf_dir = os.path.join(sandbox, "analyses", "performance")
    os.makedirs(perf_dir, exist_ok=True)
    summary = {"verdict": verdict, "error_taxonomy_distribution": error_taxonomy_distribution or {}}
    with open(os.path.join(perf_dir, f"{SUMMARY_DATE}_calibration_summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f)


def run_block(block_path, sandbox, run_root):
    """Execute the extracted gate block exactly as full.md does, but with CWD set to a
    per-case sandbox (not the real repo) so `_calib_summary_asof`'s relative
    `analyses/performance/*_calibration_summary.json` glob only ever sees this test's
    own fixtures. `sys.path.insert(0, "scripts")` inside the block is then a no-op (no
    such relative dir under the sandbox); PYTHONPATH supplies the real scripts/ dir for
    `import calibration_gate_checks`/`rating_caps`/etc. instead. A crashed or hung
    validator must fail the test, never count as AG silence."""
    env = dict(os.environ)
    env["PYTHONPATH"] = os.path.join(REPO_ROOT, "scripts") + os.pathsep + env.get("PYTHONPATH", "")
    try:
        proc = subprocess.run(
            [sys.executable, block_path, run_root],
            cwd=sandbox, capture_output=True, text=True, check=True, timeout=30, env=env,
        )
    except subprocess.CalledProcessError as exc:
        print(f"Validator exited {exc.returncode}\nstdout:\n{exc.stdout}\nstderr:\n{exc.stderr}",
              file=sys.stderr)
        raise
    return proc.stdout


def main():
    with open(FULL_MD, encoding="utf-8") as f:
        md = f.read()
    block = extract_step_10b1_block(md)

    bad = 0

    # Static guard: the live AG call must gate on _live_date, not ddte. A silent
    # revert to ddte reintroduces the rerun-bypass even if execution somehow masked it.
    if not re.search(r"eval_ag_calibration_feedback_gate\(\s*_live_date\s*,", block):
        bad += 1
        print("  [XX] full.md Step 10B.1 AG call does NOT gate on `_live_date` "
              "(rerun on a pre-AG_DATE folder would bypass the §18 calibration-feedback gate)")
    else:
        print("  [ok] full.md Step 10B.1 AG call gates on `_live_date`")

    # Static guard: the as-of calibration summary must also be resolved against
    # _live_date (what a fresh Pre-Write Gate run would just have read), not ddte.
    if not re.search(r"_calib_summary_asof\(\s*_live_date\s*\)", block):
        bad += 1
        print("  [XX] full.md Step 10B.1 does NOT resolve the as-of calibration summary against `_live_date`")
    else:
        print("  [ok] full.md Step 10B.1 resolves the as-of calibration summary against `_live_date`")

    tmp = tempfile.mkdtemp(prefix="ag_live_gate_")
    try:
        block_path = os.path.join(tmp, "step10b1.py")
        with open(block_path, "w", encoding="utf-8") as f:
            f.write(block)

        cases = [
            ("no summary, status not_available",
             None, {"status": "not_available"}, None, "PASS", []),

            ("no summary but calibration_feedback missing entirely",
             None, None, None, "PROVISIONAL",
             ["calibration_feedback object"]),

            ("summary Pre-data, no leading category, status pre_data",
             ("Pre-data (n=3)", {}), {"status": "pre_data"}, None, "PASS", []),

            ("summary has real signal but status stayed not_available",
             ("Watchlist-heavy calibration", {}), {"status": "not_available"}, None,
             "PROVISIONAL", ["expected 'checked_no_action' or 'applied'"]),

            ("checked_no_action, nothing flagged",
             ("Watchlist-heavy calibration", {}),
             {"status": "checked_no_action", "modules_flagged": [],
              "flagged_forecast_types": [], "flagged_thesis_types": [],
              "leading_error_categories_flagged": [], "error_defense_evidence": {}},
             {"calibration_haircut": 0}, "PASS", []),

            ("applied, haircut recorded and threaded into the scorer",
             ("Watchlist-heavy calibration", {}),
             {"status": "applied", "haircut_points": 8, "modules_flagged": ["business-model"],
              "flagged_forecast_types": [], "flagged_thesis_types": [],
              "leading_error_categories_flagged": [], "error_defense_evidence": {}},
             {"calibration_haircut": 8}, "PASS", []),

            ("applied, haircut recorded but NEVER reaches the scorer (the §18 dead-end)",
             ("Watchlist-heavy calibration", {}),
             {"status": "applied", "haircut_points": 8, "modules_flagged": ["business-model"],
              "flagged_forecast_types": [], "flagged_thesis_types": [],
              "leading_error_categories_flagged": [], "error_defense_evidence": {}},
             {"calibration_haircut": None}, "PROVISIONAL",
             ["calibration_haircut=None is not the numeric 8"]),

            ("applied but haircut_points is not the fixed 8-point constant",
             ("Watchlist-heavy calibration", {}),
             {"status": "applied", "haircut_points": 5, "modules_flagged": ["business-model"],
              "flagged_forecast_types": [], "flagged_thesis_types": [],
              "leading_error_categories_flagged": [], "error_defense_evidence": {}},
             {"calibration_haircut": 8}, "PROVISIONAL",
             ["haircut_points=5 is not the fixed 8-point constant"]),

            ("applied but nothing actually named as flagged",
             ("Watchlist-heavy calibration", {}),
             {"status": "applied", "haircut_points": 8, "modules_flagged": [],
              "flagged_forecast_types": [], "flagged_thesis_types": [],
              "leading_error_categories_flagged": [], "error_defense_evidence": {}},
             {"calibration_haircut": 8}, "PROVISIONAL",
             ["is a non-empty list — the haircut must be traceable"]),
        ]
        for index, (name, summary, calibration_feedback, confidence_inputs, verdict, diagnostics) in enumerate(cases):
            sandbox = os.path.join(tmp, f"case{index}")
            os.makedirs(sandbox, exist_ok=True)
            if summary is not None:
                verdict_str, etd = summary
                write_calib_summary(sandbox, verdict_str, etd)
            run_root = os.path.join(sandbox, "analyses", f"TEST_{PRE_CUTOFF_DATE}")
            write_fixture(run_root, calibration_feedback, confidence_inputs)
            output = run_block(block_path, sandbox, run_root)
            gates = [line for line in output.splitlines() if line.startswith("GATE:")]
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
        print(f"LIVE-GATE AG SELFTEST FAIL ({bad} case(s))")
        sys.exit(1)
    print("LIVE-GATE AG SELFTEST PASS — missing/mismatched calibration_feedback, an unthreaded "
          "confidence_inputs.calibration_haircut, and an untraceable 'applied' haircut all produce "
          "PROVISIONAL; a consistent calibration_feedback produces PASS, on a pre-AG_DATE rerun folder")


if __name__ == "__main__":
    main()
