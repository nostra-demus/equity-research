# Model Paper-Portfolio — 2026-08-07

**Scope:** all standing decisions · **Illustrative model paper-portfolio for research process-tracking only — not investment advice, not real orders. No orders placed, no recommendation to any person to buy or sell.**

---

## Book: no positions — 100% model cash

9 standing decisions in the ledger. None qualifies for a model weight today.

| Gross | Cash | Max single-name | Positions |
|---|---|---|---|
| 0% | 100% | 0% | 0 |

**Why zero:** eligibility (Step 2 of `/research:size`) requires a **Selected** basket (Strong Buy / Buy / Starter Position Only) for a long, or an explicit Short Candidate that clears the same truth-integrity gate. Of the 9 records:

- **7 are Watchlist** (AMZN, BG, EMAAR, NHY, SMPL, TMCV, UBER) — none has been upgraded to Selected.
- **1 is Rejected/Avoid** (HCG) — governance and valuation don't clear the bar.
- **1 is Short Candidate but gated out** (TSLA) — see below.

This is the sizing discipline working as intended (CLAUDE.md §1): a rejected or unqualified thesis gets zero weight, not a consolation position. Notably SMPL (+22.63%) and EMAAR (+17.7%) carry positive probability-weighted expected returns — but a positive expected return alone does not earn a model weight; it still needs a Selected basket and an evidence-backed edge, and both remain Watchlist with edge_score below the 50 threshold. The math self-zeroes them rather than rewarding an "interesting but not cheap enough / not proven enough" name.

### TSLA and UBER — excluded on the truth-integrity gate

`analyses/TSLA_2026-07-25/final_thesis.md` and `analyses/UBER_2026-08-06/final_thesis.md` both carry an active **PROVISIONAL** banner from the finish-gate — the automated check found an integrity issue and each thesis was committed unverified (TSLA: integrity_score 78, "Minor issues"; UBER: integrity_score 67, "Material issues"). Per Step 2, `entry.integrity.status ≠ provisional` is a hard exclusion applied identically to shorts and longs, so both are held at zero regardless of their own economics. TSLA's short case (expected return +56.6%, edge_score 40, pre-mortem "Survives with haircut") re-enters the eligible set only once its run is re-verified and the banner clears. UBER is doubly excluded: even without the integrity flag, RF-CAP-004 (serial-acquirer pattern, Critical) already caps its basket at Watchlist, so it needs both the governance flag resolved and the integrity banner cleared before it could ever carry weight.

**Change since 2026-08-06:** UBER added (new decision, Watchlist, 2026-08-06, also provisional). The other 8 records are unchanged.

---

## Watch list — 9 names, all at zero weight

| Ticker | Decision | Size-in trigger | Next review |
|---|---|---|---|
| AMZN | Watchlist | Re-entry $190-200 (>12% MoS to base FV $210). Jul 31 Q2 earnings tested the AWS D&A billing-lag hypothesis (edge_score 35 < 50 gate) — check the print against the confirmation/falsification triggers. | 2026-08-09 |
| BG | Watchlist | Re-rate to Starter only below ~$100, or a clean post-Viterra FY2026 cash-conversion print. Do not buy at ~$123. | 2026-08-30 |
| EMAAR | Watchlist | Starter long only if pre-sales hold ≥+16% YoY and the discount closes, or on evidence the state owner treats minorities as value-owners. Watch the ~Aug 10 Q2 print. | 2026-08-09 |
| HCG | Avoid | Re-underwrite only at/below INR 520, or two consecutive clean prints of ROIC rising toward cost of capital. 7 High-severity governance flags outstanding. | 2026-08-30 |
| NHY | Watchlist | Revisit only if price falls to NOK 70-82 fair-value band, or the Alumetal impairment / Brazil tax risk clears clean. Edge score 30 < 50; 5 High flags. Next print 23-Oct-2026. | 2026-08-18 |
| SMPL | Watchlist | Monitor only. Revisit after the Oct-23-2026 FQ4 print and the Sept-2026 price increase's elasticity result (visible in the FQ1 FY2027 print). Edge score 35 < 50; confidence 40. | 2026-09-05 |
| TMCV | Watchlist | Re-rate once the Iveco financing structure and TMF Holdings AGM vote are known. | 2026-09-05 |
| TSLA | Short Candidate (gated) | Held at zero pending re-verification of the PROVISIONAL run (integrity_score 78, "Minor issues"). If cleared: small, defined-risk short via puts/put-spreads, not naked stock, sized no larger than "Watchlist-strength" per its own pre-mortem. | 2026-08-24 |
| UBER | Watchlist (gated) | Held at zero on two grounds: RF-CAP-004 serial-acquirer cap holds the basket at Watchlist, AND the run carries a PROVISIONAL integrity banner (integrity_score 67, "Material issues"). Track the ~Oct 2026 FQ3 print and Delivery Hero bridge-facility covenant terms; needs both flags resolved to become eligible. | 2026-09-05 |

---

## Concentration / correlation

No positions to concentrate. For forward reference once any of these clear their gates: AMZN, EMAAR, NHY and TMCV each carry a sector-cycle or cyclical driver alongside their company-specific one — treat as correlated, not independent, if more than one enters the book together. SMPL carries a Governance-turnaround tag (CLAUDE.md §24 Filter 2 — low base rate for turnarounds — applies if it is ever re-rated). AMZN, EMAAR and NHY each carry an unaligned-owner structural cap (§24 Filter 6); BG, TMCV and UBER each carry a large-deal/serial-acquirer cap (Filter 4) — three names sharing the same structural risk vector is itself a diversification flag for if the book ever fills with names now on watch.

---

*Illustrative model paper-portfolio for research process-tracking. Not investment advice. No real orders were placed or recommended.*
