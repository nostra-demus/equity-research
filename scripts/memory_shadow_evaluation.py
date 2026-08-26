#!/usr/bin/env python3
"""Build a pre-registered, content-free production shadow A/B release report."""
from __future__ import annotations

import argparse
import datetime as dt
import json
import math
import statistics
import sys
from pathlib import Path
from typing import Any, Mapping, Sequence

try:
    from canonical_json import canonical_sha256
    from memory_crypto import load_master_key_file
    from memory_profiles import research_agent_files
    from memory_release_attestation import sign_attestation, verify_attestation
    from memory_runtime import _atomic_private_write, _safe_regular
except ImportError:  # pragma: no cover
    from scripts.canonical_json import canonical_sha256
    from scripts.memory_crypto import load_master_key_file
    from scripts.memory_profiles import research_agent_files
    from scripts.memory_release_attestation import sign_attestation, verify_attestation
    from scripts.memory_runtime import _atomic_private_write, _safe_regular


PREREG_SCHEMA = "memory-shadow-preregistration/v1"
OBSERVATION_SCHEMA = "memory-shadow-pair-observation/v1"
REPORT_SCHEMA = "memory-shadow-evaluation-report/v1"
ADJUDICATION_DOMAIN = b"memory-shadow-adjudication-attestation/v1\0"
ADJUDICATION_ATTESTATION_FIELDS = {
    "schema", "adjudicator_id", "attested_at", "report_body_sha256", "signature",
}
MODES = {"synthetic-ci", "production-shadow"}
HASH_FIELDS = {
    "preregistration_sha256",
    "prompt_program_sha256", "source_pool_sha256", "snapshot_sha256", "access_scope_sha256",
    "packet_data_sha256", "baseline_output_sha256", "memory_output_sha256", "observation_sha256",
}
TARGET = {
    "minimum_runs": 10,
    "minimum_prior_review_issuers": 5,
    "minimum_paired_tasks": 100,
    "minimum_provider_parity_groups": 10,
    "minimum_evidence_coverage": 1.0,
    "minimum_mandatory_recheck_rate": 0.8,
    "minimum_quality_improvement": 0.1,
    "maximum_context_compilation_p95_millis": 5000,
    "maximum_median_cost_overhead": 0.25,
}
PREREG_FIELDS = {
    "schema", "evaluation_id", "evaluation_mode", "registered_at", "target",
    "provider_models", "roster_sha256", "required_agent_keys", "preregistration_sha256",
}
OBSERVATION_FIELDS = {
    "schema", "evaluation_id", "preregistration_sha256", "pair_id", "provider_parity_group", "run_id", "issuer_key",
    "issuer_has_prior_review", "task_id", "agent_id", "module", "provider", "model",
    "prompt_program_sha256", "source_pool_sha256", "snapshot_sha256", "access_scope_sha256",
    "packet_data_sha256", "completed_at", "baseline_output_sha256", "memory_output_sha256",
    "baseline_cost_microusd", "memory_cost_microusd", "context_compilation_millis",
    "baseline_metrics", "memory_metrics", "adjudicator_id", "observation_sha256",
}
BASELINE_FIELDS = {
    "serious_errors", "contradiction_opportunities", "contradictions_surfaced",
    "prior_defense_opportunities", "prior_defenses_completed", "abstention_opportunities",
    "correct_abstentions",
}
MEMORY_FIELDS = BASELINE_FIELDS | {
    "material_memory_claims", "claims_with_exact_evidence_or_inference", "qualifier_losses",
    "protected_content_leaks", "temporal_leaks", "mandatory_prior_checks",
    "mandatory_prior_rechecked",
}


class ShadowEvaluationError(ValueError):
    """A preregistration, paired observation, or aggregate is invalid."""


def _instant(value: Any, label: str) -> tuple[str, dt.datetime]:
    if not isinstance(value, str):
        raise ShadowEvaluationError(f"{label} must be an aware ISO-8601 timestamp")
    try:
        moment = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ShadowEvaluationError(f"{label} must be an aware ISO-8601 timestamp") from exc
    if moment.tzinfo is None:
        raise ShadowEvaluationError(f"{label} must be timezone-aware")
    normalized = moment.astimezone(dt.timezone.utc)
    return normalized.isoformat(timespec="microseconds").replace("+00:00", "Z"), normalized


def _hash(value: Any, label: str) -> str:
    if not isinstance(value, str) or len(value) != 71 or not value.startswith("sha256:"):
        raise ShadowEvaluationError(f"{label} must be a SHA-256 commitment")
    try:
        int(value[7:], 16)
    except ValueError as exc:
        raise ShadowEvaluationError(f"{label} must be a SHA-256 commitment") from exc
    if value != value.casefold():
        raise ShadowEvaluationError(f"{label} must be lowercase")
    return value


def _id(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value or len(value) > 160 or any(ord(char) < 33 for char in value):
        raise ShadowEvaluationError(f"{label} is invalid")
    return value


def _count(value: Any, label: str, *, minimum: int = 0) -> int:
    if type(value) is not int or value < minimum or value > 9_007_199_254_740_991:
        raise ShadowEvaluationError(f"{label} must be a non-negative safe integer")
    return value


def _metrics(value: Any, *, memory: bool, label: str) -> dict[str, int]:
    fields = MEMORY_FIELDS if memory else BASELINE_FIELDS
    if not isinstance(value, Mapping) or set(value) != fields:
        raise ShadowEvaluationError(f"{label} has an invalid closed shape")
    result = {field: _count(value.get(field), f"{label}.{field}") for field in fields}
    for opportunities, successes in (
        ("contradiction_opportunities", "contradictions_surfaced"),
        ("prior_defense_opportunities", "prior_defenses_completed"),
        ("abstention_opportunities", "correct_abstentions"),
    ):
        if result[successes] > result[opportunities]:
            raise ShadowEvaluationError(f"{label}.{successes} exceeds its opportunities")
    if memory:
        if result["claims_with_exact_evidence_or_inference"] > result["material_memory_claims"]:
            raise ShadowEvaluationError(f"{label} evidence count exceeds material claims")
        if result["mandatory_prior_rechecked"] > result["mandatory_prior_checks"]:
            raise ShadowEvaluationError(f"{label} rechecks exceed mandatory checks")
    return result


def analytical_agent_keys(root: str | Path) -> list[str]:
    keys: list[str] = []
    for path in research_agent_files(Path(root).resolve()):
        if path.name == "synthesizer.md":
            keys.append("master/synthesizer")
        else:
            keys.append(f"{path.parent.name}/{path.stem}")
    keys.sort()
    if not keys or len(keys) != len(set(keys)):
        raise ShadowEvaluationError("analytical memory roster is empty or ambiguous")
    return keys


def analytical_roster_sha256(root: str | Path) -> str:
    return "sha256:" + canonical_sha256(analytical_agent_keys(root))


def seal_preregistration(
    *, evaluation_id: str, evaluation_mode: str, registered_at: str,
    provider_models: Sequence[str], required_agent_keys: Sequence[str],
) -> dict[str, Any]:
    _id(evaluation_id, "evaluation_id")
    if not evaluation_id.startswith("memory-shadow-eval-") or evaluation_mode not in MODES:
        raise ShadowEvaluationError("evaluation identity or mode is invalid")
    normalized, _ = _instant(registered_at, "registered_at")
    providers = sorted(set(provider_models))
    if len(providers) < 2 or not any(item.startswith("codex/") for item in providers) or not any(item.startswith("claude/") for item in providers):
        raise ShadowEvaluationError("provider parity requires declared Claude and Codex models")
    for item in providers:
        _id(item, "provider_models item")
    agents = list(required_agent_keys)
    if not agents or agents != sorted(set(agents)):
        raise ShadowEvaluationError("required analytical agent keys must be a non-empty sorted unique roster")
    for item in agents:
        _id(item, "required_agent_keys item")
    body: dict[str, Any] = {
        "schema": PREREG_SCHEMA, "evaluation_id": evaluation_id, "evaluation_mode": evaluation_mode,
        "registered_at": normalized, "target": dict(TARGET), "provider_models": providers,
        "roster_sha256": "sha256:" + canonical_sha256(agents), "required_agent_keys": agents,
    }
    body["preregistration_sha256"] = "sha256:" + canonical_sha256(body)
    return body


def verify_preregistration(value: Any) -> dict[str, Any]:
    if not isinstance(value, Mapping) or set(value) != PREREG_FIELDS or value.get("schema") != PREREG_SCHEMA:
        raise ShadowEvaluationError("shadow preregistration has an invalid closed shape")
    expected = seal_preregistration(
        evaluation_id=value.get("evaluation_id"), evaluation_mode=value.get("evaluation_mode"),
        registered_at=value.get("registered_at"), provider_models=value.get("provider_models", []),
        required_agent_keys=value.get("required_agent_keys", []),
    )
    if value.get("target") != TARGET or dict(value) != expected:
        raise ShadowEvaluationError("shadow preregistration hash or fixed targets do not match")
    return expected


def seal_observation(value: Mapping[str, Any]) -> dict[str, Any]:
    body = {key: item for key, item in value.items() if key != "observation_sha256"}
    body["observation_sha256"] = "sha256:" + canonical_sha256(body)
    return body


def verify_observation(value: Any, preregistration: Mapping[str, Any]) -> dict[str, Any]:
    if not isinstance(value, Mapping) or set(value) != OBSERVATION_FIELDS or value.get("schema") != OBSERVATION_SCHEMA:
        raise ShadowEvaluationError("shadow observation has an invalid closed shape")
    if value.get("evaluation_id") != preregistration["evaluation_id"]:
        raise ShadowEvaluationError("shadow observation belongs to another evaluation")
    if value.get("preregistration_sha256") != preregistration["preregistration_sha256"]:
        raise ShadowEvaluationError("shadow observation does not bind the exact preregistration")
    for field in (
        "pair_id", "run_id", "issuer_key", "task_id", "agent_id", "module", "provider", "model",
        "adjudicator_id",
    ):
        _id(value.get(field), field)
    if value.get("agent_id") not in preregistration["required_agent_keys"]:
        raise ShadowEvaluationError("shadow observation agent is outside the preregistered analytical roster")
    if value.get("task_id") != value.get("agent_id"):
        raise ShadowEvaluationError("shadow observation task does not match its analytical agent")
    parity_group = value.get("provider_parity_group")
    if parity_group is not None:
        _id(parity_group, "provider_parity_group")
    if type(value.get("issuer_has_prior_review")) is not bool:
        raise ShadowEvaluationError("issuer_has_prior_review must be boolean")
    provider_model = f"{value['provider']}/{value['model']}"
    if provider_model not in preregistration["provider_models"]:
        raise ShadowEvaluationError("shadow observation uses an undeclared provider/model")
    if value["agent_id"] == value["adjudicator_id"]:
        raise ShadowEvaluationError("shadow observation lacks an independent adjudicator")
    for field in HASH_FIELDS:
        _hash(value.get(field), field)
    completed_text, completed = _instant(value.get("completed_at"), "completed_at")
    _, registered = _instant(preregistration["registered_at"], "registered_at")
    if completed < registered or completed_text != value["completed_at"]:
        raise ShadowEvaluationError("shadow observation predates preregistration or is not normalized")
    _count(value.get("baseline_cost_microusd"), "baseline_cost_microusd", minimum=1)
    _count(value.get("memory_cost_microusd"), "memory_cost_microusd", minimum=1)
    _count(value.get("context_compilation_millis"), "context_compilation_millis")
    baseline_metrics = _metrics(value.get("baseline_metrics"), memory=False, label="baseline_metrics")
    memory_metrics = _metrics(value.get("memory_metrics"), memory=True, label="memory_metrics")
    for field in (
        "contradiction_opportunities", "prior_defense_opportunities", "abstention_opportunities",
    ):
        if baseline_metrics[field] != memory_metrics[field]:
            raise ShadowEvaluationError(f"paired outputs disagree on {field}")
    expected = seal_observation(value)
    if dict(value) != expected:
        raise ShadowEvaluationError("shadow observation hash does not match")
    return expected


def _adjudication_attestation(
    body: Mapping[str, Any], *, private_key: bytes, key_id: str,
    adjudicator_id: str, attested_at: str,
) -> dict[str, Any]:
    _id(adjudicator_id, "adjudicator_id")
    normalized, instant = _instant(attested_at, "attested_at")
    _, window_end = _instant(body.get("window", {}).get("end"), "window.end")
    if instant < window_end:
        raise ShadowEvaluationError("adjudication cannot predate the evaluated observations")
    payload: dict[str, Any] = {
        "schema": "memory-shadow-adjudication-attestation/v1",
        "adjudicator_id": adjudicator_id,
        "attested_at": normalized,
        "report_body_sha256": "sha256:" + canonical_sha256(body),
    }
    return {
        **payload,
        "signature": sign_attestation(
            payload, domain=ADJUDICATION_DOMAIN, private_key=private_key, key_id=key_id,
        ),
    }


def verify_adjudication_attestation(
    report: Mapping[str, Any], *, public_key: bytes, key_id: str,
) -> bool:
    attestation = report.get("adjudication_attestation")
    if not isinstance(attestation, Mapping) or set(attestation) != ADJUDICATION_ATTESTATION_FIELDS:
        return False
    body = {
        key: value for key, value in report.items()
        if key not in {"report_sha256", "adjudication_attestation"}
    }
    payload = {key: value for key, value in attestation.items() if key != "signature"}
    try:
        normalized, attested = _instant(payload.get("attested_at"), "attested_at")
        _, window_end = _instant(body.get("window", {}).get("end"), "window.end")
    except (ShadowEvaluationError, AttributeError):
        return False
    return (
        payload.get("schema") == "memory-shadow-adjudication-attestation/v1"
        and normalized == payload.get("attested_at") and attested >= window_end
        and payload.get("report_body_sha256") == "sha256:" + canonical_sha256(body)
        and verify_attestation(
            payload, attestation.get("signature"), domain=ADJUDICATION_DOMAIN,
            public_key=public_key, key_id=key_id,
        )
    )


def _rate(successes: int, opportunities: int) -> float:
    return round(successes / opportunities, 6) if opportunities else 0.0


def _improvement(rows: Sequence[Mapping[str, Any]], opportunities: str, successes: str) -> float:
    baseline_opportunities = sum(row["baseline_metrics"][opportunities] for row in rows)
    memory_opportunities = sum(row["memory_metrics"][opportunities] for row in rows)
    if not baseline_opportunities or not memory_opportunities:
        return 0.0
    baseline_rate = _rate(sum(row["baseline_metrics"][successes] for row in rows), baseline_opportunities)
    memory_rate = _rate(sum(row["memory_metrics"][successes] for row in rows), memory_opportunities)
    return round(memory_rate - baseline_rate, 6)


def _p95(values: Sequence[int]) -> float:
    ordered = sorted(values)
    return float(ordered[max(0, math.ceil(len(ordered) * 0.95) - 1)]) if ordered else 0.0


def build_report(
    preregistration: Mapping[str, Any], observations: Sequence[Mapping[str, Any]], *,
    adjudicator_private_key: bytes | None = None, adjudicator_key_id: str | None = None,
    adjudicator_id: str | None = None, attested_at: str | None = None,
) -> dict[str, Any]:
    prereg = verify_preregistration(preregistration)
    if not observations or len(observations) > 100_000:
        raise ShadowEvaluationError("shadow evaluation observation count is invalid")
    rows = [verify_observation(row, prereg) for row in observations]
    if len({row["pair_id"] for row in rows}) != len(rows):
        raise ShadowEvaluationError("shadow evaluation contains duplicate pair IDs")
    completed = [_instant(row["completed_at"], "completed_at")[1] for row in rows]
    providers = sorted({f"{row['provider']}/{row['model']}" for row in rows})
    baseline_serious = sum(row["baseline_metrics"]["serious_errors"] for row in rows)
    memory_serious = sum(row["memory_metrics"]["serious_errors"] for row in rows)
    claims = sum(row["memory_metrics"]["material_memory_claims"] for row in rows)
    supported = sum(row["memory_metrics"]["claims_with_exact_evidence_or_inference"] for row in rows)
    mandatory = sum(row["memory_metrics"]["mandatory_prior_checks"] for row in rows)
    rechecked = sum(row["memory_metrics"]["mandatory_prior_rechecked"] for row in rows)
    quality = {
        "baseline_serious_errors": baseline_serious, "memory_serious_errors": memory_serious,
        "material_memory_claims": claims, "covered_material_memory_claims": supported,
        "evidence_coverage": _rate(supported, claims),
        "qualifier_loss_count": sum(row["memory_metrics"]["qualifier_losses"] for row in rows),
        "protected_leak_count": sum(row["memory_metrics"]["protected_content_leaks"] for row in rows),
        "temporal_leak_count": sum(row["memory_metrics"]["temporal_leaks"] for row in rows),
        "mandatory_recheck_rate": _rate(rechecked, mandatory),
        "contradiction_improvement": _improvement(rows, "contradiction_opportunities", "contradictions_surfaced"),
        "prior_defense_improvement": _improvement(rows, "prior_defense_opportunities", "prior_defenses_completed"),
        "abstention_improvement": _improvement(rows, "abstention_opportunities", "correct_abstentions"),
        "context_compilation_p95_millis": _p95([row["context_compilation_millis"] for row in rows]),
        "median_cost_overhead": round(statistics.median([
            (row["memory_cost_microusd"] - row["baseline_cost_microusd"]) / row["baseline_cost_microusd"]
            for row in rows
        ]), 6),
    }
    parity_groups: dict[str, list[Mapping[str, Any]]] = {}
    for row in rows:
        if row["provider_parity_group"] is not None:
            parity_groups.setdefault(row["provider_parity_group"], []).append(row)
    mismatches = 0
    complete_groups = 0
    parity_provider_models: set[str] = set()
    for group in parity_groups.values():
        group_providers = {row["provider"] for row in group}
        if group_providers != {"claude", "codex"} or len(group) != 2:
            mismatches += 1
            continue
        equivalent = True
        for field in (
            "prompt_program_sha256", "source_pool_sha256", "snapshot_sha256",
            "access_scope_sha256", "packet_data_sha256", "module", "task_id",
        ):
            if len({row[field] for row in group}) != 1:
                mismatches += 1
                equivalent = False
                break
        if equivalent:
            complete_groups += 1
            parity_provider_models.update(f"{row['provider']}/{row['model']}" for row in group)
    provider_regressions = []
    for provider_model in providers:
        subset = [row for row in rows if f"{row['provider']}/{row['model']}" == provider_model]
        if sum(row["memory_metrics"]["serious_errors"] for row in subset) > sum(row["baseline_metrics"]["serious_errors"] for row in subset):
            provider_regressions.append(provider_model)
    if not parity_groups:
        parity_status = "unmeasured"
    else:
        parity_status = "met" if (
            complete_groups >= TARGET["minimum_provider_parity_groups"] and mismatches == 0
            and not provider_regressions and {row["provider"] for row in rows}.issuperset({"claude", "codex"})
        ) else "failed"
    approved_provider_models = sorted(parity_provider_models.difference(provider_regressions))
    provider_parity = {
        "status": parity_status, "providers": providers, "packet_mismatch_count": mismatches,
        "provider_serious_regressions": provider_regressions,
    }
    runs = {row["run_id"] for row in rows}
    issuers = {row["issuer_key"] for row in rows}
    prior_issuers = {row["issuer_key"] for row in rows if row["issuer_has_prior_review"]}
    covered_agents = sorted({row["agent_id"] for row in rows})
    missing_agents = sorted(set(prereg["required_agent_keys"]).difference(covered_agents))
    blockers: list[str] = []
    if len(rows) < TARGET["minimum_paired_tasks"]: blockers.append("paired-task-sample")
    if len(runs) < TARGET["minimum_runs"]: blockers.append("live-run-sample")
    if len(prior_issuers) < TARGET["minimum_prior_review_issuers"]: blockers.append("prior-review-issuer-sample")
    if missing_agents: blockers.append("analytical-agent-coverage")
    if memory_serious > baseline_serious: blockers.append("serious-error-regression")
    if quality["evidence_coverage"] < TARGET["minimum_evidence_coverage"]: blockers.append("memory-claim-evidence")
    if quality["qualifier_loss_count"]: blockers.append("qualifier-loss")
    if quality["protected_leak_count"]: blockers.append("protected-content-leak")
    if quality["temporal_leak_count"]: blockers.append("temporal-leak")
    if quality["mandatory_recheck_rate"] < TARGET["minimum_mandatory_recheck_rate"]: blockers.append("mandatory-prior-recheck")
    if max(quality["contradiction_improvement"], quality["prior_defense_improvement"], quality["abstention_improvement"]) < TARGET["minimum_quality_improvement"]:
        blockers.append("quality-improvement")
    if quality["context_compilation_p95_millis"] >= TARGET["maximum_context_compilation_p95_millis"]: blockers.append("context-compilation-slo")
    if quality["median_cost_overhead"] > TARGET["maximum_median_cost_overhead"]: blockers.append("steady-state-cost")
    if parity_status != "met": blockers.append("provider-parity")
    blockers.sort()
    quality_passed = not blockers
    body: dict[str, Any] = {
        "schema": REPORT_SCHEMA, "evaluation_id": prereg["evaluation_id"],
        "evaluation_mode": prereg["evaluation_mode"],
        "preregistration_sha256": prereg["preregistration_sha256"],
        "roster_sha256": prereg["roster_sha256"],
        "window": {
            "start": min(completed).isoformat(timespec="microseconds").replace("+00:00", "Z"),
            "end": max(completed).isoformat(timespec="microseconds").replace("+00:00", "Z"),
        },
        "sample": {
            "paired_tasks": len(rows), "runs": len(runs), "issuers": len(issuers),
            "issuers_with_prior_reviews": len(prior_issuers), "provider_parity_groups": complete_groups,
            "required_agents": len(prereg["required_agent_keys"]),
            "covered_required_agents": len(set(prereg["required_agent_keys"]).intersection(covered_agents)),
            "missing_agent_keys": missing_agents,
        },
        "quality": quality, "provider_parity": provider_parity,
        "gate": {
            "quality_passed": quality_passed,
            "counts_as_production_evidence": quality_passed and prereg["evaluation_mode"] == "production-shadow",
            "approved_provider_models": approved_provider_models if quality_passed else [],
            "blocking_reasons": blockers,
        },
    }
    if prereg["evaluation_mode"] == "production-shadow":
        if None in (adjudicator_private_key, adjudicator_key_id, adjudicator_id, attested_at):
            raise ShadowEvaluationError("production shadow requires a trusted adjudicator attestation")
        if adjudicator_id in prereg["required_agent_keys"]:
            raise ShadowEvaluationError("production adjudicator cannot be an evaluated analytical agent")
        if any(row["adjudicator_id"] != adjudicator_id for row in rows):
            raise ShadowEvaluationError("shadow observations do not bind the trusted adjudicator identity")
        adjudication_attestation = _adjudication_attestation(
            body, private_key=adjudicator_private_key, key_id=str(adjudicator_key_id),
            adjudicator_id=str(adjudicator_id), attested_at=str(attested_at),
        )
    else:
        adjudication_attestation = None
    report = {**body, "adjudication_attestation": adjudication_attestation}
    report["report_sha256"] = "sha256:" + canonical_sha256(report)
    return report


def _load(path: str | Path) -> dict[str, Any]:
    try:
        value = json.loads(_safe_regular(Path(path)))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ShadowEvaluationError("shadow evaluation input is unreadable") from exc
    if not isinstance(value, dict):
        raise ShadowEvaluationError("shadow evaluation input must be an object")
    return value


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="memory-shadow-evaluation", description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    prereg = sub.add_parser("preregister")
    prereg.add_argument("--evaluation-id", required=True); prereg.add_argument("--mode", choices=sorted(MODES), required=True)
    prereg.add_argument("--registered-at", required=True); prereg.add_argument("--provider-model", action="append", required=True)
    prereg.add_argument("--root", default=str(Path(__file__).resolve().parents[1]))
    prereg.add_argument("--output")
    record = sub.add_parser("record")
    record.add_argument("--preregistration", required=True); record.add_argument("--input", required=True)
    record.add_argument("--output", required=True)
    evaluate = sub.add_parser("evaluate")
    evaluate.add_argument("--preregistration", required=True); evaluate.add_argument("--observation", action="append", required=True)
    evaluate.add_argument("--adjudicator-private-key"); evaluate.add_argument("--adjudicator-key-id")
    evaluate.add_argument("--adjudicator-id"); evaluate.add_argument("--attested-at")
    evaluate.add_argument("--output")
    args = parser.parse_args(argv)
    try:
        if args.command == "preregister":
            result = seal_preregistration(
                evaluation_id=args.evaluation_id, evaluation_mode=args.mode,
                registered_at=args.registered_at, provider_models=args.provider_model,
                required_agent_keys=analytical_agent_keys(args.root),
            )
        elif args.command == "record":
            preregistration = verify_preregistration(_load(args.preregistration))
            draft = _load(args.input)
            if set(draft) != OBSERVATION_FIELDS - {"observation_sha256"}:
                raise ShadowEvaluationError("shadow observation draft has an invalid closed shape")
            result = verify_observation(seal_observation(draft), preregistration)
        else:
            result = build_report(
                _load(args.preregistration), [_load(path) for path in args.observation],
                adjudicator_private_key=(
                    load_master_key_file(Path(args.adjudicator_private_key))
                    if args.adjudicator_private_key else None
                ),
                adjudicator_key_id=args.adjudicator_key_id,
                adjudicator_id=args.adjudicator_id, attested_at=args.attested_at,
            )
    except (ShadowEvaluationError, OSError, ValueError) as exc:
        print(json.dumps({"schema": "memory-shadow-evaluation-result/v1", "ok": False, "code": str(exc)}, sort_keys=True))
        return 4
    if getattr(args, "output", None):
        _atomic_private_write(Path(args.output), result)
        sys.stdout.write(json.dumps({
            "schema": "memory-shadow-evaluation-result/v1", "ok": True,
            "path": str(Path(args.output)),
        }, sort_keys=True, separators=(",", ":")) + "\n")
    else:
        sys.stdout.write(json.dumps(result, sort_keys=True, separators=(",", ":")) + "\n")
    return 0 if args.command != "evaluate" or result["gate"]["quality_passed"] else 2


if __name__ == "__main__":
    raise SystemExit(main())


__all__ = [
    "ShadowEvaluationError", "TARGET", "build_report", "seal_observation",
    "seal_preregistration", "verify_observation", "verify_preregistration",
    "analytical_agent_keys", "analytical_roster_sha256", "verify_adjudication_attestation",
]
