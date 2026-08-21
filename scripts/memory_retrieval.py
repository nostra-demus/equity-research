#!/usr/bin/env python3
"""Deterministic, policy-first hybrid retrieval and immutable context packets.

The SQLite projection is disposable and untrusted until its caller-supplied digest is
verified.  Candidate text is copied into a fresh in-memory FTS index only *after*
classification, retention, licence, entitlement, bitemporal, source-tier, and exact-byte
resolution checks.  Embeddings use the same eligible set and an injected local provider;
this module performs no network access.
"""
from __future__ import annotations

import copy
import datetime as dt
import hashlib
import json
import math
import re
import sqlite3
import uuid
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from fractions import Fraction
from pathlib import Path
from typing import Any, Iterable, Mapping, Protocol, Sequence

from canonical_json import canonical_json, canonical_json_bytes, canonical_sha256
from memory_contract import (
    CLASSIFICATIONS,
    parse_aware_datetime,
    validate_event,
    validate_object_manifest,
)
from memory_projection import (
    PROJECTION_SCHEMA,
    ProjectionError,
    ProjectionResult,
    _check_integrity_result,
    _normalized_datetime,
    _normalized_valid_boundary,
    _read_only_connection,
)


QUERY_SCHEMA = "memory-query-spec/v1"
PACKET_SCHEMA = "memory-context-packet/v1"
MANIFEST_SCHEMA = "memory-context-packet-manifest/v1"
COMPILER_VERSION = "memory-context-compiler/v1"
FUSION_VERSION = "deterministic-rrf/v1"
RERANK_VERSION = "evidence-aware-rerank/v1"
TOKEN_ESTIMATOR = "utf8-bytes-ceil-div-4/v1"
RRF_K = 60
_SHA256_RE = re.compile(r"^sha256:[0-9a-f]{64}$")
_BARE_SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
_MODULE_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$")
_EVENT_TYPE_RE = re.compile(r"^[a-z][a-z0-9_-]*(?:\.[a-z][a-z0-9_-]*)+$")
_TOKEN_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]*")
_OBJECT_ID_RE = re.compile(r"^object:sha256:[0-9a-f]{64}$")
_ACQUISITION_ID_RE = re.compile(r"^acquisition_[0-9a-f]{8}-[0-9a-f]{4}-[57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
_SOURCE_VERSION_ID_RE = re.compile(r"^source-version_[0-9a-f]{8}-[0-9a-f]{4}-[57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
_EVENT_ID_RE = re.compile(r"^evt_[0-9a-f]{8}-[0-9a-f]{4}-[57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
_RUN_ID_RE = re.compile(r"^run_[0-9a-f]{8}-[0-9a-f]{4}-[57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
_EVIDENCE_REF_RE = re.compile(r"^evidence:sha256:[0-9a-f]{64}#[A-Za-z0-9][A-Za-z0-9._~:/?&=,+-]{0,255}$")
_RECORD_TYPES = frozenset(
    {
        "memory-source/v1",
        "memory-source/v2",
        "memory-evidence-span/v1",
        "memory-evidence-span/v2",
        "memory-claim/v1",
        "memory-relationship/v1",
        "memory-extraction-artifact/v1",
        "legacy-adapter",
    }
)
_QUERY_FIELDS = frozenset(
    {
        "schema",
        "task",
        "requesting_module",
        "query_text",
        "subject_ids",
        "as_of_system_time",
        "valid_time",
        "permitted_source_tiers",
        "permitted_classifications",
        "event_types",
        "record_types",
        "reporting_basis",
        "currency",
        "metric",
        "segment",
        "max_results",
        "max_context_tokens",
    }
)
_RESOLUTION_FIELDS = frozenset(
    {
        "schema",
        "lane",
        "event_id",
        "repository_revision",
        "source_path",
        "source_locator",
        "object_id",
        "acquisition_id",
        "source_version_id",
        "manifest_sha256",
        "content_sha256",
        "byte_length",
        "media_type",
        "policy",
    }
)
_LEGACY_PAYLOAD_REQUIRED = frozenset(
    {
        "legacy_schema", "record_type", "source_path", "source_locator", "source_sha256",
        "identity_mapping", "time_mapping", "record_canonical_json", "record_sha256",
    }
)
_LEGACY_PAYLOAD_OPTIONAL = frozenset({"source_git_commit"})
_LEGACY_TIME_REQUIRED = frozenset(
    {
        "system_time_field", "system_time_precision", "system_time_trust",
        "valid_time_field", "valid_time_precision",
    }
)
_LEGACY_TIME_OPTIONAL = frozenset(
    {"git_receipt_time", "legacy_system_time_field", "legacy_system_time_precision"}
)
_CLASSIFICATION_DERIVATIVES = {
    "public": frozenset(CLASSIFICATIONS),
    "internal": frozenset({"internal", "licensed", "restricted", "confidential"}),
    "licensed": frozenset({"licensed", "confidential"}),
    "restricted": frozenset({"restricted", "confidential"}),
    "confidential": frozenset({"confidential"}),
}
_ABSTENTION_REASONS = frozenset(
    {
        "no-authorized-time-valid-resolvable-records",
        "no-records-match-closed-query-filters",
        "no-hybrid-candidates",
        "context-token-budget-cannot-fit-any-result",
    }
)
_LOGICAL_PROJECTION_TABLES = (
    "events", "subjects", "event_edges", "artifacts", "artifact_locators",
    "evidence_refs", "evidence_bindings", "record_bindings", "typed_payloads",
    "source_index", "evidence_span_index", "claim_index", "relationship_index",
    "identity_namespace_index", "identity_index", "identity_alias_index",
)


class RetrievalError(ValueError):
    """A request, dependency, or snapshot cannot produce a trusted packet."""


class RetrievalAccessDenied(RetrievalError, PermissionError):
    """The trusted access scope and requested scope have no permitted intersection."""


class ExactEvidenceVerifier(Protocol):
    """Trusted boundary which resolves bytes but returns only content-free metadata.

    Implementations may expose ``verify_event`` directly, or callers may pass a
    ``CompositeMemoryResolver`` for its supported legacy events.  A Phase 2 adapter can
    map a typed event to its exact object manifests and invoke the composite resolver.
    """

    def verify_event(
        self,
        event: Mapping[str, Any],
        *,
        principal: object | None,
        as_of_system_time: str,
        valid_time: Mapping[str, str],
        policy_evaluated_at: str,
    ) -> Sequence[object]:
        ...


class EvidenceCorpusResolutionError(FileNotFoundError):
    """A material event has no complete exact target in the supplied corpus."""


@dataclass(frozen=True)
class EvidenceResolutionTarget:
    """One complete resolver input bound to an optional declared evidence ref."""

    evidence_ref: str | None
    value: Mapping[str, Any]


class ClosedEvidenceManifestCorpus:
    """Immutable event-to-full-target binding for production exact resolution.

    Values must be complete ``memory-object-manifest/v1`` records or complete legacy
    adapter events. Hash-only object pointers are deliberately rejected: they cannot be
    passed safely to ``CompositeMemoryResolver``/``MemoryStore.find_object``.
    """

    def __init__(self, targets_by_event_id: Mapping[str, Sequence[Mapping[str, Any]]]) -> None:
        if not isinstance(targets_by_event_id, Mapping):
            raise RetrievalError("evidence manifest corpus must be an event mapping")
        stored: dict[str, tuple[EvidenceResolutionTarget, ...]] = {}
        for event_id, values in targets_by_event_id.items():
            if not isinstance(event_id, str) or not event_id or not isinstance(values, Sequence) or isinstance(values, (str, bytes)):
                raise RetrievalError("evidence manifest corpus has an invalid event binding")
            targets = []
            commitments = set()
            for value in values:
                if not isinstance(value, Mapping) or set(value) != {"evidence_ref", "value"}:
                    raise RetrievalError("evidence manifest corpus targets must be closed")
                evidence_ref = value.get("evidence_ref")
                if evidence_ref is not None and (
                    not isinstance(evidence_ref, str) or not evidence_ref or len(evidence_ref) > 2048
                ):
                    raise RetrievalError("evidence manifest corpus evidence_ref is invalid")
                target = value.get("value")
                if not isinstance(target, Mapping):
                    raise RetrievalError("evidence manifest corpus target must be a complete record")
                schema = target.get("schema")
                if schema == "memory-object-manifest/v1":
                    errors = validate_object_manifest(target)
                    if errors:
                        raise RetrievalError(
                            "evidence manifest corpus contains an invalid full manifest: "
                            + "; ".join(errors[:8])
                        )
                elif schema != "memory-event/v1":
                    raise RetrievalError(
                        "evidence manifest corpus accepts only full manifests or legacy events"
                    )
                cloned = copy.deepcopy(dict(target))
                commitment = (evidence_ref, canonical_sha256(cloned))
                if commitment in commitments:
                    raise RetrievalError("evidence manifest corpus contains a duplicate target")
                commitments.add(commitment)
                targets.append(EvidenceResolutionTarget(evidence_ref, cloned))
            stored[event_id] = tuple(sorted(targets, key=lambda item: (item.evidence_ref or "", canonical_json(item.value))))
        self._targets = stored
        self.corpus_sha256 = "sha256:" + canonical_sha256(
            {
                event_id: [
                    {"evidence_ref": item.evidence_ref, "value_sha256": "sha256:" + canonical_sha256(item.value)}
                    for item in targets
                ]
                for event_id, targets in sorted(stored.items())
            }
        )

    def targets_for_event(
        self,
        event: Mapping[str, Any],
        *,
        principal: object | None,
        as_of_system_time: str,
        valid_time: Mapping[str, str],
        policy_evaluated_at: str,
    ) -> tuple[EvidenceResolutionTarget, ...]:
        event_id = event.get("event_id")
        if not isinstance(event_id, str) or event_id not in self._targets:
            raise EvidenceCorpusResolutionError("no complete manifest/event corpus binding")
        return tuple(
            EvidenceResolutionTarget(item.evidence_ref, copy.deepcopy(dict(item.value)))
            for item in self._targets[event_id]
        )


class CompositeEvidenceVerifier:
    """Concrete bridge from material events to ``CompositeMemoryResolver``.

    Legacy adapter events resolve directly. Typed events require a
    ``ClosedEvidenceManifestCorpus`` (or equivalent provider) containing complete object
    manifests/legacy evidence events. Every declared evidence ref must be covered; v2
    object/acquisition/version/content identities are rechecked again by the compiler.
    """

    def __init__(self, resolver: object, corpus: object | None = None) -> None:
        if not hasattr(resolver, "resolve") or not callable(getattr(resolver, "resolve")):
            raise RetrievalError("composite evidence resolver must expose resolve")
        if corpus is not None and (
            not hasattr(corpus, "targets_for_event")
            or not callable(getattr(corpus, "targets_for_event"))
        ):
            raise RetrievalError("evidence corpus must expose targets_for_event")
        self._resolver = resolver
        self._corpus = corpus

    def verify_event(
        self,
        event: Mapping[str, Any],
        *,
        principal: object | None,
        as_of_system_time: str,
        valid_time: Mapping[str, str],
        policy_evaluated_at: str,
    ) -> Sequence[object]:
        if _record_type(event) == "legacy-adapter":
            return [self._resolver.resolve(event, principal=principal)]
        if self._corpus is None:
            raise EvidenceCorpusResolutionError(
                "typed material event resolution requires a complete manifest/event corpus"
            )
        targets = self._corpus.targets_for_event(
            event,
            principal=principal,
            as_of_system_time=as_of_system_time,
            valid_time=valid_time,
            policy_evaluated_at=policy_evaluated_at,
        )
        if not isinstance(targets, Sequence) or isinstance(targets, (str, bytes)) or not targets:
            raise EvidenceCorpusResolutionError("evidence corpus returned no complete targets")
        declared = set(event.get("evidence_refs", ()))
        covered: set[str] = set()
        resolved = []
        for target in targets:
            if not isinstance(target, EvidenceResolutionTarget):
                raise EvidenceCorpusResolutionError("evidence corpus returned an unsupported target")
            if target.evidence_ref is not None:
                if target.evidence_ref not in declared:
                    raise EvidenceCorpusResolutionError("evidence corpus returned an undeclared evidence ref")
                covered.add(target.evidence_ref)
            value = target.value
            if not isinstance(value, Mapping) or value.get("schema") not in {
                "memory-event/v1", "memory-object-manifest/v1",
            }:
                raise EvidenceCorpusResolutionError("evidence corpus target is incomplete")
            if value.get("schema") == "memory-object-manifest/v1":
                errors = validate_object_manifest(value)
                if errors:
                    raise EvidenceCorpusResolutionError("evidence corpus manifest failed validation")
            result = self._resolver.resolve(value, principal=principal)
            row, _content = _resolution_mapping(result)
            if target.evidence_ref is not None:
                match = re.fullmatch(r"evidence:sha256:([0-9a-f]{64})#(.+)", target.evidence_ref)
                if match is None or row["content_sha256"] != "sha256:" + match.group(1):
                    raise EvidenceCorpusResolutionError("resolved bytes do not match declared evidence digest")
                if row["lane"] == "legacy-git" and row.get("source_locator") != match.group(2):
                    raise EvidenceCorpusResolutionError("resolved legacy locator differs from evidence ref")
            resolved.append(result)
        if covered != declared:
            raise EvidenceCorpusResolutionError("not every declared evidence ref has a complete target")
        payload = event.get("payload")
        if isinstance(payload, Mapping) and payload.get("schema") in {
            "memory-source/v1", "memory-evidence-span/v1",
        }:
            expected_digest = payload.get("content_sha256") or payload.get("source_sha256")
            if isinstance(expected_digest, str) and not any(
                _resolution_mapping(item)[0]["content_sha256"] == expected_digest
                for item in resolved
            ):
                raise EvidenceCorpusResolutionError("v1 source/evidence bytes do not match their digest")
        return resolved


@dataclass(frozen=True)
class EmbeddingMetadata:
    provider: str
    model: str
    version: str
    dimensions: int

    def __post_init__(self) -> None:
        for name in ("provider", "model", "version"):
            value = getattr(self, name)
            if not isinstance(value, str) or not value or len(value) > 256:
                raise RetrievalError(f"embedding {name} must be a bounded nonempty string")
        if not isinstance(self.dimensions, int) or isinstance(self.dimensions, bool) or not 1 <= self.dimensions <= 4096:
            raise RetrievalError("embedding dimensions must be an integer from 1 to 4096")

    def to_dict(self) -> dict[str, Any]:
        return {
            "provider": self.provider,
            "model": self.model,
            "version": self.version,
            "dimensions": self.dimensions,
        }


class EmbeddingModel(Protocol):
    metadata: EmbeddingMetadata

    def embed(self, texts: Sequence[str]) -> Sequence[Sequence[float]]:
        ...


@dataclass(frozen=True)
class AccessScope:
    """Trusted, out-of-band authority.  Query fields can only narrow this value."""

    scope_id: str
    policy_version: str
    classifications: tuple[str, ...] = ("public",)
    source_tiers: tuple[int, ...] = tuple(range(1, 11))
    embedding_classifications: tuple[str, ...] = ("public",)
    entitlement_ids: frozenset[str] = field(default_factory=frozenset)
    principal: object | None = field(default=None, compare=False, repr=False)

    def __post_init__(self) -> None:
        if not isinstance(self.scope_id, str) or not _MODULE_RE.fullmatch(self.scope_id):
            raise RetrievalError("access scope_id is invalid")
        if not isinstance(self.policy_version, str) or not self.policy_version or len(self.policy_version) > 128:
            raise RetrievalError("access policy_version is invalid")
        classifications = tuple(self.classifications)
        if not classifications or len(set(classifications)) != len(classifications) or set(classifications) - set(CLASSIFICATIONS):
            raise RetrievalError("access classifications are empty, duplicated, or unknown")
        tiers = tuple(self.source_tiers)
        if not tiers or len(set(tiers)) != len(tiers) or any(
            not isinstance(item, int) or isinstance(item, bool) or not 1 <= item <= 10
            for item in tiers
        ):
            raise RetrievalError("access source_tiers are empty, duplicated, or invalid")
        embeddings = tuple(self.embedding_classifications)
        if len(set(embeddings)) != len(embeddings) or set(embeddings) - set(classifications):
            raise RetrievalError("embedding classifications must narrow access classifications")
        if not isinstance(self.entitlement_ids, frozenset) or not all(
            isinstance(item, str) and item and len(item) <= 512 for item in self.entitlement_ids
        ):
            raise RetrievalError("entitlement_ids must be a frozenset of bounded strings")
        object.__setattr__(self, "classifications", tuple(sorted(classifications)))
        object.__setattr__(self, "source_tiers", tuple(sorted(tiers)))
        object.__setattr__(self, "embedding_classifications", tuple(sorted(embeddings)))


def _closed_string(value: Any, *, field: str, maximum: int) -> str:
    if not isinstance(value, str) or not value or len(value) > maximum:
        raise RetrievalError(f"{field} must be a bounded nonempty string")
    return value


def _closed_string_list(
    value: Any, *, field: str, minimum: int = 0, maximum: int = 128
) -> tuple[str, ...]:
    if not isinstance(value, list) or not minimum <= len(value) <= maximum or not all(
        isinstance(item, str) and item and len(item) <= 256 for item in value
    ) or len(set(value)) != len(value):
        raise RetrievalError(f"{field} must be a bounded unique string array")
    return tuple(sorted(value))


def _date_boundary(value: Any, *, field: str, end: bool) -> tuple[str, dt.datetime]:
    if not isinstance(value, str):
        raise RetrievalError(f"{field} must be an ISO-8601 date or aware date-time")
    try:
        normalized = _normalized_valid_boundary(value, field=field, is_end=end)
        if normalized is None:
            raise ValueError("null boundary")
        parsed = parse_aware_datetime(normalized)
    except (ProjectionError, ValueError) as exc:
        raise RetrievalError(f"{field} must be an ISO-8601 date or aware date-time") from exc
    return normalized, parsed


@dataclass(frozen=True)
class QuerySpec:
    task: str
    requesting_module: str
    query_text: str
    subject_ids: tuple[str, ...]
    as_of_system_time: str
    valid_from: str
    valid_to: str
    permitted_source_tiers: tuple[int, ...]
    permitted_classifications: tuple[str, ...]
    event_types: tuple[str, ...]
    record_types: tuple[str, ...]
    reporting_basis: str | None
    currency: str | None
    metric: str | None
    segment: str | None
    max_results: int
    max_context_tokens: int

    @classmethod
    def from_dict(cls, value: Any) -> "QuerySpec":
        if not isinstance(value, Mapping) or set(value) != _QUERY_FIELDS:
            raise RetrievalError("query spec must contain exactly the memory-query-spec/v1 fields")
        if value.get("schema") != QUERY_SCHEMA:
            raise RetrievalError("query schema is unsupported")
        task = _closed_string(value.get("task"), field="task", maximum=256)
        module = _closed_string(value.get("requesting_module"), field="requesting_module", maximum=128)
        if _MODULE_RE.fullmatch(module) is None:
            raise RetrievalError("requesting_module is invalid")
        query_text = _closed_string(value.get("query_text"), field="query_text", maximum=4096)
        subjects = _closed_string_list(value.get("subject_ids"), field="subject_ids", minimum=1)
        try:
            as_of = _normalized_datetime(value.get("as_of_system_time"), field="as_of_system_time")
        except ProjectionError as exc:
            raise RetrievalError("as_of_system_time must be an aware ISO-8601 date-time") from exc
        valid = value.get("valid_time")
        if not isinstance(valid, Mapping) or set(valid) != {"from", "to"}:
            raise RetrievalError("valid_time must contain exactly from and to")
        valid_from, parsed_from = _date_boundary(valid.get("from"), field="valid_time.from", end=False)
        valid_to, parsed_to = _date_boundary(valid.get("to"), field="valid_time.to", end=True)
        if parsed_from > parsed_to:
            raise RetrievalError("valid_time.from must not be after valid_time.to")
        tiers_value = value.get("permitted_source_tiers")
        if not isinstance(tiers_value, list) or not 1 <= len(tiers_value) <= 10 or len(set(tiers_value)) != len(tiers_value) or any(
            not isinstance(item, int) or isinstance(item, bool) or not 1 <= item <= 10
            for item in tiers_value
        ):
            raise RetrievalError("permitted_source_tiers must be a unique nonempty subset of 1..10")
        classes = _closed_string_list(
            value.get("permitted_classifications"), field="permitted_classifications", minimum=1, maximum=5
        )
        if set(classes) - set(CLASSIFICATIONS):
            raise RetrievalError("permitted_classifications contains an unknown class")
        event_types = _closed_string_list(value.get("event_types"), field="event_types")
        if any(_EVENT_TYPE_RE.fullmatch(item) is None for item in event_types):
            raise RetrievalError("event_types contains an invalid event type")
        record_types = _closed_string_list(value.get("record_types"), field="record_types", minimum=1, maximum=32)
        if set(record_types) - _RECORD_TYPES:
            raise RetrievalError("record_types contains an unsupported record type")
        nullable: dict[str, str | None] = {}
        for name, maximum in (("reporting_basis", 128), ("currency", 3), ("metric", 128), ("segment", 256)):
            item = value.get(name)
            if item is not None:
                item = _closed_string(item, field=name, maximum=maximum)
            nullable[name] = item
        if nullable["currency"] is not None and re.fullmatch(r"[A-Z]{3}", nullable["currency"]) is None:
            raise RetrievalError("currency must be an uppercase ISO-style code or null")
        max_results = value.get("max_results")
        max_tokens = value.get("max_context_tokens")
        if not isinstance(max_results, int) or isinstance(max_results, bool) or not 1 <= max_results <= 100:
            raise RetrievalError("max_results must be an integer from 1 to 100")
        if not isinstance(max_tokens, int) or isinstance(max_tokens, bool) or not 64 <= max_tokens <= 200000:
            raise RetrievalError("max_context_tokens must be an integer from 64 to 200000")
        return cls(
            task=task,
            requesting_module=module,
            query_text=query_text,
            subject_ids=subjects,
            as_of_system_time=as_of,
            valid_from=valid_from,
            valid_to=valid_to,
            permitted_source_tiers=tuple(sorted(tiers_value)),
            permitted_classifications=classes,
            event_types=event_types,
            record_types=record_types,
            reporting_basis=nullable["reporting_basis"],
            currency=nullable["currency"],
            metric=nullable["metric"],
            segment=nullable["segment"],
            max_results=max_results,
            max_context_tokens=max_tokens,
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema": QUERY_SCHEMA,
            "task": self.task,
            "requesting_module": self.requesting_module,
            "query_text": self.query_text,
            "subject_ids": list(self.subject_ids),
            "as_of_system_time": self.as_of_system_time,
            "valid_time": {"from": self.valid_from, "to": self.valid_to},
            "permitted_source_tiers": list(self.permitted_source_tiers),
            "permitted_classifications": list(self.permitted_classifications),
            "event_types": list(self.event_types),
            "record_types": list(self.record_types),
            "reporting_basis": self.reporting_basis,
            "currency": self.currency,
            "metric": self.metric,
            "segment": self.segment,
            "max_results": self.max_results,
            "max_context_tokens": self.max_context_tokens,
        }


@dataclass(frozen=True)
class ContextPacketResult:
    packet: dict[str, Any]
    manifest: dict[str, Any]
    packet_bytes: bytes
    packet_sha256: str


@dataclass
class _Candidate:
    event: dict[str, Any]
    canonical_provenance: dict[str, Any]
    record_type: str
    record_id: str
    source_tiers: tuple[int, ...]
    resolutions: tuple[dict[str, Any], ...]
    search_text: str


def _record_type(event: Mapping[str, Any]) -> str:
    payload = event.get("payload")
    if isinstance(payload, Mapping) and payload.get("schema") in _RECORD_TYPES:
        return str(payload["schema"])
    producer = event.get("producer")
    if isinstance(producer, Mapping) and producer.get("kind") == "adapter":
        return "legacy-adapter"
    return "legacy-adapter"


def _packet_valid_endpoint(value: Any, *, field: str, is_end: bool) -> tuple[str, dt.datetime]:
    """Canonicalize one non-null packet valid-time endpoint and return its UTC clock."""
    if not isinstance(value, str):
        raise RetrievalError(f"{field} must be a date or timezone-aware date-time")
    if "T" not in value:
        try:
            parsed_date = dt.date.fromisoformat(value)
        except ValueError as exc:
            raise RetrievalError(f"{field} is not a canonical ISO-8601 date") from exc
        if parsed_date.isoformat() != value:
            raise RetrievalError(f"{field} is not a canonical ISO-8601 date")
        clock = dt.time.max if is_end else dt.time.min
        return value, dt.datetime.combine(parsed_date, clock, tzinfo=dt.timezone.utc)
    try:
        normalized = _normalized_valid_boundary(value, field=field, is_end=is_end)
    except ProjectionError as exc:
        raise RetrievalError(f"{field} is not a timezone-aware date-time") from exc
    if normalized is None:
        raise RetrievalError(f"{field} cannot be null")
    return normalized, parse_aware_datetime(normalized)


def _packet_payload(event: Mapping[str, Any], record_type: str) -> dict[str, Any]:
    """Return a protocol-owned payload view without an open legacy JSON subtree."""
    payload = event.get("payload")
    if not isinstance(payload, Mapping):
        raise RetrievalError("event payload is not an object")
    if record_type != "legacy-adapter":
        return copy.deepcopy(dict(payload))
    required = {
        "legacy_schema", "record_type", "source_path", "source_locator", "source_sha256",
        "identity_mapping", "time_mapping", "record",
    }
    if not required.issubset(payload):
        raise RetrievalError("legacy event payload lacks its required adapter fields")
    identity = payload.get("identity_mapping")
    time_mapping = payload.get("time_mapping")
    if not isinstance(identity, Mapping) or not isinstance(time_mapping, Mapping):
        raise RetrievalError("legacy event mapping metadata is invalid")
    record_text = canonical_json(payload["record"])
    view = {
        "legacy_schema": payload["legacy_schema"],
        "record_type": payload["record_type"],
        "source_path": payload["source_path"],
        "source_locator": payload["source_locator"],
        "source_sha256": payload["source_sha256"],
        "identity_mapping": {
            "strategy": identity.get("strategy"),
            "opaque_uuid_namespace": identity.get("opaque_uuid_namespace"),
            "aliases_preserved_under": "record_canonical_json",
        },
        "time_mapping": copy.deepcopy(dict(time_mapping)),
        "record_canonical_json": record_text,
        "record_sha256": "sha256:" + hashlib.sha256(record_text.encode("utf-8")).hexdigest(),
    }
    if "source_git_commit" in payload:
        view["source_git_commit"] = payload["source_git_commit"]
    return view


def _verify_packet_payload(entry: Mapping[str, Any]) -> None:
    payload = entry.get("payload")
    if not isinstance(payload, Mapping):
        raise RetrievalError("context packet payload is not an object")
    record_type = entry.get("record_type")
    if record_type != "legacy-adapter":
        if payload.get("schema") != record_type:
            raise RetrievalError("context packet typed payload schema differs from record_type")
        return
    keys = set(payload)
    if not _LEGACY_PAYLOAD_REQUIRED.issubset(keys) or keys - (
        _LEGACY_PAYLOAD_REQUIRED | _LEGACY_PAYLOAD_OPTIONAL
    ):
        raise RetrievalError("context packet legacy payload is not closed")
    scalar_bounds = {
        "legacy_schema": 256,
        "record_type": 256,
        "source_path": 4096,
        "source_locator": 1024,
    }
    for name, maximum in scalar_bounds.items():
        value = payload.get(name)
        if not isinstance(value, str) or not value or len(value) > maximum:
            raise RetrievalError(f"context packet legacy payload {name} is invalid")
    if not isinstance(payload.get("source_sha256"), str) or _BARE_SHA256_RE.fullmatch(
        payload["source_sha256"]
    ) is None:
        raise RetrievalError("context packet legacy source hash is invalid")
    git_commit = payload.get("source_git_commit")
    if git_commit is not None and (
        not isinstance(git_commit, str)
        or re.fullmatch(r"[0-9a-f]{40}(?:[0-9a-f]{24})?", git_commit) is None
    ):
        raise RetrievalError("context packet legacy Git commit is invalid")
    identity = payload.get("identity_mapping")
    if identity != {
        "strategy": "native-ids-plus-opaque-source-composites-v1",
        "opaque_uuid_namespace": "bcfa556d-1823-5793-8d33-bd24c14d3ff4",
        "aliases_preserved_under": "record_canonical_json",
    }:
        raise RetrievalError("context packet legacy identity mapping is invalid")
    time_mapping = payload.get("time_mapping")
    if not isinstance(time_mapping, Mapping) or not _LEGACY_TIME_REQUIRED.issubset(
        time_mapping
    ) or set(time_mapping) - (_LEGACY_TIME_REQUIRED | _LEGACY_TIME_OPTIONAL):
        raise RetrievalError("context packet legacy time mapping is not closed")
    if any(not isinstance(value, str) or not value or len(value) > 256 for value in time_mapping.values()):
        raise RetrievalError("context packet legacy time mapping is invalid")
    record_text = payload.get("record_canonical_json")
    if not isinstance(record_text, str) or not 1 <= len(record_text) <= 800_000:
        raise RetrievalError("context packet legacy canonical record is invalid")
    try:
        parsed_record = json.loads(record_text)
        if canonical_json(parsed_record) != record_text:
            raise RetrievalError("context packet legacy record is not canonical JSON")
    except (TypeError, ValueError, json.JSONDecodeError) as exc:
        raise RetrievalError("context packet legacy record is not canonical JSON") from exc
    expected_hash = "sha256:" + hashlib.sha256(record_text.encode("utf-8")).hexdigest()
    if payload.get("record_sha256") != expected_hash:
        raise RetrievalError("context packet legacy record hash is stale")


def _verify_entry_envelope(entry: Mapping[str, Any]) -> None:
    """Apply the canonical event-envelope/value contract to a packet entry view."""
    payload = entry["payload"]
    try:
        payload_digest = canonical_sha256(payload)
    except (TypeError, ValueError, UnicodeError) as exc:
        raise RetrievalError("context packet entry payload is not canonical JSON") from exc
    provenance = entry.get("canonical_provenance")
    if isinstance(provenance, Mapping) and isinstance(provenance.get("correction"), Mapping):
        # A correction packet intentionally carries an effective typed payload under
        # the immutable correction event identity. The raw envelope is reconstructed
        # and validated (including this replacement) by _verify_canonical_provenance.
        return
    envelope = {
        "schema": "memory-event/v1",
        "event_id": entry["event_id"],
        "event_type": entry["event_type"],
        "subject_ids": entry["subject_ids"],
        "valid_time": entry["valid_time"],
        "system_time": entry["system_time"],
        "producer": entry["producer"],
        "run_id": entry["run_id"],
        "trace_id": entry["canonical_provenance"]["trace_id"],
        "payload": payload,
        "evidence_refs": entry["evidence_refs"],
        "derived_from": entry["derived_from"],
        "supersedes": entry["supersedes"],
        "integrity": {"payload_sha256": payload_digest, "signature": None},
        "policy": entry["policy"],
    }
    errors = validate_event(envelope)
    if errors:
        raise RetrievalError(
            "context packet entry violates the canonical event contract: "
            + "; ".join(errors[:8])
        )


def _projection_event_view(
    raw_event_text: str,
    typed_payload_text: str | None,
) -> tuple[dict[str, Any], dict[str, Any]]:
    """Return a validated effective read view plus raw canonical provenance."""

    try:
        raw_event = json.loads(raw_event_text)
        if not isinstance(raw_event, dict) or canonical_json(raw_event) != raw_event_text:
            raise RetrievalError("projection canonical event row is not exact canonical JSON")
    except (TypeError, ValueError, json.JSONDecodeError, UnicodeError) as exc:
        raise RetrievalError("projection canonical event row is invalid") from exc
    errors = validate_event(raw_event)
    if errors:
        raise RetrievalError(
            "projection canonical event row violates its envelope: " + "; ".join(errors[:8])
        )
    raw_payload = raw_event.get("payload")
    raw_integrity = raw_event.get("integrity")
    if not isinstance(raw_payload, Mapping) or not isinstance(raw_integrity, Mapping):
        raise RetrievalError("projection canonical event lacks payload integrity")
    envelope_payload_digest = "sha256:" + str(raw_integrity.get("payload_sha256"))
    if envelope_payload_digest != "sha256:" + canonical_sha256(raw_payload):
        raise RetrievalError("projection canonical event payload commitment is stale")
    provenance: dict[str, Any] = {
        "canonical_event_sha256": "sha256:" + canonical_sha256(raw_event),
        "envelope_payload_sha256": envelope_payload_digest,
        "trace_id": raw_event.get("trace_id"),
        "raw_system_time": raw_event.get("system_time"),
        "raw_valid_time": copy.deepcopy(raw_event.get("valid_time")),
        "raw_subject_ids": copy.deepcopy(raw_event.get("subject_ids")),
        "raw_evidence_refs": copy.deepcopy(raw_event.get("evidence_refs")),
        "raw_derived_from": copy.deepcopy(raw_event.get("derived_from")),
        "raw_supersedes": copy.deepcopy(raw_event.get("supersedes")),
        "correction": None,
    }
    effective = copy.deepcopy(raw_event)
    if raw_payload.get("schema") == "memory-correction/v1":
        try:
            from memory_phase5_contract import (
                correction_replacement,
                validate_controlled_event,
            )
        except ImportError:  # pragma: no cover - package-style imports
            from scripts.memory_phase5_contract import (
                correction_replacement,
                validate_controlled_event,
            )
        phase5_errors = validate_controlled_event(raw_event)
        if phase5_errors:
            raise RetrievalError(
                "projection correction event violates Phase 5 semantics: "
                + "; ".join(phase5_errors[:8])
            )
        try:
            replacement = dict(correction_replacement(raw_payload))
        except (TypeError, ValueError) as exc:
            raise RetrievalError("projection correction replacement is invalid") from exc
        if typed_payload_text is None:
            raise RetrievalError("projection correction lacks an effective typed payload")
        try:
            projected_payload = json.loads(typed_payload_text)
        except (TypeError, json.JSONDecodeError) as exc:
            raise RetrievalError("projection effective typed payload is invalid JSON") from exc
        if (
            not isinstance(projected_payload, dict)
            or canonical_json(projected_payload) != typed_payload_text
            or projected_payload != replacement
            or raw_payload.get("replacement_payload_sha256")
            != "sha256:" + canonical_sha256(projected_payload)
        ):
            raise RetrievalError(
                "projection effective typed payload differs from its correction capsule"
            )
        effective["payload"] = projected_payload
        effective["integrity"] = {
            "payload_sha256": canonical_sha256(projected_payload),
            "signature": None,
        }
        provenance["correction"] = copy.deepcopy(dict(raw_payload))
    elif typed_payload_text is not None:
        try:
            projected_payload = json.loads(typed_payload_text)
        except (TypeError, json.JSONDecodeError) as exc:
            raise RetrievalError("projection typed payload is invalid JSON") from exc
        if canonical_json(projected_payload) != typed_payload_text or projected_payload != raw_payload:
            raise RetrievalError("projection typed payload differs from its canonical event")
    return effective, provenance


def _verify_canonical_provenance(entry: Mapping[str, Any]) -> None:
    """Verify the closed raw-envelope commitment behind an effective packet entry."""

    provenance = entry.get("canonical_provenance")
    if not isinstance(provenance, Mapping) or set(provenance) != {
        "canonical_event_sha256", "envelope_payload_sha256", "trace_id",
        "raw_system_time", "raw_valid_time", "raw_subject_ids", "raw_evidence_refs",
        "raw_derived_from", "raw_supersedes", "correction",
    }:
        raise RetrievalError("context packet canonical provenance is not closed")
    for name in ("canonical_event_sha256", "envelope_payload_sha256"):
        value = provenance.get(name)
        if not isinstance(value, str) or _SHA256_RE.fullmatch(value) is None:
            raise RetrievalError(f"context packet canonical provenance {name} is invalid")
    trace_id = provenance.get("trace_id")
    if trace_id is not None and (
        not isinstance(trace_id, str)
        or re.fullmatch(r"(?!0{32}$)[0-9a-f]{32}", trace_id) is None
    ):
        raise RetrievalError("context packet canonical provenance trace_id is invalid")
    correction = provenance.get("correction")
    entry_payload = entry.get("payload")
    raw_payload: Any = entry_payload
    if entry.get("record_type") == "legacy-adapter":
        if not isinstance(entry_payload, Mapping):
            raise RetrievalError("context packet legacy payload cannot reconstruct provenance")
        try:
            raw_payload = {
                "legacy_schema": entry_payload["legacy_schema"],
                "record_type": entry_payload["record_type"],
                "source_path": entry_payload["source_path"],
                "source_locator": entry_payload["source_locator"],
                "source_sha256": entry_payload["source_sha256"],
                "identity_mapping": {
                    "strategy": entry_payload["identity_mapping"]["strategy"],
                    "opaque_uuid_namespace": entry_payload["identity_mapping"]["opaque_uuid_namespace"],
                    "aliases_preserved_under": "record",
                },
                "time_mapping": copy.deepcopy(dict(entry_payload["time_mapping"])),
                "record": json.loads(entry_payload["record_canonical_json"]),
            }
            if "source_git_commit" in entry_payload:
                raw_payload["source_git_commit"] = entry_payload["source_git_commit"]
        except (KeyError, TypeError, json.JSONDecodeError) as exc:
            raise RetrievalError("context packet legacy payload cannot reconstruct provenance") from exc
    elif correction is not None:
        raw_payload = correction

    raw_event = {
        "schema": "memory-event/v1",
        "event_id": entry.get("event_id"),
        "event_type": entry.get("event_type"),
        "subject_ids": provenance.get("raw_subject_ids"),
        "valid_time": provenance.get("raw_valid_time"),
        "system_time": provenance.get("raw_system_time"),
        "producer": entry.get("producer"),
        "run_id": entry.get("run_id"),
        "trace_id": trace_id,
        "payload": raw_payload,
        "evidence_refs": provenance.get("raw_evidence_refs"),
        "derived_from": provenance.get("raw_derived_from"),
        "supersedes": provenance.get("raw_supersedes"),
        "integrity": {
            "payload_sha256": provenance["envelope_payload_sha256"][7:],
            "signature": None,
        },
        "policy": entry.get("policy"),
    }
    raw_errors = validate_event(raw_event)
    if raw_errors:
        raise RetrievalError(
            "context packet canonical provenance cannot reconstruct a valid raw event: "
            + "; ".join(raw_errors[:8])
        )
    if provenance["canonical_event_sha256"] != "sha256:" + canonical_sha256(raw_event):
        raise RetrievalError("context packet canonical event commitment is stale")
    try:
        if _normalized_datetime(
            provenance["raw_system_time"], field="canonical_provenance.raw_system_time"
        ) != entry.get("system_time"):
            raise RetrievalError("context packet effective system time differs from raw provenance")
        raw_valid = provenance["raw_valid_time"]
        if not isinstance(raw_valid, Mapping):
            raise RetrievalError("context packet raw valid time is invalid")
        raw_from, _ = _packet_valid_endpoint(
            raw_valid.get("from"), field="canonical_provenance.raw_valid_time.from", is_end=False
        )
        raw_to = None
        if raw_valid.get("to") is not None:
            raw_to, _ = _packet_valid_endpoint(
                raw_valid.get("to"), field="canonical_provenance.raw_valid_time.to", is_end=True
            )
        if {"from": raw_from, "to": raw_to} != entry.get("valid_time"):
            raise RetrievalError("context packet effective valid time differs from raw provenance")
    except (TypeError, ValueError, ProjectionError) as exc:
        raise RetrievalError("context packet raw time provenance is invalid") from exc
    for raw_name, entry_name in (
        ("raw_subject_ids", "subject_ids"),
        ("raw_evidence_refs", "evidence_refs"),
        ("raw_derived_from", "derived_from"),
        ("raw_supersedes", "supersedes"),
    ):
        raw_values = provenance.get(raw_name)
        if not isinstance(raw_values, list) or sorted(raw_values) != entry.get(entry_name):
            raise RetrievalError(
                f"context packet effective {entry_name} differs from raw provenance"
            )

    if correction is None:
        if (
            entry.get("record_type") != "legacy-adapter"
            and provenance["envelope_payload_sha256"]
            != "sha256:" + canonical_sha256(entry["payload"])
        ):
            raise RetrievalError("context packet canonical payload commitment is stale")
        return
    if not isinstance(correction, Mapping):
        raise RetrievalError("context packet correction provenance is invalid")
    try:
        from memory_phase5_contract import correction_replacement, validate_correction_payload
    except ImportError:  # pragma: no cover - package-style imports
        from scripts.memory_phase5_contract import correction_replacement, validate_correction_payload
    errors = validate_correction_payload(correction)
    if errors:
        raise RetrievalError(
            "context packet correction provenance violates its contract: "
            + "; ".join(errors[:8])
        )
    if provenance["envelope_payload_sha256"] != "sha256:" + canonical_sha256(correction):
        raise RetrievalError("context packet correction envelope commitment is stale")
    try:
        replacement = correction_replacement(correction)
    except (TypeError, ValueError) as exc:
        raise RetrievalError("context packet correction replacement is invalid") from exc
    if (
        dict(replacement) != entry["payload"]
        or correction.get("replacement_payload_sha256")
        != "sha256:" + canonical_sha256(entry["payload"])
    ):
        raise RetrievalError("context packet correction replacement differs from the effective payload")
    expected_event_type = {
        "claim": "claim.corrected",
        "feedback-review": "feedback.corrected",
    }.get(correction.get("replacement_domain"))
    if entry.get("event_type") != expected_event_type:
        raise RetrievalError("context packet correction event type differs from its domain")
    if entry.get("supersedes") != correction.get("target_event_ids"):
        raise RetrievalError("context packet correction targets differ from the envelope")
    if entry.get("evidence_refs") != correction.get("evidence_refs"):
        raise RetrievalError("context packet correction evidence differs from the envelope")
    authority = correction.get("authority")
    producer = entry.get("producer")
    if not isinstance(authority, Mapping) or not isinstance(producer, Mapping) or (
        authority.get("reviewer_kind"), authority.get("reviewer_name")
    ) != (producer.get("kind"), producer.get("name")):
        raise RetrievalError("context packet correction authority differs from its producer")
    try:
        if parse_aware_datetime(authority.get("authorized_at")) != parse_aware_datetime(
            entry.get("system_time")
        ):
            raise RetrievalError("context packet correction authority time differs from its event")
    except (TypeError, ValueError) as exc:
        raise RetrievalError("context packet correction authority time is invalid") from exc


def _verified_retrieval_projection(
    connection: sqlite3.Connection,
    path: Path,
    *,
    expected_digest: str,
) -> ProjectionResult:
    """Verify the caller anchor without touching the projection's global FTS index.

    ``memory_projection`` includes logical FTS content in its digest.  Read the two
    content columns from FTS5's ordinary shadow content table solely for hashing; never
    execute the virtual table, tokenizer, vocabulary, or MATCH operation.  This preserves
    the existing digest even for legacy float spellings that canonical event JSON cannot
    reconstruct. Phase 3 never uses the global FTS index for candidate retrieval.
    """
    integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
    _check_integrity_result(integrity)
    if list(connection.execute("PRAGMA foreign_key_check")):
        raise ProjectionError("projection foreign-key integrity check failed")
    metadata = dict(connection.execute("SELECT key,value FROM metadata"))
    if metadata.get("schema") != PROJECTION_SCHEMA:
        raise ProjectionError("projection schema metadata is missing or unsupported")
    logical: dict[str, Any] = {"schema": PROJECTION_SCHEMA}
    for table in _LOGICAL_PROJECTION_TABLES:
        columns = [str(row[1]) for row in connection.execute(f"PRAGMA table_info({table})")]
        if not columns or any(re.fullmatch(r"[a-z_][a-z0-9_]*", column) is None for column in columns):
            raise ProjectionError(f"projection table {table} has an unsupported schema")
        column_sql = ",".join(columns)
        logical[table] = [
            list(row)
            for row in connection.execute(
                f"SELECT {column_sql} FROM {table} ORDER BY {column_sql}"
            )
        ]
    shadow_schema = connection.execute(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='event_search_content'"
    ).fetchone()
    if shadow_schema is None or shadow_schema[0] != "CREATE TABLE 'event_search_content'(id INTEGER PRIMARY KEY, c0, c1)":
        raise ProjectionError("projection FTS shadow content schema is unsupported")
    logical["event_search"] = [
        [str(event_id), str(text)]
        for event_id, text in connection.execute(
            "SELECT c0,c1 FROM event_search_content ORDER BY c0,c1"
        )
    ]
    digest = canonical_sha256(logical)
    if metadata.get("projection_digest") != digest:
        raise ProjectionError("projection digest does not match its canonical relational rows")
    if digest != expected_digest:
        raise ProjectionError("projection digest does not match the trusted expected digest")
    counts = tuple(
        int(connection.execute(f"SELECT count(*) FROM {table}").fetchone()[0])
        for table in ("events", "subjects", "event_edges", "evidence_refs", "artifacts", "typed_payloads")
    )
    if metadata.get("event_count") != str(counts[0]):
        raise ProjectionError("projection event_count metadata is stale")
    return ProjectionResult(
        path=str(path), event_count=counts[0], subject_count=counts[1], edge_count=counts[2],
        evidence_ref_count=counts[3], artifact_count=counts[4], typed_payload_count=counts[5],
        digest=digest,
    )


def _record_id(event: Mapping[str, Any]) -> str:
    payload = event.get("payload")
    if isinstance(payload, Mapping):
        for field_name in (
            "claim_id", "evidence_id", "source_id", "source_version_id",
            "relationship_id", "extraction_id",
        ):
            value = payload.get(field_name)
            if isinstance(value, str):
                return value
    return str(event["event_id"])


def _flatten(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, bool):
        return ["true" if value else "false"]
    if isinstance(value, (str, int, float)):
        return [str(value)]
    if isinstance(value, list):
        out: list[str] = []
        for item in value:
            out.extend(_flatten(item))
        return out
    if isinstance(value, Mapping):
        out = []
        for key in sorted(value):
            out.append(str(key))
            out.extend(_flatten(value[key]))
        return out
    return []


def _search_text(event: Mapping[str, Any]) -> str:
    return "\n".join(
        [str(event.get("event_type", "")), *event.get("subject_ids", []), *_flatten(event.get("payload"))]
    )


def _resolution_mapping(value: object) -> tuple[dict[str, Any], bytes | None]:
    content: bytes | None = None
    if hasattr(value, "metadata") and hasattr(value, "content"):
        content_value = getattr(value, "content")
        if not isinstance(content_value, bytes):
            raise RetrievalError("exact resolver returned non-byte content")
        content = content_value
        value = getattr(value, "metadata")
    if hasattr(value, "to_dict"):
        value = getattr(value, "to_dict")()
    if not isinstance(value, Mapping) or set(value) != _RESOLUTION_FIELDS:
        raise RetrievalError("exact resolver returned unsupported metadata")
    row = dict(value)
    if row.get("schema") != "memory-resolution/v1":
        raise RetrievalError("exact resolver metadata schema is unsupported")
    if not isinstance(row.get("content_sha256"), str) or _SHA256_RE.fullmatch(row["content_sha256"]) is None:
        raise RetrievalError("exact resolver metadata content hash is invalid")
    length = row.get("byte_length")
    if not isinstance(length, int) or isinstance(length, bool) or length < 0:
        raise RetrievalError("exact resolver metadata byte length is invalid")
    policy = row.get("policy")
    if not isinstance(policy, Mapping) or set(policy) != {"classification", "retention", "retain_until"}:
        raise RetrievalError("exact resolver metadata policy is invalid")
    classification = policy.get("classification")
    retention = policy.get("retention")
    retain_until = policy.get("retain_until")
    if classification not in CLASSIFICATIONS or retention not in {
        "permanent", "source-policy", "expires", "tombstone-only",
    }:
        raise RetrievalError("exact resolver metadata policy value is invalid")
    if retention == "expires":
        if not isinstance(retain_until, str):
            raise RetrievalError("exact resolver expiry is missing")
        try:
            parse_aware_datetime(retain_until)
        except ValueError as exc:
            raise RetrievalError("exact resolver expiry is invalid") from exc
    elif retain_until is not None:
        raise RetrievalError("exact resolver non-expiring policy has an expiry")
    if content is not None:
        if len(content) != length or "sha256:" + hashlib.sha256(content).hexdigest() != row["content_sha256"]:
            raise RetrievalError("exact resolver bytes do not match resolution metadata")
    if row.get("lane") not in {"legacy-git", "phase2-store", "synthetic-test"}:
        raise RetrievalError("exact resolver metadata lane is unsupported")
    event_id = row.get("event_id")
    if event_id is not None and (
        not isinstance(event_id, str) or _EVENT_ID_RE.fullmatch(event_id) is None
    ):
        raise RetrievalError("exact resolver metadata event ID is invalid")
    revision = row.get("repository_revision")
    if revision is not None and (
        not isinstance(revision, str)
        or re.fullmatch(r"[0-9a-f]{40}(?:[0-9a-f]{24})?", revision) is None
    ):
        raise RetrievalError("exact resolver repository revision is invalid")
    for name, maximum in (("source_path", 4096), ("source_locator", 1024)):
        item = row.get(name)
        if item is not None and (not isinstance(item, str) or len(item) > maximum):
            raise RetrievalError(f"exact resolver metadata {name} is invalid")
    media_type = row.get("media_type")
    if not isinstance(media_type, str) or not media_type or len(media_type) > 255:
        raise RetrievalError("exact resolver media type is invalid")
    identity_values = tuple(
        row.get(name)
        for name in ("object_id", "acquisition_id", "source_version_id", "manifest_sha256")
    )
    if any(item is not None for item in identity_values) and not all(
        isinstance(item, str) for item in identity_values
    ):
        raise RetrievalError("object resolution metadata has a partial exact manifest identity")
    if row.get("object_id") is not None and not all(
        isinstance(row.get(name), str) and row.get(name)
        for name in ("acquisition_id", "source_version_id", "manifest_sha256")
    ):
        raise RetrievalError("object resolution metadata lacks one exact manifest identity")
    if row.get("object_id") is not None and (
        _OBJECT_ID_RE.fullmatch(row["object_id"]) is None
        or _ACQUISITION_ID_RE.fullmatch(row["acquisition_id"]) is None
        or _SOURCE_VERSION_ID_RE.fullmatch(row["source_version_id"]) is None
        or _SHA256_RE.fullmatch(row["manifest_sha256"]) is None
    ):
        raise RetrievalError("object resolution metadata has a malformed exact manifest identity")
    return row, content


def _material(event: Mapping[str, Any]) -> bool:
    if _record_type(event) == "legacy-adapter":
        # A legacy adapter capsule is still derived from exact repository bytes.
        # Projection text alone cannot establish its source path/commit/digest binding.
        return True
    if event.get("policy", {}).get("retention") == "source-policy":
        # A source-policy record must cross the trusted resolver boundary before
        # any of its text can enter FTS or an embedder, even when it is an inference.
        return True
    payload = event.get("payload")
    schema = payload.get("schema") if isinstance(payload, Mapping) else None
    if event.get("evidence_refs"):
        return True
    if schema == "memory-claim/v1":
        return bool(payload.get("material")) or payload.get("epistemic_status") == "supported"
    return schema in {
        "memory-source/v1", "memory-source/v2", "memory-evidence-span/v1",
        "memory-evidence-span/v2", "memory-extraction-artifact/v1", "memory-relationship/v1",
    }


def _resolution_reason(exc: Exception) -> str:
    if isinstance(exc, EvidenceCorpusResolutionError):
        return "exact-manifest-corpus-unresolved"
    name = type(exc).__name__.casefold()
    if "access" in name or "denied" in name or "expired" in name:
        return "exact-resolution-access-denied"
    if "notfound" in name or "not_found" in name or isinstance(exc, FileNotFoundError):
        return "exact-resolution-not-found"
    if "integrity" in name or "corrupt" in name or "tamper" in name:
        return "exact-resolution-integrity-failed"
    if "unavailable" in name or "retired" in name:
        return "exact-resolution-unavailable"
    return "exact-resolution-failed"


def _resolve_material(
    verifier: object | None,
    event: Mapping[str, Any],
    *,
    scope: AccessScope,
    query: QuerySpec,
    evaluated_at: str,
) -> tuple[tuple[dict[str, Any], ...], str | None]:
    if not _material(event):
        return (), None
    if verifier is None:
        return (), "exact-resolution-verifier-required"
    try:
        if hasattr(verifier, "verify_event"):
            result = verifier.verify_event(
                event,
                principal=scope.principal,
                as_of_system_time=query.as_of_system_time,
                valid_time={"from": query.valid_from, "to": query.valid_to},
                policy_evaluated_at=evaluated_at,
            )
        elif hasattr(verifier, "resolve"):
            result = verifier.resolve(event, principal=scope.principal)
        else:
            raise RetrievalError("exact verifier exposes neither verify_event nor resolve")
    except RetrievalError:
        raise
    except Exception as exc:
        return (), _resolution_reason(exc)
    values = result if isinstance(result, (list, tuple)) else [result]
    if not values:
        return (), "exact-resolution-empty"
    rows = []
    try:
        for value in values:
            row, _content = _resolution_mapping(value)
            if row["policy"] != event.get("policy"):
                return (), "exact-resolution-policy-mismatch"
            rows.append(row)
    except RetrievalError:
        return (), "exact-resolution-metadata-invalid"
    rows.sort(key=canonical_json)
    expected = _expected_object_refs(event)
    for object_id, content_sha, acquisition_id, source_version_id in expected:
        matches = [
            row for row in rows
            if row.get("object_id") == object_id and row.get("content_sha256") == content_sha
            and row.get("acquisition_id") == acquisition_id
            and row.get("source_version_id") == source_version_id
            and isinstance(row.get("manifest_sha256"), str)
            and _SHA256_RE.fullmatch(row["manifest_sha256"]) is not None
        ]
        if not matches:
            return (), "exact-object-lineage-unresolved"
    return tuple(rows), None


def _expected_object_refs(event: Mapping[str, Any]) -> tuple[tuple[str, str, str, str], ...]:
    payload = event.get("payload")
    if not isinstance(payload, Mapping):
        return ()
    schema = payload.get("schema")
    refs: list[tuple[str, str, str, str]] = []
    acquisition_id = payload.get("acquisition_id")
    source_version_id = payload.get("source_version_id")
    if schema == "memory-source/v2":
        refs.append((payload.get("source_object_id"), payload.get("content_sha256"), acquisition_id, source_version_id))
    elif schema == "memory-evidence-span/v2":
        refs.append((payload.get("source_object_id"), payload.get("source_content_sha256"), acquisition_id, source_version_id))
        locator = payload.get("locator")
        if isinstance(locator, Mapping):
            refs.append((locator.get("coordinate_artifact_object_id"), locator.get("coordinate_artifact_content_sha256"), acquisition_id, source_version_id))
    elif schema == "memory-extraction-artifact/v1":
        for name in ("source_object", "output_object"):
            item = payload.get(name)
            if isinstance(item, Mapping):
                refs.append((item.get("object_id"), item.get("content_sha256"), acquisition_id, source_version_id))
    return tuple(
        (object_id, digest, acquisition, version)
        for object_id, digest, acquisition, version in refs
        if all(isinstance(item, str) for item in (object_id, digest, acquisition, version))
    )


def _source_licence_allowed(event: Mapping[str, Any], scope: AccessScope, evaluated_at: str) -> tuple[bool, str | None]:
    payload = event.get("payload")
    if not isinstance(payload, Mapping) or payload.get("schema") not in {"memory-source/v1", "memory-source/v2"}:
        return True, None
    licence = payload.get("licence")
    if not isinstance(licence, Mapping):
        return False, "source-licence-missing"
    expires = licence.get("expires_at")
    if isinstance(expires, str) and parse_aware_datetime(expires) <= parse_aware_datetime(evaluated_at):
        return False, "source-licence-expired"
    if payload.get("schema") == "memory-source/v2":
        classification = licence.get("classification")
        if classification == "unknown" or classification != event.get("policy", {}).get("classification"):
            return False, "source-licence-classification-unresolved"
        entitlement = licence.get("entitlement")
        if entitlement == "unknown":
            return False, "source-entitlement-unknown"
        if entitlement != "not-required" and not {
            payload.get("document_id"), payload.get("source_version_id"), payload.get("acquisition_id")
        }.intersection(scope.entitlement_ids):
            return False, "source-entitlement-missing"
    return True, None


def _embedding_allowed(
    candidate: _Candidate,
    *,
    scope: AccessScope,
    source_events: Sequence[Mapping[str, Any]],
) -> bool:
    if candidate.record_type not in {"memory-claim/v1", "memory-evidence-span/v1", "memory-evidence-span/v2"}:
        return False
    classification = candidate.event["policy"]["classification"]
    if classification not in scope.embedding_classifications:
        return False
    if not source_events:
        return False
    for event in source_events:
        payload = event.get("payload")
        if not isinstance(payload, Mapping):
            return False
        if payload.get("schema") == "memory-source/v2":
            right = payload.get("rights", {}).get("embedding")
            if right == "prohibited" or right not in {"allowed", "authorized-internal-only"}:
                return False
            if right == "authorized-internal-only" and classification == "public":
                return False
        elif payload.get("schema") == "memory-source/v1":
            if payload.get("licence", {}).get("derived_data") != "allowed":
                return False
        else:
            return False
    return True


def _vector(value: Sequence[object], dimensions: int) -> tuple[float, ...]:
    if not isinstance(value, Sequence) or isinstance(value, (str, bytes)) or len(value) != dimensions:
        raise RetrievalError("embedding provider returned a vector with the wrong dimensions")
    out = []
    for item in value:
        if isinstance(item, bool) or not isinstance(item, (int, float)) or not math.isfinite(float(item)):
            raise RetrievalError("embedding provider returned a non-finite or non-numeric value")
        out.append(float(item))
    return tuple(out)


def _cosine(left: Sequence[float], right: Sequence[float]) -> float:
    dot = sum(a * b for a, b in zip(left, right))
    left_norm = math.sqrt(sum(item * item for item in left))
    right_norm = math.sqrt(sum(item * item for item in right))
    if left_norm == 0 or right_norm == 0:
        return -1.0
    return dot / (left_norm * right_norm)


def _lexical_ranking(candidates: Sequence[_Candidate], query_text: str) -> list[str]:
    tokens = sorted(set(token.casefold() for token in _TOKEN_RE.findall(query_text)))
    if not tokens or not candidates:
        return []
    connection = sqlite3.connect(":memory:")
    try:
        connection.execute(
            "CREATE VIRTUAL TABLE authorized_search USING fts5(event_id UNINDEXED,text,tokenize='unicode61 remove_diacritics 2')"
        )
        connection.executemany(
            "INSERT INTO authorized_search(event_id,text) VALUES(?,?)",
            [(item.event["event_id"], item.search_text) for item in sorted(candidates, key=lambda row: row.event["event_id"])],
        )
        expression = " OR ".join('"' + token.replace('"', '""') + '"' for token in tokens)
        rows = list(
            connection.execute(
                "SELECT event_id,bm25(authorized_search) FROM authorized_search WHERE authorized_search MATCH ?",
                (expression,),
            )
        )
        rows.sort(key=lambda row: (round(float(row[1]), 12), str(row[0])))
        return [str(row[0]) for row in rows]
    except sqlite3.OperationalError as exc:
        raise RetrievalError("SQLite runtime lacks the required FTS5 support") from exc
    finally:
        connection.close()


def _structured_ranking(candidates: Sequence[_Candidate], query: QuerySpec) -> list[str]:
    terms = set(token.casefold() for token in _TOKEN_RE.findall(query.query_text))
    scored: list[tuple[int, str]] = []
    for candidate in candidates:
        payload = candidate.event.get("payload")
        score = 100
        score += max(0, 11 - min(candidate.source_tiers)) * 10
        if isinstance(payload, Mapping) and payload.get("schema") == "memory-claim/v1":
            score += int(payload.get("claim_quality", 0)) * 12
            score += 20 if payload.get("material") else 0
            score += 8 if payload.get("qualifier") else 0
            predicate = str(payload.get("predicate", "")).casefold()
            if query.metric and predicate == query.metric.casefold():
                score += 60
            if predicate in terms or candidate.record_id.casefold() in terms:
                score += 30
        scored.append((-score, candidate.event["event_id"]))
    scored.sort()
    return [event_id for _score, event_id in scored]


def _embedding_ranking(
    candidates: Sequence[_Candidate],
    query: QuerySpec,
    embedder: EmbeddingModel | None,
    *,
    scope: AccessScope,
    sources_for: Mapping[str, Sequence[Mapping[str, Any]]],
) -> tuple[list[str], dict[str, Any] | None]:
    if embedder is None:
        return [], None
    metadata = getattr(embedder, "metadata", None)
    if not isinstance(metadata, EmbeddingMetadata):
        raise RetrievalError("embedder.metadata must be EmbeddingMetadata")
    eligible = [
        item for item in candidates
        if _embedding_allowed(item, scope=scope, source_events=sources_for.get(item.event["event_id"], ()))
    ]
    texts = [query.query_text, *(item.search_text for item in eligible)]
    try:
        raw_vectors = embedder.embed(texts)
    except Exception as exc:
        raise RetrievalError("embedding provider failed closed") from exc
    if not isinstance(raw_vectors, Sequence) or len(raw_vectors) != len(texts):
        raise RetrievalError("embedding provider returned the wrong vector count")
    vectors = [_vector(item, metadata.dimensions) for item in raw_vectors]
    query_vector = vectors[0]
    scored = [
        (-round(_cosine(query_vector, vector), 12), candidate.event["event_id"])
        for candidate, vector in zip(eligible, vectors[1:])
    ]
    scored.sort()
    return [event_id for _score, event_id in scored], {
        "schema": "memory-embedding-index-metadata/v1",
        "provider": metadata.provider,
        "model": metadata.model,
        "version": metadata.version,
        "dimensions": metadata.dimensions,
        "policy_partition": sorted({item.event["policy"]["classification"] for item in eligible}),
        "indexed_event_count": len(eligible),
    }


def _claim_matches(payload: Mapping[str, Any], query: QuerySpec) -> bool:
    if query.metric is not None and str(payload.get("predicate", "")).casefold() != query.metric.casefold():
        return False
    if query.currency is not None and payload.get("currency") != query.currency:
        return False
    if query.reporting_basis is not None:
        values = {str(payload.get("accounting_standard", "")).casefold(), str(payload.get("basis", "")).casefold()}
        if not any(query.reporting_basis.casefold() in value for value in values):
            return False
    if query.segment is not None and str(payload.get("scope", {}).get("segment", "")).casefold() != query.segment.casefold():
        return False
    return True


def _source_indexes(events: Mapping[str, dict[str, Any]]) -> tuple[dict[str, dict[str, Any]], dict[tuple[str, str], dict[str, Any]], dict[str, dict[str, Any]]]:
    v1: dict[str, dict[str, Any]] = {}
    v2: dict[tuple[str, str], dict[str, Any]] = {}
    evidence: dict[str, dict[str, Any]] = {}
    for event in events.values():
        payload = event.get("payload")
        if not isinstance(payload, Mapping):
            continue
        schema = payload.get("schema")
        if schema == "memory-source/v1":
            v1[str(payload["source_id"])] = event
        elif schema == "memory-source/v2":
            v2[(str(payload["acquisition_id"]), str(payload["source_version_id"]))] = event
        elif schema in {"memory-evidence-span/v1", "memory-evidence-span/v2"}:
            evidence[str(payload["evidence_id"])] = event
    return v1, v2, evidence


def _sources_for_event(
    event: Mapping[str, Any],
    *,
    source_v1: Mapping[str, dict[str, Any]],
    source_v2: Mapping[tuple[str, str], dict[str, Any]],
    evidence: Mapping[str, dict[str, Any]],
    records: Mapping[str, dict[str, Any]],
    seen: frozenset[str] = frozenset(),
) -> tuple[dict[str, Any], ...]:
    event_id = str(event["event_id"])
    if event_id in seen:
        return ()
    seen = seen | {event_id}
    payload = event.get("payload")
    if not isinstance(payload, Mapping):
        return ()
    schema = payload.get("schema")
    if schema in {"memory-source/v1", "memory-source/v2"}:
        return (dict(event),)
    if schema == "memory-evidence-span/v1":
        source = source_v1.get(str(payload.get("source_id")))
        return (source,) if source else ()
    if schema in {"memory-evidence-span/v2", "memory-extraction-artifact/v1"}:
        source = source_v2.get((str(payload.get("acquisition_id")), str(payload.get("source_version_id"))))
        return (source,) if source else ()
    refs: list[str] = []
    if schema == "memory-claim/v1":
        refs.extend(str(item) for item in payload.get("evidence_refs", []))
        refs.extend(str(item) for item in payload.get("derived_from_claims", []))
    elif schema == "memory-relationship/v1":
        refs.extend((str(payload.get("source_ref")), str(payload.get("target_ref"))))
    found: dict[str, dict[str, Any]] = {}
    for ref in refs:
        provider = evidence.get(ref) or records.get(ref)
        if provider:
            for source in _sources_for_event(
                provider, source_v1=source_v1, source_v2=source_v2,
                evidence=evidence, records=records, seen=seen,
            ):
                found[source["event_id"]] = source
    return tuple(found[key] for key in sorted(found))


def _normalized_resolution(row: Mapping[str, Any]) -> dict[str, Any]:
    """Return content-free metadata, dropping repository/object locator values."""
    return {
        "schema": row["schema"],
        "lane": row["lane"],
        "event_id": row["event_id"],
        "repository_revision": row["repository_revision"],
        "source_path": row["source_path"],
        "source_locator": row["source_locator"],
        "object_id": row["object_id"],
        "acquisition_id": row["acquisition_id"],
        "source_version_id": row["source_version_id"],
        "manifest_sha256": row["manifest_sha256"],
        "content_sha256": row["content_sha256"],
        "byte_length": row["byte_length"],
        "media_type": row["media_type"],
        "policy": dict(row["policy"]),
    }


def _entry(
    candidate: _Candidate,
    *,
    retrieval_sources: Sequence[str],
    rrf_score: Fraction,
    rerank_bonus: int,
    expanded_from: str | None,
) -> dict[str, Any]:
    event = candidate.event
    valid_from, _ = _packet_valid_endpoint(
        event["valid_time"]["from"], field="entry.valid_time.from", is_end=False
    )
    valid_to = None
    if event["valid_time"]["to"] is not None:
        valid_to, _ = _packet_valid_endpoint(
            event["valid_time"]["to"], field="entry.valid_time.to", is_end=True
        )
    core = {
        "event_id": event["event_id"],
        "record_id": candidate.record_id,
        "record_type": candidate.record_type,
        "event_type": event["event_type"],
        "subject_ids": sorted(event["subject_ids"]),
        "system_time": _normalized_datetime(event["system_time"], field="entry.system_time"),
        "valid_time": {"from": valid_from, "to": valid_to},
        "policy": event["policy"],
        "source_tiers": list(candidate.source_tiers),
        "producer": event["producer"],
        "run_id": event["run_id"],
        "canonical_provenance": copy.deepcopy(candidate.canonical_provenance),
        "payload": _packet_payload(event, candidate.record_type),
        "evidence_refs": sorted(event["evidence_refs"]),
        "derived_from": sorted(event["derived_from"]),
        "supersedes": sorted(event["supersedes"]),
        "resolutions": [_normalized_resolution(row) for row in candidate.resolutions],
        "retrieval": {
            "candidate_sources": sorted(set(retrieval_sources)),
            "rrf_score": f"{rrf_score.numerator}/{rrf_score.denominator}",
            "rerank_bonus_micros": rerank_bonus,
            "expanded_from_event_id": expanded_from,
        },
    }
    raw = canonical_json_bytes(core)
    core["accounting"] = {
        "accounted_part": "entry-without-accounting",
        "utf8_bytes": len(raw),
        "estimated_tokens": (len(raw) + 3) // 4,
    }
    return core


def _candidate_bonus(candidate: _Candidate, as_of: str) -> int:
    payload = candidate.event.get("payload")
    bonus = 4000 if candidate.resolutions else 0
    bonus += (11 - min(candidate.source_tiers)) * 100
    if isinstance(payload, Mapping) and payload.get("schema") == "memory-claim/v1":
        bonus += int(payload.get("claim_quality", 0)) * 400
        bonus += 250 if payload.get("qualifier") else 0
        bonus += 100 if payload.get("material") else 0
    age_days = max(0, (parse_aware_datetime(as_of) - parse_aware_datetime(candidate.event["system_time"])).days)
    bonus += max(0, 3650 - min(age_days, 3650))
    return bonus


def _make_packet_id(content_digest: str) -> str:
    value = uuid.uuid5(uuid.NAMESPACE_URL, "memory-context-packet:" + content_digest)
    return "context-packet_" + str(value)


def _manifest_hash(manifest: Mapping[str, Any]) -> str:
    unsigned = dict(manifest)
    unsigned.pop("manifest_sha256", None)
    return canonical_sha256(unsigned)


def compile_context_packet(
    database_path: str | Path,
    *,
    expected_projection_digest: str,
    query: QuerySpec | Mapping[str, Any],
    access_scope: AccessScope,
    evidence_verifier: ExactEvidenceVerifier | object | None,
    evaluated_at: str,
    embedder: EmbeddingModel | None = None,
) -> ContextPacketResult:
    """Compile one deterministic packet from a caller-anchored projection snapshot."""
    if isinstance(query, QuerySpec):
        query = QuerySpec.from_dict(query.to_dict())
    else:
        query = QuerySpec.from_dict(query)
    if not isinstance(access_scope, AccessScope):
        raise RetrievalError("access_scope must be a trusted AccessScope")
    if not isinstance(expected_projection_digest, str) or _BARE_SHA256_RE.fullmatch(expected_projection_digest) is None:
        raise RetrievalError("expected_projection_digest must be 64 lowercase hex characters")
    try:
        evaluated_at = _normalized_datetime(evaluated_at, field="evaluated_at")
    except ProjectionError as exc:
        raise RetrievalError("evaluated_at must be an aware ISO-8601 date-time") from exc
    if parse_aware_datetime(evaluated_at) < parse_aware_datetime(query.as_of_system_time):
        raise RetrievalError(
            "evaluated_at cannot precede as_of_system_time; current policy must be "
            "evaluated at or after the requested knowledge cutoff"
        )

    effective_classes = tuple(sorted(set(query.permitted_classifications) & set(access_scope.classifications)))
    effective_tiers = tuple(sorted(set(query.permitted_source_tiers) & set(access_scope.source_tiers)))
    if not effective_classes or not effective_tiers:
        raise RetrievalAccessDenied("query requested no classification/source-tier intersection with trusted scope")
    omissions: Counter[str] = Counter()
    omissions["requested-classification-outside-trusted-scope"] += len(set(query.permitted_classifications) - set(effective_classes))
    omissions["requested-source-tier-outside-trusted-scope"] += len(set(query.permitted_source_tiers) - set(effective_tiers))

    path = Path(database_path).resolve()
    connection = _read_only_connection(path)
    try:
        connection.execute("BEGIN")
        try:
            projection = _verified_retrieval_projection(
                connection, path, expected_digest=expected_projection_digest
            )
        except ProjectionError as exc:
            raise RetrievalError(f"projection verification failed: {exc}") from exc
        placeholders = ",".join("?" for _ in effective_classes)
        params: list[object] = [*effective_classes, query.as_of_system_time, query.valid_to, query.valid_from, evaluated_at]
        rows = connection.execute(
            "SELECT events.canonical_event,typed_payloads.canonical_payload FROM events "
            "LEFT JOIN typed_payloads ON typed_payloads.event_id=events.event_id "
            "WHERE events.classification IN (" + placeholders + ") "
            "AND events.system_time<=? AND (events.valid_from IS NULL OR events.valid_from<=?) "
            "AND (events.valid_to IS NULL OR events.valid_to>=?) AND ("
            "events.retention='permanent' OR events.retention='source-policy' OR "
            "(events.retention='expires' AND events.retain_until>?)) ORDER BY events.event_id",
            params,
        )
        loaded = [_projection_event_view(str(row[0]), row[1]) for row in rows]
        events = {event["event_id"]: event for event, _provenance in loaded}
        provenance_by_id = {
            event["event_id"]: provenance for event, provenance in loaded
        }
        binding_rows = list(
            connection.execute(
                "SELECT event_id,evidence_ref,artifact_event_id,locator_event_id FROM evidence_bindings ORDER BY event_id,evidence_ref"
            )
        )
        edge_rows = list(
            connection.execute(
                "SELECT source_event_id,edge_type,target_event_id FROM event_edges ORDER BY source_event_id,edge_type,target_event_id"
            )
        )
        successor_rows = list(
            connection.execute(
                "SELECT edge.target_event_id,successor.event_id,successor.classification,successor.retention,"
                "successor.retain_until,successor.system_time,successor.valid_from,successor.valid_to "
                "FROM event_edges edge JOIN events successor ON successor.event_id=edge.source_event_id "
                "WHERE edge.edge_type='supersedes' ORDER BY edge.target_event_id,successor.event_id"
            )
        )
    finally:
        connection.close()

    # Suppression is evaluated from content-free successor metadata. Tombstones and
    # unresolved source-policy successors fail toward abstention, never stale revival.
    suppressed: set[str] = set()
    for target, _successor, classification, retention, retain_until, system_time, valid_from, valid_to in successor_rows:
        if system_time > query.as_of_system_time or (valid_from is not None and valid_from > query.valid_to) or (valid_to is not None and valid_to < query.valid_from):
            continue
        active = retention == "tombstone-only" or retention == "source-policy" or (
            classification in effective_classes and (
                retention == "permanent" or (retention == "expires" and retain_until is not None and retain_until > evaluated_at)
            )
        )
        if active:
            suppressed.add(str(target))
            if retention == "source-policy":
                omissions["suppressed-by-unresolved-source-policy-successor"] += 1
    for event_id in suppressed:
        events.pop(event_id, None)
        provenance_by_id.pop(event_id, None)

    evidence_bindings: dict[str, set[str]] = defaultdict(set)
    provider_neighbors: dict[str, set[str]] = defaultdict(set)
    for event_id, evidence_ref, artifact_id, locator_id in binding_rows:
        evidence_bindings[str(event_id)].add(str(evidence_ref))
        provider_neighbors[str(event_id)].update((str(artifact_id), str(locator_id)))
    graph: dict[str, list[tuple[str, str]]] = defaultdict(list)
    for source, edge_type, target in edge_rows:
        graph[str(source)].append((str(edge_type), str(target)))
        graph[str(target)].append(("reverse-" + str(edge_type), str(source)))

    records = {_record_id(event): event for event in events.values()}
    source_v1, source_v2, evidence_records = _source_indexes(events)
    sources_for: dict[str, tuple[dict[str, Any], ...]] = {}
    candidate_base: dict[str, _Candidate] = {}

    for event_id in sorted(events):
        event = events[event_id]
        allowed, licence_reason = _source_licence_allowed(event, access_scope, evaluated_at)
        if not allowed:
            omissions[licence_reason or "source-licence-denied"] += 1
            continue
        event_sources = _sources_for_event(
            event, source_v1=source_v1, source_v2=source_v2,
            evidence=evidence_records, records=records,
        )
        sources_for[event_id] = event_sources
        if event_sources:
            denied_source = False
            for source in event_sources:
                source_allowed, reason = _source_licence_allowed(source, access_scope, evaluated_at)
                if not source_allowed:
                    omissions[reason or "upstream-source-licence-denied"] += 1
                    denied_source = True
            if denied_source:
                continue
            tiers = tuple(sorted({int(source["payload"]["source_tier"]) for source in event_sources}))
        elif _record_type(event) == "legacy-adapter":
            tiers = (10,)
        else:
            omissions["source-lineage-unresolved"] += 1
            continue
        if not set(tiers).intersection(effective_tiers):
            omissions["source-tier-not-permitted"] += 1
            continue
        declared_refs = set(event.get("evidence_refs", []))
        if declared_refs and not declared_refs.issubset(evidence_bindings.get(event_id, set())):
            omissions["projection-evidence-binding-unresolved"] += 1
            continue
        resolutions, resolution_reason = _resolve_material(
            evidence_verifier, event, scope=access_scope, query=query, evaluated_at=evaluated_at
        )
        if resolution_reason:
            omissions[resolution_reason] += 1
            continue
        candidate_base[event_id] = _Candidate(
            event=event,
            canonical_provenance=provenance_by_id[event_id],
            record_type=_record_type(event),
            record_id=_record_id(event),
            source_tiers=tiers,
            resolutions=resolutions,
            search_text=_search_text(event),
        )

    seeds = []
    for candidate in candidate_base.values():
        event = candidate.event
        if not set(event["subject_ids"]).intersection(query.subject_ids):
            continue
        if query.event_types and event["event_type"] not in query.event_types:
            continue
        if candidate.record_type not in query.record_types:
            continue
        payload = event.get("payload")
        if any((query.metric, query.currency, query.reporting_basis, query.segment)):
            if not isinstance(payload, Mapping) or payload.get("schema") != "memory-claim/v1" or not _claim_matches(payload, query):
                continue
        seeds.append(candidate)

    structured = _structured_ranking(seeds, query)
    lexical = _lexical_ranking(seeds, query.query_text)
    embedding, embedding_metadata = _embedding_ranking(
        seeds, query, embedder, scope=access_scope, sources_for=sources_for
    )
    rankings = {"structured": structured, "lexical": lexical, "embedding": embedding}
    rrf: dict[str, Fraction] = defaultdict(Fraction)
    sources: dict[str, set[str]] = defaultdict(set)
    for name, ranking in rankings.items():
        for rank, event_id in enumerate(ranking, 1):
            rrf[event_id] += Fraction(1, RRF_K + rank)
            sources[event_id].add(name)
    ranked = sorted(
        rrf,
        key=lambda event_id: (
            -(rrf[event_id] + Fraction(_candidate_bonus(candidate_base[event_id], query.as_of_system_time), 1_000_000)),
            event_id,
        ),
    )

    # Bounded graph expansion favors contradictions, qualifiers, evidence providers,
    # and exact upstream lineage. Only already authorized/resolved events can enter.
    ordered: list[tuple[str, str | None]] = []
    seen: set[str] = set()
    relationship_links: dict[str, list[tuple[int, str]]] = defaultdict(list)
    for candidate in candidate_base.values():
        payload = candidate.event.get("payload")
        if isinstance(payload, Mapping) and payload.get("schema") == "memory-relationship/v1":
            priority = {"contradicts": 0, "resolved_by": 1, "qualifies": 2}.get(str(payload.get("relationship_type")), 3)
            for ref in (str(payload.get("source_ref")), str(payload.get("target_ref"))):
                relationship_links[ref].append((priority, candidate.event["event_id"]))
    for seed_id in ranked[: query.max_results]:
        if seed_id not in seen:
            ordered.append((seed_id, None))
            seen.add(seed_id)
        seed = candidate_base[seed_id]
        neighbor_rows: list[tuple[int, str]] = []
        for priority, relationship_id in relationship_links.get(seed.record_id, ()):
            neighbor_rows.append((priority, relationship_id))
            relationship = candidate_base.get(relationship_id)
            if relationship:
                payload = relationship.event["payload"]
                for ref in (str(payload.get("source_ref")), str(payload.get("target_ref"))):
                    target = records.get(ref)
                    if target and target["event_id"] in candidate_base:
                        neighbor_rows.append((priority + 1, target["event_id"]))
        for provider in provider_neighbors.get(seed_id, ()):
            neighbor_rows.append((4, provider))
        for edge_type, target in graph.get(seed_id, ()):
            priority = 3 if "supersedes" in edge_type else 5
            neighbor_rows.append((priority, target))
        for _priority, neighbor_id in sorted(set(neighbor_rows)):
            if len(ordered) >= query.max_results or neighbor_id in seen or neighbor_id not in candidate_base:
                continue
            ordered.append((neighbor_id, seed_id))
            seen.add(neighbor_id)
        if len(ordered) >= query.max_results:
            break

    packet_entries: list[dict[str, Any]] = []
    used_tokens = 0
    included_ids: set[str] = set()
    for event_id, expanded_from in ordered:
        if expanded_from is not None and expanded_from not in included_ids:
            omissions["expansion-parent-omitted-by-token-budget"] += 1
            continue
        candidate = candidate_base[event_id]
        item_sources = sources.get(event_id, {"graph"})
        item_rrf = rrf.get(event_id, Fraction())
        item = _entry(
            candidate,
            retrieval_sources=sorted(item_sources),
            rrf_score=item_rrf,
            rerank_bonus=_candidate_bonus(candidate, query.as_of_system_time),
            expanded_from=expanded_from,
        )
        tokens = item["accounting"]["estimated_tokens"]
        if used_tokens + tokens > query.max_context_tokens:
            omissions["token-budget-exceeded"] += 1
            continue
        packet_entries.append(item)
        included_ids.add(event_id)
        used_tokens += tokens

    contradictions = []
    for item in packet_entries:
        payload = item["payload"]
        if not isinstance(payload, Mapping) or payload.get("schema") != "memory-relationship/v1" or payload.get("relationship_type") != "contradicts":
            continue
        rel_id = str(payload["relationship_id"])
        resolvers = []
        for other in packet_entries:
            other_payload = other["payload"]
            if isinstance(other_payload, Mapping) and other_payload.get("schema") == "memory-relationship/v1" and other_payload.get("relationship_type") == "resolved_by" and rel_id in {other_payload.get("source_ref"), other_payload.get("target_ref")}:
                resolvers.append(other["event_id"])
        contradictions.append(
            {
                "relationship_event_id": item["event_id"],
                "relationship_id": rel_id,
                "source_ref": payload["source_ref"],
                "target_ref": payload["target_ref"],
                "qualifier": payload["qualifier"],
                "status": "resolved" if resolvers else "unresolved",
                "resolver_event_ids": sorted(resolvers),
            }
        )
    contradictions.sort(key=lambda row: row["relationship_event_id"])

    abstentions = []
    if not candidate_base:
        abstentions.append("no-authorized-time-valid-resolvable-records")
    elif not seeds:
        abstentions.append("no-records-match-closed-query-filters")
    elif not ranked:
        abstentions.append("no-hybrid-candidates")
    elif not packet_entries:
        abstentions.append("context-token-budget-cannot-fit-any-result")

    omissions_list = [
        {"reason": reason, "count": count}
        for reason, count in sorted(omissions.items()) if count
    ]
    query_dict = query.to_dict()
    entitlement_commitment = canonical_sha256(sorted(access_scope.entitlement_ids))
    content = {
        "compiler": {
            "name": "memory_retrieval",
            "version": COMPILER_VERSION,
            "canonical_json": "memory-canonical-json/v1",
        },
        "query": query_dict,
        "effective_scope": {
            "scope_id": access_scope.scope_id,
            "policy_version": access_scope.policy_version,
            "classifications": list(effective_classes),
            "source_tiers": list(effective_tiers),
            "embedding_classifications": sorted(set(access_scope.embedding_classifications) & set(effective_classes)),
            "entitlement_set_sha256": "sha256:" + entitlement_commitment,
            "policy_evaluated_at": evaluated_at,
        },
        "projection": {"schema": PROJECTION_SCHEMA, "digest": "sha256:" + projection.digest},
        "embedding": embedding_metadata,
        "ranking": {
            "fusion": FUSION_VERSION,
            "rrf_k": RRF_K,
            "reranker": RERANK_VERSION,
            "candidate_counts": {name: len(values) for name, values in sorted(rankings.items())},
            "tie_breaker": "event-id-ascending",
        },
        "accounting": {
            "token_estimator": TOKEN_ESTIMATOR,
            "accounted_part": "entries-without-entry-accounting",
            "entry_utf8_bytes": sum(item["accounting"]["utf8_bytes"] for item in packet_entries),
            "estimated_context_tokens": used_tokens,
            "max_context_tokens": query.max_context_tokens,
        },
        "entries": packet_entries,
        "contradictions": contradictions,
        "omissions": omissions_list,
        "abstention_reasons": sorted(abstentions),
    }
    content_digest = canonical_sha256(content)
    packet = {
        "schema": PACKET_SCHEMA,
        "context_packet_id": _make_packet_id(content_digest),
        "content_sha256": "sha256:" + content_digest,
        "content": content,
    }
    packet_bytes = canonical_json_bytes(packet)
    packet_digest = hashlib.sha256(packet_bytes).hexdigest()

    object_refs = {}
    evidence_refs = set()
    for item in packet_entries:
        evidence_refs.update(item["evidence_refs"])
        for row in item["resolutions"]:
            if row.get("object_id") and row.get("manifest_sha256"):
                key = (row["object_id"], row["acquisition_id"], row["source_version_id"], row["manifest_sha256"])
                object_refs[key] = {
                    "object_id": row["object_id"],
                    "acquisition_id": row["acquisition_id"],
                    "source_version_id": row["source_version_id"],
                    "manifest_sha256": row["manifest_sha256"],
                }
    manifest = {
        "schema": MANIFEST_SCHEMA,
        "context_packet_id": packet["context_packet_id"],
        "packet_sha256": "sha256:" + packet_digest,
        "packet_byte_length": len(packet_bytes),
        "query_sha256": "sha256:" + canonical_sha256(query_dict),
        "projection_digest": "sha256:" + projection.digest,
        "compiler_version": COMPILER_VERSION,
        "token_estimator": TOKEN_ESTIMATOR,
        "embedding": embedding_metadata,
        "evaluated_at": evaluated_at,
        "lineage": {
            "event_ids": sorted(included_ids),
            "evidence_refs": sorted(evidence_refs),
            "object_refs": [object_refs[key] for key in sorted(object_refs)],
        },
        "manifest_sha256": "sha256:" + "0" * 64,
    }
    manifest["manifest_sha256"] = "sha256:" + _manifest_hash(manifest)
    verify_context_packet(packet, manifest)
    return ContextPacketResult(
        packet=packet, manifest=manifest, packet_bytes=packet_bytes,
        packet_sha256="sha256:" + packet_digest,
    )


def verify_context_packet(packet: Any, manifest: Any) -> None:
    """Fail closed unless packet and manifest hashes/lineage commitments agree."""
    if not isinstance(packet, Mapping) or set(packet) != {"schema", "context_packet_id", "content_sha256", "content"}:
        raise RetrievalError("context packet top level is not closed")
    if packet.get("schema") != PACKET_SCHEMA or not isinstance(packet.get("content"), Mapping):
        raise RetrievalError("context packet schema/content is invalid")
    content = packet["content"]
    if set(content) != {
        "compiler", "query", "effective_scope", "projection", "embedding", "ranking",
        "accounting", "entries", "contradictions", "omissions", "abstention_reasons",
    }:
        raise RetrievalError("context packet content is not closed")
    parsed_query = QuerySpec.from_dict(content.get("query"))
    if content.get("query") != parsed_query.to_dict():
        raise RetrievalError("context packet query is not in canonical closed form")
    closed_sections = {
        "compiler": {"name", "version", "canonical_json"},
        "effective_scope": {
            "scope_id", "policy_version", "classifications", "source_tiers",
            "embedding_classifications", "entitlement_set_sha256", "policy_evaluated_at",
        },
        "projection": {"schema", "digest"},
        "ranking": {"fusion", "rrf_k", "reranker", "candidate_counts", "tie_breaker"},
        "accounting": {
            "token_estimator", "accounted_part", "entry_utf8_bytes",
            "estimated_context_tokens", "max_context_tokens",
        },
    }
    for name, keys in closed_sections.items():
        value = content.get(name)
        if not isinstance(value, Mapping) or set(value) != keys:
            raise RetrievalError(f"context packet {name} is not closed")
    if content["compiler"] != {
        "name": "memory_retrieval",
        "version": COMPILER_VERSION,
        "canonical_json": "memory-canonical-json/v1",
    }:
        raise RetrievalError("context packet compiler metadata is unsupported")
    effective = content["effective_scope"]
    effective_classes_value = effective.get("classifications")
    effective_tiers_value = effective.get("source_tiers")
    effective_embedding_value = effective.get("embedding_classifications")
    if (
        not isinstance(effective.get("scope_id"), str)
        or _MODULE_RE.fullmatch(effective["scope_id"]) is None
        or not isinstance(effective.get("policy_version"), str)
        or not 1 <= len(effective["policy_version"]) <= 128
        or not isinstance(effective_classes_value, list)
        or not 1 <= len(effective_classes_value) <= 5
        or any(not isinstance(item, str) for item in effective_classes_value)
        or effective_classes_value != sorted(set(effective_classes_value))
        or set(effective_classes_value) - set(CLASSIFICATIONS)
        or not isinstance(effective_tiers_value, list)
        or not 1 <= len(effective_tiers_value) <= 10
        or any(not isinstance(tier, int) or isinstance(tier, bool) or not 1 <= tier <= 10 for tier in effective_tiers_value)
        or effective_tiers_value != sorted(set(effective_tiers_value))
        or not isinstance(effective_embedding_value, list)
        or len(effective_embedding_value) > 5
        or any(not isinstance(item, str) for item in effective_embedding_value)
        or effective_embedding_value != sorted(set(effective_embedding_value))
        or set(effective_embedding_value) - set(effective_classes_value)
        or not isinstance(effective.get("entitlement_set_sha256"), str)
        or _SHA256_RE.fullmatch(effective["entitlement_set_sha256"]) is None
    ):
        raise RetrievalError("context packet effective scope is invalid")
    if (
        set(effective_classes_value) - set(parsed_query.permitted_classifications)
        or set(effective_tiers_value) - set(parsed_query.permitted_source_tiers)
    ):
        raise RetrievalError("context packet effective scope widens the closed query")
    try:
        policy_evaluated_at = _normalized_datetime(
            effective.get("policy_evaluated_at"), field="policy_evaluated_at"
        )
    except ProjectionError as exc:
        raise RetrievalError("context packet policy evaluation time is invalid") from exc
    if effective.get("policy_evaluated_at") != policy_evaluated_at:
        raise RetrievalError("context packet policy evaluation time is not canonical UTC")
    if parse_aware_datetime(policy_evaluated_at) < parse_aware_datetime(
        parsed_query.as_of_system_time
    ):
        raise RetrievalError(
            "context packet policy evaluation time precedes its query system-time cutoff"
        )
    if content["projection"].get("schema") != PROJECTION_SCHEMA or _SHA256_RE.fullmatch(
        str(content["projection"].get("digest"))
    ) is None:
        raise RetrievalError("context packet projection metadata is invalid")
    ranking = content["ranking"]
    if ranking.get("fusion") != FUSION_VERSION or ranking.get("rrf_k") != RRF_K or ranking.get("reranker") != RERANK_VERSION or ranking.get("tie_breaker") != "event-id-ascending":
        raise RetrievalError("context packet ranking metadata is unsupported")
    candidate_counts = content["ranking"].get("candidate_counts")
    if not isinstance(candidate_counts, Mapping) or set(candidate_counts) != {"embedding", "lexical", "structured"}:
        raise RetrievalError("context packet candidate_counts is not closed")
    if any(not isinstance(value, int) or isinstance(value, bool) or value < 0 for value in candidate_counts.values()):
        raise RetrievalError("context packet candidate counts are invalid")
    embedding = content.get("embedding")
    if embedding is not None and (
        not isinstance(embedding, Mapping)
        or set(embedding) != {
            "schema", "provider", "model", "version", "dimensions",
            "policy_partition", "indexed_event_count",
        }
    ):
        raise RetrievalError("context packet embedding metadata is not closed")
    if embedding is not None:
        EmbeddingMetadata(
            provider=embedding.get("provider"), model=embedding.get("model"),
            version=embedding.get("version"), dimensions=embedding.get("dimensions"),
        )
        partition = embedding.get("policy_partition")
        indexed_count = embedding.get("indexed_event_count")
        if (
            embedding.get("schema") != "memory-embedding-index-metadata/v1"
            or not isinstance(indexed_count, int)
            or isinstance(indexed_count, bool)
            or indexed_count < 0
            or not isinstance(partition, list)
            or len(partition) > 5
            or any(not isinstance(item, str) for item in partition)
            or partition != sorted(set(partition))
            or set(partition) - set(effective_embedding_value)
        ):
            raise RetrievalError("context packet embedding metadata is invalid")
        if indexed_count != candidate_counts["embedding"]:
            raise RetrievalError("context packet embedding candidate count is stale")
    elif candidate_counts["embedding"] != 0:
        raise RetrievalError("context packet has embedding candidates without model metadata")
    entries = content.get("entries")
    if not isinstance(entries, list) or len(entries) > 100:
        raise RetrievalError("context packet entries are invalid")
    entry_keys = {
        "event_id", "record_id", "record_type", "event_type", "subject_ids", "system_time",
        "valid_time", "policy", "source_tiers", "producer", "run_id", "canonical_provenance", "payload",
        "evidence_refs", "derived_from", "supersedes", "resolutions", "retrieval", "accounting",
    }
    entry_bytes = 0
    entry_tokens = 0
    entry_ids: set[str] = set()
    for entry in entries:
        if not isinstance(entry, Mapping) or set(entry) != entry_keys:
            raise RetrievalError("context packet entry is not closed")
        for nested, keys in (
            ("valid_time", {"from", "to"}),
            ("policy", {"classification", "retention", "retain_until"}),
            ("producer", {"kind", "name", "runtime", "model", "prompt_program_sha"}),
            ("retrieval", {"candidate_sources", "rrf_score", "rerank_bonus_micros", "expanded_from_event_id"}),
            ("accounting", {"accounted_part", "utf8_bytes", "estimated_tokens"}),
        ):
            value = entry.get(nested)
            if not isinstance(value, Mapping) or set(value) != keys:
                raise RetrievalError(f"context packet entry {nested} is not closed")
        event_id = entry.get("event_id")
        if (
            not isinstance(event_id, str)
            or _EVENT_ID_RE.fullmatch(event_id) is None
            or event_id in entry_ids
        ):
            raise RetrievalError("context packet event IDs are invalid or duplicated")
        _verify_packet_payload(entry)
        _verify_entry_envelope(entry)
        for name, maximum in (
            ("subject_ids", 128),
            ("evidence_refs", 1024),
            ("derived_from", 1024),
            ("supersedes", 1024),
        ):
            values = entry.get(name)
            if (
                not isinstance(values, list)
                or len(values) > maximum
                or any(not isinstance(item, str) for item in values)
                or values != sorted(set(values))
            ):
                raise RetrievalError(f"context packet {name} is not canonical")
        entry_ids.add(event_id)
        record_id = entry.get("record_id")
        if not isinstance(record_id, str) or not 1 <= len(record_id) <= 256:
            raise RetrievalError("context packet record ID is invalid")
        if entry.get("record_type") != _record_type(entry) or entry.get("record_id") != _record_id(entry):
            raise RetrievalError("context packet entry record identity is invalid")
        source_tiers = entry.get("source_tiers")
        if (
            not isinstance(source_tiers, list)
            or not 1 <= len(source_tiers) <= 10
            or any(
                not isinstance(tier, int)
                or isinstance(tier, bool)
                or not 1 <= tier <= 10
                for tier in source_tiers
            )
            or source_tiers != sorted(set(source_tiers))
        ):
            raise RetrievalError("context packet source tiers are invalid")
        if entry["policy"].get("classification") not in effective["classifications"] or not set(source_tiers).intersection(effective["source_tiers"]):
            raise RetrievalError("context packet entry is outside the effective access scope")
        try:
            normalized_system_time = _normalized_datetime(
                entry["system_time"], field="entry.system_time"
            )
            if normalized_system_time != entry["system_time"]:
                raise RetrievalError("context packet entry system time is not canonical UTC")
            system_time = parse_aware_datetime(normalized_system_time)
            if system_time > parse_aware_datetime(parsed_query.as_of_system_time):
                raise RetrievalError("context packet contains a post-cutoff event")
        except (KeyError, TypeError, ValueError, ProjectionError) as exc:
            raise RetrievalError("context packet entry system time is invalid") from exc
        valid_from_value = entry["valid_time"]["from"]
        valid_to_value = entry["valid_time"]["to"]
        normalized_valid_from, entry_valid_from = _packet_valid_endpoint(
            valid_from_value, field="entry.valid_time.from", is_end=False
        )
        if normalized_valid_from != valid_from_value:
            raise RetrievalError("context packet valid_time.from is not canonical")
        if valid_to_value is None:
            entry_valid_to = dt.datetime.max.replace(tzinfo=dt.timezone.utc)
        else:
            normalized_valid_to, entry_valid_to = _packet_valid_endpoint(
                valid_to_value, field="entry.valid_time.to", is_end=True
            )
            if normalized_valid_to != valid_to_value:
                raise RetrievalError("context packet valid_time.to is not canonical")
        if entry_valid_from > entry_valid_to:
            raise RetrievalError("context packet valid-time interval is inverted")
        query_valid_from = parse_aware_datetime(parsed_query.valid_from)
        query_valid_to = parse_aware_datetime(parsed_query.valid_to)
        if entry_valid_from > query_valid_to or entry_valid_to < query_valid_from:
            raise RetrievalError("context packet entry is outside the query valid-time window")
        _verify_canonical_provenance(entry)
        retention = entry["policy"].get("retention")
        if retention == "expires":
            retain_until = entry["policy"].get("retain_until")
            if not isinstance(retain_until, str) or parse_aware_datetime(retain_until) <= parse_aware_datetime(policy_evaluated_at):
                raise RetrievalError("context packet contains expired content")
        if retention == "source-policy" and not entry.get("resolutions"):
            raise RetrievalError("context packet contains unresolved source-policy content")
        resolutions = entry.get("resolutions")
        if not isinstance(resolutions, list) or len(resolutions) > 1024:
            raise RetrievalError("context packet resolutions are invalid")
        for resolution in resolutions:
            if not isinstance(resolution, Mapping) or set(resolution) != _RESOLUTION_FIELDS:
                raise RetrievalError("context packet resolution metadata is not closed")
            if not isinstance(resolution.get("policy"), Mapping) or set(resolution["policy"]) != {
                "classification", "retention", "retain_until",
            }:
                raise RetrievalError("context packet resolution policy is not closed")
            try:
                normalized, _ = _resolution_mapping(resolution)
            except RetrievalError as exc:
                raise RetrievalError("context packet resolution metadata is invalid") from exc
            if normalized["policy"] != entry["policy"]:
                raise RetrievalError("context packet resolution policy differs from its event")
            if normalized["event_id"] is not None and normalized["event_id"] != event_id:
                raise RetrievalError("context packet resolution names a different event")
        try:
            canonical_resolutions = sorted(resolutions, key=canonical_json)
        except (TypeError, ValueError, UnicodeError) as exc:
            raise RetrievalError("context packet resolutions are not canonical JSON") from exc
        if resolutions != canonical_resolutions:
            raise RetrievalError("context packet resolutions are not in canonical order")
        if _material(entry) and not resolutions:
            raise RetrievalError("context packet material entry lacks exact resolution metadata")
        for object_id, digest, acquisition_id, source_version_id in _expected_object_refs(entry):
            if not any(
                row.get("object_id") == object_id
                and row.get("content_sha256") == digest
                and row.get("acquisition_id") == acquisition_id
                and row.get("source_version_id") == source_version_id
                for row in resolutions
            ):
                raise RetrievalError("context packet exact object lineage is unresolved")
        candidate_sources = entry["retrieval"].get("candidate_sources")
        if (
            not isinstance(candidate_sources, list)
            or not 1 <= len(candidate_sources) <= 4
            or any(not isinstance(item, str) for item in candidate_sources)
            or candidate_sources != sorted(set(candidate_sources))
            or set(candidate_sources) - {"structured", "lexical", "embedding", "graph"}
        ):
            raise RetrievalError("context packet retrieval sources are invalid")
        score_text = entry["retrieval"].get("rrf_score")
        score_match = (
            re.fullmatch(r"([0-9]+)/([1-9][0-9]*)", score_text)
            if isinstance(score_text, str) and len(score_text) <= 128
            else None
        )
        if score_match is None or math.gcd(
            int(score_match.group(1)), int(score_match.group(2))
        ) != 1:
            raise RetrievalError("context packet RRF score is invalid or non-canonical")
        bonus = entry["retrieval"].get("rerank_bonus_micros")
        if not isinstance(bonus, int) or isinstance(bonus, bool) or bonus < 0:
            raise RetrievalError("context packet rerank bonus is invalid")
        expanded_from = entry["retrieval"].get("expanded_from_event_id")
        if expanded_from is not None and (
            not isinstance(expanded_from, str)
            or _EVENT_ID_RE.fullmatch(expanded_from) is None
            or expanded_from not in entry_ids - {event_id}
        ):
            raise RetrievalError("context packet graph expansion parent is invalid")
        core = dict(entry)
        accounting = core.pop("accounting")
        raw_length = len(canonical_json_bytes(core))
        tokens = (raw_length + 3) // 4
        if accounting != {
            "accounted_part": "entry-without-accounting",
            "utf8_bytes": raw_length,
            "estimated_tokens": tokens,
        }:
            raise RetrievalError("context packet entry accounting is stale")
        entry_bytes += raw_length
        entry_tokens += tokens
    contradictions = content.get("contradictions")
    if not isinstance(contradictions, list) or len(contradictions) > 100 or any(
        not isinstance(row, Mapping) or set(row) != {
            "relationship_event_id", "relationship_id", "source_ref", "target_ref",
            "qualifier", "status", "resolver_event_ids",
        }
        for row in contradictions
    ):
        raise RetrievalError("context packet contradictions are not closed")
    expected_contradictions = []
    for item in entries:
        payload = item["payload"]
        if (
            not isinstance(payload, Mapping)
            or payload.get("schema") != "memory-relationship/v1"
            or payload.get("relationship_type") != "contradicts"
        ):
            continue
        relationship_id = payload["relationship_id"]
        resolvers = []
        for other in entries:
            other_payload = other["payload"]
            if (
                isinstance(other_payload, Mapping)
                and other_payload.get("schema") == "memory-relationship/v1"
                and other_payload.get("relationship_type") == "resolved_by"
                and relationship_id
                in {other_payload.get("source_ref"), other_payload.get("target_ref")}
            ):
                resolvers.append(other["event_id"])
        expected_contradictions.append(
            {
                "relationship_event_id": item["event_id"],
                "relationship_id": relationship_id,
                "source_ref": payload["source_ref"],
                "target_ref": payload["target_ref"],
                "qualifier": payload["qualifier"],
                "status": "resolved" if resolvers else "unresolved",
                "resolver_event_ids": sorted(resolvers),
            }
        )
    expected_contradictions.sort(key=lambda row: row["relationship_event_id"])
    if contradictions != expected_contradictions:
        raise RetrievalError("context packet contradiction view is stale or invalid")
    omissions = content.get("omissions")
    if not isinstance(omissions, list) or len(omissions) > 128 or any(
        not isinstance(row, Mapping) or set(row) != {"reason", "count"}
        for row in omissions
    ):
        raise RetrievalError("context packet omissions are not closed")
    if any(
        not isinstance(row.get("reason"), str)
        or re.fullmatch(r"[a-z][a-z0-9-]{0,127}", row["reason"]) is None
        or not isinstance(row.get("count"), int)
        or isinstance(row.get("count"), bool)
        or row["count"] < 1
        for row in omissions
    ):
        raise RetrievalError("context packet omission values are invalid")
    if omissions != sorted(omissions, key=lambda row: row["reason"]) or len(
        {row["reason"] for row in omissions}
    ) != len(omissions):
        raise RetrievalError("context packet omissions are not in canonical order")
    abstentions = content.get("abstention_reasons")
    if (
        not isinstance(abstentions, list)
        or len(abstentions) > 1
        or any(
            not isinstance(reason, str)
            or not 1 <= len(reason) <= 256
            or reason not in _ABSTENTION_REASONS
            for reason in abstentions
        )
        or abstentions != sorted(set(abstentions))
    ):
        raise RetrievalError("context packet abstention reasons are invalid")
    if bool(entries) == bool(abstentions):
        raise RetrievalError("context packet abstention state disagrees with its entries")
    packet_accounting = content["accounting"]
    if packet_accounting != {
        "token_estimator": TOKEN_ESTIMATOR,
        "accounted_part": "entries-without-entry-accounting",
        "entry_utf8_bytes": entry_bytes,
        "estimated_context_tokens": entry_tokens,
        "max_context_tokens": parsed_query.max_context_tokens,
    } or entry_tokens > parsed_query.max_context_tokens:
        raise RetrievalError("context packet accounting is stale")
    content_digest = canonical_sha256(packet["content"])
    if packet.get("content_sha256") != "sha256:" + content_digest or packet.get("context_packet_id") != _make_packet_id(content_digest):
        raise RetrievalError("context packet content hash or deterministic ID is invalid")
    if not isinstance(manifest, Mapping) or set(manifest) != {
        "schema", "context_packet_id", "packet_sha256", "packet_byte_length", "query_sha256",
        "projection_digest", "compiler_version", "token_estimator", "embedding", "evaluated_at",
        "lineage", "manifest_sha256",
    }:
        raise RetrievalError("context packet manifest is not closed")
    if manifest.get("schema") != MANIFEST_SCHEMA or manifest.get("context_packet_id") != packet["context_packet_id"]:
        raise RetrievalError("context packet manifest identity is invalid")
    if manifest.get("compiler_version") != COMPILER_VERSION or manifest.get("token_estimator") != TOKEN_ESTIMATOR:
        raise RetrievalError("context packet manifest compiler metadata is unsupported")
    for name in (
        "packet_sha256", "query_sha256", "projection_digest", "manifest_sha256",
    ):
        value = manifest.get(name)
        if not isinstance(value, str) or _SHA256_RE.fullmatch(value) is None:
            raise RetrievalError(f"context packet manifest {name} is invalid")
    packet_bytes = canonical_json_bytes(packet)
    if manifest.get("packet_sha256") != "sha256:" + hashlib.sha256(packet_bytes).hexdigest() or manifest.get("packet_byte_length") != len(packet_bytes):
        raise RetrievalError("context packet manifest does not bind the packet bytes")
    if manifest.get("manifest_sha256") != "sha256:" + _manifest_hash(manifest):
        raise RetrievalError("context packet manifest hash is invalid")
    if manifest.get("query_sha256") != "sha256:" + canonical_sha256(content.get("query")):
        raise RetrievalError("context packet manifest query hash is invalid")
    if manifest.get("projection_digest") != content.get("projection", {}).get("digest"):
        raise RetrievalError("context packet manifest projection digest is invalid")
    if manifest.get("embedding") != content.get("embedding"):
        raise RetrievalError("context packet manifest embedding metadata is invalid")
    if manifest.get("evaluated_at") != content.get("effective_scope", {}).get("policy_evaluated_at"):
        raise RetrievalError("context packet manifest policy evaluation time is invalid")
    lineage = manifest.get("lineage")
    if not isinstance(lineage, Mapping) or set(lineage) != {"event_ids", "evidence_refs", "object_refs"}:
        raise RetrievalError("context packet manifest lineage is invalid")
    object_refs = lineage.get("object_refs")
    if not isinstance(object_refs, list) or len(object_refs) > 10000 or any(
        not isinstance(row, Mapping) or set(row) != {
            "object_id", "acquisition_id", "source_version_id", "manifest_sha256",
        }
        for row in object_refs
    ):
        raise RetrievalError("context packet manifest object lineage is not closed")
    for row in object_refs:
        if (
            not isinstance(row.get("object_id"), str)
            or _OBJECT_ID_RE.fullmatch(row["object_id"]) is None
            or not isinstance(row.get("acquisition_id"), str)
            or _ACQUISITION_ID_RE.fullmatch(row["acquisition_id"]) is None
            or not isinstance(row.get("source_version_id"), str)
            or _SOURCE_VERSION_ID_RE.fullmatch(row["source_version_id"]) is None
            or not isinstance(row.get("manifest_sha256"), str)
            or _SHA256_RE.fullmatch(row["manifest_sha256"]) is None
        ):
            raise RetrievalError("context packet manifest object lineage value is invalid")
    event_lineage = lineage.get("event_ids")
    evidence_lineage = lineage.get("evidence_refs")
    if (
        not isinstance(event_lineage, list)
        or len(event_lineage) > 100
        or any(
            not isinstance(event_id, str) or _EVENT_ID_RE.fullmatch(event_id) is None
            for event_id in event_lineage
        )
        or event_lineage != sorted(set(event_lineage))
        or not isinstance(evidence_lineage, list)
        or len(evidence_lineage) > 10000
        or any(
            not isinstance(ref, str) or _EVIDENCE_REF_RE.fullmatch(ref) is None
            for ref in evidence_lineage
        )
        or evidence_lineage != sorted(set(evidence_lineage))
    ):
        raise RetrievalError("context packet manifest event/evidence lineage is invalid")
    event_ids = sorted(item["event_id"] for item in content.get("entries", []))
    evidence_refs = sorted({ref for item in content.get("entries", []) for ref in item["evidence_refs"]})
    if lineage.get("event_ids") != event_ids or lineage.get("evidence_refs") != evidence_refs:
        raise RetrievalError("context packet manifest event/evidence lineage is stale")
    expected_objects = {}
    for item in content.get("entries", []):
        for row in item["resolutions"]:
            if row.get("object_id") and row.get("manifest_sha256"):
                key = (row["object_id"], row["acquisition_id"], row["source_version_id"], row["manifest_sha256"])
                expected_objects[key] = {
                    "object_id": row["object_id"],
                    "acquisition_id": row["acquisition_id"],
                    "source_version_id": row["source_version_id"],
                    "manifest_sha256": row["manifest_sha256"],
                }
    if object_refs != [expected_objects[key] for key in sorted(expected_objects)]:
        raise RetrievalError("context packet manifest object lineage is stale")


def run_retrieval_rebuild_drill(
    first_database: str | Path,
    second_database: str | Path,
    **compile_kwargs: Any,
) -> dict[str, Any]:
    """Compile against two clean rebuilds and require byte-identical packet/manifest output."""
    first = compile_context_packet(first_database, **compile_kwargs)
    second = compile_context_packet(second_database, **compile_kwargs)
    if first.packet_bytes != second.packet_bytes or first.manifest != second.manifest:
        raise RetrievalError("clean retrieval rebuild changed packet or manifest bytes")
    return {
        "schema": "memory-retrieval-rebuild-drill/v1",
        "ok": True,
        "packet_sha256": first.packet_sha256,
        "manifest_sha256": first.manifest["manifest_sha256"],
        "projection_digest": first.manifest["projection_digest"],
    }


def build_context_packet_object_manifest(
    result: ContextPacketResult,
    *,
    acquisition_id: str,
    source_version_id: str,
    locator: Mapping[str, Any],
    provenance: Mapping[str, Any],
    created_at: str,
    policy: Mapping[str, Any],
) -> dict[str, Any]:
    """Adapt packet bytes/lineage to ``memory-object-manifest/v1`` for MemoryStore."""
    verify_context_packet(result.packet, result.manifest)
    expected_packet_bytes = canonical_json_bytes(result.packet)
    expected_packet_sha256 = "sha256:" + hashlib.sha256(expected_packet_bytes).hexdigest()
    if (
        result.packet_bytes != expected_packet_bytes
        or result.packet_sha256 != expected_packet_sha256
    ):
        raise RetrievalError("context packet result bytes/hash are stale")
    object_id = "object:sha256:" + result.packet_sha256.removeprefix("sha256:")
    manifest = {
        "schema": "memory-object-manifest/v1",
        "object_id": object_id,
        "acquisition_id": acquisition_id,
        "source_version_id": source_version_id,
        "object_kind": "context-packet",
        "content_sha256": result.packet_sha256,
        "byte_length": len(result.packet_bytes),
        "media_type": "application/vnd.memory.context-packet+json",
        "locator": dict(locator),
        "source_lineage": {
            "source_id": None,
            "source_object": None,
            "derived_from_objects": list(result.manifest["lineage"]["object_refs"]),
        },
        "provenance": dict(provenance),
        "created_at": created_at,
        "policy": dict(policy),
    }
    output_policy = manifest["policy"]
    if isinstance(output_policy, Mapping) and output_policy.get("retention") == "tombstone-only":
        raise RetrievalError(
            "context packet objects cannot use tombstone-only retention in MemoryStore"
        )
    errors = validate_object_manifest(manifest)
    if errors:
        raise RetrievalError("context packet object manifest is invalid: " + "; ".join(errors[:8]))
    context_lineage = manifest["provenance"].get("context_packet")
    if context_lineage != {
        "context_packet_id": result.packet["context_packet_id"],
        "sha256": result.packet_sha256,
    }:
        raise RetrievalError("context packet object provenance does not bind the packet bytes")
    upstream_policies = []
    for entry in result.packet["content"]["entries"]:
        upstream_policies.append(entry["policy"])
        upstream_policies.extend(row["policy"] for row in entry["resolutions"])

    upstream_retentions = {item["retention"] for item in upstream_policies}
    if {"source-policy", "expires"}.issubset(upstream_retentions):
        raise RetrievalError(
            "context packet object has no storable retention intersection for mixed "
            "source-policy and expires lineage"
        )

    for upstream in upstream_policies:
        if output_policy["classification"] not in _CLASSIFICATION_DERIVATIVES[upstream["classification"]]:
            raise RetrievalError("context packet object policy widens an upstream classification")
        if upstream["retention"] == "source-policy" and output_policy["retention"] != "source-policy":
            raise RetrievalError("context packet object retention outlives source-policy upstream")
        if upstream["retention"] == "expires":
            if output_policy["retention"] != "expires":
                raise RetrievalError("context packet object retention outlives expiring upstream")
            if parse_aware_datetime(output_policy["retain_until"]) > parse_aware_datetime(upstream["retain_until"]):
                raise RetrievalError("context packet object expiry is later than an upstream expiry")
    return manifest
