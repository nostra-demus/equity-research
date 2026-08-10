# Model Paper-Portfolio — 2026-08-10

**Scope:** all standing ledger decisions. **Disclaimer:** this is an illustrative model paper-portfolio for the engine's own process-feedback tracking — the same simulated basis as the decision ledger's paper trades. It is NOT investment advice and NOT a recommendation to any person to buy or sell, and it places no orders.

## Book: no positions — 9 names on watch (10 decision records), 100% cash

Every one of the 10 standing decisions in the ledger (`scripts/ledger_records.py --standing-json`, corrections applied, superseded runs dropped) is **Watchlist**, **Avoid**, or **Short Candidate** — none carry a **Selected** basket (Strong Buy / Buy / Starter Position), so no name reaches the long-eligibility bar. The single Short Candidate, TSLA, would otherwise be eligible (positive expected return, edge_score 40) — but its truth-integrity status is `provisional` (an active finish-gate banner on `verification_report.json`, verdict "Minor issues"), and the sizing rule gates a paper short exactly as it gates a long. So TSLA is excluded and carried on the watch list instead. Change since 2026-08-09: a new UBER run (UBER_2026-08-09) has now completed and stands in the ledger alongside UBER_2026-08-06 as a separate decision record (not a correction of the earlier one) — both are Watchlist, so this is 9 unique companies across 10 records, with no net portfolio effect.

- **Gross exposure:** 0%
- **Cash:** 100%
- **Largest name / top-3 concentration:** n/a — no positions
- **Correlation flags:** not applicable at the position level. Worth flagging on the watch list itself: BG and NHY are both commodity/policy-conditional theses; SMPL, TMCV, and both UBER records all carry an active RF-CAP-004 serial-acquirer capital-allocation flag (§24 Filter 4); EMAAR and NHY both carry an RF-OWN-004 unaligned-controlling-owner cap (§24 Filter 6). If any two of these clear their triggers together, size the combined exposure as one correlated bet, not two independent ones. The two UBER records are the same company, not two names — one correlation unit.

## Watch list — the size-in triggers

| Ticker | Decision | Size-in trigger | Next review |
|---|---|---|---|
| AMZN | Watchlist | Re-entry at $190-200 (>12% margin of safety on base fair value $210). Jul-31-2026 Q2 print was the first real test of the AWS D&A billing-lag hypothesis — not yet folded into a new run. | 2026-10-08 (90d; 30d checkpoint of 2026-08-09 elapsed with no new run) |
| BG | Watchlist | Re-rate to Starter Position Only only on a pool-confirmed price below ~$100, or a clean post-Viterra FY2026 cash-conversion print. | 2026-08-30 |
| EMAAR | Watchlist | Starter long only if pre-sales hold ≥+16% YoY and the discount begins to close, or on primary evidence the Government-of-Dubai owner (or founder-MD) treats minorities as value-owners. Q2 2026 print (est. 10-Aug-2026) is due today. | 2026-10-08 (90d; 30d checkpoint of 2026-08-09 elapsed with no new run) |
| HCG | Avoid | Re-underwrite only at/below INR 520, or on two consecutive clean prints showing ROIC rising toward the cost of capital. | 2026-08-30 |
| NHY | Watchlist | Revisit only if price falls toward/below the NOK 70-82 fair-value band, or if the Alumetal impairment / Brazil tax risk clears without damage. Watch the 23-Oct-2026 print (22-Jul print has passed). | 2026-08-18 |
| SMPL | Watchlist | Revisit after the Oct-23-2026 FQ4 print and the Sept-2026 price increase's elasticity result (visible in the FQ1 FY2027 print). | 2026-09-05 |
| TMCV | Watchlist | Re-rate when the Iveco financing structure is confirmed and the TMF Holdings AGM vote outcome is known. | 2026-09-05 |
| TSLA | Short Candidate | Excluded this cycle (integrity `provisional`). Underlying short thesis: small, defined-risk short (long-dated puts / put spreads) once integrity clears provisional. | 2026-08-24 |
| UBER (run 2026-08-06) | Watchlist | Track the FQ3 2026 print (~Oct 2026) and Delivery Hero bridge-facility covenant terms once disclosed. RF-CAP-004 (serial-acquirer, Critical) caps the rating at Watchlist regardless of edge score. | 2026-11-04 |
| UBER (run 2026-08-09) | Watchlist | Do not initiate. Track the Q3 FY2026 print (Nov-03-2026) and Delivery Hero bridge-facility terms (expected end-Sep-2026); revisit once the derivative lawsuit reaches a motion-to-dismiss ruling or the bridge is termed out. Two Critical red flags (RF-MGT-005, RF-CAP-004) cap conviction at Watchlist with no edge-score bypass. | 2026-11-07 |

## Why nothing is sized

The sizing rule (fractional-Kelly on edge × downside, scaled by conviction) only ever applies to a **Selected** basket (Strong Buy / Buy / Starter) with positive probability-weighted expected return, a proven edge, and non-`provisional` truth-integrity. None of the 10 records clear that bar:

- 8 of 10 are already capped at Watchlist or below by a structural rating cap (§24 unaligned-owner or serial-acquirer filters, edge-score gates, or valuation/governance caps) — none reach Buy.
- HCG is an explicit Avoid (Rejected basket) on negative expected return and a governance cap.
- TSLA is the only Short Candidate with a supportive thesis and positive expected return, but is integrity-gated `provisional` and therefore not sized.

This is the discipline working as intended: the model book stays in cash rather than forcing a position onto names that don't clear the bar.

*A 90-day checkpoint (AMZN, EMAAR) falls due today, 2026-08-10 — no action required unless a fresh run changes the underlying decision record. UBER now carries two standing decision records (2026-08-06, 2026-08-09); both are Watchlist and neither changes the book.*
