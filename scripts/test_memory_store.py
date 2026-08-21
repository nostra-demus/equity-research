#!/usr/bin/env python3
"""Focused security and recovery drills for the local Phase 2 memory store."""
from __future__ import annotations

import copy
import datetime as dt
import hashlib
import json
import os
import stat
import tempfile
import threading
import unittest
from pathlib import Path
from unittest import mock

from canonical_json import canonical_json_bytes
from memory_contract import (
    object_manifest_sha256,
    seal_event,
    validate_event,
    validate_object_manifest,
)
from memory_crypto import AESGCMSIVEnvelopeCipher
from memory_store import (
    AccessDenied,
    EncryptionRequired,
    ExpiredContent,
    InvalidStoreInput,
    MemoryStore,
    ObjectRef,
    PurgeIncomplete,
    StoreConflict,
    StoreCorruption,
)


UUIDS = [
    "11111111-1111-5111-8111-111111111111",
    "22222222-2222-5222-8222-222222222222",
    "33333333-3333-5333-8333-333333333333",
    "44444444-4444-5444-8444-444444444444",
    "55555555-5555-5555-8555-555555555555",
    "66666666-6666-5666-8666-666666666666",
    "77777777-7777-5777-8777-777777777777",
    "88888888-8888-5888-8888-888888888888",
]
ISSUER = "issuer:lei:5493001KJTIIGC8Y1R12"
PHASE2_DOCUMENT_UUID = "01890f47-6a2b-7cc1-8e91-1234567890ab"


def policy(
    classification: str = "internal",
    retention: str = "permanent",
    retain_until: str | None = None,
) -> dict:
    return {
        "classification": classification,
        "retention": retention,
        "retain_until": retain_until,
    }


def object_manifest(
    data: bytes,
    *,
    acquisition_uuid: str = UUIDS[0],
    version_uuid: str = UUIDS[0],
    storage_policy: dict | None = None,
    upstream: tuple[ObjectRef, dict] | None = None,
) -> dict:
    digest = hashlib.sha256(data).hexdigest()
    if upstream is None:
        object_kind = "source"
        source_id = f"source:sha256:{digest}"
        source_object = None
        derived: list[dict] = []
        tool = extraction = None
    else:
        upstream_ref, _ = upstream
        object_kind = "extraction"
        source_id = f"source:sha256:{upstream_ref.sha256}"
        source_object = {
            "object_id": upstream_ref.object_id,
            "acquisition_id": upstream_ref.acquisition_id,
            "source_version_id": upstream_ref.source_version_id,
            "manifest_sha256": "sha256:" + upstream_ref.manifest_sha256,
        }
        derived = [copy.deepcopy(source_object)]
        tool = {
            "tool_id": "tool:test-extractor",
            "version": "1.0",
            "sha256": "sha256:" + "a" * 64,
        }
        extraction = {
            "extraction_id": f"extraction_{UUIDS[4]}",
            "method": "native-text",
            "sha256": f"sha256:{digest}",
        }
    return {
        "schema": "memory-object-manifest/v1",
        "object_id": f"object:sha256:{digest}",
        "acquisition_id": f"acquisition_{acquisition_uuid}",
        "source_version_id": f"source-version_{version_uuid}",
        "object_kind": object_kind,
        "content_sha256": f"sha256:{digest}",
        "byte_length": len(data),
        "media_type": "application/octet-stream",
        "locator": {
            "kind": "object-uri",
            "value": f"r2://memory-test/{digest}",
            "version_id": f"sha256:{digest}",
        },
        "source_lineage": {
            "source_id": source_id,
            "source_object": source_object,
            "derived_from_objects": derived,
        },
        "provenance": {
            "producer": {
                "producer_id": "producer:memory-store-test",
                "kind": "system",
                "name": "memory-store-test",
            },
            "run_id": f"run_{UUIDS[5]}",
            "tool": tool,
            "extraction": extraction,
            "prompt_program": None,
            "context_packet": None,
        },
        "created_at": "2026-08-20T00:00:00Z",
        "policy": copy.deepcopy(storage_policy or policy()),
    }


def event(
    storage_policy: dict,
    *,
    event_uuid: str = UUIDS[0],
    system_time: str = "2026-08-20T01:00:00Z",
    derived_from: list[str] | None = None,
) -> dict:
    row = {
        "schema": "memory-event/v1",
        "event_id": f"evt_{event_uuid}",
        "event_type": "decision.recorded",
        "subject_ids": [ISSUER],
        "valid_time": {"from": "2026-08-20", "to": None},
        "system_time": system_time,
        "producer": {
            "kind": "adapter",
            "name": "memory-store-test",
            "runtime": "python",
            "model": None,
            "prompt_program_sha": None,
        },
        "run_id": f"run_{UUIDS[5]}",
        "trace_id": "1" * 32,
        "payload": {
            "legacy_schema": "decision-record/v1",
            "record": {"decision": "Watchlist"},
        },
        "evidence_refs": [],
        "derived_from": list(derived_from or []),
        "supersedes": [],
        "integrity": {"payload_sha256": "0" * 64, "signature": None},
        "policy": copy.deepcopy(storage_policy),
    }
    return seal_event(row)


def phase2_source_payload(
    source_manifest: dict,
    *,
    derivative_use: str = "allowed",
) -> dict:
    return {
        "schema": "memory-source/v2",
        "document_id": f"document_{PHASE2_DOCUMENT_UUID}",
        "source_version_id": source_manifest["source_version_id"],
        "acquisition_id": source_manifest["acquisition_id"],
        "source_object_id": source_manifest["object_id"],
        "content_sha256": source_manifest["content_sha256"],
        "acquired_at": source_manifest["created_at"],
        "title": "Synthetic store provenance fixture",
        "issuer_ids": [ISSUER],
        "source_tier": 1,
        "source_dates": {
            "publication_date": "2026-08-20",
            "filing_date": "2026-08-20",
            "effective_date": "2026-06-30",
        },
        "language": "en-IN",
        "licence": {
            "classification": source_manifest["policy"]["classification"],
            "entitlement": "not-required",
            "terms_sha256": "sha256:" + "b" * 64,
            "expires_at": None,
        },
        "rights": {
            "derivative_use": derivative_use,
            "embedding": "allowed",
            "redistribution": "allowed",
        },
        "mime_type": source_manifest["media_type"],
        "byte_length": source_manifest["byte_length"],
        "extraction_status": "succeeded",
    }


def phase2_extraction_payload(source: dict, output_manifest: dict) -> dict:
    provenance = output_manifest["provenance"]
    tool = provenance["tool"]
    extraction = provenance["extraction"]
    return {
        "schema": "memory-extraction-artifact/v1",
        "extraction_id": extraction["extraction_id"],
        "document_id": source["document_id"],
        "source_version_id": source["source_version_id"],
        "acquisition_id": source["acquisition_id"],
        "source_object": {
            "object_id": source["source_object_id"],
            "content_sha256": source["content_sha256"],
        },
        "output_object": {
            "object_id": output_manifest["object_id"],
            "content_sha256": output_manifest["content_sha256"],
            "byte_length": output_manifest["byte_length"],
            "media_type": output_manifest["media_type"],
        },
        "tool": {
            "tool_id": tool["tool_id"],
            "version": tool["version"],
            "artifact_sha256": tool["sha256"],
        },
        "code": {
            "git_sha": "git:" + "1" * 40,
            "content_sha256": "sha256:" + "2" * 64,
        },
        "parameters_sha256": "sha256:" + "3" * 64,
        "method": extraction["method"],
        "coordinate_system": {
            "name": "pdf-page-character",
            "version": "1",
            "specification_sha256": "sha256:" + "d" * 64,
        },
        "run_id": provenance["run_id"],
        "created_at": output_manifest["created_at"],
    }


def phase2_evidence_payload(source: dict, extraction: dict) -> dict:
    output = extraction["output_object"]
    return {
        "schema": "memory-evidence-span/v2",
        "evidence_id": f"evidence_{PHASE2_DOCUMENT_UUID}",
        "document_id": source["document_id"],
        "source_version_id": source["source_version_id"],
        "acquisition_id": source["acquisition_id"],
        "source_object_id": source["source_object_id"],
        "source_content_sha256": source["content_sha256"],
        "locator": {
            "extraction_id": extraction["extraction_id"],
            "coordinate_artifact_object_id": output["object_id"],
            "coordinate_artifact_content_sha256": output["content_sha256"],
            "coordinate_system_sha256": extraction["coordinate_system"][
                "specification_sha256"
            ],
            "kind": "page",
            "ref": "page-1",
            "page": 1,
            "section": "Synthetic section",
            "table": None,
            "cell": None,
            "char_start": 0,
            "char_end": 10,
            "record_index": None,
            "timestamp_start_millis": None,
            "timestamp_end_millis": None,
            "image_region": None,
        },
        "language": "en",
        "content": {"text": "Synthetic evidence."},
        "extraction_confidence": 1.0,
    }


def phase2_event(
    payload: dict,
    event_type: str,
    *,
    event_uuid: str,
    system_time: str,
    storage_policy: dict | None = None,
) -> dict:
    row = event(
        storage_policy or policy("public"),
        event_uuid=event_uuid,
        system_time=system_time,
    )
    row["event_type"] = event_type
    row["payload"] = copy.deepcopy(payload)
    row["producer"] = {
        "kind": "system",
        "name": "memory-store-test",
        "runtime": "python",
        "model": None,
        "prompt_program_sha": None,
    }
    row["run_id"] = f"run_{UUIDS[5]}"
    row["evidence_refs"] = []
    return seal_event(row)


def tombstone(target_event: dict, *, event_uuid: str, at: str) -> dict:
    row = {
        "schema": "memory-event/v1",
        "event_id": f"evt_{event_uuid}",
        "event_type": target_event["event_type"],
        "subject_ids": copy.deepcopy(target_event["subject_ids"]),
        "valid_time": copy.deepcopy(target_event["valid_time"]),
        "system_time": at,
        "producer": {
            "kind": "system",
            "name": "memory-purge-test",
            "runtime": "python",
            "model": None,
            "prompt_program_sha": None,
        },
        "run_id": f"run_{UUIDS[6]}",
        "trace_id": "2" * 32,
        "payload": {
            "schema": "memory-tombstone/v1",
            "target_event_id": target_event["event_id"],
            "reason_code": "legal-erasure",
            "basis": "legal-obligation",
            "basis_id": None,
        },
        "evidence_refs": [],
        "derived_from": [],
        "supersedes": [target_event["event_id"]],
        "integrity": {"payload_sha256": "0" * 64, "signature": None},
        "policy": policy("internal", "tombstone-only"),
    }
    return seal_event(row)


def allow(_request: object) -> bool:
    return True


def all_private(root: Path) -> bool:
    if os.name != "posix":
        return True
    for current, directories, files in os.walk(root):
        if stat.S_IMODE(Path(current).lstat().st_mode) != 0o700:
            return False
        for name in directories:
            if stat.S_IMODE((Path(current) / name).lstat().st_mode) != 0o700:
                return False
        for name in files:
            if stat.S_IMODE((Path(current) / name).lstat().st_mode) != 0o600:
                return False
    return True


def store_snapshot(root: Path) -> dict[str, tuple[int, int, str]]:
    result: dict[str, tuple[int, int, str]] = {}
    for path in sorted(root.rglob("*")):
        status = path.lstat()
        digest = hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else ""
        result[path.relative_to(root).as_posix()] = (
            status.st_mode,
            status.st_size,
            digest,
        )
    return result


class MemoryStoreTests(unittest.TestCase):
    def new_store(self, root: Path, **kwargs: object) -> MemoryStore:
        kwargs.setdefault("projection_purger", lambda _ref: ())
        kwargs.setdefault("projection_absent", lambda _ref: True)
        return MemoryStore(root, authorize=allow, **kwargs)

    def test_exact_bytes_idempotence_manifest_binding_and_private_modes(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = self.new_store(root)
            raw = b"\x00exact source\r\nbytes\xff"
            manifest = object_manifest(raw)
            first = store.put_object(manifest, raw)
            self.assertEqual(store.put_object(copy.deepcopy(manifest), raw), first)
            self.assertEqual(store.read_object(first), raw)
            self.assertEqual(json.loads(store.export_manifest())["objects"][0]["object_manifest"], manifest)
            changed = copy.deepcopy(manifest)
            changed["locator"]["version_id"] = "revision-2"
            with self.assertRaises(StoreConflict):
                store.put_object(changed, raw)
            self.assertTrue(all_private(root))

    def test_acquisition_allows_derived_artifact_but_rejects_policy_laundering(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            store = self.new_store(Path(temporary) / "store")
            source_bytes = b"source"
            source_manifest = object_manifest(source_bytes)
            source_ref = store.put_object(source_manifest, source_bytes)
            source_event = phase2_event(
                phase2_source_payload(source_manifest),
                "source.recorded",
                event_uuid=UUIDS[7],
                system_time="2026-08-20T01:00:00Z",
                storage_policy=source_manifest["policy"],
            )
            store.put_event(source_event, objects=[source_ref])
            extraction_bytes = b"derived coordinates"
            extraction_manifest = object_manifest(
                extraction_bytes,
                upstream=(source_ref, source_manifest),
            )
            extraction_ref = store.put_object(extraction_manifest, extraction_bytes)
            self.assertEqual(store.read_object(extraction_ref), extraction_bytes)
            downgraded = object_manifest(
                b"other bytes",
                storage_policy=policy("public"),
            )
            with self.assertRaises(StoreConflict):
                store.put_object(downgraded, b"other bytes")

    def test_phase2_source_extraction_evidence_order_and_full_bindings(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            store = self.new_store(Path(temporary) / "store")
            source_bytes = b"synthetic pdf source bytes"
            source_manifest = object_manifest(
                source_bytes,
                storage_policy=policy("public"),
            )
            source_manifest["media_type"] = "application/pdf"
            source_ref = store.put_object(source_manifest, source_bytes)
            source_payload = phase2_source_payload(source_manifest)
            source_event = phase2_event(
                source_payload,
                "source.recorded",
                event_uuid=UUIDS[0],
                system_time="2026-08-20T01:00:00Z",
            )

            output_bytes = b'{"coordinates":[1,2,3]}'
            output_manifest = object_manifest(
                output_bytes,
                storage_policy=policy("public"),
                upstream=(source_ref, source_manifest),
            )
            output_manifest["media_type"] = "application/json"
            output_manifest["provenance"]["tool"]["version"] = "1.0.0"
            with self.assertRaises(InvalidStoreInput):
                store.put_object(output_manifest, output_bytes)

            store.put_event(source_event, objects=[source_ref])
            output_ref = store.put_object(output_manifest, output_bytes)
            extraction_payload = phase2_extraction_payload(
                source_payload,
                output_manifest,
            )
            extraction_event = phase2_event(
                extraction_payload,
                "extraction.recorded",
                event_uuid=UUIDS[1],
                system_time="2026-08-20T02:00:00Z",
            )
            evidence_payload = phase2_evidence_payload(
                source_payload,
                extraction_payload,
            )
            evidence_event = phase2_event(
                evidence_payload,
                "evidence.recorded",
                event_uuid=UUIDS[2],
                system_time="2026-08-20T02:00:00Z",
            )
            with self.assertRaises(InvalidStoreInput):
                store.put_event(evidence_event, objects=[source_ref, output_ref])

            extraction_ref = store.put_event(
                extraction_event,
                objects=[source_ref, output_ref],
            )
            evidence_ref = store.put_event(
                evidence_event,
                objects=[source_ref, output_ref],
            )
            self.assertEqual(store.read_event(extraction_ref), extraction_event)
            self.assertEqual(store.read_event(evidence_ref), evidence_event)
            duplicate_extraction = copy.deepcopy(extraction_event)
            duplicate_extraction["event_id"] = f"evt_{UUIDS[3]}"
            duplicate_extraction = seal_event(duplicate_extraction)
            with self.assertRaises(StoreConflict):
                store.put_event(
                    duplicate_extraction,
                    objects=[source_ref, output_ref],
                )
            self.assertEqual(store.rebuild_manifest()["schema"], "memory-local-store-manifest/v1")

    def test_phase2_rejects_wrong_manifest_ambiguous_and_future_dependencies(self) -> None:
        def source_setup(root: Path, *, system_time: str = "2026-08-20T01:00:00Z"):
            store = self.new_store(root)
            source_bytes = b"phase2 negative source"
            source_manifest = object_manifest(
                source_bytes,
                storage_policy=policy("public"),
            )
            source_manifest["media_type"] = "application/pdf"
            source_ref = store.put_object(source_manifest, source_bytes)
            source_payload = phase2_source_payload(source_manifest)
            source_event = phase2_event(
                source_payload,
                "source.recorded",
                event_uuid=UUIDS[0],
                system_time=system_time,
            )
            store.put_event(source_event, objects=[source_ref])
            return store, source_manifest, source_ref, source_payload, source_event

        with tempfile.TemporaryDirectory() as temporary:
            store, source_manifest, source_ref, source_payload, _ = source_setup(
                Path(temporary) / "wrong-manifest"
            )
            output_bytes = b'{"wrong":"manifest"}'
            output_manifest = object_manifest(
                output_bytes,
                storage_policy=policy("public"),
                upstream=(source_ref, source_manifest),
            )
            output_manifest["media_type"] = "application/json"
            output_manifest["provenance"]["tool"]["version"] = "1.0.0"
            extraction_payload = phase2_extraction_payload(
                source_payload,
                output_manifest,
            )
            output_manifest["object_kind"] = "artifact"
            output_manifest["provenance"]["extraction"]["extraction_id"] = (
                f"extraction_{UUIDS[7]}"
            )
            self.assertEqual(validate_object_manifest(output_manifest), [])
            output_ref = store.put_object(output_manifest, output_bytes)
            extraction_event = phase2_event(
                extraction_payload,
                "extraction.recorded",
                event_uuid=UUIDS[1],
                system_time="2026-08-20T02:00:00Z",
            )
            self.assertEqual(validate_event(extraction_event), [])
            with self.assertRaises(InvalidStoreInput):
                store.put_event(
                    extraction_event,
                    objects=[source_ref, output_ref],
                )

        with tempfile.TemporaryDirectory() as temporary:
            store, source_manifest, source_ref, source_payload, source_event = source_setup(
                Path(temporary) / "ambiguous"
            )
            output_bytes = b'{"ambiguous":true}'
            output_manifest = object_manifest(
                output_bytes,
                storage_policy=policy("public"),
                upstream=(source_ref, source_manifest),
            )
            output_manifest["media_type"] = "application/json"
            output_manifest["provenance"]["tool"]["version"] = "1.0.0"
            output_ref = store.put_object(output_manifest, output_bytes)
            duplicate_source = copy.deepcopy(source_event)
            duplicate_source["event_id"] = f"evt_{UUIDS[3]}"
            duplicate_source = seal_event(duplicate_source)
            store.put_event(duplicate_source, objects=[source_ref])
            extraction_payload = phase2_extraction_payload(
                source_payload,
                output_manifest,
            )
            extraction_event = phase2_event(
                extraction_payload,
                "extraction.recorded",
                event_uuid=UUIDS[1],
                system_time="2026-08-20T02:00:00Z",
            )
            with self.assertRaises(InvalidStoreInput):
                store.put_event(
                    extraction_event,
                    objects=[source_ref, output_ref],
                )

        with tempfile.TemporaryDirectory() as temporary:
            store, source_manifest, source_ref, source_payload, _ = source_setup(
                Path(temporary) / "future",
                system_time="2026-08-20T03:00:00Z",
            )
            output_bytes = b'{"future":true}'
            output_manifest = object_manifest(
                output_bytes,
                storage_policy=policy("public"),
                upstream=(source_ref, source_manifest),
            )
            output_manifest["media_type"] = "application/json"
            output_manifest["provenance"]["tool"]["version"] = "1.0.0"
            output_ref = store.put_object(output_manifest, output_bytes)
            extraction_event = phase2_event(
                phase2_extraction_payload(source_payload, output_manifest),
                "extraction.recorded",
                event_uuid=UUIDS[1],
                system_time="2026-08-20T02:00:00Z",
            )
            with self.assertRaises(InvalidStoreInput):
                store.put_event(
                    extraction_event,
                    objects=[source_ref, output_ref],
                )

    def test_derivative_rights_and_exact_upstream_authorization_fail_closed(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            denied: set[tuple[str, str]] = set()
            requests: list[tuple[str, str]] = []

            def authorize(request: object) -> bool:
                key = (request.action, request.digest)
                requests.append(key)
                return key not in denied

            store = MemoryStore(
                Path(temporary) / "store",
                authorize=authorize,
                projection_purger=lambda _ref: (),
                projection_absent=lambda _ref: True,
            )
            source_bytes = b"rights controlled source"
            source_manifest = object_manifest(source_bytes)
            source_ref = store.put_object(source_manifest, source_bytes)
            source_event = phase2_event(
                phase2_source_payload(source_manifest),
                "source.recorded",
                event_uuid=UUIDS[0],
                system_time="2026-08-20T01:00:00Z",
                storage_policy=source_manifest["policy"],
            )
            denied.add(("bind", source_ref.sha256))
            with self.assertRaises(AccessDenied):
                store.put_event(source_event, objects=[source_ref])
            denied.clear()
            store.put_event(source_event, objects=[source_ref])

            derived_bytes = b"denied derivative"
            derived_manifest = object_manifest(
                derived_bytes,
                upstream=(source_ref, source_manifest),
            )
            denied.add(("derive", source_ref.sha256))
            with self.assertRaises(AccessDenied):
                store.put_object(derived_manifest, derived_bytes)
            denied.clear()

            unrelated_bytes = b"unrelated corrupt source"
            unrelated_manifest = object_manifest(
                unrelated_bytes,
                acquisition_uuid=UUIDS[1],
                version_uuid=UUIDS[1],
            )
            unrelated_ref = store.put_object(unrelated_manifest, unrelated_bytes)
            store._absolute(store._content_path(unrelated_ref)).write_bytes(b"corrupt")
            requests.clear()
            candidate_bytes = b"independent exact source"
            candidate_manifest = object_manifest(
                candidate_bytes,
                acquisition_uuid=UUIDS[2],
                version_uuid=UUIDS[2],
            )
            candidate_ref = store.put_object(candidate_manifest, candidate_bytes)
            candidate_event = event(
                candidate_manifest["policy"],
                event_uuid=UUIDS[2],
            )
            store.put_event(candidate_event, objects=[candidate_ref])
            self.assertNotIn(("bind", unrelated_ref.sha256), requests)
            self.assertNotIn(("derive", unrelated_ref.sha256), requests)

        with tempfile.TemporaryDirectory() as temporary:
            store = self.new_store(Path(temporary) / "prohibited")
            source_bytes = b"prohibited rights source"
            source_manifest = object_manifest(
                source_bytes,
                storage_policy=policy("public"),
            )
            source_ref = store.put_object(source_manifest, source_bytes)
            source_event = phase2_event(
                phase2_source_payload(source_manifest, derivative_use="prohibited"),
                "source.recorded",
                event_uuid=UUIDS[0],
                system_time="2026-08-20T01:00:00Z",
            )
            store.put_event(source_event, objects=[source_ref])
            derived_bytes = b"must not land"
            derived_manifest = object_manifest(
                derived_bytes,
                storage_policy=policy("public"),
                upstream=(source_ref, source_manifest),
            )
            with self.assertRaises(AccessDenied):
                store.put_object(derived_manifest, derived_bytes)
            self.assertEqual(len(store._object_refs(verify=False)), 1)

    def test_identical_bytes_are_distinct_acquisitions_and_rights(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            store = self.new_store(
                Path(temporary) / "store",
                cipher=AESGCMSIVEnvelopeCipher(os.urandom(32), key_id="key:test"),
            )
            raw = os.urandom(48)
            restricted_manifest = object_manifest(
                raw,
                acquisition_uuid=UUIDS[0],
                storage_policy=policy("restricted"),
            )
            public_manifest = object_manifest(
                raw,
                acquisition_uuid=UUIDS[1],
                version_uuid=UUIDS[1],
                storage_policy=policy("public"),
            )
            restricted = store.put_object(restricted_manifest, raw)
            public = store.put_object(public_manifest, raw)
            self.assertEqual(restricted.object_id, public.object_id)
            self.assertNotEqual(restricted.manifest_sha256, public.manifest_sha256)
            self.assertNotEqual(store._content_path(restricted), store._content_path(public))

    def test_protected_lane_requires_cipher_and_keeps_key_separate(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            raw = os.urandom(64)
            manifest = object_manifest(raw, storage_policy=policy("confidential"))
            without_cipher = self.new_store(Path(temporary) / "without")
            with self.assertRaises(EncryptionRequired):
                without_cipher.put_object(manifest, raw)
            store = self.new_store(
                Path(temporary) / "with",
                cipher=AESGCMSIVEnvelopeCipher(os.urandom(32), key_id="key:test"),
            )
            ref = store.put_object(manifest, raw)
            ciphertext = store._read_regular(store._content_path(ref))
            envelope = json.loads(store._read_regular(store._key_path(ref)))
            self.assertNotEqual(ciphertext, raw)
            self.assertNotIn(raw, ciphertext)
            self.assertRegex(envelope["dek_id"], r"^dek_[0-9a-f]{32}$")
            self.assertEqual(store.read_object(ref), raw)

    def test_purgeable_bytes_are_rejected_inside_git_for_all_classifications(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            repository = Path(temporary) / "repo"
            (repository / ".git").mkdir(parents=True)
            cases = [
                policy("restricted"),
                policy("public", "expires", "2026-08-22T00:00:00Z"),
                policy("internal", "source-policy"),
            ]
            for position, storage_policy in enumerate(cases):
                raw = f"runtime-{position}".encode()
                store = self.new_store(
                    repository / f"store-{position}",
                    cipher=AESGCMSIVEnvelopeCipher(os.urandom(32), key_id=f"key:test-{position}"),
                    source_policy=allow,
                )
                manifest = object_manifest(
                    raw,
                    acquisition_uuid=UUIDS[position],
                    version_uuid=UUIDS[position],
                    storage_policy=storage_policy,
                )
                with self.assertRaises(InvalidStoreInput):
                    store.put_object(manifest, raw)

    def test_expiry_and_source_policy_gate_read_backup_projection_and_restore(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            now = [dt.datetime(2026, 8, 20, 1, tzinfo=dt.timezone.utc)]
            store = self.new_store(
                Path(temporary) / "expires",
                clock=lambda: now[0],
            )
            raw = b"expiring"
            manifest = object_manifest(
                raw,
                storage_policy=policy("internal", "expires", "2026-08-21T00:00:00Z"),
            )
            ref = store.put_object(manifest, raw)
            store.create_backup(ref, "drill")
            now[0] = dt.datetime(2026, 8, 21, 0, tzinfo=dt.timezone.utc)
            for operation in (
                lambda: store.read_object(ref),
                lambda: store.find_object(
                    ref.acquisition_id,
                    ref.source_version_id,
                    ref.manifest_sha256,
                ),
                lambda: store.create_backup(ref, "late"),
                lambda: store.restore_from_backup(ref, "drill"),
            ):
                with self.assertRaises(ExpiredContent):
                    operation()

            entitlement = [True]
            source_store = self.new_store(
                Path(temporary) / "source-policy",
                source_policy=lambda _request: entitlement[0],
            )
            source_raw = b"entitled"
            source_manifest = object_manifest(
                source_raw,
                acquisition_uuid=UUIDS[1],
                version_uuid=UUIDS[1],
                storage_policy=policy("internal", "source-policy"),
            )
            source_ref = source_store.put_object(source_manifest, source_raw)
            entitlement[0] = False
            with self.assertRaises(AccessDenied):
                source_store.read_object(source_ref)
            with self.assertRaises(AccessDenied):
                source_store.find_object(
                    source_ref.acquisition_id,
                    source_ref.source_version_id,
                    source_ref.manifest_sha256,
                )

    def test_exact_lookup_verifies_only_the_authorized_target_content(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            store = self.new_store(Path(temporary) / "store")
            first_raw = b"lookup target"
            second_raw = b"unrelated corrupt object"
            first_manifest = object_manifest(first_raw)
            second_manifest = object_manifest(
                second_raw,
                acquisition_uuid=UUIDS[1],
                version_uuid=UUIDS[1],
            )
            first_ref = store.put_object(first_manifest, first_raw)
            second_ref = store.put_object(second_manifest, second_raw)
            first_event = event(policy(), event_uuid=UUIDS[0])
            second_event = event(
                policy(), event_uuid=UUIDS[1], system_time="2026-08-20T02:00:00Z"
            )
            first_event_ref = store.put_event(first_event, objects=[first_ref])
            second_event_ref = store.put_event(second_event, objects=[second_ref])
            for relative in (
                store._content_path(second_ref),
                store._content_path(second_event_ref),
            ):
                path = store._absolute(relative)
                path.write_bytes(b"corrupt")
                os.chmod(path, 0o600)
            self.assertEqual(
                store.find_object(
                    first_ref.acquisition_id,
                    first_ref.source_version_id,
                    first_ref.manifest_sha256,
                ),
                first_ref,
            )
            self.assertEqual(store.find_event(first_event_ref.event_id), first_event_ref)

    def test_aggregate_audit_and_typed_reads_authorize_before_decrypt(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            denied: set[tuple[str, str]] = set()
            requests: list[tuple[str, str]] = []

            def authorize(request: object) -> bool:
                key = (request.action, request.digest)
                requests.append(key)
                return key not in denied

            store = MemoryStore(
                Path(temporary) / "store",
                authorize=authorize,
                cipher=AESGCMSIVEnvelopeCipher(os.urandom(32), key_id="key:audit"),
                projection_purger=lambda _ref: (),
                projection_absent=lambda _ref: True,
            )
            target_bytes = b"protected typed target"
            target_manifest = object_manifest(
                target_bytes,
                storage_policy=policy("restricted"),
            )
            target_ref = store.put_object(target_manifest, target_bytes)
            target_event = phase2_event(
                phase2_source_payload(target_manifest),
                "source.recorded",
                event_uuid=UUIDS[0],
                system_time="2026-08-20T01:00:00Z",
                storage_policy=target_manifest["policy"],
            )
            target_event_ref = store.put_event(target_event, objects=[target_ref])

            unrelated_bytes = b"protected unrelated event"
            unrelated_manifest = object_manifest(
                unrelated_bytes,
                acquisition_uuid=UUIDS[1],
                version_uuid=UUIDS[1],
                storage_policy=policy("restricted"),
            )
            unrelated_ref = store.put_object(unrelated_manifest, unrelated_bytes)
            unrelated_event = event(
                unrelated_manifest["policy"],
                event_uuid=UUIDS[1],
                system_time="2026-08-20T02:00:00Z",
            )
            unrelated_event_ref = store.put_event(
                unrelated_event,
                objects=[unrelated_ref],
            )
            baseline = store.export_manifest()
            unrelated_event_path = store._absolute(store._content_path(unrelated_event_ref))
            unrelated_event_path.write_bytes(b"corrupt protected ciphertext")
            os.chmod(unrelated_event_path, 0o600)

            requests.clear()
            denied.add(("read", unrelated_event_ref.record_sha256))
            self.assertEqual(store.read_event(target_event_ref), target_event)
            self.assertNotIn(("read", unrelated_event_ref.record_sha256), requests)

            denied.add(("audit", unrelated_event_ref.record_sha256))
            with self.assertRaises(AccessDenied):
                store.rebuild_manifest()
            with self.assertRaises(AccessDenied):
                store.verify_manifest(baseline)
            denied.add(("export", unrelated_event_ref.record_sha256))
            with self.assertRaises(AccessDenied):
                store.export_manifest()

    def test_backup_manifest_corruption_and_exact_restore_drill(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            store = self.new_store(Path(temporary) / "store")
            raw = b"recover me exactly"
            manifest = object_manifest(raw)
            ref = store.put_object(manifest, raw)
            store.create_backup(ref, "drill")
            baseline = store.export_manifest()
            store.verify_manifest(baseline)
            content = store._absolute(store._content_path(ref))
            content.write_bytes(b"corrupt")
            os.chmod(content, 0o600)
            with self.assertRaises(StoreCorruption):
                store.read_object(ref)
            store.restore_from_backup(ref, "drill")
            self.assertEqual(store.read_object(ref), raw)
            rebuilt = store.export_manifest()
            self.assertEqual(rebuilt, store.export_manifest())
            self.assertEqual(rebuilt, baseline)
            store.verify_manifest(baseline)

    def test_protected_backup_authentication_restore_and_key_rotation_drill(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            store = self.new_store(
                Path(temporary) / "store",
                cipher=AESGCMSIVEnvelopeCipher(os.urandom(32), key_id="key:test"),
            )
            raw = os.urandom(80)
            manifest = object_manifest(raw, storage_policy=policy("restricted"))
            ref = store.put_object(manifest, raw)
            store.create_backup(ref, "drill")
            original_key = json.loads(store._read_regular(store._key_path(ref)))["dek_id"]
            content = store._absolute(store._content_path(ref))
            corrupted = bytearray(content.read_bytes())
            corrupted[0] ^= 1
            content.write_bytes(corrupted)
            os.chmod(content, 0o600)
            with self.assertRaises(StoreCorruption):
                store.read_object(ref)
            store.restore_from_backup(ref, "drill")
            self.assertEqual(store.read_object(ref), raw)
            store.restore_object(ref, manifest, raw)
            rotated_key = json.loads(store._read_regular(store._key_path(ref)))["dek_id"]
            self.assertNotEqual(rotated_key, original_key)
            self.assertEqual(store.read_object(ref), raw)
            rebuilt = store.rebuild_manifest()
            self.assertEqual(len(rebuilt["managed_backups"]), 1)

    def test_symlink_and_unexpected_top_level_layout_fail_closed(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            self.new_store(root)
            (root / "objects").rmdir()
            (root / "objects").symlink_to(root / "events", target_is_directory=True)
            with self.assertRaises(StoreCorruption):
                self.new_store(root)
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = self.new_store(root)
            extra = root / "uncommitted-control.json"
            extra.write_text("{}", encoding="utf-8")
            os.chmod(extra, 0o600)
            with self.assertRaises(StoreCorruption):
                store.rebuild_manifest()

    @unittest.skipUnless(os.name == "posix", "secure directory-FD drill is POSIX-only")
    def test_held_parent_fd_prevents_ancestor_swap_delete_escape(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            store = self.new_store(base / "store")
            raw = b"inside store deletion target"
            ref = store.put_object(object_manifest(raw), raw)
            relative = store._content_path(ref)
            parent = store._absolute(relative).parent
            moved_parent = parent.with_name(parent.name + "-held")
            outside = base / "outside"
            outside.mkdir(mode=0o700)
            outside_target = outside / relative.name
            outside_target.write_bytes(b"outside file must survive")
            os.chmod(outside_target, 0o600)
            original_unlink = os.unlink
            swapped = False

            def swap_parent_then_unlink(path: object, *args: object, **kwargs: object):
                nonlocal swapped
                if (
                    not swapped
                    and path == relative.name
                    and kwargs.get("dir_fd") is not None
                ):
                    parent.rename(moved_parent)
                    parent.symlink_to(outside, target_is_directory=True)
                    swapped = True
                return original_unlink(path, *args, **kwargs)

            with mock.patch("memory_store.os.unlink", side_effect=swap_parent_then_unlink):
                self.assertEqual(store._delete_regular(relative), relative.as_posix())
            self.assertTrue(swapped)
            self.assertEqual(outside_target.read_bytes(), b"outside file must survive")
            self.assertFalse((moved_parent / relative.name).exists())

    def test_store_lock_serializes_competing_event_and_acquisition_writers(self) -> None:
        def race(calls: list[object]) -> list[object]:
            barrier = threading.Barrier(len(calls))
            results: list[object] = []
            result_lock = threading.Lock()

            def invoke(call: object) -> None:
                barrier.wait()
                try:
                    result: object = call()
                except Exception as exc:  # captured for exact race assertions
                    result = exc
                with result_lock:
                    results.append(result)

            threads = [threading.Thread(target=invoke, args=(call,)) for call in calls]
            for thread in threads:
                thread.start()
            for thread in threads:
                thread.join(timeout=10)
                self.assertFalse(thread.is_alive(), "store transaction race deadlocked")
            return results

        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "events"
            first_store = self.new_store(root)
            second_store = self.new_store(root)
            raw = b"concurrent source"
            manifest = object_manifest(raw)
            ref = first_store.put_object(manifest, raw)
            first_event = event(policy(), event_uuid=UUIDS[0])
            second_event = copy.deepcopy(first_event)
            second_event["payload"]["record"]["decision"] = "Reject"
            second_event = seal_event(second_event)
            results = race(
                [
                    lambda: first_store.put_event(first_event, objects=[ref]),
                    lambda: second_store.put_event(second_event, objects=[ref]),
                ]
            )
            self.assertEqual(sum(not isinstance(item, Exception) for item in results), 1)
            self.assertEqual(sum(isinstance(item, StoreConflict) for item in results), 1)
            self.assertEqual(len(first_store._event_refs()), 1)

        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "acquisitions"
            first_store = self.new_store(root)
            second_store = self.new_store(root)
            public_bytes = b"public candidate"
            internal_bytes = b"internal candidate"
            public_manifest = object_manifest(
                public_bytes, storage_policy=policy("public")
            )
            internal_manifest = object_manifest(
                internal_bytes, storage_policy=policy("internal")
            )
            results = race(
                [
                    lambda: first_store.put_object(public_manifest, public_bytes),
                    lambda: second_store.put_object(internal_manifest, internal_bytes),
                ]
            )
            self.assertEqual(sum(not isinstance(item, Exception) for item in results), 1)
            self.assertEqual(sum(isinstance(item, StoreConflict) for item in results), 1)
            self.assertEqual(len(first_store._object_refs()), 1)

    def test_derivative_closure_requires_complete_tombstones_and_purges_all_surfaces(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            projections: set[str] = set()

            def purge_projection(ref: object) -> list[str]:
                event_id = ref.event_id
                projections.discard(event_id)
                return [f"projection/{event_id}"]

            def projection_absent(ref: object) -> bool:
                return ref.event_id not in projections

            store = self.new_store(
                Path(temporary) / "store",
                projection_purger=purge_projection,
                projection_absent=projection_absent,
            )
            source_bytes = b"source for erasure"
            source_manifest = object_manifest(source_bytes)
            source_ref = store.put_object(source_manifest, source_bytes)
            source_event = phase2_event(
                phase2_source_payload(source_manifest),
                "source.recorded",
                event_uuid=UUIDS[7],
                system_time="2026-08-20T01:00:00Z",
                storage_policy=source_manifest["policy"],
            )
            source_event_ref = store.put_event(source_event, objects=[source_ref])
            derived_bytes = b"derived for erasure"
            derived_manifest = object_manifest(
                derived_bytes,
                upstream=(source_ref, source_manifest),
            )
            derived_ref = store.put_object(derived_manifest, derived_bytes)
            target_event = source_event
            target_ref = source_event_ref
            dependent_event = event(
                policy(),
                event_uuid=UUIDS[1],
                system_time="2026-08-20T02:00:00Z",
                derived_from=[target_ref.event_id],
            )
            dependent_ref = store.put_event(dependent_event, objects=[derived_ref])
            projections.update({target_ref.event_id, dependent_ref.event_id})
            target_tombstone = tombstone(
                target_event, event_uuid=UUIDS[2], at="2026-08-20T03:00:00Z"
            )
            dependent_tombstone = tombstone(
                dependent_event, event_uuid=UUIDS[3], at="2026-08-20T03:00:01Z"
            )
            with self.assertRaises(PurgeIncomplete):
                store.purge_event(target_ref, target_tombstone)
            receipt = store.purge_event(
                target_ref,
                target_tombstone,
                dependent_tombstones={dependent_ref.event_id: dependent_tombstone},
            )
            self.assertEqual(len(receipt.removed_events), 2)
            self.assertEqual(len(receipt.removed_objects), 2)
            self.assertEqual(len(receipt.transitive_objects), 1)
            self.assertEqual(projections, set())
            serialized = canonical_json_bytes(receipt.to_dict())
            self.assertNotIn(b'"path"', serialized)
            self.assertEqual(
                store.purge_event(
                    target_ref,
                    target_tombstone,
                    dependent_tombstones={dependent_ref.event_id: dependent_tombstone},
                ),
                receipt,
            )
            with self.assertRaises(StoreConflict):
                store.restore_object(source_ref, source_manifest, source_bytes)

    def test_purge_authorizes_cross_acquisition_closure_before_mutation(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            denied: set[tuple[str, str]] = set()
            deny_tombstone_writes = [False]

            def authorize(request: object) -> bool:
                if (
                    deny_tombstone_writes[0]
                    and request.action == "write"
                    and request.kind == "event"
                    and request.policy.retention == "tombstone-only"
                ):
                    return False
                return (request.action, request.digest) not in denied

            store = MemoryStore(
                root,
                authorize=authorize,
                projection_purger=lambda _ref: (),
                projection_absent=lambda _ref: True,
            )
            source_bytes = b"cross acquisition purge source"
            source_manifest = object_manifest(source_bytes)
            source_ref = store.put_object(source_manifest, source_bytes)
            source_event = phase2_event(
                phase2_source_payload(source_manifest),
                "source.recorded",
                event_uuid=UUIDS[0],
                system_time="2026-08-20T01:00:00Z",
                storage_policy=source_manifest["policy"],
            )
            source_event_ref = store.put_event(source_event, objects=[source_ref])
            derived_bytes = b"cross acquisition derived bytes"
            derived_manifest = object_manifest(
                derived_bytes,
                acquisition_uuid=UUIDS[1],
                version_uuid=UUIDS[1],
                upstream=(source_ref, source_manifest),
            )
            derived_ref = store.put_object(derived_manifest, derived_bytes)
            dependent_event = event(
                derived_manifest["policy"],
                event_uuid=UUIDS[1],
                system_time="2026-08-20T02:00:00Z",
                derived_from=[source_event_ref.event_id],
            )
            dependent_ref = store.put_event(dependent_event, objects=[derived_ref])
            target_tombstone = tombstone(
                source_event,
                event_uuid=UUIDS[2],
                at="2026-08-20T03:00:00Z",
            )
            dependent_tombstone = tombstone(
                dependent_event,
                event_uuid=UUIDS[3],
                at="2026-08-20T03:00:01Z",
            )
            before = store_snapshot(root)
            denied.add(("purge", derived_ref.sha256))
            with self.assertRaises(AccessDenied):
                store.purge_event(
                    source_event_ref,
                    target_tombstone,
                    dependent_tombstones={
                        dependent_ref.event_id: dependent_tombstone,
                    },
                )
            self.assertEqual(store_snapshot(root), before)
            denied.clear()
            deny_tombstone_writes[0] = True
            with self.assertRaises(AccessDenied):
                store.purge_event(
                    source_event_ref,
                    target_tombstone,
                    dependent_tombstones={
                        dependent_ref.event_id: dependent_tombstone,
                    },
                )
            self.assertEqual(store_snapshot(root), before)

    def test_purge_refuses_without_projection_hooks_before_mutation(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "store"
            store = MemoryStore(root, authorize=allow)
            raw = b"projection scope must be explicit"
            manifest = object_manifest(raw)
            object_ref = store.put_object(manifest, raw)
            target_event = event(policy())
            event_ref = store.put_event(target_event, objects=[object_ref])
            before = store_snapshot(root)
            with self.assertRaises(PurgeIncomplete):
                store.purge_event(
                    event_ref,
                    tombstone(
                        target_event,
                        event_uuid=UUIDS[2],
                        at="2026-08-20T03:00:00Z",
                    ),
                )
            self.assertEqual(store_snapshot(root), before)

    def test_event_only_source_purge_closes_typed_extraction_and_evidence_chain(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            store = self.new_store(Path(temporary) / "store")
            source_bytes = b"typed purge source"
            source_manifest = object_manifest(
                source_bytes,
                storage_policy=policy("public"),
            )
            source_manifest["media_type"] = "application/pdf"
            source_ref = store.put_object(source_manifest, source_bytes)
            source_payload = phase2_source_payload(source_manifest)
            source_event = phase2_event(
                source_payload,
                "source.recorded",
                event_uuid=UUIDS[0],
                system_time="2026-08-20T01:00:00Z",
            )
            source_event_ref = store.put_event(source_event, objects=[source_ref])
            output_bytes = b'{"typed":"coordinates"}'
            output_manifest = object_manifest(
                output_bytes,
                storage_policy=policy("public"),
                upstream=(source_ref, source_manifest),
            )
            output_manifest["media_type"] = "application/json"
            output_manifest["provenance"]["tool"]["version"] = "1.0.0"
            output_ref = store.put_object(output_manifest, output_bytes)
            extraction_payload = phase2_extraction_payload(source_payload, output_manifest)
            extraction_event = phase2_event(
                extraction_payload,
                "extraction.recorded",
                event_uuid=UUIDS[1],
                system_time="2026-08-20T02:00:00Z",
            )
            extraction_ref = store.put_event(
                extraction_event,
                objects=[source_ref, output_ref],
            )
            evidence_event = phase2_event(
                phase2_evidence_payload(source_payload, extraction_payload),
                "evidence.recorded",
                event_uuid=UUIDS[2],
                system_time="2026-08-20T02:00:00Z",
            )
            evidence_ref = store.put_event(
                evidence_event,
                objects=[source_ref, output_ref],
            )
            receipt = store.purge_event(
                source_event_ref,
                tombstone(
                    source_event,
                    event_uuid=UUIDS[3],
                    at="2026-08-20T03:00:00Z",
                ),
                target_objects=[],
                dependent_tombstones={
                    extraction_ref.event_id: tombstone(
                        extraction_event,
                        event_uuid=UUIDS[4],
                        at="2026-08-20T03:00:01Z",
                    ),
                    evidence_ref.event_id: tombstone(
                        evidence_event,
                        event_uuid=UUIDS[5],
                        at="2026-08-20T03:00:02Z",
                    ),
                },
            )
            self.assertEqual(receipt.removed_objects, ())
            self.assertEqual(
                {event_id for event_id, _sha in receipt.removed_events},
                {
                    source_event_ref.event_id,
                    extraction_ref.event_id,
                    evidence_ref.event_id,
                },
            )
            self.assertEqual(store.read_object(source_ref), source_bytes)
            self.assertEqual(store.read_object(output_ref), output_bytes)
            self.assertEqual(store.rebuild_manifest()["schema"], "memory-local-store-manifest/v1")
            store.rebuild_manifest()

    def test_purge_does_not_cross_identical_bytes_with_independent_rights(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            store = self.new_store(
                Path(temporary) / "store",
                cipher=AESGCMSIVEnvelopeCipher(os.urandom(32), key_id="key:test"),
            )
            raw = os.urandom(32)
            restricted_policy = policy("restricted")
            public_policy = policy("public")
            manifest_a = object_manifest(raw, storage_policy=restricted_policy)
            manifest_b = object_manifest(
                raw,
                acquisition_uuid=UUIDS[1],
                version_uuid=UUIDS[1],
                storage_policy=public_policy,
            )
            object_a = store.put_object(manifest_a, raw)
            object_b = store.put_object(manifest_b, raw)
            event_a = event(restricted_policy, event_uuid=UUIDS[0])
            event_b = event(public_policy, event_uuid=UUIDS[1])
            ref_a = store.put_event(event_a, objects=[object_a])
            ref_b = store.put_event(event_b, objects=[object_b])
            receipt = store.purge_event(
                ref_a,
                tombstone(event_a, event_uuid=UUIDS[2], at="2026-08-20T03:00:00Z"),
            )
            self.assertEqual(len(receipt.removed_events), 1)
            self.assertEqual(store.read_object(object_b), raw)
            self.assertEqual(store.read_event(ref_b), event_b)

    def test_event_only_purge_preserves_shared_bound_object_and_sibling_event(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            store = self.new_store(Path(temporary) / "store")
            raw = b"shared rights-bearing source"
            manifest = object_manifest(raw)
            shared = store.put_object(manifest, raw)
            event_a = event(policy(), event_uuid=UUIDS[0])
            event_b = event(
                policy(), event_uuid=UUIDS[1], system_time="2026-08-20T02:00:00Z"
            )
            ref_a = store.put_event(event_a, objects=[shared])
            ref_b = store.put_event(event_b, objects=[shared])
            receipt = store.purge_event(
                ref_a,
                tombstone(event_a, event_uuid=UUIDS[2], at="2026-08-20T03:00:00Z"),
                target_objects=[],
            )
            self.assertEqual(receipt.removed_objects, ())
            self.assertEqual(store.read_object(shared), raw)
            self.assertEqual(store.read_event(ref_b), event_b)
            self.assertEqual(
                store.purge_event(
                    ref_a,
                    tombstone(event_a, event_uuid=UUIDS[2], at="2026-08-20T03:00:00Z"),
                    target_objects=[],
                ),
                receipt,
            )

    def test_completed_purge_and_rebuild_detect_out_of_band_resurrection(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            store = self.new_store(
                Path(temporary) / "store",
                cipher=AESGCMSIVEnvelopeCipher(os.urandom(32), key_id="key:test"),
            )
            raw = os.urandom(32)
            storage_policy = policy("restricted")
            manifest = object_manifest(raw, storage_policy=storage_policy)
            object_ref = store.put_object(manifest, raw)
            target_event = event(storage_policy)
            event_ref = store.put_event(target_event, objects=[object_ref])
            saved: dict[Path, bytes] = {}
            for ref in (object_ref, event_ref):
                for relative in (
                    store._content_path(ref),
                    store._descriptor_path(ref),
                    store._key_path(ref),
                ):
                    saved[relative] = store._read_regular(relative)
            store.purge_event(
                event_ref,
                tombstone(target_event, event_uuid=UUIDS[2], at="2026-08-20T03:00:00Z"),
            )
            for relative, value in saved.items():
                absolute = store._absolute(relative)
                absolute.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
                os.chmod(absolute.parent, 0o700)
                absolute.write_bytes(value)
                os.chmod(absolute, 0o600)
            with self.assertRaises(StoreCorruption):
                store.rebuild_manifest()
            with self.assertRaises(StoreCorruption):
                store.purge_event(
                    event_ref,
                    tombstone(target_event, event_uuid=UUIDS[2], at="2026-08-20T03:00:00Z"),
                )


if __name__ == "__main__":
    unittest.main()
