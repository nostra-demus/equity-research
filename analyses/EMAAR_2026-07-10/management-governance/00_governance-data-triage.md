# Governance Data Triage — EMAR

*Emaar Properties PJSC (DFM: EMAAR) · Dubai Financial Market, UAE · IFRS (as issued by the IASB) · reporting currency AED · fiscal year ends 31 December · filings in English (no translation gap).*

Pool extractor run: idempotent, fresh — **20 workbook(s) → 57 tab(s); 69 extract file(s); 0 failure(s)** [`_pool_extracts/manifest.md`, `manifest.json`]. A deterministic CIQ facts sidecar (`_pool_extracts/ciq_facts.json`) is present; its four ownership/insider fields (`insider_net_activity`, `insider_open_market`, `top_institutional_holders`, `institutional_ownership_trend`) are flagged **status: missing** ("CIQ 'ownership' export not found — pull it"). That structured insider/ownership export is treated as NOT in the pool (fix F03); however, a full **Public Ownership Summary.rtf** (extraction OK) supplies beneficial ownership, top holders, and institutional buy/sell activity — so ownership data itself is present.

## 1. File Inventory

Every file in `data/EMAR/` and every workbook tab (parent file + sheet + rows×cols) is its own row. "Last Modified" is the Drive-sync mtime and is **NOT authoritative** (fix F23) — "Period Covered" is parsed from inside each document.

| Filename (parent · tab) | Type | Period Covered (from inside doc) | Last Modified (sync) | Governance Relevance |
|---|---|---|---|---|
| Emaar_Properties_Annual_Report_2025.pdf | Annual filing (audited, IFRS) | FY2025, year ended 31-Dec-2025 | 2026-07-08 | High |
| Emaar_Properties_Annual_Report_2024.pdf | Annual filing (audited, IFRS) | FY2024, year ended 31-Dec-2024 | 2026-07-08 | High |
| Emaar_Properties_Annual_Report_2023.pdf | Annual filing (audited, IFRS) | FY2023, year ended 31-Dec-2023 | 2026-07-08 | High |
| ...Board Members.xls · Board Members | Board/governance export | Current board (2024/2025 appointees incl.) | 2026-06-28 | High |
| ...Compensation Summary Compensation.xls · Summary Compensation | Compensation export | Director fees FY2022–FY2025 | 2026-06-28 | High |
| ...Professionals.xls · Professionals | Management/executives export | Current (snapshot ~Jun-2026) | 2026-06-28 | High |
| ...Public Ownership Summary.rtf | Ownership/institutional-holdings export | Positions to 31-May-2026; MV as of 27-Jun-2026 | 2026-06-28 | High |
| ...Private Ownership.rtf | Ownership/investor-relationship export | Snapshot (latest txn 11-May-2026) | 2026-06-28 | Medium |
| ...Public Company Profile.rtf | Company profile/description | Snapshot ~Jul-2026 | 2026-07-08 | Medium |
| ...Key Developments.xls · Key Developments | Events / management-change feed (8-K-equivalent) | Last 6 months (Feb–Jun 2026) | 2026-06-28 | High |
| ...Strategic Alliances.rtf | JV / alliance export (RPT texture) | Snapshot ~Jun-2026 | 2026-06-28 | Medium |
| ...Investment Analysis Direct Investments.xls · Direct Investments | M&A / investments history (RPT texture) | Snapshot 2026-06-28 | 2026-06-28 | Medium |
| Emaar properties Q4'25_Earnings_Call_Summary.pdf | Transcript (call summary) | FY2025 call, 12-Feb-2026 | 2026-07-09 | High |
| Emaar Properties Q3'25_Earnings_Call_Summary.pdf | Transcript (call summary) | Q3 2025 call | 2026-07-09 | High |
| Emaar_Properties_Earnings_Press_Release_Q1_2026.pdf | Press release / results | Q1 2026, quarter ended 31-Mar-2026 | 2026-07-09 | Medium |
| Emaar_Properties_Earnings_Press_Release_Q4_2025.pdf | Press release / results | FY2025 / Q4 2025 | 2026-07-09 | Medium |
| Emaar_Properties_Earnings_Press_Release_Q3_2025.pdf | Press release / results | Q3 2025 | 2026-07-09 | Medium |
| ...Events Calendar.xls · Events Calendar | Calendar (AGM / results dates) | Forward calendar ~2026 | 2026-06-28 | Medium |
| ...Analyst Coverage.xls · Analyst Coverage | Sell-side coverage list | Snapshot ~Jun-2026 | 2026-06-28 | Low |
| ...Customers.xls · Customers | Customer list | Snapshot ~Jun-2026 | 2026-06-28 | Low |
| ...Suppliers.xls · Suppliers | Supplier list | Snapshot ~Jun-2026 | 2026-06-28 | Low |
| ...Financials_Annual.xls · Key Stats | Financial export (annual) | FY2021–FY2025 | 2026-06-20 | Medium |
| ...Financials_Annual.xls · Income Statement | Financial export (annual) | FY2021–FY2025 | 2026-06-20 | Medium |
| ...Financials_Annual.xls · Balance Sheet | Financial export (annual) | FY2021–FY2025 | 2026-06-20 | Medium |
| ...Financials_Annual.xls · Cash Flow | Financial export (annual) — dividends/capex/debt | FY2021–FY2025 | 2026-06-20 | High |
| ...Financials_Annual.xls · Multiples | Financial export (annual) | FY2021–FY2025 | 2026-06-20 | Low |
| ...Financials_Annual.xls · Historical Capitalization | Share-count / capital structure | FY2021–FY2025 | 2026-06-20 | High |
| ...Financials_Annual.xls · Capital Structure Summary | Debt / capital structure | FY2021–FY2025 | 2026-06-20 | Medium |
| ...Financials_Annual.xls · Capital Structure Details | Debt maturities / floating-fixed | Latest as-reported | 2026-06-20 | Medium |
| ...Financials_Annual.xls · Ratios | ROIC / payout / coverage | FY2021–FY2025 | 2026-06-20 | High |
| ...Financials_Annual.xls · Supplemental | Supplemental financials | FY2021–FY2025 | 2026-06-20 | Low |
| ...Financials_Annual.xls · Industry Specific | Real-estate KPIs | FY2021–FY2025 | 2026-06-20 | Medium |
| ...Financials_Annual.xls · Pension OPEB | Pension / OPEB | FY2021–FY2025 | 2026-06-20 | Low |
| ...Financials_Annual.xls · Segments | Segment revenue/profit | FY2021–FY2025 | 2026-06-20 | Medium |
| ...Financials_Quarterly.xls · Key Stats | Financial export (quarterly) | to Q1 2026 (Mar-31-2026) | 2026-06-20 | Medium |
| ...Financials_Quarterly.xls · Income Statement | Financial export (quarterly) | to Q1 2026 | 2026-06-20 | Medium |
| ...Financials_Quarterly.xls · Balance Sheet | Financial export (quarterly) | to Q1 2026 | 2026-06-20 | Medium |
| ...Financials_Quarterly.xls · Cash Flow | Dividends / capex / debt (quarterly) | to Q1 2026 | 2026-06-20 | High |
| ...Financials_Quarterly.xls · Multiples | Valuation multiples (quarterly) | to Q1 2026 | 2026-06-20 | Low |
| ...Financials_Quarterly.xls · Historical Capitalization | Share count (quarterly) | to Q1 2026 | 2026-06-20 | High |
| ...Financials_Quarterly.xls · Capital Structure Summary | Debt / capital structure (quarterly) | to Q1 2026 | 2026-06-20 | Medium |
| ...Financials_Quarterly.xls · Capital Structure Details | Debt maturities (quarterly) | Latest as-reported (2025-12-31) | 2026-06-20 | Medium |
| ...Financials_Quarterly.xls · Ratios | ROIC / payout / coverage (quarterly) | to Q1 2026 | 2026-06-20 | High |
| ...Financials_Quarterly.xls · Supplemental | Supplemental (quarterly) | to Q1 2026 | 2026-06-20 | Low |
| ...Financials_Quarterly.xls · Industry Specific | Real-estate KPIs (quarterly) | to Q1 2026 | 2026-06-20 | Medium |
| ...Financials_Quarterly.xls · Pension OPEB | Pension / OPEB (quarterly) | to Q1 2026 | 2026-06-20 | Low |
| ...Financials_Quarterly.xls · Segments | Segment revenue/profit (quarterly) | to Q1 2026 | 2026-06-20 | Medium |
| Company Comparable Analysis...xls · Financial Data | Peer comps (financials) | Snapshot 2026-06-28 | 2026-06-28 | Medium |
| Company Comparable Analysis...xls · Trading Multiples | Peer comps (multiples) | Snapshot 2026-06-28 | 2026-06-28 | Low |
| Company Comparable Analysis...xls · Operating Statistics | Peer comps (operating) | Snapshot 2026-06-28 | 2026-06-28 | Low |
| Company Comparable Analysis...xls · Business Description | Peer/company description | Snapshot 2026-06-28 | 2026-06-28 | Low |
| Company Comparable Analysis...xls · Implied Valuation | Peer comps (valuation) | Snapshot 2026-06-28 | 2026-06-28 | Low |
| Company Comparable Analysis...xls · Valuation Chart | Peer comps (chart) | Snapshot 2026-06-28 | 2026-06-28 | Low |
| Company Comparable Analysis...xls · Credit Health Panel | Credit/leverage panel | Snapshot 2026-06-28 | 2026-06-28 | Medium |
| Company Comparable Analysis...xls · Disclaimer | Disclaimer | n/a | 2026-06-28 | Low |
| 01_Consensus.xlsx · Consensus | Estimates (consensus) | Fwd estimates, as-of ~Jun-2026 | 2026-06-28 | Low |
| 02_Recent Changes.xlsx · Recent Changes | Estimates (revisions) | as-of ~Jun-2026 | 2026-06-28 | Low |
| 03_Guidance.xlsx · Guidance | Estimates (guidance) | as-of ~Jun-2026 | 2026-06-28 | Medium |
| 04_Multiples.xlsx · Multiples | Estimates (multiples) | as-of ~Jun-2026 | 2026-06-28 | Low |
| 05_Surprise.xlsx · Surprise | Beat/miss history | FY2021–FY2025 | 2026-06-28 | Medium |
| 06_Trends.xlsx · Trends | Estimate trends | as-of ~Jun-2026 | 2026-06-28 | Low |
| 07_Revisions.xlsx · Revisions | Estimate-revision breadth | as-of ~Jun-2026 | 2026-06-28 | Low |
| EstimatesReport.xls · Consensus | Estimates (consensus) | Fwd estimates, as-of ~Jun-2026 | 2026-06-20 | Low |
| EstimatesReport.xls · Recent Changes | Estimates (revisions) | as-of ~Jun-2026 | 2026-06-20 | Low |
| EstimatesReport.xls · Guidance | Estimates (guidance) | as-of ~Jun-2026 | 2026-06-20 | Medium |
| EstimatesReport.xls · Multiples | Estimates (multiples) | as-of ~Jun-2026 | 2026-06-20 | Low |
| EstimatesReport.xls · Surprise | Beat/miss history | FY2021–FY2025 | 2026-06-20 | Medium |
| EstimatesReport.xls · Trends | Estimate trends | as-of ~Jun-2026 | 2026-06-20 | Low |
| EstimatesReport.xls · Revisions | Estimate-revision breadth | as-of ~Jun-2026 | 2026-06-20 | Low |

*(Path prefix "…" = `Emaar Properties PJSC DFM EMAAR`. 32 source files → 69 extract rows; no workbook left as a single opaque row; reconciled against `manifest.md`.)*

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Proxy / DEF 14A (equivalent) | AGM Notice + Corporate Governance Report in Emaar_Properties_Annual_Report_2025.pdf; AGM held 25-Mar-2026 [Key Developments] | FY2025 / AGM 25-Mar-2026 | ~3.5 (AGM); ~6 (CG report period) |
| Annual filing | Emaar_Properties_Annual_Report_2025.pdf | FY2025, ended 31-Dec-2025 | ~6 |
| Compensation disclosure | Compensation Summary Compensation.xls + FY2025 AR CG Report §3(c) remuneration | Director fees FY2022–FY2025 | ~6 |
| Ownership / insider-transaction data | Public Ownership Summary.rtf (structured CIQ insider export MISSING) | Positions to 31-May-2026; MV 27-Jun-2026 | ~1.5 |
| Shareholder letter (equivalent) | Chairman / MD statements in Emaar_Properties_Annual_Report_2025.pdf | FY2025 | ~6 |
| Transcript | Emaar properties Q4'25_Earnings_Call_Summary.pdf (FY2025 call) | Call 12-Feb-2026 | ~5 |
| 8-K (management changes, equivalent) | Key Developments.xls — CFO/Group Head of Finance change 20-May-2026; ICD→Emirates Power control transfer 11-May-2026 | May–Jun 2026 | ~1.5–2 |

## 3. Governance Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Proxy / DEF 14A (equiv: AGM Notice + Corporate Governance Report) | Y | FY2023/24/25 AR Corporate Governance Report; AGM 25-Mar-2026 [Key Developments] | Comp, ownership, board, related-party |
| Compensation disclosure (metrics/weights) | Y (partial depth) | Compensation Summary.xls (director fees FY2022–25); FY2025 AR CG Report §3(c) remuneration + bonus/incentive policy | Incentive alignment — but executive LTIP metrics/weights are thin (UAE PJSC discloses aggregate board pay + policy) |
| Beneficial ownership table | Y | Public Ownership Summary.rtf (by type + top holders); FY2025 AR ownership | Skin in the game, control |
| Insider-transaction data (buys/sells) | Y (partial) | Public Ownership Summary.rtf (institutional activity Dec-2025→Mar-2026; top buyers/sellers; Individuals/Insiders 0.03%, no period activity). Granular CIQ insider/officer export MISSING [ciq_facts.json] | Conviction signal — inherently thin (individual insiders 0.03%; government-controlled) |
| Board composition / independence | Y | Board Members.xls (11 directors, independence flags, committees, tenure); FY2025 AR CG Report | Board quality, entrenchment |
| Related-party disclosure | Y | FY2025 AR Note 33 (Related Party Disclosures); CG Report §3.5; RPT 0.35% rev / 1.2% exp [disqualifier-scan] | Value leakage |
| Control structure (dual-class / blocs) | Y | Gov't of Dubai control via ICD→Emirates Power Investment / Dubai Holding (~29.73%; single largest 22.27%); no dual-class [Public Ownership Summary; Key Developments 2026-05-11] | Minority-shareholder rights |
| Prior shareholder letters / guidance | Y | Chairman/MD statements in AR2023/24/25; Q3'25 & Q4'25 call summaries; press releases; earnings/04 guidance | Promise-vs-delivery |
| M&A / buyback / dividend history | Y | CIQ Financials_Annual → Cash Flow / Historical Capitalization; Direct Investments; Key Developments (div AED 1.00/sh FY2023–25; Dubai Creek Harbour AED 7.5bn 2022; no buybacks) | Capital-allocation scorecard |
| Management tenure / turnover | Y | Board Members.xls (tenure); Key Developments (CFO change 20-May-2026); founder-MD Alabbar since 1997; Chairman since Dec-2020 | Stability and competence |
| Transcripts | Y | Q3'25 & Q4'25 Earnings Call Summaries; press releases Q3 2025 / Q4 2025 / Q1 2026 | Candor and tone |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/11_capital-allocation-governance.md | Y |
| business-model/01_disqualifier-scan.md | Y |
| business-model/12_red-flags-sweep.md | Y |
| business-model/02_business-identity.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/04_guidance-consensus.md | Y |

All six cross-module inputs are present. `01_disqualifier-scan` reports **no hard disqualifier triggered**; it routed four soft signals to this module: government/unaligned-owner control (§24 Filter 6), the IAS 24 government-related-entity RP-transparency election, the India Enforcement Directorate contingency (AED 190m, ~0.2% of assets), and the Group Head of Finance change.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No proxy / compensation disclosure | N | 03, 99 | Not applied — CG Report + director-fee comp export both present (note: executive incentive metrics/weights are thin; agent 03 flags depth, not a cap) |
| No ownership / insider-transaction data | N | 04, 99 | Not applied — Public Ownership Summary supplies beneficial ownership + institutional flow. The granular CIQ insider/officer structured export is MISSING [ciq_facts.json], so agent 04's open-market insider-behavior read is limited (not capped; individual insiders 0.03%) |
| No board disclosure | N | 05, 99 | Not applied — Board Members + CG Report present |
| No multi-year history | N | 02 | Not applied — 3 audited ARs (FY2023–25) + multi-year CIQ financials + Direct Investments + Key Developments |
| No transcripts / prior letters | N | 01, 06 | Not applied — Q3'25 & Q4'25 call summaries + Chairman/MD statements across 3 ARs |

**No partial-data cap binds.** All six governance requirements are met from cleanly-extracted primary sources.

## 5A. Jurisdiction & Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United Arab Emirates (UAE) | FY2025 AR; DFM listing; disqualifier-scan §Company |
| Exchange | Dubai Financial Market (DFM: EMAAR) | Board Members.xls header; FY2025 AR |
| Filing regime | Other — UAE SCA (Securities & Commodities Authority) Corporate Governance + Federal Companies Law (PJSC); **not** US SEC, **not** India SEBI-LODR | FY2025 AR Corporate Governance Report; AGM/board-discharge agenda [Key Developments 2026-03-25] |
| Sector | Real estate — master-planned property developer (build-to-sell, off-plan) + malls + hospitality | business-model/02_business-identity; CIQ Segments (Real Estate 80% / Leasing 15% / Hospitality 5%, FY2025) |
| Sector-specific governance overlay required? | Y — **Infra / real estate** overlay (related-party land transactions, project SPVs, guarantees/RERA escrow, contingent liabilities, customer advances, revenue recognition) + **holding-company** texture (listed subsidiary Emaar Development PJSC; minority interests) | MODULE_RULES Sector Overlays; FY2025 AR Note 30/31/33 |
| Document language(s) | English (audited annual reports filed in English) | FY2025 AR; disqualifier-scan §Company |

Later agents must apply the **UAE proxy-equivalent mapping** (proxy = AGM Notice + Corporate Governance Report; ownership = shareholding/Public Ownership Summary; compensation = Board's/CG Report) and the **real-estate + holding-company overlays**. Do NOT mark US forms (DEF 14A, 10-K, Form 4, 13D/G) "missing" — the UAE equivalents are present.

## Language is not a data gap (CLAUDE.md §27)

All Emaar disclosures in this pool are filed in **English** — there is no non-English document and therefore no translation step and no language-driven data gap. Every source was transcribed verbatim by `extract_pool.py` with **0 extraction failures** [`manifest.json`]. The IAS 24 government-related-entity note that leaves most Dubai-Government-ecosystem transactions unquantified is a **disclosed standard election**, not opacity and not a language issue. The only category that would count as truly missing is an extraction-failed document — there are none here.

## 5B. Source Coverage Matrix

| Governance Need | Best Available Source | Period | Confidence 1–5 | Missing? | Replacement Source |
|---|---|---|---:|---|---|
| Board composition | Board Members.xls + FY2025 AR CG Report | Current / FY2025 | 5 | No | — |
| Compensation | Compensation Summary.xls (director fees) + FY2025 AR CG Report §3(c) | FY2022–FY2025 | 4 | Partial (exec incentive metrics/weights limited) | FY2025 AR CG remuneration/bonus-policy note |
| Ownership | Public Ownership Summary.rtf + FY2025 AR | Dec-2025 / May-2026 | 4 | No | — |
| Insider trades | Public Ownership Summary.rtf (institutional flow + insider 0.03% positions) | to 31-May-2026 | 3 | Partial (granular director/officer open-market feed absent) | CIQ ownership/insider export (to pull) |
| Related-party transactions | FY2025 AR Note 33 + CG Report §3.5 | FY2025 | 5 | No (IAS 24 gov't-related exemption caveat) | — |
| Auditor report | FY2025 AR Independent Auditors' Report (EY Middle East) | FY2025 | 5 | No | — |
| Secretarial / compliance report | FY2025 AR Corporate Governance Report (UAE SCA compliance statement) | FY2025 | 5 | No | — (UAE equivalent) |
| AGM voting | Key Developments (AGM 25-Mar-2026 agenda: board discharge, auditor, remuneration, dividend) + AR CG | 2026 | 3 | Partial (agenda present; detailed vote tallies/scrutinizer results not in pool) | DFM AGM results filing |
| Capital-allocation history | CIQ Financials_Annual (Cash Flow / Ratios / Historical Capitalization) + 3 ARs + Direct Investments + Key Developments | FY2021–Q1 2026 | 5 | No | — |
| Legal / regulatory cases | FY2025 AR Note 30 (Guarantees & Contingencies — India ED matter AED 190m) | FY2025 | 5 | No | — |

CSV export to `management-governance/source_manifest.csv`: **pending** (orchestrator owns file IO; this triage writes only its `00` report — matrix provided above).

## 5C. Data Freshness

| Source | Period | As-of Date | Age | Stale? | Impact |
|---|---|---|---|---|---|
| FY2025 Annual Report (CG, RPT, auditor, remuneration) | FY2025 | 31-Dec-2025 (AGM 25-Mar-2026) | ~6 mo | No | Current annual — primary governance base |
| FY2024 / FY2023 Annual Reports | FY2024 / FY2023 | 31-Dec-2024 / 31-Dec-2023 | ~18 / ~30 mo | No (history) | Multi-year promise-vs-delivery + auditor rotation trail |
| Board Members.xls | Current | ~Jun-2026 | ~1.5 mo | No | Board composition/independence current |
| Compensation Summary.xls | FY2022–FY2025 | FY2025 | ~6 mo | No | Director-fee trend; exec-incentive depth limited |
| Public Ownership Summary.rtf | Positions to May-2026 | 27-Jun-2026 (MV) | ~1.5 mo | No | Ownership + control transfer captured |
| Key Developments.xls | Feb–Jun 2026 | to 14-Jun-2026 | ~1 mo | No | CFO change + control transfer + dividend + AGM |
| Q4'25 / Q3'25 Earnings Call Summaries | FY2025 / Q3 2025 | 12-Feb-2026 / Q3 2025 | ~5 / ~9 mo | No | Candor/tone |
| CIQ ownership/insider structured export | — | — | — | **Absent** | Granular insider open-market feed unavailable (limited, not capping) |

## 6. Sufficiency Verdict

- **Verdict:** **Sufficient**
- **Reason:** A proxy-equivalent (AGM Notice + Corporate Governance Report), beneficial-ownership table, board composition/independence, related-party disclosure, director compensation, three years of audited annual reports, and transcripts are all present and extracted cleanly (0 failures), plus a multi-year capital-allocation history — so all six specialists can run.
- **Specialists that can run:** all six — management track record (01), capital allocation (02), incentives (03), ownership & insider behavior (04), board & shareholder rights (05), candor & disclosure (06).
- **Hard disqualifier already flagged by business-model/01_disqualifier-scan?** N — no disqualifier triggered. Soft signals routed to this module (not verdict-locking): government/unaligned-owner control (§24 Filter 6), IAS 24 government-related-entity RP-transparency election, India Enforcement Directorate contingency (~0.2% of assets), Group Head of Finance change (20-May-2026, named successor).
- **Active partial-data caps:** none (verdict is Sufficient).
- **Critical missing items:** none that block. Lower-priority gaps for later agents to note (not caps): (1) the CIQ structured insider/ownership export (granular director/officer open-market share-dealing) — incremental value modest given individual insiders hold 0.03% and institutional buy/sell flow is already in the Public Ownership Summary; (2) executive incentive-metric weights (thin in UAE PJSC disclosure — agent 03); (3) detailed AGM vote tallies / scrutinizer results (agent 05).
- **Single highest-value missing document:** the CIQ ownership / insider-transaction structured export (director/officer open-market trades) — the only governance data category not covered by a present source.
