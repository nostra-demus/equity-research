#!/usr/bin/env python3
"""Freeze a final commodity decision, then atomically update its current projection."""
from __future__ import annotations

import argparse
import copy
import datetime as dt
import hashlib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

from commodity_forecast_contract import production_coverage_resolver, validate_decision_record
from commodity_evidence_links import validate_signal_projection
from commodity_profile_coverage import PROFILE_PATH, profile_family, structured_profile
from repo_mutation import atomic_write_json, atomic_write_text


class ArchiveError(RuntimeError):
    pass


COMMODITY_ID_RE = re.compile(r"^[A-Z0-9]+(?:[-_][A-Z0-9]+)*$")


def _validate_prearchive(record: dict[str, Any], *, enforce_live_roster: bool) -> None:
    """Run the independent schema/v2/live-route gate before any immutable write.

    A subprocess keeps the archive helper and the repository's broad validator dependency-neutral:
    validate_screener_json imports `decision_id_for` for archive replay, so importing it back here would
    create a circular module graph. The dedicated CLI excludes archive-existence checks by design.
    """
    validator = Path(__file__).with_name("validate_screener_json.py")
    # Validate a private serialization of the exact in-memory object later hashed and archived. Never
    # point the subprocess back at mutable `decision_record.json`: a concurrent writer could swap those
    # bytes between this function's initial read and the validator's read (TOCTOU).
    with tempfile.TemporaryDirectory(prefix="commodity-prearchive-") as temporary:
        candidate = Path(temporary) / "decision_record.json"
        try:
            candidate.write_text(
                json.dumps(record, ensure_ascii=False, allow_nan=False) + "\n", encoding="utf-8"
            )
        except (OSError, TypeError, ValueError) as error:
            raise ArchiveError(f"pre-archive candidate cannot be serialized safely: {error}") from error
        command = [sys.executable, str(validator), "--commodity-prearchive"]
        if not enforce_live_roster:
            command.append("--frozen-only")
        command.append(str(candidate))
        result = subprocess.run(
            command,
            cwd=str(Path(__file__).resolve().parent.parent),
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
        )
    if result.returncode != 0:
        detail = " ".join(line.strip() for line in result.stdout.splitlines() if line.strip())
        raise ArchiveError(f"pre-archive decision contract failed: {detail[:1000] or 'validator failed without output'}")


def _canonical_without_id(record: dict[str, Any]) -> bytes:
    payload = copy.deepcopy(record)
    payload.pop("decision_id", None)
    return json.dumps(
        payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False
    ).encode("utf-8")


def decision_id_for(record: dict[str, Any]) -> str:
    commodity = record.get("commodity")
    decision_date = record.get("decision_date")
    if not isinstance(commodity, str) or COMMODITY_ID_RE.fullmatch(commodity) is None:
        raise ArchiveError("commodity must be a non-empty uppercase identifier")
    try:
        if len(decision_date) != 10:
            raise ValueError
        parts = [int(part) for part in decision_date.split("-")]
        if len(parts) != 3:
            raise ValueError
        dt.date(*parts)
    except (AttributeError, TypeError, ValueError):
        raise ArchiveError("decision_date must be a real YYYY-MM-DD date") from None
    digest = hashlib.sha256(_canonical_without_id(record)).hexdigest()[:12]
    return f"CMD-{commodity}-{decision_date}-{digest}"


def _create_or_verify(path: Path, value: Any, label: str) -> bool:
    created = atomic_write_json(str(path), value, create_only=True)
    if created:
        return True
    try:
        existing = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ArchiveError(f"existing archived {label} is unreadable: {path}: {error}") from error
    if existing != value:
        raise ArchiveError(f"immutable {label} collision at {path}")
    return False


def _create_or_verify_text(path: Path, value: str, label: str) -> bool:
    created = atomic_write_text(str(path), value, create_only=True)
    if created:
        return True
    try:
        existing = path.read_text(encoding="utf-8")
    except OSError as error:
        raise ArchiveError(f"existing archived {label} is unreadable: {path}: {error}") from error
    if existing != value:
        raise ArchiveError(f"immutable {label} collision at {path}")
    return False


def archive_decision(run_root: Path) -> tuple[str, Path, bool]:
    """Create the immutable snapshot before replacing the current UI projection."""
    run_root = run_root.resolve()
    current = run_root / "decision_record.json"
    try:
        record = json.loads(current.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise ArchiveError(f"missing current decision record: {current}") from None
    except (OSError, json.JSONDecodeError) as error:
        raise ArchiveError(f"cannot read current decision record: {error}") from error
    if not isinstance(record, dict):
        raise ArchiveError("decision_record.json must contain a JSON object")
    if record.get("swarm") != "commodity":
        raise ArchiveError("decision_record.json is not a commodity record")
    if record.get("commodity") != run_root.name:
        raise ArchiveError("record commodity does not match the run folder")
    # An exact already-published projection may be retried after an orb is renamed. Preserve that
    # recovery/idempotence guarantee without creating a bypass: live routing is skipped only when the
    # caller-supplied decision_id is content-valid AND its immutable archive already exists and is byte-
    # semantically identical. Fresh/unmatched records always face today's roster.
    exact_existing_archive = False
    supplied_id = record.get("decision_id")
    if isinstance(supplied_id, str):
        try:
            content_id = decision_id_for(record)
        except ArchiveError:
            content_id = ""
        candidate_archive = run_root / "decisions" / supplied_id / "decision_record.json"
        if supplied_id == content_id:
            try:
                exact_existing_archive = json.loads(candidate_archive.read_text(encoding="utf-8")) == record
            except (OSError, json.JSONDecodeError):
                exact_existing_archive = False
    _validate_prearchive(record, enforce_live_roster=not exact_existing_archive)
    coverage = None
    coverage_text = None
    # The dual-horizon contract began on 2026-08-10. Required-series coverage has its own
    # one-day-later cutover inside validate_decision_record, so an Aug-10 decision is still fully
    # checked while legitimately carrying no coverage artifact.
    if isinstance(record.get("decision_date"), str) and record["decision_date"] >= "2026-08-10":
        coverage = None
        coverage_sha256 = None
        coverage_path = run_root / "required_series_coverage.json"
        try:
            coverage_raw = coverage_path.read_bytes()
            coverage_text = coverage_raw.decode("utf-8")
            coverage = json.loads(coverage_text)
            coverage_sha256 = "sha256:" + hashlib.sha256(coverage_raw).hexdigest()
        except FileNotFoundError:
            pass
        except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
            raise ArchiveError(f"required-series coverage artifact is unreadable: {error}") from error
        try:
            requirements = structured_profile(str(record.get("commodity", "")), profile_path=PROFILE_PATH)
        except (OSError, ValueError):
            requirements = None
        contract_errors = validate_decision_record(
            record, coverage, coverage_sha256, requirements, production_coverage_resolver,
        )
        if contract_errors:
            raise ArchiveError(f"forecast contract failed: {contract_errors[0]}")
        try:
            expected_family = profile_family(str(record.get("commodity", "")))
        except ValueError as error:
            raise ArchiveError(f"commodity family cannot be resolved: {error}") from error
        if record.get("commodity_family") != expected_family:
            raise ArchiveError("decision commodity_family does not match its structured profile")

    graph = None
    graph_text = None
    if isinstance(record.get("forecast_horizons"), dict):
        graph_path = run_root / "signal_evidence.json"
        try:
            graph_raw = graph_path.read_bytes()
            graph_text = graph_raw.decode("utf-8")
            graph = json.loads(graph_text)
        except FileNotFoundError:
            raise ArchiveError("signal_evidence.json is required before archiving a dual-horizon decision") from None
        except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
            raise ArchiveError(f"signal evidence graph is unreadable: {error}") from error
        actual_digest = "sha256:" + hashlib.sha256(graph_raw).hexdigest()
        projection_errors = validate_signal_projection(record, graph, actual_digest)
        if projection_errors:
            raise ArchiveError(f"signal evidence projection failed: {projection_errors[0]}")

    decision_id = decision_id_for(record)
    archived_record = copy.deepcopy(record)
    archived_record["decision_id"] = decision_id
    archive_root = run_root / "decisions" / decision_id
    archive_path = archive_root / "decision_record.json"
    # Evidence-first: a decision snapshot is never published without the exact graph and coverage
    # artifacts that made its evidence links and sufficiency gate auditable.
    if graph_text is not None:
        _create_or_verify_text(archive_root / "signal_evidence.json", graph_text, "signal evidence graph")
    if coverage_text is not None:
        _create_or_verify_text(archive_root / "required_series_coverage.json", coverage_text, "required-series coverage")
    created = _create_or_verify(archive_path, archived_record, "decision record")

    # Archive-first publication: after a crash the UI may remain on its earlier projection, but it can
    # never point to a decision whose immutable snapshot does not exist.
    atomic_write_json(str(current), archived_record)
    return decision_id, archive_path, created


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("run_root", type=Path)
    args = parser.parse_args()
    try:
        decision_id, path, created = archive_decision(args.run_root)
    except ArchiveError as error:
        print(f"ARCHIVE-FAIL: {error}")
        return 1
    print(
        f"DECISION-ARCHIVE: id={decision_id} path={path} "
        f"status={'created' if created else 'already-identical'}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
