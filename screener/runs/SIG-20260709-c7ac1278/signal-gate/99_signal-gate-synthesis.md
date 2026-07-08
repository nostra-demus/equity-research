# Signal Gate Synthesis — SIG-20260709-c7ac1278

## Abstract

Ascension Health's Tennessee subsidiary agreed to buy Williamson Health, an independent nonprofit hospital in Franklin, Tennessee, for approximately $1 billion — a first-seen deal with no prior ledger match and a novelty score of 0.85. The event materiality component maxed out at 20/20 (the highest-severity M&A event type, fully quantified), but company relevance is held to 11/20 because both primary parties are private nonprofits; the public-market link runs only through HCA Healthcare and Optum as losing bidders. The final materiality score is 64/100, placing the signal in the PARK band. No human override is present, so the signal is recorded in the ledger and shown on the board as Parked.

## 1. Gauntlet Summary (inherited)

| Step | Result |
|---|---|
| Gate 0 | grade A, Fierce Healthcare |
| Relevance | material (0.92) |
| Event types | mna |
| Filing type | material_exchange_filing (override hit: mna keyword) |
| Linkage | primary_issuer |
| Similarity / pair | 0.00 (new) → new_event |
| Fact delta | 0.00 (no prior event) |
| Confirmation upgrade | false |
| Novelty | 0.85 |
| Generic media | false — none matched |

## 2. Step 9 — Canonical Handling

- Best prior match: none — all 12 ledger events cover unrelated issuers; grep across Ascension, Williamson Health, HCA Healthcare, UnitedHealth, Optum returned zero matches in the 48h, 7-day, and all-time windows.
- Priority comparison: no prior event exists to compare against on any criterion (official status, source tier, fact richness, or timestamp).
- **action:** keep_separate

## 3. Step 10 — Materiality

| Component | Value | Max | Reason |
|---|---|---|---|
| Source quality | 13 | 20 | Tier 2 source, body readable or no paywall issue. |
| Event materiality | 20 | 20 | Base 14 (material relevance) + severity add-on 6 (mna). |
| Company / portfolio relevance | 11 | 20 | Private/unlisted issuer scored on evidenced linkage 'competitor_informative_to_public_company' (11) + portfolio-position bonus 0. |
| Specificity | 15 | 15 | Raw 15, no corroboration cap applies. |
| Estimate / valuation impact | 5 | 15 | Raw 5, no corroboration cap applies. |
| Theme / macro | 0 | 10 | No macro/theme angle — single-name event. |
| Routine filing penalty (from filing_type) | 0 | -20 | filing_type 'material_exchange_filing' — not a routine-filing derate category. |
| Generic media penalty (from is_generic_media) | 0 | -15 | Not flagged generic media (is_generic_media=false). |
| Private/unlisted irrelevance penalty | 0 | -15 | Evidenced linkage present (competitor_informative_to_public_company); the no-linkage penalty does not apply. |
| Duplicate / stale penalty | 0 | -25 | pair_label 'new_event' — not a duplicate/stale repeat. |
| Low-confidence extraction penalty | 0 | -10 | relevance_confidence 0.92 >= 0.80, source tier 2 or corroborated. |

**Final score: 64/100** — The event materiality component maxed out at 20/20 — a first-seen billion-dollar M&A deal is the highest-severity event type — and specificity reached 15/15 with hard dollar figures and named counterparties. The company relevance is held to 11/20 because both primary issuers (Ascension Health and Williamson Health) are private nonprofits and the public-company linkage is indirect (HCA Healthcare and Optum as losing bidders), which is the single largest drag on the score.

Source 13/20 + Event 20/20 + Company 11/20 + Specificity 15/15 + Estimate 5/15 + Theme 0/10 − penalties 0 = 64/100.

Source tier: 2 (Tier 2 source, body readable or no paywall issue.)

## 4. Decision

The signal scores 64 and routes to PARK. The deal is real, well-documented, and fully quantified — the M&A event type and specificity together deliver 35 points — but the primary issuers are private nonprofits, so the public-market relevance depends entirely on HCA Healthcare and Optum being the losing bidders, which limits company relevance to 11 of a possible 20 points and keeps the total two points below the 70-point PROMOTE line. A human with an open HCA or UNH thesis can re-launch this signal with `override_promote: true` to send it directly into Phase 1.

## Machine Output

Wrote: `screener/runs/SIG-20260709-c7ac1278/signal_payload.json` (validates against frameworks/screener/signal_payload.schema.json)
Ledger: appended SIG-20260709-c7ac1278 to screener/ledger/events.ndjson; board index refreshed.

## Routing

Materiality below is the Step 10b final score (post-derate where applicable).

Routing: PARK
Materiality: 64
Next module: none
