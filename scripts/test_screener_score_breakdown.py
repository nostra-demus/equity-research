#!/usr/bin/env python3
"""Unit tests for scripts/screener_score_breakdown.py — the deterministic Phase 0.1 materiality
score breakdown (CLAUDE.md §12: every score must be explainable from evidence rows, not vibes).

Run: python3 scripts/test_screener_score_breakdown.py
"""
from __future__ import annotations

import copy
import unittest

from screener_score_breakdown import (
    build_score_breakdown,
    classify_source_tier,
    score_source_quality,
)


def base_fixture(**overrides) -> dict:
    fx = {
        "relevance_label": "material",
        "event_types": [],
        "issuer_linkage": "primary_issuer",
        "pair_label": "new_event",
        "confirmation_upgrade": False,
        "relevance_confidence": 0.90,
        "source_name": "Reuters",
        "source_grade": "A",
        "is_official_filing": False,
        "paywalled": False,
        "corroborated": True,
        "is_routine_filing": False,
        "routine_severity": "none",
        "media_genericness": "none",
        "sensational_uncorroborated": False,
        "issuer_public_status": "public",
        "private_linkage_tags": [],
        "portfolio_position": False,
        "sector_wide_move": False,
        "live_theme_match": False,
        "commodity_rate_transmission": False,
        "specificity_signals": {
            "hard_number_cited": False, "corroborating_second_number": False,
            "named_counterparty_or_instrument": False, "effective_date_stated": False,
        },
        "estimate_impact_signals": {
            "moves_consensus_estimate": False, "traceable_to_valuation_driver": False,
            "material_relative_to_size": False,
        },
    }
    fx.update(overrides)
    return fx


class ScoreBreakdownScenarios(unittest.TestCase):
    """The six "score-breakdown" scenarios from the implementation plan."""

    def test_1_routine_filing_shows_high_routine_penalty(self):
        fx = base_fixture(
            relevance_label="relevant_non_material", event_types=["regulatory"],
            relevance_confidence=0.85,
            source_name="SEC EDGAR", is_official_filing=True, corroborated=True,
            is_routine_filing=True, routine_severity="moderate",
            specificity_signals={
                "hard_number_cited": True, "corroborating_second_number": False,
                "named_counterparty_or_instrument": False, "effective_date_stated": True,
            },
        )
        r = build_score_breakdown(fx)
        b = r["score_breakdown"]
        self.assertEqual(b["source_quality"]["value"], 20)
        self.assertEqual(b["event_materiality"]["value"], 9)
        self.assertEqual(b["company_relevance"]["value"], 16)
        self.assertEqual(b["specificity"]["value"], 8)
        self.assertEqual(b["estimate_impact"]["value"], 0)
        self.assertEqual(b["theme_macro"]["value"], 0)
        self.assertEqual(b["routine_filing_penalty"]["value"], -15)
        self.assertEqual(r["final_score"], 38)
        self.assertLess(r["final_score"], 40, "routine filing must route LOG")

    def test_2_profit_warning_high_materiality_and_valuation_impact(self):
        fx = base_fixture(
            event_types=["earnings_revenue_margin", "guidance_change"],
            relevance_confidence=0.95, portfolio_position=True,
            specificity_signals={
                "hard_number_cited": True, "corroborating_second_number": True,
                "named_counterparty_or_instrument": True, "effective_date_stated": True,
            },
            estimate_impact_signals={
                "moves_consensus_estimate": True, "traceable_to_valuation_driver": True,
                "material_relative_to_size": True,
            },
        )
        r = build_score_breakdown(fx)
        b = r["score_breakdown"]
        self.assertEqual(b["event_materiality"]["value"], 20)
        self.assertEqual(b["estimate_impact"]["value"], 15)
        self.assertEqual(r["final_score"], 90)
        self.assertGreaterEqual(r["final_score"], 70, "profit warning must clear PROMOTE")

    def test_3_reuters_headline_paywalled_body_still_scores_source_quality(self):
        fx = base_fixture(
            event_types=["mna"], relevance_confidence=0.80, portfolio_position=True,
            paywalled=True, corroborated=False,
            specificity_signals={
                "hard_number_cited": True, "corroborating_second_number": True,
                "named_counterparty_or_instrument": True, "effective_date_stated": True,
            },
            estimate_impact_signals={
                "moves_consensus_estimate": True, "traceable_to_valuation_driver": True,
                "material_relative_to_size": True,
            },
        )
        r = build_score_breakdown(fx)
        b = r["score_breakdown"]
        self.assertEqual(r["source_tier"], 1)
        self.assertEqual(b["source_quality"]["value"], 15, "paywalled Tier-1 still scores well, not zero")
        self.assertGreater(b["source_quality"]["value"], 0)
        # body-dependent components get hard-capped pending corroboration
        self.assertEqual(b["specificity"]["value"], 6)
        self.assertEqual(b["estimate_impact"]["value"], 6)
        self.assertEqual(r["final_score"], 67)

    def test_4_generic_media_roundup_shows_high_generic_media_penalty(self):
        fx = base_fixture(
            relevance_label="relevant_non_material", event_types=["macro_sector"],
            issuer_linkage="sector_only", pair_label="related_topic",
            relevance_confidence=0.55,
            source_name="Investing.com", source_grade="B",
            corroborated=False, media_genericness="content_farm",
            sector_wide_move=True,
        )
        r = build_score_breakdown(fx)
        b = r["score_breakdown"]
        self.assertEqual(b["generic_media_penalty"]["value"], -15)
        self.assertEqual(r["final_score"], 3)
        self.assertLess(r["final_score"], 40)

    def test_5_private_company_unrelated_to_public_coverage_is_low(self):
        fx = base_fixture(
            relevance_label="relevant_non_material", event_types=["operations"],
            relevance_confidence=0.82,
            source_name="Business Standard", corroborated=False,
            issuer_public_status="private_unlisted", private_linkage_tags=[],
            specificity_signals={
                "hard_number_cited": True, "corroborating_second_number": False,
                "named_counterparty_or_instrument": False, "effective_date_stated": False,
            },
        )
        r = build_score_breakdown(fx)
        b = r["score_breakdown"]
        self.assertEqual(b["company_relevance"]["value"], 0)
        self.assertEqual(b["private_unlisted_irrelevance_penalty"]["value"], -15)
        self.assertEqual(r["final_score"], 10)
        self.assertLess(r["final_score"], 40)

    def test_6_private_company_linked_to_public_portfolio_company_not_blindly_zeroed(self):
        fx = base_fixture(
            relevance_label="relevant_non_material", event_types=["operations", "commercial"],
            relevance_confidence=0.82,
            source_name="Business Standard", corroborated=False,
            issuer_public_status="private_unlisted",
            private_linkage_tags=["supplier_or_customer_of_public_company"],
            portfolio_position=True,
            specificity_signals={
                "hard_number_cited": True, "corroborating_second_number": False,
                "named_counterparty_or_instrument": False, "effective_date_stated": False,
            },
        )
        r = build_score_breakdown(fx)
        b = r["score_breakdown"]
        self.assertEqual(b["company_relevance"]["value"], 18)
        self.assertEqual(b["private_unlisted_irrelevance_penalty"]["value"], 0)
        self.assertEqual(r["final_score"], 46)
        self.assertGreater(r["final_score"], 10, "must score well above the no-linkage case, not be zeroed")


class SourceQualityScenarios(unittest.TestCase):
    """The four "source-quality" scenarios from the implementation plan."""

    def test_1_reuters_outranks_unknown_blog(self):
        reuters_tier, _ = classify_source_tier("Reuters", "A", False)
        blog_tier, _ = classify_source_tier("RandomFinanceBlog123", "B", False)
        self.assertEqual(reuters_tier, 1)
        self.assertEqual(blog_tier, 4)
        reuters_value, _ = score_source_quality(reuters_tier, False, True)
        blog_value, _ = score_source_quality(blog_tier, False, False)
        self.assertEqual(reuters_value, 20)
        self.assertEqual(blog_value, 2)
        self.assertGreater(reuters_value, blog_value)

    def test_2_exchange_filing_high_source_quality_but_routine_keeps_final_score_low(self):
        fx = base_fixture(
            relevance_label="relevant_non_material", event_types=["regulatory"],
            relevance_confidence=0.85,
            source_name="SEC EDGAR", is_official_filing=True, corroborated=True,
            is_routine_filing=True, routine_severity="moderate",
            specificity_signals={
                "hard_number_cited": True, "corroborating_second_number": False,
                "named_counterparty_or_instrument": False, "effective_date_stated": True,
            },
        )
        r = build_score_breakdown(fx)
        self.assertEqual(r["source_quality_score"], 20, "source quality is maxed for an official filing")
        self.assertEqual(r["final_score"], 38)
        self.assertLess(r["final_score"], 40, "routine filing still routes LOG despite max source quality")

    def test_3_simply_wall_st_gets_moderate_credibility(self):
        tier, _ = classify_source_tier("Simply Wall St", "B", False)
        self.assertEqual(tier, 2)
        value, _ = score_source_quality(tier, False, True)
        self.assertEqual(value, 13)
        self.assertLess(value, 20, "below Tier 1")
        self.assertGreater(value, 6, "above Tier 3")

    def test_4_unknown_source_sensational_claim_not_high_without_confirmation(self):
        fx = base_fixture(
            event_types=["mna"], relevance_confidence=0.45,
            source_name="RandomBlogXYZ", source_grade="B",
            corroborated=False, sensational_uncorroborated=True,
            portfolio_position=True,
            specificity_signals={
                "hard_number_cited": True, "corroborating_second_number": True,
                "named_counterparty_or_instrument": True, "effective_date_stated": True,
            },
            estimate_impact_signals={
                "moves_consensus_estimate": True, "traceable_to_valuation_driver": True,
                "material_relative_to_size": True,
            },
        )
        r = build_score_breakdown(fx)
        b = r["score_breakdown"]
        self.assertEqual(r["source_tier"], 4)
        self.assertEqual(b["source_quality"]["value"], 2)
        # specificity/estimate are capped pending corroboration, even though not paywalled
        self.assertEqual(b["specificity"]["value"], 6)
        self.assertEqual(b["estimate_impact"]["value"], 6)
        self.assertEqual(r["final_score"], 44)
        self.assertLess(r["final_score"], 70, "must not reach PROMOTE without confirmation")


class BackwardCompatibilityAndClamping(unittest.TestCase):
    def test_final_score_never_negative_or_above_100(self):
        fx = base_fixture(
            relevance_label="irrelevant", pair_label="duplicate",
            relevance_confidence=0.10, media_genericness="content_farm",
            is_routine_filing=True, routine_severity="total",
            issuer_public_status="private_unlisted", private_linkage_tags=[],
            source_name="RandomBlogXYZ", source_grade="B",
        )
        r = build_score_breakdown(fx)
        self.assertGreaterEqual(r["final_score"], 0)
        self.assertLessEqual(r["final_score"], 100)

    def test_breakdown_does_not_mutate_input(self):
        fx = base_fixture()
        fx_copy = copy.deepcopy(fx)
        build_score_breakdown(fx)
        self.assertEqual(fx, fx_copy)


if __name__ == "__main__":
    unittest.main()
