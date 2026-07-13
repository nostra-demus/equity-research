# Earnings Data Triage — EMAR

Emaar Properties PJSC (DFM: EMAAR). Data pool: `data/EMAR/`. Triage date: 2026-07-10.

**Extraction status (fix F03):** `_pool_extracts/manifest.json` reports 32 sources, all `status: ok`, **0 failures**. Every workbook parsed; every PDF/RTF extracted (PDFs are text-native, no OCR fallback needed). No source is in a `fail` / `fallback-text` / `missing-dependency` / `gdrive-pointer` state, so nothing is dropped from the pool for extraction reasons. A deterministic facts sidecar (`_pool_extracts/ciq_facts.json`, 26 concepts resolved) is present and its headline numbers carry `status: present`; downstream agents reconcile to it.

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United Arab Emirates | `Q1 2026 Earnings Press Release, "Dubai, United Arab Emirates – 11 May 2026"`; `FY2025 Annual Report` |
| Exchange | Dubai Financial Market (DFM), ticker EMAAR | `Q1 2026 Press Release, "Emaar Properties PJSC (DFM: EMAAR)"`; `CIQ Estimates header "DFM:EMAAR"` |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **Other** — UAE SCA / DFM listing rules (IFRS-basis annual report + interim results announcements). Not US SEC, not India SEBI. | `FY2025 Annual Report (audited IFRS financials + Auditor's Report + Corporate Governance Report)` |
| Reporting standard (US GAAP / IFRS / Ind AS) | **IFRS** | `CIQ Estimates→Guidance header "Acctg. Standard: IFRS"`; `FY2024 AR Auditor's Report — consolidated statement of cash flows / going-concern language` |
| Reporting currency | **AED** (UAE Dirham); pegged to USD, filings state USD equivalents | `Q1 2026 Press Release "AED 12.4 billion (US$ 3.4 billion)"`; `CIQ Consensus "Currency: United Arab Emirates Dirham"` |
| Fiscal-year end | **31 December** (calendar year) | `AR2023/24/25 "for the year ended 31 December 202X"`; `CIQ "Current Fiscal Year End: Dec-31-2026"` |
| Document language(s) | **English** (all pool documents). No non-English extraction required. | Press releases, annual reports, sell-side notes all English in `_pool_extracts` |

Set so later agents apply CLAUDE.md §27: read/cite the **local equivalents** — the **Annual Report** (audited IFRS financials) as the full-year filing, the **quarterly earnings press releases / DFM results announcements** as the interim filing, and the **earnings-call material** for management colour. Do NOT mark US forms (10-K, 10-Q, 8-K, Form 4) "missing" — they do not apply to a DFM issuer; the local equivalents are present.

## 1. File Inventory

Every file in `data/EMAR/` is listed. Multi-tab workbooks are exploded — **each tab is its own row** (parent → tab, rows×cols), reconciled against `_pool_extracts/manifest.md` (20 workbooks → 57 tabs; 12 non-workbook files; 69 rows total).

**Note on "Last Modified" (fix F23):** every timestamp below is the Google-Drive **sync date** (Jun–Jul 2026), NOT the reporting date. Period Covered is parsed from **inside** each document. The CIQ financial workbooks (synced Jun-20) contain data through Mar-31-2026 — the sync date understates their currency.

### Primary disclosures (PDF)

| Filename | Type | Period Covered (from inside) | Last Modified (sync) | Earnings Relevance |
|---|---|---|---|---|
| Emaar_Properties_Annual_Report_2025.pdf | Audited annual filing (IFRS) | FY2025, year ended 31 Dec 2025 | Jul-08 | High |
| Emaar_Properties_Annual_Report_2024.pdf | Audited annual filing (IFRS) | FY2024, year ended 31 Dec 2024 | Jul-08 | High |
| Emaar_Properties_Annual_Report_2023.pdf | Audited annual filing (IFRS) | FY2023, year ended 31 Dec 2023 | Jul-08 | Medium (trend / base-rate depth) |
| Emaar_Properties_Earnings_Press_Release_Q1_2026.pdf | Earnings press release / results intimation | Q1 2026, quarter ended 31 Mar 2026 (rel. 11 May 2026) | Jul-09 | High (latest quarter) |
| Emaar_Properties_Earnings_Press_Release_Q4_2025.pdf | Earnings press release (full-year) | Q4 / FY2025 (rel. 12 Feb 2026) | Jul-09 | High |
| Emaar_Properties_Earnings_Press_Release_Q3_2025.pdf | Earnings press release | 9M / Q3 2025 (rel. 6 Nov 2025) | Jul-09 | Medium |
| Emaar properties Q4'25_Earnings_Call_Summary.pdf | **transcript-proxy (sell-side, verdict-bearing)** — "UAE Equity Research", Rating BUY, TP AED 19.25, "higher than our estimate" | FY/Q4 2025 call (note dated 16 Feb 2026) | Jul-09 | High (only call-colour source for FY25) |
| Emaar Properties Q3'25_Earnings_Call_Summary.pdf | **transcript-proxy (sell-side, verdict-bearing)** — "UAE Equity Research", Rating BUY, TP "Under review" | Q3 2025 call (~Nov 2025) | Jul-09 | Medium |

### Company profile / ownership (RTF)

| Filename | Type | Period Covered | Last Modified (sync) | Earnings Relevance |
|---|---|---|---|---|
| Emaar Properties PJSC DFM EMAAR Public Company Profile.rtf | Data export — company profile | As-of ~Jul 2026 | Jul-08 | Low |
| Emaar Properties PJSC DFM EMAAR Public Ownership Summary.rtf | Data export — public ownership | As-of ~Jun 2026 | Jun-28 | Low |
| Emaar Properties PJSC DFM EMAAR Private Ownership.rtf | Data export — private ownership | As-of ~Jun 2026 | Jun-28 | Low |
| Emaar Properties PJSC DFM EMAAR Strategic Alliances.rtf | Data export — alliances/JVs | As-of ~Jun 2026 | Jun-28 | Low |

### CIQ Estimates — split workbooks (each is a single tab; **duplicates of the EstimatesReport.xls tabs below**)

| Filename → Tab | Type | Period Covered | Last Modified (sync) | Earnings Relevance |
|---|---|---|---|---|
| 01_Consensus.xlsx → Consensus (517×81) | Consensus/estimate export | Forward FY2026–28 + history; as-of ~Jun-2026 (post-Q1-26) | Jun-28 | High |
| 02_Recent Changes.xlsx → Recent Changes (266×10) | Estimate-revision export | Recent estimate changes, ~Jun-2026 | Jun-28 | High |
| 03_Guidance.xlsx → Guidance (42×3) | Guidance export | **Effectively empty** — only FY2008/FY2015 rows | Jun-28 | Low |
| 04_Multiples.xlsx → Multiples (26×7) | Forward-multiples export | Forward FY2026–28 | Jun-28 | Medium |
| 05_Surprise.xlsx → Surprise (248×74) | Beat/miss history | FY2021–FY2025 surprise history | Jun-28 | High |
| 06_Trends.xlsx → Trends (306×15) | Estimate-trend export | Estimate trend over time | Jun-28 | Medium |
| 07_Revisions.xlsx → Revisions (476×13) | Estimate-revision breadth | Revision breadth/history | Jun-28 | High |

### CIQ Estimates — bundled workbook (same 7 tabs; **de-duplicate vs the split files above**)

| Filename → Tab | Type | Period Covered | Last Modified (sync) | Earnings Relevance |
|---|---|---|---|---|
| EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls → Consensus (514×81) | Consensus/estimate export | Forward FY2026–28 + history | Jun-20 | High (duplicate) |
| …EstimatesReport.xls → Recent Changes (265×10) | Estimate-revision export | ~Jun-2026 | Jun-20 | High (duplicate) |
| …EstimatesReport.xls → Guidance (42×3) | Guidance export | Empty (FY2008/FY2015 only) | Jun-20 | Low (duplicate) |
| …EstimatesReport.xls → Multiples (25×7) | Forward-multiples export | Forward FY2026–28 | Jun-20 | Medium (duplicate) |
| …EstimatesReport.xls → Surprise (245×74) | Beat/miss history | FY2021–FY2025 | Jun-20 | High (duplicate) |
| …EstimatesReport.xls → Trends (305×15) | Estimate-trend export | Estimate trend | Jun-20 | Medium (duplicate) |
| …EstimatesReport.xls → Revisions (467×13) | Estimate-revision breadth | Revision history | Jun-20 | High (duplicate) |

### CIQ Financials — Annual workbook (13 tabs)

| Filename → Tab | Type | Period Covered | Last Modified (sync) | Earnings Relevance |
|---|---|---|---|---|
| …Financials_Annual.xls → Key Stats (91×9) | Data export — key stats | Annual ~FY2020–FY2025 (+LTM) | Jun-20 | Medium |
| …Financials_Annual.xls → Income Statement (98×7) | Income statement | Annual ~FY2020–FY2025 (+LTM Mar-26) | Jun-20 | High |
| …Financials_Annual.xls → Balance Sheet (101×7) | Balance sheet | Annual ~FY2020–FY2025 | Jun-20 | High |
| …Financials_Annual.xls → Cash Flow (77×7) | Cash flow statement | Annual ~FY2020–FY2025 (+LTM) | Jun-20 | High |
| …Financials_Annual.xls → Multiples (91×9) | Historical multiples | Annual | Jun-20 | Medium |
| …Financials_Annual.xls → Historical Capitalization (39×7) | Capitalization | Annual | Jun-20 | Low |
| …Financials_Annual.xls → Capital Structure Summary (96×7) | Debt structure | Annual | Jun-20 | Medium |
| …Financials_Annual.xls → Capital Structure Details (44×10) | Debt maturities | Principal-by-maturity block (to 2031) | Jun-20 | Medium |
| …Financials_Annual.xls → Ratios (161×7) | Ratios (incl. ROIC) | Annual | Jun-20 | Medium |
| …Financials_Annual.xls → Supplemental (38×7) | Supplemental | Annual | Jun-20 | Low |
| …Financials_Annual.xls → Industry Specific (65×7) | Real-estate KPIs | Annual | Jun-20 | Medium |
| …Financials_Annual.xls → Pension OPEB (44×7) | Pension/OPEB | Annual | Jun-20 | Low |
| …Financials_Annual.xls → Segments (84×7) | **Segment P&L** (revenue + result, 3 segments) | Annual ~FY2020–FY2025 | Jun-20 | High |

### CIQ Financials — Quarterly workbook (13 tabs)

| Filename → Tab | Type | Period Covered | Last Modified (sync) | Earnings Relevance |
|---|---|---|---|---|
| …Financials_Quarterly.xls → Key Stats (91×7) | Data export — key stats | Quarterly | Jun-20 | Medium |
| …Financials_Quarterly.xls → Income Statement (95×18) | Income statement | **Q1-2022 → Q1-2026** (17 qtrs, +LTM Mar-26) | Jun-20 | High |
| …Financials_Quarterly.xls → Balance Sheet (99×18) | Balance sheet | Q1-2022 → Q1-2026 | Jun-20 | High |
| …Financials_Quarterly.xls → Cash Flow (77×18) | Cash flow statement | Q1-2022 → Q1-2026 | Jun-20 | High |
| …Financials_Quarterly.xls → Multiples (91×19) | Historical multiples | Quarterly | Jun-20 | Medium |
| …Financials_Quarterly.xls → Historical Capitalization (39×18) | Capitalization | Quarterly | Jun-20 | Low |
| …Financials_Quarterly.xls → Capital Structure Summary (74×35) | Debt structure | Quarterly | Jun-20 | Medium |
| …Financials_Quarterly.xls → Capital Structure Details (44×10) | Debt maturities | Principal-by-maturity block | Jun-20 | Medium |
| …Financials_Quarterly.xls → Ratios (161×18) | Ratios | Quarterly | Jun-20 | Medium |
| …Financials_Quarterly.xls → Supplemental (26×18) | Supplemental | Quarterly | Jun-20 | Low |
| …Financials_Quarterly.xls → Industry Specific (65×18) | Real-estate KPIs | Quarterly | Jun-20 | Medium |
| …Financials_Quarterly.xls → Pension OPEB (30×18) | Pension/OPEB | Quarterly | Jun-20 | Low |
| …Financials_Quarterly.xls → Segments (84×18) | **Segment P&L** (revenue + result, 3 segments) | Quarterly | Jun-20 | High |

### CIQ Comparable Analysis workbook (8 tabs)

| Filename → Tab | Type | Period Covered | Last Modified (sync) | Earnings Relevance |
|---|---|---|---|---|
| Company Comparable Analysis…xls → Financial Data (50×17) | Peer financial data (**current price, shares out**) | As-of 2026-06-28 | Jun-28 | Medium (price/shares) |
| …Comparable Analysis → Trading Multiples (50×9) | Peer trading multiples | As-of 2026-06-28 | Jun-28 | Medium |
| …Comparable Analysis → Operating Statistics (50×13) | Peer operating stats | As-of 2026-06-28 | Jun-28 | Low |
| …Comparable Analysis → Business Description (44×3) | Peer descriptions | — | Jun-28 | Low |
| …Comparable Analysis → Implied Valuation (69×9) | Valuation (out-of-module) | As-of 2026-06-28 | Jun-28 | Low |
| …Comparable Analysis → Valuation Chart (32×2) | Valuation chart | — | Jun-28 | Low |
| …Comparable Analysis → Credit Health Panel (48×10) | Credit health | As-of 2026-06-28 | Jun-28 | Low |
| …Comparable Analysis → Disclaimer (26×1) | Disclaimer | — | Jun-28 | Low |

### Other CIQ single-tab workbooks

| Filename → Tab | Type | Period Covered | Last Modified (sync) | Earnings Relevance |
|---|---|---|---|---|
| …EMAAR Analyst Coverage.xls → Analyst Coverage (34×6) | Analyst coverage list | As-of ~Jun-2026 | Jun-28 | Medium |
| …EMAAR Events Calendar.xls → Events Calendar (23×3) | Events calendar (next earnings) | FQ2 2026 release Aug-10-2026 | Jun-28 | Medium |
| …EMAAR Key Developments.xls → Key Developments (49×7) | Material events / newsflow | Recent developments | Jun-28 | Medium |
| …EMAAR Board Members.xls → Board Members (29×25) | Governance | — | Jun-28 | Low |
| …EMAAR Compensation Summary…xls → Summary Compensation (27×18) | Governance — pay | — | Jun-28 | Low |
| …EMAAR Professionals.xls → Professionals (33×24) | Governance — management | — | Jun-28 | Low |
| …EMAAR Customers.xls → Customers (40×8) | Customers | — | Jun-28 | Low |
| …EMAAR Suppliers.xls → Suppliers (46×8) | Suppliers | — | Jun-28 | Low |
| …EMAAR Investment Analysis Direct Investments.xls → Direct Investments (69×21) | Direct investments | — | Jun-28 | Low |

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | Emaar_Properties_Annual_Report_2025.pdf | FY2025 (ended 31 Dec 2025) | ~6 (from period-end) |
| Quarterly filing | Emaar_Properties_Earnings_Press_Release_Q1_2026.pdf + CIQ Financials_Quarterly (Segments/IS/BS/CF through Mar-31-2026) | Q1 2026 (ended 31 Mar 2026; rel. 11 May 2026) | ~3 (from period-end) |
| Earnings transcript | **No verbatim transcript.** Closest = sell-side proxy Emaar properties Q4'25_Earnings_Call_Summary.pdf | FY/Q4 2025 call (note dated 16 Feb 2026) | ~5 (from call) — one quarter behind latest reported period |
| Investor deck | **None** (standalone investor presentation not in pool; press releases carry the KPI slides) | — | — |
| Consensus / estimate export | CIQ Estimates (EstimatesReport.xls + 01–07 split xlsx) | Consensus as-of ~Jun-2026 (post-Q1-26; references FQ2-26 release Aug-10-2026) | ~1 |
| Cash flow data | CIQ Financials_Annual/Quarterly → Cash Flow tabs + FY2025 AR statement of cash flows | Annual to FY2025; quarterly to Mar-31-2026 | ~3 |
| Guidance data | Qualitative only — Q1 2026 & Q4'25 press releases + sell-side proxies (backlog AED 163.4bn, 5-yr CAPEX ~AED 65bn, dividend policy). **CIQ Guidance tab is empty (FY2008/FY2015 only).** | FY2026 outlook (qualitative) | ~2 |

## 3. Earnings Usability Check

| Requirement | Available? | Source | Why It Matters |
|---|---|---|---|
| Income statement | **Y** | FY2023–25 Annual Reports; CIQ Financials Income Statement (annual + quarterly); Q1 2026 / Q4'25 / Q3'25 press releases | Revenue, margin, EPS |
| Balance sheet | **Y** | FY2023–25 Annual Reports; CIQ Financials Balance Sheet (annual + quarterly to Mar-31-2026) | Working capital, leverage |
| Cash flow statement | **Y** | FY2025 AR consolidated statement of cash flows; CIQ Financials Cash Flow (annual + quarterly). CIQ pins LTM CFO AED 31,973m, levered FCF AED 3,067m [ciq_facts] | CFO, FCF, earnings quality |
| Latest quarter | **Y** | Q1 2026 press release + CIQ Quarterly through Mar-31-2026 | Trend and setup |
| Last 8 quarters | **Y** | CIQ Financials_Quarterly — 17 quarters (Q1-2022 → Q1-2026) | Seasonality, inflection |
| Consensus estimates | **Y** | CIQ Estimates → Consensus / Trends / Surprise / Multiples. Target price mean AED 17.07 [ciq_facts]. **Caution:** CIQ "LT growth −14.8%" looks like a data artifact for a 20–40%-grower — 04 must verify, not take at face value | Market bar |
| Estimate revisions | **Y** | CIQ Revisions + Recent Changes tabs. Breadth quiet last month (EPS 0↑/0↓; Revenue 1↑/0↓) but history is present | Revision momentum |
| Earnings transcript | **N (verbatim)** | Only sell-side proxies present (Q3'25, Q4'25 "Earnings Call Insight" notes). Paraphrase + directional verdict — NOT a verbatim call | Management tone, driver detail |
| Segment P&L | **Y** | CIQ Segments tabs (annual + quarterly): revenue + result for 3 segments — Real Estate 80%, Leasing/Retail 15%, Hospitality 5% [ciq_facts]; + AR IFRS segment note; + business-model 03_segment-map.md | Mix shift |
| Current price | **Y** | CIQ Comps 12.20 AED / US$3.32 as-of 2026-06-28 [ciq_facts]; CIQ Consensus last close 12.20 AED | Master-level stock-reaction context |

## 4. Cross-Module Availability

`analyses/EMAAR_2026-07-10/business-model/` exists and is fully populated (00–12 + 99 synthesis).

| Business-Model Output | Available? |
|---|---|
| 03_segment-map.md | **Y** |
| 06_value-chain.md | **Y** |
| 10_external-dependency.md | **Y** |

Earnings agents 02/03 should read 03_segment-map.md (segment decomposition), 06_value-chain.md (pricing-power context), and 10_external-dependency.md (Dubai real-estate cycle / external variables — feeds the Cycle-Position hard rule). All three are present, so no independent-read fallback is needed.

## 5. Partial-Data Flags

| Missing Data | Applies? | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | **N** | 04, 05, 99 | None — full CIQ estimates present and as-of ~Jun-2026 (post-Q1-26), so NOT stale. No no-consensus (max 30) or staleness cap. (Watch the −14.8% LT-growth artifact and the quiet last-month revision breadth — quality caveats, not the no-revision-history cap, since revision history is present.) |
| No quarterly data | **N** | 01, 02, 03, 06 | None — 17 quarters of CIQ quarterly financials + 3 quarterly press releases. QoQ / seasonality fully doable. |
| No VERBATIM transcript, sell-side proxy present | **Y** | 02, 03, 04 | **Binds.** Two sell-side proxies (Q3'25, Q4'25) fill the commentary role but are paraphrase + verdict-bearing. Downstream MUST strip the Rating / Target Price / "vs our estimate" verdict (§24). Earnings **clarity ≤ 70** (= the no-call cap, not below it). Tone/candor **not assessable** from a proxy — that candor cap binds **management-governance 06**, NOT earnings 06 (cash-flow quality). |
| No transcript AND no sell-side proxy | **N** | 02, 03, 04 | Not applicable — proxies ARE present, so the harsher filings-only cap does not apply; the row above governs instead. |
| No segment-level P&L | **N** | 02, 03, 99 | None — CIQ Segments (annual + quarterly) + AR IFRS segment note + business-model 03_segment-map.md. |
| No cash flow statement | **N** | 06, 99 | None — cash flow available (AR + CIQ annual/quarterly). Earnings-quality not capped on this axis. |
| No current price | **N** | 99 | None — 12.20 AED / US$3.32 as-of 2026-06-28. |

**Also flag (not a template row) — de-duplicate the estimates export.** The 7 numbered split files (01_Consensus…07_Revisions.xlsx) are the SAME CIQ estimates tabs as those inside EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls (manifest `conflicts` array lists all 7 as duplicate sheet-pairs; trivial ±1–3 row-count differences are header artifacts). This is a **duplicate, not a value conflict** — agents 04/05 must count analysts/estimates ONCE, not twice. No "conflicting sources" (Overall usefulness max 65) cap.

## 6. Sufficiency Verdict

- **Verdict:** **Sufficient**
- **Reason:** All three sufficiency requirements are met — recent audited full-year financials (FY2025 AR, IFRS), a latest quarterly update (Q1 2026 press release + CIQ quarterly to Mar-31-2026), and income statement + balance sheet + cash flow statement all present — so this is a rich pool for a serious earnings analysis.
- **Caps that still bind downstream despite the Sufficient verdict** (one genuine quality gap):
  - **No verbatim earnings-call transcript** → agents 02/03/04 work from filings + press releases + two verdict-bearing sell-side proxies; strip the proxy verdict (§24); **earnings clarity ≤ 70**; management tone/candor not assessable in the earnings module (that candor cap lands in management-governance 06, not earnings 06).
- **Critical missing items:** None that block the analysis. Minor/quality items to carry forward: (1) no standalone investor deck (press-release KPI pages substitute); (2) CIQ Guidance tab is empty — forward guidance is qualitative (backlog, CAPEX, dividend policy) from press releases/proxies; (3) verify the CIQ "LT growth −14.8%" figure in 04 — likely a data artifact; (4) de-duplicate the twin estimates exports.
