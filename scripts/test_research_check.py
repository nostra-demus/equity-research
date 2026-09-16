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
    MARKER, ap_failures, classify, deleted_records, deleted_title, issue_actions, issue_body, issue_title,
    main, runs_from_paths, scored_only, status_of, suite_contract_failures, summary_markdown,
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
                "open(%r, 'a').write(' '.join(argv[:3]) + '\\n')\n"
                "if argv[:2] == ['issue', 'list']:\n"
                "    sys.stdout.write('[{\"number\":101,\"body\":\"<!-- research-eval:OLDFAIL_2026-09-16 -->\"},'\n"
                "                     '{\"number\":102,\"body\":\"<!-- research-eval:FIXED_2026-09-16 -->\"}]')\n"
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
        check("exactly one issue is created (only the new failing run), not the fixed-no-issue run",
              log.count("issue create") == 1, f"saw {log.count('issue create')} create call(s)")
else:
    print("  skip  shell-issue test — jq/bash not on PATH")


print(f"\n{'ALL PASS' if not _fails else 'FAILURES: ' + ', '.join(_fails)}")
sys.exit(1 if _fails else 0)
