#!/usr/bin/env python3
"""One crash-safe lease for repository data transactions.

Every writer that can race a deploy or ``commit-run.sh`` uses the same persistent
lock file in this worktree's Git directory.  The kernel owns the lease, so process
death releases it without PID files, stale-lock deletion, or TMPDIR conventions.

The descriptor is deliberately passed to ``append-ndjson.sh``.  That child verifies
the inherited descriptor names the same lock and reuses the open-file description,
which avoids self-deadlock while keeping a multi-file mutation under one lease.
"""
from __future__ import annotations

import contextlib
import errno
import fcntl
import json
import os
import stat
import subprocess
import tempfile
import time
from dataclasses import dataclass
from typing import Iterator, Sequence


LOCK_BASENAME = "nostra-engine-mutation.flock"
INHERITED_LOCK_FD_ENV = "NOSTRA_REPO_LOCK_FD"
DEFAULT_WAIT_MS = 900_000


def _lock_path(repo_root: str) -> str:
    root = os.path.realpath(repo_root)
    raw = subprocess.check_output(
        ["git", "-C", root, "rev-parse", "--git-path", LOCK_BASENAME],
        text=True,
    ).strip()
    if not raw:
        raise RuntimeError("git returned no repository mutation lock path")
    return raw if os.path.isabs(raw) else os.path.join(root, raw)


def _wait_ms(value: int | None) -> int:
    if value is not None:
        return max(0, int(value))
    try:
        return max(0, int(os.environ.get("NOSTRA_REPO_LOCK_WAIT_MS", str(DEFAULT_WAIT_MS))))
    except ValueError:
        return DEFAULT_WAIT_MS


def _acquire(fd: int, wait_ms: int) -> None:
    deadline = time.monotonic() + wait_ms / 1000
    while True:
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
            return
        except BlockingIOError:
            if time.monotonic() >= deadline:
                raise TimeoutError("timed out waiting for the repository mutation lock")
            time.sleep(0.05)


@dataclass
class RepositoryMutationLease:
    repo_root: str
    lock_path: str
    fd: int
    _owns_fd: bool = True

    def run(self, argv: Sequence[str], **kwargs) -> subprocess.CompletedProcess:
        """Run a cooperating child under this exact open-file-description lease."""
        env = dict(os.environ)
        env.update(kwargs.pop("env", {}) or {})
        env[INHERITED_LOCK_FD_ENV] = str(self.fd)
        inherited = tuple(kwargs.pop("pass_fds", ()) or ())
        kwargs["pass_fds"] = tuple(dict.fromkeys((*inherited, self.fd)))
        kwargs["env"] = env
        return subprocess.run(list(argv), **kwargs)

    def release(self) -> None:
        if self._owns_fd:
            self._owns_fd = False
            os.close(self.fd)


@contextlib.contextmanager
def repository_mutation(repo_root: str, wait_ms: int | None = None) -> Iterator[RepositoryMutationLease]:
    """Hold the shared repository lease until the complete transaction finishes."""
    root = os.path.realpath(repo_root)
    lock_path = _lock_path(root)
    os.makedirs(os.path.dirname(lock_path), exist_ok=True)
    fd = os.open(lock_path, os.O_RDWR | os.O_CREAT | os.O_APPEND, 0o600)
    try:
        _acquire(fd, _wait_ms(wait_ms))
        lease = RepositoryMutationLease(root, lock_path, fd)
        try:
            yield lease
        finally:
            lease.release()
    except BaseException:
        try:
            os.close(fd)
        except OSError:
            pass
        raise


def append_ndjson(
    lease: RepositoryMutationLease,
    helper: str,
    path: str,
    row: dict,
    key: str,
    value: str,
) -> None:
    lease.run(
        ["bash", helper, path, json.dumps(row, ensure_ascii=False), key, value],
        cwd=lease.repo_root,
        check=True,
        stdout=subprocess.DEVNULL,
    )


def _fsync_directory(directory: str) -> None:
    fd = os.open(directory, os.O_RDONLY)
    try:
        try:
            os.fsync(fd)
        except OSError as exc:
            if exc.errno not in (errno.EINVAL, getattr(errno, "ENOTSUP", errno.EINVAL)):
                raise
    finally:
        os.close(fd)


def atomic_write_text(path: str, text: str, *, create_only: bool = False) -> bool:
    """Publish one complete regular file; optionally refuse to replace an existing snapshot."""
    directory = os.path.dirname(os.path.abspath(path))
    os.makedirs(directory, exist_ok=True)
    mode = 0o644
    try:
        mode = stat.S_IMODE(os.stat(path, follow_symlinks=False).st_mode)
    except FileNotFoundError:
        pass
    fd, temporary = tempfile.mkstemp(prefix=f".{os.path.basename(path)}.tmp.", dir=directory)
    try:
        os.fchmod(fd, mode)
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            fd = -1
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        if create_only:
            try:
                os.link(temporary, path)
            except FileExistsError:
                return False
        else:
            os.replace(temporary, path)
            temporary = ""
        _fsync_directory(directory)
        return True
    finally:
        if fd >= 0:
            os.close(fd)
        if temporary:
            try:
                os.unlink(temporary)
            except FileNotFoundError:
                pass


def atomic_write_json(path: str, value: object, *, create_only: bool = False) -> bool:
    return atomic_write_text(
        path,
        json.dumps(value, indent=2, ensure_ascii=False) + "\n",
        create_only=create_only,
    )
