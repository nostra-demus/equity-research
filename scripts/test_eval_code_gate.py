#!/usr/bin/env python3
"""
Tests for scripts/eval_code_gate.py — the code lane's eval gate.

What must hold (CLAUDE.md §28: research data is published straight to main and owned by research-check.yml;
code is gated by release CI — so a code change must be charged with what IT breaks, never with the corpus):
  * a failure already on the base does not fail the change, and is still reported;
  * a failure the change introduces fails it: a newly failing run, a new failing check on an already-failing
    run, a failing run the change adds, a suite-level contract the change breaks;
  * with no usable base (none, not a commit, or the base's harness crashed) the gate is STRICT — every failure
    gates, exactly as the bare `python3 scripts/eval.py all` did — so it is never weaker than before;
  * if the harness produces no report for the change itself, the gate fails.

The end-to-end cases drive the real main() — real `git worktree` on a throwaway repository — with a stand-in
scripts/eval.py that writes a report from a state file, so no committed research is read or written.

Run: python3 scripts/test_eval_code_gate.py   (exit 0 = all pass)
"""
import contextlib
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eval_code_gate import SUITE, failure_keys, main, split, undecoded_suite_gates  # noqa: E402

_fails = []


def check(name, cond, why=""):
    print(("  [ok] " if cond else "  [FAIL] ") + name + ("" if cond else f"  — {why}"))
    if not cond:
        _fails.append(name)


def run_entry(fails=(), warn_only=False):
    checks = [{"check": "A_structural", "status": "PASS"}] + [{"check": c, "status": "FAIL"} for c in fails]
    return {"pass": not fails, "warn_only": warn_only, "checks": checks, "decision": "Watchlist"}


def report(runs, contracts=(), suite_pass=None):
    rep = {"schema_version": "1.0", "runs": runs, "valuation_summary_integrity": {"checked": 0, "failures": []},
           "source_contracts_s24": [{"file": f, "status": "FAIL", "missing": ["x"]} for f in contracts],
           "governance_flag_cap_correspondence": {"pass": True, "failures": []}}
    rep["suite_pass"] = (not contracts and all(r["pass"] or r["warn_only"] for r in runs.values())
                         if suite_pass is None else suite_pass)
    return rep


# ---- pure: failure_keys / split -------------------------------------------------------------------------
BASE = report({"V_2026-09-23": run_entry(["S_haircut_propagated", "AY_fixture_integrity"]),
               "OK_2026-09-01": run_entry(),
               "OLD_2026-07-03": run_entry(["A_structural"], warn_only=True)})
check("a failing run yields one key per failing check",
      failure_keys(BASE) == {("V_2026-09-23", "S_haircut_propagated"), ("V_2026-09-23", "AY_fixture_integrity")})
check("a WARN run (superseded / no RUN_METADATA) is not a failure, as in eval.py",
      not any(run == "OLD_2026-07-03" for run, _ in failure_keys(BASE)))
check("a suite-level contract failure is keyed under (suite)",
      failure_keys(report({}, contracts=["CLAUDE.md"])) == {(SUITE, "framework contract: CLAUDE.md")})
check("suite_pass=False with nothing else named is never silently passed",
      failure_keys(report({}, suite_pass=False)) == {(SUITE, "suite_pass=False")})
new, inh = split(failure_keys(BASE), failure_keys(BASE))
check("the identical failure on base and change is inherited, not new", not new and len(inh) == 2)
head = dict(BASE["runs"], **{"OK_2026-09-01": run_entry(["O_integrity_gate"])})
new, _ = split(failure_keys(report(head)), failure_keys(BASE))
check("a run the change breaks is new", new == {("OK_2026-09-01", "O_integrity_gate")})
head = dict(BASE["runs"], **{"V_2026-09-23": run_entry(["S_haircut_propagated", "AY_fixture_integrity", "Z_new"])})
new, _ = split(failure_keys(report(head)), failure_keys(BASE))
check("a NEW failing check on an already-failing run is new", new == {("V_2026-09-23", "Z_new")})
new, inh = split(failure_keys(BASE), None)
check("no base -> strict: every failure is new", len(new) == 2 and not inh)


check("an AP failure is keyed by its check name, never its diagnostic text",
      failure_keys(dict(report({}), valuation_summary_integrity={"checked": 1, "failures": [
          {"run": "R_2026-09-01", "violations": ["bull level 100 < base level 120"]}]}))
      == {("R_2026-09-01", "AP_valuation_summary_integrity")})
_ap = lambda text: dict(report({}), valuation_summary_integrity={"checked": 1, "failures": [
    {"run": "R_2026-09-01", "violations": [text]}]})
new, inh = split(failure_keys(_ap("bull 100 is below base 120")), failure_keys(_ap("bull level 100 < base level 120")))
check("a reworded AP diagnostic on a run the base already fails is inherited, not new", not new and len(inh) == 1)
_repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
check("every way the real scripts/eval.py can fail the suite is one this gate can name",
      undecoded_suite_gates(_repo) == [], undecoded_suite_gates(_repo))


for label, body in (("augmented `suite_pass &= ok`", "suite_pass = True\nsuite_pass &= ok\n"),
                    ("walrus `(suite_pass := False)`", "suite_pass = True\n(suite_pass := False)\n"),
                    ("tuple target `suite_pass, x = False, 1`", "suite_pass = True\nsuite_pass, x = False, 1\n"),
                    ("`global suite_pass` in a function", "def f():\n    global suite_pass\n")):
    _d = tempfile.mkdtemp(prefix="gate-ast-")
    os.makedirs(os.path.join(_d, "scripts"))
    open(os.path.join(_d, "scripts", "eval.py"), "w").write(body)
    check(f"an unnamed write form to suite_pass is caught: {label}", undecoded_suite_gates(_d) != [],
          undecoded_suite_gates(_d))
    shutil.rmtree(_d, ignore_errors=True)


# ---- end to end: real main(), real git worktree, stand-in harness ---------------------------------------
FAKE_EVAL = r'''
import json, os, sys
state = json.load(open("state.json"))
if state.get("crash"):
    sys.exit(3)
os.makedirs("analyses/eval", exist_ok=True)
json.dump(state["report"], open("analyses/eval/r.json", "w"))
print("WROTE analyses/eval/r.json")
sys.exit(state["rc"] if "rc" in state else (0 if state["report"].get("suite_pass") else 1))
'''


def git(root, *args):
    return subprocess.run(["git", *args], cwd=root, capture_output=True, text=True, check=True).stdout.strip()


_sandboxes = []


def sandbox(base_state):
    root = tempfile.mkdtemp(prefix="gate-test-")
    _sandboxes.append(root)
    os.makedirs(os.path.join(root, "scripts"))
    open(os.path.join(root, "scripts", "eval.py"), "w").write(FAKE_EVAL)
    json.dump(base_state, open(os.path.join(root, "state.json"), "w"))
    git(root, "init", "-q")
    git(root, "-c", "user.email=t@t", "-c", "user.name=t", "add", "-A")
    git(root, "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-m", "base")
    return root, git(root, "rev-parse", "HEAD")


def gate(root, head_state, base):
    json.dump(head_state, open(os.path.join(root, "state.json"), "w"))
    out = io.StringIO()
    with contextlib.redirect_stdout(out):
        rc = main(["--base", base, "--root", root])
    return rc, out.getvalue()


BASE_STATE = {"report": BASE}

root, sha = sandbox(BASE_STATE)
rc, out = gate(root, BASE_STATE, sha)
check("e2e: the corpus failing only on what the base already fails -> PASS (the V_2026-09-23 case)",
      rc == 0 and "::warning::" in out and "V_2026-09-23" in out, out[-400:])
check("e2e: the base worktree is cleaned up", git(root, "worktree", "list").count("\n") == 0)

rc, out = gate(root, {"report": report(dict(BASE["runs"], **{"OK_2026-09-01": run_entry(["X_new"])}))}, sha)
check("e2e: a run the change breaks -> FAIL", rc == 1 and "OK_2026-09-01: X_new" in out, out[-400:])

rc, out = gate(root, {"report": report(dict(BASE["runs"], **{"NEW_2026-09-26": run_entry(["A_structural"])}))}, sha)
check("e2e: a failing run the change adds -> FAIL", rc == 1 and "NEW_2026-09-26" in out, out[-400:])

rc, out = gate(root, {"report": report(BASE["runs"], contracts=["CLAUDE.md"])}, sha)
check("e2e: a suite contract the change breaks -> FAIL", rc == 1 and "framework contract: CLAUDE.md" in out)

rc, out = gate(root, BASE_STATE, "none")
check("e2e: --base none is strict — a pre-existing failure still gates (the old behaviour)",
      rc == 1 and "strict" in out, out[-400:])

rc, out = gate(root, BASE_STATE, "0" * 40)
check("e2e: a base that is not a commit falls back to strict, never to pass", rc == 1 and "strict" in out)

rc, out = gate(root, {"crash": True}, sha)
check("e2e: no report for the change itself -> the gate fails", rc == 2, out[-400:])

root2, sha2 = sandbox({"crash": True})
rc, out = gate(root2, BASE_STATE, sha2)
check("e2e: the base's harness crashed -> strict, the inherited failure still gates", rc == 1 and "strict" in out)

root3, sha3 = sandbox(BASE_STATE)
open(os.path.join(root3, "scripts", "eval.py"), "a").write("\nif os.environ.get('X'):\n    suite_pass = False\n")
rc, out = gate(root3, BASE_STATE, sha3)
check("e2e: eval.py gains a suite failure the gate cannot name -> strict, the inherited failure still gates",
      rc == 1 and "cannot name" in out, out[-400:])

_no_verdict = {k: v for k, v in BASE.items() if k != "suite_pass"}
rc, out = gate(root, {"report": _no_verdict, "rc": 1}, sha)
check("e2e: a report with no boolean suite_pass is refused (fails), never read as 'nothing failed'",
      rc == 2 and "no boolean suite_pass" in out, out[-400:])
rc, out = gate(root, {"report": dict(BASE, suite_pass=True), "rc": 1}, sha)
check("e2e: a report whose suite_pass contradicts the harness exit status is refused",
      rc == 2 and "disagree" not in out and "but the harness exited 1" in out, out[-400:])
root4, sha4 = sandbox({"report": _no_verdict, "rc": 1})
rc, out = gate(root4, BASE_STATE, sha4)
check("e2e: an untrustworthy BASE report -> strict, the inherited failure still gates",
      rc == 1 and "strict" in out, out[-400:])

rc, out = gate(root, {"report": report({"OK_2026-09-01": run_entry()})}, sha)
check("e2e: a clean corpus -> PASS", rc == 0, out[-400:])

print()
for _root in _sandboxes:
    shutil.rmtree(_root, ignore_errors=True)
if _fails:
    print(f"EVAL CODE GATE TESTS FAILED: {len(_fails)}")
    sys.exit(1)
print("All eval_code_gate tests passed.")
