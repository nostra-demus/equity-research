# Earnings Data Triage — V

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | [data/V/Visa-Fiscal-2025-Annual-Report.pdf, FY2025 Form 10-K cover] |
| Exchange | New York Stock Exchange (NYSE), Class A common stock ticker V | [data/V/Visa-Fiscal-2025-Annual-Report.pdf, FY2025 Form 10-K cover] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC: Form 10-K, Form 10-Q, DEF 14A | [data/V/Visa_Inc_-_Form_10-K(Nov-06-2025).doc, cover] [data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, cover] |
| Reporting standard (US GAAP / IFRS / Ind AS) | U.S. GAAP | [data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, Note 1] |
| Reporting currency | USD | [data/V/Visa-Inc-Q3-2026-Earnings-Release.pdf, income-statement summary] |
| Fiscal-year end | September 30 | [data/V/Visa_Inc_-_Form_10-K(Nov-06-2025).doc, cover] |
| Document language(s) | English | [data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, cover and Note 1] |

Visa reports standalone three-month quarters under the SEC regime. The latest reported quarter is fiscal Q3 2026, ended June 30, 2026; FY2026 ends September 30, 2026. [data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, cover] [data/V/VisaIncNYSEVEstimatesReport.xls — Revisions, current fiscal-year line]

## 1. File Inventory

The frozen-generation manifest records 23 source files, including eight workbooks split into 44 tab-level extracts, with zero extraction failures. Every workbook row below names its parent file, sheet, and dimensions. `*` marks a snapshot/sync modification time; it is not used to assess document freshness. Periods are taken from document contents or explicitly marked when no internal as-of date is stated. [frozen generation manifest, 2026-09-23]

| Filename | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| Company Comparable Analysis Visa Inc.xls — Financial Data (50×17) | CIQ comparable-data export | Snapshot as of 2026-08-17 | 2026-09-23 22:35:07* | Medium |
| Company Comparable Analysis Visa Inc.xls — Trading Multiples (50×9) | CIQ comparable-data export | Snapshot as of 2026-08-17 | 2026-09-23 22:35:07* | Low |
| Company Comparable Analysis Visa Inc.xls — Operating Statistics (50×13) | CIQ comparable-data export | Snapshot as of 2026-08-17 | 2026-09-23 22:35:07* | Medium |
| Company Comparable Analysis Visa Inc.xls — Business Description (44×3) | CIQ profile / comparable-data export | Snapshot as of 2026-08-17 | 2026-09-23 22:35:07* | Low |
| Company Comparable Analysis Visa Inc.xls — Implied Valuation (69×9) | CIQ valuation export | Snapshot as of 2026-08-17 | 2026-09-23 22:35:07* | Low |
| Company Comparable Analysis Visa Inc.xls — Valuation Chart (32×2) | CIQ valuation export | Snapshot as of 2026-08-17 | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Customers.rtf | CIQ customer relationship export | Recently disclosed customers only, within the last two years | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Events Calendar.xls — Events Calendar (46×3) | CIQ events-calendar export | Calendar year 2026 | 2026-09-23 22:35:07* | Medium |
| Visa Inc NYSE V Financials_Annual.xls — Key Stats (106×12) | CIQ annual financials export | Annual history; latest FY2025 ended 2025-09-30 | 2026-09-23 22:35:07* | Medium |
| Visa Inc NYSE V Financials_Annual.xls — Income Statement (115×11) | CIQ annual financials export | Annual history; latest FY2025 ended 2025-09-30 | 2026-09-23 22:35:07* | High |
| Visa Inc NYSE V Financials_Annual.xls — Balance Sheet (94×11) | CIQ annual financials export | Annual history; latest FY2025 ended 2025-09-30 | 2026-09-23 22:35:07* | High |
| Visa Inc NYSE V Financials_Annual.xls — Cash Flow (72×11) | CIQ annual financials export | Annual history; latest FY2025 ended 2025-09-30 | 2026-09-23 22:35:07* | High |
| Visa Inc NYSE V Financials_Annual.xls — Multiples (91×41) | CIQ annual financials export | Historical/current market multiples; latest current-date field 2026-08-07 | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Financials_Annual.xls — Historical Capitalization (39×40) | CIQ annual financials export | Historical capitalisation; date series in workbook | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Financials_Annual.xls — Capital Structure Summary (97×21) | CIQ annual financials export | Annual history; latest FY2025 ended 2025-09-30 | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Financials_Annual.xls — Capital Structure Details (59×10) | CIQ annual financials export | Latest annual reported capital structure, FY2025 | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Financials_Annual.xls — Ratios (161×11) | CIQ annual financials export | Annual history; latest FY2025 ended 2025-09-30 | 2026-09-23 22:35:07* | Medium |
| Visa Inc NYSE V Financials_Annual.xls — Supplemental (73×10) | CIQ annual financials export | Annual history; latest FY2025 ended 2025-09-30 | 2026-09-23 22:35:07* | Medium |
| Visa Inc NYSE V Financials_Annual.xls — Industry Specific (15×6) | CIQ annual financials export | Annual history; latest FY2025 ended 2025-09-30 | 2026-09-23 22:35:07* | Medium |
| Visa Inc NYSE V Financials_Annual.xls — Pension OPEB (264×10) | CIQ annual financials export | Annual history; latest FY2025 ended 2025-09-30 | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Financials_Annual.xls — Segments (72×10) | CIQ annual financials export | Annual history; latest FY2025 ended 2025-09-30 | 2026-09-23 22:35:07* | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Key Stats (106×12) | CIQ quarterly financials export | Quarterly history; latest FQ3 FY2026 ended 2026-06-30 | 2026-09-23 22:35:07* | Medium |
| Visa Inc NYSE V Financials_Quarterly.xls — Income Statement (112×40) | CIQ quarterly financials export | Quarterly history; latest FQ3 FY2026 ended 2026-06-30 | 2026-09-23 22:35:07* | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Balance Sheet (94×40) | CIQ quarterly financials export | Quarterly history; latest FQ3 FY2026 ended 2026-06-30 | 2026-09-23 22:35:07* | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Cash Flow (72×40) | CIQ quarterly financials export | Quarterly history; latest FQ3 FY2026 ended 2026-06-30 | 2026-09-23 22:35:07* | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Multiples (91×41) | CIQ quarterly financials export | Historical/current market multiples; latest current-date field 2026-08-07 | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Financials_Quarterly.xls — Historical Capitalization (39×40) | CIQ quarterly financials export | Historical capitalisation; date series in workbook | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Financials_Quarterly.xls — Capital Structure Summary (72×79) | CIQ quarterly financials export | Quarterly history; latest FQ3 FY2026 ended 2026-06-30 | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Financials_Quarterly.xls — Capital Structure Details (59×10) | CIQ quarterly financials export | Latest reported capital structure; FQ3 FY2026 / 2026-06-30 | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Financials_Quarterly.xls — Ratios (161×40) | CIQ quarterly financials export | Quarterly history; latest FQ3 FY2026 ended 2026-06-30 | 2026-09-23 22:35:07* | Medium |
| Visa Inc NYSE V Financials_Quarterly.xls — Supplemental (40×40) | CIQ quarterly financials export | Quarterly history; latest FQ3 FY2026 ended 2026-06-30 | 2026-09-23 22:35:07* | Medium |
| Visa Inc NYSE V Financials_Quarterly.xls — Industry Specific (15×6) | CIQ quarterly financials export | Quarterly history; latest FQ3 FY2026 ended 2026-06-30 | 2026-09-23 22:35:07* | Medium |
| Visa Inc NYSE V Financials_Quarterly.xls — Pension OPEB (175×40) | CIQ quarterly financials export | Quarterly history; latest FQ3 FY2026 ended 2026-06-30 | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Financials_Quarterly.xls — Segments (67×40) | CIQ quarterly financials export | Quarterly history; latest FQ3 FY2026 ended 2026-06-30 | 2026-09-23 22:35:07* | High |
| Visa Inc NYSE V Key Developments.rtf | CIQ key-developments export | One-year view; latest dated item 2026-08-05 | 2026-09-23 22:35:07* | Medium |
| Visa Inc NYSE V Public Company Profile.rtf | CIQ company-profile export | Current snapshot; internal stock quote as of 2026-08-17 | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Public Ownership History.xls — History (6,120×6) | CIQ ownership-history export | Quarterly history from 2025-09-30 through 2026-06-30 | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Public Ownership Insider Trading.xls — Insider Trading (2,277×11) | CIQ insider-trading export | All history; latest filed event 2026-07-31 | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Public Ownership Summary.rtf | CIQ ownership-summary export | Current snapshot; holder as-of date not stated in the export | 2026-09-23 22:35:07* | Low |
| Visa Inc NYSE V Suppliers.rtf | CIQ supplier relationship export | Recently disclosed suppliers only, within the last two years | 2026-09-23 22:35:07* | Low |
| Visa Inc., Q1 2026 Earnings Call, Jan 29, 2026.pdf | Verbatim earnings-call transcript | FQ1 FY2026; call dated 2026-01-29 | 2026-09-23 22:35:07* | High |
| Visa Inc., Q2 2026 Earnings Call, Apr 28, 2026.rtf | Verbatim earnings-call transcript | FQ2 FY2026; call dated 2026-04-28 | 2026-09-23 22:35:07* | High |
| Visa Inc., Q3 2026 Earnings Call, Jul 28, 2026.rtf | Verbatim earnings-call transcript | FQ3 FY2026; call dated 2026-07-28 | 2026-09-23 22:35:07* | High |
| Visa-Fiscal-2025-Annual-Report.pdf | Audited annual filing / annual report | FY2025 ended 2025-09-30 | 2026-09-23 22:35:08* | High |
| Visa-Inc-Q2-2026-Financial-Results-Presentation.pdf | Investor deck | FQ2 FY2026 ended 2026-03-31 | 2026-09-23 22:35:08* | Medium |
| Visa-Inc-Q3-2026-Earnings-Release.pdf | Earnings press release / official results disclosure | FQ3 FY2026 ended 2026-06-30; released 2026-07-28 | 2026-09-23 22:35:08* | High |
| Visa-Inc-Q3-2026-Financial-Results-Presentation.pdf | Investor deck | FQ3 FY2026 ended 2026-06-30 | 2026-09-23 22:35:08* | Medium |
| VisaIncNYSEVEstimatesReport.xls — Consensus (616×93) | CIQ consensus / estimates export | Historic quarters through FQ3 FY2026 and forward FQ4 FY2026–FY2029 | 2026-09-23 22:35:08* | High |
| VisaIncNYSEVEstimatesReport.xls — Recent Changes (265×10) | CIQ estimate-change export | FY2026/forward; latest dated entry 2026-08-11 | 2026-09-23 22:35:08* | High |
| VisaIncNYSEVEstimatesReport.xls — Guidance (151×44) | CIQ guidance-data export | FY2026/forward guidance fields | 2026-09-23 22:35:08* | High |
| VisaIncNYSEVEstimatesReport.xls — Multiples (34×7) | CIQ estimates / multiples export | Current snapshot; exact internal as-of date not stated in the tab | 2026-09-23 22:35:08* | Low |
| VisaIncNYSEVEstimatesReport.xls — Surprise (300×80) | CIQ surprise-history export | Historical annual and quarterly estimates; FY2025 latest annual actual | 2026-09-23 22:35:08* | High |
| VisaIncNYSEVEstimatesReport.xls — Trends (318×24) | CIQ estimate-trends export | Historical/forward FY2026–FY2035 trend fields | 2026-09-23 22:35:08* | High |
| VisaIncNYSEVEstimatesReport.xls — Revisions (467×24) | CIQ revisions export | FQ4 FY2026–FY2030; FY2026 release date stated as 2026-10-27 | 2026-09-23 22:35:08* | High |
| Visa_Inc_-_Form_10-K(Nov-06-2025).doc | Audited annual filing (Form 10-K) | FY2025 ended 2025-09-30; filed 2025-11-06 | 2026-09-23 22:35:08* | High |
| Visa_Inc_-_Form_10-Q(Jul-29-2026).doc | Quarterly filing (Form 10-Q) | FQ3 FY2026 ended 2026-06-30; filed 2026-07-29 | 2026-09-23 22:35:08* | High |
| Visa_Inc_-_Form_DEF_14A(Dec-08-2025).doc | Proxy / governance filing | FY2026 annual-meeting proxy; filed 2025-12-08 | 2026-09-23 22:35:08* | Low |
| Visa_Short_Interest_Charting Excel Export Aug-17-2026 8_53 AM.xls — Chart 1 with Data (283×2) | CIQ short-interest export | 2025-08-18 through 2026-08-17 | 2026-09-23 22:35:08* | Low |
| Visa_Short_Interest_Charting Excel Export Aug-17-2026 8_53 AM.xls — Attributions (45×1) | CIQ short-interest export metadata | Export dated 2026-08-17 | 2026-09-23 22:35:08* | Low |

No `data/V/external/` documents are present in the frozen generation, so there is no external-data inventory and no external evidence affects this verdict.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | Visa-Fiscal-2025-Annual-Report.pdf; same period also in Visa_Inc_-_Form_10-K(Nov-06-2025).doc | FY2025 ended 2025-09-30 | 10.6 since the 2025-11-06 filing |
| Quarterly filing | Visa_Inc_-_Form_10-Q(Jul-29-2026).doc | FQ3 FY2026 ended 2026-06-30 | 1.8 since filing |
| Earnings transcript | Visa Inc., Q3 2026 Earnings Call, Jul 28, 2026.rtf — verbatim transcript | FQ3 FY2026; 2026-07-28 call | 1.9 |
| Investor deck | Visa-Inc-Q3-2026-Financial-Results-Presentation.pdf | FQ3 FY2026 ended 2026-06-30 | 1.9 |
| Consensus / estimate export | VisaIncNYSEVEstimatesReport.xls — Consensus, Recent Changes, Trends, Revisions tabs | FY2026 and forward; latest dated change 2026-08-11 | 1.4 |
| Cash flow data | Visa_Inc_-_Form_10-Q(Jul-29-2026).doc; CIQ Financials_Quarterly — Cash Flow tab | Nine months ended 2026-06-30; quarterly history through FQ3 FY2026 | 1.8 since filing |
| Guidance data | Visa-Inc-Q3-2026-Earnings-Release.pdf; Visa Inc., Q3 2026 Earnings Call, Jul 28, 2026.rtf; CIQ Estimates — Guidance tab | FQ3 FY2026 update and FY2026 outlook | 1.9 |

The transcript files are full call records with prepared remarks and Q&A, not sell-side transcript proxies. The earnings release is classified separately as an official results disclosure and does not fill the transcript slot. [data/V/Visa-Inc.-Q3-2026-Earnings-Call-Jul-28-2026.rtf, table of contents and call participants] [data/V/Visa-Inc-Q3-2026-Earnings-Release.pdf, title]

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | FY2025 Form 10-K / annual report; FQ3 FY2026 Form 10-Q; CIQ annual and quarterly Income Statement tabs | Needed for revenue, margin, EPS |
| Balance sheet | Y | FY2025 Form 10-K / annual report; FQ3 FY2026 Form 10-Q; CIQ annual and quarterly Balance Sheet tabs | Needed for working capital and leverage |
| Cash flow statement | Y | FY2025 Form 10-K / annual report; FQ3 FY2026 Form 10-Q; CIQ annual and quarterly Cash Flow tabs | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | FQ3 FY2026 Form 10-Q, Q3 earnings release, Q3 presentation and Q3 verbatim call | Needed for trend and setup |
| Last 8 quarters | Y | CIQ Financials_Quarterly — Income Statement, Balance Sheet, Cash Flow, and Segments tabs (40-column quarterly history through FQ3 FY2026) | Needed for seasonality and inflection |
| Consensus estimates | Y | CIQ EstimatesReport — Consensus tab, with FY2026 and forward periods | Needed for market bar |
| Estimate revisions | Y | CIQ EstimatesReport — Recent Changes and Revisions tabs; changes dated through 2026-08-11 | Needed for revision momentum |
| Earnings transcript | Y | Verbatim Q1, Q2, and Q3 FY2026 call transcripts | Needed for management tone and driver detail |
| Segment P&L | Y | Visa reports Payment Services as its sole reportable segment; geographic revenue is also available | Needed for mix shift; a consolidated read is appropriate for the single-segment structure |
| Current price | Y | CIQ Comps — Financial Data; current-price fact present as of 2026-08-17 | Needed only for master-level stock reaction context |

The deterministic CIQ facts sidecar confirms the current-price field is present and identifies the source as `CIQ Comps→Financial Data`, as of 2026-08-17; the underlying value is not needed for this data-triage verdict. [ciq_facts.json, current_price]

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y |
| 06_value-chain.md | Y |
| 10_external-dependency.md | Y |

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N | 04, 05, 99 | None |
| No quarterly data | N | 01, 02, 03, 06 | None |
| No VERBATIM transcript, sell-side proxy present | N | 02, 03, 04 | None — verbatim Q1–Q3 FY2026 transcripts are present |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | None |
| No segment-level P&L | N | 02, 03, 99 | None — the reporting structure has one Payment Services segment; geographic data is available |
| No cash flow statement | N | 06, 99 | None |
| No current price | N | 99 | None |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The frozen pool contains an audited FY2025 annual filing, the latest FQ3 FY2026 Form 10-Q and official results release, all three financial statements, quarterly history covering more than eight quarters, three verbatim FY2026 earnings-call transcripts, and current consensus plus revision exports.
