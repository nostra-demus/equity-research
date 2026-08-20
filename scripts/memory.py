#!/usr/bin/env python3
"""Vendor-neutral CLI for the repository's canonical permanent-memory foundation.

This first implementation is deliberately read-only with respect to canonical
research artifacts.  It validates events, adapts existing ledgers, builds a
disposable SQLite projection, queries that projection, and proves rebuild
integrity.  Controlled append/write-back is a later phase.
"""
from __future__ import annotations

import argparse
import dataclasses
import datetime as dt
import hashlib
import json
import os
import sqlite3
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Iterable

from canonical_json import canonical_json, canonical_sha256
from memory_adapters import adapt_repository, discover_legacy_sources
from memory_contract import event_sha256, parse_aware_datetime, validate_event
from memory_immutability import parse_canonical_file
from memory_projection import (
    ProjectionError,
    build_projection,
    query_projection_with_metadata,
    verify_projection,
)


CLI_SCHEMA = "memory-cli-report/v1"


def _json_dump(value, *, pretty: bool = True) -> str:
    if pretty:
        return json.dumps(value, indent=2, ensure_ascii=False, sort_keys=True) + "\n"
    return canonical_json(value) + "\n"


def _strict_json_loads(text: str, *, source: str):
    def unique_object(pairs):
        value = {}
        for key, item in pairs:
            if key in value:
                raise ValueError(f"{source}: duplicate JSON object key {key!r}")
            value[key] = item
        return value

    try:
        return json.loads(text, object_pairs_hook=unique_object)
    except json.JSONDecodeError as exc:
        raise ValueError(f"{source}: invalid JSON: {exc}") from exc


def _atomic_write(path: Path, text: str) -> None:
    path = path.resolve()
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.", suffix=".tmp", dir=path.parent
    )
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary_name, path)
        directory_fd = os.open(path.parent, os.O_RDONLY)
        try:
            os.fsync(directory_fd)
        finally:
            os.close(directory_fd)
    finally:
        try:
            os.unlink(temporary_name)
        except FileNotFoundError:
            pass


def _load_events(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    if path.suffix.lower() in {".ndjson", ".jsonl"}:
        events = []
        for number, line in enumerate(text.splitlines(), 1):
            if not line.strip():
                continue
            value = _strict_json_loads(line, source=f"{path}:{number}")
            if not isinstance(value, dict):
                raise ValueError(f"{path}:{number}: event must be an object")
            events.append(value)
        if not events:
            raise ValueError(f"{path}: event stream must contain at least one event")
        return events
    value = _strict_json_loads(text, source=str(path))
    if isinstance(value, list):
        events = value
    elif isinstance(value, dict) and value.get("schema") == "memory-event-bundle/v1":
        if set(value) != {"schema", "events"}:
            raise ValueError(f"{path}: memory-event-bundle/v1 must contain exactly schema and events")
        if not isinstance(value.get("events"), list):
            raise ValueError(f"{path}: memory-event-bundle/v1 events must be an array")
        events = value["events"]
    else:
        events = [value]
    if not events:
        raise ValueError(f"{path}: event input must contain at least one event")
    if not all(isinstance(item, dict) for item in events):
        raise ValueError(f"{path}: every event must be an object")
    return events


def _validate_events(events: Iterable[dict]) -> list[str]:
    materialized = list(events)
    event_index = {
        event.get("event_id"): event
        for event in materialized
        if isinstance(event, dict) and isinstance(event.get("event_id"), str)
    }
    errors: list[str] = []
    if len(event_index) != len(materialized):
        errors.append("event IDs are missing or duplicated")
    for index, event in enumerate(materialized):
        try:
            found = validate_event(event, event_index=event_index)
        except Exception as exc:
            found = [f"validator raised {type(exc).__name__}: {exc}"]
        event_id = event.get("event_id") if isinstance(event, dict) else None
        label = event_id if isinstance(event_id, str) else f"event[{index}]"
        errors.extend(f"{label}: {message}" for message in (found or []))
    return sorted(set(errors))


def _diagnostic_dict(value) -> dict:
    if dataclasses.is_dataclass(value):
        value = dataclasses.asdict(value)
    if isinstance(value, dict):
        out = dict(value)
        out.setdefault("severity", "warning")
        out.setdefault("message", "adapter diagnostic")
        return out
    return {"severity": "warning", "message": str(value)}


def _adapt(root: Path) -> tuple[list[dict], list[dict]]:
    events, diagnostics = adapt_repository(root)
    canonical_events, canonical_diagnostics = _load_canonical_events(root)
    events.extend(canonical_events)
    diagnostics.extend(canonical_diagnostics)
    def clock(event: dict) -> tuple[dt.datetime, str]:
        return parse_aware_datetime(event["system_time"]), event["event_id"]

    ordered = sorted(events, key=clock)
    return ordered, [_diagnostic_dict(item) for item in diagnostics]


def _load_canonical_events(root: Path) -> tuple[list[dict], list[dict]]:
    """Load reviewed Git-lane events without trusting dirty worktree bytes."""
    root = root.resolve()
    canonical_root = root / "memory/events"

    def diagnostic(code: str, message: str, *, path: str = "memory/events") -> dict:
        return {
            "severity": "error", "code": code, "source_path": path,
            "source_locator": "directory" if path == "memory/events" else "file",
            "message": message,
        }

    try:
        top_level = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"], cwd=root, check=False,
            capture_output=True, text=True, timeout=10,
        )
    except (OSError, subprocess.SubprocessError) as exc:
        if not canonical_root.exists() and not canonical_root.is_symlink():
            return [], []
        return [], [diagnostic("canonical_git_error", str(exc))]
    repository_is_git = (
        top_level.returncode == 0
        and top_level.stdout.strip()
        and Path(top_level.stdout.strip()).resolve() == root
    )
    if not repository_is_git:
        if not canonical_root.exists() and not canonical_root.is_symlink():
            return [], []
        return [], [diagnostic(
            "canonical_git_error",
            "canonical events require the supplied root to be the Git repository top level",
        )]

    try:
        status = subprocess.run(
            [
                "git", "status", "--porcelain=v1", "-z", "--untracked-files=all",
                "--", "memory/events",
            ],
            cwd=root, check=False, capture_output=True, timeout=10,
        )
        tracked = subprocess.run(
            ["git", "ls-files", "--stage", "-z", "--", "memory/events"],
            cwd=root, check=False, capture_output=True, timeout=10,
        )
    except (OSError, subprocess.SubprocessError) as exc:
        return [], [diagnostic("canonical_git_error", str(exc))]
    if status.returncode != 0 or tracked.returncode != 0:
        stderr = b"\n".join((status.stderr, tracked.stderr)).decode(
            "utf-8", errors="replace"
        ).strip()
        return [], [diagnostic(
            "canonical_git_error", stderr or "Git could not inspect canonical event paths",
        )]
    if status.stdout:
        return [], [diagnostic(
            "uncommitted_canonical_event",
            "memory/events contains modified, deleted, staged, or untracked paths; "
            "canonical projection requires the complete clean tracked collection",
        )]

    tracked_modes: dict[str, str] = {}
    try:
        for raw_entry in tracked.stdout.split(b"\0"):
            if not raw_entry:
                continue
            metadata, raw_path = raw_entry.split(b"\t", 1)
            mode, _object_id, stage = metadata.decode("ascii").split(" ", 2)
            relative = raw_path.decode("utf-8")
            if stage != "0":
                return [], [diagnostic(
                    "uncommitted_canonical_event",
                    f"canonical event index entry is unmerged at stage {stage}", path=relative,
                )]
            tracked_modes[relative] = mode
    except (UnicodeDecodeError, ValueError) as exc:
        return [], [diagnostic(
            "canonical_git_error", f"could not parse canonical Git index entries: {exc}",
        )]

    mode_diagnostics = [
        diagnostic(
            "invalid_canonical_mode",
            f"canonical event paths must be regular 100644 Git blobs, not mode {mode}",
            path=relative,
        )
        for relative, mode in sorted(tracked_modes.items())
        if mode != "100644"
    ]
    if mode_diagnostics:
        return [], mode_diagnostics

    if not canonical_root.exists() and not canonical_root.is_symlink():
        if tracked_modes:
            return [], [diagnostic(
                "uncommitted_canonical_event",
                "tracked canonical event paths are missing from the worktree",
            )]
        return [], []
    if canonical_root.is_symlink() or not canonical_root.is_dir():
        return [], [diagnostic(
            "invalid_canonical_root",
            "memory/events must be a real directory, not a symlink or non-directory",
        )]

    events: list[dict] = []
    diagnostics: list[dict] = []
    seen: set[str] = set()
    for path in sorted(canonical_root.rglob("*")):
        relative = path.relative_to(root).as_posix()
        if path.is_symlink() or not path.is_file():
            if path.is_symlink():
                diagnostics.append(diagnostic(
                    "invalid_canonical_mode",
                    "canonical event paths must be regular files, not symlinks",
                    path=relative,
                ))
            continue
        if relative not in tracked_modes:
            diagnostics.append(diagnostic(
                "uncommitted_canonical_event",
                "canonical event bytes must be tracked and clean before projection",
                path=relative,
            ))
            continue
        seen.add(relative)
        try:
            blob = subprocess.run(
                ["git", "show", f"HEAD:{relative}"], cwd=root, check=False,
                capture_output=True, timeout=10,
            )
        except (OSError, subprocess.SubprocessError) as exc:
            diagnostics.append(diagnostic("canonical_read_error", str(exc), path=relative))
            continue
        if blob.returncode != 0:
            diagnostics.append(diagnostic(
                "canonical_read_error",
                blob.stderr.decode("utf-8", errors="replace").strip()
                or "could not read the committed canonical Git blob",
                path=relative,
            ))
            continue
        parsed, errors = parse_canonical_file(blob.stdout, path=relative)
        events.extend(parsed)
        diagnostics.extend({
            "severity": "error", "code": "invalid_canonical_event",
            "source_path": relative, "source_locator": "file", "message": error,
        } for error in errors)
    for relative in sorted(set(tracked_modes) - seen):
        diagnostics.append(diagnostic(
            "uncommitted_canonical_event",
            "tracked canonical event path is missing or is not a regular worktree file",
            path=relative,
        ))
    return events, diagnostics


def _repository_preflight_errors(root: Path, *, legacy_event_count: int | None = None) -> list[str]:
    """Refuse wrong-root and unexpected corpus-shrink projections.

    The projection is repository-specific even though its event contract is vendor
    neutral. A healthy empty database from the wrong directory is more dangerous
    than an explicit failure, so the reviewed Phase 0 baseline is a required sentinel.
    """
    baseline_path = root / "frameworks/memory/phase0/adapter-baseline.json"
    try:
        baseline = json.loads(baseline_path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return [f"repository sentinel is missing: {baseline_path}"]
    except (OSError, json.JSONDecodeError) as exc:
        return [f"repository sentinel is unreadable: {baseline_path}: {exc}"]
    if not isinstance(baseline, dict) or baseline.get("schema") != "memory-adapter-baseline/v1":
        return [f"repository sentinel has an unsupported schema: {baseline_path}"]
    minimum_sources = baseline.get("minimum_discovered_source_count")
    minimum_events = baseline.get("minimum_adapted_event_count")
    if not isinstance(minimum_sources, int) or minimum_sources < 1:
        return ["adapter baseline minimum_discovered_source_count must be a positive integer"]
    if not isinstance(minimum_events, int) or minimum_events < 1:
        return ["adapter baseline minimum_adapted_event_count must be a positive integer"]
    errors: list[str] = []
    source_count = len(discover_legacy_sources(root))
    if source_count < minimum_sources:
        errors.append(
            f"supported source corpus shrank from reviewed minimum {minimum_sources} to {source_count}"
        )
    if legacy_event_count is not None and legacy_event_count < minimum_events:
        errors.append(
            f"adapted legacy event corpus shrank from reviewed minimum {minimum_events} "
            f"to {legacy_event_count}"
        )
    return errors


def _legacy_event_count(events: Iterable[dict]) -> int:
    return sum(
        1
        for event in events
        if isinstance(event.get("producer"), dict)
        and event["producer"].get("name") == "legacy-memory-adapter"
    )


def _source_integrity_errors(root: Path, events: Iterable[dict]) -> list[str]:
    root = root.resolve()
    errors: list[str] = []
    checked: set[tuple[str, str, str]] = set()
    for event in events:
        payload = event.get("payload")
        if not isinstance(payload, dict):
            continue
        source_path = payload.get("source_path")
        source_sha = payload.get("source_sha256")
        source_locator = payload.get("source_locator")
        if not isinstance(source_path, str) or not isinstance(source_sha, str):
            continue
        expected = source_sha.removeprefix("sha256:")
        locator = source_locator if isinstance(source_locator, str) else "json"
        key = source_path, locator, expected
        if key in checked:
            continue
        checked.add(key)
        candidate = (root / source_path).resolve()
        try:
            candidate.relative_to(root)
        except ValueError:
            errors.append(f"{source_path}: source path escapes repository root")
            continue
        try:
            source_bytes = candidate.read_bytes()
        except OSError as exc:
            errors.append(f"{source_path}: source bytes unavailable: {exc}")
            continue
        if locator.startswith("line-"):
            try:
                line_number = int(locator.removeprefix("line-"))
            except ValueError:
                errors.append(f"{source_path}: invalid source locator {locator!r}")
                continue
            lines = source_bytes.splitlines()
            if not 1 <= line_number <= len(lines):
                errors.append(f"{source_path}: source locator {locator!r} is out of range")
                continue
            exact_bytes = lines[line_number - 1]
        elif locator == "json":
            exact_bytes = source_bytes
        else:
            errors.append(f"{source_path}: unsupported source locator {locator!r}")
            continue
        actual = hashlib.sha256(exact_bytes).hexdigest()
        if actual != expected:
            errors.append(f"{source_path}#{locator}: expected sha256 {expected}, found {actual}")
    return sorted(errors)


def command_validate(args: argparse.Namespace) -> int:
    events = _load_events(Path(args.path))
    errors = _validate_events(events)
    report = {
        "schema": CLI_SCHEMA,
        "command": "validate",
        "ok": not errors,
        "event_count": len(events),
        "errors": errors,
    }
    sys.stdout.write(_json_dump(report))
    return 0 if report["ok"] else 1


def command_adapt(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    preflight = _repository_preflight_errors(root)
    if preflight:
        sys.stdout.write(_json_dump({
            "schema": CLI_SCHEMA, "command": "adapt", "ok": False,
            "event_count": 0, "errors": preflight, "diagnostics": [],
        }))
        return 1
    events, diagnostics = _adapt(root)
    errors = _repository_preflight_errors(root, legacy_event_count=_legacy_event_count(events))
    errors.extend(_validate_events(events))
    errors.extend(_source_integrity_errors(root, events))
    errors.extend(
        item.get("message", "adapter error")
        for item in diagnostics
        if item.get("severity") == "error"
    )
    if errors:
        sys.stdout.write(_json_dump({
            "schema": CLI_SCHEMA,
            "command": "adapt",
            "ok": False,
            "event_count": len(events),
            "errors": sorted(set(errors)),
            "diagnostics": diagnostics,
        }))
        return 1
    if args.format == "ndjson":
        output = "".join(canonical_json(event) + "\n" for event in events)
    else:
        output = _json_dump({"schema": "memory-event-bundle/v1", "events": events})
    if args.output:
        _atomic_write(Path(args.output), output)
    else:
        sys.stdout.write(output)
    if diagnostics:
        sys.stderr.write(_json_dump({"schema": CLI_SCHEMA, "diagnostics": diagnostics}))
    return 1 if any(item.get("severity") == "error" for item in diagnostics) else 0


def command_project(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    preflight = _repository_preflight_errors(root)
    if preflight:
        sys.stdout.write(_json_dump({
            "schema": CLI_SCHEMA, "command": "project", "ok": False,
            "event_count": 0, "errors": preflight, "diagnostics": [],
        }))
        return 1
    events, diagnostics = _adapt(root)
    errors = _repository_preflight_errors(root, legacy_event_count=_legacy_event_count(events))
    errors.extend(_validate_events(events))
    errors.extend(
        item.get("message", "adapter error")
        for item in diagnostics
        if item.get("severity") == "error"
    )
    errors.extend(_source_integrity_errors(root, events))
    if errors:
        sys.stdout.write(_json_dump({
            "schema": CLI_SCHEMA, "command": "project", "ok": False,
            "event_count": len(events), "errors": sorted(set(errors)),
            "diagnostics": diagnostics,
        }))
        return 1
    result = build_projection(events, args.database)
    verified = verify_projection(args.database)
    report = {
        "schema": CLI_SCHEMA,
        "command": "project",
        "ok": result == verified,
        "projection": dataclasses.asdict(verified),
        "diagnostics": diagnostics,
    }
    sys.stdout.write(_json_dump(report))
    return 0 if report["ok"] else 1


def command_doctor(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    errors: list[str] = _repository_preflight_errors(root)
    if errors:
        sys.stdout.write(_json_dump({
            "schema": CLI_SCHEMA,
            "command": "doctor",
            "ok": False,
            "root": str(root),
            "event_count": 0,
            "event_types": {},
            "projection": None,
            "diagnostics": [],
            "errors": errors,
        }))
        return 1
    events, diagnostics = _adapt(root)
    errors.extend(
        _repository_preflight_errors(root, legacy_event_count=_legacy_event_count(events))
    )
    errors.extend(_validate_events(events))
    errors.extend(_source_integrity_errors(root, events))
    errors.extend(
        item.get("message", "adapter error")
        for item in diagnostics
        if item.get("severity") == "error"
    )

    # Read the same repository twice: adapters must be deterministic before the
    # serving projection can make a reproducibility claim.
    second_events, second_diagnostics = _adapt(root)
    first_hashes = [event_sha256(event) for event in events]
    second_hashes = [event_sha256(event) for event in second_events]
    if first_hashes != second_hashes:
        errors.append("legacy adaptation is not deterministic across identical reads")
    if diagnostics != second_diagnostics:
        errors.append("adapter diagnostics are not deterministic across identical reads")

    projection = None
    with tempfile.TemporaryDirectory(prefix="memory-doctor-") as temp:
        first_path = Path(temp) / "first.sqlite"
        second_path = Path(temp) / "second.sqlite"
        try:
            first = build_projection(events, first_path)
            second = build_projection(second_events, second_path)
            verify_projection(first_path)
            verify_projection(second_path)
            if first.digest != second.digest:
                errors.append("clean projection rebuild changed the logical digest")
            projection = dataclasses.asdict(first)
            projection.pop("path", None)
        except (ProjectionError, OSError, sqlite3.Error) as exc:
            errors.append(f"projection verification failed: {exc}")

    errors = sorted(set(errors))
    report = {
        "schema": CLI_SCHEMA,
        "command": "doctor",
        "ok": not errors,
        "root": str(root),
        "event_count": len(events),
        "event_types": {
            kind: sum(1 for event in events if event.get("event_type") == kind)
            for kind in sorted({event.get("event_type") for event in events if event.get("event_type")})
        },
        "projection": projection,
        "diagnostics": diagnostics,
        "errors": errors,
    }
    sys.stdout.write(_json_dump(report))
    return 0 if report["ok"] else 1


def command_query(args: argparse.Namespace) -> int:
    classifications = args.classification or ["public"]
    rows, _projection, effective = query_projection_with_metadata(
        args.database,
        subject_ids=args.subject,
        event_types=args.event_type,
        classifications=classifications,
        as_of=args.as_of,
        valid_at=args.valid_at,
        text=args.text,
        current_only=not args.include_superseded,
        limit=args.limit,
        expected_digest=args.expected_digest,
    )
    query = {
        "requested": {
            "subject_ids": args.subject,
            "event_types": args.event_type,
            "classifications": classifications,
            "as_of": args.as_of,
            "valid_at": args.valid_at,
            "text": args.text,
            "current_only": not args.include_superseded,
            "limit": args.limit,
        },
        "effective": effective,
    }
    packet = {
        "schema": "memory-query-result/v1",
        "query": query,
        "trusted_projection_digest_matched": True,
        "event_count": len(rows),
        "events": rows,
    }
    packet["result_sha256"] = canonical_sha256(packet)
    sys.stdout.write(_json_dump(packet))
    return 0


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(prog="memory", description=__doc__)
    sub = root.add_subparsers(dest="command", required=True)

    validate = sub.add_parser("validate", help="validate one event, bundle, JSONL, or NDJSON file")
    validate.add_argument("path")
    validate.set_defaults(handler=command_validate)

    adapt = sub.add_parser("adapt", help="map legacy repository artifacts without changing them")
    adapt.add_argument("--root", default=".")
    adapt.add_argument("--output")
    adapt.add_argument("--format", choices=("ndjson", "json"), default="ndjson")
    adapt.set_defaults(handler=command_adapt)

    project = sub.add_parser("project", help="atomically rebuild a disposable SQLite projection")
    project.add_argument("--root", default=".")
    project.add_argument("--database", required=True)
    project.set_defaults(handler=command_project)

    doctor = sub.add_parser("doctor", help="verify sources, contracts, adapters, and two clean rebuilds")
    doctor.add_argument("--root", default=".")
    doctor.set_defaults(handler=command_doctor)

    query = sub.add_parser("query", help="query a verified projection with bitemporal and policy filters")
    query.add_argument("--database", required=True)
    query.add_argument(
        "--expected-digest",
        required=True,
        help="trusted digest emitted by project/doctor and stored outside the SQLite file",
    )
    query.add_argument("--subject", action="append", default=[])
    query.add_argument("--event-type", action="append", default=[])
    query.add_argument("--classification", action="append", default=[])
    query.add_argument("--as-of")
    query.add_argument("--valid-at")
    query.add_argument("--text")
    query.add_argument("--include-superseded", action="store_true")
    query.add_argument("--limit", type=int, default=50)
    query.set_defaults(handler=command_query)
    return root


def main(argv: list[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try:
        return int(args.handler(args))
    except (OSError, ValueError, ProjectionError, sqlite3.Error) as exc:
        sys.stderr.write(f"memory: {exc}\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
