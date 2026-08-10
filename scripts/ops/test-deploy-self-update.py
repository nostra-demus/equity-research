#!/usr/bin/env python3
"""Integration regressions for deploy.sh's installed runtime-ops reconciliation."""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass


HERE = os.path.dirname(os.path.abspath(__file__))
DEPLOY = os.path.join(HERE, "deploy.sh")
WATCHDOG_V1 = "#!/usr/bin/env bash\n# watchdog fixture v1\n"
WATCHDOG_V2 = "#!/usr/bin/env bash\n# watchdog fixture v2\n"
HOUSEKEEPING = "#!/usr/bin/env bash\n# housekeeping fixture\n"


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def run(
    cmd: list[str], cwd: str, env: dict[str, str], *, check_result: bool = True, timeout: int = 15,
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        cmd, cwd=cwd, env=env, check=check_result, capture_output=True, text=True, timeout=timeout,
    )


def write(path: str, content: str, executable: bool = False) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(content)
    if executable:
        os.chmod(path, 0o755)


def write_wrapper(path: str, body: str) -> None:
    write(path, "#!/bin/sh\n" + body, executable=True)


@dataclass
class Fixture:
    temp: tempfile.TemporaryDirectory[str]
    root: str
    env: dict[str, str]
    origin: str
    seed: str
    prod: str
    home: str
    fake_bin: str
    ops: str
    base: str
    target: str
    calls: str

    def close(self) -> None:
        self.temp.cleanup()


def commit(repo: str, env: dict[str, str], message: str) -> str:
    run(["git", "add", "."], repo, env)
    run(["git", "commit", "-q", "-m", message], repo, env)
    run(["git", "push", "-q", "origin", "main"], repo, env)
    return run(["git", "rev-parse", "HEAD"], repo, env).stdout.strip()


def fixture(*, prod_before_target: bool = False, mixed_ui_change: bool = False) -> Fixture:
    temp: tempfile.TemporaryDirectory[str] = tempfile.TemporaryDirectory(prefix="deploy-self-update-")
    root = temp.name
    env = {
        **os.environ,
        "GIT_AUTHOR_NAME": "Test",
        "GIT_AUTHOR_EMAIL": "test@example.com",
        "GIT_COMMITTER_NAME": "Test",
        "GIT_COMMITTER_EMAIL": "test@example.com",
    }
    origin = os.path.join(root, "origin.git")
    seed = os.path.join(root, "seed")
    prod = os.path.join(root, "prod")
    home = os.path.join(root, "home")
    fake_bin = os.path.join(root, "bin")
    ops = os.path.join(home, ".nostra-ops")
    calls = os.path.join(root, "calls")
    os.makedirs(fake_bin)
    os.makedirs(ops)
    run(["git", "init", "--bare", "-q", "-b", "main", origin], root, env)
    run(["git", "clone", "-q", origin, seed], root, env)

    os.makedirs(os.path.join(seed, "scripts", "ops"), exist_ok=True)
    shutil.copyfile(DEPLOY, os.path.join(seed, "scripts", "ops", "deploy.sh"))
    os.chmod(os.path.join(seed, "scripts", "ops", "deploy.sh"), 0o755)
    write(os.path.join(seed, "scripts", "ops", "watchdog.sh"), WATCHDOG_V1, executable=True)
    write(os.path.join(seed, "scripts", "ops", "housekeeping.sh"), HOUSEKEEPING, executable=True)
    write(os.path.join(seed, "ui", "server", "src", "version.ts"), "export const version = 1\n")
    base = commit(seed, env, "base")
    if prod_before_target:
        run(["git", "clone", "-q", origin, prod], root, env)

    write(os.path.join(seed, "scripts", "ops", "watchdog.sh"), WATCHDOG_V2, executable=True)
    if mixed_ui_change:
        write(os.path.join(seed, "ui", "server", "src", "version.ts"), "export const version = 2\n")
    target = commit(seed, env, "runtime ops update")
    if not prod_before_target:
        run(["git", "clone", "-q", origin, prod], root, env)

    # Simulate old runtime copies installed independently of the reviewed checkout.
    write(os.path.join(ops, "watchdog.sh"), WATCHDOG_V1, executable=True)
    write(os.path.join(ops, "deploy.sh"), "#!/bin/sh\n# stale installed deploy\n", executable=True)
    write(os.path.join(ops, "housekeeping.sh"), "#!/bin/sh\n# stale installed housekeeping\n", executable=True)

    real_cp = shutil.which("cp") or "/bin/cp"
    real_chmod = shutil.which("chmod") or "/bin/chmod"
    real_mv = shutil.which("mv") or "/bin/mv"
    for name, real in (("cp", real_cp), ("chmod", real_chmod), ("mv", real_mv)):
        write_wrapper(
            os.path.join(fake_bin, name),
            f'''if [ "${{FAIL_OPS_STEP:-}}" = "{name}" ]; then
  for arg in "$@"; do
    case "$arg" in */.watchdog.sh.*) exit 42 ;; esac
  done
fi
exec "{real}" "$@"
''',
        )
    write_wrapper(os.path.join(fake_bin, "python3"), f'exec "{sys.executable}" "$@"\n')
    write_wrapper(os.path.join(fake_bin, "stat"), 'date +%s\n')
    write_wrapper(os.path.join(fake_bin, "npm"), f'printf "npm %s\\n" "$*" >> "{calls}"\nexit 0\n')
    write_wrapper(os.path.join(fake_bin, "launchctl"), f'printf "launchctl %s\\n" "$*" >> "{calls}"\nexit 0\n')
    write_wrapper(os.path.join(fake_bin, "curl"), 'printf \'{"ok":true}\\n\'\n')

    deploy_env = {
        **env,
        "HOME": home,
        "ENGINE_REPO_ROOT": prod,
        "NOSTRA_POOL": os.path.join(root, "absent-pool"),
        "PATH": fake_bin + os.pathsep + "/usr/bin:/bin:/usr/sbin:/sbin",
        "DEPLOY_DEBOUNCE_SECS": "0",
        "DEPLOY_MAX_DEFER_SECS": "1200",
        "DEPLOY_HEALTH_TRIES": "1",
        "DEPLOY_HEALTH_INTERVAL": "0",
    }
    return Fixture(temp, root, deploy_env, origin, seed, prod, home, fake_bin, ops, base, target, calls)


def run_deploy(fx: Fixture, *, marker: str | None, fail_step: str = "") -> str:
    marker_path = os.path.join(fx.ops, ".deployed.sha")
    if marker is None:
        if os.path.exists(marker_path):
            os.unlink(marker_path)
    else:
        write(marker_path, marker + "\n")
    env = {**fx.env, "FAIL_OPS_STEP": fail_step}
    result = run(["bash", DEPLOY], fx.prod, env, check_result=False)
    check(result.returncode == 0, f"launchd deploy contract must exit 0, got {result.returncode}: {result.stderr}")
    log_path = os.path.join(fx.home, "Library", "Logs", "nostradamus-deploy.log")
    return open(log_path, encoding="utf-8").read()


def installed(fx: Fixture, name: str) -> str:
    return open(os.path.join(fx.ops, name), encoding="utf-8").read()


def marker(fx: Fixture) -> str:
    path = os.path.join(fx.ops, ".deployed.sha")
    return open(path, encoding="utf-8").read().strip() if os.path.exists(path) else ""


def test_missing_and_current_marker_repair_by_content() -> None:
    for marker_value, label in ((None, "missing"), ("target", "current")):
        fx = fixture()
        try:
            chosen = None if marker_value is None else fx.target
            log = run_deploy(fx, marker=chosen)
            check(installed(fx, "watchdog.sh") == WATCHDOG_V2, f"{label} marker must not skip watchdog repair")
            check(installed(fx, "deploy.sh") == open(DEPLOY, encoding="utf-8").read(),
                  f"{label} marker must not skip deployer repair")
            check(os.access(os.path.join(fx.ops, "watchdog.sh"), os.X_OK), "installed watchdog must be executable")
            check(marker(fx) == fx.target, f"{label} marker path must finish on the reviewed target")
            check("refreshed ops/watchdog.sh" in log, f"{label} marker repair must be visible in the log")
        finally:
            fx.close()


def test_copy_chmod_and_rename_failures_do_not_advance_marker() -> None:
    expected_steps = {"cp": "copy", "chmod": "chmod", "mv": "rename"}
    for command, logged_step in expected_steps.items():
        fx = fixture()
        try:
            log = run_deploy(fx, marker=fx.base, fail_step=command)
            check(installed(fx, "watchdog.sh") == WATCHDOG_V1,
                  f"{command} failure must leave the prior watchdog atomically intact")
            check(marker(fx) == fx.base, f"{command} failure must leave deployed marker at last-good")
            check(f"during {logged_step}" in log, f"{command} failure must identify its failed install stage")
            check("runtime ops reconciliation failed" in log, f"{command} failure must fail the deploy visibly")
            staged = [name for name in os.listdir(fx.ops) if name.startswith(".watchdog.sh.")]
            check(not staged, f"{command} failure must clean the staged watchdog")
        finally:
            fx.close()


def test_ops_repair_precedes_a_jammed_migration() -> None:
    fx = fixture()
    try:
        agents = os.path.join(fx.home, "Library", "LaunchAgents")
        os.makedirs(agents)
        os.symlink("/dev/null", os.path.join(agents, "com.nostradamus.connectors.plist"))
        log = run_deploy(fx, marker=fx.target)
        check(installed(fx, "watchdog.sh") == WATCHDOG_V2,
              "reviewed runtime ops must install before a connector migration can jam the tick")
        check("migration refused a symlink" in log, "fixture must actually trip the migration safety gate")
        check("refreshed ops/watchdog.sh" in log, "ops repair must be logged before migration failure")
    finally:
        fx.close()


def test_mixed_ui_ops_commit_updates_ops_while_activation_stays_deferred() -> None:
    fx = fixture(prod_before_target=True, mixed_ui_change=True)
    try:
        fx.env["DEPLOY_DEBOUNCE_SECS"] = "99999"
        fx.env["DEPLOY_MAX_DEFER_SECS"] = "99999"
        log = run_deploy(fx, marker=fx.base)
        head = run(["git", "rev-parse", "HEAD"], fx.prod, fx.env).stdout.strip()
        check(head == fx.target, "mixed reviewed commit must fast-forward so runtime ops can self-update")
        check(installed(fx, "watchdog.sh") == WATCHDOG_V2, "mixed commit must refresh watchdog immediately")
        check(marker(fx) == fx.base, "deferred ui activation must leave the build marker at last-good")
        check("SYNC-OPS" in log and "DEFER ui activation" in log,
              "log must distinguish immediate ops sync from deferred ui activation")
        check(not os.path.exists(fx.calls), "deferred activation must not run npm or launchctl")
    finally:
        fx.close()


def main() -> int:
    test_missing_and_current_marker_repair_by_content()
    test_copy_chmod_and_rename_failures_do_not_advance_marker()
    test_ops_repair_precedes_a_jammed_migration()
    test_mixed_ui_ops_commit_updates_ops_while_activation_stays_deferred()
    print("deploy self-update: marker repair, atomic failures, gate ordering, and mixed debounce passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
