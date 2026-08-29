#!/usr/bin/env python3
"""Map decision-time commodity evidence changes to modules that must rerun."""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
from pathlib import Path
from typing import Any

from commodity_profile_coverage import REPO, compile_coverage
from repo_mutation import atomic_write_json


ROW_IDENTITY_FIELDS = (
    "series_id", "owner_orb", "required_history_freshness", "lawful_source_policy",
    "status", "as_of", "vintage_id", "dataset_id", "connector_id", "provider",
)
PREFLIGHT_STATE_NAME = "commodity_preflight_state.json"
PREFLIGHT_STATE_KEYS = {
    "schema_version", "commodity", "decision_time", "previous_coverage_found",
    "profile_changed", "changed_need_ids", "removed_need_ids", "owner_orbs", "modules",
}


def discover_owner_modules(repo: Path = REPO) -> dict[str, str]:
    """Discover profile owner aliases from agent names and zero-touch filenames."""
    owners: dict[str, str] = {}
    root = repo / ".claude" / "agents" / "commodity"
    for path in sorted(root.glob("*/[0-9][0-9]_*.md")):
        if path.name.startswith("99_"):
            continue
        text = path.read_text(encoding="utf-8")
        match = re.search(r"^name:\s*([^\s]+)\s*$", text, re.MULTILINE)
        aliases = {re.sub(r"^[0-9][0-9]_", "", path.stem)}
        if match:
            aliases.add(match.group(1))
        for alias in aliases:
            previous = owners.get(alias)
            if previous is not None and previous != path.parent.name:
                raise ValueError(f"owner alias {alias} maps to more than one commodity module")
            owners[alias] = path.parent.name
    if not owners:
        raise ValueError("no commodity owner orbs were discovered")
    return owners


def _rows(artifact: Any, *, label: str) -> dict[str, dict[str, Any]]:
    values = artifact.get("rows") if isinstance(artifact, dict) else None
    if not isinstance(values, list):
        raise ValueError(f"{label} coverage rows are missing")
    by_need: dict[str, dict[str, Any]] = {}
    for row in values:
        need = row.get("need_id") if isinstance(row, dict) else None
        if not isinstance(need, str) or not need or need in by_need:
            raise ValueError(f"{label} coverage need identities are invalid or duplicated")
        by_need[need] = row
    return by_need


def evidence_delta(
    previous: dict[str, Any] | None,
    current: dict[str, Any],
    owner_modules: dict[str, str],
) -> dict[str, Any]:
    """Return the smallest conservative module invalidation set."""
    current_rows = _rows(current, label="current")
    previous_rows = _rows(previous, label="previous") if previous is not None else {}
    changed = [
        need for need, row in current_rows.items()
        if need not in previous_rows or any(
            row.get(field) != previous_rows[need].get(field) for field in ROW_IDENTITY_FIELDS
        )
    ]
    removed = sorted(set(previous_rows) - set(current_rows))
    profile_changed = (
        previous is not None
        and previous.get("profile_snapshot_sha256") != current.get("profile_snapshot_sha256")
    )
    owner_orbs = sorted({str(current_rows[need].get("owner_orb")) for need in changed})
    if any(owner not in owner_modules for owner in owner_orbs):
        missing = sorted(owner for owner in owner_orbs if owner not in owner_modules)
        raise ValueError(f"coverage owner orbs do not map to modules: {', '.join(missing)}")
    modules = {owner_modules[owner] for owner in owner_orbs}
    if removed or profile_changed:
        modules.update(owner_modules.values())
    return {
        "schema_version": 1,
        "commodity": current.get("commodity"),
        "decision_time": current.get("decision_time"),
        "previous_coverage_found": previous is not None,
        "profile_changed": profile_changed,
        "changed_need_ids": sorted(changed),
        "removed_need_ids": removed,
        "owner_orbs": owner_orbs,
        "modules": sorted(modules),
    }


def _valid_sorted_strings(value: Any) -> bool:
    return (
        isinstance(value, list) and all(isinstance(item, str) and item for item in value)
        and value == sorted(set(value))
    )


def validate_preflight_state(
    value: Any, commodity: str, owner_modules: dict[str, str],
) -> dict[str, Any]:
    """Fail closed before a later shell trusts persisted orchestration state."""
    if not isinstance(value, dict) or set(value) != PREFLIGHT_STATE_KEYS:
        raise ValueError("commodity preflight state has an invalid shape")
    if (
        value.get("schema_version") != 1 or value.get("commodity") != commodity
        or not isinstance(value.get("previous_coverage_found"), bool)
        or not isinstance(value.get("profile_changed"), bool)
        or not all(_valid_sorted_strings(value.get(field)) for field in (
            "changed_need_ids", "removed_need_ids", "owner_orbs", "modules",
        ))
    ):
        raise ValueError("commodity preflight state has invalid fields")
    decision_time = value.get("decision_time")
    try:
        parsed = dt.datetime.fromisoformat(str(decision_time).replace("Z", "+00:00"))
    except ValueError as error:
        raise ValueError("commodity preflight decision time is invalid") from error
    if (
        not isinstance(decision_time, str) or not decision_time.endswith("Z")
        or parsed.tzinfo is None or parsed.utcoffset() != dt.timedelta(0)
    ):
        raise ValueError("commodity preflight decision time must be UTC")
    known_modules = set(owner_modules.values())
    if not set(value["owner_orbs"]) <= set(owner_modules) or not set(value["modules"]) <= known_modules:
        raise ValueError("commodity preflight state names an unknown owner or module")
    return value


def read_preflight_state(
    run_root: Path, owner_modules: dict[str, str] | None = None,
) -> dict[str, Any]:
    value = json.loads((run_root / PREFLIGHT_STATE_NAME).read_text(encoding="utf-8"))
    return validate_preflight_state(value, run_root.name.upper(), owner_modules or discover_owner_modules())


def write_preflight_state(run_root: Path, delta: dict[str, Any]) -> None:
    state = validate_preflight_state(delta, run_root.name.upper(), discover_owner_modules())
    atomic_write_json(str(run_root / PREFLIGHT_STATE_NAME), state)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("run_root", type=Path)
    parser.add_argument("--decision-time")
    parser.add_argument("--write-state", action="store_true")
    reads = parser.add_mutually_exclusive_group()
    reads.add_argument("--read-decision-time", action="store_true")
    reads.add_argument("--module-status")
    args = parser.parse_args()
    try:
        run_root = args.run_root.resolve()
        if args.read_decision_time or args.module_status:
            if args.decision_time or args.write_state:
                parser.error("state reads cannot compile or replace preflight state")
            state = read_preflight_state(run_root)
            if args.read_decision_time:
                print(state["decision_time"])
            else:
                if args.module_status not in set(discover_owner_modules().values()):
                    raise ValueError(f"unknown commodity module: {args.module_status}")
                print("RERUN:evidence-changed" if args.module_status in state["modules"] else "CLEAR")
            return 0
        if not args.decision_time:
            parser.error("--decision-time is required when compiling evidence delta")
        current = compile_coverage(
            commodity=run_root.name.upper(), decision_time=args.decision_time,
        )
        previous_path = run_root / "required_series_coverage.json"
        previous = (
            json.loads(previous_path.read_text(encoding="utf-8"))
            if previous_path.is_file() else None
        )
        if previous is not None and previous.get("commodity") != current.get("commodity"):
            raise ValueError("previous coverage commodity does not match the run root")
        delta = evidence_delta(previous, current, discover_owner_modules())
        if args.write_state:
            write_preflight_state(run_root, delta)
    except (OSError, RuntimeError, ValueError, json.JSONDecodeError) as error:
        print(f"EVIDENCE-DELTA-FAIL: {error}")
        return 1
    print(json.dumps(delta, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
