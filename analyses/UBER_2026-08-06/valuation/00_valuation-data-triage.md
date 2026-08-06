# Valuation Data Triage — UBER

## 1. File Inventory

`data/UBER/` holds 13 source files. Five are multi-tab Capital IQ workbooks (`.xls`); the pool extractor (`extract_pool.py`) split these into 37 sheet-level extracts, 0 extraction failures across all 45 extract files [`_pool_extracts/manifest.md`]. Every tab is listed below as its own row per the workflow requirement — no workbook appears as a single opaque row.

| Filename / Tab | Type | Period Covered | Last Modified (pool-sync, not doc date) | Valuation Relevance |
|---|---|---|---|---|
| Charting Excel Export Aug-05-2026 2_49 PM.xls — Chart 1 with Data | Price chart export | Historical price series through Aug-05-2026 | 2026-08-06 (sync) | Medium (price history, not the anchor price) |
| Charting Excel Export Aug-05-2026 2_49 PM.xls — Attributions | Chart metadata | n/a | 2026-08-06 (sync) | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — Financial Data | Peer/comps export | LTM as of Aug-06-2026 | 2026-08-06 (sync) | High |
| Company Comparable Analysis Uber Technologies Inc.xls — Trading Multiples | Peer/comps + multiples export | LTM/NTM as-of 2026-08-06 | 2026-08-06 (sync) | High — 10-company comp set, current-price-anchored |
| Company Comparable Analysis Uber Technologies Inc.xls — Operating Statistics | Peer/comps export | LTM as of 2026-08-06 | 2026-08-06 (sync) | Medium |
| Company Comparable Analysis Uber Technologies Inc.xls — Business Description | Descriptive | n/a | 2026-08-06 (sync) | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — Implied Valuation | Multiples export (implied valuation from comps) | As of 2026-08-06 | 2026-08-06 (sync) | High |
| Company Comparable Analysis Uber Technologies Inc.xls — Valuation Chart | Chart data | As of 2026-08-06 | 2026-08-06 (sync) | Medium |
| Company Comparable Analysis Uber Technologies Inc.xls — Credit Health Panel | Capital-structure/credit export | FY2024–Mar-2026 | 2026-08-06 (sync) | Medium |
| Company Comparable Analysis Uber Technologies Inc.xls — Disclaimer | Boilerplate | n/a | 2026-08-06 (sync) | None |
| Company_Comparable_Analysis_Uber_Technologies _Inc.rtf | Duplicate narrative export of the comps workbook | As of 2026-08-06 | 2026-08-06 (sync) | Low (redundant with the .xls) |
| Uber Technologies Inc NYSE UBER Analyst Coverage.rtf | Analyst/consensus narrative | As of 2026-08-06 | 2026-08-06 (sync) | Medium |
| Uber Technologies Inc NYSE UBER Board Members.rtf | Governance roster | Current | 2026-08-06 (sync) | Low (not valuation-relevant) |
| Uber Technologies Inc NYSE UBER Financials.xls — Key Stats | Capital-structure + current price export | FY2022–LTM(Jun-30-2026)–FY2028E; current cap as of Aug-2026 | 2026-08-06 (sync) | High — current price ($68.18), shares out, EV bridge |
| Uber Technologies Inc NYSE UBER Financials.xls — Income Statement | Annual filing (vendor-parsed) | FY2020–FY2025 + Jun-30-2026 LTM | 2026-08-06 (sync) | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Balance Sheet | Capital-structure data | FY2020–FY2025 + Mar-31-2026 | 2026-08-06 (sync) | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Cash Flow | Cash flow statement | FY2020–FY2025 + Jun-30-2026 LTM | 2026-08-06 (sync) | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Multiples | Historical own-multiples export | Quarterly/annual through 2026 | 2026-08-06 (sync) | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Historical Capitalization | Capital-structure data (quarterly EV bridge) | 2024-12-31 to 2026-03-31 | 2026-08-06 (sync) | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Capital Structure Summary | Capital-structure data | FY2024–Mar-2026 | 2026-08-06 (sync) | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Capital Structure Details | Debt-instrument detail (convertibles, coupons, maturities) | FY2024–FY2025 | 2026-08-06 (sync) | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Ratios | Financial ratios / diluted share counts | FY2020–FY2025+ | 2026-08-06 (sync) | Medium-High |
| Uber Technologies Inc NYSE UBER Financials.xls — Supplemental | Supplemental line items | FY2020–FY2025 | 2026-08-06 (sync) | Low-Medium |
| Uber Technologies Inc NYSE UBER Financials.xls — Industry Specific | Industry KPIs | Sparse | 2026-08-06 (sync) | Low |
| Uber Technologies Inc NYSE UBER Financials.xls — Pension OPEB | Pension/OPEB | Sparse (n/a for Uber) | 2026-08-06 (sync) | None |
| Uber Technologies Inc NYSE UBER Financials.xls — Segments | Segment revenue/EBITDA | FY2020–FY2025 | 2026-08-06 (sync) | High — SOTP input |
| Uber Technologies Inc NYSE UBER Products.rtf | Descriptive (product/subsidiary list) | Current | 2026-08-06 (sync) | Low |
| Uber Technologies Inc NYSE UBER Professionals.rtf | Management roster | Current | 2026-08-06 (sync) | Low |
| Uber Technologies Inc NYSE UBER Public Company Profile.rtf | Combined export (description, key financials, stock quote, index membership) | As of Aug-06-2026 | 2026-08-06 (sync) | High (redundant current-price/cap confirmation) |
| Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.pdf | Earnings transcript | FQ2 2026 (qtr ended ~Jun-30-2026), call Aug-05-2026 | 2026-08-06 (sync) | High — guidance, management tone, forward color |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Consensus | Consensus/estimate export | FQ2 2026 actual/surprise; consensus through FY2027; consensus pulled 2026-08-05 10:04 GMT | 2026-08-06 (sync) | High — target price, EPS/EBITDA/revenue consensus |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Recent Changes | Estimate revisions | Recent | 2026-08-06 (sync) | Medium |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Guidance | Guidance vs. consensus | FY2026 guidance context | 2026-08-06 (sync) | Medium-High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Multiples | Forward multiples export | Consensus-based | 2026-08-06 (sync) | High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Surprise | Historical EPS/rev surprise | Trailing quarters | 2026-08-06 (sync) | Medium |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Trends | Estimate trend history | Trailing | 2026-08-06 (sync) | Medium |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Revisions | Analyst-level revisions | Trailing | 2026-08-06 (sync) | Low-Medium |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls (all 7 tabs) | **Duplicate** of the "(1)" workbook — identical row/col/cell counts confirmed across all 7 tabs [manifest.md] | Same as above | 2026-08-06 (sync) | Redundant — not double-counted |
| UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | Combined Capital IQ landscape export (description, key financials, stock quote, investor list) | FY2024–FY2025 actuals, Jun-30-2026 press release, FY2026–FY2028E | 2026-08-06 (sync) | High (cross-check for Key Stats) |

No `analyses/UBER_2026-08-06/_pool_extracts/ciq_facts.json` sidecar exists for this run (confirmed absent by directory listing) — there is nothing to reconcile against; all figures below are this agent's own sourced read of the extracts. There is no `data/UBER/external/` folder, so no externally-sourced (alt-data/broker/channel-check) documents are in this pool.

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States (NYSE: UBER) | "Uber Technologies, Inc. (NYSE:UBER)" throughout all Capital IQ exports; primary office San Francisco, CA [Public Company Profile.rtf; CIQReportLandscape.rtf] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | US-domestic issuer; Capital IQ "Restatement: Latest Filings" tabs cite "A[nnual filing] 2025 filed Feb-13-2026" — a US 10-K filing cadence [Financials.xls, Capital Structure Details tab] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | Stated explicitly: "Acctg. Standard: US GAAP" [UberTechnologies,IncNYSEUBEREstimatesReport.xls, Consensus tab] |
| Reporting currency (and scale) | USD, reported in millions (no lakh/crore scale) | "Currency: USD" across Income Statement, Balance Sheet, Cash Flow tabs [Financials.xls] |
| Fiscal-year end | December 31 | Periods run "12 months Dec-31-20XX"; "Current Fiscal Year End: Dec-31-2026" [Financials.xls; Consensus tab] |
| Document language(s) | English | All 13 source documents and 45 extracted tabs are in English |

No primary 10-K/10-Q sits in the data pool (confirmed by cross-check against `business-model/00_data-triage.md` §2 and `earnings/00_earnings-data-triage.md` §6) — all annual/quarterly financial detail is vendor-parsed by Capital IQ from the FY2025 10-K (filed 2026-02-13) and interim filings. Per CLAUDE.md §5/§4, this module cites these figures as the Capital IQ export (source tier 5), never as "10-K" or "10-Q," since the underlying filing text cannot be directly verified in this pool. This is a real gap (see §5/§6 below) but does not block valuation sufficiency, since Capital IQ exports are an explicitly acceptable tier-5 source for multiples, estimates, comps, and capital structure under this module's own source hierarchy.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (vendor-parsed; no primary 10-K in pool) | Uber Technologies Inc NYSE UBER Financials.xls — Income Statement / Balance Sheet | FY2025 (Dec-31-2025), filed 2026-02-13 per Capital Structure Details tab | ~6 months since filing; ~0 months since Capital IQ resync (2026-08-06) |
| Quarterly filing (vendor-parsed; no primary 10-Q in pool) | Uber Technologies Inc NYSE UBER Financials.xls — Balance Sheet / Historical Capitalization | Q1 FY2026 (Mar-31-2026) balance sheet; LTM column through Jun-30-2026 (press release) | ~1–4 months |
| Capital structure / balance sheet | Uber Technologies Inc NYSE UBER Financials.xls — Capital Structure Summary / Details | 3 months Mar-31-2026 (latest column); FY2025 debt-instrument detail | ~4 months |
| Consensus / estimate export | UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Consensus | Consensus pulled 2026-08-05 10:04 GMT; FQ2 2026 actual/surprise; estimates through FY2027 | 0 months (1 day old) |
| Multiples export | UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Multiples (forward) / Financials.xls — Multiples (historical/trailing) | As of 2026-08-05/06 | 0 months |
| Peer / comps export | Company Comparable Analysis Uber Technologies Inc.xls — Trading Multiples | "As-Of Date: 2026-08-06" | 0 months |
| Current price (Capital IQ) | Uber Technologies Inc NYSE UBER Financials.xls — Key Stats | Share Price $68.18, close as of Aug-05-2026 (cap table stated "current"); comps workbook confirms as-of 2026-08-06 | 0 months (0–1 day) |
| Cash flow statement | Uber Technologies Inc NYSE UBER Financials.xls — Cash Flow | FY2020–FY2025 annual + Jun-30-2026 LTM | 0–6 months |
| Segment data | Uber Technologies Inc NYSE UBER Financials.xls — Segments | FY2020–FY2025 annual (Mobility / Delivery / Freight) | ~6 months since latest annual segment disclosure; no interim segment P&L |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | Financials.xls, Key Stats tab: Share Price $68.18 (current cap table); Company Comparable Analysis.xls, Trading Multiples tab: "As-Of Date: 2026-08-06"; Consensus tab: "Latest Price/Last Close Price 69.48/68.18" — all mutually consistent and dated the same day/day before this run | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | Financials.xls, Income Statement tab: "Weighted Avg. Diluted Shares Out." 2087.98mm (FY2025); Ratios tab: diluted EPS series | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Y (partial) | Financials.xls, Capital Structure Details tab lists 2028 Convertible Notes ($1,725mm), 2028 Exchangeable Senior Notes ($1,125mm) with terms; Income Statement gives basic vs. diluted weighted-average share counts (treasury-method effect implicit in the diluted count, not separately itemized by strike price) | Needed for fully diluted per-share fair value; convertible terms are disclosed, but no separate options/RSU strike-price schedule is in the pool — diluted weighted-average count is usable per the Fully Diluted Equity Rules fallback |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y | Business-model cross-module confirms a two-sided asset-light marketplace (Mobility/Delivery/Freight) [`business-model/02_business-identity.md`, `03_segment-map.md`] — clearly an **Operating** company under the Method Map | Determines which valuation methods are valid |
| Total debt, cash, minority/preferred | Y | Financials.xls, Key Stats: Total Debt $14,731mm, Cash & ST Investments $5,391mm, Total Minority Interest $1,083mm, Pref. Equity "-" (none) | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | Financials.xls, Income Statement tab: FY2020–FY2025 + Jun-30-2026 LTM (Revenue $55,227mm LTM) | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | Financials.xls, Cash Flow tab: FY2020–FY2025 annual + Jun-30-2026 LTM | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | UberTechnologies,IncNYSEUBEREstimatesReport (1).xls, Consensus tab: NTM Revenue $62,192mm, NTM EBITDA $12,589mm, Target Price mean $102.03 (47 estimates); Guidance tab present | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | Financials.xls, Multiples tab (own-history quarterly/annual); EstimatesReport, Multiples tab (forward) | Own-history re-rating read |
| Peer / comps data | Y | Company Comparable Analysis Uber Technologies Inc.xls, Trading Multiples tab: 10-company comp set (LYFT, DASH, DIDI, CAR, HTZ, GRAB, and others) with LTM and NTM multiples, dated 2026-08-06 | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT (EBITDA) | Y | Financials.xls, Segments tab: Mobility/Delivery/Freight revenue and EBITDA, FY2020–FY2025 (annual only, no interim segment P&L) | Sum-of-the-parts |
| Dividend / buyback data | Y (buybacks only; no dividend) | Financials.xls, Cash Flow tab: "Repurchase of Common Stock" -$6,904mm (FY2025); "Total Dividends Paid" and "Special Dividend Paid" both blank/"-" across all years — Uber pays no dividend | Shareholder-yield read |

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

All ten cross-module files exist under `analyses/UBER_2026-08-06/business-model/` and `analyses/UBER_2026-08-06/earnings/` (both modules completed their full 00–99 run before valuation started). `management-governance/04_ownership-and-insider-behavior.md` and `99_management-governance-synthesis.md` are also present in the run root and should be read by `07`/`99` for the §24 Filter 6 unaligned-owner check, though that module is not formally required by this module's Cross-Module Inputs list.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N — a current, pool-verified Capital IQ price ($68.18, as of Aug-05/06-2026) is present and internally consistent across three independent exports | 01, 05, 07, 99 | Not applicable |
| No consensus / forward estimates | N — full consensus (target price, EPS/EBITDA/revenue NTM and through FY2027–FY2028) is present and 0–1 days old | 02, 03, 04, 05 | Not applicable |
| No peer data | N — a 10-company comp set with LTM and NTM multiples, dated 2026-08-06, is present | 03, 06 | Not applicable |
| No segment-level data | N — Mobility/Delivery/Freight revenue and EBITDA are disclosed annually FY2020–FY2025 | 06 | Not applicable |
| No balance sheet / capital structure | N — full balance sheet, debt-instrument detail (including convertible/exchangeable notes), and quarterly cap tables through Mar-31-2026 are present | 01, 04, 06 | Not applicable |
| No cash flow statement | N — full cash flow statement FY2020–FY2025 + LTM Jun-30-2026 is present | 04 | Not applicable |

No partial-data caps from the standard six-row table bind. The one real gap in this pool — **no primary 10-K/10-Q document**, only Capital IQ vendor-parsed figures — is not one of the six rows above (it is a source-tier issue, not a missing-data-category issue) and does not trip any Score-Cap Rule in `MODULE_RULES.md`'s table either, since Capital IQ exports for multiples/estimates/comps/capital-structure are an explicitly acceptable tier-5 source. It is flagged here so downstream agents cite these figures as "Capital IQ export," never as "10-K"/"10-Q" (per CLAUDE.md §5 and the earnings/business-model modules' own triage notes), and so a future data refresh prioritizes adding the primary filing.

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Financials.xls Multiples tab gives quarterly/annual own-history EV/EBITDA, P/E, etc.; current price and forward consensus both present to compute NTM multiples |
| Peer relative valuation | Y | None | 10-company comp set (Company Comparable Analysis workbook), LTM and NTM bases, dated same-day as this triage |
| Intrinsic DCF (Operating FCFF) | Y | None | Full income statement, balance sheet, and cash flow statement (FY2020–FY2025 + LTM) support a CFO − capex FCFF build; consensus provides the near-term forecast path |
| Reverse DCF | Y (conditional on `04` running first) | Depends on `04`'s canonical WACC + FCF base per Reconciliation/DCF Standard 9 | Current price is pool-verified, so "what's priced in" is answerable once `04` publishes |
| SOTP | Y | None | Mobility/Delivery/Freight revenue and EBITDA disclosed annually; peer comp set gives segment-adjacent comparables (e.g., DASH for Delivery, LYFT/GRAB for Mobility); note per `business-model/03_segment-map.md` that a pending Delivery Hero acquisition (announced on the Q2 2026 call) may change the segment structure going forward — flag for `06` |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A full income statement, balance sheet, and cash flow statement (Capital IQ export, FY2020–FY2025 plus a Jun-30-2026 LTM column) exist alongside a pool-verified, same-day current price, a fresh consensus/estimate export, a 10-company peer comp set, and annual segment-level revenue/EBITDA — all five valuation methods (own-history multiples, peer relative, DCF, reverse-DCF, SOTP) can run.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic DCF (FCFF), reverse-DCF (after `04`), sum-of-the-parts.
- **Active partial-data caps:** None from the standard six-row Partial-Data table.
- **Critical missing items:** None that block sufficiency. Note for downstream agents: no primary 10-K/10-Q sits in the pool — every historical financial and segment figure must be cited as a Capital IQ export (tier 5), never attributed to the 10-K/10-Q by name, and a pending Delivery Hero acquisition (disclosed on the Q2 2026 call) may reshape the Delivery segment and should be flagged as a structural watch-item in `06_sum-of-the-parts` and `07_scenario-and-fair-value`.
