#!/usr/bin/env python3
"""Unit tests for scripts/screener_score_breakdown.py — the deterministic Phase 0.1 materiality
score breakdown (CLAUDE.md §12: every score must be explainable from evidence rows, not vibes).

Run: python3 scripts/test_screener_score_breakdown.py
"""
from __future__ import annotations

import copy
import importlib.util
import json
import os
import unittest

from screener_score_breakdown import (
    build_score_breakdown,
    classify_source_tier,
    penalty_generic_media,
    penalty_routine_filing,
    score_event_materiality,
    score_source_quality,
    REQUIRED_FIELDS,
)

_REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _load_validator():
    """Load the repo's dependency-free schema checker as a module (Thread C schema tests)."""
    path = os.path.join(_REPO, "scripts", "validate_screener_json.py")
    spec = importlib.util.spec_from_file_location("validate_screener_json", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _schema():
    with open(os.path.join(_REPO, "frameworks", "screener", "signal_payload.schema.json")) as f:
        return json.load(f)


def _minimal_valid_payload(**overrides) -> dict:
    p = {
        "signal_id": "SIG-20260610-a3f2c81d",
        "event_id": "EVT-abc123def456",
        "processed_at": "2026-06-10",
        "relevance_label": "material",
        "relevance_confidence": 0.9,
        "event_types": ["mna"],
        "issuer_linkage": "primary_issuer",
        "similarity_score": 0.1,
        "pair_label": "new_event",
        "fact_delta": 0.5,
        "confirmation_upgrade": False,
        "novelty_score": 0.8,
        "action": "keep_separate",
        "materiality_score": 75,
        "routing": "PROMOTE",
        "routing_reason": "test",
        "sources": [{"source_name": "Reuters", "retrieved_at": "2026-06-10", "claim_supported": "x"}],
    }
    p.update(overrides)
    return p


def _full_breakdown() -> dict:
    comp = lambda v, mx: {"value": v, "max_value": mx, "reason": "x"}
    return {
        "source_quality": comp(20, 20), "event_materiality": comp(14, 20),
        "company_relevance": comp(16, 20), "specificity": comp(0, 15),
        "estimate_impact": comp(0, 15), "theme_macro": comp(0, 10),
        "routine_filing_penalty": comp(0, -20), "generic_media_penalty": comp(0, -15),
        "private_unlisted_irrelevance_penalty": comp(0, -15),
        "duplicate_stale_penalty": comp(0, -25), "low_confidence_extraction_penalty": comp(0, -10),
    }


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
        "filing_type": "unknown_filing",
        "is_generic_media": False,
        "specificity_score": 0,
        "quantifiability_score": 0,
        "investability_score": 0,
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
            filing_type="procedural_exchange_filing",
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
            corroborated=False, is_generic_media=True,
            specificity_score=0, quantifiability_score=0, investability_score=0,
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
            filing_type="procedural_exchange_filing",
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
            relevance_confidence=0.10, is_generic_media=True,
            specificity_score=0, quantifiability_score=0, investability_score=0,
            filing_type="procedural_exchange_filing",
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


class IrrelevanceHardLogCap(unittest.TestCase):
    """Thread A — an `irrelevant` event (MODULE_RULES Step 1: fails the strict materiality test)
    must route to LOG (<40) no matter how well-sourced/specified it is. Before the fix, the
    source/company/specificity/estimate/theme components still summed, so an irrelevant Tier-1
    wire item reached PARK (66) — and with theme signals could reach PROMOTE (>=70)."""

    def test_irrelevant_wire_with_full_side_signals_is_capped_to_log(self):
        fx = base_fixture(
            relevance_label="irrelevant", event_types=[],
            source_name="Reuters", source_grade="A", corroborated=True,
            portfolio_position=True,
            specificity_signals={
                "hard_number_cited": True, "corroborating_second_number": False,
                "named_counterparty_or_instrument": True, "effective_date_stated": True,
            },
            estimate_impact_signals={
                "moves_consensus_estimate": True, "traceable_to_valuation_driver": True,
                "material_relative_to_size": True,
            },
        )
        r = build_score_breakdown(fx)
        # RED on old code: final_score == 66 (PARK). GREEN: capped into LOG (<40).
        self.assertLess(r["final_score"], 40)

    def test_irrelevant_cannot_reach_promote_even_with_theme_and_estimate(self):
        fx = base_fixture(
            relevance_label="irrelevant", event_types=[],
            source_name="Reuters", source_grade="A", corroborated=True,
            portfolio_position=True, sector_wide_move=True, live_theme_match=True,
            commodity_rate_transmission=True,
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
        # RED on old code: final_score == 76 (PROMOTE). GREEN: <40 (LOG).
        self.assertLess(r["final_score"], 40)


class UnmappedGradeADefaultsToTier2(unittest.TestCase):
    """Thread E — MODULE_RULES "Source-quality tiers" makes Tier 1 a CLOSED set (official
    filings/agencies + Reuters/Bloomberg/FT/WSJ-class wires). A respected-but-unmapped Grade-A
    publisher is Tier 2 ('respected business press'), not Tier 1. Before the fix, the Grade-A
    fallback awarded Tier 1 / 20 points."""

    def test_unmapped_grade_a_press_is_tier2_not_tier1(self):
        tier, _ = classify_source_tier("Some Respected Local Business Daily", "A", False)
        # RED on old code: tier == 1. GREEN: tier == 2.
        self.assertEqual(tier, 2)

    def test_unmapped_grade_a_source_quality_is_13_not_20(self):
        fx = base_fixture(source_name="Some Respected Local Business Daily", source_grade="A")
        r = build_score_breakdown(fx)
        # RED on old code: source_quality == 20. GREEN: 13 (Tier 2 base).
        self.assertEqual(r["score_breakdown"]["source_quality"]["value"], 13)
        self.assertEqual(r["source_tier"], 2)

    def test_official_filing_still_tier1(self):
        tier, _ = classify_source_tier("SEC EDGAR", "A", True)
        self.assertEqual(tier, 1)

    def test_mapped_tier1_wire_unchanged(self):
        tier, _ = classify_source_tier("Reuters", "A", False)
        self.assertEqual(tier, 1)


class ScoreBreakdownSchemaRequiredKeys(unittest.TestCase):
    """Thread C — when a `score_breakdown` block is present it must carry all 11 named
    components/penalties. Before the fix, a partial (or single-key) breakdown validated, so a
    payload could ship an incomplete transparency block. The block itself stays OPTIONAL at root
    for backward-compat with the pre-transparency committed payloads (which omit it entirely)."""

    def _valid(self, payload) -> bool:
        mod = _load_validator()
        chk = mod.Checker(_schema())
        chk.check(_schema(), payload, "")
        return not chk.errors

    def test_no_breakdown_block_still_valid_backward_compat(self):
        # The 10 committed payloads omit score_breakdown entirely — must keep validating.
        self.assertTrue(self._valid(_minimal_valid_payload()))

    def test_partial_breakdown_is_rejected(self):
        p = _minimal_valid_payload(score_breakdown={
            "source_quality": {"value": 20, "max_value": 20, "reason": "x"}
        })
        # RED on old schema: validated. GREEN: rejected (missing 10 required component/penalty keys).
        self.assertFalse(self._valid(p))

    def test_full_breakdown_is_accepted(self):
        p = _minimal_valid_payload(score_breakdown=_full_breakdown())
        self.assertTrue(self._valid(p))


class RoutineFilingPenaltyDerivedFromFilingType(unittest.TestCase):
    """PR review (techmuns/ceekay-munshot, #129 hold comment): routine_filing_penalty must be
    DERIVED from filing_type (scripts/screener_filing_classifier.py, Step 2b) — not a separately
    agent-judged severity — so #124's Step-10b ceiling and this penalty can never double-count the
    same evidence. filing_type is the ONLY input; there is no routine_severity/is_routine_filing
    field anymore."""

    def test_trading_window_closure_is_moderate(self):
        v, reason = penalty_routine_filing("trading_window_closure")
        self.assertEqual(v, -15)
        self.assertIn("trading_window_closure", reason)

    def test_procedural_exchange_filing_is_moderate(self):
        v, _ = penalty_routine_filing("procedural_exchange_filing")
        self.assertEqual(v, -15)

    def test_routine_board_meeting_is_mild(self):
        v, _ = penalty_routine_filing("routine_board_meeting")
        self.assertEqual(v, -8)

    def test_financial_results_notice_is_mild(self):
        v, _ = penalty_routine_filing("financial_results_notice")
        self.assertEqual(v, -8)

    def test_material_exchange_filing_is_not_derated(self):
        # An override keyword fired (resignation, fraud, M&A, ...) — never derated, no ceiling.
        v, _ = penalty_routine_filing("material_exchange_filing")
        self.assertEqual(v, 0)

    def test_unknown_filing_is_not_derated(self):
        # Abstain — an unrecognized filing type must never be silently suppressed.
        v, _ = penalty_routine_filing("unknown_filing")
        self.assertEqual(v, 0)


class GenericMediaPenaltyDerivedFromDetectorScores(unittest.TestCase):
    """PR review (#129 hold comment): generic_media_penalty must be DERIVED from is_generic_media +
    the generic-media detector's specificity/quantifiability/investability scores — not a separately
    agent-judged media_genericness enum — so #125's min() ceiling and this penalty can never
    double-count the same evidence."""

    def test_not_generic_media_no_penalty(self):
        v, reason = penalty_generic_media(False, 0, 0, 0)
        self.assertEqual(v, 0)
        self.assertIn("false", reason)

    def test_generic_but_investable_is_roundup(self):
        # investability >= 30 despite the generic format — a specific anomaly is still present.
        v, _ = penalty_generic_media(True, 10, 10, 40)
        self.assertEqual(v, -6)

    def test_generic_low_investability_but_some_specificity_is_republished(self):
        v, _ = penalty_generic_media(True, 50, 50, 10)
        self.assertEqual(v, -12)

    def test_generic_no_investability_no_specificity_is_content_farm(self):
        v, _ = penalty_generic_media(True, 0, 0, 0)
        self.assertEqual(v, -15)


class NoSeparateJudgmentFieldsRemain(unittest.TestCase):
    """The old agent-judged is_routine_filing/routine_severity/media_genericness fields must not
    exist anywhere in the required-input contract — filing_type and is_generic_media/its sub-scores
    are the only evidence the script accepts, so there is no way to double-supply/double-count the
    same judgment via two different fields."""

    def test_required_fields_has_filing_type_and_generic_media_evidence(self):
        for f in ("filing_type", "is_generic_media", "specificity_score",
                  "quantifiability_score", "investability_score"):
            self.assertIn(f, REQUIRED_FIELDS)

    def test_required_fields_has_no_legacy_judgment_fields(self):
        for f in ("is_routine_filing", "routine_severity", "media_genericness"):
            self.assertNotIn(f, REQUIRED_FIELDS)

    def test_missing_filing_type_is_rejected_by_build(self):
        fx = base_fixture()
        del fx["filing_type"]
        with self.assertRaises(KeyError):
            build_score_breakdown(fx)


class CapexEventTypeWeighted(unittest.TestCase):
    """PR #150 review (Codex): the gauntlet Step-2 vocabulary + signal_payload.schema.json now admit
    `capex`, so the deterministic scorer must weight it. rank-weights.ts ties capex = capital_actions,
    and MODULE_RULES groups capital_actions at weight 5 — so capex = 5 here too. Without it a capex-only
    signal takes EVENT_TYPE_WEIGHT.get('capex', 0) = 0 add-on and under-scores/under-routes vs an
    otherwise identical capital_actions signal."""

    def test_capex_weighted_same_as_capital_actions(self):
        capex_val, _ = score_event_materiality("material", ["capex"])
        capital_val, _ = score_event_materiality("material", ["capital_actions"])
        self.assertEqual(capex_val, capital_val, "capex must be weighted like its tied event capital_actions")
        # base 14 (material) + add-on 5 (MODULE_RULES weight table) = 19; the pre-fix value was 14.
        self.assertEqual(capex_val, 19)


if __name__ == "__main__":
    unittest.main()
