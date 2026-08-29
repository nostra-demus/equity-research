#!/usr/bin/env python3
"""
run_connectors.py — Self-heal connector runner for the equity-research engine.

WHY THIS EXISTS
  The connector registry (.claude/connectors/<id>/ = connector.json + fetch.py,
  frameworks/EXTERNAL_DATA.md §7) declares durable data feeds, but nothing runs
  them on their declared cadence — the launchd external-ingest timer runs the
  inbox ROUTER, not the fetchers. This runner closes the loop: it discovers
  every connector generically, verifies the committed current pointer for each
  (connector × subject), and re-runs fetch.py only when the series is missing
  or past its frozen release deadline. A current pool is a no-op sweep.

CONTRACT
  Zero-touch (§26) — connectors are discovered by glob; no connector id is ever
    hardcoded here. A malformed manifest is skipped with a printed reason and
    the sweep continues.
  Point-in-time freshness — production accepts only v2 and uses the release
    contract frozen into the verified committed vintage; it never trusts mtime
    (a Drive sync stamps mtimes; fix F23). Retired v1 helpers exist only for
    explicit historical unit fixtures.
  Fail-closed fetchers — fetch output is staged and admitted only after schema,
    provenance, URL, identity, and commit-chain validation. A failed or suspect
    attempt cannot replace the current projection; its health row carries the
    alert to GET /api/pipelines.
  Pool gate — a subject whose data/<SUBJECT>/ folder does not exist is skipped
    (skipped_no_pool), never created: pool folders are created by the engine's
    own ticker/commodity flows, not by a background timer.
  Manual feeds — a connector whose manifest sets "manual": true is never
    auto-invoked. The sweep records skipped_manual and leaves the series for a
    declared hand-staged refresh; the runner does not hammer a path that cannot
    succeed.
  Ledger — every (connector × subject) decision appends one NDJSON row to
    <data-root>/_connectors/run_ledger.ndjson (the data/_market-style reserved
    lane). --dry-run writes nothing, ledger included.
  Service status — a full automatic sweep (never --dry-run, --only, --subject,
    or manual ingest) atomically refreshes <data-root>/_connectors/runner_status.json at
    start, after each decision row, and at completion/fatal exit. It contains
    no URLs, credentials, messages, or exception text. Status I/O is best effort
    and can never change a publication outcome.

USAGE
  python3 -I run_connectors.py [--data-root data] [--only <connector-id>] [--subject <SUBJECT>] [--force] [--dry-run]
  Run from anywhere (the due-aware launchd timer com.nostradamus.connectors does every 15 minutes).
"""
from __future__ import annotations

# A CLI launch re-executes in Python isolated mode before importing any module
# that can be shadowed by the script directory, cwd, user site, or PYTHONPATH.
# Unit tests import this module under a non-main name and remain in-process.
import os as _bootstrap_os
import sys as _bootstrap_sys

if __name__ == "__main__":
    if not _bootstrap_sys.flags.isolated:
        _bootstrap_os.execv(
            _bootstrap_sys.executable,
            [_bootstrap_sys.executable, "-I", _bootstrap_os.path.abspath(__file__), *_bootstrap_sys.argv[1:]],
        )
    if _bootstrap_sys.pycache_prefix is None:
        # Isolated mode removes repo/cwd/user-site shadows. Redirect bytecode
        # too, so an ignored source-local __pycache__ cannot execute outside
        # the reviewed source fingerprint before the cleanliness gate.
        import tempfile as _bootstrap_tempfile
        _bootstrap_cache = _bootstrap_tempfile.mkdtemp(
            prefix=f"nostra-connectors-pycache-{_bootstrap_os.getpid()}-"
        )
        _bootstrap_os.execv(
            _bootstrap_sys.executable,
            [
                _bootstrap_sys.executable, "-I", "-X", f"pycache_prefix={_bootstrap_cache}",
                _bootstrap_os.path.abspath(__file__), *_bootstrap_sys.argv[1:],
            ],
        )

import argparse
import atexit
import errno
import fcntl
import hashlib
import importlib.util
import json
import os
import re
import shutil
import socket
import stat
import subprocess
import sys
import tempfile
import time
import uuid
import zipfile
from datetime import date, datetime, timedelta, timezone
from xml.etree import ElementTree
from urllib.parse import quote, quote_plus
from zoneinfo import ZoneInfo


def _acquire_repo_mutation_lock_early(repo_root: str) -> int | None:
    """Take the deploy/engine Git mutation lease before repo-owned imports.

    Deployment uses the same `nostra-engine-mutation.flock`. Holding its open
    file description from here through process exit prevents a fast-forward
    between importing publisher code and attesting/publishing with it.
    """
    try:
        resolved = subprocess.run(
            ["git", "rev-parse", "--git-path", "nostra-engine-mutation.flock"],
            cwd=repo_root, capture_output=True, text=True, timeout=5,
        )
        raw = resolved.stdout.strip()
        if resolved.returncode != 0 or not raw or "\x00" in raw or "\n" in raw:
            return None
        path = raw if os.path.isabs(raw) else os.path.join(repo_root, raw)
        path = os.path.abspath(path)
        fd = os.open(
            path,
            os.O_RDWR | os.O_CREAT | os.O_APPEND | getattr(os, "O_NOFOLLOW", 0),
            0o600,
        )
        opened = os.fstat(fd)
        named = os.lstat(path)
        if (not stat.S_ISREG(opened.st_mode) or opened.st_uid != os.getuid()
                or opened.st_nlink != 1 or stat.S_ISLNK(named.st_mode)
                or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)):
            os.close(fd)
            return None
        os.fchmod(fd, 0o600)
        fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        return fd
    except (OSError, ValueError, subprocess.TimeoutExpired):
        try:
            os.close(fd)
        except (NameError, OSError):
            pass
        return None


# This call deliberately precedes HERE and every repository-owned import.
# Unit tests import under a module name and exercise the helper explicitly;
# the isolated production CLI acquires and retains the descriptor to exit.
_EARLY_REPO_MUTATION_LOCK_FD: int | None = None
SCOPED_LOCK_BUSY_EXIT = 75
if __name__ == "__main__":
    _bootstrap_repo = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    _EARLY_REPO_MUTATION_LOCK_FD = _acquire_repo_mutation_lock_early(_bootstrap_repo)
    if _EARLY_REPO_MUTATION_LOCK_FD is None:
        print("[run_connectors] repository mutation lock is held or unsafe — skipping this sweep")
        raise SystemExit(0)

_ephemeral_pycache_prefix = _bootstrap_sys.pycache_prefix
if (_ephemeral_pycache_prefix
        and _bootstrap_os.path.dirname(_ephemeral_pycache_prefix) == tempfile.gettempdir()
        and _bootstrap_os.path.basename(_ephemeral_pycache_prefix).startswith(
            f"nostra-connectors-pycache-{_bootstrap_os.getpid()}-"
        )):
    atexit.register(shutil.rmtree, _ephemeral_pycache_prefix, ignore_errors=True)

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
SCRIPTS_DIR = os.path.join(REPO, "scripts")
_scripts_path_added = SCRIPTS_DIR not in sys.path
if _scripts_path_added:
    # Append after the isolated stdlib paths. Prepending would let an untracked
    # scripts/socket.py shadow the standard library before the git gate runs.
    sys.path.append(SCRIPTS_DIR)
try:
    from connector_contract import (  # noqa: E402
        STABLE_READ_ATTEMPTS as _STABLE_READ_ATTEMPTS,
        TRANSIENT_READ_ERRNOS as _TRANSIENT_READ_ERRNOS,
        advance_release_period,
        canonical_json_bytes,
        connector_storage_paths,
        content_identity as _content_identity,
        load_valid_manifests,
        methodology_only_source_reason,
        no_symlink_path,
        normalise_manifest,
        publisher_owned_sidecar_fields,
        reread_digest_matches as _reread_digest_matches,
        stable_read_backoff as _stable_read_backoff,
        validate_manifest,
        validate_staged_output,
    )
    from connector_vintages import (  # noqa: E402,F401 — public compatibility re-export
        canonical_json_object_strict_prefix,
        compute_vintage_id,
        make_linked_head,
        read_point_in_time,
        recover_pending_current,
        resolve_vintage_id,
        unclaimed_first_vintages_are_safe,
        verify_linked_head,
        verified_committed_vintages,
    )
finally:
    if _scripts_path_added:
        sys.path.remove(SCRIPTS_DIR)
CONNECTORS_ROOT = os.path.join(REPO, ".claude", "connectors")
LEDGER_DIR = "_connectors"                 # reserved lane under the pool root (data/_market precedent)
LEDGER_NAME = "run_ledger.ndjson"
RUNNER_STATUS_NAME = "runner_status.json"
RUNNER_STATUS_SCHEMA_VERSION = 2
RUNNER_INTERVAL_SECONDS = 900
RUNNER_STATUS_KEYS = {
    "schema_version", "service", "state", "interval_seconds", "host", "pid",
    "run_id", "deployed_commit",
    "sweep_started_at", "last_progress_at", "sweep_completed_at", "processed_rows",
    "failed_rows", "skipped_manifests", "error_code",
}
RUNNER_TIMESTAMP_RE = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$")
RUNNER_HOST_RE = re.compile(r"^[^\x00-\x20\x7f]{1,255}$")
BACKOFF_S = (0, 5, 15)                     # bounded retries inside one scheduled acquisition
ATTEMPT_TIMEOUT_S = 60                     # per-attempt fetch timeout; tests override
ASOF_RE = r"(\d{4}-\d{2}-\d{2})"
PUBLISHER_PATHS_FILE = os.path.join(REPO, "frameworks", "connector-publisher-files.json")
MANUAL_INPUT_KEYS = {"sha256", "size_bytes", "filename", "detected_format"}
BUNDLE_COMPONENT_RE = re.compile(r"[A-Za-z0-9._-]+")
# Historical unit fixtures exercise the retired v1 helpers in-process. Live
# discovery never changes this false default.
ALLOW_LEGACY_CONNECTORS_FOR_TESTS = False


class ScheduledTopologyLost(BaseException):
    """Control-flow stop when this host is no longer the authorised writer.

    This deliberately does not inherit from ``Exception``. Connector code has
    many fail-soft boundaries that turn ordinary provider/publication errors
    into health rows; a role or pool-identity change must cross all of those
    boundaries and stop the sweep without manufacturing a failure row.
    """


def _private_regular_at(directory_fd: int, name: str, limit: int) -> bytes | None:
    """Read one owner-private, unique inode through a pinned directory."""
    descriptor: int | None = None
    try:
        before = os.stat(name, dir_fd=directory_fd, follow_symlinks=False)
        if (not stat.S_ISREG(before.st_mode) or before.st_uid != os.getuid()
                or before.st_nlink != 1 or before.st_mode & 0o077
                or not before.st_mode & stat.S_IRUSR
                or not 0 < before.st_size <= limit):
            return None
        descriptor = os.open(
            name, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0), dir_fd=directory_fd,
        )
        opened = os.fstat(descriptor)
        identity = (
            opened.st_dev, opened.st_ino, opened.st_mode, opened.st_uid,
            opened.st_nlink, opened.st_size, opened.st_mtime_ns, opened.st_ctime_ns,
        )
        if identity != (
            before.st_dev, before.st_ino, before.st_mode, before.st_uid,
            before.st_nlink, before.st_size, before.st_mtime_ns, before.st_ctime_ns,
        ):
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
        named = os.stat(name, dir_fd=directory_fd, follow_symlinks=False)
        if identity != (
            after.st_dev, after.st_ino, after.st_mode, after.st_uid,
            after.st_nlink, after.st_size, after.st_mtime_ns, after.st_ctime_ns,
        ) or identity != (
            named.st_dev, named.st_ino, named.st_mode, named.st_uid,
            named.st_nlink, named.st_size, named.st_mtime_ns, named.st_ctime_ns,
        ):
            return None
        return b"".join(chunks)
    except OSError:
        return None
    finally:
        if descriptor is not None:
            os.close(descriptor)


def _canonical_owned_pool(raw: bytes | None) -> tuple[str, tuple[int, int]] | None:
    """Resolve the exact one-line pool identity to an owner-readable directory."""
    if raw is None:
        return None
    try:
        text = raw.decode("utf-8")
    except UnicodeError:
        return None
    if (not text.endswith("\n") or "\n" in text[:-1] or "\x00" in text
            or not text[:-1].startswith("/")):
        return None
    candidate = text[:-1]
    if (not candidate or os.path.abspath(candidate) != candidate
            or os.path.normpath(candidate) != candidate
            or os.path.realpath(candidate) != candidate):
        return None
    descriptor: int | None = None
    try:
        before = os.lstat(candidate)
        if (not stat.S_ISDIR(before.st_mode) or stat.S_ISLNK(before.st_mode)
                or before.st_uid != os.getuid()
                or not os.access(candidate, os.R_OK | os.X_OK)):
            return None
        descriptor = os.open(
            candidate,
            os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0),
        )
        opened = os.fstat(descriptor)
        named = os.lstat(candidate)
        if (not stat.S_ISDIR(opened.st_mode) or opened.st_uid != os.getuid()
                or (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino)
                or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)):
            return None
        return candidate, (opened.st_dev, opened.st_ino)
    except OSError:
        return None
    finally:
        if descriptor is not None:
            os.close(descriptor)


def _stable_pool_link(
    data_link: str, pool_root: str, pool_identity: tuple[int, int],
) -> bool:
    """Prove the production alias and target stay the exact same inodes."""
    try:
        before = os.lstat(data_link)
        before_identity = (
            before.st_dev, before.st_ino, before.st_mode, before.st_uid,
            before.st_size, before.st_mtime_ns, before.st_ctime_ns,
        )
        if (not stat.S_ISLNK(before.st_mode) or before.st_uid != os.getuid()
                or os.path.realpath(data_link) != pool_root):
            return False
        target = os.stat(data_link)
        after = os.lstat(data_link)
        after_identity = (
            after.st_dev, after.st_ino, after.st_mode, after.st_uid,
            after.st_size, after.st_mtime_ns, after.st_ctime_ns,
        )
        return (before_identity == after_identity
                and stat.S_ISDIR(target.st_mode)
                and target.st_uid == os.getuid()
                and (target.st_dev, target.st_ino) == pool_identity)
    except OSError:
        return False


class ScheduledTopologyLease:
    """Retained writer lease plus re-attestable role and pool identity."""

    def __init__(
        self, *, autonomy_fd: int, ops_fd: int, ops_path: str,
        data_link: str, pool_root: str, pool_identity: tuple[int, int],
        expected_host: str,
    ) -> None:
        self.autonomy_fd = autonomy_fd
        self.ops_fd = ops_fd
        self.ops_path = ops_path
        self.data_link = data_link
        self.pool_root = pool_root
        self.pool_identity = pool_identity
        self.expected_host = expected_host
        self.closed = False

    def revalidate(self) -> bool:
        """Treat the role file as an asynchronous demotion kill switch."""
        if self.closed:
            return False
        try:
            opened_ops = os.fstat(self.ops_fd)
            named_ops = os.lstat(self.ops_path)
            if (not stat.S_ISDIR(opened_ops.st_mode) or opened_ops.st_uid != os.getuid()
                    or opened_ops.st_mode & 0o077
                    or (opened_ops.st_dev, opened_ops.st_ino)
                    != (named_ops.st_dev, named_ops.st_ino)):
                return False
            opened_lock = os.fstat(self.autonomy_fd)
            named_lock = os.stat(
                "connector-autonomy.lock", dir_fd=self.ops_fd, follow_symlinks=False,
            )
            if (not stat.S_ISREG(opened_lock.st_mode) or opened_lock.st_uid != os.getuid()
                    or opened_lock.st_nlink != 1 or opened_lock.st_mode & 0o077
                    or (opened_lock.st_dev, opened_lock.st_ino)
                    != (named_lock.st_dev, named_lock.st_ino)):
                return False
            if _private_regular_at(self.ops_fd, "role", 32) != b"doer\n":
                return False
            writer_raw = _private_regular_at(self.ops_fd, "connector-writer-host", 512)
            try:
                local_host = socket.gethostname()
            except OSError:
                return False
            if (writer_raw != (self.expected_host + "\n").encode("utf-8")
                    or local_host != self.expected_host
                    or not RUNNER_HOST_RE.fullmatch(local_host)):
                return False
            observed_pool = _canonical_owned_pool(
                _private_regular_at(self.ops_fd, "pool-root", 4096)
            )
            if observed_pool != (self.pool_root, self.pool_identity):
                return False
            if not _stable_pool_link(
                self.data_link, self.pool_root, self.pool_identity,
            ):
                return False
            return True
        except OSError:
            return False

    def close(self) -> None:
        if self.closed:
            return
        self.closed = True
        for descriptor in (self.autonomy_fd, self.ops_fd):
            try:
                os.close(descriptor)
            except OSError:
                pass


def acquire_scheduled_topology_lease(
    data_root: str, *, home: str | None = None, repo_root: str = REPO,
) -> ScheduledTopologyLease | None:
    """Acquire autonomy only for a proven doer writing its durable pool."""
    ops_path = os.path.join(
        os.path.abspath(home if home is not None else os.path.expanduser("~")),
        ".nostra-ops",
    )
    data_link = os.path.abspath(data_root)
    expected_data_link = os.path.join(os.path.abspath(repo_root), "data")
    ops_fd: int | None = None
    autonomy_fd: int | None = None
    try:
        # Launchd may pass only the reviewed production alias. Accepting an
        # arbitrary symlink to the same pool would let a stale job outside the
        # production checkout acquire writer authority.
        if data_root != expected_data_link or data_link != expected_data_link:
            return None
        ops_info = os.lstat(ops_path)
        if (not stat.S_ISDIR(ops_info.st_mode) or stat.S_ISLNK(ops_info.st_mode)
                or ops_info.st_uid != os.getuid() or ops_info.st_mode & 0o077):
            return None
        ops_fd = os.open(
            ops_path,
            os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0),
        )
        opened_ops = os.fstat(ops_fd)
        if ((opened_ops.st_dev, opened_ops.st_ino) != (ops_info.st_dev, ops_info.st_ino)
                or opened_ops.st_uid != os.getuid() or opened_ops.st_mode & 0o077):
            return None
        flags = os.O_RDWR | os.O_CREAT | getattr(os, "O_NOFOLLOW", 0)
        autonomy_fd = os.open("connector-autonomy.lock", flags, 0o600, dir_fd=ops_fd)
        opened_lock = os.fstat(autonomy_fd)
        named_lock = os.stat(
            "connector-autonomy.lock", dir_fd=ops_fd, follow_symlinks=False,
        )
        if (not stat.S_ISREG(opened_lock.st_mode) or opened_lock.st_uid != os.getuid()
                or opened_lock.st_nlink != 1 or opened_lock.st_mode & 0o077
                or (opened_lock.st_dev, opened_lock.st_ino)
                != (named_lock.st_dev, named_lock.st_ino)):
            return None
        fcntl.flock(autonomy_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if _private_regular_at(ops_fd, "role", 32) != b"doer\n":
            return None
        try:
            local_host = socket.gethostname()
        except OSError:
            return None
        if not RUNNER_HOST_RE.fullmatch(local_host):
            return None
        writer_raw = _private_regular_at(ops_fd, "connector-writer-host", 512)
        try:
            expected_host = writer_raw.decode("utf-8")[:-1] if writer_raw is not None else ""
        except UnicodeError:
            return None
        if (writer_raw != (expected_host + "\n").encode("utf-8")
                or not RUNNER_HOST_RE.fullmatch(expected_host)
                or expected_host != local_host):
            return None
        pool = _canonical_owned_pool(_private_regular_at(ops_fd, "pool-root", 4096))
        if pool is None:
            return None
        pool_root, pool_identity = pool
        if not _stable_pool_link(data_link, pool_root, pool_identity):
            return None
        lease = ScheduledTopologyLease(
            autonomy_fd=autonomy_fd, ops_fd=ops_fd, ops_path=ops_path,
            data_link=data_link, pool_root=pool_root, pool_identity=pool_identity,
            expected_host=expected_host,
        )
        autonomy_fd = None
        ops_fd = None
        if not lease.revalidate():
            lease.close()
            return None
        return lease
    except (OSError, ValueError):
        return None
    finally:
        for descriptor in (autonomy_fd, ops_fd):
            if descriptor is not None:
                try:
                    os.close(descriptor)
                except OSError:
                    pass


_ACTIVE_SCHEDULED_TOPOLOGY: ScheduledTopologyLease | None = None


def _require_scheduled_topology(
    *, data_root: str | None = None, mutation_path: str | None = None,
) -> None:
    """Re-attest the active scheduled writer before fetch or pool mutation."""
    lease = _ACTIVE_SCHEDULED_TOPOLOGY
    if lease is None:
        return
    if data_root is not None and os.path.abspath(data_root) != lease.data_link:
        raise ScheduledTopologyLost()
    if mutation_path is not None:
        candidate = os.path.realpath(os.path.abspath(mutation_path))
        try:
            if os.path.commonpath((candidate, lease.pool_root)) != lease.pool_root:
                raise ScheduledTopologyLost()
        except ValueError:
            raise ScheduledTopologyLost() from None
    if not lease.revalidate():
        raise ScheduledTopologyLost()


def _log(msg: str) -> None:
    print(f"[run_connectors] {msg}")


_STATUS_WARNING_EMITTED = False


def _status_warning() -> None:
    """Report status-lane failure once without exposing a path or exception."""
    global _STATUS_WARNING_EMITTED
    if not _STATUS_WARNING_EMITTED:
        _STATUS_WARNING_EMITTED = True
        try:
            _log("WARNING: runner status telemetry is unavailable; continuing the sweep")
        except OSError:
            pass


def _runner_iso_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")


def _new_runner_status(
    started_at: str | None = None, *, run_id: str | None = None,
    commit: str | None = None,
) -> dict:
    """Create one bounded, non-secret identity for a scheduled sweep.

    The early repository mutation lease keeps ``HEAD`` stable for the live
    process.  Capturing it once here lets the supervisor prove that a
    completed sweep ran the newly activated deployment; later lifecycle writes
    mutate counters and timestamps only, never this identity.
    """
    started = started_at or _runner_iso_now()
    sweep_id = run_id or uuid.uuid4().hex
    deployed = commit if commit is not None else deployed_commit()
    try:
        host = socket.gethostname().strip()[:255]
    except OSError:
        host = "unknown"
    if not RUNNER_HOST_RE.fullmatch(host):
        host = "unknown"
    return {
        "schema_version": RUNNER_STATUS_SCHEMA_VERSION,
        "service": "connector-fetcher",
        "state": "running",
        "interval_seconds": RUNNER_INTERVAL_SECONDS,
        "host": host,
        "pid": os.getpid(),
        "run_id": sweep_id,
        "deployed_commit": deployed,
        "sweep_started_at": started,
        "last_progress_at": started,
        "sweep_completed_at": None,
        "processed_rows": 0,
        "failed_rows": 0,
        "skipped_manifests": 0,
        "error_code": None,
    }


def _valid_runner_status(status_value: object) -> bool:
    """Keep this telemetry wire exact and incapable of carrying exception text."""
    if not isinstance(status_value, dict) or set(status_value) != RUNNER_STATUS_KEYS:
        return False
    if (status_value.get("schema_version") != RUNNER_STATUS_SCHEMA_VERSION
            or status_value.get("service") != "connector-fetcher"
            or status_value.get("state") not in {"running", "completed", "failed"}
            or status_value.get("interval_seconds") != RUNNER_INTERVAL_SECONDS):
        return False
    host = status_value.get("host")
    pid = status_value.get("pid")
    if (not isinstance(host, str) or not RUNNER_HOST_RE.fullmatch(host)
            or not isinstance(pid, int) or isinstance(pid, bool) or pid <= 0):
        return False
    if (not isinstance(status_value.get("run_id"), str)
            or not re.fullmatch(r"[0-9a-f]{32}", status_value["run_id"])
            or not isinstance(status_value.get("deployed_commit"), str)
            or not re.fullmatch(r"[0-9a-f]{40}", status_value["deployed_commit"])):
        return False
    parsed_times: dict[str, datetime] = {}
    for key in ("sweep_started_at", "last_progress_at"):
        value = status_value.get(key)
        if not isinstance(value, str) or not RUNNER_TIMESTAMP_RE.fullmatch(value):
            return False
        try:
            parsed_times[key] = datetime.fromisoformat(value[:-1] + "+00:00")
        except ValueError:
            return False
    completed_at = status_value.get("sweep_completed_at")
    state = status_value["state"]
    if state == "running":
        if completed_at is not None or status_value.get("error_code") is not None:
            return False
    elif not isinstance(completed_at, str) or not RUNNER_TIMESTAMP_RE.fullmatch(completed_at):
        return False
    elif state != "running":
        try:
            parsed_times["sweep_completed_at"] = datetime.fromisoformat(completed_at[:-1] + "+00:00")
        except ValueError:
            return False
    for key in ("processed_rows", "failed_rows", "skipped_manifests"):
        value = status_value.get(key)
        if not isinstance(value, int) or isinstance(value, bool) or value < 0:
            return False
    if status_value["failed_rows"] > status_value["processed_rows"]:
        return False
    if parsed_times["last_progress_at"] < parsed_times["sweep_started_at"]:
        return False
    if (state != "running"
            and parsed_times["sweep_completed_at"] < parsed_times["last_progress_at"]):
        return False
    error_code = status_value.get("error_code")
    if state == "failed":
        if not isinstance(error_code, str) or not re.fullmatch(r"[a-z][a-z0-9_]{0,63}", error_code):
            return False
    elif error_code is not None:
        return False
    return True


def _valid_manual_input(value: object) -> bool:
    return (isinstance(value, dict) and set(value) == MANUAL_INPUT_KEYS
            and isinstance(value.get("sha256"), str)
            and bool(re.fullmatch(r"[0-9a-f]{64}", value["sha256"]))
            and isinstance(value.get("size_bytes"), int)
            and not isinstance(value.get("size_bytes"), bool) and value["size_bytes"] > 0
            and isinstance(value.get("filename"), str) and bool(value["filename"])
            and os.path.basename(value["filename"]) == value["filename"]
            and isinstance(value.get("detected_format"), str) and bool(value["detected_format"]))


def _hash_file(path: str) -> tuple[str, int]:
    digest = hashlib.sha256()
    size = 0
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            digest.update(chunk)
            size += len(chunk)
    return digest.hexdigest(), size


def _manual_identity_reader():
    """Load the complete document reader without running the inbox router."""
    path = os.path.join(HERE, "ingest_external.py")
    spec = importlib.util.spec_from_file_location("connector_manual_ingest_identity", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("manual source identity reader is unavailable")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    extractor = module._load_extract_pool()
    return module, extractor


def _stdlib_ooxml_identity_text(path: str) -> str:
    """Read all OOXML text with stdlib only (launchd Python has no openpyxl)."""
    parts: list[str] = []
    total_uncompressed = 0
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        if "[Content_Types].xml" not in names:
            raise ValueError("ZIP input is not an OOXML package")
        xml_members = [info for info in archive.infolist()
                       if not info.is_dir() and info.filename.lower().endswith(".xml")]
        if len(xml_members) > 10_000:
            raise ValueError("OOXML package has too many XML members")
        for info in xml_members:
            total_uncompressed += info.file_size
            if total_uncompressed > 128 * 1024 * 1024:
                raise ValueError("OOXML identity text exceeds the safe read budget")
            with archive.open(info) as member:
                try:
                    for _event, element in ElementTree.iterparse(member, events=("end",)):
                        if isinstance(element.text, str) and element.text.strip():
                            parts.append(element.text)
                        element.clear()
                except ElementTree.ParseError as exc:
                    raise ValueError(f"OOXML member {info.filename!r} is malformed") from exc
    return "\n".join(parts)


def _snapshot_and_attest_manual_source(source_file: str, subject: str) -> tuple[str, str, dict]:
    """Copy a regular source to local immutable-by-convention staging and scan it fully."""
    original = os.path.abspath(source_file)
    try:
        source_lstat = os.lstat(original)
    except OSError as exc:
        raise ValueError(f"manual source file is unreadable: {exc}") from exc
    if stat.S_ISLNK(source_lstat.st_mode) or not stat.S_ISREG(source_lstat.st_mode):
        raise ValueError("manual source must be a regular non-symlink file")

    snapshot_root = tempfile.mkdtemp(prefix="nostra-manual-source-")
    suffix = os.path.splitext(os.path.basename(original))[1][:32]
    snapshot = os.path.join(snapshot_root, "source" + suffix)
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    source_fd: int | None = None
    try:
        source_fd = os.open(original, flags)
        opened = os.fstat(source_fd)
        if not stat.S_ISREG(opened.st_mode):
            raise ValueError("manual source must remain a regular file while snapshotting")
        digest = hashlib.sha256()
        size = 0
        with os.fdopen(source_fd, "rb", closefd=True) as src, open(snapshot, "xb") as dst:
            source_fd = None
            for chunk in iter(lambda: src.read(1024 * 1024), b""):
                digest.update(chunk)
                size += len(chunk)
                dst.write(chunk)
            dst.flush()
            os.fsync(dst.fileno())
        if size <= 0:
            raise ValueError("manual source is empty")

        try:
            ingest, extractor = _manual_identity_reader()
            text, detected_format, read_error = ingest._complete_identity_text(extractor, snapshot)
        except Exception as exc:
            text, detected_format, read_error = "", "unreadable", f"{type(exc).__name__}: {exc}"
        if (read_error or not str(text or "").strip()) and zipfile.is_zipfile(snapshot):
            try:
                text = _stdlib_ooxml_identity_text(snapshot)
                detected_format, read_error = "zip", None
            except (OSError, ValueError, zipfile.BadZipFile) as exc:
                read_error = f"OOXML: {exc}"
        if read_error:
            raise ValueError(f"manual source cannot be fully read for identity: {read_error}")
        if not isinstance(text, str) or not text.strip():
            raise ValueError(
                f"manual source has no readable identity text (format {detected_format or 'unknown'})"
            )
        filename = os.path.basename(original)
        reason = methodology_only_source_reason(
            filename, text, {"origin": filename},
        )
        if reason:
            raise ValueError(f"methodology-only WILTW source rejected before transform: {reason}")
        attestation = {
            "sha256": digest.hexdigest(), "size_bytes": size,
            "filename": filename, "detected_format": str(detected_format or "unknown"),
        }
        if not _valid_manual_input(attestation):
            raise ValueError("manual source attestation is malformed")
        return snapshot_root, snapshot, attestation
    except Exception:
        shutil.rmtree(snapshot_root, ignore_errors=True)
        raise
    finally:
        if source_fd is not None:
            os.close(source_fd)


def connector_bundle_files(cdir: str) -> list[tuple[str, str]]:
    """Return every executable bundle file as ``(relative_posix, absolute)``.

    Fetchers are allowed to import helpers below their connector directory, so
    a top-level-only fingerprint is not a reproducibility boundary.  Generated
    Python bytecode under ``__pycache__`` is the sole ignored subtree.  A
    symlink or special file fails closed instead of being silently omitted.
    """
    root_info = os.lstat(cdir)
    if stat.S_ISLNK(root_info.st_mode) or not stat.S_ISDIR(root_info.st_mode):
        raise RuntimeError("connector bundle root is not a real directory")
    files: list[tuple[str, str]] = []

    def visit(directory: str, prefix: str = "") -> None:
        for name in sorted(os.listdir(directory)):
            # Relative names are hashed bytes, not display metadata. One ASCII
            # grammar keeps Python code-point and JavaScript UTF-16 ordering
            # from defining different fingerprints for the same bundle.
            if name in {".", ".."} or not BUNDLE_COMPONENT_RE.fullmatch(name):
                raise RuntimeError(f"connector bundle has a non-canonical path component: {name!r}")
            path = os.path.join(directory, name)
            rel = f"{prefix}/{name}" if prefix else name
            info = os.lstat(path)
            if stat.S_ISLNK(info.st_mode):
                raise RuntimeError(f"connector bundle contains a symlink: {rel}")
            if stat.S_ISDIR(info.st_mode):
                if name == "__pycache__":
                    continue
                visit(path, rel)
            elif stat.S_ISREG(info.st_mode):
                files.append((rel.replace(os.sep, "/"), path))
            else:
                raise RuntimeError(f"connector bundle contains a special file: {rel}")

    visit(cdir)
    return sorted(files, key=lambda item: item[0])


def connector_fingerprint(cdir: str) -> str:
    """Stable recursive hash of the deployed connector transform + contract + tests."""
    digest = hashlib.sha256()
    try:
        files = connector_bundle_files(cdir)
        for rel, path in files:
            digest.update(rel.encode("utf-8") + b"\0")
            with open(path, "rb") as fh:
                digest.update(fh.read())
            digest.update(b"\0")
    except (OSError, RuntimeError):
        return ""
    return digest.hexdigest()


def publisher_contract_paths(repo_root: str = REPO, paths_file: str | None = None) -> list[str]:
    paths_file = paths_file or os.path.join(repo_root, "frameworks", "connector-publisher-files.json")
    raw = _read_json(paths_file)
    paths = raw.get("paths") if isinstance(raw, dict) else None
    if (not isinstance(paths, list) or not paths or len(set(paths)) != len(paths)
            or not all(isinstance(rel, str) and rel and not os.path.isabs(rel)
                       and ".." not in rel.split("/") for rel in paths)):
        raise RuntimeError("connector publisher path list is malformed")
    return paths


def publisher_contract_fingerprint(repo_root: str = REPO, paths_file: str | None = None) -> str:
    """Cross-language fingerprint of the exact shared publication contract."""
    paths_file = paths_file or os.path.join(repo_root, "frameworks", "connector-publisher-files.json")
    list_rel = os.path.relpath(paths_file, repo_root).replace(os.sep, "/")
    digest = hashlib.sha256()
    for rel in [list_rel, *publisher_contract_paths(repo_root, paths_file)]:
        path = os.path.join(repo_root, *rel.split("/"))
        if not os.path.isfile(path) or os.path.islink(path):
            raise RuntimeError(f"publisher contract path is missing or not a regular file: {rel}")
        digest.update(rel.encode("utf-8") + b"\0")
        with open(path, "rb") as fh:
            digest.update(fh.read())
        digest.update(b"\0")
    return digest.hexdigest()


def production_code_state(
    cdir: str, connectors_root: str, *, repo_root: str = REPO,
    production_root: str = CONNECTORS_ROOT, paths_file: str | None = None,
) -> tuple[bool, str, str]:
    """Require production connector + shared publisher bytes to be reproducible from HEAD."""
    try:
        publisher_hash = publisher_contract_fingerprint(repo_root, paths_file)
    except Exception as exc:
        return False, str(exc), ""
    if os.path.realpath(connectors_root) != os.path.realpath(production_root):
        return True, "", publisher_hash
    try:
        connector_rel = os.path.relpath(os.path.realpath(cdir), os.path.realpath(repo_root))
        if connector_rel.startswith(".." + os.sep) or connector_rel == "..":
            return False, "production connector directory is outside the repository", publisher_hash
        connector_files = [
            os.path.join(connector_rel, rel).replace(os.sep, "/")
            for rel, _path in connector_bundle_files(cdir)
        ]
        list_path = paths_file or os.path.join(repo_root, "frameworks", "connector-publisher-files.json")
        list_rel = os.path.relpath(list_path, repo_root).replace(os.sep, "/")
        publisher_files = [list_rel, *publisher_contract_paths(repo_root, list_path)]
        expected = [*publisher_files, *connector_files]
        connector_pathspecs = [
            connector_rel,
            f":(exclude,glob){connector_rel}/**/__pycache__/**",
        ]
        tracked = subprocess.run(
            ["git", "ls-files", "-z", "--", *connector_pathspecs, *publisher_files],
            cwd=repo_root, capture_output=True, timeout=10,
        )
        tracked_set = {item.decode("utf-8") for item in tracked.stdout.split(b"\0") if item}
        if tracked.returncode != 0 or tracked_set != set(expected):
            return False, "connector/shared publisher files are not all tracked in HEAD", publisher_hash
        dirty = subprocess.run(
            ["git", "status", "--porcelain=v1", "--untracked-files=all", "--", *connector_pathspecs, *publisher_files],
            cwd=repo_root, capture_output=True, text=True, timeout=10,
        )
        if dirty.returncode != 0 or dirty.stdout.strip():
            return False, "connector/shared publisher files are dirty relative to HEAD", publisher_hash
        head = deployed_commit(repo_root)
        if head is None:
            return False, "repository HEAD is unavailable; connector provenance is not reproducible", publisher_hash
        branch = subprocess.run(
            ["git", "symbolic-ref", "--quiet", "--short", "HEAD"], cwd=repo_root,
            capture_output=True, text=True, timeout=5,
        )
        if branch.returncode != 0 or branch.stdout.strip() != "main":
            return False, "production publication requires the checked-out main branch", publisher_hash
        local_main = subprocess.run(
            ["git", "rev-parse", "--verify", "refs/heads/main"], cwd=repo_root,
            capture_output=True, text=True, timeout=5,
        )
        if local_main.returncode != 0 or local_main.stdout.strip() != head:
            return False, "production HEAD does not equal the local main ref", publisher_hash
        origin_main = subprocess.run(
            ["git", "rev-parse", "--verify", "--quiet", "refs/remotes/origin/main^{commit}"], cwd=repo_root,
            capture_output=True, text=True, timeout=5,
        )
        origin_value = origin_main.stdout.strip()
        if (origin_main.returncode != 0
                or not re.fullmatch(r"[0-9a-f]{40,64}", origin_value)):
            return False, "production origin/main ref is unavailable or unresolvable", publisher_hash
        if origin_value != head:
            return False, "production HEAD does not equal the known origin/main ref", publisher_hash
        return True, "", publisher_hash
    except (OSError, RuntimeError, subprocess.TimeoutExpired) as exc:
        return False, f"cannot prove connector/shared publisher cleanliness: {exc}", publisher_hash


def deployed_commit(repo_root: str = REPO) -> str | None:
    try:
        proc = subprocess.run(
            ["git", "rev-parse", "HEAD"], cwd=repo_root, capture_output=True, text=True, timeout=5,
        )
        value = proc.stdout.strip()
        return value if proc.returncode == 0 and re.fullmatch(r"[0-9a-f]{40,64}", value) else None
    except (OSError, subprocess.TimeoutExpired):
        return None


# ---------- discovery + validation (fail-soft per manifest, never crashes the sweep) ----------

def discover(connectors_root: str):
    """Yield (connector_dir, manifest) for every valid manifest; collect (dirname, reason) for the rest."""
    manifests, skipped = load_valid_manifests(
        connectors_root, allow_legacy=ALLOW_LEGACY_CONNECTORS_FOR_TESTS,
    )
    return [(m.pop("_dir"), m) for m in manifests], skipped


def _validate(dirname: str, cdir: str, man) -> str | None:
    errors = validate_manifest(dirname, cdir, man)
    return "; ".join(errors) if errors else None


# ---------- freshness (as_of from FILENAMES, never mtime) ----------

def _series_location(man: dict, data_root: str, subject: str):
    rel = man["output_path"].replace("<SUBJECT>", subject)
    if rel.startswith("data/"):
        rel = rel[len("data/"):]
    rel = os.path.join(data_root, rel)
    pattern = re.compile("^" + re.escape(os.path.basename(rel)).replace(re.escape("<as_of>"), ASOF_RE) + "$")
    return os.path.dirname(rel), pattern


def latest_as_of(man: dict, data_root: str, subject: str):
    if man.get("manifest_version") == 2:
        try:
            current = _read_json(connector_storage_paths(data_root, man, subject)["current"])
            value = current.get("as_of") if isinstance(current, dict) else None
            return datetime.strptime(value, "%Y-%m-%d").date() if isinstance(value, str) else None
        except (OSError, ValueError, json.JSONDecodeError):
            return None
    provider_dir, pattern = _series_location(man, data_root, subject)
    best = None
    try:
        names = os.listdir(provider_dir)
    except OSError:
        return None
    for n in names:
        m = pattern.match(n)
        if not m:
            continue
        try:
            d = datetime.strptime(m.group(1), "%Y-%m-%d").date()
        except ValueError:
            continue
        if best is None or d > best:
            best = d
    return best


def release_window(man: dict, as_of: date, retrieved_at: str | datetime | None = None) -> tuple[datetime, datetime]:
    """Return the next due instant and grace deadline in the declared release timezone."""
    release = man["release"]
    zone = ZoneInfo(release["timezone"])
    cadence = release["cadence"]
    base = datetime(as_of.year, as_of.month, as_of.day, tzinfo=zone)
    retrieved = None
    if retrieved_at:
        try:
            retrieved = (retrieved_at if isinstance(retrieved_at, datetime)
                         else datetime.fromisoformat(str(retrieved_at).replace("Z", "+00:00")))
            if retrieved.tzinfo is None:
                retrieved = retrieved.replace(tzinfo=timezone.utc)
            retrieved = retrieved.astimezone(zone)
        except (TypeError, ValueError):
            retrieved = None
    next_date = advance_release_period(as_of, cadence)
    if next_date is not None:
        next_period = datetime(next_date.year, next_date.month, next_date.day, tzinfo=zone)
    elif cadence == "twelve_hourly":
        next_period = (retrieved or base) + timedelta(hours=12)
    elif cadence == "event_driven":
        # Event-driven feeds have no predictable observation period: recheck
        # from the accepted retrieval using their declared grace interval.
        next_period = (retrieved or base) + timedelta(days=float(release["grace_days"]))
        return next_period, next_period
    else:
        raise ValueError(f"unsupported connector release cadence: {cadence!r}")
    due = next_period + timedelta(days=float(release["expected_lag_days"]))
    return due, due + timedelta(days=float(release["grace_days"]))


def release_is_due(man: dict, now: datetime, as_of: date, retrieved_at: str | datetime | None = None) -> tuple[bool, bool]:
    due, grace_end = release_window(man, as_of, retrieved_at)
    local_now = now.astimezone(ZoneInfo(man["release"]["timezone"]))
    return local_now >= due, local_now <= grace_end


_FIXED_DUE_ATTEMPT_INTERVALS = {
    "twelve_hourly": timedelta(hours=12),
    "daily": timedelta(hours=6),
    "weekly": timedelta(hours=24),
    "monthly": timedelta(hours=24),
    "quarterly": timedelta(hours=24),
    "semiannual": timedelta(hours=24),
    "annual": timedelta(hours=24),
}


def due_attempt_interval(man: dict) -> timedelta | None:
    """Minimum time between actual acquisitions while a release remains due.

    The scheduler wakes every fifteen minutes, but a due source must not be
    hammered every wake. Event-driven feeds derive their retry clock from the
    declared grace window, bounded to a 15-minute floor and 24-hour ceiling.
    Invalid cadences have no interval. They are rejected by manifest
    validation before production discovery; this return keeps the helper
    fail-closed when called directly with an unvalidated object.
    """
    cadence = man.get("release", {}).get("cadence")
    if cadence in _FIXED_DUE_ATTEMPT_INTERVALS:
        return _FIXED_DUE_ATTEMPT_INTERVALS[cadence]
    if cadence == "event_driven":
        try:
            seconds = float(man["release"]["grace_days"]) * 24 * 60 * 60
        except (KeyError, TypeError, ValueError):
            return None
        if not (seconds >= 0):  # rejects NaN without importing another numeric policy
            return None
        return timedelta(seconds=min(24 * 60 * 60, max(15 * 60, seconds)))
    return None


def _ledger_key(row: dict) -> tuple[str, str, str, str, str] | None:
    values = tuple(row.get(field) for field in (
        "connector", "dataset_id", "series_id", "provider", "subject",
    ))
    return values if all(isinstance(value, str) and value for value in values) else None


def _checked_at(value: object) -> datetime | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return None
    return parsed.astimezone(timezone.utc)


def _read_attempt_history(
    data_root: str,
) -> tuple[
    dict[tuple[str, str, str, str, str], datetime],
    dict[tuple[str, str, str, str, str], dict],
    str | None,
]:
    """Read persisted actual-attempt clocks and the last public row.

    Only ``checked_at`` on an actual acquisition decision marks an attempt.
    Sweep/no-op/deferred rows carry ``ts`` but must never move the throttle
    clock. Corrupt rows are skipped individually so one damaged append cannot
    erase every valid prior clock and make the 15-minute scheduler hammer a
    slow source. The returned warning is copied into subsequent rows for
    operator-visible ledger-integrity reporting.
    """
    ledger_path = os.path.join(data_root, LEDGER_DIR, LEDGER_NAME)
    try:
        ledger_bytes = _read_regular_nofollow_bytes(ledger_path)
        attempts: dict[tuple[str, str, str, str, str], datetime] = {}
        latest: dict[tuple[str, str, str, str, str], dict] = {}
        malformed_rows = 0
        for raw_line in ledger_bytes.splitlines():
            if not raw_line.strip():
                continue
            try:
                line = raw_line.decode("utf-8", "strict")
                row = json.loads(line)
            except (UnicodeError, json.JSONDecodeError):
                malformed_rows += 1
                continue
            if not isinstance(row, dict):
                malformed_rows += 1
                continue
            key = _ledger_key(row)
            if key is None:
                continue
            decision = row.get("decision")
            outcome = row.get("outcome")
            allowed_outcomes = {
                "refetched": {"current", "no_new_release", "stalled"},
                "manual_ingested": {"current", "no_new_release", "stalled"},
                "reprojected": {"current"},
                "recovered_commit": {"current"},
                "fresh": {"current"},
                "failed": {"stalled", "schema_failed", "suspect", "credentials_missing", "broken", "quarantined"},
                "deferred": {"current", "no_new_release", "stalled", "schema_failed", "suspect", "credentials_missing", "broken", "quarantined"},
                "skipped_no_pool": {"no_pool"},
                "skipped_manual": {"manual"},
                "would_refetch": {"pending", "dry_run"},
                "would_reproject": {"pending"},
            }.get(decision)
            if allowed_outcomes is None or not isinstance(outcome, str) or outcome not in allowed_outcomes:
                malformed_rows += 1
                continue
            latest[key] = row
            checked = _checked_at(row.get("checked_at"))
            # A `failed` row can record ZERO attempts: a keyed connector with no credential resolves to
            # credentials_missing before any network call. Advancing the clock on it defers the next sweep
            # for the whole cadence — up to a month on a monthly feed — so an operator who then supplies the
            # credential still waits out the interval. Only an actual attempt moves an actual-attempt clock.
            # Absent/non-numeric `attempts` keeps the historical behaviour (older rows predate the field).
            tried = row.get("attempts")
            no_attempt_made = isinstance(tried, (int, float)) and not isinstance(tried, bool) and tried <= 0
            if (checked is not None and not no_attempt_made
                    and decision in {"refetched", "failed", "manual_ingested"}
                    and (key not in attempts or checked > attempts[key])):
                attempts[key] = checked
        warning = None
        if malformed_rows:
            warning = (
                f"connector run ledger contains {malformed_rows} malformed or contract-invalid "
                "row(s); valid prior attempt clocks were retained"
            )
        return attempts, latest, warning
    except FileNotFoundError:
        return {}, {}, None
    except (OSError, RuntimeError) as exc:
        return {}, {}, f"connector run ledger could not be read safely: {type(exc).__name__}"


def _deferred_attempt_row(
    row: dict, prior: dict | None, retry_at: datetime, *, within_grace: bool, dry_run: bool,
) -> None:
    """Record scheduling deferral without manufacturing a new health result."""
    prior = prior if isinstance(prior, dict) else {}
    outcome = prior.get("outcome") if isinstance(prior.get("outcome"), str) else "current"
    if not within_grace and outcome in {"current", "no_new_release"}:
        outcome = "stalled"
    row.update({
        "decision": "would_defer" if dry_run else "deferred",
        "outcome": outcome,
        "failure_kind": prior.get("failure_kind") if isinstance(prior.get("failure_kind"), str) else None,
        "message": str(prior.get("message") or ""),
        "publication_outcome": prior.get("publication_outcome"),
        "next_attempt_at": retry_at.astimezone(timezone.utc).isoformat(
            timespec="microseconds",
        ).replace("+00:00", "Z"),
    })


# ---------- execution (retry with backoff; a failed fetch writes nothing by contract) ----------

_RUNTIME_ENV = ("PATH", "LANG", "LC_ALL", "LC_CTYPE", "TMPDIR", "TZ", "SSL_CERT_FILE", "SSL_CERT_DIR")


def _credential_file_identity(info: os.stat_result) -> tuple[int, int, int, int, int, int]:
    """Full change-detecting identity for the private credential file.

    Device, inode and size alone accept a SAME-SIZE in-place rewrite: an operator or rotation tool
    overwriting providers.env with equal-length bytes while this loader reads it passes every check, and
    the loader then exports the STALE value as the connector's credential. mtime_ns/ctime_ns catch the
    in-place edit through the same inode; st_nlink != 1 rejects a hardlink alias that could be mutated
    through another path. Mirrors _identity() in scripts/ops/migrate-connector-secrets.py.
    """
    return (info.st_dev, info.st_ino, info.st_size,
            info.st_mtime_ns, info.st_ctime_ns, info.st_nlink)


def load_declared_credentials(man: dict) -> None:
    """Load only this connector's declared secret names from providers.env.

    This mirrors the server's out-of-repo environment loader without sourcing
    shell code. Outside production strict mode an explicit invocation value
    wins. Strict ``providers_env`` mode first discards inherited declared
    values, so launchd can source credentials only from the private file.
    """
    declared = {name for name in man.get("credential_env", []) if isinstance(name, str) and name}
    strict_file_source = os.environ.get("NOSTRA_CONNECTOR_CREDENTIAL_SOURCE") == "providers_env"
    if strict_file_source:
        for name in declared:
            os.environ.pop(name, None)
    wanted = declared if strict_file_source else {name for name in declared if not os.environ.get(name)}
    if not wanted:
        return
    config_dir = os.environ.get("NOSTRA_ENGINE_CONFIG_DIR") or os.path.join(
        os.path.expanduser("~"), ".config", "nostra-engine",
    )
    env_path = os.path.join(config_dir, "providers.env")
    dir_fd: int | None = None
    file_fd: int | None = None
    try:
        current_uid = os.getuid()
        dir_info = os.lstat(config_dir)
        if (not stat.S_ISDIR(dir_info.st_mode) or stat.S_ISLNK(dir_info.st_mode)
                or dir_info.st_uid != current_uid or stat.S_IMODE(dir_info.st_mode) & 0o077):
            return
        dir_fd = os.open(
            config_dir,
            os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0),
        )
        opened_dir = os.fstat(dir_fd)
        if ((opened_dir.st_dev, opened_dir.st_ino) != (dir_info.st_dev, dir_info.st_ino)
                or not stat.S_ISDIR(opened_dir.st_mode) or opened_dir.st_uid != current_uid
                or stat.S_IMODE(opened_dir.st_mode) & 0o077):
            return
        info = os.stat("providers.env", dir_fd=dir_fd, follow_symlinks=False)
        if (not stat.S_ISREG(info.st_mode) or stat.S_ISLNK(info.st_mode)
                or info.st_uid != current_uid or stat.S_IMODE(info.st_mode) & 0o077
                or info.st_nlink != 1
                or info.st_size > 1024 * 1024):
            return
        file_fd = os.open(
            "providers.env", os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0), dir_fd=dir_fd,
        )
        opened = os.fstat(file_fd)
        if (_credential_file_identity(opened) != _credential_file_identity(info)
                or not stat.S_ISREG(opened.st_mode) or opened.st_uid != current_uid
                or stat.S_IMODE(opened.st_mode) & 0o077):
            return
        chunks: list[bytes] = []
        remaining = opened.st_size
        while remaining:
            chunk = os.read(file_fd, min(remaining, 64 * 1024))
            if not chunk:
                return
            chunks.append(chunk); remaining -= len(chunk)
        raw_text = b"".join(chunks).decode("utf-8")

        after_dir = os.fstat(dir_fd)
        path_dir = os.lstat(config_dir)
        after_file = os.fstat(file_fd)
        path_file = os.stat("providers.env", dir_fd=dir_fd, follow_symlinks=False)
        if ((after_dir.st_dev, after_dir.st_ino) != (opened_dir.st_dev, opened_dir.st_ino)
                or (path_dir.st_dev, path_dir.st_ino) != (opened_dir.st_dev, opened_dir.st_ino)
                or path_dir.st_uid != current_uid or stat.S_IMODE(path_dir.st_mode) & 0o077
                or _credential_file_identity(after_file) != _credential_file_identity(opened)
                or _credential_file_identity(path_file) != _credential_file_identity(opened)
                or after_file.st_uid != current_uid or path_file.st_uid != current_uid
                or stat.S_IMODE(after_file.st_mode) & 0o077
                or stat.S_IMODE(path_file.st_mode) & 0o077):
            return
        lines = raw_text.splitlines()
    except (OSError, UnicodeError):
        return
    finally:
        if file_fd is not None:
            os.close(file_fd)
        if dir_fd is not None:
            os.close(dir_fd)

    parsed: dict[str, str] = {}
    seen: set[str] = set()
    for raw in lines:
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].strip()
        key, sep, value = line.partition("=")
        key = key.strip()
        if not sep:
            continue
        # Parse the complete file before mutating the process environment. A
        # duplicate definition is ambiguous regardless of whether this
        # connector currently requests that key, so the whole file fails
        # closed instead of preserving the old first-wins behavior.
        if key in seen:
            return
        seen.add(key)
        if key not in wanted:
            continue
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        # Never silently transform a credential between redaction and use.
        # A quoted value may preserve edge whitespace that a child library
        # later strips; reject the whole file instead of sending a different
        # secret from the one the runner protects.
        if value != value.strip() or any(ord(char) < 0x20 or ord(char) == 0x7F for char in value):
            return
        if value:
            parsed[key] = value
    os.environ.update(parsed)


def _usable_credential_value(name: str) -> str | None:
    value = os.environ.get(name)
    if (not value or value != value.strip()
            or any(ord(char) < 0x20 or ord(char) == 0x7F for char in value)):
        return None
    return value


def connector_child_env(man: dict) -> dict[str, str]:
    """Pass runtime basics plus explicitly declared credentials, never the full environment."""
    load_declared_credentials(man)
    env = {key: value for key, value in os.environ.items() if key in _RUNTIME_ENV}
    for name in man.get("credential_env") or []:
        value = _usable_credential_value(name)
        if value is not None:
            env[name] = value
    env["PYTHONUNBUFFERED"] = "1"
    return env


def credential_variants(man: dict) -> set[str]:
    """Declared secret values in every representation the runner recognizes."""
    secrets: set[str] = set()
    for name in man.get("credential_env", []):
        value = os.environ.get(name)
        if not value:
            continue
        # Include the raw and stripped spellings defensively. Execution rejects
        # edge whitespace, but diagnostics produced before that boundary must
        # still never expose either representation.
        for variant in {value, value.strip()}:
            if variant:
                secrets.update({variant, quote(variant, safe=""), quote_plus(variant, safe="")})
    return {value for value in secrets if value}


def _credential_pattern(value: str) -> re.Pattern[str]:
    """Match a secret exactly while accepting either case for percent hex.

    URI percent escapes are case-insensitive.  ``urllib.parse.quote`` emits
    uppercase escapes, but a server or child process may echo ``%2f`` instead
    of ``%2F``.  Alphabetic characters outside an escape remain case-sensitive
    so ordinary messages are not needlessly suppressed.
    """
    pieces: list[str] = []
    index = 0
    while index < len(value):
        if (value[index] == "%" and index + 2 < len(value)
                and all(char in "0123456789abcdefABCDEF" for char in value[index + 1:index + 3])):
            escaped = ["%"]
            for char in value[index + 1:index + 3]:
                escaped.append(f"[{char.lower()}{char.upper()}]" if char.isalpha() else re.escape(char))
            pieces.append("".join(escaped))
            index += 3
            continue
        pieces.append(re.escape(value[index]))
        index += 1
    return re.compile("".join(pieces))


def redact_credentials(message: str, man: dict) -> str:
    """Remove declared secret values (literal and URL-encoded) before persistence or UI."""
    text = str(message or "")
    secrets = credential_variants(man)
    for secret in sorted((value for value in secrets if value), key=len, reverse=True):
        text = _credential_pattern(secret).sub("[REDACTED]", text)
    return text


def staged_contains_credential(value: object, man: dict) -> bool:
    """Reject an accidental credential copy before payload/provenance publication."""
    patterns = [_credential_pattern(secret) for secret in credential_variants(man)]
    if not patterns:
        return False
    stack = [value]
    while stack:
        item = stack.pop()
        if isinstance(item, str) and any(pattern.search(item) for pattern in patterns):
            return True
        if isinstance(item, dict):
            stack.extend(item.keys()); stack.extend(item.values())
        elif isinstance(item, (list, tuple)):
            stack.extend(item)
    return False


def run_fetch(cdir: str, man: dict, subject: str, data_root: str, extra_args: list[str] | None = None):
    """Returns (ok, attempts, exit_code, message)."""
    exit_code, message = None, ""
    for attempt, pause in enumerate(BACKOFF_S, start=1):
        _require_scheduled_topology(data_root=data_root)
        if pause:
            time.sleep(pause)
            _require_scheduled_topology(data_root=data_root)
        cache_label = re.sub(r"[^A-Za-z0-9_.-]", "-", str(man.get("id") or "connector"))
        pycache_root = tempfile.mkdtemp(prefix=f"nostra-{cache_label}-pycache-")
        cmd = [
            sys.executable, "-I", "-X", f"pycache_prefix={pycache_root}",
            os.path.join(cdir, man["entry"]), "--subject", subject,
            "--data-root", os.path.abspath(data_root), *(extra_args or []),
        ]
        try:
            _require_scheduled_topology(data_root=data_root)
            p = subprocess.run(cmd, cwd=cdir, capture_output=True, text=True, timeout=ATTEMPT_TIMEOUT_S,
                               env=connector_child_env(man))
            exit_code = p.returncode
            if p.returncode == 0:
                # whitespace-only stdout is truthy but splitlines() is [] — guard the [-1] (fix: no IndexError)
                lines = (p.stdout or "").strip().splitlines()
                safe_line = redact_credentials(lines[-1], man) if lines else ""
                return True, attempt, 0, safe_line[-400:]
            message = redact_credentials((p.stderr or p.stdout or "").strip(), man)[-400:]
        except subprocess.TimeoutExpired:
            exit_code, message = None, f"timeout after {ATTEMPT_TIMEOUT_S}s"
        finally:
            shutil.rmtree(pycache_root, ignore_errors=True)
    return False, len(BACKOFF_S), exit_code, message


def _read_json(path: str):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def _staged_output(man: dict, stage_root: str, subject: str):
    directory, pattern = _series_location(man, stage_root, subject)
    strict_v2 = man.get("manifest_version") == 2
    all_files: list[str] = []
    if strict_v2:
        stage_abs = os.path.abspath(stage_root)
        expected_dir = os.path.abspath(directory)
        try:
            if os.path.commonpath([stage_abs, expected_dir]) != stage_abs:
                return None, None, None, "staged output path escapes the isolated stage"
        except ValueError:
            return None, None, None, "staged output path escapes the isolated stage"
        allowed_dirs = {stage_abs}
        cursor = expected_dir
        while cursor != stage_abs:
            allowed_dirs.add(cursor)
            parent = os.path.dirname(cursor)
            if parent == cursor:
                return None, None, None, "staged output path escapes the isolated stage"
            cursor = parent
        for walk_root, dirs, files in os.walk(stage_abs, topdown=True, followlinks=False):
            walk_root = os.path.abspath(walk_root)
            for name in dirs:
                candidate = os.path.join(walk_root, name)
                if os.path.islink(candidate):
                    return None, None, None, f"staged filesystem contract rejects symlink directory {os.path.relpath(candidate, stage_abs)}"
                if os.path.abspath(candidate) not in allowed_dirs:
                    return None, None, None, f"staged filesystem contract rejects extra directory {os.path.relpath(candidate, stage_abs)}"
            for name in files:
                candidate = os.path.join(walk_root, name)
                if os.path.islink(candidate) or not os.path.isfile(candidate):
                    return None, None, None, f"staged filesystem contract requires regular non-symlink files: {os.path.relpath(candidate, stage_abs)}"
                all_files.append(os.path.abspath(candidate))
    try:
        names = os.listdir(directory)
    except OSError:
        return None, None, None, "fetch exited zero but wrote no output"
    matches = []
    for name in names:
        match = pattern.fullmatch(name)
        if match:
            matches.append((os.path.join(directory, name), match.group(1)))
    if not matches:
        return None, None, None, "fetch exited zero but wrote no output"
    if len(matches) != 1:
        return None, None, None, f"fetch wrote {len(matches)} outputs; expected exactly one staged output"
    payload_path, filename_as_of = matches[0]
    sidecar_path = payload_path + ".source.json"
    if strict_v2:
        expected_files = {os.path.abspath(payload_path), os.path.abspath(sidecar_path)}
        actual_files = set(all_files)
        if actual_files != expected_files:
            missing = sorted(os.path.relpath(p, stage_abs) for p in expected_files - actual_files)
            extra = sorted(os.path.relpath(p, stage_abs) for p in actual_files - expected_files)
            detail = []
            if missing: detail.append("missing " + ", ".join(missing))
            if extra: detail.append("extra " + ", ".join(extra))
            return None, None, None, "staged filesystem contract requires exactly payload + matching .source.json (" + "; ".join(detail) + ")"
    return payload_path, sidecar_path, filename_as_of, ""


def run_fetch_staged(cdir: str, man: dict, subject: str, data_root: str,
                     extra_args: list[str] | None = None, *, manual_ingest: bool = False):
    """Fetch into an isolated pool and validate before returning publishable bytes.

    Returns a dict with ``ok``/``outcome`` plus a ``stage_root`` on success.
    Every failed attempt is removed, so a prior partial write cannot make a
    later exit-zero/no-output attempt look successful.
    """
    load_declared_credentials(man)
    missing_credentials = [
        name for name in man.get("credential_env", [])
        if _usable_credential_value(name) is None
    ]
    if missing_credentials:
        return {
            "ok": False, "attempts": 0, "exit_code": None, "stage_root": None,
            "outcome": "credentials_missing",
            "message": "missing declared credential environment: " + ", ".join(missing_credentials),
        }
    exit_code, message, outcome = None, "", "fetch_error"
    for attempt, pause in enumerate(BACKOFF_S, start=1):
        _require_scheduled_topology(data_root=data_root)
        if pause:
            time.sleep(pause)
            _require_scheduled_topology(data_root=data_root)
        # Staging must stay on local ephemeral storage.  The production pool is
        # commonly a synced Google Drive mount; writing unvalidated bytes there
        # would expose a credential or malformed payload before quarantine.
        stage_root = tempfile.mkdtemp(prefix=f"nostra-{man['id']}-{subject}-")
        pycache_root = tempfile.mkdtemp(prefix=f"nostra-{man['id']}-pycache-")
        storage_root = os.path.realpath(os.path.abspath(data_root))
        staged_real = os.path.realpath(stage_root)
        if staged_real == storage_root or staged_real.startswith(storage_root + os.sep):
            shutil.rmtree(stage_root, ignore_errors=True)
            return {
                "ok": False, "attempts": 0, "exit_code": None, "stage_root": None,
                "outcome": "staging_contract",
                "message": "local staging directory resolves inside the published data pool",
            }
        os.makedirs(os.path.join(stage_root, subject), exist_ok=True)
        try:
            _require_scheduled_topology(data_root=data_root)
            proc = subprocess.run(
                [
                    sys.executable, "-I", "-X", f"pycache_prefix={pycache_root}",
                    os.path.join(cdir, man["entry"]), "--subject", subject,
                    "--data-root", stage_root, *(extra_args or []),
                ], cwd=cdir, capture_output=True, text=True,
                timeout=ATTEMPT_TIMEOUT_S, env=connector_child_env(man),
            )
        except subprocess.TimeoutExpired:
            shutil.rmtree(stage_root, ignore_errors=True)
            exit_code, message, outcome = None, f"timeout after {ATTEMPT_TIMEOUT_S}s", "timeout"
            continue
        except Exception as exc:
            shutil.rmtree(stage_root, ignore_errors=True)
            exit_code, message, outcome = None, redact_credentials(str(exc), man)[:1200], "fetch_error"
            continue
        finally:
            shutil.rmtree(pycache_root, ignore_errors=True)
        exit_code = proc.returncode
        if proc.returncode != 0:
            shutil.rmtree(stage_root, ignore_errors=True)
            message = redact_credentials((proc.stderr or proc.stdout or "").strip(), man)[-400:]
            outcome = "fetch_error"
            continue
        payload_path, sidecar_path, filename_as_of, missing = _staged_output(man, stage_root, subject)
        if missing:
            shutil.rmtree(stage_root, ignore_errors=True)
            message = redact_credentials(missing, man)
            outcome = "no_output" if missing == "fetch exited zero but wrote no output" else "staging_contract"
            continue
        try:
            payload = _read_json(payload_path)
        except (OSError, json.JSONDecodeError) as exc:
            shutil.rmtree(stage_root, ignore_errors=True)
            message, outcome = redact_credentials(f"staged output is not valid JSON: {exc}", man), "invalid_json"
            continue
        sidecar = None
        try:
            sidecar = _read_json(sidecar_path)
        except (OSError, json.JSONDecodeError) as exc:
            if man.get("manifest_version") == 2:
                shutil.rmtree(stage_root, ignore_errors=True)
                message, outcome = redact_credentials(f"staged provenance sidecar missing or malformed: {exc}", man), "invalid_provenance"
                continue
            sidecar = {}
        if man.get("manifest_version") == 2:
            if staged_contains_credential(payload, man) or staged_contains_credential(sidecar, man):
                shutil.rmtree(stage_root, ignore_errors=True)
                message, outcome = "staged payload/provenance contains a declared credential value", "invalid_provenance"
                continue
            defects = validate_staged_output(
                man, subject, payload, sidecar, filename_as_of, manual_ingest=manual_ingest,
                retrieved_at=datetime.now(timezone.utc),
            )
            if defects:
                shutil.rmtree(stage_root, ignore_errors=True)
                message = redact_credentials("; ".join(defects)[:1200], man)
                provenance_defect = any(d.startswith((
                    "sidecar ", "subject ", "v2 provenance ", "provenance source ", "v2 source ",
                    "payload source_url", "payload source_urls",
                )) for d in defects)
                if provenance_defect:
                    outcome = "invalid_provenance"
                elif all(d.startswith("minimum history") for d in defects):
                    outcome = "quality_suspect"
                else:
                    outcome = "schema_error"
                continue
        return {
            "ok": True, "attempts": attempt, "exit_code": 0, "message": "",
            "outcome": "validated", "stage_root": stage_root, "payload": payload,
            "sidecar": sidecar, "as_of": filename_as_of,
        }
    return {
        "ok": False, "attempts": len(BACKOFF_S), "exit_code": exit_code,
        "message": message, "outcome": outcome, "stage_root": None,
    }


def _publication_temp_directory(path: str) -> str:
    """Use a same-filesystem noncanonical lane for crash-prone temp files."""
    absolute = os.path.abspath(path)
    parts = absolute.split(os.sep)
    indexes = [index for index, part in enumerate(parts) if part == "_connectors"]
    if not indexes:
        # Legacy projections are not identity/commit lanes and their random
        # temp names do not match any pool-data contract.
        return os.path.dirname(absolute) or "."
    connector_root = os.sep.join(parts[:indexes[-1] + 1]) or os.sep
    lane = os.path.join(connector_root, ".publication-tmp")
    if os.path.lexists(lane) and (os.path.islink(lane) or not os.path.isdir(lane)):
        raise RuntimeError("connector publication temp lane is not a real directory")
    _require_scheduled_topology(mutation_path=lane)
    os.makedirs(lane, exist_ok=True)
    if os.path.islink(lane):
        raise RuntimeError("connector publication temp lane may not be a symlink")
    return lane


def _fsync_directory(directory: str) -> None:
    """Best-effort durability barrier for one directory entry update."""
    try:
        descriptor = os.open(directory or ".", os.O_RDONLY)
        try:
            os.fsync(descriptor)
        finally:
            os.close(descriptor)
    except OSError:
        # Some FUSE implementations do not support directory fsync. Their
        # no-clobber guarantees still come from link(2)/O_EXCL, not this hint.
        pass


def _stable_immutable_bytes(path: str, expected: bytes) -> os.stat_result:
    """Prove one exact regular inode is stable, including its link count."""
    before = os.lstat(path)
    if stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode):
        raise RuntimeError(f"immutable connector record is not a regular file at {path}")
    descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(descriptor)
        # ctime excluded: this record sits on the Drive-synced data/ tree, whose sync client bumps
        # ctime via xattrs without touching a byte. The bytes are compared against `expected` in
        # full below, so content equality — not a timestamp — is what actually seals this read.
        identity = _content_identity(opened)
        if (not stat.S_ISREG(opened.st_mode) or identity != _content_identity(before)):
            raise RuntimeError(f"immutable connector record changed before read at {path}")
        chunks: list[bytes] = []
        remaining = opened.st_size
        while remaining:
            chunk = os.read(descriptor, min(remaining, 1024 * 1024))
            if not chunk:
                raise RuntimeError(f"immutable connector record was truncated at {path}")
            chunks.append(chunk)
            remaining -= len(chunk)
        if os.read(descriptor, 1):
            raise RuntimeError(f"immutable connector record grew during read at {path}")
        after_open = os.fstat(descriptor)
        after_path = os.lstat(path)
        if (identity != _content_identity(after_open)
                or identity != _content_identity(after_path)):
            raise RuntimeError(f"immutable connector record changed during read at {path}")
        if b"".join(chunks) != expected:
            raise RuntimeError(f"immutable connector record differs at {path}")
        return after_open
    finally:
        os.close(descriptor)


def _publication_aliases(
    path: str, temp_directory: str, target: os.stat_result,
) -> list[str] | None:
    """Inventory every controlled pending name for one published inode.

    Returning ``None`` means the link count cannot be explained entirely by
    publisher-created names. Never guess that an arbitrary sibling is debris.
    """
    if os.path.basename(temp_directory) != ".publication-tmp":
        return None
    target_path = os.path.abspath(path)
    aliases: list[str] = []
    try:
        with os.scandir(temp_directory) as entries:
            for entry in entries:
                if not entry.name.endswith(".immutable.pending"):
                    continue
                alias_path = os.path.abspath(entry.path)
                if alias_path == target_path:
                    continue
                info = entry.stat(follow_symlinks=False)
                if (stat.S_ISREG(info.st_mode)
                        and (info.st_dev, info.st_ino) == (target.st_dev, target.st_ino)):
                    aliases.append(alias_path)
    except OSError:
        return None
    return sorted(aliases)


def _verify_or_recover_immutable(
    path: str, data: bytes, temp_directory: str, *, recover_pending_aliases: bool,
) -> None:
    """Accept exact bytes only after their canonical inode has one name.

    A process can die after ``link(tmp, final)`` and before unlinking ``tmp``.
    On replay, the extra name is recoverable only when *every* additional link
    is the same inode under the dedicated publication lane. Removing such a
    name cannot clobber another host's final claim. Any unaccounted hard link
    fails closed so a writable alias can never coexist with accepted evidence.
    """
    for _attempt in range(3):
        observed = _stable_immutable_bytes(path, data)
        if observed.st_nlink == 1:
            return
        if not recover_pending_aliases or observed.st_nlink < 2:
            raise RuntimeError(f"immutable connector record has unsafe link count at {path}")
        aliases = _publication_aliases(path, temp_directory, observed)
        if aliases is None or len(aliases) != observed.st_nlink - 1:
            raise RuntimeError(f"immutable connector record has an unaccounted hard-link alias at {path}")

        # Persist the final name before removing its crash-surviving staging
        # names. A live same-byte publisher may still own one of those names;
        # unlinking it is safe because the no-clobber final link remains.
        _fsync_directory(os.path.dirname(path) or ".")
        for alias in aliases:
            try:
                info = os.lstat(alias)
            except FileNotFoundError:
                continue
            if (not stat.S_ISREG(info.st_mode)
                    or (info.st_dev, info.st_ino) != (observed.st_dev, observed.st_ino)):
                raise RuntimeError(f"immutable publication alias changed during recovery at {alias}")
            try:
                _require_scheduled_topology(mutation_path=alias)
                os.unlink(alias)
            except FileNotFoundError:
                pass
        _fsync_directory(temp_directory)
        # Re-open and re-read on the next iteration. This catches a write
        # through the alias immediately before it was removed.
    raise RuntimeError(f"immutable connector record link count did not stabilize at {path}")


def _atomic_write(path: str, data: bytes) -> None:
    _require_scheduled_topology(mutation_path=path)
    directory = os.path.dirname(path) or "."
    _require_scheduled_topology(mutation_path=directory)
    os.makedirs(directory, exist_ok=True)
    _require_scheduled_topology(mutation_path=path)
    fd, tmp = tempfile.mkstemp(
        dir=_publication_temp_directory(path), suffix=".atomic.pending",
    )
    try:
        with os.fdopen(fd, "wb") as fh:
            fh.write(data)
            fh.flush()
            os.fsync(fh.fileno())
        _require_scheduled_topology(mutation_path=path)
        os.replace(tmp, path)
        try:
            dfd = os.open(directory, os.O_RDONLY)
            try:
                os.fsync(dfd)
            finally:
                os.close(dfd)
        except OSError:
            pass
    except BaseException:
        try:
            _require_scheduled_topology(mutation_path=tmp)
            os.unlink(tmp)
        except OSError:
            pass
        raise


def write_runner_status(data_root: str, status_value: dict) -> bool:
    """Best-effort durable status for one full automatic sweep.

    This lane is observability only. It must neither materialise a missing
    Drive pool nor let an I/O/fsync failure change a connector decision or
    publication outcome.
    """
    try:
        if not _valid_runner_status(status_value):
            raise ValueError("invalid runner status wire")
        requested_root = os.path.abspath(data_root)
        if not os.path.isdir(requested_root):
            raise OSError("data pool is unavailable")
        root = os.path.realpath(requested_root)
        status_path = os.path.join(root, LEDGER_DIR, RUNNER_STATUS_NAME)
        if no_symlink_path(root, status_path) is None:
            raise OSError("runner status path is unsafe")
        _atomic_write(status_path, canonical_json_bytes(status_value))
        return True
    except Exception:
        # Telemetry is deliberately below the publication contract. Ordinary
        # path/I/O/fsync failures never change evidence publication; process
        # control signals still propagate to the fatal-status wrapper.
        _status_warning()
        return False


def _write_once(path: str, data: bytes) -> None:
    """Atomically create immutable content; an identical existing file is a safe replay.

    The bytes are fully written + fsynced in a same-filesystem dedicated temp
    lane, then published with an atomic hard-link that cannot overwrite an
    existing immutable record.  On filesystems without hard links the O_EXCL
    fallback writes the claimed file directly because FUSE lacks a no-replace
    rename.  A hard process death can therefore leave a strict prefix.  The
    generic writer never reclaims that prefix: without a durable intent record,
    it could belong to a still-live cross-host writer whose bytes merely share
    the same opening prefix.  Callers must quarantine it or use a narrowly
    proven, in-place recovery path that never unlinks the claim.
    """
    _require_scheduled_topology(mutation_path=path)
    directory = os.path.dirname(path)
    _require_scheduled_topology(mutation_path=directory)
    os.makedirs(directory, exist_ok=True)
    temp_directory = _publication_temp_directory(path)
    _require_scheduled_topology(mutation_path=temp_directory)
    fd, tmp = tempfile.mkstemp(dir=temp_directory, suffix=".immutable.pending")
    try:
        with os.fdopen(fd, "wb") as fh:
            fh.write(data)
            fh.flush()
            os.fsync(fh.fileno())
        try:
            _require_scheduled_topology(mutation_path=path)
            os.link(tmp, path)
            # The final link is the durable claim. Remove the known staging
            # alias before this call may report success, then prove no other
            # writable name survived.
            _fsync_directory(directory)
            try:
                _require_scheduled_topology(mutation_path=tmp)
                os.unlink(tmp)
            except OSError as exc:
                raise RuntimeError(f"immutable publication alias could not be removed at {tmp}") from exc
            _fsync_directory(temp_directory)
            _verify_or_recover_immutable(
                path, data, temp_directory, recover_pending_aliases=False,
            )
        except FileExistsError:
            _verify_or_recover_immutable(
                path, data, temp_directory, recover_pending_aliases=True,
            )
        except OSError as exc:
            unsupported = {errno.EXDEV, errno.EPERM, errno.EOPNOTSUPP, getattr(errno, "ENOTSUP", errno.EOPNOTSUPP)}
            if exc.errno not in unsupported:
                raise
            # Google Drive File Stream and some FUSE mounts reject hard links.
            # Claim the final name with O_EXCL so another host can never be
            # overwritten between an existence check and publication.
            target_fd: int | None = None
            claimed_identity: tuple[int, int] | None = None
            try:
                _require_scheduled_topology(mutation_path=path)
                target_fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
                claimed = os.fstat(target_fd)
                claimed_identity = (claimed.st_dev, claimed.st_ino)
                with os.fdopen(target_fd, "wb") as target:
                    target_fd = None
                    target.write(data)
                    target.flush()
                    os.fsync(target.fileno())
                _fsync_directory(directory)
                _verify_or_recover_immutable(
                    path, data, temp_directory, recover_pending_aliases=False,
                )
            except FileExistsError:
                _verify_or_recover_immutable(
                    path, data, temp_directory, recover_pending_aliases=True,
                )
            except BaseException:
                if target_fd is not None:
                    os.close(target_fd)
                if claimed_identity is not None:
                    try:
                        observed = os.lstat(path)
                        if (observed.st_dev, observed.st_ino) == claimed_identity:
                            _require_scheduled_topology(mutation_path=path)
                            os.unlink(path)
                    except OSError:
                        pass
                raise
        _fsync_directory(directory)
    finally:
        try:
            _require_scheduled_topology(mutation_path=tmp)
            os.unlink(tmp)
        except OSError:
            pass


def _resume_exact_immutable_prefix(path: str, data: bytes, *, label: str = "immutable") -> None:
    """Complete one uniquely proven immutable prefix without unlinking it.

    The caller must first prove that the path has exactly one lawful full byte
    sequence (a linked successor fixes marker bytes; a content-addressed name
    fixes blob bytes). Writing the same suffix in place is safe even if another
    conforming writer is merely slow rather than dead. This helper never
    removes, truncates, renames, or replaces the existing inode.
    """
    _require_scheduled_topology(mutation_path=path)
    before = os.lstat(path)
    if (not stat.S_ISREG(before.st_mode) or stat.S_ISLNK(before.st_mode)
            or before.st_nlink != 1):
        raise RuntimeError(f"{label} prefix is not a regular file at {path}")
    flags = os.O_RDWR | getattr(os, "O_NOFOLLOW", 0)
    fd = os.open(path, flags)
    try:
        opened = os.fstat(fd)
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino) or opened.st_nlink != 1:
            raise RuntimeError(f"{label} prefix changed before recovery at {path}")

        size = opened.st_size
        observed = b""
        while len(observed) < size:
            chunk = os.pread(fd, size - len(observed), len(observed))
            if not chunk:
                break
            observed += chunk
        if observed == data:
            pass
        elif len(observed) < len(data) and data.startswith(observed):
            offset = len(observed)
            while offset < len(data):
                _require_scheduled_topology(mutation_path=path)
                written = os.pwrite(fd, data[offset:], offset)
                if written <= 0:
                    raise OSError(f"{label} prefix recovery made no write progress")
                offset += written
            os.fsync(fd)
        else:
            raise RuntimeError(f"{label} prefix differs at {path}")

        final_size = os.fstat(fd).st_size
        final = b""
        while len(final) < final_size:
            chunk = os.pread(fd, final_size - len(final), len(final))
            if not chunk:
                break
            final += chunk
        if final != data:
            raise RuntimeError(f"{label} prefix did not seal exact bytes at {path}")
        after = os.lstat(path)
        after_open = os.fstat(fd)
        if ((after.st_dev, after.st_ino) != (opened.st_dev, opened.st_ino)
                or (after_open.st_dev, after_open.st_ino) != (opened.st_dev, opened.st_ino)
                or after.st_nlink != 1 or after_open.st_nlink != 1):
            raise RuntimeError(f"{label} path changed during recovery at {path}")
    finally:
        os.close(fd)
    directory = os.path.dirname(path) or "."
    try:
        dfd = os.open(directory, os.O_RDONLY)
        try:
            os.fsync(dfd)
        finally:
            os.close(dfd)
    except OSError:
        pass


def _legacy_path(man: dict, data_root: str, subject: str, as_of: str) -> str:
    rel = man["output_path"].replace("<SUBJECT>", subject).replace("<as_of>", as_of)
    if rel.startswith("data/"):
        rel = rel[5:]
    root = os.path.realpath(os.path.abspath(data_root))
    path = os.path.abspath(os.path.join(root, rel))
    if no_symlink_path(root, path) is None:
        raise RuntimeError("legacy output path escapes data root or contains a symlinked component")
    return path


def _read_regular_nofollow_bytes_once(path: str) -> bytes:
    """One pinned attempt at reading a stable regular inode without following aliases.

    st_ctime_ns is deliberately NOT part of the identity compared across the read: connector
    storage sits under the Drive-synced ``data/`` tree, where the sync client writes xattrs that
    bump ctime without changing a byte (see the stable-read note in scripts/connector_contract.py).
    A ctime-only delta is re-verified by digest instead — strictly stronger than trusting the
    timestamp. A genuine CONTENT change mid-read is still rejected outright and never re-read.
    """
    before = os.lstat(path)
    if (stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode)
            or before.st_nlink != 1):
        raise RuntimeError(f"expected a regular non-symlink file at {path}")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(fd)
        identity = _content_identity(opened)
        ctime_before = opened.st_ctime_ns
        if opened.st_nlink != 1:
            raise RuntimeError(f"expected a unique regular non-symlink file at {path}")
        if identity != _content_identity(before):
            # The pin was lost BETWEEN lstat and open — Drive replacing the file by unlink+rename
            # during a re-sync. Nothing was read, so re-pinning from scratch is safe; surface it as
            # the transient it is rather than aborting the whole connector run.
            raise OSError(errno.ESTALE, f"file changed before read at {path}")
        chunks: list[bytes] = []
        remaining = opened.st_size
        while remaining:
            chunk = os.read(fd, min(remaining, 1024 * 1024))
            if not chunk:
                raise RuntimeError(f"file truncated during read at {path}")
            chunks.append(chunk)
            remaining -= len(chunk)
        if os.read(fd, 1):
            raise RuntimeError(f"file grew during read at {path}")
        after_open = os.fstat(fd)
        after = os.lstat(path)
        if identity != _content_identity(after_open) or identity != _content_identity(after):
            raise RuntimeError(f"file changed during read at {path}")
        raw = b"".join(chunks)
        if ctime_before != after_open.st_ctime_ns or ctime_before != after.st_ctime_ns:
            # metadata-only touch (xattr / chmod / cloud-sync): prove the bytes, don't trust the clock
            if not _reread_digest_matches(fd, opened.st_size, hashlib.sha256(raw).hexdigest()):
                raise RuntimeError(f"file changed during read at {path}")
        return raw
    finally:
        os.close(fd)


def _read_regular_nofollow_bytes(path: str) -> bytes:
    """Read one stable regular inode, riding out transient cloud-filesystem errors.

    Drive hydrating a dehydrated (cloud-only) file raises ETIMEDOUT — "[Errno 60] Operation timed
    out" — on a file that is otherwise perfectly readable, so a transient OSError is retried instead
    of aborting the connector run. Every non-transient outcome keeps the original contract.
    """
    for attempt in range(_STABLE_READ_ATTEMPTS):
        try:
            return _read_regular_nofollow_bytes_once(path)
        except OSError as exc:
            if exc.errno not in _TRANSIENT_READ_ERRNOS or attempt + 1 >= _STABLE_READ_ATTEMPTS:
                raise
        _stable_read_backoff(attempt)
    raise RuntimeError(f"could not read a stable inode at {path}")  # unreachable; keeps mypy honest


def _payload_from_current(data_root: str, current: dict):
    rel = current.get("blob_path")
    expected = current.get("content_sha256")
    if not isinstance(rel, str) or not isinstance(expected, str):
        raise RuntimeError("current pointer lacks blob_path/content_sha256")
    root = os.path.realpath(os.path.abspath(data_root))
    path = os.path.abspath(os.path.join(root, rel))
    if no_symlink_path(root, path) is None:
        raise RuntimeError("current blob path escapes data root or contains a symlinked component")
    if os.path.basename(path) != f"{expected}.json":
        raise RuntimeError("current blob path does not match content_sha256")
    payload_bytes = _read_regular_nofollow_bytes(path)
    if hashlib.sha256(payload_bytes).hexdigest() != expected:
        raise RuntimeError("current blob hash mismatch")
    try:
        payload = json.loads(payload_bytes.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise RuntimeError("current blob is not valid JSON") from exc
    if canonical_json_bytes(payload) != payload_bytes:
        raise RuntimeError("current blob is not canonical JSON")
    if current.get("manifest_version") == 2 and (not isinstance(payload, dict) or payload.get("as_of") != current.get("as_of")):
        raise RuntimeError("current payload identity does not match as_of")
    if current.get("manifest_version") == 2 and isinstance(current.get("series"), str) and payload.get("series") != current["series"]:
        raise RuntimeError("current payload identity does not match series")
    return payload


def _stable_identity_conflict(data_root: str, man: dict, subject: str) -> str | None:
    """Prove connector-id identity across every sealed subject coverage row.

    Subject coverage may expand only while retaining every subject that this
    connector id has already sealed.  Replacing or dropping an old subject, or
    changing the dataset/series under any subject, requires a new connector id.
    """
    root = os.path.realpath(os.path.abspath(data_root))
    new = (man["dataset_id"], man["series_id"])
    declared_subjects = man.get("subjects")
    if (not isinstance(declared_subjects, list) or not declared_subjects
            or not all(isinstance(value, str) and value for value in declared_subjects)
            or subject not in declared_subjects):
        return "cannot prove stable connector identity from malformed subject coverage"
    declared = set(declared_subjects)

    def compare(record: dict, label: str) -> str | None:
        if record.get("connector_id") != man["id"]:
            return None
        old_subject = record.get("subject")
        old = (record.get("dataset_id"), record.get("series_id"))
        if (not isinstance(old_subject, str) or not old_subject
                or not all(isinstance(value, str) and value for value in old)):
            return f"cannot prove stable connector identity from malformed {label}"
        if old != new:
            return (f"stable connector identity changed from {old[0]}/{old[1]} to "
                    f"{new[0]}/{new[1]}; use a new connector id")
        if old_subject not in declared:
            return (f"stable connector subject coverage dropped {old_subject}; retain every sealed "
                    "subject or use a new connector id")
        return None

    def raise_walk_error(exc: OSError) -> None:
        raise exc

    def identity_walk(path: str):
        if not os.path.lexists(path):
            return ()
        return os.walk(path, followlinks=False, onerror=raise_walk_error)

    current_root = os.path.join(root, "_connectors", "current")
    try:
        for directory, dirs, files in identity_walk(current_root):
            if any(os.path.islink(os.path.join(directory, name)) for name in dirs):
                return "cannot prove stable connector identity through a symlinked current directory"
            dirs[:] = [name for name in dirs if not os.path.islink(os.path.join(directory, name))]
            for name in files:
                if name.endswith(".tmp"):
                    continue
                if not name.endswith(".json"):
                    return "cannot prove stable connector identity from an unexpected current record"
                candidate = os.path.join(directory, name)
                rel_parts = os.path.relpath(candidate, current_root).split(os.sep)
                if os.path.islink(candidate) or len(rel_parts) != 3:
                    return "cannot prove stable connector identity from a malformed current pointer"
                try:
                    prior = _read_json(candidate)
                except (OSError, json.JSONDecodeError):
                    return "cannot prove stable connector identity from an unreadable current pointer"
                path_subject = os.path.splitext(rel_parts[2])[0]
                if (not isinstance(prior, dict) or prior.get("dataset_id") != rel_parts[0]
                        or prior.get("series_id") != rel_parts[1]
                        or prior.get("subject") != path_subject):
                    return "cannot prove stable connector identity from a malformed current pointer"
                conflict = compare(prior, "current pointer")
                if conflict:
                    return conflict
    except OSError as exc:
        return f"cannot scan canonical current identities: {exc}"

    marker_root = os.path.join(root, "_connectors", "committed_heads")
    try:
        for directory, dirs, files in identity_walk(marker_root):
            if any(os.path.islink(os.path.join(directory, name)) for name in dirs):
                return "cannot prove stable connector identity through a symlinked marker directory"
            dirs[:] = [name for name in dirs if not os.path.islink(os.path.join(directory, name))]
            rel_parts = os.path.relpath(directory, marker_root).split(os.sep)
            if not files:
                continue
            if len(rel_parts) != 3:
                return "cannot prove stable connector identity from a malformed marker location"
            for name in files:
                if name.endswith(".tmp"):
                    continue
                if not name.endswith(".json"):
                    return "cannot prove stable connector identity from an unexpected marker record"
                candidate = os.path.join(directory, name)
                if os.path.islink(candidate) or not re.fullmatch(r"\d{20}\.json", name):
                    return "cannot prove stable connector identity from a malformed marker record"
                try:
                    marker = _read_json(candidate)
                except (OSError, json.JSONDecodeError):
                    return "cannot prove stable connector identity from an unreadable marker record"
                if (not isinstance(marker, dict) or marker.get("commit_protocol_version") != 1
                        or marker.get("dataset_id") != rel_parts[0]
                        or marker.get("series_id") != rel_parts[1]
                        or marker.get("subject") != rel_parts[2]
                        or not isinstance(marker.get("connector_id"), str)):
                    return "cannot prove stable connector identity from a malformed marker record"
                conflict = compare(marker, "commit marker")
                if conflict:
                    return conflict
    except OSError as exc:
        return f"cannot scan sealed connector identities: {exc}"

    vintage_root = os.path.join(root, "_connectors", "vintages")
    try:
        for directory, dirs, files in identity_walk(vintage_root):
            if any(os.path.islink(os.path.join(directory, name)) for name in dirs):
                return "cannot prove stable connector identity through a symlinked vintage directory"
            dirs[:] = [name for name in dirs if not os.path.islink(os.path.join(directory, name))]
            if not files:
                continue
            for name in files:
                if name.endswith(".tmp"):
                    continue
                candidate = os.path.join(directory, name)
                rel_parts = os.path.relpath(candidate, vintage_root).split(os.sep)
                if (os.path.islink(candidate) or len(rel_parts) != 4
                        or not re.fullmatch(r"\d{8}T\d{12}Z_[0-9a-f]{64}\.json", name)):
                    return "cannot prove stable connector identity from a malformed canonical vintage"
                if canonical_json_object_strict_prefix(candidate, allow_empty=True):
                    continue
                try:
                    vintage = _read_json(candidate)
                except (OSError, json.JSONDecodeError):
                    if canonical_json_object_strict_prefix(candidate, allow_empty=True):
                        continue
                    return "cannot prove stable connector identity from an unreadable canonical vintage"
                if (not isinstance(vintage, dict) or vintage.get("dataset_id") != rel_parts[0]
                        or vintage.get("series_id") != rel_parts[1]
                        or vintage.get("subject") != rel_parts[2]
                        or not isinstance(vintage.get("connector_id"), str)
                        or not isinstance(vintage.get("content_sha256"), str)
                        or not name.endswith(f"_{vintage.get('content_sha256')}.json")):
                    return "cannot prove stable connector identity from a malformed canonical vintage"
                conflict = compare(vintage, "canonical vintage")
                if conflict:
                    return conflict
    except OSError as exc:
        return f"cannot scan canonical vintage identities: {exc}"

    receipt_root = os.path.join(root, "_connectors", "commits")
    try:
        for directory, dirs, files in identity_walk(receipt_root):
            if any(os.path.islink(os.path.join(directory, name)) for name in dirs):
                return "cannot prove stable connector identity through a symlinked receipt directory"
            dirs[:] = [name for name in dirs if not os.path.islink(os.path.join(directory, name))]
            if not files:
                continue
            for name in files:
                if name.endswith(".tmp"):
                    continue
                candidate = os.path.join(directory, name)
                rel_parts = os.path.relpath(candidate, receipt_root).split(os.sep)
                if (os.path.islink(candidate) or len(rel_parts) != 4
                        or not re.fullmatch(r"[0-9a-f]{64}\.json", name)):
                    return "cannot prove stable connector identity from a malformed commit receipt"
                if canonical_json_object_strict_prefix(candidate, allow_empty=True):
                    continue
                try:
                    receipt = _read_json(candidate)
                except (OSError, json.JSONDecodeError):
                    if canonical_json_object_strict_prefix(candidate, allow_empty=True):
                        continue
                    return "cannot prove stable connector identity from an unreadable commit receipt"
                if (not isinstance(receipt, dict) or receipt.get("commit_protocol_version") != 1
                        or receipt.get("dataset_id") != rel_parts[0]
                        or receipt.get("series_id") != rel_parts[1]
                        or receipt.get("subject") != rel_parts[2]
                        or not isinstance(receipt.get("connector_id"), str)
                        or not isinstance(receipt.get("vintage_metadata_sha256"), str)
                        or name != f"{receipt.get('vintage_metadata_sha256')}.json"):
                    return "cannot prove stable connector identity from a malformed commit receipt"
                conflict = compare(receipt, "commit receipt")
                if conflict:
                    return conflict
    except OSError as exc:
        return f"cannot scan commit receipt identities: {exc}"
    return None


def _orphaned_history_artifact(data_root: str, man: dict, subject: str) -> str | None:
    """Return the first target-scoped history lane that survives without current."""
    try:
        m = normalise_manifest(man)
        root = os.path.realpath(os.path.abspath(data_root))
        paths = connector_storage_paths(data_root, m, subject)
    except (OSError, ValueError):
        # A denied or structurally unsafe path-resolution walk is evidence we
        # cannot prove the lane is empty. Treat it as an orphan, never as a
        # clean history absence.
        return "canonical history"
    lanes = {
        "canonical vintage": paths["vintages"],
        "commit receipt": os.path.join(
            root, "_connectors", "commits", m["dataset_id"], m["series_id"], subject,
        ),
        "sequence marker": os.path.join(
            root, "_connectors", "committed_heads", m["dataset_id"], m["series_id"], subject,
        ),
    }
    for label, lane in lanes.items():
        if os.path.lexists(lane) and (os.path.islink(lane) or not os.path.isdir(lane)):
            return label
        if not os.path.lexists(lane):
            continue
        try:
            def raise_walk_error(exc: OSError) -> None:
                raise exc
            for directory, dirs, files in os.walk(
                lane, followlinks=False, onerror=raise_walk_error,
            ):
                if any(os.path.islink(os.path.join(directory, name)) for name in dirs):
                    return label
                dirs[:] = [name for name in dirs if not os.path.islink(os.path.join(directory, name))]
                if files:
                    return label
        except OSError:
            return label
    return None


def projection_is_current(man: dict, subject: str, data_root: str, current: dict) -> bool:
    try:
        path = _legacy_path(man, data_root, subject, current["as_of"])
        payload_bytes = _read_regular_nofollow_bytes(path)
        sidecar_bytes = _read_regular_nofollow_bytes(path + ".source.json")
        provenance = current.get("provenance")
        sealed_payload_bytes = canonical_json_bytes(_payload_from_current(data_root, current))
        return (payload_bytes == sealed_payload_bytes
                and hashlib.sha256(payload_bytes).hexdigest() == current["content_sha256"]
                and isinstance(provenance, dict)
                and sidecar_bytes == canonical_json_bytes(provenance))
    except (OSError, RuntimeError, KeyError, TypeError, ValueError, json.JSONDecodeError):
        return False


def verify_current_pointer(
    man: dict, subject: str, data_root: str, current: dict, *, require_live_publisher: bool = True,
) -> dict:
    """Verify current with constant record reads plus immutable-name inventories."""
    m = normalise_manifest(man)
    if not isinstance(current, dict) or any(current.get(key) != value for key, value in {
        "connector_id": m["id"], "dataset_id": m["dataset_id"], "series_id": m["series_id"],
        "subject": subject, "provider": m["provider"],
    }.items()):
        raise RuntimeError("canonical current pointer identity does not match connector coverage")
    if require_live_publisher:
        expected_publisher = publisher_contract_fingerprint()
        if current.get("publisher_contract_fingerprint") != expected_publisher:
            raise RuntimeError("canonical current was published by a different shared publisher contract")
        connector_dir = m.get("_dir")
        if isinstance(connector_dir, str):
            expected_connector = connector_fingerprint(connector_dir)
            if not expected_connector or current.get("connector_fingerprint") != expected_connector:
                raise RuntimeError("canonical current was published by a different connector transform")
    latest_meta = verify_linked_head(data_root, current, m["series_id"], subject)
    if latest_meta is None:
        raise RuntimeError("canonical current pointer has a missing, corrupt, forked, or rolled-back head")
    # Current embeds the complete latest vintage.  Compare every sealed field,
    # including provenance, rather than trusting a caller-controlled blob path.
    if any(current.get(key) != value for key, value in latest_meta.items()):
        raise RuntimeError("canonical current pointer does not match its latest committed vintage")
    _payload_from_current(data_root, current)
    return latest_meta


def _install_pending_current(
    man: dict, subject: str, data_root: str, current: dict | None,
    prior_current_bytes: bytes | None,
) -> dict | None:
    """Finish a fully sealed commit whose atomic pointer swap did not happen."""
    m = normalise_manifest(man)
    candidate = recover_pending_current(
        data_root,
        connector_id=m["id"], dataset_id=m["dataset_id"], series_id=m["series_id"],
        subject=subject, provider=m["provider"], current=current,
    )
    if candidate is None:
        return None
    marker_path = _commit_marker_path(data_root, candidate)
    if not os.path.lexists(marker_path):
        # The recovery helper admitted exactly one fully linked successor and
        # audited the accepted prefix. Claim its marker, then reconstruct once
        # more through the ordinary marker-aware path before advancing current.
        expected = 1 if current is None else int(current.get("committed_count", 0)) + 1
        if candidate.get("committed_count") != expected:
            raise RuntimeError("pending commit is not the immediate linked successor")
        _write_commit_marker(data_root, candidate)
    else:
        expected_marker = canonical_json_bytes(_commit_marker_record(candidate))
        try:
            observed_marker = _read_regular_nofollow_bytes(marker_path)
        except (OSError, RuntimeError) as exc:
            raise RuntimeError(f"marker prefix is unreadable at {marker_path}: {exc}") from exc
        if observed_marker != expected_marker:
            _resume_exact_immutable_prefix(marker_path, expected_marker, label="marker")

    # Reconstruct once more after creating or completing the sequence marker. This
    # rechecks its receipt, marker, payload, lane inventories, and full chain
    # before the mutable current projection advances.
    candidate = recover_pending_current(
        data_root,
        connector_id=m["id"], dataset_id=m["dataset_id"], series_id=m["series_id"],
        subject=subject, provider=m["provider"], current=current,
    )
    if candidate is None:
        raise RuntimeError("pending marker claim did not reconstruct the sealed commit")
    # The recovery helper audits the full immutable chain.  Re-run the normal
    # O(1) pointer and blob checks before making it canonical.
    verify_current_pointer(m, subject, data_root, candidate, require_live_publisher=False)
    current_path = connector_storage_paths(data_root, m, subject)["current"]
    if prior_current_bytes is None:
        if os.path.lexists(current_path):
            raise RuntimeError("canonical current changed during pending-commit recovery")
    else:
        try:
            observed_prior = _read_regular_nofollow_bytes(current_path)
        except (OSError, RuntimeError) as exc:
            raise RuntimeError(f"canonical current disappeared during pending-commit recovery: {exc}") from exc
        if observed_prior != prior_current_bytes:
            raise RuntimeError("canonical current changed during pending-commit recovery")
    # Recheck the immutable boundary immediately before the pointer advance.
    verify_current_pointer(m, subject, data_root, candidate, require_live_publisher=False)
    _atomic_write(current_path, canonical_json_bytes(candidate))
    verify_current_pointer(m, subject, data_root, candidate, require_live_publisher=False)
    return candidate


def _commit_receipt_path(data_root: str, current: dict, metadata_hash: str | None = None) -> str:
    head = current.get("committed_head")
    metadata_hash = metadata_hash or (head.get("metadata_sha256") if isinstance(head, dict) else None)
    if not isinstance(metadata_hash, str) or not re.fullmatch(r"[0-9a-f]{64}", metadata_hash):
        raise RuntimeError("canonical current lacks a valid vintage metadata hash")
    root = os.path.realpath(os.path.abspath(data_root))
    path = os.path.abspath(os.path.join(
        root, "_connectors", "commits", str(current.get("dataset_id")), str(current.get("series_id")),
        str(current.get("subject")), f"{metadata_hash}.json",
    ))
    if no_symlink_path(root, path) is None:
        raise RuntimeError("commit receipt path escapes data root or contains a symlinked component")
    return path


def _write_commit_receipt(data_root: str, current: dict, prior_head: dict | None) -> str:
    """Write one immutable prior-head link before the atomic pointer swap."""
    head = current.get("committed_head")
    if (not isinstance(head, dict) or head.get("sequence") != current.get("committed_count")
            or not isinstance(head.get("metadata_sha256"), str)):
        raise RuntimeError("cannot seal malformed linked commit head")
    metadata_hash = head["metadata_sha256"]
    path = _commit_receipt_path(data_root, current, metadata_hash)
    receipt = {
        "commit_protocol_version": 1,
        "connector_id": current["connector_id"], "dataset_id": current["dataset_id"],
        "series_id": current["series_id"], "subject": current["subject"],
        "sequence": head["sequence"], "vintage_path": head["path"],
        "vintage_id": current["vintage_id"],
        "vintage_metadata_sha256": metadata_hash,
        "content_sha256": current["content_sha256"], "retrieved_at": current["retrieved_at"],
        "prior_head": prior_head, "chain_sha256": head["chain_sha256"],
    }
    _write_once(path, canonical_json_bytes(receipt))
    return os.path.relpath(path, os.path.realpath(os.path.abspath(data_root)))


def _commit_marker_path(data_root: str, current: dict) -> str:
    head = current.get("committed_head")
    sequence = head.get("sequence") if isinstance(head, dict) else None
    if not isinstance(sequence, int) or isinstance(sequence, bool) or sequence < 1:
        raise RuntimeError("canonical current lacks a valid commit sequence")
    root = os.path.realpath(os.path.abspath(data_root))
    path = os.path.abspath(os.path.join(
        root, "_connectors", "committed_heads", str(current.get("dataset_id")),
        str(current.get("series_id")), str(current.get("subject")), f"{sequence:020d}.json",
    ))
    if no_symlink_path(root, path) is None:
        raise RuntimeError("commit marker path escapes data root or contains a symlinked component")
    return path


def _write_commit_marker(data_root: str, current: dict) -> str:
    """Claim one immutable sequence before the atomic current-pointer swap."""
    path = _commit_marker_path(data_root, current)
    _write_once(path, canonical_json_bytes(_commit_marker_record(current)))
    return os.path.relpath(path, os.path.realpath(os.path.abspath(data_root)))


def _commit_marker_record(current: dict) -> dict:
    head = current.get("committed_head")
    if not isinstance(head, dict):
        raise RuntimeError("canonical current lacks a valid committed head")
    return {
        "commit_protocol_version": 1,
        "connector_id": current["connector_id"], "dataset_id": current["dataset_id"],
        "series_id": current["series_id"], "subject": current["subject"],
        "committed_head": head,
    }


def materialize_projection(man: dict, subject: str, data_root: str, current: dict) -> None:
    """Regenerate the legacy pool projection from committed canonical bytes."""
    verify_current_pointer(man, subject, data_root, current)
    payload = _payload_from_current(data_root, current)
    provenance = current.get("provenance")
    if not isinstance(provenance, dict):
        raise RuntimeError("current pointer lacks provenance")
    path = _legacy_path(man, data_root, subject, current["as_of"])
    _atomic_write(path + ".source.json", canonical_json_bytes(provenance))
    _atomic_write(path, canonical_json_bytes(payload))


def publish_validated(
    man: dict, subject: str, data_root: str, fetched: dict, retrieved_at: datetime,
    *, connector_hash: str = "", publisher_hash: str = "", commit: str | None = None,
):
    """Publish one validated pull and return its outcome + immutable metadata."""
    m = normalise_manifest(man)
    publisher_hash = publisher_hash or publisher_contract_fingerprint()
    if m.get("manifest_version") == 2:
        if (not isinstance(connector_hash, str) or not re.fullmatch(r"[0-9a-f]{64}", connector_hash)
                or not isinstance(publisher_hash, str) or not re.fullmatch(r"[0-9a-f]{64}", publisher_hash)
                or not isinstance(commit, str) or not commit):
            raise RuntimeError("v2 publication requires connector, publisher, and deployed-commit identity")
    payload = fetched["payload"]
    if m.get("manifest_version") == 2:
        try:
            canonical_json_bytes(fetched.get("sidecar"))
        except (TypeError, ValueError) as exc:
            raise RuntimeError(f"staged sidecar is outside the canonical JSON domain: {exc}") from exc
        reserved_sidecar_fields = publisher_owned_sidecar_fields(fetched.get("sidecar"))
        if reserved_sidecar_fields:
            raise RuntimeError(
                "staged sidecar contains publisher-owned fields: "
                + ", ".join(reserved_sidecar_fields)
            )
    manual_input = fetched.get("manual_input")
    is_attested_manual = m.get("manifest_version") == 2 and m.get("acquisition") == "manual"
    if is_attested_manual:
        if m.get("manual") is not True or not _valid_manual_input(manual_input):
            raise RuntimeError("manual publication requires runner-attested source bytes")
    elif m.get("manifest_version") == 2 and manual_input is not None:
        raise RuntimeError("automatic publication cannot carry manual source attestation")
    payload_bytes = canonical_json_bytes(payload)
    digest = hashlib.sha256(payload_bytes).hexdigest()
    retrieved_at = retrieved_at.astimezone(timezone.utc)
    retrieved_iso = retrieved_at.isoformat(timespec="microseconds").replace("+00:00", "Z")
    paths = connector_storage_paths(data_root, m, subject)
    storage_root = os.path.realpath(os.path.abspath(data_root))
    canonical_lanes = [
        paths["blobs"], paths["vintages"], paths["current"],
        os.path.join(storage_root, "_connectors", "commits", m["dataset_id"], m["series_id"], subject),
        os.path.join(storage_root, "_connectors", "committed_heads", m["dataset_id"], m["series_id"], subject),
    ]
    if any(no_symlink_path(storage_root, lane) is None for lane in canonical_lanes):
        raise RuntimeError("canonical connector lane contains a symlinked or escaping component")
    # Resolve the declared projection before any canonical write so a symlinked
    # legacy parent cannot leave partial canonical artifacts behind.
    legacy_path = _legacy_path(m, data_root, subject, fetched["as_of"])

    prior = None
    prior_meta: dict | None = None
    prior_current_bytes: bytes | None = None
    identity_conflict = _stable_identity_conflict(data_root, m, subject)
    if identity_conflict:
        raise RuntimeError(identity_conflict)
    if os.path.lexists(paths["current"]):
        try:
            prior_current_bytes = _read_regular_nofollow_bytes(paths["current"])
            prior = json.loads(prior_current_bytes)
        except (OSError, RuntimeError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"canonical current pointer is unreadable; refusing to reset history: {exc}") from exc
        if canonical_json_bytes(prior) != prior_current_bytes:
            raise RuntimeError("canonical current pointer bytes are not canonical")
        prior_meta = verify_current_pointer(m, subject, data_root, prior, require_live_publisher=False)
        prior_schema_version = prior.get("schema_version")
        if isinstance(prior_schema_version, int) and m["schema_version"] < prior_schema_version:
            raise RuntimeError("schema_version cannot decrease below the prior accepted contract")
        contract_fields = ("output_schema", "units", "minimum_history")
        if all(field in prior for field in contract_fields):
            contract_changed = any(
                canonical_json_bytes(prior[field]) != canonical_json_bytes(m[field])
                for field in contract_fields
            )
            if contract_changed and (not isinstance(prior_schema_version, int)
                                     or m["schema_version"] <= prior_schema_version):
                raise RuntimeError("validation contract changed without a higher schema_version")
    else:
        orphaned_lane = _orphaned_history_artifact(data_root, m, subject)
        safe_vintage_only_crash = (
            orphaned_lane == "canonical vintage"
            and unclaimed_first_vintages_are_safe(
                data_root,
                connector_id=m["id"], dataset_id=m["dataset_id"],
                series_id=m["series_id"], subject=subject, provider=m["provider"],
            )
        )
        if orphaned_lane and not safe_vintage_only_crash:
            raise RuntimeError(
                f"{orphaned_lane} exists without a provable canonical current pointer; refusing to reset history"
            )

    blob_path = os.path.join(paths["blobs"], digest[:2], f"{digest}.json")
    if no_symlink_path(storage_root, blob_path) is None:
        raise RuntimeError("canonical blob path contains a symlinked or escaping component")
    if os.path.lexists(blob_path):
        try:
            with open(blob_path, "rb") as existing_blob:
                existing_blob_bytes = existing_blob.read()
        except OSError as exc:
            raise RuntimeError(f"canonical blob is unreadable at {blob_path}: {exc}") from exc
        if existing_blob_bytes != payload_bytes:
            # The filename is the SHA-256 of the complete expected bytes, so a
            # strict prefix can have only one lawful completion.
            if hashlib.sha256(payload_bytes).hexdigest() != os.path.splitext(os.path.basename(blob_path))[0]:
                raise RuntimeError("canonical blob path does not bind the expected bytes")
            _resume_exact_immutable_prefix(blob_path, payload_bytes, label="blob")
    _write_once(blob_path, payload_bytes)
    same_as_of = [prior_meta] if isinstance(prior_meta, dict) and prior_meta.get("as_of") == fetched["as_of"] else []
    if isinstance(prior, dict) and fetched["as_of"] < str(prior.get("as_of", "")):
        raise RuntimeError("provider as_of regressed behind the committed current release")
    if isinstance(prior, dict) and prior.get("content_sha256") == digest:
        outcome = "unchanged"
    elif same_as_of:
        if m["release"]["revision_policy"] == "append_only":
            raise RuntimeError("append-only series changed content for an existing as_of")
        outcome = "revised"
    else:
        outcome = "published"
    revision_of = same_as_of[-1].get("vintage_id") if outcome == "revised" and same_as_of else None

    provenance = {
        **(fetched.get("sidecar") or {}),
        "provider": m["provider"], "provider_priority": m["provider_priority"],
        "fallback_for": m.get("fallback_for"), "acquisition": m["acquisition"],
        "authority_class": m["authority_class"],
        "source_type": m["source_type"], "tier": m["tier"], "license": m["license"],
        "licensing": m["licensing"],
        "connector_id": m["id"], "dataset_id": m["dataset_id"], "series_id": m["series_id"],
        "series": m["series"],
        "subject": subject, "as_of": fetched["as_of"], "retrieved_at": retrieved_iso,
        "content_sha256": digest,
        "revision_of": revision_of,
        "connector_fingerprint": connector_hash or None,
        "publisher_contract_fingerprint": publisher_hash or None,
        "connector_commit": commit,
        "manifest_version": m["manifest_version"], "schema_version": m["schema_version"],
    }
    if is_attested_manual:
        provenance["acquired_via"] = "manual_local_file"
        provenance["manual_input"] = dict(manual_input)
    source_url = provenance.get("source_url") or payload.get("source_url")
    if not source_url and isinstance(provenance.get("source_urls"), list) and provenance["source_urls"]:
        source_url = provenance["source_urls"][0]
    published_at = provenance.get("published_at") or provenance.get("published")
    history_kind = "true_point_in_time" if isinstance(prior, dict) else "first_observed_vintage"
    if prior_meta:
        prior_retrieved = datetime.fromisoformat(str(prior_meta["retrieved_at"]).replace("Z", "+00:00"))
        if retrieved_at <= prior_retrieved:
            raise RuntimeError("retrieval timestamps must increase monotonically")
    stamp = retrieved_at.strftime("%Y%m%dT%H%M%S%fZ")
    vintage_path = os.path.join(paths["vintages"], f"{stamp}_{digest}.json")
    if no_symlink_path(storage_root, vintage_path) is None:
        raise RuntimeError("canonical vintage path contains a symlinked or escaping component")
    vintage = {
        "manifest_version": m["manifest_version"], "schema_version": m["schema_version"],
        "connector_id": m["id"], "dataset_id": m["dataset_id"], "series_id": m["series_id"],
        "series": m["series"],
        "subject": subject, "provider": m["provider"], "authority_class": m["authority_class"],
        "provider_priority": m["provider_priority"], "fallback_for": m.get("fallback_for"),
        "acquisition": m["acquisition"], "source_type": m["source_type"], "tier": m["tier"],
        "license": m["license"], "licensing": m["licensing"], "release": m["release"],
        "output_schema": m["output_schema"], "units": m["units"],
        "minimum_history": m["minimum_history"],
        "as_of": fetched["as_of"],
        "retrieved_at": retrieved_iso, "content_sha256": digest,
        "connector_fingerprint": connector_hash or None,
        "publisher_contract_fingerprint": publisher_hash or None, "connector_commit": commit,
        "source_url": source_url, "published_at": published_at, "history_kind": history_kind,
        "blob_path": os.path.relpath(blob_path, storage_root),
        "legacy_path": os.path.relpath(legacy_path, storage_root),
        "revision_of": revision_of,
        "provenance": provenance,
    }
    if is_attested_manual:
        vintage["manual_input"] = dict(manual_input)
    vintage_id = compute_vintage_id(vintage)
    vintage["vintage_id"] = vintage_id
    provenance["vintage_id"] = vintage_id
    vintage_bytes = canonical_json_bytes(vintage)
    _write_once(vintage_path, vintage_bytes)

    vintage_rel = os.path.relpath(vintage_path, storage_root)
    prior_head = prior.get("committed_head") if isinstance(prior, dict) else None
    prior_count = prior.get("committed_count") if isinstance(prior, dict) else 0
    if isinstance(prior, dict) and (not isinstance(prior_count, int) or prior_count < 1 or not isinstance(prior_head, dict)):
        raise RuntimeError("prior canonical current lacks a valid linked commit head")
    sequence = prior_count + 1
    head = make_linked_head(sequence, vintage_rel, hashlib.sha256(vintage_bytes).hexdigest(), prior_head)
    current = {
        **vintage, "committed_count": sequence, "committed_head": head,
        "commit_protocol_version": 1,
    }
    current["commit_receipt_path"] = os.path.relpath(
        _commit_receipt_path(data_root, current), os.path.realpath(os.path.abspath(data_root)),
    )
    # Seal the link, then claim this sequence via an immutable cross-host CAS
    # marker before advancing current. A marker-without-current crash fails
    # closed until the next sweep validates the full chain and completes this
    # exact pointer advance; it can never be mistaken for a different commit.
    _write_commit_receipt(data_root, current, prior_head)
    _write_commit_marker(data_root, current)
    if prior_current_bytes is None:
        if os.path.lexists(paths["current"]):
            raise RuntimeError("canonical current changed during first-publish CAS")
    else:
        try:
            observed_prior = _read_regular_nofollow_bytes(paths["current"])
        except (OSError, RuntimeError) as exc:
            raise RuntimeError(f"canonical current disappeared during publish CAS: {exc}") from exc
        if observed_prior != prior_current_bytes:
            raise RuntimeError("canonical current changed during publish CAS")
    # The atomic pointer advance follows the successful immutable CAS claim.
    # Legacy pool files remain a recoverable post-commit projection.
    _atomic_write(paths["current"], canonical_json_bytes(current))
    try:
        materialize_projection(m, subject, data_root, current)
        projection_error = None
    except Exception as exc:
        projection_error = redact_credentials(str(exc), m)[:1200]
    return outcome, current, projection_error


def _append_ledger(data_root: str, row: dict) -> None:
    """Append through pinned directory/file descriptors without following links."""
    _require_scheduled_topology(data_root=data_root)
    root = os.path.realpath(os.path.abspath(data_root))
    payload = (json.dumps(
        {**row, "ts": row.get("ts", int(time.time()))},
        ensure_ascii=False, allow_nan=False,
    ) + "\n").encode("utf-8")
    root_fd: int | None = None
    directory_fd: int | None = None
    ledger_fd: int | None = None
    try:
        root_info = os.lstat(root)
        if not stat.S_ISDIR(root_info.st_mode) or stat.S_ISLNK(root_info.st_mode):
            raise RuntimeError("connector data root is not a real directory")
        root_fd = os.open(
            root, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0),
        )
        opened_root = os.fstat(root_fd)
        if (opened_root.st_dev, opened_root.st_ino) != (root_info.st_dev, root_info.st_ino):
            raise RuntimeError("connector data root changed before ledger append")
        try:
            _require_scheduled_topology(data_root=data_root)
            os.mkdir(LEDGER_DIR, mode=0o700, dir_fd=root_fd)
        except FileExistsError:
            pass
        directory_info = os.stat(LEDGER_DIR, dir_fd=root_fd, follow_symlinks=False)
        if stat.S_ISLNK(directory_info.st_mode) or not stat.S_ISDIR(directory_info.st_mode):
            raise RuntimeError("connector ledger lane is not a real directory")
        directory_fd = os.open(
            LEDGER_DIR,
            os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0),
            dir_fd=root_fd,
        )
        opened_directory = os.fstat(directory_fd)
        if ((opened_directory.st_dev, opened_directory.st_ino)
                != (directory_info.st_dev, directory_info.st_ino)):
            raise RuntimeError("connector ledger lane changed before append")
        _require_scheduled_topology(data_root=data_root)
        ledger_fd = os.open(
            LEDGER_NAME,
            os.O_WRONLY | os.O_APPEND | os.O_CREAT | getattr(os, "O_NOFOLLOW", 0),
            0o600,
            dir_fd=directory_fd,
        )
        opened_ledger = os.fstat(ledger_fd)
        path_ledger = os.stat(LEDGER_NAME, dir_fd=directory_fd, follow_symlinks=False)
        if (not stat.S_ISREG(opened_ledger.st_mode)
                or opened_ledger.st_nlink != 1
                or (opened_ledger.st_dev, opened_ledger.st_ino)
                != (path_ledger.st_dev, path_ledger.st_ino)):
            raise RuntimeError("connector run ledger is not a unique regular non-symlink file")
        view = memoryview(payload)
        _require_scheduled_topology(data_root=data_root)
        while view:
            _require_scheduled_topology(data_root=data_root)
            written = os.write(ledger_fd, view)
            if written <= 0:
                raise RuntimeError("short connector ledger append")
            view = view[written:]
        os.fsync(ledger_fd)
    except (OSError, TypeError, ValueError) as exc:
        raise RuntimeError(f"cannot append connector run ledger safely: {exc}") from exc
    finally:
        for descriptor in (ledger_fd, directory_fd, root_fd):
            if descriptor is not None:
                os.close(descriptor)


def _retrieval_completed_at(now: datetime, supplied_now: bool, connectors_root: str) -> datetime:
    """Only fixture registries may inject retrieval time; production knowledge is wall-clock stamped."""
    if supplied_now and os.path.abspath(connectors_root) != os.path.abspath(CONNECTORS_ROOT):
        return now.astimezone(timezone.utc)
    return datetime.now(timezone.utc)


def _post_acquisition_code_gate(
    cdir: str,
    connectors_root: str,
    *,
    expected_connector_fingerprint: str,
    expected_publisher_fingerprint: str,
    expected_commit: str | None,
) -> tuple[bool, str]:
    """Re-attest the exact executable identity after acquisition returns."""
    observed_connector = connector_fingerprint(cdir)
    code_ok, code_error, observed_publisher = production_code_state(cdir, connectors_root)
    observed_commit = deployed_commit()
    if not code_ok:
        return False, f"post-acquisition code state is not reproducible: {code_error}"
    changed = []
    if observed_connector != expected_connector_fingerprint:
        changed.append("connector fingerprint")
    if observed_publisher != expected_publisher_fingerprint:
        changed.append("publisher-contract fingerprint")
    if observed_commit != expected_commit:
        changed.append("deployed commit")
    if changed:
        return False, "code identity changed during acquisition: " + ", ".join(changed)
    return True, ""


def _point_in_time_disagreement(
    data_root: str, man: dict, subject: str, cutoff: datetime | None = None,
) -> dict | None:
    result = read_point_in_time(data_root, man["series_id"], subject, cutoff)
    if isinstance(result, dict) and result.get("usable") is False:
        disagreement = result.get("disagreement")
        return disagreement if isinstance(disagreement, dict) else {"kind": "provider_disagreement"}
    return None


# ---------- singleton lock (held kernel flock on owner-only local storage) ----------

def acquire_lock(lock_dir: str | None = None) -> int | None:
    """Acquire the local sweep lease and return its held file descriptor.

    A pathname PID/O_EXCL lock can wedge forever after PID reuse and can be
    pre-seeded through a symlink in global /tmp. This lease lives beside the
    owner-only connector config, rejects aliases/foreign files, and is owned by
    the open file description: a crash releases it in the kernel without PID
    probing, unlinking, or a reclaim race.
    """
    directory = os.path.abspath(os.path.expanduser(
        lock_dir or os.environ.get("NOSTRA_ENGINE_CONFIG_DIR", "~/.config/nostra-engine")
    ))
    fd: int | None = None
    try:
        if os.path.lexists(directory):
            directory_info = os.lstat(directory)
            if (stat.S_ISLNK(directory_info.st_mode) or not stat.S_ISDIR(directory_info.st_mode)
                    or directory_info.st_uid != os.getuid()):
                return None
        else:
            os.makedirs(directory, mode=0o700)
            directory_info = os.lstat(directory)
        if stat.S_IMODE(directory_info.st_mode) & 0o077:
            os.chmod(directory, 0o700)
            directory_info = os.lstat(directory)
        if (stat.S_ISLNK(directory_info.st_mode) or not stat.S_ISDIR(directory_info.st_mode)
                or directory_info.st_uid != os.getuid()
                or stat.S_IMODE(directory_info.st_mode) != 0o700):
            return None

        lock_path = os.path.join(directory, "run-connectors.flock")
        flags = os.O_RDWR | os.O_CREAT | getattr(os, "O_NOFOLLOW", 0)
        fd = os.open(lock_path, flags, 0o600)
        opened = os.fstat(fd)
        path_info = os.lstat(lock_path)
        if (not stat.S_ISREG(opened.st_mode) or opened.st_uid != os.getuid()
                or opened.st_nlink != 1 or stat.S_IMODE(opened.st_mode) & 0o077
                or stat.S_ISLNK(path_info.st_mode)
                or (path_info.st_dev, path_info.st_ino) != (opened.st_dev, opened.st_ino)):
            os.close(fd)
            return None
        fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        return fd
    except (OSError, ValueError):
        if fd is not None:
            try:
                os.close(fd)
            except OSError:
                pass
        return None  # fail CLOSED: concurrent current-history writers can lose committed vintages


# ---------- sweep ----------


def _report_sweep_progress(progress_callback, row: dict | None, skipped_count: int) -> None:
    if progress_callback is None:
        return
    try:
        progress_callback(row, skipped_count)
    except Exception:
        # The callback is reserved for observability. A broken status sink may
        # not suppress a ledger row or interrupt canonical publication.
        _status_warning()


def run(data_root: str, only: str | None = None, force: bool = False, dry_run: bool = False,
        subject_filter: str | None = None,
        connectors_root: str = CONNECTORS_ROOT, now: datetime | None = None,
        progress_callback=None):
    if subject_filter is not None:
        subject_filter = subject_filter.upper()
        if re.fullmatch(r"[A-Z0-9][A-Z0-9._-]*", subject_filter) is None or ".." in subject_filter:
            raise ValueError("subject_filter must be an uppercase-safe subject identifier")
    valid, skipped = discover(connectors_root)
    for name, reason in skipped:
        _log(f"skip manifest {name}: {reason}")
    _report_sweep_progress(progress_callback, None, len(skipped))
    supplied_now = now is not None
    now = now or datetime.now(timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    # Retired v1 unit fixtures used the host's local calendar date. Production
    # discovery rejects them; the branch remains only for explicit test mode.
    host_today = now.date() if supplied_now else date.today()
    rows = []
    commit = deployed_commit()
    attempt_history, prior_health_rows, ledger_integrity_warning = _read_attempt_history(data_root)
    if ledger_integrity_warning:
        _log(f"WARNING: {ledger_integrity_warning}")
    for cdir, man in valid:
        if only and man["id"] != only:
            continue
        # The filename-age SLA branch is historical test compatibility only.
        # Production v2 uses its frozen cadence + lag + grace release window.
        sla = (float(man.get("staleness_sla_days"))
               if man.get("manifest_version") != 2 else None)
        transform_hash = connector_fingerprint(cdir)
        code_ok, code_error, publisher_hash = production_code_state(cdir, connectors_root)
        for subject in man["subjects"]:
            if subject_filter is not None and subject != subject_filter:
                continue
            today = (now.astimezone(ZoneInfo(man["release"]["timezone"])).date()
                     if man.get("manifest_version") == 2 else host_today)
            latest = latest_as_of(man, data_root, subject)
            age = (today - latest).days if latest else None
            row = {"connector": man["id"], "dataset_id": man["dataset_id"], "series_id": man["series_id"],
                   "provider": man["provider"], "subject": subject,
                   "connector_fingerprint": transform_hash, "connector_commit": commit,
                   "publisher_contract_fingerprint": publisher_hash or None,
                   "latest_as_of": latest.isoformat() if latest else None,
                   "attempts": 0, "exit_code": None, "message": "", "outcome": "pending", "failure_kind": None,
                   "sweep_started_at": now.astimezone(timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z"),
                   "ts": int(now.timestamp())}
            if ledger_integrity_warning:
                row["ledger_integrity_warning"] = ledger_integrity_warning
            if not os.path.isdir(os.path.join(data_root, subject)):
                row["decision"] = "skipped_no_pool"
                row["outcome"] = "no_pool"
            elif man.get("manifest_version") == 2 and not code_ok:
                row.update({
                    "decision": "failed", "outcome": "quarantined", "failure_kind": "unreproducible_code",
                    "message": code_error,
                })
            elif man.get("manifest_version") == 2:
                current = None
                current_error = None
                current_bytes = None
                pending_candidate = None
                recovered_pending = False
                current_path = connector_storage_paths(data_root, man, subject)["current"]
                try:
                    current_bytes = _read_regular_nofollow_bytes(current_path)
                    current = json.loads(current_bytes)
                    verify_current_pointer(man, subject, data_root, current, require_live_publisher=False)
                except FileNotFoundError:
                    current = None
                except (OSError, TypeError, KeyError, json.JSONDecodeError, RuntimeError) as exc:
                    current_error = redact_credentials(str(exc), man)[:1200]
                # A sequence marker is the immutable commit claim.  If the
                # process died after that claim but before the pointer swap,
                # finish exactly that already-sealed commit on the next sweep.
                # Dry runs report the repair but never mutate the pool.
                # A missing first pointer and a valid prior pointer are the
                # only recoverable crash shapes.  Never treat unreadable bytes
                # as "no current" and rebuild history around them.
                recoverable_pointer_shape = (
                    isinstance(current, dict)
                    or (current is None and current_bytes is None and current_error is None)
                )
                if recoverable_pointer_shape:
                    try:
                        pending_candidate = recover_pending_current(
                            data_root,
                            connector_id=man["id"], dataset_id=man["dataset_id"],
                            series_id=man["series_id"], subject=subject, provider=man["provider"],
                            current=current,
                        )
                        if pending_candidate is not None and not dry_run:
                            current = _install_pending_current(
                                man, subject, data_root, current, current_bytes,
                            )
                            current_error = None
                            recovered_pending = True
                        elif pending_candidate is not None:
                            # The full sealed-successor audit explains the
                            # expected rollback error without mutating a dry
                            # run.  Report the pending recovery/refresh plan.
                            current_error = None
                    except (OSError, TypeError, KeyError, json.JSONDecodeError, RuntimeError) as exc:
                        current_error = redact_credentials(str(exc), man)[:1200]
                effective_current = (
                    pending_candidate if dry_run and isinstance(pending_candidate, dict) else current
                )
                if isinstance(effective_current, dict) and current_error is None:
                    current = effective_current
                    try:
                        latest = datetime.strptime(str(current.get("as_of")), "%Y-%m-%d").date()
                    except (TypeError, ValueError):
                        latest = None
                    age = (today - latest).days if latest else None
                    row["latest_as_of"] = latest.isoformat() if latest else None
                    row.update({
                        "content_sha256": current.get("content_sha256"),
                        "vintage_id": current.get("vintage_id"),
                        "vintage_path": (current.get("committed_head") or {}).get("path"),
                        "retrieved_at": current.get("retrieved_at"),
                        # A no-fetch health row attests to the canonical
                        # vintage, not merely to whatever unrelated repo HEAD
                        # happens to be deployed for this sweep.
                        "connector_fingerprint": current.get("connector_fingerprint"),
                        "publisher_contract_fingerprint": current.get("publisher_contract_fingerprint"),
                        "connector_commit": current.get("connector_commit"),
                    })
                needs_projection = isinstance(current, dict) and not projection_is_current(man, subject, data_root, current)
                disagreement = _point_in_time_disagreement(data_root, man, subject, now) if isinstance(current, dict) else None
                transform_changed = isinstance(current, dict) and (
                    current.get("connector_fingerprint") != transform_hash
                    or current.get("publisher_contract_fingerprint") != publisher_hash
                )
                due, within_grace = release_is_due(
                    man, now, latest, current.get("retrieved_at") if isinstance(current, dict) else None,
                ) if latest is not None else (True, False)
                refresh_required = force or due or transform_changed or not isinstance(current, dict)
                ledger_key = _ledger_key(row)
                interval = due_attempt_interval(man)
                last_attempt = attempt_history.get(ledger_key) if ledger_key is not None else None
                retry_at = last_attempt + interval if last_attempt is not None and interval is not None else None
                throttle_due_attempt = (
                    due and refresh_required and man.get("manual") is not True
                    and not force and not transform_changed and isinstance(current, dict)
                    and current_error is None and last_attempt is not None and retry_at is not None
                    and last_attempt <= now.astimezone(timezone.utc) < retry_at
                )
                if current_error:
                    row.update({"decision": "failed", "outcome": "quarantined", "failure_kind": "current_integrity",
                                "message": current_error})
                elif man.get("manual") is True and transform_changed:
                    row.update({
                        "decision": "failed", "outcome": "quarantined",
                        "failure_kind": "manual_reingest_required",
                        "message": "manual connector code/contract changed; re-ingest through the runner before use",
                    })
                elif pending_candidate is not None and dry_run:
                    decision = (
                        "would_recover_then_refetch"
                        if refresh_required and man.get("manual") is not True
                        else "would_recover_commit"
                    )
                    row["decision"], row["outcome"] = decision, "pending"
                elif throttle_due_attempt:
                    _deferred_attempt_row(
                        row,
                        prior_health_rows.get(ledger_key) if ledger_key is not None else None,
                        retry_at, within_grace=within_grace, dry_run=dry_run,
                    )
                elif refresh_required and man.get("manual") is True:
                    row["decision"], row["outcome"] = "skipped_manual", "manual"
                elif refresh_required and dry_run:
                    row["decision"], row["outcome"] = "would_refetch", "pending"
                elif refresh_required:
                    # Fall through to acquisition.  A recovered but expired
                    # commit is never called current merely because its legacy
                    # projection was absent.
                    pass
                elif disagreement:
                    row.update({
                        "decision": "failed", "outcome": "suspect", "failure_kind": "provider_disagreement",
                        "message": json.dumps(disagreement, ensure_ascii=False, sort_keys=True)[:1200],
                    })
                elif recovered_pending:
                    try:
                        materialize_projection(man, subject, data_root, current)
                        row["decision"], row["outcome"] = "recovered_commit", "current"
                        row["content_sha256"] = current["content_sha256"]
                    except Exception as exc:
                        row.update({"decision": "failed", "outcome": "quarantined", "failure_kind": "projection_error",
                                    "message": redact_credentials(str(exc), man)[:1200]})
                elif needs_projection:
                    try:
                        materialize_projection(man, subject, data_root, current)
                        row["decision"], row["outcome"] = "reprojected", "current"
                        row["content_sha256"] = current["content_sha256"]
                    except Exception as exc:
                        row.update({"decision": "failed", "outcome": "quarantined", "failure_kind": "projection_error",
                                    "message": redact_credentials(str(exc), man)[:1200]})
                elif isinstance(current, dict):
                    row["decision"], row["outcome"] = "fresh", "current"
                if "decision" in row:
                    rows.append(row)
                    _report_sweep_progress(progress_callback, row, len(skipped))
                    age_s = f"{age}d" if age is not None else "—"
                    _log(f"{man['id']} × {subject}: latest {row['latest_as_of'] or '—'} (age {age_s}) → {row['decision']}")
                    if not dry_run:
                        _append_ledger(data_root, row)
                    continue
                # No decision means stale/forced v2 data must use the normal fetch path.
                fetched = run_fetch_staged(cdir, man, subject, data_root)
                ok, attempts, exit_code, message = fetched["ok"], fetched["attempts"], fetched["exit_code"], fetched["message"]
                failure_kind = None if ok else fetched["outcome"]
                publication_outcome = None
                publish_meta = None
                projection_error = None
                completed_at = _retrieval_completed_at(now, supplied_now, connectors_root)
                if ok:
                    post_code_ok, post_code_error = _post_acquisition_code_gate(
                        cdir, connectors_root,
                        expected_connector_fingerprint=transform_hash,
                        expected_publisher_fingerprint=publisher_hash,
                        expected_commit=commit,
                    )
                    if not post_code_ok:
                        ok, failure_kind, message = False, "unreproducible_code", post_code_error
                if ok:
                    try:
                        publication_outcome, publish_meta, projection_error = publish_validated(
                            man, subject, data_root, fetched, completed_at,
                            connector_hash=transform_hash, publisher_hash=publisher_hash, commit=commit,
                        )
                        if projection_error:
                            ok, failure_kind, message = False, "projection_error", projection_error
                        elif (disagreement := _point_in_time_disagreement(data_root, man, subject, completed_at)):
                            ok, failure_kind = False, "provider_disagreement"
                            message = json.dumps(disagreement, ensure_ascii=False, sort_keys=True)[:1200]
                    except Exception as exc:
                        ok, failure_kind, message = False, "publish_error", redact_credentials(str(exc), man)[:1200]
                shutil.rmtree(fetched.get("stage_root") or "", ignore_errors=True)
                refreshed = latest_as_of(man, data_root, subject)
                refreshed_age = (today - refreshed).days if refreshed else None
                if ok:
                    _due, inside_grace = release_is_due(
                        man, completed_at, refreshed, publish_meta.get("retrieved_at") if publish_meta else None,
                    ) if refreshed is not None else (True, False)
                    public_outcome = ("no_new_release" if publication_outcome == "unchanged" else "current") if inside_grace else "stalled"
                elif failure_kind == "projection_error":
                    public_outcome = "quarantined"
                elif failure_kind == "credentials_missing": public_outcome = "credentials_missing"
                elif failure_kind == "no_output": public_outcome = "stalled"
                elif failure_kind in ("invalid_json", "schema_error", "invalid_provenance", "staging_contract"): public_outcome = "schema_failed"
                elif failure_kind in ("quality_suspect", "provider_disagreement"): public_outcome = "suspect"
                elif failure_kind in ("publish_error", "unreproducible_code"): public_outcome = "quarantined"
                else: public_outcome = "stalled"
                row.update({"decision": "refetched" if ok else "failed", "attempts": attempts, "exit_code": exit_code,
                            "message": message, "outcome": public_outcome, "failure_kind": failure_kind,
                            "publication_outcome": publication_outcome,
                            "checked_at": completed_at.astimezone(timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z"),
                            "ts": int(completed_at.timestamp()),
                            "latest_as_of": refreshed.isoformat() if refreshed else row["latest_as_of"]})
                if publish_meta:
                    # Rebind the CODE identity too. The no-fetch branch above deliberately overwrites this
                    # row with the canonical vintage's fingerprints/commit, which is right for a row that
                    # attests to existing evidence — but this row published new evidence, so it must claim
                    # the code that produced it. Leaving the old identity makes healthyBuiltBySatisfies
                    # reject the new current until a later `fresh` sweep, and hides the only real post-merge
                    # refetch from repair verification, which resolves deployment via connector_commit.
                    row.update({"content_sha256": publish_meta["content_sha256"], "vintage_id": publish_meta["vintage_id"],
                                "vintage_path": publish_meta["committed_head"]["path"],
                                "retrieved_at": publish_meta["retrieved_at"],
                                "connector_fingerprint": publish_meta.get("connector_fingerprint"),
                                "publisher_contract_fingerprint": publish_meta.get("publisher_contract_fingerprint"),
                                "connector_commit": publish_meta.get("connector_commit")})
            elif latest and sla is not None and age <= sla and not force:
                row["decision"] = "fresh"
                row["outcome"] = "current"
            elif man.get("manual") is True:
                row["decision"] = "skipped_manual"   # auto-fetch disabled: a hand-staged --from-file refreshes it
                row["outcome"] = "manual"
            elif dry_run:
                row["decision"] = "would_refetch"
                row["outcome"] = "dry_run"
            else:
                fetched = run_fetch_staged(cdir, man, subject, data_root)
                ok, attempts, exit_code, message = fetched["ok"], fetched["attempts"], fetched["exit_code"], fetched["message"]
                failure_kind = None if ok else fetched["outcome"]
                publication_outcome = None
                publish_meta = None
                projection_error = None
                completed_at = _retrieval_completed_at(now, supplied_now, connectors_root)
                if ok:
                    post_code_ok, post_code_error = _post_acquisition_code_gate(
                        cdir, connectors_root,
                        expected_connector_fingerprint=transform_hash,
                        expected_publisher_fingerprint=publisher_hash,
                        expected_commit=commit,
                    )
                    if not post_code_ok:
                        ok, failure_kind, message = False, "unreproducible_code", post_code_error
                if ok:
                    try:
                        publication_outcome, publish_meta, projection_error = publish_validated(
                            man, subject, data_root, fetched, completed_at,
                            connector_hash=transform_hash, publisher_hash=publisher_hash, commit=commit,
                        )
                        if projection_error:
                            ok, failure_kind, message = False, "projection_error", projection_error
                        elif (disagreement := _point_in_time_disagreement(data_root, man, subject, completed_at)):
                            ok, failure_kind = False, "provider_disagreement"
                            message = json.dumps(disagreement, ensure_ascii=False, sort_keys=True)[:1200]
                    except Exception as exc:
                        ok, failure_kind, message = False, "publish_error", redact_credentials(str(exc), man)[:1200]
                shutil.rmtree(fetched.get("stage_root") or "", ignore_errors=True)
                refreshed = latest_as_of(man, data_root, subject)
                refreshed_age = (today - refreshed).days if refreshed else None
                if ok:
                    _due, inside_grace = release_is_due(
                        man, completed_at, refreshed, publish_meta.get("retrieved_at") if publish_meta else None,
                    ) if refreshed is not None else (True, False)
                    public_outcome = ("no_new_release" if publication_outcome == "unchanged" else "current") if inside_grace else "stalled"
                elif failure_kind == "projection_error":
                    public_outcome = "quarantined"
                elif failure_kind == "credentials_missing":
                    public_outcome = "credentials_missing"
                elif failure_kind == "no_output":
                    public_outcome = "stalled"
                elif failure_kind in ("invalid_json", "schema_error", "invalid_provenance", "staging_contract"):
                    public_outcome = "schema_failed"
                elif failure_kind in ("quality_suspect", "provider_disagreement"):
                    public_outcome = "suspect"
                elif failure_kind in ("publish_error", "unreproducible_code"):
                    public_outcome = "quarantined"
                else:
                    public_outcome = "stalled"
                row.update({"decision": "refetched" if ok else "failed", "attempts": attempts,
                            "exit_code": exit_code, "message": message,
                            "outcome": public_outcome, "failure_kind": failure_kind,
                            "publication_outcome": publication_outcome,
                            "checked_at": completed_at.astimezone(timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z"),
                            "ts": int(completed_at.timestamp()),
                            "latest_as_of": refreshed.isoformat() if refreshed else row["latest_as_of"]})
                if publish_meta:
                    # Rebind the CODE identity too. The no-fetch branch above deliberately overwrites this
                    # row with the canonical vintage's fingerprints/commit, which is right for a row that
                    # attests to existing evidence — but this row published new evidence, so it must claim
                    # the code that produced it. Leaving the old identity makes healthyBuiltBySatisfies
                    # reject the new current until a later `fresh` sweep, and hides the only real post-merge
                    # refetch from repair verification, which resolves deployment via connector_commit.
                    row.update({"content_sha256": publish_meta["content_sha256"], "vintage_id": publish_meta["vintage_id"],
                                "vintage_path": publish_meta["committed_head"]["path"],
                                "retrieved_at": publish_meta["retrieved_at"],
                                "connector_fingerprint": publish_meta.get("connector_fingerprint"),
                                "publisher_contract_fingerprint": publish_meta.get("publisher_contract_fingerprint"),
                                "connector_commit": publish_meta.get("connector_commit")})
            rows.append(row)
            _report_sweep_progress(progress_callback, row, len(skipped))
            age_s = f"{age}d" if age is not None else "—"
            _log(f"{man['id']} × {subject}: latest {row['latest_as_of'] or '—'} (age {age_s}) "
                 f"→ {row['decision']}" + (f" [{row['message']}]" if row["decision"] == "failed" else ""))
            if not dry_run:
                _append_ledger(data_root, row)
    return {"rows": rows, "skipped_manifests": skipped}


def run_manual_ingest(
    data_root: str, connector_id: str, subject: str, source_file: str,
    *, connectors_root: str = CONNECTORS_ROOT, now: datetime | None = None,
) -> dict:
    """Seal one operator-supplied file through the same v2 staging/validation/commit path."""
    valid, skipped = discover(connectors_root)
    match = next(((cdir, man) for cdir, man in valid if man["id"] == connector_id), None)
    if match is None:
        raise ValueError(f"manual connector {connector_id!r} is not a valid discovered manifest")
    cdir, man = match
    if man.get("manifest_version") != 2 or man.get("manual") is not True:
        raise ValueError(f"connector {connector_id!r} is not a v2 manual connector")
    if subject not in man["subjects"]:
        raise ValueError(f"subject {subject!r} is outside connector coverage")
    if not os.path.isdir(os.path.join(os.path.abspath(data_root), subject)):
        raise ValueError(f"subject pool {subject!r} does not exist")
    source_abs = os.path.abspath(source_file)
    if not os.path.isfile(source_abs):
        raise ValueError(f"manual source file does not exist: {source_abs}")

    supplied_now = now is not None
    decision_now = now or datetime.now(timezone.utc)
    if decision_now.tzinfo is None:
        decision_now = decision_now.replace(tzinfo=timezone.utc)
    transform_hash = connector_fingerprint(cdir)
    code_ok, code_error, publisher_hash = production_code_state(cdir, connectors_root)
    commit = deployed_commit()
    row = {
        "connector": man["id"], "dataset_id": man["dataset_id"], "series_id": man["series_id"],
        "provider": man["provider"], "subject": subject, "connector_fingerprint": transform_hash,
        "publisher_contract_fingerprint": publisher_hash or None,
        "connector_commit": commit, "latest_as_of": None, "attempts": 0, "exit_code": None,
        "message": "", "outcome": "pending", "failure_kind": None,
        "sweep_started_at": decision_now.astimezone(timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z"),
        "ts": int(decision_now.timestamp()),
    }
    if not code_ok:
        completed_at = _retrieval_completed_at(decision_now, supplied_now, connectors_root)
        row["ts"] = int(completed_at.timestamp())
        row.update({
            "decision": "failed", "outcome": "quarantined", "failure_kind": "unreproducible_code",
            "message": code_error, "checked_at": completed_at.astimezone(timezone.utc).isoformat(
                timespec="microseconds",
            ).replace("+00:00", "Z"),
        })
        _append_ledger(data_root, row)
        return {"rows": [row], "skipped_manifests": skipped}
    try:
        snapshot_root, snapshot_path, manual_input = _snapshot_and_attest_manual_source(
            source_abs, subject,
        )
    except (OSError, RuntimeError, ValueError) as exc:
        completed_at = _retrieval_completed_at(decision_now, supplied_now, connectors_root)
        row["ts"] = int(completed_at.timestamp())
        row.update({
            "decision": "failed", "outcome": "quarantined",
            "failure_kind": "invalid_provenance",
            "message": redact_credentials(str(exc), man)[:1200],
            "checked_at": completed_at.astimezone(timezone.utc).isoformat(
                timespec="microseconds",
            ).replace("+00:00", "Z"),
        })
        _append_ledger(data_root, row)
        return {"rows": [row], "skipped_manifests": skipped}

    try:
        fetched = run_fetch_staged(
            cdir, man, subject, data_root,
            [man["manual_ingest"]["file_arg"], snapshot_path], manual_ingest=True,
        )
        try:
            post_hash, post_size = _hash_file(snapshot_path)
        except OSError as exc:
            post_hash, post_size = "", -1
            mutation_reason = f"manual source snapshot became unreadable after transform: {exc}"
        else:
            mutation_reason = "manual source snapshot changed during transform"
        if post_hash != manual_input["sha256"] or post_size != manual_input["size_bytes"]:
            shutil.rmtree(fetched.get("stage_root") or "", ignore_errors=True)
            fetched = {
                "ok": False, "attempts": fetched.get("attempts", 0),
                "exit_code": fetched.get("exit_code"), "stage_root": None,
                "outcome": "staging_contract", "message": mutation_reason,
            }
        elif fetched.get("ok"):
            # This field is runner-owned. A child cannot forge or replace it.
            fetched["manual_input"] = manual_input
    finally:
        shutil.rmtree(snapshot_root, ignore_errors=True)
    # Retrieval time is the first trusted instant after acquisition returns.
    # Stamping before a slow copy/parser finishes would let an intervening PIT
    # cutoff see bytes that did not exist yet.
    completed_at = _retrieval_completed_at(decision_now, supplied_now, connectors_root)
    row["ts"] = int(completed_at.timestamp())
    ok = fetched["ok"]
    failure_kind = None if ok else fetched["outcome"]
    message = fetched["message"]
    publication_outcome = None
    publish_meta = None
    projection_error = None
    if ok:
        post_code_ok, post_code_error = _post_acquisition_code_gate(
            cdir, connectors_root,
            expected_connector_fingerprint=transform_hash,
            expected_publisher_fingerprint=publisher_hash,
            expected_commit=commit,
        )
        if not post_code_ok:
            ok, failure_kind, message = False, "unreproducible_code", post_code_error
    if ok:
        try:
            publication_outcome, publish_meta, projection_error = publish_validated(
                man, subject, data_root, fetched, completed_at,
                connector_hash=transform_hash, publisher_hash=publisher_hash, commit=commit,
            )
            if projection_error:
                ok, failure_kind, message = False, "projection_error", projection_error
            elif (disagreement := _point_in_time_disagreement(data_root, man, subject, completed_at)):
                ok, failure_kind = False, "provider_disagreement"
                message = json.dumps(disagreement, ensure_ascii=False, sort_keys=True)[:1200]
        except Exception as exc:
            ok, failure_kind, message = False, "publish_error", redact_credentials(str(exc), man)[:1200]
    shutil.rmtree(fetched.get("stage_root") or "", ignore_errors=True)
    refreshed = latest_as_of(man, data_root, subject)
    age = (decision_now.astimezone(ZoneInfo(man["release"]["timezone"])).date() - refreshed).days if refreshed else None
    if ok:
        _due, inside_grace = release_is_due(
            man, completed_at, refreshed, publish_meta.get("retrieved_at") if publish_meta else None,
        ) if refreshed is not None else (True, False)
        public = ("no_new_release" if publication_outcome == "unchanged" else "current") if inside_grace else "stalled"
    elif failure_kind == "projection_error":
        public = "quarantined"
    elif failure_kind == "credentials_missing":
        public = "credentials_missing"
    elif failure_kind in {"invalid_json", "schema_error", "invalid_provenance", "staging_contract"}:
        public = "schema_failed"
    elif failure_kind in {"quality_suspect", "provider_disagreement"}:
        public = "suspect"
    elif failure_kind in {"publish_error", "unreproducible_code"}:
        public = "quarantined"
    else:
        public = "stalled"
    row.update({
        "decision": "manual_ingested" if ok else "failed", "attempts": fetched["attempts"],
        "exit_code": fetched["exit_code"], "message": message, "outcome": public,
        "failure_kind": failure_kind, "publication_outcome": publication_outcome,
        "checked_at": completed_at.astimezone(timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z"),
        "latest_as_of": refreshed.isoformat() if refreshed else None,
    })
    if publish_meta:
        row.update({"content_sha256": publish_meta["content_sha256"], "vintage_id": publish_meta["vintage_id"],
                    "vintage_path": publish_meta["committed_head"]["path"], "retrieved_at": publish_meta["retrieved_at"]})
    _append_ledger(data_root, row)
    return {"rows": [row], "skipped_manifests": skipped}


def _is_full_scheduled_sweep(args: argparse.Namespace) -> bool:
    return (
        not args.dry_run and args.only is None and args.manual_file is None
        and args.subject is None
    )


def _fatal_status_code(exc: BaseException) -> str:
    if isinstance(exc, KeyboardInterrupt):
        return "interrupted"
    if isinstance(exc, SystemExit):
        return "runner_exit"
    return "runner_exception"


def main() -> int:
    global _ACTIVE_SCHEDULED_TOPOLOGY
    ap = argparse.ArgumentParser(description="Release-gated self-heal runner for the connector registry.")
    ap.add_argument("--data-root", default=os.path.join(REPO, "data"), help="pool root (default: <repo>/data)")
    ap.add_argument("--only", help="run a single connector id")
    ap.add_argument("--force", action="store_true", help="ignore the release gate (still respects the pool gate)")
    ap.add_argument("--dry-run", action="store_true", help="print the freshness/decision table; execute nothing")
    ap.add_argument("--manual-file", help="operator-supplied source file; requires --only and --subject")
    ap.add_argument("--subject", help="limit an interactive sweep to one subject; required by --manual-file")
    a = ap.parse_args()
    if a.manual_file and (not a.only or not a.subject or a.dry_run):
        ap.error("--manual-file requires --only <manual-connector> and --subject, and cannot be dry-run")

    scheduled_full_sweep = _is_full_scheduled_sweep(a)
    topology: ScheduledTopologyLease | None = None
    lock = None
    if scheduled_full_sweep:
        # Global order: the process already holds the repository-mutation
        # lease from bootstrap; scheduled work takes autonomy before the
        # runner-local singleton. Installer/failover use deploy -> repo
        # mutation -> autonomy, so no participant inverts the shared suffix.
        topology = acquire_scheduled_topology_lease(a.data_root)
        if topology is None:
            _log("scheduled writer topology is not authoritative — skipping this sweep")
            return 0
    if not a.dry_run:
        lock = acquire_lock()
        if lock is None:
            scoped = a.subject is not None or a.only is not None or a.manual_file is not None
            _log(
                "another runner instance holds the lock — retry this scoped sweep"
                if scoped else "another runner instance holds the lock — skipping this sweep"
            )
            if topology is not None:
                topology.close()
            return SCOPED_LOCK_BUSY_EXIT if scoped else 0
    if topology is not None:
        # Re-attest after the local wait/exclusion point and only then make the
        # guard visible to the first status publication and acquisition.
        if not topology.revalidate():
            topology.close()
            if lock is not None:
                os.close(lock)
            _log("scheduled writer topology is not authoritative — skipping this sweep")
            return 0
        _ACTIVE_SCHEDULED_TOPOLOGY = topology
    status_value = None
    try:
        if scheduled_full_sweep:
            status_value = _new_runner_status()
            write_runner_status(a.data_root, status_value)

        def record_progress(row: dict | None, skipped_count: int) -> None:
            if status_value is None:
                return
            status_value["skipped_manifests"] = skipped_count
            if row is not None:
                status_value["processed_rows"] += 1
                if row.get("decision") == "failed":
                    status_value["failed_rows"] += 1
            status_value["last_progress_at"] = _runner_iso_now()
            write_runner_status(a.data_root, status_value)

        try:
            result = (run_manual_ingest(a.data_root, a.only, a.subject, a.manual_file)
                      if a.manual_file else run(
                          a.data_root, only=a.only, force=a.force, dry_run=a.dry_run,
                          subject_filter=a.subject,
                          progress_callback=record_progress if scheduled_full_sweep else None,
                      ))
        except ScheduledTopologyLost:
            raise
        except BaseException as exc:
            if status_value is not None:
                completed_at = _runner_iso_now()
                status_value.update({
                    "state": "failed",
                    "last_progress_at": completed_at,
                    "sweep_completed_at": completed_at,
                    "error_code": _fatal_status_code(exc),
                })
                write_runner_status(a.data_root, status_value)
            raise

        if status_value is not None:
            completed_at = _runner_iso_now()
            status_value.update({
                "state": "completed",
                "last_progress_at": completed_at,
                "sweep_completed_at": completed_at,
                "processed_rows": len(result["rows"]),
                "failed_rows": sum(1 for row in result["rows"] if row.get("decision") == "failed"),
                "skipped_manifests": len(result["skipped_manifests"]),
                "error_code": None,
            })
            write_runner_status(a.data_root, status_value)
    except ScheduledTopologyLost:
        # Demotion is an asynchronous kill switch, not a connector failure.
        # Leave the last truthful heartbeat in place and publish no synthetic
        # failure row/status after authority is lost.
        _log("scheduled writer authority changed — stopping this sweep")
        return 0
    finally:
        _ACTIVE_SCHEDULED_TOPOLOGY = None
        if lock is not None:
            try:
                os.close(lock)
            except OSError:
                pass
        if topology is not None:
            topology.close()
    failed = sum(1 for r in result["rows"] if r["decision"] == "failed")
    _log(f"sweep done: {len(result['rows'])} decision(s), {failed} failed, "
         f"{len(result['skipped_manifests'])} manifest(s) skipped")
    return 0


if __name__ == "__main__":
    sys.exit(main())
