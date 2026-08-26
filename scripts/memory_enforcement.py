#!/usr/bin/env python3
"""Create and verify the signed evidence gate required for enforced research memory."""
from __future__ import annotations

import argparse
import base64
import datetime as dt
import hashlib
import json
import re
import sys
import uuid
from pathlib import Path
from typing import Any, Mapping, Sequence

try:
    from canonical_json import canonical_json_bytes, canonical_sha256
    from memory_crypto import ed25519_sign, ed25519_verify, load_master_key_file
    from memory_operations import verify_operational_readiness_report
    from memory_shadow_evaluation import analytical_roster_sha256, verify_adjudication_attestation
    from memory_three_layer_benchmark import verify_runtime_attestation
    from memory_runtime import _atomic_private_write, _safe_regular
except ImportError:  # pragma: no cover
    from scripts.canonical_json import canonical_json_bytes, canonical_sha256
    from scripts.memory_crypto import ed25519_sign, ed25519_verify, load_master_key_file
    from scripts.memory_operations import verify_operational_readiness_report
    from scripts.memory_shadow_evaluation import analytical_roster_sha256, verify_adjudication_attestation
    from scripts.memory_three_layer_benchmark import verify_runtime_attestation
    from scripts.memory_runtime import _atomic_private_write, _safe_regular


SCHEMA = "memory-enforcement-activation/v1"
DOMAIN = b"memory-enforcement-activation/v1\0"
FIELDS = {
    "schema", "activation_id", "status", "created_at", "expires_at", "evidence",
    "approved_provider_models", "activation_sha256", "signature",
}
EVIDENCE_FIELDS = {
    "operational_readiness_sha256", "three_layer_benchmark_sha256", "shadow_evaluation_sha256",
}
MAX_LIFETIME = dt.timedelta(days=30)
MAX_READINESS_AGE = dt.timedelta(days=1)
MAX_SHADOW_AGE = dt.timedelta(days=30)
ACTIVATION_ID = re.compile(r"memory-enforcement-[A-Za-z0-9._-]{1,96}")


class EnforcementError(ValueError):
    """Enforced mode lacks valid, current, independently signed release evidence."""


def _load(path: str | Path) -> dict[str, Any]:
    try:
        value = json.loads(_safe_regular(Path(path)))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise EnforcementError("enforcement evidence is unreadable") from exc
    if not isinstance(value, dict):
        raise EnforcementError("enforcement evidence must be an object")
    return value


def _instant(value: Any, label: str) -> tuple[str, dt.datetime]:
    if not isinstance(value, str):
        raise EnforcementError(f"{label} must be an aware timestamp")
    try:
        moment = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise EnforcementError(f"{label} must be an aware timestamp") from exc
    if moment.tzinfo is None:
        raise EnforcementError(f"{label} must be timezone-aware")
    moment = moment.astimezone(dt.timezone.utc)
    return moment.isoformat(timespec="microseconds").replace("+00:00", "Z"), moment


def _verify_report_hash(report: Mapping[str, Any], field: str, label: str) -> str:
    supplied = report.get(field)
    if not isinstance(supplied, str) or supplied != "sha256:" + canonical_sha256({key: value for key, value in report.items() if key != field}):
        raise EnforcementError(f"{label} hash does not match")
    return supplied


def _mapping(value: Any) -> Mapping[str, Any]:
    """Return an untrusted nested object only when it is safe to inspect."""

    return value if isinstance(value, Mapping) else {}


def _shadow_window_end(shadow: Mapping[str, Any]) -> Any:
    return _mapping(shadow.get("window")).get("end")


def _release_evidence(
    readiness: Mapping[str, Any], three_layer: Mapping[str, Any], shadow: Mapping[str, Any],
    *, benchmark_public_key: bytes, benchmark_key_id: str,
    adjudicator_public_key: bytes, adjudicator_key_id: str,
) -> tuple[dict[str, str], list[str]]:
    verify_operational_readiness_report(readiness)
    production_benchmark = _mapping(_mapping(readiness.get("adoption")).get("production_benchmark"))
    if readiness.get("status") != "met" or production_benchmark.get("status") != "met":
        raise EnforcementError("operational readiness and the exact Phase 0 production benchmark must be met")
    if (
        three_layer.get("schema") != "memory-three-layer-benchmark-report/v1"
        or three_layer.get("evaluation_mode") != "runtime-held-out"
        or three_layer.get("case_count") != 40
        or three_layer.get("gate") != {
            "passed": True, "counts_as_production_evidence": True, "blocking_case_ids": [],
        }
    ):
        raise EnforcementError("the runtime-held-out 40-case gate is not met")
    three_hash = _verify_report_hash(three_layer, "report_sha256", "three-layer report")
    if not verify_runtime_attestation(
        three_layer, public_key=benchmark_public_key, key_id=benchmark_key_id,
    ):
        raise EnforcementError("the runtime-held-out report lacks a trusted runner attestation")
    gate = shadow.get("gate")
    provider_parity = _mapping(shadow.get("provider_parity"))
    sample = _mapping(shadow.get("sample"))
    if (
        shadow.get("schema") != "memory-shadow-evaluation-report/v1"
        or shadow.get("evaluation_mode") != "production-shadow"
        or not isinstance(gate, Mapping) or gate.get("quality_passed") is not True
        or gate.get("counts_as_production_evidence") is not True
        or gate.get("blocking_reasons") != []
        or provider_parity.get("status") != "met"
        or sample.get("missing_agent_keys") != []
        or sample.get("required_agents") != sample.get("covered_required_agents")
        or shadow.get("roster_sha256") != analytical_roster_sha256(Path(__file__).resolve().parents[1])
    ):
        raise EnforcementError("the production shadow and provider-parity gate is not met")
    shadow_hash = _verify_report_hash(shadow, "report_sha256", "shadow report")
    if not verify_adjudication_attestation(
        shadow, public_key=adjudicator_public_key, key_id=adjudicator_key_id,
    ):
        raise EnforcementError("the production shadow report lacks a trusted adjudicator attestation")
    providers = gate.get("approved_provider_models")
    if (
        not isinstance(providers, list) or not providers
        or any(not isinstance(item, str) for item in providers)
        or providers != sorted(set(providers))
    ):
        raise EnforcementError("shadow report has no closed approved provider/model set")
    if not any(item.startswith("codex/") for item in providers) or not any(item.startswith("claude/") for item in providers):
        raise EnforcementError("shadow evidence must cover both Claude and Codex")
    return {
        "operational_readiness_sha256": readiness["report_sha256"],
        "three_layer_benchmark_sha256": three_hash,
        "shadow_evaluation_sha256": shadow_hash,
    }, list(providers)


def _verify_evidence_freshness(
    readiness: Mapping[str, Any], shadow: Mapping[str, Any], reference: dt.datetime,
) -> None:
    _, readiness_at = _instant(readiness.get("evaluated_at"), "readiness.evaluated_at")
    _, shadow_end = _instant(_shadow_window_end(shadow), "shadow.window.end")
    if readiness_at > reference or shadow_end > reference:
        raise EnforcementError("release evidence cannot postdate activation")
    if reference - readiness_at > MAX_READINESS_AGE:
        raise EnforcementError("operational readiness evidence is stale")
    if reference - shadow_end > MAX_SHADOW_AGE:
        raise EnforcementError("production shadow evidence is stale")


def _message(unsigned: Mapping[str, Any], activation_sha256: str) -> bytes:
    return DOMAIN + canonical_json_bytes({**unsigned, "activation_sha256": activation_sha256})


def create_activation(
    *, readiness: Mapping[str, Any], three_layer: Mapping[str, Any], shadow: Mapping[str, Any],
    created_at: str, expires_at: str, private_key: bytes, key_id: str,
    benchmark_public_key: bytes, benchmark_key_id: str,
    adjudicator_public_key: bytes, adjudicator_key_id: str,
    activation_id: str | None = None,
) -> dict[str, Any]:
    created_text, created = _instant(created_at, "created_at")
    expires_text, expires = _instant(expires_at, "expires_at")
    if expires <= created or expires - created > MAX_LIFETIME:
        raise EnforcementError("enforcement activation lifetime must be positive and at most 30 days")
    evidence, providers = _release_evidence(
        readiness, three_layer, shadow,
        benchmark_public_key=benchmark_public_key, benchmark_key_id=benchmark_key_id,
        adjudicator_public_key=adjudicator_public_key, adjudicator_key_id=adjudicator_key_id,
    )
    identity = activation_id or f"memory-enforcement-{uuid.uuid4()}"
    if not isinstance(identity, str) or ACTIVATION_ID.fullmatch(identity) is None:
        raise EnforcementError("activation identity is invalid")
    _verify_evidence_freshness(readiness, shadow, created)
    unsigned: dict[str, Any] = {
        "schema": SCHEMA, "activation_id": identity, "status": "active",
        "created_at": created_text, "expires_at": expires_text,
        "evidence": evidence, "approved_provider_models": providers,
    }
    activation_sha = "sha256:" + canonical_sha256(unsigned)
    message = _message(unsigned, activation_sha)
    raw = ed25519_sign(private_key, message)
    return {
        **unsigned, "activation_sha256": activation_sha,
        "signature": {
            "key_id": key_id, "algorithm": "ed25519",
            "signed_sha256": "sha256:" + hashlib.sha256(message).hexdigest(),
            "value": base64.urlsafe_b64encode(raw).decode().rstrip("="),
        },
    }


def verify_activation(
    activation: Mapping[str, Any], *, readiness: Mapping[str, Any],
    three_layer: Mapping[str, Any], shadow: Mapping[str, Any], public_key: bytes,
    key_id: str, benchmark_public_key: bytes, benchmark_key_id: str,
    adjudicator_public_key: bytes, adjudicator_key_id: str,
    provider: str, model: str, now: str,
) -> dict[str, Any]:
    if not isinstance(activation, Mapping) or set(activation) != FIELDS or activation.get("schema") != SCHEMA:
        raise EnforcementError("enforcement activation has an invalid closed shape")
    evidence, providers = _release_evidence(
        readiness, three_layer, shadow,
        benchmark_public_key=benchmark_public_key, benchmark_key_id=benchmark_key_id,
        adjudicator_public_key=adjudicator_public_key, adjudicator_key_id=adjudicator_key_id,
    )
    if activation.get("status") != "active" or activation.get("evidence") != evidence or activation.get("approved_provider_models") != providers:
        raise EnforcementError("enforcement activation does not bind the current release evidence")
    if not isinstance(activation.get("evidence"), Mapping) or set(activation["evidence"]) != EVIDENCE_FIELDS:
        raise EnforcementError("enforcement activation evidence is invalid")
    created_text, created = _instant(activation.get("created_at"), "created_at")
    expires_text, expires = _instant(activation.get("expires_at"), "expires_at")
    _, current = _instant(now, "now")
    if created_text != activation["created_at"] or expires_text != activation["expires_at"] or expires <= created or expires - created > MAX_LIFETIME:
        raise EnforcementError("enforcement activation time window is invalid")
    if current < created or current >= expires:
        raise EnforcementError("enforcement activation is not currently valid")
    _verify_evidence_freshness(readiness, shadow, created)
    if f"{provider}/{model}" not in providers:
        raise EnforcementError("provider/model did not pass production shadow enforcement")
    unsigned = {key: value for key, value in activation.items() if key not in {"activation_sha256", "signature"}}
    activation_sha = "sha256:" + canonical_sha256(unsigned)
    if activation.get("activation_sha256") != activation_sha:
        raise EnforcementError("enforcement activation hash does not match")
    signature = activation.get("signature")
    if not isinstance(signature, Mapping) or set(signature) != {"key_id", "algorithm", "signed_sha256", "value"}:
        raise EnforcementError("enforcement activation signature is invalid")
    message = _message(unsigned, activation_sha)
    if (
        signature.get("key_id") != key_id or signature.get("algorithm") != "ed25519"
        or signature.get("signed_sha256") != "sha256:" + hashlib.sha256(message).hexdigest()
    ):
        raise EnforcementError("enforcement activation signature metadata is invalid")
    try:
        raw = base64.urlsafe_b64decode(str(signature.get("value")) + "==")
    except (ValueError, TypeError) as exc:
        raise EnforcementError("enforcement activation signature encoding is invalid") from exc
    if not ed25519_verify(public_key, message, raw):
        raise EnforcementError("enforcement activation signature verification failed")
    return {
        "schema": "memory-enforcement-verification/v1", "ok": True,
        "activation_id": activation["activation_id"], "activation_sha256": activation_sha,
        "provider_model": f"{provider}/{model}", "expires_at": activation["expires_at"],
    }


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="memory-enforcement", description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    activate = sub.add_parser("activate")
    verify = sub.add_parser("verify")
    for command in (activate, verify):
        command.add_argument("--readiness", required=True); command.add_argument("--three-layer", required=True)
        command.add_argument("--shadow", required=True); command.add_argument("--key-id", required=True)
        command.add_argument("--benchmark-public-key", required=True); command.add_argument("--benchmark-key-id", required=True)
        command.add_argument("--adjudicator-public-key", required=True); command.add_argument("--adjudicator-key-id", required=True)
    activate.add_argument("--private-key", required=True); activate.add_argument("--created-at", required=True)
    activate.add_argument("--expires-at", required=True); activate.add_argument("--activation-id")
    activate.add_argument("--output", required=True)
    verify.add_argument("--activation", required=True); verify.add_argument("--public-key", required=True)
    verify.add_argument("--provider", required=True); verify.add_argument("--model", required=True); verify.add_argument("--now", required=True)
    args = parser.parse_args(argv)
    try:
        readiness = _load(args.readiness); three_layer = _load(args.three_layer); shadow = _load(args.shadow)
        if args.command == "activate":
            result = create_activation(
                readiness=readiness, three_layer=three_layer, shadow=shadow,
                created_at=args.created_at, expires_at=args.expires_at,
                private_key=load_master_key_file(Path(args.private_key)), key_id=args.key_id,
                benchmark_public_key=load_master_key_file(Path(args.benchmark_public_key)),
                benchmark_key_id=args.benchmark_key_id,
                adjudicator_public_key=load_master_key_file(Path(args.adjudicator_public_key)),
                adjudicator_key_id=args.adjudicator_key_id,
                activation_id=args.activation_id,
            )
            _atomic_private_write(Path(args.output), result)
            output = {"schema": "memory-enforcement-result/v1", "ok": True, "activation_sha256": result["activation_sha256"]}
        else:
            output = verify_activation(
                _load(args.activation), readiness=readiness, three_layer=three_layer, shadow=shadow,
                public_key=load_master_key_file(Path(args.public_key)), key_id=args.key_id,
                benchmark_public_key=load_master_key_file(Path(args.benchmark_public_key)),
                benchmark_key_id=args.benchmark_key_id,
                adjudicator_public_key=load_master_key_file(Path(args.adjudicator_public_key)),
                adjudicator_key_id=args.adjudicator_key_id,
                provider=args.provider, model=args.model, now=args.now,
            )
    except (EnforcementError, OSError, ValueError) as exc:
        print(json.dumps({"schema": "memory-enforcement-result/v1", "ok": False, "code": str(exc)}, sort_keys=True))
        return 4
    print(json.dumps(output, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


__all__ = ["EnforcementError", "create_activation", "verify_activation"]
