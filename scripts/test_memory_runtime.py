#!/usr/bin/env python3
"""Production runtime boundary tests for three-layer memory."""
from __future__ import annotations

import datetime as dt
import base64
import hashlib
import hmac
import json
import os
import subprocess
import sys
import tempfile
import unittest
import uuid
from collections import Counter
from pathlib import Path


SCRIPTS = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS))

from canonical_json import canonical_json_bytes, canonical_sha256  # noqa: E402
from memory_crypto import AESGCMSIVEnvelopeCipher  # noqa: E402
from memory_store import MemoryStore  # noqa: E402
from memory_adapters import adapt_repository  # noqa: E402
from memory_runtime import (  # noqa: E402
    IdentityResolutionError,
    MemoryRuntimeError,
    ProjectionManager,
    ProviderAuthorizationError,
    RuntimeLifecycle,
    authorize_provider,
    build_identity_registry,
    ed25519_checkpoint_signer,
    ed25519_checkpoint_verifier,
    load_controlled_ledger_events,
    load_protected_store_events,
    resolve_identity,
)


NOW = dt.datetime(2026, 8, 25, 12, 0, tzinfo=dt.timezone.utc)
NOW_TEXT = "2026-08-25T12:00:00Z"
H = "sha256:" + "0" * 64


def _write_json(root: Path, relative: str, value: dict) -> Path:
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")
    return path


def _git_fixture(root: Path, decisions: tuple[tuple[str, dict], ...] = ()) -> None:
    subprocess.run(["git", "init", "-q"], cwd=root, check=True)
    subprocess.run(["git", "config", "user.email", "memory@example.invalid"], cwd=root, check=True)
    subprocess.run(["git", "config", "user.name", "Memory Tests"], cwd=root, check=True)
    for relative, value in decisions:
        _write_json(root, relative, value)
    (root / ".fixture").write_text("memory runtime fixture\n", encoding="utf-8")
    subprocess.run(["git", "add", "."], cwd=root, check=True)
    subprocess.run(
        ["git", "commit", "-qm", "fixture"], cwd=root, check=True,
        env={**os.environ, "GIT_AUTHOR_DATE": "2026-08-25T12:00:00Z", "GIT_COMMITTER_DATE": "2026-08-25T12:00:00Z"},
    )


def _decision(name: str = "Test Issuer, Inc.") -> dict:
    return {
        "schema_version": "1.0",
        "company_name": name,
        "ticker": "TEST",
        "exchange": "NYSE",
        "currency": "USD",
        "decision_date": "2026-08-25",
        "run_root": "analyses/TEST_2026-08-25",
        "decision": "Watchlist",
    }


def _owner(path: Path) -> None:
    value = {
        "schema": "memory-canonical-sink-owner/v1",
        "coordinator_id": H,
        "configuration_sha256": H,
        "sink_identity_sha256": H,
    }
    path.write_bytes(canonical_json_bytes(value))
    path.chmod(0o600)


def _head(path: Path) -> None:
    value = {
        "schema": "memory-controlled-sink-head/v1",
        "coordinator_id": H,
        "configuration_sha256": H,
        "sequence": 0,
        "head": H,
        "canonical_ledger_sha256": H,
        "transition": None,
    }
    path.write_bytes(canonical_json_bytes(value))
    path.chmod(0o600)


def _signer(secret: bytes):
    def sign(message: bytes) -> dict[str, str]:
        raw = hmac.new(secret, message, hashlib.sha256).digest() + hmac.new(
            secret, b"second-half\0" + message, hashlib.sha256
        ).digest()
        return {
            "key_id": "test-external-checkpoint",
            "algorithm": "ed25519",
            "value": base64.urlsafe_b64encode(raw).decode("ascii").rstrip("="),
        }
    return sign


def _verifier(secret: bytes):
    def verify(message: bytes, signature: dict[str, str]) -> bool:
        expected = _signer(secret)(message)
        return all(signature.get(key) == value for key, value in expected.items())
    return verify


def _provider_policy() -> dict:
    unsigned = {
        "schema": "memory-provider-policy/v1",
        "policy_id": "production-memory-policy",
        "version": 1,
        "providers": [{
            "provider": "openai",
            "model": "gpt-5",
            "service_identity": "research-runtime",
            "classifications": ["public", "internal"],
            "source_tiers": [1, 2, 3, 4, 5],
            "entitlement_set_sha256": H,
            "embedding_classifications": ["public"],
            "embedding_permitted": True,
        }],
        "default_action": "deny",
        "updated_at": NOW_TEXT,
    }
    digest = "sha256:" + canonical_sha256(unsigned)
    signature = _signer(b"provider-policy-secret")(canonical_json_bytes(unsigned))
    signature["signed_sha256"] = digest
    return {**unsigned, "policy_sha256": digest, "signature": signature}


def _resign_policy(policy: dict) -> dict:
    unsigned = {key: value for key, value in policy.items() if key not in {"policy_sha256", "signature"}}
    digest = "sha256:" + canonical_sha256(unsigned)
    signature = _signer(b"provider-policy-secret")(canonical_json_bytes(unsigned))
    signature["signed_sha256"] = digest
    return {**unsigned, "policy_sha256": digest, "signature": signature}


class MemoryRuntimeTests(unittest.TestCase):
    def test_protected_projection_reader_opens_owner_only_encrypted_store(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            key = root / "protected.key"
            key.write_bytes(b"k" * 32)
            key.chmod(0o600)
            store_root = root / "protected"
            MemoryStore(
                store_root,
                authorize=lambda _request: True,
                source_policy=lambda _request: True,
                cipher=AESGCMSIVEnvelopeCipher(b"k" * 32, key_id="key:projection-test"),
            )
            self.assertEqual([], load_protected_store_events(
                store_root, master_key_path=key, key_id="key:projection-test",
                service_identity="projection-reader",
            ))

    def test_controlled_operational_ledger_is_bound_to_writer_head(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            repo = root / "source"
            repo.mkdir()
            _git_fixture(repo, (("analyses/TEST_2026-08-25/decision_record.json", _decision()),))
            events, diagnostics = adapt_repository(repo)
            self.assertEqual([], diagnostics)
            ledger = root / "canonical.ndjson"
            ledger.write_bytes(b"".join(canonical_json_bytes(event) + b"\n" for event in events))
            ledger.chmod(0o600)
            head = root / "canonical.ndjson.controlled-writer-head.json"
            head.write_bytes(canonical_json_bytes({
                "schema": "memory-controlled-sink-head/v1", "coordinator_id": H,
                "configuration_sha256": H, "sequence": len(events), "head": H,
                "canonical_ledger_sha256": "sha256:" + canonical_sha256(events),
                "transition": {} if events else None,
            }))
            head.chmod(0o600)
            self.assertEqual(events, load_controlled_ledger_events(ledger, writer_head_path=head))
            ledger.write_bytes(ledger.read_bytes() + b"{}\n")
            with self.assertRaisesRegex(MemoryRuntimeError, "noncanonical|invalid"):
                load_controlled_ledger_events(ledger, writer_head_path=head)

    def test_owner_only_ed25519_checkpoint_signing_boundary(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            seed = root / "seed.key"
            public = root / "public.key"
            seed.write_bytes(bytes.fromhex(
                "9d61b19deffd5a60ba844af492ec2cc4"
                "4449c5697b326919703bac031cae7f60"
            ))
            public.write_bytes(bytes.fromhex(
                "d75a980182b10ab7d54bfed3c964073a"
                "0ee172f3daa62325af021a68f707511a"
            ))
            seed.chmod(0o600)
            public.chmod(0o600)
            message = canonical_json_bytes({"checkpoint": "test"})
            signature = ed25519_checkpoint_signer(seed, key_id="checkpoint-key")(message)
            self.assertTrue(ed25519_checkpoint_verifier(public, key_id="checkpoint-key")(message, signature))
            self.assertFalse(ed25519_checkpoint_verifier(public, key_id="checkpoint-key")(message + b"x", signature))

    def test_calibration_summary_is_losslessly_adapted(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            _git_fixture(root, (
                ("analyses/performance/2026-08-25_calibration_summary.json", {
                    "schema_version": "1.0", "generated_at": "2026-08-25", "scope": "all",
                    "n_decisions": 15, "n_reviews": 12, "n_resolved_forecasts": 5,
                }),
            ))
            events, diagnostics = adapt_repository(root)
            self.assertEqual([], diagnostics)
            self.assertEqual(Counter({"equity_calibration_summary": 1}), Counter(
                event["payload"]["record_type"] for event in events
            ))
            source = root / events[0]["payload"]["source_path"]
            self.assertEqual(json.loads(source.read_text()), events[0]["payload"]["record"])

    def test_identity_requires_legal_name_venue_currency_and_ticker(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            _git_fixture(root, (("analyses/TEST_2026-08-25/decision_record.json", _decision()),))
            registry = build_identity_registry(root, as_of_system_time=NOW_TEXT)
            resolved = resolve_identity(
                registry, legal_name="Test Issuer, Inc.", venue="NYSE", currency="USD", ticker="TEST"
            )
            self.assertEqual("exact", resolved["resolution_status"])
            self.assertEqual("security:mic-ticker:XNYS:TEST", resolved["listing_id"])
            with self.assertRaises(IdentityResolutionError):
                resolve_identity(
                    registry, legal_name="Different Issuer", venue="NYSE", currency="USD", ticker="TEST"
                )

    def test_identity_collision_and_prose_venue_are_excluded(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            first = _decision("First Issuer")
            second = {**_decision("Second Issuer"), "run_root": "analyses/TEST_2026-08-26", "decision_date": "2026-08-26"}
            prose = {**_decision("Dual Listed"), "ticker": "DUAL", "exchange": "NSE (also BSE)", "currency": "INR"}
            _git_fixture(root, (
                ("analyses/TEST_2026-08-25/decision_record.json", first),
                ("analyses/TEST_2026-08-26/decision_record.json", second),
                ("analyses/DUAL_2026-08-25/decision_record.json", prose),
            ))
            registry = build_identity_registry(root, as_of_system_time=NOW_TEXT)
            self.assertEqual([], registry["listings"])
            self.assertEqual(
                ["unresolved-venue", "listing-collision", "listing-collision"],
                sorted((item["code"] for item in registry["diagnostics"]), reverse=True),
            )

    def test_first_run_binds_an_explicit_legal_tuple_but_not_a_collision(self) -> None:
        empty_registry = {"schema": "research-identity-registry/v1", "listings": [], "diagnostics": []}
        resolved = resolve_identity(
            empty_registry, legal_name="First Run PLC", venue="LSE", currency="GBP", ticker="FIRST",
            identifiers=["issuer:lei:5493001KJTIIGC8Y1R12"],
        )
        self.assertEqual("issuer:lei:5493001KJTIIGC8Y1R12", resolved["issuer_id"])
        self.assertEqual("security:mic-ticker:XLON:FIRST", resolved["listing_id"])
        dual_registry = {
            **empty_registry,
            "listings": [{
                "legal_name": "First Run PLC", "legal_name_key": "first run plc",
                "issuer_id": "issuer:lei:5493001KJTIIGC8Y1R12",
                "listing_id": "security:mic-ticker:XLON:FIRST", "mic": "XLON",
                "ticker": "FIRST", "currency": "GBP",
                "identifiers": ["issuer:lei:5493001KJTIIGC8Y1R12"],
            }],
        }
        dual = resolve_identity(
            dual_registry, legal_name="First Run PLC", venue="NYSE", currency="USD", ticker="FRST",
            identifiers=["issuer:lei:5493001KJTIIGC8Y1R12"],
        )
        self.assertEqual(resolved["issuer_id"], dual["issuer_id"])
        self.assertEqual("security:mic-ticker:XNYS:FRST", dual["listing_id"])
        malformed = {
            **empty_registry,
            "listings": [{
                "legal_name": "Broken Issuer", "legal_name_key": "broken issuer",
                "issuer_id": "entity:internal:broken", "listing_id": "security:mic-ticker:XLON:BAD",
                "mic": "XLON", "ticker": "BAD", "currency": "GBP", "identifiers": None,
            }],
        }
        with self.assertRaises(IdentityResolutionError):
            resolve_identity(
                malformed, legal_name="Broken Issuer", venue="LSE", currency="GBP", ticker="BAD",
            )
        with self.assertRaises(IdentityResolutionError):
            resolve_identity(
                empty_registry, legal_name="First Run PLC", venue="LSE", currency="GBP", ticker="FIRST",
                identifiers=["not-a-reviewed-identifier"],
            )

    def test_provider_scope_can_narrow_but_never_expand(self) -> None:
        scope = authorize_provider(
            _provider_policy(), provider="openai", model="gpt-5", service_identity="research-runtime",
            requested_classifications=["public"], requested_source_tiers=[1, 2],
            verifier=_verifier(b"provider-policy-secret"),
        )
        self.assertEqual(["public"], scope["classifications"])
        self.assertEqual([1, 2], scope["source_tiers"])
        with self.assertRaisesRegex(ProviderAuthorizationError, "provider-scope-denied"):
            authorize_provider(
                _provider_policy(), provider="openai", model="gpt-5", service_identity="research-runtime",
                requested_classifications=["restricted"], requested_source_tiers=[1],
                verifier=_verifier(b"provider-policy-secret"),
            )
        with self.assertRaisesRegex(ProviderAuthorizationError, "provider-scope-denied"):
            authorize_provider(
                _provider_policy(), provider="anthropic", model="claude", service_identity="research-runtime",
                requested_classifications=["public"], requested_source_tiers=[1],
                verifier=_verifier(b"provider-policy-secret"),
            )
        bad_policy = _provider_policy()
        bad_policy["providers"][0]["classifications"].append("restricted")
        with self.assertRaisesRegex(ProviderAuthorizationError, "signature-invalid"):
            authorize_provider(
                bad_policy, provider="openai", model="gpt-5", service_identity="research-runtime",
                requested_classifications=["public"], requested_source_tiers=[1],
                verifier=_verifier(b"provider-policy-secret"),
            )

    def test_provider_scope_rejects_malformed_nested_shapes(self) -> None:
        malformed_provider = _provider_policy()
        malformed_provider["providers"] = ["not-an-object"]
        with self.assertRaises(ProviderAuthorizationError):
            authorize_provider(
                _resign_policy(malformed_provider), provider="openai", model="gpt-5",
                service_identity="research-runtime", requested_classifications=["public"],
                requested_source_tiers=[1], verifier=_verifier(b"provider-policy-secret"),
            )
        malformed_lists = _provider_policy()
        malformed_lists["providers"][0]["classifications"] = None
        with self.assertRaises(ProviderAuthorizationError):
            authorize_provider(
                _resign_policy(malformed_lists), provider="openai", model="gpt-5",
                service_identity="research-runtime", requested_classifications=["public"],
                requested_source_tiers=[1], verifier=_verifier(b"provider-policy-secret"),
            )

    def test_projection_uses_signed_checkpoint_then_one_rebuild_fallback(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            outer = Path(temporary)
            repo = outer / "repo"
            repo.mkdir()
            _git_fixture(repo, (("analyses/TEST_2026-08-25/decision_record.json", _decision()),))
            runtime = outer / "runtime"
            owner = outer / "owner.json"
            head = outer / "head.json"
            checkpoint = outer / "checkpoint.json"
            _owner(owner)
            _head(head)
            secret = b"checkpoint-test-secret"
            manager = ProjectionManager(
                repo, runtime, checkpoint_path=checkpoint, writer_owner_path=owner,
                writer_head_path=head,
                signer=_signer(secret), verifier=_verifier(secret), event_loader=adapt_repository,
            )
            first = manager.prepare(now=NOW)
            self.assertEqual("deterministic-local-rebuild", first.source)
            self.assertEqual(1, first.event_count)
            second = manager.prepare(now=NOW)
            self.assertEqual("production-projection", second.source)
            self.assertEqual(first.projection_digest, second.projection_digest)
            manager.database.write_bytes(b"not sqlite")
            third = manager.prepare(now=NOW)
            self.assertEqual("deterministic-local-rebuild", third.source)
            self.assertEqual(first.projection_digest, third.projection_digest)

    def test_projection_accepts_verified_empty_first_run_and_rejects_checkpoint_inside_state(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            outer = Path(temporary)
            repo = outer / "repo"
            repo.mkdir()
            _git_fixture(repo)
            owner = outer / "owner.json"
            head = outer / "head.json"
            _owner(owner)
            _head(head)
            secret = b"checkpoint-test-secret"
            manager = ProjectionManager(
                repo, outer / "runtime", checkpoint_path=outer / "checkpoint.json",
                writer_owner_path=owner, writer_head_path=head,
                signer=_signer(secret), verifier=_verifier(secret),
                event_loader=adapt_repository,
            )
            snapshot = manager.prepare(now=NOW)
            self.assertEqual(0, snapshot.event_count)
            with self.assertRaisesRegex(MemoryRuntimeError, "outside"):
                ProjectionManager(
                    repo, outer / "runtime-2", checkpoint_path=outer / "runtime-2/checkpoint.json",
                    writer_owner_path=owner, writer_head_path=head,
                    signer=_signer(secret), verifier=_verifier(secret),
                )

    def test_lifecycle_purge_is_transitive_and_retirement_blocks_restore(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "runtime"
            lifecycle = RuntimeLifecycle(root)
            event_id = "evt_" + str(uuid.uuid5(uuid.NAMESPACE_URL, "test-event"))
            paths = []
            for lane in ("projection", "packet-cache", "candidates", "resumes", "execution-receipts", "backups"):
                path = root / lane / f"{lane}.bin"
                path.parent.mkdir(mode=0o700)
                path.write_bytes(b"protected content")
                path.chmod(0o600)
                lifecycle.register(event_id, lane, path)
                paths.append(path)
            removed = lifecycle.purge_event(event_id)
            self.assertEqual(6, len(removed))
            self.assertTrue(lifecycle.event_absent(event_id))
            self.assertTrue(all(not path.exists() for path in paths))
            with self.assertRaisesRegex(MemoryRuntimeError, "cannot be registered"):
                lifecycle.register(event_id, "resumes", root / "resumes/restored.bin")

    def test_lifecycle_purge_removes_shared_derivative_from_other_events(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "runtime"
            lifecycle = RuntimeLifecycle(root)
            first = "evt_" + str(uuid.uuid5(uuid.NAMESPACE_URL, "first-event"))
            second = "evt_" + str(uuid.uuid5(uuid.NAMESPACE_URL, "second-event"))
            packet = root / "packet-cache" / "shared.json"
            packet.parent.mkdir(mode=0o700)
            packet.write_bytes(b"shared derivative")
            packet.chmod(0o600)
            lifecycle.register(first, "packet-cache", packet)
            lifecycle.register(second, "packet-cache", packet)

            self.assertEqual(("packet-cache/shared.json",), lifecycle.purge_event(first))
            registry = lifecycle._load()
            self.assertNotIn(second, registry["entries"])
            self.assertFalse(packet.exists())


if __name__ == "__main__":
    unittest.main()
