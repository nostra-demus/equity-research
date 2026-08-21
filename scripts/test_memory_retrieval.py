#!/usr/bin/env python3
"""Focused Phase 3 hybrid retrieval, policy, lineage, and packet regressions."""
from __future__ import annotations

import copy
import hashlib
import json
import tempfile
import uuid
from pathlib import Path
from typing import Any, Mapping, Sequence

from canonical_json import canonical_json_bytes, canonical_sha256
from memory_contract import seal_event
from memory_projection import build_projection
from memory_retrieval import (
    AccessScope,
    ClosedEvidenceManifestCorpus,
    CompositeEvidenceVerifier,
    EmbeddingMetadata,
    QuerySpec,
    RetrievalError,
    build_context_packet_object_manifest,
    compile_context_packet,
    run_retrieval_rebuild_drill,
    verify_context_packet,
)
from memory_resolver import CompositeMemoryResolver
from memory_store import MemoryStore
from memory_retrieval_benchmark import (
    assert_retrieval_benchmark_gate,
    build_retrieval_benchmark_report,
)


UUIDS = [f"00000000-0000-5000-8000-{index:012d}" for index in range(1, 50)]
SUBJECT = "issuer:lei:5493001KJTIIGC8Y1R12"
SOURCE_DIGEST = "a" * 64
SOURCE_ID = "source:sha256:" + SOURCE_DIGEST
EVIDENCE_ID = "evidence:sha256:" + SOURCE_DIGEST + "#page-1"


def _event(
    ordinal: int,
    event_type: str,
    payload: dict[str, Any],
    *,
    system_time: str,
    classification: str = "public",
    evidence_refs: Sequence[str] = (),
    subject: str = SUBJECT,
) -> dict[str, Any]:
    return seal_event(
        {
            "schema": "memory-event/v1",
            "event_id": "evt_" + UUIDS[ordinal - 1],
            "event_type": event_type,
            "subject_ids": [subject],
            "valid_time": {"from": "2026-01-01", "to": None},
            "system_time": system_time,
            "producer": {
                "kind": "system",
                "name": "retrieval-test",
                "runtime": "python",
                "model": None,
                "prompt_program_sha": None,
            },
            "run_id": "run_" + UUIDS[20],
            "trace_id": None,
            "payload": payload,
            "evidence_refs": list(evidence_refs),
            "derived_from": [],
            "supersedes": [],
            "integrity": {"payload_sha256": "0" * 64, "signature": None},
            "policy": {
                "classification": classification,
                "retention": "permanent",
                "retain_until": None,
            },
        }
    )


def _source(ordinal: int = 1, *, classification: str = "public", title: str = "Public margin filing") -> dict[str, Any]:
    return _event(
        ordinal,
        "source.ingested",
        {
            "schema": "memory-source/v1",
            "source_id": SOURCE_ID if classification == "public" else "source:sha256:" + "f" * 64,
            "document_id": "document_" + UUIDS[ordinal + 8],
            "title": title,
            "issuer_ids": [SUBJECT],
            "source_tier": 1,
            "publication_date": "2026-01-01",
            "filing_date": "2026-01-01",
            "effective_date": "2025-12-31",
            "language": "en",
            "licence": {"name": None, "uri": None, "expires_at": None, "derived_data": "allowed"},
            "uri": None,
            "content_sha256": "sha256:" + (SOURCE_DIGEST if classification == "public" else "f" * 64),
            "mime_type": "application/pdf",
            "byte_length": 100,
            "extraction_status": "succeeded",
        },
        system_time="2026-01-02T00:00:00Z",
        classification=classification,
    )


def _evidence() -> dict[str, Any]:
    return _event(
        2,
        "evidence.recorded",
        {
            "schema": "memory-evidence-span/v1",
            "evidence_id": EVIDENCE_ID,
            "source_id": SOURCE_ID,
            "source_sha256": "sha256:" + SOURCE_DIGEST,
            "locator": {
                "kind": "page", "ref": "page-1", "page": 1, "section": "Margins",
                "table": None, "cell": None, "char_start": 0, "char_end": 40,
            },
            "language": "en",
            "verbatim_text": "Adjusted margin was 20 percent under the contractual basis.",
            "extraction_method": "native-text",
            "extraction_tool": "synthetic",
            "extraction_version": "1",
            "extraction_confidence": 1.0,
        },
        system_time="2026-01-03T00:00:00Z",
    )


def _claim(
    ordinal: int,
    claim_number: int,
    value: float,
    qualifier: str,
    *,
    system_time: str,
    predicate: str = "adjusted_margin",
    quality: int = 5,
) -> dict[str, Any]:
    return _event(
        ordinal,
        "claim.recorded",
        {
            "schema": "memory-claim/v1",
            "claim_id": "claim_" + UUIDS[claim_number + 9],
            "subject_id": SUBJECT,
            "predicate": predicate,
            "value": value,
            "unit": "percent",
            "currency": None,
            "accounting_standard": "company-adjusted",
            "period": {"from": "2025-10-01", "to": "2025-12-31", "label": "Q4 2025"},
            "scope": {"consolidation": "consolidated", "segment": "Cloud", "geography": None, "security_id": None},
            "qualifier": qualifier,
            "basis": "company-adjusted reporting basis",
            "epistemic_status": "supported",
            "claim_quality": quality,
            "evidence_refs": [EVIDENCE_ID],
            "derived_from_claims": [],
            "material": True,
        },
        system_time=system_time,
        evidence_refs=[EVIDENCE_ID],
    )


def _relationship(first: dict[str, Any], second: dict[str, Any]) -> dict[str, Any]:
    return _event(
        5,
        "relationship.recorded",
        {
            "schema": "memory-relationship/v1",
            "relationship_id": "rel_" + UUIDS[18],
            "relationship_type": "contradicts",
            "source_ref": first["payload"]["claim_id"],
            "target_ref": second["payload"]["claim_id"],
            "qualifier": "The filing and management-adjusted bases disagree.",
            "evidence_refs": [EVIDENCE_ID],
        },
        system_time="2026-01-06T00:00:00Z",
        evidence_refs=[EVIDENCE_ID],
    )


def _legacy_event() -> dict[str, Any]:
    event = _event(
        28,
        "decision.recorded",
        {
            "legacy_schema": "decision-record/v1",
            "record_type": "decision",
            "source_path": "frameworks/decisions/legacy.json",
            "source_locator": "decisions[0]",
            "source_sha256": "e" * 64,
            "source_git_commit": "2" * 40,
            "identity_mapping": {
                "strategy": "native-ids-plus-opaque-source-composites-v1",
                "opaque_uuid_namespace": "bcfa556d-1823-5793-8d33-bd24c14d3ff4",
                "aliases_preserved_under": "record",
            },
            "time_mapping": {
                "system_time_field": "recorded_at",
                "system_time_precision": "instant",
                "system_time_trust": "source",
                "valid_time_field": "effective_date",
                "valid_time_precision": "date",
            },
            "record": {
                "decision_id": "legacy-decision-1",
                "summary": "Legacy authorized margin decision",
                "nested": {"owner": "research", "status": "active"},
            },
        },
        system_time="2026-01-08T00:00:00Z",
    )
    event["producer"] = {
        "kind": "adapter",
        "name": "legacy-decision-adapter",
        "runtime": "python",
        "model": None,
        "prompt_program_sha": None,
    }
    return seal_event(event)


def _source_v2() -> dict[str, Any]:
    return _event(
        19,
        "source.ingested",
        {
            "schema": "memory-source/v2",
            "document_id": "document_" + UUIDS[30],
            "source_version_id": "source-version_" + UUIDS[31],
            "acquisition_id": "acquisition_" + UUIDS[32],
            "source_object_id": "object:sha256:" + "c" * 64,
            "content_sha256": "sha256:" + "c" * 64,
            "acquired_at": "2026-03-01T00:00:00Z",
            "title": "Synthetic exact-object source",
            "issuer_ids": [SUBJECT],
            "source_tier": 1,
            "source_dates": {
                "publication_date": "2026-02-28",
                "filing_date": "2026-02-28",
                "effective_date": "2025-12-31",
            },
            "language": "en",
            "licence": {
                "classification": "public",
                "entitlement": "not-required",
                "terms_sha256": "sha256:" + "d" * 64,
                "expires_at": None,
            },
            "rights": {
                "derivative_use": "allowed",
                "embedding": "allowed",
                "redistribution": "allowed",
            },
            "mime_type": "application/pdf",
            "byte_length": 123,
            "extraction_status": "succeeded",
        },
        system_time="2026-03-01T00:00:00Z",
    )


def _source_v2_manifest(event: Mapping[str, Any], raw: bytes) -> dict[str, Any]:
    payload = event["payload"]
    digest = hashlib.sha256(raw).hexdigest()
    return {
        "schema": "memory-object-manifest/v1",
        "object_id": "object:sha256:" + digest,
        "acquisition_id": payload["acquisition_id"],
        "source_version_id": payload["source_version_id"],
        "object_kind": "source",
        "content_sha256": "sha256:" + digest,
        "byte_length": len(raw),
        "media_type": payload["mime_type"],
        "locator": {
            "kind": "object-uri",
            "value": "r2://memory-test/" + digest,
            "version_id": "sha256:" + digest,
        },
        "source_lineage": {
            "source_id": "source:sha256:" + digest,
            "source_object": None,
            "derived_from_objects": [],
        },
        "provenance": {
            "producer": {
                "producer_id": "producer:retrieval-test",
                "kind": "system",
                "name": "retrieval-test",
            },
            "run_id": event["run_id"],
            "tool": None,
            "extraction": None,
            "prompt_program": None,
            "context_packet": None,
        },
        "created_at": payload["acquired_at"],
        "policy": dict(event["policy"]),
    }


class DeterministicVerifier:
    def __init__(self, denied: Sequence[str] = ()) -> None:
        self.denied = set(denied)
        self.calls: list[str] = []

    def verify_event(
        self,
        event: Mapping[str, Any],
        *,
        principal: object | None,
        as_of_system_time: str,
        valid_time: Mapping[str, str],
        policy_evaluated_at: str,
    ) -> list[dict[str, Any]]:
        event_id = str(event["event_id"])
        self.calls.append(event_id)
        if event_id in self.denied:
            raise FileNotFoundError("synthetic missing evidence")
        content = canonical_json_bytes(event)
        content_digest = hashlib.sha256(content).hexdigest()
        return [
            {
                "schema": "memory-resolution/v1",
                "lane": "synthetic-test",
                "event_id": event_id,
                "repository_revision": "1" * 40,
                "source_path": None,
                "source_locator": None,
                "object_id": "object:sha256:" + content_digest,
                "acquisition_id": "acquisition_" + UUIDS[24],
                "source_version_id": "source-version_" + UUIDS[25],
                "manifest_sha256": "sha256:" + hashlib.sha256((event_id + ":manifest").encode()).hexdigest(),
                "content_sha256": "sha256:" + content_digest,
                "byte_length": len(content),
                "media_type": "application/json",
                "policy": dict(event["policy"]),
            }
        ]


class DeterministicEmbedder:
    metadata = EmbeddingMetadata(
        provider="fixture", model="term-count", version="1", dimensions=4
    )

    def __init__(self) -> None:
        self.seen: list[str] = []

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        self.seen.extend(texts)
        return [
            [
                float(text.casefold().count("margin")),
                float(text.casefold().count("contradict")),
                float(text.casefold().count("cloud")),
                1.0,
            ]
            for text in texts
        ]


class SemanticEmbedder:
    metadata = EmbeddingMetadata(
        provider="fixture", model="semantic-marker", version="1", dimensions=2
    )

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        vectors = []
        for text in texts:
            folded = text.casefold()
            if "semantic-target" in folded or folded == "margin inflection":
                vectors.append([1.0, 0.0])
            elif "lexical-wrong" in folded:
                vectors.append([0.0, 1.0])
            elif "semantic-filler" in folded:
                marker = int(folded.split("semantic-filler-")[1].split()[0].rstrip(".\"}"))
                vectors.append([0.9 - marker * 0.05, 0.1 + marker * 0.05])
            else:
                vectors.append([0.1, 0.9])
        return vectors


def _query() -> dict[str, Any]:
    return {
        "schema": "memory-query-spec/v1",
        "task": "Reconcile the Cloud margin contradiction",
        "requesting_module": "synthesizer",
        "query_text": "cloud margin contradiction",
        "subject_ids": [SUBJECT],
        "as_of_system_time": "2026-06-30T00:00:00Z",
        "valid_time": {"from": "2026-01-01", "to": "2026-06-30"},
        "permitted_source_tiers": [1, 2],
        "permitted_classifications": ["public", "restricted"],
        "event_types": [],
        "record_types": ["memory-claim/v1"],
        "reporting_basis": "company-adjusted",
        "currency": None,
        "metric": "adjusted_margin",
        "segment": "Cloud",
        "max_results": 6,
        "max_context_tokens": 10000,
    }


def _expect_error(fn, contains: str) -> None:
    try:
        fn()
    except RetrievalError as exc:
        assert contains in str(exc), str(exc)
        return
    raise AssertionError(f"expected RetrievalError containing {contains!r}")


def _reseal_packet_manifest(packet: dict[str, Any], manifest: dict[str, Any]) -> None:
    """Recompute every self-hash/accounting field after one hostile test mutation."""
    entries = packet["content"]["entries"]
    for entry in entries:
        core = dict(entry)
        core.pop("accounting", None)
        byte_length = len(canonical_json_bytes(core))
        entry["accounting"] = {
            "accounted_part": "entry-without-accounting",
            "utf8_bytes": byte_length,
            "estimated_tokens": (byte_length + 3) // 4,
        }
    packet["content"]["accounting"]["entry_utf8_bytes"] = sum(
        entry["accounting"]["utf8_bytes"] for entry in entries
    )
    packet["content"]["accounting"]["estimated_context_tokens"] = sum(
        entry["accounting"]["estimated_tokens"] for entry in entries
    )
    content_digest = canonical_sha256(packet["content"])
    packet["content_sha256"] = "sha256:" + content_digest
    packet["context_packet_id"] = "context-packet_" + str(
        uuid.uuid5(uuid.NAMESPACE_URL, "memory-context-packet:" + content_digest)
    )
    packet_bytes = canonical_json_bytes(packet)
    manifest["context_packet_id"] = packet["context_packet_id"]
    manifest["packet_sha256"] = "sha256:" + hashlib.sha256(packet_bytes).hexdigest()
    manifest["packet_byte_length"] = len(packet_bytes)
    manifest["query_sha256"] = "sha256:" + canonical_sha256(packet["content"]["query"])
    manifest["projection_digest"] = packet["content"]["projection"]["digest"]
    manifest["embedding"] = copy.deepcopy(packet["content"]["embedding"])
    manifest["evaluated_at"] = packet["content"]["effective_scope"]["policy_evaluated_at"]
    object_refs: dict[tuple[str, str, str, str], dict[str, str]] = {}
    for entry in entries:
        for resolution in entry["resolutions"]:
            if resolution.get("object_id") and resolution.get("manifest_sha256"):
                key = (
                    resolution["object_id"],
                    resolution["acquisition_id"],
                    resolution["source_version_id"],
                    resolution["manifest_sha256"],
                )
                object_refs[key] = {
                    "object_id": resolution["object_id"],
                    "acquisition_id": resolution["acquisition_id"],
                    "source_version_id": resolution["source_version_id"],
                    "manifest_sha256": resolution["manifest_sha256"],
                }
    manifest["lineage"] = {
        "event_ids": sorted(entry["event_id"] for entry in entries),
        "evidence_refs": sorted(
            {ref for entry in entries for ref in entry["evidence_refs"]}
        ),
        "object_refs": [object_refs[key] for key in sorted(object_refs)],
    }
    unsigned_manifest = dict(manifest)
    unsigned_manifest.pop("manifest_sha256", None)
    manifest["manifest_sha256"] = "sha256:" + canonical_sha256(unsigned_manifest)


def main() -> None:
    schema_root = Path(__file__).resolve().parents[1] / "frameworks/memory"
    for schema_name in (
        "query-spec-v1.schema.json",
        "context-packet-v1.schema.json",
        "context-packet-manifest-v1.schema.json",
    ):
        schema = json.loads((schema_root / schema_name).read_text(encoding="utf-8"))
        pending = [schema]
        while pending:
            node = pending.pop()
            if isinstance(node, dict):
                if node.get("type") == "object":
                    assert node.get("additionalProperties") is False, (
                        f"{schema_name}: every structural object must be closed"
                    )
                pending.extend(node.values())
            elif isinstance(node, list):
                pending.extend(node)

    first_claim = _claim(
        3, 1, 20.0, "Contractual basis, excluding restructuring.",
        system_time="2026-01-04T00:00:00Z",
    )
    second_claim = _claim(
        4, 2, 17.5, "Management-adjusted basis, including restructuring.",
        system_time="2026-01-05T00:00:00Z",
    )
    denied_claim = _claim(
        6, 3, 99.0, "Unresolvable synthetic claim.",
        system_time="2026-01-07T00:00:00Z",
    )
    denied_claim["policy"] = {
        "classification": "public", "retention": "source-policy", "retain_until": None
    }
    denied_claim = seal_event(denied_claim)
    future_claim = _claim(
        7, 4, 42.0, "Future fact must not leak.",
        system_time="2027-01-01T00:00:00Z",
    )
    secret_source = _source(8, classification="restricted", title="SECRET RESTRICTED MARGIN SOURCE")
    semantic_target = _claim(
        9, 5, 12.0, "Margin inflection semantic-target.",
        system_time="2026-02-01T00:00:00Z", predicate="operating_leverage", quality=4,
    )
    lexical_wrong = _claim(
        10, 6, 13.0,
        "Lexical-wrong margin inflection margin inflection margin inflection.",
        system_time="2026-02-02T00:00:00Z", predicate="operating_leverage", quality=5,
    )
    semantic_fillers = [
        _claim(
            11 + index,
            7 + index,
            20.0 + index,
            f"Semantic-filler-{index + 1} unrelated operating leverage evidence.",
            system_time=f"2026-02-{3 + index:02d}T00:00:00Z",
            predicate="operating_leverage",
            quality=2,
        )
        for index in range(8)
    ]
    v2_raw = b"production exact Phase 2 source bytes"
    v2_digest = hashlib.sha256(v2_raw).hexdigest()
    v2_source = _source_v2()
    v2_source["payload"]["source_object_id"] = "object:sha256:" + v2_digest
    v2_source["payload"]["content_sha256"] = "sha256:" + v2_digest
    v2_source["payload"]["byte_length"] = len(v2_raw)
    v2_source = seal_event(v2_source)
    v2_manifest = _source_v2_manifest(v2_source, v2_raw)
    legacy_event = _legacy_event()
    events = [
        _source(), _evidence(), first_claim, second_claim,
        _relationship(first_claim, second_claim), denied_claim, future_claim, secret_source,
        semantic_target, lexical_wrong, *semantic_fillers,
        v2_source, legacy_event,
    ]

    # Runtime schema is closed and list order is normalized before hashing.
    parsed = QuerySpec.from_dict(_query())
    assert parsed.permitted_classifications == ("public", "restricted")
    hostile_query = _query()
    hostile_query["fixture_answer"] = "leak"
    _expect_error(lambda: QuerySpec.from_dict(hostile_query), "exactly")

    with tempfile.TemporaryDirectory(prefix="memory-retrieval-test-") as temp:
        root = Path(temp)
        first_projection = build_projection(events, root / "first.sqlite")
        second_projection = build_projection(reversed(events), root / "second.sqlite")
        assert first_projection.digest == second_projection.digest

        verifier = DeterministicVerifier(denied=[denied_claim["event_id"]])
        embedder = DeterministicEmbedder()
        scope = AccessScope(
            scope_id="public-analyst",
            policy_version="2026-08-21",
            classifications=("public",),
            source_tiers=(1,),
            embedding_classifications=("public",),
        )
        untouched_verifier = DeterministicVerifier()
        untouched_embedder = DeterministicEmbedder()
        _expect_error(
            lambda: compile_context_packet(
                root / "first.sqlite",
                expected_projection_digest="0" * 64,
                query=_query(),
                access_scope=scope,
                evidence_verifier=untouched_verifier,
                evaluated_at="2026-08-21T00:00:00Z",
                embedder=untouched_embedder,
            ),
            "trusted expected digest",
        )
        assert untouched_verifier.calls == []
        assert untouched_embedder.seen == []
        _expect_error(
            lambda: compile_context_packet(
                root / "first.sqlite",
                expected_projection_digest=first_projection.digest,
                query=_query(),
                access_scope=scope,
                evidence_verifier=untouched_verifier,
                evaluated_at="2026-06-29T23:59:59Z",
                embedder=untouched_embedder,
            ),
            "cannot precede",
        )
        assert untouched_verifier.calls == []
        assert untouched_embedder.seen == []
        _expect_error(
            lambda: compile_context_packet(
                root / "first.sqlite",
                expected_projection_digest=first_projection.digest,
                query=_query(),
                access_scope=AccessScope(
                    scope_id="restricted-only",
                    policy_version="1",
                    classifications=("confidential",),
                    source_tiers=(9,),
                    embedding_classifications=(),
                ),
                evidence_verifier=untouched_verifier,
                evaluated_at="2026-08-21T00:00:00Z",
            ),
            "no classification/source-tier intersection",
        )
        result = compile_context_packet(
            root / "first.sqlite",
            expected_projection_digest=first_projection.digest,
            query=_query(),
            access_scope=scope,
            evidence_verifier=verifier,
            evaluated_at="2026-08-21T00:00:00Z",
            embedder=embedder,
        )
        verify_context_packet(result.packet, result.manifest)
        event_ids = [item["event_id"] for item in result.packet["content"]["entries"]]
        assert first_claim["event_id"] in event_ids
        assert second_claim["event_id"] in event_ids
        assert denied_claim["event_id"] not in event_ids
        assert future_claim["event_id"] not in event_ids
        assert secret_source["event_id"] not in verifier.calls
        assert future_claim["event_id"] not in verifier.calls
        assert all(
            "SECRET RESTRICTED" not in text
            and "Future fact" not in text
            and "Unresolvable synthetic claim" not in text
            for text in embedder.seen
        )
        assert result.packet["content"]["contradictions"][0]["status"] == "unresolved"
        reasons = {row["reason"]: row["count"] for row in result.packet["content"]["omissions"]}
        assert reasons["exact-resolution-not-found"] == 1
        assert reasons["requested-classification-outside-trusted-scope"] == 1
        assert reasons["requested-source-tier-outside-trusted-scope"] == 1
        assert result.packet["content"]["embedding"]["dimensions"] == 4
        assert result.packet["content"]["ranking"]["candidate_counts"]["embedding"] >= 2
        assert result.packet["content"]["abstention_reasons"] == []

        # Recompute all self-hashes after each hostile one-node mutation. The
        # public verifier still rejects schema-invalid values: a valid hash is
        # an integrity commitment, not authenticity or contract conformance.
        parity_mutations = [
            (
                "event type",
                lambda packet: packet["content"]["entries"][0].__setitem__("event_type", "BAD"),
                "canonical event contract",
            ),
            (
                "subject",
                lambda packet: packet["content"]["entries"][0].__setitem__("subject_ids", ["not-a-subject"]),
                "canonical event contract",
            ),
            (
                "run ID",
                lambda packet: packet["content"]["entries"][0].__setitem__("run_id", "run-invalid"),
                "canonical event contract",
            ),
            (
                "valid time",
                lambda packet: packet["content"]["entries"][0]["valid_time"].__setitem__("from", "2027-99-99"),
                "canonical event contract",
            ),
            (
                "policy",
                lambda packet: packet["content"]["entries"][0]["policy"].__setitem__("retention", "forever"),
                "canonical event contract",
            ),
            (
                "producer",
                lambda packet: packet["content"]["entries"][0]["producer"].__setitem__("kind", "oracle"),
                "canonical event contract",
            ),
            (
                "RRF score",
                lambda packet: packet["content"]["entries"][0]["retrieval"].__setitem__("rrf_score", "invalid"),
                "RRF score",
            ),
            (
                "contradiction",
                lambda packet: packet["content"]["contradictions"][0].__setitem__("status", "maybe"),
                "contradiction view",
            ),
            (
                "embedding partition",
                lambda packet: packet["content"]["embedding"].__setitem__("policy_partition", ["unknown"]),
                "embedding metadata",
            ),
            (
                "effective scope",
                lambda packet: packet["content"]["effective_scope"].__setitem__("classifications", ["public", "public"]),
                "effective scope",
            ),
            (
                "backdated policy clock",
                lambda packet: packet["content"]["effective_scope"].__setitem__(
                    "policy_evaluated_at", "2026-06-29T23:59:59.000000Z"
                ),
                "precedes",
            ),
            (
                "system time offset",
                lambda packet: packet["content"]["entries"][0].__setitem__("system_time", "2026-01-04T05:30:00+05:30"),
                "system time",
            ),
            (
                "valid window mismatch",
                lambda packet: packet["content"]["entries"][0]["valid_time"].update(
                    {"from": "2024-01-01", "to": "2024-12-31"}
                ),
                "query valid-time window",
            ),
        ]
        for mutation_name, mutate, expected_error in parity_mutations:
            hostile_value_packet = copy.deepcopy(result.packet)
            hostile_value_manifest = copy.deepcopy(result.manifest)
            mutate(hostile_value_packet)
            _reseal_packet_manifest(hostile_value_packet, hostile_value_manifest)
            _expect_error(
                lambda packet=hostile_value_packet, manifest=hostile_value_manifest: verify_context_packet(
                    packet, manifest
                ),
                expected_error,
            )

        # Packet and manifest hashes are acyclic, nested structures are closed,
        # and one-byte/one-field mutations fail verification.
        hostile_packet = copy.deepcopy(result.packet)
        hostile_packet["content"]["ranking"]["fixture_score"] = 1
        _expect_error(
            lambda: verify_context_packet(hostile_packet, result.manifest),
            "ranking is not closed",
        )
        hostile_manifest = copy.deepcopy(result.manifest)
        hostile_manifest["packet_byte_length"] += 1
        _expect_error(
            lambda: verify_context_packet(result.packet, hostile_manifest),
            "packet bytes",
        )

        drill = run_retrieval_rebuild_drill(
            root / "first.sqlite",
            root / "second.sqlite",
            expected_projection_digest=first_projection.digest,
            query=_query(),
            access_scope=scope,
            evidence_verifier=DeterministicVerifier(denied=[denied_claim["event_id"]]),
            evaluated_at="2026-08-21T00:00:00Z",
            embedder=DeterministicEmbedder(),
        )
        assert drill["ok"] is True
        assert drill["packet_sha256"] == result.packet_sha256

        # Arbitrary legacy JSON is a canonical-text capsule, not an open nested
        # protocol object. Runtime verification rejects open fields, stale hashes,
        # and non-canonical JSON before trusting the packet digest.
        legacy_query = _query()
        legacy_query.update(
            {
                "task": "Read the legacy authorized decision",
                "query_text": "legacy margin decision",
                "permitted_source_tiers": [10],
                "permitted_classifications": ["public"],
                "record_types": ["legacy-adapter"],
                "reporting_basis": None,
                "metric": None,
                "segment": None,
                "max_results": 1,
            }
        )
        legacy_result = compile_context_packet(
            root / "first.sqlite",
            expected_projection_digest=first_projection.digest,
            query=legacy_query,
            access_scope=AccessScope(
                scope_id="legacy-reader",
                policy_version="2026-08-21",
                classifications=("public",),
                source_tiers=(10,),
                embedding_classifications=(),
            ),
            evidence_verifier=DeterministicVerifier(),
            evaluated_at="2026-08-21T00:00:00Z",
        )
        verify_context_packet(legacy_result.packet, legacy_result.manifest)
        legacy_payload = legacy_result.packet["content"]["entries"][0]["payload"]
        assert "record" not in legacy_payload
        assert json.loads(legacy_payload["record_canonical_json"])["nested"]["owner"] == "research"
        assert legacy_payload["record_sha256"] == (
            "sha256:"
            + hashlib.sha256(legacy_payload["record_canonical_json"].encode("utf-8")).hexdigest()
        )
        hostile_legacy = copy.deepcopy(legacy_result.packet)
        hostile_legacy["content"]["entries"][0]["payload"]["open_nested_record"] = {
            "untrusted": True
        }
        _expect_error(
            lambda: verify_context_packet(hostile_legacy, legacy_result.manifest),
            "legacy payload is not closed",
        )
        stale_legacy = copy.deepcopy(legacy_result.packet)
        stale_legacy["content"]["entries"][0]["payload"]["record_sha256"] = "sha256:" + "0" * 64
        _expect_error(
            lambda: verify_context_packet(stale_legacy, legacy_result.manifest),
            "legacy record hash is stale",
        )
        noncanonical_legacy = copy.deepcopy(legacy_result.packet)
        noncanonical_legacy["content"]["entries"][0]["payload"]["record_canonical_json"] = (
            '{"z":1, "a":2}'
        )
        _expect_error(
            lambda: verify_context_packet(noncanonical_legacy, legacy_result.manifest),
            "legacy record is not canonical JSON",
        )
        unresolved_legacy = compile_context_packet(
            root / "first.sqlite",
            expected_projection_digest=first_projection.digest,
            query=legacy_query,
            access_scope=AccessScope(
                scope_id="legacy-reader",
                policy_version="2026-08-21",
                classifications=("public",),
                source_tiers=(10,),
                embedding_classifications=(),
            ),
            evidence_verifier=None,
            evaluated_at="2026-08-21T00:00:00Z",
        )
        assert unresolved_legacy.packet["content"]["entries"] == []
        assert "exact-resolution-verifier-required" in {
            row["reason"] for row in unresolved_legacy.packet["content"]["omissions"]
        }

        # The first-class packet manifest adapts directly to the Phase 2 object
        # manifest contract; upstream object pointers remain exact and cross-acquisition.
        def packet_object_for(packet_result, policy):
            return build_context_packet_object_manifest(
                packet_result,
                acquisition_id="acquisition_" + UUIDS[21],
                source_version_id="source-version_" + UUIDS[22],
                locator={"kind": "object-uri", "value": "s3://memory-test/context-packets", "version_id": "v1"},
                provenance={
                "producer": {"producer_id": "producer:memory.context-compiler", "kind": "system", "name": "memory.context-compiler"},
                "run_id": "run_" + UUIDS[23],
                "tool": {"tool_id": "tool:memory.retrieval", "version": "1", "sha256": "sha256:" + "b" * 64},
                "extraction": None,
                "prompt_program": None,
                    "context_packet": {"context_packet_id": packet_result.packet["context_packet_id"], "sha256": packet_result.packet_sha256},
                },
                created_at="2026-08-21T00:00:00Z",
                policy=policy,
            )

        packet_object = packet_object_for(
            result,
            {"classification": "public", "retention": "permanent", "retain_until": None},
        )
        assert packet_object["object_kind"] == "context-packet"
        assert packet_object["content_sha256"] == result.packet_sha256
        assert packet_object["source_lineage"]["derived_from_objects"] == result.manifest["lineage"]["object_refs"]
        _expect_error(
            lambda: packet_object_for(
                result,
                {"classification": "public", "retention": "tombstone-only", "retain_until": None},
            ),
            "cannot use tombstone-only retention",
        )

        mixed_source_policy = _claim(
            26, 16, 14.0, "Mixed retention source-policy claim.",
            system_time="2026-03-02T00:00:00Z", predicate="mixed_retention",
        )
        mixed_source_policy["policy"] = {
            "classification": "public", "retention": "source-policy", "retain_until": None
        }
        mixed_source_policy = seal_event(mixed_source_policy)
        mixed_expires = _claim(
            27, 17, 15.0, "Mixed retention expiring claim.",
            system_time="2026-03-03T00:00:00Z", predicate="mixed_retention",
        )
        mixed_expires["policy"] = {
            "classification": "public",
            "retention": "expires",
            "retain_until": "2026-12-31T00:00:00Z",
        }
        mixed_expires = seal_event(mixed_expires)
        mixed_projection = build_projection(
            [_source(), _evidence(), mixed_source_policy, mixed_expires],
            root / "mixed.sqlite",
        )
        mixed_query = _query()
        mixed_query.update(
            {
                "task": "Compile mixed retention claims",
                "query_text": "mixed retention claims",
                "permitted_classifications": ["public"],
                "metric": "mixed_retention",
                "max_results": 6,
            }
        )
        mixed_result = compile_context_packet(
            root / "mixed.sqlite",
            expected_projection_digest=mixed_projection.digest,
            query=mixed_query,
            access_scope=scope,
            evidence_verifier=DeterministicVerifier(),
            evaluated_at="2026-08-21T00:00:00Z",
        )
        assert {mixed_source_policy["event_id"], mixed_expires["event_id"]}.issubset(
            {entry["event_id"] for entry in mixed_result.packet["content"]["entries"]}
        )
        _expect_error(
            lambda: packet_object_for(
                mixed_result,
                {"classification": "public", "retention": "source-policy", "retain_until": None},
            ),
            "no storable retention intersection",
        )

        v2_query = _query()
        v2_query.update(
            {
                "task": "Resolve the exact Phase 2 source object",
                "query_text": "synthetic exact object source",
                "record_types": ["memory-source/v2"],
                "reporting_basis": None,
                "metric": None,
                "segment": None,
                "max_results": 2,
            }
        )
        unresolved_v2 = compile_context_packet(
            root / "first.sqlite",
            expected_projection_digest=first_projection.digest,
            query=v2_query,
            access_scope=scope,
            evidence_verifier=DeterministicVerifier(),
            evaluated_at="2026-08-21T00:00:00Z",
        )
        assert unresolved_v2.packet["content"]["entries"] == []
        assert "exact-object-lineage-unresolved" in {
            row["reason"] for row in unresolved_v2.packet["content"]["omissions"]
        }

        # Production bridge: a full manifest corpus feeds CompositeMemoryResolver,
        # which performs MemoryStore's acquisition/version/manifest lookup and byte hash.
        store = MemoryStore(root / "phase3-store", authorize=lambda _request: True)
        store.put_object(v2_manifest, v2_raw, principal="analyst")
        composite = CompositeMemoryResolver(root, store=store)
        manifest_corpus = ClosedEvidenceManifestCorpus(
            {
                v2_source["event_id"]: [
                    {"evidence_ref": None, "value": v2_manifest}
                ]
            }
        )
        production_verifier = CompositeEvidenceVerifier(composite, manifest_corpus)
        resolved_v2 = compile_context_packet(
            root / "first.sqlite",
            expected_projection_digest=first_projection.digest,
            query=v2_query,
            access_scope=scope,
            evidence_verifier=production_verifier,
            evaluated_at="2026-08-21T00:00:00Z",
        )
        assert [
            entry["event_id"] for entry in resolved_v2.packet["content"]["entries"]
        ] == [v2_source["event_id"]]
        assert resolved_v2.packet["content"]["entries"][0]["resolutions"][0][
            "manifest_sha256"
        ] == resolved_v2.manifest["lineage"]["object_refs"][0]["manifest_sha256"]

        no_manifest_corpus = compile_context_packet(
            root / "first.sqlite",
            expected_projection_digest=first_projection.digest,
            query=v2_query,
            access_scope=scope,
            evidence_verifier=CompositeEvidenceVerifier(composite),
            evaluated_at="2026-08-21T00:00:00Z",
        )
        assert no_manifest_corpus.packet["content"]["entries"] == []
        assert "exact-manifest-corpus-unresolved" in {
            row["reason"]
            for row in no_manifest_corpus.packet["content"]["omissions"]
        }
        _expect_error(
            lambda: ClosedEvidenceManifestCorpus(
                {
                    v2_source["event_id"]: [
                        {
                            "evidence_ref": None,
                            "value": {
                                "schema": "memory-object-manifest/v1",
                                "object_id": v2_manifest["object_id"],
                            },
                        }
                    ]
                }
            ),
            "invalid full manifest",
        )

        improvement_query = _query()
        improvement_query.update(
            {
                "task": "Find the semantic operating leverage signal",
                "query_text": "margin inflection",
                "record_types": ["memory-claim/v1"],
                "metric": "operating_leverage",
                "max_results": 1,
            }
        )
        benchmark_cases = [
            {
                "id": "semantic-strict-improvement",
                "query": improvement_query,
                "expected_event_ids": [semantic_target["event_id"]],
                "forbidden_event_ids": [future_claim["event_id"], secret_source["event_id"]],
                "protected_markers": ["SECRET RESTRICTED", "Future fact must not leak"],
                "required_contradiction_relationship_ids": [],
                "require_object_lineage": True,
                "strict_improvement": True,
            },
            {
                "id": "contradiction-lineage-and-cutoff",
                "query": _query(),
                "expected_event_ids": [first_claim["event_id"], second_claim["event_id"]],
                "forbidden_event_ids": [future_claim["event_id"], secret_source["event_id"]],
                "protected_markers": ["SECRET RESTRICTED", "Future fact must not leak"],
                "required_contradiction_relationship_ids": [
                    _relationship(first_claim, second_claim)["payload"]["relationship_id"]
                ],
                "require_object_lineage": True,
                "strict_improvement": False,
            },
        ]
        benchmark = build_retrieval_benchmark_report(
            benchmark_cases,
            first_database=root / "first.sqlite",
            second_database=root / "second.sqlite",
            expected_projection_digest=first_projection.digest,
            access_scope=scope,
            evidence_verifier=DeterministicVerifier(denied=[denied_claim["event_id"]]),
            evaluated_at="2026-08-21T00:00:00Z",
            embedder=SemanticEmbedder(),
        )
        assert_retrieval_benchmark_gate(benchmark)
        assert benchmark["gate"]["passed"] is True
        strict_case = benchmark["cases"][0]
        assert strict_case["lexical_reference"]["mean_reciprocal_rank"] == 0.0
        assert strict_case["hybrid"]["mean_reciprocal_rank"] == 1.0
        assert benchmark["latency_is_adoption_gate"] is False

        # No verifier means material evidence never becomes a citation.
        no_verifier = compile_context_packet(
            root / "first.sqlite",
            expected_projection_digest=first_projection.digest,
            query=_query(),
            access_scope=scope,
            evidence_verifier=None,
            evaluated_at="2026-08-21T00:00:00Z",
        )
        assert no_verifier.packet["content"]["entries"] == []
        no_verifier_reasons = {row["reason"] for row in no_verifier.packet["content"]["omissions"]}
        assert "exact-resolution-verifier-required" in no_verifier_reasons
        assert no_verifier.packet["content"]["abstention_reasons"] == [
            "no-authorized-time-valid-resolvable-records"
        ]

    print("memory retrieval tests: PASS")


if __name__ == "__main__":
    main()
