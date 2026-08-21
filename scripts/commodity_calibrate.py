#!/usr/bin/env python3
"""Deterministic commodity decision and dual-horizon, provenance-aware calibration."""
from __future__ import annotations

import glob
import json
import math
import os
import re
import sys
from collections import Counter
from datetime import date, datetime, timezone
from validate_screener_json import Checker, check_commodity_review_anchors
from provider_calibration import (
    SCHEMA_VERSION as PROVIDER_CALIBRATION_SCHEMA_VERSION,
    execution_identity,
    execution_slices,
    legacy_sensitivity,
    provider_comparison,
)


REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHEMA_PATH = os.path.join(REPO, "frameworks", "commodity", "decision_review.schema.json")
PERF_DIR = os.path.join(REPO, "commodity", "performance")
MIN_DECISIVE = 10
MIN_SLICE_N = 5
MIN_PROBABILITY_N = 10
MIN_PROBABILITY_SLICE_N = 5
DECISIVE_OUTCOMES = {"vindicated", "contradicted"}
ACTION_OUTCOMES = DECISIVE_OUTCOMES | {"too_early", "partial", "not_applicable"}
LABELS = ("bear", "base", "bull")


def read_json(path):
    try:
        with open(path, encoding="utf-8") as handle:
            return json.load(handle)
    except Exception:
        return None


def _relative(path):
    return os.path.relpath(path, REPO)


def read_decision_records():
    """Read every immutable decision; use one top-level legacy record only where no archive exists."""
    records = []
    archived_commodities = set()
    pattern = os.path.join(REPO, "commodity", "runs", "*", "decisions", "*", "decision_record.json")
    for path in sorted(glob.glob(pattern)):
        record = read_json(path)
        decision_id = os.path.basename(os.path.dirname(path))
        if not isinstance(record, dict) or record.get("swarm") != "commodity" or record.get("decision_id") != decision_id:
            continue
        if not record.get("commodity") or not record.get("decision_date"):
            continue
        record = dict(record, _path=_relative(path), _decision_key=decision_id, _legacy=False)
        records.append(record)
        archived_commodities.add(record["commodity"])
    top_pattern = os.path.join(REPO, "commodity", "runs", "*", "decision_record.json")
    for path in sorted(glob.glob(top_pattern)):
        record = read_json(path)
        if not isinstance(record, dict) or record.get("swarm") != "commodity" or not record.get("commodity"):
            continue
        if record["commodity"] in archived_commodities:
            continue
        key = f"legacy:{record['commodity']}:{record.get('decision_date', '')}"
        records.append(dict(record, _path=_relative(path), _decision_key=key, _legacy=True))
    return records


def read_reviews():
    reviews = []
    invalid = 0
    schema = read_json(SCHEMA_PATH)
    if not isinstance(schema, dict):
        raise RuntimeError("commodity decision-review schema is unreadable")
    pattern = os.path.join(REPO, "commodity", "runs", "*", "reviews", "*_decision_review*.json")
    for path in sorted(glob.glob(pattern)):
        review = read_json(path)
        if not isinstance(review, dict) or review.get("action_outcome") not in ACTION_OUTCOMES:
            invalid += 1
            continue
        checker = Checker(schema)
        checker.check(schema, review, "")
        try:
            anchor_errors = check_commodity_review_anchors(path)
        except Exception:
            anchor_errors = ["anchor validation crashed"]
        if checker.errors or anchor_errors:
            invalid += 1
            continue
        match = re.search(r"_v(\d+)\.json$", os.path.basename(path))
        reviews.append(dict(review, _path=_relative(path), _version=int(match.group(1)) if match else 1))
    return reviews, invalid


def _latest_by(items, key):
    selected = {}
    for item in items:
        identity = key(item)
        rank = (item.get("review_date") if isinstance(item.get("review_date"), str) else "", item.get("_version", 1), item.get("_path", ""))
        prior = selected.get(identity)
        if prior is None:
            selected[identity] = item
            continue
        prior_rank = (prior.get("review_date") if isinstance(prior.get("review_date"), str) else "", prior.get("_version", 1), prior.get("_path", ""))
        if rank > prior_rank:
            selected[identity] = item
    return list(selected.values())


def _headline_outcome_rows(records, reviews):
    """Join one resolved headline outcome at most to each immutable decision record."""
    outcomes = []
    by_id = {record.get("decision_id"): record for record in records if record.get("decision_id")}
    legacy_records = {(record.get("commodity"), record.get("decision_date")): record for record in records if record["_legacy"]}
    fresh = _latest_by(
        [review for review in reviews if review.get("schema_version") == "2.0"],
        lambda review: (review.get("decision_id"), review.get("forecast_horizon")),
    )
    grouped = {}
    for review in fresh:
        if review.get("decision_id") in by_id:
            grouped.setdefault(review["decision_id"], {})[review.get("forecast_horizon")] = review
    for decision_id, horizons in grouped.items():
        if set(horizons) != {"tactical", "strategic"}:
            outcomes.append({"record": by_id[decision_id], "outcome": "partial"})
            continue
        pair = [horizons["tactical"]["action_outcome"], horizons["strategic"]["action_outcome"]]
        outcomes.append({
            "record": by_id[decision_id],
            "outcome": pair[0] if pair[0] == pair[1] and pair[0] in DECISIVE_OUTCOMES else "partial",
        })
    legacy = _latest_by(
        [review for review in reviews if review.get("schema_version") != "2.0"],
        lambda review: (review.get("commodity"), review.get("original_decision_date")),
    )
    for review in legacy:
        identity = (review.get("commodity"), review.get("original_decision_date"))
        if identity in legacy_records:
            outcomes.append({"record": legacy_records[identity], "outcome": review["action_outcome"]})
    return outcomes


def _headline_outcomes(records, reviews):
    """Backward-compatible pair view used by the existing operational aggregate."""
    return [
        (row["record"]["commodity"], row["outcome"])
        for row in _headline_outcome_rows(records, reviews)
    ]


def _valid_probability_observation(review, record, today):
    if review.get("schema_version") != "2.0" or review.get("decision_id") != record.get("decision_id"):
        return None
    name = review.get("forecast_horizon")
    horizon = record.get("forecast_horizons", {}).get(name) if isinstance(record.get("forecast_horizons"), dict) else None
    components = review.get("realized_return_components_pct")
    component_sources = review.get("realized_return_component_sources")
    source_fields = {"price_return_pct", "roll_return_pct", "collateral_return_pct", "fees_pct", "fx_adjustment_pct"}
    if name not in {"tactical", "strategic"} or not isinstance(horizon, dict) or not isinstance(components, dict):
        return None
    if not isinstance(component_sources, dict) or set(component_sources) != source_fields or any(
        not isinstance(value, dict) for value in component_sources.values()
    ) or not isinstance(review.get("max_adverse_excursion_source"), dict):
        return None
    component_fields = ("price_return_pct", "roll_return_pct", "collateral_return_pct", "fees_pct", "fx_adjustment_pct")
    actual = components.get("implementable_return_pct")
    scenarios = horizon.get("scenarios")
    if not all(
        isinstance(components.get(field), (int, float)) and not isinstance(components.get(field), bool)
        and math.isfinite(components[field]) for field in (*component_fields, "implementable_return_pct")
    ) or not isinstance(scenarios, list):
        return None
    actual = float(actual)
    if abs(actual - sum(float(components[field]) for field in component_fields)) > 0.05:
        return None
    if review.get("target_date") != horizon.get("target_date") or review.get("outcome_as_of") != horizon.get("target_date"):
        return None
    try:
        if date.fromisoformat(review["target_date"]) > today or date.fromisoformat(review["review_date"]) > today:
            return None
    except (KeyError, TypeError, ValueError):
        return None
    excursion = review.get("max_adverse_excursion_pct")
    if not isinstance(excursion, (int, float)) or isinstance(excursion, bool) or not math.isfinite(excursion) or excursion > min(0.0, actual) + 0.05:
        return None
    rows = []
    for scenario in scenarios:
        if not isinstance(scenario, dict):
            continue
        label, probability, outcome = scenario.get("label"), scenario.get("probability"), scenario.get("implementable_return_pct")
        if label in LABELS and all(isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) for value in (probability, outcome)):
            rows.append((label, float(probability) / 100.0, float(outcome)))
    if len(rows) != 3 or {label for label, _, _ in rows} != set(LABELS) or abs(sum(probability for _, probability, _ in rows) - 1.0) > 0.0005:
        return None
    if any(probability < 0 or probability > 1 for _, probability, _ in rows):
        return None
    if review.get("scenario_outcome") not in LABELS or review.get("range_miss") not in {"below", "inside", "above"}:
        return None
    family = record.get("commodity_family")
    if not isinstance(family, str) or re.fullmatch(r"[a-z0-9][a-z0-9-]*", family) is None:
        return None
    expected = sum(probability * outcome for _, probability, outcome in rows)
    nearest = min(rows, key=lambda row: (abs(row[2] - actual), LABELS.index(row[0])))[0]
    lower, upper = min(outcome for _, _, outcome in rows), max(outcome for _, _, outcome in rows)
    range_miss = "below" if actual < lower else ("above" if actual > upper else "inside")
    if review.get("scenario_outcome") != nearest or review.get("range_miss") != range_miss:
        return None
    probabilities = {label: probability for label, probability, _ in rows}
    observed = {label: float(label == review["scenario_outcome"]) for label in LABELS}
    brier = sum((probabilities[label] - observed[label]) ** 2 for label in LABELS)
    crps = sum(probability * abs(outcome - actual) for _, probability, outcome in rows)
    crps -= 0.5 * sum(
        p_left * p_right * abs(x_left - x_right)
        for _, p_left, x_left in rows for _, p_right, x_right in rows
    )
    def sign(value):
        return 0 if abs(value) <= 0.05 else (1 if value > 0 else -1)
    return {
        "decision_id": record["decision_id"],
        "commodity": record["commodity"],
        "family": family,
        "horizon": name,
        "forecast_expected_return_pct": expected,
        "actual_return_pct": actual,
        "error_pct": expected - actual,
        "direction_correct": sign(expected) == sign(actual),
        "brier_score": brier,
        "crps": crps,
        "range_miss": review["range_miss"],
        "max_adverse_excursion_pct": float(excursion),
    }


def _metric_slice(observations, floor):
    n = len(observations)
    if n < floor:
        return {"n": n, "status": f"insufficient (N={n}; floor {floor})", "metrics": None}
    errors = [row["error_pct"] for row in observations]
    excursions = [row["max_adverse_excursion_pct"] for row in observations]
    misses = Counter(row["range_miss"] for row in observations)
    metrics = {
        "directional_accuracy": round(sum(row["direction_correct"] for row in observations) / n, 4),
        "mean_absolute_error_pct": round(sum(abs(value) for value in errors) / n, 4),
        "bias_pct": round(sum(errors) / n, 4),
        "multiclass_brier_score": round(sum(row["brier_score"] for row in observations) / n, 6),
        "crps": round(sum(row["crps"] for row in observations) / n, 6),
        "range_miss_rate": round((misses["below"] + misses["above"]) / n, 4),
        "range_miss_distribution": {label: misses[label] for label in ("below", "inside", "above")},
        "maximum_adverse_excursion_pct": {
            "mean": round(sum(excursions) / n, 4),
            "worst": round(min(excursions), 4),
        },
    }
    return {"n": n, "status": "measured", "metrics": metrics}


def _slices(observations, field):
    values = sorted({row[field] for row in observations})
    return {value: _metric_slice([row for row in observations if row[field] == value], MIN_PROBABILITY_SLICE_N) for value in values}


def build(today=None, legacy_provider_evidence=None):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    today = today or now[:10]
    try:
        today_date = date.fromisoformat(today)
    except (TypeError, ValueError):
        raise ValueError("today must be a real YYYY-MM-DD date") from None
    records = read_decision_records()
    all_valid_reviews, invalid_review_count = read_reviews()
    reviews = [review for review in all_valid_reviews if review["review_date"] <= today]
    future_review_count = len(all_valid_reviews) - len(reviews)
    legacy_provider_evidence = legacy_provider_evidence or {}
    record_by_id = {record.get("decision_id"): record for record in records if record.get("decision_id")}
    legacy_record_by_anchor = {
        (record.get("commodity"), record.get("decision_date")): record
        for record in records if record.get("_legacy")
    }
    execution_by_key = {}
    for record in records:
        evidence = legacy_provider_evidence.get(record.get("_decision_key"))
        if evidence is None and record.get("decision_id"):
            evidence = legacy_provider_evidence.get(record["decision_id"])
        execution_by_key[record["_decision_key"]] = execution_identity(record, evidence)

    def record_for_review(review):
        if review.get("schema_version") == "2.0":
            return record_by_id.get(review.get("decision_id"))
        return legacy_record_by_anchor.get((review.get("commodity"), review.get("original_decision_date")))

    latest_horizon_reviews = _latest_by(
        [review for review in reviews if review.get("schema_version") == "2.0"],
        lambda review: (review.get("decision_id"), review.get("forecast_horizon")),
    )
    observations = []
    for review in latest_horizon_reviews:
        record = record_by_id.get(review.get("decision_id"))
        if record:
            try:
                observation = _valid_probability_observation(review, record, today_date)
            except ValueError:
                observation = None
            if observation:
                execution = execution_by_key[record["_decision_key"]]
                observation.update({
                    "subject": record["commodity"],
                    "score_type": "multiclass_brier",
                    "action": record.get("action") or "unclassified",
                    "execution_author_provider": execution["author_provider"],
                    "execution_author_profile": execution["author_profile"],
                    "pipeline_provider": execution["pipeline_provider"],
                    "pipeline_profile": execution["pipeline_profile"],
                })
                observations.append(observation)

    headline_rows = _headline_outcome_rows(records, reviews)
    headline = [(row["record"]["commodity"], row["outcome"]) for row in headline_rows]
    decisive = [(commodity, outcome) for commodity, outcome in headline if outcome in DECISIVE_OUTCOMES]
    directional_rows = []
    for row in headline_rows:
        if row["outcome"] not in DECISIVE_OUTCOMES:
            continue
        record = row["record"]
        execution = execution_by_key[record["_decision_key"]]
        directional_rows.append({
            "subject": record["commodity"],
            "hit": row["outcome"] == "vindicated",
            "pipeline_provider": execution["pipeline_provider"],
            "pipeline_profile": execution["pipeline_profile"],
        })
    basket_rows = [{
        "subject": row["commodity"],
        "basket": row["action"],
        "horizon": row["horizon"],
        "value": row["actual_return_pct"],
        "value_metric": "realized_implementable_return_pct",
        "pipeline_provider": row["pipeline_provider"],
        "pipeline_profile": row["pipeline_profile"],
    } for row in observations]
    n_non_decisive = len(headline) - len(decisive)
    commodities = sorted({record["commodity"] for record in records})
    effective_reviews = _latest_by(
        reviews,
        lambda review: (
            "v2", review.get("decision_id"), review.get("forecast_horizon")
        ) if review.get("schema_version") == "2.0" else (
            "v1", review.get("commodity"), review.get("original_decision_date"), review.get("review_window")
        ),
    )
    out = {
        "generated_at": now,
        "swarm": "commodity",
        "provider_calibration_schema_version": PROVIDER_CALIBRATION_SCHEMA_VERSION,
        "n_commodities_tracked": len(commodities),
        "n_decisions": len({record["_decision_key"] for record in records}),
        "n_reviews": len(reviews) + future_review_count + invalid_review_count,
        "n_valid_reviews_as_of": len(reviews),
        "n_invalid_reviews": invalid_review_count,
        "n_future_reviews_excluded": future_review_count,
        "n_headline_outcomes": len(headline),
        "n_decisive": len(decisive),
        "n_non_decisive": n_non_decisive,
        "n_horizon_observations": len(observations),
        "n_probability_excluded": len(reviews) - len(observations) + future_review_count + invalid_review_count,
        "min_decisive_for_hit_rate": MIN_DECISIVE,
        "min_n_for_slice": MIN_SLICE_N,
        "min_n_for_probability_metrics": MIN_PROBABILITY_N,
        "min_n_for_probability_slice": MIN_PROBABILITY_SLICE_N,
        "hit_rate": None,
        "calibration_by_commodity": {},
        "forecast_calibration": {
            "overall": _metric_slice(observations, MIN_PROBABILITY_N),
            "by_commodity": _slices(observations, "commodity"),
            "by_family": _slices(observations, "family"),
            "by_horizon": _slices(observations, "horizon"),
        },
        "metric_definitions": {
            "bias_pct": "forecast expected implementable return minus realised implementable return",
            "multiclass_brier_score": "three-class bear/base/bull probability score; lower is better",
            "crps": "continuous ranked probability score on the discrete scenario-return distribution; lower is better",
            "maximum_adverse_excursion_pct": "worst implementable return observed from decision anchor through target date",
        },
        "error_taxonomy_distribution": {},
        "decision_quality_distribution": {},
        "calibration_by_provider": {},
        "calibration_by_execution_profile": {},
        "provider_comparison": {},
        "operational_aggregate_label": (
            "Global production-system aggregate across all execution cohorts. It preserves historical "
            "continuity but cannot establish that Claude or Codex is calibrated or better."
        ),
        "verdict": "",
        "honesty_statement": "",
    }
    provider_error_taxonomy = {}
    profile_error_taxonomy = {}
    for review in effective_reviews:
        record = record_for_review(review)
        execution = execution_by_key.get(record.get("_decision_key")) if record else None
        for tag in review.get("error_taxonomy") or []:
            if isinstance(tag, str):
                out["error_taxonomy_distribution"][tag] = out["error_taxonomy_distribution"].get(tag, 0) + 1
                if execution:
                    provider_counts = provider_error_taxonomy.setdefault(execution["pipeline_provider"], {})
                    provider_counts[tag] = provider_counts.get(tag, 0) + 1
                    profile_counts = profile_error_taxonomy.setdefault(execution["pipeline_profile"], {})
                    profile_counts[tag] = profile_counts.get(tag, 0) + 1
        quality = review.get("decision_quality")
        if isinstance(quality, str):
            out["decision_quality_distribution"][quality] = out["decision_quality_distribution"].get(quality, 0) + 1
    for commodity in commodities:
        rows = [outcome for name, outcome in decisive if name == commodity]
        if len(rows) >= MIN_SLICE_N:
            out["calibration_by_commodity"][commodity] = {"hit_rate": round(rows.count("vindicated") / len(rows), 3), "n": len(rows)}
        else:
            out["calibration_by_commodity"][commodity] = f"insufficient (N={len(rows)}; floor {MIN_SLICE_N})"
    if len(decisive) >= MIN_DECISIVE:
        out["hit_rate"] = round(sum(outcome == "vindicated" for _, outcome in decisive) / len(decisive), 3)
        out["verdict"] = f"{len(decisive)} decisive headline calls across {len(commodities)} commodities · hit-rate {out['hit_rate']:.0%}."
    else:
        out["verdict"] = f"Pre-data — {len(decisive)} of {MIN_DECISIVE} decisive headline calls needed before hit rate means anything."
    out["calibration_by_provider"] = execution_slices(
        observations,
        directional_rows,
        basket_rows,
        provider_error_taxonomy,
        forecast_key="execution_author_provider",
        pipeline_key="pipeline_provider",
    )
    out["calibration_by_execution_profile"] = execution_slices(
        observations,
        directional_rows,
        basket_rows,
        profile_error_taxonomy,
        forecast_key="execution_author_profile",
        pipeline_key="pipeline_profile",
    )
    out["provider_comparison"] = provider_comparison(out["calibration_by_provider"])
    out["legacy_provider_sensitivity"] = legacy_sensitivity(execution_by_key.values())
    out["honesty_statement"] = (
        f"Headline hit rate counts each decision at most once; {len(observations)} validated horizon observations are scored separately. "
        f"{out['n_probability_excluded']} legacy, superseded or invalid-probability reviews are excluded from probability calibration. "
        "The global figures are operational aggregates only; provider comparisons never blend cohorts."
    )
    return out


def to_markdown(out):
    overall = out["forecast_calibration"]["overall"]
    lines = [
        f"# Commodity calibration — {out['generated_at'][:10]}", "", out["verdict"], "", out["honesty_statement"], "",
        f"- Unique decisions: {out['n_decisions']}",
        f"- Headline outcomes: {out['n_headline_outcomes']} ({out['n_decisive']} decisive)",
        f"- Horizon observations: {out['n_horizon_observations']}",
        f"- Probability-calibration exclusions: {out['n_probability_excluded']}", "",
        "## Forecast calibration", "",
    ]
    if overall["metrics"] is None:
        lines.append(f"- Overall: {overall['status']}")
    else:
        metrics = overall["metrics"]
        lines.extend([
            f"- Directional accuracy: {metrics['directional_accuracy']:.1%}",
            f"- Mean absolute error: {metrics['mean_absolute_error_pct']:.2f}pp; bias: {metrics['bias_pct']:.2f}pp",
            f"- Multiclass Brier: {metrics['multiclass_brier_score']:.4f}; CRPS: {metrics['crps']:.4f}",
            f"- Range miss rate: {metrics['range_miss_rate']:.1%}; worst adverse excursion: {metrics['maximum_adverse_excursion_pct']['worst']:.2f}%",
        ])
    for title, key in (("Commodity", "by_commodity"), ("Family", "by_family"), ("Horizon", "by_horizon")):
        lines += ["", f"## By {title.lower()}", ""]
        values = out["forecast_calibration"][key]
        if not values:
            lines.append("- No eligible observations.")
        for name, value in values.items():
            if value["metrics"] is None:
                lines.append(f"- **{name}**: {value['status']}")
            else:
                metric = value["metrics"]
                lines.append(f"- **{name}**: direction {metric['directional_accuracy']:.1%}; MAE {metric['mean_absolute_error_pct']:.2f}pp; Brier {metric['multiclass_brier_score']:.4f} (N={value['n']})")
    lines += ["", "## Provider comparison", "", out["provider_comparison"]["policy"], ""]
    for provider in ("claude", "codex"):
        row = (out["calibration_by_provider"].get(provider) or {})
        forecast = row.get("forecast_author_calibration") or {"status": "insufficient", "n": 0}
        directional = row.get("pipeline_directional") or {"status": "insufficient", "n": 0}
        forecast_value = (
            f"Brier {forecast['brier']:.4f} (N={forecast['n']})"
            if forecast.get("status") == "available"
            else f"Brier withheld (N={forecast.get('n', 0)})"
        )
        direction_value = (
            f"headline hit rate {directional['hit_rate']:.1%} (N={directional['n']})"
            if directional.get("status") == "available"
            else f"headline hit rate withheld (N={directional.get('n', 0)})"
        )
        lines.append(f"- **{provider.title()}**: {forecast_value}; {direction_value}.")
    lines.append(f"- Ranking: withheld ({out['provider_comparison']['reason']})")
    lines += ["", "## Error taxonomy", ""]
    lines.extend([f"- {key}: {value}" for key, value in sorted(out["error_taxonomy_distribution"].items())] or ["- None tallied yet."])
    lines += ["", "## Decision quality", ""]
    lines.extend([f"- {key}: {value}" for key, value in sorted(out["decision_quality_distribution"].items())] or ["- None tallied yet."])
    return "\n".join(lines) + "\n"


def _selftest():
    import tempfile

    failures = []
    def check(name, condition):
        if not condition: failures.append(name)

    global REPO
    old_repo = REPO
    with tempfile.TemporaryDirectory() as temporary:
        REPO = temporary
        try:
            latest = _latest_by([
                {"_version": 9, "review_date": "2026-01-01", "value": 9},
                {"_version": 10, "review_date": "2026-01-01", "value": 10},
                {"_version": 2, "review_date": "2026-01-01", "value": 2},
            ], lambda _row: "same")
            check("numeric correction ordering", latest[0]["value"] == 10)

            def write_json(path, value):
                os.makedirs(os.path.dirname(path), exist_ok=True)
                with open(path, "w", encoding="utf-8") as handle:
                    json.dump(value, handle)

            def provenance(provider="codex", mode="single_provider"):
                contributors = [{
                    "provider": provider, "model": f"{provider}-parent",
                    "reasoning_level": "max", "attribution": "recorded",
                    "scopes": ["terminal_adjudication"],
                }, {
                    "provider": provider, "model": f"{provider}-specialist",
                    "reasoning_level": "xhigh", "attribution": "configured", "scopes": ["specialists"],
                }]
                profile = f"{provider}|{provider}-parent:max|{provider}-specialist:xhigh"
                if mode == "mixed_provider":
                    contributors.append({
                        "provider": "claude", "model": "claude-parent", "reasoning_level": "high",
                        "attribution": "recorded", "scopes": ["prior_modules"],
                    })
                    profile = "mixed|claude|claude-parent:high+codex|codex-parent:max"
                contributors = sorted(contributors, key=lambda item: (
                    item["provider"], item.get("model") or "", item.get("reasoning_level") or "",
                    item["attribution"],
                ))
                return {
                    "schema_version": "1.0", "source": "cockpit_runtime",
                    "coverage": "cockpit_top_level_processes", "provider_mode": mode,
                    "profile_key": profile,
                    "decision_author": {
                        "attempt_id": "00000000-0000-4000-8000-000000000001",
                        "provider": provider, "model": f"{provider}-parent",
                        "reasoning_level": "max", "attribution": "recorded",
                    },
                    "contributors": contributors, "cli_versions": {provider: "synthetic"},
                }

            for index in range(5):
                commodity = "GOLD" if index < 3 else "OIL"
                family = "precious-metals" if commodity == "GOLD" else "energy"
                decision_id = f"CMD-{commodity}-2026-01-{index + 1:02d}-{index:012x}"
                run = os.path.join(temporary, "commodity", "runs", commodity)
                archive = os.path.join(run, "decisions", decision_id)
                reviews_dir = os.path.join(run, "reviews")
                os.makedirs(archive, exist_ok=True); os.makedirs(reviews_dir, exist_ok=True)
                scenarios = [
                    {"label": "bear", "probability": 20, "implementable_return_pct": -10},
                    {"label": "base", "probability": 50, "implementable_return_pct": 5},
                    {"label": "bull", "probability": 30, "implementable_return_pct": 20},
                ]
                tactical_target = date(2026, 3, 1 + index).isoformat()
                strategic_target = date(2027, 1, 1 + index).isoformat()
                record = {
                    "swarm": "commodity", "commodity": commodity, "commodity_family": family,
                    "decision_id": decision_id, "decision_date": f"2026-01-{index + 1:02d}",
                    "action": "Hold", "confidence": 60,
                    "current_price": {"value": 100.0, "currency": "USD", "unit": "USD/unit", "as_of": f"2026-01-{index + 1:02d}"},
                    "key_risks": [],
                    "execution_provenance": provenance(
                        "codex", "mixed_provider" if index == 4 else "single_provider"),
                    "forecast_horizons": {
                        "tactical": {"target_date": tactical_target, "scenarios": scenarios},
                        "strategic": {"target_date": strategic_target, "scenarios": scenarios},
                    },
                }
                write_json(os.path.join(archive, "decision_record.json"), record)
                for horizon, actual, label in (("tactical", 8.0, "base"), ("strategic", 22.0, "bull")):
                    target = record["forecast_horizons"][horizon]["target_date"]
                    def outcome_source(series):
                        return {
                            "provider": "Synthetic official provider", "dataset_id": "test.outcomes",
                            "series_id": series, "vintage_id": "sha256:" + "a" * 64,
                            "observation_as_of": target, "published_at": target + "T00:00:00Z",
                            "retrieved_at": target + "T01:00:00Z", "calculation_basis": "Synthetic exact-cutoff calculation",
                        }
                    review = {
                        "schema_version": "2.0", "swarm": "commodity", "commodity": commodity,
                        "decision_id": decision_id, "forecast_horizon": horizon, "target_date": target,
                        "outcome_as_of": target, "original_decision_date": record["decision_date"],
                        "review_date": target, "review_window": horizon, "original_action": "Hold",
                        "original_confidence": 60,
                        "reference_price": record["current_price"],
                        "review_price": {"value": 100.0 + actual, "currency": "USD", "unit": "USD/unit", "as_of": target, "source": "official synthetic close"},
                        "absolute_return_pct": actual,
                        "price_vs_levels": {}, "thesis_status": "confirmed", "action_outcome": "vindicated",
                        "decision_quality": "skill", "risk_results": [], "error_taxonomy": [],
                        "scenario_outcome": label, "range_miss": "above" if actual > 20 else "inside",
                        "max_adverse_excursion_pct": -4.0, "max_adverse_excursion_source": outcome_source("synthetic.adverse-excursion"),
                        "realized_return_components_pct": {"price_return_pct": actual, "roll_return_pct": 0.0, "collateral_return_pct": 0.0, "fees_pct": 0.0, "fx_adjustment_pct": 0.0, "implementable_return_pct": actual},
                        "realized_return_component_sources": {key: outcome_source("synthetic." + key.replace("_", "-")) for key in ("price_return_pct", "roll_return_pct", "collateral_return_pct", "fees_pct", "fx_adjustment_pct")},
                        "lessons": ["synthetic"], "notes": "synthetic exact-date review",
                    }
                    write_json(os.path.join(reviews_dir, f"{target}_{horizon}_decision_review.json"), review)
            check("future target cannot calibrate early", _valid_probability_observation(review, record, date(2026, 12, 31)) is None)
            out = build(today="2027-01-10")
            check("unique decisions", out["n_decisions"] == 5)
            check("horizons separate", out["n_horizon_observations"] == 10)
            check("headline not doubled", out["n_headline_outcomes"] == 5)
            check("probability measured", out["forecast_calibration"]["overall"]["metrics"] is not None)
            metrics = out["forecast_calibration"]["overall"]["metrics"]
            check("directional accuracy", metrics["directional_accuracy"] == 1.0)
            check("mean absolute error", metrics["mean_absolute_error_pct"] == 8.5)
            check("bias", metrics["bias_pct"] == -8.5)
            check("multiclass Brier", metrics["multiclass_brier_score"] == 0.58)
            check("CRPS", metrics["crps"] == 6.55)
            check("range miss", metrics["range_miss_rate"] == 0.5 and metrics["range_miss_distribution"] == {"below": 0, "inside": 5, "above": 5})
            check("adverse excursion", metrics["maximum_adverse_excursion_pct"] == {"mean": -4.0, "worst": -4.0})
            check("family profile-owned", set(out["forecast_calibration"]["by_family"]) == {"energy", "precious-metals"})
            codex_slice = out["calibration_by_provider"]["codex"]
            check("probability rows follow terminal author across a mixed continuation",
                  codex_slice["forecast_author_calibration"]["n"] == 10)
            check("provider Brier requires five distinct commodities",
                  codex_slice["forecast_author_calibration"]["status"] == "insufficient"
                  and codex_slice["forecast_author_calibration"]["n_subjects"] == 2)
            check("mixed headline remains a mixed pipeline outcome",
                  out["calibration_by_provider"]["mixed"]["pipeline_directional"]["n"] == 1
                  and codex_slice["pipeline_directional"]["n"] == 4)
            check("thin provider comparison refuses ranking",
                  out["provider_comparison"]["status"] == "withheld"
                  and out["provider_comparison"]["ranking"] is None)
            drifted = dict(review)
            drifted["original_action"] = "Buy"
            write_json(os.path.join(reviews_dir, f"{target}_{horizon}_decision_review_v2.json"), drifted)
            # Legacy/no-probability review is counted but excluded from probability scores.
            legacy_dir = os.path.join(temporary, "commodity", "runs", "COPPER")
            os.makedirs(os.path.join(legacy_dir, "reviews"), exist_ok=True)
            legacy_record = {"swarm": "commodity", "commodity": "COPPER", "decision_date": "2026-01-01", "action": "Hold", "confidence": 50, "current_price": {"value": 100.0, "currency": "USD", "unit": "USD/unit", "as_of": "2026-01-01"}, "key_risks": []}
            write_json(os.path.join(legacy_dir, "decision_record.json"), legacy_record)
            legacy_review = {"schema_version": "1.0", "swarm": "commodity", "commodity": "COPPER", "original_decision_date": "2026-01-01", "review_date": "2026-02-01", "review_window": "30d", "original_action": "Hold", "original_confidence": 50, "reference_price": legacy_record["current_price"], "review_price": {"value": 105.0, "currency": "USD", "unit": "USD/unit", "as_of": "2026-02-01", "source": "official synthetic close"}, "absolute_return_pct": 5.0, "price_vs_levels": {}, "thesis_status": "confirmed", "action_outcome": "vindicated", "decision_quality": "skill", "risk_results": [], "error_taxonomy": [], "lessons": ["synthetic"], "notes": "synthetic legacy review"}
            write_json(os.path.join(legacy_dir, "reviews", "2026-02-01_30d_decision_review.json"), legacy_review)
            write_json(os.path.join(legacy_dir, "reviews", "2026-02-01_30d_decision_review_v2.json"), {"schema_version": "2.0", "action_outcome": "vindicated"})
            excluded = build(today="2027-01-10")
            check("legacy, anchor-drifted and malformed excluded", excluded["n_probability_excluded"] == 3)
            check("legacy headline once", excluded["n_headline_outcomes"] == 6)
            check("anchor-drifted and malformed reviews excluded", excluded["n_invalid_reviews"] == 2)
        finally:
            REPO = old_repo
    if failures:
        print("SELFTEST FAIL:", ", ".join(failures)); return 1
    print("SELFTEST OK (decision uniqueness, forecast errors, probability scores and family slices)"); return 0


def main(argv):
    if "--selftest" in argv:
        return _selftest()
    out = build()
    os.makedirs(PERF_DIR, exist_ok=True)
    day = out["generated_at"][:10]
    json_path = os.path.join(PERF_DIR, f"{day}_calibration_summary.json")
    md_path = os.path.join(PERF_DIR, f"{day}_calibration_summary.md")
    with open(json_path, "w", encoding="utf-8") as handle:
        json.dump(out, handle, indent=2, ensure_ascii=False); handle.write("\n")
    with open(md_path, "w", encoding="utf-8") as handle:
        handle.write(to_markdown(out))
    print(f"WROTE {_relative(json_path)}"); print(f"WROTE {_relative(md_path)}"); print(out["verdict"])
    if "--print" in argv: print(json.dumps(out, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
