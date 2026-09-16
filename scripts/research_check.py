#!/usr/bin/env python3
"""
Check research runs as they land on main.

The engine publishes research straight to `main` (scripts/commit-run.sh), and `.github/workflows/ci.yml`
ignores those pushes on purpose, so publishing research can never cancel or trigger a code release. The cost
was that nothing looked at a new run at all: a flawed one surfaced only when the next, unrelated code PR ran
the eval over the whole corpus and inherited its failure. AKAM_2026-09-14 did exactly that to three open PRs
on 2026-09-15, a day after it landed.

This runs the same eval harness when the research lands, and reports on the runs that push actually touched.
It gates nothing in the code lane: .github/workflows/research-check.yml runs it on research pushes, on a
nightly sweep and on demand — never on a pull request.

  python3 scripts/research_check.py --changed <BASE_SHA> <HEAD_SHA>   # the runs a push added or changed
  python3 scripts/research_check.py --all                             # every committed run (the nightly sweep)

Exit code 0 when every run in scope passes. A WARN is not a failure — a superseded run, or one with no
RUN_METADATA, is already non-gating inside eval.py, and this must say exactly what that harness says.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys

# analyses/<RUN>/... — the only runs eval.py scores. analyses/eval/ is the harness's own report folder.
RUN_PATH = re.compile(r"^analyses/([^/]+)/")
NOT_A_RUN = {"eval"}
MARKER = "research-eval"


def runs_from_paths(paths):
    """The run folders a list of changed paths belongs to, sorted, without repeats."""
    out = set()
    for raw in paths:
        match = RUN_PATH.match(raw.strip().replace("\\", "/"))
        if match and match.group(1) not in NOT_A_RUN:
            out.add(match.group(1))
    return sorted(out)


def changed_paths(base, head, root="."):
    """Files a push added or changed under analyses/. Deletions are left out: a deleted run cannot be checked."""
    result = subprocess.run(
        ["git", "diff", "--name-only", "--diff-filter=ACMRT", base, head, "--", "analyses"],
        cwd=root, capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"git diff {base}..{head} failed: {result.stderr.strip()[:200]}")
    return [line for line in result.stdout.splitlines() if line.strip()]


def run_eval(root="."):
    """Run the eval harness over every run and return the JSON report it writes (it prints `WROTE <path>`)."""
    result = subprocess.run([sys.executable, "scripts/eval.py", "all"], cwd=root, capture_output=True, text=True)
    sys.stdout.write(result.stdout)
    sys.stderr.write(result.stderr)
    wrote = [line for line in result.stdout.splitlines() if line.startswith("WROTE ")]
    if not wrote:
        raise RuntimeError("the eval harness wrote no report — see its output above")
    with open(os.path.join(root, wrote[-1][len("WROTE "):].strip()), encoding="utf-8") as handle:
        return json.load(handle)


def status_of(report, run):
    """(status, failing check names) for one run: PASS, WARN (evaluated, not gating), FAIL, or MISSING."""
    entry = (report.get("runs") or {}).get(run)
    if entry is None:
        return "MISSING", []
    fails = [check.get("check") for check in entry.get("checks") or [] if check.get("status") == "FAIL"]
    if entry.get("warn_only"):
        return "WARN", fails
    return ("PASS" if entry.get("pass") else "FAIL"), fails


def classify(report, scope_runs):
    """
    What this check reports: every run in scope by status, plus anything ELSE in the corpus that fails.
    A run in the push with no entry in the report is not a scored run yet (an intake plan, say): reported,
    never failed — this check exists to name what just landed, not to invent a verdict about it.
    """
    in_scope = {run: status_of(report, run) for run in scope_runs}
    corpus_failing = {}
    for run in sorted((report.get("runs") or {}).keys()):
        if run in in_scope:
            continue
        status, fails = status_of(report, run)
        if status == "FAIL":
            corpus_failing[run] = fails
    return {
        "in_scope": {run: {"status": status, "fails": fails} for run, (status, fails) in in_scope.items()},
        "failing": {run: fails for run, (status, fails) in in_scope.items() if status == "FAIL"},
        "passing": [run for run, (status, _) in in_scope.items() if status in ("PASS", "WARN")],
        "missing": [run for run, (status, _) in in_scope.items() if status == "MISSING"],
        "corpus_failing": corpus_failing,
    }


def issue_title(run):
    return f"Research eval: {run} fails its contract checks"


def issue_body(run, fails, head, run_url):
    """The issue a failing run gets. The marker line is how the next check finds this issue again."""
    checks = ", ".join(f"`{name}`" for name in fails) or "(no named check — see the log)"
    return (
        f"<!-- {MARKER}:{run} -->\n"
        f"`{run}` fails the eval harness: {checks}.\n\n"
        "It was checked as the research landed, so this blocks no code change. Resolve it the way the harness "
        "asks — re-run the affected module and the synthesis, or publish a corrected run that supersedes it — "
        "and this issue closes itself on the next check.\n\n"
        f"- Commit: `{head}`\n"
        f"- Check: {run_url}\n"
        f"- Reproduce: `python3 scripts/eval.py {run}`\n"
    )


def close_body(run, head, run_url):
    return (
        f"<!-- {MARKER}:{run} -->\n"
        f"`{run}` passes the eval harness again as of `{head}`. Closing.\n\n- Check: {run_url}\n"
    )


def issue_actions(result, head, run_url):
    """One entry per run in scope: open an issue for a failing run, close the issue of one that passes."""
    actions = [{"run": run, "state": "open", "title": issue_title(run),
                "body": issue_body(run, result["failing"][run], head, run_url)}
               for run in sorted(result["failing"])]
    actions += [{"run": run, "state": "close", "title": issue_title(run),
                 "body": close_body(run, head, run_url)}
                for run in sorted(result["passing"])]
    return actions


def summary_markdown(result, mode, head):
    """The run-by-run summary GitHub shows on the check itself."""
    lines = ["## Research check", "", f"Scope: **{mode}** · commit `{(head or '-')[:8]}`", ""]
    if not result["in_scope"]:
        lines.append("No research run was added or changed in this push. Nothing to check.")
        return "\n".join(lines) + "\n"
    words = {"PASS": "passes", "WARN": "warns — evaluated, not gating", "FAIL": "**fails**",
             "MISSING": "not scored — no decision record yet"}
    lines += ["| Run | Result | Failing checks |", "| --- | --- | --- |"]
    for run, entry in sorted(result["in_scope"].items()):
        fails = ", ".join(f"`{name}`" for name in entry["fails"]) or "—"
        lines.append(f"| `{run}` | {words[entry['status']]} | {fails} |")
    if result["corpus_failing"]:
        others = ", ".join(f"`{run}`" for run in sorted(result["corpus_failing"]))
        lines += ["", f"Also failing elsewhere in the corpus, each with its own issue: {others}."]
    return "\n".join(lines) + "\n"


def scored_only(runs, has_record):
    """
    Only the folders that are actually runs. analyses/ also holds the harness's own reports and the
    calibration summaries (analyses/eval, analyses/performance, analyses/tracking); a folder with no
    decision_record.json is not a run, and calling it unscored would be noise on every push that touches one.
    """
    return [run for run in runs if has_record(run)]


def _write(path, text, mode="w"):
    if path:
        with open(path, mode, encoding="utf-8") as handle:
            handle.write(text)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Check research runs as they land on main.")
    scope = parser.add_mutually_exclusive_group(required=True)
    scope.add_argument("--all", action="store_true", help="every committed run (the nightly sweep)")
    scope.add_argument("--changed", nargs=2, metavar=("BASE", "HEAD"), help="the runs a push added or changed")
    parser.add_argument("--root", default=".", help="repository root (default: the working directory)")
    parser.add_argument("--json-out", help="write the result, and the issues to open or close, here")
    parser.add_argument("--summary-out", help="append the markdown summary here (GITHUB_STEP_SUMMARY)")
    parser.add_argument("--run-url", default="", help="the URL of this check, for the issue body")
    parser.add_argument("--report", help="use an eval report already on disk instead of running the harness")
    args = parser.parse_args(argv)

    head = "HEAD"
    mode = "every committed run"
    scope_runs = None
    if args.changed:
        base, head = args.changed
        mode = "the runs this push touched"
        # A first push, or one whose before-state is gone, has nothing to compare with: check everything.
        if not base.strip() or set(base.strip()) == {"0"}:
            mode = "every committed run (this push has no comparable base)"
        else:
            scope_runs = scored_only(
                runs_from_paths(changed_paths(base, head, args.root)),
                lambda run: os.path.isfile(os.path.join(args.root, "analyses", run, "decision_record.json")),
            )
            if not scope_runs:
                print("research check: this push changed no research run under analyses/ — nothing to check.")
                empty = {"mode": mode, "head": head, "in_scope": {}, "failing": {}, "passing": [],
                         "missing": [], "corpus_failing": {}, "issues": []}
                _write(args.json_out, json.dumps(empty, indent=2))
                _write(args.summary_out, summary_markdown(empty, mode, head), mode="a")
                return 0

    if args.report:
        with open(args.report, encoding="utf-8") as handle:
            report = json.load(handle)
    else:
        report = run_eval(args.root)
    if scope_runs is None:
        scope_runs = sorted((report.get("runs") or {}).keys())

    result = classify(report, scope_runs)
    result.update({"mode": mode, "head": head, "issues": issue_actions(result, head, args.run_url)})

    print(f"\nresearch check — {mode}, commit {(head or '-')[:8]}")
    for run, entry in sorted(result["in_scope"].items()):
        fails = (" fails=" + ",".join(entry["fails"])) if entry["fails"] else ""
        print(f"  {run}: {entry['status']}{fails}")
    if result["corpus_failing"]:
        print("  also failing elsewhere in the corpus: " + ", ".join(sorted(result["corpus_failing"])))

    _write(args.json_out, json.dumps(result, indent=2, ensure_ascii=False))
    _write(args.summary_out, summary_markdown(result, mode, head), mode="a")

    if result["failing"]:
        print(f"\nFAIL — {len(result['failing'])} run(s) in scope fail their contract checks.")
        return 1
    print("\nPASS — every run in scope passes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
