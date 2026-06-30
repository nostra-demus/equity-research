#!/usr/bin/env python3
"""Deterministically score source confirmation for M0.1 (screener-event-statement) when the primary
article is paywalled or thin. Kept as deterministic code (not LLM arithmetic) so every confidence move
is explainable from evidence rows, never vibes (CLAUDE.md §12) — the same split as scripts/screener_rescore.py:
the agent supplies the judgment (source grade, what was actually read, which alternate sources were found
and what tier/strength they confirm at); THIS applies the locked rubric.

Rubric (frameworks/screener/SWARM.md §"sources.thesis_structure" documents the same tier order):

  base_points   from primary_read_quality (full=70, partial=45, paywalled=20, fetch_error=15, not_attempted=0)
  + 10          credibility floor bump when source_grade == "A" and the primary could not be read
                (paywalled/fetch_error) — a Grade-A masthead headline is not a random blog (req #1)
  + best alternate-source points (highest-scoring single alternate, tier 1-5 x confirms full/partial/none —
    see TIER_POINTS) — never summed/stacked across sources, so confidence can't be gamed by piling up
    weak corroborations
  + multi-source bonus: +5 per ADDITIONAL corroborating alternate (confirms != none), capped at +10 total

  extraction_confidence = clamp(0, 100, base + bump + best_alt + multi_bonus)

confirmation_status (first match wins):
  1. primary_read_quality == "full"                                             -> confirmed (we read it
     directly ourselves — the original purpose of the 60-second check)
  2. best alternate is tier 1-3 AND confirms=full (best_alt_points >= 30)        -> confirmed
  3. primary_read_quality == "partial", OR any corroborating alternate exists
     (best_alt_points > 0 — even a weak tier-5 signal counts here, req #5)       -> partially_confirmed
  4. zero alternates, primary unread (paywalled/fetch_error), source_grade=="A" -> headline_only
  5. otherwise                                                                   -> unconfirmed
  HARD RULE: if the only alternate is tier 5 (X/Twitter), status caps at partially_confirmed —
  never confirmed, regardless of points (req #2: X/Twitter is secondary/weak only, never sole
  confirmation). This is currently unreachable through the point table alone (tier 5's max 6 points is
  far below the confirmed threshold of 30) — kept as an explicit, defense-in-depth override so a future
  point-table retune can't silently let X/Twitter alone satisfy "confirmed".

gate_pass = confirmation_status != "unconfirmed" AND extraction_confidence >= threshold (default 35).
A `headline_only` record does NOT get a free pass — it must clear the same numeric threshold as everyone
else. This is the conservative design: a credible-but-totally-uncorroborated headline stays parked
(watchlist_no_source) rather than auto-proceeding, but is now labelled with a real (not zero) confidence
score and the full evidence trail, instead of an opaque boolean fail.

  python3 scripts/screener_confirmation_score.py \
      --source-grade A --primary-read-quality paywalled \
      --alternate-sources-json '[{"tier":1,"confirms":"full"}]' [--threshold 35] [--json]
"""
from __future__ import annotations

import argparse
import json
import sys

SOURCE_GRADES = ("A", "B")
READ_QUALITIES = ("full", "partial", "paywalled", "fetch_error", "not_attempted")
CONFIRMS = ("full", "partial", "none")

BASE_POINTS = {"full": 70, "partial": 45, "paywalled": 20, "fetch_error": 15, "not_attempted": 0}
GRADE_A_UNREAD_BUMP = 10
UNREAD_QUALITIES = ("paywalled", "fetch_error")

# tier (1-5) x confirms (full/partial/none) -> points. Tier order mirrors the user's required priority:
# 1 official company/IR/exchange, 2 regulator/filing, 3 Tier 1/2 media, 4 specialist finance blogs, 5 X/Twitter.
TIER_POINTS = {
    1: {"full": 45, "partial": 25, "none": 0},
    2: {"full": 40, "partial": 22, "none": 0},
    3: {"full": 30, "partial": 16, "none": 0},
    4: {"full": 15, "partial": 8, "none": 0},
    5: {"full": 6, "partial": 3, "none": 0},
}
MULTI_SOURCE_BONUS_PER_SOURCE = 5
MULTI_SOURCE_BONUS_CAP = 10
CONFIRMED_MIN_ALT_POINTS = 30  # a tier 1-3 "full" confirm scores >= 30 — the confirmed threshold


def _alt_points(tier: int, confirms: str) -> int:
    return TIER_POINTS.get(tier, {}).get(confirms, 0)


def score(source_grade: str, primary_read_quality: str, alternate_sources: list[dict], threshold: int = 35) -> dict:
    """Pure scoring function — no I/O. Returns {confirmation_status, extraction_confidence, gate_pass,
    base_points, credibility_bump, best_alt_points, multi_source_bonus} (the last four for the agent's
    visible-arithmetic line, MODULE_RULES.md style: 'state the math in one line')."""
    if source_grade not in SOURCE_GRADES:
        raise ValueError(f"source_grade must be one of {SOURCE_GRADES}, got {source_grade!r}")
    if primary_read_quality not in READ_QUALITIES:
        raise ValueError(f"primary_read_quality must be one of {READ_QUALITIES}, got {primary_read_quality!r}")

    base_points = BASE_POINTS[primary_read_quality]
    credibility_bump = GRADE_A_UNREAD_BUMP if (source_grade == "A" and primary_read_quality in UNREAD_QUALITIES) else 0

    scored = []
    for alt in alternate_sources:
        tier = int(alt["tier"])
        confirms = alt["confirms"]
        if tier not in TIER_POINTS:
            raise ValueError(f"tier must be 1-5, got {tier!r}")
        if confirms not in CONFIRMS:
            raise ValueError(f"confirms must be one of {CONFIRMS}, got {confirms!r}")
        scored.append((tier, confirms, _alt_points(tier, confirms)))

    corroborating = [s for s in scored if s[2] > 0]
    best = max(corroborating, key=lambda s: s[2]) if corroborating else None
    best_alt_points = best[2] if best else 0
    multi_source_bonus = min(MULTI_SOURCE_BONUS_CAP, MULTI_SOURCE_BONUS_PER_SOURCE * max(0, len(corroborating) - 1))

    extraction_confidence = max(0, min(100, base_points + credibility_bump + best_alt_points + multi_source_bonus))

    if primary_read_quality == "full":
        confirmation_status = "confirmed"
    elif best is not None and best_alt_points >= CONFIRMED_MIN_ALT_POINTS:
        confirmation_status = "confirmed"
    elif primary_read_quality == "partial" or best is not None:
        confirmation_status = "partially_confirmed"
    elif not corroborating and primary_read_quality in ("paywalled", "fetch_error") and source_grade == "A":
        confirmation_status = "headline_only"
    else:
        confirmation_status = "unconfirmed"

    # Hard rule: a lone tier-5 (X/Twitter) alternate is weak/secondary only — never sole confirmation.
    # `corroborating` must be non-empty here too: all() over an empty list is vacuously True, which would
    # otherwise wrongly demote a primary_read_quality=="full" confirmation that has zero alternates at all.
    if confirmation_status == "confirmed" and corroborating and all(s[0] == 5 for s in corroborating):
        confirmation_status = "partially_confirmed"

    gate_pass = confirmation_status != "unconfirmed" and extraction_confidence >= threshold

    return {
        "confirmation_status": confirmation_status,
        "extraction_confidence": extraction_confidence,
        "gate_pass": gate_pass,
        "base_points": base_points,
        "credibility_bump": credibility_bump,
        "best_alt_points": best_alt_points,
        "multi_source_bonus": multi_source_bonus,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--source-grade", required=True, choices=SOURCE_GRADES)
    ap.add_argument("--primary-read-quality", required=True, choices=READ_QUALITIES)
    ap.add_argument("--alternate-sources-json", default="[]", help='[{"tier":1,"confirms":"full"}, ...]')
    ap.add_argument("--threshold", type=int, default=35)
    ap.add_argument("--json", action="store_true", help="print the full result dict instead of a one-liner")
    a = ap.parse_args()

    try:
        alt_sources = json.loads(a.alternate_sources_json)
    except json.JSONDecodeError as e:
        print(f"--alternate-sources-json is not valid JSON: {e}", file=sys.stderr)
        return 2

    try:
        result = score(a.source_grade, a.primary_read_quality, alt_sources, a.threshold)
    except (ValueError, KeyError, TypeError) as e:
        print(f"invalid evidence packet: {e}", file=sys.stderr)
        return 2

    if a.json:
        print(json.dumps(result))
    else:
        print(
            f"confirmation_status={result['confirmation_status']} "
            f"extraction_confidence={result['extraction_confidence']} "
            f"gate_pass={result['gate_pass']}"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
