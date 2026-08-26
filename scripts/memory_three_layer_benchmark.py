#!/usr/bin/env python3
"""Score runtime-produced results against the hidden fields of the 40-case memory benchmark."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Mapping, Sequence

try:
    from canonical_json import canonical_sha256
    from memory_runtime import _atomic_private_write, _safe_regular
except ImportError:  # pragma: no cover
    from scripts.canonical_json import canonical_sha256
    from scripts.memory_runtime import _atomic_private_write, _safe_regular


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BENCHMARK = ROOT / "frameworks/memory/three-layer-benchmark-v1.json"
RESULT_SCHEMA = "memory-three-layer-candidate-results/v1"
REPORT_SCHEMA = "memory-three-layer-benchmark-report/v1"
MODES = {"synthetic-ci", "runtime-held-out"}
CASE_FIELDS = {
    "id", "records", "action", "protected_content_leak", "temporal_leak",
    "qualifier_loss", "false_current_evidence", "executed_non_applicable_procedure",
}


class ThreeLayerBenchmarkError(ValueError):
    """Benchmark input or candidate output violates the held-out contract."""


def _object(path: str | Path) -> dict[str, Any]:
    try:
        value = json.loads(_safe_regular(Path(path), owner_only=False))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ThreeLayerBenchmarkError("benchmark input is unreadable") from exc
    if not isinstance(value, dict):
        raise ThreeLayerBenchmarkError("benchmark input must be an object")
    return value


def _rate(numerator: float, denominator: int) -> float:
    return round(numerator / denominator, 6) if denominator else 0.0


def _candidate_rows(value: Mapping[str, Any], ids: set[str]) -> tuple[str, dict[str, dict[str, Any]]]:
    if set(value) != {"schema", "benchmark_sha256", "evaluation_mode", "cases"} or value.get("schema") != RESULT_SCHEMA:
        raise ThreeLayerBenchmarkError("candidate results have an invalid closed shape")
    mode = value.get("evaluation_mode")
    if mode not in MODES:
        raise ThreeLayerBenchmarkError("candidate evaluation mode is invalid")
    rows = value.get("cases")
    if not isinstance(rows, list) or len(rows) != 40:
        raise ThreeLayerBenchmarkError("candidate results must contain exactly 40 cases")
    indexed: dict[str, dict[str, Any]] = {}
    for position, row in enumerate(rows):
        if not isinstance(row, dict) or set(row) != CASE_FIELDS:
            raise ThreeLayerBenchmarkError(f"candidate case {position} has an invalid closed shape")
        case_id = row.get("id")
        records = row.get("records")
        action = row.get("action")
        if (
            not isinstance(case_id, str) or case_id in indexed
            or not isinstance(records, list) or len(records) > 128
            or any(not isinstance(item, str) or not item or len(item) > 256 for item in records)
            or len(records) != len(set(records))
            or not isinstance(action, str) or not action or len(action) > 128
            or any(type(row[field]) is not bool for field in CASE_FIELDS - {"id", "records", "action"})
        ):
            raise ThreeLayerBenchmarkError(f"candidate case {position} is invalid")
        indexed[case_id] = row
    if set(indexed) != ids:
        raise ThreeLayerBenchmarkError("candidate results do not cover the exact held-out case IDs")
    return str(mode), indexed


def score_results(
    benchmark: Mapping[str, Any], candidate: Mapping[str, Any], *, benchmark_bytes: bytes,
) -> dict[str, Any]:
    if benchmark.get("schema") != "memory-three-layer-benchmark/v1" or benchmark.get("case_count") != 40:
        raise ThreeLayerBenchmarkError("three-layer benchmark contract is invalid")
    cases = benchmark.get("cases")
    categories = benchmark.get("required_categories")
    if not isinstance(cases, list) or len(cases) != 40 or not isinstance(categories, list) or len(categories) != 8:
        raise ThreeLayerBenchmarkError("three-layer benchmark shape is invalid")
    ids = {row.get("id") for row in cases if isinstance(row, Mapping)}
    if len(ids) != 40 or any(not isinstance(item, str) for item in ids):
        raise ThreeLayerBenchmarkError("three-layer benchmark IDs are invalid")
    benchmark_sha = "sha256:" + canonical_sha256(json.loads(benchmark_bytes))
    if candidate.get("benchmark_sha256") != benchmark_sha:
        raise ThreeLayerBenchmarkError("candidate results do not bind the exact benchmark bytes")

    # Only after candidate outputs are closed, complete, and indexed do scoring-only fields enter.
    mode, indexed = _candidate_rows(candidate, ids)  # type: ignore[arg-type]
    evaluated: list[dict[str, Any]] = []
    for case in cases:
        row = indexed[case["id"]]
        expected = set(case["expected_records"])
        returned = set(row["records"])
        forbidden = sorted(returned.intersection(case["forbidden_records"]))
        recall = _rate(len(expected.intersection(returned)), len(expected)) if expected else 1.0
        action_correct = row["action"] == case["expected_action"]
        serious = bool(
            row["protected_content_leak"] or row["temporal_leak"] or row["qualifier_loss"]
            or row["false_current_evidence"] or row["executed_non_applicable_procedure"]
        )
        passed = recall == 1.0 and action_correct and not forbidden and not serious
        evaluated.append({
            "id": case["id"], "category": case["category"], "record_recall": recall,
            "action_correct": action_correct, "forbidden_hit_count": len(forbidden),
            "serious_failure": serious, "passed": passed,
        })
    category_metrics = []
    for category in categories:
        rows = [row for row in evaluated if row["category"] == category]
        if len(rows) != 5:
            raise ThreeLayerBenchmarkError("each required benchmark category must contain five cases")
        category_metrics.append({
            "category": category, "case_count": len(rows),
            "pass_rate": _rate(sum(row["passed"] for row in rows), len(rows)),
        })
    blockers = [row["id"] for row in evaluated if not row["passed"]]
    body: dict[str, Any] = {
        "schema": REPORT_SCHEMA, "benchmark_sha256": benchmark_sha, "evaluation_mode": mode,
        "case_count": len(evaluated), "cases": evaluated, "category_metrics": category_metrics,
        "aggregate": {
            "pass_rate": _rate(sum(row["passed"] for row in evaluated), len(evaluated)),
            "record_recall": _rate(sum(row["record_recall"] for row in evaluated), len(evaluated)),
            "action_accuracy": _rate(sum(row["action_correct"] for row in evaluated), len(evaluated)),
            "forbidden_hit_count": sum(row["forbidden_hit_count"] for row in evaluated),
            "serious_failure_count": sum(row["serious_failure"] for row in evaluated),
        },
        "gate": {
            "passed": not blockers, "counts_as_production_evidence": mode == "runtime-held-out",
            "blocking_case_ids": blockers,
        },
    }
    body["report_sha256"] = "sha256:" + canonical_sha256(body)
    return body


def score_files(benchmark_path: str | Path, candidate_path: str | Path) -> dict[str, Any]:
    benchmark_bytes = _safe_regular(Path(benchmark_path), owner_only=False)
    try:
        benchmark = json.loads(benchmark_bytes)
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise ThreeLayerBenchmarkError("benchmark is invalid JSON") from exc
    if not isinstance(benchmark, dict):
        raise ThreeLayerBenchmarkError("benchmark must be an object")
    return score_results(benchmark, _object(candidate_path), benchmark_bytes=benchmark_bytes)


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="memory-three-layer-benchmark", description=__doc__)
    parser.add_argument("--benchmark", default=str(DEFAULT_BENCHMARK))
    parser.add_argument("--candidate", required=True)
    parser.add_argument("--output")
    args = parser.parse_args(argv)
    try:
        report = score_files(args.benchmark, args.candidate)
    except (ThreeLayerBenchmarkError, OSError, ValueError) as exc:
        print(json.dumps({"schema": "memory-three-layer-benchmark-result/v1", "ok": False, "code": str(exc)}, sort_keys=True))
        return 4
    if args.output:
        _atomic_private_write(Path(args.output), report)
        sys.stdout.write(json.dumps({
            "schema": "memory-three-layer-benchmark-result/v1", "ok": True,
            "path": str(Path(args.output)),
        }, sort_keys=True, separators=(",", ":")) + "\n")
    else:
        sys.stdout.write(json.dumps(report, sort_keys=True, separators=(",", ":")) + "\n")
    return 0 if report["gate"]["passed"] else 2


if __name__ == "__main__":
    raise SystemExit(main())


__all__ = ["ThreeLayerBenchmarkError", "score_files", "score_results"]
