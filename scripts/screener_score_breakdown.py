#!/usr/bin/env python3
"""Deterministically compute the Phase 0.1 signal-gate materiality score breakdown (CLAUDE.md §12).

Mirrors the screener_rescore.py precedent: the LLM agent supplies the judgments only an article
reader can make (relevance, event types, is it paywalled, is the issuer private and linked to a
public company, ...) plus two fields carried forward verbatim from other deterministic code
(filing_type from scripts/screener_filing_classifier.py, is_generic_media + its sub-scores from the
screener-generic-media-detector agent) — never re-judged here; THIS module applies the locked,
testable arithmetic and returns the full named-component breakdown, so every materiality score is
explainable from evidence rows, never vibes. Pure functions only — no ledger writes, no file writes.
The caller (99_signal-gate-synthesis.md) folds the printed JSON verbatim into signal_payload.json.

The point tables below are canonical jointly with .claude/agents/screener/signal-gate/MODULE_RULES.md
("## Materiality (Step 10)") — a change to a weight or cap must edit both in the same PR.

  python3 scripts/screener_score_breakdown.py --input-json '{...}'
  python3 scripts/screener_score_breakdown.py --input-file path/to/input.json
"""
from __future__ import annotations

import argparse
import json
import sys

# ---- component 2: event_materiality -----------------------------------------------------------

BASE_BY_RELEVANCE = {"irrelevant": 0, "relevant_non_material": 4, "material": 14}

EVENT_TYPE_WEIGHT = {
    "guidance_change": 6, "mna": 6, "debt_credit": 6, "litigation_enforcement": 6,
    "regulatory": 5, "earnings_revenue_margin": 5, "capital_actions": 5,
    "management": 4, "cybersecurity": 4,
    "product": 3, "commercial": 3, "operations": 3, "macro_sector": 3,
    "rumor": 1,
}

# ---- component 3: company_relevance ------------------------------------------------------------

LINKAGE_BASE = {"primary_issuer": 16, "secondary_issuer": 10, "sector_only": 5, "macro_only": 2}

LINKAGE_TAG_POINTS = {
    "acquisition_target_of_public_acquirer": 16,
    "supplier_or_customer_of_public_company": 14,
    "commodity_sector_bottleneck": 13,
    "ai_datacenter_supply_chain": 13,
    "competitor_informative_to_public_company": 11,
    "plausible_future_private_secondary_opportunity": 6,
}

# ---- component 4 / 5: specificity, estimate_impact ---------------------------------------------

SPECIFICITY_WEIGHT = {
    "hard_number_cited": 5, "corroborating_second_number": 4,
    "named_counterparty_or_instrument": 3, "effective_date_stated": 3,
}

ESTIMATE_WEIGHT = {
    "moves_consensus_estimate": 6, "traceable_to_valuation_driver": 5, "material_relative_to_size": 4,
}

UNCORROBORATED_CAP = 6

# ---- source tiers (Part 2) ----------------------------------------------------------------------

SOURCE_TIER_MAP = {
    # Tier 1 — Reuters/Bloomberg/FT/WSJ class (official filings/agencies handled via is_official_filing)
    "Reuters": 1, "Bloomberg": 1, "Financial Times": 1, "The Wall Street Journal": 1,
    "Associated Press": 1, "AFP": 1,
    # Tier 2 — respected business press / sector trade press (independent of Gate-0's A/B grade —
    # e.g. Australian Financial Review is Grade A at Gate 0 [primary newspaper, not an aggregator]
    # but Tier 2 here [not a Reuters/Bloomberg-class global wire]; the two axes answer different questions)
    "CNBC": 2, "MarketWatch": 2, "Simply Wall St": 2, "The Economic Times": 2, "Business Standard": 2,
    "LiveMint": 2, "Moneycontrol": 2, "Australian Financial Review": 2,
    # Tier 3 — generic aggregators / republished PR / content-adjacent wires
    "PR Newswire": 3, "Business Wire": 3, "GlobeNewswire": 3, "Investing.com": 3, "Benzinga": 3,
    "Business Insider": 3,
    # Tier 4: no entries — the deliberate fallback for anything unrecognized.
}

SOURCE_QUALITY_BASE = {1: 20, 2: 13, 3: 6, 4: 2}
SOURCE_QUALITY_PAYWALL_UNCORROBORATED = {1: 15, 2: 9, 3: 3, 4: 0}

# ---- penalties (Part 1, §7) ----------------------------------------------------------------------

ROUTINE_SEVERITY = {"none": 0, "mild": -8, "moderate": -15, "total": -20}
MEDIA_GENERICNESS = {"none": 0, "roundup": -6, "republished": -12, "content_farm": -15}

# filing_type -> routine_filing_penalty severity (MODULE_RULES.md "Materiality (Step 10)" penalty
# table). Derived from scripts/screener_filing_classifier.py's Step 2b classification — never a
# separately-judged agent input, and never a second ceiling on top of this subtraction.
FILING_TYPE_SEVERITY = {
    "trading_window_closure": "moderate",
    "procedural_exchange_filing": "moderate",
    "routine_board_meeting": "mild",
    "financial_results_notice": "mild",
    "material_exchange_filing": "none",
    "unknown_filing": "none",
}

PAIR_LABEL_PENALTY = {
    "duplicate": -25, "same_event_no_new_info": -12, "same_event_new_info": -3,
    "related_topic": 0, "new_event": 0,
}


def classify_source_tier(source_name: str, source_grade: str, is_official_filing: bool) -> tuple[int, str]:
    """Pure. Refines Gate-0's A/B grade into Tier 1-4 — never overrides the firewall pass/fail."""
    if is_official_filing:
        return 1, f"{source_name} is an official filing/regulator/agency release — Tier 1 by document type."
    if source_name in SOURCE_TIER_MAP:
        t = SOURCE_TIER_MAP[source_name]
        return t, f"{source_name} is on the Tier {t} canonical mapping."
    if source_grade == "A":
        # Grade A at Gate 0 means primary newswire / official filing / official agency cleared the
        # firewall — but Tier 1 (MODULE_RULES "Source-quality tiers") is a CLOSED enumeration:
        # official announcements/filings/agencies and the Reuters/Bloomberg/FT/WSJ-class global
        # wires only. Those reach Tier 1 via is_official_filing above or their explicit SOURCE_TIER_MAP
        # entry. A respected-but-unmapped Grade-A publisher (a reputable local business paper, a
        # sector daily) is "respected business press" = Tier 2, NOT a global wire. Defaulting it to
        # Tier 1 over-scored it (20 vs 13 source_quality points); Tier 2 is the correct floor for
        # cleared-but-unrecognized Grade-A press.
        return 2, f"{source_name} is Gate-0 Grade A but not in the Tier-1 wire/filing set — defaults to Tier 2 (respected press)."
    return 4, f"{source_name} is not in the Tier 1-3 mapping — defaults to Tier 4 (unknown/low-quality)."


def score_source_quality(tier: int, paywalled: bool, corroborated: bool) -> tuple[int, str]:
    """Pure. The component IS source_quality_score — written once, never recomputed elsewhere."""
    if paywalled and not corroborated:
        v = SOURCE_QUALITY_PAYWALL_UNCORROBORATED[tier]
        return v, f"Tier {tier} source, paywalled and not yet corroborated by a second source."
    v = SOURCE_QUALITY_BASE[tier]
    return v, f"Tier {tier} source, body readable or no paywall issue."


def score_event_materiality(relevance_label: str, event_types: list[str]) -> tuple[int, str]:
    """Pure. Never looks at routineness — that's penalty 7a, kept independent of this component."""
    base = BASE_BY_RELEVANCE[relevance_label]
    addon = min(6, sum(EVENT_TYPE_WEIGHT.get(t, 0) for t in event_types))
    value = base + addon
    types_str = ", ".join(event_types) if event_types else "no tagged event types"
    return value, f"Base {base} ({relevance_label} relevance) + severity add-on {addon} ({types_str})."


def score_company_relevance(issuer_public_status: str, issuer_linkage: str | None,
                             private_linkage_tags: list[str], portfolio_position: bool) -> tuple[int, str]:
    """Pure. Path A (public) uses issuer_linkage; Path B (private_unlisted) uses the BEST evidenced
    linkage tag only (not summed) — this is the private/unlisted escape hatch (CLAUDE.md task brief)."""
    bonus = 4 if portfolio_position else 0
    if issuer_public_status == "public":
        base = LINKAGE_BASE[issuer_linkage]
        value = min(20, base + bonus)
        return value, f"Public issuer, {issuer_linkage} ({base}) + portfolio-position bonus {bonus}."
    # private_unlisted
    if private_linkage_tags:
        best_tag = max(private_linkage_tags, key=lambda t: LINKAGE_TAG_POINTS.get(t, 0))
        base = LINKAGE_TAG_POINTS.get(best_tag, 0)
    else:
        best_tag, base = None, 0
    value = min(20, base + bonus)
    if best_tag:
        return value, f"Private/unlisted issuer scored on evidenced linkage '{best_tag}' ({base}) + portfolio-position bonus {bonus}."
    return value, "Private/unlisted issuer with no evidenced public-company linkage — scored 0 here (see private_unlisted_irrelevance_penalty)."


def _specificity_cap_applies(paywalled: bool, corroborated: bool, source_tier: int) -> bool:
    return (not corroborated) and (paywalled or source_tier in (3, 4))


def score_specificity(signals: dict, paywalled: bool, corroborated: bool, source_tier: int) -> tuple[int, str]:
    """Pure. Hard-capped at 6 when uncorroborated AND (paywalled OR a Tier-3/4 source) — body-level
    detail usually lives behind exactly those gaps."""
    raw = sum(SPECIFICITY_WEIGHT[k] for k, v in signals.items() if v and k in SPECIFICITY_WEIGHT)
    if _specificity_cap_applies(paywalled, corroborated, source_tier):
        value = min(raw, UNCORROBORATED_CAP)
        return value, f"Raw {raw} capped at {UNCORROBORATED_CAP} — uncorroborated and (paywalled or low-tier source)."
    return raw, f"Raw {raw}, no corroboration cap applies."


def score_estimate_impact(signals: dict, paywalled: bool, corroborated: bool, source_tier: int) -> tuple[int, str]:
    """Pure. Same corroboration cap as specificity — valuation/estimate math usually needs body detail."""
    raw = sum(ESTIMATE_WEIGHT[k] for k, v in signals.items() if v and k in ESTIMATE_WEIGHT)
    if _specificity_cap_applies(paywalled, corroborated, source_tier):
        value = min(raw, UNCORROBORATED_CAP)
        return value, f"Raw {raw} capped at {UNCORROBORATED_CAP} — uncorroborated and (paywalled or low-tier source)."
    return raw, f"Raw {raw}, no corroboration cap applies."


def score_theme_macro(sector_wide_move: bool, live_theme_match: bool, commodity_rate_transmission: bool) -> tuple[int, str]:
    """Pure. A single-name idiosyncratic event scoring 0 here is correct, not a defect."""
    value = (5 if sector_wide_move else 0) + (4 if live_theme_match else 0) + (1 if commodity_rate_transmission else 0)
    bits = []
    if sector_wide_move:
        bits.append("sector-wide move (+5)")
    if live_theme_match:
        bits.append("matches a live screener theme (+4)")
    if commodity_rate_transmission:
        bits.append("commodity/rate transmission to portfolio names (+1)")
    return value, ("; ".join(bits) if bits else "No macro/theme angle — single-name event.")


def penalty_routine_filing(filing_type: str) -> tuple[int, str]:
    """Pure. Derives the severity from filing_type (Step 2b, scripts/screener_filing_classifier.py)
    — never a separately-judged agent input. material_exchange_filing means an override keyword
    fired (resignation, fraud, M&A, guidance change, ...); MODULE_RULES.md instructs the classifier
    to never let an enforcement action, default, or breach classify as a routine filing_type."""
    severity = FILING_TYPE_SEVERITY.get(filing_type, "none")
    if severity == "none":
        return 0, f"filing_type '{filing_type}' — not a routine-filing derate category."
    v = ROUTINE_SEVERITY[severity]
    return v, f"filing_type '{filing_type}' classified {severity} routine ({v})."


def penalty_generic_media(is_generic_media: bool, specificity_score: int, quantifiability_score: int,
                           investability_score: int) -> tuple[int, str]:
    """Pure. Derives the severity from is_generic_media + the generic-media detector's sub-scores —
    never a separately-judged agent input (MODULE_RULES.md "Generic media detection")."""
    if not is_generic_media:
        return 0, "Not flagged generic media (is_generic_media=false)."
    avg_sq = (specificity_score + quantifiability_score) / 2
    if investability_score >= 30:
        genericness = "roundup"
    elif avg_sq >= 30:
        genericness = "republished"
    else:
        genericness = "content_farm"
    v = MEDIA_GENERICNESS[genericness]
    return v, (f"Generic media (investability {investability_score}, avg specificity/quantifiability "
               f"{avg_sq:.0f}) classified '{genericness}' ({v}).")


def penalty_private_unlisted(issuer_public_status: str, private_linkage_tags: list[str]) -> tuple[int, str]:
    """Pure. The escape hatch: 0 (or a small -4 haircut for the weakest tag only) whenever ANY
    evidenced linkage to a public company exists; the full -15 only when there is none at all."""
    if issuer_public_status != "private_unlisted":
        return 0, "Issuer is public; penalty not applicable."
    if not private_linkage_tags:
        return -15, "Private/unlisted issuer with no evidenced linkage to any public company."
    if set(private_linkage_tags) == {"plausible_future_private_secondary_opportunity"}:
        return -4, "Only a speculative future-secondary-opportunity linkage is evidenced — small haircut."
    return 0, f"Evidenced linkage present ({', '.join(private_linkage_tags)}); the no-linkage penalty does not apply."


def penalty_duplicate_stale(pair_label: str, confirmation_upgrade: bool) -> tuple[int, str]:
    if confirmation_upgrade:
        return 0, "Confirmation upgrade — new confirming information, not a stale duplicate."
    v = PAIR_LABEL_PENALTY[pair_label]
    if v == 0:
        return 0, f"pair_label '{pair_label}' — not a duplicate/stale repeat."
    return v, f"pair_label '{pair_label}'."


def penalty_low_confidence(relevance_confidence: float, source_tier: int, corroborated: bool,
                            sensational_uncorroborated: bool) -> tuple[int, str]:
    """Pure. Ordered, first match wins."""
    if relevance_confidence < 0.50:
        return -10, f"relevance_confidence {relevance_confidence:.2f} < 0.50."
    if source_tier == 4 and not corroborated and sensational_uncorroborated:
        return -10, "Tier 4, uncorroborated, and the claim is flagged sensational relative to the company's normal scale."
    if relevance_confidence < 0.80:
        return -5, f"relevance_confidence {relevance_confidence:.2f} in [0.50, 0.80)."
    if source_tier in (3, 4) and not corroborated:
        return -5, f"Tier {source_tier}, uncorroborated, despite confidence {relevance_confidence:.2f}."
    return 0, f"relevance_confidence {relevance_confidence:.2f} >= 0.80, source tier {source_tier} or corroborated."


def render_materiality_math(breakdown: dict, final_score: int) -> str:
    comps = ["source_quality", "event_materiality", "company_relevance", "specificity", "estimate_impact", "theme_macro"]
    labels = {
        "source_quality": "Source", "event_materiality": "Event", "company_relevance": "Company",
        "specificity": "Specificity", "estimate_impact": "Estimate", "theme_macro": "Theme",
    }
    parts = [f"{labels[c]} {breakdown[c]['value']}/{breakdown[c]['max_value']}" for c in comps]
    penalty_total = -sum(
        breakdown[p]["value"] for p in breakdown
        if p not in comps
    )
    return " + ".join(parts) + f" − penalties {penalty_total} = {final_score}/100."


def build_score_breakdown(inputs: dict) -> dict:
    """Pure. Orchestrates every component + penalty, then clamps. No side effects."""
    tier, tier_reason = classify_source_tier(
        inputs["source_name"], inputs["source_grade"], inputs["is_official_filing"]
    )
    sq_value, sq_reason = score_source_quality(tier, inputs["paywalled"], inputs["corroborated"])
    em_value, em_reason = score_event_materiality(inputs["relevance_label"], inputs["event_types"])
    cr_value, cr_reason = score_company_relevance(
        inputs["issuer_public_status"], inputs.get("issuer_linkage"),
        inputs.get("private_linkage_tags") or [], inputs["portfolio_position"],
    )
    sp_value, sp_reason = score_specificity(
        inputs["specificity_signals"], inputs["paywalled"], inputs["corroborated"], tier
    )
    ei_value, ei_reason = score_estimate_impact(
        inputs["estimate_impact_signals"], inputs["paywalled"], inputs["corroborated"], tier
    )
    tm_value, tm_reason = score_theme_macro(
        inputs["sector_wide_move"], inputs["live_theme_match"], inputs["commodity_rate_transmission"]
    )

    rf_value, rf_reason = penalty_routine_filing(inputs["filing_type"])
    gm_value, gm_reason = penalty_generic_media(
        inputs["is_generic_media"], inputs["specificity_score"], inputs["quantifiability_score"],
        inputs["investability_score"],
    )
    pu_value, pu_reason = penalty_private_unlisted(inputs["issuer_public_status"], inputs.get("private_linkage_tags") or [])
    ds_value, ds_reason = penalty_duplicate_stale(inputs["pair_label"], inputs["confirmation_upgrade"])
    lc_value, lc_reason = penalty_low_confidence(
        inputs["relevance_confidence"], tier, inputs["corroborated"], inputs["sensational_uncorroborated"]
    )

    breakdown = {
        "source_quality": {"value": sq_value, "max_value": 20, "reason": sq_reason},
        "event_materiality": {"value": em_value, "max_value": 20, "reason": em_reason},
        "company_relevance": {"value": cr_value, "max_value": 20, "reason": cr_reason},
        "specificity": {"value": sp_value, "max_value": 15, "reason": sp_reason},
        "estimate_impact": {"value": ei_value, "max_value": 15, "reason": ei_reason},
        "theme_macro": {"value": tm_value, "max_value": 10, "reason": tm_reason},
        "routine_filing_penalty": {"value": rf_value, "max_value": -20, "reason": rf_reason},
        "generic_media_penalty": {"value": gm_value, "max_value": -15, "reason": gm_reason},
        "private_unlisted_irrelevance_penalty": {"value": pu_value, "max_value": -15, "reason": pu_reason},
        "duplicate_stale_penalty": {"value": ds_value, "max_value": -25, "reason": ds_reason},
        "low_confidence_extraction_penalty": {"value": lc_value, "max_value": -10, "reason": lc_reason},
    }
    subtotal = sq_value + em_value + cr_value + sp_value + ei_value + tm_value
    penalty_total = rf_value + gm_value + pu_value + ds_value + lc_value
    final_score = max(0, min(100, subtotal + penalty_total))

    # Hard LOG cap for an irrelevant event (MODULE_RULES Step 1: `irrelevant` = fails the strict
    # materiality test). Without this, the source/company/specificity/estimate/theme components
    # still sum, so an irrelevant item from a Tier-1 wire could reach PARK (40-69) or even PROMOTE
    # (>=70) on non-materiality points alone. An event that changes no investment decision must
    # route to LOG (<40) regardless of how well-sourced or well-specified it is. Cap at 39 (LOG
    # ceiling); if penalties already pushed it lower, keep the lower number.
    if inputs["relevance_label"] == "irrelevant":
        final_score = min(final_score, 39)

    return {
        "score_breakdown": breakdown,
        "final_score": final_score,
        "materiality_math": render_materiality_math(breakdown, final_score),
        "source_tier": tier,
        "source_quality_score": sq_value,
        "source_quality_reason": sq_reason,
    }


REQUIRED_FIELDS = [
    "relevance_label", "event_types", "issuer_linkage", "pair_label", "confirmation_upgrade",
    "relevance_confidence", "source_name", "source_grade", "is_official_filing", "paywalled",
    "corroborated", "filing_type", "is_generic_media", "specificity_score", "quantifiability_score",
    "investability_score", "sensational_uncorroborated", "issuer_public_status", "portfolio_position",
    "sector_wide_move", "live_theme_match", "commodity_rate_transmission",
    "specificity_signals", "estimate_impact_signals",
]


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--input-json", help="Inline compact JSON.")
    g.add_argument("--input-file", help="Path to a JSON file.")
    a = ap.parse_args(argv[1:])

    try:
        raw = a.input_json if a.input_json is not None else open(a.input_file, encoding="utf-8").read()
        inputs = json.loads(raw)
    except (OSError, json.JSONDecodeError) as e:
        print(f"could not read/parse input: {e}", file=sys.stderr)
        return 2

    missing = [f for f in REQUIRED_FIELDS if f not in inputs]
    if missing:
        print(f"missing required field(s): {', '.join(missing)}", file=sys.stderr)
        return 2

    result = build_score_breakdown(inputs)
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
