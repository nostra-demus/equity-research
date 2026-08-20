#!/usr/bin/env python3
"""Deterministic projection, policy, temporal, graph, and integrity regressions."""
from __future__ import annotations

import copy
import hashlib
import json
import sqlite3
import tempfile
from pathlib import Path

from memory_contract import payload_sha256, seal_event
from memory_projection import (
    ProjectionError,
    _check_integrity_result,
    build_projection,
    projection_digest,
    query_projection,
    query_projection_with_metadata,
    verify_projection,
)


def _event(
    ordinal: int,
    *,
    text: str,
    system_time: str,
    valid_from: str,
    classification: str = "internal",
    retention: str = "permanent",
    retain_until: str | None = None,
    derived_from: list[str] | None = None,
    supersedes: list[str] | None = None,
) -> dict:
    event_id = f"evt_00000000-0000-5000-8000-{ordinal:012d}"
    source_bytes = f"source-{ordinal}:{text}".encode()
    source_sha = hashlib.sha256(source_bytes).hexdigest()
    payload = {
        "source_path": f"fixtures/source-{ordinal}.json",
        "source_sha256": source_sha,
        "source_locator": "record",
        "record": {"text": text, "ordinal": ordinal},
    }
    return {
        "schema": "memory-event/v1",
        "event_id": event_id,
        "event_type": "decision.recorded",
        "subject_ids": ["entity:internal:projection-test"],
        "valid_time": {"from": valid_from, "to": None},
        "system_time": system_time,
        "producer": {
            "kind": "adapter",
            "name": "projection-test",
            "runtime": "python",
            "model": None,
            "prompt_program_sha": None,
        },
        "run_id": "run_00000000-0000-5000-8000-000000000001",
        "trace_id": None,
        "payload": payload,
        "evidence_refs": [f"evidence:sha256:{source_sha}#record"],
        "derived_from": derived_from or [],
        "supersedes": supersedes or [],
        "integrity": {"payload_sha256": payload_sha256(payload), "signature": None},
        "policy": {
            "classification": classification,
            "retention": retention,
            "retain_until": retain_until,
        },
    }


def _expect_projection_error(fn, contains: str) -> None:
    try:
        fn()
    except ProjectionError as exc:
        assert contains in str(exc), str(exc)
        return
    raise AssertionError(f"expected ProjectionError containing {contains!r}")


def _expect_type_error(fn) -> None:
    try:
        fn()
    except TypeError:
        return
    raise AssertionError("expected TypeError")


def _tombstone_event(
    ordinal: int,
    *,
    target: dict,
    system_time: str,
    valid_from: str,
    classification: str = "internal",
) -> dict:
    row = _event(
        ordinal,
        text="tombstone-metadata-placeholder",
        system_time=system_time,
        valid_from=valid_from,
        classification=classification,
        supersedes=[target["event_id"]],
    )
    row["payload"] = {
        "schema": "memory-tombstone/v1",
        "target_event_id": target["event_id"],
        "reason_code": "legal-erasure",
        "basis": "legal-obligation",
        "basis_id": None,
    }
    row["evidence_refs"] = []
    row["derived_from"] = []
    row["policy"] = {
        "classification": classification,
        "retention": "tombstone-only",
        "retain_until": None,
    }
    return seal_event(row)


def _typed_event(
    ordinal: int,
    payload: dict,
    *,
    evidence_refs: list[str] | None = None,
    classification: str = "internal",
) -> dict:
    domain = {
        "memory-source/v1": "source",
        "memory-evidence-span/v1": "evidence",
        "memory-claim/v1": "claim",
        "memory-relationship/v1": "relationship",
    }[payload["schema"]]
    return seal_event(
        {
            "schema": "memory-event/v1",
            "event_id": f"evt_10000000-0000-5000-8000-{ordinal:012d}",
            "event_type": f"{domain}.recorded",
            "subject_ids": ["issuer:lei:5493001KJTIIGC8Y1R12"],
            "valid_time": {"from": "2026-03-31", "to": None},
            "system_time": f"2026-08-{ordinal:02d}T00:00:00Z",
            "producer": {
                "kind": "system",
                "name": "projection-test",
                "runtime": "python",
                "model": None,
                "prompt_program_sha": None,
            },
            "run_id": "run_00000000-0000-5000-8000-000000000001",
            "trace_id": None,
            "payload": payload,
            "evidence_refs": evidence_refs or [],
            "derived_from": [],
            "supersedes": [],
            "integrity": {"payload_sha256": "0" * 64, "signature": None},
            "policy": {
                "classification": classification,
                "retention": "permanent",
                "retain_until": None,
            },
        }
    )


def main() -> None:
    _check_integrity_result("ok")
    _expect_projection_error(
        lambda: _check_integrity_result(
            "malformed inverted index for FTS5 table main.event_search"
        ),
        "event_search FTS5 index does not match",
    )
    _expect_projection_error(
        lambda: _check_integrity_result("row 7 missing from index"),
        "SQLite integrity_check failed",
    )

    old = _event(
        1,
        text="qualified contractual pass-through finding",
        system_time="2026-01-02T00:00:00Z",
        valid_from="2026-01-01",
    )
    current = _event(
        2,
        text="corrected contractual pass-through finding",
        system_time="2026-02-02T00:00:00Z",
        valid_from="2026-02-01",
        supersedes=[old["event_id"]],
    )
    public = _event(
        3,
        text="public evidence fact",
        system_time="2026-01-15T00:00:00+00:00",
        valid_from="2026-01-15",
        classification="public",
    )

    with tempfile.TemporaryDirectory() as temp:
        root = Path(temp)
        first_db = root / "first.sqlite"
        second_db = root / "second.sqlite"
        first = build_projection([current, public, old], first_db)
        second = build_projection([old, current, public], second_db)
        assert first.event_count == 3
        assert first.subject_count == 3
        assert first.edge_count == 1
        assert first.evidence_ref_count == 3
        assert first.artifact_count == 3
        assert first.digest == second.digest, "input order changed logical projection digest"
        assert verify_projection(first_db).digest == first.digest

        for public_query in (query_projection, query_projection_with_metadata):
            _expect_type_error(lambda public_query=public_query: public_query(first_db))
            _expect_projection_error(
                lambda public_query=public_query: public_query(
                    first_db, expected_digest=None  # type: ignore[arg-type]
                ),
                "trusted expected projection digest",
            )
            for malformed_digest in ("", "a" * 63, "A" * 64, "not-a-digest"):
                _expect_projection_error(
                    lambda public_query=public_query,
                    malformed_digest=malformed_digest: public_query(
                        first_db, expected_digest=malformed_digest
                    ),
                    "trusted expected projection digest",
                )
            _expect_projection_error(
                lambda public_query=public_query: public_query(
                    first_db, expected_digest="0" * 64
                ),
                "does not match the trusted expected digest",
            )

        # Access fails closed to public unless the caller explicitly receives another class.
        default_rows = query_projection(first_db, expected_digest=first.digest)
        assert [row["event_id"] for row in default_rows] == [public["event_id"]]
        internal = query_projection(
            first_db, expected_digest=first.digest, classifications=["internal"]
        )
        assert [row["event_id"] for row in internal] == [current["event_id"]]

        # System-time reconstruction must not apply a correction the engine did not yet know.
        historical = query_projection(
            first_db,
            expected_digest=first.digest,
            classifications=["internal"],
            as_of="2026-01-31T23:59:59Z",
        )
        assert [row["event_id"] for row in historical] == [old["event_id"]]
        valid_historical = query_projection(
            first_db,
            expected_digest=first.digest,
            classifications=["internal"],
            as_of="2026-02-28T00:00:00Z",
            valid_at="2026-01-15",
        )
        assert [row["event_id"] for row in valid_historical] == [old["event_id"]]

        assert query_projection(
            first_db,
            expected_digest=first.digest,
            classifications=["internal"],
            subject_ids=["entity:internal:projection-test"],
            text='"corrected contractual"',
        )[0]["event_id"] == current["event_id"]
        assert query_projection(
            first_db,
            expected_digest=first.digest,
            classifications=["internal"],
            subject_ids=["entity:internal:projection-other"],
        ) == []

        # Logical-row tampering is visible even when SQLite itself remains structurally valid.
        connection = sqlite3.connect(first_db)
        with connection:
            connection.execute(
                "UPDATE events SET canonical_event=? WHERE event_id=?",
                (json.dumps({"tampered": True}), public["event_id"]),
            )
        connection.close()
        _expect_projection_error(lambda: verify_projection(first_db), "projection digest")

        # A successor outside the caller's permitted classifications must not
        # suppress an otherwise authorized historical record.
        secret_successor = _event(
            7,
            text="confidential correction",
            system_time="2026-03-02T00:00:00Z",
            valid_from="2026-03-01",
            classification="confidential",
            supersedes=[public["event_id"]],
        )
        policy_db = root / "policy.sqlite"
        policy_projection = build_projection([public, secret_successor], policy_db)
        assert [
            row["event_id"]
            for row in query_projection(
                policy_db, expected_digest=policy_projection.digest
            )
        ] == [public["event_id"]]
        _expect_projection_error(
            lambda: query_projection(
                policy_db,
                expected_digest=policy_projection.digest,
                classifications=["typo-public"],
            ),
            "unknown permitted classification",
        )

        tombstone_successor = _tombstone_event(
            19,
            target=public,
            system_time="2026-03-08T00:00:00Z",
            valid_from="2026-03-08",
            classification="public",
        )
        tombstone_db = root / "tombstone.sqlite"
        tombstone_projection = build_projection(
            [public, tombstone_successor], tombstone_db
        )
        assert query_projection(
            tombstone_db, expected_digest=tombstone_projection.digest
        ) == [], "tombstone must suppress without returning"

        pre_expiry_old = _event(
            20,
            text="old content must not revive",
            system_time="1998-01-01T00:00:00Z",
            valid_from="1998-01-01",
            classification="public",
        )
        expired_successor = _event(
            21,
            text="expired replacement",
            system_time="1999-01-01T00:00:00Z",
            valid_from="1999-01-01",
            classification="public",
            retention="expires",
            retain_until="2000-01-01T00:00:00Z",
            supersedes=[pre_expiry_old["event_id"]],
        )
        expired_successor_db = root / "expired-successor.sqlite"
        expired_successor_projection = build_projection(
            [pre_expiry_old, expired_successor], expired_successor_db
        )
        assert [
            row["event_id"]
            for row in query_projection(
                expired_successor_db,
                expected_digest=expired_successor_projection.digest,
            )
        ] == [pre_expiry_old["event_id"]], "an expired correction must fail toward the original"

        source_policy_successor = _event(
            28,
            text="replacement governed by unavailable source policy",
            system_time="1999-02-01T00:00:00Z",
            valid_from="1999-02-01",
            classification="public",
            retention="source-policy",
            supersedes=[pre_expiry_old["event_id"]],
        )
        source_policy_successor_db = root / "source-policy-successor.sqlite"
        source_policy_successor_projection = build_projection(
            [pre_expiry_old, source_policy_successor], source_policy_successor_db
        )
        assert [
            row["event_id"]
            for row in query_projection(
                source_policy_successor_db,
                expected_digest=source_policy_successor_projection.digest,
            )
        ] == [pre_expiry_old["event_id"]], (
            "a source-policy correction must fail toward the original"
        )

        restricted_parent = _event(
            8,
            text="restricted upstream evidence",
            system_time="2026-03-03T00:00:00Z",
            valid_from="2026-03-03",
            classification="restricted",
        )
        public_derivative = _event(
            9,
            text="copied restricted evidence",
            system_time="2026-03-04T00:00:00Z",
            valid_from="2026-03-04",
            classification="public",
            derived_from=[restricted_parent["event_id"]],
        )
        _expect_projection_error(
            lambda: build_projection(
                [restricted_parent, public_derivative], root / "policy-derivative.sqlite"
            ),
            "widens or changes",
        )

        public_replacement = _event(
            16,
            text="copied protected replacement",
            system_time="2026-03-05T00:00:00Z",
            valid_from="2026-03-05",
            classification="public",
            supersedes=[restricted_parent["event_id"]],
        )
        _expect_projection_error(
            lambda: build_projection(
                [restricted_parent, public_replacement], root / "policy-supersedes.sqlite"
            ),
            "widens or changes",
        )

        licensed_parent = copy.deepcopy(restricted_parent)
        licensed_parent["policy"]["classification"] = "licensed"
        restricted_child = copy.deepcopy(public_derivative)
        restricted_child["policy"]["classification"] = "restricted"
        restricted_child["derived_from"] = [licensed_parent["event_id"]]
        _expect_projection_error(
            lambda: build_projection(
                [licensed_parent, restricted_child], root / "policy-incomparable.sqlite"
            ),
            "widens or changes",
        )

        public_evidence_copy = _event(
            10,
            text="public wrapper around protected source",
            system_time="2026-03-05T00:00:00Z",
            valid_from="2026-03-05",
            classification="public",
        )
        public_evidence_copy["evidence_refs"] = [restricted_parent["evidence_refs"][0]]
        _expect_projection_error(
            lambda: build_projection(
                [restricted_parent, public_evidence_copy], root / "policy-evidence.sqlite"
            ),
            "policy-safe",
        )

        expired = _event(
            11,
            text="expired content",
            system_time="1999-01-01T00:00:00Z",
            valid_from="1999-01-01",
            classification="public",
            retention="expires",
            retain_until="2000-01-01T00:00:00Z",
        )
        unexpired = _event(
            12,
            text="unexpired content",
            system_time="2026-03-06T00:00:00Z",
            valid_from="2026-03-06",
            classification="public",
            retention="expires",
            retain_until="2099-01-01T00:00:00Z",
        )
        retention_db = root / "retention.sqlite"
        retention_projection = build_projection([expired, unexpired], retention_db)
        assert [
            row["event_id"]
            for row in query_projection(
                retention_db, expected_digest=retention_projection.digest
            )
        ] == [
            unexpired["event_id"]
        ]

        exact_second = _event(
            14,
            text="exact-second fact",
            system_time="2026-04-01T00:00:00Z",
            valid_from="2026-04-01T00:00:00Z",
            classification="public",
        )
        half_second_later = _event(
            15,
            text="future fractional fact",
            system_time="2026-04-01T00:00:00.5Z",
            valid_from="2026-04-01T00:00:00.5Z",
            classification="public",
        )
        fractions_db = root / "fractions.sqlite"
        exact_second["valid_time"]["to"] = "2026-04-01T00:00:00Z"
        fractions_projection = build_projection(
            [half_second_later, exact_second], fractions_db
        )
        assert [
            row["event_id"]
            for row in query_projection(
                fractions_db,
                expected_digest=fractions_projection.digest,
                as_of="2026-04-01T00:00:00Z",
                valid_at="2026-04-01T00:00:00Z",
            )
        ] == [exact_second["event_id"]]

        # A date query means overlap with the whole day, not an arbitrary EOD point.
        intraday = _event(
            23,
            text="intraday interval",
            system_time="2026-04-02T00:00:00Z",
            valid_from="2026-04-01T00:00:00Z",
            classification="public",
        )
        intraday["valid_time"]["to"] = "2026-04-01T12:00:00Z"
        intraday_db = root / "intraday.sqlite"
        intraday_projection = build_projection([intraday], intraday_db)
        assert [
            row["event_id"] for row in query_projection(
                intraday_db,
                expected_digest=intraday_projection.digest,
                as_of="2026-04-02T00:00:00Z",
                valid_at="2026-04-01",
            )
        ] == [intraday["event_id"]]

        missing_target = copy.deepcopy(current)
        missing_target["supersedes"] = ["evt_00000000-0000-5000-8000-999999999999"]
        _expect_projection_error(
            lambda: build_projection([old, missing_target], root / "missing.sqlite"),
            "target does not exist",
        )

        cyclic_old = copy.deepcopy(old)
        cyclic_old["supersedes"] = [current["event_id"]]
        _expect_projection_error(
            lambda: build_projection([cyclic_old, current], root / "cycle.sqlite"),
            "cycle",
        )

        equal_time_parent = _event(
            28,
            text="equal-time causal parent",
            system_time="2026-04-03T00:00:00Z",
            valid_from="2026-04-03",
        )
        equal_time_child = _event(
            29,
            text="equal-time causal child",
            system_time="2026-04-03T00:00:00Z",
            valid_from="2026-04-03",
            derived_from=[equal_time_parent["event_id"]],
        )
        equal_time_parent["derived_from"] = [equal_time_child["event_id"]]
        try:
            build_projection(
                [equal_time_parent, equal_time_child], root / "derived-cycle.sqlite"
            )
        except ProjectionError as exc:
            message = str(exc)
            assert "derived_from graph contains a cycle" in message, message
            assert "must be strictly earlier" in message, message
        else:
            raise AssertionError("expected equal-time derived_from cycle to be rejected")

        unresolved = copy.deepcopy(public)
        unresolved["evidence_refs"] = [f"evidence:sha256:{'f' * 64}#missing"]
        _expect_projection_error(
            lambda: build_projection([unresolved], root / "unresolved.sqlite"),
            "do not resolve",
        )

        bad_locator = copy.deepcopy(public)
        bad_locator["evidence_refs"] = [
            f"evidence:sha256:{public['payload']['source_sha256']}#not-the-record"
        ]
        _expect_projection_error(
            lambda: build_projection([bad_locator], root / "bad-locator.sqlite"),
            "do not resolve",
        )

        digest = "a" * 64
        evidence_ref = f"evidence:sha256:{digest}#page-1"
        typed_source = _typed_event(
            4,
            {
                "schema": "memory-source/v1",
                "source_id": f"source:sha256:{digest}",
                "document_id": "document_10000000-0000-5000-8000-000000000004",
                "title": "Audited annual report",
                "issuer_ids": ["issuer:lei:5493001KJTIIGC8Y1R12"],
                "source_tier": 1,
                "publication_date": "2026-06-30",
                "filing_date": "2026-07-01",
                "effective_date": "2026-03-31",
                "language": "en",
                "licence": {
                    "name": None,
                    "uri": None,
                    "expires_at": None,
                    "derived_data": "allowed",
                },
                "uri": "https://example.test/report.pdf",
                "content_sha256": f"sha256:{digest}",
                "mime_type": "application/pdf",
                "byte_length": 123,
                "extraction_status": "succeeded",
            },
            classification="public",
        )
        typed_evidence = _typed_event(
            5,
            {
                "schema": "memory-evidence-span/v1",
                "evidence_id": evidence_ref,
                "source_id": f"source:sha256:{digest}",
                "source_sha256": f"sha256:{digest}",
                "locator": {
                    "kind": "page",
                    "ref": "page-1",
                    "page": 1,
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
            },
            classification="public",
        )
        typed_claim = _typed_event(
            6,
            {
                "schema": "memory-claim/v1",
                "claim_id": "claim_10000000-0000-5000-8000-000000000006",
                "subject_id": "issuer:lei:5493001KJTIIGC8Y1R12",
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
                "qualifier": "Contractual maturity; excludes undrawn facilities.",
                "basis": "Annual report, p.1.",
                "epistemic_status": "supported",
                "claim_quality": 5,
                "evidence_refs": [evidence_ref],
                "derived_from_claims": [],
                "material": True,
            },
            evidence_refs=[evidence_ref],
        )

        same_time_parent_payload = copy.deepcopy(typed_claim["payload"])
        same_time_parent_payload["claim_id"] = (
            "claim_10000000-0000-5000-8000-000000000028"
        )
        same_time_parent = _typed_event(
            28, same_time_parent_payload, evidence_refs=[evidence_ref]
        )
        same_time_child_payload = copy.deepcopy(typed_claim["payload"])
        same_time_child_payload["claim_id"] = (
            "claim_10000000-0000-5000-8000-000000000029"
        )
        same_time_child_payload["derived_from_claims"] = [
            same_time_parent_payload["claim_id"]
        ]
        same_time_child = _typed_event(
            29, same_time_child_payload, evidence_refs=[evidence_ref]
        )
        same_time_child["system_time"] = same_time_parent["system_time"]
        _expect_projection_error(
            lambda: build_projection(
                [typed_source, typed_evidence, same_time_parent, same_time_child],
                root / "same-time-typed-provider.sqlite",
            ),
            "strictly before the consumer system_time",
        )

        cyclic_claim_a = copy.deepcopy(same_time_parent)
        cyclic_claim_b = copy.deepcopy(same_time_child)
        cyclic_claim_a["payload"]["derived_from_claims"] = [
            cyclic_claim_b["payload"]["claim_id"]
        ]
        cyclic_claim_a = seal_event(cyclic_claim_a)
        _expect_projection_error(
            lambda: build_projection(
                [typed_source, typed_evidence, cyclic_claim_a, cyclic_claim_b],
                root / "typed-claim-cycle.sqlite",
            ),
            "claim.derived_from_claims graph contains a cycle",
        )

        typed_db = root / "typed.sqlite"
        typed = build_projection([typed_claim, typed_source, typed_evidence], typed_db)
        assert typed.typed_payload_count == 3
        connection = sqlite3.connect(typed_db)
        assert connection.execute(
            "SELECT claim_id,qualifier FROM claim_index"
        ).fetchone() == (
            "claim_10000000-0000-5000-8000-000000000006",
            "Contractual maturity; excludes undrawn facilities.",
        )
        assert connection.execute(
            "SELECT sha256,locator FROM artifact_locators"
        ).fetchone() == (digest, "page-1")
        assert connection.execute("SELECT count(*) FROM evidence_bindings").fetchone()[0] == 1
        assert connection.execute("SELECT count(*) FROM record_bindings").fetchone()[0] == 1
        connection.close()

        future_evidence_claim = _typed_event(
            3,
            copy.deepcopy(typed_claim["payload"]),
            evidence_refs=[evidence_ref],
        )
        _expect_projection_error(
            lambda: build_projection(
                [future_evidence_claim, typed_source, typed_evidence],
                root / "future-evidence.sqlite",
            ),
            "at or before the consumer system_time",
        )

        restricted_claim_payload = copy.deepcopy(typed_claim["payload"])
        restricted_claim_payload["claim_id"] = (
            "claim_10000000-0000-5000-8000-000000000017"
        )
        restricted_claim = _typed_event(
            17,
            restricted_claim_payload,
            evidence_refs=[evidence_ref],
            classification="restricted",
        )
        public_derived_payload = copy.deepcopy(typed_claim["payload"])
        public_derived_payload["claim_id"] = (
            "claim_10000000-0000-5000-8000-000000000018"
        )
        public_derived_payload["derived_from_claims"] = [
            restricted_claim_payload["claim_id"]
        ]
        public_derived = _typed_event(
            18,
            public_derived_payload,
            evidence_refs=[evidence_ref],
            classification="public",
        )
        _expect_projection_error(
            lambda: build_projection(
                [typed_source, typed_evidence, restricted_claim, public_derived],
                root / "typed-policy-lineage.sqlite",
            ),
            "claim.derived_from_claims",
        )

        duplicate_source = _typed_event(
            24,
            copy.deepcopy(typed_source["payload"]),
            classification="confidential",
        )
        _expect_projection_error(
            lambda: build_projection(
                [typed_source, duplicate_source], root / "duplicate-source-id.sqlite"
            ),
            "one linear supersession chain",
        )
        duplicate_source["supersedes"] = [typed_source["event_id"]]
        build_projection(
            [typed_source, duplicate_source], root / "linear-source-version.sqlite"
        )

        duplicate_claim = _typed_event(
            25,
            copy.deepcopy(typed_claim["payload"]),
            evidence_refs=[evidence_ref],
        )
        _expect_projection_error(
            lambda: build_projection(
                [typed_source, typed_evidence, typed_claim, duplicate_claim],
                root / "duplicate-claim-id.sqlite",
            ),
            "one linear supersession chain",
        )

        second_claim_payload = copy.deepcopy(typed_claim["payload"])
        second_claim_payload["claim_id"] = (
            "claim_10000000-0000-5000-8000-000000000026"
        )
        second_claim = _typed_event(
            26,
            second_claim_payload,
            evidence_refs=[evidence_ref],
        )
        relationship = _typed_event(
            27,
            {
                "schema": "memory-relationship/v1",
                "relationship_id": "rel_10000000-0000-5000-8000-000000000027",
                "relationship_type": "contradicts",
                "source_ref": typed_claim["payload"]["claim_id"],
                "target_ref": second_claim_payload["claim_id"],
                "qualifier": "The two claim versions use incompatible scopes.",
                "evidence_refs": [evidence_ref],
            },
            evidence_refs=[evidence_ref],
        )
        relationship["subject_ids"] = ["entity:internal:unrelated"]
        relationship = seal_event(relationship)
        _expect_projection_error(
            lambda: build_projection(
                [typed_source, typed_evidence, typed_claim, second_claim, relationship],
                root / "relationship-subject.sqlite",
            ),
            "relationship subjects do not overlap",
        )

        # Invalid replacement attempts never clobber an already verified projection.
        stable_db = root / "stable.sqlite"
        stable = build_projection([public], stable_db)
        invalid = copy.deepcopy(public)
        invalid["integrity"]["payload_sha256"] = "0" * 64
        _expect_projection_error(lambda: build_projection([invalid], stable_db), "invalid canonical")
        assert verify_projection(stable_db).digest == stable.digest

        special_path = root / "question?.sqlite"
        special = build_projection([public], special_path)
        assert verify_projection(special_path, expected_digest=special.digest).digest == special.digest
        assert not (root / "question").exists(), "URI metacharacter opened a sibling database"

        fts_path = root / "fts-corrupt.sqlite"
        fts_event = _event(
            22,
            text="uniquequasar",
            system_time="2026-03-09T00:00:00Z",
            valid_from="2026-03-09",
            classification="public",
        )
        build_projection([fts_event], fts_path)
        raw = bytearray(fts_path.read_bytes())
        token = b"uniquequasar"
        offset = raw.find(token)
        assert offset >= 0
        raw[offset:offset + len(token)] = b"uniquequasax"
        fts_path.write_bytes(raw)
        _expect_projection_error(
            lambda: verify_projection(fts_path),
            "FTS5 index does not match",
        )

        trust_path = root / "trusted-digest.sqlite"
        trusted = build_projection([public], trust_path)
        connection = sqlite3.connect(trust_path)
        forged = copy.deepcopy(public)
        forged["payload"]["record"]["text"] = "forged but internally self-consistent"
        forged = seal_event(forged)
        with connection:
            connection.execute(
                "UPDATE events SET payload_sha256=?,canonical_event=? WHERE event_id=?",
                (
                    forged["integrity"]["payload_sha256"],
                    json.dumps(forged, ensure_ascii=False, sort_keys=True, separators=(",", ":")),
                    public["event_id"],
                ),
            )
            connection.execute(
                "UPDATE metadata SET value=? WHERE key='projection_digest'",
                (projection_digest(connection),),
            )
        connection.close()
        verify_projection(trust_path)  # a self-checksum is not an external trust anchor
        _expect_projection_error(
            lambda: verify_projection(trust_path, expected_digest=trusted.digest),
            "trusted expected digest",
        )

    print("test_memory_projection: PASS")


if __name__ == "__main__":
    main()
