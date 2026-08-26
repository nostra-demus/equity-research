#!/usr/bin/env python3
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from memory_playbook_drift import load_playbooks, validate_drift
from memory_procedural import _set_prompt_playbook_ref
from memory_projection import build_projection
from test_memory_procedural import (
    ACTIVATED,
    CREATED,
    DISPATCHED,
    EVALUATED,
    approvals,
    build_activation_request,
    build_candidate,
    build_playbook,
    build_promotion_manifest,
    cases,
    core,
    evaluate_candidate,
    promotion_repository,
    signer,
    verifier,
)


class PlaybookDriftTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        promotion_repository(self.root)
        self.path = self.root / ".claude/agents/earnings/01_historical-financials.md"
        self.candidate = build_candidate(
            playbook=core(), created_by={"kind": "agent", "id": "origin-agent"},
            policy={"classification": "internal", "retention": "permanent", "retain_until": None},
            now=CREATED,
        )
        case_rows = cases(self.candidate)
        self.evaluation = evaluate_candidate(
            self.candidate, cases=case_rows,
            review_attestations=approvals(self.candidate, case_rows),
            verifier=verifier, now=EVALUATED,
        )
        self.playbook = build_playbook(
            self.candidate, self.evaluation, owner="research-methods",
            review_verifier=verifier, now=ACTIVATED,
        )

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def test_reference_is_required_and_detailed_duplication_is_rejected(self) -> None:
        errors = validate_drift(self.root, [self.playbook])
        self.assertTrue(any("missing authoritative" in error for error in errors))
        _set_prompt_playbook_ref(
            self.path, identity=self.playbook["playbook_id"],
            version=self.playbook["version"], active=True,
        )
        self.assertEqual([], validate_drift(self.root, [self.playbook]))
        operation = self.playbook["playbook"]["steps"][0]["operation"]
        self.path.write_text(self.path.read_text() + operation + "\n", encoding="utf-8")
        errors = validate_drift(self.root, [self.playbook])
        self.assertTrue(any("duplicates detailed procedure" in error for error in errors))

    def test_memory_isolated_agent_and_positive_lift_claim_fail(self) -> None:
        isolated = self.root / ".claude/agents/evidence-auditor.md"
        isolated.write_text(
            "---\nmemory_isolation: true\nplaybook_refs: ["
            f"{self.playbook['playbook_id']}@1]\n---\n# Auditor\n",
            encoding="utf-8",
        )
        self.path.write_text(
            self.path.read_text() + "Memory raises confidence when the procedure succeeds.\n",
            encoding="utf-8",
        )
        errors = validate_drift(self.root, [])
        self.assertTrue(any("memory-isolated" in error for error in errors))
        self.assertTrue(any("positive analytical lift" in error for error in errors))

    def test_projection_loader_returns_only_current_active_playbooks(self) -> None:
        manifest = build_promotion_manifest(
            self.candidate, self.playbook, self.evaluation,
            author={"kind": "service", "id": "promotion-service"},
            branch="codex/memory-promotion-drift-test", pull_request=123,
            signer=signer, review_verifier=verifier, now=ACTIVATED,
        )
        event, _request = build_activation_request(
            self.candidate, self.playbook, self.evaluation, manifest,
            expected_head="sha256:" + "0" * 64, service_id="promotion-service",
            verifier=verifier, now=DISPATCHED,
        )
        projection_path = self.root / "projection.sqlite"
        projection = build_projection([event], projection_path)
        loaded = load_playbooks(
            projection=projection_path, projection_digest="sha256:" + projection.digest,
            as_of="2026-08-25T13:00:00Z",
        )
        self.assertEqual([self.playbook["playbook_sha256"]], [row["playbook_sha256"] for row in loaded])


if __name__ == "__main__":
    unittest.main()
