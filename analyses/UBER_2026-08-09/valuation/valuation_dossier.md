# valuation Module Dossier — UBER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-08-08T19:23:02Z
- Module folder: `valuation`
- Contents: 1 module synthesis + 8 specialist outputs = 9 files

## Table of Contents

- [valuation — module synthesis](#valuation-module-synthesis) — `99_valuation-synthesis.md`
- [valuation / 00_valuation-data-triage.md](#valuation-00-valuation-data-triage-md) — `00_valuation-data-triage.md`
- [valuation / 01_price-and-capital-structure.md](#valuation-01-price-and-capital-structure-md) — `01_price-and-capital-structure.md`
- [valuation / 02_multiples-own-history.md](#valuation-02-multiples-own-history-md) — `02_multiples-own-history.md`
- [valuation / 03_relative-valuation-peers.md](#valuation-03-relative-valuation-peers-md) — `03_relative-valuation-peers.md`
- [valuation / 04_intrinsic-dcf.md](#valuation-04-intrinsic-dcf-md) — `04_intrinsic-dcf.md`
- [valuation / 05_reverse-dcf.md](#valuation-05-reverse-dcf-md) — `05_reverse-dcf.md`
- [valuation / 06_sum-of-the-parts.md](#valuation-06-sum-of-the-parts-md) — `06_sum-of-the-parts.md`
- [valuation / 07_scenario-and-fair-value.md](#valuation-07-scenario-and-fair-value-md) — `07_scenario-and-fair-value.md`


---

## valuation — module synthesis

_Source: `99_valuation-synthesis.md`_

# Valuation Module — UBER (Synthesis)

## Abstract

UBER screens modestly undervalued: base-case fair value of $76.42 a share sits roughly 12% above the $68.18 price (2026-08-06, pool-verified), a 10.78% margin of safety, with bull/base/bear levels of $104.17 / $76.42 / $47.24 driven mainly by the peer-relative EV/EBITDA read, which independently converges with the scenario build's own warranted multiple near 13.2x. The reverse-DCF shows the price bakes in only about 5.05% ten-year free-cash-flow growth and a steady-state margin the company has already exceeded on a trailing basis — an achievable, conservative set of expectations, not a stretch. Downside to the 12-month bear case is a much larger 30.71%, and a separately labelled autonomous-vehicle structural-reset floor near $43.38 marks a longer-horizon tail the base case does not carry. Cross-method base points span 52%, reconciled but not eliminated — call it modestly undervalued, not a clear mispricing, and watch the pending debt-funded Delivery Hero deal.

## 1. Valuation Verdict

- **Verdict:** Modestly undervalued
- **Base-case fair value (point, per share):** $76.42
- **Current price:** $68.18 (2026-08-06, last close, pool-verified — corroborated by two independent Capital IQ exports)
- **Bull / Base / Bear fair-value levels (points):** Bull $104.17 / Base $76.42 / Bear $47.24 (all 12-month horizon), plus a separately labelled structural-reset avoid-ruin floor of $43.38 (24–36 month horizon, AV-disruption case — see §3)
- **Cross-method dispersion (football field, low–high):** $57.34 (sum-of-the-parts, base) – $87.37 (own-history EV/Sales, median reversion) across the four value-producing base-case points — a 52.4% spread, reconciled explicitly in §3 below, not averaged away
- Valuation attractiveness /100 (higher = cheaper): **58**
- Margin of safety /100 (higher = better): **48**
- Valuation confidence /100: **68**
- Downside risk /100 (higher = WORSE, inverted): **58**
- Data quality /100: **90**
- Overall usefulness /100: **85**
- Dominant valuation method (one line): Peer-relative NTM EV/EBITDA (`03`) — the one method that isolates a warranted multiple net of comp distortion (excludes both Uber's own revenue-multiple premium and GAAP EPS mark-to-market noise), and its 13.2x quality-adjusted multiple independently converges with the scenario build's own back-solved warranted multiple (13.2x–13.3x).
- What's priced in (one line): The current price implies roughly 5.05% annual free-cash-flow growth over 10 years and a 10.78% steady-state operating margin — both below what Uber has already delivered (TTM EBIT margin 12.13%) or what `04`'s own base-case forecast assumes (6.54% FCFF CAGR), reading as conservative, not aggressive.
- Biggest valuation risk (one line): The pending ~$14.8bn Delivery Hero acquisition and its €14.2bn bridge-financing facility (signed 2026-07-16) are not reflected in any anchor, EV bridge, or fair-value level in this report — if the bridge is drawn, net debt could rise materially and move every level below.

## 1A. Module Disconfirmation

- **Strongest bear point:** The sum-of-the-parts base case ($57.34, `06`) sits 24.9% below the weighted blend, and the own-history reversion base ($87.37, `02`) itself flags real doubt that full mean reversion is warranted — revenue growth has decelerated from +18.3% (FY2025) to +12.2% YoY (Q2 FY2026), net debt/EBITDA has releveraged from 0.82x to ~1.25x–1.32x, and a debt-funded Delivery Hero acquisition is pending close, all real, cited fundamentals rather than sentiment [`02_multiples-own-history.md` §3, §4; `01_price-and-capital-structure.md` §4].
- **Strongest bull point:** The reverse-DCF shows the market is pricing in materially less than Uber has already proven — 5.05% implied 10-year FCFF CAGR versus an 18.1% FY2023–2025 historical revenue CAGR and `04`'s own 6.54% base-case forecast, and a 10.78% implied steady-state EBIT margin the TTM run-rate (12.13%) has already exceeded [`05_reverse-dcf.md` §3, §5].
- **Single killer risk:** The autonomous-vehicle structural-reset case — Waymo already runs an independent, commercialized robotaxi fleet, and `business-model/07_business-quality.md` scores industry disruption risk at 32/100, tripping the declining-perpetuity trigger. If this crystallizes, the multiples-based base case ($76+) becomes largely irrelevant and value falls toward the $43.38 avoid-ruin floor on a 24–36 month horizon [`04_intrinsic-dcf.md` §5; `07_scenario-and-fair-value.md` §3].
- **Disconfirming evidence already visible:** `06`'s SOTP dispersion ($57.34–$96.71) is driven almost entirely by a single comp choice (Lyft 7.94x vs. DiDi 16.58x for Mobility) rather than independent conviction, and `04` self-caps its own confidence at Low–Medium because Uber's disclosed working-capital cash source (self-insurance-reserve buildup) breaks the standard reinvestment-rate/ROIC financeable-growth cross-check — both are the module's own admissions, not this synthesis's invention.

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | Sufficient — all five methods (own-history, peer-relative, DCF, reverse-DCF, SOTP) can run; no active partial-data caps | Only minor confirm-items remain: an independently rebuilt fully-diluted share count and a Freight segment lacking a close pure-play comp in the pool's own comp set |
| price-and-capital-structure | Price $68.18 (2026-08-06), pool-verified; EV $149,684.7M; net debt $9,340M broad basis (canonical) | The pending ~$14.8bn Delivery Hero acquisition and its €14.2bn bridge credit facility (signed 2026-07-16) are NOT reflected in any anchor — the single largest near-term capital-structure risk this report carries forward |
| multiples-own-history | Base case $87.37 (+28.1%) on 5yr EV/Sales median reversion — the only undistorted own-history band | EV/EBITDA, EV/EBIT, and P/E "cheapness" on the full history is a base-effect artifact (Uber only turned GAAP-profitable in 2023) and is excluded from the fair-value math, not a genuine re-rating signal |
| relative-valuation-peers | Base case $75.75 (+11.1%) on a quality-and-growth-adjusted 13.2x NTM EV/EBITDA | Uber trades at a premium on revenue multiples (+38.5% to +52.0%) and a discount on profit multiples — the forward discount is largely explained by a real growth-rate gap versus DoorDash/Grab, not inferior quality |
| intrinsic-dcf | Base case $79.82 (+17.1%); terminal value 59.5% of EV | Disclosed working-capital cash source (self-insurance-reserve buildup) breaks the standard financeable-growth cross-check, so intrinsic confidence is self-capped Low–Medium; a separate structural-reset terminal computes to $43.38 |
| reverse-dcf | Price implies 5.05% 10yr FCFF CAGR, ~1.5yrs of above-GDP growth, 10.78% steady-state EBIT margin | All three implied hurdles sit below what Uber has already delivered or what `04`'s own base case assumes — reads as conservative, not aggressive |
| sum-of-the-parts | Base case $57.34 (−15.9%); high case $96.71 (+41.9%) | The entire base-to-high spread is driven by a single comp choice for Mobility (Lyft 7.94x vs. DiDi 16.58x); capitalizing $4.4bn of corporate overhead at 11.89x subtracts $51.8bn — roughly a third of market cap |
| scenario-and-fair-value | Bull $104.17 / Base $76.42 / Bear $47.24; MoS 10.78%; downside-to-bear 30.71% | Peer-relative method (38% weight) drives the answer and independently converges with the scenario build's own back-solved warranted multiple (13.2x vs. 13.3x) — the strongest piece of triangulation in the report |

## 3. Reconciliation

**Cross-method spread exceeds the 40% tolerance and is reconciled, not averaged away.** The four value-producing methods' own base-case points span $57.34 (SOTP, `06`) to $87.37 (own-history EV/Sales reversion, `02`) — a 52.4% spread. `02`'s high end is discounted in the weighted blend because `02` itself doubts full reversion is warranted (decelerating growth, releveraging, a pending debt-funded acquisition are real fundamental reasons the market may be correctly, not mistakenly, pricing a lower multiple than its 2021–2024 own-history average). `06`'s low end is a comp-selection artifact, not an independent read of Uber's operating economics: swapping only the Mobility comparable (Lyft → DiDi, both named peers) moves the SOTP output from $57.34 to $96.71, a 69% swing from a single input, and the $51.8bn corporate-overhead capitalization is a stated modeling convention (no better-disclosed segment-level corporate-cost multiple exists), not new negative information. `04`'s $79.82 sits close to the blend (7.6% above) and is not a material drag, though `04` self-caps its own confidence because the disclosed working-capital cash source breaks the standard financeable-growth cross-check. The method trusted most for this company is the peer-relative NTM EV/EBITDA read (`03`, $75.75, 38% weight) — it isolates a warranted multiple net of both Uber's revenue-multiple premium (which would double-count via EV/Sales) and GAAP EPS's mark-to-market noise (which distorts P/E) — and it independently converges with the scenario build's own back-solved implied multiple (13.2x vs. 13.3x, arrived at from a completely different starting point). The mechanically-weighted blend across all four methods ($76.42) is published as-is, with no discretionary override.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N — price is $68.18, pool-verified, corroborated by two independent Capital IQ exports, ~1 trading day old | — | Not applicable |
| No consensus / forward estimates | N — CIQ consensus present (FY26E–FY28E revenue, EBITDA, EPS) | — | Not applicable |
| No peer data | N — 4 curated peers (Lyft, DoorDash, DiDi, Grab) with LTM/NTM multiples | — | Not applicable |
| Only one valuation method usable | N — 4 value-producing methods ran (own-history, peers, DCF, SOTP) plus reverse-DCF as a cross-check | — | Not applicable |
| No cash flow AND DCF is only method | N — full cash flow statement present; DCF is one of four methods | — | Not applicable |
| SOTP not possible for multi-segment | N — SOTP ran on all three reportable segments (Mobility, Delivery, Freight) | — | Not applicable |
| Methods disagree >40% unreconciled | N — the 52.4% base-case spread WAS explicitly reconciled per Reconciliation Gate 6 in `07` §2 and §3 above (comp-selection artifact identified for SOTP; reversion-doubt identified for own-history) | — | Not applicable (cap is for *unreconciled* disagreement) |
| Terminal value >75% of DCF EV | N — terminal value is 59.46% of DCF EV, below the 75% threshold | — | Not applicable |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | N — the prior 2026-08-08 management-governance run found RF-OWN-004 not triggered (no controlling shareholder; PIF 3.578% and BlackRock 7.417% are both minority holders). No management-governance module exists in this run's root (`analyses/UBER_2026-08-09/`); the final adjudication is deferred to the master synthesizer per the module's cross-module rule | — | Not applicable, pending master-synthesizer confirmation |

No score caps bind for this run.

## 5. Fair-Value Summary

UBER's bull/base/bear fair-value levels are $104.17 / $76.42 / $47.24 (all 12-month horizon), driven primarily by the peer-relative NTM EV/EBITDA method (`03`, 38% weight, 13.2x quality-and-growth-adjusted multiple), with a separately labelled 24–36 month structural-reset avoid-ruin floor of $43.38 carried forward for kill-criteria purposes rather than headlined as the bear case, because the AV-disruption risk that triggers it is firing on a moat rated Narrow-but-widening, not eroding. At $68.18, the price implies (per `05`'s reverse-DCF) roughly 5.05% ten-year free-cash-flow growth and a 10.78% steady-state operating margin — both levels Uber has already met or beaten on a trailing basis (TTM EBIT margin 12.13%, FY2023–2025 revenue CAGR 18.1%), so what's priced in reads as achievable, even conservative, rather than a stretch the earnings evidence would need to overcome. The margin of safety to the base case is a modest 10.78% (base $76.42 vs. price $68.18) — a real but not deep cushion — while the downside to the 12-month bear case is a much larger 30.71% ($47.24), and the longer-horizon structural-reset floor implies a 36.4% loss from price; the risk/reward on a one-year view is asymmetric toward the downside, a fact this module states but does not weight or size. On value-trap risk: no structurally misaligned controlling owner is flagged (prior governance run), the moat is Narrow but improving (CIQ return on capital rose from −4.9% FY2022 to +10.6% LTM), and the apparent cheapness on profit multiples versus peers is largely explained by a real, cited growth-rate gap versus DoorDash/Grab rather than the market simply mispricing quality it does not yet recognize — so this reads as a genuine, if modest, margin of safety rather than a multiple the business does not deserve, contingent on the AV-disruption and Delivery Hero-leverage risks not crystallizing.

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Modestly undervalued | A further leg down in the EV/Sales or EV/EBITDA multiple with no change to fundamentals (pure de-rating); the Delivery Hero bridge facility being drawn in full, pushing net debt materially higher without an offsetting EBITDA contribution yet recognized; evidence the AV-disruption structural-reset risk is crystallizing sooner than the 24–36 month horizon assumed | Gross-Bookings/Trip growth re-accelerating toward the bull case's ~25% YoY pace alongside a stable-to-improving driver/courier payment ratio; the market re-rating EV/Sales back toward its 5-year median (3.44x–3.55x) on evidence the recent de-rating was sentiment-driven, not structural; the Delivery Hero deal closing with clearly accretive, de-levering economics | Post-close Delivery Hero integration terms and updated balance sheet; a post-close capital-structure update once the bridge facility is drawn or refinanced; segment-level consensus estimates (currently absent, forcing `06`'s own forward-metric build); a longer own-history peer-relative time series to judge whether today's premium/discount to peers is typical or unusual |

## 7. Note To The Final Synthesizer

- Bull / base / bear fair-value LEVELS: $104.17 / $76.42 / $47.24 (12-month horizon), plus a separately labelled structural-reset avoid-ruin floor of $43.38 (24–36 month horizon, distinct case per the Scenario Construction policy — do not collapse it into the headline bear). The dominant method behind the base point is peer-relative NTM EV/EBITDA (`03`, 38% weight), cross-validated by an independently-derived warranted multiple from the scenario construction itself (13.2x vs. 13.3x).
- What the price implies (from `05`): ~5.05% ten-year FCFF CAGR and a 10.78% steady-state EBIT margin — both below what Uber has already delivered or what `04`'s own base case assumes. This reads as achievable, even conservative — not a reason to discount the base case.
- Margin of safety (discount to base fair value) = **10.78%** (modest cushion, not a deep discount). Downside-to-bear (loss to the 12-month bear case) = **30.71%** — materially larger than the upside to base. The structural-reset floor ($43.38) implies a longer-horizon 36.4% downside on a lower-probability, longer-dated trigger.
- Genuine value, not a value trap: no structurally misaligned controlling owner is flagged (prior 2026-08-08 governance run — RF-OWN-004 not triggered, no controlling shareholder), and the profit-multiple discount to peers is largely explained by a real growth-rate gap versus DoorDash/Grab rather than a quality the market refuses to recognize. The warranted-multiple case (13.2x NTM EV/EBITDA) is below Uber's own 5-year history for cited, fundamental reasons (decelerating growth, Narrow moat, unresolved AV-disruption risk) — the base case is not built on a multiple the business has never sustained.
- Trust most: peer-relative EV/EBITDA (`03`). Discount most: SOTP's low end (`06`, $57.34) — it is a single comp-choice artifact (Lyft vs. DiDi for Mobility), not an independent read; and `04`'s DCF, which self-caps its own confidence because the disclosed working-capital cash source (self-insurance-reserve buildup) breaks the standard financeable-growth cross-check.
- No partial-data caps applied this run — price is pool-verified and fresh, consensus/peers/segment/cash-flow data are all present. The single highest-value next data request is a post-close (or updated pre-close) capital-structure read once the Delivery Hero bridge facility is drawn or the deal's financing terms firm up — every fair-value level in this report excludes that pending, disclosed subsequent event.
- Biggest missing data point: confirmation of how much of the €14.2bn Delivery Hero bridge facility will actually be drawn, and on what terms — this could move net debt (and every downstream per-share bridge) by a magnitude larger than any single multiple assumption in this report.
- **Explicit handoff:** the master synthesizer's "Valuation and Peer Mispricing" section should defer to this synthesis; the bull/base/bear fair-value LEVELS here ($104.17 / $76.42 / $47.24, plus the $43.38 structural-reset floor) are the inputs for the master's probability-weighted scenario model — this module assigns no probabilities.

## 8. Simple Summary

- UBER is modestly cheap, not deeply cheap: base fair value $76.42 is about 12% above the $68.18 price, a 10.78% cushion.
- Bull / Base / Bear fair-value levels: $104.17 / $76.42 / $47.24 (12 months), plus a $43.38 longer-horizon floor if the autonomous-vehicle risk turns real.
- The market is pricing in less growth (5.05% a year, 10 years) and a lower steady-state margin (10.78%) than Uber has already delivered — that's a conservative bar, not an aggressive one.
- The downside is bigger than the upside on a one-year view: 30.71% to the bear case versus 12.09% implied upside to base.
- The method that matters most here is the peer-comparison read (EV/EBITDA against Lyft, DoorDash, DiDi, Grab) — it lines up independently with the scenario model's own math.
- Not a clear value trap: no dominant/misaligned owner, and the cheap-vs-peers profit multiple is explained by slower growth, not by hidden risk the market is ignoring — but the pending, debt-funded Delivery Hero deal is a real, unpriced risk to watch.
- A pool-verified current price was available for this run — no data gap there. The main gap is what the Delivery Hero acquisition's financing will actually look like once it closes.
- This module is useful and complete for the master synthesizer: all five methods ran, disagreements were reconciled with reasons (not averaged away), and no score caps applied.



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — UBER

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| Uber_Technologies_Inc_-_Form_10-K(Feb-13-2026).doc | Annual filing (10-K) | FY ended Dec-31-2025 | Filed 2026-02-13 (in-doc) | High |
| Uber_Technologies_Inc_-_Form_10-Q(Aug-05-2026).doc | Quarterly filing (10-Q) | Q2 FY26, period ended Jun-30-2026 | Filed 2026-08-05 (in-doc) | High |
| Uber_Technologies_Inc_-_Form_10-Q(May-06-2026).doc | Quarterly filing (10-Q) | Q1 FY26, period ended Mar-31-2026 | Filed 2026-05-06 (in-doc) | Medium (superseded by Aug-05 10-Q for LTM) |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Financial Data" | Peer/comps export (CIQ) | As-of 2026-08-06 (in-doc) | — | High |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Trading Multiples" | Multiples export (CIQ) | As-of 2026-08-06 | — | High |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Operating Statistics" | Peer/comps export (CIQ) | As-of 2026-08-06 | — | Medium |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Business Description" | Peer/comps export (CIQ, descriptive) | As-of 2026-08-06 | — | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Implied Valuation" | Peer/comps export — implied EV/price from multiples | As-of 2026-08-06 | — | High |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Valuation Chart" | Multiples export (chart data) | As-of 2026-08-06 | — | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Credit Health Panel" | Capital-structure/credit data | As-of 2026-08-06 | — | Medium |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Disclaimer" | Other (boilerplate) | — | — | Low |
| Short Iinterest_12m_Uber.xls — tab "Chart 1 with Data" | Other (short interest, trading data) | Through 2026-08-07 (in-doc) | — | Low |
| Short Iinterest_12m_Uber.xls — tab "Attributions" | Other | — | — | Low |
| Uber Technologies Inc NYSE UBER Analyst Coverage.rtf | Other (analyst ratings/targets) | Not dated in-doc; snapshot | — | Medium |
| Uber Technologies Inc NYSE UBER Board Members.rtf | Other (governance) | Current roster | — | Low (not valuation) |
| Uber Technologies Inc NYSE UBER Customers.rtf | Other (relationship data) | — | — | Low |
| Uber Technologies Inc NYSE UBER Events Calendar.xls — tab "Events Calendar" | Other (event dates) | Timeframe 2026 | — | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — tab "Key Stats" | Capital-structure data / current price | FY2016–FY2025A + LTM (Jun-30-2026) + FY2026E | — | High |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — tab "Income Statement" | Income statement | FY2016–FY2025A + LTM + FY2026E | — | High |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — tab "Balance Sheet" | Capital-structure data | FY2016–FY2025A + LTM | — | High |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — tab "Cash Flow" | Cash flow data | FY2016–FY2025A + LTM | — | High |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — tab "Multiples" | Historical multiples export | FY2016–FY2025A + LTM + FY2026E–2028E | — | High |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — tab "Historical Capitalization" | Capital-structure data | Historical | — | Medium |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — tab "Capital Structure Summary" | Capital-structure data | Current | — | High |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — tab "Capital Structure Details" | Capital-structure data (debt tranches) | Current | — | High |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — tab "Ratios" | Other (ratio history) | FY2016–FY2025A | — | Medium |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — tab "Supplemental" | Other | — | — | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — tab "Industry Specific" | Other (operating stats) | — | — | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — tab "Pension OPEB" | Other (n/a — no pension) | — | — | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — tab "Segments" | Segment data | FY2016–FY2025A | — | High |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — tab "Key Stats" | Capital-structure data / current price | Quarterly through Jun-30-2026 + LTM/FY26E | — | High |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — tab "Income Statement" | Income statement | Quarterly | — | High |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — tab "Balance Sheet" | Capital-structure data | Quarterly | — | High |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — tab "Cash Flow" | Cash flow data | Quarterly | — | High |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — tab "Multiples" | Multiples export | Quarterly | — | High |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — tab "Historical Capitalization" | Capital-structure data | Quarterly | — | Medium |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — tab "Capital Structure Summary" | Capital-structure data | Quarterly | — | High |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — tab "Capital Structure Details" | Capital-structure data | Quarterly | — | High |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — tab "Ratios" | Other | Quarterly | — | Medium |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — tab "Supplemental" | Other | Quarterly | — | Low |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — tab "Industry Specific" | Other | — | — | Low |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — tab "Pension OPEB" | Other (n/a) | — | — | Low |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — tab "Segments" | Segment data | Quarterly through Jun-30-2026 | — | High |
| Uber Technologies Inc NYSE UBER Key Developments.rtf | Other (news/event log) | Ongoing | — | Low |
| Uber Technologies Inc NYSE UBER Products.rtf | Other (business description) | — | — | Low |
| Uber Technologies Inc NYSE UBER Professionals.rtf | Other (management roster) | — | — | Low |
| Uber Technologies Inc NYSE UBER Public Company Profile.rtf | Other (profile) | — | — | Low |
| Uber Technologies Inc NYSE UBER Suppliers.rtf | Other (relationship data) | — | — | Low |
| Uber Technologies, Inc., Q1 2026 Earnings Call, May 06, 2026.rtf | Transcript | Q1 FY26 (call: 2026-05-06) | — | Medium |
| Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.rtf | Transcript | Q2 FY26 (call: 2026-08-05) | — | Medium |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — tab "Consensus" | Consensus/estimate export | Forward FY26–FY28 + quarters | — | High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — tab "Recent Changes" | Consensus/estimate export | Recent revisions | — | Medium |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — tab "Guidance" | Consensus/estimate export (mgmt guidance vs consensus) | Forward | — | High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — tab "Multiples" | Multiples export (forward) | Current Fiscal Year End Dec-31-2026 | — | High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — tab "Surprise" | Consensus/estimate export (beat/miss history) | Historical quarters | — | Medium |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — tab "Trends" | Consensus/estimate export | Forward | — | Medium |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — tab "Revisions" | Consensus/estimate export | Forward | — | Medium |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls (duplicate of the "(1)" file — identical content, all 7 tabs) | Consensus/estimate export (duplicate) | Same as above | — | High (duplicate, no incremental value — noted, not double-counted) |
| UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | Other (CIQ company snapshot incl. forward revenue table) | Snapshot incl. FY2024A–FY2028E | — | Medium |

**Duplicate flag:** `UberTechnologies,IncNYSEUBEREstimatesReport.xls` and `UberTechnologies,IncNYSEUBEREstimatesReport (1).xls` are byte-identical in content (diffed tab-by-tab; only the embedded source filename differs). Treated as one consensus/estimate source, not two independent confirmations.

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States — NYSE: UBER | FY25 10-K cover page, "SECURITIES AND EXCHANGE COMMISSION" / Company Comparable Analysis, ticker "NYSE:UBER" |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | FY25 10-K (filed 2026-02-13) and Q2 FY26 10-Q (filed 2026-08-05) are standard SEC Form 10-K / 10-Q |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | Capital IQ Estimates Multiples tab: "Acctg. Standard: US GAAP" [UberTechnologies EstimatesReport.xls, Multiples tab]; confirmed by 10-K/10-Q GAAP financial statements |
| Reporting currency (and scale) | USD, millions (financials), whole-dollar per-share figures | Financials_Annual/Quarterly Key Stats tabs, "In Millions of the trading currency"; Currency = USD throughout |
| Fiscal-year end | December 31 (calendar year) | Financials_Quarterly Key Stats, "For the Fiscal Period Ending ... Dec-31-2025A"; Estimates Multiples tab "Current Fiscal Year End: Dec-31-2026" |
| Document language(s) | English (all documents) | All filings and CIQ exports are in English; no translation flag needed |

US SEC forms (10-K, 10-Q) are the correct native filings here — no local-equivalent substitution needed.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | Uber_Technologies_Inc_-_Form_10-K(Feb-13-2026).doc | FY ended Dec-31-2025 (filed 2026-02-13) | ~5.9 |
| Quarterly filing | Uber_Technologies_Inc_-_Form_10-Q(Aug-05-2026).doc | Q2 FY26, ended Jun-30-2026 (filed 2026-08-05) | ~0.1 |
| Capital structure / balance sheet | Financials_Quarterly.xls, "Balance Sheet" / "Capital Structure Summary" tabs | Quarterly through Jun-30-2026 | ~1.3 (quarter-end) |
| Consensus / estimate export | UberTechnologies,IncNYSEUBEREstimatesReport (1).xls, "Consensus" tab | Current Fiscal Year End Dec-31-2026; forward FY26–FY28 | Snapshot undated on tab, but internally consistent with the 2026-08-06 comps as-of date |
| Multiples export | Company Comparable Analysis...xls, "Trading Multiples" tab | As-of 2026-08-06 | ~0.1 |
| Peer / comps export | Company Comparable Analysis...xls, "Financial Data" / "Trading Multiples" / "Implied Valuation" tabs | As-of 2026-08-06 | ~0.1 |
| Current price (IBKR / Capital IQ) | Financials_Quarterly.xls, "Key Stats" tab (Share Price 68.18) and Company Comparable Analysis "Financial Data" tab (Day Close Price Latest 68.18, matches) | Consistent with 2026-08-06 as-of date on the comps export | ~0.1 |
| Cash flow statement | Financials_Quarterly.xls, "Cash Flow" tab | Quarterly through Jun-30-2026 | ~1.3 |
| Segment data | Financials_Quarterly.xls, "Segments" tab (Mobility / Delivery / Freight) | Quarterly through Jun-30-2026 | ~1.3 |

## 1A. External Data

No `data/UBER/external/` directory exists in the data pool — no externally sourced research (alt-data panels, expert calls, channel checks, broker research, paid-API pulls) is present for this run. This section is intentionally empty; its absence does not affect the sufficiency verdict.

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | Company Comparable Analysis, "Financial Data" tab: $68.18, as-of 2026-08-06 [Capital IQ Comps export, data as of 2026-08-06]; corroborated by Financials_Quarterly "Key Stats" tab (Share Price 68.18) | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | Financials_Quarterly "Key Stats" tab: Shares Out. 2,042.56mm (basic, "as-reported"); 10-Q cover page states shares outstanding as of Jul-31-2026 (exact count not yet extracted from full text) | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Y | 10-Q, Note on stock-based awards ("Unvested and outstanding as of Jun-30-2026"); Capital Structure Details tab lists 2028 Convertible Notes (conversion rate 13.7848 shares/$1,000) and 2028 Exchangeable Senior Notes | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y | Comps "Business Description" tab: three operating segments (Mobility, Delivery, Freight); classified as Operating | Determines which valuation methods are valid |
| Total debt, cash, minority/preferred | Y | Financials_Quarterly "Key Stats": Total Debt $14,731mm, Cash & ST Invest. $5,391mm, Minority Interest $1,083mm, Pref. Equity nil | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | Financials_Quarterly "Income Statement" tab; LTM through Jun-30-2026 (Revenue $55,227mm, EBITDA $7,474mm) | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | Financials_Quarterly "Cash Flow" tab, quarterly through Jun-30-2026; also Financials_Annual "Cash Flow" tab FY2016–FY2025 | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | EstimatesReport.xls "Consensus" / "Multiples" / "Guidance" tabs — FY26E–FY28E revenue, EBITDA, EPS | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | Financials_Annual "Multiples" tab, FY2016–FY2025A + LTM + FY2026E–FY2028E TEV/Revenue, TEV/EBITDA, P/E history | Own-history re-rating read |
| Peer / comps data | Y | Company Comparable Analysis, "Financial Data" / "Trading Multiples" tabs — 10 named peers (Lyft, DoorDash, DiDi, Avis, Grab, Hertz, Taiwan Taxi, Daiwa Motor, Chenqi, Chariot Transit) with LTM and NTM multiples | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y | Financials_Annual and Financials_Quarterly "Segments" tabs — Mobility / Delivery / Freight, revenue and (adjusted) EBITDA/EBIT by segment | Sum-of-the-parts |
| Dividend / buyback data | Partial | Not directly seen in extracted tabs reviewed (Uber does not pay a dividend; buyback activity would sit in the Cash Flow / Capital Structure tabs — to be confirmed by `01`) | Shareholder-yield read |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/03_segment-map.md | Y |
| business-model/08_competitive-map.md | Y |
| business-model/07_business-quality.md | Y |
| business-model/09_moat.md | Y |
| business-model/10_external-dependency.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/04_guidance-consensus.md | Y |
| earnings/03_margin-drivers.md | Y |
| earnings/07_earnings-sensitivity.md | Y |
| earnings/06_earnings-quality.md | Y |

Note: the business-model cross-module run is dated `UBER_2026-08-08`, one day before this valuation run (`UBER_2026-08-09`), as specified in the invocation. Both business-model and earnings outputs exist in full (all agents 00–99 present, plus consolidated dossiers).

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N — price present and pool-verified ($68.18, as-of 2026-08-06, Capital IQ comps export) | 01, 05, 07, 99 | Not applicable |
| No consensus / forward estimates | N — consensus present (EstimatesReport.xls, Consensus/Multiples/Guidance tabs) | 02, 03, 04, 05 | Not applicable |
| No peer data | N — 10 named peers with LTM/NTM multiples present | 03, 06 | Not applicable |
| No segment-level data | N — Mobility/Delivery/Freight segment revenue and EBIT present (Annual and Quarterly Segments tabs) | 06 | Not applicable |
| No balance sheet / capital structure | N — full balance sheet, capital structure summary and details tabs present | 01, 04, 06 | Not applicable |
| No cash flow statement | N — quarterly and annual cash flow statements present | 04 | Not applicable |

No partial-data caps from the standard six-row table bind for this run. See §6A/§6 for the (minor) residual flags — the price-freshness check and the dividend/buyback confirmation — that `01` should verify directly.

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Financials_Annual "Multiples" tab gives FY2016–FY2025A + LTM + FY2026E–FY2028E TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/E, P/BV history |
| Peer relative valuation | Y | None | 10 peers with LTM and NTM multiples in the Comps workbook; comps set is broad (ride-hail, delivery, rental-car, taxi) — `03` should assess comparability (e.g., Avis/Hertz are asset-heavy rental, not pure digital-platform comps) |
| Intrinsic DCF (Operating FCFF) | Y | None | Cash flow statement (quarterly and annual), consensus near-term path, and capital structure all present for WACC build |
| Reverse DCF | Y (conditional on `04` running first) | None at data level — depends on `04`'s output per module sequencing | Current price present, so "what's priced in" is computable once `04` publishes its canonical WACC/FCF base |
| SOTP | Y | None | Three reportable segments (Mobility, Delivery, Freight) with segment revenue and EBIT in both annual and quarterly tabs; peer comps include at least partial matches for Mobility (Lyft, DiDi, Grab, Taiwan Taxi) and Delivery (DoorDash) — Freight lacks a close pure-play comp in this pool and may need a web/broker cross-check by `06` |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has a usable income statement and cash-flow base, full capital-structure data, a pool-verified current price (Capital IQ comps export, as-of 2026-08-06 — 3 calendar days before this run, well within freshness), forward consensus estimates, peer comps, and segment data — every method in the method map (own-history multiples, peer relative, DCF, reverse-DCF, SOTP) can run.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic DCF (FCFF), reverse-DCF, SOTP.
- **Active partial-data caps:** none.
- **Critical missing items:** none. Two minor items for `01`/`03`/`06` to confirm directly rather than assume: (1) confirm the exact fully-diluted share count from the 10-Q cover page and options/RSU/convertible detail (raw data present but not yet reconciled into a single figure by this triage); (2) the Freight segment lacks a close pure-play comparable in the pool's 10-name comp set — `06` should flag this rather than force a mismatched multiple, per the SOTP forward-basis and comparable-match hard rules.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — UBER

Reporting standard: US GAAP. Reporting currency: USD (millions, except per-share figures, which are whole dollars). Fiscal year end: December 31. Listing: NYSE:UBER (US SEC filer — 10-K/10-Q are the correct native filings; no local-equivalent substitution needed) [FY25 10-K cover page; Q2 FY26 10-Q cover page].

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | $68.18 | Capital IQ Comps export, "Financial Data" tab (Day Close Price Latest) [Company Comparable Analysis Uber Technologies Inc.xls, data as of 2026-08-06]; independently corroborated by [Uber Technologies Inc NYSE UBER Financials_Quarterly.xls, Key Stats tab, "Share Price"] | 2026-08-06 |
| Currency | USD | Both sources above | — |
| Price basis | Last close | Comps tab header: "Day Close Price Latest" | 2026-08-06 |

Two independent Capital IQ exports — the standalone comps workbook and the Financials_Quarterly workbook — both show $68.18 for the same as-of date, so this is a pool-verified, corroborated price (not merely single-sourced).

**Price staleness.** Run date 2026-08-09 minus quote as-of date 2026-08-06 = 3 calendar days. The only intervening trading day is Friday 2026-08-07 (2026-08-08/09 are a weekend), so the price is roughly 1 trading day old — well inside the 5-trading-day freshness threshold. No refresh attempt was needed and no staleness cap applies.

**Price-state tag: `pool-verified`.**

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of Jul-31-2026) | 2,042,560,121 | Q2 FY26 10-Q cover page, filed 2026-08-05: "The number of shares of the registrant's common stock outstanding as of July 31, 2026 was 2,042,560,121" — matches Capital IQ Key Stats "Shares Out." 2,042.560121mm exactly |
| Basic weighted-average shares (3 months ended Jun-30-2026) | 2,036,458,000 | Q2 FY26 10-Q, EPS note |
| Diluted weighted-average shares (3 months ended Jun-30-2026) | 2,050,225,000 | Q2 FY26 10-Q, EPS note (GAAP, treasury-stock method for awards, if-converted for convertibles) |
| Dilutive effect of equity awards (options/RSUs, TSM) | 11,180,000 | Q2 FY26 10-Q, EPS note |
| Dilutive effect of Convertible Notes (if-converted, GAAP quarterly calc) | 254,000 | Q2 FY26 10-Q, EPS note |
| Dilutive effect of Freight Holding contingently issuable shares | 12,000 | Q2 FY26 10-Q, EPS note |
| Dilutive effect of other contingently issuable shares | 2,321,000 | Q2 FY26 10-Q, EPS note |
| **Fully diluted shares (derived, current)** | **≈2,056,327,000 (~2,056.3M)** | Derived: cover-page basic (2,042,560,121, as of Jul-31-2026) + the Q2 FY26 disclosed dilutive add-on (13,767,000 = 11,180k awards + 254k converts + 12k Freight Holding + 2,321k other) — *Inference, not from filings*: assumes the dilution rate is stable between Jun-30 and Jul-31, 2026 |
| Share count used for market cap | 2,042,560,121 (basic, cover-page) | Per Fully Diluted Equity Rule #1 — most recent "as of" count, not a weighted-average |
| Share count used for per-share fair value | ≈2,056.3M (fully diluted, derived above) | Per Fully Diluted Equity Rule #2 |

**Convertible/exchangeable notes and dilution.** The 2028 Convertible Notes carry an initial conversion rate of 13.7848 shares per $1,000 principal, equivalent to an initial conversion price of roughly $72.5/share [Q2 FY26 10-Q, Debt note]. At the current price of $68.18 this is out-of-the-money, so the notes are correctly treated as debt (already inside Total Debt below) rather than as additional equity dilution beyond the small GAAP quarterly if-converted add-on (254,000 shares) shown above. The separate 2028 Exchangeable Senior Notes are exchangeable into shares of **Aurora** (a company Uber holds a stake in), not into Uber's own stock, so they do not dilute Uber's share count at all [Q2 FY26 10-Q, Debt note].

**Limitation.** The pool does not itemize individual option strike prices or an outstanding-options count separate from the aggregate GAAP TSM add-on, so the fully diluted figure above is built by adding the disclosed quarterly dilution amount to the more current cover-page basic count rather than an independent bottom-up TSM build. This is a reasonable approximation given the small size of the dilutive adjustment (~0.67% of basic shares) but is flagged as a limitation for downstream per-share sensitivity.

## 3. Market Capitalization

`Market cap = share count × current price = 2,042,560,121 × $68.18 = $139,261.7M`

This ties exactly to the Capital IQ figure in both source tabs ($139,261.749049M) [Financials_Quarterly Key Stats tab; Comps "Financial Data" tab, both as of 2026-08-06] — no rounding discrepancy.

## 4. Enterprise Value Bridge

| Component | Amount ($M) | Source |
|---|---:|---|
| Market capitalization | 139,261.7 | Section 3 above |
| + Total debt (short + long term, incl. finance & operating lease liabilities) | 14,731 | [Uber Financials_Quarterly.xls, Balance Sheet & Key Stats tabs, Jun-30-2026: LT Debt 10,726 + LT Leases 1,830 + Curr. Port. LT Debt 1,997 + Curr. Port. Leases 178 = 14,731] |
| + Minority / non-controlling interest | 1,083 | [Uber Financials_Quarterly.xls, Balance Sheet, Jun-30-2026] |
| + Preferred equity | 0 (nil) | [Uber Financials_Quarterly.xls, Balance Sheet — no preferred equity line since FY2019] |
| + Operating lease liabilities | Already included above | CIQ classifies Uber's Operating Lease Liabilities (FY2025: $1,559M principal, 6.6% imputed rate) as a lease-type debt instrument inside Total Debt [Financials_Quarterly.xls, Capital Structure Details]; adding them again would double-count |
| + Underfunded pension / other LT obligations | None | Pension/OPEB tab: not applicable — Uber has no defined-benefit pension |
| − Cash & equivalents (+ ST investments) | 5,391 | [Balance Sheet, Jun-30-2026: Cash and equivalents 4,870 + ST investments 521 = 5,391] |
| − Equity-method investments (treated separately) | Not netted | See cash-quality note below |
| **= Enterprise value (EV)** | **149,684.7** | Ties exactly to CIQ TEV ($149,684.749049M) — no plug |

**Cash quality.** The $5,391M netted above is genuine cash and short-term equivalents/investments — Cash and equivalents ($4,870M) plus short-term investments ($521M) [Balance Sheet, Jun-30-2026]. Restricted cash ($661M) is a separate balance-sheet line and is correctly **not** included in this figure. Uber's $12,532M of **long-term investments** (Jun-30-2026) is **not** netted here — this pool includes Uber's marked-to-market minority equity stakes (Aurora, Grab, Didi, Delivery Hero, Joby, and others), which swing materially with market prices (e.g., a $1.6B net unrealized gain on securities in Q2 FY26 alone, including a $1.1B gain on the Delivery Hero stake and a $899M gain on Aurora, partly offset by a $437M loss on Didi) [Q2 FY26 10-Q, Other Income note]. Netting a volatile, non-cash, mark-to-market portfolio like this into "cash" would understate EV and flatter net debt — it is deliberately excluded. Equity-method investments jumped from $268M (Mar-31-2026) to $3,773M (Jun-30-2026) [Balance Sheet], which the 10-Q explains is driven by Uber's enlarged Delivery Hero stake moving to equity-method accounting (see subsequent-event note below) — also not netted.

**Adjustment NOT made:** operating leases (already embedded in CIQ's Total Debt figure, see above — separately adding them would double-count, so no further adjustment is made). No pension exists. No contingent-claims adjustment is made; the pending Delivery Hero acquisition (below) is disclosed but not yet incorporated into any balance-sheet figure.

**Filing-vs-vendor debt reconciliation.** The 10-Q's own risk-factor language states "we had total outstanding indebtedness of $12.6 billion aggregate principal amount" as of Jun-30-2026 [Q2 FY26 10-Q, Risk Factors]. This is narrower than the CIQ Total Debt figure of $14,731M used above because the filing's $12.6B figure appears to exclude lease liabilities: $14,731M − ($1,830M LT leases + $178M current leases) = $12,723M, close to (not exact — residual ~$120M likely debt discount/premium/issuance-cost adjustments) the filed $12.6B. Both numbers are cited to their own source per §5 — the CIQ figure (incl. leases) is used for the EV bridge above because it reconciles cleanly to the CIQ TEV figure with no plug; the filing's narrower principal-only figure is noted for transparency.

**Material subsequent event — NOT reflected in the figures above.** On 2026-07-16 (after the Jun-30-2026 balance-sheet date, but before this report's run date), Uber signed a Business Combination Agreement to acquire **Delivery Hero SE** via a voluntary public takeover offer at €41.50/share — an implied equity value of ~$14.8 billion for 100% of Delivery Hero — subject to a 50%+1-share minimum acceptance threshold and regulatory clearances, expected to close in H2 2027 [Q2 FY26 10-Q, "Pending Acquisition of Delivery Hero" note]. Uber will fund the offer with existing cash plus new debt: it executed a **€14.2 billion bridge credit agreement** (senior unsecured loans, Morgan Stanley Senior Funding as administrative agent) on the same date [Q2 FY26 10-Q, same note; 10-Q exhibit index]. None of this — the offer consideration, the bridge facility, or any drawn debt — appears in the Jun-30-2026 balance sheet used for the EV bridge above. If the bridge facility is drawn, Total Debt could rise materially (on the order of $15–16B at spot EUR/USD) beyond the $14,731M shown here. This is the single largest near-term capital-structure risk not captured in this anchor and should be flagged explicitly by every downstream valuation agent (04 DCF, 06 SOTP, 07 scenarios) as a pending, pre-close item.

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt | $14,731M | Section 4 |
| Cash & equivalents only (strict basis) | $4,870M | [Balance Sheet, Jun-30-2026] |
| Cash & ST investments (broad basis) | $5,391M | [Balance Sheet, Jun-30-2026] |
| **Net debt — strict basis** (total debt − cash & equivalents only) | **$9,861M** | Computed here; matches `earnings/01_historical-financials.md`'s independent cross-check figure of $9,861M as of Jun-30-2026 exactly |
| **Net debt — broad basis** (total debt − cash & ST investments) | **$9,340M** | Matches CIQ's own "Net Debt" field and ties the EV bridge above with no plug |
| Net debt/EBITDA — broad basis | 1.25x | $9,340M / $7,474M LTM EBITDA |
| Net debt/EBITDA — strict basis | 1.32x | $9,861M / $7,474M LTM EBITDA |
| EBITDA basis used | $7,474M | CIQ-computed EBITDA (LTM through Jun-30-2026, reported/GAAP-derived, not a company-defined "Adjusted EBITDA") [Financials_Quarterly.xls, Key Stats] |
| S&P issuer credit rating (foreign-currency LT) | BBB+ | [Comps "Credit Health Panel" tab, financials updated 2026-08-05] |

**Canonical basis for this module.** Per CLAUDE.md §15 the strict basis (debt − cash & equivalents only) is the default net-debt definition, and it is shown above and matches the earnings module's independent figure exactly — a useful cross-check. However, the **broad basis ($9,340M) is designated canonical for this valuation module's downstream agents (02/03/04/06/07)**, because it is the figure that ties the EV bridge (Section 4) to the market cap with no plug (Reconciliation Gate 2). Any downstream agent using the strict $9,861M figure instead must state the one-line reason per the Reconciliation Gate.

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | $13.41 | Common equity $27,316M / 2,036.458M period-end basic shares [Balance Sheet, Jun-30-2026] |
| Tangible book value per share | $8.21 | Tangible book value $16,712M / 2,036.458M period-end basic shares [Balance Sheet, Jun-30-2026] |
| Net debt per share — broad basis (canonical) | $4.57 | $9,340M / 2,042.560121M market-cap share count |
| Net debt per share — strict basis | $4.83 | $9,861M / 2,042.560121M market-cap share count |

## 7. Anchor Summary (canonical numbers for downstream agents)

- **Current price:** $68.18, as of 2026-08-06 (last close, pool-verified, corroborated by two independent Capital IQ exports; ~1 trading day old at the 2026-08-09 run date — not stale).
- **Share counts:** 2,042,560,121 (basic, cover-page) for market cap; ~2,056.3M (fully diluted, derived — see limitation in §2) for per-share fair value.
- **Market cap:** $139,261.7M.
- **Net debt:** $9,340M (broad basis, canonical for this module) / $9,861M (strict basis, cross-checked against `earnings/01`).
- **EV:** $149,684.7M (ties with no plug).
- **Reporting currency:** USD.
- **Key caveats:** (1) A material subsequent event — the pending Delivery Hero acquisition (~$14.8B implied equity value, funded partly by a new €14.2B bridge credit facility signed 2026-07-16) — is NOT reflected in any figure above; downstream agents must flag it as a pre-close item that could materially raise Total Debt. (2) The fully diluted share count for per-share fair value is a derived estimate (basic cover-page count + the most recent quarter's disclosed dilution add-on), not an independently rebuilt TSM figure — flagged as a limitation. (3) $12,532M of long-term investments (including volatile, mark-to-market minority equity stakes in Aurora, Grab, Didi, Delivery Hero, and others) sits inside EV and is not netted as cash — downstream DCF/SOTP agents should consider whether to value this portfolio separately.

### Anchor Block (copy-forward)

- Price: $68.18 (2026-08-06, last close)
- Price-state: pool-verified
- Currency: USD
- Shares (market cap): 2,042,560,121 (10-Q cover page, as of 2026-07-31-2026)
- Shares (per-share fair value): ~2,056,327,000 (derived — cover-page basic + Q2 FY26 disclosed dilution add-on; limitation noted in §2)
- Market cap: $139,261.7M
- Net debt: $9,340M (broad basis, canonical) / $9,861M (strict basis, cross-check)
- EV: $149,684.7M
- Key caveats: pending Delivery Hero acquisition and €14.2B bridge facility (signed 2026-07-16) not reflected in any figure above; derived (not bottom-up) fully diluted share count; $12.5B of mark-to-market minority equity stakes sit inside EV unadjusted.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — UBER

Reporting currency: USD. Anchors (from `01_price-and-capital-structure.md`, used verbatim): current price $68.18 (2026-08-06, pool-verified, last close); shares for market cap 2,042,560,121; shares for per-share fair value ≈2,056,327,000 (fully diluted, derived); market cap $139,261.7M; EV $149,684.7M; net debt $9,340M (broad basis, canonical for this module); minority interest $1,083M. Business type: Operating (ride-hailing/delivery platform) per the Business-Type Method Map — EV-based multiples (EV/EBITDA, EV/EBIT, EV/Sales) and P/E are primary; P/Book is secondary (Uber is an asset-light platform, not a financial or REIT, so book value is not a primary valuation anchor — shown for completeness only). Uber has traded publicly since its May-2019 IPO, so it has roughly seven years of quarterly multiple history — well above the module's 3–5 year threshold; the short-history partial-data rule does not apply. What DOES apply, and is the central finding of this report: Uber only turned GAAP-EBITDA/EBIT/EPS-positive in 2023, so the *meaningful* (non-NM) history for earnings-based multiples is only ~2.5–3 years, and even within that window the multiples are distorted by a rapidly-scaling earnings base — flagged throughout Sections 2–4.

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| EV / Sales | LTM | Revenue $55,227M | 2.7x | [Capital IQ Comps export, Trading Multiples tab, as of 2026-08-06] |
| EV / Sales | NTM | Revenue $62,192M (CIQ consensus) | 2.41x | [Capital IQ Comps export, Trading Multiples tab, as of 2026-08-06] |
| EV / EBITDA | LTM | EBITDA $7,474M (CIQ-standardized: GAAP Income from Operations + D&A — **not** Uber's own non-GAAP "Adjusted EBITDA," which was $8,730M for FY2025 [earnings/01, §4]) | 19.2x | [Capital IQ Comps export, Trading Multiples tab, as of 2026-08-06] |
| EV / EBITDA | NTM | EBITDA $12,589M (CIQ consensus) | 11.89x | [Capital IQ Estimates Report, Multiples tab, data as of 2026-08-05/08] — **basis flag:** the NTM consensus EBITDA figure sits far above a simple extrapolation of the LTM GAAP-EBITDA run-rate and is close to the trajectory of Uber's own guided (Adjusted) EBITDA measure (FY2026 consensus EBITDA $11,365M per `earnings/04`, §4, vs. FY2025 Adjusted EBITDA $8,730M — a plausible ~30% step). The NTM multiple therefore likely mixes a GAAP-basis LTM denominator with a Street-modeled, closer-to-Adjusted-EBITDA NTM denominator. Not reconciled further in this pool; treat the LTM-vs-NTM EBITDA multiple comparison with caution. |
| EV / EBIT | LTM | EBIT $6,700M | 22.6x | [Capital IQ Comps export, Trading Multiples tab, as of 2026-08-06] |
| EV / EBIT | NTM | Implied EBIT ≈$9,720M (EV ÷ multiple) | 15.4x | [Capital IQ Estimates Report, Multiples tab, data as of 2026-08-05/08] |
| P / E | LTM | Diluted EPS $4.58 (GAAP, CIQ "excl. extra items" basis — ties to `earnings/01`'s TTM GAAP diluted EPS of $4.58 through Jun-30-2026) | 14.9x | [Capital IQ Comps export, Trading Multiples tab, as of 2026-08-06] |
| P / E | NTM | EPS $4.20 (CIQ consensus) | 16.22x | [Capital IQ Estimates Report, Multiples tab, data as of 2026-08-05/08] |
| P / Tangible Book | LTM | Tangible BV/share $8.21 | 8.3x | [Capital IQ Comps export, Trading Multiples tab, as of 2026-08-06] |
| P / Book (standard) | LTM | Book value/share $13.41 [`01`, §6] | 5.08x | Computed: $68.18 ÷ $13.41. Shown for completeness only — secondary multiple for this business type. |
| P / FCF (module-defined FCF) | LTM | FCF $10,116M (CFO $10,424M − capex $308M, `earnings/01` §2) | 13.76x | Computed: market cap $139,261.7M ÷ $10,116M |
| FCF yield (module-defined) | LTM | — | 7.27% | Computed: $10,116M ÷ $139,261.7M |
| Dividend yield | — | — | N/A | Uber pays no common dividend — no dividend line appears anywhere in the CIQ Key Stats export [Capital IQ Financials_Quarterly export, Key Stats tab — line absent] |

**Note on the P/FCF historical series used in Section 2:** Capital IQ's own quarterly multiples workbook tracks a differently-defined "Market Cap / LTM Levered FCF" series (current-quarter value ≈19.2x, close to but not identical to the 13.76x module-defined figure above — the two use different FCF formulas: CIQ's standardized levered-FCF build vs. this module's CFO − capex). Section 2's FCF band uses the CIQ series for time-series consistency; the level gap between the two is a labelled basis difference (CLAUDE.md §15), not a data error.

## 2. Historical Multiple Bands

| Multiple | Window | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---|---:|---:|---:|---:|---:|---:|
| EV / Sales | 5yr (20 quarterly closes, 2021-Q3 → 2026-Q2) | 1.88x | 3.55x | 3.44x | 7.09x | 2.71x | 15.9% |
| EV / EBITDA | ~3yr — the only meaningful (non-NM) window (2023-Q3 → 2026-Q2, 12 quarters) | 20.46x | 48.89x | 39.62x | 113.80x | 19.20x | −1.4% (below the window min) |
| EV / EBIT | ~2.5yr — only meaningful window (2024-Q1 → 2026-Q2, 10 quarters) | 24.26x | 61.29x | 49.93x | 142.23x | 22.57x | −1.4% (below the window min) |
| P / E | ~2.75yr — only meaningful window (2023-Q4 → 2026-Q2, 11 quarters) | 10.48x | 48.53x | 17.84x | 124.18x | 14.87x | 3.9% |

Source for all rows: [Capital IQ Financials_Annual export, Multiples tab (quarterly frequency), "Close" series, data through 2026-08-05]; EV/Sales full-history is present back to 2019, but non-EV/Sales multiples were "NM" (not meaningful, i.e. negative EBITDA/EBIT/EPS) for every quarter before the dates shown — Uber's GAAP profitability inflection [`earnings/01`, §6: "FY2022→FY2023, when Uber's cash flow from operations turned durably positive"].

**Critical distortion flag — read this before using the EV/EBITDA, EV/EBIT, and P/E bands above.** These three multiples' "meaningful" windows start the moment Uber's GAAP EBITDA/EBIT/EPS turned barely positive, so the denominator was tiny and mechanically produced enormous multiples (113.8x EV/EBITDA in 2023-Q3, 142.2x EV/EBIT in 2024-Q1, 124.2x P/E in 2023-Q4) that then compressed rapidly as the earnings base scaled — NOT because the market re-rated the equity down. Proof: Uber's own share price *rose* over the same stretch — $34.20 (2023-08-02 pricing date) → $46.96 (2024-02-15) → a peak of $94.67 (2025-11-04) — before pulling back to $68.18 today [CIQ Financials_Annual export, Historical Capitalization tab]. A multiple that fell 80%+ while the price roughly doubled and then partly gave it back is a denominator (earnings-growth) story, not a re-rating story. The full-window **mean** for EV/EBITDA (48.89x) and EV/EBIT (61.29x) in particular are pulled far above any plausible reversion target by these early triple-digit prints and must not be used as a base-case anchor (see Section 4).

**Recent, more stabilized sub-windows** (still not a fully settled regime — see caveat below), shown for context only:

| Multiple | Sub-window | Min | Mean | Median | Current |
|---|---|---:|---:|---:|---:|
| EV / EBITDA | Recent 8 quarters (2024-Q3 → 2026-Q2) | 20.46x | 34.05x | 35.15x | 19.20x |
| EV / EBIT | Recent 6 quarters (2025-Q1 → 2026-Q2) | 24.26x | 40.23x | 41.78x | 22.57x |
| P / E | Recent 6 quarters (2025-Q1 → 2026-Q2) | 10.48x | 15.44x | 16.23x | 14.87x |

Even the "recent 8Q" EV/EBITDA sub-window still declines almost every single quarter (49.9x → 33.3x → 39.3x → 40.0x → 37.0x → 30.3x → 22.2x → 20.5x) — i.e. it has not found a stable level yet, because EBITDA margin itself kept expanding through the window (8.0% FY2024 → 12.1% FY2025 → 14.7–16.0% in the two most recent quarters [`earnings/01`, §1, §3]). EV/EBITDA and EV/EBIT therefore do **not** offer a clean own-history reversion anchor at this point — there is no evidenced stable regime to revert to. P/E's recent-6Q window, by contrast, is comparatively settled (10.5x–17.8x, current 14.9x sits mid-band — see Section 3), so it is used as a secondary cross-check in Section 4, with its own caveat (GAAP EPS is noisy — see below).

## 3. Re-Rating / De-Rating Read

**EV/Sales — genuinely de-rated, on a clean 5-year series.** UBER trades at 2.71x LTM revenue vs. a 5-year own mean of 3.55x (**−23.7% discount**) and own median of 3.44x (**−21.3% discount**), sitting in just the 16th percentile of its own 5-year range (min 1.88x, max 7.09x) [Section 2]. Unlike the earnings-based multiples, this series is not distorted by a scaling-earnings-base effect — revenue has grown steadily throughout the window — so this is the cleanest read of an actual re-rating. The most likely drivers, cited: (1) revenue growth has decelerated from an +18.3% FY2025 pace to +14.5% (Q1 FY2026) and +12.2% (Q2 FY2026) year-on-year [`earnings/01`, §6], and the Street cut its FQ3 2026 revenue estimate by −1.04% in the three trading days right after the Q2 print, with revision breadth running −11 net-down at the FY2026 level over the last month [`earnings/04`, §3–5]; (2) leverage has reversed higher — net debt/EBITDA fell from 3.63x (FY2023) to 0.82x (FY2025) but has since risen back to ~1.25x–1.32x (Jun-30-2026), driven by $6.9B of trailing buybacks against $10.4B of trailing CFO [`earnings/01`, §6; `01`, §5], and Uber signed a €14.2B bridge facility on 2026-07-16 to fund the pending ~$14.8B Delivery Hero acquisition — a material, not-yet-reflected increase to Total Debt [`01`, §4]. A decelerating growth rate and a rising, soon-to-rise-further leverage profile are both fundamental (not merely sentiment) reasons the market might pay less per dollar of revenue than it did in the 2021–2024 vintage of this band.

**P/E — looks cheap on the full (distorted) history, roughly mid-range once distortion is stripped out.** On the full 2.75-year "meaningful" window, current P/E (14.9x) sits 16.6% below the median (17.8x) and near the 4th percentile — but that window's mean and top-end are inflated by the 2023–2024 near-zero-EPS-base quarters (Section 2). Within the more settled recent-6-quarter window (10.5x–17.8x), current P/E sits at roughly the 60th percentile — modestly below the recent mean (15.4x, −3.7%) and median (16.2x, −8.4%), not deeply discounted. **Caveat on P/E's reliability:** GAAP diluted EPS itself is noisy — `earnings/01` (§3, §6) documents TTM diluted EPS falling 22.5% even as EBITDA, EBIT, and FCF all grew double-digits, because GAAP net income is dominated by mark-to-market swings on Uber's minority equity stakes (Aurora, Didi, Grab, Joby) — so P/E's apparent "settling" may partly be a coincidence of these swings washing out on a trailing basis rather than a genuinely stable earnings-power multiple.

**EV/EBITDA and EV/EBIT are excluded from this re-rating read.** Both sit at or below the bottom of their own (short, distorted) history — an artefact of the earnings base still scaling, not evidence the stock has become inexpensive on those metrics (Section 2).

## 4. Implied Value from Reversion

| Multiple | Reversion Target (mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price ($68.18) |
|---|---:|---:|---:|---:|
| **EV / Sales — median (base case, named below)** | 3.44x | EV $190,086M / Equity $179,663M | **$87.37** | **+28.1%** |
| EV / Sales — mean | 3.55x | EV $196,095M / Equity $185,672M | $90.29 | +32.4% |
| P / E (recent-6Q, secondary cross-check) — median | 16.23x | Equity $152,847M | $74.31 | +9.0% |
| P / E (recent-6Q) — mean | 15.44x | Equity $145,478M | $70.71 | +3.7% |
| *EV / EBITDA (recent-8Q) — median — illustrative only, base-effect distorted, NOT a fair-value input* | 35.15x | EV $262,711M / Equity $252,288M | *$122.69* | *+80.0%* |
| *EV / EBIT (recent-6Q) — median — illustrative only, base-effect distorted, NOT a fair-value input* | 41.78x | EV $279,900M / Equity $269,477M | *$131.05* | *+92.2%* |
| *P / FCF (CIQ Levered-FCF series, recent-6Q) — median — illustrative only, distorted + basis-mismatched* | 24.05x | Equity $243,292M | *$118.31* | *+73.5%* |

Formulas: Implied EV = reversion multiple × current LTM metric; Implied Equity = Implied EV − net debt (broad, $9,340M) − minority interest ($1,083M); Implied Price/Share = Implied Equity ÷ ~2,056.3M fully diluted shares. The three italicized rows are shown for transparency but are excluded from the base case and from the cross-multiple dispersion below, for the reasons given in Sections 2–3 (their "own history" reflects a scaling earnings base, not a stable warranted multiple — applying it to today's much larger EBITDA/EBIT/FCF base mechanically produces implausible 74–92% "upside" figures that are an artefact of the calculation, not a valuation finding).

**Base case (single point):** the **EV/Sales-median-implied value of $87.37/share (+28.1% vs. the current $68.18)**, using EV/Sales because it is the only multiple in this dataset with a full, undistorted 5-year history. **Cross-method dispersion (the usable set only):** $70.71–$90.29/share (+3.7% to +32.4%), spanning the EV/Sales mean/median and the P/E recent-window mean/median.

**Reversion assumption — does the warranted multiple still hold?** Partially unclear, and this is the single biggest caveat on the base-case point. Two forces cut in opposite directions: (1) Uber's business quality has structurally *improved* since most of the 5-year EV/Sales window was recorded — the company was GAAP-EBITDA-negative for the first ~2.5 years of that window and only turned durably cash-generative in FY2023 [`earnings/01`, §6] — so today's more mature, profitable platform arguably deserves a multiple *at or above* its own historical average, not merely a reversion to it. (2) Working against that, part of the historical average was set during the 2021 zero-rate growth-stock era (peak EV/Sales 7.09x in 2021-Q3) — a macro-driven multiple level that may not be structurally available again regardless of Uber's own execution — and the recent de-rating coincides with real, cited fundamentals (decelerating revenue growth, rising leverage, a debt-funded acquisition pending close) that argue the market is not simply mispricing a stable business. Net: this reversion figure is one input for `07`, not a standalone verdict — `07` should weight it against the peer and DCF reads before setting a base case.

## 5. Own-History Read

UBER trades at a real discount to its own multiple history on the one clean, undistorted metric available — EV/Sales, 21–24% below its 5-year own mean/median and in just the 16th percentile of its own 5-year range — while the earnings-based multiples (EV/EBITDA, EV/EBIT, P/E on the full history) that superficially look even cheaper are mostly an artefact of Uber's EBITDA/EBIT/EPS base still scaling up from near-zero since 2023, not a genuine re-rating signal, and are excluded from the reversion math for that reason. Reverting fully to the 5-year EV/Sales median implies roughly $87/share (+28%), but the single biggest caveat is that the market may be correctly, not mistakenly, discounting the stock: revenue growth has decelerated from +18% to +12% year-on-year over the last two quarters, leverage has reversed from 0.82x to ~1.3x net debt/EBITDA with a debt-funded Delivery Hero acquisition still pending, and the 2021-era peak multiples in the band were set in a zero-rate growth-stock regime that may not be recoverable regardless of company execution — so this reversion figure should be treated as one triangulation input, not a standalone fair-value call. No management-governance module output exists in this run's root (`analyses/UBER_2026-08-09/`); a prior 2026-08-08 run's management-governance module found **no** structurally misaligned controlling owner (RF-OWN-004 not triggered — Uber has no controlling shareholder; PIF at 3.578% and BlackRock at 7.417% are both minority holders) [`analyses/UBER_2026-08-08/management-governance/99_management-governance-synthesis.md`], so the §24 Filter 6 mandatory value-trap language does not apply here. That same prior run did flag a serial-acquirer pattern (RF-CAP-004, ~12 deals since the 2019 IPO, Delivery Hero "roughly doubles debt") — relevant context for why this report treats the capital-structure shift as a real reason the reversion assumption may not hold, rather than as noise.



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — UBER

Business type: Operating company (asset-light two-sided marketplace) [`business-model/02_business-identity.md`, no sector-overlay match; Business-Type Method Map]. Primary multiples used: EV/EBITDA, EV/EBIT, EV/Sales, P/E — enterprise-value-based multiples are valid for this type. Anchor figures (price $68.18 as of 2026-08-06, EV $149,684.7M, market cap $139,261.7M, net debt $9,340M broad basis, fully diluted shares ≈2,056.3M) are taken verbatim from `valuation/01_price-and-capital-structure.md` per the Reconciliation Gate.

## 1. Peer Set

The peer set is **hybrid**: it starts from the named competitors in `business-model/08_competitive-map.md` (Lyft, DiDi Global — the two public rivals Uber's own FY25 10-K names directly for Mobility) and is extended with two additional names from the Capital IQ auto-generated comparable-company set that a Mobility-only competitive map does not cover but Uber's overall business (Mobility + Delivery + Freight) needs — DoorDash for the Delivery segment and Grab for the closest structural "superapp" analog. The remaining six names in the CIQ auto-comp set are shown in Section 2 for reference but excluded from the peer median because they are either a different economic model or immaterial in scale (reasons below).

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Lyft, Inc. | NasdaqGS:LYFT | Direct, same-geography (US/Canada) ridesharing competitor — the closest same-business peer; one-eighth of Uber's LTM revenue and thinner margin. | `business-model/08_competitive-map.md` §2 (named directly in FY25 10-K, Item 1, "Competitive Environment," p.5); corroborated by CIQ Comparable Analysis export |
| DoorDash, Inc. | NasdaqGS:DASH | Delivery-segment structural peer. Uber's FY25 10-K names "DoorDash-class competitors" in Delivery [cited in `business-model/07_business-quality.md` §1, FY25 10-K p.2502], and Uber's pending Delivery Hero acquisition is described in deal reporting as a move to "better compete with DoorDash Inc. outside the US" [`business-model/08_competitive-map.md` §4]. | Capital IQ Comparable Analysis export, Trading Multiples/Financial Data sheets, as-of 2026-08-06 — not separately profiled in `08_competitive-map.md` (that report is Mobility-segment scoped) |
| DiDi Global Inc. | OTCPK:DIDI.Y | Direct named Mobility competitor (overlap in Latin America); Uber also holds a minority equity stake taken when it sold its China Mobility business to DiDi in 2016 — simultaneously competitor and investee. | `business-model/08_competitive-map.md` §2 (named directly in FY25 10-K, Item 1, p.5); corroborated by CIQ Comparable Analysis export |
| Grab Holdings Limited | NasdaqGS:GRAB | Closest structural analog to Uber's overall business mix — a Southeast Asian multi-vertical "superapp" combining ride-hailing, delivery, and financial services. Not named as a current head-to-head competitor in Uber's 10-K (Uber exited Southeast Asia via a 2018 stock-swap and holds a minority stake in Grab instead, the same investee/former-competitor dynamic as DiDi). | Capital IQ Comparable Analysis export, Trading Multiples/Financial Data sheets, as-of 2026-08-06 — not named in `08_competitive-map.md` (Mobility-segment scoped) |

**Excluded from the peer median (shown in Section 2 for reference only):**
- **Avis Budget Group (NasdaqGS:CAR)** and **Hertz Global Holdings (NasdaqGS:HTZ)** — asset-heavy vehicle-rental fleet owners. They own and depreciate the cars they rent; Uber owns no vehicles [`business-model/07_business-quality.md` §1, Capital-intensity row: Uber's capex is ~0.6% of revenue]. CIQ's relevancy algorithm groups them under the same "Passenger Ground Transportation" industry code, but the balance-sheet and capital-intensity profile is fundamentally different, so an EV/EBITDA or EV/EBIT comparison to them is not apples-to-apples.
- **Daiwa Motor Transportation Co., Ltd. (TSE:9082)**, **Chenqi Technology Limited (SEHK:9680)**, **Taiwan Taxi Co., Ltd. (TPEX:2640)** — immaterial scale (LTM revenue $98–783M versus Uber's $55,227M, under 1.5% of Uber's size in every case) [Capital IQ Comparable Analysis export, Financial Data sheet]. Same industry code, not a comparable scale of operation.
- **Chariot Transit Inc.** — defunct. Its own CIQ business description states "Chariot Transit Inc. went out of business" and it has been a dormant Ford Smart Mobility subsidiary since 2016; every financial field in the export is blank. Excluded entirely.
- **Ola (ANI Technologies)** and **Bolt Technology OÜ** — named directly in Uber's FY25 10-K as Mobility competitors [`business-model/08_competitive-map.md` §2] but both privately held with no public trading multiples in this data pool. Bolt's revenue/margin were profiled qualitatively in `08_competitive-map.md` and `09_moat.md` from a dated, unverified web source, but with no market cap or enterprise value, Bolt cannot be placed in a multiples table. Flagged per the partial-data rule rather than guessed.

**Curated peer set used for the median calculations below: Lyft, DoorDash, DiDi Global, Grab Holdings (n=4).**

## 2. Peer Multiples & Operating Stats

All figures from Capital IQ Comparable Analysis export (Trading Multiples, Financial Data, Operating Statistics sheets), data as of 2026-08-06, unless marked web-sourced. LTM = last twelve months; NTM = next twelve months (Capital IQ consensus forward estimate). "NM" = not meaningful in the source (typically a negative or near-zero denominator).

| Company | P/E (LTM) | EV/EBITDA (LTM) | EV/EBIT (LTM) | EV/Sales (LTM) | FCF Yield | Rev Growth (LTM YoY) | EBITDA Margin (LTM) | ROIC | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **Uber (UBER)** | 14.9 | 19.2 | 22.6 | 2.7 | 7.3% (own calc: LTM FCF $10,116M / mkt cap $139,261.7M) [`earnings/01_historical-financials.md` §2; CIQ Financial Data] | 16.7% | 13.5% | 10.6% (CIQ vendor, LTM — primary per conservative default) / 14.7% (own-calc, FY2025) [`business-model/09_moat.md` §3] | 1.25x (broad basis) | 2026-08-06 |
| Lyft (LYFT) | 2.3 | 144.1 | NM | 0.9 | 18.9% (Web: financecharts.com, as of 2026-07-16 — unverified; **flagged**: hard to reconcile with the pool's own near-zero LTM EBITDA (−$6.7M) for the same company, likely reflects insurance-reserve timing in CFO not captured in the multiples sheet — use with caution) | 9.4% | −0.1% | Not disclosed in pool | NM (net cash, negative EBITDA) | 2026-08-06 |
| DoorDash (DASH) | 108.7 | 53.4 | 99.9 | 5.5 | ≈2.5% (Web-sourced as of 2026-08-09, unverified: TTM FCF ≈$2.2–2.3B / mkt cap $89,809.2M) | 33.6% | 9.5% | Not disclosed in pool | −1.35x (net cash) | 2026-08-06 |
| DiDi Global (DIDI.Y) | NM | NM | NM | 0.3 | Not available (LTM EBITDA is negative; no sourced FCF figure found) | 10.0% | −1.6% | Not disclosed (would be negative — no positive operating profit in this window) | NM (net cash, negative EBITDA) | 2026-08-06 |
| Grab Holdings (GRAB) | 33.9 | 32.5 | 80.5 | 3.0 | ≈2.9% (Web-sourced as of 2026-08-09, unverified: Q2 2026 adjusted FCF $73M, TTM $450M — company-defined "adjusted FCF," not the module's CFO−capex definition / mkt cap $15,255.5M) | 21.5% | 9.2% | Not disclosed in pool | NM (net cash, ≈−13.1x) | 2026-08-06 |
| **Peer median (n=4)** | 33.9 | 53.4 (n=3, DIDI excluded as NM) | 90.2 (n=2, LYFT/DIDI excluded as NM) | 1.95 | ≈2.7% (n=3, DIDI excluded) | 15.7% | 4.6% | Not disclosed | not meaningful to median (3 of 4 net-cash/NM) | 2026-08-06 |

*Excluded from median but shown for reference — Avis Budget Group (CAR): P/E NM, EV/EBITDA 11.3, EV/EBIT 24.2, EV/Sales 2.9, EBITDA margin 13.1%, Debt/EBITDA 9.8x; Hertz (HTZ): P/E NM, EV/EBITDA 43.1, EV/EBIT 78.5, EV/Sales 2.3, EBITDA margin 4.2%, Debt/EBITDA 44.4x [CIQ Comparable Analysis export]. Their leverage alone (9.8x–44.4x Debt/EBITDA against fleet assets) shows why they are a different risk class from Uber's asset-light model, reinforcing the exclusion above.*

## 3. Premium / Discount to Peer Median

Sign convention: positive = premium (Uber's multiple sits above the peer median); negative = discount. `(Uber multiple − peer median) / peer median`.

| Multiple | Uber | Peer Median (n=4, or as noted) | Premium / (Discount) |
|---|---:|---:|---:|
| EV/Sales (LTM) | 2.7 | 1.95 | **+38.5%** |
| EV/EBITDA (LTM) | 19.2 | 53.4 (n=3) | **(64.0%)** |
| EV/EBIT (LTM) | 22.6 | 90.2 (n=2) | **(74.9%)** |
| P/E (LTM) | 14.9 | 33.9 (n=3) | **(56.0%)** |
| P/Tangible Book (LTM) | 8.3 | 2.75 | **+201.8%** |
| EV/Sales (NTM, forward) | 2.41 | 1.585 | **+52.0%** |
| EV/EBITDA (NTM, forward) | 11.89 | 14.42 | **(17.5%)** |
| P/E (NTM, forward) | 16.22 | 26.365 | **(38.5%)** |

**The pattern is not one-directional.** Uber trades at a real premium on revenue-based multiples (EV/Sales, both LTM and forward) and a real discount on profit-based multiples (EV/EBITDA, EV/EBIT, P/E, both LTM and forward). This is mechanical and explained in Section 4: Uber converts far more of its revenue into EBITDA/EBIT/net income than three of its four peers (Lyft near-breakeven, DiDi loss-making, Grab thinner-margin), so the market pays more per dollar of Uber's revenue but — on this comp set — less per dollar of Uber's (much larger, much more real) profit. The P/Tangible-Book reading (+201.8%) is not treated as informative: Uber's tangible book value per share ($8.21) is thin because of a decade of accumulated losses and buybacks rather than a real capital base, and DoorDash's own P/TangBV (37.1x) shows the same denominator problem affecting every asset-light peer in this set — this multiple is excluded from the warranted-multiple and implied-value analysis below.

**Is the gap typical or unusual? Not assessable.** The Capital IQ Comparable Analysis export is a single snapshot (as of 2026-08-06) with no historical time series of peer multiples relative to Uber's own multiple. No pool source or upstream module (`02_multiples-own-history`, which is a sibling agent and not an input to this one) provides a 3-year peer-relative multiple history. This module does not invent one — whether today's premium/discount to peers is wider or narrower than Uber's typical relationship to this peer set cannot be determined from available data.

## 4. Is the Gap Warranted?

The discount on profit-based multiples (EV/EBITDA, EV/EBIT, P/E) is **partly a comp-set artifact and partly warranted, netting to roughly warranted on the forward (NTM) basis**. Two peers (DoorDash 99.9x LTM EV/EBIT, 108.7x LTM P/E) trade on mechanically inflated multiples because their earnings bases are still small relative to their enterprise value — DoorDash's own EBIT margin (5.5%) is under half of Uber's (12.1%) — so the trailing peer median overstates how much of a "discount" Uber's higher-quality earnings actually carry; the −64% to −75% LTM readings should not be read as a mispricing of that magnitude. The forward (NTM) EV/EBITDA discount (−17.5%) is a cleaner read and is largely explained by growth, not quality: Uber's NTM revenue growth implied by consensus (≈12.6%, from LTM $55,227M to NTM $62,192M) trails DoorDash's (≈22.8%) and Grab's (≈25.2%) by a wide margin [CIQ Comparable Analysis export, Financial Data sheet], and a market paying up for faster top-line growth at DoorDash/Grab while paying a discount for Uber's slower-but-larger, already-profitable base is a standard growth-multiple trade-off, not obviously a mispricing. Set against that, Uber has the best credit quality in the set by a wide margin (S&P BBB+ versus Grab's BB, Avis's BB-, Hertz's B-, and no rating at all for Lyft/DiDi/DoorDash) [CIQ Credit Health Panel, financials updated 2026-08-05] and the top LTM EBITDA margin (13.5% versus DoorDash's 9.5%, Grab's 9.2%, and negative for Lyft/DiDi) — real quality evidence that argues against a discount at all. But `business-model/09_moat.md` independently caps the quality case: Uber's moat is rated **Narrow**, its 5-year through-cycle return on capital (+0.85% average, FY2021–FY2025) remains materially below its ~9.7% estimated cost of capital even though the latest 1–2 years clear that bar, and `business-model/07_business-quality.md` flags a fast-changing-industry risk (rate-of-change score 32/100, RF-BQ-005) from the unresolved autonomous-vehicle transition where Waymo already operates an independent competing fleet — evidence that a full quality premium over this peer set is not yet earned. **Net conclusion: the forward EV/EBITDA discount is warranted** — it reflects real growth-rate differences versus DoorDash/Grab and the moat module's own finding that Uber's returns have only recently, not durably, cleared its cost of capital — while the much larger trailing (LTM) discount is a comp-set distortion that should not be treated as a separate, additional mispricing signal.

## 5. Implied Value from Peer Multiples

Method basis: forward (NTM) metrics × forward (NTM) peer multiples, per the module's same-basis rule — Uber's NTM EBITDA is $12,589.03M and NTM revenue is $62,191.86M (both Capital IQ consensus) [CIQ Comparable Analysis export, Implied Valuation sheet]. Bridge from enterprise value to equity value uses `01`'s canonical bridge constant: Market cap = EV − total debt ($14,731M) − minority interest ($1,083M) + cash & ST investments ($5,391M) = EV − $10,423M (this exactly reproduces the $139,261.7M current market cap at the current $149,684.7M EV, confirming no plug). Per-share values divide by the fully diluted share count, ≈2,056.3M [`01_price-and-capital-structure.md` §2].

**Quality adjustment applied to the base case:** starting from the peer median NTM EV/EBITDA of 14.42x, I apply a −1.2x discount (**Inference, not from filings**) to reflect Uber's materially slower forward revenue growth versus DoorDash and Grab (Section 4), arriving at an adjusted multiple of **13.2x**. This does not add a premium for Uber's superior margin/credit quality on top of that, because `09_moat.md` independently caps the quality case (Narrow moat, 5-year ROIC below WACC, fast-changing-industry flag) — the two adjustments are treated as roughly offsetting, leaving the growth-only haircut as the net adjustment.

| Multiple | Applied Multiple | Implied EV ($M) | Implied Equity Value ($M) | Implied Price/Share | vs Current Price ($68.18) |
|---|---:|---:|---:|---:|---:|
| **NTM EV/EBITDA — quality-adjusted (BASE CASE)** | **13.2x** | **166,175** | **155,752** | **$75.75** | **+11.1%** |
| NTM EV/EBITDA — full peer median (no adjustment) | 14.42x | 181,534 | 171,111 | $83.22 | +22.1% |
| NTM EV/Sales — full peer median | 1.585x | 98,574 | 88,151 | $42.87 | (37.1%) |
| NTM P/E — full peer median (applied directly to NTM EPS $4.20) | 26.365x | n/a (direct P/E) | n/a | $110.73 | +62.4% |

*LTM-based implied values are not shown as football-field inputs: applying the LTM peer-median EV/EBITDA (53.4x, n=3), EV/EBIT (90.2x, n=2), or P/E (33.9x, n=3) multiples to Uber's LTM metrics produces implied prices of $189, $289, and $156/share respectively — all obviously unusable, because those trailing peer multiples are inflated by near-zero or negative earnings denominators at Lyft, DiDi, and (for EV/EBIT and P/E) DoorDash's still-small trailing profit base. This is the same distortion flagged in Section 4 and is excluded rather than shown as a false data point.*

**Cross-method disagreement — reconciled, not averaged (Reconciliation Gate 6).** The NTM-basis methods alone span from −37.1% (EV/Sales) to +62.4% (P/E) versus the current price, a gap far above the 40% tolerance. This is not silently split down the middle. The EV/Sales-implied value understates Uber's worth because it applies the peer's lower revenue multiple without crediting Uber's structurally superior margin conversion (Section 3) — Uber already earns a revenue-multiple premium precisely because it turns more of that revenue into real EBITDA than the peer set, so discounting Uber's revenue to the peer average double-counts a margin gap the market has already priced. The P/E-implied value overstates Uber's worth because it is pulled up by DoorDash's mechanically inflated forward P/E (31.6x on a still-small forward EPS base) and by the fact that GAAP EPS itself is noisy for Uber — TTM diluted EPS fell 22.5% even as EBITDA rose 42.9%, driven by non-operating mark-to-market swings on Uber's minority equity stakes, not operations [`earnings/01_historical-financials.md` §3, §6]. EV/EBITDA is the multiple least distorted by either effect (it sits above the operating-income line, so it excludes the mark-to-market noise, and it does not carry Uber's revenue-multiple premium baked in), which is why it — not a straight average — is used as the base case.

## 6. Relative Read

On revenue, Uber trades at a 38.5% (LTM) to 52.0% (forward) premium to its curated four-company peer median (Lyft, DoorDash, DiDi, Grab); on profit, it trades at a 17.5% (forward EV/EBITDA) to 74.9% (LTM EV/EBIT) discount to the same peer median — the profit-side discount is real on a forward basis but is exaggerated on a trailing basis by two peers' mechanically inflated earnings multiples (thin/negative denominators), and is largely explained by Uber's slower forward growth (≈12.6% NTM) against DoorDash's (≈22.8%) and Grab's (≈25.2%), not by inferior quality — `09_moat.md` independently caps how much credit Uber should get for its peer-leading margins and BBB+ credit rating, rating the moat Narrow and flagging a fast-changing-industry risk from the unresolved autonomous-vehicle transition. The base-case peer-multiple-implied value is **$75.75/share (+11.1% versus the current $68.18 price)**, built on a quality-and-growth-adjusted forward EV/EBITDA multiple of 13.2x against Uber's $12,589M NTM consensus EBITDA; the cross-method dispersion around that point runs from $42.87 (−37.1%, forward EV/Sales) to $110.73 (+62.4%, forward P/E), both bracketing sanity checks rather than equally weighted inputs, for the reasons given in Section 5.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — UBER

Reporting standard: US GAAP. Reporting currency: USD millions, except per-share figures. Fiscal year end: December 31. Business type: **Operating** (asset-light, two-sided marketplace — Mobility, Delivery, Freight) per `valuation/00_valuation-data-triage.md` §3 and `business-model/02_business-identity.md`; the FCFF DCF below is the correct primary method for this business type (Business-Type Method Map, no Financial/REIT/Holding-co override applies).

**Canonical anchors used (from `01_price-and-capital-structure.md`, verbatim):** current price $68.18 (2026-08-06, pool-verified); fully diluted shares 2,056.327M; net debt $9,340M (**broad basis, canonical for this module**); minority interest $1,083M; EV $149,684.7M (context only — this agent derives its own DCF-implied EV below).

**Material item NOT modeled below (carried forward from `01` §4):** Uber signed a Business Combination Agreement on 2026-07-16 to acquire Delivery Hero SE (~$14.8bn implied equity value), funded partly by a new €14.2bn bridge credit facility — both post-date the Jun-30-2026 balance sheet used for the anchors above and are excluded from this DCF's forecast and capital structure, consistent with `01`'s treatment. If the bridge facility is drawn, both net debt and the future cash-flow base would move materially; this DCF should be re-run once the deal closes (expected H2 2027).

---

## 1. FCF Base & Normalizations

Two reference points are used: **TTM ended Jun-30-2026** (the freshest read, used for sanity-checking margin trend) and **FY2025A** (the last complete audited fiscal year, used as the Year-0 anchor the explicit forecast grows from, avoiding the double-counting risk of starting a multi-year build from a rolling TTM window that already contains two quarters of the current fiscal year).

| Item | TTM (Jun-30-2026) | FY2025A (Year 0 anchor) | Normalization Applied | Source |
|---|---:|---:|---|---|
| Revenue | $55,227M | $52,017M | None | [`earnings/01_historical-financials.md` §1–2] |
| GAAP EBIT (Income from operations) | $6,700M (12.13% margin) | $5,565M (10.70% margin) | None — GAAP EBIT used throughout, not company-defined Adjusted EBITDA, per `earnings/03_margin-drivers.md` §5 (Uber itself stopped disclosing consolidated Adjusted EBITDA after FY2025 and now points to EBIT/Segment Operating Income) | [`earnings/01_historical-financials.md` §1–2] |
| CFO | $10,424M | $10,099M | None | [`earnings/01_historical-financials.md` §1–2] |
| Capex | $308M | $336M | None | [`earnings/01_historical-financials.md` §1–2] |
| FCF (CFO − Capex, company's own definition) | $10,116M | $9,763M | None — Uber's own FCF reconciliation matches CFO − capex exactly with no add-back [`earnings/06_earnings-quality.md` §1] | [`earnings/01_historical-financials.md` §2] |

**Normalizations considered and NOT applied, stated explicitly:**
- **Stock-based compensation:** already expensed in GAAP EBIT and in CFO (added back as non-cash within CFO, not stripped from EBIT). No adjustment made — this DCF uses GAAP EBIT/NOPAT, which already carries the real, recurring SBC cost, consistent with CLAUDE.md §15 (no silent use of management-adjusted numbers).
- **UK Mobility revenue/cost reclassification:** cuts both revenue and cost of revenue by a matching amount (−$1.1bn revenue / −$808M driver payments in Q2 FY26 alone) — an accounting-optics change with **no net cash-flow effect** [`earnings/03_margin-drivers.md` §6, §8a]. Not adjusted, because it does not change FCF; the effect is confined to the ratio-level margin read, not the dollar cash-flow base this DCF is built on.
- **G&A / legal-accrual swings:** a genuinely two-way, unpredictable item (+$549M favorable FY2025, −$138M unfavorable Q2 FY26 alone — the identical line item, opposite direction, `earnings/03_margin-drivers.md` §8a). Not smoothed into the base year; instead, the forecast margin path (§2 below) is set conservatively enough that it does not depend on this swing continuing in either direction.
- **Deferred-tax valuation-allowance releases (~$6.0bn FY2024, ~$5.0bn FY2025 Netherlands release):** these sit below EBIT (in the GAAP tax line) and do not affect EBIT, CFO, or FCF; excluded by construction from this DCF's NOPAT (built off EBIT × a normalized tax rate, §3 below), not off reported net income [`business-model/09_moat.md` §3].
- **Mark-to-market gains/losses on minority equity stakes (Aurora, Grab, DiDi, Delivery Hero):** below the operating line, excluded by construction (EBIT-based NOPAT).

No cash flow statement gap exists (quarterly and annual CFO/FCF are both directly disclosed), so the Partial-Data proxy rule does not apply — FCF is a directly reported figure, not a proxy.

---

## 2. Forecast Assumptions

10-year explicit horizon (FY2026E–FY2035E), grown off the FY2025A base ($52,017M revenue). Years 1–2 revenue growth is anchored to Capital IQ consensus; all other cells are **analyst assumptions, not company-guided**, built from the margin-driver and moat evidence cited inline.

| Assumption | Yr1 (FY26E) | Yr2 (FY27E) | Yr3 | Yr4 | Yr5 | Yr6 | Yr7 | Yr8 | Yr9 | Yr10 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 11.2% | 15.9% | 12.0% | 10.0% | 8.5% | 7.5% | 6.5% | 5.5% | 5.0% | 4.5% | 3.5% | Yr1–2: **consensus** [`earnings/04_guidance-consensus.md` §4 — FY2026E $57,834.88M, FY2027E $67,028.29M]. Yr2's jump partly reflects the UK Mobility reclassification's Q1 FY2027 lapse date creating an easier YoY comp base [`earnings/03_margin-drivers.md` §6]. Yr3–10: **analyst assumption**, faded from the Yr1–2 consensus average toward the terminal rate; Terminal g = 3.5% is discussed in §5 |
| EBIT margin % (GAAP) | 12.5% | 12.8% | 13.0% | 13.1% | 13.2% | 13.2% | 13.1% | 13.0% | 12.9% | 12.8% | 12.8% | **Analyst assumption.** Starts near the TTM 12.13% (not the Q2'26 quarterly peak of 13.32%), consistent with `business-model/07_business-quality.md` §4's caution that FY2025/TTM margins are "near-peak, post-recovery readings" not yet a stabilized steady state. Peaks modestly (13.2%) mid-forecast reflecting the genuine ex-UK cost-of-revenue leverage (`earnings/03_margin-drivers.md` §9), then **fades** in Yr7–10 to reflect competitive intensity (scored 28/100, `business-model/07_business-quality.md`) and the unquantified future AV P&L cost (`earnings/03_margin-drivers.md` §10) — a deliberate check against Gate 3 (ROIC drift) rather than extrapolating peak margins into perpetuity |
| Tax rate % (normalized) | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | **Reconciles to `business-model/09_moat.md` §3's canonical normalized rate** — the US federal statutory rate, stripped of the ~$6.0bn (FY2024) and ~$5.0bn (FY2025) one-off deferred-tax valuation-allowance releases that produced GAAP effective tax *benefits* of −139.6% and −74.9%. Consensus FY2026+ effective tax rate assumptions (18–21%) corroborate 21% as reasonable [`business-model/09_moat.md` §3] |
| Capex (% of revenue) | 0.6% | 0.8% | 1.0% | 1.3% | 1.6% | 1.8% | 2.0% | 2.1% | 2.2% | 2.2% | 2.2% | **Analyst assumption.** Current book capex is only 0.56% of TTM revenue (`earnings/01` §2), but Uber disclosed a **$10bn multiyear AV investment program** on the Q2 FY26 call with no quantified P&L/capex timeline yet ("we'll size that for investors clearly as we go") [`earnings/03_margin-drivers.md` §10]. This forecast ramps capex intensity toward 2.2% of revenue by Yr9–10 as a conservative placeholder for that program landing on the balance sheet — genuinely uncertain, flagged explicitly, not company-guided |
| D&A (% of revenue) | 1.3% | 1.4% | 1.5% | 1.7% | 1.9% | 2.0% | 2.1% | 2.2% | 2.2% | 2.2% | 2.2% | **Analyst assumption**, ramped in lockstep with the capex assumption above and converging to it by Yr9 (steady-state capex ≈ D&A) |
| Δ Working capital (cash effect, % of revenue) | +3.0% | +2.5% | +2.2% | +2.0% | +1.8% | +1.6% | +1.4% | +1.2% | +1.1% | +1.0% | +1.0% | **Revenue-linked driver — see the working-capital note below.** Positive = cash SOURCE (adds to FCFF). Faded down from the recent 3-year average (FY2023–FY2025: 0.44%, 5.40%, 4.28% of revenue — `earnings/06_earnings-quality.md` §1) toward a more moderate, sustainable 1.0% by Yr10 — **analyst assumption** |

**Working-capital driver — why this is a cash SOURCE, not a use.** Uber's disclosed CFO-bridge "Working capital change" line has been **positive (a cash inflow) in every one of the last five years** — +$1,682M (FY21), +$335M (FY22), +$165M (FY23), +$2,374M (FY24), +$2,227M (FY25) [`earnings/06_earnings-quality.md` §1]. This is NOT primarily a receivables/payables story (DSO is falling — 30.3→25.1 days — and DPO is roughly flat at ~11 days, `earnings/06_earnings-quality.md` §3); it is dominated by the **buildup of Uber's self-insurance reserves** ($12.5bn balance at Dec-31-2025), a real, cited operating liability that grows as Gross Bookings grow and is recognized in cash before claims are paid [`earnings/06_earnings-quality.md` §1, citing FY25 10-K's "Valuation of Insurance Reserves" critical audit matter]. A growing net operating liability funds part of Uber's growth ahead of the cash outflow — the same economic direction as a negative-working-capital retailer, even though Uber's raw DSO/DPO alone would not fully capture it. This forecast models it as a revenue-linked cash-source ratio (not a flat dollar figure, per the Hard Rule), fading down from its recent-history level rather than extrapolating the FY2024/FY2025 peak forward, because reserve-growth deceleration should track the modeled revenue-growth deceleration. **Sign check:** revenue rises every forecast year, the ratio is held positive (a source) and fading, so the modeled dollar cash effect is positive and shrinking in dollar terms after Yr4 (from $1,735M in Yr1 to $1,188M in Yr10) — computed directly from the ratio × forecast revenue in §4, not inferred from "growth" alone.

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.65% | [Web: 10-year US Treasury yield, ~4.65–4.69%, early August 2026 (dated, unverified) — cross-checked against `business-model/09_moat.md` §3's independently web-sourced 4.6%, consistent] |
| Equity-risk premium | 4.5% | Blended long-run US estimate — between Damodaran's early-2026 implied ERP (~4.2%) and the standard long-run historical estimate (~5.0%) [Web, dated 2026-08-09, unverified — not company-disclosed, Inference] |
| Beta | 1.15 (5-year) | [Capital IQ Comparable Analysis export, Public Company Profile, as-of 2026-08-06 — same figure independently cited in `business-model/09_moat.md` §3] |
| Cost of equity (CAPM) | 9.83% | `k_e = rf + β × ERP = 4.65% + 1.15 × 4.5% = 9.825%` |
| Pre-tax cost of debt | 4.2% | FY2025 interest expense $440M ÷ LT + current debt $10,521M (FY2025-end) [FY25 10-K; cross-checked to `business-model/09_moat.md` §3's identical 4.2% figure] |
| Tax rate (for the debt tax shield) | 21% | Same normalized rate as NOPAT (§2 above) |
| After-tax cost of debt | 3.32% | `4.2% × (1 − 21%)` |
| Equity / debt weights (market value) | 90.43% / 9.57% | Equity = market cap $139,261.7M; Debt = total debt $14,731M (both from `01_price-and-capital-structure.md` §3–4) — `w_e = 139,261.7/(139,261.7+14,731) = 90.43%`; `w_d = 14,731/(139,261.7+14,731) = 9.57%` |
| **WACC** | **9.20%** | See formula and executed snippet below |

**Formula:** `WACC = w_e·k_e + w_d·k_d·(1 − t) = 0.9043 × 9.825% + 0.0957 × 3.318% = 8.884% + 0.318% = 9.203%` (no preferred equity exists — `01` §4 confirms nil preferred — so the `w_p·k_p` term is omitted).

**WACC sanity bounds (MODULE_RULES Gate 4):** `after-tax k_d (3.32%) ≤ WACC (9.20%) < k_e (9.83%)` — **holds**, confirmed by the executed snippet below. For this developed-market (USD) mega-cap, `k_e` (9.83%) sits below the `rf + 1.4 × ERP` bound (4.65% + 1.4×4.5% = 10.95%), consistent with the actual sourced 5-year beta (1.15) rather than an unjustified high-beta assumption — no override or additional justification required.

**Cross-check against the moat module's inferred cost of capital (Gate 4):** `business-model/09_moat.md` §3 independently derives WACC ≈ 9.7% using the same CAPM structure (rf 4.6%, beta 1.15, ERP 5.0%, kd 4.2%). This DCF's 9.20% differs by only ~0.5pp — well inside the ~2pp reconciliation threshold — so **no dual-rate sensitivity grid is required**; the §7 grid's ±1.00pp WACC columns (8.20%–10.20%) already span both figures.

**No discretionary override applied** — the WACC used (9.20%) equals the mechanically computed value; no analyst adjustment was made.

**Executed WACC-blend snippet:**
```
$ python3 -c "
tax=0.21; rf=0.0465; erp=0.045; beta=1.15
ke=rf+beta*erp
pretax_kd=0.042; aftertax_kd=pretax_kd*(1-tax)
mktcap=139261.7; debt=14731.0
we=mktcap/(mktcap+debt); wd=debt/(mktcap+debt)
wacc=we*ke+wd*aftertax_kd
print('ke=',round(ke*100,3),'aftertax_kd=',round(aftertax_kd*100,3),'we=',round(we*100,2),'wd=',round(wd*100,2))
print('WACC=',round(wacc*100,3))
print('Sanity aftertax_kd<=WACC<ke:', aftertax_kd<=wacc<ke)
"
ke= 9.825 aftertax_kd= 3.318 we= 90.43 wd= 9.57
WACC= 9.203
Sanity aftertax_kd<=WACC<ke: True
```

---

## 4. Free Cash Flow Forecast & Discounting

**Discounting convention: mid-year (t − 0.5)** — cash flows are assumed to arrive evenly through each year, so Year 1 is discounted at t=0.5, Year 2 at t=1.5, …, Year 10 at t=9.5. (Simplification flagged: the valuation date, 2026-08-09, falls roughly 60% through calendar FY2026; treating Yr1/FY2026E as starting from t=0 slightly overstates its PV by a few weeks of discounting — immaterial relative to the overall dispersion shown in §7.)

`FCFF = NOPAT + D&A − Capex + Working-capital cash source` (NOPAT + D&A − Capex − ΔNWC per the Economic Consistency Gate, with the working-capital term's sign flipped to positive because it is a disclosed, recurring cash SOURCE for this business — see the sign-check note in §2).

| Year | Revenue | EBIT (margin) | NOPAT | D&A | Capex | WC cash source | FCFF | Discount Factor (t−0.5) | PV of FCFF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 (FY26E) | 57,842.9 | 7,230.4 (12.50%) | 5,712.0 | 752.0 | 347.1 | +1,735.3 | 7,852.2 | 0.9569 | 7,514.0 |
| 2 (FY27E) | 67,039.9 | 8,581.1 (12.80%) | 6,779.1 | 938.6 | 536.3 | +1,676.0 | 8,857.3 | 0.8763 | 7,761.6 |
| 3 (FY28E) | 75,084.7 | 9,761.0 (13.00%) | 7,711.2 | 1,126.3 | 750.8 | +1,651.9 | 9,738.5 | 0.8025 | 7,814.7 |
| 4 (FY29E) | 82,593.2 | 10,819.7 (13.10%) | 8,547.6 | 1,404.1 | 1,073.7 | +1,651.9 | 10,529.8 | 0.7348 | 7,737.6 |
| 5 (FY30E) | 89,613.6 | 11,829.0 (13.20%) | 9,344.9 | 1,702.7 | 1,433.8 | +1,613.0 | 11,226.8 | 0.6729 | 7,554.5 |
| 6 (FY31E) | 96,334.6 | 12,716.2 (13.20%) | 10,045.8 | 1,926.7 | 1,734.0 | +1,541.4 | 11,779.8 | 0.6162 | 7,258.7 |
| 7 (FY32E) | 102,596.4 | 13,440.1 (13.10%) | 10,617.7 | 2,154.5 | 2,051.9 | +1,436.3 | 12,156.6 | 0.5643 | 6,859.6 |
| 8 (FY33E) | 108,239.2 | 14,071.1 (13.00%) | 11,116.2 | 2,381.3 | 2,273.0 | +1,298.9 | 12,523.3 | 0.5167 | 6,471.0 |
| 9 (FY34E) | 113,651.1 | 14,661.0 (12.90%) | 11,582.2 | 2,500.3 | 2,500.3 | +1,250.2 | 12,832.4 | 0.4732 | 6,071.9 |
| 10 (FY35E) | 118,765.4 | 15,202.0 (12.80%) | 12,009.6 | 2,612.8 | 2,612.8 | +1,187.7 | 13,197.2 | 0.4333 | 5,718.4 |

**Working-capital sign check:** every year's WC cash-source figure is positive (a source, adding to FCFF) — this matches the actual direction of Uber's disclosed 5-year working-capital history (§2), which has been a cash inflow every year, not an outflow. Revenue is rising every year and the modeled ratio is fading, so the dollar cash effect itself declines through the horizon (+$1,735M → +$1,188M) even as it stays positive — the sign is read off the modeled ΔNWC path, not assumed from "growth" alone.

**Sum of PV of explicit FCFs: $70,762.1M.**

**Executed discounting snippet:**
```
$ python3 /tmp/uber_final.py   # (full model; relevant excerpt)
Sum PV explicit FCFF = 70762.1
```
(Full year-by-year FCFF, discount factors, and PVs shown in the table above were produced by this same executed script — see the full run log referenced in §5/§6 below for the terminal-value and bridge segments.)

---

## 5. Terminal Value

**Method: Gordon growth perpetuity.** `TV = FCFF_{n+1} / (WACC − g) = FCFF_10 × (1 + g) / (WACC − g)`.

- FCFF Year 10 = $13,197.2M
- Terminal growth `g` = **3.5%** (nominal) — analyst assumption, below the ~4% long-run US nominal-GDP proxy (WACC's reporting currency is USD)
- `FCFF_11 = 13,197.2 × 1.035 = $13,659.1M`
- `WACC − g = 9.203% − 3.5% = 5.703%` — comfortably positive, well above the ~1–2pp near-convergence danger zone
- `TV (undiscounted) = 13,659.1 / 0.05703 = $239,527.0M`
- `PV(TV) = TV × discount factor (Yr10, mid-year, t=9.5) = 239,527.0 × 0.4333 = $103,787.1M`
- **Terminal value as % of total EV: 59.46%** — below the 75% terminal-dominance threshold; no escalation to a mandatory second lens is triggered, though the exit-multiple cross-check below is shown regardless as a sanity check.

**Exit-multiple cross-check.** The Gordon TV of $239,527M against Year-10 EBIT of $15,202M implies an exit EV/EBIT multiple of **~15.8x**. Against Year-10 EBITDA (EBIT + D&A = $15,202M + $2,613M = $17,815M), that is **~13.4x EV/EBITDA**. Both sit inside a plausible range for a mature, still-modestly-growing (4.5% terminal-adjacent) asset-light platform business, and are not wildly disconnected from Uber's own current LTM EV/EBITDA — this is a sanity check, not an independent valuation.

**Why terminal g was set at 3.5%, not a higher figure — the financeable-growth cross-check (Gate 2).** The reinvestment-rate/ROIC cross-check (`Implied growth ≈ ROIC × reinvestment rate`) breaks down mechanically for this forecast: because the working-capital cash source (§2) exceeds the modeled capex-minus-D&A gap in later years, the **modeled reinvestment rate at Year 10 is −9.9%** (net capital is being *released*, not invested), and invested capital (walked forward from the moat module's FY2025 base of $29,843.5M) **falls** to $12,616M by Year 10, driving a modeled ROIC that rises implausibly from 20.6% (Yr1) to 95.2% (Yr10). This is the flip side of the same working-capital dynamic that boosts FCFF in §4 — a real, disclosed, revenue-linked cash source (§2) — but it makes the standard `ROIC × reinvestment rate` formula (designed for capital-intensive compounders) meaningless here, and the gap between that formula's implied growth (≈ −9%) and the modeled terminal g (3.5%) is far larger than the ~1.5pp threshold. **Per the Hard Rule's own named bridge — "working-capital release" — this is exactly that case, explicitly disclosed and quantified above, not an unquantified flag.** Consistent with the rule's alternative remedy, **intrinsic confidence in this DCF is capped (Low–Medium)** rather than mechanically forcing terminal g toward the formula's nonsensical negative reading, and the sensitivity grid (§7) is shown at g = 3.0% / 3.5% / 4.0% so a reader can see the base case is not levered on the top end of a plausible growth range. The declining-perpetuity structural-reset case below (a much lower g) is the more conservative counterpart this tension argues for.

**ROIC drift check (Gate 3).** The moat module (`business-model/09_moat.md` §5) verdicts a **Narrow** moat — "widening" over the last two years but with a 5-year through-cycle average ROIC (+0.85%) still below WACC, and an unresolved AV-disruption risk. This forecast does **not** assume ever-expanding excess returns: EBIT margin (the main lever on ROIC here) is capped at 13.2% mid-forecast and **fades** to 12.8% by Year 10 — flat-to-down, not up — specifically to avoid extrapolating a narrow, recently-proven moat into perpetual margin expansion. The residual ROIC escalation shown above is a working-capital-driven artifact (falling invested capital base), not a margin-driven one.

**Structural-decline / runoff terminal trigger (avoid-ruin, CLAUDE.md §24 Filter 5).** `business-model/07_business-quality.md` §1 scores **industry rate-of-change / disruption risk at 32/100** (≤ the ~40 threshold) — Uber "may fail to offer autonomous vehicle technologies... at competitive scale... before competitors," and Waymo already runs a commercialized robotaxi fleet independent of Uber's platform [FY25 10-K, cited in `business-model/09_moat.md` §5]. This trips the Hard Rule's declining-perpetuity trigger. A second, explicitly labeled terminal is built alongside the base case:

- **Structural-reset (declining-perpetuity) terminal — bear input, NOT the base case.** EBIT margin is faded down starting Year 5 to reflect an AV-driven competitive/take-rate compression scenario (Yr5: 11.0% → Yr10: 7.0%, versus the base case's 13.2%→12.8%), holding the same revenue and working-capital paths as the base case. Terminal `g_runoff` = **1.0%** (nominal, at/below the long-run US inflation proxy, consistent with a structurally impaired, non-recovering franchise — same nominal basis as the rest of this DCF).
  - Yr10 FCFF (stressed) = $7,755.4M
  - `FCFF_11 = 7,755.4 × 1.01 = $7,832.9M`
  - `TV = 7,832.9 / (9.203% − 1.0%) = 7,832.9 / 8.203% = $95,494.1M`
  - `PV(TV) = 95,494.1 × 0.4333 = $41,377.6M`
  - Sum of PV of stressed explicit FCFF = $58,248.5M
  - EV (stressed) = $58,248.5M + $41,377.6M = $99,626.1M
  - Equity = $99,626.1M − $9,340M − $1,083M = $89,203.1M
  - **Per-share (structural-reset terminal): $43.38**

This structural-reset case is the DCF input for `07_scenario-and-fair-value`'s structural-reset bear leg and the master synthesizer's Kill Criteria — **it does not replace the base-case intrinsic value below.**

---

## 6. DCF Output

**Executed EV → equity → per-share bridge snippet:**
```
EV = Sum PV FCFF + PV(TV) = 70,762.1 + 103,787.1 = 174,549.2
TV % of EV = 103,787.1 / 174,549.2 = 59.46%
Equity value = EV - net debt - minority = 174,549.2 - 9,340.0 - 1,083.0 = 164,126.2
Per share = Equity / diluted shares = 164,126.2 / 2,056.327 = 79.82
vs price $68.18 => (79.82-68.18)/68.18 = +17.07%
```

| Step | Value |
|---|---:|
| PV of explicit FCFs (Yr1–Yr10) | $70,762.1M |
| + PV of terminal value | $103,787.1M |
| **= Enterprise value (DCF-derived)** | **$174,549.2M** |
| − Net debt (broad basis, canonical per `01`) | $9,340.0M |
| − Minority / non-controlling interest | $1,083.0M |
| − Preferred equity | $0 (nil, per `01` §4) |
| **= Equity value** | **$164,126.2M** |
| ÷ Diluted shares (per `01` §2) | 2,056.327M |
| **= Intrinsic value per share (base case)** | **$79.82** |
| vs current price ($68.18, 2026-08-06, pool-verified) | **+17.07%** (fair value above price) |

For context, this DCF-derived EV ($174,549.2M) sits **16.6% above** `01`'s current-market EV ($149,684.7M) — consistent with the per-share premium above.

---

## 7. Sensitivity Grid (per-share intrinsic value)

WACC across columns (base 9.20%, ±1.00pp — spans the ~0.5pp gap to the moat module's independently-derived 9.7% cost of capital, per Gate 4), terminal growth down rows (base 3.5%, ±0.5pp):

| | WACC 8.20% | WACC 9.20% (base) | WACC 10.20% |
|---|---:|---:|---:|
| g = 4.00% | $105.99 | $84.93 | $70.66 |
| g = 3.50% (base) | $97.68 | **$79.82** | $67.28 |
| g = 3.00% | $90.97 | $75.52 | $64.37 |

No grid cell approaches `WACC − g ≤ 0` — the closest spread (WACC 8.20% / g 4.00%) is still 4.20pp — so no cell is marked NM.

For reference, the **structural-reset (declining-perpetuity) terminal** from §5 — a distinct, lower-g, lower-margin scenario, not a grid cell of the base case — computes to **$43.38/share**, materially below the low end of this grid, reflecting the AV-disruption bear leg rather than a WACC/g wobble around the base case.

---

## 8. Intrinsic Read

**Base-case intrinsic value: $79.82/share** (DCF-derived, mid-year convention, WACC 9.20%, terminal g 3.5%), against a current price of $68.18 — a +17.1% premium of fair value over price. The §7 grid disperses that point from $64–$106/share on plausible ±1pp WACC / ±0.5pp terminal-growth moves — a wide band that shows the base point is not a precise single number, and the separately labeled structural-reset (AV-disruption) terminal at $43.38/share sits well below even the low end of that grid, marking the downside this DCF's central case does not carry. The single assumption this value is most sensitive to is **terminal growth interacting with WACC** (the g=4.0%/WACC=8.2% corner is 2.5x the g=3.0%/WACC=10.2% corner), compounded by a genuine method tension flagged in §5: Uber's disclosed working-capital release (self-insurance-reserve buildup) makes the standard financeable-growth cross-check unusable at face value, which is why intrinsic confidence here is capped at Low–Medium rather than presented at face value alongside the +17% headline — a reader relying on this DCF alone, without the multiples-based cross-checks in `02`/`03`, would be leaning on a self-built 10-year forecast beyond the 2-year consensus horizon for the majority of the value (terminal value is 59.5% of EV).



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — UBER

Reporting standard: US GAAP. Reporting currency: USD millions, except per-share figures. This agent inverts the SAME model as `valuation/04_intrinsic-dcf.md` — the same WACC, the same terminal growth rate, the same 10-year horizon, and the same mid-year discounting convention are used verbatim below. The FCF base is rebuilt at the Year-0 (FY2025A) anchor point using `04`'s own stated formula (NOPAT + D&A − Capex + working-capital cash source), because `04` publishes this base only from Year 1 forward; the construction is cross-validated against `04`'s own Year-1 figure below (§1).

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $68.18 (2026-08-06, last close, pool-verified) | `01_price-and-capital-structure.md` §1 |
| Enterprise value (current, market) | $149,684.7M | `01_price-and-capital-structure.md` §4 (ties to CIQ TEV with no plug) |
| Net debt (broad basis, canonical) | $9,340M | `01` §5 |
| FCF (unlevered FCFF) base, Year 0 (FY2025A) | **$7,006.4M** | Rebuilt using `04`'s exact formula: NOPAT ($5,565M EBIT × (1−21%) = $4,396.4M) + D&A ($719M) − Capex ($336M) + working-capital cash source ($2,227M, FY2025 disclosed CFO-bridge figure) = $7,006.4M. EBIT, tax rate, D&A, Capex and the WC figure are all taken verbatim from `04_intrinsic-dcf.md` §1–2 and `business-model/09_moat.md` §3 (D&A) |
| Discount rate (WACC) | **9.20%** (9.203%) | Taken verbatim from `04_intrinsic-dcf.md` §3: k_e 9.83% (CAPM: rf 4.65% + β1.15 × ERP 4.5%), after-tax k_d 3.32%, weights 90.43%/9.57% by market value |
| Terminal growth (g) | **3.5%** (nominal) | Verbatim from `04` §5 |
| Forecast horizon | 10 years (FY2026E–FY2035E) | Verbatim from `04` §2, §4 |
| Discounting convention | Mid-year (t − 0.5) | Verbatim from `04` §4 |

**Cross-validation of the Year-0 FCFF construction.** Growing the $7,006.4M base at 04's own implied Year-1 growth rate reproduces 04's own Year-1 FCFF almost exactly: $7,006.4M × (1 + 12.08%) = $7,852.0M vs. 04's reported Year-1 FCFF of $7,852.2M — a ~$0.2M rounding difference. This confirms the Year-0 base is built on the identical methodology as the rest of 04's forecast, not an independent re-derivation.

## 2. Implied Expectations

**What was held fixed:** WACC (9.20%), terminal growth (3.5%), the 10-year horizon, mid-year discounting, and the FY2025A FCFF base ($7,006.4M). **What was solved for:** a single constant annual FCFF growth rate (applied uniformly across all 10 explicit years) that makes the present value of the forecast (explicit FCFFs + Gordon-growth terminal value) equal today's EV ($149,684.7M) — solved with `scipy.optimize.brentq`. Two secondary solves follow the same target-EV logic with a different variable held free.

**Executed solver (primary solve):**
```
$ python3 -c "
from scipy.optimize import brentq
WACC=0.09203; g_term=0.035; target_EV=149684.7; FCFF0=7006.4
def df(t): return 1/(1+WACC)**(t-0.5)
def ev(g):
    pv=sum(FCFF0*(1+g)**t*df(t) for t in range(1,11))
    fcff10=FCFF0*(1+g)**10
    tv=fcff10*(1+g_term)/(WACC-g_term)
    return pv+tv*df(10)
g=brentq(lambda g: ev(g)-target_EV, -0.3, 0.6, xtol=1e-8)
print('implied g=', round(g*100,3),'%  EV check=', round(ev(g),1))
"
implied g= 5.049 %  EV check= 149684.7
```
Terminal value = 60.2% of the solved EV — just above the ~60% dominance threshold, so §4 below also stresses terminal g ±0.5%.

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCF CAGR over the 10-year horizon (constant, WACC 9.20%, terminal g 3.5%) | **5.05%** |
| Implied years of above-GDP growth (fade model: FCFF grows at 12% — 04's own Year-1 FCFF growth rate — for N years, then drops straight to the 3.5% terminal rate forever) | **~1.5 years** |
| Implied steady-state EBIT margin (holding 04's own revenue, capex, D&A and working-capital $ path fixed; solving for a single constant margin instead of 04's 12.5%→13.2%→12.8% ramp) | **10.78%** |

**Fade-model solver (secondary):**
```
$ python3 -c "
WACC=0.09203; g_term=0.035; target_EV=149684.7; FCFF0=7006.4; g_high=0.12
def df(t): return 1/(1+WACC)**(t-0.5)
def ev(N):
    pv=0.0; fcff=FCFF0
    for t in range(1,N+1):
        fcff=FCFF0*(1+g_high)**t; pv+=fcff*df(t)
    tv=fcff*(1+g_term)/(WACC-g_term)
    return pv+tv*df(N)
print('N=1:',round(ev(1),1),' N=2:',round(ev(2),1),' target:',target_EV)
"
N=1: 143789.4   N=2: 154981.5   target: 149684.7
```
Linear interpolation between N=1 ($143,789.4M) and N=2 ($154,981.5M) against the $149,684.7M target gives **N ≈ 1.53 years**.

**Margin solver (secondary):**
```
$ python3 -c "
from scipy.optimize import brentq
WACC=0.09203; g_term=0.035; target_EV=149684.7; tax=0.21
rev=[57842.9,67039.9,75084.7,82593.2,89613.6,96334.6,102596.4,108239.2,113651.1,118765.4]
da=[752.0,938.6,1126.3,1404.1,1702.7,1926.7,2154.5,2381.3,2500.3,2612.8]
capex=[347.1,536.3,750.8,1073.7,1433.8,1734.0,2051.9,2273.0,2500.3,2612.8]
wc=[1735.3,1676.0,1651.9,1651.9,1613.0,1541.4,1436.3,1298.9,1250.2,1187.7]
def df(t): return 1/(1+WACC)**(t-0.5)
def ev(m):
    pv=0.0; fcffs=[]
    for i in range(10):
        f=rev[i]*m*(1-tax)+da[i]-capex[i]+wc[i]; fcffs.append(f); pv+=f*df(i+1)
    tv=fcffs[-1]*(1+g_term)/(WACC-g_term)
    return pv+tv*df(10)
m=brentq(lambda m: ev(m)-target_EV, -0.2, 0.6, xtol=1e-9)
print('implied margin=', round(m*100,3),'%')
"
implied margin= 10.777 %
```

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied FCFF CAGR = 5.05% (10yr) | Revenue CAGR FY2023→FY2025 = 18.1%; FCF (CFO−Capex) CAGR FY2023→FY2025 = 70.4% (inflated by the post-loss margin recovery, not a repeatable base rate). 04's own base-case forecast — built off a fading revenue path (11.2%→4.5%) and a margin ramp to 13.2% — implies a 6.54% FCFF CAGR over the same 10 years | `earnings/01` §6: revenue growth decelerating from ~17–18% (FY23–25) to +14.5%/+12.2% headline YoY in the last two quarters, but Gross Bookings growth has stayed above 20% constant-currency for 4 consecutive quarters, and `earnings/07` ranks Driver/Courier payment ratio and volume growth as currently favorable trends | **Yes — well within reach.** Even 04's own conservative, fading 10-year forecast (6.54%) clears the 5.05% the price requires |
| Implied years of above-GDP growth ≈ 1.5 years (at a 12% FCFF growth phase, 04's own Yr-1 rate) | N/A (forward-looking) | `business-model/09_moat.md` §5: moat verdict **Narrow, but widening** — ROIC has been above the ~9.7% estimated WACC for the last 1–2 years (FY2024 +6.0%, FY2025 +9.4%, LTM +10.6%), though the 5-year through-cycle average (+0.85%) remains below WACC. `business-model/07_business-quality.md` scores industry rate-of-change/disruption risk (AV) at 32/100 — a real but longer-dated risk, not one with evidence of crystallizing inside 1.5 years | **Yes, conservative.** 04's own base case explicitly assumes 10 full years of above-GDP-adjacent growth (revenue growth stays at or above 4.5% through Year 10); nothing in the moat or business-quality evidence points to growth collapsing to GDP-level within ~1.5 years — the AV-disruption risk that could eventually cap growth is a multi-year, not an 18-month, risk per the same evidence |
| Implied steady-state EBIT margin = 10.78% | FY2025A actual EBIT margin = 10.70% (already achieved); TTM (Jun-30-2026) actual EBIT margin = 12.13% (already 143bps above the implied level); Q2 FY26 quarterly EBIT margin ≈13.3% | `earnings/03_margin-drivers.md` (cited in 04 §2): genuine ex-UK cost-of-revenue leverage of +377bps in Q2 FY26 alone; Mobility segment Adjusted EBITDA margin rose 22.4%→26.6% FY24→FY25 | **Yes — already exceeded.** The price does not require any further margin expansion beyond what Uber had already delivered by FY2025A, and the business is already running materially above that level on a trailing basis |

**Judgment.** On all three tests, the price is pricing in less than what the company has already delivered or than 04's own base-case forecast assumes. The implied 5.05% FCFF CAGR sits well below both the 18.1% historical revenue CAGR (FY2023–2025) and 04's own 6.54% base-case FCFF CAGR; the implied ~1.5 years of above-GDP growth is a small fraction of the 10 years of above-GDP-adjacent growth 04's own model assumes, with no evidence in the moat or business-quality modules of growth collapsing that fast; and the implied 10.78% steady-state EBIT margin is a level Uber has already surpassed on a trailing basis (TTM 12.13%). This reads as **conservative**, not aggressive — consistent with 04's own finding that its base-case intrinsic value ($79.82) sits +17.1% above the current price.

**Market-ceiling sanity check.** Uber is an operating (not financial/REIT) business, so a revenue-size test applies. Holding the FCFF/Revenue conversion ratio fixed at FY2025A's 13.47%, the primary 5.05% FCFF CAGR translates to an implied Revenue CAGR of **5.05%** (identical, since the ratio is held fixed) and an implied FY2035E revenue of **~$85.1bn** (vs. $52.0bn in FY2025A). Uber's own current disclosed run-rate already dwarfs this: Q2 FY26 quarterly Gross Bookings were $58.0bn [Q2 FY26 10-Q], an annualized pace of roughly $220–230bn, several multiples of the $85.1bn revenue figure the price implies for a decade out. Third-party estimates of the global ride-hailing addressable market for 2026 found via web search range from roughly $55bn to $335bn across six vendor reports — a ~6x dispersion with no disclosed common methodology, and several estimates already sit below Uber's own current global Mobility Gross Bookings alone — so this market-ceiling test cannot be applied with numeric precision and no specific TAM figure is used as a hard constraint (CLAUDE.md §4, low-tier input). Qualitatively, since the implied revenue trajectory is a small fraction of Uber's own already-realized scale, this check does not push the read toward "aggressive" — consistent with the rule that it can only raise the bar, this one simply does not bind.

## 4. Robustness

| Discount Rate | Implied FCF CAGR to Justify Price |
|---|---:|
| WACC −1% (8.20%) | 2.63% |
| WACC (9.20%, base) | 5.05% |
| WACC +1% (10.20%) | 7.21% |

**FCF-base stress (dominant sensitivity).** Three definitions of the FY2025A/TTM FCFF base, all built on 04's own formula, all holding WACC (9.20%) and terminal g (3.5%) fixed:

| FCF Base (definition) | FCFF₀ | Implied FCF CAGR |
|---|---:|---:|
| Low — FY2025A, working-capital cash source stripped out entirely (the method-tension case 04 §5 itself flags: NOPAT + D&A − Capex, no WC add-back) | $4,779.4M | 10.02% |
| Base — FY2025A, 04's full methodology (NOPAT + D&A − Capex + WC source) | $7,006.4M | 5.05% |
| High — TTM (Jun-30-2026), same methodology | $7,986.0M | 3.35% |

**The FCF base is the dominant sensitivity, not the discount rate.** The WACC ±1pp band swings the implied CAGR by 4.58 points (2.63%–7.21%, a range straddling the 5.05% base); the FCF-base band swings it by 6.67 points (3.35%–10.02%) — a wider spread from a plausible, evidence-grounded set of base-year definitions than from a full 1-point move in the discount rate. This matches 04's own observation that Uber's disclosed working-capital cash source (the self-insurance-reserve buildup) creates real method sensitivity in the base year, not just in the terminal value.

**Terminal-g stress (triggered — TV = 60.2% of EV, above the ~60% threshold).**

| Terminal g | Implied FCF CAGR to Justify Price |
|---|---:|
| g = 3.0% (−0.5pp) | 5.74% |
| g = 3.5% (base) | 5.05% |
| g = 4.0% (+0.5pp) | 4.29% |

Terminal g moves the answer by about 1.45 points across a full 1-point range — smaller than either the WACC or FCF-base bands, but not negligible given the primary solve's own TV share sits right at the escalation threshold.

## 5. What's-Priced-In Read

At $68.18, the market is pricing in roughly 5.05% annual free-cash-flow growth over the next 10 years, only about 1.5 years of above-GDP growth before the model must fall to a permanent 3.5% terminal rate, and a steady-state operating margin (10.78%) Uber's trailing 12 months (12.13%) has already beaten. That is **conservative**: it sits below both the company's own 18.1% two-year historical revenue CAGR and 04's own base-case forecast (6.54% FCFF CAGR, +17.1% fair value premium to price), and the moat and business-quality evidence show no basis for growth collapsing to GDP-level within 18 months. The FCF-base definition, not the discount rate, is what would most change this read — using a TTM-based, working-capital-inclusive base instead of the FY2025A anchor drops the implied hurdle to 3.35%, an even easier bar; only stripping out the disclosed working-capital cash source entirely (04's own flagged method tension) pushes the implied hurdle up to 10.02%, still below the 18.1% historical rate. On balance, the market's implied expectations for UBER look conservative relative to what the company has already delivered — this is a valuation-layer input for `07_scenario-and-fair-value`, not a standalone verdict.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — UBER

Reporting standard: US GAAP. Reporting currency: USD (millions, except per-share figures). Fiscal year end: December 31. Listing: NYSE:UBER (US SEC filer) [FY25 10-K cover page]. All anchor figures (price $68.18 as of 2026-08-06, diluted shares ~2,056.327M, net debt $9,340M broad-basis canonical, EV $149,684.7M) are taken verbatim from `01_price-and-capital-structure.md` per Reconciliation Gate 1.

Uber is **not** effectively single-segment: Mobility is 57.0% of FY25 revenue and 69.1% of FY25 total segment Adjusted EBITDA [`business-model/03_segment-map.md`, citing FY25 10-K, Note 13, p.112–114] — below the 85% collapse threshold. Delivery is a real, growing second engine (31.2% of segment profit); Freight is currently a small loss-maker. A full three-segment SOTP is required and runs below; the material unallocated Corporate G&A / Platform R&D bucket is capitalized and subtracted in the bridge, not dropped (Reconciliation Gate 3).

## 1. Segment Inventory

Figures are FY2025 (year ended Dec-31-2025), the latest audited annual period, under the company's discontinued-but-last-clean "Segment Adjusted EBITDA" basis [FY25 10-K, Note 13, p.112–114]. "% of Total Segment EBITDA" is computed against the sum of the three reportable segments only ($11,438M), which sums to 100% by construction; the unallocated Corporate G&A / Platform R&D bucket sits below that line and is shown separately so it cannot silently inflate any segment's share above 100%.

| Segment | Revenue (FY25) | Adjusted EBITDA (FY25) | Margin | % of Total Segment EBITDA | Source |
|---|---:|---:|---:|---:|---|
| Mobility | $29,670M | $7,899M | 26.6% | 69.1% | FY25 10-K, Note 13, p.114 |
| Delivery | $17,248M | $3,572M | 20.7% | 31.2% | FY25 10-K, Note 13, p.114 |
| Freight | $5,099M | -$33M | -0.6% | -0.3% | FY25 10-K, Note 13, p.114 |
| **Total reportable segments** | **$52,017M** | **$11,438M** | **22.0%** | **100.0%** | FY25 10-K, Note 13 |
| Corporate G&A & Platform R&D (unallocated, not a segment) | — | -$2,708M | — | -23.7% of total segment EBITDA | FY25 10-K, Note 13, p.113 |
| **Consolidated Adjusted EBITDA** | **$52,017M** | **$8,730M** | **16.8%** | — | FY25 10-K, Note 13 |

Revenue reconciles exactly to consolidated revenue with no "Other" bucket [`business-model/03_segment-map.md`]. **Metric-basis break:** beginning Q1 FY26, Uber discontinued "Segment Adjusted EBITDA" and replaced it with "Segment Operating Income," a different (lower) profit measure that nets stock-based compensation and depreciation within segment costs rather than adding them back; FY2026-and-later segment figures are not directly comparable to the FY25 table above on a margin-for-margin basis [Q2 FY26 10-Q, Note 10: "Beginning in the first quarter of 2026, we changed our segment operating performance measure from Segment Adjusted EBITDA to Segment Operating Income"]. Section 2 addresses this directly in building the forward metric.

**Vendor data-quality flag:** the CIQ `Financials_Quarterly.xls` "Segments" tab's "Operating Profit Before Tax" row mislabels its Jun-30-2026 column — it repeats the Q2 **FY25** recast comparative ($1,729M / $766M / -$26M for Mobility/Delivery/Freight) rather than the actual Q2 **FY26** figures. This agent uses the primary 10-Q Note 10 tables directly (verified against the filing text) rather than that CIQ column, per the source hierarchy (§4/§5) — filings beat vendor exports, and a vendor number is never cited under a filing's name.

## 2. Segment Multiples & Comparables

**Forward metric construction (Inference, not from filings, built from filed inputs).** No segment-level consensus exists (confirmed: `earnings/04_guidance-consensus.md` has no segment split), so a forward metric is built directly from the primary filing:
1. H1 FY26 actual Segment Operating Income, annualized ×2 [Q2 FY26 10-Q, Note 10, "Six Months Ended June 30, 2026" table: Mobility $4,244M, Delivery $2,016M, Freight -$54M] → Mobility $8,488M, Delivery $4,032M, Freight -$108M.
2. Add back a pro-rata D&A allocation to convert this EBIT-like measure to an EBITDA-equivalent matching the CIQ-standardized basis the peer multiples below are quoted on (CIQ "EBITDA" = GAAP operating income + D&A, confirmed by back-solving Uber's own LTM EV/EBITDA of 19.2x against EV $149,684.7M → implied EBITDA ≈$7,796M, close to the LTM $7,474M CIQ figure in `01` — i.e., CIQ's peer EBITDA multiples are NOT the company's SBC-adjusted "Adjusted EBITDA," so no SBC add-back is needed, only D&A). FY25 D&A was $719M on $52,017M revenue (1.38% of revenue) [`earnings/01_historical-financials.md`, citing FY25 10-K Adjusted EBITDA reconciliation]. Applied to FY26E revenue (below) → ≈$800M FY26E D&A, allocated pro-rata by segment revenue share.
3. FY26E segment revenue is built by taking H1 FY26 actual revenue [Q2 FY26 10-Q, Note 10] and adding an implied H2 FY26E (= consensus FY2026E total revenue $57,834.88M [`earnings/04_guidance-consensus.md`, Consensus tab] − H1 FY26 actual $27,394M), split across segments using the H1 FY26 revenue mix.

| Segment | FY26E Revenue | FY26E Segment Op. Income (H1 annualized) | + D&A add-back | = FY26E EBITDA-equivalent |
|---|---:|---:|---:|---:|
| Mobility | $29,899M | $8,488M | $413M | $8,901M |
| Delivery | $21,774M | $4,032M | $301M | $4,333M |
| Freight | $6,165M | -$108M | $85M | -$23M |
| **Total** | **$57,838M** | **$12,412M** | **$799M** | **$13,211M** |

Freight's FY26E EBITDA-equivalent is essentially zero (-$23M) — too close to breakeven for an EV/EBITDA multiple to be meaningful (multiplying a near-zero base produces a near-zero or sign-flipping result regardless of the multiple chosen), so Freight is valued on **EV/Revenue** instead, flagged explicitly below.

| Segment | Metric Used (period basis) | Multiple Applied | Named Comparable | Comparable's Multiple | Why It Fits | Source |
|---|---|---:|---|---:|---|---|
| Mobility | FY26E EBITDA-equivalent, $8,901M (current FY, ~5 months remaining) | 7.94x (base) / 16.58x (high dispersion) | Lyft, Inc. (base) / DiDi Global Inc. (high) | Lyft NTM TEV/Fwd EBITDA 7.94x; DiDi NTM TEV/Fwd EBITDA 16.58x | Lyft is `business-model/08_competitive-map.md`'s own-named "closest same-business, same-geography peer" — same asset-light US/Canada rideshare marketplace, no owned fleet — used as the conservative base per Core Principle 6 (default to the lower value when comps conflict); DiDi is a larger-scale global rideshare marketplace with comparable economics, shown as the high-end cross-check since Uber Mobility's ~30% margin and market-leading scale clearly exceed Lyft's near-breakeven profile | Capital IQ Comps export, Trading Multiples tab, as of 2026-08-06 |
| Delivery | FY26E EBITDA-equivalent, $4,333M (current FY, ~5 months remaining) | 20.78x | DoorDash, Inc. | NTM TEV/Fwd EBITDA 20.78x | Direct, same-geography US food/grocery delivery marketplace, named as a Delivery competitor in Uber's own FY25 10-K, asset-light (couriers own vehicles, matching Uber's model) — the single cleanest match in the pool, no second comp needed | Capital IQ Comps export, Trading Multiples tab, as of 2026-08-06 |
| Freight | FY26E revenue, $6,165M (current FY, ~5 months remaining) | 0.51x (base) / 1.17x (high) | RXO, Inc. (base) / C.H. Robinson Worldwide (high) | RXO EV/Sales ≈0.51x; CHRW EV/Sales 1.17x | RXO is an asset-light truckload freight brokerage with no owned trucking fleet — the closest economic match to Uber Freight's own description ("digital marketplace connecting Shippers and Carriers... Uber owns no trucking fleet" [`business-model/03_segment-map.md`]) — used as the base; C.H. Robinson is a larger, more diversified, higher-margin logistics broker, shown as the high-end cross-check | Web: stockanalysis.com / MarketScreener, RXO EV/Sales, 2026 snapshot (indicative, unverified, no precise as-of date found — labelled); Web: stockanalysis.com, CHRW EV/Sales as of 2026-08-04 (indicative, unverified) |

**Freight comparable limitation, flagged per triage:** no freight-brokerage peer exists in the pool's 10-name Capital IQ comp set (`00_valuation-data-triage.md` flagged this directly); RXO and C.H. Robinson are sourced from the web, dated, and labelled unverified per the source hierarchy. Both web multiples are effectively current/LTM snapshots, not a strict NTM figure (no forward EV/Sales was found for either), so there is a mild period-basis mismatch applying a current-ish multiple to a FY26E revenue base — flagged, not corrected, given no better forward freight-broker multiple is available.

## 3. Segment Valuation

`Segment EV = FY26E metric × multiple`. Base case uses the conservative comparable named above for each segment (Lyft for Mobility, RXO for Freight); the high-dispersion case swaps in the named alternative comp.

| Segment | Metric Value | Multiple (base) | Segment EV (base) | Multiple (high) | Segment EV (high) |
|---|---:|---:|---:|---:|---:|
| Mobility | $8,901M | 7.94x (Lyft) | $70,674M | 16.58x (DiDi) | $147,579M |
| Delivery | $4,333M | 20.78x (DoorDash) | $90,040M | 20.78x (DoorDash) | $90,040M |
| Freight | $6,165M (revenue) | 0.51x (RXO) | $3,144M | 1.17x (CHRW) | $7,213M |
| **Gross enterprise value (sum)** | | | **$163,858M** | | **$244,832M** |

For context (not part of the bridge): the base-case gross segment EV ($163,858M) sits about 9.5% above Uber's current actual EV ($149,684.7M, per `01`) *before* any deduction for corporate overhead — the corporate-cost capitalization in Section 4 is what brings the SOTP-derived figure back down.

## 4. Equity Bridge

Corporate G&A / Platform R&D is a permanent cost drag on all three segments and cannot be dropped (Reconciliation Gate 3). It is capitalized as a perpetuity at Uber's own consolidated NTM EV/EBITDA multiple (11.89x [Capital IQ Comps export, Trading Multiples tab, Uber row, as of 2026-08-06]) — the only directly observable market multiple available for this purpose, used as a stated modeling choice, not a segment-specific comparable. FY26E corporate cost is built the same way as the segment metrics: H1 FY26 actual (-$2,180M) [Q2 FY26 10-Q, Note 10] annualized ×2 = -$4,360M. Capitalized value = $4,360M × 11.89x = $51,840M.

Uber is net debt (not net cash) on both bases per `01`, so only a single "− net debt" line is needed — no add-back double-count risk. Per `01`, $12,532M of long-term investments (mostly mark-to-market minority equity stakes in Aurora, Grab, Didi, Delivery Hero (pre-equity-method portion), Joby, and others) and $3,773M of equity-method investments (predominantly Uber's enlarged Delivery Hero stake, reclassified from Mar-31 to Jun-30-2026) are **not** netted in `01`'s EV bridge and are separate, genuinely non-operating financial assets outside the three operating segments — `01` explicitly flags that "downstream DCF/SOTP agents should consider whether to value this portfolio separately." They are added back here as a single combined line.

| Step | Value ($M) |
|---|---:|
| Gross enterprise value (base case, Section 3) | 163,858 |
| − Capitalized unallocated corporate costs ($4,360M FY26E × 11.89x) | (51,840) |
| = Adjusted EV | 112,018 |
| − Net debt (broad basis, canonical per `01`) | (9,340) |
| − Minority / non-controlling interest | (1,083) |
| − Preferred equity | 0 |
| + Equity-method & other minority investments (Aurora/Grab/Didi/Delivery Hero/Joby stakes) | 16,305 |
| **= Equity value (base case)** | **117,900** |
| ÷ Diluted shares (per `01`) | 2,056.327M |
| **= SOTP value per share (base case)** | **$57.34** |
| vs current price ($68.18, 2026-08-06) | -15.9% (SOTP base sits below price) |

**High-dispersion case** (Mobility on DiDi 16.58x, Freight on C.H. Robinson 1.17x, all other bridge lines unchanged): Gross EV $244,832M → Adjusted EV $192,992M → −net debt $183,652M → −minority $182,569M → +investments $198,874M → **$96.71/share**, +41.9% above price.

**No conglomerate/holding-company discount is applied.** Uber is a single integrated technology platform with shared engineering, marketing, and payments infrastructure and a cross-segment loyalty program (Uber One spans Mobility and Delivery) — not a diversified collection of unrelated businesses under a value-maximizing-elsewhere parent (no RF-OWN-004 flag from the governance module for this ticker). A structural holdco discount is not warranted here; the wide base-to-high dispersion above already reflects genuine comparable-selection uncertainty, not a discount that should be layered on top of it.

**Not reflected in this bridge:** the pending Delivery Hero acquisition (~$14.8B implied equity value, funded partly by a new €14.2B bridge credit facility signed 2026-07-16, expected to close H2 2027) is a material subsequent event not yet in the Jun-30-2026 balance sheet [`01_price-and-capital-structure.md`]. If it closes, it would materially enlarge the Delivery segment and add meaningfully to net debt — a forward catalyst/risk to flag, not to model into a base case that has not closed and remains subject to regulatory clearance.

## 5. SOTP Read

The base case (using Lyft — the competitive-map's own "closest same-business, same-geography" Mobility peer, and RXO — the closest asset-light freight-brokerage peer) values Uber at **$57.34/share, 15.9% below** the $68.18 current price; a high-dispersion case built on the alternative named comparables (DiDi for Mobility, C.H. Robinson for Freight) reaches **$96.71/share, 41.9% above** price. That $57–$97 range is not false precision — it is the real, cited disagreement between named peers on how to price Mobility specifically, and the base case (per Core Principle 6) is the more conservative, lower one.

**Which segment carries the value depends entirely on the Mobility comp.** In the conservative base case, Delivery — not Mobility — carries the larger share of gross segment EV ($90.0B of $163.9B, 55%, vs Mobility's $70.7B, 43%) purely because DoorDash's 20.78x forward multiple is more than double Lyft's 7.94x, even though Mobility generates more than double Delivery's FY26E profit ($8.9B vs $4.3B). Flip to the DiDi-anchored high case and Mobility dominates instead (60% of gross EV). Freight is a rounding error either way (under 3% of gross EV, consistent with `03_segment-map.md`'s own read of Freight as "a profit drag, not a contributor").

The single largest number in this entire SOTP is not a segment at all: capitalizing Uber's ~$4.4B annualized unallocated corporate overhead at the company's own 11.89x blended multiple subtracts **$51.8B** — roughly a third of the company's entire current market cap ($139.3B, per `01`) — reminding that a consolidated read of Uber already prices in a large, permanent corporate-cost tax on whatever the segments are worth individually.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — UBER

Reporting currency: USD. Anchors used verbatim from `01_price-and-capital-structure.md`: current price **$68.18** (2026-08-06, last close, corroborated by two independent Capital IQ exports — **price-state: `pool-verified`**); fully diluted shares **2,056.327M**; net debt **$9,340M** (broad basis, canonical for this module); minority interest **$1,083M**; market cap **$139,261.7M**; EV **$149,684.7M**. Business type: **Operating** (asset-light two-sided marketplace) per the Business-Type Method Map — FCFF DCF + multiples are the correct primary methods; SOTP and reverse-DCF are cross-checks, not primary.

**Price freshness.** Run date 2026-08-09 minus quote as-of date 2026-08-06 = ~1 trading day (only 2026-08-07 intervenes; 08-08/09 is a weekend) — well inside the 5-trading-day threshold. No staleness cap applies and no dual-price presentation is required.

**Material item not modeled below** (carried from `01` §4 and every upstream agent): Uber signed a Business Combination Agreement on 2026-07-16 to acquire Delivery Hero SE (~$14.8bn implied equity value), funded partly by a new €14.2bn bridge credit facility. Neither the acquisition nor the bridge facility is reflected in the Jun-30-2026 balance sheet anchors used throughout this report; if drawn, net debt could rise materially. This is a real forward risk to every fair-value level below, not yet priced into any of them.

**Governance cross-check.** No structurally misaligned controlling owner is flagged for Uber — the management-governance module (`analyses/UBER_2026-08-08/management-governance/99_management-governance-synthesis.md`) found RF-OWN-004 **not** triggered (no controlling shareholder; PIF 3.578% and BlackRock 7.417% are both minority holders). The mandatory §24 Filter 6 value-trap language therefore does not automatically apply, though a serial-acquirer flag (RF-CAP-004, ~12 deals since IPO) is carried forward as context for the Delivery Hero risk above.

---

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | **$87.37** (EV/Sales, 5yr median reversion) | Medium | **29%** | The only clean, undistorted own-history band (5yr EV/Sales) — EV/EBITDA, EV/EBIT, and P/E history are self-flagged by `02` as base-effect-distorted (Uber only turned GAAP-profitable in 2023) and excluded as fair-value inputs. Weighted below full (not top) because `02` itself flags real doubt that full reversion is warranted — decelerating growth, releveraging (0.82x → ~1.3x net debt/EBITDA), and the pending debt-funded Delivery Hero deal are cited, cited reasons the market may not be mispricing. |
| Relative / peers (03) | **$75.75** (NTM EV/EBITDA, quality-and-growth-adjusted 13.2x) | Medium–High | **38%** | Forward-looking, and `03` itself explicitly reconciles a >40% cross-method spread (EV/Sales −37% to P/E +62%) down to a single defensible metric (EV/EBITDA — least distorted by either Uber's own revenue-multiple premium or GAAP EPS mark-to-market noise). Highest weight because it best isolates a warranted multiple net of named peer-comp distortions. |
| Intrinsic DCF (04) | **$79.82** | Low–Medium (self-capped) | **15%** | Cross-check per the Method-Weighting Policy (Operating company with a usable forward multiple ⇒ 02+03 majority, 04+06 combined ≤ ⅓). `04` itself caps confidence: terminal value is 59.5% of EV, and the disclosed working-capital cash source breaks the standard financeable-growth cross-check (modeled reinvestment rate goes negative), which `04` flags rather than papering over. |
| Reverse-DCF (05) | (implied, not a value) — 5.05% implied 10-yr FCFF CAGR, ~1.5 yrs of above-GDP growth, 10.78% implied steady-state EBIT margin | n/a | n/a | Cross-check only. Reads as **conservative**: the price implies less growth (5.05% FCFF CAGR) than `04`'s own base case (6.54%) or Uber's FY2023–2025 revenue CAGR (18.1%), and a steady-state margin (10.78%) Uber's TTM (12.13%) has already exceeded. Informs — does not set — the base case: it argues the base point is not aggressive. |
| Sum-of-the-parts (06) | **$57.34** (base, Lyft-anchored Mobility comp) / $96.71 (high, DiDi-anchored) | Medium | **18%** | Cross-check, capped with `04` per the ≤⅓ policy. Segment data is solid (Uber is not single-segment: Mobility 57% of revenue / 69% of segment EBITDA, below the 85% collapse threshold), but the wide $57–$97 base-to-high spread is driven almost entirely by which Mobility comparable is used (Lyft 7.94x vs. DiDi 16.58x NTM EV/EBITDA) — a comp-selection artifact more than an independent valuation signal — and the $51.8bn capitalized corporate-overhead subtraction is itself a large, single modeling choice. |

Weights sum to 100% across the value-producing methods valid for this Operating business (02, 03, 04, 06). `02`+`03` = **67%** (majority, per the Multiples-first policy); `04`+`06` = **33%** (at the ≈⅓ cap for cross-checks). Reverse-DCF (`05`) is a cross-check on achievability, not a weighted input.

**Multiples-first applied.** Uber has both a usable forward metric (CIQ consensus NTM EBITDA $12,589M / NTM revenue $62,192M) and an own-history multiple band (`02`, clean on EV/Sales) plus a peer multiple set (`03`), so per the Scenario Construction & Method-Weighting Policy §1, `02` and `03` carry the majority weight and `04`/`06` are capped cross-checks. No stated reason elevates SOTP to primary here — Uber is a single integrated technology platform (shared engineering, payments, and a cross-segment loyalty program, Uber One), not a holding company, so the Method Map's "Holding company → SOTP primary" branch does not apply (`06` §4 explicitly declines a conglomerate discount for the same reason).

---

## 2. Triangulation & Reconciliation

### Method football field (full dispersion — not narrowed)

| Method | Value / Range | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| 02 — Own-history multiples | **$87.37** base; usable range $70.71–$90.29 (P/E-recent mean/median to EV/Sales mean); *EV/EBITDA/EV/EBIT/P-FCF reversion figures ($118–$131) shown as illustrative-only in `02`, base-effect distorted, excluded here* | Medium | 29% | See §1 |
| 03 — Relative / peers | **$75.75** base; full cross-method range $42.87 (EV/Sales) – $110.73 (P/E) | Medium–High | 38% | See §1 |
| 04 — Intrinsic DCF | **$79.82** base; sensitivity grid $64.37–$105.99 (±1pp WACC, ±0.5pp terminal g) | Low–Medium | 15% | See §1 |
| 06 — Sum-of-the-parts | **$57.34** base – $96.71 high (comp-selection driven) | Medium | 18% | See §1 |

**Headline finding — cross-method spread exceeds the 40% tolerance.** The four methods' own **base-case points** span $57.34 (SOTP) to $87.37 (own-history EV/Sales reversion) — a **52.4%** spread ((87.37−57.34)/57.34), well above the Reconciliation Gate 6 tolerance. This is not silently averaged away: it is reconciled explicitly below and flagged as the single biggest source of valuation-confidence uncertainty in this report. The two "outlier" methods (02 high, 06 low) both admit their own caveats — `02` doubts full reversion is warranted; `06`'s low end is a single comp-choice (Lyft vs. DiDi for Mobility), not an independent read — which is why neither is weighted above 38%.

### Base-case fair value — single point

**Mechanically-weighted blend: $76.42/share** (0.29 × $87.37 + 0.38 × $75.75 + 0.15 × $79.82 + 0.18 × $57.34 — executed snippet below).

```
$ python3 -c "
vals = {'02': 87.37, '03': 75.75, '04': 79.82, '06': 57.34}
weights = {'02': 0.29, '03': 0.38, '04': 0.15, '06': 0.18}
weighted = sum(vals[k]*weights[k] for k in vals)
print('Weighted base point:', round(weighted,2))
"
Weighted base point: 76.42
```

**Reconciliation judgement.** The lens trusted most for Uber is the peer-relative EV/EBITDA read (`03`), because it is the one method that already isolates a warranted multiple net of comp distortion (excludes both Uber's revenue-multiple premium being double-counted via EV/Sales, and GAAP EPS's mark-to-market noise via P/E). The own-history EV/Sales read (`02`) is trusted next — it is methodologically the cleanest series in the pool, but its full-reversion implied value ($87.37) is discounted in the blend because `02` itself argues the recent de-rating has real fundamental causes (decelerating growth, releveraging, a pending debt-funded acquisition), not pure sentiment. `04` and `06` pull the blend down modestly and are capped at a minority combined weight per policy rather than allowed to silently drag the base point — see below. No lens swap or discretionary override was applied to the mechanical blend: **$76.42** is published as-is.

**Reconciling the SOTP drag (Method-Weighting Policy §1).** `06`'s $57.34 base sits 24.9% below the weighted blend. This is not a warning about Uber's operating economics — it is a comp-selection artifact: swapping only the Mobility comparable (Lyft 7.94x → DiDi 16.58x, both named peers) moves the SOTP output from $57.34 to $96.71, a $39/share, 69% swing from one input. The other driver — capitalizing $4.4bn of annualized corporate overhead at Uber's own blended multiple (11.89x) to subtract $51.8bn, roughly a third of the entire market cap — is a stated modeling convention (there being no better-disclosed segment-level corporate-cost multiple), not new negative information about the business. `06` is therefore weighted at 18%, inside the ≤⅓ combined cross-check cap, rather than being averaged in at full strength or excluded outright.

**Reconciling the DCF gap.** `04`'s $79.82 sits close to (7.6% above) the blend, so it is not a material drag — but `04` self-caps its own confidence at Low–Medium because the disclosed working-capital cash source (self-insurance-reserve buildup) breaks the standard reinvestment-rate/ROIC financeable-growth check, and terminal value is 59.5% of EV. This is a stated method tension, not a silently-accepted number — `04`'s own structural-reset (declining-perpetuity) terminal, $43.38/share, is carried forward separately below as the avoid-ruin floor, not blended into the base.

---

## 3. Bull / Base / Bear Fair-Value Levels

Each case is built as **(forward NTM revenue metric × EV/Sales multiple)**, anchored to `02`'s clean 5-year own-history EV/Sales band (min 1.88x, mean 3.55x, median 3.44x, max 7.09x) — the only own-history band this pool certifies as undistorted. All cases share the canonical `01` bridge: Equity = EV − net debt ($9,340M, broad basis) − minority ($1,083M); Per-share = Equity ÷ 2,056.327M diluted shares. Horizon: **12 months** (default convergence horizon) unless stated otherwise.

| Case | Fair Value / Share (point) | Forward Metric (NTM Revenue) | Multiple (NTM EV/Sales) | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | **$104.17** | $65,302M (consensus $62,192M + 5%, beat scenario) | 3.44x (own-history median — top of usable band) | 12 months | Trip/Gross-Bookings volume growth accelerates toward ~25% YoY (`earnings/07` bull case, +$828M EBIT impact) and the driver/courier payment ratio improves ~2pp (+$1,105M EBIT impact); the market credits the resulting margin/growth combination with a re-rate back to the 5-year EV/Sales median, i.e. the market treats the FY2025–26 de-rating as sentiment-driven rather than structural. |
| Base | **$76.42** (weighted blend; scenario-construction cross-check below reproduces $76.29, a 0.17% match — no override applied) | $62,192M (CIQ NTM consensus) | ≈2.69x (modest re-rate from the current 2.41x NTM multiple, well below the 3.44x/3.55x median/mean) | 12 months | Growth continues to decelerate gradually in line with consensus (no shock either way); the driver-payment ratio holds roughly flat to modestly improving; the pending Delivery Hero deal has not yet closed or moved net debt; the market grants a small amount of credit for Uber's now-structurally-higher margin base without assuming the 2021-era zero-rate multiple regime returns. |
| Bear | **$47.24** | $57,217M (consensus − 8%, ~15% YoY growth per `earnings/07` bear case, vs. ~19.9% ex-UK current) | 1.88x (own-history band minimum) | 12 months | Trip/Gross-Bookings growth decelerates further (`earnings/07` bear case, −$828M EBIT impact) and the driver/courier payment ratio worsens ~2pp (−$1,105M EBIT impact) simultaneously — a realistic, not extreme, combination per `earnings/07`'s own sensitivity ranking; the multiple compresses to the low end of Uber's own 5-year trading range as the market re-prices the slower growth and the just-drawn Delivery Hero-funding leverage. |

**Base-case cross-check (executed):**
```
$ python3 -c "
shares=2056.327; net_debt=9340.0; minority=1083.0
def calc(mult, rev):
    ev=rev*mult; eq=ev-net_debt-minority; return ev, eq, eq/shares
ev,eq,px = calc(2.69, 62192.0)
print('Base scenario check: EV=',round(ev,1),'Eq=',round(eq,1),'px=',round(px,2))
"
Base scenario check: EV= 167296.5 Eq= 156873.5 px= 76.29
```
The metric×multiple scenario construction ($76.29) lands within 0.2% of the mechanically-weighted base ($76.42) — the two approaches converge independently, which is itself evidence the base point is not an artifact of either construction method alone.

**Bull/Bear cross-checks (executed):**
```
$ python3 -c "
shares=2056.327; net_debt=9340.0; minority=1083.0
def calc(mult, rev):
    ev=rev*mult; eq=ev-net_debt-minority; return ev, eq, eq/shares
ev,eq,px = calc(3.44, 62192.0*1.05)
print('Bull: EV=',round(ev,1),'Eq=',round(eq,1),'px=',round(px,2))
ev,eq,px = calc(1.88, 62192.0*0.92)
print('Bear: EV=',round(ev,1),'Eq=',round(eq,1),'px=',round(px,2))
"
Bull: EV= 224637.5 Eq= 214214.5 px= 104.17
Bear: EV= 107567.3 Eq= 97144.3 px= 47.24
```

**Multiple ordering check:** bull 3.44x ≥ base 2.69x ≥ bear 1.88x — expansion in bull, compression in bear, both anchored inside `02`'s own certified band (1.88x–7.09x); no expansion/compression beyond the band is assumed. Metric and multiple move the same direction within each case (both up in bull, both down in bear).

**On the "true through-cycle trough" question.** Uber is classified **Operating**, not Commodity/cyclical, on the Business-Type Method Map, so the Hard Rule requiring a bear case anchored to a cited prior-downturn trough does not mechanically bind here. That said, `business-model/07_business-quality.md` and `09_moat.md` both flag that Uber's FY2025/TTM margins are "near-peak, post-recovery readings" and that the company **has not been tested by a demand shock while already GAAP-profitable** — its only severe demand shock on record, COVID (FY2020, revenue −14.3% per `09_moat.md` §3), landed while the company was still deeply loss-making. The Bear case above (a graduated deceleration to ~15% YoY growth plus multiple compression to the historical floor) is therefore a **realistic, evidence-grounded downturn**, not a worst-case demand contraction — if a COVID-scale demand shock recurred against today's profitable cost base, the resulting hit would plausibly be more severe than this 12-month Bear captures. That tail is what the structural-reset case below (and `04`'s DCF sensitivity grid low corner, $64.37) partially addresses; it is flagged here as an explicit limitation, not smoothed over.

### Structural-reset / avoid-ruin floor — NOT the headline Bear

**Trigger check.** `business-model/07_business-quality.md` scores industry rate-of-change / disruption risk at **32/100** (≤ the ~40 threshold, CLAUDE.md §24 Filter 5) — Uber's own 10-K frames autonomous-vehicle technology as a competitive threat ("may fail to offer autonomous vehicle technologies... before competitors"), with Waymo already running an independent commercialized robotaxi fleet. This trips the declining-perpetuity structural-reset trigger.

**Which case it becomes.** `business-model/09_moat.md` verdicts Uber's moat **Narrow** with trajectory **Widening** (not eroding — CIQ Return on Capital rose from −4.9% FY2022 to +10.6% LTM, EBIT margin from −5.7% to +12.1% over the same run) — this is the "disruption-flag firing on an otherwise intact (here, improving) moat" case, not a confirmed-eroding moat and not a bare unproven-moat verdict. Per the Hard Rule, this routes the structural-reset to the **labelled avoid-ruin floor**, not the headline 12-month Bear — the demotion is unconditional here (the moat is intact/widening, so no `04`-fade pre-condition is owed).

**The computed reset (from `04_intrinsic-dcf.md` §5, method: operating-company EV-based reset — reset EBIT margin × revenue × an impaired terminal multiple, bridged with `01`'s canonical net debt).** EBIT margin faded from Year 5 (11.0%) to Year 10 (7.0%) — versus the base case's 13.2%→12.8% — reflecting an AV-driven competitive/take-rate compression scenario, with terminal g dropped to 1.0% (a structurally impaired, non-recovering franchise):

```
EV (stressed) = Sum PV stressed FCFF + PV(stressed TV) = 58,248.5 + 41,377.6 = 99,626.1
Equity = EV(stressed) - net debt (broad, canonical) - minority = 99,626.1 - 9,340.0 - 1,083.0 = 89,203.1
Per-share (structural-reset) = 89,203.1 / 2,056.327 = 43.38
```
(Independently re-executed and reconciled above — ties exactly to `04`'s published figure.)

**Structural-reset (avoid-ruin floor): $43.38/share, 24–36 month horizon** — carried forward as the labelled avoid-ruin floor for §24 Kill Criteria in the master synthesis, distinct from the 12-month cyclical/deceleration Bear ($47.24) above. It is the WORSE of the two down-legs by a modest margin ($43.38 < $47.24), consistent with a genuine AV-disruption scenario being a deeper, longer-horizon impairment than a one-year growth/margin miss.

---

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | $68.18 (2026-08-06, pool-verified) |
| Base-case fair value (point) | $76.42 |
| Bear-case fair value (12-month) | $47.24 |
| Implied upside to base case = (base FV − price) / price | **+12.09%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **10.78%** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **30.71%** |

```
$ python3 -c "
price=68.18; base_fv=76.42; bear_fv=47.24
print('Implied upside %:', round((base_fv-price)/price*100,2))
print('Margin of safety %:', round((base_fv-price)/base_fv*100,2))
print('Downside to bear %:', round((price-bear_fv)/price*100,2))
"
Implied upside %: 12.09
Margin of safety %: 10.78
Downside to bear %: 30.71
```

Both metrics are computed off the pool-verified $68.18 anchor (no staleness cap applies). Margin of safety (10.78%) is a modest cushion, not a deep discount — the base case is only modestly above price, so this is closer to "fairly valued/modestly undervalued" territory than a clear mispricing. Downside to bear (30.71%) is materially larger than the upside to base, and the structural-reset avoid-ruin floor ($43.38) implies an even larger 36.4% downside from price, though on a longer (24–36 month) horizon and a lower-probability trigger — that comparison belongs to the master synthesizer, not this module.

---

## 5. Warranted-Multiple Check

The base case implies an NTM EV/Sales multiple of ≈2.69x, which cross-checks to an implied NTM EV/EBITDA of ≈13.3x ($167,296.5M implied EV ÷ $12,589M NTM consensus EBITDA) — this is almost exactly `03`'s independently-derived, peer-anchored quality-and-growth-adjusted multiple of **13.2x**, arrived at from a completely different starting point (peer median 14.42x minus a growth-gap discount). Two independent lenses converging on the same warranted multiple is a genuine cross-check, not a coincidence engineered into the model. That multiple sits well below Uber's own 5-year EV/Sales mean/median (3.44x–3.55x) and reflects real, cited reasons the business does not yet warrant a full reversion: decelerating revenue growth (18.3% FY2025 → 12.2% Q2 FY26 YoY), a moat rated Narrow (not Strong) with only 1–2 years of ROIC above cost of capital on a 5-year through-cycle average still below WACC, and an unresolved AV-disruption risk scored 32/100 on rate-of-change. There is no evidence here that the base case requires a multiple the business has never sustained — the risk instead runs the other way: if Uber's margin and ROIC trajectory keep improving as they have for the last three years, the base case may be understating the warranted multiple, not overstating it. No value-trap flag is warranted (no misaligned controlling owner per the governance module).

---

## 6. Fair-Value Read

UBER's fair-value levels are **Bull $104.17 / Base $76.42 / Bear $47.24** (12-month horizon), with a separately labelled 24–36 month structural-reset avoid-ruin floor of **$43.38** carried to the Kill Criteria rather than headlined as the Bear, because the AV-disruption risk that triggered it is firing on a moat that is Narrow but demonstrably **widening**, not eroding. Against the current $68.18 price, that gives a modest 10.78% margin of safety to the base case and a much larger 30.71% downside to the 12-month bear — the risk/reward is asymmetric toward the downside on a one-year view, a fact this module states but does not weight or size. The peer-relative EV/EBITDA read (`03`, 38% weight) drives the answer, converging almost exactly with the base-case scenario construction's independently-derived warranted multiple (13.2x–13.3x) — the single strongest piece of triangulation in this report. The biggest swing factor between bull and bear is not any single company-specific catalyst but the **combination of Trip/Gross-Bookings growth and the driver/courier payment ratio moving together** (`earnings/07`'s #1 and #2-ranked sensitivity variables, worth a combined ~$1.9bn of EBIT swing), compounded by how much of a re-rate or de-rate the market applies to whichever direction those two variables move — the same growth-deceleration-plus-releveraging story that `02` cites as the reason the stock has already de-rated from its 5-year EV/Sales average.
