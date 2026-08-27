#!/usr/bin/env python3
"""Deterministic regression for the exact-program production deployment gate."""

from __future__ import annotations

import json
import os
import pathlib
import shutil
import subprocess
import sys
import tempfile


HERE = pathlib.Path(__file__).resolve().parent
HELPER = HERE / "deploy-authorization.py"


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


with tempfile.TemporaryDirectory(prefix="deploy-authorization-test-") as temporary:
    root = pathlib.Path(temporary)
    remote = root / "origin.git"
    repo = root / "repo"
    state = root / "state"
    run("git", "init", "--bare", "-q", "-b", "main", str(remote), cwd=root)
    run("git", "clone", "-q", str(remote), str(repo), cwd=root)
    run("git", "config", "user.name", "Deploy Test", cwd=repo)
    run("git", "config", "user.email", "deploy@example.com", cwd=repo)
    base = commit(repo, "ui/server/src/base.ts", "base\n", "base")
    run("git", "push", "-q", "origin", "main", cwd=repo)
    approved = commit(repo, "ui/server/src/change.ts", "reviewed\n", "reviewed code")
    run("git", "push", "-q", "origin", "main", cwd=repo)

    issued = run(
        sys.executable,
        str(HELPER),
        "authorize",
        "--repo",
        str(repo),
        "--state-dir",
        str(state),
        "--commit",
        approved,
        "--authorization-reference",
        "PR-TEST explicit deployment approval",
        "--authorized-by",
        "fixture-owner",
        cwd=repo,
    )
    assert f"AUTHORIZED_COMMIT={approved}" in issued.stdout
    stat_mode = oct((state / "deploy-authorization.json").stat().st_mode & 0o777)
    assert stat_mode == "0o600"
    exact = run(
        sys.executable, str(HELPER), "check", "--repo", str(repo), "--state-dir", str(state),
        "--target", approved, cwd=repo,
    )
    assert f"AUTHORIZED_COMMIT={approved}" in exact.stdout

    data_target = commit(repo, "analyses/TEST/result.json", "{}\n", "autonomous data")
    run("git", "push", "-q", "origin", "main", cwd=repo)
    trailing_data = run(
        sys.executable, str(HELPER), "check", "--repo", str(repo), "--state-dir", str(state),
        "--target", data_target, cwd=repo,
    )
    assert trailing_data.returncode == 0

    code_target = commit(repo, "ui/web/src/later.ts", "not approved\n", "later code")
    run("git", "push", "-q", "origin", "main", cwd=repo)
    later_code = run(
        sys.executable, str(HELPER), "check", "--repo", str(repo), "--state-dir", str(state),
        "--target", code_target, cwd=repo, ok=False,
    )
    assert later_code.returncode == 1 and "target program differs" in later_code.stderr

    consumed = run(
        sys.executable, str(HELPER), "consume", "--repo", str(repo), "--state-dir", str(state),
        "--target", data_target, "--approved-commit", approved, cwd=repo,
    )
    assert f"CONSUMED_COMMIT={approved}" in consumed.stdout
    assert not (state / "deploy-authorization.json").exists()
    missing = run(
        sys.executable, str(HELPER), "check", "--repo", str(repo), "--state-dir", str(state),
        "--target", data_target, cwd=repo, ok=False,
    )
    assert missing.returncode == 1 and "no deployment authorization receipt" in missing.stderr

    # A malformed or symlinked receipt fails closed; it is never silently replaced by authorize.
    outside = root / "outside.json"
    outside.write_text(json.dumps({"schema_version": "forged"}), encoding="utf-8")
    (state / "deploy-authorization.json").symlink_to(outside)
    unsafe = run(
        sys.executable, str(HELPER), "check", "--repo", str(repo), "--state-dir", str(state),
        "--target", data_target, cwd=repo, ok=False,
    )
    assert unsafe.returncode == 1 and "safe owner-only file" in unsafe.stderr

    # Full watcher boundary: newer merged code with no receipt may fetch the object, but must exit before
    # writer intent, checkout movement, build, launchctl, or any other production mutation.
    production = root / "production"
    production_home = root / "production-home"
    run("git", "clone", "-q", str(remote), str(production), cwd=root)
    run("git", "checkout", "-q", "-B", "main", base, cwd=production)
    ops = production_home / ".nostra-ops"
    ops.mkdir(parents=True, mode=0o700)
    shutil.copy2(HELPER, ops / HELPER.name)
    (ops / HELPER.name).chmod(0o700)
    (ops / ".deployed.sha").write_text(base + "\n", encoding="utf-8")
    watcher_env = dict(os.environ)
    watcher_env.update({"HOME": str(production_home), "ENGINE_REPO_ROOT": str(production)})
    watcher = subprocess.run(
        ["bash", str(HERE / "deploy.sh")],
        cwd=production,
        env=watcher_env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    local_after = run("git", "rev-parse", "HEAD", cwd=production).stdout.strip()
    log = (production_home / "Library" / "Logs" / "nostradamus-deploy.log").read_text(encoding="utf-8")
    intent = production / "ui" / "server" / ".state" / "provider-deploy-pending"
    assert watcher.returncode == 0 and local_after == base
    assert "BLOCKED production program differs" in log
    assert not intent.exists()

print("test-deploy-authorization.py: exact program, inert merge, data-only drift, one-shot, and file safety passed")
