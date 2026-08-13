# Governance Data Triage — INDIAMART

No `ciq_facts.json` sidecar exists for this run (checked: not present under `analyses/INDIAMART_2026-08-13/_pool_extracts/` or elsewhere in the run folder). All figures below are this agent's own sourced read of the CIQ workbook extracts and the filing PDFs, consistent with `business-model/01_disqualifier-scan` and `business-model/11_capital-allocation-governance`, which report the same absence. `data/INDIAMART/external/` does not exist — there is no externally sourced (alt-data / expert-call / broker-research) material in this pool, so Section 1A is omitted.

`.claude/tools/extract_pool.py` was re-run and reported **fresh — 38 workbook(s) → 81 tab(s); 128 extract file(s); 0 failure(s)**. Every source in the pool extracted cleanly; none is treated as missing on extraction grounds.

## 1. File Inventory

Filenames are as they appear under `data/INDIAMART/`. "Last Modified" is the filesystem sync timestamp (all files synced 2026-08-13, per `ls -la`) — **not** a real document date; the "Period Covered" column instead reports the date/period parsed from inside each document, per CLAUDE.md fix F23. Multi-tab workbooks are expanded to one row per tab, reconciled against `_pool_extracts/manifest.md` (0 failures, 128/128 extracts present).

| Filename | Type | Period Covered | Last Modified (sync) | Governance Relevance |
|---|---|---|---|---|
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf | AGM Notice + Integrated Annual Report (India proxy-equivalent + audited annual report) | 27th AGM Notice; FY2025-26 (year ended 31-Mar-2026); postal-ballot result Aug-29-2025 | 2026-08-13 05:57 | High |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf | Audited standalone/consolidated financial statements + Auditor's Report (exchange filing) | FY ended 31-Mar-2026 | 2026-08-13 05:57 | High |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-29-2025).pdf | Audited standalone/consolidated financial statements + Auditor's Report (prior-year annual filing) | FY ended 31-Mar-2025 | 2026-08-13 05:57 | High |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf | Quarterly filing (SEBI LODR Reg 33, audited) | Q1 FY27, qtr ended 30-Jun-2026 | 2026-08-13 05:57 | Medium |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jan-20-2026).pdf | Quarterly filing (SEBI LODR Reg 33, audited) | Q3 FY26, qtr + 9-month ended 31-Dec-2025 | 2026-08-13 05:57 | Medium |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Oct-17-2025).pdf | Quarterly filing (SEBI LODR Reg 33, audited) | Q2 FY26, qtr + half-year ended 30-Sep-2025 | 2026-08-13 05:57 | Medium |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-18-2025).pdf | Quarterly filing (SEBI LODR Reg 33, audited) | Q1 FY26, qtr ended 30-Jun-2025 | 2026-08-13 05:57 | Medium |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Annual_Report(Apr-30-2026).pdf | Preliminary/press-release version of FY26 results (exchange intimation) | FY ended 31-Mar-2026, preliminary | 2026-08-13 05:57 | Low (superseded by final Annual Report) |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jul-21-2026).pdf | Preliminary quarterly results (exchange intimation / board-meeting outcome) | Q1 FY27, qtr ended 30-Jun-2026, preliminary | 2026-08-13 05:57 | Low (dup of final interim) |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Apr-30-2026).pdf | Preliminary quarterly results (exchange intimation) | Q4/FY26, qtr+year ended 31-Mar-2026, preliminary | 2026-08-13 05:57 | Low (dup) |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-20-2026).pdf | Preliminary quarterly results (exchange intimation) | Q3 FY26, qtr ended 31-Dec-2025, preliminary | 2026-08-13 05:57 | Low (dup) |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Oct-17-2025).pdf | Preliminary quarterly results (exchange intimation) | Q2 FY26, qtr ended 30-Sep-2025, preliminary | 2026-08-13 05:57 | Low (dup) |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jul-18-2025).pdf | Preliminary quarterly results (exchange intimation) | Q1 FY26, qtr ended 30-Jun-2025, preliminary | 2026-08-13 05:57 | Low (dup) |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Apr-29-2025).pdf | Preliminary quarterly/annual results (exchange intimation) | Q4/FY25, year ended 31-Mar-2025, preliminary | 2026-08-13 05:57 | Low (superseded by final AR FY25) |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-22-2025).pdf | Preliminary quarterly results (exchange intimation) | Q3 FY25, qtr ended 31-Dec-2024, preliminary | 2026-08-13 05:57 | Low (dup) |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-21-2025).pdf | Preliminary quarterly results (exchange intimation) | Q3 FY25, near-duplicate of Jan-22-2025 filing | 2026-08-13 05:57 | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Board Members.xls — tab "Board Members" | CIQ export — board composition | Current board members as of CIQ snapshot (director tenures listed 1999–2025) | 2026-08-13 15:06 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Committees.xls — tab "Committees" | CIQ export — board committee membership | Current committee membership (Audit, Compensation, Corp. Governance, Finance, Investment, Risk, Nominating) | 2026-08-13 15:06 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Compensation Summary Compensation.xls — tab "Summary Compensation" | CIQ export — executive/director pay | FY2022–FY2025 (per-name, per-year cash comp) | 2026-08-13 15:06 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Auditors.xls — tab "Auditors" | CIQ export — auditor history & opinion | FY2015, FY2018–FY2026 | 2026-08-13 15:26 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Public Ownership Summary.rtf | CIQ export — institutional/insider ownership, top holders | Position dates 31-Mar-2026 (institutions) and 21-Jul-2026 (Nalanda Capital) | 2026-08-13 15:26 | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Private Ownership.rtf | CIQ export — VC/PE/private investor history | Historical, 2007–2016 deal dates, current/prior flags | 2026-08-13 15:26 | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Key Developments.xls — tab "Key Developments" | CIQ export — news/events feed | Last 6 months (Feb–Aug 2026) | 2026-08-13 15:28 | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Corporate Timeline.xls — tab "Corporate Timeline" | CIQ export — company history | Full corporate history, 1999–2026 | 2026-08-13 15:05 | Medium |
| IndiaMART InterMESH Limited (NSEI_INDIAMART) Corporate Structure Tree.xls — tab "IndiaMART InterMESH Limited NS" | CIQ export — corporate/subsidiary structure | Current structure snapshot | 2026-08-13 15:29 | Medium |
| IndiaMART InterMESH Limited (NSEI_INDIAMART) Corporate Structure Tree.xls — tab "Filtered Count" | CIQ export — structure metadata | Current snapshot | 2026-08-13 15:29 | Low |
| IndiaMART InterMESH Limited (NSEI_INDIAMART) Corporate Structure Tree.xls — tab "Aggregates" | CIQ export — structure metadata | Current snapshot | 2026-08-13 15:29 | Low |
| Transaction Summary M A Private Placements.xls — tab "M A Private Placements" | CIQ export — M&A/PE deal history | ~10-yr history to 2026 | 2026-08-13 15:26 | Medium |
| Transaction Summary Public Offerings.xls — tab "Public Offerings" | CIQ export — equity issuance history | Multi-year history | 2026-08-13 15:26 | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Investment Analysis Co Investors.xls — tab "Co-Investors" | CIQ export — co-investor mapping | Current/historical | 2026-08-13 15:29 | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Investment Analysis Direct Investments.xls — tab "Direct Investments" | CIQ export — company's own minority investments | Current/historical, ~15+ startup stakes | 2026-08-13 15:29 | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Comparable M A Transactions.xls — tab "Comparable M A Transactions" | CIQ export — peer M&A comps | Historical comps | 2026-08-13 15:09 | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Transaction Advisors.xls — tab "Transaction Advisors" | CIQ export — deal advisors | Historical | 2026-08-13 15:26 | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Fixed Income Securities Summary.xls — tab "Securities Summary" | CIQ export — debt securities | Current (none outstanding of note) | 2026-08-13 15:10 | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Transcripts.xls — tab "Transcripts" | CIQ export — call metadata/index | Q3 2021 (Jan-2021) through Q1 2027 (Jul-2026) | 2026-08-13 15:27 | Medium |
| 21× "IndiaMART InterMESH Limited, Q_ 20__ Earnings Call, ___.pdf" (Q3 FY2021 → Q1 FY2027) | Earnings-call transcripts (verbatim) | Jan-2021 through Jul-2026, one per quarter, near-complete run | 2026-08-13 05:34 | High (candor track record) |
| IndiaMART InterMESH Limited - ShareholderAnalyst Call.pdf | Shareholder/analyst call transcript | 20-Jun-2024 | 2026-08-13 05:34 | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Events Calendar.xls — tab "Events Calendar" | CIQ export — corporate events feed | Forward + historical events | 2026-08-13 15:27 | Low |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls — tabs Consensus / Recent Changes / Multiples / Surprise / Trends / Revisions (6 tabs) | CIQ Estimates export — sell-side consensus | Consensus current through Q1 FY27 print (Jul-21-2026); Recent Changes log to 2026-07-30 | 2026-08-13 15:04 | Low (earnings-module input, not governance) |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport (1).xls — tab "Consensus" | CIQ Estimates export (duplicate) | Same as above | 2026-08-13 15:08 | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls / Financials (1).xls / Financials Balance Sheet.xls / Financials Cash Flow.xls / Financials Income Statement.xls / Financials Income Statement (1).xls / Financials Key Stats.xls / Financials Pension OPEB.xls / Financials Ratios.xls / Financials Segments.xls / Financials Supplemental.xls / Financials Capital Structure Details.xls / Financials Capital Structure Summary.xls — 30 tabs total across these workbooks (Key Stats, Income Statement, Balance Sheet, Cash Flow, Multiples, Historical Capitalization, Capital Structure Summary/Details, Ratios, Supplemental, Industry Specific, Pension OPEB, Segments) | CIQ financial-statement exports | FY2022–LTM Jun-2026 (multi-year) | 2026-08-13 15:04–15:08 | Medium (capital-allocation scorecard: Cash Flow, Capital Structure, Ratios tabs feed dividends/buyback/debt history) |
| IndiaMART InterMESH Limited NSEI INDIAMART Credit Health Panel.xls — tabs Summary / Financials / Operational Metrics Charts / Solvency Metrics Charts / Liquidity Metrics Charts / Disclaimer (6 tabs) | CIQ export — credit/solvency panel | Multi-year, current snapshot | 2026-08-13 15:10 | Low (balance-sheet module's remit) |
| Company Comparable Analysis IndiaMART InterMESH Limited.xls — tabs Financial Data / Trading Multiples / Operating Statistics / Business Description / Implied Valuation / Valuation Chart / Credit Health Panel / Disclaimer (8 tabs) | CIQ comps/valuation export | Current comp set | 2026-08-13 15:05 | Low (valuation module's remit) |
| IndiaMART InterMESH Limited NSEI INDIAMART Customers.xls, Suppliers.xls, Competitors.xls, Products.xls, Strategic Alliances.xls, Offices.rtf, Long Business Description.rtf, Public Company Profile.rtf, Industry Classifications.rtf, Professionals.rtf, Analyst Coverage.rtf | CIQ business-context exports | Current snapshots | 2026-08-13 05:34–15:26 | Low (business-model module's remit) |

**Totals reconciled to manifest:** 38 workbooks → 81 tabs → 128 extract files, 0 failures [`_pool_extracts/manifest.md`]. All rows above account for every workbook tab and every standalone PDF/RTF in `data/INDIAMART/`.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months, vs 2026-08-13) |
|---|---|---|---|
| Proxy / DEF 14A (India equivalent: AGM Notice + Corporate Governance Report) | `IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf` | 27th AGM Notice + Integrated Annual Report FY2025-26; postal-ballot result 29-Aug-2025 | ~2.4 |
| Annual filing (audited) | `IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf` (same doc, fuller than the Apr-30-2026 financials-only filing) | FY ended 31-Mar-2026 | ~2.4 |
| Compensation disclosure | Corporate Governance Report inside the Jun-02-2026 filing (remuneration table, p.123 per cross-reference) + CIQ Compensation Summary Compensation.xls | FY2026 (CG Report) / FY2022–FY2025 (CIQ time series) | ~2.4 (CG Report) |
| Ownership / insider-transaction data | CIQ Public Ownership Summary.rtf + Corporate Governance Report "A. Promoters Holdings" | 31-Mar-2026 (promoter table); 21-Jul-2026 (Nalanda Capital position) | ~0.7–4.5 |
| Shareholder letter | MD & CEO's message ("Dear Shareholders," Jun-02-2026 Annual Report, line ~1120) | FY2025-26 | ~2.4 |
| Transcript | `IndiaMART InterMESH Limited, Q1 2027 Earnings Call, Jul 21, 2026.pdf` | Q1 FY27, qtr ended 30-Jun-2026 | ~0.7 |
| 8-K equivalent (NSE/BSE material-event intimation; management-change disclosures) | Preliminary Interim Report (Jul-21-2026) board-outcome filing; KMP change table in Jun-02-2026 Annual Report Note 33 | Most recent board-meeting outcome 21-Jul-2026; most recent disclosed KMP change CFO transition 15-Jun-2024 | ~0.7 (latest filing) / ~26 (latest KMP change) |

## 3. Governance Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Proxy / DEF 14A (India: AGM Notice + Corporate Governance Report) | Y | `Form_Annual_Report(Jun-02-2026).pdf` — 27th AGM Notice + Integrated Annual Report FY2025-26 | Comp, ownership, board, related-party disclosure all sit inside this one filing |
| Compensation disclosure (metrics/weights) | Y (partial — quantum disclosed, not full metric weighting) | CIQ Compensation Summary Compensation.xls (FY2022–FY2025 per-name cash pay); CG Report remuneration table (p.123) | Incentive alignment — pay level and per-name detail are present; the *formula/weighting* behind bonus payouts is not yet confirmed present, to be checked by agent `03` |
| Beneficial ownership table | Y | CG Report "A. Promoters Holdings" (49.17%, 31-Mar-2026) + CIQ Public Ownership Summary top-holders table | Skin in the game, control — Dinesh Agarwal 29.09% + Brijesh Agrawal 19.99% |
| Insider-transaction data (buys/sells) | Y (partial) | CIQ Public Ownership Summary "Ownership Activity" (institutional flow only); Secretarial Audit Report flags a Designated-Person pledge and a closed-window trade | No dedicated SAST/PIT insider-trading disclosure workbook is in the pool; the two compliance-lapse items are the only individual-level trading signal found |
| Board composition / independence | Y | CIQ Board Members.xls (27 rows, roles, tenure, independence status) + CIQ Committees.xls | Board quality, entrenchment |
| Related-party disclosure | Y | FY26 Annual Report Note 33 (RPT); BRSR Principle 1 RPT ratios; postal-ballot RPT resolution (Amit Agarwal, 21.72% against) | Value leakage |
| Control structure (dual-class / blocs) | Y | CG Report shareholding pattern; ordinary single-class equity, promoter group 49.17%, no dual-class structure found | Minority-shareholder rights |
| Prior shareholder letters / guidance | Y | MD & CEO message in each Annual Report (FY25, FY26); 21 quarterly earnings-call transcripts back to Q3 FY2021 | Promise-vs-delivery |
| M&A / buyback / dividend history | Y | Transaction Summary M&A Private Placements.xls (~10-yr history); Financials Cash Flow.xls (buybacks FY23/FY24, dividends FY22–FY26) | Capital-allocation scorecard |
| Management tenure / turnover | Y | CIQ Board Members.xls (tenure years); FY26 AR Note 33 KMP table (CFO transition Jun-2024); postal-ballot/AGM director changes | Stability and competence |
| Transcripts | Y | 21 quarterly earnings-call PDFs, Q3 FY2021–Q1 FY2027, plus a separate Jun-2024 Shareholder/Analyst Call | Candor and tone |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/11_capital-allocation-governance.md | Y |
| business-model/01_disqualifier-scan.md | Y |
| business-model/12_red-flags-sweep.md | Y |
| business-model/02_business-identity.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/04_guidance-consensus.md | Y |

All six cross-module files are present under `analyses/INDIAMART_2026-08-13/business-model/` and `analyses/INDIAMART_2026-08-13/earnings/`. `business-model/01_disqualifier-scan.md` confirms 0/8 disqualifiers triggered and 0/5 near-misses in band; `business-model/11_capital-allocation-governance.md` already scored Capital Allocation 74/100 with the acquisition-pattern signal (58/100 severity) as the most material item, and flagged the same Designated-Person pledge lapse and the 21.72%-against RPT postal-ballot vote that this triage also surfaces below.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No proxy / compensation disclosure | N | 03, 99 | Not applied — proxy-equivalent (AGM Notice + CG Report) and CIQ compensation export are both present |
| No ownership / insider-transaction data | N (minor partial — see note) | 04, 99 | Not applied at full severity; note that dedicated per-transaction insider buy/sell data (SAST/PIT filings) is not in the pool beyond the two Secretarial Audit compliance-lapse items — agent `04` should flag this narrower gap itself if it needs transaction-level insider trading history |
| No board disclosure | N | 05, 99 | Not applied — Board Members.xls, Committees.xls, and the CG Report jointly cover composition and independence |
| No multi-year history | N | 02 | Not applied — CIQ Financials/Cash Flow/Capital Structure tabs and the Transaction Summary M&A workbook cover FY2016–LTM Jun-2026 |
| No transcripts / prior letters | N | 01, 06 | Not applied — 21 quarterly transcripts (Q3 FY2021–Q1 FY2027) plus two annual shareholder letters (FY25, FY26) are present |

No partial-data caps from the module's Score Cap Rules table are triggered by data availability. (Downstream agents may still apply the §24-filter caps in `business-model/11` — e.g. the acquisition-pattern severity score — but those are content-based judgments for agents `02`/`99`, not data-availability caps owned by this triage.)

## 5A. Jurisdiction & Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | India | Every regulatory filing addressed "To, BSE Limited / National Stock Exchange of India Limited" [`Form_Annual_Report(Jun-02-2026)`] |
| Exchange | NSE: INDIAMART; BSE: 542726 | [`Form_Annual_Report(Jun-02-2026)`, "LISTING OF SHARES" section] |
| Filing regime | India — SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015 + Companies Act 2013, Ind AS reporting | [`Form_Annual_Report(Jun-02-2026)`, cites "Regulations 30, 34 of SEBI (LODR) Regulations, 2015"] |
| Sector | Online B2B marketplace / classifieds platform for MSME suppliers (plus a smaller consolidated accounting-software subsidiary, Busy Infotech) | [`business-model/02_business-identity.md`] |
| Sector-specific governance overlay required? | N — the module's five defined overlays (banks/NBFCs/insurers, IT services, pharma, infra/real estate, holding companies) do not name online-marketplace/classifieds; standard governance lens applies. The company's own related-party lens does need one line of attention because of the Busy Infotech goodwill/impairment testing and the ~15+ minority-stake venture portfolio (a capital-allocation, not sector-overlay, matter — already flagged in `business-model/11`) | `.claude/agents/management-governance/MODULE_RULES.md` §"Sector-Specific Governance Overlays" |
| Document language(s) | English throughout (filings, transcripts, CIQ exports) | Direct inspection of all extracts |

Per CLAUDE.md §27, US form names (DEF 14A, 10-K, Form 4) do not apply here and are not treated as missing; the local equivalents (AGM Notice + Corporate Governance Report, Integrated Annual Report, shareholding-pattern table inside the CG Report) are used throughout this triage.

## External data

`data/INDIAMART/external/` does not exist in this pool. No externally sourced alt-data, expert-call, channel-check, or broker-research documents are present. This is not a gap — external data is enrichment only, never required for the sufficiency verdict — and Section 1A is omitted because there is nothing to list.

## 5B. Source Coverage Matrix

| Governance Need | Best Available Source | Period | Confidence 1–5 | Missing? | Replacement Source |
|---|---|---|---:|---|---|
| Board composition | CIQ Board Members.xls + CG Report (Jun-02-2026 AR) | Current, tenure back to 1999 | 5 | N | — |
| Compensation | CG Report remuneration table (p.123) + CIQ Compensation Summary Compensation.xls | FY2026 (CG Report) / FY2022–FY2025 (CIQ) | 5 | N | — |
| Ownership | CG Report "Promoters Holdings" (49.17%, 31-Mar-2026) + CIQ Public Ownership Summary | 31-Mar-2026 / 21-Jul-2026 | 5 | N | — |
| Insider trades | Secretarial Audit Report, Annexure-A (two Designated-Person compliance lapses) | FY2026 audit period | 3 (narrow — procedural lapses only, not a full trading log) | Partial | None in pool; a dedicated SAST/PIT filing would be the ideal replacement |
| Related-party transactions | FY26 Annual Report Note 33 + BRSR Principle 1 RPT ratios + postal-ballot RPT resolution result | FY2026 | 5 | N | — |
| Auditor report | CIQ Auditors.xls (FY2015–FY2026) + Independent Auditor's Report inside Jun-02-2026 AR | FY2015–FY2026 | 5 | N | — |
| Secretarial / compliance report | Secretarial Audit Report, Annexure-A (Jun-02-2026 AR) | FY2026 | 5 | N | — |
| AGM voting | Postal Ballot results section (Jun-02-2026 AR): two resolutions, votes for/against disclosed, incl. 21.72% against on the RPT resolution | Postal ballot dated 28-Jul-2025, result 29-Aug-2025 | 5 | N | — |
| Capital-allocation history | CIQ Financials Cash Flow.xls + Capital Structure Summary.xls + Transaction Summary M&A Private Placements.xls | FY2016–LTM Jun-2026 | 5 | N | — |
| Legal / regulatory cases | FY26 Annual Report Note 35 (contingent liabilities — two indirect-tax disputes under appeal) | As at 31-Mar-2026 | 4 | N | — |

## 5C. Data Freshness

| Source | Period | As-of Date | Age | Stale? | Impact |
|---|---|---|---|---|---|
| AGM Notice + Integrated Annual Report (proxy-equivalent) | FY2025-26 | 2026-06-02 (filing date) | ~2.4 months | N | Primary governance source is current |
| CG Report shareholding pattern (promoter holdings) | As at 31-Mar-2026 | 2026-03-31 | ~4.5 months | N | Current within normal quarterly-refresh cadence |
| CIQ Public Ownership Summary — Nalanda Capital position | 21-Jul-2026 | 2026-07-21 | ~0.7 months | N | Very current |
| CIQ Compensation Summary Compensation.xls | FY2022–FY2025 | Latest column FY2025 | ~1 year behind FY2026 CG Report figure | N (CG Report FY2026 remuneration table fills the gap for the latest year) | Agent `03` should reconcile the CIQ time series against the FY2026 CG Report table rather than treat FY2025 as the latest year |
| Latest earnings-call transcript | Q1 FY27 | 2026-07-21 | ~0.7 months | N | Very current for candor/tone read |
| Latest interim filing | Q1 FY27, qtr ended 30-Jun-2026 | 2026-07-21 | ~0.7 months | N | Very current |
| Secretarial Audit Report (compliance lapses) | FY2026 audit period | Filed with Jun-02-2026 AR | ~2.4 months | N | Current |

Write a source manifest to `analyses/INDIAMART_2026-08-13/management-governance/source_manifest.csv`: **pending** — this subagent returns findings inline per its operating instructions (file I/O for sidecars is the orchestrator's/synthesizer's job); the Source Coverage Matrix above stands in as the markdown equivalent.

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has a current India proxy-equivalent (27th AGM Notice + Integrated Annual Report FY2025-26, filed 2026-06-02, with Corporate Governance Report, BRSR, and postal-ballot voting results), a full board/committee export, a multi-year compensation export cross-checked against the CG Report's current-year remuneration table, a beneficial-ownership table (CG Report + CIQ), related-party and secretarial-audit disclosure, and a multi-year (FY2016–LTM Jun-2026) capital-allocation history — so all six specialists can run without a cap from missing data.
- **Specialists that can run:** management track record, capital allocation, incentives, ownership, board, candor — all six.
- **Hard disqualifier already flagged by business-model/01_disqualifier-scan?** N — 0 of 8 disqualifiers triggered, 0 of 5 near-misses in band [`business-model/01_disqualifier-scan.md`]. One soft integrity signal is noted there (a Secretarial Audit finding of a Designated-Person pledge made without pre-clearance, and a one-share closed-window trade by another Designated Person) — both are disclosed, self-reported, and immaterial in magnitude, routed to this module as a minor compliance-control flag rather than a disqualifier.
- **Active partial-data caps:** None from the module's Score Cap Rules table. One narrower content gap to flag for agent `04`: the pool has no dedicated per-transaction insider buy/sell (SAST/PIT) filing — only the two Secretarial Audit compliance-lapse items — so agent `04`'s "recent net insider buying/selling (12 months)" read will be limited to what the ownership-activity table and Key Developments feed show, not a full insider-transaction ledger.
- **Critical missing items:** None.
- **Single highest-value missing document:** A dedicated SAST/PIT (Prohibition of Insider Trading) transaction-disclosure filing or exchange intimation log, to give agent `04` a real per-transaction insider buy/sell history rather than relying on the Secretarial Audit's two compliance-lapse mentions and the CIQ institutional-ownership flow table.
