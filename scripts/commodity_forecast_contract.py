#!/usr/bin/env python3
"""Deterministic dual-horizon forecast and action contract for commodities."""
from __future__ import annotations

import argparse
import datetime as dt
import json
import math
import re
from pathlib import Path
from typing import Any


HORIZON_RANGES = {"tactical": (30, 92), "strategic": (182, 548)}
CLASSIFICATIONS = {"positive", "mixed", "negative", "not_assessable"}
ACTION_MATRIX = {
    ("positive", "positive"): "Buy",
    ("positive", "mixed"): "Hold",
    ("positive", "negative"): "Trim",
    ("mixed", "positive"): "Hold",
    ("mixed", "mixed"): "Hold",
    ("mixed", "negative"): "Avoid",
    ("negative", "positive"): "Trim",
    ("negative", "mixed"): "Trim",
    ("negative", "negative"): "Avoid",
}
TARGET_EXPOSURE = {
    "Buy": 1.0,
    "Hold": 0.5,
    "Trim": 0.25,
    "Avoid": 0.0,
    "Research More": None,
}
COMPONENTS = (
    "price_return_pct",
    "roll_return_pct",
    "collateral_return_pct",
    "fees_pct",
    "fx_adjustment_pct",
)
EMPIRICAL_GRID = (30, 45, 60, 75, 92, 182, 273, 365, 456, 548)
SCENARIO_ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")


def _number(value: Any) -> bool:
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and math.isfinite(float(value))
    )


def _close(actual: float, expected: float, floor: float = 0.05) -> bool:
    return abs(actual - expected) <= max(floor, abs(expected) * 0.01)


def classify_horizon(
    expected_return_pct: float,
    cash_hurdle_pct: float,
    risk_reward: float | str,
    loss_probability_pct: float,
) -> str:
    """Apply the ordered classification boundaries from the commodity programme."""
    if expected_return_pct < cash_hurdle_pct or loss_probability_pct >= 60:
        return "negative"
    rr_clears = risk_reward == "unbounded" or (
        _number(risk_reward) and float(risk_reward) >= 0.5
    )
    if expected_return_pct > cash_hurdle_pct and rr_clears and loss_probability_pct < 50:
        return "positive"
    return "mixed"


def action_for(
    tactical: str,
    strategic: str,
    *,
    critical_risk_override: bool = False,
) -> str:
    """Derive action; an unavailable horizon abstains unless a proven critical risk forces Avoid."""
    if critical_risk_override:
        return "Avoid"
    if tactical == "not_assessable" or strategic == "not_assessable":
        return "Research More"
    return ACTION_MATRIX[(tactical, strategic)]


def _date_plus(date_text: Any, days: int) -> str | None:
    try:
        return (dt.date.fromisoformat(date_text) + dt.timedelta(days=days)).isoformat()
    except (TypeError, ValueError):
        return None


def _validate_horizon(
    name: str,
    horizon: Any,
    decision_date: Any,
    current_price: Any,
) -> list[str]:
    prefix = f"forecast_horizons.{name}"
    if not isinstance(horizon, dict):
        return [f"{prefix} must be an object"]
    errors: list[str] = []
    if horizon.get("horizon") != name:
        errors.append(f"{prefix}.horizon must equal {name!r}")
    days = horizon.get("horizon_days")
    low, high = HORIZON_RANGES[name]
    if not isinstance(days, int) or isinstance(days, bool) or not low <= days <= high:
        errors.append(f"{prefix}.horizon_days must be an integer in {low}..{high}")
    elif horizon.get("target_date") != _date_plus(decision_date, days):
        errors.append(f"{prefix}.target_date must equal decision_date + horizon_days")

    status = horizon.get("status")
    if status not in {"assessable", "not_assessable"}:
        errors.append(f"{prefix}.status must be assessable or not_assessable")
        return errors
    confidence = horizon.get("confidence")
    if not _number(confidence) or not 0 <= float(confidence) <= 100:
        errors.append(f"{prefix}.confidence must be finite and between 0 and 100")

    if status == "not_assessable":
        if not isinstance(horizon.get("not_assessable_reason"), str) or not horizon["not_assessable_reason"].strip():
            errors.append(f"{prefix}.not_assessable_reason must explain the missing evidence")
        if horizon.get("classification") != "not_assessable":
            errors.append(f"{prefix}.classification must be not_assessable")
        if confidence != 0:
            errors.append(f"{prefix}.confidence must be 0 when status is not_assessable")
        if horizon.get("scenarios") not in (None, []):
            errors.append(f"{prefix}.scenarios must be absent/empty when not assessable")
        stale_fields = (
            "expected_return_components_pct", "loss_probability_pct", "downside_pct", "risk_reward",
            "cash_hurdle", "span_audit", "catalysts", "falsifiers",
        )
        for field in stale_fields:
            if horizon.get(field) not in (None, []):
                errors.append(f"{prefix}.{field} must be absent when not assessable")
        return errors

    scenarios = horizon.get("scenarios")
    if not isinstance(scenarios, list) or not 3 <= len(scenarios) <= 7:
        return errors + [f"{prefix}.scenarios must contain 3..7 cases"]
    labels: list[Any] = []
    ids: list[Any] = []
    probabilities: list[float] = []
    implementable: list[float] = []
    outcomes_by_id: dict[str, float] = {}
    weighted = {component: 0.0 for component in COMPONENTS}
    price_anchor = current_price.get("value") if isinstance(current_price, dict) else None
    for index, scenario in enumerate(scenarios):
        sp = f"{prefix}.scenarios[{index}]"
        if not isinstance(scenario, dict):
            errors.append(f"{sp} must be an object")
            continue
        labels.append(scenario.get("label"))
        ids.append(scenario.get("scenario_id"))
        if not isinstance(scenario.get("scenario_id"), str) or not SCENARIO_ID_RE.fullmatch(scenario["scenario_id"]):
            errors.append(f"{sp}.scenario_id must be a stable lowercase slug")
        probability = scenario.get("probability")
        if not _number(probability) or not 0 <= float(probability) <= 100:
            errors.append(f"{sp}.probability must be finite and between 0 and 100")
            continue
        probability = float(probability)
        probabilities.append(probability)
        component_values: dict[str, float] = {}
        for component in COMPONENTS:
            value = scenario.get(component)
            if not _number(value):
                errors.append(f"{sp}.{component} must be finite")
            else:
                component_values[component] = float(value)
                weighted[component] += probability / 100.0 * float(value)
        total = scenario.get("implementable_return_pct")
        if _number(total) and len(component_values) == len(COMPONENTS):
            calculated = sum(component_values.values())
            if not _close(float(total), calculated):
                errors.append(f"{sp}.implementable_return_pct does not equal its five components")
            implementable.append(float(total))
            if isinstance(scenario.get("scenario_id"), str):
                outcomes_by_id[scenario["scenario_id"]] = float(total)
        elif not _number(total):
            errors.append(f"{sp}.implementable_return_pct must be finite")
        target = scenario.get("price_target")
        if not _number(target) or float(target) <= 0:
            errors.append(f"{sp}.price_target must be a positive finite number")
        if _number(price_anchor) and float(price_anchor) > 0 and _number(target) and _number(scenario.get("price_return_pct")):
            derived_price_return = (float(target) / float(price_anchor) - 1.0) * 100.0
            if not _close(float(scenario["price_return_pct"]), derived_price_return):
                errors.append(f"{sp}.price_return_pct does not reconcile with price_target/current_price")
        for field in ("conditions",):
            if not isinstance(scenario.get(field), list) or not scenario[field]:
                errors.append(f"{sp}.{field} must be a non-empty array")
            elif any(not isinstance(value, str) or not value.strip() for value in scenario[field]):
                errors.append(f"{sp}.{field} entries must be non-empty strings")
            elif len(scenario[field]) >= 2 and (
                not isinstance(scenario.get("joint_probability_basis"), str)
                or not scenario["joint_probability_basis"].strip()
            ):
                errors.append(f"{sp}.joint_probability_basis is required for a multi-condition case")
        for field in ("source", "invalidated_if"):
            if not isinstance(scenario.get(field), str) or not scenario[field].strip():
                errors.append(f"{sp}.{field} must be non-empty")

    if sorted(labels) != ["base", "bear", "bull"]:
        errors.append(f"{prefix}.scenarios must contain exactly one bear, base and bull")
    if len(set(ids)) != len(ids) or any(not isinstance(value, str) or not value for value in ids):
        errors.append(f"{prefix}.scenario_id values must be non-empty and unique")
    if probabilities and abs(sum(probabilities) - 100.0) > 0.05:
        errors.append(f"{prefix} scenario probabilities must sum to 100")

    expected = horizon.get("expected_return_components_pct")
    if not isinstance(expected, dict):
        errors.append(f"{prefix}.expected_return_components_pct must be an object")
    else:
        for component, calculated in weighted.items():
            if not _number(expected.get(component)) or not _close(float(expected[component]), calculated):
                errors.append(f"{prefix}.expected_return_components_pct.{component} does not reconcile")
        expected_total = expected.get("implementable_return_pct")
        calculated_total = sum(weighted.values())
        if not _number(expected_total) or not _close(float(expected_total), calculated_total):
            errors.append(f"{prefix}.expected implementable return does not reconcile")

    if implementable and len(implementable) == len(scenarios):
        loss_probability = sum(
            probability for probability, outcome in zip(probabilities, implementable) if outcome < 0
        )
        if not _number(horizon.get("loss_probability_pct")) or not _close(float(horizon["loss_probability_pct"]), loss_probability):
            errors.append(f"{prefix}.loss_probability_pct does not reconcile")
        downside = min(implementable)
        if not _number(horizon.get("downside_pct")) or not _close(float(horizon["downside_pct"]), downside):
            errors.append(f"{prefix}.downside_pct must equal the worst implementable scenario return")
        expected_total = sum(p / 100.0 * outcome for p, outcome in zip(probabilities, implementable))
        derived_rr: float | str = "unbounded" if downside >= 0 else expected_total / abs(downside)
        stated_rr = horizon.get("risk_reward")
        if derived_rr == "unbounded":
            if stated_rr != "unbounded":
                errors.append(f"{prefix}.risk_reward must be 'unbounded' when no scenario loses")
        elif not _number(stated_rr) or not _close(float(stated_rr), derived_rr, 0.005):
            errors.append(f"{prefix}.risk_reward does not equal expected return / absolute downside")

        hurdle = horizon.get("cash_hurdle")
        hurdle_return = hurdle.get("return_pct") if isinstance(hurdle, dict) else None
        if not isinstance(hurdle, dict):
            errors.append(f"{prefix}.cash_hurdle must be an object")
        else:
            if hurdle.get("duration_days") != days:
                errors.append(f"{prefix}.cash_hurdle.duration_days must match horizon_days")
            for field in ("instrument", "source", "as_of"):
                if not isinstance(hurdle.get(field), str) or not hurdle[field].strip():
                    errors.append(f"{prefix}.cash_hurdle.{field} must be non-empty")
            if not _number(hurdle_return):
                errors.append(f"{prefix}.cash_hurdle.return_pct must be finite")
            try:
                hurdle_date = dt.date.fromisoformat(hurdle.get("as_of"))
                decision_day = dt.date.fromisoformat(decision_date)
                if hurdle_date > decision_day:
                    errors.append(f"{prefix}.cash_hurdle.as_of cannot be after the decision date")
            except (TypeError, ValueError):
                errors.append(f"{prefix}.cash_hurdle.as_of must be a real ISO date")
        if _number(hurdle_return):
            derived_classification = classify_horizon(
                expected_total, float(hurdle_return), derived_rr, loss_probability
            )
            if horizon.get("classification") != derived_classification:
                errors.append(
                    f"{prefix}.classification={horizon.get('classification')!r} "
                    f"but the mechanical result is {derived_classification!r}"
                )
        span = horizon.get("span_audit")
        if not isinstance(span, dict):
            errors.append(f"{prefix}.span_audit must be an object")
        else:
            if span.get("status") != "pass":
                errors.append(f"{prefix}.span_audit.status must be 'pass' for an assessable horizon")
            mapping = span.get("mapping")
            grid_days = span.get("grid_days")
            if mapping not in {"exact_grid", "conservative_bracketing"}:
                errors.append(f"{prefix}.span_audit.mapping is invalid")
            if not isinstance(grid_days, list) or any(day not in EMPIRICAL_GRID for day in grid_days):
                errors.append(f"{prefix}.span_audit.grid_days must use the empirical grid")
            elif isinstance(days, int):
                if mapping == "exact_grid" and grid_days != [days]:
                    errors.append(f"{prefix}.span_audit exact_grid must name only horizon_days")
                if mapping == "conservative_bracketing" and (
                    len(grid_days) != 2
                    or grid_days != sorted(grid_days)
                    or not grid_days[0] < days < grid_days[1]
                    or not (grid_days[1] <= 92 or grid_days[0] >= 182)
                ):
                    errors.append(f"{prefix}.span_audit must conservatively bracket within one horizon band")
            lower = span.get("empirical_lower_bound_pct")
            upper = span.get("empirical_upper_bound_pct")
            if not _number(lower) or min(implementable) > float(lower) + 0.05:
                errors.append(f"{prefix} bear does not reach the empirical lower span bound")
            if not _number(upper) or max(implementable) < float(upper) - 0.05:
                errors.append(f"{prefix} bull does not reach the empirical upper span bound")
            killer_id = span.get("killer_risk_case_id")
            killer_bound = span.get("killer_risk_required_bound_pct")
            killer_return = outcomes_by_id.get(killer_id)
            if killer_return is None or not _number(killer_bound):
                errors.append(f"{prefix}.span_audit killer-risk case/bound is unresolved")
            elif (float(killer_bound) < 0 and killer_return > float(killer_bound) + 0.05) or (
                float(killer_bound) >= 0 and killer_return < float(killer_bound) - 0.05
            ):
                errors.append(f"{prefix} killer-risk case does not cover its required tail/event bound")
    for field in ("catalysts", "falsifiers"):
        if not isinstance(horizon.get(field), list) or not horizon[field]:
            errors.append(f"{prefix}.{field} must be a non-empty array")
        elif any(not isinstance(value, str) or not value.strip() for value in horizon[field]):
            errors.append(f"{prefix}.{field} entries must be non-empty strings")
    return errors


def validate_decision_record(record: Any) -> list[str]:
    """Validate the post-rollout dual-horizon forecast and its mechanically derived action."""
    if not isinstance(record, dict):
        return ["commodity decision_record must be an object"]
    errors: list[str] = []
    current_price = record.get("current_price")
    price_value = current_price.get("value") if isinstance(current_price, dict) else None
    if not _number(price_value) or float(price_value) <= 0:
        errors.append("current_price.value must be a positive finite number")
    horizons = record.get("forecast_horizons")
    if not isinstance(horizons, dict):
        return ["forecast_horizons must contain tactical and strategic objects"]
    if set(horizons) != {"tactical", "strategic"}:
        errors.append("forecast_horizons must contain exactly tactical and strategic")
    for name in ("tactical", "strategic"):
        errors.extend(
            _validate_horizon(
                name,
                horizons.get(name),
                record.get("decision_date"),
                record.get("current_price"),
            )
        )
    legacy = {
        "scenario_horizon_days", "scenarios", "expected_return_pct", "downside_risk_pct", "risk_reward"
    }
    present_legacy = sorted(legacy.intersection(record))
    if present_legacy:
        errors.append(f"top-level blended/single-horizon forecast fields are forbidden: {present_legacy}")

    tactical = horizons.get("tactical") if isinstance(horizons.get("tactical"), dict) else {}
    strategic = horizons.get("strategic") if isinstance(horizons.get("strategic"), dict) else {}
    tactical_class = tactical.get("classification")
    strategic_class = strategic.get("classification")
    override = record.get("critical_risk_override")
    if not isinstance(override, dict) or set(override) != {"applied", "risk", "source"} or not isinstance(override.get("applied"), bool):
        errors.append("critical_risk_override must explicitly contain applied, risk and source")
    override_applied = isinstance(override, dict) and override.get("applied") is True
    if override_applied:
        for field in ("risk", "source"):
            if not isinstance(override.get(field), str) or not override[field].strip():
                errors.append(f"critical_risk_override.{field} must prove an applied override")
    if tactical_class in CLASSIFICATIONS and strategic_class in CLASSIFICATIONS:
        expected_action = action_for(
            tactical_class, strategic_class, critical_risk_override=override_applied
        )
        if record.get("action") != expected_action:
            errors.append(f"action={record.get('action')!r}; mechanical action is {expected_action!r}")
        expected_exposure = TARGET_EXPOSURE[expected_action]
        if record.get("target_exposure_risk_units") != expected_exposure:
            errors.append(
                "target_exposure_risk_units does not match the mechanical action "
                f"({expected_action} -> {expected_exposure})"
            )
    horizon_confidences = [tactical.get("confidence"), strategic.get("confidence")]
    if all(_number(value) for value in horizon_confidences):
        forecast_confidence = min(float(value) for value in horizon_confidences)
        if not _number(record.get("forecast_confidence")) or not _close(float(record["forecast_confidence"]), forecast_confidence):
            errors.append("forecast_confidence must equal the lower horizon confidence")
        if not _number(record.get("confidence")) or not 0 <= float(record["confidence"]) <= forecast_confidence:
            errors.append("confidence must be between 0 and the lower horizon confidence")
    post_action = record.get("post_mortem_action")
    if post_action is not None:
        if post_action not in TARGET_EXPOSURE:
            errors.append("post_mortem_action is not an allowed commodity action")
        elif record.get("post_mortem_target_exposure_risk_units") != TARGET_EXPOSURE[post_action]:
            errors.append("post_mortem_target_exposure_risk_units does not match post_mortem_action")
        ladder = {"Buy": 0, "Hold": 1, "Trim": 2, "Avoid": 3}
        original_action = record.get("action")
        downgrade_ok = (
            post_action == original_action
            or post_action == "Research More"
            or (original_action in ladder and post_action in ladder and ladder[post_action] >= ladder[original_action])
            or (original_action == "Research More" and post_action == "Avoid")
        )
        if not downgrade_ok:
            errors.append("post_mortem_action may only hold or downgrade the mechanical action")
    post_confidence = record.get("post_review_confidence_score")
    if post_confidence is not None and (
        not _number(post_confidence)
        or not _number(record.get("confidence"))
        or not 0 <= float(post_confidence) <= float(record["confidence"])
    ):
        errors.append("post_review_confidence_score may only hold or lower confidence")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("decision_record", type=Path)
    args = parser.parse_args()
    try:
        record = json.loads(args.decision_record.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        print(f"FORECAST-CONTRACT-FAIL: {error}")
        return 1
    errors = validate_decision_record(record)
    if errors:
        for error in errors:
            print(f"FORECAST-CONTRACT-FAIL: {error}")
        return 1
    horizons = record["forecast_horizons"]
    print(
        "FORECAST-CONTRACT: "
        f"tactical={horizons['tactical']['classification']} "
        f"strategic={horizons['strategic']['classification']} "
        f"action={record['action']} target={record['target_exposure_risk_units']} "
        f"confidence={record['confidence']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
