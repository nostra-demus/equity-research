# Generic Media Detection — SIG-20260804-da21208a

## 1. Category Detection

| Category | Tagged | Evidence (one line) |
|---|---|---|
| market_cap_roundup | no | Only one company (Grab Holdings) is named; no aggregate market-cap tally across 3+ companies or an index appears anywhere in the article. |
| index_movement_summary | no | The subject is Grab's own share move ("shares...up 4% in extended trading"), not an index level/points/% move. |
| top_gainers_losers | no | No ranked gainers/losers list — the article is a single-name earnings and guidance story. |
| generic_market_close | no | No "markets closed higher/lower" daily-wrap framing; the piece opens and stays on Grab's guidance raise. |
| many_companies_no_thesis | no | Only one company (Grab) is named throughout — far below the 4+ company threshold, and the article ties the headline directly to Grab-specific numbers. |
| lacks_specificity_quantifiability | no | Multiple precise, checkable figures tied to one attributable subject: FY26 revenue guidance raised to $4.10-$4.15bn (from $4.04-$4.10bn), EBITDA guidance to $720-$740m (from $700-$720m), Q2 revenue $997m (vs $990.8m estimate, +22% YoY), GMV $6.5bn (+21%), and a new $750m buyback [Reuters, 2026-08-03]. |

## 2. Scores

| Field | Score | One-line reason |
|---|---|---|
| specificity_score | 95 | Names exactly one company (Grab Holdings) tied to one distinct, attributable set of events — a guidance raise, a Q2 beat, and a buyback announcement — with no dilution across other names. |
| quantifiability_score | 95 | Every figure (guidance ranges, Q2 revenue/estimate beat, GMV growth, buyback size, share-price reaction) is a precise, checkable number attached to Grab as the sole causal subject, not an aggregate tally. |
| investability_score | 90 | A guidance raise above prior market estimates plus a new $750m buyback is exactly the kind of fact that would change a PM's view of this specific name — a real driver, not decoration. |

## 3. Verdict

- **is_generic_media:** false
- **generic_media_reason:** None of the six categories matched — the article is a single-company (Grab Holdings) story built entirely around attributable, quantified facts (raised FY26 revenue/EBITDA guidance, a Q2 revenue beat, GMV growth, and a new $750m buyback), with no aggregate market-cap tally, no index framing, no gainers/losers list, and no undifferentiated multi-company roundup.

Verdict: false, specificity 95, quantifiability 95, investability 90
