#!/usr/bin/env python3
"""Regression for exact-main-push CI authorization and the immutable release ledger."""

from __future__ import annotations

import hashlib
import http.server
import json
import os
import pathlib
import re
import subprocess
import sys
import tempfile
import threading
import urllib.parse


HERE = pathlib.Path(__file__).resolve().parent
HELPER = HERE / "deploy-authorization.py"
TOKEN = "ghs_fixture_secret_1234567890"
JOB_NAMES = [
    "ui/server — typecheck + tests",
    "eval — decision-record contracts + framework anchors",
    "tools — deterministic extractor + CIQ facts tests",
    "ui/web — typecheck + tests + build",
    "edge — offline-gate uptime-monitor unit tests",
]


def run(*args: str, cwd: pathlib.Path, ok: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(args, cwd=cwd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if ok and result.returncode != 0:
        raise AssertionError(f"command failed: {args}\nstdout={result.stdout}\nstderr={result.stderr}")
    return result


def commit(repo: pathlib.Path, relative: str, body: str, message: str) -> str:
    path = repo / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(body, encoding="utf-8")
    run("git", "add", relative, cwd=repo)
    run("git", "commit", "-qm", message, cwd=repo)
    return run("git", "rev-parse", "HEAD", cwd=repo).stdout.strip()


def workflow_run(
    head: str,
    *,
    run_id: int = 7001,
    event: str = "push",
    branch: str = "main",
    status: str = "completed",
    conclusion: str = "success",
) -> dict[str, object]:
    return {
        "id": run_id,
        "run_attempt": 1,
        "path": ".github/workflows/ci.yml",
        "event": event,
        "head_branch": branch,
        "head_sha": head,
        "status": status,
        "conclusion": conclusion,
        "html_url": f"https://github.com/nostra-demus/equity-research/actions/runs/{run_id}",
        "created_at": "2026-08-29T10:00:00Z",
        "updated_at": "2026-08-29T10:05:00Z",
    }


def job_rows(*, missing: str | None = None, overrides: dict[str, tuple[str, str]] | None = None) -> list[dict[str, str]]:
    result: list[dict[str, str]] = []
    for name in JOB_NAMES:
        if name == missing:
            continue
        status, conclusion = (overrides or {}).get(name, ("completed", "success"))
        result.append({"name": name, "status": status, "conclusion": conclusion})
    return result


class GitHubFixture(http.server.BaseHTTPRequestHandler):
    workflow_runs: list[dict[str, object]] = []
    jobs_by_run: dict[int, list[dict[str, str]]] = {}

    def do_GET(self) -> None:  # noqa: N802 - stdlib callback name
        if self.headers.get("Authorization") != f"Bearer {TOKEN}":
            self.send_error(401)
            return
        path = urllib.parse.urlparse(self.path).path
        jobs_match = re.search(r"/actions/runs/(\d+)/jobs$", path)
        if jobs_match:
            run_id = int(jobs_match.group(1))
            value = {"jobs": self.jobs_by_run.get(run_id, [])}
        elif "/actions/workflows/" in path and path.endswith("/runs"):
            value = {"workflow_runs": self.workflow_runs}
        else:
            self.send_error(404)
            return
        encoded = json.dumps(value).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def log_message(self, _format: str, *_args: object) -> None:
        return


with tempfile.TemporaryDirectory(prefix="deploy-push-ci-test-") as temporary:
    root = pathlib.Path(temporary)
    remote = root / "origin.git"
    repo = root / "repo"
    run("git", "init", "--bare", "-q", "-b", "main", str(remote), cwd=root)
    run("git", "clone", "-q", str(remote), str(repo), cwd=root)
    run("git", "config", "user.name", "Deploy CI Test", cwd=repo)
    run("git", "config", "user.email", "deploy-ci@example.com", cwd=repo)
    base = commit(repo, "ui/server/src/base.ts", "base\n", "base")
    reviewed = commit(repo, "ui/server/src/reviewed.ts", "reviewed\n", "reviewed program")
    run("git", "push", "-q", "origin", "main", cwd=repo)
    data_target = commit(repo, "analyses/TEST/result.json", "{}\n", "data after green code")
    run("git", "push", "-q", "origin", "main", cwd=repo)

    token_command = root / "token-command.sh"
    token_command.write_text(f"#!/bin/sh\nprintf '%s\\n' '{TOKEN}'\n", encoding="utf-8")
    token_command.chmod(0o700)
    GitHubFixture.workflow_runs = [workflow_run(reviewed)]
    GitHubFixture.jobs_by_run = {7001: job_rows()}
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), GitHubFixture)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    api_base = f"http://127.0.0.1:{server.server_address[1]}"
    try:
        def authorize_to(destination: pathlib.Path, *, ok: bool = True) -> subprocess.CompletedProcess[str]:
            return run(
                sys.executable,
                str(HELPER),
                "authorize-ci",
                "--repo",
                str(repo),
                "--state-dir",
                str(destination),
                "--target",
                data_target,
                "--repository",
                "nostra-demus/equity-research",
                "--token-command",
                str(token_command),
                "--api-base",
                api_base,
                cwd=repo,
                ok=ok,
            )

        state = root / "state"
        issued = authorize_to(state)
        assert f"AUTHORIZED_COMMIT={reviewed}" in issued.stdout
        assert "WORKFLOW_RUN_ID=7001" in issued.stdout
        receipt = json.loads((state / "deploy-authorization.json").read_text(encoding="utf-8"))
        assert receipt["authorization_source"] == "exact_main_push_ci"
        assert receipt["workflow"]["head_sha"] == reviewed
        assert set(receipt["workflow"]["jobs"]) == {
            "ui-server", "eval-contracts", "tools-tests", "ui-web", "edge"
        }

        ledger = root / "audit" / "events.jsonl"
        audit_args = (
            sys.executable,
            str(HELPER),
            "audit",
            "--repo",
            str(repo),
            "--state-dir",
            str(state),
            "--target",
            data_target,
            "--approved-commit",
            reviewed,
            "--ledger",
            str(ledger),
            "--started-at-epoch",
            "1",
            "--health-result",
            "healthy",
            "--rollback-result",
            "not_needed",
            "--deployed-commit",
            data_target,
        )
        first = run(*audit_args, cwd=repo)
        repeated = run(*audit_args, cwd=repo)
        assert first.stdout == repeated.stdout
        rows = [json.loads(line) for line in ledger.read_text(encoding="utf-8").splitlines()]
        assert len(rows) == 1 and rows[0]["previous_event_sha256"] is None
        unhashed = dict(rows[0])
        event_hash = unhashed.pop("event_sha256")
        canonical = json.dumps(unhashed, sort_keys=True, separators=(",", ":")).encode("utf-8")
        assert event_hash == "sha256:" + hashlib.sha256(canonical).hexdigest()
        assert oct(ledger.stat().st_mode & 0o777) == "0o600"
        anchor = ledger.with_name(f"{ledger.name}.anchor.json")
        anchor_value = json.loads(anchor.read_text(encoding="utf-8"))
        assert oct(anchor.stat().st_mode & 0o777) == "0o600"
        assert anchor_value["event_count"] == 1
        assert anchor_value["tip_event_sha256"] == rows[0]["event_sha256"]
        assert anchor_value["ledger_size_bytes"] == ledger.stat().st_size

        failed_audit = run(
            sys.executable,
            str(HELPER),
            "audit",
            "--repo",
            str(repo),
            "--state-dir",
            str(state),
            "--target",
            data_target,
            "--approved-commit",
            reviewed,
            "--ledger",
            str(ledger),
            "--started-at-epoch",
            "2",
            "--health-result",
            "failed",
            "--rollback-result",
            "restored_last_good",
            "--deployed-commit",
            base,
            cwd=repo,
        )
        assert "AUDIT_EVENT_SHA256=sha256:" in failed_audit.stdout
        chained = [json.loads(line) for line in ledger.read_text(encoding="utf-8").splitlines()]
        assert len(chained) == 2 and chained[1]["previous_event_sha256"] == chained[0]["event_sha256"]
        anchor_value = json.loads(anchor.read_text(encoding="utf-8"))
        assert anchor_value["event_count"] == 2
        assert anchor_value["tip_event_sha256"] == chained[-1]["event_sha256"]

        # One missing required job cannot mint a receipt, and the secret is absent from all output.
        GitHubFixture.jobs_by_run = {7001: job_rows(missing=JOB_NAMES[-1])}
        missing_state = root / "missing-state"
        missing = run(
            sys.executable,
            str(HELPER),
            "authorize-ci",
            "--repo",
            str(repo),
            "--state-dir",
            str(missing_state),
            "--target",
            data_target,
            "--repository",
            "nostra-demus/equity-research",
            "--token-command",
            str(token_command),
            "--api-base",
            api_base,
            cwd=repo,
            ok=False,
        )
        assert missing.returncode == 1 and "required push-CI job is not green" in missing.stderr
        assert TOKEN not in missing.stdout + missing.stderr
        assert not (missing_state / "deploy-authorization.json").exists()

        # A green workflow for an older, different program cannot authorize newer code.
        GitHubFixture.jobs_by_run = {7001: job_rows()}

        # A failed/cancelled run, wrong event, or wrong branch never authorizes even when its SHA and jobs
        # look perfect. These cases make deleting the run-level filter fail the regression suite.
        for label, invalid_run in (
            ("failed-run", workflow_run(reviewed, conclusion="failure")),
            ("cancelled-run", workflow_run(reviewed, conclusion="cancelled")),
            ("wrong-event", workflow_run(reviewed, event="pull_request")),
            ("wrong-branch", workflow_run(reviewed, branch="release-candidate")),
        ):
            GitHubFixture.workflow_runs = [invalid_run]
            refused = authorize_to(root / label, ok=False)
            assert refused.returncode == 1 and "no exact all-green main push workflow" in refused.stderr

        # Every required job must itself be completed/successful. A skipped, cancelled, or still-running
        # job cannot hide behind a successful workflow conclusion.
        GitHubFixture.workflow_runs = [workflow_run(reviewed)]
        for label, status, conclusion in (
            ("skipped-job", "completed", "skipped"),
            ("cancelled-job", "completed", "cancelled"),
            ("running-job", "in_progress", ""),
        ):
            GitHubFixture.jobs_by_run = {
                7001: job_rows(overrides={JOB_NAMES[0]: (status, conclusion)})
            }
            refused = authorize_to(root / label, ok=False)
            assert refused.returncode == 1 and "required push-CI job is not green" in refused.stderr

        # Selection is not "first row wins": invalid newer rows are ignored and the exact green main-push
        # run is selected from a multi-run response.
        GitHubFixture.workflow_runs = [
            workflow_run(reviewed, run_id=7201),
            workflow_run(reviewed, run_id=7202, event="pull_request"),
            workflow_run(reviewed, run_id=7203),
        ]
        GitHubFixture.jobs_by_run = {
            7201: job_rows(overrides={JOB_NAMES[0]: ("completed", "cancelled")}),
            7202: job_rows(),
            7203: job_rows(),
        }
        selected = authorize_to(root / "multi-run")
        assert "WORKFLOW_RUN_ID=7203" in selected.stdout

        GitHubFixture.workflow_runs = [workflow_run(reviewed)]
        GitHubFixture.jobs_by_run = {7001: job_rows()}
        later_code = commit(repo, "ui/web/src/later.ts", "later\n", "later unproved program")
        run("git", "push", "-q", "origin", "main", cwd=repo)
        wrong_state = root / "wrong-state"
        wrong = run(
            sys.executable,
            str(HELPER),
            "authorize-ci",
            "--repo",
            str(repo),
            "--state-dir",
            str(wrong_state),
            "--target",
            later_code,
            "--repository",
            "nostra-demus/equity-research",
            "--token-command",
            str(token_command),
            "--api-base",
            api_base,
            cwd=repo,
            ok=False,
        )
        assert wrong.returncode == 1 and "no exact all-green main push workflow" in wrong.stderr
        assert not (wrong_state / "deploy-authorization.json").exists()

        # A symlinked token command is rejected before any network request.
        linked = root / "linked-token.sh"
        linked.symlink_to(token_command)
        unsafe = run(
            sys.executable,
            str(HELPER),
            "authorize-ci",
            "--repo",
            str(repo),
            "--state-dir",
            str(root / "unsafe-state"),
            "--target",
            later_code,
            "--repository",
            "nostra-demus/equity-research",
            "--token-command",
            str(linked),
            "--api-base",
            api_base,
            cwd=repo,
            ok=False,
        )
        assert unsafe.returncode == 1 and "safe owner-controlled executable" in unsafe.stderr

        # Dropping a valid trailing row used to leave a valid hash chain. The separate durable length/tip
        # anchor now makes that deletion visible and blocks every later append.
        original_ledger = ledger.read_bytes()
        original_anchor = anchor.read_bytes()
        lines = original_ledger.splitlines(keepends=True)
        ledger.write_bytes(b"".join(lines[:-1]))
        ledger.chmod(0o600)
        truncated = run(*audit_args, cwd=repo, ok=False)
        assert truncated.returncode == 1 and "durable length/tip anchor" in truncated.stderr

        # A non-empty ledger without its anchor is also untrusted; it is never silently re-anchored.
        ledger.write_bytes(original_ledger)
        ledger.chmod(0o600)
        anchor.unlink()
        missing_anchor = run(*audit_args, cwd=repo, ok=False)
        assert missing_anchor.returncode == 1 and "anchor is missing" in missing_anchor.stderr

        # Restore the exact pair, then prove ordinary in-place row tampering remains detected too.
        ledger.write_bytes(original_ledger)
        ledger.chmod(0o600)
        anchor.write_bytes(original_anchor)
        anchor.chmod(0o600)
        text = original_ledger.decode("utf-8")
        original_target = chained[0]["target_commit"]
        altered_target = ("0" if original_target[0] != "0" else "1") + original_target[1:]
        ledger.write_text(text.replace(original_target, altered_target, 1), encoding="utf-8")
        ledger.chmod(0o600)
        tampered = run(*audit_args, cwd=repo, ok=False)
        assert tampered.returncode == 1 and "event digest disagrees" in tampered.stderr
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)

ci = (HERE.parent.parent / ".github" / "workflows" / "ci.yml").read_text(encoding="utf-8")
push_block = ci[ci.index("  push:"):ci.index("\n# A newer commit", ci.index("  push:"))]
for root in ("analyses/**", "screener/**", "commodity/**", "watchlist/**"):
    assert f'- "{root}"' in push_block
for job_id, display_name in zip(
    ("ui-server", "eval-contracts", "tools-tests", "ui-web", "edge"),
    JOB_NAMES,
):
    assert f"  {job_id}:\n" in ci
    assert f"    name: {display_name}\n" in ci

print("test-deploy-push-ci.py: exact push, five jobs, data drift, token safety, and audit ledger passed")
