# Earnings Data Triage — NVT

Evidence binding: frozen. `DATA_PATH` = `NOSTRA_FROZEN_EVIDENCE_ROOT`; generation `6db32848…1aecd1e6`. All reads resolved through that exact generation's `manifest.json`, `corpus.txt`, `ciq_facts.json`, and per-tab extracts. Live `data/NVT/` was not read; `data/NVT/` is a citation label only.

Pool manifest totals: 15 sources, 2 workbooks, 20 tabs, 33 extracts written, **0 failures**. Every source carries `status: ok`. No `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer` rows exist, so no source is treated as missing on extraction grounds.

**On the "Last Modified" column (fix F23).** Every file in the frozen tree carries the same synthetic timestamp (2026-09-07 07:57) — that is the freeze/sync time, not a document date. It is analytically worthless and is not used. The column below instead reports the document's **own stated date read from inside the document** (filing signature date, presentation date, call date, or vendor data-as-of).

---

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States (issuer incorporated in Ireland; head office London, UK) | `FY24 10-K, cover page` — "Ireland (State or other jurisdiction of incorporation)"; "The Mille, 1000 Great West Road, London TW8 9DW, United Kingdom" |
| Exchange | NYSE, ticker NVT | `Q2 FY26 10-Q, cover page`; `CIQ Estimates→Consensus` header "nVent Electric plc (NYSE:NVT)" |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **US SEC, domestic-filer forms** — 10-K, 10-Q, 11-K (not 20-F/6-K). Commission file 001-38265 | `FY24 10-K` Form 10-K; `Q1 FY26 10-Q`, `Q2 FY26 10-Q` Form 10-Q; `FY25 11-K` Form 11-K |
| Reporting standard (US GAAP / IFRS / Ind AS) | **US GAAP** | `CIQ Estimates→Surprise` header "Acctg. Standard: US GAAP"; `CIQ Estimates→Consensus` header "US GAAP\|USD" |
| Reporting currency | **USD**, statements in millions | `CIQ Financials→Income Statement` header "In Millions of the reported currency… USD"; `ciq_facts.json` `"currency": "USD"` |
| Fiscal-year end | **31 December** | `FY24 10-K` "For the Fiscal Year Ended December 31, 2024"; `CIQ Estimates→Consensus` "Current Fiscal Year End: Dec-31-2026" |
| Document language(s) | English (all 15 sources) | All extracts under the frozen generation are English |

Downstream note per CLAUDE.md §27: NVT is a **US-regime domestic filer despite Irish incorporation**. The 10-K / 10-Q / 8-K source map applies directly — do NOT look for an Irish annual report, SEBI-LODR results, or a 20-F. The interim basis is a **standalone three-month 10-Q shown alongside the cumulative year-to-date period**, so a vendor "next quarter" consensus is already on the same standalone basis the company reports; no cumulative-vs-standalone restatement is needed here.

---

## 1. File Inventory

33 rows = 13 single-file sources + 20 workbook tabs (each tab listed separately; neither workbook is left as a single opaque row).

| Filename | Type | Period Covered | Last Modified (document's own stated date) | Earnings Relevance |
|---|---|---|---|---|
| `nVent Electric plc, 2025.pdf` (666,532 ch) | **Annual filing — Form 10-K** | FY ended **31-Dec-2024** (with FY2023, FY2022 comparatives) | Filed early Feb-2025 (10-K for FY2024) | High |
| `nVent Electric plc, Q1 2026.pdf` (165,957 ch) | **Quarterly filing — Form 10-Q** | Quarter ended **31-Mar-2026**; BS as of 31-Dec-2025 | Signed **1-May-2026** | High |
| `nVent Electric plc, 2026.pdf` (151,205 ch) | Quarterly filing — Form 10-Q (**duplicate render of the Q1 FY26 10-Q**) | Quarter ended **31-Mar-2026** | Signed **1-May-2026** (same signatories, same date) | Medium (duplicate — no new content) |
| `nVent Electric plc, Q2 2026.pdf` (165,244 ch) | **Quarterly filing — Form 10-Q** | Quarter ended **30-Jun-2026**; six months ended 30-Jun-2026 | Quarter ended 30-Jun-2026; results released 31-Jul-2026 | High |
| `nVent Electric plc, Q1 2026 Earnings Call, May 01, 2026.pdf` (119,141 ch) | **Verbatim transcript** (FactSet CallStreet "Corrected Transcript", prepared remarks + Q&A) — full trust | Q1 FY2026 call | **1-May-2026** | High |
| `nVent Electric plc, Q2 2026 Earnings Call, Jul 31, 2026.pdf` (60,265 ch) | **Verbatim transcript** (S&P Global Market Intelligence / CIQ "FQ2 2026 Earnings Call Transcripts") — full trust | Q2 FY2026 call | **31-Jul-2026, 1:00 PM GMT** | High |
| `nVent Electric plc, Q1 2026 ppt.pdf` (36,833 ch) | **Investor deck — earnings presentation** | Q1 FY2026 | **1-May-2026** | High |
| `2026-William-Blair-Conference-nVent-NVT-Presentation.pdf` (48,773 ch) | Investor deck — conference presentation (CEO Beth Wozniak) | FY2026 outlook / strategy | **3-Jun-2026** | Medium |
| `nVent-to-Acquire-Maverick-Power-2026.pdf` (8,527 ch) | **Company press release — M&A** (not an earnings release) | Announcement | **24-Aug-2026** | Medium (states expected accretion to adjusted EPS in year 1; post-Q2 event affecting the forward setup) |
| `nVent Electric plc, 2026 rev.pdf` (49,740 ch) | Benefit-plan filing — **Form 11-K** (nVent Management Company Retirement Savings and Investment Plan) | Plan FY ended **31-Dec-2025** | Plan year ended 31-Dec-2025 | Low (retirement-plan accounts; not company earnings) |
| `nVent Electric plc NYSE NVT Competitors.rtf` (44,260 ch) | Data export — CIQ competitor list | Not period-bound | Vendor export | Low |
| `nVent Electric plc NYSE NVT Products.rtf` (14,937 ch) | Data export — CIQ product list | Not period-bound | Vendor export | Low |
| `nVent Electric plc NYSE NVT Strategic Alliances.rtf` (9,633 ch) | Data export — CIQ alliances list | Not period-bound | Vendor export | Low |
| — **`nVent Electric plc NYSE NVT Financials.xls` → tab `Key Stats`** | Data export (CIQ) | Annual FY2021–FY2025 + LTM Jun-30-2026 | Vendor data as of ~12-Aug-2026 | Medium |
| — tab `Income Statement` | Data export (CIQ) — **income statement** | 12m Dec-2021, Dec-2022 (R), Dec-2023 (R), Dec-2024, Dec-2025, LTM Jun-30-2026 (108×7) | Vendor, ~12-Aug-2026 | High |
| — tab `Balance Sheet` | Data export (CIQ) — **balance sheet** | Annual FY2021–FY2025 + LTM (94×7) | Vendor, ~12-Aug-2026 | High |
| — tab `Cash Flow` | Data export (CIQ) — **cash flow statement** | Annual FY2021–FY2025 + LTM Jun-30-2026 (76×7) | Vendor, ~12-Aug-2026 | High |
| — tab `Multiples` | Data export (CIQ) — valuation multiples + **closing prices** | Quarter-ends 31-Mar-2025 → 30-Jun-2026 plus **12-Aug-2026** column (91×9) | Vendor close **12-Aug-2026** | Medium |
| — tab `Historical Capitalization` | Data export (CIQ) | Annual + LTM (39×7) | Vendor, ~12-Aug-2026 | Low |
| — tab `Capital Structure Summary` | Data export (CIQ) | Annual + LTM (99×7) | Vendor, ~12-Aug-2026 | Low |
| — tab `Capital Structure Details` | Data export (CIQ) — debt maturities | As-reported block, principal by maturity as of 31-Dec-2025 (40×10) | Vendor, ~12-Aug-2026 | Low |
| — tab `Ratios` | Data export (CIQ) — returns, margins, working capital (161×7) | Annual FY2021–FY2025 + LTM | Vendor, ~12-Aug-2026 | Medium |
| — tab `Supplemental` | Data export (CIQ) (74×7) | Annual + LTM | Vendor, ~12-Aug-2026 | Low |
| — tab `Industry Specific` | Data export (CIQ) (15×6) — near-empty (20 populated cells) | Annual | Vendor, ~12-Aug-2026 | Low |
| — tab `Pension OPEB` | Data export (CIQ) (243×7) | Annual + LTM | Vendor, ~12-Aug-2026 | Low |
| — **tab `Segments`** | Data export (CIQ) — **segment P&L + geographic revenue** (84×7) | Annual, latest column 12m **Dec-31-2025** | Vendor, ~12-Aug-2026 | High |
| — **`nVentElectricplcNYSENVTEstimatesReport.xls` → tab `Consensus`** | **Consensus / estimate export** (462×41) — mean/median/high-low/std-dev/n, target price, recommendation split, **latest price/last close**, current-quarter / current-year / NTM EPS, revenue, EBITDA and company guidance | FQ3 2026, FY2026, FY2027, NTM | Vendor; latest revision in workbook **7-Aug-2026** | High |
| — tab `Recent Changes` | Consensus export — broker-level revisions with dates/analysts (265×10) | Revisions dated to **7-Aug-2026** | Vendor, 7-Aug-2026 | High |
| — tab `Guidance` | **Guidance data** — company guidance vs consensus by period, guidance dates, actual vs guided (179×41) | FQ3 2018 → FY2026 | Vendor, ~Aug-2026 | High |
| — tab `Multiples` (Estimates) | Consensus export — forward multiples (23×7) | Forward periods | Vendor, ~Aug-2026 | Medium |
| — **tab `Surprise`** | Consensus export — **actual vs estimate history, annual AND quarterly** (219×35) | Annual FY2018–FY2025; **quarterly FQ1 2018 → FQ2 2026** | Vendor, ~Aug-2026 | High |
| — tab `Trends` | Consensus export — estimate trend over time (300×16) | Multi-period | Vendor, ~Aug-2026 | High |
| — **tab `Revisions`** | Consensus export — **revision breadth (up/down counts)** (467×12) | FY2026 / FY2027 and quarters | Vendor, ~Aug-2026 | High |

Derived sidecars in the same generation (not pool documents, listed for completeness): `ciq_facts.json` (deterministic CIQ facts, 15 concepts resolved, 0 conflicts) and `relationships.json` (CIQ supplier/customer graph — tier-5 vendor export, covers only recently disclosed relationships).

**No `external/` subfolder exists in this pool** — `manifest.json` carries no `external: true` row and no `provenance` object on any source. Section 1A is therefore omitted, and no external document could have moved the verdict.

---

## 2. Most Recent Sources

Age measured to today, 2026-09-07, from the period covered (or the document's own date for calls/decks/exports).

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | `nVent Electric plc, 2025.pdf` — Form 10-K | FY ended 31-Dec-2024 | **20.2** |
| Annual financials (FY2025, non-filing) | `nVent Electric plc NYSE NVT Financials.xls` → `Income Statement` / `Balance Sheet` / `Cash Flow` / `Segments` | 12 months ended 31-Dec-2025 | 8.2 (period end); vendor as of ~12-Aug-2026 |
| Quarterly filing | `nVent Electric plc, Q2 2026.pdf` — Form 10-Q | Quarter and six months ended 30-Jun-2026 | **2.2** |
| Earnings transcript | `nVent Electric plc, Q2 2026 Earnings Call, Jul 31, 2026.pdf` — **verbatim** | Q2 FY2026 call, 31-Jul-2026 | **1.2** |
| Investor deck | `2026-William-Blair-Conference-nVent-NVT-Presentation.pdf` (latest earnings deck: `nVent Electric plc, Q1 2026 ppt.pdf`, 1-May-2026) | 3-Jun-2026 | 3.1 (earnings deck 4.2) |
| Consensus / estimate export | `nVentElectricplcNYSENVTEstimatesReport.xls` → `Consensus` / `Recent Changes` / `Surprise` / `Trends` / `Revisions` | Latest broker revision 7-Aug-2026; surprise history through FQ2 2026 | **1.0** |
| Cash flow data | `nVent Electric plc, Q2 2026.pdf` (six months ended 30-Jun-2026) and `…Financials.xls` → `Cash Flow` (LTM Jun-30-2026) | 30-Jun-2026 | **2.2** |
| Guidance data | `nVentElectricplcNYSENVTEstimatesReport.xls` → `Guidance`; Q2 FY26 transcript (31-Jul-2026); Q2 FY26 10-Q | FY2026 / FQ3 2026 guidance | **1.2** |

---

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | **Y** | `Q2 FY26 10-Q, condensed consolidated statements of operations` (net sales $1,471.3m Q2; $2,713.3m six months); `FY24 10-K`; `CIQ Financials→Income Statement` (FY2021–FY2025 + LTM Jun-30-2026) | Needed for revenue, margin, EPS |
| Balance sheet | **Y** | `Q2 FY26 10-Q` (30-Jun-2026, with 31-Dec-2025 comparative); `FY24 10-K`; `CIQ Financials→Balance Sheet` | Needed for working capital and leverage |
| Cash flow statement | **Y** | `Q2 FY26 10-Q` (six months ended 30-Jun-2026); `FY24 10-K, Consolidated Statements of Cash Flows` (CFO from continuing ops $501.0m in 2024, $422.2m 2023, $273.3m 2022); `CIQ Financials→Cash Flow` (LTM CFO $690.6m) | Needed for CFO, FCF, earnings quality |
| Latest quarter | **Y** | `Q2 FY26 10-Q`, quarter ended 30-Jun-2026 — 2.2 months old | Needed for trend and setup |
| Last 8 quarters | **Y — with a source-tier split** | Filing-grade: Q1 FY26 and Q2 FY26 10-Qs give Q1'26, Q2'26 and their Q1'25, Q2'25 comparatives (4 quarters). Q3'25 and Q4'25 exist only in `CIQ Estimates→Surprise` (quarterly actuals FQ1 2018 → FQ2 2026), a tier-5 vendor export | Needed for seasonality and inflection |
| Consensus estimates | **Y** | `CIQ Estimates→Consensus` (FQ3 2026 EPS normalized 1.3899, revenue $1,427.3m; FY2026 EPS 5.113, revenue $5,435.3m, EBITDA $1,225.0m; 15 target-price estimates) | Needed for the market bar |
| Estimate revisions | **Y** | `CIQ Estimates→Recent Changes` (broker-level, latest 7-Aug-2026) and `→Revisions`; `ciq_facts.json`: FY2026 EPS 6↑/0↓, revenue 14↑/0↓ last month | Needed for revision momentum |
| Earnings transcript | **Y — two VERBATIM** | `Q1 FY26 Earnings Call, 1-May-2026` (FactSet Corrected Transcript, 20 pages, prepared remarks + Q&A) and `Q2 FY26 Earnings Call, 31-Jul-2026` (S&P Global / CIQ) | Needed for management tone and driver detail |
| Segment P&L | **Y** | `Q2 FY26 10-Q, segment note` — two reportable segments (Systems Protection, Electrical Connections) with net sales **and** significant expense categories to segment profit (Q2'26 net sales: Systems Protection $1,072.1m, Electrical Connections $399.2m, total $1,471.3m). Also `CIQ Financials→Segments` (FY2025: Systems Protection $2,593m / 67%, Electrical Connections $1,300m / 33% of $3,893m) | Needed for mix shift |
| Current price | **Y — but ~4 weeks stale** | `CIQ Estimates→Consensus, Market Summary`: Latest Price / Last Close **170.70 / 171.16**; 52-wk high/low 184.64 / 85.72. Corroborated by `CIQ Financials→Multiples` close column dated **12-Aug-2026** | Needed only for master-level stock-reaction context |

---

## 4. Cross-Module Availability

Checked against the actual filesystem at `analyses/NVT_2026-09-07/business-model/`. The business-model module has completed — all 14 outputs plus a dossier and an execution provenance receipt are present.

| Business-Model Output | Available? (Y/N) |
|---|---|
| `03_segment-map.md` | **Y** |
| `06_value-chain.md` | **Y** |
| `10_external-dependency.md` | **Y** |

Also present and usable by this module: `00_data-triage.md`, `01_disqualifier-scan.md`, `02_business-identity.md`, `04_unit-economics.md`, `05_customer-geography.md`, `07_business-quality.md`, `08_competitive-map.md`, `09_moat.md`, `11_capital-allocation-governance.md`, `12_red-flags-sweep.md`, `99_business-model-synthesis.md`. Per MODULE_RULES.md, `02_revenue-drivers` and `03_margin-drivers` must read `03_segment-map.md` and decompose by segment — the no-business-model disclaimer does NOT apply to this run.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | **N** | 04, 05, 99 | None. Consensus, Guidance, Surprise, Trends, Revisions and Recent Changes tabs all extracted `ok`; latest broker revision 7-Aug-2026 postdates the 31-Jul-2026 Q2 release, so the export is **not** stale and no staleness haircut is triggered |
| No quarterly data | **N** | 01, 02, 03, 06 | None. Two 10-Qs (Q1 FY26, Q2 FY26) plus quarterly actuals to FQ2 2026 in `CIQ Estimates→Surprise` |
| No VERBATIM transcript, sell-side proxy present | **N** | 02, 03, 04 | None. Two verbatim transcripts exist; no sell-side proxy was used and none is needed. Tone and candor ARE assessable |
| No transcript AND no sell-side proxy | **N** | 02, 03, 04 | None. Earnings-clarity ≤70 cap does **not** bind |
| No segment-level P&L | **N** | 02, 03, 99 | None. 10-Q segment note discloses net sales and significant expense categories by segment; the ≤70 clarity cap for a multi-segment business does **not** bind |
| No cash flow statement | **N** | 06, 99 | None. Earnings-quality max-45 cap does **not** bind |
| No current price | **N** | 99 | None. Price present at 170.70 / last close 171.16, as of ~12-Aug-2026. Not a cap, but agent 99 must date the price and note it predates the 24-Aug-2026 Maverick Power announcement |

**No score caps from MODULE_RULES.md bind on this pool.**

Limitations that are NOT caps but that downstream agents must carry:

- **No FY2025 Form 10-K.** The most recent audited annual filing is the **FY2024** 10-K (period end 31-Dec-2024, 20.2 months old). FY2025 full-year figures are available — `CIQ Financials` annual column 12m Dec-31-2025 (revenue $3,893.1m, EBITDA $840m, segments 67/33) and `CIQ Estimates→Surprise` FY2025 actuals (revenue $3,893.1m, GAAP EPS 4.31, normalized EPS 3.35) — but these are **tier-5 vendor data, not a filing**. Per CLAUDE.md §5, any FY2025 full-year number must be cited to the Capital IQ export with its data-as-of date, never under a 10-K's name. FY2025 audited notes, MD&A, auditor's report, and FY2025 segment expense detail are genuinely absent from this pool. The 31-Dec-2025 **balance sheet** is available filing-grade as the comparative column in both 10-Qs.
- **No Q3 FY25 or Q4 FY25 10-Q/filing, and no FY2025 earnings calls.** Only the two most recent calls (Q1 FY26, Q2 FY26) are in the pool. Quarters Q3'25 and Q4'25 are vendor-only.
- **No Q2 FY26 earnings press release or Q2 earnings deck.** The latest earnings presentation is Q1 FY26 (1-May-2026); the Q2 numbers come from the 10-Q and the 31-Jul-2026 verbatim transcript, which is the stronger pair anyway.
- **One duplicate.** `nVent Electric plc, 2026.pdf` is a second render of the Q1 FY26 10-Q (same 1-May-2026 signatures). Do not treat it as an independent source or double-count it.
- **Material post-period event.** The Maverick Power acquisition was announced **24-Aug-2026** — after the Q2 10-Q, after the consensus export (7-Aug-2026) and after the price mark (12-Aug-2026). Any forward read must state that consensus and price do not yet reflect it, and the release's "accretive to adjusted EPS in the first year" is company language, not an audited number.
- **Comparability break.** Q2 FY26 net sales of $1,471.3m against $963.1m a year earlier (`Q2 FY26 10-Q`) is not organic — the pool shows an Electrical Products Group acquisition inside Systems Protection. Growth decomposition must separate acquired from organic revenue rather than quote the headline change.

---

## 6. Sufficiency Verdict

- **Verdict: Sufficient**
- **Reason:** The pool carries full-year financials (FY2024 audited 10-K plus FY2025 annual columns in the Capital IQ Financials export), the latest quarterly filing (Q2 FY26 10-Q, quarter ended 30-Jun-2026, 2.2 months old) AND two verbatim earnings-call transcripts, with income statement, balance sheet and cash flow statement all available from filings and independently from the vendor export — every element of the sufficiency rule is met, with 0 extraction failures across 15 sources and 20 tabs.
- **Active partial-data caps:** None. No MODULE_RULES.md score cap binds.
- **Critical missing items:** None that block the module. The one gap worth naming is the absence of the **FY2025 Form 10-K** — FY2025 full-year figures must be cited to the Capital IQ export as tier-5 vendor data, and FY2025 audited notes, MD&A and auditor's report are not in the pool.
