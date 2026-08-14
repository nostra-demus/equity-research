#!/usr/bin/env python3
"""One-time, offline recovery of Ideas that existed only in committed board snapshots.

This is an administrator migration, never a runtime reader.  It walks the committed history of
``screener/board/index.json`` and writes narrowly validated, audit-only board-row envelopes into the
Ideas archive.  Historical rows are recoverable only after a commit proved they were stale; the latest
committed board may additionally preserve an unexpired row as read-only recovery state.  Missing strict
SurfacedIdea fields are never invented.

The default is a dry run.  ``--write`` creates occurrence files first and advances the durable decision
manifest only after every record is safely on disk.  Manifest decisions are authoritative on later runs:
an archive trim can therefore never make a previously active/suppressed occurrence eligible again.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

from canonical_json import canonical_json, canonical_sha256


SOURCE_PATH = "screener/board/index.json"
ARCHIVE_REL = Path("screener/ledger/ideas_archive")
IDEAS_REL = Path("screener/ledger/ideas")
MANIFEST_NAME = "board-history-recovery-manifest.json"
RETENTION_NAME = "retention.json"
RETENTION_REQUIRED_NAME = ".retention-required"
RETENTION_MARKER = b"idea archive retention metadata required\n"
MANIFEST_SCHEMA = "idea-board-recovery-manifest/v1"
RECOVERY_SCHEMA = "idea-board-recovery/v1"
COMMIT_RE = re.compile(r"^[a-f0-9]{40}(?:[a-f0-9]{24})?$")
IDEA_ID_RE = re.compile(r"^IDEA-[a-f0-9]{12}$")
IDEA_VERSION_RE = re.compile(r"^IDEAV-[a-f0-9]{16}$")
EVENT_ID_RE = re.compile(r"^EVT-[a-f0-9]{12}$")
DIRECTIONS = {"long", "short", "pair"}
DECISIONS = {"imported", "skipped", "suppressed", "active"}
ARCHIVE_FILE_RE = re.compile(
    r"^(IDEA-[a-f0-9]{12})--(IDEAV-[a-f0-9]{16})--([a-f0-9]{64})--"
    r"(long|short|pair)--(expired|imported|withdrawn)\.json$"
)
IDEA_ARCHIVE_STORAGE_LIMIT_PER_SIDE = 250
IDEA_ARCHIVE_MAX_OCCURRENCES_READ = IDEA_ARCHIVE_STORAGE_LIMIT_PER_SIDE * 2 + 100
IDEA_ARCHIVE_MAX_FILES_READ = IDEA_ARCHIVE_MAX_OCCURRENCES_READ * 3
IDEA_ARCHIVE_MAX_DIRECTORY_ENTRIES_READ = IDEA_ARCHIVE_MAX_FILES_READ + 64


def rfc3339(value: object) -> bool:
    if not isinstance(value, str) or not value or value != value.strip():
        return False
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return False
    return parsed.tzinfo is not None


def occurrence_key(row: dict[str, Any]) -> tuple[str, str, str, str] | None:
    idea_id = row.get("idea_id")
    version = row.get("idea_version")
    started = row.get("idea_version_started_at")
    direction = row.get("direction")
    if (not isinstance(idea_id, str) or IDEA_ID_RE.fullmatch(idea_id) is None
            or not isinstance(version, str) or IDEA_VERSION_RE.fullmatch(version) is None
            or not rfc3339(started) or direction not in DIRECTIONS):
        return None
    return idea_id, version, started, direction


def occurrence_filename(key: tuple[str, str, str, str], kind: str = "imported") -> str:
    idea_id, version, started, direction = key
    if kind not in {"expired", "imported", "withdrawn"}:
        raise ValueError("invalid archive occurrence kind")
    epoch_hash = hashlib.sha256(started.encode("utf-8")).hexdigest()
    return f"{idea_id}--{version}--{epoch_hash}--{direction}--{kind}.json"


def occurrence_filename_key(name: str, row: dict[str, Any], expected_kind: str | None = None) -> tuple[str, str, str, str] | None:
    match = ARCHIVE_FILE_RE.fullmatch(name)
    key = occurrence_key(row)
    if match is None or key is None:
        return None
    idea_id, version, started, direction = key
    if ((idea_id, version, direction) != (match.group(1), match.group(2), match.group(4))
            or (expected_kind is not None and match.group(5) != expected_kind)
            or hashlib.sha256(started.encode("utf-8")).hexdigest() != match.group(3)):
        return None
    return key


def occurrence_filename_parts(name: str) -> tuple[str, str, str, str, str] | None:
    match = ARCHIVE_FILE_RE.fullmatch(name)
    return tuple(match.groups()) if match else None


def bounded_managed_archive_names(
    archive_dir: Path, limit: int = IDEA_ARCHIVE_MAX_FILES_READ,
    directory_limit: int = IDEA_ARCHIVE_MAX_DIRECTORY_ENTRIES_READ,
) -> tuple[list[str], bool, bool]:
    """Enumerate at most ``limit + 1`` managed siblings without reading or statting them.

    The extra name is only an overflow sentinel.  Callers must not parse any managed record when
    ``overflow`` is true: a tombstone beyond the bound could otherwise be missed and older evidence
    could be resurrected.
    """
    names: list[str] = []
    entries_read = 0
    try:
        with os.scandir(archive_dir) as siblings:
            for sibling in siblings:
                entries_read += 1
                if entries_read > directory_limit:
                    return sorted(names), True, False
                if not sibling.is_file(follow_symlinks=False):
                    continue
                if ARCHIVE_FILE_RE.fullmatch(sibling.name) is None:
                    continue
                names.append(sibling.name)
                if len(names) > limit:
                    return sorted(names), True, False
    except FileNotFoundError:
        return [], False, True
    return sorted(names), False, False


def ensure_recovery_write_capacity(
    managed_names: list[str], writes: dict[Path, dict[str, Any]],
    *, max_files: int = IDEA_ARCHIVE_MAX_FILES_READ,
    max_occurrences: int = IDEA_ARCHIVE_MAX_OCCURRENCES_READ,
) -> None:
    """Reject a migration that would cross the runtime writer's bounded-store ceiling."""
    proposed_names = [path.name for path in writes]
    all_names = [*managed_names, *proposed_names]
    if len(all_names) > max_files:
        raise RuntimeError(
            f"refusing recovery writes: managed archive would exceed the {max_files}-file read bound"
        )
    occurrence_groups = {
        parts[:4] for name in all_names
        if (parts := occurrence_filename_parts(name)) is not None
    }
    if len(occurrence_groups) > max_occurrences:
        raise RuntimeError(
            f"refusing recovery writes: managed archive would exceed the "
            f"{max_occurrences}-occurrence read bound"
        )


def _wire_lineage(row: dict[str, Any]) -> bool:
    has_origin = "origin_type" in row
    has_themes = "source_themes" in row
    if not has_origin and not has_themes:
        return True
    return row.get("origin_type") == "wire" and row.get("source_themes") == []


def _board_row_shape(row: object) -> bool:
    if not isinstance(row, dict) or occurrence_key(row) is None:
        return False
    if (row.get("status") != "live" or row.get("promoted_signal_id") is not None
            or not _wire_lineage(row) or not rfc3339(row.get("decay_at"))):
        return False
    pair_with = row.get("pair_with")
    if row.get("direction") == "pair":
        if not isinstance(pair_with, str) or not pair_with:
            return False
    elif pair_with is not None:
        return False
    if not isinstance(row.get("source_event_ids"), list):
        return False
    if any(not isinstance(event, str) or EVENT_ID_RE.fullmatch(event) is None
           for event in row["source_event_ids"]):
        return False
    required_strings = ("ticker", "reason", "why_now", "conviction_basis", "priced_in",
                        "thesis_type")
    if any(not isinstance(row.get(field), str) for field in required_strings):
        return False
    if any(not rfc3339(row.get(field)) for field in
           ("newest_source_at", "surfaced_at", "updated_at")):
        return False
    if (row.get("company") is not None and not isinstance(row.get("company"), str)
            or row.get("exchange") is not None and not isinstance(row.get("exchange"), str)
            or row.get("source_url") is not None and not isinstance(row.get("source_url"), str)
            or row.get("source_name") is not None and not isinstance(row.get("source_name"), str)):
        return False
    if (not isinstance(row.get("source_headlines"), list)
            or any(not isinstance(item, str) for item in row["source_headlines"])):
        return False
    for field in ("conviction", "trade_score", "materiality_max"):
        value = row.get(field)
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
            return False
    return isinstance(row.get("stale"), bool)


def validate_recovery_record(value: object, filename: str | None = None) -> bool:
    if not isinstance(value, dict) or set(value) != {
        "schema_version", "recovered_at", "recovery_reason", "provenance", "board_row",
    }:
        return False
    if (value.get("schema_version") != RECOVERY_SCHEMA
            or value.get("recovery_reason") not in {"latest_board_current", "historical_board_expired"}
            or not rfc3339(value.get("recovered_at")) or not isinstance(value.get("provenance"), dict)
            or set(value["provenance"]) != {
                "source_path", "source_commit", "board_generated_at", "source_row_sha256",
            }):
        return False
    provenance = value["provenance"]
    row = value.get("board_row")
    if (provenance.get("source_path") != SOURCE_PATH
            or not isinstance(provenance.get("source_commit"), str)
            or COMMIT_RE.fullmatch(provenance["source_commit"]) is None
            or not isinstance(provenance.get("source_row_sha256"), str)
            or re.fullmatch(r"[a-f0-9]{64}", provenance["source_row_sha256"]) is None
            or not rfc3339(provenance.get("board_generated_at"))
            or not _board_row_shape(row)):
        return False
    if canonical_sha256(row) != provenance["source_row_sha256"]:
        return False
    if filename is not None and occurrence_filename_key(filename, row, "imported") is None:
        return False
    return _eligible(row, provenance["board_generated_at"], value["recovery_reason"])


def _eligible(row: dict[str, Any], board_at: str, reason: str) -> bool:
    if not _board_row_shape(row) or not rfc3339(board_at):
        return False
    decay_at = row["decay_at"]
    if reason == "historical_board_expired":
        return row["stale"] is True and decay_at <= board_at
    if reason == "latest_board_current":
        return row["stale"] is False and decay_at > board_at
    return False


def _git(repo: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(repo), *args], check=False, text=True,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or f"git {' '.join(args)} failed")
    return result.stdout


@dataclass(frozen=True)
class Observation:
    commit: str
    board_generated_at: str
    row: dict[str, Any]
    latest: bool


def read_history(repo: Path, history_ref: str) -> tuple[str, dict[tuple[str, str, str, str], list[Observation]]]:
    commits = [line for line in _git(
        repo, "log", "--format=%H", history_ref, "--", SOURCE_PATH,
    ).splitlines() if line]
    if not commits:
        raise RuntimeError(f"no committed history for {SOURCE_PATH}")
    if any(COMMIT_RE.fullmatch(commit) is None for commit in commits):
        raise RuntimeError("git returned a non-canonical source commit")
    observations: dict[tuple[str, str, str, str], list[Observation]] = {}
    latest_commit = commits[0]
    for commit in commits:
        raw = _git(repo, "show", f"{commit}:{SOURCE_PATH}")
        try:
            board = json.loads(raw)
        except json.JSONDecodeError:
            continue
        board_at = board.get("generated_at") if isinstance(board, dict) else None
        rows = board.get("ideas") if isinstance(board, dict) else None
        if not rfc3339(board_at) or not isinstance(rows, list):
            continue
        for raw_row in rows:
            if not isinstance(raw_row, dict):
                continue
            key = occurrence_key(raw_row)
            if key is None:
                continue
            observations.setdefault(key, []).append(Observation(
                commit=commit, board_generated_at=board_at, row=raw_row, latest=commit == latest_commit,
            ))
    return latest_commit, observations


def _read_json(path: Path) -> object | None:
    # Pure resolver with a documented None-on-failure contract: every caller treats None exactly like a
    # missing/corrupt row (see _active_keys, _manifest above). `path.read_text(encoding="utf-8")` can raise
    # UnicodeDecodeError (a ValueError subclass) on invalid UTF-8 bytes, which is just as much "this file is
    # not readable as our data" as an OSError or a JSONDecodeError -- catch broadly so a malformed byte
    # sequence degrades to the same safe fallback instead of aborting the whole recovery walk.
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def _active_keys(repo: Path) -> set[tuple[str, str, str, str]]:
    keys: set[tuple[str, str, str, str]] = set()
    directory = repo / IDEAS_REL
    if not directory.is_dir():
        return keys
    for path in sorted(directory.glob("*.json")):
        row = _read_json(path)
        key = occurrence_key(row) if isinstance(row, dict) else None
        if key is not None:
            keys.add(key)
    return keys


def _manifest(repo: Path) -> dict[str, Any] | None:
    path = repo / ARCHIVE_REL / MANIFEST_NAME
    if not path.exists():
        return None
    value = _read_json(path)
    if (not isinstance(value, dict) or value.get("schema_version") != MANIFEST_SCHEMA
            or value.get("source_path") != SOURCE_PATH or not isinstance(value.get("occurrences"), list)):
        raise RuntimeError(f"invalid recovery manifest: {path}")
    for entry in value["occurrences"]:
        if (not isinstance(entry, dict) or entry.get("decision") not in DECISIONS
                or occurrence_key(entry) is None):
            raise RuntimeError(f"invalid recovery manifest occurrence: {path}")
    return value


def _evidence(obs: Observation) -> dict[str, str]:
    return {
        "source_commit": obs.commit,
        "board_generated_at": obs.board_generated_at,
        "source_row_sha256": canonical_sha256(obs.row),
    }


def _entry(key: tuple[str, str, str, str], decision: str, reason: str,
           obs: Observation | None, eligibility: str | None = None,
           present_in_latest_board: bool = False) -> dict[str, Any]:
    idea_id, version, started, direction = key
    return {
        "idea_id": idea_id,
        "idea_version": version,
        "idea_version_started_at": started,
        "direction": direction,
        "decision": decision,
        "reason": reason,
        "recovery_eligibility": eligibility,
        "present_in_latest_board": present_in_latest_board,
        "evidence": _evidence(obs) if obs else None,
    }


def _existing_archive_decision(archive_dir: Path, key: tuple[str, str, str, str]) -> tuple[str, str] | None:
    for kind in ("withdrawn", "expired", "imported"):
        path = archive_dir / occurrence_filename(key, kind)
        try:
            os.lstat(path)
        except FileNotFoundError:
            continue
        except OSError as error:
            raise RuntimeError(f"refusing unreadable archive occurrence lookup: {path}") from error
        value = _read_json(path)
        if not isinstance(value, dict):
            raise RuntimeError(f"refusing to coexist with unreadable archive occurrence: {path}")
        schema = value.get("schema_version")
        expected = {"withdrawn": "idea-archive-suppression/v1", "expired": "idea-archive/v1",
                    "imported": RECOVERY_SCHEMA}[kind]
        if schema != expected:
            raise RuntimeError(f"archive kind/schema mismatch: {path}")
        if kind == "withdrawn":
            return "suppressed", "existing_withdrawal_suppression"
        return "imported", "existing_archive_record"
    return None


def recovery_record(obs: Observation, reason: str) -> dict[str, Any]:
    return {
        "schema_version": RECOVERY_SCHEMA,
        "recovered_at": obs.board_generated_at,
        "recovery_reason": reason,
        "provenance": {
            "source_path": SOURCE_PATH,
            **_evidence(obs),
        },
        "board_row": obs.row,
    }


def zero_retention() -> dict[str, Any]:
    return {
        "schema_version": "idea-archive-retention/v1",
        "evicted_count": 0,
        "side_counts": {"long": {"evicted_count": 0}, "short": {"evicted_count": 0}},
        "pending_evictions": [],
    }


def valid_retention(value: object) -> bool:
    return (isinstance(value, dict) and value.get("schema_version") == "idea-archive-retention/v1"
            and isinstance(value.get("evicted_count"), int) and value["evicted_count"] >= 0
            and isinstance(value.get("side_counts"), dict)
            and all(isinstance(value["side_counts"].get(side), dict)
                    and isinstance(value["side_counts"][side].get("evicted_count"), int)
                    and value["side_counts"][side]["evicted_count"] >= 0
                    for side in ("long", "short"))
            and isinstance(value.get("pending_evictions"), list)
            and all(isinstance(name, str)
                    and (parts := occurrence_filename_parts(name)) is not None
                    and parts[4] != "withdrawn"
                    for name in value["pending_evictions"]))


def plan_recovery(repo: Path, history_ref: str = "HEAD") -> tuple[dict[str, Any], dict[Path, dict[str, Any]]]:
    latest_commit, observations = read_history(repo, history_ref)
    previous = _manifest(repo)
    previous_by_key = {
        occurrence_key(entry): entry for entry in (previous or {}).get("occurrences", [])
    }
    active = _active_keys(repo)
    archive_dir = repo / ARCHIVE_REL
    entries: list[dict[str, Any]] = []
    writes: dict[Path, dict[str, Any]] = {}

    for key in sorted(observations):
        if key in previous_by_key:
            entries.append(previous_by_key[key])
            continue
        obs_list = observations[key]
        latest_obs = next((obs for obs in obs_list if obs.latest), None)
        present_in_latest = latest_obs is not None
        eligible_obs: Observation | None = None
        recovery_reason: str | None = None
        if latest_obs and _eligible(latest_obs.row, latest_obs.board_generated_at, "latest_board_current"):
            eligible_obs, recovery_reason = latest_obs, "latest_board_current"
        else:
            expired = [obs for obs in obs_list
                       if _eligible(obs.row, obs.board_generated_at, "historical_board_expired")]
            if expired:
                eligible_obs = min(expired, key=lambda obs: (obs.board_generated_at, obs.commit))
                recovery_reason = "historical_board_expired"

        path = archive_dir / occurrence_filename(key, "imported")
        existing = _existing_archive_decision(archive_dir, key)
        if existing:
            entries.append(_entry(key, existing[0], existing[1], eligible_obs, recovery_reason,
                                  present_in_latest))
            continue
        if key in active:
            entries.append(_entry(key, "active", "exact_occurrence_in_strict_store", eligible_obs,
                                  recovery_reason, present_in_latest))
            continue
        if eligible_obs is None or recovery_reason is None:
            if any(obs.row.get("status") == "promoted" or obs.row.get("promoted_signal_id") is not None
                     for obs in obs_list):
                reason = "promoted_occurrence"
            elif any(not _wire_lineage(obs.row) for obs in obs_list):
                reason = "non_wire_lineage"
            else:
                reason = "no_committed_expiry_evidence"
            entries.append(_entry(key, "skipped", reason, latest_obs or obs_list[0],
                                  present_in_latest_board=present_in_latest))
            continue
        entries.append(_entry(key, "imported", recovery_reason, eligible_obs, recovery_reason,
                              present_in_latest))
        writes[path] = recovery_record(eligible_obs, recovery_reason)

    # Keep manifest-only decisions even when a later history ref no longer reaches their source commit.
    for key, entry in previous_by_key.items():
        if key not in observations:
            entries.append(entry)
    entries.sort(key=lambda entry: (entry["idea_id"], entry["idea_version"],
                                    entry["idea_version_started_at"], entry["direction"]))
    manifest = {
        "schema_version": MANIFEST_SCHEMA,
        "source_path": SOURCE_PATH,
        "history_head": latest_commit,
        "scope": {"latest_board": ["long", "short", "pair"],
                  "historical_expired": ["long", "short", "pair"]},
        "occurrences": entries,
    }
    return manifest, writes


def _fsync_dir(dir_path: Path) -> None:
    # Directory fsync (fsync the *directory* fd so a rename/link into it survives a crash) is a POSIX-only
    # durability step. Windows has no directory file descriptors: os.open() on a directory there raises
    # PermissionError, so every one of this module's directory-fsync call sites goes through this guard
    # instead of duplicating the os.name check four times.
    if os.name == "nt":
        return
    dir_fd = os.open(dir_path, os.O_RDONLY)
    try:
        os.fsync(dir_fd)
    finally:
        os.close(dir_fd)


def _write_new(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = (canonical_json(value) + "\n").encode("utf-8")
    if path.exists():
        if path.read_bytes() == payload:
            return
        raise RuntimeError(f"refusing to overwrite existing archive occurrence: {path}")
    temp = path.parent / f".{path.name}.tmp.{os.getpid()}"
    fd = os.open(temp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o644)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.link(temp, path)  # atomic no-replace publication
        _fsync_dir(path.parent)
    finally:
        try:
            temp.unlink()
        except FileNotFoundError:
            pass


def _write_manifest(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = (canonical_json(value) + "\n").encode("utf-8")
    temp = path.parent / f".{path.name}.tmp.{os.getpid()}"
    fd = os.open(temp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o644)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp, path)
        _fsync_dir(path.parent)
    finally:
        try:
            temp.unlink()
        except FileNotFoundError:
            pass


def _write_marker(path: Path) -> None:
    if path.exists():
        return
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        os.write(fd, RETENTION_MARKER)
        os.fsync(fd)
    finally:
        os.close(fd)
    _fsync_dir(path.parent)


def ensure_retention_metadata(repo: Path) -> None:
    archive_dir = repo / ARCHIVE_REL
    if not archive_dir.exists():
        archive_dir.mkdir(parents=True)
        _fsync_dir(archive_dir.parent)
    retention_path = archive_dir / RETENTION_NAME
    if retention_path.exists():
        value = _read_json(retention_path)
        if not valid_retention(value):
            raise RuntimeError(f"refusing recovery with invalid retention metadata: {retention_path}")
    else:
        _write_new(retention_path, zero_retention())
    _write_marker(archive_dir / RETENTION_REQUIRED_NAME)


def counts(manifest: dict[str, Any], writes: dict[Path, dict[str, Any]]) -> dict[str, int]:
    result = {decision: 0 for decision in sorted(DECISIONS)}
    for entry in manifest["occurrences"]:
        result[entry["decision"]] += 1
    result["records_to_write"] = len(writes)
    result["historical_long_ids"] = len({
        entry["idea_id"] for entry in manifest["occurrences"]
        if entry["direction"] in {"long", "pair"}
        and entry.get("recovery_eligibility") == "historical_board_expired"
        and entry["decision"] in {"active", "imported"}
    })
    result["pruned_historical_long_ids"] = len({
        entry["idea_id"] for entry in manifest["occurrences"]
        if entry["direction"] in {"long", "pair"}
        and entry.get("recovery_eligibility") == "historical_board_expired"
        and entry["decision"] in {"active", "imported"}
        and entry.get("present_in_latest_board") is False
    })
    result["latest_current"] = sum(entry.get("recovery_eligibility") == "latest_board_current"
                                   and entry["decision"] in {"active", "imported"}
                                   for entry in manifest["occurrences"])
    return result


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="write records and advance the manifest")
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--history-ref", default="HEAD")
    args = parser.parse_args(argv)
    repo = args.repo_root.resolve()
    try:
        _managed_names, archive_overflow, _archive_missing = bounded_managed_archive_names(
            repo / ARCHIVE_REL, IDEA_ARCHIVE_MAX_FILES_READ,
            IDEA_ARCHIVE_MAX_DIRECTORY_ENTRIES_READ,
        )
        # Refuse the write mode before probing occurrence siblings.  On overflow an unseen withdrawal
        # can own any historical occurrence, so the administrator must repair the store first.
        if args.write and archive_overflow:
            raise RuntimeError(
                f"refusing recovery writes: managed archive exceeds the "
                f"{IDEA_ARCHIVE_MAX_FILES_READ}-file read bound"
            )
        manifest, writes = plan_recovery(repo, args.history_ref)
        summary = counts(manifest, writes)
        summary["archive_overflow"] = int(archive_overflow)
        if args.write:
            ensure_recovery_write_capacity(_managed_names, writes)
            # Recovery establishes the retention invariant before publishing any managed occurrence.
            # A later failure leaves no manifest advance; a rerun safely completes the same plan.
            ensure_retention_metadata(repo)
            for path, value in sorted(writes.items(), key=lambda item: str(item[0])):
                _write_new(path, value)
            _write_manifest(repo / ARCHIVE_REL / MANIFEST_NAME, manifest)
        mode = "WROTE" if args.write else "DRY RUN"
        print(f"{mode} idea board recovery: " + ", ".join(
            f"{key}={value}" for key, value in summary.items()
        ))
        return 0
    except (OSError, RuntimeError, ValueError) as error:
        print(f"idea board recovery failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
