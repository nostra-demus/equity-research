#!/usr/bin/env python3
"""Offline regressions for the disposable Neo4j memory projection."""

from __future__ import annotations

import json
import os
import tempfile
import unittest
from pathlib import Path
from typing import Any, Mapping, Optional

from memory_neo4j import (
    ABOUT_QUERY,
    CITES_QUERY,
    DERIVED_FROM_QUERY,
    DOCTOR_QUERY,
    EVENT_QUERY,
    EXPECTED_CONSTRAINTS,
    FULLTEXT_INDEX,
    INDEX_QUERY,
    CONSTRAINT_QUERY,
    OWNERSHIP_QUERY,
    SEARCH_QUERY,
    SUBJECT_QUERY,
    SUPERSEDES_QUERY,
    AuraCredentials,
    GraphBundle,
    Neo4jPrototypeError,
    load_aura_credentials,
    load_graph,
    map_events,
    search_graph,
)


def event(
    event_id: str,
    *,
    subject: str = "entity:internal:test",
    evidence_ref: str = "evidence:sha256:" + "a" * 64 + "#line-1",
    derived_from: Optional[list[str]] = None,
    supersedes: Optional[list[str]] = None,
    classification: str = "internal",
    retention: str = "permanent",
) -> dict[str, Any]:
    return {
        "schema": "memory-event/v1",
        "event_id": event_id,
        "event_type": "decision.recorded",
        "subject_ids": [subject],
        "valid_time": {"from": "2026-08-20", "to": None},
        "system_time": "2026-08-21T00:00:00Z",
        "producer": {"kind": "adapter", "name": "test", "version": "1"},
        "run_id": None,
        "trace_id": None,
        "payload": {
            "legacy_schema": "test/v1",
            "record_type": "decision",
            "source_path": "analyses/TEST_2026-08-20/decision_record.json",
            "source_locator": "json",
            "source_sha256": "b" * 64,
            "time_mapping": {"valid_time_precision": "day"},
            "record": {"secret_marker": "must-never-enter-the-prototype"},
        },
        "evidence_refs": [evidence_ref],
        "derived_from": list(derived_from or []),
        "supersedes": list(supersedes or []),
        "integrity": {"payload_sha256": "c" * 64, "signature": None},
        "policy": {
            "classification": classification,
            "retention": retention,
            "retain_until": None,
        },
    }


class FakeDriver:
    def __init__(self, counts: Mapping[str, int]) -> None:
        self.counts = dict(counts)
        self.calls: list[tuple[str, dict[str, Any], str]] = []
        self.search_rows: list[Mapping[str, Any]] = []
        self.write_transactions = 0

    def execute_query(
        self,
        query: str,
        *,
        parameters_: Optional[Mapping[str, Any]] = None,
        database_: str,
    ) -> tuple[list[Mapping[str, Any]], None, None]:
        parameters = dict(parameters_ or {})
        self.calls.append((query, parameters, database_))
        if query == DOCTOR_QUERY:
            return ([dict(self.counts)], None, None)
        if query == INDEX_QUERY:
            return (
                [
                    {
                        "state": "ONLINE",
                        "labelsOrTypes": ["MemoryPrototypeEvent"],
                        "properties": ["search_text"],
                        "options": {
                            "indexConfig": {
                                "fulltext.analyzer": "standard-no-stop-words"
                            }
                        },
                    }
                ],
                None,
                None,
            )
        if query == CONSTRAINT_QUERY:
            return (
                [
                    {
                        "name": name,
                        "type": "NODE_PROPERTY_UNIQUENESS",
                        "labelsOrTypes": labels,
                        "properties": properties,
                    }
                    for name, (labels, properties) in sorted(EXPECTED_CONSTRAINTS.items())
                ],
                None,
                None,
            )
        if query == OWNERSHIP_QUERY:
            return ([{"foreign_nodes": 0}], None, None)
        if query == SEARCH_QUERY:
            return (list(self.search_rows), None, None)
        return ([], None, None)

    def session(self, *, database: str) -> "FakeSession":
        return FakeSession(self, database)


class FakeConsumedResult:
    def consume(self) -> None:
        return None


class FakeTransaction:
    def __init__(self, driver: FakeDriver, database: str) -> None:
        self.driver = driver
        self.database = database

    def run(self, query: str, **parameters: Any) -> FakeConsumedResult:
        self.driver.calls.append((query, dict(parameters), self.database))
        return FakeConsumedResult()


class FakeSession:
    def __init__(self, driver: FakeDriver, database: str) -> None:
        self.driver = driver
        self.database = database

    def __enter__(self) -> "FakeSession":
        return self

    def __exit__(self, *_: Any) -> None:
        return None

    def execute_write(self, callback: Any) -> None:
        self.driver.write_transactions += 1
        callback(FakeTransaction(self.driver, self.database))


class MemoryNeo4jTests(unittest.TestCase):
    def test_metadata_only_mapping_and_edges(self) -> None:
        first = event("evt_00000000-0000-5000-8000-000000000001")
        second = event(
            "evt_00000000-0000-5000-8000-000000000002",
            subject="entity:internal:other",
            evidence_ref="evidence:sha256:" + "d" * 64 + "#json",
            derived_from=[first["event_id"]],
            supersedes=[first["event_id"]],
        )
        bundle = map_events([second, first])
        self.assertEqual(
            bundle.counts(),
            {
                "events": 2,
                "subjects": 2,
                "evidence": 2,
                "about": 2,
                "cites": 2,
                "derived_from": 1,
                "supersedes": 1,
            },
        )
        rendered = json.dumps(bundle.events, sort_keys=True)
        whole_bundle = json.dumps(bundle, default=lambda value: value.__dict__, sort_keys=True)
        self.assertNotIn("must-never-enter-the-prototype", rendered)
        self.assertNotIn("must-never-enter-the-prototype", whole_bundle)
        self.assertNotIn('"record"', rendered)
        self.assertEqual(bundle.events[0]["event_id"], first["event_id"])
        self.assertIn(
            "decision recorded decision analyses test 2026",
            bundle.events[0]["search_text"],
        )

    def test_mapping_rejects_policy_and_missing_targets(self) -> None:
        with self.assertRaisesRegex(Neo4jPrototypeError, "internal, permanent"):
            map_events(
                [
                    event(
                        "evt_00000000-0000-5000-8000-000000000003",
                        classification="confidential",
                    )
                ]
            )
        with self.assertRaisesRegex(Neo4jPrototypeError, "missing event target"):
            map_events(
                [
                    event(
                        "evt_00000000-0000-5000-8000-000000000004",
                        derived_from=["evt_00000000-0000-5000-8000-000000000099"],
                    )
                ]
            )

    def test_mapping_rejects_non_list_relation_fields_before_iteration(self) -> None:
        hostile_values = (
            None,
            "scalar-string",
            {"unexpected": "mapping"},
            7,
            ("tuple-item",),
        )
        for field_name in ("evidence_refs", "derived_from", "supersedes"):
            for hostile_value in hostile_values:
                with self.subTest(field=field_name, value=hostile_value):
                    source = event("evt_00000000-0000-5000-8000-000000000005")
                    source[field_name] = hostile_value
                    with self.assertRaisesRegex(
                        Neo4jPrototypeError,
                        rf"{field_name} must be a list",
                    ):
                        map_events([source])

            with self.subTest(field=field_name, value="missing"):
                source = event("evt_00000000-0000-5000-8000-000000000006")
                del source[field_name]
                with self.assertRaisesRegex(
                    Neo4jPrototypeError,
                    rf"{field_name} must be a list",
                ):
                    map_events([source])

    def test_mapping_rejects_prose_like_locators(self) -> None:
        source = event("evt_00000000-0000-5000-8000-000000000010")
        source["payload"]["source_locator"] = "secret prose marker"
        with self.assertRaisesRegex(Neo4jPrototypeError, "metadata-safe"):
            map_events([source])

        evidence = event(
            "evt_00000000-0000-5000-8000-000000000011",
            evidence_ref="evidence:sha256:" + "a" * 64 + "#secret-prose-marker",
        )
        with self.assertRaisesRegex(Neo4jPrototypeError, "metadata-safe"):
            map_events([evidence])

    def _credential_text(self, password: str = "private-test-password") -> str:
        return "\n".join(
            [
                "# generated by Neo4j Aura",
                "NEO4J_URI=neo4j+s://abc123.databases.neo4j.io",
                "NEO4J_USERNAME=neo4j",
                "NEO4J_PASSWORD=" + password,
                "NEO4J_DATABASE=neo4j",
                "AURA_INSTANCEID=abc123",
                "AURA_INSTANCENAME=Free instance",
                "",
            ]
        )

    def _write_test_credentials(self, path: Path, text: str | None = None) -> None:
        payload = self._credential_text() if text is None else text
        # The clear text is deliberately synthetic and confined to a 0600 temp fixture.
        # codeql[py/clear-text-storage-sensitive-data]
        path.write_text(payload, encoding="utf-8")
        path.chmod(0o600)

    def test_credentials_are_owner_only_and_secret_safe(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "credentials.txt"
            self._write_test_credentials(path)
            credentials = load_aura_credentials(path)
            self.assertIsInstance(credentials, AuraCredentials)
            self.assertEqual(credentials.database, "neo4j")
            self.assertNotIn("private-test-password", repr(credentials))

            path.chmod(0o644)
            with self.assertRaisesRegex(Neo4jPrototypeError, "0600") as caught:
                load_aura_credentials(path)
            self.assertNotIn("private-test-password", str(caught.exception))

    def test_credentials_reject_symlink_hardlink_and_unknown_key(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            path = root / "credentials.txt"
            self._write_test_credentials(path)

            link = root / "link.txt"
            link.symlink_to(path)
            with self.assertRaises(Neo4jPrototypeError):
                load_aura_credentials(link)

            hardlink = root / "hardlink.txt"
            os.link(str(path), str(hardlink))
            with self.assertRaisesRegex(Neo4jPrototypeError, "hard link"):
                load_aura_credentials(path)
            hardlink.unlink()

            self._write_test_credentials(path, self._credential_text() + "EXTRA_SECRET=value\n")
            with self.assertRaisesRegex(Neo4jPrototypeError, "unexpected setting") as caught:
                load_aura_credentials(path)
            self.assertNotIn("value", str(caught.exception))

    def test_malformed_credential_uri_has_redacted_diagnostic(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "credentials.txt"
            text = self._credential_text().replace(
                "neo4j+s://abc123.databases.neo4j.io",
                "neo4j+s://user：TOPSECRET@abc123.databases.neo4j.io",
            )
            self._write_test_credentials(path, text)
            with self.assertRaisesRegex(Neo4jPrototypeError, "credential URI is invalid") as caught:
                load_aura_credentials(path)
            self.assertNotIn("TOPSECRET", str(caught.exception))

    def test_load_is_parameterized_transactional_and_non_destructive(self) -> None:
        bundle = map_events([event("evt_00000000-0000-5000-8000-000000000005")])
        driver = FakeDriver(bundle.counts())
        first = load_graph(driver, "neo4j", bundle, batch_size=1)
        second = load_graph(driver, "neo4j", bundle, batch_size=1)
        self.assertEqual(first, second)
        self.assertEqual(driver.write_transactions, 4)
        queries = [query for query, _, _ in driver.calls]
        for expected in (
            EVENT_QUERY,
            SUBJECT_QUERY,
            ABOUT_QUERY,
            CITES_QUERY,
        ):
            self.assertEqual(queries.count(expected), 2)
        self.assertNotIn(DERIVED_FROM_QUERY, queries)
        self.assertNotIn(SUPERSEDES_QUERY, queries)
        self.assertTrue(all("DELETE" not in query.upper() for query in queries))
        for query, parameters, _ in driver.calls:
            if "UNWIND $rows" in query:
                self.assertIn("rows", parameters)
                self.assertNotIn(bundle.events[0]["event_id"], query)

    def test_invalid_batch_size_has_no_side_effects(self) -> None:
        bundle = map_events([event("evt_00000000-0000-5000-8000-000000000009")])
        driver = FakeDriver(bundle.counts())
        with self.assertRaisesRegex(Neo4jPrototypeError, "batch size"):
            load_graph(driver, "neo4j", bundle, batch_size=0)
        self.assertEqual(driver.calls, [])
        self.assertEqual(driver.write_transactions, 0)

    def test_search_is_authorized_temporal_and_metadata_only(self) -> None:
        driver = FakeDriver(
            {
                "events": 0,
                "subjects": 0,
                "evidence": 0,
                "about": 0,
                "cites": 0,
                "derived_from": 0,
                "supersedes": 0,
            }
        )
        driver.search_rows = [
            {
                "event_id": "evt_00000000-0000-5000-8000-000000000006",
                "event_type": "decision.recorded",
                "system_time": "2026-08-21T00:00:00Z",
                "valid_from": "2026-08-20",
                "valid_to_open": True,
                "valid_to_bound": "2026-08-20",
                "valid_precision": "day",
                "classification": "internal",
                "source_path": "analyses/TEST_2026-08-20/decision_record.json",
                "source_locator": "json",
                "subjects": ["entity:internal:test"],
                "score": 1.23456789,
            }
        ]
        result = search_graph(
            driver,
            "neo4j",
            question="test decision",
            classification="internal",
            as_of="2026-08-21T01:00:00Z",
            valid_at="2026-08-20T12:00:00Z",
            top_k=5,
        )
        self.assertEqual(result["content_mode"], "metadata-only")
        self.assertEqual(result["result_count"], 1)
        self.assertNotIn("payload", json.dumps(result))
        query, parameters, _ = driver.calls[-1]
        self.assertEqual(query, SEARCH_QUERY)
        self.assertIn("node.classification = $classification", query)
        self.assertIn("datetime(node.system_time) <= datetime($as_of)", query)
        self.assertIn("date(substring(node.valid_from, 0, 10))", query)
        self.assertIn("CASE WHEN node.valid_from CONTAINS 'T'", query)
        self.assertEqual(parameters["classification"], "internal")
        self.assertEqual(parameters["query"], '"test" OR "decision"')
        self.assertEqual(parameters["valid_at_date"], "2026-08-20")
        with self.assertRaisesRegex(Neo4jPrototypeError, "internal"):
            search_graph(
                driver,
                "neo4j",
                question="test",
                classification="public",
                as_of="2026-08-21T01:00:00Z",
                valid_at="2026-08-20T12:00:00Z",
                top_k=5,
            )

    def test_index_name_is_fixed(self) -> None:
        self.assertEqual(FULLTEXT_INDEX, "memory_prototype_v1_event_search")
        self.assertIn("'memory_prototype_v1_event_search'", SEARCH_QUERY)


if __name__ == "__main__":
    unittest.main(verbosity=2)
