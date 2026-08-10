#!/usr/bin/env python3
"""Contract tests for the predictive-depth commodity orbs."""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


contracts = _load(
    "commodity_analytical_contracts", ROOT / "scripts/commodity_analytical_contracts.py"
)
evidence = _load(
    "commodity_signal_evidence", ROOT / "scripts/commodity_signal_evidence.py"
)


def test_supply_opacity_boundaries() -> None:
    high_coverage = contracts.assess_supply_opacity(69.99, 0, 0)
    high_dispersion = contracts.assess_supply_opacity(100, 15.01, 0)
    high_staleness = contracts.assess_supply_opacity(100, 0, 2.01)
    missing = contracts.assess_supply_opacity(None, 0, 0)
    assert all(row.level == "high" and row.score_cap == 45 for row in (
        high_coverage, high_dispersion, high_staleness, missing
    ))

    boundary = contracts.assess_supply_opacity(70, 15, 2)
    assert boundary.level == "medium" and boundary.score_cap == 65
    low = contracts.assess_supply_opacity(90, 7.99, 0)
    assert low.level == "low" and low.score_cap == 100
    assert contracts.capped_supply_demand_score(88, boundary) == 65
    assert contracts.capped_supply_demand_score(44, high_coverage) == 44
    print("PASS: supply opacity thresholds and score caps are deterministic and fail closed")


def test_orbs_are_discovered_without_engine_wiring() -> None:
    agents, family_owner = evidence.discover_owners(ROOT)
    expected = {
        "commodity-cross-asset-regime": {
            "real-assets-regime", "related-market-breadth", "producer-confirmation"
        },
        "commodity-volatility-distribution": {"volatility-regime", "tail-risk"},
    }
    for owner, families in expected.items():
        assert owner in agents, owner
        assert set(agents[owner]["families"]) == families
        assert all(family_owner[family] == owner for family in families)
    scenario = ROOT / ".claude/agents/commodity/commodity-thesis/03_commodity-scenario-engine.md"
    assert scenario.is_file() and "name: commodity-scenario-engine" in scenario.read_text()
    print("PASS: new orbs are convention-discovered; no central module registry changed")


def test_syntheses_require_the_new_orbs() -> None:
    required = {
        ROOT / ".claude/agents/commodity/market-structure/99_market-structure-synthesis.md":
            "03_commodity-volatility-distribution.md",
        ROOT / ".claude/agents/commodity/macro-positioning/99_macro-positioning-synthesis.md":
            "03_commodity-cross-asset-regime.md",
        ROOT / ".claude/agents/commodity/commodity-thesis/99_commodity-thesis-synthesis.md":
            "03_commodity-scenario-engine.md",
    }
    for path, upstream in required.items():
        assert upstream in path.read_text(encoding="utf-8"), f"{path}: missing {upstream}"
    print("PASS: module syntheses consume every new orb instead of leaving orphan analysis")


def test_predictive_depth_cannot_silently_regress() -> None:
    cross_asset = (ROOT / ".claude/agents/commodity/macro-positioning/03_commodity-cross-asset-regime.md").read_text()
    cross_asset_normalized = " ".join(cross_asset.lower().split())
    for lens in ("Gold/CPI", "Gold/equities", "Miners/Gold", "Silver/Gold", "Silver miners"):
        assert lens.lower() in cross_asset_normalized, lens

    volatility = (ROOT / ".claude/agents/commodity/market-structure/03_commodity-volatility-distribution.md").read_text()
    volatility_normalized = " ".join(volatility.lower().split())
    for anchor in (
        "point-in-time", "event-gap ledger", "10th/90th", "peak-to-trough drawdown",
        "conservative bracketing", "30, 45, 60, 75, 92, 182, 273",
    ):
        assert anchor.lower() in volatility_normalized, anchor

    scenario = (ROOT / ".claude/agents/commodity/commodity-thesis/03_commodity-scenario-engine.md").read_text()
    scenario_normalized = " ".join(scenario.lower().split())
    for anchor in (
        "independent of the terminal thesis", "before it can influence an action", "span audit",
        "conjunction audit", "expected implementable return / absolute bear downside",
    ):
        assert anchor.lower() in scenario_normalized, anchor

    supply = (ROOT / ".claude/agents/commodity/supply-demand/99_supply-demand-synthesis.md").read_text()
    supply_normalized = " ".join(supply.lower().split())
    fair_value = (ROOT / ".claude/agents/commodity/commodity-thesis/02_commodity-cost-curve-fair-value.md").read_text()
    assert "globally accessible supply" in supply_normalized
    assert "inter-origin import/export" in supply_normalized
    assert "directional-conviction score" in supply_normalized
    module_rules = (ROOT / ".claude/agents/commodity/MODULE_RULES.md").read_text().lower()
    assert "sum of all origins' net imports is zero" in module_rules
    assert "− all inter-origin imports/exports" not in module_rules
    assert all(anchor in fair_value.lower() for anchor in (
        "observed market price", "model-implied fair-value band",
        "what the market appears to expect", "mean-reversion evidence test",
    ))
    print("PASS: cross-asset, tails, independent scenarios, accessible supply and fair-value separation remain mandatory")


def main() -> int:
    test_supply_opacity_boundaries()
    test_orbs_are_discovered_without_engine_wiring()
    test_syntheses_require_the_new_orbs()
    test_predictive_depth_cannot_silently_regress()
    print("ALL PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
