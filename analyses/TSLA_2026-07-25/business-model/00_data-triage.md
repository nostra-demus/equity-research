# Data Triage — TSLA

## 1. File Inventory

Multi-tab CIQ workbooks were pre-split by `extract_pool.py` (11 workbooks → 54 tabs, 64 extract files, 0 failures — `_pool_extracts/manifest.md`). Every tab is listed below as its own row, reconciled against the manifest. "Last Modified" is the Drive-sync timestamp (all files synced 2026-07-24) and is NOT the reporting period — the period is parsed from inside each document per fix F23.

| Filename | Type | Period Covered | Last Modified | Notes |
|---|---|---|---|---|
| Annual_Report_TSLA-Q4-2024.pdf | Investor deck (unaudited shareholder update, labeled "Annual Report") | Q4 & FY2024 (year ended Dec 31, 2024) | 2026-07-24 (sync) | Entire deck marked "(Unaudited)"; not the audited 10-K |
| Annual_Report_TSLA-Q4-2025.pdf | Investor deck (unaudited shareholder update, labeled "Annual Report") | Q4 & FY2025 (year ended Dec 31, 2025) | 2026-07-24 (sync) | "Q4 and FY 2025 Update"; entire deck marked "(Unaudited)"; not the audited 10-K |
| TSLA-Q1-2026-Update.pdf | Investor deck | Q1 2026 (quarter ended Mar 31, 2026) | 2026-07-24 (sync) | Unaudited shareholder letter |
| TSLA-Q2-2026-Update.pdf | Investor deck | Q2 2026 (quarter ended Jun 30, 2026) | 2026-07-24 (sync) | Unaudited shareholder letter |
| Tesla_Inc_-_Form_10-Q(Jul-23-2026).doc | Quarterly filing (SEC 10-Q, mhtml) | Q2 2026 (quarter ended Jun 30, 2026) | 2026-07-24 (sync) | Full Item 1 financial statements + Item 2 MD&A present; filed Jul 23, 2026 |
| Tesla_Inc_-_Form_10-KA(Apr-30-2026).doc | Annual filing AMENDMENT (SEC 10-K/A, mhtml) | FY2025 (year ended Dec 31, 2025) | 2026-07-24 (sync) | Amendment No. 1 — filed solely to add Part III (exec comp / governance) and new officer certifications; states it "does not otherwise change or update" the Original Form 10-K. **The original audited FY2025 10-K (Item 8 financial statements) is NOT present in this pool as a standalone SEC document** — only this Part III-only amendment and the unaudited investor deck above stand in for it |
| Tesla, Inc., Q1 2026 Earnings Call, Apr 22, 2026.rtf | Earnings transcript | Q1 2026 (call held Apr 22, 2026) | 2026-07-24 (sync) | Full transcript, prepared remarks + Q&A |
| Tesla, Inc., Q2 2026 Earnings Call, Jul 22, 2026.rtf | Earnings transcript | Q2 2026 (call held Jul 22, 2026) | 2026-07-24 (sync) | Full transcript, prepared remarks + Q&A; consensus/actual EPS table embedded |
| Tesla Inc NasdaqGS TSLA Public Company Profile.rtf | Data export (CIQ profile) | As of extraction (2026-07) | 2026-07-24 (sync) | Company overview / business description |
| Tesla Inc NasdaqGS TSLA Public Ownership Summary.rtf | Data export (CIQ ownership) | As of extraction (2026-07) | 2026-07-24 (sync) | Holder summary |
| Company Comparable Analysis Tesla Inc .xls — Business Description | Data export (workbook tab) | Current | 2026-07-24 (sync) | 44×3 |
| Company Comparable Analysis Tesla Inc .xls — Credit Health Panel | Data export (workbook tab) | Trailing periods | 2026-07-24 (sync) | 48×10 |
| Company Comparable Analysis Tesla Inc .xls — Disclaimer | Data export (workbook tab) | — | 2026-07-24 (sync) | 26×1 |
| Company Comparable Analysis Tesla Inc .xls — Financial Data | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | 50×17 |
| Company Comparable Analysis Tesla Inc .xls — Implied Valuation | Data export (workbook tab) | Current | 2026-07-24 (sync) | 69×9 — peer comp, out of scope for this module |
| Company Comparable Analysis Tesla Inc .xls — Operating Statistics | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | 50×13 |
| Company Comparable Analysis Tesla Inc .xls — Trading Multiples | Data export (workbook tab) | Current | 2026-07-24 (sync) | 50×9 |
| Company Comparable Analysis Tesla Inc .xls — Valuation Chart | Data export (workbook tab) | Current | 2026-07-24 (sync) | 32×2 |
| Short_Interest_12m_TSLA.xls — Chart 1 with Data | Data export (workbook tab) | Trailing 12 months | 2026-07-24 (sync) | 284×2 |
| Short_Interest_12m_TSLA.xls — Attributions | Data export (workbook tab) | — | 2026-07-24 (sync) | 45×1 |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Summary | Data export (workbook tab) | Current/trailing | 2026-07-24 (sync) | 52×11 |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Financials | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | 40×13 |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Operational Metrics Charts | Data export (workbook tab) | Trailing | 2026-07-24 (sync) | 21×19 |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Solvency Metrics Charts | Data export (workbook tab) | Trailing | 2026-07-24 (sync) | 18×19 |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Liquidity Metrics Charts | Data export (workbook tab) | Trailing | 2026-07-24 (sync) | 15×19 |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Disclaimer | Data export (workbook tab) | — | 2026-07-24 (sync) | 26×1 |
| Tesla Inc NasdaqGS TSLA Customers.xls — Customers | Data export (workbook tab) | Current | 2026-07-24 (sync) | 39×8 — customer/counterparty list |
| Tesla Inc NasdaqGS TSLA Events Calendar.xls — Events Calendar | Data export (workbook tab) | Forward-looking | 2026-07-24 (sync) | 25×3 |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Key Stats | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | 91×12 |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Income Statement | Data export (workbook tab) | Multi-year annual, latest FY2025 | 2026-07-24 (sync) | 118×11; "Restatement: Latest Filings" |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Balance Sheet | Data export (workbook tab) | Multi-year annual, latest FY2025 | 2026-07-24 (sync) | 104×11 |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Cash Flow | Data export (workbook tab) | Multi-year annual, latest FY2025 | 2026-07-24 (sync) | 74×11 |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Multiples | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | 91×41 |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Historical Capitalization | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | 39×39 |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Capital Structure Summary | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | 120×21 |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Capital Structure Details | Data export (workbook tab) | Current | 2026-07-24 (sync) | 37×10 |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Ratios | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | 161×11 |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Supplemental | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | 75×10 |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Industry Specific | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | 15×6 |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Pension OPEB | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | 21×10 |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Segments | Data export (workbook tab) | Multi-year annual, latest FY2025 | 2026-07-24 (sync) | 57×10 — segment revenue/margin (Auto / Energy / Services) |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Key Stats | Data export (workbook tab) | Multi-quarter, latest Q2 2026 | 2026-07-24 (sync) | 91×12 |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Income Statement | Data export (workbook tab) | Multi-quarter, latest Q2 2026 | 2026-07-24 (sync) | 114×39 |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Balance Sheet | Data export (workbook tab) | Multi-quarter, latest Q2 2026 | 2026-07-24 (sync) | 102×39 |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Cash Flow | Data export (workbook tab) | Multi-quarter, latest Q2 2026 | 2026-07-24 (sync) | 74×39 |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Multiples | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | 91×41 |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Historical Capitalization | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | 39×39 |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Capital Structure Summary | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | 90×77 |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Capital Structure Details | Data export (workbook tab) | Current | 2026-07-24 (sync) | 37×10 |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Ratios | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | 161×39 |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Supplemental | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | 37×39 |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Industry Specific | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | 15×6 |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Pension OPEB | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | 15×6 |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Segments | Data export (workbook tab) | Multi-quarter, latest Q2 2026 | 2026-07-24 (sync) | 57×39 — quarterly segment revenue/margin |
| Tesla Inc NasdaqGS TSLA Key Developments.xls — Key Developments | Data export (workbook tab) | Trailing 1 year, latest 2026-07-22 | 2026-07-24 (sync) | 159×7 — latest row is the Q2 2026 earnings call, 2026-07-22 |
| Tesla Inc NasdaqGS TSLA Public Ownership History.xls — History | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | 5542×6 — historical holdings |
| Tesla Inc NasdaqGS TSLA Public Ownership Insider Trading.xls — Insider Trading | Data export (workbook tab) | Trailing | 2026-07-24 (sync) | 123×11 |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Consensus | Data export (workbook tab) | Forward + trailing consensus | 2026-07-24 (sync) | 496×80; consensus stamped "as of Jul-22-2026 10:12 PM GMT" |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Recent Changes | Data export (workbook tab) | Trailing | 2026-07-24 (sync) | 265×10 |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Guidance | Data export (workbook tab) | Forward | 2026-07-24 (sync) | 109×32 |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Multiples | Data export (workbook tab) | Current | 2026-07-24 (sync) | 26×7 |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Surprise | Data export (workbook tab) | Trailing | 2026-07-24 (sync) | 214×66 |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Trends | Data export (workbook tab) | Trailing/forward | 2026-07-24 (sync) | 332×25 |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Revisions | Data export (workbook tab) | Trailing | 2026-07-24 (sync) | 503×25 |

No `ciq_facts.json` sidecar exists in `_pool_extracts/`; all vendor figures below are read directly from the CIQ workbook extracts (own sourced read, not a pinned sidecar fact).

## 1A. External Data

None. `data/TSLA/external/` does not exist — no externally sourced research (alt-data, expert calls, broker notes, paid-API pulls) is present in this pool. Nothing to inventory; this has no effect on the sufficiency verdict either way.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing (audited, Item 8 financials) | **Not present** — only the 10-K/A Part III amendment and the unaudited FY2025 update deck exist | FY2025 (year ended Dec 31, 2025) | n/a — the audited original 10-K itself is missing from the pool |
| Annual filing AMENDMENT (10-K/A, Part III only) | Tesla_Inc_-_Form_10-KA(Apr-30-2026).doc | FY2025, filed Apr 30, 2026 | ~3 |
| Investor deck standing in for the annual update | Annual_Report_TSLA-Q4-2025.pdf | Q4 & FY2025 (year ended Dec 31, 2025) | ~7 (period end) |
| Quarterly filing | Tesla_Inc_-_Form_10-Q(Jul-23-2026).doc | Q2 2026 (quarter ended Jun 30, 2026), filed Jul 23, 2026 | <1 |
| Earnings transcript | Tesla, Inc., Q2 2026 Earnings Call, Jul 22, 2026.rtf | Q2 2026, call held Jul 22, 2026 | <1 (2 days old) |
| Investor deck | TSLA-Q2-2026-Update.pdf | Q2 2026 (quarter ended Jun 30, 2026) | <1 |
| Data export | Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls (all tabs) / Key Developments.xls | Through Q2 2026 (latest development row dated 2026-07-22) | <1 |

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States (Nasdaq Global Select Market) | Tesla_Inc_-_Form_10-Q(Jul-23-2026).doc — cover page, ticker NasdaqGS:TSLA |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | 10-Q and 10-K/A are SEC form types; principal executive offices in Austin, TX per 10-Q cover page |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | Q2 2026 10-Q, Item 1 "Financial Statements" (Condensed Consolidated Statements of Operations, prepared per US GAAP); Annual_Report_TSLA-Q4-2025.pdf financial summary tables labeled "(Unaudited)" GAAP figures alongside non-GAAP reconciliations |
| Reporting currency + fiscal-year end | USD; fiscal year ends December 31 | Annual_Report_TSLA-Q4-2025.pdf, Financial Summary — "($ in millions...)"; 10-Q covers quarter ended June 30, 2026 (calendar fiscal year) |
| Document language(s) | English (all documents) | All PDFs, RTFs, .doc (mhtml) filings, and CIQ workbook tabs are in English — no non-English documents in this pool, so §27's language provisions are not triggered here |

Downstream agents should read the FY2025 audited 10-K financial statements (Item 8) via the CIQ Financials_Annual export (Income Statement / Balance Sheet / Cash Flow / Segments tabs, "Restatement: Latest Filings") since the original SEC 10-K text itself is not in the pool — only its Part III-only amendment. Cite the CIQ export as the source for any FY2025 GAAP figure taken from it (§5); do not attribute a CIQ figure to "the 10-K."

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has a recent quarterly filing (10-Q for Q2 2026, filed Jul 23, 2026, 1 day old) plus a same-week earnings transcript and investor deck (both Jul 22, 2026), and — while the original audited FY2025 10-K text itself is absent — full FY2025 audited-basis income statement, balance sheet, cash flow, and segment data are available from the CIQ Financials_Annual export (period ended Dec 31, 2025, ~7 months old), which together satisfy the "annual + recent quarterly/transcript/deck" rule.
- **Critical missing items:**
  - The original, standalone FY2025 10-K (Item 8 audited financial statements, Item 7 MD&A, Item 1A risk factors in their SEC-filed form) is not in the pool — only Amendment No. 1 (Part III governance/comp only, which explicitly does not restate the financials) and the unaudited investor-deck equivalent. Downstream agents should rely on the CIQ Financials_Annual tabs for FY2025 GAAP figures and flag any claim that needs the original 10-K's narrative disclosure (e.g. full risk-factor text, contractual obligations table) as **Not proven from available data.**
  - No DEF 14A / proxy statement is present (governance/comp detail is confined to the 10-K/A's Part III text) — out of scope for this module but relevant to management-governance.
