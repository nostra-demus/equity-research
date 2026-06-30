# Generic Media Detection — SIG-20260610-a3f2c81d

> FIXTURE — hand-crafted golden example; not a live run output.

## 1. Category Detection

| Category | Tagged | Evidence (one line) |
|---|---|---|
| market_cap_roundup | no | The article is about a policy rate decision, not an aggregate market-cap tally. |
| index_movement_summary | no | No index level or points/% move is the subject. |
| top_gainers_losers | no | No ranked list of gainers/losers. |
| generic_market_close | no | Not a "markets closed higher/lower" daily-wrap piece. |
| many_companies_no_thesis | no | Only one entity is named — the RBI as policy authority — not an undifferentiated multi-company list. |
| lacks_specificity_quantifiability | no | Carries a precise 50 bps cut, an exact new rate (5.00%), and a 5-1 vote split, all tied to one named authority's one action. |

## 2. Scores

| Field | Score | One-line reason |
|---|---|---|
| specificity_score | 85 | One official authority (RBI MPC), one distinct, attributable action — an off-cycle rate cut. |
| quantifiability_score | 90 | Precise figures throughout: 50 bps, 5.00% new rate, 5-1 vote, May CPI 2.9%. |
| investability_score | 85 | An off-cycle policy cut mechanically reprices funding costs across every rate-sensitive sector immediately — a PM can act on this fact alone. |

## 3. Verdict

- **is_generic_media:** false
- **generic_media_reason:** None of the 6 categories matched — this is an official RBI policy action with a precise 50 bps cut, an exact new rate, and a named vote count, not a roundup, index summary, gainers/losers list, or undifferentiated multi-company piece.

Verdict: false, specificity 85, quantifiability 90, investability 85
