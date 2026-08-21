#!/usr/bin/env python3
"""Real projection/PIT retrieval regressions for controlled claim corrections."""
from __future__ import annotations

import copy
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

from canonical_json import canonical_json_bytes, canonical_sha256
from memory_contract import seal_event
from memory_projection import ProjectionError, build_projection
from memory_retrieval import (
    AccessScope,
    RetrievalError,
    compile_context_packet,
    verify_context_packet,
)
from test_memory_retrieval import (
    SUBJECT,
    DeterministicVerifier,
    _claim,
    _evidence,
    _query,
    _reseal_packet_manifest,
    _source,
)


UUIDS = [f"10000000-0000-5000-8000-{index:012d}" for index in range(1, 12)]


def _correction_event(
    original: dict,
    *,
    event_id: str,
    correction_id: str,
    system_time: str,
    value: float,
    qualifier: str,
    replacement_subject: str | None = None,
) -> dict:
    replacement = copy.deepcopy(original["payload"])
    replacement["value"] = value
    replacement["qualifier"] = qualifier
    if replacement_subject is not None:
        replacement["subject_id"] = replacement_subject
    payload = {
        "schema": "memory-correction/v1",
        "correction_id": correction_id,
        "target_event_ids": [original["event_id"]],
        "replacement_domain": "claim",
        "replacement_schema": "memory-claim/v1",
        "replacement_payload_sha256": "sha256:" + canonical_sha256(replacement),
        "replacement_canonical_json": canonical_json_bytes(replacement).decode("utf-8"),
        "reason": "Reviewed evidence corrects the reported margin.",
        "evidence_refs": list(replacement["evidence_refs"]),
        "authority": {
            "reviewer_kind": "system",
            "reviewer_name": "retrieval-test",
            "authorizer_id": "phase5-correction-authority",
            "authorized_at": system_time,
        },
    }
    return seal_event(
        {
            "schema": "memory-event/v1",
            "event_id": event_id,
            "event_type": "claim.corrected",
            "subject_ids": [SUBJECT],
            "valid_time": copy.deepcopy(original["valid_time"]),
            "system_time": system_time,
            "producer": copy.deepcopy(original["producer"]),
            "run_id": original["run_id"],
            "trace_id": canonical_sha256({"event_id": event_id})[:32],
            "payload": payload,
            "evidence_refs": list(payload["evidence_refs"]),
            "derived_from": [],
            "supersedes": [original["event_id"]],
            "integrity": {"payload_sha256": "0" * 64, "signature": None},
            "policy": copy.deepcopy(original["policy"]),
        }
    )


def _at(system_time: str) -> dict:
    query = _query()
    query["as_of_system_time"] = system_time
    query["event_types"] = []
    query["record_types"] = ["memory-claim/v1"]
    query["max_results"] = 2
    return query


class Phase5ProjectionRetrievalTests(unittest.TestCase):
    def test_correction_preserves_raw_history_and_exposes_only_effective_current_claim(self) -> None:
        source = _source()
        evidence = _evidence()
        original = _claim(
            3,
            1,
            20.0,
            "Original reported margin.",
            system_time="2026-01-04T00:00:00Z",
        )
        original["event_type"] = "claim.asserted"
        original["trace_id"] = "1" * 32
        original = seal_event(original)
        corrected = _correction_event(
            original,
            event_id="evt_" + UUIDS[0],
            correction_id="correction_" + UUIDS[1],
            system_time="2026-01-05T00:00:00Z",
            value=18.25,
            qualifier="Corrected margin after reviewed evidence.",
        )
        events = [source, evidence, original, corrected]

        with tempfile.TemporaryDirectory(prefix="memory-phase5-pit-") as temporary:
            database = Path(temporary) / "projection.sqlite"
            projection = build_projection(events, database)
            with sqlite3.connect(database) as connection:
                raw_text, typed_text = connection.execute(
                    "SELECT events.canonical_event,typed_payloads.canonical_payload "
                    "FROM events JOIN typed_payloads USING(event_id) WHERE events.event_id=?",
                    (corrected["event_id"],),
                ).fetchone()
            raw_event = json.loads(raw_text)
            effective_payload = json.loads(typed_text)
            self.assertEqual(raw_event["payload"]["schema"], "memory-correction/v1")
            self.assertEqual(raw_event, corrected)
            self.assertEqual(effective_payload["schema"], "memory-claim/v1")
            self.assertEqual(effective_payload["value"], 18.25)

            scope = AccessScope(
                scope_id="phase5-pit-test",
                policy_version="1",
                classifications=("public",),
                source_tiers=(1,),
                embedding_classifications=(),
            )
            before = compile_context_packet(
                database,
                expected_projection_digest=projection.digest,
                query=_at("2026-01-04T12:00:00Z"),
                access_scope=scope,
                evidence_verifier=DeterministicVerifier(),
                evaluated_at="2026-01-04T12:00:00Z",
            )
            before_entries = before.packet["content"]["entries"]
            before_claims = [
                entry for entry in before_entries if entry["record_type"] == "memory-claim/v1"
            ]
            self.assertEqual([entry["event_id"] for entry in before_claims], [original["event_id"]])
            self.assertEqual(before_claims[0]["payload"]["value"], 20.0)
            self.assertIsNone(before_claims[0]["canonical_provenance"]["correction"])

            current = compile_context_packet(
                database,
                expected_projection_digest=projection.digest,
                query=_at("2026-01-06T00:00:00Z"),
                access_scope=scope,
                evidence_verifier=DeterministicVerifier(),
                evaluated_at="2026-01-06T00:00:00Z",
            )
            current_entries = current.packet["content"]["entries"]
            current_claims = [
                entry for entry in current_entries if entry["record_type"] == "memory-claim/v1"
            ]
            self.assertEqual([entry["event_id"] for entry in current_claims], [corrected["event_id"]])
            entry = current_claims[0]
            self.assertEqual(entry["payload"], effective_payload)
            provenance = entry["canonical_provenance"]
            self.assertEqual(provenance["correction"], corrected["payload"])
            self.assertEqual(
                provenance["canonical_event_sha256"],
                "sha256:" + canonical_sha256(corrected),
            )
            self.assertEqual(provenance["trace_id"], corrected["trace_id"])

            hostile_packet = copy.deepcopy(current.packet)
            hostile_manifest = copy.deepcopy(current.manifest)
            hostile_claim = next(
                item
                for item in hostile_packet["content"]["entries"]
                if item["event_id"] == corrected["event_id"]
            )
            hostile_claim["canonical_provenance"]["canonical_event_sha256"] = (
                "sha256:" + "0" * 64
            )
            _reseal_packet_manifest(hostile_packet, hostile_manifest)
            with self.assertRaisesRegex(RetrievalError, "canonical event commitment is stale"):
                verify_context_packet(hostile_packet, hostile_manifest)

    def test_two_corrections_of_one_predecessor_are_rejected_as_a_branch(self) -> None:
        original = _claim(
            3,
            1,
            20.0,
            "Original reported margin.",
            system_time="2026-01-04T00:00:00Z",
        )
        original["event_type"] = "claim.asserted"
        original["trace_id"] = "1" * 32
        original = seal_event(original)
        first = _correction_event(
            original,
            event_id="evt_" + UUIDS[2],
            correction_id="correction_" + UUIDS[3],
            system_time="2026-01-05T00:00:00Z",
            value=18.25,
            qualifier="First reviewed correction.",
        )
        second = _correction_event(
            original,
            event_id="evt_" + UUIDS[4],
            correction_id="correction_" + UUIDS[5],
            system_time="2026-01-06T00:00:00Z",
            value=17.5,
            qualifier="Competing reviewed correction.",
        )
        with tempfile.TemporaryDirectory(prefix="memory-phase5-branch-") as temporary:
            with self.assertRaisesRegex(ProjectionError, "linear supersession chain"):
                build_projection(
                    [_source(), _evidence(), original, first, second],
                    Path(temporary) / "projection.sqlite",
                )

    def test_corrected_type_cannot_bypass_capsule_or_change_claim_subject(self) -> None:
        original = _claim(
            3,
            1,
            20.0,
            "Original reported margin.",
            system_time="2026-01-04T00:00:00Z",
        )
        original["event_type"] = "claim.asserted"
        original["trace_id"] = "1" * 32
        original = seal_event(original)

        direct = copy.deepcopy(original)
        direct["event_id"] = "evt_" + UUIDS[6]
        direct["event_type"] = "claim.corrected"
        direct["system_time"] = "2026-01-05T00:00:00Z"
        direct["trace_id"] = "2" * 32
        direct["supersedes"] = [original["event_id"]]
        direct["payload"]["value"] = 1.0
        direct = seal_event(direct)
        with tempfile.TemporaryDirectory(prefix="memory-phase5-direct-") as temporary:
            with self.assertRaisesRegex(ProjectionError, "memory-correction/v1"):
                build_projection(
                    [_source(), _evidence(), original, direct],
                    Path(temporary) / "direct.sqlite",
                )

        wrong_subject = _correction_event(
            original,
            event_id="evt_" + UUIDS[7],
            correction_id="correction_" + UUIDS[8],
            system_time="2026-01-05T00:00:00Z",
            value=18.25,
            qualifier="Attempts to move the claim to another subject.",
            replacement_subject="entity:internal:unrelated-subject",
        )
        with tempfile.TemporaryDirectory(prefix="memory-phase5-subject-") as temporary:
            with self.assertRaisesRegex(ProjectionError, "subject_id"):
                build_projection(
                    [_source(), _evidence(), original, wrong_subject],
                    Path(temporary) / "subject.sqlite",
                )

    def test_claim_tombstone_remains_a_valid_content_free_deletion_path(self) -> None:
        original = _claim(
            3,
            1,
            20.0,
            "Original claim that will be tombstoned.",
            system_time="2026-01-04T00:00:00Z",
        )
        original["event_type"] = "claim.asserted"
        original["trace_id"] = "1" * 32
        original = seal_event(original)
        tombstone_payload = {
            "schema": "memory-tombstone/v1",
            "target_event_id": original["event_id"],
            "reason_code": "administrative-revocation",
            "basis": "integrity-policy",
            "basis_id": None,
        }
        tombstone = seal_event(
            {
                "schema": "memory-event/v1",
                "event_id": "evt_" + UUIDS[9],
                # Same event type is required by the immutable supersession graph;
                # the tombstone payload is the sole discriminator exception.
                "event_type": "claim.asserted",
                "subject_ids": list(original["subject_ids"]),
                "valid_time": copy.deepcopy(original["valid_time"]),
                "system_time": "2026-01-05T00:00:00Z",
                "producer": copy.deepcopy(original["producer"]),
                "run_id": original["run_id"],
                "trace_id": "3" * 32,
                "payload": tombstone_payload,
                "evidence_refs": [],
                "derived_from": [],
                "supersedes": [original["event_id"]],
                "integrity": {"payload_sha256": "0" * 64, "signature": None},
                "policy": {
                    "classification": original["policy"]["classification"],
                    "retention": "tombstone-only",
                    "retain_until": None,
                },
            }
        )
        with tempfile.TemporaryDirectory(prefix="memory-phase5-tombstone-") as temporary:
            projection = build_projection(
                [_source(), _evidence(), original, tombstone],
                Path(temporary) / "projection.sqlite",
            )
            self.assertEqual(projection.event_count, 4)


if __name__ == "__main__":
    unittest.main()
