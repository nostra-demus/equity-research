#!/usr/bin/env python3
"""Regression for exact-main-push CI authorization and the immutable release ledger."""

from __future__ import annotations

import hashlib
import http.server
import json
import os
import pathlib
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


class GitHubFixture(http.server.BaseHTTPRequestHandler):
    workflow_head = ""
    missing_job = False

    def do_GET(self) -> None:  # noqa: N802 - stdlib callback name
        if self.headers.get("Authorization") != f"Bearer {TOKEN}":
            self.send_error(401)
            return
        path = urllib.parse.urlparse(self.path).path
        if path.endswith("/runs/7001/jobs"):
            names = JOB_NAMES[:-1] if self.missing_job else JOB_NAMES
            value = {
                "jobs": [
                    {"name": name, "status": "completed", "conclusion": "success"}
                    for name in names
                ]
            }
        elif "/actions/workflows/" in path and path.endswith("/runs"):
            value = {
                "workflow_runs": [
                    {
                        "id": 7001,
                        "run_attempt": 1,
                        "path": ".github/workflows/ci.yml",
                        "event": "push",
                        "head_branch": "main",
                        "head_sha": self.workflow_head,
                        "status": "completed",
                        "conclusion": "success",
                        "html_url": "https://github.com/nostra-demus/equity-research/actions/runs/7001",
                        "created_at": "2026-08-29T10:00:00Z",
                        "updated_at": "2026-08-29T10:05:00Z",
                    }
                ]
            }
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
    GitHubFixture.workflow_head = reviewed
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), GitHubFixture)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    api_base = f"http://127.0.0.1:{server.server_address[1]}"
    try:
        state = root / "state"
        issued = run(
            sys.executable,
            str(HELPER),
            "authorize-ci",
            "--repo",
            str(repo),
            "--state-dir",
            str(state),
            "--target",
            data_target,
            "--repository",
            "nostra-demus/equity-research",
            "--token-command",
            str(token_command),
            "--api-base",
            api_base,
            cwd=repo,
        )
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

        # One missing required job cannot mint a receipt, and the secret is absent from all output.
        GitHubFixture.missing_job = True
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
        GitHubFixture.missing_job = False
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

        # Any edit to an earlier event breaks the chain and blocks the next append.
        chained[0]["health_result"] = "failed"
        ledger.write_text("\n".join(json.dumps(row) for row in chained) + "\n", encoding="utf-8")
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
