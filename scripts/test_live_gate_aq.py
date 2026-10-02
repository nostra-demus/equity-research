#!/usr/bin/env python3
"""Live-gate regression for check AQ (§13 cross-module forensic-mosaic conviction cap).

This test executes the ACTUAL, unmodified Step 10B.1 finish-gate Python block extracted
verbatim from `.claude/commands/research/full.md` against synthetic run folders, so it
guards the live PRE-PUBLISH wiring of AQ — not just the pure `eval_aq_forensic_mosaic_cap`
function that `eval.py selftest` already covers exhaustively.

It locks down two real gaps the live wiring had until this test was added (both found by
inspection, neither previously covered by any regression test):

  1. `business-model` was completely ABSENT from the live gate's `_aq_synth`/`_aq_spec`
     dicts — the live pre-publish check could never see RF-DISQ-001 (01_disqualifier-scan)
     or RF-RFS-001 (12_red-flags-sweep), even though synthesizer.md 4B and eval.py's own
     retrospective AQ block both document all FOUR owning modules. A run whose forensic
     mosaic only crossed the 3-tags/2-modules threshold because of a business-model tag
     shipped GATE: PASS live, undetected until a later manual `/research:eval`.

  2. `management-governance`'s RF-REG-002 has TWO possible source specialists — MODULE_
     RULES.md names `12_regulatory-legal-and-compliance` (not `06_candor-and-disclosure-
     quality`) as the actual owner of A7-01 (disclosure timeliness), and `12` fires
     RF-REG-002 from its own compliance-hygiene sweep independently of `06`'s candor read
     — but the live gate (and eval.py's retrospective check) read ONLY `06`'s specialist
     text. A delayed-disclosure finding caught solely by the dedicated compliance
     specialist could never reach the mosaic cap.

Both are fixed by concatenating the relevant specialists' text before handing it to
`eval_aq_forensic_mosaic_cap`, mirroring the `01_`+`12_` business-model concatenation
pattern that already existed for RF-DISQ-001/RF-RFS-001 (rating_caps.py FORENSIC_TAGS note).

Assertions check presence/absence of the AQ-specific violation substrings (the fired tag
names) in the GATE line, so unrelated checks firing on the fixture never give a false
result. Expected behaviour is pinned to CLAUDE.md §13 and synthesizer.md's Pre-Write Gate
step 4B — never to current code output.

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

# A decision_date on/after AQ_DATE (2026-07-24, scripts/rating_caps.py) so the live gate
# actually applies the check instead of returning N/A.
DECISION_DATE = "2026-08-01"

EQ_SPEC_BOTH = ("Earnings-quality specialist.\n"
                "RF-EQ-001 (rising accruals divergent from cash earnings)\n"
                "RF-EQ-002 (cash-conversion breakdown)\n")
BM_SPEC_DISQ = ("Disqualifier-scan specialist.\n"
                "RF-DISQ-001 (multiple sub-threshold disqualifier near-misses)\n")
MG_SPEC_REG2 = ("Regulatory-legal-and-compliance specialist.\n"
                "RF-REG-002 (delayed results / material-disclosure timeliness)\n")

# A final_thesis.md that passes the neighbouring structural live checks (Decision Audit
# Trail for AJ, a sign-check line), so the only thing under test is the AQ wiring —
# same skeleton as test_live_gate_aa_ab.py.
THESIS = (
    "# Thesis\n\n# PART II — CROSS-CUTTING ANALYSIS\n\n"
    "SIGN CHECK: bear return is negative, ok.\n\n## Decision Audit Trail\n\n"
    "| Decision Driver | Bull Evidence | Bear Evidence | Which Side Wins? | Why? |\n"
    "|---|---|---|---|---|\n"
    "| Valuation | cheap vs peers | priced for perfection | Bear | DCF below price |\n"
    "| Growth | demand up | mix headwind | Bull | volume compounding |\n"
    "| Solvency | net cash | equity funded | Bull | no near-term break |\n"
)


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


def write_fixture(root, decision, decision_date=DECISION_DATE,
                   earnings_spec06=None,
                   mg_synth=None, mg_spec06=None, mg_spec12=None,
                   bm_synth=None, bm_spec01=None, bm_spec12=None):
    os.makedirs(root, exist_ok=True)
    rec = {
        "ticker": "TEST", "decision_date": decision_date, "decision": decision,
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
    }
    with open(os.path.join(root, "decision_record.json"), "w", encoding="utf-8") as f:
        json.dump(rec, f)
    with open(os.path.join(root, "final_thesis.md"), "w", encoding="utf-8") as f:
        f.write(THESIS)

    def _w(mod, fname, text):
        if text is None:
            return
        d = os.path.join(root, mod)
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, fname), "w", encoding="utf-8") as f:
            f.write(text)

    _w("earnings", "06_earnings-quality.md", earnings_spec06)
    _w("management-governance", "99_management-governance-synthesis.md", mg_synth)
    _w("management-governance", "06_candor-and-disclosure-quality.md", mg_spec06)
    _w("management-governance", "12_regulatory-legal-and-compliance.md", mg_spec12)
    _w("business-model", "99_business-model-synthesis.md", bm_synth)
    _w("business-model", "01_disqualifier-scan.md", bm_spec01)
    _w("business-model", "12_red-flags-sweep.md", bm_spec12)


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

    # Static guards: a silent revert of either fix must fail CI even if some execution case
    # happened not to exercise it. Mirrors test_live_gate_aa_ab.py's `_live_date` static guard.
    guards = [
        ("business-model wired into _aq_synth", r'"business-model"\s*:\s*_bm_txt'),
        ("business-model wired into _aq_spec (combined 01_/12_)",
         r'"business-model"\s*:\s*_bm_spec_combined_aq'),
        ("management-governance _aq_spec reads the combined 06_/12_ text",
         r'"management-governance"\s*:\s*_mg_spec_combined_aq'),
        ("business-model 01_ specialist read for AQ", r'_bm_disq_spec_aq\s*=\s*_read_orb\("business-model",\s*"01_\*\.md"\)'),
        ("business-model 12_ specialist read for AQ", r'_bm_rfs_spec_aq\s*=\s*_read_orb\("business-model",\s*"12_\*\.md"\)'),
        ("management-governance 06_ specialist read for AQ", r'_mg_candor_spec_aq\s*=\s*_read_orb\("management-governance",\s*"06_\*\.md"\)'),
        ("management-governance 12_ specialist read for AQ", r'_mg_reg_spec_aq\s*=\s*_read_orb\("management-governance",\s*"12_\*\.md"\)'),
    ]
    for label, pat in guards:
        if re.search(pat, block):
            print(f"  [ok] full.md Step 10B.1 AQ block: {label}")
        else:
            bad += 1
            print(f"  [XX] full.md Step 10B.1 AQ block: {label} — NOT FOUND "
                  "(the live AQ gate has regressed to a narrower module/specialist set than its own eval.py twin)")

    RF_DISQ = "RF-DISQ-001"
    RF_REG2 = "RF-REG-002"
    AQ_FIRE_MARKER = "distinct forensic tags fired across"

    # (name, decision, fixture kwargs, substrings that MUST be in GATE line, substrings that must NOT be)
    cases = [
        # Control: earnings alone (2 tags, 1 module) — below the 2-module threshold regardless
        # of business-model/MG wiring. Proves the harness/fixture itself doesn't over-fire.
        ("earnings alone, below module threshold", "Buy",
         dict(earnings_spec06=EQ_SPEC_BOTH),
         [], [AQ_FIRE_MARKER]),
        # THE business-model fix: earnings' 2 tags + business-model's RF-DISQ-001 fired ONLY in
        # the 01_ specialist (synthesis clean/absent) = 3 distinct tags across 2 modules → must
        # fire. Before the fix business-model was never read at all → this case would pass
        # (falsely) live.
        ("business-model RF-DISQ-001 (01_ specialist only) crosses the mosaic threshold", "Buy",
         dict(earnings_spec06=EQ_SPEC_BOTH, bm_spec01=BM_SPEC_DISQ),
         [RF_DISQ, AQ_FIRE_MARKER], []),
        # THE management-governance 12_ fix: earnings' 2 tags + RF-REG-002 fired ONLY in the 12_
        # specialist (06_ clean/absent, synthesis clean/absent) = 3 distinct tags across 2 modules
        # → must fire. Before the fix only 06_'s text was read → this case would pass (falsely).
        ("management-governance RF-REG-002 (12_ specialist only) crosses the mosaic threshold", "Buy",
         dict(earnings_spec06=EQ_SPEC_BOTH, mg_spec12=MG_SPEC_REG2),
         [RF_REG2, AQ_FIRE_MARKER], []),
        # At/below the "Starter Position Only" ceiling: the mosaic still fires internally but the
        # cap is satisfied (no violation), even with the business-model tag included.
        ("mosaic met but decision at the ceiling → no violation", "Starter Position Only",
         dict(earnings_spec06=EQ_SPEC_BOTH, bm_spec01=BM_SPEC_DISQ),
         [], [AQ_FIRE_MARKER]),
        # Pre-AQ_DATE decision_date → N/A regardless of how many tags would otherwise fire.
        ("pre-AQ_DATE decision_date → N/A", "Buy",
         dict(earnings_spec06=EQ_SPEC_BOTH, bm_spec01=BM_SPEC_DISQ, decision_date="2026-06-01"),
         [], [AQ_FIRE_MARKER]),
    ]

    tmp = tempfile.mkdtemp(prefix="aq_live_gate_")
    try:
        block_path = os.path.join(tmp, "step10b1.py")
        with open(block_path, "w", encoding="utf-8") as f:
            f.write(block)
        for index, (name, decision, fkwargs, must, mustnot) in enumerate(cases):
            decision_date = fkwargs.pop("decision_date", DECISION_DATE)
            run_root = os.path.join(tmp, f"case{index}", f"TEST_{decision_date}")
            write_fixture(run_root, decision, decision_date=decision_date, **fkwargs)
            gl = gate_line(run_block(block_path, run_root))
            ok = bool(gl) and all(m in gl for m in must) and all(m not in gl for m in mustnot)
            if ok:
                print(f"  [ok] {name}")
            else:
                bad += 1
                print(f"  [XX] {name}: expected present={must!r} absent={mustnot!r}\n"
                      f"       GATE: {gl!r}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    if bad:
        print(f"LIVE-GATE AQ SELFTEST FAIL ({bad} case(s))")
        sys.exit(1)
    print("LIVE-GATE AQ SELFTEST PASS — the live §13 forensic-mosaic gate reads all four owning "
          "modules (including business-model) and management-governance's two RF-REG-002 source "
          "specialists (06_ and 12_), matching its own eval.py twin and synthesizer.md 4B")


if __name__ == "__main__":
    main()
