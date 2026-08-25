#!/usr/bin/env python3
from __future__ import annotations

import copy
import json
import unittest
from pathlib import Path

from canonical_json import canonical_sha256
from memory_three_layer_benchmark import ThreeLayerBenchmarkError, score_results
from validate_screener_json import Checker


ROOT = Path(__file__).resolve().parents[1]
BENCHMARK_PATH = ROOT / "frameworks/memory/three-layer-benchmark-v1.json"
SCHEMA_PATH = ROOT / "frameworks/memory/three-layer-benchmark-report-v1.schema.json"


class ThreeLayerBenchmarkTests(unittest.TestCase):
    def setUp(self) -> None:
        self.raw = BENCHMARK_PATH.read_bytes()
        self.benchmark = json.loads(self.raw)
        self.candidate = {
            "schema": "memory-three-layer-candidate-results/v1",
            "benchmark_sha256": "sha256:" + canonical_sha256(self.benchmark),
            "evaluation_mode": "synthetic-ci",
            "cases": [{
                "id": row["id"], "records": row["expected_records"],
                "action": row["expected_action"], "protected_content_leak": False,
                "temporal_leak": False, "qualifier_loss": False,
                "false_current_evidence": False, "executed_non_applicable_procedure": False,
            } for row in self.benchmark["cases"]],
        }

    def test_all_40_cases_pass_but_synthetic_results_never_count_as_production(self) -> None:
        report = score_results(self.benchmark, self.candidate, benchmark_bytes=self.raw)
        self.assertEqual(40, report["case_count"])
        self.assertEqual(8, len(report["category_metrics"]))
        self.assertTrue(report["gate"]["passed"])
        self.assertFalse(report["gate"]["counts_as_production_evidence"])
        schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
        checker = Checker(schema)
        checker.check(schema, report, "")
        self.assertEqual([], checker.errors)

    def test_forbidden_record_or_serious_failure_blocks_the_exact_case(self) -> None:
        for mutation in ("forbidden", "serious"):
            candidate = copy.deepcopy(self.candidate)
            row = candidate["cases"][1]
            if mutation == "forbidden":
                row["records"].append("newer-decision-without-review")
            else:
                row["qualifier_loss"] = True
            report = score_results(self.benchmark, candidate, benchmark_bytes=self.raw)
            self.assertFalse(report["gate"]["passed"])
            self.assertEqual(["miss-002"], report["gate"]["blocking_case_ids"])

    def test_answer_key_fields_cannot_enter_candidate_results(self) -> None:
        candidate = copy.deepcopy(self.candidate)
        candidate["cases"][0]["expected_action"] = "leak"
        with self.assertRaisesRegex(ThreeLayerBenchmarkError, "closed shape"):
            score_results(self.benchmark, candidate, benchmark_bytes=self.raw)

    def test_runtime_mode_is_explicit_and_hash_bound(self) -> None:
        candidate = copy.deepcopy(self.candidate)
        candidate["evaluation_mode"] = "runtime-held-out"
        report = score_results(self.benchmark, candidate, benchmark_bytes=self.raw)
        self.assertTrue(report["gate"]["counts_as_production_evidence"])
        candidate["benchmark_sha256"] = "sha256:" + "0" * 64
        with self.assertRaisesRegex(ThreeLayerBenchmarkError, "exact benchmark"):
            score_results(self.benchmark, candidate, benchmark_bytes=self.raw)


if __name__ == "__main__":
    unittest.main()
