# Data Triage — UBER

## 1. File Inventory

All 7 multi-tab workbooks were pre-extracted with `.claude/tools/extract_pool.py` (`analyses/UBER_2026-08-09/_pool_extracts/manifest.md`, 0 failures across 51 tabs / 65 extract files). Every tab is listed below as its own row per this module's inventory rule. "Last Modified" is the pool-sync timestamp (Drive-sync artifact per fix F23) and is NOT used to judge recency — period is parsed from inside each document instead.

| Filename | Type | Period Covered | Last Modified | Notes |
|---|---|---|---|---|
| Uber_Technologies_Inc_-_Form_10-K(Feb-13-2026).doc | Annual filing (10-K) | FY ended Dec-31-2025 | Aug 8 21:42 (sync) | Filed Feb-13-2026; audited financials + auditor's report inside confirm period. |
| Uber_Technologies_Inc_-_Form_10-Q(Aug-05-2026).doc | Quarterly filing (10-Q) | Quarter ended Jun-30-2026 (Q2 FY26) | Aug 8 21:42 (sync) | Filed Aug-05-2026; CEO/CFO certifications confirm period. |
| Uber_Technologies_Inc_-_Form_10-Q(May-06-2026).doc | Quarterly filing (10-Q) | Quarter ended Mar-31-2026 (Q1 FY26) | Aug 8 21:42 (sync) | Filed May-06-2026. |
| Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.rtf | Earnings transcript | Q2 FY26 (call held Aug-05-2026) | Aug 7 00:23 (sync) | Most recent transcript. |
| Uber Technologies, Inc., Q1 2026 Earnings Call, May 06, 2026.rtf | Earnings transcript | Q1 FY26 (call held May-06-2026) | Aug 7 00:23 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Key Stats | Data export (CIQ) | FY2016A–FY2025A | Aug 7 00:24 (sync) | Tab of multi-tab workbook. |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Income Statement | Data export (CIQ) | FY2016A–FY2025A | Aug 7 00:24 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Balance Sheet | Data export (CIQ) | FY2016A–FY2025A | Aug 7 00:24 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Cash Flow | Data export (CIQ) | FY2016A–FY2025A | Aug 7 00:24 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Multiples | Data export (CIQ) | FY2016A–FY2025A | Aug 7 00:24 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Historical Capitalization | Data export (CIQ) | FY2016A–FY2025A | Aug 7 00:24 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Capital Structure Summary | Data export (CIQ) | FY2016A–FY2025A | Aug 7 00:24 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Capital Structure Details | Data export (CIQ) | FY2016A–FY2025A | Aug 7 00:24 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Ratios | Data export (CIQ) | FY2016A–FY2025A | Aug 7 00:24 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Supplemental | Data export (CIQ) | FY2016A–FY2025A | Aug 7 00:24 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Industry Specific | Data export (CIQ) | FY2016A–FY2025A | Aug 7 00:24 (sync) | Thin tab (15×6). |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Pension OPEB | Data export (CIQ) | FY2016A–FY2025A | Aug 7 00:24 (sync) | Thin tab (15×6), largely N/A for Uber (no material pension plan). |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Segments | Data export (CIQ) | FY2016A–FY2025A | Aug 7 00:24 (sync) | Annual segment splits. |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Key Stats | Data export (CIQ) | Quarterly through Jun-30-2026 + LTM | Aug 7 00:26 (sync) | Confirmed latest quarter column = Jun-30-2026. |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Income Statement | Data export (CIQ) | Quarterly through Jun-30-2026 + LTM | Aug 7 00:26 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Balance Sheet | Data export (CIQ) | Quarterly through Jun-30-2026 + LTM | Aug 7 00:26 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Cash Flow | Data export (CIQ) | Quarterly through Jun-30-2026 + LTM | Aug 7 00:26 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Multiples | Data export (CIQ) | Quarterly through Jun-30-2026 + LTM | Aug 7 00:26 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Historical Capitalization | Data export (CIQ) | Quarterly through Jun-30-2026 + LTM | Aug 7 00:26 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Capital Structure Summary | Data export (CIQ) | Quarterly through Jun-30-2026 + LTM | Aug 7 00:26 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Capital Structure Details | Data export (CIQ) | Quarterly through Jun-30-2026 + LTM | Aug 7 00:26 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Ratios | Data export (CIQ) | Quarterly through Jun-30-2026 + LTM | Aug 7 00:26 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Supplemental | Data export (CIQ) | Quarterly through Jun-30-2026 + LTM | Aug 7 00:26 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Industry Specific | Data export (CIQ) | Quarterly through Jun-30-2026 + LTM | Aug 7 00:26 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Pension OPEB | Data export (CIQ) | Quarterly through Jun-30-2026 + LTM | Aug 7 00:26 (sync) | |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Segments | Data export (CIQ) | Quarterly through Jun-30-2026 + LTM | Aug 7 00:26 (sync) | Quarterly segment (Mobility / Delivery / Freight) splits — key for unit-economics and segment-map agents. |
| Company Comparable Analysis Uber Technologies Inc.xls — Business Description | Data export (CIQ) | Current (as of pull) | Aug 6 20:36 (sync) | |
| Company Comparable Analysis Uber Technologies Inc.xls — Financial Data | Data export (CIQ) | Current (as of pull) | Aug 6 20:36 (sync) | Peer comp set. |
| Company Comparable Analysis Uber Technologies Inc.xls — Trading Multiples | Data export (CIQ) | Current (as of pull) | Aug 6 20:36 (sync) | |
| Company Comparable Analysis Uber Technologies Inc.xls — Operating Statistics | Data export (CIQ) | Current (as of pull) | Aug 6 20:36 (sync) | |
| Company Comparable Analysis Uber Technologies Inc.xls — Implied Valuation | Data export (CIQ) | Current (as of pull) | Aug 6 20:36 (sync) | Valuation module territory, not business-model. |
| Company Comparable Analysis Uber Technologies Inc.xls — Valuation Chart | Data export (CIQ) | Current (as of pull) | Aug 6 20:36 (sync) | |
| Company Comparable Analysis Uber Technologies Inc.xls — Credit Health Panel | Data export (CIQ) | Current (as of pull) | Aug 6 20:36 (sync) | Balance-sheet-survival module territory. |
| Company Comparable Analysis Uber Technologies Inc.xls — Disclaimer | Data export (CIQ) | n/a | Aug 6 20:36 (sync) | Boilerplate. |
| Short Iinterest_12m_Uber.xls — Chart 1 with Data | Data export (CIQ) | Trailing 12 months to pull date | Aug 8 22:00 (sync) | Trading/positioning data — not a business-model input. |
| Short Iinterest_12m_Uber.xls — Attributions | Data export (CIQ) | n/a | Aug 8 22:00 (sync) | |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Consensus | Data export (CIQ estimates) | Consensus as of pull date | Aug 6 20:23 (sync) | |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Recent Changes | Data export (CIQ estimates) | Consensus as of pull date | Aug 6 20:23 (sync) | |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Guidance | Data export (CIQ estimates) | Consensus as of pull date | Aug 6 20:23 (sync) | |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Multiples | Data export (CIQ estimates) | Consensus as of pull date | Aug 6 20:23 (sync) | |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Surprise | Data export (CIQ estimates) | Consensus as of pull date | Aug 6 20:23 (sync) | |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Trends | Data export (CIQ estimates) | Consensus as of pull date | Aug 6 20:23 (sync) | |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Revisions | Data export (CIQ estimates) | Consensus as of pull date | Aug 6 20:23 (sync) | |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — [7 tabs, same as above] | Data export (CIQ estimates) | Consensus as of pull date | Aug 8 21:40 (sync) | Byte-for-byte different file from the un-suffixed export (`diff` confirms non-identical); appears to be a re-pull/duplicate of the same estimates report. Not a distinct source type — noted, not double-counted. |
| Uber Technologies Inc NYSE UBER Events Calendar.xls — Events Calendar | Data export (CIQ) | Timeframe 2026 | Aug 8 21:43 (sync) | Confirms earnings-call and AGM dates already seen elsewhere (Feb-04-2026, May-06-2026 calls). Useful for catalyst cross-check, not business-model. |
| Uber Technologies Inc NYSE UBER Analyst Coverage.rtf | Data export (CIQ) | Current (as of pull) | Aug 6 20:27 (sync) | Sell-side coverage list. |
| Uber Technologies Inc NYSE UBER Board Members.rtf | Data export (CIQ) | Current (as of pull) | Aug 6 20:32 (sync) | Governance module territory. |
| Uber Technologies Inc NYSE UBER Customers.rtf | Data export (CIQ) | Current (as of pull) | Aug 7 00:25 (sync) | Named customer/partner relationships — relevant to value-chain / customer-geography agents. |
| Uber Technologies Inc NYSE UBER Key Developments.rtf | Data export (CIQ, news/events log) | Rolling — entries through Aug-06-2026 | Aug 7 00:25 (sync) | Very large (1.2MB / 364KB extract); latest entries dated Aug-06-2026 (e.g. Wayve/Uber London robotaxi approval). |
| Uber Technologies Inc NYSE UBER Products.rtf | Data export (CIQ) | Current (as of pull) | Aug 6 20:27 (sync) | Product/segment description — direct input to business-identity / segment-map. |
| Uber Technologies Inc NYSE UBER Professionals.rtf | Data export (CIQ) | Current (as of pull) | Aug 6 20:32 (sync) | Management roster. |
| Uber Technologies Inc NYSE UBER Public Company Profile.rtf | Data export (CIQ) | Current (as of pull) | Aug 8 21:41 (sync) | Confirms Delaware incorporation, NYSE listing. |
| Uber Technologies Inc NYSE UBER Suppliers.rtf | Data export (CIQ) | Current (as of pull) | Aug 7 00:25 (sync) | Named supplier/partner relationships — value-chain input. |
| UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | Data export (CIQ landscape report + news digest) | Rolling — latest entries Aug-06-2026 | Aug 6 20:28 (sync) | Large combined report (3.3MB); includes dated news digest (Daily Dose entries dated Aug-06-2026, Aug-03-2026). |

No `external/` folder exists under `data/UBER/`, so Section 1A (External Data) is omitted.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | Uber_Technologies_Inc_-_Form_10-K(Feb-13-2026).doc | FY ended Dec-31-2025 | ~7 months (filed Feb-13-2026; period-end Dec-31-2025 to today Aug-09-2026) |
| Quarterly filing | Uber_Technologies_Inc_-_Form_10-Q(Aug-05-2026).doc | Quarter ended Jun-30-2026 (Q2 FY26) | <1 month (filed Aug-05-2026) |
| Earnings transcript | Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.rtf | Q2 FY26 | <1 month |
| Investor deck | Not present in pool | — | — |
| Data export | Uber Technologies Inc NYSE UBER Financials_Quarterly.xls (Key Stats tab, latest column Jun-30-2026) | Through Q2 FY26 / LTM | <1 month |

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | Public Company Profile — NYSE listing [Uber Technologies Inc NYSE UBER Public Company Profile.rtf] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | 10-K, 10-Q forms with SOX §906 CEO/CFO certifications [FY25 10-K; Q1 FY26 10-Q; Q2 FY26 10-Q] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | "in conformity with accounting principles generally accepted in the United States of America" [FY25 10-K, auditor's report]; CIQ Consensus tab header states "Acctg. Standard: US GAAP" [UberTechnologies,IncNYSEUBEREstimatesReport.xls, Consensus tab] |
| Reporting currency + fiscal-year end | USD; fiscal year ends Dec-31 | "consolidated balance sheets ... as of December 31, 2025 and 2024" [FY25 10-K, auditor's report]; incorporated in Delaware, common stock par value $0.00001 [FY25 10-K] |
| Document language(s) | English (all documents) | All filings, transcripts, and CIQ exports are in English — no non-English documents in this pool. |

No jurisdiction mismatch to flag: Uber is a Delaware-incorporated, NYSE-listed US filer, so US SEC forms (10-K, 10-Q) are the correct primary source and are all present.

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent annual filing (FY25 10-K, period-end Dec-31-2025, filed Feb-13-2026) is present alongside two recent quarterly filings and matching transcripts (Q1 FY26 filed May-06-2026, Q2 FY26 filed Aug-05-2026, both within the last 6 months), satisfying the "Sufficient" rule with margin.
- **Critical missing items:** None required for sufficiency. Note for downstream agents: no standalone investor presentation/deck is in the pool (the CIQ "Public Company Profile" and "CIQReportLandscape" reports are vendor summaries, not the company's own deck) — this is a minor gap, not a sufficiency blocker, since two quarterly filings and two earnings transcripts already exceed the rule's requirement.
