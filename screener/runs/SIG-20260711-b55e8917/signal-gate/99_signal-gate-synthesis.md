# Signal Gate Synthesis — SIG-20260711-b55e8917

## Abstract

The Motley Fool published a July 11, 2026 opinion piece predicting that Carvana's entry into new-car sales — via a $171 million acquisition of seven Stellantis dealerships — will succeed, citing early Casa Grande, Arizona data of 700+ new vehicles sold in May versus a prior average of 30–50. The article is a first-seen event in the ledger (novelty 0.85) with specific, checkable numbers and a clear primary-issuer link to a publicly traded company. However, the source is The Motley Fool, an unrecognized Tier 4 retail-investment opinion site, uncorroborated by any primary disclosure or wire-class source; this collapses source quality to 2/20 and caps specificity and estimate-impact at 6 each, producing a final materiality score of 34. The signal routes to LOG.

## 1. Gauntlet Summary (inherited)

| Step | Result |
|---|---|
| Gate 0 | Grade B, The Motley Fool |
| Relevance | relevant_non_material (0.72) |
| Event types | mna, commercial, product |
| Filing type | material_exchange_filing (no override) |
| Linkage | primary_issuer |
| Similarity / pair | 0.00 (< 0.78, no ledger match) → new_event |
| Fact delta | 0.00 (no prior record; first-seen) |
| Confirmation upgrade | false |
| Novelty | 0.85 |
| Generic media | false — none matched |

## 2. Step 9 — Canonical Handling

- Best prior match: none (ledger search on Carvana, CVNA, Stellantis, Ally Financial, AutoNation returned 0 matches across 14 records, 72-hour and 7-day windows)
- Priority comparison: no competing record exists; no canonical comparison required
- **action:** keep_separate

## 3. Step 10 — Materiality

| Component | Value | Max | Reason |
|---|---|---|---|
| Source quality | 2 | 20 | Tier 4 source, body readable or no paywall issue. |
| Event materiality | 10 | 20 | Base 4 (relevant_non_material relevance) + severity add-on 6 (mna, commercial, product). |
| Company / portfolio relevance | 16 | 20 | Public issuer, primary_issuer (16) + portfolio-position bonus 0. |
| Specificity | 6 | 15 | Raw 15 capped at 6 — uncorroborated and (paywalled or low-tier source). |
| Estimate / valuation impact | 5 | 15 | Raw 5 capped at 6 — uncorroborated and (paywalled or low-tier source). |
| Theme / macro | 0 | 10 | No macro/theme angle — single-name event. |
| Routine filing penalty (from filing_type) | 0 | -20 | filing_type 'material_exchange_filing' — not a routine-filing derate category. |
| Generic media penalty (from is_generic_media) | 0 | -15 | Not flagged generic media (is_generic_media=false). |
| Private/unlisted irrelevance penalty | 0 | -15 | Issuer is public; penalty not applicable. |
| Duplicate / stale penalty | 0 | -25 | pair_label 'new_event' — not a duplicate/stale repeat. |
| Low-confidence extraction penalty | -5 | -10 | relevance_confidence 0.72 in [0.50, 0.80). |

**Final score: 34/100** — Company relevance (16/20) is the largest positive contributor, reflecting Carvana as the direct primary issuer of a confirmed M&A event; the score is pulled below the LOG threshold mainly by The Motley Fool's Tier 4 source quality (2/20), which also caps specificity and estimate-impact at 6 each despite the article carrying precise, checkable figures.

Source 2/20 + Event 10/20 + Company 16/20 + Specificity 6/15 + Estimate 5/15 + Theme 0/10 − penalties 5 = 34/100.

Source tier: 4 (Tier 4 source, body readable or no paywall issue.)

## 4. Decision

This signal routes to LOG. The underlying event — Carvana's entry into new-car sales via the $171 million Stellantis dealership acquisition and early sales data of 700+ units at Casa Grande — is a real, company-specific development with a primary-issuer link and first-seen novelty. The deciding factor is the source: The Motley Fool falls into Tier 4 (not in the recognized Tier 1–3 map, Gate 0 Grade B), and no second on-list source corroborates the body-level figures, which caps specificity and estimate-impact at 6 each and reduces source quality to 2/20, leaving the total at 34 — below the 40-point PARK floor. If a primary source (an exchange filing, a wire article, or Carvana investor relations) confirms or extends the early dealership sales data, a re-submission would score materially higher.

## Machine Output

Wrote: `screener/runs/SIG-20260711-b55e8917/signal_payload.json` (validates against frameworks/screener/signal_payload.schema.json)
Ledger: appended SIG-20260711-b55e8917 to screener/ledger/events.ndjson; board index refreshed.

## Routing

Materiality below is the Step 10b final score (post-derate where applicable).

Routing: LOG
Materiality: 34
Next module: none
