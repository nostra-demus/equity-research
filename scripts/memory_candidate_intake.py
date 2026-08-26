#!/usr/bin/env python3
"""Supervisor-only bridge from analytical suggestions to inert candidate queues.

Analytical agents return small, closed suggestion drafts.  They never choose their canonical
creator, provenance, ID, timestamp, or hash and never receive a candidate-store credential.  The
supervisor derives those fields from the attested task, verifies evidence and policy against the
frozen projection, and only then writes the existing semantic/playbook candidate contracts to the
owner-only queues.
"""
from __future__ import annotations

import copy
import datetime as dt
import json
import re
import sqlite3
from pathlib import Path
from typing import Any, Mapping, Sequence

try:
    from memory_crypto import AESGCMSIVEnvelopeCipher
    from memory_incident_control import candidate_intake_guard
    from memory_projection import policy_inheritance_errors
    from memory_runtime import load_master_key_file
    from memory_semantic import SemanticMemoryError, SemanticState, build_candidate as build_semantic_candidate
    from memory_procedural import (
        ProceduralMemoryError,
        ProceduralState,
        build_candidate as build_playbook_candidate,
    )
    from research_memory_run import sha, utc_now
except ImportError:  # pragma: no cover - package-style imports
    from scripts.memory_crypto import AESGCMSIVEnvelopeCipher
    from scripts.memory_incident_control import candidate_intake_guard
    from scripts.memory_projection import policy_inheritance_errors
    from scripts.memory_runtime import load_master_key_file
    from scripts.memory_semantic import SemanticMemoryError, SemanticState, build_candidate as build_semantic_candidate
    from scripts.memory_procedural import (
        ProceduralMemoryError,
        ProceduralState,
        build_candidate as build_playbook_candidate,
    )
    from scripts.research_memory_run import sha, utc_now


EVIDENCE_RE = re.compile(
    r"evidence:sha256:(?P<digest>[0-9a-f]{64})#"
    r"(?P<locator>[A-Za-z0-9][A-Za-z0-9._~:/?&=,+-]{0,255})"
)
PROTECTED = frozenset({"licensed", "confidential", "restricted"})
SEMANTIC_FIELDS = frozenset({"kind", "candidate_type", "source_basis", "semantic", "policy"})
PROCEDURAL_FIELDS = frozenset({"kind", "playbook", "policy"})
ALLOWED_AGENT_SEMANTIC_BASES = frozenset({"current-evidence-extraction", "authoritative-policy"})
MAX_SUGGESTIONS = 32


class CandidateIntakeError(ValueError):
    """A task suggestion cannot enter even the inert review queue."""


def _provider_events(
    connection: sqlite3.Connection, evidence_ref: str,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], bool]:
    match = EVIDENCE_RE.fullmatch(evidence_ref)
    if match is None:
        raise CandidateIntakeError("candidate-intake-evidence-ref-invalid")
    digest, locator = match.group("digest"), match.group("locator")
    artifact_rows = connection.execute(
        """SELECT e.canonical_event FROM artifacts a
             JOIN events e ON e.event_id=a.source_event_id
            WHERE a.sha256=? ORDER BY e.system_time,e.event_id""",
        (digest,),
    ).fetchall()
    locator_rows = connection.execute(
        """SELECT e.canonical_event FROM artifact_locators l
             JOIN events e ON e.event_id=l.source_event_id
            WHERE l.sha256=? AND l.locator=? ORDER BY e.system_time,e.event_id""",
        (digest, locator),
    ).fetchall()
    if not artifact_rows or not locator_rows:
        raise CandidateIntakeError("candidate-intake-evidence-unresolved-in-frozen-projection")
    exact_span = bool(connection.execute(
        """SELECT 1 FROM artifact_locators l
             JOIN typed_payloads t ON t.event_id=l.source_event_id
            WHERE l.sha256=? AND l.locator=? AND t.payload_schema IN
                  ('memory-evidence-span/v1','memory-evidence-span/v2') LIMIT 1""",
        (digest, locator),
    ).fetchone())
    return (
        [json.loads(str(row[0])) for row in artifact_rows],
        [json.loads(str(row[0])) for row in locator_rows],
        exact_span,
    )


def _semantic_origins(
    database_path: Path, *, semantic: Mapping[str, Any], candidate_type: str,
    candidate_policy: Mapping[str, Any], current_evidence_refs: Sequence[str],
    required_subject_ids: Sequence[str] = (),
) -> list[str]:
    supporting = semantic.get("supporting_evidence")
    if (
        not isinstance(supporting, list)
        or not supporting
        or any(not isinstance(item, str) for item in supporting)
        or not set(supporting).issubset(set(current_evidence_refs))
    ):
        raise CandidateIntakeError("candidate-intake-semantic-evidence-not-attested")
    connection = sqlite3.connect(f"file:{database_path.resolve().as_posix()}?mode=ro&immutable=1", uri=True)
    origins: list[str] = []
    try:
        for evidence_ref in supporting:
            artifact_events, locator_events, exact_span = _provider_events(connection, evidence_ref)
            if candidate_type == "fact" and not exact_span:
                raise CandidateIntakeError("candidate-intake-fact-requires-exact-evidence-span")
            for provider in (*artifact_events, *locator_events):
                if required_subject_ids and not set(required_subject_ids).issubset(
                    set(provider.get("subject_ids", []))
                ):
                    raise CandidateIntakeError("candidate-intake-evidence-issuer-listing-mismatch")
                inherited = policy_inheritance_errors(candidate_policy, provider)
                if inherited:
                    raise CandidateIntakeError(
                        "candidate-intake-policy-widens-evidence: " + "; ".join(sorted(set(inherited)))
                    )
            # All possible providers were checked above.  Bind the newest deterministic pair so an
            # older, weaker assertion cannot be selected to launder policy or issuer identity.
            origins.extend((artifact_events[-1]["event_id"], locator_events[-1]["event_id"]))
    finally:
        connection.close()
    return list(dict.fromkeys(origins))


def _exact_issuer_scope(semantic: Mapping[str, Any], receipt: Mapping[str, Any]) -> None:
    if semantic.get("lesson_kind") != "exact-issuer":
        return
    listing = receipt.get("issuer_listing")
    applicability = semantic.get("applicability")
    if not isinstance(listing, Mapping) or not isinstance(applicability, Mapping):
        raise CandidateIntakeError("candidate-intake-exact-issuer-scope-invalid")
    if (
        applicability.get("issuer_ids") != [listing.get("issuer_id")]
        or applicability.get("listing_ids") != [listing.get("listing_id")]
    ):
        raise CandidateIntakeError("candidate-intake-exact-issuer-scope-mismatch")


def _procedural_core(draft: Mapping[str, Any], *, task_episode_id: str) -> dict[str, Any]:
    raw = draft.get("playbook")
    if not isinstance(raw, Mapping):
        raise CandidateIntakeError("candidate-intake-playbook-draft-invalid")
    forbidden = {
        "originating_episode_ids", "counterexample_ids", "validation_case_ids", "measured_effect",
    }
    if forbidden.intersection(raw):
        raise CandidateIntakeError("candidate-intake-playbook-supervisor-fields-forbidden")
    core = copy.deepcopy(dict(raw))
    key = core.get("procedure_key")
    if not isinstance(key, str) or re.fullmatch(r"[a-z][a-z0-9.-]{0,127}", key) is None:
        raise CandidateIntakeError("candidate-intake-playbook-procedure-key-invalid")
    suffix = sha({"task_episode_id": task_episode_id, "procedure_key": key}).removeprefix("sha256:")[:12]
    cases = [
        f"{key}-{suffix}-origin", f"{key}-{suffix}-held-out-a",
        f"{key}-{suffix}-held-out-b", f"{key}-{suffix}-counterexample",
    ]
    core.update({
        "originating_episode_ids": [task_episode_id],
        "counterexample_ids": [cases[-1]],
        "validation_case_ids": cases,
        "measured_effect": {
            "metric": "pending-reviewed-replay", "baseline": 0, "candidate": 0,
            "sample_size": 1, "serious_error_regression": False,
        },
    })
    return core


def materialize_candidate_suggestions(
    drafts: object, *, receipt: Mapping[str, Any], agent_id: str, task_episode_id: str,
    current_evidence_refs: Sequence[str], database_path: str | Path,
    now: dt.datetime | None = None,
) -> list[dict[str, Any]]:
    """Turn agent-authored cores into existing inert candidate contracts."""

    if not isinstance(drafts, list) or len(drafts) > MAX_SUGGESTIONS:
        raise CandidateIntakeError("candidate-intake-suggestion-list-invalid")
    if any(isinstance(item, str) for item in drafts):
        raise CandidateIntakeError("candidate-intake-unmaterialized-hash-denied")
    created_by = {"kind": "agent", "id": agent_id}
    created_at = now or dt.datetime.now(dt.timezone.utc)
    if created_at.tzinfo is None or created_at.utcoffset() is None:
        raise CandidateIntakeError("candidate-intake-clock-invalid")
    provider_access = receipt.get("provider_access")
    classifications = (
        provider_access.get("classifications")
        if isinstance(provider_access, Mapping)
        else None
    )
    if not isinstance(classifications, list) or any(
        not isinstance(item, str) for item in classifications
    ):
        raise CandidateIntakeError("candidate-intake-provider-access-invalid")
    authorized = set(classifications)
    candidates: list[dict[str, Any]] = []
    for draft in drafts:
        if not isinstance(draft, Mapping):
            raise CandidateIntakeError("candidate-intake-suggestion-invalid")
        kind = draft.get("kind")
        expected = SEMANTIC_FIELDS if kind == "semantic" else PROCEDURAL_FIELDS if kind == "procedural" else None
        if expected is None or set(draft) != expected:
            raise CandidateIntakeError("candidate-intake-suggestion-open-or-invalid")
        policy = draft.get("policy")
        if not isinstance(policy, Mapping) or policy.get("classification") not in authorized:
            raise CandidateIntakeError("candidate-intake-policy-not-authorized")
        if kind == "semantic":
            candidate_type = draft.get("candidate_type")
            source_basis = draft.get("source_basis")
            semantic = draft.get("semantic")
            if (
                candidate_type not in {"fact", "lesson"}
                or source_basis not in ALLOWED_AGENT_SEMANTIC_BASES
                or not isinstance(semantic, Mapping)
            ):
                raise CandidateIntakeError("candidate-intake-semantic-draft-invalid")
            if source_basis == "authoritative-policy" and semantic.get("lesson_kind") != "official-policy":
                raise CandidateIntakeError("candidate-intake-policy-lesson-kind-invalid")
            if source_basis == "current-evidence-extraction" and semantic.get("lesson_kind") != "exact-issuer":
                raise CandidateIntakeError("candidate-intake-current-extraction-scope-invalid")
            _exact_issuer_scope(semantic, receipt)
            listing = receipt.get("issuer_listing")
            if semantic.get("lesson_kind") == "exact-issuer" and not isinstance(listing, Mapping):
                raise CandidateIntakeError("candidate-intake-exact-issuer-scope-invalid")
            origins = _semantic_origins(
                Path(database_path), semantic=semantic, candidate_type=str(candidate_type),
                candidate_policy=policy, current_evidence_refs=current_evidence_refs,
                required_subject_ids=(
                    [
                        str(listing.get("issuer_id")),
                        str(listing.get("listing_id")),
                    ]
                    if isinstance(listing, Mapping)
                    and semantic.get("lesson_kind") == "exact-issuer"
                    else []
                ),
            )
            try:
                candidate = build_semantic_candidate(
                    candidate_type=str(candidate_type), source_basis=str(source_basis),
                    semantic=semantic, originating_episode_ids=origins,
                    created_by=created_by, policy=policy, now=created_at,
                )
            except SemanticMemoryError as exc:
                raise CandidateIntakeError(str(exc)) from exc
        else:
            if policy.get("classification") == "public":
                raise CandidateIntakeError("candidate-intake-playbook-must-inherit-internal-task-policy")
            try:
                candidate = build_playbook_candidate(
                    playbook=_procedural_core(draft, task_episode_id=task_episode_id),
                    created_by=created_by, policy=policy, now=created_at,
                )
            except ProceduralMemoryError as exc:
                raise CandidateIntakeError(str(exc)) from exc
        candidates.append(candidate)
    unique: dict[str, dict[str, Any]] = {}
    for candidate in candidates:
        candidate_hash = str(candidate["candidate_sha256"])
        if candidate_hash in unique and unique[candidate_hash] != candidate:
            raise CandidateIntakeError("candidate-intake-hash-conflict")
        unique[candidate_hash] = candidate
    return list(unique.values())


def intake_attested_candidates(
    candidates: Sequence[Mapping[str, Any]], *, state_root: str | Path,
    repository_root: str | Path, protected_master_key: str | Path | None,
    protected_key_id: str | None, attestation: Mapping[str, Any], output_gate_passed: bool,
) -> list[Path]:
    """Queue candidates only after both the memory and ordinary output contracts passed."""

    if not candidates:
        return []
    if attestation.get("valid") is not True or output_gate_passed is not True:
        raise CandidateIntakeError("candidate-intake-requires-valid-task-attestation")
    if (protected_master_key is None) != (protected_key_id is None):
        raise CandidateIntakeError("candidate-intake-protected-key-configuration-incomplete")
    policies: list[Mapping[str, Any]] = []
    for item in candidates:
        policy = item.get("policy") if isinstance(item, Mapping) else None
        if not isinstance(policy, Mapping):
            raise CandidateIntakeError("candidate-intake-materialized-candidate-invalid")
        policies.append(policy)
    protected = any(policy.get("classification") in PROTECTED for policy in policies)
    if protected and protected_master_key is None:
        raise CandidateIntakeError("candidate-intake-protected-candidate-requires-encryption")
    cipher = (
        AESGCMSIVEnvelopeCipher(
            load_master_key_file(Path(protected_master_key)), key_id=str(protected_key_id),
        )
        if protected_master_key is not None
        else None
    )
    semantic = SemanticState(
        state_root, repository_root=repository_root, protected_cipher=cipher,
    )
    procedural = ProceduralState(
        state_root, repository_root=repository_root, protected_cipher=cipher,
    )
    paths: list[Path] = []
    with candidate_intake_guard(state_root, candidate_count=len(candidates)):
        for candidate in candidates:
            if candidate.get("schema") == "memory-semantic-candidate/v1":
                paths.append(semantic.put_candidate(candidate))
            elif candidate.get("schema") == "memory-playbook-candidate/v1":
                paths.append(procedural.put_candidate(candidate))
            else:
                raise CandidateIntakeError("candidate-intake-materialized-schema-invalid")
    return paths


def build_intake_receipt(
    *, run_id: str, task_id: str, task_episode_id: str, use_id: str,
    candidates: Sequence[Mapping[str, Any]], now: dt.datetime | None = None,
) -> dict[str, Any]:
    rows = [
        {
            "candidate_kind": "semantic" if item["schema"] == "memory-semantic-candidate/v1" else "playbook",
            "candidate_id": item["candidate_id"],
            "candidate_sha256": item["candidate_sha256"],
        }
        for item in candidates
    ]
    value: dict[str, Any] = {
        "schema": "memory-candidate-intake-receipt/v1",
        "run_id": run_id,
        "task_id": task_id,
        "task_episode_id": task_episode_id,
        "use_id": use_id,
        "candidates": rows,
        "created_at": utc_now(now),
        "receipt_sha256": "sha256:" + "0" * 64,
    }
    value["receipt_sha256"] = sha({key: item for key, item in value.items() if key != "receipt_sha256"})
    return value


__all__ = [
    "CandidateIntakeError", "build_intake_receipt", "intake_attested_candidates",
    "materialize_candidate_suggestions",
]
