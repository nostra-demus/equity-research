# Signal Gate Synthesis — SIG-20260804-da21208a

## Abstract

Grab Holdings, Southeast Asia's biggest ride-hailing and delivery company, raised its full-year 2026 revenue and profit guidance, beat its second-quarter revenue estimate, and announced a new $750 million share buyback, all reported by Reuters on 3 August 2026. This is the first time Grab has appeared in the signal ledger, so the event is entirely new. It scores 86 out of 100 on materiality — a Tier-1 wire source, a real guidance change with a capital-return action, and no penalties of any kind. The signal moves to the thesis pipeline.

## 1. Gauntlet Summary (inherited)

| Step | Result |
|---|---|
| Gate 0 | grade A, Reuters |
| Relevance | material (0.95) |
| Event types | earnings_revenue_margin, guidance_change, capital_actions |
| Filing type | unknown_filing (no override) |
| Linkage | primary_issuer |
| Similarity / pair | < 0.78 (new) → new_event |
| Fact delta | 0.00 (no prior record to diff against) |
| Confirmation upgrade | false |
| Novelty | 0.85 |
| Generic media | false — none matched |

## 2. Step 9 — Canonical Handling

- Best prior match: none — the ledger (17 lines, whole history) has zero hits for "Grab," "Grab Holdings," or any ride-hailing/delivery peer name, and the newest prior ledger entry predates this signal by 19+ days.
- Priority comparison: not applicable — there is no competing record to rank against on official status, source tier, fact richness, or timestamp.
- **action:** keep_separate

## 3. Step 10 — Materiality

| Component | Value | Max | Reason |
|---|---|---|---|
| Source quality | 20 | 20 | Tier 1 source, body readable or no paywall issue. |
| Event materiality | 20 | 20 | Base 14 (material relevance) + severity add-on 6 (earnings_revenue_margin, guidance_change, capital_actions). |
| Company / portfolio relevance | 16 | 20 | Public issuer, primary_issuer (16) + portfolio-position bonus 0. |
| Specificity | 15 | 15 | Raw 15, no corroboration cap applies. |
| Estimate / valuation impact | 15 | 15 | Raw 15, no corroboration cap applies. |
| Theme / macro | 0 | 10 | No macro/theme angle — single-name event. |
| Routine filing penalty (from filing_type) | 0 | -20 | filing_type 'unknown_filing' — not a routine-filing derate category. |
| Generic media penalty (from is_generic_media) | 0 | -15 | Not flagged generic media (is_generic_media=false). |
| Private/unlisted irrelevance penalty | 0 | -15 | Issuer is public; penalty not applicable. |
| Duplicate / stale penalty | 0 | -25 | pair_label 'new_event' — not a duplicate/stale repeat. |
| Low-confidence extraction penalty | 0 | -10 | relevance_confidence 0.95 >= 0.80, source tier 1 or corroborated. |

**Final score: 86/100** — The largest positive driver is a tie between source quality (20/20, a Tier-1 Reuters wire) and event materiality (20/20, a material guidance raise plus a new buyback); there is no penalty at all, so the score is held below the maximum only by the 0/10 theme score for this purely single-name, non-thematic event.

Source 20/20 + Event 20/20 + Company 16/20 + Specificity 15/15 + Estimate 15/15 + Theme 0/10 − penalties 0 = 86/100.

Source tier: 1 (Tier 1 source, body readable or no paywall issue.)

### Step 10a — Portfolio/theme lookup

- **portfolio_position:** false — grepped `screener/ledger/theses/*.json` (9 records) for "grab" (case-insensitive); no match. There is no open or locked thesis on Grab today.
- **live_theme_match:** false — `screener/board/themes_index.json` currently lists 0 active/hot/cooling/parked themes (314 retired, 0 live). With no live theme on the board, this event cannot match one; stated explicitly rather than skipped.

## 4. Decision

This signal routes to PROMOTE. Grab is a publicly listed primary issuer reporting a genuine guidance raise, a revenue beat, and a new $750 million buyback through a Tier-1 wire (Reuters), with no prior ledger record to derate against and no generic-media or routine-filing flags. The 86/100 score clears the 70-point promotion band comfortably, so the signal proceeds to the thesis pipeline.

## Machine Output

Wrote: `screener/runs/SIG-20260804-da21208a/signal_payload.json` (validates against frameworks/screener/signal_payload.schema.json)
Ledger: appended SIG-20260804-da21208a to screener/ledger/events.ndjson; board index refreshed.

## Routing

Materiality below is the Step 10b final score (post-derate where applicable).

Routing: PROMOTE
Materiality: 86
Next module: thesis-structure
