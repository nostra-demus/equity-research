# Valuation Data Triage — NU

**Evidence binding.** Frozen-evidence quartet complete and verified: `NOSTRA_FROZEN_EVIDENCE_ROOT`, `NOSTRA_FROZEN_POOL_DATA_PATH`, `NOSTRA_FROZEN_POOL_OUT_DIR`, `NOSTRA_FROZEN_POOL_GENERATION` all present and mutually consistent. `GENERATION_ROOT` = `<NOSTRA_FROZEN_POOL_OUT_DIR>/.extract-generations/f9081efa6e33b60af52e2eeb6b01c69e96872dbe70c60d9111ef0a504509f2be`. All manifest, corpus, CIQ-facts, relationships and per-tab extract reads resolved inside that exact generation. The extractor was NOT re-run and live `data/NU/` was NOT read; `data/NU/` below is a citation label only.

**Manifest totals (verbatim).** 115 sources · 48 workbooks · 109 tabs · 174 extracts written · **0 failures**. Status counts: `ok` 113, `in-place` 2. No source carries `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer`. There is therefore **no extraction-failure gap to charge against sufficiency (fix F03)**.

**External data.** No `external/` subfolder exists in the pool and no manifest row carries `external: true`. Section 1A-External is therefore omitted as empty, and no external document influenced the verdict.

## 1. File Inventory

Every source is listed, and **every workbook tab is its own row** (parent file → tab name, rows×cols), reconciled against `GENERATION_ROOT/manifest.json`. No workbook appears as a single opaque row. **176 inventory rows** (67 non-workbook sources + 109 tabs).

Period Covered is parsed from INSIDE each document (period-end / "as of" / fiscal-year lines). Filesystem mtime is deliberately NOT used as a date — for this Drive-synced pool every file carries the same sync timestamp (2026-09-07 15:24), which would make an old re-synced export read as current (fix F23). The fourth column therefore reports the manifest extraction status instead.

| Filename (→ tab) | Type | Period Covered (from inside the document) | Last Modified → Extraction Status (F23: sync mtime not used) | Valuation Relevance |
|---|---|---|---|---|
| 99The_Expectant_Father__th_Edition_.torrent | Other (unrelated non-financial file) | n/a — unrelated non-financial file | in-place | Low |
| Charting Excel Export Aug-29-2026 2_02 PM.xls → tab: Chart 1 with Data (284×2) | Other (unlabeled daily series to 2026-08-28) | Daily series to 2026-08-28; exported Aug-29-2026 | ok (tab extracted) | Low |
| Charting Excel Export Aug-29-2026 2_02 PM.xls → tab: Attributions (45×1) | Other (unlabeled daily series to 2026-08-28) | Daily series to 2026-08-28; exported Aug-29-2026 | ok (tab extracted) | Low |
| Company Comparable Analysis Nu Holdings Ltd .xls → tab: Financial Data (50×17) | Peer / comps export + current-price source | Comps as-of 2026-08-29 (LTM Jun-30-2026 / NTM) | ok (tab extracted) | High |
| Company Comparable Analysis Nu Holdings Ltd .xls → tab: Trading Multiples (50×9) | Peer / comps export | Comps as-of 2026-08-29 (LTM Jun-30-2026 / NTM) | ok (tab extracted) | High |
| Company Comparable Analysis Nu Holdings Ltd .xls → tab: Operating Statistics (50×13) | Peer / comps export | Comps as-of 2026-08-29 (LTM Jun-30-2026 / NTM) | ok (tab extracted) | Medium |
| Company Comparable Analysis Nu Holdings Ltd .xls → tab: Business Description (44×3) | Peer / comps export | Comps as-of 2026-08-29 (LTM Jun-30-2026 / NTM) | ok (tab extracted) | Low |
| Company Comparable Analysis Nu Holdings Ltd .xls → tab: Implied Valuation (69×9) | Peer / comps export | Comps as-of 2026-08-29 (LTM Jun-30-2026 / NTM) | ok (tab extracted) | High |
| Company Comparable Analysis Nu Holdings Ltd .xls → tab: Valuation Chart (32×2) | Peer / comps export | Comps as-of 2026-08-29 (LTM Jun-30-2026 / NTM) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Tax Summary (24×8) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Consolidated Events (37×17) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Capital Gains Detail (6×25) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Income and Taxes (35×15) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Closing Holdings (4×17) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Performance Summary (4×15) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Cash Report (4×5) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - SBI FX Rates (5×10) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Audit & Reconciliation (24×8) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Source Statement Tables (1037×27) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Unmapped Numeric Rows (1136×8) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Source Totals (60×7) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Source Statement Text (2122×4) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: README - IBKR Report (12×2) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: LTCG (146×18) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: STCG (163×20) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: F&O (51×10) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Intraday (46×12) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Dividend (68×10) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Interest (19×5) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Bonds & SGB (25×12) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Schedule FA (41×13) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Schedule FSI (33×10) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Form 67 (27×13) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Schedule TR (28×8) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_FY2025-26_CA_Audit_Note.txt | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | in-place | Low |
| NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf | User note (prior in-house memo) | Authored 30-Aug-2026; reference price $14.30 (28-Aug close) | ok, 24,731 chars | Medium |
| Nu Holdings Ltd NYSE NU Analyst Coverage (1).xls → tab: Analyst Coverage (41×6) | Consensus / estimate export (coverage roster) | Coverage roster as-of ~Aug-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Analyst Coverage.xls → tab: Analyst Coverage (41×6) | Consensus / estimate export (coverage roster) | Coverage roster as-of ~Aug-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Auditors.xls → tab: Auditors (18×5) | Governance data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Board Members.xls → tab: Board Members (28×25) | Governance data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Committees.xls → tab: Committees (35×2) | Governance data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Comparable M A Transactions (1).xls → tab: Comparable M A Transactions (17×9) | Peer / comps export (M&A comparables) | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Comparable M A Transactions.xls → tab: Comparable M A Transactions (17×9) | Peer / comps export (M&A comparables) | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Competitors.xls → tab: Competitors (89×8) | Peer / comps export (named competitors) | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Corporate Timeline.xls → tab: Corporate Timeline (51×4) | Company events | Company events through ~Aug-2026 | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Customers.xls → tab: Customers (16×8) | Value-chain export | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Equity Listings.rtf | Listing / tradable-line data | as-of ~Aug-2026 (CIQ export) | ok, 1,678 chars | Medium |
| Nu Holdings Ltd NYSE NU Equity Listings.xls → tab: Equity Listings (25×11) | Listing / tradable-line data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Events Calendar.xls → tab: Events Calendar (27×3) | Catalyst / reporting calendar | Events incl. FQ3 2026 release Nov-12-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Financials Balance Sheet.xls → tab: Balance Sheet (89×7) | Capital-structure data (bank-template balance sheet) | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Capital Structure Details.xls → tab: Capital Structure Details (29×10) | Capital-structure data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Capital Structure Summary.xls → tab: Capital Structure Summary (60×7) | Capital-structure data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Cash Flow.xls → tab: Cash Flow (72×7) | Cash flow data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Historical Capitalization.xls → tab: Historical Capitalization (38×7) | Capital-structure data | Quarterly 2025-03-31 → 2026-06-30 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Income Statement.xls → tab: Income Statement (94×7) | Income statement | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Industry Specific.xls → tab: Industry Specific (68×7) | Bank operating metrics (industry-specific) | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Financials Key Stats.xls → tab: Key Stats (80×9) | Income statement + capital-structure summary | FY2022A–FY2025A, LTM Jun-30-2026, FY2026E–FY2028E | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Multiples (1).xls → tab: Multiples (61×9) | Multiples export (own history) | Quarterly 2025-03-31 → 2026-08-28 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Multiples.xls → tab: Multiples (60×9) | Multiples export (own history) | Quarterly 2025-03-31 → 2026-08-28 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Ratios.xls → tab: Ratios (149×7) | Capital-structure data / ratios | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Financials Segments (1).xls → tab: Segments (77×7) | Segment data | Annual FY2020–FY2025 (Dec-31-2025 latest) | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Segments.xls → tab: Segments (77×7) | Segment data | Annual FY2020–FY2025 (Dec-31-2025 latest) | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Supplemental.xls → tab: Supplemental (50×7) | Supplemental financial data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Key Stats (85×9) | Income statement + capital-structure summary | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Income Statement (94×7) | Income statement | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Balance Sheet (89×7) | Capital-structure data (bank-template balance sheet) | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Cash Flow (72×7) | Cash flow data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Multiples (61×9) | Multiples export (own history) | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Historical Capitalization (38×7) | Capital-structure data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Capital Structure Summary (60×7) | Capital-structure data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Capital Structure Details (33×10) | Capital-structure data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Ratios (149×7) | Capital-structure data / ratios | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Supplemental (50×7) | Supplemental financial data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Industry Specific (68×7) | Bank operating metrics (industry-specific) | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Pension OPEB (15×6) | Other (pension/OPEB) | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Segments (77×7) | Segment data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Fixed Income S P Global Ratings.xls → tab: S P Global Ratings (20×8) | Capital-structure data (debt securities / ratings) | Debt securities / S&P ratings as-of ~Aug-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Fixed Income Securities Summary.xls → tab: Securities Summary (2299×24) | Capital-structure data (debt securities / ratings) | Debt securities / S&P ratings as-of ~Aug-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Industry Classifications.rtf | Business description | as-of ~Aug-2026 (CIQ export) | ok, 910 chars | Low |
| Nu Holdings Ltd NYSE NU Investment Analysis Co Investors.xls → tab: Co-Investors (53×3) | Investments / co-investors | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Investment Analysis Direct Investments.xls → tab: Direct Investments (55×21) | Investments / co-investors | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Key Developments.rtf | Company events | Company events through ~Aug-2026 | ok, 29,094 chars | Low |
| Nu Holdings Ltd NYSE NU Long Business Description.rtf | Business description | as-of ~Aug-2026 (CIQ export) | ok, 36,428 chars | Low |
| Nu Holdings Ltd NYSE NU Private Ownership.rtf | Ownership / share-count context | as-of ~Aug-2026 (CIQ export) | ok, 6,018 chars | Medium |
| Nu Holdings Ltd NYSE NU Products.xls → tab: Products (31×5) | Business description | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Professionals.xls → tab: Professionals (29×24) | Governance data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Public Company Profile.rtf | Business description | as-of ~Aug-2026 (CIQ export) | ok, 18,760 chars | Low |
| Nu Holdings Ltd NYSE NU Public Ownership Crossholdings.xls → tab: Crossholdings (1840×7) | Ownership / share-count context | Holdings to 2026-06-30; insider events to 2026-08-26 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Public Ownership Detailed.xls → tab: Detailed (1346×15) | Ownership / share-count context | Holdings to 2026-06-30; insider events to 2026-08-26 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Public Ownership History.xls → tab: History (1499×5) | Ownership / share-count context | Holdings to 2026-06-30; insider events to 2026-08-26 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Public Ownership Insider Trading.xls → tab: Insider Trading (46×11) | Ownership / share-count context | Holdings to 2026-06-30; insider events to 2026-08-26 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Public Ownership Summary.rtf | Ownership / share-count context | Holdings to 2026-06-30; insider events to 2026-08-26 | ok, 4,445 chars | Medium |
| Nu Holdings Ltd NYSE NU Strategic Alliances.xls → tab: Strategic Alliances (25×7) | Value-chain export | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Suppliers.xls → tab: Suppliers (25×8) | Value-chain export | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Takeover Defenses.xls → tab: Corporate Governance (48×4) | Governance data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Takeover Defenses.xls → tab: Takeover Defenses (26×4) | Governance data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Takeover Defenses.xls → tab: Compare Defenses (36×8) | Governance data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls → tab: Nu Holdings Ltd NYSENU Corpor (53×17) | Group structure (subsidiaries / minority interest) | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls → tab: Filtered Count (22×4) | Group structure (subsidiaries / minority interest) | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls → tab: Aggregates (22×4) | Group structure (subsidiaries / minority interest) | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Nu Holdings Ltd. Form 20-F filed on Apr-08-2026.pdf | Annual filing (SEC Form 20-F, IFRS) | FY2025 (ended Dec-31-2025); filed Apr-08-2026 | ok, 6,115 chars | High |
| NuHoldingsLtdNYSENUEstimatesReport.xls → tab: Consensus (397×30) | Consensus / estimate export | Consensus as-of ~2026-08-29; FY2026E–FY2033E; CFYE Dec-31-2026 | ok (tab extracted) | High |
| NuHoldingsLtdNYSENUEstimatesReport.xls → tab: Recent Changes (265×10) | Consensus / estimate export | Consensus as-of ~2026-08-29; FY2026E–FY2033E; CFYE Dec-31-2026 | ok (tab extracted) | Medium |
| NuHoldingsLtdNYSENUEstimatesReport.xls → tab: Multiples (26×5) | Multiples export (forward, consensus-based) | Consensus as-of ~2026-08-29; FY2026E–FY2033E; CFYE Dec-31-2026 | ok (tab extracted) | High |
| NuHoldingsLtdNYSENUEstimatesReport.xls → tab: Surprise (200×20) | Consensus / estimate export | Consensus as-of ~2026-08-29; FY2026E–FY2033E; CFYE Dec-31-2026 | ok (tab extracted) | Medium |
| NuHoldingsLtdNYSENUEstimatesReport.xls → tab: Trends (238×21) | Consensus / estimate export | Consensus as-of ~2026-08-29; FY2026E–FY2033E; CFYE Dec-31-2026 | ok (tab extracted) | High |
| NuHoldingsLtdNYSENUEstimatesReport.xls → tab: Revisions (357×17) | Consensus / estimate export | Consensus as-of ~2026-08-29; FY2026E–FY2033E; CFYE Dec-31-2026 | ok (tab extracted) | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).doc | Annual filing (SEC Form 20-F, IFRS) | FY2025 (ended Dec-31-2025); filed Apr-08-2026 | ok, 1,573,413 chars | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf | Annual filing (SEC Form 20-F, IFRS) | FY2025 (ended Dec-31-2025); filed Apr-08-2026 | ok, 1,671,934 chars | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).doc | Annual filing (SEC Form 20-F, IFRS) | FY2024 (ended Dec-31-2024); filed Apr-16-2025 | ok, 1,790,450 chars | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).pdf | Annual filing (SEC Form 20-F, IFRS) | FY2024 (ended Dec-31-2024); filed Apr-16-2025 | ok, 2,378,433 chars | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-19-2024).pdf | Annual filing (SEC Form 20-F, IFRS) | FY2023 (ended Dec-31-2023); filed Apr-19-2024 | ok, 2,312,327 chars | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-20-2023).pdf | Annual filing (SEC Form 20-F, IFRS) | FY2022 (ended Dec-31-2022); filed Apr-20-2023 | ok, 2,168,186 chars | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-21-2022).pdf | Annual filing (SEC Form 20-F, IFRS) | FY2021 (ended Dec-31-2021); filed Apr-21-2022 | ok, 3,354,372 chars | High |
| Transaction Summary M A Private Placements.xls → tab: M A Private Placements (25×14) | Capital-markets transaction history | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Transaction Summary Public Offerings.xls → tab: Public Offerings (15×8) | Capital-markets transaction history | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| U21257060_20260331_20260331.pdf | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok, 77,975 chars | Low |
| consolidated_tax_report_2025-26.xlsx → tab: LTCG (146×18) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: STCG (163×20) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: F&O (51×10) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Intraday (46×12) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Dividend (68×10) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Interest (19×5) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Bonds & SGB (25×12) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Schedule FA (41×13) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Schedule FSI (33×10) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Form 67 (27×13) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Schedule TR (28×8) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Nu_Holdings_Ltd_-_(Aug-13-2026).pdf | Quarterly filing (earnings release) | Q2 2026 earnings release (Jun-30-2026); Aug-13-2026 | ok, 108,767 chars | High |
| Nu_Holdings_Ltd_-_(Aug-19-2025).pdf | Other (BDR depositary notice, Portuguese) | BDR notice re Q2 2025; dated 19-ago-2025 | ok, 360 chars | Low |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf | Annual filing (SEC Form 20-F, IFRS) | FY2025 (ended Dec-31-2025); filed Apr-08-2026 | ok, 1,671,934 chars | High |
| Nu_Holdings_Ltd_-_Form_Annual_Report(Feb-26-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 371,517 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 297,047 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 341 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(May-14-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 274,519 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(May-15-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 274,519 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(May-20-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 342 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(Nov-17-2025).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 340 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 108,767 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Feb-25-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 117,921 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(May-14-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 33,504 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Nov-13-2025).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 126,011 chars | Low |
| Nu_Holdings_Ltd_-_(Aug-13-2026).pdf | Quarterly filing (earnings release) | Q2 2026 earnings release (Jun-30-2026); Aug-13-2026 | ok, 108,767 chars | High |
| Nu_Holdings_Ltd_-_(Aug-19-2025).pdf | Other (BDR depositary notice, Portuguese) | BDR notice re Q2 2025; dated 19-ago-2025 | ok, 360 chars | Low |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf | Annual filing (SEC Form 20-F, IFRS) | FY2025 (ended Dec-31-2025); filed Apr-08-2026 | ok, 1,671,934 chars | High |
| Nu_Holdings_Ltd_-_Form_Annual_Report(Feb-26-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 371,517 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 297,047 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 341 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(May-14-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 274,519 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(May-15-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 274,519 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(May-20-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 342 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(Nov-17-2025).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 340 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 108,767 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Feb-25-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 117,921 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(May-14-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 33,504 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Nov-13-2025).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 126,011 chars | Low |
| Nu Holdings Ltd. - ShareholderAnalyst Call.pdf | Transcript | undated shareholder/analyst call | ok, 11,239 chars | Medium |
| Nu Holdings Ltd., Q1 2022 Earnings Call, May 16, 2022.pdf | Transcript | Q1 2022 call, May 16, 2022 | ok, 87,978 chars | Medium |
| Nu Holdings Ltd., Q1 2023 Earnings Call, May 15, 2023.pdf | Transcript | Q1 2023 call, May 15, 2023 | ok, 92,253 chars | Medium |
| Nu Holdings Ltd., Q1 2024 Earnings Call, May 14, 2024.pdf | Transcript | Q1 2024 call, May 14, 2024 | ok, 88,138 chars | Medium |
| Nu Holdings Ltd., Q1 2025 Earnings Call, May 13, 2025.pdf | Transcript | Q1 2025 call, May 13, 2025 | ok, 62,884 chars | Medium |
| Nu Holdings Ltd., Q1 2026 Earnings Call, May 14, 2026.pdf | Transcript | Q1 2026 call, May 14, 2026 | ok, 67,336 chars | Medium |
| Nu Holdings Ltd., Q2 2022 Earnings Call, Aug 15, 2022.pdf | Transcript | Q2 2022 call, Aug 15, 2022 | ok, 90,039 chars | Medium |
| Nu Holdings Ltd., Q2 2023 Earnings Call, Aug 15, 2023.pdf | Transcript | Q2 2023 call, Aug 15, 2023 | ok, 88,530 chars | Medium |
| Nu Holdings Ltd., Q2 2024 Earnings Call, Aug 13, 2024.pdf | Transcript | Q2 2024 call, Aug 13, 2024 | ok, 71,851 chars | Medium |
| Nu Holdings Ltd., Q2 2025 Earnings Call, Aug 14, 2025.pdf | Transcript | Q2 2025 call, Aug 14, 2025 | ok, 62,750 chars | Medium |
| Nu Holdings Ltd., Q2 2026 Earnings Call, Aug 13, 2026.pdf | Transcript | Q2 2026 call, Aug 13, 2026 | ok, 68,453 chars | Medium |
| Nu Holdings Ltd., Q3 2022 Earnings Call, Nov 14, 2022.pdf | Transcript | Q3 2022 call, Nov 14, 2022 | ok, 88,154 chars | Medium |
| Nu Holdings Ltd., Q3 2023 Earnings Call, Nov 14, 2023.pdf | Transcript | Q3 2023 call, Nov 14, 2023 | ok, 85,421 chars | Medium |
| Nu Holdings Ltd., Q3 2024 Earnings Call, Nov 13, 2024.pdf | Transcript | Q3 2024 call, Nov 13, 2024 | ok, 73,393 chars | Medium |
| Nu Holdings Ltd., Q3 2025 Earnings Call, Nov 13, 2025.pdf | Transcript | Q3 2025 call, Nov 13, 2025 | ok, 64,333 chars | Medium |
| Nu Holdings Ltd., Q4 2021 Earnings Call, Feb 22, 2022.pdf | Transcript | Q4 2021 call, Feb 22, 2022 | ok, 85,745 chars | Medium |
| Nu Holdings Ltd., Q4 2022 Earnings Call, Feb 14, 2023.pdf | Transcript | Q4 2022 call, Feb 14, 2023 | ok, 82,774 chars | Medium |
| Nu Holdings Ltd., Q4 2023 Earnings Call, Feb 22, 2024.pdf | Transcript | Q4 2023 call, Feb 22, 2024 | ok, 90,725 chars | Medium |
| Nu Holdings Ltd., Q4 2024 Earnings Call, Feb 20, 2025.pdf | Transcript | Q4 2024 call, Feb 20, 2025 | ok, 83,661 chars | Medium |
| Nu Holdings Ltd., Q4 2025 Earnings Call, Feb 25, 2026.pdf | Transcript | Q4 2025 call, Feb 25, 2026 | ok, 67,805 chars | Medium |

**Duplicate-copy note (not a gap).** The pool carries the same filings three times over (root, `Filings/`, `Filings 2/`) and several CIQ exports twice (`... (1).xls`). The manifest's `conflicts` block names seven duplicated CIQ sheets (Balance Sheet, Capital Structure Summary, Cash Flow, Income Statement, Multiples, Ratios, Segments). Duplicates do not add evidence; `01` must pick one copy per statement and say which, so the same number does not enter the module twice under two filenames.

**Non-company files in the pool.** `99The_Expectant_Father__th_Edition_.torrent`, `U21257060_20260331_20260331.pdf`, `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` (25 tabs), `consolidated_tax_report_2025-26.xlsx` (11 tabs) and `Interactive_Brokers_FY2025-26_CA_Audit_Note.txt` are the user's own personal broker and Indian income-tax records, not Nu Holdings data. They extracted cleanly but carry **no** valuation content for this issuer. In particular, **the IBKR files here are a personal tax pack, not a price screenshot** — the current price in this run comes from Capital IQ, not from IBKR.

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States — New York Stock Exchange, ticker **NU** (Class A ordinary shares). Secondary line: Brazilian BDR **BOVESPA:ROXO34**, 1 share per BDR, quoted in BRL | FY2025 20-F, cover page ("New York Stock Exchange"); FY2025 20-F, Item 4 ("listed on the New York Stock Exchange (\"NYSE\") under the symbol 'NU'"); Capital IQ Estimates export → Consensus tab, Market Summary (NYSE:NU / BOVESPA:ROXO34 (GDR), Common Shares Per ADR = 1) |
| Filing regime | **US SEC — foreign private issuer.** Annual report on Form 20-F; quarterly results furnished as earnings releases plus IAS 34 interim condensed financials. Not a 10-K/10-Q filer, so the absence of those forms is **not** a data gap (CLAUDE.md §27) | FY2025 20-F, cover page (Form 20-F, Annual Report pursuant to Section 13 or 15(d)); Q2 2026 interim, auditor's review report |
| Reporting standard | **IFRS Accounting Standards as issued by the IASB** (interim statements under IAS 34). Not US GAAP — the 20-F cover box for "International Financial Reporting Standards as issued by the IASB" is checked | FY2025 20-F, cover page and Note 2; Q2 2026 Interim Report (Aug-14-2026), KPMG review report ("in accordance with IAS 34") |
| Reporting currency (and scale) | **US dollar (USD)**, presentation currency; books and records maintained in USD. CIQ exports state USD throughout. Functional currencies of the operating subsidiaries are the Brazilian real, Mexican peso and Colombian peso — so **every fair-value read carries FX translation risk that is not visible in the USD headline** (§15/§27) | FY2025 20-F, Item 3 ("We maintain our books and records in U.S. dollars, which is the presentation currency"); FY2025 20-F, Note 2.a ("The functional currency of our Brazilian, Mexican and Colombian operating entities … is the Brazilian real, the Mexican peso and the Colombian peso") |
| Fiscal-year end | **31 December.** FY2025 = 12 months ended Dec-31-2025. Current fiscal year end Dec-31-2026 | FY2025 20-F, Item 5 ("fiscal year ended on December 31 of that calendar year"); Capital IQ Estimates export → Multiples tab ("Current Fiscal Year End: Dec-31-2026") |
| Document language(s) | **English** for all filings, transcripts, and CIQ exports. **Portuguese** for four short Banco Bradesco BDR depositary notices (Aug-19-2025, Nov-17-2025, May-20-2026, Aug-20-2026). Per CLAUDE.md §27 the Portuguese documents are **present, not missing** — they are read and translated (each says the referenced quarterly release is available at a linked address). No data-quality or sufficiency score is reduced for language | Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf ("São Paulo, 20 de agosto de 2026… Banco Bradesco S.A., na qualidade de depositário e emissor do programa de BDR Nível I Patrocinado") |

**Consequences downstream (CLAUDE.md §27, MODULE_RULES Jurisdiction-Aware Sourcing).** Cite the local-equivalent documents: the **Form 20-F** is the audited-annual tier, the **IAS 34 Interim Condensed Consolidated Financial Statements** are the interim tier, and the **earnings release / Preliminary Interim Report** is the material-event tier. Do NOT mark 10-K, 10-Q, 8-K, DEF 14A or Form 4 "missing" — this issuer does not file them.

**Tradable-line rule (CLAUDE.md §16).** All valuation output belongs to **NYSE:NU, Class A ordinary shares, quoted in USD**. The BDR line BOVESPA:ROXO34 (BRL 12.33 close, 2 estimates, mean target BRL 3.56 in USD terms per the export's own currency label — a mismatch `01` must resolve before quoting it) is a different instrument and must not carry this module's fair value. There are **two share classes**: 3,833,072,934 Class A and 1,022,600,698 Class B as of Dec-31-2025, Class B convertible 1:1 into Class A and carrying 74.3% of voting power [FY2025 20-F, Item 3.D / Item 7]. Only Class A is listed. `01` must state which count it uses for market cap (total 4,830.7m shares vs Class A 3,808.1m) — the CIQ Key Stats tab shows both, and using the Class A count alone would understate market capitalisation by roughly 21%.

## 2. Most Recent Sources

Ages are measured to the run date, 2026-09-06, from the period-end or as-of date INSIDE each document.

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` (also `.doc`, and duplicated under `Filings/` and `Filings 2/`) | FY2025, year ended Dec-31-2025; filed Apr-08-2026 | 8.2 (period end) / 5.0 (filing date) |
| Quarterly filing | `Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` — IAS 34 interim condensed consolidated financials, KPMG-reviewed | 3m and 6m ended Jun-30-2026 | 2.2 |
| Quarterly filing (earnings release) | `Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf` (= `Nu_Holdings_Ltd_-_(Aug-13-2026).pdf`) | Q2 2026 results, released Aug-13-2026 | 0.8 |
| Capital structure / balance sheet | `Nu Holdings Ltd NYSE NU Financials Balance Sheet.xls` → tab `Balance Sheet` (bank template); plus `… Capital Structure Summary`, `… Capital Structure Details`, `… Historical Capitalization`; primary source = Q2 2026 Interim Report statement of financial position | As of Jun-30-2026 (annual columns back to Dec-31-2021) | 2.2 |
| Consensus / estimate export | `NuHoldingsLtdNYSENUEstimatesReport.xls` → tabs `Consensus` (397×30), `Trends`, `Revisions`, `Recent Changes`, `Surprise` | Consensus as-of ~2026-08-29; estimates FY2026E–FY2033E; 22 target-price contributors | ~0.3 |
| Multiples export (own history) | `Nu Holdings Ltd NYSE NU Financials Multiples.xls` → tab `Multiples`; forward set in `NuHoldingsLtdNYSENUEstimatesReport.xls` → tab `Multiples` | Quarterly closes 2025-03-31 → **2026-08-28** (P/E, P/BV, P/TangBV, Mkt Cap/Revenue) | ~0.3 |
| Peer / comps export | `Company Comparable Analysis Nu Holdings Ltd .xls` → tabs `Trading Multiples`, `Implied Valuation`, `Financial Data`, `Operating Statistics` | As-Of Date 2026-08-29; 10 named peers + subject | ~0.3 |
| Current price (IBKR / Capital IQ) | `Company Comparable Analysis Nu Holdings Ltd .xls` → tab `Financial Data` ("Day Close Price Latest", subject row) — corroborated by `NuHoldingsLtdNYSENUEstimatesReport.xls` → tab `Consensus` ("Latest Price/Last Close Price 14.30/14.30") | **USD 14.30**, as-of 2026-08-29 (28-Aug-2026 close; 2026-08-29 was a Saturday) | ~0.3 (≈5–6 trading days — see the staleness note below) |
| Cash flow statement | `Nu Holdings Ltd NYSE NU Financials Cash Flow.xls` → tab `Cash Flow` (bank template); primary source = Q2 2026 Interim Report statement of cash flows | FY2021–FY2025 annual + LTM 12m ended Jun-30-2026 | 2.2 |
| Segment data | `Nu Holdings Ltd NYSE NU Financials Segments.xls` → tab `Segments` (business + geographic) | Annual FY2020–FY2025, latest column Dec-31-2025 | 8.2 |

**Price note for `01` (do not skip).** Two Capital IQ price reads exist in the same pool and they disagree: **USD 14.30** (comps `Financial Data` tab and Estimates `Consensus` tab, both explicitly as-of 2026-08-29 / 28-Aug close) and **USD 14.88** (`Financials Key Stats` tab, "Current Capitalization → Share Price", **undated in the export**). `01` must adopt the dated 14.30 as the pool-verified anchor, state the 14.88 divergence in one line, and tag the price-state. The user memo `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` independently records "$14.30 · 28 AUG CLOSE", which corroborates the date, not the level.

**Staleness.** The anchor's as-of date (28-Aug-2026 close) sits about **5–6 trading days** before the run date of 2026-09-06 — right at the ">5 trading days" line in the MODULE_RULES staleness Score-Cap. `01` must count the trading days explicitly against that threshold, document a refresh attempt, and apply the **valuation-confidence max 70** cap if the count exceeds five. This triage does not pre-apply that cap; it flags it as a live decision `01` owns.

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | **Y** | USD 14.30 as-of 2026-08-29 (28-Aug close) — `Company Comparable Analysis Nu Holdings Ltd .xls` → `Financial Data`; corroborated by Estimates → `Consensus` Market Summary. 52-week range 18.98 / 11.20 | Anchor for market cap, margin of safety, downside-to-bear. Pool-verified, so the price-relative reads unlock |
| Diluted share count | **Y** | Basic weighted-average 4,857,131 thousand and a diluted weighted-average line, Q2 2026 Interim Report, Note 9; shares outstanding 4,830.7m as-of 2026-08-29 (CIQ comps `Financial Data`); Class A / Class B split in FY2025 20-F | Market cap and per-share fair value. Note the two-class structure and the outstanding-vs-weighted-average distinction |
| Dilution data (options/RSUs/convertibles) | **Y** | Q2 2026 Interim Report, Note 9 (treasury-stock method stated explicitly) and Note 10 (SOP stock options and RSUs); FY2025 20-F, Omnibus Incentive Plan / SOP (pool capped at 5% of ordinary shares fully diluted) | Fully diluted per-share fair value and the Share Count Reconciliation Table |
| Business type track | **Y — FINANCIAL (bank)** | Capital IQ balance sheet and cash flow both use the **Bank** template; segment disclosure is a single "Banking" segment; regulated operating subsidiaries Nu Pagamentos / Nu Financeira (FY2025 20-F, Note 1) | Decides which methods are valid. **Per the Business-Type Method Map, EV-based multiples, an FCFF DCF, and the EV bridge as a value are NOT valid here** — value equity directly |
| Total debt, cash, minority/preferred | **Y** | Total debt USD 5,896.7m and cash & equivalents USD 10,455.2m (CIQ `Balance Sheet`, as-of Jun-30-2026; `ciq_facts.json` `total_debt_m` = 5,896.7, `status: present`); minority interest USD 2.05m and preferred nil (comps `Implied Valuation`); total equity USD 13,251,721 thousand (Q2 2026 Interim, statement of financial position) | EV bridge (informational only for a bank) and, more importantly, the equity and tangible-book base the valuation actually runs on |
| Income statement (LTM or FY) | **Y** | LTM 12m ended Jun-30-2026: revenue USD 8,442.1m, net income USD 3,607.1m, diluted EPS USD 0.734 (CIQ `Key Stats`); FY2025 audited in the 20-F; H1 2026 in the interim | Earnings base for P/E, residual income, and the forward metric in every scenario |
| Cash flow statement | **Y** | CIQ `Cash Flow` tab (bank template, FY2021–LTM Jun-30-2026) and the Q2 2026 Interim statement of cash flows | Present — but read with care: LTM cash from operations is **−USD 10,304.8m** (`ciq_facts.json` `ltm_ocf_m`, `status: present`) because a growing bank's loan book and deposits run through operating cash flow. This is **not** a distress signal and **not** an FCF base |
| Forward estimates (consensus) | **Y** | Estimates → `Consensus`: mean target USD 18.78 / median 19.00 (22 contributors), NTM EPS 0.97, FY2026E EPS 0.8482, FY2027E 1.11006, FY2028E 1.45953, **forward Book Value/Share FY2026E 3.15 rising through the strip**, LT growth mean 34.0%; Estimates → `Multiples`: NTM P/E 14.76×, FY2027 P/E 12.88×, FY2026 P/BV 4.54× | NTM/FY multiples, the forward metric in each scenario, and the book-value path a residual-income model needs |
| Historical multiple data | **Y (short window — flagged)** | `Financials Multiples` tab: quarterly Average/High/Low/Close for P/LTM EPS, P/NTM EPS, P/BV, P/TangBV, Mkt Cap/Revenue — but only **2025-03-31 → 2026-08-28 (six quarters)** | Own-history re-rating read. **Six quarters is not the 3–5 year band `02` normally uses** — see the Sector Cycle note below |
| Peer / comps data | **Y** | Comps `Trading Multiples`: 10 named peers (Itaú, Bradesco, Banco do Brasil, Santander Brasil, BTG Pactual, Banorte, Grupo Cibest, PagSeguro, Inter & Co, Credicorp) with LTM P/E, P/TangBV and NTM P/E; medians P/E 8.5×, P/TangBV 1.8×, NTM P/E 7.73×, vs subject 19.5× / 5.7× / 14.76×. Also `Nu Holdings Ltd NYSE NU Competitors.xls` (89 rows) and two M&A-comparables exports | Relative valuation — the primary peer method for a bank is P/E and P/tangible book, both present |
| Segment-level revenue & EBIT | **Y — but single-segment** | `Segments` tab: **Banking USD 6,991m = 100% of FY2025 revenue**, with segment interest expense, pre-tax profit and tax. Geographic split Brazil 11,038 (91%) / Mexico 808 (7%) / Other 237 (2%) [`ciq_facts.json` `segments_revenue`, `geographic`, both `status: present`] | Segment data exists, so this is not a data gap — but with one reportable segment a genuine sum-of-the-parts breakup does not exist. The geographic split is a sanity-check lens, not a segment P&L |
| Dividend / buyback data | **Y** | Dividend per share **NA in every year** and Total Dividends Paid "–" across FY2021–LTM Jun-2026 (CIQ `Ratios`, `Cash Flow`); **Repurchase of Common Stock −USD 500.4m** in LTM 12m to Jun-30-2026 (CIQ `Cash Flow`) | Shareholder-yield read. Zero dividend means a dividend-discount model must be built on distributable earnings, not on paid dividends; the buyback is the only cash return so far |

## 4. Cross-Module Availability

Checked against the actual filesystem at `analyses/NU_2026-09-06/`.

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/03_segment-map.md | Y |
| business-model/08_competitive-map.md | Y |
| business-model/07_business-quality.md | Y |
| business-model/09_moat.md | Y |
| business-model/10_external-dependency.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/04_guidance-consensus.md | Y |
| earnings/03_margin-drivers.md | Y |
| earnings/07_earnings-sensitivity.md | Y |
| earnings/06_earnings-quality.md | Y |

**Additional modules present in this run root.**
- `management-governance/` — complete (00 through 99, including `04_ownership-and-insider-behavior.md` and `99_management-governance-synthesis.md`). Available for the §24 Filter 6 / RF-OWN-004 unaligned-owner read, which matters here because the founder-CEO holds 74.3% of voting power through Class B shares.
- `balance-sheet-survival/` — **only `00_solvency-data-triage.md` exists. `01_capital-structure-and-leverage.md` is NOT available.** So `01_price-and-capital-structure` has no filing-based canonical net-debt figure to inherit and must build total debt from the Q2 2026 interim / 20-F debt notes directly, per the Cross-Module Inputs rule. It must say so rather than default silently to the CIQ vendor aggregate.
- `catalyst/` and `competitive-intel/` also exist in the run root (not valuation inputs).

**A caution on the vendor net-debt figure.** `ciq_facts.json` reports `net_debt_m` = **−9,274.2** (i.e. net cash) on the CIQ vendor basis, and its own `source_ref` warns the basis "may net short-term/liquid investments; confirm vs the strict total-debt−cash basis, §15". For a bank this figure is close to meaningless as a valuation input. `01` must label the basis inline and treat the EV bridge as informational only.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | **N** | 01, 05, 07, 99 | None. A pool-verified, dated price exists (USD 14.30, as-of 2026-08-29). Margin of safety and downside-to-bear both unlock. `01` must still check the ≈5–6 trading-day staleness against the ">5 trading days → valuation confidence max 70" threshold |
| No consensus / forward estimates | **N** | 02, 03, 04, 05 | None. Full consensus strip incl. forward EPS, revenue and book value per share |
| No peer data | **N** | 03, 06 | None. 10 named peers with P/E and P/TangBV |
| No segment-level data | **N** | 06 | None — segment data exists. But it is a **single** reportable segment (Banking 100%), so `06` returns the "single-segment — SOTP collapses to the consolidated read" note per the Segment/SOTP Rule. The "SOTP not possible for a multi-segment business" cap does **not** bind, because this is not a multi-segment business |
| No balance sheet / capital structure | **N** | 01, 04, 06 | None. Bank-template balance sheet plus the audited/reviewed statement of financial position |
| No cash flow statement | **N** | 04 | None. Present in both the CIQ export and the interim filing |

**Caps that will bind anyway (not from the six rows above).** None are triggered by missing data. Two conditions must nonetheless be carried forward, because they are method-validity and reference-window facts rather than absent inputs:

1. **Sector Cycle Reality Test — likely "Not assessable" for both `02` and `03`.** The pool contains **no sector-level or peer-level multiple history**: the own-history multiple export spans six quarters (2025-03-31 → 2026-08-28), and the peer export is a single-date snapshot (2026-08-29) with no historical peer medians. Under the Score-Cap table, an honestly-absent check carries **no cap by itself**, but `02` and `03` must each write *"Not assessable — no sector-level multiple history"* rather than assume the anchor is stable, and `99` must record the gap in its Reconciliation so it is visible rather than silently skipped. `02` must additionally state plainly that its reference band is six quarters, not the 3–5 years the method assumes.
2. **Prior-memo contamination risk.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is a user note (§4 tier 9) that already contains a probability-weighted target (USD 17.11), scenario probabilities, exit P/E multiples and a trade score. Those are **outputs, not evidence**, and two of them (scenario probabilities, probability-weighted target) belong to the master synthesizer, not to this module. Downstream agents may cite the memo for a fact it sources, but must not adopt its target, its multiples, or its case weights as an input — that would be marking the engine's own homework.

## 6A. Method Readiness Matrix

Method validity is set by the Business-Type Method Map for a **Financial (bank)** issuer: value equity directly, discount at the cost of equity, use P/E and P/tangible-book, and do **not** use EV-based multiples, an FCFF DCF, or the EV bridge as a value.

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | **Y** | None | P/LTM EPS, P/NTM EPS, P/BV, P/TangBV with quarterly Average/High/Low/Close, 2025-03-31 → 2026-08-28. **Window is six quarters, not 3–5 years** — the company only listed in Dec-2021 and the export goes no further back. `02` states the short window, states "Not assessable" on the sector-cycle check, and does not present a six-quarter band as a settled "normal" |
| Peer relative valuation | **Y** | None | 10 named LatAm financial peers, LTM P/E and P/TangBV plus NTM P/E, as-of 2026-08-29. Subject 19.5× LTM P/E and 5.7× P/TangBV against peer medians of 8.5× and 1.8× — a large premium `03` must test as *warranted or not* (NU's growth and returns vs incumbent banks), never asserted either way. Peer set is a single-date snapshot with no peer multiple history |
| Intrinsic DCF (Operating FCFF) | **N — method-invalid, not data-blocked** | n/a | An FCFF DCF is explicitly excluded for a Financial by the Business-Type Method Map. LTM cash from operations is −USD 10,304.8m because loan-book and deposit growth flow through operating cash flow, so an "FCF base" here would be an artefact. **`04` runs a dividend-discount or residual-income / excess-return-on-equity model instead**, discounting at the cost of equity. Inputs for that are present: forward EPS and forward book value per share (Estimates `Consensus`), equity USD 13.25bn, and the return-on-equity series in CIQ `Ratios` |
| Reverse DCF | **Y** | None | Runs off `04`'s model, not a fresh one. `05` inverts the SAME residual-income / DDM at USD 14.30 and solves for the implied growth in earnings and book value. Note for the cost-of-capital reality test: the pool carries an S&P Global Ratings export and a Fixed Income Securities Summary (2,299 rows) for the cost-of-debt and credit read, and the operating cash flows are Brazilian real / Mexican peso — so a country-risk premium is **required**, not optional (WACC sanity bounds, emerging-market floor) |
| SOTP | **N** | Not a missing input — the company reports one segment | Banking = 100% of FY2025 revenue and of pre-tax profit. `06` returns the "single-segment — SOTP collapses to the consolidated read" note and does not fabricate a breakup. The Brazil 91% / Mexico 7% / Other 2% geographic split may be used as a labelled sanity check only; there is no segment EBIT by geography and no matched forward comparable per geography, so a geographic SOTP would be exactly the "trailing base × mismatched multiple" the rules forbid |

## 6. Sufficiency Verdict

- **Verdict: Sufficient**
- **Reason:** the pool carries a complete earnings and cash-flow base, a full bank-template capital structure, a dated pool-verified current price, a full consensus estimate strip (including forward book value per share), an own-history multiple series and a 10-name peer comps export — with **zero extraction failures** — so four independent valuation methods can run.
- **Methods that can run:** own-history multiples (`02`), peer relative valuation (`03`), intrinsic equity valuation via residual-income / dividend-discount on the cost of equity (`04` — replacing the FCFF DCF, which is invalid for a bank), and reverse-DCF inverting that same model (`05`). SOTP (`06`) does not apply: one reportable segment.
- **Active partial-data caps:** none — no row in the Partial-Data table fires.
- **Critical missing items:** none that block the module. Four items must nonetheless be carried into the downstream work as stated limitations, not as silent assumptions:
  - **No sector-level or peer-level multiple history.** `02` and `03` each write "Not assessable — no sector-level multiple history"; `99` records the gap in its Reconciliation. No cap by itself, but neither method's level may be treated as a stable anchor.
  - **Own-history multiple window is six quarters (2025-03-31 → 2026-08-28), not 3–5 years.** `02` must say so in its own report.
  - **`balance-sheet-survival/01_capital-structure-and-leverage.md` has not been produced in this run root.** `01` builds total debt from the Q2 2026 interim and FY2025 20-F debt notes directly and states that it did, rather than inheriting a figure that does not exist or defaulting to the CIQ vendor aggregate.
  - **Price staleness is at the threshold (≈5–6 trading days).** `01` counts the trading days explicitly, documents a refresh attempt, and applies the valuation-confidence max 70 cap if the count exceeds five.
