# Intrinsic DCF — NHY (Norsk Hydro ASA, Oslo Børs: NHY)

Reporting standard: IFRS Accounting Standards as adopted by the EU. Reporting / trading currency: Norwegian krone (NOK million, except per-share figures in NOK). Fiscal year end: December 31 [Integrated Annual Report 2025, p.140]. All figures below are NOK unless stated otherwise. No cross-currency conversion is used anywhere in this report.

**Business-Type Gate.** `00_valuation-data-triage.md` and `business-model/02_business-identity.md` classify Norsk Hydro as an integrated **commodity / cyclical** operating company (bauxite → alumina → primary aluminium → recycling/extrusions, plus a captive power business), confirmed independently by `business-model/07_business-quality.md` (Commodity dependence score 12/100, Cyclicality score 15/100 — both inverted-low, i.e. very high dependence/cyclicality) and `business-model/10_external-dependency.md` (External Dependency Risk Score 74/100, inverted-high). Per `MODULE_RULES.md`'s Business-Type Method Map, this means an **FCFF DCF on a normalized mid-cycle FCF base** — never a single peak or trough year — which is the method used throughout this report (the Cyclicality Gate, §1 and §5 below).

**Moat-trajectory trigger (CLAUDE.md §24 Filter 5 / avoid-ruin).** `business-model/09_moat.md` verdict is **Narrow moat, trajectory eroding** — group return on capital sits only modestly above its cost-of-capital proxy through the cycle (13.3% 5-yr average Adjusted RoaCE vs a 10% target) and is at/below it on the latest year and unadjusted basis, and the moat's own downstream leg (Hydro Extrusions) is in documented structural decline (EBIT margin ~4% in 2020–2023 to −2.2% in 2025, five plants proposed for closure). This is **not** "No moat proven" (a moat is evidenced), so the terminal is not forced to zero excess return; but the "eroding" trajectory trips the second trigger, so §5 below carries **both** a standard Gordon-growth terminal (the base case) **and** a labelled declining-perpetuity / runoff terminal (the structural-impairment scenario, for `07`'s bear case and the master synthesizer's Kill Criteria — not a replacement for the base).

**Tax-rate reconciliation (Gate — canonical rate).** `business-model/09_moat.md` §3 explicitly states it "uses [Hydro's own standardized 30 percent] rate as the anchor for any normalized NOPAT read, for consistency with `valuation/04_intrinsic-dcf` where that module runs." This DCF uses that **same 30% standardized tax rate** throughout for NOPAT, matching the moat module's canonical figure — no divergence to reconcile. Hydro's own actual effective tax rate is far more volatile (24.3% in 2021 to 57.2% in 2023 to 39.5% in 2025) [Integrated Annual Report 2025, Note on adjusted net income; `09_moat.md` §3], which is why the company itself, and this report, use the standardized 30% rate for any normalized/adjusted earnings read instead.

---

## 1. FCF Base & Normalizations

Base year: **FY2025 (year ended 31-Dec-2025)**, audited, IFRS. Norsk Hydro's IFRS income statement uses a "nature of expense" format with no COGS/EBITDA subtotal; the CIQ vendor workbook's own EBITDA/EBIT reclassification for this company does **not** reconcile to the audited figures (a ~NOK 27bn gap flagged in `earnings/01_historical-financials.md`), so this report uses the company's own audited/disclosed EBITDA, EBIT and Adjusted-EBITDA/EBIT Alternative Performance Measures (APMs) throughout — never the CIQ Income-Statement-tab reclassification.

| Item | Base-Year Value (NOK mn) | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | 207,971 | None | [Integrated Annual Report 2025, p.140] |
| EBITDA — reported (audited) | 25,696 | — | [Integrated Annual Report 2025, p.36, "Other performance measures"] |
| EBITDA — **Adjusted (used as FCF-base anchor)** | 28,889 | +3,193: strips unrealized LME/power/raw-material derivative mark-to-market timing (+1,956), rationalization & closure costs (+1,795), impairment (equity-accounted investees, +444), transaction-related gains (−429), FX and other (−129) | [Integrated Annual Report 2025, p.36] |
| EBIT — reported (audited) | 14,401 | — | [Integrated Annual Report 2025, p.140] |
| EBIT — **Adjusted** | 18,663 | As above, plus PP&E/goodwill impairment (+1,069) | [Integrated Annual Report 2025, p.36] |
| CFO | 23,311 | None | [Financials.xls, Cash Flow tab] |
| Capex (cash-flow-statement, "Purchases of PP&E") | 11,582 | Module-standard FCF definition uses this narrower figure, not the company's broader Capex APM (NOK 12,097m, includes other long-term investments net of investment grants) | [Financials.xls, Cash Flow tab; `earnings/06_earnings-quality.md` §1 fn.3] |
| **FCF (module-standard: CFO − total capex)** | 11,729 | Lead figure, per CLAUDE.md §15 | [`earnings/01_historical-financials.md` §1] |
| Company's own "Free Cash Flow" APM | 13,034 | Nets derivative collateral and short-term-investment purchases/sales — a different, disclosed, non-standard definition, shown for completeness, not used as the DCF base | [Integrated Annual Report 2025, "Free cash flow" APM table, p.233; `earnings/06_earnings-quality.md` §1] |
| Effective tax rate (reported, actual) | 39.5% | Not used — volatile 24.3%–57.2% across FY2021–2025 | [Financials.xls, Income Statement tab] |
| **Normalized tax rate used for NOPAT (canonical, reconciled to `09_moat.md`)** | **30%** | Company's own standardized rate for tax-effecting adjusting items; adopted here to match the moat module's canonical normalized-NOPAT rate | [Integrated Annual Report 2025, Note on adjusted net income; `business-model/09_moat.md` §3] |

**Cyclicality normalization (Cyclicality Gate).** FY2025's Adjusted EBITDA margin (13.9%) is **not** used as a flat terminal assumption. It is benchmarked against:
- **Company's own prior-trough:** FY2023 Adjusted EBITDA margin of **11.5%** (22,258 / 193,619) — a genuine cyclical trough year in which group net-income margin collapsed to 1.85% and ROE to 2.6% [`business-model/07_business-quality.md`, Margin stability row].
- **A recent, explicitly non-run-rate peak:** Q1 2026 Adjusted EBITDA margin of **17.2%**, driven by a Middle East geopolitical supply shock (Strait of Hormuz closure, ~9% of global aluminium output curtailed) that both the margin-drivers and earnings-sensitivity modules flag as **not durable** [`earnings/03_margin-drivers.md` §8; `earnings/07_earnings-sensitivity.md` §4].
- **Peer-normal:** **not usable on a reconciled basis.** The peer comp set's EBITDA margins (Company Comparable Analysis workbook) are computed on CapIQ's standardized reclassification, the same reclassification flagged as unreliable for Hydro specifically (§ above) — comparing NHY's own audited-basis margin to peers' CIQ-standardized margin would not be apples-to-apples. Per the Cyclicality Gate's explicit fallback ("If no peer data is available... benchmark against the prior-trough and the company's own through-cycle history alone, and say so"), this report benchmarks against the prior-trough (11.5%) and FY2024/FY2025 actuals (12.9%/13.9%) only.

The forecast (§2) fades toward a **13.0% terminal Adjusted EBITDA margin** — above the FY2023 trough, below the FY2025 actual and well below the Q1'26 shock print — as the mid-cycle anchor.

---

## 2. Forecast Assumptions

5-year explicit forecast (FY2026–FY2030). Reasoning for stopping at 5 years: the model reaches its flat, mid-cycle "terminal" margin by Yr2 (13.0%) and holds it through Yr5 — extending the explicit window further would not add information, only more discounted repetitions of the same run-rate assumption.

| Assumption | FY2026 | FY2027 | FY2028 | FY2029 | FY2030 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---|
| Revenue (NOK mn) | 213,366 | 218,955 | 219,215 | 223,599 | 228,071 | +2.5%/yr | FY2026–28: Capital IQ consensus mean [`NorskHydroASAOBNHYEstimatesReport.xls`, Consensus tab, "Revenue," as of 2026-07-15]. FY2029–30: consensus coverage thins to 1–2 analysts by FY2029 (low-confidence tail) — **analyst assumption, not company-guided**: +2.0%/yr nominal off FY2028, roughly global aluminium demand growth + inflation |
| Adjusted EBITDA margin % | 14.0% | 13.0% | 13.0% | 13.0% | 13.0% | 13.0% | **Analyst assumption, not company-guided** — overrides Capital IQ consensus margin (17.0%/17.3%/16.3% for FY2026–28, `NorskHydroASAOBNHYEstimatesReport.xls` Consensus tab), which extrapolates the Q1 2026 geopolitical-shock margin (17.2%, flagged non-run-rate by `earnings/03_margin-drivers.md` §8) into the full-year numbers. FY2026 (14.0%) allows partial persistence of the H1 2026 tailwind before the guided Q2 2026 cost headwinds (energy +NOK 200–300mn, carbon +NOK 150–250mn q/q) bite [`earnings/04_guidance-consensus.md` §2]; FY2027 onward fades to the 13.0% mid-cycle anchor (§1) |
| Tax rate % (normalized, NOPAT) | 30% | 30% | 30% | 30% | 30% | 30% | Company's own standardized rate; canonical, reconciled to `business-model/09_moat.md` §3 |
| D&A (NOK mn) | 10,782 | 10,929 | 11,078 | 11,300 | 11,500 | ~11,500 | FY2026–28: Capital IQ consensus [`...Consensus.txt`, "Depreciation & Amortization" row]. FY2029–30: **analyst assumption** — extrapolated at the same ~NOK 150–200mn/yr pace, consistent with the guided capex step-up |
| Capex (NOK mn, absolute) | 13,500 | 15,000 | 15,000 | 15,000 | 15,000 | ~15,000 | **Company-guided** total capex, issued 2026-02-13, through FY2030 [`NorskHydroASAOBNHYEstimatesReport.xls`, Guidance tab]. Of this, guided maintenance capex is NOK 9,000mn (FY2026) then NOK 8,500mn (FY2027–30) — the balance (~NOK 4,500–6,500mn/yr) is a disclosed **growth-capex step-up** versus the FY2021–2025 average of ~NOK 10.9bn/yr |
| Capex (% of revenue) | 6.33% | 6.85% | 6.84% | 6.71% | 6.58% | ~6.6% | Derived from the two rows above |
| Δ Working capital driver | NWC = 13.18% of revenue (days-based) | | | | | 13.18% of revenue | **Revenue-linked, days-based** — DSO 33.0 days, DIO 76.8 days, DPO 53.2 days, all held at their FY2025 levels [`earnings/06_earnings-quality.md` §3]; COGS (Raw material & energy expense) held at 64.0% of revenue, its FY2025 ratio [`earnings/03_margin-drivers.md` Table B]. NWC% = DSO/365 + (COGS%)×(DIO−DPO)/365 = 33.0/365 + 0.64×(76.8−53.2)/365 = **13.1792%** of revenue. **Analyst assumption** (holding days flat) |

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.38% | Web: Norway 10-year government bond yield, 2026-07-10 [tradingeconomics.com] — indicative, unverified, dated |
| Equity-risk premium | 4.50% | Web: Damodaran implied US/mature-market ERP ≈4.23% (Jan-2026 data update), rounded to 4.5% as a small conservative buffer; Norway is Aaa/AAA-rated (equal to or better than the US), so mature-market ERP is applied directly with ~0 incremental country-risk premium — indicative, unverified, Norway-specific 2026 dataset not directly retrievable |
| Beta (levered) | 0.70 | Web: 5-year monthly beta, widely reported (Yahoo Finance and aggregators), accessed 2026-07-19 — indicative, unverified. **Flagged as a limitation:** this looks low for a commodity cyclical (cross-checked against `earnings/07_earnings-sensitivity.md`'s Earnings Volatility Score of 70/100, inverted-high, and `business-model/07_business-quality.md`'s Cyclicality score of 15/100, inverted-low) — this is the stated reason for the WACC override below |
| Cost of equity (CAPM) | 7.53% | `Ke = Rf + β×ERP = 4.38% + 0.70×4.50% = 7.53%` |
| Pre-tax cost of debt | 5.50% | Analyst estimate, not from filings — blends Hydro's disclosed fixed coupons (European Green Bond, EUR-denominated, 3.750%; Sustainability Linked Bond (NOK) 5.257% fixed; a second Sustainability Linked Bond at 3-month NIBOR+2.000% floating) against its sub-2x leverage target and low Net Debt/EBITDA (0.7x FY2025) [Financials.xls, Capital Structure Details tab]. Cross-check: FY2025 interest expense (NOK 2,357mn) ÷ total debt (NOK 33,754mn) implies ~6.98%, but this figure folds in lease-liability interest (leases sit inside Total Debt per `01`'s EV bridge) and is not used directly, as it likely overstates the funded-debt cost |
| Tax rate (for debt tax shield) | 30% | Same normalized/canonical rate as NOPAT (§1) |
| After-tax cost of debt | 3.85% | `Kd_at = 5.50%×(1−0.30) = 3.85%` |
| Equity weight (market value) | 83.18% | `we = E/(E+D) = 166,970 / (166,970+33,754)` [`01_price-and-capital-structure.md` §3–4] |
| Debt weight (market value, book proxy) | 16.82% | `wd = D/(E+D) = 33,754 / (166,970+33,754)` [same] |
| **WACC — computed** | **6.91%** | `WACC = we×Ke + wd×Kd_at = 0.8318×7.53% + 0.1682×3.85% = 6.264% + 0.648% = 6.91%` |
| **WACC — used (override)** | **7.50%** | See override note below |

**Formula (pinned):** `WACC = w_e·k_e + w_d·k_d·(1−t)` — no preferred equity outstanding [`01_price-and-capital-structure.md` §4], so no `w_p·k_p` term.

**WACC override (discipline per `MODULE_RULES.md` Gate 4).** Computed WACC is 6.91%; the WACC **used** in this DCF is **7.50%** — an override of **+0.59pp**, within the ±1.5pp tolerance. Justification (one sentence): the sourced beta (0.70) looks low for a business the earnings-sensitivity and business-quality modules independently score as highly cyclical and externally-driven, so WACC is nudged toward the midpoint of Hydro's own disclosed impairment-testing cost-of-capital range. **Cross-check against the moat module (Gate 4):** `business-model/09_moat.md` §3 reports Hydro's own disclosed pre-tax nominal WACC range of 9.25%–11.75% (used for goodwill/asset impairment testing), which converts to a post-tax range of **6.475%–8.225%** at the same 30% standardized tax rate. Both the computed (6.91%) and the used (7.50%) WACC sit comfortably inside this company-disclosed band — no divergence >2pp, so no dual-WACC grid is required (though the §7 sensitivity grid already spans 6.5%–8.5%, bracketing the full company-disclosed range).

---

## 4. Free Cash Flow Forecast & Discounting

Discounting convention: **mid-year** (t = 0.5, 1.5, 2.5, 3.5, 4.5) — cash flows are assumed to arrive evenly through each year, not in a lump at year-end, which is the more realistic assumption for a continuously-operating industrial producer.

| Year | Revenue | EBITDA (13–14% margin) | EBIT | NOPAT (30% tax) | Capex | ΔNWC | FCFF | Discount Factor (t, WACC 7.50%) | PV of FCFF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026 | 213,366 | 29,871 | 19,089 | 13,362 | 13,500 | 711 | 9,933 | 0.96449 (t=0.5) | 9,581 |
| FY2027 | 218,955 | 28,464 | 17,535 | 12,275 | 15,000 | 737 | 7,467 | 0.89720 (t=1.5) | 6,699 |
| FY2028 | 219,215 | 28,498 | 17,420 | 12,194 | 15,000 | 34 | 8,238 | 0.83460 (t=2.5) | 6,875 |
| FY2029 | 223,599 | 29,068 | 17,768 | 12,438 | 15,000 | 578 | 8,160 | 0.77637 (t=3.5) | 6,335 |
| FY2030 | 228,071 | 29,649 | 18,149 | 12,704 | 15,000 | 589 | 8,615 | 0.72221 (t=4.5) | 6,222 |

**FCFF identity used:** `FCFF = NOPAT + D&A − Capex − ΔNWC` (built from the income statement / balance sheet, not `CFO − capex`, because the forecast is built up from revenue/margin/capex/WC assumptions, not a projected cash-flow statement). **Working-capital sign check:** Hydro carries ordinary (positive) net working capital, not a negative-WC structure — revenue growth increases NWC (33.0-day receivables, 76.8-day inventory outweighing 53.2-day payables), which **consumes** cash, so ΔNWC is correctly **subtracted** every year above; there is no negative-WC cash-release dynamic to check for here.

**Sum of PV of explicit FCFs: NOK 35,712 million.**

Executed snippet (WACC blend, PV-of-FCF sum, terminal value, EV→equity→per-share bridge):

```
=== WACC BLEND ===
Ke = rf + beta*ERP = 0.0438 + 0.7*0.045 = 0.07530
Kd_pretax = 0.055, Kd_at = Kd_pretax*(1-tax) = 0.03850
we = E/(E+D) = 0.83184, wd = D/(E+D) = 0.16816
WACC_computed = we*ke + wd*kd_at = 0.83184*0.07530 + 0.16816*0.03850 = 0.06911
WACC_used (override) = 0.07500

=== DISCOUNTING (mid-year convention, WACC_used) ===
Year 1 (2026): FCFF=9933, t=0.5, DF=1/(1+0.075)^0.5=0.96449, PV=9581
Year 2 (2027): FCFF=7467, t=1.5, DF=1/(1+0.075)^1.5=0.89720, PV=6699
Year 3 (2028): FCFF=8238, t=2.5, DF=1/(1+0.075)^2.5=0.83460, PV=6875
Year 4 (2029): FCFF=8160, t=3.5, DF=1/(1+0.075)^3.5=0.77637, PV=6335
Year 5 (2030): FCFF=8615, t=4.5, DF=1/(1+0.075)^4.5=0.72221, PV=6222
Sum PV explicit FCFs = 35712

=== TERMINAL VALUE (Gordon growth) ===
FCFF_Yr5 = 8615, g = 0.025, WACC = 0.075
TV = FCFF5*(1+g)/(WACC-g) = 8615*1.025/(0.075-0.025) = 176609
Discounted at Yr5 mid-year factor (t=4.5, same as last explicit CF) = 0.72221
PV of TV = 127549

Enterprise Value = PV(explicit) + PV(TV) = 35712 + 127549 = 163261
TV as % of EV = 78.1%

=== EV -> EQUITY -> PER SHARE ===
EV = 163261
- Net debt (canonical, cash-quality adj.) = 17919.0
- Minority interest = 7495.0
- Preferred = 0.0
= Equity value = 137847
/ Shares = 1965.28
= Per-share intrinsic value (base) = 70.14
vs current price 84.96 -> below by -17.4%

=== FINANCEABLE GROWTH CROSS-CHECK (Gate 2) ===
Yr3 reinvestment rate = (capex-D&A+dNWC)/NOPAT = (15000-11078+34)/12194 = 32.4%
Implied growth = ROIC(9%) * reinvestment rate = 2.92%
Modeled terminal g = 2.5% -> gap = 0.42pp (within ~1.5pp tolerance: YES)

=== EXIT MULTIPLE CROSS-CHECK ===
Terminal (Yr5) EBITDA = 29649
Implied exit multiple = TV/Terminal EBITDA = 176609/29649 = 5.96x
Peer NTM EV/EBITDA range (Company Comparable Analysis workbook, Trading Multiples tab, as of 2026-07-18): 3.53x-11.46x,
peer mean (ex-NHY, ex-blank) ~6.71x; NHY's own current NTM EV/EBITDA = 5.13x

=== DECLINING-PERPETUITY / RUNOFF TERMINAL ===
Runoff terminal EBITDA margin = 9.0% (below FY2023 cyclical trough of 11.5%)
Runoff EBITDA = 228071*0.09 = 20526
Runoff EBIT = 20526-11500 = 9026
Runoff NOPAT = 9026*(1-0.3) = 6318
Runoff FCFF = NOPAT+D&A-Capex(maintenance only)-dNWC = 6318+11500-8500-0 = 9318
Runoff g (nominal, below inflation, trending negative) = -1.0%
Runoff TV = FCFF*(1+g)/(WACC-g) = 9318*0.99/(0.075-(-0.01)) = 108533
PV of runoff TV = 78383
Runoff EV = PV(explicit, SAME as base) + PV(runoff TV) = 35712+78383 = 114095
Runoff equity value = 114095-17919.0-7495.0 = 88681
Runoff per-share = 45.12

=== SENSITIVITY GRID (per-share) ===
WACC columns: [6.5, 7.5, 8.5]
g=3.0%: [102.81, 77.7, 61.73]
g=2.5%: [90.25, 70.14, 56.74]
g=2.0%: [80.48, 63.95, 52.51]
```

(Script: Python 3, executed via Bash — `we`, `wd` from `01_price-and-capital-structure.md` §3–4; `net_debt`=17,919 and `minority`=7,495 from the same file's canonical, cash-quality-adjusted anchor; `shares`=1,965.28mn from the same file's Anchor Block.)

---

## 5. Terminal Value

**Method: Gordon growth perpetuity (base case).**

`TV = FCFF_{n+1} / (WACC − g) = FCFF_5 × (1+g) / (WACC − g)`, where `FCFF_5` = NOK 8,615mn (FY2030, the last explicit-forecast year) and `g` = 2.5% nominal (**analyst assumption, not company-guided** — roughly Norway's inflation target and a reasonable long-run nominal growth proxy for a mature, globally-traded commodity).

`TV = 8,615 × 1.025 / (0.075 − 0.025) = 8,830 / 0.050 = NOK 176,609 million` (undiscounted, as of end-FY2030).

`WACC − g` = 7.50% − 2.50% = **5.0pp**, comfortably positive — well clear of the near-zero-denominator danger zone. In the §7 sensitivity grid, the widest g (3.0%) against the lowest WACC (6.5%) still leaves a 3.5pp gap — no grid cell approaches `WACC − g ≤ 0`, so no cell is marked NM.

- **Terminal value (undiscounted): NOK 176,609 million.**
- **PV of terminal value (discounted at the Yr5 mid-year factor, t=4.5, per the stated convention): NOK 127,549 million.**
- **Terminal value as % of total EV: 78.1%.** This **exceeds the 75% threshold** — the DCF is **terminal-dominated and low-confidence** per `MODULE_RULES.md`'s Reconciliation/Score-Cap rules (valuation confidence capped at 60 downstream). Per Gate 5, a second lens is required and provided below.

**Exit-multiple cross-check (Gate 5, required because TV > 75% of EV).** The Gordon-growth TV implies an exit multiple of `TV / Terminal EBITDA = 176,609 / 29,649 = 5.96x` EV/EBITDA. This sits below the peer mean NTM EV/EBITDA (~6.71x, across Anglo American, Boliden, Shandong Hongqiao, Grupa Kęty, Antofagasta, Constellium, Hindalco, Chalco — Company Comparable Analysis workbook, Trading Multiples tab, as of 2026-07-18) and modestly above Hydro's own current NTM EV/EBITDA (5.13x, same source). An implied terminal multiple below the peer average and only slightly above Hydro's own current multiple is a sane, non-aggressive terminal assumption — it does not require Hydro to re-rate to a premium multiple to justify the terminal value.

**Structural-decline / runoff terminal (moat-trajectory trigger, avoid-ruin Filter 5).** Because `business-model/09_moat.md` reports the moat trajectory as **eroding** (not merely "unproven"), a second, labelled terminal is built alongside the base case — the structural-impairment scenario, not a replacement for §6's headline:

- Terminal EBITDA margin faded to **9.0%** — below the FY2023 cyclical trough (11.5%), reflecting a *structural*, not merely cyclical, impairment: continued Extrusions decline, and the upstream cost-curve advantage eroding as Chinese/Gulf capacity expands (flagged as "a live possibility, not a tail risk" by `business-model/07_business-quality.md`'s Competitive intensity row).
- Capex cut to **maintenance-only** (NOK 8,500mn/yr, the guided FY2027–30 maintenance figure) — a declining business does not keep funding growth capex.
- **`g` = −1.0% nominal** — below Norway's ~2.5% inflation target and trending negative, i.e. genuine real AND nominal decline, on the same nominal basis as the rest of this DCF (not a real-rate substitution).
- `TV_runoff = 9,318 × 0.99 / (0.075 − (−0.01)) = 9,225 / 0.085 = NOK 108,533 million` (undiscounted); PV = NOK 78,383 million.
- Resulting **runoff intrinsic value: NOK 45.12/share** (§4 snippet) — a ~36% haircut to the base-case NOK 70.14/share. This is the structural-reset bear input for `07_scenario-and-fair-value` and the master synthesizer's Kill Criteria; it is **not** this module's headline base case.

---

## 6. DCF Output

| Step | Value (NOK mn, unless per-share) |
|---|---:|
| PV of explicit FCFs | 35,712 |
| + PV of terminal value (Gordon, base case) | 127,549 |
| **= Enterprise value** | **163,261** |
| − Net debt (canonical, cash-quality adjusted, `01`) | 17,919 |
| − Minority interest (`01`) | 7,495 |
| − Preferred | 0 |
| **= Equity value** | **137,847** |
| ÷ Diluted shares (`01` anchor, ≈basic; no material dilution) | 1,965.28 million |
| **= Intrinsic value per share (base case)** | **NOK 70.14** |
| vs current price (NOK 84.96, 2026-07-17, `01`) | **−17.4%** (DCF base sits below the traded price) |
| Memo: runoff / structural-decline terminal, per-share | NOK 45.12 (−46.9% vs price) |

---

## 7. Sensitivity Grid (per-share intrinsic value, base-case Gordon terminal)

WACC across columns, terminal growth down rows. No cell approaches `WACC − g ≤ 0` (minimum gap in this grid is 3.5pp, at WACC 6.5% / g 3.0%), so all nine cells are valid.

| | WACC 6.5% | WACC 7.5% (used) | WACC 8.5% |
|---|---:|---:|---:|
| g = 3.0% | NOK 102.81 | NOK 77.70 | NOK 61.73 |
| g = 2.5% (base) | NOK 90.25 | **NOK 70.14** | NOK 56.74 |
| g = 2.0% | NOK 80.48 | NOK 63.95 | NOK 52.51 |

Range across the full grid: **NOK 52.51 – NOK 102.81**, a wide spread reflecting the terminal-value dominance (78.1% of EV) flagged in §5 — small changes in WACC or `g` move the answer a great deal. The current price (NOK 84.96) sits inside the upper portion of this grid (above the base-case NOK 70.14, below only the two lowest-WACC/highest-g corner cells), which is consistent with the market pricing in either a lower discount rate than this report's 7.50%, a higher terminal growth rate, or a terminal margin closer to the elevated (Middle-East-shock-driven) recent print than the 13.0% mid-cycle anchor used here.

---

## 8. Intrinsic Read

The base-case DCF intrinsic value is **NOK 70.14 per share** — about 17% below the current NOK 84.96 price (2026-07-17) — built on a mid-cycle 13.0% Adjusted EBITDA margin (between the FY2023 trough of 11.5% and the FY2025 actual of 13.9%, deliberately below the Q1 2026 geopolitical-shock print of 17.2% that both the margin-drivers and guidance-consensus modules flag as not durable) and a 7.50% WACC that sits inside Hydro's own disclosed impairment-testing cost-of-capital band. The sensitivity grid shows how fragile that point is, not a second answer: across a ±1pp WACC and ±0.5pp terminal-growth range the value swings from NOK 52.51 to NOK 102.81 — a function of the terminal value being 78.1% of total enterprise value (terminal-dominated, per §5) in a company whose own moat is eroding at the segment level (Extrusions) even as the upstream chain still earns above its cost of capital. The single assumption this value is most sensitive to is the **terminal Adjusted EBITDA margin / WACC pairing**: if the market is instead pricing something closer to the currently-elevated, shock-driven margin persisting (consensus's own FY2026–28 estimates imply 16–17% margins, not this report's 13%), that alone would largely close the gap to the current price — making the read a bet on whether the Middle East supply-shock aluminium price premium is durable, which the earnings-sensitivity module's own ranking (§4 of that report) says is the single largest, least-controllable lever on this company's earnings.
