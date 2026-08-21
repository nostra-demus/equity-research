#!/usr/bin/env python3
"""Offline safety regressions for the local-only Neo4j Phase 0 runner."""

from __future__ import annotations

import io
import json
import tempfile
import unittest
from collections.abc import Iterator, Mapping
from contextlib import redirect_stderr
from datetime import date
from pathlib import Path
from typing import Any, Optional
from unittest.mock import patch

from memory_baseline import DEFAULT_BENCHMARK, Corpus, Document, _corpus_digest
from memory_neo4j_phase0_benchmark import (
    AWAIT_INDEX_QUERY,
    CONSTRAINT_METADATA_QUERY,
    DATASET,
    DELETE_QUERY,
    DOCUMENT_LABEL,
    FOREIGN_LABEL_QUERY,
    FULLTEXT_INDEX,
    INDEX_METADATA_QUERY,
    LIST_DATASET_PATHS_QUERY,
    LOAD_QUERY,
    MAX_WRITE_BATCH_BYTES,
    PATH_PAGE_SIZE,
    RANK_QUERY,
    SCHEMA_QUERIES,
    SNAPSHOT_QUERY,
    SNAPSHOT_COUNT_QUERY,
    LocalBenchmarkError,
    RetrievalInput,
    _delete_dataset_in_batches,
    _document_batches,
    _document_observed_day,
    _projection_row,
    _serialized_parameter_bytes,
    build_candidate_report,
    load_local_credentials,
    main,
    rank_case,
    rebuild_projection,
    require_local_bolt_uri,
    retrieval_inputs,
    union_documents,
)


SCORING_FIELDS = frozenset(
    {
        "id",
        "category",
        "answer_key",
        "evidence",
        "evidence_mode",
        "expected_outcome",
        "forbidden_paths",
        "protected_path_globs",
        "cutoff",
    }
)


class GuardedCase(Mapping[str, Any]):
    """Fail if a scoring field is read before the final retrieval returns."""

    def __init__(self, value: Mapping[str, Any], state: dict[str, bool]) -> None:
        self._value = dict(value)
        self._state = state

    def __getitem__(self, key: str) -> Any:
        if key in SCORING_FIELDS and not self._state["all_ranked"]:
            raise AssertionError(f"scoring field read before rankings froze: {key}")
        return self._value[key]

    def __iter__(self) -> Iterator[str]:
        return iter(self._value)

    def __len__(self) -> int:
        return len(self._value)


class FakeDriver:
    """Small stateful Neo4j substitute that records every query and parameter."""

    def __init__(
        self,
        *,
        expected_rank_calls: Optional[int] = None,
        state: Optional[dict[str, bool]] = None,
        vary_rank_by_rebuild: bool = False,
        foreign_nodes: int = 0,
        wrong_index: bool = False,
    ) -> None:
        self.nodes: dict[str, dict[str, Any]] = {}
        self.calls: list[tuple[str, dict[str, Any], str]] = []
        self.expected_rank_calls = expected_rank_calls
        self.rank_calls = 0
        self.state = state
        self.vary_rank_by_rebuild = vary_rank_by_rebuild
        self.foreign_nodes = foreign_nodes
        self.wrong_index = wrong_index
        self.rebuilds = 0

    def execute_query(
        self,
        query: str,
        *,
        parameters_: Optional[Mapping[str, Any]] = None,
        database_: str,
    ) -> tuple[list[Mapping[str, Any]], None, None]:
        parameters = dict(parameters_ or {})
        self.calls.append((query, parameters, database_))
        if query == SCHEMA_QUERIES[0]:
            self.rebuilds += 1
        if query in SCHEMA_QUERIES or query == AWAIT_INDEX_QUERY:
            return ([], None, None)
        if query == LIST_DATASET_PATHS_QUERY:
            after_path = parameters["after_path"]
            paths = [
                path
                for path in sorted(self.nodes)
                if after_path is None or path > after_path
            ][: parameters["limit"]]
            return (
                [{"path": path} for path in paths],
                None,
                None,
            )
        if query == DELETE_QUERY:
            deleted = 0
            for path in parameters["paths"]:
                if path in self.nodes:
                    del self.nodes[path]
                    deleted += 1
            return ([{"deleted": deleted}], None, None)
        if query == LOAD_QUERY:
            for row in parameters["rows"]:
                path = row["path"]
                if path in self.nodes:
                    raise AssertionError("test projection created a duplicate path")
                self.nodes[path] = dict(row)
            return ([], None, None)
        if query == INDEX_METADATA_QUERY:
            return (
                [
                    {
                        "state": "ONLINE",
                        "labelsOrTypes": [
                            "WrongLabel" if self.wrong_index else DOCUMENT_LABEL
                        ],
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
        if query == CONSTRAINT_METADATA_QUERY:
            return (
                [
                    {
                        "type": "NODE_PROPERTY_UNIQUENESS",
                        "labelsOrTypes": [DOCUMENT_LABEL],
                        "properties": ["phase0_dataset", "path"],
                    }
                ],
                None,
                None,
            )
        if query == SNAPSHOT_QUERY:
            return (
                [
                    {
                        "path": path,
                        "search_text": row["search_text"],
                        "content_sha256": row["content_sha256"],
                        "byte_count": row["byte_count"],
                    }
                    for path, row in sorted(self.nodes.items())
                    if path in parameters["paths"]
                ],
                None,
                None,
            )
        if query == SNAPSHOT_COUNT_QUERY:
            return ([{"node_count": len(self.nodes)}], None, None)
        if query == FOREIGN_LABEL_QUERY:
            return ([{"foreign_nodes": self.foreign_nodes}], None, None)
        if query == RANK_QUERY:
            self.rank_calls += 1
            # Return reverse path order with equal scores so the client-side tie
            # check has observable work to do.
            rows = [
                {
                    "path": path,
                    "score": float(self.rebuilds) if self.vary_rank_by_rebuild else 1.0,
                }
                for path in reversed(parameters["allowed_paths"][: parameters["top_k"]])
            ]
            if (
                self.state is not None
                and self.expected_rank_calls is not None
                and self.rank_calls == self.expected_rank_calls
            ):
                self.state["all_ranked"] = True
            return (rows, None, None)
        raise AssertionError(f"unexpected query: {query}")


class StaticCorpus:
    """Return one synthetic document without touching the repository corpus."""

    def __init__(self, document: Document) -> None:
        self.document = document

    def documents_for(self, _roots: Any) -> tuple[Document, ...]:
        return (self.document,)


def synthetic_clock_document(value: Mapping[str, Any]) -> Document:
    text = json.dumps(value, sort_keys=True)
    return Document(
        path="synthetic/2026-01-01/clock.json",
        raw=text.encode("utf-8"),
        text=text,
        lower_text=text.casefold(),
    )


def one_case_benchmark() -> dict[str, Any]:
    return {
        "benchmark_version": "memory-held-out-benchmark/v1",
        "as_of": "2026-08-21",
        "top_k": 5,
        "held_out_protocol": {
            "retrieval_inputs": ["question", "search_roots"],
            "scoring_only": sorted(SCORING_FIELDS),
        },
        "assessment_limits": ["test fixture"],
        "cases": [
            {
                "id": "not-visible-to-retrieval",
                "category": "fact_recall",
                "question": "What does Phase 0 freeze?",
                "search_roots": ["frameworks/memory/phase0/README.md"],
                "expected_outcome": "retrieve",
                "answer_key": "not visible",
                "evidence": [
                    {
                        "path": "frameworks/memory/phase0/README.md",
                        "anchors": ["Permanent memory Phase 0"],
                    }
                ],
                "forbidden_paths": [],
                "protected_path_globs": [],
            }
        ],
    }


class MemoryNeo4jPhase0BenchmarkTests(unittest.TestCase):
    def test_uri_gate_accepts_only_direct_literal_loopback_bolt(self) -> None:
        self.assertEqual(
            require_local_bolt_uri("bolt://127.0.0.1:17687"),
            ("127.0.0.1", 17687),
        )
        self.assertEqual(
            require_local_bolt_uri("bolt://[::1]:17687"),
            ("::1", 17687),
        )
        for unsafe in (
            "neo4j+s://example.databases.neo4j.io",
            "bolt://192.0.2.1:7687",
            "neo4j://127.0.0.1:7687",
            "bolt://localhost:7687",
            "bolt://user:secret@127.0.0.1:7687",
            "bolt://127.0.0.1:7687/path",
            "bolt://127.0.0.1",
            "bolt://127.0.0.1:0",
        ):
            with self.subTest(uri=unsafe), self.assertRaises(LocalBenchmarkError):
                require_local_bolt_uri(unsafe)

    def test_credentials_are_private_and_aura_is_refused(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "local.env"
            path.write_text(
                "\n".join(
                    [
                        "NEO4J_URI=bolt://127.0.0.1:17687",
                        "NEO4J_USERNAME=neo4j",
                        "NEO4J_PASSWORD=private-test-password",
                        "NEO4J_DATABASE=neo4j",
                        "",
                    ]
                ),
                encoding="utf-8",
            )
            path.chmod(0o600)
            credentials = load_local_credentials(path)
            self.assertNotIn("private-test-password", repr(credentials))
            self.assertEqual(credentials.uri, "bolt://127.0.0.1:17687")

            path.chmod(0o644)
            with self.assertRaisesRegex(LocalBenchmarkError, "0600"):
                load_local_credentials(path)

            path.chmod(0o600)
            path.write_text(
                "\n".join(
                    [
                        "NEO4J_URI=neo4j+s://example.databases.neo4j.io",
                        "NEO4J_USERNAME=neo4j",
                        "NEO4J_PASSWORD=private-test-password",
                        "NEO4J_DATABASE=neo4j",
                    ]
                ),
                encoding="utf-8",
            )
            with self.assertRaisesRegex(LocalBenchmarkError, "direct bolt"):
                load_local_credentials(path)

    def test_main_does_not_resolve_a_credential_symlink_before_lstat(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "target.env"
            target.write_text(
                "\n".join(
                    [
                        "NEO4J_URI=bolt://127.0.0.1:17687",
                        "NEO4J_USERNAME=neo4j",
                        "NEO4J_PASSWORD=must-not-appear",
                        "NEO4J_DATABASE=neo4j",
                    ]
                ),
                encoding="utf-8",
            )
            target.chmod(0o600)
            link = Path(directory) / "credentials.env"
            link.symlink_to(target)
            stderr = io.StringIO()
            with redirect_stderr(stderr):
                result = main(
                    [
                        "--benchmark",
                        str(DEFAULT_BENCHMARK),
                        "--credentials",
                        str(link),
                    ]
                )
            self.assertEqual(result, 2)
            self.assertIn("must be regular", stderr.getvalue())
            self.assertNotIn("must-not-appear", stderr.getvalue())

    def test_union_is_exact_baseline_corpus_semantics(self) -> None:
        inputs = (
            RetrievalInput(
                question="first",
                search_roots=("frameworks/memory/phase0",),
            ),
            RetrievalInput(
                question="second",
                search_roots=(
                    "frameworks/memory/phase0/README.md",
                    "frameworks/memory/phase0",
                ),
            ),
        )
        candidate_corpus = Corpus()
        candidate = union_documents(inputs, corpus=candidate_corpus)
        reference = Corpus().documents_for(
            ["frameworks/memory/phase0", "frameworks/memory/phase0/README.md"]
        )
        self.assertEqual(
            [(document.path, document.raw) for document in candidate],
            [(document.path, document.raw) for document in reference],
        )
        self.assertEqual(
            _corpus_digest(candidate),
            _corpus_digest(reference),
        )

    def test_ranker_is_parameterized_scoped_unique_and_path_tied(self) -> None:
        driver = FakeDriver()
        corpus = Corpus()
        ranked = rank_case(
            driver,
            database="neo4j",
            question="Phase memory evidence",
            search_roots=("frameworks/memory/phase0",),
            top_k=5,
            corpus=corpus,
        )
        call = next(call for call in driver.calls if call[0] == RANK_QUERY)
        query, parameters, database = call
        self.assertEqual(database, "neo4j")
        self.assertEqual(
            set(parameters),
            {"dataset", "query", "allowed_paths", "top_k"},
        )
        self.assertEqual(parameters["dataset"], DATASET)
        self.assertNotIn("Phase memory evidence", query)
        self.assertIn("$query", query)
        self.assertIn("$allowed_paths", query)
        self.assertIn("ORDER BY score DESC, path ASC", query)
        self.assertEqual(
            [item.path for item in ranked],
            sorted(item.path for item in ranked),
        )
        self.assertEqual(len({item.path for item in ranked}), len(ranked))
        expected_scope = {
            document.path
            for document in Corpus().documents_for(["frameworks/memory/phase0"])
        }
        self.assertTrue({item.path for item in ranked}.issubset(expected_scope))

    def test_temporal_filter_derives_only_from_allowed_inputs(self) -> None:
        driver = FakeDriver()
        rank_case(
            driver,
            database="neo4j",
            question=(
                "As known at the end of 2026-07-10, what was the engine's "
                "AMZN decision?"
            ),
            search_roots=("analyses/AMZN_2026-07-10",),
            top_k=5,
            corpus=Corpus(),
        )
        parameters = next(
            parameters for query, parameters, _ in driver.calls if query == RANK_QUERY
        )
        self.assertIn(
            "analyses/AMZN_2026-07-10/decision_record.json",
            parameters["allowed_paths"],
        )
        self.assertNotIn(
            "analyses/AMZN_2026-07-10/reviews/2026-08-09_30d_decision_review.json",
            parameters["allowed_paths"],
        )

        emaar_cutoff_driver = FakeDriver()
        rank_case(
            emaar_cutoff_driver,
            database="neo4j",
            question=(
                "On 2026-07-03, before the later correction and rerun, what "
                "EMAAR call was recorded?"
            ),
            search_roots=("analyses/EMAAR_2026-07-03", "analyses/EMAAR_2026-07-10"),
            top_k=5,
            corpus=Corpus(),
        )
        emaar_parameters = next(
            parameters
            for query, parameters, _ in emaar_cutoff_driver.calls
            if query == RANK_QUERY
        )
        self.assertNotIn(
            "analyses/EMAAR_2026-07-03/corrections.json",
            emaar_parameters["allowed_paths"],
        )
        self.assertNotIn(
            "analyses/EMAAR_2026-07-10/decision_record.json",
            emaar_parameters["allowed_paths"],
        )

        update_driver = FakeDriver()
        rank_case(
            update_driver,
            database="neo4j",
            question=(
                "What is the standing EMAAR call after the 2026-07-03 record "
                "was corrected, and why?"
            ),
            search_roots=("analyses/EMAAR_2026-07-03", "analyses/EMAAR_2026-07-10"),
            top_k=5,
            corpus=Corpus(),
        )
        update_parameters = next(
            parameters
            for query, parameters, _ in update_driver.calls
            if query == RANK_QUERY
        )
        self.assertIn(
            "analyses/EMAAR_2026-07-10/decision_record.json",
            update_parameters["allowed_paths"],
        )

        board_driver = FakeDriver()
        board_result = rank_case(
            board_driver,
            database="neo4j",
            question="At processing time on 2026-08-05, what was known?",
            search_roots=("screener/board/index.json",),
            top_k=5,
            corpus=Corpus(),
        )
        self.assertEqual(board_result, ())
        self.assertFalse(any(query == RANK_QUERY for query, _, _ in board_driver.calls))

    def test_temporal_cutoff_uses_structured_clocks_and_denies_unknown_time(self) -> None:
        corpus = Corpus()
        uber_path = "analyses/UBER_2026-08-06/pre_mortem.json"
        theme_path = "screener/board/themes_index.json"
        unknown_path = "frameworks/EXTERNAL_DATA.md"

        uber_document = corpus.documents_for([uber_path])[0]
        theme_document = corpus.documents_for([theme_path])[0]
        unknown_document = corpus.documents_for([unknown_path])[0]
        self.assertEqual(_document_observed_day(uber_document), date(2026, 8, 7))
        # This committed JSON is deliberately compact (one physical line).
        self.assertEqual(len(theme_document.text.splitlines()), 1)
        self.assertEqual(_document_observed_day(theme_document), date(2026, 8, 21))
        self.assertIsNone(_document_observed_day(unknown_document))

        for path, question in (
            (uber_path, "On 2026-08-06, what did the UBER pre-mortem record?"),
            (theme_path, "As of 2026-08-05, what board themes were known?"),
            (unknown_path, "As of 2026-08-05, what external-data rule was known?"),
        ):
            with self.subTest(path=path):
                driver = FakeDriver()
                self.assertEqual(
                    rank_case(
                        driver,
                        database="neo4j",
                        question=question,
                        search_roots=(path,),
                        top_k=5,
                        corpus=corpus,
                    ),
                    (),
                )
                self.assertFalse(
                    any(query == RANK_QUERY for query, _, _ in driver.calls)
                )

    def test_temporal_cutoff_denies_malformed_or_non_string_recording_clock(self) -> None:
        for generated_at in (
            "not-a-clock",
            "2026-02-30",
            "2026-01-01Tnot-rfc3339",
            "2026-01-01 and 2026-01-02",
            1_700_000_000,
        ):
            with self.subTest(generated_at=generated_at):
                document = synthetic_clock_document({"generated_at": generated_at})
                driver = FakeDriver()
                self.assertIsNone(_document_observed_day(document))
                self.assertEqual(
                    rank_case(
                        driver,
                        database="neo4j",
                        question="As of 2026-01-02, what was known?",
                        search_roots=(document.path,),
                        top_k=5,
                        corpus=StaticCorpus(document),  # type: ignore[arg-type]
                    ),
                    (),
                )
                self.assertFalse(
                    any(query == RANK_QUERY for query, _, _ in driver.calls)
                )

    def test_temporal_cutoff_denies_malformed_or_non_string_fallback_clock(self) -> None:
        for payload in (
            {"as_of": "2026-01-01 and 2026-01-02"},
            {"decision_date": ["2026-01-01"]},
        ):
            with self.subTest(payload=payload):
                document = synthetic_clock_document(payload)
                driver = FakeDriver()
                self.assertIsNone(_document_observed_day(document))
                self.assertEqual(
                    rank_case(
                        driver,
                        database="neo4j",
                        question="As of 2026-01-02, what was known?",
                        search_roots=(document.path,),
                        top_k=5,
                        corpus=StaticCorpus(document),  # type: ignore[arg-type]
                    ),
                    (),
                )
                self.assertFalse(
                    any(query == RANK_QUERY for query, _, _ in driver.calls)
                )

    def test_temporal_cutoff_denies_malformed_correction_successor(self) -> None:
        for successor in (
            "analyses/NEXT_2026-01-02",
            {"run_root": "analyses/NEXT_2026-01-02"},
            {"date": "not-a-clock"},
            {"date": 20260102},
        ):
            with self.subTest(successor=successor):
                document = synthetic_clock_document(
                    {
                        "schema": "corrections/v1",
                        "superseded_by": successor,
                    }
                )
                driver = FakeDriver()
                self.assertIsNone(_document_observed_day(document))
                self.assertEqual(
                    rank_case(
                        driver,
                        database="neo4j",
                        question="As of 2026-01-02, what was known?",
                        search_roots=(document.path,),
                        top_k=5,
                        corpus=StaticCorpus(document),  # type: ignore[arg-type]
                    ),
                    (),
                )
                self.assertFalse(
                    any(query == RANK_QUERY for query, _, _ in driver.calls)
                )

    def test_two_rebuilds_and_all_rankings_freeze_before_scoring(self) -> None:
        state = {"all_ranked": False}
        first = GuardedCase(
            {
                "id": "hidden-case-one",
                "category": "fact_recall",
                "question": "What does Phase 0 freeze?",
                "search_roots": ["frameworks/memory/phase0/README.md"],
                "expected_outcome": "retrieve",
                "answer_key": "hidden answer one",
                "evidence": [
                    {
                        "path": "frameworks/memory/phase0/README.md",
                        "anchors": ["Permanent memory Phase 0"],
                    }
                ],
                "forbidden_paths": [],
                "protected_path_globs": [],
            },
            state,
        )
        second = GuardedCase(
            {
                "id": "hidden-case-two",
                "category": "lineage",
                "question": "What does Phase 6 measure?",
                "search_roots": ["frameworks/memory/PHASE6.md"],
                "expected_outcome": "retrieve",
                "answer_key": "hidden answer two",
                "evidence": [
                    {
                        "path": "frameworks/memory/PHASE6.md",
                        "anchors": ["operational evidence"],
                    }
                ],
                "forbidden_paths": [],
                "protected_path_globs": [],
            },
            state,
        )
        benchmark: dict[str, Any] = {
            "benchmark_version": "memory-held-out-benchmark/v1",
            "as_of": "2026-08-21",
            "top_k": 5,
            "held_out_protocol": {
                "retrieval_inputs": ["question", "search_roots"],
                "scoring_only": sorted(SCORING_FIELDS),
            },
            "assessment_limits": ["test fixture"],
            "cases": [first, second],
        }
        benchmark_plain = {
            **{key: value for key, value in benchmark.items() if key != "cases"},
            "cases": [dict(first._value), dict(second._value)],
        }
        benchmark_bytes = json.dumps(benchmark_plain).encode("utf-8")
        driver = FakeDriver(expected_rank_calls=4, state=state)

        def late_validation(value: Mapping[str, Any]) -> None:
            self.assertTrue(state["all_ranked"])
            for case in value["cases"]:
                for field in SCORING_FIELDS:
                    case.get(field)

        with tempfile.TemporaryDirectory() as directory:
            benchmark_path = Path(directory) / "benchmark.json"
            benchmark_path.write_bytes(benchmark_bytes)
            with patch(
                "memory_neo4j_phase0_benchmark.validate_benchmark",
                side_effect=late_validation,
            ):
                report = build_candidate_report(
                    benchmark,
                    benchmark_path=benchmark_path,
                    benchmark_bytes=benchmark_bytes,
                    driver=driver,
                    uri="bolt://127.0.0.1:17687",
                    database="neo4j",
                    batch_size=10,
                )

        self.assertTrue(state["all_ranked"])
        self.assertEqual(driver.rank_calls, 4)
        self.assertEqual(
            sum(query == LIST_DATASET_PATHS_QUERY for query, _, _ in driver.calls),
            2,
        )
        self.assertEqual(
            sum(query == DELETE_QUERY for query, _, _ in driver.calls),
            1,
        )
        self.assertEqual(
            sum(query == SNAPSHOT_QUERY for query, _, _ in driver.calls),
            2,
        )
        self.assertEqual(report["method"]["rebuild_count"], 2)
        self.assertEqual(
            len(set(report["method"]["rebuild_digests"])),
            1,
        )
        self.assertEqual(report["corpus"]["unique_files_considered"], 2)
        self.assertTrue(report["method"]["scoring_fields_hidden_until_after_ranking"])

        load_calls = [parameters for query, parameters, _ in driver.calls if query == LOAD_QUERY]
        self.assertEqual(len(load_calls), 2)
        for call in load_calls:
            for row in call["rows"]:
                self.assertEqual(
                    set(row),
                    {
                        "dataset",
                        "path",
                        "search_text",
                        "content_sha256",
                        "byte_count",
                    },
                )
                self.assertNotIn("hidden-case", row["path"])
        for query, parameters, _ in driver.calls:
            if query == RANK_QUERY:
                self.assertEqual(
                    set(parameters),
                    {"dataset", "query", "allowed_paths", "top_k"},
                )

    def test_invalid_batch_size_fails_before_any_database_write(self) -> None:
        driver = FakeDriver()
        with self.assertRaisesRegex(LocalBenchmarkError, "batch size"):
            build_candidate_report(
                one_case_benchmark(),
                benchmark_path=DEFAULT_BENCHMARK,
                benchmark_bytes=b"{}",
                driver=driver,
                uri="bolt://127.0.0.1:17687",
                database="neo4j",
                batch_size=0,
            )
        self.assertEqual(driver.calls, [])

    def test_serialized_write_batches_obey_the_exact_byte_cap(self) -> None:
        text = '"\n\\é' * 80_000
        raw = text.encode("utf-8")
        documents = tuple(
            Document(
                path=f"synthetic/{index:02}.txt",
                raw=raw,
                text=text,
                lower_text=text.casefold(),
            )
            for index in range(8)
        )
        batches = list(_document_batches(documents, 100))
        self.assertGreater(len(batches), 1)
        for batch in batches:
            parameters = {
                "rows": [_projection_row(document) for document in batch]
            }
            self.assertLessEqual(
                _serialized_parameter_bytes(parameters),
                MAX_WRITE_BATCH_BYTES,
            )

    def test_single_oversized_row_fails_before_any_database_call(self) -> None:
        text = '"' * (MAX_WRITE_BATCH_BYTES // 2 + 1)
        document = Document(
            path="synthetic/oversized.txt",
            raw=text.encode("utf-8"),
            text=text,
            lower_text=text,
        )
        driver = FakeDriver()
        with self.assertRaisesRegex(LocalBenchmarkError, "serialized write limit"):
            rebuild_projection(
                driver,
                database="neo4j",
                documents=(document,),
                batch_size=100,
            )
        self.assertEqual(driver.calls, [])

    def test_foreign_label_nodes_fail_before_dataset_deletion(self) -> None:
        documents = Corpus().documents_for(["frameworks/memory/phase0/README.md"])
        driver = FakeDriver(foreign_nodes=1)
        with self.assertRaisesRegex(LocalBenchmarkError, "foreign dataset"):
            rebuild_projection(
                driver,
                database="neo4j",
                documents=documents,
                batch_size=10,
            )
        self.assertFalse(any(query in SCHEMA_QUERIES for query, _, _ in driver.calls))
        self.assertFalse(any(query == DELETE_QUERY for query, _, _ in driver.calls))

    def test_wrong_existing_index_fails_before_corpus_mutation(self) -> None:
        documents = Corpus().documents_for(["frameworks/memory/phase0/README.md"])
        driver = FakeDriver(wrong_index=True)
        with self.assertRaisesRegex(LocalBenchmarkError, "unexpected metadata"):
            rebuild_projection(
                driver,
                database="neo4j",
                documents=documents,
                batch_size=10,
            )
        self.assertFalse(any(query == DELETE_QUERY for query, _, _ in driver.calls))
        self.assertFalse(any(query == LOAD_QUERY for query, _, _ in driver.calls))

    def test_rebuild_deletes_only_in_exact_bounded_path_batches(self) -> None:
        documents = Corpus().documents_for(["frameworks/memory/phase0"])
        driver = FakeDriver()
        rebuild_projection(
            driver,
            database="neo4j",
            documents=documents,
            batch_size=2,
        )
        rebuild_projection(
            driver,
            database="neo4j",
            documents=documents,
            batch_size=2,
        )
        delete_calls = [
            parameters for query, parameters, _ in driver.calls if query == DELETE_QUERY
        ]
        self.assertGreater(len(delete_calls), 1)
        self.assertEqual(
            sum(len(parameters["paths"]) for parameters in delete_calls),
            len(documents),
        )
        self.assertTrue(
            all(1 <= len(parameters["paths"]) <= 2 for parameters in delete_calls)
        )
        self.assertIn("node.path IN $paths", DELETE_QUERY)
        self.assertTrue(
            all(set(parameters) == {"dataset", "paths"} for parameters in delete_calls)
        )

    def test_dataset_inventory_uses_bounded_keyset_pages(self) -> None:
        driver = FakeDriver()
        driver.nodes = {
            f"synthetic/{index:03}.md": {"path": f"synthetic/{index:03}.md"}
            for index in range(PATH_PAGE_SIZE * 2 + 5)
        }
        _delete_dataset_in_batches(driver, "neo4j", batch_size=10)
        self.assertEqual(driver.nodes, {})
        page_calls = [
            parameters
            for query, parameters, _ in driver.calls
            if query == LIST_DATASET_PATHS_QUERY
        ]
        self.assertEqual(len(page_calls), 3)
        self.assertEqual(
            [parameters["after_path"] for parameters in page_calls],
            [None, "synthetic/099.md", "synthetic/199.md"],
        )
        self.assertTrue(
            all(parameters["limit"] == PATH_PAGE_SIZE for parameters in page_calls)
        )
        self.assertIn("node.path > $after_path", LIST_DATASET_PATHS_QUERY)
        self.assertIn("LIMIT $limit", LIST_DATASET_PATHS_QUERY)
        self.assertNotIn("SKIP", LIST_DATASET_PATHS_QUERY)
        delete_calls = [
            parameters
            for query, parameters, _ in driver.calls
            if query == DELETE_QUERY
        ]
        self.assertEqual(
            sum(len(parameters["paths"]) for parameters in delete_calls),
            PATH_PAGE_SIZE * 2 + 5,
        )
        self.assertTrue(
            all(1 <= len(parameters["paths"]) <= 10 for parameters in delete_calls)
        )

    def test_snapshot_verifies_exact_searchable_text(self) -> None:
        class CorruptSnapshotDriver(FakeDriver):
            def execute_query(self, query: str, **kwargs: Any) -> Any:
                result = super().execute_query(query, **kwargs)
                if query == SNAPSHOT_QUERY and result[0]:
                    rows = [dict(row) for row in result[0]]
                    rows[0]["search_text"] += " altered"
                    return (rows, None, None)
                return result

        documents = Corpus().documents_for(["frameworks/memory/phase0/README.md"])
        with self.assertRaisesRegex(LocalBenchmarkError, "content differs"):
            rebuild_projection(
                CorruptSnapshotDriver(),
                database="neo4j",
                documents=documents,
                batch_size=10,
            )

    def test_rank_rows_are_closed(self) -> None:
        class ExtraFieldDriver(FakeDriver):
            def execute_query(self, query: str, **kwargs: Any) -> Any:
                result = super().execute_query(query, **kwargs)
                if query == RANK_QUERY and result[0]:
                    rows = [dict(row, case_id="must-not-be-returned") for row in result[0]]
                    return (rows, None, None)
                return result

        with self.assertRaisesRegex(LocalBenchmarkError, "row is not closed"):
            rank_case(
                ExtraFieldDriver(),
                database="neo4j",
                question="Phase 0",
                search_roots=("frameworks/memory/phase0/README.md",),
                top_k=5,
                corpus=Corpus(),
            )

    def test_rankings_must_match_across_two_clean_rebuilds(self) -> None:
        benchmark = one_case_benchmark()
        raw = json.dumps(benchmark).encode("utf-8")
        with tempfile.TemporaryDirectory() as directory:
            benchmark_path = Path(directory) / "benchmark.json"
            benchmark_path.write_bytes(raw)
            with self.assertRaisesRegex(LocalBenchmarkError, "rankings changed"):
                build_candidate_report(
                    benchmark,
                    benchmark_path=benchmark_path,
                    benchmark_bytes=raw,
                    driver=FakeDriver(vary_rank_by_rebuild=True),
                    uri="bolt://127.0.0.1:17687",
                    database="neo4j",
                    batch_size=10,
                )

    def test_benchmark_bytes_cannot_change_during_retrieval(self) -> None:
        benchmark = one_case_benchmark()
        raw = json.dumps(benchmark).encode("utf-8")
        with tempfile.TemporaryDirectory() as directory:
            benchmark_path = Path(directory) / "benchmark.json"
            benchmark_path.write_bytes(raw + b"\n")
            with self.assertRaisesRegex(LocalBenchmarkError, "changed while retrieval"):
                build_candidate_report(
                    benchmark,
                    benchmark_path=benchmark_path,
                    benchmark_bytes=raw,
                    driver=FakeDriver(),
                    uri="bolt://127.0.0.1:17687",
                    database="neo4j",
                    batch_size=10,
                )

    def test_retrieval_copy_does_not_read_scoring_fields(self) -> None:
        state = {"all_ranked": False}
        case = GuardedCase(
            {
                "id": "must-remain-hidden",
                "category": "fact_recall",
                "question": "Allowed question",
                "search_roots": ["frameworks/memory/phase0/README.md"],
                "answer_key": "must remain hidden",
                "evidence": [],
                "expected_outcome": "retrieve",
            },
            state,
        )
        copied = retrieval_inputs(
            {
                "held_out_protocol": {
                    "retrieval_inputs": ["question", "search_roots"]
                },
                "cases": [case],
            }
        )
        self.assertEqual(
            copied,
            (
                RetrievalInput(
                    question="Allowed question",
                    search_roots=("frameworks/memory/phase0/README.md",),
                ),
            ),
        )


if __name__ == "__main__":
    unittest.main()
