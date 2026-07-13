# Earnings Data Triage — EMAR

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United Arab Emirates | Ticker DFM:EMAAR; all sources reference Dubai Financial Market |
| Exchange | Dubai Financial Market (DFM) | Capital IQ exports header: "DFM:EMAAR"; Preliminary Annual Report cover |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | UAE — DFM/DFSA listing rules; no SEBI or SEC obligation | Company full name: Emaar Properties PJSC; domiciled and listed in Dubai |
| Reporting standard (US GAAP / IFRS / Ind AS) | IFRS | Stated explicitly in all Capital IQ exports: "Acctg. Standard: IFRS"; Consensus tab: "Consolidation: Consolidated / Acctg. Standard: IFRS" |
| Reporting currency | AED (UAE Dirham) | Income Statement header: "Currency: AED"; Consensus: "Currency: United Arab Emirates Dirham" |
| Fiscal-year end | 31 December | Annual Income Statement: "For the Fiscal Period Ending 12 months Dec-31-2025"; Estimates: "Current Fiscal Year End: Dec-31-2026" |

Set these so later agents apply CLAUDE.md §27 correctly. Emaar is a UAE-domiciled, DFM-listed developer reporting under IFRS in AED. There are no US SEC forms; the equivalent documents are Emaar's own Annual Report (audited, IFRS) and its investor presentations / preliminary results released to DFM. Do NOT mark 10-K, 10-Q, or 8-K as missing.

---

## 1. File Inventory

The pool contains 5 source files. The 3 workbooks together contain 33 tabs, each listed as its own row below. 0 extraction failures.

**Workbook 1: Emaar Properties PJSC DFM EMAAR Financials_Annual.xls (223 KB)**

| Filename / Tab | Type | Period Covered (from inside document) | Earnings Relevance |
|---|---|---|---|
| …Financials_Annual.xls — Key Stats | Capital IQ annual data export | FY2021–FY2025 + LTM Mar-31-2026 | High |
| …Financials_Annual.xls — Income Statement | Capital IQ annual data export | FY2021–FY2025 + LTM Mar-31-2026 | High |
| …Financials_Annual.xls — Balance Sheet | Capital IQ annual data export | FY2021–FY2025 + LTM Mar-31-2026 | High |
| …Financials_Annual.xls — Cash Flow | Capital IQ annual data export | FY2021–FY2025 + LTM Mar-31-2026 | High |
| …Financials_Annual.xls — Multiples | Capital IQ annual data export | FY2021–FY2025 + LTM Mar-31-2026 | Medium |
| …Financials_Annual.xls — Historical Capitalization | Capital IQ annual data export | FY2021–FY2025 + LTM Mar-31-2026 | Medium |
| …Financials_Annual.xls — Capital Structure Summary | Capital IQ annual data export | FY2021–FY2025 + LTM Mar-31-2026 | Medium |
| …Financials_Annual.xls — Capital Structure Details | Capital IQ annual data export | FY2021–FY2025 + LTM Mar-31-2026 | Medium |
| …Financials_Annual.xls — Ratios | Capital IQ annual data export | FY2021–FY2025 + LTM Mar-31-2026 | Medium |
| …Financials_Annual.xls — Supplemental | Capital IQ annual data export | FY2021–FY2025 + LTM Mar-31-2026 | Low |
| …Financials_Annual.xls — Industry Specific | Capital IQ annual data export | FY2021–FY2025 + LTM Mar-31-2026 | Medium |
| …Financials_Annual.xls — Pension OPEB | Capital IQ annual data export | FY2021–FY2025 + LTM Mar-31-2026 | Low |
| …Financials_Annual.xls — Segments | Capital IQ annual data export | FY2020–FY2025 (3 segments: Real Estate, Leasing/Retail, Hospitality) | High |

**Workbook 2: Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls (335 KB)**

| Filename / Tab | Type | Period Covered (from inside document) | Earnings Relevance |
|---|---|---|---|
| …Financials_Quarterly.xls — Key Stats | Capital IQ quarterly data export | Q1 2022–Q1 2026 (17 quarters) | High |
| …Financials_Quarterly.xls — Income Statement | Capital IQ quarterly data export | Q1 2022–Q1 2026 (17 quarters) | High |
| …Financials_Quarterly.xls — Balance Sheet | Capital IQ quarterly data export | Q1 2022–Q1 2026 (17 quarters) | High |
| …Financials_Quarterly.xls — Cash Flow | Capital IQ quarterly data export | Q1 2022–Q1 2026 (17 quarters) | High |
| …Financials_Quarterly.xls — Multiples | Capital IQ quarterly data export | Q1 2022–Q1 2026 (17 quarters) | Medium |
| …Financials_Quarterly.xls — Historical Capitalization | Capital IQ quarterly data export | Q1 2022–Q1 2026 (17 quarters) | Medium |
| …Financials_Quarterly.xls — Capital Structure Summary | Capital IQ quarterly data export | Q1 2022–Q1 2026 | Medium |
| …Financials_Quarterly.xls — Capital Structure Details | Capital IQ quarterly data export | Q1 2022–Q1 2026 | Medium |
| …Financials_Quarterly.xls — Ratios | Capital IQ quarterly data export | Q1 2022–Q1 2026 (17 quarters) | Medium |
| …Financials_Quarterly.xls — Supplemental | Capital IQ quarterly data export | Q1 2022–Q1 2026 | Low |
| …Financials_Quarterly.xls — Industry Specific | Capital IQ quarterly data export | Q1 2022–Q1 2026 | Medium |
| …Financials_Quarterly.xls — Pension OPEB | Capital IQ quarterly data export | Q1 2022–Q1 2026 | Low |
| …Financials_Quarterly.xls — Segments | Capital IQ quarterly data export | Q1 2022–Q1 2026 (segment revenue + NPBT) | High |

**Workbook 3: EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls (4.5 MB)**

| Filename / Tab | Type | Period Covered (from inside document) | Earnings Relevance |
|---|---|---|---|
| …EstimatesReport.xls — Consensus | Capital IQ consensus/estimate export | Historical 2003–2025 actuals; FY2026–FY2032 forward estimates; 11–12 analysts for FY2026 | High |
| …EstimatesReport.xls — Recent Changes | Capital IQ estimate revisions export | Recent analyst estimate changes (FQ2 2026 – FY2028) | High |
| …EstimatesReport.xls — Guidance | Capital IQ guidance export | Management guidance history (FY2008, FY2015 only — no current guidance) | Medium |
| …EstimatesReport.xls — Multiples | Capital IQ multiples export | Consensus multiples; current year / NTM | Medium |
| …EstimatesReport.xls — Surprise | Capital IQ beat/miss history | FY2003–FY2025 EPS surprise history | High |
| …EstimatesReport.xls — Trends | Capital IQ estimate trend export | Estimate revision trends by period | High |
| …EstimatesReport.xls — Revisions | Capital IQ revisions export | Last 1 / 2 / 3 months revision counts; FQ2 2026–FY2028 | High |

**PDFs**

| Filename | Type | Period Covered (from inside document) | Earnings Relevance |
|---|---|---|---|
| Emaar_Properties_PJSC-Annual_Report(Mar-14-2025).pdf (19.3 MB) | Annual Report (IFRS, audited) — FY2024 Comprehensive Annual Report | FY2024 (year ended 31 Dec 2024); published Mar 14, 2025 | High |
| Emaar_Properties_PJSC-Preliminary_Annual_Report(Feb-12-2026).pdf (4.7 MB) | Investor Presentation / Preliminary FY2025 Results (Q4 & FY2025 update) | FY2025 and Q4 2025 results; published Feb 12, 2026 | High |

Note: The FY2025 document is labelled "Preliminary Annual Report" but its content is an investor presentation covering Q4 & FY 2025 financial results and operational update — it is not the audited statutory IFRS annual report. The FY2024 PDF is the full audited report. No FY2025 full audited annual report is in the pool (this would normally be published March–April 2026); the Capital IQ export through Dec-31-2025 fills the gap for financial data, sourced as Capital IQ & Proprietary Data.

---

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing (audited) | Emaar_Properties_PJSC-Annual_Report(Mar-14-2025).pdf | FY2024 (year ended Dec 31, 2024) | ~18 months from today (Jun 2026) |
| Preliminary / investor results | Emaar_Properties_PJSC-Preliminary_Annual_Report(Feb-12-2026).pdf | FY2025 / Q4 2025 (released Feb 12, 2026) | ~4 months |
| Quarterly filing / Capital IQ quarterly | …Financials_Quarterly.xls (all tabs) | Q1 2026 (period end Mar 31, 2026) | ~3 months |
| Earnings transcript | Not in pool | N/A | N/A — missing |
| Investor deck | Emaar_Properties_PJSC-Preliminary_Annual_Report(Feb-12-2026).pdf | FY2025 / Q4 2025 | ~4 months |
| Consensus / estimate export | EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls | FQ2 2026 next earnings: Aug 10, 2026; latest price AED 12.96 | Current (data as of Jun 2026 based on analyst counts) |
| Cash flow data | …Financials_Annual.xls (Cash Flow tab) + …Financials_Quarterly.xls (Cash Flow tab) | Annual: FY2025; Quarterly: Q1 2026 | ~3 months |
| Guidance data | …EstimatesReport.xls (Guidance tab) | Only FY2008 and FY2015 historical guidance — no current guidance | Not current |

---

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | Capital IQ Annual (FY2021–FY2025 + LTM Mar-2026); Capital IQ Quarterly (Q1 2022–Q1 2026) | Needed for revenue, margin, EPS |
| Balance sheet | Y | Capital IQ Annual (FY2021–FY2025 + LTM Mar-2026); Capital IQ Quarterly (Q1 2022–Q1 2026) | Needed for working capital and leverage |
| Cash flow statement | Y | Capital IQ Annual (FY2021–FY2025 + LTM Mar-2026); Capital IQ Quarterly (Q1 2022–Q1 2026) | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Q1 2026 (Mar 31, 2026) in Capital IQ Quarterly export | Needed for trend and setup |
| Last 8 quarters | Y | Q1 2022 through Q1 2026 = 17 quarters available in Capital IQ Quarterly export | Needed for seasonality and inflection |
| Consensus estimates | Y | Capital IQ Estimates — Consensus tab; 11–12 analysts covering FY2026; FY2027–FY2028 also covered | Needed for market bar |
| Estimate revisions | Y | Capital IQ Estimates — Revisions and Trends tabs; last 1 / 2 / 3 months revision counts | Needed for revision momentum |
| Earnings transcript | N | Not in data pool | Needed for management tone and driver detail |
| Segment P&L | Y (partial) | Capital IQ Annual Segments tab: revenue and NPBT by 3 segments (Real Estate, Leasing/Retail, Hospitality) through FY2025; Capital IQ Quarterly Segments tab through Q1 2026 | Needed for mix shift |
| Current price | Y | Consensus tab: latest price AED 12.96 (implied data date ~Jun 2026 based on context) | Needed only for master-level stock reaction context |

Note on segment P&L: Revenue and NPBT (net profit before tax) by segment are available for both annual and quarterly periods. Full segment EBITDA or EBIT breakdown is not separately disclosed in the Capital IQ export; it is a partial disclosure. The FY2024 audited Annual Report would contain full segment notes, but Q1 2026 segment EBIT is not directly available. This is flagged as partial, not absent, because the available data supports meaningful segment-level analysis.

Note on the FY2025 audited report: the preliminary investor presentation (Feb 12, 2026) carries FY2025 financials but is not the audited IFRS statutory filing. Capital IQ has incorporated these numbers into its Dec-31-2025 period columns. Downstream agents should note that FY2025 numbers are Capital IQ-sourced and cross-check against the FY2024 audited report for accounting policies.

---

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y — present at analyses/EMAR_2026-06-22/business-model/03_segment-map.md |
| 06_value-chain.md | Y — present at analyses/EMAR_2026-06-22/business-model/06_value-chain.md |
| 10_external-dependency.md | Y — present at analyses/EMAR_2026-06-22/business-model/10_external-dependency.md |

All three key cross-module inputs from the business-model run (completed 2026-06-22) are available. The full module synthesis (99_business-model-synthesis.md) and dossier are also present. Downstream earnings agents should read these before running — in particular 03_segment-map.md for segment decomposition and 10_external-dependency.md for cycle-position context (CLAUDE.md §27 and MODULE_RULES.md Cycle-Position Rule).

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus present (11–12 analysts, FY2026–FY2028) | 04, 05, 99 | No cap; consensus data is current and populated |
| No quarterly data | N — 17 quarters (Q1 2022–Q1 2026) available | 01, 02, 03, 06 | No cap |
| No earnings transcript | Y — no transcript in pool | 02, 03, 04 | Earnings clarity capped at max 70; management commentary unavailable; agents must work from filings and investor deck only and flag the limitation |
| No segment-level P&L | N (partial only) — segment revenue and NPBT available; full EBIT margin by segment not separately disclosed | 02, 03, 99 | No hard cap triggered; agents note partial disclosure and do not guess missing line items |
| No cash flow statement | N — cash flow available annual and quarterly | 06, 99 | No cap |
| No current price | N — AED 12.96 from Consensus export (latest price field) | 99 | No cap; note that price currency/date should be confirmed by agent 99 |

---

## 6. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** The pool contains annual financials through FY2025 (Capital IQ), quarterly financials through Q1 2026, a full consensus/estimate dataset with 11–12 analysts, segment revenue and NPBT, cash flow data, beat/miss history, revision history, and an investor presentation with FY2025 preliminary results — but no earnings transcript for any period, which is required for management tone and driver-level commentary and caps earnings clarity to a maximum of 70.
- **Active partial-data caps:**
  - Earnings clarity maximum 70 (no transcript in pool — MODULE_RULES.md cap table)
  - Management commentary unavailable; agents 02, 03, and 04 must work from filings and investor deck only and explicitly flag this limitation
- **Critical missing items:**
  - Earnings transcript (any period; Q4 2025 or Q1 2026 earnings call preferred) — this is the single most valuable addition to lift the cap
  - FY2025 full audited IFRS Annual Report (the Feb 2026 document is an investor presentation / preliminary results, not the statutory filing; this affects citation quality for FY2025 line items)
