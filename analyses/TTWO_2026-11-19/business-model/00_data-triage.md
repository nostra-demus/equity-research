# Data Triage — TTWO

**Evidence binding (frozen):** `NOSTRA_FROZEN_EVIDENCE_ROOT` was present with the complete quartet, so `DATA_PATH` is the frozen evidence root and `data/TTWO/` is a citation label only. No extractor was run, no live `data/TTWO/` read, no rebuild. Every read below came from the bound generation `.extract-generations/0af6384…3203d` (`manifest.json`, `ciq_facts.json`, `relationships.json`, and the per-tab extracts inside it).

**Manifest totals:** 30 source files · 19 workbooks · 62 tabs · 73 extracts written · **0 failures**. No source carries `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer` status, so nothing in the pool is in a failure state and no extraction-failure cap applies.

**On the "Last Modified" column (fix F23):** every file in the frozen copy carries the same filesystem timestamp (2026-11-19 18:43), which is the freeze time, not a document date. That column is therefore recorded as `freeze` and is analytically useless. The **Period Covered** column is parsed from INSIDE each document (period-end line, "as-of" line, fiscal-year header, first/last data row) and is the only date basis used for the verdict.

**No external research:** there is no `external/` subfolder in the pool and no manifest row carries `external: true` or a `provenance` object. There is nothing to list in a `1A. External Data` section, and no external document influenced the verdict.

---

## 1. File Inventory

73 rows = 8 PDFs + 3 standalone documents (RTF) + 62 workbook tabs. Every multi-tab workbook is split into one row per tab (parent file · sheet · rows×cols), reconciled 1:1 against `manifest.json`.

| Filename | Type | Period Covered | Last Modified | Notes |
|---|---|---|---|---|
| `10K_2025_26_0001628280-26-037434.pdf` | Annual filing (10-K) | FY2026 — fiscal year ended **March 31, 2026**; signed/filed May 11, 2026 | freeze | 170 pages, native text extraction, 797,722 chars. Most recent annual filing. Auditor opinion covers "each of the three years in the period ended March 31, 2026, in conformity with U.S. GAAP" |
| `10K_2024_25_0001628280-25-026694.pdf` | Annual filing (10-K) | FY2025 — fiscal year ended **March 31, 2025**; filed May 5, 2025 | freeze | 274 pages, 1,217,665 chars. Gives a second audited annual year for multi-year work |
| `10Q_2Q_0001628280-26-072254.pdf` | Quarterly filing (10-Q) | Q2 FY2027 — quarter ended **September 30, 2026**; signed November 9, 2026 | freeze | 72 pages, 317,624 chars. Most recent SEC filing of any kind. States Grand Theft Auto VI releases November 19, 2026 |
| `10Q_1Q_0001628280-26-054870.pdf` | Quarterly filing (10-Q) | Q1 FY2027 — quarter ended **June 30, 2026**; filed August 7, 2026 | freeze | 38 pages, 170,244 chars |
| `TTWO 2Q27 Earnings Release FINAL.pdf` | Quarterly earnings release (8-K Ex.99.1) | Q2 FY2027; dated **November 9, 2026** | freeze | 14 pages. Q2 Net Bookings $1.60bn; FY27 Net Bookings outlook reiterated at $8.0–8.2bn |
| `TTWO 1Q27 Earnings Release FINAL 8-6-2026.pdf` | Quarterly earnings release (8-K Ex.99.1) | Q1 FY2027; dated **August 7, 2026** | freeze | 12 pages. Q1 Net Bookings $1.39bn, "slightly above Company's guidance range" |
| `Take-Two_Interactive_2Q FY27 FINAL.pdf` | Investor deck | Q2 FY2027 results & guidance summary (published with the Nov 9, 2026 release) | freeze | 16 pages, 21,567 chars |
| `Take-Two_Interactive_1Q FY27 FINAL.pdf` | Investor deck | Q1 FY2027 results & guidance summary (published with the Aug 7, 2026 release) | freeze | 16 pages, 19,185 chars |
| `Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf` | Earnings transcript | Q2 FY2027 call, **November 9, 2026** | freeze | 53,711 chars. Manifest note: OLE2 container, read as document, not a workbook. Most recent transcript |
| `Take-Two Interactive Software, Inc., Q1 2027 Earnings Call, Aug 07, 2026.rtf` | Earnings transcript | Q1 FY2027 call, **August 7, 2026** | freeze | 60,302 chars |
| `Take Two Interactive Software Inc NasdaqGS TTWO Public Company Profile.rtf` | Data export (Capital IQ company profile) | Current snapshot, undated inside the file; 12,909 employees, founded 1993 | freeze | 31,362 chars. Business description, franchises, labels |
| `…Financials_Annual.xls` · **Key Stats** | Data export (CIQ annual financials) | Annual columns through FY ended **Mar-31-2026** | freeze | 91×13 |
| `…Financials_Annual.xls` · **Income Statement** | Data export (CIQ annual financials) | Mar-31-2017 (reclassified) → **Mar-31-2026** | freeze | 119×12; reported currency, USD millions |
| `…Financials_Annual.xls` · **Balance Sheet** | Data export (CIQ annual financials) | Annual through **Mar-31-2026** | freeze | 97×12 |
| `…Financials_Annual.xls` · **Cash Flow** | Data export (CIQ annual financials) | Annual through **Mar-31-2026** | freeze | 74×12 |
| `…Financials_Annual.xls` · **Multiples** | Data export (CIQ valuation) | Annual/period columns through Nov-2026 close | freeze | 90×42 |
| `…Financials_Annual.xls` · **Historical Capitalization** | Data export (CIQ capital structure) | Annual through **Mar-31-2026** | freeze | 39×43 |
| `…Financials_Annual.xls` · **Capital Structure Summary** | Data export (CIQ debt) | Annual through **Mar-31-2026** | freeze | 99×23 |
| `…Financials_Annual.xls` · **Capital Structure Details** | Data export (CIQ debt) | Latest as-reported block, principal by maturity, as of **Mar-31-2026** | freeze | 38×10. Feeds the `debt_maturity_wall` fact |
| `…Financials_Annual.xls` · **Ratios** | Data export (CIQ ratios) | Annual through **Mar-31-2026** | freeze | 161×12 |
| `…Financials_Annual.xls` · **Supplemental** | Data export (CIQ) | Annual through **Mar-31-2026** | freeze | 67×11 |
| `…Financials_Annual.xls` · **Industry Specific** | Data export (CIQ) | Annual; near-empty (20 populated cells) | freeze | 15×6. Effectively no content |
| `…Financials_Annual.xls` · **Pension OPEB** | Data export (CIQ) | Annual; sparse (65 cells) | freeze | 21×11 |
| `…Financials_Annual.xls` · **Segments** | Data export (CIQ segment + geography) | Annual through **Mar-31-2026** | freeze | 76×11. Single product segment; US 59% / International 41% of FY26 revenue |
| `…Financials_Quarterly.xls` · **Key Stats** | Data export (CIQ quarterly financials) | Quarterly through **Sep-30-2026** | freeze | 91×13 |
| `…Financials_Quarterly.xls` · **Income Statement** | Data export (CIQ quarterly financials) | Quarterly through **Sep-30-2026** (incl. LTM) | freeze | 116×43 |
| `…Financials_Quarterly.xls` · **Balance Sheet** | Data export (CIQ quarterly financials) | Quarterly through **Sep-30-2026** | freeze | 98×43 |
| `…Financials_Quarterly.xls` · **Cash Flow** | Data export (CIQ quarterly financials) | Quarterly through **Sep-30-2026** | freeze | 73×43 |
| `…Financials_Quarterly.xls` · **Multiples** | Data export (CIQ valuation) | 39 quarterly closes through Nov-2026 | freeze | 91×42 |
| `…Financials_Quarterly.xls` · **Historical Capitalization** | Data export (CIQ capital structure) | Quarterly through **Sep-30-2026** | freeze | 39×43 |
| `…Financials_Quarterly.xls` · **Capital Structure Summary** | Data export (CIQ debt) | Quarterly through **Sep-30-2026** | freeze | 74×85 |
| `…Financials_Quarterly.xls` · **Capital Structure Details** | Data export (CIQ debt) | Latest as-reported block | freeze | 38×10 |
| `…Financials_Quarterly.xls` · **Ratios** | Data export (CIQ ratios) | Quarterly through **Sep-30-2026** | freeze | 161×43 |
| `…Financials_Quarterly.xls` · **Supplemental** | Data export (CIQ) | Quarterly through **Sep-30-2026** | freeze | 35×43 |
| `…Financials_Quarterly.xls` · **Industry Specific** | Data export (CIQ) | Quarterly; near-empty (20 cells) | freeze | 15×6 |
| `…Financials_Quarterly.xls` · **Pension OPEB** | Data export (CIQ) | Quarterly; near-empty (20 cells) | freeze | 15×6 |
| `…Financials_Quarterly.xls` · **Segments** | Data export (CIQ segment + geography) | Quarterly through **Sep-30-2026** | freeze | 72×43 |
| `…EstimatesReport.xls` · **Consensus** | Data export (CIQ estimates) | Current fiscal year end **Mar-31-2027**; next release flagged Feb-09-2027 | freeze | 604×123. Target price mean USD 283.93 / median 289.00 |
| `…EstimatesReport.xls` · **Recent Changes** | Data export (CIQ estimates) | Recent analyst changes into **Nov-2026** | freeze | 265×10 |
| `…EstimatesReport.xls` · **Guidance** | Data export (CIQ guidance history) | FY2002 → FY2027 guidance history | freeze | 198×117 |
| `…EstimatesReport.xls` · **Multiples** | Data export (CIQ forward multiples) | Forward periods from **Nov-2026** | freeze | 34×7 |
| `…EstimatesReport.xls` · **Surprise** | Data export (CIQ beat/miss history) | Through FY2026 annual / latest reported quarter | freeze | 311×113 |
| `…EstimatesReport.xls` · **Trends** | Data export (CIQ estimate trends) | Through **Nov-2026** | freeze | 303×21 |
| `…EstimatesReport.xls` · **Revisions** | Data export (CIQ revision breadth) | Last-month breadth as of **Nov-2026** | freeze | 467×21. FY27 EPS 9↑/2↓; FY27 revenue 6↑/9↓ |
| `Company Comparable Analysis…xls` · **Financial Data** | Data export (CIQ comps) | **As-Of Date 2026-11-19** (stated inside the tab) | freeze | 50×17. Day close USD 216.61; shares out 187.2m |
| `Company Comparable Analysis…xls` · **Trading Multiples** | Data export (CIQ comps) | As-of **2026-11-19** | freeze | 50×9. Subject TEV/EBITDA 52.2x vs peer median 13.0x |
| `Company Comparable Analysis…xls` · **Operating Statistics** | Data export (CIQ comps) | As-of **2026-11-19** | freeze | 50×13 |
| `Company Comparable Analysis…xls` · **Business Description** | Data export (CIQ comps) | As-of **2026-11-19** | freeze | 44×3. Peer-set business descriptions |
| `Company Comparable Analysis…xls` · **Implied Valuation** | Data export (CIQ comps) | As-of **2026-11-19** | freeze | 69×9 |
| `Company Comparable Analysis…xls` · **Valuation Chart** | Data export (CIQ comps) | As-of **2026-11-19** | freeze | 32×2; 11 populated cells only |
| `Company Comparable Analysis…xls` · **Credit Health Panel** | Data export (CIQ comps) | As-of **2026-11-19** | freeze | 48×10 |
| `Company Comparable Analysis…xls` · **Disclaimer** | Other (vendor disclaimer) | n/a | freeze | 26×1. No analytical content |
| `…Credit Health Panel.xls` · **Summary** | Data export (CIQ credit) | Current snapshot | freeze | 46×11. Overall relative credit-health score "Bottom"; operational and solvency categories "Bottom" |
| `…Credit Health Panel.xls` · **Financials** | Data export (CIQ credit) | Current snapshot | freeze | 40×13 |
| `…Credit Health Panel.xls` · **Operational Metrics Charts** | Data export (CIQ credit) | Current snapshot | freeze | 21×19; 13 cells — chart shell, almost no data |
| `…Credit Health Panel.xls` · **Solvency Metrics Charts** | Data export (CIQ credit) | Current snapshot | freeze | 18×19; 8 cells — chart shell |
| `…Credit Health Panel.xls` · **Liquidity Metrics Charts** | Data export (CIQ credit) | Current snapshot | freeze | 15×19; 6 cells — chart shell |
| `…Credit Health Panel.xls` · **Disclaimer** | Other (vendor disclaimer) | n/a | freeze | 26×1 |
| `…Customers.xls` · **Customers** | **Business-relationship export (CIQ Customers)** | "Recently disclosed customers only (within the last two years)"; "Include Customers for: Current subsidiaries" | freeze | 30×8, 15 relationship rows. Parsed into `relationships.json`: across both views, **28 disclosed relationship rows / 28 named entities, of which 19 are genuine outside parties and 9 of those are listed** (7 listed customers, 2 listed suppliers); 0 intra-group rows (0.0% intragroup row share), 4 rows and 3 entities flagged `likely_group` and must be treated as related until a filing says otherwise. Scope is the vendor's own two-year recently-disclosed window, not the full customer base. Tier-5 vendor export, enrichment only — it did not move the verdict and its limits are not a gap |
| `…Suppliers.xls` · **Suppliers** | **Business-relationship export (CIQ Suppliers)** | "Recently disclosed suppliers only (within the last two years)"; "Include Suppliers for: Current subsidiaries" | freeze | 28×8, 13 relationship rows. Same graph and same scope limit as the Customers row above; exchanges represented: AIM, HLSE, NASDAQCM, NASDAQGS, NYSE, TSE |
| `…Strategic Alliances.xls` · **Strategic Alliances** | Data export (CIQ relationships) | "Recently disclosed strategic alliances only (within the last two years)" | freeze | 22×7, 63 cells |
| `…Auditors.xls` · **Auditors** | Data export (CIQ governance) | Time frame **1996 → 2026**; FY2026 and FY2025 both Ernst & Young LLP, Unqualified | freeze | 75×6 |
| `…Board Members.xls` · **Board Members** | Data export (CIQ governance) | Current board members, internal and external directors | freeze | 28×25 |
| `…Professionals.xls` · **Professionals** | Data export (CIQ governance) | Current professionals | freeze | 24×24 |
| `…Public Ownership History.xls` · **History** | Data export (CIQ ownership) | Quarterly periods **Dec-31-2025 → Sep-30-2026** | freeze | 1,835×6. Tracked institutional holdings 180.66m → 180.17m shares (−0.3%) |
| `…Public Ownership Insider Trading.xls` · **Insider Trading** | Data export (CIQ ownership) | Full history, last event **2026-10-05** | freeze | 5,058×11, 52,825 cells. Trailing-12m net −167,943 shares; open-market trailing-12m 0 buys / 16 sells |
| `…Investment Analysis Direct Investments.xls` · **Direct Investments** | Data export (CIQ) | Current investments and subsidiaries/operating units | freeze | 173×21 |
| `…Investment Analysis Co-Investors.xls` · **Co-Investors** | Data export (CIQ) | All years, including prior investments; 73 co-investors | freeze | 90×3 |
| `…Events Calendar.xls` · **Events Calendar** | Data export (CIQ calendar) | Timeframe **November 2026**; earnings release and call both Nov-09-2026 | freeze | 16×3 |
| `Short_Interest_Charting Excel Export Nov-19-2026 2_50 AM.xls` · **Chart 1 with Data** | Data export (CIQ market data) | Daily series **2025-11-19 → 2026-11-18** | freeze | 284×2. Short interest as % of shares outstanding: 4.06% at the start of the window, 4.96% on the last reading |
| `Short_Interest_Charting…xls` · **Attributions** | Other (vendor attribution) | n/a | freeze | 45×1; 13 cells |
| `Take-Two_Interactive_Software_Inc_-_Form_DEF_14A(Jul-27-2026).xls` · **No Data** | Data export (proxy export shell) | Labelled Jul-27-2026 | freeze | 4×4, **1 populated cell**: "This filing has no tabular data to export." Extraction status is `ok`, so this is NOT an extraction failure — it is a successfully extracted EMPTY export. **The proxy's actual content (DEF 14A, Jul 27 2026) is therefore not in the pool.** Matters for management-governance, not for this module |
| `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` · **Key Developments** | Data export — **WRONG ENTITY** | Time frame "Last 6 Months": rows dated **2026-06-22 → 2026-11-18**, for **Alphabet Inc. (NasdaqGS:GOOGL)** | freeze | 520×7. Manifest `entities` confirms the entity is "Alphabet Inc", not Take-Two. This is a misfiled export for a different issuer: it must NOT be read as TTWO evidence, and its presence means TTWO's own Key Developments export is absent from the pool |

---

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | `10K_2025_26_0001628280-26-037434.pdf` | FY2026, fiscal year ended March 31, 2026 (signed May 11, 2026) | 7.6 by period end; 6.3 since filing |
| Quarterly filing | `10Q_2Q_0001628280-26-072254.pdf` | Q2 FY2027, quarter ended September 30, 2026 (signed November 9, 2026) | 1.6 by period end; 0.3 since filing |
| Earnings transcript | `Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf` | Q2 FY2027 call, November 9, 2026 | 0.3 |
| Investor deck | `Take-Two_Interactive_2Q FY27 FINAL.pdf` | Q2 FY2027 results & guidance summary, published with the November 9, 2026 release | 0.3 |
| Data export | `Company Comparable Analysis Take Two Interactive Software Inc.xls` (8 tabs; stated As-Of Date 2026-11-19) | As of November 19, 2026 | 0.0 |

Supporting most-recent items not in the template rows: quarterly earnings release `TTWO 2Q27 Earnings Release FINAL.pdf` (November 9, 2026, age 0.3 months); CIQ quarterly financials current through the September 30, 2026 quarter; short-interest series current to November 18, 2026.

---

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States — NASDAQ Global Select Market, ticker TTWO; incorporated in Delaware | `FY26 10-K, cover page (Delaware, I.R.S. No. 51-0350842, Commission file number 001-34003)`; `Capital IQ Public Company Profile — "Ticker: TTWO (NasdaqGS)"` |
| Filing regime | **US SEC** — domestic filer: Form 10-K annual, Form 10-Q quarterly, 8-K material events, DEF 14A proxy | `FY26 10-K, cover ("Annual Report Pursuant to Section 13 or 15(d) of the Securities Exchange Act of 1934")`; `Q2 FY27 10-Q, cover ("For the quarterly period ended September 30, 2026")` |
| Reporting standard | **US GAAP** | `FY26 10-K, Report of Independent Registered Public Accounting Firm — "for each of the three years in the period ended March 31, 2026, in conformity with U.S. generally accepted accounting principles"`; `FY26 10-K, Note 1 (Basis of Presentation) — "in conformity with U.S. GAAP"` |
| Reporting currency + fiscal-year end | **USD**; fiscal year ends **March 31** (FY2026 = year ended March 31, 2026; FY2027 in progress, ends March 31, 2027) | `FY26 10-K, cover ("fiscal year ended March 31, 2026")`; `CIQ Financials_Annual → Income Statement header ("In Millions of the reported currency", USD)`; `CIQ Estimates → Consensus ("Current Fiscal Year End: Mar-31-2027")` |
| Document language(s) | **English only** — all 73 extracts are English | Manifest: all 30 sources `status: ok`, no non-English or OCR-fallback rows |

Downstream agents should apply CLAUDE.md §27 as the US/SEC branch of the map: read and cite 10-K / 10-Q / 8-K earnings releases / DEF 14A. The fiscal year ending March 31 is the trap to watch — "FY2026" here means the year to **March 31, 2026**, and FY2027 interim periods are standalone quarters (US 10-Q basis), not cumulative, so a vendor's standalone-quarter estimate is on the same basis the company actually reports.

---

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool holds an audited annual filing from within the last 18 months (FY2026 10-K, year ended March 31, 2026, signed May 11, 2026 — 7.6 months old by period end) plus three independent sources from within the last 6 months covering the same latest quarter (Q2 FY2027 10-Q for the quarter ended September 30, 2026; the November 9, 2026 earnings release and investor deck; and the November 9, 2026 earnings-call transcript), with zero extraction failures across 30 sources and 62 workbook tabs.
- **Non-blocking gaps (recorded, do not change the verdict):**
  - The DEF 14A export (`Take-Two_Interactive_Software_Inc_-_Form_DEF_14A(Jul-27-2026).xls`) extracted cleanly but contains one cell saying the filing has no tabular data. The proxy's actual content is absent from the pool. This bites management-governance (pay, board votes), not the business-model module, which has the Board Members, Professionals, and Auditors exports plus the 10-K's own governance sections.
  - `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is an export for a different issuer (Alphabet Inc., confirmed in the manifest `entities` block). It is off-subject and must not be cited as TTWO evidence; as a side effect, TTWO's own Key Developments / material-events timeline is not in the pool. Downstream agents needing material events should use the 10-K/10-Q and the two earnings releases instead.
  - Five vendor tabs are chart shells or disclaimers with almost no data (`Credit Health Panel` → Operational / Solvency / Liquidity Metrics Charts; two `Disclaimer` tabs), and four more are near-empty (`Industry Specific` and `Pension OPEB` in both the annual and quarterly financials workbooks, 20–65 populated cells each). They are listed for completeness and carry no analytical weight.
  - The Suppliers and Customers exports cover only the vendor's "recently disclosed … within the last two years" window for current subsidiaries. They prove a relationship exists, never its size, and 3 of the 28 named entities are flagged `likely_group` — treat those as related parties until a filing says otherwise.
