#!/usr/bin/env python3
"""Focused host-provisioning regressions for the production shadow-memory boundary."""
from __future__ import annotations

import json
import os
import stat
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from memory_runtime import (  # noqa: E402
    authorize_provider,
    ed25519_policy_verifier,
    load_controlled_ledger_events,
    load_protected_store_events,
    _atomic_private_write,
)
from memory_shadow_bootstrap import (  # noqa: E402
    BootstrapError,
    POLICY_KEY_ID,
    PROTECTED_KEY_ID,
    SERVICE_IDENTITY,
    _create_private_file,
    _parse_provider_models,
    _pending_path,
    _pending_record,
    provision,
    status,
)


class MemoryShadowBootstrapTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.private = Path(self.temporary.name)
        self.base = self.private / "memory"
        self.environment = self.private / "config" / "providers.env"
        self.models = _parse_provider_models([
            "codex/gpt-5.6-sol",
            "codex/gpt-5.6-terra",
            "claude/sonnet",
            "codex/gpt-5.6-sol",
        ])

    def tearDown(self) -> None:
        self.temporary.cleanup()

    @staticmethod
    def fake_projection(_root: Path, paths) -> dict:
        _atomic_private_write(paths["checkpoint"], {
            "schema": "test-shadow-checkpoint/v1",
            "projection_digest": "sha256:" + "a" * 64,
        })
        return {
            "source": "deterministic-local-rebuild",
            "repository_sha": "b" * 40,
            "projection_digest": "sha256:" + "a" * 64,
            "event_count": 0,
            "checkpoint_sha256": "sha256:" + "c" * 64,
        }

    def provision(self):
        return provision(
            repository_root=ROOT,
            base_root=self.base,
            environment_file=self.environment,
            provider_models=self.models,
            projection_preparer=self.fake_projection,
        )

    def test_provision_is_private_valid_and_idempotent(self) -> None:
        first = self.provision()
        self.assertTrue(first["ok"])
        self.assertTrue(first["created"])
        self.assertEqual(first["mode"], "shadow")
        self.assertNotIn("token", json.dumps(first).lower())

        manifest = json.loads((self.base / "bootstrap-manifest.json").read_text())
        paths = {name: Path(value) for name, value in manifest["paths"].items()}
        before_keys = {
            name: paths[name].read_bytes()
            for name in (
                "protected_master_key", "checkpoint_private_key", "contract_private_key",
                "policy_private_key", "quarantine_token",
            )
        }
        policy = json.loads(paths["provider_policy"].read_text())
        for provider, model in self.models:
            narrowed = authorize_provider(
                policy,
                provider=provider,
                model=model,
                service_identity=SERVICE_IDENTITY,
                requested_classifications=["public", "internal"],
                requested_source_tiers=[1, 2, 3, 4, 5],
                verifier=ed25519_policy_verifier(
                    paths["policy_public_key"], key_id=POLICY_KEY_ID,
                ),
            )
            self.assertFalse(narrowed["embedding_permitted"])
        self.assertEqual(
            load_controlled_ledger_events(
                paths["canonical_ledger"], writer_head_path=paths["writer_head"],
            ),
            [],
        )
        self.assertEqual(
            load_protected_store_events(
                paths["protected_store"],
                master_key_path=paths["protected_master_key"],
                key_id=PROTECTED_KEY_ID,
                service_identity="memory-projection-reader",
            ),
            [],
        )
        environment = self.environment.read_text()
        self.assertIn("NOSTRA_MEMORY_MODE=shadow\n", environment)
        self.assertIn(
            f"NOSTRA_MEMORY_WRITER_OWNER_PATH={paths['writer_owner']}\n",
            environment,
        )
        for inactive in (
            "NOSTRA_MEMORY_CANDIDATE_INTAKE_IDENTITY",
            "NOSTRA_MEMORY_VERIFIER_IDENTITY",
            "NOSTRA_MEMORY_WRITER_OWNER",
            "NOSTRA_MEMORY_PROMOTION_SERVICE_IDENTITY",
            "NOSTRA_MEMORY_RESTORE_SERVICE_IDENTITY",
        ):
            self.assertNotIn(f"{inactive}=", environment)
        self.assertNotEqual(
            "memory-canonical-writer",
            str(paths["writer_owner"]),
        )
        writer_configuration = json.loads(
            (paths["writer_state"] / "journal" / "configuration.json").read_text()
        )["configuration"]
        self.assertEqual(
            writer_configuration["promotion_manifest_verifier_id"],
            "memory-promotion-manifest-verifier-v1",
        )
        self.assertEqual(
            writer_configuration["retirement_proof_verifier_id"],
            "memory-retirement-proof-verifier-v1",
        )

        for directory in (self.base, paths["state_root"], paths["protected_store"]):
            self.assertEqual(stat.S_IMODE(directory.stat().st_mode), 0o700)
        for path in (
            paths["protected_master_key"], paths["checkpoint_private_key"],
            paths["contract_private_key"], paths["policy_private_key"],
            paths["quarantine_token"], self.environment,
        ):
            self.assertEqual(stat.S_IMODE(path.stat().st_mode), 0o600)

        second = self.provision()
        self.assertFalse(second["created"])
        self.assertEqual(second["manifest_sha256"], first["manifest_sha256"])
        self.assertEqual(
            before_keys,
            {name: paths[name].read_bytes() for name in before_keys},
        )
        checked = status(base_root=self.base, projection_verifier=self.fake_projection)
        self.assertTrue(checked["ok"])
        self.assertEqual(checked["snapshot"]["projection_digest"], "sha256:" + "a" * 64)
        self.environment.write_text(
            self.environment.read_text().replace(
                "NOSTRA_MEMORY_MODE=shadow", "NOSTRA_MEMORY_MODE=off",
            )
        )
        os.chmod(self.environment, 0o600)
        with self.assertRaisesRegex(BootstrapError, "NOSTRA_MEMORY_MODE does not match"):
            status(base_root=self.base, projection_verifier=self.fake_projection)

    def test_refuses_partial_root_and_different_provider_policy(self) -> None:
        self.base.mkdir(mode=0o700)
        with self.assertRaisesRegex(BootstrapError, "without a verified bootstrap manifest"):
            self.provision()
        (self.base / "unexpected").write_text("do not replace")
        with self.assertRaisesRegex(BootstrapError, "without a verified bootstrap manifest"):
            self.provision()
        self.assertEqual((self.base / "unexpected").read_text(), "do not replace")

        self.temporary.cleanup()
        self.temporary = tempfile.TemporaryDirectory()
        self.private = Path(self.temporary.name)
        self.base = self.private / "memory"
        self.environment = self.private / "config" / "providers.env"
        self.provision()
        with self.assertRaisesRegex(BootstrapError, "different provider/model policy"):
            provision(
                repository_root=ROOT,
                base_root=self.base,
                environment_file=self.environment,
                provider_models=_parse_provider_models(["codex/gpt-5.6-sol"]),
                projection_preparer=self.fake_projection,
            )

    def test_refuses_unowned_existing_memory_environment(self) -> None:
        self.environment.parent.mkdir(mode=0o700)
        self.environment.write_text("NOSTRA_MEMORY_MODE=off\n")
        os.chmod(self.environment, 0o600)
        with self.assertRaisesRegex(BootstrapError, "already contains memory configuration"):
            self.provision()
        self.assertFalse(self.base.exists())

    def test_recovers_only_a_matching_interrupted_bootstrap(self) -> None:
        self.base.mkdir(mode=0o700)
        identity = (self.base.stat().st_dev, self.base.stat().st_ino)
        pending = _pending_record(
            repository_root=ROOT,
            base_root=self.base,
            environment_file=self.environment,
            provider_models=self.models,
            root_identity=identity,
            nonce="a" * 64,
        )
        raw = json.dumps(pending).encode("utf-8")
        _create_private_file(self.base / ".bootstrap-pending.json", raw)
        _create_private_file(_pending_path(self.base), raw)
        (self.base / "keys").mkdir(mode=0o700)
        _create_private_file(self.base / "keys" / "partial.key", b"interrupted")

        result = self.provision()
        self.assertTrue(result["created"])
        self.assertFalse((self.base / ".bootstrap-pending.json").exists())
        self.assertFalse(_pending_path(self.base).exists())
        self.assertTrue((self.base / "bootstrap-manifest.json").is_file())

    def test_parser_rejects_malformed_provider_models(self) -> None:
        for value in ("codex", "/gpt-5", "Codex/gpt-5", "codex/has space"):
            with self.subTest(value=value), self.assertRaises(BootstrapError):
                _parse_provider_models([value])

    def test_refuses_repository_local_state_or_environment(self) -> None:
        with self.assertRaisesRegex(BootstrapError, "state root must live outside"):
            provision(
                repository_root=ROOT,
                base_root=ROOT / ".unsafe-memory-test",
                environment_file=self.environment,
                provider_models=self.models,
                projection_preparer=self.fake_projection,
            )
        with self.assertRaisesRegex(BootstrapError, "environment file must live outside"):
            provision(
                repository_root=ROOT,
                base_root=self.base,
                environment_file=ROOT / "providers.env",
                provider_models=self.models,
                projection_preparer=self.fake_projection,
            )


if __name__ == "__main__":
    unittest.main()
