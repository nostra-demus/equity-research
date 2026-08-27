# Earnings Data Triage — KAR

Karoon Energy Ltd (ASX: KAR), ABN 53 107 001 338 — an Australian-incorporated, ASX-listed upstream oil & gas producer (Baúna, Santos Basin, Brazil, operated; Who Dat/Dome Patrol/Abilene, Gulf of America, non-operated). All figures below are as extracted by the run's canonical pool extractor. The extractor was re-run for this triage (`python3 .claude/tools/extract_pool.py "data/KAR/" "analyses/KAR_2026-08-27/_pool_extracts"`) but errored with a sandbox `PermissionError` writing to an already-existing extract file — **a limitation of this run's write permissions, not a real extraction failure.** The prior extraction in `_pool_extracts/manifest.json` / `manifest.md` is complete, fresh, and idempotent: **46 workbooks → 147 tabs; 181 extract files; 0 failures** across 79 source documents. Only one source, an unrelated personal audio file, is not text-extracted (`status: in-place` — it is audio, not a document; see §1 note). No source in this pool is in a `fail`, `fallback-text`, or `missing-dependency` state, so nothing here is downgraded to "missing" on extraction grounds. `ciq_facts.json` and `relationships.json` sidecars do **not** exist in `_pool_extracts/` for this run — no deterministic facts pin is available; all figures below are this agent's own sourced read of the underlying documents.

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | Australia | ABN 53 107 001 338 on Appendix 4D/4E cover pages; "ASX Listing Rules" cited throughout [FY2025 Annual Report, cover letter] |
| Exchange | ASX (Australian Securities Exchange), ticker KAR | Filenames and headers throughout the pool ("ASX: KAR") |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **Other — ASX Listing Rules / Australian Corporations Act.** Not US SEC, not India SEBI. Local-equivalent forms: Appendix 4D (half-year report), Appendix 4E (preliminary final report / results-to-market — the earnings press release), quarterly "Activities Reports" (production/cash, not full financials), and ASX market announcements | `Filings/Karoon_Energy_Ltd_-_Form_Half_Yearly_Report(Aug-26-2025).pdf`, `Filings/Karoon_Energy_Ltd_-_Form_Preliminary_Final_Report(Feb-25-2026).pdf`, quarterly `…_Activities_Report(...)` filenames |
| Reporting standard | IFRS as adopted by the Australian Accounting Standards Board (AASB); company also reports "Underlying NPAT" as a labelled non-IFRS measure | "Underlying NPAT … is a non-IFRS measure which is unaudited but is derived from figures within the audited financial statements" [FY2025 Annual Report]; CIQ Estimates Consensus tab header: "Acctg. Standard: IFRS" [`KaroonEnergyLtdASXKAREstimatesReport.xls`, Consensus tab] |
| Reporting currency | US dollars (US$) — the company reports in USD despite an ASX/AUD listing | "US$ MILLION" on Appendix 4D/4E financial statements [`Filings/Karoon_Energy_Ltd_-_Form_Half_Yearly_Report(Aug-26-2025).pdf`; `Filings/Karoon_Energy_Ltd_-_Form_Preliminary_Final_Report(Feb-25-2026).pdf`]. Note: the CIQ Consensus tab's "Current Half / Current Year / NTM" market-summary block and the traded share price are quoted in AUD — mixed-currency pool, flag to downstream agents |
| Fiscal-year end | 31 December (changed from 30 June; a stub/transition period sits around CY2023) | CIQ Financials workbook periods run …Jun-30-2021, Jun-30-2022, Jun-30-2023, then Dec-31-2023, Dec-31-2024, Dec-31-2025 [`Karoon Energy Ltd ASX KAR Financials (1).xls`, Segments tab]; the "2023 Earnings Call, Feb 29, 2024" transcript covers the transition period |
| Document language(s) | English throughout | All 79 sources inspected are in English; no translation issue arises (CLAUDE.md §27 non-English rule not triggered) |

Downstream agents should read the Annual Report / Appendix 4E as the annual-filing tier, the Appendix 4D (half-yearly report) as the interim-filing tier, and the quarterly Activities Reports + ASX announcements as the material-event/production-update tier per CLAUDE.md §27 — **do not expect or require a US 10-K/10-Q/8-K, and do not expect quarterly-frequency full financial statements.** ASX-listed E&P companies report full audited/reviewed income statement, balance sheet, and cash flow **half-yearly, not quarterly**; the interim "quarterly" cadence in this pool (Activities Reports) covers production volumes, realised prices, and a high-level cash-flow/liquidity update only — not a full P&L. Agents applying the module's "No quarterly data" partial-data flag (MODULE_RULES.md) should read that flag against the **half-yearly** cadence for this company, not against a missing US-style 10-Q.

**Time-critical flag:** the CIQ Estimates Consensus tab states "FQ2 2026 Earnings Release Date: Aug-26-2026" [`KaroonEnergyLtdASXKAREstimatesReport.xls`, Consensus tab] — i.e., the company's H1/FY2026 half-year result (CIQ's vendor-normalized "FQ2") was due to print **one day before** this triage's run date (today: 2026-08-27). No Half-Yearly Report, Half-Year Audit Review, or Preliminary Final Report for a period ending 30-Jun-2026 exists anywhere in `data/KAR/Filings/` or the CIQ workbooks as of this pool sync, and the CIQ Revisions tab's most recent analyst revision is dated 2026-08-14 — before the stated release date, i.e. still pre-print. This is either (a) a release that has not yet landed in this data pool, or (b) a release that slipped past its originally-flagged date. **Downstream agents (01, 04, 05 especially) must treat the H1/FY2026 result as an imminent, not-yet-captured catalyst — every consensus, guidance, and revision figure in this pool is PRE-release positioning for that print, not a post-print read.** Per CLAUDE.md §27, this vendor "FQ2" label should be restated onto the company's actual half-yearly reporting basis before being used as a beat/miss bar.

## 1. File Inventory

### 1.1 Primary filings (`data/KAR/Filings/`) — 16 PDFs, all extracted OK

| Filename | Type | Period Covered | Last Modified (Drive-sync, not evidentiary) | Earnings Relevance |
|---|---|---|---|---|
| `Karoon_Energy_Ltd_-_Form_Annual_Report(Feb-25-2026).pdf` | Annual filing | FY2025 (year ended 31-Dec-2025) | 2026-08-27 (sync) | High — audited income statement, balance sheet, cash flow, segment notes, MD&A |
| `Karoon_Energy_Ltd_-_Form_Preliminary_Final_Report(Feb-25-2026).pdf` | Annual filing (Appendix 4E) — **earnings press release / results-to-market** | FY2025 | sync | High — Revenue US$628.6m, NPAT US$125.5m vs FY24; the primary results-announcement anchor |
| `Karoon_Energy_Ltd_-_Form_Preliminary_Final_Report(Feb-26-2025).pdf` | Annual filing (Appendix 4E), prior year | FY2024 | sync | Medium — comparative-period press release |
| `Karoon_Energy_Ltd_-_Form_Preliminary_Annual_Report(Jan-27-2026).pdf` | Duplicate / mislabeled CIQ form-type tag | 4Q25/CY25 | sync | Low — byte-identical body text to the Jan-26-2026 Fourth Quarter Activities Report filed one day earlier; not an independent source |
| `Karoon_Energy_Ltd_-_Form_Fourth_Quarter_Activities_Report(Jan-26-2026).pdf` | Quarterly filing (production/cash, not full P&L) | 4Q25/CY25 | sync | Medium-High — full-CY25 production 10.3 MMboe, cash update |
| `Karoon_Energy_Ltd_-_Form_Fourth_Quarter_Activities_Report(Jan-29-2025).pdf` | Quarterly filing, prior year | 4Q24/CY24 | sync | Medium — comparative period |
| `Karoon_Energy_Ltd_-_Form_First_Quarter_Activities_Report(Apr-27-2026).pdf` | Quarterly filing | 1Q26 (to 31-Mar-2026) | sync | Medium-High — production 1.96 MMboe, revenue US$128.2m |
| `Karoon_Energy_Ltd_-_Form_Second_Quarter_Activities_Report(Jul-22-2026).pdf` | Quarterly filing — **most recent quarterly-cadence filing in the pool** | 2Q26 (to 30-Jun-2026) | sync | High — production 1.08 MMboe, revenue US$116.4m, liquidity US$363.6m, CY26 guidance update, CEO quote |
| `Karoon_Energy_Ltd_-_Form_Second_Quarter_Activities_Report(Jul-23-2025).pdf` | Quarterly filing, prior year | 2Q25 | sync | Medium — comparative period |
| `Karoon_Energy_Ltd_-_Form_Third_Quarter_Activities_Report(Oct-22-2025).pdf` | Quarterly filing | 3Q25 | sync | Medium |
| `Karoon_Energy_Ltd_-_Form_Third_Quarter_Activities_Report(Oct-23-2024).pdf` | Quarterly filing, prior year | 3Q24 | sync | Medium — comparative period |
| `Karoon_Energy_Ltd_-_Form_Half_Yearly_Report(Aug-26-2025).pdf` | Interim filing (Appendix 4D) — **most recent full interim P&L/BS/CF in the pool** | H1 2025 (to 30-Jun-2025) | sync | High — Revenue US$308.3m, NPAT US$71.0m vs H1 2024; full condensed financial statements |
| `Karoon_Energy_Ltd_-_Form_Half_Year_Audit_Review(Aug-26-2025).pdf` | Interim filing — independent auditor's review report | H1 2025 | sync | High — attaches assurance to the H1 2025 numbers |
| `Karoon_Energy_Ltd_-_Form_Half_Yearly_Report(Aug-27-2024).pdf` | Interim filing (Appendix 4D), prior year | H1 2024 | sync | Medium — comparative period |
| `Karoon_Energy_Ltd_-_Form_Half_Year_Audit_Review(Aug-27-2024).pdf` | Interim filing — auditor review, prior year | H1 2024 | sync | Medium — comparative period |
| `Karoon_Energy_Ltd_-_Form_Other(Aug-27-2024).pdf` | Investor deck (results presentation) | H1 2024 | sync | Medium — chart-heavy slide deck; **no deck newer than this exists in the pool (~24 months stale)** |

**No Half-Yearly Report, Half-Year Audit Review, or Preliminary Final Report for a period ending 30-Jun-2026 is present** — see the time-critical flag in §0. The most recent full-financials interim document is H1 2025 (~13 months old relative to today).

### 1.2 Transcripts (`data/KAR/Transcript Digest/`) — 11 PDFs, all extracted OK, all VERBATIM (S&P Capital IQ transcripts)

| Filename | Type / Subtype | Period Covered | Earnings Relevance |
|---|---|---|---|
| `Karoon Energy Ltd - ShareholderAnalyst Call.pdf` | **Verbatim transcript** — AGM / shareholder-analyst call (Board Chair, CEO/MD Carri Lockhart, NEDs, shareholders, analysts) — **most recent transcript in the pool** | 21-May-2026 | High for tone/candor and recent management commentary, but **not tied to a specific quarter's results release** (it is an AGM Q&A, not a results call) |
| `Karoon Energy Ltd, 2025 Earnings Call, Feb 26, 2026.pdf` | **Verbatim transcript** — FY2025 results call | FY2025 (year ended 31-Dec-2025) | High — most recent results-linked call |
| `Karoon Energy Ltd, H1 2025 Earnings Call, Aug 27, 2025.pdf` | **Verbatim transcript** — H1 2025 results call | H1 2025 | High |
| `Karoon Energy Ltd, 2024 Earnings Call, Feb 27, 2025.pdf` | **Verbatim transcript** — FY2024 results call | FY2024 | Medium — comparative period |
| `Karoon Energy Ltd, H1 2024 Earnings Call, Aug 28, 2024.pdf` | **Verbatim transcript** — H1 2024 results call | H1 2024 | Medium |
| `Karoon Energy Ltd, 2023 Earnings Call, Feb 29, 2024.pdf` | **Verbatim transcript** — FY23/transition-period call (old FYE Jun-30 → new FYE Dec-31) | Transition period | Low-Medium — historical, FYE-transition noise |
| `Karoon Energy Ltd, 2023 Earnings Call, Aug 23, 2023.pdf` | **Verbatim transcript** — FY23 (old convention, YE 30-Jun-2023) | FY23 (old) | Low — historical |
| `Karoon Energy Ltd, H1 2023 Earnings Call, Feb 22, 2023.pdf` | **Verbatim transcript** | H1 FY23 (old) | Low — historical |
| `Karoon Energy Ltd, 2022 Earnings Call, Aug 25, 2022.pdf` | **Verbatim transcript** | FY22 (old) | Low — historical |
| `Karoon Energy Ltd, H1 2022 Earnings Call, Feb 23, 2022.pdf` | **Verbatim transcript** | H1 FY22 (old) | Low — historical |
| `Karoon Energy Ltd, 2021 Earnings Call, Sep 20, 2021.pdf` | **Verbatim transcript** | FY21 (old) | Low — historical |

No sell-side / analyst earnings-note "transcript proxy" exists anywhere in this pool. Every call-derived source is a full verbatim transcript, so the module's proxy-related caps do not apply to KAR; tone/candor IS assessable from primary transcript sources. However, the most recent call is an AGM Q&A, not a results call — see §5.

### 1.3 CIQ Estimates Report (`KaroonEnergyLtdASXKAREstimatesReport.xls` + duplicate `(1).xls`) — 8 tabs, all OK

| Filename → Tab | Type | Period Covered | Earnings Relevance |
|---|---|---|---|
| `KaroonEnergyLtdASXKAREstimatesReport.xls` → `Consensus` (990×31) | Consensus / estimate export | Current; next print "FQ2 2026" flagged due 26-Aug-2026 | **High** — target price, EPS/revenue/EBITDA consensus, 9 analysts, recommendation mix |
| ″ → `Recent Changes` (265×10) | Consensus / estimate export | Estimate revisions to 2026-08-14 | High — revision momentum |
| ″ → `Guidance` (66×8) | Guidance data | FY2022–FY2026 company guidance vs consensus vs actual, tracked by line item | High — direct guidance-vs-actual-vs-consensus history |
| ″ → `Multiples` (34×7) | Consensus / estimate export | Current | Medium — forward multiples |
| ″ → `Surprise` (415×27) | Consensus / estimate export | Historical beats/misses by line item, FY2009–FY2025 (mostly populated FY2023–FY2025) | High — beat/miss history |
| ″ → `Trends` (325×23) | Consensus / estimate export | Historical estimate trend | Medium — revision trend detail |
| ″ → `Revisions` (627×23) | Consensus / estimate export | Individual analyst-level revisions, dated to 2026-08-14 (Morgans Financial, etc.) | High — named-analyst revision detail |
| `KaroonEnergyLtdASXKAREstimatesReport (1).xls` → `Guidance` (66×8) | Guidance data, duplicate | Same as above | Redundant with the Guidance tab above |

Consensus data-as-of: revisions run through 2026-08-14, twelve days before the stated FQ2-2026 print date and, per §0, apparently still before that print landed in this pool. **Treat consensus as pre-print positioning, not post-print.**

### 1.4 CIQ core financials family (`Financials.xls` + 5 duplicate copies + 8 single-tab subset files) — 13 tab-types, all OK, ANNUAL-ONLY periods

`Financials.xls`, `Financials (1).xls` … `Financials (5).xls` (6 byte-identical copies of the same 13-tab workbook) plus 8 single-tab subset files (`Financials Balance Sheet.xls`, `Financials Cash Flow.xls`, `Financials Income Statement.xls`, `Financials Industry Specific.xls`, `Financials Key Stats.xls`, `Financials Pension OPEB.xls`, `Financials Ratios.xls`, `Financials Supplemental.xls`) all carry the same 13 tab-types, confirmed period-identical (Jun-30-2021/22/23 → Dec-31-2023/24/25, confirming the FYE change). Treated as one earnings-relevant source, not 14 independent ones.

| Tab | Type | Period Covered | Earnings Relevance |
|---|---|---|---|
| `Income Statement` (113×8) | Data export (CIQ core financials) | Annual only: Jun-30-2021, -2022, -2023; Dec-31-2023, -2024, -2025 | **High** — Revenue, COGS, gross profit, EBITDA, EBIT, NPAT by year. **No quarterly or half-year columns anywhere in this export — annual-only.** |
| `Balance Sheet` (86×8) | Data export | Same annual periods | High |
| `Cash Flow` (76×8) | Data export | Same annual periods | High |
| `Segments` (127×8) | Data export | Same annual periods | High — confirms single reportable business segment ("Exploration and Evaluation of Hydrocarbons"), consistent with business-model `03_segment-map.md`'s Brazil/USA/Corporate geographic split |
| `Key Stats` (92×10) | Data export | Same | Medium |
| `Multiples` (91×10) | Data export | Same | Medium |
| `Ratios` (163×8) | Data export | Same | Medium |
| `Capital Structure Summary` (95×7) | Data export | Same | Medium |
| `Capital Structure Details` (27×10) | Data export | Same | Low-Medium |
| `Historical Capitalization` (41×8) | Data export | Same | Low |
| `Supplemental` (46×8) | Data export | Same | Low-Medium |
| `Industry Specific` (88×8) | Data export | Same | Low-Medium — O&G-specific line items |
| `Pension OPEB` (40×8) | Data export | Same | Low — not materially applicable |

### 1.5 CIQ Credit Health Panel (`Karoon Energy Ltd ASX KAR Credit Health Panel.xls`) — 6 tabs, all OK

| Tab | Type | Period Covered | Earnings Relevance |
|---|---|---|---|
| `Financials` (40×13) | Data export (CIQ) | LTM periods 2021-06-30 … 2025-12-31 (annual-only, confirmed) | High — margin, leverage, liquidity ratios vs peer group mean, useful for earnings quality cross-check |
| `Summary` (62×11) | Data export | Current | Medium |
| `Operational Metrics Charts` (21×19) | Data export (chart data) | Current | Low |
| `Solvency Metrics Charts` (18×19) | Data export (chart data) | Current | Low |
| `Liquidity Metrics Charts` (15×19) | Data export (chart data) | Current | Low |
| `Disclaimer` (26×1) | Boilerplate | — | None |

### 1.6 CIQ Comparable Analysis (`Company Comparable Analysis Karoon Energy Ltd.xls`) — 8 tabs, all OK

| Tab | Type | Period Covered | Earnings Relevance |
|---|---|---|---|
| `Financial Data` (50×17) | Data export (CIQ comps) | Multi-period comp table | Medium |
| `Trading Multiples` (50×9) | Data export | Current | Medium |
| `Operating Statistics` (50×13) | Data export | Current | Medium — peer production/reserve stats |
| `Credit Health Panel` (48×10) | Data export | Current | Low-Medium |
| `Implied Valuation` (69×9) | Data export | Current | Low (valuation is out of this module's scope) |
| `Business Description` (44×3) | Data export | Current | Low |
| `Valuation Chart` (32×2) | Data export | Current | Low |
| `Disclaimer` (26×1) | Boilerplate | — | None |

### 1.7 Other single-tab / single-file CIQ exports and text docs — all OK, Low-to-Medium earnings relevance

| Filename → Tab | Type | Earnings Relevance |
|---|---|---|
| `Karoon Energy Ltd ASX KAR Analyst Coverage.xls` → `Analyst Coverage` (28×6) | Data export | Medium — sell-side coverage list, target prices |
| `Karoon Energy Ltd ASX KAR Auditors.xls` → `Auditors` | Data export | Low |
| `Karoon Energy Ltd ASX KAR Board Members.xls` → `Board Members` | Data export | Low — governance, not earnings |
| `Karoon Energy Ltd ASX KAR Committees.xls` → `Committees` | Data export | Low |
| `Karoon Energy Ltd ASX KAR Comparable M A Transactions.xls` → `Comparable M A Transactions` | Data export | Low |
| `Karoon Energy Ltd ASX KAR Compensation Summary Compensation.xls` → `Summary Compensation` | Data export | Low — governance |
| `Karoon Energy Ltd ASX KAR Competitors.xls` → `Competitors` | Data export | Low |
| `Karoon Energy Ltd ASX KAR Corporate Timeline.xls` → `Corporate Timeline` | Data export | Low |
| `Karoon Energy Ltd (ASX_KAR) Corporate Structure Tree.xls` → 3 tabs (`…Corp`, `Filtered Count`, `Aggregates`) | Data export | Low |
| `Karoon Energy Ltd ASX KAR Customers.xls` → `Customers` (16×6) | **Business-relationship export** ("recently disclosed" ≤2yr window) | Low for earnings — 1 counterparty (Pitkin Petroleum Limited), disclosed via a PXP Energy Corp filing; not an earnings input |
| `Karoon Energy Ltd ASX KAR Suppliers.xls` → `Suppliers` (20×6) | **Business-relationship export** | Low for earnings — 5 counterparties (Computershare, LLOG Exploration, Radix Engenharia, Stena Drilling, The Williams Companies); relevant to value-chain, not P&L extraction |
| `Karoon Energy Ltd ASX KAR Events Calendar.xls` → `Events Calendar` (23×3) | Data export | Medium — forward calendar, could confirm the next results date |
| `Karoon Energy Ltd ASX KAR Fixed Income S P Global Ratings.xls`, `…Fixed Income Securities Summary.xls`, `…Fixed Income Summary.xls` | Data export (debt/ratings) | Medium — bears on earnings quality via interest cost, not core P&L |
| `Karoon Energy Ltd ASX KAR Industry Classifications.rtf` | Data export (text) | None |
| `Karoon Energy Ltd ASX KAR Investment Analysis Co Investors.xls`, `…Direct Investments.xls` | Data export | Low |
| `Karoon Energy Ltd ASX KAR Key Developments.xls` → `Key Developments` (33×7) | Data export | Medium — event log, may corroborate transcript/filing dates |
| `Karoon Energy Ltd ASX KAR Long Business Description.rtf` | Data export (text) | Low |
| `Karoon Energy Ltd ASX KAR Private Ownership.rtf`, `…Public Ownership Detailed.xls`, `…Public Ownership Insider Trading.xls` (1623×11, largest tab in pool), `…Public Ownership Summary.rtf` | Data export | Low — ownership, not earnings |
| `Karoon Energy Ltd ASX KAR Products.xls` → `Products` | Data export | Low |
| `Karoon Energy Ltd ASX KAR Professionals.xls` → `Professionals` | Data export | None |
| `Karoon Energy Ltd ASX KAR Public Company Profile.rtf` | Data export (text) | Low |
| `Karoon Energy Ltd ASX KAR Strategic Alliances.xls` → `Strategic Alliances` | Data export | Low |
| `Karoon Energy Ltd ASX KAR Takeover Defenses.xls` → 3 tabs | Data export | None |
| `Karoon Energy Ltd ASX KAR Transaction Advisors.xls` → `Transaction Advisors` | Data export | Low |
| `Transaction Summary M A Private Placements.xls`, `Transaction Summary Public Offerings.xls` | Data export | Low |

### 1.8 Non-KAR / out-of-scope files in the pool

| Filename | Type | Earnings Relevance |
|---|---|---|
| `AI Agents Type. The Wrap🌯 17 Nov 2024 _ Market Corrects.pdf` | Other — generic weekly newsletter, no KAR content | None — not usable as evidence for this ticker |
| `Munshot AI Podcasts — Aug 17 – 23, 2026.pdf` | Other — generic AI-podcast digest, no KAR content | None |
| `AI_Sales_Team_Textiles.xlsx` (8 tabs: Start Here, AI Team Roster, Team Flow Map, 90-Day Plan, Cost Model, Startup Watchlist, Genspark Agents, Skill Library) | Other — unrelated internal planning workbook, not company-specific | None |
| `Sapna Kusumgar inperson meet post NDA full action plan July 22 2026 [lwYwTQkIbL0].mp3` | Other — audio file, `status: in-place` (not text-transcribed) | None — unrelated to KAR; not a pool extraction failure requiring a cap, simply an out-of-scope file |

## 1A. External Data

No `data/KAR/external/` directory exists in this pool (checked directly; confirmed absent). No externally sourced research (alt-data panels, expert-call notes, channel checks, broker research, paid-API pulls) is present. Nothing to inventory here, and this absence does not affect the sufficiency verdict.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months, vs 2026-08-27) |
|---|---|---|---|
| Annual filing | `Filings/Karoon_Energy_Ltd_-_Form_Annual_Report(Feb-25-2026).pdf` | FY2025, year ended 31-Dec-2025 | ~6 |
| Quarterly filing (production/cash, not full P&L) | `Filings/Karoon_Energy_Ltd_-_Form_Second_Quarter_Activities_Report(Jul-22-2026).pdf` | 2Q26, period ending 30-Jun-2026 | ~1 |
| Interim filing with full P&L/BS/CF | `Filings/Karoon_Energy_Ltd_-_Form_Half_Yearly_Report(Aug-26-2025).pdf` | H1 2025, period ended 30-Jun-2025 | ~13 |
| Earnings transcript (results call) | `Transcript Digest/Karoon Energy Ltd, 2025 Earnings Call, Feb 26, 2026.pdf` | FY2025 results call | ~6 |
| Any transcript (incl. non-results) | `Transcript Digest/Karoon Energy Ltd - ShareholderAnalyst Call.pdf` | AGM/shareholder-analyst call, 21-May-2026 | ~3 |
| Investor deck | `Filings/Karoon_Energy_Ltd_-_Form_Other(Aug-27-2024).pdf` | H1 2024 results presentation | ~24 (stale) |
| Consensus / estimate export | `KaroonEnergyLtdASXKAREstimatesReport.xls` (Consensus tab) | Current; next print "FQ2 2026" flagged due 26-Aug-2026, most recent revision dated 2026-08-14 | 0 (pre-print positioning — see §0 time-critical flag) |
| Guidance data | `KaroonEnergyLtdASXKAREstimatesReport.xls` (Guidance tab); also 2Q26 Activities Report, "CY26 production and capex updated during quarter 2" | Guidance updated as of the 2Q26 print (22-Jul-2026); capex guidance revised to 2026-07-22, actual recorded to 2026-08-14 | ~1 |
| Cash flow data | `Filings/Karoon_Energy_Ltd_-_Form_Annual_Report(Feb-25-2026).pdf` (audited CFS, FY2025); `…Financials Cash Flow.xls` (CIQ, annual-only) | FY2025 | ~6 |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | FY2025 Annual Report (audited); H1 2025 Half Yearly Report (reviewed, interim); CIQ Financials workbook (annual-only) | Needed for revenue, margin, EPS |
| Balance sheet | Y | Same as above | Needed for working capital and leverage |
| Cash flow statement | Y | Same as above | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y (production/cash only, not full P&L) | 2Q26 Activities Report (Jul-22-2026) | ASX regime files quarterly production/cash updates, not quarterly P&L (§0) — full P&L is half-yearly. Latest full-P&L period is H1 2025 (~13 months old); the H1/FY2026 print appears imminent/just-missed per §0 |
| Last 8 quarters | N (annual-only P&L history; 2 half-year P&L data points per year at best) | CIQ Financials/Income Statement tabs are annual-only; the Filings folder gives 2 half-year P&L points (H1 2024, H1 2025) plus 4 annual P&L points | ASX half-yearly cadence means true "8 quarters" of full P&L does not exist; QoQ/seasonality analysis should be built off half-year and annual data instead, flagged explicitly per MODULE_RULES.md |
| Consensus estimates | Y | CIQ Estimates Report, Consensus tab (9 analysts, target price, EPS/revenue/EBITDA) | Needed for market bar — but flagged as pre-print positioning (§0) |
| Estimate revisions | Y | CIQ Estimates Report, Recent Changes + Revisions tabs (named analysts, dated to 2026-08-14) | Needed for revision momentum |
| Earnings transcript | Y — verbatim | 11 verbatim CIQ transcripts, most recent results call FY2025 (Feb-2026); most recent call of any kind is the AGM/shareholder call (May-2026) | Needed for management tone and driver detail |
| Segment P&L | Y (single business segment, geographic operating-segment split) | FY2025 Annual Report, Note 2; CIQ Financials Segments tab confirms one reportable business segment ("Exploration and Evaluation of Hydrocarbons") | Business-model `03_segment-map.md` shows the real economic split is geographic (Brazil / USA / Corporate); use that decomposition, not a product-segment one |
| Current price | Y | CIQ Consensus tab, "Latest Price/Last Close Price 1.73/1.73" (AUD) | Needed only for master-level stock reaction context; note this is AUD while the company's own financials are US$ — flag the currency mismatch to any agent using both together |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y — confirms single business segment, geographic operating split (Brazil 77.9% / USA 22.1% of FY2025 revenue), and that Brazil's segment PBT alone exceeds 100% of consolidated PBT |
| 06_value-chain.md | Y — confirms Karoon is upstream-only, outsources 100% of Baúna marketing to Shell Western Supply and Trading, and is a price-taker on government take (Brazilian royalties + a new 12%/7.92%-after-tax export tax) |
| 10_external-dependency.md | Y — confirms High dependency on commodity (oil) prices and government policy/tax regimes; Low dependency on interest rates and FX. Directly informs the earnings module's Cycle-Position Rule: the business is explicitly commodity-cyclical |

All twelve business-model agent outputs plus its synthesis and dossier are present at `analyses/KAR_2026-08-27/business-model/`. The earnings module can build on this rather than re-deriving segment structure, value-chain bargaining power, or external dependency from scratch.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus IS present (9 analysts, target price, revisions to 2026-08-14) | 04, 05, 99 | No cap from absence; but flag consensus as **pre-print** for the imminent H1/FY2026 result (§0) — treat any beat/miss framing built on it as provisional until the actual print lands |
| No quarterly data | **Partial** — full P&L is only half-yearly under this regime; production/cash-only updates exist quarterly | 01, 02, 03, 06 | Not the standard "annual-only" cap: half-yearly cadence substitutes for quarterly per CLAUDE.md §27 jurisdiction-awareness. QoQ trend analysis should be replaced with HoH (half-on-half) analysis; state this substitution explicitly rather than marking data "missing" |
| No VERBATIM transcript, sell-side proxy present | N — not applicable; every call source in this pool is verbatim, no proxy exists | 02, 03, 04 | Not applicable |
| No transcript AND no sell-side proxy | N — 11 verbatim transcripts exist, most recent results call ~6 months old, most recent call overall (AGM) ~3 months old | 02, 03, 04 | Not applicable |
| No segment-level P&L | N — single reportable business segment with geographic operating-segment disclosure (Brazil/USA/Corporate) available via business-model `03_segment-map.md` and FY2025 Annual Report Note 2 | 02, 03, 99 | Not applicable |
| No cash flow statement | N — audited FY2025 cash flow statement and reviewed H1 2025 cash flow statement both present | 06, 99 | Not applicable |
| No current price | N — CIQ Consensus tab carries a live AUD price (1.73) | 99 | Not applicable, but flag the AUD-price-vs-USD-financials currency mismatch to any agent computing per-share or margin-of-safety figures |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has an audited annual filing ~6 months old (FY2025 Annual Report + Appendix 4E, Feb 2026) with full income statement, balance sheet, and cash flow; a reviewed interim filing with full financials ~13 months old (H1 2025 Half Yearly Report, Aug 2025); a quarterly production/cash update only ~1 month old (2Q26 Activities Report, Jul 2026); 11 verbatim earnings-call/AGM transcripts, the most recent ~3 months old; and a live consensus/estimate export with revision history through 2026-08-14. This comfortably clears the module's sufficiency bar (annual filing + quarterly/interim update or verbatim transcript + income statement/balance sheet/cash flow all present), with every call-derived source at full verbatim trust (no proxy discount applies).
- **Active partial-data caps:** None of the MODULE_RULES.md hard caps trigger for KAR. One regime-driven substitution to flag downstream, not a cap: "quarterly" full-P&L history does not exist for this ASX half-yearly reporter — agents 01–03/06 should build QoQ-equivalent trend analysis on a half-yearly (HoH) basis instead of quarterly, and state that substitution explicitly rather than treating it as a missing-data gap.
- **Critical missing items:** None required for the verdict, but one time-critical gap must be flagged to every downstream agent: **the H1/FY2026 half-year result — CIQ's own Consensus tab states it was due 26-Aug-2026, one day before this triage's run date — is not present anywhere in this pool.** All consensus, guidance, and revision data here is pre-print positioning for that release. Agents 04 (guidance-consensus) and 05 (beat-miss-setup) especially must state this explicitly and avoid presenting current consensus as if it already reflects the H1/FY2026 print. Two secondary, non-blocking gaps: (1) no investor presentation/deck newer than the H1 2024 results deck (~24 months stale — transcripts and quarterly reports substitute); (2) the most recent transcript (AGM/shareholder-analyst call, 21-May-2026) is not itself a results-call transcript, so the freshest results-call colour is the FY2025 call (~6 months old) even though a more recent (non-results) call exists.
