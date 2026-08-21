#!/usr/bin/env python3
"""Fail-closed, ID-only ranking boundary for the Neo4j smoke projection.

The caller must finish authorization, bitemporal filtering, source-policy checks,
and exact evidence resolution before invoking this module.  Neo4j receives only a
trusted dataset identifier, the query terms, and the already-authorized event-ID
allowlist.  It can reorder or omit those IDs; it cannot grant access to another ID
or return event content.

This module takes an injected driver and imports no Neo4j package.  The production
launcher may obtain a driver through ``memory_neo4j`` after loading credentials,
while offline tests remain dependency-free.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass
from typing import Any, Mapping, Optional, Sequence, Tuple

try:
    from memory_neo4j import PROTOTYPE_DATASET
except ModuleNotFoundError:  # pragma: no cover - package-style import
    from scripts.memory_neo4j import PROTOTYPE_DATASET


FULLTEXT_INDEX = "memory_prototype_v1_event_search"
MAX_AUTHORIZED_EVENT_IDS = 10_000
MAX_QUERY_CHARACTERS = 4_096
MAX_RESULTS = 100

EVENT_ID_RE = re.compile(
    r"^evt_[0-9a-f]{8}-[0-9a-f]{4}-[57][0-9a-f]{3}-"
    r"[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)
DATABASE_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
TOKEN_RE = re.compile(r"[A-Za-z0-9]+")


class Neo4jRankerError(RuntimeError):
    """The untrusted ranker response failed its closed boundary."""


@dataclass(frozen=True)
class RankedEvent:
    """One content-free rank result."""

    event_id: str
    score: float


# The index name, labels, property names, and result shape are literals.  Query
# text and all IDs stay in parameters, never in the Cypher source.
RANK_AUTHORIZED_QUERY = """
CALL db.index.fulltext.queryNodes('memory_prototype_v1_event_search', $query)
YIELD node, score
WHERE node.prototype_dataset = $dataset
  AND node.event_id IN $authorized_event_ids
RETURN node.prototype_dataset AS dataset,
       node.event_id AS event_id,
       score AS score
ORDER BY score DESC, event_id ASC
LIMIT $limit
""".strip()


def _lucene_query(query_text: str) -> str:
    if not isinstance(query_text, str) or not query_text or len(query_text) > MAX_QUERY_CHARACTERS:
        raise Neo4jRankerError("query_text must be a bounded nonempty string")
    tokens = []
    for token in TOKEN_RE.findall(query_text.casefold()):
        if len(token) >= 2 and token not in tokens:
            tokens.append(token)
    if not tokens:
        raise Neo4jRankerError("query_text contains no usable terms")
    return " OR ".join('"' + token + '"' for token in tokens)


def _authorized_ids(values: Sequence[str]) -> Tuple[str, ...]:
    if isinstance(values, (str, bytes)) or not isinstance(values, Sequence):
        raise Neo4jRankerError("authorized_event_ids must be a sequence")
    if len(values) > MAX_AUTHORIZED_EVENT_IDS:
        raise Neo4jRankerError("authorized_event_ids exceeds the bounded allowlist")
    materialized = tuple(values)
    if any(not isinstance(value, str) or EVENT_ID_RE.fullmatch(value) is None for value in materialized):
        raise Neo4jRankerError("authorized_event_ids contains an invalid event ID")
    if len(set(materialized)) != len(materialized):
        raise Neo4jRankerError("authorized_event_ids must be unique")
    return tuple(sorted(materialized))


def _records(result: Any) -> Sequence[Any]:
    if isinstance(result, tuple):
        if not result:
            raise Neo4jRankerError("Neo4j rank query returned a malformed result")
        rows = result[0]
    else:
        rows = getattr(result, "records", None)
        if rows is None and isinstance(result, list):
            rows = result
    if isinstance(rows, (str, bytes)) or not isinstance(rows, Sequence):
        raise Neo4jRankerError("Neo4j rank query returned malformed records")
    return rows


def _row_mapping(value: Any) -> Mapping[str, Any]:
    if isinstance(value, Mapping):
        row = dict(value)
    else:
        try:
            row = dict(value)
        except (TypeError, ValueError):
            raise Neo4jRankerError("Neo4j rank query returned a malformed row") from None
    if set(row) != {"dataset", "event_id", "score"}:
        raise Neo4jRankerError("Neo4j rank query returned a non-ID row")
    return row


def rank_authorized_events(
    driver: Any,
    database: str,
    *,
    query_text: str,
    authorized_event_ids: Sequence[str],
    limit: int,
    dataset: str = PROTOTYPE_DATASET,
) -> Tuple[RankedEvent, ...]:
    """Rank a trusted event-ID allowlist and return no content-bearing fields.

    ``authorized_event_ids`` is an authority input, not a hint.  Every returned
    ID is checked against it after the database call.  The ranker never expands
    the set and never substitutes for the caller's policy or evidence checks.
    """

    if dataset != PROTOTYPE_DATASET:
        raise Neo4jRankerError("dataset is not the trusted Neo4j prototype dataset")
    if not isinstance(database, str) or DATABASE_RE.fullmatch(database) is None:
        raise Neo4jRankerError("database name is invalid")
    if not isinstance(limit, int) or isinstance(limit, bool) or not 1 <= limit <= MAX_RESULTS:
        raise Neo4jRankerError("limit must be an integer from 1 to 100")

    authorized = _authorized_ids(authorized_event_ids)
    lucene_query = _lucene_query(query_text)
    if not authorized:
        return ()

    parameters = {
        "dataset": dataset,
        "query": lucene_query,
        "authorized_event_ids": list(authorized),
        "limit": limit,
    }
    try:
        raw_result = driver.execute_query(
            RANK_AUTHORIZED_QUERY,
            parameters_=parameters,
            database_=database,
        )
    except Exception:
        # Driver exceptions may contain endpoints or connection details.  Keep the
        # public error independent of the underlying message and never print here.
        raise Neo4jRankerError("Neo4j rank query failed") from None

    rows = _records(raw_result)
    if len(rows) > limit:
        raise Neo4jRankerError("Neo4j rank query returned more rows than authorized")

    allowed = frozenset(authorized)
    seen = set()
    ranked = []
    for raw_row in rows:
        row = _row_mapping(raw_row)
        if row.get("dataset") != dataset:
            raise Neo4jRankerError("Neo4j rank query returned the wrong dataset")
        event_id = row.get("event_id")
        if not isinstance(event_id, str) or EVENT_ID_RE.fullmatch(event_id) is None:
            raise Neo4jRankerError("Neo4j rank query returned an invalid event ID")
        if event_id not in allowed:
            raise Neo4jRankerError("Neo4j rank query returned an unauthorized event ID")
        if event_id in seen:
            raise Neo4jRankerError("Neo4j rank query returned a duplicate event ID")
        seen.add(event_id)
        raw_score = row.get("score")
        if isinstance(raw_score, bool) or not isinstance(raw_score, (int, float)):
            raise Neo4jRankerError("Neo4j rank query returned an invalid score")
        try:
            score = float(raw_score)
        except (OverflowError, ValueError):
            raise Neo4jRankerError("Neo4j rank query returned an invalid score") from None
        if not math.isfinite(score):
            raise Neo4jRankerError("Neo4j rank query returned a non-finite score")
        if score == 0.0:
            score = 0.0  # Normalize negative zero for stable serialization.
        ranked.append(RankedEvent(event_id=event_id, score=score))

    ranked.sort(key=lambda item: (-item.score, item.event_id))
    return tuple(ranked)


def ranked_event_ids(rows: Sequence[RankedEvent]) -> Tuple[str, ...]:
    """Return the content-free ordered IDs from a validated rank result."""

    if isinstance(rows, (str, bytes)) or not isinstance(rows, Sequence):
        raise Neo4jRankerError("ranked rows must be a sequence")
    if any(not isinstance(row, RankedEvent) for row in rows):
        raise Neo4jRankerError("ranked rows contain an unsupported value")
    event_ids = tuple(row.event_id for row in rows)
    if len(set(event_ids)) != len(event_ids):
        raise Neo4jRankerError("ranked rows contain duplicate event IDs")
    return event_ids


__all__ = [
    "Neo4jRankerError",
    "RANK_AUTHORIZED_QUERY",
    "RankedEvent",
    "rank_authorized_events",
    "ranked_event_ids",
]
