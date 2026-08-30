#!/usr/bin/env python3
"""Manage OmniRoute's private engine contract without sourcing or printing secrets."""

from __future__ import annotations

import argparse
import datetime as dt
import fcntl
import hashlib
import json
import os
import re
import secrets
import sqlite3
import stat
import sys
import tempfile
import time
import uuid
from pathlib import Path

KEY_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")
CONNECTOR_SECRET_RE = re.compile(r"^CONNECTOR_[A-Z0-9_]+_API_KEY$")
LINE_RE = re.compile(r"^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=")
MAX_BYTES = 1024 * 1024
MAX_STDIN_SECRET_BYTES = 64 * 1024
MANAGED_KEY_NAME = "Nostra scanner (managed no-log)"
MANAGED_KEY_MACHINE_ID = "nostra-scanner"
DEFAULT_OMNIROUTE_MODEL = "auto/coding:free"
LEGACY_DEFAULT_OMNIROUTE_MODELS = frozenset({"oc/hy3-free"})
DESCRIPTOR_KEYS = (
    "NEWS_OMNIROUTE_API_KEY",
    "NEWS_OMNIROUTE_API_KEY_ID",
    "NEWS_OMNIROUTE_BASE_URL",
    "NEWS_OMNIROUTE_MODEL",
    "NEWS_OMNIROUTE_DAILY_REQ_CAP",
    "NEWS_OMNIROUTE_RPM",
    "NEWS_OMNIROUTE_MAX_TOKENS",
    "NEWS_OMNIROUTE_TIMEOUT_MS",
    "NEWS_OMNIROUTE_MAX_ATTEMPTS",
)
STATE_KEYS = ("NEWS_OMNIROUTE_ENABLED",) + DESCRIPTOR_KEYS
SETTABLE_BOOL_KEYS = frozenset({
    "NEWS_OMNIROUTE_ENABLED",
    "ENGINE_PROVIDER_PARITY_ENABLED",
    "ENGINE_CODEX_ENABLED",
})
API_KEY_BASE_COLUMNS = {
    "id": ("TEXT", 0, None, 1),
    "name": ("TEXT", 1, None, 0),
    "key": ("TEXT", 1, None, 0),
    "machine_id": ("TEXT", 0, None, 0),
    "allowed_models": ("TEXT", 0, "'[]'", 0),
    "no_log": ("INTEGER", 1, "0", 0),
    "created_at": ("TEXT", 1, None, 0),
    "revoked_at": ("TEXT", 0, None, 0),
    "expires_at": ("TEXT", 0, None, 0),
    "last_used_at": ("TEXT", 0, None, 0),
    "key_prefix": ("TEXT", 0, None, 0),
    "ip_allowlist": ("TEXT", 0, None, 0),
    "scopes": ("TEXT", 0, None, 0),
}
API_KEY_BOOTSTRAP_COLUMNS = {
    "is_active": ("is_active INTEGER NOT NULL DEFAULT 1", "INTEGER", 1, "1", 0),
    "is_banned": ("is_banned INTEGER NOT NULL DEFAULT 0", "INTEGER", 1, "0", 0),
    "key_hash": ("key_hash TEXT", "TEXT", 0, None, 0),
}


def identity(value: os.stat_result) -> tuple[int, ...]:
    return (
        value.st_dev, value.st_ino, value.st_size, value.st_mtime_ns,
        value.st_ctime_ns, value.st_mode, value.st_uid, value.st_nlink,
    )


def private_dir(path: Path) -> None:
    if path.exists() or path.is_symlink():
        info = path.lstat()
        if path.is_symlink() or not stat.S_ISDIR(info.st_mode) or info.st_uid != os.getuid():
            raise RuntimeError("config directory is unsafe")
    else:
        path.mkdir(parents=True, mode=0o700)
    descriptor = os.open(
        path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0),
    )
    try:
        opened = os.fstat(descriptor)
        named = path.lstat()
        if (not stat.S_ISDIR(opened.st_mode) or opened.st_uid != os.getuid()
                or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)):
            raise RuntimeError("config directory changed during open")
        os.fchmod(descriptor, 0o700)
    finally:
        os.close(descriptor)


def secure_read(path: Path) -> tuple[str, tuple[int, ...] | None]:
    if not path.exists() and not path.is_symlink():
        return "", None
    before = path.lstat()
    if (path.is_symlink() or not stat.S_ISREG(before.st_mode) or before.st_uid != os.getuid()
            or before.st_nlink != 1 or before.st_mode & 0o077 or before.st_size > MAX_BYTES):
        raise RuntimeError("environment file is unsafe")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(fd)
        named = path.lstat()
        if (not stat.S_ISREG(opened.st_mode) or opened.st_uid != os.getuid()
                or opened.st_nlink != 1 or opened.st_mode & 0o077
                or identity(before) != identity(opened) or identity(opened) != identity(named)):
            raise RuntimeError("environment file changed during open")
        chunks: list[bytes] = []
        remaining = opened.st_size
        while remaining:
            block = os.read(fd, min(remaining, 64 * 1024))
            if not block:
                raise RuntimeError("environment file was truncated during read")
            chunks.append(block)
            remaining -= len(block)
        if os.read(fd, 1):
            raise RuntimeError("environment file grew during read")
        after = os.fstat(fd)
        named = path.lstat()
    finally:
        os.close(fd)
    raw = b"".join(chunks)
    if len(raw) > MAX_BYTES or identity(opened) != identity(after) or identity(after) != identity(named):
        raise RuntimeError("environment file changed during read")
    return raw.decode("utf-8"), identity(after)


def current_value(text: str, key: str) -> str | None:
    found: list[str] = []
    for line in text.splitlines():
        match = LINE_RE.match(line.strip())
        if match and match.group(1) == key:
            found.append(line.split("=", 1)[1].strip().strip("\"'"))
    if len(found) > 1:
        raise RuntimeError("duplicate environment key")
    return found[0] if found else None


def selected_values(text: str, keys: tuple[str, ...]) -> dict[str, str | None]:
    """Parse only contract keys and reject duplicate authority instead of guessing precedence."""
    wanted = set(keys)
    found: dict[str, str] = {}
    for line in text.splitlines():
        match = LINE_RE.match(line.strip())
        if not match or match.group(1) not in wanted:
            continue
        key = match.group(1)
        if key in found:
            raise RuntimeError("duplicate environment key")
        found[key] = line.split("=", 1)[1].strip().strip("\"'")
    return {key: found.get(key) for key in keys}


def contract_fingerprint(text: str, include_enabled: bool = False) -> str:
    keys = STATE_KEYS if include_enabled else DESCRIPTOR_KEYS
    payload = json.dumps(
        {"schema": 1, "values": selected_values(text, keys)},
        sort_keys=True,
        separators=(",", ":"),
    ).encode()
    return hashlib.sha256(payload).hexdigest()


def set_values(path: Path, updates: dict[str, str]) -> bool:
    for key, value in updates.items():
        if not KEY_RE.fullmatch(key) or not value or "\n" in value or "\r" in value or "\0" in value:
            raise RuntimeError("invalid environment update")
    text, prior_identity = secure_read(path)
    existing: dict[str, list[str]] = {key: [] for key in updates}
    for line in text.splitlines():
        match = LINE_RE.match(line.strip())
        if match and match.group(1) in existing:
            existing[match.group(1)].append(line.split("=", 1)[1].strip().strip("\"'"))
    if all(values == [updates[key]] for key, values in existing.items()):
        return False
    output: list[str] = []
    replaced: set[str] = set()
    for line in text.splitlines():
        match = LINE_RE.match(line.strip())
        key = match.group(1) if match else None
        if key in updates:
            if key not in replaced:
                output.append(f"{key}={updates[key]}")
                replaced.add(key)
        else:
            output.append(line)
    for key, value in updates.items():
        if key not in replaced:
            output.append(f"{key}={value}")
    payload = ("\n".join(output).rstrip("\n") + "\n").encode()
    descriptor, staged = tempfile.mkstemp(prefix=f".{path.name}.staged.", dir=path.parent)
    try:
        os.fchmod(descriptor, 0o600)
        written = 0
        while written < len(payload):
            written += os.write(descriptor, payload[written:])
        os.fsync(descriptor)
        os.close(descriptor)
        descriptor = -1
        if prior_identity is not None:
            now = path.lstat()
            identity = (
                now.st_dev, now.st_ino, now.st_size, now.st_mtime_ns,
                now.st_ctime_ns, now.st_mode, now.st_uid, now.st_nlink,
            )
            if identity != prior_identity:
                raise RuntimeError("environment file changed before publish")
        elif path.exists() or path.is_symlink():
            raise RuntimeError("environment file appeared before publish")
        os.replace(staged, path)
        # Atomic visibility is established by replace(). Directory fsync adds crash durability where the
        # filesystem supports it; never report a false failure after the new value is already visible.
        directory = None
        try:
            try:
                directory = os.open(
                    path.parent,
                    os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0),
                )
                os.fsync(directory)
            except OSError:
                pass
        finally:
            if directory is not None:
                os.close(directory)
    finally:
        if descriptor >= 0:
            os.close(descriptor)
        try:
            os.unlink(staged)
        except FileNotFoundError:
            pass
    return True


def set_value(path: Path, key: str, value: str) -> bool:
    return set_values(path, {key: value})


def read_stdin_secret() -> str:
    """Read one bounded secret from stdin without placing it in argv or output."""
    raw = sys.stdin.buffer.read(MAX_STDIN_SECRET_BYTES + 1)
    if len(raw) > MAX_STDIN_SECRET_BYTES:
        raise RuntimeError("stdin secret is too large")
    if raw.endswith(b"\r\n"):
        raw = raw[:-2]
    elif raw.endswith(b"\n"):
        raw = raw[:-1]
    value = raw.decode("utf-8")
    if not value or any(char in value for char in "\r\n\0"):
        raise RuntimeError("stdin secret is invalid")
    return value


def secure_database(path: Path) -> tuple[sqlite3.Connection, tuple[int, int]]:
    if not path.is_absolute() or path.name != "storage.sqlite":
        raise RuntimeError("database path is invalid")
    parent = path.parent
    parent_info = parent.lstat()
    if (parent.is_symlink() or not stat.S_ISDIR(parent_info.st_mode)
            or parent_info.st_uid != os.getuid()):
        raise RuntimeError("database directory is unsafe")
    os.chmod(parent, 0o700)
    before = path.lstat()
    if (path.is_symlink() or not stat.S_ISREG(before.st_mode) or before.st_uid != os.getuid()
            or before.st_nlink != 1 or not 0 < before.st_size <= 8 * 1024 * 1024 * 1024):
        raise RuntimeError("database is unsafe")
    os.umask(0o077)
    os.chmod(path, 0o600)
    connection = sqlite3.connect(f"{path.as_uri()}?mode=rw", uri=True, timeout=5)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA busy_timeout=5000")
    named = path.lstat()
    if ((before.st_dev, before.st_ino) != (named.st_dev, named.st_ino)
            or named.st_uid != os.getuid() or named.st_nlink != 1
            or not stat.S_ISREG(named.st_mode) or named.st_mode & 0o077):
        connection.close()
        raise RuntimeError("database changed during open")
    return connection, (named.st_dev, named.st_ino)


def database_columns(connection: sqlite3.Connection, table: str) -> set[str]:
    if not re.fullmatch(r"[a-z0-9_]+", table):
        raise RuntimeError("invalid table")
    return {str(row[1]) for row in connection.execute(f"PRAGMA table_info({table})")}


def database_column_info(
    connection: sqlite3.Connection, table: str,
) -> dict[str, sqlite3.Row]:
    if not re.fullmatch(r"[a-z0-9_]+", table):
        raise RuntimeError("invalid table")
    return {
        str(row["name"]): row
        for row in connection.execute(f"PRAGMA table_info({table})")
    }


def column_matches(
    row: sqlite3.Row, expected: tuple[str, int, str | None, int],
) -> bool:
    column_type, not_null, default, primary_key = expected
    return (
        str(row["type"]).strip().upper() == column_type
        and int(row["notnull"]) == not_null
        and row["dflt_value"] == default
        and int(row["pk"]) == primary_key
    )


def ensure_api_key_columns(connection: sqlite3.Connection) -> bool:
    """Add only the three lazy 3.8.49 fallbacks needed by the managed key contract."""
    columns = database_column_info(connection, "api_keys")
    if any(
        name not in columns or not column_matches(columns[name], expected)
        for name, expected in API_KEY_BASE_COLUMNS.items()
    ):
        raise RuntimeError("unsupported api_keys schema")
    for name, (_, column_type, not_null, default, primary_key) in (
        API_KEY_BOOTSTRAP_COLUMNS.items()
    ):
        if name in columns and not column_matches(
            columns[name], (column_type, not_null, default, primary_key),
        ):
            raise RuntimeError("unsupported api_keys schema")

    changed = False
    for name, (definition, _, _, _, _) in API_KEY_BOOTSTRAP_COLUMNS.items():
        if name not in columns:
            connection.execute(f"ALTER TABLE api_keys ADD COLUMN {definition}")
            changed = True

    columns = database_column_info(connection, "api_keys")
    if any(
        name not in columns or not column_matches(
            columns[name], (column_type, not_null, default, primary_key),
        )
        for name, (_, column_type, not_null, default, primary_key) in (
            API_KEY_BOOTSTRAP_COLUMNS.items()
        )
    ):
        raise RuntimeError("unsupported api_keys schema")
    return changed


def key_row_is_usable(row: sqlite3.Row) -> bool:
    return (
        row["is_active"] in (1, True)
        and row["is_banned"] in (0, False, None)
        and row["revoked_at"] in (None, "")
        and row["expires_at"] in (None, "")
        and isinstance(row["key"], str)
        and len(row["key"]) >= 16
    )


def lookup_key_rows(connection: sqlite3.Connection, clause: str, value: str) -> list[sqlite3.Row]:
    if clause not in {"id", "key", "name"}:
        raise RuntimeError("invalid key lookup")
    return list(connection.execute(
        f"SELECT id, name, key, no_log, is_active, is_banned, revoked_at, expires_at "
        f"FROM api_keys WHERE {clause} = ?",
        (value,),
    ))


def ensure_no_log_key(path: Path, database: Path) -> bool:
    text, _ = secure_read(path)
    values = selected_values(text, DESCRIPTOR_KEYS)
    configured_key = values["NEWS_OMNIROUTE_API_KEY"]
    configured_id = values["NEWS_OMNIROUTE_API_KEY_ID"]
    connection, _ = secure_database(database)
    created = False
    schema_changed = False
    try:
        connection.execute("BEGIN IMMEDIATE")
        schema_changed = ensure_api_key_columns(connection)
        row: sqlite3.Row | None = None
        if configured_id:
            rows = lookup_key_rows(connection, "id", configured_id)
            if len(rows) != 1:
                raise RuntimeError("configured API key id is missing or ambiguous")
            row = rows[0]
            if configured_key and row["key"] != configured_key:
                raise RuntimeError("configured API key pair does not match")
        elif configured_key:
            rows = lookup_key_rows(connection, "key", configured_key)
            if len(rows) != 1:
                # An explicit untracked override is operator-owned. Never silently replace it with a
                # different credential just to make deployment green.
                raise RuntimeError("configured API key is not an OmniRoute database key")
            row = rows[0]
        else:
            rows = lookup_key_rows(connection, "name", MANAGED_KEY_NAME)
            if len(rows) > 1:
                raise RuntimeError("managed API key identity is ambiguous")
            if rows:
                row = rows[0]
            else:
                now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="milliseconds").replace(
                    "+00:00", "Z",
                )
                raw_key = "sk-" + secrets.token_hex(32)
                key_id = str(uuid.uuid4())
                connection.execute(
                    "INSERT INTO api_keys "
                    "(id, name, key, machine_id, allowed_models, no_log, created_at, key_prefix, "
                    " key_hash, scopes) VALUES (?, ?, ?, ?, '[]', 1, ?, ?, ?, '[]')",
                    (
                        key_id, MANAGED_KEY_NAME, raw_key, MANAGED_KEY_MACHINE_ID, now,
                        raw_key[:12], hashlib.sha256(raw_key.encode()).hexdigest(),
                    ),
                )
                rows = lookup_key_rows(connection, "id", key_id)
                if len(rows) != 1:
                    raise RuntimeError("managed API key creation was not visible")
                row = rows[0]
                created = True
        if row is None or not key_row_is_usable(row):
            raise RuntimeError("configured API key is inactive")
        if row["no_log"] not in (1, True):
            connection.execute("UPDATE api_keys SET no_log = 1 WHERE id = ?", (row["id"],))
        connection.commit()
        changed = set_values(path, {
            "NEWS_OMNIROUTE_API_KEY": str(row["key"]),
            "NEWS_OMNIROUTE_API_KEY_ID": str(row["id"]),
        })
        return schema_changed or created or changed or row["no_log"] not in (1, True)
    except Exception:
        try:
            connection.rollback()
        except sqlite3.Error:
            pass
        raise
    finally:
        connection.close()
        for suffix in ("-wal", "-shm", "-journal"):
            sidecar = Path(str(database) + suffix)
            try:
                info = sidecar.lstat()
                if (not sidecar.is_symlink() and stat.S_ISREG(info.st_mode)
                        and info.st_uid == os.getuid() and info.st_nlink == 1):
                    os.chmod(sidecar, 0o600)
            except FileNotFoundError:
                pass


def no_log_key_healthy(text: str, database: Path) -> bool:
    values = selected_values(text, DESCRIPTOR_KEYS)
    raw_key = values["NEWS_OMNIROUTE_API_KEY"]
    key_id = values["NEWS_OMNIROUTE_API_KEY_ID"]
    if not raw_key or not key_id:
        return False
    connection, _ = secure_database(database)
    try:
        required = {"id", "key", "no_log", "is_active", "is_banned", "revoked_at", "expires_at"}
        if not required.issubset(database_columns(connection, "api_keys")):
            return False
        rows = lookup_key_rows(connection, "id", key_id)
        return (
            len(rows) == 1
            and rows[0]["key"] == raw_key
            and rows[0]["no_log"] in (1, True)
            and key_row_is_usable(rows[0])
        )
    finally:
        connection.close()


def verify_no_body_log(text: str, database: Path, after: str) -> bool:
    values = selected_values(text, DESCRIPTOR_KEYS)
    key_id = values["NEWS_OMNIROUTE_API_KEY_ID"]
    if not key_id or not re.fullmatch(r"\d{4}-\d{2}-\d{2}T[^\r\n]{8,40}Z", after):
        return False
    connection, _ = secure_database(database)
    try:
        required = {
            "id", "timestamp", "api_key_id", "detail_state", "artifact_relpath",
            "artifact_size_bytes", "artifact_sha256", "has_request_body", "has_response_body",
            "has_pipeline_details", "request_summary",
        }
        if not required.issubset(database_columns(connection, "call_logs")):
            return False
        stable_reads = 0
        prior_count = -1
        rows: list[sqlite3.Row] = []
        for _ in range(50):
            rows = list(connection.execute(
                "SELECT id, detail_state, artifact_relpath, artifact_size_bytes, artifact_sha256, "
                "has_request_body, has_response_body, has_pipeline_details, request_summary "
                "FROM call_logs WHERE api_key_id = ? AND timestamp >= ? ORDER BY timestamp",
                (key_id, after),
            ))
            if len(rows) >= 2 and len(rows) == prior_count:
                stable_reads += 1
            else:
                stable_reads = 0
            prior_count = len(rows)
            if stable_reads >= 5:
                break
            time.sleep(0.1)
        if len(rows) < 2 or stable_reads < 5:
            return False
        for row in rows:
            if (row["detail_state"] != "none" or row["artifact_relpath"] is not None
                    or row["artifact_size_bytes"] is not None or row["artifact_sha256"] is not None
                    or row["has_request_body"] not in (0, None)
                    or row["has_response_body"] not in (0, None)
                    or row["has_pipeline_details"] not in (0, None)
                    or row["request_summary"] is not None):
                return False
        detailed_columns = database_columns(connection, "request_detail_logs")
        if detailed_columns and {"call_log_id"}.issubset(detailed_columns):
            placeholders = ",".join("?" for _ in rows)
            count = connection.execute(
                f"SELECT count(*) FROM request_detail_logs WHERE call_log_id IN ({placeholders})",
                tuple(row["id"] for row in rows),
            ).fetchone()[0]
            if count:
                return False
        return True
    finally:
        connection.close()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "action",
        choices=(
            "set", "matches", "fingerprint", "state-fingerprint", "model",
            "migrate-default-model", "ensure-no-log-key", "no-log-key-healthy",
            "verify-no-body-log",
        ),
    )
    parser.add_argument("--file", required=True)
    parser.add_argument("--key")
    parser.add_argument("--value")
    parser.add_argument("--value-stdin", action="store_true")
    parser.add_argument("--database")
    parser.add_argument("--after")
    args = parser.parse_args()
    path = Path(args.file)
    if (not path.is_absolute() or path.name != "providers.env"
            or path.parent == path.parent.parent):
        raise SystemExit(2)
    private_dir(path.parent)
    lock_path = path.parent / f".{path.name}.lock"
    lock_fd = os.open(lock_path, os.O_RDWR | os.O_CREAT | getattr(os, "O_NOFOLLOW", 0), 0o600)
    try:
        lock_info = os.fstat(lock_fd)
        named = lock_path.lstat()
        if (not stat.S_ISREG(lock_info.st_mode) or lock_info.st_uid != os.getuid()
                or lock_info.st_nlink != 1 or lock_path.is_symlink()
                or (lock_info.st_dev, lock_info.st_ino) != (named.st_dev, named.st_ino)):
            raise RuntimeError("environment lock is unsafe")
        os.fchmod(lock_fd, 0o600)
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        text, _ = secure_read(path)
        if args.action in {"fingerprint", "state-fingerprint"}:
            print(contract_fingerprint(text, include_enabled=args.action == "state-fingerprint"))
            return 0
        if args.action == "migrate-default-model":
            if (args.value_stdin
                    or any(value is not None for value in (args.key, args.value, args.database, args.after))):
                raise SystemExit(2)
            current = current_value(text, "NEWS_OMNIROUTE_MODEL")
            # This migration owns only the old managed default (or an installation that never wrote the
            # default explicitly). A different value is an operator-owned route and must remain byte-for-byte.
            changed = current is None or current in LEGACY_DEFAULT_OMNIROUTE_MODELS
            if changed:
                changed = set_value(path, "NEWS_OMNIROUTE_MODEL", DEFAULT_OMNIROUTE_MODEL)
            print("updated" if changed else "unchanged")
            return 0
        if args.action == "model":
            value = selected_values(text, DESCRIPTOR_KEYS)["NEWS_OMNIROUTE_MODEL"] or DEFAULT_OMNIROUTE_MODEL
            if not 0 < len(value) <= 300 or any(ord(char) < 32 or ord(char) == 127 for char in value):
                return 1
            print(value)
            return 0
        if args.action in {"ensure-no-log-key", "no-log-key-healthy", "verify-no-body-log"}:
            if (args.value_stdin or not args.database or args.key is not None
                    or args.value is not None):
                raise SystemExit(2)
            database = Path(args.database)
            if args.action == "ensure-no-log-key":
                changed = ensure_no_log_key(path, database)
                print("updated" if changed else "unchanged")
                return 0
            if args.action == "no-log-key-healthy":
                return 0 if no_log_key_healthy(text, database) else 1
            if not args.after:
                raise SystemExit(2)
            return 0 if verify_no_body_log(text, database, args.after) else 1
        if args.database is not None or args.after is not None:
            raise SystemExit(2)
        if args.value_stdin:
            if (args.action != "set" or args.value is not None
                    or not args.key or not CONNECTOR_SECRET_RE.fullmatch(args.key)):
                raise SystemExit(2)
            value = read_stdin_secret()
            changed = set_value(path, args.key, value)
            print("updated" if changed else "unchanged")
            return 0
        if args.key not in SETTABLE_BOOL_KEYS or args.value not in {"0", "1"}:
            raise SystemExit(2)
        if args.action == "matches":
            return 0 if current_value(text, args.key) == args.value else 1
        changed = set_value(path, args.key, args.value)
        print("updated" if changed else "unchanged")
        return 0
    finally:
        os.close(lock_fd)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, UnicodeError, RuntimeError):
        raise SystemExit(1)
