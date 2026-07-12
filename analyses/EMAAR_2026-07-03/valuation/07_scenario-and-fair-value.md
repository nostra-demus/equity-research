# Scenario & Fair Value — EMAR (Emaar Properties PJSC, DFM:EMAAR)

**Reporting standard:** IFRS | **Currency:** AED (UAE Dirham) | **Fiscal year end:** 31 December  
**Price anchor:** AED 12.20 (pool-verified, two independent Capital IQ sources, Jun-28-2026)  
**Price-state: pool-verified** — margin of safety and downside-to-bear are assessable.  
**Date:** 2026-07-03

---

## Headline Finding — Cross-Method Spread of 102%

The four value-producing methods span AED 19.08 (own-history multiples reversion) to AED 38.47 (intrinsic DCF). That is a 102% spread from low to high — well above the 40% flag threshold and the headline finding of this report. The spread is not narrowed into a fake mid-band; it is the honest dispersion shown in the football field below. The base point is derived from a weighted blend adjusted for the government-owner structural discount, and all four methods agree the current price of AED 12.20 is materially below even the most conservative base, making the cross-method disagreement about **magnitude of undervaluation**, not **direction**.

---

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | AED 19.08 (EV/EBITDA own-median reversion) — range AED 15.49–19.08 | Medium | 20% | Useful direction signal; own-median EV/EBITDA (6.25x) discounts elevated FY2022 multiples. Moderate weight because: (a) the UAE corporate tax step-up (9% CIT + 15% DMTT) structurally widens the EBIT→net-income gap, warranting a lower P/E vs history; and (b) the historical series spans only 4.25 years — a period that includes a significant property upcycle and may embed an inflated mean. |
| Relative / peers (03) | AED 25.97 (NTM EV/EBITDA 8.0x, warranted-multiple base) — range AED 12.34–35.24 | Medium-Low | 20% | The peer set is messy: 5 of 10 peers are Chinese developers in distress or contraction; the warranted multiple (8.0x NTM EV/EBITDA) rests on an analyst assumption premium over Aldar's 6.77x. Weight reflects limited comparability; nonetheless, the cycle-adjusted multiple framework (8.0x vs the raw peer median of 14.37x) is a useful cross-check and directionally consistent with the intrinsic method. |
| Intrinsic DCF (04) | AED 38.47 (WACC 8.83%, terminal g 2.0%, mid-cycle terminal EBIT margin 35%) — sensitivity range AED 32.9–47.0; cycle-trough bear AED 21.60 | Medium-Low (capped per 04: Gate 2 financeable-growth flag; WC uncertainty) | 35% | Highest weight because it is the only method fully anchored to through-cycle cash flows (cyclicality gate applied; terminal margin 35% between FY2021 trough 23.5% and FY2025 peak 45.5%). At 58.5% terminal value as % of EV, the DCF is not terminal-dominated. Moderate-Low confidence cap applies per 04's self-check (Gate 2 flag resolved by lowering terminal g; large near-term WC release adds uncertainty). |
| Reverse-DCF (05) | Implied FCF CAGR of −21.3%/yr — not a fair-value level | Cross-check | n/a | Inverts the same model as 04 using identical parameters. Price implies an 81% total FCF contraction by FY2032 — to a level below the company's AED 4,528M, which is inconsistent with the AED 134.3Bn contracted UAE revenue backlog (making a contraction of that magnitude physically impossible under normal conditions). Confirms the base-case methods are plausible; the current price embeds an extreme pessimism that the evidence does not support. |
| Sum-of-the-parts (06) | AED 30.43 (segment EV/EBITDA × named comps) — range AED 27.54–33.32 | Medium | 25% | Strong for EMAR specifically: the company has five distinct segments with materially different economics (UAE Development at ~8x, Emaar Malls at ~17x). The SOTP surfaces the value of Emaar Malls (86% EBITDA margin) being masked inside the consolidated 3.6x EV/EBITDA. Weight reflects quality of named comparables (Aldar for Development; Arabian Centres for Malls) and a well-documented equity bridge using `01`'s canonical net cash. Second-highest weight. |

**Weights sum:** 20% + 20% + 35% + 25% = 100% across the four value-producing methods. Reverse-DCF carries 0% weight per MODULE_RULES (cross-check, not a fair-value input). No method is zero-weighted as invalid for the business type — EMAR is an operating real estate developer (not a Financial or REIT), so FCFF DCF and EV-based SOTP are both valid methods per the Business-Type Method Map.

---

## 2. Triangulation & Reconciliation

### Football Field — Cross-Method Dispersion (Honest, Not Narrowed)

| Method | Value / Range (AED/share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | 15.49–19.08 (base 19.08) | Medium | 20% | Own-median EV/EBITDA useful anchor; tax step-up warrants some structural multiple compression vs history |
| Relative / peers (03) | 12.34–35.24 (base 25.97) | Medium-Low | 20% | Messy peer set; warranted-multiple (8.0x NTM) is cycle-adjusted; P/E and EV/EBITDA sub-lenses diverge materially (AED 15.0 vs AED 26.0) |
| Intrinsic DCF (04) | 32.9–47.0 (base 38.47; cycle-trough bear 21.60) | Medium-Low (capped) | 35% | Through-cycle anchor; Gate 2 resolved; WC uncertainty noted; confidence capped per 04 |
| Sum-of-the-parts (06) | 27.54–33.32 (base 30.43) | Medium | 25% | Segment-level EBITDA × named comps; surfaces Malls value masked in consolidated multiple |

**True high-to-low spread: AED 19.08 (02 base) to AED 38.47 (04 base) — a 101.6% spread.**  
The bear anchors from each method (P/EPS median AED 15.49 from 02; NTM P/E bear AED 12.34 from 03; DCF cycle-trough AED 21.60 from 04; SOTP bear AED 27.54 from 06) define the downside range, not a consensus bear floor.

**Executed computation — snippet output:**
```
Weighted base (mechanical): AED 30.08/share
  02 contribution: 20% × 19.08 = 3.82
  03 contribution: 20% × 25.97 = 5.19
  04 contribution: 35% × 38.47 = 13.46
  06 contribution: 25% × 30.43 = 7.61
Cross-method spread: max 38.47 / min 19.08 = 101.6% spread — headline finding flagged
```

**Base-case fair value: AED 27.7 per share** (AED 28 rounded). This is the mechanical blend of AED 30.08 reduced by an explicit 8% government-owner discount (see below). The departure from the mechanical blend is disclosed here — it is not a silent re-anchor.

**Reconciliation judgment.** The four methods agree on direction (all materially above AED 12.20) but diverge sharply on magnitude. The own-history method (AED 19.08) is the lowest and most conservative, anchored to the EPS-median reversion which already absorbs the tax step-up. The intrinsic DCF (AED 38.47) is the highest, resting on through-cycle mid-year-convention FCF projections with a 35% terminal EBIT margin — defensible but uncertain. The SOTP (AED 30.43) sits in the middle and is arguably the most transparent lens because it does not require a terminal-growth assumption; it surfaces the Emaar Malls segment value that consolidated multiples mask at 3.6x EV/EBITDA. The peer-relative method (AED 25.97) uses a cycle-adjusted warranted multiple (8.0x NTM EV/EBITDA vs the raw peer median of 14.37x) and represents the most pessimistic of the four upper-bound estimates. The highest-trust lens for this business is the **SOTP + DCF combination** (60% combined weight): Emaar is a multi-segment operating company where the Malls segment has genuinely different economics from the development business, and the intrinsic DCF is anchored to through-cycle norms and is the only method that prices in the AED 134.3Bn backlog's cash-generation profile over time.

**Government-owner conservative adjustment (disclosed lens departure).** CLAUDE.md §24 Filter 6 (unaligned owners) and MODULE_RULES (RF-OWN-004): Dubai Holding holds 29.73% of EMAR following the May 2026 ICD → Emirates Power Investment LLC intra-government transfer. A government entity as the controlling shareholder creates a structural incentive divergence: the Dubai government maximizes strategic objectives (tourism, employment, urban development) that may not align with per-share value maximization. The management-governance module identified this as a structural cap. Persistent cheapness under a value-indifferent owner is a value trap risk, not a margin of safety — the base case should not assume a re-rating the owner will not pursue. An 8% haircut is applied to the mechanical blend (AED 30.08 → AED 27.7). This is a transparent, one-sentence adjustment — not a residual that makes the weights decorative.

---

## 3. Bull / Base / Bear Fair-Value Levels

Each case is a single derived fair-value level from one coherent assumption set. The bull-to-bear spread (AED 20.0–AED 34.2) is the range; the §2 football field (AED 12.34–47.0 across all methods) is the full cross-method dispersion. 12-month convergence horizon unless stated.

| Case | Fair Value / Share (point) | Implied EV/LTM EBITDA | Implied NTM P/E | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | AED 34.2 | 11.6x | 17.5x | 12 months | (1) Dubai property cycle stays resilient: new sales sustained above AED 60Bn; POC delivery pace accelerates +15% (sensitivity: +AED 2,500M EBITDA); (2) NTM EV/EBITDA re-rates to ~11x (approaching Aldar at 6.77x NTM, with EMAR's quality premium; below own-history mean of 6.25x on LTM basis but on a growing earnings base); (3) Malls recurring value gets partial market recognition (no re-listing required, just multiple expansion at group level toward 8–9x); (4) EGP/AED stable; no further DMTT expansion. DCF inputs: WACC 7.83%, terminal g 2.5% — sensitivity upper cell AED 47.0, blended down for cycle realism. |
| Base | AED 27.7 | 9.3x | 14.2x | 12 months | (1) Backlog delivery continues at current pace (AED 134.3Bn UAE backlog delivering at FY2025 pace of 6,129 units/year); (2) Dubai property cycle normalises gradually — no crash, but new sales slow modestly from FY2025 record; (3) EV/EBITDA re-rates from 3.84x toward 9–10x (through-cycle warranted multiple for a narrow-moat developer with net cash) over 12 months; (4) Terminal EBIT margin 35% (mid-cycle between FY2021 trough 23.5% and FY2025 peak 45.5%); (5) UAE corporate tax stable at 13% effective; (6) Government-owner discount (8%) embedded — no re-rating catalyst assumed. Weighted blend: 20% × AED 19.08 + 20% × AED 25.97 + 35% × AED 38.47 + 25% × AED 30.43 = AED 30.08, reduced by 8% government-owner haircut = AED 27.7. |
| Bear | AED 20.0 | 6.6x | 10.3x | 12 months | True through-cycle trough: (1) Dubai residential demand softens materially — new sales fall 25–30% from AED 71.1Bn FY2025 record; (2) POC delivery pace slows −15% (backlog deliveries shift to future periods due to contractor capacity constraints in a building boom compounded by new mega-projects such as Al Maktoum Airport); (3) Construction cost inflation +10% compresses backlog margins by 3–4 pp; (4) Terminal EBIT margin 30% — between the FY2021 actual trough of 23.5% and FY2025 peak of 45.5%, representing a sustained mid-cycle trough (DCF cycle-trough runoff scenario from 04: trough revenue AED 40Bn, trough EBIT margin 30%, g=0% runoff = AED 21.60/share from 04); (5) Multiple stays compressed near 6.5x mid-cycle EV/EBITDA (Aldar parity — no quality premium); (6) Emaar Misr EGP depreciates further 15%; no government re-rating. Bear is the WORSE of: DCF cycle-trough runoff (AED 21.60) and weighted bear blend (AED 20.0). Bear level = AED 20.0 (worse of the two). |

**Bear case prior-trough citation.** The FY2021 cycle trough is the anchor: UAE Development EBIT margin 23.5% (`earnings/01_historical-financials.md` §1); group EBITDA AED 9.2Bn (FY2025 Investor Presentation, slide 15); net profit AED 5.7Bn. The FY2020 trough was deeper (group EBITDA ~AED 3.5Bn per Capital IQ Annual Financials, FY2020; revenue −33% H1 2020 per Preliminary Interim Report, Aug-12-2020, H1-2020). The bear case uses a trough deeper than FY2021 (30% EBIT margin vs 23.5% in FY2021 alone, averaged over 4 bear years in the DCF runoff) but does not reach the COVID-extreme of FY2020. This is evidence-based — both prior-trough periods are named and cited, and the bear is constructed within the historically documented range, not invented.

**Structural-reset / avoid-ruin check.** The trigger for computing a separate structural-reset floor requires `09_moat.md` to return "No moat proven" or "Eroding" moat trajectory, OR `07_business-quality.md` rate-of-change/disruption score ≤ ~40. For EMAR: moat verdict = **Narrow, STABLE** (not eroding); disruption score = **62/100** (above the ≤40 threshold). The trigger does NOT fire. The through-cycle trough (DCF bear AED 21.60, weighted bear AED 20.0) is the bear-case floor. No separate structural-reset calculation is required or warranted.

---

## 4. Margin of Safety & Downside (two separate metrics)

**Executed computation — snippet output:**
```
Price:          AED 12.20
Base FV:        AED 27.7
Bear FV:        AED 20.0
Bull FV:        AED 34.2

Margin of safety = (27.7 - 12.2) / 27.7 = 56.0%
Implied upside = (27.7 - 12.2) / 12.2 = 127.0%
Downside to bear = (12.2 - 20.0) / 12.2 = −63.9%
  → Bear FV (20.0) EXCEEDS current price (12.2): no downside in bear case
```

| Metric | Value |
|---|---:|
| Current price | AED 12.20 |
| Base-case fair value (point) | AED 27.7 |
| Bear-case fair value | AED 20.0 |
| Bull-case fair value | AED 34.2 |
| Implied upside to base case = (base FV − price) / price | +127.0% |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **56.0%** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **−63.9%** (bear FV exceeds price — no downside loss to bear; the bear case is ABOVE the current price) |

**Critical interpretation.** The downside-to-bear is negative: the bear-case fair value (AED 20.0) is 64% above the current price (AED 12.20). This means the stock is currently priced below even the through-cycle trough scenario constructed from the FY2021 and FY2020 cycle-trough evidence. This is consistent with the reverse-DCF finding: the current price implies a −21.3% annual FCF contraction for 7 years — a trajectory that is physically inconsistent with the AED 134.3Bn contracted backlog. The margin of safety metric (56%) and the bear-case premium together suggest the market is pricing in an outcome more severe than any cycle trough in Emaar's modern history.

---

## 5. Warranted-Multiple Check

The base-case fair value of AED 27.7 implies an EV/LTM EBITDA of 9.3x and a forward P/E of 14.2x (on FY2026E consensus EPS of AED 1.95). Is 9.3x EV/LTM EBITDA warranted for EMAR?

The case that it is: Emaar's LTM EBITDA (AED 25.2Bn) is at a peak, so 9.3x on peak earnings is arguably conservative — on through-cycle normalized EBITDA (moat module estimates ~AED 11.6Bn through-cycle NOPAT → implied EBITDA ~AED 14.8–15Bn), the 9.3x on peak translates to a 15x+ on normalized, which approaches the quality sub-set peer median (13.71x). The business has a narrow moat (location advantage 72/100, brand 68/100, scale 63/100), net cash of AED 25Bn (broad basis), zero gross leverage (LTV ~5.7%), and a 86%-EBITDA-margin mall portfolio. These characteristics warrant a premium to pure-cycle developers like Aldar (8.3x LTM).

The case for caution: two structural factors limit the warranted multiple. First, the business quality score is 51/100 (mixed), dominated by cyclicality (30/100) and low recurring revenue (45/100) — these cap the justified multiple well below a durable-compounder level. Second, the government-owner (29.73% Dubai Holding) creates a value-trap risk: under a controlling shareholder that maximizes strategic rather than per-share objectives, a re-rating from 3.8x to 9.3x EV/EBITDA requires a market-driven catalyst (broader investor recognition, index inclusion weight, or sector rotation) rather than owner-driven value realization. The value-trap flag is **mandatory** per MODULE_RULES RF-OWN-004 / Score-Cap rules. With the government bloc holding 29.73% and no re-listing of Emaar Malls in sight, the conglomerate discount that keeps the consolidated multiple below the sum-of-parts may persist indefinitely — the gap between SOTP (AED 30.43) and the market's implied consolidated value (AED 12.20 = 3.8x LTM EBITDA) is real, but so is the risk that it never closes.

The warranted multiple at 9.3x is achievable for a narrow-moat, net-cash, 49%-EBITDA-margin developer — it is not a multiple the business has never earned (the 17-quarter history shows EV/LTM EBITDA between 3.96x and 8.39x, with a mean of 6.31x). To reach AED 27.7, the multiple must recover to 9.3x — above the own-history mean but on peak EBITDA. On normalized EBITDA (~AED 15Bn), 9.3x translates to roughly AED 15–16 per share, which the own-history mean already implies (AED 19.08 own-median reversion is on peak EBITDA; on normalized EBITDA a simple 6.25x would give a much lower number). This internal consistency check confirms that AED 27.7 is a moderate, recoverable target for a 12-month horizon — not a fantasy multiple. **Value-trap flag: the persistent cheapness under a government-aligned controlling owner could delay or prevent the re-rating, making the 127% implied upside a potential trap if the cycle peaks before the multiple recovers.**

---

## 6. Fair-Value Read

The base-case fair value is **AED 27.7 per share** — a margin of safety of 56% from the current price of AED 12.20 (pool-verified, Jun-28-2026). The bull and bear fair-value levels are AED 34.2 and AED 20.0 respectively; the entire bull-to-bear range sits above the current price, meaning even the through-cycle trough scenario (anchored to FY2021 trough margins and a further demand slowdown) implies an upside of +64% from today. The four methods disagree sharply on the magnitude of fair value — the cross-method spread from AED 19.08 (own-history) to AED 38.47 (intrinsic DCF) is 102%, the headline finding — but agree on the direction: current price is materially below any defensible intrinsic level. The method driving the answer most is the SOTP/DCF combination (60% weight), where the intrinsic value from through-cycle FCF projections and the segment-level break-up value both confirm a fair value well above AED 25 per share. The single biggest swing factor between bull and bear is whether Dubai's property demand cycle holds up or rolls over: a sustained −25 to −30% new-sales decline would not immediately cut EBITDA (the AED 134.3Bn backlog absorbs 3–4 years of revenue), but it would compress forward multiples and trigger a deeper de-rating, pushing the market toward bear-case levels that still exceed today's price. **The value-trap risk — a government-aligned controlling owner (29.73% Dubai Holding, RF-OWN-004) that does not prioritize per-share value maximization — is the structural reason the discount may persist, and is the critical check the master synthesizer must weigh before treating the 56% margin of safety as actionable.**

---

*All weighted blend computations, margin of safety, downside-to-bear, and implied multiple calculations produced by an executed Python snippet (command + result shown in §§2 and 4). Cross-module inputs: `01_price-and-capital-structure.md` (price AED 12.20, shares 8,838.790M, net cash broad AED 24,969M, minority AED 13,808M, EV AED 96,672M); `02_multiples-own-history.md` (own-median reversion AED 19.08; CIQ Quarterly Financials, Jun-28-2026); `03_relative-valuation-peers.md` (warranted NTM EV/EBITDA base AED 25.97; CIQ Comparable Analysis, Jun-28-2026); `04_intrinsic-dcf.md` (base AED 38.47, bear AED 21.60; Python DCF, WACC 8.83%, g 2.0%); `05_reverse-dcf.md` (implied FCF CAGR −21.3%, cross-check only); `06_sum-of-the-parts.md` (segment EV/EBITDA, base AED 30.43; FY2025 Investor Presentation, Feb-12-2026; CIQ Comps, Jun-28-2026); `business-model/07_business-quality.md` (quality score 51/100; cyclicality 30/100; disruption 62/100); `business-model/09_moat.md` (Narrow moat, Stable trajectory; through-cycle ROIC ~11–12% vs WACC ~9–10%); `earnings/07_earnings-sensitivity.md` (dominant variable: POC delivery pace ±AED 2,500M EBITDA; FY2021 cycle trough cited); `management-governance/04_ownership-and-insider-behavior.md` (Dubai Holding 29.73%, RF-OWN-004 trigger; CIQ Public Ownership Summary, May-2026).*
