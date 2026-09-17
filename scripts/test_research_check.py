#!/usr/bin/env python3
"""
Tests for scripts/research_check.py — the check that looks at research runs as they land on main.

What must hold: it checks exactly the runs a push touched; a warned run (superseded, or missing its
RUN_METADATA) is reported but never fails, because eval.py itself does not gate on those; a folder that is
not a scored run yet cannot fail the check; a run failing elsewhere in the corpus is named but never charged
to this push; every failing run gets one findable issue that closes itself when the run passes again; and the
workflow that runs all this stays out of the code lane.

Run: python3 scripts/test_research_check.py   (exit 0 = all pass)
"""
import json
import os
import re
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from research_check import (  # noqa: E402
    MARKER, ap_failures, changed_valuation_sidecars, classify, deleted_body, deleted_other_artifacts,
    deleted_records, deleted_title, issue_actions, issue_body, issue_title,
    main, resolve_head, runs_from_paths, scored_only, status_of, suite_contract_failures, summary_markdown,
    touches_global_inputs,
)
import subprocess  # noqa: E402

_fails = []


def check(name, cond, detail=""):
    print(f"  {'ok  ' if cond else 'FAIL'} {name}" + (f"  — {detail}" if detail and not cond else ""))
    if not cond:
        _fails.append(name)


def run_entry(passed=True, warn_only=False, fails=(), decision="Avoid"):
    checks = [{"check": "A_structural", "status": "PASS", "detail": ""}]
    checks += [{"check": name, "status": "FAIL", "detail": ""} for name in fails]
    return {"pass": passed, "warn_only": warn_only, "decision": decision, "checks": checks,
            "warn_nonschema_files": [], "retrospective_advisories": []}


REPORT = {"schema_version": "1.0", "suite_pass": False, "runs": {
    "AKAM_2026-09-14": run_entry(passed=False, warn_only=True,
                                 fails=["S_haircut_propagated", "AY_fixture_integrity"]),
    "AKAM_2026-09-15": run_entry(),
    "NHY_2026-07-19": run_entry(),
    "BROKEN_2026-09-16": run_entry(passed=False, fails=["B_schema"]),
}}

# ---- which runs a push touched ----

check("a changed file names its run once, however deep it sits", runs_from_paths([
    "analyses/AKAM_2026-09-15/decision_record.json",
    "analyses/AKAM_2026-09-15/valuation/99_valuation-synthesis.md",
    "analyses/NHY_2026-07-19/final_thesis.md",
]) == ["AKAM_2026-09-15", "NHY_2026-07-19"])

check("the harness's own report folder is not a run", runs_from_paths([
    "analyses/eval/2026-09-16_eval_report.json", "analyses/AKAM_2026-09-15/memo.md",
]) == ["AKAM_2026-09-15"])

check("paths outside analyses/ are not runs", runs_from_paths([
    "screener/board/index.json", "ui/server/src/server.ts", "analyses/", "watchlist/entries/x.json",
]) == [])

check("a folder under analyses/ with no decision record is not a run",
      scored_only(["AKAM_2026-09-15", "performance", "tracking"], lambda run: run.startswith("AKAM"))
      == ["AKAM_2026-09-15"], "analyses/ also holds the harness's reports and the calibration summaries")

# ---- deletions of OTHER required run artifacts (not just decision_record.json) name their run too ----
check("deleting final_thesis.md (decision record intact) still names the run",
      deleted_other_artifacts(["analyses/THESISGONE_2026-09-16/final_thesis.md",
                                "analyses/eval/2026-09-16_eval_report.json"]) == ["THESISGONE_2026-09-16"])
check("deleting the decision record itself is NOT this function's job (deleted_records() owns that)",
      deleted_other_artifacts(["analyses/GONE_2026-09-16/decision_record.json"]) == [])
check("deleting an arbitrary non-required file does not name the run",
      deleted_other_artifacts(["analyses/X_2026-09-16/notes.txt"]) == [])

# ---- a change to a GLOBAL evaluation input (not tied to one run folder) is detected ----
check("a calibration summary is a global input",
      touches_global_inputs(["analyses/performance/2026-09-16_calibration_summary.json"]))
check("an all-scope same-day rerun (which overwrites, per scripts/calibrate.py write_outputs) is still a match",
      touches_global_inputs(["analyses/performance/2026-06-01_calibration_summary.json"]))
check("a SCOPED (per-ticker) calibration summary under performance/scoped/ is NOT a global input — "
      "calibration_gate_checks.py's own glob is non-recursive and never sees it (scripts/calibrate.py "
      "deliberately keeps a one-ticker snapshot out of the Phase-6 population)",
      not touches_global_inputs(["analyses/performance/scoped/2026-06-01_AKAM_calibration_summary.json"]))
check("an unrelated file under analyses/performance/ is not a global input",
      not touches_global_inputs(["analyses/performance/README.md"]))
check("a per-run file is not a global input",
      not touches_global_inputs(["analyses/AKAM_2026-09-15/decision_record.json"]))

# ---- a changed valuation sidecar names its run, for the fixed-partial close fold ----
check("a changed valuation sidecar names its run",
      changed_valuation_sidecars(["analyses/PARTIAL_2026-09-16/valuation/valuation_summary.json"])
      == ["PARTIAL_2026-09-16"])
check("a different file in the valuation folder is not a sidecar change",
      changed_valuation_sidecars(["analyses/PARTIAL_2026-09-16/valuation/99_valuation-synthesis.md"]) == [])

# ---- what the check makes of the eval report ----

check("a failing run in the push fails the check",
      classify(REPORT, ["BROKEN_2026-09-16"])["failing"] == {"BROKEN_2026-09-16": ["B_schema"]})

check("a warned run is reported with its checks but never fails", (lambda r: (
    r["failing"] == {} and r["in_scope"]["AKAM_2026-09-14"]["status"] == "WARN"
    and r["in_scope"]["AKAM_2026-09-14"]["fails"] == ["S_haircut_propagated", "AY_fixture_integrity"]
))(classify(REPORT, ["AKAM_2026-09-14"])), "eval.py does not gate on a superseded run, so neither does this")

check("a folder the harness does not score is reported, not failed", (lambda r: (
    r["missing"] == ["INTAKE_2026-09-16"] and r["failing"] == {}
))(classify(REPORT, ["INTAKE_2026-09-16"])))

check("a run failing elsewhere is named, never charged to this push", (lambda r: (
    r["failing"] == {} and r["corpus_failing"] == {"BROKEN_2026-09-16": ["B_schema"]}
))(classify(REPORT, ["AKAM_2026-09-15"])))

check("status_of reads pass, warn, fail and absence",
      [status_of(REPORT, "AKAM_2026-09-15")[0], status_of(REPORT, "AKAM_2026-09-14")[0],
       status_of(REPORT, "BROKEN_2026-09-16")[0], status_of(REPORT, "NOPE")[0]]
      == ["PASS", "WARN", "FAIL", "MISSING"])

# ---- what the operator sees ----

_result = classify(REPORT, ["BROKEN_2026-09-16", "AKAM_2026-09-15"])
_actions = issue_actions(_result, "abc1234", "https://github.com/x/y/actions/runs/1")

check("a failing run gets one issue, findable again by its marker", (lambda a: (
    len(a) == 2 and a[0]["run"] == "BROKEN_2026-09-16" and a[0]["state"] == "open"
    and f"{MARKER}:BROKEN_2026-09-16" in a[0]["body"] and "B_schema" in a[0]["body"]
))(_actions))

check("a run that passes closes its issue", (lambda a: (
    a[1]["run"] == "AKAM_2026-09-15" and a[1]["state"] == "close"
    and a[1]["title"] == issue_title("AKAM_2026-09-15") and f"{MARKER}:AKAM_2026-09-15" in a[1]["body"]
))(_actions))

check("the issue says it blocks no code, and how to reproduce it", (lambda b: (
    "blocks no code change" in b and "python3 scripts/eval.py X_2026-01-01" in b
))(issue_body("X_2026-01-01", ["B_schema"], "abc1234", "url")))

_md = summary_markdown(_result, "the runs this push touched", "abc1234def")
check("the summary names each run and its result",
      "`BROKEN_2026-09-16`" in _md and "**fails**" in _md and "`AKAM_2026-09-15`" in _md and "passes" in _md)

check("an empty push says so plainly",
      "Nothing to check." in summary_markdown({"in_scope": {}, "corpus_failing": {}}, "x", "abc1234"))

# ---- a run BOTH failing (a leftover malformed sidecar) AND deleted (its decision record) gets ONE issue,
# not two (Codex P2) — the two comprehensions used to fire independently under the same research-eval:<run>
# marker, and research_check_issues.sh's one-time issue-list snapshot means the second action's lookup can
# never see the issue the first one just created.
_dual_result = {"failing": {"DUAL_2026-09-16": ["AP_valuation_summary_integrity: bull below base"]},
                "deleted": ["DUAL_2026-09-16"], "passing": []}
_dual_actions = issue_actions(_dual_result, "sha1234", "url")
check("a run both failing and deleted in the same push gets exactly ONE open action",
      len(_dual_actions) == 1, f"got {len(_dual_actions)}")
check("the merged action is the removal (the more severe of the two), not the plain contract-failure issue",
      _dual_actions and _dual_actions[0]["state"] == "open"
      and _dual_actions[0]["title"] == deleted_title("DUAL_2026-09-16"))
check("the merged body keeps BOTH failure reasons — nothing lost by not opening a second issue",
      _dual_actions and "removed" in _dual_actions[0]["body"]
      and "AP_valuation_summary_integrity: bull below base" in _dual_actions[0]["body"])

# ---- end to end, against a report on disk (no harness run, no network) ----

with tempfile.TemporaryDirectory() as tmp:
    report_path = os.path.join(tmp, "report.json")
    with open(report_path, "w", encoding="utf-8") as handle:
        json.dump(REPORT, handle)
    out_path = os.path.join(tmp, "out.json")
    summary_path = os.path.join(tmp, "summary.md")
    code = main(["--all", "--report", report_path, "--json-out", out_path, "--summary-out", summary_path])
    with open(out_path, encoding="utf-8") as handle:
        payload = json.load(handle)
    check("a corpus with a failing run exits non-zero", code == 1)
    check("the result file carries the issues to open and to close",
          {a["run"]: a["state"] for a in payload["issues"]}
          == {"BROKEN_2026-09-16": "open", "AKAM_2026-09-14": "close", "AKAM_2026-09-15": "close",
              "NHY_2026-07-19": "close"})
    check("the step summary was written", os.path.getsize(summary_path) > 0)

    clean_path = os.path.join(tmp, "clean.json")
    with open(clean_path, "w", encoding="utf-8") as handle:
        json.dump({"runs": {k: v for k, v in REPORT["runs"].items() if k != "BROKEN_2026-09-16"}}, handle)
    check("a clean corpus exits zero", main(["--all", "--report", clean_path]) == 0)

# ---- the workflow that runs this stays out of the code lane ----

_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(_root, ".github", "workflows", "research-check.yml"), encoding="utf-8") as handle:
    _workflow = handle.read()
check("the workflow runs this script on research pushes and nightly",
      "scripts/research_check.py --changed" in _workflow.replace("\\\n", "").replace("\n", " ")
      and "scripts/research_check.py --all" in _workflow.replace("\\\n", "").replace("\n", " "))
check("the workflow never runs on a pull request",
      re.search(r"^\s*pull_request:", _workflow, re.M) is None, "a trigger, not the word in a comment")
check("the workflow cannot cancel another workflow",
      "cancel-in-progress: false" in _workflow and "group: research-check-" in _workflow)

with open(os.path.join(_root, ".github", "workflows", "ci.yml"), encoding="utf-8") as handle:
    _ci = handle.read()
check("release CI still carries exactly its five jobs (scripts/ops/deploy-authorization.py reads them)",
      sum(_ci.count(f"\n  {job}:") for job in ("ui-server", "eval-contracts", "tools-tests", "ui-web", "edge")) == 5)

# ---- suite-level eval failures are honored, never overridden by an all-runs-pass read (Codex P1) ----
# eval.py's suite_pass is a deterministic validator, and AGENTS.md/CLAUDE.md §29 puts "deterministic ...
# validators ... and finish gates" ABOVE any softer reading (also §31: validators outrank prose). eval.py
# ends `sys.exit(0 if suite_pass else 1)`, and suite_pass is set False by an AP valuation-summary integrity
# violation (a run's frozen sidecar contradicting its decision_record), a §24 framework source-contract
# failure, or the AZ governance flag/cap correspondence — NONE of which appear in the per-run `runs` map.
# The check must say what the harness says, not announce PASS because every per-run entry passed.

SUITE = {"schema_version": "1.0", "suite_pass": False, "runs": {
    "GOOD_2026-09-16": run_entry(),  # every scored run passes on its own checks
}, "valuation_summary_integrity": {"checked": 2, "failures": [
    {"run": "GOOD_2026-09-16", "violations": ["bull level 100 < base level 120"]}]},
    "source_contracts_s24": [{"file": "CLAUDE.md", "status": "FAIL", "missing": ["## 24. Avoid Big Risks"]},
                             {"file": "frameworks/SECTOR_OVERLAYS.md", "status": "PASS", "missing": []}],
    "governance_flag_cap_correspondence": {"pass": True, "failures": []}}

check("an AP valuation-summary violation hard-fails the run even though its per-run entry passed",
      status_of(SUITE, "GOOD_2026-09-16")[0] == "FAIL", "eval.py hard-fails the suite on it — so must this")
check("ap_failures reads the global valuation-summary scan keyed by run",
      ap_failures(SUITE) == {"GOOD_2026-09-16": ["bull level 100 < base level 120"]})
check("suite_contract_failures names the failing framework contract, not the passing one", (lambda s: (
      len(s) == 1 and s[0]["name"] == "framework contract: CLAUDE.md"))(suite_contract_failures(SUITE)))

with tempfile.TemporaryDirectory() as tmp:
    rp = os.path.join(tmp, "suite.json")
    with open(rp, "w", encoding="utf-8") as handle:
        json.dump(SUITE, handle)
    op = os.path.join(tmp, "suite-out.json")
    code = main(["--all", "--report", rp, "--json-out", op])
    with open(op, encoding="utf-8") as handle:
        payload = json.load(handle)
    # Pre-fix (per-run map only) this returned 0 with no issue; the harness itself returns 1. Now they agree.
    check("a full-corpus sweep exits non-zero when the harness reports suite_pass=false", code == 1)
    check("the AP-failing run gets an issue — invalid research data is no longer silent",
          {a["run"] for a in payload["issues"] if a["state"] == "open"} == {"GOOD_2026-09-16"})
    check("the suite-level framework-contract failure is surfaced in the result",
          [c["name"] for c in payload.get("suite_contracts", [])] == ["framework contract: CLAUDE.md"])


# ---- the nightly --all sweep opens a tracking issue for an AP-flagged PARTIAL run with no scored entry ----
# eval.py's AP valuation-summary scan can hard-fail a run that has NO entry in the per-run `runs` map — a
# partial run whose frozen sidecar landed before its decision_record. On the full-corpus sweep (which owns
# suite/AP failures) that run must enter scope and get its own findable issue. Parking it in corpus_failing
# with no issue while summary_markdown announces "each with its own issue" is a self-contradiction. Expected
# behaviour is pinned to that summary claim + §29/§31 (the deterministic AP validator's verdict is
# authoritative and must be surfaced, with a tracking issue, on the nightly that owns it) — NOT to the code's
# prior behaviour. The SUITE case above cannot catch this: its AP-flagged run is also in runs{}, so it is in
# scope on either code path; only a run ABSENT from runs{} distinguishes the fix.
SUITE_PARTIAL = {"schema_version": "1.0", "suite_pass": False, "runs": {
    "GOOD_2026-09-16": run_entry(),  # a scored run that passes on its own checks
}, "valuation_summary_integrity": {"checked": 2, "failures": [
    {"run": "PARTIAL_2026-09-16", "violations": ["bull level 100 < base level 120"]}]}}  # NOT in runs{}

with tempfile.TemporaryDirectory() as tmp:
    rp = os.path.join(tmp, "partial-suite.json")
    with open(rp, "w", encoding="utf-8") as handle:
        json.dump(SUITE_PARTIAL, handle)
    op = os.path.join(tmp, "partial-suite-out.json")
    sp = os.path.join(tmp, "partial-suite-summary.md")
    code = main(["--all", "--report", rp, "--json-out", op, "--summary-out", sp])
    with open(op, encoding="utf-8") as handle:
        payload = json.load(handle)
    with open(sp, encoding="utf-8") as handle:
        summary = handle.read()
    check("the nightly --all opens a tracking issue for an AP-flagged partial run absent from runs{}",
          {a["run"] for a in payload["issues"] if a["state"] == "open"} == {"PARTIAL_2026-09-16"})
    check("the AP-flagged partial run is charged as failing, not parked issueless in corpus_failing",
          "PARTIAL_2026-09-16" in payload["failing"] and "PARTIAL_2026-09-16" not in payload["corpus_failing"])
    check("the summary makes no 'each with its own issue' claim it did not keep",
          "each with its own issue" not in summary)


# ---- a scoped push is NOT charged for a suite-level problem it did not cause; the nightly --all owns it ----
# (drives main()'s real --changed git diff, with --report so eval.py itself is not run)

def _git(repo, *args):
    subprocess.run(["git", *args], cwd=repo, check=True, capture_output=True, text=True)


with tempfile.TemporaryDirectory() as tmp:
    _git(tmp, "init", "-q")
    _git(tmp, "config", "user.email", "t@t.t")
    _git(tmp, "config", "user.name", "t")
    for run in ("AINSCOPE_2026-09-16", "BOTHER_2026-09-16"):
        os.makedirs(os.path.join(tmp, "analyses", run))
        with open(os.path.join(tmp, "analyses", run, "decision_record.json"), "w") as handle:
            handle.write("{}\n")
    _git(tmp, "add", "-A")
    _git(tmp, "commit", "-qm", "base")
    base = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()
    with open(os.path.join(tmp, "analyses", "AINSCOPE_2026-09-16", "final_thesis.md"), "w") as handle:
        handle.write("touched\n")
    _git(tmp, "add", "-A")
    _git(tmp, "commit", "-qm", "touch AINSCOPE")
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()

    scoped_report = os.path.join(tmp, "report.json")
    with open(scoped_report, "w", encoding="utf-8") as handle:
        json.dump({"suite_pass": False,
                   "runs": {"AINSCOPE_2026-09-16": run_entry(), "BOTHER_2026-09-16": run_entry()},
                   "valuation_summary_integrity": {"checked": 2, "failures": [
                       {"run": "BOTHER_2026-09-16", "violations": ["stale lever set"]}]},
                   "source_contracts_s24": [
                       {"file": "CLAUDE.md", "status": "FAIL", "missing": ["## 24. Avoid Big Risks"]}]},
                  handle)
    op = os.path.join(tmp, "scoped-out.json")
    code = main(["--changed", base, head, "--root", tmp, "--report", scoped_report, "--json-out", op])
    with open(op, encoding="utf-8") as handle:
        scoped = json.load(handle)
    check("a scoped push whose own run passes exits 0 despite a suite-level failure elsewhere", code == 0)
    check("the in-scope run is the only one scored in scope", list(scoped["in_scope"]) == ["AINSCOPE_2026-09-16"])
    check("the unrelated AP-failing run is NAMED in corpus_failing, not charged to this push",
          "BOTHER_2026-09-16" in scoped["corpus_failing"])
    check("the suite-level contract failure is surfaced even on a passing scoped push",
          [c["name"] for c in scoped.get("suite_contracts", [])] == ["framework contract: CLAUDE.md"])


# ---- a push that DELETES a run's decision record is reported, never treated as 'nothing changed' (Codex P1) ----
check("deleted_records names a run whose decision_record.json was removed",
      deleted_records(["analyses/DELED_2026-09-16/decision_record.json",
                       "analyses/DELED_2026-09-16/memo.md",           # a non-record deletion is not the trigger
                       "analyses/eval/2026-09-16_eval_report.json"]) == ["DELED_2026-09-16"])

with tempfile.TemporaryDirectory() as tmp:
    _git(tmp, "init", "-q")
    _git(tmp, "config", "user.email", "t@t.t")
    _git(tmp, "config", "user.name", "t")
    os.makedirs(os.path.join(tmp, "analyses", "GONE_2026-09-16"))
    with open(os.path.join(tmp, "analyses", "GONE_2026-09-16", "decision_record.json"), "w") as handle:
        handle.write("{}\n")
    _git(tmp, "add", "-A")
    _git(tmp, "commit", "-qm", "base")
    base = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()
    _git(tmp, "rm", "-q", "analyses/GONE_2026-09-16/decision_record.json")
    _git(tmp, "commit", "-qm", "retire GONE")
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()
    op = os.path.join(tmp, "del-out.json")
    # Pre-fix: --diff-filter=ACMRT dropped the deletion, so this exited 0 as "nothing to check" with no issue.
    code = main(["--changed", base, head, "--root", tmp, "--json-out", op])
    with open(op, encoding="utf-8") as handle:
        deljson = json.load(handle)
    check("a push that only deletes a decision record exits non-zero", code == 1)
    check("the deleted run gets an issue opened under its removal title", (lambda a: (
        len(a) == 1 and a[0]["state"] == "open" and a[0]["title"] == deleted_title("GONE_2026-09-16")
        and f"{MARKER}:GONE_2026-09-16" in a[0]["body"]))(deljson["issues"]))


# ---- research_check_issues.sh drives gh correctly across open/refresh/close (Gemini + Codex shell reviews) ----
# Driven with a fake `gh` on PATH so the REAL script runs offline. Verifies: the open-issue list is fetched
# ONCE (not once per run — Gemini), a still-failing run with an existing issue is REFRESHED via `issue edit`
# (not left stale — Codex), a new failing run is `issue create`d, and a fixed run's issue is `issue close`d.
import shutil  # noqa: E402

if shutil.which("jq") and shutil.which("bash"):
    with tempfile.TemporaryDirectory() as tmp:
        gh_log = os.path.join(tmp, "gh.log")
        bindir = os.path.join(tmp, "bin")
        os.makedirs(bindir)
        fake_gh = os.path.join(bindir, "gh")
        with open(fake_gh, "w", encoding="utf-8") as handle:
            handle.write(
                "#!/usr/bin/env python3\n"
                "import sys\n"
                "argv = sys.argv[1:]\n"
                "open(%r, 'a').write(' '.join(argv) + '\\n')\n"
                "if argv[:2] == ['issue', 'list']:\n"
                "    sys.stdout.write('[{\"number\":101,\"body\":\"<!-- research-eval:OLDFAIL_2026-09-16 -->\"},'\n"
                "                     '{\"number\":102,\"body\":\"<!-- research-eval:FIXED_2026-09-16 -->\"},'\n"
                "                     '{\"number\":103,\"body\":\"<!-- research-eval:GONE_2026-09-16 -->\"}]')\n"
                "sys.exit(0)\n" % gh_log
            )
        os.chmod(fake_gh, 0o755)

        # NEWFAIL: open, no existing issue -> create. OLDFAIL: open, #101 exists -> edit (refresh).
        # FIXED: close, #102 exists -> close. FIXED_NOISSUE: close, none -> nothing.
        result = {"issues": [
            {"run": "NEWFAIL_2026-09-16", "state": "open", "title": issue_title("NEWFAIL_2026-09-16"),
             "body": issue_body("NEWFAIL_2026-09-16", ["B_schema"], "sha", "url")},
            {"run": "OLDFAIL_2026-09-16", "state": "open", "title": issue_title("OLDFAIL_2026-09-16"),
             "body": issue_body("OLDFAIL_2026-09-16", ["AY_fixture_integrity"], "sha", "url")},
            {"run": "FIXED_2026-09-16", "state": "close", "title": issue_title("FIXED_2026-09-16"),
             "body": "<!-- research-eval:FIXED_2026-09-16 -->passes"},
            {"run": "FIXED_NOISSUE_2026-09-16", "state": "close", "title": "x", "body": "y"},
            # A run whose record was deleted, on top of the contract-failure issue it already has: same marker,
            # different kind — so the headline has to change with the body.
            {"run": "GONE_2026-09-16", "state": "open", "title": deleted_title("GONE_2026-09-16"),
             "body": deleted_body("GONE_2026-09-16", "sha", "url")},
        ]}
        result_path = os.path.join(tmp, "result.json")
        with open(result_path, "w", encoding="utf-8") as handle:
            json.dump(result, handle)

        script = os.path.join(_root, "scripts", "research_check_issues.sh")
        env = dict(os.environ, PATH=bindir + os.pathsep + os.environ.get("PATH", ""))
        proc = subprocess.run(["bash", script, result_path], env=env, capture_output=True, text=True)
        log = open(gh_log, encoding="utf-8").read() if os.path.exists(gh_log) else ""

        check("the shell script parses (bash -n)",
              subprocess.run(["bash", "-n", script], capture_output=True).returncode == 0)
        check("the script never fails the workflow (exit 0)", proc.returncode == 0, proc.stderr[:200])
        check("open issues are listed exactly ONCE, not once per run (Gemini)",
              log.count("issue list") == 1, f"saw {log.count('issue list')} list call(s)")
        check("a new failing run gets `issue create`", "issue create" in log)
        check("a still-failing run with an existing issue is REFRESHED via `issue edit 101` (Codex)",
              "issue edit 101" in log, "pre-fix left the stale body untouched")
        check("a fixed run's existing issue is `issue close 102`", "issue close 102" in log)
        check("a refreshed issue's TITLE is updated with its body, so the two cannot contradict each other",
              any(line.startswith("issue edit 103") and "--title" in line and "was removed" in line
                  for line in log.splitlines()),
              "the deletion issue kept the contract-failure headline")
        check("exactly one issue is created (only the new failing run), not the fixed-no-issue run",
              log.count("issue create") == 1, f"saw {log.count('issue create')} create call(s)")
else:
    print("  skip  shell-issue test — jq/bash not on PATH")


# ---- a RENAMED decision record is reported like a removal (Codex P1) ----
# `git mv decision_record.json decision.json` leaves the run with no canonical record — a removal in every
# way that matters — but git reports it as R, which a D-only diff misses. --no-renames splits it into a
# delete (the source) + add (the destination), so the removal is seen.
with tempfile.TemporaryDirectory() as tmp:
    _git(tmp, "init", "-q")
    _git(tmp, "config", "user.email", "t@t.t")
    _git(tmp, "config", "user.name", "t")
    os.makedirs(os.path.join(tmp, "analyses", "RENAMED_2026-09-16"))
    with open(os.path.join(tmp, "analyses", "RENAMED_2026-09-16", "decision_record.json"), "w") as handle:
        handle.write("{}\n")
    _git(tmp, "add", "-A")
    _git(tmp, "commit", "-qm", "base")
    base = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()
    _git(tmp, "mv", "analyses/RENAMED_2026-09-16/decision_record.json",
         "analyses/RENAMED_2026-09-16/decision.json")
    _git(tmp, "commit", "-qm", "rename the canonical record")
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()
    op = os.path.join(tmp, "ren-out.json")
    # A rename also adds the destination path, so the harness runs (its sidecars still need validating);
    # an empty --report stands in for eval here — the point under test is that the removal is DETECTED.
    ren_report = os.path.join(tmp, "ren-report.json")
    with open(ren_report, "w", encoding="utf-8") as handle:
        json.dump({"suite_pass": True, "runs": {}}, handle)
    # Pre-fix: git reported the change as a rename (R), the D-only query saw nothing, and the push exited 0.
    code = main(["--changed", base, head, "--root", tmp, "--report", ren_report, "--json-out", op])
    with open(op, encoding="utf-8") as handle:
        renjson = json.load(handle)
    check("a renamed decision record is reported as a removal (exit non-zero)", code == 1)
    check("the renamed-away run gets a removal issue", (lambda a: (
        len(a) == 1 and a[0]["state"] == "open" and a[0]["title"] == deleted_title("RENAMED_2026-09-16")
    ))(renjson["issues"]))


# ---- a partial run's valuation sidecar is validated before its decision_record exists (Codex P1) ----
# A `valuation/valuation_summary.json` committed before the run's decision_record is not a scored run, so it
# never enters scope_runs — but eval.py's AP scan validates that sidecar and can hard-fail it. The check must
# run the harness and charge an AP failure on the touched partial run, not exit "nothing to check".
with tempfile.TemporaryDirectory() as tmp:
    _git(tmp, "init", "-q")
    _git(tmp, "config", "user.email", "t@t.t")
    _git(tmp, "config", "user.name", "t")
    _git(tmp, "commit", "-qm", "root", "--allow-empty")
    base = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()
    os.makedirs(os.path.join(tmp, "analyses", "PARTIAL_2026-09-16", "valuation"))
    with open(os.path.join(tmp, "analyses", "PARTIAL_2026-09-16", "valuation", "valuation_summary.json"),
              "w") as handle:
        handle.write("{}\n")   # no decision_record.json yet — a partial run
    _git(tmp, "add", "-A")
    _git(tmp, "commit", "-qm", "add a valuation sidecar before the decision record")
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()
    partial_report = os.path.join(tmp, "report.json")
    with open(partial_report, "w", encoding="utf-8") as handle:
        json.dump({"suite_pass": False, "runs": {},   # AP scans sidecars the per-run loop never scored
                   "valuation_summary_integrity": {"checked": 1, "failures": [
                       {"run": "PARTIAL_2026-09-16", "violations": ["bull level below base level"]}]}},
                  handle)
    op = os.path.join(tmp, "partial-out.json")
    # Pre-fix: scored_only produced an empty scope, so main returned 0 before ever reading the report/suite_pass.
    code = main(["--changed", base, head, "--root", tmp, "--report", partial_report, "--json-out", op])
    with open(op, encoding="utf-8") as handle:
        partial = json.load(handle)
    check("a touched partial run whose sidecar AP-fails is charged to the push (exit non-zero)", code == 1)
    check("the partial run's AP failure opens an issue for it",
          {a["run"] for a in partial["issues"] if a["state"] == "open"} == {"PARTIAL_2026-09-16"})


# ---- a corrected partial sidecar closes its stale AP-failure issue instead of vanishing from scope forever
# (Codex P2, "Close issues when a partial sidecar is corrected") ----
# A partial run's malformed sidecar first opened an issue (the test above). Once a LATER push corrects that
# same sidecar, AP no longer flags it, so it drops out of `_ap` — and, with no decision_record.json either,
# it would otherwise never re-enter scope at all, so no close action is ever emitted and the stale issue
# stays open forever (the nightly --all sweep cannot rediscover it either — it only unions in AP-FAILING
# partial runs, not passing ones).
with tempfile.TemporaryDirectory() as tmp:
    _git(tmp, "init", "-q")
    _git(tmp, "config", "user.email", "t@t.t")
    _git(tmp, "config", "user.name", "t")
    os.makedirs(os.path.join(tmp, "analyses", "FIXEDSC_2026-09-16", "valuation"))
    sidecar_path = os.path.join(tmp, "analyses", "FIXEDSC_2026-09-16", "valuation", "valuation_summary.json")
    with open(sidecar_path, "w") as handle:
        handle.write('{"ok": false}\n')
    _git(tmp, "add", "-A")
    _git(tmp, "commit", "-qm", "a malformed partial sidecar (already flagged by an earlier push)")
    base = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()
    with open(sidecar_path, "w") as handle:
        handle.write('{"ok": true}\n')
    _git(tmp, "add", "-A")
    _git(tmp, "commit", "-qm", "correct the sidecar")
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()
    fixed_report = os.path.join(tmp, "report.json")
    with open(fixed_report, "w", encoding="utf-8") as handle:
        json.dump({"suite_pass": True, "runs": {},
                   "valuation_summary_integrity": {"checked": 1, "failures": []}}, handle)  # AP no longer flags it
    op = os.path.join(tmp, "fixed-out.json")
    # Pre-fix: scored_only() drops it (no decision_record.json) and it is absent from `_ap`, so scope_runs
    # stays empty — no PASS entry, no close action, and the earlier issue is never told to close.
    code = main(["--changed", base, head, "--root", tmp, "--report", fixed_report, "--json-out", op])
    with open(op, encoding="utf-8") as handle:
        fixed = json.load(handle)
    check("a corrected partial sidecar exits zero (nothing left to fail)", code == 0, f"got exit {code}")
    check("the corrected partial sidecar gets a close action, not silence forever", (lambda a: (
        len(a) == 1 and a[0]["run"] == "FIXEDSC_2026-09-16" and a[0]["state"] == "close"
    ))(fixed["issues"]), f"got {fixed['issues']!r}")


# ---- deleting a required run artifact OTHER than decision_record.json still runs the harness for that run
# (Codex P1, "Evaluate deletions of other run artifacts") ----
# The existing deleted-canonical-record path (deleted_records(), tested above) only special-cases
# decision_record.json. Deleting final_thesis.md while the decision record stays in place leaves the run
# fully visible to eval.py — and eval.py's own A_structural check needs final_thesis.md to exist and be
# over 1KB, so the run would now fail it — but the deletion is neither an add/change (--diff-filter=ACMRT
# drops it) nor a decision-record removal, so pre-fix this reported "nothing to check".
with tempfile.TemporaryDirectory() as tmp:
    _git(tmp, "init", "-q")
    _git(tmp, "config", "user.email", "t@t.t")
    _git(tmp, "config", "user.name", "t")
    os.makedirs(os.path.join(tmp, "analyses", "THESISGONE_2026-09-16"))
    with open(os.path.join(tmp, "analyses", "THESISGONE_2026-09-16", "decision_record.json"), "w") as handle:
        handle.write("{}\n")
    with open(os.path.join(tmp, "analyses", "THESISGONE_2026-09-16", "final_thesis.md"), "w") as handle:
        handle.write(("x" * 2000) + "\n")
    _git(tmp, "add", "-A")
    _git(tmp, "commit", "-qm", "a complete run")
    base = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()
    _git(tmp, "rm", "-q", "analyses/THESISGONE_2026-09-16/final_thesis.md")
    _git(tmp, "commit", "-qm", "delete final_thesis.md; decision_record.json stays")
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()
    thesis_report = os.path.join(tmp, "report.json")
    with open(thesis_report, "w", encoding="utf-8") as handle:
        # Stands in for what eval.py would itself compute now that final_thesis.md is gone (A_structural FAIL).
        json.dump({"suite_pass": False, "runs": {
            "THESISGONE_2026-09-16": run_entry(passed=False, fails=["A_structural"]),
        }}, handle)
    op = os.path.join(tmp, "thesis-out.json")
    # Pre-fix: --diff-filter=ACMRT drops the deletion, deleted_records() only names a decision-record
    # deletion, so touched_runs/scope_runs are empty and this returns 0 ("nothing to check").
    code = main(["--changed", base, head, "--root", tmp, "--report", thesis_report, "--json-out", op])
    with open(op, encoding="utf-8") as handle:
        thesis = json.load(handle)
    check("deleting final_thesis.md (decision record intact) still runs the harness (exit non-zero)",
          code == 1, f"got exit {code}")
    check("the run is charged as failing A_structural, not silently skipped",
          "THESISGONE_2026-09-16" in thesis.get("failing", {}), f"got {thesis.get('failing')!r}")


# ---- a changed GLOBAL evaluation input escalates to full-corpus scope (Codex P2, "Evaluate global analysis
# inputs as full scope") ----
# scripts/calibration_gate_checks.py loads analyses/performance/*_calibration_summary.json ONCE and applies
# it to every run's AG check. A push that only touches that file cannot be scoped by path — 'performance' has
# no decision_record.json — so a bad or corrected summary's effect on OTHER runs must escalate to the same
# full-corpus scope --all uses, not be silently deferred to the nightly sweep via corpus_failing.
with tempfile.TemporaryDirectory() as tmp:
    _git(tmp, "init", "-q")
    _git(tmp, "config", "user.email", "t@t.t")
    _git(tmp, "config", "user.name", "t")
    os.makedirs(os.path.join(tmp, "analyses", "performance"))
    os.makedirs(os.path.join(tmp, "analyses", "UNRELATED_2026-09-16"))
    with open(os.path.join(tmp, "analyses", "UNRELATED_2026-09-16", "decision_record.json"), "w") as handle:
        handle.write("{}\n")
    _git(tmp, "add", "-A")
    _git(tmp, "commit", "-qm", "base")
    base = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()
    with open(os.path.join(tmp, "analyses", "performance", "2026-09-16_calibration_summary.json"),
              "w") as handle:
        handle.write("{}\n")
    _git(tmp, "add", "-A")
    _git(tmp, "commit", "-qm", "publish a calibration summary")
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()
    global_report = os.path.join(tmp, "report.json")
    with open(global_report, "w", encoding="utf-8") as handle:
        # A run this push never touched by path, now failing check AG because the calibration summary it
        # reads back changed — exactly the failure runs_from_paths()/scored_only() cannot scope to.
        json.dump({"suite_pass": True, "runs": {
            "UNRELATED_2026-09-16": run_entry(passed=False, fails=["AG_calibration_feedback_gate"]),
        }}, handle)
    op = os.path.join(tmp, "global-out.json")
    # Pre-fix: runs_from_paths() names only 'performance', scored_only() drops it (no decision_record.json),
    # so scope_runs is [] and this push exits 0 with UNRELATED's failure parked only in corpus_failing.
    code = main(["--changed", base, head, "--root", tmp, "--report", global_report, "--json-out", op])
    with open(op, encoding="utf-8") as handle:
        globaljson = json.load(handle)
    check("a changed global calibration input escalates this push to full-corpus scope (exit non-zero)",
          code == 1, f"got exit {code}")
    check("a run failing only because the global input changed is charged to THIS push, not deferred",
          "UNRELATED_2026-09-16" in globaljson.get("failing", {})
          and "UNRELATED_2026-09-16" not in globaljson.get("corpus_failing", {}),
          f"failing={globaljson.get('failing')!r} corpus_failing={globaljson.get('corpus_failing')!r}")


# ---- a run deleted AND still-failing (a leftover malformed sidecar) in the SAME push gets ONE issue, not
# two (Codex P2, "Emit only one issue action for a deleted failing run") — end-to-end mechanism proof ----
with tempfile.TemporaryDirectory() as tmp:
    _git(tmp, "init", "-q")
    _git(tmp, "config", "user.email", "t@t.t")
    _git(tmp, "config", "user.name", "t")
    os.makedirs(os.path.join(tmp, "analyses", "DUALBUG_2026-09-16", "valuation"))
    with open(os.path.join(tmp, "analyses", "DUALBUG_2026-09-16", "decision_record.json"), "w") as handle:
        handle.write("{}\n")
    dualbug_sidecar = os.path.join(tmp, "analyses", "DUALBUG_2026-09-16", "valuation", "valuation_summary.json")
    with open(dualbug_sidecar, "w") as handle:
        handle.write('{"ok": true}\n')
    _git(tmp, "add", "-A")
    _git(tmp, "commit", "-qm", "a complete run")
    base = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()
    _git(tmp, "rm", "-q", "analyses/DUALBUG_2026-09-16/decision_record.json")
    with open(dualbug_sidecar, "w") as handle:
        handle.write('{"ok": false}\n')   # the SAME push also breaks the leftover sidecar
    _git(tmp, "add", "-A")
    _git(tmp, "commit", "-qm", "delete the decision record AND break the sidecar it leaves behind")
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=tmp, capture_output=True, text=True).stdout.strip()
    dualbug_report = os.path.join(tmp, "report.json")
    with open(dualbug_report, "w", encoding="utf-8") as handle:
        json.dump({"suite_pass": False, "runs": {},
                   "valuation_summary_integrity": {"checked": 1, "failures": [
                       {"run": "DUALBUG_2026-09-16", "violations": ["bull level below base level"]}]}},
                  handle)
    op = os.path.join(tmp, "dualbug-out.json")
    # Pre-fix: result["failing"] AND result["deleted"] both name DUALBUG_2026-09-16, and issue_actions()
    # emitted one open action from EACH — two issues for one run.
    code = main(["--changed", base, head, "--root", tmp, "--report", dualbug_report, "--json-out", op])
    with open(op, encoding="utf-8") as handle:
        dualbug = json.load(handle)
    _open_actions = [a for a in dualbug["issues"] if a["state"] == "open"]
    check("a run deleted AND still-failing in the same push gets exactly ONE open action end to end",
          len(_open_actions) == 1, f"got {len(_open_actions)}: {_open_actions!r}")
    check("the one action is the removal, carrying the leftover sidecar failure in its body too",
          _open_actions and _open_actions[0]["title"] == deleted_title("DUALBUG_2026-09-16")
          and "bull level below base level" in _open_actions[0]["body"])


# ---- full-corpus issues record the real SHA, not the literal 'HEAD' (Codex P2) ----
check("resolve_head leaves an explicit ref untouched", resolve_head("abc1234", ".") == "abc1234")
_resolved = resolve_head("HEAD", _root)
check("resolve_head turns 'HEAD' into a concrete 40-char commit sha",
      bool(re.fullmatch(r"[0-9a-f]{40}", _resolved)), f"got {_resolved!r}")


# ---- the workflow triggers only on analyses/**, and mutates issues only on main (Codex P1 + P2) ----
_wf = open(os.path.join(_root, ".github", "workflows", "research-check.yml"), encoding="utf-8").read()
check("the push trigger is narrowed to analyses/** — the only root this checker actually reads",
      '- "analyses/**"' in _wf
      and '- "screener/**"' not in _wf and '- "commodity/**"' not in _wf and '- "watchlist/**"' not in _wf,
      "screener/commodity/watchlist have their own validators; triggering here reported them 'checked'")
check("the job mutates issues only when running on main (guards a workflow_dispatch on a feature branch)",
      "github.ref == 'refs/heads/main'" in _wf)


print(f"\n{'ALL PASS' if not _fails else 'FAILURES: ' + ', '.join(_fails)}")
sys.exit(1 if _fails else 0)
