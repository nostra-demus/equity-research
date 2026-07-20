# Earnings Data Triage — NHY

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | Norway | Company incorporated 1905 in NO, HQ Oslo [NorskHydroASAOBNHY_PublicCompany.pdf] |
| Exchange | Oslo Børs (ticker OB:NHY); also OTC in the US (OTCPK:NHYD.Y ADR) | [NorskHydroASAOBNHYEstimatesReport.xls, Trends tab header "OTCPK:NHYD.Y (USD)"] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | Other — Norwegian statutory reporting (Oslo Børs continuing obligations / Norwegian Accounting Act), not US SEC or India SEBI-LODR | "prepared in accordance with the Norwegian Accounting Act" [Integrated Annual Report 2025, p. ~9589-region]; "Quarterly report...approved by the Board of Directors on 28 April 2026" [First Quarter Report 2026, p.1] |
| Reporting standard (US GAAP / IFRS / Ind AS) | IFRS Accounting Standards as adopted by the EU (consolidated); parent-company standalone accounts under the Norwegian Accounting Act | "consolidated financial statements...prepared in accordance with IFRS" and "prepared in accordance with IFRS® Accounting Standards as adopted by the EU" [Integrated Annual Report 2025] |
| Reporting currency | Norwegian Krone (NOK), millions | "Currency NOK" throughout Financials.xls, EstimatesReport.xls, and both filings |
| Fiscal-year end | 31 December | "Current Fiscal Year End: Dec-31-2026" [EstimatesReport.xls, Consensus tab]; FY2025 = year ended 31 Dec 2025 |
| Document language(s) | English (all documents in the pool are in English; no translation required) | — |

Norsk Hydro is a Norwegian company reporting under IFRS-EU in NOK, filing a Board-approved Quarterly Report (Oslo Børs continuing-obligations equivalent of a 10-Q/6-K) and an Integrated Annual Report (10-K/Annual Report equivalent). No US SEC or India SEBI-LODR forms apply and none are expected — this is not a data gap (CLAUDE.md §27).

## 1. External Data

No files exist under `data/NHY/external/`. No external documents to inventory; this has no effect on the sufficiency verdict.

## 2. File Inventory

| Filename | Type | Period Covered | Last Modified* | Earnings Relevance |
|---|---|---|---|---|
| integrated-annual-report-2025.pdf | Annual filing (Integrated Annual Report, IFRS) | FY2025 (year ended 31-Dec-2025), with FY2021-FY2025 comparatives | 2026-07-18 (sync date; document is FY2025, period-end 31-Dec-2025 per §23) | High |
| first-quarter-report-2026.pdf | Quarterly filing (Board-approved Quarterly Report) | Q1 2026 (ended 31-Mar-2026), with Q1 2025 and Q4 2025 comparatives | 2026-07-18 (sync date; document approved 28-Apr-2026) | High |
| Norsk Hydro ASA, Q1 2026 Earnings Call, Apr 29, 2026.pdf | Verbatim transcript (CIQ / S&P Global Market Intelligence) | FQ1 2026 call, 29-Apr-2026 | 2026-07-18 (sync date; call date 29-Apr-2026) | High |
| Norsk Hydro ASA, Q4 2025 Earnings Call, Feb 13, 2026.pdf | Verbatim transcript (CIQ / S&P Global Market Intelligence) | FQ4 2025 call, 13-Feb-2026 | 2026-07-18 (sync date; call date 13-Feb-2026) | High |
| nhy-presentation-q1-2026.pdf | Investor deck (results presentation) | Q1 2026, with Q1 25-Q1 26 quarterly trend charts | 2026-07-18 (sync date; deck dated Q1 2026) | Medium-High |
| nhy-investor-day-2025.pdf | Investor deck (strategy / investor day) | 2025 (undated within-year strategy content, not a quarterly earnings artifact) | 2026-07-18 (sync date) | Medium |
| NorskHydroASAOBNHYEstimatesReport.xls — Consensus tab | Consensus/estimate export | Consensus as of Apr-29-2026 (current quarter FQ2 2026, release date Jul-22-2026) | 2026-07-18 (sync date) | High |
| NorskHydroASAOBNHYEstimatesReport.xls — Recent Changes tab | Consensus/estimate export (recent estimate changes) | Rolling, current as of extraction | 2026-07-18 (sync date) | Medium |
| NorskHydroASAOBNHYEstimatesReport.xls — Guidance tab | Guidance data (management/consensus guidance history, capex etc.) | FQ2 2008 - FY2030 (historical guidance series) | 2026-07-18 (sync date) | High |
| NorskHydroASAOBNHYEstimatesReport.xls — Multiples tab | Consensus/estimate export (valuation multiples) | Current | 2026-07-18 (sync date) | Low (out of earnings scope) |
| NorskHydroASAOBNHYEstimatesReport.xls — Surprise tab | Consensus/estimate export (historical EPS/revenue surprise) | Multi-quarter/annual history through FQ1 2026 | 2026-07-18 (sync date) | High |
| NorskHydroASAOBNHYEstimatesReport.xls — Trends tab | Consensus/estimate export (estimate trend over time) | FQ2 2026 - FY2029, with 1/2/3/6/9/12/18-months-ago snapshots | 2026-07-18 (sync date) | High |
| NorskHydroASAOBNHYEstimatesReport.xls — Revisions tab | Consensus/estimate export (estimate revision counts, up/down) | FQ2 2026 - FY2029, Last Month/2 Months/3 Months windows | 2026-07-18 (sync date) | High |
| NorskHydroASAOBNHYEstimatesReport (1).xls — Consensus tab | Consensus/estimate export (duplicate of above, different file size — appears to be a second export/refresh) | Same structure as above | 2026-07-18 (sync date) | High (duplicate, see note) |
| NorskHydroASAOBNHYEstimatesReport (1).xls — Recent Changes tab | Consensus/estimate export (duplicate) | Same structure as above | 2026-07-18 (sync date) | Medium |
| NorskHydroASAOBNHYEstimatesReport (1).xls — Guidance tab | Guidance data (duplicate) | Same structure as above | 2026-07-18 (sync date) | High |
| NorskHydroASAOBNHYEstimatesReport (1).xls — Multiples tab | Consensus/estimate export (duplicate) | Same structure as above | 2026-07-18 (sync date) | Low |
| NorskHydroASAOBNHYEstimatesReport (1).xls — Surprise tab | Consensus/estimate export (duplicate) | Same structure as above | 2026-07-18 (sync date) | High |
| NorskHydroASAOBNHYEstimatesReport (1).xls — Trends tab | Consensus/estimate export (duplicate) | Same structure as above | 2026-07-18 (sync date) | High |
| NorskHydroASAOBNHYEstimatesReport (1).xls — Revisions tab | Consensus/estimate export (duplicate) | Same structure as above | 2026-07-18 (sync date) | High |
| Norsk Hydro ASA OB NHY Financials.xls — Key Stats tab | Data export (CIQ, annual, FY2022-FY2025A + LTM Mar-2026 + FY2026-28E) | FY2022-LTM Mar-2026 actuals, FY2026-28 estimates | 2026-07-18 (sync date) | High |
| Norsk Hydro ASA OB NHY Financials.xls — Income Statement tab | Data export (CIQ, annual, income statement) | FY2021-FY2025A + LTM Mar-2026, annual periods only (no quarterly breakout) | 2026-07-18 (sync date) | High |
| Norsk Hydro ASA OB NHY Financials.xls — Balance Sheet tab | Data export (CIQ, annual, balance sheet) | FY2021-FY2025A + LTM/latest, annual periods only | 2026-07-18 (sync date) | High |
| Norsk Hydro ASA OB NHY Financials.xls — Cash Flow tab | Data export (CIQ, annual, cash flow) | FY2021-FY2025A + LTM Mar-2026, annual periods only | 2026-07-18 (sync date) | High |
| Norsk Hydro ASA OB NHY Financials.xls — Multiples tab | Data export (CIQ valuation multiples) | Annual | 2026-07-18 (sync date) | Low |
| Norsk Hydro ASA OB NHY Financials.xls — Historical Capitalization tab | Data export (CIQ capitalization history) | Historical | 2026-07-18 (sync date) | Low |
| Norsk Hydro ASA OB NHY Financials.xls — Capital Structure Summary tab | Data export (CIQ capital structure) | Current/historical | 2026-07-18 (sync date) | Medium |
| Norsk Hydro ASA OB NHY Financials.xls — Capital Structure Details tab | Data export (CIQ debt detail) | Current | 2026-07-18 (sync date) | Low (out of earnings scope) |
| Norsk Hydro ASA OB NHY Financials.xls — Ratios tab | Data export (CIQ financial ratios) | Annual history | 2026-07-18 (sync date) | Medium |
| Norsk Hydro ASA OB NHY Financials.xls — Supplemental tab | Data export (CIQ supplemental data) | Annual | 2026-07-18 (sync date) | Low |
| Norsk Hydro ASA OB NHY Financials.xls — Industry Specific tab | Data export (CIQ industry-specific metrics) | Annual | 2026-07-18 (sync date) | Medium |
| Norsk Hydro ASA OB NHY Financials.xls — Pension OPEB tab | Data export (CIQ pension/OPEB detail) | Annual | 2026-07-18 (sync date) | Low (out of earnings scope) |
| Norsk Hydro ASA OB NHY Financials.xls — Segments tab | Data export (CIQ segment P&L: revenue, EBITDA, EBIT by segment) | FY2020-FY2025, annual only | 2026-07-18 (sync date) | High |
| Norsk Hydro ASA OB NHY Products.xls — Products tab | Data export (product/subsidiary listing) | Current | 2026-07-18 (sync date) | Low (out of earnings scope) |
| Company Comparable Analysis Norsk Hydro ASA.xls — Financial Data tab | Data export (peer comps, financial data) | Current/historical | 2026-07-18 (sync date) | Low (out of earnings scope, peer comp) |
| Company Comparable Analysis Norsk Hydro ASA.xls — Trading Multiples tab | Data export (peer comps, trading multiples) | Current | 2026-07-18 (sync date) | Low |
| Company Comparable Analysis Norsk Hydro ASA.xls — Operating Statistics tab | Data export (peer comps, operating stats) | Current | 2026-07-18 (sync date) | Low |
| Company Comparable Analysis Norsk Hydro ASA.xls — Business Description tab | Data export (peer comp business descriptions) | Current | 2026-07-18 (sync date) | Low |
| Company Comparable Analysis Norsk Hydro ASA.xls — Implied Valuation tab | Data export (peer comp implied valuation) | Current | 2026-07-18 (sync date) | Low (out of earnings scope) |
| Company Comparable Analysis Norsk Hydro ASA.xls — Valuation Chart tab | Data export (peer comp chart data) | Current | 2026-07-18 (sync date) | Low |
| Company Comparable Analysis Norsk Hydro ASA.xls — Credit Health Panel tab | Data export (peer comp credit metrics) | Current | 2026-07-18 (sync date) | Low (out of earnings scope) |
| Company Comparable Analysis Norsk Hydro ASA.xls — Disclaimer tab | Data export (boilerplate) | n/a | 2026-07-18 (sync date) | None |
| NorskHydroASAOBNHY_PublicCompany.pdf | Data export (CIQ company profile: description, credit rating, employees) | Current snapshot | 2026-07-18 (sync date) | Low (context, out of earnings scope) |
| Norsk Hydro ASA OB NHY Board Members.rtf | Data export (board roster) | Current | 2026-07-18 (sync date) | None (out of earnings scope) |
| Norsk Hydro ASA OB NHY Customers.rtf | Data export (customer listing) | Current | 2026-07-18 (sync date) | Low (out of earnings scope) |

\* All "Last Modified" values reflect the Drive-sync timestamp (2026-07-18), not the document's actual period-end — per CLAUDE.md fix F23, the real period is taken from inside each document (stated in the "Period Covered" column).

**Duplicate estimates workbook note:** `NorskHydroASAOBNHYEstimatesReport.xls` and `NorskHydroASAOBNHYEstimatesReport (1).xls` are two copies of the same 7-tab consensus/estimates workbook (same tab structure, same row/column dimensions) but differ in byte size (7,464,898 vs 7,464,940 bytes), so they are not byte-identical — likely two exports/refreshes rather than a single duplicate. Both extracted cleanly with 0 failures. Downstream agents should treat them as one consensus source and use `NorskHydroASAOBNHYEstimatesReport.xls` as primary (no evidence either is fresher; content spot-checked as identical in the Consensus tab header).

## 3. Most Recent Sources

| Source Type | Filename | Period | Age (months, vs 2026-07-19) |
|---|---|---|---|
| Annual filing | integrated-annual-report-2025.pdf | FY2025 (ended 31-Dec-2025) | ~6.6 months since period-end |
| Quarterly filing | first-quarter-report-2026.pdf | Q1 2026 (ended 31-Mar-2026) | ~3.6 months since period-end |
| Earnings transcript | Norsk Hydro ASA, Q1 2026 Earnings Call, Apr 29, 2026.pdf | FQ1 2026 call | ~2.7 months since call |
| Investor deck | nhy-presentation-q1-2026.pdf | Q1 2026 results deck | ~3.6 months since period-end |
| Consensus / estimate export | NorskHydroASAOBNHYEstimatesReport.xls, Consensus tab | Consensus as of Apr-29-2026, next release FQ2 2026 (Jul-22-2026) | ~2.9 months old (data-as-of Apr-29-2026, predates Q1 2026 results being fully digested into FQ2 estimates but does reflect the FQ1 2026 actual/surprise) |
| Cash flow data | Norsk Hydro ASA OB NHY Financials.xls, Cash Flow tab (annual through LTM Mar-2026) + first-quarter-report-2026.pdf (Q1 2026 cash flow statement) | FY2021-2025A + LTM Mar-2026; Q1 2026 quarterly | ~3.6 months since latest period-end |
| Guidance data | NorskHydroASAOBNHYEstimatesReport.xls, Guidance tab (guidance history through FY2026, dated 2026-02-13) + first-quarter-report-2026.pdf outlook section ("Outlook Q2 26 vs Q1 26") | Latest guidance dated 13-Feb-2026 (FY2026 capex) plus Q1 2026 report's Q2 2026 segment outlook | ~5.2 months (capex guidance) / ~3 months (Q2 outlook, in Q1 report) |

## 4. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | FY2021-FY2025A + LTM Mar-2026 [Norsk Hydro ASA OB NHY Financials.xls, Income Statement tab]; Q1 2026 vs Q1 2025 vs Q4 2025 [first-quarter-report-2026.pdf, Key figures / consolidated income statement] | Needed for revenue, margin, EPS |
| Balance sheet | Y | FY2021-FY2025A [Norsk Hydro ASA OB NHY Financials.xls, Balance Sheet tab]; Q1 2026 consolidated balance sheet [first-quarter-report-2026.pdf] | Needed for working capital and leverage |
| Cash flow statement | Y | FY2021-FY2025A + LTM Mar-2026 [Norsk Hydro ASA OB NHY Financials.xls, Cash Flow tab]; Q1 2026 consolidated cash flow [first-quarter-report-2026.pdf] | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Q1 2026 (ended 31-Mar-2026) [first-quarter-report-2026.pdf; nhy-presentation-q1-2026.pdf; Q1 2026 earnings call transcript] | Needed for trend and setup |
| Last 8 quarters | Partial | Only 5 quarters of trend data directly visible (Q1 25-Q1 26) in [nhy-presentation-q1-2026.pdf, production/volume charts] and 4 quarters of EPS surprise history (FQ1 25-FQ4 25) in the earnings-call transcript cover pages [Q1 2026 / Q4 2025 Earnings Call transcripts]. The Financials.xls Income Statement/Balance Sheet/Cash Flow tabs are ANNUAL period type only — no quarterly P&L series is in the CIQ workbook. A full 8-quarter P&L must be assembled from the two quarterly reports plus transcript-embedded surprise history, not read off one export | Needed for seasonality and inflection |
| Consensus estimates | Y | Mean/median/high-low/std-dev/# of estimates, target price, LT growth, FY2026-2029 EPS and revenue consensus [NorskHydroASAOBNHYEstimatesReport.xls, Consensus tab, "as of Apr-29-2026 7:13 AM GMT"] | Needed for market bar |
| Estimate revisions | Y | Up/down revision counts by 1/2/3-month windows through FY2029 [NorskHydroASAOBNHYEstimatesReport.xls, Revisions tab]; estimate-trend snapshots (1/2/3/6/9/12/18 months ago) [Trends tab] | Needed for revision momentum |
| Earnings transcript | Y (verbatim) | Two full CIQ/S&P Global Market Intelligence verbatim transcripts with Call Participants, Presentation, and Q&A sections: FQ1 2026 (29-Apr-2026) and FQ4 2025 (13-Feb-2026) [Q1 2026 and Q4 2025 Earnings Call transcripts] | Needed for management tone and driver detail |
| Segment P&L | Y | Five-segment breakout (Bauxite & Alumina, Energy, Aluminium Metal, Metal Markets, Extrusions) with revenue, EBITDA, EBIT, D&A, capex, total assets, FY2020-FY2025 [Norsk Hydro ASA OB NHY Financials.xls, Segments tab]; also Q1 2026 segment results in [first-quarter-report-2026.pdf, Note 2] and business-model `03_segment-map.md` | Needed for mix shift |
| Current price | N (not directly in pool) | No standalone quote/price file found; Trends tab shows target price context (Mean 99.35, High/Low 137.00/59.00 NOK) [NorskHydroASAOBNHYEstimatesReport.xls, Consensus tab] but not a dated current-price snapshot | Needed only for master-level stock reaction context |

## 5. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y — five-segment breakdown with revenue/profit share, margin quality, capital intensity, cyclicality, and IFRS 18 forward-comparability flag (segment EBIT/EBITDA discontinued from FY2027) |
| 06_value-chain.md | Y |
| 10_external-dependency.md | Y |

The full business-model module has completed (`99_business-model-synthesis.md` and all 12 numbered agents present), so downstream earnings agents have segment structure, value-chain, and external-dependency context already available rather than needing to build their own read from scratch.

## 6. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus, revisions, trends, surprise, and guidance are all present | 04, 05, 99 | Not applicable |
| No quarterly data | N (technically) / Partial nuance — the two quarterly filings + transcripts give the latest quarter and one year of comparatives, but the CIQ Financials.xls workbook itself carries only annual periods, so a clean 8-quarter P&L series is not available from a single export | 01, 02, 03, 06 | No hard cap triggered (quarterly filing + transcript quarters satisfy "latest quarter" and enough history for trend), but 01/02/03 should note the 8-quarter series must be hand-assembled from the two quarterly reports and transcript surprise tables, not pulled whole from one export |
| No VERBATIM transcript, sell-side proxy present | N | 02, 03, 04 | Not applicable — both transcripts are verbatim CIQ/S&P call transcripts, not sell-side proxies |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | Not applicable — two verbatim transcripts present (FQ4 2025, FQ1 2026) |
| No segment-level P&L | N | 02, 03, 99 | Not applicable — segment P&L present in CIQ export, Q1 2026 filing Note 2, and business-model `03_segment-map.md` |
| No cash flow statement | N | 06, 99 | Not applicable — annual (FY2021-2025 + LTM) and Q1 2026 cash flow statements both present |
| No current price | Y | 99 | Master-level stock-reaction discussion not assessable from this pool; 99 should flag that a dated current-price source is needed if precision on price reaction is required |

## 7. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has a recent audited annual filing (FY2025 Integrated Annual Report, IFRS-EU), the latest quarterly filing (Q1 2026, ended 31-Mar-2026), two verbatim earnings-call transcripts (FQ4 2025 and FQ1 2026), a full consensus/estimates export (consensus, revisions, trends, surprise, guidance), and income statement, balance sheet, and cash flow statement data at both annual and latest-quarter granularity — clearing the Sufficient bar with no hard-cap-triggering gap.
- **Active partial-data caps:** None triggered. One soft note (not a hard cap): the CIQ Financials.xls workbook is annual-period-type only, so a clean 8-quarter P&L trend must be hand-built from the two quarterly filings plus transcript-embedded surprise tables rather than pulled from a single quarterly export — flag this to `01_historical-financials` and `02_revenue-drivers` so they don't expect a ready-made 8-quarter CIQ series.
- **Critical missing items:** None. Minor gap: no standalone dated current-price/quote file in the pool (affects only `99_earnings-synthesis`'s stock-reaction commentary, not the core earnings analysis).
