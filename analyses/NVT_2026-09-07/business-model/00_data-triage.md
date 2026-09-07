# Data Triage — NVT

**Evidence binding (frozen).** `NOSTRA_FROZEN_EVIDENCE_ROOT` is set and the full quartet is present, so this triage read the pool ONLY through the bound immutable generation `6db32848e0d72164c0dff886e716b9ce3758ef8fa6922d57e8af77b31aecd1e6`. The extractor was NOT run and the live `data/NVT/` path was NOT read — `data/NVT/` below is a citation label only. Manifest totals for that generation: **15 source files, 2 workbooks, 20 workbook tabs, 33 text extracts written, 0 extraction failures** (`manifest.json`, `totals`). `offline_extraction_complete: true`, `vision_mode: false`.

**On the "Last Modified" column (fix F23).** Every raw file in the frozen snapshot carries the same filesystem timestamp (2026-09-07 07:57) because that is the *sync/freeze* date, not the document's date. That timestamp is therefore useless and is not reported. The column below gives the **document's own date, parsed from inside the document** (filing/certification date, cover-page period, press-release dateline, or the export's own as-of), which is the only honest age measure.

---

## 1. File Inventory

33 rows = 13 single-document sources + 20 workbook tabs. Every one of the 15 manifest sources is represented; neither workbook is left as a single opaque row. All 33 extracts have manifest `status: ok` — there are **zero** `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer` rows, so nothing is being counted as present that the engine cannot actually read.

| Filename | Type | Period Covered | Last Modified (document's own date, from inside) | Notes |
|---|---|---|---|---|
| `data/NVT/nVent Electric plc, 2025.pdf` | Annual filing (Form 10-K) | Fiscal year ended **2024-12-31** | Auditor report / certification dated **2025-02-18** [FY24 10-K, Report of Independent Registered Public Accounting Firm] | 1.47 MB raw → 668,379 chars extracted; `status: ok`. Filename says "2025" but the cover page reads "For the Fiscal Year Ended December 31, **2024**" — the filename is the filing year, not the period. This is the **only company annual filing in the pool**. Full Item 1 Business, Item 1A Risk Factors, MD&A, segment note. |
| `data/NVT/nVent Electric plc, Q2 2026.pdf` | Quarterly filing (Form 10-Q) | Quarterly period ended **2026-06-30** (plus six months then ended) | Filed / certified **2026-07-31** [Q2 FY26 10-Q, Section 906 certification] | 930 KB raw → 165,797 chars; `status: ok`. Most recent company filing of any kind in the pool. |
| `data/NVT/nVent Electric plc, Q1 2026.pdf` | Quarterly filing (Form 10-Q) | Quarterly period ended **2026-03-31** | Filed / certified **2026-05-01** [Q1 FY26 10-Q, Section 906 certification] | 497 KB raw → 166,358 chars; `status: ok`. |
| `data/NVT/nVent Electric plc, 2026.pdf` | Quarterly filing (Form 10-Q) — **duplicate** | Quarterly period ended **2026-03-31** | Filed / certified **2026-05-01** [Q1 FY26 10-Q, Section 906 certification] | 848 KB raw → 151,606 chars; `status: ok`. Cover page and CFO certification are identical to `Q1 2026.pdf` (same period, same 2026-05-01 date, same CFO Gary L. Corona). Two renderings of the **same** Q1 FY26 10-Q; extracted lengths differ (151,606 vs 166,358 chars) only through PDF text-layer differences. Downstream agents: treat as one filing, do not double-count. |
| `data/NVT/nVent Electric plc, 2026 rev.pdf` | Annual filing (Form 11-K — **employee benefit plan, not the company**) | Plan fiscal year ended **2025-12-31** | Signed **2026-06-23** [FY25 Form 11-K] | 139 KB raw → 49,856 chars; `status: ok`. Annual report of the *nVent Management Company Retirement Savings and Investment Plan* under Exchange Act §15(d). Contains only plan net assets and changes therein. **No business description, no segments, no company revenue.** It does NOT fill the company annual-filing slot in the sufficiency rule (see §3). |
| `data/NVT/nVent Electric plc, Q2 2026 Earnings Call, Jul 31, 2026.pdf` | Earnings transcript | Q2 FY26 (quarter ended 2026-06-30) | Call held **2026-07-31** | 398 KB raw → 60,286 chars; `status: ok`. Most recent transcript. |
| `data/NVT/nVent Electric plc, Q1 2026 Earnings Call, May 01, 2026.pdf` | Earnings transcript | Q1 FY26 (quarter ended 2026-03-31) | Call held **2026-05-01** | 307 KB raw → 119,169 chars; `status: ok`. |
| `data/NVT/2026-William-Blair-Conference-nVent-NVT-Presentation.pdf` | Investor deck | Conference presentation, as-of June 2026 | **2026-06-03** (footer on every slide: "2026 William Blair Growth Stock Conference — June 3, 2026") | 4.29 MB raw → 48,925 chars; `status: ok`. Presented by Beth Wozniak, Chair & CEO. Most recent deck. |
| `data/NVT/nVent Electric plc, Q1 2026 ppt.pdf` | Investor deck (earnings presentation) | Q1 FY26 | **2026-05-01** (cover: "nVent First Quarter 2026 Earnings Presentation, May 1, 2026") | 1.80 MB raw → 37,066 chars; `status: ok`. |
| `data/NVT/nVent-to-Acquire-Maverick-Power-2026.pdf` | Other (material-event press release; US equivalent of an 8-K item) | Announcement, as-of Aug 2026 | **2026-08-24** (dateline inside release) | 91 KB raw → 8,639 chars; `status: ok`. Announced acquisition of Maverick Power — engineered power distribution for data centres. Freshest company-issued document in the pool. Relevant to segment-map, value-chain and capital-allocation agents. |
| `data/NVT/nVent Electric plc NYSE NVT Competitors.rtf` | Data export (Capital IQ business profile) | "Recently disclosed competitors only (within the **last two years**)"; "Current subsidiaries" | Export as-of not stamped in file; sibling CIQ exports are as-of Aug 2026 | 223 KB raw → 44,284 chars; `status: ok`. Tier-5 vendor export (§4), not a filing. Carries its own scope limit: a two-year recently-disclosed window over current subsidiaries only — never read it as the full competitor set. |
| `data/NVT/nVent Electric plc NYSE NVT Products.rtf` | Data export (Capital IQ business profile) | "Current subsidiaries" | Not stamped in file | 191 KB raw → 14,955 chars; `status: ok`. Tier-5 vendor product list. |
| `data/NVT/nVent Electric plc NYSE NVT Strategic Alliances.rtf` | Data export (Capital IQ business profile) | "Current subsidiaries" | Not stamped in file | 107 KB raw → 9,635 chars; `status: ok`. Tier-5 vendor alliance list. |
| **`data/NVT/nVent Electric plc NYSE NVT Financials.xls`** | **Data export — workbook, 13 tabs (rows below)** | Annual FY2021–FY2025 + LTM to 2026-06-30; multiples close as-of **2026-08-12** | Latest data column **2026-06-30**; latest multiples close **2026-08-12** | 243 KB raw; `kind: workbook`, `status: ok`. Reported currency USD, in millions. Each tab listed separately below. |
| ├─ tab `Key Stats` | Data export tab | Trading-currency key stats | as-of Aug 2026 | 91 rows × 9 cols, 270 cells → `…Financials__Key-Stats.txt` |
| ├─ tab `Income Statement` | Data export tab | FY2021–FY2025 + LTM Jun-30-2026 | as-of Aug 2026 | 108 rows × 7 cols, 487 cells. Source of ciq_facts `ltm_ebitda_m` 1,074.6 and the revenue/EBITDA trajectory. |
| ├─ tab `Balance Sheet` | Data export tab | Latest column **2026-06-30** | as-of Aug 2026 | 94 rows × 7 cols, 466 cells. Source of ciq_facts `net_debt_m` 1,376.9 / `total_debt_m` 1,632.9. |
| ├─ tab `Cash Flow` | Data export tab | LTM to 2026-06-30 | as-of Aug 2026 | 76 rows × 7 cols, 372 cells. Source of `ltm_ocf_m` 690.6 and `levered_fcf_m` 468.2. |
| ├─ tab `Multiples` | Data export tab | 6 quarterly closes, latest **2026-08-12** | 2026-08-12 | 91 rows × 9 cols, 485 cells. ciq_facts flags this history as LOW-CONFIDENCE (6 closes < 8 quarters). |
| ├─ tab `Historical Capitalization` | Data export tab | Multi-period | as-of Aug 2026 | 39 rows × 7 cols, 140 cells |
| ├─ tab `Capital Structure Summary` | Data export tab | Multi-period | as-of Aug 2026 | 99 rows × 7 cols, 466 cells |
| ├─ tab `Capital Structure Details` | Data export tab | As-reported block, latest **2025-12-31** | as-of Aug 2026 | 40 rows × 10 cols, 226 cells. Source of the debt-maturity wall (nearest maturity 2028-04-15). |
| ├─ tab `Ratios` | Data export tab | FY2021–FY2025 + LTM Jun-30-2026 | as-of Aug 2026 | 161 rows × 7 cols, 861 cells. Source of the ROIC series (6.7% FY21 → 9.5% LTM). |
| ├─ tab `Supplemental` | Data export tab | Multi-period | as-of Aug 2026 | 74 rows × 7 cols, 326 cells |
| ├─ tab `Industry Specific` | Data export tab | Multi-period | as-of Aug 2026 | 15 rows × 6 cols, **20 cells — nearly empty**. Effectively no content; do not rely on it. |
| ├─ tab `Pension OPEB` | Data export tab | Multi-period | as-of Aug 2026 | 243 rows × 7 cols, 1,083 cells |
| └─ tab `Segments` | Data export tab | Annual, latest column **2025-12-31** | as-of Aug 2026 | 84 rows × 7 cols, 377 cells. **Only source in the pool carrying FY2025 segment and geographic splits** (Systems Protection 2,593 / 67%; Electrical Connections 1,300 / 33%; Americas 81% / EMEA 15% / APAC 4% of 3,893) — vendor tier 5, not a filing. |
| **`data/NVT/nVentElectricplcNYSENVTEstimatesReport.xls`** | **Data export — workbook, 7 tabs (rows below)** | Consensus/guidance/estimates; latest broker activity **2026-08-07** | 2026-08-07 | 4.69 MB raw; `kind: workbook`, `status: ok`. Header states "Acctg. Standard: US GAAP", "Consolidation: Consolidated", USD. |
| ├─ tab `Consensus` | Data export tab | Forward FY/quarter consensus | as-of Aug 2026 | 462 rows × 41 cols, 11,319 cells. Source of target price mean USD 202.13 / median USD 200.00. |
| ├─ tab `Recent Changes` | Data export tab | Broker changes through **2026-08-07** | 2026-08-07 | 265 rows × 10 cols, 2,518 cells |
| ├─ tab `Guidance` | Data export tab | Company guidance history | as-of Aug 2026 | 179 rows × 41 cols, 6,854 cells |
| ├─ tab `Multiples` | Data export tab | Forward multiples | as-of Aug 2026 | 23 rows × 7 cols, 59 cells — thin |
| ├─ tab `Surprise` | Data export tab | FY2021–FY2025 actual vs estimate | as-of Aug 2026 | 219 rows × 35 cols, 4,341 cells |
| ├─ tab `Trends` | Data export tab | Estimate trends | as-of Aug 2026 | 300 rows × 16 cols, 3,435 cells |
| └─ tab `Revisions` | Data export tab | Revision breadth, last month | as-of Aug 2026 | 467 rows × 12 cols, 3,861 cells. FY26 revenue 14↑/0↓, EPS 6↑/0↓ last month. |

**No external data.** No `external/` subfolder exists in the frozen raw root, and no manifest row carries `external: true` or a `provenance` object. Section 1A is therefore omitted, and no external document influenced the verdict below.

**No business-relationship export.** `relationships.json` exists but is empty: `sources: []`, `nodes: []`, `edges: []`, `concentration.relationship_rows: 0`, `named_entities: 0`. The pool contains **no** Capital IQ Suppliers or Customers export, so there is no named-counterparty graph for `value-chain` or `customer-geography` to lean on. (The Competitors / Products / Strategic Alliances RTFs are business-profile exports, not the supplier/customer graph.) Per module rules this absence is enrichment lost, not a sufficiency gap — it does not move the verdict.

---

## 2. Most Recent Sources

Ages are measured from today, **2026-09-07**, on the document's own internal date.

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | `nVent Electric plc, 2025.pdf` (Form 10-K) | FY ended 2024-12-31; filed 2025-02-18 | **20.2** by period end / **18.6** by filing date |
| Annual filing (plan only — does not substitute) | `nVent Electric plc, 2026 rev.pdf` (Form 11-K) | Plan FY ended 2025-12-31; signed 2026-06-23 | 8.2 by period end / 2.5 by filing date |
| Quarterly filing | `nVent Electric plc, Q2 2026.pdf` (Form 10-Q) | Quarter ended 2026-06-30; filed 2026-07-31 | **2.2** |
| Earnings transcript | `nVent Electric plc, Q2 2026 Earnings Call, Jul 31, 2026.pdf` | Q2 FY26; 2026-07-31 | **1.2** |
| Investor deck | `2026-William-Blair-Conference-nVent-NVT-Presentation.pdf` | 2026-06-03 | **3.1** |
| Data export | `nVent Electric plc NYSE NVT Financials.xls` (13 tabs) | FY2021–FY2025 + LTM 2026-06-30; multiples close 2026-08-12 | **0.9** |
| Data export (estimates) | `nVentElectricplcNYSENVTEstimatesReport.xls` (7 tabs) | Consensus/guidance; latest change 2026-08-07 | **1.0** |
| Material-event release | `nVent-to-Acquire-Maverick-Power-2026.pdf` | 2026-08-24 | **0.5** |

---

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | **United States** — NYSE, ticker NVT. Incorporated in **Ireland**; principal executive offices in London, United Kingdom (The Mille, 1000 Great West Road, Brentford TW8 9DW) | FY24 10-K, cover page ("State or other jurisdiction of incorporation: Ireland"; "Address of principal executive offices: … London, TW8 9DW, United Kingdom"; NYSE closing price cited on cover) |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **US SEC — domestic-filer forms.** Files Form 10-K, Form 10-Q and Form 11-K under the Securities Exchange Act of 1934, Commission file number 001-38265. It does **not** file 20-F/6-K, so the foreign-private-issuer route does not apply | FY24 10-K cover ("FORM 10-K … Commission file number 001-38265"); Q1/Q2 FY26 10-Q covers; FY25 Form 11-K cover |
| Reporting standard (US GAAP / IFRS / Ind AS) | **US GAAP** | Capital IQ Estimates export, `Recent Changes` tab header: "Consolidation: Consolidated / Acctg. Standard: US GAAP"; corroborated by the 10-K/10-Q filing forms themselves, which require US GAAP |
| Reporting currency + fiscal-year end | **USD (US dollars), reported in millions. Fiscal year ends 31 December** (FY2024 = year ended 2024-12-31; FY2025 = year ended 2025-12-31) | FY24 10-K cover ("For the Fiscal Year Ended December 31, 2024"); CIQ Financials tab headers ("Currency: Reported Currency; Units: In Millions; USD"); `ciq_facts.json` `currency: "USD"` |
| Document language(s) | **English** — all 15 sources, all 33 extracts | Every extract opens in English; no translation required |

**Instruction to downstream agents (CLAUDE.md §27).** This is a US-domestic-filer regime with an Irish incorporation and a UK head office. Read and cite the US forms: 10-K for the business description / risk factors / segment note, 10-Q for interim, DEF 14A for the proxy, 8-K-equivalent releases for material events. Do **not** look for Ind AS, SEBI-LODR, or 20-F equivalents. All figures are USD — no FX conversion is needed anywhere in this module, and none should be invented.

---

## 3. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** The pool has recent interim evidence in depth — a Q2 FY26 10-Q filed 2026-07-31 (2.2 months old), a Q2 FY26 transcript (1.2 months), and a June 2026 investor deck (3.1 months), all far inside the 6-month test — but its only **company** annual filing is the FY2024 Form 10-K, whose period ended 2024-12-31 (20.2 months ago) and which was filed 2025-02-18 (18.6 months ago); on either basis it falls outside the 18-month annual-filing test, so the rule yields Partial rather than Sufficient.

**Critical missing items**

- **The FY2025 Form 10-K (year ended 2025-12-31, filed ~February 2026) is absent from the pool.** This is the single largest gap and the one that decides the verdict. A search of the whole frozen corpus returns **zero** occurrences of "Fiscal Year Ended December 31, 2025", confirming it is genuinely not in the pool rather than mis-parsed. Its absence removes the audited FY2025 segment note, the current Item 1 Business description, the current Item 1A Risk Factors, the FY2025 MD&A, and the FY2025 notes on customers, contracts, goodwill and commitments. The consequence for this module is concrete: `segment-map`, `unit-economics`, `customer-geography` and `business-quality` must either build the FY2025 picture from the Q2 FY26 10-Q's six-month segment note (a filing, but interim and unaudited) or from the Capital IQ `Segments` tab (a **tier-5 vendor export**, not a filing). Where they use the vendor figure — e.g. FY2025 Systems Protection 2,593 / Electrical Connections 1,300 of 3,893 total — they must cite Capital IQ by name and must not present it under a filing's name (CLAUDE.md §5). Every FY2025-level business-structure claim carries a lower evidence tier than it otherwise would.
- **The 18-month miss is narrow, and the gap is partly but not fully covered.** The 10-K is 0.6 months past the filing-date threshold, and the Q2 FY26 10-Q carries an unaudited six-month segment note plus a current business discussion. Downstream agents should say so plainly rather than treat the module as data-starved — but they must not upgrade an interim, unaudited disclosure to audited-annual standing to paper over the gap.
- **No proxy statement (DEF 14A).** Nothing in the pool covers board composition, executive pay design, or the say-on-pay outcome. `capital-allocation-governance` should mark the pay/board-alignment lines "Not proven from available data" rather than infer them.
- **No Capital IQ ownership export.** `ciq_facts.json` reports `insider_net_activity`, `insider_open_market`, `top_institutional_holders` and `institutional_ownership_trend` all as `status: missing` with the note "CIQ 'ownership' export not found for NVT — pull it". Insider and institutional-ownership reads are not assessable in this run.
- **No Capital IQ comps export.** `shares_outstanding_m`, `current_price` and `peer_ev_ebitda` are all `status: missing`. Per CLAUDE.md §11 this makes any margin-of-safety read "Not assessable" and leaves peer multiples unsourced — a valuation-module constraint, flagged here so it is not discovered late.
- **No Suppliers / Customers export**, so `relationships.json` is empty and no counterparty is named. `value-chain` and `customer-geography` have no vendor graph; supplier and customer concentration must come from the filings' own disclosures or be recorded as not disclosed. (Enrichment only — this did not affect the verdict.)
- **One duplicate inflates the apparent file count.** `nVent Electric plc, 2026.pdf` is the same Q1 FY26 10-Q as `nVent Electric plc, Q1 2026.pdf`. The pool holds 15 files but **14 distinct documents**; do not count the Q1 10-Q twice as corroboration.

**Extraction health.** Zero failures across all 33 extracts (`totals.failures: 0`; every source `status: ok`). No source is being reported as present that the engine cannot actually read, so no extraction-failure downgrade or score cap applies. The only near-empty extract is the `Industry Specific` tab (20 populated cells), which carries no analytical weight either way.
