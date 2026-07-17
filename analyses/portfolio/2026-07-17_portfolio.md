# Model Paper-Portfolio — 2026-07-17

**Illustrative model paper-portfolio for the engine's own research process-tracking. NOT investment advice, NOT a recommendation to any person to buy or sell, and no orders are placed.** Basis: simulated / paper-trade only, per `frameworks/DECISION_LEDGER.md` §4.

Scope: `all` — 5 decision records on the ledger (AMZN, BG, EMAAR, HCG, TMCV), latest version per ticker.

## Model Book

**No positions. The model book is 100% cash.**

| Metric | Value |
|---|---|
| Gross invested | 0.0% |
| Cash | 100.0% |
| Largest single name | 0.0% |
| Top-3 concentration | 0.0% |

No name on the ledger clears the long-eligibility bar (`DECISION_LEDGER` §3 / CLAUDE.md §16, §18):

| Ticker | Basket | Decision | Expected return | Edge | Why excluded |
|---|---|---|---|---|---|
| AMZN | Watchlist | Watchlist | -16.1% | edge_score 35 (<50) | Not Selected; negative expected return; edge gate binding — the D&A billing-lag view is directionally known but the magnitude/timing is unresolvable without quarterly disclosure. |
| BG | Watchlist | Watchlist | -11.5% | No proven variant perception | Not Selected; negative expected return; explicitly "no proven variant perception" — the two modest edges are inference, not a differentiated view. |
| EMAAR | Watchlist | Watchlist | **+17.7%** | edge_score 38 (<50) | Positive expected return and risk/reward (0.88), but Not Selected — RF-OWN-004 (CLAUDE.md §24 Filter 6, unaligned Government-of-Dubai controller, 29.73% Dubai Holding) caps the headline at Watchlist and forbids a conviction position. Real asset value, no proven timeable edge to unlock it — a value trap, not a mispricing. |
| HCG | Rejected | Avoid | -13.4% | No proven variant perception (long side) | Governance "Weak" (7 High flags) plus no margin of safety; the engine agrees with, rather than differs from, the market's discount. |
| TMCV | Watchlist | Watchlist | -4.4% | No proven variant perception | Not Selected; negative expected return; Iveco acquisition binary and TMF Holdings related-party overhang (Filter 4 + Filter 6) cap at Watchlist until resolved. |

A name with negative probability-weighted expected return or no proven variant perception is never sized — that is the discipline working as intended (CLAUDE.md §24, the Rejector Doctrine): four of five names self-zero on expected return alone, and the fifth (EMAAR) self-zeros on the basket/governance cap despite a positive expected-return math.

**Correlation:** not applicable — zero positions, so no combined-weight haircut is triggered. For reference, the five watched names sit on five distinct thesis vectors (US tech/cloud capex, commodity/policy-conditional agribusiness, Dubai real estate/policy, Indian healthcare/DPCO policy, Indian auto + M&A binary) — a name added later that shares a vector with an existing holding should be haircut for correlation per §4 of this command.

## Watch List — Size-In Triggers

| Ticker | Decision | Size-in trigger | Next review |
|---|---|---|---|
| AMZN | Watchlist | Re-entry at $190-200 (>12% margin of safety on base FV $210). Jul-31-2026 Q2 earnings is the first real test of the D&A billing-lag hypothesis: AWS margin ≥34-35% falsifies the bear case; AWS margin <30% with Technology & Infrastructure costs growing >25% YoY confirms it and pushes fair value toward $146. | 2026-08-09 |
| BG | Watchlist | Re-rate to Starter Position Only only on a pool-confirmed price below ~$100, or a clean post-Viterra FY2026 cash-conversion print (CFO/EBITDA toward ~70%, FCF turning positive). 30d review (2026-07-01) has lapsed with no pool price update. | 2026-08-30 |
| EMAAR | Watchlist | Track the Q2 2026 print (est. 10 Aug) for the Dubai demand signal. Revisit toward a starter long only if pre-sales hold ≥+16% YoY and the discount begins to close, or on primary evidence the Government-of-Dubai owner treats minorities as value-owners (mall spin/REIT/special distribution or arm's-length IAS 24 RPT disclosure). | 2026-08-09 |
| HCG | Rejected (Avoid) | Re-underwrite only at/below INR 520 (base-case low, where a margin of safety begins) or on two consecutive clean prints showing ROIC rising toward the ~11-12% cost of capital. 30d review (2026-07-01) has lapsed. | 2026-08-30 |
| TMCV | Watchlist | Re-rate when the Iveco acquisition financing structure (equity vs debt split, post-deal net debt/EBITDA ceiling) is confirmed and the TMF Holdings AGM vote outcome (was 2026-06-29) is known. 30d review (2026-07-07) has lapsed. | 2026-09-05 |

## Notes

No new decision record has landed on the ledger since the 2026-07-16 portfolio build. The only analyses-related activity since then is an EMAAR intake plan and business-model/external-dependency rerun (2026-07-16), which is already folded into the `EMAAR_2026-07-10` decision record read for this build (its notes field self-reports "recomposed 2026-07-16"), plus the calls tracker. `AMZN_2026-07-11`, `MGM_2026-07-03`, and the `NIVABUPA_*` folders hold in-progress module output with no `decision_record.json` yet, so they carry no model weight and are excluded from this scope.

Conclusion is unchanged from 2026-07-16: **zero positions, five names on watch, 100% cash.**

---
*Model / illustrative only. Not investment advice. Not a recommendation to buy or sell. No real orders placed.*
