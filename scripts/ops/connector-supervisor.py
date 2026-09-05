#!/usr/bin/env python3
"""Fail-closed, idempotent macOS connector-scheduler reconciler.

The watchdog invokes this once per tick.  It owns no evidence and prints no
paths, URLs, exception text, or credentials.  Its only durable output is the
closed, non-secret connector-supervisor.json operational wire.
"""

from __future__ import annotations

import datetime as dt
import fcntl
import json
import os
import plistlib
import re
import socket
import stat
import subprocess
import sys
import time
from pathlib import Path
from typing import Any


ISO_RE = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$")
SHA_RE = re.compile(r"^[0-9a-f]{40}$")
RUN_RE = re.compile(r"^[0-9a-f]{32}$")
ERROR_RE = re.compile(r"^[a-z][a-z0-9_]{0,63}$")
HOST_RE = re.compile(r"^[^\x00-\x20\x7f]{1,255}$")
INTERVAL = 900
RETRY_SECONDS = 300

STATES = {
    "starting", "online", "paused_drive", "disabled_admin",
    "blocked_unsafe", "foreign_writer",
}
REASONS = {
    "verified_first_sweep", "sweep_in_progress", "awaiting_heartbeat",
    "retry_cooldown", "transition_busy", "install_failed", "heartbeat_legacy",
    "heartbeat_invalid", "heartbeat_stale", "heartbeat_failed",
    "drive_unavailable", "pool_unconfigured", "pool_mismatch",
    "pool_identity_unsafe", "admin_role", "role_absent", "role_unsafe",
    "plist_unsafe", "foreign_heartbeat",
    "transition_unsafe",
}
ROLES = {"doer", "legacy_doer", "admin", "absent", "unsafe"}
POOLS = {"ready", "unavailable", "unconfigured", "mismatch", "unsafe"}
SCHEDULERS = {"loaded", "unloaded", "missing", "unsafe"}
SUPERVISOR_KEYS = {
    "schema_version", "service", "updated_at", "state", "reason", "role",
    "pool", "scheduler", "ready", "auto_retry_armed",
    "activation_started_at", "last_attempt_at", "retry_not_before",
    "expected_host", "desired_commit", "expected_run_id", "observed_host",
    "deployed_commit", "run_id",
}
RUNNER_V1_KEYS = {
    "schema_version", "service", "state", "interval_seconds", "host", "pid",
    "sweep_started_at", "last_progress_at", "sweep_completed_at",
    "processed_rows", "failed_rows", "skipped_manifests", "error_code",
}
RUNNER_V2_KEYS = RUNNER_V1_KEYS | {"run_id", "deployed_commit"}


def iso(epoch: float) -> str:
    return dt.datetime.fromtimestamp(epoch, dt.timezone.utc).isoformat(
        timespec="microseconds"
    ).replace("+00:00", "Z")


def epoch(value: Any) -> float | None:
    if not isinstance(value, str) or not ISO_RE.fullmatch(value):
        return None
    try:
        parsed = dt.datetime.fromisoformat(value[:-1] + "+00:00")
    except ValueError:
        return None
    return parsed.timestamp()


def safe_host(value: Any) -> bool:
    return isinstance(value, str) and bool(HOST_RE.fullmatch(value))


def safe_read(path: Path, limit: int, *, private: bool = True) -> bytes | None:
    """Owner-owned, no-follow, identity-stable bounded read."""
    descriptor: int | None = None
    try:
        before = path.lstat()
        if (not stat.S_ISREG(before.st_mode) or before.st_uid != os.getuid()
                or before.st_nlink != 1
                or (before.st_mode & 0o077 if private else before.st_mode & 0o022)
                or not 0 < before.st_size <= limit):
            return None
        descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
        opened = os.fstat(descriptor)
        identity = (opened.st_dev, opened.st_ino, opened.st_size,
                    opened.st_mtime_ns, opened.st_ctime_ns, opened.st_mode,
                    opened.st_uid, opened.st_nlink)
        if (not stat.S_ISREG(opened.st_mode)
                or (opened.st_mode & 0o077 if private else opened.st_mode & 0o022)
                or identity[:2] != (before.st_dev, before.st_ino)
                or opened.st_uid != os.getuid() or opened.st_nlink != 1):
            return None
        chunks: list[bytes] = []
        remaining = opened.st_size
        while remaining:
            chunk = os.read(descriptor, remaining)
            if not chunk:
                return None
            chunks.append(chunk)
            remaining -= len(chunk)
        if os.read(descriptor, 1):
            return None
        after = os.fstat(descriptor)
        named = path.lstat()
        if ((after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns,
             after.st_ctime_ns, after.st_mode, after.st_uid, after.st_nlink) != identity
                or (named.st_dev, named.st_ino, named.st_size, named.st_mtime_ns,
                    named.st_ctime_ns, named.st_mode, named.st_uid, named.st_nlink) != identity
                or not stat.S_ISREG(after.st_mode) or after.st_uid != os.getuid()
                or after.st_nlink != 1
                or (after.st_mode & 0o077 if private else after.st_mode & 0o022)
                or not stat.S_ISREG(named.st_mode) or named.st_uid != os.getuid()
                or named.st_nlink != 1
                or (named.st_mode & 0o077 if private else named.st_mode & 0o022)):
            return None
        return b"".join(chunks)
    except OSError:
        return None
    finally:
        if descriptor is not None:
            os.close(descriptor)


def ensure_private_directory(path: Path) -> bool:
    descriptor: int | None = None
    try:
        if path.exists() or path.is_symlink():
            current = path.lstat()
            if not stat.S_ISDIR(current.st_mode) or current.st_uid != os.getuid():
                return False
            descriptor = os.open(
                path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0)
            )
            opened = os.fstat(descriptor)
            if (not stat.S_ISDIR(opened.st_mode) or opened.st_uid != os.getuid()
                    or (opened.st_dev, opened.st_ino) != (current.st_dev, current.st_ino)):
                return False
            os.fchmod(descriptor, 0o700)
            checked = path.lstat()
            after = os.fstat(descriptor)
            return (stat.S_ISDIR(checked.st_mode) and checked.st_uid == os.getuid()
                    and (checked.st_dev, checked.st_ino) == (after.st_dev, after.st_ino)
                    and not checked.st_mode & 0o077)
        path.mkdir(mode=0o700, parents=True)
        return True
    except OSError:
        return False
    finally:
        if descriptor is not None:
            os.close(descriptor)


def atomic_private_text(path: Path, value: str) -> bool:
    if not ensure_private_directory(path.parent):
        return False
    staged = path.parent / f".{path.name}.staged.{os.getpid()}.{time.time_ns()}"
    descriptor: int | None = None
    try:
        descriptor = os.open(staged, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        payload = value.encode("utf-8")
        written = 0
        while written < len(payload):
            count = os.write(descriptor, payload[written:])
            if count <= 0:
                raise OSError
            written += count
        os.fsync(descriptor)
        os.close(descriptor)
        descriptor = None
        os.replace(staged, path)
        return True
    except OSError:
        try:
            staged.unlink()
        except OSError:
            pass
        return False
    finally:
        if descriptor is not None:
            os.close(descriptor)


def publish_private_text_once(path: Path, value: str) -> bool:
    """Publish an identity once; a concurrent winner can never be overwritten."""
    if not ensure_private_directory(path.parent):
        return False
    staged = path.parent / f".{path.name}.seed.{os.getpid()}.{time.time_ns()}"
    descriptor: int | None = None
    try:
        descriptor = os.open(
            staged, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0), 0o600
        )
        payload = value.encode("utf-8")
        written = 0
        while written < len(payload):
            count = os.write(descriptor, payload[written:])
            if count <= 0:
                raise OSError
            written += count
        os.fsync(descriptor)
        os.close(descriptor)
        descriptor = None
        try:
            os.link(staged, path, follow_symlinks=False)
        except FileExistsError:
            raw = safe_read(path, 4096)
            return raw == value.encode("utf-8")
        directory = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
        try:
            os.fsync(directory)
        finally:
            os.close(directory)
        return True
    except OSError:
        return False
    finally:
        if descriptor is not None:
            os.close(descriptor)
        try:
            staged.unlink()
        except OSError:
            pass


def parse_role(role_file: Path, tunnel_plist: Path) -> str:
    if role_file.exists() or role_file.is_symlink():
        raw = safe_read(role_file, 32)
        if raw is None:
            return "unsafe"
        if raw == b"doer\n":
            return "doer"
        if raw == b"admin\n":
            return "admin"
        return "unsafe"
    raw_tunnel = safe_read(tunnel_plist, 1024 * 1024, private=False)
    if raw_tunnel is None:
        return "absent"
    try:
        tunnel = plistlib.loads(raw_tunnel)
    except (plistlib.InvalidFileException, ValueError):
        return "absent"
    if not isinstance(tunnel, dict):
        return "absent"
    args = tunnel.get("ProgramArguments")
    if (tunnel.get("Label") != "com.nostradamus.tunnel"
            or not isinstance(args, list) or len(args) != 4
            or not isinstance(args[0], str) or not args[0].startswith("/")
            or Path(args[0]).name != "cloudflared"
            or args[1:] != ["tunnel", "run", "nostradamus-engine"]
            or tunnel.get("RunAtLoad") is not True or tunnel.get("KeepAlive") is not True):
        return "absent"
    return "legacy_doer"


def canonical_existing_directory(candidate: Path) -> Path | None:
    try:
        resolved = candidate.resolve(strict=True)
        current = resolved.stat()
        if (not stat.S_ISDIR(current.st_mode) or current.st_uid != os.getuid()
                or not os.access(resolved, os.R_OK | os.X_OK)):
            return None
        return resolved
    except OSError:
        return None


def pool_state(repo: Path, ops: Path, *, seed: bool = True) -> tuple[str, Path | None]:
    """Resolve stable pool identity without ever replacing ambiguous data."""
    identity_file = ops / "pool-root"
    data_path = repo / "data"
    identity: Path | None = None
    explicit = os.environ.get("NOSTRA_POOL", "")
    if identity_file.exists() or identity_file.is_symlink():
        raw = safe_read(identity_file, 4096)
        if raw is None:
            return "unsafe", None
        try:
            text = raw.decode("utf-8")
        except UnicodeError:
            return "unsafe", None
        if not text.endswith("\n") or "\n" in text[:-1] or not text[:-1].startswith("/"):
            return "unsafe", None
        identity = Path(text[:-1])
    else:
        if not seed:
            return "unconfigured", None
        candidate: Path | None = None
        if explicit:
            if not explicit.startswith("/"):
                return "unsafe", None
            candidate = canonical_existing_directory(Path(explicit))
        elif data_path.is_symlink():
            candidate = canonical_existing_directory(data_path)
        if candidate is None:
            return "unconfigured", None
        if not publish_private_text_once(identity_file, f"{candidate}\n"):
            return "unsafe", None
        # A concurrent reconciler may have won with the same value. Re-read the authoritative inode.
        raw = safe_read(identity_file, 4096)
        if raw is None:
            return "unsafe", None
        try:
            identity = Path(raw.decode("utf-8").rstrip("\n"))
        except UnicodeError:
            return "unsafe", None

    if explicit:
        if not explicit.startswith("/"):
            return "unsafe", None
        explicit_root = canonical_existing_directory(Path(explicit))
        if explicit_root is None:
            return "unavailable", identity
        if explicit_root != identity:
            return "mismatch", identity

    resolved_identity = canonical_existing_directory(identity)
    if resolved_identity is None:
        return "unavailable", identity
    # The identity stores the canonical target, so a changed mount/path cannot be silently adopted.
    if resolved_identity != identity:
        return "mismatch", identity
    if data_path.is_symlink():
        resolved_data = canonical_existing_directory(data_path)
        return ("ready", identity) if resolved_data == identity else ("mismatch", identity)
    # An absent/non-symlink production data path is ambiguous. Deploy's separately-reviewed clobber guard
    # owns recovery of its exact known-empty shape; the connector supervisor never creates/replaces it.
    return "mismatch", identity


def private_path_identity(path: Path, *, explicit: str | None = None) -> tuple[str, str | None]:
    """Read/seed one immutable absolute directory identity."""
    if path.exists() or path.is_symlink():
        raw = safe_read(path, 4096)
        if raw is None:
            return "unsafe", None
        try:
            text = raw.decode("utf-8")
        except UnicodeError:
            return "unsafe", None
        if not text.endswith("\n") or "\n" in text[:-1] or not text[:-1].startswith("/"):
            return "unsafe", None
        candidate = canonical_existing_directory(Path(text[:-1]))
        if candidate is None or str(candidate) != text[:-1]:
            return "unsafe", None
        if explicit is not None:
            requested = canonical_existing_directory(Path(explicit)) if explicit.startswith("/") else None
            if requested is None or requested != candidate:
                return "mismatch", str(candidate)
        return "ready", str(candidate)
    if explicit is None or not explicit.startswith("/"):
        return "missing", None
    candidate = canonical_existing_directory(Path(explicit))
    if candidate is None or not publish_private_text_once(path, f"{candidate}\n"):
        return "unsafe", None
    return private_path_identity(path, explicit=str(candidate))


def writer_identity(ops: Path, local_host: str, *, seed: bool = False) -> tuple[str, str | None]:
    if not safe_host(local_host):
        return "unsafe", None
    explicit = os.environ.get("NOSTRA_CONNECTOR_WRITER_HOST")
    if explicit is not None and not safe_host(explicit):
        return "unsafe", None
    identity = ops / "connector-writer-host"
    if not (identity.exists() or identity.is_symlink()):
        if not seed or explicit is None:
            return "missing", None
        if not publish_private_text_once(identity, explicit + "\n"):
            return "unsafe", None
    raw = safe_read(identity, 512)
    if raw is None:
        return "unsafe", None
    try:
        expected = raw.decode("utf-8")
    except UnicodeError:
        return "unsafe", None
    if not expected.endswith("\n") or "\n" in expected[:-1] or not safe_host(expected[:-1]):
        return "unsafe", None
    expected = expected[:-1]
    if explicit is not None and explicit != expected:
        return "mismatch", expected
    return ("ready" if local_host == expected else "mismatch"), expected


def parse_runner(path: Path, now: float) -> tuple[str, dict[str, Any] | None]:
    if not path.exists() and not path.is_symlink():
        return "missing", None
    # This is non-secret telemetry on a Cloud-backed filesystem. Permit read bits but never group/world
    # writes, and retain the same owner/no-follow/stable-inode checks.
    raw = safe_read(path, 16 * 1024, private=False)
    if raw is None:
        return "invalid", None
    try:
        value = json.loads(raw)
    except (UnicodeError, json.JSONDecodeError):
        return "invalid", None
    if not isinstance(value, dict) or value.get("schema_version") not in {1, 2}:
        return "invalid", None
    expected = RUNNER_V2_KEYS if value["schema_version"] == 2 else RUNNER_V1_KEYS
    if set(value) != expected or value.get("service") != "connector-fetcher":
        return "invalid", None
    if (value.get("state") not in {"running", "completed", "failed"}
            or value.get("interval_seconds") != INTERVAL or not safe_host(value.get("host"))
            or not isinstance(value.get("pid"), int) or isinstance(value.get("pid"), bool)
            or value["pid"] <= 0):
        return "invalid", None
    for key in ("processed_rows", "failed_rows", "skipped_manifests"):
        count = value.get(key)
        if not isinstance(count, int) or isinstance(count, bool) or count < 0:
            return "invalid", None
    if value["failed_rows"] > value["processed_rows"]:
        return "invalid", None
    started = epoch(value.get("sweep_started_at"))
    progress = epoch(value.get("last_progress_at"))
    completed = epoch(value.get("sweep_completed_at")) if value.get("sweep_completed_at") is not None else None
    if started is None or progress is None or progress < started:
        return "invalid", None
    if started > now + 300 or progress > now + 300 or (completed is not None and completed > now + 300):
        return "invalid", None
    state = value["state"]
    if state == "running":
        if completed is not None or value.get("error_code") is not None:
            return "invalid", None
        seen = progress
        fresh_for = max(INTERVAL * 4, 3600)
    else:
        if completed is None or completed < progress:
            return "invalid", None
        if state == "failed" and value["processed_rows"] == 0 and completed < progress:
            return "invalid", None
        if state == "completed" and value.get("error_code") is not None:
            return "invalid", None
        if state == "failed" and (not isinstance(value.get("error_code"), str)
                                   or not ERROR_RE.fullmatch(value["error_code"])):
            return "invalid", None
        seen = completed
        fresh_for = INTERVAL * 3
    if value["schema_version"] == 2 and (
            not isinstance(value.get("run_id"), str) or not RUN_RE.fullmatch(value["run_id"])
            or not isinstance(value.get("deployed_commit"), str)
            or not SHA_RE.fullmatch(value["deployed_commit"])):
        return "invalid", None
    value["_started_epoch"] = started
    value["_fresh"] = now - seen < fresh_for
    return ("v2" if value["schema_version"] == 2 else "v1"), value


def valid_supervisor(value: Any) -> bool:
    if not isinstance(value, dict) or set(value) != SUPERVISOR_KEYS:
        return False
    if (value.get("schema_version") != 1 or value.get("service") != "connector-supervisor"
            or value.get("state") not in STATES or value.get("reason") not in REASONS
            or value.get("role") not in ROLES or value.get("pool") not in POOLS
            or value.get("scheduler") not in SCHEDULERS
            or not isinstance(value.get("ready"), bool)
            or not isinstance(value.get("auto_retry_armed"), bool)
            or (value["ready"] != (value["state"] == "online"))):
        return False
    if epoch(value.get("updated_at")) is None:
        return False
    for key in ("activation_started_at", "last_attempt_at", "retry_not_before"):
        if value.get(key) is not None and epoch(value[key]) is None:
            return False
    for key in ("expected_host", "observed_host"):
        if value.get(key) is not None and not safe_host(value[key]):
            return False
    for key in ("desired_commit", "deployed_commit"):
        if value.get(key) is not None and not SHA_RE.fullmatch(str(value[key])):
            return False
    for key in ("expected_run_id", "run_id"):
        if value.get(key) is not None and not RUN_RE.fullmatch(str(value[key])):
            return False
    updated = epoch(value["updated_at"])
    activation = epoch(value["activation_started_at"]) if value["activation_started_at"] is not None else None
    last_attempt = epoch(value["last_attempt_at"]) if value["last_attempt_at"] is not None else None
    retry = epoch(value["retry_not_before"]) if value["retry_not_before"] is not None else None
    if (updated is None or (activation is not None and activation > updated)
            or (last_attempt is not None and last_attempt > updated)
            or (retry is not None and retry > updated + 300)):
        return False
    state, reason = value["state"], value["reason"]
    starting_reasons = {
        "sweep_in_progress", "awaiting_heartbeat", "retry_cooldown", "transition_busy",
        "install_failed", "heartbeat_legacy", "heartbeat_invalid", "heartbeat_stale",
        "heartbeat_failed",
    }
    if state == "online":
        if (reason != "verified_first_sweep" or value["role"] not in {"doer", "legacy_doer"}
                or value["pool"] != "ready" or value["scheduler"] != "loaded"
                or value["auto_retry_armed"] is not True):
            return False
    elif state == "starting":
        if reason not in starting_reasons or (reason == "transition_busy" and value["auto_retry_armed"] is not True):
            return False
    elif state == "paused_drive":
        if (reason, value["pool"]) not in {
                ("drive_unavailable", "unavailable"), ("pool_unconfigured", "unconfigured"),
                ("pool_mismatch", "mismatch")} or value["scheduler"] not in {"unloaded", "missing"}:
            return False
    elif state == "disabled_admin":
        if ((value["role"], reason) not in {("admin", "admin_role"), ("absent", "role_absent")}
                or value["scheduler"] not in {"unloaded", "missing"}):
            return False
    elif state == "blocked_unsafe":
        if not ((reason == "role_unsafe" and value["role"] == "unsafe")
                or (reason == "pool_identity_unsafe" and value["pool"] == "unsafe")
                or (reason == "plist_unsafe" and value["scheduler"] == "unsafe")
                or (reason == "transition_unsafe" and value["auto_retry_armed"] is False)):
            return False
    elif state == "foreign_writer":
        if reason != "foreign_heartbeat" or value["scheduler"] not in {"unloaded", "missing"}:
            return False
    return True


def same_failure(prior: dict[str, Any] | None, reason: str,
                 runner: dict[str, Any] | None, now: float) -> bool:
    """Require two observations or a full cadence before disrupting a loaded job."""
    if reason not in {"heartbeat_failed", "heartbeat_invalid", "heartbeat_stale"}:
        return True
    if prior is None or prior.get("reason") != reason:
        return False
    prior_updated = epoch(prior.get("updated_at"))
    if prior_updated is None:
        return False
    if now - prior_updated >= INTERVAL:
        return True
    if runner is None:
        return reason in {"heartbeat_invalid", "heartbeat_stale"}
    current_run = runner.get("run_id")
    return current_run is not None and current_run == prior.get("run_id")


def read_prior(path: Path) -> dict[str, Any] | None:
    raw = safe_read(path, 16 * 1024)
    if raw is None:
        return None
    try:
        value = json.loads(raw)
    except (UnicodeError, json.JSONDecodeError):
        return None
    return value if valid_supervisor(value) else None


def desired_commit(repo: Path) -> str | None:
    """Return only a clean canonical production main exactly at known origin/main."""
    try:
        if repo.is_symlink() or repo.resolve(strict=True) != repo or repo.stat().st_uid != os.getuid():
            return None

        def git(*args: str) -> str:
            return subprocess.run(
                ["/usr/bin/git", "-C", str(repo), *args], check=True,
                capture_output=True, text=True, timeout=10,
            ).stdout.strip()

        top = git("rev-parse", "--show-toplevel")
        branch = git("symbolic-ref", "--quiet", "--short", "HEAD")
        head = git("rev-parse", "HEAD")
        remote = git("rev-parse", "origin/main")
        dirty = subprocess.run(
            ["/usr/bin/git", "-C", str(repo), "status", "--porcelain=v1", "-z",
             "--untracked-files=normal"], check=True, capture_output=True, timeout=10,
        ).stdout
    except (OSError, subprocess.SubprocessError):
        return None
    if top != str(repo) or branch != "main" or head != remote:
        return None
    fields = dirty.split(b"\0")
    if fields and fields[-1] == b"":
        fields.pop()
    index = 0
    while index < len(fields):
        record = fields[index]
        if len(record) < 4 or record[2:3] != b" ":
            return None
        status_code, candidate = record[:2], record[3:]
        paths = [candidate]
        if b"R" in status_code or b"C" in status_code:
            index += 1
            if index >= len(fields):
                return None
            paths.append(fields[index])
        for encoded in paths:
            try:
                path = encoded.decode("utf-8", "strict")
            except UnicodeError:
                return None
            if not (path.startswith("analyses/") or path.startswith("screener/")):
                return None
        index += 1
    return head if SHA_RE.fullmatch(head) else None


def plist_shape(path: Path, repo: Path) -> tuple[str, str | None]:
    if not path.exists() and not path.is_symlink():
        return "missing", None
    raw = safe_read(path, 1024 * 1024, private=False)
    if raw is None:
        return "unsafe", None
    try:
        value = plistlib.loads(raw)
    except (plistlib.InvalidFileException, ValueError):
        return "unsafe", None
    if not isinstance(value, dict):
        return "unsafe", None
    expected_runner = str(repo / ".claude" / "tools" / "run_connectors.py")
    expected_data = str(repo / "data")
    env = value.get("EnvironmentVariables")
    args = value.get("ProgramArguments")
    expected_home = str(Path(os.environ.get("HOME", str(Path.home()))).absolute())
    if not isinstance(env, dict):
        return "unsafe", None
    config_value = env.get("NOSTRA_ENGINE_CONFIG_DIR")
    if not isinstance(config_value, str) or not config_value.startswith("/"):
        return "unsafe", None
    config_path = Path(config_value)
    try:
        config_lstat = config_path.lstat()
        if (not stat.S_ISDIR(config_lstat.st_mode) or config_lstat.st_uid != os.getuid()
                or config_lstat.st_mode & 0o077 or config_path.resolve(strict=True) != config_path):
            return "unsafe", None
        providers = config_path / "providers.env"
        if providers.exists() or providers.is_symlink():
            provider_lstat = providers.lstat()
            if (not stat.S_ISREG(provider_lstat.st_mode) or provider_lstat.st_uid != os.getuid()
                    or provider_lstat.st_nlink != 1 or provider_lstat.st_mode & 0o077):
                return "unsafe", None
    except OSError:
        return "unsafe", None
    expected_log = str(Path(expected_home) / "Library" / "Logs" / "nostradamus-connectors.log")
    if (value.get("Label") != "com.nostradamus.connectors"
            or value.get("WorkingDirectory") != str(repo)
            or args != ["/usr/bin/env", "python3", "-I", expected_runner,
                        "--data-root", expected_data]
            or value.get("StartInterval") != INTERVAL or value.get("RunAtLoad") is not True
            or value.get("ThrottleInterval") != 60
            or value.get("MaterializeDatalessFiles") is not True
            or value.get("StandardOutPath") != expected_log
            or value.get("StandardErrorPath") != expected_log
            or env.get("HOME") != expected_home or not isinstance(env.get("PATH"), str)
            or not env.get("PATH")
            or env.get("NOSTRA_CONNECTOR_CREDENTIAL_SOURCE") != "providers_env"
            or any(str(key).startswith("CONNECTOR_") for key in env)):
        return "stale", config_value
    return "valid", config_value


def resolve_config_identity(ops: Path, shape: str, plist_config: str | None) -> tuple[str, str | None]:
    explicit = os.environ.get("NOSTRA_ENGINE_CONFIG_DIR")
    observed = plist_config if plist_config is not None else explicit
    state, identity = private_path_identity(ops / "connector-config-root", explicit=observed)
    if state != "ready":
        return state, identity
    if plist_config is not None and plist_config != identity:
        return "mismatch", identity
    return "ready", identity


def launchctl_loaded(label: str) -> bool:
    executable = os.environ.get("NOSTRA_SUPERVISOR_LAUNCHCTL", "launchctl")
    try:
        return subprocess.run(
            [executable, "print", f"gui/{os.getuid()}/{label}"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=10,
        ).returncode == 0
    except (OSError, subprocess.SubprocessError):
        return False


def launchctl_call(*arguments: str) -> bool:
    executable = os.environ.get("NOSTRA_SUPERVISOR_LAUNCHCTL", "launchctl")
    try:
        return subprocess.run(
            [executable, *arguments], stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL, timeout=15,
        ).returncode == 0
    except (OSError, subprocess.SubprocessError):
        return False


def safe_lock_acquire(path: Path) -> tuple[int | None, str]:
    descriptor: int | None = None
    try:
        if path.is_symlink():
            return None, "unsafe"
        descriptor = os.open(path, os.O_RDWR | os.O_CREAT | getattr(os, "O_NOFOLLOW", 0), 0o600)
        opened = os.fstat(descriptor)
        named = path.lstat()
        if (not stat.S_ISREG(opened.st_mode) or opened.st_uid != os.getuid()
                or opened.st_nlink != 1 or opened.st_mode & 0o077
                or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)):
            raise OSError
        try:
            fcntl.flock(descriptor, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            os.close(descriptor)
            return None, "busy"
        return descriptor, "locked"
    except OSError:
        if descriptor is not None:
            os.close(descriptor)
        return None, "unsafe"


def repo_lock_path(repo: Path) -> Path | None:
    try:
        value = subprocess.run(
            ["/usr/bin/git", "-C", str(repo), "rev-parse", "--git-path",
             "nostra-engine-mutation.flock"], check=True, capture_output=True,
            text=True, timeout=10,
        ).stdout.strip()
        if not value or "\x00" in value or "\n" in value:
            return None
        candidate = Path(value) if value.startswith("/") else repo / value
        return candidate.absolute()
    except (OSError, subprocess.SubprocessError):
        return None


def ordered_locks_acquire(repo: Path, ops: Path, *, autonomy: bool) -> tuple[list[int], str]:
    """Acquire deploy -> repository mutation -> optional connector autonomy."""
    descriptors: list[int] = []
    deploy, result = safe_lock_acquire(ops / ".deploy.flock")
    if deploy is None:
        return [], result
    descriptors.append(deploy)
    mutation = repo_lock_path(repo)
    if mutation is None:
        release_locks(descriptors)
        return [], "unsafe"
    paths = [mutation]
    if autonomy:
        paths.append(ops / "connector-autonomy.lock")
    for path in paths:
        descriptor, result = safe_lock_acquire(path)
        if descriptor is None:
            for held in reversed(descriptors):
                os.close(held)
            return [], result
        descriptors.append(descriptor)
    return descriptors, "locked"


def release_locks(descriptors: list[int]) -> None:
    for descriptor in reversed(descriptors):
        os.close(descriptor)


def invoke_installer(repo: Path, pool: Path, config_dir: str | None) -> bool:
    installer = repo / "scripts" / "ops" / "install-services.sh"
    if not installer.is_file() or installer.is_symlink():
        return False
    env = os.environ.copy()
    env.update({
        "ENGINE_REPO_ROOT": str(repo),
        "NOSTRA_POOL": str(pool),
        # The installer owns the autonomy lease. Its RunAtLoad attempt is allowed to
        # lose the repository lease; the supervisor performs the one proving kick
        # only after every transition lease is released.
        "NOSTRA_CONNECTOR_FORCE_RESTART": "0",
    })
    if config_dir is not None:
        env["NOSTRA_ENGINE_CONFIG_DIR"] = config_dir
    try:
        return subprocess.run(
            ["/bin/bash", str(installer), "--role", "doer", "--only", "connectors"],
            env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=90,
        ).returncode == 0
    except (OSError, subprocess.SubprocessError):
        return False


def scheduler_stop(plist: Path) -> bool:
    """Boot out the fixed label and prove it is absent; retain the plist as retry evidence."""
    domain = f"gui/{os.getuid()}"
    if launchctl_loaded("com.nostradamus.connectors"):
        launchctl_call("bootout", f"{domain}/com.nostradamus.connectors")
    for _ in range(40):
        if not launchctl_loaded("com.nostradamus.connectors"):
            return True
        time.sleep(0.05)
    return False


def scheduler_reload(plist: Path) -> bool:
    """Reload the exact on-disk contract while autonomy is fenced, without kicking it yet."""
    domain = f"gui/{os.getuid()}"
    if not scheduler_stop(plist):
        return False
    if not launchctl_call("bootstrap", domain, str(plist)):
        return False
    return launchctl_loaded("com.nostradamus.connectors")


def scheduler_kick() -> bool:
    return launchctl_call(
        "kickstart", "-k", f"gui/{os.getuid()}/com.nostradamus.connectors"
    )


def status_value(now: float, **values: Any) -> dict[str, Any]:
    value = {
        "schema_version": 1, "service": "connector-supervisor", "updated_at": iso(now),
        "state": values["state"], "reason": values["reason"], "role": values["role"],
        "pool": values["pool"], "scheduler": values["scheduler"],
        "ready": values["state"] == "online",
        "auto_retry_armed": values.get("auto_retry_armed", False),
        "activation_started_at": values.get("activation_started_at"),
        "last_attempt_at": values.get("last_attempt_at"),
        "retry_not_before": values.get("retry_not_before"),
        "expected_host": values.get("expected_host"),
        "desired_commit": values.get("desired_commit"),
        "expected_run_id": values.get("expected_run_id"),
        "observed_host": values.get("observed_host"),
        "deployed_commit": values.get("deployed_commit"),
        "run_id": values.get("run_id"),
    }
    if not valid_supervisor(value):
        raise ValueError("invalid supervisor state")
    return value


def write_status(path: Path, value: dict[str, Any]) -> bool:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n"
    return atomic_private_text(path, payload)


def transition_result(now: float, base: dict[str, Any], result: str) -> dict[str, Any]:
    if result == "busy":
        return status_value(now, state="starting", reason="transition_busy",
                            auto_retry_armed=True, **base)
    return status_value(now, state="blocked_unsafe", reason="transition_unsafe",
                        auto_retry_armed=False, **base)


def fence_scheduler(repo: Path, home: Path, plist: Path) -> str:
    """Stand the writer down under deploy -> repo -> autonomy, then prove unloaded."""
    if not launchctl_loaded("com.nostradamus.connectors"):
        return "stopped"
    ops = home / ".nostra-ops"
    locks, result = ordered_locks_acquire(repo, ops, autonomy=True)
    if not locks:
        return result
    try:
        return "stopped" if scheduler_stop(plist) else "unsafe"
    finally:
        release_locks(locks)


def supervise(repo: Path, home: Path, now: float) -> dict[str, Any]:
    ops = home / ".nostra-ops"
    agents = home / "Library" / "LaunchAgents"
    output = ops / "connector-supervisor.json"
    prior = read_prior(output)
    role = parse_role(ops / "role", agents / "com.nostradamus.tunnel.plist")
    pool, pool_root = pool_state(repo, ops)
    plist = agents / "com.nostradamus.connectors.plist"
    shape, plist_config = plist_shape(plist, repo)
    config_state, config_dir = resolve_config_identity(ops, shape, plist_config)
    scheduler = "unsafe" if shape == "unsafe" else (
        "missing" if shape in {"missing", "stale"} else (
            "loaded" if launchctl_loaded("com.nostradamus.connectors") else "unloaded"))
    runner_kind, runner = parse_runner(repo / "data" / "_connectors" / "runner_status.json", now)
    host = os.environ.get("NOSTRA_SUPERVISOR_HOST", "")
    if not safe_host(host):
        try:
            host = socket.gethostname().strip()
        except OSError:
            host = "unknown"
    if not safe_host(host):
        host = "unknown"
    writer_state, expected_writer = writer_identity(ops, host)
    commit = desired_commit(repo)
    base = {
        "role": role, "pool": pool, "scheduler": scheduler,
        "expected_host": expected_writer,
        "desired_commit": commit,
        "observed_host": runner.get("host") if runner else None,
        "deployed_commit": runner.get("deployed_commit") if runner_kind == "v2" else None,
        "run_id": runner.get("run_id") if runner_kind == "v2" else None,
        "activation_started_at": prior.get("activation_started_at") if prior else None,
        "last_attempt_at": prior.get("last_attempt_at") if prior else None,
        "retry_not_before": prior.get("retry_not_before") if prior else None,
        "expected_run_id": prior.get("expected_run_id") if prior else None,
    }

    nonwriter: tuple[str, str] | None = None
    if role == "admin":
        nonwriter = ("disabled_admin", "admin_role")
    elif role == "absent":
        nonwriter = ("disabled_admin", "role_absent")
    elif role == "unsafe":
        nonwriter = ("blocked_unsafe", "role_unsafe")
    elif writer_state in {"unsafe", "mismatch", "missing"}:
        nonwriter = ("blocked_unsafe", "transition_unsafe")
    elif runner and runner.get("_fresh") and runner.get("host") != expected_writer:
        nonwriter = ("foreign_writer", "foreign_heartbeat")
    elif pool == "unconfigured":
        nonwriter = ("paused_drive", "pool_unconfigured")
    elif pool == "unavailable":
        nonwriter = ("paused_drive", "drive_unavailable")
    elif pool == "mismatch":
        nonwriter = ("paused_drive", "pool_mismatch")
    elif pool == "unsafe":
        nonwriter = ("blocked_unsafe", "pool_identity_unsafe")
    elif config_state != "ready":
        nonwriter = ("blocked_unsafe", "plist_unsafe")
    elif scheduler == "unsafe":
        nonwriter = ("blocked_unsafe", "plist_unsafe")
    if nonwriter is not None:
        fenced = fence_scheduler(repo, home, plist)
        if fenced != "stopped":
            return transition_result(now, base, fenced)
        state, reason = nonwriter
        if reason == "plist_unsafe":
            base["scheduler"] = "unsafe"
        else:
            base["scheduler"] = "missing" if scheduler == "missing" else "unloaded"
        return status_value(now, state=state, reason=reason, **base)

    activation_epoch = epoch(base["activation_started_at"])
    prior_commit = prior.get("desired_commit") if prior else None
    if prior_commit != commit:
        activation_epoch = None
        base.update(activation_started_at=None, expected_run_id=None)

    if runner_kind == "v2" and runner is not None and runner.get("_fresh"):
        qualifies = (commit is not None and runner["host"] == expected_writer
                     and runner["deployed_commit"] == commit
                     and activation_epoch is not None
                     and runner["_started_epoch"] >= activation_epoch)
        if qualifies and runner["state"] == "running":
            base["expected_run_id"] = runner["run_id"]
            return status_value(now, state="starting", reason="sweep_in_progress",
                                auto_retry_armed=True, **base)
        if (qualifies and scheduler == "loaded" and runner["state"] == "completed"
                and runner["processed_rows"] > 0):
            base["expected_run_id"] = runner["run_id"]
            return status_value(now, state="online", reason="verified_first_sweep",
                                auto_retry_armed=True, **base)

    retry_epoch = epoch(base["retry_not_before"])
    if retry_epoch is not None and now < retry_epoch:
        reason = "retry_cooldown"
        if runner_kind == "v2" and runner and runner.get("_fresh") and runner["state"] == "running":
            reason = "sweep_in_progress"
            base["expected_run_id"] = runner["run_id"]
        return status_value(now, state="starting", reason=reason,
                            auto_retry_armed=True, **base)

    reason = {
        "v1": "heartbeat_legacy", "invalid": "heartbeat_invalid",
        "missing": "awaiting_heartbeat",
    }.get(runner_kind, "heartbeat_stale")
    if runner is not None and runner.get("_fresh") and runner.get("state") == "failed":
        reason = "heartbeat_failed"
    if commit is None or pool_root is None:
        return status_value(now, state="starting", reason="install_failed",
                            auto_retry_armed=False, **base)
    repair_immediate = shape in {"missing", "stale"} or scheduler == "unloaded"
    if not repair_immediate and not same_failure(prior, reason, runner, now):
        return status_value(now, state="starting", reason=reason,
                            auto_retry_armed=True, **base)

    locks, lock_state = ordered_locks_acquire(repo, ops, autonomy=False)
    if not locks:
        return transition_result(now, base, lock_state)
    attempt = iso(now)
    base.update(
        activation_started_at=attempt, last_attempt_at=attempt,
        retry_not_before=iso(now + RETRY_SECONDS), expected_run_id=None,
    )
    try:
        # Re-attest every permission and source input under the deploy and
        # repository leases. The installer takes autonomy third.
        locked_role = parse_role(ops / "role", agents / "com.nostradamus.tunnel.plist")
        locked_pool, locked_root = pool_state(repo, ops)
        locked_writer, locked_expected = writer_identity(ops, host)
        locked_commit = desired_commit(repo)
        locked_shape, locked_plist_config = plist_shape(plist, repo)
        locked_config_state, locked_config = resolve_config_identity(
            ops, locked_shape, locked_plist_config
        )
        if (locked_role not in {"doer", "legacy_doer"} or locked_pool != "ready"
                or locked_root != pool_root or locked_writer != "ready"
                or locked_expected != expected_writer or locked_commit != commit
                or locked_config_state != "ready"):
            return transition_result(now, base, "unsafe")
        installed = invoke_installer(repo, pool_root, locked_config)
        post_shape, post_config = plist_shape(plist, repo)
        installed = (installed and post_shape == "valid" and post_config == locked_config
                     and desired_commit(repo) == commit)
        # Reload even an apparently loaded job: launchctl's in-memory cadence may
        # still be the retired six-hour contract.
        if installed:
            autonomy, autonomy_state = safe_lock_acquire(ops / "connector-autonomy.lock")
            if autonomy is None:
                installed = False
                lock_state = autonomy_state
            else:
                locks.append(autonomy)
                installed = scheduler_reload(plist)
    finally:
        release_locks(locks)
    if not installed:
        if lock_state == "unsafe":
            return transition_result(now, base, "unsafe")
        if lock_state == "busy":
            return transition_result(now, base, "busy")
        return status_value(now, state="starting", reason="install_failed",
                            auto_retry_armed=True, **base)
    # Stamp activation immediately before the sole kick, with no deploy/repo/
    # autonomy lease held. The runner can now acquire and re-attest its own gates.
    activation_now = time.time()
    attempt = iso(activation_now)
    base.update(activation_started_at=attempt, last_attempt_at=attempt,
                retry_not_before=iso(activation_now + RETRY_SECONDS), expected_run_id=None)
    if not scheduler_kick():
        published_now = max(time.time(), activation_now)
        return status_value(published_now, state="starting", reason="install_failed",
                            auto_retry_armed=True, **base)
    base["scheduler"] = "loaded" if launchctl_loaded("com.nostradamus.connectors") else "unloaded"
    published_now = max(time.time(), activation_now)
    return status_value(published_now, state="starting", reason="awaiting_heartbeat",
                        auto_retry_armed=True, **base)


def main() -> int:
    repo = Path(os.environ.get("ENGINE_REPO_ROOT", str(Path.home() / "nostra-prod"))).absolute()
    home = Path(os.environ.get("HOME", str(Path.home()))).absolute()
    now_raw = os.environ.get("NOSTRA_SUPERVISOR_NOW_EPOCH")
    try:
        now = float(now_raw) if now_raw else time.time()
    except ValueError:
        now = time.time()
    try:
        if sys.argv[1:] == ["--ensure-identities"]:
            if not ensure_private_directory(home / ".nostra-ops"):
                return 1
            pool, _ = pool_state(repo, home / ".nostra-ops")
            try:
                local = socket.gethostname().strip()
            except OSError:
                return 1
            writer, _ = writer_identity(home / ".nostra-ops", local, seed=True)
            shape, installed_config = plist_shape(
                home / "Library" / "LaunchAgents" / "com.nostradamus.connectors.plist", repo
            )
            config_candidate = (os.environ.get("NOSTRA_ENGINE_CONFIG_DIR")
                                or installed_config
                                or str(home / ".config" / "nostra-engine"))
            config, _ = private_path_identity(
                home / ".nostra-ops" / "connector-config-root",
                explicit=config_candidate,
            )
            return 0 if pool == writer == config == "ready" else 1
        if sys.argv[1:] == ["--read-config-identity"]:
            state, value = private_path_identity(home / ".nostra-ops" / "connector-config-root")
            if state != "ready" or value is None:
                return 1
            print(value)
            return 0
        if sys.argv[1:] == ["--ensure-config-identity"]:
            shape, installed_config = plist_shape(
                home / "Library" / "LaunchAgents" / "com.nostradamus.connectors.plist", repo
            )
            candidate = (os.environ.get("NOSTRA_ENGINE_CONFIG_DIR")
                         or installed_config
                         or private_path_identity(
                             home / ".nostra-ops" / "connector-config-root"
                         )[1]
                         or str(home / ".config" / "nostra-engine"))
            if not (Path(candidate).exists() or Path(candidate).is_symlink()):
                if not candidate.startswith("/") or not ensure_private_directory(Path(candidate)):
                    return 1
            state, _ = private_path_identity(
                home / ".nostra-ops" / "connector-config-root", explicit=candidate
            )
            return 0 if state == "ready" else 1
        if sys.argv[1:] in (["--writer-eligible"], ["--pool-writer-root"]):
            try:
                local = socket.gethostname().strip()
            except OSError:
                return 1
            state, _ = writer_identity(home / ".nostra-ops", local)
            if state != "ready":
                return 1
            if sys.argv[1:] == ["--pool-writer-root"]:
                # Scheduled sibling writers share the connector's stable identities. This is a
                # read-only eligibility check, never an installer or a new-pool adoption path.
                role = parse_role(home / ".nostra-ops" / "role",
                                  home / "Library" / "LaunchAgents" / "com.nostradamus.tunnel.plist")
                pool, root = pool_state(repo, home / ".nostra-ops", seed=False)
                if role not in {"doer", "legacy_doer"} or pool != "ready" or root is None:
                    return 1
                print(root)
            return 0
        if sys.argv[1:]:
            return 2
        value = supervise(repo, home, now)
        return 0 if write_status(home / ".nostra-ops" / "connector-supervisor.json", value) else 1
    except Exception:
        # Unexpected operational detail belongs on the private stderr/log path, never in the public wire.
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
