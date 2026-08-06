# Model Paper-Portfolio — 2026-08-06

**Scope:** all standing decisions · **Illustrative model paper-portfolio for research process-tracking only — not investment advice, not real orders. No orders placed, no recommendation to any person to buy or sell.**

---

## Book: no positions — 100% model cash

8 standing decisions in the ledger. None qualifies for a model weight today.

| Gross | Cash | Max single-name | Positions |
|---|---|---|---|
| 0% | 100% | 0% | 0 |

**Why zero:** eligibility (Step 2 of `/research:size`) requires a **Selected** basket (Strong Buy / Buy / Starter Position Only) for a long, or an explicit Short Candidate that clears the same truth-integrity gate. Of the 8 records:

- **6 are Watchlist** (AMZN, BG, EMAAR, NHY, SMPL, TMCV) — none has been upgraded to Selected.
- **1 is Rejected/Avoid** (HCG) — governance and valuation don't clear the bar.
- **1 is Short Candidate but gated out** (TSLA) — see below.

This is the sizing discipline working as intended (CLAUDE.md §1): a rejected or unqualified thesis gets zero weight, not a consolation position. Notably SMPL carries a positive probability-weighted expected return (+22.63%) — but a positive expected return alone does not earn a model weight; it still needs a Selected basket and an evidence-backed edge, and SMPL's basket is Watchlist with edge_score 35 (confidence 40). The math self-zeroes it rather than rewarding an "interesting but not cheap enough / not proven enough" name.

### TSLA — still excluded on the truth-integrity gate

`analyses/TSLA_2026-07-25/final_thesis.md` carries an active **PROVISIONAL** banner from the finish-gate — the automated check found an integrity issue and the thesis was committed unverified. Per Step 2, `entry.integrity.status ≠ provisional` is a hard exclusion applied identically to shorts and longs, so TSLA is held at zero regardless of its economics (expected return +56.6% on the short, edge_score 40, verification "Minor issues", pre-mortem "Survives with haircut"). It re-enters the eligible set only once the run is re-verified and the banner clears.

**Change since 2026-08-01:** SMPL added (new decision, Watchlist, 2026-08-06). The other 7 records are unchanged.

---

## Watch list — 8 names, all at zero weight

| Ticker | Decision | Size-in trigger | Next review |
|---|---|---|---|
| AMZN | Watchlist | Re-entry $190-200 (>12% MoS to base FV $210). Jul 31 Q2 earnings tested the AWS D&A billing-lag hypothesis (edge_score 35 < 50 gate) — check the print against the confirmation/falsification triggers. | 2026-08-09 |
| BG | Watchlist | Re-rate to Starter only below ~$100, or a clean post-Viterra FY2026 cash-conversion print. Do not buy at ~$123. | 2026-08-30 |
| EMAAR | Watchlist | Starter long only if pre-sales hold ≥+16% YoY and the discount closes, or on evidence the state owner treats minorities as value-owners. Watch the ~Aug 10 Q2 print. | 2026-08-09 |
| HCG | Avoid | Re-underwrite only at/below INR 520, or two consecutive clean prints of ROIC rising toward cost of capital. 7 High-severity governance flags outstanding. | 2026-08-30 |
| NHY | Watchlist | Revisit only if price falls to NOK 70-82 fair-value band, or the Alumetal impairment / Brazil tax risk clears clean. Edge score 30 < 50; 5 High flags. Next print 23-Oct-2026. | 2026-08-18 |
| SMPL | Watchlist | Monitor only. Revisit after the Oct-23-2026 FQ4 print and the Sept-2026 price increase's elasticity result (visible in the FQ1 FY2027 print). Edge score 35 < 50; confidence 40. | 2026-09-05 |
| TMCV | Watchlist | Re-rate once the Iveco financing structure and TMF Holdings AGM vote are known. | 2026-09-05 |
| TSLA | Short Candidate (gated) | Held at zero pending re-verification of the PROVISIONAL run. If cleared: small, defined-risk short via puts/put-spreads, not naked stock, sized no larger than "Watchlist-strength" per its own pre-mortem. | 2026-08-24 |

---

## Concentration / correlation

No positions to concentrate. For forward reference once any of these clear their gates: AMZN, EMAAR, NHY and TMCV each carry a sector-cycle or cyclical driver alongside their company-specific one — treat as correlated, not independent, if more than one enters the book together. SMPL carries a Governance-turnaround tag (CLAUDE.md §24 Filter 2 — low base rate for turnarounds — applies if it is ever re-rated). AMZN, EMAAR and NHY each carry an unaligned-owner structural cap (§24 Filter 6); BG and TMCV each carry a large-deal/serial-acquirer cap (Filter 4).

---

*Illustrative model paper-portfolio for research process-tracking. Not investment advice. No real orders were placed or recommended.*
