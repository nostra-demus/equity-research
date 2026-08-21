#!/usr/bin/env python3
"""Read-only and disclosure-safety tests for the local store doctor."""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from memory_crypto import AESGCMSIVEnvelopeCipher
from memory_store import AccessDenied, EncryptionRequired, MemoryStore, StoreCorruption
from memory_store_doctor import UnanchoredConsistency, doctor_report_bytes, doctor_store
from test_memory_store import UUIDS, allow, event, object_manifest, policy, tombstone


def snapshot(root: Path) -> dict[str, tuple[int, int, int, str]]:
    result: dict[str, tuple[int, int, int, str]] = {}
    for path in sorted(root.rglob("*")):
        status = path.lstat()
        digest = hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else ""
        result[path.relative_to(root).as_posix()] = (
            status.st_mode,
            status.st_size,
            status.st_mtime_ns,
            digest,
        )
    return result


def anchor(store: MemoryStore) -> str:
    return "sha256:" + store.rebuild_manifest()["manifest_sha256"]


class MemoryStoreDoctorTests(unittest.TestCase):
    def test_public_doctor_is_read_only_deterministic_and_secret_free(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = MemoryStore(
                root,
                authorize=allow,
                projection_purger=lambda _ref: (),
                projection_absent=lambda _ref: True,
            )
            raw = b"doctor must never emit this source marker"
            manifest = object_manifest(raw)
            object_ref = store.put_object(manifest, raw)
            event_value = event(policy())
            event_ref = store.put_event(event_value, objects=[object_ref])
            expected = anchor(store)
            before = snapshot(root)
            actions: list[str] = []

            def track_authorization(request: object) -> bool:
                actions.append(getattr(request, "action", ""))
                return True

            report = doctor_store(
                root,
                authorize=track_authorization,
                expected_manifest_sha256=expected,
            )
            after = snapshot(root)
            self.assertEqual(before, after)
            self.assertEqual(report["status"], "healthy")
            self.assertEqual(report["deterministic_rebuilds"], 2)
            self.assertEqual(report["inventory"]["objects"], 1)
            self.assertEqual(report["inventory"]["events"], 1)
            self.assertEqual(report["inventory"]["exact_entries_read"], 2)
            self.assertTrue({"audit", "resolve", "read", "export"}.issubset(actions))
            rendered = doctor_report_bytes(report)
            for forbidden in (
                raw,
                object_ref.object_id.encode(),
                object_ref.acquisition_id.encode(),
                event_ref.event_id.encode(),
                os.fspath(root).encode(),
                b'"payload"',
            ):
                self.assertNotIn(forbidden, rendered)

    def test_protected_doctor_requires_the_correct_cipher(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            master_key = os.urandom(32)
            store = MemoryStore(
                root,
                authorize=allow,
                cipher=AESGCMSIVEnvelopeCipher(master_key, key_id="key:doctor"),
            )
            raw = os.urandom(64)
            manifest = object_manifest(raw, storage_policy=policy("restricted"))
            store.put_object(manifest, raw)
            expected = anchor(store)
            with self.assertRaises(EncryptionRequired):
                doctor_store(
                    root,
                    authorize=allow,
                    expected_manifest_sha256=expected,
                )
            with self.assertRaises(StoreCorruption):
                doctor_store(
                    root,
                    authorize=allow,
                    cipher=AESGCMSIVEnvelopeCipher(os.urandom(32), key_id="key:doctor"),
                    expected_manifest_sha256=expected,
                )
            report = doctor_store(
                root,
                authorize=allow,
                cipher=AESGCMSIVEnvelopeCipher(master_key, key_id="key:doctor"),
                expected_manifest_sha256=expected,
            )
            self.assertEqual(report["status"], "healthy")

    def test_source_policy_unknown_or_denied_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = MemoryStore(root, authorize=allow, source_policy=allow)
            raw = b"synthetic entitlement bytes"
            manifest = object_manifest(
                raw,
                storage_policy=policy("internal", "source-policy"),
            )
            store.put_object(manifest, raw)
            expected = anchor(store)
            with self.assertRaises(AccessDenied):
                doctor_store(
                    root,
                    authorize=allow,
                    expected_manifest_sha256=expected,
                )
            with self.assertRaises(AccessDenied):
                doctor_store(
                    root,
                    authorize=allow,
                    source_policy=lambda _request: None,
                    expected_manifest_sha256=expected,
                )
            with self.assertRaises(AccessDenied):
                doctor_store(
                    root,
                    authorize=allow,
                    source_policy=lambda _request: False,
                    expected_manifest_sha256=expected,
                )
            self.assertEqual(
                doctor_store(
                    root,
                    authorize=allow,
                    source_policy=allow,
                    expected_manifest_sha256=expected,
                )["status"],
                "healthy",
            )

    def test_doctor_validates_completed_purge_and_reserved_control_lanes(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = MemoryStore(
                root,
                authorize=allow,
                projection_purger=lambda _ref: (),
                projection_absent=lambda _ref: True,
            )
            raw = b"synthetic purge source"
            manifest = object_manifest(raw)
            object_ref = store.put_object(manifest, raw)
            target_event = event(policy())
            event_ref = store.put_event(target_event, objects=[object_ref])
            store.purge_event(
                event_ref,
                tombstone(target_event, event_uuid=UUIDS[2], at="2026-08-20T03:00:00Z"),
            )
            expected = anchor(store)
            report = doctor_store(
                root,
                authorize=allow,
                expected_manifest_sha256=expected,
            )
            self.assertEqual(report["inventory"]["purges"], 1)
            self.assertEqual(report["inventory"]["completed_purges"], 1)
            self.assertEqual(report["inventory"]["retired_targets"], 2)

            fake = root / "receipts" / "fake.json"
            fake.write_text('{"schema":"memory-intake-receipt/v1"}', encoding="utf-8")
            os.chmod(fake, 0o600)
            with self.assertRaises(StoreCorruption):
                doctor_store(
                    root,
                    authorize=allow,
                    expected_manifest_sha256=expected,
                )

    def test_open_existing_refuses_missing_layout_without_creating_it(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "not-a-store"
            root.mkdir(mode=0o700)
            before = snapshot(root)
            with self.assertRaises(StoreCorruption):
                doctor_store(
                    root,
                    authorize=allow,
                    expected_manifest_sha256="sha256:" + "0" * 64,
                )
            self.assertEqual(snapshot(root), before)

    def test_doctor_requires_anchor_and_rejects_coherent_store_shrink(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = MemoryStore(root, authorize=allow)
            raw = b"coherent rollback anchor fixture"
            object_ref = store.put_object(object_manifest(raw), raw)
            event_ref = store.put_event(event(policy()), objects=[object_ref])
            expected = anchor(store)
            with self.assertRaises(UnanchoredConsistency):
                doctor_store(root, authorize=allow)

            for ref in (event_ref, object_ref):
                store._absolute(store._content_path(ref)).unlink()
                store._absolute(store._descriptor_path(ref)).unlink()
            with self.assertRaises(StoreCorruption):
                doctor_store(
                    root,
                    authorize=allow,
                    expected_manifest_sha256=expected,
                )

    def test_cli_refusal_is_canonical_json_without_paths_or_exception_text(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            master_key = os.urandom(32)
            store = MemoryStore(
                root,
                authorize=allow,
                cipher=AESGCMSIVEnvelopeCipher(master_key, key_id="key:doctor"),
            )
            raw = os.urandom(48)
            store.put_object(
                object_manifest(raw, storage_policy=policy("restricted")),
                raw,
            )
            expected = anchor(store)
            result = subprocess.run(
                [
                    sys.executable,
                    os.fspath(Path(__file__).with_name("memory_store_doctor.py")),
                    "--store",
                    os.fspath(root),
                    "--authorize-local-owner",
                    "--expected-manifest-sha256",
                    expected,
                ],
                check=False,
                capture_output=True,
            )
            self.assertEqual(result.returncode, 2)
            report = json.loads(result.stdout)
            self.assertEqual(report, {
                "schema": "memory-store-doctor-report/v1",
                "status": "refused",
                "error_code": "missing-cipher",
            })
            self.assertEqual(result.stderr, b"")
            self.assertNotIn(os.fspath(root).encode(), result.stdout)
            self.assertNotIn(raw, result.stdout)

            missing_authorization = subprocess.run(
                [
                    sys.executable,
                    os.fspath(Path(__file__).with_name("memory_store_doctor.py")),
                    "--store",
                    os.fspath(root),
                    "--expected-manifest-sha256",
                    expected,
                ],
                check=False,
                capture_output=True,
            )
            self.assertEqual(missing_authorization.returncode, 2)
            self.assertEqual(
                json.loads(missing_authorization.stdout),
                {
                    "schema": "memory-store-doctor-report/v1",
                    "status": "refused",
                    "error_code": "invalid-configuration",
                },
            )
            self.assertEqual(missing_authorization.stderr, b"")
            self.assertNotIn(os.fspath(root).encode(), missing_authorization.stdout)


if __name__ == "__main__":
    unittest.main()
