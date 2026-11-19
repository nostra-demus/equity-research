# Earnings Data Triage — TTWO

**Evidence binding (MODULE_PIPELINE Step 1.5).** `NOSTRA_FROZEN_EVIDENCE_ROOT` is set and the full quartet is present and consistent (`NOSTRA_FROZEN_POOL_DATA_PATH`, `NOSTRA_FROZEN_POOL_OUT_DIR`, `NOSTRA_FROZEN_POOL_GENERATION`, `NOSTRA_FROZEN_EVIDENCE_ROOT`). This run therefore operates in **frozen supervisor-verified read mode**: the extractor was NOT run, the live logical path `data/TTWO/` was NOT read, and every manifest / corpus / CIQ-facts / relationships / extract read resolved inside the single bound generation `.extract-generations/0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d/`. `data/TTWO/` below is a citation label only.

**Manifest totals (frozen generation):** 30 sources · 19 workbooks · 62 tabs · 73 extracts written · **0 failures**. No source carries status `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer`. No `external/` subfolder exists in the pool, so there is no external-data section.

**Period rule (fix F23).** Every "Period Covered" below is parsed from INSIDE the document (the cover-page fiscal-period line, the "as of" row, or the latest dated column). The filesystem mtime on every frozen file is `2026-11-19 18:43` — that is the evidence-freeze timestamp, not a period signal, and it is used nowhere in this report.

---

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | `FY26 10-K, cover page` ("UNITED STATES SECURITIES AND EXCHANGE COMMISSION"; Delaware incorporation; 110 West 44th Street, New York) |
| Exchange | NASDAQ Global Select Market (NasdaqGS: TTWO) | `Q2 FY27 earnings release, 2026-11-09, p.1` ("NASDAQ:TTWO"); `Capital IQ Financials_Quarterly export, Income Statement tab` header ("NasdaqGS:TTWO") |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **US SEC** — Form 10-K (annual), Form 10-Q (quarterly), Form 8-K Exhibit 99.1 (earnings release), DEF 14A (proxy). Commission file number 001-34003 | `FY26 10-K, cover page`; `Q2 FY27 10-Q, cover page`; `TTWO 2Q27 Earnings Release, p.1` ("Exhibit 99.1") |
| Reporting standard (US GAAP / IFRS / Ind AS) | **US GAAP** | `Capital IQ Estimates export, Recent Changes tab` header ("Acctg. Standard: US GAAP"); `Q2 FY27 earnings release` presents GAAP and separately labelled non-GAAP (EBITDA, Net Bookings) |
| Reporting currency | **USD** (US dollars, millions) | `Capital IQ Financials_Annual export, Income Statement tab` ("Currency: Reported Currency … In Millions; USD"); `ciq_facts.json` → `currency: USD` |
| Fiscal-year end | **31 March**. Latest closed FY = FY2026 (ended 2026-03-31). Current FY = FY2027 (ends 2027-03-31) | `FY26 10-K, cover page` ("For the fiscal year ended March 31, 2026"); `Capital IQ Estimates export, Guidance tab` header ("Current Fiscal Year End: Mar-31-2027") |
| Interim reporting basis (CLAUDE.md §27) | **Standalone three-month quarter** (US 10-Q). Q2 FY27 = the three months ended 2026-09-30, with six-month cumulative shown alongside. A vendor "next quarter" estimate maps directly onto a standalone quarter here — no cumulative-stub restatement needed | `Q2 FY27 10-Q, cover page` ("For the quarterly period ended September 30, 2026"); `Capital IQ Financials_Quarterly export, Income Statement tab` ("Period Type: Quarterly … 3 months") |
| Document language(s) | English only (all 30 sources) | All extracts in the frozen generation are English |

**Downstream source map (no US-form gap exists).** This is a US domestic filer, so the §4 / §27 tiers resolve to their US names directly: audited annual = 10-K; interim = 10-Q; material-event / earnings = 8-K Ex. 99.1; proxy = DEF 14A. Do not search for or flag non-US equivalents.

**Basis warning for every downstream agent (carry this forward).** Take-Two reports a GAAP line and a company-defined operational metric that are NOT the same number, and the vendor consensus tracks the operational one:
- Q2 FY27 **Net Bookings $1.60bn** vs Q2 FY27 **GAAP net revenue $1.50bn** [`TTWO 2Q27 Earnings Release, 2026-11-09, p.1 and p.2`].
- The CIQ consensus header on the Q2 FY27 call prints `Revenue (mm) ACTUAL 1601.30` — i.e. the vendor's "Revenue" actual for the quarter is the **Net Bookings** figure, not GAAP net revenue [`Take-Two Interactive Software, Inc., Q2 2027 Earnings Call transcript, Nov 09 2026, S&P Global Market Intelligence Estimates header block`].
- FY27 guidance is issued on **both** bases in one table: GAAP total net revenue $7,980–8,180m and the operational metric Net Bookings $8,000–8,200m [`TTWO 2Q27 Earnings Release, 2026-11-09, "Outlook for Fiscal Year 2027"`].
Any beat/miss, bar-to-beat, or growth comparison must state which basis it is on and must not mix them (§15, no silent basis switch).

---

## 1. File Inventory

30 pool files → 73 inventory rows (11 single-document sources + 62 workbook tabs). Every multi-tab workbook is decomposed; no workbook appears as a single opaque row. "Last Modified" is the freeze timestamp for all rows and is deliberately non-informative (fix F23).

### 1.1 Single-document sources (11)

| Filename | Type | Period Covered (from inside the doc) | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| `10K_2025_26_0001628280-26-037434.pdf` (1,913 KB, 170 pp, native text) | Annual filing (Form 10-K) | **FY2026, fiscal year ended 2026-03-31** (comparatives FY2025, FY2024) | 2026-11-19 freeze | **High** |
| `10K_2024_25_0001628280-25-026694.pdf` (2,803 KB, 274 pp, native text) | Annual filing (Form 10-K) | **FY2025, fiscal year ended 2025-03-31** (comparatives FY2024, FY2023) | 2026-11-19 freeze | **High** |
| `10Q_2Q_0001628280-26-072254.pdf` (999 KB, 72 pp, native text) | Quarterly filing (Form 10-Q) | **Q2 FY2027, quarter ended 2026-09-30** + six months ended 2026-09-30 | 2026-11-19 freeze | **High** |
| `10Q_1Q_0001628280-26-054870.pdf` (538 KB, 38 pp, native text) | Quarterly filing (Form 10-Q) | **Q1 FY2027, quarter ended 2026-06-30** | 2026-11-19 freeze | **High** |
| `TTWO 2Q27 Earnings Release FINAL.pdf` (291 KB, 14 pp) | Earnings press release (8-K Ex. 99.1) — NOT a transcript, NOT a call source | **Q2 FY2027** results, release dated **2026-11-09**; carries FY27 full-year outlook + initial Q3 FY27 outlook | 2026-11-19 freeze | **High** |
| `TTWO 1Q27 Earnings Release FINAL 8-6-2026.pdf` (241 KB, 12 pp) | Earnings press release (8-K Ex. 99.1) | **Q1 FY2027** results, release dated **2026-08-07** | 2026-11-19 freeze | **High** |
| `Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf` (283 KB) | **Verbatim transcript** (S&P Capital IQ earnings-call transcript: Call Participants + Presentation + Question and Answer). Full trust | **Q2 FY2027 call, 2026-11-09 21:30 GMT** | 2026-11-19 freeze | **High** |
| `Take-Two Interactive Software, Inc., Q1 2027 Earnings Call, Aug 07, 2026.rtf` (294 KB) | **Verbatim transcript** (S&P Capital IQ earnings-call transcript) | **Q1 FY2027 call, 2026-08-07** | 2026-11-19 freeze | **High** |
| `Take-Two_Interactive_2Q FY27 FINAL.pdf` (854 KB, 16 pp) | Investor deck ("Second Quarter Fiscal 2027 Results & Guidance Summary") | **Q2 FY2027** (companion to the 2026-11-09 release) | 2026-11-19 freeze | **High** |
| `Take-Two_Interactive_1Q FY27 FINAL.pdf` (882 KB, 16 pp) | Investor deck ("First Quarter Fiscal 2027 Results & Guidance Summary") | **Q1 FY2027** (companion to the 2026-08-07 release) | 2026-11-19 freeze | Medium |
| `Take Two Interactive Software Inc NasdaqGS TTWO Public Company Profile.rtf` (264 KB) | Data export (CIQ company profile — business description, officers, listing detail) | Profile as-of the 2026-11 export | 2026-11-19 freeze | Low |

### 1.2 Workbook tabs — `Take-TwoInteractiveSoftware,IncNasdaqGSTTWOEstimatesReport.xls` (8,085 KB, 7 tabs)

The single most earnings-critical structured export in the pool. Extraction status `ok` on all 7 tabs.

| Parent file · Sheet | Rows × Cols | Type | Period Covered (from inside the tab) | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| EstimatesReport · **Consensus** | 604 × 123 | Consensus / estimate export | FQ1 2000 → **FQ4 2029** and FY history → **FY2029**; forward set includes FQ3 2027, FY2027, FY2028, FY2029 | 2026-11-19 freeze | **High** |
| EstimatesReport · **Recent Changes** | 265 × 10 | Estimate-revision event log (broker, analyst, data point, before/after) | **Latest dated change 2026-11-18**, plus an intraday row (post-Q2 FY27 print) | 2026-11-19 freeze | **High** |
| EstimatesReport · **Guidance** | 198 × 117 | Company guidance history + latest guidance key development | Guidance history FQ2 2002 → **FY2027 / FQ3 2027**; latest guidance event dated **2026-11-09** (Q3 FY27 + updated FY27) | 2026-11-19 freeze | **High** |
| EstimatesReport · **Surprise** | 311 × 113 | Historical estimate-vs-actual surprise | Quarterly and annual surprise series through **FQ2 2027** | 2026-11-19 freeze | **High** |
| EstimatesReport · **Trends** | 303 × 21 | Estimate trend (how the forward number moved over time) | Forward periods incl. FQ3 2027 / FY2027–FY2029 | 2026-11-19 freeze | **High** |
| EstimatesReport · **Revisions** | 467 × 21 | Revision breadth (up/down counts by period) | Last-week / last-month / last-3-month breadth as-of the 2026-11 export | 2026-11-19 freeze | **High** |
| EstimatesReport · **Multiples** | 34 × 7 | Forward valuation multiples (consensus-based) | Forward multiples as-of the 2026-11 export | 2026-11-19 freeze | Low (valuation, not earnings) |

### 1.3 Workbook tabs — `Take Two Interactive Software Inc NasdaqGS TTWO Financials_Quarterly.xls` (530 KB, 13 tabs)

| Parent file · Sheet | Rows × Cols | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| Financials_Quarterly · **Income Statement** | 116 × 43 | Quarterly P&L (USD m, reported currency, latest-filings restatement) | **FQ1 2017 (Jun-30-2016) → FQ2 2027 (Sep-30-2026)** — ~42 standalone quarters | 2026-11-19 freeze | **High** |
| Financials_Quarterly · **Cash Flow** | 73 × 43 | Quarterly cash flow statement | Jun-30-2016 → **Sep-30-2026** | 2026-11-19 freeze | **High** |
| Financials_Quarterly · **Balance Sheet** | 98 × 43 | Quarterly balance sheet | Jun-30-2016 → **Sep-30-2026** | 2026-11-19 freeze | **High** |
| Financials_Quarterly · **Ratios** | 161 × 43 | Quarterly margins, returns, working-capital ratios | Jun-30-2016 → **Sep-30-2026** | 2026-11-19 freeze | **High** |
| Financials_Quarterly · **Segments** | 72 × 43 | Segment / geographic revenue split (vendor view) | Jun-30-2016 → **Sep-30-2026** | 2026-11-19 freeze | **High** |
| Financials_Quarterly · **Supplemental** | 35 × 43 | Supplemental items (capex, SBC, D&A detail) | Jun-30-2016 → **Sep-30-2026** | 2026-11-19 freeze | Medium |
| Financials_Quarterly · **Key Stats** | 91 × 13 | Headline stats snapshot | Latest periods through **Sep-30-2026** | 2026-11-19 freeze | Medium |
| Financials_Quarterly · **Capital Structure Summary** | 74 × 85 | Debt / equity composition by quarter | Through **Sep-30-2026** | 2026-11-19 freeze | Medium |
| Financials_Quarterly · **Capital Structure Details** | 38 × 10 | As-reported debt detail (principal × maturity × rate) | Latest as-reported block | 2026-11-19 freeze | Medium |
| Financials_Quarterly · **Historical Capitalization** | 39 × 43 | Market cap / TEV history | Through **Sep-30-2026** | 2026-11-19 freeze | Low |
| Financials_Quarterly · **Multiples** | 91 × 42 | Trailing valuation multiples by quarter | Through the 2026-11 export | 2026-11-19 freeze | Low (valuation) |
| Financials_Quarterly · **Industry Specific** | 15 × 6 | Industry-specific lines (20 populated cells — near-empty) | n/a | 2026-11-19 freeze | Low |
| Financials_Quarterly · **Pension OPEB** | 15 × 6 | Pension / OPEB (20 populated cells — near-empty) | n/a | 2026-11-19 freeze | Low |

### 1.4 Workbook tabs — `Take Two Interactive Software Inc NasdaqGS TTWO Financials_Annual.xls` (309 KB, 13 tabs)

| Parent file · Sheet | Rows × Cols | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| Financials_Annual · **Income Statement** | 119 × 12 | Annual P&L (USD m) | **FY2017 (Mar-31-2017) → FY2026 (Mar-31-2026)** + **LTM Sep-30-2026** | 2026-11-19 freeze | **High** |
| Financials_Annual · **Cash Flow** | 74 × 12 | Annual cash flow statement | FY2017 → FY2026 + LTM Sep-30-2026 | 2026-11-19 freeze | **High** |
| Financials_Annual · **Balance Sheet** | 97 × 12 | Annual balance sheet | FY2017 → FY2026 + Sep-30-2026 | 2026-11-19 freeze | **High** |
| Financials_Annual · **Ratios** | 161 × 12 | Annual margins, returns, conversion ratios | FY2017 → FY2026 + LTM | 2026-11-19 freeze | **High** |
| Financials_Annual · **Segments** | 76 × 11 | Segment / geographic revenue (vendor view) | FY2017 → FY2026 | 2026-11-19 freeze | **High** |
| Financials_Annual · **Supplemental** | 67 × 11 | Capex, SBC, D&A, other supplemental | FY2017 → FY2026 | 2026-11-19 freeze | Medium |
| Financials_Annual · **Key Stats** | 91 × 13 | Headline stats snapshot | Through FY2026 / LTM | 2026-11-19 freeze | Medium |
| Financials_Annual · **Capital Structure Summary** | 99 × 23 | Annual debt / equity composition | Through FY2026 | 2026-11-19 freeze | Medium |
| Financials_Annual · **Capital Structure Details** | 38 × 10 | As-reported debt detail by maturity | Latest as-reported block (from 2026-03-31) | 2026-11-19 freeze | Medium |
| Financials_Annual · **Historical Capitalization** | 39 × 43 | Market cap / TEV history | Through the 2026-11 export | 2026-11-19 freeze | Low |
| Financials_Annual · **Multiples** | 90 × 42 | Trailing valuation multiples | Through the 2026-11 export | 2026-11-19 freeze | Low (valuation) |
| Financials_Annual · **Industry Specific** | 15 × 6 | Industry-specific lines (20 cells — near-empty) | n/a | 2026-11-19 freeze | Low |
| Financials_Annual · **Pension OPEB** | 21 × 11 | Pension / OPEB (65 cells — sparse) | Through FY2026 | 2026-11-19 freeze | Low |

### 1.5 Workbook tabs — `Company Comparable Analysis Take Two Interactive Software Inc.xls` (145 KB, 8 tabs)

| Parent file · Sheet | Rows × Cols | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| Comps · **Financial Data** | 50 × 17 | Peer + subject financial data; carries subject **Day Close Price $216.61** and **shares outstanding 187.2m**, as-of **2026-11-19** | as-of 2026-11-19 | 2026-11-19 freeze | Medium (price anchor for `99`) |
| Comps · **Trading Multiples** | 50 × 9 | Peer trading multiples (subject TEV/EBITDA 52.2x vs peer median 13.0x) | as-of 2026-11-19 | 2026-11-19 freeze | Low (valuation) |
| Comps · **Operating Statistics** | 50 × 13 | Peer operating stats (growth, margins) | as-of 2026-11-19 | 2026-11-19 freeze | Medium |
| Comps · **Business Description** | 44 × 3 | Peer-set business descriptions | n/a | 2026-11-19 freeze | Low |
| Comps · **Implied Valuation** | 69 × 9 | Implied valuation from peer multiples | as-of 2026-11-19 | 2026-11-19 freeze | Low (valuation, out of module scope) |
| Comps · **Credit Health Panel** | 48 × 10 | Peer credit-health comparison | as-of 2026-11-19 | 2026-11-19 freeze | Low |
| Comps · **Valuation Chart** | 32 × 2 | Chart data (11 cells) | n/a | 2026-11-19 freeze | Low |
| Comps · **Disclaimer** | 26 × 1 | Vendor disclaimer | n/a | 2026-11-19 freeze | Low |

### 1.6 Workbook tabs — `Take Two Interactive Software Inc NasdaqGS TTWO Credit Health Panel.xls` (230 KB, 6 tabs)

| Parent file · Sheet | Rows × Cols | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| Credit Health Panel · **Financials** | 40 × 13 | Credit-view financial summary | Through the latest reported period (Sep-30-2026) | 2026-11-19 freeze | Medium |
| Credit Health Panel · **Summary** | 46 × 11 | Credit-health scores / summary | as-of the 2026-11 export | 2026-11-19 freeze | Low |
| Credit Health Panel · **Operational Metrics Charts** | 21 × 19 | Chart data (13 cells) | n/a | 2026-11-19 freeze | Low |
| Credit Health Panel · **Solvency Metrics Charts** | 18 × 19 | Chart data (8 cells) | n/a | 2026-11-19 freeze | Low |
| Credit Health Panel · **Liquidity Metrics Charts** | 15 × 19 | Chart data (6 cells) | n/a | 2026-11-19 freeze | Low |
| Credit Health Panel · **Disclaimer** | 26 × 1 | Vendor disclaimer | n/a | 2026-11-19 freeze | Low |

### 1.7 Workbook tabs — `Short_Interest_Charting Excel Export Nov-19-2026 2_50 AM.xls` (100 KB, 2 tabs)

| Parent file · Sheet | Rows × Cols | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| Short Interest · **Chart 1 with Data** | 284 × 2 | Data export — short interest as % of shares outstanding, daily | **2025-11-19 → 2026-11-18** (last value 4.96%) | 2026-11-19 freeze | Low (positioning, not earnings) |
| Short Interest · **Attributions** | 45 × 1 | Vendor attribution text (13 cells) | n/a | 2026-11-19 freeze | Low |

### 1.8 Workbook tabs — single-tab CIQ exports (10 tabs)

| Parent file · Sheet | Rows × Cols | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| `…TTWO Events Calendar.xls` · **Events Calendar** | 16 × 3 | Data export — event dates | **Timeframe November 2026**: earnings release + call **2026-11-09**, BMO conference 2026-11-12 | 2026-11-19 freeze | Medium (next-catalyst dating; note the FQ3 FY27 release date **2027-02-09** comes from the EstimatesReport header) |
| `…TTWO Customers.xls` · **Customers** | 30 × 8 | Data export — disclosed customers (tier-5 vendor view) | Recently disclosed relationships only | 2026-11-19 freeze | Medium (revenue-concentration context) |
| `…TTWO Suppliers.xls` · **Suppliers** | 28 × 8 | Data export — disclosed suppliers (tier-5 vendor view) | Recently disclosed relationships only | 2026-11-19 freeze | Medium (cost-driver context) |
| `…TTWO Strategic Alliances.xls` · **Strategic Alliances** | 22 × 7 | Data export — alliances / licences | As disclosed | 2026-11-19 freeze | Medium (licence-driven revenue, e.g. sports licences) |
| `…TTWO Auditors.xls` · **Auditors** | 75 × 6 | Data export — auditor history | Historical through 2026 | 2026-11-19 freeze | Low (earnings-quality context) |
| `…TTWO Board Members.xls` · **Board Members** | 28 × 25 | Data export — board roster | Current | 2026-11-19 freeze | Low (governance module) |
| `…TTWO Professionals.xls` · **Professionals** | 24 × 24 | Data export — senior management roster | Current | 2026-11-19 freeze | Low |
| `…TTWO Public Ownership History.xls` · **History** | 1,835 × 6 | Data export — institutional holdings by period | **2025-12-31 → 2026-09-30** | 2026-11-19 freeze | Low |
| `…TTWO Public Ownership Insider Trading.xls` · **Insider Trading** | 5,058 × 11 | Data export — insider transactions | Full history; trailing-12m window to **2026-10-05** | 2026-11-19 freeze | Low (red-flag context) |
| `…TTWO Investment Analysis Direct Investments.xls` · **Direct Investments** | 173 × 21 | Data export — direct investments / M&A history | Historical | 2026-11-19 freeze | Low |

### 1.9 Workbook tabs — low/no-value and contaminant rows (4 tabs)

| Parent file · Sheet | Rows × Cols | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| `…TTWO Investment Analysis Co Investors.xls` · **Co-Investors** | 90 × 3 | Data export — co-investor list | Historical | 2026-11-19 freeze | Low |
| `Take-Two_Interactive_Software_Inc_-_Form_DEF_14A(Jul-27-2026).xls` · **No Data** | 4 × 4 (**1 populated cell**) | Proxy export — **empty payload**, extraction status `ok` but the only content is the literal string "This filing has no tabular data to export." The DEF 14A dated **2026-07-27** is referenced but its substance is NOT in the pool | Nominally 2026-07-27 | 2026-11-19 freeze | Low for earnings (governance/pay gap, owned by the management-governance module, not this one) |
| `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` · **Key Developments** | 520 × 7 | **Wrong-company pool contaminant** — this is **Alphabet Inc. (NasdaqGS:GOOGL)** Key Developments, last 6 months, including current subsidiaries. It is not TTWO evidence and must not be cited as TTWO's | GOOGL, last 6 months to 2026-11 | 2026-11-19 freeze | **None for TTWO** — do not use |
| *(reconciliation)* | | | | | 73 rows total = 11 documents + 62 tabs, matching manifest `extracts_written: 73` |

**Note — no `## 1A. External Data` section.** The pool contains no `external/` subfolder and no manifest row carries `external: true` or a `provenance` object. There is no alt-data, expert-call, channel-check, or broker-research document in this pool, so nothing external influenced (or could influence) the sufficiency verdict.

**Note — `relationships.json` is present** in the frozen generation (90 KB, parsed from the Customers/Suppliers exports). It is a tier-5 vendor export covering only recently disclosed relationships, never a filing, and any `likely_group` entity in it is not arm's-length.

---

## 2. Most Recent Sources

Age measured from the period covered (or the document date, where that is the meaningful anchor) to today, 2026-11-19.

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | `10K_2025_26_0001628280-26-037434.pdf` | FY2026, year ended **2026-03-31** | **7.6** |
| Quarterly filing | `10Q_2Q_0001628280-26-072254.pdf` | Q2 FY2027, quarter ended **2026-09-30** | **1.6** |
| Earnings transcript | `Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf` — **verbatim** CIQ transcript, Presentation + Q&A | Q2 FY2027 call, **2026-11-09** | **0.3** |
| Investor deck | `Take-Two_Interactive_2Q FY27 FINAL.pdf` | Q2 FY2027 results & guidance summary, **2026-11-09** | **0.3** |
| Consensus / estimate export | `Take-TwoInteractiveSoftware,IncNasdaqGSTTWOEstimatesReport.xls` (7 tabs) | Forward set to FY2029; latest revision event **2026-11-18**; consensus refreshed post-print | **~0.03** (≈1 day) |
| Cash flow data | `10Q_2Q_0001628280-26-072254.pdf` (Condensed Consolidated Statements of Cash Flows, six months ended 2026-09-30) + `10K_2025_26…pdf` (FY2026/25/24) + CIQ `Financials_Quarterly · Cash Flow` and `Financials_Annual · Cash Flow` | Through **2026-09-30** (quarterly) and FY2026 (audited) | **1.6** |
| Guidance data | `TTWO 2Q27 Earnings Release FINAL.pdf` ("Outlook for Fiscal Year 2027" — GAAP revenue, net income, diluted EPS, CFO, capex, non-GAAP EBITDA, Net Bookings; plus initial Q3 FY27) + `EstimatesReport · Guidance` tab (guidance key development dated 2026-11-09) | FY2027 and Q3 FY2027, issued **2026-11-09** | **0.3** |
| *(supplementary)* Earnings press release | `TTWO 2Q27 Earnings Release FINAL.pdf` — primary numbers/official-guidance anchor; NOT a transcript and NOT a call source | Q2 FY2027, **2026-11-09** | **0.3** |

**Staleness read:** nothing material is stale. The latest closed quarter (Q2 FY27, ended 2026-09-30) has its 10-Q, its press release, its deck, and its verbatim transcript all in the pool, and the consensus export was refreshed *after* that print (revision events dated 2026-11-13 and 2026-11-18). The consensus-staleness cap in `MODULE_RULES.md` does **not** trigger.

---

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | **Y** | `FY26 10-K, Consolidated Statements of Operations`; `Q2 FY27 10-Q, Condensed Consolidated Statements of Operations`; `Capital IQ Financials_Annual · Income Statement` (FY2017→FY2026 + LTM Sep-30-2026); `Capital IQ Financials_Quarterly · Income Statement` (42 quarters) | Needed for revenue, margin, EPS |
| Balance sheet | **Y** | `FY26 10-K, Consolidated Balance Sheets`; `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`; CIQ `Financials_Quarterly · Balance Sheet` and `Financials_Annual · Balance Sheet` | Needed for working capital and leverage |
| Cash flow statement | **Y** | `FY26 10-K, Consolidated Statements of Cash Flows` (FY2026/2025/2024); `Q2 FY27 10-Q, Condensed Consolidated Statements of Cash Flows` (six months ended 2026-09-30); CIQ `Financials_Quarterly · Cash Flow`, `Financials_Annual · Cash Flow`. `ciq_facts.json` pins LTM CFO **$367.1m** and LTM levered FCF **$787.6m** (levered basis — after interest, NOT the §15 CFO−capex definition; downstream must compute CFO−capex itself) | Needed for CFO, FCF, earnings quality |
| Latest quarter | **Y** | Q2 FY27 ended 2026-09-30 — `10Q_2Q` + `TTWO 2Q27 Earnings Release` + Q2 FY27 deck + verbatim Q2 FY27 transcript | Needed for trend and setup |
| Last 8 quarters | **Y** — far more: ~42 standalone quarters | `Capital IQ Financials_Quarterly · Income Statement` / `Cash Flow` / `Balance Sheet` / `Ratios`, FQ1 2017 (Jun-30-2016) → FQ2 2027 (Sep-30-2026) | Needed for seasonality and inflection |
| Consensus estimates | **Y** | `EstimatesReport · Consensus` (604 × 123; FQ3 2027, FY2027–FY2029). Transcript header block prints the live set: FQ2 2027 EPS consensus 0.97 vs actual 1.00; FQ3 2027 EPS 3.09, FY2027 3.92, FY2028 6.98 [`Q2 2027 Earnings Call transcript, Nov 09 2026, S&P Global MI Estimates header`] | Needed for market bar |
| Estimate revisions | **Y** | `EstimatesReport · Revisions` (467 × 21; last-month breadth) + `Recent Changes` (265 × 10, event-level, latest 2026-11-18) + `Trends` (303 × 21). `ciq_facts.json`: FY2027 EPS (GAAP) 9↑/2↓ last month; FY2027 revenue 6↑/9↓ last month | Needed for revision momentum |
| Earnings transcript | **Y — verbatim, two consecutive quarters** | `Q2 2027 Earnings Call, Nov 09, 2026.rtf` and `Q1 2027 Earnings Call, Aug 07, 2026.rtf` — both S&P Capital IQ transcripts with Call Participants, Presentation, and Question and Answer sections; executives named (Strauss Zelnick, Karl Slatoff, Lainie Goldstein, Nicole Shevins) plus sell-side analysts. No Rating/Target-Price verdict block, so these are **not** sell-side proxies | Needed for management tone and driver detail |
| Segment P&L | **Y, as disclosed — single-segment company, not a data gap** | "We have one operating and reportable segment" [`FY26 10-K, Item 1 / Note 21`]. `ciq_facts.json` segments: "Sale of Software Titles 6,656 (100%) of Total 6,656" [12 months Mar-31-2026]. Revenue IS disaggregated and usable: by content (recurrent consumer spending $1,210.2m = 81% vs full game and other $286.8m), by platform (Mobile $731.1m / 49%, Console $615.4m / 41%, PC and other $150.5m / 10%), by distribution channel (digital online 97.9% of net revenue), and by geography (US $3,940m / 59%, International $2,716m / 41% for FY2026) [`Q2 FY27 10-Q, Disaggregation of Revenue`; `TTWO 2Q27 Earnings Release, "Net Revenue and Net Bookings by Content, Platform Mix, Distribution Channel, and Geographic Region"`; `ciq_facts.json` geographic] | Needed for mix shift |
| Current price | **Y** | **USD 216.61**, CIQ Comps · Financial Data "Day Close Price Latest" (subject row) as-of **2026-11-19**; shares outstanding 187.2m [`ciq_facts.json` → `current_price`, `shares_outstanding_m`] | Needed only for master-level stock reaction context |

All 10 rows resolve Y. Nothing in the usability table is absent.

---

## 4. Cross-Module Availability

Checked against the actual filesystem at `analyses/TTWO_2026-11-19/business-model/`.

| Business-Model Output | Available? (Y/N) |
|---|---|
| `03_segment-map.md` | **Y** (20,774 bytes) |
| `06_value-chain.md` | **Y** (31,386 bytes) |
| `10_external-dependency.md` | **Y** (34,530 bytes) |

The business-model module appears to have run to completion: all 14 agent outputs (`00`–`12`, `99_business-model-synthesis.md`) plus `business-model_dossier.md` are present. Downstream earnings agents should read `03_segment-map.md` before writing their own segment read, `06_value-chain.md` for pricing-power context, and `10_external-dependency.md` for the external-variable and cyclicality read — and must reconcile against it rather than diverge silently (`MODULE_RULES.md` Cycle-Position Rule). No agent should emit the "Business-model module not available" disclaimer.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | **N** | 04, 05, 99 | None. Consensus present AND fresh (7-tab EstimatesReport; revision events to 2026-11-18, after the 2026-11-09 Q2 FY27 print). Neither the no-consensus max-30 cap nor the staleness haircut triggers |
| No quarterly data | **N** | 01, 02, 03, 06 | None. ~42 standalone quarters (Jun-2016 → Sep-2026) plus two 10-Qs. QoQ, seasonality, and TTM are all computable; the clarity max-60 cap does not bind |
| No VERBATIM transcript, sell-side proxy present | **N** | 02, 03, 04 | None. Two verbatim CIQ transcripts (Q1 and Q2 FY27). Tone and candor ARE assessable from the actual Q&A, so no proxy clarity cap and no management-governance `06` candor cap arise from this module's pool |
| No transcript AND no sell-side proxy | **N** | 02, 03, 04 | None. Verbatim transcripts present; the clarity ≤70 no-call cap does not bind |
| No segment-level P&L | **N** | 02, 03, 99 | None. The company discloses **one operating and reportable segment** [`FY26 10-K, Note 21`] — the single-segment path in the Segment-Level Rule, not a disclosure gap. The "no segment P&L for a **multi-segment** business" clarity ≤70 cap is not triggered. Agents `02`/`03` must state the single-segment fact and then decompose on the disclosed axes (content / platform / distribution channel / geography), which are fully available |
| No cash flow statement | **N** | 06, 99 | None. Audited FY2026 and interim six-month-to-Sep-2026 cash flow statements plus full CIQ cash-flow history. The earnings-quality max-45 cap does not bind |
| No current price | **N** | 99 | None. USD 216.61 as-of 2026-11-19 (CIQ Comps · Financial Data) |

**No score cap from this module's data pool binds.** Three pool-hygiene items are recorded, none of which is a sufficiency gap for the earnings module:
1. **Wrong-company contaminant.** `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is Alphabet's data, not Take-Two's. Every downstream agent must ignore it; citing it as TTWO evidence would be a §20 bad-source error.
2. **Empty proxy export.** The DEF 14A (2026-07-27) workbook extracted successfully but contains one cell — "This filing has no tabular data to export." The proxy's substance (pay, governance) is therefore not in the pool. That is a management-governance input, not an earnings input; it is flagged for that module, not capped here.
3. **No TTWO Key Developments export.** There is no TTWO equivalent of the (mis-ticketed) Key Developments file, so intra-quarter announcement flow between the 2026-11-09 print and today is not covered by a structured export. The Events Calendar covers November 2026 only, and the next scheduled earnings date (FQ3 FY27, **2027-02-09**) comes from the EstimatesReport header rather than the calendar tab. Immaterial to revenue/margin/cash-flow analysis.

---

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool carries a recent audited annual filing (FY2026 10-K, year ended 2026-03-31, 7.6 months old), the latest quarterly filing (Q2 FY27 10-Q, quarter ended 2026-09-30, 1.6 months old) **and** a verbatim earnings-call transcript for that same quarter, with income statement, balance sheet, and cash flow statement all available from both the filings and ~42 quarters of Capital IQ history — plus fresh consensus, revision breadth, company guidance on both GAAP and Net Bookings bases, and a current price.
- **Active partial-data caps:** none — no partial-data flag in Section 5 resolves Y, and no score cap in `MODULE_RULES.md` is triggered by the data pool. (Caps may still arise later from analytical findings, e.g. absent sensitivity disclosures forcing Low confidence on earnings volatility, or an unresolved source conflict capping overall usefulness at 65 — but none is pre-bound by data availability.)
- **Critical missing items:** none for this module. For completeness, two non-blocking items: the DEF 14A payload is empty (a management-governance input), and one pool file belongs to a different issuer (Alphabet/GOOGL) and must not be cited as TTWO evidence.
- **Data quality read for `99`:** the evidence base supports the top sufficiency band — primary audited and interim filings, two verbatim transcripts, a complete 7-tab consensus/estimates export refreshed one day before this run, and a decade of annual plus ~42 quarters of vendor-normalised history. The one standing analytical hazard is not missing data but a basis trap: consensus "revenue" for TTWO is tracked on the company's **Net Bookings** metric ($1,601.3m vendor actual for Q2 FY27) while the GAAP line is **net revenue** ($1.50bn), and FY27 guidance is issued on both bases ($7,980–8,180m GAAP revenue vs $8,000–8,200m Net Bookings). Every beat/miss and growth comparison downstream must name its basis and must not mix the two (§15).
