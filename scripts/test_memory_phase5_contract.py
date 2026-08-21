#!/usr/bin/env python3
"""Closed-shape, feedback-binding, correction, and calibration tests for Phase 5."""
from __future__ import annotations

import copy
import unittest

import memory_phase5_contract as phase5_contract
from canonical_json import canonical_json_bytes, canonical_sha256
from memory_contract import validate_event
from memory_controlled_write import GENESIS_HEAD
from memory_phase5_contract import (
    Phase5ContractError,
    eligible_forecast_outcome,
    forecast_outcome_payload_sha256,
    forecast_source_commitment,
    validate_calibration_observation,
    validate_controlled_event,
    validate_correction_payload,
    validate_dead_letter,
    validate_feedback_review,
    validate_feedback_review_payload,
    validate_forecast_outcome,
    validate_phase5_payload,
    validate_write_request,
    validate_write_result,
)
from memory_shadow import seal_shadow_feedback


UUIDS = [f"00000000-0000-5{index:03x}-8000-{index:012x}" for index in range(1, 40)]
NOW = "2026-08-21T12:00:00Z"
EVIDENCE = "evidence:sha256:" + "a" * 64 + "#fixture"


def claim(claim_id: str | None = None, *, value: int = 1) -> dict:
    return {
        "schema": "memory-claim/v1",
        "claim_id": claim_id or f"claim_{UUIDS[1]}",
        "subject_id": "entity:internal:phase5-contract",
        "predicate": "revenue",
        "value": value,
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
        "qualifier": "synthetic fixture",
        "basis": "contract test",
        "epistemic_status": "supported",
        "claim_quality": 2,
        "evidence_refs": [EVIDENCE],
        "derived_from_claims": [],
        "material": True,
    }


def event(payload: dict, *, ordinal: int = 1, event_type: str = "claim.asserted") -> dict:
    return {
        "schema": "memory-event/v1",
        "event_id": f"evt_{UUIDS[ordinal]}",
        "event_type": event_type,
        "subject_ids": ["entity:internal:phase5-contract"],
        "valid_time": {"from": NOW, "to": None},
        "system_time": NOW,
        "producer": {
            "kind": "human",
            "name": "phase5-reviewer",
            "runtime": None,
            "model": None,
            "prompt_program_sha": None,
        },
        "run_id": f"run_{UUIDS[30]}",
        "trace_id": f"{ordinal + 1:032x}",
        "payload": copy.deepcopy(payload),
        "evidence_refs": copy.deepcopy(payload.get("evidence_refs", [])),
        "derived_from": [],
        "supersedes": [],
        "integrity": {"payload_sha256": canonical_sha256(payload), "signature": None},
        "policy": {"classification": "internal", "retention": "permanent", "retain_until": None},
    }


def request(envelope: dict, *, ordinal: int = 1) -> dict:
    return {
        "schema": "memory-controlled-write-request/v1",
        "request_id": f"write-request_{UUIDS[ordinal]}",
        "idempotency_key": f"phase5:contract:{ordinal:08d}",
        "expected_head": GENESIS_HEAD,
        "submitted_at": envelope["system_time"],
        "operation": "claim-append",
        "event_sha256": "sha256:" + canonical_sha256(envelope),
        "event_canonical_json": canonical_json_bytes(envelope).decode("utf-8"),
        "store_bindings": [],
        "shadow_feedback_sha256": None,
        "shadow_feedback_canonical_json": None,
    }


def shadow_feedback(note: str = "useful context") -> dict:
    return seal_shadow_feedback(
        {
            "context_packet_id": f"context-packet_{UUIDS[4]}",
            "packet_sha256": "sha256:" + "b" * 64,
            "query_sha256": "sha256:" + "c" * 64,
            "client_id": "phase5-contract-test",
            "observed_at": NOW,
            "items": [
                {
                    "category": "useful",
                    "event_id": None,
                    "evidence_id": None,
                    "note": note,
                }
            ],
            "status": "inert-shadow-only",
            "canonical_write": "none",
            "rating_effect": "none",
        }
    )


def feedback_review(artifact: dict) -> dict:
    content = artifact["content"]
    return {
        "schema": "memory-feedback-review/v1",
        "review_id": f"feedback-review_{UUIDS[5]}",
        "shadow_feedback_id": artifact["feedback_id"],
        "shadow_content_sha256": artifact["content_sha256"],
        "context_packet_id": content["context_packet_id"],
        "packet_sha256": content["packet_sha256"],
        "query_sha256": content["query_sha256"],
        "reviewed_at": NOW,
        "reviewer": {
            "kind": "human",
            "name": "phase5-reviewer",
            "authorizer_id": "phase5-authority",
        },
        "disposition": "accepted",
        "review_basis": "human review of exact immutable artifact",
        "item_reviews": [
            {"item_index": 0, "disposition": "accepted", "reason": "relevant"}
        ],
        "retrieval_effect": "reviewed-signal-only",
        "rating_effect": "none",
        "confidence_effect": "none",
        "calibration_effect": "none",
    }


def correction(replacement: dict, target_id: str, *, domain: str = "claim") -> dict:
    return {
        "schema": "memory-correction/v1",
        "correction_id": f"correction_{UUIDS[6]}",
        "target_event_ids": [target_id],
        "replacement_domain": domain,
        "replacement_schema": replacement["schema"],
        "replacement_payload_sha256": "sha256:" + canonical_sha256(replacement),
        "replacement_canonical_json": canonical_json_bytes(replacement).decode("utf-8"),
        "reason": "reviewed correction",
        "evidence_refs": copy.deepcopy(replacement.get("evidence_refs", [EVIDENCE])),
        "authority": {
            "reviewer_kind": "human",
            "reviewer_name": "phase5-reviewer",
            "authorizer_id": "phase5-authority",
            "authorized_at": NOW,
        },
    }


def decision_source(record: dict) -> dict:
    payload = {
        "legacy_schema": "equity-decision-record/v1",
        "record_type": "equity_decision_record",
        "source_path": "analyses/TEST_2026-08-21/decision_record.json",
        "source_locator": "json",
        "source_sha256": "d" * 64,
        "identity_mapping": {
            "strategy": "native-ids-plus-opaque-source-composites-v1",
            "opaque_uuid_namespace": "bcfa556d-1823-5793-8d33-bd24c14d3ff4",
            "aliases_preserved_under": "record",
        },
        "time_mapping": {
            "system_time_field": "git.recording_commit_time",
            "system_time_precision": "instant",
            "system_time_trust": "git-commit/v1",
            "valid_time_field": "decision_date",
            "valid_time_precision": "day",
        },
        "record": copy.deepcopy(record),
    }
    envelope = event(payload, ordinal=10, event_type="decision.recorded")
    envelope["producer"]["kind"] = "adapter"
    envelope["producer"]["name"] = "legacy-memory-adapter"
    envelope["producer"]["runtime"] = "python"
    envelope["evidence_refs"] = ["evidence:sha256:" + "d" * 64 + "#json"]
    envelope["integrity"]["payload_sha256"] = canonical_sha256(payload)
    return envelope


def integrity_verifier(*, record: dict, source_event: dict, record_integrity: dict) -> dict:
    return {
        "schema": "memory-record-integrity-attestation/v1",
        "verifier_id": "phase5-ledger-integrity-verifier",
        "decision_event_sha256": "sha256:" + canonical_sha256(source_event),
        "record_sha256": "sha256:" + canonical_sha256(record),
        "record_integrity_sha256": "sha256:" + canonical_sha256(record_integrity),
        "status": "verified",
    }


def outcome_verifier(*, outcome: dict, trusted_as_of: str) -> dict:
    return {
        "schema": "memory-forecast-outcome-attestation/v1",
        "attestor_id": "phase5-outcome-evidence-attestor",
        "unsigned_outcome_sha256": forecast_outcome_payload_sha256(outcome),
        "evidence_refs_sha256": "sha256:" + canonical_sha256(outcome["evidence_refs"]),
        "evidence_verification_sha256": "sha256:" + canonical_sha256(
            {"resolved": outcome["evidence_refs"]}
        ),
        "trusted_as_of": trusted_as_of,
        "status": "verified",
    }


class Phase5ContractTests(unittest.TestCase):
    def test_static_schema_loads_are_cached(self) -> None:
        phase5_contract._load_schema.cache_clear()
        first = phase5_contract._load_schema(phase5_contract.WRITE_REQUEST_SCHEMA)
        before = phase5_contract._load_schema.cache_info()
        second = phase5_contract._load_schema(phase5_contract.WRITE_REQUEST_SCHEMA)
        after = phase5_contract._load_schema.cache_info()
        self.assertIs(first, second)
        self.assertEqual(after.hits, before.hits + 1)

    def test_request_capsules_are_hash_bound_and_schema_has_no_open_event_subtree(self) -> None:
        envelope = event(claim())
        candidate = request(envelope)
        self.assertEqual(validate_write_request(candidate), [])
        tampered = copy.deepcopy(candidate)
        parsed = copy.deepcopy(envelope)
        parsed["payload"]["value"] = 99
        tampered["event_canonical_json"] = canonical_json_bytes(parsed).decode("utf-8")
        self.assertTrue(validate_write_request(tampered))
        open_shape = copy.deepcopy(candidate)
        open_shape["event"] = envelope
        self.assertTrue(validate_write_request(open_shape))
        self.assertEqual(candidate, request(envelope))

    def test_feedback_local_validation_is_rebuildable_but_promotion_requires_exact_artifact(self) -> None:
        artifact = shadow_feedback()
        review = feedback_review(artifact)
        self.assertEqual(validate_feedback_review_payload(review), [])
        self.assertEqual(validate_feedback_review(review, artifact), [])
        other = shadow_feedback("different immutable bytes")
        errors = validate_feedback_review(review, other)
        self.assertTrue(any("must exactly bind" in error for error in errors))
        broken = copy.deepcopy(review)
        broken["item_reviews"][0]["item_index"] = 1
        self.assertTrue(validate_feedback_review_payload(broken))

    def test_correction_capsule_is_closed_hash_bound_and_single_target(self) -> None:
        replacement = claim(value=2)
        payload = correction(replacement, f"evt_{UUIDS[1]}")
        self.assertEqual(validate_correction_payload(payload), [])
        tampered = copy.deepcopy(payload)
        tampered["replacement_canonical_json"] = canonical_json_bytes(claim(value=3)).decode("utf-8")
        self.assertTrue(validate_correction_payload(tampered))
        branch_merge = copy.deepcopy(payload)
        branch_merge["target_event_ids"].append(f"evt_{UUIDS[2]}")
        self.assertTrue(validate_correction_payload(branch_merge))
        arbitrary = copy.deepcopy(payload)
        arbitrary["replacement"] = {"arbitrary": {"open": True}}
        self.assertTrue(validate_correction_payload(arbitrary))

    def test_correction_cannot_cross_storage_policy_lane(self) -> None:
        original = event(claim(), ordinal=1)
        original["policy"] = {
            "classification": "restricted",
            "retention": "expires",
            "retain_until": "2027-08-21T00:00:00Z",
        }
        replacement = claim(value=2)
        corrected = event(
            correction(replacement, original["event_id"]),
            ordinal=2,
            event_type="claim.corrected",
        )
        corrected["supersedes"] = [original["event_id"]]
        corrected["integrity"]["payload_sha256"] = canonical_sha256(
            corrected["payload"]
        )
        errors = validate_controlled_event(
            corrected, event_index={original["event_id"]: original}
        )
        self.assertTrue(any("policy must exactly equal" in error for error in errors))

    def test_forecast_adapter_binds_exact_record_event_integrity_index_and_outcome_provenance(self) -> None:
        forecast = {
            "forecast_id": f"forecast_{UUIDS[11]}",
            "prediction": "Revenue clears the threshold",
            "probability": 70,
            "owner_module": "earnings",
            "forecast_type": "revenue",
            "status_as_of": "2026-08-01T00:00:00Z",
            "window_start": "2026-08-10T00:00:00Z",
            "window_end": "2026-08-20T23:59:59Z",
        }
        record = {
            "ticker": "TEST",
            "thesis_type": ["Company-specific"],
            "forecast_ledger": [copy.deepcopy(forecast)],
        }
        source = decision_source(record)
        self.assertEqual(validate_event(source), [])
        record_integrity = {
            "status": "verified",
            "verdict": "Clean",
            "integrity_score": 100,
            "banner": False,
            "report_file": "verification_report.json",
        }
        commitment = forecast_source_commitment(
            record, source, record_integrity, integrity_verifier=integrity_verifier
        )
        outcome = {
            "schema": "memory-forecast-outcome/v1",
            "outcome_id": f"forecast-outcome_{UUIDS[12]}",
            "forecast_id": forecast["forecast_id"],
            "forecast_sha256": "sha256:" + canonical_sha256(forecast),
            "source_commitment": commitment,
            "status": "confirmed",
            "observed_at": "2026-08-20T12:00:00Z",
            "recorded_at": NOW,
            "evidence_refs": [EVIDENCE],
        }
        outcome["integrity"] = {
            "status": "verified",
            "payload_sha256": forecast_outcome_payload_sha256(outcome),
            "verifier_id": "phase5-outcome-verifier",
        }
        self.assertEqual(validate_forecast_outcome(outcome), [])
        observation = eligible_forecast_outcome(
            record,
            forecast,
            outcome,
            source_event=source,
            record_integrity=record_integrity,
            integrity_verifier=integrity_verifier,
            outcome_verifier=outcome_verifier,
            as_of=NOW,
        )
        self.assertEqual(observation["forecast_ledger_index"], 0)
        self.assertEqual(observation["source_commitment"], commitment)
        self.assertEqual(observation["outcome_provenance"]["evidence_refs"], [EVIDENCE])
        self.assertEqual(observation["outcome_provenance"]["verifier_id"], "phase5-outcome-verifier")
        self.assertEqual(validate_calibration_observation(observation), [])

        changed_integrity = copy.deepcopy(record_integrity)
        changed_integrity["verdict"] = "Minor issues"
        with self.assertRaises(Phase5ContractError):
            eligible_forecast_outcome(
                record,
                forecast,
                outcome,
                source_event=source,
                record_integrity=changed_integrity,
                integrity_verifier=integrity_verifier,
                outcome_verifier=outcome_verifier,
                as_of=NOW,
            )
        duplicate_record = copy.deepcopy(record)
        duplicate_record["forecast_ledger"].append(copy.deepcopy(forecast))
        duplicate_source = decision_source(duplicate_record)
        duplicate_outcome = copy.deepcopy(outcome)
        duplicate_outcome["source_commitment"] = forecast_source_commitment(
            duplicate_record,
            duplicate_source,
            record_integrity,
            integrity_verifier=integrity_verifier,
        )
        duplicate_outcome["integrity"]["payload_sha256"] = forecast_outcome_payload_sha256(
            duplicate_outcome
        )
        with self.assertRaisesRegex(Phase5ContractError, "exactly once"):
            eligible_forecast_outcome(
                duplicate_record,
                forecast,
                duplicate_outcome,
                source_event=duplicate_source,
                record_integrity=record_integrity,
                integrity_verifier=integrity_verifier,
                outcome_verifier=outcome_verifier,
                as_of=NOW,
            )

        with self.assertRaisesRegex(Phase5ContractError, "closed ledger_records"):
            forecast_source_commitment(
                record,
                source,
                {"status": "verified"},
                integrity_verifier=integrity_verifier,
            )

        def forged_verifier(**_inputs: dict) -> dict:
            attestation = integrity_verifier(
                record=record,
                source_event=source,
                record_integrity=record_integrity,
            )
            attestation["record_sha256"] = "sha256:" + "0" * 64
            return attestation

        with self.assertRaisesRegex(Phase5ContractError, "does not bind"):
            forecast_source_commitment(
                record,
                source,
                record_integrity,
                integrity_verifier=forged_verifier,
            )

        def forged_outcome_verifier(**inputs: dict) -> dict:
            attestation = outcome_verifier(**inputs)
            attestation["unsigned_outcome_sha256"] = "sha256:" + "0" * 64
            return attestation

        # A caller-authored ``integrity.status=verified`` is not sufficient: the
        # independent attestor must bind the exact outcome/evidence/as-of tuple.
        with self.assertRaisesRegex(Phase5ContractError, "outcome_verifier"):
            eligible_forecast_outcome(
                record,
                forecast,
                outcome,
                source_event=source,
                record_integrity=record_integrity,
                integrity_verifier=integrity_verifier,
                outcome_verifier=forged_outcome_verifier,
                as_of=NOW,
            )

        bool_forecast = copy.deepcopy(forecast)
        bool_forecast["probability"] = True
        with self.assertRaisesRegex(Phase5ContractError, "exact canonical forecast bytes"):
            eligible_forecast_outcome(
                record,
                bool_forecast,
                outcome,
                source_event=source,
                record_integrity=record_integrity,
                integrity_verifier=integrity_verifier,
                outcome_verifier=outcome_verifier,
                as_of=NOW,
            )

        bool_record = copy.deepcopy(record)
        bool_record["forecast_ledger"][0]["probability"] = True
        with self.assertRaisesRegex(Phase5ContractError, "canonical decision-record bytes"):
            forecast_source_commitment(
                bool_record,
                source,
                record_integrity,
                integrity_verifier=integrity_verifier,
            )

    def test_public_validators_fail_closed_on_deep_hostile_json(self) -> None:
        deep: dict = {}
        cursor = deep
        for _ in range(3000):
            child: dict = {}
            cursor["x"] = child
            cursor = child
        validators = (
            ("validate_write_request", lambda: validate_write_request(deep)),
            ("validate_write_result", lambda: validate_write_result(deep)),
            ("validate_dead_letter", lambda: validate_dead_letter(deep)),
            ("validate_forecast_outcome", lambda: validate_forecast_outcome(deep)),
            (
                "validate_calibration_observation",
                lambda: validate_calibration_observation(deep),
            ),
            ("validate_correction_payload", lambda: validate_correction_payload(deep)),
            (
                "validate_feedback_review_payload",
                lambda: validate_feedback_review_payload(deep),
            ),
            ("validate_feedback_review", lambda: validate_feedback_review(deep, deep)),
            ("validate_phase5_payload", lambda: validate_phase5_payload(deep)),
            ("validate_controlled_event", lambda: validate_controlled_event(deep)),
        )
        for name, validator in validators:
            with self.subTest(validator=name):
                errors = validator()
                self.assertIsInstance(errors, list)
                self.assertTrue(errors)


if __name__ == "__main__":
    unittest.main()
