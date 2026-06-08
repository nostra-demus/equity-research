# Intrinsic DCF — CRM

**Company:** Salesforce, Inc. (NYSE:CRM) · **Method:** FCFF DCF (discounted free cash flow to the firm) · **Reporting standard:** US GAAP · **Currency:** USD, millions unless per-share · **Fiscal year ends Jan-31** ("FY27" runs Feb-01-2026 → Jan-31-2027) · **As-of:** 2026-06-08

**Business-type gate (applied).** Salesforce is an operating enterprise-software business with recurring subscription (SaaS) revenue — per the Business-Type Method Map in MODULE_RULES.md, the FCFF DCF plus an EV→equity bridge is the correct primary method (not a financial DDM, not a REIT NAV). The cyclicality gate does NOT trip: revenue grew every year FY22→FY26 and seasonality is mild (~24% of revenue in the weakest quarter vs ~27% in the strongest) `[earnings/01_historical-financials.md §5]`, so no mid-cycle normalization is required. Cross-module inputs for cyclicality / business-quality / moat (`business-model/07`, `09`, `10`) are not present in this run — *external-dependency cross-module input not available; proceeding on this module's own read of the data pool and the earnings module.*

**The one modeling decision that drives everything — read first.** Salesforce's headline free cash flow (operating cash flow minus capital spending, ~$14.7 billion in the last twelve months) is overstated as *economic* free cash flow by two non-cash add-backs that are real costs for this company: (1) **stock-based compensation** (paying staff in shares instead of cash) of ~$3.55 billion in the last twelve months — about 8.5% of revenue `[earnings/01 §4]` — and (2) **amortization of acquired intangibles** of ~$1.6 billion a year, which is the accounting echo of Salesforce's long history of debt- and cash-funded acquisitions (it spent ~$9–11 billion a year on acquisitions in FY26 and the last twelve months) `[Capital IQ Cash Flow (annual), Apr-30-2026]`. A discounted-cash-flow model that hands both of those back as "free" cash is the classic way SaaS businesses get over-valued. **My base case charges stock-based compensation** (by valuing on GAAP operating profit, which already expenses it) **and does not treat the amortization of acquired intangibles as free cash** (it caps the depreciation-and-amortization add-back to maintenance-level reinvestment). I show the company's reported-FCF treatment as an explicit upside case so the gap is visible, not hidden.

---

## 1. FCF Base & Normalizations

Base year = the **last twelve months ended Apr-30-2026** (through Q1 FY27), with FY26 (ended Jan-31-2026) as the audited cross-check. Reporting currency USD; US GAAP. FCF = CFO − capex (CLAUDE.md §15), capex shown at absolute value.

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| Revenue (LTM to Apr-30-2026) | 42,829 | None | `Capital IQ Income Statement (annual), LTM col` |
| Revenue (FY26 audited) | 41,525 | None — used as the forecast anchor base | `FY26 10-K, Statements of Operations` |
| CFO (LTM) | 15,221 | None | `Capital IQ Cash Flow (annual), LTM col` |
| Capex (LTM) | (560) | Absolute value used | `Capital IQ Cash Flow (annual), LTM col` |
| **Reported FCF = CFO − capex (LTM)** | **14,661** | Headline figure — *not* the base-case economic FCF | computed; ties to FY27 guided FCF ~$15,050 |
| Reported FCF (FY26 audited) | 14,402 | CFO 14,996 − capex 594 | `FY26 10-K, Statements of Cash Flows` |
| (−) Stock-based compensation (LTM) | (3,552) | **Charged** — paid in shares, a real, recurring cost (~8.5% of revenue) | `Capital IQ Cash Flow / Income Statement, LTM`; `earnings/01 §4` |
| (−/+) Investment gains/losses (LTM) | +1,638 (gain) reversed | **Removed** — Salesforce Ventures mark-to-market swings are volatile and non-operating (e.g. −$1,211 FY22 vs +1,017 FY26) | `Capital IQ Income Statement, "Gain (Loss) On Sale Of Invest."` |
| Amortization of acquired intangibles (LTM) | ~1,609 | **Not handed back as free cash** in base case — it is the echo of past M&A | `Capital IQ Cash Flow, "Amort. of Goodwill and Intangibles"` |
| Memo: economic FCF proxy (reported FCF − SBC) | ~11,109 | The "stock-comp-charged" cash figure the base case effectively underwrites | computed: 14,661 − 3,552 |

**Why the base case is built up from GAAP operating profit (NOPAT) rather than from reported FCF.** Building from operating profit keeps the FCFF identity clean (`FCFF = NOPAT + D&A − capex − ΔWC`, MODULE_RULES Economic Consistency Gate 1) and forces stock-based compensation to stay inside the cost base (it is expensed in GAAP operating income). Reported FCF starts from net income and adds back the full ~$3.5 billion of D&A and the ~$3.5 billion of stock-based compensation, which is precisely what inflates a SaaS DCF. **EBIT basis used:** Capital IQ standardized operating income (restructuring excluded), which is the EBIT the forward consensus and margin guidance are framed on; FY26 = $8,917M, LTM = $9,366M `[Capital IQ Income Statement, annual]`. The audited 10-K GAAP "income from operations" (FY26 $8,331M, which keeps restructuring inside operating costs) is ~$586M lower; using it would *reduce* the intrinsic value, so the Capital IQ basis is the less conservative of the two and is flagged as such `[earnings/01 §1]`.

---

## 2. Forecast Assumptions

10-year explicit horizon (FY27→FY36). Year 1 (FY27) is pinned to management's guidance; the fade beyond is an analyst assumption anchored to the company's own FY30 framework ($63.0bn revenue, ~11% CAGR FY26→FY30, reaffirmed) `[earnings/04 §2; Q1 FY27 transcript]`. Labels: **[G]** company-guided, **[A]** analyst assumption (not company-guided), **[A/F]** analyst assumption anchored to the company's FY30 framework.

| Assumption | Yr1 FY27 | Yr2 | Yr3 | Yr4 | Yr5 | Yr6 | Yr7 | Yr8 | Yr9 | Yr10 FY36 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 10.9 **[G]** | 9.0 **[A/F]** | 7.5 **[A/F]** | 6.5 **[A]** | 6.0 **[A]** | 5.5 **[A]** | 5.0 **[A]** | 4.5 **[A]** | 4.0 **[A]** | 4.0 **[A]** | 3.5 **[A]** | FY27 → $46,050m = guide midpoint; FY27–FY30 ≈ company's ~11% framework fading to GDP-like |
| Revenue ($m) | 46,051 | 50,196 | 53,961 | 57,468 | 60,916 | 64,266 | 67,480 | 70,516 | 73,337 | 76,270 | — | computed |
| EBIT margin % (GAAP, SBC charged) | 21.0 **[G]** | 22.0 **[A]** | 23.0 **[A]** | 24.0 **[A]** | 24.5 **[A]** | 25.0 **[A]** | 25.5 **[A]** | 25.8 **[A]** | 26.0 **[A]** | 26.0 **[A]** | 26.0 **[A]** | FY27 GAAP guide 20.6% (rounded to 21.0 on the CapIQ EBIT basis); expands as the business scales — well below the 34.3% **non-GAAP** guide, by design |
| Tax rate % | 21 **[A]** | 21 | 21 | 21 | 21 | 21 | 21 | 21 | 21 | 21 | 21 | Effective rate 16–22% recently (FY26 21.7%, LTM 21.9%); 21% = normalized marginal `[Capital IQ Income Statement]` |
| Maintenance D&A (% of revenue) | 1.8 **[A]** | 1.9 | 2.0 | 2.1 | 2.2 | 2.2 | 2.2 | 2.2 | 2.2 | 2.2 | 2.2 | **Base case add-back capped to maintenance** — excludes ~$1.6bn/yr acquired-intangible amortization (the M&A echo) |
| Capex (% of revenue) | 1.5 **[G]** | 1.6 **[A]** | 1.7 | 1.8 | 1.8 | 1.9 | 1.9 | 2.0 | 2.0 | 2.0 | 2.0 | FY27 capex guide ~$689–693m ≈ 1.5%; light, asset-light model `[earnings/04 §2]` |
| Δ Working capital (% of rev; +ve = cash use) | −0.5 **[A]** | −0.4 | −0.3 | −0.2 | −0.1 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | Deferred-revenue (upfront billing) is a cash **source** while growing; faded to neutral as growth slows `[earnings/01 §1; balance sheet unearned rev]` |

**Reading of the margin path.** The model expands GAAP operating margin from ~21% to ~26% over ten years — real operating leverage, but it deliberately stops far short of the company's 34.3% **non-GAAP** target, because the ~13-point gap between the two is mostly stock-based compensation that the base case refuses to add back. If you believe Salesforce's non-GAAP margin is the true economic margin, use the upside case in §6.

---

## 3. Discount Rate (WACC)

Capital asset pricing model for the cost of equity; market-value weights. Cost of capital = the blended return debt and equity holders require.

| Component | Value | Source |
|---|---:|---|
| Risk-free rate (10Y US Treasury) | 4.55% | **Web-sourced, 2026-06-05, indicative/unverified** (tradingeconomics / FRED DGS10) |
| Equity-risk premium (ERP) | 4.50% | **Web-sourced** — Damodaran implied US ERP ~4.23% (Jan-2026), rounded up slightly for conservatism; indicative/unverified |
| Beta (5-year) | 1.15 | `Capital IQ Comps, Operating Statistics, "5 Year Beta", As-Of 2026-06-08` |
| **Cost of equity** = 4.55% + 1.15 × 4.50% | **9.72%** | computed |
| Pre-tax cost of debt | 5.20% | Analyst estimate for an **S&P A+** issuer (rf + ~65bp); rating from `Credit Health Panel, "S&P Foreign Currency LT" = A+` |
| Tax rate (for debt shield) | 21% | as above |
| After-tax cost of debt = 5.20% × (1 − 0.21) | 4.11% | computed |
| Equity / debt weights (market value) | 78.1% / 21.9% | E = market cap $152,056m (819m × $185.66); D = total debt $42,548m `[01 §3–4]` |
| **WACC** = 0.781 × 9.72% + 0.219 × 4.11% | **8.50%** | computed |

**WACC sanity checks (MODULE_RULES Gate 4):** risk-free rate and ERP are dated and labelled web-sourced; after-tax cost of debt (4.11%) is positive and consistent with an A+ rating; terminal growth `g` (3.5%) is below the long-run nominal US growth proxy and below the risk-free rate (4.55%), so the Gordon formula is well-behaved. The reported LTM interest expense (~$598m on $42.5bn) understates the run-rate because most of the ~$25bn senior notes were issued part-way through the quarter; 5.2% pre-tax is a forward run-rate estimate, not the trailing average, and is labelled an analyst estimate.

---

## 4. Free Cash Flow Forecast & Discounting — BASE CASE

FCFF = NOPAT + maintenance D&A − capex − ΔWC. NOPAT = EBIT × (1 − 21%). Discount factor = 1 / (1.0850)^year. All $m.

| Year | Revenue | EBIT | NOPAT | Maint. D&A | Capex | ΔWC | FCFF | Discount Factor | PV of FCFF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 (FY27) | 46,051 | 9,671 | 7,640 | 829 | 691 | (230) | 8,008 | 0.9217 | 7,381 |
| 2 (FY28) | 50,196 | 11,043 | 8,724 | 954 | 803 | (201) | 9,075 | 0.8495 | 7,710 |
| 3 (FY29) | 53,961 | 12,411 | 9,805 | 1,079 | 917 | (162) | 10,128 | 0.7830 | 7,930 |
| 4 (FY30) | 57,468 | 13,792 | 10,896 | 1,207 | 1,034 | (115) | 11,183 | 0.7217 | 8,070 |
| 5 (FY31) | 60,916 | 14,924 | 11,790 | 1,340 | 1,096 | (61) | 12,095 | 0.6651 | 8,045 |
| 6 (FY32) | 64,266 | 16,067 | 12,693 | 1,414 | 1,221 | 0 | 12,885 | 0.6131 | 7,899 |
| 7 (FY33) | 67,480 | 17,207 | 13,594 | 1,485 | 1,282 | 0 | 13,796 | 0.5650 | 7,795 |
| 8 (FY34) | 70,516 | 18,193 | 14,373 | 1,551 | 1,410 | 0 | 14,514 | 0.5208 | 7,559 |
| 9 (FY35) | 73,337 | 19,068 | 15,063 | 1,613 | 1,467 | 0 | 15,210 | 0.4800 | 7,301 |
| 10 (FY36) | 76,270 | 19,830 | 15,666 | 1,678 | 1,525 | 0 | 15,818 | 0.4424 | 6,998 |

**Sum of PV of explicit FCFF (base) = $76,689m.**

**Financeability cross-check (MODULE_RULES Gate 2 & 3).** FY27 reinvestment (capex − maintenance D&A + ΔWC) = −$368m, a slightly negative figure because Salesforce's upfront-billing deferred-revenue balance genuinely self-funds near-term growth; reinvestment turns small/neutral by the terminal year. NOPAT-based return on invested capital (ROIC) ≈ $7,640m / $64,946m invested capital (total debt $42,548 + equity $34,235 − cash $11,837) = **~11.8%**, comfortably above the 8.50% WACC — consistent with a wide-moat subscription franchise, though I flag that this ROIC is depressed by the large goodwill/intangible base from acquisitions (it would be far higher on tangible capital). In the terminal year the modeled ROIC still exceeds WACC; this persistence of excess returns is an *inference* that the moat holds, not a filing fact — if the moat erodes, the terminal value (below) is the first thing to fall.

---

## 5. Terminal Value (BASE CASE)

- **Method:** Gordon perpetuity growth. Terminal growth **g = 3.5%** (analyst assumption; ≈ long-run nominal US growth, below the 4.55% risk-free rate).
- **Terminal FCFF (Yr10) = $15,818m; Yr11 = $15,818 × 1.035 = $16,372m.**
- **Terminal value (undiscounted) = $16,372m / (8.50% − 3.5%) = $327,646m.**
- **PV of terminal value = $327,646m / (1.0850)^10 = $144,954m.**
- **Terminal value as % of total EV = $144,954m / $221,643m = 65.4%.** Below the 75% "terminal-dominated" flag, so the DCF is **not** terminal-dominated — but at ~two-thirds of value it is still the single biggest block, which is normal for a high-margin grower and is the reason the sensitivity grid (§7) matters more than the point estimate. *(Exit-multiple cross-check, since TV is the majority of value: base EV of $221,643m implies ~17.2× LTM EBITDA and ~22.9× FY27 GAAP EBIT — both inside the range software peers trade on, so the perpetuity-growth answer is not relying on an out-of-market terminal multiple.)*

---

## 6. DCF Output

Bridge uses `01_price-and-capital-structure` anchors verbatim: net debt $30,711m, 819m shares, no minority/preferred.

| Step | Base case | Upside case | Downside case |
|---|---:|---:|---:|
| PV of explicit FCFF | 76,689 | 92,949 | 66,379 |
| + PV of terminal value | 144,954 | 163,126 | 105,106 |
| **= Enterprise value** | **221,643** | **256,075** | **171,484** |
| − Net debt | (30,711) | (30,711) | (30,711) |
| − Minority / preferred | 0 | 0 | 0 |
| **= Equity value** | **190,932** | **225,364** | **140,773** |
| ÷ Diluted shares (m) | 819 | 819 | 819 |
| **= Intrinsic value per share** | **$233** | **$275** | **$172** |
| vs current price $185.66 | **+25.6%** | +48.2% | −7.4% |
| Terminal value as % of EV | 65.4% | 63.7% | 61.3% |

**What separates the three cases:**
- **Base ($233)** — GAAP operating margin charges stock-based compensation; the depreciation-and-amortization add-back is capped to maintenance reinvestment, so the ~$1.6bn/yr amortization of acquired intangibles is **not** handed back as free cash; margin expands to ~26%; g = 3.5%. This is the disciplined, economically-honest reading and the one I lead with.
- **Upside ($275)** — the company's own free-cash-flow treatment: full depreciation-and-amortization added back (intangible amortization treated as free), so FY27 FCFF (~$10.9bn rising) lines up with the reported/guided FCF basis. Stock-based compensation is still charged via GAAP EBIT. This is what the stock is worth *if* you accept reported FCF at face value.
- **Downside ($172)** — slower growth (fading to ~3% sooner), margin expanding only to ~23%, deferred-revenue tailwind removed, g = 3.0%. Roughly today's price — i.e. the current quote is close to the downside DCF.

---

## 7. Sensitivity Grid (per-share intrinsic value, BASE CASE FCFF)

WACC across columns, terminal growth `g` down rows. Computed on the base-case (stock-comp-charged, maintenance-D&A) FCFF.

| g \ WACC | WACC −1% (7.50%) | WACC (8.50%) | WACC +1% (9.50%) |
|---|---:|---:|---:|
| **g +0.5% (4.0%)** | $340 | $254 | $199 |
| **g (3.5%)** | $304 | **$233** | $186 |
| **g −0.5% (3.0%)** | $276 | $216 | $175 |

Range across the grid: **~$175 to ~$340**, centred on **$233**. Terminal value stays below the 75% flag across the whole grid except the extreme top-left corner (g 4.0% / WACC 7.50% → TV 73.9%), which is still under the line. The base-case central cell ($233) is the most defensible single read; the price ($185.66) sits between the downside DCF ($172) and the base ($233).

---

## 8. Intrinsic Read

On the disciplined base case — which charges stock-based compensation and refuses to bank ~$1.6 billion a year of acquired-intangible amortization as free cash — Salesforce is worth about **$233 per share**, roughly 26% above the $185.66 price, with a defensible band of about **$175–$304** across a WACC of 7.5–9.5% and terminal growth of 3.0–4.0%; the company's own reported-FCF treatment lifts that to ~$275. The single assumption the value hangs on is the **discount rate / terminal-growth pair** — terminal value is ~65% of enterprise value, so a 1-point move in WACC swings the base estimate by roughly $40–60 a share, far more than any near-term revenue or margin tweak. The honest tension in the name is the gap between GAAP and non-GAAP profitability: at today's price the market is paying close to the *downside* DCF (~$172, which assumes stock-comp is a real cost and growth fades hard), so the upside to $233+ is essentially a bet that Salesforce's ~26% modeled GAAP operating margin and ~11% near-term growth hold while reinvestment stays light — a bet the cash flows support but the terminal-value dominance keeps low-conviction without the multiples and reverse-DCF cross-reads.

---

### Confidence & caveats

- **Confidence: Medium.** Full cash-flow statement, audited base, company guidance and consensus are all present (no partial-data FCF-proxy cap applies — FCF is real, not proxied). Confidence is held to Medium, not High, because (a) terminal value is ~65% of EV, (b) the risk-free rate and ERP are web-sourced/unverified, and (c) the GAAP-vs-non-GAAP stock-comp treatment is itself the swing factor and is a judgment call, addressed by showing both lenses.
- **Anchor consistency:** price $185.66, shares 819m, net debt $30,711m, EV $182.8bn all taken verbatim from `01_price-and-capital-structure`. The DCF's *own* enterprise value ($221.6bn base) is the intrinsic estimate and is deliberately above the market EV ($182.8bn) — that difference is the upside, not an inconsistency.
- **Cross-module gaps:** `business-model/07` (quality), `09` (moat), `10` (external-dependency) were not available; the moat/ROIC-persistence assumption in the terminal value is this agent's own inference and should be reconciled by the synthesis against those modules if they are produced.
- This module produces fair-value **levels** only. Scenario probabilities, probability-weighted targets, and the final rating belong to the master synthesizer.
