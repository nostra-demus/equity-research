# Signal Gate Synthesis — SIG-20260716-070c5069

## Abstract

Dubai's total residential property sales value fell 16% year-on-year to AED 225.7 billion in the first half of 2026, per real-estate consultancy Anarock, which pinned the drop on regional geopolitical tension but called the effect "sentiment-driven, not structural." No single company is named, and average price per square foot actually rose over the same period. This is a genuinely new event with no matching prior ledger record, but it names no issuer and carries no distinguishable single-entity fact — it scores 2 out of 100 on materiality and is only logged, not sent to the thesis pipeline.

## 1. Gauntlet Summary (inherited)

| Step | Result |
|---|---|
| Gate 0 | grade B, Outlook Business |
| Relevance | relevant_non_material (0.60) |
| Event types | macro_sector |
| Filing type | unknown_filing (no override) |
| Linkage | macro_only |
| Similarity / pair | < 0.78 (0.00) → new_event |
| Fact delta | 0.00 (no fields — no prior record to diff against) |
| Confirmation upgrade | false |
| Novelty | 0.85 |
| Generic media | true — lacks_specificity_quantifiability |

## 2. Step 9 — Canonical Handling

- Best prior match: none — the ledger search (72h window widened to 7 days, terms `dubai`, `anarock`, `uae`, `real estate`/`residential`/`property`, `west asia`) returned zero hits across a 16-line ledger.
- Priority comparison: not applicable — there is no candidate record to compare against on official status, source tier, fact richness, or timestamp.
- **action:** keep_separate

## 3. Step 10a — Portfolio / Theme Lookup

- `portfolio_position`: false — no primary issuer exists to check against `screener/ledger/theses/*.json` (the three theses with a "real estate" hit are Hong Kong and other non-Dubai property names, no overlap). No open/locked thesis touches Dubai residential real estate.
- `live_theme_match`: false — `screener/board/themes_index.json` carries no theme tagged to Dubai / UAE residential property (the closest is `THM-79ff4e58 Kuwait · iran`, a different subject, and `THM-cb718473 Oberoi Realty Ltd · housing`, an Indian company, not Dubai).

## 4. Step 10 — Materiality

| Component | Value | Max | Reason |
|---|---|---|---|
| Source quality | 2 | 20 | Tier 4 source, body readable or no paywall issue. |
| Event materiality | 7 | 20 | Base 4 (relevant_non_material relevance) + severity add-on 3 (macro_sector). |
| Company / portfolio relevance | 2 | 20 | Public issuer, macro_only (2) + portfolio-position bonus 0. |
| Specificity | 6 | 15 | Raw 9 capped at 6 — uncorroborated and (paywalled or low-tier source). |
| Estimate / valuation impact | 0 | 15 | Raw 0 capped at 6 — uncorroborated and (paywalled or low-tier source). |
| Theme / macro | 5 | 10 | sector-wide move (+5). |
| Routine filing penalty (from filing_type) | 0 | -20 | filing_type 'unknown_filing' — not a routine-filing derate category. |
| Generic media penalty (from is_generic_media) | -15 | -15 | Generic media (investability 8, avg specificity/quantifiability 16) classified 'content_farm' (-15). |
| Private/unlisted irrelevance penalty | 0 | -15 | Issuer is public; penalty not applicable. |
| Duplicate / stale penalty | 0 | -25 | pair_label 'new_event' — not a duplicate/stale repeat. |
| Low-confidence extraction penalty | -5 | -10 | relevance_confidence 0.60 in [0.50, 0.80). |

**Final score: 2/100** — The largest positive driver is event materiality (7/20, from a relevant-but-non-material macro/sector tag), but a -15 generic-media penalty (a city-wide Dubai housing aggregate with no company named and no attributable single-entity cause) dominates and drives the final score down to 2/100.

Source 2/20 + Event 7/20 + Company 2/20 + Specificity 6/15 + Estimate 0/15 + Theme 5/10 − penalties 20 = 2/100.

Source tier: 4 (Tier 4 source, body readable or no paywall issue — "Outlook Business" is not in the Tier 1-3 mapping and the Gate 0 grade is B, not A, so it defaults to the unknown/low-quality fallback tier).

## 4. Decision

This routes to LOG. The event is real and new — no ledger record matches it — but it is a city-wide Dubai housing statistic with no named company, no primary issuer, and no attributable single-entity driver (Anarock's own CEO calls the effect "sentiment-driven, not structural"). The generic-media penalty and the lack of any company linkage push the score to 2, well below the PARK floor of 40.

## Machine Output

Wrote: `screener/runs/SIG-20260716-070c5069/signal_payload.json` (validates against frameworks/screener/signal_payload.schema.json)
Ledger: appended SIG-20260716-070c5069 to screener/ledger/events.ndjson; board index refreshed.

## Routing

Materiality below is the Step 10b final score (post-derate where applicable).

Routing: LOG
Materiality: 2
Next module: none
