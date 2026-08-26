#!/usr/bin/env python3
from __future__ import annotations

import copy
import datetime as dt
import hashlib
import json
import os
import tempfile
import unittest
from pathlib import Path

from canonical_json import canonical_sha256
from memory_candidate_intake import (
    CandidateIntakeError,
    build_intake_receipt,
    intake_attested_candidates,
    materialize_candidate_suggestions,
)
from memory_projection import build_projection
from memory_procedural import seed_initial_candidates
from research_memory_run import memory_id, sha


NOW = "2026-08-25T12:00:00Z"
MOMENT = dt.datetime(2026, 8, 25, 12, tzinfo=dt.timezone.utc)
ISSUER = "entity:internal:test-issuer"
LISTING = "security:mic-ticker:XNAS:TEST"
POLICY = {"classification": "internal", "retention": "permanent", "retain_until": None}


def source_event(source: bytes, locator: str) -> dict:
    digest = hashlib.sha256(source).hexdigest()
    payload = {
        "legacy_schema": "candidate-intake-fixture/v1",
        "record_type": "equity_decision_correction",
        "source_path": "data/TEST/filing.txt",
        "source_locator": locator,
        "source_sha256": digest,
        "identity_mapping": {"strategy": "fixture"},
        "time_mapping": {"system_time_field": "fixture", "valid_time_field": "fixture"},
        "record": {"ticker": "TEST", "correction": "Reconcile the filing basis."},
        "record_canonical_json": "{}",
        "record_sha256": digest,
    }
    return {
        "schema": "memory-event/v1",
        "event_id": "evt_00000000-0000-5000-8000-000000000001",
        "event_type": "correction.recorded",
        "subject_ids": [ISSUER, LISTING],
        "valid_time": {"from": "2026-08-20", "to": None},
        "system_time": "2026-08-20T12:00:00Z",
        "producer": {
            "kind": "adapter", "name": "fixture", "runtime": "python",
            "model": None, "prompt_program_sha": None,
        },
        "run_id": "run_00000000-0000-5000-8000-000000000001",
        "trace_id": None,
        "payload": payload,
        "evidence_refs": [], "derived_from": [], "supersedes": [],
        "integrity": {"payload_sha256": canonical_sha256(payload), "signature": None},
        "policy": copy.deepcopy(POLICY),
    }


def receipt() -> dict:
    return {
        "created_at": NOW,
        "issuer_listing": {
            "legal_name": "Test Issuer, Inc.", "issuer_id": ISSUER,
            "listing_id": LISTING, "mic": "XNAS", "ticker": "TEST",
            "currency": "USD", "resolution_status": "exact",
        },
        "provider_access": {"classifications": ["public", "internal"]},
    }


def semantic(evidence_ref: str) -> dict:
    return {
        "lesson_kind": "exact-issuer", "effect": "current-check-required",
        "statement": "Recheck the filing basis before reusing a vendor value.",
        "applicability": {
            "agents": [], "modules": ["earnings"], "issuer_ids": [ISSUER],
            "listing_ids": [LISTING], "sectors": [], "jurisdictions": ["US"],
            "accounting_standards": [], "metrics": ["earnings"], "source_types": [],
        },
        "supporting_evidence": [evidence_ref], "contradicting_evidence": [],
        "observations": [{"issuer_id": ISSUER, "effective_at": NOW, "evidence_ref": evidence_ref}],
        "effective_observation_count": 1, "distinct_issuer_count": 1,
        "valid_time": {"from": "2026-08-20", "to": None}, "review_due": "2026-12-01",
    }


class CandidateIntakeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.repository = self.root / "repository"
        self.state = self.root / "state"
        self.repository.mkdir()
        self.database = self.root / "projection.sqlite"
        self.source = b"audited revenue 100"
        self.locator = "p.42"
        build_projection([source_event(self.source, self.locator)], self.database)
        self.evidence = f"evidence:sha256:{hashlib.sha256(self.source).hexdigest()}#{self.locator}"
        self.task_episode_id = memory_id("task-episode", "candidate-intake-task")
        self.key = self.root / "protected.key"
        self.key.write_bytes(b"k" * 32)
        os.chmod(self.key, 0o600)

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def test_supervisor_derives_author_provenance_hash_and_queues_after_attestation(self) -> None:
        draft = {
            "kind": "semantic", "candidate_type": "lesson",
            "source_basis": "current-evidence-extraction",
            "semantic": semantic(self.evidence), "policy": copy.deepcopy(POLICY),
        }
        candidates = materialize_candidate_suggestions(
            [draft], receipt=receipt(), agent_id="earnings-historical-financials",
            task_episode_id=self.task_episode_id, current_evidence_refs=[self.evidence],
            database_path=self.database, now=MOMENT,
        )
        candidate = candidates[0]
        self.assertEqual({"kind": "agent", "id": "earnings-historical-financials"}, candidate["created_by"])
        self.assertEqual(["evt_00000000-0000-5000-8000-000000000001"], candidate["originating_episode_ids"])
        self.assertEqual(candidate["candidate_sha256"], sha({
            key: value for key, value in candidate.items() if key != "candidate_sha256"
        }))
        paths = intake_attested_candidates(
            candidates, state_root=self.state, repository_root=self.repository,
            protected_master_key=None, protected_key_id=None,
            attestation={"valid": True}, output_gate_passed=True,
        )
        self.assertEqual(1, len(paths))
        self.assertTrue(paths[0].is_file())
        # Exact replay is idempotent and does not create a second queue object.
        replay = intake_attested_candidates(
            candidates, state_root=self.state, repository_root=self.repository,
            protected_master_key=None, protected_key_id=None,
            attestation={"valid": True}, output_gate_passed=True,
        )
        self.assertEqual(paths, replay)

        protected = copy.deepcopy(candidates[0])
        protected["policy"]["classification"] = "confidential"
        protected["candidate_sha256"] = sha({
            key: value for key, value in protected.items() if key != "candidate_sha256"
        })
        with self.assertRaisesRegex(CandidateIntakeError, "requires-encryption"):
            intake_attested_candidates(
                [protected], state_root=self.state, repository_root=self.repository,
                protected_master_key=None, protected_key_id=None,
                attestation={"valid": True}, output_gate_passed=True,
            )

    def test_unattested_evidence_wrong_scope_and_hash_only_suggestions_fail_closed(self) -> None:
        draft = {
            "kind": "semantic", "candidate_type": "lesson",
            "source_basis": "current-evidence-extraction",
            "semantic": semantic(self.evidence), "policy": copy.deepcopy(POLICY),
        }
        with self.assertRaisesRegex(CandidateIntakeError, "evidence-not-attested"):
            materialize_candidate_suggestions(
                [draft], receipt=receipt(), agent_id="agent", task_episode_id=self.task_episode_id,
                current_evidence_refs=[], database_path=self.database, now=MOMENT,
            )
        wrong = copy.deepcopy(draft)
        wrong["semantic"]["applicability"]["listing_ids"] = ["security:mic-ticker:XNYS:TEST"]
        with self.assertRaisesRegex(CandidateIntakeError, "scope-mismatch"):
            materialize_candidate_suggestions(
                [wrong], receipt=receipt(), agent_id="agent", task_episode_id=self.task_episode_id,
                current_evidence_refs=[self.evidence], database_path=self.database, now=MOMENT,
            )
        with self.assertRaisesRegex(CandidateIntakeError, "unmaterialized-hash"):
            materialize_candidate_suggestions(
                ["sha256:" + "0" * 64], receipt=receipt(), agent_id="agent",
                task_episode_id=self.task_episode_id, current_evidence_refs=[self.evidence],
                database_path=self.database, now=MOMENT,
            )
        malformed_receipt = receipt()
        malformed_receipt["provider_access"] = None
        with self.assertRaisesRegex(CandidateIntakeError, "provider-access-invalid"):
            materialize_candidate_suggestions(
                [draft], receipt=malformed_receipt, agent_id="agent",
                task_episode_id=self.task_episode_id,
                current_evidence_refs=[self.evidence], database_path=self.database,
                now=MOMENT,
            )

    def test_exact_issuer_candidate_cannot_use_another_issuers_evidence(self) -> None:
        event = source_event(self.source, self.locator)
        event["subject_ids"] = [
            "entity:internal:other-issuer", "security:mic-ticker:XNAS:OTHER",
        ]
        build_projection([event], self.database)
        draft = {
            "kind": "semantic", "candidate_type": "lesson",
            "source_basis": "current-evidence-extraction",
            "semantic": semantic(self.evidence), "policy": copy.deepcopy(POLICY),
        }
        with self.assertRaisesRegex(CandidateIntakeError, "issuer-listing-mismatch"):
            materialize_candidate_suggestions(
                [draft], receipt=receipt(), agent_id="agent",
                task_episode_id=self.task_episode_id,
                current_evidence_refs=[self.evidence], database_path=self.database, now=MOMENT,
            )

    def test_procedural_suggestion_gets_task_lineage_and_cannot_supply_supervisor_fields(self) -> None:
        seeded = seed_initial_candidates(
            created_by={"kind": "system", "id": "seed"},
            now=dt.datetime(2026, 8, 25, 12, tzinfo=dt.timezone.utc),
        )[0]
        core = copy.deepcopy(seeded["playbook"])
        for field in ("originating_episode_ids", "counterexample_ids", "validation_case_ids", "measured_effect"):
            core.pop(field)
        candidates = materialize_candidate_suggestions(
            [{"kind": "procedural", "playbook": core, "policy": copy.deepcopy(POLICY)}],
            receipt=receipt(), agent_id="master-synthesizer", task_episode_id=self.task_episode_id,
            current_evidence_refs=[], database_path=self.database, now=MOMENT,
        )
        self.assertEqual([self.task_episode_id], candidates[0]["playbook"]["originating_episode_ids"])
        self.assertEqual(4, len(candidates[0]["playbook"]["validation_case_ids"]))
        forged = copy.deepcopy(core)
        forged["originating_episode_ids"] = [self.task_episode_id]
        with self.assertRaisesRegex(CandidateIntakeError, "supervisor-fields-forbidden"):
            materialize_candidate_suggestions(
                [{"kind": "procedural", "playbook": forged, "policy": copy.deepcopy(POLICY)}],
                receipt=receipt(), agent_id="master-synthesizer", task_episode_id=self.task_episode_id,
                current_evidence_refs=[], database_path=self.database, now=MOMENT,
            )

    def test_candidate_receipt_is_content_free_and_hash_bound(self) -> None:
        receipt_value = build_intake_receipt(
            run_id="run-1", task_id="task-1", task_episode_id=self.task_episode_id,
            use_id=memory_id("memory-use", "candidate-use"),
            candidates=[{
                "schema": "memory-semantic-candidate/v1",
                "candidate_id": memory_id("semantic-candidate", "candidate"),
                "candidate_sha256": "sha256:" + "a" * 64,
            }],
        )
        self.assertNotIn("statement", json.dumps(receipt_value))
        self.assertEqual(receipt_value["receipt_sha256"], sha({
            key: value for key, value in receipt_value.items() if key != "receipt_sha256"
        }))

        with self.assertRaisesRegex(CandidateIntakeError, "materialized-candidate-invalid"):
            intake_attested_candidates(
                [None], state_root=self.state, repository_root=self.repository,
                protected_master_key=None, protected_key_id=None,
                attestation={"valid": True}, output_gate_passed=True,
            )


if __name__ == "__main__":
    unittest.main()
