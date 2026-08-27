#!/usr/bin/env python3
"""Lossless, read-only adapters from committed legacy memory into memory-event/v1.

The legacy artifacts remain authoritative and are never rewritten.  Each adapted event
contains the complete parsed record under ``payload.record`` plus an exact repository-
relative source path, locator, and SHA-256 digest.  Event and run identifiers are UUIDv5
values so the same bytes at the same source coordinate always produce the same envelope.

Public API
----------
``discover_legacy_sources(repo_root)``
    Return supported source paths in deterministic repository-relative order.
``adapt_source(repo_root, source_path)``
    Adapt one supported JSON or NDJSON source and return ``(events, diagnostics)``.
``adapt_repository(repo_root)``
    Adapt every supported source, resolve cross-file correction links, and return
    ``(events, diagnostics)``.  The function performs reads only.

Supported sources
-----------------
* ``analyses/*/decision_record.json`` and ``analyses/*/reviews/*_decision_review.json``
* ``analyses/*/corrections.json`` and ``analyses/performance/*_calibration_summary.json``
* ``commodity/runs/*/decision_record.json`` and ``signal_evidence.json``
* screener event, thesis, idea (history/current/archive), checkpoint, conviction-event,
  and conviction-state ledgers

Malformed, time-less, or identity-less records are not guessed into an envelope.  They
are returned as structured diagnostics while other records continue to adapt.
"""
from __future__ import annotations

import copy
import datetime as dt
import hashlib
import json
import re
import subprocess
import uuid
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path, PurePosixPath
from typing import Any, Callable, Iterable, Sequence

from canonical_json import canonical_json_bytes, canonical_sha256
from memory_contract import parse_aware_datetime


EVENT_NAMESPACE = uuid.UUID("730d1f0f-f02e-5d3f-8aa1-20155d64d42f")
RUN_NAMESPACE = uuid.UUID("34791a3c-b8dc-51fb-aef5-cf1b0b183fe2")
SUBJECT_NAMESPACE = uuid.UUID("bcfa556d-1823-5793-8d33-bd24c14d3ff4")
ADAPTER_NAME = "legacy-memory-adapter"
ADAPTER_RUNTIME = "python"
POLICY = {
    "classification": "internal",
    "retention": "permanent",
    "retain_until": None,
}
GIT_ARGUMENT_BATCH_SIZE = 100

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

Diagnostic = dict[str, Any]
Event = dict[str, Any]


@dataclass(frozen=True)
class SourceSpec:
    """Static mapping rules for one legacy source family."""

    record_kind: str
    event_type: str
    format: str
    system_fields: tuple[str, ...]
    valid_fields: tuple[str, ...]
    subjects: Callable[[dict[str, Any], str], list[str]]
    run_root: Callable[[dict[str, Any], str], str | None]
    legacy_schema: Callable[[dict[str, Any]], str]
    supersession_key: Callable[[dict[str, Any]], str | None] | None = None
    allow_git_time: bool = False
    prefer_git_time_for_date: bool = False
    latest_system: bool = False


@dataclass(frozen=True)
class GitMetadataSnapshot:
    """One immutable Git receipt view shared by a repository adaptation.

    The original adapter resolved cleanliness, current-file commits, and commit clocks one
    source at a time.  That was exact but made a 751-event production projection spawn hundreds
    of identical Git processes.  This snapshot keeps the same path/line receipts while resolving
    repository-wide facts once, before any source is adapted.
    """

    repository_is_git: bool
    clean_paths: frozenset[str]
    json_receipts: dict[str, tuple[str, str, str]]
    line_commits: dict[str, dict[int, str]]
    commit_times: dict[str, str]

    def recorded_metadata(
        self,
        relative_path: str,
        source_locator: str,
    ) -> tuple[str, str, str] | None:
        if not self.repository_is_git or relative_path not in self.clean_paths:
            return None
        line_match = re.fullmatch(r"line-(\d+)", source_locator)
        if not line_match:
            return self.json_receipts.get(relative_path)
        line_number = int(line_match.group(1))
        commit = self.line_commits.get(relative_path, {}).get(line_number)
        timestamp = self.commit_times.get(commit or "")
        if not commit or timestamp is None:
            return None
        # All rows introduced by one commit become durable atomically.  Preserve their explicit
        # NDJSON append order at microsecond precision, exactly as the one-source resolver does.
        timestamp_value = _system_datetime(timestamp) + dt.timedelta(microseconds=line_number)
        return (
            timestamp_value.isoformat(timespec="microseconds").replace("+00:00", "Z"),
            commit,
            "git-commit+ndjson-line-order/v1",
        )


def payload_sha256(payload: dict[str, Any]) -> str:
    """Backward-compatible adapter alias for the shared canonical hash contract."""

    return canonical_sha256(payload)


def _sha256(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def _event_id(stable_key: str) -> str:
    return f"evt_{uuid.uuid5(EVENT_NAMESPACE, stable_key)}"


def _run_id(run_root: str | None) -> str | None:
    if not run_root:
        return None
    normalized = PurePosixPath(run_root).as_posix().rstrip("/")
    return f"run_{uuid.uuid5(RUN_NAMESPACE, normalized)}"


def _identifier_value(value: Any) -> str | None:
    """Preserve a producer-issued ID exactly; reject values unsafe in subject refs."""

    if not isinstance(value, str) or not value or value != value.strip():
        return None
    if "#" in value or any(char.isspace() for char in value):
        return None
    return value


def _alias_value(value: Any) -> str | None:
    return value.strip() if isinstance(value, str) and value.strip() else None


def _opaque_entity(*composite: str) -> str:
    """Map a legacy source-system composite to an explicitly unresolved entity ID."""

    stable_key = canonical_json_bytes(list(composite)).decode("utf-8")
    return f"entity:internal:legacy-{uuid.uuid5(SUBJECT_NAMESPACE, stable_key)}"


def _unique(values: Iterable[str]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for value in values:
        if value and value not in seen:
            seen.add(value)
            out.append(value)
    return out


def _get(record: dict[str, Any], dotted: str) -> Any:
    current: Any = record
    for part in dotted.split("."):
        if not isinstance(current, dict) or part not in current:
            return None
        current = current[part]
    return current


def _normalise_datetime(value: str) -> str:
    """Normalize a system clock to UTC, conservatively handling legacy dates.

    A date-only legacy record is not known to have existed at midnight.  Representing it
    at the final microsecond of that UTC day prevents intraday point-in-time queries from
    seeing it early; ``payload.time_mapping`` retains the original ``day`` precision.
    """

    if _DATE_RE.fullmatch(value):
        dt.date.fromisoformat(value)
        return f"{value}T23:59:59.999999Z"
    parsed = parse_aware_datetime(value)
    timespec = "microseconds" if parsed.microsecond else "seconds"
    return parsed.isoformat(timespec=timespec).replace("+00:00", "Z")


def _valid_endpoint(value: str) -> str:
    if _DATE_RE.fullmatch(value):
        # datetime.date validates leap days and month lengths that the regex alone cannot.
        dt.date.fromisoformat(value)
        return value
    return _normalise_datetime(value)


def _time_value(
    record: dict[str, Any],
    fields: Sequence[str],
    *,
    system: bool,
    latest: bool = False,
) -> tuple[str | None, str | None]:
    candidates: list[tuple[str, str]] = []
    for field in fields:
        value = _get(record, field)
        if not isinstance(value, str) or not value.strip():
            continue
        try:
            normalized = _normalise_datetime(value.strip()) if system else _valid_endpoint(value.strip())
        except (ValueError, TypeError):
            continue
        candidates.append((normalized, field))
        if not latest:
            return normalized, field
    if not candidates:
        return None, None
    return max(candidates, key=lambda item: _system_datetime(item[0]))


def _system_datetime(value: str) -> dt.datetime:
    return parse_aware_datetime(value)


def _time_precision(record: dict[str, Any], field: str | None) -> str:
    if field in {"git.recording_commit_time", "system_time"}:
        return "instant"
    raw = _get(record, field) if field else None
    return "day" if isinstance(raw, str) and _DATE_RE.fullmatch(raw.strip()) else "instant"


def _diagnostic(
    severity: str,
    code: str,
    source_path: str,
    source_locator: str,
    message: str,
) -> Diagnostic:
    return {
        "severity": severity,
        "code": code,
        "source_path": source_path,
        "source_locator": source_locator,
        "message": message,
    }


def _legacy_version(record: dict[str, Any], family: str) -> str:
    version = record.get("schema_version")
    if version is None:
        version = record.get("schema")
    suffix = str(version) if version is not None else "unversioned"
    return f"{family}/{suffix}"


def _equity_subjects(record: dict[str, Any], relative_path: str) -> list[str]:
    run_root = _record_run_root(record, relative_path)
    if not run_root:
        return []
    values = [_opaque_entity("research-run-subject", run_root)]
    ticker = _alias_value(record.get("ticker"))
    exchange = _alias_value(record.get("exchange"))
    if ticker and exchange:
        values.append(_opaque_entity("legacy-listing-alias", exchange, ticker))
    return values


def _correction_subjects(record: dict[str, Any], relative_path: str) -> list[str]:
    return _equity_subjects(record, relative_path)


def _calibration_subjects(record: dict[str, Any], relative_path: str) -> list[str]:
    del record, relative_path
    return ["entity:internal:research-calibration"]


def _commodity_subjects(record: dict[str, Any], relative_path: str) -> list[str]:
    run_root = _record_run_root(record, relative_path)
    if not run_root:
        return []
    values: list[str] = []
    commodity = _alias_value(record.get("commodity"))
    if commodity:
        values.append(_opaque_entity("commodity", commodity))
    else:
        values.append(_opaque_entity("commodity-run-subject", run_root))
    return values


def _screener_event_subjects(record: dict[str, Any], relative_path: str) -> list[str]:
    values: list[str] = []
    run_root = _record_run_root(record, relative_path)
    event_id = _identifier_value(record.get("event_id"))
    signal_id = _identifier_value(record.get("signal_id"))
    if run_root:
        values.append(_opaque_entity("screener-run", run_root))
    if event_id:
        values.append(_opaque_entity("screener-event", event_id))
    if signal_id:
        values.append(_opaque_entity("screener-signal", signal_id))
    return values


def _screener_thesis_subjects(record: dict[str, Any], relative_path: str) -> list[str]:
    meta = record.get("meta") if isinstance(record.get("meta"), dict) else {}
    values: list[str] = []
    run_root = _record_run_root(record, relative_path)
    thesis_id = _identifier_value(meta.get("thesis_id"))
    signal_id = _identifier_value(meta.get("signal_id"))
    if run_root:
        values.append(_opaque_entity("screener-run", run_root))
    if thesis_id:
        values.append(_opaque_entity("screener-thesis", thesis_id))
    if signal_id:
        values.append(_opaque_entity("screener-signal", signal_id))
    return values


def _screener_idea_subjects(record: dict[str, Any], relative_path: str) -> list[str]:
    del relative_path
    values: list[str] = []
    idea_id = _identifier_value(record.get("idea_id"))
    if idea_id:
        values.append(_opaque_entity("screener-idea", idea_id))
    ticker = _alias_value(record.get("ticker"))
    exchange = _alias_value(record.get("exchange"))
    if ticker and exchange:
        values.append(_opaque_entity("legacy-listing-alias", exchange, ticker))
    return values


def _screener_idea_archive_subjects(record: dict[str, Any], relative_path: str) -> list[str]:
    # The archive directory holds three writer schemas: idea-archive/v1 nests the idea under
    # "snapshot", idea-board-recovery/v1 nests it under "board_row", and
    # idea-archive-suppression/v1 carries the identifiers flat on the record.
    for key in ("snapshot", "board_row"):
        nested = record.get(key)
        if isinstance(nested, dict):
            return _screener_idea_subjects(nested, relative_path)
    return _screener_idea_subjects(record, relative_path)


def _screener_conviction_subjects(record: dict[str, Any], relative_path: str) -> list[str]:
    del relative_path
    values: list[str] = []
    thesis_id = _identifier_value(record.get("thesis_id"))
    checkpoint_id = _identifier_value(
        record.get("checkpoint_id") or record.get("triggering_checkpoint_id")
    )
    if thesis_id:
        values.append(_opaque_entity("screener-thesis", thesis_id))
    if checkpoint_id:
        values.append(_opaque_entity("screener-checkpoint", checkpoint_id))
    return values


def _record_run_root(record: dict[str, Any], relative_path: str) -> str | None:
    value = record.get("run_root")
    if isinstance(value, str) and value.strip():
        return PurePosixPath(value.strip()).as_posix().rstrip("/")
    path = PurePosixPath(relative_path)
    if path.parts[:1] == ("analyses",) and len(path.parts) >= 2:
        return PurePosixPath(*path.parts[:2]).as_posix()
    if path.parts[:2] == ("commodity", "runs") and len(path.parts) >= 3:
        return PurePosixPath(*path.parts[:3]).as_posix()
    return None


def _no_run(record: dict[str, Any], relative_path: str) -> None:
    del record, relative_path
    return None


def _field_key(field: str) -> Callable[[dict[str, Any]], str | None]:
    def get_key(record: dict[str, Any]) -> str | None:
        value = _get(record, field)
        return value.strip() if isinstance(value, str) and value.strip() else None

    return get_key


def _classify(relative_path: str) -> SourceSpec | None:
    path = PurePosixPath(relative_path)
    parts = path.parts

    if len(parts) == 3 and parts[0] == "analyses" and parts[2] == "decision_record.json":
        return SourceSpec(
            "equity_decision_record", "decision.recorded", "json",
            ("decision_date",), ("decision_date",), _equity_subjects,
            _record_run_root, lambda row: _legacy_version(row, "equity-decision-record"),
            prefer_git_time_for_date=True,
        )
    if (len(parts) == 4 and parts[0] == "analyses" and parts[2] == "reviews"
            and parts[3].endswith("_decision_review.json")):
        return SourceSpec(
            "equity_decision_review", "outcome.reviewed", "json",
            ("review_date",), ("review_date",), _equity_subjects,
            _record_run_root, lambda row: _legacy_version(row, "equity-decision-review"),
            prefer_git_time_for_date=True,
        )
    if len(parts) == 3 and parts[0] == "analyses" and parts[2] == "corrections.json":
        return SourceSpec(
            "equity_decision_correction", "correction.recorded", "json",
            ("date", "superseded_by.date"), ("date", "superseded_by.date"),
            _correction_subjects, _record_run_root,
            lambda row: _legacy_version(row, "equity-decision-correction"),
            allow_git_time=True,
            prefer_git_time_for_date=True,
        )
    if (
        len(parts) == 3
        and parts[:2] == ("analyses", "performance")
        and parts[2].endswith("_calibration_summary.json")
    ):
        return SourceSpec(
            "equity_calibration_summary", "calibration.summary-recorded", "json",
            ("generated_at",), ("generated_at",), _calibration_subjects, _no_run,
            lambda row: _legacy_version(row, "equity-calibration-summary"),
            prefer_git_time_for_date=True,
        )
    if (len(parts) == 4 and parts[:2] == ("commodity", "runs")
            and parts[3] == "decision_record.json"):
        return SourceSpec(
            "commodity_decision_record", "decision.recorded", "json",
            ("decision_date",), ("decision_date",), _commodity_subjects,
            _record_run_root, lambda row: _legacy_version(row, "commodity-decision-record"),
            prefer_git_time_for_date=True,
        )
    if (len(parts) == 4 and parts[:2] == ("commodity", "runs")
            and parts[3] == "signal_evidence.json"):
        return SourceSpec(
            "commodity_signal_evidence", "commodity.signal-evidence.compiled", "json",
            ("generated_at",), ("generated_at",), _commodity_subjects,
            _record_run_root, lambda row: _legacy_version(row, "commodity-signal-evidence"),
        )
    if parts == ("screener", "ledger", "events.ndjson"):
        return SourceSpec(
            "screener_event", "screener.event.recorded", "ndjson",
            ("processed_at", "ts"), ("ts", "processed_at"), _screener_event_subjects,
            _record_run_root, lambda row: _legacy_version(row, "screener-event"),
            supersession_key=_field_key("signal_id"),
        )
    if len(parts) == 4 and parts[:3] == ("screener", "ledger", "theses") and path.suffix == ".json":
        return SourceSpec(
            "screener_thesis", "screener.thesis.recorded", "json",
            ("meta.created_at", "meta.phase1_completed_at", "integrity_review.reviewed_at"),
            ("meta.raw_input_source.input_datetime", "meta.created_at"),
            _screener_thesis_subjects, _record_run_root,
            lambda row: _legacy_version(row, "screener-thesis-record"),
            latest_system=True,
        )
    if parts == ("screener", "ledger", "ideas.ndjson"):
        return SourceSpec(
            "screener_idea_history", "screener.idea.recorded", "ndjson",
            ("ts", "updated_at", "idea_version_started_at", "surfaced_at"),
            ("idea_version_started_at", "surfaced_at", "ts", "updated_at"),
            _screener_idea_subjects, _no_run,
            lambda row: _legacy_version(row, "screener-idea"),
            supersession_key=_field_key("idea_id"),
        )
    if len(parts) == 4 and parts[:3] == ("screener", "ledger", "ideas") and path.suffix == ".json":
        return SourceSpec(
            "screener_idea_snapshot", "screener.idea.snapshot-recorded", "json",
            ("updated_at", "idea_version_started_at", "surfaced_at"),
            ("idea_version_started_at", "surfaced_at", "updated_at"),
            _screener_idea_subjects, _no_run,
            lambda row: _legacy_version(row, "screener-idea-snapshot"),
        )
    if (len(parts) == 4 and parts[:3] == ("screener", "ledger", "ideas_archive")
            and path.suffix == ".json" and path.name != "retention.json"):
        return SourceSpec(
            "screener_idea_archive", "screener.idea.archived", "json",
            ("archived_at", "recovered_at", "suppressed_at",
             "updated_at", "snapshot.updated_at", "board_row.updated_at"),
            ("snapshot.idea_version_started_at", "snapshot.surfaced_at",
             "board_row.idea_version_started_at", "board_row.surfaced_at",
             "idea_version_started_at", "surfaced_at",
             "archived_at", "recovered_at", "suppressed_at"),
            _screener_idea_archive_subjects, _no_run,
            lambda row: _legacy_version(row, "screener-idea-archive"),
        )
    if parts == ("screener", "ledger", "conviction", "conviction.ndjson"):
        return SourceSpec(
            "screener_conviction_event", "screener.conviction.recorded", "ndjson",
            ("at",), ("at",), _screener_conviction_subjects, _no_run,
            lambda row: _legacy_version(row, "screener-conviction-event"),
        )
    if parts == ("screener", "ledger", "conviction", "checkpoints.ndjson"):
        return SourceSpec(
            "screener_conviction_checkpoint", "screener.checkpoint.recorded", "ndjson",
            ("created_at",), ("created_at",), _screener_conviction_subjects, _no_run,
            lambda row: _legacy_version(row, "screener-conviction-checkpoint"),
        )
    if (len(parts) == 5 and parts[:4] == ("screener", "ledger", "conviction", "conviction_state")
            and path.suffix == ".json"):
        return SourceSpec(
            "screener_conviction_state", "screener.conviction-state.recorded", "json",
            ("updated_at",), ("updated_at",), _screener_conviction_subjects, _no_run,
            lambda row: _legacy_version(row, "screener-conviction-state"),
        )
    return None


def _relative_source(repo_root: Path, source_path: str | Path) -> tuple[Path, str]:
    root = repo_root.resolve()
    supplied = Path(source_path)
    absolute = supplied.resolve() if supplied.is_absolute() else (root / supplied).resolve()
    try:
        relative = absolute.relative_to(root).as_posix()
    except ValueError as exc:
        raise ValueError(f"source path is outside repository root: {source_path}") from exc
    return absolute, relative


@lru_cache(maxsize=32)
def _git_top_level(repo_root_text: str) -> str | None:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            cwd=repo_root_text,
            check=False,
            capture_output=True,
            text=True,
            timeout=10,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    if result.returncode != 0 or not result.stdout.strip():
        return None
    return str(Path(result.stdout.strip()).resolve())


@lru_cache(maxsize=1024)
def _git_path_is_clean(repo_root_text: str, relative_path: str) -> bool:
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain=v1", "--untracked-files=all", "--", relative_path],
            cwd=repo_root_text,
            check=False,
            capture_output=True,
            text=True,
            timeout=10,
        )
    except (OSError, subprocess.SubprocessError):
        return False
    return result.returncode == 0 and not result.stdout.strip()


@lru_cache(maxsize=4096)
def _git_commit_time(repo_root_text: str, commit: str) -> str | None:
    try:
        result = subprocess.run(
            ["git", "show", "-s", "--format=%cI", commit],
            cwd=repo_root_text,
            check=False,
            capture_output=True,
            text=True,
            timeout=10,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    if result.returncode != 0 or not result.stdout.strip():
        return None
    try:
        return _normalise_datetime(result.stdout.splitlines()[0].strip())
    except ValueError:
        return None


@lru_cache(maxsize=256)
def _git_line_commits(repo_root_text: str, relative_path: str) -> dict[int, str]:
    """Map current NDJSON line numbers to the commits that introduced those bytes."""
    try:
        result = subprocess.run(
            ["git", "blame", "--line-porcelain", "--", relative_path],
            cwd=repo_root_text,
            check=False,
            capture_output=True,
            text=True,
            timeout=30,
        )
    except (OSError, subprocess.SubprocessError):
        return {}
    if result.returncode != 0:
        return {}
    mapping: dict[int, str] = {}
    header = re.compile(r"^([0-9a-f]{40}) \d+ (\d+)(?: \d+)?$")
    for line in result.stdout.splitlines():
        match = header.fullmatch(line)
        if match:
            mapping[int(match.group(2))] = match.group(1)
    return mapping


def _git_recorded_metadata(
    repo_root: Path,
    relative_path: str,
    source_locator: str,
) -> tuple[str, str, str] | None:
    """Return trusted receipt time, commit, and trust method for current source bytes.

    JSON uses the commit that recorded the current file version. NDJSON uses blame
    at the exact line so later appends do not rewrite earlier system-time history.
    Dirty or untracked bytes deliberately have no trusted receipt time.
    """

    root_text = str(repo_root.resolve())
    if _git_top_level(root_text) != root_text:
        return None
    if not _git_path_is_clean(root_text, relative_path):
        return None

    line_match = re.fullmatch(r"line-(\d+)", source_locator)
    trust = "git-commit/v1"
    if line_match:
        line_number = int(line_match.group(1))
        commit = _git_line_commits(root_text, relative_path).get(line_number)
        trust = "git-commit+ndjson-line-order/v1"
    else:
        try:
            result = subprocess.run(
                ["git", "log", "-1", "--follow", "--format=%H", "--", relative_path],
                cwd=root_text,
                check=False,
                capture_output=True,
                text=True,
                timeout=10,
            )
        except (OSError, subprocess.SubprocessError):
            return None
        commit = result.stdout.splitlines()[0].strip() if result.returncode == 0 and result.stdout.strip() else None
    if not commit:
        return None
    timestamp = _git_commit_time(root_text, commit)
    if timestamp is None:
        return None
    if line_match:
        # One Git commit makes all appended rows durable atomically, but their
        # append order is still explicit in NDJSON. Preserve that deterministic
        # ordering at microsecond precision for strict supersession edges.
        timestamp_value = _system_datetime(timestamp) + dt.timedelta(
            microseconds=int(line_match.group(1))
        )
        timestamp = timestamp_value.isoformat(timespec="microseconds").replace("+00:00", "Z")
    return timestamp, commit, trust


def _decode_git_path(raw: bytes) -> str | None:
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return None


def _git_dirty_paths(repo_root: Path, relative_paths: Sequence[str]) -> set[str] | None:
    """Return dirty supported paths using one NUL-safe Git status snapshot."""

    if not relative_paths:
        return set()
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain=v1", "-z", "--untracked-files=all"],
            cwd=repo_root, check=False, capture_output=True, timeout=30,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    if result.returncode != 0:
        return None
    wanted = set(relative_paths)
    dirty: set[str] = set()
    for raw in result.stdout.split(b"\0"):
        if not raw:
            continue
        # Porcelain v1 -z emits ``XY path\0``.  A rename/copy emits a second bare path
        # token; keeping both dirty is conservative and preserves the old per-path check.
        candidate = raw[3:] if len(raw) >= 3 and raw[2:3] == b" " else raw
        decoded = _decode_git_path(candidate)
        if decoded in wanted:
            dirty.add(decoded)
    return dirty


def _git_json_receipts(
    repo_root: Path,
    relative_paths: Sequence[str],
) -> dict[str, tuple[str, str, str]]:
    """Resolve each current JSON path's latest recording commit in one history walk."""

    if not relative_paths:
        return {}
    receipts: dict[str, tuple[str, str, str]] = {}
    for offset in range(0, len(relative_paths), GIT_ARGUMENT_BATCH_SIZE):
        batch = relative_paths[offset:offset + GIT_ARGUMENT_BATCH_SIZE]
        wanted = set(batch)
        try:
            result = subprocess.run(
                [
                    "git", "log", "--format=REC%x00%H%x00%cI%x00", "--name-only", "-z",
                    "--", *batch,
                ],
                cwd=repo_root, check=False, capture_output=True, timeout=30,
            )
        except (OSError, subprocess.SubprocessError):
            return {}
        if result.returncode != 0:
            return {}

        commit: str | None = None
        timestamp: str | None = None
        for raw in result.stdout.split(b"\0"):
            # Git inserts one record-separating newline before the next header/path.  Remove
            # exactly that byte; a real filename beginning with a newline keeps its own byte.
            token = raw[1:] if raw.startswith(b"\n") else raw
            if token == b"REC":
                commit = None
                timestamp = None
                continue
            if commit is None:
                if token:
                    try:
                        commit = token.decode("ascii")
                    except UnicodeDecodeError:
                        commit = ""
                continue
            if timestamp is None:
                if token:
                    try:
                        timestamp = _normalise_datetime(token.decode("ascii"))
                    except (UnicodeDecodeError, ValueError):
                        timestamp = ""
                continue
            if not token or not commit or not timestamp:
                continue
            relative = _decode_git_path(token)
            if relative in wanted and relative not in receipts:
                receipts[relative] = (timestamp, commit, "git-commit/v1")
    return receipts


def _git_commit_times(repo_root: Path, commits: Iterable[str]) -> dict[str, str]:
    ordered = sorted(set(commits))
    if not ordered:
        return {}
    values: dict[str, str] = {}
    for offset in range(0, len(ordered), GIT_ARGUMENT_BATCH_SIZE):
        batch = ordered[offset:offset + GIT_ARGUMENT_BATCH_SIZE]
        try:
            result = subprocess.run(
                ["git", "show", "-s", "--format=REC%x00%H%x00%cI%x00", *batch],
                cwd=repo_root, check=False, capture_output=True, timeout=30,
            )
        except (OSError, subprocess.SubprocessError):
            return {}
        if result.returncode != 0:
            return {}
        tokens = [raw[1:] if raw.startswith(b"\n") else raw for raw in result.stdout.split(b"\0")]
        index = 0
        while index + 2 < len(tokens):
            if tokens[index] != b"REC":
                index += 1
                continue
            try:
                commit = tokens[index + 1].decode("ascii")
                timestamp = _normalise_datetime(tokens[index + 2].decode("ascii"))
            except (UnicodeDecodeError, ValueError):
                index += 3
                continue
            values[commit] = timestamp
            index += 3
    return values


def _repository_git_snapshot(
    repo_root: Path,
    sources: Sequence[Path],
) -> GitMetadataSnapshot:
    """Freeze the Git facts used by every source in one adapter pass."""

    root = repo_root.resolve()
    root_text = str(root)
    if _git_top_level(root_text) != root_text:
        return GitMetadataSnapshot(False, frozenset(), {}, {}, {})

    relative_paths = [source.as_posix() for source in sources]
    dirty = _git_dirty_paths(root, relative_paths)
    clean_paths = frozenset(
        relative for relative in relative_paths
        if dirty is not None and relative not in dirty
    )
    json_paths: list[str] = []
    ndjson_paths: list[str] = []
    for relative in clean_paths:
        spec = _classify(relative)
        if spec is not None and spec.format == "json":
            json_paths.append(relative)
        elif spec is not None and spec.format == "ndjson":
            ndjson_paths.append(relative)
    json_receipts = _git_json_receipts(root, json_paths)
    line_commits = {
        relative: _git_line_commits(root_text, relative)
        for relative in ndjson_paths
    }
    commit_times = _git_commit_times(
        root,
        (commit for mapping in line_commits.values() for commit in mapping.values()),
    )
    return GitMetadataSnapshot(
        True, clean_paths, json_receipts, line_commits, commit_times,
    )


def _build_event(
    spec: SourceSpec,
    relative_path: str,
    source_locator: str,
    evidence_locator: str,
    raw_record: bytes,
    record: dict[str, Any],
    repo_root: Path,
    git_snapshot: GitMetadataSnapshot | None = None,
) -> tuple[Event | None, list[Diagnostic]]:
    diagnostics: list[Diagnostic] = []
    subjects = _unique(spec.subjects(record, relative_path))
    if not subjects:
        diagnostics.append(_diagnostic(
            "error", "missing_identity", relative_path, source_locator,
            f"{spec.record_kind} has no deterministic subject identity",
        ))
        return None, diagnostics

    source_system_time, source_system_field = _time_value(
        record, spec.system_fields, system=True, latest=spec.latest_system,
    )
    legacy_system_field: str | None = None
    git_commit: str | None = None
    git_receipt_time: str | None = None
    root_text = str(repo_root.resolve())
    repository_is_git = (
        git_snapshot.repository_is_git
        if git_snapshot is not None
        else _git_top_level(root_text) == root_text
    )
    system_time_trust = "unverified-non-git-fixture"
    if repository_is_git:
        git_metadata = (
            git_snapshot.recorded_metadata(relative_path, source_locator)
            if git_snapshot is not None
            else _git_recorded_metadata(repo_root, relative_path, source_locator)
        )
        if git_metadata is None:
            diagnostics.append(_diagnostic(
                "error", "uncommitted_source_time", relative_path, source_locator,
                "current source bytes are dirty, untracked, or lack trusted Git receipt metadata",
            ))
            return None, diagnostics
        git_receipt_time, git_commit, system_time_trust = git_metadata
        source_precision = _time_precision(record, source_system_field)
        if source_system_time is None or source_precision == "day":
            system_time = git_receipt_time
            system_field = "git.recording_commit_time"
            if source_system_time is None:
                diagnostics.append(_diagnostic(
                    "info", "git_timestamp_fallback", relative_path, source_locator,
                    f"system_time comes from commit {git_commit} that recorded the current source bytes",
                ))
            else:
                legacy_system_field = source_system_field
        else:
            # Never expose a record before the repository received its current
            # bytes. A future producer timestamp also remains future rather than
            # being pulled backward to the commit clock.
            system_time = max(
                (source_system_time, git_receipt_time), key=_system_datetime
            )
            legacy_system_field = source_system_field
            system_field = f"max(git.recording_commit_time,{source_system_field})"
    else:
        system_time = source_system_time
        system_field = source_system_field
    if system_time is None or system_field is None:
        diagnostics.append(_diagnostic(
            "error", "missing_system_time", relative_path, source_locator,
            f"{spec.record_kind} has no valid timezone-aware timestamp in {list(spec.system_fields)}",
        ))
        return None, diagnostics

    valid_from, valid_field = _time_value(record, spec.valid_fields, system=False)
    if valid_from is None:
        # Git commit time is a legitimate record-system time but not an independent world-valid
        # time.  For a correction, the correction starts applying when it was recorded.
        if spec.allow_git_time and system_field == "git.recording_commit_time":
            valid_from, valid_field = system_time, "system_time"
        else:
            diagnostics.append(_diagnostic(
                "error", "missing_valid_time", relative_path, source_locator,
                f"{spec.record_kind} has no valid time in {list(spec.valid_fields)}",
            ))
            return None, diagnostics

    source_digest = _sha256(raw_record)
    payload: dict[str, Any] = {
        "legacy_schema": spec.legacy_schema(record),
        "record_type": spec.record_kind,
        "source_path": relative_path,
        "source_locator": source_locator,
        "source_sha256": source_digest,
        "identity_mapping": {
            "strategy": "native-ids-plus-opaque-source-composites-v1",
            "opaque_uuid_namespace": str(SUBJECT_NAMESPACE),
            "aliases_preserved_under": "record",
        },
        "time_mapping": {
            "system_time_field": system_field,
            "system_time_precision": (
                "instant" if repository_is_git else _time_precision(record, system_field)
            ),
            "system_time_trust": system_time_trust,
            "valid_time_field": valid_field,
            "valid_time_precision": _time_precision(record, valid_field),
        },
        "record": copy.deepcopy(record),
    }
    if git_commit:
        payload["source_git_commit"] = git_commit
    if git_receipt_time:
        payload["time_mapping"]["git_receipt_time"] = git_receipt_time
    if legacy_system_field:
        payload["time_mapping"]["legacy_system_time_field"] = legacy_system_field
        payload["time_mapping"]["legacy_system_time_precision"] = _time_precision(
            record, legacy_system_field
        )
    try:
        digest = payload_sha256(payload)
    except (TypeError, ValueError) as exc:
        diagnostics.append(_diagnostic(
            "error", "non_canonical_payload", relative_path, source_locator,
            f"record cannot be represented as strict canonical JSON: {exc}",
        ))
        return None, diagnostics

    # Bind identity to the exact canonical envelope payload.  This prevents the same event ID
    # from naming two payloads if repository-time provenance differs across histories.
    stable_key = "\0".join((spec.record_kind, relative_path, source_locator, digest))
    event: Event = {
        "schema": "memory-event/v1",
        "event_id": _event_id(stable_key),
        "event_type": spec.event_type,
        "subject_ids": subjects,
        "valid_time": {"from": valid_from, "to": None},
        "system_time": system_time,
        "producer": {
            "kind": "adapter",
            "name": ADAPTER_NAME,
            "runtime": ADAPTER_RUNTIME,
            "model": None,
            "prompt_program_sha": None,
        },
        "run_id": _run_id(spec.run_root(record, relative_path)),
        "trace_id": None,
        "payload": payload,
        "evidence_refs": [f"evidence:sha256:{source_digest}#{evidence_locator}"],
        "derived_from": [],
        "supersedes": [],
        "integrity": {"payload_sha256": digest, "signature": None},
        "policy": copy.deepcopy(POLICY),
    }
    return event, diagnostics


def _read_json_source(
    repo_root: Path,
    absolute: Path,
    relative: str,
    spec: SourceSpec,
    git_snapshot: GitMetadataSnapshot | None = None,
) -> tuple[list[Event], list[Diagnostic]]:
    try:
        raw = absolute.read_bytes()
    except OSError as exc:
        return [], [_diagnostic("error", "source_read_error", relative, "json", str(exc))]
    try:
        record = json.loads(raw.decode("utf-8"))
    except UnicodeDecodeError as exc:
        return [], [_diagnostic("error", "invalid_utf8", relative, "json", str(exc))]
    except json.JSONDecodeError as exc:
        return [], [_diagnostic("error", "invalid_json", relative, "json", str(exc))]
    if not isinstance(record, dict):
        return [], [_diagnostic(
            "error", "unsupported_shape", relative, "json", "top-level JSON value must be an object",
        )]
    event, diagnostics = _build_event(
        spec, relative, "json", "json", raw, record, repo_root, git_snapshot,
    )
    return ([event] if event else []), diagnostics


def _read_ndjson_source(
    repo_root: Path,
    absolute: Path,
    relative: str,
    spec: SourceSpec,
    git_snapshot: GitMetadataSnapshot | None = None,
) -> tuple[list[Event], list[Diagnostic]]:
    try:
        raw = absolute.read_bytes()
    except OSError as exc:
        return [], [_diagnostic("error", "source_read_error", relative, "file", str(exc))]

    events: list[Event] = []
    diagnostics: list[Diagnostic] = []
    prior_by_key: dict[str, Event] = {}
    for line_number, line_with_ending in enumerate(raw.splitlines(keepends=True), start=1):
        raw_line = line_with_ending.rstrip(b"\r\n")
        locator = f"line-{line_number}"
        if not raw_line.strip():
            continue
        try:
            record = json.loads(raw_line.decode("utf-8"))
        except UnicodeDecodeError as exc:
            diagnostics.append(_diagnostic("error", "invalid_utf8", relative, locator, str(exc)))
            continue
        except json.JSONDecodeError as exc:
            diagnostics.append(_diagnostic("error", "invalid_json", relative, locator, str(exc)))
            continue
        if not isinstance(record, dict):
            diagnostics.append(_diagnostic(
                "error", "unsupported_shape", relative, locator, "NDJSON row must be an object",
            ))
            continue
        event, row_diagnostics = _build_event(
            spec, relative, locator, locator, raw_line, record, repo_root, git_snapshot,
        )
        diagnostics.extend(row_diagnostics)
        if event is None:
            continue

        if spec.supersession_key:
            key = spec.supersession_key(record)
            previous = prior_by_key.get(key) if key else None
            if previous:
                previous_time = _system_datetime(previous["system_time"])
                event_time = _system_datetime(event["system_time"])
                if previous_time < event_time:
                    event["supersedes"] = [previous["event_id"]]
                    if key:
                        prior_by_key[key] = event
                else:
                    if previous_time > event_time:
                        previous["supersedes"] = _unique([
                            *previous["supersedes"], event["event_id"],
                        ])
                    diagnostics.append(_diagnostic(
                        "warning", "non_monotonic_update", relative, locator,
                        f"later {spec.record_kind} row for {key!r} does not have a later "
                        "system_time; chronological supersession was preserved where unambiguous",
                    ))
            elif key:
                prior_by_key[key] = event
        events.append(event)
    return events, diagnostics


def discover_legacy_sources(repo_root: str | Path) -> list[Path]:
    """Return supported source paths, relative to ``repo_root``, in stable order."""

    root = Path(repo_root).resolve()
    candidates: set[str] = set()
    patterns = (
        "analyses/*/decision_record.json",
        "analyses/*/reviews/*_decision_review.json",
        "analyses/*/corrections.json",
        "analyses/performance/*_calibration_summary.json",
        "commodity/runs/*/decision_record.json",
        "commodity/runs/*/signal_evidence.json",
        "screener/ledger/events.ndjson",
        "screener/ledger/theses/*.json",
        "screener/ledger/ideas.ndjson",
        "screener/ledger/ideas/*.json",
        "screener/ledger/ideas_archive/*.json",
        "screener/ledger/conviction/conviction.ndjson",
        "screener/ledger/conviction/checkpoints.ndjson",
        "screener/ledger/conviction/conviction_state/*.json",
    )
    for pattern in patterns:
        for path in root.glob(pattern):
            if path.is_file():
                relative = path.relative_to(root).as_posix()
                if _classify(relative):
                    candidates.add(relative)
    return [Path(relative) for relative in sorted(candidates)]


def _adapt_source(
    root: Path,
    source_path: str | Path,
    git_snapshot: GitMetadataSnapshot | None = None,
) -> tuple[list[Event], list[Diagnostic]]:
    try:
        absolute, relative = _relative_source(root, source_path)
    except ValueError as exc:
        return [], [_diagnostic("error", "source_outside_root", str(source_path), "file", str(exc))]
    spec = _classify(relative)
    if spec is None:
        return [], [_diagnostic(
            "error", "unsupported_source", relative, "file",
            "path does not match a supported legacy memory source",
        )]
    if spec.format == "json":
        return _read_json_source(root, absolute, relative, spec, git_snapshot)
    return _read_ndjson_source(root, absolute, relative, spec, git_snapshot)


def _clear_mutable_git_caches() -> None:
    # Git commits are immutable, but worktree cleanliness and line ownership can
    # change between public adapter calls in a long-lived process.
    _git_path_is_clean.cache_clear()
    _git_line_commits.cache_clear()


def adapt_source(
    repo_root: str | Path,
    source_path: str | Path,
) -> tuple[list[Event], list[Diagnostic]]:
    """Adapt one source without changing it; unsupported inputs become diagnostics."""

    root = Path(repo_root).resolve()
    _clear_mutable_git_caches()
    return _adapt_source(root, source_path)


def _link_derived_from(
    child: Event, parent: Event, source_path: str, label: str,
    diagnostics: list[Diagnostic],
) -> bool:
    """Link child->parent only when the parent is strictly earlier.

    Both records can fall back to the same git commit time when they were committed together,
    which leaves the derivation order unestablished rather than known.
    """
    if _system_datetime(parent["system_time"]) >= _system_datetime(child["system_time"]):
        diagnostics.append(_diagnostic(
            "warning", "unordered_derivation", source_path, "json",
            f"{label} does not have an earlier system_time; derived_from link omitted",
        ))
        return False
    child["derived_from"] = _unique([*child["derived_from"], parent["event_id"]])
    return True


def _resolve_correction_links(events: list[Event], diagnostics: list[Diagnostic]) -> None:
    by_source = {event["payload"]["source_path"]: event for event in events}
    for correction in [
        event for event in events
        if event["payload"].get("record_type") == "equity_decision_correction"
    ]:
        source_path = correction["payload"]["source_path"]
        run_root = PurePosixPath(source_path).parent
        original_path = (run_root / "decision_record.json").as_posix()
        original = by_source.get(original_path)
        if original:
            _link_derived_from(correction, original, source_path, repr(original_path), diagnostics)
        else:
            diagnostics.append(_diagnostic(
                "warning", "unresolved_correction_source", source_path, "json",
                f"sibling decision event {original_path!r} was not adapted",
            ))

        record = correction["payload"].get("record", {})
        superseded_by = record.get("superseded_by") if isinstance(record, dict) else None
        target_root = superseded_by.get("run_root") if isinstance(superseded_by, dict) else None
        if not isinstance(target_root, str) or not target_root.strip():
            continue
        target_path = (PurePosixPath(target_root.strip()) / "decision_record.json").as_posix()
        target = by_source.get(target_path)
        if not original or not target:
            diagnostics.append(_diagnostic(
                "warning", "unresolved_supersession_target", source_path, "json",
                f"superseded_by target {target_path!r} could not be linked to adapted decision events",
            ))
            continue
        if _system_datetime(target["system_time"]) <= _system_datetime(original["system_time"]):
            diagnostics.append(_diagnostic(
                "warning", "invalid_supersession_time", source_path, "json",
                f"replacement {target_path!r} is not later than {original_path!r}; link omitted",
            ))
            continue
        target["supersedes"] = _unique([*target["supersedes"], original["event_id"]])
        _link_derived_from(correction, target, source_path, repr(target_path), diagnostics)


def adapt_repository(repo_root: str | Path) -> tuple[list[Event], list[Diagnostic]]:
    """Adapt all supported legacy sources and return deterministic events + diagnostics."""

    root = Path(repo_root).resolve()
    _clear_mutable_git_caches()
    events: list[Event] = []
    diagnostics: list[Diagnostic] = []
    sources = discover_legacy_sources(root)
    git_snapshot = _repository_git_snapshot(root, sources)
    for source in sources:
        source_events, source_diagnostics = _adapt_source(root, source, git_snapshot)
        events.extend(source_events)
        diagnostics.extend(source_diagnostics)

    _resolve_correction_links(events, diagnostics)

    seen: dict[str, Event] = {}
    unique_events: list[Event] = []
    for event in events:
        prior = seen.get(event["event_id"])
        if prior:
            diagnostics.append(_diagnostic(
                "error", "duplicate_event_id", event["payload"]["source_path"],
                event["payload"]["source_locator"],
                f"event ID also emitted by {prior['payload']['source_path']}#"
                f"{prior['payload']['source_locator']}",
            ))
            continue
        seen[event["event_id"]] = event
        unique_events.append(event)

    diagnostics.sort(key=lambda row: (
        row["source_path"], row["source_locator"], row["severity"], row["code"], row["message"],
    ))
    return unique_events, diagnostics


__all__ = [
    "ADAPTER_NAME",
    "adapt_repository",
    "adapt_source",
    "canonical_json_bytes",
    "discover_legacy_sources",
    "payload_sha256",
]
