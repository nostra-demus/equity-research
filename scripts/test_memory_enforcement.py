#!/usr/bin/env python3
from __future__ import annotations

import copy
import contextlib
import io
import json
import os
import tempfile
import unittest
from pathlib import Path

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from canonical_json import canonical_sha256
from memory_enforcement import EnforcementError, create_activation, verify_activation
from memory_shadow_evaluation import build_report as build_shadow_report
from memory_three_layer_benchmark import score_results
from research_memory_run_cli import main as research_memory_cli
from test_memory_operations import _full_report
from test_memory_shadow_evaluation import fixtures as shadow_fixtures
from validate_screener_json import Checker


ROOT = Path(__file__).resolve().parents[1]


def three_layer_report(mode: str = "runtime-held-out") -> dict:
    path = ROOT / "frameworks/memory/three-layer-benchmark-v1.json"
    raw = path.read_bytes()
    benchmark = json.loads(raw)
    candidate = {
        "schema": "memory-three-layer-candidate-results/v1",
        "benchmark_sha256": "sha256:" + canonical_sha256(benchmark),
        "evaluation_mode": mode,
        "cases": [{
            "id": row["id"], "records": row["expected_records"], "action": row["expected_action"],
            "protected_content_leak": False, "temporal_leak": False, "qualifier_loss": False,
            "false_current_evidence": False, "executed_non_applicable_procedure": False,
        } for row in benchmark["cases"]],
    }
    return score_results(benchmark, candidate, benchmark_bytes=raw)


class EnforcementActivationTests(unittest.TestCase):
    def setUp(self) -> None:
        key = Ed25519PrivateKey.generate()
        self.private = key.private_bytes(
            serialization.Encoding.Raw, serialization.PrivateFormat.Raw, serialization.NoEncryption(),
        )
        self.public = key.public_key().public_bytes(
            serialization.Encoding.Raw, serialization.PublicFormat.Raw,
        )
        self.three_layer = three_layer_report()
        prereg, observations = shadow_fixtures("production-shadow")
        self.shadow = build_shadow_report(prereg, observations)
        rebuild = {
            "schema": "memory-maintenance-rebuild/v1", "observation_id": "memory-rebuild-test",
            "started_at": "2026-08-20T00:00:00.000000Z", "completed_at": "2026-08-20T00:01:00.000000Z",
            "duration_milliseconds": 60_000, "status": "completed", "source": "production-projection",
            "repository_sha": "1" * 40, "projection_digest": "sha256:" + "2" * 64,
            "event_count": 424, "identity_registry_sha256": "sha256:" + "3" * 64,
            "checkpoint_sha256": "sha256:" + "4" * 64, "diagnostic_count": 0,
        }
        rebuild["observation_sha256"] = "sha256:" + canonical_sha256(rebuild)
        self.readiness = _full_report(
            evaluated_at="2026-08-26T12:00:00Z",
            rebuild_observation=rebuild, shadow_evaluation_report=self.shadow,
        )

    def activation(self) -> dict:
        return create_activation(
            readiness=self.readiness, three_layer=self.three_layer, shadow=self.shadow,
            created_at="2026-08-27T00:00:00.000000Z", expires_at="2026-09-20T00:00:00.000000Z",
            private_key=self.private, key_id="memory-enforcement-release",
            activation_id="memory-enforcement-release-1",
        )

    def test_only_signed_current_production_evidence_enables_an_approved_provider(self) -> None:
        activation = self.activation()
        result = verify_activation(
            activation, readiness=self.readiness, three_layer=self.three_layer, shadow=self.shadow,
            public_key=self.public, key_id="memory-enforcement-release",
            provider="codex", model="gpt-5.5", now="2026-08-28T00:00:00.000000Z",
        )
        self.assertTrue(result["ok"])
        node_clock_result = verify_activation(
            activation, readiness=self.readiness, three_layer=self.three_layer, shadow=self.shadow,
            public_key=self.public, key_id="memory-enforcement-release",
            provider="codex", model="gpt-5.5", now="2026-08-28T00:00:00.000Z",
        )
        self.assertTrue(node_clock_result["ok"])
        schema = json.loads((ROOT / "frameworks/memory/enforcement-activation-v1.schema.json").read_text(encoding="utf-8"))
        checker = Checker(schema); checker.check(schema, activation, "")
        self.assertEqual([], checker.errors)

    def test_tamper_expiry_and_unapproved_provider_fail_closed(self) -> None:
        activation = self.activation()
        tampered = copy.deepcopy(activation); tampered["evidence"]["shadow_evaluation_sha256"] = "sha256:" + "0" * 64
        for candidate, provider, model, now, match in (
            (tampered, "codex", "gpt-5.5", "2026-08-28T00:00:00.000000Z", "current release evidence"),
            (activation, "codex", "gpt-5.5", "2026-09-20T00:00:00.000000Z", "not currently valid"),
            (activation, "other", "model", "2026-08-28T00:00:00.000000Z", "did not pass"),
        ):
            with self.assertRaisesRegex(EnforcementError, match):
                verify_activation(
                    candidate, readiness=self.readiness, three_layer=self.three_layer, shadow=self.shadow,
                    public_key=self.public, key_id="memory-enforcement-release",
                    provider=provider, model=model, now=now,
                )

    def test_synthetic_or_unmeasured_evidence_can_never_be_signed_active(self) -> None:
        synthetic = three_layer_report("synthetic-ci")
        with self.assertRaisesRegex(EnforcementError, "runtime-held-out"):
            create_activation(
                readiness=self.readiness, three_layer=synthetic, shadow=self.shadow,
                created_at="2026-08-27T00:00:00.000000Z", expires_at="2026-09-20T00:00:00.000000Z",
                private_key=self.private, key_id="memory-enforcement-release",
            )
        stale_roster = copy.deepcopy(self.shadow)
        stale_roster["roster_sha256"] = "sha256:" + "0" * 64
        stale_body = dict(stale_roster); stale_body.pop("report_sha256")
        stale_roster["report_sha256"] = "sha256:" + canonical_sha256(stale_body)
        with self.assertRaisesRegex(EnforcementError, "production shadow"):
            create_activation(
                readiness=self.readiness, three_layer=self.three_layer, shadow=stale_roster,
                created_at="2026-08-27T00:00:00.000000Z", expires_at="2026-09-20T00:00:00.000000Z",
                private_key=self.private, key_id="memory-enforcement-release",
            )
        unmeasured = copy.deepcopy(self.readiness)
        unmeasured["status"] = "unmeasured"
        body = dict(unmeasured); body.pop("report_sha256")
        unmeasured["report_sha256"] = "sha256:" + canonical_sha256(body)
        with self.assertRaises(Exception):
            create_activation(
                readiness=unmeasured, three_layer=self.three_layer, shadow=self.shadow,
                created_at="2026-08-27T00:00:00.000000Z", expires_at="2026-09-20T00:00:00.000000Z",
                private_key=self.private, key_id="memory-enforcement-release",
            )

    def test_supervisor_cli_verifies_activation_before_dispatch(self) -> None:
        activation = self.activation()
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            inputs = {
                "activation": activation, "readiness": self.readiness,
                "three-layer": self.three_layer, "shadow": self.shadow,
            }
            paths: dict[str, Path] = {}
            for name, value in inputs.items():
                target = root / f"{name}.json"
                target.write_text(json.dumps(value), encoding="utf-8")
                os.chmod(target, 0o600)
                paths[name] = target
            public_key = root / "public.key"
            public_key.write_bytes(self.public); os.chmod(public_key, 0o600)
            output = io.StringIO()
            with contextlib.redirect_stdout(output):
                status = research_memory_cli([
                    "verify-enforcement", "--activation", str(paths["activation"]),
                    "--readiness", str(paths["readiness"]), "--three-layer", str(paths["three-layer"]),
                    "--shadow", str(paths["shadow"]), "--public-key", str(public_key),
                    "--key-id", "memory-enforcement-release", "--provider", "codex",
                    "--model", "gpt-5.5", "--now", "2026-08-28T00:00:00.000000Z",
                ])
            self.assertEqual(0, status)
            self.assertEqual("memory-enforcement-verification/v1", json.loads(output.getvalue())["schema"])


if __name__ == "__main__":
    unittest.main()
