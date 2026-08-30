#!/usr/bin/env python3
"""Unit test for run_connectors.py — discovery/validation, SLA boundary math, filename-not-mtime as_of,
dry-run inertness, fail-closed retries, --only scoping, pool gate. Tmpdir fixture repo, no network.
Run: python3 test_run_connectors.py
"""
from __future__ import annotations

import importlib.util
import builtins
import hashlib
import json
import os
import plistlib
import py_compile
import shutil
import subprocess
import sys
import tempfile
import zipfile
from datetime import date, datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("run_connectors", os.path.join(HERE, "run_connectors.py"))
m = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(m)
from connector_contract import (  # noqa: E402 — run_connectors adds scripts/ to sys.path
    connector_https_url_host,
    coverage_errors,
    validate_payload,
)
import connector_vintages as cv  # noqa: E402

PRODUCTION_BACKOFF_S = m.BACKOFF_S
PRODUCTION_ATTEMPT_TIMEOUT_S = m.ATTEMPT_TIMEOUT_S
m.BACKOFF_S = (0, 0, 0)          # retries run instantly under test
m.ATTEMPT_TIMEOUT_S = 30
m.ALLOW_LEGACY_CONNECTORS_FOR_TESTS = True  # retired helper coverage; production default is false

failures = 0


def check(name, cond, detail=""):
    global failures
    print(f"  {'ok ' if cond else 'FAIL'} {name}" + (f"  [{detail}]" if detail and not cond else ""))
    if not cond:
        failures += 1


check("production acquisition retries have a bounded one-minute/20-second-delay budget",
      PRODUCTION_BACKOFF_S == (0, 5, 15) and PRODUCTION_ATTEMPT_TIMEOUT_S == 60)

# Full automatic sweeps expose one exact, non-secret service heartbeat. The writer uses the same durable
# atomic primitive as projections but remains best effort: an unavailable/unsafe telemetry lane cannot
# change any connector result.
_status_root = tempfile.mkdtemp(prefix="connector-runner-status-")
_status = m._new_runner_status(
    "2026-08-13T00:00:00.000000Z",
    run_id="0123456789abcdef0123456789abcdef",
    commit="a" * 40,
)
check("runner heartbeat uses the exact schema-versioned service wire",
      set(_status) == m.RUNNER_STATUS_KEYS and m._valid_runner_status(_status)
      and _status["schema_version"] == 2
      and _status["interval_seconds"] == 900 and _status["state"] == "running"
      and _status["run_id"] == "0123456789abcdef0123456789abcdef"
      and _status["deployed_commit"] == "a" * 40)
_bad_status = dict(_status, unexpected="must fail")
check("runner heartbeat rejects extension fields", not m._valid_runner_status(_bad_status))
for _identity_field, _bad_identity in (
    ("run_id", "https://secret.example/run"),
    ("run_id", "A" * 32),
    ("run_id", "a" * 31),
    ("deployed_commit", "A" * 40),
    ("deployed_commit", "a" * 39),
    ("deployed_commit", "https://secret.example/commit"),
):
    _bad_status = dict(_status, **{_identity_field: _bad_identity})
    check(f"runner heartbeat rejects unsafe {_identity_field}",
          not m._valid_runner_status(_bad_status))
_fresh_a = m._new_runner_status(commit="b" * 40)
_fresh_b = m._new_runner_status(commit="b" * 40)
check("each scheduled sweep gets a fresh opaque run identity",
      _fresh_a["run_id"] != _fresh_b["run_id"]
      and m._valid_runner_status(_fresh_a) and m._valid_runner_status(_fresh_b))
_bad_status = dict(_status, processed_rows=0, failed_rows=1)
check("runner heartbeat rejects failed_rows above processed_rows", not m._valid_runner_status(_bad_status))
_bad_status = dict(_status, last_progress_at="2026-08-12T23:59:59.000000Z")
check("runner heartbeat rejects reversed timestamps", not m._valid_runner_status(_bad_status))
_bad_status = dict(_status, last_progress_at="2026-08-13 00:00:00Z")
check("runner heartbeat rejects non-canonical timestamps", not m._valid_runner_status(_bad_status))
for _bad_host in (" mac-pro", "mac-pro ", "mac pro", "mac\tpro", "mac\npro"):
    check("runner heartbeat rejects whitespace-bearing host identity",
          not m._valid_runner_status(dict(_status, host=_bad_host)))
check("runner heartbeat writes atomically into the reserved pool lane",
      m.write_runner_status(_status_root, _status))
_status_path = os.path.join(_status_root, m.LEDGER_DIR, m.RUNNER_STATUS_NAME)
with open(_status_path, encoding="utf-8") as _status_fh:
    _status_disk = json.load(_status_fh)
check("runner heartbeat round-trips without secret or diagnostic fields", _status_disk == _status)
_status_outside = tempfile.mkdtemp(prefix="connector-runner-status-outside-")
shutil.rmtree(os.path.join(_status_root, m.LEDGER_DIR))
os.symlink(_status_outside, os.path.join(_status_root, m.LEDGER_DIR))
check("runner heartbeat refuses a symlinked telemetry lane without blocking the caller",
      m.write_runner_status(_status_root, _status) is False
      and not os.path.exists(os.path.join(_status_outside, m.RUNNER_STATUS_NAME)))
shutil.rmtree(_status_root)
shutil.rmtree(_status_outside)


def _exercise_main_status(argv, fake_run, fake_manual=None, captured=None, status_writer=None):
    captured = [] if captured is None else captured
    old_argv = sys.argv
    old_run = m.run
    old_manual = m.run_manual_ingest
    old_lock = m.acquire_lock
    old_topology = m.acquire_scheduled_topology_lease
    old_write = m.write_runner_status
    m.run = fake_run
    if fake_manual is not None:
        m.run_manual_ingest = fake_manual
    m.acquire_lock = lambda: os.open(os.devnull, os.O_RDONLY)
    class _PermittedTopology:
        data_link = os.path.abspath(argv[argv.index("--data-root") + 1])
        pool_root = os.path.realpath(data_link)
        def revalidate(self): return True
        def close(self): return None
    m.acquire_scheduled_topology_lease = lambda _root: _PermittedTopology()
    m.write_runner_status = (status_writer or
                             (lambda _root, value: captured.append(json.loads(json.dumps(value))) or True))
    try:
        sys.argv = ["run_connectors.py", *argv]
        return m.main(), captured
    finally:
        sys.argv = old_argv
        m.run = old_run
        m.run_manual_ingest = old_manual
        m.acquire_lock = old_lock
        m.acquire_scheduled_topology_lease = old_topology
        m.write_runner_status = old_write


def _status_fake_run(_root, *, progress_callback=None, **_kwargs):
    rows = [
        {"decision": "fresh"},
        {"decision": "failed"},
    ]
    if progress_callback:
        progress_callback(None, 1)
        for row in rows:
            progress_callback(row, 1)
    return {"rows": rows, "skipped_manifests": [("bad", "invalid")]}


_status_main_root = tempfile.mkdtemp(prefix="connector-runner-main-status-")
_main_rc, _main_statuses = _exercise_main_status(
    ["--data-root", _status_main_root], _status_fake_run,
)
check("full sweep writes running progress and a reconciled completion heartbeat",
      _main_rc == 0 and [value["state"] for value in _main_statuses] == [
          "running", "running", "running", "running", "completed",
      ] and _main_statuses[-1]["processed_rows"] == 2
      and _main_statuses[-1]["failed_rows"] == 1
      and _main_statuses[-1]["skipped_manifests"] == 1
      and len({value["run_id"] for value in _main_statuses}) == 1
      and len({value["deployed_commit"] for value in _main_statuses}) == 1)
for _excluded_args in (
    ["--data-root", _status_main_root, "--dry-run"],
    ["--data-root", _status_main_root, "--only", "one-connector"],
    ["--data-root", _status_main_root, "--subject", "AAA"],
):
    _excluded_rc, _excluded_statuses = _exercise_main_status(_excluded_args, _status_fake_run)
    check(f"{_excluded_args[-1]} invocation does not publish scheduled-service telemetry",
          _excluded_rc == 0 and _excluded_statuses == [])
_manual_rc, _manual_statuses = _exercise_main_status(
    ["--data-root", _status_main_root, "--only", "manual-one", "--subject", "AAA",
     "--manual-file", "/operator/source"],
    _status_fake_run,
    lambda *_args, **_kwargs: {"rows": [{"decision": "manual_ingested"}], "skipped_manifests": []},
)
check("manual ingest does not publish scheduled-service telemetry",
      _manual_rc == 0 and _manual_statuses == [])


def _fatal_status_fake_run(*_args, **_kwargs):
    raise RuntimeError("https://secret.example/?token=should-never-enter-status")


_fatal_statuses = []
try:
    _unused_rc, _fatal_statuses = _exercise_main_status(
        ["--data-root", _status_main_root], _fatal_status_fake_run, captured=_fatal_statuses,
    )
except RuntimeError:
    check("fatal sweep writes a terminal generic heartbeat before propagating",
          [value["state"] for value in _fatal_statuses] == ["running", "failed"]
          and _fatal_statuses[-1]["error_code"] == "runner_exception"
          and "secret" not in json.dumps(_fatal_statuses[-1]))
else:
    check("fatal connector exception still propagates after telemetry", False)
_publication_reached = {"yes": False}


def _publication_status_fake_run(*_args, **_kwargs):
    _publication_reached["yes"] = True
    return {"rows": [{"decision": "fresh"}], "skipped_manifests": []}


_telemetry_failure_rc, _ = _exercise_main_status(
    ["--data-root", _status_main_root], _publication_status_fake_run,
    status_writer=lambda *_args: False,
)
check("telemetry failure cannot block connector work or sweep completion",
      _telemetry_failure_rc == 0 and _publication_reached["yes"])
shutil.rmtree(_status_main_root)


def _topology_fixture():
    root = os.path.realpath(tempfile.mkdtemp(prefix="connector-topology-"))
    home = os.path.join(root, "home")
    ops = os.path.join(home, ".nostra-ops")
    pool = os.path.join(root, "pool")
    repo = os.path.join(root, "repo")
    os.makedirs(ops, mode=0o700)
    os.chmod(ops, 0o700)
    os.makedirs(pool)
    os.makedirs(repo)
    data = os.path.join(repo, "data")
    os.symlink(pool, data)
    with open(os.path.join(ops, "role"), "wb") as fh:
        fh.write(b"doer\n")
    with open(os.path.join(ops, "pool-root"), "wb") as fh:
        fh.write((pool + "\n").encode())
    with open(os.path.join(ops, "connector-writer-host"), "wb") as fh:
        fh.write((__import__("socket").gethostname() + "\n").encode("ascii"))
    os.chmod(os.path.join(ops, "role"), 0o600)
    os.chmod(os.path.join(ops, "pool-root"), 0o600)
    os.chmod(os.path.join(ops, "connector-writer-host"), 0o600)
    return root, home, ops, pool, data


def _acquire_fixture_topology(data, home):
    return m.acquire_scheduled_topology_lease(
        data, home=home, repo_root=os.path.dirname(data),
    )


_topology_root, _topology_home, _topology_ops, _topology_pool, _topology_data = _topology_fixture()
_topology_lease = _acquire_fixture_topology(_topology_data, _topology_home)
check("exact doer + private canonical pool identity + matching data symlink acquires topology",
      _topology_lease is not None and _topology_lease.revalidate())
if _topology_lease is not None:
    try:
        competing = os.open(os.path.join(_topology_ops, "connector-autonomy.lock"), os.O_RDWR)
        try:
            import fcntl as _fcntl
            try:
                _fcntl.flock(competing, _fcntl.LOCK_EX | _fcntl.LOCK_NB)
            except BlockingIOError:
                _lease_retained = True
            else:
                _lease_retained = False
        finally:
            os.close(competing)
    except OSError:
        _lease_retained = False
    check("topology retains the autonomy kernel lease for the sweep", _lease_retained)
    _topology_lease.close()

_alternate_data = os.path.join(os.path.dirname(_topology_data), "alternate-data")
os.symlink(_topology_pool, _alternate_data)
check("an arbitrary pool alias outside lexical REPO/data cannot acquire writer topology",
      m.acquire_scheduled_topology_lease(
          _alternate_data, home=_topology_home,
          repo_root=os.path.dirname(_topology_data),
      ) is None)

for _bad_role, _label in ((b"admin\n", "admin"), (None, "absent"), (b"doer \n", "malformed")):
    _root, _home, _ops, _pool, _data = _topology_fixture()
    _role = os.path.join(_ops, "role")
    if _bad_role is None:
        os.unlink(_role)
    else:
        with open(_role, "wb") as _fh:
            _fh.write(_bad_role)
        os.chmod(_role, 0o600)
    check(f"{_label} durable role cannot acquire scheduled writer topology",
          _acquire_fixture_topology(_data, _home) is None)
    shutil.rmtree(_root)

for _mutate, _label in (
    (lambda ops, pool, data: os.chmod(os.path.join(ops, "role"), 0o644), "public role"),
    (lambda ops, pool, data: os.link(os.path.join(ops, "role"), os.path.join(ops, "role.alias")),
     "hardlinked role"),
    (lambda ops, pool, data: os.chmod(os.path.join(ops, "pool-root"), 0o644),
     "public pool identity"),
    (lambda ops, pool, data: os.link(
        os.path.join(ops, "pool-root"), os.path.join(ops, "pool-root.alias")
    ), "hardlinked pool identity"),
    (lambda ops, pool, data: os.chmod(ops, 0o755), "non-private ops directory"),
    (lambda ops, pool, data: os.chmod(os.path.join(ops, "connector-writer-host"), 0o644),
     "public writer identity"),
    (lambda ops, pool, data: open(
        os.path.join(ops, "connector-writer-host"), "wb"
    ).write(b"different-host\n"), "foreign writer identity"),
):
    _root, _home, _ops, _pool, _data = _topology_fixture()
    _mutate(_ops, _pool, _data)
    check(f"{_label} cannot acquire scheduled writer topology",
          _acquire_fixture_topology(_data, _home) is None)
    shutil.rmtree(_root)

_root, _home, _ops, _pool, _data = _topology_fixture()
_lock = os.path.join(_ops, "connector-autonomy.lock")
_target = os.path.join(_ops, "lock-target")
open(_target, "wb").close(); os.chmod(_target, 0o600); os.symlink(_target, _lock)
check("symlinked autonomy lock cannot acquire scheduled writer topology",
      _acquire_fixture_topology(_data, _home) is None)
shutil.rmtree(_root)

_root, _home, _ops, _pool, _data = _topology_fixture()
_identity = os.path.join(_ops, "pool-root")
_identity_target = os.path.join(_ops, "pool-root-target")
os.rename(_identity, _identity_target); os.symlink(_identity_target, _identity)
check("symlinked pool identity cannot acquire scheduled writer topology",
      _acquire_fixture_topology(_data, _home) is None)
shutil.rmtree(_root)

for _writer_bytes, _label in ((None, "absent writer identity"),
                               (b"bad host\n", "malformed writer identity")):
    _root, _home, _ops, _pool, _data = _topology_fixture()
    _writer = os.path.join(_ops, "connector-writer-host")
    if _writer_bytes is None:
        os.unlink(_writer)
    else:
        with open(_writer, "wb") as _fh:
            _fh.write(_writer_bytes)
        os.chmod(_writer, 0o600)
    check(f"{_label} cannot acquire scheduled writer topology",
          _acquire_fixture_topology(_data, _home) is None)
    shutil.rmtree(_root)

_root, _home, _ops, _pool, _data = _topology_fixture()
_lock = os.path.join(_ops, "connector-autonomy.lock")
open(_lock, "wb").close(); os.chmod(_lock, 0o600)
os.link(_lock, _lock + ".alias")
check("hardlinked autonomy lock cannot acquire scheduled writer topology",
      _acquire_fixture_topology(_data, _home) is None)
shutil.rmtree(_root)

for _shape, _label in (("real", "real-directory data root"), ("broken", "broken data symlink"),
                       ("mismatch", "mismatched data symlink")):
    _root, _home, _ops, _pool, _data = _topology_fixture()
    os.unlink(_data)
    if _shape == "real":
        os.makedirs(_data)
    elif _shape == "broken":
        os.symlink(os.path.join(_root, "missing"), _data)
    else:
        _other = os.path.join(_root, "other"); os.makedirs(_other); os.symlink(_other, _data)
    check(f"{_label} cannot acquire scheduled writer topology",
          _acquire_fixture_topology(_data, _home) is None)
    shutil.rmtree(_root)

_root, _home, _ops, _pool, _data = _topology_fixture()
with open(os.path.join(_ops, "pool-root"), "wb") as _fh:
    _fh.write((os.path.join(_root, ".", "pool") + "\n").encode())
os.chmod(os.path.join(_ops, "pool-root"), 0o600)
check("noncanonical pool identity cannot acquire scheduled writer topology",
      _acquire_fixture_topology(_data, _home) is None)
shutil.rmtree(_root)

_root, _home, _ops, _pool, _data = _topology_fixture()
_lease = _acquire_fixture_topology(_data, _home)
_retired_pool = _pool + ".retired"
os.rename(_pool, _retired_pool); os.makedirs(_pool)
check("an in-place pool target replacement invalidates the retained topology lease",
      _lease is not None and not _lease.revalidate())
if _lease is not None:
    _lease.close()
shutil.rmtree(_root)

_root, _home, _ops, _pool, _data = _topology_fixture()
_pool_info = os.stat(_pool)
_real_realpath = m.os.path.realpath
_swapped = {"yes": False}
def _swap_link_during_resolution(path):
    answer = _real_realpath(path)
    if path == _data and not _swapped["yes"]:
        _swapped["yes"] = True
        os.unlink(_data); os.symlink(_pool, _data)
    return answer
m.os.path.realpath = _swap_link_during_resolution
try:
    _stable_link = m._stable_pool_link(
        _data, _pool, (_pool_info.st_dev, _pool_info.st_ino),
    )
finally:
    m.os.path.realpath = _real_realpath
check("data symlink replacement during resolution is rejected by the second identity read",
      _swapped["yes"] and not _stable_link)
shutil.rmtree(_root)

# Scheduled refusal precedes status, fetch, and ledger. Manual/--only/dry-run
# preserve their operator-scoped behavior and never ask for the topology lease.
_topology_refusal_root = tempfile.mkdtemp(prefix="connector-topology-refusal-")
_old_topology_acquire = m.acquire_scheduled_topology_lease
_old_lock_acquire = m.acquire_lock
_old_write_status = m.write_runner_status
_old_run = m.run
_seen = {"topology": 0, "lock": 0, "status": 0, "run": 0}
m.acquire_scheduled_topology_lease = lambda _root: (_seen.__setitem__("topology", _seen["topology"] + 1), None)[1]
m.acquire_lock = lambda: (_seen.__setitem__("lock", _seen["lock"] + 1), os.open(os.devnull, os.O_RDONLY))[1]
m.write_runner_status = lambda *_args: (_seen.__setitem__("status", _seen["status"] + 1), True)[1]
m.run = lambda *_args, **_kwargs: (_seen.__setitem__("run", _seen["run"] + 1),
                                   {"rows": [], "skipped_manifests": []})[1]
_old_argv = sys.argv
try:
    sys.argv = ["run_connectors.py", "--data-root", _topology_refusal_root]
    _refusal_rc = m.main()
finally:
    sys.argv = _old_argv
    m.acquire_scheduled_topology_lease = _old_topology_acquire
    m.acquire_lock = _old_lock_acquire
    m.write_runner_status = _old_write_status
    m.run = _old_run
check("scheduled topology refusal exits zero before local lock/status/fetch/ledger",
      _refusal_rc == 0 and _seen == {"topology": 1, "lock": 0, "status": 0, "run": 0})
shutil.rmtree(_topology_refusal_root)

for _argv_suffix in (("--dry-run",), ("--only", "one-connector")):
    _old_topology_acquire = m.acquire_scheduled_topology_lease
    _old_lock_acquire = m.acquire_lock
    _old_run = m.run
    _scoped_seen = {"topology": 0, "run": 0}
    m.acquire_scheduled_topology_lease = lambda _root: (
        _scoped_seen.__setitem__("topology", _scoped_seen["topology"] + 1), None
    )[1]
    m.acquire_lock = lambda: os.open(os.devnull, os.O_RDONLY)
    m.run = lambda *_args, **_kwargs: (
        _scoped_seen.__setitem__("run", _scoped_seen["run"] + 1),
        {"rows": [], "skipped_manifests": []},
    )[1]
    _old_argv = sys.argv
    try:
        sys.argv = ["run_connectors.py", "--data-root", tempfile.gettempdir(), *_argv_suffix]
        _scoped_rc = m.main()
    finally:
        sys.argv = _old_argv
        m.acquire_scheduled_topology_lease = _old_topology_acquire
        m.acquire_lock = _old_lock_acquire
        m.run = _old_run
    check(f"{' '.join(_argv_suffix)} remains operator-scoped outside scheduled topology",
          _scoped_rc == 0 and _scoped_seen == {"topology": 0, "run": 1})

# A scoped refresh must never report success when a scheduled sweep owns the
# writer lock: callers would immediately preflight stale or empty evidence.
_old_topology_acquire = m.acquire_scheduled_topology_lease
_old_lock_acquire = m.acquire_lock
_old_run = m.run
_busy_seen = {"topology": 0, "run": 0}
m.acquire_scheduled_topology_lease = lambda _root: (
    _busy_seen.__setitem__("topology", _busy_seen["topology"] + 1), None
)[1]
m.acquire_lock = lambda: None
m.run = lambda *_args, **_kwargs: (
    _busy_seen.__setitem__("run", _busy_seen["run"] + 1),
    {"rows": [], "skipped_manifests": []},
)[1]
_old_argv = sys.argv
try:
    sys.argv = ["run_connectors.py", "--data-root", tempfile.gettempdir(), "--subject", "AAA"]
    _busy_rc = m.main()
finally:
    sys.argv = _old_argv
    m.acquire_scheduled_topology_lease = _old_topology_acquire
    m.acquire_lock = _old_lock_acquire
    m.run = _old_run
check("a lock-busy scoped refresh exits retryably before fetch or preflight",
      _busy_rc == m.SCOPED_LOCK_BUSY_EXIT
      and _busy_seen == {"topology": 0, "run": 0})

# The role is an asynchronous kill switch: a demotion that lands while the
# retained autonomy lease is held is noticed before the next external process
# and before the next pool write. It yields no terminal status or ledger row.
_root, _home, _ops, _pool, _data = _topology_fixture()
_lease = _acquire_fixture_topology(_data, _home)
_old_topology_acquire = m.acquire_scheduled_topology_lease
_old_lock_acquire = m.acquire_lock
_old_write_status = m.write_runner_status
_old_run = m.run
_demotion_seen = {"status": 0, "ledger": 0, "fetch": 0}
m.acquire_scheduled_topology_lease = lambda _root: _lease
m.acquire_lock = lambda: os.open(os.devnull, os.O_RDONLY)
m.write_runner_status = lambda *_args: (_demotion_seen.__setitem__(
    "status", _demotion_seen["status"] + 1
), True)[1]

def _demoting_run(root, **_kwargs):
    with open(os.path.join(_ops, "role"), "wb") as _fh:
        _fh.write(b"admin\n")
    os.chmod(os.path.join(_ops, "role"), 0o600)
    m._require_scheduled_topology(data_root=root)
    _demotion_seen["fetch"] += 1
    m._append_ledger(root, {"decision": "fresh"})
    _demotion_seen["ledger"] += 1
    return {"rows": [], "skipped_manifests": []}

m.run = _demoting_run
_old_argv = sys.argv
try:
    sys.argv = ["run_connectors.py", "--data-root", _data]
    _demotion_rc = m.main()
finally:
    sys.argv = _old_argv
    m.acquire_scheduled_topology_lease = _old_topology_acquire
    m.acquire_lock = _old_lock_acquire
    m.write_runner_status = _old_write_status
    m.run = _old_run
check("mid-sweep demotion aborts before fetch/ledger and writes no terminal heartbeat",
      _demotion_rc == 0 and _demotion_seen == {"status": 1, "ledger": 0, "fetch": 0})
shutil.rmtree(_root)

_root, _home, _ops, _pool, _data = _topology_fixture()
_lease = _acquire_fixture_topology(_data, _home)
_old_active = m._ACTIVE_SCHEDULED_TOPOLOGY
_old_backoff = m.BACKOFF_S
_old_sleep = m.time.sleep
_old_subprocess = m.subprocess.run
_retry_seen = {"process": 0}
m._ACTIVE_SCHEDULED_TOPOLOGY = _lease
m.BACKOFF_S = (1,)
def _demote_during_backoff(_seconds):
    with open(os.path.join(_ops, "role"), "wb") as _fh:
        _fh.write(b"admin\n")
    os.chmod(os.path.join(_ops, "role"), 0o600)
m.time.sleep = _demote_during_backoff
m.subprocess.run = lambda *_args, **_kwargs: _retry_seen.__setitem__("process", 1)
try:
    try:
        m.run_fetch_staged("/unused", {"id": "retry", "entry": "fetch.py"}, "AAA", _data)
    except m.ScheduledTopologyLost:
        _retry_aborted = True
    else:
        _retry_aborted = False
finally:
    m._ACTIVE_SCHEDULED_TOPOLOGY = _old_active
    m.BACKOFF_S = _old_backoff
    m.time.sleep = _old_sleep
    m.subprocess.run = _old_subprocess
    if _lease is not None:
        _lease.close()
check("role flip during retry backoff is re-attested before the external process",
      _retry_aborted and _retry_seen["process"] == 0)
shutil.rmtree(_root)

shutil.rmtree(_topology_root)


def _same_inode_mutation_is_rejected(reader, *, returns_none: bool) -> bool:
    """Mutate a later chunk after the reader has pinned the same inode."""
    root = tempfile.mkdtemp(prefix="connector-stable-read-")
    path = os.path.join(root, "sealed.json")
    with open(path, "wb") as handle:
        handle.write(b"A" * (1024 * 1024) + b"B" * 64)
    real_read = os.read
    calls = 0

    def mutating_read(descriptor, size):
        nonlocal calls
        chunk = real_read(descriptor, size)
        calls += 1
        if calls == 1:
            with open(path, "r+b", buffering=0) as writer:
                writer.seek(-1, os.SEEK_END)
                writer.write(b"C")
                os.fsync(writer.fileno())
        return chunk

    os.read = mutating_read
    try:
        try:
            result = reader(path)
        except RuntimeError:
            return not returns_none
        return returns_none and result is None
    finally:
        os.read = real_read
        shutil.rmtree(root)


check("PIT sealed-object reader rejects a same-inode mid-read mutation",
      _same_inode_mutation_is_rejected(cv._read_regular_nofollow_bytes, returns_none=True))
check("publisher payload reader rejects a same-inode mid-read mutation",
      _same_inode_mutation_is_rejected(m._read_regular_nofollow_bytes, returns_none=False))

# Production Python starts isolated and keeps repo scripts behind the stdlib,
# so an untracked stdlib-named file cannot execute before the git cleanliness
# gate. Exercise a repo-shaped copy rather than poisoning this checkout.
shadow_root = tempfile.mkdtemp(prefix="connector-import-shadow-")
shadow_tools = os.path.join(shadow_root, ".claude", "tools")
shadow_scripts = os.path.join(shadow_root, "scripts")
os.makedirs(shadow_tools)
os.makedirs(shadow_scripts)
shutil.copy2(os.path.join(HERE, "run_connectors.py"), shadow_tools)
for filename in ("connector_contract.py", "connector_vintages.py", "canonical_json.py"):
    shutil.copy2(os.path.join(m.REPO, "scripts", filename), shadow_scripts)
sentinels = []
for poison_path, label in (
    (os.path.join(shadow_tools, "json.py"), "tools-json"),
    (os.path.join(shadow_scripts, "socket.py"), "scripts-socket"),
):
    sentinel = os.path.join(shadow_root, f"{label}.executed")
    sentinels.append(sentinel)
    with open(poison_path, "w", encoding="utf-8") as fh:
        fh.write(f"open({sentinel!r}, 'w').write('executed')\nraise RuntimeError('import shadow executed')\n")
# Build a timestamp/size-valid poisoned cache for a reviewed shared source,
# then restore the clean source bytes and metadata. Without the runner's fresh
# pycache prefix, CPython can accept this ignored cache even under -I.
contract_path = os.path.join(shadow_scripts, "connector_contract.py")
clean_contract = open(contract_path, "rb").read()
contract_stat = os.stat(contract_path)
cache_sentinel = os.path.join(shadow_root, "poisoned-pyc.executed")
poison_head = (
    f"open({cache_sentinel!r}, 'w').write('executed')\n"
    "raise RuntimeError('poisoned connector_contract bytecode executed')\n"
).encode("utf-8")
check("poisoned-cache fixture fits the clean shared source size", len(poison_head) + 2 <= len(clean_contract))
poison_contract = poison_head + b"#" + (b" " * (len(clean_contract) - len(poison_head) - 2)) + b"\n"
with open(contract_path, "wb") as fh:
    fh.write(poison_contract)
os.utime(contract_path, ns=(contract_stat.st_atime_ns, contract_stat.st_mtime_ns))
cache_path = importlib.util.cache_from_source(contract_path)
os.makedirs(os.path.dirname(cache_path), exist_ok=True)
py_compile.compile(contract_path, cfile=cache_path, dfile=contract_path, doraise=True)
with open(contract_path, "wb") as fh:
    fh.write(clean_contract)
os.utime(contract_path, ns=(contract_stat.st_atime_ns, contract_stat.st_mtime_ns))
sentinels.append(cache_sentinel)
isolated_help = subprocess.run(
    [sys.executable, "-I", os.path.join(shadow_tools, "run_connectors.py"), "--help"],
    cwd=shadow_root, capture_output=True, text=True, timeout=30,
)
check("isolated runner bootstrap rejects tool/cwd and scripts stdlib import shadows",
      isolated_help.returncode == 0 and not any(os.path.exists(path) for path in sentinels),
      isolated_help.stderr[-800:])
with open(os.path.join(m.REPO, "scripts", "ops", "com.nostradamus.connectors.plist"), "rb") as fh:
    connector_agent = plistlib.load(fh)
program_arguments = connector_agent.get("ProgramArguments", [])
check("connector LaunchAgent enters Python isolated mode before the runner",
      len(program_arguments) >= 4
      and program_arguments[1:4] == ["python3", "-I", "{{ENGINE_REPO_ROOT}}/.claude/tools/run_connectors.py"])
shutil.rmtree(shadow_root)


STUB_OK = """#!/usr/bin/env python3
import argparse, json, os
from datetime import date
ap = argparse.ArgumentParser()
ap.add_argument("--subject"); ap.add_argument("--data-root")
a = ap.parse_args()
d = os.path.join(a.data_root, a.subject, "external", "stub")
os.makedirs(d, exist_ok=True)
p = os.path.join(d, f"stub_{date.today().isoformat()}.json")
json.dump({"ok": True}, open(p, "w"))
print(f"wrote {p}")
"""
STUB_FAIL = """#!/usr/bin/env python3
import sys
print("deliberate failure — writes nothing", file=sys.stderr)
sys.exit(1)
"""
STUB_NO_OUTPUT = """#!/usr/bin/env python3
import argparse
ap = argparse.ArgumentParser(); ap.add_argument('--subject'); ap.add_argument('--data-root'); ap.parse_args()
raise SystemExit(0)
"""
STUB_V2 = """#!/usr/bin/env python3
import argparse, json, os, time
ap = argparse.ArgumentParser(); ap.add_argument('--subject'); ap.add_argument('--data-root'); a = ap.parse_args()
here = os.path.dirname(os.path.abspath(__file__))
man = json.load(open(os.path.join(here, 'connector.json')))
fixture = json.load(open(os.path.join(here, 'fixture.json')))
time.sleep(float(fixture.pop('_delay_s', 0)))
payload = {'series': man['series'], **fixture}
rel = man['output_path'].replace('<SUBJECT>', a.subject).replace('<as_of>', payload['as_of'])
if rel.startswith('data/'): rel = rel[5:]
p = os.path.join(a.data_root, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
json.dump(payload, open(p, 'w'))
sidecar = {'provider': man['provider'], 'source_type': man['source_type'], 'tier': man['tier'],
           'license': man['license'], 'connector_id': man['id'], 'as_of': payload['as_of'],
           'dataset_id': man['dataset_id'], 'series_id': man['series_id'],
           'schema_version': man['schema_version'],
           'licensing': man['licensing'],
           'source_url': 'https://example.test/source', 'published': payload['as_of']}
json.dump(sidecar, open(p + '.source.json', 'w'))
"""
STUB_MANUAL_V2 = """#!/usr/bin/env python3
import argparse, json, os
ap = argparse.ArgumentParser(); ap.add_argument('--subject'); ap.add_argument('--data-root'); ap.add_argument('--from-file'); a = ap.parse_args()
here = os.path.dirname(os.path.abspath(__file__))
man = json.load(open(os.path.join(here, 'connector.json'))); payload = json.load(open(a.from_file))
payload = {'series': man['series'], **payload}
rel = man['output_path'].replace('<SUBJECT>', a.subject).replace('<as_of>', payload['as_of'])
if rel.startswith('data/'): rel = rel[5:]
p = os.path.join(a.data_root, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
json.dump(payload, open(p, 'w'))
json.dump({'provider': man['provider'], 'source_type': man['source_type'], 'tier': man['tier'],
           'license': man['license'], 'connector_id': man['id'], 'as_of': payload['as_of'],
           'dataset_id': man['dataset_id'], 'series_id': man['series_id'],
           'schema_version': man['schema_version'],
           'licensing': man['licensing'],
           'source_url': 'https://example.test/manual', 'published': payload['as_of']}, open(p + '.source.json', 'w'))
"""


def make_repo():
    root = tempfile.mkdtemp(prefix="runconn-test-")
    croot = os.path.join(root, ".claude", "connectors")
    data = os.path.join(root, "data")
    os.makedirs(os.path.join(data, "AAA"))
    return root, croot, data


def make_connector(croot, cid, subjects=("AAA",), sla=10, stub=STUB_OK, manifest_extra=None, dirname=None):
    d = os.path.join(croot, dirname or cid)
    os.makedirs(d, exist_ok=True)
    man = {"id": cid, "subjects": list(subjects), "staleness_sla_days": sla, "entry": "fetch.py",
           "output_path": "data/<SUBJECT>/external/stub/stub_<as_of>.json"}
    man.update(manifest_extra or {})
    json.dump(man, open(os.path.join(d, "connector.json"), "w"))
    with open(os.path.join(d, "fetch.py"), "w") as f:
        f.write(stub)
    return d


def make_v2_connector(croot, cid, *, series_id=None, dataset_id=None, provider=None, priority=100,
                      fallback_for=None, stub=STUB_V2, fixture=None):
    d = os.path.join(croot, cid)
    os.makedirs(d, exist_ok=True)
    man = {
        "manifest_version": 2, "schema_version": 1, "id": cid,
        "dataset_id": dataset_id or f"test.{cid}", "series_id": series_id or f"test.{cid}",
        "series": f"Test series {series_id or cid}", "satisfies": [f"need.{cid}"], "subjects": ["AAA"],
        "provider": provider or cid, "authority_class": "other", "provider_priority": priority,
        "acquisition": "official_api", "source_type": "official_data", "tier": 5,
        "license": "test-only", "host_allowlist": ["example.test"],
        "licensing": {"access": "public", "use": "allowed", "redistribution": "allowed",
                      "terms_url": "https://example.test/terms"},
        "credential_env": [],
        "release": {"cadence": "daily", "timezone": "UTC", "expected_lag_days": 0,
                    "grace_days": 10, "revision_policy": "revisable"},
        "entry": "fetch.py", "verify": "fetch.py --verify",
        "output_path": f"data/<SUBJECT>/external/{cid}/series_<as_of>.json",
        "output_schema": {"series": "string", "as_of": "date", "rows": [{"period": "date", "value": "float"}]},
        "units": {"rows[].value": "index"},
        "minimum_history": {"observations": 1, "path": "rows"},
    }
    if fallback_for:
        man["fallback_for"] = fallback_for
    json.dump(man, open(os.path.join(d, "connector.json"), "w"))
    with open(os.path.join(d, "fetch.py"), "w") as f:
        f.write(stub)
    json.dump(fixture or {"as_of": "2026-01-09", "rows": [{"period": "2026-01-09", "value": 1.0}]},
              open(os.path.join(d, "fixture.json"), "w"))
    return d


def dated_file(data, subject, d: date):
    sd = os.path.join(data, subject, "external", "stub")
    os.makedirs(sd, exist_ok=True)
    p = os.path.join(sd, f"stub_{d.isoformat()}.json")
    json.dump({}, open(p, "w"))
    return p


def rows_for(res, cid, subject):
    return [r for r in res["rows"] if r["connector"] == cid and r["subject"] == subject]


today = date.today()

# 1. SLA boundary: age == SLA is fresh (inclusive); age == SLA+1 refetches
root, croot, data = make_repo()
make_connector(croot, "stub-a")
dated_file(data, "AAA", today - timedelta(days=10))
res = m.run(data, connectors_root=croot)
check("age == SLA (boundary) → fresh", rows_for(res, "stub-a", "AAA")[0]["decision"] == "fresh")
shutil.rmtree(os.path.join(data, "AAA", "external"))
dated_file(data, "AAA", today - timedelta(days=11))
child_commands = []
real_subprocess_run = m.subprocess.run
def capture_child_command(command, *args, **kwargs):
    child_commands.append(command)
    return real_subprocess_run(command, *args, **kwargs)
m.subprocess.run = capture_child_command
try:
    res = m.run(data, connectors_root=croot)
finally:
    m.subprocess.run = real_subprocess_run
r = rows_for(res, "stub-a", "AAA")[0]
check("age == SLA+1 → refetched, new dated file exists",
      r["decision"] == "refetched"
      and os.path.exists(os.path.join(data, "AAA", "external", "stub", f"stub_{today.isoformat()}.json")))
check("refetched ledger row updates latest_as_of", r["latest_as_of"] == today.isoformat())
child_command = next((command for command in child_commands
                      if isinstance(command, list) and command and command[0] == sys.executable), [])
check("connector children use isolated Python and a fresh external pycache prefix",
      len(child_command) >= 5 and child_command[1:3] == ["-I", "-X"]
      and str(child_command[3]).startswith("pycache_prefix=")
      and "/.claude/connectors/" not in str(child_command[3]))
shutil.rmtree(root)

# 2. as_of from FILENAME, never mtime
root, croot, data = make_repo()
make_connector(croot, "stub-a")
old = dated_file(data, "AAA", today - timedelta(days=40))
new = dated_file(data, "AAA", today - timedelta(days=2))
os.utime(old, None)                      # old-dated file, NOW mtime
os.utime(new, (0, 0))                    # recent-dated file, 1970 mtime
res = m.run(data, connectors_root=croot)
r = rows_for(res, "stub-a", "AAA")[0]
check("latest_as_of parsed from filenames even when mtimes lie",
      r["decision"] == "fresh" and r["latest_as_of"] == (today - timedelta(days=2)).isoformat())
shutil.rmtree(root)

# 3. --dry-run: decision table, no execution, no ledger
root, croot, data = make_repo()
make_connector(croot, "stub-a")
dated_file(data, "AAA", today - timedelta(days=30))
res = m.run(data, dry_run=True, connectors_root=croot)
r = rows_for(res, "stub-a", "AAA")[0]
check("dry-run marks stale rows would_refetch", r["decision"] == "would_refetch")
check("dry-run executes nothing",
      not os.path.exists(os.path.join(data, "AAA", "external", "stub", f"stub_{today.isoformat()}.json")))
check("dry-run writes no ledger", not os.path.exists(os.path.join(data, "_connectors", "run_ledger.ndjson")))
shutil.rmtree(root)

# Ledger writes are an integrity boundary too. A pre-planted symlink must not
# redirect an append into another pool file.
root, croot, data = make_repo()
ledger_lane = os.path.join(data, "_connectors")
os.makedirs(ledger_lane)
outside = os.path.join(data, "outside.json")
open(outside, "w").write("outside-canary")
os.symlink("../outside.json", os.path.join(ledger_lane, "run_ledger.ndjson"))
ledger_refused = False
try:
    m._append_ledger(data, {"decision": "fresh", "outcome": "current"})
except RuntimeError:
    ledger_refused = True
check("ledger append refuses a symlink and preserves the outside target",
      ledger_refused and open(outside).read() == "outside-canary")
shutil.rmtree(root)

# 4. failing fetcher: 3 attempts, pool untouched, failed ledger row
root, croot, data = make_repo()
make_connector(croot, "stub-bad", stub=STUB_FAIL)
stale = dated_file(data, "AAA", today - timedelta(days=30))
res = m.run(data, connectors_root=croot)
r = rows_for(res, "stub-bad", "AAA")[0]
pool_files = os.listdir(os.path.join(data, "AAA", "external", "stub"))
check("failed after 3 attempts with non-zero exit",
      r["decision"] == "failed" and r["attempts"] == 3 and r["exit_code"] == 1)
check("failed fetch leaves the pool untouched", pool_files == [os.path.basename(stale)])
ledger = [json.loads(l) for l in open(os.path.join(data, "_connectors", "run_ledger.ndjson"))]
check("failed ledger row recorded with message",
      ledger[-1]["decision"] == "failed" and "deliberate failure" in ledger[-1]["message"] and "ts" in ledger[-1])
shutil.rmtree(root)

# 5. --only scoping
root, croot, data = make_repo()
make_connector(croot, "stub-a")
make_connector(croot, "stub-b", manifest_extra={"output_path": "data/<SUBJECT>/external/stub-b/stub_<as_of>.json"})
res = m.run(data, only="stub-a", connectors_root=croot)
check("--only runs just the named connector",
      rows_for(res, "stub-a", "AAA") and not rows_for(res, "stub-b", "AAA"))
shutil.rmtree(root)

# 6. malformed manifests skipped with reasons; healthy connector still processes
root, croot, data = make_repo()
os.makedirs(os.path.join(data, "BBB"))
make_connector(croot, "stub-subject", subjects=("AAA", "BBB"))
res = m.run(data, dry_run=True, subject_filter="bbb", connectors_root=croot)
check("--subject limits an interactive sweep to one subject",
      rows_for(res, "stub-subject", "BBB") and not rows_for(res, "stub-subject", "AAA"))
shutil.rmtree(root)

# 6. malformed manifests skipped with reasons; healthy connector still processes
root, croot, data = make_repo()
make_connector(croot, "stub-a")
make_connector(croot, "wrong-id", dirname="not-wrong-id")
bad = make_connector(croot, "no-entry")
os.unlink(os.path.join(bad, "fetch.py"))
res = m.run(data, connectors_root=croot)
skipped = dict(res["skipped_manifests"])
check("id != dirname skipped with reason", "not-wrong-id" in skipped and "directory name" in skipped["not-wrong-id"])
check("missing entry skipped with reason", "no-entry" in skipped and "missing" in skipped["no-entry"])
check("healthy connector still processed in the same sweep", bool(rows_for(res, "stub-a", "AAA")))
shutil.rmtree(root)

# 7. pool gate: no data/<SUBJECT>/ → skipped_no_pool, dir never created, ledger row written
root, croot, data = make_repo()
make_connector(croot, "stub-a", subjects=("BBB",))
res = m.run(data, connectors_root=croot)
r = rows_for(res, "stub-a", "BBB")[0]
check("missing pool → skipped_no_pool", r["decision"] == "skipped_no_pool")
check("pool dir NOT created", not os.path.exists(os.path.join(data, "BBB")))
ledger = [json.loads(l) for l in open(os.path.join(data, "_connectors", "run_ledger.ndjson"))]
check("skipped_no_pool ledger row written", ledger[-1]["decision"] == "skipped_no_pool")
res_forced = m.run(data, force=True, connectors_root=croot)
check("--force still respects the pool gate",
      rows_for(res_forced, "stub-a", "BBB")[0]["decision"] == "skipped_no_pool"
      and not os.path.exists(os.path.join(data, "BBB")))
shutil.rmtree(root)

# 8. run_fetch: a clean exit with empty/whitespace-only stdout must not IndexError (gemini finding)
#    Truth table over the last-line extraction: whitespace-only stdout is truthy but splitlines() is [].
class _FakeProc:
    def __init__(self, rc, out): self.returncode, self.stdout, self.stderr = rc, out, ""
_orig_run = m.subprocess.run
try:
    for label, out, want in [("whitespace-only stdout", "   \n\t ", ""),
                             ("empty stdout", "", ""),
                             ("normal multi-line stdout", "first line\nlast line", "last line")]:
        m.subprocess.run = (lambda _o: (lambda *a, **k: _FakeProc(0, _o)))(out)
        ok, attempts, code, msg = m.run_fetch("/nonexistent", {"entry": "fetch.py"}, "AAA", "/tmp")
        check(f"run_fetch clean exit, {label} → ok, no crash, message {want!r}",
              ok is True and code == 0 and msg == want, f"got msg {msg!r}")
    captured_timeouts = []
    def _capture_timeout(*_args, **kwargs):
        captured_timeouts.append(kwargs.get("timeout"))
        return _FakeProc(0, "ok")
    m.subprocess.run = _capture_timeout
    m.run_fetch(
        "/nonexistent", {"entry": "fetch.py", "attempt_timeout_seconds": 180},
        "AAA", "/tmp",
    )
    check("a reviewed multi-request connector owns a longer but bounded attempt deadline",
          captured_timeouts == [180])
finally:
    m.subprocess.run = _orig_run

# Connector transform identity starts at the declared directory itself. A
# symlinked root must fail closed just like a symlink below that root.
root = tempfile.mkdtemp(prefix="connector-root-symlink-")
real_bundle = os.path.join(root, "real")
linked_bundle = os.path.join(root, "linked")
os.makedirs(real_bundle)
open(os.path.join(real_bundle, "fetch.py"), "w").write("# transform\n")
os.symlink(real_bundle, linked_bundle)
check("Python connector fingerprint rejects a symlinked bundle root",
      bool(m.connector_fingerprint(real_bundle)) and m.connector_fingerprint(linked_bundle) == "")
shutil.rmtree(root)

# 9. manual connectors ("manual": true) are never auto-invoked — skipped_manual, no failed-fetch spam
#    (codex finding: a bot-walled direct path retried forever). STUB_FAIL proves the fetcher wasn't run.
root, croot, data = make_repo()
make_connector(croot, "stub-manual", stub=STUB_FAIL, manifest_extra={"manual": True})
dated_file(data, "AAA", today - timedelta(days=30))    # stale → a normal connector would refetch here
res = m.run(data, connectors_root=croot)
r = rows_for(res, "stub-manual", "AAA")[0]
check("manual connector stale → skipped_manual (not failed/refetched), fetcher untouched",
      r["decision"] == "skipped_manual" and r["attempts"] == 0)
ledger = [json.loads(l) for l in open(os.path.join(data, "_connectors", "run_ledger.ndjson"))]
check("manual skip is ledgered", ledger[-1]["decision"] == "skipped_manual")
res_f = m.run(data, force=True, connectors_root=croot)
check("--force still cannot auto-run a manual connector",
      rows_for(res_f, "stub-manual", "AAA")[0]["decision"] == "skipped_manual")
shutil.rmtree(root)

# 10. v2 staged publish: immutable/deduplicated vintages, revisions, provenance, and PIT cutoff.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-primary", series_id="test.semantic-series")
t1 = datetime(2026, 1, 10, 10, 0, tzinfo=timezone.utc)
res1 = m.run(data, force=True, connectors_root=croot, now=t1)
r1 = rows_for(res1, "v2-primary", "AAA")[0]
vdir = os.path.join(data, "_connectors", "vintages", "test.v2-primary", "test.semantic-series", "AAA")
v1_names = sorted(os.listdir(vdir))
v1 = json.load(open(os.path.join(vdir, v1_names[0])))
check("v2 staged output publishes only after validation", r1["decision"] == "refetched" and r1["outcome"] == "current")
check("first live pull is labelled first_observed_vintage (not falsely reconstructed)",
      len(v1_names) == 1 and v1["history_kind"] == "first_observed_vintage")
check("vintage carries schema/source/transform provenance",
      v1["manifest_version"] == 2 and v1["schema_version"] == 1
      and v1["source_url"] == "https://example.test/source" and v1["published_at"] == "2026-01-09"
      and isinstance(v1["connector_fingerprint"], str) and len(v1["connector_fingerprint"]) == 64)
check("vintage_id is first-class, non-recursive, and copied exactly into provenance + ledger",
      v1["vintage_id"].startswith("sha256:") and len(v1["vintage_id"]) == 71
      and v1["provenance"]["vintage_id"] == v1["vintage_id"]
      and m.compute_vintage_id(v1) == v1["vintage_id"] and r1["vintage_id"] == v1["vintage_id"])
resolved_v1 = m.resolve_vintage_id(data, "test.semantic-series", "AAA", v1["vintage_id"])
check("stable vintage-id resolver audits the chain and returns the exact vintage",
      resolved_v1 is not None and resolved_v1["vintage_id"] == v1["vintage_id"]
      and resolved_v1["payload"]["rows"][0]["value"] == 1.0)
blob_path = os.path.join(data, v1["blob_path"])
blob_before = open(blob_path, "rb").read()

# Same observation date, corrected value => an immutable revision, not overwrite.
json.dump({"as_of": "2026-01-09", "rows": [{"period": "2026-01-09", "value": 2.0}]},
          open(os.path.join(d, "fixture.json"), "w"))
t2 = datetime(2026, 1, 11, 10, 0, tzinfo=timezone.utc)
res2 = m.run(data, force=True, connectors_root=croot, now=t2)
r2 = rows_for(res2, "v2-primary", "AAA")[0]
v2_names = sorted(os.listdir(vdir))
v2 = json.load(open(os.path.join(vdir, v2_names[-1])))
check("same-as_of changed content is a revision with two immutable vintages",
      r2["publication_outcome"] == "revised" and len(v2_names) == 2 and v2["revision_of"] == v1["vintage_id"])
check("post-deployment revision is a true point-in-time vintage", v2["history_kind"] == "true_point_in_time")
check("revision never overwrites the first content blob", open(blob_path, "rb").read() == blob_before)

# Same content again => deduplicate the blob, but preserve the accepted retrieval as its own vintage.
t3 = datetime(2026, 1, 12, 10, 0, tzinfo=timezone.utc)
res3 = m.run(data, force=True, connectors_root=croot, now=t3)
r3 = rows_for(res3, "v2-primary", "AAA")[0]
check("same content is unchanged/no_new_release, deduplicates the blob, and preserves the retrieval vintage",
      r3["publication_outcome"] == "unchanged" and r3["outcome"] == "no_new_release"
      and len(os.listdir(vdir)) == 3
      and json.load(open(os.path.join(vdir, sorted(os.listdir(vdir))[-1])))["content_sha256"] == v2["content_sha256"])

pit1 = m.read_point_in_time(data, "test.semantic-series", "AAA", "2026-01-10T23:59:59Z", connectors_root=croot)
pit2 = m.read_point_in_time(data, "test.semantic-series", "AAA", "2026-01-11T23:59:59Z", connectors_root=croot)
check("PIT cutoff returns the vintage knowable then, not today's revision",
      pit1["payload"]["rows"][0]["value"] == 1.0 and pit2["payload"]["rows"][0]["value"] == 2.0)
shutil.rmtree(root)

# 10a. The fifteen-minute scheduler uses persisted actual-attempt clocks, not
# every no-op ledger row, while a due source retains its prior public health.
check("due-attempt intervals match cadence and event-grace bounds",
      m.due_attempt_interval({"release": {"cadence": "twelve_hourly"}}) == timedelta(hours=12)
      and m.due_attempt_interval({"release": {"cadence": "daily"}}) == timedelta(hours=6)
      and all(m.due_attempt_interval({"release": {"cadence": cadence}}) == timedelta(hours=24)
              for cadence in ("weekly", "monthly", "quarterly", "semiannual", "annual"))
      and m.due_attempt_interval({"release": {"cadence": "event_driven", "grace_days": 0}})
          == timedelta(minutes=15)
      and m.due_attempt_interval({"release": {"cadence": "event_driven", "grace_days": .5}})
          == timedelta(hours=12)
      and m.due_attempt_interval({"release": {"cadence": "event_driven", "grace_days": 10}})
          == timedelta(hours=24)
      and m.due_attempt_interval({"release": {"cadence": "realtime"}}) is None)

root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-monthly-throttle", series_id="test.monthly-throttle",
                      fixture={"as_of": "2026-01-01", "rows": [{"period": "2026-01-01", "value": 1.0}]})
monthly_man = json.load(open(os.path.join(d, "connector.json")))
monthly_man["release"] = {"cadence": "monthly", "timezone": "UTC", "expected_lag_days": 0,
                          "grace_days": 0, "revision_policy": "revisable"}
json.dump(monthly_man, open(os.path.join(d, "connector.json"), "w"))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 1, 1, tzinfo=timezone.utc))
monthly_vintages = m.connector_storage_paths(data, monthly_man, "AAA")["vintages"]
first_due = rows_for(m.run(
    data, connectors_root=croot, now=datetime(2026, 2, 1, tzinfo=timezone.utc),
), monthly_man["id"], "AAA")[0]
fifteen_minutes = rows_for(m.run(
    data, connectors_root=croot, now=datetime(2026, 2, 1, 0, 15, tzinfo=timezone.utc),
), monthly_man["id"], "AAA")[0]
thirty_minutes = rows_for(m.run(
    data, connectors_root=croot, now=datetime(2026, 2, 1, 0, 30, tzinfo=timezone.utc),
), monthly_man["id"], "AAA")[0]
check("repeated monthly due sweeps fifteen minutes apart perform one acquisition",
      first_due["decision"] == "refetched" and first_due["outcome"] == "no_new_release"
      and fifteen_minutes["decision"] == thirty_minutes["decision"] == "deferred"
      and "checked_at" not in fifteen_minutes and "checked_at" not in thirty_minutes
      and len(os.listdir(monthly_vintages)) == 2)
check("a deferred no-new-release row ages to stalled after grace without inventing an attempt",
      fifteen_minutes["outcome"] == "stalled" and fifteen_minutes["failure_kind"] is None)
retry_boundary = rows_for(m.run(
    data, connectors_root=croot, now=datetime(2026, 2, 2, tzinfo=timezone.utc),
), monthly_man["id"], "AAA")[0]
check("a due monthly source retries at the exact 24-hour attempt boundary",
      retry_boundary["decision"] == "refetched" and len(os.listdir(monthly_vintages)) == 3)
forced_bypass = rows_for(m.run(
    data, force=True, connectors_root=croot, now=datetime(2026, 2, 2, 0, 15, tzinfo=timezone.utc),
), monthly_man["id"], "AAA")[0]
open(os.path.join(d, "helper.py"), "w").write("# changed deployed transform\n")
code_bypass = rows_for(m.run(
    data, connectors_root=croot, now=datetime(2026, 2, 2, 0, 30, tzinfo=timezone.utc),
), monthly_man["id"], "AAA")[0]
check("force and connector-code changes bypass the due-attempt throttle",
      forced_bypass["decision"] == "refetched" and code_bypass["decision"] == "refetched"
      and len(os.listdir(monthly_vintages)) == 5)
# A no-fetch health row is deliberately rebound to the canonical vintage's code identity, but a row that
# actually PUBLISHED must carry the identity it published under. Otherwise the refetched row claims the old
# fingerprint and commit: healthyBuiltBySatisfies rejects the new current until a later `fresh` sweep, and —
# because repair verification resolves deployment through connector_commit — the one real post-merge refetch
# is invisible to it, so a merged repair can never be verified by the fetch that proves it works.
check("a refetch published under changed code records the NEW code identity, not the old vintage's",
      code_bypass["connector_fingerprint"] == m.connector_fingerprint(d)
      and code_bypass["publisher_contract_fingerprint"] == m.publisher_contract_fingerprint())
# A malformed append is skipped without erasing the valid prior attempt clock.
# The degradation remains explicit in the next accepted row so operators can
# repair the ledger without the scheduler hammering a slow upstream source.
with open(os.path.join(data, m.LEDGER_DIR, m.LEDGER_NAME), "a") as fh:
    fh.write("{unreadable-ledger-row}\n")
    fh.write(json.dumps({
        "connector": monthly_man["id"], "dataset_id": monthly_man["dataset_id"],
        "series_id": monthly_man["series_id"], "provider": monthly_man["provider"], "subject": "AAA",
        "decision": "failed", "checked_at": "2026-02-02T00:44:00Z",
        "message": "must not become healthy or move the attempt clock",
    }) + "\n")
attempts_after_corruption, latest_after_corruption, warning_after_corruption = m._read_attempt_history(data)
monthly_key = (
    monthly_man["id"], monthly_man["dataset_id"], monthly_man["series_id"], monthly_man["provider"], "AAA",
)
ledger_degraded = rows_for(m.run(
    data, connectors_root=croot, now=datetime(2026, 2, 2, 0, 45, tzinfo=timezone.utc),
), monthly_man["id"], "AAA")[0]
check("one unreadable ledger row retains the valid throttle clock and emits an integrity warning",
      ledger_degraded["decision"] == "deferred"
      and ledger_degraded["outcome"] == "stalled"
      and "malformed or contract-invalid" in ledger_degraded.get("ledger_integrity_warning", "")
      and warning_after_corruption is not None
      and attempts_after_corruption[monthly_key] == datetime(2026, 2, 2, 0, 30, tzinfo=timezone.utc)
      and latest_after_corruption[monthly_key].get("outcome") is not None
      and len(os.listdir(monthly_vintages)) == 5)
shutil.rmtree(root)

# A recent failed attempt remains the visible public state during deferral; a
# fifteen-minute scheduler wake is not a second failure and carries no checked_at.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-failure-throttle", series_id="test.failure-throttle",
                      fixture={"as_of": "2026-01-01", "rows": [{"period": "2026-01-01", "value": 1.0}]})
failure_man = json.load(open(os.path.join(d, "connector.json")))
failure_man["release"] = {"cadence": "monthly", "timezone": "UTC", "expected_lag_days": 0,
                          "grace_days": 10, "revision_policy": "revisable"}
json.dump(failure_man, open(os.path.join(d, "connector.json"), "w"))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 1, 1, tzinfo=timezone.utc))
real_staged_fetch = m.run_fetch_staged
def one_scheduled_failure(*_args, **_kwargs):
    return {"ok": False, "attempts": 3, "exit_code": 1, "message": "preserve this failure",
            "outcome": "fetch_error", "stage_root": None}
m.run_fetch_staged = one_scheduled_failure
try:
    failed_due = rows_for(m.run(
        data, connectors_root=croot, now=datetime(2026, 2, 1, tzinfo=timezone.utc),
    ), failure_man["id"], "AAA")[0]
finally:
    m.run_fetch_staged = real_staged_fetch
deferred_failure = rows_for(m.run(
    data, connectors_root=croot, now=datetime(2026, 2, 1, 0, 15, tzinfo=timezone.utc),
), failure_man["id"], "AAA")[0]
check("deferred due work preserves the prior failure health and message",
      failed_due["decision"] == "failed" and deferred_failure["decision"] == "deferred"
      and deferred_failure["outcome"] == failed_due["outcome"] == "stalled"
      and deferred_failure["failure_kind"] == failed_due["failure_kind"] == "fetch_error"
      and deferred_failure["message"] == failed_due["message"] == "preserve this failure"
      and "checked_at" not in deferred_failure)
shutil.rmtree(root)

# A recent attempt clock cannot suppress first publication when current is
# missing; current existence is a hard throttle bypass.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-missing-current-bypass", series_id="test.missing-current-bypass")
missing_man = json.load(open(os.path.join(d, "connector.json")))
os.makedirs(os.path.join(data, m.LEDGER_DIR), exist_ok=True)
synthetic_checked = "2026-02-01T00:00:00.000000Z"
with open(os.path.join(data, m.LEDGER_DIR, m.LEDGER_NAME), "w") as fh:
    fh.write(json.dumps({
        "connector": missing_man["id"], "dataset_id": missing_man["dataset_id"],
        "series_id": missing_man["series_id"], "provider": missing_man["provider"], "subject": "AAA",
        "decision": "failed", "outcome": "stalled", "checked_at": synthetic_checked,
    }) + "\n")
missing_bypass = rows_for(m.run(
    data, connectors_root=croot, now=datetime(2026, 2, 1, tzinfo=timezone.utc),
), missing_man["id"], "AAA")[0]
check("missing current bypasses a recent persisted attempt clock",
      missing_bypass["decision"] == "refetched")
shutil.rmtree(root)

# 11. exit-zero/no-output and malformed schema both fail closed with distinct public health + technical reason.
root, croot, data = make_repo()
make_v2_connector(croot, "v2-empty", stub=STUB_NO_OUTPUT)
empty = rows_for(m.run(data, force=True, connectors_root=croot,
                       now=datetime(2026, 2, 1, tzinfo=timezone.utc)), "v2-empty", "AAA")[0]
check("exit zero with no output is rejected and classified stalled/no_output",
      empty["decision"] == "failed" and empty["outcome"] == "stalled" and empty["failure_kind"] == "no_output")
check("exit-zero/no-output publishes no current pointer",
      not os.path.exists(os.path.join(data, "_connectors", "current", "test.v2-empty")))
shutil.rmtree(root)

root, croot, data = make_repo()
make_v2_connector(croot, "v2-malformed", fixture={"as_of": "2026-01-09", "rows": []})
badrow = rows_for(m.run(data, force=True, connectors_root=croot,
                        now=datetime(2026, 2, 1, tzinfo=timezone.utc)), "v2-malformed", "AAA")[0]
check("minimum-history violation is suspect and quarantined from publish",
      badrow["decision"] == "failed" and badrow["outcome"] == "suspect" and badrow["failure_kind"] == "quality_suspect")
shutil.rmtree(root)

root, croot, data = make_repo()
make_v2_connector(croot, "v2-mixed-defect", fixture={"as_of": "2026-01-09", "rows": [], "unexpected": "x"})
mixed_defect = rows_for(m.run(data, force=True, connectors_root=croot,
                              now=datetime(2026, 2, 1, tzinfo=timezone.utc)), "v2-mixed-defect", "AAA")[0]
check("schema/provenance defects outrank a simultaneous minimum-history miss",
      mixed_defect["failure_kind"] == "schema_error" and mixed_defect["outcome"] == "schema_failed")
shutil.rmtree(root)

# 12. canonical schema is active: a v2 manifest missing a required field is skipped.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-schema-missing")
man = json.load(open(os.path.join(d, "connector.json"))); del man["authority_class"]
json.dump(man, open(os.path.join(d, "connector.json"), "w"))
bad_schema = m.run(data, force=True, connectors_root=croot,
                   now=datetime(2026, 2, 1, tzinfo=timezone.utc))
check("checked-in schema required fields are enforced by discovery",
      not bad_schema["rows"] and "authority_class" in dict(bad_schema["skipped_manifests"])["v2-schema-missing"])
shutil.rmtree(root)

# 13. duplicate primary ownership is rejected; an explicit whole-provider fallback is selected without splicing.
root, croot, data = make_repo()
cred_a = make_v2_connector(croot, "credential-owner-a", series_id="test.credential-owner-a",
                           dataset_id="test.credential-owner-a", provider="Provider A")
cred_b = make_v2_connector(croot, "credential-owner-b", series_id="test.credential-owner-b",
                           dataset_id="test.credential-owner-b", provider="Provider B")
for connector_dir in (cred_a, cred_b):
    credential_manifest = json.load(open(os.path.join(connector_dir, "connector.json")))
    credential_manifest["credential_env"] = ["CONNECTOR_SHARED_TOKEN"]
    json.dump(credential_manifest, open(os.path.join(connector_dir, "connector.json"), "w"))
credential_valid, credential_skipped = m.discover(croot)
check("a credential environment name has one connector/provider trust-domain owner",
      not credential_valid and set(dict(credential_skipped)) == {"credential-owner-a", "credential-owner-b"}
      and all("credential_env" in reason for _name, reason in credential_skipped))
shutil.rmtree(root)

root, croot, data = make_repo()
make_v2_connector(croot, "collision-a", series_id="test.collision", dataset_id="test.collision-a", provider="A")
make_v2_connector(croot, "collision-b", series_id="test.collision", dataset_id="test.collision-b", provider="B", priority=200)
collision = m.run(data, force=True, connectors_root=croot,
                  now=datetime(2026, 2, 1, tzinfo=timezone.utc))
check("two undeclared primaries for one subject+series fail closed",
      not collision["rows"] and set(dict(collision["skipped_manifests"])) == {"collision-a", "collision-b"})
shutil.rmtree(root)

root, croot, data = make_repo()
pdir = make_v2_connector(croot, "cascade-primary", series_id="test.cascade",
                         dataset_id="test.cascade-primary", provider="Primary")
fdir = make_v2_connector(croot, "cascade-fallback", series_id="test.cascade",
                         dataset_id="test.cascade-fallback", provider="Fallback", priority=200,
                         fallback_for="cascade-primary")
rdir = make_v2_connector(croot, "cascade-rival", series_id="test.cascade",
                         dataset_id="test.cascade-rival", provider="Rival", priority=300)
primary_manifest = json.load(open(os.path.join(pdir, "connector.json")))
primary_manifest["subjects"] = ["AAA", "BBB"]
json.dump(primary_manifest, open(os.path.join(pdir, "connector.json"), "w"))
rival_manifest = json.load(open(os.path.join(rdir, "connector.json")))
rival_manifest["subjects"] = ["BBB"]
json.dump(rival_manifest, open(os.path.join(rdir, "connector.json"), "w"))
valid_cascade, skipped_cascade = m.discover(croot)
skipped_cascade_map = dict(skipped_cascade)
check("invalidating a primary on any coverage row recursively invalidates its narrower fallback",
      not valid_cascade
      and set(skipped_cascade_map) == {"cascade-primary", "cascade-rival", "cascade-fallback"}
      and "primary 'cascade-primary' is not discovered" in skipped_cascade_map["cascade-fallback"])
shutil.rmtree(root)

root, croot, data = make_repo()
pdir = make_v2_connector(croot, "projection-primary", series_id="test.projection-owner",
                         dataset_id="test.projection-primary", provider="Primary")
fdir = make_v2_connector(croot, "projection-fallback", series_id="test.projection-owner",
                         dataset_id="test.projection-fallback", provider="Fallback", priority=200,
                         fallback_for="projection-primary")
primary_manifest = json.load(open(os.path.join(pdir, "connector.json")))
fallback_manifest = json.load(open(os.path.join(fdir, "connector.json")))
fallback_manifest["output_path"] = primary_manifest["output_path"]
json.dump(fallback_manifest, open(os.path.join(fdir, "connector.json"), "w"))
valid_projection, skipped_projection = m.discover(croot)
check("two providers may never materialize the same subject projection path",
      not valid_projection and set(dict(skipped_projection)) == {"projection-primary", "projection-fallback"})
shutil.rmtree(root)

root, croot, data = make_repo()
pdir = make_v2_connector(croot, "history-primary", series_id="test.history-fallback",
                         dataset_id="test.history-primary", provider="Primary")
fdir = make_v2_connector(croot, "history-fallback", series_id="test.history-fallback",
                         dataset_id="test.history-fallback", provider="Fallback", priority=200,
                         fallback_for="history-primary")
fallback_manifest = json.load(open(os.path.join(fdir, "connector.json")))
fallback_manifest["minimum_history"]["observations"] = 2
json.dump(fallback_manifest, open(os.path.join(fdir, "connector.json"), "w"))
valid_history, skipped_history = m.discover(croot)
check("a fallback cannot weaken or otherwise drift from the primary history requirement",
      [man[1]["id"] for man in valid_history] == ["history-primary"]
      and "history-fallback" in dict(skipped_history))
shutil.rmtree(root)

root, croot, data = make_repo()
pdir = make_v2_connector(croot, "provider-primary", series_id="test.fallback", dataset_id="test.primary", provider="Primary")
fdir = make_v2_connector(croot, "provider-fallback", series_id="test.fallback", dataset_id="test.fallback", provider="Fallback",
                         priority=200, fallback_for="provider-primary",
                         fixture={"as_of": "2026-01-08", "rows": [{"period": "2026-01-07", "value": 70.0}, {"period": "2026-01-08", "value": 80.0}]})
m.run(data, only="provider-fallback", force=True, connectors_root=croot,
      now=datetime(2026, 1, 9, 10, 0, tzinfo=timezone.utc))
fallback_read = m.read_point_in_time(data, "test.fallback", "AAA", "2026-01-09T12:00:00Z", connectors_root=croot)
check("fallback is selected only when primary has no eligible vintage",
      fallback_read["selected_connector_id"] == "provider-fallback" and fallback_read["fallback_used"] is True)
json.dump({"as_of": "2026-01-10", "rows": [{"period": "2026-01-10", "value": 100.0}]},
          open(os.path.join(pdir, "fixture.json"), "w"))
m.run(data, only="provider-primary", force=True, connectors_root=croot,
      now=datetime(2026, 1, 10, 10, 0, tzinfo=timezone.utc))
primary_read = m.read_point_in_time(data, "test.fallback", "AAA", "2026-01-10T12:00:00Z", connectors_root=croot)
check("provider selection returns one complete primary payload and never splices fallback rows",
      primary_read["selected_connector_id"] == "provider-primary" and primary_read["fallback_used"] is False
      and primary_read["payload"]["rows"] == [{"period": "2026-01-10", "value": 100.0}])
shutil.rmtree(root)

# 14. production retrieval time is captured after the fetch finishes.
root, croot, data = make_repo()
utc_today = datetime.now(timezone.utc).date().isoformat()
make_v2_connector(croot, "v2-clock", fixture={"_delay_s": 0.05, "as_of": utc_today,
                                               "rows": [{"period": utc_today, "value": 1.0}]})
clockrow = rows_for(m.run(data, force=True, connectors_root=croot), "v2-clock", "AAA")[0]
check("retrieved_at is after sweep start for a slow production fetch",
      clockrow["retrieved_at"] > clockrow["sweep_started_at"] and clockrow["checked_at"] == clockrow["retrieved_at"])
shutil.rmtree(root)

root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-fetch-code-drift", series_id="test.fetch-code-drift")
helper = os.path.join(d, "normalise.py")
open(helper, "w").write("# sealed helper\n")
real_drift_fetch = m.run_fetch_staged
def drift_helper_after_fetch(*args, **kwargs):
    result = real_drift_fetch(*args, **kwargs)
    open(helper, "a").write("# changed while acquisition was running\n")
    return result
m.run_fetch_staged = drift_helper_after_fetch
try:
    code_drift = rows_for(m.run(
        data, force=True, connectors_root=croot, now=datetime(2026, 2, 1, tzinfo=timezone.utc),
    ), "v2-fetch-code-drift", "AAA")[0]
finally:
    m.run_fetch_staged = real_drift_fetch
drift_man = json.load(open(os.path.join(d, "connector.json")))
drift_paths = m.connector_storage_paths(data, drift_man, "AAA")
check("automatic acquisition cannot seal bytes under a transform that changed during fetch",
      code_drift["failure_kind"] == "unreproducible_code" and code_drift["outcome"] == "quarantined"
      and "connector fingerprint" in code_drift["message"]
      and not os.path.exists(drift_paths["current"])
      and not os.path.exists(drift_paths["vintages"]))
shutil.rmtree(root)

# 15. marker-before-pointer crashes fail closed, then deterministically recover the sealed commit.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-atomic", series_id="test.atomic")
json.dump({"as_of": "2026-02-28", "rows": [{"period": "2026-02-28", "value": 1.0}]},
          open(os.path.join(d, "fixture.json"), "w"))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 3, 1, tzinfo=timezone.utc))
valid, _ = m.discover(croot); man = valid[0][1]
current_path = m.connector_storage_paths(data, man, "AAA")["current"]
current_before = open(current_path, "rb").read()
json.dump({"as_of": "2026-02-28", "rows": [{"period": "2026-02-28", "value": 9.0}]},
          open(os.path.join(d, "fixture.json"), "w"))
real_atomic = m._atomic_write
def fail_current(path, content):
    if path == current_path:
        raise OSError("simulated current-pointer failure")
    return real_atomic(path, content)
m._atomic_write = fail_current
try:
    partial = rows_for(m.run(data, force=True, connectors_root=croot,
                             now=datetime(2026, 3, 2, tzinfo=timezone.utc)), "v2-atomic", "AAA")[0]
finally:
    m._atomic_write = real_atomic
after_failure = m.read_point_in_time(data, "test.atomic", "AAA", "2026-03-03", connectors_root=croot)
check("partial publish reports publish_error/quarantined and preserves the old current pointer",
      partial["decision"] == "failed" and partial["failure_kind"] == "publish_error"
      and partial["outcome"] == "quarantined" and open(current_path, "rb").read() == current_before)
check("marker-without-current crash quarantines the rolled-back pointer",
      after_failure is None)
dry_recovery = rows_for(m.run(data, dry_run=True, connectors_root=croot,
                              now=datetime(2026, 3, 3, tzinfo=timezone.utc)), "v2-atomic", "AAA")[0]
check("dry-run reports pending committed-head recovery without changing current",
      dry_recovery["decision"] == "would_recover_then_refetch"
      and open(current_path, "rb").read() == current_before)
recovery = rows_for(m.run(data, connectors_root=croot,
                          now=datetime(2026, 3, 3, tzinfo=timezone.utc)), "v2-atomic", "AAA")[0]
recovered_current = json.load(open(current_path))
before_revision = m.read_point_in_time(
    data, "test.atomic", "AAA", "2026-03-01T23:59:59Z", connectors_root=croot,
)
after_revision = m.read_point_in_time(
    data, "test.atomic", "AAA", "2026-03-03T00:00:00Z", connectors_root=croot,
)
check("expired sealed successor is recovered then refreshed before it can be called current",
      recovery["decision"] == "refetched" and recovery["outcome"] in {"current", "no_new_release"}
      and recovered_current["committed_count"] == 3
      and after_revision is not None and after_revision["usable"] is True
      and after_revision["payload"]["rows"][0]["value"] == 9.0)
check("recovery keeps original retrieval time, so earlier PIT cutoffs cannot see the revision",
      before_revision is not None and before_revision["usable"] is True
      and before_revision["payload"]["rows"][0]["value"] == 1.0)
corrupt = os.path.join(data, "_connectors", "blobs", "sha256", "ff", "corrupt.json")
os.makedirs(os.path.dirname(corrupt), exist_ok=True); open(corrupt, "wb").write(b"partial")
try:
    m._write_once(corrupt, b"complete")
    rejected_corrupt = False
except RuntimeError:
    rejected_corrupt = True
check("immutable writer never accepts a pre-existing truncated record", rejected_corrupt and open(corrupt, "rb").read() == b"partial")
shutil.rmtree(root)

# 16. Unit and compact-schema contracts reject drift before publication.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-unit-missing")
man = json.load(open(os.path.join(d, "connector.json"))); man["units"] = {}
json.dump(man, open(os.path.join(d, "connector.json"), "w"))
unit_missing = m.run(data, force=True, connectors_root=croot)
check("v2 manifest rejects an undeclared numeric unit",
      not unit_missing["rows"] and "units missing numeric field paths" in dict(unit_missing["skipped_manifests"])["v2-unit-missing"])
shutil.rmtree(root)

root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-unit-drift")
man = json.load(open(os.path.join(d, "connector.json"))); man["units"]["rows[].not_a_metric"] = "index"
json.dump(man, open(os.path.join(d, "connector.json"), "w"))
unit_drift = m.run(data, force=True, connectors_root=croot)
check("v2 manifest rejects a unit path that drifted from output_schema",
      not unit_drift["rows"] and "not numeric output fields" in dict(unit_drift["skipped_manifests"])["v2-unit-drift"])
shutil.rmtree(root)

root, croot, data = make_repo()
make_v2_connector(croot, "v2-extra-string",
                  fixture={"as_of": "2026-08-01", "rows": [{"period": "2026-08-01", "value": 1.0}], "undeclared": "x"})
extra = rows_for(m.run(data, force=True, connectors_root=croot), "v2-extra-string", "AAA")[0]
check("explicit payload object schemas are closed", extra["failure_kind"] == "schema_error" and "unexpected" in extra["message"])
shutil.rmtree(root)

root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-zone")
man = json.load(open(os.path.join(d, "connector.json"))); man["release"]["timezone"] = "Mars/Olympus_Mons"
json.dump(man, open(os.path.join(d, "connector.json"), "w"))
zone = m.run(data, force=True, connectors_root=croot)
check("invalid release timezone fails manifest discovery",
      not zone["rows"] and "valid IANA timezone" in dict(zone["skipped_manifests"])["v2-zone"])
shutil.rmtree(root)

# 17. Provenance hosts are exact and subprocesses receive only declared credentials.
root, croot, data = make_repo()
evil_stub = STUB_V2.replace("https://example.test/source", "https://evil.example.test/source")
make_v2_connector(croot, "v2-host", stub=evil_stub)
host_row = rows_for(m.run(data, force=True, connectors_root=croot), "v2-host", "AAA")[0]
check("provenance host must exactly match host_allowlist (subdomains are not implicit)",
      host_row["failure_kind"] == "invalid_provenance" and "outside host_allowlist" in host_row["message"])
shutil.rmtree(root)

root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-credentials")
man = json.load(open(os.path.join(d, "connector.json"))); man["credential_env"] = ["CONNECTOR_TEST_TOKEN"]
json.dump(man, open(os.path.join(d, "connector.json"), "w"))
valid, _ = m.discover(croot); cdir, parsed = valid[0]
called = 0
real_run = m.subprocess.run
def count_run(*args, **kwargs):
    global called
    called += 1
    return real_run(*args, **kwargs)
m.subprocess.run = count_run
try:
    cred_result = m.run_fetch_staged(cdir, parsed, "AAA", data)
finally:
    m.subprocess.run = real_run
check("missing declared credential is deterministic and executes no subprocess",
      cred_result["outcome"] == "credentials_missing" and cred_result["attempts"] == 0 and called == 0)
config_dir = os.path.join(root, "config")
os.makedirs(config_dir)
providers_env = os.path.join(config_dir, "providers.env")
open(providers_env, "w").write(
    "# ignored\nexport CONNECTOR_TEST_TOKEN='file secret /'\nCONNECTOR_UNRELATED_SECRET=must-not-load\n"
)
os.environ["NOSTRA_ENGINE_CONFIG_DIR"] = config_dir
os.chmod(providers_env, 0o600)
os.chmod(config_dir, 0o755)
insecure_directory = m.run_fetch_staged(cdir, parsed, "AAA", data)
check("providers.env under a group/world-accessible config directory is rejected",
      insecure_directory["outcome"] == "credentials_missing"
      and "CONNECTOR_TEST_TOKEN" not in os.environ)
os.chmod(config_dir, 0o700)
linked_config_dir = os.path.join(root, "linked-config")
os.symlink(config_dir, linked_config_dir)
os.environ["NOSTRA_ENGINE_CONFIG_DIR"] = linked_config_dir
symlinked_directory = m.run_fetch_staged(cdir, parsed, "AAA", data)
check("a symlinked credential config directory is rejected",
      symlinked_directory["outcome"] == "credentials_missing"
      and "CONNECTOR_TEST_TOKEN" not in os.environ)
os.environ["NOSTRA_ENGINE_CONFIG_DIR"] = config_dir
os.chmod(providers_env, 0o644)
insecure_mode = m.run_fetch_staged(cdir, parsed, "AAA", data)
check("providers.env with group/world permission bits is rejected",
      insecure_mode["outcome"] == "credentials_missing" and "CONNECTOR_TEST_TOKEN" not in os.environ)
os.chmod(providers_env, 0o600)
real_getuid = m.os.getuid
file_owner = os.lstat(providers_env).st_uid
m.os.getuid = lambda: file_owner + 1
try:
    wrong_owner = m.run_fetch_staged(cdir, parsed, "AAA", data)
finally:
    m.os.getuid = real_getuid
check("providers.env not owned by the effective runner uid is rejected",
      wrong_owner["outcome"] == "credentials_missing" and "CONNECTOR_TEST_TOKEN" not in os.environ)
open(providers_env, "w").write(
    "CONNECTOR_TEST_TOKEN=first\nCONNECTOR_TEST_TOKEN=second\n"
)
os.chmod(providers_env, 0o600)
duplicate_credential = m.run_fetch_staged(cdir, parsed, "AAA", data)
check("duplicate providers.env definitions fail closed before any credential is loaded",
      duplicate_credential["outcome"] == "credentials_missing"
      and "CONNECTOR_TEST_TOKEN" not in os.environ)
open(providers_env, "w").write(
    "# ignored\nexport CONNECTOR_TEST_TOKEN='file secret /'\nCONNECTOR_UNRELATED_SECRET=must-not-load\n"
)
os.chmod(providers_env, 0o600)
file_credential = m.run_fetch_staged(cdir, parsed, "AAA", data)
loaded_child_env = m.connector_child_env(parsed)
check("a declared providers.env credential is loaded without sourcing undeclared secrets",
      file_credential["ok"] is True and loaded_child_env.get("CONNECTOR_TEST_TOKEN") == "file secret /"
      and "CONNECTOR_UNRELATED_SECRET" not in os.environ
      and "CONNECTOR_UNRELATED_SECRET" not in loaded_child_env
      and not os.path.realpath(file_credential["stage_root"]).startswith(os.path.realpath(data) + os.sep))
del os.environ["CONNECTOR_TEST_TOKEN"]
os.environ["CONNECTOR_TEST_TOKEN"] = "allowed"
os.environ["CONNECTOR_UNRELATED_SECRET"] = "must-not-cross"
child_env = m.connector_child_env(parsed)
check("an explicit invocation value overrides providers.env and only allowlisted credentials reach the child",
      child_env.get("CONNECTOR_TEST_TOKEN") == "allowed" and "CONNECTOR_UNRELATED_SECRET" not in child_env)
os.environ["NOSTRA_CONNECTOR_CREDENTIAL_SOURCE"] = "providers_env"
strict_child_env = m.connector_child_env(parsed)
check("strict providers_env mode discards an inherited declared connector credential",
      strict_child_env.get("CONNECTOR_TEST_TOKEN") == "file secret /"
      and strict_child_env.get("CONNECTOR_TEST_TOKEN") != "allowed")
open(providers_env, "w").write(
    "CONNECTOR_TEST_TOKEN=first\nCONNECTOR_TEST_TOKEN=second\n"
)
os.chmod(providers_env, 0o600)
os.environ["CONNECTOR_TEST_TOKEN"] = "must-be-discarded"
strict_duplicate_env = m.connector_child_env(parsed)
check("strict mode never falls back to an inherited secret when providers.env is ambiguous",
      "CONNECTOR_TEST_TOKEN" not in strict_duplicate_env and "CONNECTOR_TEST_TOKEN" not in os.environ)
os.environ.pop("CONNECTOR_TEST_TOKEN", None); del os.environ["CONNECTOR_UNRELATED_SECRET"]
del os.environ["NOSTRA_CONNECTOR_CREDENTIAL_SOURCE"]
del os.environ["NOSTRA_ENGINE_CONFIG_DIR"]
shutil.rmtree(root)

# 18. PIT metadata is tamper-evident and same-release provider conflicts are unusable.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-tamper", series_id="test.tamper")
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 4, 1, tzinfo=timezone.utc))
valid, _ = m.discover(croot); man = valid[0][1]
current = json.load(open(m.connector_storage_paths(data, man, "AAA")["current"]))
vintage_path = os.path.join(data, current["committed_head"]["path"])
tampered = json.load(open(vintage_path)); tampered["retrieved_at"] = "2020-01-01T00:00:00.000000Z"
json.dump(tampered, open(vintage_path, "w"))
tamper_read = m.read_point_in_time(data, "test.tamper", "AAA", "2026-04-02", connectors_root=croot)
check("tampered vintage retrieval metadata cannot enter an earlier PIT replay", tamper_read is None)
shutil.rmtree(root)

root, croot, data = make_repo()
make_v2_connector(croot, "disagree-primary", series_id="test.disagree", dataset_id="test.disagree-primary",
                  provider="Primary", fixture={"as_of": "2026-05-01", "rows": [{"period": "2026-05-01", "value": 1.0}]})
make_v2_connector(croot, "disagree-fallback", series_id="test.disagree", dataset_id="test.disagree-fallback",
                  provider="Fallback", priority=200, fallback_for="disagree-primary",
                  fixture={"as_of": "2026-05-01", "rows": [{"period": "2026-05-01", "value": 2.0}]})
m.run(data, only="disagree-fallback", force=True, connectors_root=croot, now=datetime(2026, 5, 2, 9, tzinfo=timezone.utc))
disagree_run = m.run(data, only="disagree-primary", force=True, connectors_root=croot,
                     now=datetime(2026, 5, 2, 10, tzinfo=timezone.utc))
disagree = m.read_point_in_time(data, "test.disagree", "AAA", "2026-05-03", connectors_root=croot)
check("same-as-of primary/fallback disagreement is structured, suspect, and unusable",
      disagree["usable"] is False and disagree["health"] == "suspect"
      and disagree["disagreement"]["kind"] == "provider_disagreement"
      and [p["provider_priority"] for p in disagree["disagreement"]["providers"]] == [100, 200]
      and rows_for(disagree_run, "disagree-primary", "AAA")[0]["outcome"] == "suspect"
      and rows_for(disagree_run, "disagree-primary", "AAA")[0]["failure_kind"] == "provider_disagreement")
pit_cli = subprocess.run([
    sys.executable, os.path.join(m.SCRIPTS_DIR, "connector_vintages.py"),
    "--data-root", data, "--connectors-root", croot,
    "--series-id", "test.disagree", "--subject", "AAA", "--cutoff", "2026-05-03",
], capture_output=True, text=True)
check("PIT CLI returns nonzero for a structured usable:false disagreement",
      pit_cli.returncode == 2 and '"usable": false' in pit_cli.stdout)
json.dump({"as_of": "2026-05-02", "rows": [{"period": "2026-05-02", "value": 3.0}]},
          open(os.path.join(croot, "disagree-primary", "fixture.json"), "w"))
recovered_run = m.run(data, only="disagree-primary", connectors_root=croot,
                      now=datetime(2026, 5, 3, 1, tzinfo=timezone.utc))
recovered = m.read_point_in_time(data, "test.disagree", "AAA", "2026-05-03T02:00:00Z",
                                 connectors_root=croot)
check("a due non-force sweep refetches a suspect disagreement and accepts the next release",
      rows_for(recovered_run, "disagree-primary", "AAA")[0]["decision"] == "refetched"
      and recovered["usable"] is True and recovered["selected_connector_id"] == "disagree-primary"
      and recovered["payload"]["rows"][0]["value"] == 3.0)
shutil.rmtree(root)

root, croot, data = make_repo()
for cid, provider, priority, fallback, nested_provider in (
    ("nested-primary", "Primary", 100, None, "substantive-a"),
    ("nested-fallback", "Fallback", 200, "nested-primary", "substantive-b"),
):
    cdir = make_v2_connector(
        croot, cid, series_id="test.nested-disagreement", dataset_id=f"test.{cid}",
        provider=provider, priority=priority, fallback_for=fallback,
        fixture={"as_of": "2026-05-01", "rows": [
            {"period": "2026-05-01", "value": 1.0, "provider": nested_provider},
        ]},
    )
    manifest = json.load(open(os.path.join(cdir, "connector.json")))
    manifest["output_schema"]["rows"][0]["provider"] = "string"
    json.dump(manifest, open(os.path.join(cdir, "connector.json"), "w"))
m.run(data, only="nested-fallback", force=True, connectors_root=croot,
      now=datetime(2026, 5, 2, 9, tzinfo=timezone.utc))
m.run(data, only="nested-primary", force=True, connectors_root=croot,
      now=datetime(2026, 5, 2, 10, tzinfo=timezone.utc))
nested_disagreement = m.read_point_in_time(
    data, "test.nested-disagreement", "AAA", "2026-05-03", connectors_root=croot,
)
check("provider normalization strips provenance only at payload root, never substantive nested fields",
      nested_disagreement["usable"] is False
      and nested_disagreement["disagreement"]["kind"] == "provider_disagreement")
shutil.rmtree(root)

root, croot, data = make_repo()
for cid, provider, value, hour in (
    ("equal-fallback-a", "Fallback A", 1.0, 9),
    ("equal-fallback-b", "Fallback B", 2.0, 10),
):
    cdir = make_v2_connector(croot, cid, series_id="test.equal-fallback",
                             dataset_id=f"test.{cid}", provider=provider, priority=200,
                             fallback_for="absent-primary")
    raw = json.load(open(os.path.join(cdir, "connector.json")))
    payload = {"series": raw["series"], "as_of": "2026-05-01",
               "rows": [{"period": "2026-05-01", "value": value}]}
    fetched = {"payload": payload, "as_of": payload["as_of"], "sidecar": {
        "provider": raw["provider"], "source_type": raw["source_type"], "tier": raw["tier"],
        "license": raw["license"], "licensing": raw["licensing"], "connector_id": raw["id"],
        "dataset_id": raw["dataset_id"], "series_id": raw["series_id"],
        "schema_version": raw["schema_version"], "as_of": payload["as_of"],
        "source_url": "https://example.test/source", "published": payload["as_of"],
    }}
    m.publish_validated(raw, "AAA", data, fetched,
                        datetime(2026, 5, 2, hour, tzinfo=timezone.utc),
                        connector_hash="a" * 64, commit="test-commit")
equal_fallback = m.read_point_in_time(data, "test.equal-fallback", "AAA", "2026-05-03",
                                      manifests=[])
check("persisted equal-priority fallbacks fail closed even if new discovery would reject the topology",
      equal_fallback["usable"] is False and equal_fallback["health"] == "suspect"
      and equal_fallback["disagreement"]["kind"] == "provider_configuration")
shutil.rmtree(root)

# 19. Manual files use the same v2 seal, and append-only rules scan all history rather than only current.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-manual", series_id="test.manual", stub=STUB_MANUAL_V2)
man = json.load(open(os.path.join(d, "connector.json"))); man.update({
    "manual": True, "manual_ingest": {"file_arg": "--from-file"}, "acquisition": "manual",
})
json.dump(man, open(os.path.join(d, "connector.json"), "w"))
source = os.path.join(root, "manual.json")
json.dump({"as_of": "2026-06-01", "rows": [{"period": "2026-06-01", "value": 3.0}]}, open(source, "w"))
manual_events = []
real_manual_fetch = m.run_fetch_staged
real_completion_clock = m._retrieval_completed_at
def delayed_manual_fetch(*args, **kwargs):
    manual_events.append("fetch_started")
    result = real_manual_fetch(*args, **kwargs)
    manual_events.append("fetch_returned")
    return result
def deterministic_manual_completion(*_args, **_kwargs):
    manual_events.append("completion_clock")
    return datetime(2026, 6, 2, 2, tzinfo=timezone.utc)
m.run_fetch_staged = delayed_manual_fetch
m._retrieval_completed_at = deterministic_manual_completion
try:
    manual = m.run_manual_ingest(data, "v2-manual", "AAA", source, connectors_root=croot,
                                 now=datetime(2026, 6, 2, tzinfo=timezone.utc))["rows"][0]
finally:
    m.run_fetch_staged = real_manual_fetch
    m._retrieval_completed_at = real_completion_clock
manual_mid_ingest_pit = m.read_point_in_time(
    data, "test.manual", "AAA", "2026-06-02T01:00:00Z", connectors_root=croot,
)
manual_pit = m.read_point_in_time(data, "test.manual", "AAA", "2026-06-03", connectors_root=croot)
check("manual ingest is staged, sealed, projected, and PIT-readable",
      manual["decision"] == "manual_ingested" and manual["publication_outcome"] == "published"
      and manual_pit["usable"] is True and manual_pit["payload"]["rows"][0]["value"] == 3.0)
check("manual retrieval time is captured after acquisition, never at its earlier decision start",
      manual_events == ["fetch_started", "fetch_returned", "completion_clock"]
      and manual["sweep_started_at"] == "2026-06-02T00:00:00.000000Z"
      and manual["retrieved_at"] == "2026-06-02T02:00:00.000000Z"
      and manual_mid_ingest_pit is None)
shutil.rmtree(root)

root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-manual-code-drift", series_id="test.manual-code-drift", stub=STUB_MANUAL_V2)
manual_drift_manifest_path = os.path.join(d, "connector.json")
manual_drift_manifest = json.load(open(manual_drift_manifest_path)); manual_drift_manifest.update({
    "manual": True, "manual_ingest": {"file_arg": "--from-file"}, "acquisition": "manual",
})
json.dump(manual_drift_manifest, open(manual_drift_manifest_path, "w"))
manual_drift_source = os.path.join(root, "manual-drift.json")
json.dump({"as_of": "2026-06-01", "rows": [{"period": "2026-06-01", "value": 3.0}]},
          open(manual_drift_source, "w"))
manifest_before_fetch = open(manual_drift_manifest_path, "rb").read()
real_manual_drift_fetch = m.run_fetch_staged
def drift_manifest_after_manual_fetch(*args, **kwargs):
    result = real_manual_drift_fetch(*args, **kwargs)
    open(manual_drift_manifest_path, "ab").write(b"\n")
    return result
m.run_fetch_staged = drift_manifest_after_manual_fetch
try:
    manual_code_drift = m.run_manual_ingest(
        data, "v2-manual-code-drift", "AAA", manual_drift_source, connectors_root=croot,
        now=datetime(2026, 6, 2, tzinfo=timezone.utc),
    )["rows"][0]
finally:
    m.run_fetch_staged = real_manual_drift_fetch
    open(manual_drift_manifest_path, "wb").write(manifest_before_fetch)
manual_drift_paths = m.connector_storage_paths(data, manual_drift_manifest, "AAA")
check("manual acquisition re-attests its manifest after staging and rejects in-flight drift",
      manual_code_drift["failure_kind"] == "unreproducible_code"
      and manual_code_drift["outcome"] == "quarantined"
      and "connector fingerprint" in manual_code_drift["message"]
      and not os.path.exists(manual_drift_paths["current"])
      and not os.path.exists(manual_drift_paths["vintages"]))
shutil.rmtree(root)

root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-append", series_id="test.append")
man = json.load(open(os.path.join(d, "connector.json"))); man["release"]["revision_policy"] = "append_only"
json.dump(man, open(os.path.join(d, "connector.json"), "w"))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 1, 10, tzinfo=timezone.utc))
json.dump({"as_of": "2026-01-10", "rows": [{"period": "2026-01-10", "value": 2.0}]}, open(os.path.join(d, "fixture.json"), "w"))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 1, 11, tzinfo=timezone.utc))
json.dump({"as_of": "2026-01-09", "rows": [{"period": "2026-01-09", "value": 9.0}]}, open(os.path.join(d, "fixture.json"), "w"))
append_rewrite = rows_for(m.run(data, force=True, connectors_root=croot,
                                now=datetime(2026, 1, 12, tzinfo=timezone.utc)), "v2-append", "AAA")[0]
check("append-only rewrite of a non-current historical as_of is quarantined",
      append_rewrite["failure_kind"] == "publish_error" and append_rewrite["outcome"] == "quarantined")
shutil.rmtree(root)

# 20. Projection failures are recoverable without a refetch; corrupt current never resets history.
root, croot, data = make_repo()
d = make_v2_connector(
    croot, "v2-projection", series_id="test.projection",
    fixture={"as_of": "2026-07-01", "rows": [{"period": "2026-07-01", "value": 1.0}]},
)
real_projection = m.materialize_projection
def fail_projection(*_args, **_kwargs):
    raise OSError("simulated projection failure")
m.materialize_projection = fail_projection
try:
    projected = rows_for(m.run(data, force=True, connectors_root=croot,
                               now=datetime(2026, 7, 1, tzinfo=timezone.utc)), "v2-projection", "AAA")[0]
finally:
    m.materialize_projection = real_projection
# Prove the recovery path does not invoke the unchanged fetcher.
real_staged_fetch = m.run_fetch_staged
def forbidden_fetch(*_args, **_kwargs):
    raise AssertionError("projection recovery must not invoke the fetcher")
m.run_fetch_staged = forbidden_fetch
try:
    recovered = rows_for(m.run(data, connectors_root=croot,
                               now=datetime(2026, 7, 1, 12, tzinfo=timezone.utc)), "v2-projection", "AAA")[0]
finally:
    m.run_fetch_staged = real_staged_fetch
check("projection failure quarantines, then next sweep reprojects committed current without fetching",
      projected["outcome"] == "quarantined" and projected["failure_kind"] == "projection_error"
      and recovered["decision"] == "reprojected" and recovered["outcome"] == "current")
valid, _ = m.discover(croot); current_path = m.connector_storage_paths(data, valid[0][1], "AAA")["current"]
open(current_path, "w").write("{")
corrupt_current = rows_for(m.run(data, force=True, connectors_root=croot,
                                 now=datetime(2026, 7, 3, tzinfo=timezone.utc)), "v2-projection", "AAA")[0]
check("corrupt canonical current cannot reset committed history",
      corrupt_current["failure_kind"] == "current_integrity" and corrupt_current["outcome"] == "quarantined")
shutil.rmtree(root)

root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-current-tamper", series_id="test.current-tamper")
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 7, 4, tzinfo=timezone.utc))
valid, _ = m.discover(croot); man = valid[0][1]
current_path = m.connector_storage_paths(data, man, "AAA")["current"]
current = json.load(open(current_path))
legacy_path = os.path.join(data, current["legacy_path"])
os.unlink(legacy_path); os.unlink(legacy_path + ".source.json")
current["blob_path"] = os.path.relpath(os.path.join(data, "attacker-selected.json"), data)
current["provenance"] = {"provider": "attacker"}
json.dump(current, open(current_path, "w"))
tampered_current = rows_for(m.run(data, connectors_root=croot,
                                  now=datetime(2026, 7, 5, tzinfo=timezone.utc)), "v2-current-tamper", "AAA")[0]
check("tampered current is quarantined before it can reproject attacker-selected bytes",
      tampered_current["failure_kind"] == "current_integrity" and tampered_current["outcome"] == "quarantined"
      and not os.path.exists(legacy_path))
shutil.rmtree(root)

for failure_point in ("blob", "vintage", "current"):
    root, croot, data = make_repo()
    d = make_v2_connector(croot, f"v2-partial-{failure_point}", series_id=f"test.partial-{failure_point}")
    json.dump({"as_of": "2026-07-05", "rows": [{"period": "2026-07-05", "value": 1.0}]},
              open(os.path.join(d, "fixture.json"), "w"))
    valid, _ = m.discover(croot); man = valid[0][1]
    paths = m.connector_storage_paths(data, man, "AAA")
    real_once, real_atomic = m._write_once, m._atomic_write
    def fail_once(path, content, point=failure_point):
        if (point == "blob" and f"{os.sep}blobs{os.sep}" in path) or (point == "vintage" and f"{os.sep}vintages{os.sep}" in path):
            raise OSError(f"simulated {point} publication failure")
        return real_once(path, content)
    def fail_atomic(path, content, point=failure_point):
        if point == "current" and path == paths["current"]:
            raise OSError("simulated first current publication failure")
        return real_atomic(path, content)
    m._write_once, m._atomic_write = fail_once, fail_atomic
    try:
        first = rows_for(m.run(data, force=True, connectors_root=croot,
                               now=datetime(2026, 7, 6, tzinfo=timezone.utc)), man["id"], "AAA")[0]
    finally:
        m._write_once, m._atomic_write = real_once, real_atomic
    before_retry = m.read_point_in_time(data, man["series_id"], "AAA", "2026-07-06T23:59:59Z", connectors_root=croot)
    second = rows_for(m.run(data, force=True, connectors_root=croot,
                            now=datetime(2026, 7, 7, tzinfo=timezone.utc)), man["id"], "AAA")[0]
    after_retry = m.read_point_in_time(data, man["series_id"], "AAA", "2026-07-08", connectors_root=croot)
    if failure_point == "current":
        check("expired first-publish marker-before-current partial recovers and refreshes on retry",
              first["failure_kind"] == "publish_error" and before_retry is None
              and second["decision"] == "refetched" and second["outcome"] in {"current", "no_new_release"}
              and after_retry is not None and after_retry["usable"] is True)
    else:
        check(f"{failure_point} publication failure leaves no PIT-visible partial and recovers on retry",
              first["failure_kind"] == "publish_error" and before_retry is None
              and second["decision"] == "refetched" and after_retry is not None and after_retry["usable"] is True)
    shutil.rmtree(root)

# 21. Pre-protocol pointer shapes fail closed, and the singleton is a held
# kernel lease rather than a reclaimable pathname/PID claim.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-legacy-pointer", series_id="test.legacy-pointer")
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 7, 10, tzinfo=timezone.utc))
valid, _ = m.discover(croot); current_path = m.connector_storage_paths(data, valid[0][1], "AAA")["current"]
current = json.load(open(current_path)); current["committed_vintages"] = [current["committed_head"]]
for key in ("committed_head", "committed_count", "commit_protocol_version", "commit_receipt_path"):
    current.pop(key, None)
json.dump(current, open(current_path, "w"))
legacy_pointer = m.read_point_in_time(data, "test.legacy-pointer", "AAA", "2026-07-11", connectors_root=croot)
check("non-protocol v2 pointer is not PIT-readable",
      legacy_pointer is None)
lock_dir = tempfile.mkdtemp(prefix="connector-kernel-lock-")
os.chmod(lock_dir, 0o700)
first_lock = m.acquire_lock(lock_dir)
second_lock = m.acquire_lock(lock_dir)
check("a held kernel connector lease excludes a second runner without PID or age probing",
      isinstance(first_lock, int) and second_lock is None)
if first_lock is not None:
    os.close(first_lock)
reacquired_lock = m.acquire_lock(lock_dir)
check("closing the held connector lease makes it immediately reacquirable after crash/exit",
      isinstance(reacquired_lock, int))
if reacquired_lock is not None:
    os.close(reacquired_lock)
lock_path = os.path.join(lock_dir, "run-connectors.flock")
os.unlink(lock_path)
symlink_target = os.path.join(lock_dir, "target")
open(symlink_target, "w").close()
os.symlink(symlink_target, lock_path)
check("the connector lease refuses a symlinked lock file", m.acquire_lock(lock_dir) is None)

# The production CLI takes the repository-mutation lease before importing any
# repository-owned publisher module. The helper uses the same Git-path lock as
# deploy.sh, and a second process must fail closed while the first descriptor is held.
repo_lock_root = tempfile.mkdtemp()
subprocess.run(["git", "init", "-q", repo_lock_root], check=True)
first_repo_lock = m._acquire_repo_mutation_lock_early(repo_lock_root)
second_repo_lock = m._acquire_repo_mutation_lock_early(repo_lock_root)
check("repository mutation lock is exclusive before publisher imports",
      first_repo_lock is not None and second_repo_lock is None)
if first_repo_lock is not None:
    os.close(first_repo_lock)
reacquired_repo_lock = m._acquire_repo_mutation_lock_early(repo_lock_root)
check("repository mutation lock is released with its descriptor", reacquired_repo_lock is not None)
if reacquired_repo_lock is not None:
    os.close(reacquired_repo_lock)

# The production bootstrap must preserve scoped/full semantics before any
# repository module import. Exercise a copied CLI in a real temporary Git repo.
bootstrap_cli = os.path.join(repo_lock_root, ".claude", "tools", "run_connectors.py")
os.makedirs(os.path.dirname(bootstrap_cli), exist_ok=True)
shutil.copyfile(os.path.join(HERE, "run_connectors.py"), bootstrap_cli)
held_bootstrap_lock = m._acquire_repo_mutation_lock_early(repo_lock_root)
scoped_bootstrap = subprocess.run(
    [sys.executable, bootstrap_cli, "--subject", "AAA"], capture_output=True, text=True,
)
full_bootstrap = subprocess.run(
    [sys.executable, bootstrap_cli], capture_output=True, text=True,
)
check("bootstrap lock contention is retryable for a scoped refresh but skippable for a full sweep",
      held_bootstrap_lock is not None
      and scoped_bootstrap.returncode == m.SCOPED_LOCK_BUSY_EXIT
      and full_bootstrap.returncode == 0
      and "retry this scoped sweep" in scoped_bootstrap.stdout)
if held_bootstrap_lock is not None:
    os.close(held_bootstrap_lock)
shutil.rmtree(repo_lock_root)
shutil.rmtree(lock_dir)
shutil.rmtree(root)

# 22. Strict v2 contract mutations, licensing, future dates, and dated-history ordering fail closed.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-contract-mutations")
base = json.load(open(os.path.join(d, "connector.json")))
for label, mutate in (
    ("unknown top-level field", lambda x: x.update({"surprise": True})),
    ("string manifest_version", lambda x: x.update({"manifest_version": "2"})),
    ("string provider_priority", lambda x: x.update({"provider_priority": "100"})),
    ("too-trusted tier", lambda x: x.update({"tier": 1})),
    ("unavailable licensing", lambda x: x["licensing"].update({"use": "unavailable"})),
    ("credential-bearing licensing terms URL",
     lambda x: x["licensing"].update({"terms_url": "https://user:secret@example.test/terms"})),
    ("credential name without CONNECTOR_* prefix", lambda x: x.update({"credential_env": ["VENDOR_API_KEY"]})),
    ("invalid seasonal release months", lambda x: x["release"].update({"active_months": [0, 12, 12]})),
    ("unbounded connector attempt timeout", lambda x: x.update({"attempt_timeout_seconds": 301})),
    ("unknown minimum_history field", lambda x: x["minimum_history"].update({"surprise": True})),
    ("unsupported compact-schema token", lambda x: x["output_schema"].update({"bad": "number"})),
    ("multi-item compact-schema array", lambda x: x["output_schema"].update({"bad": ["string", "int"]})),
    ("output path dot segment",
     lambda x: x.update({"output_path": "data/<SUBJECT>/external/provider/./series_<as_of>.json"})),
    ("output path parent segment",
     lambda x: x.update({"output_path": "data/<SUBJECT>/external/provider/../series_<as_of>.json"})),
    ("output path backslash alias",
     lambda x: x.update({"output_path": r"data/<SUBJECT>/external/provider\\alias/series_<as_of>.json"})),
    ("output path encoded separator",
     lambda x: x.update({"output_path": "data/<SUBJECT>/external/provider%2falias/series_<as_of>.json"})),
    ("output path encoded dot alias",
     lambda x: x.update({"output_path": "data/<SUBJECT>/external/provider/%2e/series_<as_of>.json"})),
    ("output path case-only alias",
     lambda x: x.update({"output_path": "data/<SUBJECT>/external/Provider/series_<as_of>.json"})),
):
    candidate = json.loads(json.dumps(base)); mutate(candidate)
    check(f"v2 rejects {label}", bool(m.validate_manifest(candidate["id"], d, candidate)))
projection_a = json.loads(json.dumps(base))
projection_a.update({"id": "projection-a", "dataset_id": "projection.a", "series_id": "projection.a",
                     "output_path": "data/<SUBJECT>/external/provider/series_<as_of>.json"})
projection_dot = json.loads(json.dumps(projection_a))
projection_dot.update({"id": "projection-dot", "dataset_id": "projection.dot", "series_id": "projection.dot",
                       "output_path": "data/<SUBJECT>/external/provider/./series_<as_of>.json"})
projection_case = json.loads(json.dumps(projection_a))
projection_case.update({"id": "projection-case", "dataset_id": "projection.case", "series_id": "projection.case",
                        "output_path": "data/<SUBJECT>/external/Provider/series_<as_of>.json"})
dot_collision_errors = coverage_errors([projection_a, projection_dot])
case_collision_errors = coverage_errors([projection_a, projection_case])
check("projection ownership normalizes dot and case aliases from unchecked callers",
      all(any("projection collision" in error for error in errors)
          for errors in dot_collision_errors.values()) and len(dot_collision_errors) == 2
      and all(any("projection collision" in error for error in errors)
              for errors in case_collision_errors.values()) and len(case_collision_errors) == 2)
nullable_enum = json.loads(json.dumps(base))
nullable_enum["output_schema"]["optional_state"] = "enum:on|off|null"
check("compact-schema enums may explicitly allow null", not m.validate_manifest(base["id"], d, nullable_enum))
bounded_attempt = json.loads(json.dumps(base)); bounded_attempt["attempt_timeout_seconds"] = 180
check("a reviewed connector may declare a bounded longer attempt",
      not m.validate_manifest(base["id"], d, bounded_attempt))
payload = {"series": base["series"], "as_of": "2099-01-01",
           "rows": [{"period": "2099-01-01", "value": 1.0}]}
sidecar = {"provider": base["provider"], "source_type": base["source_type"], "tier": base["tier"],
           "license": base["license"], "licensing": base["licensing"], "connector_id": base["id"],
           "dataset_id": base["dataset_id"], "series_id": base["series_id"],
           "schema_version": base["schema_version"], "as_of": payload["as_of"],
           "source_url": "https://example.test/source"}
future_defects = m.validate_staged_output(base, "AAA", payload, sidecar, payload["as_of"],
                                           retrieved_at=datetime(2026, 8, 9, tzinfo=timezone.utc))
check("future as_of is rejected in the declared release timezone", any("after retrieval date" in e for e in future_defects))
sidecar["as_of"] = payload["as_of"] = "2026-08-01"; payload["rows"] = [
    {"period": "2026-07-01", "value": 1.0}, {"period": "2026-07-03", "value": 2.0},
    {"period": "2026-07-02", "value": 3.0},
]
history_defects = m.validate_staged_output(base, "AAA", payload, sidecar, payload["as_of"],
                                            retrieved_at=datetime(2026, 8, 9, tzinfo=timezone.utc))
check("dated history rows must be monotonic", any("not monotonic" in e for e in history_defects))
sidecar["license"] = "different terms"
license_defects = m.validate_staged_output(base, "AAA", payload, sidecar, payload["as_of"],
                                            retrieved_at=datetime(2026, 8, 9, tzinfo=timezone.utc))
check("sidecar licensing identity must exactly match the manifest", any("sidecar license" in e for e in license_defects))
shutil.rmtree(root)

# 23. Cadence-aware release windows use the declared timezone, lag, and grace.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-release-clock")
clock_man = json.load(open(os.path.join(d, "connector.json")))
clock_man["release"].update({"cadence": "weekly", "timezone": "America/New_York",
                              "expected_lag_days": 3, "grace_days": 9})
due_before = m.release_is_due(clock_man, datetime(2026, 1, 16, 4, 59, tzinfo=timezone.utc), date(2026, 1, 6))[0]
due_at, grace_at = m.release_is_due(clock_man, datetime(2026, 1, 16, 5, 0, tzinfo=timezone.utc), date(2026, 1, 6))
_, grace_after = m.release_is_due(clock_man, datetime(2026, 1, 26, 5, 0, tzinfo=timezone.utc), date(2026, 1, 6))
check("weekly release becomes due at local next-period + lag, then expires after grace",
      not due_before and due_at and grace_at and not grace_after)
clock_man["release"].update({"cadence": "monthly", "timezone": "UTC", "expected_lag_days": 25,
                              "grace_days": 20})
monthly_before = m.release_is_due(clock_man, datetime(2026, 3, 24, 23, 59, tzinfo=timezone.utc), date(2026, 1, 31))[0]
monthly_at = m.release_is_due(clock_man, datetime(2026, 3, 25, 0, 0, tzinfo=timezone.utc), date(2026, 1, 31))[0]
check("monthly cadence advances calendar-aware before adding lag", not monthly_before and monthly_at)
clock_man["release"].update({
    "cadence": "weekly", "timezone": "America/New_York", "expected_lag_days": 1,
    "grace_days": 6, "active_months": [4, 5, 6, 7, 8, 9, 10, 11],
})
offseason_due = m.release_is_due(
    clock_man, datetime(2027, 2, 1, 12, 0, tzinfo=timezone.utc), date(2026, 11, 30),
)[0]
opening_due, opening_grace = m.release_is_due(
    clock_man, datetime(2027, 4, 12, 4, 0, tzinfo=timezone.utc), date(2026, 11, 30),
)
_, after_opening_grace = m.release_is_due(
    clock_man, datetime(2027, 4, 13, 4, 0, tzinfo=timezone.utc), date(2026, 11, 30),
)
check("seasonal weekly cadence stays quiet off-season and becomes due at the next active release",
      not offseason_due and opening_due and opening_grace and not after_opening_grace)
shutil.rmtree(root)

# 24. Every accepted unchanged pull advances code/retrieval identity; as_of can never roll backward.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-unchanged-repair", series_id="test.unchanged-repair")
json.dump({"as_of": "2026-03-31", "rows": [{"period": "2026-03-31", "value": 1.0}]},
          open(os.path.join(d, "fixture.json"), "w"))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 4, 1, tzinfo=timezone.utc))
valid, _ = m.discover(croot); man = valid[0][1]
current_path = m.connector_storage_paths(data, man, "AAA")["current"]
first_current = json.load(open(current_path))
with open(os.path.join(d, "fetch.py"), "a") as fh: fh.write("\n# repaired transform\n")
same = rows_for(m.run(data, force=True, connectors_root=croot,
                      now=datetime(2026, 4, 2, tzinfo=timezone.utc)), man["id"], "AAA")[0]
second_current = json.load(open(current_path))
early = m.read_point_in_time(data, man["series_id"], "AAA", "2026-04-01T12:00:00Z", connectors_root=croot)
late = m.read_point_in_time(data, man["series_id"], "AAA", "2026-04-02T12:00:00Z", connectors_root=croot)
check("same-payload post-repair pull seals a new vintage/fingerprint and remains PIT-trackable",
      same["publication_outcome"] == "unchanged" and first_current["connector_fingerprint"] != second_current["connector_fingerprint"]
      and second_current["committed_count"] == 2
      and early["vintage"]["connector_fingerprint"] == first_current["connector_fingerprint"]
      and late["vintage"]["connector_fingerprint"] == second_current["connector_fingerprint"])
json.dump({"as_of": "2026-01-01", "rows": [{"period": "2026-01-01", "value": 9.0}]},
          open(os.path.join(d, "fixture.json"), "w"))
regressed = rows_for(m.run(data, force=True, connectors_root=croot,
                           now=datetime(2026, 4, 3, tzinfo=timezone.utc)), man["id"], "AAA")[0]
check("provider as_of regression is quarantined without moving current backward",
      regressed["failure_kind"] == "publish_error" and json.load(open(current_path))["as_of"] == second_current["as_of"])
shutil.rmtree(root)

# 25. Manual transform drift beats projection repair and requires an explicit re-ingest.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-manual-drift", stub=STUB_MANUAL_V2)
manual_man = json.load(open(os.path.join(d, "connector.json")))
manual_man.update({"manual": True, "acquisition": "manual", "manual_ingest": {"file_arg": "--from-file"}})
manual_man["licensing"]["access"] = "restricted"; manual_man["licensing"]["use"] = "entitlement_required"
json.dump(manual_man, open(os.path.join(d, "connector.json"), "w"))
manual_source = os.path.join(root, "manual.json")
json.dump({"as_of": "2026-04-01", "rows": [{"period": "2026-04-01", "value": 1.0}]}, open(manual_source, "w"))
m.run_manual_ingest(data, "v2-manual-drift", "AAA", manual_source, connectors_root=croot,
                    now=datetime(2026, 4, 2, tzinfo=timezone.utc))
valid, _ = m.discover(croot); manual_current = json.load(open(m.connector_storage_paths(data, valid[0][1], "AAA")["current"]))
manual_projection = m._legacy_path(valid[0][1], data, "AAA", manual_current["as_of"])
os.unlink(manual_projection); os.unlink(manual_projection + ".source.json")
with open(os.path.join(d, "fetch.py"), "a") as fh: fh.write("\n# contract-changing parser edit\n")
manual_drift = rows_for(m.run(data, connectors_root=croot,
                              now=datetime(2026, 4, 3, tzinfo=timezone.utc)), "v2-manual-drift", "AAA")[0]
check("manual transform drift is quarantined before a missing projection can be re-created",
      manual_drift["failure_kind"] == "manual_reingest_required" and manual_drift["outcome"] == "quarantined"
      and not os.path.exists(manual_projection))
shutil.rmtree(root)

# 26. Linked receipts reject rollback, fork, head tamper, and older-history tamper.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-chain", series_id="test.chain")
json.dump({"as_of": "2026-04-30", "rows": [{"period": "2026-04-30", "value": 1.0}]},
          open(os.path.join(d, "fixture.json"), "w"))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 5, 1, tzinfo=timezone.utc))
valid, _ = m.discover(croot); man = valid[0][1]; current_path = m.connector_storage_paths(data, man, "AAA")["current"]
first_current_bytes = open(current_path, "rb").read()
json.dump({"as_of": "2026-05-01", "rows": [{"period": "2026-05-01", "value": 2.0}]}, open(os.path.join(d, "fixture.json"), "w"))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 5, 2, tzinfo=timezone.utc))
current_bytes = open(current_path, "rb").read(); canonical_current = json.loads(current_bytes)
check("an untampered ordered receipt chain is PIT-usable before negative mutations",
      m.read_point_in_time(data, man["series_id"], "AAA", "2026-05-03", connectors_root=croot)["usable"] is True)
open(current_path, "wb").write(first_current_bytes)
check("tail rollback cannot remain current or PIT-usable",
      m.read_point_in_time(data, man["series_id"], "AAA", "2026-05-03", connectors_root=croot) is None)
open(current_path, "wb").write(current_bytes)

marker_path = m._commit_marker_path(data, canonical_current)
marker_bytes = open(marker_path, "rb").read(); marker = json.loads(marker_bytes)
marker["committed_head"]["chain_sha256"] = "f" * 64
json.dump(marker, open(marker_path, "w"))
check("same-sequence marker fork fails closed",
      m.read_point_in_time(data, man["series_id"], "AAA", "2026-05-03", connectors_root=croot) is None)
open(marker_path, "wb").write(marker_bytes)

receipt_path = os.path.join(data, canonical_current["commit_receipt_path"])
receipt_bytes = open(receipt_path, "rb").read(); receipt = json.loads(receipt_bytes)
prior_head = receipt["prior_head"]
receipt["prior_head"]["chain_sha256"] = "e" * 64
json.dump(receipt, open(receipt_path, "w"))
check("tampered head receipt cannot remain current or PIT-usable",
      m.read_point_in_time(data, man["series_id"], "AAA", "2026-05-03", connectors_root=croot) is None)
open(receipt_path, "wb").write(receipt_bytes)

older_path = os.path.join(data, prior_head["path"])
older_bytes = open(older_path, "rb").read(); older = json.loads(older_bytes); older["provider"] = "tampered"
json.dump(older, open(older_path, "w"))
check("tampered older vintage invalidates the whole committed chain",
      m.read_point_in_time(data, man["series_id"], "AAA", "2026-05-03", connectors_root=croot) is None)
open(older_path, "wb").write(older_bytes)
shutil.rmtree(root)

# 27. Frozen release eligibility lets a current fallback replace a stalled primary without manifest-time drift.
root, croot, data = make_repo()
pdir = make_v2_connector(croot, "eligible-primary", series_id="test.eligibility", dataset_id="test.eligibility-p",
                         provider="Primary", fixture={"as_of": "2026-01-01", "rows": [{"period": "2026-01-01", "value": 1.0}]})
fdir = make_v2_connector(croot, "eligible-fallback", series_id="test.eligibility", dataset_id="test.eligibility-f",
                         provider="Fallback", priority=200, fallback_for="eligible-primary",
                         fixture={"as_of": "2026-01-10", "rows": [{"period": "2026-01-10", "value": 2.0}]})
m.run(data, only="eligible-primary", force=True, connectors_root=croot, now=datetime(2026, 1, 2, tzinfo=timezone.utc))
m.run(data, only="eligible-fallback", force=True, connectors_root=croot, now=datetime(2026, 1, 11, tzinfo=timezone.utc))
inside = m.read_point_in_time(data, "test.eligibility", "AAA", "2026-01-11T00:00:00Z", connectors_root=croot)
after = m.read_point_in_time(data, "test.eligibility", "AAA", "2026-01-15T00:00:00Z", connectors_root=croot)
primary_manifest = json.load(open(os.path.join(pdir, "connector.json")))
primary_manifest["provider_priority"] = 999; primary_manifest["release"]["cadence"] = "monthly"
json.dump(primary_manifest, open(os.path.join(pdir, "connector.json"), "w"))
after_manifest_change = m.read_point_in_time(data, "test.eligibility", "AAA", "2026-01-15T00:00:00Z", connectors_root=croot)
check("primary wins while eligible; current fallback wins after primary expiry using frozen contracts",
      inside["selected_connector_id"] == "eligible-primary" and after["selected_connector_id"] == "eligible-fallback"
      and after_manifest_change["selected_connector_id"] == "eligible-fallback")
shutil.rmtree(root)

# Canonical staging boundary: report-method transfer is allowed in code, but
# WILTW identity/assertions cannot become a GOLD vintage or readiness input.
root, croot, data = make_repo()
os.makedirs(os.path.join(data, "GOLD"))
for cid, note in (
    ("gold-methodology-stage", "What I Learned This Week — REPORT_DERIVED_GOLD_ASSERTION=5597"),
    ("gold-lawful-stage", "Original-provider observation: official reserve holdings"),
):
    cdir = make_v2_connector(
        croot, cid, series_id=f"test.{cid}", dataset_id=f"test.{cid}",
        provider="Official Provider",
        fixture={"as_of": "2026-08-01", "rows": [
            {"period": "2026-08-01", "value": 1.0, "source_note": note},
        ]},
    )
    manifest = json.load(open(os.path.join(cdir, "connector.json")))
    manifest["subjects"] = ["GOLD"]
    manifest["output_schema"]["rows"][0]["source_note"] = "string"
    json.dump(manifest, open(os.path.join(cdir, "connector.json"), "w"))
blocked_stage = rows_for(
    m.run(data, only="gold-methodology-stage", force=True, connectors_root=croot,
          now=datetime(2026, 8, 2, tzinfo=timezone.utc)),
    "gold-methodology-stage", "GOLD",
)[0]
blocked_manifest = json.load(open(os.path.join(croot, "gold-methodology-stage", "connector.json")))
blocked_paths = m.connector_storage_paths(data, blocked_manifest, "GOLD")
check("nested WILTW/report-derived GOLD assertion fails canonical staging and publishes no current",
      blocked_stage["failure_kind"] == "invalid_provenance"
      and blocked_stage["outcome"] == "schema_failed"
      and "methodology-only WILTW" in blocked_stage["message"]
      and "payload.rows[0].source_note" in blocked_stage["message"]
      and not os.path.exists(blocked_paths["current"]))

# Sidecar strings are recursively guarded too, not only top-level source_url.
lawful_manifest = json.load(open(os.path.join(croot, "gold-lawful-stage", "connector.json")))
lawful_payload = {"series": lawful_manifest["series"], "as_of": "2026-08-01", "rows": [
    {"period": "2026-08-01", "value": 1.0,
     "source_note": "Original-provider observation: official reserve holdings"},
]}
lawful_sidecar = {
    "provider": lawful_manifest["provider"], "source_type": lawful_manifest["source_type"],
    "tier": lawful_manifest["tier"], "license": lawful_manifest["license"],
    "licensing": lawful_manifest["licensing"], "connector_id": lawful_manifest["id"],
    "dataset_id": lawful_manifest["dataset_id"], "series_id": lawful_manifest["series_id"],
    "schema_version": lawful_manifest["schema_version"], "as_of": "2026-08-01",
    "source_url": "https://example.test/source",
    "audit": {"document_title": "What I Learned This Week — renamed source"},
}
nested_sidecar_defects = m.validate_staged_output(
    lawful_manifest, "GOLD", lawful_payload, lawful_sidecar, "2026-08-01",
)
check("nested provenance strings cannot hide WILTW identity",
      any("methodology-only WILTW" in defect for defect in nested_sidecar_defects))
lawful_stage = rows_for(
    m.run(data, only="gold-lawful-stage", force=True, connectors_root=croot,
          now=datetime(2026, 8, 2, tzinfo=timezone.utc)),
    "gold-lawful-stage", "GOLD",
)[0]
lawful_pit = m.read_point_in_time(
    data, lawful_manifest["series_id"], "GOLD", "2026-08-03", connectors_root=croot,
)
check("lawful original-provider GOLD data still publishes and is readiness/PIT-usable",
      lawful_stage["publication_outcome"] == "published"
      and lawful_pit is not None and lawful_pit["usable"] is True
      and lawful_pit["payload"]["rows"][0]["source_note"].startswith("Original-provider"))
shutil.rmtree(root)

# 28. Automatic URL policy covers sidecar + payload links and the redirect boundary is not injectable.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-url-policy")
url_man = json.load(open(os.path.join(d, "connector.json")))
payload = {"series": url_man["series"], "as_of": "2026-08-01",
           "rows": [{"period": "2026-08-01", "value": 1.0}]}
sidecar = {"provider": url_man["provider"], "source_type": url_man["source_type"], "tier": url_man["tier"],
           "license": url_man["license"], "licensing": url_man["licensing"], "connector_id": url_man["id"],
           "dataset_id": url_man["dataset_id"], "series_id": url_man["series_id"],
           "schema_version": url_man["schema_version"], "as_of": payload["as_of"],
           "source_url": "http://example.test/downgrade"}
url_defects = m.validate_staged_output(url_man, "AAA", payload, sidecar, payload["as_of"])
check("automatic provenance rejects HTTP downgrade even on an allowlisted host",
      any("absolute HTTPS" in defect for defect in url_defects))
sidecar["source_url"] = "https://example.test:8443/source"
provenance_port_defects = m.validate_staged_output(url_man, "AAA", payload, sidecar, payload["as_of"])
check("automatic provenance rejects a nonstandard HTTPS origin port",
      any("standard HTTPS origin port" in defect for defect in provenance_port_defects))
url_man["output_schema"]["source_url"] = "string"; payload["source_url"] = "https://evil.example.test/payload"
sidecar["source_url"] = "https://example.test/source"
payload_url_defects = m.validate_staged_output(url_man, "AAA", payload, sidecar, payload["as_of"])
check("top-level payload URLs obey the same HTTPS/allowlist and provenance-set policy",
      any("outside host_allowlist" in defect for defect in payload_url_defects)
      and any("also appear" in defect for defect in payload_url_defects))
payload["source_url"] = "https://example.test:8443/payload"
sidecar["source_urls"] = [sidecar.pop("source_url"), payload["source_url"]]
payload_port_defects = m.validate_staged_output(url_man, "AAA", payload, sidecar, payload["as_of"])
check("top-level payload URLs reject a nonstandard HTTPS origin port",
      any("standard HTTPS origin port" in defect for defect in payload_port_defects))
for bad_host in ("localhost", "service.localhost", "service.local", "127.0.0.1", "::1"):
    candidate = json.loads(json.dumps(url_man)); candidate["host_allowlist"] = [bad_host]
    check(f"manifest rejects non-public host {bad_host}", bool(m.validate_manifest(candidate["id"], d, candidate)))

sys.path.insert(0, m.SCRIPTS_DIR)
import connector_http as http_policy
import connector_contract as contract_policy

# DNS aliases are judged by their complete A/AAAA answer, not by hostname
# syntax alone.  Keep this hermetic: getaddrinfo is a deterministic fixture.
real_getaddrinfo = contract_policy.socket.getaddrinfo
def dns_answer(*ips):
    answers = []
    for ip in ips:
        family = contract_policy.socket.AF_INET6 if ":" in ip else contract_policy.socket.AF_INET
        sockaddr = ((ip, 443, 0, 0) if family == contract_policy.socket.AF_INET6 else (ip, 443))
        answers.append((family, contract_policy.socket.SOCK_STREAM,
                        contract_policy.socket.IPPROTO_TCP, "", sockaddr))
    return answers
try:
    contract_policy.socket.getaddrinfo = lambda *_args, **_kwargs: dns_answer("8.8.8.8")
    public_dns = contract_policy.resolve_public_hostname("public-alias.example.test")
    contract_policy.socket.getaddrinfo = lambda *_args, **_kwargs: dns_answer("127.0.0.1")
    try:
        contract_policy.resolve_public_hostname("private-alias.example.test"); rejected_private_dns = False
    except ValueError:
        rejected_private_dns = True
    contract_policy.socket.getaddrinfo = lambda *_args, **_kwargs: dns_answer("8.8.8.8", "10.0.0.7")
    try:
        contract_policy.resolve_public_hostname("mixed-alias.example.test"); rejected_mixed_dns = False
    except ValueError:
        rejected_mixed_dns = True
    rejected_reserved_ipv6 = []
    for reserved_ipv6 in (
        "64:ff9b::7f00:1", "64:ff9b:1::7f00:1", "64:ff9b:1::a00:1", "2002:7f00:1::1",
        "::2", "::127.0.0.1", "fec0::1", "3fff::1", "4000::1", "5f00::1",
    ):
        contract_policy.socket.getaddrinfo = lambda *_args, _ip=reserved_ipv6, **_kwargs: dns_answer(_ip)
        try:
            contract_policy.resolve_public_hostname("reserved-v6.example.test")
            rejected_reserved_ipv6.append(False)
        except ValueError:
            rejected_reserved_ipv6.append(True)
finally:
    contract_policy.socket.getaddrinfo = real_getaddrinfo
check("DNS policy resolves A/AAAA and rejects both private aliases and mixed public/private answers",
      public_dns[0][4][0] == "8.8.8.8" and rejected_private_dns and rejected_mixed_dns)
check("DNS policy rejects runtime-lagged reserved/site-local IPv6 ranges",
      all(rejected_reserved_ipv6))
class _ReservedPeer:
    def __init__(self, address): self.address = address
    def getpeername(self): return (self.address, 443, 0, 0)
rejected_reserved_peers = []
for reserved_ipv6 in (
    "64:ff9b::7f00:1", "64:ff9b:1::7f00:1", "64:ff9b:1::a00:1", "2002:7f00:1::1",
    "::2", "::127.0.0.1", "fec0::1", "3fff::1", "4000::1", "5f00::1",
):
    try:
        http_policy._normalized_peer_ip(_ReservedPeer(reserved_ipv6))
        rejected_reserved_peers.append(False)
    except http_policy.URLPolicyError:
        rejected_reserved_peers.append(True)
check("connect-time peer policy matches DNS policy for reserved IPv6 ranges",
      all(rejected_reserved_peers))

# The remaining HTTP boundary tests use public fixture endpoints without live
# DNS.  Private/mixed aliases model the resolver rejecting the whole answer.
real_public_resolver = http_policy.resolve_public_hostname
resolution_calls = {}
def fake_public_resolver(host, port=443):
    resolution_calls[host] = resolution_calls.get(host, 0) + 1
    if host in {"private-alias.example.test", "mixed-alias.example.test"}:
        raise ValueError("fixture contains a non-global address")
    # If a vulnerable connection path re-resolves this host, its second answer
    # models a DNS rebind into loopback.  The pinned path must never ask twice.
    if host == "rebind.example.test" and resolution_calls[host] > 1:
        raise ValueError("fixture rebound to 127.0.0.1")
    return tuple(dns_answer("8.8.8.8"))
http_policy.resolve_public_hostname = fake_public_resolver

check("production HTTP helper exposes no caller-supplied opener bypass",
      "opener" not in __import__("inspect").signature(http_policy.open_allowed_https).parameters)
try:
    http_policy.require_allowed_https("http://example.test/downgrade", ["example.test"]); rejected_http = False
except http_policy.URLPolicyError:
    rejected_http = True
try:
    http_policy.require_allowed_https("https://example.test:8443/data", ["example.test"]); rejected_port = False
except http_policy.URLPolicyError:
    rejected_port = True
try:
    http_policy.AllowlistRedirectHandler(["example.test"]).redirect_request(
        None, None, 302, "redirect", {}, "https://evil.example.test/secret",
    ); rejected_redirect = False
except http_policy.URLPolicyError:
    rejected_redirect = True
check("HTTP helper rejects downgrade, nonstandard origin ports, and off-host redirect before follow",
      rejected_http and rejected_port and rejected_redirect)
private_redirect_request = http_policy.urllib.request.Request("https://api.example.test/start")
try:
    http_policy.AllowlistRedirectHandler(
        ["api.example.test", "private-alias.example.test"],
    ).redirect_request(
        private_redirect_request, None, 302, "redirect", {},
        "https://private-alias.example.test/internal",
    )
    rejected_private_redirect = False
except http_policy.URLPolicyError:
    rejected_private_redirect = True
check("an allowlisted redirect whose DNS aliases a non-global address is rejected before follow",
      rejected_private_redirect)
cross_host_request = http_policy.urllib.request.Request(
    "https://api.example.test/start",
    headers={
        "Authorization": "Bearer secret", "X-AUTH-TOKEN": "secret", "Cookie": "session=secret",
        "X-Custom-Token": "secret", "User-Agent": "fixture", "Accept": "application/json",
    },
)
cross_host_redirect = http_policy.AllowlistRedirectHandler(
    ["api.example.test", "download.example.test"],
).redirect_request(
    cross_host_request, None, 302, "redirect", {}, "https://download.example.test/file",
)
same_host_redirect = http_policy.AllowlistRedirectHandler(["api.example.test"]).redirect_request(
    cross_host_request, None, 302, "redirect", {}, "https://api.example.test/file",
)
check("allowed cross-host redirects strip credential headers while same-host redirects retain them",
      cross_host_redirect.get_header("Authorization") is None
      and cross_host_redirect.get_header("X-auth-token") is None
      and cross_host_redirect.get_header("Cookie") is None
      and cross_host_redirect.get_header("X-custom-token") is None
      and cross_host_redirect.get_header("User-agent") == "fixture"
      and cross_host_redirect.get_header("Accept") == "application/json"
      and same_host_redirect.get_header("Authorization") == "Bearer secret")
query_credential_request = http_policy.urllib.request.Request(
    "https://api.example.test/start?api_key=secret",
)
query_credential_handler = http_policy.AllowlistRedirectHandler(
    ["api.example.test", "download.example.test"],
    credential_query_keys=frozenset({"api_key"}),
)
try:
    query_credential_handler.redirect_request(
        query_credential_request, None, 302, "redirect", {},
        "https://download.example.test/file?api_key=secret",
    )
    rejected_cross_host_query_credential = False
except http_policy.URLPolicyError:
    rejected_cross_host_query_credential = True
renamed_query_rejected = False
renamed_path_rejected = False
for destination, label in (
    ("https://download.example.test/file?download=secret", "query"),
    ("https://download.example.test/file/secret", "path"),
):
    try:
        query_credential_handler.redirect_request(
            query_credential_request, None, 302, "redirect", {}, destination,
        )
    except http_policy.URLPolicyError:
        if label == "query":
            renamed_query_rejected = True
        else:
            renamed_path_rejected = True
same_host_query_credential = query_credential_handler.redirect_request(
    query_credential_request, None, 302, "redirect", {},
    "https://api.example.test/file?api_key=secret",
)
check("query credentials may survive only same-origin redirects",
      rejected_cross_host_query_credential
      and renamed_query_rejected and renamed_path_rejected
      and "api_key=secret" in same_host_query_credential.full_url)
class _RedirectedResponse:
    closed = False
    def geturl(self): return "https://evil.example.test/final"
    def close(self): self.closed = True
class _FakeOpener:
    def __init__(self, response): self.response = response
    def open(self, *_args, **_kwargs): return self.response
final_response = _RedirectedResponse(); real_build_opener = http_policy.urllib.request.build_opener
captured_handlers = []
def fake_build_opener(*handlers):
    captured_handlers.extend(handlers)
    return _FakeOpener(final_response)
http_policy.urllib.request.build_opener = fake_build_opener
try:
    try:
        http_policy.open_allowed_https("https://example.test/start", ["example.test"]); rejected_final = False
    except http_policy.URLPolicyError:
        rejected_final = True
finally:
    http_policy.urllib.request.build_opener = real_build_opener
check("HTTP helper rechecks the final response URL and closes an off-policy response",
      rejected_final and final_response.closed)
check("HTTP helper disables environment proxies and installs the pinned HTTPS handler",
      any(isinstance(handler, http_policy.urllib.request.ProxyHandler)
          and handler.proxies == {} for handler in captured_handlers)
      and any(isinstance(handler, http_policy._PinnedHTTPSHandler)
              for handler in captured_handlers))

# Resolve once, then connect the TLS socket to the immutable public endpoint.
# The fake resolver would report loopback on a second lookup, proving the
# connection class never hands the hostname back to DNS.
rebind_cache = http_policy._ResolutionCache(["rebind.example.test"])
rebind_endpoints = rebind_cache.resolve("rebind.example.test")
real_socket_factory = http_policy.socket.socket
socket_connects = []
tls_sni = []
fixture_peer = ["8.8.8.8"]
class _PinnedSocket:
    def __init__(self, *_args): self.closed = False
    def settimeout(self, _value): pass
    def bind(self, _value): pass
    def connect(self, sockaddr): socket_connects.append(sockaddr)
    def getpeername(self): return (fixture_peer[0], 443)
    def setsockopt(self, *_args): pass
    def close(self): self.closed = True
class _TLSContext:
    verify_mode = 2
    check_hostname = True
    post_handshake_auth = None
    def wrap_socket(self, sock, server_hostname=None):
        tls_sni.append(server_hostname)
        return sock
http_policy.socket.socket = lambda *args: _PinnedSocket(*args)
try:
    pinned = http_policy._PinnedHTTPSConnection(
        "rebind.example.test", expected_hostname="rebind.example.test",
        pinned_endpoints=rebind_endpoints, context=_TLSContext(), timeout=1,
    )
    pinned.connect()
    pinned_ok = (socket_connects == [("8.8.8.8", 443)]
                 and tls_sni == ["rebind.example.test"]
                 and resolution_calls.get("rebind.example.test") == 1)
    fixture_peer[0] = "127.0.0.1"
    mismatched = http_policy._PinnedHTTPSConnection(
        "rebind.example.test", expected_hostname="rebind.example.test",
        pinned_endpoints=rebind_endpoints, context=_TLSContext(), timeout=1,
    )
    try:
        mismatched.connect(); rejected_peer_mismatch = False
    except http_policy.URLPolicyError:
        rejected_peer_mismatch = True
finally:
    http_policy.socket.socket = real_socket_factory
    http_policy.resolve_public_hostname = real_public_resolver
check("connect-time DNS pin uses the public IP directly with hostname SNI and rejects a different peer",
      pinned_ok and rejected_peer_mismatch)
shutil.rmtree(root)

# 29. Strict staging admits exactly one regular payload + matching sidecar.
root, croot, data = make_repo()
extra_stub = STUB_V2 + "\nos.makedirs(os.path.join(a.data_root, 'rogue-subject'), exist_ok=True)\n"
make_v2_connector(croot, "v2-extra-stage", stub=extra_stub)
extra_stage = rows_for(m.run(data, force=True, connectors_root=croot), "v2-extra-stage", "AAA")[0]
check("v2 staging rejects extra directories/subjects before publication",
      extra_stage["failure_kind"] == "staging_contract" and extra_stage["outcome"] == "schema_failed"
      and not os.path.exists(os.path.join(data, "_connectors", "current", "test.v2-extra-stage")))
shutil.rmtree(root)

# 30. FUSE hard-link fallback uses a no-clobber target claim.
root = tempfile.mkdtemp(prefix="write-once-")
immutable = os.path.join(root, "immutable.json")
real_link, real_open = m.os.link, m.os.open
def unsupported_link(*_args, **_kwargs):
    raise OSError(m.errno.EOPNOTSUPP, "hard links unsupported")
m.os.link = unsupported_link
try:
    m._write_once(immutable, b"sealed")
    m._write_once(immutable, b"sealed")
    try:
        m._write_once(immutable, b"different"); rejected_difference = False
    except RuntimeError:
        rejected_difference = True
    raced = os.path.join(root, "raced.json")
    def racing_open(path, flags, *args, **kwargs):
        if path == raced and flags & os.O_EXCL:
            with builtins.open(raced, "wb") as fh: fh.write(b"other-host")
            raise FileExistsError(m.errno.EEXIST, "claimed by other host", raced)
        return real_open(path, flags, *args, **kwargs)
    m.os.open = racing_open
    try:
        m._write_once(raced, b"ours"); rejected_race = False
    except RuntimeError:
        rejected_race = True
finally:
    m.os.link, m.os.open = real_link, real_open
check("hard-link-unavailable fallback replays identical bytes and never overwrites differing data",
      rejected_difference and rejected_race and open(immutable, "rb").read() == b"sealed"
      and open(raced, "rb").read() == b"other-host")
shutil.rmtree(root)

# 31. Stable connector identity survives a missing current via immutable sequence markers.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-stable-id", series_id="test.stable-old", dataset_id="test.stable-old")
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 1, tzinfo=timezone.utc))
valid, _ = m.discover(croot); stable_man = valid[0][1]
os.unlink(m.connector_storage_paths(data, stable_man, "AAA")["current"])
changed_identity = {**stable_man, "dataset_id": "test.stable-new", "series_id": "test.stable-new"}
identity_error = m._stable_identity_conflict(data, changed_identity, "AAA")
check("sealed markers prevent connector_id+subject dataset/series drift after current loss",
      identity_error is not None and "stable connector identity changed" in identity_error)
marker_root = os.path.join(data, "_connectors", "committed_heads")
marker_file = next(os.path.join(directory, name) for directory, _dirs, names in os.walk(marker_root)
                   for name in names if name.endswith(".json"))
open(marker_file, "w").write("{")
check("unreadable candidate identity marker fails closed",
      "unreadable marker" in (m._stable_identity_conflict(data, changed_identity, "AAA") or ""))
shutil.rmtree(root)

root, croot, data = make_repo()
os.makedirs(os.path.join(data, "BBB"))
d = make_v2_connector(croot, "v2-multi-subject", series_id="test.multi-subject")
multi_man = json.load(open(os.path.join(d, "connector.json")))
multi_man["subjects"] = ["AAA", "BBB"]
json.dump(multi_man, open(os.path.join(d, "connector.json"), "w"))
multi_run = m.run(data, force=True, connectors_root=croot,
                  now=datetime(2026, 8, 1, tzinfo=timezone.utc))
multi_rows = rows_for(multi_run, "v2-multi-subject", "AAA") + rows_for(multi_run, "v2-multi-subject", "BBB")
check("one stable connector identity may legitimately seal every declared subject",
      len(multi_rows) == 2 and all(row["decision"] == "refetched" for row in multi_rows))
multi_man["subjects"] = ["BBB"]
json.dump(multi_man, open(os.path.join(d, "connector.json"), "w"))
dropped_subject = rows_for(m.run(
    data, force=True, connectors_root=croot, now=datetime(2026, 8, 2, tzinfo=timezone.utc),
), "v2-multi-subject", "BBB")[0]
check("an existing connector id cannot be repurposed by dropping a sealed subject",
      dropped_subject["failure_kind"] == "publish_error"
      and "subject coverage dropped AAA" in dropped_subject["message"])
shutil.rmtree(root)

root, croot, data = make_repo()
os.makedirs(os.path.join(data, "BBB"))
d = make_v2_connector(
    croot, "v2-cross-subject-repurpose", dataset_id="test.identity-old",
    series_id="test.identity-old",
)
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 1, tzinfo=timezone.utc))
repurposed = json.load(open(os.path.join(d, "connector.json")))
repurposed.update({
    "subjects": ["BBB"], "dataset_id": "test.identity-new", "series_id": "test.identity-new",
})
json.dump(repurposed, open(os.path.join(d, "connector.json"), "w"))
cross_subject_repurpose = rows_for(m.run(
    data, force=True, connectors_root=croot, now=datetime(2026, 8, 2, tzinfo=timezone.utc),
), "v2-cross-subject-repurpose", "BBB")[0]
check("dataset/series identity is enforced across all historical subjects for a connector id",
      cross_subject_repurpose["failure_kind"] == "publish_error"
      and "stable connector identity changed" in cross_subject_repurpose["message"])
shutil.rmtree(root)

root, croot, data = make_repo()
os.makedirs(os.path.join(data, "BBB"))
d = make_v2_connector(
    croot, "v2-history-artifact-loss", dataset_id="test.history-artifact-loss",
    series_id="test.history-artifact-loss",
)
json.dump({"as_of": "2026-08-01", "rows": [{"period": "2026-08-01", "value": 1.0}]},
          open(os.path.join(d, "fixture.json"), "w"))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 1, tzinfo=timezone.utc))
json.dump({"as_of": "2026-08-02", "rows": [{"period": "2026-08-02", "value": 2.0}]},
          open(os.path.join(d, "fixture.json"), "w"))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 2, tzinfo=timezone.utc))
artifact_man = json.load(open(os.path.join(d, "connector.json")))
artifact_paths = m.connector_storage_paths(data, artifact_man, "AAA")
receipt_dir = os.path.join(
    data, "_connectors", "commits", artifact_man["dataset_id"], artifact_man["series_id"], "AAA",
)
marker_dir = os.path.join(
    data, "_connectors", "committed_heads", artifact_man["dataset_id"], artifact_man["series_id"], "AAA",
)
vintages_before_loss = sorted(os.listdir(artifact_paths["vintages"]))
receipts_before_loss = sorted(os.listdir(receipt_dir))
pit_before_loss = m.read_point_in_time(
    data, artifact_man["series_id"], "AAA", "2026-08-03", connectors_root=croot,
)
os.unlink(artifact_paths["current"])
shutil.rmtree(marker_dir)
json.dump({"as_of": "2026-08-03", "rows": [{"period": "2026-08-03", "value": 3.0}]},
          open(os.path.join(d, "fixture.json"), "w"))
reset_attempt = rows_for(m.run(
    data, force=True, connectors_root=croot, now=datetime(2026, 8, 3, tzinfo=timezone.utc),
), "v2-history-artifact-loss", "AAA")[0]
check("lost current and markers cannot reset surviving immutable history to sequence one",
      pit_before_loss is not None and pit_before_loss["usable"] is True
      and reset_attempt["failure_kind"] == "publish_error" and reset_attempt["outcome"] == "quarantined"
      and "exists without a provable canonical current pointer" in reset_attempt["message"]
      and not os.path.exists(artifact_paths["current"])
      and not os.path.exists(marker_dir)
      and sorted(os.listdir(artifact_paths["vintages"])) == vintages_before_loss
      and sorted(os.listdir(receipt_dir)) == receipts_before_loss
      and m.read_point_in_time(data, artifact_man["series_id"], "AAA", "2026-08-04", connectors_root=croot) is None)
repurposed_after_loss = {**artifact_man, "subjects": ["BBB"],
                         "dataset_id": "test.history-repurposed", "series_id": "test.history-repurposed"}
json.dump(repurposed_after_loss, open(os.path.join(d, "connector.json"), "w"))
repurpose_after_loss = rows_for(m.run(
    data, force=True, connectors_root=croot, now=datetime(2026, 8, 4, tzinfo=timezone.utc),
), "v2-history-artifact-loss", "BBB")[0]
check("surviving vintages and receipts preserve connector identity after pointer/marker loss",
      repurpose_after_loss["failure_kind"] == "publish_error"
      and "stable connector identity changed" in repurpose_after_loss["message"])
shutil.rmtree(root)

# 32. Current verification keeps constant record reads (while inventorying
# immutable names); PIT and stable IDs still open and walk the full chain.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-o1", series_id="test.o1")
raw = json.load(open(os.path.join(d, "connector.json")))
payload = {"series": raw["series"], "as_of": "2026-08-01",
           "rows": [{"period": "2026-08-01", "value": 1.0}]}
fetched = {"payload": payload, "as_of": payload["as_of"], "sidecar": {
    "provider": raw["provider"], "source_type": raw["source_type"], "tier": raw["tier"],
    "license": raw["license"], "licensing": raw["licensing"], "connector_id": raw["id"],
    "dataset_id": raw["dataset_id"], "series_id": raw["series_id"], "schema_version": 1,
    "as_of": payload["as_of"], "source_url": "https://example.test/source",
}}
def publish_o1(day):
    return m.publish_validated(raw, "AAA", data, fetched, datetime(2026, 8, day, tzinfo=timezone.utc),
                               connector_hash="a" * 64, commit="fixture")
publish_o1(1)
current_path = m.connector_storage_paths(data, raw, "AAA")["current"]
def verification_reads():
    current = json.load(open(current_path))
    count = 0; ordinary_open = builtins.open
    def counting_open(*args, **kwargs):
        nonlocal count
        if args and os.path.realpath(str(args[0])).startswith(os.path.realpath(data) + os.sep): count += 1
        return ordinary_open(*args, **kwargs)
    builtins.open = counting_open
    try: m.verify_current_pointer(raw, "AAA", data, current, require_live_publisher=False)
    finally: builtins.open = ordinary_open
    return count
one_read_count = verification_reads()
for day in range(2, 22): publish_o1(day)
many_read_count = verification_reads()
latest_current = json.load(open(current_path))
resolved_latest = m.resolve_vintage_id(data, raw["series_id"], "AAA", latest_current["vintage_id"])
check("current validation reads a constant number of files as history grows",
      one_read_count == many_read_count and many_read_count < 12)
check("full-chain resolver returns the latest stable vintage after 21 accepted retrievals",
      latest_current["committed_count"] == 21 and resolved_latest is not None
      and resolved_latest["vintage_id"] == latest_current["vintage_id"])
shutil.rmtree(root)

# 33. Production code must be a clean checked-out main ref before network use.
root = tempfile.mkdtemp(prefix="publisher-git-")
origin_root = tempfile.mkdtemp(prefix="publisher-origin-")
origin_repo = os.path.join(origin_root, "origin.git")
repo_croot = os.path.join(root, ".claude", "connectors"); repo_cdir = os.path.join(repo_croot, "fixture")
os.makedirs(repo_cdir, exist_ok=True); os.makedirs(os.path.join(root, "frameworks"), exist_ok=True)
os.makedirs(os.path.join(root, ".claude", "tools"), exist_ok=True)
os.makedirs(os.path.join(root, "scripts"), exist_ok=True)
open(os.path.join(repo_cdir, "connector.json"), "w").write("{}\n")
open(os.path.join(repo_cdir, "fetch.py"), "w").write("# fixture\n")
os.makedirs(os.path.join(repo_cdir, "helpers"), exist_ok=True)
helper_path = os.path.join(repo_cdir, "helpers", "normalise.py")
open(helper_path, "w").write("# nested helper\n")
open(os.path.join(root, "shared.py"), "w").write("# shared\n")
reader_ingest = os.path.join(root, ".claude", "tools", "ingest_external.py")
reader_extract = os.path.join(root, ".claude", "tools", "extract_pool.py")
canonicalizer_path = os.path.join(root, "scripts", "canonical_json.py")
mutation_path = os.path.join(root, "scripts", "repo_mutation.py")
open(reader_ingest, "w").write("# manual identity reader\n")
open(reader_extract, "w").write("# document extraction reader\n")
open(canonicalizer_path, "w").write("# cross-runtime canonicalizer\n")
open(mutation_path, "w").write("# atomic publisher primitive\n")
paths_file = os.path.join(root, "frameworks", "connector-publisher-files.json")
json.dump({"paths": ["shared.py", ".claude/tools/ingest_external.py",
                     ".claude/tools/extract_pool.py", "scripts/canonical_json.py",
                     "scripts/repo_mutation.py"]}, open(paths_file, "w"))
subprocess.run(["git", "init", "-b", "main"], cwd=root, check=True, capture_output=True)
subprocess.run(["git", "config", "user.email", "test@example.test"], cwd=root, check=True)
subprocess.run(["git", "config", "user.name", "Test"], cwd=root, check=True)
subprocess.run(["git", "add", "."], cwd=root, check=True)
subprocess.run(["git", "commit", "-m", "fixture"], cwd=root, check=True, capture_output=True)
subprocess.run(["git", "init", "--bare", origin_repo], check=True, capture_output=True)
subprocess.run(["git", "remote", "add", "origin", origin_repo], cwd=root, check=True)
subprocess.run(["git", "push", "-u", "origin", "main"], cwd=root, check=True, capture_output=True)
clean_ok = m.production_code_state(repo_cdir, repo_croot, repo_root=root,
                                   production_root=repo_croot, paths_file=paths_file)
clean_publisher_fingerprint = clean_ok[2]
open(reader_ingest, "a").write("# dirty reader\n")
dirty_reader = m.production_code_state(repo_cdir, repo_croot, repo_root=root,
                                       production_root=repo_croot, paths_file=paths_file)
dirty_reader_fingerprint = m.publisher_contract_fingerprint(root, paths_file)
open(reader_ingest, "w").write("# manual identity reader\n")
subprocess.run(["git", "update-ref", "-d", "refs/remotes/origin/main"], cwd=root, check=True)
missing_origin = m.production_code_state(repo_cdir, repo_croot, repo_root=root,
                                         production_root=repo_croot, paths_file=paths_file)
remote_ref = os.path.join(root, ".git", "refs", "remotes", "origin", "main")
os.makedirs(os.path.dirname(remote_ref), exist_ok=True)
open(remote_ref, "w").write("f" * 40 + "\n")
unresolvable_origin = m.production_code_state(repo_cdir, repo_croot, repo_root=root,
                                              production_root=repo_croot, paths_file=paths_file)
os.unlink(remote_ref)
subprocess.run(["git", "fetch", "origin", "main:refs/remotes/origin/main"], cwd=root,
               check=True, capture_output=True)
clean_fingerprint = m.connector_fingerprint(repo_cdir)
os.makedirs(os.path.join(repo_cdir, "__pycache__"), exist_ok=True)
open(os.path.join(repo_cdir, "__pycache__", "fetch.cpython-39.pyc"), "wb").write(b"generated")
cache_ok = m.production_code_state(repo_cdir, repo_croot, repo_root=root,
                                   production_root=repo_croot, paths_file=paths_file)
cache_fingerprint = m.connector_fingerprint(repo_cdir)
open(helper_path, "a").write("# changed\n")
dirty_nested = m.production_code_state(repo_cdir, repo_croot, repo_root=root,
                                       production_root=repo_croot, paths_file=paths_file)
changed_fingerprint = m.connector_fingerprint(repo_cdir)
open(helper_path, "w").write("# nested helper\n")
untracked_helper = os.path.join(repo_cdir, "helpers", "runtime_only.py")
open(untracked_helper, "w").write("# untracked runtime helper\n")
untracked_nested = m.production_code_state(repo_cdir, repo_croot, repo_root=root,
                                           production_root=repo_croot, paths_file=paths_file)
os.unlink(untracked_helper)
top_level_pyc = os.path.join(repo_cdir, "runtime.pyc")
open(top_level_pyc, "wb").write(b"sourceless-importable-bytecode")
top_level_pyc_fingerprint = m.connector_fingerprint(repo_cdir)
top_level_pyc_state = m.production_code_state(
    repo_cdir, repo_croot, repo_root=root, production_root=repo_croot, paths_file=paths_file,
)
os.unlink(top_level_pyc)
os.unlink(helper_path)
deleted_nested = m.production_code_state(repo_cdir, repo_croot, repo_root=root,
                                         production_root=repo_croot, paths_file=paths_file)
open(helper_path, "w").write("# nested helper\n")
subprocess.run(["git", "switch", "-c", "feature"], cwd=root, check=True, capture_output=True)
feature = m.production_code_state(repo_cdir, repo_croot, repo_root=root,
                                  production_root=repo_croot, paths_file=paths_file)
subprocess.run(["git", "switch", "main"], cwd=root, check=True, capture_output=True)
open(os.path.join(root, "shared.py"), "a").write("# dirty\n")
dirty = m.production_code_state(repo_cdir, repo_croot, repo_root=root,
                                production_root=repo_croot, paths_file=paths_file)
os.remove(os.path.join(repo_cdir, "fetch.py"))
os.symlink(os.path.join(root, "shared.py"), os.path.join(repo_cdir, "fetch.py"))
symlinked = m.production_code_state(repo_cdir, repo_croot, repo_root=root,
                                    production_root=repo_croot, paths_file=paths_file)
check("clean tracked main is reproducible; feature branch and dirty publisher fail closed",
      clean_ok[0] is True
      and missing_origin[0] is False and "origin/main ref is unavailable" in missing_origin[1]
      and unresolvable_origin[0] is False and "origin/main ref is unavailable" in unresolvable_origin[1]
      and feature[0] is False and "main branch" in feature[1]
      and dirty[0] is False and "dirty" in dirty[1]
      and symlinked[0] is False and "symlink" in symlinked[1],
      repr({"clean": clean_ok, "missing_origin": missing_origin,
            "unresolvable_origin": unresolvable_origin, "feature": feature,
            "dirty": dirty, "symlinked": symlinked}))
check("recursive connector identity covers nested helpers but ignores generated bytecode",
      cache_ok[0] is True and cache_fingerprint == clean_fingerprint
      and dirty_nested[0] is False and "dirty" in dirty_nested[1]
      and changed_fingerprint != clean_fingerprint
      and untracked_nested[0] is False and "tracked" in untracked_nested[1]
      and top_level_pyc_fingerprint != clean_fingerprint
      and top_level_pyc_state[0] is False and "tracked" in top_level_pyc_state[1]
      and deleted_nested[0] is False and "tracked" in deleted_nested[1],
      repr({"cache": cache_ok, "dirty_nested": dirty_nested, "untracked": untracked_nested,
            "top_level_pyc": top_level_pyc_state, "deleted": deleted_nested,
            "fingerprints": (clean_fingerprint, cache_fingerprint, changed_fingerprint, top_level_pyc_fingerprint)}))
check("manual identity readers and canonicalizer are fingerprinted and dirty reader code fails closed",
      dirty_reader[0] is False and "dirty" in dirty_reader[1]
      and dirty_reader_fingerprint != clean_publisher_fingerprint
      and all(path in m.publisher_contract_paths(root, paths_file) for path in (
          ".claude/tools/ingest_external.py", ".claude/tools/extract_pool.py", "scripts/canonical_json.py",
          "scripts/repo_mutation.py",
      )), repr({"dirty_reader": dirty_reader, "fingerprints": (
          clean_publisher_fingerprint, dirty_reader_fingerprint,
      )}))
shutil.rmtree(root)
shutil.rmtree(origin_root)

# 34. Validation-contract evolution requires a strictly increasing schema version.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-schema-evolution", series_id="test.schema-evolution")
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 1, tzinfo=timezone.utc))
evolved = json.load(open(os.path.join(d, "connector.json")))
evolved["output_schema"]["label"] = "string"
json.dump(evolved, open(os.path.join(d, "connector.json"), "w"))
json.dump({"as_of": "2026-08-01", "rows": [{"period": "2026-08-01", "value": 1.0}], "label": "new"},
          open(os.path.join(d, "fixture.json"), "w"))
same_version = rows_for(m.run(data, force=True, connectors_root=croot,
                              now=datetime(2026, 8, 2, tzinfo=timezone.utc)), evolved["id"], "AAA")[0]
evolved["schema_version"] = 2; json.dump(evolved, open(os.path.join(d, "connector.json"), "w"))
higher_version = rows_for(m.run(data, force=True, connectors_root=croot,
                                now=datetime(2026, 8, 3, tzinfo=timezone.utc)), evolved["id"], "AAA")[0]
evolved["schema_version"] = 1; json.dump(evolved, open(os.path.join(d, "connector.json"), "w"))
lower_version = rows_for(m.run(data, force=True, connectors_root=croot,
                               now=datetime(2026, 8, 4, tzinfo=timezone.utc)), evolved["id"], "AAA")[0]
check("changed output contract is rejected at the same version, accepted higher, and never allowed lower",
      same_version["failure_kind"] == "publish_error" and same_version["outcome"] == "quarantined"
      and higher_version["decision"] == "refetched"
      and lower_version["failure_kind"] == "publish_error" and lower_version["outcome"] == "quarantined")
shutil.rmtree(root)

# 35. Publisher drift forces an accepted retrieval; stale publisher bytes are never merely reprojected.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-publisher-drift", series_id="test.publisher-drift")
raw = json.load(open(os.path.join(d, "connector.json")))
payload = {"series": raw["series"], "as_of": "2026-01-09",
           "rows": [{"period": "2026-01-09", "value": 1.0}]}
fetched = {"payload": payload, "as_of": payload["as_of"], "sidecar": {
    "provider": raw["provider"], "source_type": raw["source_type"], "tier": raw["tier"],
    "license": raw["license"], "licensing": raw["licensing"], "connector_id": raw["id"],
    "dataset_id": raw["dataset_id"], "series_id": raw["series_id"], "schema_version": 1,
    "as_of": payload["as_of"], "source_url": "https://example.test/source",
}}
m.publish_validated(raw, "AAA", data, fetched, datetime(2026, 1, 10, tzinfo=timezone.utc),
                    connector_hash=m.connector_fingerprint(d), publisher_hash="0" * 64, commit="old")
drift_row = rows_for(m.run(data, connectors_root=croot,
                           now=datetime(2026, 1, 11, tzinfo=timezone.utc)), raw["id"], "AAA")[0]
drift_current = json.load(open(m.connector_storage_paths(data, raw, "AAA")["current"]))
check("publisher-contract fingerprint drift refetches and seals the live publisher identity",
      drift_row["decision"] == "refetched" and drift_row["attempts"] == 1
      and drift_current["publisher_contract_fingerprint"] == m.publisher_contract_fingerprint()
      and drift_current["committed_count"] == 2)
shutil.rmtree(root)

# 36. Credential values and URL encodings never enter the ledger, including 401/403 failures.
root, croot, data = make_repo()
credential_stub = """#!/usr/bin/env python3
import os, sys
from urllib.parse import quote, quote_plus
value = os.environ['CONNECTOR_TEST_TOKEN']
encoded = quote(value, safe='').replace('%2F', '%2f').replace('%3F', '%3f').replace('%2B', '%2b')
print('401 unauthorized ' + value + ' ' + encoded + ' ' + quote_plus(value, safe=''), file=sys.stderr)
raise SystemExit(1)
"""
d = make_v2_connector(croot, "v2-redaction", stub=credential_stub)
redaction_man = json.load(open(os.path.join(d, "connector.json")))
redaction_man["credential_env"] = ["CONNECTOR_TEST_TOKEN"]
json.dump(redaction_man, open(os.path.join(d, "connector.json"), "w"))
secret = "abc /?+"; os.environ["CONNECTOR_TEST_TOKEN"] = secret
try:
    redacted = rows_for(m.run(data, force=True, connectors_root=croot), "v2-redaction", "AAA")[0]
finally:
    del os.environ["CONNECTOR_TEST_TOKEN"]
check("credentialed unauthorized response is fetch_error, not credentials_missing, with every secret form redacted",
      redacted["failure_kind"] == "fetch_error" and redacted["attempts"] == 3
      and redacted["outcome"] == "stalled" and "[REDACTED]" in redacted["message"]
      and secret not in redacted["message"] and "%2F" not in redacted["message"]
      and "%2f" not in redacted["message"])
shutil.rmtree(root)

# A quoted providers.env value can preserve edge spaces after unquoting. The
# fetcher must never strip and send a different token from the one protected by
# the runner's redaction boundary.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-edge-space-secret", stub=credential_stub)
edge_man = json.load(open(os.path.join(d, "connector.json")))
edge_man["credential_env"] = ["CONNECTOR_TEST_TOKEN"]
json.dump(edge_man, open(os.path.join(d, "connector.json"), "w"))
config_dir = os.path.join(root, "private-config")
os.makedirs(config_dir, mode=0o700)
providers_file = os.path.join(config_dir, "providers.env")
open(providers_file, "w").write('CONNECTOR_TEST_TOKEN="  INNER-TOKEN  "\n')
os.chmod(providers_file, 0o600)
old_source = os.environ.get("NOSTRA_CONNECTOR_CREDENTIAL_SOURCE")
old_config = os.environ.get("NOSTRA_ENGINE_CONFIG_DIR")
old_token = os.environ.pop("CONNECTOR_TEST_TOKEN", None)
os.environ["NOSTRA_CONNECTOR_CREDENTIAL_SOURCE"] = "providers_env"
os.environ["NOSTRA_ENGINE_CONFIG_DIR"] = config_dir
try:
    edge_row = rows_for(m.run(
        data, force=True, connectors_root=croot,
    ), edge_man["id"], "AAA")[0]
finally:
    if old_source is None: os.environ.pop("NOSTRA_CONNECTOR_CREDENTIAL_SOURCE", None)
    else: os.environ["NOSTRA_CONNECTOR_CREDENTIAL_SOURCE"] = old_source
    if old_config is None: os.environ.pop("NOSTRA_ENGINE_CONFIG_DIR", None)
    else: os.environ["NOSTRA_ENGINE_CONFIG_DIR"] = old_config
    os.environ.pop("CONNECTOR_TEST_TOKEN", None)
    if old_token is not None: os.environ["CONNECTOR_TEST_TOKEN"] = old_token
check("quoted edge-whitespace credentials fail closed before any fetch attempt",
      edge_row["failure_kind"] == "credentials_missing" and edge_row["attempts"] == 0
      and "INNER-TOKEN" not in json.dumps(edge_row))
shutil.rmtree(root)

# Redaction happens before the persisted/UI tail is selected.  If truncation
# happened first, this fixture would leave only the final part of the secret
# inside the 400-character ledger message, which no full-secret matcher could
# then remove.
root, croot, data = make_repo()
boundary_stub = """#!/usr/bin/env python3
import os, sys
value = os.environ['CONNECTOR_TEST_TOKEN']
print('P' * 40 + value + 'S' * 390, file=sys.stderr)
raise SystemExit(1)
"""
d = make_v2_connector(croot, "v2-redaction-boundary", stub=boundary_stub)
boundary_man = json.load(open(os.path.join(d, "connector.json")))
boundary_man["credential_env"] = ["CONNECTOR_TEST_TOKEN"]
json.dump(boundary_man, open(os.path.join(d, "connector.json"), "w"))
boundary_secret = "SPLIT-CREDENTIAL-Z9Q7"
os.environ["CONNECTOR_TEST_TOKEN"] = boundary_secret
try:
    boundary_row = rows_for(m.run(
        data, force=True, connectors_root=croot,
    ), boundary_man["id"], "AAA")[0]
finally:
    del os.environ["CONNECTOR_TEST_TOKEN"]
check("credential redaction precedes message truncation at the 400-character boundary",
      boundary_row["failure_kind"] == "fetch_error"
      and "[REDACTED]" in boundary_row["message"]
      and boundary_secret not in boundary_row["message"]
      and boundary_secret[-10:] not in boundary_row["message"],
      repr(boundary_row["message"]))
shutil.rmtree(root)

# A successful child must not smuggle a declared credential into publishable provenance.
credential_leak_stub = """#!/usr/bin/env python3
import argparse, json, os
from urllib.parse import quote
ap = argparse.ArgumentParser(); ap.add_argument('--subject'); ap.add_argument('--data-root'); a = ap.parse_args()
here = os.path.dirname(os.path.abspath(__file__)); man = json.load(open(os.path.join(here, 'connector.json')))
fixture = json.load(open(os.path.join(here, 'fixture.json'))); payload = {'series': man['series'], **fixture}
rel = man['output_path'].replace('<SUBJECT>', a.subject).replace('<as_of>', payload['as_of'])
if rel.startswith('data/'): rel = rel[5:]
p = os.path.join(a.data_root, rel); os.makedirs(os.path.dirname(p), exist_ok=True); json.dump(payload, open(p, 'w'))
source = ('https://example.test/source?token=' + quote(os.environ['CONNECTOR_TEST_TOKEN'], safe='')
          .replace('%2F', '%2f').replace('%3F', '%3f').replace('%2B', '%2b'))
json.dump({'provider': man['provider'], 'source_type': man['source_type'], 'tier': man['tier'],
           'license': man['license'], 'licensing': man['licensing'], 'connector_id': man['id'],
           'dataset_id': man['dataset_id'], 'series_id': man['series_id'], 'schema_version': man['schema_version'],
           'as_of': payload['as_of'], 'source_url': source}, open(p + '.source.json', 'w'))
"""
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-credential-leak", stub=credential_leak_stub)
leak_man = json.load(open(os.path.join(d, "connector.json"))); leak_man["credential_env"] = ["CONNECTOR_TEST_TOKEN"]
json.dump(leak_man, open(os.path.join(d, "connector.json"), "w"))
os.environ["CONNECTOR_TEST_TOKEN"] = secret
try:
    leaked = rows_for(m.run(data, force=True, connectors_root=croot), "v2-credential-leak", "AAA")[0]
finally:
    del os.environ["CONNECTOR_TEST_TOKEN"]
check("a staged credential leak is rejected generically and never persisted",
      leaked["failure_kind"] == "invalid_provenance" and leaked["outcome"] == "schema_failed"
      and "credential value" in leaked["message"] and secret not in json.dumps(leaked)
      and m.quote(secret, safe="") not in json.dumps(leaked))
shutil.rmtree(root)

# 37. A no-fetch health row binds the sealed vintage, not an unrelated newer repository HEAD.
root, croot, data = make_repo()
d = make_v2_connector(
    croot, "v2-health-binding", fixture={
        "as_of": "2026-08-09", "rows": [{"period": "2026-08-09", "value": 1.0}],
    },
)
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 9, 12, tzinfo=timezone.utc))
binding_man = json.load(open(os.path.join(d, "connector.json")))
binding_current = json.load(open(m.connector_storage_paths(data, binding_man, "AAA")["current"]))
sealed_commit = binding_current["connector_commit"]
ordinary_deployed_commit = m.deployed_commit
m.deployed_commit = lambda _repo_root=m.REPO: "f" * 40
try:
    binding_row = rows_for(m.run(
        data, connectors_root=croot, now=datetime(2026, 8, 9, 13, tzinfo=timezone.utc),
    ), binding_man["id"], "AAA")[0]
finally:
    m.deployed_commit = ordinary_deployed_commit
check("fresh health binds the sealed connector commit even after an unrelated HEAD advance",
      binding_row["decision"] == "fresh" and binding_row["connector_commit"] == sealed_commit
      and binding_row["connector_commit"] != "f" * 40)
shutil.rmtree(root)

# 38. PIT/current integrity regressions from the final connector-v2 audit.
def fetched_for(raw, payload):
    return {"payload": {"series": raw["series"], **payload}, "as_of": payload["as_of"], "sidecar": {
        "provider": raw["provider"], "source_type": raw["source_type"], "tier": raw["tier"],
        "license": raw["license"], "licensing": raw["licensing"], "connector_id": raw["id"],
        "dataset_id": raw["dataset_id"], "series_id": raw["series_id"],
        "schema_version": raw["schema_version"], "as_of": payload["as_of"],
        "source_url": "https://example.test/source",
    }}


# Deleting any older immutable marker must invalidate both constant-record-read
# current health and the full PIT chain; the two readers may not disagree.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-marker-gap", series_id="test.marker-gap")
raw = json.load(open(os.path.join(d, "connector.json")))
for day in (1, 2, 3):
    payload = {"as_of": f"2026-08-0{day}", "rows": [{"period": f"2026-08-0{day}", "value": float(day)}]}
    m.publish_validated(raw, "AAA", data, fetched_for(raw, payload),
                        datetime(2026, 8, day, tzinfo=timezone.utc),
                        connector_hash="a" * 64, commit="fixture")
current_path = m.connector_storage_paths(data, raw, "AAA")["current"]
current = json.load(open(current_path))
older_marker = os.path.join(
    data, "_connectors", "committed_heads", current["dataset_id"], current["series_id"],
    current["subject"], f"{2:020d}.json",
)
os.unlink(older_marker)
try:
    m.verify_current_pointer(raw, "AAA", data, current, require_live_publisher=False)
    marker_gap_current_rejected = False
except RuntimeError:
    marker_gap_current_rejected = True
marker_gap_pit = m.read_point_in_time(data, raw["series_id"], "AAA", "2026-08-04", connectors_root=croot)
check("an older marker gap fails current health and PIT consistently",
      marker_gap_current_rejected and marker_gap_pit is None)
shutil.rmtree(root)


# Rolling current back and deleting the later marker must not hide the
# surviving immutable vintage/receipt tail.  The lane count is an independent
# rollback witness even when the marker inventory alone matches old current.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-tail-artifact-rollback", series_id="test.tail-artifact-rollback")
raw = json.load(open(os.path.join(d, "connector.json")))
for day in (1, 2):
    payload = {"as_of": f"2026-08-0{day}", "rows": [{"period": f"2026-08-0{day}", "value": float(day)}]}
    m.publish_validated(raw, "AAA", data, fetched_for(raw, payload),
                        datetime(2026, 8, day, tzinfo=timezone.utc),
                        connector_hash="a" * 64, commit="fixture")
tail_current_path = m.connector_storage_paths(data, raw, "AAA")["current"]
tail_second = json.load(open(tail_current_path))
tail_second_marker = m._commit_marker_path(data, tail_second)
tail_second_receipts = sum(
    len(files) for _directory, _dirs, files in os.walk(os.path.join(data, "_connectors", "commits"))
)
tail_second_vintages = sum(
    len(files) for _directory, _dirs, files in os.walk(os.path.join(data, "_connectors", "vintages"))
)
tail_first_path = os.path.join(data, tail_second["committed_head"]["path"])
tail_second_receipt = json.load(open(os.path.join(data, tail_second["commit_receipt_path"])))
tail_first_head = tail_second_receipt["prior_head"]
tail_first_meta = json.load(open(os.path.join(data, tail_first_head["path"])))
tail_first = {
    **tail_first_meta,
    "committed_count": 1,
    "committed_head": tail_first_head,
    "commit_protocol_version": 1,
    "commit_receipt_path": os.path.relpath(
        m._commit_receipt_path(data, tail_first_meta, tail_first_head["metadata_sha256"]), data,
    ),
}
open(tail_current_path, "wb").write(m.canonical_json_bytes(tail_first))
os.unlink(tail_second_marker)
try:
    m.verify_current_pointer(raw, "AAA", data, tail_first, require_live_publisher=False)
    tail_artifact_health_rejected = False
except RuntimeError:
    tail_artifact_health_rejected = True
tail_artifact_pit = m.read_point_in_time(
    data, raw["series_id"], "AAA", "2026-08-03", connectors_root=croot,
)
check("surviving tail vintages/receipts prevent rollback even when the later marker is gone",
      tail_second_receipts == 2 and tail_second_vintages == 2
      and os.path.exists(tail_first_path)
      and tail_artifact_health_rejected and tail_artifact_pit is None)
shutil.rmtree(root)


# A completed vintage that never received a receipt is not a committed tail.
# Preserve it for forensics, keep the prior current usable, and let a later
# retry append a new linked retrieval without making the orphan PIT-visible.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-unclaimed-vintage", series_id="test.unclaimed-vintage")
raw = json.load(open(os.path.join(d, "connector.json")))
first_payload = {"as_of": "2026-08-01", "rows": [{"period": "2026-08-01", "value": 1.0}]}
second_payload = {"as_of": "2026-08-02", "rows": [{"period": "2026-08-02", "value": 2.0}]}
m.publish_validated(raw, "AAA", data, fetched_for(raw, first_payload),
                    datetime(2026, 8, 1, tzinfo=timezone.utc),
                    connector_hash="a" * 64, commit="fixture")
unclaimed_current_path = m.connector_storage_paths(data, raw, "AAA")["current"]
unclaimed_current = json.load(open(unclaimed_current_path))
real_receipt_write = m._write_commit_receipt
def fail_before_unclaimed_receipt(*_args, **_kwargs):
    raise OSError("simulated hard stop before receipt")
m._write_commit_receipt = fail_before_unclaimed_receipt
try:
    try:
        m.publish_validated(raw, "AAA", data, fetched_for(raw, second_payload),
                            datetime(2026, 8, 2, tzinfo=timezone.utc),
                            connector_hash="a" * 64, commit="fixture")
    except OSError:
        pass
finally:
    m._write_commit_receipt = real_receipt_write
try:
    m.verify_current_pointer(raw, "AAA", data, unclaimed_current, require_live_publisher=False)
    unclaimed_prior_usable = True
except RuntimeError:
    unclaimed_prior_usable = False
unclaimed_early = m.read_point_in_time(
    data, raw["series_id"], "AAA", "2026-08-02T12:00:00Z", connectors_root=croot,
)
m.publish_validated(raw, "AAA", data, fetched_for(raw, second_payload),
                    datetime(2026, 8, 3, tzinfo=timezone.utc),
                    connector_hash="a" * 64, commit="fixture")
unclaimed_late_current = json.load(open(unclaimed_current_path))
unclaimed_late = m.read_point_in_time(
    data, raw["series_id"], "AAA", "2026-08-04", connectors_root=croot,
)
unclaimed_vintage_count = sum(
    len(files) for _directory, _dirs, files in os.walk(os.path.join(data, "_connectors", "vintages"))
)
unclaimed_receipt_count = sum(
    len(files) for _directory, _dirs, files in os.walk(os.path.join(data, "_connectors", "commits"))
)
check("an unclaimed forensic vintage neither enters PIT nor bricks the prior current/retry",
      unclaimed_prior_usable
      and unclaimed_early is not None and unclaimed_early["payload"]["rows"][0]["value"] == 1.0
      and unclaimed_late is not None and unclaimed_late["payload"]["rows"][0]["value"] == 2.0
      and unclaimed_late_current["committed_count"] == 2
      and unclaimed_vintage_count == 3 and unclaimed_receipt_count == 2)
shutil.rmtree(root)


# The newest provider state at a cutoff is authoritative.  Corruption cannot
# resurrect an older primary; an explicit whole-provider fallback may win.
root, croot, data = make_repo()
pdir = make_v2_connector(croot, "pit-newest-primary", series_id="test.pit-newest",
                         dataset_id="test.pit-newest-primary", provider="Primary", priority=100)
fdir = make_v2_connector(croot, "pit-newest-fallback", series_id="test.pit-newest",
                         dataset_id="test.pit-newest-fallback", provider="Fallback", priority=200,
                         fallback_for="pit-newest-primary")
primary = json.load(open(os.path.join(pdir, "connector.json")))
fallback = json.load(open(os.path.join(fdir, "connector.json")))
m.publish_validated(fallback, "AAA", data, fetched_for(fallback, {
    "as_of": "2026-08-01", "rows": [{"period": "2026-08-01", "value": 50.0}],
}), datetime(2026, 8, 1, 1, tzinfo=timezone.utc), connector_hash="b" * 64, commit="fixture")
m.publish_validated(primary, "AAA", data, fetched_for(primary, {
    "as_of": "2026-08-01", "rows": [{"period": "2026-08-01", "value": 1.0}],
}), datetime(2026, 8, 1, 2, tzinfo=timezone.utc), connector_hash="a" * 64, commit="fixture")
m.publish_validated(primary, "AAA", data, fetched_for(primary, {
    "as_of": "2026-08-02", "rows": [{"period": "2026-08-02", "value": 2.0}],
}), datetime(2026, 8, 2, 2, tzinfo=timezone.utc), connector_hash="a" * 64, commit="fixture")
primary_current = json.load(open(m.connector_storage_paths(data, primary, "AAA")["current"]))
with open(os.path.join(data, primary_current["blob_path"]), "ab") as fh:
    fh.write(b"corrupt")
newest_corrupt = m.read_point_in_time(
    data, primary["series_id"], "AAA", "2026-08-03", connectors_root=croot,
)
check("a corrupt newest primary does not backscan and the explicit fallback wins whole",
      newest_corrupt is not None and newest_corrupt["selected_connector_id"] == fallback["id"]
      and newest_corrupt["payload"]["rows"][0]["value"] == 50.0)
shutil.rmtree(root)


# Likewise, an expired newest retrieval cannot fall through to a superseded
# older retrieval whose frozen release contract happened to be longer.
root, croot, data = make_repo()
d = make_v2_connector(croot, "pit-newest-expired", series_id="test.pit-newest-expired")
long_lived = json.load(open(os.path.join(d, "connector.json")))
long_lived["release"] = {"cadence": "event_driven", "timezone": "UTC", "expected_lag_days": 0,
                          "grace_days": 100, "revision_policy": "revisable"}
m.publish_validated(long_lived, "AAA", data, fetched_for(long_lived, {
    "as_of": "2026-08-01", "rows": [{"period": "2026-08-01", "value": 1.0}],
}), datetime(2026, 8, 1, tzinfo=timezone.utc), connector_hash="a" * 64, commit="fixture")
short_lived = json.loads(json.dumps(long_lived))
short_lived["release"] = {"cadence": "event_driven", "timezone": "UTC", "expected_lag_days": 0,
                           "grace_days": 0, "revision_policy": "revisable"}
m.publish_validated(short_lived, "AAA", data, fetched_for(short_lived, {
    "as_of": "2026-08-02", "rows": [{"period": "2026-08-02", "value": 2.0}],
}), datetime(2026, 8, 2, tzinfo=timezone.utc), connector_hash="a" * 64, commit="fixture")
check("an expired newest provider state cannot resurrect an older still-eligible vintage",
      m.read_point_in_time(data, short_lived["series_id"], "AAA", "2026-08-02T01:00:00Z",
                           connectors_root=croot) is None)
shutil.rmtree(root)


# Missing projections are repaired only while their canonical vintage is
# fresh.  Once expired, acquisition must run before a row can say current.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-expired-projection", series_id="test.expired-projection",
                      fixture={"as_of": "2026-08-01", "rows": [{"period": "2026-08-01", "value": 1.0}]})
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 1, tzinfo=timezone.utc))
expired_man = json.load(open(os.path.join(d, "connector.json")))
expired_current = json.load(open(m.connector_storage_paths(data, expired_man, "AAA")["current"]))
expired_projection = m._legacy_path(expired_man, data, "AAA", expired_current["as_of"])
os.unlink(expired_projection); os.unlink(expired_projection + ".source.json")
json.dump({"as_of": "2026-08-03", "rows": [{"period": "2026-08-03", "value": 3.0}]},
          open(os.path.join(d, "fixture.json"), "w"))
expired_projection_row = rows_for(m.run(
    data, connectors_root=croot, now=datetime(2026, 8, 3, tzinfo=timezone.utc),
), expired_man["id"], "AAA")[0]
check("an expired missing projection refetches instead of reporting reprojected/current",
      expired_projection_row["decision"] == "refetched"
      and expired_projection_row["decision"] != "reprojected")
shutil.rmtree(root)


# A first publication that dies after its receipt but before its marker is
# recoverable only when the surviving shape is exact and unambiguous.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-receipt-before-marker", series_id="test.receipt-before-marker",
                      fixture={"as_of": "2026-08-09", "rows": [{"period": "2026-08-09", "value": 1.0}]})
real_marker_write = m._write_commit_marker
def fail_before_first_marker(*_args, **_kwargs):
    raise OSError("simulated crash after receipt before marker")
m._write_commit_marker = fail_before_first_marker
try:
    receipt_partial = rows_for(m.run(
        data, force=True, connectors_root=croot, now=datetime(2026, 8, 9, tzinfo=timezone.utc),
    ), "v2-receipt-before-marker", "AAA")[0]
finally:
    m._write_commit_marker = real_marker_write
# Model a hard process death inside the no-hardlink fallback: the final marker
# name exists but contains only an exact prefix.  The unique vintage+receipt
# pair must let recovery complete this inode in place.
receipt_man = json.load(open(os.path.join(d, "connector.json")))
receipt_candidate = m.recover_pending_current(
    data,
    connector_id=receipt_man["id"], dataset_id=receipt_man["dataset_id"],
    series_id=receipt_man["series_id"], subject="AAA", provider=receipt_man["provider"],
    current=None,
)
receipt_marker_path = m._commit_marker_path(data, receipt_candidate)
receipt_marker_bytes = m.canonical_json_bytes(m._commit_marker_record(receipt_candidate))
os.makedirs(os.path.dirname(receipt_marker_path), exist_ok=True)
open(receipt_marker_path, "wb").write(receipt_marker_bytes[:31])
receipt_prefix_inode = os.lstat(receipt_marker_path).st_ino
receipt_recovery = rows_for(m.run(
    data, connectors_root=croot, now=datetime(2026, 8, 9, 1, tzinfo=timezone.utc),
), "v2-receipt-before-marker", "AAA")[0]
receipt_current_path = m.connector_storage_paths(data, receipt_man, "AAA")["current"]
check("a unique first vintage+receipt partial safely completes a truncated marker and recovers",
      receipt_partial["failure_kind"] == "publish_error"
      and receipt_recovery["decision"] == "recovered_commit"
      and json.load(open(receipt_current_path))["committed_count"] == 1)
check("first-marker recovery preserves the existing claim inode",
      os.lstat(receipt_marker_path).st_ino == receipt_prefix_inode
      and open(receipt_marker_path, "rb").read() == receipt_marker_bytes)
shutil.rmtree(root)

# The no-hardlink fallback can die immediately after O_EXCL, leaving a zero-
# byte marker. The unique first vintage+receipt fixes its exact marker bytes,
# so recovery may complete that same inode without treating empty files as
# generally trustworthy.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-zero-first-marker", series_id="test.zero-first-marker",
                      fixture={"as_of": "2026-08-09", "rows": [{"period": "2026-08-09", "value": 1.0}]})
m._write_commit_marker = fail_before_first_marker
try:
    zero_first_partial = rows_for(m.run(
        data, force=True, connectors_root=croot, now=datetime(2026, 8, 9, tzinfo=timezone.utc),
    ), "v2-zero-first-marker", "AAA")[0]
finally:
    m._write_commit_marker = real_marker_write
zero_first_man = json.load(open(os.path.join(d, "connector.json")))
zero_first_candidate = m.recover_pending_current(
    data,
    connector_id=zero_first_man["id"], dataset_id=zero_first_man["dataset_id"],
    series_id=zero_first_man["series_id"], subject="AAA", provider=zero_first_man["provider"],
    current=None,
)
zero_first_marker = m._commit_marker_path(data, zero_first_candidate)
zero_first_marker_bytes = m.canonical_json_bytes(m._commit_marker_record(zero_first_candidate))
os.makedirs(os.path.dirname(zero_first_marker), exist_ok=True)
open(zero_first_marker, "wb").close()
zero_first_inode = os.lstat(zero_first_marker).st_ino
zero_first_recovery = rows_for(m.run(
    data, connectors_root=croot, now=datetime(2026, 8, 9, 1, tzinfo=timezone.utc),
), zero_first_man["id"], "AAA")[0]
check("a uniquely proven zero-byte first marker is completed in place and recovered",
      zero_first_partial["failure_kind"] == "publish_error"
      and zero_first_recovery["decision"] == "recovered_commit"
      and os.lstat(zero_first_marker).st_ino == zero_first_inode
      and open(zero_first_marker, "rb").read() == zero_first_marker_bytes)
shutil.rmtree(root)

root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-ambiguous-unmarked", series_id="test.ambiguous-unmarked",
                      fixture={"as_of": "2026-08-09", "rows": [{"period": "2026-08-09", "value": 1.0}]})
m._write_commit_marker = fail_before_first_marker
try:
    m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 9, tzinfo=timezone.utc))
finally:
    m._write_commit_marker = real_marker_write
ambiguous_man = json.load(open(os.path.join(d, "connector.json")))
ambiguous_paths = m.connector_storage_paths(data, ambiguous_man, "AAA")
open(os.path.join(ambiguous_paths["vintages"], "unexpected.json"), "w").write("{}\n")
ambiguous_retry = rows_for(m.run(
    data, connectors_root=croot, now=datetime(2026, 8, 9, 1, tzinfo=timezone.utc),
), ambiguous_man["id"], "AAA")[0]
check("an ambiguous marker-less first history remains quarantined and never becomes current",
      ambiguous_retry["failure_kind"] == "publish_error"
      and not os.path.exists(ambiguous_paths["current"]))
shutil.rmtree(root)


# A hard stop after the first vintage but before its receipt leaves forensic
# debris, not a committed sequence. A later first publish must preserve that
# debris while creating a new, independently sealed sequence-one commit.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-first-vintage-only", series_id="test.first-vintage-only",
                      fixture={"as_of": "2026-08-09", "rows": [{"period": "2026-08-09", "value": 1.0}]})
first_vintage_man = json.load(open(os.path.join(d, "connector.json")))
real_receipt_write = m._write_commit_receipt
def fail_after_first_vintage(*_args, **_kwargs):
    raise OSError("simulated crash after first vintage before receipt")
m._write_commit_receipt = fail_after_first_vintage
try:
    first_vintage_partial = rows_for(m.run(
        data, force=True, connectors_root=croot, now=datetime(2026, 8, 9, tzinfo=timezone.utc),
    ), first_vintage_man["id"], "AAA")[0]
finally:
    m._write_commit_receipt = real_receipt_write
first_vintage_paths = m.connector_storage_paths(data, first_vintage_man, "AAA")
first_vintage_retry = rows_for(m.run(
    data, force=True, connectors_root=croot, now=datetime(2026, 8, 9, 1, tzinfo=timezone.utc),
), first_vintage_man["id"], "AAA")[0]
first_vintage_current = json.load(open(first_vintage_paths["current"]))
first_vintage_pit = m.read_point_in_time(
    data, first_vintage_man["series_id"], "AAA", "2026-08-10", connectors_root=croot,
)
first_vintage_files = os.listdir(first_vintage_paths["vintages"])
check("a first vintage-only crash preserves forensics but cannot brick a clean retry",
      first_vintage_partial["failure_kind"] == "publish_error"
      and first_vintage_retry["decision"] == "refetched"
      and first_vintage_current["committed_count"] == 1
      and len(first_vintage_files) == 2
      and first_vintage_pit is not None and first_vintage_pit["vintage_id"] == first_vintage_current["vintage_id"])
shutil.rmtree(root)


# The same receipt-before-marker crash can occur after an established current.
# The old pointer is intentionally unusable until the unique linked successor
# is recovered; the next sweep must finish it instead of quarantining forever.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-later-receipt-before-marker", series_id="test.later-receipt-before-marker",
                      fixture={"as_of": "2026-08-08", "rows": [{"period": "2026-08-08", "value": 1.0}]})
later_man = json.load(open(os.path.join(d, "connector.json")))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 8, tzinfo=timezone.utc))
later_paths = m.connector_storage_paths(data, later_man, "AAA")
later_old = json.load(open(later_paths["current"]))
json.dump({"as_of": "2026-08-09", "rows": [{"period": "2026-08-09", "value": 2.0}]},
          open(os.path.join(d, "fixture.json"), "w"))
m._write_commit_marker = fail_before_first_marker
try:
    later_partial = rows_for(m.run(
        data, force=True, connectors_root=croot, now=datetime(2026, 8, 9, tzinfo=timezone.utc),
    ), later_man["id"], "AAA")[0]
finally:
    m._write_commit_marker = real_marker_write
try:
    m.verify_current_pointer(later_man, "AAA", data, later_old, require_live_publisher=False)
    later_old_rejected_while_pending = False
except RuntimeError:
    later_old_rejected_while_pending = True
later_pending_candidate = m.recover_pending_current(
    data,
    connector_id=later_man["id"], dataset_id=later_man["dataset_id"],
    series_id=later_man["series_id"], subject="AAA", provider=later_man["provider"],
    current=later_old,
)
later_zero_marker = m._commit_marker_path(data, later_pending_candidate)
later_zero_marker_bytes = m.canonical_json_bytes(m._commit_marker_record(later_pending_candidate))
os.makedirs(os.path.dirname(later_zero_marker), exist_ok=True)
open(later_zero_marker, "wb").close()
later_zero_inode = os.lstat(later_zero_marker).st_ino
later_recovered = rows_for(m.run(
    data, connectors_root=croot, now=datetime(2026, 8, 9, 1, tzinfo=timezone.utc),
), later_man["id"], "AAA")[0]
later_current = json.load(open(later_paths["current"]))
later_pit = m.read_point_in_time(data, later_man["series_id"], "AAA", "2026-08-10", connectors_root=croot)
check("a later receipt-sealed successor completes its zero-byte marker and advances current exactly once",
      later_partial["failure_kind"] == "publish_error" and later_old_rejected_while_pending
      and later_recovered["decision"] == "recovered_commit"
      and later_current["committed_count"] == 2
      and os.lstat(later_zero_marker).st_ino == later_zero_inode
      and open(later_zero_marker, "rb").read() == later_zero_marker_bytes
      and later_pit is not None and later_pit["payload"]["rows"][0]["value"] == 2.0)
shutil.rmtree(root)


# A surviving marker proves the winner of a cross-host same-sequence race. A
# fully valid losing receipt/vintage at that sequence is retained for audit but
# must not poison the winner's current/PIT chain.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-losing-receipt", series_id="test.losing-receipt",
                      fixture={"as_of": "2026-08-08", "rows": [{"period": "2026-08-08", "value": 1.0}]})
loser_man = json.load(open(os.path.join(d, "connector.json")))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 8, tzinfo=timezone.utc))
json.dump({"as_of": "2026-08-09", "rows": [{"period": "2026-08-09", "value": 2.0}]},
          open(os.path.join(d, "fixture.json"), "w"))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 9, tzinfo=timezone.utc))
loser_paths = m.connector_storage_paths(data, loser_man, "AAA")
winner = json.load(open(loser_paths["current"]))
winner_receipt = json.load(open(os.path.join(data, winner["commit_receipt_path"])))
first_head = winner_receipt["prior_head"]
loser_meta = json.loads(json.dumps({key: value for key, value in winner.items()
                                    if key not in {"committed_count", "committed_head",
                                                   "commit_protocol_version", "commit_receipt_path"}}))
loser_meta["retrieved_at"] = "2026-08-09T00:00:00.000001Z"
loser_meta["provenance"]["retrieved_at"] = loser_meta["retrieved_at"]
loser_meta.pop("vintage_id", None); loser_meta["provenance"].pop("vintage_id", None)
loser_meta["vintage_id"] = m.compute_vintage_id(loser_meta)
loser_meta["provenance"]["vintage_id"] = loser_meta["vintage_id"]
loser_bytes = m.canonical_json_bytes(loser_meta)
loser_vintage_path = os.path.join(loser_paths["vintages"],
    "20260809T000000000001Z_" + loser_meta["content_sha256"] + ".json")
open(loser_vintage_path, "wb").write(loser_bytes)
loser_head = m.make_linked_head(
    2, os.path.relpath(loser_vintage_path, os.path.realpath(data)),
    hashlib.sha256(loser_bytes).hexdigest(), first_head,
)
loser_candidate = {**loser_meta, "committed_count": 2, "committed_head": loser_head,
                   "commit_protocol_version": 1}
loser_candidate["commit_receipt_path"] = os.path.relpath(
    m._commit_receipt_path(data, loser_candidate), os.path.realpath(data),
)
m._write_commit_receipt(data, loser_candidate, first_head)
try:
    m.verify_current_pointer(loser_man, "AAA", data, winner, require_live_publisher=False)
    winner_with_loser_usable = True
except RuntimeError:
    winner_with_loser_usable = False
loser_race_pit = m.read_point_in_time(
    data, loser_man["series_id"], "AAA", "2026-08-10", connectors_root=croot,
)
check("a marker-proven cross-host loser receipt is retained without poisoning the winner",
      winner_with_loser_usable and loser_race_pit is not None
      and loser_race_pit["vintage_id"] == winner["vintage_id"])
shutil.rmtree(root)


# Manual transforms cannot launder a renamed WILTW input by stripping its title
# and emitting only the report's target. The runner attests the raw source,
# scans it before transform, and stamps benign source bytes itself.
STUB_MANUAL_LAUNDER = """#!/usr/bin/env python3
import argparse, json, os
ap = argparse.ArgumentParser(); ap.add_argument('--subject'); ap.add_argument('--data-root'); ap.add_argument('--from-file'); a = ap.parse_args()
here = os.path.dirname(os.path.abspath(__file__)); man = json.load(open(os.path.join(here, 'connector.json')))
raw = json.load(open(a.from_file)); payload = {'series': man['series'], 'as_of': raw['as_of'], 'rows': [{'period': raw['as_of'], 'value': float(raw['report_target'])}]}
rel = man['output_path'].replace('<SUBJECT>', a.subject).replace('<as_of>', payload['as_of']); rel = rel[5:] if rel.startswith('data/') else rel
p = os.path.join(a.data_root, rel); os.makedirs(os.path.dirname(p), exist_ok=True); json.dump(payload, open(p, 'w'))
json.dump({'provider': man['provider'], 'source_type': man['source_type'], 'tier': man['tier'], 'license': man['license'], 'connector_id': man['id'], 'dataset_id': man['dataset_id'], 'series_id': man['series_id'], 'schema_version': man['schema_version'], 'licensing': man['licensing'], 'as_of': payload['as_of'], 'source_url': 'https://example.test/manual', 'published': payload['as_of']}, open(p + '.source.json', 'w'))
"""
root, croot, data = make_repo(); os.makedirs(os.path.join(data, "GOLD"))
d = make_v2_connector(croot, "v2-manual-raw-attestation", series_id="test.manual-raw-attestation",
                      stub=STUB_MANUAL_LAUNDER)
manual_raw_man = json.load(open(os.path.join(d, "connector.json")))
manual_raw_man.update({"subjects": ["GOLD"], "manual": True, "acquisition": "manual",
                       "manual_ingest": {"file_arg": "--from-file"}})
manual_raw_man["licensing"] = {"access": "restricted", "use": "entitlement_required",
                                "redistribution": "prohibited", "terms_url": "https://example.test/terms"}
json.dump(manual_raw_man, open(os.path.join(d, "connector.json"), "w"))
launder_source = os.path.join(root, "innocent-weekly-input.json")
json.dump({"title": "What I Learned This Week", "as_of": "2026-08-09", "report_target": 5597},
          open(launder_source, "w"))
laundered = m.run_manual_ingest(
    data, manual_raw_man["id"], "GOLD", launder_source, connectors_root=croot,
    now=datetime(2026, 8, 9, tzinfo=timezone.utc),
)["rows"][0]
manual_raw_paths = m.connector_storage_paths(data, manual_raw_man, "GOLD")
benign_source = os.path.join(root, "lawful-primary-input.json")
json.dump({"as_of": "2026-08-09", "report_target": 2.5}, open(benign_source, "w"))
benign_hash = hashlib.sha256(open(benign_source, "rb").read()).hexdigest()
benign_size = os.path.getsize(benign_source)
benign = m.run_manual_ingest(
    data, manual_raw_man["id"], "GOLD", benign_source, connectors_root=croot,
    now=datetime(2026, 8, 9, 1, tzinfo=timezone.utc),
)["rows"][0]
manual_current = json.load(open(manual_raw_paths["current"]))
manual_serialized = json.dumps(manual_current)
expected_manual_input = {"sha256": benign_hash, "size_bytes": benign_size,
                         "filename": os.path.basename(benign_source), "detected_format": "text"}
check("manual WILTW laundering is rejected before transform and publishes no canonical history",
      laundered["failure_kind"] == "invalid_provenance"
      and "WILTW" in laundered["message"] and benign["decision"] == "manual_ingested")
check("publisher freezes raw manual bytes in vintage/provenance without leaking a local path",
      manual_current.get("manual_input") == expected_manual_input
      and manual_current.get("provenance", {}).get("manual_input") == expected_manual_input
      and manual_current["provenance"].get("acquired_via") == "manual_local_file"
      and root not in manual_serialized)
shutil.rmtree(root)


# os.walk suppresses traversal errors unless onerror re-raises.  Every
# identity/history scan must discard partial results on such an error.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-walk-error", series_id="test.walk-error",
                      fixture={"as_of": "2026-08-09", "rows": [{"period": "2026-08-09", "value": 1.0}]})
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 9, tzinfo=timezone.utc))
walk_man = json.load(open(os.path.join(d, "connector.json")))
real_walk = m.os.walk
real_listdir = m.os.listdir
def denied_walk(_top, *args, **kwargs):
    callback = kwargs.get("onerror")
    if callback:
        callback(PermissionError("simulated history scan denial"))
    return iter(())
def denied_current_listdir(path, *args, **kwargs):
    normalized = os.path.normpath(path)
    if (os.path.basename(normalized) == "current"
            and os.path.basename(os.path.dirname(normalized)) == "_connectors"):
        raise PermissionError("simulated current-pointer scan denial")
    return real_listdir(path, *args, **kwargs)
m.os.walk = denied_walk
m.os.listdir = denied_current_listdir
try:
    identity_scan_error = m._stable_identity_conflict(data, walk_man, "AAA")
    orphan_scan_error = m._orphaned_history_artifact(data, walk_man, "AAA")
    pit_scan_error = m.read_point_in_time(
        data, walk_man["series_id"], "AAA", "2026-08-09T12:00:00Z", connectors_root=croot,
    )
finally:
    m.os.walk = real_walk
    m.os.listdir = real_listdir
check("identity/history walk errors fail closed instead of returning partial scan results",
      identity_scan_error is not None and "cannot scan" in identity_scan_error
      and orphan_scan_error is not None and pit_scan_error is None)
shutil.rmtree(root)


# Point-in-time discovery is scoped to the requested semantic lane. A corrupt
# current pointer for another series must quarantine only that lane; it cannot
# turn an otherwise valid historical replay into a global outage.
root, croot, data = make_repo()
first_dir = make_v2_connector(
    croot, "v2-pit-isolated-first", series_id="test.pit-isolated-first",
    fixture={"as_of": "2026-08-09", "rows": [{"period": "2026-08-09", "value": 1.0}]},
)
second_dir = make_v2_connector(
    croot, "v2-pit-isolated-second", series_id="test.pit-isolated-second",
    fixture={"as_of": "2026-08-09", "rows": [{"period": "2026-08-09", "value": 2.0}]},
)
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 9, tzinfo=timezone.utc))
first_man = json.load(open(os.path.join(first_dir, "connector.json")))
second_man = json.load(open(os.path.join(second_dir, "connector.json")))
first_current = m.connector_storage_paths(data, first_man, "AAA")["current"]
second_current = m.connector_storage_paths(data, second_man, "AAA")["current"]
open(second_current, "w").write("{malformed unrelated current")
isolated_pit = m.read_point_in_time(
    data, first_man["series_id"], "AAA", "2026-08-09T12:00:00Z", connectors_root=croot,
)
open(first_current, "w").write("{malformed requested current")
poisoned_target_pit = m.read_point_in_time(
    data, first_man["series_id"], "AAA", "2026-08-09T12:00:00Z", connectors_root=croot,
)
check("PIT ignores corrupt unrelated current lanes but fails closed for the requested lane",
      isolated_pit is not None and isolated_pit.get("usable") is True
      and isolated_pit.get("payload", {}).get("rows", [{}])[0].get("value") == 1.0
      and poisoned_target_pit is None)
shutil.rmtree(root)


# More-than-one history requires a real array path; top-level fields and
# object key counts are never observations.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-history-path", series_id="test.history-path")
history_man = json.load(open(os.path.join(d, "connector.json")))
history_man["minimum_history"] = {"observations": 2}
no_path_errors = m.validate_manifest(history_man["id"], d, history_man)
history_man["minimum_history"] = {"observations": 2, "path": "metadata"}
history_man["output_schema"]["metadata"] = "object"
history_man["units"]["metadata.*"] = "index"
object_path_errors = m.validate_manifest(history_man["id"], d, history_man)
history_man["minimum_history"] = {"observations": 2, "path": "rows"}
valid_history_errors = m.validate_manifest(history_man["id"], d, history_man)
bad_history_payload = {"series": history_man["series"], "as_of": "2026-08-10",
                       "rows": {"first": 1, "second": 2}, "metadata": {}}
history_sidecar = fetched_for(history_man, {
    "as_of": "2026-08-10", "rows": [{"period": "2026-08-10", "value": 1.0}], "metadata": {},
})["sidecar"]
history_defects = m.validate_staged_output(
    history_man, "AAA", bad_history_payload, history_sidecar, "2026-08-10",
)
check("minimum_history > 1 requires a schema-valid observation-array path",
      any("path is required" in error for error in no_path_errors)
      and any("observation array" in error for error in object_path_errors)
      and not valid_history_errors
      and any("observation list" in error for error in history_defects))
shutil.rmtree(root)


# Open-object metrics still obey strict JSON number semantics recursively, and
# canonicalization itself is a second fail-closed boundary.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-nonfinite", series_id="test.nonfinite")
nonfinite_man = json.load(open(os.path.join(d, "connector.json")))
nonfinite_man["output_schema"] = {"series": "string", "as_of": "date", "metrics": "object"}
nonfinite_man["units"] = {"metrics.*": "index"}
nonfinite_man["minimum_history"] = {"observations": 1}
nonfinite_payload = {"series": nonfinite_man["series"], "as_of": "2026-08-10",
                     "metrics": {"nested": [{"nan": float("nan")}, {"inf": float("inf")}]}}
nonfinite_sidecar = fetched_for(nonfinite_man, {
    "as_of": "2026-08-10", "metrics": {"ok": 1.0},
})["sidecar"]
nonfinite_errors = m.validate_staged_output(
    nonfinite_man, "AAA", nonfinite_payload, nonfinite_sidecar, "2026-08-10",
)
try:
    m.canonical_json_bytes(nonfinite_payload)
    canonical_rejected_nonfinite = False
except ValueError:
    canonical_rejected_nonfinite = True
check("NaN and Infinity are rejected recursively in open objects and by canonical JSON",
      len([error for error in nonfinite_errors if "finite JSON numbers" in error]) == 2
      and canonical_rejected_nonfinite)
shutil.rmtree(root)


# Cross-runtime canonical connector bytes use ECMAScript numeric spelling and
# fail closed outside the subset TypeScript can reproduce exactly.
canonical_edge = m.canonical_json_bytes({"one": 1.0, "tiny": 1e-6, "negativeZero": -0.0})
unicode_prefix_file = tempfile.mktemp(prefix="canonical-prefix-")
open(unicode_prefix_file, "wb").write(m.canonical_json_bytes({"\U00010000": 1, "\ue000": 2})[:-2])
unicode_prefix_ok = m.canonical_json_object_strict_prefix(unicode_prefix_file)
os.unlink(unicode_prefix_file)
canonical_rejections = []
for unsafe in (float("nan"), float("inf"), 9_007_199_254_740_992, "\ud800"):
    try:
        m.canonical_json_bytes({"value": unsafe})
        canonical_rejections.append(False)
    except ValueError:
        canonical_rejections.append(True)
check("connector canonical JSON is cross-runtime for floats and rejects unsafe values",
      canonical_edge == b'{"negativeZero":0,"one":1,"tiny":0.000001}\n'
      and all(canonical_rejections) and unicode_prefix_ok, repr(canonical_edge))


# Manifest-owned provenance, temporal fields, and compact datetimes are
# validated before the publisher can freeze contradictory child assertions.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-sidecar-contract", series_id="test.sidecar-contract")
sidecar_man = json.load(open(os.path.join(d, "connector.json")))
sidecar_payload = {"series": sidecar_man["series"], "as_of": "2026-08-09",
                   "rows": [{"period": "2026-08-09", "value": 1.0}]}
sidecar_base = fetched_for(sidecar_man, sidecar_payload)["sidecar"]
forged_fields = {
    "provider_priority": 999, "acquisition": "paid_api", "authority_class": "other",
    "release": {"cadence": "annual"}, "output_schema": {}, "units": {},
    "minimum_history": {"observations": 999},
}
forged_rejected = True
for field, value in forged_fields.items():
    forged = {**sidecar_base, field: value}
    defects = m.validate_staged_output(
        sidecar_man, "AAA", sidecar_payload, forged, sidecar_payload["as_of"],
        retrieved_at=datetime(2026, 8, 10, tzinfo=timezone.utc),
    )
    forged_rejected = forged_rejected and any(
        "publisher-owned" in defect and field in defect for defect in defects
    )
bad_received = {**sidecar_base, "received": "2099-99-99"}
bad_published = {**sidecar_base, "published_at": "2099-01-01T00:00:00Z"}
good_times = {**sidecar_base, "received": "2026-08-10", "published_at": "2026-08-09T12:00:00Z"}
check("sidecar cannot forge manifest-owned fields or impossible/future provenance dates",
      forged_rejected
      and any("real date" in defect for defect in m.validate_staged_output(
          sidecar_man, "AAA", sidecar_payload, bad_received, sidecar_payload["as_of"],
          retrieved_at=datetime(2026, 8, 10, tzinfo=timezone.utc)))
      and any("after retrieval" in defect for defect in m.validate_staged_output(
          sidecar_man, "AAA", sidecar_payload, bad_published, sidecar_payload["as_of"],
          retrieved_at=datetime(2026, 8, 10, tzinfo=timezone.utc)))
      and not m.validate_staged_output(
          sidecar_man, "AAA", sidecar_payload, good_times, sidecar_payload["as_of"],
          retrieved_at=datetime(2026, 8, 10, 13, tzinfo=timezone.utc)))
check("compact datetime validation rejects impossible calendar and clock values",
      bool(validate_payload("2026-99-99T25:99:99Z", "datetime"))
      and not validate_payload("2026-08-10T12:34:56.123Z", "datetime"))
unsafe_manifest = json.loads(json.dumps(sidecar_man)); unsafe_manifest["provider_priority"] = 9_007_199_254_740_992
surrogate_manifest = json.loads(json.dumps(sidecar_man)); surrogate_manifest["series"] = "bad-\ud800"
unsafe_payload = json.loads(json.dumps(sidecar_payload)); unsafe_payload["rows"][0]["value"] = 9_007_199_254_740_992
surrogate_sidecar = {**sidecar_base, "note": "bad-\ud800"}
check("manifest and staged records reject unsafe integers and lone surrogates before publication",
      any("canonical JSON domain" in defect for defect in m.validate_manifest(
          os.path.basename(d), d, unsafe_manifest))
      and any("canonical JSON domain" in defect for defect in m.validate_manifest(
          os.path.basename(d), d, surrogate_manifest))
      and any("canonical JSON domain" in defect for defect in m.validate_staged_output(
          sidecar_man, "AAA", unsafe_payload, sidecar_base, unsafe_payload["as_of"]))
      and any("canonical JSON domain" in defect for defect in m.validate_staged_output(
          sidecar_man, "AAA", sidecar_payload, surrogate_sidecar, sidecar_payload["as_of"])))
_outcome, sidecar_current, _projection_error = m.publish_validated(
    sidecar_man, "AAA", data,
    {"payload": sidecar_payload, "sidecar": sidecar_base, "as_of": sidecar_payload["as_of"]},
    datetime(2026, 8, 10, tzinfo=timezone.utc), connector_hash="a" * 64, commit="fixture",
)
sidecar_meta = {key: value for key, value in sidecar_current.items()
                if key not in {"committed_count", "committed_head", "commit_protocol_version",
                               "commit_receipt_path"}}
contradictory_meta = json.loads(json.dumps(sidecar_meta))
contradictory_meta["provenance"]["authority_class"] = "forged"
contradictory_meta.pop("vintage_id"); contradictory_meta["provenance"].pop("vintage_id")
contradictory_meta["vintage_id"] = m.compute_vintage_id(contradictory_meta)
contradictory_meta["provenance"]["vintage_id"] = contradictory_meta["vintage_id"]
check("vintage identity rejects internally rehashed provenance contradictions",
      cv._identity_matches(sidecar_meta, sidecar_meta, sidecar_man["series_id"], "AAA")
      and not cv._identity_matches(
          contradictory_meta, contradictory_meta, sidecar_man["series_id"], "AAA",
      ))
event_man = json.loads(json.dumps(sidecar_man))
event_man["release"] = {**event_man["release"], "cadence": "event_driven", "expected_lag_days": 1}
check("event-driven manifests cannot declare an ignored release lag",
      any("event-driven" in defect for defect in m.validate_manifest(
          os.path.basename(d), d, event_man,
      )))
shutil.rmtree(root)


# Durable/request URLs reject credential-like query aliases after decoding,
# raw fragments/whitespace/oversize forms, and arbitrary scheme-bearing nested
# fields. Licensing terms may live on a lawful public host outside fetch scope.
credential_url_rejections = []
for query_key in ("apiToken", "vendorPrivateKey", "x-amz-credential", "api%54oken"):
    try:
        connector_https_url_host(f"https://example.test/data?{query_key}=secret", ["example.test"])
        credential_url_rejections.append(False)
    except ValueError:
        credential_url_rejections.append(True)
other_bad_urls = [
    " https://example.test/data", "https://example.test/data#fragment",
    "https://example.test/" + ("x" * 2_100),
]
other_url_rejections = []
for raw_url in other_bad_urls:
    try:
        connector_https_url_host(raw_url, ["example.test"])
        other_url_rejections.append(False)
    except ValueError:
        other_url_rejections.append(True)
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-url-depth", series_id="test.url-depth")
depth_man = json.load(open(os.path.join(d, "connector.json")))
depth_payload = {"series": depth_man["series"], "as_of": "2026-08-09",
                 "rows": [{"period": "2026-08-09", "value": 1.0}]}
depth_sidecar = fetched_for(depth_man, depth_payload)["sidecar"]
endpoint_sidecar = {**depth_sidecar, "routing": {"mirrorEndpoint": "file:///tmp/private"}}
logo_only = {key: value for key, value in depth_sidecar.items() if key != "source_url"}
logo_only["logoUrl"] = "https://example.test/logo.svg"
terms_man = json.loads(json.dumps(depth_man))
terms_man["licensing"]["terms_url"] = "https://terms.example.org/licence"
terms_sidecar = {**depth_sidecar, "licensing": terms_man["licensing"]}
check("URL policy closes query, fragment, whitespace, length, direct-scheme and logo-only gaps",
      all(credential_url_rejections) and all(other_url_rejections)
      and any("URL policy" in defect for defect in m.validate_staged_output(
          depth_man, "AAA", depth_payload, endpoint_sidecar, depth_payload["as_of"]))
      and any("top-level source_url" in defect for defect in m.validate_staged_output(
          depth_man, "AAA", depth_payload, logo_only, depth_payload["as_of"]))
      and not m.validate_staged_output(
          terms_man, "AAA", depth_payload, terms_sidecar, depth_payload["as_of"]))
shutil.rmtree(root)


# Production discovery accepts only v2. Legacy normalization remains available
# solely to the explicit historical unit-test switch.
root, croot, data = make_repo(); make_connector(croot, "legacy-production-reject")
legacy_switch = m.ALLOW_LEGACY_CONNECTORS_FOR_TESTS
m.ALLOW_LEGACY_CONNECTORS_FOR_TESTS = False
try:
    legacy_valid, legacy_skipped = m.discover(croot)
finally:
    m.ALLOW_LEGACY_CONNECTORS_FOR_TESTS = legacy_switch
check("production discovery rejects v1 manifests",
      not legacy_valid and any(name == "legacy-production-reject" and "version 2" in reason
                               for name, reason in legacy_skipped), repr(legacy_skipped))
shutil.rmtree(root)


# Case-insensitive deployment aliases are rejected for subjects, projections,
# and canonical current identities even when case-sensitive coverage keys differ.
root, croot, data = make_repo()
d = make_v2_connector(croot, "case-contract", series_id="Series.Case", dataset_id="Data.Case")
case_man = json.load(open(os.path.join(d, "connector.json")))
lower_subject = json.loads(json.dumps(case_man)); lower_subject["subjects"] = ["gold"]
subject_defects = m.validate_manifest(os.path.basename(d), d, lower_subject)
case_peer = json.loads(json.dumps(case_man))
case_peer.update({"id": "case-contract-peer", "dataset_id": "data.case", "series_id": "series.case",
                  "output_path": "data/<SUBJECT>/external/case-peer/value_<as_of>.json"})
case_errors = coverage_errors([case_man, case_peer])
check("uppercase subjects and casefolded canonical-current identity are enforced",
      any("uppercase" in defect for defect in subject_defects)
      and all(any("canonical current identity collision" in defect for defect in case_errors.get(cid, []))
              for cid in (case_man["id"], case_peer["id"])), repr(case_errors))
shutil.rmtree(root)


# A dependency-poor launchd interpreter still scans all OOXML XML text before
# manual transform. The fallback is stdlib-only and returns a raw-byte attestation.
root = tempfile.mkdtemp(prefix="manual-ooxml-")
xlsx_path = os.path.join(root, "official-metals-export.xlsx")
with zipfile.ZipFile(xlsx_path, "w") as archive:
    archive.writestr("[Content_Types].xml", '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>')
    archive.writestr("xl/sharedStrings.xml", '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><si><t>Official exchange metals positions</t></si></sst>')
interpreter = "/opt/homebrew/bin/python3" if os.path.isfile("/opt/homebrew/bin/python3") else sys.executable
manual_code = f'''import importlib.util,json,shutil\n'
spec=importlib.util.spec_from_file_location("runner", {os.path.join(HERE, "run_connectors.py")!r})\n'
runner=importlib.util.module_from_spec(spec); spec.loader.exec_module(runner)\n'
runner._manual_identity_reader=lambda: (_ for _ in ()).throw(ImportError("dependency poor"))\n'
snap_root,snap,att=runner._snapshot_and_attest_manual_source({xlsx_path!r}, "GOLD")\n'
print(json.dumps(att,sort_keys=True)); shutil.rmtree(snap_root)\n'''.replace("\n'", "\n")
manual_proc = subprocess.run([interpreter, "-c", manual_code], cwd=m.REPO,
                             capture_output=True, text=True)
manual_attestation = json.loads(manual_proc.stdout) if manual_proc.returncode == 0 else None
check("dependency-poor Python performs complete stdlib OOXML manual attestation",
      isinstance(manual_attestation, dict)
      and manual_attestation.get("sha256") == hashlib.sha256(open(xlsx_path, "rb").read()).hexdigest()
      and manual_attestation.get("detected_format") == "zip",
      repr({"interpreter": interpreter, "stderr": manual_proc.stderr, "attestation": manual_attestation}))
shutil.rmtree(root)


# Hard-death O_EXCL prefixes in blob/vintage/receipt lanes never enter PIT.
# Blob names uniquely bind the expected bytes and are completed in-place;
# unreachable vintage/receipt prefixes remain preserved forensic artifacts.
prefix_results = []
for lane_name, lane_fragment in (
    ("blob", "/_connectors/blobs/"),
    ("vintage", "/_connectors/vintages/"),
    ("receipt", "/_connectors/commits/"),
):
    root, croot, data = make_repo()
    d = make_v2_connector(croot, f"v2-prefix-{lane_name}", series_id=f"test.prefix-{lane_name}",
                          fixture={"as_of": "2026-08-08", "rows": [{"period": "2026-08-08", "value": 1.0}]})
    prefix_man = json.load(open(os.path.join(d, "connector.json")))
    m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 8, tzinfo=timezone.utc))
    prefix_paths = m.connector_storage_paths(data, prefix_man, "AAA")
    old_current = json.load(open(prefix_paths["current"]))
    json.dump({"as_of": "2026-08-09", "rows": [{"period": "2026-08-09", "value": 2.0}]},
              open(os.path.join(d, "fixture.json"), "w"))
    real_write_once = m._write_once
    crash_state = {"path": None, "inode": None}
    def prefix_crash(path, data_bytes, *, _fragment=lane_fragment):
        normalized = path.replace(os.sep, "/")
        if crash_state["path"] is None and _fragment in normalized:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            os.write(fd, data_bytes[:31]); os.fsync(fd); os.close(fd)
            crash_state.update({"path": path, "inode": os.lstat(path).st_ino})
            raise RuntimeError(f"simulated hard death in {lane_name}")
        return real_write_once(path, data_bytes)
    m._write_once = prefix_crash
    try:
        partial_row = rows_for(m.run(
            data, force=True, connectors_root=croot,
            now=datetime(2026, 8, 9, tzinfo=timezone.utc),
        ), prefix_man["id"], "AAA")[0]
    finally:
        m._write_once = real_write_once
    old_pit = m.read_point_in_time(
        data, prefix_man["series_id"], "AAA", "2026-08-09T00:30:00Z", connectors_root=croot,
    )
    retry_row = rows_for(m.run(
        data, force=True, connectors_root=croot,
        now=datetime(2026, 8, 9, 1, tzinfo=timezone.utc),
    ), prefix_man["id"], "AAA")[0]
    new_current = json.load(open(prefix_paths["current"]))
    if lane_name == "blob":
        artifact_ok = (os.lstat(crash_state["path"]).st_ino == crash_state["inode"]
                       and hashlib.sha256(open(crash_state["path"], "rb").read()).hexdigest()
                       == new_current["content_sha256"])
    else:
        artifact_ok = (os.path.getsize(crash_state["path"]) == 31
                       and m.canonical_json_object_strict_prefix(crash_state["path"]))
    prefix_results.append(
        partial_row.get("failure_kind") == "publish_error"
        and old_pit is not None and old_pit["vintage_id"] == old_current["vintage_id"]
        and retry_row.get("decision") == "refetched"
        and new_current.get("committed_count") == 2 and artifact_ok
    )
    shutil.rmtree(root)
check("blob/vintage/receipt hard-death prefixes preserve old PIT and recover on retry",
      all(prefix_results), repr(prefix_results))


# Zero-byte O_EXCL debris is safe only after the enclosing canonical lane and
# publisher-shaped filename prove it is unreachable. It remains forensic and
# never becomes a committed/PIT vintage.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-first-zero-debris", series_id="test.first-zero-debris",
                      fixture={"as_of": "2026-08-09", "rows": [{"period": "2026-08-09", "value": 1.0}]})
first_zero_man = json.load(open(os.path.join(d, "connector.json")))
first_zero_paths = m.connector_storage_paths(data, first_zero_man, "AAA")
first_zero_vintage = os.path.join(
    first_zero_paths["vintages"], f"20260809T000000000000Z_{'0' * 64}.json",
)
first_zero_receipt_dir = os.path.join(
    data, "_connectors", "commits", first_zero_man["dataset_id"], first_zero_man["series_id"], "AAA",
)
first_zero_receipt = os.path.join(first_zero_receipt_dir, f"{'f' * 64}.json")
os.makedirs(os.path.dirname(first_zero_vintage), exist_ok=True)
os.makedirs(first_zero_receipt_dir, exist_ok=True)
open(first_zero_vintage, "wb").close(); open(first_zero_receipt, "wb").close()
first_zero_publish = rows_for(m.run(
    data, force=True, connectors_root=croot, now=datetime(2026, 8, 9, 1, tzinfo=timezone.utc),
), first_zero_man["id"], "AAA")[0]
first_zero_current = json.load(open(first_zero_paths["current"]))
first_zero_history = m.verified_committed_vintages(
    data, first_zero_current, first_zero_man["series_id"], "AAA",
)
first_zero_pit = m.read_point_in_time(
    data, first_zero_man["series_id"], "AAA", "2026-08-10", connectors_root=croot,
)
check("publisher-shaped first zero-byte vintage/receipt debris stays forensic and PIT-invisible",
      first_zero_publish["decision"] == "refetched" and first_zero_current["committed_count"] == 1
      and len(first_zero_history) == 1 and len(os.listdir(first_zero_paths["vintages"])) == 2
      and len(os.listdir(first_zero_receipt_dir)) == 2
      and os.path.getsize(first_zero_vintage) == os.path.getsize(first_zero_receipt) == 0
      and first_zero_pit is not None and first_zero_pit["vintage_id"] == first_zero_current["vintage_id"])
shutil.rmtree(root)

root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-later-zero-debris", series_id="test.later-zero-debris",
                      fixture={"as_of": "2026-08-08", "rows": [{"period": "2026-08-08", "value": 1.0}]})
later_zero_man = json.load(open(os.path.join(d, "connector.json")))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 8, tzinfo=timezone.utc))
later_zero_paths = m.connector_storage_paths(data, later_zero_man, "AAA")
later_zero_current_before = json.load(open(later_zero_paths["current"]))
later_zero_vintage = os.path.join(
    later_zero_paths["vintages"], f"20260808T000000000001Z_{'0' * 64}.json",
)
later_zero_receipt_dir = os.path.dirname(os.path.join(data, later_zero_current_before["commit_receipt_path"]))
later_zero_receipt = os.path.join(later_zero_receipt_dir, f"{'f' * 64}.json")
open(later_zero_vintage, "wb").close(); open(later_zero_receipt, "wb").close()
try:
    m.verify_current_pointer(later_zero_man, "AAA", data, later_zero_current_before,
                             require_live_publisher=False)
    later_zero_keeps_current = True
except RuntimeError:
    later_zero_keeps_current = False
old_zero_pit = m.read_point_in_time(
    data, later_zero_man["series_id"], "AAA", "2026-08-08T23:59:59Z", connectors_root=croot,
)
json.dump({"as_of": "2026-08-09", "rows": [{"period": "2026-08-09", "value": 2.0}]},
          open(os.path.join(d, "fixture.json"), "w"))
later_zero_retry = rows_for(m.run(
    data, force=True, connectors_root=croot, now=datetime(2026, 8, 9, tzinfo=timezone.utc),
), later_zero_man["id"], "AAA")[0]
later_zero_current_after = json.load(open(later_zero_paths["current"]))
later_zero_history = m.verified_committed_vintages(
    data, later_zero_current_after, later_zero_man["series_id"], "AAA",
)
check("publisher-shaped later zero-byte vintage/receipt debris preserves current and stays outside PIT",
      later_zero_keeps_current and old_zero_pit is not None
      and old_zero_pit["vintage_id"] == later_zero_current_before["vintage_id"]
      and later_zero_retry["decision"] == "refetched" and later_zero_current_after["committed_count"] == 2
      and len(later_zero_history) == 2 and len(os.listdir(later_zero_paths["vintages"])) == 3
      and len(os.listdir(later_zero_receipt_dir)) == 3
      and os.path.getsize(later_zero_vintage) == os.path.getsize(later_zero_receipt) == 0)
arbitrary_zero = os.path.join(later_zero_paths["vintages"], "unexpected.json")
open(arbitrary_zero, "wb").close()
try:
    m.verify_current_pointer(later_zero_man, "AAA", data, later_zero_current_after,
                             require_live_publisher=False)
    arbitrary_zero_rejected = False
except RuntimeError:
    arbitrary_zero_rejected = True
check("arbitrary zero-byte debris is not admitted as a canonical interrupted record",
      arbitrary_zero_rejected and not m.canonical_json_object_strict_prefix(arbitrary_zero))
shutil.rmtree(root)


# Crash debris is admissible only under the publisher's immutable filename
# grammar.  An arbitrary strict JSON prefix must fail current health now (not
# remain usable until the next publisher scan bricks), and a complete receipt
# copy cannot lie about the metadata hash encoded by its filename.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-debris-name-grammar", series_id="test.debris-name-grammar",
                      fixture={"as_of": "2026-08-08", "rows": [{"period": "2026-08-08", "value": 1.0}]})
debris_man = json.load(open(os.path.join(d, "connector.json")))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 8, tzinfo=timezone.utc))
debris_paths = m.connector_storage_paths(data, debris_man, "AAA")
debris_current = json.load(open(debris_paths["current"]))
debris_receipt_dir = os.path.dirname(os.path.join(data, debris_current["commit_receipt_path"]))
bad_receipt_prefix = os.path.join(debris_receipt_dir, "unexpected.json")
open(bad_receipt_prefix, "wb").write(b'{"a":')
try:
    m.verify_current_pointer(debris_man, "AAA", data, debris_current, require_live_publisher=False)
    bad_receipt_prefix_rejected = False
except RuntimeError:
    bad_receipt_prefix_rejected = True
os.unlink(bad_receipt_prefix)
bad_vintage_prefix = os.path.join(debris_paths["vintages"], "unexpected.json")
open(bad_vintage_prefix, "wb").write(b'{"a":')
try:
    m.verify_current_pointer(debris_man, "AAA", data, debris_current, require_live_publisher=False)
    bad_vintage_prefix_rejected = False
except RuntimeError:
    bad_vintage_prefix_rejected = True
os.unlink(bad_vintage_prefix)
real_receipt_path = os.path.join(data, debris_current["commit_receipt_path"])
wrong_hash = "0" * 64 if debris_current["committed_head"]["metadata_sha256"] != "0" * 64 else "f" * 64
wrong_named_receipt = os.path.join(debris_receipt_dir, f"{wrong_hash}.json")
shutil.copyfile(real_receipt_path, wrong_named_receipt)
try:
    m.verify_current_pointer(debris_man, "AAA", data, debris_current, require_live_publisher=False)
    wrong_named_receipt_rejected = False
except RuntimeError:
    wrong_named_receipt_rejected = True
check("only canonical immutable debris names are ignored by current health",
      bad_receipt_prefix_rejected and bad_vintage_prefix_rejected and wrong_named_receipt_rejected,
      repr({"receipt_prefix": bad_receipt_prefix_rejected,
            "vintage_prefix": bad_vintage_prefix_rejected,
            "wrong_named_receipt": wrong_named_receipt_rejected}))
shutil.rmtree(root)


# Exact on-disk spelling is part of a canonical path's identity.  The first
# assertion is deterministic on Linux because the helper rejects a case-fold
# sibling; the second explicitly covers the APFS path-alias behavior whenever
# this test directory is mounted case-insensitively.
root = tempfile.mkdtemp(prefix="connector-path-case-")
os.mkdir(os.path.join(root, "_CONNECTORS"))
lowercase_alias = os.path.join(root, "_connectors")
alias_resolves_on_filesystem = os.path.lexists(lowercase_alias)
case_alias_rejected = m.no_symlink_path(root, lowercase_alias) is None
check("canonical descendants reject an existing wrong-case directory entry",
      case_alias_rejected)
check("case-insensitive filesystem aliases require the exact stored spelling",
      not alias_resolves_on_filesystem or case_alias_rejected,
      repr({"case_insensitive": alias_resolves_on_filesystem,
            "rejected": case_alias_rejected}))
shutil.rmtree(root)


# Canonical lane aliases, relocated current pointers, and stranded publisher
# temp names cannot be mistaken for identity. A symlink at the caller's data
# root itself remains supported because it resolves before lane validation.
root, croot, data = make_repo()
d = make_v2_connector(croot, "v2-path-hardening", series_id="test.path-hardening",
                      fixture={"as_of": "2026-08-08", "rows": [{"period": "2026-08-08", "value": 1.0}]})
path_man = json.load(open(os.path.join(d, "connector.json")))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 8, tzinfo=timezone.utc))
path_paths = m.connector_storage_paths(data, path_man, "AAA")
path_current = json.load(open(path_paths["current"]))
receipt_dir = os.path.dirname(os.path.join(data, path_current["commit_receipt_path"]))
marker_dir = os.path.dirname(m._commit_marker_path(data, path_current))
blob_dir = os.path.dirname(os.path.join(os.path.realpath(data), path_current["blob_path"]))
for temp_dir in (os.path.dirname(path_paths["current"]), path_paths["vintages"], receipt_dir, marker_dir, blob_dir):
    open(os.path.join(temp_dir, "harddeath123.tmp"), "wb").write(b'{"partial":')
temp_pit = m.read_point_in_time(data, path_man["series_id"], "AAA", "2026-08-09", connectors_root=croot)
data_alias = os.path.join(root, "data-alias"); os.symlink(data, data_alias)
alias_pit = m.read_point_in_time(data_alias, path_man["series_id"], "AAA", "2026-08-09", connectors_root=croot)
lane_alias_rejected = []
for lane in ("current", "vintages", "commits", "committed_heads", "blobs"):
    lane_path = os.path.join(os.path.realpath(data), "_connectors", lane)
    redirect = os.path.join(os.path.realpath(data), "_connectors", f"redirect-{lane}")
    os.rename(lane_path, redirect); os.symlink(redirect, lane_path)
    try:
        lane_alias_rejected.append(m.read_point_in_time(
            data, path_man["series_id"], "AAA", "2026-08-09", connectors_root=croot,
        ) is None)
    finally:
        os.unlink(lane_path); os.rename(redirect, lane_path)
wrong_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(path_paths["current"]))), "wrong", "path")
os.makedirs(wrong_dir, exist_ok=True)
wrong_current = os.path.join(wrong_dir, "AAA.json")
os.replace(path_paths["current"], wrong_current)
wrong_path_rejected = m.read_point_in_time(
    data, path_man["series_id"], "AAA", "2026-08-09", connectors_root=croot,
) is None
os.replace(wrong_current, path_paths["current"])
json.dump({"as_of": "2026-08-09", "rows": [{"period": "2026-08-09", "value": 2.0}]},
          open(os.path.join(d, "fixture.json"), "w"))
temp_retry = rows_for(m.run(
    data, force=True, connectors_root=croot, now=datetime(2026, 8, 9, tzinfo=timezone.utc),
), path_man["id"], "AAA")[0]
latest_path_current = json.load(open(path_paths["current"]))
projection_path = os.path.join(os.path.realpath(data), latest_path_current["legacy_path"])
projection_payload_bytes = open(projection_path, "rb").read()
projection_sidecar_bytes = open(projection_path + ".source.json", "rb").read()
def duplicate_first_json_field(raw_bytes):
    text = raw_bytes.decode("utf-8")
    comma = text.find(",")
    return ("{" + text[1:comma] + "," + text[1:]).encode("utf-8")
open(projection_path, "wb").write(duplicate_first_json_field(projection_payload_bytes))
duplicate_payload_rejected = not m.projection_is_current(
    path_man, "AAA", data, latest_path_current,
)
open(projection_path, "wb").write(projection_payload_bytes)
open(projection_path + ".source.json", "wb").write(duplicate_first_json_field(projection_sidecar_bytes))
duplicate_sidecar_rejected = not m.projection_is_current(
    path_man, "AAA", data, latest_path_current,
)
open(projection_path + ".source.json", "wb").write(projection_sidecar_bytes)
check("PIT/publisher reject canonical aliases and relocated current but tolerate temp debris + data-root alias",
      temp_pit is not None and alias_pit is not None and all(lane_alias_rejected)
      and wrong_path_rejected and temp_retry.get("decision") == "refetched"
      and duplicate_payload_rejected and duplicate_sidecar_rejected,
      repr({"lanes": lane_alias_rejected, "wrong": wrong_path_rejected, "retry": temp_retry}))
shutil.rmtree(root)


# The generic FUSE no-hardlink path cannot prove that a prefix belongs to a
# dead same-byte writer.  It must leave both a truncated claim and a live
# different claim untouched; first-marker recovery above is the narrow path
# that has enough immutable intent evidence to resume safely in place.
root = tempfile.mkdtemp(prefix="write-once-recovery-")
recover_target = os.path.join(root, "recover.json")
recover_bytes = m.canonical_json_bytes({"sealed": True, "value": 7})
open(recover_target, "wb").write(recover_bytes[:9])
valid_target = os.path.join(root, "valid.json")
valid_bytes = m.canonical_json_bytes({"owner": "other"})
open(valid_target, "wb").write(valid_bytes)
real_link = m.os.link
def no_hard_links(*_args, **_kwargs):
    raise OSError(m.errno.EOPNOTSUPP, "no hard links")
m.os.link = no_hard_links
try:
    try:
        m._write_once(recover_target, recover_bytes)
        preserved_truncated_record = False
    except RuntimeError:
        preserved_truncated_record = open(recover_target, "rb").read() == recover_bytes[:9]
    try:
        m._write_once(valid_target, m.canonical_json_bytes({"owner": "ours"}))
        preserved_valid_record = False
    except RuntimeError:
        preserved_valid_record = open(valid_target, "rb").read() == valid_bytes
finally:
    m.os.link = real_link
check("generic FUSE retry fails closed on truncated and valid differing records",
      preserved_truncated_record and preserved_valid_record)

# A still-live writer can share a long canonical prefix with a different
# marker.  The second writer must not unlink that inode based on the observed
# prefix; after it fails closed, the first writer can finish its own record.
live_target = os.path.join(root, "live-marker.json")
live_a = m.canonical_json_bytes({"commit_protocol_version": 1, "connector_id": "a", "value": 111})
live_b = m.canonical_json_bytes({"commit_protocol_version": 1, "connector_id": "a", "value": 222})
common = 0
for left, right in zip(live_a, live_b):
    if left != right:
        break
    common += 1
live_fd = os.open(live_target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
os.write(live_fd, live_a[:common])
m.os.link = no_hard_links
try:
    try:
        m._write_once(live_target, live_b)
        rejected_live_different_claim = False
    except RuntimeError:
        rejected_live_different_claim = os.lstat(live_target).st_ino == os.fstat(live_fd).st_ino
finally:
    m.os.link = real_link
os.write(live_fd, live_a[common:]); os.fsync(live_fd); os.close(live_fd)
check("FUSE retry never reclaims a live different cross-host claim",
      rejected_live_different_claim and open(live_target, "rb").read() == live_a)
shutil.rmtree(root)


# A hard-death after link(tmp, final) leaves two writable names for one inode.
# Every canonical reader must hide that record immediately. An exact replay may
# remove only a fully accounted publisher-temp alias; after bytes are changed
# through the alias, publication and PIT both remain fail-closed.
root, croot, data = make_repo()
d = make_v2_connector(
    croot, "v2-hardlink-seal", series_id="test.hardlink-seal",
    fixture={"as_of": "2026-08-08", "rows": [{"period": "2026-08-08", "value": 1.0}]},
)
hardlink_man = json.load(open(os.path.join(d, "connector.json")))
m.run(data, force=True, connectors_root=croot, now=datetime(2026, 8, 8, tzinfo=timezone.utc))
hardlink_paths = m.connector_storage_paths(data, hardlink_man, "AAA")
hardlink_current = json.load(open(hardlink_paths["current"]))
hardlink_targets = {
    "current": hardlink_paths["current"],
    "vintage": os.path.join(os.path.realpath(data), hardlink_current["committed_head"]["path"]),
    "receipt": os.path.join(os.path.realpath(data), hardlink_current["commit_receipt_path"]),
    "marker": m._commit_marker_path(data, hardlink_current),
    "blob": os.path.join(os.path.realpath(data), hardlink_current["blob_path"]),
}


def make_pending_alias(target):
    temp_dir = m._publication_temp_directory(target)
    descriptor, alias = tempfile.mkstemp(dir=temp_dir, suffix=".immutable.pending")
    os.close(descriptor); os.unlink(alias); os.link(target, alias)
    return alias


multilink_rejections = []
for label, target in hardlink_targets.items():
    alias = make_pending_alias(target)
    multilink_rejections.append((
        label,
        cv._read_regular_nofollow_bytes(target) is None,
        m.read_point_in_time(
            data, hardlink_man["series_id"], "AAA", "2026-08-09", connectors_root=croot,
        ) is None,
    ))
    os.unlink(alias)
check("PIT and sealed-object reads reject every multi-link canonical record",
      all(low_level and pit for _label, low_level, pit in multilink_rejections),
      repr(multilink_rejections))

blob_target = hardlink_targets["blob"]
blob_bytes = open(blob_target, "rb").read()
crash_alias = make_pending_alias(blob_target)
hidden_before_recovery = m.read_point_in_time(
    data, hardlink_man["series_id"], "AAA", "2026-08-09", connectors_root=croot,
) is None
m._write_once(blob_target, blob_bytes)
recovered_pit = m.read_point_in_time(
    data, hardlink_man["series_id"], "AAA", "2026-08-09", connectors_root=croot,
)
recovered_exact_alias = (
    hidden_before_recovery and not os.path.lexists(crash_alias)
    and os.lstat(blob_target).st_nlink == 1 and recovered_pit is not None
)

mutating_alias = make_pending_alias(blob_target)
with open(mutating_alias, "r+b", buffering=0) as alias_writer:
    alias_writer.seek(0); alias_writer.write(b"!"); os.fsync(alias_writer.fileno())
mutated_hidden = m.read_point_in_time(
    data, hardlink_man["series_id"], "AAA", "2026-08-09", connectors_root=croot,
) is None
try:
    m._write_once(blob_target, blob_bytes)
    mutated_replay_rejected = False
except RuntimeError:
    mutated_replay_rejected = True
check("exact crash aliases recover, but an alias write can never mutate accepted/PIT evidence",
      recovered_exact_alias and mutated_hidden and mutated_replay_rejected
      and os.path.lexists(mutating_alias) and os.lstat(blob_target).st_nlink == 2)
shutil.rmtree(root)


# ---- a same-size in-place credential rotation during the read must fail closed ----
# The post-read verification compared device, inode, size, uid and mode but not mtime/ctime, so an operator
# or rotation tool rewriting providers.env in place with equal-length bytes while the loader reads it was
# accepted: the loader then exported the STALE value and the connector authenticated with the wrong secret.
# Deterministic interleave (not a thread race): os.read returns the original bytes, and the file is rotated
# through the same inode before the verification runs — exactly the window described.
_cred_root = tempfile.mkdtemp()
os.chmod(_cred_root, 0o700)
_cred_path = os.path.join(_cred_root, "providers.env")
_ORIGINAL = b"CONNECTOR_ROTATE_TEST=originalvalue\n"
_ROTATED = b"CONNECTOR_ROTATE_TEST=rotatedvalue0\n"  # byte-identical length
assert len(_ORIGINAL) == len(_ROTATED)
with open(_cred_path, "wb") as _fh:
    _fh.write(_ORIGINAL)
os.chmod(_cred_path, 0o600)

_prev_cfg = os.environ.get("NOSTRA_ENGINE_CONFIG_DIR")
os.environ["NOSTRA_ENGINE_CONFIG_DIR"] = _cred_root
os.environ.pop("CONNECTOR_ROTATE_TEST", None)
_real_read = os.read
_rotated_once = {"done": False}


def _rotating_read(fd, size):  # noqa: ANN001 — test shim
    data = _real_read(fd, size)
    if not _rotated_once["done"] and data:
        _rotated_once["done"] = True
        with open(_cred_path, "r+b") as _rot:
            _rot.write(_ROTATED)
            _rot.flush()
            os.fsync(_rot.fileno())
    return data


os.read = _rotating_read
try:
    m.load_declared_credentials({"credential_env": ["CONNECTOR_ROTATE_TEST"]})
finally:
    os.read = _real_read
_rotate_result = os.environ.get("CONNECTOR_ROTATE_TEST")
os.environ.pop("CONNECTOR_ROTATE_TEST", None)
check("a same-size in-place providers.env rotation during the read is refused, not exported stale",
      _rotated_once["done"] and _rotate_result is None)

# control: an untouched file of the same shape still loads, so the check above is not vacuous
with open(_cred_path, "wb") as _fh:
    _fh.write(_ORIGINAL)
os.chmod(_cred_path, 0o600)
os.environ.pop("CONNECTOR_ROTATE_TEST", None)
m.load_declared_credentials({"credential_env": ["CONNECTOR_ROTATE_TEST"]})
check("an unmodified providers.env still exports its declared credential",
      os.environ.get("CONNECTOR_ROTATE_TEST") == "originalvalue")
os.environ.pop("CONNECTOR_ROTATE_TEST", None)
if _prev_cfg is None:
    os.environ.pop("NOSTRA_ENGINE_CONFIG_DIR", None)
else:
    os.environ["NOSTRA_ENGINE_CONFIG_DIR"] = _prev_cfg
shutil.rmtree(_cred_root)


# ---- the throttle clock is an ACTUAL-attempt clock ----
# A keyed connector with no credential returns credentials_missing BEFORE any network call, so its row
# records attempts: 0. Letting that advance the clock defers the next sweep for the whole cadence — up to a
# month on a monthly feed — so supplying the missing credential does not bring the feed back until the
# interval expires on its own. Only a row that really tried may move the clock.
_att_root = tempfile.mkdtemp()
os.makedirs(os.path.join(_att_root, m.LEDGER_DIR), exist_ok=True)
_att_base = {
    "connector": "prices", "dataset_id": "d1", "series_id": "s1", "provider": "p1", "subject": "WHEAT",
    "connector_commit": "c1",
}
_att_rows = [
    # no credential: no network attempt happened
    {**_att_base, "decision": "failed", "outcome": "credentials_missing", "attempts": 0,
     "checked_at": "2026-08-01T00:00:00+00:00"},
    # a different series that genuinely tried and failed — the control
    {**_att_base, "series_id": "s2", "decision": "failed", "outcome": "broken", "attempts": 3,
     "checked_at": "2026-08-01T00:00:00+00:00"},
]
with open(os.path.join(_att_root, m.LEDGER_DIR, m.LEDGER_NAME), "w", encoding="utf-8") as _fh:
    for _r in _att_rows:
        _fh.write(json.dumps(_r) + "\n")
_att_history, _att_latest, _att_warn = m._read_attempt_history(_att_root)
_missing_key = ("prices", "d1", "s1", "p1", "WHEAT")
_tried_key = ("prices", "d1", "s2", "p1", "WHEAT")
check("a zero-attempt credentials_missing failure does not start the due-attempt throttle clock",
      _missing_key not in _att_history and _att_warn is None)
check("a failure that really attempted still moves the throttle clock",
      _tried_key in _att_history)
check("a zero-attempt failure is still the latest public row for its feed",
      _att_latest.get(_missing_key, {}).get("outcome") == "credentials_missing")
shutil.rmtree(_att_root)


print(f"\n{'ALL PASS' if not failures else 'FAIL'}: run_connectors — {failures} failing case(s)")
raise SystemExit(1 if failures else 0)
