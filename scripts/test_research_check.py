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
    MARKER, classify, issue_actions, issue_body, issue_title, main, runs_from_paths, scored_only, status_of,
    summary_markdown,
)

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

print(f"\n{'ALL PASS' if not _fails else 'FAILURES: ' + ', '.join(_fails)}")
sys.exit(1 if _fails else 0)
