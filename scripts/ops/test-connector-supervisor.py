#!/usr/bin/env python3
"""Portable, mutation-free contract tests for connector-supervisor.py."""

from __future__ import annotations

import importlib.util
import json
import os
import plistlib
import stat
import tempfile
import subprocess
import sys
from pathlib import Path
from unittest import mock


HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("connector_supervisor", HERE / "connector-supervisor.py")
assert SPEC and SPEC.loader
supervisor = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(supervisor)

NOW = 1_786_650_000.0
SHA = "a" * 40
RUN = "b" * 32
failures = 0


def check(description: str, condition: bool) -> None:
    global failures
    if condition:
        print(f"  ok  {description}")
    else:
        print(f"  FAIL {description}")
        failures += 1


def make_plist(path: Path, repo: Path, home: Path, malformed: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if malformed:
        path.write_text("not a plist", encoding="utf-8")
    else:
        log = home / "Library" / "Logs" / "nostradamus-connectors.log"
        config = home / ".config" / "nostra-engine"
        config.mkdir(parents=True, mode=0o700, exist_ok=True)
        config.chmod(0o700)
        value = {
            "Label": "com.nostradamus.connectors",
            "EnvironmentVariables": {
                "HOME": str(home), "PATH": "/usr/bin:/bin",
                "NOSTRA_CONNECTOR_CREDENTIAL_SOURCE": "providers_env",
                "NOSTRA_ENGINE_CONFIG_DIR": str(config),
            },
            "WorkingDirectory": str(repo),
            "ProgramArguments": [
                "/usr/bin/env", "python3", "-I",
                str(repo / ".claude" / "tools" / "run_connectors.py"),
                "--data-root", str(repo / "data"),
            ],
            "MaterializeDatalessFiles": True, "RunAtLoad": True,
            "StartInterval": 900, "ThrottleInterval": 60,
            "StandardOutPath": str(log), "StandardErrorPath": str(log),
        }
        path.write_bytes(plistlib.dumps(value))
    path.chmod(0o644)


def make_tunnel_plist(path: Path, *, label: str = "com.nostradamus.tunnel") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(plistlib.dumps({
        "Label": label, "ProgramArguments": ["/usr/bin/cloudflared", "tunnel", "run", "nostradamus-engine"],
        "RunAtLoad": True, "KeepAlive": True,
    }))
    path.chmod(0o644)


def heartbeat(path: Path, *, host: str = "mac-pro", commit: str = SHA,
              state: str = "completed", rows: int = 1, started: float = NOW - 30,
              schema: int = 2) -> None:
    completed = None if state == "running" else supervisor.iso(NOW - 5)
    value = {
        "schema_version": schema, "service": "connector-fetcher", "state": state,
        "interval_seconds": 900, "host": host, "pid": 42,
        "sweep_started_at": supervisor.iso(started),
        "last_progress_at": supervisor.iso(NOW - 5), "sweep_completed_at": completed,
        "processed_rows": rows, "failed_rows": 0, "skipped_manifests": 0,
        "error_code": None,
    }
    if schema == 2:
        value.update(run_id=RUN, deployed_commit=commit)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value), encoding="utf-8")
    path.chmod(0o644)


def topology(root: Path, *, role: str | None = "doer", plist: str = "valid",
             data: str = "ready") -> tuple[Path, Path, Path]:
    home = root / "home"
    repo = root / "repo"
    ops = home / ".nostra-ops"
    agents = home / "Library" / "LaunchAgents"
    pool = root / "pool"
    for directory in (ops, agents, repo, pool):
        directory.mkdir(parents=True, exist_ok=True)
    ops.chmod(0o700)
    (ops / "connector-writer-host").write_text("mac-pro\n", encoding="utf-8")
    (ops / "connector-writer-host").chmod(0o600)
    config = home / ".config" / "nostra-engine"
    config.mkdir(parents=True, mode=0o700, exist_ok=True)
    config.chmod(0o700)
    (ops / "connector-config-root").write_text(str(config) + "\n", encoding="utf-8")
    (ops / "connector-config-root").chmod(0o600)
    if role is not None:
        (ops / "role").write_text(role + "\n", encoding="ascii")
        (ops / "role").chmod(0o600)
    if plist != "missing":
        make_plist(agents / "com.nostradamus.connectors.plist", repo, home, plist == "malformed")
    (ops / "pool-root").write_text(str(pool) + "\n", encoding="utf-8")
    (ops / "pool-root").chmod(0o600)
    if data == "ready":
        (repo / "data").symlink_to(pool, target_is_directory=True)
    elif data == "real":
        (repo / "data").mkdir()
    elif data == "broken":
        (repo / "data").symlink_to(root / "missing", target_is_directory=True)
    return home, repo, pool


def run_case(root: Path, **kwargs: object) -> dict:
    home, repo, _ = topology(root, **kwargs)
    with mock.patch.dict(os.environ, {"HOME": str(home), "NOSTRA_SUPERVISOR_HOST": "mac-pro"}, clear=False), \
         mock.patch.object(supervisor, "desired_commit", return_value=SHA), \
         mock.patch.object(supervisor, "launchctl_loaded", return_value=True), \
         mock.patch.object(supervisor, "fence_scheduler", return_value="stopped"), \
         mock.patch.object(supervisor, "invoke_installer", return_value=True):
        return supervisor.supervise(repo, home, NOW)


with tempfile.TemporaryDirectory() as temp:
    root = Path(temp).resolve()

    # Owner-only state directory upgrades safely from the existing production 0755 shape.
    ops = root / "mode-home" / ".nostra-ops"
    ops.mkdir(parents=True, mode=0o755)
    ops.chmod(0o755)
    check("owned 0755 ops directory is normalized to 0700",
          supervisor.ensure_private_directory(ops)
          and stat.S_IMODE(ops.stat().st_mode) == 0o700)
    symlink = root / "mode-link"
    symlink.symlink_to(ops, target_is_directory=True)
    check("symlinked ops directory is refused", not supervisor.ensure_private_directory(symlink))

    # Stable identity is first-writer-wins and never creates an absent/non-symlink data path.
    home, repo, pool = topology(root / "identity", data="real")
    other = root / "identity" / "other"; other.mkdir()
    with mock.patch.dict(os.environ, {"NOSTRA_POOL": str(other)}, clear=False):
        state, _ = supervisor.pool_state(repo, home / ".nostra-ops")
    check("explicit pool cannot overwrite existing identity", state == "mismatch"
          and (home / ".nostra-ops" / "pool-root").read_text().strip() == str(pool))
    (home / ".nostra-ops" / "pool-root").unlink()
    (repo / "data").rmdir()
    with mock.patch.dict(os.environ, {"NOSTRA_POOL": str(pool)}, clear=False):
        state, _ = supervisor.pool_state(repo, home / ".nostra-ops")
    check("absent data path is not silently synthesized", state == "mismatch"
          and not (repo / "data").exists() and not (repo / "data").is_symlink())

    # Legacy 0644 tunnel permits only legacy role inference; explicit and unsafe markers dominate it.
    legacy = root / "legacy"
    home, repo, _ = topology(legacy, role=None)
    make_tunnel_plist(home / "Library" / "LaunchAgents" / "com.nostradamus.tunnel.plist")
    check("0644 owner-owned legacy tunnel is recognized",
          supervisor.parse_role(home / ".nostra-ops" / "role",
                                home / "Library" / "LaunchAgents" / "com.nostradamus.tunnel.plist")
          == "legacy_doer")
    (home / ".nostra-ops" / "role").write_text("corrupt\n")
    (home / ".nostra-ops" / "role").chmod(0o600)
    check("unsafe role never falls back to legacy topology",
          supervisor.parse_role(home / ".nostra-ops" / "role",
                                home / "Library" / "LaunchAgents" / "com.nostradamus.tunnel.plist")
          == "unsafe")
    role_path = home / ".nostra-ops" / "role"
    for invalid_role in (b"doer", b" doer\n", b"doer \n", b"doer\n\n"):
        role_path.write_bytes(invalid_role)
        role_path.chmod(0o600)
        check(f"non-exact role bytes fail closed: {invalid_role!r}",
              supervisor.parse_role(role_path,
                                    home / "Library" / "LaunchAgents" / "com.nostradamus.tunnel.plist")
              == "unsafe")
    role_path.write_bytes(b"doer\n"); role_path.chmod(0o644)
    check("group-readable role fails closed", supervisor.parse_role(
        role_path, home / "Library" / "LaunchAgents" / "com.nostradamus.tunnel.plist") == "unsafe")
    role_path.unlink()
    role_path.write_bytes(b"doer\n"); role_path.chmod(0o600)
    role_link = home / ".nostra-ops" / "role-hardlink"
    os.link(role_path, role_link)
    check("hard-linked role fails closed", supervisor.parse_role(
        role_path, home / "Library" / "LaunchAgents" / "com.nostradamus.tunnel.plist") == "unsafe")
    role_link.unlink(); role_path.unlink()
    make_tunnel_plist(home / "Library" / "LaunchAgents" / "com.nostradamus.tunnel.plist",
                      label="com.nostradamus.connectors")
    check("wrong-label legacy plist cannot enable autonomy",
          supervisor.parse_role(home / ".nostra-ops" / "role",
                                home / "Library" / "LaunchAgents" / "com.nostradamus.tunnel.plist")
          == "absent")
    make_tunnel_plist(home / "Library" / "LaunchAgents" / "com.nostradamus.tunnel.plist")
    tunnel_value = plistlib.loads((home / "Library" / "LaunchAgents" / "com.nostradamus.tunnel.plist").read_bytes())
    tunnel_value["ProgramArguments"].insert(1, "extra")
    (home / "Library" / "LaunchAgents" / "com.nostradamus.tunnel.plist").write_bytes(plistlib.dumps(tunnel_value))
    check("extra legacy tunnel argument cannot enable autonomy",
          supervisor.parse_role(home / ".nostra-ops" / "role",
                                home / "Library" / "LaunchAgents" / "com.nostradamus.tunnel.plist")
          == "absent")
    (home / "Library" / "LaunchAgents" / "com.nostradamus.tunnel.plist").write_bytes(
        plistlib.dumps(["not", "a", "dictionary"])
    )
    check("non-dictionary legacy plist fails closed without exception",
          supervisor.parse_role(home / ".nostra-ops" / "role",
                                home / "Library" / "LaunchAgents" / "com.nostradamus.tunnel.plist")
          == "absent")

    admin = run_case(root / "admin", role="admin")
    absent = run_case(root / "absent", role=None)
    unsafe = run_case(root / "unsafe", role="corrupt")
    malformed = run_case(root / "malformed", plist="malformed")
    real_pool = run_case(root / "real-pool", data="real")
    broken_pool = run_case(root / "broken-pool", data="broken")
    check("admin and absent roles disable rather than mutate", admin["state"] == "disabled_admin"
          and absent["state"] == "disabled_admin")
    check("unsafe role/plist block convergence", unsafe["state"] == "blocked_unsafe"
          and malformed["state"] == "blocked_unsafe")
    array_root = root / "array-plist"
    array_home, array_repo, _ = topology(array_root)
    array_plist = array_home / "Library" / "LaunchAgents" / "com.nostradamus.connectors.plist"
    array_plist.write_bytes(plistlib.dumps(["not", "a", "dictionary"])); array_plist.chmod(0o644)
    with mock.patch.dict(os.environ, {"HOME": str(array_home), "NOSTRA_SUPERVISOR_HOST": "mac-pro"}, clear=False), \
         mock.patch.object(supervisor, "desired_commit", return_value=SHA), \
         mock.patch.object(supervisor, "launchctl_loaded", return_value=False):
        array_value = supervisor.supervise(array_repo, array_home, NOW)
    check("non-dictionary connector plist emits a fresh blocked wire",
          array_value["state"] == "blocked_unsafe" and array_value["reason"] == "plist_unsafe"
          and array_value["updated_at"] == supervisor.iso(NOW))
    check("real/mismatched and broken pool topology pauses safely",
          real_pool["state"] == "paused_drive" and broken_pool["state"] == "paused_drive")

    # Missing service invokes exactly the narrow installer once, then enters post-activation wait.
    missing_root = root / "missing-plist"
    home, repo, _ = topology(missing_root, plist="missing")
    calls: list[tuple[Path, Path, str | None]] = []
    def install_missing(*args: object) -> bool:
        calls.append(args)  # type: ignore[arg-type]
        make_plist(home / "Library" / "LaunchAgents" / "com.nostradamus.connectors.plist", repo, home)
        return True

    with mock.patch.dict(os.environ, {"HOME": str(home), "NOSTRA_SUPERVISOR_HOST": "mac-pro"}, clear=False), \
         mock.patch.object(supervisor, "desired_commit", return_value=SHA), \
         mock.patch.object(supervisor, "launchctl_loaded", return_value=False), \
         mock.patch.object(supervisor, "ordered_locks_acquire", return_value=([91, 92], "locked")), \
         mock.patch.object(supervisor, "safe_lock_acquire", return_value=(93, "locked")), \
         mock.patch.object(supervisor, "release_locks"), \
         mock.patch.object(supervisor, "scheduler_reload", return_value=True), \
         mock.patch.object(supervisor, "scheduler_kick", return_value=True), \
         mock.patch.object(supervisor, "invoke_installer", side_effect=install_missing):
        value = supervisor.supervise(repo, home, NOW)
    check("absent plist runs one exact repair and waits for proof",
          len(calls) == 1 and value["state"] == "starting"
          and value["reason"] == "awaiting_heartbeat")

    # Prior activation plus exact v2 run distinguishes checking, online, foreign, wrong/preactivation, v1.
    proof_root = root / "proof"
    home, repo, _ = topology(proof_root)
    prior = supervisor.status_value(
        NOW - 60, state="starting", reason="awaiting_heartbeat", role="doer", pool="ready",
        scheduler="loaded", auto_retry_armed=True, activation_started_at=supervisor.iso(NOW - 60),
        last_attempt_at=supervisor.iso(NOW - 60), retry_not_before=supervisor.iso(NOW + 240),
        expected_host="mac-pro", desired_commit=SHA,
    )
    supervisor.write_status(home / ".nostra-ops" / "connector-supervisor.json", prior)

    def proof(**parts: object) -> dict:
        heartbeat(repo / "data" / "_connectors" / "runner_status.json", **parts)
        with mock.patch.dict(os.environ, {"HOME": str(home), "NOSTRA_SUPERVISOR_HOST": "mac-pro"}, clear=False), \
             mock.patch.object(supervisor, "desired_commit", return_value=SHA), \
             mock.patch.object(supervisor, "launchctl_loaded", return_value=True), \
             mock.patch.object(supervisor, "fence_scheduler", return_value="stopped"), \
             mock.patch.object(supervisor, "invoke_installer", return_value=True):
            return supervisor.supervise(repo, home, NOW)

    running = proof(state="running")
    online = proof(state="completed", rows=1)
    zero = proof(state="completed", rows=0)
    wrong = proof(state="completed", commit="c" * 40)
    old = proof(state="completed", started=NOW - 120)
    foreign = proof(state="completed", host="other-mac")
    legacy_v1 = proof(state="completed", schema=1)
    check("post-activation running sweep is Checking", running["state"] == "starting"
          and running["reason"] == "sweep_in_progress" and running["expected_run_id"] == RUN)
    check("only exact completed nonempty v2 sweep proves Online", online["state"] == "online"
          and online["ready"] is True and online["run_id"] == RUN)
    check("zero-row, wrong-commit and preactivation sweeps never prove Online",
          all(item["state"] != "online" for item in (zero, wrong, old)))
    check("fresh foreign heartbeat suppresses startup", foreign["state"] == "foreign_writer"
          and foreign["auto_retry_armed"] is False)
    check("v1 heartbeat remains legacy and unproven", legacy_v1["state"] != "online")

    # Exact wire, safe atomic output, and no path/secret carrying fields.
    wire_path = home / ".nostra-ops" / "connector-supervisor.json"
    supervisor.write_status(wire_path, online)
    parsed = json.loads(wire_path.read_text())
    check("supervisor wire has exactly 19 closed non-secret keys",
          set(parsed) == supervisor.SUPERVISOR_KEYS and len(parsed) == 19
          and not any("path" in key or "url" in key or "error" in key or "secret" in key for key in parsed))
    check("supervisor output is private", stat.S_IMODE(wire_path.stat().st_mode) == 0o600)
    impossible = dict(online)
    impossible.update(state="starting", reason="verified_first_sweep", ready=False)
    check("impossible state/reason prior is rejected", not supervisor.valid_supervisor(impossible))
    future_prior = dict(online)
    future_prior.update(
        state="starting", reason="awaiting_heartbeat", ready=False,
        activation_started_at=supervisor.iso(NOW + 1), updated_at=supervisor.iso(NOW),
    )
    check("future activation prior is rejected", not supervisor.valid_supervisor(future_prior))
    absent_semantic = supervisor.status_value(
        NOW, state="disabled_admin", reason="role_absent", role="absent", pool="ready",
        scheduler="missing",
    )
    transition_semantic = supervisor.status_value(
        NOW, state="blocked_unsafe", reason="transition_unsafe", role="doer", pool="ready",
        scheduler="missing", auto_retry_armed=False,
    )
    check("role-absent and transition-unsafe frozen semantics validate",
          supervisor.valid_supervisor(absent_semantic) and supervisor.valid_supervisor(transition_semantic))
    unknown = subprocess.run(
        [sys.executable, str(HERE / "connector-supervisor.py"), "--unknown"],
        env={**os.environ, "HOME": str(home), "ENGINE_REPO_ROOT": str(repo)},
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    check("unknown supervisor argument is rejected by main contract", unknown.returncode == 2)

    # Unsafe lock and held lock are different operational facts. Neither invokes the installer.
    lock_root = root / "locks"
    home, repo, _ = topology(lock_root, plist="missing")
    unsafe_lock = home / ".nostra-ops" / ".deploy.flock"
    unsafe_lock.symlink_to(root / "outside-lock")
    with mock.patch.dict(os.environ, {"HOME": str(home), "NOSTRA_SUPERVISOR_HOST": "mac-pro"}, clear=False), \
         mock.patch.object(supervisor, "desired_commit", return_value=SHA), \
         mock.patch.object(supervisor, "launchctl_loaded", return_value=False), \
         mock.patch.object(supervisor, "invoke_installer") as installer:
        unsafe_value = supervisor.supervise(repo, home, NOW)
    check("unsafe deploy lock blocks and disarms automatic retry",
          unsafe_value["state"] == "blocked_unsafe"
          and unsafe_value["reason"] == "transition_unsafe"
          and unsafe_value["auto_retry_armed"] is False and not installer.called)
    unsafe_lock.unlink()
    descriptor = os.open(unsafe_lock, os.O_RDWR | os.O_CREAT, 0o600)
    supervisor.fcntl.flock(descriptor, supervisor.fcntl.LOCK_EX)
    try:
        with mock.patch.dict(os.environ, {"HOME": str(home), "NOSTRA_SUPERVISOR_HOST": "mac-pro"}, clear=False), \
             mock.patch.object(supervisor, "desired_commit", return_value=SHA), \
             mock.patch.object(supervisor, "launchctl_loaded", return_value=False), \
             mock.patch.object(supervisor, "invoke_installer") as installer:
            busy_value = supervisor.supervise(repo, home, NOW)
    finally:
        os.close(descriptor)
    check("held deploy lock is retryable transition-busy",
          busy_value["state"] == "starting" and busy_value["reason"] == "transition_busy"
          and busy_value["auto_retry_armed"] is True and not installer.called)

    # A fresh completed heartbeat cannot claim ready after launchd unloads.
    heartbeat(repo / "data" / "_connectors" / "runner_status.json")
    prior = supervisor.status_value(
        NOW - 60, state="starting", reason="awaiting_heartbeat", role="doer", pool="ready",
        scheduler="loaded", auto_retry_armed=True, activation_started_at=supervisor.iso(NOW - 60),
        last_attempt_at=supervisor.iso(NOW - 60), retry_not_before=supervisor.iso(NOW + 240),
        expected_host="mac-pro", desired_commit=SHA,
    )
    supervisor.write_status(home / ".nostra-ops" / "connector-supervisor.json", prior)
    with mock.patch.dict(os.environ, {"HOME": str(home), "NOSTRA_SUPERVISOR_HOST": "mac-pro"}, clear=False), \
         mock.patch.object(supervisor, "desired_commit", return_value=SHA), \
         mock.patch.object(supervisor, "launchctl_loaded", return_value=False), \
         mock.patch.object(supervisor, "invoke_installer", return_value=True):
        unloaded = supervisor.supervise(repo, home, NOW)
    check("unloaded scheduler cannot claim Online from a leftover heartbeat", unloaded["state"] != "online")

    # Disruptive repair requires sustained evidence. One failed run only updates status;
    # the same run on the next tick converges once.
    sustained_root = root / "sustained"
    home, repo, _ = topology(sustained_root)
    heartbeat(repo / "data" / "_connectors" / "runner_status.json", state="failed")
    # Give a valid closed failure code.
    raw = json.loads((repo / "data" / "_connectors" / "runner_status.json").read_text())
    raw["error_code"] = "fetch_failed"
    (repo / "data" / "_connectors" / "runner_status.json").write_text(json.dumps(raw))
    mutations: list[str] = []
    common = {
        "desired_commit": mock.patch.object(supervisor, "desired_commit", return_value=SHA),
        "launch": mock.patch.object(supervisor, "launchctl_loaded", return_value=True),
        "install": mock.patch.object(supervisor, "invoke_installer",
                                     side_effect=lambda *args: mutations.append("install") or True),
    }
    with mock.patch.dict(os.environ, {"HOME": str(home), "NOSTRA_SUPERVISOR_HOST": "mac-pro"}, clear=False), \
         common["desired_commit"], common["launch"], common["install"]:
        first_failure = supervisor.supervise(repo, home, NOW)
    supervisor.write_status(home / ".nostra-ops" / "connector-supervisor.json", first_failure)
    check("first failed heartbeat causes zero service mutation",
          first_failure["reason"] == "heartbeat_failed" and not mutations)

    # Unsafe/missing config identity always produces a valid blocked wire.
    unsafe_root = root / "unsafe-config"
    unsafe_home, unsafe_repo, _ = topology(unsafe_root)
    (unsafe_home / ".nostra-ops" / "connector-config-root").chmod(0o644)
    with mock.patch.dict(os.environ, {"HOME": str(unsafe_home), "NOSTRA_SUPERVISOR_HOST": "mac-pro"}, clear=False), \
         mock.patch.object(supervisor, "desired_commit", return_value=SHA), \
         mock.patch.object(supervisor, "launchctl_loaded", return_value=False):
        unsafe_config = supervisor.supervise(unsafe_repo, unsafe_home, NOW)
    check("unsafe config identity emits a closed blocked wire",
          unsafe_config["state"] == "blocked_unsafe" and unsafe_config["reason"] == "plist_unsafe"
          and unsafe_config["scheduler"] == "unsafe")

    # The activation boundary is captured after the transition leases are
    # released and immediately before kick; published time is never earlier.
    activation_root = root / "activation-clock"
    home, repo, _ = topology(activation_root, plist="missing")
    clock = iter([NOW + 90, NOW + 91])
    events: list[str] = []
    def activation_install(*args: object) -> bool:
        make_plist(home / "Library" / "LaunchAgents" / "com.nostradamus.connectors.plist", repo, home)
        return True
    with mock.patch.dict(os.environ, {"HOME": str(home), "NOSTRA_SUPERVISOR_HOST": "mac-pro"}, clear=False), \
         mock.patch.object(supervisor, "desired_commit", return_value=SHA), \
         mock.patch.object(supervisor, "launchctl_loaded", return_value=True), \
         mock.patch.object(supervisor, "ordered_locks_acquire", return_value=([91, 92], "locked")), \
         mock.patch.object(supervisor, "safe_lock_acquire", return_value=(93, "locked")), \
         mock.patch.object(supervisor, "release_locks", side_effect=lambda *args: events.append("release")), \
         mock.patch.object(supervisor, "invoke_installer", side_effect=activation_install), \
         mock.patch.object(supervisor, "scheduler_reload", return_value=True), \
         mock.patch.object(supervisor, "scheduler_kick", side_effect=lambda: events.append("kick") or True), \
         mock.patch.object(supervisor.time, "time", side_effect=lambda: next(clock)):
        activated = supervisor.supervise(repo, home, NOW)
    check("activation is stamped after lock release and immediately before kick",
          events[-2:] == ["release", "kick"]
          and supervisor.epoch(activated["activation_started_at"]) == NOW + 90
          and supervisor.epoch(activated["updated_at"]) == NOW + 91)

    # desired_commit uses NUL porcelain and validates both rename endpoints.
    def desired_with(status_bytes: bytes) -> str | None:
        def fake_run(command: list[str], **kwargs: object) -> subprocess.CompletedProcess:
            args = command[3:]
            if args[:1] == ["status"]:
                return subprocess.CompletedProcess(command, 0, stdout=status_bytes, stderr=b"")
            output = {
                ("rev-parse", "--show-toplevel"): str(repo),
                ("symbolic-ref", "--quiet", "--short", "HEAD"): "main",
                ("rev-parse", "HEAD"): SHA,
                ("rev-parse", "origin/main"): SHA,
            }[tuple(args)]
            return subprocess.CompletedProcess(command, 0, stdout=output + "\n", stderr="")
        with mock.patch.object(supervisor.subprocess, "run", side_effect=fake_run):
            return supervisor.desired_commit(repo)

    check("data-only NUL porcelain remains eligible",
          desired_with(b" M analyses/GOLD/report.md\0?? screener/board/x.json\0") == SHA)
    check("code-to-data rename validates and rejects the old code path",
          desired_with(b"R  analyses/GOLD/moved.py\0scripts/ops/unsafe.py\0") is None)
    check("data-to-code rename validates and rejects the new code path",
          desired_with(b"R  scripts/ops/moved.py\0analyses/GOLD/old.py\0") is None)
    check("literal arrow and spaces cannot confuse NUL dirty parsing",
          desired_with(b"?? analyses/GOLD/a -> b report.md\0") == SHA)

    # Missing plist preserves the durable custom provider directory.
    custom_root = root / "custom-config"
    custom_home, custom_repo, _ = topology(custom_root, plist="missing")
    custom = custom_root / "providers-custom"
    custom.mkdir(mode=0o700)
    identity = custom_home / ".nostra-ops" / "connector-config-root"
    identity.write_text(str(custom) + "\n"); identity.chmod(0o600)
    env = {**os.environ, "HOME": str(custom_home), "ENGINE_REPO_ROOT": str(custom_repo)}
    ensure_custom = subprocess.run(
        [sys.executable, str(HERE / "connector-supervisor.py"), "--ensure-config-identity"],
        env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    read_custom = subprocess.run(
        [sys.executable, str(HERE / "connector-supervisor.py"), "--read-config-identity"],
        env=env, capture_output=True, text=True,
    )
    check("missing plist keeps the durable custom config identity",
          ensure_custom.returncode == 0 and read_custom.returncode == 0
          and read_custom.stdout.strip() == str(custom))

if failures:
    raise SystemExit(f"{failures} connector supervisor contract test(s) failed")
print("connector supervisor contract tests passed")
