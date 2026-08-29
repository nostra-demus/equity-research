#!/usr/bin/env python3
"""Regression tests for the cross-process repository mutation lease."""
from __future__ import annotations

import json
import fcntl
import os
import subprocess
import sys
import tempfile
import time

from repo_mutation import append_ndjson, atomic_write_json, repository_mutation


HERE = os.path.dirname(os.path.abspath(__file__))
APPEND = os.path.join(HERE, "append-ndjson.sh")
DEPLOY = os.path.join(HERE, "ops", "deploy.sh")


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def run(cmd: list[str], cwd: str, env: dict[str, str] | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, cwd=cwd, env=env, check=True, capture_output=True, text=True)


def test_deploy_holds_both_leases_through_build() -> None:
    """No second deploy or repository mutation may enter while npm reads the live source tree."""
    with tempfile.TemporaryDirectory(prefix="deploy-lease-test-") as tmp:
        env = {**os.environ,
               "GIT_AUTHOR_NAME": "Test", "GIT_AUTHOR_EMAIL": "test@example.com",
               "GIT_COMMITTER_NAME": "Test", "GIT_COMMITTER_EMAIL": "test@example.com"}
        origin = os.path.join(tmp, "origin.git")
        seed = os.path.join(tmp, "seed")
        prod = os.path.join(tmp, "prod")
        home = os.path.join(tmp, "home")
        fake_bin = os.path.join(tmp, "bin")
        os.makedirs(fake_bin)
        os.makedirs(home)
        run(["git", "init", "--bare", "-q", "-b", "main", origin], tmp, env)
        run(["git", "clone", "-q", origin, seed], tmp, env)
        os.makedirs(os.path.join(seed, "ui", "web", "src"), exist_ok=True)
        with open(os.path.join(seed, "ui", "web", "src", "version.ts"), "w", encoding="utf-8") as handle:
            handle.write("export const version = 1\n")
        run(["git", "add", "."], seed, env)
        run(["git", "commit", "-q", "-m", "base"], seed, env)
        run(["git", "push", "-q", "origin", "main"], seed, env)
        run(["git", "clone", "-q", origin, prod], tmp, env)
        base = run(["git", "rev-parse", "HEAD"], prod, env).stdout.strip()

        with open(os.path.join(seed, "ui", "web", "src", "version.ts"), "w", encoding="utf-8") as handle:
            handle.write("export const version = 2\n")
        run(["git", "add", "."], seed, env)
        run(["git", "commit", "-q", "-m", "web update"], seed, env)
        run(["git", "push", "-q", "origin", "main"], seed, env)
        target = run(["git", "rev-parse", "HEAD"], seed, env).stdout.strip()

        # The base..target delta is a code change (ui/web/src/version.ts), so deploy.sh's exact-program
        # gate requires an unexpired owner receipt before it may rebuild. Issue one for target's program
        # so this test still exercises the deploy/build lease (its subject) rather than stalling at the
        # gate. The manifest is hashed from git objects, so give prod target's objects first (no checkout
        # move — HEAD stays on base) and authorize from the same repo the gate verifies against.
        run(["git", "fetch", "-q", "origin", "main"], prod, env)
        authz_dir = os.path.join(tmp, "deploy-authorizations")
        authz_helper = os.path.join(HERE, "ops", "deploy-authorization.py")
        run([sys.executable, authz_helper, "authorize",
             "--repo", prod, "--state-dir", authz_dir, "--commit", target,
             "--authorization-reference", "repo-mutation-lease-test",
             "--authorized-by", "test-suite", "--ttl-seconds", "3600"], tmp, env)

        ops = os.path.join(home, ".nostra-ops")
        os.makedirs(ops)
        with open(os.path.join(ops, ".deployed.sha"), "w", encoding="utf-8") as handle:
            handle.write(base + "\n")
        started = os.path.join(tmp, "npm.started")
        release = os.path.join(tmp, "npm.release")
        calls = os.path.join(tmp, "npm.calls")
        npm = os.path.join(fake_bin, "npm")
        with open(npm, "w", encoding="utf-8") as handle:
            handle.write("#!/bin/sh\nprintf '%s\\n' \"$*\" >> \"$FAKE_NPM_CALLS\"\n"
                         "touch \"$FAKE_NPM_STARTED\"\n"
                         "while [ ! -f \"$FAKE_NPM_RELEASE\" ]; do sleep 0.02; done\nexit 0\n")
        os.chmod(npm, 0o755)
        for name in ("launchctl", "curl"):
            stub = os.path.join(fake_bin, name)
            with open(stub, "w", encoding="utf-8") as handle:
                handle.write("#!/bin/sh\nexit 0\n")
            os.chmod(stub, 0o755)
        deploy_env = {
            **env,
            "HOME": home,
            "ENGINE_REPO_ROOT": prod,
            "ENGINE_STATE_DIR": os.path.join(tmp, "state"),
            "NOSTRA_POOL": os.path.join(tmp, "absent-pool"),
            "PATH": fake_bin + os.pathsep + "/usr/bin:/bin:/usr/sbin:/sbin",
            "DEPLOY_DEBOUNCE_SECS": "0",
            "NOSTRA_DEPLOY_AUTHORIZATION_DIR": authz_dir,
            "NOSTRA_DEPLOY_AUTHORIZATION_HELPER": authz_helper,
            "FAKE_NPM_STARTED": started,
            "FAKE_NPM_RELEASE": release,
            "FAKE_NPM_CALLS": calls,
        }
        barrier_dir = deploy_env["ENGINE_STATE_DIR"]
        os.makedirs(barrier_dir, mode=0o700, exist_ok=True)
        barrier_path = os.path.join(barrier_dir, "provider-deploy-barrier.flock")
        barrier_fd = os.open(barrier_path, os.O_RDWR | os.O_CREAT | os.O_APPEND, 0o600)
        try:
            fcntl.flock(barrier_fd, fcntl.LOCK_SH | fcntl.LOCK_NB)
            dirty_path = os.path.join(prod, ".codex", "agents", "unreviewed.toml")
            os.makedirs(os.path.dirname(dirty_path), exist_ok=True)
            with open(dirty_path, "w", encoding="utf-8") as handle:
                handle.write("model = 'unreviewed'\n")
            dirty_blocked = subprocess.run(["bash", DEPLOY], cwd=prod, env=deploy_env,
                                           check=False, capture_output=True, text=True, timeout=5)
            check(dirty_blocked.returncode == 0, "a dirty-code deploy should refuse cleanly")
            check(not os.path.exists(os.path.join(barrier_dir, "provider-deploy-pending")),
                  "a known dirty-code blocker must not claim an update is in progress or pause admissions")
            deploy_log = os.path.join(home, "Library", "Logs", "nostradamus-deploy.log")
            check("before authorization" in open(deploy_log, encoding="utf-8").read(),
                  "the refused deployment must record the dirty-tree blocker before token mint or admission pause")
            os.remove(dirty_path)
            os.removedirs(os.path.dirname(dirty_path))

            deferred = subprocess.run(["bash", DEPLOY], cwd=prod, env=deploy_env,
                                      check=False, capture_output=True, text=True, timeout=5)
            check(deferred.returncode == 0, "an active run should defer deploy cleanly")
            check(os.path.exists(os.path.join(barrier_dir, "provider-deploy-pending")),
                  "a clean authorized deploy should pause later admissions while the active run drains")
            check(run(["git", "rev-parse", "HEAD"], prod, env).stdout.strip() == base,
                  "active-run barrier must defer before fast-forwarding the checkout")
            check(not os.path.exists(calls),
                  "active-run barrier must defer before npm reads or mutates the live tree")
            check(open(os.path.join(ops, ".deployed.sha"), encoding="utf-8").read().strip() == base,
                  "active-run barrier must leave the deployed marker unchanged")
        finally:
            os.close(barrier_fd)

        first = subprocess.Popen(["bash", DEPLOY], cwd=prod, env=deploy_env,
                                 stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        try:
            deadline = time.monotonic() + 10
            while not os.path.exists(started) and first.poll() is None and time.monotonic() < deadline:
                time.sleep(0.02)
            check(os.path.exists(started), "first deploy must reach the deliberately blocked build")

            second = subprocess.run(["bash", DEPLOY], cwd=prod, env=deploy_env,
                                    check=False, capture_output=True, text=True, timeout=5)
            check(second.returncode == 0, "a concurrent launchd tick should skip cleanly")
            check(len(open(calls, encoding="utf-8").read().splitlines()) == 1,
                  "whole-deploy flock must prevent a second build")

            probe = subprocess.run(
                [sys.executable, "-c", (
                    "import sys; sys.path.insert(0, sys.argv[1]); "
                    "from repo_mutation import repository_mutation; "
                    "\ntry:\n with repository_mutation(sys.argv[2], 50): pass"
                    "\nexcept TimeoutError: raise SystemExit(7)"
                ), HERE, prod], check=False,
            )
            check(probe.returncode == 7,
                  "repository lease must remain held while npm reads source and before marker publication")
        finally:
            open(release, "a", encoding="utf-8").close()
            try:
                first.communicate(timeout=10)
            except subprocess.TimeoutExpired:
                first.terminate()
                first.communicate(timeout=5)
        check(first.returncode == 0, "the serialized deploy should finish after the build releases")
        check(open(os.path.join(ops, ".deployed.sha"), encoding="utf-8").read().strip() == target,
              "deployed marker must name the exact immutable source commit that was built")


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="repo-mutation-test-") as repo:
        subprocess.run(["git", "init", "-q", repo], check=True)
        ledger = os.path.join(repo, "screener", "ledger", "events.ndjson")
        snapshot = os.path.join(repo, "screener", "ledger", "state", "one.json")
        other_tmp = os.path.join(repo, "other-tmp")
        os.makedirs(other_tmp)

        with repository_mutation(repo) as lease:
            append_ndjson(lease, APPEND, ledger, {"id": "one", "value": 1}, "id", "one")
            append_ndjson(lease, APPEND, ledger, {"id": "one", "value": 99}, "id", "one")
            check(len(open(ledger, encoding="utf-8").read().splitlines()) == 1,
                  "an inherited outer lease must not self-deadlock and idempotency still holds")

            probe = subprocess.run(
                [sys.executable, "-c", (
                    "import sys; sys.path.insert(0, sys.argv[1]); "
                    "from repo_mutation import repository_mutation; "
                    "\ntry:\n with repository_mutation(sys.argv[2], 20): pass"
                    "\nexcept TimeoutError: raise SystemExit(7)"
                ), HERE, repo],
                env={**os.environ, "TMPDIR": other_tmp},
                check=False,
            )
            check(probe.returncode == 7, "another process/TMPDIR must not enter the transaction")

            check(atomic_write_json(snapshot, {"version": 1}, create_only=True), "first snapshot create wins")
            check(not atomic_write_json(snapshot, {"version": 2}, create_only=True), "create-only never clobbers")
            check(json.load(open(snapshot, encoding="utf-8"))["version"] == 1, "losing create leaves prior bytes")
            check(atomic_write_json(snapshot, {"version": 3}), "atomic replacement succeeds")
            check(json.load(open(snapshot, encoding="utf-8"))["version"] == 3, "replacement publishes whole JSON")

        with repository_mutation(repo, 100):
            pass
        ignored = subprocess.run(
            ["git", "-C", os.path.dirname(HERE), "check-ignore", "-q", "--no-index",
             "screener/ledger/conviction/.state.json.tmp.crash-orphan"],
            check=False,
        )
        check(ignored.returncode == 0, "a SIGKILL orphan from atomic publication can never be committed")
    test_deploy_holds_both_leases_through_build()
    print("repo mutation lease: inherited append, exclusion, atomic replace, and immutable deploy build passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
