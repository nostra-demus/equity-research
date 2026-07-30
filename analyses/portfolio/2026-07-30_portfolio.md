# Model Portfolio — 2026-07-30

**Scope:** all (standing, corrected decision ledger, 7 decisions)
**Disclaimer:** Illustrative model paper-portfolio for research process-tracking only. Not investment advice. Not a recommendation to any person to buy or sell. No orders are placed.

---

## Book

**1 position (TSLA, short) — 1.5% gross — 6 names on watch. Unchanged from 2026-07-27.**

| | |
|---|---|
| Gross invested | 1.5% |
| Cash | 98.5% |
| Largest name | TSLA (short, 1.5%) |
| Top-3 concentration | 1.5% (single position) |

**What changed:** nothing. No new research run has landed against any of the 7 standing decisions since the 2026-07-27 model portfolio — the standing, corrected ledger still holds the same 7 decisions from the same 7 run roots (`AMZN_2026-07-10`, `BG_2026-06-01`, `EMAAR_2026-07-10`, `HCG_2026-06-01`, `NHY_2026-07-19`, `TMCV_2026-06-07`, `TSLA_2026-07-25`). The activity visible in this window (screener inbox/ledger updates) is signal-sweep intake, not a completed research decision record, so it doesn't feed this ledger. This run re-verifies eligibility and sizing against the unchanged ledger and reproduces the same book.

**Why TSLA sizes small despite a large computed edge:** the scenario math is exceptionally favorable on paper — probability-weighted short return +56.57% (verified exactly by `verification_report.json`), risk/reward 1.85, and `expectations_gap.json` marks the thesis `is_exploitable: true`. But three things cap the size hard:
1. **Per-name cap.** The raw scenario-implied Kelly fraction computes to ~60% (65% win probability at ~94% average win vs. 35% loss probability at ~12% average loss) — nowhere near investable. Per Step 3, this is hard-capped at the standard ~8% per-name ceiling; never full Kelly.
2. **Conviction scaling.** `pre_mortem.json` haircuts confidence from 60 to a recommended 50; data sufficiency is 76/100. Conviction = (50/100) × (76/100) = 0.38 → 8% × 0.38 ≈ 3.0%.
3. **Pre-mortem's explicit sizing caution.** The pre-mortem's `recommended_rating_cap` states: *"No new or larger short exposure beyond the run's own already-small, defined-risk sizing... treat the position as functionally Watchlist-strength until then, not as license to size up."* It also names an unquantified squeeze/base-rate risk (TSLA's documented history of >10% single-session moves, 2.1% short interest, 1.80 beta) that the run's own 10%-probability tail-squeeze scenario doesn't independently stress-test. That halves the conviction-scaled weight again, to **1.5%**.

Both eligibility gates for a Short Candidate cleared cleanly: `verification_report.json` verdict is **Minor issues** (not Failed/Material), and `pre_mortem.json` verdict is **Survives with haircut** (not Does-not-survive/Thesis-broken).

**Concentration / correlation:** single position, so no concentration issue by construction. Flagged for future reference: TSLA shares a "Sector-cycle" thesis-type tag with AMZN, EMAAR, and TMCV — if any of those later enter the book alongside TSLA, check for shared macro/consumer-cycle exposure before treating them as independent bets. Unrelated to TSLA: AMZN/EMAAR/NHY each carry an unaligned-owner (CLAUDE.md §24 Filter 6) cap, and BG/TMCV each carry a Filter 4 large-deal/serial-acquirer cap.

---

## Positions

| Ticker | Decision | Model weight | Rationale (short) |
|---|---|---|---|
| **TSLA** | Short Candidate | **−1.5%** (short) | Positive probability-weighted short return (+56.57%), evidence-backed edge (`is_exploitable: true`), clean verification (Minor issues) and pre-mortem (Survives with haircut). Sized via capped fractional-Kelly (8% ceiling) × conviction (0.38) × a further pre-mortem-directed haircut for squeeze/base-rate tail risk. Expressed as long-dated puts / put spreads, not naked short stock, per the thesis's own suggested sizing. |

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
