#!/usr/bin/env python3
"""Disposable Neo4j projection for the reviewed legacy-memory adapter.

The projection is intentionally smaller than the permanent-memory contracts.  It
uploads metadata and graph links only; canonical repository bytes remain the
authority.  The official Neo4j driver is imported only by commands that contact
Aura, so the pure mapping and its tests remain dependency-free.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import stat
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any, Iterable, Mapping, Optional, Sequence, Tuple
from urllib.parse import urlsplit

from memory_adapters import adapt_repository
from memory_contract import validate_events


PROTOTYPE_DATASET = "equity-research-memory/v1"
FULLTEXT_INDEX = "memory_prototype_v1_event_search"
MAX_CREDENTIAL_BYTES = 16 * 1024
ALLOWED_SOURCE_ROOTS = ("analyses", "commodity", "screener")
EXPECTED_CREDENTIAL_KEYS = frozenset(
    {
        "NEO4J_URI",
        "NEO4J_USERNAME",
        "NEO4J_PASSWORD",
        "NEO4J_DATABASE",
        "AURA_INSTANCEID",
        "AURA_INSTANCENAME",
    }
)
EVIDENCE_RE = re.compile(r"^evidence:sha256:([0-9a-f]{64})#(.+)$")
TOKEN_RE = re.compile(r"[A-Za-z0-9]+")
SAFE_SOURCE_PATH_RE = re.compile(r"^[A-Za-z0-9._/-]{1,512}$")
SAFE_LOCATOR_RE = re.compile(r"^(?:json|line-[1-9][0-9]{0,8})$")


class Neo4jPrototypeError(RuntimeError):
    """Raised when the disposable projection cannot fail closed."""


@dataclass(frozen=True)
class AuraCredentials:
    uri: str
    username: str
    password: str = field(repr=False)
    database: str = "neo4j"
    instance_id: str = ""
    instance_name: str = ""


@dataclass(frozen=True)
class GraphBundle:
    events: Tuple[Mapping[str, Any], ...]
    subjects: Tuple[Mapping[str, Any], ...]
    evidence: Tuple[Mapping[str, Any], ...]
    about: Tuple[Mapping[str, str], ...]
    cites: Tuple[Mapping[str, str], ...]
    derived_from: Tuple[Mapping[str, str], ...]
    supersedes: Tuple[Mapping[str, str], ...]

    def counts(self) -> dict[str, int]:
        return {
            "events": len(self.events),
            "subjects": len(self.subjects),
            "evidence": len(self.evidence),
            "about": len(self.about),
            "cites": len(self.cites),
            "derived_from": len(self.derived_from),
            "supersedes": len(self.supersedes),
        }


def _snapshot(info: os.stat_result) -> tuple[int, ...]:
    return (
        info.st_dev,
        info.st_ino,
        info.st_mode,
        info.st_nlink,
        info.st_uid,
        info.st_gid,
        info.st_size,
        info.st_mtime_ns,
        info.st_ctime_ns,
    )


def _read_private_regular_file(path: Path) -> str:
    """Read a small owner-only file while detecting simple replacement races."""

    try:
        named_before = os.lstat(str(path))
    except OSError as exc:
        raise Neo4jPrototypeError("credential file is missing or unreadable") from exc
    if not stat.S_ISREG(named_before.st_mode):
        raise Neo4jPrototypeError("credential file must be a regular file")
    if named_before.st_uid != os.geteuid():
        raise Neo4jPrototypeError("credential file must be owned by the current user")
    if named_before.st_nlink != 1:
        raise Neo4jPrototypeError("credential file must have exactly one hard link")
    if stat.S_IMODE(named_before.st_mode) & 0o077:
        raise Neo4jPrototypeError("credential file permissions must be owner-only (0600)")
    if named_before.st_size > MAX_CREDENTIAL_BYTES:
        raise Neo4jPrototypeError("credential file is unexpectedly large")

    flags = os.O_RDONLY
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    try:
        descriptor = os.open(str(path), flags)
    except OSError as exc:
        raise Neo4jPrototypeError("credential file could not be opened safely") from exc
    try:
        opened_before = os.fstat(descriptor)
        if _snapshot(opened_before) != _snapshot(named_before):
            raise Neo4jPrototypeError("credential file changed while it was opened")
        raw = bytearray()
        while len(raw) <= MAX_CREDENTIAL_BYTES:
            chunk = os.read(descriptor, min(4096, MAX_CREDENTIAL_BYTES + 1 - len(raw)))
            if not chunk:
                break
            raw.extend(chunk)
        if len(raw) > MAX_CREDENTIAL_BYTES:
            raise Neo4jPrototypeError("credential file is unexpectedly large")
        opened_after = os.fstat(descriptor)
        if _snapshot(opened_after) != _snapshot(opened_before):
            raise Neo4jPrototypeError("credential file changed while it was read")
    finally:
        os.close(descriptor)

    try:
        named_after = os.lstat(str(path))
    except OSError as exc:
        raise Neo4jPrototypeError("credential file changed while it was read") from exc
    if _snapshot(named_after) != _snapshot(named_before):
        raise Neo4jPrototypeError("credential file changed while it was read")
    try:
        return bytes(raw).decode("utf-8", errors="strict")
    except UnicodeDecodeError as exc:
        raise Neo4jPrototypeError("credential file must be UTF-8 text") from exc


def load_aura_credentials(path: Path) -> AuraCredentials:
    """Load the Aura dotenv file without placing secret values in diagnostics."""

    text = _read_private_regular_file(path)
    if "\x00" in text:
        raise Neo4jPrototypeError("credential file contains invalid bytes")
    values: dict[str, str] = {}
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            raise Neo4jPrototypeError("credential file contains an invalid line")
        key, value = line.split("=", 1)
        key, value = key.strip(), value.strip()
        if key not in EXPECTED_CREDENTIAL_KEYS:
            raise Neo4jPrototypeError("credential file contains an unexpected setting")
        if key in values:
            raise Neo4jPrototypeError("credential file contains a duplicate setting")
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
            value = value[1:-1]
        if not value or "\r" in value or "\n" in value:
            raise Neo4jPrototypeError("credential file contains an empty or invalid value")
        values[key] = value
    if set(values) != EXPECTED_CREDENTIAL_KEYS:
        raise Neo4jPrototypeError("credential file does not contain the expected settings")

    try:
        parsed = urlsplit(values["NEO4J_URI"])
        host = parsed.hostname or ""
    except ValueError as exc:
        raise Neo4jPrototypeError("credential URI is invalid") from exc
    if (
        parsed.scheme != "neo4j+s"
        or not host.endswith(".databases.neo4j.io")
        or parsed.username is not None
        or parsed.password is not None
        or parsed.query
        or parsed.fragment
    ):
        raise Neo4jPrototypeError("credential URI is not a certificate-validated Aura URI")
    if host.split(".", 1)[0].casefold() != values["AURA_INSTANCEID"].casefold():
        raise Neo4jPrototypeError("credential URI and Aura instance ID do not agree")
    if re.fullmatch(r"[A-Za-z0-9._-]{1,128}", values["NEO4J_DATABASE"]) is None:
        raise Neo4jPrototypeError("credential database name is invalid")

    return AuraCredentials(
        uri=values["NEO4J_URI"],
        username=values["NEO4J_USERNAME"],
        password=values["NEO4J_PASSWORD"],
        database=values["NEO4J_DATABASE"],
        instance_id=values["AURA_INSTANCEID"],
        instance_name=values["AURA_INSTANCENAME"],
    )


def _source_path(payload: Mapping[str, Any]) -> str:
    value = payload.get("source_path")
    if not isinstance(value, str) or not value:
        raise Neo4jPrototypeError("adapter event has no source_path")
    candidate = PurePosixPath(value)
    if candidate.is_absolute() or ".." in candidate.parts or not candidate.parts:
        raise Neo4jPrototypeError("adapter event has an unsafe source_path")
    if candidate.parts[0] not in ALLOWED_SOURCE_ROOTS:
        raise Neo4jPrototypeError("adapter event source is outside the reviewed prototype roots")
    normalized = candidate.as_posix()
    if SAFE_SOURCE_PATH_RE.fullmatch(normalized) is None:
        raise Neo4jPrototypeError("adapter event source_path is not metadata-safe")
    return normalized


def _source_locator(value: Any) -> str:
    if not isinstance(value, str) or SAFE_LOCATOR_RE.fullmatch(value) is None:
        raise Neo4jPrototypeError("adapter event source_locator is not metadata-safe")
    return value


def _valid_time(
    event: Mapping[str, Any], payload: Mapping[str, Any]
) -> tuple[str, Optional[str], str]:
    value = event.get("valid_time")
    if not isinstance(value, Mapping):
        raise Neo4jPrototypeError("adapter event has invalid valid_time")
    start, end = value.get("from"), value.get("to")
    if not isinstance(start, str) or (end is not None and not isinstance(end, str)):
        raise Neo4jPrototypeError("adapter event has invalid valid_time bounds")
    time_mapping = payload.get("time_mapping")
    precision = (
        time_mapping.get("valid_time_precision")
        if isinstance(time_mapping, Mapping)
        else None
    )
    if not isinstance(precision, str):
        raise Neo4jPrototypeError("adapter event has invalid valid_time precision")
    if precision not in {"day", "instant"}:
        raise Neo4jPrototypeError("adapter event has unsupported valid_time precision")
    return start, end, precision


def map_events(events: Iterable[Mapping[str, Any]]) -> GraphBundle:
    """Map validated legacy envelopes into a deterministic, metadata-only graph."""

    event_rows: list[Mapping[str, Any]] = []
    subjects: set[str] = set()
    evidence_rows: dict[str, Mapping[str, Any]] = {}
    about: set[tuple[str, str]] = set()
    cites: set[tuple[str, str]] = set()
    derived: set[tuple[str, str]] = set()
    supersedes: set[tuple[str, str]] = set()
    seen_events: set[str] = set()

    ordered = sorted(events, key=lambda item: str(item.get("event_id", "")))
    for event in ordered:
        event_id = event.get("event_id")
        if not isinstance(event_id, str) or not event_id or event_id in seen_events:
            raise Neo4jPrototypeError("adapter events require unique event IDs")
        seen_events.add(event_id)
        policy = event.get("policy")
        if not isinstance(policy, Mapping):
            raise Neo4jPrototypeError("adapter event has no policy")
        if policy.get("classification") != "internal" or policy.get("retention") != "permanent":
            raise Neo4jPrototypeError(
                "prototype accepts only internal, permanent legacy adapter events"
            )
        payload = event.get("payload")
        if not isinstance(payload, Mapping):
            raise Neo4jPrototypeError("adapter event has no payload wrapper")
        source_path = _source_path(payload)
        event_type = event.get("event_type")
        system_time = event.get("system_time")
        record_type = payload.get("record_type")
        source_locator = _source_locator(payload.get("source_locator"))
        integrity = event.get("integrity")
        if not all(isinstance(item, str) and item for item in (event_type, system_time, record_type)):
            raise Neo4jPrototypeError("adapter event metadata is incomplete")
        if not isinstance(integrity, Mapping) or not isinstance(integrity.get("payload_sha256"), str):
            raise Neo4jPrototypeError("adapter event integrity is incomplete")
        valid_from, valid_to, valid_precision = _valid_time(event, payload)
        subject_values = event.get("subject_ids")
        if not isinstance(subject_values, list) or not subject_values:
            raise Neo4jPrototypeError("adapter event requires subjects")
        if not all(isinstance(value, str) and value for value in subject_values):
            raise Neo4jPrototypeError("adapter event contains an invalid subject")

        # Deliberately exclude payload.record and every canonical source byte.  The first
        # Aura smoke test proves graph structure without uploading research prose.
        raw_search_text = " ".join(
            [event_type, record_type, source_path] + sorted(subject_values)
        )
        # Normalize punctuation and underscores before Lucene sees the property so a
        # question for "AMZN decision" matches AMZN_2026 and decision.recorded.
        search_text = " ".join(TOKEN_RE.findall(raw_search_text.casefold()))
        event_rows.append(
            {
                "dataset": PROTOTYPE_DATASET,
                "event_id": event_id,
                "event_type": event_type,
                "system_time": system_time,
                "valid_from": valid_from,
                "valid_to_open": valid_to is None,
                "valid_to_bound": valid_to if valid_to is not None else valid_from,
                "valid_precision": valid_precision,
                "classification": "internal",
                "retention": "permanent",
                "record_type": record_type,
                "source_path": source_path,
                "source_locator": source_locator,
                "payload_sha256": integrity["payload_sha256"],
                "search_text": search_text,
            }
        )
        for subject_id in subject_values:
            subjects.add(subject_id)
            about.add((event_id, subject_id))
        for evidence_ref in event.get("evidence_refs", []):
            if not isinstance(evidence_ref, str):
                raise Neo4jPrototypeError("adapter event contains an invalid evidence reference")
            match = EVIDENCE_RE.fullmatch(evidence_ref)
            if match is None:
                raise Neo4jPrototypeError("adapter event contains an unsupported evidence reference")
            locator = _source_locator(match.group(2))
            evidence_rows[evidence_ref] = {
                "dataset": PROTOTYPE_DATASET,
                "evidence_ref": evidence_ref,
                "sha256": match.group(1),
                "locator": locator,
            }
            cites.add((event_id, evidence_ref))
        for target in event.get("derived_from", []):
            if not isinstance(target, str):
                raise Neo4jPrototypeError("adapter event contains an invalid derived_from edge")
            derived.add((event_id, target))
        for target in event.get("supersedes", []):
            if not isinstance(target, str):
                raise Neo4jPrototypeError("adapter event contains an invalid supersedes edge")
            supersedes.add((event_id, target))

    for source, target in sorted(derived | supersedes):
        if source not in seen_events or target not in seen_events:
            raise Neo4jPrototypeError("adapter event graph contains a missing event target")

    return GraphBundle(
        events=tuple(event_rows),
        subjects=tuple(
            {"dataset": PROTOTYPE_DATASET, "subject_id": value} for value in sorted(subjects)
        ),
        evidence=tuple(evidence_rows[value] for value in sorted(evidence_rows)),
        about=tuple(
            {"dataset": PROTOTYPE_DATASET, "event_id": source, "subject_id": target}
            for source, target in sorted(about)
        ),
        cites=tuple(
            {"dataset": PROTOTYPE_DATASET, "event_id": source, "evidence_ref": target}
            for source, target in sorted(cites)
        ),
        derived_from=tuple(
            {"dataset": PROTOTYPE_DATASET, "source_id": source, "target_id": target}
            for source, target in sorted(derived)
        ),
        supersedes=tuple(
            {"dataset": PROTOTYPE_DATASET, "source_id": source, "target_id": target}
            for source, target in sorted(supersedes)
        ),
    )


SCHEMA_QUERIES = (
    "CREATE CONSTRAINT memory_prototype_v1_event_key IF NOT EXISTS "
    "FOR (n:MemoryPrototypeEvent) REQUIRE (n.prototype_dataset, n.event_id) IS UNIQUE",
    "CREATE CONSTRAINT memory_prototype_v1_subject_key IF NOT EXISTS "
    "FOR (n:MemoryPrototypeSubject) REQUIRE (n.prototype_dataset, n.subject_id) IS UNIQUE",
    "CREATE CONSTRAINT memory_prototype_v1_evidence_key IF NOT EXISTS "
    "FOR (n:MemoryPrototypeEvidence) REQUIRE (n.prototype_dataset, n.evidence_ref) IS UNIQUE",
    "CREATE FULLTEXT INDEX memory_prototype_v1_event_search IF NOT EXISTS "
    "FOR (n:MemoryPrototypeEvent) ON EACH [n.search_text] "
    "OPTIONS {indexConfig: {`fulltext.analyzer`: 'standard-no-stop-words'}}",
)

EXPECTED_CONSTRAINTS = {
    "memory_prototype_v1_event_key": (
        ["MemoryPrototypeEvent"],
        ["prototype_dataset", "event_id"],
    ),
    "memory_prototype_v1_subject_key": (
        ["MemoryPrototypeSubject"],
        ["prototype_dataset", "subject_id"],
    ),
    "memory_prototype_v1_evidence_key": (
        ["MemoryPrototypeEvidence"],
        ["prototype_dataset", "evidence_ref"],
    ),
}

EVENT_QUERY = """
UNWIND $rows AS row
MERGE (node:MemoryPrototype:MemoryEvent {prototype_dataset: row.dataset, event_id: row.event_id})
SET node:MemoryPrototypeEvent,
    node.event_type = row.event_type,
    node.system_time = row.system_time,
    node.valid_from = row.valid_from,
    node.valid_to_open = row.valid_to_open,
    node.valid_to_bound = row.valid_to_bound,
    node.valid_precision = row.valid_precision,
    node.classification = row.classification,
    node.retention = row.retention,
    node.record_type = row.record_type,
    node.source_path = row.source_path,
    node.source_locator = row.source_locator,
    node.payload_sha256 = row.payload_sha256,
    node.search_text = row.search_text
""".strip()

SUBJECT_QUERY = """
UNWIND $rows AS row
MERGE (node:MemoryPrototype:MemorySubject {prototype_dataset: row.dataset, subject_id: row.subject_id})
SET node:MemoryPrototypeSubject
""".strip()

EVIDENCE_QUERY = """
UNWIND $rows AS row
MERGE (node:MemoryPrototype:MemoryEvidence {prototype_dataset: row.dataset, evidence_ref: row.evidence_ref})
SET node:MemoryPrototypeEvidence,
    node.sha256 = row.sha256,
    node.locator = row.locator
""".strip()

ABOUT_QUERY = """
UNWIND $rows AS row
MATCH (source:MemoryPrototypeEvent {prototype_dataset: row.dataset, event_id: row.event_id})
MATCH (target:MemoryPrototypeSubject {prototype_dataset: row.dataset, subject_id: row.subject_id})
MERGE (source)-[:ABOUT]->(target)
""".strip()

CITES_QUERY = """
UNWIND $rows AS row
MATCH (source:MemoryPrototypeEvent {prototype_dataset: row.dataset, event_id: row.event_id})
MATCH (target:MemoryPrototypeEvidence {prototype_dataset: row.dataset, evidence_ref: row.evidence_ref})
MERGE (source)-[:CITES]->(target)
""".strip()

DERIVED_FROM_QUERY = """
UNWIND $rows AS row
MATCH (source:MemoryPrototypeEvent {prototype_dataset: row.dataset, event_id: row.source_id})
MATCH (target:MemoryPrototypeEvent {prototype_dataset: row.dataset, event_id: row.target_id})
MERGE (source)-[:DERIVED_FROM]->(target)
""".strip()

SUPERSEDES_QUERY = """
UNWIND $rows AS row
MATCH (source:MemoryPrototypeEvent {prototype_dataset: row.dataset, event_id: row.source_id})
MATCH (target:MemoryPrototypeEvent {prototype_dataset: row.dataset, event_id: row.target_id})
MERGE (source)-[:SUPERSEDES]->(target)
""".strip()

DOCTOR_QUERY = """
CALL () { MATCH (n:MemoryPrototypeEvent {prototype_dataset: $dataset}) RETURN count(n) AS events }
CALL () { MATCH (n:MemoryPrototypeSubject {prototype_dataset: $dataset}) RETURN count(n) AS subjects }
CALL () { MATCH (n:MemoryPrototypeEvidence {prototype_dataset: $dataset}) RETURN count(n) AS evidence }
CALL () { MATCH (:MemoryPrototypeEvent {prototype_dataset: $dataset})-[r:ABOUT]->() RETURN count(r) AS about }
CALL () { MATCH (:MemoryPrototypeEvent {prototype_dataset: $dataset})-[r:CITES]->() RETURN count(r) AS cites }
CALL () { MATCH (:MemoryPrototypeEvent {prototype_dataset: $dataset})-[r:DERIVED_FROM]->() RETURN count(r) AS derived_from }
CALL () { MATCH (:MemoryPrototypeEvent {prototype_dataset: $dataset})-[r:SUPERSEDES]->() RETURN count(r) AS supersedes }
RETURN events, subjects, evidence, about, cites, derived_from, supersedes
""".strip()

INDEX_QUERY = """
SHOW FULLTEXT INDEXES YIELD name, state, labelsOrTypes, properties, options
WHERE name = $index_name
RETURN state, labelsOrTypes, properties, options
""".strip()

CONSTRAINT_QUERY = """
SHOW CONSTRAINTS YIELD name, type, labelsOrTypes, properties
WHERE name IN $constraint_names
RETURN name, type, labelsOrTypes, properties
""".strip()

OWNERSHIP_QUERY = """
MATCH (node)
WHERE NOT node:MemoryPrototype
   OR node.prototype_dataset IS NULL
   OR node.prototype_dataset <> $dataset
RETURN count(node) AS foreign_nodes
""".strip()

SEARCH_QUERY = """
CALL db.index.fulltext.queryNodes('memory_prototype_v1_event_search', $query)
YIELD node, score
WHERE node.prototype_dataset = $dataset
  AND node.classification = $classification
  AND datetime(node.system_time) <= datetime($as_of)
  AND (
    (
      node.valid_precision = 'day'
      AND date(substring(node.valid_from, 0, 10)) <= date($valid_at_date)
      AND (
        node.valid_to_open = true
        OR date(substring(node.valid_to_bound, 0, 10)) >= date($valid_at_date)
      )
    )
    OR
    (
      node.valid_precision = 'instant'
      AND datetime(
        CASE WHEN node.valid_from CONTAINS 'T'
             THEN node.valid_from ELSE node.valid_from + 'T00:00:00Z' END
      ) <= datetime($valid_at)
      AND (
        node.valid_to_open = true
        OR datetime(
          CASE WHEN node.valid_to_bound CONTAINS 'T'
               THEN node.valid_to_bound ELSE node.valid_to_bound + 'T23:59:59.999999Z' END
        ) >= datetime($valid_at)
      )
    )
  )
  AND NOT EXISTS {
    MATCH (successor:MemoryPrototypeEvent {prototype_dataset: $dataset})-[:SUPERSEDES]->(node)
    WHERE successor.classification = $classification
      AND datetime(successor.system_time) <= datetime($as_of)
      AND (
        (
          successor.valid_precision = 'day'
          AND date(substring(successor.valid_from, 0, 10)) <= date($valid_at_date)
          AND (
            successor.valid_to_open = true
            OR date(substring(successor.valid_to_bound, 0, 10)) >= date($valid_at_date)
          )
        )
        OR
        (
          successor.valid_precision = 'instant'
          AND datetime(
            CASE WHEN successor.valid_from CONTAINS 'T'
                 THEN successor.valid_from ELSE successor.valid_from + 'T00:00:00Z' END
          ) <= datetime($valid_at)
          AND (
            successor.valid_to_open = true
            OR datetime(
              CASE WHEN successor.valid_to_bound CONTAINS 'T'
                   THEN successor.valid_to_bound ELSE successor.valid_to_bound + 'T23:59:59.999999Z' END
            ) >= datetime($valid_at)
          )
        )
      )
  }
OPTIONAL MATCH (node)-[:ABOUT]->(subject:MemoryPrototypeSubject)
WITH node, score, collect(DISTINCT subject.subject_id) AS subjects
RETURN node.event_id AS event_id,
       node.event_type AS event_type,
       node.system_time AS system_time,
       node.valid_from AS valid_from,
       node.valid_to_open AS valid_to_open,
       node.valid_to_bound AS valid_to_bound,
       node.valid_precision AS valid_precision,
       node.classification AS classification,
       node.source_path AS source_path,
       node.source_locator AS source_locator,
       subjects,
       score
ORDER BY score DESC, event_id ASC
LIMIT $top_k
""".strip()


def _records(result: Any) -> list[Mapping[str, Any]]:
    if isinstance(result, tuple) and result:
        return list(result[0])
    records = getattr(result, "records", None)
    if records is not None:
        return list(records)
    if isinstance(result, list):
        return result
    return []


def _run(driver: Any, database: str, query: str, parameters: Optional[Mapping[str, Any]] = None) -> list[Mapping[str, Any]]:
    result = driver.execute_query(
        query,
        parameters_=dict(parameters or {}),
        database_=database,
    )
    return _records(result)


def _batches(rows: Sequence[Mapping[str, Any]], size: int) -> Iterable[list[Mapping[str, Any]]]:
    if size < 1 or size > 1000:
        raise Neo4jPrototypeError("batch size must be between 1 and 1000")
    for start in range(0, len(rows), size):
        yield list(rows[start : start + size])


def _load_transaction(
    driver: Any,
    database: str,
    lanes: Sequence[tuple[str, Sequence[Mapping[str, Any]]]],
    batch_size: int,
) -> None:
    """Write every data lane in one retryable transaction."""

    try:
        session_context = driver.session(database=database)
    except Exception as exc:
        raise Neo4jPrototypeError("Neo4j driver cannot open a write transaction") from exc
    with session_context as session:
        def write_all(transaction: Any) -> None:
            for query, rows in lanes:
                for batch in _batches(rows, batch_size):
                    transaction.run(query, rows=batch).consume()

        session.execute_write(write_all)


def _schema_transaction(driver: Any, database: str) -> None:
    """Install the closed prototype schema in one retryable transaction."""

    try:
        session_context = driver.session(database=database)
    except Exception as exc:
        raise Neo4jPrototypeError("Neo4j driver cannot open a schema transaction") from exc
    with session_context as session:
        def write_schema(transaction: Any) -> None:
            for query in SCHEMA_QUERIES:
                transaction.run(query).consume()

        session.execute_write(write_schema)


def _index_analyzer(row: Mapping[str, Any]) -> Optional[str]:
    options = row.get("options")
    if not isinstance(options, Mapping):
        return None
    config = options.get("indexConfig")
    if not isinstance(config, Mapping):
        return None
    value = config.get("fulltext.analyzer")
    return value if isinstance(value, str) else None


def doctor_graph(driver: Any, database: str) -> dict[str, Any]:
    rows = _run(driver, database, DOCTOR_QUERY, {"dataset": PROTOTYPE_DATASET})
    if len(rows) != 1:
        raise Neo4jPrototypeError("Neo4j doctor did not return graph counts")
    counts = {key: int(rows[0][key]) for key in GraphBundle.__dataclass_fields__}
    index_rows = _run(driver, database, INDEX_QUERY, {"index_name": FULLTEXT_INDEX})
    index_state = str(index_rows[0]["state"]) if len(index_rows) == 1 else "MISSING"
    index_shape_ok = (
        len(index_rows) == 1
        and list(index_rows[0].get("labelsOrTypes", [])) == ["MemoryPrototypeEvent"]
        and list(index_rows[0].get("properties", [])) == ["search_text"]
        and _index_analyzer(index_rows[0]) == "standard-no-stop-words"
    )
    constraint_rows = _run(
        driver,
        database,
        CONSTRAINT_QUERY,
        {"constraint_names": sorted(EXPECTED_CONSTRAINTS)},
    )
    observed_constraints = {
        str(row.get("name")): (
            str(row.get("type")),
            list(row.get("labelsOrTypes", [])),
            list(row.get("properties", [])),
        )
        for row in constraint_rows
    }
    constraints_verified = all(
        observed_constraints.get(name)
        == ("NODE_PROPERTY_UNIQUENESS", labels, properties)
        for name, (labels, properties) in EXPECTED_CONSTRAINTS.items()
    ) and len(observed_constraints) == len(EXPECTED_CONSTRAINTS)
    ownership_rows = _run(
        driver,
        database,
        OWNERSHIP_QUERY,
        {"dataset": PROTOTYPE_DATASET},
    )
    ownership_verified = (
        len(ownership_rows) == 1
        and int(ownership_rows[0].get("foreign_nodes", -1)) == 0
    )
    return {
        "schema": "memory-neo4j-prototype-doctor/v1",
        "dataset": PROTOTYPE_DATASET,
        "counts": counts,
        "fulltext_index": {
            "name": FULLTEXT_INDEX,
            "state": index_state,
            "shape_verified": index_shape_ok,
        },
        "constraints_verified": constraints_verified,
        "dedicated_instance_verified": ownership_verified,
        "content_mode": "metadata-only",
    }


def load_graph(driver: Any, database: str, bundle: GraphBundle, *, batch_size: int = 100) -> dict[str, Any]:
    """Idempotently merge the bundle; never delete database state."""

    if batch_size < 1 or batch_size > 1000:
        raise Neo4jPrototypeError("batch size must be between 1 and 1000")
    ownership_rows = _run(
        driver,
        database,
        OWNERSHIP_QUERY,
        {"dataset": PROTOTYPE_DATASET},
    )
    if (
        len(ownership_rows) != 1
        or int(ownership_rows[0].get("foreign_nodes", -1)) != 0
    ):
        raise Neo4jPrototypeError("Aura database is not dedicated to this prototype")
    _schema_transaction(driver, database)
    schema_report = doctor_graph(driver, database)
    if schema_report["constraints_verified"] is not True:
        raise Neo4jPrototypeError("Neo4j prototype constraints have an unexpected shape")
    if schema_report["fulltext_index"]["shape_verified"] is not True:
        raise Neo4jPrototypeError("Neo4j full-text index has an unexpected shape")
    lanes = (
        (EVENT_QUERY, bundle.events),
        (SUBJECT_QUERY, bundle.subjects),
        (EVIDENCE_QUERY, bundle.evidence),
        (ABOUT_QUERY, bundle.about),
        (CITES_QUERY, bundle.cites),
        (DERIVED_FROM_QUERY, bundle.derived_from),
        (SUPERSEDES_QUERY, bundle.supersedes),
    )
    _load_transaction(driver, database, lanes, batch_size)
    _run(driver, database, "CALL db.awaitIndex($index_name, 30)", {"index_name": FULLTEXT_INDEX})
    report = doctor_graph(driver, database)
    if report["counts"] != bundle.counts():
        raise Neo4jPrototypeError("Neo4j graph counts do not match the deterministic bundle")
    if report["fulltext_index"]["state"] != "ONLINE":
        raise Neo4jPrototypeError("Neo4j full-text index is not online")
    if report["fulltext_index"]["shape_verified"] is not True:
        raise Neo4jPrototypeError("Neo4j full-text index has an unexpected shape")
    if report["constraints_verified"] is not True:
        raise Neo4jPrototypeError("Neo4j prototype constraints have an unexpected shape")
    if report["dedicated_instance_verified"] is not True:
        raise Neo4jPrototypeError("Aura database is not dedicated to this prototype")
    return report


def _lucene_query(question: str) -> str:
    terms = []
    for value in TOKEN_RE.findall(question.casefold()):
        if len(value) >= 2 and value not in terms:
            terms.append(value)
    if not terms:
        raise Neo4jPrototypeError("search query contains no usable terms")
    return " OR ".join('"' + value + '"' for value in terms)


def _instant(value: str, label: str) -> tuple[str, str]:
    if not isinstance(value, str):
        raise Neo4jPrototypeError(label + " must be an RFC3339 timestamp")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise Neo4jPrototypeError(label + " must be an RFC3339 timestamp") from exc
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise Neo4jPrototypeError(label + " must include a timezone")
    utc = parsed.astimezone(timezone.utc)
    return utc.isoformat(timespec="microseconds").replace("+00:00", "Z"), utc.date().isoformat()


def _valid_time_contains(
    precision: Any,
    start: Any,
    end: Any,
    valid_at: str,
) -> bool:
    """Defence-in-depth check for rows returned by the Cypher validity filter."""

    normalized, valid_date = _instant(valid_at, "valid_at")
    if not isinstance(start, str) or (end is not None and not isinstance(end, str)):
        return False
    try:
        if precision == "day":
            point = datetime.fromisoformat(valid_date).date()
            lower = datetime.fromisoformat(start).date()
            upper = datetime.fromisoformat(end).date() if end is not None else None
        elif precision == "instant":
            point = datetime.fromisoformat(normalized.replace("Z", "+00:00"))
            lower = datetime.fromisoformat(start.replace("Z", "+00:00"))
            upper = (
                datetime.fromisoformat(end.replace("Z", "+00:00"))
                if end is not None
                else None
            )
            if lower.tzinfo is None or (upper is not None and upper.tzinfo is None):
                return False
        else:
            return False
    except ValueError:
        return False
    return lower <= point and (upper is None or point <= upper)


def search_graph(
    driver: Any,
    database: str,
    *,
    question: str,
    classification: str,
    as_of: str,
    valid_at: str,
    top_k: int,
) -> dict[str, Any]:
    if classification != "internal":
        raise Neo4jPrototypeError("prototype search supports only internal rows")
    if top_k < 1 or top_k > 20:
        raise Neo4jPrototypeError("top_k must be between 1 and 20")
    normalized_as_of, _ = _instant(as_of, "as_of")
    normalized_valid_at, valid_at_date = _instant(valid_at, "valid_at")
    rows = _run(
        driver,
        database,
        SEARCH_QUERY,
        {
            "dataset": PROTOTYPE_DATASET,
            "query": _lucene_query(question),
            "classification": classification,
            "as_of": normalized_as_of,
            "valid_at": normalized_valid_at,
            "valid_at_date": valid_at_date,
            "top_k": top_k,
        },
    )
    results = []
    for row in rows:
        if row.get("classification") != "internal" or not _valid_time_contains(
            row.get("valid_precision"),
            row.get("valid_from"),
            None if row.get("valid_to_open") is True else row.get("valid_to_bound"),
            normalized_valid_at,
        ):
            raise Neo4jPrototypeError("Neo4j search returned an ineligible event")
        results.append(
            {
                "event_id": row["event_id"],
                "event_type": row["event_type"],
                "system_time": row["system_time"],
                "source_path": row["source_path"],
                "source_locator": row["source_locator"],
                "subjects": sorted(str(value) for value in row.get("subjects", [])),
                "score": round(float(row["score"]), 6),
            }
        )
    return {
        "schema": "memory-neo4j-prototype-search/v1",
        "dataset": PROTOTYPE_DATASET,
        "content_mode": "metadata-only",
        "result_count": len(results),
        "results": results,
    }


def _driver(credentials: AuraCredentials) -> Any:
    try:
        from neo4j import GraphDatabase
    except ImportError as exc:
        raise Neo4jPrototypeError(
            "install scripts/requirements-memory-neo4j.txt with Python 3.10+"
        ) from exc
    driver = GraphDatabase.driver(
        credentials.uri,
        auth=(credentials.username, credentials.password),
    )
    try:
        driver.verify_connectivity()
    except Exception:
        driver.close()
        raise
    return driver


def build_live_bundle(root: Path) -> GraphBundle:
    events, diagnostics = adapt_repository(root)
    errors = [item for item in diagnostics if item.get("severity") == "error"]
    if errors:
        raise Neo4jPrototypeError("legacy adapter returned error diagnostics")
    validation_errors = validate_events(events)
    if validation_errors:
        raise Neo4jPrototypeError("legacy adapter events failed canonical validation")
    return map_events(events)


def _render(value: Mapping[str, Any]) -> str:
    return json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    dry = subparsers.add_parser("dry-run", help="map local events without contacting Neo4j")
    dry.add_argument("--root", type=Path, default=Path("."))

    load = subparsers.add_parser("load", help="idempotently load the metadata-only graph")
    load.add_argument("--root", type=Path, default=Path("."))
    load.add_argument("--credentials", type=Path, required=True)
    load.add_argument("--expected-instance-id", required=True)
    load.add_argument("--batch-size", type=int, default=100)

    doctor = subparsers.add_parser("doctor", help="verify graph counts and index state")
    doctor.add_argument("--credentials", type=Path, required=True)

    search = subparsers.add_parser("search", help="run authorized metadata-only full-text search")
    search.add_argument("--credentials", type=Path, required=True)
    search.add_argument("--query", required=True)
    search.add_argument("--classification", choices=("internal",), required=True)
    search.add_argument("--as-of", required=True)
    search.add_argument("--valid-at", required=True)
    search.add_argument("--top-k", type=int, default=5)

    args = parser.parse_args(argv)
    try:
        if args.command == "dry-run":
            bundle = build_live_bundle(args.root.resolve())
            sys.stdout.write(
                _render(
                    {
                        "schema": "memory-neo4j-prototype-dry-run/v1",
                        "dataset": PROTOTYPE_DATASET,
                        "counts": bundle.counts(),
                        "content_mode": "metadata-only",
                        "external_write": False,
                    }
                )
            )
            return 0

        credentials = load_aura_credentials(args.credentials)
        if args.command == "load":
            expected_instance_id = args.expected_instance_id.strip()
            if (
                re.fullmatch(r"[A-Za-z0-9]{6,64}", expected_instance_id) is None
                or expected_instance_id.casefold() != credentials.instance_id.casefold()
            ):
                raise Neo4jPrototypeError("credential file is not for the expected Aura instance")
        driver = _driver(credentials)
        try:
            if args.command == "load":
                bundle = build_live_bundle(args.root.resolve())
                report = load_graph(
                    driver,
                    credentials.database,
                    bundle,
                    batch_size=args.batch_size,
                )
            elif args.command == "doctor":
                report = doctor_graph(driver, credentials.database)
            else:
                report = search_graph(
                    driver,
                    credentials.database,
                    question=args.query,
                    classification=args.classification,
                    as_of=args.as_of,
                    valid_at=args.valid_at,
                    top_k=args.top_k,
                )
        finally:
            driver.close()
        sys.stdout.write(_render(report))
        return 0
    except (Neo4jPrototypeError, OSError) as exc:
        print("memory Neo4j prototype failed: " + str(exc), file=sys.stderr)
        return 2
    except Exception as exc:
        # Driver errors may include endpoints but must never include credential values.
        print("memory Neo4j prototype failed: " + type(exc).__name__, file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
