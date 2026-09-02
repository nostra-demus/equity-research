#!/usr/bin/env python3
"""Integrity and determinism tests for permanent-memory Phase 0 artifacts.

Run from any directory with:
    python3 scripts/test_memory_phase0.py
"""

from __future__ import annotations

import copy
import fnmatch
import inspect
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any, Iterable


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(SCRIPT_DIR))

import memory_baseline  # noqa: E402
import memory_contract  # noqa: E402
from memory_adapters import discover_legacy_sources  # noqa: E402


PHASE0 = REPO_ROOT / "frameworks/memory/phase0"
UNMOUNTED_COUNT_IDS = frozenset(
    {"mounted-source-pools", "external-ingestion-inbox", "connector-operations"}
)
failures: list[str] = []


def check(condition: bool, message: str) -> None:
    if not condition:
        failures.append(message)
        print(f"FAIL: {message}")


def load(name: str) -> dict[str, Any]:
    path = PHASE0 / name
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        check(False, f"{name} must be readable JSON: {exc}")
        return {}
    check(isinstance(value, dict), f"{name} must contain a JSON object")
    return value if isinstance(value, dict) else {}


def check_unique_ids(objects: Iterable[dict[str, Any]], label: str) -> None:
    identifiers = [obj.get("id") for obj in objects]
    check(all(isinstance(item, str) and item for item in identifiers), f"{label} IDs must be strings")
    check(len(identifiers) == len(set(identifiers)), f"{label} IDs must be unique")


def path_without_fragment(value: str) -> Path:
    return REPO_ROOT / value.split("#", 1)[0]


def expand_store_paths(patterns: Iterable[str]) -> set[Path]:
    """Expand catalogue globs for reproducible observed-count checks."""

    result: set[Path] = set()
    for pattern in patterns:
        if "<" in pattern:
            continue
        if pattern.endswith("/**"):
            for root in REPO_ROOT.glob(pattern[:-3]):
                if root.is_dir():
                    result.update(path for path in root.rglob("*") if path.is_file())
                elif root.is_file():
                    result.add(root)
            continue
        result.update(path for path in REPO_ROOT.glob(pattern) if path.is_file())
    return result


def catalogue_count_errors(stores: Iterable[dict[str, Any]]) -> list[str]:
    """Validate frozen mounted counts as coarse, non-shrinking lower bounds."""

    errors: list[str] = []
    for store in stores:
        store_id = store.get("id")
        observed = store.get("observed_count")
        paths = store.get("paths")
        if not memory_baseline.is_nonempty_string_list(paths):
            errors.append(
                f"store {store_id} paths must be a non-empty list of non-empty strings"
            )
            continue
        if store_id in UNMOUNTED_COUNT_IDS:
            if observed is not None:
                errors.append(f"store {store_id} is unmounted and observed_count must be null")
            continue
        if type(observed) is not int or observed < 0:
            errors.append(
                f"store {store_id} is mounted and observed_count must be a non-negative integer"
            )
            continue
        expanded = expand_store_paths(paths)
        if len(expanded) < observed:
            errors.append(
                f"store {store_id} shrank below its Phase 0 snapshot: {len(expanded)} < {observed}"
            )
    return errors


def check_catalogue(catalogue: dict[str, Any]) -> None:
    check(catalogue.get("catalogue_version") == "memory-current-state-catalogue/v1", "catalogue version")
    check(catalogue.get("observed_at") == "2026-08-21", "catalogue observation date must be frozen")

    stores = catalogue.get("stores", [])
    schemas = catalogue.get("schemas", [])
    producers = catalogue.get("producers", [])
    readers = catalogue.get("readers", [])
    for name, values in (
        ("stores", stores),
        ("schemas", schemas),
        ("producers", producers),
        ("readers", readers),
    ):
        check(isinstance(values, list) and values, f"catalogue.{name} must be non-empty")
        if isinstance(values, list):
            check_unique_ids(values, name)
    if not all(isinstance(values, list) for values in (stores, schemas, producers, readers)):
        return

    store_ids = {store["id"] for store in stores}
    producer_ids = {producer["id"] for producer in producers}
    reader_ids = {reader["id"] for reader in readers}
    store_kinds = {store.get("kind") for store in stores}
    check("ledger" in store_kinds, "catalogue must identify ledgers")
    check("source_store" in store_kinds, "catalogue must identify source stores")
    check("projection" in store_kinds, "catalogue must identify rebuildable projections")

    for store in stores:
        label = f"store {store.get('id')}"
        check(
            memory_baseline.is_nonempty_string_list(store.get("paths")),
            f"{label} paths must be a non-empty list of non-empty strings",
        )
        check(isinstance(store.get("formats"), list) and store["formats"], f"{label} must declare formats")
        count = store.get("observed_count")
        check(count is None or (type(count) is int and count >= 0), f"{label} observed_count")
        check(set(store.get("producer_ids", [])) <= producer_ids, f"{label} has unknown producer IDs")
        check(set(store.get("reader_ids", [])) <= reader_ids, f"{label} has unknown reader IDs")
        for evidence in store.get("evidence", []):
            check(path_without_fragment(evidence).is_file(), f"{label} evidence path absent: {evidence}")

    for producer in producers:
        label = f"producer {producer.get('id')}"
        check(set(producer.get("writes_store_ids", [])) <= store_ids, f"{label} references unknown stores")
        check(producer.get("writes_store_ids"), f"{label} must write at least one store")
        for evidence in producer.get("evidence", []):
            check(path_without_fragment(evidence).is_file(), f"{label} evidence path absent: {evidence}")

    for reader in readers:
        label = f"reader {reader.get('id')}"
        check(set(reader.get("reads_store_ids", [])) <= store_ids, f"{label} references unknown stores")
        check(reader.get("reads_store_ids"), f"{label} must read at least one store")
        for evidence in reader.get("evidence", []):
            check(path_without_fragment(evidence).is_file(), f"{label} evidence path absent: {evidence}")

    actual_json_schemas = {
        path.relative_to(REPO_ROOT).as_posix()
        for path in (REPO_ROOT / "frameworks").rglob("*.schema.json")
        if path.parent != REPO_ROOT / "frameworks/memory"
    }
    catalogued_json_schemas = {item["path"] for item in schemas if item["path"].endswith(".schema.json")}
    check(
        actual_json_schemas == catalogued_json_schemas,
        "catalogue JSON-schema paths must match every pre-memory frameworks/**/*.schema.json",
    )
    for schema in schemas:
        label = f"schema {schema.get('id')}"
        check(path_without_fragment(schema["path"]).is_file(), f"{label} path absent: {schema['path']}")
        check(isinstance(schema.get("governs"), list) and schema["governs"], f"{label} governs list")
        check(isinstance(schema.get("consumers"), list) and schema["consumers"], f"{label} consumers list")

    # Counts are frozen Phase 0 observations, not mutable-current-state cardinality
    # invariants. Stores may grow after the snapshot, but a silent aggregate shrink
    # still fails closed. Current path coverage is checked separately below.
    for error in catalogue_count_errors(stores):
        check(False, error)

    mounted_null = copy.deepcopy(stores)
    next(store for store in mounted_null if store["id"] not in UNMOUNTED_COUNT_IDS)[
        "observed_count"
    ] = None
    check(
        any("mounted and observed_count" in error for error in catalogue_count_errors(mounted_null)),
        "a mounted store cannot disable count preservation with null",
    )
    unmounted_integer = copy.deepcopy(stores)
    next(store for store in unmounted_integer if store["id"] in UNMOUNTED_COUNT_IDS)[
        "observed_count"
    ] = 0
    check(
        any("unmounted and observed_count" in error for error in catalogue_count_errors(unmounted_integer)),
        "an unmounted store must retain an explicit null observation",
    )
    malformed_paths = (
        (None, "null"),
        ("analyses/*/*.md", "string"),
        ([], "empty list"),
        ([""], "empty string member"),
        (["analyses/*/*.md", None], "non-string member"),
    )
    for value, label in malformed_paths:
        malformed = copy.deepcopy(stores)
        malformed[0]["paths"] = value
        check(
            any("paths must be" in error for error in catalogue_count_errors(malformed)),
            f"catalogue paths {label} must produce a validation error",
        )
    count_boundary = copy.deepcopy(stores)
    boundary_store = next(
        store for store in count_boundary if store["id"] not in UNMOUNTED_COUNT_IDS
    )
    current_count = len(expand_store_paths(boundary_store["paths"]))
    boundary_store["observed_count"] = current_count
    check(
        not any(
            f"store {boundary_store['id']}" in error
            for error in catalogue_count_errors(count_boundary)
        ),
        "a mounted store at its observed lower bound must pass",
    )
    boundary_store["observed_count"] = current_count + 1
    check(
        any(
            f"store {boundary_store['id']} shrank" in error
            for error in catalogue_count_errors(count_boundary)
        ),
        "a mounted store below its observed lower bound must fail",
    )

    # Every current research/screener/commodity/watchlist data artifact is assigned
    # to at least one declared store path.  Hidden sentinels are separately captured
    # where they are semantically material (the archive retention sentinel).
    all_patterns = [
        pattern
        for store in stores
        if memory_baseline.is_nonempty_string_list(store.get("paths"))
        for pattern in store["paths"]
        if not pattern.startswith("data/")
    ]
    uncovered: list[str] = []
    for root_name in ("analyses", "commodity", "screener", "watchlist"):
        for path in (REPO_ROOT / root_name).rglob("*"):
            if not path.is_file() or path.name in {".gitkeep"}:
                continue
            relative = path.relative_to(REPO_ROOT).as_posix()
            if not any(fnmatch.fnmatchcase(relative, pattern) for pattern in all_patterns):
                uncovered.append(relative)
    check(not uncovered, f"current artifacts absent from store catalogue: {uncovered[:10]}")


def check_decisions(record: dict[str, Any]) -> None:
    check(record.get("decision_record_version") == "memory-phase0-decisions/v1", "decision record version")
    decisions = record.get("decisions", [])
    check(isinstance(decisions, list), "decisions must be a list")
    if not isinstance(decisions, list):
        return
    check_unique_ids(decisions, "decision")
    by_id = {decision["id"]: decision for decision in decisions}
    check(set(by_id) == {f"MEM-ADR-{number:03d}" for number in range(1, 5)}, "exactly four Phase 0 ADRs")
    check(all(decision.get("status") == "accepted" for decision in decisions), "all ADRs must be accepted")

    identity = by_id.get("MEM-ADR-001", {})
    identity_namespaces = {item.get("name"): item for item in identity.get("namespaces", [])}
    check(set(identity_namespaces) == set(memory_contract.NAMESPACE_RULES), "identity ADR built-in namespaces")
    for name, rule in memory_contract.NAMESPACE_RULES.items():
        check(
            identity_namespaces.get(name, {}).get("entity_kind") == rule["entity_kind"],
            f"identity ADR entity kind for {name}",
        )
        check(
            identity_namespaces.get(name, {}).get("authority") == rule["authority"],
            f"identity ADR authority for {name}",
        )
    check("aliases are never identity" in identity.get("title", "").casefold(), "identity ADR rejects aliases")
    record_ids = identity.get("record_identifiers", {})
    check(record_ids.get("event_id", "").startswith("evt_"), "event IDs use evt_ prefix")
    check(record_ids.get("run_id", "").startswith("run_"), "run IDs use run_ prefix")
    check(record_ids.get("forecast_id", "").startswith("forecast_"), "forecast IDs use forecast_ prefix")
    check(record_ids.get("claim_id", "").startswith("claim_"), "claim IDs use claim_ prefix")

    bitemporal = by_id.get("MEM-ADR-002", {})
    clocks = bitemporal.get("clocks", {})
    check(set(clocks) == {"valid_time", "system_time", "source_dates"}, "bitemporal ADR clock separation")
    check(clocks.get("valid_time", {}).get("fields") == ["from", "to"], "valid-time fields")
    check(
        clocks.get("system_time", {}).get("fields") == ["system_time"],
        "system-time fields",
    )
    bitemporal_rules = " ".join(bitemporal.get("rules", [])).casefold()
    check("both constraints" in bitemporal_rules, "point-in-time queries must apply both clocks")
    check("backdating system_time is forbidden" in bitemporal_rules, "late evidence cannot be backdated")
    check("overlap" in bitemporal_rules, "date-precision valid-time queries use day overlap")

    policy = by_id.get("MEM-ADR-003", {})
    access_ids = {item.get("id") for item in policy.get("access_classes", [])}
    retention_ids = {item.get("id") for item in policy.get("retention_classes", [])}
    check(access_ids == set(memory_contract.CLASSIFICATIONS), "access classes must match event contract")
    check(
        retention_ids == set(memory_contract.RETENTIONS),
        "retention classes must match event contract",
    )
    policy_rules = " ".join(policy.get("rules", [])).casefold()
    check("before retrieval" in policy_rules, "authorization must be applied before retrieval")
    check("most restrictive" in policy.get("decision", "").casefold(), "derivatives inherit restrictions")
    check("immutable git event lane" in policy_rules, "protected content must stay out of Git history")

    serialized_decisions = json.dumps(record, sort_keys=True)
    for stale_name in (
        "recorded_at",
        "superseded_at",
        "valid_from",
        "valid_to",
        "permanent_audit",
        "source_contract",
        "rebuildable_projection",
        "ephemeral_trace",
    ):
        check(stale_name not in serialized_decisions, f"ADR retains stale contract name {stale_name!r}")

    correction = by_id.get("MEM-ADR-004", {})
    correction_text = " ".join([correction.get("decision", ""), *correction.get("rules", [])]).casefold()
    for phrase in ("never edited in place", "acyclic", "deterministic", "never rewrites"):
        check(phrase in correction_text, f"correction ADR must specify {phrase!r}")
    check(correction.get("resolution_order"), "correction ADR must define resolution order")


def check_adapter_baseline(record: dict[str, Any]) -> None:
    check(record.get("schema") == "memory-adapter-baseline/v1", "adapter baseline schema")
    source_minimum = record.get("minimum_discovered_source_count")
    event_minimum = record.get("minimum_adapted_event_count")
    check(isinstance(source_minimum, int) and source_minimum > 0, "adapter source minimum")
    check(isinstance(event_minimum, int) and event_minimum > 0, "adapter event minimum")
    if isinstance(source_minimum, int):
        check(
            len(discover_legacy_sources(REPO_ROOT)) >= source_minimum,
            "current supported source corpus must not fall below the reviewed baseline",
        )
    check("decrease" in record.get("change_rule", "").casefold(), "baseline decrease review rule")


def check_frozen_corpus(benchmark: dict[str, Any]) -> memory_baseline.CorpusManifest | None:
    """The ranked corpus must be pinned, committed, and immune to later publishes.

    Every search root sits in a lane the engine publishes to continuously and without CI
    (CLAUDE.md §25).  Ranking the folders as they stand made an ordinary research commit
    able to move a score and turn `main` red, which blocked every open PR (issue #477).
    """

    manifest_path = PHASE0 / "corpus-manifest.json"
    try:
        manifest = memory_baseline.load_corpus_manifest(manifest_path)
    except memory_baseline.FixtureError as exc:
        check(False, f"corpus-manifest.json must be a valid frozen manifest: {exc}")
        return None
    try:
        memory_baseline.validate_corpus_manifest(benchmark, manifest)
    except memory_baseline.FixtureError as exc:
        check(False, f"frozen corpus must cover every benchmark anchor: {exc}")
        return None

    try:
        text = manifest_path.read_text(encoding="utf-8")
        canonical = json.dumps(json.loads(text), indent=2, sort_keys=True, ensure_ascii=False) + "\n"
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        check(False, f"corpus-manifest.json must be readable JSON: {exc}")
        return None
    check(text == canonical, "corpus-manifest.json must use deterministic canonical formatting")

    committed = memory_baseline._committed_blob_ids(manifest.blobs.values())
    missing = sorted(path for path, blob in manifest.blobs.items() if blob not in committed)
    check(
        not missing,
        f"every pinned corpus blob must be readable from Git history; missing: {missing[:3]}",
    )

    return manifest


def check_publish_does_not_move_scores(benchmark: dict[str, Any], rendered: str) -> None:
    """The regression the manifest exists for (issue #477).

    A research publish into a pinned run folder must not enter the corpus, so it cannot
    move a score, so it cannot turn `main` red and block every open PR.
    """

    probe = REPO_ROOT / "analyses/NHY_2026-07-19/.phase0-corpus-probe.md"
    if probe.exists():
        check(False, "corpus probe path must be free before the test writes it")
        return
    try:
        probe.write_text(
            "# NHY decision review\n\nNHY entry price, edge score, forecast result.\n",
            encoding="utf-8",
        )
        after = memory_baseline.render_report(memory_baseline.build_report(benchmark))
    finally:
        probe.unlink(missing_ok=True)
    check(
        rendered == after,
        "a file published into a pinned run folder must not change the scored baseline",
    )
    check(not probe.exists(), "corpus probe file must be removed again")


def check_benchmark_and_report(benchmark: dict[str, Any]) -> None:
    manifest = check_frozen_corpus(benchmark)
    try:
        memory_baseline.validate_benchmark(benchmark, manifest=manifest)
    except memory_baseline.FixtureError as exc:
        check(False, f"benchmark validation failed: {exc}")
        return

    cases = benchmark["cases"]
    counts = Counter(case["category"] for case in cases)
    check(len(cases) == 63, "held-out corpus must remain frozen at 63 cases")
    check(set(counts) == memory_baseline.REQUIRED_CATEGORIES, "benchmark category coverage")
    check(all(count == 7 for count in counts.values()), "benchmark must contain seven cases per category")
    check(
        set(inspect.signature(memory_baseline.rank_case).parameters)
        == {"question", "search_roots", "top_k", "corpus"},
        "rank_case must not accept answer keys or scoring fields",
    )

    # Alter every scoring-only field and prove retrieval remains identical.  This is
    # stronger than trusting the protocol prose: the ranker is called directly with
    # only the two allowed fixture inputs.
    original = cases[0]
    tampered = copy.deepcopy(original)
    tampered["answer_key"] = "deliberately wrong"
    tampered["evidence"] = [{"path": "not/a/ranking/input", "anchors": ["wrong"]}]
    ranking_manifest = manifest or memory_baseline.load_corpus_manifest()
    corpus_a = memory_baseline.Corpus(ranking_manifest)
    corpus_b = memory_baseline.Corpus(ranking_manifest)
    rank_a = memory_baseline.rank_case(
        question=original["question"],
        search_roots=original["search_roots"],
        top_k=benchmark["top_k"],
        corpus=corpus_a,
    )
    rank_b = memory_baseline.rank_case(
        question=tampered["question"],
        search_roots=tampered["search_roots"],
        top_k=benchmark["top_k"],
        corpus=corpus_b,
    )
    check(rank_a == rank_b, "scoring-only fixture changes must not influence ranking")

    report_a = memory_baseline.render_report(memory_baseline.build_report(benchmark))
    report_b = memory_baseline.render_report(memory_baseline.build_report(benchmark))
    check(report_a == report_b, "baseline output must be byte-deterministic across independent runs")
    if manifest is not None:
        check_publish_does_not_move_scores(benchmark, report_a)
        # An ad-hoc corpus reads whatever is on disk right now, so a report built over one
        # would be exactly the unfrozen baseline this whole mechanism exists to prevent.
        try:
            memory_baseline.build_report(
                benchmark, corpus=memory_baseline.Corpus.over_paths(["frameworks/memory/phase0"])
            )
            check(False, "build_report must refuse an ad-hoc (unpinned) corpus")
        except memory_baseline.FixtureError:
            pass

    report_path = PHASE0 / "baseline-report.json"
    try:
        committed = report_path.read_text(encoding="utf-8")
    except OSError as exc:
        check(False, f"baseline-report.json must exist: {exc}")
        return
    try:
        committed_report = json.loads(committed)
        report = json.loads(report_a)
    except json.JSONDecodeError as exc:
        check(False, f"committed and rendered baselines must be valid JSON: {exc}")
        return
    check(
        committed == memory_baseline.render_report(committed_report),
        "baseline-report.json must use deterministic canonical formatting",
    )
    check(
        memory_baseline.baseline_results_match(committed_report, report),
        "baseline-report.json scored results must match the deterministic runner",
    )
    if manifest is not None:
        check(
            committed_report.get("method", {}).get("corpus_manifest_sha256") == manifest.sha256,
            "baseline-report.json must record the frozen corpus manifest it was rendered against",
        )

    corpus_drift = copy.deepcopy(report)
    corpus_drift["corpus"] = {
        "sha256": "f" * 64,
        "total_bytes": report["corpus"]["total_bytes"] + 1,
        "unique_files_considered": report["corpus"]["unique_files_considered"] + 1,
    }
    check(
        memory_baseline.baseline_results_match(report, corpus_drift),
        "corpus growth alone must not invalidate a frozen scored baseline",
    )
    scored_drifts: list[tuple[str, dict[str, Any]]] = []
    case_drift = copy.deepcopy(report)
    case_drift["cases"][0]["reciprocal_rank"] += 0.000001
    scored_drifts.append(("case row", case_drift))
    policy_drift = copy.deepcopy(report)
    next(
        case for case in policy_drift["cases"] if case["category"] == "access_control"
    )["protected_hits"].append("licensed/leak.txt")
    scored_drifts.append(("policy case", policy_drift))
    category_drift = copy.deepcopy(report)
    category_drift["category_metrics"]["fact_recall"]["mean_reciprocal_rank"] += 0.000001
    scored_drifts.append(("category metric", category_drift))
    metric_drift = copy.deepcopy(report)
    metric_drift["metrics"]["mean_reciprocal_rank"] += 0.000001
    scored_drifts.append(("global metric", metric_drift))
    method_drift = copy.deepcopy(report)
    method_drift["method"]["tie_breaker"] = "changed"
    scored_drifts.append(("method", method_drift))
    benchmark_drift = copy.deepcopy(report)
    benchmark_drift["benchmark"]["top_k"] += 1
    scored_drifts.append(("benchmark", benchmark_drift))
    limitation_drift = copy.deepcopy(report)
    limitation_drift["limitations"].append("changed")
    scored_drifts.append(("limitation", limitation_drift))
    unknown_drift = copy.deepcopy(report)
    unknown_drift["unexpected"] = True
    scored_drifts.append(("unknown top-level field", unknown_drift))
    for label, scored_drift in scored_drifts:
        check(
            not memory_baseline.baseline_results_match(report, scored_drift),
            f"{label} drift must invalidate the baseline",
        )
    malformed_snapshot = copy.deepcopy(report)
    malformed_snapshot["corpus"].pop("sha256")
    check(
        not memory_baseline.baseline_results_match(malformed_snapshot, report),
        "malformed frozen corpus metadata must fail closed",
    )
    extra_corpus_key = copy.deepcopy(report)
    extra_corpus_key["corpus"]["ignored"] = True
    check(
        not memory_baseline.baseline_results_match(report, extra_corpus_key),
        "unknown corpus metadata must fail closed rather than expand the ignore boundary",
    )

    metrics = report["metrics"]
    check(report["benchmark"]["case_count"] == 63, "report case count")
    check(len(report["cases"]) == 63, "report must retain one scoring row per case")
    check(metrics["complete_evidence_recall_at_k"] < 1.0, "baseline must expose current retrieval misses")
    check(metrics["temporal_leakage_case_rate"] > 0.0, "baseline must expose current temporal leakage")
    check(metrics["protected_path_intrusions"] == 0, "policy-only access scopes must not retrieve protected paths")
    rendered_casefold = report_a.casefold()
    for forbidden_metadata in ("generated_at", "elapsed", "duration_ms", "wall_clock"):
        check(forbidden_metadata not in rendered_casefold, f"report must omit nondeterministic {forbidden_metadata}")


def check_ci_clean_checkout_order() -> None:
    """Keep the frozen corpus checks ahead of CI steps that write reports."""

    workflow_path = REPO_ROOT / ".github/workflows/ci.yml"
    try:
        workflow = workflow_path.read_text(encoding="utf-8")
    except OSError as exc:
        check(False, f"CI workflow must be readable: {exc}")
        return
    memory_step = "- name: Permanent-memory contracts, adapters, projection, baseline, and append-only guards"
    eval_step = "- name: Run eval harness (all committed runs + J framework-contract checks)"
    check(workflow.count(memory_step) == 1, "CI must run exactly one permanent-memory gate")
    check(workflow.count(eval_step) == 1, "CI must run exactly one report-writing eval harness")
    if memory_step in workflow and eval_step in workflow:
        check(
            workflow.index(memory_step) < workflow.index(eval_step),
            "CI permanent-memory gate must run before eval.py writes an untracked report",
        )


def main() -> int:
    catalogue = load("catalogue.json")
    decisions = load("decisions.json")
    benchmark = load("benchmark.json")
    adapter_baseline = load("adapter-baseline.json")

    if catalogue:
        check_catalogue(catalogue)
    if decisions:
        check_decisions(decisions)
    if benchmark:
        check_benchmark_and_report(benchmark)
    if adapter_baseline:
        check_adapter_baseline(adapter_baseline)
    check_ci_clean_checkout_order()

    if failures:
        print(f"\n{len(failures)} Phase 0 failure(s)")
        return 1
    print("\nAll permanent-memory Phase 0 tests passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
