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
DECISION_RECORD = "decision_record.json"

# Other top-level run artifacts eval.py's validators require, besides decision_record.json (which
# deleted_records() already special-cases: eval.py discovers a run ONLY via a decision_record.json still on
# disk, so losing that one makes the run invisible to the harness entirely). Losing one of THESE leaves the
# run fully visible to eval.py (its decision_record.json is still there) but makes a specific check FAIL:
# A_structural needs final_thesis.md + RUN_METADATA.md; check L needs memo.md + audit_dossier.md; checks
# O/X/AH need verification_report.json / pre_mortem.json / expectations_gap.json for a conviction-basket run
# dated on/after their gates. Mirrors eval.py's own SCHEMA_FILES set, minus DECISION_RECORD.
OTHER_REQUIRED_ARTIFACTS = {
    "final_thesis.md", "RUN_METADATA.md", "memo.md", "audit_dossier.md",
    "verification_report.json", "pre_mortem.json", "expectations_gap.json",
}

# The global evaluation inputs scripts/calibration_gate_checks.py loads ONCE and applies to EVERY run's AG
# check (the Phase-6 calibration-feedback gate) — never scoped to a single run folder, so runs_from_paths()
# cannot name a run for a change here. Mirrors that module's own CALIB_SUMMARIES glob verbatim.
GLOBAL_INPUT_PATTERN = re.compile(r"^analyses/performance/[^/]*_calibration_summary\.json$")

# The valuation lever sidecar AP validates globally (scripts/valuation_summary_checks.py:scan_committed),
# including for a partial run with no decision_record.json yet. Mirrors that module's own glob verbatim.
VALUATION_SIDECAR_PATH = re.compile(r"^analyses/([^/]+)/valuation/valuation_summary\.json$")


def runs_from_paths(paths):
    """The run folders a list of changed paths belongs to, sorted, without repeats."""
    out = set()
    for raw in paths:
        match = RUN_PATH.match(raw.strip().replace("\\", "/"))
        if match and match.group(1) not in NOT_A_RUN:
            out.add(match.group(1))
    return sorted(out)


def deleted_records(paths):
    """
    Runs whose decision_record.json a push REMOVED. A deleted decision record is a frozen call that
    eval.py can no longer see (the harness discovers only records still on disk, so the nightly sweep
    cannot recover it either) — so a deletion must be reported, never treated as 'nothing changed'.
    """
    out = set()
    for raw in paths:
        p = raw.strip().replace("\\", "/")
        match = RUN_PATH.match(p)
        if match and match.group(1) not in NOT_A_RUN and os.path.basename(p) == DECISION_RECORD:
            out.add(match.group(1))
    return sorted(out)


def deleted_other_artifacts(paths):
    """
    Runs that had one of OTHER_REQUIRED_ARTIFACTS removed (decision_record.json excluded — that is
    deleted_records()'s job, above). A push that deletes only, say, final_thesis.md leaves the run's
    decision_record.json in place, so eval.py still discovers and scores it — and A_structural now fails it
    (final_thesis.md is one of the two files it checks for). Without this, such a deletion is invisible to
    every path-based query here (it is neither an add/change nor a decision-record removal), so the run
    never re-enters scope and the push reports 'nothing to check' while the harness would fail it.
    """
    out = set()
    for raw in paths:
        p = raw.strip().replace("\\", "/")
        match = RUN_PATH.match(p)
        if match and match.group(1) not in NOT_A_RUN and os.path.basename(p) in OTHER_REQUIRED_ARTIFACTS:
            out.add(match.group(1))
    return sorted(out)


def touches_global_inputs(paths):
    """
    True when a push added, changed, or removed a GLOBAL evaluation input — one calibration_gate_checks.py
    loads once and applies to every run's AG check, not one tied to a single run folder. runs_from_paths()
    would derive a scope of just 'performance', which scored_only() then drops (that folder has no
    decision_record.json) — so a bad or corrected calibration summary could silently fail OTHER runs' AG
    check with the failures landing only in corpus_failing (nightly-only) and this push reporting PASS.
    """
    return any(GLOBAL_INPUT_PATTERN.match(raw.strip().replace("\\", "/")) for raw in paths)


def changed_valuation_sidecars(paths):
    """
    Runs whose analyses/<run>/valuation/valuation_summary.json this push added or changed. AP's global scan
    (scan_committed) validates this sidecar for a PARTIAL run (no decision_record.json yet) exactly as it
    does for a scored one, so a corrected sidecar needs to re-enter scope too — not only a newly-broken one
    (see the `fixed_partial` fold in main(), the counterpart to the existing `ap_touched` fold).
    """
    out = set()
    for raw in paths:
        match = VALUATION_SIDECAR_PATH.match(raw.strip().replace("\\", "/"))
        if match and match.group(1) not in NOT_A_RUN:
            out.add(match.group(1))
    return sorted(out)


def changed_paths(base, head, root="."):
    """Files a push added or changed under analyses/ (deletions are handled separately by deleted_paths).

    --no-renames so a rename is seen as add+delete: the destination lands here as an add (its new path),
    and the source lands in deleted_paths — the two halves the rename would otherwise hide (git detects
    renames by default, and a renamed decision_record.json would slip past both queries).
    """
    result = subprocess.run(
        ["git", "diff", "--name-only", "--diff-filter=ACMRT", "--no-renames", base, head, "--", "analyses"],
        cwd=root, capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"git diff {base}..{head} failed: {result.stderr.strip()[:200]}")
    return [line for line in result.stdout.splitlines() if line.strip()]


def deleted_paths(base, head, root="."):
    """
    Files a push DELETED under analyses/ — so a removed run cannot slip through unseen. --no-renames is
    the point: renaming a run's decision_record.json (e.g. `git mv … decision.json`) leaves the run with
    no canonical record, which is a removal in every way that matters; without --no-renames git reports it
    as R (a rename) and this D-only query would miss it, letting the frozen call vanish silently.
    """
    result = subprocess.run(
        ["git", "diff", "--name-only", "--diff-filter=D", "--no-renames", base, head, "--", "analyses"],
        cwd=root, capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"git diff --diff-filter=D {base}..{head} failed: {result.stderr.strip()[:200]}")
    return [line for line in result.stdout.splitlines() if line.strip()]


def resolve_head(ref, root="."):
    """
    The concrete commit a ref names. A full-corpus (--all) run is handed the literal 'HEAD', which stops
    meaning anything once main advances — so an issue that says 'Commit: HEAD' can't be traced back to the
    bytes actually checked. Resolve it to the real SHA; if git can't (no repo, detached oddity), keep the ref.
    """
    if ref and ref != "HEAD":
        return ref
    result = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root, capture_output=True, text=True)
    return result.stdout.strip() or ref


def ap_failures(report):
    """
    Run -> [violation, ...] from eval.py's AP valuation-summary integrity scan
    (report['valuation_summary_integrity']['failures']). This is a GLOBAL scan that HARD-FAILS the suite,
    and it can flag a run the per-run loop never scored (a partial run with no decision_record), so it is
    not visible in report['runs'] at all — the exact reason it must be read separately.
    """
    out = {}
    for entry in (report.get("valuation_summary_integrity") or {}).get("failures") or []:
        run = entry.get("run")
        if run:
            out[run] = entry.get("violations") or []
    return out


def suite_contract_failures(report):
    """
    Suite-level failures eval.py records OUTSIDE the per-run map and that set suite_pass=False: the §24
    framework source-contract checks (report['source_contracts_s24']) and the AZ governance flag/cap
    correspondence. These are framework wiring, not one run's data, so they are named globally, never
    charged to a single run. Returns a list of {'name', 'detail'}.
    """
    out = []
    for j in report.get("source_contracts_s24") or []:
        if j.get("status") == "FAIL":
            missing = ", ".join(j.get("missing") or []) or "(see the log)"
            out.append({"name": f"framework contract: {j.get('file')}", "detail": missing})
    az = report.get("governance_flag_cap_correspondence") or {}
    if az and not az.get("pass", True):
        out.append({"name": "governance flag/cap correspondence (AZ)",
                    "detail": ", ".join(az.get("failures") or []) or "(see the log)"})
    return out


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


def status_of(report, run, root="."):
    """(status, failing check names) for one run: PASS, WARN (evaluated, not gating), FAIL, or MISSING.

    An AP valuation-summary integrity violation HARD-FAILS the run: eval.py fails the whole suite on it
    regardless of supersession, so this must say FAIL too (and even for a run with no scored entry).
    """
    ap = ap_failures(report).get(run)
    ap_fails = [f"AP_valuation_summary_integrity: {v}" for v in ap] if ap else []
    entry = (report.get("runs") or {}).get(run)
    if entry is None:
        if ap is not None:
            return "FAIL", ap_fails or ["AP_valuation_summary_integrity"]
        # No scored decision record and no current AP violation. Most of the time this is simply not a
        # scored run at all (an intake plan, say) — MISSING, reported but never failed. The one exception:
        # main() folds a touched, still-committed valuation sidecar for a partial run into scope even after
        # AP stops flagging it (the `fixed_partial` fold), specifically so a corrected sidecar can close a
        # stale issue rather than vanish from scope with the issue left open forever. Recognize that case
        # here so it reads PASS, not MISSING (classify()/issue_actions() only close a PASS).
        if os.path.isfile(os.path.join(root, "analyses", run, "valuation", "valuation_summary.json")):
            return "PASS", []
        return "MISSING", []
    fails = [check.get("check") for check in entry.get("checks") or [] if check.get("status") == "FAIL"]
    fails += ap_fails
    if ap is not None:
        return "FAIL", fails  # AP hard-fails the suite even for an otherwise-warned (superseded) run
    if entry.get("warn_only"):
        return "WARN", fails
    return ("PASS" if entry.get("pass") else "FAIL"), fails


def classify(report, scope_runs, root="."):
    """
    What this check reports: every run in scope by status, plus anything ELSE in the corpus that fails.
    A run in the push with no entry in the report is not a scored run yet (an intake plan, say): reported,
    never failed — this check exists to name what just landed, not to invent a verdict about it.
    """
    in_scope = {run: status_of(report, run, root) for run in scope_runs}
    corpus_failing = {}
    # Union of scored runs and AP-flagged runs: an AP failure can name a run that has no scored entry.
    for run in sorted(set((report.get("runs") or {}).keys()) | set(ap_failures(report).keys())):
        if run in in_scope:
            continue
        status, fails = status_of(report, run, root)
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


def deleted_title(run):
    return f"Research eval: {run} decision record was removed"


def deleted_body(run, head, run_url, extra_fails=None):
    """The issue a run gets when its decision_record.json is deleted from main.

    `extra_fails`, when given, folds in contract-check failures the SAME push also left behind for this run
    (e.g. AP flagged a malformed valuation sidecar the deletion did not touch) — one issue per run, not two
    (see issue_actions(), which is what decides when to pass this).
    """
    extra = ""
    if extra_fails:
        checks = ", ".join(f"`{name}`" for name in extra_fails)
        extra = f"\nWhat is left of the run also fails the eval harness: {checks}.\n"
    return (
        f"<!-- {MARKER}:{run} -->\n"
        f"`{run}`'s `{DECISION_RECORD}` was **removed** in `{head}`. The eval harness only sees records still "
        "on disk, so a deleted call falls out of the standing set and the calibration history silently — the "
        "nightly sweep cannot recover it. If this was intentional (a call retired), record why; if not, restore "
        f"`analyses/{run}/{DECISION_RECORD}` from history.\n{extra}\n- Commit: `{head}`\n- Check: {run_url}\n"
    )


def issue_actions(result, head, run_url):
    """One entry per run in scope: open an issue for a failing (or deleted) run, close a passing one's issue.

    A run can land in BOTH result['failing'] (e.g. AP flags its still-present, malformed valuation sidecar)
    AND result['deleted'] (its decision_record.json was removed) in the SAME push. Both would open an issue
    under the identical `research-eval:<run>` marker, and research_check_issues.sh snapshots the open-issue
    list once at the start (an earlier fix in this PR) — so the second action's lookup cannot see the issue
    the first one just created, and two issues open for one run. Emit exactly ONE open action per run: the
    deletion (the more severe and more actionable of the two — the call itself is gone, not just a sidecar
    it left behind), with the other failure's checks folded into its body so nothing is lost.
    """
    failing = dict(result["failing"])
    deleted_runs = sorted(result.get("deleted") or [])
    actions = [{"run": run, "state": "open", "title": issue_title(run),
                "body": issue_body(run, failing[run], head, run_url)}
               for run in sorted(failing) if run not in deleted_runs]
    actions += [{"run": run, "state": "open", "title": deleted_title(run),
                 "body": deleted_body(run, head, run_url, extra_fails=failing.get(run))}
                for run in deleted_runs]
    actions += [{"run": run, "state": "close", "title": issue_title(run),
                 "body": close_body(run, head, run_url)}
                for run in sorted(result["passing"])]
    return actions


def summary_markdown(result, mode, head):
    """The run-by-run summary GitHub shows on the check itself."""
    lines = ["## Research check", "", f"Scope: **{mode}** · commit `{(head or '-')[:8]}`", ""]
    deleted = result.get("deleted") or []
    suite_contracts = result.get("suite_contracts") or []
    if not result["in_scope"] and not deleted and not suite_contracts:
        lines.append("No research run was added or changed in this push. Nothing to check.")
        return "\n".join(lines) + "\n"
    words = {"PASS": "passes", "WARN": "warns — evaluated, not gating", "FAIL": "**fails**",
             "MISSING": "not scored — no decision record yet"}
    if result["in_scope"]:
        lines += ["| Run | Result | Failing checks |", "| --- | --- | --- |"]
        for run, entry in sorted(result["in_scope"].items()):
            fails = ", ".join(f"`{name}`" for name in entry["fails"]) or "—"
            lines.append(f"| `{run}` | {words[entry['status']]} | {fails} |")
    if deleted:
        removed = ", ".join(f"`{run}`" for run in sorted(deleted))
        lines += ["", f"**Decision record removed** (a frozen call the harness can no longer see): {removed}."]
    if result["corpus_failing"]:
        others = ", ".join(f"`{run}`" for run in sorted(result["corpus_failing"]))
        lines += ["", f"Also failing elsewhere in the corpus, each with its own issue: {others}."]
    if suite_contracts:
        rows = "; ".join(f"{c['name']} ({c['detail']})" for c in suite_contracts)
        lines += ["", f"**Suite-level failure** (the harness fails as a whole, not for one run): {rows}."]
    if result.get("suite_pass") is False and not suite_contracts:
        lines += ["", "The eval harness reports **suite_pass: false** — see its log for the failing suite check."]
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
    full_scope = True   # --all, or a --changed push with no comparable base → the whole corpus is the scope
    deleted = []
    touched_runs = []
    changed = []
    if args.changed:
        base, head = args.changed
        mode = "the runs this push touched"
        # A first push, or one whose before-state is gone, has nothing to compare with: check everything.
        if not base.strip() or set(base.strip()) == {"0"}:
            mode = "every committed run (this push has no comparable base)"
        else:
            full_scope = False
            changed = changed_paths(base, head, args.root)
            deleted_all = deleted_paths(base, head, args.root)
            deleted = deleted_records(deleted_all)
            # A push that deletes some OTHER required run artifact (final_thesis.md, RUN_METADATA.md, ...)
            # while leaving decision_record.json in place is not "nothing changed": the run stays fully
            # visible to eval.py, and a validator that needs the deleted file (A_structural, check L, ...)
            # now fails it. deleted_records() only special-cases decision_record.json — eval.py cannot see
            # the run at all once THAT is gone — so fold these into touched_runs instead, re-entering scope
            # via the normal scored_only() path below.
            deleted_other = deleted_other_artifacts(deleted_all)
            touched_runs = sorted(set(runs_from_paths(changed)) | set(deleted_other))
            # A GLOBAL evaluation input (loaded once, for every run — e.g. the calibration summaries
            # scripts/calibration_gate_checks.py globs from analyses/performance/) cannot be scoped by path:
            # that folder has no decision_record.json, so runs_from_paths() names no run and scored_only()
            # drops it, silently deferring a bad or corrected summary's failures on OTHER runs to the
            # nightly sweep. Escalate to full-corpus scope instead, exactly like --all.
            global_touch = touches_global_inputs(changed) or touches_global_inputs(deleted_all)
            if not changed and not deleted and not deleted_other and not global_touch:
                print("research check: this push changed no research artifact under analyses/ — nothing to check.")
                empty = {"mode": mode, "head": head, "in_scope": {}, "failing": {}, "passing": [],
                         "missing": [], "corpus_failing": {}, "deleted": [], "suite_contracts": [],
                         "suite_pass": True, "issues": []}
                _write(args.json_out, json.dumps(empty, indent=2))
                _write(args.summary_out, summary_markdown(empty, mode, head), mode="a")
                return 0
            if global_touch:
                # scope_runs stays None so it is set from the eval report itself, below, exactly as the
                # full-corpus sweep sets it; full_scope=True so a resulting suite_pass=false (e.g. the AG
                # gate breaking on the changed summary) is charged to THIS push too, not deferred to nightly.
                full_scope = True
                mode = "every committed run (a global evaluation input changed)"
            elif not changed and not deleted_other:
                # A push that ONLY deleted decision record(s), touching no other artifact and no global
                # input: report the removal without running the harness (the deletion is a git fact, not an
                # eval fact) — but never treat it as "nothing changed".
                result = {"in_scope": {}, "failing": {}, "passing": [], "missing": [], "corpus_failing": {},
                          "deleted": deleted, "suite_contracts": [], "suite_pass": True}
                result.update({"mode": mode, "head": head,
                               "issues": issue_actions(result, head, args.run_url)})
                print(f"\nresearch check — {mode}, commit {(head or '-')[:8]}")
                print("  decision record removed: " + ", ".join(deleted))
                _write(args.json_out, json.dumps(result, indent=2, ensure_ascii=False))
                _write(args.summary_out, summary_markdown(result, mode, head), mode="a")
                print(f"\nFAIL — {len(deleted)} run(s) had a decision record removed.")
                return 1
            else:
                scope_runs = scored_only(
                    touched_runs,
                    lambda run: os.path.isfile(os.path.join(args.root, "analyses", run, "decision_record.json")),
                )
            # Otherwise the push changed analyses/ artifacts (added/changed, deleted some OTHER required run
            # artifact, or touched a global input): fall through and RUN eval even when no run is scored yet.
            # A valuation sidecar committed before its decision_record is not in scope_runs, but eval.py's AP
            # scan_committed validates that partial sidecar and can hard-fail it — so the harness must run
            # for it, not be skipped.

    # The full-corpus head is the literal 'HEAD'; resolve it to the real SHA so issue provenance is traceable.
    head = resolve_head(head, args.root)

    if args.report:
        with open(args.report, encoding="utf-8") as handle:
            report = json.load(handle)
    else:
        report = run_eval(args.root)
    if scope_runs is None:
        # The full-corpus sweep (--all, or a --changed push with no comparable base) owns suite-level and AP
        # failures, so an AP-flagged partial run with no scored entry (not in report['runs']) must be IN scope —
        # it then gets a tracking issue and the summary's "each with its own issue" stays true — rather than
        # being parked in corpus_failing with no issue while the summary claims one exists.
        scope_runs = sorted(set((report.get("runs") or {}).keys()) | set(ap_failures(report).keys()))
    # A run this push TOUCHED but that isn't scored (a partial run, no decision_record yet) never enters
    # scope_runs, yet AP's global scan validates its sidecar. Fold any AP failure on a touched run into
    # scope so a malformed partial-run sidecar is charged to the push that landed it, not just the nightly.
    _ap = ap_failures(report)
    ap_touched = [run for run in touched_runs if run in _ap and run not in scope_runs]
    if ap_touched:
        scope_runs = sorted(set(scope_runs) | set(ap_touched))
    # A partial run's sidecar may instead have been CORRECTED, not newly broken: it no longer appears in
    # `_ap`, so ap_touched above never re-adds it, and — with no scored decision record either — it would
    # otherwise vanish from scope with any AP-failure issue left open forever (the nightly --all sweep
    # cannot rediscover a passing partial run either; it only unions in AP-FAILING ones). Fold in any
    # touched, still-committed valuation sidecar AP no longer flags: status_of() reports it PASS, and
    # closing an issue that was never open is a no-op (research_check_issues.sh).
    sidecar_touched = changed_valuation_sidecars(changed)
    fixed_partial = [
        run for run in sidecar_touched
        if run not in scope_runs and run not in _ap
        and os.path.isfile(os.path.join(args.root, "analyses", run, "valuation", "valuation_summary.json"))
    ]
    if fixed_partial:
        scope_runs = sorted(set(scope_runs) | set(fixed_partial))

    result = classify(report, scope_runs, args.root)
    # The harness's own verdict is authoritative (a deterministic validator — CLAUDE.md/AGENTS.md §29, §31):
    # a suite that fails as a whole (framework source contracts, AZ correspondence, an unreadable report)
    # must be surfaced, never overridden by an all-runs-pass reading of the per-run map.
    suite_pass = bool(report.get("suite_pass", True))
    suite_contracts = suite_contract_failures(report)
    result.update({"mode": mode, "head": head, "deleted": deleted, "suite_pass": suite_pass,
                   "suite_contracts": suite_contracts})
    result["issues"] = issue_actions(result, head, args.run_url)

    print(f"\nresearch check — {mode}, commit {(head or '-')[:8]}")
    for run, entry in sorted(result["in_scope"].items()):
        fails = (" fails=" + ",".join(entry["fails"])) if entry["fails"] else ""
        print(f"  {run}: {entry['status']}{fails}")
    if deleted:
        print("  decision record removed: " + ", ".join(sorted(deleted)))
    if result["corpus_failing"]:
        print("  also failing elsewhere in the corpus: " + ", ".join(sorted(result["corpus_failing"])))
    if suite_contracts:
        print("  suite-level failure: " + "; ".join(c["name"] for c in suite_contracts))

    _write(args.json_out, json.dumps(result, indent=2, ensure_ascii=False))
    _write(args.summary_out, summary_markdown(result, mode, head), mode="a")

    # Fail on: any in-scope run failing (incl. an AP data-integrity violation), a deleted call, or — when the
    # scope IS the whole corpus (the nightly sweep) — the harness reporting suite_pass=false. A scoped push is
    # NOT failed for a suite-level problem it did not cause; the nightly --all sweep owns that (and names it).
    reasons = []
    if result["failing"]:
        reasons.append(f"{len(result['failing'])} run(s) in scope fail their contract checks")
    if deleted:
        reasons.append(f"{len(deleted)} run(s) had a decision record removed")
    if full_scope and (not suite_pass or suite_contracts):
        reasons.append("the eval harness reports a suite-level failure (suite_pass=false)")
    if reasons:
        print("\nFAIL — " + "; ".join(reasons) + ".")
        return 1
    if suite_contracts or not suite_pass:
        print("\nPASS in scope — but the full harness reports a suite-level failure the nightly sweep owns; "
              "not charged to this push.")
        return 0
    print("\nPASS — every run in scope passes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
