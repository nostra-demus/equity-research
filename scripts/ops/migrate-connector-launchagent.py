#!/usr/bin/env python3
"""Upgrade the installed connector LaunchAgent without carrying runtime secrets.

The live plist contains machine-rendered paths, so deploy cannot replace it
with the tracked tokenized template. This helper accepts only the exact known
pre-v2 or v2 command shape, inserts isolated Python for the former, applies the
due-aware interval, removes connector credentials after the caller has safely
migrated them, and writes the staged plist atomically. Unknown command shapes
fail closed.
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
            prefix=f"nostra-connector-agent-migration-pycache-{_bootstrap_os.getpid()}-"
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
import shutil
import stat
import sys
import tempfile

_ephemeral_pycache_prefix = _bootstrap_sys.pycache_prefix
if (_ephemeral_pycache_prefix
        and _bootstrap_os.path.dirname(_ephemeral_pycache_prefix) == tempfile.gettempdir()
        and _bootstrap_os.path.basename(_ephemeral_pycache_prefix).startswith(
            f"nostra-connector-agent-migration-pycache-{_bootstrap_os.getpid()}-"
        )):
    atexit.register(shutil.rmtree, _ephemeral_pycache_prefix, ignore_errors=True)


KEY_RE = re.compile(r"CONNECTOR_[A-Za-z0-9_]+\Z")
MAX_PLIST_BYTES = 1024 * 1024


class LaunchAgentMigrationError(RuntimeError):
    pass


def _read_owner_file(path: str) -> tuple[os.stat_result, bytes]:
    try:
        before = os.lstat(path)
    except OSError as error:
        raise LaunchAgentMigrationError("cannot inspect staged connector plist") from error
    if (stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode)
            or before.st_uid != os.getuid() or before.st_mode & 0o077
            or before.st_size <= 0 or before.st_size > MAX_PLIST_BYTES):
        raise LaunchAgentMigrationError("staged connector plist must be an owner-only regular file <=1MiB")
    descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(descriptor)
        if ((opened.st_dev, opened.st_ino, opened.st_size) != (before.st_dev, before.st_ino, before.st_size)
                or opened.st_uid != os.getuid() or opened.st_mode & 0o077):
            raise LaunchAgentMigrationError("staged connector plist changed during secure open")
        chunks: list[bytes] = []
        remaining = opened.st_size
        while remaining:
            chunk = os.read(descriptor, min(remaining, 64 * 1024))
            if not chunk:
                raise LaunchAgentMigrationError("short read from staged connector plist")
            chunks.append(chunk)
            remaining -= len(chunk)
    finally:
        os.close(descriptor)
    return before, b"".join(chunks)


def _atomic_write(path: str, payload: bytes, prior: os.stat_result) -> None:
    current = os.lstat(path)
    if (current.st_dev, current.st_ino, current.st_size) != (prior.st_dev, prior.st_ino, prior.st_size):
        raise LaunchAgentMigrationError("staged connector plist changed before replacement")
    directory = os.path.dirname(os.path.abspath(path))
    temporary = os.path.join(directory, f".connector-launchagent-v2-{os.getpid()}")
    descriptor = -1
    try:
        descriptor = os.open(
            temporary,
            os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0),
            0o600,
        )
        view = memoryview(payload)
        while view:
            written = os.write(descriptor, view)
            if written <= 0:
                raise LaunchAgentMigrationError("short write to staged connector plist")
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


def migrate(plist_path: str, repo_root: str, config_dir: str, interval: int = 900) -> bool:
    if isinstance(interval, bool) or not isinstance(interval, int) or interval != 900:
        raise LaunchAgentMigrationError("connector interval must be exactly 900 seconds")
    prior, contents = _read_owner_file(plist_path)
    try:
        raw = plistlib.loads(contents)
    except Exception as error:
        raise LaunchAgentMigrationError("staged connector plist is malformed") from error
    if not isinstance(raw, dict) or raw.get("Label") != "com.nostradamus.connectors":
        raise LaunchAgentMigrationError("staged plist is not the connector LaunchAgent")

    repo = os.path.abspath(repo_root)
    if (not isinstance(config_dir, str) or not os.path.isabs(config_dir)
            or config_dir != os.path.normpath(config_dir)
            or any(ord(ch) < 32 or ord(ch) == 127 for ch in config_dir)):
        raise LaunchAgentMigrationError("connector config directory must be a canonical absolute path")
    runner = os.path.join(repo, ".claude", "tools", "run_connectors.py")
    data_root = os.path.join(repo, "data")
    old_args = ["/usr/bin/env", "python3", runner, "--data-root", data_root]
    new_args = ["/usr/bin/env", "python3", "-I", runner, "--data-root", data_root]
    arguments = raw.get("ProgramArguments")
    if arguments == old_args:
        raw["ProgramArguments"] = new_args
    elif arguments != new_args:
        raise LaunchAgentMigrationError("connector ProgramArguments have an unknown or unsafe shape")
    if raw.get("WorkingDirectory") != repo:
        raise LaunchAgentMigrationError("connector WorkingDirectory does not match the production repository")

    environment = raw.get("EnvironmentVariables")
    if not isinstance(environment, dict) or not all(isinstance(key, str) for key in environment):
        raise LaunchAgentMigrationError("connector EnvironmentVariables are malformed")
    for key in list(environment):
        if key.startswith("CONNECTOR_") and not KEY_RE.fullmatch(key):
            raise LaunchAgentMigrationError(f"unrecognized historical connector credential name {key}")
        if KEY_RE.fullmatch(key):
            del environment[key]
    environment["NOSTRA_CONNECTOR_CREDENTIAL_SOURCE"] = "providers_env"
    environment["NOSTRA_ENGINE_CONFIG_DIR"] = config_dir
    raw["StartInterval"] = interval
    updated = plistlib.dumps(raw, fmt=plistlib.FMT_XML, sort_keys=False)
    changed = updated != contents
    if changed:
        _atomic_write(plist_path, updated, prior)
    return changed


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--plist", required=True)
    parser.add_argument("--repo-root", required=True)
    parser.add_argument("--config-dir", required=True)
    parser.add_argument("--interval", type=int, default=900)
    args = parser.parse_args()
    try:
        changed = migrate(args.plist, args.repo_root, args.config_dir, args.interval)
    except (OSError, LaunchAgentMigrationError) as error:
        print(f"connector LaunchAgent migration refused: {error}", file=sys.stderr)
        return 1
    print(json.dumps({"changed": changed, "isolated": True, "interval": args.interval}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
