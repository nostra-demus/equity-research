# Model Paper-Portfolio — 2026-08-20

**Scope:** all standing ledger decisions. **Disclaimer:** this is an illustrative model paper-portfolio for the engine's own process-feedback tracking — the same simulated basis as the decision ledger's paper trades. It is NOT investment advice and NOT a recommendation to any person to buy or sell, and it places no orders.

## Book: no positions — 12 names on watch (14 decision records), 100% cash

Every one of the 14 standing decisions in the ledger (`scripts/ledger_records.py --standing-json`, corrections applied, superseded runs dropped) is **Watchlist**, **Avoid**, or **Short Candidate** — none carry a **Selected** basket (Strong Buy / Buy / Starter Position), so no name reaches the long-eligibility bar. The single Short Candidate, TSLA, would otherwise be eligible (positive expected return, edge_score 40) — but its truth-integrity status is `provisional`, and the sizing rule gates a paper short exactly as it gates a long. So TSLA is excluded and carried on the watch list instead. No new decision records landed since the 2026-08-16 refresh — the standing ledger is unchanged (same 14 records, same 12 unique tickers).

- **Gross exposure:** 0%
- **Cash:** 100%
- **Largest name / top-3 concentration:** n/a — no positions
- **Correlation flags:** not applicable at the position level (no positions), but several overlaps are worth flagging on the watch list itself:
  - **UBER × DHER — direct corporate-event correlation, not just thematic.** DHER's thesis explicitly tracks "primary confirmation of Uber's offer price/terms," and both UBER records track "the Delivery Hero bridge-facility covenant terms." These are acquirer and target in the same live event — if either ever sizes in, the other cannot be treated as an independent bet; size the pair as one correlated position.
  - BG and NHY are both commodity/policy-conditional theses (different commodities — ag vs. aluminum); HAIER adds a third commodity/policy-conditional angle (China, input costs) but no direct linkage to either.
  - SMPL, TMCV, and both UBER records all carry an active RF-CAP-004 serial-acquirer capital-allocation flag (§24 Filter 4).
  - EMAAR and NHY both carry an RF-OWN-004 unaligned-controlling-owner cap (§24 Filter 6).
  - ORCL and TSLA both sit in the large-cap AI-capex cycle (Oracle as an AI-infrastructure vendor/lessor, Tesla on a separate mechanism) — a loose sector-cycle overlap, not a direct linkage.
  - The two UBER records are the same company, not two names — one correlation unit.

## Watch list — the size-in triggers

| Ticker | Decision | Size-in trigger | Next review |
|---|---|---|---|
| AMZN | Watchlist | Re-entry at $190-200 (>12% margin of safety on base fair value $210). Jul-31-2026 Q2 print was the first real test of the AWS D&A billing-lag hypothesis — not yet folded into a new run. | 2026-10-08 (90d; 30d checkpoint of 2026-08-09 elapsed with no new run) |
| BG | Watchlist | Re-rate to Starter Position Only only on a pool-confirmed price below ~$100, or a clean post-Viterra FY2026 cash-conversion print. | 2026-08-30 |
| DHER | Avoid | Do not initiate. Track as a merger-arbitrage watch item pending (1) primary confirmation of Uber's offer price/terms and (2) the FY2025 audited Annual Report's going-concern language on Glovo Spain. Integrity `provisional` — would also gate a re-rate regardless of the price trigger. | 2026-09-11 |
| EMAAR | Watchlist | Starter long only if pre-sales hold ≥+16% YoY and the discount begins to close, or on primary evidence the Government-of-Dubai owner (or founder-MD) treats minorities as value-owners. | 2026-10-08 (90d; 30d checkpoint of 2026-08-09 elapsed with no new run) |
| HAIER | Watchlist | Monitor only — revisit after the 2026-08-27/28 H1 2026 print. Integrity `provisional`; cross-module forensic mosaic caps the ceiling at Starter Position Only even once cleared. | 2026-09-12 |
| HCG | Avoid | Re-underwrite only at/below INR 520, or on two consecutive clean prints showing ROIC rising toward the cost of capital. | 2026-08-30 |
| INDIAMART | Watchlist | Do not initiate today. Track paying-supplier net additions at the next two prints (Q2 FY27 ~21-Oct-2026, Q3 FY27 ~Jan-2027); revisit if price falls toward the ₹1,699 base fair value or below, or if net adds turn positive for 2 consecutive quarters. Integrity `provisional`. | 2026-09-13 |
| NHY | Watchlist | Revisit only if price falls toward/below the NOK 70-82 fair-value band, or if the Alumetal impairment / Brazil tax risk clears without damage. | **2026-08-18 — OVERDUE.** The 30d checkpoint has elapsed with no review filed (flagged by this session's own decision-review reminder; run `/research:review-decisions due`). Next scheduled checkpoint after that is 2026-10-17 (90d). |
| ORCL | Watchlist | Do not buy at $153.94 (no margin of safety against the $133.77 base case). Do not short into the 2026-09-04 print (setup balanced, not miss-tilted; short interest only 1.74% of float). Re-underwrite after the FQ1 FY2027 print (2026-09-04), the 2026 DEF 14A (~2026-09-28), and the OCI securities-fraud motion-to-dismiss outcome. Integrity `provisional`. | 2026-09-13 |
| SMPL | Watchlist | Revisit after the Oct-23-2026 FQ4 print and the Sept-2026 price increase's elasticity result (visible in the FQ1 FY2027 print). | 2026-09-05 |
| TMCV | Watchlist | Re-rate when the Iveco financing structure is confirmed and the TMF Holdings AGM vote outcome is known. | 2026-09-05 |
| TSLA | Short Candidate | Excluded this cycle (integrity `provisional`). Underlying short thesis: small, defined-risk short (long-dated puts / put spreads) once integrity clears provisional. | 2026-08-24 |
| UBER (run 2026-08-06) | Watchlist | Track the FQ3 2026 print (~Oct 2026) and Delivery Hero bridge-facility covenant terms once disclosed. RF-CAP-004 (serial-acquirer, Critical) caps the rating at Watchlist regardless of edge score. | 2026-09-05 |
| UBER (run 2026-08-09) | Watchlist | Do not initiate. Track the Q3 FY2026 print (Nov-03-2026) and Delivery Hero bridge-facility terms (expected end-Sep-2026); revisit once the derivative lawsuit reaches a motion-to-dismiss ruling or the bridge is termed out. Two Critical red flags (RF-MGT-005, RF-CAP-004) cap conviction at Watchlist with no edge-score bypass. | 2026-09-08 |

## Why nothing is sized

The sizing rule (fractional-Kelly on edge × downside, scaled by conviction) only ever applies to a **Selected** basket (Strong Buy / Buy / Starter) with positive probability-weighted expected return, a proven edge, and non-`provisional` truth-integrity. None of the 14 records clear that bar:

- 11 of 14 are already capped at Watchlist or below by a structural rating cap (§24 unaligned-owner, serial-acquirer, or forensic-mosaic filters, edge-score gates, or valuation/governance caps) — none reach Buy.
- DHER and HCG are explicit Avoid (Rejected basket) — DHER on a governance hard-disqualifier (auditor going-concern note), HCG on negative expected return and a governance cap.
- TSLA is the only Short Candidate with a supportive thesis and positive expected return, but is integrity-gated `provisional` and therefore not sized.
- INDIAMART carries a negative probability-weighted expected return (-4.31%) and `provisional` integrity — either alone excludes it.
- ORCL carries a negative probability-weighted expected return (-27.1%), a Critical management-governance red flag capping it at Watchlist, and `provisional` integrity.

This is the discipline working as intended: the model book stays in cash rather than forcing a position onto names that don't clear the bar.

*No new decision records since the 2026-08-16 refresh — book composition and 0%-gross conclusion are unchanged. NHY's 30d review checkpoint (2026-08-18) is now overdue and unfiled; this session's SessionStart hook already flagged it separately (`/research:review-decisions due`). It does not change NHY's eligibility, which was already excluded on basket/edge grounds.*
