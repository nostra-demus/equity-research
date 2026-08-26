#!/usr/bin/env python3
"""Tempdir-only authorization, replay, concurrency, and crash drills for Phase 5."""
from __future__ import annotations

import copy
import datetime as dt
import hashlib
import json
import os
import stat
import tempfile
import threading
import unittest
from contextlib import contextmanager
from pathlib import Path

from canonical_json import canonical_json_bytes, canonical_sha256
from memory_controlled_write import (
    AuthorizationDenied,
    ControlledWriteCorruption,
    ControlledWriter,
    GENESIS_HEAD,
    NdjsonCanonicalSink,
    RecoveryRequired,
)
from memory_crypto import AESGCMSIVEnvelopeCipher, CryptoUnavailableError, EncryptedObject
from memory_store import EventRef, MemoryStore
from memory_projection import build_projection
from test_memory_phase5_contract import (
    event as phase5_event,
    feedback_review as phase5_feedback_review,
    shadow_feedback as phase5_shadow_feedback,
)
from test_memory_retrieval import EVIDENCE_ID, _evidence, _source


NOW = dt.datetime(2026, 8, 21, 12, 0, tzinfo=dt.timezone.utc)
NOW_TEXT = "2026-08-21T12:00:00Z"
UUIDS = [
    f"00000000-0000-5{index:03x}-8000-{index:012x}" for index in range(1, 40)
]


def clock() -> dt.datetime:
    return NOW


def policy(
    classification: str = "public",
    retention: str = "permanent",
    retain_until: str | None = None,
) -> dict:
    return {
        "classification": classification,
        "retention": retention,
        "retain_until": retain_until,
    }


def claim_payload(ordinal: int) -> dict:
    return {
        "schema": "memory-claim/v1",
        "claim_id": f"claim_{UUIDS[ordinal]}",
        "subject_id": "entity:internal:phase5-test",
        "predicate": "revenue",
        "value": ordinal,
        "unit": "USD",
        "currency": "USD",
        "accounting_standard": None,
        "period": {"from": "2026-01-01", "to": "2026-12-31", "label": "FY26"},
        "scope": {
            "consolidation": "consolidated",
            "segment": None,
            "geography": None,
            "security_id": None,
        },
        "qualifier": "synthetic tempdir fixture",
        "basis": "controlled-write test",
        "epistemic_status": "inference",
        "claim_quality": 1,
        "evidence_refs": [],
        "derived_from_claims": [],
        "material": False,
    }


def claim_event(ordinal: int, *, storage_policy: dict | None = None) -> dict:
    payload = claim_payload(ordinal)
    return {
        "schema": "memory-event/v1",
        "event_id": f"evt_{UUIDS[ordinal]}",
        "event_type": "claim.asserted",
        "subject_ids": ["entity:internal:phase5-test"],
        "valid_time": {"from": NOW_TEXT, "to": None},
        "system_time": NOW_TEXT,
        "producer": {
            "kind": "human",
            "name": "phase5-reviewer",
            "runtime": None,
            "model": None,
            "prompt_program_sha": None,
        },
        "run_id": f"run_{UUIDS[30]}",
        "trace_id": f"{ordinal + 1:032x}",
        "payload": payload,
        "evidence_refs": [],
        "derived_from": [],
        "supersedes": [],
        "integrity": {"payload_sha256": canonical_sha256(payload), "signature": None},
        "policy": copy.deepcopy(storage_policy or policy()),
    }


def write_request(
    event: dict,
    ordinal: int,
    *,
    expected_head: str = GENESIS_HEAD,
    idempotency_key: str | None = None,
    store_bindings: list[dict] | None = None,
) -> dict:
    return {
        "schema": "memory-controlled-write-request/v1",
        "request_id": f"write-request_{UUIDS[ordinal]}",
        "idempotency_key": idempotency_key or f"phase5:test:{ordinal:08d}",
        "expected_head": expected_head,
        "submitted_at": event["system_time"],
        "operation": "claim-append",
        "event_sha256": "sha256:" + canonical_sha256(event),
        "event_canonical_json": canonical_json_bytes(event).decode("utf-8"),
        "store_bindings": copy.deepcopy(store_bindings or []),
        "shadow_feedback_sha256": None,
        "shadow_feedback_canonical_json": None,
        "promotion_manifest_sha256": None,
        "promotion_manifest_canonical_json": None,
    }


def correction_event(original: dict, ordinal: int, *, value: int) -> dict:
    replacement = copy.deepcopy(original["payload"])
    replacement["value"] = value
    replacement["qualifier"] = f"reviewed correction {ordinal}"
    correction = {
        "schema": "memory-correction/v1",
        "correction_id": f"correction_{UUIDS[ordinal]}",
        "target_event_ids": [original["event_id"]],
        "replacement_domain": "claim",
        "replacement_schema": "memory-claim/v1",
        "replacement_payload_sha256": "sha256:" + canonical_sha256(replacement),
        "replacement_canonical_json": canonical_json_bytes(replacement).decode("utf-8"),
        "reason": "reviewed correction",
        "evidence_refs": [EVIDENCE_ID],
        "authority": {
            "reviewer_kind": "human",
            "reviewer_name": "phase5-reviewer",
            "authorizer_id": "phase5-authority",
            "authorized_at": "2026-08-21T12:00:01Z",
        },
    }
    envelope = claim_event(ordinal)
    envelope["event_type"] = "claim.corrected"
    envelope["system_time"] = "2026-08-21T12:00:01Z"
    envelope["valid_time"]["from"] = "2026-08-21T12:00:01Z"
    envelope["payload"] = correction
    envelope["evidence_refs"] = [EVIDENCE_ID]
    envelope["supersedes"] = [original["event_id"]]
    envelope["integrity"]["payload_sha256"] = canonical_sha256(correction)
    return envelope


def object_manifest(raw: bytes, storage_policy: dict) -> dict:
    digest = hashlib.sha256(raw).hexdigest()
    return {
        "schema": "memory-object-manifest/v1",
        "object_id": f"object:sha256:{digest}",
        "acquisition_id": f"acquisition_{UUIDS[20]}",
        "source_version_id": f"source-version_{UUIDS[21]}",
        "object_kind": "source",
        "content_sha256": f"sha256:{digest}",
        "byte_length": len(raw),
        "media_type": "application/octet-stream",
        "locator": {
            "kind": "object-uri",
            "value": f"r2://phase5-test/{digest}",
            "version_id": f"sha256:{digest}",
        },
        "source_lineage": {
            "source_id": f"source:sha256:{digest}",
            "source_object": None,
            "derived_from_objects": [],
        },
        "provenance": {
            "producer": {
                "producer_id": "producer:phase5-test",
                "kind": "system",
                "name": "phase5-test",
            },
            "run_id": f"run_{UUIDS[30]}",
            "tool": None,
            "extraction": None,
            "prompt_program": None,
            "context_packet": None,
        },
        "created_at": NOW_TEXT,
        "policy": copy.deepcopy(storage_policy),
    }


def object_binding(storage_policy: dict, *, ordinal: int = 20) -> dict:
    return {
        "acquisition_id": f"acquisition_{UUIDS[ordinal]}",
        "source_version_id": f"source-version_{UUIDS[ordinal + 1]}",
        "policy": copy.deepcopy(storage_policy),
        "manifest_sha256": "a" * 64,
        "sha256": "b" * 64,
        "byte_length": 1,
        "encrypted": storage_policy["classification"] in {
            "licensed", "confidential", "restricted"
        },
    }


def snapshot(root: Path) -> tuple:
    rows = []
    for path in sorted(root.rglob("*")):
        status = path.lstat()
        rows.append(
            (
                path.relative_to(root).as_posix(),
                stat.S_IMODE(status.st_mode),
                path.read_bytes() if path.is_file() and not path.is_symlink() else None,
            )
        )
    return tuple(rows)


def canonical_instant_text(value: str) -> str:
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(
        dt.timezone.utc
    ).isoformat(timespec="auto").replace("+00:00", "Z")


def candidate_provenance_verifier(*, event: dict, event_index: dict, principal: object):
    del principal
    evidence_commitments = []
    for evidence_ref in sorted(
        event.get("evidence_refs", []),
        key=lambda value: hashlib.sha256(value.encode("utf-8")).hexdigest(),
    ):
        digest = evidence_ref.split("#", 1)[0].removeprefix("evidence:sha256:")
        evidence_commitments.append(
            {
                "evidence_ref_sha256": "sha256:"
                + hashlib.sha256(evidence_ref.encode("utf-8")).hexdigest(),
                "content_sha256": "sha256:" + digest,
                "artifact_provider": None,
                "locator_provider": None,
            }
        )
    lineage_commitments = []
    for relation in ("derived_from", "supersedes"):
        for event_id in event.get(relation, []):
            target = event_index[event_id]
            lineage_commitments.append(
                {
                    "relation": relation,
                    "event_id": event_id,
                    "event_sha256": "sha256:" + canonical_sha256(target),
                    "policy_sha256": "sha256:" + canonical_sha256(target["policy"]),
                    "system_time": canonical_instant_text(target["system_time"]),
                }
            )
    lineage_commitments.sort(key=lambda item: (item["relation"], item["event_id"]))
    domain_lineage_commitments = []
    payload = event.get("payload", {})
    if payload.get("schema") == "memory-claim/v1":
        for claim_id in payload.get("derived_from_claims", []):
            matches = [
                (event_id, event_index[event_id])
                for event_id in event.get("derived_from", [])
                if event_index[event_id].get("payload", {}).get("claim_id") == claim_id
            ]
            if len(matches) == 1:
                event_id, target = matches[0]
                domain_lineage_commitments.append(
                    {
                        "field": "claim.derived_from_claims",
                        "logical_id_sha256": "sha256:"
                        + hashlib.sha256(claim_id.encode("utf-8")).hexdigest(),
                        "target_event_id": event_id,
                        "target_event_sha256": "sha256:" + canonical_sha256(target),
                        "target_policy_sha256": "sha256:"
                        + canonical_sha256(target["policy"]),
                        "target_system_time": canonical_instant_text(
                            target["system_time"]
                        ),
                    }
                )
    domain_lineage_commitments.sort(
        key=lambda item: (item["field"], item["logical_id_sha256"])
    )
    return {
        "schema": "memory-candidate-provenance-attestation/v1",
        "verifier_id": "phase5-test-provenance-verifier",
        "event_sha256": "sha256:" + canonical_sha256(event),
        "policy_sha256": "sha256:" + canonical_sha256(event["policy"]),
        "valid_time_sha256": "sha256:" + canonical_sha256(event["valid_time"]),
        "evidence_refs_sha256": "sha256:"
        + canonical_sha256(sorted(event.get("evidence_refs", []))),
        "evidence_commitments": evidence_commitments,
        "lineage_commitments": lineage_commitments,
        "domain_lineage_commitments": domain_lineage_commitments,
        "derivative_use_status": "allowed",
        "status": "verified",
    }


PROVENANCE_OPTIONS = {
    "candidate_provenance_verifier": candidate_provenance_verifier,
    "candidate_provenance_verifier_id": "phase5-test-provenance-verifier",
    "authoritative_event_resolver": lambda _event_id, _principal: None,
    "authoritative_event_resolver_id": "phase5-test-authoritative-resolver",
}


def retirement_proof_verifier(*, request: dict, principal: object):
    del principal
    return {
        "schema": "memory-retirement-proof-attestation/v1",
        "verifier_id": "phase5-test-retirement-verifier",
        "request_sha256": "sha256:" + canonical_sha256(request),
        "retired_scope_sha256": "sha256:"
        + canonical_sha256(request["retired_events"]),
        "proof_sha256": request["proof_sha256"],
        "status": "verified",
        "verified_at": request["submitted_at"],
        "signature": "test-signature:"
        + hashlib.sha256(canonical_json_bytes(request)).hexdigest(),
    }


RETIREMENT_OPTIONS = {
    "authorize_retirement": lambda _request, _principal: True,
    "retirement_proof_verifier": retirement_proof_verifier,
    "retirement_proof_verifier_id": "phase5-test-retirement-verifier",
}


def retirement_request(
    event: dict,
    event_ref: EventRef,
    *,
    expected_head: str,
    reason: str,
    proof: dict,
    ordinal: int = 1,
    submitted_at: str = "2026-08-23T12:00:00Z",
) -> dict:
    return {
        "schema": "memory-controlled-retirement-request/v1",
        "transition_id": "retirement_"
        + hashlib.sha256(f"retirement-{ordinal}".encode("utf-8")).hexdigest(),
        "expected_head": expected_head,
        "reason": reason,
        "submitted_at": submitted_at,
        "retired_events": [
            {
                "event_id": event["event_id"],
                "event_sha256": "sha256:" + canonical_sha256(event),
                "event_ref": event_ref.to_dict(),
            }
        ],
        "proof_sha256": "sha256:" + canonical_sha256(proof),
        "proof_canonical_json": canonical_json_bytes(proof).decode("utf-8"),
    }


def tombstone_event(target: dict, ordinal: int = 10) -> dict:
    payload = {
        "schema": "memory-tombstone/v1",
        "target_event_id": target["event_id"],
        "reason_code": "legal-erasure",
        "basis": "legal-obligation",
        "basis_id": None,
    }
    row = claim_event(ordinal, storage_policy=policy("internal", "tombstone-only"))
    row["event_type"] = target["event_type"]
    row["subject_ids"] = copy.deepcopy(target["subject_ids"])
    row["valid_time"] = copy.deepcopy(target["valid_time"])
    row["system_time"] = "2026-08-23T12:00:00Z"
    row["payload"] = payload
    row["supersedes"] = [target["event_id"]]
    row["integrity"]["payload_sha256"] = canonical_sha256(payload)
    return row


class CountingSink:
    def __init__(self) -> None:
        self.reads = 0
        self.writes = 0

    def find_event(self, _event_id: str):
        self.reads += 1
        return None

    def append(self, _event, *, idempotency_key: str):
        del idempotency_key
        self.writes += 1
        raise AssertionError("denied request reached sink")

    def identity(self):
        return {
            "schema": "memory-canonical-sink-identity/v1",
            "kind": "counting-test",
            "identity_sha256": "sha256:" + "c" * 64,
        }

    def bind_coordinator(self, coordinator_id: str, configuration_sha256: str) -> None:
        self.coordinator_id = coordinator_id
        self.configuration_sha256 = configuration_sha256
        self.head = {
            "schema": "memory-controlled-sink-head/v1",
            "coordinator_id": coordinator_id,
            "configuration_sha256": configuration_sha256,
            "sequence": 0,
            "head": GENESIS_HEAD,
            "canonical_ledger_sha256": "sha256:" + canonical_sha256([]),
            "transition": None,
        }

    @contextmanager
    def coordinated(self, coordinator_id: str, configuration_sha256: str):
        if (
            coordinator_id != self.coordinator_id
            or configuration_sha256 != self.configuration_sha256
        ):
            raise AssertionError("coordinator identity changed")
        yield

    def controlled_head(self):
        return copy.deepcopy(self.head)

    def advance_head(self, transition):
        self.head = {
            "schema": "memory-controlled-sink-head/v1",
            "coordinator_id": self.coordinator_id,
            "configuration_sha256": self.configuration_sha256,
            "sequence": transition["sequence"],
            "head": transition["new_head"],
            "canonical_ledger_sha256": transition["canonical_ledger_sha256"],
            "transition": copy.deepcopy(transition),
        }
        return copy.deepcopy(self.head)

    def content_sha256(self):
        return "sha256:" + canonical_sha256([])

    def validate_pending_content(self, _event, *, route: str, prior_ledger_sha256: str):
        del route
        if prior_ledger_sha256 != self.content_sha256():
            raise AssertionError("prior ledger commitment changed")
        return self.content_sha256()


class SimulatedCrash(RuntimeError):
    pass


class TestCipher:
    """Small authenticated protocol fixture; never a production cipher."""

    key_id = "key:phase5-test-protocol-fixture"

    def __init__(self) -> None:
        self._counter = 0

    def encrypt(self, plaintext: bytes, *, associated_data: bytes) -> EncryptedObject:
        self._counter += 1
        tag = hashlib.sha256(associated_data + b"\0" + plaintext).hexdigest()
        return EncryptedObject(
            ciphertext=b"phase5-test-sealed\0" + plaintext,
            key_envelope={
                "dek_id": f"dek_{self._counter:032x}",
                "aad_sha256": hashlib.sha256(associated_data).hexdigest(),
                "tag": tag,
            },
        )

    def decrypt(
        self,
        ciphertext: bytes,
        key_envelope: dict[str, str],
        *,
        associated_data: bytes,
    ) -> bytes:
        prefix = b"phase5-test-sealed\0"
        if not ciphertext.startswith(prefix):
            raise ValueError("test ciphertext prefix mismatch")
        plaintext = ciphertext[len(prefix):]
        if (
            key_envelope.get("aad_sha256")
            != hashlib.sha256(associated_data).hexdigest()
            or key_envelope.get("tag")
            != hashlib.sha256(associated_data + b"\0" + plaintext).hexdigest()
        ):
            raise ValueError("test ciphertext authentication mismatch")
        return plaintext


class StaleOnceReceiptSink(NdjsonCanonicalSink):
    def __init__(self, ledger_path: Path) -> None:
        super().__init__(ledger_path)
        self._stale_once = True

    def append(self, event, *, idempotency_key: str):
        receipt = dict(super().append(event, idempotency_key=idempotency_key))
        if self._stale_once:
            self._stale_once = False
            receipt["event_sha256"] = "sha256:" + "0" * 64
        return receipt


class ControlledWriterTests(unittest.TestCase):
    def test_controlled_correction_projects_and_second_successor_is_quarantined(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            source_provider = _source()
            locator_provider = _evidence()
            providers = {
                source_provider["event_id"]: source_provider,
                locator_provider["event_id"]: locator_provider,
            }

            def provider_row(provider: dict) -> dict:
                return {
                    "event_id": provider["event_id"],
                    "event_sha256": "sha256:" + canonical_sha256(provider),
                    "policy_sha256": "sha256:" + canonical_sha256(provider["policy"]),
                    "system_time": canonical_instant_text(provider["system_time"]),
                }

            def verifier(*, event: dict, event_index: dict, principal: object):
                result = candidate_provenance_verifier(
                    event=event, event_index=event_index, principal=principal
                )
                for item in result["evidence_commitments"]:
                    item["artifact_provider"] = provider_row(source_provider)
                    item["locator_provider"] = provider_row(locator_provider)
                return result

            writer = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                review_authorizer=lambda _request, _principal: True,
                candidate_provenance_verifier=verifier,
                candidate_provenance_verifier_id="phase5-test-provenance-verifier",
                authoritative_event_resolver=lambda event_id, _principal: copy.deepcopy(
                    providers.get(event_id)
                ),
                authoritative_event_resolver_id="phase5-correction-provider-corpus",
                clock=clock,
            )
            original = claim_event(1)
            first = writer.submit(write_request(original, 1))
            corrected = correction_event(original, 2, value=2)
            correction_request = write_request(
                corrected, 2, expected_head=first["new_head"]
            )
            correction_request["operation"] = "claim-correction"
            second = writer.submit(correction_request)
            self.assertEqual(second["disposition"], "committed")
            events = [
                json.loads(line)
                for line in (root / "canonical.ndjson").read_text().splitlines()
            ]
            self.assertEqual(
                build_projection(
                    [source_provider, locator_provider, *events],
                    root / "corrected.sqlite",
                ).event_count,
                4,
            )

            branch = correction_event(original, 3, value=3)
            branch_request = write_request(
                branch, 3, expected_head=second["new_head"]
            )
            branch_request["operation"] = "claim-correction"
            refused = writer.submit(branch_request)
            self.assertEqual(refused["disposition"], "quarantined")
            self.assertEqual(len((root / "canonical.ndjson").read_text().splitlines()), 2)

    def test_feedback_promotion_requires_exact_reviewed_shadow_artifact(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            writer = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                review_authorizer=lambda _request, _principal: True,
                **PROVENANCE_OPTIONS,
                clock=clock,
            )
            artifact = phase5_shadow_feedback()
            review = phase5_feedback_review(artifact)
            reviewed_event = phase5_event(
                review, ordinal=5, event_type="feedback.reviewed"
            )
            missing_artifact = write_request(reviewed_event, 5)
            missing_artifact["operation"] = "feedback-promotion"
            refused = writer.submit(missing_artifact)
            self.assertEqual(refused["disposition"], "rejected")
            self.assertEqual((root / "canonical.ndjson").read_bytes(), b"")

            direct_shadow_event = copy.deepcopy(reviewed_event)
            direct_shadow_event["event_id"] = f"evt_{UUIDS[6]}"
            direct_shadow_event["payload"] = copy.deepcopy(artifact)
            direct_shadow_event["integrity"]["payload_sha256"] = canonical_sha256(
                direct_shadow_event["payload"]
            )
            direct_request = write_request(direct_shadow_event, 6)
            direct_request["operation"] = "feedback-promotion"
            direct_request["shadow_feedback_sha256"] = "sha256:" + canonical_sha256(
                artifact
            )
            direct_request["shadow_feedback_canonical_json"] = canonical_json_bytes(
                artifact
            ).decode("utf-8")
            direct = writer.submit(direct_request)
            self.assertEqual(direct["disposition"], "rejected")
            self.assertEqual((root / "canonical.ndjson").read_bytes(), b"")

            accepted_request = write_request(reviewed_event, 7)
            accepted_request["operation"] = "feedback-promotion"
            accepted_request["shadow_feedback_sha256"] = (
                "sha256:" + canonical_sha256(artifact)
            )
            accepted_request["shadow_feedback_canonical_json"] = canonical_json_bytes(
                artifact
            ).decode("utf-8")
            accepted = writer.submit(accepted_request)
            self.assertEqual(accepted["disposition"], "committed")
            self.assertEqual(accepted["candidate_provenance"]["evidence_commitments"], [])
            stored = [
                json.loads(line)
                for line in (root / "canonical.ndjson").read_text().splitlines()
            ]
            self.assertEqual(stored, [reviewed_event])
            self.assertEqual(review["rating_effect"], "none")
            self.assertEqual(review["confidence_effect"], "none")
            self.assertEqual(review["calibration_effect"], "none")

    def test_candidate_provenance_rejects_fabricated_evidence_and_accepts_resolved_bytes(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            source_provider = _source()
            locator_provider = _evidence()
            read_only_corpus = {
                source_provider["event_id"]: source_provider,
                locator_provider["event_id"]: locator_provider,
            }
            real_ref = EVIDENCE_ID

            def provider_commitment(provider: dict) -> dict:
                return {
                    "event_id": provider["event_id"],
                    "event_sha256": "sha256:" + canonical_sha256(provider),
                    "policy_sha256": "sha256:"
                    + canonical_sha256(provider["policy"]),
                    "system_time": canonical_instant_text(provider["system_time"]),
                }

            def resolver(*, event: dict, event_index: dict, principal: object):
                if event.get("evidence_refs") != [real_ref]:
                    raise LookupError("evidence is absent")
                result = candidate_provenance_verifier(
                    event=event, event_index=event_index, principal=principal
                )
                result["evidence_commitments"][0]["artifact_provider"] = (
                    provider_commitment(source_provider)
                )
                result["evidence_commitments"][0]["locator_provider"] = (
                    provider_commitment(locator_provider)
                )
                return result

            writer = ControlledWriter(
                root / "state",
                sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                candidate_provenance_verifier=resolver,
                candidate_provenance_verifier_id="phase5-test-provenance-verifier",
                authoritative_event_resolver=lambda event_id, _principal: copy.deepcopy(
                    read_only_corpus.get(event_id)
                ),
                authoritative_event_resolver_id="phase5-read-only-corpus",
                clock=clock,
            )
            fabricated = claim_event(1)
            fake_ref = "evidence:sha256:" + "d" * 64 + "#fabricated:cell:A1"
            fabricated["evidence_refs"] = [fake_ref]
            fabricated["payload"]["evidence_refs"] = [fake_ref]
            fabricated["integrity"]["payload_sha256"] = canonical_sha256(
                fabricated["payload"]
            )
            rejected = writer.submit(write_request(fabricated, 1))
            self.assertEqual(rejected["disposition"], "quarantined")
            self.assertEqual((root / "canonical.ndjson").read_bytes(), b"")
            self.assertEqual(
                (root / "state" / "journal" / "writes.ndjson").read_bytes(), b""
            )
            self.assertIn(
                '"reason_code":"provenance-invalid"',
                (root / "state" / "quarantine" / "dead-letters.ndjson").read_text(),
            )

            # Instant comparison, not RFC3339 string ordering: the fractional-Z
            # provider is later than the exact-second consumer and must be refused.
            source_provider["system_time"] = "2026-08-21T12:00:00.5Z"
            temporally_invalid = claim_event(3)
            temporally_invalid["evidence_refs"] = [real_ref]
            temporally_invalid["payload"]["evidence_refs"] = [real_ref]
            temporally_invalid["integrity"]["payload_sha256"] = canonical_sha256(
                temporally_invalid["payload"]
            )
            refused_time = writer.submit(write_request(temporally_invalid, 3))
            self.assertEqual(refused_time["disposition"], "quarantined")
            self.assertEqual((root / "canonical.ndjson").read_bytes(), b"")

            # The equivalent offset form is an earlier instant and remains eligible.
            source_provider["system_time"] = "2026-01-02T05:30:00+05:30"

            resolved = claim_event(2)
            resolved["evidence_refs"] = [real_ref]
            resolved["payload"]["evidence_refs"] = [real_ref]
            resolved["integrity"]["payload_sha256"] = canonical_sha256(
                resolved["payload"]
            )
            accepted = writer.submit(write_request(resolved, 2))
            self.assertEqual(accepted["disposition"], "committed")
            self.assertIsNotNone(accepted["candidate_provenance_sha256"])
            corpus = [source_provider, locator_provider] + [
                json.loads(line)
                for line in (root / "canonical.ndjson").read_text().splitlines()
            ]
            projection = build_projection(corpus, root / "projection.sqlite")
            self.assertEqual(projection.event_count, 3)

    def test_derived_claim_requires_resolved_target_and_exact_parent_policy(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            writer = ControlledWriter(
                root / "state",
                sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                clock=clock,
            )
            parent = claim_event(1, storage_policy=policy("internal"))
            first = writer.submit(write_request(parent, 1))
            self.assertEqual(first["disposition"], "committed")

            missing_domain_target = claim_event(
                5, storage_policy=policy("internal")
            )
            missing_domain_target["system_time"] = "2026-08-21T12:00:01Z"
            missing_domain_target["payload"]["derived_from_claims"] = [
                "claim_" + UUIDS[19]
            ]
            missing_domain_target["integrity"]["payload_sha256"] = canonical_sha256(
                missing_domain_target["payload"]
            )
            missing = writer.submit(
                write_request(
                    missing_domain_target, 5, expected_head=first["new_head"]
                )
            )
            self.assertEqual(missing["disposition"], "quarantined")
            self.assertEqual(len((root / "canonical.ndjson").read_text().splitlines()), 1)

            laundering = claim_event(2, storage_policy=policy("public"))
            laundering["system_time"] = "2026-08-21T12:00:01Z"
            laundering["derived_from"] = [parent["event_id"]]
            laundering["payload"]["derived_from_claims"] = [
                parent["payload"]["claim_id"]
            ]
            laundering["integrity"]["payload_sha256"] = canonical_sha256(
                laundering["payload"]
            )
            refused = writer.submit(
                write_request(laundering, 2, expected_head=first["new_head"])
            )
            self.assertEqual(refused["disposition"], "quarantined")
            self.assertEqual(len((root / "canonical.ndjson").read_text().splitlines()), 1)

        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            writer = ControlledWriter(
                root / "state",
                sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                clock=clock,
            )
            parent = claim_event(3)
            first = writer.submit(write_request(parent, 3))
            child = claim_event(4)
            child["system_time"] = "2026-08-21T12:00:01Z"
            child["derived_from"] = [parent["event_id"]]
            child["payload"]["derived_from_claims"] = [parent["payload"]["claim_id"]]
            child["integrity"]["payload_sha256"] = canonical_sha256(child["payload"])
            accepted = writer.submit(
                write_request(child, 4, expected_head=first["new_head"])
            )
            self.assertEqual(accepted["disposition"], "committed")
            self.assertEqual(len((root / "canonical.ndjson").read_text().splitlines()), 2)
            corpus = [
                json.loads(line)
                for line in (root / "canonical.ndjson").read_text().splitlines()
            ]
            self.assertEqual(
                build_projection(corpus, root / "derived.sqlite").event_count, 2
            )

    def test_commit_exact_replay_and_idempotency_collision(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            writer = ControlledWriter(
                root / "state", sink, authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                clock=clock,
            )
            request = write_request(claim_event(1), 1)
            committed = writer.submit(request)
            self.assertEqual(committed["disposition"], "committed")
            self.assertEqual(writer.current_head(), committed["new_head"])
            replay = writer.submit(copy.deepcopy(request))
            self.assertEqual(replay["disposition"], "replayed")
            self.assertEqual(replay["new_head"], committed["new_head"])
            self.assertEqual(len((root / "canonical.ndjson").read_text().splitlines()), 1)

            conflict = write_request(
                claim_event(2), 2, expected_head=committed["new_head"],
                idempotency_key=request["idempotency_key"],
            )
            rejected = writer.submit(conflict)
            self.assertEqual(rejected["disposition"], "quarantined")
            self.assertIsNotNone(rejected["dead_letter_id"])
            self.assertEqual(len((root / "canonical.ndjson").read_text().splitlines()), 1)

    def test_authorization_denial_is_ephemeral_and_never_reaches_sink(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = CountingSink()
            writer = ControlledWriter(
                root / "state", sink, authorize_write=lambda _request, _principal: False,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                clock=clock,
            )
            before = snapshot(root / "state")
            result = writer.submit(write_request(claim_event(1), 1))
            after = snapshot(root / "state")
            self.assertEqual(result["disposition"], "rejected")
            self.assertIsNone(result["dead_letter_id"])
            self.assertEqual(before, after)
            self.assertEqual((sink.reads, sink.writes), (0, 0))

    def test_authorized_malformed_input_is_quarantined_without_sink_access(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = CountingSink()
            writer = ControlledWriter(
                root / "state", sink, authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                clock=clock,
            )
            malformed = write_request(claim_event(1), 1)
            secret_marker = "PHASE5-SECRET-MARKER-DO-NOT-PERSIST"
            malformed["request_id"] = "x" * 500
            malformed["schema"] = secret_marker
            malformed["unexpected"] = {"must": secret_marker}
            result = writer.submit(malformed)
            self.assertEqual(result["disposition"], "rejected")
            self.assertIsNone(result["request_id"])
            self.assertEqual((sink.reads, sink.writes), (0, 0))
            dead_letter = (root / "state" / "quarantine" / "dead-letters.ndjson").read_text()
            self.assertNotIn("must", dead_letter)
            self.assertNotIn("not persist", dead_letter)
            self.assertNotIn(secret_marker, dead_letter)
            self.assertIn(
                "request failed the closed controlled-write contract", dead_letter
            )

    def test_malformed_correction_still_requires_review_authority_before_quarantine(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = CountingSink()
            writer = ControlledWriter(
                root / "state",
                sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                review_authorizer=lambda _request, _principal: False,
                clock=clock,
            )
            malformed = write_request(claim_event(1), 1)
            malformed["operation"] = "claim-correction"
            before = snapshot(root / "state")
            result = writer.submit(malformed)
            self.assertEqual(result["disposition"], "rejected")
            self.assertIsNone(result["dead_letter_id"])
            self.assertEqual(snapshot(root / "state"), before)
            self.assertEqual((sink.reads, sink.writes), (0, 0))

    def test_playbook_quarantine_requires_dedicated_authority_before_state_access(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = CountingSink()
            writer = ControlledWriter(
                root / "state",
                sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                review_authorizer=lambda _request, _principal: True,
                quarantine_authorizer=lambda _request, _principal: False,
                quarantine_authorizer_id="memory-emergency-quarantine",
                clock=clock,
            )
            malformed = write_request(claim_event(1), 1)
            malformed["operation"] = "playbook-quarantine"
            before = snapshot(root / "state")
            result = writer.submit(malformed, principal={"id": "ordinary-writer"})
            self.assertEqual(result["disposition"], "rejected")
            self.assertIsNone(result["dead_letter_id"])
            self.assertEqual(snapshot(root / "state"), before)
            self.assertEqual((sink.reads, sink.writes), (0, 0))

    def test_route_preflight_rejects_deterministic_configuration_errors_before_prepare(self) -> None:
        cases = (
            (
                "canonical-with-binding",
                claim_event(1),
                [object_binding(policy())],
                {},
                "store-binding-invalid",
            ),
            (
                "protected-without-store",
                claim_event(1, storage_policy=policy("restricted")),
                [object_binding(policy("restricted"))],
                {},
                "policy-route-invalid",
            ),
        )
        for name, event, bindings, writer_options, reason_code in cases:
            with self.subTest(name=name), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                sink = NdjsonCanonicalSink(root / "canonical.ndjson")
                writer = ControlledWriter(
                    root / "state",
                    sink,
                    authorize_write=lambda _request, _principal: True,
                    authorize_recovery=lambda _descriptor, _principal: True,
                    **PROVENANCE_OPTIONS,
                    clock=clock,
                    **writer_options,
                )
                result = writer.submit(write_request(event, 1, store_bindings=bindings))
                self.assertEqual(result["disposition"], "quarantined")
                self.assertEqual((root / "state" / "journal" / "writes.ndjson").read_bytes(), b"")
                self.assertEqual(list((root / "state" / "keys").iterdir()), [])
                self.assertEqual((root / "canonical.ndjson").read_bytes(), b"")
                dead = (root / "state" / "quarantine" / "dead-letters.ndjson").read_text()
                self.assertIn(f'"reason_code":"{reason_code}"', dead)

        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            expiring = policy("internal", "expires", "2026-08-22T12:00:00Z")
            store = MemoryStore(root / "store", authorize=lambda _request: True, clock=clock)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            writer = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                memory_store=store,
                journal_cipher=TestCipher(),
                clock=clock,
            )
            store_before = snapshot(root / "store")
            result = writer.submit(write_request(claim_event(1, storage_policy=expiring), 1))
            self.assertEqual(result["disposition"], "quarantined")
            self.assertEqual(
                (root / "state" / "journal" / "writes.ndjson").read_bytes(), b""
            )
            self.assertEqual((root / "canonical.ndjson").read_bytes(), b"")
            self.assertEqual(snapshot(root / "store"), store_before)

    def test_concurrent_expected_head_allows_one_commit(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            writer = ControlledWriter(
                root / "state", sink, authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                clock=clock,
            )
            requests = [write_request(claim_event(index), index) for index in (1, 2)]
            barrier = threading.Barrier(3)
            results: list[dict] = []
            failures: list[BaseException] = []

            def run(request: dict) -> None:
                barrier.wait()
                try:
                    results.append(writer.submit(request))
                except BaseException as exc:  # pragma: no cover - asserted empty
                    failures.append(exc)

            threads = [threading.Thread(target=run, args=(request,)) for request in requests]
            for thread in threads:
                thread.start()
            barrier.wait()
            for thread in threads:
                thread.join()
            self.assertEqual(failures, [])
            self.assertEqual(sorted(row["disposition"] for row in results), ["committed", "quarantined"])
            self.assertEqual(len((root / "canonical.ndjson").read_text().splitlines()), 1)

    def test_crash_after_sink_recovers_without_duplicate_or_head_drift(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")

            def fault(point: str) -> None:
                if point == "after_sink":
                    raise SimulatedCrash(point)

            request = write_request(claim_event(1), 1)
            crashing = ControlledWriter(
                root / "state", sink, authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                fault_injector=fault, clock=clock,
            )
            with self.assertRaises(SimulatedCrash):
                crashing.submit(request)
            self.assertEqual(len((root / "canonical.ndjson").read_text().splitlines()), 1)
            recovery = ControlledWriter(
                root / "state", sink, authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                clock=clock,
            )
            rows = recovery.recover()
            self.assertEqual([row["disposition"] for row in rows], ["recovered"])
            self.assertEqual(len((root / "canonical.ndjson").read_text().splitlines()), 1)
            self.assertEqual(recovery.current_head(), rows[0]["new_head"])
            self.assertEqual(recovery.submit(request)["disposition"], "replayed")

    def test_crash_after_head_advance_recovers_exactly_once(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")

            def fault(point: str) -> None:
                if point == "after_head_advance":
                    raise SimulatedCrash(point)

            request = write_request(claim_event(1), 1)
            crashing = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                fault_injector=fault,
                clock=clock,
            )
            with self.assertRaises(SimulatedCrash):
                crashing.submit(request)
            recovery = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                clock=clock,
            )
            with self.assertRaises(RecoveryRequired):
                recovery.current_head()
            recovered = recovery.recover()
            self.assertEqual([item["disposition"] for item in recovered], ["recovered"])
            self.assertEqual(len((root / "canonical.ndjson").read_text().splitlines()), 1)
            self.assertEqual(recovery.current_head(), recovered[0]["new_head"])

    def test_journal_or_canonical_ledger_truncation_cannot_reset_head(self) -> None:
        for target in ("journal", "ledger"):
            with self.subTest(target=target), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                ledger = root / "canonical.ndjson"
                sink = NdjsonCanonicalSink(ledger)
                writer = ControlledWriter(
                    root / "state", sink,
                    authorize_write=lambda _request, _principal: True,
                    authorize_recovery=lambda _descriptor, _principal: True,
                    **PROVENANCE_OPTIONS,
                    clock=clock,
                )
                committed = writer.submit(write_request(claim_event(1), 1))
                self.assertEqual(committed["sequence"], 1)
                path = (
                    root / "state" / "journal" / "writes.ndjson"
                    if target == "journal"
                    else ledger
                )
                with path.open("r+b") as handle:
                    handle.truncate(0)
                    handle.flush()
                    os.fsync(handle.fileno())
                reopened = ControlledWriter(
                    root / "state", NdjsonCanonicalSink(ledger),
                    authorize_write=lambda _request, _principal: True,
                    authorize_recovery=lambda _descriptor, _principal: True,
                    **PROVENANCE_OPTIONS,
                    clock=clock,
                )
                before = ledger.read_bytes()
                with self.assertRaises(ControlledWriteCorruption):
                    reopened.current_head()
                with self.assertRaises(ControlledWriteCorruption):
                    reopened.submit(write_request(claim_event(2), 2))
                self.assertEqual(ledger.read_bytes(), before)

    def test_sink_and_protected_store_each_refuse_a_second_state_owner(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            ControlledWriter(
                root / "state-a", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                clock=clock,
            )
            with self.assertRaises(ControlledWriteCorruption):
                ControlledWriter(
                    root / "state-b", sink,
                    authorize_write=lambda _request, _principal: True,
                    authorize_recovery=lambda _descriptor, _principal: True,
                    **PROVENANCE_OPTIONS,
                    clock=clock,
                )
            self.assertEqual((root / "canonical.ndjson").read_bytes(), b"")

        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            store = MemoryStore(root / "store", authorize=lambda _request: True, clock=clock)
            first = ControlledWriter(
                root / "state-a", NdjsonCanonicalSink(root / "canonical-a.ndjson"),
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                memory_store=store,
                journal_cipher=TestCipher(),
                clock=clock,
            )
            self.assertEqual(first.current_head(), GENESIS_HEAD)
            store_before = snapshot(root / "store")
            with self.assertRaises(ControlledWriteCorruption):
                ControlledWriter(
                    root / "state-b", NdjsonCanonicalSink(root / "canonical-b.ndjson"),
                    authorize_write=lambda _request, _principal: True,
                    authorize_recovery=lambda _descriptor, _principal: True,
                    **PROVENANCE_OPTIONS,
                    memory_store=store,
                    journal_cipher=TestCipher(),
                    clock=clock,
                )
            self.assertEqual(snapshot(root / "store"), store_before)

    def test_pending_state_cannot_be_recovered_into_another_sink(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink_a = NdjsonCanonicalSink(root / "canonical-a.ndjson")
            sink_b = NdjsonCanonicalSink(root / "canonical-b.ndjson")

            def fault(point: str) -> None:
                if point == "after_sink":
                    raise SimulatedCrash(point)

            writer = ControlledWriter(
                root / "state", sink_a,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                fault_injector=fault,
                clock=clock,
            )
            with self.assertRaises(SimulatedCrash):
                writer.submit(write_request(claim_event(1), 1))
            before_a = (root / "canonical-a.ndjson").read_bytes()
            before_b = (root / "canonical-b.ndjson").read_bytes()
            with self.assertRaises(ControlledWriteCorruption):
                ControlledWriter(
                    root / "state", sink_b,
                    authorize_write=lambda _request, _principal: True,
                    authorize_recovery=lambda _descriptor, _principal: True,
                    **PROVENANCE_OPTIONS,
                    clock=clock,
                )
            self.assertEqual((root / "canonical-a.ndjson").read_bytes(), before_a)
            self.assertEqual((root / "canonical-b.ndjson").read_bytes(), before_b)

    def test_runtime_owner_change_is_refused_before_state_or_sink_mutation(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            ledger = root / "canonical.ndjson"
            sink = NdjsonCanonicalSink(ledger)
            writer = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                clock=clock,
            )
            owner_path = ledger.with_name(
                ledger.name + ".controlled-writer-owner.json"
            )
            owner = json.loads(owner_path.read_text())
            owner["coordinator_id"] = "sha256:" + "f" * 64
            owner_path.write_bytes(canonical_json_bytes(owner))
            owner_path.chmod(0o600)
            before = snapshot(root)
            with self.assertRaises(ControlledWriteCorruption):
                writer.submit(write_request(claim_event(1), 1))
            self.assertEqual(snapshot(root), before)

    def test_pending_recovery_rejects_unexplained_canonical_ledger_drift(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")

            def fault(point: str) -> None:
                if point == "after_prepare":
                    raise SimulatedCrash(point)

            writer = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                fault_injector=fault,
                clock=clock,
            )
            with self.assertRaises(SimulatedCrash):
                writer.submit(write_request(claim_event(1), 1))
            unrelated = claim_event(2)
            sink.append(unrelated, idempotency_key="out-of-band:00000001")
            ledger_before = (root / "canonical.ndjson").read_bytes()
            recovery = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                clock=clock,
            )
            with self.assertRaises(RecoveryRequired):
                recovery.current_head()
            with self.assertRaises(ControlledWriteCorruption):
                recovery.recover()
            self.assertEqual((root / "canonical.ndjson").read_bytes(), ledger_before)
            journal = (root / "state" / "journal" / "writes.ndjson").read_text()
            self.assertIn('"phase":"prepare"', journal)
            self.assertNotIn('"phase":"commit"', journal)

    def test_post_append_bad_receipt_keeps_prepare_and_recovers(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = StaleOnceReceiptSink(root / "canonical.ndjson")
            request = write_request(claim_event(1), 1)
            writer = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                clock=clock,
            )
            with self.assertRaises(RecoveryRequired):
                writer.submit(request)
            journal = (root / "state" / "journal" / "writes.ndjson").read_text()
            self.assertIn('"phase":"prepare"', journal)
            self.assertNotIn('"phase":"abort"', journal)
            self.assertEqual(len((root / "canonical.ndjson").read_text().splitlines()), 1)
            recovered = writer.recover()
            self.assertEqual([row["disposition"] for row in recovered], ["recovered"])
            self.assertEqual(len((root / "canonical.ndjson").read_text().splitlines()), 1)

    def test_controlled_head_stale_temp_is_validated_and_cleaned(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            ledger = root / "canonical.ndjson"
            sink = NdjsonCanonicalSink(ledger)
            writer = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                clock=clock,
            )
            head_path = ledger.with_name(ledger.name + ".controlled-writer-head.json")
            stale = b"validated-unpublished-control-temp"
            destination_sha = hashlib.sha256(head_path.name.encode("utf-8")).hexdigest()
            temp_path = head_path.with_name(
                ".controlled-temp-v1-"
                + destination_sha
                + "-"
                + hashlib.sha256(stale).hexdigest()
                + "-"
                + "1" * 32
            )
            temp_path.write_bytes(stale)
            temp_path.chmod(0o600)
            committed = writer.submit(write_request(claim_event(1), 1))
            self.assertEqual(committed["disposition"], "committed")
            self.assertFalse(temp_path.exists())

    def test_crash_after_commit_replays_and_recovery_repairs_partial_tail(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")

            def fault(point: str) -> None:
                if point == "after_commit":
                    raise SimulatedCrash(point)

            request = write_request(claim_event(1), 1)
            crashing = ControlledWriter(
                root / "state", sink, authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                fault_injector=fault, clock=clock,
            )
            with self.assertRaises(SimulatedCrash):
                crashing.submit(request)
            journal = root / "state" / "journal" / "writes.ndjson"
            with journal.open("ab") as handle:
                handle.write(b'{"partial":')
                handle.flush()
                os.fsync(handle.fileno())
            recovery = ControlledWriter(
                root / "state", sink, authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                clock=clock,
            )
            self.assertEqual(recovery.recover(), [])
            self.assertTrue(journal.read_bytes().endswith(b"\n"))
            self.assertEqual(recovery.submit(request)["disposition"], "replayed")

    def test_protected_route_encrypts_recovery_body_and_uses_memory_store(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            try:
                cipher = AESGCMSIVEnvelopeCipher(b"p" * 32, key_id="key:phase5-test")
            except CryptoUnavailableError as exc:
                self.skipTest(str(exc))
            restricted = policy("restricted")
            store = MemoryStore(
                root / "store",
                authorize=lambda _request: True,
                cipher=cipher,
                projection_purger=lambda _ref: (),
                projection_absent=lambda _ref: True,
            )
            raw = b"phase5 protected source fixture"
            ref = store.put_object(object_manifest(raw, restricted), raw)
            event = claim_event(1, storage_policy=restricted)
            request = write_request(event, 1, store_bindings=[ref.to_dict()])
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            writer = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                memory_store=store,
                journal_cipher=cipher,
                clock=clock,
            )
            result = writer.submit(request, principal="phase5-test")
            self.assertEqual(result["route"], "protected-store")
            self.assertEqual((root / "canonical.ndjson").read_text(), "")
            stored = store.read_event(store.find_event(event["event_id"], principal="phase5-test"), principal="phase5-test")
            self.assertEqual(stored, event)
            journal = (root / "state" / "journal" / "writes.ndjson").read_text()
            self.assertNotIn('"event_canonical_json"', journal)
            self.assertNotIn('"predicate":"revenue"', journal)
            self.assertEqual(list((root / "state" / "keys").iterdir()), [])

    def test_protected_commit_is_reverified_and_pending_rejects_ledger_drift(self) -> None:
        expiring = policy("internal", "expires", "2026-08-22T12:00:00Z")
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            store = MemoryStore(root / "store", authorize=lambda _request: True, clock=clock)
            raw = b"phase5 expiring source fixture"
            object_ref = store.put_object(object_manifest(raw, expiring), raw)
            event = claim_event(1, storage_policy=expiring)
            request = write_request(event, 1, store_bindings=[object_ref.to_dict()])
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            writer = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                memory_store=store,
                journal_cipher=TestCipher(),
                clock=clock,
            )
            committed = writer.submit(request, principal="phase5-test")
            self.assertEqual(committed["route"], "protected-store")
            journal_rows = [
                json.loads(line)
                for line in (
                    root / "state" / "journal" / "writes.ndjson"
                ).read_text().splitlines()
            ]
            commit = next(row for row in journal_rows if row["phase"] == "commit")
            receipt = json.loads(commit["sink_receipt_canonical_json"])
            event_ref = EventRef.from_dict(receipt["event_ref"])
            (store.root / store._content_path(event_ref)).unlink()
            before = snapshot(root)
            with self.assertRaises(ControlledWriteCorruption):
                writer.current_head(principal="phase5-test")
            self.assertEqual(snapshot(root), before)

        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            store = MemoryStore(root / "store", authorize=lambda _request: True, clock=clock)
            raw = b"phase5 protected pending fixture"
            object_ref = store.put_object(object_manifest(raw, expiring), raw)
            event = claim_event(1, storage_policy=expiring)
            request = write_request(event, 1, store_bindings=[object_ref.to_dict()])
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")

            def fault(point: str) -> None:
                if point == "after_prepare":
                    raise SimulatedCrash(point)

            writer = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                memory_store=store,
                journal_cipher=TestCipher(),
                fault_injector=fault,
                clock=clock,
            )
            with self.assertRaises(SimulatedCrash):
                writer.submit(request, principal="phase5-test")
            sink.append(claim_event(2), idempotency_key="out-of-band:00000002")
            before = snapshot(root)
            with self.assertRaises(ControlledWriteCorruption):
                writer.recover(principal="phase5-test")
            self.assertEqual(snapshot(root), before)

    def test_recovery_denial_precedes_tail_repair_key_cleanup_or_content_reads(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            expiring = policy("internal", "expires", "2026-08-22T12:00:00Z")
            store = MemoryStore(root / "store", authorize=lambda _request: True, clock=clock)
            raw = b"phase5 denied recovery fixture"
            object_ref = store.put_object(object_manifest(raw, expiring), raw)
            event = claim_event(1, storage_policy=expiring)
            request = write_request(event, 1, store_bindings=[object_ref.to_dict()])
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            cipher = TestCipher()

            def fault(point: str) -> None:
                if point == "after_prepare":
                    raise SimulatedCrash(point)

            crashing = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                memory_store=store,
                journal_cipher=cipher,
                fault_injector=fault,
                clock=clock,
            )
            with self.assertRaises(SimulatedCrash):
                crashing.submit(request, principal="phase5-test")
            denied = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: False,
                **PROVENANCE_OPTIONS,
                memory_store=store,
                journal_cipher=cipher,
                clock=clock,
            )
            journal = root / "state" / "journal" / "writes.ndjson"
            with journal.open("ab") as handle:
                handle.write(b'{"partial":')
                handle.flush()
                os.fsync(handle.fileno())
            before = snapshot(root)
            with self.assertRaises(AuthorizationDenied):
                denied.recover(principal="phase5-test")
            self.assertEqual(snapshot(root), before)

    def test_failed_prepare_append_removes_unpublished_protected_journal_key(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            expiring = policy("internal", "expires", "2026-08-22T12:00:00Z")
            store = MemoryStore(root / "store", authorize=lambda _request: True, clock=clock)
            raw = b"phase5 prepare failure fixture"
            object_ref = store.put_object(object_manifest(raw, expiring), raw)
            event = claim_event(1, storage_policy=expiring)
            request = write_request(event, 1, store_bindings=[object_ref.to_dict()])
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            writer = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                memory_store=store,
                journal_cipher=TestCipher(),
                clock=clock,
            )
            original_append = writer._state.append

            def fail_prepare(path, row, *, key: str, value: str):
                if path == writer._state.journal and row.get("phase") == "prepare":
                    raise OSError("simulated prepare append failure")
                return original_append(path, row, key=key, value=value)

            writer._state.append = fail_prepare
            store_before = snapshot(root / "store")
            with self.assertRaises(OSError):
                writer.submit(request, principal="phase5-test")
            self.assertEqual(
                (root / "state" / "journal" / "writes.ndjson").read_bytes(), b""
            )
            self.assertEqual(list((root / "state" / "keys").iterdir()), [])
            self.assertEqual((root / "canonical.ndjson").read_bytes(), b"")
            self.assertEqual(snapshot(root / "store"), store_before)

    def test_protected_crash_recovery_keeps_only_ciphertext_then_destroys_key(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            try:
                cipher = AESGCMSIVEnvelopeCipher(b"q" * 32, key_id="key:phase5-crash")
            except CryptoUnavailableError as exc:
                self.skipTest(str(exc))
            restricted = policy("restricted")
            store = MemoryStore(
                root / "store",
                authorize=lambda _request: True,
                cipher=cipher,
                projection_purger=lambda _ref: (),
                projection_absent=lambda _ref: True,
            )
            raw = b"phase5 protected crash fixture"
            ref = store.put_object(object_manifest(raw, restricted), raw)
            event = claim_event(1, storage_policy=restricted)
            request = write_request(event, 1, store_bindings=[ref.to_dict()])
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")

            def fault(point: str) -> None:
                if point == "after_sink":
                    raise SimulatedCrash(point)

            crashing = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                memory_store=store,
                journal_cipher=cipher,
                fault_injector=fault,
                clock=clock,
            )
            with self.assertRaises(SimulatedCrash):
                crashing.submit(request, principal="phase5-test")
            journal = (root / "state" / "journal" / "writes.ndjson").read_text()
            self.assertNotIn('"event_canonical_json"', journal)
            self.assertNotIn('"predicate":"revenue"', journal)
            self.assertEqual(len(list((root / "state" / "keys").iterdir())), 1)

            recovery = ControlledWriter(
                root / "state", sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                memory_store=store,
                journal_cipher=cipher,
                clock=clock,
            )
            rows = recovery.recover(principal="phase5-test")
            self.assertEqual([row["disposition"] for row in rows], ["recovered"])
            self.assertEqual(list((root / "state" / "keys").iterdir()), [])
            self.assertEqual(
                store.read_event(
                    store.find_event(event["event_id"], principal="phase5-test"),
                    principal="phase5-test",
                ),
                event,
            )

    def test_signed_purge_retirement_advances_head_without_resurrection(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            expiring = policy("internal", "expires", "2026-08-22T12:00:00Z")
            store = MemoryStore(
                root / "store",
                authorize=lambda _request: True,
                projection_purger=lambda _ref: (),
                projection_absent=lambda _ref: True,
                clock=clock,
            )
            raw = b"phase5 signed purge continuity"
            object_ref = store.put_object(object_manifest(raw, expiring), raw)
            event = claim_event(1, storage_policy=expiring)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            writer = ControlledWriter(
                root / "state",
                sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                **RETIREMENT_OPTIONS,
                memory_store=store,
                journal_cipher=TestCipher(),
                clock=clock,
            )
            committed = writer.submit(
                write_request(event, 1, store_bindings=[object_ref.to_dict()]),
                principal="phase5-test",
            )
            event_ref = store.find_event(event["event_id"], principal="phase5-test")
            self.assertIsInstance(event_ref, EventRef)
            receipt = store.purge_event(
                event_ref,
                tombstone_event(event),
                principal="phase5-test",
            )
            with self.assertRaises(ControlledWriteCorruption):
                writer.current_head(principal="phase5-test")
            proof = {
                "schema": "memory-purge-retirement-proof/v1",
                "purge_receipt": receipt.to_dict(),
            }
            request = retirement_request(
                event,
                event_ref,
                expected_head=committed["new_head"],
                reason="purged",
                proof=proof,
            )
            retired = writer.reconcile_retirement(
                request, principal="phase5-test"
            )
            self.assertEqual(retired["disposition"], "committed")
            self.assertEqual(
                writer.current_head(principal="phase5-test"), retired["new_head"]
            )
            replay = writer.reconcile_retirement(request, principal="phase5-test")
            self.assertEqual(replay["disposition"], "replayed")
            self.assertEqual(replay["new_head"], retired["new_head"])

            successor = claim_event(2)
            continued = writer.submit(
                write_request(successor, 2, expected_head=retired["new_head"]),
                principal="phase5-test",
            )
            self.assertEqual(continued["disposition"], "committed")
            reused = copy.deepcopy(event)
            reused["policy"] = policy()
            reused["integrity"]["payload_sha256"] = canonical_sha256(reused["payload"])
            refused = writer.submit(
                write_request(reused, 3, expected_head=continued["new_head"]),
                principal="phase5-test",
            )
            self.assertEqual(refused["disposition"], "quarantined")
            rows = [
                json.loads(line)
                for line in (root / "state" / "journal" / "writes.ndjson")
                .read_text()
                .splitlines()
            ]
            self.assertEqual(
                [row["phase"] for row in rows if row["schema"].endswith("retirement-journal/v1")],
                ["prepare", "commit"],
            )
            self.assertNotIn('"predicate":"revenue"', canonical_json_bytes(rows).decode("utf-8"))

    def test_elapsed_expiry_can_be_retired_but_early_expiry_cannot(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            current = [NOW]

            def moving_clock() -> dt.datetime:
                return current[0]

            expiring = policy("internal", "expires", "2026-08-22T12:00:00Z")
            store = MemoryStore(
                root / "store", authorize=lambda _request: True, clock=moving_clock
            )
            raw = b"phase5 expiry continuity"
            object_ref = store.put_object(object_manifest(raw, expiring), raw)
            event = claim_event(1, storage_policy=expiring)
            writer = ControlledWriter(
                root / "state",
                NdjsonCanonicalSink(root / "canonical.ndjson"),
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                **RETIREMENT_OPTIONS,
                memory_store=store,
                journal_cipher=TestCipher(),
                clock=moving_clock,
            )
            committed = writer.submit(
                write_request(event, 1, store_bindings=[object_ref.to_dict()]),
                principal="phase5-test",
            )
            event_ref = store.find_event(event["event_id"], principal="phase5-test")
            proof = {
                "schema": "memory-expiry-retirement-proof/v1",
                "expired_at": "2026-08-22T12:00:00Z",
                "retain_until_by_event": [
                    {
                        "event_id": event["event_id"],
                        "retain_until": "2026-08-22T12:00:00Z",
                    }
                ],
            }
            request = retirement_request(
                event,
                event_ref,
                expected_head=committed["new_head"],
                reason="expired",
                proof=proof,
                submitted_at="2026-08-22T12:00:00Z",
            )
            with self.assertRaises(ControlledWriteCorruption):
                writer.reconcile_retirement(request, principal="phase5-test")
            current[0] = dt.datetime(2026, 8, 22, 12, 0, tzinfo=dt.timezone.utc)
            retired = writer.reconcile_retirement(
                request, principal="phase5-test"
            )
            self.assertEqual(retired["reason"], "expired")
            self.assertEqual(
                writer.current_head(principal="phase5-test"), retired["new_head"]
            )

    def test_retirement_crash_recovery_is_exactly_once(self) -> None:
        for crash_point in (
            "after_retirement_prepare",
            "after_retirement_head_advance",
        ):
            with self.subTest(crash_point=crash_point), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                expiring = policy("internal", "expires", "2026-08-22T12:00:00Z")
                store = MemoryStore(
                    root / "store",
                    authorize=lambda _request: True,
                    projection_purger=lambda _ref: (),
                    projection_absent=lambda _ref: True,
                    clock=clock,
                )
                raw = b"phase5 retirement crash " + crash_point.encode("utf-8")
                object_ref = store.put_object(object_manifest(raw, expiring), raw)
                event = claim_event(1, storage_policy=expiring)
                sink = NdjsonCanonicalSink(root / "canonical.ndjson")

                def fault(point: str) -> None:
                    if point == crash_point:
                        raise SimulatedCrash(point)

                crashing = ControlledWriter(
                    root / "state",
                    sink,
                    authorize_write=lambda _request, _principal: True,
                    authorize_recovery=lambda _descriptor, _principal: True,
                    **PROVENANCE_OPTIONS,
                    **RETIREMENT_OPTIONS,
                    memory_store=store,
                    journal_cipher=TestCipher(),
                    fault_injector=fault,
                    clock=clock,
                )
                committed = crashing.submit(
                    write_request(event, 1, store_bindings=[object_ref.to_dict()]),
                    principal="phase5-test",
                )
                event_ref = store.find_event(event["event_id"], principal="phase5-test")
                receipt = store.purge_event(
                    event_ref,
                    tombstone_event(event),
                    principal="phase5-test",
                )
                request = retirement_request(
                    event,
                    event_ref,
                    expected_head=committed["new_head"],
                    reason="purged",
                    proof={
                        "schema": "memory-purge-retirement-proof/v1",
                        "purge_receipt": receipt.to_dict(),
                    },
                )
                with self.assertRaises(SimulatedCrash):
                    crashing.reconcile_retirement(
                        request, principal="phase5-test"
                    )
                recovery = ControlledWriter(
                    root / "state",
                    sink,
                    authorize_write=lambda _request, _principal: True,
                    authorize_recovery=lambda _descriptor, _principal: True,
                    **PROVENANCE_OPTIONS,
                    **RETIREMENT_OPTIONS,
                    memory_store=store,
                    journal_cipher=TestCipher(),
                    clock=clock,
                )
                with self.assertRaises(RecoveryRequired):
                    recovery.current_head(principal="phase5-test")
                recovered = recovery.recover(principal="phase5-test")
                self.assertEqual(
                    [item["disposition"] for item in recovered], ["recovered"]
                )
                self.assertEqual(
                    recovery.current_head(principal="phase5-test"),
                    recovered[0]["new_head"],
                )
                self.assertEqual(
                    recovery.reconcile_retirement(
                        request, principal="phase5-test"
                    )["disposition"],
                    "replayed",
                )

    def test_retirement_rollback_and_unexplained_loss_remain_fail_closed(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            expiring = policy("internal", "expires", "2026-08-22T12:00:00Z")
            store = MemoryStore(
                root / "store",
                authorize=lambda _request: True,
                projection_purger=lambda _ref: (),
                projection_absent=lambda _ref: True,
                clock=clock,
            )
            raw = b"phase5 retirement rollback"
            object_ref = store.put_object(object_manifest(raw, expiring), raw)
            event = claim_event(1, storage_policy=expiring)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            writer = ControlledWriter(
                root / "state",
                sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                **RETIREMENT_OPTIONS,
                memory_store=store,
                journal_cipher=TestCipher(),
                clock=clock,
            )
            committed = writer.submit(
                write_request(event, 1, store_bindings=[object_ref.to_dict()]),
                principal="phase5-test",
            )
            event_ref = store.find_event(event["event_id"], principal="phase5-test")
            receipt = store.purge_event(
                event_ref,
                tombstone_event(event),
                principal="phase5-test",
            )
            request = retirement_request(
                event,
                event_ref,
                expected_head=committed["new_head"],
                reason="purged",
                proof={
                    "schema": "memory-purge-retirement-proof/v1",
                    "purge_receipt": receipt.to_dict(),
                },
            )
            writer.reconcile_retirement(request, principal="phase5-test")
            journal = root / "state" / "journal" / "writes.ndjson"
            lines = journal.read_bytes().splitlines(keepends=True)
            journal.write_bytes(b"".join(lines[:-2]))
            reopened = ControlledWriter(
                root / "state",
                sink,
                authorize_write=lambda _request, _principal: True,
                authorize_recovery=lambda _descriptor, _principal: True,
                **PROVENANCE_OPTIONS,
                **RETIREMENT_OPTIONS,
                memory_store=store,
                journal_cipher=TestCipher(),
                clock=clock,
            )
            with self.assertRaises(ControlledWriteCorruption):
                reopened.current_head(principal="phase5-test")

    def test_symlinked_state_root_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            real = root / "real"
            real.mkdir(mode=0o700)
            alias = root / "alias"
            alias.symlink_to(real, target_is_directory=True)
            sink = NdjsonCanonicalSink(root / "canonical.ndjson")
            with self.assertRaises(ControlledWriteCorruption):
                ControlledWriter(
                    alias, sink, authorize_write=lambda _request, _principal: True,
                    authorize_recovery=lambda _descriptor, _principal: True,
                    **PROVENANCE_OPTIONS,
                    clock=clock,
                )


if __name__ == "__main__":
    unittest.main()
