#!/usr/bin/env python3
"""Map decision-time commodity evidence changes to modules that must rerun."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

from commodity_profile_coverage import REPO, compile_coverage


ROW_IDENTITY_FIELDS = (
    "series_id", "owner_orb", "required_history_freshness", "lawful_source_policy",
    "status", "as_of", "vintage_id", "dataset_id", "connector_id", "provider",
)


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


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("run_root", type=Path)
    parser.add_argument("--decision-time", required=True)
    args = parser.parse_args()
    try:
        run_root = args.run_root.resolve()
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
    except (OSError, RuntimeError, ValueError, json.JSONDecodeError) as error:
        print(f"EVIDENCE-DELTA-FAIL: {error}")
        return 1
    print(json.dumps(delta, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
