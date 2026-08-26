#!/usr/bin/env python3
from __future__ import annotations

import copy
import hashlib
import json
import unittest
from pathlib import Path

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from memory_shadow_evaluation import (
    ShadowEvaluationError,
    analytical_agent_keys,
    build_report,
    seal_observation,
    seal_preregistration,
    verify_adjudication_attestation,
)
from validate_screener_json import Checker


ROOT = Path(__file__).resolve().parents[1]
SCHEMA = ROOT / "frameworks/memory/shadow-evaluation-report-v1.schema.json"
_ADJUDICATOR = Ed25519PrivateKey.generate()
ADJUDICATOR_PRIVATE = _ADJUDICATOR.private_bytes(
    serialization.Encoding.Raw, serialization.PrivateFormat.Raw, serialization.NoEncryption(),
)
ADJUDICATOR_PUBLIC = _ADJUDICATOR.public_key().public_bytes(
    serialization.Encoding.Raw, serialization.PublicFormat.Raw,
)


def digest(value: str) -> str:
    return "sha256:" + hashlib.sha256(value.encode()).hexdigest()


def fixtures(mode: str = "synthetic-ci") -> tuple[dict, list[dict]]:
    agent_keys = analytical_agent_keys(ROOT)
    prereg = seal_preregistration(
        evaluation_id="memory-shadow-eval-release-1", evaluation_mode=mode,
        registered_at="2026-08-25T00:00:00.000000Z",
        provider_models=["codex/gpt-5.5", "claude/claude-opus"],
        required_agent_keys=agent_keys,
    )
    observations: list[dict] = []
    for index in range(100):
        parity_index = index // 2 if index < 20 else None
        provider = "codex" if index % 2 == 0 else "claude"
        model = "gpt-5.5" if provider == "codex" else "claude-opus"
        group_seed = f"parity-{parity_index}" if parity_index is not None else f"single-{index}"
        agent_index = parity_index if parity_index is not None else 10 + ((index - 20) % max(1, len(agent_keys) - 10))
        agent_key = agent_keys[agent_index % len(agent_keys)]
        module = "master" if agent_key == "master/synthesizer" else agent_key.split("/", 1)[0]
        baseline = {
            "serious_errors": 0, "contradiction_opportunities": 1, "contradictions_surfaced": 0,
            "prior_defense_opportunities": 1, "prior_defenses_completed": 0,
            "abstention_opportunities": 1, "correct_abstentions": 0,
        }
        memory = {
            **baseline, "contradictions_surfaced": 1, "prior_defenses_completed": 1,
            "correct_abstentions": 1, "material_memory_claims": 1,
            "claims_with_exact_evidence_or_inference": 1, "qualifier_losses": 0,
            "protected_content_leaks": 0, "temporal_leaks": 0,
            "mandatory_prior_checks": 1, "mandatory_prior_rechecked": 1,
        }
        body = {
            "schema": "memory-shadow-pair-observation/v1", "evaluation_id": prereg["evaluation_id"],
            "preregistration_sha256": prereg["preregistration_sha256"],
            "pair_id": f"pair-{index:03d}",
            "provider_parity_group": None if parity_index is None else f"provider-case-{parity_index:02d}",
            "run_id": f"run-{index % 10:02d}", "issuer_key": f"issuer-{index % 10:02d}",
            "issuer_has_prior_review": index % 10 < 5,
            "task_id": agent_key, "agent_id": agent_key, "module": module,
            "provider": provider, "model": model,
            "prompt_program_sha256": digest("prompt"), "source_pool_sha256": digest(group_seed + "-sources"),
            "snapshot_sha256": digest(group_seed + "-snapshot"), "access_scope_sha256": digest("access"),
            "packet_data_sha256": digest(group_seed + "-packet"),
            "completed_at": "2026-08-26T00:00:00.000000Z",
            "baseline_output_sha256": digest(f"baseline-{index}"),
            "memory_output_sha256": digest(f"memory-{index}"),
            "baseline_cost_microusd": 100, "memory_cost_microusd": 120,
            "context_compilation_millis": 100,
            "baseline_metrics": baseline, "memory_metrics": memory,
            "adjudicator_id": "independent-shadow-adjudicator",
        }
        observations.append(seal_observation(body))
    return prereg, observations


def production_report(prereg: dict, observations: list[dict]) -> dict:
    return build_report(
        prereg, observations, adjudicator_private_key=ADJUDICATOR_PRIVATE,
        adjudicator_key_id="shadow-adjudicator-key",
        adjudicator_id="independent-shadow-adjudicator",
        attested_at="2026-08-26T00:01:00.000000Z",
    )


class ShadowEvaluationTests(unittest.TestCase):
    def test_fixed_100_task_gate_passes_but_synthetic_evidence_cannot_enable_production(self) -> None:
        prereg, observations = fixtures()
        report = build_report(prereg, observations)
        self.assertEqual(100, report["sample"]["paired_tasks"])
        self.assertEqual(10, report["sample"]["runs"])
        self.assertEqual(5, report["sample"]["issuers_with_prior_reviews"])
        self.assertEqual("met", report["provider_parity"]["status"])
        self.assertTrue(report["gate"]["quality_passed"])
        self.assertFalse(report["gate"]["counts_as_production_evidence"])
        checker = Checker(json.loads(SCHEMA.read_text(encoding="utf-8")))
        schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
        checker.check(schema, report, "")
        self.assertEqual([], checker.errors)

    def test_same_evidence_counts_only_after_a_production_shadow_preregistration(self) -> None:
        prereg, observations = fixtures("production-shadow")
        with self.assertRaisesRegex(ShadowEvaluationError, "trusted adjudicator attestation"):
            build_report(prereg, observations)
        report = production_report(prereg, observations)
        self.assertTrue(report["gate"]["counts_as_production_evidence"])
        self.assertEqual(["claude/claude-opus", "codex/gpt-5.5"], report["gate"]["approved_provider_models"])
        self.assertTrue(verify_adjudication_attestation(
            report, public_key=ADJUDICATOR_PUBLIC, key_id="shadow-adjudicator-key",
        ))

    def test_qualifier_loss_cost_or_packet_mismatch_blocks_release(self) -> None:
        for mutation, blocker in (
            ("qualifier", "qualifier-loss"), ("cost", "steady-state-cost"), ("packet", "provider-parity"),
        ):
            prereg, observations = fixtures("production-shadow")
            row = dict(observations[0])
            if mutation == "qualifier":
                row["memory_metrics"] = {**row["memory_metrics"], "qualifier_losses": 1}
            elif mutation == "cost":
                observations = [seal_observation({**item, "memory_cost_microusd": 200}) for item in observations]
                row = observations[0]
            else:
                row["packet_data_sha256"] = digest("mismatch")
            observations[0] = seal_observation(row)
            report = production_report(prereg, observations)
            self.assertIn(blocker, report["gate"]["blocking_reasons"])
            self.assertFalse(report["gate"]["counts_as_production_evidence"])

    def test_global_enforcement_requires_shadow_coverage_of_every_profiled_analytical_agent(self) -> None:
        prereg, observations = fixtures("production-shadow")
        missing = prereg["required_agent_keys"][-1]
        replacement = prereg["required_agent_keys"][0]
        changed = []
        for item in observations:
            if item["agent_id"] != missing:
                changed.append(item)
                continue
            changed.append(seal_observation({
                **item, "agent_id": replacement, "task_id": replacement,
            }))
        report = production_report(prereg, changed)
        self.assertIn("analytical-agent-coverage", report["gate"]["blocking_reasons"])
        self.assertEqual([missing], report["sample"]["missing_agent_keys"])
        self.assertFalse(report["gate"]["counts_as_production_evidence"])

    def test_tamper_or_self_adjudication_is_rejected_before_aggregation(self) -> None:
        prereg, observations = fixtures()
        tampered = copy.deepcopy(observations)
        tampered[0]["context_compilation_millis"] = 0
        with self.assertRaisesRegex(ShadowEvaluationError, "hash"):
            build_report(prereg, tampered)
        self_authored = dict(observations[0])
        self_authored["adjudicator_id"] = self_authored["agent_id"]
        self_authored = seal_observation(self_authored)
        with self.assertRaisesRegex(ShadowEvaluationError, "independent adjudicator"):
            build_report(prereg, [self_authored, *observations[1:]])
        changed_opportunities = dict(observations[0])
        changed_opportunities["memory_metrics"] = {
            **changed_opportunities["memory_metrics"], "contradiction_opportunities": 2,
        }
        with self.assertRaisesRegex(ShadowEvaluationError, "disagree on contradiction_opportunities"):
            build_report(prereg, [seal_observation(changed_opportunities), *observations[1:]])
        changed_preregistration = seal_preregistration(
            evaluation_id=prereg["evaluation_id"], evaluation_mode=prereg["evaluation_mode"],
            registered_at=prereg["registered_at"],
            provider_models=[*prereg["provider_models"], "codex/gpt-new"],
            required_agent_keys=prereg["required_agent_keys"],
        )
        with self.assertRaisesRegex(ShadowEvaluationError, "exact preregistration"):
            build_report(changed_preregistration, observations)


if __name__ == "__main__":
    unittest.main()
