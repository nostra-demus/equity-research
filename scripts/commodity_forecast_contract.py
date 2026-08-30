#!/usr/bin/env python3
"""Deterministic dual-horizon forecast and action contract for commodities."""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import math
import re
from pathlib import Path
from typing import Any, Callable


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
COVERAGE_CUTOVER = dt.date(2026, 8, 11)
COVERAGE_STATUSES = {"usable", "missing", "manual", "unavailable", "suspect"}
COVERAGE_ARTIFACT_FIELDS_V1 = {
    "schema_version", "commodity", "decision_time", "generated_at", "profile_path",
    "required_count", "usable_count", "complete", "unresolved_need_ids", "rows",
}
COVERAGE_ARTIFACT_FIELDS_V2 = COVERAGE_ARTIFACT_FIELDS_V1 | {"profile_snapshot_sha256"}
COVERAGE_ARTIFACT_FIELDS_V3 = COVERAGE_ARTIFACT_FIELDS_V2 | {"source_snapshot_sha256"}
COVERAGE_ROW_FIELDS = {
    "need_id", "series_id", "owner_orb", "required_history_freshness", "lawful_source_policy",
    "status", "as_of", "vintage_id", "dataset_id", "connector_id", "provider", "reason",
}


def production_coverage_resolver(series_id: str, commodity: str, decision_time: str) -> dict[str, Any] | None:
    from commodity_profile_coverage import resolve_profile_series
    return resolve_profile_series(series_id, commodity, decision_time)


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
            "cash_hurdle", "span_audit", "catalysts", "falsifiers", "evidence_links",
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
    evidence_links = horizon.get("evidence_links")
    if not isinstance(evidence_links, list) or not evidence_links:
        errors.append(f"{prefix}.evidence_links must be a non-empty array")
    else:
        for index, link in enumerate(evidence_links):
            lp = f"{prefix}.evidence_links[{index}]"
            if not isinstance(link, dict) or set(link) != {"conclusion", "cluster_ids", "source_vintage_ids"}:
                errors.append(f"{lp} must contain exactly conclusion, cluster_ids and source_vintage_ids")
                continue
            if not isinstance(link.get("conclusion"), str) or not link["conclusion"].strip():
                errors.append(f"{lp}.conclusion must be non-empty")
            for field, pattern in (
                ("cluster_ids", r"^[a-z0-9][a-z0-9._-]*$"),
                ("source_vintage_ids", r"^sha256:[a-f0-9]{64}$"),
            ):
                values = link.get(field)
                if not isinstance(values, list) or not values:
                    errors.append(f"{lp}.{field} must be a non-empty array")
                elif len(values) != len(set(values)) or any(
                    not isinstance(value, str) or re.fullmatch(pattern, value) is None for value in values
                ):
                    errors.append(f"{lp}.{field} must contain unique valid IDs")
    return errors


def _coverage_errors(
    record: dict[str, Any], artifact: Any | None, artifact_sha256: str | None,
    profile_requirements: list[dict[str, str]] | None,
    coverage_resolver: Callable[[str, str, str], dict[str, Any] | None] | None,
    frozen_coverage: bool, profile_snapshot_sha256: str | None,
    source_snapshot_sha256: str | None,
) -> list[str]:
    errors: list[str] = []
    if not isinstance(record.get("commodity_family"), str) or re.fullmatch(r"[a-z0-9][a-z0-9-]*", record["commodity_family"]) is None:
        errors.append("commodity_family must be the frozen lowercase profile-family slug")
    try:
        is_fresh = dt.date.fromisoformat(str(record.get("decision_date"))) >= COVERAGE_CUTOVER
    except ValueError:
        is_fresh = False
    projection = record.get("required_series_coverage")
    if projection is None:
        return ["required_series_coverage is required for fresh commodity decisions"] if is_fresh else []
    required_projection = {
        "path", "generated_at", "artifact_sha256", "complete", "required_count",
        "usable_count", "unresolved_need_ids",
    }
    if not isinstance(projection, dict) or set(projection) != required_projection:
        return ["required_series_coverage must contain exactly the deterministic coverage projection fields"]
    if projection.get("path") != "required_series_coverage.json":
        errors.append("required_series_coverage.path must be required_series_coverage.json")
    digest = projection.get("artifact_sha256")
    if not isinstance(digest, str) or not re.fullmatch(r"sha256:[a-f0-9]{64}", digest):
        errors.append("required_series_coverage.artifact_sha256 must be a sha256 digest")
    if artifact is None or artifact_sha256 is None:
        if is_fresh:
            errors.append("required_series_coverage artifact is required for deterministic validation")
        return errors
    if digest != artifact_sha256:
        errors.append("required_series_coverage artifact digest does not match the decision projection")
    if not isinstance(artifact, dict):
        return [*errors, "required_series_coverage artifact must be an object"]
    artifact_version = artifact.get("schema_version")
    expected_artifact_fields = {
        1: COVERAGE_ARTIFACT_FIELDS_V1,
        2: COVERAGE_ARTIFACT_FIELDS_V2,
        3: COVERAGE_ARTIFACT_FIELDS_V3,
    }.get(artifact_version, COVERAGE_ARTIFACT_FIELDS_V1)
    if artifact_version not in {1, 2, 3} or set(artifact) != expected_artifact_fields:
        errors.append("required_series_coverage artifact must contain exactly the contract fields")
    if artifact.get("commodity") != record.get("commodity"):
        errors.append("required_series_coverage artifact identity does not match the decision")
    if artifact_version in {2, 3}:
        frozen_digest = artifact.get("profile_snapshot_sha256")
        if not isinstance(frozen_digest, str) or re.fullmatch(r"sha256:[a-f0-9]{64}", frozen_digest) is None:
            errors.append("required_series_coverage profile snapshot digest is invalid")
        elif frozen_digest != profile_snapshot_sha256:
            errors.append("required_series_coverage profile snapshot does not match the validated profile bytes")
    if artifact_version == 3:
        frozen_source_digest = artifact.get("source_snapshot_sha256")
        if (
            not isinstance(frozen_source_digest, str)
            or re.fullmatch(r"sha256:[a-f0-9]{64}", frozen_source_digest) is None
        ):
            errors.append("required_series_coverage source snapshot digest is invalid")
        elif frozen_source_digest != source_snapshot_sha256:
            errors.append("required_series_coverage source snapshot does not match the validated source bytes")
    decision_time = artifact.get("decision_time")
    try:
        parsed_decision_time = dt.datetime.fromisoformat(str(decision_time).replace("Z", "+00:00"))
        if parsed_decision_time.tzinfo is None:
            raise ValueError
        parsed_decision_time = parsed_decision_time.astimezone(dt.timezone.utc)
    except ValueError:
        parsed_decision_time = None
    if parsed_decision_time is None or parsed_decision_time.date().isoformat() != record.get("decision_date"):
        errors.append("required_series_coverage decision_time must fall on decision_date")
    try:
        generated_at = dt.datetime.fromisoformat(str(artifact.get("generated_at")).replace("Z", "+00:00"))
        if generated_at.tzinfo is None:
            raise ValueError
        generated_at = generated_at.astimezone(dt.timezone.utc)
    except ValueError:
        generated_at = None
    if generated_at is None or (parsed_decision_time is not None and generated_at < parsed_decision_time):
        errors.append("required_series_coverage generated_at must be a timezone-aware instant at/after decision_time")
    rows = artifact.get("rows")
    if not isinstance(rows, list) or not rows:
        errors.append("required_series_coverage artifact must contain rows")
        return errors
    resolver_kinds: dict[str, Any] = {}
    if profile_requirements is None:
        if is_fresh and not frozen_coverage:
            errors.append("current profile requirements are required for deterministic coverage validation")
    else:
        resolver_kinds = {
            str(row.get("series")): (
                row.get("resolver", {}).get("kind") if isinstance(row.get("resolver"), dict) else None
            )
            for row in profile_requirements
        }
        if artifact.get("profile_path") != "frameworks/commodity/COMMODITY_PROFILES.md":
            errors.append("required_series_coverage profile_path is not the canonical commodity profile")
        expected_rows = [
            (
                row.get("need"), row.get("series"), row.get("owner"),
                row.get("requirement"), row.get("policy"),
            )
            for row in profile_requirements
        ]
        artifact_rows = [
            (
                row.get("need_id"), row.get("series_id"), row.get("owner_orb"),
                row.get("required_history_freshness"), row.get("lawful_source_policy"),
            )
            if isinstance(row, dict) else (None, None, None, None, None)
            for row in rows
        ]
        if artifact_rows != expected_rows:
            errors.append("required_series_coverage rows do not exactly match the current commodity profile")
    need_ids: list[str] = []
    unresolved: list[str] = []
    for index, row in enumerate(rows):
        if not isinstance(row, dict):
            errors.append(f"required_series_coverage.rows[{index}] must be an object")
            continue
        if set(row) != COVERAGE_ROW_FIELDS:
            errors.append(f"required_series_coverage.rows[{index}] must contain exactly the contract fields")
        need_id = row.get("need_id")
        status = row.get("status")
        if not isinstance(need_id, str) or not need_id:
            errors.append(f"required_series_coverage.rows[{index}].need_id is invalid")
            continue
        need_ids.append(need_id)
        if status not in COVERAGE_STATUSES:
            errors.append(f"required_series_coverage.rows[{index}].status is invalid")
        elif status != "usable":
            unresolved.append(need_id)
        if status == "usable" and (
            not isinstance(row.get("vintage_id"), str)
            or not re.fullmatch(r"sha256:[a-f0-9]{64}", row["vintage_id"])
            or not isinstance(row.get("as_of"), str)
        ):
            errors.append(f"required_series_coverage.rows[{index}] usable row lacks a vintage/as-of identity")
        elif status == "usable":
            if coverage_resolver is None:
                if is_fresh:
                    errors.append(f"required_series_coverage.rows[{index}] has no point-in-time resolver")
            else:
                resolved = coverage_resolver(str(row.get("series_id")), str(record.get("commodity")), str(decision_time))
                vintage = resolved.get("vintage") if isinstance(resolved, dict) else None
                expected_resolver_kind = resolver_kinds.get(str(row.get("series_id")))
                acquisition = vintage.get("acquisition") if isinstance(vintage, dict) else None
                tier = vintage.get("tier") if isinstance(vintage, dict) else None
                if acquisition == "manual":
                    from commodity_profile_coverage import decision_grade_manual_vintage
                    manual_allowed = decision_grade_manual_vintage(vintage)
                else:
                    manual_allowed = False
                rank_allowed = (
                    isinstance(tier, int) and not isinstance(tier, bool) and tier <= 10
                    and (acquisition != "manual" or manual_allowed)
                    and (
                        # Frozen replay proves that the exact source identity still
                        # resolves from the point-in-time data pool. It deliberately
                        # does not import today's mutable profile resolver kind.
                        frozen_coverage
                        or (expected_resolver_kind == "pulse_quote" and acquisition == "public_quote")
                        or (expected_resolver_kind == "derived" and acquisition == "derived")
                        or (
                            expected_resolver_kind not in {"pulse_quote", "derived"}
                            and acquisition not in {"public_quote", "derived"}
                            and tier <= 5
                        )
                    )
                )
                if (
                    not isinstance(resolved, dict) or resolved.get("usable") is not True
                    or resolved.get("health") != "current"
                    or resolved.get("vintage_id") != row.get("vintage_id")
                    or not isinstance(vintage, dict)
                    or vintage.get("as_of") != row.get("as_of")
                    or vintage.get("dataset_id") != row.get("dataset_id")
                    or vintage.get("connector_id") != row.get("connector_id")
                    or vintage.get("provider") != row.get("provider")
                    or not rank_allowed
                ):
                    errors.append(
                        f"required_series_coverage.rows[{index}] usable vintage does not resolve at decision_time"
                    )
    if len(need_ids) != len(set(need_ids)):
        errors.append("required_series_coverage artifact has duplicate need IDs")
    expected = {
        "generated_at": artifact.get("generated_at"),
        "complete": not unresolved,
        "required_count": len(rows),
        "usable_count": len(rows) - len(unresolved),
        "unresolved_need_ids": unresolved,
    }
    for field, value in expected.items():
        if projection.get(field) != value:
            errors.append(f"required_series_coverage.{field} does not match the artifact")
    if artifact.get("complete") != expected["complete"]:
        errors.append("required_series_coverage artifact complete flag is inconsistent")
    if artifact.get("required_count") != len(rows) or artifact.get("usable_count") != len(rows) - len(unresolved):
        errors.append("required_series_coverage artifact counts are inconsistent")
    if artifact.get("unresolved_need_ids") != unresolved:
        errors.append("required_series_coverage artifact unresolved list is inconsistent")
    if unresolved:
        horizons = record.get("forecast_horizons")
        horizon_statuses = [
            horizons.get(name).get("status")
            if isinstance(horizons, dict) and isinstance(horizons.get(name), dict)
            else None
            for name in ("tactical", "strategic")
        ]
        if horizon_statuses != ["not_assessable", "not_assessable"]:
            errors.append("incomplete required-series coverage forces both horizons to not_assessable")
        override = record.get("critical_risk_override")
        expected_action = "Avoid" if isinstance(override, dict) and override.get("applied") is True else "Research More"
        if record.get("action") != expected_action:
            errors.append(f"incomplete required-series coverage forces action {expected_action}")
    return errors


def validate_decision_record(
    record: Any, coverage_artifact: Any | None = None, coverage_sha256: str | None = None,
    profile_requirements: list[dict[str, str]] | None = None,
    coverage_resolver: Callable[[str, str, str], dict[str, Any] | None] | None = None,
    *, frozen_coverage: bool = False, profile_snapshot_sha256: str | None = None,
    source_snapshot_sha256: str | None = None,
) -> list[str]:
    """Validate the post-rollout forecast and mechanically derived action.

    Immutable archives set ``frozen_coverage`` so roster shape is checked against the artifact frozen
    beside the decision rather than today's profile. Usable rows must still resolve to the exact
    point-in-time source identity; a self-consistent archive is not its own proof of provenance.
    """
    if not isinstance(record, dict):
        return ["commodity decision_record must be an object"]
    errors: list[str] = []
    errors.extend(_coverage_errors(
        record, coverage_artifact, coverage_sha256, profile_requirements, coverage_resolver,
        frozen_coverage, profile_snapshot_sha256, source_snapshot_sha256,
    ))
    current_price = record.get("current_price")
    price_value = current_price.get("value") if isinstance(current_price, dict) else None
    horizons = record.get("forecast_horizons")
    if not isinstance(horizons, dict):
        return ["forecast_horizons must contain tactical and strategic objects"]
    price_series_unresolved = any(
        isinstance(row, dict)
        and str(row.get("series_id", "")).endswith(".current-price")
        and row.get("status") != "usable"
        for row in (
            coverage_artifact.get("rows", [])
            if isinstance(coverage_artifact, dict) and isinstance(coverage_artifact.get("rows"), list)
            else []
        )
    )
    horizon_statuses = [
        horizons.get(name, {}).get("status") if isinstance(horizons.get(name), dict) else None
        for name in ("tactical", "strategic")
    ]
    if price_value is None:
        unavailable_reason = current_price.get("unavailable_reason") if isinstance(current_price, dict) else None
        if not isinstance(unavailable_reason, str) or not unavailable_reason.strip():
            errors.append("current_price.unavailable_reason is required when value is null")
        if not price_series_unresolved:
            errors.append("current_price.value may be null only when required current-price coverage is unresolved")
        if horizon_statuses != ["not_assessable", "not_assessable"]:
            errors.append("a null current_price.value forces both horizons to not_assessable")
    elif not _number(price_value) or float(price_value) <= 0:
        errors.append("current_price.value must be a positive finite number or a proven unavailable null")
    if price_series_unresolved and price_value is not None:
        errors.append("unresolved required current-price coverage forces current_price.value to null")
    if price_value is None and isinstance(current_price, dict):
        forbidden_labels = sorted(set(current_price).intersection({"currency", "unit", "as_of"}))
        if forbidden_labels:
            errors.append(
                "a null current_price.value cannot carry invented price labels: "
                f"{forbidden_labels}"
            )
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
    coverage_path = args.decision_record.parent / "required_series_coverage.json"
    coverage = None
    coverage_sha256 = None
    try:
        raw_coverage = coverage_path.read_bytes()
        coverage = json.loads(raw_coverage.decode("utf-8"))
        coverage_sha256 = "sha256:" + hashlib.sha256(raw_coverage).hexdigest()
    except FileNotFoundError:
        pass
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        print(f"FORECAST-CONTRACT-FAIL: required_series_coverage artifact: {error}")
        return 1
    profile_requirements = None
    profile_digest = None
    source_digest = None
    coverage_resolver = production_coverage_resolver
    try:
        from commodity_profile_coverage import (
            PROFILE_PATH, frozen_source_resolver, profile_snapshot_sha256,
            source_snapshot_sha256, structured_profile,
        )
        profile_requirements = structured_profile(str(record.get("commodity", "")), profile_path=PROFILE_PATH)
        profile_digest = profile_snapshot_sha256(str(record.get("commodity", "")))
    except (OSError, ValueError):
        pass
    if isinstance(coverage, dict) and coverage.get("schema_version") == 3:
        try:
            source_snapshot = json.loads(
                (args.decision_record.parent / "required_series_sources.json").read_text(encoding="utf-8")
            )
            source_digest = source_snapshot_sha256(source_snapshot)
            coverage_resolver = frozen_source_resolver(source_snapshot, coverage)
        except (OSError, ValueError, json.JSONDecodeError):
            coverage_resolver = lambda *_args: None
    errors = validate_decision_record(
        record, coverage, coverage_sha256, profile_requirements, coverage_resolver,
        profile_snapshot_sha256=profile_digest,
        source_snapshot_sha256=source_digest,
    )
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
