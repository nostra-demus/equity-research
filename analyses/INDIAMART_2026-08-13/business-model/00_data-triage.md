# Data Triage — INDIAMART

## 1. File Inventory

Note on dates: every file in `data/INDIAMART/` carries the same filesystem last-modified date (2026-08-13), which is the Drive-sync date for this pool, not the document's real vintage (CLAUDE.md §27 fix F23). "Period Covered" below is read from inside each document (filing subject line, fiscal-period header, or transcript title), not from the file timestamp. `_pool_extracts/manifest.json` reports 0 extraction failures across 85 sources (38 workbooks → 81 tabs + 47 non-workbook files), so no source is downgraded to "missing" for extraction failure (fix F03).

| Filename | Type | Period Covered | Last Modified | Notes |
|---|---|---|---|---|
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-21-2025).pdf | Quarterly filing (exchange intimation) | Duplicate/near-duplicate of Jan-22-2025 preliminary interim filing | 2026-08-13 (sync) | Preliminary version |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-22-2025).pdf | Quarterly filing (exchange intimation) | Q3 FY25 (qtr ended Dec 31, 2024) | 2026-08-13 (sync) | Preliminary version |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Apr-29-2025).pdf | Quarterly filing (exchange intimation) | Q4/FY25 (year ended Mar 31, 2025), preliminary | 2026-08-13 (sync) | Superseded by final Annual Report FY25 |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-29-2025).pdf | Annual filing (audited results announcement) | FY ended Mar 31, 2025 | 2026-08-13 (sync) | Audited standalone + consolidated financials to BSE/NSE |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jul-18-2025).pdf | Quarterly filing (exchange intimation) | Q1 FY26 (qtr ended Jun 30, 2025), preliminary | 2026-08-13 (sync) | |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-18-2025).pdf | Quarterly filing | Q1 FY26 (qtr ended Jun 30, 2025) | 2026-08-13 (sync) | Audited quarterly financials to BSE/NSE |
| IndiaMART InterMESH Limited, Q1 2026 Earnings Call, Jul 30, 2024.pdf | Transcript | FQ1 2026 (qtr ended Jun 30, 2024) — label is CIQ's fiscal-year numbering, one year offset from the company's own FY label | 2026-08-13 (sync) | S&P Capital IQ transcript |
| IndiaMART InterMESH Limited, Q1 2025 Earnings Call, Jul 30, 2024.pdf | Transcript | Same call as above (duplicate title with differing CIQ FY tag) | 2026-08-13 (sync) | |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Oct-17-2025).pdf | Quarterly filing (exchange intimation) | Q2 FY26 (qtr ended Sep 30, 2025), preliminary | 2026-08-13 (sync) | |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Oct-17-2025).pdf | Quarterly filing | Q2 FY26 (qtr ended Sep 30, 2025) | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited, Q2 2026 Earnings Call, Oct 17, 2025.pdf | Transcript | Q2 FY26 (qtr ended Sep 30, 2025) | 2026-08-13 (sync) | |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jan-20-2026).pdf | Quarterly filing | Q3 FY26 (qtr ended Dec 31, 2025) | 2026-08-13 (sync) | |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-20-2026).pdf | Quarterly filing (exchange intimation) | Q3 FY26 (qtr ended Dec 31, 2025), preliminary | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited, Q3 2026 Earnings Call, Jan 20, 2026.pdf | Transcript | Q3 FY26 (qtr ended Dec 31, 2025) | 2026-08-13 (sync) | |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf | Annual filing (audited results announcement) | Q4/FY ended Mar 31, 2026 | 2026-08-13 (sync) | Results-announcement version (letter + statements) |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Annual_Report(Apr-30-2026).pdf | Annual filing (preliminary) | FY ended Mar 31, 2026, preliminary | 2026-08-13 (sync) | |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Apr-30-2026).pdf | Quarterly filing (exchange intimation) | Q4 FY26 (qtr ended Mar 31, 2026), preliminary | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited, Q4 2026 Earnings Call, Apr 30, 2026.pdf | Transcript | Q4/FY26 (qtr and year ended Mar 31, 2026) | 2026-08-13 (sync) | |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf | Annual filing — **full Integrated Annual Report + AGM Notice** | FY 2025-26 (year ended Mar 31, 2026); 27th AGM notice dated Jun 29, 2026 | 2026-08-13 (sync) | Confirmed Ind AS in body text (Section 133, Companies Act 2013); this is the MOST RECENT full annual filing |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf | Quarterly filing | Q1 FY27 (qtr ended Jun 30, 2026) | 2026-08-13 (sync) | **Most recent quarterly filing** |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jul-21-2026).pdf | Quarterly filing (exchange intimation) | Q1 FY27 (qtr ended Jun 30, 2026), preliminary | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited, Q1 2027 Earnings Call, Jul 21, 2026.pdf | Transcript | FQ1 2027 (qtr ended Jun 30, 2026) | 2026-08-13 (sync) | **Most recent transcript**; consensus tables inside dated Jul-14-2026 |
| IndiaMART InterMESH Limited, Q1 2022 – Q4 2025 Earnings Call*.pdf (20 files, Jan 2021 – Apr 2025) | Transcript (historical) | FQ3 2021 (Jan 2021) through FQ4 2025 (Apr 2025) | 2026-08-13 (sync) | Long unbroken transcript history, ~19 quarters |
| IndiaMART InterMESH Limited - ShareholderAnalyst Call.pdf | Investor/analyst call transcript | Jun 20, 2024 | 2026-08-13 (sync) | Older ad hoc shareholder/analyst call; not the primary deck substitute |
| Company Comparable Analysis IndiaMART InterMESH Limited.xls — tab: Financial Data | Data export (CIQ) | Multi-year, "as of" not explicit in header | 2026-08-13 (sync) | |
| Company Comparable Analysis ... .xls — tab: Trading Multiples | Data export (CIQ) | Current + historical multiples | 2026-08-13 (sync) | |
| Company Comparable Analysis ... .xls — tab: Operating Statistics | Data export (CIQ) | Peer operating stats | 2026-08-13 (sync) | |
| Company Comparable Analysis ... .xls — tab: Business Description | Data export (CIQ) | — | 2026-08-13 (sync) | |
| Company Comparable Analysis ... .xls — tab: Implied Valuation | Data export (CIQ) | — | 2026-08-13 (sync) | |
| Company Comparable Analysis ... .xls — tab: Valuation Chart | Data export (CIQ) | — | 2026-08-13 (sync) | |
| Company Comparable Analysis ... .xls — tab: Credit Health Panel | Data export (CIQ) | — | 2026-08-13 (sync) | |
| Company Comparable Analysis ... .xls — tab: Disclaimer | Data export (CIQ) | — | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited (NSEI_INDIAMART) Corporate Structure Tree.xls — 3 tabs (main tree, Filtered Count, Aggregates) | Data export (CIQ) | Current corporate structure | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Analyst Coverage.rtf | Data export (CIQ, sell-side coverage list) | Current | 2026-08-13 (sync) | Analyst names, target prices, recommendations |
| IndiaMART InterMESH Limited NSEI INDIAMART Auditors.xls | Data export (CIQ) | Auditor history | 2026-08-13 (sync) | BS R & Co. LLP confirmed as auditor in filings |
| IndiaMART InterMESH Limited NSEI INDIAMART Board Members.xls | Data export (CIQ) | Current board roster | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Committees.xls | Data export (CIQ) | Current board committees | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Comparable M A Transactions.xls | Data export (CIQ) | M&A comparables | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Compensation Summary Compensation.xls | Data export (CIQ) | Executive compensation history | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Competitors.xls | Data export (CIQ) | Current named competitors | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Corporate Timeline.xls | Data export (CIQ) | Corporate history/timeline | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Credit Health Panel.xls — 5 tabs (Summary, Financials, Operational Metrics Charts, Solvency Metrics Charts, Liquidity Metrics Charts, Disclaimer) | Data export (CIQ) | Multi-year credit metrics | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Customers.xls | Data export (CIQ) | Recently disclosed customers (last 2 yrs) | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Events Calendar.xls | Data export (CIQ) | Corporate events calendar | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls — 13 tabs (Key Stats, Income Statement, Balance Sheet, Cash Flow, Multiples, Historical Capitalization, Capital Structure Summary, Capital Structure Details, Ratios, Supplemental, Industry Specific, Pension OPEB, Segments) | Data export (CIQ) | FY Mar-2022 through FY Mar-2026 + LTM Jun-2026; Key Stats extends to FY Mar-2029E | 2026-08-13 (sync) | Confirms INR reporting currency, fiscal year end Mar-31; Segments tab covers FY21–FY26 |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Balance Sheet.xls | Data export (CIQ) | Duplicate of Financials(1) Balance Sheet tab | 2026-08-13 (sync) | Standalone single-tab duplicate |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Capital Structure Details.xls | Data export (CIQ) | Duplicate of Financials(1) tab | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Capital Structure Summary.xls | Data export (CIQ) | Duplicate of Financials(1) tab | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Cash Flow.xls | Data export (CIQ) | Duplicate of Financials(1) tab | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Income Statement (1).xls | Data export (CIQ) | Duplicate of Financials(1) tab | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Income Statement.xls | Data export (CIQ) | Duplicate of Financials(1) tab | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Key Stats.xls | Data export (CIQ) | Duplicate of Financials(1) Key Stats tab (86×9 vs 91×9 — slightly different snapshot) | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Pension OPEB.xls | Data export (CIQ) | Duplicate of Financials(1) tab | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Ratios.xls | Data export (CIQ) | Duplicate of Financials(1) tab | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Segments.xls | Data export (CIQ) | Duplicate of Financials(1) Segments tab | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Supplemental.xls | Data export (CIQ) | Duplicate of Financials(1) tab | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls — 12 tabs (same set as Financials (1), minus one) | Data export (CIQ) | Same coverage as Financials (1).xls | 2026-08-13 (sync) | Byte-identical size to Financials (1).xls — near-duplicate workbook |
| IndiaMART InterMESH Limited NSEI INDIAMART Fixed Income Securities Summary.xls | Data export (CIQ) | Current debt securities | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Industry Classifications.rtf | Data export (CIQ) | Current | 2026-08-13 (sync) | "Trading Companies and Distributors" primary classification |
| IndiaMART InterMESH Limited NSEI INDIAMART Investment Analysis Co Investors.xls | Data export (CIQ) | Investor/shareholder list | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Investment Analysis Direct Investments.xls | Data export (CIQ) | Direct investments held | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Key Developments.xls | Data export (CIQ) | Key corporate developments log | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Long Business Description.rtf | Data export (CIQ) | Current | 2026-08-13 (sync) | Business/segment description |
| IndiaMART InterMESH Limited NSEI INDIAMART Offices.rtf | Data export (CIQ) | Current | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Private Ownership.rtf | Data export (CIQ) | Current | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Products.xls | Data export (CIQ) | Current product list | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Professionals.rtf | Data export (CIQ) | Current management/professional bios | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Public Company Profile.rtf | Data export (CIQ) | Current | 2026-08-13 (sync) | Confirms 5,384 employees, founded 1999, NSEI:INDIAMART |
| IndiaMART InterMESH Limited NSEI INDIAMART Public Ownership Summary.rtf | Data export (CIQ) | Current | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Strategic Alliances.xls | Data export (CIQ) | Current alliances | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Suppliers.xls | Data export (CIQ) | Disclosed suppliers | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Transaction Advisors.xls | Data export (CIQ) | Deal advisors used | 2026-08-13 (sync) | |
| IndiaMART InterMESH Limited NSEI INDIAMART Transcripts.xls | Data export (CIQ, transcript index) | Index of transcripts, not full text | 2026-08-13 (sync) | |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls — tab: Consensus | Data export (CIQ consensus estimates) | Consensus as of Jul-14-2026 | 2026-08-13 (sync) | |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls — tab: Recent Changes | Data export (CIQ) | Recent estimate revisions | 2026-08-13 (sync) | |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls — tab: Multiples | Data export (CIQ) | Consensus-implied multiples | 2026-08-13 (sync) | |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls — tab: Surprise | Data export (CIQ) | Historical estimate-vs-actual surprise | 2026-08-13 (sync) | |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls — tab: Trends | Data export (CIQ) | Estimate trend history | 2026-08-13 (sync) | |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls — tab: Revisions | Data export (CIQ) | Estimate revision history | 2026-08-13 (sync) | |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport (1).xls — tab: Consensus | Data export (CIQ) | Byte-for-byte duplicate of the Consensus tab above | 2026-08-13 (sync) | Only 1 tab present in this copy vs. 6 in the primary file |
| Transaction Summary M A Private Placements.xls | Data export (CIQ) | Historical M&A / private placement transactions | 2026-08-13 (sync) | |
| Transaction Summary Public Offerings.xls | Data export (CIQ) | Historical public offerings | 2026-08-13 (sync) | |

No files exist under `data/INDIAMART/external/`, so there is no Section 1A external-data table for this pool.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months, vs 2026-08-13) |
|---|---|---|---|
| Annual filing | IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf (Integrated Annual Report + AGM Notice) | FY ended Mar 31, 2026 | ~2.4 months since publication (Jun 2, 2026); ~4.4 months since fiscal year-end |
| Quarterly filing | IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf | Q1 FY27, qtr ended Jun 30, 2026 | ~0.7 months |
| Earnings transcript | IndiaMART InterMESH Limited, Q1 2027 Earnings Call, Jul 21, 2026.pdf | Qtr ended Jun 30, 2026 | ~0.7 months |
| Investor deck | None present in pool | — | — |
| Data export | IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls (Key Stats/Income Statement tabs, LTM to Jun-30-2026) and Estimates Report Consensus tab (as of Jul-14-2026) | LTM through Jun 30, 2026 / consensus as of Jul-14-2026 | ~1.2 months (consensus) |

Note: no standalone "investor presentation / investor deck" file is in the pool — the closest analogue is the "ShareholderAnalyst Call" transcript (Jun 20, 2024, dated) and the Q1 2027 earnings-call transcript's prepared remarks. Per the sufficiency rule, transcripts are an accepted substitute for a deck, and the pool has a transcript inside the last 6 months, so this does not by itself create a gap.

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | India (NSE: INDIAMART; BSE: 542726) | Every regulatory filing addressed "To, BSE Limited / National Stock Exchange of India Limited" [FY26 Annual Report letter, Jun-02-2026] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | India — SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015, plus Companies Act 2013 | "Regulations 30, 34 of SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015" [FY26 Annual Report/AGM letter, Jun-02-2026]; results letters cite "quarter and financial year ended March 31, 2026" audited statements filed to BSE/NSE |
| Reporting standard (US GAAP / IFRS / Ind AS) | Ind AS | "The Financial Statements of the Company complied with all aspects of Indian Accounting Standards (IND AS) notified under Section 133 of the Companies Act, 2013" [FY26 Integrated Annual Report, Jun-02-2026] |
| Reporting currency + fiscal-year end | INR (₹), fiscal year ends March 31 | CIQ Financials export header: "Currency: INR" across all periods, "For the Fiscal Period Ending ... Mar-31-2022" through "Mar-31-2026" [Financials (1).xls, Income Statement tab]; results letters filed for "financial year ended March 31" each year |
| Document language(s) | English (all filings, transcripts, and exports reviewed are in English; no non-English source documents found in this pool) | Direct reading of all extracts |

Downstream agents should read/cite the Integrated Annual Report (Board's Report + MD&A + Notes to Accounts + BRSR), the quarterly SEBI LODR Reg 33 results filings, and NSE/BSE Reg 30 intimations as the local-equivalent documents (CLAUDE.md §27) — do not mark this pool "missing a 10-K" or "missing an 8-K"; those US forms simply do not apply here.

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has a full audited annual filing from ~2.4 months ago (FY26 Integrated Annual Report, year ended Mar 31, 2026) and a quarterly filing plus an earnings-call transcript both from ~3 weeks ago (Q1 FY27, quarter ended Jun 30, 2026) — both legs of the sufficiency rule are met with wide margin, on top of ~19 consecutive quarters of transcript history (Jan 2021–Jul 2026), CIQ financial/segment/credit exports through LTM Jun-2026, and sell-side consensus dated Jul-14-2026.
- **Critical missing items:** None blocking. Minor note (not a gap): no dedicated "investor presentation" deck file is in the pool; transcripts substitute per the sufficiency rule. The pool also carries a large number of duplicate/near-duplicate CIQ workbook exports (e.g., "Financials.xls" vs "Financials (1).xls"; six single-tab "Financials <X>.xls" files each replicating a tab already inside "Financials (1).xls") — this is redundancy, not a coverage gap, and downstream agents should treat the duplicates as one source when reconciling numbers.
