#!/usr/bin/env python3
"""Offline regressions for the fail-closed Neo4j ID ranker boundary."""

from __future__ import annotations

import json
import math
import unittest
from typing import Any, Mapping, Optional, Sequence

from memory_neo4j import PROTOTYPE_DATASET
from memory_neo4j_ranker import (
    RANK_AUTHORIZED_QUERY,
    Neo4jRankerError,
    RankedEvent,
    rank_authorized_events,
    ranked_event_ids,
)


EVENT_1 = "evt_00000000-0000-5000-8000-000000000001"
EVENT_2 = "evt_00000000-0000-5000-8000-000000000002"
EVENT_3 = "evt_00000000-0000-5000-8000-000000000003"
UNAUTHORIZED = "evt_00000000-0000-5000-8000-000000000099"
SECRET_EVENT_TEXT = "SECRET RAW EVENT PAYLOAD MUST NEVER REACH NEO4J"


class FakeDriver:
    def __init__(
        self,
        rows: Sequence[Mapping[str, Any]] = (),
        *,
        failure: Optional[Exception] = None,
    ) -> None:
        self.rows = list(rows)
        self.failure = failure
        self.calls: list[tuple[str, dict[str, Any], str]] = []

    def execute_query(
        self,
        query: str,
        *,
        parameters_: Mapping[str, Any],
        database_: str,
    ) -> tuple[list[Mapping[str, Any]], None, None]:
        self.calls.append((query, dict(parameters_), database_))
        if self.failure is not None:
            raise self.failure
        return list(self.rows), None, None


def row(event_id: str, score: Any, *, dataset: str = PROTOTYPE_DATASET) -> dict[str, Any]:
    return {"dataset": dataset, "event_id": event_id, "score": score}


class Neo4jAuthorizedRankerTests(unittest.TestCase):
    def test_only_allowlisted_ids_reach_parameterized_query_and_result_is_deterministic(self) -> None:
        driver = FakeDriver(
            [
                row(EVENT_2, 1.5),
                row(EVENT_3, 2.0),
                row(EVENT_1, 1.5),
            ]
        )
        result = rank_authorized_events(
            driver,
            "neo4j",
            query_text="AMZN decision; MATCH (n) RETURN n",
            authorized_event_ids=[EVENT_3, EVENT_1, EVENT_2],
            limit=3,
        )
        self.assertEqual(ranked_event_ids(result), (EVENT_3, EVENT_1, EVENT_2))
        self.assertEqual(
            result,
            (
                RankedEvent(EVENT_3, 2.0),
                RankedEvent(EVENT_1, 1.5),
                RankedEvent(EVENT_2, 1.5),
            ),
        )

        self.assertEqual(len(driver.calls), 1)
        query, parameters, database = driver.calls[0]
        self.assertEqual(query, RANK_AUTHORIZED_QUERY)
        self.assertEqual(database, "neo4j")
        self.assertEqual(
            parameters["authorized_event_ids"],
            [EVENT_1, EVENT_2, EVENT_3],
        )
        self.assertNotIn(UNAUTHORIZED, parameters["authorized_event_ids"])
        self.assertEqual(
            parameters["query"],
            '"amzn" OR "decision" OR "match" OR "return"',
        )
        self.assertNotIn("MATCH (n) RETURN n", query)
        self.assertNotIn(EVENT_1, query)
        self.assertNotIn(SECRET_EVENT_TEXT, json.dumps(driver.calls))

        rendered = json.dumps(
            [item.__dict__ for item in result], sort_keys=True
        )
        self.assertNotIn("payload", rendered)
        self.assertNotIn("search_text", rendered)
        self.assertNotIn("source_path", rendered)

    def test_empty_authority_returns_empty_without_contacting_driver(self) -> None:
        driver = FakeDriver([row(UNAUTHORIZED, 99.0)])
        result = rank_authorized_events(
            driver,
            "neo4j",
            query_text="decision",
            authorized_event_ids=[],
            limit=5,
        )
        self.assertEqual(result, ())
        self.assertEqual(driver.calls, [])

    def test_unauthorized_duplicate_bad_dataset_and_over_limit_fail_closed(self) -> None:
        cases = (
            (
                [row(UNAUTHORIZED, 1.0)],
                2,
                "unauthorized event ID",
            ),
            (
                [row(EVENT_1, 1.0), row(EVENT_1, 0.5)],
                2,
                "duplicate event ID",
            ),
            (
                [row(EVENT_1, 1.0, dataset="another-dataset")],
                2,
                "wrong dataset",
            ),
            (
                [row(EVENT_1, 1.0), row(EVENT_2, 0.5)],
                1,
                "more rows than authorized",
            ),
        )
        for rows, limit, error in cases:
            with self.subTest(error=error):
                with self.assertRaisesRegex(Neo4jRankerError, error):
                    rank_authorized_events(
                        FakeDriver(rows),
                        "neo4j",
                        query_text="decision",
                        authorized_event_ids=[EVENT_1, EVENT_2],
                        limit=limit,
                    )

    def test_malformed_rows_and_scores_fail_closed(self) -> None:
        malformed_rows = (
            ({"dataset": PROTOTYPE_DATASET, "event_id": EVENT_1}, "non-ID row"),
            (
                {
                    "dataset": PROTOTYPE_DATASET,
                    "event_id": EVENT_1,
                    "score": 1.0,
                    "payload": SECRET_EVENT_TEXT,
                },
                "non-ID row",
            ),
            (row("not-an-event", 1.0), "invalid event ID"),
            (row(EVENT_1, True), "invalid score"),
            (row(EVENT_1, "1.0"), "invalid score"),
            (row(EVENT_1, math.nan), "non-finite score"),
            (row(EVENT_1, math.inf), "non-finite score"),
        )
        for bad_row, error in malformed_rows:
            with self.subTest(error=error, row=bad_row):
                with self.assertRaisesRegex(Neo4jRankerError, error):
                    rank_authorized_events(
                        FakeDriver([bad_row]),
                        "neo4j",
                        query_text="decision",
                        authorized_event_ids=[EVENT_1],
                        limit=1,
                    )

    def test_authority_inputs_are_closed_and_bad_dataset_never_contacts_driver(self) -> None:
        driver = FakeDriver()
        invalid_calls = (
            ({"authorized_event_ids": [EVENT_1, EVENT_1]}, "unique"),
            ({"authorized_event_ids": ["not-an-event"]}, "invalid event ID"),
            ({"authorized_event_ids": [[EVENT_1]]}, "invalid event ID"),
            ({"dataset": "untrusted-dataset"}, "trusted"),
            ({"database": "bad database"}, "database name"),
            ({"limit": 0}, "limit"),
            ({"query_text": "!"}, "usable terms"),
        )
        defaults = {
            "driver": driver,
            "database": "neo4j",
            "query_text": "decision",
            "authorized_event_ids": [EVENT_1],
            "limit": 1,
            "dataset": PROTOTYPE_DATASET,
        }
        for overrides, error in invalid_calls:
            with self.subTest(error=error):
                arguments = dict(defaults)
                arguments.update(overrides)
                with self.assertRaisesRegex(Neo4jRankerError, error):
                    rank_authorized_events(**arguments)
        self.assertEqual(driver.calls, [])

    def test_driver_failure_does_not_expose_its_message(self) -> None:
        secret = "neo4j+s://user:TOPSECRET@example.invalid"
        driver = FakeDriver(failure=RuntimeError(secret))
        with self.assertRaisesRegex(Neo4jRankerError, "rank query failed") as caught:
            rank_authorized_events(
                driver,
                "neo4j",
                query_text="decision",
                authorized_event_ids=[EVENT_1],
                limit=1,
            )
        self.assertNotIn(secret, str(caught.exception))

    def test_ranked_event_id_helper_rejects_unvalidated_or_duplicate_rows(self) -> None:
        with self.assertRaisesRegex(Neo4jRankerError, "unsupported"):
            ranked_event_ids([{"event_id": EVENT_1}])  # type: ignore[list-item]
        with self.assertRaisesRegex(Neo4jRankerError, "duplicate"):
            ranked_event_ids(
                [RankedEvent(EVENT_1, 1.0), RankedEvent(EVENT_1, 0.5)]
            )


if __name__ == "__main__":
    unittest.main(verbosity=2)
