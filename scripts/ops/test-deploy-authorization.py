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
    commit(repo, "ui/server/src/base.ts", "base\n", "base")
    production_token = repo / "scripts" / "ops" / "gh-app-token.sh"
    production_token.parent.mkdir(parents=True, exist_ok=True)
    production_token.write_text(
        "#!/bin/sh\nprintf 'PRODUCTION CHECKOUT TOKEN EXECUTED\\n' > \"$PROD_TOKEN_SENTINEL\"\nexit 1\n",
        encoding="utf-8",
    )
    production_token.chmod(0o700)
    run("git", "add", "scripts/ops/gh-app-token.sh", cwd=repo)
    run("git", "commit", "-qm", "base token helper", cwd=repo)
    base = run("git", "rev-parse", "HEAD", cwd=repo).stdout.strip()
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

    # Empty or over-long receipt metadata must fail closed BEFORE a receipt is written, so an unset
    # shell var (--authorized-by "") cannot wedge deployment behind an unconsumable receipt that
    # authorize then refuses to replace. validate_shape requires a non-empty string of <=256 chars,
    # so authorize must enforce the same rule up front rather than write a receipt every check rejects.
    meta_state = root / "empty-meta-state"
    empty_meta = run(
        sys.executable, str(HELPER), "authorize", "--repo", str(repo), "--state-dir", str(meta_state),
        "--commit", approved, "--authorization-reference", "ref", "--authorized-by", "",
        cwd=repo, ok=False,
    )
    assert empty_meta.returncode == 1 and "--authorized-by must be a non-empty" in empty_meta.stderr
    assert not (meta_state / "deploy-authorization.json").exists()
    long_ref = run(
        sys.executable, str(HELPER), "authorize", "--repo", str(repo), "--state-dir", str(meta_state),
        "--commit", approved, "--authorization-reference", "x" * 257, "--authorized-by", "owner",
        cwd=repo, ok=False,
    )
    assert long_ref.returncode == 1 and "--authorization-reference must be a non-empty" in long_ref.stderr
    assert not (meta_state / "deploy-authorization.json").exists()
    # No wedge was created: a well-formed authorize into the same clean state still succeeds.
    recovered = run(
        sys.executable, str(HELPER), "authorize", "--repo", str(repo), "--state-dir", str(meta_state),
        "--commit", approved, "--authorization-reference", "ref", "--authorized-by", "owner",
        cwd=repo,
    )
    assert f"AUTHORIZED_COMMIT={approved}" in recovered.stdout

    # The old installed watcher may atomically replace its helper before consuming the one manual receipt
    # that bootstraps this release. v1 remains acceptable only as the same short-lived exact manual proof.
    legacy_state = root / "legacy-state"
    legacy_state.mkdir(mode=0o700)
    legacy = json.loads((meta_state / "deploy-authorization.json").read_text(encoding="utf-8"))
    legacy["schema_version"] = "nostra-deploy-authorization/1.0"
    del legacy["authorization_source"]
    del legacy["workflow"]
    legacy_path = legacy_state / "deploy-authorization.json"
    legacy_path.write_text(json.dumps(legacy) + "\n", encoding="utf-8")
    legacy_path.chmod(0o600)
    legacy_check = run(
        sys.executable, str(HELPER), "check", "--repo", str(repo), "--state-dir", str(legacy_state),
        "--target", data_target, cwd=repo,
    )
    assert f"AUTHORIZED_COMMIT={approved}" in legacy_check.stdout

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
    trusted_token_sentinel = root / "trusted-token-ran"
    production_token_sentinel = root / "production-token-ran"
    trusted_token = ops / "gh-app-token.sh"
    trusted_token.write_text(
        "#!/bin/sh\nprintf 'TRUSTED TOKEN EXECUTED\\n' > \"$TRUSTED_TOKEN_SENTINEL\"\nexit 1\n",
        encoding="utf-8",
    )
    trusted_token.chmod(0o700)
    (ops / ".deployed.sha").write_text(base + "\n", encoding="utf-8")
    watcher_env = dict(os.environ)
    watcher_env.update({
        "HOME": str(production_home),
        "ENGINE_REPO_ROOT": str(production),
        "TRUSTED_TOKEN_SENTINEL": str(trusted_token_sentinel),
        "PROD_TOKEN_SENTINEL": str(production_token_sentinel),
    })
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
    assert "BLOCKED production program" in log and "lacks an exact successful main-push workflow" in log
    assert not intent.exists()
    assert trusted_token_sentinel.exists(), "the installed owner-only token helper should handle clean preflight"
    assert not production_token_sentinel.exists(), "the production checkout token helper must never execute"

    # A dirty non-data path blocks before even the trusted helper mints a token. This closes the ordering
    # hole where an unreviewed checkout edit could run with the GitHub App's ruleset-bypass credentials.
    trusted_token_sentinel.unlink()
    dirty = production / "ui" / "web" / "src" / "unreviewed-local.ts"
    dirty.parent.mkdir(parents=True, exist_ok=True)
    dirty.write_text("unreviewed\n", encoding="utf-8")
    dirty_watcher = subprocess.run(
        ["bash", str(HERE / "deploy.sh")],
        cwd=production,
        env=watcher_env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    dirty_log = (production_home / "Library" / "Logs" / "nostradamus-deploy.log").read_text(encoding="utf-8")
    assert dirty_watcher.returncode == 0
    assert "before authorization" in dirty_log and "dirty non-data" in dirty_log
    assert not trusted_token_sentinel.exists(), "dirty checkout must block before trusted token minting"
    assert not production_token_sentinel.exists(), "dirty checkout token helper must never execute"

    # A post-health audit failure must not rebuild/restart the already-live target every watcher tick.
    # The target marker advances truthfully, a durable audit-only journal remains, and recovery appends the
    # event + consumes the receipt without invoking npm a second time.
    audit_remote = root / "audit-origin.git"
    audit_repo = root / "audit-repo"
    audit_production = root / "audit-production"
    audit_home = root / "audit-home"
    run("git", "init", "--bare", "-q", "-b", "main", str(audit_remote), cwd=root)
    run("git", "clone", "-q", str(audit_remote), str(audit_repo), cwd=root)
    run("git", "config", "user.name", "Deploy Audit Test", cwd=audit_repo)
    run("git", "config", "user.email", "deploy-audit@example.com", cwd=audit_repo)
    commit(audit_repo, ".gitignore", "ui/server/.state/\nui/dist/\n", "audit fixture ignores runtime state")
    audit_base = commit(audit_repo, "ui/web/src/base.ts", "base\n", "audit base")
    run("git", "push", "-q", "origin", "main", cwd=audit_repo)
    audit_target = commit(audit_repo, "ui/web/src/change.ts", "reviewed\n", "audit target")
    run("git", "push", "-q", "origin", "main", cwd=audit_repo)
    run("git", "clone", "-q", str(audit_remote), str(audit_production), cwd=root)
    run("git", "checkout", "-q", "-B", "main", audit_base, cwd=audit_production)

    audit_ops = audit_home / ".nostra-ops"
    audit_ops.mkdir(parents=True, mode=0o700)
    shutil.copy2(HELPER, audit_ops / HELPER.name)
    (audit_ops / HELPER.name).chmod(0o700)
    (audit_ops / "gh-app-token.sh").write_text("#!/bin/sh\nexit 1\n", encoding="utf-8")
    (audit_ops / "gh-app-token.sh").chmod(0o700)
    (audit_ops / ".deployed.sha").write_text(audit_base + "\n", encoding="utf-8")
    audit_state = audit_ops / "deploy-authorizations"
    run(
        sys.executable, str(HELPER), "authorize", "--repo", str(audit_production),
        "--state-dir", str(audit_state), "--commit", audit_target,
        "--authorization-reference", "PR-642 audit breaker fixture", "--authorized-by", "fixture-owner",
        cwd=audit_production,
    )
    unsafe_audit_dir = audit_home / "unsafe-audit"
    unsafe_audit_dir.mkdir(parents=True, mode=0o755)
    audit_ledger = unsafe_audit_dir / "events.jsonl"
    mock_bin = root / "audit-bin"
    mock_bin.mkdir()
    npm_calls = root / "npm-calls"
    (mock_bin / "npm").write_text(
        "#!/bin/sh\nprintf 'npm\\n' >> \"$NPM_CALLS\"\nexit 0\n",
        encoding="utf-8",
    )
    (mock_bin / "launchctl").write_text(
        "#!/bin/sh\n[ \"${1:-}\" = print ] && exit 1\nexit 0\n",
        encoding="utf-8",
    )
    (mock_bin / "npm").chmod(0o700)
    (mock_bin / "launchctl").chmod(0o700)
    audit_env = dict(os.environ)
    audit_env.update({
        "HOME": str(audit_home),
        "ENGINE_REPO_ROOT": str(audit_production),
        "NOSTRA_DEPLOY_AUTHORIZATION_DIR": str(audit_state),
        "NOSTRA_DEPLOY_AUTHORIZATION_HELPER": str(audit_ops / HELPER.name),
        "NOSTRA_DEPLOY_AUDIT_LEDGER": str(audit_ledger),
        "NPM_CALLS": str(npm_calls),
        "PATH": f"{mock_bin}:{os.environ.get('PATH', '/usr/bin:/bin:/usr/sbin:/sbin')}",
    })

    first_audit_tick = subprocess.run(
        ["bash", str(HERE / "deploy.sh")], cwd=audit_production, env=audit_env,
        text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    audit_pending = audit_ops / ".deploy.audit-pending"
    audit_receipt = audit_state / "deploy-authorization.json"
    assert first_audit_tick.returncode == 0
    deployed_after_first = (audit_ops / ".deployed.sha").read_text(encoding="utf-8").strip()
    first_audit_log = (audit_home / "Library" / "Logs" / "nostradamus-deploy.log").read_text(encoding="utf-8")
    assert deployed_after_first == audit_target, (
        f"deployment marker stayed at {deployed_after_first}; target={audit_target}\n{first_audit_log}"
    )
    assert audit_pending.exists() and audit_receipt.exists()
    assert npm_calls.read_text(encoding="utf-8").splitlines() == ["npm"]
    audit_log = (audit_home / "Library" / "Logs" / "nostradamus-deploy.log").read_text(encoding="utf-8")
    assert "AUDIT PENDING" in audit_log and f"DONE {audit_target[:9]}" not in audit_log

    second_audit_tick = subprocess.run(
        ["bash", str(HERE / "deploy.sh")], cwd=audit_production, env=audit_env,
        text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    assert second_audit_tick.returncode == 0 and audit_pending.exists()
    assert npm_calls.read_text(encoding="utf-8").splitlines() == ["npm"]
    audit_log = (audit_home / "Library" / "Logs" / "nostradamus-deploy.log").read_text(encoding="utf-8")
    assert "no checkout, build, restart, or admission pause attempted" in audit_log

    unsafe_audit_dir.chmod(0o700)
    recovery_tick = subprocess.run(
        ["bash", str(HERE / "deploy.sh")], cwd=audit_production, env=audit_env,
        text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    assert recovery_tick.returncode == 0
    assert not audit_pending.exists() and not audit_receipt.exists()
    assert npm_calls.read_text(encoding="utf-8").splitlines() == ["npm"]
    assert audit_ledger.exists() and audit_ledger.with_name("events.jsonl.anchor.json").exists()

print("test-deploy-authorization.py: trusted preflight, dirty-before-token, audit-only recovery, exact program, and one-shot safety passed")
