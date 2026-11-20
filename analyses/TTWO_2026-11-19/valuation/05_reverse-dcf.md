# Reverse DCF — What's Priced In — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Run date:** 2026-11-20
**Reporting standard:** US GAAP · **Currency:** USD, millions unless stated · **Fiscal year ends 31 March** ("FY2027" = 1 Apr 2026 → 31 Mar 2027, not a calendar year) [`FY26 10-K, cover page`; `Q2 FY27 10-Q, cover page`].
**Valuation date for discounting:** **2026-09-30** (inherited from `04`). Price anchor 2026-11-19.

**What this agent does, in one line.** `04_intrinsic-dcf` forecast cash flows forward and got USD 63.17 a share against a price of 216.61. This agent runs the identical model **backwards**: it holds `04`'s discount rate, horizon, discounting convention, terminal form and normalized cash-flow base fixed, and solves for the growth and margin **the price itself requires**. It produces no fair value. A reverse-DCF ("what's priced in") is only meaningful as the exact inverse of the forward DCF, so nothing here is re-derived.

**Price-state gate passed.** `01` §7 tags the price-state **`pool-verified`** (USD 216.61, last close, as-of 2026-11-19, 1 trading day old, no staleness cap). The reverse-DCF is therefore permitted to run. One dated limitation travels with the anchor and is not a cap: 2026-11-19 is **the Grand Theft Auto VI release date itself**, so the close contains no post-launch trading [`Q2 FY27 10-Q, Item 1A and Item 2`].

**Source-check status carried forward: UNCHECKED, not verified clean.** This frozen generation carries **no `numeric_reading_check`** object at any source or sheet level, and `GENERATION_ROOT/corpus.txt` carries no labelled extractor reading-warning annotation. There is therefore **no literal warning token, no source/extract reference and no LF-line/column span to quarantine, and no amount below is marked not-proven on that basis** — but a missing check means **unchecked, not clean**, so every workbook-cell figure used here is mechanically unverified by the pattern check. Every value-determining number was read from the frozen extract of the document that reports it, or taken verbatim from an upstream sibling that did the same. Every restating layer must carry this qualifier forward.

**Upstream inputs used.** `valuation/01_price-and-capital-structure` (price, shares, net debt, EV — adopted verbatim), `valuation/04_intrinsic-dcf` (WACC, normalized FCF base, terminal growth, horizon, discounting convention — **inverted, not re-derived**), `valuation/02` and `03` (context on the trailing-vs-forward denominator), `earnings/01_historical-financials` (the realised cash-flow and profit series that supply the base rates), `earnings/07_earnings-sensitivity` (the achievable ranges and the one-variable concentration), `business-model/07_business-quality` (the through-cycle anchor and the explicit warning that FY27–FY28 prints this cycle's peak), `business-model/09_moat` ("No moat proven" — the durability of any implied advantage period).

**The arithmetic below was produced by an executed Python solver, not by hand.** The commands and the roots they returned are reproduced in §5. Backing growth out of a price is a nonlinear root-find, and this number *is* the engine's entire "what's priced in" read.

---

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | **USD 216.61** (last close, as-of 2026-11-19, `pool-verified`) | from `01` §7 [`Capital IQ Comps → Financial Data` "Day Close Price Latest"; pinned by `ciq_facts.json → current_price`] |
| Market capitalization | **40,552.3** | from `01` §3 (187,213,488 × 216.61) |
| Net debt (strict §15: borrowings-only debt 2,519.8 − cash & equivalents 1,149.4) | **1,370.4** | from `01` §7, adopted from `balance-sheet-survival/01` [`Q2 FY27 10-Q, Note 10 (Debt)` and `Balance Sheets`] |
| Diluted shares (per-share basis) | **188.0m** | from `01` §7 — the company's own disclosed diluted count [`TTWO 2Q27 Earnings Release, 2026-11-09`] |
| **Enterprise value — the target the solver must hit** | **41,922.7** | from `01` §7 (strict cash, borrowings-only debt). No plug |
| **FCF base — normalized, forward** | **FY2028 FCFF 1,125.9**; normalized mid-cycle FY2032–FY2036 band **1,036–1,049**; near-term anchors FY2027 full-year **613.7** and H2 FY2027 stub **1,243.6** | from `04` §1 and §4 (my rebuild reproduces 04's 1,126.1 / 613.9 / 1,243.8 to 0.02%) |
| **Discount rate (WACC) used** | **8.852%** — used verbatim, not re-derived | from `04` §3: `k_e` 9.1272% (rf 5.07% web-sourced + β 0.92 × ERP 4.41% web-sourced), after-tax `k_d` 4.424% (5.60% coupon × (1 − 0.21)), weights 94.15% / 5.85% |
| Normalized tax rate | **21.0%** | from `04` §1, reconciled to `business-model/09_moat.md` §3 |
| **Forecast horizon** | **10 years** — H2 FY2027 stub at t = 0.25, FY2028–FY2036 at t = 1.00–9.00, terminal struck at t = 9.50 | from `04` §4 |
| Discounting convention | **Mid-year** (t − 0.5 equivalent), measured from 2026-09-30 | from `04` §4 |
| Terminal form and growth | **`TV = NOPAT_FY2037 / WACC`** (terminal ROIC = WACC, so growth creates no value), with the **`g` = 3.00%** label rolling NOPAT forward one year | from `04` §5 |
| Business type | **Operating** (single operating and reportable segment) → invert the FCFF / EV model, not a DDM or residual-income model | `00_valuation-data-triage` §3; `FY26 10-K, Note 21`; MODULE_RULES Business-Type Method Map |
| Reference point: `04`'s forward answer | **EV 13,245.3** (04: 13,247.2) → **USD 63.16/share** (04: 63.17) | my rebuild, §5 Step 0 — the model is reproduced before it is inverted |

**Why the base is forward and not trailing, stated so the reader can see the choice.** The trailing earnings base is **negative**: LTM EBIT −112.5 (vendor) / −180.8 (filing-derived), LTM diluted EPS −1.29, and LTM §15 FCF of only 62.6 (CFO 367.1 − total capex 304.5) [`earnings/01` §2; `CIQ Financials_Quarterly → Income Statement / Cash Flow`, LTM Sep-30-2026]. You cannot compound a price off a negative or near-zero base — any trailing-anchored implied-growth number would be arithmetic noise. The base used is therefore **`04`'s forward, company-guided FY2027 and its modelled FY2028 level**, and every implied figure below is labelled with the base it was struck on.

**Tie-out before inversion (the test that this really is the same model).** Rebuilding `04`'s assumptions from §2 of that report — revenue path, the 10-K's own acquired-intangible amortization schedule, D&A 2.41% of revenue, content amortization 7.5%→11.0%, content cash spend 11.0%, fixed capex, net working capital held at −11.0% off the actual −701.1 at 2026-09-30, tax 21.0% — reproduces the FCFF path, the H2 FY2027 stub of 1,243.6, PV of explicit flows 7,802.3, PV of terminal 5,443.0, EV **13,245.3** and **63.16/share**, against `04`'s 1,243.8 / 7,804.2 / 5,443.0 / 13,247.2 / 63.17. The 0.014% gap is `04`'s displayed rounding on the D&A lines. **Same model, same rate, same base, same convention.**

---

## 2. Implied Expectations

**What was held fixed:** the discount rate (8.852%), the 10-year horizon and its exact `t` schedule, the mid-year convention, the terminal form (`NOPAT/WACC`, terminal ROIC = WACC) and its 3.00% roll-forward, the 21.0% tax rate, the bridge (net debt 1,370.4 strict, nil minority, nil preferred, 188.0m shares), **and the already-reported H1 FY2027 (−629.9 of FCFF, a fact, not an expectation)**. The H2 FY2027 stub of 1,243.6 is also held fixed, because it is the company's own guidance for a half-year that was two-thirds of the way through when the anchor price was struck.

**What was solved for:** in each row, the single named variable that makes the present value equal today's enterprise value of 41,922.7.

| What the Price Implies | Solved Value |
|---|---:|
| **Implied FCFF CAGR over the horizon** — the constant annual growth rate of free cash flow to the firm, FY2028 → FY2036, off `04`'s own modelled FY2028 FCFF of 1,125.9, terminal struck on the same form | **+20.47% a year for 9 years** |
| ↳ the FCFF path that implies (USD m, FY2028 → FY2036) | 1,126 · 1,356 · 1,634 · 1,969 · 2,372 · 2,857 · 3,442 · 4,147 · **4,996** |
| ↳ implied FY2036 FCFF versus `04`'s modelled FY2036 FCFF of 1,036 | **4.82x** |
| ↳ terminal value at the solved point, as a share of EV | **62.6%** (vs 41.1% in `04`'s base) |
| **Implied steady-state core EBIT margin** — one flat operating margin before acquired-intangible amortization, FY2028 → terminal, holding `04`'s revenue path and every capex / working-capital / amortization ratio fixed | **45.78% core / 45.56% GAAP EBIT** |
| ↳ implied FY2036 EBIT on `04`'s consensus-derived revenue of 10,791.7 | **4,917** |
| **Implied years of above-GDP growth (fade model)** — FCFF grows at a stated rate `H` for `N` years, then the terminal is struck; solve for `N` | see the three cases below |
| ↳ at `H` = **3.13%** (the consensus FY2028→FY2034 revenue CAGR `04` §2 actually used) | **No finite horizon reaches the price.** Maximum EV as `N` → ∞ is **20,893** — half the market's 41,922.7 |
| ↳ at `H` = **7.56%** (TTWO's own post-Zynga revenue CAGR, FY2023 → FY2026) | **40 years** of uninterrupted above-GDP growth |
| ↳ at `H` = **17.40%** (TTWO's own FY2022 → FY2026 revenue CAGR, which embeds the Zynga acquisition) | **10 years** |
| **Implied revenue trajectory** — the implied FY2036 FCFF converted back to revenue at `04`'s own fixed FY2036 FCFF-to-revenue conversion of **9.60%** (margin and cash conversion held, per the market-ceiling rule) | **FY2036 revenue ≈ 52,045**, an implied revenue CAGR of **23.00%** from the guided FY2027 base of 8,080 |

**Read the three solves together, because they are three descriptions of one requirement.** They are not independent findings. The price needs `04`'s cash-flow path lifted by a factor that rises to 4.8x by FY2036 — expressed as growth that is 20.5% a year, expressed as margin that is a flat 45.8%, expressed as revenue that is 52bn. Each is the same gap measured on a different axis, and `04` §3A already named its size from the other direction: a **uniform 3.16x** lift to every modelled free cash flow at the model WACC.

**One thing the solve reveals that `04`'s forward run did not.** At the implied growth rate the terminal value rises to **62.6% of EV**, from 41.1% in `04`'s base. So the price is not only asking for more cash flow — it is asking for a much larger share of the value to sit beyond FY2036, in the perpetuity. That is why the terminal-`g` robustness in §4 is run rather than skipped.

---

## 2A. Implied Discount Rate — the dual solve

A DCF is one equation with two unknowns: the cash flows and the rate. §2 held the rate and solved for growth. This is the mirror: hold `04`'s own base-case cash flows verbatim and solve for the rate.

| Solve | Held fixed | Solved value |
|---|---|---:|
| **Implied discount rate at `04`'s base-case cash flows** | `04`'s FCFF path FY2027–FY2036 verbatim, the H1 FY2027 strip-out, terminal `g` 3.00%, 10-year horizon, mid-year convention, target EV 41,922.7 | **2.63%** |
| `04`'s model WACC (for comparison) | — | **8.852%** |
| **Ratio (implied ÷ model)** | — | **0.297x** (the model rate is **3.37x** the implied rate) |
| Memo — the 10-year US Treasury used as `04`'s risk-free rate | — | 5.07% [`Web: US 10-year Treasury yield, 2026-11-19 (indicative, unverified)`] |

**Reported into `04` §3A, and it reconciles exactly.** `04` §3A already carries the market-implied rate as **≈ 2.63%**, solved in its own §4 snippet; my independent re-solve returns **2.6321%**. The two agree. `04`'s Cost-of-Capital Reality Test escalation did not fire and **no `RF-VAL-003` tag is emitted here either** — the trigger is "model WACC **below** ~two-thirds of the market-implied rate", and the model rate is 3.37x the implied rate, the opposite direction.

**Which way it cuts — both readings stated, one chosen on evidence.** The ratio does **not** exceed ~1.5x; it is 0.297x, so the "market is pricing an unprecedented collapse" failure mode this test guards against cannot arise here. The extreme ratio runs the other way, and the two readings are these:

- **Reading A — the cash flows are wrong (the model's are too low).** The market is pricing cash flows far above `04`'s path. Tested against the company's own history and the earnings evidence in §3 below. **This is the live reading**, and sizing it is exactly what §2 did.
- **Reading B — the rate is wrong (the model discounts too cheaply).** For Reading B to explain the gap, the *true* cost of capital would have to be **2.63%** — **244 basis points BELOW the 5.07% risk-free rate** the model is built on. An equity cost of capital below the government bond is not a cost of capital; it is an arithmetic impossibility for a listed, levered, cyclical equity. Three further checks rule it out: (i) `04`'s WACC **cleared every low-side floor** — the equity-risk-premium floor at `k_e − rf` = 4.06pp (narrowly, and stated as such), the beta floor with a raw vendor beta of 0.92 above the ~0.8 artefact line, and a deliberate, reasoned no-country-risk choice for a USD-reporting Delaware filer [`04` §3]; (ii) the model rate sits **4.11pp ABOVE** the only numeric discount rate the company itself discloses anywhere in this pool, the 4.74% weighted-average operating-lease rate [`FY26 10-K, Note 13 (Leases)`] — and even that comparator is a pre-tax incremental **borrowing** rate on lease obligations, which fails the scope match and is below where a WACC belongs; (iii) no scope-matched group discount rate exists in the pool at all — the FY26 10-K references "risk-adjusted discount rates based on our weighted average cost of capital" for goodwill testing but states **no number** [`FY26 10-K, Critical Accounting Policies — Goodwill`; `Note 9`].

**So Reading B is rejected on evidence, not by default.** The gap between `04`'s value and the price is a **cash-flow-expectations gap**, not a discount-rate artefact. That is the same conclusion `04` §3A reached, now confirmed from the inverse direction — and it is the reason this module's whole job is to size and test those expectations rather than argue about the rate.

---

## 3. Implied vs Achievable

**The base-rate matching comes first, because this is where a reverse-DCF read on a mid-release-cycle publisher goes wrong (CLAUDE.md §9).** The claim being tested is a **forward cash-flow (profit) growth** claim, at **group** level, compounding **from an FY2028 base that is itself a launch-cycle peak**. So the base rate must match on all three: metric (profit/cash flow, not revenue), level (group — and here the pool forces that, see below), and period (peak-to-peak, not trough-to-peak, and weighting recent realised periods above a decade-old average).

**On level, the decomposition the rule asks for cannot be performed, and that is a disclosed fact rather than a shortcut.** TTWO has **one** operating and reportable segment [`FY26 10-K, Note 21`], which is why `06_sum-of-the-parts` returned "not applicable". The driver of the claim is a single title: `earnings/07` §4 establishes that the guided Q3 FY2027 step-up of **+1,667.9** of Net Bookings is **120.9% of the entire year's guided growth** — the other three quarters shrink by 288.9 in aggregate — but also that **"GTA VI's own share of the 1,667.9 is not disclosed anywhere in the pool"**, and no Q3 FY26 filing exists from which to derive the prior-year recurrent-spending base. The engine can size the quarter and cannot size the title inside it. So the test runs at group level with that limitation named, not at a title level the disclosure does not support.

| Implied Requirement | Company History (metric-, level- and period-matched) | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| **Implied FCFF CAGR = +20.47% a year for 9 years, FY2028 → FY2036, off an FY2028 base of 1,125.9** | **Metric-matched (§15 FCF = CFO − total capex), the closest match to the claim:** FY2022 99.4 → FY2023 **(203.1)** → FY2024 **(185.2)** → FY2025 **(234.9)** → FY2026 434.1 → **LTM Sep-26 62.6**. Three of the last five years were **negative**, so no multi-year CAGR is computable through the middle of the series. The only computable full-span rate, FY2022 → LTM Sep-2026, is **−9.76% a year** [`earnings/01` §1–§2] | `earnings/07` §7 scores earnings volatility **78/100 (inverted — higher = worse)**: on the one comparable metric the top variable is 2.4x the second and up to 4.0x it at the fixed-cost bound, and EBIT margin swings from −7.8% actual to +14.4% guided on the same cost base in consecutive quarters. `earnings/07` §6 shows the downside coefficient is **1.0x to 2.0x** the upside coefficient, because the content-amortization policy charges at the **greater of** revenue-proportional or straight-line over 9–36 months | **No** |
| **Implied steady-state core EBIT margin = 45.78% (45.56% GAAP)** | Own prior **peak** 19.8% (FY2021, pre-Zynga); own prior **trough** core ~2.3% (FY2024 3.2% / FY2025 1.4%); ten-year realised operating margin ≈ **1.0%** on the vendor's ex-impairment basis; `04`'s base terminal **12.50%** [`04` §5, each anchor cited there] | Peer-normal EBIT margin, ten-peer median: **+15.9%**; the highest LTM **EBITDA** margin anywhere in the peer set is Konami's 39.6% [`CIQ Comps → Operating Statistics` / `→ Trading Multiples`, As-Of 2026-11-19, via `03` §2]. The implied **EBIT** margin of 45.6% is **2.9x** peer-normal and **2.3x** the company's own best year ever | **No** |
| **Implied years of above-GDP growth** | At the consensus growth rate `04` actually used (3.13%), **no horizon of any length reaches the price** — the maximum attainable EV is 20,893, **50.1%** of the market's 41,922.7. At the company's own post-Zynga organic revenue CAGR of 7.56%, the price needs **40 consecutive years** | `business-model/09_moat.md` §5 returns **"No moat proven"** — four moat sources present, **none** reaching the 61–80 "strong" band, and the economic test failing on every basis (five-year through-cycle ROIC −0.7% against ~8.2% WACC; LTM −2.2%). ROIC has been negative **five years running**: −4.3%, −3.1%, −4.2%, −0.8%, −1.0% LTM [`ciq_facts.json → multi_year_trajectory`]. A 40-year advantage period requires a moat the moat module could not evidence for one year | **No** |
| **Implied FY2036 FCFF = 4,996** | **11.5x** the company's best-ever annual §15 FCF (434.1, FY2026) and **80x** the LTM figure of 62.6 [`earnings/01` §1–§2] | `earnings/07` §6 asymmetry 2: impairment is a step, not a slope — **2,149.7** of capitalised cost related to **unreleased** titles at 2026-03-31, equal to **61.2%** of total stockholders' equity, against a carried balance of 2,577.3 at 2026-09-30, with 43.6 already charged in H1 FY27 | **No** |

**Adjudicating the number that disagrees, by name (CLAUDE.md §3).** There **is** a series in the engine's own data that comes out at almost exactly the implied rate, and it must be named rather than left out: the company's **nine-year EBITDA CAGR from FY2017 to FY2026 is +20.33%** (149 → 788) [`ciq_facts.json → multi_year_trajectory` (`CIQ Financials → Income Statement`), tier-5 vendor export]. Against an implied 20.47%, that is a gap of **+0.14pp** — on its face, the price looks like it is asking for exactly what the company has done for nine years. Three reasons it does not rescue the verdict, each testable:

1. **Period mismatch — it is a trough-to-peak measurement being used to test a peak-to-peak claim.** FY2017 EBITDA of 149 was an 8% margin on revenue of 1,780, struck between the GTA V tail and the Red Dead Redemption 2 launch. The forward claim starts in **FY2028**, which this engine's own business-quality read says will print this cycle's **peak**: *"Grand Theft Auto VI launched November 19, 2026, and FY27–FY28 will print this cycle's peak. A peak-year ROIC or margin off that launch is not the through-cycle level any more than today's −1.0% is"* [`business-model/07_business-quality.md` §4]. The period-matched base rate for compounding **from one cycle peak** is **peak-to-peak**: FY2021 EBITDA 757 → FY2026 788 = **+0.81% a year over five years**. That is the comparable, and it is 19.66pp below the implied rate.
2. **Metric mismatch — EBITDA is the wrong unit for this company's cash flow.** EBITDA excludes the single largest discretionary cash cost in the business: software development spend of **688.9** in FY2026, which sits **inside** operating cash flow and not in capex [`FY26 10-K, Consolidated Statements of Cash Flows`, p.66; `earnings/01` §1]. It also excludes stock-based compensation, guided at **462** for FY2027 (5.72% of guided revenue, +51.3% above FY2026's 305.3 actual) [`TTWO 2Q27 Earnings Release, 2026-11-09, Outlook`]. On the metric that actually matches the claim, the realised four-and-a-half-year rate is **−9.76% a year**.
3. **Level / inorganic mismatch.** The FY2017→FY2026 window contains the **Zynga acquisition** (FY2023), which alone took revenue from 3,504.8 to 5,349.9 in one year. Strip it and the company's own organic revenue CAGR, FY2023 → FY2026, is **7.56%** — the rate at which the price needs 40 years.

So the agreeing number is real, is named, and is a trough-to-peak EBITDA measurement on an acquisition-inflated window. It does not overturn the verdict; it is the clearest illustration of why the unit of the base rate has to match the unit of the claim.

**One further check that runs in the price's favour, and it still does not get there.** The market may reasonably be pricing consensus rather than `04`'s model. Consensus is on the company's **management-reporting** basis — it adds back stock-based compensation (462), acquired-intangible amortization (623) and the change in deferred net revenue (47), and applies an 18% tax rate [`03` §2, which reconciles the stack to the cent]. `04`'s **upside bound** is built precisely to adopt that view: it stops charging stock-based pay altogether and lifts core margins to the consensus-implied 19.0–20.4%, producing an FY2028 FCFF of **1,611.5** and a value of 104.24/share. Solving the implied growth off **that** generous base still returns **+14.18% a year for nine years** — against a peak-to-peak realised rate of 0.81% and a consensus long-run rate of 3.13%. The conclusion does not depend on charging stock-based compensation.

**Judgement, in four sentences.** At USD 216.61 the market's implied expectations are **aggressive**, and not marginally so. The price requires free cash flow to compound at **20.5% a year for nine years off an already-elevated launch-cycle base**, or a flat **45.8% operating margin** — against a company whose realised free cash flow has fallen at **9.8% a year** since FY2022, whose profit between cycle peaks grew **0.81% a year**, whose return on capital has been negative five years running, and whose own forward consensus carries a long-run revenue growth rate of **3.13%**. The requirement survives none of the generous adjustments available inside this evidence base: at consensus growth the price is **unreachable at any horizon**, and even adopting the Street's margins and refusing to charge stock-based pay leaves 14.2% a year to be found. The single most important qualifier runs the other way and must travel: **no reported period contains a single dollar of GTA VI revenue** [`earnings/07` §4] — the engine is testing an expectation about an unshipped-until-the-anchor-date title against history, which is the only test available and is not the same as proof the expectation is wrong.

**Market-ceiling sanity check (one-directional — it can only raise the bar).** TTWO is an operating business, so the test applies, and the implied FCFF growth has been converted to an implied **revenue** trajectory first: holding `04`'s own FY2036 FCFF-to-revenue conversion of **9.60%** fixed, the implied FY2036 FCFF of 4,996 requires revenue of about **52,045** — an implied revenue CAGR of **23.00%** from the guided FY2027 base of 8,080, against `04`'s consensus-derived FY2036 revenue of 10,791.7 (**4.8x**).

**Honest limitation on sizing the market, stated rather than papered over.** **No addressable-market, category-revenue or industry-size figure exists anywhere in this data pool** — not in the 10-K, not in the 10-Q, not in any Capital IQ tab. Market size is a low-tier input (CLAUDE.md §4) and inventing a TAM would be worse than omitting the check. What the pool *does* contain is a defensible **proxy scale**: the LTM revenue of the ten companies in TTWO's own named peer set [`CIQ Comps → Financial Data`, As-Of 2026-11-19, via `03` §1], which sums to **41,255.2**; with TTWO's own 6,409.7 that is a **47,664.9** eleven-company revenue pool, of which TTWO is **13.4%** today. The implied 52,045 is **109% of that entire pool** and would take TTWO's share to **55.8%** with peers held flat. Two qualifiers travel with that figure, and the second is the one to rely on: (i) the proxy **understates** the category, because TTWO also names Tencent, Sony, Microsoft, Nintendo, Apple, Google, Epic Games, Playrix, Savvy Games and Embracer as competitors and no game-publishing revenue line is derivable for the conglomerates or the private firms [`FY26 10-K, Item 1 — Competition`], so the "109% of the pool" share is an upper bound on the required share, not a measurement; (ii) the robust statement needs no TAM at all — **the implied FY2036 revenue of 52,045 is 3.8x the LTM revenue of the single largest company in TTWO's own named peer set** (Nintendo, 13,684.5), meaning the price requires Take-Two to become, within ten years, nearly four times the size Nintendo is today. **On market-ceiling grounds the implied expectation is flagged aggressive / unachievable regardless of the company's own history.** This check has only raised the bar; it justifies no upside and lifts no fair value.

---

## 4. Robustness

**(a) Discount rate ±1pp, with the FCF base held at `04`'s own FY2028 level of 1,125.9.**

| Discount Rate | Implied FCFF CAGR to Justify Price |
|---|---:|
| WACC −1pp (7.852%) | **17.79%** |
| **WACC (8.852%, `04`'s rate)** | **20.47%** |
| WACC +1pp (9.852%) | **23.02%** |

**(b) FCF base low / base / high, with the discount rate held at 8.852%. All three anchors come from `04`; none is invented here.**

| FY2028 FCFF anchor | What it is | Implied FCFF CAGR |
|---|---|---:|
| **LOW — 613.7** | `04`'s **FY2027 full-year modelled FCFF** on the company's own 2026-11-09 guidance — i.e. the FY2028 operating step-up does not happen at all [`04` §1, §4] | **31.38%** |
| **BASE — 1,125.9** | `04`'s modelled FY2028 FCFF (core margin 17.50%, set ~240bps **below** the Street's own implied level) [`04` §2] | **20.47%** |
| **HIGH — 1,611.5** | `04`'s **upside bound**: stock-based pay not charged at all (+5.7% of revenue pre-tax) **and** core margin at the consensus-implied 19.0% [`04` §6] | **14.18%** |

**(c) Terminal `g` ±0.5pp — run because terminal value is 62.6% of EV at the solved point, above the ~60% line.**

| Terminal `g` | Implied FCFF CAGR, `04`'s BASE terminal form (`TV = NOPAT/WACC`; `g` only rolls NOPAT forward one year) | Implied FCFF CAGR, `04`'s PERSISTENCE terminal (Gordon on FCFF, where `g` is live in the denominator) |
|---|---:|---:|
| 2.50% (−0.5pp) | 20.53% | 16.82% |
| **3.00% (`04`'s `g`)** | **20.47%** | 15.80% |
| 3.50% (+0.5pp) | 20.42% | 14.69% |

**How to read (c), because the two columns say different things and both are true.** In `04`'s **base** terminal, terminal ROIC is set equal to the WACC, so `TV = NOPAT/WACC` and growth creates no value — `g` is **mathematically almost inert**, moving the implied rate by 0.06pp across the whole ±0.5pp band. That is a genuine strength of the inversion: the headline 20.47% is not a terminal-growth artefact. The second column shows what happens if the terminal is instead struck on `04`'s **persistence** variant, which assumes terminal ROIC **above** the cost of capital — the implied requirement falls to 14.7–16.8%. `business-model/09_moat.md` §5 returns "No moat proven" and five straight years of negative ROIC, so that variant is **not** supported and is shown as a labelled cross-check, exactly as `04` treats it. Even on it, the implied rate remains roughly **18x** the company's realised peak-to-peak profit growth of 0.81% a year.

**The dominant input is the FCF BASE, not the discount rate — and the margin is wide.** A ±1pp move in the discount rate shifts the implied growth by **5.23pp**; the FCF-base band shifts it by **17.20pp**, **3.3x** as much. Terminal `g` is third by a wide distance (0.11pp on the faithful base form). This matches every prior output that examined it: the answer is set by what you think the normalized cash-flow level is, not by what you discount it at. And it is the reason the §2A dual solve matters — the price's disagreement with `04` is a disagreement about the **level of cash flow**, which §2 sizes, not about the rate, which §2A rules out.

**What does NOT move the verdict.** Every cell in every panel above — the most generous being a 7.852% discount rate, the Street's own margins, no charge for stock-based pay, and a terminal that pays for growth the moat module says does not exist — requires free cash flow to compound at **at least 14.18% a year for nine years**. The company's realised rate on the metric-matched series is **−9.76% a year**, its peak-to-peak profit growth is **+0.81% a year**, and its own forward consensus carries **3.13%**.

---

## 5. Executed Solver — commands and roots

Run on 2026-11-20. The model is rebuilt from `04`'s §2 assumption table, tied out against `04`'s published output, and only then inverted. Bisection is used in place of `scipy.optimize.brentq` (scipy is not installed in this environment); it is a bracketed root-find on the same monotone functions, converged to 1e-12.

```
$ python3 rev.py   # executed 2026-11-20
STEP 0  reproduce 04
  FY2027..FY2036 FCFF: 613.7 1125.9 1184.5 1138.4 1093.7 1048.3 1041.6 1033.5 1031.5 1035.9
  H2 FY27 stub 1243.6  PVexplicit 7802.3  PV(TV) 5443.0  EV 13245.3  (04: 1243.8 / 7804.2 / 5443.0 / 13247.2)
  TV%EV 41.1%  equity 11874.9  /188.0 = 63.16/sh
  terminal mechanics: NOPAT36/FCFF36 = 1.01082 -> TV = FCFF_last x 1.03 x 1.01082 / WACC

STEP 1  PRIMARY SOLVE -- implied FCFF CAGR
  held fixed: WACC 8.852%, 10-yr horizon, mid-year DF, terminal = NOPAT/WACC form,
              H2 FY2027 stub 1243.6 (company-guided, H1 reported stripped),
              bridge net debt 1370.4 / 188.0m shares, target EV 41922.7
  solved for: the constant annual growth rate of FCFF, FY2028 -> FY2036,
              off 04's own modelled FY2028 FCFF of 1125.9
  ROOT: implied FCFF CAGR = 20.47%  (EV check 41922.7 vs target 41922.7)
  implied FCFF path FY2028..FY2036: 1126 1356 1634 1969 2372 2857 3442 4147 4996
  PVexplicit 15670  PV(TV) 26253  TV%EV 62.6%
  implied FY2036 FCFF 4996 vs 04 modelled 1036 = 4.82x
  04's FY2036 FCFF/revenue conversion = 9.60%
  -> implied FY2036 REVENUE at that fixed conversion = 52,045
     (vs 04/consensus FY2036 revenue 10,791.7; implied rev CAGR FY2027->FY2036 = 23.00%)

STEP 2  SECONDARY SOLVE A -- implied uniform steady-state CORE operating margin
  ROOT: implied flat core margin = 45.78%   (EV check 41922.7)
        implied GAAP EBIT margin in FY2036 = 45.56%
        implied FY2036 EBIT = 4,917 on revenue 10,791.7
  anchors (04 §5): peer-normal EBIT 15.9% | own prior peak 19.8% (FY2021) | consensus fwd peak core 20.4%
                   own prior-trough core ~2.3% | 04 base terminal core 12.50%

STEP 3  SECONDARY SOLVE B -- implied years of above-GDP growth (fade model)
  at H=3.13% (consensus FY28->FY34 revenue CAGR): NO finite horizon reaches the price.
      Max EV as N->inf = 20,893 vs target 41,922.7
  at H=7.56% (own post-Zynga revenue CAGR FY23->FY26): N = 40.0 years of growth needed
  at H=17.40% (own FY22->FY26 revenue CAGR, Zynga-inflated): N = 10.0 years

STEP 4  §2A DUAL SOLVE -- implied discount rate on 04's OWN base-case cash flows
  ROOT: implied discount rate = 2.63%  (EV check 41,922.7)
  model WACC 8.852%  ->  ratio implied/model = 0.297x   (model is 3.37x the implied rate)
  vs 10-yr UST 5.07%: implied rate is -2.44pp vs the risk-free rate
  04 §3A reported 2.63% -> reconciles

STEP 5  ROBUSTNESS
  FCF-base band for the FY2028 anchor (all from 04):
    LOW    613.7  = 04's FY2027 full-year modelled FCFF (company-guided; no FY28 margin step-up)
    BASE  1125.9  = 04's modelled FY2028 FCFF
    HIGH  1611.5  = 04's upside bound (SBC not charged, +5.7% of revenue; core margin 19.0%)
  (a) discount rate +/-1pp, FCF base at 04's BASE
    WACC -1pp  7.852%: implied FCFF CAGR =  17.79%
    WACC       8.852%: implied FCFF CAGR =  20.47%
    WACC +1pp  9.852%: implied FCFF CAGR =  23.02%
  (b) FCF base low / base / high, discount rate at 8.852%
    FY2028 FCFF LOW  613.7: implied FCFF CAGR =  31.38%
    FY2028 FCFF BASE 1125.9: implied FCFF CAGR =  20.47%
    FY2028 FCFF HIGH 1611.5: implied FCFF CAGR =  14.18%
  (c) terminal g +/-0.5pp  (TV is 62.6% of EV at the solved point, >60% -> required)
    terminal g 2.5% (04 base form, TV=NOPAT/WACC): implied CAGR =  20.53%
    terminal g 3.0% (04 base form, TV=NOPAT/WACC): implied CAGR =  20.47%
    terminal g 3.5% (04 base form, TV=NOPAT/WACC): implied CAGR =  20.42%
    cross-check on 04's PERSISTENCE (Gordon) terminal, where g is live in the denominator:
      terminal g 2.5% Gordon-on-FCFF: implied CAGR =  16.82%
      terminal g 3.0% Gordon-on-FCFF: implied CAGR =  15.80%
      terminal g 3.5% Gordon-on-FCFF: implied CAGR =  14.69%
  SWING: discount-rate +/-1pp moves the implied CAGR by 5.23pp;
         the FCF-base band moves it by 17.20pp  -> the BASE dominates by 3.3x

STEP 6  MARKET-CEILING INPUTS
  sum of the ten listed/named peers' LTM revenue = 41,255.2; + TTWO LTM 6,409.7 = 47,664.9
  implied FY2036 revenue (from STEP 1) = 52,045
    = 109% of that 11-company revenue pool
    = 3.8x the largest company in the peer set (Nintendo LTM 13,684.5)
    = 4.8x 04's consensus-derived FY2036 revenue of 10,791.7
    implied TTWO share of the pool rises from 13.4% today to 55.8% (peers held flat)

BASE RATES (period- and metric-matched)
  sec15 FCF: FY2022 99.4 / FY2023 (203.1) / FY2024 (185.2) / FY2025 (234.9) / FY2026 434.1 / LTM 62.6
    FY2022 -> LTM Sep-26 (4.5y)      = -9.76%/yr   [the metric-matched base rate]
    no multi-year CAGR computable through FY2023-FY2025: three negative years
  EBITDA FY2021 757 -> FY2026 788 PEAK-to-PEAK = +0.81%/yr over 5y   [the period-matched base rate]
  EBITDA FY2017 149 -> FY2026 788 (9y)         = +20.33%/yr          [the number that AGREES - adjudicated in §3]
  revenue FY2023 5349.9 -> FY2026 6656.4       = +7.56%/yr   (post-Zynga, organic)
  revenue FY2022 3504.8 -> FY2026 6656.4       = +17.39%/yr  (Zynga-inflated)
  consensus FY2028 -> FY2034 revenue CAGR      = +3.13%      (04 §2)
  04 modelled FCFF FY2028 1125.9 -> FY2036 1035.9 = -1.04%/yr
  implied 20.47% vs peak-to-peak 0.81%  -> gap +19.66pp
  implied flat core margin 45.78% vs peer-normal EBIT 15.9% -> 2.9x ; vs own peak 19.8% -> 2.3x
  implied FY2036 FCFF 4996 vs best-ever FCF 434.1 -> 11.5x ; vs LTM 62.6 -> 80x
```

---

## 6. What's-Priced-In Read

**At USD 216.61 (as-of 2026-11-19, pool-verified), the market is pricing free cash flow to compound at 20.5% a year for nine years — FY2028 to FY2036 — off a base that is already a launch-cycle peak, ending at 4,996 of annual free cash flow, 11.5x the most the company has ever generated in a year.** Expressed on the margin axis the same requirement is a flat **45.8% operating margin**, which is 2.9x the ten-peer median of 15.9% and 2.3x TTWO's own best year ever; expressed on the revenue axis it is **52bn of revenue by FY2036**, nearly four times the size of the largest company in Take-Two's own named peer set today.

**That is aggressive, on evidence rather than assertion.** The metric-matched base rate — the company's own §15 free cash flow — has fallen at **9.8% a year** since FY2022 with three negative years inside the series; the period-matched base rate for compounding out of a cycle peak is **peak-to-peak profit growth of 0.81% a year** (FY2021 EBITDA 757 → FY2026 788); its own forward consensus carries a long-run revenue growth rate of **3.13%**, at which **no horizon of any length** reaches the price (maximum attainable EV 20,893, half the market's 41,922.7); return on capital has been negative five years running and the moat module returns **"No moat proven"**, which is the opposite of the 40-year advantage period the price needs at the company's own organic growth rate. Every generous lever available inside this evidence base was pulled — the Street's own margins, no charge for stock-based pay, a 1pp lower discount rate, a terminal that pays for growth — and the requirement never falls below **14.2% a year**.

**Which way this cuts, and the one qualifier that must travel with it.** Implied expectations sit far above what the company's record can plausibly deliver, and that is **downside**, not upside. The honest counterweight is dated and specific: **no reported period contains a single dollar of Grand Theft Auto VI revenue** — the title released on 2026-11-19, the anchor price's own date — so this is a test of an expectation against history, not a measurement of a failure. The first number that discriminates is already scheduled: the **Q3 FY2027 print on or about 2027-02-09**, the first full quarter with GTA VI on sale, against guided GAAP revenue of 3,270–3,420 and cost of revenue of 1,649–1,732 [`TTWO 2Q27 Earnings Release, 2026-11-09`; `CIQ Estimates → Consensus` header]. A print at the top of that range still leaves roughly 14–20% annual compounding to be found for nine years; it is what would have to happen **repeatedly** for a decade, not once, that the price is asking for.

---

## 7. Self-Check

- **Price and EV match `01`** (216.61 / 41,922.7) and `01`'s price-state is **`pool-verified`** — the partial-data stop did not apply and is recorded as tested.
- **The discount rate (8.852%), normalized FCF base (FY2028 1,125.9; mid-cycle 1,036–1,049), terminal growth (3.00% with terminal ROIC = WACC), horizon (10 years, H2 FY27 stub at t = 0.25 → terminal at t = 9.50) and discounting convention (mid-year from 2026-09-30) are taken from `04_intrinsic-dcf` verbatim.** Nothing was re-derived. The rebuild reproduces `04`'s EV (13,245.3 vs 13,247.2) and per-share value (63.16 vs 63.17) before inverting, so the two reports are the same model read in two directions. No "unreconciled" flag is required.
- **The discount rate is stated explicitly with its basis** (§1), including that its risk-free rate and ERP are web-sourced and labelled unverified in `04`.
- **Every solve states what was held fixed and what was solved for** (§2 preamble, §2A table, §5 snippet headers).
- **Implied expectations are compared to the company's actual history on a metric-, level- and period-matched basis** (§3), and the one series that agrees with the implied figure — the +20.33% nine-year EBITDA CAGR — is **named and adjudicated** rather than omitted (CLAUDE.md §3, §9).
- **The achievable / stretch / no judgement is evidence-backed:** every row cites a realised series, a peer figure or an upstream module row.
- **Robustness is shown across BOTH the discount rate AND the FCF base, plus terminal `g` ±0.5pp** (required because terminal value reaches 62.6% of EV at the solved point), **with the dominant input named** — the FCF base, by 3.3x.
- **The primary solve and all robustness re-solves were produced by an executed Bash/Python solver**, with the commands and the roots shown verbatim in §5 (fix F11). Nothing was hand-computed.
- **§2A dual solve run:** implied discount rate **2.63%** (executed, root shown), ratio to `04`'s model WACC **0.297x**, reconciled against `04` §3A's own 2.63% figure. The ratio does **not** exceed ~1.5x — it is extreme in the opposite direction — so that branch does not fire; **both readings are stated anyway and Reading B (the rate is wrong) is rejected on evidence**, because it would require a cost of capital 244bps below the risk-free rate, because `04`'s WACC cleared every low-side floor, and because the model rate sits 4.11pp above the only numeric rate the company discloses. No `RF-VAL-003` tag is emitted, and emitting one would be a false cap.
- **Business-type gate honoured:** TTWO is an Operating company (single reportable segment), so the FCFF / EV model was inverted — not a DDM or residual-income model.
- **Market-ceiling check run, one-directional, and it raised the bar.** The implied FCF growth was converted to an implied revenue trajectory first (holding `04`'s 9.60% FY2036 conversion fixed). No TAM was invented: the pool contains no market-size figure, which is stated, and the peer-revenue proxy is published with its understatement limitation. The robust finding rests on the 3.8x-Nintendo comparison, which needs no TAM.
- **Scope respected:** no fair value, no scenario probability, no probability-weighted target, no risk/reward, no rating, no position size. This module measures what is priced in; `07_scenario-and-fair-value` owns the levels and the master synthesizer owns the bet.
- **Source-check status (UNCHECKED, not clean) carried forward** in the header and must travel with any restatement.
- **No banned phrases.** "Aggressive" is used only alongside the solved numbers and the base rates it is measured against; no yield is quoted anywhere (TTWO has never paid a dividend and none is expected [`FY26 10-K, Item 5`]).
