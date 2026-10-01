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
  * if the harness produces no report for the change itself, the gate fails;
  * the report's suite-level sections (runs, valuation_summary_integrity.failures, source_contracts_s24,
    governance_flag_cap_correspondence.pass/failures) must be present and correctly typed, so a change that
    renames or drops one cannot hide a still-failing suite contract behind an unrelated inherited failure.

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
from eval_code_gate import SUITE, _require_trusted_shape, failure_keys, main, split, undecoded_suite_gates  # noqa: E402

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
check("a suite-level contract failure is keyed under (suite), one key per missing anchor",
      failure_keys(report({}, contracts=["CLAUDE.md"])) == {(SUITE, "framework contract: CLAUDE.md: x")})
check("suite_pass=False with nothing else named is never silently passed",
      failure_keys(report({}, suite_pass=False)) == {(SUITE, "suite_pass=False (unexplained by any known reader)")})
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


check("an AP failure is keyed by its check name AND its full violation text",
      failure_keys(dict(report({}), valuation_summary_integrity={"checked": 1, "failures": [
          {"run": "R_2026-09-01", "violations": ["bull level 100 < base level 120"]}]}))
      == {("R_2026-09-01", "AP_valuation_summary_integrity: bull level 100 < base level 120")})
_ap = lambda text: dict(report({}), valuation_summary_integrity={"checked": 1, "failures": [
    {"run": "R_2026-09-01", "violations": [text]}]})
new, inh = split(failure_keys(_ap("bull 100 is below base 120")), failure_keys(_ap("bull level 100 < base level 120")))
# Deliberately conservative (CLAUDE.md §3/§23): a failure is inherited only if the base has EXACTLY it. A change
# that rewords the message of a check a base run already fails gates — never the reverse, a hidden new failure.
check("a reworded AP diagnostic on an already-failing run gates (conservative: only an identical failure is inherited)",
      len(new) == 1 and not inh, sorted(new))

# An ADDITIONAL violation of a check the base ALREADY fails must gate — keying by check-name/file alone
# collapsed it into the base's key and read it as inherited, permitting further damage precisely while the
# check is red. The gate's own contract: "never weaker than the bare harness on anything this change touches
# … a check it adds or tightens that newly fails an existing run … all still fail it" (eval_code_gate.py
# module docstring); CLAUDE.md §2/§23/§28 forbid shortening the prompt-program, AGENTS.md L29. A pure reword
# (same COUNT) must still stay inherited — the two cases below pin both directions.
_contracts = lambda missing: dict(report({}), source_contracts_s24=[{"file": "CLAUDE.md", "status": "FAIL", "missing": missing}])
new, _ = split(failure_keys(_contracts(["§24 Filter 6 anchor", "§23 module-compat anchor"])),
               failure_keys(_contracts(["§24 Filter 6 anchor"])))
check("deleting an ADDITIONAL protected anchor from a file the base already fails is new (gates)",
      new == {(SUITE, "framework contract: CLAUDE.md: §23 module-compat anchor")}, sorted(new))
new, _ = split(failure_keys(_contracts(["§24 Filter 6 anchor"])),
               failure_keys(_contracts(["§24 Filter 6 anchor", "§23 module-compat anchor"])))
check("restoring one missing anchor while another stays missing is NOT over-gated (inherited)", not new, sorted(new))
_apN = lambda vs: dict(report({}), valuation_summary_integrity={"checked": 1, "failures": [
    {"run": "R_2026-09-01", "violations": vs}]})
new, _ = split(failure_keys(_apN(["bull 100 < base 120", "bear 90 > base 120 (a second, new defect)"])),
               failure_keys(_apN(["bull 100 < base 120"])))
check("an ADDITIONAL AP violation on a run the base already fails is new (gates)",
      new == {("R_2026-09-01", "AP_valuation_summary_integrity: bear 90 > base 120 (a second, new defect)")}, sorted(new))
new, _ = split(failure_keys(_apN(["reworded a", "reworded b"])), failure_keys(_apN(["orig a", "orig b"])))
check("two AP violations reworded (same count) on an already-failing run gate (only an identical failure is inherited)",
      len(new) == 2, sorted(new))

# Codex (#732): eval.py packs every violation of some checks into ONE detail string (S_haircut_propagated joins
# them with "; "), so a second violation on a run the base already fails changed only the text and was keyed
# identically. The full detail text is part of the identity, so it gates.
_S = lambda detail: report({"V_2026-09-23": {"pass": False, "warn_only": False, "decision": "Watchlist",
                                             "checks": [{"check": "S_haircut_propagated", "status": "FAIL", "detail": detail}]}})
new, inh = split(failure_keys(_S("score=42 != 37; pre_mortem_verdict mismatch (a second, new violation)")),
                 failure_keys(_S("score=42 != 37")))
check("a second violation packed into an already-failing check's single detail string gates", len(new) == 1 and not inh,
      sorted(new))
new, inh = split(failure_keys(_S("score=42 != 37")), failure_keys(_S("score=42  !=\n 37")))
check("an identical failure differing only in whitespace stays inherited", not new and len(inh) == 1, sorted(new))
new, inh = split(failure_keys(_S(f"missing {os.path.abspath('.')}/analyses/V/memo.md"), "."),
                 failure_keys(_S("missing /tmp/eval-code-gate-x/base/analyses/V/memo.md"), "/tmp/eval-code-gate-x/base"))
check("the same failure read from the base worktree and from the change matches (checkout path normalized)",
      not new and len(inh) == 1, sorted(new))
_dup = lambda n: report({"R_2026-09-01": {"pass": False, "warn_only": False, "decision": "Watchlist",
                                          "checks": [{"check": "Q", "status": "FAIL", "detail": "same"}] * n}})
new, _ = split(failure_keys(_dup(2)), failure_keys(_dup(1)))
check("an additional IDENTICAL failure is counted, so it gates", new == {("R_2026-09-01", "Q: same #2")}, sorted(new))

# Codex #732 (r4119535841): a real detail ending ' #2' must not collide with the synthetic 2nd-occurrence key.
_same = lambda details: report({"R_2026-09-01": {"pass": False, "warn_only": False, "decision": "Watchlist",
                                                 "checks": [{"check": "Q", "status": "FAIL", "detail": d} for d in details]}})
new, _ = split(failure_keys(_same(["same", "same #2"])), failure_keys(_same(["same", "same"])))
check("a distinct failure whose text ends ' #2' is not mistaken for the 2nd identical failure", len(new) == 1, sorted(new))

# Codex (#732): confirmed defect — an AP failure entry with a missing/falsy `run` hard-fails the suite in
# eval.py (apfailures -> False) but research_check.ap_failures() drops it (`if run:`), so it was invisible to
# every reader here. Worse, the old guard only added the generic `suite_pass=False` marker `if ... and not
# keys`, so whenever the base ALSO had some unrelated, already-explained failure (keys non-empty for a
# different reason), the unattributed AP failure silently read as fully inherited even though the base has no
# matching key for it at all — reproduced below, red before this fix, green after.
_unattributed_ap = lambda violations, other_runs=None: dict(
    report(other_runs or {}), valuation_summary_integrity={"checked": 1, "failures": [{"run": None, "violations": violations}]})
new, inh = split(failure_keys(_unattributed_ap(["a new suite defect"], {"V_2026-09-23": run_entry(["S_haircut_propagated"])})),
                 failure_keys(report({"V_2026-09-23": run_entry(["S_haircut_propagated"])})))
check("an unattributed AP failure (no run) gates even while an unrelated run is already failing on the base",
      new == {(SUITE, "AP_valuation_summary_integrity (no run): a new suite defect")} and len(inh) == 1, sorted(new))
new, inh = split(failure_keys(_unattributed_ap(["same defect"])), failure_keys(_unattributed_ap(["same defect"])))
check("an identical unattributed AP failure on base and change stays inherited", not new and len(inh) == 1, sorted(new))
check("an unattributed AP failure with no violations list still yields a key, never silently dropped",
      failure_keys(dict(report({}), valuation_summary_integrity={"checked": 1, "failures": [{"run": None}]}))
      == {(SUITE, "AP_valuation_summary_integrity (no run): (unattributed AP failure: no run and no violations recorded)")})

# Codex (#732, r4119535836): an ATTRIBUTED AP entry (run set) with an empty/missing `violations` list hard-fails
# the suite in eval.py (apfailures -> False), but research_check.ap_failures() maps it to [] so status_of() adds
# no AP key for it. Behind an inherited per-run failure on that SAME run — which already put the run's own key in
# `keys` and set `accounted` — the malformed entry surfaced nothing at all and read as fully inherited. It is now
# keyed under the run so it always gates; red before this fix, green after.
_attr_empty = dict(report({"V_2026-09-23": run_entry(["S_haircut_propagated"])}),
                   valuation_summary_integrity={"checked": 1, "failures": [{"run": "V_2026-09-23", "violations": []}]})
new, inh = split(failure_keys(_attr_empty), failure_keys(report({"V_2026-09-23": run_entry(["S_haircut_propagated"])})))
check("an attributed AP entry with empty violations gates even while that run already fails on the base",
      new == {("V_2026-09-23", "AP_valuation_summary_integrity (attributed, no violations recorded)")}, sorted(new))
new, inh = split(failure_keys(_attr_empty), failure_keys(_attr_empty))
check("an identical attributed-empty AP entry on base and change stays inherited", not new and len(inh) == 2, sorted(new))

# BF (scenario-basis coherence): eval.py fails the suite on any ENFORCED basis finding. Each enforced violation
# must be its own key, so a BF failure never hides behind an unrelated inherited failure; red before the BF
# reader existed (the enforced section was invisible), green after.
def _bf(enforced, runs=None):
    rep = report(runs if runs is not None else {"V_2026-09-23": run_entry(["S_haircut_propagated"])})
    rep["scenario_basis_coherence"] = {"checked": 1, "enforce_date": "2026-12-15", "enforced": enforced, "findings": []}
    rep["suite_pass"] = False
    return rep
_inherited_only = report({"V_2026-09-23": run_entry(["S_haircut_propagated"])})
new, inh = split(failure_keys(_bf([{"run": "NEW_2027-01-05", "violations": ["weighted cases mix earnings PERIODS"]}])),
                 failure_keys(_inherited_only))
check("an enforced BF failure gates even behind an inherited failure",
      new == {("NEW_2027-01-05", "BF_scenario_basis_coherence: weighted cases mix earnings PERIODS")}, sorted(new))
new, _ = split(failure_keys(_bf([{"run": "R", "violations": ["a", "b (a second, new BF violation)"]}])),
               failure_keys(_bf([{"run": "R", "violations": ["a"]}])))
check("an ADDITIONAL BF violation on a run the base already fails gates",
      new == {("R", "BF_scenario_basis_coherence: b (a second, new BF violation)")}, sorted(new))
new, inh = split(failure_keys(_bf([{"run": "R", "violations": ["a"]}])), failure_keys(_bf([{"run": "R", "violations": ["a"]}])))
check("an identical enforced BF violation on base and change stays inherited", not new and inh, sorted(new))
new, _ = split(failure_keys(_bf([{"run": "R", "violations": []}])), failure_keys(_inherited_only))
check("an enforced BF entry with no violations still gates", bool(new), sorted(new))
check("a base report with no BF section reads as no BF failures",
      failure_keys(_inherited_only) == {("V_2026-09-23", "S_haircut_propagated")})
check("a report-only BF section ('enforced': false, the first version of the check) is accepted and names nothing",
      _require_trusted_shape(dict(_inherited_only, scenario_basis_coherence={"checked": 3, "enforced": False, "findings": []})) is None
      and failure_keys(dict(_inherited_only, scenario_basis_coherence={"checked": 3, "enforced": False, "findings": []}))
      == failure_keys(_inherited_only))
for _bad in ({"enforced": "x"}, {"enforced": True}, {"enforced": [{"run": "R", "violations": "a"}]}, []):
    _rep = dict(_inherited_only, scenario_basis_coherence=_bad)
    try:
        _require_trusted_shape(_rep); _ok = False
    except RuntimeError:
        _ok = True
    check(f"a drifted scenario_basis_coherence section is refused ({str(_bad)[:40]})", _ok)

_repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
check("every way the real scripts/eval.py can fail the suite is one this gate can name",
      undecoded_suite_gates(_repo) == [], undecoded_suite_gates(_repo))


_d = tempfile.mkdtemp(prefix="gate-ast-")
os.makedirs(os.path.join(_d, "scripts"))
open(os.path.join(_d, "scripts", "eval.py"), "w").write("suite_pass = True\n")
check("a DELETED expected suite_pass write is caught (two-way comparison)",
      any("no longer present" in g for g in undecoded_suite_gates(_d)), undecoded_suite_gates(_d))
shutil.rmtree(_d, ignore_errors=True)

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
# inert stand-ins for every suite_pass write the real eval.py has (the gate compares them in both directions)
suite_pass = True
warn_only = run_pass = jmiss = azfails = apfailures = baenforced = False
if not warn_only:
    suite_pass = suite_pass and run_pass
try:
    pass
except Exception:
    suite_pass = False
if jmiss:
    suite_pass = False
if azfails:
    suite_pass = False
if apfailures:
    suite_pass = False
if baenforced:
    suite_pass = False
state = json.load(open("state.json"))
if state.get("crash"):
    sys.exit(3)
os.makedirs("analyses/eval", exist_ok=True)
json.dump(state["report"], open("analyses/eval/r.json", "w"))
print("WROTE analyses/eval/r.json")
if not state.get("no_complete"):
    print("EVAL COMPLETE")
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

rc, out = gate(root, {"report": BASE, "no_complete": True}, sha)
check("e2e: a head harness that wrote its report but never printed EVAL COMPLETE (crash after WROTE) is refused",
      rc == 2 and "EVAL COMPLETE" in out, out[-400:])
root5, sha5 = sandbox({"report": BASE, "no_complete": True})
rc, out = gate(root5, BASE_STATE, sha5)
check("e2e: a base that predates the sentinel is still usable (only the change must print it)",
      rc == 0 and "compared against base" in out, out[-400:])

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

# Codex (#732, finding 1): a code change that renames or drops a suite-level report SECTION while its contract
# still fails must never slip past the gate. _suite_contract_elements()/_unattributed_ap_failures() read each
# section with a benign default (`or {}` / `or []` / `.get("pass", True)`), so a renamed/absent one surfaces NO
# key — and stays invisible whenever an unrelated, already-inherited run failure has set `accounted`.
# run_harness now requires each such section to be present and correctly typed; a dropped/renamed one is refused
# (change -> exit 2, base -> strict). Each case below carries the inherited V_2026-09-23 failure, so the section
# is dropped BEHIND an already-explained failure — red on the pre-fix gate (rc 0: the hidden regression ships),
# green after (rc 2). Expected values are pinned to the gate's own contract ("a suite-level contract it breaks
# all still fail it", eval_code_gate.py docstring) and CLAUDE.md §28, never to current code behaviour.
_drop = lambda section: {k: v for k, v in report(dict(BASE["runs"])).items() if k != section}
for _section in ("governance_flag_cap_correspondence", "source_contracts_s24", "valuation_summary_integrity"):
    rc, out = gate(root, {"report": _drop(_section), "rc": 1}, sha)
    check(f"e2e: a report that drops/renames the {_section} section is refused, even behind an inherited failure",
          rc == 2 and _section in out, out[-400:])
# The section can be present but with the field the reader keys off renamed — its benign default ('pass' -> True)
# then reads it as passing. run_harness requires the field, so this is refused too.
rc, out = gate(root, {"report": dict(report(dict(BASE["runs"])),
                                     governance_flag_cap_correspondence={"passed": True, "failures": []}), "rc": 1}, sha)
check("e2e: renaming the governance-correspondence 'pass' field (whose default hides a failure) is refused",
      rc == 2 and "governance_flag_cap_correspondence" in out, out[-400:])

# Codex (#732, r4117769431): a section can be present and correctly TYPED at the top level while a malformed
# ENTRY still evades the reader with the suite failing — invisible behind the inherited V_2026-09-23 failure.
# run_harness now validates the nested fields each reader keys off (change -> exit 2, base -> strict). Each case
# carries the inherited V failure, so the malformed entry hides behind an already-explained one: red on the
# pre-fix gate (rc 0, the hidden regression ships), green after (rc 2). Pinned to the gate's contract ("a
# suite-level contract it breaks all still fail it") and CLAUDE.md §28, never to current behaviour.
rc, out = gate(root, {"report": dict(report(dict(BASE["runs"])),
                                     governance_flag_cap_correspondence={"pass": "false", "failures": ["AZ RF-NET mismatch"]}),
                      "rc": 1}, sha)
check("e2e: a governance-correspondence 'pass' that is a truthy non-boolean string is refused (would hide an AZ failure)",
      rc == 2 and "governance_flag_cap_correspondence" in out, out[-400:])
rc, out = gate(root, {"report": dict(report(dict(BASE["runs"])),
                                     source_contracts_s24=[{"file": "CLAUDE.md", "status": "ERROR", "missing": ["§24 anchor"]}]),
                      "rc": 1}, sha)
check("e2e: a source_contracts_s24 entry with a status renamed away from PASS/FAIL is refused (would hide a J failure)",
      rc == 2 and "source_contracts_s24" in out, out[-400:])

# Codex (#732, r4119535831): each run entry's `pass`/`warn_only` drive status_of() — a truthy NON-boolean (e.g.
# the string "false") reads the failing run as PASS/WARN and hides its FAIL, invisible behind the inherited
# V_2026-09-23 failure. run_harness now requires both to be booleans where present. Each case adds a genuinely
# failing run (O_integrity_gate) whose FAIL is masked by the retyped field — red on the pre-fix gate (rc 0, the
# hidden FAIL ships), refused after (rc 2). Pinned to the gate's contract ("a run it breaks ... still fails it")
# and CLAUDE.md §28, never to current behaviour.
def _bad_run_report(field, value):
    entry = {"pass": False, "warn_only": False, "decision": "Avoid",
             "checks": [{"check": "O_integrity_gate", "status": "FAIL"}]}
    entry[field] = value  # a truthy non-boolean makes status_of() read the run PASS (pass) / WARN (warn_only)
    rep = report(dict(BASE["runs"]))
    rep["runs"] = dict(BASE["runs"], **{"R_2026-09-10": entry})
    rep["suite_pass"] = False
    return rep
for _field in ("pass", "warn_only"):
    rc, out = gate(root, {"report": _bad_run_report(_field, "false"), "rc": 1}, sha)
    check(f"e2e: a run entry whose '{_field}' is a truthy non-boolean is refused (would hide a FAIL behind an inherited one)",
          rc == 2 and "runs" in out and _field in out, out[-400:])

# Codex (#732, r4119535836): an attributed AP entry (run set) with empty violations, behind the inherited
# V_2026-09-23 failure on that same run — red on the pre-fix gate (rc 0, the hard-fail hides), gates after (rc 1).
_attr_empty_e2e = dict(report({"V_2026-09-23": run_entry(["S_haircut_propagated"])}),
                       valuation_summary_integrity={"checked": 1, "failures": [{"run": "V_2026-09-23", "violations": []}]})
rc, out = gate(root, {"report": _attr_empty_e2e, "rc": 1}, sha)
check("e2e: an attributed AP entry with empty violations on an already-failing run gates (not hidden as inherited)",
      rc == 1 and "attributed, no violations recorded" in out, out[-400:])

rc, out = gate(root, {"report": report({"OK_2026-09-01": run_entry()})}, sha)
check("e2e: a clean corpus -> PASS", rc == 0, out[-400:])

print()
for _root in _sandboxes:
    shutil.rmtree(_root, ignore_errors=True)
if _fails:
    print(f"EVAL CODE GATE TESTS FAILED: {len(_fails)}")
    sys.exit(1)
print("All eval_code_gate tests passed.")
