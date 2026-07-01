#!/usr/bin/env python3
"""Unit tests for scripts/screener_confirmation_score.py — the M0.1 paywall/source-confirmation rubric.

No pytest in this environment; stdlib unittest only. Run directly:
    python3 scripts/test_screener_confirmation_score.py -v

Covers the engine's required test matrix for paywalled-article handling:
  1. Paywalled Reuters-grade headline + an official announcement found  -> confirmed
  2. Paywalled article + no alternate source found at all               -> headline_only, lower (not zero)
     confidence, gate stays closed (conservative design: stays parked, fully labelled)
  3. Low-credibility primary + no confirmation anywhere                 -> unconfirmed, low confidence
  4. An official announcement overrides paywall weakness                -> confirmed, gate passes even
     though the primary article was never read
plus supporting edge cases (X/Twitter-alone cap, clean reads, multi-source bonus cap, clamping).
"""
import unittest

from screener_confirmation_score import score


class TestConfirmationScore(unittest.TestCase):
    def test_case1_paywalled_gradeA_official_announcement_confirmed(self):
        r = score("A", "paywalled", [{"tier": 1, "confirms": "full"}])
        self.assertEqual(r["confirmation_status"], "confirmed")
        self.assertGreaterEqual(r["extraction_confidence"], 61)  # "strong" band, CLAUDE.md §12
        self.assertTrue(r["gate_pass"])

    def test_case2_paywalled_no_alternates_headline_only_stays_parked(self):
        r = score("A", "paywalled", [])
        self.assertEqual(r["confirmation_status"], "headline_only")
        self.assertGreater(r["extraction_confidence"], 0)   # lower, not zero — req #4
        self.assertLess(r["extraction_confidence"], 41)     # "weak" band, not "mixed" or above
        self.assertFalse(r["gate_pass"])                    # conservative design: stays watchlist_no_source

    def test_case3_gradeB_no_confirmation_unconfirmed_low_confidence(self):
        # A genuinely off-list/low-credibility source never reaches M0.1 (Gate 0 rejects it first);
        # the M0.1-level equivalent of "random blog, no confirmation" is a Grade-B primary (a secondary
        # aggregator, not a primary newswire) that's also unreadable with zero corroboration.
        r = score("B", "paywalled", [])
        self.assertEqual(r["confirmation_status"], "unconfirmed")
        self.assertLessEqual(r["extraction_confidence"], 20)  # "very weak" band
        self.assertFalse(r["gate_pass"])

    def test_case4_official_announcement_overrides_paywall_gate_passes(self):
        r = score("A", "paywalled", [{"tier": 1, "confirms": "full"}])
        self.assertEqual(r["confirmation_status"], "confirmed")
        self.assertTrue(r["gate_pass"])  # passes despite primary_read_quality == "paywalled"

    def test_twitter_alone_never_reaches_confirmed(self):
        r = score("A", "paywalled", [{"tier": 5, "confirms": "full"}])
        self.assertNotEqual(r["confirmation_status"], "confirmed")
        self.assertEqual(r["confirmation_status"], "partially_confirmed")

    def test_regulator_filing_full_confirm_is_confirmed(self):
        r = score("B", "fetch_error", [{"tier": 2, "confirms": "full"}])
        self.assertEqual(r["confirmation_status"], "confirmed")
        self.assertTrue(r["gate_pass"])

    def test_specialist_blog_partial_confirm_is_partially_confirmed_not_confirmed(self):
        r = score("A", "paywalled", [{"tier": 4, "confirms": "partial"}])
        self.assertEqual(r["confirmation_status"], "partially_confirmed")

    def test_full_clean_read_high_confidence_no_alternates_needed(self):
        # primary_read_quality == "full" means the agent actually read the article and confirmed the
        # facts itself — that IS confirmation, no alternate source is needed.
        r = score("A", "full", [])
        self.assertEqual(r["confirmation_status"], "confirmed")
        self.assertGreaterEqual(r["extraction_confidence"], 61)
        self.assertTrue(r["gate_pass"])

    def test_gradeB_paywalled_headline_alone_is_unconfirmed_not_headline_only(self):
        # headline_only is reserved for Grade-A credible primaries (req #1's "if source is credible");
        # a Grade-B primary with nothing else doesn't get that label.
        r = score("B", "paywalled", [])
        self.assertEqual(r["confirmation_status"], "unconfirmed")

    def test_multi_source_bonus_capped_at_10(self):
        many = [{"tier": 3, "confirms": "partial"}] * 5
        single = [{"tier": 3, "confirms": "partial"}]
        r_many = score("A", "paywalled", many)
        r_single = score("A", "paywalled", single)
        self.assertLessEqual(r_many["extraction_confidence"] - r_single["extraction_confidence"], 10)
        self.assertEqual(r_many["multi_source_bonus"], 10)

    def test_confidence_always_clamped_0_100(self):
        r = score("A", "full", [{"tier": 1, "confirms": "full"}] * 3)
        self.assertLessEqual(r["extraction_confidence"], 100)
        self.assertGreaterEqual(r["extraction_confidence"], 0)

    def test_no_alternates_no_primary_read_not_attempted_is_unconfirmed(self):
        r = score("A", "not_attempted", [])
        self.assertEqual(r["confirmation_status"], "unconfirmed")
        self.assertEqual(r["extraction_confidence"], 0)
        self.assertFalse(r["gate_pass"])

    def test_invalid_source_grade_raises(self):
        with self.assertRaises(ValueError):
            score("C", "full", [])

    def test_invalid_tier_raises(self):
        with self.assertRaises(ValueError):
            score("A", "full", [{"tier": 6, "confirms": "full"}])

    def test_threshold_is_overridable(self):
        # Overridability must be shown on an input that genuinely CLEARS the confirmation gate — i.e. one
        # with gate-qualifying corroboration (here a tier-4 partial alternate, base 20 + 8 = 28) that sits
        # between the lenient (25) and default (35) thresholds. Lowering the threshold rescues it; the
        # threshold, not a missing confirmation, is what moves.
        packet = [{"tier": 4, "confirms": "partial"}]
        r_default = score("B", "paywalled", packet)
        r_lenient = score("B", "paywalled", packet, threshold=25)
        self.assertEqual(r_default["extraction_confidence"], 28)
        self.assertFalse(r_default["gate_pass"])   # 28 < 35
        self.assertTrue(r_lenient["gate_pass"])    # 28 >= 25 AND tier-4 corroboration qualifies

    def test_threshold_drop_never_rescues_uncorroborated_headline(self):
        # A Grade-A paywalled headline with ZERO alternates is headline_only: it has no confirmation at all,
        # so lowering the threshold must NOT open the gate (CLAUDE.md §3 no source = no claim; MODULE_RULES
        # "headline_only does NOT get a free pass"). Confidence 30 >= threshold 25, yet the gate stays shut.
        r = score("A", "paywalled", [], threshold=25)
        self.assertEqual(r["confirmation_status"], "headline_only")
        self.assertGreaterEqual(r["extraction_confidence"], 25)
        self.assertFalse(r["gate_pass"])

    def test_tier5_only_never_opens_gate(self):
        # Thread B: a Grade-A paywalled primary + a SINGLE tier-5 (X/Twitter) full corroboration scores
        # 20+10+6=36, clearing the 35 threshold — but tier 5 is "weak, never sole" (SWARM.md
        # social_corroboration). It caps at partially_confirmed AND must not open the gate: needs >=1
        # tier 1-4 corroborating source first.
        r = score("A", "paywalled", [{"tier": 5, "confirms": "full"}])
        self.assertEqual(r["confirmation_status"], "partially_confirmed")
        self.assertGreaterEqual(r["extraction_confidence"], 35)  # would have passed on points alone
        self.assertFalse(r["gate_pass"])                          # but tier-5-only never gates

    def test_tier5_plus_one_real_source_opens_gate(self):
        # The complement: add ONE tier 1-4 corroborating source and the gate can open — tier 5 no longer
        # stands alone. (tier-3 partial = 16, base 20 + bump 10 + 16 = 46 >= 35.)
        r = score("A", "paywalled", [{"tier": 5, "confirms": "full"}, {"tier": 3, "confirms": "partial"}])
        self.assertTrue(r["gate_pass"])

    def test_partial_read_zero_corroboration_never_opens_gate(self):
        # Thread D: a thin/ambiguous `partial` read of the primary with ZERO alternates scores base 45,
        # clearing the 35 threshold and reading partially_confirmed — but nothing corroborated the fact.
        # Per CLAUDE.md §3 (no source = no claim) the gate must stay shut until an actual alternate
        # corroboration (tier 1-4) or a full primary read exists.
        for grade in ("A", "B"):
            r = score(grade, "partial", [])
            self.assertEqual(r["confirmation_status"], "partially_confirmed")
            self.assertGreaterEqual(r["extraction_confidence"], 35)  # points alone would have passed
            self.assertFalse(r["gate_pass"])

    def test_partial_read_with_real_corroboration_opens_gate(self):
        # The complement to Thread D: a `partial` read PLUS a tier 1-4 corroborating alternate is a real,
        # gate-qualifying confirmation — the gate opens.
        r = score("B", "partial", [{"tier": 2, "confirms": "partial"}])
        self.assertTrue(r["gate_pass"])


if __name__ == "__main__":
    unittest.main()
