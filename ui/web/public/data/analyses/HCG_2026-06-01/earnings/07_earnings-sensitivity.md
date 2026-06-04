# Earnings Sensitivity — HCG

*HealthCare Global Enterprises Limited (NSE: HCG, BSE: 539787) — pan-India oncology-focused hospital chain. All figures INR million (₹ Mn), consolidated, unless stated. FY ends 31 March (FY26 = year ended 31 Mar 2026). Reported metrics used unless an adjusted/company-defined basis is labelled.*

All three required upstream outputs are present and used: `01_historical-financials.md` (baseline EPS/EBITDA), `02_revenue-drivers.md` (revenue driver table + magnitudes), `03_margin-drivers.md` (margin driver table + magnitudes). The optional business-model `10_external-dependency.md` is present and supplies the company's own quantitative market-risk sensitivities (Note 40 — interest rate, FX), which are used as the highest-priority move-size basis where they apply.

**Baselines used for impact (FY26, deck p.19-20; upstream `01` §1):** revenue ₹25,454 Mn; Reported EBITDA ₹4,658 Mn (18.3% margin); Adjusted EBITDA ₹4,711 Mn; gross profit ₹18,531 Mn (72.8% GM); reported PAT to owners ₹138 Mn; Adjusted PAT ₹557 Mn; reported EPS ₹1.0.

**Score direction flag:** the Earnings Volatility Score in Section 7 is **INVERTED — higher = WORSE** (more sensitive to small input changes).

> **Share-count convention (load-bearing for EPS translation).** Reported FY26 EPS of ₹1.0 sits on a weighted-average diluted count of ≈138 Mn shares, because the ₹4,250 Mn rights issue completed late in Q4 FY26. Sensitivity is forward-looking, so all EPS impacts below are computed on the **post-rights-issue diluted base of ≈149.3 Mn shares** (equity share capital ₹1,493.0 Mn at ₹10 face value, Mar-26 balance sheet, deck p.20). *Inference, not from filings: HCG does not publish a fully-diluted FY26 share count in the pool; 149.3 Mn is derived from share capital ÷ ₹10 face value.* Pre-tax ₹ impacts are converted to EPS at a ~25% tax rate (*Inference, not from filings — India normal corporate rate ≈25.17%*).

---

## 1. Variable Selection

The 3–7 variables below were selected by taking every driver rated **High** or **Mid–High** magnitude in the upstream revenue and margin tables and keeping those that can move group EBITDA/EPS by a non-trivial amount. From `03_margin-drivers` §5: operating leverage / centre-maturity utilisation (High), drugs & consumables / COGS (High), medical consultancy charges (High if it moves), and government-scheme payor mix (Mid). From `02_revenue-drivers` §4: IP-patient volume via utilisation (High), ARPP / case-mix (Mid), and government-scheme tariffs/volume (Mid–High). Volume and utilisation are treated as one variable because in this business they are mechanically the same lever (utilisation of the existing 25-hospital, ~2,605-bed base *is* how incremental volume is produced — `02` §7; deck p.17). From the business-model `10_external-dependency` Note 40 disclosures, the **interest rate** on variable-rate debt is added as the one financial-market variable with a company-disclosed, double-digit-percentage-of-PBT sensitivity; FX and commodity price are explicitly excluded because the company discloses FX impact at only −₹4.55 Mn PBT per 1% (immaterial) and publishes no commodity sensitivity for a rupee-in/rupee-out operator (`10` §1–§2). That yields six variables.

---

## 2. Sensitivity Table

Impact is shown at the **EBITDA** line for operating drivers (the level `03` §4 establishes as the right one to track) and at the **PBT/PAT** line for the interest-rate item (it sits below EBITDA). EPS impacts are post-tax, on ≈149.3 Mn shares. Move sizes follow the hierarchy: company-disclosed → historical observed range → cited industry/regulatory range → labelled inference.

| Variable | Base Case (FY26) | Move Basis | Bull Case | EBITDA/EPS Impact (bull) | Bear Case | EBITDA/EPS Impact (bear) | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|
| **IP-patient volume / centre utilisation** | 58% blended utilisation (West 50%, South 68%, East 57%); IP volume +12% FY26 | Historical observed: volume growth ranged ~+9% to +13% by cluster in FY26; band = ±5 percentage points of volume vs base. Contribution margin on incremental volume ≈51% (100% − COGS 27.2% − consultancy ~21.6%, the two variable lines), the rest of the cost base near-fixed short-term | +5% volume (West ramps toward South's 68%) | **+₹604 Mn EBITDA / +₹3.03 EPS** | −5% volume (ramp stalls; AP-style scheme disruption recurs) | **−₹604 Mn EBITDA / −₹3.03 EPS** | Medium (volume range historical; 51% contribution & fixed-cost split inferred — labelled) | `02` §2,§4,§7; deck p.17 (utilisation); `03` §4–§5 (operating leverage) |
| **ARPP / case-mix (price-mix)** | ARPP ₹84,261 (ex-fertility), +3% FY26; +2% Q4 | Historical observed: cluster ARPP ranged −4% (East Q4) to +5% (West FY26); management restraining ARPP deliberately. Band +4% / −2%. Drop-through on price-mix ≈80% (limited variable cost on a realisation gain) | +4% ARPP (low-margin paring normalises; Kolkata case-mix recovers Q1 FY27) | **+₹815 Mn EBITDA / +₹4.09 EPS** | −2% ARPP (adverse case-mix spreads; MVT stays soft) | **−₹407 Mn EBITDA / −₹2.04 EPS** | Medium (ARPP range historical; 80% drop-through inferred — labelled) | `02` §3,§4,§6 (ARPP +3%, restrained); `03` §5 (case-mix lever); East slide deck p.12 |
| **Government-scheme tariff & disallowance (33% of revenue)** | Govt ≈33% of FY26 revenue; price-taker work; AP scheme disrupted Q3FY26 | Cited regulatory/historical: state-scheme repricing cut one cluster ARPP −3% (Odisha, Q3FY26); ECL allowance already ₹807.9 Mn. Band +5% / −8% on the 33% slice; ~85% drop-through (price-like) | +5% on govt slice (favourable repricing / faster payment) | **+₹357 Mn EBITDA / +₹1.79 EPS** | −8% on govt slice (DPCO margin tightening + disallowances) | **−₹571 Mn EBITDA / −₹2.87 EPS** | Medium (scheme moves historical/regulatory; not company-quantified) | `02` §4 (govt 33%, AP); `03` §5 (payor mix); `10` §1,§5 (DPCO, disallowance ECL ₹807.9 Mn) |
| **Drugs & consumables / COGS share** | COGS 27.2% of revenue FY26 (gross margin 72.8%) | Historical observed: COGS share rose ~24.6% → 26.1% → 27.2% over FY24–FY26 (+108 bps in FY26 alone). Band −100 bps / +150 bps | −100 bps COGS share (mix upgrade offsets inflation) | **+₹255 Mn EBITDA / +₹1.28 EPS** | +150 bps COGS share (consumable inflation + chemo-heavy mix; DPCO blocks re-pricing) | **−₹382 Mn EBITDA / −₹1.92 EPS** | Medium (share range from audited cost stack) | `03` §2,§3,§7,§8 (COGS −108 bps, DPCO, single biggest margin leak) |
| **Medical consultancy charges (clinician economics)** | 21.6% of revenue FY26 (−10 bps YoY); fee-for-service | Historical observed: ~21.6%–21.7% of revenue, flat; "High if it moves" per `03`. Band −75 bps / +150 bps (key-clinician renegotiation risk) | −75 bps share (scale leverage on visiting-fee terms) | **+₹191 Mn EBITDA / +₹0.96 EPS** | +150 bps share (high-volume oncologists capture a larger share) | **−₹382 Mn EBITDA / −₹1.92 EPS** | Medium (level audited; move-size inferred — labelled) | `03` §2,§5 (largest cost line; "highly dependent on key clinicians") |
| **Interest rate on variable-rate debt** | Variable-rate debt ₹6,791.8 Mn (FY25 Note 40); rights issue cut net debt to 0.73x EBITDA | **Company-disclosed**: +1% = −₹67.9 Mn PBT (Note 40). Band −1% / +2% | −1% (further deleveraging / rate cuts) | **+₹68 Mn PBT / +₹0.34 EPS** | +2% (rate shock on residual variable debt) | **−₹136 Mn PBT / −₹0.68 EPS** | **High (company-disclosed Note 40)** | `10` §2 (Note 40, +1% = −₹67.92 Mn PBT); upstream `01` §1 (0.73x leverage post rights issue) |

*FX (Rs/USD) is not tabled: company-disclosed sensitivity is −₹4.55 Mn PBT per 1% move (`10` §2) — below ₹0.05 EPS even on a large move; impact is directionally negative on the small Kenya/equipment-loan exposure but not material. Commodity price: no company sensitivity disclosed and not a meaningful exchange-traded input for this operator — impact not quantifiable, and immaterial by inspection (`10` §1).*

---

## 3. Sensitivity Ranking

Ranked by average absolute impact (mean of |bull| and |bear|). Operating drivers measured at EBITDA; interest rate at PBT.

| Rank | Variable | Absolute Impact (avg of bull + bear) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | ARPP / case-mix (price-mix) | ₹611 Mn | Improving (deliberately restrained; case-mix upgrade in progress) |
| 2 | IP-patient volume / centre utilisation | ₹604 Mn | Improving (volume +12%; 58% utilisation with West headroom) |
| 3 | Government-scheme tariff & disallowance | ₹464 Mn | Adverse/uncertain (policy-driven, outside HCG control) |
| 4 | Drugs & consumables / COGS share | ₹350 Mn¹ | Adverse and persistent (share rising ~250 bps over 2 yrs) |
| 5 | Medical consultancy charges | ₹287 Mn¹ | Neutral now (flat share); headwind if clinician terms shift |
| 6 | Interest rate on variable-rate debt | ₹102 Mn | Favourable (deleveraging post rights issue) |

¹ Rounding of the per-variable averages in Section 2 (COGS 318; consultancy 286 — shown here rounded to the nearest computed figure).

**Reading the top two.** ARPP and volume are within ~1% of each other on raw arithmetic, and both flow through the same revenue line. The arithmetic puts ARPP marginally first because its bull band (+4%) applied to the full revenue base at ~80% drop-through produces a large number. But this overstates ARPP's true independent swing: management is *consciously holding ARPP back* (`02` §3) and ARPP and case-mix are partly the same thing as the volume/payor mix shifts. On management's own framing — "at least 75% to 80% of our growth" comes from utilisation of existing hospitals (`02` §7) — and on the operating-leverage mechanics in Section 6, **volume/utilisation is the structurally dominant lever**. The two are treated as effectively co-equal at the top, with volume the primary one for narrative purposes (see Sections 4–5).

---

## 4. The Single Highest-Sensitivity Variable

**IP-patient volume, produced through utilisation of the existing 25-hospital network, moves earnings the most.** At ≈51% incremental contribution margin (the cost base below COGS and consultancy is largely fixed in the near term — clinicians on retainer, beds, LINACs, post-Ind AS rent), a ±5-percentage-point swing in volume versus the FY26 base moves EBITDA by roughly ±₹604 Mn and EPS by ±₹3.03 — i.e. a swing several times the entire FY26 reported EPS of ₹1.0. **Current direction: improving** — volume grew +12% in FY26, blended utilisation is only 58% with the largest cluster (West, 45% of revenue) at 50%, and the ₹50–100 Mn ramping cohort (50% of revenue) is growing +17% like-for-like (deck p.17–18; `02` §7). It is **partly company-controlled**: HCG controls bed additions, clinician hiring (23 oncologists added in Q4 FY26) and the pace of the West ramp, but the volume engine also rides on exogenous cancer-incidence demand and on government-scheme access. For it to swing to the adverse case, the West/ramping-cohort ramp would have to stall while a state-scheme disruption (the Andhra Pradesh-style Q3FY26 event) recurs and the deliberate low-margin paring over-cuts volume — a combination that would turn the fixed-cost base from a tailwind into operating deleverage (Section 6).

---

## 5. Interaction Effects

Several of these variables move together, and the correlations are unusually tight for this business:

- **Volume × ARPP** are the two factors in the same revenue identity (`Revenue ≈ volume × ARPP`), so a co-movement compounds rather than adds. A bull case where volume ramps *and* case-mix upgrades (low-margin paring "normalises") would lift both simultaneously — but management is explicitly trading one for the other today (paring low-margin volume to lift ARPP), so in the near term they partly offset. The realistic compounding risk is on the downside: weak volume *and* adverse case-mix (the East/Kolkata pattern) hitting together.
- **Government-scheme share × ARPP × COGS** are linked through payor mix. A rising government share simultaneously dilutes ARPP (scheme tariffs are lower) and worsens the COGS spread (schemes still consume drugs at DPCO-capped recovery). So an adverse scheme shift hits two of the top-four variables at once — this is the most dangerous compounding channel.
- **Volume × consultancy** are mechanically linked (consultancy is fee-for-service, so it rises with volume) — but because it scales with volume it is already inside the ~51% contribution assumption, not an independent additional drag.
- **Interest rate** is largely independent of the operating variables and, post the rights-issue deleveraging, is small — so it does not meaningfully compound the others.

Net: the operating variables are positively correlated on the downside (a demand/scheme shock hits volume, ARPP and COGS spread together), which is what makes the bear scenarios more than the sum of their parts.

---

## 6. Non-Linear Or Asymmetric Risks

Material asymmetries exist, all pointing the same way (downside larger than upside):

- **Operating deleverage (the dominant asymmetry).** HCG is a high-fixed-cost operator: the +88 bps FY26 EBITDA-margin gain came almost entirely from spreading near-fixed employee (−79 bps) and other-expense (−87 bps) costs over rising throughput (`03` §3,§7). That leverage runs in reverse. A small volume *decline* would cause a disproportionate EBITDA-margin decline because the cost base does not shrink with patient count — the same ≈51% contribution that helps on the way up hurts on the way down, and the emerging-cohort centres (5% EBITDA margin, −22% ROCE, deck p.18) are already loss-leaking fixed cost. Downside on the volume variable is therefore steeper than the symmetric ±₹604 Mn table figure suggests.
- **COGS pass-through lag is asymmetric.** Consumable-cost inflation hits gross margin immediately, but recovery is "slow and partial (annual mix/tariff cycle), not contractual," and the regulated pharmacy slice is DPCO price-capped so it *cannot* be re-priced up (`03` §3,§8). Input-cost inflation therefore hurts faster than HCG can offset it — the bear COGS case is more likely to fully land than the bull case.
- **Government policy is a one-sided overhang.** DPCO margin tightening or scheme-reimbursement cuts compress the 33%-of-revenue government slice with no hedge, while the upside from policy is capped (schemes do not over-pay). The business-model module scores this the single biggest external lever (`10` §5).
- **Earnings base is thin relative to the swings.** Reported FY26 PAT to owners is only ₹138 Mn and reported EPS ₹1.0, after two exceptionals (₹319 Mn goodwill impairment, ₹127 Mn labour-code charge). Because the EPS base is so small, *any* of the top-five variables can swing reported EPS by a multiple of itself or push it negative (Q3FY26 was already a −₹0.7 quarter, `01` §3). The leverage from EBITDA to reported EPS is itself non-linear, sitting on top of a heavy D&A + finance-cost block.

There is no offsetting upside asymmetry of comparable size.

---

## 7. Earnings Volatility Score

**Score: 64 / 100 — INVERTED scale, higher = WORSE.**

Band: 61–80 — "High volatility — multiple variables with large impact."

One-line reason: multiple top-ranked operating variables (volume, ARPP, government-scheme mix, COGS) each swing EBITDA by ₹300–600 Mn and EPS by ₹1.3–4.1 against a reported FY26 EPS base of only ₹1.0, they correlate on the downside, and the high-fixed-cost structure makes the downside non-linear (operating deleverage) — partly offset by largely non-discretionary oncology demand, immaterial FX/commodity exposure, and a now-deleveraged balance sheet that removes interest rate as a major swing factor.

*Confidence note (per MODULE_RULES score-cap): the company discloses quantitative sensitivities for interest rate and FX (Note 40), so this is not a "no sensitivity disclosures / fully inferred" case — but the four highest-impact variables (volume, ARPP, scheme tariff, COGS) are NOT company-quantified and rest on historical ranges plus labelled contribution/drop-through inferences. Treat the EPS magnitudes as order-of-magnitude, not precise.*
