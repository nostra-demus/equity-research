#!/usr/bin/env python3
"""Enforce append-only canonical event history between two Git revisions.

Canonical compact events live below ``memory/events/``.  A JSON event file is
first-writer-wins; an NDJSON/JSONL stream may only gain complete canonical lines.
Deletion, rename, truncation, or modification of existing bytes fails closed.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import subprocess
import sys
from pathlib import PurePosixPath

from canonical_json import canonical_json
from memory_contract import parse_aware_datetime, validate_event, validate_events


CANONICAL_ROOT = "memory/events"
APPEND_SUFFIXES = {".ndjson", ".jsonl"}
IMMUTABLE_SUFFIXES = {".json"}
GIT_LANE_CLASSIFICATIONS = {"public", "internal"}


def _git(repo: str, *args: str, text: bool = False):
    result = subprocess.run(
        ["git", *args], cwd=repo, check=False, capture_output=True, text=text,
    )
    if result.returncode != 0:
        stderr = result.stderr if text else result.stderr.decode("utf-8", errors="replace")
        raise ValueError(f"git {' '.join(args)} failed: {stderr.strip()}")
    return result.stdout


def _blob(repo: str, revision: str, path: str) -> bytes:
    return _git(repo, "show", f"{revision}:{path}")


def _commit_clock(repo: str, revision: str) -> dt.datetime | None:
    if _git(repo, "cat-file", "-t", revision, text=True).strip() != "commit":
        return None
    value = _git(repo, "show", "-s", "--format=%cI", revision, text=True).strip()
    try:
        parsed = parse_aware_datetime(value)
    except ValueError as exc:
        raise ValueError(f"commit {revision} has an invalid committer clock {value!r}") from exc
    return parsed


def _appended_time_errors(
    old: bytes,
    new: bytes,
    *,
    path: str,
    parent_clock: dt.datetime | None,
    child_clock: dt.datetime,
) -> list[str]:
    """Bind new event clocks to the Git transition that first records them."""
    suffix = PurePosixPath(path).suffix.lower()
    if suffix in IMMUTABLE_SUFFIXES:
        appended_lines = [new[:-1]] if not old and new.endswith(b"\n") else []
        first_line = 1
    elif suffix in APPEND_SUFFIXES and new.startswith(old):
        appended = new[len(old):]
        appended_lines = appended.splitlines() if appended.endswith(b"\n") else []
        first_line = old.count(b"\n") + 1
    else:
        return []
    errors: list[str] = []
    if parent_clock is not None and child_clock < parent_clock:
        errors.append(f"{path}: child commit clock precedes its parent commit clock")
    for offset, raw in enumerate(appended_lines):
        try:
            event = json.loads(raw.decode("utf-8"))
            value = event.get("system_time") if isinstance(event, dict) else None
            event_clock = parse_aware_datetime(value)
        except (AttributeError, UnicodeDecodeError, ValueError, json.JSONDecodeError):
            # Structural validation emits the actionable error for malformed rows.
            continue
        line_number = first_line + offset
        if parent_clock is not None and event_clock < parent_clock:
            errors.append(
                f"{path}:{line_number}: system_time predates the parent commit; "
                "new canonical events cannot be backdated"
            )
        if event_clock > child_clock:
            errors.append(
                f"{path}:{line_number}: system_time is later than the recording commit clock"
            )
    return errors


def _tree_entries(repo: str, revision: str, *, recursive: bool) -> list[tuple[str, str, str]]:
    """Return ``(mode, type, path)`` entries without trusting quoted Git paths."""
    arguments = ["ls-tree"]
    if recursive:
        arguments.extend(["-r", "-t"])
    arguments.extend(["-z", revision, "--", CANONICAL_ROOT])
    entries: list[tuple[str, str, str]] = []
    for record in _git(repo, *arguments).split(b"\0"):
        if not record:
            continue
        try:
            metadata, raw_path = record.split(b"\t", 1)
            mode, object_type, _object_id = metadata.decode("ascii").split(" ", 2)
            path = raw_path.decode("utf-8")
        except (UnicodeDecodeError, ValueError) as exc:
            raise ValueError(
                f"could not parse UTF-8 Git tree entry at {revision}: {exc}"
            ) from exc
        entries.append((mode, object_type, path))
    return entries


def _validate_canonical_line(raw: bytes, *, path: str, line_number: int) -> list[str]:
    errors: list[str] = []
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        return [f"{path}:{line_number}: event line is not UTF-8: {exc}"]
    try:
        event = json.loads(text)
    except json.JSONDecodeError as exc:
        return [f"{path}:{line_number}: invalid JSON: {exc}"]
    if not isinstance(event, dict):
        return [f"{path}:{line_number}: event must be an object"]
    if canonical_json(event) != text:
        errors.append(f"{path}:{line_number}: event is not canonical single-line JSON")
    errors.extend(f"{path}:{line_number}: {message}" for message in validate_event(event))
    policy = event.get("policy")
    if isinstance(policy, dict):
        classification = policy.get("classification")
        retention = policy.get("retention")
        if classification not in GIT_LANE_CLASSIFICATIONS or retention != "permanent":
            errors.append(
                f"{path}:{line_number}: immutable Git lane accepts only public/internal "
                "permanent events; protected or expiring content requires the purgeable object lane"
            )
    return errors


def check_append_transition(old: bytes, new: bytes, *, path: str) -> list[str]:
    """Validate one byte transition; public for the regression test."""
    suffix = PurePosixPath(path).suffix.lower()
    if suffix in IMMUTABLE_SUFFIXES:
        return [] if old == new else [f"{path}: immutable JSON event file was modified"]
    if suffix not in APPEND_SUFFIXES:
        return [f"{path}: unsupported canonical event extension {suffix!r}"]
    if not new.startswith(old):
        return [f"{path}: existing event bytes were modified or truncated"]
    if old and not old.endswith(b"\n"):
        return [f"{path}: prior event stream lacks a terminating newline; append is unsafe"]
    appended = new[len(old):]
    if not appended:
        return []
    if not appended.endswith(b"\n"):
        return [f"{path}: appended event stream must end with a complete newline"]
    errors: list[str] = []
    first_line = old.count(b"\n") + 1
    for offset, raw in enumerate(appended.splitlines(), start=0):
        if not raw:
            errors.append(f"{path}:{first_line + offset}: blank canonical event line")
            continue
        errors.extend(_validate_canonical_line(
            raw, path=path, line_number=first_line + offset,
        ))
    return errors


def parse_canonical_file(raw: bytes, *, path: str) -> tuple[list[dict], list[str]]:
    """Parse and validate every event in one canonical file revision."""
    suffix = PurePosixPath(path).suffix.lower()
    if suffix not in APPEND_SUFFIXES | IMMUTABLE_SUFFIXES:
        return [], [f"{path}: unsupported canonical event extension {suffix!r}"]
    if not raw:
        return [], [f"{path}: canonical event file is empty"]

    if suffix in IMMUTABLE_SUFFIXES:
        if not raw.endswith(b"\n"):
            return [], [f"{path}: canonical JSON event file must end with a newline"]
        lines = [raw[:-1]]
    else:
        if not raw.endswith(b"\n"):
            return [], [f"{path}: canonical event stream must end with a complete newline"]
        lines = raw.splitlines()

    events: list[dict] = []
    errors: list[str] = []
    for line_number, line in enumerate(lines, 1):
        if not line:
            errors.append(f"{path}:{line_number}: blank canonical event line")
            continue
        line_errors = _validate_canonical_line(line, path=path, line_number=line_number)
        errors.extend(line_errors)
        if line_errors:
            continue
        # The validator above proved UTF-8, JSON object shape, and canonical form.
        events.append(json.loads(line.decode("utf-8")))
    return events, errors


def _validate_collection(repo: str, revision: str) -> list[str]:
    """Validate the complete canonical collection and every Git tree mode."""
    events: list[dict] = []
    errors: list[str] = []

    root_entries = _tree_entries(repo, revision, recursive=False)
    root_entry = next((entry for entry in root_entries if entry[2] == CANONICAL_ROOT), None)
    if root_entry is None:
        # An empty canonical collection is valid. Git cannot represent an empty
        # directory, so absence is the only possible empty state.
        errors.extend(validate_events([]))
        return errors
    root_mode, root_type, _root_path = root_entry
    if (root_mode, root_type) != ("040000", "tree"):
        return [
            f"{CANONICAL_ROOT}: canonical root must be a 040000 Git directory, "
            f"not {root_mode} {root_type}"
        ]

    paths: list[str] = []
    for mode, object_type, path in _tree_entries(repo, revision, recursive=True):
        if path == CANONICAL_ROOT or object_type == "tree":
            if object_type == "tree" and mode != "040000":
                errors.append(f"{path}: canonical directory has invalid Git mode {mode}")
            continue
        if (mode, object_type) != ("100644", "blob"):
            errors.append(
                f"{path}: canonical file must be a regular 100644 Git blob, "
                f"not {mode} {object_type}"
            )
            continue
        paths.append(path)

    for path in sorted(paths):
        parsed, file_errors = parse_canonical_file(_blob(repo, revision, path), path=path)
        events.extend(parsed)
        errors.extend(file_errors)
    errors.extend(validate_events(events))
    return errors


def _check_transition(repo: str, old_revision: str, new_revision: str) -> list[str]:
    """Check one parent-to-child transition in the reachable commit graph."""
    output = _git(
        repo, "diff", "--name-status", "-z", "--no-renames", old_revision, new_revision,
        "--", CANONICAL_ROOT,
    )
    errors: list[str] = []
    parent_clock = _commit_clock(repo, old_revision)
    child_clock = _commit_clock(repo, new_revision)
    if child_clock is None:
        raise ValueError(f"transition child {new_revision} is not a commit")
    fields = output.split(b"\0")
    if fields and fields[-1] == b"":
        fields.pop()
    if len(fields) % 2:
        raise ValueError(
            f"could not parse Git transition {old_revision}..{new_revision}: odd field count"
        )
    for offset in range(0, len(fields), 2):
        try:
            status = fields[offset].decode("ascii")
            path = fields[offset + 1].decode("utf-8")
        except UnicodeDecodeError as exc:
            raise ValueError(
                f"could not parse UTF-8 Git transition {old_revision}..{new_revision}: {exc}"
            ) from exc
        if status == "D":
            errors.append(f"{path}: canonical event file was deleted")
            continue
        if status == "A":
            new = _blob(repo, new_revision, path)
            suffix = PurePosixPath(path).suffix.lower()
            if suffix in APPEND_SUFFIXES:
                errors.extend(check_append_transition(b"", new, path=path))
            elif suffix in IMMUTABLE_SUFFIXES:
                if not new.endswith(b"\n"):
                    errors.append(f"{path}: canonical JSON event file must end with a newline")
                else:
                    errors.extend(_validate_canonical_line(new[:-1], path=path, line_number=1))
            else:
                errors.append(f"{path}: unsupported canonical event extension {suffix!r}")
            errors.extend(_appended_time_errors(
                b"", new, path=path, parent_clock=parent_clock, child_clock=child_clock,
            ))
            continue
        if status == "M":
            old = _blob(repo, old_revision, path)
            new = _blob(repo, new_revision, path)
            errors.extend(check_append_transition(old, new, path=path))
            errors.extend(_appended_time_errors(
                old, new, path=path, parent_clock=parent_clock, child_clock=child_clock,
            ))
            continue
        errors.append(f"{path}: unsupported Git transition {status!r}")
    return errors


def _reachable_commits(repo: str, base: str, head: str) -> tuple[list[str], dict[str, list[str]]]:
    """Resolve all commits to inspect and their parents.

    A commit base limits the walk to ``base..head`` and must be an ancestor of
    head.  The empty-tree object used by CI for a branch-creation push walks the
    complete history and acts as the synthetic parent of root commits.
    """
    head_id = _git(repo, "rev-parse", "--verify", f"{head}^{{commit}}", text=True).strip()
    base_type = _git(repo, "cat-file", "-t", base, text=True).strip()
    if base_type == "commit":
        base_id = _git(repo, "rev-parse", "--verify", f"{base}^{{commit}}", text=True).strip()
        try:
            _git(repo, "merge-base", "--is-ancestor", base_id, head_id)
        except ValueError as exc:
            raise ValueError(f"trusted base {base_id} is not an ancestor of {head_id}") from exc
        range_spec = f"{base_id}..{head_id}"
    elif base_type == "tree":
        if _git(repo, "ls-tree", "-r", "--name-only", base, text=True).strip():
            raise ValueError("a tree base is allowed only when it is the empty tree")
        base_id = base
        range_spec = head_id
    else:
        raise ValueError(f"trusted base must resolve to a commit or the empty tree, not {base_type}")

    output = _git(
        repo, "rev-list", "--reverse", "--topo-order", "--parents", range_spec, text=True,
    )
    commits: list[str] = []
    parents: dict[str, list[str]] = {}
    for line in output.splitlines():
        fields = line.split()
        if not fields:
            continue
        commits.append(fields[0])
        parents[fields[0]] = fields[1:]
    return commits, parents


def check_revisions(repo: str, base: str, head: str) -> list[str]:
    commits, parents = _reachable_commits(repo, base, head)
    base_type = _git(repo, "cat-file", "-t", base, text=True).strip()
    base_id = (
        _git(repo, "rev-parse", "--verify", f"{base}^{{commit}}", text=True).strip()
        if base_type == "commit"
        else base
    )
    in_range = set(commits)
    errors: list[str] = []

    for commit in commits:
        commit_parents = parents[commit]
        eligible_parents = [
            parent for parent in commit_parents if parent == base_id or parent in in_range
        ]
        if not commit_parents and base_type == "tree":
            eligible_parents = [base_id]
        for parent in eligible_parents:
            errors.extend(
                f"{parent}..{commit}: {message}"
                for message in _check_transition(repo, parent, commit)
            )
        errors.extend(
            f"{commit}: {message}" for message in _validate_collection(repo, commit)
        )

    # A no-op comparison still validates the selected head's complete tree.
    if not commits:
        head_id = _git(repo, "rev-parse", "--verify", f"{head}^{{commit}}", text=True).strip()
        errors.extend(f"{head_id}: {message}" for message in _validate_collection(repo, head_id))
    return sorted(set(errors))


def parser() -> argparse.ArgumentParser:
    value = argparse.ArgumentParser(description=__doc__)
    value.add_argument("--repo", default=".")
    value.add_argument(
        "--base", required=True,
        help="trusted ancestor commit (or CI's explicit empty-tree object)",
    )
    value.add_argument("--head", default="HEAD")
    return value


def main(argv: list[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try:
        _git(args.repo, "rev-parse", "--verify", f"{args.head}^{{commit}}", text=True)
        errors = check_revisions(args.repo, args.base, args.head)
    except ValueError as exc:
        print(f"memory immutability: {exc}", file=sys.stderr)
        return 1
    if errors:
        print("memory immutability: FAIL", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"memory immutability: PASS ({args.base}..{args.head})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
