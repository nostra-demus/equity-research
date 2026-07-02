# Earnings Data Triage — EMAR

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United Arab Emirates | Filing header: "DFM:EMAAR", ISIN AEE000030101 |
| Exchange | Dubai Financial Market (DFM) | All exchange filings state "سوق دبي المالي" (Dubai Financial Market) |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | UAE / DFM disclosure regime — Preliminary Interim Reports and Preliminary Annual Reports filed to the DFM | Filing titles: "Form Preliminary Interim Report" and "Form Preliminary Annual Report" / "Form Annual Report" |
| Reporting standard (US GAAP / IFRS / Ind AS) | IFRS | Capital IQ consensus export header: "Acctg. Standard: IFRS"; Surprise tab confirms IFRS for every year 2003–2025 |
| Reporting currency | AED (UAE Dirham) | All financial data headers: "Currency: AED"; filings state amounts in AED millions |
| Fiscal-year end | 31 December | All annual periods end Dec-31 (e.g. FY 2025 = 12 months Dec-31-2025) |

Set these so later agents apply CLAUDE.md §27 and read/cite the local-equivalent document. EMAR is a UAE company listed on the DFM. There are no US forms (10-K, 10-Q, 8-K) — the local equivalents are the Annual Report (audited full-year), Preliminary Annual Report (preliminary results release filed to DFM), and Preliminary Interim Reports (quarterly results filed to DFM). Do not mark any US form absent.

---

## 1. File Inventory

All extractions succeeded: 0 failures out of 20 workbooks (57 tabs) + PDFs + RTFs. Every source is usable.

| Filename | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| Emaar_Properties_PJSC-Annual_Report(Mar-14-2025).pdf | Annual filing (audited, comprehensive) | FY 2024 (year ended Dec-31-2024) | Mar 14 2025 (filing date) | High |
| Emaar_Properties_PJSC_-_Form_Annual_Report(Mar-14-2025).pdf | Annual filing (DFM form version, same document) | FY 2024 (year ended Dec-31-2024) | Mar 14 2025 | High |
| Emaar_Properties_PJSC_-_Form_Annual_Report(Nov-03-2020).pdf | Annual filing | FY 2019 (year ended Dec-31-2019) | Nov 3 2020 | Low (historical only) |
| Emaar_Properties_PJSC_-_Form_Annual_Report(Dec-20-2019).pdf | Annual filing | FY 2018 (year ended Dec-31-2018) | Dec 20 2019 | Low (historical only) |
| Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Feb-12-2026).pdf | Preliminary annual report (DFM filing) — investor presentation format | FY 2025 (year ended Dec-31-2025) | Feb 12 2026 | High |
| Emaar_Properties_PJSC-Preliminary_Annual_Report(Feb-12-2026).pdf | Preliminary annual report (same document, duplicate) | FY 2025 (year ended Dec-31-2025) | Feb 12 2026 | High |
| Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Mar-30-2026).pdf | Preliminary annual report — DFM form with summary financials | FY 2025 (year ended Dec-31-2025) | Mar 30 2026 | High |
| Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Feb-08-2024).pdf | Preliminary annual report | FY 2023 (year ended Dec-31-2023) | Feb 8 2024 | Medium |
| Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Feb-14-2023).pdf | Preliminary annual report | FY 2022 (year ended Dec-31-2022) | Feb 14 2023 | Medium |
| Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Apr-08-2026).pdf | Preliminary interim report — Q1 2025 press release (Arabic, filed Apr 8 / published May 8 2025) | Q1 2025 (3 months ended Mar-31-2025) | Apr 8 2026 (sync date; content dated May 8 2025) | High |
| Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Dec-17-2025).pdf | Preliminary interim report — DFM filing for Q3 2025 / 9M 2025 | Q3 2025 / 9M 2025 (ended Sep-30-2025) | Dec 17 2025 | High |
| Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Dec-03-2025).pdf | Preliminary interim report | Q3 2025 period (Dec 3 2025 filing date) | Dec 3 2025 | High |
| Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Nov-17-2025).pdf | Preliminary interim report | Q3 2025 (ended Sep-30-2025) | Nov 17 2025 | High |
| Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(May-14-2024).pdf | Preliminary interim report | Q1 2024 (ended Mar-31-2024) | May 14 2024 | Medium |
| Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Aug-30-2023).pdf | Preliminary interim report | H1 2023 (ended Jun-30-2023) | Aug 30 2023 | Medium |
| Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Dec-13-2022).pdf | Preliminary interim report | 9M 2022 (ended Sep-30-2022) | Dec 13 2022 | Medium |
| Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(May-13-2022).pdf | Preliminary interim report | Q1 2022 (ended Mar-31-2022) | May 13 2022 | Low |
| Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Feb-14-2022).pdf | Preliminary interim report | FY 2021 preliminary | Feb 14 2022 | Low |
| Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Aug-11-2021).pdf | Preliminary interim report | H1 2021 (ended Jun-30-2021) | Aug 11 2021 | Low |
| Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Aug-12-2020).pdf | Preliminary interim report | H1 2020 (ended Jun-30-2020) | Aug 12 2020 | Low |
| Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Nov-14-2021).pdf | Preliminary interim report | Q3 2021 (ended Sep-30-2021) | Nov 14 2021 | Low |
| **Workbook: Emaar Properties PJSC DFM EMAAR Financials_Annual.xls** | Capital IQ annual financials export — 12 tabs | FY 2021 – FY 2025 + LTM Mar-31-2026 (AED) | Sync date | High |
| — tab: Key Stats | Annual key statistics | FY 2021–FY 2025 + LTM | — | High |
| — tab: Income Statement | Annual income statement | FY 2021–FY 2025 + LTM Mar-31-2026 | — | High |
| — tab: Balance Sheet | Annual balance sheet | FY 2021–FY 2025 + LTM | — | High |
| — tab: Cash Flow | Annual cash flow statement | FY 2021–FY 2025 + LTM | — | High |
| — tab: Multiples | Annual trading multiples | FY 2021–FY 2025 + LTM | — | Medium |
| — tab: Historical Capitalization | Capital structure history | FY 2021–FY 2025 + LTM | — | Medium |
| — tab: Capital Structure Summary | Debt structure annual | FY 2021–FY 2025 + LTM | — | Medium |
| — tab: Capital Structure Details | Debt details | FY 2021–FY 2025 + LTM | — | Medium |
| — tab: Ratios | Financial ratios annual | FY 2021–FY 2025 + LTM | — | Medium |
| — tab: Supplemental | Supplemental data | FY 2021–FY 2025 + LTM | — | Medium |
| — tab: Industry Specific | Real estate KPIs | FY 2021–FY 2025 + LTM | — | High |
| — tab: Pension OPEB | Pension data | FY 2021–FY 2025 + LTM | — | Low |
| — tab: Segments | Segment revenue / P&L | FY 2020–FY 2025 | — | High |
| **Workbook: Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls** | Capital IQ quarterly financials export — 12 tabs | Q1 2022 – Q1 2026 (17 quarters, AED) | Sync date | High |
| — tab: Key Stats | Quarterly key statistics | Q1 2022 – Q1 2026 | — | High |
| — tab: Income Statement | Quarterly income statement | Q1 2022 – Q1 2026 | — | High |
| — tab: Balance Sheet | Quarterly balance sheet | Q1 2022 – Q1 2026 | — | High |
| — tab: Cash Flow | Quarterly cash flow | Q1 2022 – Q1 2026 | — | High |
| — tab: Multiples | Quarterly trading multiples | Q1 2022 – Q1 2026 | — | Medium |
| — tab: Historical Capitalization | Quarterly capital history | Q1 2022 – Q1 2026 | — | Medium |
| — tab: Capital Structure Summary | Quarterly debt structure | Q1 2022 – Q1 2026 | — | Medium |
| — tab: Capital Structure Details | Debt details | Q1 2022 – Q1 2026 | — | Medium |
| — tab: Ratios | Quarterly ratios | Q1 2022 – Q1 2026 | — | Medium |
| — tab: Supplemental | Supplemental quarterly | Q1 2022 – Q1 2026 | — | Medium |
| — tab: Industry Specific | Real estate KPIs quarterly | Q1 2022 – Q1 2026 | — | High |
| — tab: Pension OPEB | Pension quarterly | Q1 2022 – Q1 2026 | — | Low |
| — tab: Segments | Quarterly segment data | Q1 2022 – Q1 2026 | — | High |
| **Workbook: 01_Consensus.xlsx** | Capital IQ consensus estimates | Current (FY 2026 year-end; as of June 2026) | Sync date | High |
| — tab: Consensus (517×81) | Consensus estimates | FY 2026–FY 2028 | — | High |
| **Workbook: 02_Recent Changes.xlsx** | Capital IQ estimate recent changes | Last change dated Jun-22-2026 | Sync date | High |
| — tab: Recent Changes (266×10) | Revision history | Through Jun-22-2026 | — | High |
| **Workbook: 03_Guidance.xlsx** | Capital IQ guidance data | FY 2008 and FY 2015 only (no recent guidance) | Sync date | Low |
| — tab: Guidance (42×3) | Management guidance | FY 2008, FY 2015 only | — | Low |
| **Workbook: 04_Multiples.xlsx** | Capital IQ consensus multiples | As of current | Sync date | Medium |
| — tab: Multiples (26×7) | Trading multiples | Current | — | Medium |
| **Workbook: 05_Surprise.xlsx** | Capital IQ earnings surprise history | FY 2003 – FY 2025 | Sync date | High |
| — tab: Surprise (248×74) | EPS beat/miss history | FY 2003–FY 2025 | — | High |
| **Workbook: 06_Trends.xlsx** | Capital IQ estimate trends | Current | Sync date | High |
| — tab: Trends (306×15) | Estimate trend history | Through current | — | High |
| **Workbook: 07_Revisions.xlsx** | Capital IQ estimate revisions | Last revision Jun-22-2026 | Sync date | High |
| — tab: Revisions (476×13) | Revision counts / direction | FQ2 2026–FY 2028 | — | High |
| **Workbook: EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls** | Capital IQ estimates report (bundled multi-tab) — 7 tabs | Same data as 01–07 standalone files | Sync date | High |
| — tab: Consensus (514×81) | Consensus estimates | FY 2026–FY 2028 | — | High |
| — tab: Recent Changes (265×10) | Revisions | Through Jun-22-2026 | — | High |
| — tab: Guidance (42×3) | Guidance | FY 2008, FY 2015 | — | Low |
| — tab: Multiples (25×7) | Multiples | Current | — | Medium |
| — tab: Surprise (245×74) | Surprise history | FY 2003–FY 2025 | — | High |
| — tab: Trends (305×15) | Estimate trends | Through current | — | High |
| — tab: Revisions (467×13) | Revision history | FQ2 2026–FY 2028 | — | High |
| **Workbook: Company Comparable Analysis Emaar Properties PJSC.xls** | Capital IQ comparable analysis — 7 tabs | As of current | Sync date | Medium |
| — tab: Financial Data (50×17) | Peer financial data | Current | — | Medium |
| — tab: Trading Multiples (50×9) | Peer multiples | Current | — | Medium |
| — tab: Operating Statistics (50×13) | Peer operating stats | Current | — | Medium |
| — tab: Business Description (44×3) | Business descriptions | Current | — | Low |
| — tab: Implied Valuation (69×9) | Implied valuation | Current | — | Medium |
| — tab: Valuation Chart (32×2) | Valuation chart data | Current | — | Low |
| — tab: Credit Health Panel (48×10) | Credit metrics | Current | — | Medium |
| **Workbook: Emaar Properties PJSC DFM EMAAR Analyst Coverage.xls** | Analyst coverage list | Current | Sync date | Medium |
| — tab: Analyst Coverage (34×6) | Analyst roster | Current | — | Medium |
| **Workbook: Emaar Properties PJSC DFM EMAAR Board Members.xls** | Board members | Current | Sync date | Low |
| **Workbook: Emaar Properties PJSC DFM EMAAR Compensation Summary Compensation.xls** | Compensation data | Current | Sync date | Low |
| **Workbook: Emaar Properties PJSC DFM EMAAR Customers.xls** | Customers export | Current | Sync date | Low |
| **Workbook: Emaar Properties PJSC DFM EMAAR Events Calendar.xls** | Events calendar 2026 | 2026 | Sync date | Medium |
| **Workbook: Emaar Properties PJSC DFM EMAAR Investment Analysis Direct Investments.xls** | Direct investment portfolio | Current | Sync date | Medium |
| **Workbook: Emaar Properties PJSC DFM EMAAR Key Developments.xls** | Key corporate developments (last 6 months) | Jan–Jun 2026 | Sync date | High |
| **Workbook: Emaar Properties PJSC DFM EMAAR Professionals.xls** | Management team | Current | Sync date | Low |
| **Workbook: Emaar Properties PJSC DFM EMAAR Suppliers.xls** | Supplier data | Current | Sync date | Low |
| Emaar Properties PJSC DFM EMAAR Private Ownership.rtf | Private ownership data | Current | Sync date | Low |
| Emaar Properties PJSC DFM EMAAR Public Ownership Summary.rtf | Public ownership summary | Current | Sync date | Low |
| Emaar Properties PJSC DFM EMAAR Strategic Alliances.rtf | Strategic alliances | Current | Sync date | Low |

**Notes on period detection from inside documents (not from file sync dates):**
- The Apr-08-2026 Preliminary Interim Report file is actually the Q1 2025 press release (content dated 8 May 2025 — "دبي، الإمارات العربية المتحدة – 8 مايو 2025"); the file sync date of April 2026 is a Drive sync artefact.
- The Mar-30-2026 Preliminary Annual Report and Feb-12-2026 Preliminary Annual Report both cover FY 2025 (year ended Dec-31-2025), confirmed by the financial table header showing "2025, 2024, 2023" columns and "Notes: Source: MSCI, datastream, & Reuters (31 December 2025)".
- The Financials_Quarterly export runs from Q1 2022 through Q1 2026 (17 quarters), confirmed by the column header sequence terminating at "3 months Q1 Mar-31-2026" with Revenue = AED 12,398 million.
- Earnings call for Q1 2026 was held on May 11 2026 (confirmed in Key Developments and Events Calendar) but no transcript file is present in the pool.

---

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing (audited) | Emaar_Properties_PJSC-Annual_Report(Mar-14-2025).pdf | FY 2024 (year ended Dec-31-2024) | ~15 months from today (Jul-03-2026) |
| Preliminary annual report (full-year results release) | Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Mar-30-2026).pdf + Feb-12-2026 version | FY 2025 (year ended Dec-31-2025) | ~3 months |
| Quarterly / interim filing | Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Apr-08-2026).pdf (Q1 2025 press release, sync-dated Apr-2026) | Q1 2025 (ended Mar-31-2025) | ~14 months; Capital IQ quarterly export covers through Q1 2026 |
| Most recent quarterly data (Capital IQ) | Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls — Income Statement tab | Q1 2026 (ended Mar-31-2026) | ~3 months |
| Earnings transcript | Not in pool — confirmed held (Key Developments shows Q1 2026 call May 11 2026) | Q1 2026 | N/A — missing |
| Investor deck | Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Feb-12-2026).pdf (investor presentation for FY 2025) | FY 2025 | ~5 months |
| Consensus / estimate export | 01_Consensus.xlsx + EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls | FY 2026–FY 2028; most recent change Jun-22-2026 | <1 month |
| Cash flow data | Emaar Properties PJSC DFM EMAAR Financials_Annual.xls (Cash Flow tab) + Quarterly.xls (Cash Flow tab) | Annual FY 2021–FY 2025 + LTM; Quarterly Q1 2022–Q1 2026 | ~3 months (Q1 2026) |
| Guidance data | 03_Guidance.xlsx | FY 2008 and FY 2015 only — no recent guidance | Not current |

---

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | Capital IQ Annual (FY 2021–FY 2025 + LTM Mar-2026) + Quarterly (Q1 2022–Q1 2026); Preliminary Annual Reports FY 2025 and FY 2024 | Needed for revenue, margin, EPS |
| Balance sheet | Y | Capital IQ Annual (FY 2021–FY 2025 + LTM) + Quarterly (Q1 2022–Q1 2026); DFM Preliminary Annual Report FY 2025 shows summary balance sheet | Needed for working capital and leverage |
| Cash flow statement | Y | Capital IQ Annual Cash Flow (FY 2021–FY 2025 + LTM) + Quarterly Cash Flow (Q1 2022–Q1 2026) | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Capital IQ Quarterly export: Q1 2026 (Mar-31-2026) — Revenue AED 12,398 million, Net Income AED 4,997 million | Needed for trend and setup |
| Last 8 quarters | Y | Capital IQ Quarterly export covers 17 quarters (Q1 2022–Q1 2026), comfortably covering last 8 | Needed for seasonality and inflection |
| Consensus estimates | Y | 01_Consensus.xlsx + EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls; FY 2026 EPS consensus present; target price AED 17.07 (14 estimates); FQ2 2026 release date Aug-10-2026; most recent revision Jun-22-2026 | Needed for market bar |
| Estimate revisions | Y | 07_Revisions.xlsx + 02_Recent Changes.xlsx; last change dated Jun-22-2026; revision counts by quarter and year available | Needed for revision momentum |
| Earnings transcript | N | No transcript file in pool; Key Developments confirms Q1 2026 earnings call was held May 11 2026, and FY 2025 earnings call held Feb 12 2026, but no transcript documents are present | Needed for management tone and driver detail |
| Segment P&L | Y (partial) | Capital IQ Annual Segments tab covers FY 2020–FY 2025 by segment (Leasing/Retail, Property Development, Hospitality, International); Capital IQ Quarterly Segments tab covers Q1 2022–Q1 2026 | Needed for mix shift |
| Current price | Y (indicative) | Mar-30-2026 DFM filing shows last closing price AED 11.75 (~3 months ago); consensus target price AED 17.07 implies market is below target; exact price as of Jul-03-2026 not in pool | Needed for stock reaction context |

---

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y |
| 06_value-chain.md | Y |
| 10_external-dependency.md | Y |

All 14 business-model module outputs are present at `/Users/chiraagkapil/nostra-prod/analyses/EMAR_2026-07-03/business-model/`, including the full synthesis (`99_business-model-synthesis.md`) and dossier (`business-model_dossier.md`). The earnings module can use all three cross-module inputs listed above.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N | 04, 05, 99 | No cap — consensus present and fresh (last change Jun-22-2026) |
| No quarterly data | N | 01, 02, 03, 06 | No cap — 17 quarters of Capital IQ quarterly data available through Q1 2026 |
| No earnings transcript | Y | 02, 03, 04 | Earnings clarity capped at max 70 per MODULE_RULES.md; agents must state "Management commentary unavailable — working from filings only" |
| No segment-level P&L | N | 02, 03, 99 | No cap — segment revenue data available in Capital IQ Segments tab (annual FY 2020–FY 2025, quarterly Q1 2022–Q1 2026); note segment-level margin detail may be limited |
| No cash flow statement | N | 06, 99 | No cap — cash flow available annually and quarterly |
| No current price | N (partial) | 99 | Last known price AED 11.75 (Mar-30-2026 filing, ~3 months old); indicative only — agent 99 should treat as approximate and label it; no precision cap applies but agent must note staleness |

**Additional flags not in the standard table:**
- No recent formal guidance: The Guidance export (03_Guidance.xlsx) contains only FY 2008 and FY 2015 entries — Emaar does not provide formal numerical forward guidance. Agent 04 must work from consensus estimates and backlog disclosures rather than management guidance.
- No earnings transcript in pool: confirmed by absence of any transcript file and no transcript-type entry in the Capital IQ workbooks; the earnings calls for FY 2025 (Feb 12 2026) and Q1 2026 (May 11 2026) are confirmed to have occurred but transcripts are not available.

---

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** All three core requirements are met — full-year financials are present (FY 2025 preliminary annual report + Capital IQ annual export through LTM Mar-2026), the most recent quarterly update is present (Capital IQ quarterly export through Q1 2026, confirmed by Q1 2026 earnings announcement in Key Developments: Revenue AED 12,398 million, Net Income AED 4,997 million), and income statement, balance sheet, and cash flow statement are all available across both annual and quarterly time horizons.
- **Active partial-data caps:**
  - Earnings clarity capped at max 70 (no earnings transcript in pool; earnings calls confirmed held but not available as documents)
- **Critical missing items:**
  - Earnings transcripts for FY 2025 earnings call (Feb 12 2026) and Q1 2026 earnings call (May 11 2026) — held but not in pool; agents 02, 03, 04 must rely on filings and press releases for management commentary
  - No current market price as of Jul-03-2026 (last known: AED 11.75 from Mar-30-2026 filing, approximately 3 months stale)
  - No recent formal management guidance (Emaar does not issue numerical forward guidance; agents must rely on backlog/contracted sales data as a forward indicator)
