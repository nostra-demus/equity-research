#!/usr/bin/env python3
"""
The code lane's eval gate: fail a code change for the eval failures IT introduces, not for the corpus.

`python3 scripts/eval.py all` scores every committed research run. Research lands on `main` straight from the
engine (scripts/commit-run.sh), so a run that fails its contract checks is already on the base before any code
PR is opened — and running the bare harness in ci.yml charged that failure to every unrelated code PR until
the research was fixed (AKAM_2026-09-14 blocked three PRs on 2026-09-15; V_2026-09-23 blocked five on
2026-09-26). A failing run is owned by .github/workflows/research-check.yml, which opens one issue per failing
run as it lands and closes it when the run passes again.

This gate runs the same harness twice — on the change (the working tree) and on the exact base it merges onto
(a detached worktree) — and compares the failures, each identified by (run, check, full detail text):

  * a failure on the change that the base does not have            -> NEW, gates (exit 1)
  * a failure the base already has, word for word                   -> INHERITED, reported, does not gate
  * no usable base (none given, not a commit, or its eval crashed)  -> STRICT: every failure gates, exactly
                                                                       as the bare `eval.py all` did

So the gate is never weaker than the bare harness on anything this change touches: a run it breaks, a check it
adds or tightens that newly fails an existing run, a failing run it adds, or a suite-level contract it breaks
all still fail it. What it stops doing is failing a change for someone else's research.

  python3 scripts/eval_code_gate.py --base <BASE_SHA>   # compare against the base
  python3 scripts/eval_code_gate.py --base none         # strict (no base to compare against)
"""
from __future__ import annotations

import argparse
import ast
import collections
import json
import os
import shutil
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from research_check import ap_failures, status_of  # noqa: E402

SUITE = "(suite)"

# Every statement by which scripts/eval.py sets suite_pass, keyed "<controlling test> -> <assigned value>", and
# the reader above that names the failure it records. The comparison below is only sound if every way the
# harness can fail the suite is named: an unnamed one would hide behind any failure the base already has
# (suite_pass is a single bool). So if eval.py grows a site not listed here, the gate goes strict until this
# list and the readers learn it.
DECODED_SUITE_GATES = collections.Counter({
    "Module -> True": 1,                                    # the initial value
    "not warn_only -> suite_pass and run_pass": 1,          # a gating run             -> status_of()
    "ExceptHandler -> False": 1, "jmiss -> False": 1,       # §24 framework contracts -> suite_contract_failures()
    "azfails -> False": 1,                                  # AZ                      -> suite_contract_failures()
    "apfailures -> False": 1,                               # AP                      -> ap_failures()/status_of()
})


def undecoded_suite_gates(root="."):
    """suite_pass assignments in <root>/scripts/eval.py that this gate does not know how to name."""
    try:
        tree = ast.parse(open(os.path.join(root, "scripts", "eval.py"), encoding="utf-8").read())
    except (OSError, SyntaxError) as error:
        return [f"scripts/eval.py could not be parsed ({error})"]
    parent = {child: node for node in ast.walk(tree) for child in ast.iter_child_nodes(node)}
    found = collections.Counter()
    # Every write of the name, in any form (=, &=, :=, a tuple target, a for/with/except target, del, global).
    # Only a plain `suite_pass = <value>` is matched against the known list; any other form is unnamed -> strict.
    for node in ast.walk(tree):
        if isinstance(node, ast.Global) and "suite_pass" in node.names:
            found[f"global suite_pass (line {node.lineno})"] += 1
        if not (isinstance(node, ast.Name) and node.id == "suite_pass" and isinstance(node.ctx, (ast.Store, ast.Del))):
            continue
        stmt = parent.get(node)
        if isinstance(stmt, ast.Assign) and len(stmt.targets) == 1 and stmt.targets[0] is node:
            up = parent.get(stmt)
            context = ast.unparse(up.test) if isinstance(up, ast.If) else type(up).__name__
            found[f"{context} -> {ast.unparse(stmt.value)}"] += 1
        else:
            found[f"{type(stmt).__name__} write to suite_pass (line {node.lineno})"] += 1
    # Both directions: an extra write is one this gate cannot name, and a DELETED expected write (e.g. dropping
    # `suite_pass = suite_pass and run_pass`) means eval.py no longer fails the suite on that condition, so the
    # exit status stops vouching for the comparison (Codex #732, r4117707224).
    return sorted((found - DECODED_SUITE_GATES).elements()) + \
        [f"expected suite_pass write no longer present: {gate}" for gate in sorted((DECODED_SUITE_GATES - found).elements())]


def _require_trusted_shape(report):
    """Refuse a report whose suite-level sections failure_keys() reads are missing or the wrong type.

    eval.py always emits `runs`, `valuation_summary_integrity` (with a `failures` list), `source_contracts_s24`
    (a list) and `governance_flag_cap_correspondence` (with a `pass` flag and a `failures` list) — see its report
    dict. failure_keys()/_suite_contract_elements()/_unattributed_ap_failures() read each with a benign default
    (`or {}` / `or []` / `.get("pass", True)`), so a code change that renames or drops one of these sections
    while its contract STILL fails would surface no key at all — invisible whenever an unrelated inherited
    failure had already set `accounted` (Codex #732, finding 1). A missing, wrong-typed, or field-renamed
    section therefore raises here, exactly as a bad suite_pass does: on the change it becomes exit 2, on the
    base it forces strict — never a silently-hidden regression.
    """
    def bad(what):
        raise RuntimeError(f"the eval report's {what}; failure_keys() reads it to detect a suite-level failure, "
                           f"so a renamed or dropped section could hide a real regression behind an inherited one")
    if not isinstance(report.get("runs"), dict):
        bad(f"'runs' section is missing or not an object (got {type(report.get('runs')).__name__})")
    vsi = report.get("valuation_summary_integrity")
    if not isinstance(vsi, dict) or not isinstance(vsi.get("failures"), list):
        bad("'valuation_summary_integrity' section is missing, not an object, or lacks its 'failures' list")
    if not isinstance(report.get("source_contracts_s24"), list):
        bad(f"'source_contracts_s24' section is missing or not a list (got {type(report.get('source_contracts_s24')).__name__})")
    az = report.get("governance_flag_cap_correspondence")
    if not isinstance(az, dict) or "pass" not in az or not isinstance(az.get("failures"), list):
        bad("'governance_flag_cap_correspondence' section is missing, not an object, or lacks its 'pass'/'failures' fields")
    # Nested-field validation (Codex #732, r4117769431): the top-level shape checks above still let a malformed
    # ENTRY evade the readers while the suite fails, invisibly whenever an unrelated inherited failure has already
    # set `accounted`. Each field the readers actually match on is validated, so any drift raises here (change ->
    # exit 2, base -> strict) instead of hiding a real regression:
    #   * `pass` a truthy NON-bool (e.g. the string "false") makes `not az.get("pass", True)` False, hiding an AZ
    #     failure (_suite_contract_elements);
    #   * a source_contracts_s24 entry whose `status` is renamed/retyped away from PASS/FAIL (e.g. "ERROR") makes
    #     `_suite_contract_elements` skip a failing framework contract — eval.py only ever emits PASS/FAIL there
    #     (jchecks, scripts/eval.py);
    #   * a non-dict valuation_summary_integrity failure entry makes `_unattributed_ap_failures`'s `.get()` reads
    #     silently no-op.
    if not isinstance(az.get("pass"), bool):
        bad(f"'governance_flag_cap_correspondence.pass' is not a boolean (got {type(az.get('pass')).__name__}) — a "
            "truthy non-boolean would read as passing and hide an AZ correspondence failure")
    for i, entry in enumerate(report["source_contracts_s24"]):
        if not isinstance(entry, dict):
            bad(f"'source_contracts_s24[{i}]' is not an object (got {type(entry).__name__})")
        if entry.get("status") not in ("PASS", "FAIL"):
            bad(f"'source_contracts_s24[{i}].status' is {entry.get('status')!r}, not PASS/FAIL — a renamed status "
                "would make a failing framework contract invisible to _suite_contract_elements")
        if "missing" in entry and not isinstance(entry["missing"], list):
            bad(f"'source_contracts_s24[{i}].missing' is not a list (got {type(entry['missing']).__name__})")
    for i, entry in enumerate(vsi["failures"]):
        if not isinstance(entry, dict):
            bad(f"'valuation_summary_integrity.failures[{i}]' is not an object (got {type(entry).__name__})")
    # Codex #732 (r4119535831): each run entry's `pass`/`warn_only` drive status_of() — `entry.get("warn_only")`
    # truthy reads the run WARN, `entry.get("pass")` truthy reads it PASS. A truthy NON-boolean (e.g. the string
    # "false") therefore reads a failing run as passing/warned and hides its FAIL, invisible behind an inherited
    # failure on another run. Require both to be booleans WHERE PRESENT — absence is already the safe fail
    # direction (a missing `pass` reads FAIL, a missing `warn_only` reads not-WARN), so a retyped field raises
    # here (change -> exit 2, base -> strict) instead of hiding a regression. eval.py always emits real booleans.
    for name, entry in report["runs"].items():
        if not isinstance(entry, dict):
            bad(f"'runs[{name!r}]' is not an object (got {type(entry).__name__})")
        for field in ("pass", "warn_only"):
            if field in entry and not isinstance(entry[field], bool):
                bad(f"'runs[{name!r}].{field}' is {entry[field]!r}, not a boolean — a truthy non-boolean would make "
                    f"status_of() read the run as {'PASS' if field == 'pass' else 'WARN'} and hide a FAIL")
        if "checks" in entry and not isinstance(entry["checks"], list):
            bad(f"'runs[{name!r}].checks' is not a list (got {type(entry['checks']).__name__})")


def run_harness(root=".", quiet=False, require_complete=True):
    """Run `scripts/eval.py all` in root and return its report, refusing one that cannot be trusted.

    The report must carry a boolean suite_pass that agrees with the harness's own exit status (eval.py exits
    0 exactly when suite_pass is true). A missing, non-boolean, or contradicting suite_pass raises: the key
    comparison is only sound on a report whose overall verdict is known. The suite-level sections
    failure_keys() reads must likewise be present and correctly typed (_require_trusted_shape).

    With require_complete (the change under test), the harness must also print eval.py's `EVAL COMPLETE`
    sentinel AFTER its `WROTE` line: an uncaught exception after the report is written also exits 1, which
    would otherwise read as a normal failing-suite exit (Codex #732, r4117707230). The base is exempt: it is
    the already-merged commit and may predate the sentinel, and a base that crashes only loses inherited keys.
    """
    result = subprocess.run([sys.executable, "scripts/eval.py", "all"], cwd=root, capture_output=True, text=True)
    if not quiet:
        sys.stdout.write(result.stdout)
        sys.stderr.write(result.stderr)
    wrote = [line for line in result.stdout.splitlines() if line.startswith("WROTE ")]
    if not wrote:
        raise RuntimeError(f"the eval harness wrote no report (exit {result.returncode})")
    if require_complete:
        lines = result.stdout.splitlines()
        last_wrote = max(i for i, line in enumerate(lines) if line.startswith("WROTE "))
        if "EVAL COMPLETE" not in lines[last_wrote + 1:]:
            raise RuntimeError("the eval harness wrote its report but never printed EVAL COMPLETE (crashed after "
                               f"writing it? exit {result.returncode})")
    with open(os.path.join(root, wrote[-1][len("WROTE "):].strip()), encoding="utf-8") as handle:
        report = json.load(handle)
    verdict = report.get("suite_pass")
    if not isinstance(verdict, bool):
        raise RuntimeError(f"the eval report has no boolean suite_pass (got {verdict!r})")
    if verdict != (result.returncode == 0):
        raise RuntimeError(f"the eval report says suite_pass={verdict} but the harness exited {result.returncode}")
    _require_trusted_shape(report)
    return report

def _tag(ident, n):
    """The n-th identical repeat of an identity. Literal '#' in the diagnostic text is escaped first, so a real
    detail that happens to end ' #2' can never collide with the synthetic second-occurrence key (Codex #732,
    r4119535841)."""
    ident = ident.replace("#", "\\#")
    return ident if n == 1 else f"{ident} #{n}"


def _identity(check, detail, root):
    """One failure's identity: its check name plus its FULL detail text (whitespace-normalized, and the checkout's
    absolute path replaced by <root> so the same failure read from the base worktree and from the change matches)."""
    text = " ".join(str(detail or "").split())
    for prefix in {os.path.abspath(root), os.path.realpath(root)}:
        text = text.replace(prefix, "<root>")
    return f"{check}: {text}" if text else check


def failure_keys(report, root="."):
    """Every hard failure in an eval report as (run, identity) pairs; suite-level failures use run '(suite)'.

    Reads the report exactly as research_check.py does (status_of / ap_failures), so a WARN run (superseded, or no
    RUN_METADATA) is not a failure here either, and an AP violation is.

    The identity is the check name PLUS its full detail text, and identical repeats are counted (#2, #3, ...).
    A failure is inherited only if the base has exactly the same one. Keying by check name alone — or per
    occurrence, or per anchor — let a change make an already-red check fail WORSE and read as inherited: eval.py
    packs every violation of some checks into ONE detail string (e.g. S_haircut_propagated joins them with
    "; "), so a second violation changes only the text. Comparing the text closes that for every check at once.
    The deliberate cost: a change that rewords the message of a check a run on the base already fails gates too
    — the conservative side (CLAUDE.md §3/§23), never a hidden failure.

    `accounted` tracks whether we found a structurally-recognized cause for suite_pass=False, independent of
    whether `keys` happens to be empty. Codex (#732): the previous guard only added the generic `suite_pass=False`
    marker `if ... and not keys`, so a real cause our readers cannot name (e.g. an AP entry with no `run` — see
    `_unattributed_ap_failures` — hard-fails the suite in eval.py but `ap_failures()` drops it) stayed invisible
    whenever an UNRELATED, already-explained failure had already put something else in `keys`. Gating on
    `accounted` instead means an unexplained cause is always surfaced, whether or not another cause is present.
    """
    keys = set()
    accounted = False
    runs = report.get("runs") or {}
    for run in set(runs.keys()) | set(ap_failures(report).keys()):
        status, fails = status_of(report, run, root)
        if status != "FAIL":
            continue
        accounted = True
        details = collections.defaultdict(list)
        for entry in (runs.get(run) or {}).get("checks") or []:
            if entry.get("status") == "FAIL":
                details[entry.get("check")].append(entry.get("detail"))
        seen = collections.Counter()
        for failure in (fails or ["FAIL"]):
            name, sep, text = failure.partition(":")
            name = name.strip()
            if sep:                                   # AP: "AP_valuation_summary_integrity: <violation>"
                ident = _identity(name, text, root)
            elif details.get(name):                   # a per-run check: its detail lives in the run's checks
                ident = _identity(name, details[name].pop(0), root)
            else:
                ident = name
            seen[ident] += 1
            keys.add((run, _tag(ident, seen[ident])))
    # Raw AP violation entries with no (or a falsy) `run`: ap_failures() drops these entirely (`if run:`), so
    # the per-run loop above never sees them — even though eval.py hard-fails the whole suite on their presence.
    # Keyed under (suite) so an entry like this can never hide behind an unrelated already-explained failure.
    unattributed = _unattributed_ap_failures(report, root)
    if unattributed:
        accounted = True
        keys |= unattributed
    # Suite-level contract failures: one identity per missing anchor / per AZ correspondence failure (see
    # _suite_contract_elements), so deleting an ADDITIONAL protected anchor from a file the base already fails
    # gates, while restoring one anchor as another stays missing does not over-gate.
    elements = _suite_contract_elements(report)
    if elements:
        accounted = True
    seen = collections.Counter()
    for element in elements:
        ident = " ".join(element.split())
        seen[ident] += 1
        keys.add((SUITE, _tag(ident, seen[ident])))
    if report.get("suite_pass") is False and not accounted:
        # eval.py failed the suite for a reason none of the readers above name: never let that pass silently,
        # regardless of whether some OTHER, already-explained failure already populated `keys`.
        keys.add((SUITE, "suite_pass=False (unexplained by any known reader)"))
    return keys


def _unattributed_ap_failures(report, root="."):
    """AP failure entries the per-run loop in failure_keys() cannot key, surfaced so they can never hide behind
    an unrelated already-explained failure. Both of these hard-fail the whole suite in eval.py (apfailures ->
    False) yet produce no distinct key on their own:

      * an entry whose `run` is missing or falsy — research_check.ap_failures() drops it (`if run:`), so
        status_of() never sees it. Keyed under (suite), one identity per violation.
      * an entry WITH a run but an empty/missing `violations` list (Codex #732, r4119535836) — ap_failures()
        maps it to [], so status_of() adds no AP key for it; behind an inherited per-run failure on that SAME
        run (which already put the run's own key in `keys` and set `accounted`) the malformed entry surfaced
        nothing at all. Keyed under the run so a malformed attributed entry always gates."""
    out = set()
    seen = collections.Counter()
    for entry in (report.get("valuation_summary_integrity") or {}).get("failures") or []:
        run = entry.get("run")
        if run and (entry.get("violations") or []):
            continue  # attributed with real violations: already covered via ap_failures()/status_of()
        if run:
            ident = "AP_valuation_summary_integrity (attributed, no violations recorded)"
            seen[ident] += 1
            out.add((run, _tag(ident, seen[ident])))
            continue
        violations = entry.get("violations") or ["(unattributed AP failure: no run and no violations recorded)"]
        for violation in violations:
            ident = _identity("AP_valuation_summary_integrity (no run)", violation, root)
            seen[ident] += 1
            out.add((SUITE, _tag(ident, seen[ident])))
    return out


def _suite_contract_elements(report):
    """Suite-level (framework-contract + AZ correspondence) failures, one identity PER missing anchor / per AZ
    failure rather than one per file/check, so an ADDITIONAL suite-contract violation on top of one the base
    already has is a distinct key that gates. Mirrors research_check.suite_contract_failures()'s naming but
    reads the raw `missing`/`failures` lists (which that helper joins into a single `detail` string) so each
    element keeps its own key. An empty list falls back to the bare check name (never silently dropped)."""
    out = []
    for j in report.get("source_contracts_s24") or []:
        if j.get("status") == "FAIL":
            name = f"framework contract: {j.get('file')}"
            out += [f"{name}: {anchor}" for anchor in (j.get("missing") or [])] or [name]
    az = report.get("governance_flag_cap_correspondence") or {}
    if az and not az.get("pass", True):
        name = "governance flag/cap correspondence (AZ)"
        out += [f"{name}: {failure}" for failure in (az.get("failures") or [])] or [name]
    return out


def split(head_keys, base_keys):
    """(new, inherited). base_keys None means no usable base: everything is new (strict)."""
    if base_keys is None:
        return set(head_keys), set()
    return set(head_keys) - set(base_keys), set(head_keys) & set(base_keys)


def base_failure_keys(base, root="."):
    """Failure keys of the base commit, or (None, reason) when the base cannot be evaluated."""
    if not base or base == "none":
        return None, "no base commit was given"
    probe = subprocess.run(["git", "rev-parse", "-q", "--verify", f"{base}^{{commit}}"],
                           cwd=root, capture_output=True, text=True)
    if probe.returncode != 0:
        return None, f"base {base!r} is not a commit in this checkout"
    tmp = tempfile.mkdtemp(prefix="eval-code-gate-")
    worktree = os.path.join(tmp, "base")
    added = False
    try:
        add = subprocess.run(["git", "worktree", "add", "--detach", worktree, probe.stdout.strip()],
                             cwd=root, capture_output=True, text=True)
        if add.returncode != 0:
            return None, f"could not check out base {base}: {add.stderr.strip()[:200]}"
        added = True
        try:
            report = run_harness(worktree, quiet=True, require_complete=False)
        except Exception as error:  # the base's own harness crashed or wrote nothing
            return None, f"the eval harness on base {base} produced no report ({error})"
        return failure_keys(report, worktree), None
    finally:
        if added:
            subprocess.run(["git", "worktree", "remove", "--force", worktree], cwd=root, capture_output=True)
        shutil.rmtree(tmp, ignore_errors=True)
        if added:
            # After the directory is gone, so a failed `remove` above cannot leave a dangling worktree entry.
            subprocess.run(["git", "worktree", "prune"], cwd=root, capture_output=True)


def _fmt(keys):
    by_run = {}
    for run, check in sorted(keys):
        by_run.setdefault(run, []).append(check)
    return [f"{run}: {', '.join(checks)}" for run, checks in by_run.items()]


def main(argv=None):
    parser = argparse.ArgumentParser(description="Fail a code change only for the eval failures it introduces.")
    parser.add_argument("--base", required=True, help="the commit this change merges onto, or 'none' (strict)")
    parser.add_argument("--root", default=".", help="repository root (default: the working directory)")
    args = parser.parse_args(argv)

    try:
        head_keys = failure_keys(run_harness(args.root), args.root)
    except Exception as error:
        print(f"::error::the eval harness produced no report for this change ({error})")
        return 2

    unnamed = undecoded_suite_gates(args.root)
    if unnamed:
        base_keys, why_strict = None, ("scripts/eval.py can fail the suite in a way this gate cannot name ("
                                       + "; ".join(unnamed) + ") — teach DECODED_SUITE_GATES and its readers")
    else:
        base_keys, why_strict = base_failure_keys(args.base, args.root)
    new, inherited = split(head_keys, base_keys)

    print()
    if base_keys is None:
        print(f"EVAL CODE GATE: strict — {why_strict}; every failure gates, as `eval.py all` does.")
    else:
        print(f"EVAL CODE GATE: compared against base {args.base}.")
    for line in _fmt(inherited):
        print(f"::warning::already failing on the base, not caused by this change (owned by the research-check "
              f"issue for that run): {line}")
    for line in _fmt(new):
        print(f"::error::eval failure introduced by this change: {line}")
    if new:
        print(f"EVAL CODE GATE: FAIL — {len(new)} new failure(s); {len(inherited)} inherited from the base.")
        return 1
    print(f"EVAL CODE GATE: PASS — no new failures; {len(inherited)} inherited from the base (reported above).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
