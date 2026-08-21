#!/usr/bin/env python3
"""Held-out comparison gate for the Phase 3 context compiler.

Only ``id`` and ``query`` are passed to retrieval. Expected/forbidden IDs, protected
markers, contradiction IDs, and strict-improvement flags remain scoring-only until both
the lexical reference and hybrid packets have been compiled.
"""
from __future__ import annotations

import math
import time
from pathlib import Path
from typing import Any, Mapping, Sequence

from canonical_json import canonical_json
from memory_retrieval import (
    AccessScope,
    EmbeddingModel,
    ExactEvidenceVerifier,
    QuerySpec,
    RetrievalError,
    compile_context_packet,
)


REPORT_SCHEMA = "memory-retrieval-benchmark-report/v1"
_CASE_FIELDS = {
    "id",
    "query",
    "expected_event_ids",
    "forbidden_event_ids",
    "protected_markers",
    "required_contradiction_relationship_ids",
    "require_object_lineage",
    "strict_improvement",
}


def _validate_cases(cases: Any) -> list[Mapping[str, Any]]:
    if not isinstance(cases, list) or not cases:
        raise RetrievalError("retrieval benchmark cases must be a nonempty array")
    seen: set[str] = set()
    out: list[Mapping[str, Any]] = []
    for position, case in enumerate(cases, 1):
        if not isinstance(case, Mapping) or set(case) != _CASE_FIELDS:
            raise RetrievalError(f"retrieval benchmark case {position} is not closed")
        case_id = case.get("id")
        if not isinstance(case_id, str) or not case_id or len(case_id) > 128 or case_id in seen:
            raise RetrievalError(f"retrieval benchmark case {position} has an invalid/duplicate id")
        seen.add(case_id)
        QuerySpec.from_dict(case.get("query"))
        for field in (
            "expected_event_ids",
            "forbidden_event_ids",
            "protected_markers",
            "required_contradiction_relationship_ids",
        ):
            value = case.get(field)
            if not isinstance(value, list) or len(set(value)) != len(value) or not all(
                isinstance(item, str) and item and len(item) <= 512 for item in value
            ):
                raise RetrievalError(f"{case_id}: {field} must be a unique bounded string array")
        if not case["expected_event_ids"]:
            raise RetrievalError(f"{case_id}: expected_event_ids must not be empty")
        if not isinstance(case.get("require_object_lineage"), bool) or not isinstance(case.get("strict_improvement"), bool):
            raise RetrievalError(f"{case_id}: benchmark flags must be booleans")
        out.append(case)
    if not any(case["strict_improvement"] for case in out):
        raise RetrievalError("retrieval benchmark requires a designated strict-improvement case")
    return out


def _metrics(event_ids: Sequence[str], expected: Sequence[str]) -> tuple[float, float, list[str]]:
    positions = {event_id: position for position, event_id in enumerate(event_ids, 1)}
    hits = [event_id for event_id in expected if event_id in positions]
    recall = len(hits) / len(expected)
    first = min((positions[event_id] for event_id in hits), default=None)
    reciprocal_rank = 1.0 / first if first else 0.0
    return recall, reciprocal_rank, hits


def build_retrieval_benchmark_report(
    cases: Sequence[Mapping[str, Any]],
    *,
    first_database: str | Path,
    second_database: str | Path,
    expected_projection_digest: str,
    access_scope: AccessScope,
    evidence_verifier: ExactEvidenceVerifier | object,
    evaluated_at: str,
    embedder: EmbeddingModel,
) -> dict[str, Any]:
    """Compare lexical/structured reference with hybrid retrieval and enforce Phase 3 gates."""
    materialized = _validate_cases(list(cases))
    results = []
    latency = {"lexical_reference_millis": [], "hybrid_millis": [], "rebuild_millis": []}
    failures: list[str] = []
    strict_improved = False

    for case in materialized:
        # Retrieval inputs are copied before any scoring-only field is inspected.
        case_id = str(case["id"])
        query = QuerySpec.from_dict(case["query"])
        start = time.perf_counter_ns()
        lexical = compile_context_packet(
            first_database,
            expected_projection_digest=expected_projection_digest,
            query=query,
            access_scope=access_scope,
            evidence_verifier=evidence_verifier,
            evaluated_at=evaluated_at,
            embedder=None,
        )
        lexical_end = time.perf_counter_ns()
        hybrid = compile_context_packet(
            first_database,
            expected_projection_digest=expected_projection_digest,
            query=query,
            access_scope=access_scope,
            evidence_verifier=evidence_verifier,
            evaluated_at=evaluated_at,
            embedder=embedder,
        )
        hybrid_end = time.perf_counter_ns()
        rebuilt = compile_context_packet(
            second_database,
            expected_projection_digest=expected_projection_digest,
            query=query,
            access_scope=access_scope,
            evidence_verifier=evidence_verifier,
            evaluated_at=evaluated_at,
            embedder=embedder,
        )
        rebuild_end = time.perf_counter_ns()
        latency["lexical_reference_millis"].append((lexical_end - start) / 1_000_000)
        latency["hybrid_millis"].append((hybrid_end - lexical_end) / 1_000_000)
        latency["rebuild_millis"].append((rebuild_end - hybrid_end) / 1_000_000)

        # Scoring-only fields are read only after all three packets exist.
        expected = list(case["expected_event_ids"])
        forbidden = set(case["forbidden_event_ids"])
        protected_markers = list(case["protected_markers"])
        required_contradictions = set(case["required_contradiction_relationship_ids"])
        lexical_ids = [entry["event_id"] for entry in lexical.packet["content"]["entries"]]
        hybrid_ids = [entry["event_id"] for entry in hybrid.packet["content"]["entries"]]
        lexical_recall, lexical_mrr, lexical_hits = _metrics(lexical_ids, expected)
        hybrid_recall, hybrid_mrr, hybrid_hits = _metrics(hybrid_ids, expected)
        forbidden_hits = sorted(forbidden.intersection(hybrid_ids))
        rendered = canonical_json(hybrid.packet)
        protected_intrusions = sum(marker in rendered for marker in protected_markers)
        surfaced_contradictions = {
            row["relationship_id"] for row in hybrid.packet["content"]["contradictions"]
        }
        contradiction_complete = required_contradictions.issubset(surfaced_contradictions)
        object_lineage_complete = (
            not case["require_object_lineage"]
            or bool(hybrid.manifest["lineage"]["object_refs"])
        )
        deterministic = hybrid.packet_bytes == rebuilt.packet_bytes and hybrid.manifest == rebuilt.manifest
        improved = hybrid_recall > lexical_recall or hybrid_mrr > lexical_mrr
        if case["strict_improvement"] and improved:
            strict_improved = True
        if forbidden_hits:
            failures.append(f"{case_id}: forbidden/post-cutoff event leakage")
        if protected_intrusions:
            failures.append(f"{case_id}: protected marker leakage")
        if not contradiction_complete:
            failures.append(f"{case_id}: contradiction coverage incomplete")
        if not object_lineage_complete:
            failures.append(f"{case_id}: exact object lineage missing")
        if not deterministic:
            failures.append(f"{case_id}: clean rebuild changed packet/manifest")
        results.append(
            {
                "id": case_id,
                "lexical_reference": {
                    "recall": round(lexical_recall, 6),
                    "mean_reciprocal_rank": round(lexical_mrr, 6),
                    "evidence_hits": sorted(lexical_hits),
                },
                "hybrid": {
                    "recall": round(hybrid_recall, 6),
                    "mean_reciprocal_rank": round(hybrid_mrr, 6),
                    "evidence_hits": sorted(hybrid_hits),
                },
                "forbidden_hit_count": len(forbidden_hits),
                "protected_intrusion_count": protected_intrusions,
                "contradiction_coverage_complete": contradiction_complete,
                "object_lineage_complete": object_lineage_complete,
                "rebuild_deterministic": deterministic,
                "designated_strict_improvement": bool(case["strict_improvement"]),
                "strictly_improved": improved,
                "packet_sha256": hybrid.packet_sha256,
                "manifest_sha256": hybrid.manifest["manifest_sha256"],
            }
        )

    lexical_recall = sum(row["lexical_reference"]["recall"] for row in results) / len(results)
    hybrid_recall = sum(row["hybrid"]["recall"] for row in results) / len(results)
    lexical_mrr = sum(row["lexical_reference"]["mean_reciprocal_rank"] for row in results) / len(results)
    hybrid_mrr = sum(row["hybrid"]["mean_reciprocal_rank"] for row in results) / len(results)
    if hybrid_recall < lexical_recall:
        failures.append("aggregate hybrid recall regressed versus lexical reference")
    if hybrid_mrr < lexical_mrr:
        failures.append("aggregate hybrid MRR regressed versus lexical reference")
    if not strict_improved:
        failures.append("no designated case strictly improved")

    def latency_summary(values: Sequence[float]) -> dict[str, float]:
        ordered = sorted(values)
        p95_index = max(0, math.ceil(0.95 * len(ordered)) - 1)
        return {
            "p50_millis": round(ordered[len(ordered) // 2], 3),
            "p95_millis": round(ordered[p95_index], 3),
        }

    return {
        "schema": REPORT_SCHEMA,
        "case_count": len(results),
        "cases": results,
        "aggregate": {
            "lexical_reference_recall": round(lexical_recall, 6),
            "hybrid_recall": round(hybrid_recall, 6),
            "lexical_reference_mean_reciprocal_rank": round(lexical_mrr, 6),
            "hybrid_mean_reciprocal_rank": round(hybrid_mrr, 6),
        },
        "gate": {
            "passed": not failures,
            "failures": sorted(set(failures)),
            "requirements": {
                "zero_access_or_post_cutoff_leakage": True,
                "deterministic_packet_and_manifest": True,
                "contradiction_and_lineage_coverage": True,
                "hybrid_recall_and_mrr_not_below_lexical": True,
                "designated_strict_improvement": True,
            },
        },
        "latency_informational": {
            name: latency_summary(values) for name, values in sorted(latency.items())
        },
        "latency_is_adoption_gate": False,
    }


def assert_retrieval_benchmark_gate(report: Mapping[str, Any]) -> None:
    if not isinstance(report, Mapping) or report.get("schema") != REPORT_SCHEMA:
        raise RetrievalError("retrieval benchmark report schema is invalid")
    gate = report.get("gate")
    if not isinstance(gate, Mapping) or gate.get("passed") is not True:
        failures = gate.get("failures", []) if isinstance(gate, Mapping) else []
        raise RetrievalError("retrieval benchmark gate failed: " + "; ".join(str(item) for item in failures))
