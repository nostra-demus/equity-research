# Signal Gate Synthesis — SIG-20260616-8930aad4

## Abstract

Tata Consultancy Services (TCS) will book a $70 million one-off charge against its Q1 FY27 earnings after the US Supreme Court rejected the company's final appeal in a lawsuit filed by DXC Technology. No prior ledger entry covers TCS or DXC, so this is a first-seen event with a novelty score of 0.85. The charge is quantified, reduces reported earnings directly, and cannot be appealed further. The materiality score is 85 out of 100, and the signal routes to Phase 1 for thesis work.

## 1. Gauntlet Summary (inherited)

| Step | Result |
|---|---|
| Gate 0 | Grade A, NDTV Profit |
| Relevance | material (0.93) |
| Event types | litigation_enforcement, earnings_revenue_margin |
| Linkage | primary_issuer |
| Similarity / pair | 0.00 → new_event |
| Fact delta | 0.00 (no prior record to compare) |
| Confirmation upgrade | false |
| Novelty | 0.85 |

## 2. Step 9 — Canonical Handling

- Best prior match: none — the 72-hour ledger window contains zero entries for TCS or DXC Technology
- Priority comparison: no prior canonical record exists, so no priority ordering is needed; this signal stands alone
- **action:** keep_separate

## 3. Step 10 — Materiality

Base 72 (material relevance 0.93, direct primary issuer, $70M quantified exceptional charge, Supreme Court rejection is final and no further appeals are possible) + novelty 13 (0.85 × 15) − penalties 0 (new_event, no prior match) + overrides 0 = **85/100**

## 4. Decision

The signal routes PROMOTE. The single most important fact is that the $70 million charge is certain — the US Supreme Court's rejection of TCS's appeal ends the legal process, locking in the hit to Q1 FY27 reported earnings with no further avenue to contest it.

## Machine Output

Wrote: `screener/runs/SIG-20260616-8930aad4/signal_payload.json` (validates against frameworks/screener/signal_payload.schema.json)
Ledger: appended SIG-20260616-8930aad4 to screener/ledger/events.ndjson; board index refreshed.

## Routing

Routing: PROMOTE
Materiality: 85
Next module: thesis-structure
