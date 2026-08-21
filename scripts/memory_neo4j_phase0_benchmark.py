#!/usr/bin/env python3
"""Run the exact Phase 0 file-retrieval benchmark on local Neo4j only.

The command refuses every non-loopback or routed Neo4j URI.  It builds a
disposable full-text projection from the exact union produced by
``memory_baseline.Corpus.documents_for``, performs two clean rebuilds, and
freezes every ranking before any scoring-only benchmark field is inspected.
Raw document text exists only in the local self-managed Neo4j projection and
is never included in the report.
"""

from __future__ import annotations

import argparse
import hashlib
import ipaddress
import json
import math
import os
import re
import stat
import sys
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Any, Iterable, Mapping, Optional, Sequence
from urllib.parse import urlsplit

from memory_baseline import (
    DEFAULT_BENCHMARK,
    REQUIRED_CATEGORIES,
    REPO_ROOT,
    TOKEN_RE,
    Corpus,
    Document,
    _corpus_digest,
    _evaluate_case,
    _mean,
    _query_bigrams,
    _query_terms,
    _rate,
    render_report,
    validate_benchmark,
)


DATASET = "memory-phase0-local-neo4j/v1"
DOCUMENT_LABEL = "MemoryPhase0LocalDocument"
FULLTEXT_INDEX = "memory_phase0_local_v1_document_search"
UNIQUE_CONSTRAINT = "memory_phase0_local_v1_document_key"
DEFAULT_CREDENTIALS = REPO_ROOT / ".secrets/neo4j-local.env"
MAX_CREDENTIAL_BYTES = 16 * 1024
MAX_WRITE_BATCH_BYTES = 4 * 1024 * 1024
PATH_PAGE_SIZE = 100
EXPECTED_CREDENTIAL_KEYS = frozenset(
    {"NEO4J_URI", "NEO4J_USERNAME", "NEO4J_PASSWORD", "NEO4J_DATABASE"}
)
DATABASE_RE = re.compile(r"^[A-Za-z0-9._-]{1,128}$")
ISO_DAY_RE = re.compile(r"(?<!\d)(20\d{2}-\d{2}-\d{2})(?!\d)")
TRUSTED_CLOCK_RE = re.compile(
    r"^(?P<day>\d{4}-\d{2}-\d{2})"
    r"(?:[Tt](?:[01]\d|2[0-3]):[0-5]\d:(?:[0-5]\d|60)"
    r"(?:\.\d+)?(?:[Zz]|[+-](?:[01]\d|2[0-3]):[0-5]\d))?$"
)
EXPLICIT_CUTOFF_CUES = re.compile(r"\b(?:as of|as known|on|before)\b", re.I)
ROOT_DATE_CUES = re.compile(r"\bdecision date\b", re.I)
TRUSTED_RECORDING_CLOCK_FIELDS = (
    "generated_at",
    "performed_at",
    "review_date",
    "scanned_at",
    "scan_date",
    "verified_at",
    "reviewed_at",
    "created_at",
    "processed_at",
    "input_datetime",
)
TRUSTED_FALLBACK_CLOCK_FIELDS = ("as_of", "decision_date")


class LocalBenchmarkError(RuntimeError):
    """Raised when the local benchmark cannot preserve its safety boundary."""


@dataclass(frozen=True)
class LocalCredentials:
    uri: str
    username: str
    password: str = field(repr=False)
    database: str = "neo4j"


@dataclass(frozen=True)
class RetrievalInput:
    """The complete per-case surface visible to retrieval."""

    question: str
    search_roots: tuple[str, ...]


@dataclass(frozen=True)
class RankedPath:
    path: str
    score: float


@dataclass(frozen=True)
class ProjectionSnapshot:
    sha256: str
    total_bytes: int
    unique_files: int


@dataclass(frozen=True)
class BenchmarkSnapshot:
    benchmark: Mapping[str, Any]
    raw: bytes


SCHEMA_QUERIES = (
    "CREATE CONSTRAINT memory_phase0_local_v1_document_key IF NOT EXISTS "
    "FOR (n:MemoryPhase0LocalDocument) "
    "REQUIRE (n.phase0_dataset, n.path) IS UNIQUE",
    "CREATE FULLTEXT INDEX memory_phase0_local_v1_document_search IF NOT EXISTS "
    "FOR (n:MemoryPhase0LocalDocument) ON EACH [n.search_text] "
    "OPTIONS {indexConfig: {`fulltext.analyzer`: 'standard-no-stop-words'}}",
)

LIST_DATASET_PATHS_QUERY = """
MATCH (node:MemoryPhase0LocalDocument {phase0_dataset: $dataset})
WHERE $after_path IS NULL OR node.path > $after_path
RETURN node.path AS path
ORDER BY path ASC
LIMIT $limit
""".strip()

DELETE_QUERY = """
MATCH (node:MemoryPhase0LocalDocument {phase0_dataset: $dataset})
WHERE node.path IN $paths
DETACH DELETE node
RETURN count(*) AS deleted
""".strip()

LOAD_QUERY = """
UNWIND $rows AS row
CREATE (node:MemoryPhase0LocalDocument {
  phase0_dataset: row.dataset,
  path: row.path,
  search_text: row.search_text,
  content_sha256: row.content_sha256,
  byte_count: row.byte_count
})
""".strip()

AWAIT_INDEX_QUERY = (
    "CALL db.awaitIndex('memory_phase0_local_v1_document_search', 300)"
)

INDEX_METADATA_QUERY = """
SHOW FULLTEXT INDEXES YIELD name, state, labelsOrTypes, properties, options
WHERE name = $index_name
RETURN state, labelsOrTypes, properties, options
""".strip()

CONSTRAINT_METADATA_QUERY = """
SHOW CONSTRAINTS YIELD name, type, labelsOrTypes, properties
WHERE name = $constraint_name
RETURN type, labelsOrTypes, properties
""".strip()

SNAPSHOT_QUERY = """
MATCH (node:MemoryPhase0LocalDocument {phase0_dataset: $dataset})
WHERE node.path IN $paths
RETURN node.path AS path,
       node.search_text AS search_text,
       node.content_sha256 AS content_sha256,
       node.byte_count AS byte_count
ORDER BY path ASC
""".strip()

SNAPSHOT_COUNT_QUERY = """
MATCH (node:MemoryPhase0LocalDocument {phase0_dataset: $dataset})
RETURN count(node) AS node_count
""".strip()

FOREIGN_LABEL_QUERY = """
MATCH (node:MemoryPhase0LocalDocument)
WHERE node.phase0_dataset IS NULL OR node.phase0_dataset <> $dataset
RETURN count(node) AS foreign_nodes
""".strip()

RANK_QUERY = """
CALL db.index.fulltext.queryNodes(
  'memory_phase0_local_v1_document_search',
  $query
)
YIELD node, score
WHERE node.phase0_dataset = $dataset
  AND node.path IN $allowed_paths
RETURN node.path AS path, score
ORDER BY score DESC, path ASC
LIMIT $top_k
""".strip()


def require_local_bolt_uri(uri: str) -> tuple[str, int]:
    """Accept only a direct Bolt connection to a literal loopback address."""

    if not isinstance(uri, str) or not uri:
        raise LocalBenchmarkError("local Neo4j URI is missing")
    try:
        parsed = urlsplit(uri)
        host = parsed.hostname
        port = parsed.port
    except ValueError as exc:
        raise LocalBenchmarkError("local Neo4j URI is invalid") from exc
    if (
        parsed.scheme != "bolt"
        or not host
        or port is None
        or not 1 <= port <= 65535
        or parsed.username is not None
        or parsed.password is not None
        or parsed.path not in {"", "/"}
        or parsed.query
        or parsed.fragment
    ):
        raise LocalBenchmarkError(
            "benchmark requires a direct bolt:// literal-loopback URI"
        )
    try:
        address = ipaddress.ip_address(host)
    except ValueError as exc:
        raise LocalBenchmarkError(
            "benchmark requires a literal loopback IP, not a hostname"
        ) from exc
    if not address.is_loopback:
        raise LocalBenchmarkError("benchmark refuses non-loopback Neo4j targets")
    return str(address), port


def _file_snapshot(info: os.stat_result) -> tuple[int, ...]:
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


def _read_private_file(path: Path) -> str:
    """Read a small owner-only regular file while detecting replacement races."""

    try:
        named_before = os.lstat(path)
    except OSError as exc:
        raise LocalBenchmarkError("local Neo4j credential file is unreadable") from exc
    if not stat.S_ISREG(named_before.st_mode):
        raise LocalBenchmarkError("local Neo4j credential file must be regular")
    if named_before.st_uid != os.geteuid():
        raise LocalBenchmarkError("local Neo4j credential file has the wrong owner")
    if named_before.st_nlink != 1:
        raise LocalBenchmarkError("local Neo4j credential file must have one hard link")
    if stat.S_IMODE(named_before.st_mode) & 0o077:
        raise LocalBenchmarkError("local Neo4j credential file must have mode 0600")
    if named_before.st_size > MAX_CREDENTIAL_BYTES:
        raise LocalBenchmarkError("local Neo4j credential file is unexpectedly large")

    flags = os.O_RDONLY
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    try:
        descriptor = os.open(path, flags)
    except OSError as exc:
        raise LocalBenchmarkError("local Neo4j credential file cannot be opened safely") from exc
    try:
        opened_before = os.fstat(descriptor)
        if _file_snapshot(opened_before) != _file_snapshot(named_before):
            raise LocalBenchmarkError("local Neo4j credential file changed while opening")
        raw = bytearray()
        while len(raw) <= MAX_CREDENTIAL_BYTES:
            part = os.read(descriptor, min(4096, MAX_CREDENTIAL_BYTES + 1 - len(raw)))
            if not part:
                break
            raw.extend(part)
        if len(raw) > MAX_CREDENTIAL_BYTES:
            raise LocalBenchmarkError("local Neo4j credential file is unexpectedly large")
        opened_after = os.fstat(descriptor)
        if _file_snapshot(opened_after) != _file_snapshot(opened_before):
            raise LocalBenchmarkError("local Neo4j credential file changed while reading")
    finally:
        os.close(descriptor)
    try:
        named_after = os.lstat(path)
    except OSError as exc:
        raise LocalBenchmarkError("local Neo4j credential file changed while reading") from exc
    if _file_snapshot(named_after) != _file_snapshot(named_before):
        raise LocalBenchmarkError("local Neo4j credential file changed while reading")
    try:
        return bytes(raw).decode("utf-8", errors="strict")
    except UnicodeDecodeError as exc:
        raise LocalBenchmarkError("local Neo4j credential file must be UTF-8") from exc


def load_local_credentials(path: Path = DEFAULT_CREDENTIALS) -> LocalCredentials:
    """Load the exact local dotenv contract without exposing secret values."""

    values: dict[str, str] = {}
    text = _read_private_file(path)
    if "\x00" in text:
        raise LocalBenchmarkError("local Neo4j credential file contains invalid bytes")
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            raise LocalBenchmarkError("local Neo4j credential file contains an invalid line")
        key, value = line.split("=", 1)
        key, value = key.strip(), value.strip()
        if key not in EXPECTED_CREDENTIAL_KEYS or key in values:
            raise LocalBenchmarkError(
                "local Neo4j credential file has unexpected or duplicate settings"
            )
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]
        if not value or "\r" in value or "\n" in value:
            raise LocalBenchmarkError("local Neo4j credential setting is empty or invalid")
        values[key] = value
    if set(values) != EXPECTED_CREDENTIAL_KEYS:
        raise LocalBenchmarkError("local Neo4j credential file is incomplete")
    require_local_bolt_uri(values["NEO4J_URI"])
    if DATABASE_RE.fullmatch(values["NEO4J_DATABASE"]) is None:
        raise LocalBenchmarkError("local Neo4j database name is invalid")
    if len(values["NEO4J_USERNAME"]) > 128:
        raise LocalBenchmarkError("local Neo4j username is invalid")
    return LocalCredentials(
        uri=values["NEO4J_URI"],
        username=values["NEO4J_USERNAME"],
        password=values["NEO4J_PASSWORD"],
        database=values["NEO4J_DATABASE"],
    )


def load_benchmark_snapshot(path: Path) -> BenchmarkSnapshot:
    """Read and parse one byte snapshot without inspecting case scoring fields."""

    try:
        raw = path.read_bytes()
        value = json.loads(raw.decode("utf-8", errors="strict"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise LocalBenchmarkError("Phase 0 benchmark JSON is unreadable") from exc
    if not isinstance(value, dict):
        raise LocalBenchmarkError("Phase 0 benchmark must be an object")
    return BenchmarkSnapshot(benchmark=value, raw=raw)


def load_unvalidated_benchmark(path: Path) -> dict[str, Any]:
    """Compatibility helper returning the parsed value from one byte snapshot."""

    return dict(load_benchmark_snapshot(path).benchmark)


def retrieval_inputs(benchmark: Mapping[str, Any]) -> tuple[RetrievalInput, ...]:
    """Copy only the fields the held-out protocol authorizes for ranking."""

    protocol = benchmark.get("held_out_protocol")
    if (
        not isinstance(protocol, Mapping)
        or protocol.get("retrieval_inputs") != ["question", "search_roots"]
    ):
        raise LocalBenchmarkError("benchmark retrieval boundary is invalid")
    cases = benchmark.get("cases")
    if not isinstance(cases, list) or not cases:
        raise LocalBenchmarkError("benchmark cases must be a nonempty list")
    copied: list[RetrievalInput] = []
    for position, case in enumerate(cases, 1):
        if not isinstance(case, Mapping):
            raise LocalBenchmarkError(f"retrieval case {position} must be an object")
        question = case.get("question")
        roots = case.get("search_roots")
        if not isinstance(question, str) or not question.strip():
            raise LocalBenchmarkError(f"retrieval case {position} has no question")
        if (
            not isinstance(roots, list)
            or not roots
            or not all(isinstance(root, str) and root for root in roots)
        ):
            raise LocalBenchmarkError(f"retrieval case {position} has invalid search roots")
        copied.append(RetrievalInput(question=question, search_roots=tuple(roots)))
    return tuple(copied)


def union_documents(
    inputs: Sequence[RetrievalInput], *, corpus: Corpus
) -> tuple[Document, ...]:
    """Use the baseline corpus implementation for the exact search-root union."""

    roots = sorted({root for item in inputs for root in item.search_roots})
    documents = tuple(corpus.documents_for(roots))
    paths = [document.path for document in documents]
    if not documents or paths != sorted(set(paths)):
        raise LocalBenchmarkError("Phase 0 corpus union is empty or has duplicate paths")
    return documents


def _records(result: Any) -> list[Mapping[str, Any]]:
    if isinstance(result, tuple) and result:
        return list(result[0])
    records = getattr(result, "records", None)
    if records is not None:
        return list(records)
    if isinstance(result, list):
        return result
    return []


def _run(
    driver: Any,
    database: str,
    query: str,
    parameters: Optional[Mapping[str, Any]] = None,
) -> list[Mapping[str, Any]]:
    result = driver.execute_query(
        query,
        parameters_=dict(parameters or {}),
        database_=database,
    )
    return _records(result)


def _validate_batch_size(size: int) -> int:
    if type(size) is not int or not 1 <= size <= 100:
        raise LocalBenchmarkError("batch size must be an integer from 1 to 100")
    return size


def _batches(items: Sequence[Any], size: int) -> Iterable[Sequence[Any]]:
    _validate_batch_size(size)
    for start in range(0, len(items), size):
        yield items[start : start + size]


def _document_batches(
    documents: Sequence[Document], max_count: int
) -> Iterable[Sequence[Document]]:
    """Bound writes by exact canonical UTF-8 ``{"rows": [...]}`` bytes."""

    _validate_batch_size(max_count)
    empty_parameters_bytes = _serialized_parameter_bytes({"rows": []})
    batch: list[Document] = []
    batch_bytes = empty_parameters_bytes
    for document in documents:
        row_bytes = _serialized_parameter_bytes(_projection_row(document))
        single_row_bytes = empty_parameters_bytes + row_bytes
        if single_row_bytes > MAX_WRITE_BATCH_BYTES:
            raise LocalBenchmarkError(
                "local projection row exceeds the serialized write limit"
            )
        separator_bytes = 1 if batch else 0
        if batch and (
            len(batch) >= max_count
            or batch_bytes + separator_bytes + row_bytes > MAX_WRITE_BATCH_BYTES
        ):
            yield tuple(batch)
            batch = []
            batch_bytes = empty_parameters_bytes
            separator_bytes = 0
        batch.append(document)
        batch_bytes += separator_bytes + row_bytes
    if batch:
        yield tuple(batch)


def _projection_row(document: Document) -> dict[str, Any]:
    path_terms = " ".join(TOKEN_RE.findall(document.path.casefold()))
    # Repetition gives path identity a bounded boost while retaining raw local text.
    search_text = "\n".join([path_terms] * 4 + [document.text])
    return {
        "dataset": DATASET,
        "path": document.path,
        "search_text": search_text,
        "content_sha256": hashlib.sha256(document.raw).hexdigest(),
        "byte_count": len(document.raw),
    }


def _serialized_parameter_bytes(value: Any) -> int:
    """Return the exact canonical JSON UTF-8 size used for the write cap."""

    return len(
        json.dumps(
            value,
            ensure_ascii=False,
            allow_nan=False,
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    )


def _verify_fulltext_index(driver: Any, database: str) -> None:
    rows = _run(
        driver,
        database,
        INDEX_METADATA_QUERY,
        {"index_name": FULLTEXT_INDEX},
    )
    if len(rows) != 1:
        raise LocalBenchmarkError("local full-text index is missing or ambiguous")
    row = rows[0]
    options = row.get("options")
    config = options.get("indexConfig") if isinstance(options, Mapping) else None
    analyzer = config.get("fulltext.analyzer") if isinstance(config, Mapping) else None
    if (
        row.get("state") != "ONLINE"
        or list(row.get("labelsOrTypes", [])) != [DOCUMENT_LABEL]
        or list(row.get("properties", [])) != ["search_text"]
        or analyzer != "standard-no-stop-words"
    ):
        raise LocalBenchmarkError("local full-text index has unexpected metadata")


def _verify_unique_constraint(driver: Any, database: str) -> None:
    rows = _run(
        driver,
        database,
        CONSTRAINT_METADATA_QUERY,
        {"constraint_name": UNIQUE_CONSTRAINT},
    )
    if len(rows) != 1:
        raise LocalBenchmarkError("local document uniqueness constraint is missing")
    row = rows[0]
    if (
        set(row.keys()) != {"type", "labelsOrTypes", "properties"}
        or row.get("type")
        not in {"UNIQUENESS", "NODE_PROPERTY_UNIQUENESS"}
        or list(row.get("labelsOrTypes", [])) != [DOCUMENT_LABEL]
        or list(row.get("properties", [])) != ["phase0_dataset", "path"]
    ):
        raise LocalBenchmarkError(
            "local document uniqueness constraint has unexpected metadata"
        )


def _verify_label_ownership(driver: Any, database: str) -> None:
    rows = _run(driver, database, FOREIGN_LABEL_QUERY, {"dataset": DATASET})
    if (
        len(rows) != 1
        or set(rows[0].keys()) != {"foreign_nodes"}
        or type(rows[0].get("foreign_nodes")) is not int
        or rows[0]["foreign_nodes"] != 0
    ):
        raise LocalBenchmarkError(
            "local benchmark label is shared with a foreign dataset"
        )


def _delete_dataset_in_batches(
    driver: Any, database: str, *, batch_size: int
) -> None:
    after_path: Optional[str] = None
    # This dedicated local benchmark assumes no concurrent writers.  Each page is
    # deleted before the next keyset page, and the final zero-count check detects
    # an insertion that would otherwise escape the cursor.
    while True:
        rows = _run(
            driver,
            database,
            LIST_DATASET_PATHS_QUERY,
            {
                "dataset": DATASET,
                "after_path": after_path,
                "limit": PATH_PAGE_SIZE,
            },
        )
        if len(rows) > PATH_PAGE_SIZE:
            raise LocalBenchmarkError("local dataset path page exceeded its limit")
        paths: list[str] = []
        for row in rows:
            if set(row.keys()) != {"path"} or not isinstance(row.get("path"), str):
                raise LocalBenchmarkError("local dataset path inventory is invalid")
            paths.append(row["path"])
        if paths != sorted(set(paths)) or (
            after_path is not None and paths and paths[0] <= after_path
        ):
            raise LocalBenchmarkError(
                "local dataset path inventory is not unique and sorted"
            )
        if not paths:
            break
        for path_batch in _batches(paths, min(batch_size, 10)):
            deleted = _run(
                driver,
                database,
                DELETE_QUERY,
                {"dataset": DATASET, "paths": list(path_batch)},
            )
            if (
                len(deleted) != 1
                or set(deleted[0].keys()) != {"deleted"}
                or deleted[0].get("deleted") != len(path_batch)
            ):
                raise LocalBenchmarkError("local dataset batch deletion was incomplete")
        after_path = paths[-1]
        if len(paths) < PATH_PAGE_SIZE:
            break
    remaining = _run(driver, database, SNAPSHOT_COUNT_QUERY, {"dataset": DATASET})
    if (
        len(remaining) != 1
        or set(remaining[0].keys()) != {"node_count"}
        or remaining[0].get("node_count") != 0
    ):
        raise LocalBenchmarkError("local dataset was not empty after batched deletion")


def _snapshot_projection(
    driver: Any,
    database: str,
    documents: Sequence[Document],
    *,
    batch_size: int,
) -> ProjectionSnapshot:
    expected = {document.path: document for document in documents}
    count_rows = _run(driver, database, SNAPSHOT_COUNT_QUERY, {"dataset": DATASET})
    if (
        len(count_rows) != 1
        or set(count_rows[0].keys()) != {"node_count"}
        or count_rows[0].get("node_count") != len(expected)
    ):
        raise LocalBenchmarkError("local projection file count differs from the corpus")
    digest = hashlib.sha256()
    total_bytes = 0
    seen: set[str] = set()
    ordered_documents = tuple(expected[path] for path in sorted(expected))
    for document_batch in _document_batches(ordered_documents, batch_size):
        paths = [document.path for document in document_batch]
        rows = _run(
            driver,
            database,
            SNAPSHOT_QUERY,
            {"dataset": DATASET, "paths": paths},
        )
        if len(rows) != len(paths):
            raise LocalBenchmarkError("local projection omitted a snapshot batch")
        for row in rows:
            if set(row.keys()) != {
                "path",
                "search_text",
                "content_sha256",
                "byte_count",
            }:
                raise LocalBenchmarkError("local projection snapshot row is not closed")
            path = row.get("path")
            if not isinstance(path, str) or path in seen or path not in expected:
                raise LocalBenchmarkError(
                    "local projection contains an unknown or duplicate path"
                )
            seen.add(path)
            document = expected[path]
            projection = _projection_row(document)
            content_sha256 = hashlib.sha256(document.raw).hexdigest()
            if (
                row.get("search_text") != projection["search_text"]
                or row.get("content_sha256") != content_sha256
                or row.get("byte_count") != len(document.raw)
            ):
                raise LocalBenchmarkError("local projection content differs from the corpus")
            digest.update(path.encode("utf-8"))
            digest.update(b"\0")
            digest.update(content_sha256.encode("ascii"))
            digest.update(b"\n")
            total_bytes += len(document.raw)
    if seen != set(expected):
        raise LocalBenchmarkError("local projection omitted corpus paths")
    return ProjectionSnapshot(
        sha256=digest.hexdigest(),
        total_bytes=total_bytes,
        unique_files=len(seen),
    )


def rebuild_projection(
    driver: Any,
    *,
    database: str,
    documents: Sequence[Document],
    batch_size: int = 10,
) -> ProjectionSnapshot:
    """Delete and reconstruct only this local benchmark's labelled dataset."""

    _validate_batch_size(batch_size)
    # Fully validate all projected row sizes before any database call, including
    # idempotent schema writes.  The plan retains only references to Documents.
    document_batches = tuple(_document_batches(documents, batch_size))
    # A reused loopback database must prove this benchmark owns the label before
    # even idempotent schema writes occur.
    _verify_label_ownership(driver, database)
    for query in SCHEMA_QUERIES:
        _run(driver, database, query)
    _run(driver, database, AWAIT_INDEX_QUERY)
    _verify_fulltext_index(driver, database)
    _verify_unique_constraint(driver, database)
    _verify_label_ownership(driver, database)
    _delete_dataset_in_batches(driver, database, batch_size=batch_size)
    # Materialize only one bounded write batch at a time; the exact Phase 0 corpus
    # already retains raw/text/lower-text representations in its read-through cache.
    for batch in document_batches:
        rows = [_projection_row(document) for document in batch]
        _run(driver, database, LOAD_QUERY, {"rows": rows})
    _run(driver, database, AWAIT_INDEX_QUERY)
    _verify_fulltext_index(driver, database)
    _verify_label_ownership(driver, database)
    return _snapshot_projection(
        driver,
        database,
        documents,
        batch_size=batch_size,
    )


def _parse_days(values: Iterable[str]) -> tuple[date, ...]:
    parsed: set[date] = set()
    for value in values:
        for match in ISO_DAY_RE.findall(value):
            try:
                parsed.add(date.fromisoformat(match))
            except ValueError:
                continue
    return tuple(sorted(parsed))


def _query_cutoff(question: str, search_roots: Sequence[str]) -> Optional[date]:
    question_days = _parse_days([question])
    if question_days and EXPLICIT_CUTOFF_CUES.search(question):
        return max(question_days)
    if ROOT_DATE_CUES.search(question):
        root_days = _parse_days(search_roots)
        if root_days:
            return min(root_days)
    return None


def _trusted_clock_day(value: Any) -> Optional[date]:
    """Parse one closed date/RFC3339 clock value, otherwise fail closed."""

    if not isinstance(value, str):
        return None
    match = TRUSTED_CLOCK_RE.fullmatch(value)
    if match is None:
        return None
    try:
        return date.fromisoformat(match.group("day"))
    except ValueError:
        return None


def _document_observed_day(document: Document) -> Optional[date]:
    observed = set(_parse_days([document.path]))
    structured: Any = None
    if document.path.endswith(".json"):
        try:
            structured = json.loads(document.text)
        except json.JSONDecodeError:
            structured = None
    if isinstance(structured, Mapping):
        recording_days: set[date] = set()
        recording_clock_present = False
        for field_name in TRUSTED_RECORDING_CLOCK_FIELDS:
            if field_name not in structured:
                continue
            recording_clock_present = True
            recording_day = _trusted_clock_day(structured[field_name])
            if recording_day is None:
                return None
            recording_days.add(recording_day)

        fallback_days: set[date] = set()
        for field_name in TRUSTED_FALLBACK_CLOCK_FIELDS:
            if field_name not in structured:
                continue
            fallback_day = _trusted_clock_day(structured[field_name])
            if fallback_day is None:
                return None
            fallback_days.add(fallback_day)

        observed.update(recording_days if recording_clock_present else fallback_days)
        # corrections/v1 has one exact append-only successor clock.  Do not scan
        # arbitrary nested dates: forecasts and validity windows are not artifact
        # recording times.
        if (
            structured.get("schema") == "corrections/v1"
            and "superseded_by" in structured
        ):
            successor = structured.get("superseded_by")
            if not isinstance(successor, Mapping) or "date" not in successor:
                return None
            successor_day = _trusted_clock_day(successor["date"])
            if successor_day is None:
                return None
            observed.add(successor_day)
    return max(observed) if observed else None


def _lucene_query(question: str) -> str:
    terms = list(_query_terms(question))
    phrases = list(_query_bigrams(question))
    clauses = terms + [f'"{phrase}"^2' for phrase in phrases]
    if not clauses:
        return "memoryphase0nomatchtoken"
    return "(" + " OR ".join(clauses) + ")"


def rank_case(
    driver: Any,
    *,
    database: str,
    question: str,
    search_roots: Sequence[str],
    top_k: int,
    corpus: Corpus,
) -> tuple[RankedPath, ...]:
    """Rank with question/search roots only and return unique deterministic paths."""

    if type(top_k) is not int or not 1 <= top_k <= 20:
        raise LocalBenchmarkError("top_k must be an integer from 1 to 20")
    scoped_documents = corpus.documents_for(search_roots)
    cutoff = _query_cutoff(question, search_roots)
    allowed_paths = sorted(
        document.path
        for document in scoped_documents
        if cutoff is None
        or (
            (observed := _document_observed_day(document)) is not None
            and observed <= cutoff
        )
    )
    if not allowed_paths:
        return ()
    rows = _run(
        driver,
        database,
        RANK_QUERY,
        {
            "dataset": DATASET,
            "query": _lucene_query(question),
            "allowed_paths": allowed_paths,
            "top_k": top_k,
        },
    )
    if len(rows) > top_k:
        raise LocalBenchmarkError("local ranker returned more than top_k rows")
    allowed = set(allowed_paths)
    ranked: list[RankedPath] = []
    seen: set[str] = set()
    for row in rows:
        if set(row.keys()) != {"path", "score"}:
            raise LocalBenchmarkError("local ranker row is not closed")
        path, score = row.get("path"), row.get("score")
        if not isinstance(path, str) or path not in allowed or path in seen:
            raise LocalBenchmarkError("local ranker returned an unauthorized or duplicate path")
        if isinstance(score, bool) or not isinstance(score, (int, float)):
            raise LocalBenchmarkError("local ranker returned an invalid score")
        numeric_score = float(score)
        if not math.isfinite(numeric_score) or numeric_score < 0:
            raise LocalBenchmarkError("local ranker returned an invalid score")
        seen.add(path)
        ranked.append(RankedPath(path=path, score=round(numeric_score, 12)))
    ranked.sort(key=lambda item: (-item.score, item.path))
    return tuple(ranked)


def freeze_all_rankings(
    driver: Any,
    *,
    database: str,
    inputs: Sequence[RetrievalInput],
    top_k: int,
    corpus: Corpus,
) -> tuple[tuple[RankedPath, ...], ...]:
    """Complete every retrieval before returning an immutable ranking matrix."""

    return tuple(
        rank_case(
            driver,
            database=database,
            question=item.question,
            search_roots=item.search_roots,
            top_k=top_k,
            corpus=corpus,
        )
        for item in inputs
    )


def _plain_json_value(value: Any) -> Any:
    """Normalize a parsed JSON-like value after the held-out freeze boundary."""

    if isinstance(value, Mapping):
        return {str(key): _plain_json_value(value[key]) for key in value}
    if isinstance(value, list):
        return [_plain_json_value(item) for item in value]
    return value


def build_candidate_report(
    benchmark: Mapping[str, Any],
    *,
    benchmark_path: Path,
    benchmark_bytes: bytes,
    driver: Any,
    uri: str,
    database: str,
    batch_size: int = 10,
) -> dict[str, Any]:
    """Build, rank, freeze, then score the exact Phase 0 benchmark."""

    require_local_bolt_uri(uri)
    _validate_batch_size(batch_size)
    if not isinstance(benchmark_bytes, bytes):
        raise LocalBenchmarkError("benchmark byte snapshot is missing")
    inputs = retrieval_inputs(benchmark)
    top_k = benchmark.get("top_k")
    if type(top_k) is not int or not 1 <= top_k <= 20:
        raise LocalBenchmarkError("benchmark top_k must be an integer from 1 to 20")
    corpus = Corpus()
    documents = union_documents(inputs, corpus=corpus)
    expected_digest = _corpus_digest(documents)
    snapshots: list[ProjectionSnapshot] = []
    ranking_runs: list[tuple[tuple[RankedPath, ...], ...]] = []
    for _ in range(2):
        snapshots.append(
            rebuild_projection(
                driver,
                database=database,
                documents=documents,
                batch_size=batch_size,
            )
        )
        ranking_runs.append(
            freeze_all_rankings(
                driver,
                database=database,
                inputs=inputs,
                top_k=top_k,
                corpus=corpus,
            )
        )
    if any(snapshot.sha256 != expected_digest for snapshot in snapshots):
        raise LocalBenchmarkError("local projection digest differs from the Phase 0 corpus")
    if snapshots[0] != snapshots[1]:
        raise LocalBenchmarkError("two clean local Neo4j rebuilds are not deterministic")
    if ranking_runs[0] != ranking_runs[1]:
        raise LocalBenchmarkError("local full-text rankings changed across clean rebuilds")
    frozen_rankings = ranking_runs[1]

    # This is deliberately after both complete immutable ranking matrices exist.
    # Validation and evaluation are the first readers of scoring-only fields.
    try:
        current_benchmark_bytes = benchmark_path.read_bytes()
        parsed_snapshot = json.loads(benchmark_bytes.decode("utf-8", errors="strict"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise LocalBenchmarkError("Phase 0 benchmark changed or became unreadable") from exc
    if current_benchmark_bytes != benchmark_bytes:
        raise LocalBenchmarkError("Phase 0 benchmark changed while retrieval was running")
    if _plain_json_value(benchmark) != parsed_snapshot:
        raise LocalBenchmarkError("parsed benchmark does not match its frozen byte snapshot")
    validate_benchmark(benchmark)
    cases = benchmark["cases"]
    evaluated = [
        _evaluate_case(case, ranking)
        for case, ranking in zip(cases, frozen_rankings)
    ]

    categories: dict[str, dict[str, Any]] = {}
    for category in sorted(REQUIRED_CATEGORIES):
        subset = [result for result in evaluated if result["category"] == category]
        evidence_target_count = sum(
            len(case["evidence"])
            for case in cases
            if case["category"] == category
        )
        evidence_hit_count = sum(len(result["evidence_hits"]) for result in subset)
        categories[category] = {
            "case_count": len(subset),
            "complete_evidence_recall_at_k": _rate(
                sum(bool(result["complete_evidence_recall"]) for result in subset),
                len(subset),
            ),
            "evidence_path_recall_at_k": _rate(
                evidence_hit_count, evidence_target_count
            ),
            "mean_reciprocal_rank": _mean(
                [result["reciprocal_rank"] for result in subset]
            ),
        }

    evidence_target_count = sum(len(case["evidence"]) for case in cases)
    evidence_hit_count = sum(len(result["evidence_hits"]) for result in evaluated)
    temporal = [result for result in evaluated if result["category"] == "temporal_cutoff"]
    return {
        "benchmark": {
            "as_of": benchmark["as_of"],
            "case_count": len(cases),
            "sha256": hashlib.sha256(benchmark_bytes).hexdigest(),
            "top_k": top_k,
            "version": benchmark["benchmark_version"],
        },
        "cases": evaluated,
        "category_metrics": categories,
        "corpus": {
            "sha256": expected_digest,
            "total_bytes": snapshots[0].total_bytes,
            "unique_files_considered": snapshots[0].unique_files,
        },
        "limitations": list(benchmark["assessment_limits"]),
        "method": {
            "description": (
                "Two clean local-only Neo4j full-text projection rebuilds followed by "
                "fixed parameterized scoped retrieval."
            ),
            "ranking_inputs": ["question", "search_roots"],
            "scoring_fields_hidden_until_after_ranking": True,
            "local_loopback_only": True,
            "rebuild_count": 2,
            "rebuild_digests": [snapshot.sha256 for snapshot in snapshots],
            "fulltext_analyzer": "standard-no-stop-words",
            "tie_breaker": "repository-relative path ascending",
            "timing_recorded": False,
        },
        "metrics": {
            "complete_evidence_recall_at_k": _rate(
                sum(bool(result["complete_evidence_recall"]) for result in evaluated),
                len(evaluated),
            ),
            "evidence_path_recall_at_k": _rate(
                evidence_hit_count, evidence_target_count
            ),
            "mean_reciprocal_rank": _mean(
                [result["reciprocal_rank"] for result in evaluated]
            ),
            "protected_path_intrusions": sum(
                len(result["protected_hits"]) for result in evaluated
            ),
            "temporal_forbidden_path_hits": sum(
                len(result["forbidden_hits"]) for result in temporal
            ),
            "temporal_leakage_case_rate": _rate(
                sum(bool(result["forbidden_hits"]) for result in temporal),
                len(temporal),
            ),
        },
        "report_version": "memory-neo4j-phase0-candidate/v1",
    }


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--benchmark", type=Path, default=DEFAULT_BENCHMARK)
    parser.add_argument("--credentials", type=Path, default=DEFAULT_CREDENTIALS)
    parser.add_argument("--batch-size", type=int, default=10)
    args = parser.parse_args(argv)

    driver: Any = None
    try:
        benchmark_path = args.benchmark.resolve()
        benchmark_snapshot = load_benchmark_snapshot(benchmark_path)
        benchmark = benchmark_snapshot.benchmark
        credential_path = (
            args.credentials
            if args.credentials.is_absolute()
            else Path.cwd() / args.credentials
        )
        credentials = load_local_credentials(credential_path)
        try:
            from neo4j import GraphDatabase
        except ImportError as exc:
            raise LocalBenchmarkError(
                "install the locked local Neo4j driver requirements before running"
            ) from exc
        driver = GraphDatabase.driver(
            credentials.uri,
            auth=(credentials.username, credentials.password),
        )
        driver.verify_connectivity()
        report = build_candidate_report(
            benchmark,
            benchmark_path=benchmark_path,
            benchmark_bytes=benchmark_snapshot.raw,
            driver=driver,
            uri=credentials.uri,
            database=credentials.database,
            batch_size=args.batch_size,
        )
        sys.stdout.write(render_report(report))
        return 0
    except (LocalBenchmarkError, OSError) as exc:
        print(str(exc), file=sys.stderr)
        return 2
    except Exception:
        print("local Neo4j benchmark failed without exposing connection details", file=sys.stderr)
        return 3
    finally:
        if driver is not None:
            driver.close()


if __name__ == "__main__":
    raise SystemExit(main())
