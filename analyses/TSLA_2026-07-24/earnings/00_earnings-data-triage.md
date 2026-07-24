# Earnings Data Triage — TSLA

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | Registrant address 1 Tesla Road, Austin, Texas [Form 10-Q, Jul-23-2026, cover page] |
| Exchange | Nasdaq Global Select Market | [Form 10-Q, Jul-23-2026, cover page; Form 10-K/A, Apr-30-2026, cover page] |
| Filing regime | US SEC | Forms filed under Securities Exchange Act of 1934, Commission File No. 001-34756 [Form 10-Q, Jul-23-2026, cover page] |
| Reporting standard | US GAAP | CIQ workbooks state "Acctg. Standard: US GAAP" [Financials_Quarterly.xls, Income Statement tab; EstimatesReport.xls, Consensus tab]; 10-Q financial statements captioned "Condensed Consolidated" per US GAAP [Form 10-Q, Jul-23-2026, Item 1] |
| Reporting currency | US Dollar (USD) | [Form 10-Q, Jul-23-2026, Item 1; CIQ workbooks, "Currency: Reported Currency"/USD] |
| Fiscal-year end | December 31 | "Current Fiscal Year End: Dec-31-2026" [EstimatesReport.xls, Consensus tab]; Q2 2026 quarter ended June 30, 2026 [Form 10-Q, Jul-23-2026, cover page] |
| Document language(s) | English (all documents) | Direct read of all files in `data/TSLA/` |

Tesla is a US domestic filer (10-K / 10-Q / 8-K regime, not a foreign private issuer). No non-English documents in this pool — §27's language provision does not apply here; nothing in the pool is affected by it.

## 1. File Inventory

Multi-tab CIQ workbooks were pre-split by `extract_pool.py` (11 workbooks → 54 tabs; 64 extract files total across 21 sources; 0 failures — `_pool_extracts/manifest.md` / `manifest.json`). Every workbook tab is listed as its own row below, reconciled against the manifest. "Last Modified" is the Drive-sync timestamp (all files synced 2026-07-24) — NOT the reporting period; period is parsed from inside each document (fix F23).

| Filename (+ tab where applicable) | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| Annual_Report_TSLA-Q4-2024.pdf | Investor deck / unaudited shareholder update (mislabeled "Annual Report" in filename; entire deck marked "(Unaudited)") | Q4 & FY2024 (year ended Dec 31, 2024) | 2026-07-24 (sync) | Medium (superseded by FY2025 update) |
| Annual_Report_TSLA-Q4-2025.pdf | Investor deck / unaudited shareholder update + earnings press-release equivalent (same "mislabeled Annual Report" pattern; deck marked "(Unaudited)"; includes GAAP income statement, balance sheet, cash flow) | Q4 & FY2025 (year ended Dec 31, 2025) | 2026-07-24 (sync) | High |
| TSLA-Q1-2026-Update.pdf | Investor deck / unaudited shareholder update (income statement, balance sheet, cash flow, outlook) | Q1 2026 (quarter ended Mar 31, 2026) | 2026-07-24 (sync) | High |
| TSLA-Q2-2026-Update.pdf | Investor deck / unaudited shareholder update (income statement, balance sheet, cash flow, outlook) — most recent | Q2 2026 (quarter ended Jun 30, 2026) | 2026-07-24 (sync) | High |
| Tesla_Inc_-_Form_10-Q(Jul-23-2026).doc | Quarterly filing (SEC 10-Q, mhtml) | Q2 2026 (quarter ended Jun 30, 2026) | 2026-07-24 (sync) | High — full Item 1 financial statements + Item 2 MD&A |
| Tesla_Inc_-_Form_10-KA(Apr-30-2026).doc | Annual filing AMENDMENT (SEC 10-K/A, Part III only) | FY2025 (year ended Dec 31, 2025) | 2026-07-24 (sync) | Low for earnings numbers — this amendment adds ONLY Part III (Items 10–14: directors, exec comp, ownership, related-party, auditor fees) plus new officer certifications. It states it "does not otherwise change or update" the Original Form 10-K. **The Original Form 10-K (Item 8 audited financial statements) for FY2025, filed Jan 29, 2026 per the Explanatory Note, is NOT present in this pool as a standalone SEC document.** |
| Tesla, Inc., Q1 2026 Earnings Call, Apr 22, 2026.rtf | Earnings transcript — **verbatim** (S&P Global Market Intelligence / CIQ) | Q1 2026 (call held Apr 22, 2026) | 2026-07-24 (sync) | High — full prepared remarks + Q&A, participant list, embedded consensus/actual table |
| Tesla, Inc., Q2 2026 Earnings Call, Jul 22, 2026.rtf | Earnings transcript — **verbatim** (S&P Global Market Intelligence / CIQ) — most recent call | Q2 2026 (call held Jul 22, 2026) | 2026-07-24 (sync) | High — full prepared remarks + Q&A |
| Tesla Inc NasdaqGS TSLA Public Company Profile.rtf | Data export (CIQ company profile / business description) | As of extraction (2026-07) | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Public Ownership Summary.rtf | Data export (CIQ ownership summary) | As of extraction (2026-07) | 2026-07-24 (sync) | Low |
| Company Comparable Analysis Tesla Inc .xls — Business Description | Data export (workbook tab) | Current | 2026-07-24 (sync) | Low |
| Company Comparable Analysis Tesla Inc .xls — Credit Health Panel | Data export (workbook tab) | Trailing periods | 2026-07-24 (sync) | Medium |
| Company Comparable Analysis Tesla Inc .xls — Disclaimer | Data export (workbook tab) | — | 2026-07-24 (sync) | Low |
| Company Comparable Analysis Tesla Inc .xls — Financial Data | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | Medium |
| Company Comparable Analysis Tesla Inc .xls — Implied Valuation | Data export (workbook tab) | Current | 2026-07-24 (sync) | Low — peer/valuation comp, out of earnings scope |
| Company Comparable Analysis Tesla Inc .xls — Operating Statistics | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | Medium |
| Company Comparable Analysis Tesla Inc .xls — Trading Multiples | Data export (workbook tab) | Current | 2026-07-24 (sync) | Low |
| Company Comparable Analysis Tesla Inc .xls — Valuation Chart | Data export (workbook tab) | Current | 2026-07-24 (sync) | Low |
| Short_Interest_12m_TSLA.xls — Chart 1 with Data | Data export (workbook tab) | Trailing 12 months | 2026-07-24 (sync) | Low |
| Short_Interest_12m_TSLA.xls — Attributions | Data export (workbook tab) | — | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Summary | Data export (workbook tab) | Current/trailing | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Financials | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | Medium — cash flow/solvency proxy |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Operational Metrics Charts | Data export (workbook tab) | Trailing | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Solvency Metrics Charts | Data export (workbook tab) | Trailing | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Liquidity Metrics Charts | Data export (workbook tab) | Trailing | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Disclaimer | Data export (workbook tab) | — | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Customers.xls — Customers | Data export (workbook tab) | Current | 2026-07-24 (sync) | Low — customer/counterparty list, business-model relevant |
| Tesla Inc NasdaqGS TSLA Events Calendar.xls — Events Calendar | Data export (workbook tab) | Forward-looking | 2026-07-24 (sync) | Medium — upcoming earnings/event dates |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Key Stats | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Income Statement | Data export (workbook tab) | Multi-year annual, latest FY2025 | 2026-07-24 (sync) | High |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Balance Sheet | Data export (workbook tab) | Multi-year annual, latest FY2025 | 2026-07-24 (sync) | High |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Cash Flow | Data export (workbook tab) | Multi-year annual, latest FY2025 | 2026-07-24 (sync) | High |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Multiples | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Historical Capitalization | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Capital Structure Summary | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Capital Structure Details | Data export (workbook tab) | Current | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Ratios | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Supplemental | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Industry Specific | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Pension OPEB | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Segments | Data export (workbook tab) | Multi-year annual, latest FY2025 | 2026-07-24 (sync) | High — segment revenue/margin (Automotive / Energy Gen & Storage / Services) |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Key Stats | Data export (workbook tab) | Multi-quarter, latest Q2 2026 | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Income Statement | Data export (workbook tab) | Multi-quarter, latest Q2 2026 | 2026-07-24 (sync) | High |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Balance Sheet | Data export (workbook tab) | Multi-quarter, latest Q2 2026 | 2026-07-24 (sync) | High |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Cash Flow | Data export (workbook tab) | Multi-quarter, latest Q2 2026 | 2026-07-24 (sync) | High |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Multiples | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Historical Capitalization | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Capital Structure Summary | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Capital Structure Details | Data export (workbook tab) | Current | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Ratios | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Supplemental | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Industry Specific | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Pension OPEB | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Segments | Data export (workbook tab) | Multi-quarter, latest Q2 2026 | 2026-07-24 (sync) | High — quarterly segment revenue/margin |
| Tesla Inc NasdaqGS TSLA Key Developments.xls — Key Developments | Data export (workbook tab) | Trailing 1 year (through 2026-07-22) | 2026-07-24 (sync) | Medium — results-announcement / corporate-communication log, useful for catalyst/event timing |
| Tesla Inc NasdaqGS TSLA Public Ownership History.xls — History | Data export (workbook tab) | Historical | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Public Ownership Insider Trading.xls — Insider Trading | Data export (workbook tab) | Trailing | 2026-07-24 (sync) | Low — governance-relevant, not earnings |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Consensus | Data export (workbook tab) — consensus/estimate export | Current, fresh as of extraction (post Q2 2026 print; FQ3 2026 release date Oct-21-2026 stated) | 2026-07-24 (sync) | High |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Recent Changes | Data export (workbook tab) | Current | 2026-07-24 (sync) | High — estimate revision momentum |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Guidance | Data export (workbook tab) | Sparse/stale — populated entries stop around 2014–2015; Tesla does not issue point EPS/revenue guidance that CIQ tracks in this field | 2026-07-24 (sync) | Low — this specific tab is not a useful guidance source; qualitative guidance instead lives in the Update-letter "Outlook" sections and the call transcripts |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Multiples | Data export (workbook tab) | Current | 2026-07-24 (sync) | Medium |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Surprise | Data export (workbook tab) | Historical, through latest reported quarter (Q2 2026) | 2026-07-24 (sync) | High — beat/miss history |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Trends | Data export (workbook tab) | Current | 2026-07-24 (sync) | High |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Revisions | Data export (workbook tab) | Current, through FQ3 2026 forward estimates | 2026-07-24 (sync) | High |

No `data/TSLA/external/` folder exists in this pool — Section 1A (External Data) is omitted; nothing external to flag.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing (audited, Item 8 financials) | **Not present as a standalone document.** Nearest surrogate: Annual_Report_TSLA-Q4-2025.pdf (unaudited shareholder update covering FY2025) | FY2025 (year ended Dec 31, 2025) | ~7 months (report dated late Jan 2026; today 2026-07-24) |
| Annual filing (SEC form, Part III only) | Tesla_Inc_-_Form_10-KA(Apr-30-2026).doc | FY2025 (year ended Dec 31, 2025) | ~3 months |
| Quarterly filing | Tesla_Inc_-_Form_10-Q(Jul-23-2026).doc | Q2 2026 (quarter ended Jun 30, 2026) | ~0 months (filed 1 day before triage date) |
| Earnings transcript | Tesla, Inc., Q2 2026 Earnings Call, Jul 22, 2026.rtf | Q2 2026 (call held Jul 22, 2026) | ~0 months |
| Investor deck | TSLA-Q2-2026-Update.pdf | Q2 2026 (quarter ended Jun 30, 2026) | ~0 months |
| Consensus / estimate export | Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Consensus / Revisions / Surprise / Trends | Current, reflects data through Q2 2026 print (next release FQ3 2026, Oct-21-2026 per the workbook) | ~0 months |
| Cash flow data | Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Cash Flow (latest Jun-30-2026); Form 10-Q, Jul-23-2026, Item 1 | Q2 2026 | ~0 months |
| Guidance data | Qualitative guidance in TSLA-Q2-2026-Update.pdf "Outlook" section and Q2 2026 Earnings Call transcript; the CIQ "Guidance" tab is stale (last populated ~2014–2015) and not usable | Q2 2026 | ~0 months (qualitative source); CIQ Guidance tab is not current |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | Form 10-Q (Jul-23-2026), Item 1; TSLA-Q2-2026-Update.pdf, Financial Statements section; Financials_Quarterly.xls, Income Statement tab | Needed for revenue, margin, EPS |
| Balance sheet | Y | Form 10-Q (Jul-23-2026), Item 1; TSLA-Q2-2026-Update.pdf, Balance Sheet section; Financials_Quarterly.xls, Balance Sheet tab | Needed for working capital and leverage |
| Cash flow statement | Y | Form 10-Q (Jul-23-2026), Item 1; TSLA-Q2-2026-Update.pdf, Statement of Cash Flows section; Financials_Quarterly.xls, Cash Flow tab | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Form 10-Q for Q2 2026 (quarter ended Jun 30, 2026), filed Jul 23, 2026 — one day before this triage | Needed for trend and setup |
| Last 8 quarters | Y | Financials_Quarterly.xls, Income Statement / Balance Sheet / Cash Flow tabs run quarterly from FQ1 2017 through Jun-30-2026 (well beyond 8 quarters); TSLA-Q1/Q2-2026-Update.pdf show 5-quarter trend tables | Needed for seasonality and inflection |
| Consensus estimates | Y | EstimatesReport.xls, Consensus tab — mean/median target price, EPS Normalized and Revenue estimates through multiple forward years, "Current Fiscal Year End: Dec-31-2026 \| FQ3 2026 Earnings Release Date: Oct-21-2026" | Needed for market bar |
| Estimate revisions | Y | EstimatesReport.xls, Recent Changes and Revisions tabs | Needed for revision momentum |
| Earnings transcript | Y — verbatim | Q1 2026 (Apr 22, 2026) and Q2 2026 (Jul 22, 2026) CIQ/S&P Global Market Intelligence transcripts, both with prepared remarks + Q&A | Needed for management tone and driver detail |
| Segment P&L | Y | Financials_Annual.xls and Financials_Quarterly.xls, Segments tabs (Automotive / Energy Generation & Storage / Services); Form 10-Q Note disclosures | Needed for mix shift |
| Current price | Y | EstimatesReport.xls, Consensus tab: "Latest Price/Last Close Price 319.69" (data-vendor figure, not a filing number) | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y |
| 06_value-chain.md | Y |
| 10_external-dependency.md | Y |

The full business-model module has run (`analyses/TSLA_2026-07-24/business-model/00` through `99`, plus a dossier and memo) and is available for cross-reference.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus, revisions, surprise, and trend data are all present and current | 04, 05, 99 | Not applicable |
| No quarterly data | N — CIQ quarterly workbook and the Q2 2026 10-Q both cover the latest quarter, with history back to 2017 | 01, 02, 03, 06 | Not applicable |
| No VERBATIM transcript, sell-side proxy present | N — both Q1 2026 and Q2 2026 transcripts are verbatim CIQ transcripts, not sell-side proxies | 02, 03, 04 | Not applicable |
| No transcript AND no sell-side proxy | N — two verbatim transcripts are present | 02, 03, 04 | Not applicable |
| No segment-level P&L | N — Segments tabs present at both annual and quarterly frequency | 02, 03, 99 | Not applicable |
| No cash flow statement | N — present in the 10-Q, the Update letters, and the CIQ Cash Flow tabs | 06, 99 | Not applicable |
| No current price | N — CIQ Consensus tab carries a last-close price (data-vendor figure, cite as such — not a filing number) | 99 | Not applicable |

No partial-data caps from the standard list bind. One item outside the standard list is flagged for downstream awareness (not a cap, since the Update-letter surrogate and the CIQ quarterly/annual workbooks together satisfy the "recent annual filing or equivalent full-year financials" bar):

- **The audited FY2025 10-K (Item 8 financial statements) itself is not in this pool** — only its Part III-only amendment (10-K/A) and the company's own unaudited Q4/FY2025 Update letter. Agents citing FY2025 annual figures should cite the Update letter (labelled "(Unaudited)") or the CIQ Financials_Annual export, and should NOT cite "FY2025 10-K" as the source for a number that in fact came from the unaudited deck or the vendor export — that would violate the same-source citation rule (CLAUDE.md §5). Downstream agents (01, 02, 03, 06) should state this explicitly wherever a FY2025 full-year GAAP figure is used.

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has a verbatim latest-quarter earnings transcript (Q2 2026, Jul 22, 2026), a filed latest-quarter 10-Q (quarter ended Jun 30, 2026, filed Jul 23, 2026) with full income statement, balance sheet, and cash flow statement, a current and detailed consensus/estimate export with revision history and surprise history, and segment-level P&L at both annual and quarterly frequency — every element of the Sufficient bar is met from filings, transcripts, and vendor exports, none of them stale.
- **Active partial-data caps:** None.
- **Critical missing items:** None binding a cap. Note only: the standalone audited FY2025 10-K (Item 8) is absent from the pool — its Part III-only amendment and the company's own unaudited Update letter stand in for the full-year 2025 figures; agents must cite the Update letter or the CIQ Financials_Annual export by name for any FY2025 annual number, never mislabel it as coming from "the 10-K."
