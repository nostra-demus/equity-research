#!/usr/bin/env python3
"""Issue, verify, and audit one-shot exact-program deployment receipts.

The launchd watcher is intentionally allowed to fetch and publish autonomous research data without a
release. Any other repository change requires either the separately-authorized bootstrap receipt or an
exact successful ``main`` push workflow with every required job green. A later target may contain additional
commits only when they change the autonomous data roots and leave the approved program digest unchanged.

The helper mints a short-lived GitHub App token through an owner-controlled command and holds it only in
memory. It never prints or stores credentials. ``check`` is the fail-closed runtime gate; ``audit`` writes a
tamper-evident, hash-chained outcome ledger outside Git.
"""

from __future__ import annotations

import argparse
import contextlib
import datetime as dt
import fcntl
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
import urllib.error
import urllib.parse
import urllib.request


SCHEMA_VERSION = "nostra-deploy-authorization/2.0"
AUDIT_SCHEMA_VERSION = "nostra-deploy-audit/1.0"
RECEIPT_NAME = "deploy-authorization.json"
DATA_ROOTS = ("analyses/", "screener/", "commodity/", "watchlist/")
SHA_RE = re.compile(r"(?:[0-9a-f]{40}|[0-9a-f]{64})\Z")
MAX_RECEIPT_BYTES = 16 * 1024
MAX_LEDGER_BYTES = 32 * 1024 * 1024
MAX_TTL_SECONDS = 24 * 60 * 60
MAX_API_BYTES = 2 * 1024 * 1024
WORKFLOW_PATH = ".github/workflows/ci.yml"
REPOSITORY_RE = re.compile(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+\Z")
TOKEN_RE = re.compile(r"[A-Za-z0-9_=-]{20,512}\Z")
REQUIRED_PUSH_JOBS = {
    "ui-server": "ui/server — typecheck + tests",
    "eval-contracts": "eval — decision-record contracts + framework anchors",
    "tools-tests": "tools — deterministic extractor + CIQ facts tests",
    "ui-web": "ui/web — typecheck + tests + build",
    "edge": "edge — offline-gate uptime-monitor unit tests",
}


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


@contextlib.contextmanager
def state_lock(path: pathlib.Path):
    """Serialize receipt issuance without trusting or replacing an unsafe lock inode."""
    lock = path.parent / ".deploy-authorization.flock"
    descriptor: int | None = None
    try:
        descriptor = os.open(
            lock,
            os.O_RDWR | os.O_CREAT | getattr(os, "O_NOFOLLOW", 0),
            0o600,
        )
        os.fchmod(descriptor, 0o600)
        opened = os.fstat(descriptor)
        named = lock.lstat()
        if (
            not stat.S_ISREG(opened.st_mode)
            or opened.st_uid != os.getuid()
            or opened.st_nlink != 1
            or opened.st_mode & 0o077
            or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)
        ):
            raise AuthorizationError("deployment authorization lock is unsafe")
        fcntl.flock(descriptor, fcntl.LOCK_EX)
        yield
    except OSError as error:
        raise AuthorizationError("deployment authorization lock is unavailable") from error
    finally:
        if descriptor is not None:
            os.close(descriptor)


def write_receipt(path: pathlib.Path, value: dict[str, Any], *, replace: bool) -> None:
    if path.exists() or path.is_symlink():
        if not replace:
            raise AuthorizationError("an unconsumed deployment authorization already exists")
        # Prove the named receipt is a safe file before replacing it. Automatic CI authorization may
        # supersede a stale receipt, but it must never overwrite a symlink or hostile inode.
        stable_read(path)
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
        directory = os.open(path.parent, os.O_RDONLY)
        try:
            os.fsync(directory)
        finally:
            os.close(directory)
    finally:
        if descriptor >= 0:
            os.close(descriptor)
        try:
            os.unlink(temporary)
        except FileNotFoundError:
            pass


def git_is_ancestor(repo: pathlib.Path, ancestor: str, target: str) -> bool:
    return subprocess.run(
        ["git", "-C", str(repo), "merge-base", "--is-ancestor", ancestor, target],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    ).returncode == 0


def validate_repository(raw: str) -> str:
    if not REPOSITORY_RE.fullmatch(raw):
        raise AuthorizationError("GitHub repository must be owner/name")
    return raw


def validate_api_base(raw: str) -> str:
    value = raw.rstrip("/")
    parsed = urllib.parse.urlparse(value)
    loopback = parsed.hostname in {"127.0.0.1", "::1", "localhost"}
    if parsed.scheme != "https" and not (parsed.scheme == "http" and loopback):
        raise AuthorizationError("GitHub API base must use HTTPS")
    if parsed.params or parsed.query or parsed.fragment or not parsed.netloc:
        raise AuthorizationError("GitHub API base is malformed")
    return value


def mint_token(raw_command: str) -> str:
    command = pathlib.Path(raw_command).expanduser()
    if not command.is_absolute():
        raise AuthorizationError("token command must be an absolute path")
    try:
        before = command.lstat()
        resolved = command.resolve(strict=True)
        opened = resolved.lstat()
    except OSError as error:
        raise AuthorizationError("token command is unavailable") from error
    if (
        command.is_symlink()
        or not stat.S_ISREG(before.st_mode)
        or before.st_uid != os.getuid()
        or before.st_nlink != 1
        or before.st_mode & 0o022
        or not before.st_mode & stat.S_IXUSR
        or (before.st_dev, before.st_ino) != (opened.st_dev, opened.st_ino)
    ):
        raise AuthorizationError("token command is not a safe owner-controlled executable")
    try:
        result = subprocess.run(
            [str(resolved)],
            check=True,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            timeout=45,
        )
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as error:
        raise AuthorizationError("could not mint a GitHub App token") from error
    token = result.stdout.strip()
    if not TOKEN_RE.fullmatch(token):
        raise AuthorizationError("GitHub App token output is malformed")
    return token


def github_json(api_base: str, token: str, path: str) -> dict[str, Any]:
    url = f"{api_base}{path}"
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "nostra-exact-main-release-verifier/1",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            raw = response.read(MAX_API_BYTES + 1)
            if len(raw) > MAX_API_BYTES:
                raise AuthorizationError("GitHub API response exceeded the safety limit")
            value = json.loads(raw.decode("utf-8", "strict"))
    except AuthorizationError:
        raise
    except (urllib.error.URLError, TimeoutError, OSError, UnicodeError, json.JSONDecodeError) as error:
        # Never include request headers, response bodies, or the token in an operator-facing error.
        raise AuthorizationError("GitHub Actions verification request failed") from error
    if not isinstance(value, dict):
        raise AuthorizationError("GitHub Actions response is not a JSON object")
    return value


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
        "authorization_source",
        "authorization_reference",
        "authorized_by",
        "authorized_at",
        "expires_at_epoch",
        "workflow",
    }
    legacy_keys = expected_keys - {"authorization_source", "workflow"}
    legacy_manual = value.get("schema_version") == "nostra-deploy-authorization/1.0" and set(value) == legacy_keys
    if legacy_manual:
        # One narrow compatibility lane lets the old installed watcher complete the separately-authorized
        # bootstrap deployment after it atomically installs this helper. The receipt remains short-lived,
        # exact-program, owner-only, and one-shot; it merely predates the provenance fields.
        value["authorization_source"] = "explicit_manual"
        value["workflow"] = None
    elif set(value) != expected_keys or value.get("schema_version") != SCHEMA_VERSION:
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
    source = value.get("authorization_source")
    if source not in {"explicit_manual", "exact_main_push_ci"}:
        raise AuthorizationError("deployment receipt authorization source is invalid")
    for key in ("authorization_reference", "authorized_by", "authorized_at"):
        if not isinstance(value.get(key), str) or not value[key].strip() or len(value[key]) > 256:
            raise AuthorizationError(f"deployment receipt {key} is invalid")
    workflow = value.get("workflow")
    if source == "explicit_manual":
        if workflow is not None:
            raise AuthorizationError("manual deployment receipt cannot carry workflow proof")
    else:
        expected_workflow_keys = {
            "repository",
            "workflow_path",
            "run_id",
            "run_attempt",
            "run_url",
            "head_sha",
            "event",
            "status",
            "conclusion",
            "verified_at",
            "created_at",
            "updated_at",
            "jobs",
        }
        if not isinstance(workflow, dict) or set(workflow) != expected_workflow_keys:
            raise AuthorizationError("CI deployment receipt workflow proof is malformed")
        if workflow.get("repository") != value.get("authorization_reference").split("#", 1)[0]:
            raise AuthorizationError("CI deployment receipt repository proof disagrees")
        if workflow.get("workflow_path") != WORKFLOW_PATH:
            raise AuthorizationError("CI deployment receipt workflow path disagrees")
        if not isinstance(workflow.get("run_id"), int) or isinstance(workflow.get("run_id"), bool) or workflow["run_id"] <= 0:
            raise AuthorizationError("CI deployment receipt run id is invalid")
        if not isinstance(workflow.get("run_attempt"), int) or isinstance(workflow.get("run_attempt"), bool) or workflow["run_attempt"] <= 0:
            raise AuthorizationError("CI deployment receipt run attempt is invalid")
        if not isinstance(workflow.get("run_url"), str) or not workflow["run_url"].startswith("https://github.com/"):
            raise AuthorizationError("CI deployment receipt run URL is invalid")
        if workflow.get("head_sha") != approved or workflow.get("event") != "push":
            raise AuthorizationError("CI deployment receipt commit/event proof disagrees")
        if workflow.get("status") != "completed" or workflow.get("conclusion") != "success":
            raise AuthorizationError("CI deployment receipt is not successful")
        for timestamp in ("verified_at", "created_at", "updated_at"):
            if not isinstance(workflow.get(timestamp), str) or not workflow[timestamp]:
                raise AuthorizationError(f"CI deployment receipt {timestamp} is invalid")
        jobs = workflow.get("jobs")
        if not isinstance(jobs, dict) or set(jobs) != set(REQUIRED_PUSH_JOBS):
            raise AuthorizationError("CI deployment receipt job set disagrees")
        for job_id, display_name in REQUIRED_PUSH_JOBS.items():
            proof = jobs.get(job_id)
            if not isinstance(proof, dict) or set(proof) != {"name", "status", "conclusion"}:
                raise AuthorizationError("CI deployment receipt job proof is malformed")
            if proof != {"name": display_name, "status": "completed", "conclusion": "success"}:
                raise AuthorizationError("CI deployment receipt contains a non-green required job")
    return approved, digest


def authorize(args: argparse.Namespace) -> int:
    repo = require_repo(args.repo)
    approved = require_commit(repo, args.commit)
    remote = git(repo, "rev-parse", "origin/main^{commit}")
    if not git_is_ancestor(repo, approved, remote):
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
        "authorization_source": "explicit_manual",
        "authorization_reference": args.authorization_reference,
        "authorized_by": args.authorized_by,
        "authorized_at": dt.datetime.fromtimestamp(now, dt.timezone.utc).isoformat().replace("+00:00", "Z"),
        "expires_at_epoch": now + ttl,
        "workflow": None,
    }
    path = receipt_path(args.state_dir)
    with state_lock(path):
        write_receipt(path, value, replace=False)
    print(f"AUTHORIZED_COMMIT={approved}")
    print(f"PROGRAM_MANIFEST={digest}")
    print(f"PROGRAM_FILE_COUNT={count}")
    return 0


def required_job_proof(api_base: str, token: str, repository: str, run_id: int) -> dict[str, dict[str, str]]:
    encoded_repository = urllib.parse.quote(repository, safe="/")
    value = github_json(
        api_base,
        token,
        f"/repos/{encoded_repository}/actions/runs/{run_id}/jobs?filter=latest&per_page=100",
    )
    raw_jobs = value.get("jobs")
    if not isinstance(raw_jobs, list):
        raise AuthorizationError("GitHub Actions jobs response is malformed")
    by_name: dict[str, dict[str, Any]] = {}
    for raw in raw_jobs:
        if not isinstance(raw, dict) or not isinstance(raw.get("name"), str):
            continue
        name = raw["name"]
        if name in REQUIRED_PUSH_JOBS.values():
            if name in by_name:
                raise AuthorizationError("GitHub Actions returned duplicate required job names")
            by_name[name] = raw
    proof: dict[str, dict[str, str]] = {}
    for job_id, display_name in REQUIRED_PUSH_JOBS.items():
        raw = by_name.get(display_name)
        if raw is None or raw.get("status") != "completed" or raw.get("conclusion") != "success":
            raise AuthorizationError(f"required push-CI job is not green: {job_id}")
        proof[job_id] = {
            "name": display_name,
            "status": "completed",
            "conclusion": "success",
        }
    return proof


def exact_green_push(
    repo: pathlib.Path,
    target: str,
    repository: str,
    api_base: str,
    token: str,
) -> dict[str, Any]:
    encoded_repository = urllib.parse.quote(repository, safe="/")
    encoded_workflow = urllib.parse.quote("ci.yml", safe="")
    value = github_json(
        api_base,
        token,
        f"/repos/{encoded_repository}/actions/workflows/{encoded_workflow}/runs"
        "?branch=main&event=push&status=completed&per_page=100",
    )
    raw_runs = value.get("workflow_runs")
    if not isinstance(raw_runs, list):
        raise AuthorizationError("GitHub Actions workflow-runs response is malformed")
    target_digest, target_count = program_manifest(repo, target)
    for raw in raw_runs:
        if not isinstance(raw, dict):
            continue
        head = raw.get("head_sha")
        run_id = raw.get("id")
        run_attempt = raw.get("run_attempt")
        if (
            raw.get("path") != WORKFLOW_PATH
            or raw.get("event") != "push"
            or raw.get("head_branch") != "main"
            or raw.get("status") != "completed"
            or raw.get("conclusion") != "success"
            or not isinstance(run_id, int)
            or isinstance(run_id, bool)
            or run_id <= 0
            or not isinstance(run_attempt, int)
            or isinstance(run_attempt, bool)
            or run_attempt <= 0
            or not isinstance(head, str)
            or not SHA_RE.fullmatch(head)
        ):
            continue
        try:
            require_commit(repo, head)
            if not git_is_ancestor(repo, head, target):
                continue
            head_digest, head_count = program_manifest(repo, head)
        except AuthorizationError:
            continue
        if head_digest != target_digest or head_count != target_count:
            continue
        jobs = required_job_proof(api_base, token, repository, run_id)
        run_url = raw.get("html_url")
        if not isinstance(run_url, str) or not run_url.startswith(f"https://github.com/{repository}/actions/runs/"):
            raise AuthorizationError("successful push-CI run URL is malformed")
        now_iso = dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")
        created_at = raw.get("created_at")
        updated_at = raw.get("updated_at")
        if not isinstance(created_at, str) or not created_at or not isinstance(updated_at, str) or not updated_at:
            raise AuthorizationError("successful push-CI run timestamps are malformed")
        return {
            "repository": repository,
            "workflow_path": WORKFLOW_PATH,
            "run_id": run_id,
            "run_attempt": run_attempt,
            "run_url": run_url,
            "head_sha": head,
            "event": "push",
            "status": "completed",
            "conclusion": "success",
            "verified_at": now_iso,
            "created_at": created_at,
            "updated_at": updated_at,
            "jobs": jobs,
        }
    raise AuthorizationError("no exact all-green main push workflow proves this program")


def authorize_ci(args: argparse.Namespace) -> int:
    repo = require_repo(args.repo)
    target = require_commit(repo, args.target)
    remote = git(repo, "rev-parse", "origin/main^{commit}")
    if target != remote:
        raise AuthorizationError("automatic deployment target must equal origin/main")
    repository = validate_repository(args.repository)
    api_base = validate_api_base(args.api_base)
    if not 60 <= args.ttl_seconds <= MAX_TTL_SECONDS:
        raise AuthorizationError(f"ttl must be between 60 and {MAX_TTL_SECONDS} seconds")
    token = mint_token(args.token_command)
    workflow = exact_green_push(repo, target, repository, api_base, token)
    approved = workflow["head_sha"]
    digest, count = program_manifest(repo, approved)
    now = int(time.time())
    value = {
        "schema_version": SCHEMA_VERSION,
        "repository": str(repo),
        "approved_commit": approved,
        "program_manifest_sha256": digest,
        "program_file_count": count,
        "authorization_source": "exact_main_push_ci",
        "authorization_reference": f"{repository}#{workflow['run_id']}",
        "authorized_by": "github-actions-verifier",
        "authorized_at": dt.datetime.fromtimestamp(now, dt.timezone.utc).isoformat().replace("+00:00", "Z"),
        "expires_at_epoch": now + args.ttl_seconds,
        "workflow": workflow,
    }
    path = receipt_path(args.state_dir)
    with state_lock(path):
        if path.exists() and not path.is_symlink():
            try:
                existing, _ = stable_read(path)
                existing_approved, existing_digest = validate_shape(existing, repo, now)
                existing_workflow = existing.get("workflow")
                if (
                    existing_approved == approved
                    and existing_digest == digest
                    and isinstance(existing_workflow, dict)
                    and existing_workflow.get("run_id") == workflow["run_id"]
                ):
                    print(f"AUTHORIZED_COMMIT={approved}")
                    print(f"PROGRAM_MANIFEST={digest}")
                    print(f"WORKFLOW_RUN_ID={workflow['run_id']}")
                    return 0
            except AuthorizationError:
                # A safe but stale/malformed receipt may be superseded only after exact CI proof succeeds.
                pass
        write_receipt(path, value, replace=True)
    print(f"AUTHORIZED_COMMIT={approved}")
    print(f"PROGRAM_MANIFEST={digest}")
    print(f"WORKFLOW_RUN_ID={workflow['run_id']}")
    return 0


def checked(args: argparse.Namespace) -> tuple[pathlib.Path, dict[str, Any], str, tuple[int, ...]]:
    repo = require_repo(args.repo)
    target = require_commit(repo, args.target)
    path = receipt_path(args.state_dir)
    value, receipt_identity = stable_read(path)
    approved, expected_digest = validate_shape(value, repo, int(time.time()))
    require_commit(repo, approved)
    if not git_is_ancestor(repo, approved, target):
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


def canonical_json(value: dict[str, Any]) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")


def audit_ledger_path(raw: str) -> pathlib.Path:
    path = pathlib.Path(raw).expanduser()
    if not path.is_absolute():
        raise AuthorizationError("deployment audit ledger path must be absolute")
    parent = path.parent
    if parent.exists():
        info = parent.lstat()
        if (
            not stat.S_ISDIR(info.st_mode)
            or parent.is_symlink()
            or info.st_uid != os.getuid()
            or info.st_mode & 0o077
        ):
            raise AuthorizationError("deployment audit directory is not owner-only")
    else:
        parent.mkdir(mode=0o700, parents=True)
    return path


def read_audit_rows(descriptor: int, size: int) -> list[dict[str, Any]]:
    os.lseek(descriptor, 0, os.SEEK_SET)
    raw = b""
    while len(raw) <= MAX_LEDGER_BYTES:
        chunk = os.read(descriptor, min(64 * 1024, MAX_LEDGER_BYTES + 1 - len(raw)))
        if not chunk:
            break
        raw += chunk
    if len(raw) != size or len(raw) > MAX_LEDGER_BYTES:
        raise AuthorizationError("deployment audit ledger changed or exceeded its safety limit")
    if raw and not raw.endswith(b"\n"):
        raise AuthorizationError("deployment audit ledger has a truncated tail")
    rows: list[dict[str, Any]] = []
    previous: str | None = None
    for line in raw.splitlines():
        try:
            value = json.loads(line.decode("utf-8", "strict"))
        except (UnicodeError, json.JSONDecodeError) as error:
            raise AuthorizationError("deployment audit ledger contains malformed JSON") from error
        if not isinstance(value, dict) or value.get("schema_version") != AUDIT_SCHEMA_VERSION:
            raise AuthorizationError("deployment audit ledger schema disagrees")
        event_hash = value.get("event_sha256")
        if not isinstance(event_hash, str) or not re.fullmatch(r"sha256:[0-9a-f]{64}", event_hash):
            raise AuthorizationError("deployment audit ledger event hash is malformed")
        if value.get("previous_event_sha256") != previous:
            raise AuthorizationError("deployment audit ledger hash chain is broken")
        unhashed = dict(value)
        del unhashed["event_sha256"]
        calculated = "sha256:" + hashlib.sha256(canonical_json(unhashed)).hexdigest()
        if calculated != event_hash:
            raise AuthorizationError("deployment audit ledger event digest disagrees")
        rows.append(value)
        previous = event_hash
    return rows


def append_audit_event(path: pathlib.Path, event: dict[str, Any]) -> str:
    descriptor: int | None = None
    try:
        descriptor = os.open(
            path,
            os.O_RDWR | os.O_APPEND | os.O_CREAT | getattr(os, "O_NOFOLLOW", 0),
            0o600,
        )
        os.fchmod(descriptor, 0o600)
        fcntl.flock(descriptor, fcntl.LOCK_EX)
        opened = os.fstat(descriptor)
        named = path.lstat()
        if (
            not stat.S_ISREG(opened.st_mode)
            or opened.st_uid != os.getuid()
            or opened.st_nlink != 1
            or opened.st_mode & 0o077
            or opened.st_size > MAX_LEDGER_BYTES
            or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)
        ):
            raise AuthorizationError("deployment audit ledger is not a safe owner-only file")
        rows = read_audit_rows(descriptor, opened.st_size)
        event_key = event["event_key"]
        for row in rows:
            if row.get("event_key") == event_key:
                return row["event_sha256"]
        event["previous_event_sha256"] = rows[-1]["event_sha256"] if rows else None
        event_hash = "sha256:" + hashlib.sha256(canonical_json(event)).hexdigest()
        value = {**event, "event_sha256": event_hash}
        encoded = canonical_json(value) + b"\n"
        if opened.st_size + len(encoded) > MAX_LEDGER_BYTES:
            raise AuthorizationError("deployment audit ledger reached its safety limit")
        if os.write(descriptor, encoded) != len(encoded):
            raise AuthorizationError("deployment audit ledger append was short")
        os.fsync(descriptor)
        return event_hash
    except OSError as error:
        raise AuthorizationError("deployment audit ledger could not be appended") from error
    finally:
        if descriptor is not None:
            os.close(descriptor)


def audit(args: argparse.Namespace) -> int:
    repo = require_repo(args.repo)
    target = require_commit(repo, args.target)
    deployed = require_commit(repo, args.deployed_commit)
    _, receipt, approved, _ = checked(args)
    if args.approved_commit != approved:
        raise AuthorizationError("audit request disagrees with the checked authorization")
    if args.health_result not in {"healthy", "failed"}:
        raise AuthorizationError("deployment health result is invalid")
    if args.rollback_result not in {"not_needed", "restored_last_good", "failed_or_unverified"}:
        raise AuthorizationError("deployment rollback result is invalid")
    if args.health_result == "healthy" and (args.rollback_result != "not_needed" or deployed != target):
        raise AuthorizationError("healthy deployment audit must record the exact target without rollback")
    if args.health_result == "failed" and args.rollback_result == "not_needed":
        raise AuthorizationError("failed deployment audit must record a rollback result")
    if args.started_at_epoch <= 0 or args.started_at_epoch > int(time.time()) + 300:
        raise AuthorizationError("deployment start time is invalid")
    event_identity = {
        "target_commit": target,
        "approved_commit": approved,
        "program_manifest_sha256": receipt["program_manifest_sha256"],
        "health_result": args.health_result,
        "rollback_result": args.rollback_result,
        "deployed_commit": deployed,
        "started_at_epoch": args.started_at_epoch,
    }
    event_key = "sha256:" + hashlib.sha256(canonical_json(event_identity)).hexdigest()
    event = {
        "schema_version": AUDIT_SCHEMA_VERSION,
        "event_key": event_key,
        "previous_event_sha256": None,
        "target_commit": target,
        "approved_commit": approved,
        "program_manifest_sha256": receipt["program_manifest_sha256"],
        "program_file_count": receipt["program_file_count"],
        "authorization_source": receipt["authorization_source"],
        "authorization_reference": receipt["authorization_reference"],
        "authorized_at": receipt["authorized_at"],
        "workflow": receipt["workflow"],
        "deploy_started_at_epoch": args.started_at_epoch,
        "recorded_at": dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z"),
        "health_result": args.health_result,
        "rollback_result": args.rollback_result,
        "deployed_commit": deployed,
    }
    ledger = audit_ledger_path(args.ledger)
    try:
        if pathlib.Path(os.path.commonpath((str(repo), str(ledger)))) == repo:
            raise AuthorizationError("deployment audit ledger must live outside Git")
    except ValueError as error:
        raise AuthorizationError("deployment audit ledger path is invalid") from error
    digest = append_audit_event(ledger, event)
    print(f"AUDIT_EVENT_SHA256={digest}")
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
    ci = subparsers.add_parser("authorize-ci", help="issue a receipt from an exact all-green main push")
    ci.add_argument("--repo", required=True)
    ci.add_argument("--state-dir", required=True)
    ci.add_argument("--target", required=True)
    ci.add_argument("--repository", required=True)
    ci.add_argument("--token-command", required=True)
    ci.add_argument("--api-base", default="https://api.github.com")
    ci.add_argument("--ttl-seconds", type=int, default=6 * 60 * 60)
    ci.set_defaults(handler=authorize_ci)
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
    record = subparsers.add_parser("audit", help="append one hash-chained deployment outcome")
    record.add_argument("--repo", required=True)
    record.add_argument("--state-dir", required=True)
    record.add_argument("--target", required=True)
    record.add_argument("--approved-commit", required=True)
    record.add_argument("--ledger", required=True)
    record.add_argument("--started-at-epoch", required=True, type=int)
    record.add_argument("--health-result", required=True)
    record.add_argument("--rollback-result", required=True)
    record.add_argument("--deployed-commit", required=True)
    record.set_defaults(handler=audit)
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
