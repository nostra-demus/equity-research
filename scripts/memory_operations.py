#!/usr/bin/env python3
"""Deterministic, read-only Phase 6 operational-readiness reporting.

This module normalizes content-free evidence produced by the earlier memory phases.  It
does not run maintenance, schedule work, mutate a projection, append an event, or turn a
synthetic retrieval fixture into a production-adoption claim.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import math
import os
import re
import stat
import sys
from pathlib import Path
from typing import Any, Mapping, Sequence

try:
    from canonical_json import canonical_json_bytes, canonical_sha256
    from validate_screener_json import Checker
except ImportError:  # pragma: no cover - package-style imports
    from scripts.canonical_json import canonical_json_bytes, canonical_sha256
    from scripts.validate_screener_json import Checker


REPORT_SCHEMA = "memory-operational-readiness-report/v1"
REPORT_SCHEMA_PATH = (
    Path(__file__).resolve().parents[1]
    / "frameworks"
    / "memory"
    / "operational-readiness-report-v1.schema.json"
)
PHASE0_BENCHMARK_VERSION = "memory-held-out-benchmark/v1"
PHASE0_BENCHMARK_SHA256 = (
    "1178a2bf73edb3b1cb416dfc08a32c2bf488d283e96a36ce5356e65d14feaa03"
)
PHASE0_BASELINE_CANONICAL_SHA256 = (
    "a7fb9657b6a6dbd264e5574db91b593aa7a6451b8ca24f953918f399b6331914"
)
PHASE0_BASELINE_CORPUS_SHA256 = (
    "3b61aa1ca570840f09893e5a65c3c7ccce04eedb12b5418ec336258be83731c8"
)
PHASE0_BASELINE_CORPUS_TOTAL_BYTES = 56_094_423
PHASE0_BASELINE_CORPUS_UNIQUE_FILES = 1_258
PHASE0_CASE_COUNT = 63
PHASE3_REPORT_SCHEMA = "memory-retrieval-benchmark-report/v1"
PROJECTION_DOCTOR_SCHEMA = "memory-cli-report/v1"
STORE_DOCTOR_SCHEMA = "memory-store-doctor-report/v1"

SCALE_CANDIDATES = (
    "postgresql",
    "graph-engine",
    "vector-index",
    "remote-object-store",
)
SCALE_ACTIONS = {
    "postgresql": ("stay-sqlite", "consider-postgresql"),
    "graph-engine": ("do-not-add", "consider-graph-engine"),
    "vector-index": ("do-not-add", "consider-vector-index"),
    "remote-object-store": ("do-not-add", "consider-remote-object-store"),
}

_SHA256_RE = re.compile(r"^(?:sha256:)?[0-9a-f]{64}$")
_BARE_SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
_RFC3339_RE = re.compile(
    r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$"
)
_MAX_INPUT_BYTES = 16_000_000
_MAX_JSON_DEPTH = 128
_MAX_JSON_NODES = 100_000
_MAX_SAFE_INTEGER = 9_007_199_254_740_991
_PHASE0_CORPUS_FIELDS = frozenset(
    {"sha256", "total_bytes", "unique_files_considered"}
)
_PHASE0_CASE_FIELDS = frozenset(
    {
        "category",
        "complete_evidence_recall",
        "evidence_hits",
        "evidence_misses",
        "expected_outcome",
        "first_evidence_rank",
        "forbidden_hits",
        "id",
        "protected_hits",
        "reciprocal_rank",
    }
)
_PHASE0_METRIC_FIELDS = frozenset(
    {
        "complete_evidence_recall_at_k",
        "evidence_path_recall_at_k",
        "mean_reciprocal_rank",
        "protected_path_intrusions",
        "temporal_forbidden_path_hits",
        "temporal_leakage_case_rate",
    }
)
_PHASE0_CATEGORIES = frozenset(
    {
        "fact_recall",
        "temporal_cutoff",
        "knowledge_update",
        "contradiction",
        "qualifier",
        "lineage",
        "entity_resolution",
        "abstention",
        "access_control",
    }
)
_PHASE0_ALL_EVIDENCE_CASES = frozenset(
    {
        "update-001-emaar-standing",
        "update-002-bg-probability-scale",
        "update-003-amzn-broken",
        "update-004-tmcv-math",
        "update-005-nhy-forecast-result",
        "update-006-hcg-window-fault",
        "update-007-uber-latest",
        "contradiction-001-amzn-margin",
        "contradiction-003-tmcv-headline",
        "lineage-001-amzn-base-value",
        "lineage-002-orcl-leverage",
        "lineage-003-emaar-owner-cap",
        "lineage-004-haier-margin-trigger",
        "lineage-005-grab-signal-thesis",
        "lineage-006-wheat-balance",
        "lineage-007-gold-postmortem",
        "entity-004-screener-identifiers",
    }
)

_CONTROLLED_WRITE_FIELDS = frozenset(
    {
        "schema",
        "window_start",
        "window_end",
        "valid_append_attempts",
        "successful_appends",
        "rejected_invalid_writes",
        "committed_event_loss_count",
    }
)
_PERFORMANCE_FIELDS = frozenset(
    {
        "schema",
        "window_start",
        "window_end",
        "issuer_query_count",
        "retrieval_p95_millis",
        "context_compilation_p95_millis",
    }
)
_RESTORE_FIELDS = frozenset(
    {
        "schema",
        "performed_at",
        "full_restore_completed",
        "recovery_time_millis",
        "committed_event_loss_count",
    }
)
_ACCESS_FIELDS = frozenset(
    {
        "schema",
        "window_start",
        "window_end",
        "audit_complete",
        "known_policy_leaks",
        "post_cutoff_fact_count",
    }
)
_SCHEMA_REVIEW_FIELDS = frozenset(
    {
        "schema",
        "reviewed_at",
        "review_complete",
        "overdue_schema_count",
    }
)
_SCALE_COMPARISON_FIELDS = frozenset(
    {
        "schema",
        "candidate",
        "workload_sha256",
        "sample_size",
        "reference_slo_met",
        "candidate_slo_met",
        "correctness_regressions",
        "known_policy_leaks",
    }
)
_PHASE3_REPORT_FIELDS = frozenset(
    {
        "schema",
        "case_count",
        "cases",
        "aggregate",
        "gate",
        "latency_informational",
        "latency_is_adoption_gate",
    }
)
_PHASE3_CASE_FIELDS = frozenset(
    {
        "id",
        "lexical_reference",
        "hybrid",
        "forbidden_hit_count",
        "protected_intrusion_count",
        "contradiction_coverage_complete",
        "object_lineage_complete",
        "rebuild_deterministic",
        "designated_strict_improvement",
        "strictly_improved",
        "packet_sha256",
        "manifest_sha256",
    }
)
_PHASE3_METRIC_FIELDS = frozenset(
    {"recall", "mean_reciprocal_rank", "evidence_hits"}
)
_PHASE3_AGGREGATE_FIELDS = frozenset(
    {
        "lexical_reference_recall",
        "hybrid_recall",
        "lexical_reference_mean_reciprocal_rank",
        "hybrid_mean_reciprocal_rank",
    }
)
_PHASE3_GATE_FIELDS = frozenset({"passed", "failures", "requirements"})
_PHASE3_REQUIREMENT_FIELDS = frozenset(
    {
        "zero_access_or_post_cutoff_leakage",
        "deterministic_packet_and_manifest",
        "contradiction_and_lineage_coverage",
        "hybrid_recall_and_mrr_not_below_lexical",
        "designated_strict_improvement",
    }
)
_PHASE3_LATENCY_FIELDS = frozenset(
    {"lexical_reference_millis", "hybrid_millis", "rebuild_millis"}
)
_PHASE3_LATENCY_SUMMARY_FIELDS = frozenset({"p50_millis", "p95_millis"})


class OperationsError(ValueError):
    """Operational evidence is malformed, contradictory, or cannot be verified."""


def _exact_mapping(value: Any, fields: frozenset[str], label: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise OperationsError(f"{label} must be an object")
    extras = sorted(set(value) - fields)
    missing = sorted(fields - set(value))
    if extras or missing:
        raise OperationsError(
            f"{label} must contain exactly {sorted(fields)!r}; "
            f"missing={missing!r}, extra={extras!r}"
        )
    return value


def _bounded_string(value: Any, label: str, *, maximum: int = 512) -> str:
    if not isinstance(value, str) or not value or len(value) > maximum:
        raise OperationsError(f"{label} must be a non-empty string of at most {maximum} characters")
    return value


def _integer(value: Any, label: str, *, minimum: int = 0) -> int:
    if type(value) is not int or value < minimum:
        raise OperationsError(f"{label} must be an integer >= {minimum}")
    return value


def _number(value: Any, label: str, *, minimum: float = 0.0) -> float:
    if (
        not isinstance(value, (int, float))
        or isinstance(value, bool)
        or not math.isfinite(float(value))
        or float(value) < minimum
    ):
        raise OperationsError(f"{label} must be a finite number >= {minimum}")
    return float(value)


def _boolean(value: Any, label: str) -> bool:
    if type(value) is not bool:
        raise OperationsError(f"{label} must be a boolean")
    return value


def _hash_ref(value: Any, label: str) -> str:
    if not isinstance(value, str) or _SHA256_RE.fullmatch(value) is None:
        raise OperationsError(f"{label} must be a lowercase SHA-256 digest")
    return "sha256:" + value.removeprefix("sha256:")


def _instant(value: Any, label: str) -> tuple[str, dt.datetime]:
    if not isinstance(value, str) or _RFC3339_RE.fullmatch(value) is None:
        raise OperationsError(f"{label} must be an aware RFC 3339 date-time")
    try:
        parsed = dt.datetime.fromisoformat(value.removesuffix("Z") + ("+00:00" if value.endswith("Z") else ""))
    except ValueError as exc:
        raise OperationsError(f"{label} must be a real RFC 3339 date-time") from exc
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise OperationsError(f"{label} must include an explicit UTC offset")
    utc = parsed.astimezone(dt.timezone.utc)
    rendered = utc.isoformat(timespec="microseconds").replace("+00:00", "Z")
    return rendered, utc


def _day(value: Any, label: str) -> tuple[str, dt.datetime]:
    if not isinstance(value, str):
        raise OperationsError(f"{label} must be a YYYY-MM-DD date")
    try:
        parsed = dt.date.fromisoformat(value)
    except ValueError as exc:
        raise OperationsError(f"{label} must be a real YYYY-MM-DD date") from exc
    return value, dt.datetime.combine(parsed, dt.time.min, tzinfo=dt.timezone.utc)


def _canonical_digest(value: Mapping[str, Any], label: str) -> str:
    try:
        return "sha256:" + canonical_sha256(dict(value))
    except (TypeError, ValueError, RecursionError) as exc:
        raise OperationsError(f"{label} is not canonical-JSON compatible: {exc}") from exc


def _ratio(numerator: int, denominator: int) -> float:
    return round(numerator / denominator, 6) if denominator else 0.0


def _string_array(value: Any, label: str) -> list[str]:
    if not isinstance(value, list) or not all(
        isinstance(item, str) and item and len(item) <= 4096 for item in value
    ):
        raise OperationsError(f"{label} must be an array of bounded non-empty strings")
    if len(value) != len(set(value)):
        raise OperationsError(f"{label} must not contain duplicates")
    return list(value)


def _phase0_corpus(value: Any, label: str) -> dict[str, Any]:
    corpus = _exact_mapping(value, _PHASE0_CORPUS_FIELDS, label)
    digest = corpus.get("sha256")
    if not isinstance(digest, str) or _BARE_SHA256_RE.fullmatch(digest) is None:
        raise OperationsError(f"{label}.sha256 must be a bare lowercase SHA-256 digest")
    total_bytes = _integer(corpus.get("total_bytes"), f"{label}.total_bytes")
    unique_files = _integer(
        corpus.get("unique_files_considered"),
        f"{label}.unique_files_considered",
        minimum=1,
    )
    if total_bytes > _MAX_SAFE_INTEGER or unique_files > _MAX_SAFE_INTEGER:
        raise OperationsError(f"{label} counts must be JSON safe integers")
    return {
        "sha256": digest,
        "total_bytes": total_bytes,
        "unique_files_considered": unique_files,
    }


def _phase0_metrics_from_cases(cases: Sequence[Mapping[str, Any]]) -> dict[str, Any]:
    complete = sum(bool(row["complete_evidence_recall"]) for row in cases)
    hit_count = sum(len(row["evidence_hits"]) for row in cases)
    target_count = hit_count + sum(len(row["evidence_misses"]) for row in cases)
    temporal = [row for row in cases if row["category"] == "temporal_cutoff"]
    temporal_hits = sum(len(row["forbidden_hits"]) for row in temporal)
    return {
        "complete_evidence_recall_at_k": _ratio(complete, len(cases)),
        "evidence_path_recall_at_k": _ratio(hit_count, target_count),
        "mean_reciprocal_rank": round(
            sum(float(row["reciprocal_rank"]) for row in cases) / len(cases), 6
        ),
        "protected_path_intrusions": sum(len(row["protected_hits"]) for row in cases),
        "temporal_forbidden_path_hits": temporal_hits,
        "temporal_leakage_case_rate": _ratio(
            sum(bool(row["forbidden_hits"]) for row in temporal), len(temporal)
        ),
    }


def _phase0_report(
    report: Any,
    *,
    label: str,
    expected_cases: Mapping[str, tuple[str, str, tuple[str, ...]]] | None = None,
) -> dict[str, Any]:
    if not isinstance(report, Mapping):
        raise OperationsError(f"{label} must be an object")
    benchmark = report.get("benchmark")
    if not isinstance(benchmark, Mapping) or set(benchmark) != {
        "as_of", "case_count", "sha256", "top_k", "version"
    }:
        raise OperationsError(f"{label}.benchmark is not the closed Phase 0 benchmark anchor")
    if benchmark.get("version") != PHASE0_BENCHMARK_VERSION:
        raise OperationsError(f"{label} uses an unsupported benchmark version")
    if benchmark.get("case_count") != PHASE0_CASE_COUNT:
        raise OperationsError(f"{label} must evaluate exactly {PHASE0_CASE_COUNT} cases")
    if benchmark.get("sha256") != PHASE0_BENCHMARK_SHA256:
        raise OperationsError(f"{label} does not bind the reviewed Phase 0 benchmark bytes")
    top_k = _integer(benchmark.get("top_k"), f"{label}.benchmark.top_k", minimum=1)
    if top_k > 20:
        raise OperationsError(f"{label}.benchmark.top_k exceeds 20")
    benchmark_as_of, _ = _day(benchmark.get("as_of"), f"{label}.benchmark.as_of")
    method = report.get("method")
    if (
        not isinstance(method, Mapping)
        or method.get("ranking_inputs") != ["question", "search_roots"]
        or method.get("scoring_fields_hidden_until_after_ranking") is not True
    ):
        raise OperationsError(f"{label} does not preserve the held-out retrieval boundary")
    corpus = _phase0_corpus(report.get("corpus"), f"{label}.corpus")

    rows = report.get("cases")
    if not isinstance(rows, list) or len(rows) != PHASE0_CASE_COUNT:
        raise OperationsError(f"{label}.cases must contain exactly {PHASE0_CASE_COUNT} rows")
    normalized_cases: list[Mapping[str, Any]] = []
    identities: dict[str, tuple[str, str, tuple[str, ...]]] = {}
    for position, row in enumerate(rows, 1):
        row = _exact_mapping(row, _PHASE0_CASE_FIELDS, f"{label}.cases[{position - 1}]")
        case_id = _bounded_string(row.get("id"), f"{label}.cases[{position - 1}].id", maximum=128)
        category = _bounded_string(
            row.get("category"), f"{label}.cases[{position - 1}].category", maximum=64
        )
        if category not in _PHASE0_CATEGORIES:
            raise OperationsError(f"{label}.{case_id} has unsupported category {category!r}")
        if case_id in identities:
            raise OperationsError(f"{label} contains duplicate case ID {case_id!r}")
        _boolean(row.get("complete_evidence_recall"), f"{label}.{case_id}.complete")
        hits = _string_array(row.get("evidence_hits"), f"{label}.{case_id}.evidence_hits")
        misses = _string_array(row.get("evidence_misses"), f"{label}.{case_id}.evidence_misses")
        if set(hits).intersection(misses):
            raise OperationsError(f"{label}.{case_id} has an evidence path in hits and misses")
        if not hits and not misses:
            raise OperationsError(f"{label}.{case_id} has no evidence target")
        _string_array(row.get("forbidden_hits"), f"{label}.{case_id}.forbidden_hits")
        _string_array(row.get("protected_hits"), f"{label}.{case_id}.protected_hits")
        rank = row.get("first_evidence_rank")
        if rank is not None:
            rank = _integer(rank, f"{label}.{case_id}.first_evidence_rank", minimum=1)
            if rank > top_k:
                raise OperationsError(f"{label}.{case_id}.first_evidence_rank exceeds top_k")
        reciprocal_rank = _number(row.get("reciprocal_rank"), f"{label}.{case_id}.reciprocal_rank")
        expected_rr = round(1 / rank, 6) if rank is not None else 0.0
        if reciprocal_rank != expected_rr:
            raise OperationsError(f"{label}.{case_id}.reciprocal_rank does not match first rank")
        if bool(hits) != (rank is not None):
            raise OperationsError(f"{label}.{case_id} evidence hits do not match first rank")
        expected_complete = not misses if case_id in _PHASE0_ALL_EVIDENCE_CASES else bool(hits)
        if row["complete_evidence_recall"] is not expected_complete:
            raise OperationsError(f"{label}.{case_id} complete recall does not match evidence mode")
        expected_outcome = _bounded_string(
            row.get("expected_outcome"), f"{label}.{case_id}.expected_outcome", maximum=64
        )
        if expected_outcome not in {"retrieve", "abstain", "deny"}:
            raise OperationsError(f"{label}.{case_id}.expected_outcome is unsupported")
        identities[case_id] = (
            category,
            expected_outcome,
            tuple(sorted(hits + misses)),
        )
        normalized_cases.append(row)
    category_counts = {
        category: sum(row["category"] == category for row in normalized_cases)
        for category in _PHASE0_CATEGORIES
    }
    if any(count != 7 for count in category_counts.values()):
        raise OperationsError(f"{label} must retain seven cases in each Phase 0 category")
    if expected_cases is not None and identities != dict(expected_cases):
        raise OperationsError(f"{label} does not evaluate the exact Phase 0 case IDs/categories")

    metrics = _exact_mapping(report.get("metrics"), _PHASE0_METRIC_FIELDS, f"{label}.metrics")
    calculated = _phase0_metrics_from_cases(normalized_cases)
    for name in (
        "complete_evidence_recall_at_k",
        "evidence_path_recall_at_k",
        "mean_reciprocal_rank",
        "temporal_leakage_case_rate",
    ):
        supplied = _number(metrics.get(name), f"{label}.metrics.{name}")
        if supplied > 1 or supplied != calculated[name]:
            raise OperationsError(f"{label}.metrics.{name} does not match its case rows")
    for name in ("protected_path_intrusions", "temporal_forbidden_path_hits"):
        supplied = _integer(metrics.get(name), f"{label}.metrics.{name}")
        if supplied != calculated[name]:
            raise OperationsError(f"{label}.metrics.{name} does not match its case rows")

    digest = _canonical_digest(report, label)
    if (
        label == "phase0_baseline_report"
        and digest != "sha256:" + PHASE0_BASELINE_CANONICAL_SHA256
    ):
        raise OperationsError("phase0_baseline_report does not match the reviewed baseline snapshot")
    return {
        "digest": digest,
        "benchmark_as_of": benchmark_as_of,
        "case_identities": identities,
        "corpus": corpus,
        "metrics": calculated,
    }


def _adoption(
    baseline_report: Mapping[str, Any], candidate_report: Mapping[str, Any] | None
) -> dict[str, Any]:
    baseline = _phase0_report(baseline_report, label="phase0_baseline_report")
    candidate = None
    if candidate_report is not None:
        candidate = _phase0_report(
            candidate_report,
            label="phase0_candidate_report",
            expected_cases=baseline["case_identities"],
        )
    baseline_metrics = baseline["metrics"]
    candidate_metrics = candidate["metrics"] if candidate is not None else None
    if candidate is None:
        status = "unmeasured"
        comparison = "unmeasured"
        corpus_match = "unmeasured"
    elif candidate["corpus"] != baseline["corpus"]:
        status = "unmeasured"
        comparison = "corpus-mismatch"
        corpus_match = "mismatched"
    else:
        corpus_match = "matched"
        non_regressed = all(
            candidate_metrics[name] >= baseline_metrics[name]
            for name in (
                "complete_evidence_recall_at_k",
                "evidence_path_recall_at_k",
                "mean_reciprocal_rank",
            )
        )
        strictly_improved = any(
            candidate_metrics[name] > baseline_metrics[name]
            for name in (
                "complete_evidence_recall_at_k",
                "evidence_path_recall_at_k",
                "mean_reciprocal_rank",
            )
        )
        serious_errors_clear = (
            candidate_metrics["protected_path_intrusions"] == 0
            and candidate_metrics["temporal_forbidden_path_hits"] == 0
            and candidate_metrics["temporal_leakage_case_rate"] == 0
        )
        if non_regressed and strictly_improved and serious_errors_clear:
            status = "met"
            comparison = "non-regressed-with-strict-improvement-and-zero-serious-leakage"
        else:
            status = "failed"
            comparison = "regressed-no-improvement-or-serious-leakage"
    return {
        "production_benchmark": {
            "status": status,
            "benchmark_version": PHASE0_BENCHMARK_VERSION,
            "benchmark_as_of": baseline["benchmark_as_of"],
            "case_count": PHASE0_CASE_COUNT,
            "benchmark_sha256": "sha256:" + PHASE0_BENCHMARK_SHA256,
            "baseline_report_sha256": baseline["digest"],
            "candidate_report_sha256": candidate["digest"] if candidate is not None else None,
            "baseline_corpus": baseline["corpus"],
            "candidate_corpus": candidate["corpus"] if candidate is not None else None,
            "corpus_match": corpus_match,
            "baseline_metrics": baseline_metrics,
            "candidate_metrics": candidate_metrics,
            "comparison": comparison,
        },
        "phase3_synthetic": {
            "status": "unmeasured",
            "report_sha256": None,
            "case_count": None,
            "gate_passed": None,
            "counts_as_production_adoption": False,
        },
    }


def _phase3_metric(value: Any, label: str) -> dict[str, Any]:
    metric = _exact_mapping(value, _PHASE3_METRIC_FIELDS, label)
    recall = _number(metric.get("recall"), f"{label}.recall")
    reciprocal_rank = _number(
        metric.get("mean_reciprocal_rank"), f"{label}.mean_reciprocal_rank"
    )
    if recall > 1 or reciprocal_rank > 1:
        raise OperationsError(f"{label} recall and reciprocal rank must be in [0,1]")
    hits = _string_array(metric.get("evidence_hits"), f"{label}.evidence_hits")
    if len(hits) > 10_000:
        raise OperationsError(f"{label}.evidence_hits exceeds 10000 items")
    if any(len(item) > 512 for item in hits):
        raise OperationsError(f"{label}.evidence_hits contains an overlong event ID")
    if bool(hits) != (recall > 0) or bool(hits) != (reciprocal_rank > 0):
        raise OperationsError(f"{label} hits contradict recall or reciprocal rank")
    return {
        "recall": recall,
        "mean_reciprocal_rank": reciprocal_rank,
        "evidence_hits": hits,
    }


def _phase3(report: Mapping[str, Any] | None) -> dict[str, Any]:
    if report is None:
        return {
            "status": "unmeasured",
            "report_sha256": None,
            "case_count": None,
            "gate_passed": None,
            "counts_as_production_adoption": False,
        }
    report = _exact_mapping(report, _PHASE3_REPORT_FIELDS, "phase3_synthetic_report")
    if report.get("schema") != PHASE3_REPORT_SCHEMA:
        raise OperationsError("phase3_synthetic_report has an unsupported schema")
    case_count = _integer(report.get("case_count"), "phase3_synthetic_report.case_count", minimum=1)
    if case_count > 10_000:
        raise OperationsError("phase3_synthetic_report.case_count exceeds 10000")
    cases = report.get("cases")
    if not isinstance(cases, list) or len(cases) != case_count:
        raise OperationsError("phase3_synthetic_report case_count does not match cases")
    seen: set[str] = set()
    normalized: list[dict[str, Any]] = []
    derived_failures: list[str] = []
    designated_improved = False
    for position, raw in enumerate(cases):
        case = _exact_mapping(
            raw, _PHASE3_CASE_FIELDS, f"phase3_synthetic_report.cases[{position}]"
        )
        case_id = _bounded_string(
            case.get("id"), f"phase3_synthetic_report.cases[{position}].id", maximum=128
        )
        if case_id in seen:
            raise OperationsError(f"phase3_synthetic_report has duplicate case ID {case_id!r}")
        seen.add(case_id)
        lexical = _phase3_metric(case.get("lexical_reference"), f"{case_id}.lexical_reference")
        hybrid = _phase3_metric(case.get("hybrid"), f"{case_id}.hybrid")
        forbidden = _integer(case.get("forbidden_hit_count"), f"{case_id}.forbidden_hit_count")
        protected = _integer(
            case.get("protected_intrusion_count"), f"{case_id}.protected_intrusion_count"
        )
        contradiction = _boolean(
            case.get("contradiction_coverage_complete"),
            f"{case_id}.contradiction_coverage_complete",
        )
        lineage = _boolean(
            case.get("object_lineage_complete"), f"{case_id}.object_lineage_complete"
        )
        deterministic = _boolean(
            case.get("rebuild_deterministic"), f"{case_id}.rebuild_deterministic"
        )
        designated = _boolean(
            case.get("designated_strict_improvement"),
            f"{case_id}.designated_strict_improvement",
        )
        improved = (
            hybrid["recall"] > lexical["recall"]
            or hybrid["mean_reciprocal_rank"] > lexical["mean_reciprocal_rank"]
        )
        if _boolean(case.get("strictly_improved"), f"{case_id}.strictly_improved") != improved:
            raise OperationsError(f"{case_id}.strictly_improved contradicts its metrics")
        _hash_ref(case.get("packet_sha256"), f"{case_id}.packet_sha256")
        _hash_ref(case.get("manifest_sha256"), f"{case_id}.manifest_sha256")
        if designated and improved:
            designated_improved = True
        if forbidden:
            derived_failures.append(f"{case_id}: forbidden/post-cutoff event leakage")
        if protected:
            derived_failures.append(f"{case_id}: protected marker leakage")
        if not contradiction:
            derived_failures.append(f"{case_id}: contradiction coverage incomplete")
        if not lineage:
            derived_failures.append(f"{case_id}: exact object lineage missing")
        if not deterministic:
            derived_failures.append(f"{case_id}: clean rebuild changed packet/manifest")
        normalized.append({"lexical": lexical, "hybrid": hybrid})

    aggregate = _exact_mapping(
        report.get("aggregate"), _PHASE3_AGGREGATE_FIELDS, "phase3_synthetic_report.aggregate"
    )
    expected_aggregate = {
        "lexical_reference_recall": round(
            sum(row["lexical"]["recall"] for row in normalized) / case_count, 6
        ),
        "hybrid_recall": round(
            sum(row["hybrid"]["recall"] for row in normalized) / case_count, 6
        ),
        "lexical_reference_mean_reciprocal_rank": round(
            sum(row["lexical"]["mean_reciprocal_rank"] for row in normalized) / case_count,
            6,
        ),
        "hybrid_mean_reciprocal_rank": round(
            sum(row["hybrid"]["mean_reciprocal_rank"] for row in normalized) / case_count,
            6,
        ),
    }
    for name, expected in expected_aggregate.items():
        supplied = _number(aggregate.get(name), f"phase3_synthetic_report.aggregate.{name}")
        if supplied > 1 or supplied != expected:
            raise OperationsError(
                f"phase3_synthetic_report.aggregate.{name} does not match case averages"
            )
    if expected_aggregate["hybrid_recall"] < expected_aggregate["lexical_reference_recall"]:
        derived_failures.append("aggregate hybrid recall regressed versus lexical reference")
    if (
        expected_aggregate["hybrid_mean_reciprocal_rank"]
        < expected_aggregate["lexical_reference_mean_reciprocal_rank"]
    ):
        derived_failures.append("aggregate hybrid MRR regressed versus lexical reference")
    if not designated_improved:
        derived_failures.append("no designated case strictly improved")

    gate = _exact_mapping(
        report.get("gate"), _PHASE3_GATE_FIELDS, "phase3_synthetic_report.gate"
    )
    requirements = _exact_mapping(
        gate.get("requirements"),
        _PHASE3_REQUIREMENT_FIELDS,
        "phase3_synthetic_report.gate.requirements",
    )
    if any(requirements[name] is not True for name in _PHASE3_REQUIREMENT_FIELDS):
        raise OperationsError("phase3_synthetic_report fixed gate requirements must all be true")
    failures = _string_array(gate.get("failures"), "phase3_synthetic_report.gate.failures")
    if len(failures) > 10_000 or any(len(item) > 640 for item in failures):
        raise OperationsError("phase3_synthetic_report.gate.failures is overlong")
    expected_failures = sorted(set(derived_failures))
    if failures != expected_failures:
        raise OperationsError("phase3_synthetic_report.gate.failures contradict derived findings")
    passed = _boolean(gate.get("passed"), "phase3_synthetic_report.gate.passed")
    if passed != (not expected_failures):
        raise OperationsError("phase3_synthetic_report gate status contradicts derived findings")

    latency = _exact_mapping(
        report.get("latency_informational"),
        _PHASE3_LATENCY_FIELDS,
        "phase3_synthetic_report.latency_informational",
    )
    for name in _PHASE3_LATENCY_FIELDS:
        summary = _exact_mapping(
            latency.get(name),
            _PHASE3_LATENCY_SUMMARY_FIELDS,
            f"phase3_synthetic_report.latency_informational.{name}",
        )
        p50 = _number(summary.get("p50_millis"), f"{name}.p50_millis")
        p95 = _number(summary.get("p95_millis"), f"{name}.p95_millis")
        if p95 < p50:
            raise OperationsError(f"{name}.p95_millis cannot be below p50_millis")
    if report.get("latency_is_adoption_gate") is not False:
        raise OperationsError("Phase 3 latency must remain informational, not an adoption gate")
    return {
        "status": "met" if passed else "failed",
        "report_sha256": _canonical_digest(report, "phase3_synthetic_report"),
        "case_count": case_count,
        "gate_passed": passed,
        "counts_as_production_adoption": False,
    }


def _projection_doctor(report: Mapping[str, Any] | None) -> dict[str, Any]:
    empty = {
        "status": "unmeasured",
        "report_sha256": None,
        "projection_digest": None,
        "event_count": None,
        "deterministic_rebuilds": None,
    }
    if report is None:
        return empty
    if (
        not isinstance(report, Mapping)
        or report.get("schema") != PROJECTION_DOCTOR_SCHEMA
        or report.get("command") != "doctor"
    ):
        raise OperationsError("projection_doctor_report is not a memory doctor report")
    ok = _boolean(report.get("ok"), "projection_doctor_report.ok")
    digest = None
    event_count = _integer(report.get("event_count"), "projection_doctor_report.event_count")
    projection = report.get("projection")
    if ok:
        if report.get("errors") != [] or not isinstance(projection, Mapping):
            raise OperationsError("healthy projection doctor report has errors or no projection")
        digest = _hash_ref(projection.get("digest"), "projection_doctor_report.projection.digest")
        if projection.get("event_count") != event_count:
            raise OperationsError("projection doctor event counts disagree")
    elif projection is not None and not isinstance(projection, Mapping):
        raise OperationsError("failed projection doctor projection must be an object or null")
    return {
        "status": "met" if ok and event_count > 0 else ("unmeasured" if ok else "failed"),
        "report_sha256": _canonical_digest(report, "projection_doctor_report"),
        "projection_digest": digest,
        "event_count": event_count,
        "deterministic_rebuilds": 2 if ok else 0,
    }


def _store_doctor(report: Mapping[str, Any] | None) -> dict[str, Any]:
    if report is None:
        return {
            "status": "unmeasured",
            "report_sha256": None,
            "store_manifest_sha256": None,
            "deterministic_rebuilds": None,
            "external_anchor_verified": None,
        }
    if not isinstance(report, Mapping) or report.get("schema") != STORE_DOCTOR_SCHEMA:
        raise OperationsError("store_doctor_report has an unsupported schema")
    status = report.get("status")
    if status == "refused":
        if not isinstance(report.get("error_code"), str):
            raise OperationsError("refused store doctor report lacks an error code")
        return {
            "status": "failed",
            "report_sha256": _canonical_digest(report, "store_doctor_report"),
            "store_manifest_sha256": None,
            "deterministic_rebuilds": None,
            "external_anchor_verified": False,
        }
    if status != "healthy":
        raise OperationsError("store_doctor_report.status must be healthy or refused")
    checks = report.get("checks")
    required_checks = {
        "authorization",
        "authenticated_storage",
        "policy_gates",
        "exact_reads",
        "purge_state",
        "deterministic_rebuild",
        "external_anchor",
    }
    if not isinstance(checks, Mapping) or set(checks) != required_checks:
        raise OperationsError("healthy store doctor report has an incomplete check set")
    verified = all(checks[name] == "verified" for name in required_checks)
    rebuilds = _integer(report.get("deterministic_rebuilds"), "store_doctor_report.deterministic_rebuilds")
    manifest = _hash_ref(report.get("store_manifest_sha256"), "store_doctor_report.store_manifest_sha256")
    return {
        "status": "met" if verified and rebuilds >= 2 else "failed",
        "report_sha256": _canonical_digest(report, "store_doctor_report"),
        "store_manifest_sha256": manifest,
        "deterministic_rebuilds": rebuilds,
        "external_anchor_verified": checks.get("external_anchor") == "verified",
    }


def _empty_window_evidence(kind: str) -> dict[str, Any]:
    fields: dict[str, Any] = {
        "status": "unmeasured",
        "observation_sha256": None,
        "window_start": None,
        "window_end": None,
    }
    if kind == "controlled":
        fields.update(
            valid_append_attempts=None,
            successful_appends=None,
            rejected_invalid_writes=None,
            append_success_rate=None,
            committed_event_loss_count=None,
        )
    elif kind == "performance":
        fields.update(
            issuer_query_count=None,
            retrieval_p95_millis=None,
            context_compilation_p95_millis=None,
        )
    elif kind == "access":
        fields.update(
            audit_complete=None,
            known_policy_leaks=None,
            post_cutoff_fact_count=None,
        )
    return fields


def _window(value: Mapping[str, Any], label: str) -> tuple[str, str, dt.datetime, dt.datetime]:
    start_text, start = _instant(value.get("window_start"), f"{label}.window_start")
    end_text, end = _instant(value.get("window_end"), f"{label}.window_end")
    if end < start:
        raise OperationsError(f"{label}.window_end precedes window_start")
    return start_text, end_text, start, end


def _controlled_writes(
    observation: Mapping[str, Any] | None, evaluated: dt.datetime
) -> dict[str, Any]:
    if observation is None:
        return _empty_window_evidence("controlled")
    value = _exact_mapping(observation, _CONTROLLED_WRITE_FIELDS, "controlled_write_observation")
    if value.get("schema") != "memory-controlled-write-reliability/v1":
        raise OperationsError("controlled_write_observation has an unsupported schema")
    start, end, _, end_instant = _window(value, "controlled_write_observation")
    if end_instant > evaluated:
        raise OperationsError("controlled-write window cannot end after evaluated_at")
    attempts = _integer(value.get("valid_append_attempts"), "valid_append_attempts")
    successful = _integer(value.get("successful_appends"), "successful_appends")
    rejected = _integer(value.get("rejected_invalid_writes"), "rejected_invalid_writes")
    losses = _integer(value.get("committed_event_loss_count"), "committed_event_loss_count")
    if successful > attempts:
        raise OperationsError("successful_appends cannot exceed valid_append_attempts")
    rate = _ratio(successful, attempts) if attempts else None
    if losses > 0:
        status = "failed"
    elif attempts == 0:
        status = "unmeasured"
    else:
        status = "met" if successful * 1000 >= attempts * 999 else "failed"
    return {
        "status": status,
        "observation_sha256": _canonical_digest(value, "controlled_write_observation"),
        "window_start": start,
        "window_end": end,
        "valid_append_attempts": attempts,
        "successful_appends": successful,
        "rejected_invalid_writes": rejected,
        "append_success_rate": rate,
        "committed_event_loss_count": losses,
    }


def _performance(
    observation: Mapping[str, Any] | None, evaluated: dt.datetime
) -> dict[str, Any]:
    if observation is None:
        return _empty_window_evidence("performance")
    value = _exact_mapping(observation, _PERFORMANCE_FIELDS, "performance_observation")
    if value.get("schema") != "memory-performance-observation/v1":
        raise OperationsError("performance_observation has an unsupported schema")
    start, end, _, end_instant = _window(value, "performance_observation")
    if end_instant > evaluated:
        raise OperationsError("performance window cannot end after evaluated_at")
    queries = _integer(value.get("issuer_query_count"), "issuer_query_count")
    retrieval = _number(value.get("retrieval_p95_millis"), "retrieval_p95_millis")
    compilation = _number(
        value.get("context_compilation_p95_millis"), "context_compilation_p95_millis"
    )
    status = (
        "unmeasured"
        if queries == 0
        else ("met" if retrieval < 2000 and compilation < 5000 else "failed")
    )
    return {
        "status": status,
        "observation_sha256": _canonical_digest(value, "performance_observation"),
        "window_start": start,
        "window_end": end,
        "issuer_query_count": queries,
        "retrieval_p95_millis": retrieval,
        "context_compilation_p95_millis": compilation,
    }


def _restore(observation: Mapping[str, Any] | None, evaluated: dt.datetime) -> dict[str, Any]:
    if observation is None:
        return {
            "status": "unmeasured",
            "observation_sha256": None,
            "performed_at": None,
            "full_restore_completed": None,
            "recovery_time_millis": None,
            "committed_event_loss_count": None,
        }
    value = _exact_mapping(observation, _RESTORE_FIELDS, "restore_drill_observation")
    if value.get("schema") != "memory-restore-drill-observation/v1":
        raise OperationsError("restore_drill_observation has an unsupported schema")
    performed_at, performed = _instant(value.get("performed_at"), "restore_drill_observation.performed_at")
    if performed > evaluated:
        raise OperationsError("restore drill cannot occur after evaluated_at")
    completed = _boolean(value.get("full_restore_completed"), "full_restore_completed")
    recovery = _integer(value.get("recovery_time_millis"), "recovery_time_millis")
    losses = _integer(value.get("committed_event_loss_count"), "restore.committed_event_loss_count")
    status = "met" if completed and recovery <= 14_400_000 and losses == 0 else "failed"
    return {
        "status": status,
        "observation_sha256": _canonical_digest(value, "restore_drill_observation"),
        "performed_at": performed_at,
        "full_restore_completed": completed,
        "recovery_time_millis": recovery,
        "committed_event_loss_count": losses,
    }


def _access(observation: Mapping[str, Any] | None, evaluated: dt.datetime) -> dict[str, Any]:
    if observation is None:
        return _empty_window_evidence("access")
    value = _exact_mapping(observation, _ACCESS_FIELDS, "access_audit_observation")
    if value.get("schema") != "memory-access-audit-observation/v1":
        raise OperationsError("access_audit_observation has an unsupported schema")
    start, end, _, end_instant = _window(value, "access_audit_observation")
    if end_instant > evaluated:
        raise OperationsError("access audit window cannot end after evaluated_at")
    complete = _boolean(value.get("audit_complete"), "audit_complete")
    leaks = _integer(value.get("known_policy_leaks"), "known_policy_leaks")
    post_cutoff = _integer(value.get("post_cutoff_fact_count"), "post_cutoff_fact_count")
    if leaks or post_cutoff:
        status = "failed"
    elif not complete:
        status = "unmeasured"
    else:
        status = "met"
    return {
        "status": status,
        "observation_sha256": _canonical_digest(value, "access_audit_observation"),
        "window_start": start,
        "window_end": end,
        "audit_complete": complete,
        "known_policy_leaks": leaks,
        "post_cutoff_fact_count": post_cutoff,
    }


def _schema_review(observation: Mapping[str, Any] | None, evaluated: dt.datetime) -> dict[str, Any]:
    if observation is None:
        return {
            "status": "unmeasured",
            "observation_sha256": None,
            "reviewed_at": None,
            "review_complete": None,
            "overdue_schema_count": None,
        }
    value = _exact_mapping(observation, _SCHEMA_REVIEW_FIELDS, "schema_review_observation")
    if value.get("schema") != "memory-schema-deprecation-review/v1":
        raise OperationsError("schema_review_observation has an unsupported schema")
    reviewed_at, reviewed = _instant(value.get("reviewed_at"), "schema_review_observation.reviewed_at")
    if reviewed > evaluated:
        raise OperationsError("schema review cannot occur after evaluated_at")
    complete = _boolean(value.get("review_complete"), "review_complete")
    overdue = _integer(value.get("overdue_schema_count"), "overdue_schema_count")
    status = "met" if complete and overdue == 0 else ("failed" if overdue else "unmeasured")
    return {
        "status": status,
        "observation_sha256": _canonical_digest(value, "schema_review_observation"),
        "reviewed_at": reviewed_at,
        "review_complete": complete,
        "overdue_schema_count": overdue,
    }


def _scale_decisions(comparisons: Sequence[Mapping[str, Any]]) -> list[dict[str, Any]]:
    if isinstance(comparisons, (str, bytes)) or not isinstance(comparisons, Sequence):
        raise OperationsError("scale_comparisons must be a sequence of objects")
    by_candidate: dict[str, Mapping[str, Any]] = {}
    for position, raw in enumerate(comparisons):
        value = _exact_mapping(raw, _SCALE_COMPARISON_FIELDS, f"scale_comparisons[{position}]")
        if value.get("schema") != "memory-scale-comparison/v1":
            raise OperationsError(f"scale_comparisons[{position}] has an unsupported schema")
        candidate = value.get("candidate")
        if candidate not in SCALE_CANDIDATES:
            raise OperationsError(f"scale_comparisons[{position}].candidate is unsupported")
        if candidate in by_candidate:
            raise OperationsError(f"duplicate scale comparison for {candidate}")
        _hash_ref(value.get("workload_sha256"), f"scale_comparisons[{position}].workload_sha256")
        _integer(value.get("sample_size"), f"scale_comparisons[{position}].sample_size")
        _boolean(value.get("reference_slo_met"), f"scale_comparisons[{position}].reference_slo_met")
        _boolean(value.get("candidate_slo_met"), f"scale_comparisons[{position}].candidate_slo_met")
        _integer(value.get("correctness_regressions"), f"scale_comparisons[{position}].correctness_regressions")
        _integer(value.get("known_policy_leaks"), f"scale_comparisons[{position}].known_policy_leaks")
        by_candidate[candidate] = value

    decisions: list[dict[str, Any]] = []
    for candidate in SCALE_CANDIDATES:
        value = by_candidate.get(candidate)
        conservative, consider = SCALE_ACTIONS[candidate]
        if value is None:
            decisions.append(
                {
                    "candidate": candidate,
                    "status": "unmeasured",
                    "action": conservative,
                    "comparison_sha256": None,
                    "workload_sha256": None,
                    "sample_size": None,
                    "reference_slo_met": None,
                    "candidate_slo_met": None,
                    "correctness_regressions": None,
                    "known_policy_leaks": None,
                    "expansion_justified": False,
                    "blocking_reasons": ["no-comparative-evidence"],
                }
            )
            continue
        sample = int(value["sample_size"])
        blockers = []
        if sample == 0:
            blockers.append("insufficient-sample")
        if value["reference_slo_met"]:
            blockers.append("reference-slo-met")
        if not value["candidate_slo_met"]:
            blockers.append("candidate-slo-not-met")
        if value["correctness_regressions"]:
            blockers.append("correctness-regression")
        if value["known_policy_leaks"]:
            blockers.append("policy-leak")
        justified = not blockers
        if sample == 0:
            status = "unmeasured"
        elif value["correctness_regressions"] or value["known_policy_leaks"]:
            status = "failed"
        else:
            status = "met"
        decisions.append(
            {
                "candidate": candidate,
                "status": status,
                "action": consider if justified else conservative,
                "comparison_sha256": _canonical_digest(value, f"scale comparison {candidate}"),
                "workload_sha256": _hash_ref(value["workload_sha256"], "workload_sha256"),
                "sample_size": sample,
                "reference_slo_met": value["reference_slo_met"],
                "candidate_slo_met": value["candidate_slo_met"],
                "correctness_regressions": value["correctness_regressions"],
                "known_policy_leaks": value["known_policy_leaks"],
                "expansion_justified": justified,
                "blocking_reasons": sorted(blockers),
            }
        )
    return decisions


_SLO_TARGETS: tuple[tuple[str, str, float | int, str, str | None], ...] = (
    ("canonical-event-integrity", "equal", 1, "ratio", None),
    ("material-claim-lineage", "equal", 1, "ratio", None),
    ("known-policy-leakage", "equal", 0, "count", None),
    ("post-cutoff-leakage", "equal", 0, "count", None),
    ("canonical-append-success", "at-least", 0.999, "ratio", None),
    ("retrieval-p95", "less-than", 2000, "milliseconds", None),
    ("context-compilation-p95", "less-than", 5000, "milliseconds", None),
    ("committed-event-loss-rpo", "equal", 0, "count", None),
    ("restore-rto", "at-most", 14_400_000, "milliseconds", None),
    ("projection-rebuild-cadence", "at-most", 31, "days", "monthly"),
    ("full-restore-cadence", "at-most", 92, "days", "quarterly"),
    ("benchmark-refresh-cadence", "at-most", 92, "days", "quarterly"),
    ("access-audit-cadence", "at-most", 92, "days", "quarterly"),
    ("schema-deprecation-review-cadence", "at-most", 92, "days", "quarterly"),
)


def _measurement(
    value: float | int | None,
    unit: str,
    *,
    numerator: int | None = None,
    denominator: int | None = None,
) -> dict[str, Any]:
    return {
        "value": value,
        "unit": unit,
        "numerator": numerator,
        "denominator": denominator,
    }


def _age_days(evaluated: dt.datetime, observed_text: str | None) -> int | None:
    if observed_text is None:
        return None
    if len(observed_text) == 10:
        _, observed = _day(observed_text, "observed date")
    else:
        _, observed = _instant(observed_text, "observed time")
    if observed > evaluated:
        raise OperationsError("operational evidence timestamp is after evaluated_at")
    return math.ceil((evaluated - observed).total_seconds() / 86_400)


def _slo_rows(
    evaluated: dt.datetime,
    adoption: Mapping[str, Any],
    evidence: Mapping[str, Any],
) -> list[dict[str, Any]]:
    projection = evidence["projection_rebuild"]
    controlled = evidence["controlled_writes"]
    performance = evidence["performance"]
    restore = evidence["restore_drill"]
    access = evidence["access_audit"]
    schema_review = evidence["schema_deprecation_review"]

    statuses: dict[str, tuple[str, dict[str, Any], list[str]]] = {}
    projection_ref = [projection["report_sha256"]] if projection["report_sha256"] else []
    if projection["status"] == "met":
        event_count = projection["event_count"]
        statuses["canonical-event-integrity"] = (
            "met",
            _measurement(1, "ratio", numerator=event_count, denominator=event_count),
            projection_ref,
        )
    elif projection["status"] == "failed":
        statuses["canonical-event-integrity"] = (
            "failed", _measurement(0, "ratio"), projection_ref
        )
    else:
        statuses["canonical-event-integrity"] = (
            "unmeasured", _measurement(None, "ratio"), projection_ref
        )

    # Neither the Phase 0 file-retrieval benchmark nor the Phase 3 synthetic fixture is a
    # production observation of every retrieved material claim.  Keep this explicit.
    statuses["material-claim-lineage"] = (
        "unmeasured",
        _measurement(None, "ratio"),
        [],
    )

    access_ref = [access["observation_sha256"]] if access["observation_sha256"] else []
    for slo_id, field in (
        ("known-policy-leakage", "known_policy_leaks"),
        ("post-cutoff-leakage", "post_cutoff_fact_count"),
    ):
        value = access[field]
        if value is None or not access["audit_complete"]:
            status = "failed" if isinstance(value, int) and value > 0 else "unmeasured"
        else:
            status = "met" if value == 0 else "failed"
        statuses[slo_id] = (status, _measurement(value, "count"), access_ref)

    controlled_ref = (
        [controlled["observation_sha256"]] if controlled["observation_sha256"] else []
    )
    append_rate = controlled["append_success_rate"]
    append_attempts = controlled["valid_append_attempts"]
    append_successes = controlled["successful_appends"]
    append_status = (
        "unmeasured"
        if append_attempts in (None, 0)
        else (
            "met"
            if append_successes * 1000 >= append_attempts * 999
            else "failed"
        )
    )
    statuses["canonical-append-success"] = (
        append_status,
        _measurement(
            controlled["append_success_rate"],
            "ratio",
            numerator=controlled["successful_appends"],
            denominator=controlled["valid_append_attempts"],
        ),
        controlled_ref,
    )

    performance_ref = (
        [performance["observation_sha256"]] if performance["observation_sha256"] else []
    )
    for slo_id, field, limit in (
        ("retrieval-p95", "retrieval_p95_millis", 2000),
        ("context-compilation-p95", "context_compilation_p95_millis", 5000),
    ):
        value = performance[field]
        if value is None or performance["issuer_query_count"] == 0:
            status = "unmeasured"
        else:
            status = "met" if value < limit else "failed"
        statuses[slo_id] = (status, _measurement(value, "milliseconds"), performance_ref)

    restore_ref = [restore["observation_sha256"]] if restore["observation_sha256"] else []
    loss_values = [
        value
        for value in (
            controlled["committed_event_loss_count"],
            restore["committed_event_loss_count"],
        )
        if value is not None
    ]
    if any(value > 0 for value in loss_values):
        loss_status = "failed"
    elif len(loss_values) == 2:
        loss_status = "met"
    else:
        loss_status = "unmeasured"
    statuses["committed-event-loss-rpo"] = (
        loss_status,
        _measurement(sum(loss_values) if loss_values else None, "count"),
        controlled_ref + restore_ref,
    )
    if restore["recovery_time_millis"] is None or not restore["full_restore_completed"]:
        rto_status = "failed" if restore["full_restore_completed"] is False else "unmeasured"
    else:
        rto_status = "met" if restore["recovery_time_millis"] <= 14_400_000 else "failed"
    statuses["restore-rto"] = (
        rto_status,
        _measurement(restore["recovery_time_millis"], "milliseconds"),
        restore_ref,
    )

    # The Phase 1 doctor has no authenticated run timestamp.  Its digest proves a
    # deterministic rebuild, but cannot prove the monthly cadence by itself.
    statuses["projection-rebuild-cadence"] = (
        "unmeasured", _measurement(None, "days"), projection_ref
    )

    restore_age = _age_days(evaluated, restore["performed_at"])
    restore_cadence_status = (
        "unmeasured"
        if restore_age is None
        else (
            "failed"
            if not restore["full_restore_completed"]
            else ("met" if restore_age <= 92 else "failed")
        )
    )
    statuses["full-restore-cadence"] = (
        restore_cadence_status,
        _measurement(restore_age, "days"),
        restore_ref,
    )
    production = adoption["production_benchmark"]
    benchmark_age = (
        _age_days(evaluated, production["benchmark_as_of"])
        if production["candidate_report_sha256"] is not None
        else None
    )
    benchmark_ref = (
        [production["candidate_report_sha256"]]
        if production["candidate_report_sha256"] is not None
        else []
    )
    statuses["benchmark-refresh-cadence"] = (
        "unmeasured" if benchmark_age is None else ("met" if benchmark_age <= 92 else "failed"),
        _measurement(benchmark_age, "days"),
        benchmark_ref,
    )
    access_age = _age_days(evaluated, access["window_end"])
    access_cadence_status = (
        "unmeasured"
        if access_age is None or not access["audit_complete"]
        else ("met" if access_age <= 92 else "failed")
    )
    statuses["access-audit-cadence"] = (
        access_cadence_status,
        _measurement(access_age, "days"),
        access_ref,
    )
    schema_age = _age_days(evaluated, schema_review["reviewed_at"])
    schema_ref = (
        [schema_review["observation_sha256"]]
        if schema_review["observation_sha256"]
        else []
    )
    schema_cadence_status = (
        "unmeasured"
        if schema_age is None or not schema_review["review_complete"]
        else ("met" if schema_age <= 92 else "failed")
    )
    statuses["schema-deprecation-review-cadence"] = (
        schema_cadence_status,
        _measurement(schema_age, "days"),
        schema_ref,
    )

    rows = []
    for slo_id, operator, target_value, unit, cadence in _SLO_TARGETS:
        status, observed, refs = statuses[slo_id]
        rows.append(
            {
                "slo_id": slo_id,
                "target": {
                    "operator": operator,
                    "value": target_value,
                    "unit": unit,
                    "cadence": cadence,
                },
                "status": status,
                "observed": observed,
                "evidence_sha256": sorted(set(refs)),
            }
        )
    return rows


def _overall_status(
    adoption: Mapping[str, Any], evidence: Mapping[str, Any], slos: Sequence[Mapping[str, Any]]
) -> str:
    statuses = [row["status"] for row in slos]
    statuses.extend(
        (
            adoption["production_benchmark"]["status"],
            adoption["phase3_synthetic"]["status"],
            evidence["projection_rebuild"]["status"],
            evidence["object_store_doctor"]["status"],
            evidence["controlled_writes"]["status"],
            evidence["performance"]["status"],
            evidence["restore_drill"]["status"],
            evidence["access_audit"]["status"],
            evidence["schema_deprecation_review"]["status"],
        )
    )
    if "failed" in statuses:
        return "failed"
    return "met" if statuses and all(status == "met" for status in statuses) else "unmeasured"


def build_operational_readiness_report(
    *,
    evaluated_at: str,
    phase0_baseline_report: Mapping[str, Any],
    phase0_candidate_report: Mapping[str, Any] | None = None,
    phase3_synthetic_report: Mapping[str, Any] | None = None,
    projection_doctor_report: Mapping[str, Any] | None = None,
    store_doctor_report: Mapping[str, Any] | None = None,
    controlled_write_observation: Mapping[str, Any] | None = None,
    performance_observation: Mapping[str, Any] | None = None,
    restore_drill_observation: Mapping[str, Any] | None = None,
    access_audit_observation: Mapping[str, Any] | None = None,
    schema_review_observation: Mapping[str, Any] | None = None,
    scale_comparisons: Sequence[Mapping[str, Any]] = (),
) -> dict[str, Any]:
    """Build one content-free deterministic readiness report from explicit evidence.

    Optional evidence is never inferred from another phase.  In particular, the Phase 3
    synthetic gate is recorded separately and cannot fill ``phase0_candidate_report``.
    """

    evaluated_text, evaluated = _instant(evaluated_at, "evaluated_at")
    adoption = _adoption(phase0_baseline_report, phase0_candidate_report)
    adoption["phase3_synthetic"] = _phase3(phase3_synthetic_report)
    evidence = {
        "projection_rebuild": _projection_doctor(projection_doctor_report),
        "object_store_doctor": _store_doctor(store_doctor_report),
        "controlled_writes": _controlled_writes(controlled_write_observation, evaluated),
        "performance": _performance(performance_observation, evaluated),
        "restore_drill": _restore(restore_drill_observation, evaluated),
        "access_audit": _access(access_audit_observation, evaluated),
        "schema_deprecation_review": _schema_review(schema_review_observation, evaluated),
    }
    slos = _slo_rows(evaluated, adoption, evidence)
    body = {
        "schema": REPORT_SCHEMA,
        "evaluated_at": evaluated_text,
        "status": _overall_status(adoption, evidence, slos),
        "adoption": adoption,
        "operational_evidence": evidence,
        "slos": slos,
        "scale_decisions": _scale_decisions(scale_comparisons),
        "automation": {
            "scheduled_by_report": False,
            "state_mutation": "none",
        },
    }
    report = dict(body)
    report["report_sha256"] = "sha256:" + canonical_sha256(body)
    verify_operational_readiness_report(report)
    return report


def _schema_errors(report: Any) -> list[str]:
    try:
        schema = json.loads(REPORT_SCHEMA_PATH.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:  # pragma: no cover
        raise OperationsError(f"cannot load operational report schema: {exc}") from exc
    checker = Checker(schema)
    try:
        checker.check(schema, report, "")
    except RecursionError as exc:
        raise OperationsError("operational readiness report is recursively nested") from exc
    return checker.errors


def _verify_adoption_semantics(adoption: Mapping[str, Any]) -> None:
    production = adoption["production_benchmark"]
    reviewed_corpus = {
        "sha256": PHASE0_BASELINE_CORPUS_SHA256,
        "total_bytes": PHASE0_BASELINE_CORPUS_TOTAL_BYTES,
        "unique_files_considered": PHASE0_BASELINE_CORPUS_UNIQUE_FILES,
    }
    if (
        production["benchmark_version"] != PHASE0_BENCHMARK_VERSION
        or production["case_count"] != PHASE0_CASE_COUNT
        or production["benchmark_sha256"] != "sha256:" + PHASE0_BENCHMARK_SHA256
        or production["baseline_report_sha256"]
        != "sha256:" + PHASE0_BASELINE_CANONICAL_SHA256
        or production["baseline_corpus"] != reviewed_corpus
        or production["baseline_metrics"] is None
    ):
        raise OperationsError("production benchmark does not retain the reviewed Phase 0 anchor")
    candidate_digest = production["candidate_report_sha256"]
    candidate = production["candidate_metrics"]
    candidate_corpus = production["candidate_corpus"]
    if candidate_digest is None:
        if (
            candidate is not None
            or candidate_corpus is not None
            or production["corpus_match"] != "unmeasured"
            or production["status"] != "unmeasured"
            or production["comparison"] != "unmeasured"
        ):
            raise OperationsError("production adoption must remain unmeasured without a candidate")
    else:
        if candidate is None or candidate_corpus is None:
            raise OperationsError("production candidate digest has no normalized corpus and metrics")
        baseline = production["baseline_metrics"]
        corpora_match = candidate_corpus == production["baseline_corpus"]
        if not corpora_match:
            if (
                production["corpus_match"] != "mismatched"
                or production["status"] != "unmeasured"
                or production["comparison"] != "corpus-mismatch"
            ):
                raise OperationsError(
                    "production adoption must remain unmeasured for a corpus mismatch"
                )
        elif production["corpus_match"] != "matched":
            raise OperationsError("production adoption corpus match state is contradictory")

        non_regressed = all(
            candidate[name] >= baseline[name]
            for name in (
                "complete_evidence_recall_at_k",
                "evidence_path_recall_at_k",
                "mean_reciprocal_rank",
            )
        )
        strictly_improved = any(
            candidate[name] > baseline[name]
            for name in (
                "complete_evidence_recall_at_k",
                "evidence_path_recall_at_k",
                "mean_reciprocal_rank",
            )
        )
        serious_errors_clear = (
            candidate["protected_path_intrusions"] == 0
            and candidate["temporal_forbidden_path_hits"] == 0
            and candidate["temporal_leakage_case_rate"] == 0
        )
        passed = non_regressed and strictly_improved and serious_errors_clear
        expected_status = "met" if passed else "failed"
        expected_comparison = (
            "non-regressed-with-strict-improvement-and-zero-serious-leakage"
            if passed
            else "regressed-no-improvement-or-serious-leakage"
        )
        if corpora_match and (
            production["status"] != expected_status
            or production["comparison"] != expected_comparison
        ):
            raise OperationsError("production adoption status contradicts its normalized metrics")

    synthetic = adoption["phase3_synthetic"]
    if synthetic["counts_as_production_adoption"] is not False:
        raise OperationsError("Phase 3 synthetic evidence cannot count as production adoption")
    if synthetic["report_sha256"] is None:
        if any(
            synthetic[name] is not None for name in ("case_count", "gate_passed")
        ) or synthetic["status"] != "unmeasured":
            raise OperationsError("missing Phase 3 evidence must remain unmeasured")
    else:
        expected = "met" if synthetic["gate_passed"] is True else "failed"
        if synthetic["case_count"] is None or synthetic["case_count"] < 1:
            raise OperationsError("Phase 3 evidence has no benchmark cases")
        if synthetic["status"] != expected:
            raise OperationsError("Phase 3 status contradicts its gate result")


def _verify_operational_evidence_semantics(
    evidence: Mapping[str, Any], evaluated: dt.datetime
) -> None:
    projection = evidence["projection_rebuild"]
    if projection["report_sha256"] is None:
        if any(
            projection[name] is not None
            for name in ("projection_digest", "event_count", "deterministic_rebuilds")
        ) or projection["status"] != "unmeasured":
            raise OperationsError("missing projection evidence must remain unmeasured")
    else:
        healthy = (
            projection["projection_digest"] is not None
            and projection["deterministic_rebuilds"] == 2
        )
        expected = (
            "met"
            if healthy and projection["event_count"] > 0
            else ("unmeasured" if healthy else "failed")
        )
        if projection["status"] != expected:
            raise OperationsError("projection status contradicts rebuild evidence")

    store = evidence["object_store_doctor"]
    if store["report_sha256"] is None:
        if any(
            store[name] is not None
            for name in (
                "store_manifest_sha256",
                "deterministic_rebuilds",
                "external_anchor_verified",
            )
        ) or store["status"] != "unmeasured":
            raise OperationsError("missing object-store evidence must remain unmeasured")
    else:
        healthy = (
            store["store_manifest_sha256"] is not None
            and store["deterministic_rebuilds"] is not None
            and store["deterministic_rebuilds"] >= 2
            and store["external_anchor_verified"] is True
        )
        if store["status"] != ("met" if healthy else "failed"):
            raise OperationsError("object-store status contradicts doctor evidence")

    controlled = evidence["controlled_writes"]
    if controlled["observation_sha256"] is None:
        if controlled["status"] != "unmeasured" or any(
            controlled[name] is not None
            for name in (
                "window_start",
                "window_end",
                "valid_append_attempts",
                "successful_appends",
                "rejected_invalid_writes",
                "append_success_rate",
                "committed_event_loss_count",
            )
        ):
            raise OperationsError("missing controlled-write evidence must remain empty")
    else:
        start_text, end_text, _, end_instant = _window(controlled, "controlled_writes")
        if (
            start_text != controlled["window_start"]
            or end_text != controlled["window_end"]
            or end_instant > evaluated
        ):
            raise OperationsError("controlled-write window is not normalized or is in the future")
        attempts = controlled["valid_append_attempts"]
        successes = controlled["successful_appends"]
        losses = controlled["committed_event_loss_count"]
        if attempts is None or successes is None or losses is None or successes > attempts:
            raise OperationsError("controlled-write counts are inconsistent")
        expected_rate = _ratio(successes, attempts) if attempts else None
        if controlled["append_success_rate"] != expected_rate:
            raise OperationsError("controlled-write rate does not match its counts")
        expected = (
            "failed"
            if losses > 0
            else (
                "unmeasured"
                if attempts == 0
                else ("met" if successes * 1000 >= attempts * 999 else "failed")
            )
        )
        if controlled["status"] != expected:
            raise OperationsError("controlled-write status contradicts its counts")

    performance = evidence["performance"]
    if performance["observation_sha256"] is None:
        if performance["status"] != "unmeasured" or any(
            performance[name] is not None
            for name in (
                "window_start",
                "window_end",
                "issuer_query_count",
                "retrieval_p95_millis",
                "context_compilation_p95_millis",
            )
        ):
            raise OperationsError("missing performance evidence must remain empty")
    else:
        start_text, end_text, _, end_instant = _window(performance, "performance")
        if (
            start_text != performance["window_start"]
            or end_text != performance["window_end"]
            or end_instant > evaluated
        ):
            raise OperationsError("performance window is not normalized or is in the future")
        count = performance["issuer_query_count"]
        retrieval = performance["retrieval_p95_millis"]
        compilation = performance["context_compilation_p95_millis"]
        if count is None or retrieval is None or compilation is None:
            raise OperationsError("performance evidence is incomplete")
        expected = (
            "unmeasured"
            if count == 0
            else ("met" if retrieval < 2000 and compilation < 5000 else "failed")
        )
        if performance["status"] != expected:
            raise OperationsError("performance status contradicts its measurements")

    restore = evidence["restore_drill"]
    if restore["observation_sha256"] is None:
        if restore["status"] != "unmeasured" or any(
            restore[name] is not None
            for name in (
                "performed_at",
                "full_restore_completed",
                "recovery_time_millis",
                "committed_event_loss_count",
            )
        ):
            raise OperationsError("missing restore evidence must remain empty")
    else:
        performed_text, performed = _instant(restore["performed_at"], "restore.performed_at")
        if performed_text != restore["performed_at"] or performed > evaluated:
            raise OperationsError("restore time is not normalized or is in the future")
        completed = restore["full_restore_completed"]
        recovery = restore["recovery_time_millis"]
        losses = restore["committed_event_loss_count"]
        expected = (
            "met"
            if completed is True and recovery is not None and recovery <= 14_400_000 and losses == 0
            else "failed"
        )
        if restore["status"] != expected:
            raise OperationsError("restore status contradicts its measurements")

    access = evidence["access_audit"]
    if access["observation_sha256"] is None:
        if access["status"] != "unmeasured" or any(
            access[name] is not None
            for name in (
                "window_start",
                "window_end",
                "audit_complete",
                "known_policy_leaks",
                "post_cutoff_fact_count",
            )
        ):
            raise OperationsError("missing access-audit evidence must remain empty")
    else:
        start_text, end_text, _, end_instant = _window(access, "access_audit")
        if (
            start_text != access["window_start"]
            or end_text != access["window_end"]
            or end_instant > evaluated
        ):
            raise OperationsError("access-audit window is not normalized or is in the future")
        complete = access["audit_complete"]
        leaks = access["known_policy_leaks"]
        post_cutoff = access["post_cutoff_fact_count"]
        expected = (
            "failed"
            if leaks or post_cutoff
            else ("met" if complete else "unmeasured")
        )
        if access["status"] != expected:
            raise OperationsError("access-audit status contradicts its measurements")

    review = evidence["schema_deprecation_review"]
    if review["observation_sha256"] is None:
        if review["status"] != "unmeasured" or any(
            review[name] is not None
            for name in ("reviewed_at", "review_complete", "overdue_schema_count")
        ):
            raise OperationsError("missing schema-review evidence must remain empty")
    else:
        reviewed_text, reviewed = _instant(review["reviewed_at"], "schema_review.reviewed_at")
        if reviewed_text != review["reviewed_at"] or reviewed > evaluated:
            raise OperationsError("schema-review time is not normalized or is in the future")
        expected = (
            "met"
            if review["review_complete"] and review["overdue_schema_count"] == 0
            else ("failed" if review["overdue_schema_count"] else "unmeasured")
        )
        if review["status"] != expected:
            raise OperationsError("schema-review status contradicts its measurements")


def _verify_scale_semantics(rows: Sequence[Mapping[str, Any]]) -> None:
    if [row["candidate"] for row in rows] != list(SCALE_CANDIDATES):
        raise OperationsError("scale decisions must cover the fixed candidates in canonical order")
    for row in rows:
        conservative, consider = SCALE_ACTIONS[row["candidate"]]
        if row["comparison_sha256"] is None:
            if any(
                row[name] is not None
                for name in (
                    "workload_sha256",
                    "sample_size",
                    "reference_slo_met",
                    "candidate_slo_met",
                    "correctness_regressions",
                    "known_policy_leaks",
                )
            ):
                raise OperationsError(f"{row['candidate']} has unanchored comparison metrics")
            expected_blockers = ["no-comparative-evidence"]
            expected_status = "unmeasured"
        else:
            sample = row["sample_size"]
            if any(
                row[name] is None
                for name in (
                    "workload_sha256",
                    "sample_size",
                    "reference_slo_met",
                    "candidate_slo_met",
                    "correctness_regressions",
                    "known_policy_leaks",
                )
            ):
                raise OperationsError(f"{row['candidate']} comparison metrics are incomplete")
            expected_blockers = []
            if sample == 0:
                expected_blockers.append("insufficient-sample")
            if row["reference_slo_met"]:
                expected_blockers.append("reference-slo-met")
            if not row["candidate_slo_met"]:
                expected_blockers.append("candidate-slo-not-met")
            if row["correctness_regressions"]:
                expected_blockers.append("correctness-regression")
            if row["known_policy_leaks"]:
                expected_blockers.append("policy-leak")
            expected_blockers.sort()
            if sample == 0:
                expected_status = "unmeasured"
            elif row["correctness_regressions"] or row["known_policy_leaks"]:
                expected_status = "failed"
            else:
                expected_status = "met"
        justified = not expected_blockers
        expected_action = consider if justified else conservative
        if (
            row["blocking_reasons"] != expected_blockers
            or row["expansion_justified"] != justified
            or row["action"] != expected_action
            or row["status"] != expected_status
        ):
            raise OperationsError(f"{row['candidate']} scale decision contradicts its comparison")


def _verify_operational_readiness_report(report: Mapping[str, Any]) -> None:
    """Verify schema closure, fixed SLO semantics, decisions, and the report digest."""

    errors = _schema_errors(report)
    if errors:
        raise OperationsError("invalid operational readiness report:\n" + "\n".join(errors[:20]))
    body = dict(report)
    supplied = body.pop("report_sha256")
    actual = "sha256:" + canonical_sha256(body)
    if supplied != actual:
        raise OperationsError(f"report_sha256 does not match canonical report body {actual}")

    evaluated_text, evaluated = _instant(report["evaluated_at"], "evaluated_at")
    if evaluated_text != report["evaluated_at"]:
        raise OperationsError("evaluated_at must be normalized to UTC microseconds")
    adoption = report["adoption"]
    _verify_adoption_semantics(adoption)
    _age_days(evaluated, adoption["production_benchmark"]["benchmark_as_of"])
    _verify_operational_evidence_semantics(report["operational_evidence"], evaluated)

    expected_slos = _slo_rows(evaluated, adoption, report["operational_evidence"])
    if report["slos"] != expected_slos:
        raise OperationsError("SLO rows do not match fixed Phase 6 targets and evidence")
    expected_status = _overall_status(adoption, report["operational_evidence"], report["slos"])
    if report["status"] != expected_status:
        raise OperationsError("overall status does not match component statuses")

    _verify_scale_semantics(report["scale_decisions"])


def verify_operational_readiness_report(report: Mapping[str, Any]) -> None:
    """Refuse oversized, over-deep, or recursive values before semantic verification."""

    _guard_json_structure(report, "operational readiness report")
    try:
        _verify_operational_readiness_report(report)
    except RecursionError as exc:  # defensive around schema/canonical helpers
        raise OperationsError("operational readiness report is recursively nested") from exc


def operational_report_bytes(report: Mapping[str, Any]) -> bytes:
    """Return canonical report bytes after full verification."""

    verify_operational_readiness_report(report)
    return canonical_json_bytes(dict(report))


def _reject_constant(value: str) -> None:
    raise OperationsError(f"non-standard JSON numeric literal {value!r}")


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise OperationsError(f"duplicate JSON key {key!r}")
        result[key] = value
    return result


def _guard_json_text_nesting(text: str, label: str) -> None:
    """Reject excessive JSON nesting before the runtime parser sees the input."""

    depth = 0
    in_string = False
    escaped = False
    for character in text:
        if in_string:
            if escaped:
                escaped = False
            elif character == "\\":
                escaped = True
            elif character == '"':
                in_string = False
            continue
        if character == '"':
            in_string = True
        elif character in "[{":
            depth += 1
            if depth > _MAX_JSON_DEPTH:
                raise OperationsError(
                    f"{label} exceeds maximum JSON nesting depth of {_MAX_JSON_DEPTH}"
                )
        elif character in "]}":
            depth = max(0, depth - 1)


def _json_string_size(value: str, label: str) -> int:
    if len(value) > _MAX_INPUT_BYTES:
        raise OperationsError(f"{label} exceeds the {_MAX_INPUT_BYTES}-byte JSON size limit")
    try:
        return len(json.dumps(value, ensure_ascii=False).encode("utf-8"))
    except (TypeError, ValueError, UnicodeError) as exc:
        raise OperationsError(f"{label} is not strict UTF-8 JSON: {exc}") from exc


def _guard_json_structure(value: Any, label: str) -> None:
    """Bound an in-memory JSON value without recursive Python traversal.

    The byte count is the exact compact UTF-8 JSON size. Mapping keys count toward the
    node budget, and an active-container set distinguishes cycles from harmless shared
    references in caller-created values.
    """

    nodes = 0
    encoded_bytes = 0
    active_containers: set[int] = set()
    stack: list[tuple[bool, Any, int]] = [(True, value, 1)]

    def add_bytes(amount: int) -> None:
        nonlocal encoded_bytes
        encoded_bytes += amount
        if encoded_bytes > _MAX_INPUT_BYTES:
            raise OperationsError(
                f"{label} exceeds the {_MAX_INPUT_BYTES}-byte JSON size limit"
            )

    while stack:
        entering, current, depth = stack.pop()
        if not entering:
            active_containers.remove(id(current))
            continue

        nodes += 1
        if nodes > _MAX_JSON_NODES:
            raise OperationsError(
                f"{label} exceeds the {_MAX_JSON_NODES}-node JSON limit"
            )
        if depth > _MAX_JSON_DEPTH:
            raise OperationsError(
                f"{label} exceeds maximum JSON nesting depth of {_MAX_JSON_DEPTH}"
            )

        if isinstance(current, Mapping):
            identity = id(current)
            if identity in active_containers:
                raise OperationsError(f"{label} is recursively nested")
            if len(current) * 2 > _MAX_JSON_NODES - nodes:
                raise OperationsError(
                    f"{label} exceeds the {_MAX_JSON_NODES}-node JSON limit"
                )
            try:
                items = list(current.items())
            except (RuntimeError, TypeError, ValueError) as exc:
                raise OperationsError(f"{label} is not a stable JSON object: {exc}") from exc
            if not all(isinstance(key, str) for key, _ in items):
                raise OperationsError(f"{label} JSON object keys must be strings")
            nodes += len(items)
            add_bytes(2 + max(0, len(items) - 1) + len(items))
            for key, _ in items:
                add_bytes(_json_string_size(key, label))
            active_containers.add(identity)
            stack.append((False, current, depth))
            stack.extend((True, nested, depth + 1) for _, nested in reversed(items))
        elif isinstance(current, list):
            identity = id(current)
            if identity in active_containers:
                raise OperationsError(f"{label} is recursively nested")
            if len(current) > _MAX_JSON_NODES - nodes:
                raise OperationsError(
                    f"{label} exceeds the {_MAX_JSON_NODES}-node JSON limit"
                )
            add_bytes(2 + max(0, len(current) - 1))
            active_containers.add(identity)
            stack.append((False, current, depth))
            stack.extend((True, nested, depth + 1) for nested in reversed(current))
        elif isinstance(current, str):
            add_bytes(_json_string_size(current, label))
        elif current is None:
            add_bytes(4)
        elif type(current) is bool:
            add_bytes(4 if current else 5)
        elif type(current) in (int, float):
            if isinstance(current, float) and not math.isfinite(current):
                raise OperationsError(f"{label} contains a non-standard JSON number")
            if isinstance(current, int) and abs(current) > _MAX_SAFE_INTEGER:
                raise OperationsError(f"{label} contains an integer outside JSON safe range")
            try:
                add_bytes(len(json.dumps(current, allow_nan=False).encode("ascii")))
            except (TypeError, ValueError) as exc:
                raise OperationsError(f"{label} contains an invalid JSON number: {exc}") from exc
        else:
            raise OperationsError(
                f"{label} contains non-JSON value of type {type(current).__name__}"
            )


def load_json_read_only(path: str | os.PathLike[str]) -> Mapping[str, Any]:
    """Read one bounded regular JSON file without following a final symlink or writing state."""

    source = Path(path)
    try:
        before = source.lstat()
    except OSError as exc:
        raise OperationsError(f"cannot stat {source}: {exc}") from exc
    if stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode):
        raise OperationsError(f"{source} must be a regular non-symlink file")
    if before.st_size > _MAX_INPUT_BYTES:
        raise OperationsError(f"{source} exceeds the {_MAX_INPUT_BYTES}-byte input limit")
    try:
        flags = (
            os.O_RDONLY
            | getattr(os, "O_CLOEXEC", 0)
            | getattr(os, "O_NOFOLLOW", 0)
            | getattr(os, "O_BINARY", 0)
        )
        descriptor = os.open(source, flags)
        try:
            opened = os.fstat(descriptor)
            chunks = []
            remaining = _MAX_INPUT_BYTES + 1
            while remaining:
                chunk = os.read(descriptor, min(65536, remaining))
                if not chunk:
                    break
                chunks.append(chunk)
                remaining -= len(chunk)
        finally:
            os.close(descriptor)
    except OSError as exc:
        raise OperationsError(f"cannot read {source}: {exc}") from exc
    if sum(map(len, chunks)) > _MAX_INPUT_BYTES:
        raise OperationsError(f"{source} exceeds the {_MAX_INPUT_BYTES}-byte input limit")
    after = source.lstat()
    stable = (
        before.st_dev,
        before.st_ino,
        before.st_mode,
        before.st_nlink,
        before.st_uid,
        before.st_gid,
        before.st_size,
        before.st_mtime_ns,
        before.st_ctime_ns,
    ) == (
        opened.st_dev,
        opened.st_ino,
        opened.st_mode,
        opened.st_nlink,
        opened.st_uid,
        opened.st_gid,
        opened.st_size,
        opened.st_mtime_ns,
        opened.st_ctime_ns,
    ) == (
        after.st_dev,
        after.st_ino,
        after.st_mode,
        after.st_nlink,
        after.st_uid,
        after.st_gid,
        after.st_size,
        after.st_mtime_ns,
        after.st_ctime_ns,
    )
    if not stable:
        raise OperationsError(f"{source} changed while it was read")
    try:
        text = b"".join(chunks).decode("utf-8")
        _guard_json_text_nesting(text, str(source))
        value = json.loads(
            text,
            object_pairs_hook=_pairs,
            parse_constant=_reject_constant,
        )
    except OperationsError:
        raise
    except (UnicodeError, json.JSONDecodeError, RecursionError) as exc:
        raise OperationsError(f"{source} is not strict UTF-8 JSON: {exc}") from exc
    _guard_json_structure(value, str(source))
    if not isinstance(value, Mapping):
        raise OperationsError(f"{source} must contain a JSON object")
    return value


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    report = sub.add_parser("report", help="emit one canonical read-only readiness report")
    report.add_argument("--evaluated-at", required=True)
    report.add_argument("--phase0-baseline", required=True)
    report.add_argument("--phase0-candidate")
    report.add_argument("--phase3-synthetic")
    report.add_argument("--projection-doctor")
    report.add_argument("--store-doctor")
    report.add_argument("--controlled-write-observation")
    report.add_argument("--performance-observation")
    report.add_argument("--restore-drill-observation")
    report.add_argument("--access-audit-observation")
    report.add_argument("--schema-review-observation")
    report.add_argument("--scale-comparison", action="append", default=[])
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        report = build_operational_readiness_report(
            evaluated_at=args.evaluated_at,
            phase0_baseline_report=load_json_read_only(args.phase0_baseline),
            phase0_candidate_report=(
                load_json_read_only(args.phase0_candidate) if args.phase0_candidate else None
            ),
            phase3_synthetic_report=(
                load_json_read_only(args.phase3_synthetic) if args.phase3_synthetic else None
            ),
            projection_doctor_report=(
                load_json_read_only(args.projection_doctor) if args.projection_doctor else None
            ),
            store_doctor_report=(
                load_json_read_only(args.store_doctor) if args.store_doctor else None
            ),
            controlled_write_observation=(
                load_json_read_only(args.controlled_write_observation)
                if args.controlled_write_observation
                else None
            ),
            performance_observation=(
                load_json_read_only(args.performance_observation)
                if args.performance_observation
                else None
            ),
            restore_drill_observation=(
                load_json_read_only(args.restore_drill_observation)
                if args.restore_drill_observation
                else None
            ),
            access_audit_observation=(
                load_json_read_only(args.access_audit_observation)
                if args.access_audit_observation
                else None
            ),
            schema_review_observation=(
                load_json_read_only(args.schema_review_observation)
                if args.schema_review_observation
                else None
            ),
            scale_comparisons=[load_json_read_only(path) for path in args.scale_comparison],
        )
    except (OperationsError, OSError, TypeError, ValueError) as exc:
        sys.stderr.write(f"memory operations refused: {exc}\n")
        return 4
    sys.stdout.buffer.write(operational_report_bytes(report) + b"\n")
    return {"met": 0, "failed": 1, "unmeasured": 2}[report["status"]]


if __name__ == "__main__":
    raise SystemExit(main())


__all__ = [
    "OperationsError",
    "REPORT_SCHEMA",
    "build_operational_readiness_report",
    "load_json_read_only",
    "main",
    "operational_report_bytes",
    "verify_operational_readiness_report",
]
