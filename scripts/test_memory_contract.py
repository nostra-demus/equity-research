#!/usr/bin/env python3
"""Regression tests for canonical memory JSON Schemas and semantic helpers."""
from __future__ import annotations

import copy
import json
import math
import re
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

import memory_contract as contract  # noqa: E402
from validate_screener_json import Checker  # noqa: E402


UUID1 = "01890f47-6a2b-7cc1-8e91-1234567890ab"
UUID2 = "01890f47-6a2b-7cc1-9e91-1234567890ab"
UUID3 = "01890f47-6a2b-7cc1-ae91-1234567890ab"
UUID5 = "15b8c74a-0ec3-52c8-9bf1-5d15a1d5a1ab"
DIGEST_A = "a" * 64
DIGEST_B = "b" * 64
ISSUER = "issuer:lei:5493001KJTIIGC8Y1R12"
EVIDENCE = f"evidence:sha256:{DIGEST_A}#page-42"


def source_payload() -> dict:
    return {
        "schema": "memory-source/v1",
        "source_id": f"source:sha256:{DIGEST_A}",
        "document_id": f"document_{UUID1}",
        "title": "FY26 audited annual report",
        "issuer_ids": [ISSUER],
        "source_tier": 1,
        "publication_date": "2026-06-30",
        "filing_date": "2026-07-01",
        "effective_date": "2026-03-31",
        "language": "en-IN",
        "licence": {
            "name": None,
            "uri": None,
            "expires_at": None,
            "derived_data": "allowed",
        },
        "uri": "https://example.test/annual-report.pdf",
        "content_sha256": f"sha256:{DIGEST_A}",
        "mime_type": "application/pdf",
        "byte_length": 12345,
        "extraction_status": "succeeded",
    }


def evidence_payload() -> dict:
    return {
        "schema": "memory-evidence-span/v1",
        "evidence_id": EVIDENCE,
        "source_id": f"source:sha256:{DIGEST_A}",
        "source_sha256": f"sha256:{DIGEST_A}",
        "locator": {
            "kind": "page",
            "ref": "page-42",
            "page": 42,
            "section": "Debt",
            "table": None,
            "cell": None,
            "char_start": None,
            "char_end": None,
        },
        "language": "en",
        "verbatim_text": "Debt due in FY27 was INR 500 crore.",
        "extraction_method": "native-text",
        "extraction_tool": "pdftotext",
        "extraction_version": "24.02",
        "extraction_confidence": 1.0,
    }


def claim_payload(*, status: str = "supported") -> dict:
    quality = {"supported": 5, "inference": 1, "not-proven": 0}[status]
    return {
        "schema": "memory-claim/v1",
        "claim_id": f"claim_{UUID1}",
        "subject_id": ISSUER,
        "predicate": "debt.maturity",
        "value": 500,
        "unit": "INR crore",
        "currency": "INR",
        "accounting_standard": "Ind AS",
        "period": {"from": "2026-04-01", "to": "2027-03-31", "label": "FY27"},
        "scope": {
            "consolidation": "consolidated",
            "segment": None,
            "geography": "India",
            "security_id": None,
        },
        "qualifier": "Reported contractual maturity; excludes undrawn facilities.",
        "basis": "FY26 Annual Report, Note 18, p.42.",
        "epistemic_status": status,
        "claim_quality": quality,
        "evidence_refs": [EVIDENCE] if status == "supported" else [],
        "derived_from_claims": [],
        "material": True,
    }


def relationship_payload() -> dict:
    return {
        "schema": "memory-relationship/v1",
        "relationship_id": f"rel_{UUID1}",
        "relationship_type": "contradicts",
        "source_ref": f"claim_{UUID1}",
        "target_ref": f"claim_{UUID2}",
        "qualifier": "Same period and scope; values disagree.",
        "evidence_refs": [EVIDENCE],
    }


def tombstone_payload(*, target_event_id: str = f"evt_{UUID1}") -> dict:
    return {
        "schema": "memory-tombstone/v1",
        "target_event_id": target_event_id,
        "reason_code": "retention-ended",
        "basis": "retention-policy",
        "basis_id": f"basis_{UUID5}",
    }


def namespace_rows() -> list[dict]:
    return [{"name": name, **copy.deepcopy(rule)} for name, rule in contract.NAMESPACE_RULES.items()]


def identity_registry() -> dict:
    values = [
        ("issuer:lei:5493001KJTIIGC8Y1R12", "issuer:lei", "issuer"),
        ("security:figi:BBG000B9XRY4", "security:figi", "security"),
        ("security:isin:US0378331005", "security:isin", "security"),
        ("security:mic-ticker:XNAS:AAPL", "security:mic-ticker", "security"),
        ("entity:internal:us-fed", "entity:internal", "entity"),
        (f"run_{UUID1}", "run", "run"),
        (f"forecast_{UUID1}", "forecast", "forecast"),
        (f"claim_{UUID1}", "claim", "claim"),
        (f"source:sha256:{DIGEST_A}", "source", "source"),
    ]
    return {
        "schema": "memory-identity-registry/v1",
        "registry_id": f"identity-registry_{UUID1}",
        "generated_at": "2026-08-20T14:03:00+05:30",
        "namespaces": namespace_rows(),
        "identities": [
            {
                "id": identifier,
                "namespace": namespace,
                "entity_kind": kind,
                "canonical_id": identifier,
                "status": "active",
                "valid_time": {"from": "2026-01-01", "to": None},
                "aliases": [],
            }
            for identifier, namespace, kind in values
        ],
    }


def event(payload: dict | None = None, *, event_id: str | None = None, system_time: str = "2026-08-20T14:03:00Z") -> dict:
    payload = copy.deepcopy(payload) if payload is not None else {
        "legacy_schema": "decision-record/v1",
        "source_path": "analyses/ACME/decision_record.json",
        "record": {"decision": "Watchlist"},
    }
    payload_schema = payload.get("schema")
    domain = {
        "memory-source/v1": "source",
        "memory-evidence-span/v1": "evidence",
        "memory-claim/v1": "claim",
        "memory-relationship/v1": "relationship",
        "memory-identity-registry/v1": "identity",
    }.get(payload_schema, "decision")
    evidence_refs = payload.get("evidence_refs", []) if domain in {"claim", "relationship"} else []
    subject_ids = [ISSUER]
    row = {
        "schema": "memory-event/v1",
        "event_id": event_id or f"evt_{UUID1}",
        "event_type": domain + ".recorded",
        "subject_ids": subject_ids,
        "valid_time": {"from": "2026-03-31", "to": None},
        "system_time": system_time,
        "producer": {
            "kind": "adapter",
            "name": "legacy-decision-adapter",
            "runtime": "python",
            "model": None,
            "prompt_program_sha": "git:" + "f" * 40,
        },
        "run_id": f"run_{UUID5}",
        "trace_id": "1" * 32,
        "payload": payload,
        "evidence_refs": evidence_refs,
        "derived_from": [],
        "supersedes": [],
        "integrity": {"payload_sha256": "0" * 64, "signature": None},
        "policy": {"classification": "internal", "retention": "permanent", "retain_until": None},
    }
    return contract.seal_event(row)


SCHEMA_FIXTURES = {
    "source-v1.schema.json": source_payload,
    "evidence-span-v1.schema.json": evidence_payload,
    "claim-v1.schema.json": claim_payload,
    "relationship-v1.schema.json": relationship_payload,
    "identity-registry-v1.schema.json": identity_registry,
    "tombstone-v1.schema.json": tombstone_payload,
    "event-v1.schema.json": event,
}


_MALFORMED_JSON_SHAPES = (None, True, 0, "", [], {})


def _single_node_mutations(value, path: str = "$"):
    """Yield copies with one JSON node replaced by a hostile container/scalar shape."""
    for replacement in _MALFORMED_JSON_SHAPES:
        yield path, copy.deepcopy(replacement)
    if isinstance(value, dict):
        for key, child in value.items():
            for child_path, mutated_child in _single_node_mutations(child, f"{path}.{key}"):
                mutated = copy.deepcopy(value)
                mutated[key] = mutated_child
                yield child_path, mutated
    elif isinstance(value, list):
        for index, child in enumerate(value):
            for child_path, mutated_child in _single_node_mutations(child, f"{path}[{index}]"):
                mutated = copy.deepcopy(value)
                mutated[index] = mutated_child
                yield child_path, mutated


class JsonSchemaContractTests(unittest.TestCase):
    def test_every_schema_is_valid_json_closed_and_accepts_its_fixture(self) -> None:
        expected_ids = {f"frameworks/memory/{name}" for name in SCHEMA_FIXTURES}
        observed_ids = set()
        for name, fixture_factory in SCHEMA_FIXTURES.items():
            schema = json.loads((ROOT / "frameworks/memory" / name).read_text(encoding="utf-8"))
            observed_ids.add(schema["$id"])
            self.assertEqual(schema["$schema"], "http://json-schema.org/draft-07/schema#")
            self.assertFalse(schema["additionalProperties"], name)
            checker = Checker(schema)
            fixture = fixture_factory()
            checker.check(schema, fixture, "")
            self.assertEqual(checker.errors, [], f"{name}: {checker.errors}")
        self.assertEqual(observed_ids, expected_ids)

    def test_event_schema_requires_the_entire_shared_envelope(self) -> None:
        schema = json.loads((ROOT / "frameworks/memory/event-v1.schema.json").read_text())
        self.assertEqual(
            schema["required"],
            [
                "schema", "event_id", "event_type", "subject_ids", "valid_time", "system_time",
                "producer", "run_id", "trace_id", "payload", "evidence_refs", "derived_from",
                "supersedes", "integrity", "policy",
            ],
        )
        self.assertEqual(set(schema["properties"]["policy"]["properties"]["classification"]["enum"]), contract.CLASSIFICATIONS)
        self.assertEqual(set(schema["properties"]["policy"]["properties"]["retention"]["enum"]), contract.RETENTIONS)

        retained_content = event()
        retained_content["policy"]["retention"] = "tombstone-only"
        checker = Checker(schema)
        checker.check(schema, retained_content, "")
        self.assertTrue(any(error.startswith("payload") for error in checker.errors), checker.errors)

        retained_tombstone = event(tombstone_payload())
        checker = Checker(schema)
        checker.check(schema, retained_tombstone, "")
        self.assertTrue(any(error.startswith("policy.retention") for error in checker.errors), checker.errors)

    def test_schemas_reject_structural_extras_and_supported_claim_without_evidence(self) -> None:
        event_schema = json.loads((ROOT / "frameworks/memory/event-v1.schema.json").read_text())
        invalid_event = event()
        invalid_event["mutable"] = True
        checker = Checker(event_schema)
        checker.check(event_schema, invalid_event, "")
        self.assertTrue(any("additional property" in error for error in checker.errors))

        claim_schema = json.loads((ROOT / "frameworks/memory/claim-v1.schema.json").read_text())
        invalid_claim = claim_payload()
        invalid_claim["evidence_refs"] = []
        checker = Checker(claim_schema)
        checker.check(claim_schema, invalid_claim, "")
        self.assertTrue(any("minItems" in error for error in checker.errors), checker.errors)

        long_event_type = event()
        long_event_type["event_type"] = "a." + "b" * 127
        checker = Checker(event_schema)
        checker.check(event_schema, long_event_type, "")
        self.assertTrue(any("maxLength 128" in error for error in checker.errors), checker.errors)
        self.assertTrue(
            any(error.startswith("event_type") for error in contract.validate_event(long_event_type))
        )

    def test_schema_datetime_fractions_are_limited_to_six_digits(self) -> None:
        event_schema = json.loads(
            (ROOT / "frameworks/memory/event-v1.schema.json").read_text()
        )
        source_schema = json.loads(
            (ROOT / "frameworks/memory/source-v1.schema.json").read_text()
        )
        identity_schema = json.loads(
            (ROOT / "frameworks/memory/identity-registry-v1.schema.json").read_text()
        )
        patterns = (
            event_schema["$defs"]["awareDateTime"]["pattern"],
            source_schema["$defs"]["awareDateTime"]["pattern"],
            identity_schema["properties"]["generated_at"]["pattern"],
            identity_schema["$defs"]["validEndpoint"]["oneOf"][1]["pattern"],
        )
        for pattern in patterns:
            for accepted in (
                "2026-08-20T14:03:00Z",
                "2026-08-20T14:03:00.1Z",
                "2026-08-20T14:03:00.123456+05:30",
            ):
                self.assertIsNotNone(re.fullmatch(pattern, accepted), (pattern, accepted))
            self.assertIsNone(
                re.fullmatch(pattern, "2026-08-20T14:03:00.1234567Z"),
                pattern,
            )

        fractional_event = event(system_time="2026-08-20T14:03:00.1Z")
        checker = Checker(event_schema)
        checker.check(event_schema, fractional_event, "")
        self.assertEqual(checker.errors, [])
        self.assertEqual(
            contract.parse_aware_datetime(fractional_event["system_time"]).microsecond,
            100000,
        )

    def test_schema_memory_refs_and_security_ids_use_only_canonical_v1_forms(self) -> None:
        claim_schema = json.loads(
            (ROOT / "frameworks/memory/claim-v1.schema.json").read_text()
        )
        relationship_schema = json.loads(
            (ROOT / "frameworks/memory/relationship-v1.schema.json").read_text()
        )
        ref_patterns = (
            claim_schema["$defs"]["memoryRef"]["pattern"],
            relationship_schema["$defs"]["memoryRef"]["pattern"],
        )
        canonical_refs = (
            ISSUER,
            "security:figi:BBG000B9XRY4",
            "security:isin:US0378331005",
            "security:mic-ticker:XNAS:AAPL",
            "entity:internal:unresolved-issuer",
            f"evt_{UUID1}",
            f"run_{UUID1}",
            f"claim_{UUID1}",
            f"forecast_{UUID1}",
            f"rel_{UUID1}",
            f"source:sha256:{DIGEST_A}",
            EVIDENCE,
        )
        malformed_reserved_refs = (
            "issuer:lei:BAD",
            "security:figi:X",
            "security:isin:X",
            "source:sha256:notahash",
            f"evidence:sha256:{DIGEST_A}",
            "evidence:sha256:abc#page-1",
        )
        for pattern in ref_patterns:
            for reference in canonical_refs:
                self.assertIsNotNone(re.fullmatch(pattern, reference), reference)
            for reference in malformed_reserved_refs:
                self.assertIsNone(re.fullmatch(pattern, reference), reference)

        security_pattern = claim_schema["properties"]["scope"]["properties"][
            "security_id"
        ]["oneOf"][1]["pattern"]
        for security_id in canonical_refs[1:4]:
            self.assertIsNotNone(re.fullmatch(security_pattern, security_id), security_id)
        for invalid in ("security:ticker:AAPL", "security:figi:X", ISSUER):
            self.assertIsNone(re.fullmatch(security_pattern, invalid), invalid)

        no_evidence = relationship_payload()
        no_evidence["evidence_refs"] = []
        checker = Checker(relationship_schema)
        checker.check(relationship_schema, no_evidence, "")
        self.assertTrue(any("minItems" in error for error in checker.errors), checker.errors)

        mixed_kind = relationship_payload()
        mixed_kind["relationship_type"] = "same_as"
        mixed_kind["target_ref"] = f"source:sha256:{DIGEST_A}"
        checker = Checker(relationship_schema)
        checker.check(relationship_schema, mixed_kind, "")
        self.assertTrue(any("oneOf" in error for error in checker.errors), checker.errors)


class DigestAndEnvelopeTests(unittest.TestCase):
    def test_payload_hash_is_canonical_and_seal_does_not_mutate(self) -> None:
        left = {"z": 1.0, "a": [True, None, "₹"]}
        right = {"a": [True, None, "₹"], "z": 1}
        self.assertEqual(contract.payload_sha256(left), contract.payload_sha256(right))
        original = event()
        original["integrity"]["payload_sha256"] = "0" * 64
        sealed = contract.seal_event(original)
        self.assertEqual(original["integrity"]["payload_sha256"], "0" * 64)
        self.assertEqual(sealed["integrity"]["payload_sha256"], contract.payload_sha256(sealed["payload"]))
        self.assertRegex(contract.event_sha256(sealed), r"^[0-9a-f]{64}$")

    def test_valid_legacy_and_each_typed_event(self) -> None:
        self.assertEqual(contract.validate_event(event()), [])
        for payload in (source_payload(), evidence_payload(), claim_payload(), relationship_payload(), identity_registry()):
            self.assertEqual(contract.validate_event(event(payload)), [], payload["schema"])

    def test_uuid5_legacy_ids_and_nullable_run_trace_metadata_are_valid(self) -> None:
        row = event(event_id=f"evt_{UUID5}")
        row["run_id"] = None
        row["trace_id"] = None
        row["producer"]["runtime"] = None
        row["producer"]["prompt_program_sha"] = None
        self.assertEqual(contract.validate_event(row), [])

    def test_only_deterministic_v5_or_time_ordered_v7_ids_are_accepted(self) -> None:
        row = event(event_id="evt_550e8400-e29b-41d4-a716-446655440000")
        self.assertTrue(any(error.startswith("event_id") for error in contract.validate_event(row)))
        row = event()
        row["trace_id"] = "0" * 32
        self.assertTrue(any(error.startswith("trace_id") for error in contract.validate_event(row)))

    def test_timezone_rules_reject_naive_or_malformed_times(self) -> None:
        row = event()
        row["system_time"] = "2026-08-20T14:03:00"
        self.assertTrue(any(error.startswith("system_time") for error in contract.validate_event(row)))
        row = event()
        row["valid_time"] = {"from": "2026-08-20T14:03:00", "to": None}
        self.assertTrue(any(error.startswith("valid_time.from") for error in contract.validate_event(row)))
        row = event()
        row["valid_time"] = {"from": "2026-08-21", "to": "2026-08-20"}
        self.assertIn("valid_time — from must be less than or equal to to", contract.validate_event(row))
        row = event()
        row["valid_time"] = {"from": "2026-08-20", "to": "2026-08-21T00:00:00Z"}
        self.assertIn("valid_time — from and to must use the same precision (date or date-time)", contract.validate_event(row))

    def test_runtime_datetime_fractions_are_limited_to_six_digits(self) -> None:
        for fraction in ("1", "12", "123", "1234", "12345", "123456"):
            accepted = f"2026-08-20T14:03:00.{fraction}+05:30"
            self.assertEqual(contract.validate_event(event(system_time=accepted)), [])
        row = event(system_time="2026-08-20T14:03:00.1234567Z")
        self.assertTrue(
            any(error.startswith("system_time") for error in contract.validate_event(row))
        )
        self.assertIsNone(
            contract.AWARE_DATETIME_RE.fullmatch(
                "2026-08-20T14:03:00.1234567Z"
            )
        )

    def test_datetime_parser_caches_strings_after_fail_closed_type_check(self) -> None:
        contract._parse_aware_datetime_text.cache_clear()
        value = "2026-08-20T14:03:00.1Z"
        first = contract.parse_aware_datetime(value)
        second = contract.parse_aware_datetime(value)
        self.assertIs(first, second)
        cache = contract._parse_aware_datetime_text.cache_info()
        self.assertEqual((cache.hits, cache.misses), (1, 1))
        with self.assertRaisesRegex(ValueError, "canonical timezone-aware"):
            contract.parse_aware_datetime([])  # type: ignore[arg-type]

    def test_aware_offsets_and_instant_valid_time_are_valid(self) -> None:
        row = event(system_time="2026-08-20T19:33:00+05:30")
        row["valid_time"] = {"from": "2026-03-31T00:00:00+05:30", "to": "2026-04-01T00:00:00+05:30"}
        row = contract.seal_event(row)
        self.assertEqual(contract.validate_event(row), [])

    def test_hash_tampering_and_noncanonical_payload_fail_closed(self) -> None:
        row = event()
        row["payload"]["record"]["decision"] = "Buy"
        self.assertTrue(any(error.startswith("integrity.payload_sha256") for error in contract.validate_event(row)))
        row = event()
        row["payload"]["nan"] = math.nan
        row["integrity"]["payload_sha256"] = "0" * 64
        errors = contract.validate_event(row)
        self.assertTrue(any("not canonical JSON" in error for error in errors), errors)
        row = event()
        row["integrity"]["signature"] = "ed25519:not-actually-verified"
        errors = contract.validate_event(row)
        self.assertTrue(any("trust store" in error for error in errors), errors)
        with self.assertRaisesRegex(ValueError, "must be null"):
            contract.seal_event(row)
        schema = json.loads((ROOT / "frameworks/memory/event-v1.schema.json").read_text())
        checker = Checker(schema)
        checker.check(schema, row, "")
        self.assertTrue(any("expected type null" in error for error in checker.errors), checker.errors)

    def test_closed_shape_reference_formats_and_uniqueness(self) -> None:
        row = event()
        row["unknown"] = 1
        row["subject_ids"] *= 2
        row["evidence_refs"] = ["evidence:sha256:BAD#page"]
        row["derived_from"] = ["evt_bad"]
        errors = contract.validate_event(row)
        self.assertTrue(any("additional property" in error for error in errors))
        self.assertTrue(any("duplicate value" in error for error in errors))
        self.assertTrue(any(error.startswith("evidence_refs[0]") for error in errors))
        self.assertTrue(any(error.startswith("derived_from[0]") for error in errors))
        row = event()
        row["subject_ids"] = ["security:ticker:TEST"]
        self.assertTrue(any(error.startswith("subject_ids[0]") for error in contract.validate_event(row)))

    def test_malformed_container_types_return_errors_instead_of_raising(self) -> None:
        row = event()
        row["producer"]["kind"] = []
        row["policy"]["classification"] = {}
        row[7] = "non-JSON-key"
        errors = contract.validate_event(row)
        self.assertTrue(any(error.startswith("producer.kind") for error in errors))
        self.assertTrue(any(error.startswith("policy.classification") for error in errors))
        self.assertTrue(any("object key 7" in error for error in errors))

        payload = evidence_payload()
        payload["locator"]["kind"] = []
        errors = contract.validate_evidence_span(payload)
        self.assertTrue(any(error.startswith("locator.kind") for error in errors), errors)

        payload = source_payload()
        payload["licence"]["derived_data"] = []
        errors = contract.validate_event(event(payload))
        self.assertTrue(any("derived_data" in error for error in errors), errors)

    def test_every_public_validator_fails_closed_for_single_node_json_mutations(self) -> None:
        cases = (
            ("valid_time", contract.validate_valid_time, {"from": "2026-01-01", "to": None}),
            ("source", contract.validate_source, source_payload()),
            ("evidence", contract.validate_evidence_span, evidence_payload()),
            ("claim", contract.validate_claim, claim_payload()),
            ("relationship", contract.validate_relationship, relationship_payload()),
            ("identity_id", contract.validate_identity_id, ISSUER),
            ("identity_registry", contract.validate_identity_registry, identity_registry()),
            ("tombstone", contract.validate_tombstone, tombstone_payload()),
            ("payload_dispatch", contract.validate_payload, source_payload()),
            ("event", contract.validate_event, event(source_payload())),
            ("event_collection", contract.validate_events, [event(source_payload())]),
        )
        for validator_name, validator, fixture in cases:
            for path, mutated in _single_node_mutations(fixture):
                with self.subTest(validator=validator_name, path=path, shape=type(mutated).__name__):
                    errors = validator(mutated)
                    self.assertIsInstance(errors, list)
                    self.assertTrue(all(isinstance(error, str) for error in errors), errors)

    def test_policy_is_closed_and_expiry_is_coupled_to_retention(self) -> None:
        row = event()
        row["policy"] = {"classification": "secret", "retention": "forever", "retain_until": None}
        errors = contract.validate_event(row)
        self.assertTrue(any(error.startswith("policy.classification") for error in errors))
        self.assertTrue(any(error.startswith("policy.retention") for error in errors))
        row = event()
        row["policy"] = {"classification": "licensed", "retention": "expires", "retain_until": None}
        self.assertIn("policy.retain_until — is required when retention is 'expires'", contract.validate_event(row))
        row["policy"]["retain_until"] = "2027-01-01T00:00:00Z"
        self.assertEqual(contract.validate_event(row), [])
        row["policy"]["retain_until"] = "2026-01-01T00:00:00Z"
        self.assertTrue(any("later than system_time" in error for error in contract.validate_event(row)))
        row = event()
        row["policy"]["retain_until"] = "2027-01-01T00:00:00Z"
        self.assertTrue(any(error.startswith("policy.retain_until") for error in contract.validate_event(row)))

    def test_tombstone_retention_is_reserved_for_closed_non_content_payloads(self) -> None:
        legacy = event()
        legacy["policy"]["retention"] = "tombstone-only"
        self.assertTrue(
            any("requires a memory-tombstone/v1 payload" in error for error in contract.validate_event(legacy))
        )

        typed = event(claim_payload())
        typed["policy"]["retention"] = "tombstone-only"
        self.assertTrue(
            any("requires a memory-tombstone/v1 payload" in error for error in contract.validate_event(typed))
        )

        payload = tombstone_payload()
        payload["reason_text"] = "Remove the confidential source text: secret revenue was 123."
        errors = contract.validate_tombstone(payload)
        self.assertTrue(any("additional property" in error for error in errors), errors)

        payload = tombstone_payload()
        payload["reason_code"] = "customer said the secret was wrong"
        payload["basis_id"] = "case-that-contains-sensitive-narrative"
        errors = contract.validate_tombstone(payload)
        self.assertTrue(any(error.startswith("reason_code") for error in errors), errors)
        self.assertTrue(any(error.startswith("basis_id") for error in errors), errors)

        row = event(tombstone_payload())
        row["policy"]["retention"] = "permanent"
        row = contract.seal_event(row)
        self.assertTrue(any("must equal 'tombstone-only'" in error for error in contract.validate_event(row)))

    def test_valid_tombstone_supersedes_exactly_one_typed_target(self) -> None:
        target = event(
            claim_payload(),
            event_id=f"evt_{UUID1}",
            system_time="2026-08-20T10:00:00Z",
        )
        tombstone = event(
            tombstone_payload(target_event_id=target["event_id"]),
            event_id=f"evt_{UUID2}",
            system_time="2026-08-20T11:00:00Z",
        )
        tombstone["event_type"] = target["event_type"]
        tombstone["subject_ids"] = copy.deepcopy(target["subject_ids"])
        tombstone["supersedes"] = [target["event_id"]]
        tombstone["policy"] = {
            "classification": "internal",
            "retention": "tombstone-only",
            "retain_until": None,
        }
        tombstone = contract.seal_event(tombstone)
        index = {target["event_id"]: target, tombstone["event_id"]: tombstone}
        self.assertEqual(contract.validate_tombstone(tombstone["payload"]), [])
        self.assertEqual(contract.validate_event(tombstone, event_index=index), [])
        self.assertEqual(contract.validate_events([target, tombstone]), [])

        existence_leaking = copy.deepcopy(tombstone)
        existence_leaking["evidence_refs"] = [EVIDENCE]
        existence_leaking["derived_from"] = [f"evt_{UUID3}"]
        errors = contract.validate_event(existence_leaking)
        self.assertIn("evidence_refs — must be empty for a tombstone", errors)
        self.assertIn("derived_from — must be empty for a tombstone", errors)

        mismatched = copy.deepcopy(tombstone)
        mismatched["supersedes"] = [f"evt_{UUID3}"]
        errors = contract.validate_event(mismatched, event_index=index)
        self.assertTrue(any("payload.target_event_id" in error for error in errors), errors)

        existence_leak = copy.deepcopy(tombstone)
        existence_leak["evidence_refs"] = [f"evidence:sha256:{DIGEST_A}#secret-locator"]
        existence_leak["derived_from"] = [target["event_id"]]
        errors = contract.validate_event(existence_leak, event_index=index)
        self.assertTrue(any(error.startswith("evidence_refs") for error in errors), errors)
        self.assertTrue(any(error.startswith("derived_from") for error in errors), errors)

    def test_typed_payload_dispatch_requires_domain_and_lineage_alignment(self) -> None:
        row = event(claim_payload())
        row["event_type"] = "source.recorded"
        row["subject_ids"] = ["issuer:lei:AAAAAAAAAAAAAAAAAAAA"]
        row["evidence_refs"] = []
        errors = contract.validate_event(row)
        self.assertTrue(any(error.startswith("event_type") for error in errors))
        self.assertTrue(any("payload.subject_id" in error for error in errors))
        self.assertTrue(any("payload.evidence_refs" in error for error in errors))
        row = event()
        row["payload"] = {"schema": "memory-unknown/v1"}
        row = contract.seal_event(row)
        self.assertTrue(any("unsupported typed payload" in error for error in contract.validate_event(row)))

        row = event()
        row["event_type"] = "claim.asserted"
        row["producer"]["kind"] = "agent"
        errors = contract.validate_event(row)
        self.assertTrue(any(error.startswith("payload.schema") for error in errors), errors)

    def test_source_licence_restrictions_fail_closed_at_the_envelope(self) -> None:
        payload = source_payload()
        payload["licence"]["derived_data"] = "prohibited"
        row = event(payload)
        errors = contract.validate_event(row)
        self.assertTrue(any(error.startswith("policy.classification") for error in errors), errors)
        self.assertTrue(any(error.startswith("policy.retention") for error in errors), errors)

        row["policy"] = {
            "classification": "licensed",
            "retention": "source-policy",
            "retain_until": None,
        }
        row = contract.seal_event(row)
        self.assertEqual(contract.validate_event(row), [])

        payload = source_payload()
        payload["licence"]["expires_at"] = "2027-01-01T00:00:00Z"
        row = event(payload)
        row["policy"] = {
            "classification": "licensed",
            "retention": "expires",
            "retain_until": "2027-01-02T00:00:00Z",
        }
        row = contract.seal_event(row)
        self.assertTrue(any("cannot be later" in error for error in contract.validate_event(row)))

    def test_source_availability_dates_cannot_postdate_system_time(self) -> None:
        row = event(source_payload(), system_time="2026-06-30T23:59:59Z")
        errors = contract.validate_event(row)
        self.assertFalse(any(error.startswith("payload.publication_date") for error in errors), errors)
        self.assertTrue(any(error.startswith("payload.filing_date") for error in errors), errors)

        row = event(source_payload(), system_time="2026-07-01T00:00:00Z")
        self.assertEqual(contract.validate_event(row), [])

        offset_payload = source_payload()
        offset_payload["publication_date"] = "2026-07-01"
        offset_payload["filing_date"] = "2026-07-01"
        row = event(offset_payload, system_time="2026-07-01T00:30:00+05:30")
        self.assertEqual(contract.validate_event(row), [])

    def test_identity_registry_generation_cannot_postdate_system_time(self) -> None:
        at_generation = event(
            identity_registry(), system_time="2026-08-20T08:33:00Z"
        )
        self.assertEqual(contract.validate_event(at_generation), [])

        before_generation = event(
            identity_registry(), system_time="2026-08-20T08:32:59.999999Z"
        )
        errors = contract.validate_event(before_generation)
        self.assertIn(
            "payload.generated_at — must not be later than envelope system_time",
            errors,
        )


class TypedPayloadTests(unittest.TestCase):
    def test_source_content_addresses_must_agree(self) -> None:
        payload = source_payload()
        self.assertEqual(contract.validate_source(payload), [])
        payload["content_sha256"] = f"sha256:{DIGEST_B}"
        self.assertIn("source_id — digest must equal content_sha256", contract.validate_source(payload))
        payload = source_payload()
        payload["source_tier"] = 11
        self.assertTrue(any(error.startswith("source_tier") for error in contract.validate_source(payload)))
        payload = source_payload()
        payload["licence"]["expires_at"] = "2027-01-01"
        self.assertTrue(any(error.startswith("licence.expires_at") for error in contract.validate_source(payload)))

    def test_malformed_typed_arrays_never_raise(self) -> None:
        payload = source_payload()
        payload["issuer_ids"] = [{}]
        errors = contract.validate_event(event(payload))
        self.assertTrue(any("issuer_ids[0]" in error for error in errors), errors)

        registry = identity_registry()
        registry["identities"][0]["canonical_id"] = {}
        registry["identities"][1]["aliases"] = [{}]
        errors = contract.validate_identity_registry(registry)
        self.assertTrue(any("canonical_id" in error for error in errors), errors)
        self.assertTrue(any("aliases[0]" in error for error in errors), errors)

    def test_evidence_requires_one_verbatim_form_and_exact_source_locator(self) -> None:
        payload = evidence_payload()
        self.assertEqual(contract.validate_evidence_span(payload), [])
        payload["verbatim_value"] = 500
        self.assertTrue(any("exactly one" in error for error in contract.validate_evidence_span(payload)))
        payload = evidence_payload()
        payload["evidence_id"] = f"evidence:sha256:{DIGEST_B}#other"
        errors = contract.validate_evidence_span(payload)
        self.assertTrue(any("locator fragment" in error for error in errors))
        self.assertTrue(any("digest must agree" in error for error in errors))
        payload = evidence_payload()
        payload["locator"] = {
            "kind": "character", "ref": "chars-10-5", "page": None, "section": None,
            "table": None, "cell": None, "char_start": 10, "char_end": 5,
        }
        payload["evidence_id"] = f"evidence:sha256:{DIGEST_A}#chars-10-5"
        self.assertTrue(any("char_start" in error for error in contract.validate_evidence_span(payload)))

    def test_claim_object_value_exclusive_and_period_scope_qualified(self) -> None:
        payload = claim_payload()
        self.assertEqual(contract.validate_claim(payload), [])
        payload["object_id"] = f"claim_{UUID2}"
        self.assertTrue(any("exactly one" in error for error in contract.validate_claim(payload)))
        payload = claim_payload()
        payload["period"] = {"from": None, "to": None, "label": None}
        payload["scope"]["consolidation"] = "segment"
        errors = contract.validate_claim(payload)
        self.assertTrue(any(error.startswith("period") for error in errors))
        self.assertTrue(any(error.startswith("scope.segment") for error in errors))
        payload = claim_payload()
        payload["qualifier"] = ""
        payload["basis"] = ""
        errors = contract.validate_claim(payload)
        self.assertTrue(any(error.startswith("qualifier") for error in errors))
        self.assertTrue(any(error.startswith("basis") for error in errors))

    def test_claim_scope_security_id_requires_a_builtin_canonical_security(self) -> None:
        for security_id in (
            "security:figi:BBG000B9XRY4",
            "security:isin:US0378331005",
            "security:mic-ticker:XNAS:AAPL",
        ):
            payload = claim_payload()
            payload["scope"]["security_id"] = security_id
            self.assertEqual(contract.validate_claim(payload), [], security_id)

        for invalid in (
            "security:ticker:AAPL",
            "security:figi:X",
            "security:internal:unverified",
            ISSUER,
        ):
            payload = claim_payload()
            payload["scope"]["security_id"] = invalid
            errors = contract.validate_claim(payload)
            self.assertTrue(
                any(error.startswith("scope.security_id") for error in errors),
                (invalid, errors),
            )

    def test_claim_evidence_inference_not_proven_rule(self) -> None:
        payload = claim_payload()
        payload["evidence_refs"] = []
        self.assertTrue(any("supported claim requires" in error for error in contract.validate_claim(payload)))
        inference = claim_payload(status="inference")
        self.assertEqual(contract.validate_claim(inference), [])
        inference["claim_quality"] = 2
        self.assertTrue(any("inference must" in error for error in contract.validate_claim(inference)))
        not_proven = claim_payload(status="not-proven")
        self.assertEqual(contract.validate_claim(not_proven), [])
        not_proven["claim_quality"] = 1
        self.assertTrue(any("not-proven claim" in error for error in contract.validate_claim(not_proven)))

    def test_relationship_types_references_and_supersedes_kind(self) -> None:
        payload = relationship_payload()
        self.assertEqual(contract.validate_relationship(payload), [])
        for relationship_type in ("supports", "qualifies", "derived_from", "same_as", "about", "resolved_by"):
            payload["relationship_type"] = relationship_type
            self.assertEqual(contract.validate_relationship(payload), [], relationship_type)
        payload["relationship_type"] = "overwrites"
        self.assertTrue(any(error.startswith("relationship_type") for error in contract.validate_relationship(payload)))
        payload = relationship_payload()
        payload["target_ref"] = payload["source_ref"]
        self.assertTrue(any("cannot point to itself" in error for error in contract.validate_relationship(payload)))
        payload = relationship_payload()
        payload["evidence_refs"] = []
        self.assertTrue(
            any(
                "requires at least one evidence reference" in error
                for error in contract.validate_relationship(payload)
            )
        )
        for relationship_type in ("same_as", "supersedes"):
            payload = relationship_payload()
            payload["relationship_type"] = relationship_type
            payload["target_ref"] = f"source:sha256:{DIGEST_A}"
            self.assertTrue(
                any(
                    "same reference kind" in error
                    for error in contract.validate_relationship(payload)
                ),
                relationship_type,
            )

    def test_dispatcher_rejects_untyped_or_unknown_direct_payloads(self) -> None:
        self.assertTrue(contract.validate_payload({"legacy": True}))
        self.assertTrue(contract.validate_payload({"schema": "memory-future/v9"}))
        self.assertEqual(contract.validate_payload(source_payload()), [])
        self.assertEqual(contract.validate_payload(tombstone_payload()), [])


class IdentityRegistryTests(unittest.TestCase):
    def test_registry_and_every_builtin_identifier(self) -> None:
        registry = identity_registry()
        self.assertEqual(contract.validate_identity_registry(registry), [])
        for row in registry["identities"]:
            self.assertEqual(contract.identity_namespace(row["id"]), row["namespace"])
            self.assertEqual(contract.validate_identity_id(row["id"], namespace=row["namespace"]), [])

    def test_builtin_namespace_cannot_be_missing_or_redefined(self) -> None:
        registry = identity_registry()
        registry["namespaces"] = registry["namespaces"][1:]
        self.assertTrue(any("missing required built-in" in error for error in contract.validate_identity_registry(registry)))
        registry = identity_registry()
        registry["namespaces"][0]["authority"] = "local guess"
        self.assertTrue(any("built-in value" in error for error in contract.validate_identity_registry(registry)))

    def test_identity_format_uniqueness_ambiguous_alias_and_canonical_target(self) -> None:
        registry = identity_registry()
        registry["identities"][0]["id"] = "issuer:lei:lowercase-invalid"
        self.assertTrue(any("does not match namespace" in error for error in contract.validate_identity_registry(registry)))
        registry = identity_registry()
        duplicate = copy.deepcopy(registry["identities"][0])
        registry["identities"].append(duplicate)
        self.assertTrue(any("duplicate identity" in error for error in contract.validate_identity_registry(registry)))
        registry = identity_registry()
        registry["identities"][0]["aliases"] = ["ACME"]
        registry["identities"][1]["aliases"] = ["ACME"]
        self.assertEqual(
            contract.validate_identity_registry(registry), [],
            "aliases may remain ambiguous instead of silently becoming identity",
        )
        registry = identity_registry()
        registry["identities"][0]["canonical_id"] = "issuer:lei:AAAAAAAAAAAAAAAAAAAA"
        self.assertTrue(any("does not exist" in error for error in contract.validate_identity_registry(registry)))

        for invalid_alias in ("", "x" * 257):
            registry = identity_registry()
            registry["identities"][0]["aliases"] = [invalid_alias]
            errors = contract.validate_identity_registry(registry)
            self.assertTrue(any("aliases[0]" in error for error in errors), errors)

    def test_active_identity_must_self_canonicalize(self) -> None:
        registry = identity_registry()
        canonical_id = "issuer:lei:AAAAAAAAAAAAAAAAAAAA"
        registry["identities"].append(
            {
                "id": canonical_id,
                "namespace": "issuer:lei",
                "entity_kind": "issuer",
                "canonical_id": canonical_id,
                "status": "active",
                "valid_time": {"from": "2026-01-01", "to": None},
                "aliases": [],
            }
        )
        registry["identities"][0]["canonical_id"] = canonical_id
        errors = contract.validate_identity_registry(registry)
        self.assertTrue(any("active identity must be self-canonical" in error for error in errors), errors)

        registry["identities"][0]["status"] = "superseded"
        self.assertEqual(contract.validate_identity_registry(registry), [])

    def test_custom_namespace_is_allowed_when_defined(self) -> None:
        registry = identity_registry()
        registry["namespaces"].append({
            "name": "issuer:local", "entity_kind": "issuer",
            "id_pattern": r"^issuer:local:[0-9]{6}$", "authority": "local-exchange",
            "case_sensitive": True,
        })
        registry["identities"].append({
            "id": "issuer:local:123456", "namespace": "issuer:local", "entity_kind": "issuer",
            "canonical_id": "issuer:local:123456", "status": "active",
            "valid_time": {"from": "2026-01-01", "to": None}, "aliases": [],
        })
        self.assertEqual(contract.validate_identity_registry(registry), [])

    def test_custom_namespace_cannot_shadow_builtin_authorities(self) -> None:
        registry = identity_registry()
        registry["namespaces"].append(
            {
                "name": "issuer:local",
                "entity_kind": "issuer",
                "id_pattern": r"^issuer:lei:[A-Z0-9]{20}$",
                "authority": "local-shadow",
                "case_sensitive": True,
            }
        )
        errors = contract.validate_identity_registry(registry)
        self.assertTrue(any("declared namespace prefix" in error for error in errors), errors)

        registry = identity_registry()
        registry["namespaces"].append(
            {
                "name": "security",
                "entity_kind": "security",
                "id_pattern": r"^security:[A-Z0-9]+$",
                "authority": "local-shadow",
                "case_sensitive": True,
            }
        )
        errors = contract.validate_identity_registry(registry)
        self.assertTrue(any("reserved by a built-in namespace" in error for error in errors), errors)

    def test_custom_namespace_honors_case_sensitivity(self) -> None:
        registry = identity_registry()
        definition = {
            "name": "issuer:local",
            "entity_kind": "issuer",
            "id_pattern": r"^issuer:local:[a-z]{6}$",
            "authority": "local-exchange",
            "case_sensitive": False,
        }
        uppercase = {
            "id": "ISSUER:LOCAL:ABCDEF",
            "namespace": "issuer:local",
            "entity_kind": "issuer",
            "canonical_id": "ISSUER:LOCAL:ABCDEF",
            "status": "active",
            "valid_time": {"from": "2026-01-01", "to": None},
            "aliases": [],
        }
        registry["namespaces"].append(definition)
        registry["identities"].append(uppercase)
        self.assertEqual(contract.validate_identity_registry(registry), [])

        case_sensitive = copy.deepcopy(registry)
        case_sensitive["namespaces"][-1]["case_sensitive"] = True
        errors = contract.validate_identity_registry(case_sensitive)
        self.assertTrue(any("does not match namespace" in error for error in errors), errors)

        duplicate = copy.deepcopy(registry)
        second = copy.deepcopy(uppercase)
        second["id"] = "issuer:local:abcdef"
        second["canonical_id"] = second["id"]
        duplicate["identities"].append(second)
        errors = contract.validate_identity_registry(duplicate)
        self.assertTrue(any("case-insensitive namespace" in error for error in errors), errors)


class SupersessionAndCollectionTests(unittest.TestCase):
    def test_valid_supersession_and_derived_references(self) -> None:
        original = event(event_id=f"evt_{UUID1}", system_time="2026-08-20T10:00:00Z")
        correction = event(event_id=f"evt_{UUID2}", system_time="2026-08-20T11:00:00Z")
        correction["supersedes"] = [original["event_id"]]
        correction["derived_from"] = []
        index = {original["event_id"]: original, correction["event_id"]: correction}
        self.assertEqual(contract.validate_event(correction, event_index=index), [])
        self.assertEqual(contract.validate_events([original, correction]), [])

    def test_derived_from_requires_strictly_earlier_system_time(self) -> None:
        parent = event(
            event_id=f"evt_{UUID1}", system_time="2026-08-20T10:00:00Z"
        )
        child = event(
            event_id=f"evt_{UUID2}", system_time="2026-08-20T10:00:00Z"
        )
        child["derived_from"] = [parent["event_id"]]
        index = {parent["event_id"]: parent, child["event_id"]: child}
        errors = contract.validate_event(child, event_index=index)
        self.assertTrue(any("target must have an earlier system_time" in error for error in errors), errors)
        self.assertTrue(
            any(
                "target must have an earlier system_time" in error
                for error in contract.validate_events([parent, child])
            )
        )

        child["system_time"] = "2026-08-20T10:00:00.000001Z"
        self.assertEqual(
            contract.validate_event(child, event_index={parent["event_id"]: parent}),
            [],
        )

    def test_self_missing_future_and_cycle_supersession_fail(self) -> None:
        row = event()
        row["supersedes"] = [row["event_id"]]
        self.assertTrue(any("cannot supersede itself" in error for error in contract.validate_event(row)))

        row = event(event_id=f"evt_{UUID2}")
        row["supersedes"] = [f"evt_{UUID1}"]
        self.assertTrue(any("does not exist" in error for error in contract.validate_event(row, event_index={row["event_id"]: row})))

        old = event(event_id=f"evt_{UUID1}", system_time="2026-08-20T12:00:00Z")
        new = event(event_id=f"evt_{UUID2}", system_time="2026-08-20T11:00:00Z")
        new["supersedes"] = [old["event_id"]]
        index = {old["event_id"]: old, new["event_id"]: new}
        self.assertTrue(any("earlier system_time" in error for error in contract.validate_event(new, event_index=index)))

        malformed_target = event(
            event_id=f"evt_{UUID1}", system_time="2026-08-20T10:00:00Z"
        )
        malformed_target["system_time"] = "not-a-time"
        child = event(event_id=f"evt_{UUID2}", system_time="2026-08-20T11:00:00Z")
        child["derived_from"] = [malformed_target["event_id"]]
        index = {malformed_target["event_id"]: malformed_target, child["event_id"]: child}
        errors = contract.validate_event(child, event_index=index)
        self.assertTrue(
            any(error.startswith("derived_from[0].target.system_time") for error in errors),
            errors,
        )

        first = event(event_id=f"evt_{UUID1}", system_time="2026-08-20T10:00:00Z")
        second = event(event_id=f"evt_{UUID2}", system_time="2026-08-20T11:00:00Z")
        first["supersedes"] = [second["event_id"]]
        second["supersedes"] = [first["event_id"]]
        index = {first["event_id"]: first, second["event_id"]: second}
        self.assertTrue(any("cycle" in error for error in contract.validate_event(second, event_index=index)))

        original = event(event_id=f"evt_{UUID1}", system_time="2026-08-20T10:00:00Z")
        unrelated = event(event_id=f"evt_{UUID2}", system_time="2026-08-20T11:00:00Z")
        unrelated["event_type"] = "outcome.reviewed"
        unrelated["subject_ids"] = ["entity:internal:unrelated"]
        unrelated["supersedes"] = [original["event_id"]]
        index = {original["event_id"]: original, unrelated["event_id"]: unrelated}
        errors = contract.validate_event(unrelated, event_index=index)
        self.assertTrue(any("same event_type" in error for error in errors), errors)
        self.assertTrue(any("canonical subject" in error for error in errors), errors)

        review = event(event_id=f"evt_{UUID2}", system_time="2026-08-20T11:00:00Z")
        review["event_type"] = "decision.reviewed"
        review["supersedes"] = [original["event_id"]]
        index = {original["event_id"]: original, review["event_id"]: review}
        errors = contract.validate_event(review, event_index=index)
        self.assertTrue(any("same event_type" in error for error in errors), errors)

    def test_collection_rejects_duplicate_event_ids_and_bad_index(self) -> None:
        first = event()
        duplicate = event()
        duplicate["payload"]["record"]["decision"] = "Avoid"
        duplicate = contract.seal_event(duplicate)
        errors = contract.validate_events([first, duplicate])
        self.assertTrue(any("duplicates events[0]" in error for error in errors), errors)
        errors = contract.validate_event(first, event_index={"bad": first})
        self.assertTrue(any(error.startswith("event_index") for error in errors))


if __name__ == "__main__":
    unittest.main(verbosity=2)
