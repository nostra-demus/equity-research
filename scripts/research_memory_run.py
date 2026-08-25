#!/usr/bin/env python3
"""Frozen run receipts, per-agent packets, use attestations, and episodes.

All durable files produced here are runtime derivatives under the policy-partitioned
state root.  Canonical promotion remains the controlled writer's responsibility.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import sqlite3
import time
import uuid
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping, Sequence

try:
    from canonical_json import canonical_json_bytes, canonical_sha256
    from memory_projection import verify_projection
    from memory_runtime import MemoryRuntimeError, ProjectionSnapshot, _atomic_private_write, _safe_regular
    from memory_crypto import ed25519_sign, ed25519_verify, load_master_key_file
    from memory_three_layer_contract import render_untrusted_packet, validate_contract
except ImportError:  # pragma: no cover
    from scripts.canonical_json import canonical_json_bytes, canonical_sha256
    from scripts.memory_projection import verify_projection
    from scripts.memory_runtime import MemoryRuntimeError, ProjectionSnapshot, _atomic_private_write, _safe_regular
    from scripts.memory_crypto import ed25519_sign, ed25519_verify, load_master_key_file
    from scripts.memory_three_layer_contract import render_untrusted_packet, validate_contract


RUN_RECEIPT_SCHEMA = "research-memory-run-receipt/v1"
PROVIDER_AUTHORIZATION_SCHEMA = "research-memory-provider-authorization/v1"
QUERY_SCHEMA = "memory-query-spec/v2"
PACKET_SCHEMA = "memory-context-packet/v2"
USE_SCHEMA = "memory-use/v1"
ATTESTATION_SCHEMA = "memory-use-attestation/v1"
TASK_EPISODE_SCHEMA = "memory-task-episode/v1"
RUN_EPISODE_SCHEMA = "memory-run-episode/v1"
MODES = frozenset({"off", "shadow", "enforced"})
ANALYTICAL_ROLES = frozenset({"specialist", "module-synthesizer", "master-synthesizer"})
_HASH_RE = re.compile(r"^sha256:[0-9a-f]{64}$")
_SAFE_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}$")
_BOUNDED_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$")
_AUTHORIZATION_ID = re.compile(
    r"^provider-authorization_[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-"
    r"[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)
_CLASSIFICATIONS = frozenset({"public", "internal", "licensed", "confidential", "restricted"})
_INJECTION = re.compile(
    r"(?i)(ignore\s+(?:all\s+)?(?:previous|prior|system)|system\s+prompt|"
    r"(?:run|execute)\s+(?:this\s+)?(?:shell|bash|command|tool)|<\/?(?:system|assistant|tool)|"
    r"rm\s+-rf|curl\s+[^\n]*\|\s*(?:sh|bash)|sudo\s+)",
)
_EPISODE_TYPES = frozenset({
    "decision.recorded", "outcome.reviewed", "correction.recorded",
    "memory.task-completed", "memory.run-completed",
})
_CALIBRATION_TYPE = "calibration.summary-recorded"
_LEGACY_FIELDS: dict[str, tuple[str, ...]] = {
    "equity_decision_record": (
        "ticker", "company_name", "exchange", "currency", "decision_date", "decision",
        "confidence_score", "data_sufficiency_score", "rating_cap", "thesis_type",
    ),
    "equity_decision_review": (
        "ticker", "original_decision_date", "review_date", "review_window", "original_decision",
        "thesis_status", "decision_quality", "error_taxonomy", "lessons",
    ),
    "equity_decision_correction": ("schema", "errata"),
    "equity_calibration_summary": (
        "schema_version", "generated_at", "scope", "n_decisions", "n_reviews",
        "n_resolved_forecasts", "calibration_by_module", "calibration_by_forecast_type",
        "calibration_by_thesis_type", "error_taxonomy_counts",
    ),
}


class ResearchMemoryError(MemoryRuntimeError):
    """A run/packet/use boundary cannot be proven safe."""


Signer = Callable[[bytes], Mapping[str, str]]
Verifier = Callable[[bytes, Mapping[str, str]], bool]


def ed25519_contract_signer(key_path: str | Path, *, key_id: str) -> Signer:
    if re.fullmatch(r"[a-z0-9][a-z0-9._-]{0,127}", key_id) is None:
        raise ResearchMemoryError("contract-signing-key-id-invalid")

    def sign(message: bytes) -> Mapping[str, str]:
        raw = ed25519_sign(load_master_key_file(key_path), message)
        return {
            "key_id": key_id,
            "algorithm": "ed25519",
            "signed_sha256": sha(message),
            "value": __import__("base64").urlsafe_b64encode(raw).decode("ascii").rstrip("="),
        }

    return sign


def ed25519_contract_verifier(public_key_path: str | Path, *, key_id: str) -> Verifier:
    if re.fullmatch(r"[a-z0-9][a-z0-9._-]{0,127}", key_id) is None:
        raise ResearchMemoryError("contract-signing-key-id-invalid")

    def verify(message: bytes, signature: Mapping[str, str]) -> bool:
        if signature.get("key_id") != key_id or signature.get("algorithm") != "ed25519":
            return False
        if signature.get("signed_sha256") != sha(message):
            return False
        try:
            encoded = signature.get("value")
            if not isinstance(encoded, str):
                return False
            raw = __import__("base64").b64decode(
                encoded + "=" * (-len(encoded) % 4), altchars=b"-_", validate=True,
            )
            public_key = _safe_regular(Path(public_key_path))
        except (OSError, ValueError, MemoryRuntimeError):
            return False
        return ed25519_verify(public_key, message, raw)

    return verify


def utc_now(now: dt.datetime | None = None) -> str:
    value = now or dt.datetime.now(dt.timezone.utc)
    if value.tzinfo is None:
        raise ResearchMemoryError("memory-clock-must-be-aware")
    return value.astimezone(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def memory_id(prefix: str, seed: str) -> str:
    if re.fullmatch(r"[a-z][a-z0-9-]*", prefix) is None:
        raise ResearchMemoryError("memory-id-prefix-invalid")
    return f"{prefix}_{uuid.uuid5(uuid.NAMESPACE_URL, seed)}"


def sha(value: Mapping[str, Any] | Sequence[Any] | bytes) -> str:
    raw = value if isinstance(value, bytes) else canonical_json_bytes(value)
    return "sha256:" + __import__("hashlib").sha256(raw).hexdigest()


def _without(value: Mapping[str, Any], *fields: str) -> dict[str, Any]:
    return {key: item for key, item in value.items() if key not in fields}


def _signed_contract(
    value: Mapping[str, Any], *, hash_field: str, signer: Signer, domain: bytes,
) -> dict[str, Any]:
    unsigned = _without(value, hash_field, "signature")
    digest = sha(unsigned)
    message = domain + b"\0" + canonical_json_bytes(unsigned)
    signature = dict(signer(message))
    if signature.get("signed_sha256") != sha(message):
        raise ResearchMemoryError("signer-returned-wrong-message-commitment")
    complete = {**unsigned, hash_field: digest, "signature": signature}
    errors = validate_contract(complete)
    if errors:
        raise ResearchMemoryError("invalid-signed-contract: " + "; ".join(errors[:12]))
    return complete


def _verify_signed_contract(
    value: Mapping[str, Any], *, hash_field: str, verifier: Verifier, domain: bytes,
) -> None:
    unsigned = _without(value, hash_field, "signature")
    if value.get(hash_field) != sha(unsigned):
        raise ResearchMemoryError(f"{hash_field}-invalid")
    signature = value.get("signature")
    message = domain + b"\0" + canonical_json_bytes(unsigned)
    if not isinstance(signature, Mapping) or signature.get("signed_sha256") != sha(message):
        raise ResearchMemoryError("signature-commitment-invalid")
    if verifier(message, signature) is not True:
        raise ResearchMemoryError("signature-invalid")
    errors = validate_contract(value)
    if errors:
        raise ResearchMemoryError("contract-invalid: " + "; ".join(errors[:12]))


def build_run_receipt(
    *, run_id: str, snapshot: ProjectionSnapshot, issuer_listing: Mapping[str, Any],
    provider_access: Mapping[str, Any], active_playbooks: Sequence[Mapping[str, Any]],
    snapshot_reason: str, parent_receipt_id: str | None, signer: Signer,
    now: dt.datetime | None = None,
) -> dict[str, Any]:
    created = utc_now(now)
    receipt_id = memory_id(
        "run-receipt",
        "|".join((run_id, snapshot.repository_sha, snapshot.projection_digest, created)),
    )
    body: dict[str, Any] = {
        "schema": RUN_RECEIPT_SCHEMA,
        "receipt_id": receipt_id,
        "run_id": run_id,
        "snapshot_reason": snapshot_reason,
        "parent_receipt_id": parent_receipt_id,
        "issuer_listing": dict(issuer_listing),
        "repository_sha": snapshot.repository_sha if snapshot.repository_sha.startswith("git:")
        else "git:" + snapshot.repository_sha,
        "projection_digest": snapshot.projection_digest,
        "policy_clock": created,
        "as_of_system_time": created,
        "provider_access": dict(provider_access),
        "active_playbooks": [dict(item) for item in active_playbooks],
        "snapshot_source": snapshot.source,
        "status": "verified-empty" if snapshot.event_count == 0 else "verified",
        "created_at": created,
    }
    return _signed_contract(
        body, hash_field="receipt_sha256", signer=signer,
        domain=b"research-memory-run-receipt/v1",
    )


def verify_run_receipt(value: Mapping[str, Any], *, verifier: Verifier) -> None:
    _verify_signed_contract(
        value, hash_field="receipt_sha256", verifier=verifier,
        domain=b"research-memory-run-receipt/v1",
    )


def store_run_receipt(state_root: str | Path, receipt: Mapping[str, Any]) -> Path:
    root = Path(state_root).resolve()
    path = root / "resumes" / str(receipt["run_id"]) / "run-receipt.json"
    _atomic_private_write(path, receipt)
    return path


def load_run_receipt(path: str | Path, *, verifier: Verifier) -> dict[str, Any]:
    try:
        value = json.loads(_safe_regular(Path(path)))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ResearchMemoryError("run-receipt-unreadable") from exc
    if not isinstance(value, dict):
        raise ResearchMemoryError("run-receipt-not-object")
    verify_run_receipt(value, verifier=verifier)
    return value


def build_provider_authorization(
    *, receipt: Mapping[str, Any], provider_access: Mapping[str, Any], signer: Signer,
    now: dt.datetime | None = None,
) -> dict[str, Any]:
    _verify_provider_access(provider_access)
    authorized_at = utc_now(now)
    body: dict[str, Any] = {
        "schema": PROVIDER_AUTHORIZATION_SCHEMA,
        "authorization_id": memory_id(
            "provider-authorization",
            f"{receipt['receipt_id']}|{sha(provider_access)}|{authorized_at}|{uuid.uuid4()}",
        ),
        "run_receipt_id": receipt["receipt_id"],
        "projection_digest": receipt["projection_digest"],
        "provider_access": dict(provider_access),
        "authorized_at": authorized_at,
    }
    unsigned = dict(body)
    digest = sha(unsigned)
    message = b"research-memory-provider-authorization/v1\0" + canonical_json_bytes(unsigned)
    signature = dict(signer(message))
    if signature.get("signed_sha256") != sha(message):
        raise ResearchMemoryError("signer-returned-wrong-message-commitment")
    return {**unsigned, "authorization_sha256": digest, "signature": signature}


def verify_provider_authorization(
    value: Mapping[str, Any], *, receipt: Mapping[str, Any], verifier: Verifier,
) -> None:
    required = {
        "schema", "authorization_id", "run_receipt_id", "projection_digest", "provider_access",
        "authorized_at", "authorization_sha256", "signature",
    }
    if set(value) != required or value.get("schema") != PROVIDER_AUTHORIZATION_SCHEMA:
        raise ResearchMemoryError("provider-authorization-open-or-invalid")
    if _AUTHORIZATION_ID.fullmatch(str(value.get("authorization_id"))) is None:
        raise ResearchMemoryError("provider-authorization-id-invalid")
    unsigned = _without(value, "authorization_sha256", "signature")
    if value.get("authorization_sha256") != sha(unsigned):
        raise ResearchMemoryError("provider-authorization-hash-invalid")
    if (
        value.get("run_receipt_id") != receipt.get("receipt_id")
        or value.get("projection_digest") != receipt.get("projection_digest")
    ):
        raise ResearchMemoryError("provider-authorization-snapshot-mismatch")
    access = value.get("provider_access")
    if not isinstance(access, Mapping) or set(access) != {
        "provider", "model", "service_identity", "classifications", "source_tiers",
        "entitlement_set_sha256", "embedding_classifications", "embedding_permitted",
    }:
        raise ResearchMemoryError("provider-authorization-access-invalid")
    _verify_provider_access(access)
    try:
        authorized_at = dt.datetime.fromisoformat(
            str(value.get("authorized_at")).replace("Z", "+00:00")
        )
    except ValueError as exc:
        raise ResearchMemoryError("provider-authorization-time-invalid") from exc
    if authorized_at.tzinfo is None or authorized_at.utcoffset() is None:
        raise ResearchMemoryError("provider-authorization-time-invalid")
    message = b"research-memory-provider-authorization/v1\0" + canonical_json_bytes(unsigned)
    signature = value.get("signature")
    if not isinstance(signature, Mapping) or signature.get("signed_sha256") != sha(message):
        raise ResearchMemoryError("provider-authorization-signature-commitment-invalid")
    if verifier(message, signature) is not True:
        raise ResearchMemoryError("provider-authorization-signature-invalid")


def store_provider_authorization(state_root: str | Path, run_id: str, value: Mapping[str, Any]) -> Path:
    if re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}", run_id) is None:
        raise ResearchMemoryError("provider-authorization-run-id-invalid")
    path = (
        Path(state_root).resolve() / "resumes" / run_id / "provider-authorizations"
        / f"{value['authorization_id']}.json"
    )
    _atomic_private_write(path, value)
    return path


def load_provider_authorization(
    path: str | Path, *, receipt: Mapping[str, Any], verifier: Verifier,
) -> dict[str, Any]:
    try:
        value = json.loads(_safe_regular(Path(path)))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ResearchMemoryError("provider-authorization-unreadable") from exc
    if not isinstance(value, dict):
        raise ResearchMemoryError("provider-authorization-not-object")
    verify_provider_authorization(value, receipt=receipt, verifier=verifier)
    return value


def _verify_provider_access(access: Mapping[str, Any]) -> None:
    provider = access.get("provider")
    model = access.get("model")
    service = access.get("service_identity")
    classifications = access.get("classifications")
    tiers = access.get("source_tiers")
    embedding = access.get("embedding_classifications")
    if (
        not isinstance(provider, str) or _BOUNDED_NAME.fullmatch(provider) is None
        or not isinstance(service, str) or _BOUNDED_NAME.fullmatch(service) is None
        or not isinstance(model, str) or not 1 <= len(model) <= 256
        or any(ord(character) < 32 or ord(character) == 127 for character in model)
        or not isinstance(classifications, list) or not 1 <= len(classifications) <= 5
        or any(not isinstance(item, str) for item in classifications)
        or len(set(classifications)) != len(classifications)
        or any(item not in _CLASSIFICATIONS for item in classifications)
        or not isinstance(tiers, list) or not 1 <= len(tiers) <= 10
        or any(isinstance(item, bool) or not isinstance(item, int) or not 1 <= item <= 10 for item in tiers)
        or len(set(tiers)) != len(tiers)
        or not isinstance(access.get("entitlement_set_sha256"), str)
        or _HASH_RE.fullmatch(access["entitlement_set_sha256"]) is None
        or not isinstance(embedding, list) or len(embedding) > 5
        or any(not isinstance(item, str) for item in embedding)
        or len(set(embedding)) != len(embedding)
        or any(item not in _CLASSIFICATIONS for item in embedding)
        or not set(embedding).issubset(set(classifications))
        or not isinstance(access.get("embedding_permitted"), bool)
    ):
        raise ResearchMemoryError("provider-authorization-access-invalid")


def build_query(
    *, profile: Mapping[str, Any], agent_id: str, role: str,
    receipt: Mapping[str, Any], valid_date: str,
) -> dict[str, Any]:
    if role not in ANALYTICAL_ROLES:
        raise ResearchMemoryError("memory-query-role-invalid")
    budget = int(profile["max_context_tokens"])
    episodic = budget * 40 // 100
    semantic = budget * 35 // 100
    procedural = budget - episodic - semantic
    listing = receipt["issuer_listing"]
    trusted = receipt["provider_access"]
    trusted_classes = set(trusted["classifications"])
    trusted_tiers = set(trusted["source_tiers"])
    requested_classes = [
        item for item in profile["permitted_classifications"] if item in trusted_classes
    ]
    requested_tiers = [
        item for item in profile["permitted_source_tiers"] if item in trusted_tiers
    ]
    if not requested_classes or not requested_tiers:
        raise ResearchMemoryError("memory-query-has-no-authorized-scope")
    query = {
        "schema": QUERY_SCHEMA,
        "task": profile["task"],
        "requesting_agent": agent_id,
        "requesting_role": role,
        "layers": ["episodic", "semantic", "procedural"],
        "subject_ids": [listing["issuer_id"], listing["listing_id"]],
        "semantic_topics": list(profile["semantic_topics"]),
        "procedure_tags": list(profile["procedure_tags"]),
        "cross_company": bool(profile["cross_company"]),
        "as_of_system_time": receipt["as_of_system_time"],
        "valid_time": {"from": valid_date, "to": valid_date},
        "trusted_access_scope": dict(trusted),
        "requested_classifications": requested_classes,
        "requested_source_tiers": requested_tiers,
        "max_context_tokens": budget,
        "per_layer_budgets": {
            "episodic": episodic, "semantic": semantic, "procedural": procedural,
        },
        "mandatory_item_policy": "fail-before-dispatch",
    }
    errors = validate_contract(query)
    if errors:
        raise ResearchMemoryError("memory-query-invalid: " + "; ".join(errors[:12]))
    return query


def _projection_events(database: Path, expected_digest: str) -> list[dict[str, Any]]:
    bare = expected_digest.removeprefix("sha256:")
    verify_projection(database, expected_digest=bare)
    uri = f"file:{database.as_posix()}?mode=ro&immutable=1"
    connection = sqlite3.connect(uri, uri=True)
    try:
        rows = connection.execute(
            "SELECT canonical_event FROM events ORDER BY system_time DESC,event_id"
        ).fetchall()
    finally:
        connection.close()
    events = []
    for (raw,) in rows:
        value = json.loads(raw)
        if isinstance(value, dict):
            events.append(value)
    return events


def _legacy_record(event: Mapping[str, Any]) -> tuple[str | None, Mapping[str, Any]]:
    payload = event.get("payload")
    if not isinstance(payload, Mapping):
        return None, {}
    record = payload.get("record")
    return str(payload.get("record_type")) if isinstance(record, Mapping) else None, record if isinstance(record, Mapping) else {}


def _event_run_root(event: Mapping[str, Any]) -> str | None:
    payload = event.get("payload")
    source = str(payload.get("source_path", "")) if isinstance(payload, Mapping) else ""
    parts = source.split("/")
    return "/".join(parts[:2]) if len(parts) >= 3 and parts[0] == "analyses" else None


def _exact_listing_event(
    event: Mapping[str, Any], listing: Mapping[str, Any], *, exact_run_roots: set[str] | None = None,
) -> bool:
    if set(event.get("subject_ids", [])).intersection({listing["issuer_id"], listing["listing_id"]}):
        return True
    kind, record = _legacy_record(event)
    if kind not in {"equity_decision_record", "equity_decision_review", "equity_decision_correction"}:
        return False
    ticker = record.get("ticker")
    if kind == "equity_decision_correction" and ticker is None:
        source = str(event.get("payload", {}).get("source_path", ""))
        ticker = source.split("/")[1].split("_")[0] if source.startswith("analyses/") else None
    if ticker != listing["ticker"]:
        return False
    if kind == "equity_decision_record":
        return (
            record.get("company_name") == listing["legal_name"]
            and record.get("currency") == listing["currency"]
            and str(record.get("exchange")) in {listing["mic"], _venue_for_mic(str(listing["mic"]))}
        )
    return exact_run_roots is not None and _event_run_root(event) in exact_run_roots


def _venue_for_mic(mic: str) -> str:
    try:
        from memory_runtime import EXCHANGE_MICS
    except ImportError:  # pragma: no cover
        from scripts.memory_runtime import EXCHANGE_MICS
    return next((venue for venue, value in EXCHANGE_MICS.items() if value == mic), mic)


def _safe_value(value: Any, *, depth: int = 0) -> Any:
    if depth > 5:
        return "[depth-limited]"
    if isinstance(value, str):
        if _INJECTION.search(value):
            return "[instruction-like historical text withheld]"
        return value[:4000]
    if value is None or isinstance(value, (bool, int, float)):
        return value
    if isinstance(value, list):
        return [_safe_value(item, depth=depth + 1) for item in value[:32]]
    if isinstance(value, Mapping):
        return {
            str(key): _safe_value(item, depth=depth + 1)
            for key, item in sorted(value.items(), key=lambda pair: str(pair[0]))[:64]
            if str(key) not in {"command", "commands", "instructions", "tool", "tools", "rerun_command"}
        }
    return str(value)[:1000]


def _curated_event_data(event: Mapping[str, Any]) -> dict[str, Any] | None:
    kind, record = _legacy_record(event)
    if kind in _LEGACY_FIELDS:
        selected = {field: _safe_value(record[field]) for field in _LEGACY_FIELDS[kind] if field in record}
        return {
            "historical_record_type": kind,
            "system_time": event.get("system_time"),
            "valid_time": event.get("valid_time"),
            "source_path": event.get("payload", {}).get("source_path"),
            "source_sha256": event.get("payload", {}).get("source_sha256"),
            "historical_data": selected,
            "current_evidence_required": True,
        }
    payload = event.get("payload")
    if isinstance(payload, Mapping) and payload.get("schema") in {
        TASK_EPISODE_SCHEMA, RUN_EPISODE_SCHEMA, "memory-semantic-lesson/v1", "memory-playbook/v1",
    }:
        return _safe_value(payload)
    return None


def _record_ref(event: Mapping[str, Any]) -> dict[str, str]:
    payload = event.get("payload")
    schema = payload.get("schema") if isinstance(payload, Mapping) else "legacy-adapter/v1"
    if not isinstance(schema, str) or re.fullmatch(r"[a-z][a-z0-9-]*/v[0-9]+", schema) is None:
        schema = "legacy-adapter/v1"
    return {
        "record_id": str(event.get("event_id")),
        "schema": schema,
        "content_sha256": str(event.get("_content_sha256"))
        if _HASH_RE.fullmatch(str(event.get("_content_sha256"))) else sha(event),
    }


def _packet_entry(
    event: Mapping[str, Any], *, layer: str, mandatory: bool, rank: int,
) -> dict[str, Any] | None:
    data = _curated_event_data(event)
    if data is None:
        return None
    policy = event.get("policy") if isinstance(event.get("policy"), Mapping) else {}
    classification = str(policy.get("classification", "internal"))
    if classification not in {"public", "internal", "licensed", "confidential", "restricted"}:
        classification = "internal"
    return {
        "layer": layer,
        "record": _record_ref(event),
        "classification": classification,
        # Legacy run records are internal observations, never current evidence. Tier 5 is the
        # permitted internal-data band; the data block explicitly requires a current source check.
        "source_tiers": [5],
        "mandatory": mandatory,
        "rank": rank,
        "valid_time": dict(event.get("valid_time") or {"from": "1970-01-01", "to": None}),
        "evidence_refs": list(event.get("evidence_refs") or []),
        "data": json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=False),
    }


def _is_mandatory_episode(event: Mapping[str, Any]) -> bool:
    if event.get("event_type") == "correction.recorded":
        return True
    if event.get("event_type") != "outcome.reviewed":
        return False
    _kind, record = _legacy_record(event)
    errors = record.get("error_taxonomy", [])
    forecasts = record.get("forecast_results", [])
    return bool(errors) or any(
        isinstance(item, Mapping) and item.get("status") == "falsified" for item in forecasts
    )


_MIC_JURISDICTION = {
    "XNAS": "US", "XNYS": "US", "ARCX": "US", "XNSE": "IN", "XBOM": "IN",
    "XLON": "GB", "XETR": "DE", "XPAR": "FR", "XAMS": "NL", "XOSL": "NO",
    "XDFM": "AE", "XADS": "AE", "XJPX": "JP", "XTSE": "CA", "XHKG": "HK",
    "XASX": "AU",
}


def _active_semantic_match(
    event: Mapping[str, Any], *, query: Mapping[str, Any], profile: Mapping[str, Any],
    agent_id: str, listing: Mapping[str, Any],
) -> tuple[bool, bool]:
    """Return (applicable, mandatory) for one canonical active lesson."""

    payload = event.get("payload")
    if not isinstance(payload, Mapping) or payload.get("schema") != "memory-semantic-lesson/v1":
        return False, False
    if payload.get("status") != "active":
        return False, False
    try:
        if _time_sort(event.get("system_time")) > _time_sort(query.get("as_of_system_time")):
            return False, False
        valid_date = dt.date.fromisoformat(str(query["valid_time"]["from"])[:10])
        valid_from = dt.date.fromisoformat(str(payload["semantic"]["valid_time"]["from"])[:10])
        valid_to_raw = payload["semantic"]["valid_time"].get("to")
        valid_to = (
            dt.date.fromisoformat(str(valid_to_raw)[:10]) if valid_to_raw is not None else None
        )
        if valid_date < valid_from or (valid_to is not None and valid_date > valid_to):
            return False, False
        if dt.date.fromisoformat(str(payload["semantic"]["review_due"])) < valid_date:
            return False, False
        retain_until = payload["policy"].get("retain_until")
        if retain_until is not None and _time_sort(retain_until) <= _time_sort(
            query.get("as_of_system_time")
        ):
            return False, False
    except (KeyError, TypeError, ValueError):
        return False, False
    semantic = payload["semantic"]
    applicability = semantic.get("applicability")
    if not isinstance(applicability, Mapping):
        return False, False
    module = agent_id.split("/", 1)[0]
    leaf = agent_id.rsplit("/", 1)[-1]
    agent_names = {agent_id, leaf, leaf.replace("_", "-")}
    if applicability.get("agents") and not agent_names.intersection(applicability["agents"]):
        return False, False
    if applicability.get("modules") and module not in applicability["modules"]:
        return False, False
    subjects = {listing["issuer_id"], listing["listing_id"]}
    if applicability.get("issuer_ids") and not subjects.intersection(applicability["issuer_ids"]):
        return False, False
    if applicability.get("listing_ids") and listing["listing_id"] not in applicability["listing_ids"]:
        return False, False
    tags = {
        str(item).casefold()
        for item in (
            list(profile.get("semantic_topics", []))
            + list(profile.get("procedure_tags", []))
            + str(profile.get("task", "")).replace(".", "-").split("-")
        )
    }
    jurisdiction = _MIC_JURISDICTION.get(str(listing.get("mic")))
    if jurisdiction:
        tags.add(jurisdiction.casefold())
    for field in (
        "sectors", "jurisdictions", "accounting_standards", "metrics", "source_types",
    ):
        constraints = applicability.get(field, [])
        if constraints and not tags.intersection(str(item).casefold() for item in constraints):
            return False, False
    exact = semantic.get("lesson_kind") == "exact-issuer"
    mandatory = exact and semantic.get("effect") in {
        "current-check-required", "reviewed-negative-policy",
    }
    return True, mandatory


def compile_agent_packet(
    database_path: str | Path, *, receipt: Mapping[str, Any], profile: Mapping[str, Any],
    agent_id: str, role: str, valid_date: str,
    active_semantics: Sequence[Mapping[str, Any]] = (),
    active_playbooks: Sequence[Mapping[str, Any]] = (),
) -> tuple[dict[str, Any], dict[str, Any], str]:
    started = time.monotonic_ns()
    if active_semantics or active_playbooks:
        raise ResearchMemoryError("external-active-memory-bypasses-frozen-projection")
    query = build_query(
        profile=profile, agent_id=agent_id, role=role, receipt=receipt, valid_date=valid_date,
    )
    events = _projection_events(Path(database_path).resolve(), receipt["projection_digest"])
    listing = receipt["issuer_listing"]
    exact_run_roots = {
        run_root for event in events
        if _legacy_record(event)[0] == "equity_decision_record"
        and _exact_listing_event(event, listing)
        and (run_root := _event_run_root(event)) is not None
    }
    candidates: list[tuple[int, str, bool, Mapping[str, Any]]] = []
    superseded_semantics = {
        target
        for successor in events
        if successor.get("event_type") == "semantic.activated"
        for target in successor.get("supersedes", [])
        if isinstance(target, str)
    }
    for event in events:
        event_type = event.get("event_type")
        if event_type in _EPISODE_TYPES and _exact_listing_event(
            event, listing, exact_run_roots=exact_run_roots,
        ):
            mandatory = _is_mandatory_episode(event)
            priority = 1 if mandatory else 3
            candidates.append((priority, "episodic", mandatory, event))
        elif event_type == _CALIBRATION_TYPE and profile.get("cross_company") is True:
            candidates.append((5, "semantic", False, event))
        elif event_type == "semantic.activated" and event.get("event_id") not in superseded_semantics:
            applicable, mandatory = _active_semantic_match(
                event, query=query, profile=profile, agent_id=agent_id, listing=listing,
            )
            if applicable:
                candidates.append((1 if mandatory else 4, "semantic", mandatory, event))
    candidates.sort(key=lambda item: (
        item[0], -_time_sort(item[3].get("system_time")), str(item[3].get("event_id")),
    ))
    layer_names = {"episodic": "episodes", "semantic": "semantics", "procedural": "procedures"}
    entries: dict[str, list[dict[str, Any]]] = {name: [] for name in layer_names}
    omissions: list[dict[str, Any]] = []
    omission_keys: set[tuple[str, str]] = set()
    used_tokens = {name: 0 for name in layer_names}
    layer_budgets = query["per_layer_budgets"]
    optional_truncated = False
    for rank, (_priority, layer, mandatory, event) in enumerate(candidates, 1):
        entry = _packet_entry(event, layer=layer, mandatory=mandatory, rank=rank)
        if entry is None:
            continue
        if (
            entry["classification"] not in query["requested_classifications"]
            or not set(entry["source_tiers"]).issubset(query["requested_source_tiers"])
        ):
            if mandatory:
                raise ResearchMemoryError("mandatory-memory-authorization-denied")
            key = (layer, "authorization")
            if key not in omission_keys:
                omissions.append({"layer": layer, "reason": "authorization", "mandatory": False})
                omission_keys.add(key)
            continue
        tokens = (len(canonical_json_bytes(entry)) + 3) // 4
        if used_tokens[layer] + tokens > layer_budgets[layer]:
            if mandatory:
                raise ResearchMemoryError("mandatory-memory-overflow")
            key = (layer, "budget")
            if key not in omission_keys:
                omissions.append({"layer": layer, "reason": "budget", "mandatory": False})
                omission_keys.add(key)
            optional_truncated = True
            continue
        entries[layer].append(entry)
        used_tokens[layer] += tokens
    query_sha = sha(query)
    content_seed = {
        "query_sha256": query_sha,
        "receipt_id": receipt["receipt_id"],
        "entries": entries,
        "omissions": omissions,
    }
    packet_id = memory_id("context-packet", sha(content_seed))
    elapsed = max(0, (time.monotonic_ns() - started) // 1_000_000)
    packet: dict[str, Any] = {
        "schema": PACKET_SCHEMA,
        "context_packet_id": packet_id,
        "content_sha256": "sha256:" + "0" * 64,
        "query_sha256": query_sha,
        "run_receipt_id": receipt["receipt_id"],
        "as_of_system_time": receipt["as_of_system_time"],
        "effective_access_scope": dict(receipt["provider_access"]),
        "sections": {
            "episodes": {"delimiter": "MEMORY_DATA_EPISODES", "entries": entries["episodic"]},
            "semantics": {"delimiter": "MEMORY_DATA_SEMANTICS", "entries": entries["semantic"]},
            "procedures": {"delimiter": "MEMORY_DATA_PROCEDURES", "entries": entries["procedural"]},
        },
        "omissions": omissions,
        "accounting": {
            "estimated_tokens": sum(used_tokens.values()),
            "max_context_tokens": query["max_context_tokens"],
            "compile_milliseconds": elapsed,
            "optional_truncated": optional_truncated,
        },
        "lineage": [
            entry["record"] for section in entries.values() for entry in section
        ],
    }
    packet["content_sha256"] = sha(_without(packet, "content_sha256"))
    errors = validate_contract(packet)
    if errors:
        raise ResearchMemoryError("memory-packet-invalid: " + "; ".join(errors[:12]))
    return query, packet, render_untrusted_packet(packet)


def _time_sort(value: Any) -> int:
    if not isinstance(value, str):
        return 0
    try:
        return int(dt.datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp())
    except ValueError:
        return 0


def store_packet(
    state_root: str | Path, *, run_id: str, agent_id: str,
    query: Mapping[str, Any], packet: Mapping[str, Any], rendered: str,
) -> tuple[Path, Path, Path]:
    safe_agent = re.sub(r"[^A-Za-z0-9._-]+", "_", agent_id)
    directory = Path(state_root).resolve() / "packet-cache" / run_id / safe_agent
    query_path = directory / "query.json"
    packet_path = directory / "packet.json"
    rendered_path = directory / "packet.txt"
    _atomic_private_write(query_path, query)
    _atomic_private_write(packet_path, packet)
    _atomic_private_text(rendered_path, rendered)
    return query_path, packet_path, rendered_path


def _atomic_private_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    if os.name == "posix":
        os.chmod(path.parent, 0o700)
    temporary = path.parent / f".{path.name}.{uuid.uuid4().hex}"
    descriptor = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        raw = value.encode("utf-8")
        view = memoryview(raw)
        while view:
            written = os.write(descriptor, view)
            if written <= 0:
                raise ResearchMemoryError("packet-text-write-failed")
            view = view[written:]
        os.fsync(descriptor)
        os.close(descriptor)
        descriptor = -1
        os.replace(temporary, path)
        if os.name == "posix":
            directory = os.open(path.parent, os.O_RDONLY)
            try:
                os.fsync(directory)
            finally:
                os.close(directory)
    finally:
        if descriptor >= 0:
            try:
                os.close(descriptor)
            except OSError:
                pass
        if temporary.exists():
            temporary.unlink()


def validate_memory_use(
    use: Mapping[str, Any], *, packet: Mapping[str, Any], output: bytes,
    signer: Signer, supervisor_id: str, now: dt.datetime | None = None,
) -> dict[str, Any]:
    errors = validate_contract(use)
    if errors:
        raise ResearchMemoryError("memory-use-invalid: " + "; ".join(errors[:12]))
    canonical_use = _without(use, "use_sha256")
    canonical_use.pop("use_sha256", None)
    hash_ok = use.get("use_sha256") == sha(canonical_use)
    packet_ok = (
        use.get("packet_id") == packet.get("context_packet_id")
        and use.get("packet_sha256") == packet.get("content_sha256")
        and packet.get("content_sha256") == sha(_without(packet, "content_sha256"))
    )
    records = {
        entry["record"]["record_id"]: entry
        for section in packet["sections"].values() for entry in section["entries"]
    }
    declared: dict[str, str] = {}
    dispositions_ok = True
    for disposition in ("used", "checked_rejected", "contradicted", "not_applicable"):
        for item in use.get(disposition, []):
            record = item.get("record", {})
            record_id = record.get("record_id")
            entry = records.get(record_id)
            if not entry or entry["record"] != record or record_id in declared:
                dispositions_ok = False
            else:
                declared[record_id] = disposition
    mandatory_disposed = all(
        not entry.get("mandatory") or record_id in declared
        for record_id, entry in records.items()
    )
    output_text = output.decode("utf-8", errors="replace")
    used_ids = [item["record"]["record_id"] for item in use.get("used", [])]
    evidence_refs = use.get("current_evidence_refs", [])
    output_correspondence = dispositions_ok and mandatory_disposed and all(
        f"MEMORY_USED:{record_id}" in output_text for record_id in used_ids
    )
    undeclared_scan = all(
        record_id not in output_text and entry["record"]["content_sha256"] not in output_text
        for record_id, entry in records.items() if record_id not in declared
    )
    current_evidence = all(
        any(
            f"MEMORY_USED:{record_id} EVIDENCE:{evidence_ref}" in output_text
            for evidence_ref in evidence_refs
        )
        for record_id in used_ids
    )
    playbook = use.get("playbook", {})
    playbook_steps = playbook.get("status") == "none" or (
        playbook.get("execution_receipt_id") is not None and playbook.get("playbook_id") in records
    )
    checks = {
        "output_correspondence": output_correspondence,
        "current_evidence": current_evidence,
        "playbook_steps": playbook_steps,
        "undeclared_memory_scan": undeclared_scan,
        "canonical_hashes": hash_ok and packet_ok,
    }
    error_codes = [name.replace("_", "-") for name, passed in checks.items() if not passed]
    verified = utc_now(now)
    body = {
        "schema": ATTESTATION_SCHEMA,
        "attestation_id": memory_id("use-attestation", f"{use.get('use_id')}|{sha(output)}|{verified}"),
        "use_id": use["use_id"],
        "use_sha256": use["use_sha256"],
        "output_sha256": sha(output),
        "supervisor": {"kind": "supervisor", "id": supervisor_id},
        "checks": checks,
        "valid": all(checks.values()),
        "error_codes": error_codes,
        "verified_at": verified,
    }
    return _signed_contract(
        body, hash_field="attestation_sha256", signer=signer,
        domain=b"memory-use-attestation/v1",
    )


def materialize_memory_use(
    draft: Mapping[str, Any], *, receipt: Mapping[str, Any], packet: Mapping[str, Any],
    task_id: str, agent_id: str, now: dt.datetime | None = None,
) -> dict[str, Any]:
    allowed = {
        "schema", "used", "checked_rejected", "contradicted", "not_applicable",
        "current_evidence_refs", "playbook", "candidate_suggestions",
    }
    if not isinstance(draft, Mapping) or set(draft) != allowed or draft.get("schema") != "memory-use-draft/v1":
        raise ResearchMemoryError("memory-use-draft-open-or-invalid")
    records = {
        entry["record"]["record_id"]: entry["record"]
        for section in packet["sections"].values() for entry in section["entries"]
    }
    dispositions: dict[str, list[dict[str, Any]]] = {}
    for field in ("used", "checked_rejected", "contradicted", "not_applicable"):
        values = draft.get(field)
        if not isinstance(values, list) or len(values) > 128:
            raise ResearchMemoryError("memory-use-draft-disposition-invalid")
        rows = []
        for item in values:
            if not isinstance(item, Mapping) or set(item) != {"record_id", "reason_code"}:
                raise ResearchMemoryError("memory-use-draft-disposition-invalid")
            record_id = item.get("record_id")
            reason = item.get("reason_code")
            if record_id not in records or not isinstance(reason, str) or re.fullmatch(r"[a-z][a-z0-9-]{0,63}", reason) is None:
                raise ResearchMemoryError("memory-use-draft-disposition-invalid")
            rows.append({"record": records[record_id], "reason_code": reason})
        dispositions[field] = rows
    created = utc_now(now)
    use: dict[str, Any] = {
        "schema": USE_SCHEMA,
        "use_id": memory_id("memory-use", f"{receipt['run_id']}|{task_id}|{packet['context_packet_id']}|{created}"),
        "run_id": receipt["run_id"], "task_id": task_id, "agent_id": agent_id,
        "packet_id": packet["context_packet_id"], "packet_sha256": packet["content_sha256"],
        **dispositions,
        "current_evidence_refs": draft["current_evidence_refs"],
        "playbook": draft["playbook"],
        "candidate_suggestions": draft["candidate_suggestions"],
        "created_at": created,
    }
    use["use_sha256"] = sha(use)
    errors = validate_contract(use)
    if errors:
        raise ResearchMemoryError("memory-use-invalid: " + "; ".join(errors[:12]))
    return use


def build_task_episode(
    *, run_id: str, task_id: str, issuer_listing: Mapping[str, Any], agent_id: str,
    task: str, provider: str, model: str, prompt_program_sha: str, output: bytes,
    packet: Mapping[str, Any], query: Mapping[str, Any], attestation: Mapping[str, Any],
    latency_milliseconds: int, cost_microusd: int, quality_gates: Sequence[Mapping[str, Any]],
    procedure_execution_id: str | None = None, now: dt.datetime | None = None,
) -> dict[str, Any]:
    created = utc_now(now)
    status = "completed" if attestation.get("valid") is True else "invalid"
    body = {
        "schema": TASK_EPISODE_SCHEMA,
        "episode_id": memory_id("task-episode", f"{run_id}|{task_id}|{sha(output)}"),
        "run_id": run_id,
        "task_id": task_id,
        "issuer_listing": dict(issuer_listing),
        "agent_id": agent_id,
        "task": task,
        "provider": provider,
        "model": model,
        "prompt_program_sha": prompt_program_sha if prompt_program_sha.startswith("git:")
        else "git:" + prompt_program_sha,
        "output_sha256": sha(output),
        "packet_id": packet["context_packet_id"],
        "packet_sha256": packet["content_sha256"],
        "query_sha256": packet["query_sha256"],
        "status": status,
        "latency_milliseconds": max(0, latency_milliseconds),
        "cost_microusd": max(0, cost_microusd),
        "quality_gates": [dict(item) for item in quality_gates],
        "use_attestation_id": attestation["attestation_id"],
        "procedure_execution_id": procedure_execution_id,
        "error_codes": list(attestation.get("error_codes", [])),
        "created_at": created,
    }
    body["episode_sha256"] = sha(body)
    errors = validate_contract(body)
    if errors:
        raise ResearchMemoryError("task-episode-invalid: " + "; ".join(errors[:12]))
    return body


def build_run_episode(
    *, run_id: str, receipt: Mapping[str, Any], mode: str,
    task_episodes: Sequence[Mapping[str, Any]], expected_task_count: int,
    status: str, started_at: str, completed_at: str | None,
) -> dict[str, Any]:
    if mode not in MODES:
        raise ResearchMemoryError("memory-mode-invalid")
    ids = [str(item["episode_id"]) for item in task_episodes]
    coverage = 100 if expected_task_count == 0 else len(ids) * 100 / expected_task_count
    body = {
        "schema": RUN_EPISODE_SCHEMA,
        "episode_id": memory_id("run-episode", f"{run_id}|{receipt['receipt_id']}|{len(ids)}"),
        "run_id": run_id,
        "receipt_id": receipt["receipt_id"],
        "issuer_listing": dict(receipt["issuer_listing"]),
        "mode": mode,
        "task_episode_ids": ids,
        "expected_task_count": expected_task_count,
        "completed_task_count": len(ids),
        "memory_coverage_pct": coverage,
        "status": status,
        "started_at": started_at,
        "completed_at": completed_at,
    }
    body["episode_sha256"] = sha(body)
    errors = validate_contract(body)
    if errors:
        raise ResearchMemoryError("run-episode-invalid: " + "; ".join(errors[:12]))
    return body


__all__ = [
    "ResearchMemoryError", "build_provider_authorization", "build_query", "build_run_episode",
    "build_run_receipt", "build_task_episode", "compile_agent_packet", "load_run_receipt",
    "materialize_memory_use", "memory_id", "sha", "load_provider_authorization",
    "store_provider_authorization", "verify_provider_authorization",
    "ed25519_contract_signer", "ed25519_contract_verifier", "store_packet", "store_run_receipt",
    "utc_now", "validate_memory_use", "verify_run_receipt",
]
