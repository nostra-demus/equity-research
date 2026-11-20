# Intrinsic DCF — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Run date:** 2026-11-20
**Reporting standard:** US GAAP · **Reporting currency:** USD, millions unless stated · **Fiscal year ends 31 March** ("FY2027" = 1 Apr 2026 → 31 Mar 2027, not a calendar year) [`FY26 10-K, cover page`; `Q2 FY27 10-Q, cover page`].
**Valuation date for discounting:** **2026-09-30** — the balance-sheet date behind the canonical net-debt anchor. Price anchor is 2026-11-19 (a 7-week gap, inherited from `01`).

**Business-type gate applied.** `00_valuation-data-triage` §3 classifies TTWO as an **OPERATING** company (interactive-entertainment publisher, **one** operating and reportable segment) — not a financial, REIT, commodity producer or holding company [`FY26 10-K, Note 21`]. Per the Business-Type Method Map an **FCFF DCF plus an EV→equity bridge is the valid intrinsic method**, so that is what is built below. One overlay binds hard: `business-model/07_business-quality.md` scores **cyclicality 22/100** and `10_external-dependency.md`/`09_moat.md` both describe a release-slate cycle, so the **Cyclicality Gate** applies — the FCF base and the terminal margin are normalized mid-cycle figures, benchmarked in §5 against peer-normal **and** the company's own prior-trough, never a single peak or trough year.

**Source-check status carried forward: UNCHECKED, not verified clean.** This frozen generation carries **no `numeric_reading_check`** at any source or sheet level and the corpus carries no labelled extractor reading-warning annotation. There is therefore **no literal warning token, no source/extract reference and no LF-line/column span to quarantine, and no amount below is marked not-proven on that basis** — but a missing check means **unchecked, not clean**. Every value-determining figure in this report was read directly from the frozen extract of the document that reports it: the FY26 10-K (`10K_2025_26_0001628280-26-037434`), the Q2 FY27 10-Q (`10Q_2Q_0001628280-26-072254`) and the 2026-11-09 earnings release. Capital IQ workbook tabs are used only where the filings do not disclose the line (the long-dated estimate series, the beta, peer margins), and are labelled as the tier-5 vendor exports they are. Every restating layer must carry this qualifier forward.

**Cross-module inputs used.** `valuation/00` (triage, caps), `valuation/01` (price, shares, net debt, EV — adopted verbatim), `earnings/01_historical-financials` (FCF, capex, working-capital base), `earnings/04_guidance-consensus` (FY2027 guidance and consensus, with the Net-Bookings-vs-GAAP and management-basis-vs-GAAP bridges already proven there), `earnings/03_margin-drivers`, `earnings/06_earnings-quality`, `earnings/07_earnings-sensitivity`, `business-model/07_business-quality` (through-cycle anchors, rate-of-change 35), `business-model/09_moat` (the canonical 21.0% normalized tax rate, the 8.2% CAPM cross-check, the "No moat proven" verdict and the eroding-but-unconfirmed trajectory), `business-model/10_external-dependency` (cyclicality).

---

## 1. FCF Base & Normalizations

**The base is FORWARD, not trailing, and this is forced by the data, not chosen.** The trailing earnings base is negative — LTM EBIT **−112.5** on the vendor read and **−180.8** derived from the filings, LTM diluted EPS **−1.29**, LTM §15 FCF (CFO − total capex) only **62.6** (367.1 − 304.5) [`CIQ Financials_Quarterly → Income Statement / Cash Flow`, LTM Sep-30-2026; `earnings/01` §2]. A DCF cannot be grown off a negative or near-zero base. The explicit forecast therefore starts from **FY2027 (year ending 2027-03-31) on the company's own 2026-11-09 guidance**, with the already-reported half (H1 FY27) stripped out so nothing is double-counted (§4).

**Base year = FY2027. Reporting currency = USD, millions.**

| Item | Base-Year Value (FY2027) | Normalization Applied | Source |
|---|---:|---|---|
| Revenue (GAAP total net revenue) | **8,080.0** | Guidance midpoint of $7,980–8,180m. **Not** the Net Bookings range ($8,000–8,200m) and **not** the consensus Net-Bookings figure of 8,554.7 — basis labelled, bases not mixed | `TTWO 2Q27 Earnings Release, 2026-11-09, "Outlook for Fiscal Year 2027"` |
| EBIT (GAAP income from operations) | **252.5** | Built from the guidance table's own midpoints: 8,080.0 − cost of revenue 3,739.5 − operating expenses 4,088.0 = **252.5**. Management's caveat carried: "the individual components … may not foot to the totals" | same release, Outlook table |
| Normalized effective tax rate | **21.0%** | **Reconciled to the canonical cross-module rate.** `business-model/09_moat.md` §3 published **21.0%** as the normalized structural rate and instructed this DCF to use it. Reported FY26 effective rate was **(50.8)%** — a single-year distortion. What was stripped (quoted from the moat build): the full valuation allowance on US net deferred tax assets, the **$45.7** software-development tax-credit benefit (+1.2% in the rate reconciliation), the foreign-earnings effect (−0.5%), and goodwill-impairment-related non-deductible items; state and local tax net of federal benefit adds +0.4%, so 21.4% is the fuller structural rate and **21.0% is used**. The moat ROIC and this DCF therefore do **not** diverge on the tax rate | `FY26 10-K, Note — Income Taxes (rate reconciliation)`; `business-model/09_moat.md` §3 Build 1 |
| NOPAT | **199.5** | 252.5 × (1 − 0.21) | arithmetic, §4 snippet |
| Stock-based compensation | **charged, NOT added back (−462 inside EBIT)** | SBC is a real cost of paying employees (§15: no silent use of management-adjusted numbers). The company's own FY2027 outlook implies **$462m** of SBC in the GAAP-to-management bridge; H1 FY27 actual was **176.0**. The vendor's "EBITDA" and "EPS Normalized" consensus fields **add SBC back** (`earnings/04` proved both bridges to the cent) — those are management-basis figures and are **not** used as cash | `TTWO 2Q27 Earnings Release, 2026-11-09, p.2` (outlook bridge); `Q2 FY27 10-Q, Condensed Consolidated Statements of Cash Flows (six months)` |
| Acquired-intangible amortization | **604.6 (added back as non-cash)** | Taken from the filing's **own forward schedule**, not extrapolated: FY2027 604.6, FY2028 554.1, FY2029 205.2, FY2030 111.5, FY2031 38.2 | `FY26 10-K, Note 9 (Goodwill and Intangible Assets, Net), p.85 — "Estimated future amortization of intangible assets"` |
| Content (software development) cash spend | **888.8 = 11.0% of revenue** | The largest discretionary spend and it sits **inside** operating cash flow, not capex: 688.9 (FY26), 691.6 (FY25), 603.4 (FY24) = 10.4% / 12.3% / 11.3% of revenue. Held at 11.0%, inside the observed band | `FY26 10-K, Consolidated Statements of Cash Flows`; `Q2 FY27 10-Q, Statements of Cash Flows` (H1 FY27 actual 372.4) |
| Content amortization | **606.0 = 7.5% of revenue (added back as non-cash)** | FY26 actual 385.9 (5.8% of revenue); H1 FY27 actual **190.8**. Steps up because **$2,149.7m of capitalized cost relates to titles not yet released** at 2026-03-31 and begins amortizing on release over "9 to 36 months" | `FY26 10-K, Note 7, p.83`; `FY26 10-K, Note 1 — Software Development Costs`; `Q2 FY27 10-Q, Statements of Cash Flows` |
| Fixed capex | **290.0** | Company point guidance ("approximately $290m"). FY26 actual 190.2 (= purchases of fixed assets 162.8 + asset acquisitions 27.4); consensus 281.8 with a median of exactly 290 | `TTWO 2Q27 Earnings Release, Outlook`; `earnings/01` §1; `CIQ Estimates → Consensus` |
| Net working capital | **−888.8 = −11.0% of revenue** (negative-WC business) | Actual NWC at 2026-09-30 = **−701.1** (−10.9% of LTM revenue). Ratio **held at the latest observed level** rather than reverted to the more-negative five-year history (FY2022 −31.2%, FY2023 −22.9%, FY2024 −19.7%, FY2025 −18.3%, FY2026 −18.9%) — reverting would manufacture a large one-off cash release. Build in §2 | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`; `CIQ Financials_Annual → Balance Sheet` |
| **FY2027 FCFF (full year, modelled)** | **613.9** | §4 identity | executed snippet, §4 |
| **Normalized mid-cycle FCFF (the figure `05` inverts)** | **≈ 1,036–1,185** (FY2032–FY2036 band; FY2036 **1,036.2**) | The FY2027 base is a *transition* year (H1 was a pre-launch trough, H2 the GTA VI launch). The mid-cycle normalized FCFF is the FY2032+ level, where acquired-intangible amortization has run off and content amortization equals content spend | §4 |

**Normalizations deliberately NOT made, named so they are visible.**
- **Goodwill and intangible impairments are excluded from the forecast** — $5,887.3m of accumulated goodwill impairment against $6,949.2m of gross goodwill, plus $577.4m (FY24) and $465.3m (FY23) of Developed Game Technology impairments and $77.5m / $109.9m of software-development-cost impairments [`FY26 10-K, Notes 7 and 9, pp.83–85`]. They are non-cash and not forecast; they are, however, the evidence behind the §5 runoff terminal, not an argument for ignoring the past.
- **The vendor's "Levered Free Cash Flow" of 787.6 is not used anywhere.** It is an after-interest vendor construction, not §15 FCF [`ciq_facts.json → levered_fcf_m`, whose own `source_ref` carries that warning].
- **No working-capital reversion credit, no SBC add-back, no management-basis EBITDA.** Each would raise the answer; each is refused with a reason.

---

## 2. Forecast Assumptions

Ten-year explicit forecast, FY2027 → FY2036. Every cell is labelled **G** = company-guided, **C** = consensus/vendor-derived, **F** = filing-disclosed schedule, **A** = analyst assumption (mine, not company-guided).

| Assumption | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 | FY2032 | FY2033 | FY2034 | FY2035 | FY2036 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | — (base) | **+5.66** | +3.13 | +3.13 | +3.13 | +3.13 | +3.13 | +3.13 | +2.50 | +2.50 | **+3.00** | FY2027 level **G**; FY2028 **C** (consensus FY28/FY27 = 9,039.05/8,554.69); FY2029–34 **C** (the consensus FY2028→FY2034 CAGR, 3.13%); FY2035–36 **A** fade |
| Revenue (USD m) | 8,080.0 | 8,537.5 | 8,804.7 | 9,080.3 | 9,364.5 | 9,657.6 | 9,959.9 | 10,271.7 | 10,528.4 | 10,791.7 | — | as above |
| Core operating margin % (EBIT **before** acquired-intangible amortization) | **10.61** | 17.50 | 18.00 | 16.50 | 15.00 | 14.00 | 13.50 | 13.00 | 12.75 | **12.50** | **12.50** | FY2027 **G** (derived: (252.5+604.6)/8,080); FY2028–29 **A**, set *below* the consensus-implied level (see note); FY2030–36 **A** fade to the normalized mid-cycle level benchmarked in §5 |
| Acquired-intangible amortization (USD m) | **604.6** | **554.1** | **205.2** | **111.5** | **38.2** | 23.5 | 23.5 | 23.5 | 23.5 | 23.5 | 23.5 | FY2027–31 **F** — the 10-K's own schedule; FY2032+ **A** (the 117.6 residual of the 1,631.2 net book value spread over five years, the long-lived IP and branding balances) |
| **EBIT margin % (GAAP)** | **3.13** | 11.01 | 15.67 | 15.27 | 14.59 | 13.76 | 13.26 | 12.77 | 12.53 | **12.28** | **12.25** | core less acquired-intangible amortization. FY2027 reproduces the guidance EBIT of 252.5 |
| Tax rate % (normalized) | 21.0 | 21.0 | 21.0 | 21.0 | 21.0 | 21.0 | 21.0 | 21.0 | 21.0 | 21.0 | **21.0** | **F/cross-module** — reconciled to `business-model/09_moat.md` §3 (§1 above) |
| Depreciation & amortization line, % of revenue | 2.41 | 2.41 | 2.41 | 2.41 | 2.41 | 2.41 | 2.41 | 2.41 | 2.41 | 2.41 | 2.41 | **A** anchored on H1 FY27 actual 96.3 annualized to ~195 (and FY26 166.4 = 2.50%, FY25 2.73%, FY24 2.53%) |
| Content amortization, % of revenue | 7.50 | 9.00 | 10.00 | 10.50 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | **A** — rises to equal cash spend by FY2031 (steady state), because the 2,149.7 of unreleased capitalized cost starts amortizing on release over 9–36 months **F** |
| Content cash spend, % of revenue | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | **A** inside the FY2024–FY2026 observed band of 10.4–12.3% |
| Fixed capex, % of revenue | **3.59** (=290 **G**) | 3.00 | 3.00 | 3.00 | 3.00 | 3.00 | 3.00 | 3.00 | 3.00 | 3.00 | 3.00 | FY2027 **G**; FY2028+ **A**, between FY26 actual 2.86% and FY27 guided 3.59% |
| **Net working capital, % of revenue** | **−11.0** | −11.0 | −11.0 | −11.0 | −11.0 | −11.0 | −11.0 | −11.0 | −11.0 | −11.0 | −11.0 | **A** — held at the latest observed ratio (−10.9% at 2026-09-30) |

**Why FY2028–FY2029 core margin is set below the Street's own implied level, not above it.** Restating the consensus to my revenue base: FY2029 management-basis EBITDA of 2,622.4 on the vendor's 9,210.8 of revenue scales to ~2,506 on my 8,804.7; stripping SBC (~5.7% of revenue ≈ 502), the depreciation line (~220) and the filing's acquired-intangible amortization (205.2) leaves a consensus-implied **GAAP EBIT margin near 17.9%**, i.e. a core margin near 20.4% [`CIQ Estimates → Multiples`, TEV/EBITDA grid at the vendor TEV of 41,790.1; `earnings/04` §1A for the management-basis bridge]. My FY2029 core of **18.00%** is ~240bps **below** that. The DCF is therefore not built on a more optimistic operating case than the Street's; it is built on a slightly more cautious one.

**The long-dated consensus is thin and its jaggedness is not imported as a point forecast.** Inverting the vendor's forward TEV/REV grid at its own TEV of 41,790.1 gives revenue of 8,554.7 (FY27), 9,039.1, 9,210.8, 9,698.4, **9,086.3 (FY31, a fall)**, 9,440.1, **10,685.5 (FY33, +13.2%)**, 10,874.3 (FY34) [`CIQ Estimates → Multiples`]. The FY2032–FY2034 rows carry **only** TEV/REV and TEV/EBITDA (no EPS, no PEG), which means very few contributors. Using that saw-tooth as a point path would be false precision, so the smoothed FY2028→FY2034 CAGR of **3.13%** is used instead and lands on the same FY2034 level by construction. The jagged path is printed here so a reader can see what was smoothed.

**Working capital scales with revenue — and the sign matters more here than the level.** TTWO is a **negative-working-capital** business: unearned (deferred) revenue of 1,017.1 plus payables 207.7, accrued expenses 747.4 and other current liabilities 276.5 exceed receivables 780.8, inventory 34.1, prepaid 647.1 and other current assets 85.6, so NWC at 2026-09-30 is **−701.1** [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`]. Holding the ratio at −11.0% while revenue grows makes NWC **more negative every year**, which **releases** cash and **ADDS** to FCF — the per-year effect and its sign are printed in §4 and read off the modelled ΔNWC, not inferred from the direction of growth. The alternative driver — days-of-sales from `earnings/06_earnings-quality` — was checked and is not usable as the primary driver here, because the dominant working-capital line is **deferred revenue**, which has no days-of-sales analogue (the company's own disclosed service period is "generally between five and fifteen months depending on the software product" [`FY26 10-K, Note 1 — Revenue Recognition, p.76`]); the percentage-of-revenue driver is used and labelled instead.

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | **5.07%** | **Web-sourced, labelled unverified:** US 10-year Treasury yield, **2026-11-19** (5.06–5.08% across the sources; 5.07% on 2026-11-18) [`Web: US 10-year Treasury yield, 2026-11-19 (indicative, unverified)`]. **Why not the pool figure:** the pool's only risk-free rate is the company's own **3.8%/3.9%** Monte Carlo input for FY2026 market-based RSUs, struck on a **2.8-year** expected service period as of March 2026 [`FY26 10-K, Note 16 — Market-Based Awards`], and SOFR of ~3.91% at 2026-09-30 [`Q2 FY27 10-Q, Note 10`]. Neither is a long-horizon rate at the valuation date; a perpetual DCF needs the 10-year tenor |
| Equity-risk premium | **4.41%** | **Web-sourced, labelled unverified:** Damodaran implied ERP for the S&P 500, trailing-twelve-month with adjusted payout, **as of 2026-11-01** (the same data set shows 3.39%–5.81% across its five methods) [`Web: Damodaran implied equity risk premium, 2026-11-01 (indicative, unverified)`]. **No ERP figure exists anywhere in this pool** |
| Beta | **0.92** | `CIQ Comps → Operating Statistics`, subject row, **"5 Year Beta"**, As-Of **2026-11-19** — tier-5 vendor export. **Window:** 5 years. **Reference index: not stated in the export** — a named gap, not an assumption. Peer betas in the same column run −0.45 to 1.53, median 0.65 |
| **Cost of equity (CAPM)** | **9.13%** | 5.07% + 0.92 × 4.41% = **9.1272%** |
| Pre-tax cost of debt | **5.60%** | The company's own **longest-dated coupon**: 5.600% Senior Notes due June 12, 2034 [`Q2 FY27 10-Q, Note 10 (Debt)`]. **Market cross-check:** those notes were carried at 300.0 face against a Level-2 fair value of **289.6** at 2026-09-30 — below par, so the market yield is *above* the coupon, roughly **6.05%** on a ~7.7-year bond. Substituting 6.05% lifts the WACC by only **2bp** (debt is 5.85% of capital), so 5.60% is used and the higher figure noted |
| Tax rate (debt shield) | **21.0%** | The **same** normalized rate as NOPAT (§1) — the moat module's canonical figure |
| After-tax cost of debt | **4.42%** | 5.60% × (1 − 0.21) = 4.424% |
| Equity / debt weights (market value) | **94.15% / 5.85%** | Equity = market cap **40,552.3** [`valuation/01` §3]; debt = canonical **2,519.8**, borrowings only at carrying value from the filing's own debt note [`valuation/01` §7; `Q2 FY27 10-Q, Note 10`]. Debt carrying value is used as a proxy for market value — the Level-2 fair values sit within ~3% of face. Weights sum to 1.0000 |
| Preferred | **nil** | Preferred stock 5.0 shares authorised, **none issued or outstanding** [`Q2 FY27 10-Q, Balance Sheets`] — so no `w_p·k_p` term |
| **WACC** | **8.85%** | formula below |

**Formula, applied by the executed snippet in §4, not eyeballed:**
`WACC = w_e·k_e + w_d·k_d·(1 − t)` = `0.9415 × 9.1272% + 0.0585 × 5.60% × (1 − 0.21)` = `8.593% + 0.259%` = **8.852%**. No preferred term (none exists).

**Sanity bounds — all printed and all cleared (MODULE_RULES Gate 4).**
- **Arithmetic band:** after-tax `k_d` **4.42%** ≤ **WACC 8.85%** < `k_e` **9.13%** ✔. The WACC sits strictly below the CAPM cost of equity, as it must for a firm carrying debt.
- **High-side bound:** `rf + 1.4 × ERP` = 5.07% + 6.17% = **11.24%**. `k_e` of 9.13% is well below it (β 0.92 < 1.4) ✔ — no unjustified high rate is being applied to a large-cap.
- **Low-side floor 1 — equity-risk-premium floor:** `k_e − rf` = 9.13% − 5.07% = **4.06pp ≥ ~4pp** ✔. It clears **narrowly**, which is a function of a sourced 4.41% ERP and a beta below 1.0; stated rather than glossed.
- **Low-side floor 2 — beta floor and source discipline:** TTWO is a cyclical business on this engine's own read (cyclicality **22/100**, release-slate plus consumer-discretionary plus console-hardware cycles stacked [`business-model/07_business-quality.md` §1]), so the floor applies. The raw vendor beta of **0.92** is **above** the ~0.8 artefact line, so no floor is imposed and no re-levering is needed. Source, window and index are stated above, including that the reference index is **not disclosed** in the export. Because of that gap, the §7 grid is run at WACC ±1pp, which spans an equivalent beta range of roughly **0.69 to 1.15**.
- **Low-side floor 3 — country / single-market risk:** **no country-risk premium is added, and that is a deliberate stated choice, not an omission.** Cash flows are USD-reported and geographically spread — US 3,940m / International 2,716m of FY2026 revenue (59% / 41%) across developed markets plus a China exposure that the filings never size [`FY26 10-K, MD&A, p.44`; `ciq_facts.json → geographic`]. The reporting currency is a reserve currency and the issuer is a Delaware-incorporated US domestic filer, so a sovereign-spread adjustment would be adding a premium the cash flows do not carry.

**Override discipline: no analyst override was applied.** The number used (8.85%) is the mechanically computed blend. **Cross-check against the moat module's cost of capital (Gate 4):** `business-model/09_moat.md` §3 Build 3 published a labelled CAPM WACC of **8.2%** (rf 3.9%, β 0.92, ERP 5.0% judgment, after-tax `k_d` 4.3%, weights 93.3%/6.7% on the lease-inclusive debt figure), sensitised to 7.8%–9.1%. The gap to my 8.85% is **0.65pp — well inside the ~2pp divergence trigger**, so no grid spanning both rates is required. The difference is fully explained and runs in two directions: my risk-free rate is **+117bp** higher (a current 10-year Treasury at 5.07% versus the company's March-2026, 2.8-year stock-comp input of 3.9%), partly offset by an ERP **−59bp** lower (a sourced 4.41% versus a 5.0% judgment figure), plus a slightly different debt weight (2,519.8 borrowings-only versus the vendor's lease-inclusive 2,911.4). **My rate is the higher of the two**, so this DCF is not resting on a lower cost of capital than the moat test did.

## 3A. Cost-of-Capital Reality Test (mandatory — CLAUDE.md §16, MODULE_RULES Gate 4)

**The filings were searched for a disclosed discount rate. One reference and one number exist, and neither is scope-matched to the listed group.** The FY26 10-K states that goodwill impairment testing uses *"risk-adjusted discount rates based on our weighted average cost of capital"* and names "discount rate" among the assumptions audited as a critical audit matter — **but the numeric rate is nowhere in the filings** [`FY26 10-K, Critical Accounting Policies — Goodwill`; `FY26 10-K, Note 9, pp.83–85`; `FY25 10-K, Report of Independent Registered Public Accounting Firm — Critical Audit Matter`]. The only disclosed numeric rate is the **weighted-average operating-lease discount rate of 4.74%** (FY2026; 4.75% FY2025, 4.56% FY2024), on a weighted-average remaining lease term of 7.14 years [`FY26 10-K, Note 13 (Leases)`]. Scope test on that rate: **valuation object** = lease liabilities (an obligation), not the listed group; **geography/currency** = mixed, USD-reported; **tax basis** = pre-tax; **method** = incremental **borrowing** rate, not a cost of equity or a WACC. It fails three of the five matches, so it is a **labelled sensitivity comparator only** and can never anchor the group valuation.

| Reference | Rate | Source (cited per §5) | Gap vs model WACC |
|---|---:|---|---:|
| Model WACC (CAPM build, §3) | **8.85%** | this agent | — |
| Scope-matched group discount rate | **Group discount rate not disclosed** | `FY26 10-K, Critical Accounting Policies — Goodwill` and `Note 9` reference a WACC-based rate but state no number; `FY25 10-K, Critical Audit Matter` likewise. No group cost of equity or WACC appears anywhere in this pool | **n/a — none exists** |
| Other disclosed rate (**comparator only**) | 4.74% | `FY26 10-K, Note 13 (Leases)` — weighted-average **operating-lease** discount rate. Object: lease obligations. Currency: USD-reported, mixed geography. Basis: pre-tax. Method: incremental **borrowing** rate. **Fails the five-way scope match; cannot trigger a re-run** | model is **+4.11pp above** it (a WACC should sit above a secured-obligation borrowing rate) |
| Market-implied rate | **≈ 2.63%** | `05_reverse-dcf` runs **after** this agent and will invert this exact model; the read available now is the discount rate that sets this model's own FCFF path equal to the canonical EV of **41,922.7** [`valuation/01` §7] — solved in the §4 snippet at **2.63%** | model is **+6.22pp ABOVE** the market-implied rate |
| Company's own trailing FCF yield / earnings yield | FCF yield **0.15%**; earnings yield **−0.59%** (negative) | FCF yield = LTM §15 FCF 62.6 ÷ market cap 40,552.3 [`earnings/01` §2; `valuation/01` §3]; earnings yield = LTM net income (240.5) ÷ 40,552.3 [`CIQ Financials_Quarterly → Income Statement`, LTM Sep-30-2026] | model is **+8.70pp / +9.44pp above** both |
| Peer / industry cost of capital | **Not assessable** | No ROIC, ROCE, ROE, WACC or cost-of-capital column exists for any of the ten peers in this pool [`business-model/09_moat.md` §3; `business-model/08_competitive-map.md` §5, gap 2]. Electronic Arts, the closest comparable, was taken private on 2026-08-04 and no longer files | — |

**Escalation branch: none taken — the trigger does not fire, and it fires in the opposite direction from the one §16 guards against.** Both trigger conditions were tested explicitly. (i) *"More than ~3pp below a scope-matched company-disclosed rate"* — **cannot fire**: no scope-matched group rate exists, and the one disclosed rate (4.74% lease borrowing rate) is a mismatched obligation rate that the rule itself bars from triggering a re-run; the model sits 4.11pp **above** it in any case. (ii) *"Below ~two-thirds of the market-implied rate"* — **does not fire**: the market-implied rate on this model's own cash-flow path is **2.63%**, so the model WACC is **3.4x** the market-implied rate, not below two-thirds of it. The model rate is also 8.70pp above the company's trailing FCF yield and 9.44pp above a negative earnings yield. **No `RF-VAL-003` tag is emitted, because emitting one when the trigger has not fired would be a false cap.** The finding this test actually produces is the reverse of the usual defect: the gap between price and intrinsic value here is **not** a low-discount-rate artefact — at the current price the market is implicitly discounting this cash-flow path at a rate **below the 10-year Treasury**, which means it is pricing materially larger cash flows than this model carries (the §4 snippet shows a uniform **3.16x** scale-up of the modelled FCFF would be needed to reach the market EV at the model WACC). Testing that hypothesis against the earnings evidence is `05_reverse-dcf`'s job, and it should start there.

---

## 4. Free Cash Flow Forecast & Discounting

**Identity used (Gate 1, second form — stated once and not mixed):**
`FCFF = NOPAT + D&A − capex − ΔNWC`, where for this business **D&A** = the P&L depreciation-and-amortization line **+** acquired-intangible amortization **+** content (software development) amortization, and **capex** = fixed capex **+** content cash spend. SBC is **not** added back — it is charged inside EBIT and left there. Interest is excluded (this is an unlevered flow discounted at the WACC).

**Discounting convention: mid-year (t − 0.5 equivalent), measured from 2026-09-30.** Because FY2027 is half-reported, the convention lands exactly: FY2028 spans Apr-2027→Mar-2028, so its midpoint (2027-09-30) is **exactly 1.00 year** from the valuation date, FY2029's is 2.00, and so on; the H2 FY2027 stub (Oct-2026→Mar-2027) has its midpoint at **t = 0.25**. The terminal value, struck at the end of FY2036 (2036-03-31), is discounted at **t = 9.50**. End-of-year discounting is **not** used.

**H1 FY2027 is already reported and is stripped out, so nothing is double-counted.** The Sep-30-2026 balance sheet (which supplies the net-debt anchor) already contains that half's cash. On the same identity, using the filings:

| H1 FY2027 (6 months to 2026-09-30) | Value | Source |
|---|---:|---|
| EBIT (GAAP, six months) | (153.0) | `Q2 FY27 10-Q, Condensed Consolidated Statements of Operations` (six-month column) |
| NOPAT at 21.0% | (120.9) | arithmetic |
| + Depreciation & amortization line | 96.3 | `Q2 FY27 10-Q, Statements of Operations` (six months) |
| + Acquired-intangible amortization | 313.5 | Q1 168.4 + Q2 145.1 [`TTWO 1Q27 Earnings Release, p.2`; `TTWO 2Q27 Earnings Release, p.2` — the management-basis bridges] |
| + Content amortization and impairment | 190.8 | `Q2 FY27 10-Q, Statements of Cash Flows` (six months) |
| − Content cash spend | (372.4) | same |
| − Fixed capex | (182.7) | `earnings/01` §2, tied to the filing |
| − ΔNWC cash effect (NWC **rose** from −1,255.6 to −701.1, so it **absorbed** 554.5) | (554.5) | `Q2 FY27 10-Q, Balance Sheets`; `CIQ Financials_Annual → Balance Sheet` (Mar-31-2026) |
| **= H1 FY2027 FCFF on the identity** | **(629.9)** | snippet below |

*Reconciliation of that stub to the cash record, with the residual named rather than hidden:* reported H1 FY27 CFO was **(173.5)** and capex **182.7**, so §15 FCF was **(356.2)**; unlevering it (+17.4 of after-tax net interest expense) gives (338.8); charging the 176.0 of SBC that CFO adds back gives **(514.8)**. The identity's (629.9) is **115.1 lower**, and the gap is accounted for by two named items the identity does not model: the **43.6** of non-cash asset writedowns and title impairments sitting inside H1 EBIT (43.4 in Q1 on an abandoned third-party title, 0.2 in Q2) [`TTWO 1Q27 Earnings Release, p.2`; `earnings/01` §3], and the difference between the **normalized 21.0%** tax charge and the much larger tax **benefit** actually recorded against an H1 pre-tax loss (the Q2 quarter alone carried a 57.9 benefit) [`Q2 FY27 10-Q, Results of Operations`]. Neither recurs in the forecast.

| Period | Revenue | EBIT | NOPAT | D&A (total) | Capex (total) | ΔNWC cash effect | FCFF | Discount factor | PV of FCFF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2027 (full year, modelled) | 8,080.0 | 252.5 | 199.5 | 1,405.6 | 1,178.8 | **+187.7 (release)** | 613.9 | — | — |
| *less* H1 FY2027 (reported) | *3,030.9* | *(153.0)* | *(120.9)* | *600.6* | *555.1* | *(554.5) (absorbed)* | *(629.9)* | — | — |
| **H2 FY2027 (Yr-1 stub)** | 5,049.1 | 405.5 | 320.3 | 805.0 | 623.7 | **+742.2 (release)** | **1,243.8** | 0.9790 | **1,217.7** |
| FY2028 | 8,537.5 | 940.0 | 742.6 | 1,528.5 | 1,195.2 | **+50.3 (release)** | 1,126.1 | 0.9187 | 1,034.5 |
| FY2029 | 8,804.7 | 1,379.6 | 1,089.9 | 1,298.2 | 1,232.6 | **+29.4 (release)** | 1,184.8 | 0.8440 | 999.9 |
| FY2030 | 9,080.3 | 1,386.7 | 1,095.5 | 1,284.0 | 1,271.2 | **+30.3 (release)** | 1,138.6 | 0.7753 | 882.8 |
| FY2031 | 9,364.5 | 1,366.5 | 1,079.5 | 1,294.3 | 1,311.0 | **+31.3 (release)** | 1,094.0 | 0.7123 | 779.2 |
| FY2032 | 9,657.6 | 1,328.6 | 1,049.6 | 1,318.8 | 1,352.0 | **+32.2 (release)** | 1,048.6 | 0.6544 | 686.2 |
| FY2033 | 9,959.9 | 1,321.1 | 1,043.7 | 1,359.4 | 1,394.4 | **+33.3 (release)** | 1,041.9 | 0.6011 | 626.4 |
| FY2034 | 10,271.7 | 1,311.8 | 1,036.3 | 1,401.3 | 1,438.0 | **+34.3 (release)** | 1,033.8 | 0.5523 | 570.9 |
| FY2035 | 10,528.4 | 1,318.9 | 1,041.9 | 1,435.7 | 1,474.0 | **+28.2 (release)** | 1,031.9 | 0.5073 | 523.5 |
| FY2036 | 10,791.7 | 1,325.5 | 1,047.1 | 1,471.0 | 1,510.8 | **+29.0 (release)** | 1,036.2 | 0.4661 | 483.0 |

**Sum of PV of explicit FCFF (H2 FY2027 → FY2036): 7,804.2.**

**Working-capital sign check, done explicitly rather than assumed.** This is a negative-working-capital business and the ratio is **held** at −11.0%, so revenue growth drives modelled NWC *more negative* every year — `ΔNWC = NWC_t − NWC_{t−1}` is negative in all ten forecast years (−50.3, −29.4, −30.3, −31.3, −32.2, −33.3, −34.3, −28.2, −29.0 from FY2028 on), which is a cash **release** and therefore **ADDS** to FCFF. The sign is read off those modelled ΔNWC figures, not off the direction of growth. The sanity test the rule prescribes is passed: revenue is growing, the ratio is held at a negative-WC company, and the working-capital line is **adding to** FCFF — if it were cutting FCFF, the sign would be inverted. The one year where the effect is large (+742.2 in the H2 FY2027 stub) is **not** a growth release: it is the H1 absorption of 554.5 reversing out of a half-year that has already happened, plus the FY2027 growth release of 187.7 — the arithmetic is printed in the table above so the reader can see which part is which. Note the direction of the modelled drift is **conservative**: the ratio is held at the *least* negative level in six years (−10.9% latest versus −18.9% FY2026 and −31.2% FY2022), so the model takes **less** working-capital funding than the company's own history would support.

```bash
$ python3 dcf.py   # executed 2026-11-20
WACC BLEND
  w_e=0.9415  w_d=0.0585  sum=1.0000
  k_e = 0.0507 + 0.92*0.0441 = 0.091272  (9.13%)
  k_d pre-tax 5.60%  after-tax = 5.60%*(1-0.21) = 4.424%
  WACC = 0.9415*0.091272 + 0.0585*0.044240 = 0.088521  (8.852%)
  GATE: after-tax kd 4.42% <= WACC 8.85% < k_e 9.13%  -> True
  high-side bound rf+1.4*ERP = 11.24%  k_e below it -> True
  low-side floor  k_e - rf = 4.06pp  (>= ~4pp) -> True

FORECAST  (USD m; wc_cash + = NWC falls/more negative = cash released = ADDS to FCF)
yr           rev  core%   acqAm     EBIT  EBIT%    NOPAT     D&A    cAmo   cSpend   capex      NWC    dNWC  wcCash     FCFF
FY2027    8080.0  10.61   604.6    252.5   3.13    199.5   195.0   606.0    888.8   290.0   -888.8  -187.7   187.7    613.9
FY2028    8537.5  17.50   554.1    940.0  11.01    742.6   206.0   768.4    939.1   256.1   -939.1   -50.3    50.3   1126.1
FY2029    8804.7  18.00   205.2   1379.6  15.67   1089.9   212.5   880.5    968.5   264.1   -968.5   -29.4    29.4   1184.8
FY2030    9080.3  16.50   111.5   1386.7  15.27   1095.5   219.1   953.4    998.8   272.4   -998.8   -30.3    30.3   1138.6
FY2031    9364.5  15.00    38.2   1366.5  14.59   1079.5   226.0  1030.1   1030.1   280.9  -1030.1   -31.3    31.3   1094.0
FY2032    9657.6  14.00    23.5   1328.6  13.76   1049.6   233.0  1062.3   1062.3   289.7  -1062.3   -32.2    32.2   1048.6
FY2033    9959.9  13.50    23.5   1321.1  13.26   1043.7   240.3  1095.6   1095.6   298.8  -1095.6   -33.3    33.3   1041.9
FY2034   10271.7  13.00    23.5   1311.8  12.77   1036.3   247.9  1129.9   1129.9   308.1  -1129.9   -34.3    34.3   1033.8
FY2035   10528.4  12.75    23.5   1318.9  12.53   1041.9   254.1  1158.1   1158.1   315.9  -1158.1   -28.2    28.2   1031.9
FY2036   10791.7  12.50    23.5   1325.5  12.28   1047.1   260.4  1187.1   1187.1   323.7  -1187.1   -29.0    29.0   1036.2

H1 FY2027 ACTUAL on the same identity (6m to 2026-09-30)
  NOPAT -120.9 + D&A 96.3 + acq.amort 313.5 + contentAmort 190.8 - contentSpend 372.4 - capex 182.7 + wcCash -554.5 = -629.9
  (cash cross-check: CFO -173.5 - capex 182.7 = -356.2; unlever +17.4 net int a/t = -338.8; charge SBC -176.0 = -514.8; residual vs identity = -115.1)
  H2 FY2027 stub FCFF = FY2027 full 613.9 - H1 -629.9 = 1243.8

DISCOUNTING  mid-year convention; t measured from 2026-09-30
period          t      FCFF       DF        PV
H2 FY2027    0.25    1243.8   0.9790    1217.7
FY2028       1.00    1126.1   0.9187    1034.5
FY2029       2.00    1184.8   0.8440     999.9
FY2030       3.00    1138.6   0.7753     882.8
FY2031       4.00    1094.0   0.7123     779.2
FY2032       5.00    1048.6   0.6544     686.2
FY2033       6.00    1041.9   0.6011     626.4
FY2034       7.00    1033.8   0.5523     570.9
FY2035       8.00    1031.9   0.5073     523.5
FY2036       9.00    1036.2   0.4661     483.0
  SUM PV of explicit FCFF = 7804.2

TERMINAL VALUE   (end of FY2036 = 2036-03-31 = t 9.50 from 2026-09-30)
  BASE  ROIC=WACC  TV=NOPAT37/WACC         TV   12183.9  PV(TV)   5443.0  EV   13247.2  TV%EV  41.1%
  PERSIST Gordon on FCFF g=3.0%            TV   18238.1  PV(TV)   8147.6  EV   15951.9  TV%EV  51.1%
  RUNOFF  EBIT mgn 8.0%, g=0.0% nominal    TV    7704.8  PV(TV)   3442.0  EV   11246.3  TV%EV  30.6%
  NOPAT_FY2037 = EBIT36 1325.5 x 1.03 x (1-0.21) = 1078.5
  FCFF_FY2037  = 1036.2 x 1.03 = 1067.3 ; WACC-g = 5.85pp
  exit-multiple cross-check: FY2037 EBITDA 1657.6; base TV/EBITDA = 7.35x ; persist = 11.00x ; runoff = 4.65x

EV -> EQUITY -> PER SHARE
  BASE (ROIC=WACC terminal)          EV   13247.2  -netdebt 1370.4 -> equity   11876.8  /188.0 =   63.17/sh  vs price 216.61 =  -70.8%  TV%EV 41.1%
  PERSISTENCE terminal               EV   15951.9  -netdebt 1370.4 -> equity   14581.5  /188.0 =   77.56/sh  vs price 216.61 =  -64.2%  TV%EV 51.1%
  RUNOFF terminal (bear input)       EV   11246.3  -netdebt 1370.4 -> equity    9875.9  /188.0 =   52.53/sh  vs price 216.61 =  -75.7%  TV%EV 30.6%

GATE 2 financeable growth (FY2036)
  capex total 1510.8 - D&A total 1471.0 + dNWC -29.0 = reinvestment 10.9
  reinvestment rate = 10.9/1047.1 = 1.04%
  implied g = ROIC x rr ; at ROIC=WACC 8.85% -> 0.09%  vs modeled gT 3.0%
  BASE terminal is g-invariant: NOPAT*(1-g/ROIC)/(WACC-g) with ROIC=WACC == NOPAT/WACC for any g
```

```bash
$ python3 imp.py   # executed 2026-11-20 -- market-implied discount rate on this same path
Discount rate that makes this model's FCFF path equal the market EV of 41922.7: 2.63%
  (model WACC 8.85%; 10-yr UST 5.07%)  EV at that rate = 41922.7
  EV at model WACC = 13247.2; uniform FCFF/NOPAT multiple needed to reach market EV = 3.16x
  LTM FCF yield = 62.6/40552.3 = 0.15%  ; LTM earnings yield = -240.5/40552.3 = -0.59%
  model FY2029 FCFF yield on market cap = 2.92%
```

---

## 5. Terminal Value

**Method and formula, written out.**

- **Gordon growth:** `TV = FCFF_{n+1} / (WACC − g) = FCFF_n × (1 + g) / (WACC − g)`, where `FCFF_{n+1}` is the first cash flow *after* the explicit period (FY2037) and `g` is the perpetual nominal growth rate. `WACC − g` must stay comfortably positive — at **8.85% − 3.00% = 5.85pp** the gap is wide, and the worst corner of the §7 grid (WACC −1pp, g +0.5pp) still leaves **4.35pp**, so no cell approaches the divide-by-near-zero zone. **No grid cell is NM.** This is confirmed, printed in §7, and not assumed.
- **Base terminal actually used — the no-excess-return form:** `TV = NOPAT_{n+1} × (1 − g / ROIC_terminal) / (WACC − g)` with **`ROIC_terminal = WACC`**, which collapses algebraically to **`TV = NOPAT_{n+1} / WACC`** for *any* `g`. That is the whole point: with terminal ROIC equal to the cost of capital, growth creates **no** value, so no perpetual excess return is being underwritten.
- **Exit multiple cross-check:** `TV = terminal metric × exit multiple`, run in reverse — the Gordon TV is converted back into the EV/EBITDA a mature version of this business would be worth.

**Why the base terminal carries no perpetual excess return — the §5(a) trigger, with its upstream row cited.** `business-model/09_moat.md` §5 returns **"No moat proven"** — specifically the *"moat in structure, not economics"* case: four moat sources present (brand 60, scale 35, technology/IP 48, network effects 38), **none reaching the 61–80 "strong" band**, and the economic test failing on every basis (five-year through-cycle ROIC **−0.7%** against an ~8.2% WACC, −890bps; LTM **−2.2%**, −1,040bps; even the most generous ten-year reading of **+4.2%** is 400bps short) [`business-model/09_moat.md` §3–§5]. Per the rule, the base terminal therefore **fades terminal ROIC to the cost of capital and sets `g` at ~nominal growth with no moat premium**. This is a **fade, not a decline** — the base case still assumes the franchise survives and earns its cost of capital in perpetuity.

| Terminal variant | Formula and inputs | Terminal value (undiscounted) | PV of terminal value | Resulting EV | **TV as % of EV** | Implied exit TEV/EBITDA |
|---|---|---:|---:|---:|---:|---:|
| **BASE — ROIC = WACC, no excess return** (§5(a) trigger: "No moat proven") | `NOPAT_FY2037 / WACC` = (1,325.5 × 1.03 × 0.79) / 0.08852 = 1,078.5 / 0.08852 | **12,183.9** | **5,443.0** | **13,247.2** | **41.1%** | **7.35x** |
| Persistence — Gordon on FY2036 FCFF, g = 3.0% (assumes the FY2036 cash margin and its ~1% reinvestment rate persist, i.e. terminal ROIC **above** WACC) | 1,036.2 × 1.03 / (0.08852 − 0.03) | 18,238.1 | 8,147.6 | 15,951.9 | 51.1% | 11.00x |
| **RUNOFF / declining perpetuity** (§5(b) trigger — **the bear input, not the base**) | terminal EBIT margin faded to **8.0%** from FY2035, `g = 0.0% nominal` (below US expected inflation of ~2.5%, i.e. **negative real**, trending negative) | 7,704.8 | 3,442.0 | 11,246.3 | 30.6% | 4.65x |

**Terminal value is 41.1% of EV on the base case — well below the 75% terminal-dominance line, so no low-confidence terminal flag arises** (the persistence variant is 51.1%, the runoff 30.6%; none approaches 75%). That is unusual for a DCF and it is a genuine strength of this one: the answer is driven by the explicit ten-year cash flows, not by the perpetuity.

**Exit-multiple cross-check, both directions.** The base Gordon TV implies an exit **TEV/EBITDA of 7.35x** on FY2037 EBITDA of 1,657.6. Against the pool's peer set as of 2026-11-19 that is **below** the ten-peer LTM median of **13.0x** and below the NTM median of **9.96x** [`CIQ Comps → Trading Multiples`, As-Of 2026-11-19]. For a mature, no-moat-proven, hit-driven publisher earning exactly its cost of capital, an exit multiple a third below the peer NTM median is a sane rather than a heroic landing point — and the cross-check runs the right way (it does not require the market to pay *more* than peers at maturity). The persistence variant's implied 11.00x sits just above the peer NTM median, which is the clearest way to see what that variant is assuming: that the terminal business still earns a return above its cost of capital. The moat verdict does not support it, so it is shown and not used as the base.

**Terminal margin benchmarked against peer-normal AND the company's own prior-trough — the Cyclicality Gate, not "below the recent peak".** The terminal normalized operating margin is **12.50% core / 12.25% GAAP EBIT**. Where that sits:

| Anchor | Value | Source |
|---|---:|---|
| **Peer-normal EBIT margin** (ten-peer median) | **+15.9%** | `CIQ Comps → Operating Statistics`, As-Of 2026-11-19, via `business-model/09_moat.md` §3 and `08_competitive-map.md` §2A — tier-5 vendor export, mixed LTM windows |
| **Company's own prior-trough**, on the same core basis (operating margin before acquired-intangible amortization and before goodwill impairment) | **+3.2% (FY2024), +1.4% (FY2025)** — average ~2.3% | `FY26 10-K / FY25 10-K, Consolidated Statements of Operations`; `FY26 10-K, Note 9` amortization table (FY2024 1,418.9; FY2025 922.6) and `Note 9` goodwill impairments (2,342.1 FY2024; 3,545.2 FY2025) |
| Company's own prior-trough on the vendor's reported operating-income basis | **−10.2% (FY2024), −9.2% (FY2025)** | `CIQ Financials_Annual → Income Statement` (operating income −544.8 / −520.7) — vendor basis, goodwill impairment excluded |
| **Company's own prior-peak** | **+19.8% (FY2021), +15.6% (FY2022)** — pre-Zynga, minimal acquired-intangible amortization | `CIQ Financials_Annual → Income Statement` (668.5 / 3,372.8; 545.0 / 3,504.8) |
| Forward cycle **peak** implied by consensus (FY2029) | **~17.9% GAAP EBIT / ~20.4% core** | derived in §2 from `CIQ Estimates → Multiples` and the `earnings/04` management-basis bridge |
| Through-cycle EBITDA margin anchor | **~12%** (ten-year average EBITDA 471.8 on average revenue 3,919.8) | `business-model/07_business-quality.md` §4 |

So the terminal sits **340bps below peer-normal**, **310bps below the company's own last pre-Zynga peak**, **570bps below the forward consensus peak**, and about **58% of the way from its own prior-trough (~2.3% core) to its own prior-peak (19.8%)**. It is **not** set at or near the peak, and it is **not** set merely "below the recent peak" — both required anchors are named and cited. The honest qualifier: the terminal relies on a **filing-disclosed, mechanical** improvement — acquired-intangible amortization falling from 604.6 (7.5% of revenue) in FY2027 to 38.2 (0.4%) by FY2031 per the 10-K's own schedule — so roughly **700bps of the margin path requires no operating improvement at all**. That is the quantified bridge between TTWO's dismal realised through-cycle operating margin (~1.0% over ten years on the vendor's ex-impairment basis) and a 12.25% terminal.

**The structural-decline / runoff terminal — §5(b), both triggers fired, cited.** Two independent upstream rows fire the second trigger: (i) `business-model/09_moat.md` §5 records the moat trajectory as **"eroding (not confirmed)"** — three panel rows support erosion (EBITDA margin −730 to −780bps, operating margin −1,720 to −1,840bps with the sign flipped, ROIC-versus-WACC spread down ~1,120bps and crossed from above to below), with the decisive structural fact being **$5,887.3m of accumulated goodwill impairment against $6,949.2m of gross goodwill (~85% of all goodwill ever recorded)** written off because of *"industry conditions and changes in our strategies"*, plus **two disclosed unit lifetimes that both shortened in the latest filing** (player service period "six and fifteen" → **"five and fifteen"** months; title amortization "12 to 36" → **"9 to 36"** months) [`FY26 10-K, Notes 1, 7 and 9`]; and (ii) `business-model/07_business-quality.md` §1 scores **industry rate-of-change / disruption 35 (≤40)** and fires RF-BQ-005. The runoff terminal therefore carries a nominal `g` of **0.0%** — at or below US expected inflation of roughly 2.5%, i.e. **zero-to-negative real growth, trending negative** — stated on the **same nominal basis** as the rest of the model (no real rate is introduced into a nominal model; at `g = −1.0%` nominal the terminal falls further to 6,917 and the per-share value to **48.1**), together with an explicit fade of the terminal operating margin to a **lower, non-recovering 8.0%**, roughly midway between the 12.25% base terminal and the company's own ~2.3% prior-trough core margin.

**The runoff terminal does not replace the base.** This module publishes **one** base intrinsic value (63.17/share, §6). The runoff value of **50.58/share** (with the fade running from FY2035; **52.53** if the fade is applied to the terminal only) is the **structural-impairment input** for `07_scenario-and-fair-value`'s structural-reset bear leg and for the master synthesizer's §24 Filter 5 / Kill Criteria read. The horizon differs and must travel with it: the base is a through-cycle intrinsic level; the runoff describes a **24–36 month** permanent-impairment path. The single next data point that discriminates between them is already dated — **Q3 FY2027, the first full quarter with Grand Theft Auto VI on sale, releasing on or about 2027-02-09** [`CIQ Estimates → Consensus` header, "FQ3 2027 Earnings Release Date: Feb-09-2027"; `business-model/09_moat.md` §5].

**Growth must be financeable — Gate 2, run and resolved rather than flagged and left.** In FY2036, total capex (fixed 323.7 + content 1,187.1 = 1,510.8) less total D&A (1,471.0) plus ΔNWC (−29.0, a release) gives reinvestment of just **10.9**, a reinvestment rate of **1.04%** of NOPAT. At a terminal ROIC equal to the WACC, implied financeable growth is therefore **0.09%** against a modelled terminal `g` of **3.00%** — a gap of **2.91pp**, well above the ~1.5pp teeth threshold. **The gap is quantified and neutralised, not left standing:** the base terminal is `NOPAT/WACC`, which is **mathematically identical for every value of `g`** once terminal ROIC equals the WACC, so the base terminal **assigns zero value to the un-financeable growth** — it is exactly a zero-growth capitalization of normalized NOPAT. The 3.00% `g` is carried only as a label on the NOPAT roll-forward and cannot inflate the terminal. The variant where `g` *does* bite (persistence, +14.39/share) is published beside the base and is explicitly the one the moat verdict does not support. Intrinsic confidence is nonetheless capped for this reason among others (§8).

**ROIC drift (Gate 3).** Terminal ROIC is set **equal to** the WACC, with no persistence of excess returns. That is the conservative end of the gate and it is evidence-based rather than imposed: `business-model/09_moat.md` §4 concludes the company **"earns a return on capital below its cost of capital"** on every basis tested, so there is no upstream moat or quality evidence that would support persistent excess returns. Labelled: the fade of the *path* ROIC toward the WACC over FY2030–FY2036 is **inference, not from filings**, derived from the moat and business-quality outputs cited above.

---

## 6. DCF Output

**Base case — ROIC = WACC terminal.** Bridge uses `01`'s anchors verbatim: **strict §15 net debt of 1,370.4** (total debt 2,519.8 borrowings-only at carrying value, less cash & equivalents 1,149.4), nil minority, nil preferred, and the company's own disclosed diluted count of **188.0m** (not the 187.1m trailing figure, because every trailing period is a loss and the 1.1 + 0.1 of increments are excluded only as antidilutive) [`valuation/01` §7].

| Step | Value (USD m) |
|---|---:|
| PV of explicit FCFF (H2 FY2027 → FY2036, mid-year, WACC 8.852%) | **7,804.2** |
| + PV of terminal value (t = 9.50) | **5,443.0** |
| **= Enterprise value** | **13,247.2** |
| − Net debt (strict §15 basis, 2026-09-30) | **(1,370.4)** |
| − Minority interest | **(0.0) — nil** |
| − Preferred equity | **(0.0) — nil** |
| + Equity-method investments | **+0.0 — none disclosed** |
| **= Equity value** | **11,876.8** |
| ÷ Diluted shares (company-disclosed) | **188.0m** |
| **= Intrinsic value per share** | **USD 63.17** |
| vs current price (USD 216.61, as-of 2026-11-19, pool-verified) | **−70.8%** — the price is **3.43x** the base DCF value |

**The four labelled variants, so the reader can see the full span and judge whether the base is the outlier.**

| Variant | What changes | Per share | vs price | Price ÷ DCF |
|---|---|---:|---:|---:|
| **BASE** | ROIC = WACC terminal; SBC charged; terminal core margin 12.50% | **63.17** | −70.8% | 3.43x |
| Persistence terminal | Gordon on FY2036 FCFF at g = 3.0% (terminal ROIC above WACC — not supported by the moat verdict) | 77.56 | −64.2% | 2.79x |
| **Runoff (bear input)** | terminal operating margin faded to 8.0% from FY2035, g = 0.0% nominal | **50.58** | −76.7% | 4.28x |
| **Upside bound** | **SBC not charged at all** (added back exactly as CFO does, +5.7% of revenue a year) **AND** operating margins held at the consensus-implied level (core 19.0–20.4% fading to 17.5%) | **104.24** | −51.9% | 2.08x |

**Read the upside bound carefully, because it is the most important row in this report.** It is deliberately built to be as generous as the evidence allows — it adopts the Street's own operating case *and* stops charging stock-based pay as a cost — and it still lands at **104.24/share, 51.9% below the price**. There is no assumption set inside the evidence in this pool at which a discounted-cash-flow value reaches 216.61. At the model WACC, a **uniform 3.16x** scale-up of every modelled FCFF would be required to reach the canonical EV of 41,922.7; equivalently, the market is discounting this cash-flow path at **2.63%**, below the 10-year Treasury. Either this model's cash flows are far too low, or the price embeds expectations that no cash-flow path in this evidence base supports. Adjudicating that is `05_reverse-dcf`'s job — and per MODULE_RULES Scenario Construction §1 this DCF is a **cross-check** for an operating company that has a usable forward metric and both an own-history and a peer multiple set, so its combined weight with `06` in `07`'s base point is capped at a minority (≈ ≤ ⅓). `07` must reconcile this gap explicitly under Reconciliation Gate 6 rather than let the DCF silently drag the base down; the full high-to-low field across valid methods will exceed 40%, which triggers the valuation-confidence cap of 55 in `99`.

---

## 7. Sensitivity Grid (per-share intrinsic value, USD)

**Grid A — the base dispersion exhibit.** WACC across columns, the terminal normalized operating margin down rows (the base terminal is `NOPAT/WACC`, so terminal `g` is mathematically inert in it — see §5 — and the margin is the live second axis). Base cell in bold.

| | WACC 7.85% (−1pp) | **WACC 8.85%** | WACC 9.85% (+1pp) |
|---|---:|---:|---:|
| Terminal margin 14.50% (+2pp) | 77.81 | 68.54 | 61.19 |
| **Terminal margin 12.50% (base)** | 71.31 | **63.17** | 56.71 |
| Terminal margin 10.50% (−2pp) | 64.80 | 57.81 | 52.22 |

**Dispersion around the base point: USD 52.22 – 77.81 per share.** The WACC ±1pp band spans an equivalent beta range of roughly **0.69 to 1.15**, which is the practical answer to the undisclosed reference index behind the vendor's 0.92 beta.

**Grid B — the module's required WACC × terminal-growth form**, run on the persistence terminal so that `g` is live. Every cell's `WACC − g` gap is printed beneath it; **no cell is at or within 0.5pp of zero, so no cell is NM / invalid.**

| | WACC 7.85% (−1pp) | WACC 8.85% | WACC 9.85% (+1pp) |
|---|---:|---:|---:|
| g = 3.50% (+0.5pp) | 99.60 | 81.84 | 69.64 |
| *WACC − g (pp)* | *4.35* | *5.35* | *6.35* |
| g = 3.00% (base g) | 92.74 | **77.56** | 66.79 |
| *WACC − g (pp)* | *4.85* | *5.85* | *6.85* |
| g = 2.50% (−0.5pp) | 87.15 | 73.96 | 64.33 |
| *WACC − g (pp)* | *5.35* | *6.35* | *7.35* |

Even the most favourable corner of either grid — WACC 7.85%, g 3.50%, with a terminal that assumes persistent excess returns the moat module says do not exist — reaches **99.60/share, 54% below the price**.

---

## 8. Intrinsic Read

**The base-case intrinsic value is USD 63 per share** (63.17 exactly, on 188.0m diluted shares, an 8.85% WACC and a terminal that pays nothing for growth), with a sensitivity dispersion of **USD 52 to 78** and a labelled variant span of **USD 51 (runoff) to USD 104 (an upside bound that both adopts the Street's operating case and stops charging stock-based pay)**. Against the pool-verified price of **USD 216.61** (as-of 2026-11-19), that base point is **70.8% lower**, and the stark fact is that **no assumption set inside this evidence base — including the deliberately generous upside bound — produces a discounted-cash-flow value within 50% of the price**; reaching it would need a uniform **3.16x** lift to every modelled free cash flow, or a discount rate of **2.63%**, below the 10-year Treasury.

**The single assumption the answer is most sensitive to is the normalized mid-cycle operating margin, not the discount rate.** ±2pp on the terminal margin moves the base by about **−5 to +5 per share** while ±1pp on the WACC moves it by about **−6 to +8**; but the *level* question dominates both — the whole gap between the 63 base and the 104 upside bound is (a) whether the roughly **5.7% of revenue** of stock-based compensation is a real cost (it is, §15) and (b) whether the FY2029 consensus-implied core margin near **20.4%** is a through-cycle level or a GTA VI launch-cycle peak. The Cyclicality Gate says it is a peak: the company's own realised ten-year operating margin on the vendor's ex-impairment basis is about **1.0%**, its prior-trough core margin about **2.3%**, and roughly **700bps** of the modelled improvement is the mechanical run-off of Zynga acquired-intangible amortization from the 10-K's own schedule rather than any operating gain.

**Confidence in this intrinsic read: LOW-to-MODERATE, capped, and the reasons are named.** Three bind: (1) the FY2027 base is **forward and company-guided, not trailing**, because the trailing base is negative (LTM EBIT −112.5 / −180.8, LTM §15 FCF 62.6), and the FY2029+ path is substantially **my own assumption** rather than company-guided — the thin-coverage consensus series was smoothed, not adopted as a point forecast; (2) the **Gate-2 financeable-growth gap of 2.91pp** was neutralised by making the terminal `g`-invariant rather than bridged with evidence, which is the conservative resolution but still a resolution-by-construction; (3) the **numeric reading check is absent from this generation**, so every workbook-cell figure here is mechanically unverified — each value-determining number was re-read from the frozen extract of the filing that reports it, but "unchecked" is not "clean". No partial-data cap from MODULE_RULES fires on the data itself (the cash flow statement, the balance sheet and forward estimates are all present), and terminal value at **41.1% of EV** is far below the 75% terminal-dominance line, so that cap does not bind either.

**Canonical handoff to `05_reverse-dcf` (MODULE_RULES DCF standard 9).** Invert **this** model — do not re-derive a WACC or use a different base. The fixed inputs are: **WACC 8.852%** (k_e 9.1272%, after-tax k_d 4.424%, weights 94.15% / 5.85%, normalized tax 21.0%); **horizon** ten years from 2026-09-30 (H2 FY2027 stub at t = 0.25, then FY2028–FY2036 at t = 1.00–9.00, terminal at t = 9.50); **mid-year discounting**; **terminal `g` 3.00% with terminal ROIC = WACC**; **normalized FCF base** = the FY2032–FY2036 band of **1,036–1,049** (FY2036 1,036.2), with the FY2027 full-year figure of **613.9** and the H2 FY2027 stub of **1,243.8** as the near-term anchors; and the bridge items **net debt 1,370.4 strict / 188.0m diluted shares**. The first hypothesis `05` should test is the one §3A already partly answers: the price-to-value gap here is **not** a low-discount-rate artefact, so `05` must solve for the growth-and-margin combination the 216.61 price requires and judge it against `earnings/04`'s evidence that FY2027 consensus already sits **5.6% above the midpoint and 4.3% above the top** of management's own reiterated Net Bookings range.
