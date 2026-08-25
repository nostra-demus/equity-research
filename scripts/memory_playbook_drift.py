#!/usr/bin/env python3
"""Fail closed on prompt/playbook authority drift without exposing protected procedure text."""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sqlite3
from pathlib import Path
from typing import Any, Mapping, Sequence

from memory_procedural import playbook_prompt_files
from memory_profiles import isolated_agent_files, research_agent_files, validate_repository
from memory_projection import verify_projection
from memory_runtime import _safe_regular
from memory_three_layer_contract import validate_contract


REF_LINE = re.compile(r"^playbook_refs:\s*\[(?P<refs>[^]]*)]$")
REF = re.compile(r"playbook_[0-9a-f-]{36}@[1-9][0-9]*")
NEGATION = re.compile(r"\b(?:cannot|can't|may not|must not|never|no)\b", re.IGNORECASE)
POSITIVE_LIFT = re.compile(
    r"\bmemory\b.{0,100}\b(?:raise|raises|increase|increases|lift|lifts)\b.{0,80}"
    r"\b(?:confidence|rating|edge|data sufficiency|position size)\b",
    re.IGNORECASE,
)
CURRENT_EVIDENCE = re.compile(
    r"\bmemory\b.{0,80}\b(?:is|serves as|counts as|proves)\b.{0,50}\bcurrent evidence\b",
    re.IGNORECASE,
)


class DriftError(ValueError):
    pass


def _as_of(value: str) -> dt.datetime:
    parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise DriftError("playbook-drift-as-of-must-be-aware")
    return parsed.astimezone(dt.timezone.utc)


def _refs(path: Path) -> set[str]:
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0] != "---":
        raise DriftError(f"{path}: missing YAML frontmatter")
    try:
        end = lines.index("---", 1)
    except ValueError as exc:
        raise DriftError(f"{path}: unterminated YAML frontmatter") from exc
    matches = [REF_LINE.fullmatch(line) for line in lines[1:end] if line.startswith("playbook_refs:")]
    if len(matches) > 1 or (matches and matches[0] is None):
        raise DriftError(f"{path}: playbook_refs must be one closed inline list")
    if not matches:
        return set()
    values = {item.strip() for item in matches[0].group("refs").split(",") if item.strip()}
    if not values or any(REF.fullmatch(item) is None for item in values):
        raise DriftError(f"{path}: playbook_refs contains an invalid ID/version")
    return values


def _events_from_projection(path: Path, *, digest: str, as_of: str) -> list[dict]:
    expected = digest.removeprefix("sha256:")
    verify_projection(path, expected_digest=expected)
    connection = sqlite3.connect(
        f"{path.resolve().as_uri()}?mode=ro&immutable=1", uri=True,
    )
    try:
        rows = connection.execute(
            "SELECT canonical_event FROM events WHERE system_time <= ? "
            "ORDER BY system_time,event_id", (as_of,),
        ).fetchall()
    finally:
        connection.close()
    return [json.loads(row[0]) for row in rows]


def _active_playbooks(events: Sequence[Mapping[str, Any]], *, as_of: str) -> list[dict]:
    superseded = {
        target for event in events
        if event.get("event_type") in {"playbook.activated", "playbook.status-changed"}
        for target in event.get("supersedes", [])
    }
    clock = _as_of(as_of)
    active: list[dict] = []
    for event in events:
        payload = event.get("payload") if isinstance(event, Mapping) else None
        if (
            event.get("event_type") != "playbook.activated"
            or event.get("event_id") in superseded
            or not isinstance(payload, Mapping)
            or payload.get("status") != "active"
        ):
            continue
        errors = validate_contract(payload)
        if errors:
            raise DriftError("active-playbook-contract-invalid: " + "; ".join(errors[:8]))
        expires = _as_of(str(payload["expires_at"]))
        if expires <= clock:
            continue
        active.append(dict(payload))
    return active


def load_playbooks(
    *, file: Path | None = None, projection: Path | None = None,
    projection_digest: str | None = None, as_of: str | None = None,
) -> list[dict]:
    if file is not None:
        value = json.loads(_safe_regular(file))
        if not isinstance(value, list) or any(not isinstance(item, dict) for item in value):
            raise DriftError("playbook-drift-file-must-be-an-object-array")
        for item in value:
            errors = validate_contract(item)
            if errors or item.get("schema") != "memory-playbook/v1" or item.get("status") != "active":
                raise DriftError("playbook-drift-file-contains-nonactive-or-invalid-record")
        return value
    if projection is not None:
        if projection_digest is None or as_of is None:
            raise DriftError("projection drift check requires digest and as-of")
        return _active_playbooks(
            _events_from_projection(projection, digest=projection_digest, as_of=as_of),
            as_of=as_of,
        )
    return []


def validate_drift(root: Path, playbooks: Sequence[Mapping[str, Any]]) -> list[str]:
    errors = list(validate_repository(root))
    analytical = research_agent_files(root)
    isolated = isolated_agent_files(root)
    refs_by_path: dict[Path, set[str]] = {}
    for path in [*analytical, *isolated]:
        try:
            refs_by_path[path] = _refs(path)
        except (OSError, UnicodeError, DriftError) as exc:
            errors.append(str(exc))
    for path in isolated:
        if refs_by_path.get(path):
            errors.append(f"{path}: memory-isolated agent cannot reference a playbook")

    active_refs = {
        f"{playbook['playbook_id']}@{playbook['version']}" for playbook in playbooks
    }
    if playbooks:
        for path in analytical:
            for stale in sorted(refs_by_path.get(path, set()) - active_refs):
                errors.append(f"{path}: stale or unauthorized playbook reference {stale}")

    for playbook in playbooks:
        ref = f"{playbook['playbook_id']}@{playbook['version']}"
        try:
            applicable = playbook_prompt_files(root, playbook)
        except (OSError, UnicodeError, ValueError) as exc:
            errors.append(str(exc))
            continue
        operations = [
            str(step["operation"]).strip().casefold()
            for step in playbook["playbook"]["steps"]
            if len(str(step.get("operation", "")).strip()) >= 20
        ]
        for path in applicable:
            if ref not in refs_by_path.get(path, set()):
                errors.append(f"{path}: missing authoritative playbook reference {ref}")
            prompt = path.read_text(encoding="utf-8").casefold()
            for operation in operations:
                if operation in prompt:
                    errors.append(
                        f"{path}: duplicates detailed procedure text from {ref}"
                    )

    for path in analytical:
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as exc:
            errors.append(str(exc))
            continue
        for sentence in re.split(r"(?<=[.!?])\s+|\n+", text):
            if NEGATION.search(sentence):
                continue
            if POSITIVE_LIFT.search(sentence):
                errors.append(f"{path}: claims memory can create a positive analytical lift")
            if CURRENT_EVIDENCE.search(sentence):
                errors.append(f"{path}: claims memory can serve as current evidence")
    return sorted(set(errors))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--active-playbooks", type=Path)
    source.add_argument("--projection", type=Path)
    parser.add_argument("--projection-digest")
    parser.add_argument("--as-of")
    args = parser.parse_args()
    try:
        playbooks = load_playbooks(
            file=args.active_playbooks, projection=args.projection,
            projection_digest=args.projection_digest, as_of=args.as_of,
        )
        errors = validate_drift(args.root.resolve(), playbooks)
    except (OSError, UnicodeError, ValueError, json.JSONDecodeError) as exc:
        errors = [str(exc)]
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    print(f"validated prompt authority against {len(playbooks)} active playbooks")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
