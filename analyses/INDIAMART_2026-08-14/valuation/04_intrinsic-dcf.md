# Intrinsic DCF — INDIAMART

**Business type:** Operating (India-focused, subscription-funded B2B online marketplace; single reportable segment, Web and Related Services, at 91.96% of FY26 revenue) [`00_valuation-data-triage.md` §6A]. The Business-Type Method Map (`MODULE_RULES.md`) makes an FCFF DCF the correct primary intrinsic method here — this is not a Financial, REIT, Commodity, or Holding-company business, so no method substitution is required.

**Jurisdiction / reporting standard / currency:** India, NSE: INDIAMART / BSE: 542726. Ind AS (Indian Accounting Standards, Companies Act 2013). Reporting currency INR. Fiscal year ends 31 March ("FY26" = year ended 31-Mar-2026). All figures in **₹ million** unless a crore (₹1 crore = ₹10 million) equivalent is given alongside for readability.

**Canonical inputs this DCF hands to `05_reverse-dcf` (per MODULE_RULES Calculation Standard 9):** normalized FCF base methodology (NOPAT-and-driver-built, §1/§4), normalized tax rate 25.17%, WACC 10.0% (used; 8.7% mechanically computed — see §3), and the two terminal methods in §5. `05` must invert this same model, not re-derive its own.

---

## 1. FCF Base & Normalizations

**FCFF identity used (MODULE_RULES Economic Consistency Gate 1):** `FCFF = NOPAT + D&A − Capex − ΔNWC`, built from the income statement and balance sheet rather than `CFO − capex`, because the multi-year forecast requires an explicit revenue/margin path that only the income-statement build supports. The base-year figure is cross-checked against the reported `CFO − capex` figure below (MODULE_RULES's preferred definition when a cash-flow statement exists) as a sanity check, not the forecast anchor.

| Item | Base-Year (FY26) Value | Normalization Applied | Source |
|---|---:|---|---|
| Reported FCF (CFO − total capex) | ₹6,872.19mn (₹687.2cr) | None — headline reported figure | `earnings/01_historical-financials.md` §1; Capital IQ Cash Flow tab |
| EBIT (FY26) | ₹5,015.93mn | None — reported | `earnings/01_historical-financials.md` §1 |
| Normalized tax rate | 25.17% | India's statutory corporate rate, used in place of FY26's reported effective rate (26.74%, itself distorted by a shrinking lower-tax-income benefit and rising unrecognized losses at the loss-making Busy Infotech/Livekeeping subsidiaries) [`business-model/09_moat.md` §3, citing FY26 Annual Report Note 26(c)]. **This is the canonical rate the moat module's own economic-moat NOPAT reconciles to (its §3 test was assessable) — this DCF reconciles to it rather than deriving an independent figure**, per MODULE_RULES workflow step 3. | `business-model/09_moat.md` §3 |
| NOPAT (FY26, constructed) | EBIT × (1 − 0.2517) = **₹3,753.42mn** | Applies the normalized rate above to reported EBIT | Computed (matches moat module's own ₹3,753.4mn cross-check exactly) |
| D&A (FY26) | ₹190.01mn (EBITDA₹5,205.94mn − EBIT₹5,015.93mn) | None | `earnings/01_historical-financials.md` §1 |
| Capex (FY26) | ₹70.00mn (0.45% of revenue) | None — trivial, asset-light | `earnings/01_historical-financials.md` §1 |
| ΔNWC (FY26, actual, operating-cash-flow-statement basis) | −₹2,843.21mn (a cash **source** — NWC became more negative) | None — reported CFO-bridge line | `earnings/06_earnings-quality.md` §1 |
| **FCFF (FY26, constructed) = NOPAT + D&A − Capex − ΔNWC(actual)** | 3,753.42 + 190.01 − 70.00 − (−2,843.21) = **₹6,716.64mn** | Reconciles to reported CFO−capex (₹6,872.19mn) within **~2.3%** (₹155.6mn) — the gap is the normalized-tax-rate vs. actual-cash-tax difference plus small non-cash reconciling items (SBC add-back, share of associate losses). Not a material unexplained gap. | Computed, executed snippet (§4) |

**Material normalization flagged for the forecast (read before §2/§4).** FY26's reported FCF benefited from an **acceleration**, not a steady-state level, of deferred-revenue growth: Unearned Revenue grew +17.1% in FY26, outpacing the +13.02% revenue growth, and `earnings/06_earnings-quality.md` §1 already flags that once this float-growth effect is stripped out, "ex-deferred-revenue-growth" operating FCF grew only **+5.8%** in FY26 versus **+41.5%** in FY25 — i.e., the structural cash-source benefit from the negative-working-capital model is *decelerating*. This DCF's working-capital forecast (§2, §4) normalizes the NWC/revenue ratio to a **flat** (not perpetually widening) level going forward, consistent with that finding — meaning Year-1 forecast FCFF is **lower** than the FY26 base-year actual. This is a deliberate, cited normalization, not an error; it is itemized again in §4.

**No cash-flow-statement or forward-estimate partial-data caps apply** — a full 5-year audited cash flow statement and 15–18-analyst consensus exist in the pool [`00_valuation-data-triage.md` §3, §5]. Confidence is, however, capped by two other factors flagged through this report: (1) an unusually wide dispersion in the sourced beta (§3), and (2) a structurally atypical (negative, asset-light) reinvestment profile that makes the standard financeable-growth cross-check (§4) not directly interpretable (bridge explained, not a data gap).

---

## 2. Forecast Assumptions

**Horizon: 8 explicit years (FY27–FY34)**, chosen because the business is still decelerating from a high-growth base and an 8-year fade gives the margin/growth path room to converge toward a defensible terminal state without an artificially short runway.

| Assumption | FY27 (Yr1) | FY28 (Yr2) | FY29 (Yr3) | FY30 (Yr4) | FY31 (Yr5) | FY32 (Yr6) | FY33 (Yr7) | FY34 (Yr8) | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 9.6% | 8.5% | 7.5% | 7.0% | 6.5% | 6.2% | 6.0% | 5.8% | 5.5% | Yr1 = **Street consensus** (15 analysts, ₹17,201.93mn FY27E, +9.6% YoY) [`earnings/04_guidance-consensus.md` §3]. Yr2–8 and terminal: **analyst assumption, not company-guided** — a continued fade of the observed 30.8%→21.5%→16.0%→13.0%→12.75%(TTM)→11.4%(latest qtr) deceleration trend [`earnings/01_historical-financials.md` §1, §2, §3], converging toward, but staying below, India's long-run nominal-GDP proxy (~10–11%) |
| EBIT margin % | 31.9% | 31.0% | 30.2% | 29.6% | 29.1% | 28.7% | 28.4% | 28.2% | 28.0% | Yr1: roughly flat vs FY26's 31.97%, consistent with consensus FY27 EBITDA margin (~33.9%, "roughly flat" vs FY26's 33.8%) [`earnings/04_guidance-consensus.md` §3]. Yr2–terminal: **analyst assumption**, fading toward a Cyclicality-Gate-benchmarked terminal (see note below) |
| Tax rate % | 25.17% | 25.17% | 25.17% | 25.17% | 25.17% | 25.17% | 25.17% | 25.17% | 25.17% | Normalized statutory rate, canonical anchor shared with `business-model/09_moat.md` §3 (§1 above) |
| Capex (% of revenue) | 0.5% | 0.5% | 0.5% | 0.5% | 0.5% | 0.5% | 0.5% | 0.5% | 0.5% | **Analyst assumption** — modestly above FY26's 0.45% actual, allowing for some tech-capex growth; capex has never exceeded 1.75% of revenue in 5 years and is immaterial to FCF in every year [`earnings/01_historical-financials.md` §1] |
| Δ Working capital (% of revenue, applied to Δrevenue) | −82.3% of Δrev | (same ratio) | (same ratio) | (same ratio) | (same ratio) | (same ratio) | (same ratio) | (same ratio) | (same ratio) | Operating NWC (current assets ex-cash/investments − current liabilities) = **−₹12,916.52mn at FY26** = **−82.3% of FY26 revenue** [`earnings/01_historical-financials.md` fn.4]. Held **flat** as a ratio-to-revenue for the whole forecast (see normalization note in §1) — **analyst assumption**, not a company-disclosed driver |

**Terminal margin — Cyclicality Gate benchmarking (MODULE_RULES Economic Consistency Gate 6).** External-dependency flags two High-dependency rows (Consumer/SME cycle, Geopolitics) for this business [`business-model/10_external-dependency.md` §1], so a single-point margin assumption is not enough — the terminal margin is benchmarked against BOTH anchors:
- **Peer-normal:** Just Dial (the one named peer with disclosed, filing-comparable margins) runs a **25.3% LTM EBIT margin** [`business-model/09_moat.md` §3, Company Comparable Analysis, Operating Statistics tab].
- **Company's own prior-trough:** IndiaMART's own EBIT margin bottomed at **24.44% (FY23) / 24.64% (FY24)** during its FY23 cost build-out [`earnings/01_historical-financials.md` §1].
- **Terminal EBIT margin used: 28.0%** — above both anchors by a modest, evidenced premium (+270bps over peer-normal, +336bps over the company's own trough), justified by the moat module's own (fragile) finding of a +248bps excess return over WACC on the base-case CAPM estimate [`business-model/09_moat.md` §3] — but well below FY26's actual 31.97%, and far below the FY25 "snapback" peak of 35.45% and the FY22 pandemic-era high of 39.27% [`earnings/01_historical-financials.md` §1]. Management itself describes the FY26/Q1 FY27 margin level as "elevated" from a temporary customer-acquisition-spend pullback [`earnings/03_margin-drivers.md` §8], so this DCF does **not** extrapolate the current level forward — it fades toward the peer/trough-anchored range instead.

**Working-capital driver — revenue-linked, not a flat absolute.** IndiaMART is a **negative-working-capital business** (customers prepay annual/multi-year subscriptions, so Unearned Revenue funds operations) — operating NWC was **−₹12,916.52mn at FY26 (−82.3% of revenue)** [`earnings/01_historical-financials.md` fn.4]. The forecast holds this ratio flat and applies it to each year's incremental revenue (`ΔNWC_t = ratio × (Revenue_t − Revenue_{t−1})`), so the cash-source effect scales with revenue growth as required, rather than being a flat rupee figure. This is a deliberate **normalization** relative to history — the ratio itself had been drifting more negative every year (deferred revenue growing faster than revenue) — flagged and cited in §1.

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 6.85% | India 10-year G-Sec yield [Web: BusinessToday, 2026-08-05, "10 year G Sec yield climbs to 6.85% in July" — dated, unverified; cross-checked against a live Aug-2026 quote of ~6.78–6.79% (Web: TradingEconomics, 2026-08-12) — same order of magnitude, 6.85% retained as the sourced figure already anchoring the cross-module moat estimate] |
| Equity-risk premium (India) | 7.31% | Damodaran India country equity-risk-premium dataset, July 2026 update [Web, dated, unverified — same figure already used in `business-model/09_moat.md` §3] |
| Beta — **computed input** (mechanical) | 0.26 | Capital IQ Public Company Profile export / 5-year monthly beta, corroborated by Yahoo Finance (0.24, 5Y monthly) [Web: Yahoo Finance, INDIAMART.NS, 2026-08-14] |
| Beta — **used input** (see override below) | 0.44 | Median of three independently-sourced betas: Yahoo Finance 0.24, SimplyWallSt 0.44, TradingView 0.91 [Web, all 2026-08-14, unverified] |
| Cost of equity — computed (β=0.26) | 6.85% + 0.26 × 7.31% = **8.75%** | CAPM |
| Cost of equity — used (β=0.44) | 6.85% + 0.44 × 7.31% = **10.07%** | CAPM |
| Pre-tax cost of debt | 7.5% | **Analyst assumption** — the company carries no bank borrowings (its only "debt" is ₹216.28mn of capitalized lease liabilities) [`valuation/01_price-and-capital-structure.md` §4]; 7.5% is a representative India investment-grade corporate-lease financing rate. Immaterial to the blend given the weight below. |
| Tax rate (for the debt tax shield) | 25.17% | Same normalized rate as §1/§2 |
| Equity / debt weights (market value) | 99.03% equity / 0.97% debt | Total Debt/Capital ≈0.97% at FY26-end [`business-model/09_moat.md` §3, citing Capital IQ Ratios tab] |
| **WACC — computed (mechanical, β=0.26)** | **8.72%** | `0.9903 × 8.75% + 0.0097 × 7.5% × (1−0.2517)` |
| **WACC — used (β=0.44)** | **10.02%** (rounded 10.0%) | `0.9903 × 10.07% + 0.0097 × 7.5% × (1−0.2517)` |

**Formula (pinned, executed):** `WACC = w_e·k_e + w_d·k_d·(1 − t)`. No preferred equity exists, so no `w_p·k_p` term. `k_e = risk-free rate + beta × ERP` (CAPM). `w_e`/`w_d` are market-value weights of equity/debt and sum to 1.00. `t` is the same 25.17% normalized rate used for NOPAT.

**WACC override — shown, justified, bounded (MODULE_RULES override discipline).** The pool/CIQ-sourced beta (0.26) sits at the extreme low end of a genuinely wide 0.24–0.91 dispersion across three independently-sourced vendors (Yahoo 0.24, SimplyWallSt 0.44, TradingView 0.91) — and `business-model/09_moat.md` §3 *itself* already flags this specific beta as "unusually low… not robust," noting that a "more conventional beta" (0.8–1.0) for a comparable small/mid-cap Indian internet name would push cost of equity to 12.7–14.2%. Combined with this business's High-flagged Consumer/SME-cycle and Geopolitics external-dependency rows [`business-model/10_external-dependency.md` §1] and a 66/100 (inverted — high) earnings-volatility score [`earnings/07_earnings-sensitivity.md` §7], a beta of 0.26 is not credible as the sole input. This DCF therefore **uses the median of the three sourced betas (0.44)** rather than the single lowest one. **Override magnitude: 10.02% − 8.72% = 1.30pp — within the ±1.5pp cap.**

**Cross-check against the moat module's inferred cost of capital (Gate 4).** The moat module's own base-case WACC (8.75%, β=0.26) is within 1.27pp of the used WACC here (10.02%) — consistent, no action needed. But the moat module's own flagged **alternative** ("conventional beta," WACC ≈12.7–14.2%) diverges from the used WACC by **2.7–4.2pp — over the 2pp threshold**. Per Gate 4, this is handled by **spanning both in the sensitivity exhibit** rather than silently picking one: §7 shows the standard ±1% grid around the used WACC, and a labelled addendum shows the DCF result at WACC = 13.0% (the midpoint of the moat module's flagged conventional-beta range).

**Sanity bounds (Gate 4, executed check):**
```
after-tax k_d = 7.5% × (1 − 0.2517) = 5.61%
k_e (used)     = 10.07%
WACC (used)    = 10.02%
Check: after-tax k_d (5.61%) ≤ WACC (10.02%) < k_e (10.07%)  → PASSES (WACC sits just under k_e,
  appropriate given the ~99% equity weight — this is a near-all-equity-financed company).
```
India is not a developed-market (USD/EUR/GBP) economy, so the `rf + 1.4×ERP` mega-cap ceiling test does not apply; no separate justification trigger fires there.

**Terminal growth vs WACC:** used WACC (10.02%) − terminal g (5.5%, §5) = **4.52pp**, comfortably positive — no near-zero-denominator risk in the base case (checked again per-cell in §7).

---

## 4. Free Cash Flow Forecast & Discounting

**Discounting convention: mid-year** (cash flows assumed to arrive, on average, mid-period — discount factor `1/(1+WACC)^(t−0.5)` for the explicit years). The terminal value, being a *value* as of the end of Year 8 rather than a flow, is discounted at the **full** Year-8 factor (`1/(1+WACC)^8`) — standard practice combining mid-year flows with an end-of-period terminal stock value.

| Year | Revenue | EBIT | NOPAT | D&A | Capex | ΔNWC (cash effect) | FCFF | Discount Factor (t) | PV of FCFF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY27 (Yr1) | 17,196.7 | 5,485.7 | 4,105.0 | 189.2 | 86.0 | −1,240.0 | 5,448.2 | 0.9534 (t=0.5) | 5,194.1 |
| FY28 (Yr2) | 18,658.4 | 5,784.1 | 4,328.2 | 205.2 | 93.3 | −1,203.3 | 5,643.5 | 0.8665 (t=1.5) | 4,890.2 |
| FY29 (Yr3) | 20,057.8 | 6,057.5 | 4,532.8 | 220.6 | 100.3 | −1,152.0 | 5,805.1 | 0.7876 (t=2.5) | 4,571.9 |
| FY30 (Yr4) | 21,461.8 | 6,352.7 | 4,753.7 | 236.1 | 107.3 | −1,155.8 | 6,038.3 | 0.7158 (t=3.5) | 4,322.4 |
| FY31 (Yr5) | 22,856.9 | 6,651.3 | 4,977.2 | 251.4 | 114.3 | −1,148.4 | 6,262.7 | 0.6506 (t=4.5) | 4,074.6 |
| FY32 (Yr6) | 24,274.0 | 6,966.6 | 5,213.1 | 267.0 | 121.4 | −1,166.6 | 6,525.4 | 0.5913 (t=5.5) | 3,858.7 |
| FY33 (Yr7) | 25,730.4 | 7,307.4 | 5,468.2 | 283.0 | 128.7 | −1,199.0 | 6,821.5 | 0.5375 (t=6.5) | 3,666.3 |
| FY34 (Yr8) | 27,222.8 | 7,676.8 | 5,744.6 | 299.5 | 136.1 | −1,228.5 | 7,136.4 | 0.4885 (t=7.5) | 3,486.2 |

**Sum of PV of explicit FCFs: ₹34,064.4mn**

**Working-capital sign — checked.** IndiaMART is a negative-working-capital business (NWC = −82.3% of revenue). With the ratio held flat, revenue growth pushes NWC further negative every year (ΔNWC is negative in every row above), which under `FCFF = NOPAT + D&A − Capex − ΔNWC` **adds** cash to FCF each year (a negative ΔNWC subtracts a negative number). This matches the sign the growth+held-ratio combination should produce — verified against the sign-check rule, not inverted.

**Financeable-growth cross-check (Gate 2) — bridge quantified, not left hanging.**
```
Reinvestment rate (FY26, actual) = (Capex − D&A + ΔNWC) / NOPAT
                                  = (70.00 − 190.01 + (−2,843.21)) / 3,753.42
                                  = −2,963.22 / 3,753.42 = −78.95%
Implied growth = ROIC (5-yr avg, 11.23%, gross-capital basis per `business-model/09_moat.md` §3) × reinvestment rate
               = 11.23% × (−78.95%) = −8.87%
```
This is **~14.4pp below** the modeled terminal g (5.5%) — far outside the ~1.5pp tolerance. The bridge: this ROIC-reinvestment formula is built for capital-intensive growth (fixed-asset/greenfield reinvestment funding future output) and is **structurally not the right lens for an asset-light, negative-working-capital subscription marketplace** — IndiaMART's growth is financed almost entirely through **P&L operating expense already embedded in the modeled EBIT margin fade** (customer-acquisition spend, customer-support/verification cost, technology spend — all itemized as expensed opex, not capitalized investment, in `earnings/03_margin-drivers.md` §2), not through capex or working-capital consumption. Capex is 0.5% of revenue and NWC is a persistent cash **source**, not a use, so the mechanical formula will always show a deeply negative "reinvestment rate" for this business model regardless of how fast it is actually growing — a structural feature, not an unexplained gap. Per Gate 2's own text, **because the bridge is quantified and explained here**, terminal g is not mechanically forced down to −8.87%. As an additional, independent conservatism check, however, this DCF's **headline base case uses the lower of its two terminal methods** (§5/§6) rather than the richer one — the practical effect of the same conservative-default instinct the Gate is designed to enforce.

**ROIC drift (Gate 3):** a standard ROIC-vs-WACC drift check is not directly meaningful here either — IndiaMART's net-of-cash invested capital is **negative** (cash and treasury investments exceed total debt+equity capital), so ROIC on that basis is undefined [`business-model/09_moat.md` §3]. The terminal EBIT margin (28.0%, §2) is the operative discipline instead: it sits only modestly above the peer/trough-anchored range, not at a level implying large, durable persistence of excess returns — consistent with the moat module's own "narrow, borderline" verdict (§5 below).

**Executed snippet (WACC blend, PV-of-FCFF sum, and the components above) — command and raw output:**
```
$ python3 dcf_indiamart.py
D&A0 190.01 NWC ratio -82.32 %
NOPAT0 3753.42
FCFF0 constructed (NOPAT+D&A-Capex-dNWC_actual) 6716.64
Reported CFO-Capex FY26 6872.19  diff: 155.55  pct: 2.26

Reinvestment rate FY26 (capex - D&A + dNWC)/NOPAT: -78.95 %
Implied growth (ROIC x reinvestment rate): -8.87 %

ke computed (beta 0.26): 8.75 %  WACC computed: 8.72 %
ke used (beta 0.44): 10.07 %  WACC used: 10.02 %
Override delta (pp): 1.3
After-tax kd: 5.61 %

Sum PV of explicit FCFF: 34064.4
```

---

## 5. Terminal Value

Two methods are built and cross-checked, per the report structure's requirement to sanity-check one against the other.

**Method A — Gordon growth:**
`TV = FCFF_{n+1} / (WACC − g) = FCFF_8 × (1 + g) / (WACC − g)`
```
FCFF Yr9 (terminal) = 7,136.4 × 1.055 = 7,528.9
TV (undiscounted) = 7,528.9 / (0.1002 − 0.055) = 7,528.9 / 0.0452 = 166,451.9
Discount factor (Yr8, full-year) = 1/(1.1002)^8 = 0.4657
PV of Terminal Value (Gordon) = 166,451.9 × 0.4657 = 77,520.2
```
`WACC − g` = 4.52pp, comfortably positive — no near-zero-denominator risk in the base case.

**Cross-check — implied exit multiple (required before trusting the Gordon number).** Terminal-year (Yr9) EBITDA = EBIT₉ (₹8,099.1mn) + D&A₉ (₹315.9mn) = **₹8,415.0mn**. The Gordon TV of ₹166,451.9mn implies an exit multiple of **166,451.9 / 8,415.0 = 19.78x EV/EBITDA** — this is **richer than IndiaMART's own current actual trading multiple of ~14.15x** (EV(broad) ₹73,644.05mn / FY26 EBITDA ₹5,205.94mn [`valuation/01_price-and-capital-structure.md` §4]), despite the terminal-year business being *more mature and slower-growing* (5.5% terminal growth vs FY26's 13.0%; 28.0% terminal EBIT margin vs FY26's 31.97%). A slower, lower-margin, maturity-stage version of this business should not command a *richer* multiple than today's still-growing version — this is the exact cross-check divergence the report structure requires flagging, and it is flagged here rather than accepted at face value. The reason it arises mechanically: FCFF/EBITDA conversion is unusually high in this negative-working-capital, near-zero-capex model (~90% in the terminal year), so even a moderate `WACC−g` gap compounds into a rich implied multiple.

**Method B — Exit multiple (used as the base-case anchor, per the reconciliation above):**
`TV = terminal EBITDA × exit multiple`
```
Assumed terminal EV/EBITDA multiple: 12.0x — analyst assumption, set below IndiaMART's own current ~14.15x
  actual multiple to reflect the maturity/deceleration state (5.5% growth, 28.0% margin) modeled for Year 9,
  and consistent with the moat module's own "narrow, borderline" durability read (not a premium/growth multiple).
TV (undiscounted) = 8,415.0 × 12.0 = 100,979.6
PV of Terminal Value (exit-multiple) = 100,979.6 × 0.4657 = 47,026.2
```

**Reconciliation and headline choice.** Because the two methods diverge materially (Gordon implies a terminal multiple richer than today's actual, exit-multiple does not), and per MODULE_RULES Core Principle 6 ("when methods conflict, default to the lower fair value and say why"), **this report uses the exit-multiple method (12.0x) as the base-case terminal value**. The Gordon-growth result is retained and shown throughout as the upper-bound cross-check, not the headline.

| | PV of Terminal Value | Enterprise Value | **TV as % of EV** |
|---|---:|---:|---:|
| **Base case — Exit multiple (12.0x)** | 47,026.2 | 34,064.4 + 47,026.2 = **81,090.6** | **58.0%** |
| Cross-check — Gordon growth (g=5.5%) | 77,520.2 | 34,064.4 + 77,520.2 = **111,584.6** | **69.5%** |

Both are below the 75%-of-EV terminal-dominance flag threshold, though the Gordon cross-check (69.5%) sits close to it — a further reason this report leans on the exit-multiple anchor for the headline.

**Structural-decline / runoff terminal trigger — checked, not triggered.** Per the trigger rule: (a) fires only when `business-model/09_moat.md` returns **"No moat proven"** — this company's verdict is **"Narrow moat"** (a moat *is* evidenced, if fragile), so trigger (a) does not fire verbatim; (b) fires when moat trajectory is **"eroding"** OR `business-model/07_business-quality.md`'s rate-of-change score is **≤~40**. The moat module explicitly states trajectory is **"stable, with a specific near-term erosion warning"** — "stable," not "eroding," is the level call it makes — and the business-quality rate-of-change score is **45** (inside the Mixed band, above the ≤40 threshold) [`business-model/07_business-quality.md` §1]. **Neither trigger fires**, so no separate declining-perpetuity/runoff terminal is built here. The moat module's own named erosion risks (negative net supplier adds in 3 of the last 4 quarters, FY26 margin compression, the unsettled AI-search/agentic-commerce discovery layer) are already reflected in this DCF's conservative terminal-margin choice (28.0%, well below FY26's 31.97% and the FY25 peak of 35.45%) and in the choice of the lower (exit-multiple) terminal method — not ignored, but not escalated to a formal second bear terminal, since the specific trigger language is not met on the current evidence.

---

## 6. DCF Output

| Step | Value (₹mn) |
|---|---:|
| PV of explicit FCFs | 34,064.4 |
| + PV of terminal value (exit-multiple, base case) | 47,026.2 |
| **= Enterprise value (base case)** | **81,090.6** |
| − Net debt (broad basis, canonical per `01`, net **cash** of −33,670.3 as of 30-Jun-2026) | −(−33,670.3) = +33,670.3 |
| − Minority / preferred | 0 (none disclosed) [`valuation/01_price-and-capital-structure.md` §4] |
| **= Equity value (base case)** | **114,760.9** |
| ÷ Diluted shares (LTM weighted-average, per `01`'s canonical fair-value share count) | 60.29172mn |
| **= Intrinsic value per share (base case)** | **≈ ₹1,903.5** |
| vs current price (₹1,784.60, 2026-08-12 close, `01` anchor) | **+6.7%** (base case sits modestly above price) |
| Cross-check — Gordon-growth terminal, same EV→equity bridge | Equity ₹145,254.9mn → **≈ ₹2,409.2/share** (**+35.0%** vs price) — retained as an upper-bound cross-check, flagged in §5 as terminal-multiple-rich, not the headline |

**Executed snippet (EV → equity → per-share bridge, both methods):**
```
Net debt (broad, canonical): -33670.3 INR mn
Base case (12x exit multiple): EV=81092.7 Equity=114763.0 PerShare=Rs.1903.5  (TV%EV 58.0%)
Cross-check (Gordon g=5.5%):    EV=111584.5 Equity=145254.8 PerShare=Rs.2409.2 (TV%EV 69.5%)
```

**WACC-cross-check addendum (Gate 4, spanning the moat module's flagged "conventional beta" alternative, per §3):** at WACC = 13.0% (midpoint of the moat module's own 12.7–14.2% conventional-beta range) with the same 12.0x exit multiple, per-share value falls to **≈ ₹1,701** — **below** the current price of ₹1,784.60. This is the single most consequential sensitivity in this DCF: whether the stock screens modestly cheap or modestly rich on intrinsic cash flows depends almost entirely on which beta estimate is trusted, given how thin (0.24 vs 0.91) the vendor dispersion is for this name.

---

## 7. Sensitivity Grid (per-share intrinsic value)

Grid built on the **base-case method (exit multiple)**, per the report structure's "or exit multiple" alternative to a Gordon-growth grid — this is the method that anchors the headline value in §6. WACC across columns, exit multiple down rows (executed):

| Terminal EV/EBITDA multiple | WACC 9.02% (−1pp) | WACC 10.02% (base) | WACC 11.02% (+1pp) |
|---|---:|---:|---:|
| 13.0x (+1x) | ₹2,052 | ₹1,968 | ₹1,891 |
| **12.0x (base)** | **₹1,982** | **₹1,903** | **₹1,831** |
| 11.0x (−1x) | ₹1,912 | ₹1,838 | ₹1,770 |

**Cross-check grid — Gordon growth (g down rows), same WACC columns, shown for completeness (§5's upper-bound method):**

| Terminal growth (g) | WACC 9.02% (−1pp) | WACC 10.02% (base) | WACC 11.02% (+1pp) |
|---|---:|---:|---:|
| 6.0% (+0.5%) | ₹3,222 | ₹2,576 | ₹2,187 |
| **5.5% (base)** | **₹2,919** | **₹2,409** | **₹2,084** |
| 5.0% (−0.5%) | ₹2,691 | ₹2,276 | ₹1,999 |

No grid cell in either table has `WACC − g ≤ 0` or falls within ~0.5pp of zero — the minimum gap in the Gordon grid is 9.02% − 6.0% = 3.02pp, comfortably positive, so no cell requires an NM flag.

**Dispersion read:** across the base-case (exit-multiple) grid, per-share value ranges **₹1,770–₹2,052** (a ±7–8% band around the ₹1,903 base point). Including the Gordon-growth cross-check widens the full football field to **₹1,701 (moat-alternative-WACC addendum) to ₹3,222 (Gordon growth, low WACC, high g)** — a wide range that reflects genuine, evidenced uncertainty in the beta/WACC input (§3), not a modeling error.

---

## 8. Intrinsic Read

**Base-case intrinsic value: ≈ ₹1,903/share** (exit-multiple terminal method, 12.0x terminal EV/EBITDA, WACC 10.0%), against a current price of ₹1,784.60 — a **+6.7%** premium of intrinsic value to price. The base-case sensitivity grid disperses this point across **₹1,770–₹2,052** (±1x exit multiple, ±1pp WACC); the Gordon-growth cross-check sits materially higher (₹2,409, flagged in §5 as resting on a terminal multiple — 19.8x — richer than the company's own current 14.15x actual multiple despite modeling a slower, lower-margin, more mature business by then, so it is treated as an upper bound, not the headline). The single assumption this value is most sensitive to is **the beta/WACC input, not the growth or margin path**: at WACC = 13.0% (the midpoint of the moat module's own flagged "conventional beta" alternative for this stock), the same DCF produces **≈ ₹1,701/share — below today's price** — meaning the entire "modestly undervalued on cash flows" read flips to "roughly fairly valued to modestly rich" purely on which of two defensible, independently-sourced beta estimates (0.24 vs 0.91, a genuinely fourfold spread across vendors) is trusted for this specific stock.
