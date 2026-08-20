#!/usr/bin/env python3
"""Append-only byte and canonical-line regressions for memory event history."""
from __future__ import annotations

import copy
import contextlib
import hashlib
import io
import os
import subprocess
import tempfile
from pathlib import Path

from canonical_json import canonical_json
from memory_contract import payload_sha256
from memory_immutability import (
    check_append_transition,
    check_revisions,
    main as immutability_main,
    parse_canonical_file,
)


ROOT = Path(__file__).resolve().parents[1]


def _git(repo: Path, *arguments: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *arguments], cwd=repo, check=check, capture_output=True, text=True,
    )


def _new_repo(path: Path) -> tuple[Path, str]:
    repo = path
    _git(repo, "init", "-q")
    _git(repo, "config", "user.name", "Memory Test")
    _git(repo, "config", "user.email", "memory@example.test")
    (repo / "anchor.txt").write_text("trusted base\n", encoding="utf-8")
    _git(repo, "add", "anchor.txt")
    base_env = {
        **os.environ,
        "GIT_AUTHOR_DATE": "2025-01-01T00:00:00Z",
        "GIT_COMMITTER_DATE": "2025-01-01T00:00:00Z",
    }
    subprocess.run(
        ["git", "commit", "-q", "--no-gpg-sign", "-m", "base"],
        cwd=repo,
        env=base_env,
        check=True,
    )
    return repo, _git(repo, "rev-parse", "HEAD").stdout.strip()


def _commit_all(repo: Path, message: str) -> str:
    _git(repo, "add", "-A")
    _git(repo, "commit", "-q", "--no-gpg-sign", "-m", message)
    return _git(repo, "rev-parse", "HEAD").stdout.strip()


def _event(ordinal: int) -> dict:
    source_sha = hashlib.sha256(f"source-{ordinal}".encode()).hexdigest()
    payload = {"source_sha256": source_sha, "value": ordinal}
    return {
        "schema": "memory-event/v1",
        "event_id": f"evt_10000000-0000-5000-8000-{ordinal:012d}",
        "event_type": "decision.recorded",
        "subject_ids": ["entity:internal:immutability-test"],
        "valid_time": {"from": "2026-01-01", "to": None},
        "system_time": f"2026-01-{ordinal:02d}T00:00:00Z",
        "producer": {
            "kind": "system", "name": "immutability-test", "runtime": "python",
            "model": None, "prompt_program_sha": None,
        },
        "run_id": None,
        "trace_id": None,
        "payload": payload,
        "evidence_refs": [f"evidence:sha256:{source_sha}#record"],
        "derived_from": [],
        "supersedes": [],
        "integrity": {"payload_sha256": payload_sha256(payload), "signature": None},
        "policy": {
            "classification": "internal", "retention": "permanent", "retain_until": None,
        },
    }


def main() -> None:
    first = (canonical_json(_event(1)) + "\n").encode()
    second = (canonical_json(_event(2)) + "\n").encode()
    assert check_append_transition(first, first + second, path="memory/events/test.ndjson") == []
    assert "modified or truncated" in check_append_transition(
        first, second, path="memory/events/test.ndjson",
    )[0]
    assert "complete newline" in check_append_transition(
        first, first + second.rstrip(b"\n"), path="memory/events/test.ndjson",
    )[0]
    noncanonical = (canonical_json(_event(2)).replace(":", ": ", 1) + "\n").encode()
    assert "not canonical" in check_append_transition(
        first, first + noncanonical, path="memory/events/test.ndjson",
    )[0]
    changed = copy.deepcopy(_event(1))
    changed["payload"]["value"] = 99
    assert check_append_transition(
        first, (canonical_json(changed) + "\n").encode(), path="memory/events/test.ndjson",
    )
    assert check_append_transition(
        first, second, path="memory/events/one.json",
    ) == ["memory/events/one.json: immutable JSON event file was modified"]
    events, errors = parse_canonical_file(first + second, path="memory/events/test.ndjson")
    assert len(events) == 2 and errors == []
    protected = copy.deepcopy(_event(3))
    protected["policy"] = {
        "classification": "licensed", "retention": "source-policy", "retain_until": None,
    }
    protected_errors = parse_canonical_file(
        (canonical_json(protected) + "\n").encode(), path="memory/events/protected.ndjson"
    )[1]
    assert any("purgeable object lane" in error for error in protected_errors)
    expiring = copy.deepcopy(_event(4))
    expiring["policy"] = {
        "classification": "internal",
        "retention": "expires",
        "retain_until": "2099-01-01T00:00:00Z",
    }
    expiring_errors = parse_canonical_file(
        (canonical_json(expiring) + "\n").encode(), path="memory/events/expiring.ndjson"
    )[1]
    assert any("purgeable object lane" in error for error in expiring_errors)
    assert parse_canonical_file(b"", path="memory/events/empty.ndjson")[1]
    assert parse_canonical_file(first.rstrip(b"\n"), path="memory/events/test.ndjson")[1]
    assert parse_canonical_file(first, path="memory/events/unsupported.txt")[1]
    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
        assert immutability_main([
            "--repo", str(ROOT), "--base", "HEAD", "--head", "definitely-not-a-revision",
        ]) == 1
    missing_base_stderr = io.StringIO()
    with contextlib.redirect_stderr(missing_base_stderr):
        try:
            immutability_main(["--repo", str(ROOT), "--head", "HEAD"])
        except SystemExit as exc:
            assert exc.code == 2
        else:
            raise AssertionError("--base must be required")
    assert "--base" in missing_base_stderr.getvalue()

    with tempfile.TemporaryDirectory() as temporary:
        repo, base = _new_repo(Path(temporary))
        stream = repo / "memory/events/received.ndjson"
        stream.parent.mkdir(parents=True)
        stream.write_bytes(first)
        _commit_all(repo, "record event after trusted base")
        assert check_revisions(repo.as_posix(), base, "HEAD") == []

    with tempfile.TemporaryDirectory() as temporary:
        repo, base = _new_repo(Path(temporary))
        backdated = _event(1)
        backdated["system_time"] = "2024-12-31T23:59:59.1Z"
        stream = repo / "memory/events/backdated.ndjson"
        stream.parent.mkdir(parents=True)
        stream.write_bytes((canonical_json(backdated) + "\n").encode())
        _commit_all(repo, "attempt backdated intake")
        backdating_errors = check_revisions(repo.as_posix(), base, "HEAD")
        assert any("cannot be backdated" in error for error in backdating_errors)

    # The base and head are both clean: only the complete history reveals that
    # confidential content entered Git and was then deleted before a sanitized
    # event appeared at the same path.
    with tempfile.TemporaryDirectory() as temporary:
        repo, base = _new_repo(Path(temporary))
        stream = repo / "memory/events/history.ndjson"
        stream.parent.mkdir(parents=True)
        confidential = copy.deepcopy(_event(5))
        confidential["policy"]["classification"] = "confidential"
        stream.write_bytes((canonical_json(confidential) + "\n").encode())
        confidential_commit = _commit_all(repo, "add confidential event")
        stream.unlink()
        _commit_all(repo, "delete confidential event")
        stream.write_bytes(first)
        _commit_all(repo, "add sanitized event")
        history_errors = check_revisions(repo.as_posix(), base, "HEAD")
        assert any(confidential_commit in error for error in history_errors)
        assert any("purgeable object lane" in error for error in history_errors)
        assert any("canonical event file was deleted" in error for error in history_errors)

        # CI's explicit empty-tree base remains supported and scans all reachable
        # commits instead of silently reducing the comparison to one diff.
        empty_tree = _git(repo, "hash-object", "-t", "tree", "/dev/null").stdout.strip()
        assert check_revisions(repo.as_posix(), empty_tree, "HEAD")

    # A merge can be unchanged relative to its first parent yet rewrite the
    # second parent's stream. Every in-range merge parent must be inspected.
    with tempfile.TemporaryDirectory() as temporary:
        repo, base = _new_repo(Path(temporary))
        stream = repo / "memory/events/history.ndjson"
        stream.parent.mkdir(parents=True)
        stream.write_bytes(first)
        _commit_all(repo, "add stream")
        branch_point = _git(repo, "rev-parse", "HEAD").stdout.strip()
        default_branch = _git(repo, "branch", "--show-current").stdout.strip()
        _git(repo, "checkout", "-q", "-b", "side")
        stream.write_bytes(first + (canonical_json(_event(3)) + "\n").encode())
        side = _commit_all(repo, "side append")
        _git(repo, "checkout", "-q", default_branch)
        stream.write_bytes(first + second)
        _commit_all(repo, "main append")
        merge = _git(repo, "merge", "--no-ff", "--no-commit", "side", check=False)
        assert merge.returncode != 0
        stream.write_bytes(first + second)
        _git(repo, "add", "memory/events/history.ndjson")
        _git(repo, "commit", "-q", "--no-gpg-sign", "-m", "resolve merge with main")
        merge_commit = _git(repo, "rev-parse", "HEAD").stdout.strip()
        merge_errors = check_revisions(repo.as_posix(), base, merge_commit)
        assert any(
            f"{side}..{merge_commit}" in error and "modified or truncated" in error
            for error in merge_errors
        ), (branch_point, merge_errors)

    # Git object modes are part of the security boundary: neither the canonical
    # root nor an event path may redirect reads through a symlink or gitlink.
    with tempfile.TemporaryDirectory() as temporary:
        repo, base = _new_repo(Path(temporary))
        (repo / "memory").mkdir()
        os.symlink("../redirected-events", repo / "memory/events")
        _commit_all(repo, "symlink canonical root")
        root_mode_errors = check_revisions(repo.as_posix(), base, "HEAD")
        assert any("canonical root must be a 040000 Git directory" in error for error in root_mode_errors)

    with tempfile.TemporaryDirectory() as temporary:
        repo, base = _new_repo(Path(temporary))
        event_root = repo / "memory/events"
        event_root.mkdir(parents=True)
        (repo / "redirected.ndjson").write_bytes(first)
        os.symlink("../../redirected.ndjson", event_root / "linked.ndjson")
        _commit_all(repo, "symlink canonical file")
        file_mode_errors = check_revisions(repo.as_posix(), base, "HEAD")
        assert any("regular 100644 Git blob" in error and "120000" in error for error in file_mode_errors)

    with tempfile.TemporaryDirectory() as temporary:
        repo, base = _new_repo(Path(temporary))
        _git(
            repo, "update-index", "--add", "--cacheinfo",
            f"160000,{base},memory/events/nested-repository",
        )
        _git(repo, "commit", "-q", "--no-gpg-sign", "-m", "gitlink under canonical root")
        gitlink_errors = check_revisions(repo.as_posix(), base, "HEAD")
        assert any("regular 100644 Git blob" in error and "160000" in error for error in gitlink_errors)

    with tempfile.TemporaryDirectory() as temporary:
        repo, base = _new_repo(Path(temporary))
        stream = repo / "memory/events/executable.ndjson"
        stream.parent.mkdir(parents=True)
        stream.write_bytes(first)
        stream.chmod(0o755)
        _commit_all(repo, "executable canonical file")
        executable_errors = check_revisions(repo.as_posix(), base, "HEAD")
        assert any("regular 100644 Git blob" in error and "100755" in error for error in executable_errors)
    print("test_memory_immutability: PASS")


if __name__ == "__main__":
    main()
