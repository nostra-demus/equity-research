# Governance Data Triage — UBER

## 1. File Inventory

All 7 multi-tab workbooks were pre-extracted with `.claude/tools/extract_pool.py` (idempotent — re-run confirmed "fresh," 0 failures across 51 tabs / 65 extract files; `analyses/UBER_2026-08-09/_pool_extracts/manifest.md`). Every tab is listed below as its own row. "Last Modified" is the Drive-sync timestamp (fix F23) and is NOT used to judge recency — the period/as-of date is parsed from inside each document instead. No `ciq_facts.json` sidecar exists for this run — vendor figures below are cited directly from the tab extracts, each with its own citation.

| Filename | Type | Period Covered | Last Modified | Governance Relevance |
|---|---|---|---|---|
| Uber_Technologies_Inc_-_Form_10-K(Feb-13-2026).doc | Annual filing (10-K, filed Feb-13-2026) | FY2025 (ended Dec-31-2025) | Aug 8 21:42 (sync) | High |
| Uber_Technologies_Inc_-_Form_10-Q(Aug-05-2026).doc | Quarterly filing (10-Q) | Q2 FY2026 (ended Jun-30-2026) | Aug 8 21:42 (sync) | High |
| Uber_Technologies_Inc_-_Form_10-Q(May-06-2026).doc | Quarterly filing (10-Q) | Q1 FY2026 (ended Mar-31-2026) | Aug 8 21:42 (sync) | High |
| Uber Technologies Inc NYSE UBER Board Members.rtf | Board/director dossier (CIQ export) | Current board as of extraction (bios include tenure, e.g. "2018-Present") | Aug 6 20:32 (sync) | High |
| Uber Technologies Inc NYSE UBER Professionals.rtf | Executive-officer dossier (CIQ export) | Current officers as of extraction | Aug 6 20:32 (sync) | Medium-High |
| Uber Technologies Inc NYSE UBER Public Company Profile.rtf | Company/ownership/credit snapshot (CIQ export) | Quote data as of Aug-06-2026 close; 1,207 holders of record as of Feb-10-2026 (per 10-K) | Aug 8 21:41 (sync) | Medium-High |
| Uber Technologies Inc NYSE UBER Key Developments.rtf | Corporate-events feed (CIQ export: management changes, buybacks, AGM notice, litigation, M&A) | Rolling multi-year log, entries through Aug-06-2026 | Aug 7 00:25 (sync) | High |
| Uber Technologies, Inc., Q1 2026 Earnings Call, May 06, 2026.rtf | Transcript | Q1 FY2026 (May-06-2026) | Aug 7 00:23 (sync) | Medium |
| Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.rtf | Transcript | Q2 FY2026 (Aug-05-2026) | Aug 7 00:23 (sync) | Medium |
| UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | Combined CIQ company report + news digest | Multiple, latest entries Aug-06-2026 | Aug 6 20:28 (sync) | Medium |
| Uber Technologies Inc NYSE UBER Analyst Coverage.rtf | Sell-side coverage list | Current as of extraction | Aug 6 20:27 (sync) | Low |
| Uber Technologies Inc NYSE UBER Customers.rtf | Customer relationships (CIQ export) | Current as of extraction | Aug 7 00:25 (sync) | Low |
| Uber Technologies Inc NYSE UBER Products.rtf | Product list (CIQ export) | Current as of extraction | Aug 6 20:27 (sync) | Low |
| Uber Technologies Inc NYSE UBER Suppliers.rtf | Supplier relationships (CIQ export) | Current as of extraction | Aug 7 00:25 (sync) | Low |
| Company Comparable Analysis Uber Technologies Inc.xls (multi-tab, see below) | Vendor comp/valuation workbook | As-of 2026-08-06 | Aug 6 20:36 (sync) | Medium (peer benchmarking) |
| Short Iinterest_12m_Uber.xls (multi-tab, see below) | Short-interest chart/attribution | Trailing 12 months to ~Aug-2026 | Aug 8 22:00 (sync) | Low (market signal, not insider-transaction data) |
| Uber Technologies Inc NYSE UBER Events Calendar.xls (1 tab) | Corporate events calendar | Forward events, timeframe 2026 | Aug 8 21:43 (sync) | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls (multi-tab, see below) | Vendor financial-statement workbook (annual) | FY2016A–LTM(Jun-2026) | Aug 7 00:24 (sync) | Medium (capital-allocation scorecard inputs) |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls (multi-tab, see below) | Vendor financial-statement workbook (quarterly) | Multi-quarter history through Q2 FY2026 | Aug 7 00:26 (sync) | Medium |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls (multi-tab, see below) | Vendor consensus/estimates workbook | Consensus as of extraction; guidance/surprise history multi-quarter | Aug 6 20:23 (sync) | Low-Medium (candor/guidance cross-check) |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls (multi-tab, byte-different duplicate/re-pull of the above) | Vendor consensus/estimates workbook | Same content class as above | Aug 8 21:40 (sync) | Low-Medium (duplicate, not double-counted) |

### Multi-tab workbook detail (from `_pool_extracts/manifest.md`, reconciled — 0 extraction failures across 51 tabs)

| Parent Workbook | Tab | Rows×Cols | Governance Relevance |
|---|---|---|---|
| Company Comparable Analysis Uber Technologies Inc.xls | Financial Data | 50×17 | Medium |
| Company Comparable Analysis Uber Technologies Inc.xls | Trading Multiples | 50×9 | Medium (peer set: Lyft, DoorDash, DiDi) |
| Company Comparable Analysis Uber Technologies Inc.xls | Operating Statistics | 50×13 | Medium |
| Company Comparable Analysis Uber Technologies Inc.xls | Business Description | 44×3 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls | Implied Valuation | 69×9 | Low (out of scope for this module) |
| Company Comparable Analysis Uber Technologies Inc.xls | Valuation Chart | 32×2 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls | Credit Health Panel | 47×10 | Low-Medium (leverage/solvency, cross-refs balance-sheet module) |
| Company Comparable Analysis Uber Technologies Inc.xls | Disclaimer | 26×1 | None |
| Short Iinterest_12m_Uber.xls | Chart 1 with Data | 284×2 | Low |
| Short Iinterest_12m_Uber.xls | Attributions | 45×1 | None |
| Uber Technologies Inc NYSE UBER Events Calendar.xls | Events Calendar | 36×3 | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls | Key Stats | 91×13 | Medium |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls | Income Statement | 120×12 | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls | Balance Sheet | 103×12 | Medium (shares out, debt trend) |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls | Cash Flow | 80×12 | High (buybacks, dividends, capex — capital-allocation scorecard) |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls | Multiples | 91×32 | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls | Historical Capitalization | 39×32 | Medium |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls | Capital Structure Summary | 114×23 | Medium |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls | Capital Structure Details | 46×10 | Medium |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls | Ratios | 161×12 | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls | Supplemental | 78×11 | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls | Industry Specific | 15×6 | None |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls | Pension OPEB | 15×6 | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls | Segments | 63×11 | Low |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls | Key Stats | 91×13 | Medium |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls | Income Statement | 117×35 | Low |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls | Balance Sheet | 101×35 | Medium |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls | Cash Flow | 77×35 | High (quarterly buyback cadence) |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls | Multiples | 91×32 | Low |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls | Historical Capitalization | 39×32 | Medium |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls | Capital Structure Summary | 84×67 | Medium |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls | Capital Structure Details | 46×10 | Medium |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls | Ratios | 161×35 | Low |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls | Supplemental | 55×35 | Low |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls | Industry Specific | 15×6 | None |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls | Pension OPEB | 15×6 | Low |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls | Segments | 70×35 | Low |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls / (1).xls (identical tab sets) | Consensus | 447×41 | Low |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls / (1).xls | Recent Changes | 265×10 | Low |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls / (1).xls | Guidance | 109×29 | Low-Medium (guidance-vs-delivery, candor cross-check) |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls / (1).xls | Multiples | 26×7 | None |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls / (1).xls | Surprise | 211×31 | Low-Medium (beat/miss track record, candor cross-check) |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls / (1).xls | Trends | 303×21 | Low |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls / (1).xls | Revisions | 467×21 | Low |

## 1A. External Data

No `data/UBER/external/` directory exists in this data pool. No externally sourced alt-data, expert-call, or broker-research documents are present. This has no effect on the sufficiency verdict (external data never moves it, and there is none to inventory here).

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Proxy / DEF 14A | **Not in pool.** Every Part III item of the FY25 10-K (Items 10–14: directors/governance, executive compensation, beneficial ownership, related-party transactions/director independence, accounting fees) is "incorporated herein by reference" to the "2026 Proxy Statement," which is not present in `data/UBER/` [FY25 10-K, Items 10–14, p.33090–33189]. | N/A | N/A |
| Annual filing | Uber_Technologies_Inc_-_Form_10-K(Feb-13-2026).doc | FY2025, ended Dec-31-2025 (filed Feb-13-2026) | ~6 |
| Compensation disclosure | **Not in pool** (deferred to the missing proxy); only the 10-K's Insider Trading Policy exhibit (prohibits pledging/hedging) and aggregate company-wide stock-based-compensation expense (Note 10 / Cash Flow tab) are available — not individual pay tables or incentive-metric weights. | N/A | N/A |
| Ownership / insider-transaction data | Uber Technologies Inc NYSE UBER Public Company Profile.rtf ("Current and Pending Investors" name list, no % holdings, no transaction dates) + 10-K Item 5 (1,207 holders of record, Feb-10-2026) | Feb-10-2026 (holder count) / Aug-06-2026 (investor-name snapshot) | ~6 / ~0 |
| Shareholder letter | **Not in pool.** Uber does not publish an annual CEO shareholder letter in this filing regime; closest equivalents are the two earnings-call transcripts. | N/A | N/A |
| Transcript | Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.rtf | Q2 FY2026 (Aug-05-2026) | <1 |
| 8-K (management changes) | **No standalone 8-K filed to the pool**; management-change events (CFO transition Feb-2026, CPO/President reorganization May-2026) are captured secondhand in Uber Technologies Inc NYSE UBER Key Developments.rtf, a vendor events feed, not the primary 8-K filings. | Feb-2026 / May-2026 (event dates) | ~6 / ~3 |

## 3. Governance Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Proxy / DEF 14A | N | Not in pool; 10-K Items 10–14 all incorporate the 2026 Proxy Statement by reference [FY25 10-K, p.33090–33189] | Comp, ownership, board, related-party |
| Compensation disclosure (metrics/weights) | N | Not in pool — Item 11 (Executive Compensation) deferred to proxy [FY25 10-K, p.33145–33150]; only aggregate SBC expense available from the vendor workbook | Incentive alignment |
| Beneficial ownership table | N | Item 12 deferred to proxy [FY25 10-K, p.33158–33163]; Public Company Profile lists investor NAMES with no % holdings | Skin in the game, control |
| Insider-transaction data (buys/sells) | N | No Form 4 / Section 16 transaction data in the pool; 10-K only describes the Insider Trading Policy mechanics (Form 3/Form 4 filing obligations), not actual filed transactions [FY25 10-K, p.37348–37409] | Conviction signal |
| Board composition / independence | Y | Uber Technologies Inc NYSE UBER Board Members.rtf — 10 named directors with title (8 of 10 labeled "Independent Director"), tenure, and committee memberships; corroborated by 10-K Item 10 reference to "Corporate Governance" | Board quality, entrenchment |
| Related-party disclosure | Y (partial — figures present, no proxy-level RPT policy narrative) | FY25 10-K Notes (Moove term loan $384mm receivable, Lime convertible note, Careem Technologies ~42% minority stake) [FY25 10-K, p.31526–31534, p.18296, p.20538] | Value leakage |
| Control structure (dual-class / blocs) | Y | Single class of common stock; Float % 99.7%, 2,042.6mm shares out, no controlling holder identified [Public Company Profile, Aug-06-2026 quote snapshot]; 10-K confirms no promoter/controlling group, 1,207 holders of record [FY25 10-K, Item 5, p.5289] | Minority-shareholder rights |
| Prior shareholder letters / guidance | Y (guidance only, no letters) | UberTechnologies,IncNYSEUBEREstimatesReport.xls, Guidance and Surprise tabs; Q1/Q2 FY26 transcripts | Promise-vs-delivery |
| M&A / buyback / dividend history | Y | Uber Technologies Inc NYSE UBER Key Developments.rtf (quarterly buyback tranche updates from the Feb-2024 $7bn / expanded $27bn authorization; pending Delivery Hero-related M&A activity); Financials_Annual.xls Cash Flow tab (dividends = $0 every year FY2016–LTM) | Capital-allocation scorecard |
| Management tenure / turnover | Y | Board Members.rtf / Professionals.rtf (CEO Khosrowshahi since Sep-2017, Chairman Sugar since Aug-2018); Key Developments.rtf (CFO transition to Balaji Krishnamurthy, in role since Feb-16-2026; CPO/President reorganization May-2026) | Stability and competence |
| Transcripts | Y | Q1 FY2026 (May-06-2026) and Q2 FY2026 (Aug-05-2026) earnings-call transcripts | Candor and tone |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/11_capital-allocation-governance.md | Y |
| business-model/01_disqualifier-scan.md | Y |
| business-model/12_red-flags-sweep.md | Y |
| business-model/02_business-identity.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/04_guidance-consensus.md | Y |

Both cross-module folders (`business-model/`, `earnings/`) are fully populated for this run, including their `99_*-synthesis.md` files. `business-model/01_disqualifier-scan.md` found no hard disqualifier triggered (0 of 8 tests; 0 of 5 near-misses in band) but routed two unadjudicated soft-integrity items to this module (see Section 6).

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No proxy / compensation disclosure | Y | 03, 99 | Incentive alignment max 50; usefulness max 70 |
| No ownership / insider-transaction data | Y | 04, 99 | Shareholder friendliness max 60 |
| No board disclosure | N (board disclosure IS available via CIQ Board Members export + 10-K Item 10 references) | 05, 99 | Not applied |
| No multi-year history | N (multi-year buyback/M&A/financials history is available — FY2016–LTM in the vendor workbooks, plus a multi-year Key Developments feed) | 02 | Not applied |
| No transcripts / prior letters | N (two transcripts available; no shareholder letters exist for this filer, but transcripts alone satisfy the module rule, which requires "transcripts OR prior letters") | 01, 06 | Not applied |

## 5A. Jurisdiction & Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | NYSE:UBER; SEC registrant [FY25 10-K cover page] |
| Exchange | NYSE | Public Company Profile, "NYSE:UBER — Common Stock" |
| Filing regime (US SEC / India SEBI-LODR / UK / Singapore / Other) | US SEC | 10-K / 10-Q filings with SOX §906 CEO/CFO certifications; Items 10–14 reference a "Proxy Statement" filed under SEC rules [FY25 10-K, p.33090 et seq.] |
| Sector | Passenger Ground Transportation / technology platform (Mobility, Delivery, Freight segments) | Public Company Profile, "Primary Industry Classification: Passenger Ground Transportation"; 10-K segment disclosure |
| Sector-specific governance overlay required? (Y/N + which) | N — none of the MODULE_RULES.md sector overlays (banks/NBFC, IT services, pharma, infra/real estate, holding company) apply; standard operating-company overlay used | MODULE_RULES.md "Sector-Specific Governance Overlays" |
| Document language(s) | English | All filings, transcripts, and CIQ exports are in English — no translation flag needed |

Because Uber is a US SEC filer, the canonical source is the DEF 14A proxy — not a local-market equivalent — and it is genuinely absent from this pool (not merely a naming mismatch). This is a true US-regime gap, not a jurisdiction-detection error.

## 5B. Source Coverage Matrix

| Governance Need | Best Available Source | Period | Confidence 1–5 | Missing? | Replacement Source |
|---|---|---|---:|---|---|
| Board composition | Board Members.rtf (CIQ) + 10-K Item 10 reference | Current (as of Aug-2026 extraction) | 3 | N | — |
| Compensation | Not available at the individual pay-table / metric-weight level | N/A | — | Y | 2026 DEF 14A Proxy Statement (not in pool) |
| Ownership | Public Company Profile investor-name list (no %); 10-K holder-of-record count | Feb-2026 / Aug-2026 | 2 | Partial | 2026 DEF 14A "Security Ownership" table + Schedule 13D/13G filings (not in pool) |
| Insider trades | Not available (no Form 4 data) | N/A | — | Y | SEC EDGAR Form 4 filings / Capital IQ Insider Transactions export (not in pool) |
| Related-party transactions | FY25 10-K Notes (Moove, Lime, Careem) | FY2025 | 5 | N (figures present; proxy-level RPT policy narrative absent) | 2026 Proxy Statement (RPT policy detail) |
| Auditor report | FY25 10-K, Report of Independent Registered Public Accounting Firm (PwC, unqualified, ICFR effective; auditor since 2014) | FY2025 | 5 | N | — |
| Secretarial / compliance report | Not applicable in the US regime (no equivalent required document) | N/A | — | N/A | — |
| AGM voting | Key Developments.rtf notes the AGM date (May-04-2026) and agenda (director elections, Say-on-Pay, Say-on-Pay frequency, PwC ratification) and vendor-sourced vote-count context, but not a primary-filing vote-result tally | May-2026 | 2 | Partial | 8-K filing of AGM voting results (not in pool) |
| Capital-allocation history | Key Developments.rtf (buyback tranches, M&A activity) + Financials_Annual/Quarterly.xls Cash Flow tabs | FY2016–LTM(Jun-2026) | 4 | N | — |
| Legal / regulatory cases | FY25 10-K Item 3 (driver classification, sexual-assault MDL, state unemployment tax); Key Developments.rtf (bellwether-trial verdicts) | FY2025–2026 | 4 | N | — |

## 5C. Data Freshness

| Source | Period | As-of Date | Age | Stale? | Impact |
|---|---|---|---|---|---|
| FY25 10-K | FY2025 (ended Dec-31-2025) | Filed Feb-13-2026 | ~6 months | N | Primary annual source, current |
| Q2 FY26 10-Q | Q2 FY2026 (ended Jun-30-2026) | Filed Aug-05-2026 | ~4 days | N | Most current filing in the pool |
| Q1 FY26 10-Q | Q1 FY2026 (ended Mar-31-2026) | Filed May-06-2026 | ~3 months | N | Current |
| Board Members / Professionals (CIQ) | Current roster | Extraction Aug-06-2026 | ~3 days | N | Reflects most recent management changes (CFO transition, CPO/President reorg) |
| Key Developments (CIQ) | Multi-year events feed through Aug-06-2026 | Extraction Aug-07-2026 | ~2 days | N | Covers buyback tranches and management-change events through mid-2026 |
| Public Company Profile (CIQ) | Quote/ownership snapshot | Extraction Aug-08-2026 (quote as of Aug-06-2026 close) | ~1 day | N | Current |
| 2026 Proxy Statement | N/A | Not in pool | N/A | N/A — absent, not stale | The single most valuable missing document (see Section 6) |

Source manifest CSV export: **pending** — this subagent has no separate file-output channel beyond this markdown report; the synthesis layer should derive `source_manifest.csv` from Sections 1–2 and 5B–5C if a CSV sidecar is required downstream.

## 6. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** Board composition, related-party figures, control structure, multi-year capital-allocation history, management-turnover events, and two current earnings-call transcripts are all present and usable, but the proxy/DEF 14A that would carry individual executive-compensation tables (metrics and weights), the beneficial-ownership percentage table, and Section 16 insider-transaction data is genuinely absent from the pool — a true gap for a US SEC filer, not a jurisdiction-mapping error. The 10-K's own Items 11–14 confirm this by deferring every comp/ownership/related-party item to the "2026 Proxy Statement," which was not ingested.
- **Specialists that can run:** management track record (01), capital allocation (02), board and shareholder rights (05, on the data that is present), candor (06) — all with the pool's own filings, transcripts, and the CIQ dossiers. Incentives (03) and ownership/insider behavior (04) can run but are capped per MODULE_RULES.md because their primary source document is missing.
- **Hard disqualifier already flagged by business-model/01_disqualifier-scan?** N — no disqualifier triggered (all 8 tests: N; 0 of 5 near-misses in band). Two soft, unproven integrity signals were routed to this module for context, not as a verdict-lock trigger: (1) a discontinued consolidated Adjusted-EBITDA-to-GAAP reconciliation (starting Q1 FY2026) alongside continued guidance-beat claims, flagged as a disclosure-candor issue in `earnings/06`/`earnings/08`, not a proven misstatement; (2) an unadjudicated shareholder derivative lawsuit (filed Jul-23-2026, N.D. Cal.) naming the CEO, Chairman, all sitting directors, and two former CFOs, alleging the board ignored an internal ML safety-incident risk model — confidence 2/5, unadjudicated. Neither meets the proven-fraud bar for a hard lock; both should be weighed by the management-track-record and candor specialists (RF-MGT-005 territory).
- **Active partial-data caps:**
  - No proxy / compensation disclosure → Incentive alignment (03) max 50; Overall usefulness (99) max 70.
  - No ownership / insider-transaction data → Shareholder friendliness (04/99 read) max 60.
- **Critical missing items:**
  - 2026 DEF 14A Proxy Statement (executive compensation tables and metric weights, beneficial-ownership percentage table, Section 16 insider-transaction history, RPT policy narrative, AGM vote-result tallies) — not in `data/UBER/`.
  - Standalone 8-K filings for the CFO transition (Feb-2026) and CPO/President reorganization (May-2026) — only available secondhand via the CIQ Key Developments vendor feed, not the primary SEC filing.
- **Single highest-value missing document:** The 2026 DEF 14A Proxy Statement (or, failing that, the prior-year DEF 14A) — it would resolve the compensation-metric, beneficial-ownership, and insider-transaction gaps simultaneously and is the single document Items 10–14 of the FY25 10-K point to by reference.
