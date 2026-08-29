#!/usr/bin/env python3
"""Contract tests for evidence-driven commodity module invalidation."""
from __future__ import annotations

import tempfile
from pathlib import Path

from commodity_evidence_delta import discover_owner_modules, evidence_delta
from commodity_profile_coverage import STRUCTURED_PROFILE_ROOT, structured_profile


def row(need: str, owner: str, vintage: str, status: str = "usable") -> dict:
    return {
        "need_id": need, "owner_orb": owner, "status": status,
        "as_of": "2026-08-29", "vintage_id": vintage,
        "dataset_id": "dataset", "connector_id": "connector", "provider": "provider",
    }


with tempfile.TemporaryDirectory() as temporary:
    repo = Path(temporary)
    macro = repo / ".claude/agents/commodity/macro-positioning/01_macro.md"
    thesis = repo / ".claude/agents/commodity/commodity-thesis/02_commodity-cost-curve-fair-value.md"
    macro.parent.mkdir(parents=True)
    thesis.parent.mkdir(parents=True)
    macro.write_text("---\nname: commodity-macro-drivers\n---\n", encoding="utf-8")
    thesis.write_text("---\nname: commodity-cost-curve\n---\n", encoding="utf-8")
    owners = discover_owner_modules(repo)
    assert owners["commodity-macro-drivers"] == "macro-positioning"
    assert owners["commodity-cost-curve-fair-value"] == "commodity-thesis"

    previous = {"rows": [
        row("macro", "commodity-macro-drivers", "sha256:" + "a" * 64),
        row("value", "commodity-cost-curve-fair-value", "sha256:" + "b" * 64),
    ]}
    current = {"commodity": "COPPER", "decision_time": "2026-08-30T00:00:00Z", "rows": [
        row("macro", "commodity-macro-drivers", "sha256:" + "c" * 64),
        row("value", "commodity-cost-curve-fair-value", "sha256:" + "b" * 64),
    ]}
    delta = evidence_delta(previous, current, owners)
    assert delta["changed_need_ids"] == ["macro"]
    assert delta["owner_orbs"] == ["commodity-macro-drivers"]
    assert delta["modules"] == ["macro-positioning"]

    first = evidence_delta(None, current, owners)
    assert first["modules"] == ["commodity-thesis", "macro-positioning"]
    removed = evidence_delta(previous, {**current, "rows": current["rows"][:1]}, owners)
    assert removed["removed_need_ids"] == ["value"]
    assert removed["modules"] == ["commodity-thesis", "macro-positioning"]
    profile_changed = evidence_delta(
        {**previous, "profile_snapshot_sha256": "sha256:" + "d" * 64},
        {**current, "profile_snapshot_sha256": "sha256:" + "e" * 64},
        owners,
    )
    assert profile_changed["profile_changed"] is True
    assert profile_changed["modules"] == ["commodity-thesis", "macro-positioning"]

real_owners = discover_owner_modules()
profile_owners = {
    requirement["owner"]
    for profile in STRUCTURED_PROFILE_ROOT.glob("*.json")
    for requirement in structured_profile(profile.stem)
}
assert profile_owners <= set(real_owners)

full_command = (
    Path(__file__).resolve().parents[1] / ".claude/commands/commodity/full.md"
).read_text(encoding="utf-8")
assert 'mkdir -p "commodity/runs/<COMMODITY>" "data/<COMMODITY>"' in full_command
assert "commodity_evidence_delta.py" in full_command
assert full_command.count("refresh-swarm-pulse.sh commodity") == 1
assert '--decision-time "$PREFLIGHT_TIME"' in full_command

print("PASS: changed evidence invalidates its owning commodity modules")
