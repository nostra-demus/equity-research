# Earnings Data Triage — INDIAMART

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | India | BSE Limited / National Stock Exchange of India Limited addressee on every filing letter, e.g. `FY26 Annual filing (Outcome of Board Meeting), Apr-30-2026` |
| Exchange | NSE: INDIAMART; BSE: 542726 | Filing letterhead, all filings |
| Filing regime | India — SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015 ("Listing Regulations"), Reg 30/33/34 | `Q1 FY27 Board-outcome intimation, Jul-21-2026`: "Pursuant to Regulation 30, 33 ... Listing Regulations" |
| Reporting standard | Ind AS (Indian Accounting Standards, per Companies Act 2013 Sec. 133) | `FY26 Annual Report (audited), Apr-30-2026`, Auditor's Report: "Ind AS ... specified under Section 133 of the Act"; CIQ Financials export header also states "Acctg. Standard: India GAAP" (CIQ's label for Ind AS) |
| Reporting currency | INR (Indian Rupee); filings state amounts in ₹ crore/lakh with absolute figures, CIQ exports in ₹ millions | `FY26 Annual Report, Apr-30-2026`; `Financials.xls, Income Statement tab` ("Currency: INR") |
| Fiscal-year end | March 31 | `FY26 Annual filing, Apr-30-2026`: "financial year ended March 31, 2026" |
| Document language(s) | English (all filings, transcripts, and CIQ exports reviewed are in English; no non-English source documents found in this pool) | Full pool review |

No US SEC form (10-K/10-Q/8-K) is expected or present for this Indian issuer — the local equivalents (Annual Report, SEBI LODR quarterly results, Reg 30 exchange intimations) are used throughout and are NOT treated as missing data (CLAUDE.md §27).

## 1. File Inventory

Extraction status: 38 workbooks → 81 tabs; 8 RTF; 39 PDF = 128 extract files, **0 failures** (`_pool_extracts/manifest.json`, `_pool_extracts/manifest.md`, run `2026-08-13`). Every multi-tab workbook is reconciled below tab-by-tab against the manifest — no workbook appears as a single opaque row. Filenames repeated across near-duplicate exports (e.g. `Financials.xls` vs `Financials (1).xls`, or the standalone `Financials Cash Flow.xls` vs the `Cash Flow` tab embedded in `Financials.xls`) are genuine duplicate CIQ exports carrying identical data — flagged inline, not counted twice toward sufficiency.

**Period Covered is read from inside each document** (fiscal-period-end / "as of" language in the filing or CIQ export header), not from filesystem last-modified time — all files in this pool were synced/downloaded on 2026-08-13, so last-modified date would be misleading (CLAUDE.md fix F23) and is not used below.

| Filename | Tab / Sheet | Type | Period Covered | Earnings Relevance |
|---|---|---|---|---|
| Company Comparable Analysis IndiaMART InterMESH Limited.xls | Financial Data | Data export (peer comps, valuation) | Current market data snapshot | Low |
| Company Comparable Analysis IndiaMART InterMESH Limited.xls | Trading Multiples | Data export (peer comps, valuation) | Current market data snapshot | Low |
| Company Comparable Analysis IndiaMART InterMESH Limited.xls | Operating Statistics | Data export (peer comps, valuation) | Current market data snapshot | Low |
| Company Comparable Analysis IndiaMART InterMESH Limited.xls | Business Description | Data export (peer comps, valuation) | Current market data snapshot | Low |
| Company Comparable Analysis IndiaMART InterMESH Limited.xls | Implied Valuation | Data export (peer comps, valuation) | Current market data snapshot | Low |
| Company Comparable Analysis IndiaMART InterMESH Limited.xls | Valuation Chart | Data export (peer comps, valuation) | Current market data snapshot | Low |
| Company Comparable Analysis IndiaMART InterMESH Limited.xls | Credit Health Panel | Data export (peer comps, valuation) | Current market data snapshot | Low |
| Company Comparable Analysis IndiaMART InterMESH Limited.xls | Disclaimer | Data export (peer comps, valuation) | Current market data snapshot | Low |
| IndiaMART InterMESH Limited (NSEI_INDIAMART) Corporate Structure Tree.xls | IndiaMART InterMESH Limited NS | Data export (corporate structure) | Current | Low |
| IndiaMART InterMESH Limited (NSEI_INDIAMART) Corporate Structure Tree.xls | Filtered Count | Data export (corporate structure) | Current | Low |
| IndiaMART InterMESH Limited (NSEI_INDIAMART) Corporate Structure Tree.xls | Aggregates | Data export (corporate structure) | Current | Low |
| IndiaMART InterMESH Limited - ShareholderAnalyst Call.pdf | — | Transcript (AGM shareholder/analyst call, verbatim) | 25th AGM Q&A, Jun-20-2024 | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Analyst Coverage.rtf | — | Data export (broker coverage/rating list — not a call summary) | Current broker roster, target prices, ratings | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Auditors.xls | Auditors | Governance data export | Current (B S R & Co. LLP) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Board Members.xls | Board Members | Governance data export | Current board roster | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Committees.xls | Committees | Governance data export | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Comparable M A Transactions.xls | Comparable M A Transactions | Data export (M&A comps) | Historical deal comps | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Compensation Summary Compensation.xls | Summary Compensation | Governance data export (compensation) | Multi-year exec comp | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Competitors.xls | Competitors | Business-model data export | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Corporate Timeline.xls | Corporate Timeline | Data export (corporate history) | Since inception | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Credit Health Panel.xls | Summary | Data export (solvency/credit panel) | Multi-year solvency/liquidity ratios | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Credit Health Panel.xls | Financials | Data export (solvency/credit panel) | Multi-year solvency/liquidity ratios | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Credit Health Panel.xls | Operational Metrics Charts | Data export (solvency/credit panel) | Multi-year solvency/liquidity ratios | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Credit Health Panel.xls | Solvency Metrics Charts | Data export (solvency/credit panel) | Multi-year solvency/liquidity ratios | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Credit Health Panel.xls | Liquidity Metrics Charts | Data export (solvency/credit panel) | Multi-year solvency/liquidity ratios | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Credit Health Panel.xls | Disclaimer | Data export (solvency/credit panel) | Multi-year solvency/liquidity ratios | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Customers.xls | Customers | Business-model data export | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Events Calendar.xls | Events Calendar | Data export (events/earnings calendar) | Upcoming + historical event dates | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls | Key Stats | Data export (core financials) | FY2022-FY2026 annual + LTM Jun-30-2026 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls | Income Statement | Data export (core financials) | FY2022-FY2026 annual + LTM Jun-30-2026 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls | Balance Sheet | Data export (core financials) | FY2022-FY2026 annual + LTM Jun-30-2026 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls | Cash Flow | Data export (core financials) | FY2022-FY2026 annual + LTM Jun-30-2026 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls | Multiples | Data export (trading multiples) | FY2022-FY2026 + LTM | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls | Historical Capitalization | Data export (capital structure) | FY2022-FY2026 + LTM | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls | Capital Structure Summary | Data export (capital structure) | FY2022-FY2026 + LTM | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls | Capital Structure Details | Data export (capital structure) | FY2022-FY2026 + LTM | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls | Ratios | Data export (financial ratios) | FY2022-FY2026 annual + LTM | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls | Supplemental | Data export (supplemental financials) | FY2022-FY2026 + LTM | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls | Industry Specific | Data export (supplemental financials) | FY2022-FY2026 + LTM | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls | Pension OPEB | Data export (supplemental financials) | FY2022-FY2026 + LTM | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls | Segments | Data export (segment P&L) | FY2021-FY2026 annual, 2 segments | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Balance Sheet.xls | Balance Sheet | Data export (core financials) | FY2022-FY2026 annual + LTM Jun-30-2026 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Capital Structure Details.xls | Capital Structure Details | Data export (capital structure) | FY2022-FY2026 + LTM | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Capital Structure Summary.xls | Capital Structure Summary | Data export (capital structure) | FY2022-FY2026 + LTM | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Cash Flow.xls | Cash Flow | Data export (core financials) | FY2022-FY2026 annual + LTM Jun-30-2026 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Income Statement (1).xls | Income Statement | Data export (core financials) | FY2022-FY2026 annual + LTM Jun-30-2026 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Income Statement.xls | Income Statement | Data export (core financials) | FY2022-FY2026 annual + LTM Jun-30-2026 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Key Stats.xls | Key Stats | Data export (core financials) | FY2022-FY2026 annual + LTM Jun-30-2026 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Pension OPEB.xls | Pension OPEB | Data export (supplemental financials) | FY2022-FY2026 + LTM | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Ratios.xls | Ratios | Data export (financial ratios) | FY2022-FY2026 annual + LTM | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Segments.xls | Segments | Data export (segment P&L) | FY2021-FY2026 annual, 2 segments | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Supplemental.xls | Supplemental | Data export (supplemental financials) | FY2022-FY2026 + LTM | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls | Key Stats | Data export (core financials) | FY2022-FY2026 annual + LTM Jun-30-2026 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls | Income Statement | Data export (core financials) | FY2022-FY2026 annual + LTM Jun-30-2026 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls | Balance Sheet | Data export (core financials) | FY2022-FY2026 annual + LTM Jun-30-2026 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls | Cash Flow | Data export (core financials) | FY2022-FY2026 annual + LTM Jun-30-2026 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls | Multiples | Data export (trading multiples) | FY2022-FY2026 + LTM | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls | Historical Capitalization | Data export (capital structure) | FY2022-FY2026 + LTM | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls | Capital Structure Summary | Data export (capital structure) | FY2022-FY2026 + LTM | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls | Capital Structure Details | Data export (capital structure) | FY2022-FY2026 + LTM | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls | Ratios | Data export (financial ratios) | FY2022-FY2026 annual + LTM | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls | Supplemental | Data export (supplemental financials) | FY2022-FY2026 + LTM | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls | Industry Specific | Data export (supplemental financials) | FY2022-FY2026 + LTM | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls | Pension OPEB | Data export (supplemental financials) | FY2022-FY2026 + LTM | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls | Segments | Data export (segment P&L) | FY2021-FY2026 annual, 2 segments | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Fixed Income Securities Summary.xls | Securities Summary | Data export (debt securities) | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Industry Classifications.rtf | — | Data export (industry classification) | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Investment Analysis Co Investors.xls | Co-Investors | Data export (ownership/investment) | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Investment Analysis Direct Investments.xls | Direct Investments | Data export (ownership/investment) | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Key Developments.xls | Key Developments | Data export (corporate events log) | Multi-year event log incl. results dates | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Long Business Description.rtf | — | Business-model data export | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Offices.rtf | — | Data export (offices) | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Private Ownership.rtf | — | Governance/ownership data export | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Products.xls | Products | Business-model data export | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Professionals.rtf | — | Governance data export (bios) | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Public Company Profile.rtf | — | Data export (company profile) | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Public Ownership Summary.rtf | — | Governance/ownership data export | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Strategic Alliances.xls | Strategic Alliances | Business-model data export | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Suppliers.xls | Suppliers | Business-model data export | Current | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Transaction Advisors.xls | Transaction Advisors | Data export (deal advisors) | Historical | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Transcripts.xls | Transcripts | Data export (transcript index/metadata) | All history through Jul-21-2026 | Low |
| IndiaMART InterMESH Limited, Q1 2022 Earnings Call, Jul 23, 2021.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ1 2022 call, Jul 23, 2021 | High |
| IndiaMART InterMESH Limited, Q1 2023 Earnings Call, Jul 22, 2022.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ1 2023 call, Jul 22, 2022 | High |
| IndiaMART InterMESH Limited, Q1 2024 Earnings Call, Jul 21, 2023.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ1 2024 call, Jul 21, 2023 | High |
| IndiaMART InterMESH Limited, Q1 2025 Earnings Call, Jul 30, 2024.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ1 2025 call, Jul 30, 2024 | High |
| IndiaMART InterMESH Limited, Q1 2026 Earnings Call, Jul 18, 2025.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ1 2026 call, Jul 18, 2025 | High |
| IndiaMART InterMESH Limited, Q1 2027 Earnings Call, Jul 21, 2026.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ1 2027 call, Jul 21, 2026 | High |
| IndiaMART InterMESH Limited, Q2 2022 Earnings Call, Oct 22, 2021.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ2 2022 call, Oct 22, 2021 | High |
| IndiaMART InterMESH Limited, Q2 2023 Earnings Call, Oct 21, 2022.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ2 2023 call, Oct 21, 2022 | High |
| IndiaMART InterMESH Limited, Q2 2024 Earnings Call, Oct 27, 2023.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ2 2024 call, Oct 27, 2023 | High |
| IndiaMART InterMESH Limited, Q2 2025 Earnings Call, Oct 19, 2024.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ2 2025 call, Oct 19, 2024 | High |
| IndiaMART InterMESH Limited, Q2 2026 Earnings Call, Oct 17, 2025.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ2 2026 call, Oct 17, 2025 | High |
| IndiaMART InterMESH Limited, Q3 2021 Earnings Call, Jan 19, 2021.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ3 2021 call, Jan 19, 2021 | High |
| IndiaMART InterMESH Limited, Q3 2022 Earnings Call, Jan 25, 2022.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ3 2022 call, Jan 25, 2022 | High |
| IndiaMART InterMESH Limited, Q3 2023 Earnings Call, Jan 20, 2023.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ3 2023 call, Jan 20, 2023 | High |
| IndiaMART InterMESH Limited, Q3 2024 Earnings Call, Jan 18, 2024.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ3 2024 call, Jan 18, 2024 | High |
| IndiaMART InterMESH Limited, Q3 2025 Earnings Call, Jan 21, 2025.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ3 2025 call, Jan 21, 2025 | High |
| IndiaMART InterMESH Limited, Q3 2026 Earnings Call, Jan 20, 2026.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ3 2026 call, Jan 20, 2026 | High |
| IndiaMART InterMESH Limited, Q4 2022 Earnings Call, Apr 29, 2022.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ4 2022 call, Apr 29, 2022 | High |
| IndiaMART InterMESH Limited, Q4 2023 Earnings Call, Apr 28, 2023.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ4 2023 call, Apr 28, 2023 | High |
| IndiaMART InterMESH Limited, Q4 2024 Earnings Call, Apr 30, 2024.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ4 2024 call, Apr 30, 2024 | High |
| IndiaMART InterMESH Limited, Q4 2025 Earnings Call, Apr 29, 2025.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ4 2025 call, Apr 29, 2025 | High |
| IndiaMART InterMESH Limited, Q4 2026 Earnings Call, Apr 30, 2026.pdf | — | Earnings transcript (verbatim, CIQ/S&P Global) | FQ4 2026 call, Apr 30, 2026 | High |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport (1).xls | Consensus | Consensus/estimate export | Current consensus; header states FY-end Mar-31-2027, next release Oct-21-2026 | High |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls | Consensus | Consensus/estimate export | Current consensus; header states FY-end Mar-31-2027, next release Oct-21-2026 | High |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls | Recent Changes | Consensus/estimate export (analyst-level revisions log) | Revision entries through 2026-07-30 (post Q1 FY27 print) | High |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls | Multiples | Consensus/estimate export (valuation multiples) | Current consensus multiples | Medium |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls | Surprise | Consensus/estimate export (surprise history) | FY2020-FY2026 actual vs estimate, announced dates through Apr-30-2026 | High |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls | Trends | Consensus/estimate export (estimate trend) | Current + up to 18 months ago, forward to FY2030E | High |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls | Revisions | Consensus/estimate export (revision counts) | Last 1/3/2/3-month revision counts, run as of ~Aug-2026 | High |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-29-2025).pdf | — | Annual filing (audited) | FY ended Mar-31-2025 | High |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf | — | Annual filing (audited) | Q4 + FY ended Mar-31-2026 | High |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf | — | Annual filing (Integrated Annual Report + AGM Notice) | FY2025-26 (27th AGM) | High |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jan-20-2026).pdf | — | Quarterly filing (audited/limited-review) | Quarter ended Dec-31-2025 (Q3 FY26) | High |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-18-2025).pdf | — | Quarterly filing (audited/limited-review) | Quarter ended Jun-30-2025 (Q1 FY26) | High |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf | — | Quarterly filing (audited/limited-review) | Quarter ended Jun-30-2026 (Q1 FY27) — MOST RECENT QUARTER | High |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Oct-17-2025).pdf | — | Quarterly filing (audited/limited-review) | Quarter ended Sep-30-2025 (Q2 FY26) | High |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Annual_Report(Apr-30-2026).pdf | — | Earnings press release / board-outcome intimation | Q4 + FY ended Mar-31-2026 (Outcome of Board Meeting, incl. dividend) | High |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Apr-29-2025).pdf | — | Earnings press release / board-outcome intimation | Q4 + FY ended Mar-31-2025 (Outcome of Board Meeting) | High |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Apr-30-2026).pdf | — | Earnings press release / board-outcome intimation | Q4 + FY ended Mar-31-2026 (Outcome of Board Meeting; duplicate of Preliminary Annual Report row) | High |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-20-2026).pdf | — | Earnings press release / board-outcome intimation | Quarter ended Dec-31-2025 (Q3 FY26, Outcome of Board Meeting) | High |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-21-2025).pdf | — | Quarterly filing (audited, mislabeled "Preliminary" by router) | Quarter ended Dec-31-2024 (Q3 FY25) — full audited quarterly statements | High |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-22-2025).pdf | — | Earnings press release / board-outcome intimation | Quarter ended Dec-31-2024 (Q3 FY25, Outcome of Board Meeting) | High |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jul-18-2025).pdf | — | Earnings press release / board-outcome intimation | Quarter ended Jun-30-2025 (Q1 FY26, Outcome of Board Meeting) | High |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jul-21-2026).pdf | — | Earnings press release / board-outcome intimation | Quarter ended Jun-30-2026 (Q1 FY27, Outcome of Board Meeting) | High |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Oct-17-2025).pdf | — | Earnings press release / board-outcome intimation | Quarter ended Sep-30-2025 (Q2 FY26, Outcome of Board Meeting) | High |
| Transaction Summary M A Private Placements.xls | M A Private Placements | Data export (capital markets transactions) | Historical | Low |
| Transaction Summary Public Offerings.xls | Public Offerings | Data export (capital markets transactions) | Historical | Low |

No `data/INDIAMART/external/` folder exists in this pool — no externally sourced alt-data, expert-call notes, channel checks, or broker research to inventory. Section 1A is omitted per the workflow rule (only added when external documents exist).

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | `IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf` (audited financial statements + auditor's report); companion `Form_Annual_Report(Jun-02-2026).pdf` is the Integrated Annual Report + AGM Notice for the same FY | FY ended Mar-31-2026 | ~3.4 (filed Apr-30-2026; today 2026-08-13) |
| Quarterly filing | `IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf` (audited condensed consolidated interim financial statements) | Quarter ended Jun-30-2026 (Q1 FY27) | ~0.7 (filed Jul-21-2026) |
| Earnings transcript | `IndiaMART InterMESH Limited, Q1 2027 Earnings Call, Jul 21, 2026.pdf` (verbatim CIQ/S&P Global transcript) | FQ1 2027 call, Jul-21-2026 | ~0.7 |
| Investor deck | Not available — no investor presentation / earnings deck file in this pool | — | — |
| Consensus / estimate export | `IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls`, Consensus tab (18 analysts) | Header: "Current Fiscal Year End: Mar-31-2027 \| FQ2 2027 Earnings Release Date: Oct-21-2026"; Recent Changes tab entries run through 2026-07-30 | ~0.5 (revision log current through 2026-07-30) |
| Cash flow data | `IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls`, Cash Flow tab; corroborated by the Jul-21-2026 quarterly filing's own cash flow statement | FY2022–FY2026 annual + LTM ended Jun-30-2026 | ~0.7 |
| Guidance data | `IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jul-21-2026).pdf` (Outcome of Board Meeting) + Q1 FY27 transcript prepared remarks/Q&A | Quarter ended Jun-30-2026 | ~0.7 |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | `Financials.xls`, Income Statement tab (FY2022–FY2026 + LTM Jun-30-2026); cross-checked against the Jul-21-2026 quarterly filing's own P&L statement | Needed for revenue, margin, EPS |
| Balance sheet | Y | `Financials.xls`, Balance Sheet tab; `Form_Interim_Report(Jul-21-2026).pdf` condensed consolidated interim balance sheet as at 30 June 2026 | Needed for working capital and leverage |
| Cash flow statement | Y | `Financials.xls`, Cash Flow tab (FY2022–FY2026 + LTM Jun-30-2026); `Form_Interim_Report(Jul-21-2026).pdf` condensed consolidated interim cash flow statement | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | `Form_Interim_Report(Jul-21-2026).pdf` — Q1 FY27, quarter ended Jun-30-2026, filed Jul-21-2026 | Needed for trend and setup |
| Last 8 quarters | Y | 22 verbatim quarterly-call transcripts (FQ3 2021 through FQ1 2027, Jan-19-2021 to Jul-21-2026) plus per-quarter actual/estimate figures in the CIQ Surprise and Trends tabs, plus explicit quarterly filings from Dec-2024 quarter onward | Needed for seasonality and inflection |
| Consensus estimates | Y | `IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls`, Consensus tab — 15–18 analysts on EPS/Target Price/LT Growth | Needed for market bar |
| Estimate revisions | Y | Same workbook, Recent Changes tab (analyst-level, dated entries through 2026-07-30) and Revisions tab (1/2/3-month upward/downward counts) | Needed for revision momentum |
| Earnings transcript | Y | 22 verbatim CIQ/S&P Global earnings-call transcripts, FQ3 2021–FQ1 2027; most recent `Q1 2027 Earnings Call, Jul 21, 2026.pdf` — full trust, prepared remarks + Q&A | Needed for management tone and driver detail |
| Segment P&L | Y | `Financials.xls`, Segments tab (2 segments: Web and Related Services; Accounting Software Services; FY2021–FY2026 annual); quarterly segment note also disclosed inside each interim filing itself (e.g. `Form_Interim_Report(Jul-21-2026).pdf`, Note 4 "Segment Information") | Needed for mix shift |
| Current price | Y (with caveat) | `Financials (1).xls`, Key Stats tab — Share Price ₹1,784.60 under "Current Capitalization"; exact as-of date not printed in the extracted text (CIQ "current" snapshot, extraction run 2026-08-13) | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y — `analyses/INDIAMART_2026-08-13/business-model/03_segment-map.md` exists |
| 06_value-chain.md | Y — `analyses/INDIAMART_2026-08-13/business-model/06_value-chain.md` exists |
| 10_external-dependency.md | Y — `analyses/INDIAMART_2026-08-13/business-model/10_external-dependency.md` exists |

The full business-model module (00 through 99, plus dossier) has already run for this ticker/date — all three cross-module inputs are present and should be read by downstream earnings agents (02, 03, 06 per MODULE_RULES.md).

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus (18 analysts) and full revision history present | 04, 05, 99 | None |
| No quarterly data | N — quarterly filings present from Dec-2024 quarter onward, plus 22 quarters of transcripts | 01, 02, 03, 06 | None |
| No VERBATIM transcript, sell-side proxy present | N — a genuine verbatim CIQ transcript is present for every quarter through Q1 FY27; no sell-side "Earnings Call Insight" proxy exists in this pool (the `Analyst Coverage.rtf` file is a broker roster/target-price/rating list only — no call summary — so it is not even usable as a proxy) | 02, 03, 04 | None |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | None |
| No segment-level P&L | N — 2-segment P&L present annually (CIQ) and quarterly (filing notes) | 02, 03, 99 | None |
| No cash flow statement | N — full annual + LTM + quarterly cash flow statements present | 06, 99 | None |
| No current price | N — CIQ Key Stats reports a current share price (₹1,784.60); exact as-of date not printed in the extract, so downstream agents citing it should note the caveat rather than treat it as a dated quote | 99 | None (informational caveat only) |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has a recent audited annual filing (FY ended Mar-31-2026), the latest audited quarterly filing (Q1 FY27, quarter ended Jun-30-2026, filed Jul-21-2026) with a matching verbatim earnings-call transcript from the same day, full income statement / balance sheet / cash flow statement coverage, segment-level P&L at both annual and quarterly granularity, and current consensus estimates with revision history — every element of the Sufficient bar is met with no proxy substitutions needed.
- **Active partial-data caps:** None — no partial-data flag in Section 5 applies.
- **Critical missing items:** None. Minor, non-blocking notes for downstream agents:
  - No investor presentation / earnings deck is in the pool — not required for sufficiency, but 04_guidance-consensus should rely on the transcript and the Outcome-of-Board-Meeting press releases for guidance colour instead.
  - Several CIQ workbook exports are exact duplicates of each other (e.g. `Financials.xls` vs `Financials (1).xls` vs the individual `Financials Income Statement.xls` / `Financials Balance Sheet.xls` / `Financials Cash Flow.xls` / etc. all carry the same tab content) — downstream agents should treat these as one source, not corroborating independent sources.
  - `IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-21-2025).pdf` is mislabeled by the router as "Preliminary" but its content is the full audited quarterly financial statements for the Dec-2024 quarter (Q3 FY25) — treat it as a quarterly filing, not a press release.
  - The current share price in the Key Stats export (₹1,784.60) carries no printed as-of date in the extracted text; 99_earnings-synthesis and the master synthesizer should re-verify against a dated source (e.g. an IBKR screenshot or exchange quote) before using it for stock-reaction framing.
