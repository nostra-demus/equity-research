# Generic Media Detection — SIG-20260716-1f0ddd45

## 1. Category Detection

| Category | Tagged | Evidence (one line) |
|---|---|---|
| market_cap_roundup | no | No company or aggregate market-cap figures appear anywhere in the article; this is a geopolitical/military story with no equity-market tally. |
| index_movement_summary | no | No index level, points, or percentage move is mentioned at all — the subject is a threatened blockade/strike escalation, not an index headline. |
| top_gainers_losers | no | No ranked list of gainers/losers or any named company appears in the text. |
| generic_market_close | no | No "markets closed higher/lower" daily-wrap framing; the article is a live-escalation report with named military and state actors. |
| many_companies_no_thesis | no | Zero companies are named — the entities are state/military actors (Iran/IRGC, US, Bahrain, Kuwait, Jordan), not a company list. |
| lacks_specificity_quantifiability | no | The article names two specific chokepoints (Strait of Hormuz, Bab el-Mandeb), a specific new US action (naval blockade reimposed, fresh strikes), specific struck sites (military installations in Bahrain, Kuwait, Jordan), and a direct IRGC quote ("Regional energy exports are either shared by all, or denied to all") — this is a checkable, dated, attributable causal chain, not generic descriptive language. |

## 2. Scores

| Field | Score | One-line reason |
|---|---|---|
| specificity_score | 70 | Names one specific, ongoing conflict with one attributable actor (Iran/IRGC) and two named chokepoints as the mechanism — not a market-wide or multi-company story, though the "subject" is a country/sector-level supply threat rather than a single company. |
| quantifiability_score | 65 | Concrete, checkable facts are present (named chokepoints, named countries struck, blockade reimposition, dated escalation timeline) but there is no numeric quantum yet (no barrels/day at risk, no price move, no % figure) — the threat itself is precisely described, the economic magnitude is not. |
| investability_score | 75 | A credible threat to close the Strait of Hormuz and Bab el-Mandeb — the two chokepoints carrying the bulk of seaborne oil and gas trade — is exactly the kind of fact that would move a PM's view on energy, shipping, tanker-freight, and insurance names/sectors if confirmed; the source itself states supply has already been "severely disrupted" and inflation concerns raised. |

## 3. Verdict

- **is_generic_media:** false
- **generic_media_reason:** None of the six categories matched — the article carries a specific, attributable, dated geopolitical-military escalation (IRGC threat to close the Strait of Hormuz and Bab el-Mandeb, following a reimposed US naval blockade and strikes on named sites in Bahrain, Kuwait, and Jordan), not market-wide, index-level, or undifferentiated multi-company commentary.

Verdict: false, specificity 70, quantifiability 65, investability 75
