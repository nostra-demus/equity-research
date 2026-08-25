#!/usr/bin/env python3
"""Governed semantic-candidate verification, promotion, and activation helpers.

Candidates and review receipts are inert owner-only runtime state.  This module never merges a
pull request and never writes an active lesson directly.  The only activation output is a closed
controlled-writer request whose signed manifest commits to a merged promotion PR.
"""
from __future__ import annotations

import base64
import binascii
import copy
import datetime as dt
import hashlib
import json
import os
import re
import subprocess
import sqlite3
import tempfile
import uuid
from pathlib import Path
from typing import Any, Callable, Mapping, Sequence

try:
    from canonical_json import canonical_json_bytes, canonical_sha256
    from memory_projection import verify_projection
    from memory_crypto import AESGCMSIVEnvelopeCipher
    from memory_three_layer_contract import validate_contract, validate_promotion_bundle
    from memory_runtime import (
        EXCHANGE_MICS,
        _atomic_private_write,
        _hash_id,
        _normal_name,
        _safe_regular,
        ed25519_sign,
        ed25519_verify,
        load_master_key_file,
    )
    from research_memory_run import sha, utc_now
except ImportError:  # pragma: no cover - package-style imports
    from scripts.canonical_json import canonical_json_bytes, canonical_sha256
    from scripts.memory_projection import verify_projection
    from scripts.memory_crypto import AESGCMSIVEnvelopeCipher
    from scripts.memory_three_layer_contract import validate_contract, validate_promotion_bundle
    from scripts.memory_runtime import (
        EXCHANGE_MICS,
        _atomic_private_write,
        _hash_id,
        _normal_name,
        _safe_regular,
        ed25519_sign,
        ed25519_verify,
        load_master_key_file,
    )
    from scripts.research_memory_run import sha, utc_now


HASH_RE = re.compile(r"sha256:[0-9a-f]{64}")
EVIDENCE_RE = re.compile(
    r"evidence:sha256:(?P<digest>[0-9a-f]{64})#(?P<locator>[A-Za-z0-9][A-Za-z0-9._~:/?&=,+-]{0,255})"
)
EVENT_RE = re.compile(
    r"evt_[0-9a-f]{8}-[0-9a-f]{4}-[57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}"
)
SAFE_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9._/-]{0,127}")
PROMOTION_BRANCH = re.compile(r"codex/memory-promotion-[a-z0-9][a-z0-9-]{0,63}")
INSTRUCTION_LIKE = re.compile(
    r"(?is)(ignore\s+(?:all\s+)?(?:previous|prior)|system\s+prompt|<\s*/?\s*system|"
    r"(?:run|execute|call)\s+(?:the\s+)?(?:shell|command|tool)|curl\s+https?://|"
    r"rm\s+-rf|BEGIN\s+(?:SYSTEM|INSTRUCTIONS))"
)
PROTECTED_CLASSIFICATIONS = frozenset({"licensed", "confidential", "restricted"})

Signer = Callable[[bytes], Mapping[str, str]]
Verifier = Callable[[bytes, Mapping[str, str]], bool]
CommandRunner = Callable[[Sequence[str], Path], str]


class SemanticMemoryError(ValueError):
    """Semantic learning is not eligible for the requested transition."""


def _command(args: Sequence[str], cwd: Path) -> str:
    try:
        result = subprocess.run(
            list(args), cwd=cwd, check=False, capture_output=True, text=True, timeout=120,
        )
    except (OSError, subprocess.SubprocessError) as exc:
        raise SemanticMemoryError("semantic-promotion-command-failed") from exc
    if result.returncode:
        raise SemanticMemoryError(
            "semantic-promotion-command-failed: " + (result.stderr.strip() or str(result.returncode))[:500]
        )
    return result.stdout.strip()


def _without(value: Mapping[str, Any], *keys: str) -> dict[str, Any]:
    return {key: copy.deepcopy(item) for key, item in value.items() if key not in keys}


def _memory_id(prefix: str, seed: str) -> str:
    return f"{prefix}_{uuid.uuid5(uuid.NAMESPACE_URL, seed)}"


def _event_id(seed: str) -> str:
    return f"evt_{uuid.uuid5(uuid.NAMESPACE_URL, seed)}"


def _run_id(seed: str) -> str:
    return f"run_{uuid.uuid5(uuid.NAMESPACE_URL, seed)}"


def _trace_id(seed: str) -> str:
    value = hashlib.sha256(seed.encode("utf-8")).hexdigest()[:32]
    return value if value != "0" * 32 else "1" + value[1:]


def _canonical_hash(value: Mapping[str, Any], hash_field: str) -> str:
    return sha(_without(value, hash_field))


def semantic_signer(key_path: str | Path, *, key_id: str) -> Signer:
    if SAFE_ID.fullmatch(key_id) is None:
        raise SemanticMemoryError("semantic-signing-key-id-invalid")

    def sign(message: bytes) -> Mapping[str, str]:
        signature = ed25519_sign(
            load_master_key_file(key_path), b"memory-semantic-governance/v1\0" + message
        )
        return {
            "key_id": key_id,
            "algorithm": "ed25519",
            "signed_sha256": sha(message),
            "value": base64.urlsafe_b64encode(signature).decode("ascii").rstrip("="),
        }

    return sign


def semantic_verifier(public_key_path: str | Path, *, key_id: str) -> Verifier:
    if SAFE_ID.fullmatch(key_id) is None:
        raise SemanticMemoryError("semantic-signing-key-id-invalid")

    def verify(message: bytes, signature: Mapping[str, str]) -> bool:
        if (
            signature.get("key_id") != key_id
            or signature.get("algorithm") != "ed25519"
            or signature.get("signed_sha256") != sha(message)
        ):
            return False
        try:
            raw = base64.urlsafe_b64decode(str(signature.get("value")) + "==")
            public_key = _safe_regular(Path(public_key_path))
        except (OSError, ValueError):
            return False
        return ed25519_verify(
            public_key, b"memory-semantic-governance/v1\0" + message, raw
        )

    return verify


def _signed(value: Mapping[str, Any], *, hash_field: str, signer: Signer) -> dict[str, Any]:
    unsigned = _without(value, hash_field, "signature")
    digest = sha(unsigned)
    message = canonical_json_bytes({**unsigned, hash_field: digest})
    signature = dict(signer(message))
    if set(signature) != {"key_id", "algorithm", "signed_sha256", "value"}:
        raise SemanticMemoryError("semantic-signer-open-shape")
    if signature.get("signed_sha256") != sha(message):
        raise SemanticMemoryError("semantic-signer-stale-commitment")
    return {**unsigned, hash_field: digest, "signature": signature}


def verify_signed(
    value: Mapping[str, Any], *, hash_field: str, verifier: Verifier,
) -> bool:
    unsigned = _without(value, hash_field, "signature")
    if value.get(hash_field) != sha(unsigned):
        return False
    signature = value.get("signature")
    message = canonical_json_bytes({**unsigned, hash_field: value[hash_field]})
    return (
        isinstance(signature, Mapping)
        and signature.get("signed_sha256") == sha(message)
        and verifier(message, signature) is True
    )


def build_candidate(
    *, candidate_type: str, source_basis: str, semantic: Mapping[str, Any],
    originating_episode_ids: Sequence[str], created_by: Mapping[str, str],
    policy: Mapping[str, Any], now: dt.datetime | None = None,
) -> dict[str, Any]:
    statement = semantic.get("statement")
    if isinstance(statement, str) and INSTRUCTION_LIKE.search(statement):
        raise SemanticMemoryError("semantic-candidate-instruction-like-content")
    created_at = utc_now(now)
    seed = sha({
        "semantic": semantic, "origins": list(originating_episode_ids),
        "created_by": created_by, "created_at": created_at,
    })
    value: dict[str, Any] = {
        "schema": "memory-semantic-candidate/v1",
        "candidate_id": _memory_id("semantic-candidate", seed),
        "candidate_type": candidate_type,
        "source_basis": source_basis,
        "semantic": copy.deepcopy(dict(semantic)),
        "originating_episode_ids": list(originating_episode_ids),
        "created_by": copy.deepcopy(dict(created_by)),
        "policy": copy.deepcopy(dict(policy)),
        "status": "candidate",
        "created_at": created_at,
        "candidate_sha256": "sha256:" + "0" * 64,
    }
    value["candidate_sha256"] = _canonical_hash(value, "candidate_sha256")
    errors = validate_contract(value)
    if errors:
        raise SemanticMemoryError("semantic-candidate-invalid: " + "; ".join(errors[:12]))
    return value


def _canonical_run_identities(
    connection: sqlite3.Connection,
) -> dict[str, tuple[str, str]]:
    rows = connection.execute(
        "SELECT canonical_event FROM events WHERE event_type='decision.recorded' "
        "ORDER BY system_time,event_id"
    ).fetchall()
    identities: dict[str, tuple[str, str]] = {}
    for (raw_decision,) in rows:
        decision_event = json.loads(raw_decision)
        payload = decision_event.get("payload")
        record = payload.get("record") if isinstance(payload, Mapping) else None
        source_path = payload.get("source_path") if isinstance(payload, Mapping) else None
        if not isinstance(record, Mapping) or not isinstance(source_path, str):
            continue
        parts = source_path.split("/")
        legal_name = record.get("company_name")
        exchange = record.get("exchange")
        ticker = record.get("ticker")
        if (
            len(parts) < 2
            or parts[0] != "analyses"
            or not isinstance(legal_name, str)
            or not isinstance(exchange, str)
            or not isinstance(ticker, str)
            or exchange not in EXCHANGE_MICS
        ):
            continue
        identities[parts[1]] = (
            "entity:internal:" + _hash_id("issuer", _normal_name(legal_name)),
            f"security:mic-ticker:{EXCHANGE_MICS[exchange]}:{ticker.strip().upper()}",
        )
    return identities


def _exact_event_identity(
    event: Mapping[str, Any], run_identities: Mapping[str, tuple[str, str]],
) -> tuple[str, str] | None:
    issuers = [
        item
        for item in event.get("subject_ids", [])
        if isinstance(item, str)
        and item.startswith("entity:internal:")
        and not item.startswith("entity:internal:legacy-")
    ]
    listings = [
        item for item in event.get("subject_ids", [])
        if isinstance(item, str) and item.startswith("security:mic-ticker:")
    ]
    if len(issuers) == 1 and len(listings) == 1:
        return issuers[0], listings[0]
    payload = event.get("payload")
    source_path = payload.get("source_path") if isinstance(payload, Mapping) else None
    parts = source_path.split("/") if isinstance(source_path, str) else []
    return (
        run_identities.get(parts[1])
        if len(parts) >= 2 and parts[0] == "analyses"
        else None
    )


def seed_reviewed_candidates(
    *, database_path: str | Path, projection_digest: str, state: "SemanticState",
    now: dt.datetime | None = None,
) -> list[Path]:
    """Seed inert candidates only from closed reviewed-outcome learning blocks.

    Free-form historical ``lessons`` arrays and module prose are deliberately ignored.
    """

    created = now or dt.datetime.now(dt.timezone.utc)
    review_due = (created.astimezone(dt.timezone.utc).date() + dt.timedelta(days=180)).isoformat()
    connection = _projection_connection(Path(database_path), projection_digest)
    paths: list[Path] = []
    empirical_errors: dict[str, dict[str, tuple[dict[str, Any], str]]] = {}
    try:
        run_identities = _canonical_run_identities(connection)

        correction_rows = connection.execute(
            "SELECT canonical_event FROM events WHERE event_type='correction.recorded' "
            "ORDER BY system_time,event_id"
        ).fetchall()
        for (raw_correction,) in correction_rows:
            correction_event = json.loads(raw_correction)
            identity = _exact_event_identity(correction_event, run_identities)
            correction_payload = correction_event.get("payload")
            correction_record = (
                correction_payload.get("record")
                if isinstance(correction_payload, Mapping)
                else None
            )
            errata = (
                correction_record.get("errata")
                if isinstance(correction_record, Mapping)
                else None
            )
            evidence_refs = correction_event.get("evidence_refs")
            if (
                identity is None
                or not isinstance(errata, list)
                or not isinstance(evidence_refs, list)
                or not evidence_refs
            ):
                continue
            evidence_ref = evidence_refs[0]
            if not isinstance(evidence_ref, str) or EVIDENCE_RE.fullmatch(evidence_ref) is None:
                continue
            issuer_id, listing_id = identity
            for erratum in errata:
                if not isinstance(erratum, Mapping):
                    continue
                field = erratum.get("field")
                reason = erratum.get("reason")
                if not isinstance(field, str) or not isinstance(reason, str):
                    continue
                statement = f"Recheck the prior correction to {field}: {reason}"[:4000]
                if INSTRUCTION_LIKE.search(statement):
                    continue
                semantic = {
                    "lesson_kind": "exact-issuer",
                    "effect": "current-check-required",
                    "statement": statement,
                    "applicability": {
                        "agents": [],
                        "modules": [],
                        "issuer_ids": [issuer_id],
                        "listing_ids": [listing_id],
                        "sectors": [],
                        "jurisdictions": [],
                        "accounting_standards": [],
                        "metrics": [],
                        "source_types": [],
                    },
                    "supporting_evidence": [evidence_ref],
                    "contradicting_evidence": [],
                    "observations": [{
                        "issuer_id": issuer_id,
                        "effective_at": correction_event["system_time"],
                        "evidence_ref": evidence_ref,
                    }],
                    "effective_observation_count": 1,
                    "distinct_issuer_count": 1,
                    "valid_time": copy.deepcopy(correction_event["valid_time"]),
                    "review_due": review_due,
                }
                candidate = build_candidate(
                    candidate_type="lesson",
                    source_basis="structured-correction",
                    semantic=semantic,
                    originating_episode_ids=[correction_event["event_id"]],
                    created_by={"kind": "adapter", "id": "structured-correction-seeder"},
                    policy=correction_event["policy"],
                    now=created,
                )
                paths.append(state.put_candidate(candidate))

        rows = connection.execute(
            "SELECT canonical_event FROM events WHERE event_type='outcome.reviewed' ORDER BY system_time,event_id"
        ).fetchall()
        for (raw,) in rows:
            event = json.loads(raw)
            payload = event.get("payload") if isinstance(event, Mapping) else None
            record = payload.get("record") if isinstance(payload, Mapping) else None
            learning = record.get("learning") if isinstance(record, Mapping) else None
            statement = learning.get("future_research_check") if isinstance(learning, Mapping) else None
            identity = _exact_event_identity(event, run_identities)
            if identity is None:
                continue
            issuer_id, listing_id = identity
            issuer_ids = [issuer_id]
            source_sha = payload.get("source_sha256") if isinstance(payload, Mapping) else None
            locator = payload.get("source_locator") if isinstance(payload, Mapping) else None
            if not isinstance(source_sha, str) or not isinstance(locator, str):
                continue
            digest = source_sha.removeprefix("sha256:")
            evidence_ref = f"evidence:sha256:{digest}#{locator}"
            if EVIDENCE_RE.fullmatch(evidence_ref) is None:
                continue
            for error_code in record.get("error_taxonomy", []) if isinstance(record, Mapping) else []:
                if (
                    isinstance(error_code, str)
                    and 1 <= len(error_code) <= 128
                    and INSTRUCTION_LIKE.search(error_code) is None
                ):
                    empirical_errors.setdefault(error_code, {})[issuer_ids[0]] = (event, evidence_ref)
            if not isinstance(statement, str) or not statement.strip():
                continue
            observed = str(event.get("system_time"))
            semantic = {
                "lesson_kind": "exact-issuer", "effect": "current-check-required",
                "statement": statement.strip(),
                "applicability": {
                    "agents": [], "modules": [], "issuer_ids": issuer_ids,
                    "listing_ids": [listing_id], "sectors": [],
                    "jurisdictions": [], "accounting_standards": [], "metrics": [],
                    "source_types": [],
                },
                "supporting_evidence": [evidence_ref], "contradicting_evidence": [],
                "observations": [{
                    "issuer_id": issuer_ids[0], "effective_at": observed,
                    "evidence_ref": evidence_ref,
                }],
                "effective_observation_count": 1, "distinct_issuer_count": 1,
                "valid_time": copy.deepcopy(event["valid_time"]), "review_due": review_due,
            }
            candidate = build_candidate(
                candidate_type="lesson", source_basis="reviewed-outcome", semantic=semantic,
                originating_episode_ids=[event["event_id"]],
                created_by={"kind": "adapter", "id": "structured-review-seeder"},
                policy=event["policy"], now=created,
            )
            paths.append(state.put_candidate(candidate))
        for error_code, by_issuer in sorted(empirical_errors.items()):
            if len(by_issuer) < 5:
                continue
            selected = [by_issuer[issuer_id] for issuer_id in sorted(by_issuer)]
            evidence = list(dict.fromkeys(ref for _event, ref in selected))
            observations = [
                {
                    "issuer_id": issuer_id,
                    "effective_at": source_event["system_time"], "evidence_ref": evidence_ref,
                }
                for issuer_id, (source_event, evidence_ref) in sorted(by_issuer.items())
            ]
            semantic = {
                "lesson_kind": "cross-company-empirical", "effect": "current-check-required",
                "statement": (
                    f"Require a current-run defense against the recurring {error_code!r} error category, "
                    "or state that no defense is available."
                ),
                "applicability": {
                    "agents": [], "modules": [], "issuer_ids": [], "listing_ids": [],
                    "sectors": [],
                    "jurisdictions": [], "accounting_standards": [], "metrics": [],
                    "source_types": [],
                },
                "supporting_evidence": evidence, "contradicting_evidence": [],
                "observations": observations,
                "effective_observation_count": len(observations),
                "distinct_issuer_count": len(by_issuer),
                "valid_time": {"from": created.date().isoformat(), "to": None},
                "review_due": review_due,
            }
            policies = {canonical_json_bytes(event["policy"]) for event, _ref in selected}
            if len(policies) != 1:
                continue
            candidate = build_candidate(
                candidate_type="lesson", source_basis="empirical-observations", semantic=semantic,
                originating_episode_ids=[event["event_id"] for event, _ref in selected],
                created_by={"kind": "adapter", "id": "structured-review-seeder"},
                policy=selected[0][0]["policy"], now=created,
            )
            paths.append(state.put_candidate(candidate))
    finally:
        connection.close()
    return paths


def verify_candidate_hash(candidate: Mapping[str, Any]) -> None:
    errors = validate_contract(candidate)
    if errors:
        raise SemanticMemoryError("semantic-candidate-invalid: " + "; ".join(errors[:12]))
    if candidate.get("candidate_sha256") != _canonical_hash(candidate, "candidate_sha256"):
        raise SemanticMemoryError("semantic-candidate-hash-invalid")


def _projection_connection(database: Path, expected_digest: str) -> sqlite3.Connection:
    verify_projection(database, expected_digest=expected_digest.removeprefix("sha256:"))
    return sqlite3.connect(f"file:{database.resolve().as_posix()}?mode=ro&immutable=1", uri=True)


def _provider_rows(
    connection: sqlite3.Connection, evidence_ref: str,
) -> tuple[list[tuple[str, str]], bool]:
    match = EVIDENCE_RE.fullmatch(evidence_ref)
    if match is None:
        raise SemanticMemoryError("semantic-evidence-ref-invalid")
    digest, locator = match.group("digest"), match.group("locator")
    rows = connection.execute(
        """SELECT DISTINCT a.source_event_id,l.source_event_id
             FROM artifacts a JOIN artifact_locators l ON l.sha256=a.sha256
            WHERE a.sha256=? AND l.locator=? ORDER BY a.source_event_id,l.source_event_id""",
        (digest, locator),
    ).fetchall()
    exact_span = bool(connection.execute(
        """SELECT 1 FROM artifact_locators l
             JOIN typed_payloads t ON t.event_id=l.source_event_id
            WHERE l.sha256=? AND l.locator=? AND t.payload_schema IN
                  ('memory-evidence-span/v1','memory-evidence-span/v2') LIMIT 1""",
        (digest, locator),
    ).fetchone())
    return [(str(row[0]), str(row[1])) for row in rows], exact_span


def _origin_events(
    connection: sqlite3.Connection, origins: Sequence[str],
) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    for origin in origins:
        if EVENT_RE.fullmatch(origin):
            row = connection.execute(
                "SELECT canonical_event FROM events WHERE event_id=?", (origin,)
            ).fetchone()
        else:
            row = connection.execute(
                """SELECT e.canonical_event FROM typed_payloads t
                     JOIN events e ON e.event_id=t.event_id WHERE t.record_id=?""",
                (origin,),
            ).fetchone()
        if row is None:
            raise SemanticMemoryError("semantic-origin-episode-unresolved")
        events.append(json.loads(row[0]))
    return events


def _review_shape(
    *, candidate: Mapping[str, Any], role: str, reviewer: Mapping[str, str],
    projection_digest: str, resolved: Sequence[Mapping[str, Any]], origin_sha256s: Sequence[str],
    now: dt.datetime | None, signer: Signer,
) -> dict[str, Any]:
    reviewed_at = utc_now(now)
    body = {
        "schema": "memory-semantic-verification/v1",
        "verification_id": _memory_id(
            "semantic-verification",
            f"{candidate['candidate_sha256']}|{role}|{reviewer['id']}|{reviewed_at}",
        ),
        "candidate_sha256": candidate["candidate_sha256"],
        "role": role,
        "reviewer": copy.deepcopy(dict(reviewer)),
        "projection_digest": projection_digest,
        "resolved_evidence": list(resolved),
        "origin_event_sha256s": list(origin_sha256s),
        "decision": "verified",
        "verified_at": reviewed_at,
        "verification_sha256": "sha256:" + "0" * 64,
    }
    return _signed(body, hash_field="verification_sha256", signer=signer)


def verify_candidate(
    candidate: Mapping[str, Any], *, database_path: str | Path,
    projection_digest: str, role: str, reviewer: Mapping[str, str], signer: Signer,
    now: dt.datetime | None = None,
) -> dict[str, Any]:
    """Independently verify evidence, scope, extraction, or injection safety."""

    verify_candidate_hash(candidate)
    if role not in {"evidence", "applicability", "security", "extraction"}:
        raise SemanticMemoryError("semantic-review-role-invalid")
    if not isinstance(reviewer, Mapping) or set(reviewer) != {"kind", "id"}:
        raise SemanticMemoryError("semantic-reviewer-invalid")
    if reviewer.get("id") == candidate.get("created_by", {}).get("id"):
        raise SemanticMemoryError("semantic-candidate-self-verification-denied")
    statement = str(candidate["semantic"]["statement"])
    if role == "security" and INSTRUCTION_LIKE.search(statement):
        raise SemanticMemoryError("semantic-candidate-instruction-like-content")
    connection = _projection_connection(Path(database_path), projection_digest)
    try:
        origins = _origin_events(connection, candidate["originating_episode_ids"])
        resolved: list[dict[str, Any]] = []
        all_exact_spans = True
        for evidence_ref in candidate["semantic"]["supporting_evidence"]:
            providers, exact_span = _provider_rows(connection, evidence_ref)
            if not providers:
                raise SemanticMemoryError("semantic-evidence-span-unresolved")
            all_exact_spans = all_exact_spans and exact_span
            resolved.append({
                "evidence_ref": evidence_ref,
                "artifact_event_id": providers[0][0],
                "locator_event_id": providers[0][1],
            })
        if candidate["candidate_type"] == "fact" and role == "extraction" and not all_exact_spans:
            raise SemanticMemoryError("semantic-fact-requires-exact-evidence-span")
        origin_types = {str(event.get("event_type")) for event in origins}
        basis = candidate["source_basis"]
        if basis == "structured-correction" and not any("correction" in item for item in origin_types):
            raise SemanticMemoryError("semantic-correction-origin-invalid")
        if basis == "reviewed-outcome" and "outcome.reviewed" not in origin_types:
            raise SemanticMemoryError("semantic-outcome-origin-invalid")
        if basis == "authoritative-policy":
            source_ids = [row["artifact_event_id"] for row in resolved]
            placeholders = ",".join("?" for _ in source_ids)
            tiers = connection.execute(
                f"SELECT source_tier FROM source_index WHERE event_id IN ({placeholders})",
                source_ids,
            ).fetchall() if source_ids else []
            if not tiers or any(int(row[0]) not in {1, 2, 3, 4, 8} for row in tiers):
                raise SemanticMemoryError("semantic-policy-source-not-authoritative")
        applicability = candidate["semantic"]["applicability"]
        if candidate["semantic"]["lesson_kind"] == "exact-issuer":
            expected = {
                (issuer_id, listing_id)
                for issuer_id in applicability["issuer_ids"]
                for listing_id in applicability["listing_ids"]
            }
            run_identities = _canonical_run_identities(connection)
            resolved_identities = [
                _exact_event_identity(event, run_identities) for event in origins
            ]
            if not resolved_identities or any(
                identity not in expected for identity in resolved_identities
            ):
                raise SemanticMemoryError("semantic-exact-issuer-origin-mismatch")
        if role == "extraction" and candidate["candidate_type"] != "fact":
            raise SemanticMemoryError("semantic-extraction-review-not-required")
        origin_sha256s = [sha(event) for event in origins]
    finally:
        connection.close()
    return _review_shape(
        candidate=candidate, role=role, reviewer=reviewer,
        projection_digest=projection_digest, resolved=resolved,
        origin_sha256s=origin_sha256s, now=now, signer=signer,
    )


def _reviewer(review: Mapping[str, Any]) -> dict[str, Any]:
    return {"role": review["role"], "identity": copy.deepcopy(review["reviewer"])}


def validate_verification(
    review: Mapping[str, Any], *, candidate: Mapping[str, Any], verifier: Verifier,
) -> None:
    fields = {
        "schema", "verification_id", "candidate_sha256", "role", "reviewer",
        "projection_digest", "resolved_evidence", "origin_event_sha256s", "decision",
        "verified_at", "verification_sha256", "signature",
    }
    if not isinstance(review, Mapping) or set(review) != fields:
        raise SemanticMemoryError("semantic-verification-open-or-invalid")
    if (
        review.get("schema") != "memory-semantic-verification/v1"
        or review.get("candidate_sha256") != candidate.get("candidate_sha256")
        or review.get("role") not in {"evidence", "applicability", "security", "extraction"}
        or review.get("decision") != "verified"
        or not isinstance(review.get("reviewer"), Mapping)
        or set(review["reviewer"]) != {"kind", "id"}
        or review["reviewer"].get("kind") not in {"human", "service", "system"}
        or review["reviewer"].get("id") == candidate.get("created_by", {}).get("id")
        or not HASH_RE.fullmatch(str(review.get("projection_digest")))
        or not verify_signed(review, hash_field="verification_sha256", verifier=verifier)
    ):
        raise SemanticMemoryError("semantic-verification-invalid-or-untrusted")


def build_lesson(
    candidate: Mapping[str, Any], *, reviews: Sequence[Mapping[str, Any]], owner: str,
    verifier: Verifier,
    version: int = 1, lesson_id: str | None = None,
    supersedes: Mapping[str, Any] | None = None, now: dt.datetime | None = None,
) -> dict[str, Any]:
    verify_candidate_hash(candidate)
    for review in reviews:
        validate_verification(review, candidate=candidate, verifier=verifier)
    required = {"evidence", "applicability", "security"}
    if candidate["candidate_type"] == "fact":
        required.add("extraction")
    roles = {review.get("role") for review in reviews}
    identities = [review.get("reviewer", {}).get("id") for review in reviews]
    if (
        roles != required
        or len(reviews) != len(required)
        or len(identities) != len(set(identities))
    ):
        raise SemanticMemoryError("semantic-promotion-independent-review-incomplete")
    if candidate["created_by"]["id"] in identities:
        raise SemanticMemoryError("semantic-candidate-author-cannot-promote")
    if any(review.get("candidate_sha256") != candidate["candidate_sha256"] for review in reviews):
        raise SemanticMemoryError("semantic-review-candidate-binding-invalid")
    activated_at = utc_now(now)
    review_digests = {str(review.get("projection_digest")) for review in reviews}
    evidence_resolutions = {
        canonical_json_bytes(review.get("resolved_evidence", [])).decode("utf-8")
        for review in reviews
    }
    origin_resolutions = {
        canonical_json_bytes(review.get("origin_event_sha256s", [])).decode("utf-8")
        for review in reviews
    }
    try:
        created = dt.datetime.fromisoformat(str(candidate["created_at"]).replace("Z", "+00:00"))
        activated = dt.datetime.fromisoformat(activated_at.replace("Z", "+00:00"))
        review_times = [
            dt.datetime.fromisoformat(str(review["verified_at"]).replace("Z", "+00:00"))
            for review in reviews
        ]
    except (KeyError, TypeError, ValueError) as exc:
        raise SemanticMemoryError("semantic-review-time-invalid") from exc
    if (
        len(review_digests) != 1
        or len(evidence_resolutions) != 1
        or len(origin_resolutions) != 1
        or any(reviewed < created or reviewed > activated for reviewed in review_times)
    ):
        raise SemanticMemoryError("semantic-promotion-review-snapshot-or-time-mismatch")
    identity = lesson_id or _memory_id("semantic-lesson", candidate["candidate_sha256"])
    if version == 1 and supersedes is not None:
        raise SemanticMemoryError("semantic-first-version-cannot-supersede")
    if version > 1 and (lesson_id is None or supersedes is None):
        raise SemanticMemoryError("semantic-supersession-requires-prior-record")
    value: dict[str, Any] = {
        "schema": "memory-semantic-lesson/v1",
        "lesson_id": identity,
        "version": version,
        "semantic": copy.deepcopy(candidate["semantic"]),
        "owner": owner,
        "verified_by": [_reviewer(review) for review in reviews if review["role"] in required],
        "source_candidate_sha256": candidate["candidate_sha256"],
        "policy": copy.deepcopy(candidate["policy"]),
        "status": "active",
        "supersedes": copy.deepcopy(supersedes),
        "activated_at": activated_at,
        "lesson_sha256": "sha256:" + "0" * 64,
    }
    value["lesson_sha256"] = _canonical_hash(value, "lesson_sha256")
    errors = validate_contract(value)
    if errors:
        raise SemanticMemoryError("semantic-lesson-invalid: " + "; ".join(errors[:12]))
    return value


def build_promotion_manifest(
    candidate: Mapping[str, Any], lesson: Mapping[str, Any], *,
    reviews: Sequence[Mapping[str, Any]], author: Mapping[str, str], branch: str,
    pull_request: int, signer: Signer, verifier: Verifier,
    now: dt.datetime | None = None,
) -> dict[str, Any]:
    if PROMOTION_BRANCH.fullmatch(branch) is None or pull_request < 1:
        raise SemanticMemoryError("semantic-promotion-pr-binding-invalid")
    if author.get("kind") != "service":
        raise SemanticMemoryError("semantic-promotion-service-author-required")
    for review in reviews:
        validate_verification(review, candidate=candidate, verifier=verifier)
    evaluation_sha = sha(sorted(review["verification_sha256"] for review in reviews))
    created_at = utc_now(now)
    body = {
        "schema": "memory-promotion-manifest/v1",
        "manifest_id": _memory_id(
            "promotion-manifest", f"{candidate['candidate_sha256']}|{pull_request}|{created_at}",
        ),
        "candidate_kind": "semantic",
        "candidate_sha256": candidate["candidate_sha256"],
        "target_schema": "memory-semantic-lesson/v1",
        "target_id": lesson["lesson_id"],
        "target_version": lesson["version"],
        "evaluation_sha256": evaluation_sha,
        "reviewers": [_reviewer(review) for review in reviews],
        "author": copy.deepcopy(dict(author)),
        "branch": branch,
        "pull_request": pull_request,
        "activation_content_sha256": lesson["lesson_sha256"],
        "created_at": created_at,
        "manifest_sha256": "sha256:" + "0" * 64,
        "signature": {},
    }
    manifest = _signed(body, hash_field="manifest_sha256", signer=signer)
    errors = validate_promotion_bundle(candidate, lesson, manifest)
    if errors:
        raise SemanticMemoryError("semantic-promotion-invalid: " + "; ".join(errors[:12]))
    return manifest


def open_promotion_pull_request(
    candidate: Mapping[str, Any], lesson: Mapping[str, Any], *,
    reviews: Sequence[Mapping[str, Any]], author: Mapping[str, str], branch: str,
    repository_root: str | Path, signer: Signer, verifier: Verifier,
    runner: CommandRunner = _command, now: dt.datetime | None = None,
) -> tuple[dict[str, Any], str]:
    """Create a draft PR, add its signed activation commitment, and mark it ready.

    The bootstrap commit is content-free and exists only because GitHub cannot open a PR from a ref
    with no diff.  This function never calls ``gh pr merge`` and never pushes to ``main``.
    """

    verify_candidate_hash(candidate)
    if PROMOTION_BRANCH.fullmatch(branch) is None:
        raise SemanticMemoryError("semantic-promotion-branch-invalid")
    root = Path(repository_root).resolve()
    if runner(["git", "rev-parse", "--show-toplevel"], root) != str(root):
        raise SemanticMemoryError("semantic-promotion-repository-root-invalid")
    with tempfile.TemporaryDirectory(prefix="memory-promotion-") as temporary:
        worktree = Path(temporary) / "worktree"
        added = False
        try:
            runner(["git", "worktree", "add", "-b", branch, str(worktree), "origin/main"], root)
            added = True
            pending = worktree / "frameworks" / "memory" / "activations" / ".pending" / (
                candidate["candidate_sha256"].removeprefix("sha256:") + ".json"
            )
            pending.parent.mkdir(parents=True, exist_ok=True)
            pending.write_bytes(canonical_json_bytes({
                "schema": "memory-promotion-bootstrap/v1", "candidate_kind": "semantic",
                "candidate_sha256": candidate["candidate_sha256"],
                "activation_content_sha256": lesson["lesson_sha256"], "branch": branch,
            }))
            runner(["git", "add", "--", str(pending.relative_to(worktree))], worktree)
            runner(["git", "commit", "-m", f"Authorize semantic candidate {candidate['candidate_id']}"], worktree)
            runner(["git", "push", "-u", "origin", branch], worktree)
            pr_url = runner([
                "gh", "pr", "create", "--draft", "--base", "main", "--head", branch,
                "--title", f"Promote semantic memory {candidate['candidate_id']}",
                "--body", (
                    "Automated, content-free semantic activation commitment. "
                    "Canonical operational memory remains outside Git."
                ),
            ], worktree)
            match = re.search(r"/pull/(?P<number>[1-9][0-9]*)/?$", pr_url)
            if match is None:
                raise SemanticMemoryError("semantic-promotion-pr-number-unresolved")
            number = int(match.group("number"))
            manifest = build_promotion_manifest(
                candidate, lesson, reviews=reviews, author=author, branch=branch,
                pull_request=number, signer=signer, verifier=verifier, now=now,
            )
            activation = (
                worktree / "frameworks" / "memory" / "activations" / "semantic"
                / f"{manifest['manifest_id']}.json"
            )
            activation.parent.mkdir(parents=True, exist_ok=True)
            activation.write_bytes(canonical_json_bytes(manifest))
            pending.unlink()
            runner([
                "git", "add", "--", str(activation.relative_to(worktree)),
                str(pending.relative_to(worktree)),
            ], worktree)
            runner(["git", "commit", "-m", f"Bind semantic activation to PR #{number}"], worktree)
            runner(["git", "push", "origin", branch], worktree)
            runner(["gh", "pr", "ready", str(number)], worktree)
            return manifest, pr_url
        finally:
            if added:
                try:
                    runner(["git", "worktree", "remove", "--force", str(worktree)], root)
                except SemanticMemoryError:
                    pass


def verify_merged_promotion(
    manifest: Mapping[str, Any], *, repository_root: str | Path,
    verifier: Verifier, runner: CommandRunner = _command,
) -> dict[str, str]:
    """Require the exact signed manifest to exist in a PR merged to ``origin/main``."""

    errors = validate_contract(manifest)
    if errors or not verify_signed(
        manifest, hash_field="manifest_sha256", verifier=verifier,
    ):
        raise SemanticMemoryError("semantic-promotion-manifest-invalid")
    root = Path(repository_root).resolve()
    raw = runner([
        "gh", "pr", "view", str(manifest["pull_request"]),
        "--json", "state,mergedAt,mergeCommit,headRefName,baseRefName",
    ], root)
    try:
        value = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise SemanticMemoryError("semantic-promotion-pr-status-invalid") from exc
    commit = value.get("mergeCommit") if isinstance(value, Mapping) else None
    if (
        not isinstance(value, Mapping)
        or value.get("state") != "MERGED"
        or not isinstance(value.get("mergedAt"), str)
        or value.get("headRefName") != manifest.get("branch")
        or value.get("baseRefName") != "main"
        or not isinstance(commit, Mapping)
        or re.fullmatch(r"[0-9a-f]{40}(?:[0-9a-f]{24})?", str(commit.get("oid"))) is None
    ):
        raise SemanticMemoryError("semantic-promotion-pr-not-merged-to-main")
    relative = (
        "frameworks/memory/activations/semantic/"
        f"{manifest['manifest_id']}.json"
    )
    committed = runner(["git", "show", f"{commit['oid']}:{relative}"], root)
    try:
        committed_manifest = json.loads(committed)
    except json.JSONDecodeError as exc:
        raise SemanticMemoryError("semantic-promotion-commitment-invalid") from exc
    if (
        not isinstance(committed_manifest, Mapping)
        or canonical_json_bytes(committed_manifest) != canonical_json_bytes(manifest)
    ):
        raise SemanticMemoryError("semantic-promotion-commitment-mismatch")
    runner(["git", "merge-base", "--is-ancestor", str(commit["oid"]), "origin/main"], root)
    return {"merged_at": value["mergedAt"], "merge_commit": commit["oid"]}


def merged_promotion_verifier(
    *, repository_root: str | Path, verifier: Verifier,
    runner: CommandRunner = _command,
) -> Callable[[Mapping[str, Any], object | None], bool]:
    """Build the controlled writer's independent signature-and-merge verifier."""

    def verify(manifest: Mapping[str, Any], principal: object | None) -> bool:
        del principal
        try:
            verify_merged_promotion(
                manifest, repository_root=repository_root, verifier=verifier,
                runner=runner,
            )
        except (OSError, SemanticMemoryError, ValueError):
            return False
        return True

    return verify


def build_activation_request(
    candidate: Mapping[str, Any], lesson: Mapping[str, Any], manifest: Mapping[str, Any],
    *, expected_head: str, service_id: str, verifier: Verifier,
    prior_event: Mapping[str, Any] | None = None,
    store_bindings: Sequence[Mapping[str, Any]] = (), now: dt.datetime | None = None,
) -> tuple[dict[str, Any], dict[str, Any]]:
    errors = validate_promotion_bundle(candidate, lesson, manifest)
    if errors:
        raise SemanticMemoryError("semantic-activation-bundle-invalid: " + "; ".join(errors[:12]))
    if not verify_signed(manifest, hash_field="manifest_sha256", verifier=verifier):
        raise SemanticMemoryError("semantic-promotion-manifest-signature-invalid")
    if not HASH_RE.fullmatch(expected_head) or SAFE_ID.fullmatch(service_id) is None:
        raise SemanticMemoryError("semantic-activation-control-binding-invalid")
    activated_at = utc_now(now)
    try:
        if dt.datetime.fromisoformat(activated_at.replace("Z", "+00:00")) < dt.datetime.fromisoformat(
            str(lesson["activated_at"]).replace("Z", "+00:00")
        ):
            raise SemanticMemoryError("semantic-activation-cannot-predate-approval")
    except ValueError as exc:
        raise SemanticMemoryError("semantic-activation-time-invalid") from exc
    prior_ids: list[str] = []
    operation = "semantic-promotion"
    if prior_event is not None:
        if prior_event.get("event_type") != "semantic.activated":
            raise SemanticMemoryError("semantic-supersession-target-invalid")
        prior_lesson = prior_event.get("payload")
        expected_ref = lesson.get("supersedes")
        if (
            not isinstance(prior_lesson, Mapping)
            or not isinstance(expected_ref, Mapping)
            or expected_ref.get("record_id") != prior_lesson.get("lesson_id")
            or expected_ref.get("schema") != "memory-semantic-lesson/v1"
            or expected_ref.get("content_sha256") != prior_lesson.get("lesson_sha256")
            or lesson.get("lesson_id") != prior_lesson.get("lesson_id")
            or lesson.get("version") != prior_lesson.get("version", 0) + 1
            or lesson.get("policy") != prior_event.get("policy")
        ):
            raise SemanticMemoryError("semantic-supersession-lineage-invalid")
        prior_ids = [str(prior_event["event_id"])]
        operation = "semantic-supersession"
    elif lesson.get("version") != 1 or lesson.get("supersedes") is not None:
        raise SemanticMemoryError("semantic-supersession-target-required")
    origins = [item for item in candidate["originating_episode_ids"] if EVENT_RE.fullmatch(item)]
    internal_subject = "entity:internal:memory-lesson-" + lesson["lesson_id"].rsplit("_", 1)[-1]
    subjects = sorted(set([
        internal_subject,
        *lesson["semantic"]["applicability"]["issuer_ids"],
        *lesson["semantic"]["applicability"]["listing_ids"],
    ]))
    event = {
        "schema": "memory-event/v1",
        "event_id": _event_id(manifest["manifest_sha256"]),
        "event_type": "semantic.activated",
        "subject_ids": subjects,
        "valid_time": copy.deepcopy(lesson["semantic"]["valid_time"]),
        "system_time": activated_at,
        "producer": {
            "kind": "system", "name": service_id, "runtime": "memory-semantic/v1",
            "model": None, "prompt_program_sha": None,
        },
        "run_id": _run_id(manifest["manifest_sha256"]),
        "trace_id": _trace_id(manifest["manifest_sha256"]),
        "payload": copy.deepcopy(dict(lesson)),
        "evidence_refs": sorted(set(
            lesson["semantic"]["supporting_evidence"]
            + lesson["semantic"]["contradicting_evidence"]
        )),
        "derived_from": origins,
        "supersedes": prior_ids,
        "integrity": {
            "payload_sha256": canonical_sha256(lesson), "signature": None,
        },
        "policy": copy.deepcopy(lesson["policy"]),
    }
    event_sha = sha(event)
    manifest_json = canonical_json_bytes(manifest).decode("utf-8")
    request = {
        "schema": "memory-controlled-write-request/v1",
        "request_id": _memory_id("write-request", event_sha),
        "idempotency_key": f"semantic:{manifest['manifest_sha256']}",
        "expected_head": expected_head,
        "submitted_at": activated_at,
        "operation": operation,
        "event_sha256": event_sha,
        "event_canonical_json": canonical_json_bytes(event).decode("utf-8"),
        "store_bindings": [copy.deepcopy(dict(item)) for item in store_bindings],
        "shadow_feedback_sha256": None,
        "shadow_feedback_canonical_json": None,
        "promotion_manifest_sha256": sha(manifest),
        "promotion_manifest_canonical_json": manifest_json,
    }
    try:
        from memory_phase5_contract import validate_write_request
    except ImportError:  # pragma: no cover
        from scripts.memory_phase5_contract import validate_write_request
    request_errors = validate_write_request(request)
    if request_errors:
        raise SemanticMemoryError("semantic-activation-request-invalid: " + "; ".join(request_errors[:12]))
    return event, request


class SemanticState:
    """Owner-only inert queues; no method exposes active canonical memory."""

    def __init__(
        self, root: str | Path, *, repository_root: str | Path,
        protected_cipher: AESGCMSIVEnvelopeCipher | None = None,
    ) -> None:
        self.root = Path(root).resolve()
        repository = Path(repository_root).resolve()
        try:
            self.root.relative_to(repository)
        except ValueError:
            pass
        else:
            raise SemanticMemoryError("semantic-operational-state-must-live-outside-git")
        self.root.mkdir(parents=True, exist_ok=True, mode=0o700)
        if os.name == "posix":
            os.chmod(self.root, 0o700)
        self._protected_cipher = protected_cipher

    @staticmethod
    def _protected(policy: Mapping[str, Any]) -> bool:
        return policy.get("classification") in PROTECTED_CLASSIFICATIONS

    @staticmethod
    def _queue_aad(
        *, record_kind: str, record_id: str, content_sha256: str,
        policy: Mapping[str, Any],
    ) -> dict[str, Any]:
        return {
            "schema": "memory-semantic-protected-queue-aad/v1",
            "record_kind": record_kind,
            "record_id": record_id,
            "content_sha256": content_sha256,
            "policy": copy.deepcopy(dict(policy)),
        }

    def put_record(
        self, category: str, record_id: str, value: Mapping[str, Any], *,
        policy: Mapping[str, Any],
    ) -> Path:
        category_parts = category.split("/")
        if (
            not category_parts
            or any(
                part in {"", ".", ".."}
                or re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}", part) is None
                for part in category_parts
            )
            or re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,191}", record_id) is None
        ):
            raise SemanticMemoryError("semantic-state-record-path-invalid")
        if not self._protected(policy):
            path = self.root / category / f"{record_id}.json"
            if path.exists():
                if _safe_regular(path) != canonical_json_bytes(value):
                    raise SemanticMemoryError("semantic-state-record-id-conflict")
                return path
            _atomic_private_write(path, value)
            return path
        if self._protected_cipher is None:
            raise SemanticMemoryError("protected-semantic-state-requires-encryption")
        content = canonical_json_bytes(value)
        content_sha256 = sha(content)
        aad = self._queue_aad(
            record_kind=category, record_id=record_id,
            content_sha256=content_sha256, policy=policy,
        )
        sealed = self._protected_cipher.encrypt(
            content, associated_data=canonical_json_bytes(aad)
        )
        key_ref = f"keys/{category}/{record_id}.json"
        wrapper = {
            "schema": "memory-semantic-protected-queue/v1",
            "record_kind": category,
            "record_id": record_id,
            "content_sha256": content_sha256,
            "policy": copy.deepcopy(dict(policy)),
            "aad_sha256": sha(aad),
            "key_ref": key_ref,
            "ciphertext": base64.urlsafe_b64encode(sealed.ciphertext).decode("ascii").rstrip("="),
        }
        path = self.root / category / f"{record_id}.sealed.json"
        if path.exists():
            if canonical_json_bytes(self.read_record(path)) != content:
                raise SemanticMemoryError("semantic-state-record-id-conflict")
            return path
        _atomic_private_write(
            self.root / key_ref,
            {
                "schema": "memory-semantic-protected-key/v1",
                "record_id": record_id,
                "key_envelope": sealed.key_envelope,
            },
        )
        _atomic_private_write(path, wrapper)
        return path

    def read_record(self, path: str | Path) -> dict[str, Any]:
        candidate = Path(path).resolve()
        try:
            candidate.relative_to(self.root)
        except ValueError as exc:
            raise SemanticMemoryError("semantic-state-read-outside-root") from exc
        try:
            wrapper = json.loads(_safe_regular(candidate))
        except (OSError, UnicodeError, json.JSONDecodeError) as exc:
            raise SemanticMemoryError("semantic-state-record-invalid") from exc
        if not isinstance(wrapper, dict):
            raise SemanticMemoryError("semantic-state-record-invalid")
        if wrapper.get("schema") != "memory-semantic-protected-queue/v1":
            return wrapper
        if self._protected_cipher is None:
            raise SemanticMemoryError("protected-semantic-state-requires-encryption")
        fields = {
            "schema", "record_kind", "record_id", "content_sha256", "policy",
            "aad_sha256", "key_ref", "ciphertext",
        }
        if set(wrapper) != fields or not self._protected(wrapper.get("policy", {})):
            raise SemanticMemoryError("semantic-protected-record-open-or-invalid")
        key_ref = wrapper.get("key_ref")
        if not isinstance(key_ref, str):
            raise SemanticMemoryError("semantic-protected-key-ref-invalid")
        key_path = (self.root / key_ref).resolve()
        try:
            key_path.relative_to(self.root / "keys")
            key_record = json.loads(_safe_regular(key_path))
        except (OSError, ValueError, UnicodeError, json.JSONDecodeError) as exc:
            raise SemanticMemoryError("semantic-protected-key-unavailable") from exc
        if (
            not isinstance(key_record, dict)
            or set(key_record) != {"schema", "record_id", "key_envelope"}
            or key_record.get("schema") != "memory-semantic-protected-key/v1"
            or key_record.get("record_id") != wrapper.get("record_id")
            or not isinstance(key_record.get("key_envelope"), dict)
        ):
            raise SemanticMemoryError("semantic-protected-key-invalid")
        aad = self._queue_aad(
            record_kind=str(wrapper["record_kind"]),
            record_id=str(wrapper["record_id"]),
            content_sha256=str(wrapper["content_sha256"]),
            policy=wrapper["policy"],
        )
        if wrapper.get("aad_sha256") != sha(aad):
            raise SemanticMemoryError("semantic-protected-aad-mismatch")
        try:
            ciphertext = base64.b64decode(
                str(wrapper["ciphertext"]) + "=" * (-len(str(wrapper["ciphertext"])) % 4),
                altchars=b"-_", validate=True,
            )
            plaintext = self._protected_cipher.decrypt(
                ciphertext, key_record["key_envelope"],
                associated_data=canonical_json_bytes(aad),
            )
            if sha(plaintext) != wrapper.get("content_sha256"):
                raise SemanticMemoryError("semantic-protected-content-mismatch")
            value = json.loads(plaintext)
        except (binascii.Error, ValueError, UnicodeError, json.JSONDecodeError) as exc:
            raise SemanticMemoryError("semantic-protected-decryption-failed") from exc
        if not isinstance(value, dict):
            raise SemanticMemoryError("semantic-protected-content-invalid")
        return value

    def put_candidate(self, candidate: Mapping[str, Any]) -> Path:
        verify_candidate_hash(candidate)
        return self.put_record(
            "candidates/semantic", str(candidate["candidate_id"]), candidate,
            policy=candidate["policy"],
        )

    def put_verification(
        self, review: Mapping[str, Any], *, policy: Mapping[str, Any],
    ) -> Path:
        return self.put_record(
            "verifications/semantic", str(review["verification_id"]), review,
            policy=policy,
        )


__all__ = [
    "SemanticMemoryError", "SemanticState", "build_activation_request", "build_candidate",
    "build_lesson", "build_promotion_manifest", "open_promotion_pull_request",
    "merged_promotion_verifier", "semantic_signer", "semantic_verifier", "verify_candidate",
    "verify_merged_promotion",
    "seed_reviewed_candidates",
    "verify_candidate_hash", "verify_signed",
    "validate_verification",
]
