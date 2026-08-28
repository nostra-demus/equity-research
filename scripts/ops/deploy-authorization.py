#!/usr/bin/env python3
"""Issue and verify one-shot, exact-program production deployment receipts.

The launchd watcher is intentionally allowed to fetch and publish autonomous research data without a
human release decision.  Any other repository change is a production release and requires a short-lived
receipt issued for the exact reviewed program state.  A later target may contain additional commits only
when those commits change the autonomous data roots and therefore leave the approved program digest
unchanged.

This helper never reads or stores credentials.  The authorization reference is an operator audit label,
not a token.  Policy determines when ``authorize`` may be invoked; ``check`` is the fail-closed runtime gate.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import pathlib
import re
import stat
import subprocess
import sys
import tempfile
import time
from typing import Any


SCHEMA_VERSION = "nostra-deploy-authorization/1.0"
RECEIPT_NAME = "deploy-authorization.json"
DATA_ROOTS = ("analyses/", "screener/", "commodity/", "watchlist/")
SHA_RE = re.compile(r"(?:[0-9a-f]{40}|[0-9a-f]{64})\Z")
MAX_RECEIPT_BYTES = 16 * 1024
MAX_TTL_SECONDS = 24 * 60 * 60


class AuthorizationError(RuntimeError):
    pass


def git(repo: pathlib.Path, *args: str, text: bool = True) -> str | bytes:
    try:
        result = subprocess.run(
            ["git", "-C", str(repo), *args],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
    except (OSError, subprocess.CalledProcessError) as error:
        raise AuthorizationError(f"git verification failed: {' '.join(args)}") from error
    return result.stdout.decode("utf-8", "strict").strip() if text else result.stdout


def require_repo(raw: str) -> pathlib.Path:
    repo = pathlib.Path(raw).expanduser().resolve(strict=True)
    if not repo.is_dir() or git(repo, "rev-parse", "--show-toplevel") != str(repo):
        raise AuthorizationError("repository must be its canonical top-level worktree")
    return repo


def require_commit(repo: pathlib.Path, raw: str) -> str:
    if not SHA_RE.fullmatch(raw):
        raise AuthorizationError("commit must be a full lowercase Git SHA")
    resolved = git(repo, "rev-parse", f"{raw}^{{commit}}")
    if resolved != raw:
        raise AuthorizationError("commit does not resolve exactly")
    return raw


def program_manifest(repo: pathlib.Path, commit: str) -> tuple[str, int]:
    """Hash the immutable non-data Git tree without materialising checkout bytes."""
    raw = git(repo, "ls-tree", "-r", "-z", commit, text=False)
    assert isinstance(raw, bytes)
    rows: list[bytes] = []
    for record in raw.split(b"\0"):
        if not record:
            continue
        try:
            metadata, encoded_path = record.split(b"\t", 1)
            path = encoded_path.decode("utf-8", "strict")
        except (ValueError, UnicodeError) as error:
            raise AuthorizationError("program tree contains a malformed path") from error
        if path.startswith(DATA_ROOTS):
            continue
        rows.append(metadata + b"\t" + encoded_path + b"\0")
    if not rows:
        raise AuthorizationError("program manifest is empty")
    return "sha256:" + hashlib.sha256(b"".join(rows)).hexdigest(), len(rows)


def receipt_path(raw_state_dir: str) -> pathlib.Path:
    state_dir = pathlib.Path(raw_state_dir).expanduser()
    if not state_dir.is_absolute():
        raise AuthorizationError("state directory must be absolute")
    if state_dir.exists():
        info = state_dir.lstat()
        if (
            not stat.S_ISDIR(info.st_mode)
            or state_dir.is_symlink()
            or info.st_uid != os.getuid()
            or info.st_mode & 0o077
        ):
            raise AuthorizationError("state directory is not owner-only")
    else:
        state_dir.mkdir(mode=0o700, parents=True)
    return state_dir / RECEIPT_NAME


def stable_read(path: pathlib.Path) -> tuple[dict[str, Any], tuple[int, ...]]:
    descriptor: int | None = None
    try:
        before = path.lstat()
        if (
            not stat.S_ISREG(before.st_mode)
            or path.is_symlink()
            or before.st_uid != os.getuid()
            or before.st_nlink != 1
            or before.st_mode & 0o077
            or not 0 < before.st_size <= MAX_RECEIPT_BYTES
        ):
            raise AuthorizationError("deployment receipt is not a safe owner-only file")
        descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
        opened = os.fstat(descriptor)
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
            raise AuthorizationError("deployment receipt changed during open")
        raw = b""
        while len(raw) <= MAX_RECEIPT_BYTES:
            chunk = os.read(descriptor, min(64 * 1024, MAX_RECEIPT_BYTES + 1 - len(raw)))
            if not chunk:
                break
            raw += chunk
        after = os.fstat(descriptor)
        named = path.lstat()
        identity = lambda value: (
            value.st_dev,
            value.st_ino,
            value.st_size,
            value.st_mtime_ns,
            value.st_ctime_ns,
            value.st_mode,
            value.st_uid,
            value.st_nlink,
        )
        if len(raw) > MAX_RECEIPT_BYTES or identity(before) != identity(opened) or identity(opened) != identity(after) or identity(after) != identity(named):
            raise AuthorizationError("deployment receipt changed during read")
        value = json.loads(raw.decode("utf-8", "strict"))
    except FileNotFoundError as error:
        raise AuthorizationError("no deployment authorization receipt") from error
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise AuthorizationError("deployment receipt is unreadable") from error
    finally:
        if descriptor is not None:
            os.close(descriptor)
    if not isinstance(value, dict):
        raise AuthorizationError("deployment receipt must be a JSON object")
    return value, identity(after)


def validate_shape(value: dict[str, Any], repo: pathlib.Path, now: int) -> tuple[str, str]:
    expected_keys = {
        "schema_version",
        "repository",
        "approved_commit",
        "program_manifest_sha256",
        "program_file_count",
        "authorization_reference",
        "authorized_by",
        "authorized_at",
        "expires_at_epoch",
    }
    if set(value) != expected_keys or value.get("schema_version") != SCHEMA_VERSION:
        raise AuthorizationError("deployment receipt schema disagrees")
    if value.get("repository") != str(repo):
        raise AuthorizationError("deployment receipt belongs to another worktree")
    approved = value.get("approved_commit")
    digest = value.get("program_manifest_sha256")
    count = value.get("program_file_count")
    expires = value.get("expires_at_epoch")
    if not isinstance(approved, str) or not SHA_RE.fullmatch(approved):
        raise AuthorizationError("deployment receipt commit is malformed")
    if not isinstance(digest, str) or not re.fullmatch(r"sha256:[0-9a-f]{64}", digest):
        raise AuthorizationError("deployment receipt manifest is malformed")
    if not isinstance(count, int) or isinstance(count, bool) or count <= 0:
        raise AuthorizationError("deployment receipt program count is invalid")
    if not isinstance(expires, int) or isinstance(expires, bool) or now >= expires:
        raise AuthorizationError("deployment authorization has expired")
    for key in ("authorization_reference", "authorized_by", "authorized_at"):
        if not isinstance(value.get(key), str) or not value[key].strip() or len(value[key]) > 256:
            raise AuthorizationError(f"deployment receipt {key} is invalid")
    return approved, digest


def authorize(args: argparse.Namespace) -> int:
    repo = require_repo(args.repo)
    approved = require_commit(repo, args.commit)
    remote = git(repo, "rev-parse", "origin/main^{commit}")
    if subprocess.run(
        ["git", "-C", str(repo), "merge-base", "--is-ancestor", approved, remote],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    ).returncode != 0:
        raise AuthorizationError("approved commit is not contained in origin/main")
    ttl = args.ttl_seconds
    if not 60 <= ttl <= MAX_TTL_SECONDS:
        raise AuthorizationError(f"ttl must be between 60 and {MAX_TTL_SECONDS} seconds")
    # Reject metadata that validate_shape would later refuse, BEFORE writing the receipt.
    # Otherwise an empty (e.g. unset shell var) or over-long value writes a receipt that
    # every subsequent check rejects while authorize refuses to replace it — wedging
    # deployment until the state directory is edited by hand.
    for flag, supplied in (
        ("--authorization-reference", args.authorization_reference),
        ("--authorized-by", args.authorized_by),
    ):
        if not isinstance(supplied, str) or not supplied.strip() or len(supplied) > 256:
            raise AuthorizationError(f"{flag} must be a non-empty string of at most 256 characters")
    digest, count = program_manifest(repo, approved)
    now = int(time.time())
    value = {
        "schema_version": SCHEMA_VERSION,
        "repository": str(repo),
        "approved_commit": approved,
        "program_manifest_sha256": digest,
        "program_file_count": count,
        "authorization_reference": args.authorization_reference,
        "authorized_by": args.authorized_by,
        "authorized_at": dt.datetime.fromtimestamp(now, dt.timezone.utc).isoformat().replace("+00:00", "Z"),
        "expires_at_epoch": now + ttl,
    }
    path = receipt_path(args.state_dir)
    if path.exists() or path.is_symlink():
        raise AuthorizationError("an unconsumed deployment authorization already exists")
    descriptor, temporary = tempfile.mkstemp(prefix=".deploy-authorization.", dir=path.parent)
    try:
        os.fchmod(descriptor, 0o600)
        with os.fdopen(descriptor, "w", encoding="utf-8", closefd=True) as handle:
            descriptor = -1
            json.dump(value, handle, sort_keys=True, separators=(",", ":"))
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if descriptor >= 0:
            os.close(descriptor)
        try:
            os.unlink(temporary)
        except FileNotFoundError:
            pass
    print(f"AUTHORIZED_COMMIT={approved}")
    print(f"PROGRAM_MANIFEST={digest}")
    print(f"PROGRAM_FILE_COUNT={count}")
    return 0


def checked(args: argparse.Namespace) -> tuple[pathlib.Path, dict[str, Any], str, tuple[int, ...]]:
    repo = require_repo(args.repo)
    target = require_commit(repo, args.target)
    path = receipt_path(args.state_dir)
    value, receipt_identity = stable_read(path)
    approved, expected_digest = validate_shape(value, repo, int(time.time()))
    require_commit(repo, approved)
    if subprocess.run(
        ["git", "-C", str(repo), "merge-base", "--is-ancestor", approved, target],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    ).returncode != 0:
        raise AuthorizationError("target does not descend from the approved commit")
    target_digest, target_count = program_manifest(repo, target)
    if target_digest != expected_digest or target_count != value["program_file_count"]:
        raise AuthorizationError("target program differs from the approved program")
    return path, value, approved, receipt_identity


def check_receipt(args: argparse.Namespace) -> int:
    _, _, approved, _ = checked(args)
    print(f"AUTHORIZED_COMMIT={approved}")
    return 0


def consume(args: argparse.Namespace) -> int:
    path, _, approved, receipt_identity = checked(args)
    if args.approved_commit != approved:
        raise AuthorizationError("consume request disagrees with the checked authorization")
    named = path.lstat()
    current_identity = (
        named.st_dev,
        named.st_ino,
        named.st_size,
        named.st_mtime_ns,
        named.st_ctime_ns,
        named.st_mode,
        named.st_uid,
        named.st_nlink,
    )
    if current_identity != receipt_identity:
        raise AuthorizationError("deployment receipt changed before consume")
    path.unlink()
    print(f"CONSUMED_COMMIT={approved}")
    return 0


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    subparsers = result.add_subparsers(dest="command", required=True)
    issue = subparsers.add_parser("authorize", help="write one short-lived exact-program receipt")
    issue.add_argument("--repo", required=True)
    issue.add_argument("--state-dir", required=True)
    issue.add_argument("--commit", required=True)
    issue.add_argument("--authorization-reference", required=True)
    issue.add_argument("--authorized-by", required=True)
    issue.add_argument("--ttl-seconds", type=int, default=6 * 60 * 60)
    issue.set_defaults(handler=authorize)
    verify = subparsers.add_parser("check", help="verify target matches the authorized program")
    verify.add_argument("--repo", required=True)
    verify.add_argument("--state-dir", required=True)
    verify.add_argument("--target", required=True)
    verify.set_defaults(handler=check_receipt)
    used = subparsers.add_parser("consume", help="delete the receipt after a successful deployment")
    used.add_argument("--repo", required=True)
    used.add_argument("--state-dir", required=True)
    used.add_argument("--target", required=True)
    used.add_argument("--approved-commit", required=True)
    used.set_defaults(handler=consume)
    return result


def main() -> int:
    args = parser().parse_args()
    try:
        return args.handler(args)
    except AuthorizationError as error:
        print(f"deploy-authorization: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
