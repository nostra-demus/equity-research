#!/usr/bin/env python3
"""Freeze a final commodity decision, then atomically update its current projection."""
from __future__ import annotations

import argparse
import copy
import datetime as dt
import hashlib
import json
from pathlib import Path
from typing import Any

from commodity_forecast_contract import validate_decision_record
from repo_mutation import atomic_write_json


class ArchiveError(RuntimeError):
    pass


def _canonical_without_id(record: dict[str, Any]) -> bytes:
    payload = copy.deepcopy(record)
    payload.pop("decision_id", None)
    return json.dumps(
        payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False
    ).encode("utf-8")


def decision_id_for(record: dict[str, Any]) -> str:
    commodity = record.get("commodity")
    decision_date = record.get("decision_date")
    if not isinstance(commodity, str) or not commodity or not commodity.replace("_", "").isalnum():
        raise ArchiveError("commodity must be a non-empty uppercase identifier")
    if commodity != commodity.upper():
        raise ArchiveError("commodity must be uppercase")
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
    if isinstance(record.get("decision_date"), str) and record["decision_date"] >= "2026-08-10":
        contract_errors = validate_decision_record(record)
        if contract_errors:
            raise ArchiveError(f"forecast contract failed: {contract_errors[0]}")

    decision_id = decision_id_for(record)
    archived_record = copy.deepcopy(record)
    archived_record["decision_id"] = decision_id
    archive_path = run_root / "decisions" / decision_id / "decision_record.json"
    created = atomic_write_json(str(archive_path), archived_record, create_only=True)
    if not created:
        try:
            existing = json.loads(archive_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise ArchiveError(f"existing archive is unreadable: {archive_path}: {error}") from error
        if existing != archived_record:
            raise ArchiveError(f"immutable decision ID collision at {archive_path}")

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
