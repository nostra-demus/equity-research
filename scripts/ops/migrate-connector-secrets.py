#!/usr/bin/env python3
"""Safely preserve historical LaunchAgent connector credentials in providers.env.

Older connector service instructions stored ``CONNECTOR_*`` values in the installed plist. Connector v2
uses ``~/.config/nostra-engine/providers.env`` as the sole persisted source. This helper copies every exact
historical connector key without ever printing its value. It refuses ambiguous duplicates, value conflicts,
unsafe encodings, symlinks, foreign ownership, or group/world-readable state. The caller may remove the plist
keys only after this process exits zero.
"""
from __future__ import annotations

import os as _bootstrap_os
import sys as _bootstrap_sys

if __name__ == "__main__":
    if not _bootstrap_sys.flags.isolated:
        _bootstrap_os.execv(
            _bootstrap_sys.executable,
            [_bootstrap_sys.executable, "-I", _bootstrap_os.path.abspath(__file__), *_bootstrap_sys.argv[1:]],
        )
    if _bootstrap_sys.pycache_prefix is None:
        import tempfile as _bootstrap_tempfile
        _bootstrap_cache = _bootstrap_tempfile.mkdtemp(
            prefix=f"nostra-connector-secret-migration-pycache-{_bootstrap_os.getpid()}-"
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
import fcntl
import json
import os
import plistlib
import re
import stat
import shutil
import subprocess
import sys
import tempfile

_ephemeral_pycache_prefix = _bootstrap_sys.pycache_prefix
if (_ephemeral_pycache_prefix
        and _bootstrap_os.path.dirname(_ephemeral_pycache_prefix) == tempfile.gettempdir()
        and _bootstrap_os.path.basename(_ephemeral_pycache_prefix).startswith(
            f"nostra-connector-secret-migration-pycache-{_bootstrap_os.getpid()}-"
        )):
    atexit.register(shutil.rmtree, _ephemeral_pycache_prefix, ignore_errors=True)

KEY_RE = re.compile(r"CONNECTOR_[A-Za-z0-9_]+\Z")
MAX_FILE_BYTES = 1024 * 1024
CLAIM_FILE_NAME = "installed.plist"
ABSENT_CLAIM_NAME = "prior-absent"
PUBLIC_GUARD_NAME = "public-guard"
REPLACEMENT_ANCHOR_NAME = "replacement-anchor.plist"
CAPTURE_PREFIX = "capture-"
CAPTURE_FILE_NAME = "public-entry"
OWNER_LEASE_NAME = "owner-lease.json"
# Terminal receipt namespaces that reclaim themselves once their outcome is re-proved on disk. "retained" is
# deliberately absent: it exists precisely because something in that transaction could not be classified.
RECLAIMABLE_DISPOSITIONS = ("committed", "restored")


class MigrationError(RuntimeError):
    pass


def _file_identity(info: os.stat_result) -> tuple[int, int, int, int, int, int]:
    return (
        info.st_dev,
        info.st_ino,
        info.st_size,
        info.st_mtime_ns,
        info.st_ctime_ns,
        info.st_nlink,
    )


def _is_owner_only_regular(info: os.stat_result) -> bool:
    return (
        stat.S_ISREG(info.st_mode)
        and not stat.S_ISLNK(info.st_mode)
        and info.st_uid == os.getuid()
        and not info.st_mode & 0o077
        and info.st_nlink == 1
        and info.st_size <= MAX_FILE_BYTES
    )


def _owner_only_regular(path: str) -> tuple[os.stat_result, bytes]:
    try:
        before = os.lstat(path)
    except OSError as error:
        raise MigrationError(f"cannot inspect {os.path.basename(path)}") from error
    if not _is_owner_only_regular(before):
        raise MigrationError(
            f"{os.path.basename(path)} must be an owner-only single-link regular file <=1MiB"
        )
    expected_identity = _file_identity(before)
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(path, flags)
    except OSError as error:
        raise MigrationError(f"cannot open {os.path.basename(path)} safely") from error
    try:
        opened = os.fstat(descriptor)
        if _file_identity(opened) != expected_identity or not _is_owner_only_regular(opened):
            raise MigrationError(f"{os.path.basename(path)} changed during secure open")
        remaining = opened.st_size
        chunks: list[bytes] = []
        while remaining:
            chunk = os.read(descriptor, min(remaining, 64 * 1024))
            if not chunk:
                raise MigrationError(f"short read from {os.path.basename(path)}")
            chunks.append(chunk)
            remaining -= len(chunk)
        after_opened = os.fstat(descriptor)
        try:
            after_path = os.lstat(path)
        except OSError as error:
            raise MigrationError(f"cannot re-check {os.path.basename(path)}") from error
        if (
            _file_identity(after_opened) != expected_identity
            or _file_identity(after_path) != expected_identity
            or not _is_owner_only_regular(after_opened)
            or not _is_owner_only_regular(after_path)
        ):
            raise MigrationError(f"{os.path.basename(path)} changed during read")
    finally:
        os.close(descriptor)
    return before, b"".join(chunks)


def _ensure_config_directory(directory: str) -> None:
    if not os.path.lexists(directory):
        try:
            os.makedirs(directory, mode=0o700, exist_ok=False)
        except OSError as error:
            raise MigrationError("cannot create connector config directory") from error
    try:
        info = os.lstat(directory)
    except OSError as error:
        raise MigrationError("cannot inspect connector config directory") from error
    if (not stat.S_ISDIR(info.st_mode) or stat.S_ISLNK(info.st_mode)
            or info.st_uid != os.getuid() or info.st_mode & 0o077):
        raise MigrationError("connector config directory must be a real owner-only directory")


def _parse_env(text: str) -> dict[str, str]:
    values: dict[str, str] = {}
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].strip()
        key, separator, value = line.partition("=")
        key = key.strip()
        if not separator:
            continue
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        if value != value.strip() or any(ord(char) < 0x20 or ord(char) == 0x7F for char in value):
            raise MigrationError(f"providers.env key {key} has unsafe edge whitespace or controls")
        if key in values:
            raise MigrationError(f"duplicate providers.env key {key}")
        values[key] = value
    return values


def _plist_secrets(plist_path: str) -> dict[str, str]:
    _info, contents = _owner_only_regular(plist_path)
    try:
        raw = plistlib.loads(contents)
    except Exception as error:
        raise MigrationError("installed connector plist is malformed") from error
    environment = raw.get("EnvironmentVariables") if isinstance(raw, dict) else None
    if not isinstance(environment, dict):
        raise MigrationError("installed connector plist has no EnvironmentVariables dictionary")
    secrets: dict[str, str] = {}
    for key, value in environment.items():
        if isinstance(key, str) and KEY_RE.fullmatch(key):
            if not isinstance(value, str) or not value:
                raise MigrationError(f"historical connector key {key} has no preservable string value")
            secrets[key] = value
    return secrets


def _atomic_provider_write(path: str, content: str) -> None:
    directory = os.path.dirname(path)
    temporary = os.path.join(directory, f".providers.env.connector-v2-{os.getpid()}")
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)
    descriptor = -1
    try:
        descriptor = os.open(temporary, flags, 0o600)
        data = content.encode("utf-8")
        view = memoryview(data)
        while view:
            written = os.write(descriptor, view)
            if written <= 0:
                raise MigrationError("short write to providers.env staging file")
            view = view[written:]
        os.fsync(descriptor)
        os.close(descriptor)
        descriptor = -1
        os.replace(temporary, path)
        os.chmod(path, 0o600)
        directory_fd = os.open(directory, os.O_RDONLY)
        try:
            os.fsync(directory_fd)
        finally:
            os.close(directory_fd)
    finally:
        if descriptor >= 0:
            os.close(descriptor)
        try:
            os.unlink(temporary)
        except FileNotFoundError:
            pass


def migrate(plist_path: str, providers_path: str) -> list[str]:
    secrets = _plist_secrets(plist_path)
    if not secrets:
        return []
    directory = os.path.dirname(os.path.abspath(providers_path))
    _ensure_config_directory(directory)
    providers_path = os.path.join(directory, os.path.basename(providers_path))
    original = ""
    if os.path.lexists(providers_path):
        _info, contents = _owner_only_regular(providers_path)
        try:
            original = contents.decode("utf-8")
        except UnicodeError as error:
            raise MigrationError("providers.env is not UTF-8") from error
    existing = _parse_env(original)
    missing: list[tuple[str, str]] = []
    for key, value in sorted(secrets.items()):
        # This is exactly the dependency-free representation the production runner reads. Exceptional
        # whitespace/control/simple-quote edge cases are refused rather than silently rewritten.
        if (value != value.strip() or any(ord(char) < 0x20 or ord(char) == 0x7F for char in value)
                or (len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'")):
            raise MigrationError(f"historical connector key {key} needs manual providers.env encoding")
        if key in existing:
            if existing[key] != value:
                raise MigrationError(f"historical connector key {key} conflicts with providers.env")
        else:
            missing.append((key, value))
    if missing:
        content = original
        if content and not content.endswith("\n"):
            content += "\n"
        content += "# Migrated from the historical connector LaunchAgent by connector v2.\n"
        content += "".join(f"{key}={value}\n" for key, value in missing)
        _atomic_provider_write(providers_path, content)
    _info, verified_bytes = _owner_only_regular(providers_path)
    try:
        verified = _parse_env(verified_bytes.decode("utf-8"))
    except UnicodeError as error:
        raise MigrationError("providers.env is not UTF-8 after migration") from error
    if any(verified.get(key) != value for key, value in secrets.items()):
        raise MigrationError("durable providers.env verification failed")
    return sorted(secrets)


def _require_private_claim(claim_path: str, plist_path: str) -> tuple[str, str, str]:
    claim_path = os.path.abspath(claim_path)
    plist_path = os.path.abspath(plist_path)
    claim_directory = os.path.dirname(claim_path)
    installed_directory = os.path.dirname(plist_path)
    expected_prefix = f".{os.path.basename(plist_path)}.credential-claim-"
    if (
        os.path.basename(claim_path) not in (CLAIM_FILE_NAME, ABSENT_CLAIM_NAME)
        or os.path.dirname(claim_directory) != installed_directory
        or not os.path.basename(claim_directory).startswith(expected_prefix)
    ):
        raise MigrationError("credential claim is not the private same-directory claim for this plist")
    try:
        directory_info = os.lstat(claim_directory)
    except OSError as error:
        raise MigrationError("cannot inspect private credential claim directory") from error
    if (
        not stat.S_ISDIR(directory_info.st_mode)
        or stat.S_ISLNK(directory_info.st_mode)
        or directory_info.st_uid != os.getuid()
        or directory_info.st_mode & 0o077
    ):
        raise MigrationError("credential claim directory must be a real owner-only directory")
    return claim_path, plist_path, claim_directory


def _claim_entries(claim_directory: str) -> list[str]:
    entries = [
        os.path.join(claim_directory, name)
        for name in (CLAIM_FILE_NAME, ABSENT_CLAIM_NAME)
        if os.path.lexists(os.path.join(claim_directory, name))
    ]
    if len(entries) != 1:
        raise MigrationError("credential transaction must contain exactly one prior-state claim")
    return entries


def _claim_is_absent(claim_path: str) -> bool:
    return os.path.basename(claim_path) == ABSENT_CLAIM_NAME


def _guard_path(claim_directory: str) -> str:
    return os.path.join(claim_directory, PUBLIC_GUARD_NAME)


def _require_safe_installed_directory(plist_path: str) -> str:
    directory = os.path.dirname(os.path.abspath(plist_path))
    try:
        info = os.lstat(directory)
    except OSError as error:
        raise MigrationError("cannot inspect installed connector directory") from error
    if (
        not stat.S_ISDIR(info.st_mode)
        or stat.S_ISLNK(info.st_mode)
        or info.st_uid != os.getuid()
        or info.st_mode & 0o022
    ):
        raise MigrationError("installed connector directory must be current-user owned and not writable by others")
    return directory


def _acquire_transaction_lock(installed_directory: str, plist_path: str) -> int:
    lock_path = os.path.join(
        installed_directory,
        f".{os.path.basename(plist_path)}.credential-transaction.lock",
    )
    flags = os.O_RDWR | os.O_CREAT | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(lock_path, flags, 0o600)
    except OSError as error:
        raise MigrationError("cannot open connector transaction lock") from error
    try:
        fcntl.flock(descriptor, fcntl.LOCK_EX)
        opened = os.fstat(descriptor)
        path_info = os.lstat(lock_path)
        if (
            not _safe_regular_metadata(opened)
            or not _safe_regular_metadata(path_info)
            or opened.st_nlink != 1
            or path_info.st_nlink != 1
            or opened.st_size != 0
            or (opened.st_dev, opened.st_ino) != (path_info.st_dev, path_info.st_ino)
        ):
            raise MigrationError("connector transaction lock is unsafe")
        return descriptor
    except Exception:
        os.close(descriptor)
        raise


def _release_transaction_lock(descriptor: int) -> None:
    try:
        fcntl.flock(descriptor, fcntl.LOCK_UN)
    finally:
        os.close(descriptor)


def _process_start_identity(pid: int) -> str | None:
    """Return a live process identity that distinguishes PID reuse."""
    if not isinstance(pid, int) or isinstance(pid, bool) or pid <= 1:
        raise MigrationError("credential transaction owner PID must be an integer greater than one")
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return None
    except PermissionError:
        pass
    except OSError:
        return None
    try:
        process = subprocess.run(
            ["/bin/ps", "-o", "lstart=", "-p", str(pid)],
            stdin=subprocess.DEVNULL,
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
            env={"PATH": "/usr/bin:/bin", "LC_ALL": "C"},
        )
    except (OSError, subprocess.SubprocessError) as error:
        raise MigrationError("cannot verify credential transaction owner process") from error
    identity = " ".join(process.stdout.split())
    return identity if process.returncode == 0 and identity else None


def _owner_lease_path(claim_directory: str) -> str:
    return os.path.join(claim_directory, OWNER_LEASE_NAME)


def _read_owner_lease(claim_directory: str) -> tuple[int, str]:
    lease_path = _owner_lease_path(claim_directory)
    try:
        _info, contents = _owner_only_regular(lease_path)
        lease = json.loads(contents.decode("utf-8"))
    except (MigrationError, UnicodeError, json.JSONDecodeError) as error:
        raise MigrationError("credential transaction owner lease is missing or malformed") from error
    if (
        not isinstance(lease, dict)
        or set(lease) != {"pid", "process_start"}
        or not isinstance(lease.get("pid"), int)
        or isinstance(lease.get("pid"), bool)
        or lease["pid"] <= 1
        or not isinstance(lease.get("process_start"), str)
        or not lease["process_start"]
    ):
        raise MigrationError("credential transaction owner lease is malformed")
    return lease["pid"], lease["process_start"]


def _lease_bytes(pid: int, process_start: str) -> bytes:
    return (json.dumps(
        {"pid": pid, "process_start": process_start},
        sort_keys=True,
        separators=(",", ":"),
    ) + "\n").encode("utf-8")


def _claim_owner_lease(claim_directory: str, owner_pid: int) -> None:
    """Create, reuse, or adopt a lease. Caller must hold the stable transaction lock."""
    owner_identity = _process_start_identity(owner_pid)
    if owner_identity is None:
        raise MigrationError("credential transaction owner process is not live")
    lease_path = _owner_lease_path(claim_directory)
    if not os.path.lexists(lease_path):
        _write_private_file(lease_path, _lease_bytes(owner_pid, owner_identity))
        return
    leased_pid, leased_identity = _read_owner_lease(claim_directory)
    if leased_pid == owner_pid and leased_identity == owner_identity:
        return
    if _process_start_identity(leased_pid) == leased_identity:
        raise MigrationError(f"credential transaction is owned by active process {leased_pid}")
    temporary = os.path.join(claim_directory, f".{OWNER_LEASE_NAME}.{os.getpid()}.new")
    _write_private_file(temporary, _lease_bytes(owner_pid, owner_identity))
    try:
        os.replace(temporary, lease_path)
    except OSError as error:
        raise MigrationError("cannot adopt abandoned credential transaction owner lease") from error


def _require_owner_lease(claim_path: str, plist_path: str, owner_pid: int) -> None:
    _claim_path, _plist_path, claim_directory = _require_private_claim(claim_path, plist_path)
    owner_identity = _process_start_identity(owner_pid)
    leased_pid, leased_identity = _read_owner_lease(claim_directory)
    if owner_identity is None or leased_pid != owner_pid or leased_identity != owner_identity:
        raise MigrationError("credential transaction mutation is not authorized by its active owner")


def _verify_claim_is_durable(claim_path: str, providers_path: str) -> dict[str, str]:
    if _claim_is_absent(claim_path):
        return {}
    secrets = _plist_secrets(claim_path)
    if not secrets:
        return secrets
    if not os.path.lexists(providers_path):
        raise MigrationError("providers.env disappeared before credential-claim commit")
    _info, contents = _owner_only_regular(providers_path)
    try:
        providers = _parse_env(contents.decode("utf-8"))
    except UnicodeError as error:
        raise MigrationError("providers.env is not UTF-8 at credential-claim commit") from error
    if any(providers.get(key) != value for key, value in secrets.items()):
        raise MigrationError("credential claim does not match durable providers.env")
    return secrets


def _private_replacement_anchor(claim_path: str, plist_path: str, anchor_path: str) -> str:
    _claim_path, _plist_path, claim_directory = _require_private_claim(claim_path, plist_path)
    anchor_path = os.path.abspath(anchor_path)
    if anchor_path != os.path.join(claim_directory, REPLACEMENT_ANCHOR_NAME):
        raise MigrationError("replacement anchor is not inside the matching private credential claim")
    return anchor_path


def _write_private_file(path: str, contents: bytes) -> None:
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)
    descriptor = -1
    try:
        descriptor = os.open(path, flags, 0o600)
        view = memoryview(contents)
        while view:
            written = os.write(descriptor, view)
            if written <= 0:
                raise MigrationError("short write to private connector transaction file")
            view = view[written:]
        os.fsync(descriptor)
    except OSError as error:
        raise MigrationError("cannot create private connector transaction file") from error
    finally:
        if descriptor >= 0:
            os.close(descriptor)


GUARD_BYTES = b"nostra connector transaction guard\n"


def _safe_regular_metadata(info: os.stat_result) -> bool:
    return (stat.S_ISREG(info.st_mode) and not stat.S_ISLNK(info.st_mode)
            and info.st_uid == os.getuid() and not info.st_mode & 0o077)


def _same_inode(left: str, right: str) -> bool:
    try:
        left_info, right_info = os.lstat(left), os.lstat(right)
    except OSError:
        return False
    return (_safe_regular_metadata(left_info) and _safe_regular_metadata(right_info)
            and (left_info.st_dev, left_info.st_ino) == (right_info.st_dev, right_info.st_ino))


def _read_transaction_regular(path: str) -> bytes:
    """Race-checked read that permits intentional hard links inside one transaction."""
    try:
        before = os.lstat(path)
    except OSError as error:
        raise MigrationError("cannot inspect connector transaction entry") from error
    if not _safe_regular_metadata(before) or before.st_size > MAX_FILE_BYTES:
        raise MigrationError("connector transaction entry is unsafe")
    expected = (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns, before.st_ctime_ns)
    try:
        descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    except OSError as error:
        raise MigrationError("cannot open connector transaction entry safely") from error
    try:
        opened = os.fstat(descriptor)
        if (opened.st_dev, opened.st_ino, opened.st_size, opened.st_mtime_ns, opened.st_ctime_ns) != expected:
            raise MigrationError("connector transaction entry changed during open")
        remaining, chunks = opened.st_size, []
        while remaining:
            chunk = os.read(descriptor, min(remaining, 64 * 1024))
            if not chunk:
                raise MigrationError("short read from connector transaction entry")
            chunks.append(chunk)
            remaining -= len(chunk)
        finished, after = os.fstat(descriptor), os.lstat(path)
        if ((finished.st_dev, finished.st_ino, finished.st_size, finished.st_mtime_ns, finished.st_ctime_ns)
                != expected
                or (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns, after.st_ctime_ns)
                != expected):
            raise MigrationError("connector transaction entry changed during read")
        return b"".join(chunks)
    finally:
        os.close(descriptor)


def _capture_public(claim_directory: str, plist_path: str) -> str:
    capture_directory = tempfile.mkdtemp(prefix=CAPTURE_PREFIX, dir=claim_directory)
    os.chmod(capture_directory, 0o700)
    capture_path = os.path.join(capture_directory, CAPTURE_FILE_NAME)
    try:
        os.rename(plist_path, capture_path)
    except OSError as error:
        os.rmdir(capture_directory)
        raise MigrationError("cannot atomically capture the public connector pathname") from error
    return capture_path


def _capture_paths(claim_directory: str) -> list[str]:
    return sorted(
        os.path.join(entry.path, CAPTURE_FILE_NAME)
        for entry in os.scandir(claim_directory)
        if entry.name.startswith(CAPTURE_PREFIX) and entry.is_dir(follow_symlinks=False)
        and os.path.lexists(os.path.join(entry.path, CAPTURE_FILE_NAME))
    )


def _remove_capture(capture_path: str) -> None:
    os.unlink(capture_path)
    os.rmdir(os.path.dirname(capture_path))


def _claim_directories(installed_directory: str, plist_path: str) -> list[str]:
    prefix = f".{os.path.basename(plist_path)}.credential-claim-"
    return sorted(entry.path for entry in os.scandir(installed_directory)
                  if entry.name.startswith(prefix) and entry.is_dir(follow_symlinks=False))


def _ensure_guard_file(claim_directory: str) -> str:
    guard = _guard_path(claim_directory)
    if not os.path.lexists(guard):
        _write_private_file(guard, GUARD_BYTES)
    info = os.lstat(guard)
    if not _safe_regular_metadata(info) or info.st_size != len(GUARD_BYTES):
        raise MigrationError("credential transaction guard is malformed")
    return guard


def _adopt_or_reserve_guard(claim_path: str, plist_path: str) -> None:
    _claim_path, plist_path, claim_directory = _require_private_claim(claim_path, plist_path)
    guard = _ensure_guard_file(claim_directory)
    anchor = os.path.join(claim_directory, REPLACEMENT_ANCHOR_NAME)
    if os.path.lexists(plist_path):
        if _same_inode(guard, plist_path):
            return
        if os.path.lexists(anchor):
            _anchor_info, anchor_contents = _owner_only_regular(anchor)
            _public_info, public_contents = _owner_only_regular(plist_path)
            if public_contents == anchor_contents:
                return
        raise MigrationError("public connector pathname contradicts the single orphan transaction")
    try:
        os.link(guard, plist_path, follow_symlinks=False)
    except OSError as error:
        raise MigrationError("cannot reserve the public pathname for the orphan transaction") from error


def _same_transaction_contents(left: str, right: str) -> bool:
    try:
        return _read_transaction_regular(left) == _read_transaction_regular(right)
    except MigrationError:
        return False


def _claim_and_migrate_locked(plist_path: str, providers_path: str,
                              installed_directory: str,
                              owner_pid: int | None = None) -> tuple[str, list[str]]:
    _reconcile_receipt_transactions(installed_directory, plist_path, providers_path)
    orphan_directories = _claim_directories(installed_directory, plist_path)
    if len(orphan_directories) > 1:
        raise MigrationError("multiple connector credential transactions exist; refusing ambiguous recovery")
    if orphan_directories:
        claim_directory = orphan_directories[0]
        directory_info = os.lstat(claim_directory)
        if (directory_info.st_uid != os.getuid() or directory_info.st_mode & 0o077):
            raise MigrationError("orphan connector transaction is not owner-only")
        if owner_pid is not None:
            _claim_owner_lease(claim_directory, owner_pid)
        entries = [
            os.path.join(claim_directory, name)
            for name in (CLAIM_FILE_NAME, ABSENT_CLAIM_NAME)
            if os.path.lexists(os.path.join(claim_directory, name))
        ]
        if not entries:
            retained = _archive_transaction(claim_directory, plist_path, "retained")
            print(f"incomplete connector transaction retained at {retained}", file=sys.stderr)
            return _claim_and_migrate_locked(
                plist_path, providers_path, installed_directory, owner_pid
            )
        if len(entries) != 1:
            raise MigrationError("credential transaction must contain exactly one prior-state claim")
        claim_path = entries[0]
        _require_private_claim(claim_path, plist_path)
        if (not _claim_is_absent(claim_path) and os.path.lexists(plist_path)
                and _same_transaction_contents(claim_path, plist_path)):
            _archive_transaction(claim_directory, plist_path, "restored")
            return _claim_and_migrate_locked(
                plist_path, providers_path, installed_directory, owner_pid
            )
        _adopt_or_reserve_guard(claim_path, plist_path)
        keys = [] if _claim_is_absent(claim_path) else migrate(claim_path, providers_path)
        return claim_path, keys

    claim_directory = os.path.join(
        installed_directory,
        f".{os.path.basename(plist_path)}.credential-claim-active",
    )
    try:
        os.mkdir(claim_directory, 0o700)
    except FileExistsError:
        # The stable lock serializes cooperating helpers and the scan above already handles real orphan
        # directories. A remaining collision is a non-directory or a pathname mutation, so fail closed.
        raise MigrationError("connector credential transaction pathname is occupied by an unsafe entry")
    except OSError as error:
        raise MigrationError("cannot create connector credential transaction") from error
    os.chmod(claim_directory, 0o700)
    if owner_pid is not None:
        _claim_owner_lease(claim_directory, owner_pid)
    guard = _ensure_guard_file(claim_directory)
    if os.path.lexists(plist_path):
        claim_path = os.path.join(claim_directory, CLAIM_FILE_NAME)
        try:
            os.rename(plist_path, claim_path)
        except OSError as error:
            raise MigrationError("cannot atomically claim installed connector plist") from error
    else:
        claim_path = os.path.join(claim_directory, ABSENT_CLAIM_NAME)
        _write_private_file(claim_path, b"prior state: absent\n")
    try:
        os.link(guard, plist_path, follow_symlinks=False)
    except OSError as error:
        raise MigrationError(f"public pathname changed while claiming; retained at {claim_directory}") from error
    if _claim_is_absent(claim_path):
        return claim_path, []
    try:
        return claim_path, migrate(claim_path, providers_path)
    except Exception as error:
        try:
            restore_claim(claim_path, plist_path, providers_path)
        except MigrationError as restore_error:
            raise MigrationError(f"credential migration failed; retained at {claim_directory}: {restore_error}") from error
        raise


def claim_and_migrate(plist_path: str, providers_path: str,
                      owner_pid: int | None = None) -> tuple[str, list[str]]:
    """Claim a prior file or prior absence under a stable single-flight lock."""
    plist_path = os.path.abspath(plist_path)
    installed_directory = _require_safe_installed_directory(plist_path)
    descriptor = _acquire_transaction_lock(installed_directory, plist_path)
    try:
        return _claim_and_migrate_locked(
            plist_path, providers_path, installed_directory, owner_pid
        )
    finally:
        _release_transaction_lock(descriptor)


def publish_claimed_replacement(claim_path: str, plist_path: str, staged_path: str) -> str:
    """Transition the owned guard to a no-clobber replacement with a private byte anchor."""
    _claim_path, plist_path, claim_directory = _require_private_claim(claim_path, plist_path)
    guard = _ensure_guard_file(claim_directory)
    _staged_info, staged_contents = _owner_only_regular(staged_path)
    anchor = os.path.join(claim_directory, REPLACEMENT_ANCHOR_NAME)
    if os.path.lexists(anchor):
        _anchor_info, anchor_contents = _owner_only_regular(anchor)
        if anchor_contents != staged_contents:
            raise MigrationError("orphan replacement anchor differs from regenerated staging bytes")
    else:
        _write_private_file(anchor, staged_contents)
    if not os.path.lexists(plist_path):
        raise MigrationError("owned public guard disappeared before connector publication")
    captured = _capture_public(claim_directory, plist_path)
    if _same_inode(captured, guard):
        try:
            os.link(staged_path, plist_path, follow_symlinks=False)
        except OSError as error:
            os.link(captured, plist_path, follow_symlinks=False)
            raise MigrationError("cannot publish connector replacement without clobbering") from error
        os.unlink(staged_path)
        _remove_capture(captured)
        return anchor
    try:
        captured_contents = _read_transaction_regular(captured)
    except MigrationError:
        captured_contents = b""
    if captured_contents == staged_contents:
        os.link(captured, plist_path, follow_symlinks=False)
        os.unlink(staged_path)
        _remove_capture(captured)
        return anchor
    if not os.path.lexists(plist_path):
        os.link(captured, plist_path, follow_symlinks=False)
    raise MigrationError(f"unexpected public connector entry retained at {captured}")


def _unknown_claim_artifacts(claim_directory: str) -> list[str]:
    known = {
        CLAIM_FILE_NAME,
        ABSENT_CLAIM_NAME,
        PUBLIC_GUARD_NAME,
        REPLACEMENT_ANCHOR_NAME,
        OWNER_LEASE_NAME,
    }
    unknown: list[str] = []
    for entry in os.scandir(claim_directory):
        if entry.name in known:
            continue
        if not entry.name.startswith(CAPTURE_PREFIX):
            unknown.append(entry.path)
            continue
        if not entry.is_dir(follow_symlinks=False):
            unknown.append(entry.path)
            continue
        children = list(os.scandir(entry.path))
        if len(children) != 1 or children[0].name != CAPTURE_FILE_NAME:
            unknown.append(entry.path)
    return sorted(unknown)


def _capture_is_owned(capture_path: str, guard_path: str, anchor_contents: bytes | None,
                      prior_claim: str | None = None) -> bool:
    if _same_inode(capture_path, guard_path) or (prior_claim and _same_inode(capture_path, prior_claim)):
        return True
    try:
        contents = _read_transaction_regular(capture_path)
    except MigrationError:
        return False
    return anchor_contents is not None and contents == anchor_contents


def _archive_transaction(claim_directory: str, plist_path: str, disposition: str) -> str:
    installed_directory = os.path.dirname(plist_path)
    archive_directory = tempfile.mkdtemp(
        prefix=f".{os.path.basename(plist_path)}.credential-{disposition}-",
        dir=installed_directory,
    )
    os.chmod(archive_directory, 0o700)
    retained = os.path.join(archive_directory, "transaction")
    try:
        os.rename(claim_directory, retained)
    except OSError as error:
        os.rmdir(archive_directory)
        raise MigrationError(f"connector transaction could not enter its {disposition} archive") from error
    return retained


def _purge_receipt_transaction(transaction: str, plist_path: str, providers_path: str,
                               disposition: str = "committed") -> bool:
    """Remove a verified terminal receipt; retain any malformed or unclassified residue."""
    if disposition not in RECLAIMABLE_DISPOSITIONS:
        raise MigrationError("only a terminal connector receipt may be reclaimed")
    transaction = os.path.abspath(transaction)
    archive_directory = os.path.dirname(transaction)
    installed_directory = os.path.dirname(plist_path)
    archive_prefix = f".{os.path.basename(plist_path)}.credential-{disposition}-"
    if (
        os.path.dirname(archive_directory) != installed_directory
        or not os.path.basename(archive_directory).startswith(archive_prefix)
        or os.path.basename(transaction) != "transaction"
    ):
        raise MigrationError(f"{disposition} connector receipt is outside its installed directory")
    for directory in (archive_directory, transaction):
        info = os.lstat(directory)
        if (not stat.S_ISDIR(info.st_mode) or stat.S_ISLNK(info.st_mode)
                or info.st_uid != os.getuid() or info.st_mode & 0o077):
            raise MigrationError(f"{disposition} connector receipt must remain owner-only")
    claims = _claim_entries(transaction) if any(
        os.path.lexists(os.path.join(transaction, name))
        for name in (CLAIM_FILE_NAME, ABSENT_CLAIM_NAME)
    ) else []
    restored = disposition == "restored"
    if claims:
        claim = claims[0]
        if _claim_is_absent(claim):
            _owner_only_regular(claim)
        # A restored receipt rolled the prior bytes BACK to the public pathname, so providers.env is not the
        # surviving copy and must not gate reclamation. Its redundancy proof is the byte comparison below.
        if not restored:
            _verify_claim_is_durable(claim, providers_path)
    guard = os.path.join(transaction, PUBLIC_GUARD_NAME)
    anchor = os.path.join(transaction, REPLACEMENT_ANCHOR_NAME)
    anchor_contents: bytes | None = None
    if os.path.lexists(anchor):
        _anchor_info, anchor_contents = _owner_only_regular(anchor)
    if os.path.lexists(guard):
        guard_info = os.lstat(guard)
        if not _safe_regular_metadata(guard_info) or guard_info.st_size != len(GUARD_BYTES):
            raise MigrationError(f"{disposition} connector guard is malformed")
    captures = _capture_paths(transaction)
    prior_claim = claims[0] if (restored and claims and not _claim_is_absent(claims[0])) else None
    owned_captures = [
        capture for capture in captures
        if _capture_is_owned(capture, guard, anchor_contents, prior_claim)
    ]
    unknown = _unknown_claim_artifacts(transaction)
    unknown.extend(capture for capture in captures if capture not in owned_captures)
    claim_is_redundant = True
    if restored:
        # The rollback is finished exactly when the claimed prior bytes are back at the public pathname. An
        # absent-state claim carries no recoverable bytes, so its sentinel is reclaimable unconditionally.
        if prior_claim is not None:
            try:
                claim_is_redundant = (
                    _read_transaction_regular(plist_path) == _read_transaction_regular(prior_claim)
                )
            except MigrationError:
                claim_is_redundant = False
            if not claim_is_redundant:
                unknown.append(plist_path)
    elif anchor_contents is not None:
        try:
            if _read_transaction_regular(plist_path) != anchor_contents:
                unknown.append(plist_path)
        except MigrationError:
            unknown.append(plist_path)
    elif os.path.lexists(plist_path):
        unknown.append(plist_path)
    # The committed namespace is the irreversible receipt. Only after re-verifying providers.env may its
    # historical credential-bearing claim be purged, so providers.env becomes the sole normal persisted copy.
    # A restored claim is released only against its own proof: never drop the last copy of prior bytes that
    # did not make it back to the public pathname.
    if claim_is_redundant:
        for claim in claims:
            os.unlink(claim)
    # Drop every securely classified private hard link even when unrelated residue must be retained. This
    # returns the published plist to a single link so a later claim can validate it independently.
    for capture in owned_captures:
        _remove_capture(capture)
    if unknown:
        return False
    for path in (anchor, guard):
        if os.path.lexists(path):
            os.unlink(path)
    lease = _owner_lease_path(transaction)
    if os.path.lexists(lease):
        _read_owner_lease(transaction)
        os.unlink(lease)
    os.rmdir(transaction)
    os.rmdir(archive_directory)
    return True


def _reconcile_receipt_transactions(installed_directory: str, plist_path: str,
                                    providers_path: str) -> None:
    """Reclaim every terminal receipt namespace, so a steady-state cycle leaves no residue behind."""
    prefixes = {
        f".{os.path.basename(plist_path)}.credential-{disposition}-": disposition
        for disposition in RECLAIMABLE_DISPOSITIONS
    }
    for entry in list(os.scandir(installed_directory)):
        if not entry.is_dir(follow_symlinks=False):
            continue
        disposition = next(
            (value for prefix, value in prefixes.items() if entry.name.startswith(prefix)), None
        )
        if disposition is None:
            continue
        transaction = os.path.join(entry.path, "transaction")
        if not os.path.lexists(transaction):
            try:
                os.rmdir(entry.path)
            except OSError:
                pass
            continue
        try:
            _purge_receipt_transaction(transaction, plist_path, providers_path, disposition)
        except (MigrationError, OSError):
            # A terminal receipt is outside the active-claim namespace. Any uncertainty is retained for
            # later reconciliation and must not create a second live transaction or erase recovery bytes.
            pass


def _restore_prior_state(claim_path: str, plist_path: str) -> None:
    if os.path.lexists(plist_path):
        raise MigrationError("public pathname is occupied during prior-state restore")
    if not _claim_is_absent(claim_path):
        prior_contents = _read_transaction_regular(claim_path)
        try:
            _write_private_file(plist_path, prior_contents)
        except MigrationError as error:
            raise MigrationError("cannot restore exact prior plist without clobbering") from error


def restore_claim(claim_path: str, plist_path: str, providers_path: str,
                  replacement_anchor: str | None = None) -> None:
    """Rollback independently of providers; classify every retained public capture before deletion."""
    claim_path, plist_path, claim_directory = _require_private_claim(claim_path, plist_path)
    guard = _ensure_guard_file(claim_directory)
    anchor_contents: bytes | None = None
    if replacement_anchor:
        replacement_anchor = _private_replacement_anchor(claim_path, plist_path, replacement_anchor)
    else:
        candidate = os.path.join(claim_directory, REPLACEMENT_ANCHOR_NAME)
        replacement_anchor = candidate if os.path.lexists(candidate) else None
    if replacement_anchor:
        _anchor_info, anchor_contents = _owner_only_regular(replacement_anchor)
    captures = _capture_paths(claim_directory)
    if os.path.lexists(plist_path):
        captures.append(_capture_public(claim_directory, plist_path))
    unknown: list[str] = _unknown_claim_artifacts(claim_directory)
    for capture in captures:
        if not _capture_is_owned(capture, guard, anchor_contents, claim_path):
            unknown.append(capture)
    _restore_prior_state(claim_path, plist_path)
    disposition = "retained" if unknown else "restored"
    retained = _archive_transaction(claim_directory, plist_path, disposition)
    if unknown:
        print(f"connector transaction artifacts retained at {retained}", file=sys.stderr)
        return
    # A clean rollback is a finished transaction, not a durable record: the prior bytes are back at the
    # public pathname and every artifact was classified. Reclaim it now so the ordinary no-op reconcile
    # cycle cannot accumulate receipts in the installed directory; a failure here is retried by the next
    # claim's reconcile rather than being escalated, since the rollback itself already succeeded.
    try:
        _purge_receipt_transaction(retained, plist_path, providers_path, "restored")
    except (MigrationError, OSError):
        pass


def commit_claim(claim_path: str, plist_path: str, providers_path: str, installed_state: str,
                 replacement_anchor: str | None = None) -> None:
    """Capture public authority first; never report failure after the prior claim is released."""
    claim_path, plist_path, claim_directory = _require_private_claim(claim_path, plist_path)
    guard = _ensure_guard_file(claim_directory)
    if installed_state == "replacement":
        if not replacement_anchor:
            raise MigrationError("replacement commit requires the private replacement anchor")
        replacement_anchor = _private_replacement_anchor(claim_path, plist_path, replacement_anchor)
        _anchor_info, anchor_contents = _owner_only_regular(replacement_anchor)
        if not os.path.lexists(plist_path):
            raise MigrationError("public connector replacement disappeared before commit")
        captured = _capture_public(claim_directory, plist_path)
        try:
            captured_contents = _read_transaction_regular(captured)
        except MigrationError as error:
            raise MigrationError(f"captured replacement is unsafe; retained at {captured}") from error
        if captured_contents != anchor_contents:
            if not os.path.lexists(plist_path):
                os.link(captured, plist_path, follow_symlinks=False)
            raise MigrationError(f"captured replacement differs from anchor; retained at {captured}")
        try:
            os.link(captured, plist_path, follow_symlinks=False)
        except OSError as error:
            raise MigrationError(f"cannot republish captured connector; retained at {captured}") from error
        _verify_claim_is_durable(claim_path, providers_path)
        if not _same_inode(captured, plist_path):
            raise MigrationError(f"public connector changed before prior-claim release; retained at {captured}")
        committed = _archive_transaction(claim_directory, plist_path, "committed")
        try:
            _purge_receipt_transaction(committed, plist_path, providers_path, "committed")
        except (MigrationError, OSError):
            pass
        return
    if installed_state != "absent" or replacement_anchor:
        raise MigrationError("invalid absent credential-claim commit contract")
    if not os.path.lexists(plist_path):
        raise MigrationError("owned public absence guard disappeared before removal commit")
    captured = _capture_public(claim_directory, plist_path)
    if not _same_inode(captured, guard):
        if not os.path.lexists(plist_path):
            os.link(captured, plist_path, follow_symlinks=False)
        raise MigrationError(f"removal captured an unowned public entry; retained at {captured}")
    # The rename above is the atomic authority transfer: the owned guard is now private and the public name
    # is absent.  Keep it absent through the irreversible point.  A concurrent writer may create a new
    # public entry, but this transaction never removes or overwrites that unowned generation.
    _verify_claim_is_durable(claim_path, providers_path)
    if os.path.lexists(plist_path):
        raise MigrationError("public connector pathname was recreated before removal commit")
    committed = _archive_transaction(claim_directory, plist_path, "committed")
    try:
        _purge_receipt_transaction(committed, plist_path, providers_path, "committed")
    except (MigrationError, OSError):
        pass


def main() -> int:
    parser = argparse.ArgumentParser()
    actions = parser.add_subparsers(dest="action", required=True)
    claim_parser = actions.add_parser("claim")
    claim_parser.add_argument("--plist", required=True)
    claim_parser.add_argument("--providers-env", required=True)
    claim_parser.add_argument("--owner-pid", required=True, type=int)
    restore_parser = actions.add_parser("restore")
    restore_parser.add_argument("--claim", required=True)
    restore_parser.add_argument("--plist", required=True)
    restore_parser.add_argument("--providers-env", required=True)
    restore_parser.add_argument("--replacement-anchor")
    restore_parser.add_argument("--owner-pid", required=True, type=int)
    publish_parser = actions.add_parser("publish")
    publish_parser.add_argument("--claim", required=True)
    publish_parser.add_argument("--plist", required=True)
    publish_parser.add_argument("--staged", required=True)
    publish_parser.add_argument("--owner-pid", required=True, type=int)
    commit_parser = actions.add_parser("commit")
    commit_parser.add_argument("--claim", required=True)
    commit_parser.add_argument("--plist", required=True)
    commit_parser.add_argument("--providers-env", required=True)
    commit_parser.add_argument("--installed-state", required=True, choices=("absent", "replacement"))
    commit_parser.add_argument("--replacement-anchor")
    commit_parser.add_argument("--owner-pid", required=True, type=int)
    args = parser.parse_args()
    try:
        if args.action == "claim":
            claim_path, _keys = claim_and_migrate(
                args.plist, args.providers_env, args.owner_pid
            )
            print(claim_path)
        else:
            plist_path = os.path.abspath(args.plist)
            installed_directory = _require_safe_installed_directory(plist_path)
            descriptor = _acquire_transaction_lock(installed_directory, plist_path)
            try:
                _require_owner_lease(args.claim, plist_path, args.owner_pid)
                if args.action == "restore":
                    restore_claim(
                        args.claim, plist_path, args.providers_env, args.replacement_anchor
                    )
                elif args.action == "publish":
                    print(publish_claimed_replacement(args.claim, plist_path, args.staged))
                else:
                    commit_claim(
                        args.claim,
                        plist_path,
                        args.providers_env,
                        args.installed_state,
                        args.replacement_anchor,
                    )
            finally:
                _release_transaction_lock(descriptor)
    except MigrationError as error:
        print(f"connector credential migration refused: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
