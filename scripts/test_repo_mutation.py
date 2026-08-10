#!/usr/bin/env python3
"""Regression tests for the cross-process repository mutation lease."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
import time

from repo_mutation import append_ndjson, atomic_write_json, repository_mutation


HERE = os.path.dirname(os.path.abspath(__file__))
APPEND = os.path.join(HERE, "append-ndjson.sh")
DEPLOY = os.path.join(HERE, "ops", "deploy.sh")
DEPLOY_SELF_UPDATE_TEST = os.path.join(HERE, "ops", "test-deploy-self-update.py")


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
        os.makedirs(os.path.join(seed, "scripts", "ops"), exist_ok=True)
        shutil.copyfile(DEPLOY, os.path.join(seed, "scripts", "ops", "deploy.sh"))
        for ops_name in ("watchdog.sh", "housekeeping.sh"):
            with open(os.path.join(seed, "scripts", "ops", ops_name), "w", encoding="utf-8") as handle:
                handle.write("#!/bin/sh\n# deploy lease fixture\n")
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
            "NOSTRA_POOL": os.path.join(tmp, "absent-pool"),
            "PATH": fake_bin + os.pathsep + "/usr/bin:/bin:/usr/sbin:/sbin",
            "DEPLOY_DEBOUNCE_SECS": "0",
            "FAKE_NPM_STARTED": started,
            "FAKE_NPM_RELEASE": release,
            "FAKE_NPM_CALLS": calls,
        }
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
    subprocess.run([sys.executable, DEPLOY_SELF_UPDATE_TEST], check=True)
    print("repo mutation lease: inherited append, exclusion, atomic replace, and immutable deploy build passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
