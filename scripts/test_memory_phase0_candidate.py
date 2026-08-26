#!/usr/bin/env python3
from __future__ import annotations

import json
import unittest
from pathlib import Path

from memory_operations import build_operational_readiness_report
from memory_phase0_candidate import build_candidate_report, rank_candidate


ROOT = Path(__file__).resolve().parents[1]


class Phase0CandidateTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.baseline = json.loads(
            (ROOT / "frameworks/memory/phase0/baseline-report.json").read_text(encoding="utf-8")
        )
        cls.candidate = build_candidate_report()

    def test_exact_frozen_corpus_nonregresses_improves_and_has_zero_serious_leakage(self) -> None:
        baseline_metrics = self.baseline["metrics"]
        candidate_metrics = self.candidate["metrics"]
        self.assertEqual(self.baseline["benchmark"], self.candidate["benchmark"])
        self.assertEqual(self.baseline["corpus"], self.candidate["corpus"])
        for name in (
            "complete_evidence_recall_at_k", "evidence_path_recall_at_k", "mean_reciprocal_rank",
        ):
            self.assertGreaterEqual(candidate_metrics[name], baseline_metrics[name])
        self.assertTrue(any(
            candidate_metrics[name] > baseline_metrics[name]
            for name in ("complete_evidence_recall_at_k", "evidence_path_recall_at_k", "mean_reciprocal_rank")
        ))
        self.assertEqual(0, candidate_metrics["protected_path_intrusions"])
        self.assertEqual(0, candidate_metrics["temporal_forbidden_path_hits"])
        self.assertEqual(0, candidate_metrics["temporal_leakage_case_rate"])

    def test_phase6_accepts_the_candidate_as_production_benchmark_evidence(self) -> None:
        report = build_operational_readiness_report(
            evaluated_at="2026-08-26T00:00:00.000000Z",
            phase0_baseline_report=self.baseline,
            phase0_candidate_report=self.candidate,
        )
        production = report["adoption"]["production_benchmark"]
        self.assertEqual("met", production["status"])
        self.assertEqual(
            "non-regressed-with-strict-improvement-and-zero-serious-leakage",
            production["comparison"],
        )

    def test_ranker_interface_has_no_scoring_field_channel(self) -> None:
        with self.assertRaises(TypeError):
            rank_candidate(
                question="test", search_roots=[], top_k=5, corpus=None,  # type: ignore[arg-type]
                expected_records=["forbidden-answer-key"],  # type: ignore[call-arg]
            )


if __name__ == "__main__":
    unittest.main()
