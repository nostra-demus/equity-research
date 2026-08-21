#!/usr/bin/env python3
"""Focused read-only regressions for permanent-memory Phase 6 operations."""
from __future__ import annotations

import copy
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any, Mapping


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from canonical_json import canonical_sha256  # noqa: E402
from memory_operations import (  # noqa: E402
    OperationsError,
    build_operational_readiness_report,
    load_json_read_only,
    operational_report_bytes,
    verify_operational_readiness_report,
)
from validate_screener_json import Checker  # noqa: E402


EVALUATED_AT = "2026-08-21T12:00:00Z"


def _baseline() -> dict[str, Any]:
    return json.loads(
        (ROOT / "frameworks" / "memory" / "phase0" / "baseline-report.json").read_text(
            encoding="utf-8"
        )
    )


def _recompute_phase0_metrics(report: dict[str, Any]) -> None:
    cases = report["cases"]
    complete = sum(row["complete_evidence_recall"] for row in cases)
    hits = sum(len(row["evidence_hits"]) for row in cases)
    targets = hits + sum(len(row["evidence_misses"]) for row in cases)
    temporal = [row for row in cases if row["category"] == "temporal_cutoff"]
    report["metrics"] = {
        "complete_evidence_recall_at_k": round(complete / len(cases), 6),
        "evidence_path_recall_at_k": round(hits / targets, 6),
        "mean_reciprocal_rank": round(
            sum(row["reciprocal_rank"] for row in cases) / len(cases), 6
        ),
        "protected_path_intrusions": sum(len(row["protected_hits"]) for row in cases),
        "temporal_forbidden_path_hits": sum(len(row["forbidden_hits"]) for row in temporal),
        "temporal_leakage_case_rate": round(
            sum(bool(row["forbidden_hits"]) for row in temporal) / len(temporal), 6
        ),
    }


def _passing_candidate() -> dict[str, Any]:
    candidate = copy.deepcopy(_baseline())
    for row in candidate["cases"]:
        if row["category"] == "temporal_cutoff":
            row["forbidden_hits"] = []
    row = next(item for item in candidate["cases"] if not item["complete_evidence_recall"])
    moved = row["evidence_misses"].pop(0)
    row["evidence_hits"].append(moved)
    row["complete_evidence_recall"] = True
    row["first_evidence_rank"] = 1
    row["reciprocal_rank"] = 1.0
    _recompute_phase0_metrics(candidate)
    return candidate


def _phase3_report(marker: str = "") -> dict[str, Any]:
    first_id = "synthetic-1" + (("-" + marker) if marker else "")
    return {
        "schema": "memory-retrieval-benchmark-report/v1",
        "case_count": 2,
        "cases": [
            {
                "id": first_id,
                "lexical_reference": {
                    "recall": 0.0,
                    "mean_reciprocal_rank": 0.0,
                    "evidence_hits": [],
                },
                "hybrid": {
                    "recall": 1.0,
                    "mean_reciprocal_rank": 1.0,
                    "evidence_hits": ["evt_synthetic_1"],
                },
                "forbidden_hit_count": 0,
                "protected_intrusion_count": 0,
                "contradiction_coverage_complete": True,
                "object_lineage_complete": True,
                "rebuild_deterministic": True,
                "designated_strict_improvement": True,
                "strictly_improved": True,
                "packet_sha256": "sha256:" + "d" * 64,
                "manifest_sha256": "sha256:" + "e" * 64,
            },
            {
                "id": "synthetic-2",
                "lexical_reference": {
                    "recall": 1.0,
                    "mean_reciprocal_rank": 0.5,
                    "evidence_hits": ["evt_synthetic_2"],
                },
                "hybrid": {
                    "recall": 1.0,
                    "mean_reciprocal_rank": 0.5,
                    "evidence_hits": ["evt_synthetic_2"],
                },
                "forbidden_hit_count": 0,
                "protected_intrusion_count": 0,
                "contradiction_coverage_complete": True,
                "object_lineage_complete": True,
                "rebuild_deterministic": True,
                "designated_strict_improvement": False,
                "strictly_improved": False,
                "packet_sha256": "sha256:" + "f" * 64,
                "manifest_sha256": "sha256:" + "0" * 64,
            },
        ],
        "aggregate": {
            "lexical_reference_recall": 0.5,
            "hybrid_recall": 1.0,
            "lexical_reference_mean_reciprocal_rank": 0.25,
            "hybrid_mean_reciprocal_rank": 0.75,
        },
        "gate": {
            "passed": True,
            "failures": [],
            "requirements": {
                "zero_access_or_post_cutoff_leakage": True,
                "deterministic_packet_and_manifest": True,
                "contradiction_and_lineage_coverage": True,
                "hybrid_recall_and_mrr_not_below_lexical": True,
                "designated_strict_improvement": True,
            },
        },
        "latency_informational": {
            "lexical_reference_millis": {"p50_millis": 1.0, "p95_millis": 2.0},
            "hybrid_millis": {"p50_millis": 1.5, "p95_millis": 2.5},
            "rebuild_millis": {"p50_millis": 1.75, "p95_millis": 2.75},
        },
        "latency_is_adoption_gate": False,
    }


def _projection_report() -> dict[str, Any]:
    return {
        "schema": "memory-cli-report/v1",
        "command": "doctor",
        "ok": True,
        "root": "/content-free/repository-boundary",
        "event_count": 424,
        "event_types": {"decision.recorded": 424},
        "projection": {
            "event_count": 424,
            "subject_count": 424,
            "edge_count": 0,
            "evidence_ref_count": 424,
            "artifact_count": 424,
            "typed_payload_count": 0,
            "digest": "a" * 64,
        },
        "diagnostics": [],
        "errors": [],
    }


def _store_report() -> dict[str, Any]:
    return {
        "schema": "memory-store-doctor-report/v1",
        "status": "healthy",
        "store_manifest_sha256": "sha256:" + "b" * 64,
        "deterministic_rebuilds": 2,
        "inventory": {
            "objects": 1,
            "events": 1,
            "exact_entries_read": 2,
            "managed_backups": 1,
            "retired_targets": 0,
            "purges": 0,
            "completed_purges": 0,
            "pending_purges": 0,
            "control_records": 0,
        },
        "checks": {
            "authorization": "verified",
            "authenticated_storage": "verified",
            "policy_gates": "verified",
            "exact_reads": "verified",
            "purge_state": "verified",
            "deterministic_rebuild": "verified",
            "external_anchor": "verified",
        },
    }


def _controlled(*, successes: int = 999, attempts: int = 1000, losses: int = 0) -> dict[str, Any]:
    return {
        "schema": "memory-controlled-write-reliability/v1",
        "window_start": "2026-08-01T00:00:00Z",
        "window_end": "2026-08-21T00:00:00Z",
        "valid_append_attempts": attempts,
        "successful_appends": successes,
        "rejected_invalid_writes": 7,
        "committed_event_loss_count": losses,
    }


def _performance(*, retrieval: int = 1999, compilation: int = 4999) -> dict[str, Any]:
    return {
        "schema": "memory-performance-observation/v1",
        "window_start": "2026-08-01T00:00:00Z",
        "window_end": "2026-08-21T00:00:00Z",
        "issuer_query_count": 100,
        "retrieval_p95_millis": retrieval,
        "context_compilation_p95_millis": compilation,
    }


def _restore(*, recovery: int = 14_400_000, losses: int = 0) -> dict[str, Any]:
    return {
        "schema": "memory-restore-drill-observation/v1",
        "performed_at": "2026-08-20T00:00:00Z",
        "full_restore_completed": True,
        "recovery_time_millis": recovery,
        "committed_event_loss_count": losses,
    }


def _access(*, leaks: int = 0, post_cutoff: int = 0) -> dict[str, Any]:
    return {
        "schema": "memory-access-audit-observation/v1",
        "window_start": "2026-08-01T00:00:00Z",
        "window_end": "2026-08-21T00:00:00Z",
        "audit_complete": True,
        "known_policy_leaks": leaks,
        "post_cutoff_fact_count": post_cutoff,
    }


def _schema_review(*, overdue: int = 0) -> dict[str, Any]:
    return {
        "schema": "memory-schema-deprecation-review/v1",
        "reviewed_at": "2026-08-20T00:00:00Z",
        "review_complete": True,
        "overdue_schema_count": overdue,
    }


def _scale(
    candidate: str,
    *,
    reference_slo_met: bool = False,
    candidate_slo_met: bool = True,
    sample_size: int = 100,
    regressions: int = 0,
    leaks: int = 0,
) -> dict[str, Any]:
    return {
        "schema": "memory-scale-comparison/v1",
        "candidate": candidate,
        "workload_sha256": "sha256:" + "c" * 64,
        "sample_size": sample_size,
        "reference_slo_met": reference_slo_met,
        "candidate_slo_met": candidate_slo_met,
        "correctness_regressions": regressions,
        "known_policy_leaks": leaks,
    }


def _full_report(**overrides: Any) -> dict[str, Any]:
    arguments: dict[str, Any] = {
        "evaluated_at": EVALUATED_AT,
        "phase0_baseline_report": _baseline(),
        "phase0_candidate_report": _passing_candidate(),
        "phase3_synthetic_report": _phase3_report(),
        "projection_doctor_report": _projection_report(),
        "store_doctor_report": _store_report(),
        "controlled_write_observation": _controlled(),
        "performance_observation": _performance(),
        "restore_drill_observation": _restore(),
        "access_audit_observation": _access(),
        "schema_review_observation": _schema_review(),
        "scale_comparisons": [],
    }
    arguments.update(overrides)
    return build_operational_readiness_report(**arguments)


def _slo(report: Mapping[str, Any], slo_id: str) -> Mapping[str, Any]:
    return next(row for row in report["slos"] if row["slo_id"] == slo_id)


def _rehash(report: dict[str, Any]) -> None:
    body = dict(report)
    body.pop("report_sha256", None)
    report["report_sha256"] = "sha256:" + canonical_sha256(body)


def _expect_operations_error(fn, contains: str) -> None:
    try:
        fn()
    except OperationsError as exc:
        assert contains in str(exc), str(exc)
        return
    raise AssertionError(f"expected OperationsError containing {contains!r}")


def _walk(value: Any):
    yield value
    if isinstance(value, dict):
        for nested in value.values():
            yield from _walk(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from _walk(nested)


def test_schema_closure_and_minimal_determinism() -> None:
    schema = json.loads(
        (ROOT / "frameworks" / "memory" / "operational-readiness-report-v1.schema.json").read_text(
            encoding="utf-8"
        )
    )
    for node in _walk(schema):
        if isinstance(node, dict):
            node_type = node.get("type")
            if node_type == "object" or (
                isinstance(node_type, list) and "object" in node_type
            ):
                assert node.get("additionalProperties") is False, node

    baseline = _baseline()
    before = copy.deepcopy(baseline)
    first = build_operational_readiness_report(
        evaluated_at=EVALUATED_AT, phase0_baseline_report=baseline
    )
    second = build_operational_readiness_report(
        evaluated_at=EVALUATED_AT, phase0_baseline_report=baseline
    )
    assert baseline == before
    assert first == second
    assert operational_report_bytes(first) == operational_report_bytes(second)
    assert first["status"] == "unmeasured"
    production = first["adoption"]["production_benchmark"]
    assert production["status"] == "unmeasured"
    assert production["baseline_corpus"] == baseline["corpus"]
    assert production["candidate_corpus"] is None
    assert production["corpus_match"] == "unmeasured"
    assert first["adoption"]["phase3_synthetic"]["status"] == "unmeasured"
    assert all(not row["expansion_justified"] for row in first["scale_decisions"])
    assert [row["action"] for row in first["scale_decisions"]] == [
        "stay-sqlite", "do-not-add", "do-not-add", "do-not-add"
    ]
    checker = Checker(schema)
    checker.check(schema, first, "")
    assert checker.errors == []
    production_schema = schema["$defs"]["productionBenchmark"]
    assert set(production_schema["required"]) == set(production_schema["properties"])
    assert set(production) == set(production_schema["properties"])


def test_adoption_requires_exact_63_case_candidate() -> None:
    synthetic_only = build_operational_readiness_report(
        evaluated_at=EVALUATED_AT,
        phase0_baseline_report=_baseline(),
        phase3_synthetic_report=_phase3_report("SYNTHETIC-MARKER-MUST-NOT-LEAK"),
    )
    assert synthetic_only["adoption"]["phase3_synthetic"]["status"] == "met"
    assert synthetic_only["adoption"]["phase3_synthetic"]["counts_as_production_adoption"] is False
    assert synthetic_only["adoption"]["production_benchmark"]["status"] == "unmeasured"
    assert b"SYNTHETIC-MARKER-MUST-NOT-LEAK" not in operational_report_bytes(synthetic_only)

    forged_phase3 = _phase3_report()
    forged_phase3["cases"][0]["protected_intrusion_count"] = 1
    _expect_operations_error(
        lambda: build_operational_readiness_report(
            evaluated_at=EVALUATED_AT,
            phase0_baseline_report=_baseline(),
            phase3_synthetic_report=forged_phase3,
        ),
        "failures contradict derived findings",
    )
    forged_aggregate = _phase3_report()
    forged_aggregate["aggregate"]["hybrid_recall"] = 0.99
    _expect_operations_error(
        lambda: build_operational_readiness_report(
            evaluated_at=EVALUATED_AT,
            phase0_baseline_report=_baseline(),
            phase3_synthetic_report=forged_aggregate,
        ),
        "does not match case averages",
    )
    no_designated_improvement = _phase3_report()
    no_designated_improvement["cases"][0]["designated_strict_improvement"] = False
    _expect_operations_error(
        lambda: build_operational_readiness_report(
            evaluated_at=EVALUATED_AT,
            phase0_baseline_report=_baseline(),
            phase3_synthetic_report=no_designated_improvement,
        ),
        "failures contradict derived findings",
    )
    open_phase3 = _phase3_report()
    open_phase3["untrusted_override"] = True
    _expect_operations_error(
        lambda: build_operational_readiness_report(
            evaluated_at=EVALUATED_AT,
            phase0_baseline_report=_baseline(),
            phase3_synthetic_report=open_phase3,
        ),
        "exactly",
    )

    candidate = _passing_candidate()
    passed = build_operational_readiness_report(
        evaluated_at=EVALUATED_AT,
        phase0_baseline_report=_baseline(),
        phase0_candidate_report=candidate,
    )
    production = passed["adoption"]["production_benchmark"]
    assert production["status"] == "met"
    assert production["case_count"] == 63
    assert production["candidate_report_sha256"] is not None
    assert production["baseline_corpus"] == _baseline()["corpus"]
    assert production["candidate_corpus"] == candidate["corpus"]
    assert production["corpus_match"] == "matched"
    assert production["candidate_metrics"]["temporal_forbidden_path_hits"] == 0

    failed_matching = build_operational_readiness_report(
        evaluated_at=EVALUATED_AT,
        phase0_baseline_report=_baseline(),
        phase0_candidate_report=_baseline(),
    )["adoption"]["production_benchmark"]
    assert failed_matching["corpus_match"] == "matched"
    assert failed_matching["status"] == "failed"
    assert failed_matching["comparison"] == "regressed-no-improvement-or-serious-leakage"

    for corpus_field, mismatched_value in (
        ("sha256", "0" * 64),
        ("total_bytes", candidate["corpus"]["total_bytes"] + 1),
        (
            "unique_files_considered",
            candidate["corpus"]["unique_files_considered"] + 1,
        ),
    ):
        mismatched = copy.deepcopy(candidate)
        mismatched["corpus"][corpus_field] = mismatched_value
        audited = build_operational_readiness_report(
            evaluated_at=EVALUATED_AT,
            phase0_baseline_report=_baseline(),
            phase0_candidate_report=mismatched,
        )["adoption"]["production_benchmark"]
        assert audited["status"] == "unmeasured"
        assert audited["comparison"] == "corpus-mismatch"
        assert audited["corpus_match"] == "mismatched"
        assert audited["candidate_report_sha256"] is not None
        assert audited["candidate_corpus"] == mismatched["corpus"]
        assert audited["candidate_metrics"] == production["candidate_metrics"]

    malformed_corpora = []
    missing = copy.deepcopy(candidate)
    missing.pop("corpus")
    malformed_corpora.append((missing, "corpus must be an object"))
    extra = copy.deepcopy(candidate)
    extra["corpus"]["untrusted_note"] = "not part of the anchor"
    malformed_corpora.append((extra, "must contain exactly"))
    prefixed = copy.deepcopy(candidate)
    prefixed["corpus"]["sha256"] = "sha256:" + "0" * 64
    malformed_corpora.append((prefixed, "bare lowercase"))
    uppercase = copy.deepcopy(candidate)
    uppercase["corpus"]["sha256"] = "A" * 64
    malformed_corpora.append((uppercase, "bare lowercase"))
    negative_bytes = copy.deepcopy(candidate)
    negative_bytes["corpus"]["total_bytes"] = -1
    malformed_corpora.append((negative_bytes, "integer >= 0"))
    boolean_bytes = copy.deepcopy(candidate)
    boolean_bytes["corpus"]["total_bytes"] = True
    malformed_corpora.append((boolean_bytes, "integer >= 0"))
    unsafe_bytes = copy.deepcopy(candidate)
    unsafe_bytes["corpus"]["total_bytes"] = 9_007_199_254_740_992
    malformed_corpora.append((unsafe_bytes, "JSON safe integers"))
    zero_files = copy.deepcopy(candidate)
    zero_files["corpus"]["unique_files_considered"] = 0
    malformed_corpora.append((zero_files, "integer >= 1"))
    unsafe_files = copy.deepcopy(candidate)
    unsafe_files["corpus"]["unique_files_considered"] = 9_007_199_254_740_992
    malformed_corpora.append((unsafe_files, "JSON safe integers"))
    for malformed, error in malformed_corpora:
        _expect_operations_error(
            lambda malformed=malformed: build_operational_readiness_report(
                evaluated_at=EVALUATED_AT,
                phase0_baseline_report=_baseline(),
                phase0_candidate_report=malformed,
            ),
            error,
        )

    wrong_hash = copy.deepcopy(candidate)
    wrong_hash["benchmark"]["sha256"] = "0" * 64
    _expect_operations_error(
        lambda: build_operational_readiness_report(
            evaluated_at=EVALUATED_AT,
            phase0_baseline_report=_baseline(),
            phase0_candidate_report=wrong_hash,
        ),
        "reviewed Phase 0 benchmark bytes",
    )
    short = copy.deepcopy(candidate)
    short["cases"].pop()
    _expect_operations_error(
        lambda: build_operational_readiness_report(
            evaluated_at=EVALUATED_AT,
            phase0_baseline_report=_baseline(),
            phase0_candidate_report=short,
        ),
        "exactly 63 rows",
    )
    altered_baseline = _baseline()
    altered_baseline["limitations"] = list(altered_baseline["limitations"]) + [
        "Unreviewed baseline mutation"
    ]
    _expect_operations_error(
        lambda: build_operational_readiness_report(
            evaluated_at=EVALUATED_AT,
            phase0_baseline_report=altered_baseline,
        ),
        "reviewed baseline snapshot",
    )


def test_operational_slos_and_external_anchor() -> None:
    report = _full_report()
    assert report["operational_evidence"]["projection_rebuild"]["status"] == "met"
    assert report["operational_evidence"]["object_store_doctor"]["status"] == "met"
    assert report["operational_evidence"]["object_store_doctor"]["external_anchor_verified"] is True
    assert _slo(report, "canonical-event-integrity")["status"] == "met"
    assert _slo(report, "canonical-append-success")["status"] == "met"
    assert _slo(report, "retrieval-p95")["status"] == "met"
    assert _slo(report, "context-compilation-p95")["status"] == "met"
    assert _slo(report, "committed-event-loss-rpo")["status"] == "met"
    assert _slo(report, "restore-rto")["status"] == "met"
    assert _slo(report, "full-restore-cadence")["status"] == "met"
    assert _slo(report, "access-audit-cadence")["status"] == "met"
    assert _slo(report, "schema-deprecation-review-cadence")["status"] == "met"
    assert _slo(report, "material-claim-lineage")["status"] == "unmeasured"
    assert _slo(report, "projection-rebuild-cadence")["status"] == "unmeasured"
    assert report["status"] == "unmeasured"
    assert report["automation"] == {"scheduled_by_report": False, "state_mutation": "none"}

    append_failure = _full_report(controlled_write_observation=_controlled(successes=998))
    assert _slo(append_failure, "canonical-append-success")["status"] == "failed"
    assert append_failure["status"] == "failed"
    rounded_failure = _full_report(
        controlled_write_observation=_controlled(successes=2996, attempts=2999)
    )
    assert rounded_failure["operational_evidence"]["controlled_writes"][
        "append_success_rate"
    ] == 0.999
    assert _slo(rounded_failure, "canonical-append-success")["status"] == "failed"
    performance_failure = _full_report(performance_observation=_performance(retrieval=2000))
    assert _slo(performance_failure, "retrieval-p95")["status"] == "failed"
    restore_failure = _full_report(restore_drill_observation=_restore(recovery=14_400_001))
    assert _slo(restore_failure, "restore-rto")["status"] == "failed"
    leak = _full_report(access_audit_observation=_access(leaks=1))
    assert _slo(leak, "known-policy-leakage")["status"] == "failed"

    refused = {
        "schema": "memory-store-doctor-report/v1",
        "status": "refused",
        "error_code": "unanchored-consistency",
    }
    unanchored = _full_report(store_doctor_report=refused)
    assert unanchored["operational_evidence"]["object_store_doctor"]["status"] == "failed"
    assert unanchored["operational_evidence"]["object_store_doctor"]["external_anchor_verified"] is False

    future_performance = _performance()
    future_performance["window_end"] = "2026-08-22T00:00:00Z"
    _expect_operations_error(
        lambda: _full_report(performance_observation=future_performance),
        "cannot end after evaluated_at",
    )
    stale_access = _access()
    stale_access["window_start"] = "2026-05-01T00:00:00Z"
    stale_access["window_end"] = "2026-05-21T11:59:59Z"
    stale_report = _full_report(access_audit_observation=stale_access)
    assert _slo(stale_report, "access-audit-cadence")["observed"]["value"] == 93
    assert _slo(stale_report, "access-audit-cadence")["status"] == "failed"


def test_scale_requires_comparative_measured_need() -> None:
    report = _full_report(
        scale_comparisons=[
            _scale("postgresql"),
            _scale("graph-engine", reference_slo_met=True),
            _scale("vector-index", regressions=1),
        ]
    )
    decisions = {row["candidate"]: row for row in report["scale_decisions"]}
    assert decisions["postgresql"]["expansion_justified"] is True
    assert decisions["postgresql"]["action"] == "consider-postgresql"
    assert decisions["graph-engine"]["action"] == "do-not-add"
    assert decisions["graph-engine"]["blocking_reasons"] == ["reference-slo-met"]
    assert decisions["vector-index"]["status"] == "failed"
    assert decisions["vector-index"]["action"] == "do-not-add"
    assert decisions["remote-object-store"]["status"] == "unmeasured"
    assert decisions["remote-object-store"]["action"] == "do-not-add"

    duplicate = [_scale("postgresql"), _scale("postgresql")]
    _expect_operations_error(
        lambda: _full_report(scale_comparisons=duplicate), "duplicate scale comparison"
    )
    open_observation = _scale("postgresql")
    open_observation["business_case"] = "unreviewed prose"
    _expect_operations_error(
        lambda: _full_report(scale_comparisons=[open_observation]), "exactly"
    )


def test_rehashed_semantic_mutations_fail() -> None:
    report = _full_report()
    forged_adoption = copy.deepcopy(report)
    forged_adoption["adoption"]["production_benchmark"]["candidate_report_sha256"] = None
    forged_adoption["adoption"]["production_benchmark"]["candidate_metrics"] = None
    forged_adoption["adoption"]["production_benchmark"]["status"] = "met"
    forged_adoption["adoption"]["production_benchmark"]["comparison"] = "unmeasured"
    _rehash(forged_adoption)
    _expect_operations_error(
        lambda: verify_operational_readiness_report(forged_adoption),
        "must remain unmeasured",
    )

    forged_corpus = copy.deepcopy(report)
    forged_corpus["adoption"]["production_benchmark"]["candidate_corpus"]["sha256"] = (
        "0" * 64
    )
    _rehash(forged_corpus)
    _expect_operations_error(
        lambda: verify_operational_readiness_report(forged_corpus),
        "must remain unmeasured for a corpus mismatch",
    )

    forged_match_state = copy.deepcopy(report)
    forged_production = forged_match_state["adoption"]["production_benchmark"]
    forged_production["status"] = "unmeasured"
    forged_production["comparison"] = "corpus-mismatch"
    forged_production["corpus_match"] = "mismatched"
    _rehash(forged_match_state)
    _expect_operations_error(
        lambda: verify_operational_readiness_report(forged_match_state),
        "corpus match state is contradictory",
    )

    forged_baseline_corpus = copy.deepcopy(report)
    forged_baseline_corpus["adoption"]["production_benchmark"]["baseline_corpus"][
        "total_bytes"
    ] += 1
    _rehash(forged_baseline_corpus)
    _expect_operations_error(
        lambda: verify_operational_readiness_report(forged_baseline_corpus),
        "reviewed Phase 0 anchor",
    )

    forged_scale = copy.deepcopy(report)
    row = forged_scale["scale_decisions"][0]
    row["expansion_justified"] = True
    row["action"] = "consider-postgresql"
    row["blocking_reasons"] = []
    _rehash(forged_scale)
    _expect_operations_error(
        lambda: verify_operational_readiness_report(forged_scale),
        "scale decision contradicts",
    )

    forged_rate = copy.deepcopy(report)
    controlled = forged_rate["operational_evidence"]["controlled_writes"]
    controlled["successful_appends"] = 1
    controlled["append_success_rate"] = 0.999
    _rehash(forged_rate)
    _expect_operations_error(
        lambda: verify_operational_readiness_report(forged_rate), "rate does not match"
    )


def test_cli_is_read_only_and_refuses_symlinks() -> None:
    with tempfile.TemporaryDirectory(prefix="memory-operations-test-") as raw:
        root = Path(raw)
        baseline_path = root / "baseline.json"
        baseline_path.write_text(json.dumps(_baseline()), encoding="utf-8")
        before_bytes = baseline_path.read_bytes()
        before_stat = baseline_path.stat()
        before_names = sorted(path.name for path in root.iterdir())
        command = [
            sys.executable,
            str(SCRIPTS / "memory_operations.py"),
            "report",
            "--evaluated-at",
            EVALUATED_AT,
            "--phase0-baseline",
            str(baseline_path),
        ]
        completed = subprocess.run(command, cwd=root, capture_output=True, check=False)
        assert completed.returncode == 2, completed.stderr.decode("utf-8")
        emitted = json.loads(completed.stdout)
        assert emitted["status"] == "unmeasured"
        assert baseline_path.read_bytes() == before_bytes
        after_stat = baseline_path.stat()
        assert (before_stat.st_ino, before_stat.st_mode, before_stat.st_size) == (
            after_stat.st_ino,
            after_stat.st_mode,
            after_stat.st_size,
        )
        assert sorted(path.name for path in root.iterdir()) == before_names

        link = root / "baseline-link.json"
        link.symlink_to(baseline_path)
        _expect_operations_error(lambda: load_json_read_only(link), "non-symlink")

        duplicate = root / "duplicate.json"
        duplicate.write_text('{"schema":"x","schema":"y"}', encoding="utf-8")
        _expect_operations_error(lambda: load_json_read_only(duplicate), "duplicate JSON key")

        deep = root / "deep.json"
        deep.write_text('{"nested":' + "[" * 2000 + "0" + "]" * 2000 + "}", encoding="utf-8")
        _expect_operations_error(
            lambda: load_json_read_only(deep), "maximum JSON nesting depth of 128"
        )

        unmatched_prefix = root / "unmatched-prefix.json"
        unmatched_prefix.write_text("]" * 200 + "[" * 129, encoding="utf-8")
        _expect_operations_error(
            lambda: load_json_read_only(unmatched_prefix),
            "maximum JSON nesting depth of 128",
        )

        many_nodes = root / "many-nodes.json"
        many_nodes.write_text(json.dumps({"nodes": [0] * 100_001}), encoding="utf-8")
        _expect_operations_error(
            lambda: load_json_read_only(many_nodes), "100000-node JSON limit"
        )

        delimiter_string = root / "delimiter-string.json"
        delimiter_string.write_text(
            json.dumps({"text": "[" * 2000 + "]" * 2000}), encoding="utf-8"
        )
        assert load_json_read_only(delimiter_string)["text"].startswith("[[")

        nested: Any = 0
        for _ in range(2_000):
            nested = [nested]
        _expect_operations_error(
            lambda: verify_operational_readiness_report(
                {"schema": "memory-operational-readiness-report/v1", "nested": nested}
            ),
            "maximum JSON nesting depth of 128",
        )

        _expect_operations_error(
            lambda: verify_operational_readiness_report(
                {
                    "schema": "memory-operational-readiness-report/v1",
                    "oversized": "x" * 16_000_001,
                }
            ),
            "16000000-byte JSON size limit",
        )

        recursive: dict[str, Any] = {"schema": "memory-operational-readiness-report/v1"}
        recursive["recursive"] = recursive
        _expect_operations_error(
            lambda: verify_operational_readiness_report(recursive),
            "recursively nested",
        )


def main() -> None:
    tests = [
        test_schema_closure_and_minimal_determinism,
        test_adoption_requires_exact_63_case_candidate,
        test_operational_slos_and_external_anchor,
        test_scale_requires_comparative_measured_need,
        test_rehashed_semantic_mutations_fail,
        test_cli_is_read_only_and_refuses_symlinks,
    ]
    for test in tests:
        test()
    print(f"memory operations tests: PASS ({len(tests)} groups)")


if __name__ == "__main__":
    main()
