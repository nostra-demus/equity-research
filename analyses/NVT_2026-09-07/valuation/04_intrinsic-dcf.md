# Intrinsic DCF — NVT

**Evidence binding: frozen.** Every read resolved through the bound generation `6db32848…1aecd1e6`. Live `data/NVT/` and `_pool_extracts/` were not read; `data/NVT/…` is a citation label only.

**Regime, standard, currency (from `00_valuation-data-triage` §1A).** US SEC domestic filer (Irish-incorporated, NYSE-listed). **US GAAP. Reporting currency USD, in millions; per-share in dollars. Fiscal year ends 31 December.** The discount rate and the terminal growth rate below are both USD-denominated and matched to the US economy.

**Business-type gate (MODULE_RULES → Business-Type Method Map).** `00_valuation-data-triage` §3 classifies nVent as an **Operating company** (electrical connection and protection products, two reportable segments) [`FY24 10-K, Item 1`]. So the method is an **FCFF discounted-cash-flow model with an EV → equity bridge** — the standard route on that map. Two overlays apply and are carried through the whole model rather than mentioned and dropped:
- **Cyclicality overlay.** `business-model/10_external-dependency.md` §4 scores external dependency **60/100 (inverted — higher is worse)** and classifies the business "Partly externally driven", with roughly 94% of Q2 FY26 organic growth from one vertical (data centres). `earnings/01_historical-financials.md` §2 and `01_price-and-capital-structure` §5 both flag the latest twelve months as a **cycle peak**. The Cyclicality Gate therefore binds: the terminal margin is a **normalized mid-cycle** figure benchmarked against peer-normal and the company's own prior trough (§5), never the recent peak.
- **No-moat overlay.** `business-model/09_moat.md` §5 returns **"No moat proven — a moat in structure, not in economics"**, trajectory **stable**. Under this agent's §5 rule that forces a base terminal carrying **no perpetual excess return**.

**Two things this DCF deliberately excludes, stated once so they travel.**
1. **The Maverick Power acquisition is not in the model.** Announced 2026-08-24 — $1.75bn cash plus up to $550m earn-out, target 2026 revenue about $700m, close expected Q4 2026, funded from cash on hand and new debt [`nVent news release, 2026-08-24`]. It post-dates every consensus mark (to 2026-08-07) and the 30-Jun-2026 balance sheet. The forecast revenue is therefore **pre-deal** and the net debt in the equity bridge is **pre-deal** — consistent on both sides, per `01_price-and-capital-structure` §4. Folding the revenue in without the debt would be the error.
2. **No unannounced future M&A is modelled**, and no cash is charged for it. nVent has spent about $1,120m (FY2023), $678m (FY2024) and $976m (FY2025) on acquisitions [`earnings/01_historical-financials.md` §6]. The forecast below is an organic-plus-already-closed-deals path. This is stated because it is a real limitation on how the terminal is read, not a modelling nicety.

---

## 1. FCF Base & Normalizations

**Base year: the twelve months ended 30-Jun-2026 (LTM).** Reporting currency **USD, millions**, US GAAP.

**FCF definition used (CLAUDE.md §15).** `FCF = CFO − total capex`. Because this is an enterprise-level (FCFF) model discounted at a weighted-average cost of capital, the base is stated **twice**: the §15 FCF, and the **unlevered** FCFF that adds back after-tax interest — the FCFF is what the model actually discounts. Both are shown so neither is mistaken for the other. *(Plain meaning: CFO is the cash the operations generate; capex is the cash spent on plant and equipment; FCFF is what is left for **all** providers of capital — lenders and shareholders together — before interest is paid.)*

| Item | Base-Year Value (LTM to 30-Jun-2026) | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | 4,834.0 | None. Ties to the vendor LTM column and to FY2025 3,893.1 − H1'25 1,772.4 + H1'26 2,713.3 | `Capital IQ Financials export → Income Statement`, LTM 12m Jun-30-2026 (tier-5 vendor); `Q2 FY26 10-Q, statements of operations` |
| CFO — **as reported** (total, incl. discontinued ops) | 690.6 | — | `Capital IQ Financials export → Cash Flow`, LTM 12m Jun-30-2026 |
| CFO — **continuing operations (used)** | **772.8** | **Removed the −$82.2m operating cash *outflow* of discontinued operations** that sits inside the reported total (largely Thermal Management disposal taxes). 690.6 − (−82.2) = 772.8 | `Capital IQ Financials export → Cash Flow` ("Net Cash From Discontinued Ops. −82.2"); derivation carried from `earnings/01_historical-financials.md` §2 |
| Capex | **112.9** | None. Independently rebuilt as FY2025 93.3 − H1'25 38.0 + H1'26 57.6 and it **ties exactly** to the vendor LTM capex | `Q2 FY26 10-Q, statements of cash flows`; `Capital IQ Financials export → Cash Flow` |
| **FCF (§15: CFO − capex)** | **659.9** | 772.8 − 112.9 | derived |
| + After-tax interest add-back (to reach unlevered FCFF) | +58.4 | LTM interest expense 74.9 × (1 − 0.220 normalized tax rate) | `Capital IQ Financials export → Income Statement`, LTM interest expense 74.9 |
| **= FCFF base (unlevered, the model's base)** | **718.3** | — | derived |
| *Memo:* vendor "Levered Free Cash Flow" | 468.2 | **Not used.** A different vendor definition (after interest and other items) — `ciq_facts.json` itself flags it as "NOT the §15 CFO−capex FCF" | `ciq_facts.json` `levered_fcf_m` |
| *Memo:* vendor "Unlevered Free Cash Flow" | 515.0 | **Not used.** Another vendor definition; the §15 build above is preferred and is reconcilable line by line | `Capital IQ Financials export → Cash Flow` |
| Company's own FCF definition | adds back proceeds from sale of property and equipment | Immaterial in H1 FY26 (nil proceeds); stated so the two are never mixed | `Q1 FY26 earnings presentation, 1-May-2026, slide 17` |

**Normalized effective tax rate: 22.0% — and this DCF reconciles to the moat module's canonical rate rather than deriving its own.** `business-model/09_moat.md` §3 published a normalized structural rate of **22.0%** as the anchor this agent must tie to, and it is used verbatim for NOPAT here and in the WACC debt shield. What was stripped, in that module's words and re-stated with its qualifiers intact: **(a)** FY2024's $92.8m non-cash charge establishing valuation allowances on deferred tax assets, which pushed the reported rate to 43.9%; **(b)** FY2023's roughly $174m deferred foreign tax benefit from a Swiss intangible step-up, which produced a negative reported rate; **(c)** the pre-2024 reported rates of 12.8–14.9%, which are structurally unrepeatable because the OECD Pillar II 15% global minimum tax took effect 1 January 2024 [`FY24 10-K, MD&A — Provision (benefit) for income taxes, p.24`; `FY24 10-K, Item 1A — tax risk factor`; `Capital IQ Financials export → Income Statement`, Effective Tax Rate %]. What remains — FY2025 at 22.1% and LTM Jun-2026 at 22.2% — is the post-Pillar-II structural rate. **The moat ROIC and this DCF therefore stand on one tax rate; they do not diverge.**

**The base is a cycle peak, and it is not treated as a perpetuity base.** LTM revenue of $4,834.0m is **+46.2%** on the prior twelve months and 24% above the whole of FY2025 [`earnings/01_historical-financials.md` §2]. Vendor ROIC of 9.5% LTM is about **1.5x** the roughly 6.4% pre-boom level [`business-model/07_business-quality.md` §4, via `09_moat.md` §3]. Nothing in this model capitalises the LTM level. The forecast starts from consensus, fades, and lands on a mid-cycle terminal margin benchmarked in §5.

---

## 2. Forecast Assumptions

**Horizon:** ten periods — a **stub half-year (H2 FY2026)** plus **FY2027 to FY2035** — then a terminal value. A ten-year explicit period is used deliberately: with revenue compounding at 13–17% in the near years, a five-year model would push the whole growth wave into the terminal value, which is the fastest way to a terminal-dominated, low-confidence answer.

**Valuation date: 30-Jun-2026** — the balance-sheet date, so the net debt in the §6 bridge is the same date as the cash flows. This is stated because it is a real (small) conservatism: the run date is 2026-09-07, 69 days later, so **not rolling the value forward understates it by about 1.9%** at the WACC below. That roll-forward is **not** taken.

| Assumption | H2-26 | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 | FY2032 | FY2033 | FY2034 | FY2035 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue (USD m) | 2,722.0 | 6,368.6 | 7,215.7 | 7,904.3 | 8,696.5 | 9,392.2 | 10,002.7 | 10,552.9 | 11,027.7 | 11,413.7 | 11,756.1 | FY2026–FY2030 **consensus**; FY2031–35 **analyst assumption** |
| Revenue growth % | — | +17.2% | +13.3% | +9.5% | +10.0% | +8.0% | +6.5% | +5.5% | +4.5% | +3.5% | **+3.0%** | as above |
| EBITDA margin % (GAAP-derived) | 21.6% | 22.5% | 22.8% | 22.8% | 22.5% | 22.0% | 21.5% | 21.0% | 20.5% | 20.0% | **20.0%** | FY26–28 **consensus-derived**; FY29 onward **analyst assumption** (fade) |
| Tax rate % | 22.0 | 22.0 | 22.0 | 22.0 | 22.0 | 22.0 | 22.0 | 22.0 | 22.0 | 22.0 | 22.0 | **cross-module canonical** — `09_moat.md` §3 |
| Capex (% of revenue) | 2.39% | 2.6% | 2.6% | 2.6% | 2.6% | 2.4% | 2.4% | 2.4% | 2.4% | 2.4% | 2.4% | FY2026 **company-guided**; rest **analyst assumption** |
| Δ Working capital | NWC held at **13.0% of revenue** (revenue-linked driver — see below) | | | | | | | | | | | **analyst assumption**, calibrated to FY2025 year-end |

**Label on every line, as required.**

| Assumption | Label | Evidence |
|---|---|---|
| FY2026 revenue 5,435.3 | **Company-guided, corroborated by consensus.** Guidance implies $5,333.55–5,411.41m (mid 5,372.5); consensus is 5,435.3 (16 of 17 estimates), 0.44% above the guidance high end | `Q2 FY26 transcript, prepared remarks` (+37–39% reported sales growth); `Capital IQ Estimates export → Consensus`, FY2026 revenue; `→ Guidance`, guidance date 2026-07-31 |
| FY2027 6,368.6 / FY2028 7,215.7 | **Consensus** — 17 and 10 estimates | `Capital IQ Estimates export → Consensus`, Fiscal Years block |
| FY2029 7,904.3 / FY2030 8,696.5 | **Consensus, but thin — 3 and 2 estimates only.** Standard deviation on the FY2030 revenue line is $659.5m on a $8,696.5m mean. Used, and flagged as thin | `Capital IQ Estimates export → Consensus`, Fiscal Years block, "No. of Estimates" rows |
| FY2031–FY2035 growth fade 8.0% → 3.5% | **Analyst assumption, not company-guided.** A straight glide from the last consensus year to the terminal rate. No company statement supports growth beyond FY2026 | this agent |
| FY2026 EBITDA margin 22.1% (full year; 21.6% for the H2 stub) | **Consensus-derived.** Consensus adjusted EBITDA 1,225.0 less roughly $25m of recurring acquisition and restructuring costs the company itself adds back = a GAAP-derived $1,200m, i.e. 22.1%. The H2 stub is that full-year figure less the H1 actual of $612.8m (operating income 195.7 + 300.7, plus D&A 57.9 + 58.5) | `Capital IQ Estimates export → Consensus`, FY2026 EBITDA; `Q1/Q2 FY26 10-Q, statements of operations and cash flows` via `earnings/01_historical-financials.md` §3–§4 |
| FY2027 22.5% / FY2028 22.8% | **Consensus-derived** (adjusted EBITDA margin 22.94% / 23.23% less ~0.4pp of recurring add-backs) | `Capital IQ Estimates export → Consensus` |
| FY2029–FY2035 margin fade 22.8% → 20.0% | **Analyst assumption.** Consensus reaches only FY2030 and does so on 1–2 EBITDA estimates. The fade is the Cyclicality Gate applied: it walks the margin off the forecast peak to the mid-cycle level benchmarked in §5 | this agent; benchmarks in §5 |
| Tax 22.0% | **Cross-module canonical** — see §1 | `business-model/09_moat.md` §3 |
| FY2026 capex $130m | **Company-guided** — "about $130 million", up roughly 40% year on year | `Q2 FY26 transcript, prepared remarks`; `Capital IQ Estimates export → Guidance`, Capital Expenditure FY2026 = −130 |
| FY2027–FY2030 capex 2.6% of revenue | **Analyst assumption**, stepped up from the 2.4% five-year norm to carry the announced capacity build — three liquid-cooling plants committed | `business-model/07_business-quality.md` §1 (rate-of-change row, citing `Q2 FY26 transcript`); history: capex/revenue 2.46% FY2023, 2.46% FY2024, 2.40% FY2025 [`Capital IQ Financials export → Cash Flow` and `→ Income Statement`] |
| FY2031–FY2035 capex 2.4% of revenue | **Analyst assumption** — reversion to the company's own five-year norm once the build-out is absorbed | as above |
| Terminal growth 3.0% | **Analyst assumption.** Below long-run US nominal GDP (roughly 4.0–4.5%: about 2% real plus 2–2.5% inflation) and well below the 4.79% risk-free rate. No moat premium is embedded — see §5 | this agent; risk-free rate per §3 |

### Working capital scales with revenue — the driver, and the sign

**Driver used: net working capital held at 13.0% of revenue.** Net working capital here = (receivables including contract assets + inventory + prepaid + other current assets) − (payables + accrued expenses + unearned revenue + other current liabilities); cash, debt, lease liabilities and current tax payable are excluded. All balances are taken from one consistent source so the ratio is measured the same way in every period.

| Date | NWC (USD m) | Revenue basis | NWC / revenue |
|---|---:|---|---:|
| 31-Dec-2025 | 499.8 | FY2025 3,893.1 | **12.84%** |
| 30-Jun-2026 | 726.7 | LTM 4,834.0 | 15.03% |

Source for both: `Capital IQ Financials export → Balance Sheet`, columns Dec-31-2025 and Jun-30-2026 (tier-5 vendor export, consistent basis). FY2023 and FY2024 are **not** used as anchors because both balance sheets carry assets and liabilities held for sale from the Thermal Management divestiture inside "other current assets / liabilities" [`earnings/01_historical-financials.md` §1, footnote ʰ] — using them would measure a divestiture, not working capital.

**Why 13.0% and not 15.0%.** nVent's working capital is seasonal: it builds in the first half and releases in the second. In FY2025, 76% of the year's operating cash arrived in H2, and working capital released about $129.7m in H2 after consuming $153.2m in H1 [`earnings/06_earnings-quality.md` §2]. The 30-Jun-2026 reading of 15.03% is therefore a mid-year peak, not the run-rate. The **year-end** reading (12.84%) is the right anchor, and 13.0% is that figure rounded.

**This is a positive-working-capital business, so growth ABSORBS cash — and the modelled ΔNWC confirms the sign year by year.** The cash conversion cycle is **+76.4 days** (DSO 73.2 + DIO 62.6 − DPO 59.4, LTM Jun-2026) [`earnings/06_earnings-quality.md` §3]. That is the opposite of a negative-working-capital distributor: here rising revenue makes NWC rise, which **consumes** cash and **subtracts** from FCF. The one exception in the model is the H2-2026 stub, where NWC falls from the mid-year peak of 726.7 to a year-end 706.6 — a **release of $20.1m that ADDS to FCF**. The sign in every year of §4 is read off the actual modelled `ΔNWC = NWC_t − NWC_{t−1}`, not from a fixed column convention, and the direction check passes: NWC rising ⇒ FCF cut; NWC falling ⇒ FCF lifted.

**Cross-check against the filings, and the conservatism it exposes.** The model's implied full-year FY2026 working-capital absorption is 706.6 − 499.8 = **$206.8m**, against **$218.4m** actually consumed in H1 FY26 on the filed basis [`Q2 FY26 10-Q, statements of cash flows`, via `earnings/06_earnings-quality.md` §2]. So the model implies a broadly flat H2 on working capital. The company's own FY2026 guidance of 90–95% free-cash-flow conversion implies a **much larger** H2 release: at the guidance midpoint that is roughly $768m of company-defined FCF, or about $820m of FCFF, against this model's $678m — a gap of about **$141m, essentially all of it working capital**. `earnings/06_earnings-quality.md` §2 calls that conversion target "demanding but not out of line with the company's own recent shape… a live test, not yet a failure". **This model does not grant the company's implied release.** That is a deliberate, stated conservatism; adopting it would raise the FY2026 cash flow by about $141m and the per-share value by roughly $0.8.

---

## 3. Discount Rate (WACC)

*(Plain meaning: the WACC — weighted-average cost of capital — is the blended annual return the company's lenders and shareholders together require. It is the rate future cash is discounted at, and it is the single most value-determining input in this report.)*

| Component | Value | Source |
|---|---:|---|
| Risk-free rate (rf) | **4.79%** | US 10-year Treasury yield. `Web: tradingeconomics.com US 10-Year government bond yield, retrieved 2026-09-07` (4.79% at the 2026-09-04 close, unchanged 2026-09-07) — **web-sourced, dated, unverified**; not in the data pool |
| Equity-risk premium (ERP) | **4.23%** | Damodaran implied ERP for US equities at the start of 2026, over the 10-year Treasury. `Web: aswathdamodaran.substack.com, "Data Update 2 for 2026", retrieved 2026-09-07` — **web-sourced, dated, unverified**; not in the data pool |
| Beta (equity, 5-year monthly, vs S&P 500) | **1.36** | `Web: finance.yahoo.com/quote/NVT, Beta (5Y Monthly), retrieved 2026-09-07` — **web-sourced, dated, unverified**; not in the data pool |
| **Cost of equity (k_e) = rf + β × ERP** | **10.54%** | 4.79% + 1.36 × 4.23% — computed, see snippet in §4 |
| Pre-tax cost of debt (k_d) | **5.30%** | Blend of (a) the **embedded** weighted-average coupon of **4.62%** — term loan 4.903% on $268.2m, 4.550% notes $500m, 2.750% notes $300m, 5.650% notes $500m [`Q2 FY26 10-Q, Note 10 (Debt)`] — and (b) the **marginal** market rate: ICE BofA BBB US Corporate index effective yield **5.59%** for August 2026 [`Web: tradingeconomics.com / FRED BAMLC0A4CBBBEY, retrieved 2026-09-07` — web-sourced, unverified]. 5.30% sits between the two because the cheapest tranche (2.750%, due 2031) reprices toward market as it matures and the company has said it will fund Maverick Power with new debt |
| Tax rate (t) — the debt shield | **22.0%** | Same normalized rate as NOPAT — `business-model/09_moat.md` §3 (see §1) |
| After-tax cost of debt = k_d × (1 − t) | **4.13%** | 5.30% × 0.78 |
| Equity weight (w_e) / debt weight (w_d) | **94.89% / 5.11%** | Market value of equity = market cap **27,703.6** at the pool-verified anchor price of $171.16 (close 2026-08-12); debt at carrying value **1,492.4** (filing debt-note basis) — both taken verbatim from `01_price-and-capital-structure` §7 Anchor Block. Debt is investment-grade and carried near par, so book is used as a market-value proxy; stated, not assumed silently. Weights sum to 1.000000 |
| **WACC** | **10.22%** | `0.948883 × 10.5428% + 0.051117 × 4.1340% = 10.2152%` — produced by the executed snippet in §4, not assembled by hand |

**Formula, pinned:** `WACC = w_e·k_e + w_d·k_d·(1 − t)`. There is **no preferred equity and no minority interest** on this balance sheet [`Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`; `Capital IQ Financials export → Key Stats`, "Pref. Equity –", "Total Minority Interest –"], so no `w_p·k_p` term exists. `k_e` is the CAPM cost of equity; `k_d` is the pre-tax cost of debt; `(1 − t)` is the debt tax shield — interest is tax-deductible, so debt costs the company less than its coupon.

**No analyst override was applied.** The used WACC **is** the mechanically-computed WACC, 10.22%. Nothing was adjusted by judgment, so the ±1.5pp override discipline is not engaged.

**Sanity bounds — checked and cleared (MODULE_RULES Economic Consistency Gate 4).**

| Test | Requirement | Result |
|---|---|---|
| Arithmetic band | `after-tax k_d ≤ WACC < k_e` | **4.13% ≤ 10.22% < 10.54% — PASSES.** The WACC sits strictly below the cost of equity, as it must for a firm carrying debt |
| High-side ceiling (developed-market large-cap) | `k_e` not materially above `rf + 1.4 × ERP` | `rf + 1.4 × ERP = 10.71%`; `k_e = 10.54%` — **below the ceiling.** The beta of 1.36 is the actual sourced 5-year monthly figure, not an assumption, and is under 1.4 |
| **Low-side floor 1 — equity-risk-premium floor** | `k_e − rf ≥ ~4pp` | **5.75pp — PASSES.** This is a genuine equity cost of capital, not a bond yield with a garnish |
| **Low-side floor 2 — beta floor** | `β ≥ ~0.8` for a cyclical / commodity-input / price-competed business | **1.36 — PASSES, with source, window and index stated:** 5-year monthly beta against the S&P 500, `Web: finance.yahoo.com/quote/NVT, retrieved 2026-09-07`. No flooring or re-levering was needed. The figure is consistent with the business: `10_external-dependency.md` scores external dependency 60/100 (inverted) and the copper/steel/resin input exposure and price competition are documented there |
| **Low-side floor 3 — country / single-market risk** | State a country-risk premium, or state the omission deliberately | **No country-risk premium is added, and that is a deliberate stated choice.** Cash flows are 81% Americas, 15% EMEA, 4% Asia-Pacific [`ciq_facts.json` `geographic`, 12 months Dec-31-2025], the reporting and cash-flow currency is USD (a reserve currency), and the risk-free rate used is the US Treasury. There is no emerging-market or non-reserve-currency concentration to price |
| Terminal `g` vs nominal growth | `g` ≤ long-run nominal GDP for the currency's economy | **3.0% vs roughly 4.0–4.5% US nominal GDP — PASSES**, and `g` is also well below the 4.79% risk-free rate |

**Cross-check against the moat module's cost of capital (Gate 4).** `business-model/09_moat.md` §3 runs its economic-moat test at the **10.0%** rate nVent discloses. This model's 10.22% is **0.22pp above** it — far inside the 2pp divergence trigger, so no spanning grid is required. The two modules stand on the same cost of capital, and the §7 grid spans 9.22%–11.22%, which contains both.

---

## 3A. Cost-of-Capital Reality Test (mandatory — CLAUDE.md §16, MODULE_RULES Gate 4)

**The filings were searched for disclosed discount rates, and each was scope-tested before use.** Three exist in this pool. Only one clears the five-way match (valuation object, cash-flow geography, currency, pre-/post-tax basis, method).

| Reference | Rate | Source (cited per §5) | Gap vs model WACC |
|---|---:|---|---:|
| **Model WACC (CAPM build, §3)** | **10.22%** | this agent, §3 | — |
| **Scope-matched group discount rate** | **10.00%** | `FY24 10-K, MD&A — Critical Accounting Estimates, Goodwill and indefinite-lived intangibles, p.32`: *"Discount rate assumptions for each reporting unit take into consideration our assessment of risks inherent in the future cash flows of the respective reporting unit and **our weighted-average cost of capital**. We utilized a **10.0% discount rate for each reporting unit**…"* | model is **+0.22pp above** |
| Other disclosed rate — lease incremental borrowing rate (**comparator only**) | 5.1% operating / 6.0% finance | `FY24 10-K, lease note` — weighted-average discount rate on lease liabilities, 31-Dec-2024 | −5.1pp / −4.2pp |
| Other disclosed rate — pension obligation discount rate (**comparator only**) | 1.00%–5.39% (2024 range) | `FY24 10-K, pension note — Discount rates` | −9.2pp to −4.8pp |
| Market-implied rate | **Not yet available** | `05_reverse-dcf` runs **after** this agent (MODULE_RULES → Execution Layers) and inverts this model — reconcile there | n/a |
| Company's own trailing FCF yield | 1.69% levered / 2.38% on the §15 basis | Levered FCF 468.2 ÷ market cap 27,703.6 [`ciq_facts.json` `levered_fcf_m`; `01_price-and-capital-structure` §3]; §15 FCF 659.9 ÷ 27,703.6 [`earnings/01_historical-financials.md` §2] | −8.5pp / −7.8pp |
| Company's own trailing earnings yield | 2.10% | 1 ÷ P/LTM EPS 47.5x [`ciq_facts.json` `pe_ltm_current_x`; `Capital IQ Financials export → Multiples`, Close 2026-08-12] | −8.1pp |
| Peer / industry cost of capital | **Not evidenced.** No peer WACC exists in this pool (`ciq_facts.json` `peer_ev_ebitda: missing` — "CIQ 'comps' export not found") | — | — |

**Why the 10.0% clears the scope test where a normal impairment rate would not.** A CGU or reporting-unit rate is usually a comparator only. This one is different, and the reason is on the face of the disclosure: **the same single rate is applied to *every* reporting unit**, so it spans the whole consolidated group rather than one carved-out unit. The cash flows it discounts are the group's own operating cash flows in **USD**, the same currency as this model; it is an **after-tax** rate applied to after-tax cash flows, the same basis as this model; and the company names it **its weighted-average cost of capital**, the same method. Five-way match. **One limitation, stated not hidden:** it is the **FY2024** rate, because the FY2025 10-K is absent from this pool [`00_valuation-data-triage` §6]. Management's own capital-allocation hurdle — *"Target ROIC > WACC in 3 years"* [`Q1 FY26 earnings presentation, 2026-05-01, slide 9`] — corroborates that the company runs to this rate.

**The lease and pension rates are comparators only and cannot anchor this valuation.** The lease rate is a *collateralized borrowing* rate, not a cost of capital; the pension rate is an *obligation settlement* rate matched to high-quality fixed-income instruments. Both fail the method match, and the pension rate additionally spans multiple currencies and plan geographies. Neither may trigger a re-run of the DCF.

**Escalation: the trigger did NOT fire.** The model WACC of 10.22% is **above**, not below, the scope-matched group rate of 10.00% — the gap is +0.22pp, nowhere near the "more than ~3pp below" threshold. The market-implied rate is not yet computable because `05_reverse-dcf` runs after this agent; there is therefore no "below two-thirds of the market-implied rate" test to fail here, and `05` is instructed to reconcile against this rate rather than re-derive one. Because no escalation branch was taken, **no `RF-VAL-003` tag is emitted** — the tag is mandatory only when the trigger fires, and it did not.

**On the low trailing yields — tested, not assumed away.** nVent's own trailing free-cash-flow yield (1.69–2.38%) and earnings yield (2.10%) sit roughly 8pp *below* the model WACC. Under §16 the first hypothesis when a model rate sits far below outside reads is that the model rate is wrong — but here the model rate is far *above* those yields, which is the opposite configuration. The low yields are what a market pricing rapid growth looks like, not evidence of a 2% cost of capital; `09_moat.md` §3 reaches the same conclusion on the same two numbers. No adjustment is made.

---

## 4. Free Cash Flow Forecast & Discounting

**FCFF identity used (MODULE_RULES Gate 1, option b):** `FCFF = NOPAT + D&A − capex − ΔNWC`, where `NOPAT = EBIT × (1 − 22.0%)` and `EBIT = EBITDA − D&A`. This definition is used consistently and is never mixed with the `CFO − capex` route; the two are **reconciled** on the base year in §1 and again at the foot of this section. *(Plain meaning: NOPAT is operating profit after tax but before any interest; D&A — depreciation and amortisation — is added back because it is a bookkeeping charge, not cash leaving the business.)*

**Discounting convention: mid-year (t − 0.5), the default.** Cash arrives across the year, not on 31 December, so each year is discounted from its mid-point. From the 30-Jun-2026 valuation date, FY2027's mid-point (30-Jun-2027) is exactly **t = 1.0**, FY2028's is **t = 2.0**, and so on; the H2-2026 stub's mid-point (30-Sep-2026) is **t = 0.25**. The terminal value is a value as at 31-Dec-2035 and is discounted at **t = 9.5**. No end-of-year discounting is used anywhere.

**D&A is modelled in two parts, because they behave differently.** *Depreciation* is 1.5–1.6% of revenue and tracks the capex cycle. *Intangible amortisation* from past acquisitions runs off on a schedule — $150m in FY2026 falling to $85m by FY2035 — against the $1,793.3m of net intangibles on the 30-Jun-2026 balance sheet [`Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`]. Amortisation is added back in full (it is non-cash) but its run-off is *not* replaced by new capex, because no future acquisitions are modelled.

```
$ python3 dcf3.py
Yr             Rev   EBITDA     EBIT    NOPAT     D&A   Capex     dNWC     FCFF     DF       PV
H2-2026     2722.0    588.4    474.8    370.3   113.6    72.4    -20.1    431.7 0.9760    421.3
FY2027      6368.6   1432.9   1187.4    926.2   245.5   165.6    121.3    884.8 0.9073    802.8
FY2028      7215.7   1645.2   1384.7   1080.1   260.5   187.6    110.1   1042.8 0.8232    858.5
FY2029      7904.3   1802.2   1535.7   1197.9   266.5   205.5     89.5   1169.3 0.7469    873.4
FY2030      8696.5   1956.7   1682.6   1312.4   274.1   226.1    103.0   1257.5 0.6777    852.2
FY2031      9392.2   2066.3   1791.0   1397.0   275.3   225.4     90.4   1356.4 0.6149    834.0
FY2032     10002.7   2150.6   1875.5   1462.9   275.0   240.1     79.4   1418.5 0.5579    791.4
FY2033     10552.9   2216.1   1942.3   1515.0   273.8   253.3     71.5   1464.0 0.5062    741.1
FY2034     11027.7   2260.7   1989.2   1551.6   271.4   264.7     61.7   1496.7 0.4593    687.4
FY2035     11413.7   2282.7   2015.1   1571.8   267.6   273.9     50.2   1515.3 0.4167    631.4
SUM PV explicit FCFF = 7493.4
```

**Sum of the present values of the explicit forecast free cash flows: USD 7,493.4m.**

**Working-capital sign check, per year, done explicitly.**

| Year | Modelled ΔNWC | Direction of NWC | Cash effect | Effect on FCFF |
|---|---:|---|---|---|
| H2-2026 | **−20.1** | falls (mid-year peak releases into year-end) | **release** | **ADDS +20.1** |
| FY2027 | +121.3 | rises | absorbs | subtracts 121.3 |
| FY2028 | +110.1 | rises | absorbs | subtracts 110.1 |
| FY2029 | +89.5 | rises | absorbs | subtracts 89.5 |
| FY2030 | +103.0 | rises | absorbs | subtracts 103.0 |
| FY2031 | +90.4 | rises | absorbs | subtracts 90.4 |
| FY2032 | +79.4 | rises | absorbs | subtracts 79.4 |
| FY2033 | +71.5 | rises | absorbs | subtracts 71.5 |
| FY2034 | +61.7 | rises | absorbs | subtracts 61.7 |
| FY2035 | +50.2 | rises | absorbs | subtracts 50.2 |

The direction matches the business: with a cash conversion cycle of **+76.4 days**, a growing nVent ties up more cash each year, so the working-capital line **cuts** FCFF in every growth year. That is the correct sign for a positive-working-capital company and is not inverted. The single release is the H2-2026 seasonal unwind, and it correctly **adds**.

**WACC blend — executed, not eyeballed.**

```
$ python3 dcf.py
=== WACC BLEND (formula: w_e*k_e + w_d*k_d*(1-t)) ===
k_e (CAPM) = 0.0479 + 1.36*0.0423 = 0.105428  -> 10.54%
k_d pre-tax 5.30% ; after-tax = 4.134%
w_e = 0.948883 (94.89%) ; w_d = 0.051117 (5.11%) ; sum = 1.000000
WACC = 0.948883*0.105428 + 0.051117*0.041340 = 0.102152 -> 10.22%
GATE: after-tax k_d 4.13% <= WACC 10.22% < k_e 10.54% ? True
FLOOR: k_e - rf = 5.75pp (need >= ~4pp); beta 1.36 (need >= 0.8)
HIGH-SIDE CEILING: rf + 1.4*ERP = 10.71%  vs k_e 10.54%
```

**Reconciliation of the two FCFF routes on the base year (Gate 1 — the definitions must tie).**

```
$ python3 dcf3.py  (tail)
FY2026 model FCFF = H1 actual FCFF + H2 model:
  H1 CFO 278.7 - capex 57.6 + after-tax interest 25.7 = 246.8 ; H2 model 431.7 ; FY2026 total 678.5
Company FY2026 guide implies FCFF ~= 0.925*830.7 + 0.78*65.9 = 819.8  (gap vs model = 141.3)
LTM Jun-26 actual FCFF = CFO 772.8 - capex 112.9 + after-tax interest 58.4 = 718.3
```

The filed H1 FY2026 cash flow statement plus this model's H2 gives **$678.5m** of FY2026 FCFF, against **$718.3m** actually delivered in the LTM to 30-Jun-2026 and **$819.8m** implied by the company's own 90–95% conversion guidance. The model therefore sits **below both** the trailing actual and the guidance — the working-capital conservatism explained in §2, quantified at about $141m.

---

## 5. Terminal Value

**Method: Gordon growth, with the terminal return on capital pinned to the cost of capital.**

**Formula, written out rather than applied from memory:**

`TV = FCFF_{n+1} / (WACC − g)`, where `FCFF_{n+1} = NOPAT_{n+1} × (1 − g / ROIC_terminal)`

The `(1 − g / ROIC)` term is the **reinvestment charge** — growth is not free, and a company growing at `g` while earning `ROIC` must plough back `g / ROIC` of its after-tax operating profit to fund it. Setting `ROIC_terminal = WACC` collapses the whole expression to `TV = NOPAT_{n+1} / WACC` — the identity that says a business earning exactly its cost of capital creates **no value from growth**. That is precisely what "no perpetual excess return" means, and the model prints both forms and confirms they agree to the dollar.

**`WACC − g` is comfortably positive: 10.2152% − 3.0% = 7.22pp.** Nowhere near the 1–2pp convergence zone where the denominator collapses and the terminal value explodes. Across the entire §7 grid the smallest gap is 9.22% − 3.5% = **5.72pp**, so **no grid cell is NM or invalid** and none needs suppressing.

**Terminal assumptions and the base result.**

```
$ python3 dcf3.py
=== BASE TERMINAL (Gordon, terminal ROIC = WACC -> no perpetual excess return) ===
Rev_T 11756.1 @ EBITDA margin 20.0% ; D&A=capex 2.4% ; EBIT_T 2069.1 (17.6% margin) ; NOPAT_T 1613.9
reinvestment = g/ROIC = 0.03/0.102152 = 29.4% ; FCFF_n+1 = 1613.9*(1-0.2937) = 1139.9
TV = 1139.9/(0.102152-0.03) = 15798.8   [identity check NOPAT/WACC = 15798.8]
PV(TV) @ t=9.5 = 6270.9 ; EV = 7493.4+6270.9 = 13764.3 ; TV%EV = 45.6%
EV 13764.3 - net debt 1236.4 - MI 0 - pref 0 = equity 12527.9 ; /164.2m = $76.30/sh
Implied exit EV/EBITDA on FY2035 EBITDA 2282.7 = 6.92x
vs price 171.16 -> -55.4% ; vs 156.03 -> -51.1%
```

- **Terminal value (undiscounted): USD 15,798.8m**
- **PV of terminal value: USD 6,270.9m**
- **Terminal value as % of total EV: 45.6%** — comfortably **below the 75% terminal-dominance flag**. The ten-year explicit horizon is what keeps it there; on a five-year horizon the same assumptions would put more than three-quarters of the value in the terminal and trip the low-confidence cap.

### The mid-cycle terminal margin — benchmarked against peer-normal AND the company's own prior trough (Cyclicality Gate)

The terminal EBITDA margin of **20.0%** implies a terminal **EBIT margin of 17.6%**. It is not set by "below the recent peak"; it is placed inside a cited range with both anchors named.

| Anchor | Level | Source |
|---|---:|---|
| **Peer-normal (upper anchor)** | Hubbell **20.7%** group GAAP operating margin (22.7% adjusted); Legrand **20.7%** adjusted operating margin | `business-model/09_moat.md` §2 peer table, inherited from `08_competitive-map.md` §2d (Hubbell FY2025 results release, 2026-02-03; Legrand FY2025 results release, 2026-02-12 — company releases, unverified web copies) |
| **Company's own prior trough (lower anchor)** | FY2022 EBIT margin **13.5%** on the filing basis (**16.2%** on the Capital IQ basis; the gap is a $58.5m pension-income classification, itemised in `earnings/01` §1); FY2022 EBITDA margin **17.2%** | `earnings/01_historical-financials.md` §1; `Capital IQ Financials export → Income Statement` |
| **Company's own recent normal** | EBIT margin 17.3% (FY2023), 17.5% (FY2024), 15.8% (FY2025); EBITDA margin 21.6% / 22.4% / 21.2% | `earnings/01_historical-financials.md` §1 |
| **Recent / forecast peak — rejected as a terminal** | Q2 FY26 GAAP operating margin **20.4%**; LTM EBITDA margin **22.2%**; the model's own FY2028–29 forecast peak **22.8%** | `Q2 FY26 10-Q, MD&A`; `ciq_facts.json` `margin_trend`; §2 above |
| **Terminal set here** | **EBIT 17.6% / EBITDA 20.0%** | **Between the anchors:** about 3.1pp below peer-normal EBIT, about 1.4–4.1pp above the company's own prior-trough EBIT, and roughly at its own FY2023–FY2024 normal — while sitting 2.8pp of EBITDA margin **below** the forecast peak |

`earnings/01` and `01_price-and-capital-structure` both flag the latest period as a cycle peak, so a terminal at or near that peak is rejected outright. The evidence supports a mid-cycle placement, not a trough: the pre-boom EBITDA margin was 21.2–22.4% in FY2023–FY2025 and only 17.2% in FY2022, a year distorted by the pension classification. Placing the terminal at 20.0% is a real haircut without imposing a trough the history does not support.

### Financeable-growth cross-check (MODULE_RULES Gate 2) — run, and it drives the terminal design

```
$ python3 dcf3.py
=== FINANCEABLE-GROWTH CROSS-CHECK (Gate 2) ===
IC(total, 30-Jun-26)=5479.3 ; tangible IC=1307.4
cum capex 2114.6 ; cum D&A 2523.4 ; cum intangible amort ~1320.0 ; cum depreciation ~1203.4
implied net PP&E FY2035 1491.8 (13.1% of revenue, vs 12.0% today)
implied NWC FY2035 1483.8 ; tangible IC FY2035 2975.6 (26.1% of revenue vs 27.0% today)
ROIC on tangible IC FY2035 = 52.8% ; on tangible IC + goodwill/intangibles held flat = 21.1%
FY2035 reinvestment rate (capex-D&A+dNWC)/NOPAT = 3.6%
implied g = ROIC(incl goodwill) x reinvestment = 0.76%  vs modelled terminal g 3.0%
TERMINAL reinvestment charged = 29.4% at ROIC_T 10.22% -> implied g 3.00% = modelled g 3.0% (CONSISTENT by construction)
```

**Read this in two halves, because they say different things.**

- **The explicit period is financeable on tangible capital.** Cumulative capex of $2,114.6m against roughly $1,203.4m of depreciation leaves net property, plant and equipment at about 13.1% of revenue in FY2035 against 12.0% today, and working capital is held at 13.0% throughout. Tangible invested capital ends at 26.1% of revenue against 27.0% today. The forecast does not conjure revenue out of no capital.
- **A conventional terminal would have FAILED Gate 2, so it was not used.** Setting terminal capex equal to D&A — the usual shortcut — charges reinvestment of only **3.6% of NOPAT**, which at the company's own returns finances growth of about **0.76%**, against a modelled 3.0%. That is a **2.24pp gap and no bridge**, well past the 1.5pp trigger. Rather than flag it and carry on, the terminal was **rebuilt** to charge the full reinvestment `g / ROIC = 29.4%` of NOPAT. The modelled `g` and the financeable `g` are now equal by construction. That rebuild costs about **$14.4/share** against the shortcut version, and taking that cost is the point of the gate.

**Terminal ROIC drift (Gate 3), and why there is no persistence premium.** `business-model/09_moat.md` §5 returns **"No moat proven — a moat in structure, not in economics"**: through-cycle return on capital of **8.10%** (FY2022–FY2025, computed NOPAT basis at the same 22.0% tax rate) against the company's own **10.0%** disclosed cost of capital — a gap of about −190bps — clearing the rate only in the peak LTM year, only on the more generous of two measurement bases. No evidence supports persistent excess returns, so terminal ROIC is set **equal to the WACC**. That is the §5(a) requirement applied literally: **a fade to the cost of capital with no moat premium, not a decline.**

### Structural-decline / runoff terminal (avoid-ruin, CLAUDE.md §24 Filter 5)

**Which trigger fired, and on what row.** Both limbs of the §5 rule engage, and they do different things:

- **Limb (a) — "No moat proven".** `business-model/09_moat.md` §5. This is an *unproven*, not a *decaying*, franchise. It is handled **inside the base case above**: terminal ROIC faded to the cost of capital, terminal `g` at 3.0% with no moat premium. **A fade, not a runoff.**
- **Limb (b) — rate-of-change / disruption ≤ 40.** `business-model/07_business-quality.md` §1 scores **industry rate-of-change 40/100**, tripping CLAUDE.md §24 Filter 5 and emitting `RF-BQ-005`. The cited evidence: liquid cooling is "maybe it's now 10% to 15% of cooling in data centers", the 800-volt DC rack architecture is unsettled, and chip roadmaps are being rewritten out to 2030 [`Q2 FY26 transcript, Q&A`], while 100% of the growth and 100% of the incremental capital sit in that fast-changing part. **This limb requires a declining-perpetuity terminal to be built and shown beside the base.**

```
$ python3 dcf3.py
=== RUNOFF / STRUCTURAL-DECLINE TERMINAL (bear input; nominal g 0.0% = negative real) ===
Rev_T 11413.7 @ 17.5% EBITDA margin ; NOPAT_T 1344.3 ; TV = 13159.9 ; PV(TV)=5223.5
EV 12716.8 ; equity 11480.4 ; $69.92/sh ; TV%EV 41.1% ; exit x 5.76x
```

| Terminal | Nominal `g` | Real `g` | Terminal EBITDA margin | TV | PV(TV) | EV | **Per share** |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Base — fade to cost of capital (§5(a))** | **+3.0%** | about +0.7% | 20.0% (mid-cycle) | 15,798.8 | 6,270.9 | 13,764.3 | **$76.30** |
| **Runoff / structural decline (§5(b), the BEAR input)** | **0.0%** | about **−2.3%** | **17.5%**, non-recovering | 13,159.9 | 5,223.5 | 12,716.8 | **$69.92** |

**The runoff is stated on the same nominal basis as the rest of this model — no real rate is smuggled in.** US expected inflation is roughly 2.3%, so a **0.0% nominal** terminal growth rate is a **negative real** growth rate of about −2.3% a year in perpetuity: the franchise shrinks in real terms forever. The terminal EBITDA margin is faded to **17.5%**, at the company's own FY2022 trough level (17.2%) and roughly 3pp below peer-normal, and it does **not** recover.

**This runoff does NOT replace the base.** `04` publishes **one** base intrinsic value — **$76.30** — and the runoff at **$69.92** sits beside it as the structural-impairment input that `07_scenario-and-fair-value` may use to build a `bear_structural` case and that the master synthesizer reads for its §24 / Kill Criteria work. It is the equity-side counterpart to the balance-sheet-survival module's debt-solvency test.

### Exit-multiple cross-check (the second lens on the terminal)

```
$ python3 dcf3.py
=== EXIT-MULTIPLE CROSS-CHECK (TV = FY2035 EBITDA x multiple) ===
   6.9x -> TV  15750.9 ; PV(TV)   6251.9 ; EV   13745.3 ; $  76.18/sh
   9.0x -> TV  20544.7 ; PV(TV)   8154.6 ; EV   15648.0 ; $  87.77/sh
  12.0x -> TV  27392.9 ; PV(TV)  10872.9 ; EV   18366.2 ; $ 104.32/sh
  15.0x -> TV  34241.1 ; PV(TV)  13591.1 ; EV   21084.4 ; $ 120.88/sh
```

**The two lenses are cross-read, in both directions, as the rule requires.** The Gordon terminal implies an exit multiple of **6.92x** FY2035 EBITDA. That is low against where nVent trades today (TEV/LTM EBITDA **26.2x**, on a short 6-close range of 15.4–30.3x with a median of 23.2x [`ciq_facts.json` `range_position`]) and low against where mature electrical-equipment peers typically trade. **Neither number is wrong — the gap between them IS the finding**, and it is exactly the arithmetic of a no-excess-return terminal: a business earning precisely its 10.2% cost of capital is worth `NOPAT ÷ WACC`, which on a 69% NOPAT-to-EBITDA conversion is about 6.8x EBITDA, whatever multiple the market is paying today. Read the other way: **even a 15.0x exit multiple — a mature-industrial multiple, well above the implied 6.9x and still far below today's 26.2x — produces only $120.88 a share**, still 22.5% below the fresher indicative price of $156.03. The terminal assumption is not what closes the gap to the market price.

---

## 6. DCF Output

Bridge components taken **verbatim** from `01_price-and-capital-structure` §7 Anchor Block (MODULE_RULES → Reconciliation Gate 1). No component is re-derived and none is substituted.

| Step | Value (USD m unless stated) |
|---|---:|
| PV of explicit FCFs (H2-2026 → FY2035, mid-year convention) | **7,493.4** |
| + PV of terminal value (Gordon, terminal ROIC = WACC, g = 3.0%, discounted at t = 9.5) | **6,270.9** |
| **= Enterprise value** | **13,764.3** |
| − Net debt (**strict §15 basis**; broad basis identical — no short-term investments) | **(1,236.4)** |
| − Minority / non-controlling interest | (0.0) |
| − Preferred equity | (0.0) |
| + Equity-method investments | 0.0 |
| **= Equity value** | **12,527.9** |
| ÷ Diluted shares (fully diluted, `01` §2: 161.858m + 2.3m treasury-stock-method increment; no convertibles) | **164.2m** |
| **= Intrinsic value per share** | **USD 76.30** |
| vs current price — **pool-verified anchor USD 171.16 (close 2026-08-12)** | **−55.4%** |
| vs current price — **indicative refresh USD 156.03 (close 2026-09-04, web-sourced, unverified)** | **−51.1%** |

**Anchor-consistency statement.** Net debt of **1,236.4** is `01`'s canonical strict-basis figure (total debt 1,492.4 on the filing debt-note basis, less cash 256.0), which is itself `balance-sheet-survival/01_capital-structure-and-leverage.md`'s filing-verified number. The Capital IQ vendor figure of 1,376.9 is **not** used; the entire $140.5m difference is operating-lease liabilities, and the filing wins under CLAUDE.md §4. Share count 164.2m is `01`'s per-share fair-value count. Nothing here diverges from `01`.

**Price staleness carried forward.** `01` tags the price-state **`pool-verified`** but flags the anchor as **26 calendar days / about 17–19 trading days stale**, with a corroborated indicative refresh at **$156.03** (a −8.84% drift) and a **valuation-confidence cap of 60**. Both price comparisons are shown above, and the fresher one is stated. **The fair-value level of $76.30 is price-independent and does not move when the anchor is re-anchored** — only the percentage comparisons do.

---

## 7. Sensitivity Grid (per-share intrinsic value)

**Required grid — WACC across columns, terminal growth down rows.** Terminal ROIC is held at 10.22% (the base cost of capital) as a property of the business rather than of the discount rate; the terminal EBITDA margin stays at 20.0%.

| | WACC 9.22% | **WACC 10.22%** | WACC 11.22% |
|---|---:|---:|---:|
| g +0.5% (3.5%) | 89.21 | 76.48 | 66.94 |
| **g 3.0% (base)** | 88.39 | **76.30** | 67.07 |
| g −0.5% (2.5%) | 87.66 | 76.11 | 67.17 |

**Grid guard:** the smallest `WACC − g` in the table is 9.22% − 3.5% = **5.72pp**. No cell is at or near zero, so **no cell is NM or invalid** and every figure is a real number.

**Read the flatness down the rows — it is a finding, not a bug.** Moving terminal growth by a full percentage point moves the value by under $1.60 a share at the base WACC. That is the direct consequence of the no-excess-return terminal: when a business earns exactly its cost of capital, **growth creates no value**, so the terminal value collapses to `NOPAT ÷ WACC` and barely responds to `g`. Almost all the dispersion in this DCF comes from the **discount rate** and from the **terminal profitability**, not from growth. Two supplementary grids show where the value actually moves.

**Supplementary grid A — WACC × terminal return on capital** (the live swing factor; 13.6% is the peer level from Hubbell/Legrand, 9.0% is roughly nVent's own recent clean-year return):

| ROIC_terminal | WACC 9.22% | **WACC 10.22%** | WACC 11.22% |
|---|---:|---:|---:|
| 13.6% (peer level) | 93.39 | 80.25 | 70.26 |
| 12.0% | 91.38 | 78.66 | 68.98 |
| **10.22% = WACC (base)** | 88.39 | **76.30** | 67.07 |
| 9.0% (nVent's own FY2025 clean-year level) | 85.67 | 74.15 | 65.34 |

**Supplementary grid B — WACC × terminal EBITDA margin** (the Cyclicality Gate swing; 22.5% is the forecast peak, 17.5% is the FY2022 trough):

| Terminal EBITDA margin | WACC 9.22% | **WACC 10.22%** | WACC 11.22% |
|---|---:|---:|---:|
| 22.5% (at the forecast peak — rejected as a base) | 95.26 | 81.72 | 71.45 |
| 21.5% | 92.51 | 79.55 | 69.70 |
| **20.0% (base, mid-cycle)** | 88.39 | **76.30** | 67.07 |
| 18.5% | 84.27 | 73.04 | 64.45 |
| 17.5% (own FY2022 trough level) | 81.52 | 70.87 | 62.70 |

**The full dispersion across all three grids is $62.70 to $95.26.** Every cell in every grid sits below both the $171.16 anchor and the $156.03 indicative price.

---

## 8. Intrinsic Read

**On discounted cash flow, nVent is worth $76.30 a share — the single base-case point — against a pool-verified anchor price of $171.16 (close 2026-08-12) and a fresher indicative $156.03 (close 2026-09-04), i.e. 55.4% and 51.1% below.** The sensitivity grids put the dispersion around that point at **$66.94–$89.21** on the required WACC-by-growth grid and **$62.70–$95.26** across the wider WACC-by-terminal-ROIC and WACC-by-margin grids; the structural-decline terminal required by the rate-of-change trigger gives **$69.92** as the bear input, and even a 15x exit multiple on FY2035 EBITDA reaches only **$120.88** — no cell anywhere in this model touches the traded price.

**The single assumption the answer is most sensitive to is not growth — it is the terminal return on capital, and behind it the discount rate.** Moving terminal growth a full percentage point moves the value by under $1.60 a share, because the base terminal pins return on capital to the cost of capital, and a business earning exactly its cost of capital creates no value by growing. Move that terminal return to the peer level of 13.6% and the value goes to $80.25; move the WACC down a point and it goes to $88.39. Both together reach $93.39 — still 40% below the fresher price.

**The gap between $76 and $156 is the whole story of this stock, and it is a disagreement about the terminal, not about the next three years.** This model takes consensus revenue and margin unchanged through FY2030 — a business almost doubling in five years — and still lands at less than half the price, because it refuses to capitalise a return above the cost of capital into perpetuity for a company whose own filings disclose a 10.0% weighted-average cost of capital and whose through-cycle return on capital is 8.1%. `05_reverse-dcf` inverts exactly this model, at this WACC (10.22%) and this normalized FCFF base ($718.3m LTM), and will name what the market is assuming instead.

---

### Confidence and limitations carried to `07` and `99`

- **Terminal value is 45.6% of enterprise value** — below the 75% terminal-dominance flag, so no terminal-dominance cap arises from this agent. The exit-multiple second lens is nonetheless provided in §5.
- **A cash flow statement exists and forward estimates exist**, so neither the "proxied FCF" nor the "no consensus" partial-data cap applies to this agent.
- **Genuine limitations, stated:** (1) the **FY2025 Form 10-K is absent from this pool**, so FY2025 annual figures used above are Capital IQ vendor or company-deck sourced and are cited as such, never to a filing; (2) **FY2029 and FY2030 consensus rests on 3 and 2 estimates**, and FY2031–FY2035 is entirely this agent's assumption; (3) the company's disclosed 10.0% cost of capital is the **FY2024** rate, for the same reason as (1); (4) the risk-free rate, equity-risk premium, beta and BBB index yield are **web-sourced, dated and unverified** — none is in the data pool; (5) the model is **pre-Maverick-Power on both the cash-flow and the debt side**, and (6) the value is struck as at **30-Jun-2026**, about 1.9% below what a roll-forward to the 2026-09-07 run date would give.
- **`01`'s price-staleness cap of 60 on valuation confidence** travels with every price comparison in this report.
