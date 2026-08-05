# Intrinsic DCF — SMPL

Business-type gate: `00_valuation-data-triage.md` and `business-model/02_business-identity.md` both classify SMPL as an **Operating** business (branded, asset-light consumer-packaged-food company). Per the Business-Type Method Map, the FCFF DCF below is the correct primary intrinsic method — no bank/insurer, REIT, or holding-company override applies. Reporting standard: **US GAAP**. Currency: **USD, millions** (per-share in whole dollars). Fiscal year ends the last Saturday in August (FY2025 ended Aug-30-2025). Jurisdiction: US domestic SEC filer — no local-equivalent substitution issue. [`valuation/00_valuation-data-triage.md` §1A]

**Cyclicality Gate note:** `earnings/03_margin-drivers.md` and `business-model/10_external-dependency.md` both use cycle-position language for SMPL (unhedged commodity input costs, a margin trough) even though SMPL is not formally classified "Commodity/cyclical" under the Method Map. This report applies the same discipline anyway: the terminal margin below is benchmarked against SMPL's own recent trough (TTM Adjusted EBITDA margin 16.9%) and its own FY2024 level (20.2%), not against management's own aspirational "~20%" target or the FY2021 historical peak — see §2 and §5.

## 1. FCF Base & Normalizations

Base year: **FY2025** (52 weeks ended Aug-30-2025), with the trailing-twelve-months (TTM, 39 weeks to May-30-2026) shown for context. [`earnings/01_historical-financials.md` §1–§2]

| Item | Base-Year Value (FY2025) | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | $1,450.9M | None | FY2025 10-K, Income Statement |
| GAAP EBIT (Income from Operations) | $156.9M (10.8% margin) | — reported basis | FY2025 10-K, Item 7, p.41 |
| **+ Atkins brand intangible impairment (non-cash, one-off)** | +$60.9M | Added back — a discrete non-cash write-down, not a recurring operating cost | FY2025 10-K, Note 9; `earnings/01_historical-financials.md` §7 [8] |
| **= Normalized EBIT (this report's base)** | **$217.8M (15.0% margin)** | GAAP EBIT + impairment add-back only — SBC, integration expense, and restructuring are **kept in**, not stripped, because `earnings/06_earnings-quality.md` §4/§9 flags the company's own "Adjusted EBITDA" for excluding these as if one-off when they have recurred every period for 2+ years | Agent calculation |
| GAAP CFO | $178.5M | None | FY2025 10-K, Cash Flow Statement |
| Capex | $20.5M | None (no maintenance/growth split disclosed) | FY2025 10-K |
| **Reported FCF (CFO − Capex)** | **$157.9M** | Standard definition, no company-specific FCF metric exists | `earnings/01_historical-financials.md` §1 |
| TTM (39wk to May-30-26) GAAP EBIT | $(243.3)M | Distorted by $391.9M of impairment across FQ4 FY25–FQ3 FY26 | `earnings/01_historical-financials.md` §2 |
| **+ TTM impairment add-back** | +$391.9M | Same logic as above | `earnings/01_historical-financials.md` §6 |
| **= TTM Normalized EBIT** | **$148.6M (10.7% margin)** | Confirms the current run-rate sits at a genuine multi-year **trough**, not the FY2025 level — consistent with `business-model/07_business-quality.md` §4 ("a multi-year trough, not a cyclical peak") | Agent calculation |
| Company "Adjusted EBITDA" (non-GAAP) FY2025 | $278.2M (19.2% margin) | **Not used as this report's normalized base** — it strips SBC and integration expense as if non-recurring; used only as the top-line margin anchor for the forecast (§2), with SBC/integration separately re-inserted | `earnings/01_historical-financials.md` §4; `earnings/06_earnings-quality.md` §4 |

**FCFF identity used (Economic Consistency Gate 1):** `FCFF = NOPAT + D&A − Capex − ΔNWC`, with one further, explicitly labeled adjustment: **− SBC** (stock-based compensation), treated as a recurring economic cost to equity holders (dilution) even though it is a non-cash add-back inside CFO. This directly answers the earnings-quality module's flag that the company's own "Adjusted EBITDA" — which this report uses as the top-line margin driver in the forecast — excludes SBC every single period [`earnings/06_earnings-quality.md` §4, §8]. No other definition is mixed in.

**Confidence:** a full cash-flow statement exists (no proxy needed) and forward guidance/consensus exist through FY2027 (no self-built near-term forecast needed) — the Partial-Data Rule caps do **not** apply. Confidence is nonetheless capped at **Medium**, not High, because of (a) the earnings-quality module's RF-EQ-001 flag (rising accruals divergent from cash earnings) and (b) the terminal-value share of EV (§5/§6).

## 2. Forecast Assumptions

6-year explicit forecast, FY2026–FY2031 (fiscal year ends last Saturday in August). FY2026 is company guidance; FY2027 is Street consensus (still being cut — see `earnings/04_guidance-consensus.md` §4–§5); FY2028–FY2031 are analyst assumptions, not company-guided, built to fade toward the terminal state.

| Assumption | FY26 | FY27 | FY28 | FY29 | FY30 | FY31 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | −6.9% | −4.5% | +1.0% | +2.0% | +2.5% | +3.0% | +1.0% | FY26: company guidance midpoint ($1,350.0M net sales, "down 7% to 6%") [`earnings/04_guidance-consensus.md` §2]. FY27: Street consensus $1,284.62M, **falling** — 3-month revision breadth −6 [`earnings/04_guidance-consensus.md` §4–§5], labeled *consensus, not company-guided, still being cut*. FY28–31: **analyst assumption, not company-guided** — models a return to modest growth as the Sept-2026 price increase annualizes and Atkins laps its worst comps; explicitly does **not** assume a snap-back to FY21–24-style high-single-digit growth |
| Adjusted EBITDA margin % (company non-GAAP) | 16.5% | 17.2% | 17.0% | 17.0% | 17.0% | 17.0% | 17.0% | FY26: guidance midpoint ($222.5M / $1,350M) [`earnings/04_guidance-consensus.md` §2]. FY27: consensus ($220.91M / $1,284.62M) [`earnings/04_guidance-consensus.md` §4]. FY28–terminal: **analyst assumption** — held at 17.0%, between the TTM trough (16.9%) and FY2024 (20.2%); explicitly **not** management's own "~20%" aspirational target and **not** the FY2021 peak (Cyclicality Gate) |
| less: fading integration/restructuring add-back (re-inserted as a real cost) | 1.5% | 1.0% | 0.5% | 0.0% | 0.0% | 0.0% | 0.0% | **Analyst assumption** — OWYN-deal integration expense has recurred every period since FY2024 ($20.9M FY25, $5.2M in a single FQ3 FY26 quarter alone) [`earnings/06_earnings-quality.md` §4]; modeled to wind down over 3 years (deal is 2+ years old by FY2028), not treated as permanent |
| D&A (% of revenue) | 1.3% | 1.4% | 1.5% | 1.5% | 1.5% | 1.5% | 1.5% | **Analyst assumption** — capex has quadrupled (FY2025 $20.5M vs FY2021–24 average ~$7M) and D&A "has not yet hit the P&L" from that step-up [`earnings/03_margin-drivers.md` §9]; modeled to rise from FY2025's 1.2% toward 1.5% as the new capex is placed in service |
| Normalized EBIT margin % (= above minus D&A) | 13.7% | 14.8% | 15.0% | 15.5% | 15.5% | 15.5% | 15.5% | Agent calculation from the rows above |
| Tax rate % | 25% | 25% | 25% | 25% | 25% | 25% | 25% | **Normalized, reconciled to `business-model/09_moat.md` §3's canonical rate.** Moat's economic-moat test WAS assessable and published 25% as the average of FY22 (27.9%), FY23 (24.0%), FY24 (25.1%), FY25 (23.8%), excluding the FY21 outlier and the impairment-distorted TTM. Matches company's own FY26 guidance ("roughly 25%") [`earnings/04_guidance-consensus.md` §2]. This DCF uses the **same** rate — no divergence |
| Capex (% of revenue) | 2.0% | 2.0% | 1.8% | 1.6% | 1.5% | 1.5% | 1.5% | FY26: guidance $25M–$30M midpoint $27.5M (transcript figure; the Guidance-tab vendor figure of $20M–$25M is flagged as conflicting in `earnings/04_guidance-consensus.md` §2, transcript preferred per source hierarchy) ≈ 2.0% of $1,350M. FY27–terminal: **analyst assumption**, fading toward 1.5% as the OWYN-facility investment cycle completes — still well above the pre-FY2025 historical average of 0.4–0.9% of revenue, i.e. NOT assumed to revert fully |
| Δ Working capital (% of revenue, revenue-linked) | 22.7% ratio, held | 22.7% | 22.7% | 22.7% | 22.7% | 22.7% | 22.7% | Net working capital held at **22.7% of revenue** = FY2025 actual ($329.1M / $1,450.9M) [`earnings/01_historical-financials.md` §1], applied to forecast revenue each year (revenue-linked driver, not a flat absolute). Cross-referenced to `earnings/06_earnings-quality.md` §3: DSO 39.7 / DIO 61.1 / DPO 27.0 days, cash-conversion cycle **lengthening** (+3.6 days over two years, entirely an inventory build) — holding the ratio flat is therefore a **conservative, not favorable**, simplification: if the CCC keeps lengthening, actual WC drag could be worse than modeled here |
| SBC (% of revenue, deducted at the FCF line, not embedded in EBIT margin) | 1.2% | 1.2% | 1.2% | 1.2% | 1.2% | 1.2% | 1.2% | **Analyst assumption**, close to the FY2025 actual (1.05%) and FY2024 actual (1.38%) [`earnings/06_earnings-quality.md` §4]; held flat as a recurring dilution cost |

**Working-capital sign check:** in FY2026–FY2027, revenue is **falling** while the NWC ratio is held flat — this **releases** cash (−$22.6M and −$13.8M respectively, i.e. NWC itself shrinks in dollar terms), which correctly **adds** to FCF in those two years. From FY2028 onward, revenue resumes growing, so the same held ratio now **absorbs** cash (+$2.9M to +$9.3M), correctly **subtracting** from FCF. This is the modeled `ΔNWC = NWC_t − NWC_{t-1}` read directly off the forecast NWC path, not inferred from the growth direction alone — sign confirmed correct in both directions.

## 3. Discount Rate (WACC)

No company-disclosed WACC or hurdle rate exists anywhere in the pool [`business-model/09_moat.md` §3]. Built via CAPM — **Inference, not from filings** — using the same risk-free rate, ERP, and cost-of-debt inputs the moat module already sourced, so this figure and the moat module's own cost-of-capital cross-check do not diverge (Gate 4).

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.6% | 10-year US Treasury yield, 2026-08-05 [Web: tradingeconomics.com, accessed 2026-08-06 — dated, unverified; same figure `business-model/09_moat.md` §3 already used] |
| Equity risk premium | 5.5% | Standard mature-market assumption, not company-specific [`business-model/09_moat.md` §3] |
| Beta (peer-median, used) | 0.36 | Nine named peer betas (0.32–0.83, excluding two near-zero/negative large-cap outliers) [Company Comparable Analysis workbook, Operating Statistics tab, as-of 2026-07-24]. SMPL's own 5-year CIQ beta is **0.13** — flagged as an outlier likely depressed by the stock's own idiosyncratic 2026 collapse (52-week range $10.12–$33.44), not a genuine low-risk signal; per the conservative default, the peer-median beta is used, not SMPL's own |
| Size premium | +3.0% | Duff & Phelps/Kroll-style small-cap size premium for a ~$1.0bn market-cap company — not company-disclosed. **Included in the primary cost-of-equity build below** (not layered on afterward as a discretionary override), because SMPL's own beta and even the peer-median beta plainly understate the company's risk given its 68/100 earnings-volatility score [`earnings/07_earnings-sensitivity.md` §7], "No moat proven" verdict, and RF-EQ-001 accrual flag [`business-model/09_moat.md` §5; `earnings/06_earnings-quality.md` §6] |
| **Cost of equity (kₑ = rf + β×ERP + size premium)** | **9.58%** | 4.6% + (0.36×5.5%) + 3.0% = 4.6% + 1.98% + 3.0% = 9.58% |
| *(Cross-check, no size premium: kₑ = rf + β×ERP)* | *6.58%* | *4.6% + 1.98% — shown as a lower-bound sensitivity, not used as the primary figure* |
| Pre-tax cost of debt | 5.65% | SOFR 3.65% (2026-08-03) [Web: sofrrate.com, accessed 2026-08-06] + 2.00% Term Loan margin [FY2025 10-K, Note 7, "2025 Repricing Amendment"] |
| Tax rate (for the debt tax shield) | 25% | Same normalized rate as §2/NOPAT — no mixing of rates |
| After-tax cost of debt | 4.24% | 5.65% × (1 − 0.25) |
| Equity / debt weights (market value) | 69.1% / 30.9% | Market cap $1,002.26M [`valuation/01_price-and-capital-structure.md` §3] / Total debt $448.46M (funded debt $397.04M + operating lease liabilities $51.43M) [`valuation/01_price-and-capital-structure.md` §4]. $1,002.26M / $1,450.72M = 69.1%; $448.46M / $1,450.72M = 30.9% |
| **WACC (used)** | **7.93%** | 0.691 × 9.58% + 0.309 × 4.24% = 6.62% + 1.31% = 7.93% |

**Formula (pinned, executed — not eyeballed):**
```
WACC = w_e·k_e + w_d·k_d·(1-t)
k_e  = rf + beta*ERP + size_premium
    = 0.046 + 0.36*0.055 + 0.03 = 0.0958  (9.58%)
k_d_after = 0.0565*(1-0.25) = 0.0424     (4.24%)
w_e = 1002.26/(1002.26+448.46) = 0.6909
w_d = 448.46/(1002.26+448.46)  = 0.3091
WACC = 0.6909*0.0958 + 0.3091*0.0424 = 0.0793   (7.93%)
```
Output: `WACC used=0.0793 (7.93%); WACC base CAPM (no size prem)=0.0586 (5.86%); ke=0.0958; kd_after=0.0424; we=0.6909; wd=0.3091`

**Sanity bound (Gate 4):** `after-tax kd (4.24%) ≤ WACC (7.93%) < ke (9.58%)` — **holds, with comfortable room on both sides** (not a tight, assembly-error-prone band). SMPL is a ~$1.0bn small-cap, not a developed-market mega-cap, so the "kₑ above rf + 1.4×ERP needs justification" mega-cap clause does not apply — if anything a small-cap with a 68/100 earnings-volatility score and a "No moat proven" verdict warrants a higher, not lower, discount rate than a plain market-beta CAPM would produce.

**Cross-check against the moat module (Gate 4):** `business-model/09_moat.md` §3 independently built a "base WACC" (peer-median beta, no size premium) of **5.8%** and a "size-adjusted WACC" of **~7.8%**, explicitly calling the size-adjusted figure "more realistic" for a company of this market cap. This report's 7.93% sits **0.13pp from moat's own 7.8% size-adjusted figure** — no material divergence, Gate 4 cross-check satisfied without needing a spanning grid. The pure-CAPM 5.86% figure is shown only as a lower-bound sensitivity anchor (used in the low-WACC column of §7), not as a separately-computed WACC that this report then "overrides" — there is no override to bound at ±1.5pp because the size premium is built into the primary CAPM specification from the start, consistent with moat's own preferred figure.

## 4. Free Cash Flow Forecast & Discounting

USD millions. Mid-year discounting convention used throughout (cash flows assumed to arrive, on average, mid-period — discount factor = 1/(1+WACC)^(t−0.5)).

| Year | Revenue | Norm. EBITDA¹ | EBIT | NOPAT | D&A | Capex | ΔWC | SBC | FCF | Disc. Factor (t−0.5) | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026 | 1,350.4 | 202.6 | 185.0 | 138.7 | 17.6 | 27.0 | −22.6 | 16.2 | 135.7 | 0.9626 | 130.6 |
| FY2027 | 1,289.6 | 208.9 | 190.9 | 143.1 | 18.1 | 25.8 | −13.8 | 15.5 | 133.7 | 0.8919 | 119.3 |
| FY2028 | 1,302.5 | 214.9 | 195.4 | 146.5 | 19.5 | 23.4 | +2.9 | 15.6 | 124.1 | 0.8263 | 102.5 |
| FY2029 | 1,328.5 | 225.9 | 205.9 | 154.4 | 19.9 | 21.3 | +5.9 | 15.9 | 131.3 | 0.7656 | 100.5 |
| FY2030 | 1,361.7 | 231.5 | 211.1 | 158.3 | 20.4 | 20.4 | +7.5 | 16.3 | 134.4 | 0.7094 | 95.4 |
| FY2031 | 1,402.6 | 238.4 | 217.4 | 163.1 | 21.0 | 21.0 | +9.3 | 16.8 | 136.9 | 0.6573 | 90.0 |

¹ Normalized EBITDA = company Adjusted EBITDA (§2 row 2) less the fading integration/restructuring re-insertion (§2 row 3). ΔWC shown with cash-effect sign already applied (negative = cash source/release; positive = cash use/absorption) — matches the §2 sign-check.

**Sum of PV of explicit FCFs = $638.2M.**

**Executed command and raw output:**
```
$ python3 dcf_smpl3.py  (excerpt)
(2026, t=1, FCF=135.66, DF=0.9626, PV=130.58)
(2027, t=2, FCF=133.73, DF=0.8919, PV=119.26)
(2028, t=3, FCF=124.06, DF=0.8263, PV=102.52)
(2029, t=4, FCF=131.26, DF=0.7656, PV=100.50)
(2030, t=5, FCF=134.42, DF=0.7094, PV=95.36)
(2031, t=6, FCF=136.95, DF=0.6573, PV=90.01)
pv_sum = 638.24
```

## 5. Terminal Value

**Financeable-growth cross-check (Economic Consistency Gate 2) — run BEFORE picking terminal g.** Reinvestment rate = `(capex − D&A + ΔNWC) / NOPAT`; implied growth = ROIC × reinvestment rate, with terminal ROIC set to WACC (7.93%) per the "No moat proven" fade rule below.
- At an initial candidate g = 3.0% (a plain nominal-GDP default): reinvestment rate = 5.86%, implied growth = 7.93% × 5.86% = **0.46%** — a **2.54pp gap** versus the modeled 3.0%, well past the 1.5pp trigger.
- At g = 1.0%: reinvestment rate = 1.95%, implied growth = 7.93% × 1.95% = **0.15%** — a **0.85pp gap**, under the 1.5pp trigger.
- **Action taken (per the Gate 2 "teeth"):** terminal g is **lowered from the initial 3.0% nominal-GDP default to 1.0%**, because the modeled reinvestment (capex ≈ D&A in the terminal year — no net capacity growth capex is modeled — plus only modest NWC growth) cannot finance more than roughly 1% of perpetual growth once ROIC is faded to WACC. The residual 0.85pp gap is not separately quantified here (SMPL's brand/marketing-driven growth is expensed through SG&A, not capitalized, so some real growth capacity is not captured by the capex/NWC formula) and is accepted as under-threshold, not bridged further.

**No-moat terminal fade (moat trigger, §5 structural rule).** `business-model/09_moat.md` §5 verdict is **"No moat proven"** — an unproven, not necessarily decaying, franchise. Per the rule, the BASE terminal carries **no perpetual excess return**: terminal ROIC is faded to WACC (7.93%, essentially where SMPL's own through-cycle ROIC of 7.0–8.8% already sits — moat §3) and g is faded to the financeable ~1.0% level derived above, not to a moat-premium nominal-GDP rate.

- **Gordon growth formula:** `TV = FCFF_{n+1} / (WACC − g) = FCF_2031 × (1+g) / (WACC − g) = 136.9 × 1.01 / (0.0793 − 0.01) = 138.3 / 0.0693 = $1,996.4M` (undiscounted, as of end-FY2031).
- `WACC − g = 6.93pp` — comfortably positive, not near-zero; no grid cell in §7 approaches the divide-by-zero boundary (checked explicitly below).
- **PV of terminal value** = $1,996.4M × 1/(1.0793)^6 = $1,996.4M × 0.6327 = **$1,263.1M**.
- **Terminal value as % of total EV = $1,263.1M / $1,901.3M = 66.4%.** Below the 75% low-confidence threshold, but still the majority driver of value — flagged, not treated as disqualifying.

**Exit-multiple cross-check.** Implied terminal EV/Adjusted-EBITDA multiple = $1,996.4M / $238.4M (FY2031 Adjusted EBITDA) = **8.4x**. For comparison: SMPL's own **current spot EV/Adjusted-EBITDA (TTM) is 5.7x** ($1,326.84M / $234.6M [`valuation/01_price-and-capital-structure.md` §5]) — the Gordon TV therefore implies real multiple expansion from today's distressed level, though only to roughly where a stabilized, no-moat packaged-food business would be expected to trade (not back to a moat-premium multiple). Direct exit-multiple cross-checks:

| Exit multiple | TV (undisc.) | PV(TV) | EV | Equity | Per share |
|---|---:|---:|---:|---:|---:|
| 7.0x | $1,669.1M | $1,056.0M | $1,694.2M | $1,369.7M | $15.23 |
| **8.0x (≈ implied)** | **$1,907.5M** | **$1,206.9M** | **$1,845.1M** | **$1,520.5M** | **$16.91** |
| 9.0x | $2,146.0M | $1,357.7M | $1,995.9M | $1,671.4M | $18.58 |

The 8.0x cross-check ($16.91/share) sits close to the Gordon-formula base ($17.53/share, §6) — the two methods corroborate each other reasonably well once terminal g is corrected to the financeable level; they would NOT have corroborated at the original 3.0% g (Gordon would have implied a 12.0x exit multiple, more than double the current spot 5.7x, with no cross-check support).

**Structural-decline / runoff terminal (moat-trajectory trigger).** `business-model/09_moat.md` §5 separately states the **moat trajectory is "eroding"** (gross margin down in 4 of the last 5 years; CIQ return-on-capital drifting from ~7.1% to 6.0% TTM; SMPL losing share within its own dominant Quest segment even as the category grows). This is a second, independent trigger (alongside "No moat proven") requiring a declining-perpetuity terminal be built and shown alongside the base — **not** substituted for it. Nominal g is set at −1.0% (below expected US inflation, trending negative, stated on the same nominal basis as the rest of this model — not a real-rate concept smuggled in), with the terminal Adjusted EBITDA margin faded further to 14.5% (below the TTM trough of 16.9%, reflecting continued, non-recovering share loss rather than the base case's stabilization at 17.0%):

- Runoff-year FCF (last explicit-forecast-year economics, faded margin) = **$123.1M**; FCF_{n+1} = $123.1M × 0.99 = $121.9M
- `TV = 121.9 / (0.0793 − (−0.01)) = 121.9 / 0.0893 = $1,365.0M` (undiscounted)
- PV(TV) = $1,365.0M × 0.6327 = **$863.6M**
- EV = $638.2M (same explicit PV, unchanged) + $863.6M = **$1,501.9M**
- Equity = $1,501.9M − $324.58M net debt = **$1,177.3M**
- **Per share = $13.09**

This runoff case is the **structural-impairment / bear input** that feeds `07_scenario-and-fair-value`'s structural-reset bear case and the master synthesizer's Kill Criteria — it is shown here as a labeled alternative, not folded into or replacing the single base-case point in §6.

## 6. DCF Output

| Step | Value |
|---|---:|
| PV of explicit FCFs (FY2026–FY2031) | $638.2M |
| + PV of terminal value (Gordon, g=1.0%, no-moat fade) | $1,263.1M |
| **= Enterprise value** | **$1,901.3M** |
| − Net debt | $324.6M |
| − Minority / preferred | $0 (none disclosed) [`valuation/01_price-and-capital-structure.md` §4] |
| **= Equity value** | **$1,576.7M** |
| ÷ Diluted shares (fully diluted, per `01`) | 89,934,884 |
| **= Intrinsic value per share** | **$17.53** |
| vs current price ($11.33, pool-verified, close 2026-08-04) | **+54.7%** |

**Executed bridge snippet:**
```
EV = pv_sum(638.24) + pv_tv(1263.05) = 1901.29
equity = EV(1901.29) - net_debt(324.58) = 1576.71
per_share = equity(1576.71) / shares(89.934884) = 17.53
upside = (17.53-11.33)/11.33 = 54.7%
```

## 7. Sensitivity Grid (per-share intrinsic value)

WACC across columns (base 7.93%, ±1pp), terminal growth down rows (base 1.0%, ±0.5pp — the financeable-growth-corrected base, not the original 3.0% default):

| | WACC 6.93% | WACC 7.93% (base) | WACC 8.93% |
|---|---:|---:|---:|
| g = 1.5% | $22.72 | $18.70 | $15.76 |
| g = 1.0% (base) | $21.03 | **$17.53** | $14.92 |
| g = 0.5% | $19.60 | $16.52 | $14.18 |

**Guard check:** the tightest cell (WACC 6.93%, g 1.5%) has `WACC − g = 5.43pp` — comfortably positive; no cell in this grid approaches the divide-by-near-zero boundary, so no cell is marked NM.

Separately, the runoff/declining-perpetuity terminal (§5) produces **$13.09/share** at the base WACC — shown here as the structural-bear anchor, not a grid cell (it uses a different, negative g and a different terminal margin, not a mechanical flex of the base-case grid).

## 8. Intrinsic Read

**Base-case intrinsic value: $17.53/share** (Gordon-growth DCF, WACC 7.93%, terminal g 1.0% after the Gate-2 financeable-growth correction from an initial 3.0% default; corroborated by an independent 8.0x exit-multiple cross-check at $16.91/share). The sensitivity grid disperses this point from **$14.18 to $22.72** across a ±1pp WACC and ±0.5pp terminal-growth flex, with a separate structural-decline (runoff) case at **$13.09/share** if the moat module's "eroding" trajectory finding continues unchecked into a permanent share-loss path. All three reads sit above the current price ($11.33), but the dispersion is wide relative to the gap to price — this is a "no moat proven, ROIC roughly at cost of capital" business where the DCF's own terminal-value share (66.4% of EV) means the answer is dominated by a modest handful of forward-looking assumptions, not a high-confidence cash-flow certainty. The single assumption this value is most sensitive to is **terminal growth/reinvestment financeability**: the raw Gordon formula at a plain 3.0% nominal-GDP default would have implied $23.62/share (a 12.0x exit multiple, more than double SMPL's own current 5.7x spot multiple, with no independent cross-check support) — only the Gate-2 financeable-growth correction down to 1.0% brought the base case into a range corroborated by the exit-multiple lens.
