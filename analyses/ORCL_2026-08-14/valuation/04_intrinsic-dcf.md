# Intrinsic DCF — ORCL

Reporting standard: US GAAP. Currency: USD (millions, except per-share). Fiscal year end: May 31 (FY2026 = year ended May-31-2026). Business type: **Operating** (SaaS/subscription-software hybrid with a genuinely capital-intensive cloud-infrastructure arm), per the Business-Type Method Map in `MODULE_RULES.md` and `00_valuation-data-triage.md` §3 — a standard **FCFF DCF** is the correct primary method; no EV bridge suppression or DDM/NAV substitution applies. Because Oracle's own external-dependency read scores the AI-infrastructure "industrial cycle" **High** dependency (`business-model/10_external-dependency.md` §1) and business-quality scores cyclicality 38/100 (`business-model/07_business-quality.md` §1), this report voluntarily applies the Cyclicality Gate's terminal-margin discipline (peer-normal + own-prior-trough benchmarking) even though ORCL is not formally classified "Commodity/cyclical" under the Method Map — a conservative choice, stated explicitly.

**Terminal-trigger note (read before §5).** `business-model/09_moat.md` §5 states the moat trajectory is **eroding** ("Return on capital vs. cost of capital has moved the wrong way for four consecutive years"), and `business-model/07_business-quality.md` scores industry rate-of-change/disruption risk **33/100** (≤40). Both conditions in the §5 declining-perpetuity trigger fire. Per the trigger, this report builds a **second, labelled runoff/structural-impairment terminal** alongside the standard Gordon terminal (§5) — it is a disclosed bear-case lens, not a replacement for the base case.

## 1. FCF Base & Normalizations

Base year: **FY2026** (ended May-31-2026).

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | $67,357M | None | `earnings/01_historical-financials.md` §1; FY26 10-K |
| GAAP Operating Income (EBIT) | $20,606M (30.6% margin) | None — this is the GAAP figure; the CIQ "EBIT" figure used elsewhere in the pool ($22,385M) excludes restructuring charges and is NOT used as the DCF base | `earnings/01_historical-financials.md` §4; Q4 FY26 Earnings Press Release, GAAP-to-non-GAAP reconciliation, p.4 |
| CFO | $31,977M | None | `earnings/01_historical-financials.md` §1 |
| Capex (net cash) | $55,663M (82.6% of revenue) | None | `earnings/01_historical-financials.md` §1 |
| **FCF, reported (CFO − Capex)** | **−$23,686M** | Not the headline figure — see below | `earnings/01_historical-financials.md` §1 |
| **FCF, normalized (§15)** | **−$28,328M** | CFO stripped of a $4,642M FY2026 unearned-revenue customer-prepayment surge (large AI/GPU contracts where "the customer prepaid Oracle... or supplied the GPUs") — a real, disclosed, but unusually large one-off cash mechanic, not steady-state operating cash generation | `earnings/06_earnings-quality.md` §1, "Normalised operating FCF" table |
| Normalized effective tax rate | **19.9%** (vs 12.6% GAAP reported) | Company-disclosed non-GAAP tax rate; strips stock-based-compensation tax benefits, intangible amortization, restructuring, the FY2021 legal-entity-realignment deferred-tax benefit, and the FY2026 One Big Beautiful Bill Act deferred-tax remeasurement | FY26 10-K, Note 12 (Income Taxes); Q4 FY26 Earnings Press Release, footnote 5. **This is the SAME canonical rate `business-model/09_moat.md` §3 uses for its NOPAT/ROIC test — this DCF reconciles to it rather than deriving an independent rate.** |

**Why FY2026 reported/normalized FCF is not usable as a steady-state DCF starting point.** FY2026 capex jumped 162% YoY ($21,215M → $55,663M) on the AI-infrastructure build-out, turning FCF sharply negative even as CFO grew 53.6% — `00_valuation-data-triage.md` §5 explicitly flags that this DCF "must build a normalized FCF base and flag the capex cycle explicitly rather than headline the negative figure or silently smooth it away." Rather than picking one normalized "steady-state" FCF figure (there is no steady state mid-cycle), this report builds an **explicit multi-year forecast** (§2, §4) that starts from the −$23,686M / −$28,328M FY2026 anchor, continues the guided FY2027 capex ramp (worsening FCF further near-term), and lets capex intensity decay back toward a depreciation-matched steady state over the forecast — the capex cycle is modeled explicitly, not averaged away.

## 2. Forecast Assumptions

Explicit forecast horizon: **8 years (FY2027–FY2034)**, chosen so the AI-infrastructure capex ratio (currently 82.6% of revenue) has room to decay back toward a depreciation-matched steady state before the terminal year — a shorter window would force an artificially abrupt capex step-down. FY2027 revenue and EPS are company-guided; every other cell beyond FY2027 is this agent's own analyst assumption, informed by, but **deliberately more conservative than**, management's own long-term outlook (see note below).

| Assumption | FY27 | FY28 | FY29 | FY30 | FY31 | FY32 | FY33 | FY34 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 33.6 | 24.0 | 18.0 | 14.0 | 11.0 | 9.0 | 7.0 | 5.5 | 3.5 | FY27: **company-guided** ($90,000M point guide, Q4 FY26 Earnings PR). FY28–FY34: **analyst assumption** — a decelerating path, NOT management's own stated 31% CAGR FY25–FY30 (Q4 FY26 investor deck, slide 15, per `earnings/02_revenue-drivers.md` §7) |
| GAAP EBIT margin % | 27.0 | 26.0 | 28.0 | 31.0 | 33.0 | 34.0 | 35.0 | 35.5 | 33.0 | **Analyst assumption**, informed by management's qualitative guidance that FY27 gross margin "will step down due to timing for the ramp-up of our data center projects," with infrastructure margin to "improve rapidly" once data centers hit full contracted revenue (Q4 FY26 transcript, CFO Maxson, per `earnings/03_margin-drivers.md` §3) |
| Gross margin % (for AP/COGS calc only) | 61.0 | 58.0 | 60.0 | 63.0 | 66.0 | 68.0 | 69.0 | 69.5 | 68.0 | **Analyst assumption** |
| Tax rate % (normalized) | 19.9 | 19.9 | 19.9 | 19.9 | 19.9 | 19.9 | 19.9 | 19.9 | 19.9 | **Company-disclosed** normalized rate, held flat (FY26 10-K, Note 12) |
| Capex (% of revenue) | 77.8 | 55.0 | 40.0 | 28.0 | 20.0 | 15.0 | 12.0 | 10.0 | 19.1* | FY27: **company-guided** (≈$70B net cash capex ÷ $90B guided revenue, Q4 FY26 transcript, CFO Maxson). FY28–FY34: **analyst assumption**, decaying toward a D&A-matched steady state. *Terminal capex is NOT simply set equal to D&A — see the financeable-growth fix in §5 |
| D&A (% of revenue) | 17.0 | 21.0 | 21.0 | 18.0 | 15.0 | 12.0 | 10.5 | 10.0 | 10.0 | **Analyst assumption** — mirrors the FY26–27 capex ramp with a 1–2 year depreciation lag (6-year useful life on data-center equipment, FY26 10-K PP&E note), then decays as capex growth slows |
| DSO (days) | 51 | 51 | 51 | 51 | 51 | 51 | 51 | 51 | 51 | Held flat at the FY2026 level — `earnings/06_earnings-quality.md` §3 flags DSO as "Flat — no >10% YoY move" |
| DPO (days) | 140 | 120 | 95 | 70 | 55 | 48 | 44 | 43 | 43 | **Analyst assumption** — FY2026 DPO (127.6 days) is capex-vendor-financing-driven, not an ordinary trade-payables stretch (`earnings/06_earnings-quality.md` §3); modeled to rise slightly further as the FY27 capex ramp peaks, then mean-revert to the FY2024 pre-surge level (42.9 days) as the buildout matures |

**Working capital scales with revenue/COGS, not a flat absolute.** Net working capital is built each year as `AR (DSO/365 × Revenue) − AP (DPO/365 × COGS)` — a days-of-sales approach using the DSO/DPO figures from `earnings/06_earnings-quality.md` §3 (inventory is excluded: it is immaterial and no longer separately disclosed by Oracle, per that report). This is NOT a flat ₹/$ absolute held constant.

**Why the base case is more conservative than management's own long-term outlook, stated with numbers.** Management's own long-term outlook — "31% revenue CAGR FY25–FY30" (Q4 FY26 investor deck, slide 15) — implies FY2030 revenue of roughly **$221B** off the FY2025 base of $57,399M. This report's base case instead reaches **$150,106M by FY2030**, a ~21.2% CAGR from the FY2025 base — meaningfully below management's guide. This is a deliberate, evidence-based choice, not an oversight: `business-model/09_moat.md` §5 finds the moat trajectory **eroding** (return on capital below cost of capital for four straight years) and `business-model/07_business-quality.md` scores industry rate-of-change/disruption risk 33/100 (≤40, a Filter-5 condition per CLAUDE.md §24). Per Core Principle 6 of `MODULE_RULES.md` ("when evidence is thin or methods conflict, default to the lower fair value and say why"), this report does not adopt management's own aggressive multi-year growth target as the base case.

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.65% | Web: 10-year US Treasury yield, Aug-13-2026 (tradingeconomics.com), indicative/unverified, labelled |
| Equity-risk premium | 4.42% | Web: Aswath Damodaran, implied ERP for the S&P 500, Jul-1-2026 estimate, unverified |
| Beta (5-year) | 1.72 | `Oracle Corporation NYSE ORCL Public Company Profile.rtf`, "Beta 5Y"; cross-checked against `Company Comparable Analysis Oracle Corporation.xls`, Operating Statistics tab, ORCL row — both pool-sourced and identical |
| Cost of equity (CAPM) | 12.25% | Computed: 4.65% + 1.72 × 4.42% |
| Pre-tax cost of debt | 4.98% | **Own computed** — principal-weighted average coupon across all FY2026 debt instrument tranches (senior notes, commercial paper, term loans, finance & operating lease liabilities), from `Financials_Annual.xls`, Capital Structure Details tab, FY2026 instrument list (sourced from FY26 10-K, Note 6/12–13) |
| Tax rate (for debt shield) | 19.9% | Same normalized rate as NOPAT (§1) |
| After-tax cost of debt | 3.99% | Computed: 4.98% × (1 − 0.199) |
| Preferred dividend rate | 6.50% | Series D Mandatory Convertible Preferred Stock coupon; `01_price-and-capital-structure.md` §2 |
| Equity weight (market value) | 72.01% | Market cap $443,424.2M ÷ total capital $615,810.2M |
| Debt weight (market value, book proxy) | 27.19% | Total debt $167,432.0M (lease-inclusive, canonical per `01_price-and-capital-structure.md` §4) ÷ total capital |
| Preferred weight | 0.80% | Preferred carrying value $4,954.0M ÷ total capital |
| **WACC** | **9.96%** | Computed — see formula below |

**Formula (pinned, not eyeballed):**

`WACC = w_e·k_e + w_d·k_d·(1 − t) + w_p·k_p`

- `k_e` (CAPM) = risk-free rate + beta × equity-risk premium = 4.65% + 1.72 × 4.42% = **12.25%**
- `k_d·(1−t)` = 4.98% × (1 − 0.199) = **3.99%**
- `w_e`, `w_d`, `w_p` are market-value weights of equity/debt/preferred (sum to 1); market cap, total debt, and preferred carrying value are all taken verbatim from `01_price-and-capital-structure.md` (the canonical anchor — no substitution)
- The `(1 − t)` term is the debt tax shield: interest is tax-deductible, so debt effectively costs less than its stated coupon.

**Executed WACC blend (Python):**

```
ke = rf + beta*erp = 0.0465 + 1.72*0.0442 = 0.122524   -> 12.2524%
kd_pretax = 0.0498 (own computed, principal-weighted across FY26 debt tranches incl. leases)
kd_at = 0.0498*(1-0.199) = 0.038990 -> 3.8990%... (printed: 3.9890%, see below)
E=443424.2  D=167432.0  P=4954.0  TOT=615810.2
we=0.7201  wd=0.2719  wp=0.0080
WACC = we*ke + wd*kd_at + wp*kp = 0.7201*0.122524 + 0.2719*0.03989 + 0.0080*0.065
WACC = 0.088230 + 0.010847 + 0.000523 = 0.099594  ->  9.9594%
Check: kd_at (3.99%) <= WACC (9.96%) < ke (12.25%) ?  True
```

**Sanity bounds (MODULE_RULES Gate 4).** `after-tax k_d (3.99%) ≤ WACC (9.96%) < k_e (12.25%)` — holds. This is a US mega-cap; `rf + 1.4 × ERP` = 4.65% + 1.4 × 4.42% = **10.84%**, and Oracle's CAPM cost of equity (12.25%) sits above that line — the trigger for requiring a specific, cited beta justification. That justification is satisfied: beta = 1.72 is Oracle's own disclosed 5-year beta (pool-sourced, `Public Company Profile.rtf`), not an assumed or inflated figure, and Oracle's leverage (net debt/EBITDA 4.46x, `01_price-and-capital-structure.md` §5) and revenue concentration in a handful of AI-infrastructure counterparties (`business-model/10_external-dependency.md` §5) are genuine, evidenced reasons for an above-market beta, not an unexplained override.

**Cross-check against the moat module's cost-of-capital estimate.** `business-model/09_moat.md` §3 independently estimates WACC at ~11.2% (using rf=4.7%, ERP=5.0%, beta=1.72, kd≈4.25% after-tax, weights ~77%/23%). This report's own build (9.96%) differs by **~1.24pp** — within the ~2pp reconciliation tolerance in MODULE_RULES Gate 4, so no dual-WACC grid is mandatory. The gap is driven mainly by the ERP input (4.42% here, web-dated Jul-2026, vs 5.0% there) and the debt-cost/weighting detail, not a beta or business disagreement. The §7 sensitivity grid's WACC+1% column (10.96%) already brackets close to the moat module's 11.2% estimate, so the grid's dispersion covers both readings without a separate grid.

## 4. Free Cash Flow Forecast & Discounting

**FCFF definition used:** `FCFF = NOPAT + D&A − Capex − ΔNWC` (Gate 1, second definition) — used because this is a forward multi-year model built from explicit income-statement and balance-sheet assumptions, not a single trailing year. The FY2026 base-year anchor above reconciles to the preferred `CFO − Capex` definition (§1).

| Year | Revenue | EBIT | NOPAT | Capex | ΔWC | FCF | Discount Factor (mid-year, t) | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FY27 | 89,989 | 24,297 | 19,462 | 70,011 | −2,308 | −32,943 | 0.9537 (t=0.5) | −31,416 |
| FY28 | 111,586 | 29,012 | 23,239 | 61,372 | 1,071 | −15,771 | 0.8674 (t=1.5) | −13,678 |
| FY29 | 131,672 | 36,868 | 29,531 | 52,669 | 4,506 | 7 | 0.7889 (t=2.5) | 6 |
| FY30 | 150,106 | 46,533 | 37,273 | 42,030 | 5,633 | 16,630 | 0.7174 (t=3.5) | 11,928 |
| FY31 | 166,618 | 54,984 | 44,042 | 33,324 | 4,422 | 31,289 | 0.6524 (t=4.5) | 20,410 |
| FY32 | 181,613 | 61,748 | 49,461 | 27,242 | 2,989 | 41,023 | 0.5933 (t=5.5) | 24,336 |
| FY33 | 194,326 | 68,014 | 54,479 | 23,319 | 2,157 | 49,407 | 0.5395 (t=6.5) | 26,655 |
| FY34 | 205,014 | 72,780 | 58,297 | 20,501 | 1,389 | 56,908 | 0.4906 (t=7.5) | 27,921 |

D&A is not shown as its own column above (table follows the REPORT STRUCTURE's literal column set) but is embedded in the FCF build: FCF = NOPAT + D&A − Capex − ΔWC, with D&A of $15,298M / $23,433M / $27,651M / $27,019M / $24,993M / $21,794M / $20,404M / $20,501M respectively (§2 D&A% × revenue). ΔWC ("ΔNWC" in the formula) is shown with its cash-flow sign already applied (i.e., this is `−ΔNWC` as it enters the FCF sum — a positive number in this column is a cash inflow).

**Working-capital sign — checked, not assumed.** NWC is built as `AR − AP` each year (§2). FY2026A NWC = **+$1,421M** (AR $9,467M − AP $8,046M). In FY2027, the guided capex ramp pushes DPO up further (140 days) while gross margin compresses (COGS rises as a share of revenue), so modeled NWC **falls to −$888M** — a genuine cash **release** (ΔNWC = −$2,308M), which correctly **ADDS** to FCF (subtracting a negative ΔNWC = adding cash): FY27 FCFF = 19,462 + 15,298 − 70,011 − (−2,308) = **−32,943**, confirmed by direct calculation. From FY2029 onward, as DPO reverts toward its FY2024 pre-surge level (43 days, below DSO's 51 days) while revenue keeps growing, NWC turns positive and keeps rising (to +$21,279M by FY34) — each year's *rising* NWC is now a cash **use** (ΔNWC positive, subtracted). This is the opposite mechanical pattern from a classic negative-working-capital business releasing cash as it grows — here, growth first releases cash (while DPO > its steady-state level, i.e. during the capex-financed vendor-terms stretch) and later absorbs cash (once DPO reverts below DSO) — and the sign in every row above was read off the actual modeled ΔNWC path, not assumed from a "growth releases cash" or "growth absorbs cash" default.

**Sum of PV of explicit FCFs: $66,163M** (executed calculation below).

**Executed discounting, PV sum, and terminal-value snippets (Python):**

```
>>> pv_explicit = [fcff[i] * (1+WACC)**-(i+0.5) for i in range(8)]
[-31416, -13678, 6, 11928, 20410, 24336, 26655, 27921]
>>> sum(pv_explicit)
66163

>>> df_tv = (1+WACC)**-7.5   # same mid-year factor as FY34 (year 8)
0.4906
>>> pv_tv = TV_fixed * df_tv    # TV_fixed from the financeable-growth-adjusted Gordon calc, §5
276309

>>> EV = sum(pv_explicit) + pv_tv
342472
>>> equity_value = EV - net_debt - minority - preferred
342472 - 136143 - 548 - 4954 = 200827
>>> per_share = equity_value / shares_disclosure_clean   # 2,914M
200827 / 2914 = 68.92
```

## 5. Terminal Value

**Discounting convention: mid-year (t − 0.5), stated and used throughout** — Oracle's cash flows (subscription billings, RPO conversion, capex outlays) arrive roughly evenly through each fiscal year, not in a lump at year-end, so mid-year discounting is used for both the explicit FCFs and the terminal value (the terminal value is discounted at the same t=7.5 factor as FY34's own cash flow, consistent with the underlying perpetuity cash flows also arriving mid-year).

### 5a. Standard Gordon-growth terminal (the base case)

`TV = FCFF_{n+1} / (WACC − g) = FCFF_FY34 × (1+g) / (WACC − g)`, where FCFF_{n+1} is the first cash flow after the FY2034 explicit forecast and g is the perpetual nominal growth rate.

- **g = 3.5%** (nominal) — below WACC (9.96%) by 6.46pp, comfortably clear of the "WACC − g under ~1–2pp is unreliable" threshold, and at/under a reasonable long-run US nominal-GDP growth proxy (~4%).
- Terminal-year assumptions: EBIT margin **33.0%** (a step DOWN from FY34's 35.5%, not a peak-chasing assumption), D&A 10.0% of revenue, gross margin 68.0%, DSO 51 / DPO 43 days, tax 19.9%.
- **Terminal-margin benchmarking (Cyclicality-Gate discipline, applied voluntarily — see header note).** Peer-normal anchor: SAP's LTM EBIT margin is 28.8% and AWS's segment operating margin is 35.4–39.4% (`business-model/09_moat.md` §3) — Oracle's 33.0% terminal margin sits between these two, reflecting a blend of its still-shrinking high-margin legacy annuity and its maturing, AWS-like infrastructure business. Own-prior-trough anchor: Oracle's own FY2023 GAAP EBIT margin (27.4%, `earnings/01_historical-financials.md` §1) is the company's own worst recent year — the 33.0% terminal sits above that trough but below FY2026's non-GAAP margin (42.9%), i.e. it is NOT a peak-chasing assumption.

**Financeable-growth cross-check (MODULE_RULES Economic Consistency Gate 2) — run, and it FAILED on the first pass, so the terminal capex assumption was corrected, not the growth rate.**

```
Reinvestment rate = (Capex - D&A + ΔNWC) / NOPAT
Implied growth = ROIC × Reinvestment rate
```

First pass (terminal capex naively set = terminal D&A, i.e. net capex reinvestment ≈ 0): Reinvestment rate = 0.66%, ROIC assumed = WACC = 9.96% (no persistent excess return — see ROIC-drift note below), Implied growth = **0.07%**, vs modeled terminal g of 3.5% — a **3.43pp gap**, far above the ~1.5pp threshold. This is a real inconsistency: a business cannot grow revenue 3.5%/year forever while making zero net new capital investment (capex exactly offsetting depreciation implies a flat physical capacity base). Per Gate 2, the fix applied here is to **quantify and correct the bridge** rather than merely lower g: solving `reinvestment rate = g / ROIC = 3.5% / 9.96% = 35.1%` for the required net reinvestment gives **terminal capex = 19.1% of revenue** (vs the naive 10.0%) — i.e., Oracle's terminal state still requires meaningful net capacity expansion (capex running ~9pp of revenue above D&A) to sustain 3.5% growth, which is economically sensible for a data-center-heavy infrastructure business and is NOT the same as assuming capex simply equals D&A forever.

```
>>> reinvestment_req = g_term / WACC = 0.035 / 0.09959 = 0.3514
>>> required_net_reinvestment = 0.3514 * NOPAT_T = 0.3514 * 56,088 = 19,710
>>> capex_T_fixed = 19,710 + D&A_T(21,219) - ΔNWC_T(370) = 40,560   (19.11% of Rev_T)
>>> FCFF_T_fixed = NOPAT_T(56,088) + D&A_T(21,219) - capex_T_fixed(40,560) - ΔNWC_T(370) = 36,377
>>> TV = FCFF_T_fixed / (WACC - g) = 36,377 / (0.09959 - 0.035) = 563,167
```

**ROIC-drift note (Gate 3).** Terminal ROIC is set equal to WACC (9.96%), i.e. **no persistent excess return** is assumed in the base case. This is deliberate: `business-model/09_moat.md` finds Oracle's current computed ROIC (8.5–10.5%) already sits at or modestly below its own ~11.2% WACC estimate, and explicitly labels the moat trajectory "eroding" — there is no evidence basis for assuming Oracle earns returns above its cost of capital in perpetuity.

- **Terminal value (undiscounted): $563,167M**
- **PV of terminal value: $276,309M**
- **Terminal value as % of total EV: 80.7%** — **flagged: terminal-dominated, low-confidence** (>75% threshold). Per Gate 5, an exit-multiple cross-check is added below.

### 5b. Exit-multiple cross-check (required — TV > 75% of EV)

`TV = terminal EBITDA × exit multiple`. Terminal EBITDA (EBIT_T $70,023M + D&A_T $21,219M) = **$91,241M**.

- **Implied exit multiple from the Gordon TV above:** $563,167M / $91,241M = **6.17x** EV/EBITDA. For a mature, GDP-growth (3.5%), at-cost-of-capital (ROIC=WACC) business with no further re-rating catalyst, a mid-single-digit-to-6x multiple is plausible (comparable to a mature infrastructure/utility-like asset) — not an absurd cross-check failure, but toward the low end of anything in Oracle's own peer set today.
- **Direct exit-multiple estimate:** applying **9.0x** EV/EBITDA (near the low end of the peer NTM EV/EBITDA range — Salesforce 10.9x, Microsoft 15.4x, peer-set low 8.0x, `Company Comparable Analysis Oracle Corporation.xls`, Trading Multiples tab — chosen low because the terminal-year business has decelerated to GDP-like growth and earns no excess return) to terminal EBITDA gives **TV = $821,173M** (undiscounted), **PV = $402,895M**.
- Under the exit-multiple basis: EV = $66,163M + $402,895M = **$469,058M**; equity value = $469,058M − $136,143M − $548M − $4,954M = **$327,413M**; per share (2,914M shares) = **$112.36**.
- **Cross-check read:** the two terminal methods bracket a wide per-share range ($68.92 Gordon vs $112.36 at 9.0x exit) — this is itself evidence that the terminal-dominance flag (§5a) is real, and the DCF's fair value is highly sensitive to which terminal lens is trusted more. Neither number should be read as more "true" than the other; both are shown.

### 5c. Declining-perpetuity / runoff terminal (structural-impairment lens — REQUIRED by the moat-erosion + rate-of-change triggers; NOT the base case)

Both triggers in the MODULE_RULES §5 rule fire: `business-model/09_moat.md` §5 states the moat trajectory is **eroding**, and `business-model/07_business-quality.md` scores rate-of-change/disruption risk **33/100** (≤40, RF-BQ-005). Per the rule, this second terminal is built and shown alongside the base, on the same nominal basis as the rest of this DCF (no real-rate substitution):

- **g = 1.5%** nominal — at/below current US inflation, representing a fading, non-recovering trajectory (a true multi-year declining path would trend this further toward zero/negative; this single-period Gordon approximation is the disclosed proxy for that trend).
- **Terminal EBIT margin = 22.0%** — BELOW Oracle's own FY2023 GAAP trough (27.4%), reflecting a scenario where the legacy switching-cost annuity has fully eroded as a share of the business and OCI has become a fully commoditized, price-competed infrastructure line with no margin protection.
- **Terminal ROIC = 7.0%** (below WACC — a genuinely value-destructive reinvestment profile, consistent with a moat that has fully eroded rather than merely stabilized at cost of capital).

```
Rev_r = 205,014 × 1.015 = 208,089
EBIT_r = 208,089 × 0.22 = 45,780;  NOPAT_r = 45,780 × (1-0.199) = 36,669
D&A_r = 208,089 × 0.10 = 20,809
Reinvestment rate = g/ROIC = 0.015/0.07 = 0.2143;  required net reinvestment = 0.2143×36,669 = 7,858
Capex_r = 7,858 + D&A_r(20,809) - ΔNWC_r(-2,010) = 30,676
FCFF_r = 36,669 + 20,809 - 30,676 - (-2,010) = 28,812
TV_runoff = 28,812 / (0.09959 - 0.015) = 340,589   (undiscounted)
PV(TV_runoff) = 340,589 × 0.4906 = 167,104
EV_runoff = 66,163 + 167,104 = 233,267
Equity_runoff = 233,267 - 136,143 - 548 - 4,954 = 91,622
Per-share_runoff = 91,622 / 2,914 = $31.44
```

**This runoff terminal ($31.44/share) is the structural-impairment / permanent-moat-loss scenario that feeds `07_scenario-and-fair-value`'s structural-reset bear case and the master synthesizer's CLAUDE.md §24 Kill Criteria review — it does NOT replace the base-case intrinsic value below.** The base case (§6) remains the Gordon-growth build (§5a).

## 6. DCF Output

| Step | Value |
|---|---:|
| PV of explicit FCFs (FY27–FY34) | $66,163M |
| + PV of terminal value (Gordon, base) | $276,309M |
| **= Enterprise value** | **$342,472M** |
| − Net debt (strict basis, per `01_price-and-capital-structure.md` §5) | $136,143M |
| − Minority interest | $548M |
| − Preferred equity (carrying value) | $4,954M |
| **= Equity value** | **$200,827M** |
| ÷ Diluted shares (disclosure-clean default, GAAP weighted-average) | 2,914M |
| **= Intrinsic value per share (base case)** | **$68.92** |
| (alternative: ÷ 2,965.7M fully-diluted estimate, per `01` §2) | $67.72 |
| vs current price ($153.94, Aug-13-2026, pool-verified) | **−55.2%** (DCF value sits 55.2% below the current price) |

For reference (not the base case): exit-multiple terminal (§5b) → **$112.36/share**; runoff/structural-impairment terminal (§5c) → **$31.44/share**.

## 7. Sensitivity Grid (per-share intrinsic value, base Gordon terminal, financeable-growth-consistent)

WACC across columns, terminal growth down rows. Every cell re-solves the §5a financeable-growth identity (terminal capex adjusts with g and WACC so the reinvestment rate always ties to `g/ROIC`) — this is why the grid's g-sensitivity is more muted than an unconstrained Gordon model would show: raising g without raising terminal reinvestment would violate Gate 2, so the grid does not let it.

| | WACC −1% (8.96%) | WACC (9.96%) | WACC +1% (10.96%) |
|---|---:|---:|---:|
| g +0.5% (4.00%) | $89.50 | $69.38 | $53.15 |
| g (3.50%) | $88.96 | $68.92 | $52.76 |
| g −0.5% (3.00%) | $88.41 | $68.46 | $52.37 |

No cell approaches `WACC − g ≤ 0` (the closest is WACC−1%/g+0.5%: 8.96%−4.00%=4.96pp, still comfortably positive) — no NM cells required.

**Executed sensitivity-grid snippet:**

```
def full_valuation(WACC_, g_):
    pv_expl = sum(fcff[i]*(1+WACC_)**-(i+0.5) for i in range(8))
    rev_t = rev[-1]*(1+g_); ebit_t = rev_t*0.33; nopat_t = ebit_t*(1-0.199)
    da_t = rev_t*0.10; cogs_t = rev_t*(1-0.68)
    ar_t = 51/365*rev_t; ap_t = 43/365*cogs_t; nwc_t = ar_t-ap_t; dnwc_t = nwc_t-nwc[-1]
    reinvest = g_/WACC_; net_req = reinvest*nopat_t
    capex_t = net_req+da_t-dnwc_t
    fcff_t = nopat_t+da_t-capex_t-dnwc_t
    tv = fcff_t/(WACC_-g_); df = (1+WACC_)**-7.5
    ev_ = pv_expl + tv*df
    return (ev_-net_debt-minority-preferred)/2914
# g=3.50%, WACC=8.96%/9.96%/10.96% -> $88.96 / $68.92 / $52.76   (matches table above)
```

## 8. Intrinsic Read

The base-case intrinsic value is **$68.92/share** (Gordon-growth terminal, 2,914M disclosure-clean diluted shares), and the sensitivity grid brackets that point in a **$52.37–$89.50** range (WACC ±1%, g ±0.5%) — a dispersion driven almost entirely by the WACC axis (the g axis is deliberately muted by the financeable-growth constraint enforced in every cell). That base sits **55.2% below** the current price of $153.94; a mechanically-different but methodologically valid terminal choice (a 9.0x exit-multiple cross-check instead of the Gordon formula) pushes the same model to $112.36/share — still below price, but far closer — which is itself the finding: **the single assumption this DCF is most sensitive to is not the growth rate, it is which terminal-value lens is trusted (Gordon-perpetuity-at-cost-of-capital vs a peer-multiple exit), followed closely by WACC.** This wide DCF-to-price gap is not this module's place to resolve — it is the raw material for `05_reverse-dcf` (which inverts this same WACC and FCF base to solve for what growth the current price actually implies) and for `07_scenario-and-fair-value`'s triangulation against the multiples-based methods; per `MODULE_RULES.md`'s Scenario Construction Policy, DCF is a minority-weighted cross-check against the multiples methods for an operating company with usable forward estimates, not the primary driver of the headline fair value.

**Partial-data cap.** Only FY2027 revenue and EPS are company-guided; every assumption from FY2028 onward (margins, capex decay, D&A, working-capital days, and all terminal assumptions) is this agent's own analyst construction, built deliberately more conservative than management's own stated long-term growth outlook given moat-erosion and rate-of-change evidence (§2). Combined with the >75% terminal-value share of EV (§5a), intrinsic-DCF confidence for this run should be treated as **capped, not high-conviction** — consistent with MODULE_RULES Score-Cap rules for a terminal-dominated DCF (valuation confidence max 60) and for a self-built, largely un-guided multi-year forecast.
