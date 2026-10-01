#!/usr/bin/env python3
"""Live-gate regression for check AZ (§3 named-metric contradiction sweep) — CLAUDE.md §3.

This test executes the ACTUAL, unmodified Step 10B.2 finish-gate ("F30") Python
block extracted verbatim from `.claude/commands/research/full.md` against a
synthetic run folder, so it guards the live PRE-PUBLISH wiring — not just the
pure `eval_az_contradiction_sweep` function that `eval.py selftest` already
covers.

The gap this locks down: F30 previously stamped `final_thesis.md` PROVISIONAL
only when `verification_report.json` was missing, or its top-level `verdict`
was not `Clean`/`Minor issues`. A report that parsed fine and read verdict
`Clean` but never carried Section C3's `contradiction_checks[]` array at all —
an OMITTED §3 named-metric contradiction sweep, not a failed one — sailed
through unflagged and printed `GATE-VERIFY: PASS`. This test proves the live
block now also fails closed on that case, while a report that genuinely
carries the field (even an empty list — a pass, not a skipped section) still
clears.

The `_live_date` gating bug class this also guards (the same one the sibling
AA/AB/AG/AJ live-gate tests lock down): the live AZ call must gate on today's
execution date, NOT on the run's stored `decision_date`, so a rerun over a
pre-AZ_DATE (2026-08-21) folder still applies the check going forward.

Expected verdicts are pinned to CLAUDE.md §3 and
`.claude/commands/research/verify-evidence.md` Section C3 — never to current
code output.

Self-contained, fixture-free (temp sandbox only, never touches analyses/),
and exits nonzero on failure so CI fails loudly.
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

# A pre-AZ_DATE (2026-08-21) decision_date — the rerun-on-stale-date case. The live
# gate must still apply because it derives `_live_date` from today, not this field.
PRE_CUTOFF_DATE = "2026-06-01"


def extract_f30_block(md_text):
    """Return the Python body of the Step 10B.2 "F30" finish-gate heredoc from
    full.md — the `python3 - "<RUN_ROOT>" <<'PY' ... PY` block whose body prints
    `GATE-VERIFY:` (there are several same-shaped heredocs in this file; this one
    is identified by its own unique output marker, not by position)."""
    lines = md_text.splitlines()
    starts = [i + 1 for i, l in enumerate(lines)
              if l.strip().startswith('python3 - "<RUN_ROOT>" <<') and l.strip().endswith("'PY'")]
    if not starts:
        raise AssertionError("could not locate any `python3 - \"<RUN_ROOT>\" <<'PY'` block in full.md")
    for start in starts:
        end = None
        for j in range(start, len(lines)):
            if lines[j].strip() == "PY":
                end = j
                break
        if end is None:
            continue
        body = "\n".join(lines[start:end])
        if "GATE-VERIFY:" in body:
            return body
    raise AssertionError("no `python3 - \"<RUN_ROOT>\" <<'PY'` block in full.md prints GATE-VERIFY: "
                          "(Step 10B.2 F30 block may have moved or been renamed)")


def write_fixture(root, verification_report):
    """A pre-cutoff decision record + final_thesis.md (no pre-existing banner) plus the
    given verification_report.json (or omit the file entirely when None)."""
    os.makedirs(root, exist_ok=True)
    rec = {"ticker": "TEST", "decision_date": PRE_CUTOFF_DATE, "decision": "Watchlist"}
    with open(os.path.join(root, "decision_record.json"), "w", encoding="utf-8") as f:
        json.dump(rec, f)
    with open(os.path.join(root, "final_thesis.md"), "w", encoding="utf-8") as f:
        f.write("# Thesis\n\nSome content, no pre-existing banner.\n")
    if verification_report is not None:
        with open(os.path.join(root, "verification_report.json"), "w", encoding="utf-8") as f:
            if verification_report == "UNREADABLE":
                f.write("{not valid json")
            else:
                json.dump(verification_report, f)


def run_block(block_path, run_root):
    env = dict(os.environ)
    pythonpath = env.get("PYTHONPATH", "")
    # No trailing separator when PYTHONPATH is unset: an empty entry means the CWD on sys.path.
    env["PYTHONPATH"] = os.path.join(REPO_ROOT, "scripts") + (os.pathsep + pythonpath if pythonpath else "")
    proc = subprocess.run(
        [sys.executable, block_path, run_root],
        cwd=REPO_ROOT, capture_output=True, text=True, timeout=30, env=env,
    )
    if proc.returncode != 0:
        raise AssertionError(f"validator exited {proc.returncode}\nstdout:\n{proc.stdout}\nstderr:\n{proc.stderr}")
    return proc.stdout


def main():
    with open(FULL_MD, encoding="utf-8") as f:
        md = f.read()
    block = extract_f30_block(md)

    bad = 0

    # Static guard: the live AZ call must gate on _live_date, not ddte/decision_date — mirrors the
    # AA/AB/AG/AJ live-gate regressions. A silent revert would reintroduce the rerun-bypass.
    if not re.search(r"eval_az_contradiction_sweep\(\s*_live_date\s*,", block):
        bad += 1
        print("  [XX] full.md Step 10B.2 AZ call does NOT gate on `_live_date` "
              "(rerun on a pre-AZ_DATE folder would bypass the contradiction-sweep gate)")
    else:
        print("  [ok] full.md Step 10B.2 AZ call gates on `_live_date`")

    tmp = tempfile.mkdtemp(prefix="az_live_gate_")
    try:
        block_path = os.path.join(tmp, "step10b2.py")
        with open(block_path, "w", encoding="utf-8") as f:
            f.write(block)

        cases = [
            ("no verification_report.json at all", None, "PROVISIONAL",
             ["truth-integrity audit did NOT run"]),
            ("verdict Clean, contradiction_checks present (empty)",
             {"verdict": "Clean", "contradiction_checks": []}, "PASS", []),
            ("verdict Clean, contradiction_checks present (populated)",
             {"verdict": "Clean", "contradiction_checks": [{"verdict_word": "confirmed"}]}, "PASS", []),
            ("verdict Clean but Section C3 entirely omitted",
             {"verdict": "Clean"}, "PROVISIONAL",
             ["has no 'contradiction_checks' array", "Section C3", "was not run or was omitted"]),
            ("verdict Minor issues but Section C3 entirely omitted",
             {"verdict": "Minor issues"}, "PROVISIONAL",
             ["has no 'contradiction_checks' array"]),
            ("verdict Material issues AND Section C3 omitted (both reasons surface)",
             {"verdict": "Material issues"}, "PROVISIONAL",
             ["verify-evidence verdict = Material issues", "has no 'contradiction_checks' array"]),
            ("contradiction_checks is not a list", {"verdict": "Clean", "contradiction_checks": "none"},
             "PROVISIONAL", ["has no 'contradiction_checks' array"]),
            ("report is unreadable JSON", "UNREADABLE", "PROVISIONAL",
             ["verification_report.json unreadable"]),
        ]
        for index, (name, report, verdict, diagnostics) in enumerate(cases):
            run_root = os.path.join(tmp, f"case{index}", "TEST_" + PRE_CUTOFF_DATE)
            write_fixture(run_root, report)
            output = run_block(block_path, run_root)
            gates = [line for line in output.splitlines() if line.startswith("GATE-VERIFY:")]
            if (len(gates) == 1 and gates[0].startswith(f"GATE-VERIFY: {verdict} — " if verdict == "PROVISIONAL"
                                                          else f"GATE-VERIFY: {verdict}")
                    and all(message in gates[0] for message in diagnostics)):
                print(f"  [ok] {name} -> {verdict}")
            else:
                bad += 1
                print(f"  [XX] {name}: expected {verdict} with {diagnostics!r}. Got:\n{output}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    if bad:
        print(f"LIVE-GATE AZ SELFTEST FAIL ({bad} case(s))")
        sys.exit(1)
    print("LIVE-GATE AZ SELFTEST PASS — a verify-evidence report that omits Section C3's "
          "contradiction_checks[] now stamps PROVISIONAL even when its own verdict reads Clean/Minor")


if __name__ == "__main__":
    main()
