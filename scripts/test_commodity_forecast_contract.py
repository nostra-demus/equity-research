#!/usr/bin/env python3
"""Truth-table and reconciliation tests for the commodity dual-horizon contract."""
from __future__ import annotations

import copy
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from commodity_forecast_contract import (
    ACTION_MATRIX,
    TARGET_EXPOSURE,
    action_for,
    classify_horizon,
    validate_decision_record,
)


def _horizon(name: str, days: int, target: str) -> dict:
    scenarios = [
        {
            "scenario_id": f"{name}-bear",
            "label": "bear",
            "probability": 30,
            "price_target": 90,
            "price_return_pct": -10,
            "roll_return_pct": -1,
            "collateral_return_pct": 1,
            "fees_pct": -0.2,
            "fx_adjustment_pct": 0,
            "implementable_return_pct": -10.2,
            "conditions": ["bear condition"],
            "source": "primary source",
            "joint_probability_basis": None,
            "invalidated_if": "dated bear falsifier",
        },
        {
            "scenario_id": f"{name}-base",
            "label": "base",
            "probability": 40,
            "price_target": 105,
            "price_return_pct": 5,
            "roll_return_pct": -1,
            "collateral_return_pct": 1,
            "fees_pct": -0.2,
            "fx_adjustment_pct": 0,
            "implementable_return_pct": 4.8,
            "conditions": ["base condition"],
            "source": "primary source",
            "joint_probability_basis": None,
            "invalidated_if": "dated base falsifier",
        },
        {
            "scenario_id": f"{name}-bull",
            "label": "bull",
            "probability": 30,
            "price_target": 120,
            "price_return_pct": 20,
            "roll_return_pct": -1,
            "collateral_return_pct": 1,
            "fees_pct": -0.2,
            "fx_adjustment_pct": 0,
            "implementable_return_pct": 19.8,
            "conditions": ["bull condition"],
            "source": "primary source",
            "joint_probability_basis": None,
            "invalidated_if": "dated bull falsifier",
        },
    ]
    return {
        "horizon": name,
        "status": "assessable",
        "horizon_days": days,
        "target_date": target,
        "scenarios": scenarios,
        "expected_return_components_pct": {
            "price_return_pct": 5.0,
            "roll_return_pct": -1.0,
            "collateral_return_pct": 1.0,
            "fees_pct": -0.2,
            "fx_adjustment_pct": 0.0,
            "implementable_return_pct": 4.8,
        },
        "loss_probability_pct": 30,
        "downside_pct": -10.2,
        "risk_reward": 4.8 / 10.2,
        "cash_hurdle": {
            "return_pct": 1.0,
            "duration_days": days,
            "instrument": "duration-matched Treasury bill",
            "source": "US Treasury",
            "as_of": "2026-08-10",
        },
        "span_audit": {
            "status": "pass",
            "mapping": "exact_grid",
            "grid_days": [days],
            "empirical_lower_bound_pct": -8.0,
            "empirical_upper_bound_pct": 15.0,
            "killer_risk_case_id": f"{name}-bear",
            "killer_risk_required_bound_pct": -10.0,
            "source": "volatility-distribution orb",
        },
        "classification": "mixed",
        "confidence": 62,
        "catalysts": ["dated catalyst"],
        "falsifiers": ["observable falsifier"],
        "not_assessable_reason": None,
    }


def _record() -> dict:
    tactical = _horizon("tactical", 60, "2026-10-09")
    strategic = _horizon("strategic", 365, "2027-08-10")
    return {
        "swarm": "commodity",
        "commodity": "GOLD",
        "decision_date": "2026-08-10",
        "benchmark": "Gold spot proxy",
        "current_price": {"value": 100, "currency": "USD", "unit": "USD/oz", "as_of": "2026-08-10"},
        "curve": "contango",
        "balance": "balanced",
        "net_macro": "mixed",
        "positioning": "neutral",
        "thesis_summary": "Synthetic contract fixture.",
        "key_risks": ["Synthetic risk"],
        "key_levels": {"support": 90, "resistance": 120, "fair_value_range": "90–120 USD/oz"},
        "action": "Hold",
        "target_exposure_risk_units": 0.5,
        "forecast_confidence": 62,
        "confidence": 60,
        "critical_risk_override": {"applied": False, "risk": None, "source": None},
        "forecast_horizons": {"tactical": tactical, "strategic": strategic},
        "relative_view": "Synthetic relative view.",
        "sources": ["Synthetic primary source"],
    }


def main() -> int:
    expected_matrix = {
        ("positive", "positive"): "Buy", ("positive", "mixed"): "Hold",
        ("positive", "negative"): "Trim", ("mixed", "positive"): "Hold",
        ("mixed", "mixed"): "Hold", ("mixed", "negative"): "Avoid",
        ("negative", "positive"): "Trim", ("negative", "mixed"): "Trim",
        ("negative", "negative"): "Avoid",
    }
    assert ACTION_MATRIX == expected_matrix
    assert action_for("not_assessable", "positive") == "Research More"
    assert action_for("not_assessable", "positive", critical_risk_override=True) == "Avoid"
    assert action_for("positive", "positive", critical_risk_override=True) == "Avoid"
    assert TARGET_EXPOSURE == {"Buy": 1.0, "Hold": 0.5, "Trim": 0.25, "Avoid": 0.0, "Research More": None}

    assert classify_horizon(2.01, 2.0, 0.5, 49.99) == "positive"
    assert classify_horizon(2.0, 2.0, 0.5, 49.99) == "mixed"
    assert classify_horizon(2.01, 2.0, 0.499, 49.99) == "mixed"
    assert classify_horizon(2.01, 2.0, 0.5, 50.0) == "mixed"
    assert classify_horizon(1.99, 2.0, 9.0, 0) == "negative"
    assert classify_horizon(9.0, 2.0, 9.0, 60.0) == "negative"

    record = _record()
    assert validate_decision_record(record) == [], validate_decision_record(record)
    from validate_screener_json import validate
    with tempfile.TemporaryDirectory() as temporary:
        path = Path(temporary) / "decision_record.json"
        path.write_text(json.dumps(record), encoding="utf-8")
        schema = Path(__file__).resolve().parents[1] / "frameworks/commodity/decision_record.schema.json"
        assert validate(str(schema), str(path)) == [], validate(str(schema), str(path))
        cli = subprocess.run(
            [sys.executable, str(Path(__file__).with_name("commodity_forecast_contract.py")), str(path)],
            capture_output=True, text=True, check=False,
        )
        assert cli.returncode == 0 and "FORECAST-CONTRACT:" in cli.stdout, cli.stdout + cli.stderr

    bad_component = copy.deepcopy(record)
    bad_component["forecast_horizons"]["tactical"]["scenarios"][0]["implementable_return_pct"] = -9
    assert any("five components" in error for error in validate_decision_record(bad_component))

    bad_probability = copy.deepcopy(record)
    bad_probability["forecast_horizons"]["tactical"]["scenarios"][0]["probability"] = 29.9
    assert any("sum to 100" in error for error in validate_decision_record(bad_probability))

    future_cash = copy.deepcopy(record)
    future_cash["forecast_horizons"]["strategic"]["cash_hurdle"]["as_of"] = "2026-08-11"
    assert any("after the decision date" in error for error in validate_decision_record(future_cash))

    bad_action = copy.deepcopy(record)
    bad_action["action"] = "Buy"
    assert any("mechanical action" in error for error in validate_decision_record(bad_action))

    critical_avoid = copy.deepcopy(record)
    critical_avoid["critical_risk_override"] = {
        "applied": True, "risk": "proven exchange closure", "source": "exchange notice, 2026-08-10",
    }
    critical_avoid["action"] = "Avoid"
    critical_avoid["target_exposure_risk_units"] = 0.0
    assert validate_decision_record(critical_avoid) == [], validate_decision_record(critical_avoid)

    narrow = copy.deepcopy(record)
    narrow["forecast_horizons"]["tactical"]["span_audit"]["empirical_upper_bound_pct"] = 25
    assert any("upper span bound" in error for error in validate_decision_record(narrow))

    conjunctive = copy.deepcopy(record)
    conjunctive["forecast_horizons"]["strategic"]["scenarios"][2]["conditions"] = ["first", "second"]
    assert any("joint_probability_basis" in error for error in validate_decision_record(conjunctive))

    bracketed = copy.deepcopy(record)
    bracketed["forecast_horizons"]["tactical"]["horizon_days"] = 61
    bracketed["forecast_horizons"]["tactical"]["target_date"] = "2026-10-10"
    bracketed["forecast_horizons"]["tactical"]["cash_hurdle"]["duration_days"] = 61
    bracketed["forecast_horizons"]["tactical"]["span_audit"]["mapping"] = "conservative_bracketing"
    bracketed["forecast_horizons"]["tactical"]["span_audit"]["grid_days"] = [60, 75]
    assert validate_decision_record(bracketed) == [], validate_decision_record(bracketed)

    legacy_blend = copy.deepcopy(record)
    legacy_blend["expected_return_pct"] = 4.8
    assert any("blended/single-horizon" in error for error in validate_decision_record(legacy_blend))

    implicit_override = copy.deepcopy(record)
    del implicit_override["critical_risk_override"]
    assert any("critical_risk_override" in error for error in validate_decision_record(implicit_override))

    action_upgrade = copy.deepcopy(record)
    action_upgrade["post_mortem_action"] = "Buy"
    action_upgrade["post_mortem_target_exposure_risk_units"] = 1.0
    assert any("only hold or downgrade" in error for error in validate_decision_record(action_upgrade))

    unavailable = copy.deepcopy(record)
    unavailable["forecast_horizons"]["tactical"] = {
        "horizon": "tactical", "status": "not_assessable", "horizon_days": 60,
        "target_date": "2026-10-09", "classification": "not_assessable",
        "confidence": 0, "not_assessable_reason": "lawful price history unavailable",
        "scenarios": [],
    }
    unavailable["action"] = "Research More"
    unavailable["target_exposure_risk_units"] = None
    unavailable["forecast_confidence"] = 0
    unavailable["confidence"] = 0
    assert validate_decision_record(unavailable) == [], validate_decision_record(unavailable)
    stale_unavailable = copy.deepcopy(unavailable)
    stale_unavailable["forecast_horizons"]["tactical"]["loss_probability_pct"] = 30
    assert any("must be absent" in error for error in validate_decision_record(stale_unavailable))
    with tempfile.TemporaryDirectory() as temporary:
        path = Path(temporary) / "unavailable.json"
        path.write_text(json.dumps(unavailable), encoding="utf-8")
        assert validate(str(schema), str(path)) == [], validate(str(schema), str(path))

    print("ALL PASS — dual horizons, arithmetic, boundaries, action matrix and abstention are deterministic")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
