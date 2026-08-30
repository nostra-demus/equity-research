#!/usr/bin/env python3
"""Truth-table and reconciliation tests for the commodity dual-horizon contract."""
from __future__ import annotations

import copy
import hashlib
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
from commodity_profile_coverage import PROFILE_PATH, profile_rows


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
        "evidence_links": [{
            "conclusion": "Independent cluster supports this horizon.",
            "cluster_ids": [f"{name}.cluster-1"],
            "source_vintage_ids": ["sha256:" + "a" * 64],
        }],
        "not_assessable_reason": None,
    }


def _record() -> dict:
    tactical = _horizon("tactical", 60, "2026-10-09")
    strategic = _horizon("strategic", 365, "2027-08-10")
    return {
        "swarm": "commodity",
        "commodity": "GOLD",
        "commodity_family": "precious-metals",
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
        "signal_evidence": {
            "path": "signal_evidence.json", "generated_at": "2026-08-10T00:00:00Z",
            "artifact_sha256": "sha256:" + "b" * 64, "coverage_complete": True,
            "raw_signal_count": 2, "independent_cluster_count": 2,
            "conviction_eligible_cluster_count": 2, "contradiction_count": 0,
        },
        "critical_risk_override": {"applied": False, "risk": None, "source": None},
        "forecast_horizons": {"tactical": tactical, "strategic": strategic},
        "relative_view": "Synthetic relative view.",
        "sources": ["Synthetic primary source"],
        "data_needs_schema_version": "2.0",
        "data_needs": [],
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

    fresh = copy.deepcopy(record)
    fresh["decision_date"] = "2026-08-11"
    fresh["current_price"]["as_of"] = "2026-08-11"
    for name, days, target in (
        ("tactical", 60, "2026-10-10"), ("strategic", 365, "2027-08-11"),
    ):
        fresh["forecast_horizons"][name] = {
            "horizon": name, "status": "not_assessable", "horizon_days": days,
            "target_date": target, "classification": "not_assessable", "confidence": 0,
            "not_assessable_reason": "required profile series is unresolved", "scenarios": [],
        }
    fresh["action"] = "Research More"
    fresh["target_exposure_risk_units"] = None
    fresh["forecast_confidence"] = 0
    fresh["confidence"] = 0
    assert any("required_series_coverage is required" in error for error in validate_decision_record(fresh))
    artifact = {
        "schema_version": 1, "commodity": "GOLD", "decision_time": "2026-08-11T12:00:00Z",
        "generated_at": "2026-08-11T12:00:01Z", "profile_path": "frameworks/commodity/COMMODITY_PROFILES.md",
        "required_count": 1, "usable_count": 0, "complete": False,
        "unresolved_need_ids": ["gold-futures-curve"],
        "rows": [{
            "need_id": "gold-futures-curve", "series_id": "gold.futures-curve",
            "owner_orb": "commodity-price-curve", "required_history_freshness": "current",
            "lawful_source_policy": "CME or unavailable", "status": "unavailable", "as_of": None,
            "vintage_id": None, "dataset_id": None, "connector_id": None, "provider": None,
            "reason": "no immutable route",
        }],
    }
    artifact_bytes = (json.dumps(artifact, indent=2, ensure_ascii=False) + "\n").encode()
    artifact_digest = "sha256:" + hashlib.sha256(artifact_bytes).hexdigest()
    fresh["required_series_coverage"] = {
        "path": "required_series_coverage.json", "generated_at": artifact["generated_at"],
        "artifact_sha256": artifact_digest, "complete": False, "required_count": 1,
        "usable_count": 0, "unresolved_need_ids": ["gold-futures-curve"],
    }
    requirements = [{
        "need": "gold-futures-curve", "series": "gold.futures-curve",
        "owner": "commodity-price-curve",
        "requirement": "current", "policy": "CME or unavailable", "resolver": {"kind": "connector"},
    }]
    assert validate_decision_record(fresh, artifact, artifact_digest, requirements) == [], validate_decision_record(
        fresh, artifact, artifact_digest, requirements,
    )
    null_without_price_gap = copy.deepcopy(fresh)
    null_without_price_gap["current_price"] = {
        "value": None, "unavailable_reason": "quote missing",
    }
    assert any("required current-price coverage" in error for error in validate_decision_record(
        null_without_price_gap, artifact, artifact_digest, requirements,
    ))

    price_artifact = copy.deepcopy(artifact)
    price_artifact["unresolved_need_ids"] = ["gold-current-price"]
    price_artifact["rows"][0].update({
        "need_id": "gold-current-price", "series_id": "gold.current-price",
        "required_history_freshness": "current quote", "lawful_source_policy": "pulse quote or unavailable",
        "reason": "current quote unavailable",
    })
    price_artifact_bytes = (json.dumps(price_artifact, indent=2, ensure_ascii=False) + "\n").encode()
    price_artifact_digest = "sha256:" + hashlib.sha256(price_artifact_bytes).hexdigest()
    null_price = copy.deepcopy(fresh)
    null_price["current_price"] = {
        "value": None, "unavailable_reason": "current quote unavailable",
    }
    null_price["required_series_coverage"].update({
        "artifact_sha256": price_artifact_digest,
        "unresolved_need_ids": ["gold-current-price"],
    })
    price_requirements = [{
        "need": "gold-current-price", "series": "gold.current-price",
        "owner": "commodity-price-curve", "requirement": "current quote",
        "policy": "pulse quote or unavailable", "resolver": {"kind": "pulse_quote"},
    }]
    assert validate_decision_record(
        null_price, price_artifact, price_artifact_digest, price_requirements,
    ) == [], validate_decision_record(
        null_price, price_artifact, price_artifact_digest, price_requirements,
    )
    fabricated_price = copy.deepcopy(null_price)
    fabricated_price["current_price"] = {
        "value": 100, "currency": "USD", "unit": "USD/oz", "as_of": "2026-08-11",
    }
    assert any("forces current_price.value to null" in error for error in validate_decision_record(
        fabricated_price, price_artifact, price_artifact_digest, price_requirements,
    ))
    labeled_null = copy.deepcopy(null_price)
    labeled_null["current_price"]["currency"] = "USD"
    assert any("cannot carry invented price labels" in error for error in validate_decision_record(
        labeled_null, price_artifact, price_artifact_digest, price_requirements,
    ))
    with tempfile.TemporaryDirectory() as temporary:
        path = Path(temporary) / "null-price.json"
        path.write_text(json.dumps(null_price), encoding="utf-8")
        assert validate(str(schema), str(path)) == [], validate(str(schema), str(path))
    missing_reason = copy.deepcopy(null_price)
    del missing_reason["current_price"]["unavailable_reason"]
    assert any("unavailable_reason" in error for error in validate_decision_record(
        missing_reason, price_artifact, price_artifact_digest, price_requirements,
    ))
    malformed_horizon = copy.deepcopy(fresh)
    malformed_horizon["forecast_horizons"]["tactical"] = None
    assert any("forces both horizons" in error for error in validate_decision_record(
        malformed_horizon, artifact, artifact_digest, requirements,
    ))
    stronger = copy.deepcopy(fresh)
    stronger["forecast_horizons"]["strategic"] = copy.deepcopy(record["forecast_horizons"]["strategic"])
    stronger["forecast_horizons"]["strategic"]["target_date"] = "2027-08-11"
    stronger["forecast_horizons"]["strategic"]["cash_hurdle"]["as_of"] = "2026-08-11"
    assert any("forces both horizons" in error for error in validate_decision_record(
        stronger, artifact, artifact_digest, requirements,
    ))
    assert any("digest does not match" in error for error in validate_decision_record(
        fresh, artifact, "sha256:" + "0" * 64, requirements,
    ))
    omitted_profile_row = [*requirements, {
        "need": "gold-current-price", "series": "gold.current-price", "owner": "commodity-price-curve",
        "requirement": "current", "policy": "shared quote",
    }]
    assert any("exactly match" in error for error in validate_decision_record(
        fresh, artifact, artifact_digest, omitted_profile_row,
    ))
    usable_artifact = copy.deepcopy(artifact)
    usable_artifact.update({"complete": True, "usable_count": 1, "unresolved_need_ids": []})
    usable_artifact["rows"][0].update({
        "status": "usable", "as_of": "2026-08-10", "vintage_id": "sha256:" + "a" * 64,
        "dataset_id": "cme.curve", "connector_id": "cme-curve", "provider": "CME Group",
        "reason": "validated fixture vintage",
    })
    usable_bytes = (json.dumps(usable_artifact, indent=2, ensure_ascii=False) + "\n").encode()
    usable_digest = "sha256:" + hashlib.sha256(usable_bytes).hexdigest()
    usable_record = copy.deepcopy(fresh)
    usable_record["required_series_coverage"].update({
        "artifact_sha256": usable_digest, "complete": True, "usable_count": 1,
        "unresolved_need_ids": [],
    })
    assert any("no point-in-time resolver" in error for error in validate_decision_record(
        usable_record, usable_artifact, usable_digest, requirements,
    ))
    assert any("does not resolve" in error for error in validate_decision_record(
        usable_record, usable_artifact, usable_digest, requirements,
        lambda *_args: None,
    ))

    def matching_resolver(*_args):
        row = usable_artifact["rows"][0]
        return {
            "usable": True, "health": "current", "vintage_id": row["vintage_id"],
            "vintage": {
                "as_of": row["as_of"], "dataset_id": row["dataset_id"],
                "connector_id": row["connector_id"], "provider": row["provider"],
                "acquisition": "official_api", "tier": 5,
            },
        }

    assert validate_decision_record(
        usable_record, usable_artifact, usable_digest, requirements, matching_resolver,
    ) == []
    assert any("no point-in-time resolver" in error for error in validate_decision_record(
        usable_record, usable_artifact, usable_digest, frozen_coverage=True,
    ))
    assert validate_decision_record(
        usable_record, usable_artifact, usable_digest,
        coverage_resolver=matching_resolver, frozen_coverage=True,
    ) == []
    assert validate_decision_record(
        usable_record, usable_artifact, usable_digest, requirements,
        lambda *_args: {
            **matching_resolver(),
            "vintage": {
                **matching_resolver()["vintage"],
                "acquisition": "manual", "tier": 5,
                "source_type": "vendor_export",
                "licensing": {"access": "licensed", "use": "entitlement_required"},
                "manual_input": {"content_sha256": "sha256:" + "c" * 64},
            },
        },
    ) == []
    assert any("does not resolve" in error for error in validate_decision_record(
        usable_record, usable_artifact, usable_digest, requirements,
        lambda *_args: {
            **matching_resolver(),
            "vintage": {
                **matching_resolver()["vintage"],
                "acquisition": "manual", "tier": 5,
                "source_type": "vendor_export",
                "licensing": {"access": "licensed", "use": "entitlement_required"},
            },
        },
    ))
    assert any("digest does not match" in error for error in validate_decision_record(
        usable_record, usable_artifact, "sha256:" + "0" * 64,
        coverage_resolver=matching_resolver, frozen_coverage=True,
    ))
    invented_artifact = copy.deepcopy(usable_artifact)
    invented_artifact["rows"][0]["vintage_id"] = "sha256:" + "b" * 64
    invented_bytes = (json.dumps(invented_artifact, indent=2, ensure_ascii=False) + "\n").encode()
    invented_digest = "sha256:" + hashlib.sha256(invented_bytes).hexdigest()
    invented_record = copy.deepcopy(usable_record)
    invented_record["required_series_coverage"]["artifact_sha256"] = invented_digest
    assert any("does not resolve at decision_time" in error for error in validate_decision_record(
        invented_record, invented_artifact, invented_digest,
        coverage_resolver=matching_resolver, frozen_coverage=True,
    ))
    assert any("does not resolve" in error for error in validate_decision_record(
        usable_record, usable_artifact, usable_digest, requirements,
        lambda *_args: {
            **matching_resolver(),
            "vintage": {**matching_resolver()["vintage"], "acquisition": "manual", "tier": 9},
        },
    ))
    assert any("does not resolve" in error for error in validate_decision_record(
        usable_record, usable_artifact, usable_digest, requirements,
        lambda *_args: {
            **matching_resolver(),
            "vintage": {**matching_resolver()["vintage"], "acquisition": "public_quote", "tier": 10},
        },
    ))
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        actual_requirements = profile_rows(PROFILE_PATH, "GOLD")
        cli_artifact = copy.deepcopy(artifact)
        cli_artifact["required_count"] = len(actual_requirements)
        cli_artifact["unresolved_need_ids"] = [row["need"] for row in actual_requirements]
        cli_artifact["rows"] = [{
            "need_id": row["need"], "series_id": row["series"], "owner_orb": row["owner"],
            "required_history_freshness": row["requirement"], "lawful_source_policy": row["policy"],
            "status": "unavailable", "as_of": None, "vintage_id": None, "dataset_id": None,
            "connector_id": None, "provider": None, "reason": "synthetic unresolved fixture",
        } for row in actual_requirements]
        artifact_bytes = (json.dumps(cli_artifact, indent=2, ensure_ascii=False) + "\n").encode()
        cli_digest = "sha256:" + hashlib.sha256(artifact_bytes).hexdigest()
        cli_fresh = copy.deepcopy(fresh)
        cli_fresh["current_price"] = {
            "value": None, "unavailable_reason": "synthetic current quote is unresolved",
        }
        cli_fresh["required_series_coverage"].update({
            "artifact_sha256": cli_digest,
            "required_count": len(actual_requirements),
            "unresolved_need_ids": cli_artifact["unresolved_need_ids"],
        })
        path = root / "decision_record.json"
        path.write_text(json.dumps(cli_fresh), encoding="utf-8")
        (root / "required_series_coverage.json").write_bytes(artifact_bytes)
        assert validate(str(schema), str(path)) == [], validate(str(schema), str(path))
        cli = subprocess.run(
            [sys.executable, str(Path(__file__).with_name("commodity_forecast_contract.py")), str(path)],
            capture_output=True, text=True, check=False,
        )
        assert cli.returncode == 0 and "Research More" in cli.stdout, cli.stdout + cli.stderr

    print("ALL PASS — dual horizons, arithmetic, boundaries, action matrix and abstention are deterministic")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
