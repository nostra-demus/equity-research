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
import json
import os
import plistlib
import re
import stat
import shutil
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


class MigrationError(RuntimeError):
    pass


def _owner_only_regular(path: str) -> tuple[os.stat_result, bytes]:
    try:
        before = os.lstat(path)
    except OSError as error:
        raise MigrationError(f"cannot inspect {os.path.basename(path)}") from error
    if (not stat.S_ISREG(before.st_mode) or stat.S_ISLNK(before.st_mode)
            or before.st_uid != os.getuid() or before.st_mode & 0o077
            or before.st_size > MAX_FILE_BYTES):
        raise MigrationError(f"{os.path.basename(path)} must be an owner-only regular file <=1MiB")
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(path, flags)
    except OSError as error:
        raise MigrationError(f"cannot open {os.path.basename(path)} safely") from error
    try:
        opened = os.fstat(descriptor)
        if ((opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino)
                or opened.st_uid != os.getuid() or opened.st_mode & 0o077
                or not stat.S_ISREG(opened.st_mode) or opened.st_size != before.st_size):
            raise MigrationError(f"{os.path.basename(path)} changed during secure open")
        remaining = opened.st_size
        chunks: list[bytes] = []
        while remaining:
            chunk = os.read(descriptor, min(remaining, 64 * 1024))
            if not chunk:
                raise MigrationError(f"short read from {os.path.basename(path)}")
            chunks.append(chunk)
            remaining -= len(chunk)
    finally:
        os.close(descriptor)
    try:
        after = os.lstat(path)
    except OSError as error:
        raise MigrationError(f"cannot re-check {os.path.basename(path)}") from error
    if ((after.st_dev, after.st_ino, after.st_size) != (before.st_dev, before.st_ino, before.st_size)
            or after.st_uid != os.getuid() or after.st_mode & 0o077):
        raise MigrationError(f"{os.path.basename(path)} changed during read")
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


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--plist", required=True)
    parser.add_argument("--providers-env", required=True)
    args = parser.parse_args()
    try:
        keys = migrate(args.plist, args.providers_env)
    except MigrationError as error:
        print(f"connector credential migration refused: {error}", file=sys.stderr)
        return 1
    print(json.dumps({"preserved_keys": keys}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
