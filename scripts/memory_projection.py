#!/usr/bin/env python3
"""Deterministic, disposable SQLite projection for canonical memory events.

The canonical event stream and source artifacts remain authoritative.  This module
only creates a queryable projection.  Its integrity token is calculated from
canonical logical rows, never from SQLite file bytes, so a clean rebuild can be
compared across machines and SQLite patch versions.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import sqlite3
import tempfile
from dataclasses import dataclass
from itertools import zip_longest
from pathlib import Path
from typing import Iterable, Sequence

from canonical_json import canonical_json, canonical_sha256
from memory_contract import CLASSIFICATIONS, parse_aware_datetime, validate_event


PROJECTION_SCHEMA = "memory-projection/v1"
_EVIDENCE_REF_RE = re.compile(
    r"^evidence:sha256:(?P<digest>[0-9a-f]{64})#(?P<locator>.+)$"
)
_SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
_ALLOWED_DERIVATIVE_CLASSIFICATIONS = {
    "public": frozenset({"public", "internal", "licensed", "restricted", "confidential"}),
    "internal": frozenset({"internal", "licensed", "restricted", "confidential"}),
    "licensed": frozenset({"licensed", "confidential"}),
    "restricted": frozenset({"restricted", "confidential"}),
    "confidential": frozenset({"confidential"}),
}
_FTS_SCHEMA_SQL = (
    "CREATE VIRTUAL TABLE event_search USING fts5("
    "event_id UNINDEXED, text, tokenize='unicode61 remove_diacritics 2')"
)
_TYPED_RECORD_ID_FIELDS = {
    "memory-source/v1": "source_id",
    "memory-evidence-span/v1": "evidence_id",
    "memory-claim/v1": "claim_id",
    "memory-relationship/v1": "relationship_id",
    "memory-identity-registry/v1": "registry_id",
}


class ProjectionError(ValueError):
    """The canonical input cannot produce a trustworthy projection."""


@dataclass(frozen=True)
class ProjectionResult:
    path: str
    event_count: int
    subject_count: int
    edge_count: int
    evidence_ref_count: int
    artifact_count: int
    typed_payload_count: int
    digest: str


def _parse_clock(value: str, *, field: str) -> dt.datetime:
    if not isinstance(value, str):
        raise ProjectionError(f"{field} must be an ISO-8601 string")
    try:
        parsed = parse_aware_datetime(value)
    except ValueError as exc:
        raise ProjectionError(f"{field} is not valid ISO-8601: {value!r}") from exc
    return parsed


def _normalized_datetime(value: str, *, field: str) -> str:
    """Normalize instants to fixed-width UTC text so SQLite ordering is temporal."""
    return _parse_clock(value, field=field).isoformat(
        timespec="microseconds"
    ).replace("+00:00", "Z")


def _valid_boundary(value, *, field: str) -> tuple[int, dt.datetime] | None:
    """Return a comparable UTC boundary; dates sort before datetimes on that date."""
    if value is None:
        return None
    if not isinstance(value, str):
        raise ProjectionError(f"{field} must be a date, date-time, or null")
    try:
        if "T" not in value:
            return 0, dt.datetime.combine(
                dt.date.fromisoformat(value), dt.time.min, tzinfo=dt.timezone.utc
            )
        return 1, _parse_clock(value, field=field)
    except ValueError as exc:
        raise ProjectionError(f"{field} is not a valid ISO-8601 date: {value!r}") from exc


def _normalized_valid_boundary(value, *, field: str, is_end: bool = False) -> str | None:
    boundary = _valid_boundary(value, field=field)
    if boundary is None:
        return None
    if isinstance(value, str) and "T" not in value:
        date_value = boundary[1].date()
        clock = dt.time.max if is_end else dt.time.min
        return dt.datetime.combine(
            date_value, clock, tzinfo=dt.timezone.utc
        ).isoformat(timespec="microseconds").replace("+00:00", "Z")
    return boundary[1].isoformat(timespec="microseconds").replace("+00:00", "Z")


def _policy_inheritance_errors(child: dict, parent: dict) -> list[str]:
    """Fail closed when a derivative weakens classification or retention."""
    child_policy = child["policy"]
    parent_policy = parent["policy"]
    errors: list[str] = []
    if child_policy["classification"] not in _ALLOWED_DERIVATIVE_CLASSIFICATIONS[
        parent_policy["classification"]
    ]:
        errors.append(
            f"classification {child_policy['classification']!r} widens or changes the audience of "
            f"upstream {parent_policy['classification']!r}"
        )

    child_retention = child_policy["retention"]
    parent_retention = parent_policy["retention"]
    if parent_retention == "source-policy" and child_retention not in {"source-policy", "tombstone-only"}:
        errors.append("source-policy upstream requires source-policy or tombstone-only retention")
    elif parent_retention == "tombstone-only" and child_retention != "tombstone-only":
        errors.append("tombstone-only upstream cannot produce a content-bearing derivative")
    elif parent_retention == "expires" and child_retention not in {"expires", "tombstone-only"}:
        errors.append("expiring upstream requires expires or tombstone-only retention")
    elif parent_retention == "expires" and child_retention == "expires":
        child_expiry = _parse_clock(child_policy["retain_until"], field="policy.retain_until")
        parent_expiry = _parse_clock(parent_policy["retain_until"], field="policy.retain_until")
        if child_expiry > parent_expiry:
            errors.append("derivative retention cannot outlive its upstream event")
    parent_payload = parent.get("payload")
    if (
        isinstance(parent_payload, dict)
        and parent_payload.get("schema") == "memory-source/v1"
        and isinstance(parent_payload.get("licence"), dict)
        and parent_payload["licence"].get("derived_data") == "prohibited"
        and child_retention != "tombstone-only"
    ):
        errors.append("upstream source licence prohibits content-bearing derivatives")
    return errors


def _event_validation_errors(event: dict) -> list[str]:
    try:
        result = validate_event(event)
    except Exception as exc:  # validator must fail closed, including programmer errors
        return [f"validator raised {type(exc).__name__}: {exc}"]
    if result is None:
        return []
    if isinstance(result, list):
        return [str(item) for item in result]
    raise ProjectionError("memory_contract.validate_event must return list[str] or None")


def _graph_contains_cycle(adjacency: dict[str, set[str]]) -> bool:
    """Return whether a finite directed graph contains a cycle, without recursion."""
    nodes = set(adjacency)
    nodes.update(target for targets in adjacency.values() for target in targets)
    indegree = {node: 0 for node in nodes}
    for targets in adjacency.values():
        for target in targets:
            indegree[target] += 1
    pending = [node for node, degree in indegree.items() if degree == 0]
    visited = 0
    while pending:
        node = pending.pop()
        visited += 1
        for target in adjacency.get(node, set()):
            indegree[target] -= 1
            if indegree[target] == 0:
                pending.append(target)
    return visited != len(nodes)


def _check_events(events: Sequence[dict]) -> None:
    by_id: dict[str, dict] = {}
    errors: list[str] = []
    for index, event in enumerate(events):
        if not isinstance(event, dict):
            errors.append(f"event[{index}] is not an object")
            continue
        event_id = event.get("event_id")
        prefix = event_id if isinstance(event_id, str) else f"event[{index}]"
        errors.extend(f"{prefix}: {message}" for message in _event_validation_errors(event))
        if not isinstance(event_id, str):
            continue
        if event_id in by_id:
            errors.append(f"{event_id}: duplicate event_id")
        else:
            by_id[event_id] = event

        valid = event.get("valid_time")
        if isinstance(valid, dict):
            try:
                start = _valid_boundary(valid.get("from"), field=f"{prefix}.valid_time.from")
                end = _valid_boundary(valid.get("to"), field=f"{prefix}.valid_time.to")
                if start is not None and end is not None and start[1] > end[1]:
                    errors.append(f"{prefix}: valid_time.from is after valid_time.to")
            except ProjectionError as exc:
                errors.append(str(exc))

    if errors:
        raise ProjectionError("invalid canonical event input:\n" + "\n".join(sorted(errors)))

    for event_id, event in by_id.items():
        for edge_type in ("derived_from", "supersedes"):
            for target in event.get(edge_type, []):
                if target not in by_id:
                    errors.append(f"{event_id}: {edge_type} target does not exist: {target}")
                    continue
                source_clock = _parse_clock(event["system_time"], field=f"{event_id}.system_time")
                target_clock = _parse_clock(
                    by_id[target]["system_time"], field=f"{target}.system_time"
                )
                if source_clock <= target_clock:
                    errors.append(
                        f"{event_id}: {edge_type} target {target} must be strictly earlier than "
                        "its source event"
                    )
                if edge_type == "supersedes":
                    target_event = by_id[target]
                    if event["event_type"] != target_event["event_type"]:
                        errors.append(
                            f"{event_id}: supersedes target {target} has another event_type"
                        )
                    if not set(event["subject_ids"]) & set(target_event["subject_ids"]):
                        errors.append(
                            f"{event_id}: supersedes target {target} shares no canonical subject"
                        )
                if edge_type in {"derived_from", "supersedes"}:
                    errors.extend(
                        f"{event_id}: {edge_type} target {target}: {message}"
                        for message in _policy_inheritance_errors(event, by_id[target])
                    )

    # Both causal graphs must remain acyclic. The iterative check avoids leaking a
    # RecursionError (or reaching SQLite) for adversarially deep/cyclic inputs.
    for edge_type in ("derived_from", "supersedes"):
        adjacency = {
            event_id: {
                target for target in event.get(edge_type, []) if target in by_id
            }
            for event_id, event in by_id.items()
        }
        if _graph_contains_cycle(adjacency):
            errors.append(f"{edge_type} graph contains a cycle")

    # A typed record ID names one logical record. Multiple event versions are only
    # meaningful when they form one explicit, unbranched replacement chain. Without
    # this rule a caller could publish the same source_id/claim_id under competing
    # policies and have reference binding silently choose the convenient version.
    typed_versions: dict[tuple[str, str], list[dict]] = {}
    for event in by_id.values():
        payload = event.get("payload")
        if not isinstance(payload, dict):
            continue
        schema = payload.get("schema")
        id_field = _TYPED_RECORD_ID_FIELDS.get(schema)
        record_id = payload.get(id_field) if id_field else None
        if isinstance(schema, str) and isinstance(record_id, str):
            typed_versions.setdefault((schema, record_id), []).append(event)
    for (schema, record_id), versions in sorted(typed_versions.items()):
        ordered = sorted(
            versions,
            key=lambda row: (
                _parse_clock(row["system_time"], field="system_time"), row["event_id"],
            ),
        )
        for position, version in enumerate(ordered):
            peer_targets = list(version.get("supersedes", []))
            expected = [] if position == 0 else [ordered[position - 1]["event_id"]]
            if peer_targets != expected:
                errors.append(
                    f"{version['event_id']}: {schema} record {record_id!r} versions must form "
                    f"one linear supersession chain; expected {expected!r}, found {peer_targets!r}"
                )

    # Claim lineage is also a causal graph, even though it lives inside typed
    # payloads rather than the shared envelope.
    claim_ids = {
        event["payload"]["claim_id"]
        for event in by_id.values()
        if isinstance(event.get("payload"), dict)
        and event["payload"].get("schema") == "memory-claim/v1"
        and isinstance(event["payload"].get("claim_id"), str)
    }
    claim_adjacency: dict[str, set[str]] = {claim_id: set() for claim_id in claim_ids}
    for event in by_id.values():
        payload = event.get("payload")
        if not isinstance(payload, dict) or payload.get("schema") != "memory-claim/v1":
            continue
        claim_id = payload.get("claim_id")
        derived_claims = payload.get("derived_from_claims")
        if isinstance(claim_id, str) and isinstance(derived_claims, list):
            claim_adjacency.setdefault(claim_id, set()).update(
                target for target in derived_claims if target in claim_ids
            )
    if _graph_contains_cycle(claim_adjacency):
        errors.append("claim.derived_from_claims graph contains a cycle")
    if errors:
        raise ProjectionError("invalid event graph:\n" + "\n".join(sorted(set(errors))))


def _flatten_search_text(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, bool):
        return ["true" if value else "false"]
    if isinstance(value, (str, int, float)):
        return [str(value)]
    if isinstance(value, list):
        out: list[str] = []
        for item in value:
            out.extend(_flatten_search_text(item))
        return out
    if isinstance(value, dict):
        out = []
        for key in sorted(value):
            out.append(key)
            out.extend(_flatten_search_text(value[key]))
        return out
    return []


def _artifact_candidates(event: dict) -> list[tuple[str, str | None, str | None]]:
    """Extract exact-byte artifacts from the small canonical payload conventions.

    Source payloads and legacy adapters may expose ``sha256`` directly, under
    ``source_artifact``, or under ``legacy_source``.  Unknown nested hashes are
    deliberately ignored: a payload digest is not evidence merely because it is
    a SHA-256 value.
    """
    payload = event.get("payload")
    if not isinstance(payload, dict):
        return []
    candidates = []
    if (
        event.get("event_type") in {"source.ingested", "source.observed"}
        or payload.get("schema") == "memory-source/v1"
    ):
        candidates.append(payload)
    if isinstance(payload.get("source_path"), str) and isinstance(payload.get("source_sha256"), str):
        candidates.append(payload)
    for key in ("source_artifact", "legacy_source"):
        value = payload.get(key)
        if isinstance(value, dict):
            candidates.append(value)
    legacy = payload.get("legacy")
    if isinstance(legacy, dict):
        value = legacy.get("source")
        if isinstance(value, dict):
            candidates.append(value)

    rows: list[tuple[str, str | None, str | None]] = []
    for item in candidates:
        digest = item.get("sha256") or item.get("source_sha256") or item.get("content_sha256")
        if not isinstance(digest, str):
            continue
        if digest.startswith("sha256:"):
            digest = digest.removeprefix("sha256:")
        if not _SHA256_RE.fullmatch(digest):
            continue
        path = item.get("path") or item.get("source_path") or item.get("uri")
        media_type = item.get("media_type") or item.get("mime_type")
        rows.append((digest, path if isinstance(path, str) else None,
                     media_type if isinstance(media_type, str) else None))
    return sorted(set(rows))


def _artifact_locator_candidates(event: dict) -> list[tuple[str, str]]:
    """Return locators that have been anchored to an exact-byte artifact.

    Legacy adapters preserve their source locator directly. Canonical evidence
    spans carry the same locator in ``locator.ref``. Merely mentioning a digest
    is intentionally insufficient: a downstream claim must resolve to both the
    source bytes and a locator asserted by an evidence-span/source event.
    """
    payload = event.get("payload")
    if not isinstance(payload, dict):
        return []

    rows: list[tuple[str, str]] = []
    source_digest = payload.get("source_sha256")
    source_locator = payload.get("source_locator")
    if isinstance(source_digest, str) and isinstance(source_locator, str):
        digest = source_digest.removeprefix("sha256:")
        if _SHA256_RE.fullmatch(digest) and source_locator:
            rows.append((digest, source_locator))

    if payload.get("schema") == "memory-evidence-span/v1":
        locator = payload.get("locator")
        locator_ref = locator.get("ref") if isinstance(locator, dict) else None
        if isinstance(source_digest, str) and isinstance(locator_ref, str):
            digest = source_digest.removeprefix("sha256:")
            if _SHA256_RE.fullmatch(digest) and locator_ref:
                rows.append((digest, locator_ref))
    return sorted(set(rows))


def _create_schema(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        PRAGMA foreign_keys=ON;
        PRAGMA journal_mode=DELETE;
        PRAGMA synchronous=FULL;
        PRAGMA temp_store=MEMORY;

        CREATE TABLE metadata (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        ) WITHOUT ROWID;

        CREATE TABLE events (
          event_id TEXT PRIMARY KEY,
          event_type TEXT NOT NULL,
          system_time TEXT NOT NULL,
          valid_from TEXT,
          valid_to TEXT,
          run_id TEXT,
          trace_id TEXT,
          producer_kind TEXT NOT NULL,
          producer_name TEXT NOT NULL,
          classification TEXT NOT NULL,
          retention TEXT NOT NULL,
          retain_until TEXT,
          payload_sha256 TEXT NOT NULL,
          canonical_event TEXT NOT NULL
        ) WITHOUT ROWID;

        CREATE TABLE subjects (
          subject_id TEXT NOT NULL,
          event_id TEXT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
          PRIMARY KEY (subject_id, event_id)
        ) WITHOUT ROWID;

        CREATE TABLE event_edges (
          source_event_id TEXT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
          edge_type TEXT NOT NULL CHECK (edge_type IN ('derived_from', 'supersedes')),
          target_event_id TEXT NOT NULL REFERENCES events(event_id),
          PRIMARY KEY (source_event_id, edge_type, target_event_id)
        ) WITHOUT ROWID;

        CREATE TABLE artifacts (
          sha256 TEXT NOT NULL,
          path TEXT NOT NULL DEFAULT '',
          media_type TEXT NOT NULL DEFAULT '',
          source_event_id TEXT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
          PRIMARY KEY (sha256, path, source_event_id)
        ) WITHOUT ROWID;

        CREATE TABLE artifact_locators (
          sha256 TEXT NOT NULL,
          locator TEXT NOT NULL,
          source_event_id TEXT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
          PRIMARY KEY (sha256, locator, source_event_id)
        ) WITHOUT ROWID;

        CREATE TABLE evidence_refs (
          event_id TEXT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
          evidence_ref TEXT NOT NULL,
          sha256 TEXT NOT NULL,
          locator TEXT NOT NULL,
          PRIMARY KEY (event_id, evidence_ref)
        ) WITHOUT ROWID;

        CREATE TABLE evidence_bindings (
          event_id TEXT NOT NULL,
          evidence_ref TEXT NOT NULL,
          artifact_event_id TEXT NOT NULL REFERENCES events(event_id),
          locator_event_id TEXT NOT NULL REFERENCES events(event_id),
          PRIMARY KEY (event_id, evidence_ref),
          FOREIGN KEY (event_id, evidence_ref)
            REFERENCES evidence_refs(event_id, evidence_ref) ON DELETE CASCADE
        ) WITHOUT ROWID;

        CREATE TABLE record_bindings (
          event_id TEXT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
          field TEXT NOT NULL,
          reference TEXT NOT NULL,
          target_event_id TEXT NOT NULL REFERENCES events(event_id),
          PRIMARY KEY (event_id, field, reference)
        ) WITHOUT ROWID;

        CREATE TABLE typed_payloads (
          event_id TEXT PRIMARY KEY REFERENCES events(event_id) ON DELETE CASCADE,
          payload_schema TEXT NOT NULL,
          record_id TEXT NOT NULL,
          canonical_payload TEXT NOT NULL
        ) WITHOUT ROWID;

        CREATE TABLE source_index (
          event_id TEXT PRIMARY KEY REFERENCES typed_payloads(event_id) ON DELETE CASCADE,
          source_id TEXT NOT NULL,
          document_id TEXT NOT NULL,
          content_sha256 TEXT NOT NULL,
          source_tier INTEGER NOT NULL,
          publication_date TEXT,
          filing_date TEXT,
          effective_date TEXT,
          language TEXT NOT NULL,
          uri TEXT,
          mime_type TEXT NOT NULL,
          byte_length INTEGER NOT NULL,
          extraction_status TEXT NOT NULL
        ) WITHOUT ROWID;

        CREATE TABLE evidence_span_index (
          event_id TEXT PRIMARY KEY REFERENCES typed_payloads(event_id) ON DELETE CASCADE,
          evidence_id TEXT NOT NULL,
          source_id TEXT NOT NULL,
          source_sha256 TEXT NOT NULL,
          locator_json TEXT NOT NULL,
          language TEXT NOT NULL,
          extraction_method TEXT NOT NULL,
          extraction_confidence REAL NOT NULL
        ) WITHOUT ROWID;

        CREATE TABLE claim_index (
          event_id TEXT PRIMARY KEY REFERENCES typed_payloads(event_id) ON DELETE CASCADE,
          claim_id TEXT NOT NULL,
          subject_id TEXT NOT NULL,
          predicate TEXT NOT NULL,
          object_id TEXT,
          has_value INTEGER NOT NULL CHECK (has_value IN (0,1)),
          value_json TEXT,
          unit TEXT,
          currency TEXT,
          accounting_standard TEXT,
          period_json TEXT NOT NULL,
          scope_json TEXT NOT NULL,
          qualifier TEXT NOT NULL,
          basis TEXT NOT NULL,
          epistemic_status TEXT NOT NULL,
          claim_quality INTEGER NOT NULL,
          material INTEGER NOT NULL CHECK (material IN (0,1))
        ) WITHOUT ROWID;

        CREATE TABLE relationship_index (
          event_id TEXT PRIMARY KEY REFERENCES typed_payloads(event_id) ON DELETE CASCADE,
          relationship_id TEXT NOT NULL,
          relationship_type TEXT NOT NULL,
          source_ref TEXT NOT NULL,
          target_ref TEXT NOT NULL,
          qualifier TEXT
        ) WITHOUT ROWID;

        CREATE TABLE identity_namespace_index (
          event_id TEXT NOT NULL REFERENCES typed_payloads(event_id) ON DELETE CASCADE,
          namespace TEXT NOT NULL,
          entity_kind TEXT NOT NULL,
          id_pattern TEXT NOT NULL,
          authority TEXT NOT NULL,
          case_sensitive INTEGER NOT NULL CHECK (case_sensitive IN (0,1)),
          PRIMARY KEY (event_id, namespace)
        ) WITHOUT ROWID;

        CREATE TABLE identity_index (
          event_id TEXT NOT NULL REFERENCES typed_payloads(event_id) ON DELETE CASCADE,
          identity_id TEXT NOT NULL,
          namespace TEXT NOT NULL,
          entity_kind TEXT NOT NULL,
          canonical_id TEXT NOT NULL,
          status TEXT NOT NULL,
          valid_from TEXT NOT NULL,
          valid_to TEXT,
          PRIMARY KEY (event_id, identity_id)
        ) WITHOUT ROWID;

        CREATE TABLE identity_alias_index (
          event_id TEXT NOT NULL,
          identity_id TEXT NOT NULL,
          alias TEXT NOT NULL,
          PRIMARY KEY (event_id, identity_id, alias),
          FOREIGN KEY (event_id, identity_id)
            REFERENCES identity_index(event_id, identity_id) ON DELETE CASCADE
        ) WITHOUT ROWID;

        CREATE INDEX events_type_time ON events(event_type, system_time, event_id);
        CREATE INDEX events_valid_time ON events(valid_from, valid_to, event_id);
        CREATE INDEX events_policy ON events(classification, event_id);
        CREATE INDEX evidence_digest ON evidence_refs(sha256, event_id);
        CREATE INDEX evidence_binding_artifact ON evidence_bindings(artifact_event_id, event_id);
        CREATE INDEX evidence_binding_locator ON evidence_bindings(locator_event_id, event_id);
        CREATE INDEX record_binding_target ON record_bindings(target_event_id, event_id);
        CREATE INDEX artifact_locator_lookup ON artifact_locators(sha256, locator, source_event_id);
        CREATE INDEX typed_record_id ON typed_payloads(payload_schema, record_id, event_id);
        CREATE INDEX source_record_id ON source_index(source_id, event_id);
        CREATE INDEX evidence_record_id ON evidence_span_index(evidence_id, event_id);
        CREATE INDEX claim_record_id ON claim_index(claim_id, event_id);
        CREATE INDEX relationship_record_id ON relationship_index(relationship_id, event_id);
        CREATE INDEX claim_subject_predicate ON claim_index(subject_id, predicate, claim_id);
        CREATE INDEX relationship_source ON relationship_index(source_ref, relationship_type, target_ref);
        CREATE INDEX relationship_target ON relationship_index(target_ref, relationship_type, source_ref);
        CREATE INDEX identity_canonical ON identity_index(canonical_id, identity_id);
        """
    )
    try:
        connection.execute(_FTS_SCHEMA_SQL)
    except sqlite3.OperationalError as exc:
        raise ProjectionError("SQLite runtime lacks required FTS5 support") from exc


def _insert_typed_payload(connection: sqlite3.Connection, event: dict) -> None:
    payload = event["payload"]
    schema = payload.get("schema") if isinstance(payload, dict) else None
    id_field = {
        "memory-source/v1": "source_id",
        "memory-evidence-span/v1": "evidence_id",
        "memory-claim/v1": "claim_id",
        "memory-relationship/v1": "relationship_id",
        "memory-identity-registry/v1": "registry_id",
    }.get(schema)
    if id_field is None:
        return
    record_id = payload[id_field]
    connection.execute(
        "INSERT INTO typed_payloads(event_id,payload_schema,record_id,canonical_payload) VALUES(?,?,?,?)",
        (event["event_id"], schema, record_id, canonical_json(payload)),
    )
    if schema == "memory-source/v1":
        connection.execute(
            """INSERT INTO source_index(
                 event_id,source_id,document_id,content_sha256,source_tier,publication_date,
                 filing_date,effective_date,language,uri,mime_type,byte_length,extraction_status
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                event["event_id"], payload["source_id"], payload["document_id"],
                payload["content_sha256"], payload["source_tier"], payload["publication_date"],
                payload["filing_date"], payload["effective_date"], payload["language"],
                payload["uri"], payload["mime_type"], payload["byte_length"],
                payload["extraction_status"],
            ),
        )
    elif schema == "memory-evidence-span/v1":
        connection.execute(
            """INSERT INTO evidence_span_index(
                 event_id,evidence_id,source_id,source_sha256,locator_json,language,
                 extraction_method,extraction_confidence
               ) VALUES(?,?,?,?,?,?,?,?)""",
            (
                event["event_id"], payload["evidence_id"], payload["source_id"],
                payload["source_sha256"], canonical_json(payload["locator"]), payload["language"],
                payload["extraction_method"], payload["extraction_confidence"],
            ),
        )
    elif schema == "memory-claim/v1":
        has_value = "value" in payload
        connection.execute(
            """INSERT INTO claim_index(
                 event_id,claim_id,subject_id,predicate,object_id,has_value,value_json,unit,
                 currency,accounting_standard,period_json,scope_json,qualifier,basis,
                 epistemic_status,claim_quality,material
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                event["event_id"], payload["claim_id"], payload["subject_id"],
                payload["predicate"], payload.get("object_id"), int(has_value),
                canonical_json(payload.get("value")) if has_value else None, payload["unit"],
                payload["currency"], payload["accounting_standard"],
                canonical_json(payload["period"]), canonical_json(payload["scope"]),
                payload["qualifier"], payload["basis"], payload["epistemic_status"],
                payload["claim_quality"], int(payload["material"]),
            ),
        )
    elif schema == "memory-relationship/v1":
        connection.execute(
            """INSERT INTO relationship_index(
                 event_id,relationship_id,relationship_type,source_ref,target_ref,qualifier
               ) VALUES(?,?,?,?,?,?)""",
            (
                event["event_id"], payload["relationship_id"], payload["relationship_type"],
                payload["source_ref"], payload["target_ref"], payload["qualifier"],
            ),
        )
    elif schema == "memory-identity-registry/v1":
        for namespace in sorted(payload["namespaces"], key=lambda row: row["name"]):
            connection.execute(
                """INSERT INTO identity_namespace_index(
                     event_id,namespace,entity_kind,id_pattern,authority,case_sensitive
                   ) VALUES(?,?,?,?,?,?)""",
                (
                    event["event_id"], namespace["name"], namespace["entity_kind"],
                    namespace["id_pattern"], namespace["authority"],
                    int(namespace["case_sensitive"]),
                ),
            )
        for identity in sorted(payload["identities"], key=lambda row: row["id"]):
            valid = identity["valid_time"]
            connection.execute(
                """INSERT INTO identity_index(
                     event_id,identity_id,namespace,entity_kind,canonical_id,status,valid_from,valid_to
                   ) VALUES(?,?,?,?,?,?,?,?)""",
                (
                    event["event_id"], identity["id"], identity["namespace"],
                    identity["entity_kind"], identity["canonical_id"], identity["status"],
                    valid["from"], valid["to"],
                ),
            )
            for alias in sorted(identity["aliases"]):
                connection.execute(
                    "INSERT INTO identity_alias_index(event_id,identity_id,alias) VALUES(?,?,?)",
                    (event["event_id"], identity["id"], alias),
                )


def _eligible_provider_ids(
    connection: sqlite3.Connection,
    query: str,
    params: tuple[object, ...],
    *,
    child: dict,
    events_by_id: dict[str, dict],
) -> list[str]:
    child_time = _parse_clock(child["system_time"], field="system_time")
    providers = []
    for row in connection.execute(query, params):
        provider_id = str(row[0])
        provider = events_by_id[provider_id]
        provider_time = _parse_clock(provider["system_time"], field="system_time")
        if provider_time <= child_time:
            providers.append(provider_id)
    return sorted(set(providers))


def _provider_policy_errors(child: dict, provider: dict) -> list[str]:
    if child["event_id"] == provider["event_id"]:
        return []
    return _policy_inheritance_errors(child, provider)


def _bind_evidence_references(
    connection: sqlite3.Connection,
    events: Sequence[dict],
) -> None:
    """Bind every citation to exact artifact and locator assertions known in time."""
    events_by_id = {event["event_id"]: event for event in events}
    errors: list[str] = []
    for child in sorted(events, key=lambda row: row["event_id"]):
        for evidence_ref in sorted(child["evidence_refs"]):
            match = _EVIDENCE_REF_RE.fullmatch(evidence_ref)
            if match is None:  # structural validation should already have caught this
                continue
            artifact_ids = _eligible_provider_ids(
                connection,
                "SELECT DISTINCT source_event_id FROM artifacts WHERE sha256=? ORDER BY source_event_id",
                (match["digest"],),
                child=child,
                events_by_id=events_by_id,
            )
            locator_ids = _eligible_provider_ids(
                connection,
                """SELECT DISTINCT source_event_id FROM artifact_locators
                   WHERE sha256=? AND locator=? ORDER BY source_event_id""",
                (match["digest"], match["locator"]),
                child=child,
                events_by_id=events_by_id,
            )
            if not artifact_ids or not locator_ids:
                errors.append(
                    f"{child['event_id']}: {evidence_ref} has no artifact and locator assertions "
                    "at or before the consumer system_time"
                )
                continue
            provider_errors: list[str] = []
            for artifact_id in artifact_ids:
                for locator_id in locator_ids:
                    provider_errors.extend([
                        *_provider_policy_errors(child, events_by_id[artifact_id]),
                        *_provider_policy_errors(child, events_by_id[locator_id]),
                    ])
            if provider_errors:
                details = "; ".join(sorted(set(provider_errors)))
                errors.append(f"{child['event_id']}: {evidence_ref}: {details}")
                continue
            # All eligible assertions agree with the consumer policy. Choosing the
            # newest deterministic pair now cannot launder a stricter assertion.
            artifact_id = max(
                artifact_ids,
                key=lambda item: (
                    _parse_clock(events_by_id[item]["system_time"], field="system_time"), item,
                ),
            )
            locator_id = max(
                locator_ids,
                key=lambda item: (
                    _parse_clock(events_by_id[item]["system_time"], field="system_time"), item,
                ),
            )
            connection.execute(
                """INSERT INTO evidence_bindings(
                     event_id,evidence_ref,artifact_event_id,locator_event_id
                   ) VALUES(?,?,?,?)""",
                (child["event_id"], evidence_ref, artifact_id, locator_id),
            )
    if errors:
        raise ProjectionError(
            "evidence references do not resolve to policy-safe, point-in-time providers:\n"
            + "\n".join(sorted(set(errors)))
        )


def _domain_references(event: dict) -> list[tuple[str, str]]:
    payload = event.get("payload")
    if not isinstance(payload, dict):
        return []
    schema = payload.get("schema")
    if schema == "memory-evidence-span/v1":
        return [("evidence.source_id", payload["source_id"])]
    if schema == "memory-claim/v1":
        refs = [
            ("claim.derived_from_claims", ref)
            for ref in payload["derived_from_claims"]
        ]
        if "object_id" in payload:
            refs.append(("claim.object_id", payload["object_id"]))
        return refs
    if schema == "memory-relationship/v1":
        return [
            ("relationship.source_ref", payload["source_ref"]),
            ("relationship.target_ref", payload["target_ref"]),
        ]
    return []


def _bind_domain_references(
    connection: sqlite3.Connection,
    events: Sequence[dict],
) -> None:
    """Resolve typed payload lineage to a concrete, prior, policy-safe event version."""
    events_by_id = {event["event_id"]: event for event in events}
    record_events: dict[str, list[str]] = {}
    known_unversioned: set[str] = set()
    for event in events:
        known_unversioned.update(event["subject_ids"])
        if event.get("run_id"):
            known_unversioned.add(event["run_id"])
        payload = event.get("payload")
        if isinstance(payload, dict):
            record_id = _TYPED_RECORD_ID_FIELDS.get(payload.get("schema"))
            if record_id:
                record_events.setdefault(payload[record_id], []).append(event["event_id"])
            if payload.get("schema") == "memory-identity-registry/v1":
                for identity in payload["identities"]:
                    known_unversioned.add(identity["id"])
                    known_unversioned.update(identity["aliases"])

    errors: list[str] = []
    for child in sorted(events, key=lambda row: row["event_id"]):
        child_time = _parse_clock(child["system_time"], field="system_time")
        for field, reference in sorted(_domain_references(child)):
            candidate_ids = list(record_events.get(reference, []))
            if reference in events_by_id:
                candidate_ids.append(reference)
            if not candidate_ids:
                if reference in known_unversioned:
                    continue
                errors.append(f"{child['event_id']}: {field} target does not exist: {reference}")
                continue
            eligible = []
            for candidate_id in sorted(set(candidate_ids)):
                provider = events_by_id[candidate_id]
                if _parse_clock(provider["system_time"], field="system_time") >= child_time:
                    continue
                eligible.append(provider)
            if not eligible:
                errors.append(
                    f"{child['event_id']}: {field} {reference}: no target version existed "
                    "strictly before the consumer system_time"
                )
                continue
            provider = max(
                eligible,
                key=lambda row: (
                    _parse_clock(row["system_time"], field="system_time"), row["event_id"],
                ),
            )
            inherited = _provider_policy_errors(child, provider)
            if inherited:
                errors.append(
                    f"{child['event_id']}: {field} {reference}: "
                    + "; ".join(sorted(set(inherited)))
                )
                continue
            if (
                isinstance(child.get("payload"), dict)
                and child["payload"].get("schema") == "memory-relationship/v1"
                and not set(child["subject_ids"]) & set(provider["subject_ids"])
            ):
                errors.append(
                    f"{child['event_id']}: {field} {reference}: relationship subjects do not "
                    "overlap the resolved endpoint subjects"
                )
                continue
            connection.execute(
                "INSERT INTO record_bindings(event_id,field,reference,target_event_id) VALUES(?,?,?,?)",
                (child["event_id"], field, reference, provider["event_id"]),
            )
    if errors:
        raise ProjectionError(
            "typed payload references do not resolve:\n" + "\n".join(sorted(set(errors)))
        )


def _insert_events(connection: sqlite3.Connection, events: Sequence[dict]) -> None:
    for event in sorted(
        events,
        key=lambda item: (_parse_clock(item["system_time"], field="system_time"), item["event_id"]),
    ):
        valid = event["valid_time"]
        producer = event["producer"]
        policy = event["policy"]
        integrity = event["integrity"]
        event_text = canonical_json(event)
        connection.execute(
            """INSERT INTO events(
                 event_id,event_type,system_time,valid_from,valid_to,run_id,trace_id,
                 producer_kind,producer_name,classification,retention,retain_until,payload_sha256,
                 canonical_event
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                event["event_id"], event["event_type"],
                _normalized_datetime(event["system_time"], field="system_time"),
                _normalized_valid_boundary(valid.get("from"), field="valid_time.from"),
                _normalized_valid_boundary(
                    valid.get("to"), field="valid_time.to", is_end=True
                ),
                event["run_id"], event.get("trace_id"),
                producer["kind"], producer["name"], policy["classification"],
                policy["retention"],
                _normalized_datetime(policy["retain_until"], field="policy.retain_until")
                if policy["retain_until"] is not None else None,
                integrity["payload_sha256"], event_text,
            ),
        )
        for subject_id in sorted(event["subject_ids"]):
            connection.execute(
                "INSERT INTO subjects(subject_id,event_id) VALUES(?,?)",
                (subject_id, event["event_id"]),
            )
        for edge_type in ("derived_from", "supersedes"):
            for target in sorted(event[edge_type]):
                connection.execute(
                    "INSERT INTO event_edges(source_event_id,edge_type,target_event_id) VALUES(?,?,?)",
                    (event["event_id"], edge_type, target),
                )
        for evidence_ref in sorted(event["evidence_refs"]):
            match = _EVIDENCE_REF_RE.fullmatch(evidence_ref)
            if not match:
                raise ProjectionError(f"invalid evidence reference in {event['event_id']}: {evidence_ref}")
            connection.execute(
                "INSERT INTO evidence_refs(event_id,evidence_ref,sha256,locator) VALUES(?,?,?,?)",
                (event["event_id"], evidence_ref, match["digest"], match["locator"]),
            )
        for digest, path, media_type in _artifact_candidates(event):
            connection.execute(
                "INSERT INTO artifacts(sha256,path,media_type,source_event_id) VALUES(?,?,?,?)",
                (digest, path or "", media_type or "", event["event_id"]),
            )
        for digest, locator in _artifact_locator_candidates(event):
            connection.execute(
                "INSERT INTO artifact_locators(sha256,locator,source_event_id) VALUES(?,?,?)",
                (digest, locator, event["event_id"]),
            )
        _insert_typed_payload(connection, event)
        search_parts = [event["event_type"], *event["subject_ids"]]
        search_parts.extend(_flatten_search_text(event["payload"]))
        connection.execute(
            "INSERT INTO event_search(event_id,text) VALUES(?,?)",
            (event["event_id"], "\n".join(search_parts)),
        )

    _bind_evidence_references(connection, events)
    _bind_domain_references(connection, events)


def _table_rows(connection: sqlite3.Connection, table: str, columns: Sequence[str]) -> list[list]:
    allowed = {
        "events", "subjects", "event_edges", "artifacts", "artifact_locators",
        "evidence_refs", "evidence_bindings", "record_bindings", "typed_payloads",
        "source_index", "evidence_span_index", "claim_index", "relationship_index",
        "identity_namespace_index", "identity_index", "identity_alias_index", "event_search",
    }
    if table not in allowed or not columns or not all(
        re.fullmatch(r"[a-z_][a-z0-9_]*", c) for c in columns
    ):
        raise ValueError("unsafe projection table request")
    order = ",".join(columns)
    query = f"SELECT {order} FROM {table} ORDER BY {order}"  # identifiers are allowlisted above
    return [list(row) for row in connection.execute(query)]


def logical_projection(connection: sqlite3.Connection) -> dict:
    """Return the complete authoritative logical view used for rebuild comparison."""
    return {
        "schema": PROJECTION_SCHEMA,
        "events": _table_rows(
            connection,
            "events",
            (
                "event_id", "event_type", "system_time", "valid_from", "valid_to",
                "run_id", "trace_id", "producer_kind", "producer_name", "classification",
                "retention", "retain_until", "payload_sha256", "canonical_event",
            ),
        ),
        "subjects": _table_rows(connection, "subjects", ("subject_id", "event_id")),
        "event_edges": _table_rows(
            connection, "event_edges", ("source_event_id", "edge_type", "target_event_id")
        ),
        "artifacts": _table_rows(
            connection, "artifacts", ("sha256", "path", "media_type", "source_event_id")
        ),
        "artifact_locators": _table_rows(
            connection, "artifact_locators", ("sha256", "locator", "source_event_id")
        ),
        "evidence_refs": _table_rows(
            connection, "evidence_refs", ("event_id", "evidence_ref", "sha256", "locator")
        ),
        "evidence_bindings": _table_rows(
            connection,
            "evidence_bindings",
            ("event_id", "evidence_ref", "artifact_event_id", "locator_event_id"),
        ),
        "record_bindings": _table_rows(
            connection,
            "record_bindings",
            ("event_id", "field", "reference", "target_event_id"),
        ),
        "typed_payloads": _table_rows(
            connection, "typed_payloads", ("event_id", "payload_schema", "record_id", "canonical_payload")
        ),
        "source_index": _table_rows(
            connection,
            "source_index",
            (
                "event_id", "source_id", "document_id", "content_sha256", "source_tier",
                "publication_date", "filing_date", "effective_date", "language", "uri",
                "mime_type", "byte_length", "extraction_status",
            ),
        ),
        "evidence_span_index": _table_rows(
            connection,
            "evidence_span_index",
            (
                "event_id", "evidence_id", "source_id", "source_sha256", "locator_json",
                "language", "extraction_method", "extraction_confidence",
            ),
        ),
        "claim_index": _table_rows(
            connection,
            "claim_index",
            (
                "event_id", "claim_id", "subject_id", "predicate", "object_id", "has_value",
                "value_json", "unit", "currency", "accounting_standard", "period_json", "scope_json",
                "qualifier", "basis", "epistemic_status", "claim_quality", "material",
            ),
        ),
        "relationship_index": _table_rows(
            connection,
            "relationship_index",
            ("event_id", "relationship_id", "relationship_type", "source_ref", "target_ref", "qualifier"),
        ),
        "identity_namespace_index": _table_rows(
            connection,
            "identity_namespace_index",
            ("event_id", "namespace", "entity_kind", "id_pattern", "authority", "case_sensitive"),
        ),
        "identity_index": _table_rows(
            connection,
            "identity_index",
            (
                "event_id", "identity_id", "namespace", "entity_kind", "canonical_id", "status",
                "valid_from", "valid_to",
            ),
        ),
        "identity_alias_index": _table_rows(
            connection, "identity_alias_index", ("event_id", "identity_id", "alias")
        ),
        "event_search": _table_rows(connection, "event_search", ("event_id", "text")),
    }


def projection_digest(connection: sqlite3.Connection) -> str:
    return canonical_sha256(logical_projection(connection))


def _counts(connection: sqlite3.Connection) -> tuple[int, int, int, int, int, int]:
    tables = ("events", "subjects", "event_edges", "evidence_refs", "artifacts", "typed_payloads")
    return tuple(int(connection.execute(f"SELECT count(*) FROM {table}").fetchone()[0]) for table in tables)


def _fsync_directory(path: Path) -> None:
    """Persist a renamed directory entry where the host supports directory fsync."""

    if os.name == "nt":
        return
    directory_fd = os.open(path, os.O_RDONLY)
    try:
        os.fsync(directory_fd)
    finally:
        os.close(directory_fd)


def build_projection(events: Iterable[dict], database_path: str | os.PathLike[str]) -> ProjectionResult:
    """Validate events and atomically replace ``database_path`` with a clean projection."""
    materialized = list(events)
    _check_events(materialized)
    target = Path(database_path).resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{target.name}.", suffix=".tmp", dir=target.parent
    )
    os.close(descriptor)
    temporary = Path(temporary_name)
    try:
        connection = sqlite3.connect(temporary)
        try:
            with connection:
                _create_schema(connection)
                _insert_events(connection, materialized)
                digest = projection_digest(connection)
                connection.executemany(
                    "INSERT INTO metadata(key,value) VALUES(?,?)",
                    (
                        ("schema", PROJECTION_SCHEMA),
                        ("projection_digest", digest),
                        ("event_count", str(len(materialized))),
                    ),
                )
            integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
            if integrity != "ok":
                raise ProjectionError(f"SQLite integrity_check failed: {integrity}")
            counts = _counts(connection)
        finally:
            connection.close()
        os.replace(temporary, target)
        # Persist the directory entry as well as SQLite's file contents. Without
        # this fsync, a power loss can forget an otherwise successful atomic rename.
        _fsync_directory(target.parent)
    finally:
        if temporary.exists():
            temporary.unlink()
    return ProjectionResult(
        path=str(target), event_count=counts[0], subject_count=counts[1], edge_count=counts[2],
        evidence_ref_count=counts[3], artifact_count=counts[4], typed_payload_count=counts[5],
        digest=digest,
    )


def _read_only_connection(path: Path) -> sqlite3.Connection:
    # Path.as_uri percent-encodes '?', '#', and other URI metacharacters. Raw
    # interpolation can open the wrong file and, on some SQLite builds, create it.
    return sqlite3.connect(path.as_uri() + "?mode=ro", uri=True)


def _verify_fts_index(connection: sqlite3.Connection) -> None:
    schema_row = connection.execute(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='event_search'"
    ).fetchone()
    if schema_row is None or schema_row[0] != _FTS_SCHEMA_SQL:
        raise ProjectionError("event_search FTS5 schema/tokenizer does not match the contract")

    content_rows = list(
        connection.execute("SELECT rowid,event_id,text FROM event_search ORDER BY rowid")
    )
    expected = sqlite3.connect(":memory:")
    try:
        expected.execute(_FTS_SCHEMA_SQL)
        expected.executemany(
            "INSERT INTO event_search(rowid,event_id,text) VALUES(?,?,?)", content_rows
        )
        expected.execute(
            "CREATE VIRTUAL TABLE expected_vocab USING fts5vocab(event_search, 'instance')"
        )
        connection.execute("DROP TABLE IF EXISTS temp._memory_actual_vocab")
        connection.execute(
            """CREATE VIRTUAL TABLE temp._memory_actual_vocab
               USING fts5vocab(main, event_search, 'instance')"""
        )
        actual_rows = connection.execute(
            "SELECT term,doc,col,offset FROM temp._memory_actual_vocab ORDER BY term,doc,col,offset"
        )
        expected_rows = expected.execute(
            "SELECT term,doc,col,offset FROM expected_vocab ORDER BY term,doc,col,offset"
        )
        marker = object()
        for actual, wanted in zip_longest(actual_rows, expected_rows, fillvalue=marker):
            if actual != wanted:
                raise ProjectionError("event_search FTS5 index does not match its canonical text rows")
    finally:
        try:
            connection.execute("DROP TABLE IF EXISTS temp._memory_actual_vocab")
        except sqlite3.Error:
            pass
        expected.close()


def _verify_connection(
    connection: sqlite3.Connection,
    path: Path,
    *,
    expected_digest: str | None = None,
) -> ProjectionResult:
    integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
    if integrity != "ok":
        raise ProjectionError(f"SQLite integrity_check failed: {integrity}")
    foreign_key_errors = list(connection.execute("PRAGMA foreign_key_check"))
    if foreign_key_errors:
        raise ProjectionError("projection foreign-key integrity check failed")
    metadata = dict(connection.execute("SELECT key,value FROM metadata"))
    if metadata.get("schema") != PROJECTION_SCHEMA:
        raise ProjectionError("projection schema metadata is missing or unsupported")
    digest = projection_digest(connection)
    if metadata.get("projection_digest") != digest:
        raise ProjectionError("projection digest does not match its logical rows")
    if expected_digest is not None:
        if _SHA256_RE.fullmatch(expected_digest) is None:
            raise ProjectionError("trusted expected projection digest must be 64 lowercase hex characters")
        if digest != expected_digest:
            raise ProjectionError("projection digest does not match the trusted expected digest")
    _verify_fts_index(connection)
    counts = _counts(connection)
    if metadata.get("event_count") != str(counts[0]):
        raise ProjectionError("projection event_count metadata is stale")
    return ProjectionResult(
        path=str(path), event_count=counts[0], subject_count=counts[1], edge_count=counts[2],
        evidence_ref_count=counts[3], artifact_count=counts[4], typed_payload_count=counts[5],
        digest=digest,
    )


def verify_projection(
    database_path: str | os.PathLike[str],
    *,
    expected_digest: str | None = None,
) -> ProjectionResult:
    path = Path(database_path).resolve()
    connection = _read_only_connection(path)
    try:
        connection.execute("BEGIN")
        return _verify_connection(connection, path, expected_digest=expected_digest)
    finally:
        connection.close()


def _normalized_query_clock(value: str | None, *, field: str) -> str | None:
    if value is None:
        return None
    return _normalized_datetime(value, field=field)


def _normalized_valid_query_range(value: str | None) -> tuple[str, str] | None:
    """Normalize a valid-time point or a whole-day overlap query.

    A date has day precision, so treating it as midnight or end-of-day silently
    drops intervals that existed during another part of that day. Datetimes remain
    exact point queries; dates become the closed UTC day interval.
    """
    if value is None:
        return None
    if not isinstance(value, str):
        raise ProjectionError("valid_at must be an ISO-8601 date or date-time string")
    if "T" not in value:
        return (
            _normalized_valid_boundary(value, field="valid_at"),
            _normalized_valid_boundary(value, field="valid_at", is_end=True),
        )
    point = _normalized_valid_boundary(value, field="valid_at")
    return point, point


def _query_connection(
    connection: sqlite3.Connection,
    *,
    subject_ids: Sequence[str] = (),
    event_types: Sequence[str] = (),
    classifications: Sequence[str] = ("public",),
    as_of: str | None = None,
    valid_at: str | None = None,
    text: str | None = None,
    current_only: bool = True,
    limit: int = 50,
    evaluated_at: str,
) -> tuple[list[dict], dict[str, str]]:
    if not classifications:
        raise ProjectionError("at least one permitted classification is required")
    unknown_classifications = sorted(set(classifications) - set(CLASSIFICATIONS))
    if unknown_classifications:
        raise ProjectionError(
            f"unknown permitted classification(s): {', '.join(unknown_classifications)}"
        )
    if not 1 <= limit <= 1000:
        raise ProjectionError("limit must be between 1 and 1000")
    as_of = _normalized_query_clock(as_of, field="as_of") or evaluated_at
    valid_range = _normalized_valid_query_range(valid_at) or (evaluated_at, evaluated_at)
    valid_start, valid_end = valid_range

    where: list[str] = []
    params: list[object] = []
    policy_now = evaluated_at
    placeholders = ",".join("?" for _ in classifications)
    where.append(f"e.classification IN ({placeholders})")
    params.extend(classifications)
    where.append(
        "(e.retention='permanent' OR (e.retention='expires' AND e.retain_until > ?))"
    )
    params.append(policy_now)
    if event_types:
        placeholders = ",".join("?" for _ in event_types)
        where.append(f"e.event_type IN ({placeholders})")
        params.extend(event_types)
    if subject_ids:
        placeholders = ",".join("?" for _ in subject_ids)
        where.append(
            "EXISTS (SELECT 1 FROM subjects s WHERE s.event_id=e.event_id "
            f"AND s.subject_id IN ({placeholders}))"
        )
        params.extend(subject_ids)
    where.append("e.system_time <= ?")
    params.append(as_of)
    where.append("(e.valid_from IS NULL OR e.valid_from <= ?)")
    where.append("(e.valid_to IS NULL OR e.valid_to >= ?)")
    params.extend((valid_end, valid_start))
    if current_only:
        successor_filters = []
        successor_placeholders = ",".join("?" for _ in classifications)
        successor_filters.append(
            "(successor.retention='tombstone-only' OR "
            "(successor.classification IN (" + successor_placeholders + ") AND "
            "(successor.retention='permanent' OR "
            "(successor.retention='expires' AND successor.retain_until > ?))))"
        )
        params.extend(classifications)
        params.append(policy_now)
        successor_filters.append("successor.system_time <= ?")
        params.append(as_of)
        successor_filters.extend((
            "(successor.valid_from IS NULL OR successor.valid_from <= ?)",
            "(successor.valid_to IS NULL OR successor.valid_to >= ?)",
        ))
        params.extend((valid_end, valid_start))
        successor_clause = " AND ".join(successor_filters)
        where.append(
            "NOT EXISTS ("
            "SELECT 1 FROM event_edges edge "
            "JOIN events successor ON successor.event_id=edge.source_event_id "
            "WHERE edge.edge_type='supersedes' AND edge.target_event_id=e.event_id"
            f" AND {successor_clause})"
        )

    join = ""
    if text:
        join = " JOIN event_search ON event_search.event_id=e.event_id"
        where.append("event_search MATCH ?")
        params.append(text)
    params.append(limit)
    query = (
        "SELECT e.canonical_event FROM events e" + join + " WHERE " + " AND ".join(where)
        + " ORDER BY e.system_time DESC,e.event_id LIMIT ?"
    )
    rows = [json.loads(row[0]) for row in connection.execute(query, params)]
    return rows, {
        "as_of": as_of,
        "valid_at_from": valid_start,
        "valid_at_to": valid_end,
        "policy_evaluated_at": policy_now,
    }


def query_projection_with_metadata(
    database_path: str | os.PathLike[str],
    *,
    expected_digest: str,
    subject_ids: Sequence[str] = (),
    event_types: Sequence[str] = (),
    classifications: Sequence[str] = ("public",),
    as_of: str | None = None,
    valid_at: str | None = None,
    text: str | None = None,
    current_only: bool = True,
    limit: int = 50,
) -> tuple[list[dict], ProjectionResult, dict[str, str]]:
    """Verify and query one immutable snapshot against a caller-trusted digest."""
    if (
        not isinstance(expected_digest, str)
        or _SHA256_RE.fullmatch(expected_digest) is None
    ):
        raise ProjectionError(
            "trusted expected projection digest must be 64 lowercase hex characters"
        )
    evaluated_at = dt.datetime.now(dt.timezone.utc).isoformat(
        timespec="microseconds"
    ).replace("+00:00", "Z")
    path = Path(database_path).resolve()
    connection = _read_only_connection(path)
    try:
        connection.execute("BEGIN")
        projection = _verify_connection(
            connection, path, expected_digest=expected_digest
        )
        rows, effective = _query_connection(
            connection,
            subject_ids=subject_ids,
            event_types=event_types,
            classifications=classifications,
            as_of=as_of,
            valid_at=valid_at,
            text=text,
            current_only=current_only,
            limit=limit,
            evaluated_at=evaluated_at,
        )
        return rows, projection, effective
    finally:
        connection.close()


def query_projection(
    database_path: str | os.PathLike[str],
    *,
    expected_digest: str,
    subject_ids: Sequence[str] = (),
    event_types: Sequence[str] = (),
    classifications: Sequence[str] = ("public",),
    as_of: str | None = None,
    valid_at: str | None = None,
    text: str | None = None,
    current_only: bool = True,
    limit: int = 50,
) -> list[dict]:
    """Return authorized events only from a caller-anchored projection snapshot."""
    rows, _, _ = query_projection_with_metadata(
        database_path,
        expected_digest=expected_digest,
        subject_ids=subject_ids,
        event_types=event_types,
        classifications=classifications,
        as_of=as_of,
        valid_at=valid_at,
        text=text,
        current_only=current_only,
        limit=limit,
    )
    return rows
