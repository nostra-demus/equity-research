# Earnings Data Triage — ORCL

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | 10-K cover page: "Oracle Corporation ... Delaware ... Austin, Texas" [FY26 10-K, cover page] |
| Exchange | New York Stock Exchange (NYSE: ORCL) | [FY26 10-K, cover page — "Common Stock ... ORCL ... New York Stock Exchange"] |
| Filing regime | US SEC | Form 10-K / Form 10-Q filed under Securities Exchange Act of 1934 [FY26 10-K, cover page; Q3 FY26 10-Q, cover page] |
| Reporting standard | US GAAP | "Acctg. Standard: US GAAP" [Capital IQ Estimates Report, Consensus tab, header] |
| Reporting currency | US Dollar (USD) | "Currency: Reported Currency" / "$" figures throughout [FY26 Earnings Press Release, Jun-10-2026] |
| Fiscal-year end | May 31 | "For the fiscal year ended May 31, 2026" [FY26 10-K, cover page] |
| Document language(s) | English (all documents) | — |

No jurisdiction-mapping issue: this is a standard US SEC filer. 10-K = audited annual filing; 10-Q = interim filing; 8-K-equivalent role for the latest quarter is filled by the earnings press release (Q4 FY26 results are reported in the press release + 10-K MD&A, not a standalone 10-Q — normal for US filers, since Q4 has no separate 10-Q).

## 1. File Inventory

Multi-tab workbooks were pre-extracted via `extract_pool.py` (11 workbooks → 56 tabs; 66 extract files; 0 failures — confirmed in `_pool_extracts/manifest.json`, all 21 top-level sources `status: ok`). Every tab is listed below as its own row, reconciled against `_pool_extracts/manifest.md`.

| Filename | Type | Period Covered | Last Modified (Drive sync — not authoritative) | Earnings Relevance |
|---|---|---|---|---|
| Oracle_Corporation_-_Form_10-K(Jun-22-2026).doc | Annual filing (10-K) | FY2026, ended May-31-2026 (filed Jun-22-2026) | Aug 14 2026 (sync date) | High |
| Oracle_Corporation_-_Form_10-Q(Mar-11-2026).doc | Quarterly filing (10-Q) | Q3 FY2026, ended Feb-28-2026 (filed Mar-11-2026) | Aug 14 2026 (sync date) | High |
| Oracle_Earnings Press Release Q4FY26.pdf | Earnings press release | Q4 & FY2026, ended May-31-2026 (dated Jun-10-2026) | Aug 14 2026 (sync date) | High |
| Oracle_Latest_Earnings_Presentation-Slides-Q4-26.pdf | Investor deck | Q4 & FY2026 (dated Jun-10-2026) | Aug 14 2026 (sync date) | High |
| Oracle Corporation, Q4 2026 Earnings Call, Jun 10, 2026.rtf | Verbatim transcript (CIQ) | FQ4 2026 call, Jun-10-2026 | Aug 14 2026 (sync date) | High |
| Oracle Corporation, Q3 2026 Earnings Call, Mar 10, 2026.rtf | Verbatim transcript (CIQ) | FQ3 2026 call, Mar-10-2026 | Aug 14 2026 (sync date) | High |
| OracleCorporationNYSEORCLEstimatesReport.xls → Consensus | Consensus/estimate export | Current FY end May-31-2027; FQ1 2027 release Sep-04-2026 | Aug 14 2026 (sync date) | High |
| OracleCorporationNYSEORCLEstimatesReport.xls → Recent Changes | Estimate revisions | Rolling, most recent rows dated today (e.g. "5:30 AM" same-day) | Aug 14 2026 (sync date) | High |
| OracleCorporationNYSEORCLEstimatesReport.xls → Guidance | Guidance data | Latest: FY2027 guidance confirmed Jun-10-2026; FQ1 FY2027 guidance issued Jun-10-2026 | Aug 14 2026 (sync date) | High |
| OracleCorporationNYSEORCLEstimatesReport.xls → Surprise | Estimate/actuals surprise history | FY1999–FY2026 | Aug 14 2026 (sync date) | High |
| OracleCorporationNYSEORCLEstimatesReport.xls → Trends | Estimate trend history | Multi-year, through FY2027+ estimates | Aug 14 2026 (sync date) | Medium |
| OracleCorporationNYSEORCLEstimatesReport.xls → Revisions | EPS/revenue revision history | FQ1 2027 through FY2036 estimates | Aug 14 2026 (sync date) | Medium |
| OracleCorporationNYSEORCLEstimatesReport.xls → Multiples | Consensus-based multiples | Current | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Income Statement | Data export (quarterly financials) | FQ1 2016 (Aug-2016) through latest reported quarter | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Balance Sheet | Data export (quarterly financials) | FQ1 2016 through latest reported quarter | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Cash Flow | Data export (quarterly financials) | FQ1 2016 through latest reported quarter | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Segments | Data export (quarterly segment) | FQ1 2016 through latest reported quarter | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Ratios | Data export (quarterly ratios) | Same range | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Key Stats | Data export | Same range | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Multiples | Data export (valuation) | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Capital Structure Summary | Data export | Same range | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Capital Structure Details | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Historical Capitalization | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Supplemental | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Industry Specific | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Pension OPEB | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Income Statement | Data export (annual financials) | FY2017 through FY2026 | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Balance Sheet | Data export (annual financials) | FY2017 through FY2026 | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Cash Flow | Data export (annual financials) | FY2017 through FY2026 | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Segments | Data export (annual segment) | FY2017 through FY2026 | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Ratios | Data export | Same range | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Key Stats | Data export | Same range | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Multiples | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Capital Structure Summary | Data export | Same range | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Capital Structure Details | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Historical Capitalization | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Supplemental | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Industry Specific | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Pension OPEB | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Company Comparable Analysis Oracle Corporation.xls → Financial Data | Data export (comps) | As-Of 2026-08-13 | Aug 14 2026 (sync date) | Medium |
| Company Comparable Analysis Oracle Corporation.xls → Trading Multiples | Data export (comps) | As-Of 2026-08-13 | Aug 14 2026 (sync date) | Low |
| Company Comparable Analysis Oracle Corporation.xls → Operating Statistics | Data export (comps) | As-Of 2026-08-13 | Aug 14 2026 (sync date) | Low |
| Company Comparable Analysis Oracle Corporation.xls → Implied Valuation | Data export (comps) | As-Of 2026-08-13 | Aug 14 2026 (sync date) | Low |
| Company Comparable Analysis Oracle Corporation.xls → Valuation Chart | Data export (comps) | As-Of 2026-08-13 | Aug 14 2026 (sync date) | Low |
| Company Comparable Analysis Oracle Corporation.xls → Credit Health Panel | Data export | As-Of 2026-08-13 | Aug 14 2026 (sync date) | Low |
| Company Comparable Analysis Oracle Corporation.xls → Business Description | Data export | Current | Aug 14 2026 (sync date) | Low |
| Company Comparable Analysis Oracle Corporation.xls → Disclaimer | Boilerplate | — | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls → Summary | Data export (credit) | Current | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls → Financials | Data export (credit) | Current | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls → Operational Metrics Charts | Data export (credit) | Current | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls → Solvency Metrics Charts | Data export (credit) | Current | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls → Liquidity Metrics Charts | Data export (credit) | Current | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls → Disclaimer | Boilerplate | — | Aug 14 2026 (sync date) | Low |
| ORCL_Charting Excel Export - Aug 13th 2026.xls → Pane 1 | Price/volume data export | Through 2026-08-12 | Aug 14 2026 (sync date) | Medium (stock reaction context only) |
| ORCL_Charting Excel Export - Aug 13th 2026.xls → Raw | Empty stub (0×0) | — | Aug 14 2026 (sync date) | Low |
| ORCL_Charting Excel Export - Aug 13th 2026.xls → Attributions | Boilerplate | — | Aug 14 2026 (sync date) | Low |
| Oracle_Short_Interest_Charting Excel Export Aug-13-2026.xls → Chart 1 with Data | Data export (short interest) | Through Aug-13-2026 | Aug 14 2026 (sync date) | Low |
| Oracle_Short_Interest_Charting Excel Export Aug-13-2026.xls → Attributions | Boilerplate | — | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Events Calendar.xls → Events Calendar | Data export (event dates) | Includes FQ1 2027 release Sep-04-2026 | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Key Developments.xls → Key Developments | Data export (news/events log) | Through 2026-08-12 | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Public Company Profile.rtf | Data export (profile) | Current | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Customers.rtf | Data export (customers, last 2 yrs) | Rolling 2-year window | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Suppliers.rtf | Data export (suppliers, last 2 yrs) | Rolling 2-year window | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Public Ownership History.xls → History | Data export (ownership) | Historical | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Public Ownership Insider Trading.xls → Insider Trading | Data export (insider trades) | Historical through recent | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Public Ownership Summary.rtf | Data export (ownership summary) | Current | Aug 14 2026 (sync date) | Low |

No external-data documents present (`data/ORCL/external/` does not exist) — Section 1A omitted.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months, as of 2026-08-14) |
|---|---|---|---|
| Annual filing | Oracle_Corporation_-_Form_10-K(Jun-22-2026).doc | FY2026, ended May-31-2026 (filed Jun-22-2026) | ~1.7 |
| Quarterly filing | Oracle_Corporation_-_Form_10-Q(Mar-11-2026).doc | Q3 FY2026, ended Feb-28-2026 (filed Mar-11-2026) | ~5.1 (note: the most recent QUARTER, Q4 FY26, is covered by the earnings press release + 10-K MD&A, not a standalone 10-Q — normal for a US filer, since Q4 is reported inside the annual filing) |
| Earnings transcript | Oracle Corporation, Q4 2026 Earnings Call, Jun 10, 2026.rtf | FQ4 2026 call | ~2.1 |
| Investor deck | Oracle_Latest_Earnings_Presentation-Slides-Q4-26.pdf | Q4 & FY2026 | ~2.1 |
| Consensus / estimate export | OracleCorporationNYSEORCLEstimatesReport.xls (Consensus tab) | Live as of data pull; Current FY end May-31-2027, FQ1 2027 release Sep-04-2026; Recent Changes tab shows same-day revisions | <1 day |
| Cash flow data | Oracle Corporation NYSE ORCL Financials_Quarterly.xls (Cash Flow tab) | Through latest reported quarter (FQ4 2026) | ~2.1 |
| Guidance data | OracleCorporationNYSEORCLEstimatesReport.xls (Guidance tab) | FY2027 guidance confirmed and FQ1 FY2027 guidance issued Jun-10-2026 | ~2.1 |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | FY26 10-K (audited); Financials_Annual.xls / Financials_Quarterly.xls Income Statement tabs; earnings press release | Needed for revenue, margin, EPS |
| Balance sheet | Y | FY26 10-K (audited); Financials_Annual.xls / Financials_Quarterly.xls Balance Sheet tabs | Needed for working capital and leverage |
| Cash flow statement | Y | FY26 10-K (audited); Financials_Annual.xls / Financials_Quarterly.xls Cash Flow tabs | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Q4 FY26 earnings press release (Jun-10-2026) + FY26 10-K MD&A; Financials_Quarterly.xls through FQ4 2026 | Needed for trend and setup |
| Last 8 quarters | Y | Financials_Quarterly.xls Income Statement/Balance Sheet/Cash Flow/Segments tabs run FQ1 2016 through the latest reported quarter — well over 8 quarters | Needed for seasonality and inflection |
| Consensus estimates | Y | OracleCorporationNYSEORCLEstimatesReport.xls Consensus tab, live/current as of the data pull | Needed for market bar |
| Estimate revisions | Y | OracleCorporationNYSEORCLEstimatesReport.xls Recent Changes and Revisions tabs, including same-day entries | Needed for revision momentum |
| Earnings transcript | Y | Verbatim CIQ transcripts for FQ3 2026 (Mar-10-2026) and FQ4 2026 (Jun-10-2026) — both carry Call Participants / Presentation / Q&A structure, confirming verbatim status, not a sell-side proxy | Needed for management tone and driver detail |
| Segment P&L | Y | FY26 10-K, Note 13 (Segment Information); Financials_Annual.xls / Financials_Quarterly.xls Segments tabs | Needed for mix shift |
| Current price | Y | ORCL_Charting Excel Export (Pane 1 tab), daily price data through 2026-08-12; Company Comparable Analysis As-Of 2026-08-13 | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y — present at `analyses/ORCL_2026-08-14/business-model/03_segment-map.md` (Cloud and Software / Hardware / Services segments per FY26 10-K, Note 13) |
| 06_value-chain.md | Y — present at `analyses/ORCL_2026-08-14/business-model/06_value-chain.md` |
| 10_external-dependency.md | Y — present at `analyses/ORCL_2026-08-14/business-model/10_external-dependency.md` |

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus, revisions, surprise, guidance, and trends tabs are all present and current | 04, 05, 99 | Not applicable |
| No quarterly data | N — quarterly financials, segments, and cash flow run FQ1 2016 through the latest reported quarter | 01, 02, 03, 06 | Not applicable |
| No VERBATIM transcript, sell-side proxy present | N — both FQ3 2026 and FQ4 2026 transcripts are verbatim CIQ call transcripts (full Presentation + Q&A) | 02, 03, 04 | Not applicable |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | Not applicable |
| No segment-level P&L | N — Note 13 of the 10-K and the Segments tabs in both Financials workbooks provide segment P&L | 02, 03, 99 | Not applicable |
| No cash flow statement | N — audited cash flow statement in the 10-K, plus Cash Flow tabs in both Financials workbooks | 06, 99 | Not applicable |
| No current price | N — daily price series through 2026-08-12 (ORCL_Charting Excel Export, Pane 1 tab) | 99 | Not applicable |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool contains the audited FY2026 10-K, the latest 10-Q (Q3 FY26), the Q4 FY26 earnings press release, two verbatim CIQ earnings-call transcripts (FQ3 and FQ4 2026), a live/current consensus and revisions export, and complete income statement, balance sheet, and cash flow data at both annual and quarterly granularity (FQ1 2016 through FQ4 2026) — every element of the sufficiency rule is met with no extraction failures across all 21 source files / 56 workbook tabs.
- **Active partial-data caps:** None.
- **Critical missing items:** None.
