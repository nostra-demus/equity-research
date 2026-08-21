#!/usr/bin/env python3
"""Crash-boundary drills for exact MemoryStore orphan recovery."""
from __future__ import annotations

import hashlib
import os
import tempfile
import unittest
from pathlib import Path

from canonical_json import canonical_json_bytes
from memory_contract import object_manifest_sha256
from memory_crypto import EncryptedObject
from memory_store import EventRef, MemoryStore, ObjectRef, StoragePolicy, StoreCorruption
from test_memory_store import event, object_manifest, policy, store_snapshot


def allow(_request: object) -> bool:
    return True


class CrashCipher:
    """Process-independent reversible test cipher with per-call envelopes."""

    def encrypt(self, plaintext: bytes, *, associated_data: bytes) -> EncryptedObject:
        del associated_data
        return EncryptedObject(
            ciphertext=b"sealed:" + plaintext[::-1],
            key_envelope={"dek_id": "dek_" + os.urandom(16).hex()},
        )

    def decrypt(
        self,
        ciphertext: bytes,
        key_envelope: dict[str, str],
        *,
        associated_data: bytes,
    ) -> bytes:
        del key_envelope, associated_data
        if not ciphertext.startswith(b"sealed:"):
            raise ValueError("test ciphertext authentication failed")
        return ciphertext.removeprefix(b"sealed:")[::-1]


class MemoryStoreOrphanRecoveryTests(unittest.TestCase):
    def new_store(
        self,
        root: Path,
        *,
        cipher: CrashCipher | None = None,
    ) -> MemoryStore:
        return MemoryStore(
            root,
            authorize=allow,
            cipher=cipher,
            projection_purger=lambda _ref: (),
            projection_absent=lambda _ref: True,
        )

    @staticmethod
    def expected_ref(manifest: dict) -> ObjectRef:
        return ObjectRef(
            acquisition_id=manifest["acquisition_id"],
            source_version_id=manifest["source_version_id"],
            policy=StoragePolicy.from_dict(manifest["policy"]),
            manifest_sha256=object_manifest_sha256(manifest),
            sha256=manifest["content_sha256"].removeprefix("sha256:"),
            byte_length=manifest["byte_length"],
            encrypted=manifest["policy"]["classification"]
            in {"licensed", "confidential", "restricted"},
        )

    def crash_put_after_create(
        self,
        store: MemoryStore,
        manifest: dict,
        raw: bytes,
        target: Path,
    ) -> None:
        if not hasattr(os, "fork"):
            self.skipTest("process-crash drill requires os.fork")
        child = os.fork()
        if child == 0:  # pragma: no cover - assertions run in the parent
            original = store._atomic_create

            def crash_after_exact_create(relative: Path, data: bytes) -> bool:
                created = original(relative, data)
                if relative == target:
                    os._exit(91)
                return created

            store._atomic_create = crash_after_exact_create  # type: ignore[method-assign]
            try:
                store.put_object(manifest, raw)
            except BaseException:
                os._exit(92)
            os._exit(93)
        waited, status = os.waitpid(child, 0)
        self.assertEqual(waited, child)
        self.assertTrue(os.WIFEXITED(status))
        self.assertEqual(os.WEXITSTATUS(status), 91)

    def crash_operation_after_create(
        self,
        store: MemoryStore,
        operation,
        target: Path,
    ) -> None:
        if not hasattr(os, "fork"):
            self.skipTest("process-crash drill requires os.fork")
        child = os.fork()
        if child == 0:  # pragma: no cover - assertions run in the parent
            original = store._atomic_create

            def crash_after_exact_create(relative: Path, data: bytes) -> bool:
                created = original(relative, data)
                if relative == target:
                    os._exit(97)
                return created

            store._atomic_create = crash_after_exact_create  # type: ignore[method-assign]
            try:
                operation()
            except BaseException:
                os._exit(98)
            os._exit(99)
        waited, status = os.waitpid(child, 0)
        self.assertEqual(waited, child)
        self.assertTrue(os.WIFEXITED(status))
        self.assertEqual(os.WEXITSTATUS(status), 97)

    def crash_put_after_temp_fsync(
        self,
        store: MemoryStore,
        manifest: dict,
        raw: bytes,
        target: Path,
    ) -> None:
        if not hasattr(os, "fork"):
            self.skipTest("process-crash drill requires os.fork")
        child = os.fork()
        if child == 0:  # pragma: no cover - assertions run in the parent
            original = store._temporary_file_at

            def crash_after_exact_temp(
                parent_fd: int,
                destination: str,
                data: bytes,
            ) -> str:
                temporary_name = original(parent_fd, destination, data)
                if destination == target.name:
                    os._exit(94)
                return temporary_name

            store._temporary_file_at = crash_after_exact_temp  # type: ignore[method-assign]
            try:
                store.put_object(manifest, raw)
            except BaseException:
                os._exit(95)
            os._exit(96)
        waited, status = os.waitpid(child, 0)
        self.assertEqual(waited, child)
        self.assertTrue(os.WIFEXITED(status))
        self.assertEqual(os.WEXITSTATUS(status), 94)

    def test_unencrypted_content_before_descriptor_exact_retry_completes(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = self.new_store(root)
            raw = b"durable public orphan"
            manifest = object_manifest(raw, storage_policy=policy("public"))
            ref = self.expected_ref(manifest)

            self.crash_put_after_create(store, manifest, raw, store._content_path(ref))
            self.assertTrue(store._absolute(store._content_path(ref)).is_file())
            self.assertFalse(store._absolute(store._descriptor_path(ref)).exists())

            recovered = store.put_object(manifest, raw)
            self.assertEqual(recovered, ref)
            self.assertEqual(store.read_object(ref), raw)
            committed = store_snapshot(root)
            self.assertEqual(store.put_object(manifest, raw), ref)
            self.assertEqual(store_snapshot(root), committed)

    def test_encrypted_key_content_and_descriptor_crash_boundaries_recover(self) -> None:
        for boundary in ("key", "content", "descriptor"):
            with self.subTest(boundary=boundary), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary) / "store"
                store = self.new_store(root, cipher=CrashCipher())
                raw = ("protected-" + boundary).encode("ascii")
                manifest = object_manifest(raw, storage_policy=policy("restricted"))
                ref = self.expected_ref(manifest)
                targets = {
                    "key": store._key_path(ref),
                    "content": store._content_path(ref),
                    "descriptor": store._descriptor_path(ref),
                }

                self.crash_put_after_create(store, manifest, raw, targets[boundary])
                self.assertTrue(store._absolute(store._key_path(ref)).is_file())
                self.assertEqual(
                    store._absolute(store._content_path(ref)).exists(),
                    boundary in {"content", "descriptor"},
                )
                self.assertEqual(
                    store._absolute(store._descriptor_path(ref)).exists(),
                    boundary == "descriptor",
                )

                self.assertEqual(store.put_object(manifest, raw), ref)
                self.assertEqual(store.read_object(ref), raw)

    def test_fsynced_atomic_temps_recover_at_every_protected_boundary(self) -> None:
        for boundary in ("intent", "key", "content", "descriptor"):
            with self.subTest(boundary=boundary), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary) / "store"
                store = self.new_store(root, cipher=CrashCipher())
                raw = ("temp-boundary-" + boundary).encode("ascii")
                manifest = object_manifest(raw, storage_policy=policy("restricted"))
                ref = self.expected_ref(manifest)
                targets = {
                    "intent": store._write_intent_path(ref),
                    "key": store._key_path(ref),
                    "content": store._content_path(ref),
                    "descriptor": store._descriptor_path(ref),
                }

                self.crash_put_after_temp_fsync(
                    store,
                    manifest,
                    raw,
                    targets[boundary],
                )
                self.assertTrue(list(root.rglob(".tmp-v2-*")))

                self.assertEqual(store.put_object(manifest, raw), ref)
                self.assertEqual(store.read_object(ref), raw)
                self.assertFalse(list(root.rglob(".tmp-v2-*")))
                self.assertEqual(len(store.rebuild_manifest()["objects"]), 1)

    def test_exact_present_event_retry_cleans_post_descriptor_intent(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = self.new_store(root, cipher=CrashCipher())
            storage_policy = policy("restricted")
            raw = b"event recovery binding"
            manifest = object_manifest(raw, storage_policy=storage_policy)
            object_ref = store.put_object(manifest, raw)
            candidate = event(storage_policy)
            record_bytes = canonical_json_bytes(
                store._event_record(
                    candidate,
                    object_ref.acquisition_id,
                    object_ref.source_version_id,
                    (object_ref,),
                )
            )
            event_ref = EventRef(
                acquisition_id=object_ref.acquisition_id,
                source_version_id=object_ref.source_version_id,
                policy=object_ref.policy,
                event_id=candidate["event_id"],
                record_sha256=hashlib.sha256(record_bytes).hexdigest(),
                record_byte_length=len(record_bytes),
                objects=(object_ref,),
                encrypted=True,
            )

            self.crash_operation_after_create(
                store,
                lambda: store.put_event(candidate, objects=[object_ref]),
                store._descriptor_path(event_ref),
            )
            self.assertTrue(store._absolute(store._descriptor_path(event_ref)).exists())
            self.assertTrue(store._absolute(store._write_intent_path(event_ref)).exists())

            self.assertEqual(store.put_event(candidate, objects=[object_ref]), event_ref)
            self.assertFalse(store._absolute(store._write_intent_path(event_ref)).exists())
            self.assertEqual(store.read_event(event_ref), candidate)
            self.assertEqual(len(store.rebuild_manifest()["events"]), 1)

    def test_tampered_exact_target_temp_refuses_recovery_without_mutation(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = self.new_store(root)
            raw = b"temp digest commitment"
            manifest = object_manifest(raw, storage_policy=policy("public"))
            ref = self.expected_ref(manifest)
            self.crash_put_after_temp_fsync(
                store,
                manifest,
                raw,
                store._content_path(ref),
            )
            temporary_rows = list(root.rglob(".tmp-v2-*"))
            self.assertEqual(len(temporary_rows), 1)
            temporary_rows[0].write_bytes(b"tampered temp bytes")
            before = store_snapshot(root)

            with self.assertRaisesRegex(StoreCorruption, "atomic temp digest mismatch"):
                store.put_object(manifest, raw)

            self.assertEqual(store_snapshot(root), before)

    def test_temp_recognition_is_name_only_and_replace_cleans_partial_bytes(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = self.new_store(root)
            target = store._relative_path("mutable", "state.json")
            store._atomic_replace(target, b"old")

            missing_temp = target.parent / (
                store._temporary_prefix(target.name)
                + "1" * 64
                + "-"
                + "2" * 32
            )
            self.assertTrue(store._is_valid_atomic_temp(missing_temp))

            partial = store._absolute(missing_temp)
            partial.write_bytes(b"partial")
            partial.chmod(0o600)
            store._atomic_replace(target, b"new")

            self.assertEqual(store._read_regular(target), b"new")
            self.assertFalse(partial.exists())

    def test_replace_cleanup_rejects_hardlinked_temp_without_mutation(self) -> None:
        if not hasattr(os, "link"):
            self.skipTest("hard-link safety drill requires os.link")
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = self.new_store(root)
            target = store._relative_path("mutable", "state.json")
            store._atomic_replace(target, b"committed")
            with store._parent_fd(target, create=False) as (parent_fd, destination):
                temp_name = store._temporary_file_at(parent_fd, destination, b"next")
            temp_path = store._absolute(target.parent / temp_name)
            hardlink = temp_path.with_name("external-hardlink")
            os.link(temp_path, hardlink)

            with self.assertRaisesRegex(StoreCorruption, "external hard links"):
                store._atomic_replace(target, b"replacement")

            self.assertEqual(store._read_regular(target), b"committed")
            self.assertTrue(temp_path.exists())
            self.assertTrue(hardlink.exists())

    def test_tampered_unencrypted_and_authenticated_orphans_refuse_repair(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "public"
            store = self.new_store(root)
            raw = b"exact public bytes"
            manifest = object_manifest(raw, storage_policy=policy("public"))
            ref = self.expected_ref(manifest)
            self.crash_put_after_create(store, manifest, raw, store._content_path(ref))
            content = store._absolute(store._content_path(ref))
            content.write_bytes(b"tampered public orphan")
            before = store_snapshot(root)

            with self.assertRaises(StoreCorruption):
                store.put_object(manifest, raw)

            self.assertEqual(store_snapshot(root), before)
            self.assertFalse(store._absolute(store._descriptor_path(ref)).exists())

        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "protected"
            store = self.new_store(root, cipher=CrashCipher())
            raw = b"exact protected bytes"
            manifest = object_manifest(raw, storage_policy=policy("restricted"))
            ref = self.expected_ref(manifest)
            self.crash_put_after_create(store, manifest, raw, store._content_path(ref))
            content = store._absolute(store._content_path(ref))
            content.write_bytes(b"tampered protected orphan")
            before = store_snapshot(root)

            with self.assertRaises(StoreCorruption):
                store.put_object(manifest, raw)

            self.assertEqual(store_snapshot(root), before)
            self.assertFalse(store._absolute(store._descriptor_path(ref)).exists())

    def test_ambiguous_ciphertext_without_key_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = self.new_store(root, cipher=CrashCipher())
            raw = b"protected half orphan"
            manifest = object_manifest(raw, storage_policy=policy("restricted"))
            ref = self.expected_ref(manifest)
            ciphertext, _envelope = store._encrypt("object", ref, raw)
            store._atomic_create(store._content_path(ref), ciphertext)
            before = store_snapshot(root)

            with self.assertRaisesRegex(StoreCorruption, "no authenticating key envelope"):
                store.put_object(manifest, raw)

            self.assertEqual(store_snapshot(root), before)
            self.assertFalse(store._absolute(store._descriptor_path(ref)).exists())

        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "paired-without-intent"
            store = self.new_store(root, cipher=CrashCipher())
            raw = b"unattributed protected pair"
            manifest = object_manifest(raw, storage_policy=policy("restricted"))
            ref = self.expected_ref(manifest)
            ciphertext, envelope = store._encrypt("object", ref, raw)
            store._atomic_create(store._key_path(ref), envelope)
            store._atomic_create(store._content_path(ref), ciphertext)
            before = store_snapshot(root)

            with self.assertRaisesRegex(StoreCorruption, "no exact write intent"):
                store.put_object(manifest, raw)

            self.assertEqual(store_snapshot(root), before)
            self.assertFalse(store._absolute(store._descriptor_path(ref)).exists())


if __name__ == "__main__":
    unittest.main()
