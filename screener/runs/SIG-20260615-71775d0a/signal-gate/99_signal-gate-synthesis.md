# Signal Gate Synthesis — SIG-20260615-71775d0a

## Abstract

Honeywell International's board formally approved the spin-off of Honeywell Aerospace on June 15, 2026, creating two separately listed companies — Honeywell Aerospace (HONA) and the renamed Honeywell Technologies (HON) — with distribution set for June 29. Nothing like this appeared in the ledger for any Honeywell entity in the prior 72-hour or 7-day window, making this a fully new event. Materiality scores at 93 out of 100 on the strength of a major capital-structure change, direct company-level impact, and Grade-A source. The signal promotes to thesis structure.

## 1. Gauntlet Summary (inherited)

| Step | Result |
|---|---|
| Gate 0 | Grade A, PR Newswire (company-issued board-resolution release) |
| Relevance | material (0.98) |
| Event types | capital_actions, mna, management |
| Linkage | primary_issuer |
| Similarity / pair | new (0.00) → new_event |
| Fact delta | 0.00 (no prior event; null baseline) |
| Confirmation upgrade | false |
| Novelty | 0.85 |

## 2. Step 9 — Canonical Handling

- Best prior match: none — ledger search across all Honeywell entity names, HON, HONA, "spin-off", and "aerospace" returned zero results across both the 72-hour and 7-day windows. The five existing ledger entries cover the RBI rate cut, a Gulf LNG force majeure, and Intel analyst upgrades — no issuer overlap.
- Priority comparison: no competing record exists, so no priority tiebreak is needed.
- **action:** keep_separate

## 3. Step 10 — Materiality

Base 75 (major capital-structure change, direct primary issuer, material relevance 0.98) + novelty 13 (0.85 × 15) − penalties 0 (new_event, no prior match) + override 5 (Grade-A official company press release, board-approved resolution) = **93/100**

## 4. Decision

This is a board-approved split of one of the largest US industrial conglomerates into two independently listed companies, with a firm distribution date of June 29, 2026 and an immediate reverse stock split on the remaining entity. The event is company-direct, confirmed via an official board resolution, first-seen in the ledger, and scores 93 — well above the 70-point threshold for full promotion to the thesis pipeline.

## Machine Output

Wrote: `screener/runs/SIG-20260615-71775d0a/signal_payload.json` (validates against frameworks/screener/signal_payload.schema.json)
Ledger: appended SIG-20260615-71775d0a to screener/ledger/events.ndjson; board index refreshed.

## Routing

Routing: PROMOTE
Materiality: 93
Next module: thesis-structure
