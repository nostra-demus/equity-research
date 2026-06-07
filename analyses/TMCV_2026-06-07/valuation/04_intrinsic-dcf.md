# Intrinsic DCF — TMCV (Tata Motors Limited, formerly TML Commercial Vehicles Limited)

**Reporting regime:** India / SEBI-LODR. Reporting standard: Ind AS. Currency: INR (₹ crores). Fiscal year ends March 31. FY26 (year ended March 31, 2026) is the first full audited fiscal year for this entity on a standalone consolidated basis. All per-share values use 3,681.72 million shares (SEBI LODR Balance Sheet, March 31, 2026) per `01_price-and-capital-structure` anchor.

**Business-type gate:** TMCV is an operating commercial vehicle manufacturer. FCFF DCF with an EV-to-equity bridge applies per the Business-Type Method Map in MODULE_RULES.md. No financial or REIT method is appropriate.

**Cyclicality gate:** `10_external-dependency.md` confirms the business is cyclical — management itself uses the word ("CV business is very cyclical in nature," FQ4 2026 transcript, May 13, 2026). The FCF base and forecast margins use a normalized mid-cycle assumption, not FY26 peak-year figures. The normalization is itemized in Section 1.

**Iveco caveat (material, non-modelled):** The company announced a voluntary tender offer for Iveco Group N.V. at approximately ₹41,691 cr (EUR 3.8 billion), targeted to close Q2 FY27. This transaction is not in the FY26 balance sheet, the financing structure is unresolved (bridge loan), and Iveco's margin profile is not available in the data pool. This DCF is built on a **standalone TMCV basis only**. If the Iveco deal closes, (a) net debt will increase by approximately ₹33,000–42,000 cr (depending on deal structure), which will substantially reduce equity value per share, and (b) Iveco EBITDA contribution would partially offset the interest burden. The net per-share impact cannot be modelled with Medium confidence or better from available data. This is the single most material unmodelled event. Per `04_guidance-consensus.md` and `03_margin-drivers.md`, Iveco financing cost alone could reduce normalized EPS by approximately ₹2.52 per share in a bear scenario.

---

## 1. FCF Base & Normalizations

**Base year: FY26 (year ended March 31, 2026)**. Currency: INR crores. Reporting standard: Ind AS.

The FCFF identity used throughout: **FCFF = NOPAT + D&A − Capex − ΔWC** where NOPAT = Underlying EBIT × (1 − tax rate). This definition is used because (a) a full cash flow statement is available and cross-checks the calculation, and (b) Underlying EBIT strips the non-cash FVTPL fair-value loss (₹2,418 cr) that distorts reported EBIT, consistent with the earnings quality module's guidance. The definition is held constant throughout the forecast.

Cross-check: CFO ₹14,981 cr − Capex ₹2,248 cr = ₹12,733 cr (direct FCF = CFO minus total capex method). The NOPAT + D&A − Capex − ΔWC computation below produces ₹12,502 cr, with the ₹231 cr gap explained by tax and interest cash flows in the actual CFO vs the NOPAT approximation. Both methods confirm the FCF order of magnitude.

| Item | Base-Year Value (FY26) | Normalization Applied | Source |
|---|---:|---|---|
| Revenue from operations | ₹83,855 cr | No normalization — used as stated | SEBI LODR Consolidated Audited Results, year ended Mar 31, 2026, filed May 13, 2026, Line I |
| Underlying EBIT | ₹8,538 cr (10.2% margin) | Used as stated for base check; but see cyclicality normalization below — the **forecast** uses a normalized mid-cycle EBIT margin of 10.0%–11.0%, not the FY26 peak margin, per the cyclicality gate | FY26 Integrated Annual Report (Ind AS), MD&A, p.215 |
| Depreciation and amortisation (D&A) | ₹1,945 cr (2.3% of revenue) | No normalization | SEBI LODR results filing, May 13, 2026, Income Statement |
| Gross capex (PPE + intangibles) | ₹2,248 cr (2.7% of revenue) | No normalization; within management-guided 2–4% range | SEBI LODR results filing, May 13, 2026, Cash Flow Statement |
| Working capital change (FY26) | +₹6,657 cr (cash inflow) | **Normalized to +₹400 cr/year favorable** — the FY26 figure was exceptional: ₹4,088 cr of the ₹6,657 cr inflow came from contract liabilities / customer advances (deferred revenue that unwinds as deliveries occur). The underlying negative-CCC model provides a recurring but smaller benefit. The normalized level is based on the FY25 (9M) figure of ₹1,838 cr and the structural CCC of approximately −54 days; at 5% revenue growth, the structural WC benefit per year is approximately ₹300–500 cr. ₹400 cr is used as the conservative mid-point. Label: **analyst assumption, not company-guided**. | SEBI LODR Cash Flow Statement, May 13, 2026; FY26 Integrated Annual Report (Ind AS), Working Capital disclosures |
| Normalized tax rate | 28% | The reported FY26 effective rate was approximately 50%, distorted by the non-deductible FVTPL fair-value loss (₹2,418 cr on a subsidiary's equity investments). The normalized 28% is used throughout, consistent with `07_earnings-sensitivity.md` and the Ind AS statutory rate band | SEBI LODR results filing, May 13, 2026, Note 9 (tax); `07_earnings-sensitivity.md`, tax rate note |
| Cyclicality — EBIT margin normalization | FY26 Underlying EBIT margin = 10.2% (first time crossing double digits per management) | **FY26 is at or near a cyclical high.** The three-year observed range is 5.5% (FY23 carve-out) to 10.2% (FY26 actual). Mid-cycle is approximately 8%–9% on an unsmoothed basis, but the structural cost improvements (VAVE, scale, mix) are real and partly permanent. A mid-cycle normalized EBIT margin of **10.0%** is used for Year 1, converging to **11.0%** by Year 5 — below the CFO's stated margin expansion from 13.2% EBITDA (≈10.7% EBIT equivalent) as a peak scenario, but above the raw historical midpoint. Label: **analyst assumption, not company-guided, conservatively calibrated to the cyclicality gate.** | `10_external-dependency.md` cyclicality gate; `03_margin-drivers.md`, Section 8; FQ4 2026 Earnings Call, May 13, 2026 |

**Base-year FCFF (FY26, for reference):**
- NOPAT = ₹8,538 × (1 − 0.28) = ₹6,148 cr
- + D&A = ₹1,945 cr
- − Capex = ₹2,248 cr
- − ΔWC (normalized, positive = cash outflow, negative = inflow): −₹400 cr (source)
- **FCFF (normalized base) ≈ ₹6,245 cr**

Note: The base-year normalized FCFF of ₹6,245 cr is substantially below the reported FCF (CFO − capex = ₹12,733 cr) because the reported figure includes the ₹6,657 cr exceptional working capital inflow. The normalized base is the correct starting point for forecasting. The difference is flagged as a one-off that reduces the forward run-rate.

---

## 2. Forecast Assumptions

This DCF models TMCV **on a standalone basis**, excluding any Iveco consolidation. The Iveco transaction, if it closes, would require a complete re-run of the model. All Iveco-related items are noted in the Iveco caveat header and the sensitivity grid footnotes.

Explicit forecast period: 7 years (FY27–FY33). Terminal value applied at end of FY33. Revenue base = FY26 actual ₹83,855 cr.

| Assumption | FY27 (Yr1) | FY28 (Yr2) | FY29 (Yr3) | FY30 (Yr4) | FY31 (Yr5) | FY32 (Yr6) | FY33 (Yr7) | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 5.0% | 7.0% | 6.0% | 6.0% | 5.0% | 5.0% | 5.0% | — | Yr1: street consensus FY27 = +5.1% (`04_guidance-consensus.md`); management "single-digit growth if not more" (FQ4 2026 transcript, May 13, 2026). Yr2: Indonesia 70,000-unit order delivering, recovery from H1 FY27 softness; **analyst assumption**. Yr3–5: mid-cycle India CV industry growth roughly in line with nominal GDP; **analyst assumption, peer-derived from India CV CAGR history**. Yr6–7: normalizing to long-run nominal growth; **analyst assumption**. |
| Revenue (₹ cr) | 88,048 | 94,211 | 99,864 | 105,856 | 111,149 | 116,706 | 122,541 | — | Computed |
| EBIT margin % | 10.0% | 10.2% | 10.5% | 10.8% | 11.0% | 11.0% | 11.0% | 11.0% | FY27: below FY26 10.2% — commodity headwinds confirmed "significantly higher" in Q1 FY27 (FQ4 2026 transcript); 2% price increase partially offsets. FY28–31: gradual structural recovery as VAVE and non-cyclical mix compound; consistent with management's stated "teens" EBITDA guidance (≈11%+ EBIT equivalent). Terminal: at 11.0%, EBIT is at the low end of management-implied ambition but appropriate for a cyclical mid-cycle anchor. Label: **analyst assumption; partially company-guided (management "teens" EBITDA ≈ 11–12% EBIT) for FY27, analyst assumption thereafter.** |
| Tax rate % | 28% | 28% | 28% | 28% | 28% | 28% | 28% | 28% | Normalized statutory rate. Reported FY26 rate (~50%) excluded as non-representative. `07_earnings-sensitivity.md`, tax rate note; **analyst assumption** consistent with Ind AS statutory rate band. |
| Capex (% of revenue) | 3.0% | 3.0% | 3.0% | 3.0% | 3.0% | 3.0% | 3.0% | 3.0% | Midpoint of management-guided FY27 range "2%–4% of revenue"; FY26 actual = 2.7%; 3% is conservative (company-guided range, midpoint). FQ4 2026 transcript, Q&A (G.V. Ramanan: "guidance would remain similar, 2% to 4% of revenue"). |
| D&A (% of prior-year revenue) | 2.3% | 2.3% | 2.3% | 2.3% | 2.3% | 2.3% | 2.3% | 2.3% | FY26 actual D&A / revenue = 2.3%; stable assumption as new capex partially replaces expiring D&A. `01_historical-financials.md`, Note D; **analyst assumption**. |
| ΔWC (₹ cr, negative = cash inflow) | −400 | −400 | −400 | −400 | −400 | −400 | −400 | — | Normalized; see Section 1 normalization. Structural negative-CCC model provides recurring WC benefit. FY26 ₹6,657 cr exceptional inflow excluded. **Analyst assumption, not company-guided.** |

**Revenue growth check:** The FY27–FY33 compound growth rate from the table above = [(122,541 / 83,855)^(1/7) − 1] = [1.4614^(1/7) − 1] = 5.6% CAGR. This is consistent with management guidance of "single-digit" near-term and the analyst consensus view of India CV growing broadly with nominal GDP. No exceptional forecast.

**ROIC / reinvestment consistency check (MODULE_RULES.md Economic Consistency Gate):**
- Terminal NOPAT (FY33): ₹122,541 × 11.0% × 0.72 = ₹9,705 cr
- Net reinvestment = Capex − D&A + ΔWC use = ₹3,676 − ₹2,684 + (₹400 inflow treated as −₹400) = ₹592 cr
- Reinvestment rate = ₹592 / ₹9,705 = 6.1%
- Auto ROCE (management-disclosed FY26) = 72.3%; sustainable long-run ROIC inference: management-disclosed ROCE is distorted by negative working capital and low capex base. A more conservative sustainable ROIC of 25–30% is used for the cross-check.
- Implied growth = 25% ROIC × 6.1% reinvestment = 1.5% — below the terminal g of 5.5%.
- **Gap finding:** The model implies that a significant portion of terminal growth comes from factors other than capital reinvestment — primarily revenue scaling without proportional capital (pricing, mix improvement, noncyclical growth). This is defensible given TMCV's negative-CCC model (growth is partially self-funding), but it means the terminal g is high relative to the reinvestment rate. At 30% ROIC: 30% × 6.1% = 1.8% implied growth. The 5.5% terminal g embeds approximately 3.7 percentage points of growth not explained by the reinvestment rate — this is flagged as an **optimistic assumption in the terminal value** that is partially justified by the negative-CCC model and the non-cyclical services layer, but partially represents model risk. Per MODULE_RULES.md: label this persistence as an inference.

---

## 3. Discount Rate (WACC)

All inputs for WACC are for an INR-denominated discount rate applied to INR cash flows. No FX conversion is needed.

| Component | Value | Source |
|---|---:|---|
| Risk-free rate (India 10-year G-Sec yield) | 6.95% | India 10-year government bond yield as of June 5, 2026 = 6.95%, reflecting a 6 bps decline on the session as foreign investor tax exemptions on G-Sec interest were announced. **Web-sourced from TradingEconomics.com / Investing.com, June 2026; indicative, unverified.** |
| Equity risk premium (ERP) — India | 7.08% | Damodaran Country Risk Premium dataset, January 2026; India rated Baa3 (Moody's); total ERP = mature market ERP + country risk premium = 7.08%. **Web-sourced from NYU Stern pages.stern.nyu.edu/~adamodar/, January 2026; indicative, unverified.** |
| Beta | 1.59 | TMCV 5-year or listed-history beta as sourced from Tickertape / market data, June 2026. TMCV listed in November 2025; the beta likely reflects a short listed history and may be noisy. The CV auto sector beta for India (comparable to Ashok Leyland) is broadly 1.3–1.7 per market data. 1.59 is consistent with the cyclical nature of the business (earnings volatility score 62/100). **Web-sourced from Tickertape.in, June 2026; indicative, unverified.** Confirm with Capital IQ beta when available. |
| Cost of equity | 18.21% | 6.95% + 1.59 × 7.08% = 6.95% + 11.26% = 18.21% |
| Pre-tax cost of debt | 8.0% | Analyst assumption — TMCV is effectively debt-free (net cash position); marginal borrowing rate for an India-domiciled BBB-equivalent credit is approximately 8–9% (consistent with current Indian 10-year G-Sec + ~100–150 bps credit spread for investment-grade industrial). **Analyst assumption, not company-disclosed.** Actual FY26 finance costs of ₹874 cr on average debt of approximately ₹7,000 cr (average of start/end) implies ~12.5% historical rate — which reflects higher rates when debt was larger; the current marginal rate on minimal debt is lower. 8% used as forward marginal rate. |
| Tax rate (for interest tax shield) | 28% | As per Section 1 normalization |
| After-tax cost of debt | 5.76% | 8.0% × (1 − 0.28) |
| Capital weights (market-value basis) | Equity 96.0%, Debt 4.0% | Market cap ₹1,35,933 cr; Total debt ₹5,615 cr; Total capital = ₹1,41,548 cr. `01_price-and-capital-structure`, Section 4 EV bridge. |
| **WACC** | **17.71%** | 0.96 × 18.21% + 0.04 × 5.76% = 17.48% + 0.23% = 17.71% |

**WACC sanity check (MODULE_RULES.md §Economic Consistency Gates):**
- Risk-free rate dated and labeled: ✓
- ERP dated and labeled: ✓
- After-tax cost of debt (5.76%) is positive and above 0%: ✓
- Terminal g (5.5%) vs long-run India nominal GDP growth proxy (~7–8% nominal): 5.5% is below the nominal GDP growth rate — appropriate for a mature cyclical business at mid-cycle. ✓
- WACC of 17.71% for an Indian cyclical auto OEM is at the high end but within sanity range given India ERP, the high beta, and the cyclicality of earnings. A range of 16%–20% for Indian cyclical industrials is plausible.

---

## 4. Free Cash Flow Forecast & Discounting

WACC = 17.71%. Year-end discounting convention.

FCFF formula per year: NOPAT + D&A − Capex + WC benefit (₹400 cr, treated as a positive addition to FCFF).
- NOPAT = EBIT × (1 − 0.28)
- D&A = 2.3% × prior-year revenue
- Capex = 3.0% × current-year revenue
- WC benefit = ₹400 cr (constant, normalized)

| Year | Revenue (₹ cr) | EBIT (₹ cr) | NOPAT (₹ cr) | D&A (₹ cr) | Capex (₹ cr) | WC Benefit (₹ cr) | FCFF (₹ cr) | Discount Factor | PV of FCFF (₹ cr) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY27 (Yr1) | 88,048 | 8,805 | 6,340 | 1,929 | 2,641 | 400 | 6,028 | 0.8495 | 5,121 |
| FY28 (Yr2) | 94,211 | 9,609 | 6,919 | 2,025 | 2,826 | 400 | 6,518 | 0.7217 | 4,703 |
| FY29 (Yr3) | 99,864 | 10,486 | 7,550 | 2,167 | 2,996 | 400 | 7,121 | 0.6131 | 4,367 |
| FY30 (Yr4) | 105,856 | 11,432 | 8,231 | 2,297 | 3,176 | 400 | 7,752 | 0.5209 | 4,039 |
| FY31 (Yr5) | 111,149 | 12,226 | 8,803 | 2,435 | 3,334 | 400 | 8,304 | 0.4425 | 3,675 |
| FY32 (Yr6) | 116,706 | 12,838 | 9,243 | 2,556 | 3,501 | 400 | 8,698 | 0.3759 | 3,269 |
| FY33 (Yr7) | 122,541 | 13,479 | 9,705 | 2,684 | 3,676 | 400 | 9,113 | 0.3193 | 2,909 |

*Discount factor formula: 1 / (1 + WACC)^n where n = 1 through 7 and WACC = 17.71%.*

**Sum of PV of explicit FCFs: ₹28,083 crores**

---

## 5. Terminal Value

- **Method:** Gordon Growth Model (perpetuity growth)
- **Terminal FCF base:** FY33 FCFF = ₹9,113 cr
- **Terminal growth rate (g):** 5.5% — analyst assumption; calibrated to approximately 70–75% of India's long-run nominal GDP growth proxy (~7–8% nominal), appropriate for a mature cyclical OEM that grows broadly with the freight/industrial cycle but not faster than the overall economy. This is below India's nominal GDP growth rate ✓ (passes MODULE_RULES.md gate).
- **Terminal FCF = ₹9,113 × (1 + 0.055) = ₹9,614 cr**
- **Terminal value (undiscounted) = ₹9,614 / (0.1771 − 0.055) = ₹9,614 / 0.1221 = ₹78,739 cr**
- **PV of terminal value = ₹78,739 × 0.3193 = ₹25,143 cr**
- **Terminal value as % of total DCF EV: ₹25,143 / (₹28,083 + ₹25,143) = 47.2%**

Terminal value is 47.2% of total EV — **not terminal-dominated** (well below the 75% flag threshold). The explicit forecast period carries 52.8% of total value. This reflects the relatively high WACC, which discounts terminal cash flows heavily. Confidence in the terminal value is therefore moderate.

**Exit-multiple cross-check (required by MODULE_RULES.md §Terminal Dominance escalation — not triggered here as TV < 75%, but included for completeness):** FY33 Underlying EBITDA ≈ ₹122,541 × (11.0% EBIT + 2.3% D&A) = ₹122,541 × 13.3% = ₹16,298 cr. A 4.8× EV/EBITDA terminal multiple (consistent with the Gordon growth terminal value: EV = ₹78,739 / ₹16,298 = 4.83×) is reasonable for an Indian CV OEM at mid-cycle; TMCV currently trades at approximately 12.9× LTM EBITDA (EV ₹1,28,498 cr / EBITDA ₹9,965 cr), so the terminal multiple implies significant mean-reversion from current trading levels — which is consistent with a cyclical manufacturer. Cross-check confirms the Gordon growth result is internally consistent.

---

## 6. DCF Output

EV-to-equity bridge uses the `01_price-and-capital-structure` anchor: net cash (broad definition) = ₹7,435 cr (total debt ₹5,615 cr minus cash & ST investments ₹13,050 cr). Since the company is net cash, the net debt term is negative, adding back to equity value. Minority interest = ₹0. Preferred = ₹0.

| Step | Value (₹ cr) |
|---|---:|
| PV of explicit FCFs (FY27–FY33) | 28,083 |
| + PV of terminal value | 25,143 |
| **= DCF Enterprise value** | **53,226** |
| − Net debt (add: net cash ₹7,435 cr, broad definition) | +7,435 |
| − Minority interest | 0 |
| − Preferred equity | 0 |
| **= DCF Equity value** | **60,661** |
| ÷ Diluted shares (3,681.72 mn = 368.17 crore) | 368.17 |
| **= Intrinsic value per share (base case)** | **₹164.7** |
| vs current price (₹ 369.15, Capital IQ Key Stats, June 7, 2026) | −55.4% below current price |

**Anchor confirmation:** Net debt figure (₹5,615 cr total debt − ₹13,050 cr cash & ST investments = net cash ₹7,435 cr, broad) sourced from `01_price-and-capital-structure`, Section 4 EV bridge. Share count (3,681.72 mn) sourced from `01_price-and-capital-structure`, Section 2. No divergence.

**Important note on alternative net cash definitions:** If the narrower net cash (basic: ₹2,082 cr) is used instead of the broad definition, equity value = ₹53,226 + ₹2,082 = ₹55,308 cr → per share = ₹150.2. This tightens the per-share range to ₹150–₹165 depending on the cash definition used. The base case uses the broad definition (consistent with Capital IQ convention and the EV bridge in `01`).

**Pre-Iveco context:** These per-share values reflect TMCV standalone. If the Iveco tender offer closes at approximately ₹33,250–41,691 cr consideration and is funded by debt (bridge loan), the net cash position of ₹7,435 cr would swing to net debt of approximately ₹25,000–34,000 cr. At the midpoint of ₹29,000 cr net debt, equity value falls from ₹60,661 cr to ₹53,226 − ₹29,000 = ₹24,226 cr → approximately **₹66 per share** before any Iveco EBITDA contribution is included. This illustrates the transformative — and potentially highly dilutive — effect of the Iveco acquisition on intrinsic per-share value if financed entirely with debt. The equity value per share is extremely sensitive to the Iveco financing structure.

---

## 7. Sensitivity Grid (per-share intrinsic value, ₹)

WACC across columns (base case = 17.71%); terminal growth rate down rows (base case = 5.5%).
Net cash used: ₹7,435 cr (broad definition). Share count: 368.17 crore.
All values represent the standalone TMCV intrinsic value per share, pre-Iveco.

| Terminal g | WACC = 16.21% (−1.5 pp) | WACC = 17.71% (base) | WACC = 19.21% (+1.5 pp) |
|---|---:|---:|---:|
| **g = 6.0% (+0.5 pp)** | **₹189.5** | **₹167.7** | **₹150.8** |
| **g = 5.5% (base)** | **₹185.3** | **₹164.7** | **₹148.7** |
| **g = 5.0% (−0.5 pp)** | **₹181.5** | **₹162.1** | **₹146.8** |

**Per-share intrinsic value range: ₹147 to ₹190** across the full grid.

**Current price (₹369.15) is 95%–151% above the entire sensitivity range.**

*Grid construction note: PV of explicit FCFs was recomputed at each WACC level; terminal value was recomputed at each (WACC, g) combination. Year-end discounting. No interpolation.*

---

## 8. Intrinsic Read

The standalone normalized DCF produces an intrinsic value range of **₹147 to ₹190 per share** — approximately **55% to 60% below the current price of ₹369.15**. The current price embeds either (a) significantly more optimistic margin and growth assumptions than the normalized mid-cycle forecast, (b) a substantially lower required return than the 17.71% WACC used here, or (c) a substantial premium for the Iveco consolidation synergies that the market is pricing but cannot yet be quantified from available data. The single assumption this DCF is most sensitive to is the **WACC** (specifically the cost of equity driven by India ERP and beta): a 1.5 percentage point reduction in WACC from 17.71% to 16.21% raises the intrinsic value by approximately ₹17–21 per share — meaningful in absolute terms but still leaving a large gap to the current price. The second most powerful lever is the Iveco deal structure: if the acquisition is ultimately financed with equity (reducing the debt burden) and Iveco's margins prove resilient, the per-share intrinsic value could recover materially from the ₹66-per-share worst case outlined above, but that requires data that is not yet available. On the standalone normalized numbers, the current price of ₹369.15 cannot be supported by a mid-cycle DCF at any WACC within a reasonable range — the gap is too large for assumption tweaks to close.

---

## Partial-Data and Confidence Notes

- **FCF base:** Full cash flow statement available; no proxy needed. FCF quality is high (CFO/EBITDA = 145% in FY26). Confidence: not capped on data-availability grounds.
- **Forward estimates:** FY27 consensus available (revenue ₹881,357 mm, EPS ₹19.17 normalized). FY28 and FY29 consensus visible from Key Stats tab. The estimates workbook (TataMotorsLimitedNSEITMCVEstimatesReport.xls) failed extraction — broker-level detail and revision history not available. This limits estimate quality slightly but does not prevent the DCF.
- **Cyclicality cap:** The normalized mid-cycle approach produces lower FCF than reported FY26. This is appropriate and intentional per the cyclicality gate. The FY26 FCF of ₹12,733 cr (direct) vs normalized FCF of ₹6,245 cr illustrates the magnitude of the normalization — driven almost entirely by the exceptional ₹6,657 cr working capital inflow in FY26.
- **WACC inputs:** Risk-free rate, ERP, and beta are all web-sourced and labeled as unverified. The beta (1.59) is based on a short listed history (November 2025 listing); it should be treated with caution and confirmed from Capital IQ once more data accumulates. A sensitivity to beta is embedded in the ±1.5 pp WACC grid.
- **Iveco overhang:** The most material unmodelled item. This DCF is explicitly standalone. Any DCF that attempts to model post-Iveco TMCV would require Iveco's margin profile, deal financing structure, and integration costs — none of which are available in the data pool with Medium confidence or better.
- **Intrinsic confidence: Low-to-Medium.** The limited audited history of this entity (only one full fiscal year, FY26), the Iveco binary event, and the cyclicality normalization uncertainty all constrain confidence. The intrinsic value range (₹147–₹190) should be treated as indicative, not precise.

---

*All figures in INR crores unless stated otherwise. Reporting standard: Ind AS. No FX conversion applied (all figures in INR). Fiscal year ends March 31. Entity: TMCV (Tata Motors Limited, formerly TML Commercial Vehicles Limited), NSEI: TMCV.*

*Primary sources: SEBI LODR Consolidated Audited Results (year ended March 31, 2026), filed May 13, 2026; FY26 Integrated Annual Report (Ind AS), filed June 6, 2026; FQ4 2026 Earnings Call Transcript (S&P Capital IQ, May 13, 2026); S&P Capital IQ Financials export (Key Stats tab, downloaded June 7, 2026). Cross-module: `analyses/TMCV_2026-06-07/valuation/01_price-and-capital-structure.md`; `analyses/TMCV_2026-06-07/earnings/01_historical-financials.md`; `analyses/TMCV_2026-06-07/earnings/04_guidance-consensus.md`; `analyses/TMCV_2026-06-07/earnings/03_margin-drivers.md`; `analyses/TMCV_2026-06-07/earnings/07_earnings-sensitivity.md`; `analyses/TMCV_2026-06-07/earnings/06_earnings-quality.md`; `analyses/TMCV_2026-06-07/business-model/10_external-dependency.md`; `analyses/TMCV_2026-06-07/business-model/09_moat.md`. Web-sourced (labeled): India 10Y G-Sec yield (TradingEconomics.com, June 5, 2026); India ERP (Damodaran, NYU Stern, January 2026); TMCV beta (Tickertape.in, June 2026).*
