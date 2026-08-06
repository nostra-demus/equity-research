# Earnings Data Triage — UBER

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | "Uber Technologies, Inc. (NYSE:UBER)"; primary office 1725 3rd Street, San Francisco, CA [Public Company Profile.rtf] |
| Exchange | NYSE | Ticker "UBER (NYSE)" [Public Company Profile.rtf] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC (10-K / 10-Q / 8-K cadence) | No 10-K/10-Q document itself is IN this pool — only vendor (Capital IQ) exports and the earnings-call transcript. Capital IQ's "Restatement: Latest Filings" tabs and the Segments tab's "Filing Date" row (e.g. 2026-02-13 for FY2025) confirm a US annual-filing cadence consistent with a 10-K [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | "Consolidation: Consolidated / Acctg. Standard: US GAAP" stated explicitly in the Estimates Report workbook (Consensus, Guidance, Surprise, Trends tabs) [UberTechnologies,IncNYSEUBEREstimatesReport (1).xls, Consensus tab] |
| Reporting currency | USD | "Currency: USD" on Income Statement / Balance Sheet / Cash Flow tabs [Uber Technologies Inc NYSE UBER Financials.xls] |
| Fiscal-year end | December 31 | "Current Fiscal Year End: Dec-31-2026"; annual periods run "12 months Dec-31-20XX" [Financials.xls, Income Statement tab; Estimates Report, Consensus tab] |
| Document language(s) | English | All 13 source files / 45 extracted tabs are in English |

**Critical caveat carried forward:** No primary SEC filing (10-K, 10-Q, 8-K) is present in the data pool — every income statement, balance sheet, and cash flow figure is sourced from Capital IQ's vendor transcription of those filings (source-hierarchy tier 5, §4), not the filing itself. The business-model module's `00_data-triage.md` flags the identical gap. Downstream earnings agents must cite these figures as Capital IQ exports, not as "10-K" or "10-Q," and should treat the CIQ workbook's own labelled "LTM / Press Release Jun-30-2026" column as the closest available proxy for the FQ2 2026 quarterly filing.

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified (pool sync date — not authoritative, §23/F23) | Earnings Relevance |
|---|---|---|---|---|
| Charting Excel Export Aug-05-2026 2_49 PM.xls — Chart 1 with Data | data export | Multi-year daily price series through Aug-05-2026 | 2026-08-06 | Low |
| Charting Excel Export Aug-05-2026 2_49 PM.xls — Attributions | data export | n/a (source attribution list) | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — Financial Data | data export (peer comps) | As-Of Date 2026-08-06; peer LTM figures dated Apr–Aug 2026 | 2026-08-06 | Low (peer set, not Uber's own detail) |
| Company Comparable Analysis Uber Technologies Inc.xls — Trading Multiples | data export (peer comps) | As of 2026-08-06 | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — Operating Statistics | data export (peer comps) | As of 2026-08-06 | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — Business Description | data export | Undated narrative | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — Implied Valuation | data export | As of 2026-08-06 | 2026-08-06 | Low (out of module scope — valuation) |
| Company Comparable Analysis Uber Technologies Inc.xls — Valuation Chart | data export | As of 2026-08-06 | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — Credit Health Panel | data export | LTM, as of 2026-08-06 | 2026-08-06 | Medium (leverage/coverage feeds earnings-quality/cash context) |
| Company Comparable Analysis Uber Technologies Inc.xls — Disclaimer | data export | n/a | 2026-08-06 | Low |
| Company_Comparable_Analysis_Uber_Technologies _Inc.rtf | data export (rtf render of same workbook) | As of 2026-08-06 | 2026-08-06 | Low (duplicate of Company Comparable Analysis.xls content) |
| Uber Technologies Inc NYSE UBER Analyst Coverage.rtf | data export (analyst roster) | Current sell-side roster, targets/ratings as of pool date | 2026-08-06 | Medium — consensus-setup context ONLY; per-analyst Rating/Target Price is verdict-bearing and must be stripped (§24) before use |
| Uber Technologies Inc NYSE UBER Board Members.rtf | governance data export | Current board roster | 2026-08-06 | Low (not earnings-relevant) |
| Uber Technologies Inc NYSE UBER Financials.xls — Key Stats | data export | Annual/LTM, latest column Jun-30-2026 | 2026-08-06 | Medium |
| Uber Technologies Inc NYSE UBER Financials.xls — Income Statement | data export | Annual FY2021–FY2025 + LTM "Press Release Jun-30-2026" | 2026-08-06 | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Balance Sheet | data export | FY2021–FY2025 year-end + "Press Release Jun-30-2026" | 2026-08-06 | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Cash Flow | data export | Annual FY2021–FY2025 + LTM "Press Release Jun-30-2026" | 2026-08-06 | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Multiples | data export | Annual/LTM through Jun-30-2026 | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Financials.xls — Historical Capitalization | data export | Historical, through recent | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Financials.xls — Capital Structure Summary | data export | Through recent | 2026-08-06 | Medium (debt load feeds interest-expense driver) |
| Uber Technologies Inc NYSE UBER Financials.xls — Capital Structure Details | data export | Through recent, incl. filing-date markers | 2026-08-06 | Medium |
| Uber Technologies Inc NYSE UBER Financials.xls — Ratios | data export | Annual/LTM through Jun-30-2026 | 2026-08-06 | Medium |
| Uber Technologies Inc NYSE UBER Financials.xls — Supplemental | data export | Annual/LTM | 2026-08-06 | Medium |
| Uber Technologies Inc NYSE UBER Financials.xls — Industry Specific | data export | Sparse | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Financials.xls — Pension OPEB | data export | Sparse/not applicable | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Financials.xls — Segments | data export | Annual FY2020–FY2025 only (no LTM/interim column) | 2026-08-06 | High, but stale by ~2 quarters vs the Jun-30-2026 period-end — flag for `02_revenue-drivers` |
| Uber Technologies Inc NYSE UBER Products.rtf | data export (business description) | Undated narrative | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Professionals.rtf | data export (management bios) | Current roster | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Public Company Profile.rtf | data export (company profile / market data) | Price/market data as of Aug-05/06-2026 | 2026-08-06 | Medium (current price $69.48, market cap, shares out.) |
| Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.pdf | **VERBATIM earnings transcript** (S&P Global Market Intelligence / CIQ) | FQ2 2026 (quarter ended Jun-30-2026), call held Aug-05-2026, prepared remarks + Q&A | 2026-08-06 | **High** |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Consensus | consensus/estimate export | Current-quarter/year/NTM as of Aug-05/06-2026 | 2026-08-06 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Recent Changes | estimate-revision export | Recent revision snapshots | 2026-08-06 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Guidance | guidance data export | Quarterly guidance-vs-actual, FQ1 2019–FQ3 2026 | 2026-08-06 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Multiples | consensus/estimate export | As of pool date | 2026-08-06 | Low |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Surprise | consensus/estimate export | Quarterly, FQ1 2019–FQ2 2026 (30 quarters) + annual 2018–2025 | 2026-08-06 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Trends | estimate-revision export | Forward FQ3 2026–FY2035, with 1/2/3/6/9/12/18-month-ago revision snapshots | 2026-08-06 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Revisions | estimate-revision export | Revision history | 2026-08-06 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Consensus | consensus/estimate export | **Duplicate of the "(1)" workbook above** — identical row/col/cell counts | 2026-08-06 | High (but redundant; do not double-count) |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Recent Changes | estimate-revision export | Duplicate | 2026-08-06 | High (redundant) |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Guidance | guidance data export | Duplicate | 2026-08-06 | High (redundant) |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Multiples | consensus/estimate export | Duplicate | 2026-08-06 | Low |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Surprise | consensus/estimate export | Duplicate | 2026-08-06 | High (redundant) |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Trends | estimate-revision export | Duplicate | 2026-08-06 | High (redundant) |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Revisions | estimate-revision export | Duplicate | 2026-08-06 | High (redundant) |
| UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | CIQ daily-digest / broad company report (news + comps blend) | Dated entries through Aug-06-2026 02:49 AM | 2026-08-06 | Medium — contains a dated headline ("Uber Technologies reports moderating growth, issues soft forecast," Aug-05/06-2026) that is directionally useful market-reaction context but is a TMT-sector news digest, not an Uber-dedicated earnings source; treat any specific claim from it as `Web: dated, unverified` unless corroborated in the transcript/CIQ financials |

**Note on duplication:** the two "EstimatesReport" workbooks (`...Report.xls` and `...Report (1).xls`) are identical exports — same row/col/cell counts across all 7 tabs. They are counted once for sufficiency purposes; downstream agents should not treat them as two independent sources.

## 1A. External Data

No `data/UBER/external/` directory exists in this pool. No externally sourced research (alt-data panels, expert calls, channel checks, broker research, paid-API pulls) is present. Not applicable.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | *None present* — closest is the CIQ "equivalent full-year financials" export | FY2025 (year ended Dec-31-2025); filing-date marker 2026-02-13 | ~6 months since filing date; ~7–8 months since period-end |
| Quarterly filing | *None present* — no 10-Q in pool | Closest proxy: CIQ "LTM / Press Release Jun-30-2026" column (quarter ended Jun-30-2026) | ~1 month since period-end (period end Jun-30-2026 vs today Aug-06-2026) |
| Earnings transcript | Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.pdf | FQ2 2026 (quarter ended Jun-30-2026), call Aug-05-2026 | 0 months (1 day old) |
| Investor deck | *None present* | — | — |
| Consensus / estimate export | UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Consensus tab | Current quarter FQ3 2026, current year FY2026, NTM; consensus "as of Aug-05-2026 10:04 AM GMT" | 0 months |
| Cash flow data | Uber Technologies Inc NYSE UBER Financials.xls — Cash Flow tab | Annual through FY2025 + LTM "Press Release Jun-30-2026" | 0–1 month (LTM column) |
| Guidance data | UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Guidance tab | FQ3 2026 guidance issued 2026-08-05 (EPS 0.84–0.88) | 0 months (1 day old) |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | Financials.xls, Income Statement tab (annual FY2021–FY2025 + LTM Jun-30-2026) | Needed for revenue, margin, EPS |
| Balance sheet | Y | Financials.xls, Balance Sheet tab (annual FY2021–FY2025 + Jun-30-2026 press-release column) | Needed for working capital and leverage |
| Cash flow statement | Y | Financials.xls, Cash Flow tab (annual FY2021–FY2025 + LTM Jun-30-2026) | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y (via vendor export, not a filed 10-Q) | Estimates Report, Surprise tab — FQ2 2026 actual EPS 1.17, Revenue $14,191mm vs consensus $14,265.78mm; Financials.xls "Press Release Jun-30-2026" column | Needed for trend and setup |
| Last 8 quarters | Y | Estimates Report, Surprise tab — quarterly Revenue/EBITDA/EPS surprise from FQ1 2019 through FQ2 2026 (30 quarters) | Needed for seasonality and inflection |
| Consensus estimates | Y | Estimates Report, Consensus tab — mean/median/high-low/std dev/# estimates for target price, LT growth; current-quarter/year/NTM EPS, Revenue, EBITDA | Needed for market bar |
| Estimate revisions | Y | Estimates Report, Trends & Revisions tabs — 1/2/3/6/9/12/18-month-ago revision snapshots through FY2035 | Needed for revision momentum |
| Earnings transcript | Y — verbatim | Uber, Inc., Q2 2026 Earnings Call, Aug 05, 2026.pdf (S&P Global Market Intelligence transcript; prepared remarks + Q&A, participants incl. CEO Dara Khosrowshahi, CFO Balaji Krishnamurthy) | Needed for management tone and driver detail |
| Segment P&L | Y, but annual-only (stale ~2 quarters) | Financials.xls, Segments tab — Mobility / Delivery / Freight revenue and EBITDA, FY2020–FY2025 only; no interim/LTM column | Needed for mix shift |
| Current price | Y | Public Company Profile.rtf — Last (Delayed) $69.48, Market Cap $139,261.7mm, as of pool date | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y — `analyses/UBER_2026-08-06/business-model/03_segment-map.md` exists |
| 06_value-chain.md | Y — `analyses/UBER_2026-08-06/business-model/06_value-chain.md` exists |
| 10_external-dependency.md | Y — `analyses/UBER_2026-08-06/business-model/10_external-dependency.md` exists |

The full business-model module (00–12, 99, and dossier) has completed for this ticker and is available for the earnings module to read.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus is present and current (as of Aug-05-2026) | 04, 05, 99 | Not applicable |
| No quarterly data | N — quarterly actuals/surprise exist for 30 quarters via the Estimates Report Surprise tab, and a "Press Release Jun-30-2026" quarter-end column exists in Financials.xls; however no primary 10-Q/quarterly filing itself is in the pool | 01, 02, 03, 06 | None from this trigger; see the standalone "no primary filing" caveat in §0 instead |
| No VERBATIM transcript, sell-side proxy present | N — a verbatim transcript IS present | 02, 03, 04 | Not applicable |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | Not applicable |
| No segment-level P&L | N — segment P&L exists, but only at annual granularity (FY2020–FY2025), not for the Jun-30-2026 interim/LTM period | 02, 03, 99 | Apply the "No segment-level P&L for multi-segment business" clarity cap (Earnings clarity max 70) only for the CURRENT-QUARTER mix-shift read, since the segment table itself is ~2 quarters stale; annual-period segment analysis is unaffected |
| No cash flow statement | N | 06, 99 | Not applicable |
| No current price | N | 99 | Not applicable |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has a verbatim, one-day-old Q2 FY2026 earnings-call transcript (Aug-05-2026), current consensus/guidance/revision data (as of Aug-05/06-2026), and a full income statement, balance sheet, and cash flow statement (Capital IQ export, annual FY2021–FY2025 plus a Jun-30-2026 LTM/press-release column) — meeting the letter of the sufficiency rule (equivalent full-year financials + verbatim transcript + all three core statements).
- **Active partial-data caps:**
  - Segment P&L is annual-only (FY2020–FY2025, no interim column) — cap segment/mix-shift clarity for the CURRENT quarter specifically at Earnings clarity max 70 per the "no segment-level P&L" trigger; annual-period segment reads are unaffected.
- **Critical missing items:**
  - No primary SEC filing (10-K, 10-Q, or 8-K/press release) is present anywhere in the pool. Every income-statement, balance-sheet, and cash-flow figure is sourced from a Capital IQ vendor export (source-hierarchy tier 5, §4), not from the audited/regulatory filing itself. This does not trip the module's "only CIQ exports, no filing AND no transcript" downgrade trigger (a verbatim transcript is present), but every downstream agent must cite these numbers as Capital IQ exports — never as "10-K" or "10-Q" — and should flag this gap in its own evidence notes.
  - No investor presentation / earnings deck is in the pool.
  - The two "EstimatesReport" workbooks are exact duplicates; treat as one source, not two.
