#!/usr/bin/env python3
"""Live-gate regression for checks AA/AB (§18/§13 module verdict-lock caps).

This test executes the ACTUAL, unmodified Step 10B.1 finish-gate Python block
extracted verbatim from `.claude/commands/research/full.md` against synthetic run
folders, so it guards the live PRE-PUBLISH wiring of AA/AB — not just the pure
`eval_aa_module_verdict_lock` / `eval_ab_bm_verdict_lock` / `extract_synthesis_verdict`
functions that `eval.py selftest` already covers. It locks down THREE PR#688-review fixes:

  1. (finding: "use the live date") The live AA/AB calls must gate on `_live_date`
     (today), NOT `ddte` (the run's stored decision_date). A standalone
     `/research:rerun` runs this exact block against an EXISTING folder whose
     decision_date stays pinned to its original YYYY-MM-DD (synthesizer.md), so a
     folder first created before AA/AB's 2026-06-23/24 landing date — re-run today
     over a freshly regenerated "Distress risk" / "Serious governance concerns" /
     "Low-quality business" verdict — would evaluate `ddte < AA_DATE` → N/A and ship
     a conviction rating with GATE: PASS. Gating on `_live_date` (always >= the
     landing date) closes that bypass; this test uses a PRE-landing-date folder, so
     the AA/AB violation can ONLY appear if the live call gates on `_live_date`.

  2. (finding: "accept fully bolded verdict lines") The MG / BM fixtures below use
     the fully-bolded `- **Verdict: <cat>**` rendering that 35+ committed syntheses
     emit (incl. INDIAMART_2026-08-22, DHER_2026-08-12). The cap must still fire
     through the live `extract_synthesis_verdict` call.

  3. (finding: "preserve forensic shorts") A `Short Candidate` built on the same
     governance/solvency evidence must NOT be capped (synthesizer.md governance
     verdict-lock: "the lock guards conviction longs"). The short controls assert the
     AA violation is absent. (AB deliberately still caps a short — different rationale
     — but AB is not exercised by the short control.)

Assertions check presence/absence of the AA/AB-SPECIFIC violation substrings in the
GATE line, so unrelated checks firing on the fixture never give a false result.
Expected behaviour is pinned to CLAUDE.md §18/§13 and synthesizer.md's governance
verdict-lock — never to current code output.

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

# A pre-AA_DATE/AB_DATE (2026-06-23/24) decision_date — the rerun-on-stale-date case.
# At this date the retrospective (ddte-gated) AA/AB are N/A; the live gate must still apply.
PRE_CUTOFF_DATE = "2026-06-01"

# AA/AB-specific violation substrings emitted by scripts/rating_caps.py.
AA_BSS_MSG = "BSS synthesis verdict contains 'Distress risk'"
AA_MG_MSG = "MG synthesis verdict contains 'Serious governance concerns'"
AB_BM_MSG = "BM synthesis verdict contains 'Low-quality business'"

# A final_thesis.md that passes the neighbouring structural live checks (Decision Audit
# Trail for AJ, a sign-check line), so the only thing under test is the AA/AB wiring.
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


def write_fixture(root, decision, bss_verdict=None, mg_verdict=None, bm_verdict=None):
    """Write a pre-cutoff record plus optional module syntheses carrying a verdict line.
    Module verdict lines use the fully-bolded `- **Verdict: <cat>**` form on purpose, so the
    test also exercises the broadened extract_synthesis_verdict regex in the live path."""
    os.makedirs(root, exist_ok=True)
    rec = {
        "ticker": "TEST", "decision_date": PRE_CUTOFF_DATE, "decision": decision,
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
    for mod, verdict in (("balance-sheet-survival", bss_verdict),
                         ("management-governance", mg_verdict),
                         ("business-model", bm_verdict)):
        if verdict is None:
            continue
        d = os.path.join(root, mod)
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, f"99_{mod}-synthesis.md"), "w", encoding="utf-8") as f:
            # fully-bolded rendering (colon AND value inside the bold span)
            f.write(f"## Verdict\n\n- **Verdict: {verdict}**\n")


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

    # Static guard: the live AA/AB calls must gate on _live_date, not ddte. A silent revert to
    # ddte reintroduces the rerun bypass even if an execution case happened to mask it.
    for name, pat in (("AA", r"eval_aa_module_verdict_lock\(\s*dec\s*,\s*_live_date\s*,"),
                      ("AB", r"eval_ab_bm_verdict_lock\(\s*dec\s*,\s*_live_date\s*,")):
        if re.search(pat, block):
            print(f"  [ok] full.md Step 10B.1 {name} call gates on `_live_date`")
        else:
            bad += 1
            print(f"  [XX] full.md Step 10B.1 {name} call does NOT gate on `_live_date` "
                  f"(a pre-landing-date rerun would bypass the §18/§13 verdict-lock cap)")

    # (decision, bss, mg, bm, substrings that MUST be in GATE line, substrings that must NOT be)
    cases = [
        # conviction long + each cap verdict (fully-bolded) on a PRE-cutoff folder → the cap must
        # fire live (proves both _live_date gating AND the fully-bolded-verdict regex).
        ("Buy, BSS distress", "Buy", "Distress risk", None, None, [AA_BSS_MSG], []),
        ("Buy, MG concerns (bolded)", "Buy", None, "Serious governance concerns", None, [AA_MG_MSG], []),
        ("Strong Buy, BM low-quality (bolded)", "Strong Buy", None, None,
         "Low-quality business — avoid deeper work", [AB_BM_MSG], []),
        # forensic short on the same evidence → AA must NOT fire (synthesizer.md governance lock).
        ("Short, MG concerns → exempt", "Short Candidate", None, "Serious governance concerns", None,
         [], [AA_MG_MSG]),
        ("Short, BSS distress → exempt", "Short Candidate", "Distress risk", None, None, [], [AA_BSS_MSG]),
        # non-conviction decision → neither cap fires.
        ("Watchlist, all cap verdicts", "Watchlist", "Distress risk", "Serious governance concerns",
         "Low-quality business", [], [AA_BSS_MSG, AA_MG_MSG, AB_BM_MSG]),
    ]

    tmp = tempfile.mkdtemp(prefix="aa_ab_live_gate_")
    try:
        block_path = os.path.join(tmp, "step10b1.py")
        with open(block_path, "w", encoding="utf-8") as f:
            f.write(block)
        for index, (name, decision, bss, mg, bm, must, mustnot) in enumerate(cases):
            run_root = os.path.join(tmp, f"case{index}", f"TEST_{PRE_CUTOFF_DATE}")
            write_fixture(run_root, decision, bss, mg, bm)
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
        print(f"LIVE-GATE AA/AB SELFTEST FAIL ({bad} case(s))")
        sys.exit(1)
    print("LIVE-GATE AA/AB SELFTEST PASS — on a pre-landing-date rerun folder the §18/§13 verdict-lock "
          "caps fire live on a conviction long (incl. fully-bolded verdict lines), and a forensic short "
          "is correctly exempt")


if __name__ == "__main__":
    main()
