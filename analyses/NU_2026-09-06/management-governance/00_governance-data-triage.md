# Governance Data Triage — NU

**Ticker:** NU (Nu Holdings Ltd.) · **Date:** 2026-09-06 · **Data pool:** `data/NU/` (citation label)

**Evidence binding (MODULE_PIPELINE Step 1.5).** The complete frozen quartet is present and was verified before any pool read: `NOSTRA_FROZEN_EVIDENCE_ROOT`, `NOSTRA_FROZEN_POOL_DATA_PATH`, `NOSTRA_FROZEN_POOL_OUT_DIR`, `NOSTRA_FROZEN_POOL_GENERATION` = `f9081efa6e33b60af52e2eeb6b01c69e96872dbe70c60d9111ef0a504509f2be`. All manifest, corpus, `ciq_facts.json` and `relationships.json` reads resolved through that exact generation. `extract_pool.py` was NOT run, no extract was rebuilt, and no live `data/NU/` or original `_pool_extracts/` path was read. `data/NU/` below is a citation label only.

**Manifest integrity.** `manifest.json` reports `sources: 115`, `workbooks: 48`, `tabs: 109`, `extracts_written: 174`, **`failures: 0`**, `offline_extraction_complete: true`. Status counts across all 115 sources: `ok` 113, `in-place` 2. **No source is in a `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer` state**, so no source is downgraded to "missing" under the fix-F03 rule and no extraction-failure cap binds.

**Reporting-period rule (fix F23).** Every filesystem timestamp in this pool reads `2026-09-06` — that is the frozen-generation sync date, not the document's date. Every period below is parsed from INSIDE the document (period-end line, "as of" line, filing date on the cover, or the export's own Report Criteria block). The "Last Modified" column is recorded as the sync date and carries no evidential weight.

---

## 1. File Inventory

Every one of the 115 sources is listed. Each multi-tab workbook is broken out with one row per tab (parent file + sheet name + rows × cols), reconciled against the frozen `manifest.json` and the `# SOURCE / # SHEET / # DIMS` headers of the 109 tab extracts. No workbook appears as a single opaque row.

### 1.1 Primary filings — Nu Holdings Ltd. (SEC / B3-BDR)

| Filename | Type | Period Covered | Last Modified | Governance Relevance |
|---|---|---|---|---|
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` | Annual filing (20-F, FPI) | FY2025 (year ended 2025-12-31); filed 2026-04-08 | 2026-09-06 (sync) | **High** — Items 6/7/16 = the full governance disclosure |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).doc` | Annual filing (same 20-F, MHTML) | FY2025; filed 2026-04-08 | 2026-09-06 (sync) | High (duplicate format) |
| `Nu Holdings Ltd. Form 20-F filed on Apr-08-2026.pdf` | Filing cover / index page | FY2025; filed 2026-04-08 | 2026-09-06 (sync) | Low (6 KB index stub) |
| `Filings/Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` | Annual filing (dup copy) | FY2025 | 2026-09-06 (sync) | High (duplicate) |
| `Filings 2/Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` | Annual filing (dup copy) | FY2025 | 2026-09-06 (sync) | High (duplicate) |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).pdf` | Annual filing (20-F) | FY2024; filed 2025-04-16 | 2026-09-06 (sync) | High — prior-year board, comp, ownership, RPT |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).doc` | Annual filing (same, MHTML) | FY2024; filed 2025-04-16 | 2026-09-06 (sync) | High (duplicate format) |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-19-2024).pdf` | Annual filing (20-F) | FY2023; filed 2024-04-19 | 2026-09-06 (sync) | High — promise-vs-delivery baseline |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-20-2023).pdf` | Annual filing (20-F) | FY2022; filed 2023-04-20 | 2026-09-06 (sync) | High |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-21-2022).pdf` | Annual filing (20-F, first post-IPO) | FY2021; filed 2022-04-21 | 2026-09-06 (sync) | High — IPO-era control structure |
| `Filings/Nu_Holdings_Ltd_-_Form_Annual_Report(Feb-26-2026).pdf` | Annual results / earnings report | FY2025; released 2026-02-26 | 2026-09-06 (sync) | Medium — management commentary |
| `Filings 2/Nu_Holdings_Ltd_-_Form_Annual_Report(Feb-26-2026).pdf` | Annual results (dup) | FY2025 | 2026-09-06 (sync) | Medium (duplicate) |
| `Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` | Interim report | Q2 2026 (quarter ended 2026-06-30); filed 2026-08-14 | 2026-09-06 (sync) | Medium — latest reported period |
| `Filings 2/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` | Interim report (dup) | Q2 2026 | 2026-09-06 (sync) | Medium (duplicate) |
| `Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(May-14-2026).pdf` | Interim report | Q1 2026 (ended 2026-03-31); filed 2026-05-14 | 2026-09-06 (sync) | Medium |
| `Filings 2/Nu_Holdings_Ltd_-_Form_Interim_Report(May-14-2026).pdf` | Interim report (dup) | Q1 2026 | 2026-09-06 (sync) | Medium (duplicate) |
| `Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(May-15-2026).pdf` | Interim report (re-file) | Q1 2026; 2026-05-15 | 2026-09-06 (sync) | Medium |
| `Filings 2/Nu_Holdings_Ltd_-_Form_Interim_Report(May-15-2026).pdf` | Interim report (dup) | Q1 2026 | 2026-09-06 (sync) | Medium (duplicate) |
| `Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf` | **BDR depositary notice (Bradesco), Portuguese** | Q2 2026 release; dated 2026-08-20 | 2026-09-06 (sync) | Low — proves the B3 BDR Level I line exists |
| `Filings 2/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf` | BDR notice (dup), Portuguese | 2026-08-20 | 2026-09-06 (sync) | Low (duplicate) |
| `Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(May-20-2026).pdf` | BDR depositary notice, Portuguese | 2026-05-20 | 2026-09-06 (sync) | Low |
| `Filings 2/Nu_Holdings_Ltd_-_Form_Interim_Report(May-20-2026).pdf` | BDR notice (dup), Portuguese | 2026-05-20 | 2026-09-06 (sync) | Low (duplicate) |
| `Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Nov-17-2025).pdf` | BDR depositary notice, Portuguese | 2025-11-17 | 2026-09-06 (sync) | Low |
| `Filings 2/Nu_Holdings_Ltd_-_Form_Interim_Report(Nov-17-2025).pdf` | BDR notice (dup), Portuguese | 2025-11-17 | 2026-09-06 (sync) | Low (duplicate) |
| `Filings/Nu_Holdings_Ltd_-_(Aug-19-2025).pdf` | BDR depositary notice, Portuguese | 2025-08-19 | 2026-09-06 (sync) | Low |
| `Filings 2/Nu_Holdings_Ltd_-_(Aug-19-2025).pdf` | BDR notice (dup), Portuguese | 2025-08-19 | 2026-09-06 (sync) | Low (duplicate) |
| `Filings/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf` | Earnings release | Q2 2026; 2026-08-13 | 2026-09-06 (sync) | Medium — candor / tone |
| `Filings 2/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf` | Earnings release (dup) | Q2 2026 | 2026-09-06 (sync) | Medium (duplicate) |
| `Filings/Nu_Holdings_Ltd_-_(Aug-13-2026).pdf` | Earnings release (same content) | Q2 2026; 2026-08-13 | 2026-09-06 (sync) | Medium |
| `Filings 2/Nu_Holdings_Ltd_-_(Aug-13-2026).pdf` | Earnings release (dup) | Q2 2026 | 2026-09-06 (sync) | Medium (duplicate) |
| `Filings/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(May-14-2026).pdf` | Earnings release | Q1 2026; 2026-05-14 | 2026-09-06 (sync) | Medium |
| `Filings 2/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(May-14-2026).pdf` | Earnings release (dup) | Q1 2026 | 2026-09-06 (sync) | Medium (duplicate) |
| `Filings/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Feb-25-2026).pdf` | Earnings release | Q4/FY2025; 2026-02-25 | 2026-09-06 (sync) | Medium |
| `Filings 2/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Feb-25-2026).pdf` | Earnings release (dup) | Q4/FY2025 | 2026-09-06 (sync) | Medium (duplicate) |
| `Filings/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Nov-13-2025).pdf` | Earnings release | Q3 2025; 2025-11-13 | 2026-09-06 (sync) | Medium |
| `Filings 2/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Nov-13-2025).pdf` | Earnings release (dup) | Q3 2025 | 2026-09-06 (sync) | Medium (duplicate) |

### 1.2 Transcripts (Transcript Digest — 20 files)

| Filename | Type | Period Covered | Last Modified | Governance Relevance |
|---|---|---|---|---|
| `Nu Holdings Ltd., Q2 2026 Earnings Call, Aug 13, 2026.pdf` | Transcript | Q2 2026 call, 2026-08-13 | 2026-09-06 (sync) | High — candor, latest |
| `Nu Holdings Ltd., Q1 2026 Earnings Call, May 14, 2026.pdf` | Transcript | Q1 2026, 2026-05-14 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q4 2025 Earnings Call, Feb 25, 2026.pdf` | Transcript | Q4/FY2025, 2026-02-25 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q3 2025 Earnings Call, Nov 13, 2025.pdf` | Transcript | Q3 2025, 2025-11-13 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q2 2025 Earnings Call, Aug 14, 2025.pdf` | Transcript | Q2 2025, 2025-08-14 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q1 2025 Earnings Call, May 13, 2025.pdf` | Transcript | Q1 2025, 2025-05-13 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q4 2024 Earnings Call, Feb 20, 2025.pdf` | Transcript | Q4/FY2024, 2025-02-20 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q3 2024 Earnings Call, Nov 13, 2024.pdf` | Transcript | Q3 2024, 2024-11-13 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q2 2024 Earnings Call, Aug 13, 2024.pdf` | Transcript | Q2 2024, 2024-08-13 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q1 2024 Earnings Call, May 14, 2024.pdf` | Transcript | Q1 2024, 2024-05-14 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q4 2023 Earnings Call, Feb 22, 2024.pdf` | Transcript | Q4/FY2023, 2024-02-22 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q3 2023 Earnings Call, Nov 14, 2023.pdf` | Transcript | Q3 2023, 2023-11-14 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q2 2023 Earnings Call, Aug 15, 2023.pdf` | Transcript | Q2 2023, 2023-08-15 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q1 2023 Earnings Call, May 15, 2023.pdf` | Transcript | Q1 2023, 2023-05-15 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q4 2022 Earnings Call, Feb 14, 2023.pdf` | Transcript | Q4/FY2022, 2023-02-14 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q3 2022 Earnings Call, Nov 14, 2022.pdf` | Transcript | Q3 2022, 2022-11-14 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q2 2022 Earnings Call, Aug 15, 2022.pdf` | Transcript | Q2 2022, 2022-08-15 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q1 2022 Earnings Call, May 16, 2022.pdf` | Transcript | Q1 2022, 2022-05-16 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd., Q4 2021 Earnings Call, Feb 22, 2022.pdf` | Transcript | Q4/FY2021, 2022-02-22 | 2026-09-06 (sync) | High — first call as a listed company |
| `Nu Holdings Ltd. - ShareholderAnalyst Call.pdf` | Shareholder/analyst call transcript | undated in document | 2026-09-06 (sync) | Medium |

### 1.3 Capital IQ governance & ownership exports (workbooks — one row per tab)

| Filename · Tab | Type | Period / As-of (from inside) | Last Modified | Governance Relevance |
|---|---|---|---|---|
| `Nu Holdings Ltd NYSE NU Board Members.xls` · **Board Members** (1 of 1, 28×25) | Board roster | Report Criteria: "Current Board Members", export ~Aug-2026 | 2026-09-06 (sync) | **High** — board composition |
| `Nu Holdings Ltd NYSE NU Committees.xls` · **Committees** (1 of 1, 35×2) | Committee membership | "Current Committee Members" | 2026-09-06 (sync) | **High** — audit/comp/risk membership |
| `Nu Holdings Ltd NYSE NU Professionals.xls` · **Professionals** (1 of 1, 29×24) | KMP / officer roster | "Current Professionals" | 2026-09-06 (sync) | **High** — management team |
| `Nu Holdings Ltd NYSE NU Auditors.xls` · **Auditors** (1 of 1, 18×5) | Auditor history + opinions | Time Frame FY2020–FY2026 | 2026-09-06 (sync) | **High** — A4-01/04/05 |
| `Nu Holdings Ltd NYSE NU Public Ownership Insider Trading.xls` · **Insider Trading** (1 of 1, 46×11) | Insider transactions (Form 4) | "All History"; latest event 2026-08-24, filed 2026-08-26 | 2026-09-06 (sync) | **High** — A3/A4 insider conduct |
| `Nu Holdings Ltd NYSE NU Public Ownership Detailed.xls` · **Detailed** (1 of 1, 1346×15) | Holder-by-holder ownership | latest period 2026-06-30 | 2026-09-06 (sync) | **High** — ownership map |
| `Nu Holdings Ltd NYSE NU Public Ownership History.xls` · **History** (1 of 1, 1499×5) | Ownership time series | 2025-12-31 → 2026-06-30 | 2026-09-06 (sync) | **High** — holding trend |
| `Nu Holdings Ltd NYSE NU Public Ownership Crossholdings.xls` · **Crossholdings** (1 of 1, 1840×7) | Holder cross-holdings | as of export ~Aug-2026 | 2026-09-06 (sync) | Medium — network mapping |
| `Nu Holdings Ltd NYSE NU Public Ownership Summary.rtf` | Ownership summary | as of export ~Aug-2026 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd NYSE NU Private Ownership.rtf` | Pre-IPO / private holders | as of export ~Aug-2026 | 2026-09-06 (sync) | Medium — founder vehicles |
| `Nu Holdings Ltd NYSE NU Takeover Defenses.xls` · **Corporate Governance** (1 of 3, 48×4) | Charter/bylaw governance terms | as of export ~Aug-2026 | 2026-09-06 (sync) | **High** — A1/A10 shareholder rights |
| `Nu Holdings Ltd NYSE NU Takeover Defenses.xls` · **Takeover Defenses** (2 of 3, 26×4) | Anti-takeover provisions | as of export ~Aug-2026 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd NYSE NU Takeover Defenses.xls` · **Compare Defenses** (3 of 3, 36×8) | Peer comparison of defenses | as of export ~Aug-2026 | 2026-09-06 (sync) | Medium |
| `Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls` · **Nu Holdings Ltd NYSENU Corpor** (1 of 3, 53×17) | Subsidiary tree | "Current Subsidiaries/Operating Units" | 2026-09-06 (sync) | **High** — A11 group structure |
| `Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls` · **Filtered Count** (2 of 3, 22×4) | Tree counts | as of export | 2026-09-06 (sync) | Low |
| `Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls` · **Aggregates** (3 of 3, 22×4) | Tree aggregates | as of export | 2026-09-06 (sync) | Low |
| `Nu Holdings Ltd NYSE NU Key Developments.rtf` | Corporate-event history | through Aug-2026 (incl. AGM 2026-08-06, CFO change 2026-07-13) | 2026-09-06 (sync) | **High** — management changes, AGM, buyback |
| `Nu Holdings Ltd NYSE NU Corporate Timeline.xls` · **Corporate Timeline** (1 of 1, 51×4) | Company timeline | founding → 2026 | 2026-09-06 (sync) | **High** — lineage anchor |
| `Nu Holdings Ltd NYSE NU Public Company Profile.rtf` | Company profile | as of export ~Aug-2026 | 2026-09-06 (sync) | Medium — identity anchors |
| `Nu Holdings Ltd NYSE NU Long Business Description.rtf` | Business description | as of export ~Aug-2026 | 2026-09-06 (sync) | Low |
| `Nu Holdings Ltd NYSE NU Industry Classifications.rtf` | GICS/SIC classification | as of export ~Aug-2026 | 2026-09-06 (sync) | Medium — sector overlay |
| `Nu Holdings Ltd NYSE NU Equity Listings.xls` · **Equity Listings** (1 of 1, 25×11) | Listed lines / venues | as of export ~Aug-2026 | 2026-09-06 (sync) | **High** — which tradable line |
| `Nu Holdings Ltd NYSE NU Equity Listings.rtf` | Listings (RTF form) | as of export ~Aug-2026 | 2026-09-06 (sync) | High (duplicate format) |
| `Nu Holdings Ltd NYSE NU Investment Analysis Direct Investments.xls` · **Direct Investments** (1 of 1, 55×21) | Company's own investments/M&A | history to 2026 | 2026-09-06 (sync) | **High** — capital allocation |
| `Nu Holdings Ltd NYSE NU Investment Analysis Co Investors.xls` · **Co-Investors** (1 of 1, 53×3) | Co-investor network | history to 2026 | 2026-09-06 (sync) | Medium — network mapping |
| `Transaction Summary M A Private Placements.xls` · **M A Private Placements** (1 of 1, 25×14) | M&A / private placement history | history to 2026 | 2026-09-06 (sync) | **High** — capital allocation |
| `Transaction Summary Public Offerings.xls` · **Public Offerings** (1 of 1, 15×8) | Equity/debt issuance history | history to 2026 | 2026-09-06 (sync) | **High** — dilution history |
| `Nu Holdings Ltd NYSE NU Strategic Alliances.xls` · **Strategic Alliances** (1 of 1, 25×7) | Alliances / partnerships | history to 2026 | 2026-09-06 (sync) | Medium — counterparty network |
| `Nu Holdings Ltd NYSE NU Suppliers.xls` · **Suppliers** (1 of 1, 25×8) | Disclosed suppliers | recent disclosures only | 2026-09-06 (sync) | Medium — RPT cross-check |
| `Nu Holdings Ltd NYSE NU Customers.xls` · **Customers** (1 of 1, 16×8) | Disclosed customers | recent disclosures only | 2026-09-06 (sync) | Low |
| `Nu Holdings Ltd NYSE NU Fixed Income S P Global Ratings.xls` · **S P Global Ratings** (1 of 1, 20×8) | Rating actions | to 2026 | 2026-09-06 (sync) | **High** — A12 rating conduct |
| `Nu Holdings Ltd NYSE NU Fixed Income Securities Summary.xls` · **Securities Summary** (1 of 1, 2299×24) | Debt instrument register | to 2026 | 2026-09-06 (sync) | Medium |
| `Nu Holdings Ltd NYSE NU Events Calendar.xls` · **Events Calendar** (1 of 1, 27×3) | Scheduled events | forward from 2026 | 2026-09-06 (sync) | Low |
| `Nu Holdings Ltd NYSE NU Analyst Coverage.xls` · **Analyst Coverage** (1 of 1, 41×6) | Sell-side coverage list | as of export ~Aug-2026 | 2026-09-06 (sync) | Medium — A15-03 |
| `Nu Holdings Ltd NYSE NU Analyst Coverage (1).xls` · **Analyst Coverage** (1 of 1, 41×6) | Coverage list (duplicate export) | as of export ~Aug-2026 | 2026-09-06 (sync) | Medium (duplicate) |
| `Nu Holdings Ltd NYSE NU Products.xls` · **Products** (1 of 1, 31×5) | Product list | as of export ~Aug-2026 | 2026-09-06 (sync) | Low — brand anchors |
| `Nu Holdings Ltd NYSE NU Competitors.xls` · **Competitors** (1 of 1, 89×8) | Peer set | as of export ~Aug-2026 | 2026-09-06 (sync) | Low |
| `Nu Holdings Ltd NYSE NU Comparable M A Transactions.xls` · **Comparable M A Transactions** (1 of 1, 17×9) | Peer M&A comps | history to 2026 | 2026-09-06 (sync) | Low |
| `Nu Holdings Ltd NYSE NU Comparable M A Transactions (1).xls` · **Comparable M A Transactions** (1 of 1, 17×9) | Peer M&A comps (dup export) | history to 2026 | 2026-09-06 (sync) | Low (duplicate) |

### 1.4 Capital IQ financial workbooks (one row per tab)

| Filename · Tab | Type | Period / As-of | Last Modified | Governance Relevance |
|---|---|---|---|---|
| `Nu Holdings Ltd NYSE NU Financials.xls` · **Key Stats** (1 of 13, 85×9) | Financial export | annual + LTM to Jun-30-2026 | 2026-09-06 (sync) | Medium |
| `Nu Holdings Ltd NYSE NU Financials.xls` · **Income Statement** (2 of 13, 94×7) | Financial export | FY2021–FY2025 + LTM | 2026-09-06 (sync) | Medium — 11 forensics |
| `Nu Holdings Ltd NYSE NU Financials.xls` · **Balance Sheet** (3 of 13, 89×7) | Financial export | FY2021–FY2025 + LTM | 2026-09-06 (sync) | Medium — 11 forensics |
| `Nu Holdings Ltd NYSE NU Financials.xls` · **Cash Flow** (4 of 13, 72×7) | Financial export | FY2021–FY2025 + LTM | 2026-09-06 (sync) | **High** — capital allocation |
| `Nu Holdings Ltd NYSE NU Financials.xls` · **Multiples** (5 of 13, 61×9) | Financial export | to 2026 | 2026-09-06 (sync) | Low |
| `Nu Holdings Ltd NYSE NU Financials.xls` · **Historical Capitalization** (6 of 13, 38×7) | Financial export | FY2021–FY2025 | 2026-09-06 (sync) | **High** — dilution / share count |
| `Nu Holdings Ltd NYSE NU Financials.xls` · **Capital Structure Summary** (7 of 13, 60×7) | Financial export | FY2021–FY2025 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd NYSE NU Financials.xls` · **Capital Structure Details** (8 of 13, 33×10) | Financial export | to 2026 | 2026-09-06 (sync) | High |
| `Nu Holdings Ltd NYSE NU Financials.xls` · **Ratios** (9 of 13, 149×7) | Financial export | FY2021–FY2025 + LTM | 2026-09-06 (sync) | Medium |
| `Nu Holdings Ltd NYSE NU Financials.xls` · **Supplemental** (10 of 13, 50×7) | Financial export | FY2021–FY2025 | 2026-09-06 (sync) | Low |
| `Nu Holdings Ltd NYSE NU Financials.xls` · **Industry Specific** (11 of 13, 68×7) | Bank-specific metrics | FY2021–FY2025 | 2026-09-06 (sync) | Medium — bank overlay |
| `Nu Holdings Ltd NYSE NU Financials.xls` · **Pension OPEB** (12 of 13, 15×6) | Pension export | FY2021–FY2025 | 2026-09-06 (sync) | Low |
| `Nu Holdings Ltd NYSE NU Financials.xls` · **Segments** (13 of 13, 77×7) | Segment export | FY2021–FY2025 | 2026-09-06 (sync) | Low |
| `Nu Holdings Ltd NYSE NU Financials Balance Sheet.xls` · **Balance Sheet** (1 of 1, 89×7) | Standalone dup of the above tab | FY2021–FY2025 + LTM | 2026-09-06 (sync) | Medium (duplicate) |
| `Nu Holdings Ltd NYSE NU Financials Income Statement.xls` · **Income Statement** (1 of 1, 94×7) | Standalone dup | FY2021–FY2025 + LTM | 2026-09-06 (sync) | Medium (duplicate) |
| `Nu Holdings Ltd NYSE NU Financials Cash Flow.xls` · **Cash Flow** (1 of 1, 72×7) | Standalone dup | FY2021–FY2025 + LTM | 2026-09-06 (sync) | High (duplicate) |
| `Nu Holdings Ltd NYSE NU Financials Ratios.xls` · **Ratios** (1 of 1, 149×7) | Standalone dup | FY2021–FY2025 + LTM | 2026-09-06 (sync) | Medium (duplicate) |
| `Nu Holdings Ltd NYSE NU Financials Key Stats.xls` · **Key Stats** (1 of 1, 80×9) | Standalone dup | to 2026 | 2026-09-06 (sync) | Medium (duplicate) |
| `Nu Holdings Ltd NYSE NU Financials Capital Structure Summary.xls` · **Capital Structure Summary** (1 of 1, 60×7) | Standalone dup | FY2021–FY2025 | 2026-09-06 (sync) | High (duplicate) |
| `Nu Holdings Ltd NYSE NU Financials Capital Structure Details.xls` · **Capital Structure Details** (1 of 1, 29×10) | Standalone dup | to 2026 | 2026-09-06 (sync) | High (duplicate) |
| `Nu Holdings Ltd NYSE NU Financials Historical Capitalization.xls` · **Historical Capitalization** (1 of 1, 38×7) | Standalone dup | FY2021–FY2025 | 2026-09-06 (sync) | High (duplicate) |
| `Nu Holdings Ltd NYSE NU Financials Industry Specific.xls` · **Industry Specific** (1 of 1, 68×7) | Standalone dup | FY2021–FY2025 | 2026-09-06 (sync) | Medium (duplicate) |
| `Nu Holdings Ltd NYSE NU Financials Supplemental.xls` · **Supplemental** (1 of 1, 50×7) | Standalone dup | FY2021–FY2025 | 2026-09-06 (sync) | Low (duplicate) |
| `Nu Holdings Ltd NYSE NU Financials Multiples.xls` · **Multiples** (1 of 1, 60×9) | Standalone dup | to 2026 | 2026-09-06 (sync) | Low (duplicate) |
| `Nu Holdings Ltd NYSE NU Financials Multiples (1).xls` · **Multiples** (1 of 1, 61×9) | Standalone dup (2nd export) | to 2026 | 2026-09-06 (sync) | Low (duplicate) |
| `Nu Holdings Ltd NYSE NU Financials Segments.xls` · **Segments** (1 of 1, 77×7) | Standalone dup | FY2021–FY2025 | 2026-09-06 (sync) | Low (duplicate) |
| `Nu Holdings Ltd NYSE NU Financials Segments (1).xls` · **Segments** (1 of 1, 77×7) | Standalone dup (2nd export) | FY2021–FY2025 | 2026-09-06 (sync) | Low (duplicate) |
| `NuHoldingsLtdNYSENUEstimatesReport.xls` · **Consensus** (1 of 6, 397×30) | Consensus estimates | forward from 2026 | 2026-09-06 (sync) | Medium — 06 guidance hygiene |
| `NuHoldingsLtdNYSENUEstimatesReport.xls` · **Recent Changes** (2 of 6, 265×10) | Estimate changes | to Aug-2026 | 2026-09-06 (sync) | Medium |
| `NuHoldingsLtdNYSENUEstimatesReport.xls` · **Multiples** (3 of 6, 26×5) | Forward multiples | to Aug-2026 | 2026-09-06 (sync) | Low |
| `NuHoldingsLtdNYSENUEstimatesReport.xls` · **Surprise** (4 of 6, 200×20) | Beat/miss history | FY2021–2026 | 2026-09-06 (sync) | **High** — 01/06 promise-vs-delivery |
| `NuHoldingsLtdNYSENUEstimatesReport.xls` · **Trends** (5 of 6, 238×21) | Estimate trends | to Aug-2026 | 2026-09-06 (sync) | Medium |
| `NuHoldingsLtdNYSENUEstimatesReport.xls` · **Revisions** (6 of 6, 357×17) | Estimate revisions | to Aug-2026 | 2026-09-06 (sync) | Medium |
| `Company Comparable Analysis Nu Holdings Ltd .xls` · **Financial Data** (1 of 6, 50×17) | Peer comps | as of 2026-08-29 | 2026-09-06 (sync) | Low |
| `Company Comparable Analysis Nu Holdings Ltd .xls` · **Trading Multiples** (2 of 6, 50×9) | Peer comps | as of 2026-08-29 | 2026-09-06 (sync) | Low |
| `Company Comparable Analysis Nu Holdings Ltd .xls` · **Operating Statistics** (3 of 6, 50×13) | Peer comps | as of 2026-08-29 | 2026-09-06 (sync) | Low |
| `Company Comparable Analysis Nu Holdings Ltd .xls` · **Business Description** (4 of 6, 44×3) | Peer descriptions | as of 2026-08-29 | 2026-09-06 (sync) | Low |
| `Company Comparable Analysis Nu Holdings Ltd .xls` · **Implied Valuation** (5 of 6, 69×9) | Peer valuation | as of 2026-08-29 | 2026-09-06 (sync) | Low (valuation module) |
| `Company Comparable Analysis Nu Holdings Ltd .xls` · **Valuation Chart** (6 of 6, 32×2) | Chart data | as of 2026-08-29 | 2026-09-06 (sync) | Low |
| `Charting Excel Export Aug-29-2026 2_02 PM.xls` · **Chart 1 with Data** (1 of 2, 284×2) | Price/metric series | to 2026-08-29 | 2026-09-06 (sync) | Low — A15 price conduct |
| `Charting Excel Export Aug-29-2026 2_02 PM.xls` · **Attributions** (2 of 2, 45×1) | Chart source notes | 2026-08-29 | 2026-09-06 (sync) | Low |

### 1.5 User-supplied notes and the user's own brokerage records (not company governance sources)

| Filename · Tab | Type | Period / As-of | Last Modified | Governance Relevance |
|---|---|---|---|---|
| `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` | **User note** (own prior memo, §4 tier 9) | dated 2026-08-30; reference price $14.30 (28 Aug close) | 2026-09-06 (sync) | Medium — prior view, not evidence |
| `Interactive_Brokers_FY2025-26_CA_Audit_Note.txt` | User note (own tax/audit note) | FY2025-26 | 2026-09-06 (sync) | **None** — user's portfolio, not NU governance |
| `U21257060_20260331_20260331.pdf` | User's IBKR account statement | as of 2026-03-31 | 2026-09-06 (sync) | **None** |
| `99The_Expectant_Father__th_Edition_.torrent` | Unrelated file (torrent, `in-place`) | n/a | 2026-09-06 (sync) | **None** — not a research source |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` · 25 tabs: **IBKR - Tax Summary** (1, 24×8), **IBKR - Consolidated Events** (2, 37×17), **IBKR - Capital Gains Detail** (3, 6×25), **IBKR - Income and Taxes** (4, 35×15), **IBKR - Closing Holdings** (5, 4×17), **IBKR - Performance Summary** (6, 4×15), **IBKR - Cash Report** (7, 4×5), **IBKR - SBI FX Rates** (8, 5×10), **Audit & Reconciliation** (9, 24×8), **Source Statement Tables** (10, 1037×27), **IBKR - Unmapped Numeric Rows** (11, 1136×8), **IBKR - Source Totals** (12, 60×7), **Source Statement Text** (13, 2122×4), **README - IBKR Report** (14, 12×2), **LTCG** (15, 146×18), **STCG** (16, 163×20), **F&O** (17, 51×10), **Intraday** (18, 46×12), **Dividend** (19, 68×10), **Interest** (20, 19×5), **Bonds & SGB** (21, 25×12), **Schedule FA** (22, 41×13), **Schedule FSI** (23, 33×10), **Form 67** (24, 27×13), **Schedule TR** (25, 28×8) | User's own tax workbook | FY2025-26 (to 2026-03-31) | 2026-09-06 (sync) | **None** — user's portfolio, not NU governance |
| `consolidated_tax_report_2025-26.xlsx` · 11 tabs: **LTCG** (1, 146×18), **STCG** (2, 163×20), **F&O** (3, 51×10), **Intraday** (4, 46×12), **Dividend** (5, 68×10), **Interest** (6, 19×5), **Bonds & SGB** (7, 25×12), **Schedule FA** (8, 41×13), **Schedule FSI** (9, 33×10), **Form 67** (10, 27×13), **Schedule TR** (11, 28×8) | User's own tax workbook (subset dup) | FY2025-26 | 2026-09-06 (sync) | **None** |

### 1.6 Deterministic sidecars in the frozen generation

| File | Type | As-of | Governance Relevance |
|---|---|---|---|
| `ciq_facts.json` | Source-bound CIQ facts sidecar | prices/shares as of 2026-08-29; insider data to 2026-08-26 | **High** — pins insider and institutional-ownership reads for `04` |
| `relationships.json` | Supply-chain graph parsed from CIQ Suppliers/Customers | recent disclosures only (honour `scope_notes`) | Medium — counterparty cross-check for `09` |

**No `external/` subfolder exists in this pool.** No document carries `external: true` or a `provenance` sidecar. Section 1A is therefore not applicable, and no external document moved the sufficiency verdict (it could not have).

---

## 2. Most Recent Sources

Ages are measured from 2026-09-06 to the period or as-of date parsed from inside the document.

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Proxy / DEF 14A | **Not applicable — foreign private issuer.** The local equivalent is `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf`, Items 6 (directors, senior management, compensation), 7 (major shareholders, related-party), 16A–16K (audit committee, code of ethics, accountant fees, corporate governance), plus the AGM notice/agenda captured in `Nu Holdings Ltd NYSE NU Key Developments.rtf` | FY2025 filing 2026-04-08; AGM held 2026-08-06 | 5.0 (filing) / 1.0 (AGM) |
| Annual filing | `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` | FY2025 (ended 2025-12-31) | 8.2 (period) / 5.0 (filing) |
| Compensation disclosure | `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf`, Item 6.B "Compensation" + "Executive Compensation" + Note 28(b); `Nu Holdings Ltd NYSE NU Public Ownership Insider Trading.xls` (RSU grant events) | FY2025; grants to 2026-08-07 | 8.2 / 1.0 |
| Ownership / insider-transaction data | `Nu Holdings Ltd NYSE NU Public Ownership Insider Trading.xls` (latest event 2026-08-24, filed 2026-08-26); beneficial-ownership table in 20-F Item 7.A as of 2025-12-31 (percentages on the 2026-03-01 share count) | 2026-08-26 / 2025-12-31 | 0.4 / 8.2 |
| Shareholder letter | **None in the pool.** The nearest equivalents are the quarterly earnings releases (`Form_Preliminary_Interim_Report`, latest 2026-08-13) and the CEO's prepared remarks in each transcript | 2026-08-13 | 0.8 |
| Transcript | `Nu Holdings Ltd., Q2 2026 Earnings Call, Aug 13, 2026.pdf` | Q2 2026 call, 2026-08-13 | 0.8 |
| 8-K (management changes) | **Not applicable — FPI files 6-K, not 8-K.** The pool's substitute is `Nu Holdings Ltd NYSE NU Key Developments.rtf`, which carries the CFO succession (Livingston succeeds Lago, effective 2026-07-13), the 2026-06-04 buyback authorisation, and the 2026-08-06 AGM agenda | through Aug-2026 | ~0.5 |

---

## 3. Governance Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Proxy / DEF 14A | **Y (jurisdictional equivalent)** | FPI exemption from SEC proxy rules applies; governance disclosure lives in `FY25 Form 20-F, Items 6, 7, 16A–16K` + AGM agenda in the CIQ Key Developments export | Comp, ownership, board, related-party |
| Compensation disclosure (metrics/weights) | **N** | `FY25 Form 20-F, Item 6.B` states only that pay is "fixed and variable", that variable pay is "primarily … RSU long-term incentive program", and that compensation is "set on market terms and reviewed annually". **No metrics and no weights are disclosed, and Cayman law does not require per-individual disclosure** — only the aggregate US$91.3m for FY2025 (`Note 28(b)`) | Incentive alignment |
| Beneficial ownership table | **Y** | `FY25 Form 20-F, Item 7.A` — every director and officer individually, plus 5% holders (Rua California Ltd. 88.2% of Class B / 74.3% of votes; BlackRock 6.9% of Class A; Baillie Gifford 6.9% of Class A) | Skin in the game, control |
| Insider-transaction data (buys/sells) | **Y** | `CIQ Public Ownership→Insider Trading export (NU), all history to 2026-08-26 — vendor export` (Form 4-sourced, 46 rows); pinned by `ciq_facts.json` `insider_open_market` = net −592,707 (0 buys / 4 sells, TTM to 2026-08-18) and `insider_net_activity` = net +4,015,012 (all types) | Conviction signal |
| Board composition / independence | **Y** | `FY25 Form 20-F, Item 6.A` (9 directors, 8 marked independent, ages, committee membership) + `CIQ Board Members export` (10 rows, incl. an executive vice-chairman) + `CIQ Committees export` | Board quality, entrenchment |
| Related-party disclosure | **Y (partly unnamed)** | `FY25 Form 20-F, Item 7.B` (RPT policy updated March 2024; indemnification agreements) + `FY25 Consolidated Financial Statements, Note 28` — credit cards/loans to directors, board members, key employees and close family on third-party terms; "Other liabilities (i)" (926) in 2025 vs (1,795) in 2024 arising from a commercial relationship with **a company where one of NU's directors serves as CEO — the counterparty is not named** | Value leakage |
| Control structure (dual-class / blocs) | **Y** | `FY25 Form 20-F, Item 7.A` and `Item 10.B` — Class B carries **20 votes per share**; David Vélez Osorno holds 74.4% of total voting power; Shareholder's Agreement gives the founding shareholder consent rights over dividends, M&A, share issuance, indebtedness above net equity, and officer/director compensation. `CIQ Takeover Defenses→Corporate Governance` adds the charter mechanics (66.67% to amend; special meetings only requisitionable while the founder holds a voting majority) | Minority-shareholder rights |
| Prior shareholder letters / guidance | **Y (transcripts and releases, no letter)** | 20 transcripts spanning Q4 2021 → Q2 2026; 5 consecutive 20-Fs FY2021–FY2025; `CIQ Estimates→Surprise` tab (200×20) for realised beat/miss | Promise-vs-delivery |
| M&A / buyback / dividend history | **Y** | `Transaction Summary M A Private Placements` (25×14), `Transaction Summary Public Offerings` (15×8), `CIQ Direct Investments` (55×21), `CIQ Financials→Cash Flow` and `Historical Capitalization` FY2021–FY2025, plus the 2026-06-04 buyback authorisation in Key Developments. `Item 16E` of the FY25 20-F reports "None" for issuer purchases in FY2025 | Capital-allocation scorecard |
| Management tenure / turnover | **Y** | `FY25 Form 20-F, Item 6.A` bios; `CIQ Professionals export` (12 named officers); Key Developments records the CFO succession effective 2026-07-13 and the marketing-director hire | Stability and competence |
| Transcripts | **Y** | 20 files, Q4 2021 → Q2 2026, unbroken quarterly coverage | Candor and tone |
| Auditor's report + annexures (CARO / KAMs / IFC) | **Y (US/PCAOB form)** | `FY25 Form 20-F` — Report of Independent Registered Public Accounting Firm, **KPMG Auditores Independentes Ltda., PCAOB ID 1124, auditor since 2018**, with Critical Audit Matters. CARO and IFC are India-specific annexures and do not apply; the PCAOB-form equivalents (CAMs, ICFR/management report under Item 15) are present. `CIQ Auditors export` shows **unqualified opinions FY2020–FY2025** | Audit quality (08) |
| Auditor-fee disclosure (audit vs non-audit) | **Y** | `FY25 Form 20-F, Item 16C` — FY2025: audit US$2,923.2k, audit-related US$118.4k, tax US$9.1k, all-other US$99.3k, total US$3,150.0k; FY2024 comparatives given. Pre-approval policy described | Auditor independence (08) |
| Secretarial audit report (India: MR-3) | **N/A** | India-only requirement; NU is a Cayman-incorporated NYSE foreign private issuer. Genuinely not applicable — not a gap | Compliance assurance (08) |
| Related-party NOTE with counterparties + amounts | **Y (amounts) / partial (counterparties)** | `FY25 Consolidated Financial Statements, Note 28` gives amounts (926 / 1,795) and aggregate management compensation (91,269 / 96,007 / 60,117 for 2025/2024/2023) but **names no counterparty** | RPT quantification (09) |
| Contingent-liabilities & commitments note | **Y** | `FY25 Consolidated Financial Statements, Note 25 — Provisions and contingent liabilities` (balances 30,920 / 22,551 in the statement of financial position; movement detail 29,238 / 18,406 / 17,098), plus the accounting policies at notes 2(r)/2(s) | Off-P&L exposure (10) |
| ≥2 consecutive annual financials | **Y** | Five consecutive 20-Fs, FY2021 through FY2025, each with full audited consolidated statements | Beneish/Dechow forensic battery (11) |
| Shareholding-pattern history (quarters, pledge column) | **Y (history) / N/A (pledge)** | `CIQ Public Ownership→History` (1,499 rows, 2025-12-31 → 2026-06-30) and `→Detailed` (1,346×15). A promoter **pledge/encumbrance column is an India/SEBI-SAST disclosure and does not exist in the US regime** — genuinely N/A, not a gap | Ownership trend + pledge (04) |
| AGM/EGM voting results (scrutinizer reports) | **N** | The **agenda** for the 2026-08-06 AGM is in `CIQ Key Developments export` (reelection of nine nominees "a" to "i"; ratification of the FY2025 accounts and 20-F). **No vote tallies, no proxy-advisor recommendations, and no results filing are in the pool** | Minority dissent (05) |
| Exchange announcements history (fines, Reg 30 events) | **Y (vendor proxy, not filings)** | `CIQ Key Developments export` (29 KB) and `CIQ Corporate Timeline` (51×4). These are a **tier-5 vendor summary**, not the underlying 6-K filings, and cover events the vendor chose to record | Compliance hygiene (12) |
| Rating-agency reports / actions | **Y (actions, not full rationales)** | `CIQ Fixed Income→S P Global Ratings` (20×8) and `→Securities Summary` (2,299×24). Rating **rationale documents themselves are not in the pool** | Rating conduct (12) |

---

## 4. Cross-Module Availability

Checked against the actual filesystem at `/private/tmp/nostra-claude-workspace-TdMEG0/analyses/NU_2026-09-06/`.

| Cross-Module Output | Available? (Y/N) |
|---|---|
| `business-model/11_capital-allocation-governance.md` | **Y** |
| `business-model/01_disqualifier-scan.md` | **Y** |
| `business-model/12_red-flags-sweep.md` | **Y** |
| `business-model/02_business-identity.md` | **Y** |
| `earnings/06_earnings-quality.md` | **Y** |
| `earnings/04_guidance-consensus.md` | **Y** |

Also present and usable: the full business-model set `00`–`10`, `99_business-model-synthesis.md`, `business-model_dossier.md`; the full earnings set `00`–`08`, `99_earnings-synthesis.md`, `earnings_dossier.md`, `sensitivity_summary.json`. The `balance-sheet-survival/` and `competitive-intel/` folders exist but are empty — those modules have not run, so no input is available from them.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No proxy / compensation disclosure | **N** | 03, 99 | Not triggered. The FPI proxy-equivalent (20-F Items 6/7/16) IS present and a compensation disclosure exists. **A narrower gap is recorded instead and must be carried by `03`:** per-individual pay is not disclosed (Cayman law + FPI exemption, stated verbatim in Item 6.B) and no performance metrics or weights are disclosed. `03` answers **A6-02, A6-03, A6-05 as Not Available with that reason**, scores incentive alignment on structure only (aggregate quantum, RSU/Omnibus plan terms, Form 4 grant data), and states the reduced confidence. The full "max 50 / max 70" cap does **not** bind |
| No ownership / insider-transaction data | **N** | 04, 99 | Not triggered — beneficial-ownership table, three ownership workbooks (4,685 rows combined), and a Form 4-sourced insider file are all present and current to 2026-08-26 |
| No board disclosure | **N** | 05, 99 | Not triggered — board roster with ages and independence determinations, committee membership, charter/bylaw governance terms, and the Shareholder's Agreement consent rights are all disclosed |
| No multi-year history | **N** | 02 | Not triggered — five consecutive audited years (FY2021–FY2025) plus M&A, offering, and capitalisation histories |
| No transcripts / prior letters | **N** | 01, 06 | Not triggered — 20 transcripts across 19 consecutive quarters. **Note for `06`:** there is no shareholder letter in the pool; promise-vs-delivery must be built from prepared remarks, releases, and the `Estimates→Surprise` tab, and `06` should say so |
| No related-party note | **N** | 09, 99 | Not triggered — Note 28 exists with amounts. **Sub-gap for `09`:** the RPT counterparty (a company whose CEO is an NU director) is **not named**, so `09` quantifies the amount but records the counterparty identity as Not Available and treats the non-naming as a disclosure observation in its own right |
| No contingent-liability note | **N** | 10, 99 | Not triggered — Note 25 with balances and movement, plus policy notes 2(r)/2(s) |
| No auditor-fee / audit-detail disclosure | **N** | 08, 99 | Not triggered — Item 16C gives audit / audit-related / tax / all-other fees for FY2025 and FY2024, so A4-06 is computable and the max-65 / max-80 cap does not bind. **Sub-gap:** the KPMG **signing partner is not named** in the 20-F text, so A4-13 partner-level checks are limited to the firm |
| Under 2 years of financials | **N** | 11, 99 | Not triggered — five consecutive audited years; the full Beneish/Dechow battery is computable |
| **Web/database sweep unavailable this run** | **Y** | 07, 12, 99 | **BINDS.** This runtime's sandbox denies every network host (`deniedHosts: ["*"]`), so no corporate registry, court/tribunal record, regulator enforcement list, insolvency or disqualification register, sanctions list, trademark register, or dated adverse-media source could be reached from triage. Dossiers and the legal sweep are **coverage-limited — graded on filings alone, never presented as swept-and-clean**. **People & network integrity max 65; Legal & regulatory risk floor 40 (unknown is not safe); Confidence Score max 70.** `07` and `12` must re-test reachability from their own runtimes and report what they actually reached |
| No company website (D-1 unreachable), other discovery sources available | **Y (as observed)** | 07 | The website `https://international.nubank.com.br/about/` and the IR site `www.investidores.nu/en/` are **named in the filings** but could not be fetched from this runtime. Record D-1 unavailable on its own line with a proportionate confidence note. **This alone is not A17-01 Insufficient Data and imposes no discovery cap on its own ground** |
| **Discovery loop cannot run at all** — no company website AND registry, trademark and address sources all unreachable | **Y — conditional, `07` to confirm** | 07, 99 | From THIS runtime every discovery source is unreachable, which would make the loop unrunnable. **`07` must re-test from its own runtime before applying this.** If `07` also reaches nothing: record **A17-01 Insufficient Data naming exactly what failed**, apply **People & network integrity max 60; Confidence Score max 75**, sweep the seed roster in §5E anyway, and report the result as a statement about the filings, not about the company. If `07` CAN reach sources, this row does not bind and only the coverage-limited row above applies |
| No AGM/EGM voting results | **Y (additional, not on the standard list)** | 05, 99 | The AGM agenda is known but no vote tallies exist in the pool. `05` answers **A10-03 (institutional voting patterns) as Not Available with that reason** and must not infer support from the absence of a reported dispute |

---

## 5E. Person & Entity Register (feeds 07 — Hard Rule)

This is the SEED for `07`'s discovery loop, not the finished roster. It is what the filings and vendor exports chose to list; `07` expands from here per the Entity & Network Discovery Protocol.

### 5E.1 Person Register

| # | Name | Identifier (DIN / registry ID, if disclosed) | Role | Category | Source (filing + section) |
|---|---|---|---|---|---|
| 1 | David Vélez Osorno (age 44) | none disclosed | Founder, Chairman & CEO; controls Rua California Ltd.; 74.4% of total voting power | Director + KMP + Promoter individual | `FY25 Form 20-F, Item 6.A (Board of Directors)` and `Item 7.A (Major Shareholders), fn.2` |
| 2 | Anita Mary Sands, Ph.D. (age 49) | none disclosed | Lead Independent Director; Audit and Risk Committee | Director | `FY25 Form 20-F, Item 6.A`; `CIQ Committees export` |
| 3 | Rogério Paulo Calderón Peres (age 64) | none disclosed | Independent Director; Audit and Risk Committee; **designated audit committee financial expert** | Director | `FY25 Form 20-F, Item 6.A` and `Item 16A` |
| 4 | Thuan Quang Pham (age 58) | none disclosed | Independent Director; Audit and Risk Committee | Director | `FY25 Form 20-F, Item 6.A`; `CIQ Committees export` |
| 5 | David Alexandre Marcus (age 52) | none disclosed | Independent Director; Compensation and People Committee | Director | `FY25 Form 20-F, Item 6.A` |
| 6 | Douglas Mauro Leone (age 68) | none disclosed | Independent Director; Compensation and People Committee; Sequoia Capital (email `leone@sequoiacap.com` in the vendor export); holds 27,893,215 Class A shares | Director | `FY25 Form 20-F, Item 6.A`, `Item 7.A`; `CIQ Board Members export` |
| 7 | Diego Piacentini (age 65) | none disclosed | Independent Director | Director | `FY25 Form 20-F, Item 6.A` |
| 8 | Jacqueline Dawn Reses (age 56) | none disclosed | Independent Director; Compensation and People Committee | Director | `FY25 Form 20-F, Item 6.A` |
| 9 | Luis Alberto Moreno Mejía (age 72) | none disclosed | Independent Director; Compensation and People Committee | Director | `FY25 Form 20-F, Item 6.A` |
| 10 | Roberto de Oliveira Campos Neto | none disclosed | Executive Vice-Chairman and Global Head of Public Policy — **internal/executive director** | Director + KMP | `CIQ Board Members export ("Current Board Members", ~Aug-2026)` and `CIQ Professionals export`. **Not in the nine-member board list in the FY25 20-F (as of 2026-04-08)** — a roster conflict for `07` to resolve (A17-10) |
| 11 | Michael J. Moritz KBE | none disclosed | **Category UNRESOLVED.** Files Form 4s on the director grant pattern: 25,290 RSUs on 2026-08-07 and 1,356 Class A shares on 2026-08-24 (identical to Piacentini, Marcus and Sands on the same dates); 29,669,166 shares owned | Unresolved — director-pattern filer | `CIQ Public Ownership→Insider Trading export (NU), 2026-08-07 and 2026-08-24 events — vendor export`. **Named on neither the 20-F board list nor the CIQ Board Members export.** A17-10 aggregator-conflict material: keep in scope and resolve on the primary registry / SEC filings; do NOT drop |
| 12 | Cristina Helena Zingaretti Junqueira | none disclosed | Co-founder; Chief Growth Officer & CEO of US; 11,427,060 Class A + 119,476,200 Class B (9.9% of votes) through the Cristina Helena Zingaretti Revocable Trust, CHJZ family trust, Rubens Fernandes Pereira Revocable Trust, Vesta WY LLC, Victory Lane Ltd. and AMD WY LLC | KMP + Promoter individual | `FY25 Form 20-F, Item 7.A, fn.3`; `CIQ Professionals export` |
| 13 | Rob Livingston | none disclosed | Chief Financial Officer, effective **2026-07-13**; previously CFO North America at Visa, before that 18 years at Capital One; received 2,194,587 RSUs on 2026-07-13 | KMP | `CIQ Key Developments export (Executive Change — CFO)`; `CIQ Professionals export`; `CIQ Insider Trading export, 2026-07-13` |
| 14 | Guilherme Marques do Lago | none disclosed | **Former CFO** (five years; seven years at Nu). Stepped down 2026-07-13, supported the transition to 2026-08-31, and continues as **Special Advisor to the Management Team and to the Audit and Risk Committee**; holds 2,120,676 Class A shares | **Former** (KMP) + current advisor | `CIQ Key Developments export`; `FY25 Form 20-F, Item 7.A`; `CIQ Professionals export` |
| 15 | Henrique Camossa Saldanha Fragelli | none disclosed | Chief Risk Officer; exercised derivatives for 2,361,450 shares on 2026-04-08 and sold 221,707 shares on 2026-08-14 | KMP | `CIQ Professionals export`; `FY25 Form 20-F, Item 7.A`; `CIQ Insider Trading export` |
| 16 | Eric Christopher Young | none disclosed | Chief Technology Officer; 407,860 Class A shares | KMP | `CIQ Professionals export`; `FY25 Form 20-F, Item 7.A` |
| 17 | Livia Martines Chanes | none disclosed | Chief Executive Officer of Latin America | KMP | `CIQ Professionals export` |
| 18 | Carl Rivera | none disclosed | Chief Product Officer | KMP | `CIQ Professionals export` |
| 19 | Ethan Eismann | none disclosed | Chief Design Officer | KMP | `CIQ Professionals export` |
| 20 | Suzana Kubric | none disclosed | Chief Human Resources Officer | KMP | `CIQ Professionals export` |
| 21 | Guilherme Souto | none disclosed | Investor Relations Officer & Director of Market Intelligence | KMP | `CIQ Professionals export` |
| 22 | Kim Farrell | none disclosed | Global Marketing Director; joined from TikTok (global head of creators); reports to Cristina Junqueira | KMP (recent hire) | `CIQ Key Developments export` |
| 23 | Mariel Lorena Reyes Milk | none disclosed | Wife of David Vélez; holds 1,500,000 Class B shares of record, over which Vélez may be deemed to have voting and dispositive power | Promoter individual (family) | `FY25 Form 20-F, Item 7.A, fn.2` |
| 24 | Rubens Fernandes Pereira | none disclosed | Husband of Cristina Junqueira; together with her holds 100% of the trusts and LLCs that hold her Class A and Class B shares; both disclaim ownership of shares held by Victory Lane Ltd. | Promoter individual (family) | `FY25 Form 20-F, Item 7.A, fn.3` |
| 25 | **UNNAMED — Company Secretary / Corporate Secretary** | — | Role not named anywhere in the pool | Gap | Searched `FY25 Form 20-F` and the CIQ Professionals export; no such officer is named |
| 26 | **UNNAMED — Chief Compliance Officer** | — | Role not named anywhere in the pool | Gap | Searched `FY25 Form 20-F`; the Brazilian regulatory section describes a mandated "designated internal controls officer" (BCB Res. 260) but names no individual |
| 27 | **UNNAMED — head of internal audit / Chief Audit Executive** | — | An internal audit function is described (Audit and Risk Committee "overseeing our internal audit function"; `Note` on Audit Committee duties) but no individual is named | Gap | `FY25 Form 20-F, Item 6.A (committee duties)` |
| 28 | **UNNAMED — KPMG signing audit partner** | — | The audit report is signed `/s/ KPMG Auditores Independentes Ltda.` (PCAOB ID 1124) with no partner name in the extracted text | Gap | `FY25 Form 20-F, Report of Independent Registered Public Accounting Firm`. `08` to confirm from the audit report / PCAOB Form AP; partner-level A4-13 checks are limited to the firm until then |

### 5E.2 Entity Register

Every entity the pool names. All `filing-supplied` unless marked. The FY25 20-F states the group comprises **46 entities — Nu Holdings Ltd. and 45 subsidiaries, 18 incorporated in Brazil** (`FY25 Form 20-F, Item 4`); the CIQ tree lists 45 rows below the parent, which `07` should reconcile.

| # | Entity | Registry identifier | Relationship as disclosed | Source |
|---|---|---|---|---|
| 1 | Nu Holdings Ltd. | CIQ ID 412550767; no CIN/company number disclosed | Parent, Cayman Islands exempted company, NYSE:NU | `FY25 Form 20-F, Item 4`; `CIQ Corporate Structure Tree` |
| 2 | Rua California Ltd. | none disclosed | **Controller vehicle** — 100% owned by David Vélez Osorno; holds 698,914 Class A + 901,624,498 Class B (74.3% of votes) | `FY25 Form 20-F, Item 7.A, fn.2 and fn.4` |
| 3 | Nu Pagamentos S.A. – Instituição de Pagamento | CIQ 280438260 | Subsidiary (principal Brazilian operating entity; parent of six sub-subsidiaries) | `CIQ Corporate Structure Tree`; `FY25 Form 20-F` |
| 4 | Nu Financeira S.A. – SCFI | CIQ 592527083 | Subsidiary of Nu Pagamentos (100%) | `CIQ Corporate Structure Tree` |
| 5 | Nu Investimentos S.A. – Corretora de Titulos e Valores Mobiliarios | CIQ 35127246 | Subsidiary of Nu Pagamentos (100%) | `CIQ Corporate Structure Tree` |
| 6 | Vérios Gestão de Recursos S.A. | CIQ 608738927 | Subsidiary of Nu Investimentos (100%) — hop 2 | `CIQ Corporate Structure Tree` |
| 7 | Olivia AI, Inc. | CIQ 580286734 | Subsidiary of Nu Pagamentos (100%) — acquired business | `CIQ Corporate Structure Tree` |
| 8 | Plataformatec | CIQ 612161281 | Subsidiary of Nu Pagamentos (100%) — acquired business | `CIQ Corporate Structure Tree` |
| 9 | Spin Pay | CIQ 643463758 | Subsidiary of Nu Pagamentos (100%) — acquired business | `CIQ Corporate Structure Tree` |
| 10 | Juntos Global | CIQ 1772269848 | Subsidiary of Nu Pagamentos (100%) — acquired business | `CIQ Corporate Structure Tree` |
| 11 | Chico AI USA Inc | CIQ 1859966849 | Subsidiary of Nu Pagamentos (100%) | `CIQ Corporate Structure Tree` |
| 12 | NU BN Servicios Mexico, S.A. de C.V. | CIQ 639765874 | Subsidiary of Nu Pagamentos | `CIQ Corporate Structure Tree` |
| 13 | Cognitect, Inc. | CIQ 238678972 | Direct subsidiary (100%) — acquired business | `CIQ Corporate Structure Tree` |
| 14 | Nu BN Tecnologia, S.A. de C.V. | CIQ 1798046579 | Direct subsidiary (Mexico) | `CIQ Corporate Structure Tree` |
| 15 | Akala, S.A. De C.V. | CIQ 1798042528 | Subsidiary of Nu BN Tecnologia (100%) — hop 2 | `CIQ Corporate Structure Tree` |
| 16 | Nu BN México, S.A. de CV | CIQ 1856749950 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 17 | Nu México Financiera S.A. | CIQ 1866091644 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 18 | Nu México Financiera S.A. de C.V. S.F.P. | CIQ 1794249364 | Direct subsidiary (Mexican SFP licence) | `CIQ Corporate Structure Tree` |
| 19 | Nu Colombia S.A. | CIQ 1684259384 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 20 | Nu Colombia Compañía de Financiamiento S.A. | CIQ 1856752211 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 21 | Nu Asset Management Ltda. | CIQ 1856750665 | Direct subsidiary — CVM-registered portfolio manager (CVM Res. 21) | `CIQ Corporate Structure Tree`; `FY25 Form 20-F, Item 4` |
| 22 | Nu Distribuidora De Titulos E Valores Mobiliarios Ltda. | CIQ 1839085312 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 23 | Nu Corretora de Seguros Ltda. | CIQ 1856751425 | Direct subsidiary (insurance broking) | `CIQ Corporate Structure Tree` |
| 24 | Nu Crypto Ltda. | CIQ 1856752088 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 25 | Nu Tecnologia S.A | CIQ 1856751673 | Direct subsidiary (100%) | `CIQ Corporate Structure Tree` |
| 26 | Nu Brasil Tecnologia Ltda. | CIQ 1856752326 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 27 | Nu Brasil Serviços Ltda. | CIQ 1856752289 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 28 | Nu Produtos Ltda. | CIQ 1856751008 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 29 | Nu Plataformas – Intermediação de Negocios e Serviços Ltda | CIQ 1856751543 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 30 | Nu Pay for Business Instituição de Pagamentos Ltda. | CIQ 1856751901 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 31 | NuCommerce Ltda. | CIQ 1866090461 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 32 | Nuplat S.A. | CIQ 1866090556 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 33 | "Nu Participações Financeiras" | CIQ 1866090643 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 34 | Nu Participações S.A. | CIQ 1866091547 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 35 | Olivia AI do Brasil Instituição de Pagamento LTDA | CIQ 1856767070 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 36 | Olivia AI do Brasil Participações Ltda | CIQ 1856767157 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 37 | Spin Pay Serviços de Pagamentos Ltda. | CIQ 1866139332 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 38 | Nu Cayman Ltd | CIQ 1866086385 | Direct subsidiary (Cayman) | `CIQ Corporate Structure Tree` |
| 39 | Nu Payments, LLC | CIQ 1866084600 | Direct subsidiary (US) | `CIQ Corporate Structure Tree` |
| 40 | Nu MX LLC | CIQ 1866086339 | Direct subsidiary | `CIQ Corporate Structure Tree` |
| 41–46 | Nu 1-A LLC (1866086099), Nu 1-B LLC (1866085893), Nu 2-A LLC (1866086183), Nu 2-B LLC (1866085958), Nu 3-A LLC (1866086250), Nu 3-B LLC (1866086036) | CIQ IDs as listed | Six direct subsidiary LLCs — securitisation/funding-vehicle naming pattern; `07`/`09` to establish purpose | `CIQ Corporate Structure Tree` |
| 47 | Cristina Helena Zingaretti Revocable Trust | none disclosed | Promoter-group vehicle (Junqueira) — holds Class A and Class B | `FY25 Form 20-F, Item 7.A, fn.3` |
| 48 | CHJZ family trust | none disclosed | Promoter-group vehicle (Junqueira) | `FY25 Form 20-F, Item 7.A, fn.3` |
| 49 | Rubens Fernandes Pereira Revocable Trust | none disclosed | Promoter-group vehicle (Junqueira/Pereira) | `FY25 Form 20-F, Item 7.A, fn.3` |
| 50 | Vesta WY LLC | none disclosed | Promoter-group vehicle (Junqueira/Pereira) | `FY25 Form 20-F, Item 7.A, fn.3` |
| 51 | AMD WY LLC | none disclosed | Promoter-group vehicle (Junqueira/Pereira) — holds Class B | `FY25 Form 20-F, Item 7.A, fn.3` |
| 52 | Victory Lane Ltd. | none disclosed | Promoter-group vehicle; **Junqueira and Pereira both disclaim ownership of the shares it holds** — an explicit disclaimer worth `07`'s attention | `FY25 Form 20-F, Item 7.A, fn.3` |
| 53 | KPMG Auditores Independentes Ltda. | PCAOB ID 1124 | Independent registered public accounting firm, auditor since 2018 | `FY25 Form 20-F, audit report and Item 16C` |
| 54 | BlackRock, Inc. | none disclosed | 5%+ holder — 266,236,594 Class A (6.9%), per Schedule 13G filed 2024-11-08 | `FY25 Form 20-F, Item 7.A, fn.5` |
| 55 | Baillie Gifford & Co | none disclosed | 5%+ holder — 265,160,474 Class A (6.9%), per Schedule 13G filed 2025-04-30 | `FY25 Form 20-F, Item 7.A, fn.6` |
| 56 | Banco Bradesco S.A. | none disclosed | Depositary and issuer of the **BDR Level I programme** on B3 (described as Sponsored in the Aug-2026 notice and Non-Sponsored in the earlier ones — a discrepancy for `07` to note) | `Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf` and the May-2026 / Nov-2025 / Aug-2025 notices, Portuguese |
| 57 | Mastercard | none disclosed | Counterparty — an agreement with incentive mechanisms produced receivables at 2024-12-31 | `FY25 Consolidated Financial Statements, note referencing note 21` |
| 58 | **UNNAMED RPT counterparty** — "a company where one of [NU's] Directors serves as CEO" | none disclosed | Entered a commercial relationship with Nu in Q2 2024; Nu received a cash incentive; other liabilities (926) at 2025 vs (1,795) at 2024 | `FY25 Consolidated Financial Statements, Note 28(a), fn.(i)`. **Highest-value single discovery target for `07`/`09`** |
| 59 | Sequoia Capital | none disclosed | Employer/affiliation of director Douglas Mauro Leone (vendor email domain) and David Vélez's employer before founding Nu | `CIQ Board Members export`; `FY25 Form 20-F, Item 6.A (Vélez bio)` |
| 60+ | Counterparties in `relationships.json` (CIQ Suppliers/Customers exports) | as recorded there | Tier-5 vendor graph; honour its `scope_notes` (recently disclosed relationships only, not the full base) and never treat a `likely_group` entity as arm's-length | `data/NU/relationships.json` |

### 5E.3 Company identity & lineage anchors (feeds 07's discovery loop)

| Anchor | Value | Source |
|---|---|---|
| Registry identifier (CIN / company number / CIK) | **Not in pool** — no Cayman company number and no SEC CIK appear in the extracted text. CIQ company ID 412550767 is a vendor identifier, not a registry one. `07` to fetch from the Cayman Registrar and SEC EDGAR | Searched `FY25 Form 20-F` cover and `Item 4`; `CIQ Corporate Structure Tree` |
| Incorporation date | **26 February 2016**, Cayman Islands, as an exempted company with limited liability, **incorporated under the name Nu Holdings Ltd.** | `FY25 Form 20-F, Item 4` ("was incorporated in the Cayman Islands on February 26, 2016") and `Item 16G` ("We were incorporated as Nu Holdings Ltd. on February 26, 2016") |
| Any founding year the company CLAIMS | **2013** — "We began our journey in 2013"; "We were founded in 2013 and began operations in Brazil in 2014, in Mexico in 2019 and in Colombia in 2020"; the CEO bio says "Before founding Nu in 2013" | `FY25 Form 20-F, Item 4` and `Item 3.D`; `Item 6.A (Vélez bio)` |
| Former names, if disclosed anywhere in the pool | **None disclosed.** Item 16G states the company was incorporated *as* Nu Holdings Ltd., i.e. it asserts no former name | `FY25 Form 20-F, Item 16G` |
| Company website URL | `https://international.nubank.com.br/about/` (corporate); `www.investidores.nu/en/` and `www.investors.nu` (investor relations / governance section) | `FY25 Form 20-F, Item 4` and `Item 16C`; `CIQ Takeover Defenses→Corporate Governance` ("Corporate Governance Website") |
| Principal brand / product names the company trades under | **Nubank**, **Nu**, **Nu Credit Card** (first product, Brazil 2014); subsidiary/product brands **NuCommerce**, **Nuplat**, **Nu Crypto**, **Nu Asset Management**, **Spin Pay**, **Olivia AI**, **Vérios**, **Akala**, **Juntos**, **Plataformatec**, **Cognitect**, **Chico AI** | `FY25 Form 20-F, Item 4`; `CIQ Products export`; `CIQ Corporate Structure Tree` |
| Registered-office address | **c/o Campbells Corporate Services Limited, Floor 4, Willow House, Cricket Square, Grand Cayman, KY1-9010, Cayman Islands**; telephone +1 345 949 2648. The same address is the stated business address for the directors. Operating head office (per the CIQ exports and the AGM notice) is **rua Capote Valente, 39, Pinheiros, São Paulo – SP, 05409-000, Brazil** | `FY25 Form 20-F, Item 4` and `Item 6.A`; `CIQ Key Developments export (AGM 2026-08-06)` |

**LEAD for `07` (recorded here, not concluded here).** The **claimed founding year (2013) predates the incorporation date of the listed entity (26 February 2016) by about three years**, and the filings disclose no predecessor by name. On its face the gap is explained by the Brazilian operating company having started in 2013 and a Cayman holding company being interposed in 2016 — but that is a hypothesis, not a finding. `07` runs the **D-2 lineage test (A17-02)** to confirm or reconcile it: identify which entity actually began in 2013 (Nu Pagamentos S.A. is the obvious candidate, CIQ 280438260), establish its own incorporation date and any former names, and check whether that lineage is disclosed anywhere in the filings. **Do not treat this as evidence that an undisclosed predecessor exists** — a truthfully-cited group history is not a finding. A second, smaller lead: the **registered office is a corporate-services provider's address (Campbells)**, which is standard for a Cayman exempted company and will produce a very large co-address cluster — `07` should expect it and must not treat that cluster as an A17-05 signal without a corroborated second link.

---

## 5A. Jurisdiction & Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | **United States** (the tradable line the module reads is the NYSE-listed Class A ordinary share) | `FY25 Form 20-F` cover; `CIQ Equity Listings export` |
| Exchange | **NYSE: NU** (Class A ordinary shares). A **second line exists**: a **BDR Level I programme on B3 (Brazil)**, depositary Banco Bradesco S.A. — a different instrument with different price, liquidity and tax; any price- or yield-bearing statement must name its line (CLAUDE.md §16) | `CIQ Equity Listings export`; `Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf` (Bradesco BDR notice) |
| Country of incorporation | **Cayman Islands** — exempted company with limited liability, incorporated 2016-02-26. Corporate law is Cayman; securities law is US federal | `FY25 Form 20-F, Item 4`, `Item 16G`; `CIQ Takeover Defenses→Corporate Governance` |
| Filing regime | **US SEC — foreign private issuer.** Files **20-F** (annual) and **6-K** (interim/material events). **Exempt from the SEC proxy rules, so there is no DEF 14A and no say-on-pay vote** — the governance disclosure is 20-F Items 6, 7 and 16A–16K plus the AGM notice. Insiders file **Form 4**; 5% holders file **Schedule 13G**. NOT SEBI-LODR: no shareholding-pattern filing, no promoter-pledge disclosure, no MR-3 secretarial audit, no CARO annexure — those items are genuinely N/A, never "missing" | `FY25 Form 20-F` cover and `Item 16G`; `CIQ Insider Trading export` (Source column = "Form 4"); `Item 7.A` fn.5/fn.6 (Schedule 13G) |
| NYSE home-country exemptions taken | **Material — record for `05`.** As an FPI, NU follows Cayman home-country practice instead of several NYSE standards: **it has no nominating/corporate-governance committee**, and **its Compensation and People Committee is not required to be composed entirely of independent directors** | `FY25 Form 20-F, Item 3.D` (risk factor) and `Item 16G` |
| Sector | **Financials — digital bank / consumer finance.** Segment disclosure is a single Banking segment: `ciq_facts.json` `segments_revenue` = "Banking 6,991 (100%)" for the 12 months to 2025-12-31. Geography: Brazil 91%, Mexico 7%, other 2% | `ciq_facts.json` (CIQ Financials→Segments); `CIQ Industry Classifications`; `FY25 Form 20-F, Item 4` |
| Sector-specific governance overlay required? | **Y — Banks / NBFCs / insurers overlay.** Later agents must use asset-quality, provision-coverage, related-party-lending, ALM and capital-adequacy lenses and **must NOT apply CFO/PAT or working-capital metrics.** Regulators to check: **BCB and CMN** (Brazil, incl. Res. 4,879 / Res. 93 internal audit and Res. 4,910 / Res. 130 five-year audit-team rotation), **CVM** (Brazilian securities), **CNBV/Banxico** (Mexico), **SFC** (Colombia), plus **SEC/NYSE and PCAOB** at the listed level. The consolidated OCF line is also affected: `01_disqualifier-scan` already documented that CIQ's bank template moves deposit inflows out of operating cash flow, so vendor OCF and filed IFRS OCF differ by construction | MODULE_RULES Sector Overlays; `FY25 Form 20-F, Item 4 (regulatory)`; `business-model/01_disqualifier-scan.md` |
| Regime & structure nuance to apply | **Recently listed** (IPO December 2021 — under 5 years of listed history), so any A-item needing 3–5 years of voting records or listed-history trend is **Not Applicable (insufficient listed history)**, never a Red and never silently Green. **Founder-controlled dual-class** is a disclosed structure judged on conduct within it, but §24 Filter 6 alignment testing still applies at full strength given the 74.4% voting block and the Shareholder's Agreement consent rights | MODULE_RULES Regime & structure nuance; `FY25 Form 20-F, Item 7.A` and `Item 6.A` |
| Document language(s) | **English** (all SEC filings, transcripts, CIQ exports) and **Portuguese** (four Bradesco BDR depositary notices, dated 2025-08-19, 2025-11-17, 2026-05-20, 2026-08-20). Every one extracted cleanly | Manifest (`failures: 0`); extracts of the four notices |

**Language is not a data gap (CLAUDE.md §27).** The four Portuguese-language BDR depositary notices are **PRESENT at the full source tier their type earns** and are read and translated by the specialists that need them. They must not be marked "missing", "not extractable in English", or "opaque", and the data-sufficiency score is not reduced for language. Figures in them are transcribed verbatim; labels are translated. The only real gap would be a document whose extraction FAILED in the manifest — and there are none.

**External data (`frameworks/EXTERNAL_DATA.md`).** This pool carries no `external/` subfolder and no `provenance` sidecar. There is therefore no external-data table, nothing to flag for freshness, and no external document influenced the sufficiency verdict. The one user-authored document, `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf`, sits in the pool root rather than under `external/`; it is a **user note (§4 tier 9)**, dated 2026-08-30, and is the engine's own prior view — it must be treated as a prior, never as evidence, and never cited to support a governance finding.

---

## 5B. Source Coverage Matrix

Confidence is 1 (barely usable) to 5 (primary, current, directly on point).

| Governance Need | Best Available Source | Period | Confidence 1–5 | Missing? | Replacement Source |
|---|---|---|---|---:|---|
| Board composition | `FY25 Form 20-F, Item 6.A` (9 directors, ages, independence, committees) | FY2025, as of 2026-04-08 | **5** | No | `CIQ Board Members` / `Committees` exports for the ~Aug-2026 position (adds Campos Neto) |
| Compensation | `FY25 Form 20-F, Item 6.B` + `Note 28(b)` (aggregate US$91.3m) + Omnibus Incentive Plan terms (Item 6.B) | FY2025 | **3** | **Partly** — no per-individual pay, no metrics, no weights (FPI/Cayman exemption, stated in the filing) | Form 4 grant events in the CIQ Insider Trading export give the RSU quantum per named person and partly substitute |
| Ownership | `FY25 Form 20-F, Item 7.A` beneficial-ownership table + `CIQ Public Ownership Detailed / History / Crossholdings` | 2025-12-31 filing; vendor to 2026-06-30 | **5** | No | — |
| Insider trades | `CIQ Public Ownership→Insider Trading` (Form 4-sourced, 46 rows), pinned by `ciq_facts.json` | all history to 2026-08-26 | **5** | No | — |
| Related-party transactions | `FY25 Consolidated Financial Statements, Note 28` + `Item 7.B` (policy) | FY2025, FY2024, FY2023 | **3** | **Partly** — amounts disclosed, counterparty not named | `relationships.json` and the CIQ Suppliers/Customers exports may help `07`/`09` identify the counterparty; a registry sweep would settle it |
| Auditor report | `FY25 Form 20-F`, Report of Independent Registered Public Accounting Firm (KPMG, PCAOB ID 1124, auditor since 2018) + `CIQ Auditors export` (unqualified FY2020–FY2025) | FY2020–FY2025 | **5** | No — except the **signing partner is unnamed** | PCAOB Form AP would name the partner; not reachable this run |
| Secretarial / compliance report | **Not applicable** — India-only instrument. The regime equivalents present are `Item 15` (controls and procedures), `Item 16B` (code of ethics), `Item 16J` (insider-trading policies), `Item 16K` (cybersecurity) | FY2025 | **4** | No (N/A) | — |
| AGM voting | `CIQ Key Developments export` — AGM date 2026-08-06 and the full agenda (nine nominees, accounts ratification) | 2026-08-06 | **1** | **YES — no vote tallies** | The company's 6-K reporting the poll results, or a proxy-advisor report; neither is in the pool and neither was reachable |
| Capital-allocation history | `CIQ Financials→Cash Flow` + `Historical Capitalization` + `Transaction Summary M A Private Placements` + `Public Offerings` + `Direct Investments` + five 20-Fs | FY2021–FY2025 + LTM Jun-2026 | **5** | No | — |
| Legal / regulatory cases | `FY25 Form 20-F` risk factors, `Note 25` provisions/contingencies, and the Brazilian regulatory sections; `CIQ Key Developments`; `CIQ S&P Global Ratings` | FY2025 / to Aug-2026 | **2** | **Partly — no independent sweep possible** | Court, tribunal, regulator-enforcement, sanctions and disqualification databases per `frameworks/GOVERNANCE_DATABASES.md`; **all unreachable from this runtime** |

---

## 5C. Data Freshness

| Source | Period | As-of Date | Age | Stale? | Impact |
|---|---|---|---|---|---|
| `FY25 Form 20-F` | FY2025 | period end 2025-12-31; filed 2026-04-08 | 8.2 months (period) / 5.0 months (filing) | **No** — this is the current annual filing and the next one is not due until ~April 2027 | Governance, comp, ownership and RPT reads are all built on it |
| Q2 2026 interim report and earnings release | Q2 2026 | 2026-08-13 / 2026-08-14 | 0.7–0.8 months | No | Latest reported financial position |
| Q2 2026 transcript | Q2 2026 call | 2026-08-13 | 0.8 months | No | Candor read is current |
| CIQ Insider Trading export | all history | latest event 2026-08-24, filed 2026-08-26 | 0.4 months | No | Insider conduct read is current |
| CIQ Public Ownership History / Detailed | quarterly series | latest period 2026-06-30 | 2.2 months | No | Ownership trend current to the last reported quarter |
| CIQ Board Members / Professionals / Committees | "Current" | export ~Aug-2026 | ~0.5 months | No | **Fresher than the 20-F** — it captures Campos Neto and the CFO change that the April 20-F could not |
| CIQ Key Developments | event history | through Aug-2026 | ~0.5 months | No | Carries the CFO succession, the buyback authorisation, and the AGM |
| Beneficial-ownership table (20-F Item 7.A) | as of 2025-12-31, percentages on the 2026-03-01 share count | 2025-12-31 | 8.2 months | **Partly** — eight months of insider activity have occurred since, including a Vélez disposal of 45,690 shares on 2026-07-23 and 45,690 on 2026-04-23 | `04` must roll the table forward using the Form 4 file rather than quoting the December stakes as current |
| CIQ Auditors export | FY2020–FY2025 | FY2025 | 8.2 months | No | Six years of unqualified opinions; FY2026 opinion not yet due |
| CIQ Comps / Charting exports | price and share data | as of 2026-08-29 | 0.3 months | No | Only relevant to `04`'s A15 market-characteristics items |
| `NU_Holdings_Deep_Dive_15_Page_Memo` (user note) | own prior view | 2026-08-30 | 0.2 months | No | Prior, not evidence — must not support a governance finding |
| IBKR tax report / account statement (user's own) | FY2025-26 | to 2026-03-31 | 5.2 months | n/a | No governance relevance whatever |

**Source manifest CSV export: pending.** The tables above are the manifest of record for this run. `analyses/NU_2026-09-06/management-governance/source_manifest.csv` was NOT written, because this agent is restricted to the single output path.

---

## 6. Sufficiency Verdict

- **Verdict:** **Sufficient**
- **Reason:** The foreign-private-issuer proxy-equivalent (FY25 Form 20-F Items 6, 7 and 16A–16K), a current beneficial-ownership table with Form 4 insider transactions to 2026-08-26, board composition with committee membership and a quantified related-party note, and five consecutive audited years plus M&A, offering and capitalisation histories are all present with zero extraction failures — so all twelve specialists have primary material to work from.
- **Specialists that can run:** all twelve — management track record (01), capital allocation (02), incentives (03), ownership (04), board and shareholder rights (05), candor (06), people dossiers (07 — filings-graded and coverage-limited), audit quality (08), RPT and group forensics (09), contingent liabilities (10), accounting forensics (11), regulatory/legal (12 — coverage-limited).
- **Hard disqualifier already flagged by `business-model/01_disqualifier-scan`?** **N.** All eight hard tests cleared; "No disqualifier triggered" and no verdict lock applied. Two items were explicitly routed to THIS module and must be picked up rather than re-adjudicated: (a) the **CFO succession effective 2026-07-13** — pre-announced, outgoing CFO retained as advisor to the audit and risk committee, no restatement, no auditor change, no qualified opinion; (b) **open-market insider selling** — `ciq_facts.json` net −592,707 shares (0 buys / 4 sells) TTM to 2026-08-18 against all-types net +4,015,012. Neither is a disqualifier; both are this module's to read.
- **Active caps (these bind even though the verdict is Sufficient — the synthesis must apply them):**
  - **Web / legal-database sweep did not run.** Every network host is denied in this runtime (`deniedHosts: ["*"]`), so no registry, court, regulator, insolvency, disqualification, sanctions, trademark or dated-adverse-media source was reachable. `07` and `12` are **coverage-limited: graded on filings alone and never presented as swept-and-clean**. **People & network integrity max 65; Legal & regulatory risk floor 40; Confidence Score max 70.**
  - **Discovery loop may be unrunnable (conditional on `07`'s own reachability test).** D-1 (company website) is unreachable from here, as are D-2 through D-5. If `07` also reaches nothing, it records **A17-01 Insufficient Data naming exactly what failed** and applies **People & network integrity max 60; Confidence Score max 75**, sweeping the §5E seed roster anyway and reporting the result as a statement about the filings, not about the company. If `07` CAN reach sources, this cap does not bind.
  - **Individual compensation and pay metrics not disclosed.** `03` answers **A6-02, A6-03 and A6-05 as Not Available**, giving the reason (Cayman law does not require individual disclosure; FPI exemption), and scores incentive alignment on structure alone with stated reduced confidence. The blanket "no compensation disclosure" cap does not bind, because a disclosure exists.
  - **No AGM vote tallies.** `05` answers **A10-03 Not Available** and must not read the absence of a reported dispute as support.
  - **RPT counterparty unnamed.** `09` quantifies the amount from Note 28 and records the counterparty as Not Available; the non-naming is itself a disclosure observation for `09` and `06`.
  - **Recently listed (IPO Dec-2021).** Every checklist item needing 3–5 years of listed history is **Not Applicable (insufficient listed history)** — never a Red, never a silent Green.
- **Critical missing items:** none that block a specialist. The four real gaps, in order of what they cost: (1) reachable legal, regulatory and registry databases; (2) AGM voting results; (3) per-individual compensation with metrics and weights; (4) the name of the related-party counterparty in Note 28(a)(i).
- **Single highest-value missing document:** **the 6-K reporting the results of the 2026-08-06 AGM** — the poll tallies on the reelection of all nine directors and on the ratification of the FY2025 accounts. In a company where one person controls 74.4% of the votes, how the *public* shareholders voted is the only direct measure of minority sentiment available, and it is the single input that would turn A10-03 from Not Available into a real answer.
