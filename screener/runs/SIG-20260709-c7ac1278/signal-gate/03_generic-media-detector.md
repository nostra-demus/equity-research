# Generic Media Detection — SIG-20260709-c7ac1278

## 1. Category Detection

| Category | Tagged | Evidence (one line) |
|---|---|---|
| market_cap_roundup | no | Article is about a single deal between two named parties, not an aggregate market-cap move across multiple companies. |
| index_movement_summary | no | No index level or points move is discussed. |
| top_gainers_losers | no | No ranked gainers/losers list present. |
| generic_market_close | no | No daily market-close wrap framing. |
| many_companies_no_thesis | no | Four companies appear (Ascension, Williamson, HCA, Optum) but each has a specific attributed role: Ascension = buyer; Williamson = target; HCA and Optum = losing bidders with named bid details — not an undifferentiated list. |
| lacks_specificity_quantifiability | no | Article states $700M purchase price, $235M facility/EHR investment over 10 years, $140M strategic projects over five years, $20M routine capex, and Williamson's own $150M capital need — all tied to a single attributable deal. |

## 2. Scores

| Field | Score | One-line reason |
|---|---|---|
| specificity_score | 90 | One buyer (Ascension Saint Thomas), one target (Williamson Health, 30 locations, Franklin TN), one deal — every named party carries a distinct attributed role. |
| quantifiability_score | 88 | Multiple precise, checkable figures ($700M price, $235M capital, $140M strategic, $20M routine, $150M Williamson capital need) each tied to a specific causal driver within one transaction. |
| investability_score | 82 | A PM holding HCA Healthcare (NYSE: HCA) or UnitedHealth Group (NYSE: UNH) learns that HCA lost a $700M bid by losing on capital commitments ($210M vs $235M) — directly informative to HCA's M&A discipline and Tennessee market strategy; Optum's valuation ceiling for community hospital systems is also revealed. |

## 3. Verdict

- **is_generic_media:** false
- **generic_media_reason:** None of the 6 categories matched — the article carries a single, named, fully quantified M&A transaction (one buyer, one target, a $700M purchase price plus itemised capital commitments totalling ~$1B) with specific attributed roles for every company mentioned.

Verdict: false, specificity 90, quantifiability 88, investability 82
