#!/usr/bin/env python3
"""Live-gate regression for check AO (§19 / DECISION_LEDGER §6 forecast RESOLVABILITY).

This test executes the ACTUAL, unmodified Step 10B.1 finish-gate Python block extracted
verbatim from `.claude/commands/research/full.md` against synthetic run folders, so it
guards the live PRE-PUBLISH wiring of AO — not just the pure
`eval_ao_forecast_resolvability` function that `eval.py selftest` already exhaustively
covers (40 cases).

The gap this closes: check AO has graded committed runs retrospectively since its
2026-07-18 landing date, but — unlike AT/AU/AV/BC/BA/AM/AR, which were already moved into
`scripts/scenario_integrity_checks.py` and imported by the live gate — AO was still defined
ONLY inside `scripts/eval.py`. A `forecast_ledger[]` row with an unpinned "beats consensus"
trigger, identical confirmation/falsification text, or a ledger with zero near-term
(<=90-day) proof point could ship live, print `GATE: PASS`, and commit straight to `main`
(CLAUDE.md §25/§28), undetected until a later manual `/research:eval` run — the same "live
gate narrower than its retrospective eval.py twin" defect class already closed for BA/AM/AR
(and, in a different shape, for AQ). That silently starved the AG calibration-feedback
gate's own input: AG makes sure a computed haircut reaches the scorer, but nothing upstream
of it made sure the forecasts feeding that calibration were ever mechanically checkable in
the first place (§19: "a forecast that cannot be checked later is not a forecast").

The bug class this test specifically locks down (the same one review found in the sibling
AA/AB/AG/AQ live-gate blocks): the live AO call must gate on `_live_date` (today's execution
date), NOT `ddte` (the run's stored `decision_date`). A standalone `/research:rerun`
re-generates `forecast_ledger` fresh via the synthesizer, but the folder's `decision_date`
stays pinned to its original YYYY-MM-DD suffix (synthesizer.md) and never advances. Gating
on `ddte` would make this check permanently N/A for a rerun of any pre-AO_DATE
(2026-07-18) folder — exactly the hole the sibling checks close by using `_live_date`
instead. This test's fixtures use a pre-AO_DATE `decision_date` specifically to prove the
live gate still applies.

Expected verdicts are pinned to CLAUDE.md §19 and DECISION_LEDGER.md §6 — never to current
code output.

Self-contained, fixture-free (temp sandbox only, never touches analyses/), and exits
nonzero on failure so CI fails loudly.
"""
import os
import re
import sys
import json
import shutil
import datetime
import tempfile
import subprocess

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FULL_MD = os.path.join(REPO_ROOT, ".claude", "commands", "research", "full.md")

# A pre-AO_DATE (2026-07-18) decision_date — the rerun-on-stale-date case. At this date the
# retrospective (ddte-gated) AO is N/A; the live gate must still apply (via `_live_date`).
PRE_CUTOFF_DATE = "2026-06-01"

# The live gate's near-term/far-dated windows are measured against `datetime.date.today()`
# (the block does not accept an EVAL_TODAY override the way eval.py's AS/AW checks do), so
# these fixtures compute their `time_window`s relative to the REAL current date rather than
# a hardcoded month — a fixed month would silently drift from "near-term" to "stale" (or
# from "far" to "near-term") as real time passes and eventually make this test flaky/wrong.
_TODAY = datetime.date.today()
_NEAR_TERM_DATE = (_TODAY + datetime.timedelta(days=30)).isoformat()
_FAR_DATE = (_TODAY + datetime.timedelta(days=200)).isoformat()

# A near-term, mechanically resolvable forecast — the positive control.
FC_GOOD = {
    "confirmation_trigger": f"Q1 EBITDA margin prints at or above 12.3% by {_NEAR_TERM_DATE}",
    "falsification_trigger": f"Q1 EBITDA margin prints below 12.3% by {_NEAR_TERM_DATE}",
    "time_window": f"results due by {_NEAR_TERM_DATE}",
}
# A bare 'beats consensus' with no pinned number anywhere — check AO's core defect.
FC_BARE_CONSENSUS = {
    "confirmation_trigger": "FY27 EPS beats consensus",
    "falsification_trigger": "FY27 EPS misses consensus",
    "time_window": f"results due by {_NEAR_TERM_DATE}",
}
# Identical confirmation/falsification text — the outcome space is not partitioned.
FC_IDENTICAL = {
    "confirmation_trigger": "revenue grows",
    "falsification_trigger": "revenue grows",
    "time_window": f"results due by {_NEAR_TERM_DATE}",
}
# A single forecast, resolving well beyond 90 days — fails the near-term-proof-point quota.
FC_FAR = {
    "confirmation_trigger": f"FY28 revenue above $10bn by {_FAR_DATE}",
    "falsification_trigger": f"FY28 revenue at or below $10bn by {_FAR_DATE}",
    "time_window": f"by {_FAR_DATE}",
}


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


THESIS = (
    "# Thesis\n\n# PART II — CROSS-CUTTING ANALYSIS\n\n"
    "SIGN CHECK: bear return is negative, ok.\n\n## Decision Audit Trail\n\n"
    "| Decision Driver | Bull Evidence | Bear Evidence | Which Side Wins? | Why? |\n"
    "|---|---|---|---|---|\n"
    "| Valuation | cheap vs peers | priced for perfection | Bear | DCF below price |\n"
    "| Growth | demand up | mix headwind | Bull | volume compounding |\n"
    "| Solvency | net cash | equity funded | Bull | no near-term break |\n"
)


def write_fixture(root, forecast_ledger, decision_date=PRE_CUTOFF_DATE):
    """A pre-AO_DATE record that passes every OTHER live check (scenario math, §7/§11/§14
    caps, §24 rejector filters, Decision Audit Trail, sign-check, kill-criteria schema).
    Only forecast_ledger varies, so any GATE: PROVISIONAL in a test case is attributable
    to AO alone."""
    os.makedirs(root, exist_ok=True)
    rec = {
        "ticker": "TEST", "decision_date": decision_date, "decision": "Watchlist",
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
        # Satisfies the unrelated AG check (§18 Phase 6 calibration-feedback gate) with a clean
        # "no summary exists yet" status, so any GATE: PROVISIONAL in a test case below is
        # attributable to AO alone (mirrors test_live_gate_ag.py's own "no summary, status
        # not_available" passing case).
        "calibration_feedback": {"status": "not_available"},
    }
    if forecast_ledger is not None:
        rec["forecast_ledger"] = forecast_ledger
    with open(os.path.join(root, "decision_record.json"), "w", encoding="utf-8") as f:
        json.dump(rec, f)
    with open(os.path.join(root, "final_thesis.md"), "w", encoding="utf-8") as f:
        f.write(THESIS)


def run_block(block_path, sandbox, run_root):
    """Execute the extracted gate block exactly as full.md does, but with CWD set to a
    per-case sandbox (not the real repo) so `calibration_gate_checks.CALIB_SUMMARIES`'
    relative `analyses/performance/*_calibration_summary.json` glob only ever sees an empty
    directory — never the real repo's own committed calibration summaries, which would
    otherwise make the unrelated AG check fire and mask the AO-specific result under test
    (the same isolation `test_live_gate_ag.py` uses). `sys.path.insert(0, "scripts")` inside
    the block is then a no-op (no such relative dir under the sandbox); PYTHONPATH supplies
    the real scripts/ dir for `import rating_caps`/`scenario_integrity_checks`/etc instead."""
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

    # Static guard: the live AO call must gate on _live_date, not ddte. A silent revert to
    # ddte reintroduces the exact rerun-bypass AA/AB/AG/BB/BD/BE/AT/AU/AV/BC/BA/AM/AR already
    # guard against.
    if not re.search(r"eval_ao_forecast_resolvability\(\s*_live_date\s*,", block):
        bad += 1
        print("  [XX] full.md Step 10B.1 AO call does NOT gate on `_live_date` "
              "(rerun on a pre-AO_DATE folder would bypass the §19 forecast-resolvability check)")
    else:
        print("  [ok] full.md Step 10B.1 AO call gates on `_live_date`")

    tmp = tempfile.mkdtemp(prefix="ao_live_gate_")
    try:
        block_path = os.path.join(tmp, "step10b1.py")
        with open(block_path, "w", encoding="utf-8") as f:
            f.write(block)

        cases = [
            ("no forecast_ledger at all", None, "PASS", []),
            ("empty forecast_ledger (§19 permits it)", [], "PASS", []),
            ("a single pinned, near-term forecast", [FC_GOOD], "PASS", []),
            ("bare 'beats consensus', no pinned number anywhere",
             [FC_BARE_CONSENSUS], "PROVISIONAL", ["pins no number"]),
            ("identical confirmation/falsification triggers",
             [FC_IDENTICAL], "PROVISIONAL", ["outcome space is not partitioned"]),
            ("only a far-dated (>90d) forecast — no near-term proof point",
             [FC_FAR], "PROVISIONAL", ["insufficient near-term"]),
        ]
        for index, (name, forecast_ledger, verdict, diagnostics) in enumerate(cases):
            sandbox = os.path.join(tmp, f"case{index}")
            os.makedirs(sandbox, exist_ok=True)
            run_root = os.path.join(sandbox, "analyses", f"TEST_{PRE_CUTOFF_DATE}")
            write_fixture(run_root, forecast_ledger)
            output = run_block(block_path, sandbox, run_root)
            gates = [line for line in output.splitlines() if line.startswith("GATE:")]
            if (len(gates) == 1 and gates[0].startswith(f"GATE: {verdict} — ")
                    and all(message in gates[0] for message in diagnostics)):
                print(f"  [ok] pre-AO_DATE folder, {name} -> {verdict}")
            else:
                bad += 1
                print(f"  [XX] pre-AO_DATE folder, {name}: expected {verdict} "
                      f"with {diagnostics!r}. Got:\n{output}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    if bad:
        print(f"LIVE-GATE AO SELFTEST FAIL ({bad} case(s))")
        sys.exit(1)
    print("LIVE-GATE AO SELFTEST PASS — an unresolvable forecast_ledger (unpinned consensus "
          "reference, unpartitioned triggers, or no near-term proof point) produces "
          "PROVISIONAL; an absent/empty/resolvable ledger produces PASS, on a pre-AO_DATE "
          "rerun folder gated live via `_live_date`")


if __name__ == "__main__":
    main()
