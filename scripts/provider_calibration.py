#!/usr/bin/env python3
"""Shared deterministic provider/profile calibration slices.

This module deliberately knows nothing about equity, commodity, or screener file layouts.  Callers
first join each outcome to its immutable terminal decision record, then pass normalized rows here.
Forecast probabilities are sliced with the decision-author identity; directional and basket outcomes
are sliced with the whole-pipeline identity.  The separation prevents a mixed-provider continuation
from being credited wholesale to whichever provider happened to write the terminal JSON.
"""
from __future__ import annotations

import math
import statistics
import uuid


SCHEMA_VERSION = "1.0"
MIN_BRIER_N = 10
MIN_BRIER_SUBJECTS = 5
MIN_DIRECTIONAL_N = 10
MIN_BASKET_N = 5
RECORDED_PROVIDERS = ("claude", "codex")
PROVIDER_MODES = ("single_provider", "mixed_provider", "partially_observed", "unknown")
TOP_LEVEL_KEYS = {
    "schema_version", "source", "coverage", "provider_mode", "profile_key",
    "decision_author", "contributors", "cli_versions",
}
AUTHOR_KEYS = {"attempt_id", "provider", "model", "reasoning_level", "attribution"}
CONTRIBUTOR_KEYS = {"provider", "model", "reasoning_level", "attribution", "scopes"}


def _non_empty(value):
    return value.strip() if isinstance(value, str) and value.strip() else None


def _canonical_uuid(value):
    if not isinstance(value, str):
        return None
    try:
        parsed = uuid.UUID(value)
    except (AttributeError, ValueError):
        return None
    if str(parsed) != value or parsed.version not in (1, 2, 3, 4, 5, 6, 7, 8):
        return None
    return value


def validate_execution_provenance(provenance):
    """Validate the exact v1 runtime projection consumed by calibration.

    This is intentionally stricter than merely finding plausible-looking provider fields. The cockpit
    owns this projection, so an incomplete or internally inconsistent object has no calibration authority.
    It returns the original projection when valid and ``None`` when invalid; callers then fail into the
    explicit unknown cohort instead of raising during a deterministic scoreboard run.
    """
    if not isinstance(provenance, dict) or set(provenance) != TOP_LEVEL_KEYS:
        return None
    if (
        provenance.get("schema_version") != SCHEMA_VERSION
        or provenance.get("source") != "cockpit_runtime"
        or provenance.get("coverage") != "cockpit_top_level_processes"
        or provenance.get("provider_mode") not in PROVIDER_MODES
        or not _non_empty(provenance.get("profile_key"))
    ):
        return None

    author = provenance.get("decision_author")
    if not isinstance(author, dict) or set(author) != AUTHOR_KEYS:
        return None
    if (
        _canonical_uuid(author.get("attempt_id")) is None
        or author.get("provider") not in RECORDED_PROVIDERS
        or not _non_empty(author.get("model"))
        or not _non_empty(author.get("reasoning_level"))
        or author.get("attribution") != "recorded"
    ):
        return None

    contributors = provenance.get("contributors")
    if not isinstance(contributors, list) or not contributors:
        return None
    contributor_keys = []
    contributor_providers = set()
    normalized_contributors = []
    for contributor in contributors:
        if not isinstance(contributor, dict) or set(contributor) != CONTRIBUTOR_KEYS:
            return None
        provider = contributor.get("provider")
        attribution = contributor.get("attribution")
        model = contributor.get("model")
        reasoning = contributor.get("reasoning_level")
        scopes = contributor.get("scopes")
        if provider not in RECORDED_PROVIDERS or attribution not in ("recorded", "configured"):
            return None
        if model is not None and not _non_empty(model):
            return None
        if reasoning is not None and not _non_empty(reasoning):
            return None
        if attribution == "recorded" and (model is None or reasoning is None):
            return None
        if (
            not isinstance(scopes, list)
            or any(not _non_empty(scope) for scope in scopes)
            or scopes != sorted(set(scopes))
        ):
            return None
        key = (provider, model, reasoning, attribution)
        if key in contributor_keys:
            return None
        contributor_keys.append(key)
        contributor_providers.add(provider)
        normalized_contributors.append(contributor)

    expected_order = sorted(
        normalized_contributors,
        key=lambda item: (
            item["provider"], item.get("model") or "", item.get("reasoning_level") or "",
            item["attribution"],
        ),
    )
    if normalized_contributors != expected_order:
        return None
    if not any(
        item["provider"] == author["provider"]
        and item["model"] == author["model"]
        and item["reasoning_level"] == author["reasoning_level"]
        and item["attribution"] == "recorded"
        for item in contributors
    ):
        return None

    mode = provenance["provider_mode"]
    has_incomplete = any(
        item.get("model") is None or item.get("reasoning_level") is None
        for item in contributors
    )
    if len(contributor_providers) > 1:
        if mode != "mixed_provider" or not provenance["profile_key"].startswith("mixed|"):
            return None
    elif contributor_providers != {author["provider"]}:
        return None
    elif mode == "mixed_provider" or mode == "unknown":
        return None
    elif mode == "single_provider" and has_incomplete:
        # The projector deterministically labels any missing nested tuple partially observed.
        return None
    # A fully populated partially_observed projection remains valid: prior_unobserved is a manifest-only
    # fact that intentionally does not leak into the terminal record, so incompleteness is not re-provable.

    profile_key = provenance["profile_key"]
    structured_providers = {
        provider for provider in RECORDED_PROVIDERS
        if f"{provider}|" in profile_key or f"{provider}:" in profile_key
    }
    if structured_providers:
        expected_providers = contributor_providers if mode == "mixed_provider" else {author["provider"]}
        if structured_providers != expected_providers:
            return None
        author_pipe = f"{author['provider']}|{author['model']}:{author['reasoning_level']}"
        author_colon = f"{author['provider']}:{author['model']}:{author['reasoning_level']}"
        if author_pipe not in profile_key and author_colon not in profile_key:
            return None

    cli_versions = provenance.get("cli_versions")
    if not isinstance(cli_versions, dict):
        return None
    if any(
        provider not in contributor_providers or not _non_empty(version)
        for provider, version in cli_versions.items()
    ):
        return None
    return provenance


def _unknown_identity():
    return {
        "status": "unknown",
        "author_provider": "unknown",
        "author_profile": "unknown",
        "pipeline_provider": "unknown",
        "pipeline_profile": "unknown",
        "provider_mode": "unknown",
    }


def execution_identity(record, legacy_evidence=None):
    """Return conservative author and whole-pipeline cohort identities.

    Historical records are never rewritten or guessed from their date.  A separately audited proof
    may place them in the labelled ``legacy_inferred_claude`` sensitivity cohort; both legacy cohorts
    remain outside the recorded Claude/Codex comparison.
    """
    has_provenance = isinstance(record, dict) and "execution_provenance" in record
    provenance = record.get("execution_provenance") if has_provenance else None
    if not has_provenance:
        proven_claude = (
            isinstance(legacy_evidence, dict)
            and legacy_evidence.get("provider") == "claude"
            and legacy_evidence.get("basis") == "pre_rollout_cockpit_history"
            and legacy_evidence.get("verified") is True
        )
        cohort = "legacy_inferred_claude" if proven_claude else "unknown_legacy"
        return {
            "status": cohort,
            "author_provider": cohort,
            "author_profile": cohort,
            "pipeline_provider": cohort,
            "pipeline_profile": cohort,
            "provider_mode": "unknown",
        }

    provenance = validate_execution_provenance(provenance)
    if provenance is None:
        return _unknown_identity()

    author = provenance.get("decision_author")
    provider = author["provider"]
    attribution = author.get("attribution")
    model = author["model"].strip()
    reasoning = author["reasoning_level"].strip()
    author_profile = f"{provider}|{model}:{reasoning}"
    configured_profile = provenance.get("profile_key") if isinstance(provenance.get("profile_key"), str) else ""
    configured_profile = configured_profile.strip() or "unknown-profile"
    mode = provenance["provider_mode"]

    author_provider_cohort = provider
    author_profile_cohort = author_profile

    contributors = provenance.get("contributors")
    contributor_providers = {
        row.get("provider").strip()
        for row in (contributors if isinstance(contributors, list) else [])
        if isinstance(row, dict)
        and isinstance(row.get("provider"), str)
        and row.get("provider").strip()
    }
    if (
        mode == "single_provider"
        and attribution == "recorded"
        and provider != "unknown"
        and contributor_providers <= {provider}
    ):
        pipeline_provider = provider
        pipeline_profile = configured_profile
        status = "recorded_single_provider"
    elif mode == "mixed_provider":
        pipeline_provider = "mixed"
        pipeline_profile = (
            configured_profile
            if configured_profile.startswith("mixed|")
            else f"mixed|{configured_profile}"
        )
        status = "recorded_mixed_provider"
    elif mode == "partially_observed":
        pipeline_provider = "partially_observed"
        pipeline_profile = f"partially_observed|{configured_profile}"
        status = "partially_observed"
    else:
        pipeline_provider = "unknown"
        pipeline_profile = "unknown"
        status = "unknown"
    return {
        "status": status,
        "author_provider": author_provider_cohort,
        "author_profile": author_profile_cohort,
        "pipeline_provider": pipeline_provider,
        "pipeline_profile": pipeline_profile,
        "provider_mode": mode,
    }


def _forecast_metric(rows):
    n = len(rows)
    n_subjects = len({row.get("subject") for row in rows if row.get("subject")})
    result = {
        "status": "insufficient",
        "n": n,
        "n_subjects": n_subjects,
        "floor": {"n": MIN_BRIER_N, "distinct_subjects": MIN_BRIER_SUBJECTS},
        "brier": None,
        "score_type": None,
    }
    if n < MIN_BRIER_N or n_subjects < MIN_BRIER_SUBJECTS:
        return result

    scores = []
    score_types = set()
    for row in rows:
        if (
            isinstance(row.get("brier_score"), (int, float))
            and not isinstance(row.get("brier_score"), bool)
            and math.isfinite(float(row["brier_score"]))
        ):
            scores.append(float(row["brier_score"]))
            score_types.add(row.get("score_type") or "precomputed_brier")
            continue
        probability, realized = row.get("probability"), row.get("realized")
        if not (
            isinstance(probability, (int, float))
            and not isinstance(probability, bool)
            and isinstance(realized, (int, float))
            and not isinstance(realized, bool)
            and math.isfinite(float(probability))
            and math.isfinite(float(realized))
        ):
            # Callers normalize rows, but a malformed row must never turn into a flattering score.
            return result
        scores.append((float(probability) - float(realized)) ** 2)
        score_types.add(row.get("score_type") or "binary_brier")
    result.update({
        "status": "available",
        "brier": round(sum(scores) / n, 6),
        "score_type": next(iter(score_types)) if len(score_types) == 1 else "mixed_brier_contracts",
    })
    if all(
        isinstance(row.get("error_pct"), (int, float))
        and not isinstance(row.get("error_pct"), bool)
        and math.isfinite(float(row["error_pct"]))
        for row in rows
    ):
        errors = [float(row["error_pct"]) for row in rows]
        result["mean_absolute_error_pct"] = round(sum(abs(value) for value in errors) / n, 4)
        result["bias_pct"] = round(sum(errors) / n, 4)
    if all(isinstance(row.get("direction_correct"), bool) for row in rows):
        result["directional_accuracy"] = round(
            sum(row["direction_correct"] for row in rows) / n, 4)
    if all(
        isinstance(row.get("crps"), (int, float))
        and not isinstance(row.get("crps"), bool)
        and math.isfinite(float(row["crps"]))
        for row in rows
    ):
        result["crps"] = round(sum(float(row["crps"]) for row in rows) / n, 6)
    return result


def _directional_metric(rows):
    n = len(rows)
    hits = sum(1 for row in rows if row.get("hit") is True or row.get("hit") == 1)
    result = {
        "status": "insufficient",
        "n": n,
        "k_hits": hits,
        "floor": {"n": MIN_DIRECTIONAL_N},
        "hit_rate": None,
    }
    if n >= MIN_DIRECTIONAL_N:
        result.update({"status": "available", "hit_rate": round(hits / n, 4)})
    return result


def _basket_metrics(rows):
    groups = {}
    for row in rows:
        basket = row.get("basket") or "unclassified"
        horizon = row.get("horizon") or "unmatched"
        groups.setdefault((basket, horizon), []).append(row)
    result = {}
    for (basket, horizon), cohort in sorted(groups.items()):
        n = len(cohort)
        available = n >= MIN_BASKET_N and horizon != "unmatched"
        metrics = {
            "status": "available" if available else "insufficient",
            "n": n,
            "floor": {"n": MIN_BASKET_N, "matched_horizon_required": True},
            "value_metric": cohort[0].get("value_metric") or "outcome_value",
            "mean_value": None,
        }
        if available:
            values = [
                float(row["value"])
                for row in cohort
                if isinstance(row.get("value"), (int, float))
                and not isinstance(row.get("value"), bool)
                and math.isfinite(float(row["value"]))
            ]
            if len(values) == n:
                metrics["mean_value"] = round(statistics.mean(values), 4)
            else:
                metrics["status"] = "insufficient"
        result.setdefault(basket, {})[horizon] = metrics
    return result


def execution_slices(
    forecast_rows,
    directional_rows,
    basket_rows,
    error_counts,
    *,
    forecast_key,
    pipeline_key,
):
    """Build provider or exact-profile slices with the applicable floor enforced per cohort."""
    cohorts = (
        {row.get(forecast_key) for row in forecast_rows}
        | {row.get(pipeline_key) for row in directional_rows}
        | {row.get(pipeline_key) for row in basket_rows}
        | set(error_counts)
    )
    cohorts.discard(None)
    out = {}
    for cohort in sorted(cohorts):
        out[cohort] = {
            "forecast_author_calibration": _forecast_metric(
                [row for row in forecast_rows if row.get(forecast_key) == cohort]
            ),
            "pipeline_directional": _directional_metric(
                [row for row in directional_rows if row.get(pipeline_key) == cohort]
            ),
            "pipeline_basket_outcomes": _basket_metrics(
                [row for row in basket_rows if row.get(pipeline_key) == cohort]
            ),
            "error_taxonomy_distribution": dict(sorted((error_counts.get(cohort) or {}).items())),
            "attribution_policy": (
                "Forecast/Brier rows follow decision_author; directional/headline and basket outcomes "
                "follow the whole-pipeline execution cohort. Mixed, partial, and legacy cohorts are "
                "never reassigned."
            ),
        }
    return out


def provider_comparison(slices):
    """Return a non-blended, floor-gated Claude/Codex comparison; never rank automatically."""
    def metric(provider, field):
        return (slices.get(provider) or {}).get(field) or {
            "status": "insufficient", "n": 0, "brier": None, "hit_rate": None,
        }

    forecast = {provider: metric(provider, "forecast_author_calibration") for provider in RECORDED_PROVIDERS}
    directional = {provider: metric(provider, "pipeline_directional") for provider in RECORDED_PROVIDERS}
    forecast_ready = all(forecast[name].get("status") == "available" for name in RECORDED_PROVIDERS)
    directional_ready = all(directional[name].get("status") == "available" for name in RECORDED_PROVIDERS)

    claude_baskets = (slices.get("claude") or {}).get("pipeline_basket_outcomes") or {}
    codex_baskets = (slices.get("codex") or {}).get("pipeline_basket_outcomes") or {}
    common_baskets = []
    for basket in sorted(set(claude_baskets) & set(codex_baskets)):
        for horizon in sorted(set(claude_baskets[basket]) & set(codex_baskets[basket])):
            if (
                claude_baskets[basket][horizon].get("status") == "available"
                and codex_baskets[basket][horizon].get("status") == "available"
            ):
                common_baskets.append({"basket": basket, "horizon": horizon})

    any_ready = forecast_ready or directional_ready or bool(common_baskets)
    return {
        "status": "ready_for_side_by_side" if any_ready else "withheld",
        "policy": (
            "No blended provider hit rate. Each recorded cohort is reported separately. A metric is "
            "comparable only when Claude and Codex independently clear its floor at a matched horizon. "
            "No automated superiority ranking or provider-specific confidence haircut is produced."
        ),
        "forecast_calibration": {
            "comparison_ready": forecast_ready,
            "claude": forecast["claude"],
            "codex": forecast["codex"],
        },
        "directional_hit_rate": {
            "comparison_ready": directional_ready,
            "claude": directional["claude"],
            "codex": directional["codex"],
        },
        "matched_basket_horizons_ready": common_baskets,
        "excluded_from_recorded_head_to_head": sorted(
            cohort for cohort in slices if cohort not in RECORDED_PROVIDERS
        ),
        "ranking": None,
        "reason": (
            "At least one side-by-side metric independently cleared its floor; inspect the separate "
            "cohorts. No automatic ranking is asserted."
            if any_ready
            else "Claude and Codex have not both independently cleared any applicable metric floor; "
            "provider ranking and provider-specific confidence haircuts are refused."
        ),
    }


def legacy_sensitivity(identities):
    rows = list(identities)
    return {
        "legacy_inferred_claude": sum(row.get("status") == "legacy_inferred_claude" for row in rows),
        "unknown_legacy": sum(row.get("status") == "unknown_legacy" for row in rows),
        "policy": (
            "legacy_inferred_claude requires a separately verified pre_rollout_cockpit_history proof. "
            "Age or missing provenance alone remains unknown_legacy. Both cohorts are sensitivity-only "
            "and excluded from recorded Claude-versus-Codex comparisons."
        ),
    }
