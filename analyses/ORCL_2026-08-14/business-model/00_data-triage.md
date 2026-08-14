# Data Triage — ORCL

## 1. File Inventory

Multi-tab CIQ workbooks were pre-extracted with `.claude/tools/extract_pool.py` (`analyses/ORCL_2026-08-14/_pool_extracts/manifest.md`, 11 workbooks → 56 tabs, 66 extract files, 0 failures). Every tab is listed as its own row below, reconciled against the manifest. Period Covered is read from INSIDE each document (period-end / as-of / fiscal-year lines), not file last-modified (CLAUDE.md fix F23). Last Modified is the filesystem timestamp from the Drive-synced pool, shown for reference only.

| Filename | Type | Period Covered | Last Modified | Notes |
|---|---|---|---|---|
| Oracle_Corporation_-_Form_10-K(Jun-22-2026).doc | Annual filing (10-K, SEC) | FY ended May-31-2026 (filed Jun-22-2026) | Aug 13 19:32 | Most recent audited annual filing. US GAAP, USD. mhtml extract OK. |
| Oracle_Corporation_-_Form_10-Q(Mar-11-2026).doc | Quarterly filing (10-Q, SEC) | Three/nine months ended Feb-28-2026 (Q3 FY26, filed Mar-11-2026) | Aug 13 19:32 | Most recent standalone SEC quarterly filing. mhtml extract OK. |
| Oracle_Earnings Press Release Q4FY26.pdf | Earnings press release | Q4 & FY2026 (period ended May-31-2026), released Jun-10-2026 | Aug 13 19:33 | Record Q4/FY26 cloud revenue detail. PDF extract OK. |
| Oracle_Latest_Earnings_Presentation-Slides-Q4-26.pdf | Investor deck | Q4 & FY2026 (as of Jun-10-2026) | Aug 13 19:33 | Guidance for FY2027 included. PDF extract OK. |
| Oracle Corporation, Q4 2026 Earnings Call, Jun 10, 2026.rtf | Earnings transcript | FQ4 2026 (ended May-31-2026), call Jun-10-2026, 9:00 PM GMT | Aug 13 19:25 | Most recent transcript; includes consensus/actual/surprise table. |
| Oracle Corporation, Q3 2026 Earnings Call, Mar 10, 2026.rtf | Earnings transcript | FQ3 2026 (ended Feb-28-2026), call Mar-10-2026 | Aug 13 19:31 | Prior-quarter transcript. |
| Company Comparable Analysis Oracle Corporation.xls — Financial Data | Data export (CIQ) tab | LTM as of 2026-08-13 | Aug 13 16:48 | As-Of Date stated inline: 2026-08-13T00:00:00. |
| Company Comparable Analysis Oracle Corporation.xls — Trading Multiples | Data export (CIQ) tab | LTM as of 2026-08-13 | Aug 13 16:48 | Peer comp multiples. |
| Company Comparable Analysis Oracle Corporation.xls — Operating Statistics | Data export (CIQ) tab | LTM as of 2026-08-13 | Aug 13 16:48 | Peer operating stats. |
| Company Comparable Analysis Oracle Corporation.xls — Business Description | Data export (CIQ) tab | As of 2026-08-13 | Aug 13 16:48 | Vendor business summary. |
| Company Comparable Analysis Oracle Corporation.xls — Implied Valuation | Data export (CIQ) tab | As of 2026-08-13 | Aug 13 16:48 | Comp-based implied valuation. |
| Company Comparable Analysis Oracle Corporation.xls — Valuation Chart | Data export (CIQ) tab | As of 2026-08-13 | Aug 13 16:48 | Chart data only. |
| Company Comparable Analysis Oracle Corporation.xls — Credit Health Panel | Data export (CIQ) tab | As of 2026-08-13 | Aug 13 16:48 | Credit scoring vs. peers. |
| Company Comparable Analysis Oracle Corporation.xls — Disclaimer | Data export (CIQ) tab | n/a | Aug 13 16:48 | Boilerplate. |
| ORCL_Charting Excel Export - Aug 13th 2026 4_48_01 pm.xls — Pane 1 | Data export (CIQ price/volume) | 2021-08-13 to 2026-08-13 daily series | Aug 13 16:48 | 5-year price/volume history. |
| ORCL_Charting Excel Export - Aug 13th 2026 4_48_01 pm.xls — Raw | Data export (CIQ) tab | Empty (0×0) | Aug 13 16:48 | No rows/cols; empty tab, not a gap (source tab is blank by design). |
| ORCL_Charting Excel Export - Aug 13th 2026 4_48_01 pm.xls — Attributions | Data export (CIQ) tab | As of 2026-08-13 | Aug 13 16:48 | Data attribution/legal notes. |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls — Summary | Data export (CIQ) tab | LTM period ending shown per peer row | Aug 14 00:14 | Overall/Operational/Solvency/Liquidity relative scores vs. 22 peers. |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls — Financials | Data export (CIQ) tab | LTM | Aug 14 00:14 | Underlying financial detail for scoring. |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls — Operational Metrics Charts | Data export (CIQ) tab | Chart data | Aug 14 00:14 | Chart series. |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls — Solvency Metrics Charts | Data export (CIQ) tab | Chart data | Aug 14 00:14 | Chart series. |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls — Liquidity Metrics Charts | Data export (CIQ) tab | Chart data | Aug 14 00:14 | Chart series. |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls — Disclaimer | Data export (CIQ) tab | n/a | Aug 14 00:14 | Boilerplate. |
| Oracle Corporation NYSE ORCL Customers.rtf | Data export (CIQ relationship data) | "Recently disclosed" (within last 2 years), sourced to counterparties' own filings (e.g. 8x8 2026 Form 10-K) | Aug 14 00:13 | Customer relationships disclosed by counterparties. |
| Oracle Corporation NYSE ORCL Events Calendar.xls — Events Calendar | Data export (CIQ) tab | Timeframe: 2026 (Jan-2026 onward, incl. Mar-10-2026 earnings date) | Aug 14 00:13 | Corporate calendar. |
| Oracle Corporation NYSE ORCL Financials_Annual.xls — Key Stats | Data export (CIQ) tab | FY May-31-2017A through FY May-31-2026A | Aug 13 19:24 | 10-year annual key stats. |
| Oracle Corporation NYSE ORCL Financials_Annual.xls — Income Statement | Data export (CIQ) tab | FY2017A–FY2026A | Aug 13 19:24 | |
| Oracle Corporation NYSE ORCL Financials_Annual.xls — Balance Sheet | Data export (CIQ) tab | FY2017A–FY2026A | Aug 13 19:24 | |
| Oracle Corporation NYSE ORCL Financials_Annual.xls — Cash Flow | Data export (CIQ) tab | FY2017A–FY2026A | Aug 13 19:24 | |
| Oracle Corporation NYSE ORCL Financials_Annual.xls — Multiples | Data export (CIQ) tab | FY2017A–FY2026A | Aug 13 19:24 | |
| Oracle Corporation NYSE ORCL Financials_Annual.xls — Historical Capitalization | Data export (CIQ) tab | FY2017A–FY2026A | Aug 13 19:24 | |
| Oracle Corporation NYSE ORCL Financials_Annual.xls — Capital Structure Summary | Data export (CIQ) tab | FY2017A–FY2026A | Aug 13 19:24 | |
| Oracle Corporation NYSE ORCL Financials_Annual.xls — Capital Structure Details | Data export (CIQ) tab | FY2017A–FY2026A | Aug 13 19:24 | |
| Oracle Corporation NYSE ORCL Financials_Annual.xls — Ratios | Data export (CIQ) tab | FY2017A–FY2026A | Aug 13 19:24 | |
| Oracle Corporation NYSE ORCL Financials_Annual.xls — Supplemental | Data export (CIQ) tab | FY2017A–FY2026A | Aug 13 19:24 | |
| Oracle Corporation NYSE ORCL Financials_Annual.xls — Industry Specific | Data export (CIQ) tab | FY2017A–FY2026A | Aug 13 19:24 | |
| Oracle Corporation NYSE ORCL Financials_Annual.xls — Pension OPEB | Data export (CIQ) tab | FY2017A–FY2026A | Aug 13 19:24 | |
| Oracle Corporation NYSE ORCL Financials_Annual.xls — Segments | Data export (CIQ) tab | FY2017A–FY2026A | Aug 13 19:24 | Reportable-segment history — feeds segment-map. |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls — Key Stats | Data export (CIQ) tab | Quarterly through FQ4 FY2026 (ended May-31-2026) | Aug 13 17:05 | |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls — Income Statement | Data export (CIQ) tab | Quarterly through FQ4 FY2026 | Aug 13 17:05 | |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls — Balance Sheet | Data export (CIQ) tab | Quarterly through FQ4 FY2026 | Aug 13 17:05 | |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls — Cash Flow | Data export (CIQ) tab | Quarterly through FQ4 FY2026 | Aug 13 17:05 | |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls — Multiples | Data export (CIQ) tab | Quarterly through FQ4 FY2026 | Aug 13 17:05 | |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls — Historical Capitalization | Data export (CIQ) tab | Quarterly through FQ4 FY2026 | Aug 13 17:05 | |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls — Capital Structure Summary | Data export (CIQ) tab | Quarterly through FQ4 FY2026 | Aug 13 17:05 | |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls — Capital Structure Details | Data export (CIQ) tab | Quarterly through FQ4 FY2026 | Aug 13 17:05 | |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls — Ratios | Data export (CIQ) tab | Quarterly through FQ4 FY2026 | Aug 13 17:05 | |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls — Supplemental | Data export (CIQ) tab | Quarterly through FQ4 FY2026 | Aug 13 17:05 | |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls — Industry Specific | Data export (CIQ) tab | Quarterly through FQ4 FY2026 | Aug 13 17:05 | |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls — Pension OPEB | Data export (CIQ) tab | Quarterly through FQ4 FY2026 | Aug 13 17:05 | |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls — Segments | Data export (CIQ) tab | Quarterly through FQ4 FY2026 | Aug 13 17:05 | Quarterly segment history — feeds segment-map. |
| Oracle Corporation NYSE ORCL Key Developments.xls — Key Developments | Data export (CIQ) tab | Trailing 1 year, through 2026-08-12 | Aug 13 19:37 | Most-recent event dated 2026-08-12 (Oracle Health product announcement) — fresher than any filing. |
| Oracle Corporation NYSE ORCL Public Company Profile.rtf | Data export (CIQ profile) | Current as of extraction | Aug 14 00:13 | Business description, employee count (141,000), founding year 1977. |
| Oracle Corporation NYSE ORCL Public Ownership History.xls — History | Data export (CIQ) tab | Multi-year ownership history | Aug 14 00:15 | 5,350 rows. |
| Oracle Corporation NYSE ORCL Public Ownership Insider Trading.xls — Insider Trading | Data export (CIQ) tab | Multi-year insider transaction history | Aug 13 19:38 | 4,927 rows. |
| Oracle Corporation NYSE ORCL Public Ownership Summary.rtf | Data export (CIQ profile) | Current as of extraction | Aug 13 19:37 | Institutions 44.0%, Individuals/Insiders 40.5% of shares. |
| Oracle Corporation NYSE ORCL Suppliers.rtf | Data export (CIQ relationship data) | "Recently disclosed" (within last 2 years) | Aug 14 00:13 | Supplier relationships disclosed by counterparties' own filings. |
| OracleCorporationNYSEORCLEstimatesReport.xls — Consensus | Data export (CIQ estimates) | Consensus as of Jun-10-2026 (per Q4 call cross-check) | Aug 13 16:48 | Sell-side consensus, largest tab (667×129). |
| OracleCorporationNYSEORCLEstimatesReport.xls — Recent Changes | Data export (CIQ estimates) | Recent estimate revisions | Aug 13 16:48 | |
| OracleCorporationNYSEORCLEstimatesReport.xls — Guidance | Data export (CIQ estimates) | Company guidance history | Aug 13 16:48 | |
| OracleCorporationNYSEORCLEstimatesReport.xls — Multiples | Data export (CIQ estimates) | Current | Aug 13 16:48 | |
| OracleCorporationNYSEORCLEstimatesReport.xls — Surprise | Data export (CIQ estimates) | Historical EPS/revenue surprise | Aug 13 16:48 | |
| OracleCorporationNYSEORCLEstimatesReport.xls — Trends | Data export (CIQ estimates) | Estimate trend history | Aug 13 16:48 | |
| OracleCorporationNYSEORCLEstimatesReport.xls — Revisions | Data export (CIQ estimates) | Estimate revision history | Aug 13 16:48 | |
| Oracle_Short_Interest_Charting Excel Export Aug-13-2026 10_07 AM.xls — Chart 1 with Data | Data export (CIQ short interest) | 2025-08-13 to 2026-08-13 (approx. daily series) | Aug 13 19:37 | Short interest as % of shares outstanding. |
| Oracle_Short_Interest_Charting Excel Export Aug-13-2026 10_07 AM.xls — Attributions | Data export (CIQ) tab | As of 2026-08-13 | Aug 13 19:37 | Attribution/legal notes. |

No `data/ORCL/external/` folder exists in this pool, so there is no external-data section to report.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | Oracle_Corporation_-_Form_10-K(Jun-22-2026).doc | FY ended May-31-2026 (filed Jun-22-2026) | ~1.7 |
| Quarterly filing (SEC) | Oracle_Corporation_-_Form_10-Q(Mar-11-2026).doc | Three/nine months ended Feb-28-2026 (filed Mar-11-2026) | ~5.1 |
| Quarterly results (press release, most recent) | Oracle_Earnings Press Release Q4FY26.pdf | Q4 & FY2026, ended May-31-2026 (released Jun-10-2026) | ~2.1 |
| Earnings transcript | Oracle Corporation, Q4 2026 Earnings Call, Jun 10, 2026.rtf | FQ4 2026, ended May-31-2026 (call Jun-10-2026) | ~2.1 |
| Investor deck | Oracle_Latest_Earnings_Presentation-Slides-Q4-26.pdf | Q4 & FY2026 (as of Jun-10-2026) | ~2.1 |
| Data export | Company Comparable Analysis Oracle Corporation.xls (and other CIQ workbooks) | As of 2026-08-13 | ~0 |

Note: the 10-K (filed Jun-22-2026) already carries full-year and Q4 FY26 audited figures, so the annual filing is more current than the last standalone 10-Q. Oracle does not file a discrete SEC quarterly report for its fiscal Q4 (results are folded into the 10-K plus the earnings release/call) — that is normal for a US filer's fiscal-year-end quarter, not a data gap.

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States (NYSE) | 10-K cover page: "New York Stock Exchange", ticker ORCL [FY26 10-K, cover page] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | Form 10-K, "SECURITIES AND EXCHANGE COMMISSION... Commission File Number 001-35992" [FY26 10-K, cover page]; Form 10-Q filed Mar-11-2026 |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | Standard US domestic filer disclosure (10-K/10-Q are US-GAAP-only forms); Delaware incorporation [FY26 10-K, cover page] |
| Reporting currency + fiscal-year end | USD; fiscal year ends May 31 | "For the fiscal year ended May 31, 2026" [FY26 10-K, cover page]; press release figures in USD billions [Q4FY26 Earnings Press Release] |
| Document language(s) | English (all documents) | All filings, transcripts, deck, and CIQ exports are in English; no non-English source in this pool |

Downstream agents should read US-regime documents (10-K, 10-Q, DEF 14A-equivalent if present) per CLAUDE.md §27; no local-equivalent substitution needed since ORCL is a domestic US SEC filer. No non-English documents exist in this pool, so the §27 language-is-not-a-gap rule has no bearing here.

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has an annual filing 1.7 months old (well inside 18 months) plus a quarterly-equivalent set — 10-Q (~5.1 months), Q4 FY26 earnings transcript, press release, and investor deck (all ~2.1 months) — all inside 6 months, satisfying both legs of the sufficiency rule.
- **Critical missing items:** None. (For completeness: no DEF 14A-equivalent proxy/governance filing and no segment 10-K excerpt beyond the CIQ Segments tabs were found in this pool; these are inputs for other modules — e.g. management-governance — not required for business-model sufficiency, and are noted here only as items those modules should independently confirm.)
