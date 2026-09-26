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
(a detached worktree) — and compares the failures, keyed (run, check):

  * a failure on the change that the base does not have            -> NEW, gates (exit 1)
  * a failure the base already has                                  -> INHERITED, reported, does not gate
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
from research_check import ap_failures, status_of, suite_contract_failures  # noqa: E402

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
    return sorted((found - DECODED_SUITE_GATES).elements())


def run_harness(root=".", quiet=False):
    """Run `scripts/eval.py all` in root and return its report, refusing one that cannot be trusted.

    The report must carry a boolean suite_pass that agrees with the harness's own exit status (eval.py exits
    0 exactly when suite_pass is true). A missing, non-boolean, or contradicting suite_pass raises: the key
    comparison is only sound on a report whose overall verdict is known.
    """
    result = subprocess.run([sys.executable, "scripts/eval.py", "all"], cwd=root, capture_output=True, text=True)
    if not quiet:
        sys.stdout.write(result.stdout)
        sys.stderr.write(result.stderr)
    wrote = [line for line in result.stdout.splitlines() if line.startswith("WROTE ")]
    if not wrote:
        raise RuntimeError(f"the eval harness wrote no report (exit {result.returncode})")
    with open(os.path.join(root, wrote[-1][len("WROTE "):].strip()), encoding="utf-8") as handle:
        report = json.load(handle)
    verdict = report.get("suite_pass")
    if not isinstance(verdict, bool):
        raise RuntimeError(f"the eval report has no boolean suite_pass (got {verdict!r})")
    if verdict != (result.returncode == 0):
        raise RuntimeError(f"the eval report says suite_pass={verdict} but the harness exited {result.returncode}")
    return report

def failure_keys(report, root="."):
    """Every hard failure in an eval report as (run, check) pairs; suite-level failures use run '(suite)'.

    Reads the report exactly as research_check.py does (status_of / ap_failures / suite_contract_failures), so a
    WARN run (superseded, or no RUN_METADATA) is not a failure here either, and an AP violation is.
    """
    keys = set()
    for run in set((report.get("runs") or {}).keys()) | set(ap_failures(report).keys()):
        status, fails = status_of(report, run, root)
        if status == "FAIL":
            # Key by the check's name only: an AP failure arrives as "AP_valuation_summary_integrity: <text>", and
            # a reworded diagnostic must not turn a failure the base already has into a "new" one.
            keys |= {(run, check.split(":", 1)[0].strip()) for check in fails} or {(run, "FAIL")}
    for item in suite_contract_failures(report):
        keys.add((SUITE, item["name"]))
    if report.get("suite_pass") is False and not keys:
        # eval.py failed the suite for a reason none of the readers above name: never let that pass silently.
        keys.add((SUITE, "suite_pass=False"))
    return keys


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
            report = run_harness(worktree, quiet=True)
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
