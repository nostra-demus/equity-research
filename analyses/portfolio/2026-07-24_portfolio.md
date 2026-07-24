# Model Portfolio — 2026-07-24

**Scope:** all (standing, corrected decision ledger, 6 decisions)
**Disclaimer:** Illustrative model paper-portfolio for research process-tracking only. Not investment advice. Not a recommendation to any person to buy or sell. No orders are placed.

---

## Book

**No positions — 6 names on watch.**

| | |
|---|---|
| Gross invested | 0% |
| Cash | 100% |
| Largest name | — |
| Top-3 concentration | — |

**Why zero gross:** none of the 6 standing ledger records reached the **Selected** basket (Strong Buy / Buy / Starter Position Only) required for long eligibility under Step 2 of this process. Five are **Watchlist** (AMZN, BG, EMAAR, NHY, TMCV) and one is **Rejected/Avoid** (HCG). CLAUDE.md §18 bars forcing a Buy, and the sizing math (fractional-Kelly on edge × downside, scaled by conviction) self-zeroes any name with a negative expected return or no evidence-backed edge — that covers four of the six outright (BG −11.5%, HCG −13.4%, NHY −8.4%, AMZN −16.1% expected return), and the other two (EMAAR, TMCV) carry rating caps or edge scores below the ~50 exploitability gate.

**No change since the 2026-07-23 run:** the standing ledger (`scripts/ledger_records.py --standing-json`) returned the identical 6 records — same decisions, expected returns, edge scores, and rating caps as the prior run. No run superseded, no new decision landed, no review checkpoint has come due yet.

**Concentration / correlation:** not applicable with zero positions. Flagged for future reference: AMZN and EMAAR both carry a governance/owner-alignment-adjacent cap (AMZN: edge-gate + valuation-dispersion cap; EMAAR: Filter 6 unaligned Government-of-Dubai controller); BG and TMCV both carry a Filter 4 large-deal/serial-acquirer cap (Viterra integration for BG, Iveco financing for TMCV); NHY adds a third Filter 6 unaligned-owner case (Norwegian State, industrial-policy stake) alongside a commodity-conditional (aluminium/alumina) vector it does not currently share with any other watched name. If any of these later clear their caps and enter the book together, the owner-alignment trio (AMZN/EMAAR/NHY) and the large-deal pair (BG/TMCV) should each be treated as correlated on their shared risk vector, not as independent bets.

---

## Positions

None.

---

## Watch List — size-in triggers

| Ticker | Decision | Size-in trigger | Next review |
|---|---|---|---|
| **AMZN** | Watchlist | Re-entry zone $190–200 (>12% margin of safety on base fair value $210). Jul 31, 2026 Q2 earnings is the first real test of the AWS D&A billing-lag hypothesis. Edge score 35 < 50 exploitability gate. | 2026-08-09 |
| **BG** | Watchlist | Re-rate to Starter Position Only only on a pool-confirmed price below ~$100, or a clean post-Viterra FY2026 cash-conversion print. Do not buy at indicative ~$123. | 2026-08-30 |
| **EMAAR** | Watchlist | Revisit toward a starter long only if pre-sales hold ≥+16% YoY and the discount begins to close, or on primary evidence the state owner / founder-MD treats minorities as value-owners. RF-OWN-004 (Filter 6, unaligned Government-of-Dubai controller) caps the headline at Watchlist regardless of price. No position at AED 12.20; watch the Q2 2026 print (~Aug 10, 2026). | 2026-08-09 |
| **HCG** | Avoid | Only re-underwrite at/below INR 520 (base-case low, where a margin of safety begins) or on two consecutive clean prints showing ROIC rising toward the cost of capital. Currently rejected: weak governance (7 High flags), no margin of safety. | 2026-08-30 |
| **NHY** | Watchlist | Track the 22-Jul-2026 and 23-Oct-2026 prints; revisit only if price falls toward or below the NOK 70–82 weighted fair-value band, or if the Alumetal impairment / Brazil tax risk clears without damage. Edge score 30 < 50 gate; five High-severity governance/capital-allocation flags (state ownership, written-off battery bet, dividend > FCF, recurring "non-recurring" charge, AGM pay revolt). | 2026-08-18 |
| **TMCV** | Watchlist | Re-rate when the Iveco financing structure is confirmed and the TMF Holdings AGM vote outcome is known. Filter 4 (serial-acquirer/very-large-deal) + Filter 6 (unaligned-owner-borderline) hold it at Watchlist until resolved. | 2026-09-05 |

---

*Model / illustrative only — simulated paper-portfolio basis, same as the decision ledger's paper trades (`DECISION_LEDGER` §4). Places no orders. Recommends no person buy or sell.*
