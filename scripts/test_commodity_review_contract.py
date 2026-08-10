#!/usr/bin/env python3
"""Backward compatibility and immutable-anchor tests for commodity outcome reviews."""
from __future__ import annotations

import copy
import json
import tempfile
from pathlib import Path

from validate_screener_json import Checker, check_commodity_review_anchors


REPO = Path(__file__).resolve().parents[1]
SCHEMA = json.loads((REPO / "frameworks/commodity/decision_review.schema.json").read_text(encoding="utf-8"))
DECISION_ID = "CMD-GOLD-2026-08-10-abcdef123456"


def pit_source(series_id: str, *, published_at: str = "2026-10-09T20:00:00Z") -> dict:
    return {
        "provider": "Synthetic official provider", "dataset_id": "test.outcomes",
        "series_id": series_id, "vintage_id": "sha256:" + "a" * 64,
        "observation_as_of": "2026-10-09", "published_at": published_at,
        "retrieved_at": "2026-10-10T08:00:00Z", "calculation_basis": "Exact target-cutoff synthetic fixture",
    }


def archived_decision() -> dict:
    scenarios = [
        {"label": "bear", "implementable_return_pct": -10.0},
        {"label": "base", "implementable_return_pct": 5.0},
        {"label": "bull", "implementable_return_pct": 20.0},
    ]
    return {
        "decision_id": DECISION_ID,
        "commodity": "GOLD",
        "decision_date": "2026-08-10",
        "action": "Hold",
        "confidence": 62,
        "current_price": {"value": 100.0, "currency": "USD", "unit": "USD/oz", "as_of": "2026-08-10"},
        "key_risks": ["Real yields rise."],
        "forecast_horizons": {
            "tactical": {"target_date": "2026-10-09", "scenarios": scenarios},
            "strategic": {"target_date": "2027-08-10", "scenarios": scenarios},
        },
    }


def review() -> dict:
    return {
        "schema_version": "2.0",
        "swarm": "commodity",
        "commodity": "GOLD",
        "decision_id": DECISION_ID,
        "forecast_horizon": "tactical",
        "original_decision_date": "2026-08-10",
        "review_date": "2026-10-10",
        "review_window": "tactical",
        "target_date": "2026-10-09",
        "outcome_as_of": "2026-10-09",
        "original_action": "Hold",
        "original_confidence": 62,
        "reference_price": {"value": 100.0, "currency": "USD", "unit": "USD/oz", "as_of": "2026-08-10"},
        "review_price": {"value": 105.0, "currency": "USD", "unit": "USD/oz", "as_of": "2026-10-09", "source": "lawful benchmark"},
        "absolute_return_pct": 5.0,
        "realized_return_components_pct": {
            "price_return_pct": 5.0,
            "roll_return_pct": -1.0,
            "collateral_return_pct": 0.6,
            "fees_pct": -0.1,
            "fx_adjustment_pct": 0.0,
            "implementable_return_pct": 4.5,
        },
        "realized_return_component_sources": {
            "price_return_pct": pit_source("gold.price-return"),
            "roll_return_pct": pit_source("gold.roll-return"),
            "collateral_return_pct": pit_source("gold.collateral-return"),
            "fees_pct": pit_source("gold.fees"),
            "fx_adjustment_pct": pit_source("gold.fx-adjustment"),
        },
        "max_adverse_excursion_pct": -3.0,
        "max_adverse_excursion_source": pit_source("gold.adverse-excursion"),
        "scenario_outcome": "base",
        "range_miss": "inside",
        "price_vs_levels": {},
        "thesis_status": "on-track",
        "action_outcome": "partial",
        "decision_quality": "skill",
        "risk_results": [{"risk": "Real yields rise.", "status": "not_materialized", "evidence": "Official data, target date"}],
        "error_taxonomy": [],
        "lessons": ["Synthetic fixture."],
        "notes": "Exact-date synthetic outcome.",
    }


def schema_errors(value: dict) -> list[str]:
    checker = Checker(SCHEMA)
    checker.check(SCHEMA, value, "")
    return checker.errors


def main() -> int:
    assert not schema_errors(review()), schema_errors(review())
    legacy = copy.deepcopy(review())
    legacy["schema_version"] = "1.0"
    legacy["review_window"] = "30d"
    for field in (
        "decision_id", "forecast_horizon", "target_date", "outcome_as_of",
        "realized_return_components_pct", "realized_return_component_sources", "max_adverse_excursion_pct",
        "max_adverse_excursion_source", "scenario_outcome", "range_miss",
    ):
        legacy.pop(field)
    assert not schema_errors(legacy), schema_errors(legacy)

    with tempfile.TemporaryDirectory() as temporary:
        run = Path(temporary) / "commodity/runs/GOLD"
        reviews = run / "reviews"
        archive = run / "decisions" / DECISION_ID
        reviews.mkdir(parents=True)
        archive.mkdir(parents=True)
        (archive / "decision_record.json").write_text(json.dumps(archived_decision()), encoding="utf-8")
        path = reviews / "2026-10-10_tactical_decision_review.json"
        path.write_text(json.dumps(review()), encoding="utf-8")
        assert check_commodity_review_anchors(str(path)) == []

        broken = review()
        broken["outcome_as_of"] = "2026-10-10"
        broken["realized_return_components_pct"]["implementable_return_pct"] = 99.0
        broken["scenario_outcome"] = "bear"
        path.write_text(json.dumps(broken), encoding="utf-8")
        errors = check_commodity_review_anchors(str(path))
        assert any("exact target_date" in error for error in errors), errors
        assert any("does not equal" in error for error in errors), errors
        assert any("nearest archived scenario" in error for error in errors), errors

        mismatched = review()
        mismatched["review_price"]["currency"] = "EUR"
        path.write_text(json.dumps(mismatched), encoding="utf-8")
        errors = check_commodity_review_anchors(str(path))
        assert any("cannot mix quote currencies" in error for error in errors), errors

        future_revision = review()
        future_revision["realized_return_component_sources"]["roll_return_pct"] = pit_source(
            "gold.roll-return", published_at="2028-01-01T00:00:00z",
        )
        path.write_text(json.dumps(future_revision), encoding="utf-8")
        errors = check_commodity_review_anchors(str(path))
        assert any("later releases/revisions" in error for error in errors), errors

        future_retrieval = review()
        future_retrieval["max_adverse_excursion_source"]["retrieved_at"] = "2028-01-01T00:00:00z"
        path.write_text(json.dumps(future_retrieval), encoding="utf-8")
        errors = check_commodity_review_anchors(str(path))
        assert any("cannot be after review_date" in error for error in errors), errors

        malformed_timestamp = review()
        malformed_timestamp["max_adverse_excursion_source"]["retrieved_at"] = "not-a-timestamp"
        path.write_text(json.dumps(malformed_timestamp), encoding="utf-8")
        errors = check_commodity_review_anchors(str(path))
        assert any("invalid point-in-time" in error for error in errors), errors

    print("PASS: v2 horizon reviews are exact-date, arithmetic-safe and immutable-decision anchored")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
