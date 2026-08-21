#!/usr/bin/env python3
"""Adversarial exact-byte resolution tests for Git legacy and Phase 2 objects."""
from __future__ import annotations

import copy
import datetime as dt
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from memory_adapters import ADAPTER_NAME, ADAPTER_RUNTIME
from canonical_json import canonical_json
from memory_contract import object_manifest_sha256, seal_event
from memory_resolver import (
    CompositeMemoryResolver,
    InvalidResolutionRequest,
    MemoryResolutionError,
    ResolutionAccessDenied,
    ResolutionIntegrityError,
    ResolutionNotFound,
    ResolutionUnavailable,
    run_legacy_resolution_drill,
)
from memory_store import MemoryStore, StoreCorruption


UUIDS = [
    "11111111-1111-5111-8111-111111111111",
    "22222222-2222-5222-8222-222222222222",
    "33333333-3333-5333-8333-333333333333",
    "44444444-4444-5444-8444-444444444444",
    "55555555-5555-5555-8555-555555555555",
]


def _git(root: Path, *arguments: str) -> str:
    return subprocess.run(
        ["git", *arguments],
        cwd=str(root),
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()


def _policy(classification: str = "internal") -> dict:
    return {
        "classification": classification,
        "retention": "permanent",
        "retain_until": None,
    }


def _legacy_event(
    raw: bytes,
    *,
    source_path: str,
    locator: str,
    event_uuid: str,
    classification: str = "internal",
) -> dict:
    record = json.loads(raw.decode("utf-8"))
    digest = hashlib.sha256(raw).hexdigest()
    event = {
        "schema": "memory-event/v1",
        "event_id": f"evt_{event_uuid}",
        "event_type": "decision.recorded",
        "subject_ids": ["entity:internal:legacy-11111111-1111-5111-8111-111111111111"],
        "valid_time": {"from": "2026-08-20", "to": None},
        "system_time": "2026-08-20T12:00:00Z",
        "producer": {
            "kind": "adapter",
            "name": ADAPTER_NAME,
            "runtime": ADAPTER_RUNTIME,
            "model": None,
            "prompt_program_sha": None,
        },
        "run_id": None,
        "trace_id": None,
        "payload": {
            "legacy_schema": "resolver-test/v1",
            "record_type": "resolver_test",
            "source_path": source_path,
            "source_locator": locator,
            "source_sha256": digest,
            "identity_mapping": {
                "strategy": "native-ids-plus-opaque-source-composites-v1",
                "opaque_uuid_namespace": "bcfa556d-1823-5793-8d33-bd24c14d3ff4",
                "aliases_preserved_under": "record",
            },
            "time_mapping": {
                "system_time_field": "processed_at",
                "system_time_precision": "instant",
                "system_time_trust": "git-recorded",
                "valid_time_field": "decision_date",
                "valid_time_precision": "day",
            },
            "record": record,
        },
        "evidence_refs": [f"evidence:sha256:{digest}#{locator}"],
        "derived_from": [],
        "supersedes": [],
        "integrity": {"payload_sha256": "0" * 64, "signature": None},
        "policy": _policy(classification),
    }
    return seal_event(event)


def _manifest(
    raw: bytes,
    *,
    acquisition_uuid: str = UUIDS[0],
    version_uuid: str = UUIDS[0],
    classification: str = "public",
) -> dict:
    digest = hashlib.sha256(raw).hexdigest()
    return {
        "schema": "memory-object-manifest/v1",
        "object_id": f"object:sha256:{digest}",
        "acquisition_id": f"acquisition_{acquisition_uuid}",
        "source_version_id": f"source-version_{version_uuid}",
        "object_kind": "source",
        "content_sha256": f"sha256:{digest}",
        "byte_length": len(raw),
        "media_type": "application/octet-stream",
        "locator": {
            "kind": "object-uri",
            "value": f"r2://must-not-be-fetched.invalid/{digest}",
            "version_id": f"sha256:{digest}",
        },
        "source_lineage": {
            "source_id": f"source:sha256:{digest}",
            "source_object": None,
            "derived_from_objects": [],
        },
        "provenance": {
            "producer": {
                "producer_id": "producer:resolver-test",
                "kind": "system",
                "name": "resolver-test",
            },
            "run_id": f"run_{UUIDS[4]}",
            "tool": None,
            "extraction": None,
            "prompt_program": None,
            "context_packet": None,
        },
        "created_at": "2026-08-20T00:00:00Z",
        "policy": _policy(classification),
    }


def _allow(request: object) -> bool:
    return getattr(request, "principal", None) == "allowed"


class GitFixture:
    def __init__(self, base: Path) -> None:
        self.root = base / "repository"
        self.root.mkdir()
        _git(self.root, "init", "-q")
        _git(self.root, "config", "user.email", "resolver@example.test")
        _git(self.root, "config", "user.name", "Resolver Test")
        self.json_path = "analyses/ACME_2026-08-20/decision_record.json"
        self.line_path = "screener/ledger/events.ndjson"
        self.json_raw = (
            b'{\n  "decision": "watch",\n  "decision_date": "2026-08-20",\n'
            b'  "exchange": "XNYS",\n  "score": 7,\n  "ticker": "ACME"\n}\n'
        )
        self.rows = [
            b'{"event_id":"one","processed_at":"2026-08-20T00:00:00Z"}',
            b'{"event_id":"two","processed_at":"2026-08-20T01:00:00Z"}',
        ]
        json_absolute = self.root / self.json_path
        line_absolute = self.root / self.line_path
        json_absolute.parent.mkdir(parents=True)
        line_absolute.parent.mkdir(parents=True)
        json_absolute.write_bytes(self.json_raw)
        line_absolute.write_bytes(self.rows[0] + b"\r\n" + self.rows[1] + b"\n")
        _git(self.root, "add", "--", self.json_path, self.line_path)
        _git(self.root, "commit", "-qm", "seed exact resolver sources")
        self.json_event = _legacy_event(
            self.json_raw,
            source_path=self.json_path,
            locator="json",
            event_uuid=UUIDS[0],
        )
        self.line_event = _legacy_event(
            self.rows[1],
            source_path=self.line_path,
            locator="line-2",
            event_uuid=UUIDS[1],
        )


class LegacyGitResolverTests(unittest.TestCase):
    def test_exact_head_json_and_ndjson_bytes_with_closed_metadata(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = GitFixture(Path(temporary))
            resolver = CompositeMemoryResolver(fixture.root, authorize_legacy=_allow)
            json_result = resolver.resolve(fixture.json_event, principal="allowed")
            line_result = resolver.resolve_legacy_event(
                fixture.line_event, principal="allowed"
            )
            self.assertEqual(json_result.content, fixture.json_raw)
            self.assertEqual(line_result.content, fixture.rows[1])
            self.assertEqual(
                json_result.metadata.repository_revision,
                _git(fixture.root, "rev-parse", "HEAD"),
            )
            self.assertEqual(line_result.metadata.source_locator, "line-2")
            metadata = json_result.metadata.to_dict()
            self.assertEqual(
                set(metadata),
                {
                    "schema",
                    "lane",
                    "event_id",
                    "repository_revision",
                    "source_path",
                    "source_locator",
                    "object_id",
                    "acquisition_id",
                    "source_version_id",
                    "manifest_sha256",
                    "content_sha256",
                    "byte_length",
                    "media_type",
                    "policy",
                },
            )
            self.assertNotIn("content", metadata)

    def test_exact_resolution_does_not_refresh_git_index_metadata(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = GitFixture(Path(temporary))
            # Force Git to inspect the worktree stat tuple while keeping exact bytes.
            absolute = fixture.root / fixture.json_path
            current = absolute.stat()
            os.utime(
                absolute,
                ns=(current.st_atime_ns, current.st_mtime_ns + 2_000_000_000),
            )
            index_path = fixture.root / ".git" / "index"
            before_bytes = index_path.read_bytes()
            before = index_path.stat()
            resolver = CompositeMemoryResolver(fixture.root, authorize_legacy=_allow)
            self.assertEqual(
                resolver.resolve(fixture.json_event, principal="allowed").content,
                fixture.json_raw,
            )
            after = index_path.stat()
            self.assertEqual(index_path.read_bytes(), before_bytes)
            self.assertEqual(
                (after.st_size, after.st_mtime_ns, after.st_ctime_ns),
                (before.st_size, before.st_mtime_ns, before.st_ctime_ns),
            )

    def test_internal_legacy_defaults_to_denied_and_hooks_fail_closed(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = GitFixture(Path(temporary))
            with self.assertRaises(ResolutionAccessDenied):
                CompositeMemoryResolver(fixture.root).resolve(fixture.json_event)
            resolver = CompositeMemoryResolver(
                fixture.root,
                authorize_legacy=lambda _request: (_ for _ in ()).throw(RuntimeError("boom")),
            )
            with self.assertRaises(ResolutionAccessDenied):
                resolver.resolve(fixture.json_event)

            expired = copy.deepcopy(fixture.json_event)
            expired["policy"] = {
                "classification": "internal",
                "retention": "expires",
                "retain_until": "2026-08-21T00:00:00Z",
            }
            resolver = CompositeMemoryResolver(
                fixture.root,
                authorize_legacy=lambda _request: True,
                clock=lambda: dt.datetime(2026, 8, 22, tzinfo=dt.timezone.utc),
            )
            with self.assertRaises(ResolutionAccessDenied):
                resolver.resolve(expired, principal="allowed")

            source_policy = copy.deepcopy(fixture.json_event)
            source_policy["policy"] = {
                "classification": "internal",
                "retention": "source-policy",
                "retain_until": None,
            }
            resolver = CompositeMemoryResolver(
                fixture.root, authorize_legacy=lambda _request: True
            )
            with self.assertRaises(ResolutionAccessDenied):
                resolver.resolve(source_policy, principal="allowed")

    def test_hostile_json_shapes_fail_with_closed_resolver_errors(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = GitFixture(Path(temporary))
            resolver = CompositeMemoryResolver(
                fixture.root,
                store=MemoryStore(Path(temporary) / "empty-store", authorize=_allow),
                authorize_legacy=_allow,
            )
            hostile = [
                None,
                True,
                0,
                "memory-event/v1",
                [],
                {},
                {"schema": "memory-event/v1", "producer": []},
                {"schema": "memory-event/v1", "payload": {"source_path": []}},
                {"schema": "memory-object-manifest/v1", "locator": {"kind": []}},
                {"schema": "memory-object-manifest/v1", "policy": []},
            ]
            for value in hostile:
                with self.subTest(value=value):
                    with self.assertRaises(MemoryResolutionError):
                        resolver.resolve(value, principal="allowed")

    def test_reads_head_but_rejects_dirty_staged_deleted_and_untracked_paths(self) -> None:
        for state in ("dirty", "staged", "deleted", "assume-unchanged"):
            with self.subTest(state=state), tempfile.TemporaryDirectory() as temporary:
                fixture = GitFixture(Path(temporary))
                absolute = fixture.root / fixture.json_path
                if state == "deleted":
                    absolute.unlink()
                else:
                    if state == "assume-unchanged":
                        _git(fixture.root, "update-index", "--assume-unchanged", fixture.json_path)
                    absolute.write_bytes(b'{"decision":"changed"}\n')
                    if state == "staged":
                        _git(fixture.root, "add", "--", fixture.json_path)
                resolver = CompositeMemoryResolver(fixture.root, authorize_legacy=_allow)
                with self.assertRaises(ResolutionIntegrityError):
                    resolver.resolve(fixture.json_event, principal="allowed")

        with tempfile.TemporaryDirectory() as temporary:
            fixture = GitFixture(Path(temporary))
            untracked_path = "analyses/NEW_2026-08-20/decision_record.json"
            absolute = fixture.root / untracked_path
            absolute.parent.mkdir(parents=True)
            absolute.write_bytes(fixture.json_raw)
            event = _legacy_event(
                fixture.json_raw,
                source_path=untracked_path,
                locator="json",
                event_uuid=UUIDS[2],
            )
            resolver = CompositeMemoryResolver(fixture.root, authorize_legacy=_allow)
            with self.assertRaises(ResolutionIntegrityError):
                resolver.resolve(event, principal="allowed")

    @unittest.skipIf(os.name == "nt", "Git executable-bit mode is POSIX-specific")
    def test_rejects_non_regular_git_mode(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = GitFixture(Path(temporary))
            absolute = fixture.root / fixture.json_path
            absolute.chmod(0o755)
            _git(fixture.root, "add", "--", fixture.json_path)
            _git(fixture.root, "commit", "-qm", "change source mode")
            resolver = CompositeMemoryResolver(fixture.root, authorize_legacy=_allow)
            with self.assertRaises(ResolutionIntegrityError):
                resolver.resolve(fixture.json_event, principal="allowed")

    def test_requires_exact_adapter_shape_and_matching_locator(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = GitFixture(Path(temporary))
            resolver = CompositeMemoryResolver(fixture.root, authorize_legacy=_allow)
            mutations = []
            wrong_producer = copy.deepcopy(fixture.json_event)
            wrong_producer["producer"]["name"] = "lookalike-adapter"
            mutations.append(wrong_producer)
            extra_payload = copy.deepcopy(fixture.json_event)
            extra_payload["payload"]["unexpected"] = True
            mutations.append(seal_event(extra_payload))
            wrong_locator = copy.deepcopy(fixture.json_event)
            wrong_locator["payload"]["source_locator"] = "line-1"
            mutations.append(seal_event(wrong_locator))
            traversal = copy.deepcopy(fixture.json_event)
            traversal["payload"]["source_path"] = "analyses/../decision_record.json"
            mutations.append(seal_event(traversal))
            for event in mutations:
                with self.subTest(event=event["payload"].get("source_path")):
                    with self.assertRaises(InvalidResolutionRequest):
                        resolver.resolve(event, principal="allowed")

    def test_rechecks_digest_record_and_locator_bounds(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = GitFixture(Path(temporary))
            resolver = CompositeMemoryResolver(fixture.root, authorize_legacy=_allow)
            bad_digest = copy.deepcopy(fixture.json_event)
            bad_digest["payload"]["source_sha256"] = "f" * 64
            bad_digest = seal_event(bad_digest)
            with self.assertRaises(ResolutionIntegrityError):
                resolver.resolve(bad_digest, principal="allowed")

            bad_record = copy.deepcopy(fixture.json_event)
            bad_record["payload"]["record"] = {"decision": "other"}
            bad_record = seal_event(bad_record)
            with self.assertRaises(ResolutionIntegrityError):
                resolver.resolve(bad_record, principal="allowed")

            missing_line = copy.deepcopy(fixture.line_event)
            missing_line["payload"]["source_locator"] = "line-99"
            missing_line["evidence_refs"] = [
                f"evidence:sha256:{missing_line['payload']['source_sha256']}#line-99"
            ]
            missing_line = seal_event(missing_line)
            with self.assertRaises(ResolutionNotFound):
                resolver.resolve(missing_line, principal="allowed")

    def test_drill_samples_both_lanes_and_rebuilds_identical_metadata(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = GitFixture(Path(temporary))
            resolver = CompositeMemoryResolver(fixture.root, authorize_legacy=_allow)
            events = [fixture.line_event, fixture.json_event]
            first = run_legacy_resolution_drill(
                resolver, events, principal="allowed", sample_size=2
            )
            second = run_legacy_resolution_drill(
                resolver, reversed(events), principal="allowed", sample_size=2
            )
            self.assertTrue(first["metadata_match"])
            self.assertEqual(first, second)
            self.assertEqual(set(first["sample_locators"]), {"json", "line-2"})
            self.assertEqual(first["first_metadata_sha256"], first["second_metadata_sha256"])

    def test_cli_drill_requires_explicit_internal_gate_and_emits_canonical_metadata(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = GitFixture(Path(temporary))
            script = Path(__file__).with_name("memory_resolver.py")
            denied = subprocess.run(
                [sys.executable, str(script), "drill", "--root", str(fixture.root)],
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertEqual(denied.returncode, 1)
            self.assertEqual(
                json.loads(denied.stdout),
                {
                    "schema": "memory-resolution-drill/v1",
                    "ok": False,
                    "error": "resolution-refused",
                },
            )
            allowed = subprocess.run(
                [
                    sys.executable,
                    str(script),
                    "drill",
                    "--root",
                    str(fixture.root),
                    "--sample-size",
                    "2",
                    "--authorize-internal-legacy",
                ],
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertEqual(allowed.returncode, 0, allowed.stderr)
            report = json.loads(allowed.stdout)
            self.assertTrue(report["ok"])
            self.assertTrue(report["metadata_match"])
            self.assertEqual(report["adapter_error_count"], 0)
            self.assertEqual(report["sample_count"], 2)
            self.assertEqual(allowed.stdout, canonical_json(report) + "\n")
            self.assertNotIn("content", report)


class Phase2StoreResolverTests(unittest.TestCase):
    def test_exact_store_identity_resolves_without_fetching_locator(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            raw = b"exact source bytes"
            manifest = _manifest(raw)
            store = MemoryStore(root / "store", authorize=_allow)
            store.put_object(manifest, raw, principal="allowed")
            resolver = CompositeMemoryResolver(root, store=store)
            result = resolver.resolve_object_manifest(manifest, principal="allowed")
            self.assertEqual(result.content, raw)
            self.assertEqual(result.metadata.lane, "phase2-store")
            self.assertEqual(
                result.metadata.manifest_sha256,
                "sha256:" + object_manifest_sha256(manifest),
            )
            self.assertIsNone(result.metadata.source_path)
            self.assertNotIn("content", result.metadata.to_dict())

    def test_same_bytes_keep_distinct_acquisition_and_version_identities(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            raw = b"same bytes, separate rights"
            first_manifest = _manifest(raw, acquisition_uuid=UUIDS[0], version_uuid=UUIDS[0])
            second_manifest = _manifest(raw, acquisition_uuid=UUIDS[1], version_uuid=UUIDS[1])
            store = MemoryStore(root / "store", authorize=_allow)
            store.put_object(first_manifest, raw, principal="allowed")
            store.put_object(second_manifest, raw, principal="allowed")
            resolver = CompositeMemoryResolver(root, store=store)
            first = resolver.resolve(first_manifest, principal="allowed")
            second = resolver.resolve(second_manifest, principal="allowed")
            self.assertNotEqual(first.metadata.acquisition_id, second.metadata.acquisition_id)
            self.assertNotEqual(first.metadata.source_version_id, second.metadata.source_version_id)
            self.assertEqual(first.content, second.content)

    def test_missing_store_incomplete_pointer_and_exact_lookup_miss_fail_closed(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            raw = b"exact source bytes"
            manifest = _manifest(raw)
            with self.assertRaises(ResolutionUnavailable):
                CompositeMemoryResolver(root).resolve_object_manifest(manifest)
            resolver = CompositeMemoryResolver(
                root, store=MemoryStore(root / "empty", authorize=_allow)
            )
            with self.assertRaises(ResolutionNotFound):
                resolver.resolve_object_manifest(manifest, principal="allowed")
            with self.assertRaises(InvalidResolutionRequest):
                resolver.resolve(
                    {
                        "object_id": manifest["object_id"],
                        "content_sha256": manifest["content_sha256"],
                    },
                    principal="allowed",
                )

    def test_policy_denial_retirement_ambiguity_and_tampering_fail_closed(self) -> None:
        for scenario in ("denied", "retired", "ambiguous", "tampered"):
            with self.subTest(scenario=scenario), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                raw = b"protected exact source"
                manifest = _manifest(raw)
                store = MemoryStore(root / "store", authorize=_allow)
                ref = store.put_object(manifest, raw, principal="allowed")
                resolver = CompositeMemoryResolver(root, store=store)
                if scenario == "denied":
                    with self.assertRaises(ResolutionAccessDenied):
                        resolver.resolve(manifest, principal="denied")
                elif scenario == "retired":
                    store._retire(ref, [f"evt_{UUIDS[3]}"])
                    with self.assertRaises(ResolutionUnavailable):
                        resolver.resolve(manifest, principal="allowed")
                elif scenario == "ambiguous":
                    with mock.patch.object(
                        store, "find_object", side_effect=StoreCorruption("ambiguous")
                    ):
                        with self.assertRaises(ResolutionIntegrityError):
                            resolver.resolve(manifest, principal="allowed")
                else:
                    (store.root / store._content_path(ref)).write_bytes(b"tampered")
                    with self.assertRaises(ResolutionIntegrityError):
                        resolver.resolve(manifest, principal="allowed")

    def test_manifest_identity_mutation_cannot_fall_back_to_content_digest(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            raw = b"exact source bytes"
            manifest = _manifest(raw)
            store = MemoryStore(root / "store", authorize=_allow)
            store.put_object(manifest, raw, principal="allowed")
            resolver = CompositeMemoryResolver(root, store=store)
            changed = copy.deepcopy(manifest)
            changed["acquisition_id"] = f"acquisition_{UUIDS[2]}"
            with self.assertRaises(ResolutionNotFound):
                resolver.resolve(changed, principal="allowed")
            changed = copy.deepcopy(manifest)
            changed["source_version_id"] = f"source-version_{UUIDS[2]}"
            with self.assertRaises(ResolutionNotFound):
                resolver.resolve(changed, principal="allowed")


if __name__ == "__main__":
    unittest.main()
