#!/usr/bin/env python3
"""Schema-only regressions for permanent-memory Phase 2 domain contracts.

Fixtures are synthetic Python values kept in memory.  They contain no protected source bytes,
credentials, key envelopes, storage paths, or backup locations.
"""
from __future__ import annotations

import copy
import json
import sys
import unittest
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from validate_screener_json import Checker  # noqa: E402


UUID1 = "01890f47-6a2b-7cc1-8e91-1234567890ab"
UUID2 = "01890f47-6a2b-7cc1-9e91-1234567890ab"
UUID3 = "01890f47-6a2b-7cc1-ae91-1234567890ab"
UUID4 = "01890f47-6a2b-7cc1-be91-1234567890ab"
UUID5 = "15b8c74a-0ec3-52c8-9bf1-5d15a1d5a1ab"
UUID_V4 = "550e8400-e29b-41d4-a716-446655440000"


def digest(character: str) -> str:
    return character * 64


def hash_ref(character: str) -> str:
    return f"sha256:{digest(character)}"


def object_id(character: str) -> str:
    return f"object:sha256:{digest(character)}"


def signature() -> dict[str, Any]:
    return {
        "algorithm": "ed25519",
        "key_id": f"key_{UUID1}",
        "signed_sha256": hash_ref("f"),
        "value": "A" * 86,
    }


def source_v2() -> dict[str, Any]:
    return {
        "schema": "memory-source/v2",
        "document_id": f"document_{UUID1}",
        "source_version_id": f"source-version_{UUID2}",
        "acquisition_id": f"acquisition_{UUID3}",
        "source_object_id": object_id("a"),
        "content_sha256": hash_ref("a"),
        "acquired_at": "2026-08-21T10:30:00+05:30",
        "title": "Synthetic public filing fixture",
        "issuer_ids": ["issuer:lei:5493001KJTIIGC8Y1R12"],
        "source_tier": 1,
        "source_dates": {
            "publication_date": "2026-08-20",
            "filing_date": "2026-08-20",
            "effective_date": "2026-06-30",
        },
        "language": "en-IN",
        "licence": {
            "classification": "public",
            "entitlement": "not-required",
            "terms_sha256": hash_ref("b"),
            "expires_at": None,
        },
        "rights": {
            "derivative_use": "allowed",
            "embedding": "allowed",
            "redistribution": "allowed",
        },
        "mime_type": "application/pdf",
        "byte_length": 12345,
        "extraction_status": "succeeded",
    }


def evidence_v2() -> dict[str, Any]:
    return {
        "schema": "memory-evidence-span/v2",
        "evidence_id": f"evidence_{UUID1}",
        "document_id": f"document_{UUID1}",
        "source_version_id": f"source-version_{UUID2}",
        "acquisition_id": f"acquisition_{UUID3}",
        "source_object_id": object_id("a"),
        "source_content_sha256": hash_ref("a"),
        "locator": {
            "extraction_id": f"extraction_{UUID4}",
            "coordinate_artifact_object_id": object_id("c"),
            "coordinate_artifact_content_sha256": hash_ref("c"),
            "coordinate_system_sha256": hash_ref("d"),
            "kind": "page",
            "ref": "page-7",
            "page": 7,
            "section": "Synthetic section",
            "table": None,
            "cell": None,
            "char_start": 100,
            "char_end": 130,
            "record_index": None,
            "timestamp_start_millis": None,
            "timestamp_end_millis": None,
            "image_region": None,
        },
        "language": "en",
        "content": {"text": "Synthetic public fixture evidence."},
        "extraction_confidence": 1.0,
    }


def extraction_artifact() -> dict[str, Any]:
    return {
        "schema": "memory-extraction-artifact/v1",
        "extraction_id": f"extraction_{UUID4}",
        "document_id": f"document_{UUID1}",
        "source_version_id": f"source-version_{UUID2}",
        "acquisition_id": f"acquisition_{UUID3}",
        "source_object": {
            "object_id": object_id("a"),
            "content_sha256": hash_ref("a"),
        },
        "output_object": {
            "object_id": object_id("c"),
            "content_sha256": hash_ref("c"),
            "byte_length": 321,
            "media_type": "application/json",
        },
        "tool": {
            "tool_id": "tool:memory.synthetic-extractor",
            "version": "1.0.0",
            "artifact_sha256": hash_ref("e"),
        },
        "code": {
            "git_sha": "git:" + digest("1")[:40],
            "content_sha256": hash_ref("2"),
        },
        "parameters_sha256": hash_ref("3"),
        "method": "native-text",
        "coordinate_system": {
            "name": "pdf-page-character",
            "version": "1",
            "specification_sha256": hash_ref("d"),
        },
        "run_id": f"run_{UUID5}",
        "created_at": "2026-08-21T05:01:02Z",
    }


def set_commitment(character: str, count: int) -> dict[str, Any]:
    return {
        "record_count": count,
        "ordered_ids_sha256": hash_ref(character),
        "records_sha256": hash_ref(character),
    }


def checkpoint_pointer(
    checkpoint_uuid: str, character: str, sequence: int, purge_high_water: int
) -> dict[str, Any]:
    return {
        "checkpoint_id": f"checkpoint_{checkpoint_uuid}",
        "checkpoint_sha256": f"checkpoint:sha256:{digest(character)}",
        "sequence": sequence,
        "purge_high_water": purge_high_water,
    }


def store_checkpoint() -> dict[str, Any]:
    return {
        "schema": "memory-store-checkpoint/v1",
        "checkpoint_id": f"checkpoint_{UUID2}",
        "mode": "append",
        "sequence": 11,
        "purge_high_water": 2,
        "created_at": "2026-08-21T05:02:03.123456Z",
        "prior_checkpoint": checkpoint_pointer(UUID1, "a", 10, 1),
        "canonicalization": {
            "json": "memory-canonical-json/v1",
            "record_order": "lexicographic-record-id",
            "set_digest": "sha256-canonical-array/v1",
        },
        "commitments": {
            "manifests": set_commitment("a", 4),
            "events": set_commitment("b", 8),
            "receipts": set_commitment("c", 5),
            "tombstones": set_commitment("d", 1),
        },
        "retired_state": {
            "event_ids": [f"evt_{UUID3}"],
            "object_keys": [
                {
                    "object_id": object_id("a"),
                    "content_sha256": hash_ref("a"),
                    "manifest_sha256": hash_ref("f"),
                    "acquisition_id": f"acquisition_{UUID3}",
                    "source_version_id": f"source-version_{UUID3}",
                }
            ],
        },
        "store_root_sha256": hash_ref("e"),
        "signer_id": "producer:memory.checkpoint-writer",
        "signature": signature(),
    }


def surface_proof(character: str, count: int) -> dict[str, Any]:
    return {
        "scope_sha256": hash_ref(character),
        "matched_count": count,
        "removed_count": count,
        "residual_count": 0,
        "removed_set_sha256": hash_ref(character.upper()),
        "verification_sha256": hash_ref("9"),
        "verified_at": "2026-08-21T05:03:04Z",
    }


def object_pointer(character: str) -> dict[str, Any]:
    return {
        "object_id": object_id(character),
        "content_sha256": hash_ref(character),
        "manifest_sha256": hash_ref(character),
    }


def purge_receipt() -> dict[str, Any]:
    return {
        "schema": "memory-purge-receipt/v1",
        "purge_receipt_id": f"purge-receipt_{UUID1}",
        "mode": "append",
        "purge_sequence": 3,
        "prior_purge_receipt_sha256": hash_ref("1"),
        "prior_purge_high_water": 2,
        "new_purge_high_water": 3,
        "completed_at": "2026-08-21T05:04:05+00:00",
        "removed_targets": {
            "events": [
                {"event_id": f"evt_{UUID1}", "event_sha256": hash_ref("2")}
            ],
            "objects": [object_pointer("a")],
            "set_sha256": hash_ref("3"),
        },
        "removed_transitive_derivatives": {
            "event_count": 1,
            "events": [
                {"event_id": f"evt_{UUID3}", "event_sha256": hash_ref("4")}
            ],
            "object_count": 1,
            "objects": [object_pointer("c")],
            "closure_sha256": hash_ref("4"),
        },
        "erasure_surfaces": {
            "key_envelopes": surface_proof("5", 2),
            "backups": surface_proof("6", 1),
            "projections": surface_proof("7", 3),
        },
        "surviving_tombstone": {
            "tombstone_event_id": f"evt_{UUID2}",
            "tombstone_event_sha256": hash_ref("8"),
            "tombstone_payload_sha256": hash_ref("9"),
            "target_set_sha256": hash_ref("3"),
            "reason_code": "retention-ended",
            "classification": "internal",
            "retention": "tombstone-only",
        },
        "prior_checkpoint": checkpoint_pointer(UUID2, "b", 11, 2),
        "new_checkpoint": {
            "checkpoint_id": f"checkpoint_{UUID3}",
            "sequence": 12,
            "purge_high_water": 3,
        },
        "authority": {
            "authority_id": f"authority:sha256:{digest('d')}",
            "authorizer_id": "producer:memory.retention-authority",
            "authorization_sha256": hash_ref("e"),
            "authorized_at": "2026-08-21T05:00:00Z",
        },
        "signature": signature(),
    }


FIXTURES = {
    "source-v2.schema.json": source_v2,
    "evidence-span-v2.schema.json": evidence_v2,
    "extraction-artifact-v1.schema.json": extraction_artifact,
    "store-checkpoint-v1.schema.json": store_checkpoint,
    "purge-receipt-v1.schema.json": purge_receipt,
}


class Phase2SchemaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.schemas = {
            name: json.loads(
                (ROOT / "frameworks" / "memory" / name).read_text(encoding="utf-8")
            )
            for name in FIXTURES
        }

    def errors(self, name: str, fixture: dict[str, Any]) -> list[str]:
        schema = self.schemas[name]
        checker = Checker(schema)
        checker.check(schema, fixture, "")
        return checker.errors

    def assert_invalid(self, name: str, fixture: dict[str, Any]) -> None:
        errors = self.errors(name, fixture)
        self.assertTrue(errors, f"{name} unexpectedly accepted {fixture!r}")

    def test_schemas_are_closed_parseable_and_accept_synthetic_fixtures(self) -> None:
        for name, factory in FIXTURES.items():
            with self.subTest(schema=name):
                schema = self.schemas[name]
                self.assertEqual(
                    schema["$schema"], "http://json-schema.org/draft-07/schema#"
                )
                self.assertEqual(schema["$id"], f"frameworks/memory/{name}")
                self.assertFalse(schema["additionalProperties"])
                self.assertEqual(self.errors(name, factory()), [])

                stack: list[Any] = [schema]
                while stack:
                    node = stack.pop()
                    if isinstance(node, dict):
                        if node.get("type") == "object":
                            self.assertIs(
                                node.get("additionalProperties"),
                                False,
                                f"open object in {name}: {node}",
                            )
                        stack.extend(node.values())
                    elif isinstance(node, list):
                        stack.extend(node)

    def test_generated_identifiers_accept_v5_or_v7_and_reject_v4(self) -> None:
        v5_source = source_v2()
        v5_source["document_id"] = f"document_{UUID5}"
        v5_source["source_version_id"] = f"source-version_{UUID5}"
        v5_source["acquisition_id"] = f"acquisition_{UUID5}"
        self.assertEqual(self.errors("source-v2.schema.json", v5_source), [])

        cases = [
            ("source-v2.schema.json", source_v2(), "document_id", f"document_{UUID_V4}"),
            ("evidence-span-v2.schema.json", evidence_v2(), "evidence_id", f"evidence_{UUID_V4}"),
            (
                "extraction-artifact-v1.schema.json",
                extraction_artifact(),
                "extraction_id",
                f"extraction_{UUID_V4}",
            ),
            (
                "store-checkpoint-v1.schema.json",
                store_checkpoint(),
                "checkpoint_id",
                f"checkpoint_{UUID_V4}",
            ),
            (
                "purge-receipt-v1.schema.json",
                purge_receipt(),
                "purge_receipt_id",
                f"purge-receipt_{UUID_V4}",
            ),
        ]
        for name, fixture, field, value in cases:
            with self.subTest(schema=name, field=field):
                fixture[field] = value
                self.assert_invalid(name, fixture)

    def test_source_separates_identities_exact_bytes_and_rights(self) -> None:
        for field in (
            "document_id",
            "source_version_id",
            "acquisition_id",
            "source_object_id",
            "content_sha256",
        ):
            fixture = source_v2()
            del fixture[field]
            self.assert_invalid("source-v2.schema.json", fixture)

        unknown = source_v2()
        unknown["licence"]["classification"] = "unknown"
        unknown["licence"]["entitlement"] = "unknown"
        self.assert_invalid("source-v2.schema.json", unknown)
        unknown["rights"] = {
            "derivative_use": "prohibited",
            "embedding": "prohibited",
            "redistribution": "prohibited",
        }
        self.assertEqual(self.errors("source-v2.schema.json", unknown), [])
        expiring_unknown = copy.deepcopy(unknown)
        expiring_unknown["licence"]["expires_at"] = "2026-08-22T00:00:00Z"
        self.assertEqual(
            self.errors("source-v2.schema.json", expiring_unknown), []
        )

        extra = source_v2()
        extra["rights"]["training"] = "allowed"
        self.assert_invalid("source-v2.schema.json", extra)

    def test_evidence_binds_source_and_coordinate_artifact(self) -> None:
        for field in (
            "source_version_id",
            "acquisition_id",
            "source_object_id",
            "source_content_sha256",
        ):
            fixture = evidence_v2()
            del fixture[field]
            self.assert_invalid("evidence-span-v2.schema.json", fixture)

        for field in (
            "extraction_id",
            "coordinate_artifact_object_id",
            "coordinate_artifact_content_sha256",
            "coordinate_system_sha256",
            "image_region",
        ):
            fixture = evidence_v2()
            del fixture["locator"][field]
            self.assert_invalid("evidence-span-v2.schema.json", fixture)

        old_content_addressed_identity = evidence_v2()
        old_content_addressed_identity["evidence_id"] = (
            f"evidence:sha256:{digest('a')}#page-7"
        )
        self.assert_invalid("evidence-span-v2.schema.json", old_content_addressed_identity)

        ambiguous = evidence_v2()
        ambiguous["content"]["value"] = 7
        self.assert_invalid("evidence-span-v2.schema.json", ambiguous)

        image_region = evidence_v2()
        image_region["locator"].update(
            {
                "kind": "image-region",
                "ref": "image-1-region-1",
                "image_region": {
                    "x_min": 100_000,
                    "y_min": 200_000,
                    "x_max": 300_000,
                    "y_max": 400_000,
                },
            }
        )
        self.assertEqual(self.errors("evidence-span-v2.schema.json", image_region), [])
        image_region["locator"]["image_region"]["x_max"] = 1_000_001
        self.assert_invalid("evidence-span-v2.schema.json", image_region)

        non_image_region = evidence_v2()
        non_image_region["locator"]["image_region"] = {
            "x_min": 1,
            "y_min": 1,
            "x_max": 2,
            "y_max": 2,
        }
        self.assert_invalid("evidence-span-v2.schema.json", non_image_region)

    def test_extraction_binds_reproducibility_inputs_without_raw_parameters(self) -> None:
        for field in (
            "source_object",
            "output_object",
            "tool",
            "code",
            "parameters_sha256",
            "method",
            "coordinate_system",
        ):
            fixture = extraction_artifact()
            del fixture[field]
            self.assert_invalid("extraction-artifact-v1.schema.json", fixture)

        raw_parameters = extraction_artifact()
        raw_parameters["parameters"] = {"input_path": "/protected/source.pdf"}
        self.assert_invalid("extraction-artifact-v1.schema.json", raw_parameters)

        tool_extra = extraction_artifact()
        tool_extra["tool"]["command"] = "synthetic-extractor --secret redacted"
        self.assert_invalid("extraction-artifact-v1.schema.json", tool_extra)

    def test_checkpoint_commits_all_sets_prior_head_and_signature(self) -> None:
        for collection in ("manifests", "events", "receipts", "tombstones"):
            fixture = store_checkpoint()
            del fixture["commitments"][collection]
            self.assert_invalid("store-checkpoint-v1.schema.json", fixture)

        without_retired_state = store_checkpoint()
        del without_retired_state["retired_state"]
        self.assert_invalid("store-checkpoint-v1.schema.json", without_retired_state)

        incomplete_retired_key = store_checkpoint()
        del incomplete_retired_key["retired_state"]["object_keys"][0]["acquisition_id"]
        self.assert_invalid("store-checkpoint-v1.schema.json", incomplete_retired_key)

        append_without_prior = store_checkpoint()
        append_without_prior["prior_checkpoint"] = None
        self.assert_invalid("store-checkpoint-v1.schema.json", append_without_prior)

        genesis = store_checkpoint()
        genesis["mode"] = "genesis"
        genesis["sequence"] = 0
        genesis["prior_checkpoint"] = None
        self.assertEqual(self.errors("store-checkpoint-v1.schema.json", genesis), [])
        genesis["sequence"] = 1
        self.assert_invalid("store-checkpoint-v1.schema.json", genesis)

        bad_signature = store_checkpoint()
        bad_signature["signature"]["value"] = "short"
        self.assert_invalid("store-checkpoint-v1.schema.json", bad_signature)

    def test_purge_receipt_covers_closure_surfaces_tombstone_and_store_heads(self) -> None:
        for field in (
            "removed_targets",
            "removed_transitive_derivatives",
            "erasure_surfaces",
            "surviving_tombstone",
            "prior_checkpoint",
            "new_checkpoint",
            "authority",
            "signature",
        ):
            fixture = purge_receipt()
            del fixture[field]
            self.assert_invalid("purge-receipt-v1.schema.json", fixture)

        for surface in ("key_envelopes", "backups", "projections"):
            fixture = purge_receipt()
            del fixture["erasure_surfaces"][surface]
            self.assert_invalid("purge-receipt-v1.schema.json", fixture)

        no_events = purge_receipt()
        no_events["removed_targets"]["events"] = []
        self.assert_invalid("purge-receipt-v1.schema.json", no_events)
        no_objects = purge_receipt()
        no_objects["removed_targets"]["objects"] = []
        self.assertEqual(self.errors("purge-receipt-v1.schema.json", no_objects), [])

        for field in ("event_count", "events", "object_count", "objects", "closure_sha256"):
            missing_closure_field = purge_receipt()
            del missing_closure_field["removed_transitive_derivatives"][field]
            self.assert_invalid("purge-receipt-v1.schema.json", missing_closure_field)

        residue = purge_receipt()
        residue["erasure_surfaces"]["backups"]["residual_count"] = 1
        self.assert_invalid("purge-receipt-v1.schema.json", residue)

        unknown_reason = purge_receipt()
        unknown_reason["surviving_tombstone"]["reason_code"] = "free-form reason"
        self.assert_invalid("purge-receipt-v1.schema.json", unknown_reason)

    def test_purge_receipt_rejects_paths_secrets_and_free_form_rationale(self) -> None:
        hostile_extras = {
            "path": "/protected/object",
            "backup_location": "s3://sensitive-bucket/key",
            "key_envelope": "secret material",
            "reason": "protected free-form rationale",
            "notes": "protected excerpt",
        }
        for field, value in hostile_extras.items():
            fixture = purge_receipt()
            fixture[field] = value
            with self.subTest(field=field):
                self.assert_invalid("purge-receipt-v1.schema.json", fixture)

        nested_reason = purge_receipt()
        nested_reason["surviving_tombstone"]["reason"] = "free text"
        self.assert_invalid("purge-receipt-v1.schema.json", nested_reason)

    def test_purge_chain_genesis_and_structural_high_water_rules(self) -> None:
        append_without_prior = purge_receipt()
        append_without_prior["prior_purge_receipt_sha256"] = None
        self.assert_invalid("purge-receipt-v1.schema.json", append_without_prior)

        genesis = purge_receipt()
        genesis["mode"] = "genesis"
        genesis["purge_sequence"] = 1
        genesis["prior_purge_receipt_sha256"] = None
        genesis["prior_purge_high_water"] = 0
        self.assertEqual(self.errors("purge-receipt-v1.schema.json", genesis), [])
        genesis["purge_sequence"] = 2
        self.assert_invalid("purge-receipt-v1.schema.json", genesis)

        negative_high_water = purge_receipt()
        negative_high_water["new_purge_high_water"] = -1
        self.assert_invalid("purge-receipt-v1.schema.json", negative_high_water)

    def test_every_clock_requires_timezone_aware_rfc3339(self) -> None:
        cases = [
            ("source-v2.schema.json", source_v2(), ("acquired_at",)),
            (
                "source-v2.schema.json",
                source_v2(),
                ("licence", "expires_at"),
            ),
            (
                "extraction-artifact-v1.schema.json",
                extraction_artifact(),
                ("created_at",),
            ),
            (
                "store-checkpoint-v1.schema.json",
                store_checkpoint(),
                ("created_at",),
            ),
            (
                "purge-receipt-v1.schema.json",
                purge_receipt(),
                ("completed_at",),
            ),
            (
                "purge-receipt-v1.schema.json",
                purge_receipt(),
                ("erasure_surfaces", "key_envelopes", "verified_at"),
            ),
            (
                "purge-receipt-v1.schema.json",
                purge_receipt(),
                ("authority", "authorized_at"),
            ),
        ]
        for name, fixture, path in cases:
            with self.subTest(schema=name, path=path):
                cursor = fixture
                for component in path[:-1]:
                    cursor = cursor[component]
                cursor[path[-1]] = "2026-08-21T05:00:00"
                self.assert_invalid(name, fixture)

    def test_top_level_and_nested_objects_reject_unrecognized_fields(self) -> None:
        for name, factory in FIXTURES.items():
            fixture = factory()
            fixture["unexpected"] = True
            self.assert_invalid(name, fixture)

        nested_cases = [
            ("source-v2.schema.json", source_v2(), ("licence",)),
            ("evidence-span-v2.schema.json", evidence_v2(), ("locator",)),
            (
                "extraction-artifact-v1.schema.json",
                extraction_artifact(),
                ("coordinate_system",),
            ),
            (
                "store-checkpoint-v1.schema.json",
                store_checkpoint(),
                ("commitments", "events"),
            ),
            (
                "purge-receipt-v1.schema.json",
                purge_receipt(),
                ("authority",),
            ),
        ]
        for name, fixture, path in nested_cases:
            cursor = fixture
            for component in path:
                cursor = cursor[component]
            cursor["unexpected"] = True
            self.assert_invalid(name, fixture)


if __name__ == "__main__":
    unittest.main()
