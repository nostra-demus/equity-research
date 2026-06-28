# Signal Gate Synthesis — SIG-20260628-af776402

## Abstract

Forrestania, a gold mining company, has agreed to buy the Edna May gold mine from ASX-listed Ramelius Resources for A$300 million. This is the first time this deal appears in the ledger — no prior record of Ramelius, Forrestania, or Edna May exists in the 7-day window. The deal directly changes Ramelius's cash balance, asset base, and gold production profile, which are all things that can move investment decisions. Materiality scores 85 out of 100 and the signal routes to the thesis pipeline.

## 1. Gauntlet Summary (inherited)

| Step | Result |
|---|---|
| Gate 0 | Grade A, Australian Financial Review |
| Relevance | material (0.90) |
| Event types | mna, capital_actions, operations |
| Linkage | primary_issuer |
| Similarity / pair | new (0.00) → new_event |
| Fact delta | 0.00 (no prior record; no changed fields) |
| Confirmation upgrade | false |
| Novelty | 0.85 |

## 2. Step 9 — Canonical Handling

- Best prior match: none — 0 ledger entries for Ramelius Resources, Forrestania, or Edna May across the full 7-day window
- Priority comparison: no prior record exists; this signal stands alone with no candidate for replacement or suppression
- **action:** keep_separate

## 3. Step 10 — Materiality

Base 72 (A$300m M&A, primary issuer, operations-changing asset sale) + novelty 13 (0.85 × 15) − penalties 0 (new_event, no duplicate) + overrides 0 = **85/100**

## 4. Decision

The signal routes PROMOTE. Ramelius Resources is an ASX-listed gold miner and Edna May is a named, operating mine; a A$300m disposal is large enough relative to any mid-cap miner's balance sheet to change revenue forecasts, net asset value, and capital-return expectations. That single fact — a confirmed, priced, operating-asset transaction — is the most decision-relevant point here.

## Machine Output

Wrote: `screener/runs/SIG-20260628-af776402/signal_payload.json` (validates against frameworks/screener/signal_payload.schema.json)
Ledger: appended SIG-20260628-af776402 to screener/ledger/events.ndjson; board index refreshed.

## Routing

Routing: PROMOTE
Materiality: 85
Next module: thesis-structure
