#!/usr/bin/env python3
"""Focused read-only and parity tests for MemoryStore event preflight."""
from __future__ import annotations

import copy
import tempfile
import unittest
from pathlib import Path

from memory_contract import seal_event
from memory_crypto import EncryptedObject
from memory_store import (
    AccessDenied,
    EVENT_PREFLIGHT_SCHEMA,
    InvalidStoreInput,
    MemoryStore,
    ObjectRef,
    StoreConflict,
    StoreCorruption,
    StoreNotFound,
)
from test_memory_store import (
    UUIDS,
    event,
    object_manifest,
    phase2_event,
    phase2_extraction_payload,
    phase2_source_payload,
    policy,
    store_snapshot,
)


def allow(_request: object) -> bool:
    return True


class RecordingCipher:
    """Tiny test double proving authorization happens before protected decryption."""

    def __init__(self) -> None:
        self.sequence = 0
        self.decrypt_calls = 0

    def encrypt(self, plaintext: bytes, *, associated_data: bytes) -> EncryptedObject:
        del associated_data
        self.sequence += 1
        return EncryptedObject(
            ciphertext=b"sealed:" + plaintext[::-1],
            key_envelope={"dek_id": f"dek_{self.sequence:032x}"},
        )

    def decrypt(
        self,
        ciphertext: bytes,
        key_envelope: dict[str, str],
        *,
        associated_data: bytes,
    ) -> bytes:
        del key_envelope, associated_data
        self.decrypt_calls += 1
        if not ciphertext.startswith(b"sealed:"):
            raise ValueError("invalid test ciphertext")
        return ciphertext.removeprefix(b"sealed:")[::-1]


class MemoryStorePreflightTests(unittest.TestCase):
    def new_store(self, root: Path, *, authorize=allow) -> MemoryStore:
        return MemoryStore(
            root,
            authorize=authorize,
            projection_purger=lambda _ref: (),
            projection_absent=lambda _ref: True,
        )

    def put_source_object(
        self,
        store: MemoryStore,
        raw: bytes = b"preflight source bytes",
        *,
        storage_policy: dict | None = None,
    ) -> tuple[dict, ObjectRef]:
        manifest = object_manifest(raw, storage_policy=storage_policy or policy())
        return manifest, store.put_object(manifest, raw)

    def test_success_descriptor_is_closed_content_free_and_preflight_mutates_nothing(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = self.new_store(root)
            _manifest, object_ref = self.put_source_object(store)
            candidate = event(policy())
            before = store_snapshot(root)

            result = store.preflight_event(candidate, objects=[object_ref])

            self.assertEqual(store_snapshot(root), before)
            self.assertEqual(
                set(result),
                {
                    "schema",
                    "status",
                    "disposition",
                    "event_id",
                    "record_sha256",
                    "record_byte_length",
                    "object_count",
                },
            )
            self.assertEqual(result["schema"], EVENT_PREFLIGHT_SCHEMA)
            self.assertEqual(result["status"], "ready")
            self.assertEqual(result["disposition"], "new")
            self.assertEqual(result["event_id"], candidate["event_id"])
            self.assertEqual(result["object_count"], 1)
            self.assertNotIn("payload", result)
            self.assertNotIn("objects", result)

    def test_authorization_denial_precedes_exact_object_read_and_mutates_nothing(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            denied_actions: set[str] = set()
            requests: list[tuple[str, str]] = []
            cipher = RecordingCipher()

            def authorize(request: object) -> bool:
                requests.append((request.action, request.digest))
                return request.action not in denied_actions

            store = MemoryStore(
                root,
                authorize=authorize,
                cipher=cipher,
                projection_purger=lambda _ref: (),
                projection_absent=lambda _ref: True,
            )
            _manifest, object_ref = self.put_source_object(
                store,
                storage_policy=policy("restricted"),
            )
            before = store_snapshot(root)
            denied_actions.add("bind")
            decrypts_before = cipher.decrypt_calls

            with self.assertRaises(AccessDenied):
                store.preflight_event(event(policy("restricted")), objects=[object_ref])

            self.assertEqual(store_snapshot(root), before)
            self.assertEqual(cipher.decrypt_calls, decrypts_before)
            self.assertEqual(requests[-1], ("bind", object_ref.sha256))

    def test_missing_and_tampered_exact_object_fail_without_mutation(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "missing"
            store = self.new_store(root)
            _manifest, object_ref = self.put_source_object(store)
            missing_value = object_ref.to_dict()
            missing_value["sha256"] = "f" * 64
            missing = ObjectRef.from_dict(missing_value)
            before = store_snapshot(root)
            with self.assertRaises(StoreNotFound):
                store.preflight_event(event(policy()), objects=[missing])
            self.assertEqual(store_snapshot(root), before)

        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "tampered"
            store = self.new_store(root)
            _manifest, object_ref = self.put_source_object(store)
            content = store._absolute(store._content_path(object_ref))
            content.write_bytes(b"tampered exact bytes")
            before = store_snapshot(root)
            with self.assertRaises(StoreCorruption):
                store.preflight_event(event(policy()), objects=[object_ref])
            self.assertEqual(store_snapshot(root), before)

    def test_dependency_authorization_precedes_protected_event_decryption(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            denied: set[tuple[str, str]] = set()
            cipher = RecordingCipher()

            def authorize(request: object) -> bool:
                return (request.action, request.digest) not in denied

            store = MemoryStore(
                root,
                authorize=authorize,
                cipher=cipher,
                projection_purger=lambda _ref: (),
                projection_absent=lambda _ref: True,
            )
            storage_policy = policy("restricted")
            source_bytes = b"protected source dependency"
            source_manifest = object_manifest(
                source_bytes,
                storage_policy=storage_policy,
            )
            source_manifest["media_type"] = "application/pdf"
            source_ref = store.put_object(source_manifest, source_bytes)
            source_payload = phase2_source_payload(source_manifest)
            source_event = phase2_event(
                source_payload,
                "source.recorded",
                event_uuid=UUIDS[0],
                system_time="2026-08-20T01:00:00Z",
                storage_policy=storage_policy,
            )
            source_event_ref = store.put_event(source_event, objects=[source_ref])

            output_bytes = b'{"coordinates":[1,2,3]}'
            output_manifest = object_manifest(
                output_bytes,
                storage_policy=storage_policy,
                upstream=(source_ref, source_manifest),
            )
            output_manifest["media_type"] = "application/json"
            output_manifest["provenance"]["tool"]["version"] = "1.0.0"
            output_ref = store.put_object(output_manifest, output_bytes)
            extraction = phase2_event(
                phase2_extraction_payload(source_payload, output_manifest),
                "extraction.recorded",
                event_uuid=UUIDS[1],
                system_time="2026-08-20T02:00:00Z",
                storage_policy=storage_policy,
            )

            source_record_path = store._absolute(store._content_path(source_event_ref))
            source_record_path.write_bytes(b"tampered protected dependency")
            denied.add(("bind", source_event_ref.record_sha256))
            before = store_snapshot(root)
            decrypts_before = cipher.decrypt_calls

            with self.assertRaises(AccessDenied):
                store.preflight_event(
                    extraction,
                    objects=[source_ref, output_ref],
                )

            self.assertEqual(store_snapshot(root), before)
            # The two explicitly authorized object bindings were verified; the denied
            # dependency event was never handed to the cipher.
            self.assertEqual(cipher.decrypt_calls, decrypts_before + 2)

    def test_typed_binding_invalid_is_rejected_without_mutation(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = self.new_store(root)
            manifest, object_ref = self.put_source_object(
                store,
                storage_policy=policy("public"),
            )
            payload = phase2_source_payload(manifest)
            payload["acquisition_id"] = f"acquisition_{UUIDS[1]}"
            candidate = phase2_event(
                payload,
                "source.recorded",
                event_uuid=UUIDS[0],
                system_time="2026-08-20T01:00:00Z",
                storage_policy=manifest["policy"],
            )
            before = store_snapshot(root)

            with self.assertRaisesRegex(
                InvalidStoreInput,
                "payload acquisition_id must equal the event acquisition identity",
            ):
                store.preflight_event(candidate, objects=[object_ref])

            self.assertEqual(store_snapshot(root), before)

    def test_event_id_conflict_is_rejected_without_mutation(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = self.new_store(root)
            _manifest, object_ref = self.put_source_object(store)
            original = event(policy())
            store.put_event(original, objects=[object_ref])
            conflicting = copy.deepcopy(original)
            conflicting["payload"]["record"]["decision"] = "Reject"
            conflicting = seal_event(conflicting)
            before = store_snapshot(root)

            with self.assertRaisesRegex(StoreConflict, "event_id .* already names"):
                store.preflight_event(conflicting, objects=[object_ref])

            self.assertEqual(store_snapshot(root), before)

    def test_preflight_put_parity_and_put_revalidates_after_preflight(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "parity"
            store = self.new_store(root)
            _manifest, object_ref = self.put_source_object(store)
            candidate = event(policy())

            fresh = store.preflight_event(candidate, objects=[object_ref])
            committed = store.put_event(candidate, objects=[object_ref])
            present_before = store_snapshot(root)
            present = store.preflight_event(candidate, objects=[object_ref])

            self.assertEqual(present_before, store_snapshot(root))
            self.assertEqual(fresh["record_sha256"], committed.record_sha256)
            self.assertEqual(fresh["record_byte_length"], committed.record_byte_length)
            self.assertEqual(fresh["event_id"], committed.event_id)
            self.assertEqual(fresh["disposition"], "new")
            self.assertEqual(present["disposition"], "present")
            self.assertEqual(
                {key: value for key, value in fresh.items() if key != "disposition"},
                {key: value for key, value in present.items() if key != "disposition"},
            )

        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "race"
            store = self.new_store(root)
            _manifest, object_ref = self.put_source_object(store)
            candidate = event(policy())
            store.preflight_event(candidate, objects=[object_ref])
            content = store._absolute(store._content_path(object_ref))
            content.write_bytes(b"changed after successful preflight")
            before = store_snapshot(root)

            with self.assertRaises(StoreCorruption):
                store.put_event(candidate, objects=[object_ref])

            self.assertEqual(store_snapshot(root), before)


if __name__ == "__main__":
    unittest.main()
