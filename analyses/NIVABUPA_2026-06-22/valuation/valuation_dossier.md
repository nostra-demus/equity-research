# valuation Module Dossier — NIVABUPA

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-06-22T08:56:56Z
- Module folder: `valuation`
- Contents: 1 module synthesis + 8 specialist outputs = 9 files

## Table of Contents

- [valuation — module synthesis](#valuation-module-synthesis) — `99_valuation-synthesis.md`
- [valuation / 00_valuation-data-triage.md](#valuation-00-valuation-data-triage-md) — `00_valuation-data-triage.md`
- [valuation / 01_price-and-capital-structure.md](#valuation-01-price-and-capital-structure-md) — `01_price-and-capital-structure.md`
- [valuation / 02_multiples-own-history.md](#valuation-02-multiples-own-history-md) — `02_multiples-own-history.md`
- [valuation / 03_relative-valuation-peers.md](#valuation-03-relative-valuation-peers-md) — `03_relative-valuation-peers.md`
- [valuation / 04_intrinsic-dcf.md](#valuation-04-intrinsic-dcf-md) — `04_intrinsic-dcf.md`
- [valuation / 05_reverse-dcf.md](#valuation-05-reverse-dcf-md) — `05_reverse-dcf.md`
- [valuation / 06_sum-of-the-parts.md](#valuation-06-sum-of-the-parts-md) — `06_sum-of-the-parts.md`
- [valuation / 07_scenario-and-fair-value.md](#valuation-07-scenario-and-fair-value-md) — `07_scenario-and-fair-value.md`


---

## valuation — module synthesis

_Source: `99_valuation-synthesis.md`_

# Valuation Module — NIVABUPA (Synthesis)

## Abstract

Niva Bupa is materially overvalued: at INR 84.03, the stock trades at 129% above the base-case fair value of INR 36.70 per share and at 91% above even the bull fair value of INR 43.98. The triangulated fair-value levels — bear INR 16.51, base INR 36.70, bull INR 43.98 — are driven 70% by the residual-income (excess-return on equity) model and 30% by quality-adjusted peer multiples, the correct method mix for an IRDAI-regulated health insurer with a "No moat proven" verdict. The reverse-DCF shows the current price requires a peak return on equity of approximately 49% by FY30 — nearly three times management's own guided "mid- to high-teens" ROE target and more than twice the best ROE any named peer in the Indian health insurance sector has achieved. At a 56% implied drop to the base fair value and a 80% loss to the bear case, there is no margin of safety; observed upside is negative even in the bull scenario. The stock is priced for an outcome the economics of health insurance cannot deliver.

## 1. Valuation Verdict

- **Verdict:** Materially overvalued
- **Base-case fair value (point, per share):** INR 36.70
- **Current price:** INR 84.03 (pool-verified; Key Stats tab of Capital IQ Financials.xls export, ~Jun 2026; last confirmed-dated close INR 83.62 on 2026-05-21 — ~32 days stale; three independent pool sources agree within 0.4%)
- **Bull / Base / Bear fair-value levels (points):**
  - Bull: INR 43.98/share (12-month horizon)
  - Base: INR 36.70/share (12-month horizon)
  - Bear: INR 16.51/share (12-month horizon)
- **Cross-method dispersion (football field, low–high):** INR 19.94 (RI model base) to INR 75.80 (quality-adjusted peer P/E) — a spread of INR 55.86, or 280% in absolute terms. Two zero-weighted methods (own-history, SOTP collapsed) span INR 77.4–81.5 and INR 76.4–108.9 respectively; those are excluded from the triangulated fair-value levels but shown for transparency.
- **Valuation attractiveness /100** *(higher = cheaper)*: **12** — current price is 129% above base fair value; even the bull case offers no positive return from the current price. Score is capped at 60 by MODULE_RULES §24 Filter 6 check; however, the RF-OWN-004 misaligned-owner flag was NOT formally triggered by the governance module (Bupa Group assessed as broadly aligned), so the 60-cap does not apply here — scored 12 on fundamentals alone.
- **Margin of safety /100** *(higher = better)*: **0** — margin of safety = (base FV − price) / base FV = (36.70 − 84.03) / 36.70 = −129.0%. No cushion exists; the risk runs entirely in the other direction. Score: 0.
- **Valuation confidence /100:** **52** — price is pool-verified and multiple methods ran, but two methods (02, 06) were zero-weighted per their own producers' flags; the two active methods disagree by 73.7% (far above the 40% unreconciled threshold), triggering the 55 cap under MODULE_RULES. The cap is further tightened to 52 to reflect the thin peer set (2 SAHI comps), absent audited Annual Report PDF in pool (Capital IQ vendor proxy), and dilution schedule unavailability. Most restrictive applicable cap: **55** (methods disagree >40% — capped at 55 per MODULE_RULES). Applied cap: 55; final score adjusted to 52 for data-quality factors within that cap.
- **Downside risk /100** *(higher = WORSE — inverted)*: **80** — downside to bear = (84.03 − 16.51) / 84.03 = 80.4%. Score: 80. Price-state is pool-verified; this metric is assessable.
- **Data quality /100:** **62** — full capital structure, income statement, cash flow, consensus (10 analysts), and 9-peer comps set are present through FY26. Deductions: no standalone audited IRDAI Annual Report PDF (Capital IQ vendor proxy); dilution schedule absent; price as-of date unconfirmed at Key Stats cell level (~32-day staleness from confirmed dated close). Score reflects good pool coverage with vendor-level sourcing and minor staleness.
- **Overall usefulness /100:** **72** — multiple methods ran and produced a directionally consistent overvaluation verdict; the RI model (primary for this business type) and reverse-DCF produce a strong, evidence-anchored conclusion. Limited by thin SAHI peer set and absent audited primary document.
- **Dominant valuation method:** Residual Income / Excess-Return on Equity (04) — the primary intrinsic method for a Financial issuer per MODULE_RULES Business-Type Map. Valued on the spread between ROE (10.7% FY26) and cost of equity (12.87%); when ROE < cost of equity, intrinsic value anchors close to book (INR 19.94/share base). Given the "No moat proven" verdict mandating zero terminal excess returns, 97% of intrinsic equity value is the current book value of INR 19.39/share. Peer multiples (03) carry 30% weight as secondary anchor.
- **What's priced in:** The current price of INR 84.03 implies a peak ROE of approximately 49% by FY30 — derived by inverting the RI model (`05_reverse-dcf.md §2`). This is 2.7× the best ROE observed anywhere in the Indian health insurance sector (ICICI Lombard 17.8%) and approximately 3× management's own ambitious "mid- to high-teens" ROE guidance. Structurally implausible given health insurance economics (loss ratios above 60%, regulated EOM caps, investment yields near 7%).
- **Biggest valuation risk:** Operating leverage on the combined ratio failing to materialise — if GWP growth slows to 12–15% (from the current 27.4%) or IRDAI restructures commission/EOM caps adversely, the fixed-cost leverage reverses and the bear case (INR 16.51) or even the structural-reset floor (INR 16.12) becomes relevant; the fall from INR 84.03 to that floor is 80%.

---

## 1A. Module Disconfirmation *(CLAUDE.md §8; fix F37)*

**Strongest bear point:** The reverse-DCF (`05`) shows that justifying INR 84.03 requires a peak ROE of approximately 49% by FY30, and the robustness grid confirms this finding is insensitive to any reasonable variation in the cost of equity or book-equity base (range: 47–52% across the full grid). No health insurer peer in India or globally has sustained ROE near this level, and the business model's structural constraints — loss ratios above 60%, IRDAI expense caps, ~7% investment yields — place an effective ceiling on achievable ROE well below the implied requirement. `[05_reverse-dcf.md §3; 04_intrinsic-dcf.md §7]`

**Strongest bull point:** Niva Bupa's GWP is growing at 27.4% (FY26 LTM), its retail health market share is rising at approximately +100 bps per year (FY26: 10.1%), and management's path to combined ratio 99% by FY29 is operationally coherent (EOM declining ~200 bps/year, loss ratio stable). If the company achieves 15%+ ROE faster than modelled — for example through accelerating operating leverage as the cohort book matures — and the market assigns a peer-comparable multiple without a quality haircut, the peer-implied upside to INR 75.8–109/share is real. `[03_relative-valuation-peers.md §6; 06_sum-of-the-parts.md §3]`

**Single killer risk:** The RI model's base-case intrinsic value of INR 19.94/share — already above book (INR 19.39/share) only because of a modest near-term ROE improvement — rests entirely on the assumption that management achieves "mid-teens" ROE by FY30. If IRDAI imposes an adverse restructuring of EOM caps or commission structures at any point in the forecast window, GWP growth collapses and the entire ROE ramp fails — resulting in an intrinsic value that falls to or below book value. Given that the company currently earns 10.7% ROE against a 12.87% cost of equity, the economic value creation is currently negative; any adverse regulatory disruption crystallises that into permanent value destruction.

**Disconfirming evidence already visible:** The peer multiples (`03`) produce a fair value of INR 75.8 on the primary P/E method, which is broadly in line with the current price of INR 84.03 after the quality haircut — this implies the market is not necessarily irrational if you weight the growth trajectory and peer premium. The SOTP sanity check (`06`) also produced a range of INR 76.4–108.9 using the Star Health comparable P/E, spanning and exceeding the current price. These peer-based signals disconfirm the "materially overvalued" verdict from the RI model — a buyer relying on peer multiples alone would see the stock as roughly fairly valued to modestly cheap. The key question the master synthesizer must adjudicate is whether peer multiples are a valid anchor for a company earning below its cost of equity, or whether the RI model's economic-value discipline is the correct primary lens.

---

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | Sufficient — all four sufficiency conditions met (price, earnings base, forward estimates, peer comps) | Financial issuer business type confirmed; SOTP collapses (single-segment); FCFF DCF not applicable; Capital IQ vendor proxy in lieu of audited Annual Report PDF |
| price-and-capital-structure | Price INR 84.03 pool-verified; market cap INR 155,267M (₹15,527 cr); net debt INR 1,954.1M (strict, excl. ₹96,072M investment portfolio); EV INR 157,221M (informational only — Financial issuer) | Insurer investment portfolio (₹96,072M) must NOT be netted against EV; equity-direct valuation required; dilution schedule absent — basic count 1,847.757M used as proxy |
| multiples-own-history | Only 6 quarterly data points (~18 months post-IPO Nov 2024); all own-history reversion values flagged illustrative-only; current P/NTM EPS (75.2×) at 93rd percentile of short range | Short listed history (<3 years) disqualifies own-history means/medians as fair-value inputs; no mean-reversion price target from this module enters `07` |
| relative-valuation-peers | Primary peer-implied value INR 75.8 (quality-adjusted P/E 38.3× on FY26 EPS ₹1.98); secondary INR 63.2 (ROE-scaled P/TBV 3.31×); current LTM P/E near-parity to SAHI median (42.4× vs 43.75×) is not warranted given ROE gap and above-100% combined ratio | NIVABUPA trades near the SAHI P/E peer median despite earning a lower ROE (10.7% vs 13–18%) and running an above-100% combined ratio — gap not warranted on quality-adjusted basis |
| intrinsic-dcf (RI model) | Base INR 19.94/share; bull INR 25.7; bear INR 15.4; all far below current price; 97% of intrinsic equity value is starting book equity | Company currently earns below its cost of equity (ROE 10.7% vs Ke 12.87%); zero-moat terminal condition; entire 9-cell sensitivity grid (INR 18.1–23.5) sits more than 3× below the current price |
| reverse-dcf | Implied peak ROE = 48.9% by FY30 to justify INR 84.03 — robust across entire Ke and BV₀ sensitivity grid (47–52%) | Required peak ROE is 2.7× the best peer ROE in Indian health insurance (ICICI Lombard 17.8%); 3× management's guided "mid-to-high-teens" ROE — structurally implausible given health insurance economics |
| sum-of-the-parts | SOTP collapses to consolidated read — single-segment (100% Health Insurance); dominant-segment sanity check yields INR 76.4–108.9 range at Star Health comparable multiples | No sub-segment EBIT to separate; whole value is the health insurance underwriting franchise; sanity-check range broadly consistent with peer multiples (not with intrinsic RI model) |
| scenario-and-fair-value | Bull INR 43.98 / Base INR 36.70 / Bear INR 16.51; margin of safety −129.0%; downside to bear 80.4%; price is above every scenario including bull | Method disagreement 73.7% (>40% threshold, triggering confidence cap); weighted 70% RI / 30% peer; structural-reset floor INR 16.12/share; stock priced above even the bull scenario |

---

## 3. Reconciliation

The two value-producing methods disagree on base-case fair value by 73.7% (INR 75.8 vs INR 19.94), far exceeding the 40% cross-method divergence threshold. This is the headline finding of the reconciliation — and it is a real economic disagreement, not a data artefact.

**Peer multiples (03) imply INR 75.8** (primary LTM P/E) to INR 63.2 (ROE-scaled P/TBV). These reflect what comparable listed insurers trade at in the market — i.e., the growth premium investors are willing to pay for the trajectory toward underwriting profitability. They partially corroborate the current price.

**The RI model (04) implies INR 19.94** (base) to INR 15.4–25.7 (full grid). This reflects economic value creation: when ROE (10.7%) is below the cost of equity (12.87%), the business destroys economic value in the near term, and with a "No moat proven" terminal condition, the franchise is worth only modestly above its current book value (INR 19.39/share). The dominant driver is not future excess returns — it is the starting book.

**Reconciled view:** The RI model carries 70% weight because it is the primary intrinsic method for a Financial issuer per MODULE_RULES, and because the reverse-DCF (05) independently confirms the peer-multiple-implied price embeds expectations (49% peak ROE) that have no precedent in this sector. The peer method carries 30% weight as the market anchor. The resulting weighted base of INR 36.70 — above the pure RI base but far below the peer implied value — acknowledges both lenses while giving primary weight to the economically grounded method. The 55-cap on valuation confidence applies because the 73.7% disagreement exceeds the 40% threshold and was not fully reconcilable (neither method is wrong; they are measuring different things: economic value vs market growth premium).

The zero-weighted methods are consistent with the active methods' direction on different bases: own-history (02, INR 77–82, illustrative-only) and SOTP sanity check (06, INR 76–109) both support the peer multiple range, not the RI range — reinforcing that the market-based methods converge near the current price, while the economic-value method finds deep overvaluation.

---

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N — price-state is `pool-verified` | MoS, downside-to-bear, observed up/down, attractiveness + confidence | Not triggered |
| No consensus / forward estimates | N — 10-analyst consensus present with FY27E–FY29E estimates | Valuation confidence | Not triggered |
| No peer data | N — 9-peer comps set with LTM and NTM multiples as-of 2026-06-04 | Overall usefulness | Not triggered |
| Only one valuation method usable | N — two active methods (03 peer, 04 RI) plus cross-check (05) | Valuation confidence | Not triggered |
| No cash flow AND DCF is only method | N — RI model used (not FCFF DCF); cash flow data present but not the intrinsic method here | Valuation confidence | Not triggered |
| SOTP not possible for multi-segment | N — company is single-segment; SOTP collapse is the correct outcome, not a multi-segment failure | Overall usefulness | Not triggered (no cap applies) |
| Methods disagree >40% unreconciled | **Y** — peer (INR 75.8) vs RI base (INR 19.94) = 73.7% gap, partially reconciled via weights | Valuation confidence | **Max 55** |
| Terminal value >75% of DCF EV | N — RI model is used, not FCFF DCF; terminal RI = 0 (ROE → Ke, no moat); terminal value as % of equity value is 0% (the terminal contribution is zero in the RI framework); book anchor drives 97% of value | Valuation confidence | Not triggered |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | N — governance module did NOT formally trigger RF-OWN-004; Bupa Group (55.35% promoter) assessed as broadly aligned with per-share value creation; related-party risk (brand/reinsurance fees) noted but unresolved, not a formal flag trigger | Valuation attractiveness | Not triggered; no cap; no mandatory value-trap flag from ownership structure |

**Most restrictive cap applied:** Methods disagree >40% → valuation confidence max 55. Final applied score: 52 (using judgment within the cap ceiling to reflect additional data-quality factors: no audited Annual Report PDF, absent dilution schedule, ~32-day price staleness, and thin SAHI peer set of 2 comps).

---

## 5. Fair-Value Summary

The bull/base/bear fair-value levels are INR 43.98 / INR 36.70 / INR 16.51, driven 70% by the residual-income (excess-return on equity) model and 30% by quality-adjusted peer multiples — the correct method mix for an IRDAI-regulated health insurer that currently earns below its cost of equity. The RI model dominates because for a Financial issuer, intrinsic value is the present value of equity plus future excess returns above the cost of equity: with FY26 ROE at 10.7% and Ke at 12.87%, those excess returns are negative in the near term, and with a "No moat proven" terminal condition, they fade to zero in perpetuity — leaving 97% of intrinsic equity value anchored to the current book of INR 19.39/share.

The current price of INR 84.03 implies a peak ROE of approximately 49% by FY30, which is 2.7× the best peer ROE in Indian health insurance and 3× management's own ambitious "mid-to-high-teens" guidance. No evidence in historical financials, management guidance, or sector benchmarks supports this implied expectation — the structural economics of health insurance (loss ratios above 60%, regulated EOM caps, investment yields near 7%) prevent a ROE anywhere near that level. The price is not a stretch above a reachable fair value; it is priced for an outcome the business model cannot deliver.

The margin of safety is −129.0% (the price is 129% above the base fair value of INR 36.70), meaning there is no cushion — the risk runs in the opposite direction. The downside to the bear case is 80.4% (from INR 84.03 to INR 16.51), representing the loss if GWP growth decelerates sharply, IRDAI disrupts EOM economics, or medical inflation accelerates — any of which could produce a compounding non-linear adverse scenario per the earnings-sensitivity module. Even the bull scenario (INR 43.98) is 47.7% below the current price, confirming the stock is above every scenario in the fair-value grid.

Value-trap risk from ownership structure is not formally triggered (Bupa Group assessed as broadly aligned). The apparent expensiveness is not a value trap in the structural-owner sense — it is straightforward overvaluation relative to the economics of the business at its current and projected profitability. The peer multiples (03) do tell a more forgiving story: at a quality-adjusted LTM P/E of 38.3×, the implied fair value of INR 75.8 sits close to the current price, reflecting the growth premium the market is paying for the trajectory toward underwriting profitability. The master synthesizer must decide whether to weight the market's growth-premium lens or the economic-value lens — this module's judgment is that the RI model is the primary correct method and that the reverse-DCF's implied ROE requirement of 49% makes the peer-multiple-implied price difficult to defend on fundamentals.

---

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Materially overvalued | Price falls to INR 36.70 (base fair value) — a 56% decline from INR 84.03; OR the company demonstrates ROE improvement materially faster than modelled (e.g., ROE reaches 15%+ by FY28, two years early), causing the RI base to rise above INR 25/share and the weighted base to exceed INR 40/share; OR peer multiples compress to SAHI median, lowering the peer anchor below INR 70 | Price rises further above INR 84 (deepening overvaluation); OR ROE trajectory reverses (IRDAI disrupts EOM, medical inflation widens loss ratio), moving the bear fair value to INR 12–14 and making the current price look even more disconnected; OR cost of equity rises 200+ bps on India sovereign risk, lowering all fair-value levels | FY27 full-year financials (to test whether EOM ratio declined 200 bps as guided and ROE exited FY27 above 11.5%); standalone IRDAI Annual Report PDF (to verify book equity and ROE denominator against audited figures rather than Capital IQ vendor proxy); IRDAI EOM cap regulation update (binary event that determines the bear vs base scenario probability); full dilution schedule (ESOP/RSU outstanding) |

---

## 7. Note To The Final Synthesizer

- **Fair-value levels and dominant method:** Bull INR 43.98 / Base INR 36.70 / Bear INR 16.51 per share, 12-month horizon. Driven 70% by the residual-income (RI / excess-return on equity) model and 30% by quality-adjusted peer LTM P/E. The RI model is the primary correct method for this Financial issuer (IRDAI-regulated health insurer) under MODULE_RULES. The peer method (INR 75.8, quality-adjusted P/E) is the market anchor and carries 30% weight because the thin SAHI peer set (2 comps) limits its standing. The cross-method dispersion (football field) runs from INR 19.94 (RI base) to INR 75.80 (peer P/E primary) — do not interpret the peer-based end of this range as a fair value without discounting it for the fundamental quality gap.

- **What the price implies and whether it's achievable:** At INR 84.03, the reverse-DCF (`05`) finds the market is pricing a peak ROE of approximately 49% by FY30 — nearly 3× management's most optimistic "mid-to-high-teens" guided ROE and 2.7× the best ROE observed in the Indian health insurance sector (ICICI Lombard 17.8%). This is structurally implausible. The implied requirement is not a case of optimistic but reachable expectations — it exceeds the structural capacity of health insurance economics. Not achievable.

- **Margin of safety AND downside to bear (two separate anchors):** Margin of safety = −129.0% (the price is 129% above the base fair value of INR 36.70; there is no cushion, the risk runs entirely toward downside). Downside to bear = 80.4% (loss from current price of INR 84.03 to the bear fair value of INR 16.51). The structural-reset floor is INR 16.12/share (P/BV at ROE/Ke = 0.831×, representing permanent stagnation at current profitability). These are the two numbers to carry to the master model.

- **Genuine value or value-trap risk, and the warranted-multiple argument:** The expensiveness is genuine overvaluation, not a value trap triggered by ownership structure. RF-OWN-004 was NOT formally triggered (Bupa Group broadly aligned). The warranted-multiple check (`07 §5`) is unambiguous: a P/BV of 4.33× requires a sustained ROE of 55.8% (= 4.33 × 12.87%) — a level the company has never approached and that exceeds every peer in the sector by a factor of 3×. At the current ROE of 10.7%, the warranted P/BV is approximately 0.83× (ROE/Ke), implying a warranted price of approximately INR 16/share. The gap to the current price of INR 84 is almost entirely a growth premium for the path to mid-teens ROE, not economic value creation today. The market is right that ROE will improve; it is paying as if that improvement will be extraordinary. It will not be.

- **Which method to trust and which to discount:** Trust the RI model (04) — it is the primary intrinsic method for this business type, its inputs are internally consistent, and its terminal condition is anchored to the "No moat proven" verdict. The reverse-DCF (05) corroborates it by showing the peer-multiple-implied price is unachievable. Discount the peer method (03) as a secondary lens only: the SAHI peer set is thin (Star Health + ICICI Lombard; Star lacks usable TBV multiple; CIQ NTM EPS for NIVABUPA is flagged unreliable), and the peer multiples reflect the market's growth premium rather than economic value. Discard own-history (02) and SOTP (06) as fair-value inputs — the former lacks sufficient history, the latter collapses to a consolidated read with no new information.

- **Partial-data caps applied:** None from the no-price tier (price is pool-verified). One cap applied: methods disagree >40% (73.7% gap) → valuation confidence capped at 55 (final: 52 after within-cap judgment). No other caps triggered.

- **Biggest missing data point:** The standalone IRDAI Annual Report PDF for FY26 (not in the pool). This is the primary audited document that would allow independent verification of book equity, ROE denominator, the exact combined ratio under IRDAI schedules, and the options/RSU dilution schedule — all of which are currently sourced from the Capital IQ vendor proxy. A confirmed book equity even 10% different from the CIQ figure shifts the implied peak ROE by approximately 2.5 percentage points (per the robustness grid in `05 §4b`) — which does not change the qualitative conclusion but would tighten the confidence interval on the RI-model fair value.

- **Explicit handoff:** The master synthesizer's "Valuation and Peer Mispricing" section should defer to this synthesis for the fair-value levels. The bull/base/bear fair-value levels here — INR 43.98 / INR 36.70 / INR 16.51 — are the inputs for the master's probability-weighted scenario model. The master assigns the probabilities (which this module does not do). The master should also note that even a high probability assigned to the bull scenario produces a negative expected return from the current price (bull fair value of INR 43.98 is 47.7% below INR 84.03), which is an unusual situation that constrains the risk/reward calculus regardless of scenario probabilities.

---

## 8. Simple Summary

- Niva Bupa is materially overvalued at INR 84.03: the stock is 56% above the base fair value of INR 36.70 and 91% above the bull fair value of INR 43.98 — no scenario in the valuation grid offers a positive return from the current price.
- Bull / Base / Bear fair-value levels (12-month): INR 43.98 / INR 36.70 / INR 16.51. The structural-reset floor is INR 16.12 (P/BV at permanent-stagnation ROE/Ke).
- The market is pricing a peak ROE of approximately 49% by FY30 — nearly 3× management's most optimistic "mid-to-high-teens" ROE guidance and 2.7× the best ROE observed in the Indian health insurance sector. That implied expectation is structurally implausible.
- The downside to the bear case is 80.4% (from INR 84.03 to INR 16.51); the margin of safety is −129.0% (no cushion — price is 129% above base fair value).
- The dominant method is the residual-income / excess-return on equity model (correct primary method for an IRDAI-regulated health insurer): with ROE at 10.7% below cost of equity (12.87%) and "No moat proven," 97% of intrinsic value is the starting book of INR 19.39/share, producing a base intrinsic of INR 19.94/share.
- Value-trap risk from ownership structure is not triggered (RF-OWN-004 not formally applied; Bupa Group broadly aligned). The expensiveness is fundamental overvaluation, not a structural trap.
- A pool-verified price (INR 84.03 from Capital IQ export) is available and was used throughout; ~32-day staleness is a caveat but immaterial given the magnitude of the overvaluation finding (56% to base, 80% to bear).
- This module is useful to the master synthesizer: the verdict is clear, directionally consistent across the active methods, and underpinned by a structural reverse-DCF finding that is robust across all tested inputs.



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — NIVABUPA

## 1. File Inventory

All 30 source files extracted successfully. 0 extraction failures. The three workbooks expand to 25 tabs.

| Filename / Tab | Type | Period Covered (from document) | Size | Valuation Relevance |
|---|---|---|---|---|
| **Niva Bupa Health Insurance Company Limited NSEI NIVABUPA Financials.xls** | Capital IQ financial export (multi-tab) | FY21–FY26 actual; FY27–FY29 estimates | 237 KB | High |
| ↳ Key Stats | Summary financials + current cap | FY22–FY26A; FY27–FY29E | — | High |
| ↳ Income Statement | Insurance-template P&L | FY21–FY26A | — | High |
| ↳ Balance Sheet | Insurance balance sheet | FY21–FY26A | — | High |
| ↳ Cash Flow | Operating / investing / financing | FY21–FY26A | — | High |
| ↳ Multiples | Quarterly historical multiples | Q4 FY25 – Q1 FY27 (Jun 2026) | — | High |
| ↳ Historical Capitalization | Quarterly EV bridge | Dec 2024 – Mar 2026 | — | High |
| ↳ Capital Structure Summary | Debt, equity, net debt | FY24–FY26A | — | High |
| ↳ Capital Structure Details | Debt instrument breakdown | FY24–FY26A | — | High |
| ↳ Ratios | Profitability, leverage, liquidity ratios | FY21–FY26A | — | Medium |
| ↳ Supplemental | Supplemental data | FY21–FY26A | — | Medium |
| ↳ Industry Specific | Insurance-specific metrics (GWP, claims) | FY21–FY26A | — | Medium |
| ↳ Pension OPEB | Pension/OPEB detail | FY21–FY26A | — | Low |
| ↳ Segments | Business segment breakdown | FY21–FY26A (consolidated from FY25) | — | Medium |
| **NivaBupaHealthInsuranceCompanyLimitedNSEINIVABUPAEstimatesReport.xls** | Capital IQ consensus estimates (multi-tab) | Data as of approx. Jun 2026 | 1.8 MB | High |
| ↳ Consensus | Analyst recommendations + EPS/Rev consensus | FY25–FY30E (10 estimates) | — | High |
| ↳ Recent Changes | Estimate revision activity | Recent prior quarters | — | Medium |
| ↳ Multiples | NTM/FY forward multiples (P/E, TEV/Rev, P/BV) | NTM FY27–FY30 | — | High |
| ↳ Surprise | Actual vs estimate history | Quarterly history | — | Medium |
| ↳ Trends | Estimate trend over time | Historical quarters | — | Medium |
| ↳ Revisions | Individual analyst revisions | Recent quarters | — | Low |
| **Company Comparable Analysis Niva Bupa Health Insurance Company Limited.xls** | Capital IQ comps export (multi-tab) | As-of 2026-06-04 | 117 KB | High |
| ↳ Financial Data | Peer financials + LTM/NTM metrics | LTM ending Apr–May 2026 | — | High |
| ↳ Trading Multiples | Peer trading multiples (LTM and NTM) | As-of 2026-06-04 | — | High |
| ↳ Operating Statistics | Peer operating stats | LTM | — | Medium |
| ↳ Business Description | Peer company descriptions | — | — | Low |
| ↳ Implied Valuation | Peer-implied valuation range for NIVABUPA | As-of 2026-06-04 | — | High |
| ↳ Valuation Chart | Chart data for valuation | — | — | Low |
| Niva Bupa Health Insurance Company Limited, Q4 2026 Earnings Call, May 08, 2026.pdf | Earnings transcript (NIVABUPA) | Q4 FY26 (Mar 2026) | 394 KB | Medium |
| Niva Bupa Health Insurance Company Limited, Q3 2026 Earnings Call, Jan 29, 2026.pdf | Earnings transcript (NIVABUPA) | Q3 FY26 (Dec 2025) | 321 KB | Medium |
| Niva Bupa Health Insurance Company Limited, Q2 2026 Earnings Call, Nov 03, 2025.pdf | Earnings transcript (NIVABUPA) | Q2 FY26 (Sep 2025) | 407 KB | Medium |
| Niva Bupa Health Insurance Company Limited, Q1 2026 Earnings Call, Jul 31, 2025.pdf | Earnings transcript (NIVABUPA) | Q1 FY26 (Jun 2025) | 383 KB | Medium |
| Niva Bupa Health Insurance Company Limited, Q4 2025 Earnings Call, May 07, 2025.pdf | Earnings transcript (NIVABUPA) | Q4 FY25 (Mar 2025) | 353 KB | Medium |
| Niva Bupa Health Insurance Company Limited, Q3 2025 Earnings Call, Feb 04, 2025.pdf | Earnings transcript (NIVABUPA) | Q3 FY25 (Dec 2024) | 380 KB | Low |
| Niva Bupa Health Insurance Company Limited, Q2 2025 Earnings Call, Nov 25, 2024.pdf | Earnings transcript (NIVABUPA) | Q2 FY25 (Sep 2024) | 172 KB | Low |
| HDFC Life Insurance Company Limited, Q4 2026 Earnings Call, Apr 16, 2026.pdf | Peer earnings transcript | Q4 FY26 | 432 KB | Medium |
| HDFC Life Insurance Company Limited, Q3 2026 Earnings Call, Jan 15, 2026.pdf | Peer earnings transcript | Q3 FY26 | 401 KB | Low |
| ICICI Lombard General Insurance Company Limited, Q4 2026 Earnings Call, Apr 15, 2026.pdf | Peer earnings transcript | Q4 FY26 | 423 KB | Medium |
| ICICI Lombard General Insurance Company Limited, Q3 2026 Earnings Call, Jan 13, 2026.pdf | Peer earnings transcript | Q3 FY26 | 401 KB | Low |
| SBI Life Insurance Company Limited, 2026 Earnings Call, Apr 22, 2026.pdf | Peer earnings transcript | Q4 FY26 | 411 KB | Low |
| SBI Life Insurance Company Limited, Q3 2026 Earnings Call, Jan 28, 2026.pdf | Peer earnings transcript | Q3 FY26 | 380 KB | Low |
| Star Health and Allied Insurance Company Limited, Q4 2026 Earnings Call, Apr 29, 2026.pdf | Peer earnings transcript | Q4 FY26 | 376 KB | Medium |
| Star Health and Allied Insurance Company Limited, Q3 2026 Earnings Call, Jan 29, 2026.pdf | Peer earnings transcript | Q3 FY26 | 384 KB | Low |
| Life Insurance Corporation of India, Q4 2026 Earnings Call, May 21, 2026.pdf | Peer earnings transcript | Q4 FY26 | 424 KB | Low |
| Life Insurance Corporation of India, Q3 2026 Earnings Call, Feb 05, 2026.pdf | Peer earnings transcript | Q3 FY26 | 386 KB | Low |
| The New India Assurance Company Limited, Q4 2026 Earnings Call, May 14, 2026.pdf | Peer earnings transcript | Q4 FY26 | 372 KB | Low |
| The New India Assurance Company Limited, Q3 2026 Earnings Call, Feb 06, 2026.pdf | Peer earnings transcript | Q3 FY26 | 168 KB | Low |
| The New India Assurance Company Limited - ShareholderAnalyst Call.pdf | Peer shareholder/analyst call | Undated (likely FY26) | 168 KB | Low |
| Niva Bupa Health Insurance Company Limited NSEI NIVABUPA Board Members.rtf | Governance data (Capital IQ) | As of export date | 185 KB | Low |
| Niva Bupa Health Insurance Company Limited NSEI NIVABUPA Compensation Summary Compensation.rtf | Compensation data (Capital IQ) | As of export date | 193 KB | Low |
| Niva Bupa Health Insurance Company Limited NSEI NIVABUPA Competitors.rtf | Competitor list (Capital IQ) | As of export date | 111 KB | Low |
| Niva Bupa Health Insurance Company Limited NSEI NIVABUPA Private Ownership.rtf | Private/promoter ownership (Capital IQ) | As of export date | 199 KB | Low |
| Niva Bupa Health Insurance Company Limited NSEI NIVABUPA Products.rtf | Product description (Capital IQ) | As of export date | 78 KB | Low |
| Niva Bupa Health Insurance Company Limited NSEI NIVABUPA Professionals.rtf | Management/professionals (Capital IQ) | As of export date | 208 KB | Low |
| Niva Bupa Health Insurance Company Limited NSEI NIVABUPA Public Ownership Summary.rtf | Public ownership summary (Capital IQ) | As of export date | 258 KB | Low |

**Note on annual filing:** No standalone audited Annual Report (IRDAI/SEBI LODR annual report PDF) or quarterly SEBI LODR results filing is present in the pool. The Capital IQ financial export (Financials.xls) is sourced from "Capital IQ & Proprietary Data" based on the company's own filings, stamped "Latest Filings" for restatement basis, and covers through FY26 (Mar-31-2026). This is a vendor secondary source for the filing numbers; the primary audited document is not in pool. Downstream agents must cite the Capital IQ export, not a filing directly.

---

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | India — NSE (NSEI:NIVABUPA) and BSE (BSE:544286) | Capital IQ Financials.xls Key Stats header; Estimates Consensus tab: "Current Fiscal Year End: Mar-31-2027" |
| Filing regime | India / SEBI-LODR (quarterly results under Reg 33; stock exchange intimations; IRDAI regulatory framework for insurance) | NSE/BSE dual listing confirmed in Consensus tab |
| Reporting standard | India GAAP (insurance template — IRDAI schedules); Capital IQ uses "Majority Accounting Standard" basis. The earnings module notes the company also maintains IFRS internally. | Income Statement tab: "Template: Insurance"; Estimates Consensus: "Acctg. Standard: Majority Accounting Standard" |
| Reporting currency (and scale) | INR — Indian Rupees. Financials stated in INR Millions (Capital IQ default). 1 crore = 10 million. | All financial sheets: "Currency: INR", "Units: S&P Capital IQ (Default)" |
| Fiscal-year end | 31 March (Indian standard). FY26 = Apr 2025 – Mar 2026. | Key Stats: "For the Fiscal Period Ending 12 months Mar-31-2026A" |

**US forms (10-K, 10-Q, 8-K) are not applicable.** NIVABUPA is an Indian-listed private health insurer. The local equivalents — IRDAI annual returns, SEBI LODR quarterly results, NSE/BSE intimations, and the Annual Report — are the reference documents. The Capital IQ export is the proxy for those in this pool.

---

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months, as of 2026-06-22) |
|---|---|---|---|
| Annual filing (proxy via vendor) | Niva Bupa … Financials.xls → Income Statement / Balance Sheet / Cash Flow tabs | FY26 (12 months Mar-31-2026) | ~3 months |
| Quarterly filing / transcript | Niva Bupa … Q4 2026 Earnings Call, May 08, 2026.pdf | Q4 FY26 (Mar 2026) | ~1.5 months |
| Capital structure / balance sheet | Niva Bupa … Financials.xls → Capital Structure Summary tab | As of Mar-31-2026 | ~3 months |
| Consensus / estimate export | NivaBupaHealthInsuranceCompanyLimitedNSEINIVABUPAEstimatesReport.xls → Consensus tab | Approx. Jun 2026; 10 estimates for FY27E | ~0 months |
| Multiples export | Niva Bupa … Financials.xls → Multiples tab | Through 2026-06-03 (latest close) | ~0.6 months |
| Peer / comps export | Company Comparable Analysis … .xls → Trading Multiples / Financial Data / Implied Valuation tabs | As-of 2026-06-04 | ~0.6 months |
| Current price (Capital IQ) | Niva Bupa … Financials.xls → Key Stats tab (Current Capitalization block) | Share price INR 84.03; Historical Capitalization: pricing as of 2026-05-21 (INR 83.62) | ~1 month |
| Cash flow statement | Niva Bupa … Financials.xls → Cash Flow tab | FY26 (12 months Mar-31-2026) | ~3 months |
| Segment data | Niva Bupa … Financials.xls → Segments tab | FY25–FY26A (consolidated into single "Health Insurance" segment) | ~3 months |

**Price note:** The Key Stats tab states share price INR 84.03 against current capitalization (no explicit "as of" date on this specific cell; the Historical Capitalization tab shows pricing as of 2026-05-21 at INR 83.62, the most recently dated price in pool). The INR 84.03 price is the more recent figure (consistent with a Jun 2026 data pull, ~18 days before today). Both are pool-sourced from Capital IQ. Price-state: **pool-verified** (Capital IQ export); staleness caveat noted — latest confirmed dated price is 2026-05-21 at INR 83.62. Downstream agents should use the INR 84.03 figure from Key Stats as the current price and flag the ~1-month staleness.

---

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | Niva Bupa … Financials.xls → Key Stats (INR 84.03); Historical Capitalization (INR 83.62 as of 2026-05-21) | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | Key Stats: 1,847.76 million shares (basic); Estimates Consensus: same figure | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Partial | Key Stats uses "Dilution: Basic"; no separate option/RSU schedule in pool | Needed for fully diluted per-share fair value — basic vs diluted gap unknown from pool alone; cross-module earnings output may supplement |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y | Income Statement template = "Insurance"; IRDAI-regulated health insurer — Financial issuer (insurer) | Determines which valuation methods are valid; per MODULE_RULES Business-Type Map, an insurer is valued via DDM / residual-income / excess-return on equity (P/E, P/Tangible Book, P/Embedded Value); EV-based multiples and FCFF DCF are secondary / informational |
| Total debt, cash, minority/preferred | Y | Capital Structure Summary tab: Total Debt INR 3,540.7 M; Cash INR 1,586.6 M; Net Debt INR 1,954.1 M; no minority or preferred (FY26) | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | Income Statement tab: FY26 (12 months Mar-31-2026); Total Revenue INR 84,434.6 M; EBIT INR 5,015.4 M; Net Income INR 3,661.4 M | Earnings base for multiples |
| Cash flow statement | Y | Cash Flow tab: FY26 CFO INR 9,287.2 M; Capex INR -56 M (PP&E) + INR -430.4 M (intangibles) = ~INR -486 M total | FCF base for DCF — note: for an insurer, operating cash flows include large investment portfolio flows; FCF interpretation requires care |
| Forward estimates (consensus) | Y | Estimates Consensus tab: 10 analysts; EPS FY27E mean 1.117 INR, FY28E 2.365 INR; Revenue FY27E 86,405 M; Estimates Multiples tab: NTM P/E 75.2x, FY28E P/E 35.5x | NTM/FY multiples and near-term path |
| Historical multiple data | Y | Niva Bupa … Financials.xls → Multiples tab: quarterly P/E, P/NTM EPS, TEV/EBITDA, TEV/Revenue from Q4 FY25 through Jun 2026 | Own-history re-rating read |
| Peer / comps data | Y | Company Comparable Analysis .xls → Trading Multiples + Financial Data + Implied Valuation tabs: 9 insurance peers (Star Health, ICICI Lombard, SBI Life, HDFC Life, NIACL, LIC, etc.), as-of 2026-06-04 | Relative valuation and peer implied-value range |
| Segment-level revenue & EBIT | Partial | Segments tab: FY25–FY26 consolidated into single "Health Insurance" segment (no sub-segment EBIT); sub-segments (Health–Health, Personal Accident, Travel) shown only for FY21–FY23 with revenue only, no EBIT split | SOTP: company is effectively single-segment from FY25 onward — SOTP collapses to consolidated read per MODULE_RULES |
| Dividend / buyback data | N | No dividend or buyback data in pool; Capital IQ Ratios tab shows no dividend yield figure; insurer in growth phase | Shareholder-yield read not applicable for current period |

---

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/03_segment-map.md | Y |
| business-model/08_competitive-map.md | Y |
| business-model/07_business-quality.md | Y |
| business-model/09_moat.md | Y |
| business-model/10_external-dependency.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/04_guidance-consensus.md | Y |
| earnings/03_margin-drivers.md | Y |
| earnings/07_earnings-sensitivity.md | Y |
| earnings/06_earnings-quality.md | Y |

All 10 cross-module outputs are present and available. Management-governance module is also complete (`analyses/NIVABUPA_2026-06-22/management-governance/`), including `04_ownership-and-insider-behavior.md` and `99_management-governance-synthesis.md` — the RF-OWN-004 flag read is available for the value-trap adjudication.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N | — | Not triggered; pool-verified price available (INR 84.03 from Capital IQ Key Stats; staleness ~1 month is a data-quality caveat, not a no-price trigger per MODULE_RULES) |
| No consensus / forward estimates | N | — | Not triggered; 10-analyst consensus present with FY27E–FY29E estimates |
| No peer data | N | — | Not triggered; 9-peer comps set with LTM and NTM multiples, as-of 2026-06-04 |
| No segment-level data | Partial | 06 | FY25–FY26 Segments tab shows single "Health Insurance" segment only; no material EBIT sub-segment breakdown. However, per MODULE_RULES §Segment/SOTP Rule: >85% of EBIT from one segment → SOTP collapses to consolidated read. Agent 06 will return a "single-segment — SOTP collapses to consolidated read" note. No cap applied (not a multi-segment business) |
| No balance sheet / capital structure | N | — | Not triggered; Capital Structure Summary and Balance Sheet tabs present through FY26 |
| No cash flow statement | N | — | Not triggered; Cash Flow tab present through FY26; however, agents must note that an insurer's CFO includes large investment portfolio movements — FCF interpretation requires care |

**Critical business-type note:** NIVABUPA is an IRDAI-regulated health insurer — a **Financial issuer** per MODULE_RULES Business-Type Map. The primary valuation methods are DDM / residual-income / excess-return on equity, and P/E, P/Tangible Book, P/Embedded Value multiples. EV-based multiples (EV/EBITDA, FCFF DCF) are secondary / informational only — the EV bridge in agent 01 will be produced for context but is NOT the primary valuation anchor. Agents must apply the Financial issuer method map.

---

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Quarterly P/E, P/NTM EPS, TEV/Revenue, TEV/EBITDA from Q4 FY25 through Jun 2026 available; use P/E and P/Tangible Book as primary (insurer); EV multiples secondary |
| Peer relative valuation | Y | None | 9-peer comps with LTM and NTM multiples as-of 2026-06-04; Star Health is closest listed comparable (pure-play standalone health insurer) |
| Intrinsic DCF (Operating FCFF) | Partial | Business-type mismatch | FCFF DCF is secondary/informational for an insurer (MODULE_RULES Financial issuer map); preferred intrinsic method is residual-income / excess-return on equity or DDM. Cash flow data exists but the CFO includes large investment flows that are the business (not capex-like for an insurer). Flag as informational only. Confidence capped accordingly. |
| Reverse DCF | Partial | Business-type constraint | Can be run on P/E or residual-income basis (what earnings growth / ROE the current price implies). Cannot be run as an operating FCFF reverse-DCF in the standard sense for an insurer. Depends on agent 04 output. |
| SOTP | N | Single segment from FY25 onward | Segments tab shows all FY25–FY26 revenue and profit under one "Health Insurance" bucket — no sub-segment EBIT to value separately. Agent 06 will return a single-segment note. No blocking cap (this is intentional per MODULE_RULES) |

---

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** Pool contains a full income statement, balance sheet, and cash flow through FY26; a current pool-verified price (INR 84.03); a 10-analyst consensus with FY27E–FY29E estimates; historical quarterly multiples through June 2026; and a 9-peer comps set as-of 2026-06-04 — meeting all four sufficiency conditions (earnings/cash-flow base, capital structure, at least one forward/relative input, and current price).
- **Methods that can run:** own-history multiples (P/E, P/TangBV as primary for insurer); peer relative valuation; residual-income / excess-return-on-equity intrinsic valuation (preferred intrinsic method for Financial issuer); reverse-DCF on implied ROE / earnings growth basis. SOTP collapses to consolidated read (single-segment business from FY25 onward — this is expected, not a data gap).
- **Active partial-data caps:** None triggered. (SOTP "not possible as a multi-segment analysis" is not applicable here because the business is effectively single-segment — no cap fires.)
- **Critical missing items:**
  - No standalone audited Annual Report PDF (IRDAI schedules) in pool — financials sourced via Capital IQ vendor export; agents must cite the vendor export, not the filing directly.
  - Dilution schedule (options/RSUs) absent — per-share fair value will default to basic share count (1,847.76 M) with a stated limitation.
  - Embedded value (EV actuarial) disclosure not in pool — limits the P/Embedded Value multiple method, though health insurers typically do not disclose EV in the same way life insurers do; this is not a gap unique to the pool.
  - Business-type reminder: EV-based multiples and FCFF DCF are secondary/informational for this Financial issuer; agents must apply the MODULE_RULES insurer method map.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — NIVABUPA

**Company:** Niva Bupa Health Insurance Company Limited (NSEI:NIVABUPA / BSE:544286)
**Reporting standard:** India GAAP (IRDAI insurance template); company also voluntarily reports IFRS internally. All financial figures from Capital IQ vendor export based on India GAAP filings.
**Reporting currency:** INR (Indian Rupees). Figures in INR Millions unless noted. 1 crore = 10 million.
**Fiscal year:** 31 March. FY26 = April 2025 – March 2026.
**Listing jurisdiction:** India — NSE and BSE (detected from Capital IQ Financials.xls Key Stats header; US forms 10-K/10-Q are not applicable).
**Business type (per MODULE_RULES Business-Type Map):** Financial issuer — IRDAI-regulated health insurer. The EV bridge in this report is **informational only**; valuation must be done on an equity-direct basis (P/E, P/Tangible Book, excess-return on equity, DDM). EV-based multiples and FCFF DCF are secondary/informational for this entity.

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | INR 84.03 | Capital IQ Financials.xls → Key Stats tab, Current Capitalization block | As-of date of quote not explicitly stated on the Key Stats tab itself (pool-sourced, as-of date unconfirmed — export downloaded ~Jun 2026) |
| Latest confirmed-dated price | INR 83.62 | Capital IQ Financials.xls → Historical Capitalization tab, Pricing as of column for the Mar-31-2026 period | 2026-05-21 (32 days before today's analysis date of 2026-06-22) |
| Currency | INR | Capital IQ Financials.xls, Key Stats and Historical Capitalization tabs | — |
| Price basis | Last close, pool-sourced from Capital IQ export | Capital IQ Financials.xls | Key Stats quote: ~Jun 2026; confirmed dated close: 2026-05-21 |
| 52-week high / low | INR 92.90 / 67.50 | Capital IQ Estimates Consensus tab, Market Summary section | As of export date ~Jun 2026 |

**Price-state determination:** The price of INR 84.03 is pool-sourced from a Capital IQ export (vendor tier, §4 tier 5). The export file's download date is approximately June 2026 but the Key Stats price cell carries no explicit "as of" timestamp within the export itself. The most recently dated close in the pool is INR 83.62 as of 2026-05-21 (from Historical Capitalization tab). The difference between the two (INR 84.03 vs. INR 83.62) is 0.5% — consistent with normal daily trading. The Estimates Consensus tab also shows "Latest Price/Last Close Price: 81.95/84.03" for NSEI:NIVABUPA, corroborating INR 84.03 as the last close. **Price-state: `pool-verified`** (the price is from the data pool; the as-of date is unconfirmed at the exact cell level, which is a staleness caveat, not a no-price trigger per MODULE_RULES Score-Cap rules). The ~1-month staleness between today's analysis date and the confirmed 2026-05-21 dated close is a data-quality deduction that downstream multiples and margin-of-safety calculations inherit; it does not trigger the no-price Score-Cap row.

**Corroboration:** Two Capital IQ export sources agree on INR 84.03 (Key Stats tab and Estimates Consensus Market Summary tab). The Historical Capitalization tab independently shows INR 83.62 on 2026-05-21. The Comps export (as of 2026-06-04) shows NIVABUPA at USD 0.88, which at an implied INR/USD rate of ~95.8 equals INR 84.3 — consistent with the INR 84.03 figure. Three independent data points within the pool agree within ~0.4%.

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (most recent, Key Stats) | 1,847.757 million | Capital IQ Financials.xls → Key Stats tab, Shares Out. row, Current Capitalization block |
| Basic shares outstanding (balance sheet date, FY26) | 1,847.457 million | Capital IQ Financials.xls → Balance Sheet tab, Supplemental row 65 (Total Shares Out. on Filing Date; FY26 = Mar-31-2026) |
| Diluted weighted-average shares (FY26 income statement basis) | Not separately disclosed in pool; Key Stats note "Dilution: Basic" | Capital IQ Financials.xls → Key Stats tab, header row 8 |
| Options / RSUs / warrants (dilutive instruments) | Not available in pool — no option schedule or dilution table present | Data pool; Capital IQ financial export does not include the detailed equity-compensation schedule for this issuer |
| Convertibles / potential shares | No convertibles in debt structure; subordinated NCDs are non-convertible (10.70% NCDs, unsecured) | Capital IQ Financials.xls → Capital Structure Details tab, FY26 section |
| **Fully diluted shares (TSM + if-converted)** | **Cannot be computed** — dilution detail absent; using 1,847.757M as proxy | Data pool — limitation: may understate diluted count if untracked stock options or RSUs exist |
| Share count used for market cap | 1,847.757 million (Key Stats most recent) | Capital IQ Financials.xls → Key Stats tab |
| Share count used for per-share fair value | 1,847.757 million (basic, used as proxy for diluted — stated limitation) | Capital IQ Financials.xls → Key Stats tab; no dilution schedule available |

**Share count reconciliation:**

| Component | Shares (millions) | Source |
|---|---:|---|
| Basic shares outstanding (most recent) | 1,847.757 | Key Stats tab, Current Capitalization block |
| + Dilutive options / RSUs (TSM) | Not available | Not disclosed in pool |
| + Convertible instruments (if-converted) | Nil — NCDs are non-convertible | Capital Structure Details tab |
| **= Proxy fully diluted shares** | **1,847.757** | Basic as proxy |

The difference between the Key Stats current figure (1,847.757M) and the balance sheet filing-date figure (1,847.457M) is 0.300M shares (0.016%), consistent with minor stock-compensation vesting between the balance sheet date (March 31, 2026) and the data export date. This is immaterial. No gap adjustment is required.

**Limitation:** A full dilution schedule (option strike prices, RSU vesting schedules, ESOP outstanding) is absent from the pool. The basic share count of 1,847.757M is used for both market cap and per-share fair value. If significant unexercised options or unvested RSUs exist, the fully diluted count could be modestly higher. Downstream agents should flag this when computing per-share intrinsic value. The company's FY26 diluted EPS of INR 1.98 (per Key Stats) uses the same basic count (Key Stats notes "Dilution: Basic"), suggesting dilution from options is either negligible or not separately computed in the vendor export for this issuer.

---

## 3. Market Capitalization

`Market cap = share count × current price = 1,847.757M × INR 84.03 = INR 155,267.0M`

(= INR 15,526.7 crores)

Cross-check: Capital IQ Key Stats tab states Market Capitalization = INR 155,267.043M — matches to the nearest million. Arithmetic verified.

| Item | Value | Source |
|---|---|---|
| Share count | 1,847.757 million | Capital IQ Key Stats tab |
| × Price per share | INR 84.03 | Capital IQ Key Stats tab |
| **= Market capitalization** | **INR 155,267.0M (₹15,527 crores)** | Calculated; confirmed in Key Stats |

---

## 4. Enterprise Value Bridge

**Critical business-type caveat (read first).** Niva Bupa is an IRDAI-regulated health insurer — a Financial issuer per MODULE_RULES Business-Type Map. For an insurer, the EV bridge is **informational only**. The investment portfolio (INR 96,072.9M in FY26) is the primary underwriting asset that matches policyholder liabilities; it is not a surplus cash balance and must NOT be netted from EV. The Capital IQ cash line of INR 1,586.6M represents genuine operating cash (cash and bank balances separate from the investment portfolio), and this is the only item netted. The full investment portfolio is the insurer's core business asset and does not reduce enterprise value.

| Component | Amount (INR M) | Source |
|---|---:|---|
| Market capitalization | 155,267.0 | Calculated (Key Stats) |
| + Total debt — subordinated NCDs | 2,540.4 | Capital IQ Capital Structure Details tab, FY26; 10.70% Sub NCDs (Nov 2031 + Mar 2032 maturities) |
| + Total debt — lease liabilities | 1,000.3 | Capital IQ Capital Structure Summary tab, FY26; Ind AS 116 lease liability |
| + Total debt (combined) | 3,540.7 | Capital IQ Capital Structure Summary tab, FY26 |
| + Minority / non-controlling interest | — | Key Stats: nil; confirmed in Historical Capitalization and Capital Structure Summary |
| + Preferred equity | — | Key Stats: nil; no preferred shares in issue |
| + Operating lease liabilities | Already included in Total Debt above (lease liabilities are capitalised under Ind AS 116 and included in Capital IQ's Total Debt figure) | Capital Structure Summary tab, FY26 |
| + Underfunded pension / OPEB | INR 23.6M net unfunded defined benefit obligation (immaterial: <0.01% of EV) | Capital IQ Pension OPEB tab, FY26 — Net Asset/Liability row = (23.6)M |
| − Cash & equivalents (operating cash only) | (1,586.6) | Capital IQ Capital Structure Summary tab, Additional Totals row; Balance Sheet tab row 21 (Cash and Equivalents). This is the operating cash balance, not the investment portfolio. |
| − Investment portfolio (insurer underwriting assets — NOT netted) | See note below | Balance Sheet tab FY26: Investment in Debt Securities INR 90,410.9M + Other Investments INR 5,662.0M = Total Investments INR 96,072.9M |
| **= Enterprise value (EV)** | **157,221.1** | Calculated; confirmed in Key Stats (TEV = 157,221.143M) |

(= INR 15,722.1 crores)

**Cross-check:** INR 155,267.0M + INR 3,540.7M − INR 1,586.6M = INR 157,221.1M. Matches Key Stats TEV to the nearest INR 0.1M.

**Adjustments NOT made (and why):**

1. **Investment portfolio (INR 96,072.9M) not netted.** A health insurer's investment portfolio matches policyholder reserves and regulatory solvency capital — it is the underwriting business itself, not surplus cash. Netting it against EV (as a data vendor might do under a "broad cash" definition) would produce a meaningless and deeply negative net debt figure of approximately INR −94,118.8M, which would imply a negative EV of approximately INR 61,148.2M. That result is not informative and is not a valid EV. Only the INR 1,586.6M of operating cash (per the balance sheet Cash and Equivalents line, separate from Total Investments) is netted.

2. **Operating leases.** Already capitalised and included in the INR 3,540.7M Total Debt figure (Capital Structure Summary shows INR 1,000.3M Lease Liabilities as a component of Total Debt). No separate add-back required.

3. **Pension underfunding.** The net defined benefit obligation is INR 23.6M (per Pension OPEB tab). This is less than 0.02% of EV and is immaterial. Not added to EV.

4. **Contingent claims.** No material contingent liability is disclosed from pool data; the Pension OPEB tab and Capital Structure Details do not show any other off-balance-sheet obligations.

---

## 5. Net Debt & Leverage Snapshot

**Net debt definition:** Total debt − cash and equivalents (strict basis, per CLAUDE.md §15). The insurer's investment portfolio is excluded from the cash side as explained in §4.

| Metric | Value | Source |
|---|---:|---|
| Total debt | INR 3,540.7M | Capital IQ Capital Structure Summary tab, FY26 |
| — of which: subordinated NCDs | INR 2,540.4M | Capital Structure Details, FY26 |
| — of which: lease liabilities (Ind AS 116) | INR 1,000.3M | Capital Structure Details, FY26 |
| Cash & equivalents (operating cash only) | INR 1,586.6M | Balance Sheet tab, FY26; Capital Structure Summary Additional Totals |
| **Net debt (strict: total debt − cash)** | **INR 1,954.1M** | Calculated; confirmed in Capital Structure Summary Additional Totals row (Net Debt = 1,954.1) |
| Net debt / FY26 EBITDA (vendor-derived; GAAP basis) | 0.38× | Calculated: 1,954.1 / 5,147.9 = 0.38×; confirmed in Capital Structure Summary (Credit Ratios: Net Debt/EBITDA = 0.367 — minor rounding difference vs using rounded EBITDA figure) |

**Basis label:** Net debt is stated on the **strict** basis (total debt − cash and equivalents). No liquid investments are netted. A broad-basis figure netting the investment portfolio would be deeply misleading for an insurer and is not presented. The Capital IQ Capital Structure Summary also shows "Total Cash & ST Investments = 1,586.6" for FY26, confirming that their "cash" line equals the operating cash balance alone (the investment portfolio is classified separately in the Balance Sheet as Total Investments, not as Cash & ST Investments by Capital IQ for this insurer).

**Leverage context:** Net debt of INR 1,954.1M (INR 195 crores) against total equity of INR 35,824.4M (INR 3,582 crores) gives a net debt/equity ratio of 5.5%. Leverage is very low. The subordinated NCDs of INR 2,540.4M carry a fixed coupon of 10.70% and mature in November 2031 and March 2032 — long-dated, fixed-rate, no near-term refinancing pressure (next maturity in the fixed-payment schedule is INR 357M in the first year, predominantly lease principal). EBIT/interest expense of 13.6× (Ratios tab, FY26) confirms comfortable interest coverage.

---

## 6. Per-Share Reference Values

All per-share figures use 1,847.757M shares (Key Stats most recent basic count, proxy for fully diluted given dilution schedule unavailability — stated limitation).

| Metric | Per Share (INR) | Source |
|---|---:|---|
| Book value per share | 19.39 | Calculated: 35,824.4M / 1,847.757M; cross-check: Capital IQ Key Stats shows P/BV close of 4.333× on price 84.03 → implied BV/share = 84.03 / 4.333 = 19.40 ✓ (rounding only) |
| Tangible book value per share | 19.11 | Calculated: 35,308.6M tangible BV / 1,847.757M; confirmed in Capital IQ Balance Sheet tab row 70 (19.112 per share using filing-date count of 1,847.457M — immaterial rounding difference) |
| Net debt per share (strict) | 1.06 | Calculated: 1,954.1M / 1,847.757M |
| Current price | 84.03 | Capital IQ Key Stats tab |
| Price / Book value | 4.33× | Calculated: 84.03 / 19.39; confirmed Key Stats P/BV close FY26 = 4.333× |
| Price / Tangible Book value | 4.40× | Calculated: 84.03 / 19.11; confirmed Key Stats Price/Tang BV close FY26 = 4.397× |
| Price / FY26 EPS (reported) | 42.4× | Calculated: 84.03 / 1.98; confirmed Key Stats P/LTM EPS close FY26 = 42.44× |

**Note on goodwill:** Capital IQ Balance Sheet tab shows no goodwill (row 30 = "−" for all years including FY26). The only intangible is Other Intangibles of INR 515.8M (capitalised software/platform). Tangible book value is therefore INR 35,824.4M − INR 515.8M = INR 35,308.6M, confirming the Capital IQ Tangible Book Value of INR 35,308.6M in row 69 of the Balance Sheet tab.

---

## 7. Anchor Summary (canonical numbers for downstream agents)

### Anchor Block (copy-forward)

- **Price:** INR 84.03 (pool-sourced; last confirmed dated close INR 83.62 as of 2026-05-21; Key Stats and Estimates Consensus tab corroborate INR 84.03 as most recent close; ~1-month staleness caveat)
- **Price-state:** `pool-verified` — price is from the Capital IQ data pool; as-of date unconfirmed at the Key Stats cell level (staleness is a data-quality caveat, not a no-price trigger per MODULE_RULES)
- **Currency:** INR (Indian Rupees)
- **Shares (market cap):** 1,847.757 million (Capital IQ Key Stats tab, most recent basic count)
- **Shares (per-share fair value):** 1,847.757 million (basic, used as proxy for fully diluted — limitation: dilution schedule absent from pool; no convertibles exist; dilution from options/RSUs unknown but the Key Stats EPS uses the same basic count, suggesting dilution is either small or not computed by the vendor for this issuer)
- **Market cap:** INR 155,267.0M (INR 15,527 crores)
- **Net debt (strict):** INR 1,954.1M (INR 195 crores) — total debt INR 3,540.7M minus operating cash INR 1,586.6M. Insurer investment portfolio (INR 96,072.9M) is NOT netted.
- **EV (informational only — Financial issuer):** INR 157,221.1M (INR 15,722 crores) — informational bridge; downstream valuation must be equity-direct (P/E, P/TBV, residual income / excess-return on equity). EV-based multiples are secondary.
- **Key caveats:**
  1. Business type is **Financial issuer (insurer)**. MODULE_RULES Business-Type Map requires equity-direct valuation. EV bridge is informational only.
  2. Investment portfolio of INR 96,072.9M is the insurer's core underwriting asset — not a surplus cash balance to net against EV. Only INR 1,586.6M of operating cash is netted in the strict net-debt calculation.
  3. Dilution detail (options/RSU schedule) is absent from the pool. The 1,847.757M share count is basic and used as the proxy for fully diluted — a stated limitation that carries through to all per-share fair-value outputs.
  4. Price as-of date is unconfirmed at the Key Stats level; latest confirmed-dated close is INR 83.62 on 2026-05-21 (~32 days before this analysis). Downstream multiples and margin-of-safety calculations inherit this ~1-month staleness risk.
  5. No standalone audited IRDAI Annual Report PDF is in the pool. All financial figures are from the Capital IQ vendor export (§4 tier 5), described as restated from IRDAI/Companies Act filings. Downstream agents must cite the Capital IQ export, not the filing.
  6. Operating lease liabilities (INR 1,000.3M) are already capitalised in the Ind AS 116 balance sheet and included in the Total Debt figure. No separate adjustment is needed.

---

*Agent: price-and-capital-structure*
*Output: analyses/NIVABUPA_2026-06-22/valuation/01_price-and-capital-structure.md*



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — NIVABUPA

**Company:** Niva Bupa Health Insurance Company Limited (NSEI:NIVABUPA / BSE:544286)
**Reporting currency:** INR (Indian Rupees). All monetary figures in INR Millions unless noted. 1 crore = 10 million.
**Reporting standard:** India GAAP (IRDAI insurance template); vendor figures from Capital IQ export (§4 tier 5).
**Fiscal year end:** 31 March. FY26 = April 2025 – March 2026.
**Business type:** Financial issuer (IRDAI-regulated health insurer). Per MODULE_RULES Business-Type Map, primary multiples are **P/E and P/Book**. EV-based multiples (EV/EBITDA, EV/EBIT, EV/Sales) are secondary / informational only for this entity and are included for completeness with an explicit flag — they must not be the anchor for any equity valuation.
**Listing date:** November 2024. The company has been publicly listed for approximately 18 months. **The own-history series covers only 6 quarterly observation points (March 2025 through June 2026) — shorter than the ~3-year threshold.** The short-history partial-data rule applies throughout this report.

**Anchor numbers (verbatim from `01_price-and-capital-structure.md`):**
- Price: INR 84.03 (pool-verified; last confirmed dated close INR 83.62 on 2026-05-21; ~1-month staleness caveat)
- Market cap: INR 155,267M (INR 15,527 crores)
- Shares: 1,847.757 million (basic, proxy for fully diluted — dilution schedule absent from pool)
- EV (informational only): INR 157,221M

---

## 1. Current Multiples

All multiples use anchor price INR 84.03 and are on **reported** metrics unless stated otherwise. EPS is India GAAP reported. All data: Capital IQ Financials.xls Key Stats tab and EstimatesReport.xls Multiples tab, export as of ~June 2026.

| Multiple | Basis | Metric Value (INR M or INR/share) | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E (reported EPS) | LTM (FY26A) | EPS INR 1.98/share | **42.4×** | Capital IQ Financials.xls, Key Stats tab; P/LTM EPS Close for Q ending Jun-2026 = 42.44× |
| P / E (normalized EPS) | LTM (FY26A) | EPS Normalized INR 0.71/share (Capital IQ adjusted) | **118.3×** | Capital IQ EstimatesReport.xls, Surprise tab, FY2026 EPS Normalized actual = 0.71; price 84.03 / 0.71 |
| P / E (consensus) | NTM (FY27E) | EPS Normalized est. INR 1.12/share (7-analyst mean) | **75.0×** | Capital IQ EstimatesReport.xls Multiples tab: P/NTM EPS Close = 75.22×; confirmed 84.03/1.12 = 75.0× |
| P / E (GAAP consensus) | FY27E | EPS GAAP est. INR 1.14/share (5-analyst mean) | **73.7×** | Capital IQ EstimatesReport.xls: FY2027 EPS GAAP mean = 1.14; 84.03/1.14 = 73.7× |
| EV / Sales | LTM (FY26A) [INFO ONLY — insurer] | Revenue INR 84,435M | **1.86×** | Capital IQ Financials.xls, Key Stats tab: TEV/Total Revenue FY26A = 1.862× |
| EV / Sales | NTM (FY27E) [INFO ONLY — insurer] | Revenue est. INR 86,406M (4-analyst mean) | **1.82×** | Capital IQ EstimatesReport.xls Multiples tab: TEV/NTM Revenue Close = 1.820× |
| EV / EBITDA | LTM (FY26A) [INFO ONLY — insurer] | EBITDA INR 5,148M | **30.5×** | Capital IQ Financials.xls, Key Stats tab: TEV/EBITDA FY26A = 29.53×; cross-check 157,221/5,148 = 30.5× |
| EV / EBIT | LTM (FY26A) [INFO ONLY — insurer] | EBIT INR 5,015M | **31.3×** | Capital IQ Financials.xls, Key Stats tab: TEV/EBIT FY26A = 31.35×; cross-check 157,221/5,015 = 31.3× |
| EV / EBIT | NTM (FY27E) [INFO ONLY — insurer] | EBIT est. INR 988M (consensus) | **159.1×** | Capital IQ EstimatesReport.xls Multiples tab: TEV/NTM EBIT = 159.13×; consensus EBIT is very low in FY27E under 1/N |
| P / Book | LTM (FY26A) | BV/share INR 19.39 | **4.33×** | Capital IQ Financials.xls, Key Stats tab: P/BV FY26A = 4.333×; cross-check 84.03/19.39 = 4.33× |
| P / Tangible Book | LTM (FY26A) | TBV/share INR 19.11 | **4.40×** | Capital IQ Financials.xls, Key Stats tab: P/TangBV FY26A = 4.397×; cross-check 84.03/19.11 = 4.40× |
| Dividend yield | LTM (FY26A) | No dividend declared | **Nil** | Niva Bupa has not declared dividends; company is in early-stage profit build; inference from no dividend disclosure in pool |
| P / FCF | LTM (FY26A) | FCF INR 8,801M / shares 1,847.757M = INR 4.76/share | NM | Capital IQ Financials.xls, Cash Flow tab; insurer FCF is driven by policyholder premium reserves (1/N transition) and is not a stable operating metric — Capital IQ marks this "NM" |

**Notes on EPS divergences:**
- The wide gap between reported P/E (42×) and normalized P/E (118×) reflects the 1/N India GAAP accounting basis. Full-year FY26 reported EPS (INR 1.98) includes Q4's large accounting profit recovery (Q4 FY26 EPS INR 1.86), while Capital IQ's normalized EPS of INR 0.71 strips out certain items. Neither is ideal as a standalone anchor; the forward NTM multiple (75×) on FY27E normalized consensus of INR 1.12 is more stable.
- EV/EBIT NTM (159×) is extremely elevated because EBIT consensus for FY27E is only INR 988M — the 1/N accounting effect compresses the IFRS EBIT line sharply in early-year quarters. This multiple is not meaningful for valuation.
- FCF is marked NM because the insurer's operating cash flow is dominated by premium reserve movements (1/N build-up in FY25, release in FY26) and not by recurring free cash generation in the normal industrial sense.

---

## 2. Historical Multiple Bands (~18 months)

**Source:** Capital IQ Financials.xls, Multiples tab. Data as of export date ~June 2026. Frequency: quarterly (Close values within each quarter). Six observation periods: quarter-end dates 2025-03-28, 2025-06-30, 2025-09-30, 2025-12-31, 2026-03-30, 2026-06-03.

**Short-history partial-data note: Niva Bupa listed in November 2024. The available multiple history covers only 6 quarterly data points spanning ~18 months — well below the ~3-year minimum. A mean or median derived from six observations is NOT presented as a reliable anchor. The table below shows the short-range data for directional orientation only. Reversion-implied values (Section 4) are labelled illustrative-only and are not fair-value inputs for `07_scenario-and-fair-value`.**

### Primary multiples (Financial issuer — equity-direct)

| Multiple | Min | Mean | Median | Max | Current | Percentile of Short Range |
|---|---:|---:|---:|---:|---:|---:|
| P / LTM EPS (reported) | 42.4× | 86.5× | 79.9× | 159.0× | **42.4×** | 0% (at the minimum) |
| P / NTM EPS (normalized, consensus) | 46.5× | 69.1× | 72.8× | 77.5× | **75.2×** | 93% (near the maximum) |
| P / Book | 3.66× | 4.08× | 4.05× | 4.54× | **4.33×** | 76% (upper third of range) |
| P / Tangible Book | 3.71× | 4.13× | 4.09× | 4.58× | **4.40×** | 79% (upper third of range) |

### Secondary / informational multiples (EV-based — not the valuation anchor for this insurer)

| Multiple | Min | Mean | Median | Max | Current | Percentile of Short Range |
|---|---:|---:|---:|---:|---:|---:|
| EV / LTM Revenue | 1.65× | 2.18× | 2.23× | 2.75× | **1.86×** | 19% (lower third) |
| EV / LTM EBITDA | 28.5× | 48.7× | 50.3× | 70.7× | **29.5×** | 3% (near the minimum) |
| EV / LTM EBIT | 30.4× | 52.3× | 55.7× | 74.4× | **31.3×** | 3% (near the minimum) |

Source for all rows: Capital IQ Financials.xls, Multiples tab, quarterly Close values for periods Q4 FY25 through Q1 FY27 (proxy). Export as of ~June 2026.

---

## 3. Re-Rating / De-Rating Read

**P/NTM EPS and P/BV (the two most reliable multiples for this insurer):**

On P/NTM EPS, the stock trades at 75.2×, which is 93% of the way from the six-quarter low (46.5×) to the high (77.5×) — near the top of its short listed range. Against its own short-history mean of 69.1×, the current multiple sits at a +8.8% premium. Against its median of 72.8×, the premium is +3.3%. The P/NTM multiple compressed from the 77.5× highs (December 2025) to 71.9× by March 2026 as Q4 FY26 results came through, then recovered to 75.2× as at the June 2026 observation — consistent with analyst consensus revisions upward post-Q4 results (target prices moved from INR 87.0 to INR 91.1 in the month following Q4, per the Estimates Revisions sheet).

On P/BV, the stock at 4.33× is at 76% of its short range (3.66× to 4.54×). The current P/BV is +6.1% above its six-quarter mean (4.08×) and +7.1% above its median (4.05×). The P/BV band has been remarkably stable for a recently-listed insurer — the six quarterly close values all fall between 3.66× and 4.54×, a 24% range, suggesting the market has consistently ascribed a premium growth multiple to Niva Bupa's book throughout its short listing.

**Important caveat on P/LTM EPS:** The trailing P/E series is substantially distorted by the 1/N India GAAP accounting effect. The LTM EPS swings from near-zero (when dominated by first-half losses in Q1–Q3) to elevated (when the Q4 profit recovery lands in LTM). The 159× peak in December 2025 reflected a low LTM EPS denominator at a point when Q4 FY25's large profit was rolling off the trailing window. The current 42× reflects the higher FY26 full-year EPS of INR 1.98 in the denominator. This multiple's wide range (42–159×) is primarily an accounting artifact, not a genuine valuation signal, and should not be used to infer re-rating or de-rating.

The overall read: the stock has **re-rated modestly upward** in the most recent observation versus its short-history average, primarily on P/NTM EPS, coinciding with positive analyst revision breadth post-Q4 FY26 results. P/BV is also in the upper third of its short range. The stock is not at a historical low on either meaningful measure.

---

## 4. Implied Value from Reversion

**Short-history disclaimer: Niva Bupa has been listed for approximately 18 months. The six-data-point mean and median below derive from too short a history to constitute a "warranted" long-run multiple. These implied values are illustrative and directional only. They are NOT fair-value inputs for `07_scenario-and-fair-value`. The partial-data rule (short history <~3 years) applies in full.**

The two primary multiples for a Financial issuer are P/NTM EPS and P/BV. P/LTM EPS is excluded from this table because its wide range is an accounting artifact of the 1/N timing effect, not a genuine valuation signal (see Section 3).

All figures use anchor price INR 84.03, shares 1,847.757M, FY26 BV/share INR 19.39, and FY27E consensus EPS INR 1.12 (Capital IQ EstimatesReport.xls, data as of 2026-05-11).

| Multiple | Reversion Target | Metric Used | Implied Price/Share (INR) | vs Current Price (INR 84.03) |
|---|---:|---|---:|---:|
| P/NTM EPS — own mean | 69.1× | FY27E EPS INR 1.12 | **77.4** | −7.9% |
| P/NTM EPS — own median | 72.8× | FY27E EPS INR 1.12 | **81.5** | −2.9% |
| P/BV — own mean | 4.08× | FY26 BV/share INR 19.39 | **79.1** | −5.9% |
| P/BV — own median | 4.05× | FY26 BV/share INR 19.39 | **78.5** | −6.5% |

**Formulas:**
- P/NTM EPS mean: 69.1 × INR 1.12 = INR 77.4; median: 72.8 × INR 1.12 = INR 81.5
- P/BV mean: 4.08 × INR 19.39 = INR 79.1; median: 4.05 × INR 19.39 = INR 78.5

**Cross-multiple dispersion (illustrative range):** INR 77.4 to INR 81.5 per share (−7.9% to −2.9% vs current price of INR 84.03).

**Base-case illustrative point (named — for orientation only, not a `07` input):** The own-median P/BV multiple of 4.05× applied to FY26 BV/share of INR 19.39 gives an illustrative implied price of **INR 78.5/share**. P/BV is selected as the base anchor because (a) book value is structurally stable and not distorted by 1/N accounting timing, (b) the P/BV series has the tightest range across the 18-month history (3.66–4.54×), making the mean/median more internally consistent even on few observations, and (c) P/NTM EPS converges to a similar outcome (INR 77.4–81.5), corroborating the directional read.

**Reversion assumption:** These implied values assume the company's warranted book-value and forward-earnings multiple has not structurally changed from where it traded in its first 18 months post-IPO. That assumption is uncertain: the company is still scaling from early losses to sustained profitability (ROE reached 10.7% in FY26 for the first time), and the market may be ascribing a higher warranted multiple as profitability improves and a track record is established — or conversely, it may reprice downward as the IPO momentum premium fades. There is insufficient history to determine which direction is the base case; the reversion read is directional, not definitive.

---

## 5. Own-History Read

Niva Bupa's 18-month multiple history is too short to carry high conviction in any mean-reversion target, but the directional read is clear: on P/BV (4.33×) the stock sits at a 6–7% premium to its own short-history mean/median, and on P/NTM EPS (75×) it sits near the top of its short-range (93rd percentile). If these 18-month "means" held any long-run relevance, reverting to them would imply a price of roughly INR 78–82 — a 3–8% decline from the current INR 84.03. The single biggest caveat is the history itself: with only 6 quarterly observations since the November 2024 IPO, these means reflect a period during which the company was still establishing profitability (loss-making in Q1–Q3 of every year under 1/N, only Q4-profitable), and the warranted multiple may be higher once a multi-year track record of improving ROE (10.7% in FY26, management targeting mid- to high-teens) is established. The short listed-history read is illustrative-only; no mean-reversion price target from this module feeds `07` as a fair-value input.

---

## Citations

- Capital IQ Financials.xls — Multiples tab: quarterly close multiples for NSEI:NIVABUPA, 6 quarters Q4 FY25 through Q1 FY27 (data as of ~June 2026, export from Capital IQ pool). Vendor tier (§4 tier 5).
- Capital IQ Financials.xls — Key Stats tab: current capitalization, historical revenue/EBITDA/EBIT/EPS (FY22–FY26A) and forward estimates (FY27E–FY29E). Data as of ~June 2026.
- Capital IQ EstimatesReport.xls — Multiples tab: NTM multiples table for NSEI:NIVABUPA (data as of 2026-05-11). Vendor tier (§4 tier 5).
- Capital IQ EstimatesReport.xls — Trends sheet: EPS revision history, FY27E and FY28E. Data as of 2026-05-11.
- `01_price-and-capital-structure.md` (this run): anchor numbers (price INR 84.03, market cap INR 155,267M, shares 1,847.757M, BV/share INR 19.39, TBV/share INR 19.11).
- `earnings/01_historical-financials.md` (this run): metric bases (FY26 revenue INR 84,435M, EBITDA INR 5,148M, EBIT INR 5,015M, EPS INR 1.98, note on 1/N accounting distortions).
- `earnings/04_guidance-consensus.md` (this run): FY27E consensus EPS Normalized INR 1.12 (7-analyst mean), FY27E revenue INR 86,406M (4-analyst mean), revision breadth data.



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — NIVABUPA

**Company:** Niva Bupa Health Insurance Company Limited (NSEI:NIVABUPA)
**Reporting standard:** India GAAP (IRDAI insurance template); IFRS maintained internally. Figures in INR (Indian Rupees).
**Business type:** Financial issuer — IRDAI-regulated health insurer. Per MODULE_RULES Business-Type Map, the primary multiples for this issuer are P/E (LTM and NTM) and P/Tangible Book Value. EV-based multiples (EV/EBITDA, EV/EBIT, EV/Sales) are secondary and informational only for an insurer; they are shown in the table but are not used in the implied-value calculation.
**Date:** 2026-06-22

---

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Star Health and Allied Insurance Company Limited | NSEI:STARHEALTH | Standalone health insurer (SAHI) regulated by IRDAI. Closest structural peer — same licence type, same dominant segment (retail health), same EOM regulatory framework. ~31.3% retail health market share FY26 vs Niva Bupa's 10.1%. GWP ₹20,369 cr FY26. Most direct competitor. | Named in Capital IQ Competitors export (data as of 2026-06-04); named in Q4 FY26 earnings call transcript as primary reference peer; named in `08_competitive-map.md`. |
| ICICI Lombard General Insurance Company Limited | NSEI:ICICIGI | India's largest private multi-line general insurer; retail health segment growing 51.1% YoY in FY26 and at 4.1% retail health market share — a fast-moving challenger in Niva Bupa's core market. Different regulatory framework (lower EOM cap than SAHI), but listed Indian insurer with public multiples. | Named in Capital IQ Competitors export (data as of 2026-06-04); named in `08_competitive-map.md`. |

**Care Health Insurance Limited** is the third named competitor in `08_competitive-map.md` but is private (no public listing) and has no disclosed multiples, PAT, or ROE. It cannot be included in the peer comp table and is flagged but excluded.

**Peer set source:** The primary pair of Star Health and ICICI Lombard comes directly from `business-model/08_competitive-map.md` (pool-verified). The Capital IQ Comparable Company Analysis file (data as of 2026-06-04) also includes SBI Life, HDFC Life, LIC, New India Assurance, ManipalCigna, PT Paninvest, The Mediterranean & Gulf, and Jubilee Life Pakistan in its default comp set. These are used to anchor the broader Indian insurer P/TangBV median (Section 2) but are **not** included as primary SAHI peers for the SAHI-specific P/E comparison, because: life insurers (SBI Life, HDFC Life, LIC) have different economics (mortality risk vs morbidity risk), different regulatory frameworks, and structurally different combined ratio dynamics; ManipalCigna is private and reports no multiples; PT Paninvest is Indonesian (different regime); MedGulf is Saudi; Jubilee Life is Pakistani. Including them in the headline P/E median would distort the peer anchor materially downward.

---

## 2. Peer Multiples & Operating Stats

All multiples sourced from: Capital IQ Company Comparable Analysis export for NSEI:NIVABUPA, data **as of 2026-06-04** (pool-sourced, Capital IQ tier, §4 source tier 5). All values in the export are in USD; price per share and EPS are USD; P/E and P/TangBV are ratio-based and currency-neutral. INR figures from Capital IQ Financials.xls for NIVABUPA (pool-sourced, data as of FY26 year-end 2026-03-31). Operating stats (combined ratio, ROE) from earnings call transcripts (Q4 FY26, pool-sourced, §4 tier 6) where not in the comps export.

**Business-type note:** For an IRDAI-regulated health insurer, the primary operating KPIs are combined ratio (loss ratio + expense ratio — where <100% = underwriting profit) and ROE. EBITDA and EBIT margins are not standard insurer disclosures; the Capital IQ export derives EBITDA as EBIT + D&A from its own template — these are vendor constructs, not metrics the companies themselves report or use. EV/EBITDA and EV/EBIT are shown for completeness but are not meaningful primary multiples for this sector.

| Company | P/E LTM | P/TangBV LTM | NTM P/E | EV/EBITDA LTM (inf. only) | EV/Sales LTM (inf. only) | Rev Growth (LTM YoY) | Combined Ratio | ROE | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **NIVABUPA** | **42.4×** | **4.4×** | **75.2×†** | **29.5×** | **1.9×** | **+33.4%** | **101.4% (IFRS)** | **10.7%** | CIQ comps 2026-06-04; transcripts Q4 FY26 |
| Star Health (STARHEALTH) | 56.0× | n/a ‡ | 31.2× | 40.0× | 1.8× | +10.7% | 98.8% (Ind AS) | 13.1% normalized | CIQ comps 2026-06-04; Q4 FY26 transcript |
| ICICI Lombard (ICICIGI) | 31.5× | 5.5× | 27.4× | 23.1× | 3.2× | +12.5% | 102.4% (Ind AS) | 17.8% | CIQ comps 2026-06-04; Q4 FY26 transcript |
| HDFC Life (HDFCLIFE) | 64.8× | 7.0× | 54.2× | 58.9× | 1.3× | +2.8% | n/a (life insurer) | ~20% | CIQ comps 2026-06-04 |
| SBI Life (SBILIFE) | 72.5× | 9.4× | n/a | 63.4× | 1.6× | −4.0% | n/a (life insurer) | ~20% | CIQ comps 2026-06-04 |
| New India Assurance (NIACL) | 17.2× | 0.6× | 17.5× | 2.2× | 0.1× | +15.9% | ~110%+ | n/a | CIQ comps 2026-06-04 |
| **SAHI peer median (Star + ICICI)** | **43.75×** | **5.5× (ICICI only)** | **29.3×** | **31.6×** | **2.5×** | — | — | ~15.5% | Calculated |
| **Broad Indian insurer median (6 listed)** | **43.8×** | **5.5×** | **27.4×** | **31.6×** | **1.6×** | — | — | — | Calculated |

**Source notes:**
- All multiples from Capital IQ Company Comparable Analysis export, data as of 2026-06-04 (pool-verified).
- NIVABUPA EPS LTM = INR 1.98 (Capital IQ Financials.xls, Key Stats tab); P/E 42.4× confirmed as 84.03 / 1.98.
- NIVABUPA P/TangBV = 4.4× confirmed: price INR 84.03 / TangBV/share INR 19.11 (Capital IQ Key Stats).
- Star Health P/TangBV is not available in the Capital IQ comps export (shown as "−").
- HDFC Life and SBI Life are life insurers — different product, different risk, different accounting. They are shown for broad context only; they are not used to compute the primary SAHI peer median on P/E.
- New India Assurance is a government-owned general insurer with a materially different ownership structure (public sector), lower ROE, and structurally different loss ratio. Included in the broad median only.
- ‡ Star P/TangBV not available: Capital IQ comps export shows "−" for LTM P/TangBV for Star Health.
- † NIVABUPA NTM P/E of 75.2× is derived from Capital IQ NTM EPS of USD 0.01 per share (INR ~0.95 at INR/USD 95.5). This implies a 52% decline in EPS vs the LTM reported figure of INR 1.98 — an outcome inconsistent with the accelerating profit trajectory (PAT FY24: ₹106 cr → FY25: ₹203 cr → FY26: ₹366 cr). The CIQ NTM EPS appears to be a single under-populated estimate or uses a different normalization methodology. The NTM P/E of 75.2× for NIVABUPA is therefore flagged as **unreliable and not used in the implied-value calculation.** The comparison to peers' NTM P/E is noted qualitatively but no implied price is derived from it.

**SAHI peer median computation (primary reference set: Star Health + ICICI Lombard):**
- LTM P/E median = (56.0 + 31.5) / 2 = **43.75×**
- NTM P/E median = (31.2 + 27.4) / 2 = **29.3×**
- P/TangBV: Star not available; only ICICI Lombard available = **5.5×**

**Broad Indian listed insurer LTM P/E median** (Star, ICICI Lombard, HDFC Life, SBI Life, New India Assurance, LIC — 6 companies): sorted values = [8.9, 17.2, 31.5, 56.0, 64.8, 72.5]; median = (31.5 + 56.0) / 2 = **43.75×**.

---

## 3. Premium / Discount to Peer Median

| Multiple | NIVABUPA | Peer Median | Premium / (Discount) | Peer Median Set Used |
|---|---:|---:|---:|---|
| P/E LTM | 42.4× | 43.8× (SAHI median) | **(3.1%) — slight discount** | Star Health 56.0× + ICICI Lombard 31.5× |
| P/TangBV LTM | 4.4× | 5.5× (ICICI Lombard; Star n/a) | **(20.0%) — discount** | ICICI Lombard (only comparable with available data) |
| NTM P/E | 75.2× (unreliable†) | 29.3× (SAHI median) | +156.9% (not used — see footnote) | Star Health 31.2× + ICICI Lombard 27.4× |
| EV/EBITDA LTM (informational only) | 29.5× | 31.6× | (6.6%) — slight discount | SAHI median |
| EV/Sales LTM (informational only) | 1.9× | 2.5× | (24.0%) — discount | SAHI median |

**Is the gap typical or unusual?** NIVABUPA listed on the NSE in November 2024 — the company has less than 18 months of listed-market history. No pool data and no web source provides a 3-year history of NIVABUPA's multiple relative to its SAHI peers prior to the IPO. The current premium/discount relationship versus these peers **cannot be assessed on a relative-gap-over-time basis — Not assessable.** The point-in-time read is: on LTM P/E, NIVABUPA trades roughly at SAHI peer parity (3% discount to the SAHI median). On P/TangBV, it trades at a 20% discount to ICICI Lombard, its only available comparable. The LTM P/E near-parity is the more striking finding, given the quality gap (lower ROE, worse combined ratio) discussed in Section 4.

---

## 4. Is the Gap Warranted?

Niva Bupa trades at near-parity to the SAHI P/E median (42.4× vs 43.75×, a 3% discount) despite earning a meaningfully lower return on equity than both comparable peers: 10.7% vs Star Health's 13.1% normalized and ICICI Lombard's 17.8%, and still running an IFRS combined ratio above 100% (101.4% FY26) while Star Health reached underwriting profitability (98.8% Ind AS). The P/TangBV discount of 20% to ICICI Lombard is partially in line with the ROE gap — at ICICI Lombard's P/TangBV of 5.5× on a 17.8% ROE, a ROE-scaled warranted P/TangBV for NIVABUPA (10.7% ROE) would be approximately 3.3× — so at 4.4×, NIVABUPA is still modestly above its ROE-implied P/TangBV anchor. The growth differential partially justifies NIVABUPA's relative P/E premium over ICICI Lombard: NIVABUPA's revenue grew 33.4% LTM vs ICICI Lombard's 12.5%, and EBITDA grew 58.9% — the market is paying a growth premium. However, Star Health (56.0× P/E) earns a premium over NIVABUPA (42.4×) despite having a lower revenue growth rate (10.7% LTM), and that premium appears warranted by Star's larger scale, established underwriting profitability, and higher normalized ROE. The aggregate picture is: **NIVABUPA's LTM P/E near-parity to the SAHI median is difficult to fully warrant** — the ROE gap, still-above-100% combined ratio, and ICICI Lombard's P/TangBV lead all point to NIVABUPA deserving a discount to the SAHI peer median on a quality-adjusted basis. The 20% P/TangBV discount is more economically consistent with the fundamentals.

**Verdict: discount is warranted — the current LTM P/E near-parity understates the quality gap; P/TangBV discount of 20% is directionally correct but may still be insufficient given the ROE-implied fair book multiple of ~3.3×.**

---

## 5. Implied Value from Peer Multiples

**Primary multiple used:** LTM P/E (the standard primary multiple for an IRDAI-regulated health insurer per Business-Type Map; equity-direct method). Forward P/E is not used because the CIQ NTM EPS for NIVABUPA is flagged as unreliable (§2 footnote †).

**Quality adjustment applied:** The warranted peer multiple is the SAHI peer median (43.75×) discounted by 12.5% to reflect: (1) NIVABUPA's combined ratio above 100% vs Star Health's below 100%; (2) NIVABUPA's ROE of 10.7% below the ~15.5% SAHI peer median; (3) NIVABUPA's shorter listed history and thinner coverage. Warranted multiple = 43.75× × 0.875 = **38.3×**. This is applied to the LTM reported EPS of INR 1.98 (Capital IQ Key Stats, FY26, INR basis, trailing twelve months ending March 2026 — trailing basis aligned with the trailing peer multiple).

**Secondary multiple used:** P/TangBV applied to TangBV per share of INR 19.11 (Capital IQ Balance Sheet, FY26). Quality adjustment: ICICI Lombard P/TangBV of 5.5× × (10.7% / 17.8% ROE ratio) = **3.31×** (ROE-scaled to NIVABUPA's demonstrated return). This is a trailing TangBV applied to a trailing peer P/TangBV — same-basis.

| Multiple | Applied Peer Multiple | Quality Adjustment | Implied Equity Value (INR mn) | Implied Price/Share | vs Current Price (INR 84.03) |
|---|---:|---|---:|---:|---:|
| LTM P/E — primary | 38.3× | −12.5% from SAHI median 43.75× (lower ROE, above-100% combined ratio) | 38.3 × 1.98 × 1,847.8mn shares = 140,100mn | **INR 75.8** | −9.8% |
| P/TangBV — secondary | 3.31× | ROE-scaled vs ICICI Lombard (10.7% / 17.8%) | 3.31 × 19.11 × 1,847.8mn shares = 116,730mn | **INR 63.2** | −24.8% |

**Base-case implied value (primary multiple):** INR 75.8 per share (warranted LTM P/E 38.3× applied to LTM EPS of INR 1.98).

**Dispersion across methods:** INR 63.2 (P/TangBV, secondary) to INR 75.8 (P/E, primary) — a range of INR 12.6, or approximately 20% spread (below the 40% cross-method divergence threshold; no reconciliation cap required). Both methods agree the current price of INR 84.03 is above the warranted-multiple-implied value.

**Share count used:** 1,847.757 million (Capital IQ Key Stats, most recent basic count — proxy for fully diluted, stated limitation per `01_price-and-capital-structure.md`).

---

## 6. Relative Read

On the primary equity multiple for an insurer (LTM P/E), NIVABUPA at 42.4× trades at only a 3% discount to the SAHI peer median of 43.75× — near-parity that is not warranted given its ROE of 10.7% versus peers at 13–18% and a combined ratio still above 100%. On P/TangBV, NIVABUPA at 4.4× trades at a 20% discount to ICICI Lombard's 5.5×, which is more consistent with the ROE gap but still above the ROE-implied anchor of approximately 3.3×. Applying a quality-adjusted warranted LTM P/E of 38.3× to NIVABUPA's LTM EPS of INR 1.98 implies a fair value of INR 75.8 per share (base case, primary multiple), with the P/TangBV method pointing to INR 63.2 (dispersion floor). At a current price of INR 84.03, the stock is priced above the warranted-multiple-implied range by 11–33%, suggesting the market is paying a growth premium for the trajectory toward underwriting profitability that is not yet fully supported by current-period economics.

---

## Partial Data Notes

- **Care Health (unlisted, private):** No public multiples or financials available. Excluded from peer comp table — cannot be compared.
- **Star Health P/TangBV:** Not available in the Capital IQ comps export (shown as "−"). ICICI Lombard is the sole P/TangBV anchor.
- **NIVABUPA NTM P/E:** Capital IQ NTM EPS of USD 0.01 (INR ~0.95) implies a 52% EPS decline, inconsistent with the company's accelerating profit trajectory. This estimate is flagged as unreliable — the NTM P/E of 75.2× and any implied value derived from it are not used. The NTM P/E comparison to peers is noted qualitatively.
- **Peer-multiple-over-time history:** NIVABUPA listed November 2024. No 3-year relative-gap history exists. The persistence of the current premium/discount versus peers is **Not assessable**.
- **EV-based multiples:** Shown for reference but not used in implied-value calculations per the Business-Type Map (Financial issuer — equity-direct valuation required).

---

*Sources:*
- *Capital IQ Company Comparable Analysis export for NSEI:NIVABUPA, data as of 2026-06-04 (pool-verified, §4 tier 5)*
- *Capital IQ Financials.xls for NSEI:NIVABUPA, Key Stats tab and Balance Sheet tab, FY26 (pool-verified, §4 tier 5)*
- *`01_price-and-capital-structure.md` — anchor price, share count, EV bridge*
- *`business-model/08_competitive-map.md` — named peer set*
- *`business-model/07_business-quality.md` and `business-model/09_moat.md` — quality/moat evidence for warranted-multiple argument*
- *Q4 FY26 Earnings Call transcript, May 8, 2026 (pool-verified, §4 tier 6) — combined ratio, ROE, SAHI metrics*
- *Star Health Q4 FY26 Earnings Call transcript, Apr 29, 2026 (pool-verified, §4 tier 6) — Star combined ratio, ROE*
- *ICICI Lombard Q4 FY26 Earnings Call transcript, Apr 15, 2026 (pool-verified, §4 tier 6) — ICICI Lombard combined ratio, ROE*



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — NIVABUPA

**Company:** Niva Bupa Health Insurance Company Limited (NSEI:NIVABUPA / BSE:544286)
**Reporting standard:** India GAAP (IRDAI insurance template); IFRS voluntarily maintained and used as primary management metric. All equity-base figures from Capital IQ vendor export (§4 tier 5), described as restated from IRDAI/Companies Act statutory filings.
**Reporting currency:** INR (Indian Rupees). Figures in INR Millions unless stated otherwise. 1 crore = 10 million.
**Fiscal year end:** 31 March. FY26 = April 2025 – March 2026.
**Analysis date:** 2026-06-22.

---

## Business-Type Gate: Financial Issuer — FCFF DCF Not Applicable

Per the MODULE_RULES.md Business-Type Method Map, Niva Bupa is an **IRDAI-regulated health insurer — a Financial issuer**. The map is unambiguous:

> "Financial (bank / insurer) → do NOT build an FCFF DCF or an EV bridge. Build an equity-direct model — Dividend Discount Model or residual-income / excess-return-on-equity — discounted at the cost of equity."

This report therefore does **not** build an FCFF DCF, does not compute a WACC, and does not use an EV bridge for valuation. The method used is a **Residual Income (Excess-Return on Equity)** model, also called the Edwards-Bell-Ohlson framework, discounted at the cost of equity (Ke). Sections below are relabelled accordingly.

The EV bridge from `01_price-and-capital-structure.md` is informational only (INR 157,221 mn / INR 15,722 crores) and is not the valuation output.

---

## 1. Earnings Base & Normalizations

The RI model uses PAT (profit after tax) and book equity as inputs — not FCFF or CFO. For an insurer, the economic earning power is PAT, and the economic book value is net worth (equity).

| Item | FY26 Value | Normalization Applied | Source |
|---|---:|---|---|
| PAT (India GAAP reported) | INR 3,661 mn | None required — IGAAP PAT = IFRS PAT for FY26 (INR 3,660 mn vs INR 3,661 mn); negligible rounding | Capital IQ Financials.xls Income Statement FY26; Q4 FY26 Earnings Call May 8 2026 p.5 |
| PAT (IFRS, management-disclosed) | INR 3,660 mn (₹366 crores) | Same as above | Q4 FY26 Earnings Call May 8 2026 p.5 (CEO: "profit after tax on an Ind AS basis was INR 366 crores") |
| FY25 PAT (IFRS) | INR 2,030 mn (₹203 crores) | No normalization — full-year IGAAP/IFRS aligned at annual level | Q4 FY25 Earnings Call May 7 2025 p.4 |
| FY26 ROE (Ind AS, management-disclosed) | 10.7% | No normalization required; no non-deductible FVTPL losses (investment book is ~100% debt instruments); no fair-value distortion applicable | Q4 FY26 Earnings Call May 8 2026 p.5; moat module §3 confirms no FVTPL distortion |
| Book equity FY26 (period-end) | INR 35,824.4 mn | None | Capital IQ Balance Sheet FY26; confirmed in 01_price-and-capital-structure.md §6 |
| FY26 effective tax rate | Not separately disclosed in available data; standard Indian corporate rate ~25.17% (analyst assumption — no one-off distortions identified) | No normalization needed; no non-deductible items flagged | Capital IQ export; Q4 FY26 call; moat module §3 states "no structural-rate normalization is required" |

**Base year:** FY26 (ending March 31, 2026). PAT of INR 3,661 mn and book equity of INR 35,824.4 mn are the anchors.

**Two items NOT used as base:**
- FY25 CFO of INR 16,753 mn (materially inflated by a one-time 1/N accounting reserve build-up — not a recurring cash flow; earnings-quality module §10 confirms). Not relevant to this RI model regardless.
- Capital IQ normalized EPS of INR 0.71/share (FY26): the ₹1.27 gap from reported EPS of ₹1.98 is not fully transparent and the full-year IGAAP PAT of INR 3,661 mn ties to audited-equivalent figures. The full-year PAT is used, not the Capital IQ normalized per-share figure.

---

## 2. Forecast Assumptions

### 2a. Model Logic

The Residual Income model defines:
- **Earnings_t = ROE_t × BV_(t−1)**
- **Residual Income_t = (ROE_t − Ke) × BV_(t−1)** (excess earnings above the cost of equity — the "excess return on equity")
- **BV_t = BV_(t−1) + Earnings_t − Dividends_t**
- **Equity Value = BV_0 + PV(all future Residual Incomes)**

Payout ratio is zero throughout the explicit horizon (no dividend history; IPO November 2024; insurer is reinvesting for growth — solvency capital grows with the premium book). Under the clean-surplus assumption, dividends do not affect intrinsic value in this framework; they affect only the BV path, not the sum of PV(RI).

### 2b. ROE Forecast Path

The single most important driver of intrinsic value is the ROE path relative to the cost of equity. Every row below is the basis for the excess-return calculation.

| Assumption | FY27 | FY28 | FY29 | FY30 | FY31 | FY32 | FY33 | FY34 | FY35 | FY36 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| ROE % | 11.5% | 12.5% | 13.5% | 14.5% | 14.1% | 13.7% | 13.3% | 13.0% | 12.8% | 12.8% | Ke (~12.87%) | Analyst assumption (see rationale below); terminal anchored to "No moat proven" verdict |
| PAT / Ke used | 12.87% | 12.87% | 12.87% | 12.87% | 12.87% | 12.87% | 12.87% | 12.87% | 12.87% | 12.87% | 12.87% | Ke = 12.87% (see §3) |
| Excess ROE (ROE – Ke) | −1.37% | −0.37% | +0.63% | +1.63% | +1.23% | +0.83% | +0.43% | +0.13% | −0.07% | −0.07% | 0% | Derived |

**ROE ramp rationale (all labeled):**

- **FY27 ROE 11.5%:** *Analyst assumption.* Management guided EOM ratio declining ~200–250 bps per year [Q4 FY26 call, CFO, May 8 2026] and combined ratio improving toward 99% by FY29. At 11.5%, ROE improves modestly above FY26's 10.7% — conservative, as FY27 marks the first full year of IFRS 17 transition (effective April 2026), which may create comparability headwinds.

- **FY28 ROE 12.5%:** *Analyst assumption.* Continued EOM improvement; loss ratio roughly stable per company trajectory; IFRS 17 base effects absorbed.

- **FY29 ROE 13.5%:** *Analyst assumption directionally anchored to management guidance.* CFO guided combined ratio approaching ~99% by FY29 [Q4 FY26 call, p.7]. A 99% COR with 7.2% investment yield on growing AUM is consistent with mid-teens ROE per management: "close to 11% currently, and [99% combined ratio] will translate to mid- to high-teens ROE" [Q4 FY26 call, CFO, p.7]. 13.5% is a conservative interpretation of "mid-teens."

- **FY30 ROE 14.5%:** *Analyst assumption.* "Mid-teens" ROE achieved — conservative end of management's directional range.

- **FY31–FY36 ROE fade (14.1% → 12.8%):** *Analyst assumption (fade schedule).* Once operational leverage matures, the company has no proven moat to sustain perpetual excess returns above Ke. The moat module returned a "No moat proven" verdict [09_moat.md §5], which requires the terminal ROE to converge to Ke. The fade over 6 years reflects the time needed for competitive dynamics to erode any temporary scale advantage.

- **Terminal ROE = Ke (~12.87%):** *Anchored to MODULE_RULES moat verdict.* "No moat proven" means the DCF must carry no perpetual excess return: terminal RI = 0. This is a fade, not a collapse — the franchise continues operating but earns exactly its cost of capital in perpetuity, generating zero additional equity value beyond the terminal book value.

### 2c. GWP Growth (Context — not a direct input to RI, but drives BV accumulation pace)

GWP growth is the engine that expands the book equity as retained earnings accumulate. Management guided 17–19% industry CAGR on a 5-year view [Q4 FY26 call, p.8]; Niva Bupa has historically grown ~5–10 ppts above the industry (market share gaining). The ROE schedule above implicitly assumes the company continues to grow its GWP at rates sufficient to generate the PAT levels shown — consistent with 20–25% GWP growth in FY27–FY30, decelerating toward industry rates as the company matures. This is not independently modeled as a separate line item — it manifests through the ROE × BV path.

---

## 3. Cost of Equity (Ke)

There is no WACC for a financial issuer. The discount rate is the **cost of equity** applied to equity cash flows (residual incomes and book equity).

| Component | Value | Source |
|---|---:|---|
| Risk-free rate (India 10-year G-sec) | 6.85% | Web: tradingeconomics.com, India 10-year G-sec yield June 19 2026 — 6.85%; unverified, labelled web-sourced |
| Equity risk premium (India total ERP) | 7.08% | Damodaran ctryprem.html, January 2026 data (US base ERP 4.23% + India country risk premium 2.85%); web-sourced, unverified |
| Beta | 0.85 | Inference, not from filings — IPO November 2024, <18 months listed; limited traded beta history; moat module §3 used this same figure for the ROE vs Ke comparison; consistent with a listed Indian health insurer at growth stage |
| **Cost of equity (Ke = rf + β × ERP)** | **12.87%** | Calculated: 6.85% + 0.85 × 7.08% = 12.87% |

**No override applied.** The CAPM-computed Ke of 12.87% is used without adjustment. It is consistent with the moat module's cost-of-equity estimate of ~12.5% (moat §3: "Cost of equity ≈ 7.0% + 0.85 × 6.5% ≈ 12.5%"), noting the moat module used 7.0% risk-free (web-indicative, mid-2026) and 6.5% ERP versus this report's more current 6.85% G-sec and 7.08% Damodaran ERP. The two estimates diverge by approximately 37 bps — well within the ~2pp tolerance before requiring a dual-grid. This report's 12.87% is the more precisely sourced figure and is used as the canonical Ke; the moat module's 12.5% provides directional corroboration.

**WACC sanity bounds (adapted for equity-only model):** India nominal long-run GDP growth is approximately 7% — this forms the ceiling for a sustainable terminal growth rate and is used in the sensitivity grid for scenarios with persistent excess returns.

---

## 4. Residual Income Forecast & Discounting

**Convention:** Mid-year discounting (FY27 RI arrives at t=0.5, FY28 at t=1.5, …, FY36 at t=9.5). This is the default convention per MODULE_RULES §8. Each year's residual income is the excess return earned on the opening book equity for that year.

**Code executed:**

```
python3 — NIVABUPA RI model (executed above; full output shown)

BV FY26 base: INR 35,824 mn, Ke = 12.87%

Year     BV_start   ROE%      PAT  Excess%  Excess RI     BV_end
FY27       35,824   11.5%    4,120    -1.37%       -490     39,944
FY28       39,944   12.5%    4,993    -0.37%       -147     44,937
FY29       44,937   13.5%    6,067     0.63%        284     51,004
FY30       51,004   14.5%    7,396     1.63%        832     58,399
FY31       58,399   14.1%    8,234     1.23%        719     66,634
FY32       66,634   13.7%    9,129     0.83%        554     75,762
FY33       75,762   13.3%   10,076     0.43%        327     85,839
FY34       85,839   13.0%   11,159     0.13%        113     96,998
FY35       96,998   12.8%   12,416    -0.07%        -66    109,414
FY36      109,414   12.8%   14,005    -0.07%        -74    123,419

PV of explicit RIs (mid-year convention):
FY27: RI=-490, DF(t=0.5)=0.9413, PV=-461
FY28: RI=-147, DF(t=1.5)=0.8340, PV=-123
FY29: RI=+284, DF(t=2.5)=0.7389, PV=+210
FY30: RI=+832, DF(t=3.5)=0.6546, PV=+545
FY31: RI=+719, DF(t=4.5)=0.5800, PV=+417
FY32: RI=+554, DF(t=5.5)=0.5139, PV=+285
FY33: RI=+327, DF(t=6.5)=0.4553, PV=+149
FY34: RI=+113, DF(t=7.5)=0.4034, PV=+46
FY35: RI=-66,  DF(t=8.5)=0.3574, PV=-24
FY36: RI=-74,  DF(t=9.5)=0.3166, PV=-24

Sum PV of explicit RI: INR 1,021 mn
```

**Sign interpretation:** FY27–FY28 show **negative** residual income because ROE (11.5–12.5%) is still below Ke (12.87%) — the company has not yet earned its cost of equity. FY29–FY34 show positive residual income as ROE exceeds Ke (management-guided improvement to mid-teens). FY35–FY36 turn modestly negative again as the fade brings ROE back below Ke toward convergence. The total explicit PV(RI) of INR +1,021 mn reflects the net of these: a small positive from the peak excess-return years is partially offset by the transition years before and after peak.

**Structural observation:** The dominant driver of intrinsic value in this model is the **starting book equity of INR 35,824 mn** — not the excess return stream. The company earns only a modest, short-lived excess return even in the bull case because (a) the "no moat" verdict anchors terminal RI to zero and (b) the company currently earns below its cost of equity. This is the mathematical expression of a business trading at a premium to book without a proven economic moat.

---

## 5. Terminal Value

**Method:** Residual Income with terminal ROE converging to Ke.

- **Terminal ROE = Ke (~12.87%):** Mandated by the "No moat proven" verdict from `09_moat.md §5`. A terminal ROE equal to Ke means terminal RI = 0, which means the continuing value of excess earnings is zero. The franchise survives and grows, but it earns no more than its cost of capital in perpetuity — a fair description of an unproven-moat franchise.

- **Terminal continuing value (base case): INR 0 mn.** The explicit 10-year forecast runs ROE through its fade phase to approximately Ke by FY35–FY36. The continuing value beyond FY36 is zero because terminal RI = 0.

- **Terminal value as % of equity value:** In the RI framework, "terminal value" does not map cleanly to the FCFF DCF concept. The BV at FY36 (INR 123,419 mn) already represents the compounded retained earnings — and since it earns exactly Ke in perpetuity, it is worth exactly book value (P/B = 1.0 at terminal). The entire terminal book value is captured through the clean-surplus identity: Equity Value = BV_0 + PV(RI), where BV_0 anchors the value. The percentage of total equity value from the initial book equity anchor is: 35,824 / 36,845 = **97.2%** — nearly all of the intrinsic equity value is the current book equity, not future excess returns. This is the quantitative signal that the stock's intrinsic worth is tightly bounded by its book value.

- **Structural decline / runoff trigger (CLAUDE.md §24 Filter 5):** Business-quality module scores rate-of-change / disruption at 55 [07_business-quality.md §1] — above the ≤40 threshold that would trigger a declining-perpetuity terminal. No declining-perpetuity terminal is required. The "no moat proven" classification already ensures no excess terminal return, which is the correct (fade, not collapse) treatment for this case.

---

## 6. Equity Value Bridge

```
=== BASE CASE EQUITY VALUE (Python output) ===
BV FY26 (anchor):                     35,824.4 mn
+ PV of explicit RI (FY27-FY36):       1,020.6 mn
+ Terminal RI CV:                           0.0 mn  (ROE→ke; no moat)
= Total equity value:                  36,845.0 mn
  = INR 3,685 crores

Shares: 1,847.757 mn (Capital IQ Key Stats; 01_price-and-capital-structure.md anchor)
Intrinsic value per share (BASE):  INR 19.94
Current price:                     INR 84.03
Price premium over intrinsic:      +321.4%
```

| Step | Value |
|---|---:|
| BV FY26 (opening anchor) | INR 35,824.4 mn |
| + PV of explicit RIs (FY27–FY36, mid-year) | INR 1,020.6 mn |
| + Terminal RI continuing value | INR 0 mn |
| **= Intrinsic equity value** | **INR 36,845.0 mn (₹3,685 crores)** |
| ÷ Diluted shares | 1,847.757 mn |
| **= Intrinsic value per share (BASE)** | **INR 19.94** |
| Current price (Capital IQ Key Stats, pool-verified) | INR 84.03 |
| Price as premium to base intrinsic | +321% |

**Net debt bridge note:** The RI model values equity directly; no EV → equity bridge is needed or appropriate. The strict net debt of INR 1,954 mn (subordinated NCDs + lease liabilities − operating cash) has already been excluded from the equity valuation base — it sits outside the equity book and does not enter the RI calculation.

**Minority interest / preferred:** Nil [01_price-and-capital-structure.md §4]. No adjustment needed.

---

## 7. Sensitivity Grid (per-share intrinsic value, INR)

**Rows:** Terminal ROE scenario (how much ROE exceeds or misses Ke in perpetuity)
**Cols:** Cost of equity (Ke) shift from base of 12.87%

```python
=== SENSITIVITY GRID OUTPUT (executed above) ===

                       ke=11.9%   ke=12.9%   ke=13.9%
Term ROE = 0.97×ke       21.9       19.9       18.1   (bear — terminal ROE below Ke)
Term ROE = 1.00×ke       21.9       19.9       18.1   (base — no excess at terminal)
Term ROE = 1.03×ke       23.5       21.3       19.3   (bull — small persistent excess return)
```

| Terminal ROE | Ke = 11.9% (−1pp) | Ke = 12.87% (base) | Ke = 13.9% (+1pp) |
|---|---:|---:|---:|
| 0.97× Ke (bear: mild terminal underperformance) | INR 21.9 | INR 19.9 | INR 18.1 |
| 1.00× Ke (base: ROE = Ke; no excess) | INR 21.9 | INR 19.9 | INR 18.1 |
| 1.03× Ke (bull: small perpetual excess, requires moat evidence) | INR 23.5 | INR 21.3 | INR 19.3 |

**Grid observation:** The dispersion across the entire 9-cell grid is INR 18.1 to INR 23.5 per share — a spread of INR 5.4. The current price of INR 84.03 sits **more than 3× above every scenario in the grid.** The intrinsic value range of INR 18.1–23.5 is insensitive to the key assumptions because the model is driven primarily by the starting book value (INR 35,824 mn / INR 19.39 per share), not by future excess returns. Even the most optimistic scenario (Ke −1pp, terminal ROE = 1.03×Ke with a small persistent excess) yields only INR 23.5/share.

---

## 8. Bull / Base / Bear Scenario Summary

```
=== BULL / BASE / BEAR (Python output) ===
Bull: INR 25.7/share  (ke=11.9%, peak ROE 15.5%, terminal ROE 1.03×ke)
Base: INR 19.9/share  (ke=12.87%, peak ROE 14.5%, terminal ROE=ke → no excess)
Bear: INR 15.4/share  (ke=13.9%, ROE peaks 12%, never exceeds ke)
Price: INR 84.03/share
```

| Scenario | Key Assumptions | Intrinsic Value/Share |
|---|---|---:|
| Bull | Ke −1pp (11.9%), ROE reaches 15.5% by FY30, small persistent excess return (1.03× Ke) in terminal | INR 25.7 |
| **Base** | Ke 12.87%, ROE reaches 14.5% by FY30 (management-guided directional), terminal ROE = Ke | **INR 19.9** |
| Bear | Ke +1pp (13.9%), ROE reaches only 12.0%, never exceeds Ke; muted operating leverage execution | INR 15.4 |

---

## 9. Intrinsic Read

The base-case intrinsic value is **INR 19.94 per share** — barely above the current book value of INR 19.39 per share. The sensitivity grid dispersion of INR 15.4–25.7 sits entirely below the current price of INR 84.03. At the current price, Niva Bupa trades at 4.33× book value, embedding a very large premium for future excess returns — but the RI model finds that excess returns are modest, short-lived (peaking in FY30 and then fading back to the cost of equity by FY35–FY36), and entirely contingent on achieving the management-guided 99% combined ratio by FY29 under conditions where the moat module has returned a "No moat proven" verdict. The single assumption the model is most sensitive to is **whether the company can sustain a ROE materially above its cost of equity (~12.9%) beyond FY30**: if competitive dynamics, regulatory resets (IRDAI commission cap), or slower-than-guided EOM improvement prevent that, the intrinsic value does not exceed INR 20. The current market price of INR 84.03 would only make sense in a DCF sense if the company achieves and sustains very high ROEs (well above 20%) for many years — a level it has never demonstrated and which no evidence in the available data supports.

**Partial data notice:** The primary audited Annual Report (IRDAI statutory filing / SEBI LODR) is absent from the data pool. All financial inputs are from Capital IQ vendor export (§4 tier 5) and earnings call transcripts (Claim Level 3). This caps **intrinsic confidence to Medium** — the model inputs are reliable at the annual level (IGAAP PAT and book equity are internally consistent), but individual line items (tax rate paid, exact ROE denominator, options/RSU dilution) cannot be verified against primary filings. The directional conclusion — that intrinsic value is far below the current price — is robust to a wide range of assumptions (the entire 9-cell grid confirms it).

---

## Self-Check

- [x] Business-type gate applied — Financial issuer (health insurer); no FCFF DCF or EV bridge used as valuation output; residual income / excess-return model applied per MODULE_RULES Business-Type Map.
- [x] Earnings base (PAT FY26 INR 3,661 mn; BV FY26 INR 35,824 mn) stated and normalizations itemized — none material required.
- [x] Every forecast assumption labeled analyst assumption / company-guided directional / moat-verdict anchored.
- [x] Cost of equity components shown with sources; risk-free rate and ERP are web-sourced and labeled. No WACC computed (financial issuer). Ke cross-checked against moat module's own Ke estimate (~12.5% vs 12.87% — 37 bps, well within 2pp tolerance).
- [x] Terminal value: ROE converging to Ke by design (no moat proven); terminal RI = 0; terminal value as proportion of equity value discussed.
- [x] Structural decline trigger checked: disruption score 55 > 40 threshold; no declining-perpetuity terminal required. "No moat" already imposes zero terminal excess return.
- [x] EV bridge not used for equity valuation (financial issuer); equity is valued directly. Net debt and share count from 01 anchor used in the per-share bridge.
- [x] Discounting convention: mid-year (t−0.5 default). FY27 at t=0.5, FY36 at t=9.5.
- [x] Sensitivity grid populated; 9-cell grid shows INR 18.1–23.5 dispersion — all far below current price.
- [x] Output leads with base-case intrinsic (INR 19.94/share); sensitivity grid is the dispersion exhibit.
- [x] Computations executed via Bash/Python snippet; raw output shown in §4 and §6.
- [x] No banned phrases.
- [x] Working capital / DSO-DIO-DPO: Not applicable to a health insurer (premiums collected before coverage; no trade receivables in standard sense). Noted and documented in earnings-quality module §3.
- [x] Financeable-growth cross-check: not applicable in RI model (the "reinvestment" is automatic via retained earnings growing BV; growth = ROE × retention rate, which is fully embedded in the BV path).

---

*Sources used:*
- Capital IQ Financials.xls (NSEI:NIVABUPA), FY2026 ("Latest Filings" restatement), vendor tier §4 tier 5.
- Capital IQ EstimatesReport.xls (NSEI:NIVABUPA), data as of 2026-05-11, vendor tier §4 tier 5.
- Q4 FY26 Earnings Call transcript, May 8 2026 (S&P Global Market Intelligence).
- Q3 FY26 Earnings Call transcript, January 29 2026 (S&P Global Market Intelligence).
- Q4 FY25 Earnings Call transcript, May 7 2025 (S&P Global Market Intelligence).
- `analyses/NIVABUPA_2026-06-22/valuation/01_price-and-capital-structure.md` — price, shares, net debt anchor.
- `analyses/NIVABUPA_2026-06-22/business-model/09_moat.md` — moat verdict, Ke cross-check, ROE history.
- `analyses/NIVABUPA_2026-06-22/business-model/07_business-quality.md` — disruption/rate-of-change score.
- `analyses/NIVABUPA_2026-06-22/earnings/01_historical-financials.md` — PAT, BV, FCF base.
- `analyses/NIVABUPA_2026-06-22/earnings/03_margin-drivers.md` — combined ratio, EOM path.
- `analyses/NIVABUPA_2026-06-22/earnings/04_guidance-consensus.md` — management targets (ROE, combined ratio).
- `analyses/NIVABUPA_2026-06-22/earnings/06_earnings-quality.md` — normalization items.
- `analyses/NIVABUPA_2026-06-22/earnings/07_earnings-sensitivity.md` — variable ranges.
- Web: tradingeconomics.com, India 10-year G-sec yield June 19 2026 = 6.85% (unverified, web-sourced).
- Web: Damodaran ctryprem.html, January 2026 data, India total ERP = 7.08% (unverified, web-sourced).



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — NIVABUPA

**Company:** Niva Bupa Health Insurance Company Limited (NSEI:NIVABUPA / BSE:544286)
**Analysis date:** 2026-06-22
**Price-state:** `pool-verified` — price INR 84.03 from Capital IQ export, corroborated by three independent data points within the pool [01_price-and-capital-structure.md §1]
**Business type:** Financial issuer — IRDAI-regulated health insurer. Per MODULE_RULES Business-Type Map, this agent inverts the **equity-direct Residual Income (RI) model** from `04_intrinsic-dcf.md`, not an FCFF/EV model. EV-based multiples are not applicable here. The reverse-solve asks: what peak ROE does the market price require, and can the company plausibly deliver it?

---

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | INR 84.03 | Capital IQ Financials.xls → Key Stats tab; pool-verified [01_price-and-capital-structure.md §1] |
| Market capitalisation (equity value) | INR 155,267 mn (₹15,527 crores) | 1,847.757 mn shares × INR 84.03 [01_price-and-capital-structure.md §3]; confirmed in Key Stats Market Capitalisation |
| Book equity (BV) FY26 — opening anchor | INR 35,824.4 mn (₹3,582 crores) | Capital IQ Balance Sheet, FY26 [01_price-and-capital-structure.md §6; 04_intrinsic-dcf.md §1] |
| ROE FY26 (base-year) | 10.7% | Management-disclosed, Q4 FY26 Earnings Call, May 8 2026 [04_intrinsic-dcf.md §1] |
| Cost of equity (Ke) | 12.87% | From 04_intrinsic-dcf.md §3 verbatim: rf 6.85% + β 0.85 × ERP 7.08% = 12.87% |
| Forecast horizon | 10 years (FY27–FY36) | 04_intrinsic-dcf.md §4 verbatim |
| Discounting convention | Mid-year (FY27 at t=0.5, FY36 at t=9.5) | 04_intrinsic-dcf.md §4 verbatim |
| Terminal ROE | Ke (12.87%) → terminal RI = 0 | "No moat proven" verdict from 09_moat.md §5; used verbatim from 04_intrinsic-dcf.md §5 |
| Model used | Residual Income (RI) / excess-return on equity | 04_intrinsic-dcf.md §§2–6 — Financial issuer; FCFF DCF not applicable |
| Net debt (informational only) | INR 1,954.1 mn (strict) | [01_price-and-capital-structure.md §5]; not relevant to equity-direct RI valuation |

**Model logic recap (from `04`, not re-derived):** Equity value = BV₀ + PV(all future Residual Incomes), where Residual Income_t = (ROE_t − Ke) × BV_(t−1). BV grows by retained earnings each year (payout ratio = zero; insurer reinvests all earnings into solvency capital). The model has no WACC — it uses the cost of equity (Ke = 12.87%) as the single discount rate applied to equity-direct cash flows.

**Model structure from `04`:** ROE ramps linearly from the FY26 base of 10.7% to a peak by FY30, then fades back toward Ke by FY36. The reverse solve holds this exact structure and finds the peak ROE that makes the RI model output equal to the market capitalisation of INR 155,267 mn.

**Required excess value:** The market capitalisation of INR 155,267 mn sits INR 119,443 mn above the current book equity of INR 35,824 mn. The market is therefore paying 4.33× book value, embedding the expectation that Niva Bupa will generate INR 119,443 mn in present-value terms from future excess returns (returns above the 12.87% cost of equity).

---

## 2. Implied Expectations

**Solver executed (Python, bisection):**

```python
# Bisection root-find: find peak_roe such that RI_model(peak_roe) == 155,267 mn
# Structure: FY27-FY30 ramp from 10.7% to peak_roe; FY31-FY36 fade peak_roe → Ke
# Mid-year discounting; terminal RI = 0

BV0 = 35824.4; Ke = 0.1287; target = 155267.0
# Bisection between 0.40 and 0.55: f(0.40)=−44,567; f(0.55)=+38,889
# Root found at iteration 60: peak_roe = 0.4889
# Equity value at root: INR 155,266.4 mn (vs target 155,267.0 mn) ✓
```

**Root returned:** implied peak ROE = **48.9%** (converged to within INR 0.6 mn of target).

| What the Price Implies | Solved Value |
|---|---:|
| Implied peak ROE (FY30) to justify INR 84.03 | **48.9%** |
| Implied ROE by FY27 (ramp year 1) | 20.2% |
| Implied ROE by FY28 (ramp year 2) | 29.8% |
| Implied ROE by FY29 (ramp year 3) | 39.3% |
| Implied ROE by FY36 (terminal) | ~12.9% (fade to Ke) |
| Implied constant ROE (all 10 years, no ramp/fade) | 30.1% |
| Years of 20% ROE (then terminal RI = 0) needed to justify price | ~24 years |

**What was held fixed:** cost of equity (Ke = 12.87%), book equity base (BV₀ = INR 35,824 mn), model structure (10-year horizon, mid-year discounting, zero payout, fade to terminal ROE = Ke), ramp/fade schedule from `04` (4-year ramp, 6-year fade). **What was solved for:** the peak ROE in FY30 at which the sum BV₀ + PV(all RIs over FY27–FY36) equals the market capitalisation of INR 155,267 mn.

**Alternative framing:** Even if the company achieves and sustains a 20% ROE — which no Indian health insurer has demonstrated on a through-cycle basis — the current price would require that performance to continue for approximately **24 consecutive years** before the stock earns its cost of capital. Under the standard 10-year horizon of the forward model, justifying the price requires a peak ROE of nearly 49%.

---

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Peak ROE = 48.9% (FY30) | FY26 ROE = 10.7%; through-cycle average FY24–FY26 ≈ 6–8% [09_moat.md §3] | Management guided "mid- to high-teens" ROE by FY29 at a 99% combined ratio [Q4 FY26 transcript, May 8 2026, CFO]; consensus consensus EPS normalized FY27 ₹1.12, FY28 ₹2.37 [04_guidance-consensus.md §3]; maximum plausible ROE given peer set: ICICI Lombard 17.8%, Star Health 13.1% normalized [09_moat.md §3] | **No** — requires a 4.6× lift from today's 10.7% ROE to a level no peer in the sector has approached |
| ROE at 20.2% by FY27 (ramp year 1) | Never demonstrated; FY26 ROE first time above 10% | EOM ratio must fall to ~31% (vs 33.7% today); no single-year move of this magnitude observed in history | **No** — requires a step-change operating-leverage acceleration not supported by any guidance or history |
| ROE = 30.1% sustained (constant model) | Highest peer ROE observed in data: ICICI Lombard 17.8% FY26; Star Health 13.1% normalized | No evidence base for 30% ROE in Indian health insurance | **No** — exceeds any known comparator in the sector |
| 24 years of 20% ROE (alternative framing) | No insurer in the peer set has demonstrated 20% ROE | "No moat proven" verdict [09_moat.md §5] means no structural basis for this duration | **No** — moat verdict and competitive dynamics make multi-decade 20% ROE implausible |

**In plain terms:** The current price of INR 84.03 embeds an expectation that Niva Bupa will, in four years, be generating a return on its equity of approximately 49%. The company's own management considers mid-to-high-teens ROE by FY29 an ambitious target that requires achieving a 99% combined ratio — a level it has never reached. The most profitable health insurer in its peer set, ICICI Lombard, generates an 18% ROE, and the largest standalone health insurer, Star Health, generates a 13% normalized ROE. The implied peak ROE of nearly 49% is roughly 2.7× the best peer benchmark in the sector. No evidence in the available data — historical financials, management guidance, or peer benchmarks — supports the expectation embedded in the price. The market is pricing Niva Bupa as if it will become the highest-ROE health insurer in the world, not merely in India.

**Market-ceiling sanity check (insurance / financial issuer adaptation):** Niva Bupa is a Financial issuer — a revenue-TAM ceiling test is not meaningful for a bank or insurer; the relevant scale check is the addressable premium pool vs the company's own book. The Indian retail health insurance market is guided to grow at 17–19% CAGR over five years [Q4 FY26 transcript, CEO]; at the FY26 GWP base of ₹9,433 crores and a 10.1% retail market share, the company is already a significant player. A 49% peak ROE is not a market-share problem — it is a structural economics problem: no health insurer at any meaningful scale has produced 49% ROE because underwriting profitability in health insurance is structurally bounded by loss ratios (currently 66–68% of premiums), regulatory EOM caps, and investment yields. Even capturing 100% of incremental industry growth would not produce the magnitude of return embedded in the price — the constraint is economics, not addressable market size. This is not a case where the company might run out of market; it is a case where the implied return on capital exceeds anything the business model of health insurance has ever generated.

---

## 4. Robustness

### 4a. Cost of Equity (Ke) sensitivity

| Cost of Equity (Ke) | Implied Peak ROE to Justify INR 84.03 |
|---|---:|
| 11.87% (−1pp from base) | 47.3% |
| **12.87% (base — from `04`)** | **48.9%** |
| 13.87% (+1pp from base) | 50.4% |

*Solver: bisection on each Ke variant; all three roots converged to within INR 1 mn of target.*

### 4b. Book equity (BV₀) base sensitivity

| BV₀ Scenario | BV₀ Used (INR mn) | Implied Peak ROE |
|---|---:|---:|
| BV low (−10% from Capital IQ: normalisation haircut scenario) | 32,242 | 51.7% |
| **BV base (Capital IQ FY26 as-filed)** | **35,824** | **48.9%** |
| BV high (+10%: if Capital IQ understates equity) | 39,407 | 46.3% |

**Which input dominates?** The implied peak ROE is highly insensitive to the cost of equity (a ±1pp change in Ke shifts the implied peak ROE by only ±1.6pp) but moderately sensitive to the BV₀ base (a ±10% change in BV₀ shifts the implied peak ROE by ±2.6pp). The dominant finding — that the required peak ROE is approximately 47–52% across the entire grid — is robust across all tested inputs. The key binding constraint is the 4.33× price-to-book ratio: as long as the market pays this premium, no reasonable combination of Ke and BV₀ brings the implied ROE into achievable territory.

### 4c. Terminal ROE sensitivity

*Note: In the RI model, the terminal value concept works differently from a Gordon-growth FCFF DCF — the "terminal value" is zero when ROE = Ke, and non-zero when there is a persistent excess return. Varying terminal ROE therefore tests whether assuming a small persistent excess return materially reduces the implied peak ROE needed over the horizon.*

| Terminal ROE Assumption | Implied Peak ROE |
|---|---:|
| 0.97 × Ke (mild terminal underperformance) | 50.9% |
| **1.00 × Ke (base — no moat)** | **48.9%** |
| 1.03 × Ke (small persistent excess: moat evidence required) | 47.0% |

Even assuming a small perpetual excess return (terminal ROE = 1.03 × Ke, a scenario the "no moat proven" verdict from `09_moat.md` does not support), the required peak ROE is still 47.0% — entirely outside the range of achievable outcomes.

**Summary:** The implied peak ROE of ~47–52% across the entire robustness grid sits 2.6–3.1× above management's own most optimistic scenario ("mid- to high-teens ROE by FY29"), and 2.6–2.9× above the best ROE any named peer in the sector has achieved. No combination of discount-rate assumptions or book-equity haircuts closes this gap.

---

## 5. What's-Priced-In Read

At INR 84.03, the market is pricing in a peak ROE of approximately **49%** by FY30 — a level that is nearly three times the company's own guided "mid- to high-teens" ROE target and more than twice the best ROE observed anywhere in the Indian health insurance sector. That expectation is **aggressive to the point of being financially implausible**: the structural economics of health insurance — loss ratios above 60%, regulated EOM caps, and investment yields of 7% — place an effective ceiling on ROE well below what the price requires. The forward DCF from `04` independently confirmed this: the base-case intrinsic value is INR 19.94 per share (INR 15.4–25.7 across the full bull/base/bear grid), and the current price exceeds every cell in the 9-cell sensitivity grid by more than 3×. The reverse-DCF confirms that the path from current price back to fundamental value requires not just executing management's ambitious targets, but exceeding them by a factor that has no precedent in this sector or any named peer — implying that the implied expectations are not merely a stretch, they are structurally unachievable.

---

## Self-Check

- [x] Price (INR 84.03) and market cap (INR 155,267 mn) taken from `01_price-and-capital-structure.md` verbatim; price-state is `pool-verified` — agent ran as required.
- [x] Business type is Financial issuer (health insurer); equity-direct RI model inverted, not FCFF/EV; consistent with MODULE_RULES Business-Type Map.
- [x] Ke (12.87%), BV₀ (INR 35,824 mn), model structure (10-year horizon, mid-year convention, zero payout, fade to terminal ROE = Ke), and discounting convention taken from `04_intrinsic-dcf.md` verbatim — no independent WACC or base re-derived.
- [x] Solve executed via Python bisection (Bash); command and root shown in §2 (converged to INR 0.6 mn of target).
- [x] Implied peak ROE (48.9%) compared against company history (through-cycle ROE 6–8%, FY26 = 10.7%), management guidance ("mid- to high-teens" by FY29), and peer benchmarks (ICICI Lombard 17.8%, Star Health 13.1%).
- [x] Achievable/No judgement is evidence-backed (cited history, guidance, peer data).
- [x] Robustness shown across Ke (±1pp) AND BV₀ base (±10%) AND terminal ROE (±3% of Ke); dominant input named (BV₀ > Ke in sensitivity, but both confirm the same implausibility verdict).
- [x] All three robustness re-solves executed via bisection; roots shown.
- [x] Market-ceiling sanity check adapted for Financial issuer (premium pool / addressable market substitute noted; structural economics constraint identified as the binding issue, not market size).
- [x] No banned phrases.

---

*Sources used:*
- `analyses/NIVABUPA_2026-06-22/valuation/01_price-and-capital-structure.md` — price (INR 84.03, pool-verified), market cap (INR 155,267 mn), shares (1,847.757 mn), net debt (INR 1,954.1 mn).
- `analyses/NIVABUPA_2026-06-22/valuation/04_intrinsic-dcf.md` — Ke (12.87%), BV₀ (INR 35,824 mn), model structure, terminal ROE assumption, discounting convention (all used verbatim).
- `analyses/NIVABUPA_2026-06-22/earnings/01_historical-financials.md` — FY26 EBIT, PAT, CFO base and growth history; accounting notes.
- `analyses/NIVABUPA_2026-06-22/earnings/07_earnings-sensitivity.md` — achievable ROE / EOM / combined ratio ranges.
- `analyses/NIVABUPA_2026-06-22/earnings/04_guidance-consensus.md` — management ROE guidance ("mid- to high-teens by FY29"); industry growth guidance (17–19% CAGR).
- `analyses/NIVABUPA_2026-06-22/business-model/09_moat.md` — "No moat proven" verdict; peer ROE benchmarks (ICICI Lombard 17.8%, Star Health 13.1%).
- Capital IQ Financials.xls (NSEI:NIVABUPA), FY2026 ("Latest Filings" restatement), vendor tier §4 tier 5.
- Q4 FY26 Earnings Call transcript, May 8 2026 — management ROE guidance, combined ratio target.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — NIVABUPA

**Company:** Niva Bupa Health Insurance Company Limited (NSEI:NIVABUPA)
**Reporting standard:** India GAAP (IRDAI insurance template); IFRS internally. Figures in INR Millions unless noted. 1 crore = 10 million.
**Fiscal year end:** 31 March. FY26 = April 2025 – March 2026.
**Business type:** Financial issuer — IRDAI-regulated standalone health insurer (SAHI). Per MODULE_RULES Business-Type Map, valuation is equity-direct (P/E, P/Tangible Book, excess-return on equity). EV-based multiples are informational only. The equity bridge presented below is therefore informational; the sanity-check multiple is applied on an equity basis, consistent with the Financial issuer method map.

---

## Effectively Single-Segment — SOTP Collapses to the Consolidated Read

Niva Bupa operates as a **single-reportable-segment** business from FY25 onward. The Capital IQ Financials.xls Segments tab consolidates all FY25 and FY26 revenue and profit into one "Health Insurance" bucket; no sub-segment EBIT split is published. The segment-map upstream (business-model/03_segment-map.md) confirms: "Profit shares are Not disclosed at segment level. The company does not publish a statutory segment profit note under Ind AS 108 because it operates as a single-line insurer (health only) for IRDAI reporting purposes." [Capital IQ Financials.xls → Segments tab, FY25–FY26; Q4 FY26 Earnings Call transcript, May 8, 2026]

The partial-data rule in the system prompt applies: a breakup analysis cannot be forced on a business where >85% of EBIT (in this case, 100%) sits in one segment. SOTP collapses to the consolidated read. A spurious two-line breakup (Retail vs Group) would require segment-level EBIT that does not exist in any filing or transcript.

What follows is the required **dominant-segment multiple sanity check** in place of a full SOTP table. The equity bridge and per-share read are produced as required; any corporate / unallocable drag is addressed explicitly below.

---

## 1. Segment Inventory

All figures in INR Millions. Currency: INR. Reporting standard: India GAAP (IRDAI insurance template) as sourced via Capital IQ vendor export.

| Segment | Revenue (FY26) | EBIT (FY26) | EBIT Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| Health Insurance (single reportable segment) | ₹84,435M | ₹5,015M | 5.9% | 100% | Capital IQ Financials.xls → Income Statement tab, FY26; Segments tab, FY26 |
| Unallocated corporate costs | — | — | — | — | Not separately disclosed; IRDAI single-segment filer — all costs (including HO overhead) are netted into the single "Health Insurance" segment by definition |
| **Total reportable EBIT** | **₹84,435M** | **₹5,015M** | **5.9%** | **100%** | |

**Corporate cost note (Gate 3):** Because the company files as a single-segment entity under Ind AS 108 and IRDAI regulations, there is no separately disclosed unallocated corporate line. Management does not publish a head-office overhead bucket distinct from segment results. The consolidated EBIT of ₹5,015M already nets all operating costs — including HO, technology, and distribution — into the single health-insurance segment. No corporate drag is dropped by assertion; none exists as a separate published bucket. The sanity-check below applies the multiple to this fully-loaded consolidated EBIT (and independently to PAT, which is also a post-all-costs figure), so the corporate drag is captured in the metric, not excluded. [Capital IQ Financials.xls → Segments tab, FY25–FY26; business-model/03_segment-map.md]

**PAT (Ind AS / IGAAP, FY26):** ₹3,661M (₹366 crores), per Capital IQ Income Statement tab. EPS (basic, used as proxy for diluted): ₹1.98. [Capital IQ Financials.xls → Key Stats tab, FY26]

---

## 2. Segment Multiples & Comparables (Sanity Check Only — Collapsed SOTP)

Because SOTP collapses to a single-segment read, the relevant exercise is: what does the dominant segment (health insurance, i.e. the whole business) warrant as a standalone multiple, benchmarked against the closest pure-play listed comparable?

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| Health Insurance (consolidated) | LTM P/E on FY26 PAT | 42.4× observed (current price / FY26 EPS) | Star Health and Allied Insurance Company Ltd (NSEI:STARHEALTH) — the only other listed standalone health insurer in India | ~55–56× LTM P/E (Jun 18 2026) | Web: ValueResearch / ICICIDirect, Jun 18 2026 (indicative, unverified) |
| Health Insurance (consolidated) | NTM P/E on FY27E EPS | 75.2× observed (consensus NTM) | Star Health (NSEI:STARHEALTH) | ~33–36× forward P/E (analyst consensus range cited by multiple sources) | Web: InvestYWise / UniVest FY27 estimates, Jun 2026 (indicative, unverified) |
| Health Insurance (consolidated) | P/Tangible Book | 4.40× observed | Star Health (NSEI:STARHEALTH) | ~3.3–4.0× (web, across Jun 2026 dates) | Web: ValueResearch / ICICIDirect, Jun 2026 (indicative, unverified) |

**Why Star Health is the right comparable:** Star Health is the only other IRDAI-licensed standalone health insurer (SAHI) listed on Indian exchanges. Like Niva Bupa, it writes exclusively health, personal accident, and travel insurance; it operates under the same IRDAI regulatory framework (expenses-of-management cap, solvency requirements); and it is the closest available pure-play for a segment-multiple check. Multi-line peers (ICICI Lombard, New India Assurance) and life peers (HDFC Life, SBI Life, LIC) operate under different product mixes, regulatory regimes, and business economics, making them less precise comparables for this sanity check, though they form the broader peer set used in agent 03. [business-model/08_competitive-map.md; Capital IQ Comps export, as-of 2026-06-04]

**Multiple comparisons (web-sourced, unverified):**
- **LTM P/E:** Niva Bupa at 42.4× vs Star Health at ~55–56×. Niva Bupa trades at a discount of roughly 24–25% to Star Health on trailing earnings. This is directionally consistent with Star Health being 2.2× larger by GWP, already underwriting-profitable (combined ratio 98.8% vs Niva Bupa's 101.4%), and carrying a higher ROE (13.1% normalized FY26 vs Niva Bupa's 10.7%). The discount looks explicable, not anomalous.
- **NTM P/E:** Niva Bupa at 75.2× vs Star Health at ~33–36× forward is the reverse — Niva Bupa looks more expensive on forward earnings. This reflects the consensus expectation that Niva Bupa's EPS will jump sharply between FY26 (₹1.98 reported) and FY27E (₹1.117 per Capital IQ consensus mean — note: this is lower than reported FY26 EPS because the consensus FY27E uses normalized/adjusted methodology; the FY28E consensus mean is ₹2.365). The NTM P/E is partly a timing artefact of the 1/N accounting pattern and should be used with care. [Capital IQ EstimatesReport.xls → Consensus and Multiples tabs; 00_valuation-data-triage.md]
- **P/Tangible Book:** Niva Bupa at 4.40× vs Star Health at ~3.3–4.0× — broadly in line, with Niva Bupa trading at a modest premium, which reflects its faster growth profile (GWP +27.4% FY26 vs Star Health +16%) and higher retail market share momentum (+100 bps per year).

---

## 3. Segment Valuation (Sanity Check — Collapsed SOTP)

No multi-row segment valuation table is produced because there is only one segment. The sanity check applies the dominant-segment comparable multiple range to produce an implied equity value per share.

**Method:** For a Financial issuer (insurer), valuation is equity-direct. The relevant sanity-check multiples are P/E (on both LTM and NTM earnings) and P/Tangible Book.

**LTM P/E sanity check:**
- Star Health LTM P/E (web, indicative): ~55–56×
- Niva Bupa FY26 PAT: ₹3,661M = ₹366 crores; FY26 EPS: ₹1.98
- Implied equity value at Star Health's comparable 55× LTM P/E: ₹1.98 × 55 = **₹108.9/share**
- Implied equity value at a 25% discount to Star Health (reflecting Niva Bupa's lower profitability and scale): ₹1.98 × 41× = **₹81.2/share** (close to current price of ₹84.03)
- The current LTM P/E of 42.4× sits roughly 23% below Star Health's 55× — directionally consistent with the scale and profitability gap.

**P/Tangible Book sanity check:**
- Tangible book value/share (per 01): ₹19.11
- Niva Bupa current P/TBV: 4.40× (price ₹84.03 / TBV/share ₹19.11)
- Star Health P/TBV (web, indicative): ~3.3–4.0×
- At Star Health's upper P/TBV of 4.0×: implied price = ₹19.11 × 4.0 = **₹76.4/share**
- At a 10% premium to Star Health's upper P/TBV (warranted by Niva Bupa's higher growth rate): ₹19.11 × 4.4 = **₹84.1/share** — essentially the current price.

| Sanity-Check Method | Metric Used | Multiple Range | Implied Value/Share (INR) |
|---|---:|---|---:|
| LTM P/E at Star Health comparable (55×) | FY26 EPS ₹1.98 | 55× | ₹108.9 |
| LTM P/E at 25% discount to peer (41×) | FY26 EPS ₹1.98 | 41× | ₹81.2 |
| P/Tangible Book at Star Health upper (4.0×) | TBV/share ₹19.11 | 4.0× | ₹76.4 |
| P/Tangible Book at 4.4× (10% premium to peer) | TBV/share ₹19.11 | 4.4× | ₹84.1 |
| **Current price (pool-verified)** | | | **₹84.03** |

The range spanned by these four reference points is ₹76–₹109/share, with the current price sitting at the lower end of the peer-based range on LTM earnings (consistent with a deserved discount for lower profitability) and essentially at fair value on P/TBV at a slight premium to the peer.

---

## 4. Equity Bridge

Because SOTP collapses and the business type is **Financial issuer (insurer)**, the equity bridge is informational only — it is not used as the primary valuation anchor (per MODULE_RULES Business-Type Map). The equity bridge below is provided for completeness and the per-share sanity-check read, using `01` anchors verbatim.

For a Financial issuer, "gross enterprise value" in the traditional SOTP sense is not applicable. The figures below show the equity value directly, consistent with equity-direct valuation for an insurer.

| Step | Value (INR M) | Notes |
|---|---:|---|
| Equity market value (market cap) | ₹155,267M | 1,847.757M shares × ₹84.03; Capital IQ Key Stats tab |
| Subordinated NCDs | ₹2,540.4M | 10.70% Sub NCDs, Nov 2031 + Mar 2032 maturities; Capital IQ Capital Structure Details tab, FY26 |
| Lease liabilities (Ind AS 116) | ₹1,000.3M | Capital IQ Capital Structure Details tab, FY26 |
| Total debt | ₹3,540.7M | |
| − Operating cash | (₹1,586.6M) | Balance sheet operating cash; insurer investment portfolio (₹96,072.9M) is NOT netted — it is the underwriting business asset, not surplus cash |
| **Net debt (strict basis, per 01)** | **₹1,954.1M** | Capital IQ Capital Structure Summary tab, FY26 |
| Minority / preferred | Nil | Capital IQ Key Stats; no minority or preferred in issue |
| − Capitalized unallocated corporate costs | — | None to subtract: single-segment filer; no separate corporate overhead bucket is disclosed; all costs are netted into the single reported EBIT |
| − Conglomerate / holdco discount | None applied | Single-segment operating insurer; no holding-company structure, no cross-subsidies between segments, no look-through discount warranted |
| **= Equity value (implied)** | **₹155,267M (₹15,527 crores)** | = Market cap; the equity bridge for an insurer does not reduce the equity value to a per-share SOTP number — it is already an equity value |
| ÷ Diluted shares (proxy; basic used as proxy per 01) | 1,847.757M | Capital IQ Key Stats tab; dilution schedule absent — basic used as proxy |
| **= Current price / implied SOTP value per share** | **₹84.03** | The SOTP collapses to the consolidated equity read; the sanity-check multiple range is ₹76–₹109/share (see Section 3) |
| vs current price | ₹84.03 | Pool-verified; Capital IQ Key Stats tab (~Jun 2026; staleness ~1 month) |

**Net-cash sign discipline:** Net debt is positive (₹1,954.1M) — the company is not net cash. The insurer's investment portfolio (₹96,072.9M) is the underwriting business asset and is not netted per 01's treatment. No double-count risk.

**Conglomerate discount:** None applied. Niva Bupa is a pure-play standalone health insurer with a single reportable segment — there is no conglomerate structure, no cross-subsidies, no look-through adjustment, and no holding-company premium that needs to be discounted.

---

## 5. SOTP Read

SOTP collapses to the consolidated read because Niva Bupa is a single-segment standalone health insurer — 100% of its revenue and EBIT sits in one "Health Insurance" bucket with no sub-segment profit disclosure anywhere in the filing or available data.

At ₹84.03, the market is paying 42.4× trailing earnings (FY26 EPS ₹1.98) and 4.40× tangible book. Against the closest listed pure-play peer, Star Health, Niva Bupa trades at roughly a 24% discount on trailing P/E (~55–56× for Star Health) — a discount that is largely explicable by the profitability gap: Star Health's combined ratio reached 98.8% (underwriting-profitable) in FY26 while Niva Bupa's was 101.4% (still underwriting-unprofitable), and Star Health's ROE of 13.1% normalized exceeds Niva Bupa's 10.7%. On P/TBV, the two trade at broadly comparable levels (Niva Bupa 4.40× vs Star Health ~3.3–4.0×), with Niva Bupa's modest premium reflecting its higher GWP growth (27.4% vs 16%) and rising retail market share (10.1% in FY26, up from 9.1% in FY24).

The breakup insight is structurally absent here: there is no segment hidden behind a consolidated multiple that could be unlocked. The entire value is the health insurance underwriting franchise itself, and the market is pricing it on the path to underwriting profitability — the key value-creation question is whether Niva Bupa can close the combined-ratio gap to Star Health, not whether there are hidden segments to separate.

---

*Partial data: single-segment — SOTP collapsed to consolidated read. No sub-segment EBIT disclosed anywhere in filings or transcripts; Capital IQ Segments tab FY25–FY26 shows one "Health Insurance" bucket. Full SOTP not possible and not forced. Dominant-segment multiple sanity check produced in its place.*



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — NIVABUPA

**Company:** Niva Bupa Health Insurance Company Limited (NSEI:NIVABUPA / BSE:544286)
**Business type:** Financial issuer — IRDAI-regulated standalone health insurer (SAHI)
**Reporting currency:** INR (Indian Rupees). Figures in INR per share unless stated; monetary totals in INR millions (1 crore = 10 million).
**Reporting standard:** India GAAP (IRDAI insurance template); IFRS voluntarily reported as the primary management metric.
**Fiscal year end:** 31 March. FY26 = April 2025 – March 2026.
**Analysis date:** 2026-06-22
**Price-state:** `pool-verified` — INR 84.03 from Capital IQ export; three independent pool sources agree within 0.4%; last confirmed-dated close INR 83.62 on 2026-05-21 (~32 days stale). [01_price-and-capital-structure.md §1]

**Anchor block (from `01`, used verbatim throughout):**
- Price: INR 84.03
- Shares: 1,847.757 million (basic, proxy for fully diluted — dilution schedule absent from pool)
- Market cap: INR 155,267M (INR 15,527 crores)
- Net debt (strict): INR 1,954.1M (total debt INR 3,540.7M − operating cash INR 1,586.6M; insurer investment portfolio of INR 96,072.9M is NOT netted)
- BV/share: INR 19.39 | TBV/share: INR 19.11 | FY26 EPS (reported): INR 1.98

**Business-type gate (read first):** Niva Bupa is a Financial issuer per MODULE_RULES Business-Type Map. This means (a) the RI model / excess-return method is the primary intrinsic lens, not an FCFF DCF; (b) the primary equity multiples are P/E and P/Tangible Book; (c) EV-based multiples are informational only and do NOT enter the fair-value calculation; and (d) any equity bridge (net debt subtraction) is done at the book/market equity level, not via an EV → equity step. All bridge arithmetic below uses the P/BV or residual-income framework, which is already equity-direct — no net debt subtraction is applied to a value that already sits at the equity level.

---

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | INR 77.4–81.5 (illustrative range only) | Very low | **0%** | Short history: 6 quarterly observations since Nov 2024 IPO, below the ~3-year minimum. Agent 02 explicitly flagged all reversion-implied values as "illustrative-only — NOT fair-value inputs for 07." Excluded per partial-data rule and the agent's own caveat. Range shown in §2 football field for transparency only. |
| Relative / peers (03) | INR 75.8 (primary: quality-adj P/E); INR 63.2 (secondary: ROE-scaled P/TBV) | Medium-low | **30%** | Peer set is thin (2 primary comps; 1 of the 2 has no usable NTM P/E; Star Health P/TBV not available). Quality adjustment is necessary and applied (12.5% discount from SAHI median; ROE-scaling for P/TBV). The primary P/E implied value of INR 75.8 is the most market-grounded anchor and carries moderate weight, but the thin peer set limits confidence. |
| Intrinsic RI / excess-return model (04) | INR 19.94 (base); range INR 15.4–25.7 | Medium | **70%** | Primary intrinsic method for a Financial issuer per Business-Type Map. Directly values the franchise on ROE vs cost of equity. Assumptions labeled; Ke cross-checked against moat module estimate (37 bps difference — within tolerance). The "no moat proven" terminal condition is evidence-anchored. Dominant weight because this is the correct method for this business type; confirmed directionally by the structural observation that 97% of intrinsic equity value is the starting book (INR 19.39/share). |
| Reverse-DCF (05) | Peak ROE implied = 48.9% | n/a — cross-check only | n/a | Inverts `04`'s model. Finds that the current price of INR 84.03 requires a peak ROE of ~49% by FY30 — approximately 3× management's most optimistic guided outcome and 2.7× the best peer ROE observed in the sector. Confirms price is embedding expectations that are structurally implausible. Not a value input; used only to assess what is priced in. |
| Sum-of-the-parts (06) | INR 76.4–108.9 (sanity-check range only) | Low | **0%** | SOTP collapsed to consolidated read: 100% of EBIT in one "Health Insurance" segment; no sub-segment profit disclosed in any filing or transcript. Agent 06 explicitly flagged this as a "dominant-segment sanity check only." Excluded from triangulation per partial-data rule and agent's own flag. Range shown in §2 football field for transparency. |

**Weights sum to 100% across the two value-producing methods (03 and 04).** Methods 02 and 06 are zero-weighted per their own producers' flags. The reverse-DCF (05) is a cross-check, not a weighted input.

---

## 2. Triangulation & Reconciliation

### Method Football Field — Full Cross-Method Dispersion

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | INR 77.4–81.5 (illustrative-only) | Very low | 0% | 6 data points, ~18 months history; agent flagged "not a fair-value input." Shown for transparency only. |
| Relative / peers (03) — primary P/E | INR 75.8 | Medium-low | 30% | Quality-adjusted warranted multiple; thin peer set (2 comps) |
| Relative / peers (03) — secondary P/TBV | INR 63.2 | Low | 0% (subsumed in 03's 30%) | ROE-scaled anchor; shown as the floor within method 03 |
| Intrinsic RI model (04) — base | INR 19.94 | Medium | 70% | Primary method for Financial issuer; Ke and terminal ROE anchored to moat verdict |
| Intrinsic RI model (04) — bull | INR 25.7 | — | — | Ke −1pp, peak ROE 15.5%, small perpetual excess |
| Intrinsic RI model (04) — bear | INR 15.4 | — | — | Ke +1pp, ROE peaks 12%, never exceeds Ke |
| Sum-of-the-parts (06) | INR 76.4–108.9 (sanity-check only) | Low | 0% | Collapsed single-segment; shown for transparency only |

**Cross-method spread headline: the two value-producing methods disagree by 280% in spread terms ((INR 75.8 − INR 19.94) / INR 75.8 = 73.7%). This is far above the 40% cross-method divergence threshold and is the headline finding of this reconciliation.**

### Derivation of the Base-Case Fair Value Point

Computed via Python bisection (executed above):
- Peer (03) primary value: INR 75.80 × 30% = INR 22.74
- RI model (04) base: INR 19.94 × 70% = INR 13.96
- **Mechanical weighted blend: INR 36.70/share**

**Reconciliation judgment — why the RI model dominates (70/30):**

For an IRDAI-regulated health insurer — a Financial issuer per MODULE_RULES — the intrinsic method is the residual-income model, which values equity on the spread between ROE and the cost of equity, not on cash flows to the firm. This is the correct primary lens. The RI model here is built on documented FY26 book equity of INR 35,824M, a Ke of 12.87% (inputs sourced and cross-checked), and a terminal ROE of Ke (anchored to the "No moat proven" verdict from `09_moat.md §5`). It is internally consistent, correctly structured for this business type, and covers the full 10-year explicit period plus terminal.

The peer method (03) is the secondary anchor. The peer set is thin — only two listed comparables in the SAHI category, one of which (Star Health) lacks a usable TBV multiple, and the Capital IQ NTM EPS for NIVABUPA is flagged as unreliable (see `03_relative-valuation-peers.md §2`). The 30% peer weight is appropriate: the method is valid, the primary P/E implied value (INR 75.8) is evidence-based, but the thin comp set limits its standing.

The large spread (INR 75.8 vs INR 19.94 = 73.7% gap) reflects a real economic disagreement, not a data problem: **the peer multiple embeds the market's growth premium for Niva Bupa's trajectory toward underwriting profitability, while the RI model assigns value based on what the business actually earns relative to its cost of capital.** At an ROE of 10.7% versus a Ke of 12.87%, the business currently destroys equity value in economic terms — the RI model values that honestly. The peer multiple reflects what investors are willing to pay today for the option on mid-teens ROE, regardless of whether that outcome is achievable. Both lenses are methodologically correct; the RI model is given higher weight because it is the primary intrinsic method for this business type, and because the reverse-DCF (05) confirms the peer multiple-implied price is embedding expectations that are structurally implausible.

The mechanical weighted blend of INR 36.70/share is adopted as the base-case fair value without adjustment. No silent re-anchor is applied.

---

## 3. Bull / Base / Bear Fair-Value Levels

All fair-value levels computed via executed Python snippet (outputs shown in §2 derivation section above). Horizon: 12 months (default). No probabilities assigned.

**Note on cyclicality gate:** Niva Bupa is not a cyclical or commodity business. Business quality cyclicality score = 65/100 (strong — health insurance demand is largely non-cyclical; see `07_business-quality.md §1`). The standard cyclicality gate (requiring a through-cycle trough anchor) is not the binding constraint. The binding driver is **operating leverage on the combined ratio** and **IRDAI regulatory binary risk** — the two largest variables from `07_earnings-sensitivity.md §2`.

**Structural-reset / permanent-impairment trigger check:**
- Moat verdict: "No moat proven" — bare unproven moat, NOT an actively eroding moat trajectory. Moat trajectory is described as "widening" in `09_moat.md §5`.
- Business quality disruption score: 55 (above the ≤40 threshold for the §24 Filter 5 flag).
- Per MODULE_RULES graduated-trigger rules: a bare "No moat proven" verdict (unproven, not decaying) with a usable `04` in the blend (70% weight, and it fades terminal ROE to Ke) means the structural reset is NOT the headline Bear. It is carried as the labelled **avoid-ruin floor** to §24 below. The headline Bear is the 12-month scenario built from `07_earnings-sensitivity.md` drivers.

| Case | Fair Value / Share (INR) | Implied P/E | Implied P/BV | Horizon | What Must Be True |
|---|---:|---:|---:|---|---|
| Bull | **INR 43.98** | 22.2× | 2.27× | 12 months | RI: Ke −1pp (11.9%), ROE reaches 15.5% (above guided "mid-teens"), terminal ROE modestly above Ke (1.03×); peer: no quality discount from SAHI median (43.75× LTM P/E). Requires: EOM ratio falls ~300 bps in FY27 (above-trend operating leverage), combined ratio breaks 99% early (FY28), no adverse IRDAI regulatory action, investment yields hold near 7.2%, and market re-rates to full SAHI peer multiple (removing the quality discount). GWP growth sustains at ≥25%. |
| **Base** | **INR 36.70** | **18.5×** | **1.89×** | 12 months | RI: Ke 12.87%, ROE reaches 14.5% by FY30 (management's guided "mid-teens" range), terminal ROE = Ke (no moat). Peer: quality-adjusted warranted LTM P/E of 38.3× (12.5% discount from SAHI median). Requires: EOM ratio declines ~200 bps per year (in line with management guidance), combined ratio approaches 99% by FY29, investment yield stable at ~7.2%, IRDAI does not materially disrupt commission/EOM structure, GWP grows at ~22–25% CAGR. |
| Bear | **INR 16.51** | 8.3× | 0.85× | 12 months | RI: Ke +1pp (13.9%), ROE peaks at 12.0% (never exceeds Ke) — GWP growth slows to ~12–15%, fixed-cost leverage reverses, EOM ratio re-widens 200 bps. Peer: P/TBV at 1.0× (book value) — appropriate anchor for an insurer earning at or below its cost of equity. Requires: one or more of: (a) IRDAI imposes adverse commission-cap restructuring, causing GWP growth to fall 10+ ppts; (b) medical inflation accelerates to 9–10%, widening loss ratio by 200 bps; (c) RBI rate-cut cycle compresses investment yield by 100 bps — all three compound adversely per `07_earnings-sensitivity.md §6` (the non-linear negative case). |

**§24 Avoid-ruin floor (structural-reset — NOT the headline Bear):** The bare "No moat proven" trigger fires the structural reset calculation, which is demoted from the headline Bear because (a) the moat trajectory is widening (not actively eroding), and (b) `04` (with 70% weight) already fades terminal ROE to Ke, so the no-excess-return impairment is priced into the blend.

Structural reset computed on the business-type-appropriate equity method — P/BV at ROE/Ke ratio (already equity-direct; no net debt subtraction needed):
- Required sustainable ROE if current P/BV of 4.33× is warranted: 4.33 × Ke (12.87%) = 55.8% — unachievable.
- Structural reset P/BV = ROE / Ke = 10.7% / 12.87% = 0.831× (the insurer permanently earns its current ROE with no improvement).
- Structural reset per share = 0.831× × BV/share INR 19.39 = **INR 16.12/share**.
- Snippet output: `structural_reset_pershare = 19.39 * (10.7 / 12.87) = INR 16.12` (this is already an equity value from a P/BV method on BV/share — dividing by shares directly, no net debt subtraction).

The avoid-ruin floor is **INR 16.12/share** — broadly consistent with the RI bear (INR 15.4) and the headline Bear (INR 16.51), confirming the bear case effectively encompasses the structural reset already. The floor is labelled for §24 / Kill Criteria as the multi-year permanent impairment scenario (ROE permanently stuck at 10.7%, no operating leverage materialisation, market re-rates to 0.83× book).

---

## 4. Margin of Safety & Downside (two separate metrics)

All computed via executed Python snippet (outputs verified above):

```
base_fv = 0.70 × 19.94 + 0.30 × 75.80 = 13.96 + 22.74 = INR 36.70
bear_fv = 0.70 × 15.40 + 0.30 × 19.11 = 10.78 + 5.73 = INR 16.51
MOS  = (36.70 − 84.03) / 36.70 = −129.0%
DTB  = (84.03 − 16.51) / 84.03 = +80.4%
```

| Metric | Value |
|---|---:|
| Current price | INR 84.03 |
| Base-case fair value (point) | INR 36.70 |
| Bear-case fair value | INR 16.51 |
| Bull-case fair value | INR 43.98 |
| Implied downside to base = (price − base FV) / price | −56.3% (price is 56.3% above base fair value) |
| Implied upside to bull = (bull FV − price) / price | −47.7% (price is above even the bull case) |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−129.0%** — no margin of safety exists; price is 129% above base fair value |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **+80.4%** — price would need to fall 80.4% to reach the bear fair value |

**Interpretation:** The margin of safety is deeply negative (−129.0%), meaning the current price of INR 84.03 is not below but far above the base fair value of INR 36.70. There is no cushion; the risk runs entirely in the other direction. The downside-to-bear of 80.4% describes the loss if the bear case plays out. Even in the bull case (INR 43.98/share), the stock offers no positive return from the current price — it is priced above every scenario in the fair-value grid.

Price-state: `pool-verified` — both price-relative metrics are assessable. ~32 days staleness between today's analysis date and the last confirmed-dated close (INR 83.62 on 2026-05-21) is a data-quality caveat, not a no-price trigger. At a 56% implied downside to base fair value, this staleness is immaterial to the conclusion.

---

## 5. Warranted-Multiple Check

The current price of INR 84.03 implies a P/BV of 4.33× on FY26 book equity. For a P/BV multiple to be economically justified, the business must be able to sustain a ROE at least equal to: P/BV × Ke = 4.33 × 12.87% = **55.8%**. Niva Bupa's FY26 ROE is 10.7% — a factor of 5.2× below what the current multiple requires. Management's most optimistic guided outcome is "mid- to high-teens" ROE by FY29, and the best comparable peer (ICICI Lombard) achieves 17.8%. The current P/BV multiple demands a level of return the company has never approached and that no named peer in the sector has ever achieved.

The reverse-DCF (`05`) independently confirmed this: justifying INR 84.03 on the RI model requires a peak ROE of ~49% by FY30, approximately 2.7× the best ROE in the Indian health insurance sector. This is not a case of a modestly stretched multiple that a few years of operating improvement could close — the gap is structural, rooted in the economics of health insurance (loss ratios above 60%, regulated EOM caps, investment yields of 7%). The stock is not temporarily expensively priced relative to a reachable fair value; it is priced for an outcome the business model cannot deliver.

No RF-OWN-004 (misaligned controlling owner) flag was formally triggered by the governance module — Bupa Group (55.35% promoter) is assessed as broadly aligned with per-share value creation [management-governance/99_management-governance-synthesis.md §1], and the governance synthesis did not apply the §24 Filter 6 value-trap cap. The related-party risk (unquantified Bupa Singapore brand/reinsurance/technology fees) is unresolved due to absent Annual Report but is not a triggered flag. The warranted-multiple gap is driven by fundamentals, not ownership structure.

---

## 6. Fair-Value Read

The base-case fair value for Niva Bupa is **INR 36.70/share** (bull: INR 43.98; bear: INR 16.51), derived 70% from the residual-income (excess-return on equity) model and 30% from quality-adjusted peer multiples — the correct method mix for a Financial issuer with a "No moat proven" verdict. The current price of INR 84.03 is 56% above the base fair value and 91% above even the bull fair value — there is no scenario in the valuation grid at which the stock is priced attractively. The margin of safety is −129% (price is 129% above the base fair value); the downside to the bear case is 80%. The dominant method is the RI model (04): for an insurer earning a 10.7% ROE against a 12.87% cost of equity, intrinsic value is anchored close to book value (INR 19.94/share base) because the company earns below its cost of capital now and has no proven moat to sustain excess returns in perpetuity. The single biggest swing factor between bull and bear is the EOM ratio / operating leverage trajectory: a bull move of 270 bps EOM improvement adds ₹1.03 to EPS; a bear reversal of 200 bps (if GWP growth slows sharply or IRDAI disrupts distribution economics) strips ₹0.77 from EPS — and either outcome compounds with the medical inflation and investment yield variables, creating a non-linear downside asymmetry in the bear case. The market is pricing Niva Bupa's option on mid-teens ROE as if that outcome is a near-certainty; the evidence from the business itself (10.7% ROE, combined ratio still above 100%, no proven moat, IRDAI regulatory uncertainty) says it is a possibility at best.

---

## Self-Check

- [x] Every method's value and confidence pulled from `02`–`06`, not re-derived.
- [x] Method weights (30% peer / 70% RI) justified by reliability for this Financial issuer; sum to 100% across value-producing methods. Mechanical blend (INR 36.70) is the published base — no silent re-anchor. Methods 02 and 06 zero-weighted with reasons stated.
- [x] Reverse-DCF used as cross-check only, not weighted.
- [x] Method disagreement 73.7% (>40%) flagged as headline finding in §2.
- [x] Bull / base / bear are each a single derived LEVEL (a point), tied to operating drivers and dated (12 months). No probabilities assigned.
- [x] Margin of safety = (base FV − price) / base FV = −129.0%; downside to bear = (price − bear FV) / price = +80.4%. Two SEPARATE metrics; neither is a proxy for the other. Price-state is `pool-verified`; both are assessable.
- [x] Warranted-multiple check: P/BV 4.33× requires sustained ROE 55.8%, unachievable. No value-trap from RF-OWN-004 (not formally triggered by governance module).
- [x] Boundary respected: no probabilities, no risk/reward, no rating, no position sizing.
- [x] Weighted level math, margin of safety, and implied multiples produced by executed Python snippet (outputs shown in §2 and §4).
- [x] Cyclicality gate: not a cyclical/commodity business (cyclicality score 65); bear case built from sensitivity module variables (EOM reversal + IRDAI regulatory risk) — appropriate for this business type.
- [x] Structural-reset / permanent-impairment trigger: bare "No moat proven" fired; structural reset INR 16.12/share computed via P/BV × BV/share (already equity-direct — no net debt subtraction); routed to §24 avoid-ruin floor (not headline Bear) because `04` is in the blend and moat is widening, not eroding. Reset per-share reconciles to stated method and inputs.
- [x] No banned phrases.

---

*Sources used:*
- `analyses/NIVABUPA_2026-06-22/valuation/01_price-and-capital-structure.md` — price, shares, net debt, EV, BV/share anchor
- `analyses/NIVABUPA_2026-06-22/valuation/02_multiples-own-history.md` — own-history multiple bands (illustrative-only flag confirmed)
- `analyses/NIVABUPA_2026-06-22/valuation/03_relative-valuation-peers.md` — peer-implied values (INR 75.8 primary; INR 63.2 secondary)
- `analyses/NIVABUPA_2026-06-22/valuation/04_intrinsic-dcf.md` — RI model base INR 19.94, bull INR 25.7, bear INR 15.4; Ke 12.87%
- `analyses/NIVABUPA_2026-06-22/valuation/05_reverse-dcf.md` — implied peak ROE 48.9%; cross-check used only
- `analyses/NIVABUPA_2026-06-22/valuation/06_sum-of-the-parts.md` — sanity-check range INR 76.4–108.9 (collapsed single-segment flag confirmed)
- `analyses/NIVABUPA_2026-06-22/business-model/07_business-quality.md` — aggregate quality 54/100; regulatory dependence 30/100; disruption score 55
- `analyses/NIVABUPA_2026-06-22/business-model/09_moat.md` — "No moat proven" verdict; moat trajectory widening; Ke cross-check ~12.5%
- `analyses/NIVABUPA_2026-06-22/earnings/07_earnings-sensitivity.md` — variable ranges for bull/base/bear drivers; EOM, loss ratio, investment yield impacts
- `analyses/NIVABUPA_2026-06-22/management-governance/99_management-governance-synthesis.md` — governance verdict, RF-OWN-004 status, ownership structure
- Capital IQ Financials.xls (NSEI:NIVABUPA), FY2026 data, vendor tier §4 tier 5; Capital IQ EstimatesReport.xls, data as of 2026-05-11, vendor tier §4 tier 5
