# Intrinsic DCF — BG

**Company:** Bunge Global SA (NYSE: BG). **Reporting currency:** US$ millions unless a per-share basis is stated. **Method:** FCFF DCF on **normalized mid-cycle** earnings (commodity/cyclical Operating company per the Business-Type Method Map — `MODULE_RULES.md` §"Business-Type Method Map" and `business-model/10_external-dependency.md`). **Today:** 2026-06-01.

**Cyclicality gate applied (hard rule).** Bunge is a thin-margin agri-commodity processor/merchandiser whose earnings are a *spread* (crush/merchandising margin), not a price it sets — rated "Mostly externally driven, 72/100 inverted" [`business-model/10_external-dependency.md` §4]. Per the Cyclicality Gate this DCF uses a **mid-cycle EBIT-margin band (3.2%–3.5%), not a single peak or trough year.** The FY23 adjusted-EBIT margin (5.1%) was a cycle peak and the FY25 margin (2.9%) a cycle trough; the model anchors on the middle, ~3.35%.

**Two structural facts that govern the whole model (carried from earnings module):**
1. **GAAP earnings are mark-to-market-distorted and unusable as a single-period base** (FY25 GAAP Total EBIT $1,533M vs adjusted $2,034M; Q1'26 GAAP EPS $0.35 vs adjusted $1.83) [`earnings/01_historical-financials.md` §4; Q1 2026 release, p.1]. The operating series used here is **adjusted Total EBIT** (= Capital IQ standardized EBIT, which reconciles to Bunge's adjusted non-GAAP figure) — **labeled management-defined every time it is used.**
2. **Viterra (closed mid-2025) roughly doubled the revenue base** (~$53bn FY24 → ~$91bn FY26 run-rate) and lifted net debt to $13.7bn. FY26 consensus revenue $91.5bn is the first full-year post-Viterra base [`earnings/01_historical-financials.md` §6; `earnings/04_guidance-consensus.md` §4].

**Confidence cap (stated up front).** Two caps bind and propagate to `99`: (a) **no pool-sourced current price** — the ~$123.35 anchor is indicative/web-sourced [`01_price-and-capital-structure.md`], so observed up/downside is not assessable here; (b) the operating base rests on **management-adjusted** EBIT (GAAP is distorted), and the terminal value is the dominant value driver (66–72% of EV). **Intrinsic confidence is capped Medium-Low.** The FCF base is *not* proxied — a full cash flow statement exists — so the "no cash flow statement" cap does not apply.

---

## 1. FCF Base & Normalizations

**Base year: FY2025 (ended Dec-31-2025), with FY2026 consensus ($91.5bn revenue) used as the Year-1 run-rate** because FY25 is only a half-year of Viterra and FY26 is the first clean full-year post-deal base. Currency: US$ millions. FCFF is built bottom-up as **NOPAT + D&A − capex − ΔNWC** (the income-statement identity per MODULE_RULES Economic Consistency Gate #1), because reported single-year CFO is seasonally and mark-to-market distorted (FY25 CFO collapsed to $844M; TTM FCF −$1,161M) and is not a usable starting FCF level [`earnings/01_historical-financials.md` §1–2]. The reconciling identity is stated once and not mixed.

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| Revenue (FY25 actual) | 70,329 | None (actual); FY26 run-rate 91,485 used as Yr-1 (full-yr Viterra) | FY25 10-K, line 4690; Capital IQ Consensus, FY26, data as of 2026-05-09 |
| GAAP Total EBIT (FY25) | 1,533 | **Discarded as base** — mark-to-market distorted; replaced by adjusted | FY25 10-K, p.37 |
| **Adjusted Total EBIT (FY25)** — operating base | **2,034** | Strips pension settlement, impairment, Viterra integration, MtM timing; *management-defined* | Capital IQ standardized EBIT (= Bunge adjusted), 2026-05-09; `earnings/01` §4 |
| Adjusted EBIT margin (FY25, on FY25 rev) | 2.89% | **Trough — not used as mid-cycle**; mid-cycle band 3.2–3.5% adopted instead | 2,034 / 70,329 |
| D&A (FY25 actual) | 703 | Steps up to ~975 FY26 (guided) on Viterra assets; modeled at ~1.07% of revenue | FY25 10-K, CF line 4830; Q1 2026 release, Outlook (~$975M) |
| Capex (FY25 actual) | 1,723 | FY26 guide $1.5–1.7bn; tapers to ~1.6% of revenue mid-cycle | FY25 10-K, CF line 4849; Q1 2026 release, Outlook |
| ΔNWC | n/m (volatile) | Modeled at 5% of incremental revenue (commodity WC-heavy; *analyst assumption*) | Inference — Bunge WC swings with flat price; `earnings/01` §1 [d] |
| Effective tax rate | 27.6% (FY25, elevated) | Normalized to **24%** (FY26 guidance midpoint 22–26%) | FY25 reconciliation; Q1 2026 release Outlook; `earnings/04` §2 |

**Why not a CFO-based FCF base:** Bunge's FY25 CFO ($844M) and TTM FCF (−$1,161M) are depressed by a seasonal inventory build and a higher flat-price working-capital draw, not by an operating-margin collapse [`earnings/01` §2, notes i–j]. Using either as the FCF level would understate normalized cash generation; the NOPAT-build is the economically consistent base for a mid-cycle valuation. **Limitation flagged:** this makes the base partly model-built rather than a single disclosed FCF figure — a reason the confidence is capped.

---

## 2. Forecast Assumptions

Horizon: **10 years** (long enough to let a cyclical normalize). Yr-1 = FY2026. Every cell labeled **[C] company-guided**, **[Cons] consensus-derived**, or **[A] analyst assumption**.

| Assumption | Yr1 (FY26) | Yr2 | Yr3 | Yr4 | Yr5 | Yr6–10 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 30.0 [Cons] | 3.6 [Cons] | 1.0 [Cons] | 2.0 [A] | 2.5 [A] | 2.5 [A] | 2.5 | Yr1 = Viterra full-yr annualization (FY26 cons $91.5bn); Yr2–3 = FY27/28 consensus; Yr4+ fade to ~nominal GDP [Cons: Capital IQ 2026-05-09; A: analyst] |
| EBIT margin % (adjusted, mid-cycle) | 3.31 [Cons] | 3.45 [Cons] | 3.40 [A] | 3.37 [A] | 3.35 [A] | 3.35 [A] | 3.35 | Yr1–2 = FY26/27 consensus adj EBIT/rev; Yr3+ = **mid-cycle band 3.2–3.5%** (NOT FY23 peak 5.1% / FY25 trough 2.9%) [Cyclicality Gate] |
| Tax rate % | 24 [C] | 24 | 24 | 24 | 24 | 24 | 24 | FY26 guidance midpoint 22–26% [`earnings/04` §2] |
| Capex ($M) | 1,600 [C] | 1,450 [Cons] | 1,350 [Cons] | 1,380 [A] | 1,430 [A] | ~1.6% of rev [A] | ~1.6% of rev | FY26 guide $1.5–1.7bn [C]; FY27/28 consensus ~$1.1–1.5bn [Cons]; mid-cycle ~1.6% of rev [A] |
| D&A ($M) | 978 [C] | scales ~1.07% of revenue thereafter [A] | | | | | ~1.07% of rev | FY26 guided ~$975M [C]; held at ~1.07% of revenue [A] |
| ΔWorking capital | 5% of ΔRevenue [A] | same | same | same | same | same | same | Analyst assumption — Bunge WC is flat-price-driven and volatile [Inference] |

**Economic-consistency cross-check (MODULE_RULES Gate #2).** Terminal-year reinvestment rate ≈ (capex − D&A + ΔNWC) / NOPAT ≈ **25.6%**; ROIC proxy (NOPAT / [net debt + book equity]) ≈ **9.7%**; implied growth = ROIC × reinvestment ≈ **2.48%** — which ties almost exactly to the modeled 2.5% terminal growth. **The modeled growth is financeable; no unexplained gap.** Per Gate #3, terminal ROIC (~9.7%) is held only modestly above WACC (7%), consistent with a thin-margin price-taker that does not earn large persistent excess returns — no heroic moat premium is embedded (Bunge's pricing power is rated "Squeezed" [`earnings/03_margin-drivers.md` §"Pricing-power context"]).

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.45% | US 10Y Treasury, 2026-05-29 [Web: TradingEconomics/CNBC, 2026-05-29 — indicative, unverified] |
| Equity-risk premium | 4.75% | Damodaran implied ERP 4.23% (Jan-2026) + cushion for cyclicality [Web: Damodaran 2026 ERP, SSRN — labeled web-sourced] |
| Beta | 0.65 | Web band 0.53–0.63 (Zacks 0.53; stockanalysis.com 0.63); raised to 0.65 for post-Viterra leverage the trailing beta predates [Web, 2026-05-29 — indicative; +inference] |
| **Cost of equity (Ke)** | **7.54%** | 4.45% + 0.65 × 4.75% |
| Pre-tax cost of debt | 4.75% | Blended: senior notes 2.00%–5.25% (weighted ~4–4.65%) + short-term borrowings 5.15% | FY25 10-K, Note 13 (Debt) — coupon schedule; "weighted-average rate on short-term borrowings 5.15%" |
| Tax rate (shield) | 24% | FY26 guidance midpoint [`earnings/04` §2] |
| After-tax cost of debt | 3.61% | 4.75% × (1 − 0.24) |
| Equity / debt weights | 62.2% / 37.8% | Market cap $23,932M / total debt $14,553M [`01_price-and-capital-structure.md`] |
| **WACC (computed)** | **6.05%** | 0.622 × 7.54% + 0.378 × 3.61% |
| **WACC used as base** | **7.0%** | Computed 6.05% raised to 7.0% — see note | Analyst judgment |

**WACC note (important, and a sanity flag per Gate #4).** The mechanically-computed WACC is **6.05%**, but two facts argue it is too low for this issuer: (a) the trailing beta (0.53–0.63) is measured largely **pre-Viterra** and does not yet capture the leverage step-up (net debt $2.9bn → $13.7bn; ND/EBITDA ~1.3x → ~5.8x [`01` §5]); (b) a 6.0% discount rate on a commodity processor whose segment EBIT swings ±40–60% a year understates business risk. The report therefore **centers the base case at WACC 7.0%** and runs the grid from **6.0% to 8.0%** so the reader sees both the model-implied and the risk-adjusted levels. This is the single most judgmental input and is flagged as such.

---

## 4. Free Cash Flow Forecast & Discounting

At **base WACC 7.0%**, mid-cycle EBIT margin ~3.35%, tax 24%. FCFF = NOPAT + D&A − capex − ΔNWC. US$ millions.

| Year | Revenue | EBIT (adj) | NOPAT | D&A | Capex | ΔNWC | FCFF | Discount Factor | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 (FY26) | 91,428 | 3,026 | 2,300 | 978 | 1,600 | 1,055 | 623 | 0.935 | 582 |
| 2 (FY27) | 94,719 | 3,268 | 2,484 | 1,013 | 1,450 | 165 | 1,882 | 0.873 | 1,644 |
| 3 (FY28) | 95,666 | 3,253 | 2,472 | 1,024 | 1,350 | 47 | 2,098 | 0.816 | 1,712 |
| 4 | 97,580 | 3,288 | 2,499 | 1,044 | 1,380 | 96 | 2,068 | 0.763 | 1,577 |
| 5 | 100,019 | 3,351 | 2,546 | 1,070 | 1,430 | 122 | 2,065 | 0.713 | 1,472 |
| 6 | 102,520 | 3,434 | 2,610 | 1,097 | 1,640 | 125 | 1,942 | 0.666 | 1,294 |
| 7 | 105,083 | 3,520 | 2,675 | 1,124 | 1,681 | 128 | 1,990 | 0.623 | 1,239 |
| 8 | 107,710 | 3,608 | 2,742 | 1,152 | 1,723 | 131 | 2,040 | 0.582 | 1,188 |
| 9 | 110,402 | 3,698 | 2,811 | 1,181 | 1,766 | 135 | 2,091 | 0.544 | 1,137 |
| 10 | 113,162 | 3,791 | 2,881 | 1,211 | 1,811 | 138 | 2,143 | 0.508 | 1,090 |

**Sum of PV of explicit FCFs (Yr1–10, base WACC 7.0%): ≈ $12,896M.**

*(Yr-1 FCFF is depressed by a $1,055M working-capital build as the full Viterra revenue base annualizes — an analyst assumption; it normalizes from Yr-2. At the model-implied WACC 6.05% the explicit PV sum is ~$13,576M.)*

---

## 5. Terminal Value

Disclosed under **both** methods because, for a cyclical with a low computed WACC, the Gordon perpetuity is fragile and the exit multiple is the disciplining anchor (MODULE_RULES Economic Consistency Gate #5).

**Base case = WACC 7.0%, terminal g = 2.5% (Gordon) / 7.5× EV/EBITDA (exit):**

| Item | Gordon growth (g = 2.5%) | Exit multiple (7.5× EBITDA) |
|---|---:|---:|
| Terminal-year FCFF / EBITDA | FCFF $2,143M | EBITDA $5,002M |
| Terminal value (undiscounted) | 47,977 | 37,513 |
| PV of terminal value | 24,818 | 19,070 |
| Enterprise value (PV explicit + PV TV) | **37,714** | **31,966** |
| **Terminal value as % of total EV** | **66%** | **60%** |

- **Terminal g = 2.5%** sits at/below the long-run US nominal-growth proxy (Gate #4 — `g` does not exceed nominal GDP). The implied **terminal EV/EBITDA from the Gordon method is ~9.6× at WACC 7%** (and a rich ~12.4× at WACC 6%), versus the FY27 forward TEV/EBITDA of 9.23× quoted on an elevated ~$125 price [Multiples.xlsx, 2026-05-09]. For a mid-cycle commodity processor that is full; the **7.5× exit multiple is a deliberate mid-cycle haircut** to the elevated-price forward multiple and is the more conservative anchor.
- **Terminal-dominance flag:** at the base WACC 7.0%, TV = 66% of EV (below the 75% low-confidence threshold). **But at the model-implied WACC 6.0%, TV rises to ~72% of EV** — approaching the flag. The lower the discount rate, the more the value is a terminal artifact; this is why the report does not rely on the 6% WACC alone and discloses the exit-multiple cross-check.

---

## 6. DCF Output

Bridge uses `01`'s anchor verbatim: net debt **$13,714M** (cash-only), NCI + redeemable NCI **$1,432M**, preferred **$0**, diluted shares **195,733,665**. Equity-method investments (~$1,276M) are left **inside** EV (their earnings sit in the adjusted-EBIT base — consistent treatment, per `01` §4).

**Base case (WACC 7.0%, g 2.5% Gordon / 7.5× exit):**

| Step | Gordon | Exit 7.5× |
|---|---:|---:|
| PV of explicit FCFs | 12,896 | 12,896 |
| + PV of terminal value | 24,818 | 19,070 |
| **= Enterprise value** | **37,714** | **31,966** |
| − Net debt | (13,714) | (13,714) |
| − Minority / redeemable NCI | (1,432) | (1,432) |
| − Preferred | 0 | 0 |
| **= Equity value** | **22,568** | **16,820** |
| ÷ Diluted shares (195.73M) | | |
| **= Intrinsic value per share** | **≈ $115** | **≈ $86** |
| vs current price (indicative ~$123.35) | −7% | −30% |

**Base-case intrinsic per share: ~$86 (exit-multiple) to ~$115 (Gordon); blended midpoint ≈ $101.** Both terminal methods sit **below** the indicative ~$123 price at the base WACC.

**Cross-method divergence (disclosed, not averaged silently):** the Gordon and exit-multiple terminal methods differ by **~29%** at the base case — inside the 40% reconciliation tolerance but material. The gap is entirely a **terminal-method choice**, not a forecast difference (identical explicit FCFs). The Gordon method's apparent richness comes from discounting a thin spread at a low rate; the exit multiple imposes a mid-cycle EBITDA ceiling. A cyclical deserves the more conservative anchor, so the central estimate leans toward the blended/lower end.

---

## 7. Sensitivity Grid (per-share intrinsic value)

**Grid A — Gordon growth.** WACC across columns; terminal g down rows. Mid-cycle EBIT margin held at 3.35%.

| g \ WACC | 6.0% | 7.0% (base) | 8.0% |
|---|---:|---:|---:|
| 3.0% | $202 | $132 | $90 |
| 2.5% (base) | $171 | **$115** | $80 |
| 2.0% | $148 | $102 | $72 |

**Grid B — Exit multiple (terminal EV/EBITDA).** WACC down rows; exit multiple across columns; g 2.5% for explicit years.

| WACC \ Exit | 6.5× | 7.5× (base) | 8.5× |
|---|---:|---:|---:|
| 6.0% | $85 | $99 | $113 |
| 7.0% (base) | $73 | **$86** | $99 |
| 8.0% | $62 | $74 | $86 |

**Grid C — mid-cycle EBIT margin** (WACC 7.0%, g 2.5%, Gordon): 3.20% → **$105**; 3.35% → **$115**; 3.50% → **$126**.

**Reading the grids:** across the plausible box (WACC 6–8%, g 2–3% or exit 6.5–8.5×), per-share intrinsic spans **~$62 to ~$202** — a very wide range that is itself the finding. Excluding the extreme corners (the $202 rests on the indefensibly-low 6% WACC + 3% g, and $62 on the harshest combination), the **defensible central band is ~$85–$130/share**, midpoint **~$105**. The single most influential input is the **discount-rate / terminal-method pair**: moving WACC from 6% to 8% on the Gordon method nearly halves the value ($171 → $80), and switching from Gordon to the exit multiple at base WACC cuts it from $115 to $86. The **mid-cycle margin** is the next most influential operating lever (±15bps ≈ ±$10/share).

---

## 8. Intrinsic Read

On normalized mid-cycle cash flow, Bunge's DCF intrinsic value is a wide **~$85–$130/share (midpoint ~$105)**, which sits modestly **below** the indicative ~$123 price — i.e., on a cash-flow basis the stock is roughly priced at-to-slightly-above its mid-cycle worth, with no clear margin of safety at today's level, though the no-pool-price caveat means observed up/downside is not assessable here. The value is **most sensitive to the discount-rate and terminal-method choice**: the mechanically-computed WACC (6.05%, off a pre-Viterra beta of ~0.55–0.65) produces a flattering Gordon value (~$170), but a risk-adjusted WACC of 7–8% and a disciplined mid-cycle exit multiple (7.5×) pull intrinsic down to **~$86–$115**, and the Gordon-vs-exit gap (~29%) plus a terminal value worth 66–72% of EV are why this DCF is **confidence-capped Medium-Low** and should be triangulated against the multiple-based methods, not read as a precise number.

---

### Self-Check
- **Business-type gate applied:** FCFF DCF on a commodity/cyclical Operating company, with a mandatory mid-cycle margin band (3.2–3.5%) — not a peak/trough single point. No financial/REIT method forced.
- **FCF base & normalizations stated:** base FY25/FY26 run-rate; GAAP EBIT discarded for adjusted (labeled); tax normalized 27.6%→24%; CFO not used as FCF base (reason given).
- **Every forecast cell labeled** company-guided [C] / consensus-derived [Cons] / analyst assumption [A].
- **WACC components shown with sources;** web-sourced rf/ERP/beta labeled; computed 6.05% vs base 7.0% disclosed; Gate #4 sanity flags noted.
- **Terminal value disclosed as % of EV (66% base; ~72% at 6% WACC)** and the terminal-dominance flag raised; exit-multiple second lens provided (Gate #5).
- **EV→equity→per-share bridge uses `01`'s net debt ($13,714M), NCI ($1,432M), and diluted shares (195.73M) verbatim.**
- **Sensitivity grid populated;** output is a per-share **range (~$85–$130 defensible; ~$62–$202 full box)**, not a single number.
- **Economic-consistency cross-check:** reinvestment 25.6% × ROIC 9.7% ≈ 2.48% ties to modeled 2.5% terminal g.
- **Confidence capped Medium-Low** (adjusted-EBIT base, terminal-dominated, no pool price). FCF not proxied (cash flow statement exists) — that specific cap does not apply.
- **No banned phrases.**

*Sources (web-sourced inputs, labeled indicative/unverified): US 10Y Treasury 4.45% (TradingEconomics/CNBC, 2026-05-29); Damodaran implied ERP 4.23% (NYU Stern / SSRN 2026 edition); BG beta 0.53–0.63 (Zacks, stockanalysis.com, 2026-05-29). All filing data from FY25 10-K and Q1 FY26 10-Q; consensus from Capital IQ exports, data as of 2026-05-09.*
