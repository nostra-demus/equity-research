# Governance Data Triage — ORCL

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Governance Relevance |
|---|---|---|---|---|
| Oracle_Corporation_-_Form_10-K(Jun-22-2026).doc | Annual filing (audited, US SEC) | FY26 (ended May-31-2026), filed Jun-22-2026 | 2026-08-13 (Drive-sync date, not period date) | High |
| Oracle_Corporation_-_Form_10-Q(Mar-11-2026).doc | Interim filing (US SEC) | Q3 FY26 (three/nine months ended Feb-28-2026), filed Mar-11-2026 | 2026-08-13 | Medium |
| Oracle Corporation NYSE ORCL Public Ownership History.xls → tab "History" | Ownership export (institutional + insider, quarterly) | ~2004 through latest (Jun-25/Sep-25/Dec-25/Mar-26 columns) | 2026-08-14 | High |
| Oracle Corporation NYSE ORCL Public Ownership Insider Trading.xls → tab "Insider Trading" | Insider-transaction export (Form 4-sourced) | 2004-06-08 through 2026-06-26 | 2026-08-13 | High |
| Oracle Corporation NYSE ORCL Public Ownership Summary.rtf | Ownership summary (aggregate % by holder type) | As of latest filing date (2026) | 2026-08-14 | High |
| Oracle Corporation NYSE ORCL Key Developments.xls → tab "Key Developments" | Event log (incl. 8-K-type disclosures, both NYSE:ORCL and unrelated India-listed subsidiary BSE:532466) | 2004–2026 | 2026-08-13 | High |
| Oracle Corporation, Q3 2026 Earnings Call, Mar 10, 2026.rtf | Transcript | Q3 FY26 (Mar-10-2026) | 2026-08-13 | Medium |
| Oracle Corporation, Q4 2026 Earnings Call, Jun 10, 2026.rtf | Transcript (most recent) | Q4 FY26 / FY26 full year (Jun-10-2026) | 2026-08-13 | Medium |
| Oracle_Earnings Press Release Q4FY26.pdf | Results release | Q4 FY26 (period ended May-31-2026) | 2026-08-13 | Low |
| Oracle_Latest_Earnings_Presentation-Slides-Q4-26.pdf | Investor deck | Q4 FY26 | 2026-08-13 | Low |
| OracleCorporationNYSEORCLEstimatesReport.xls → tab "Guidance" | Vendor guidance-vs-actual export | Multi-year, through FY26 | 2026-08-13 | Medium (candor / promise-vs-delivery cross-check) |
| OracleCorporationNYSEORCLEstimatesReport.xls → tabs "Consensus", "Recent Changes", "Multiples", "Surprise", "Trends", "Revisions" | Vendor estimates/consensus data | Multi-year | 2026-08-13 | Low |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls → tabs "Summary", "Financials", "Operational/Solvency/Liquidity Metrics Charts", "Disclaimer" | Vendor credit-health panel | Latest + trailing | 2026-08-14 | Low (feeds balance-sheet-survival, not governance directly) |
| Oracle Corporation NYSE ORCL Financials_Annual.xls (12 tabs: Key Stats, Income Statement, Balance Sheet, Cash Flow, Multiples, Historical Capitalization, Capital Structure Summary/Details, Ratios, Supplemental, Industry Specific, Pension OPEB, Segments) | Vendor financial export | FY2016A–FY2026A | 2026-08-13 | Medium (feeds capital-allocation scorecard) |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls (12 tabs, same structure) | Vendor financial export | Quarterly, multi-year | 2026-08-13 | Low |
| Company Comparable Analysis Oracle Corporation.xls (8 tabs: Financial Data, Trading Multiples, Operating Statistics, Business Description, Implied Valuation, Valuation Chart, Credit Health Panel, Disclaimer) | Peer comp export | Latest | 2026-08-13 | Low |
| ORCL_Charting Excel Export - Aug 13th 2026 4_48_01 pm.xls (3 tabs: Pane 1, Raw, Attributions) | Price/volume chart export | Trailing | 2026-08-13 | Low |
| Oracle_Short_Interest_Charting Excel Export Aug-13-2026 10_07 AM.xls (2 tabs: Chart 1 with Data, Attributions) | Short-interest export | Trailing | 2026-08-13 | Low |
| Oracle Corporation NYSE ORCL Events Calendar.xls → tab "Events Calendar" | Corporate events calendar (dividends, earnings dates, AGM of the unrelated India subsidiary) | 2004–2026 | 2026-08-14 | Low |
| Oracle Corporation NYSE ORCL Public Company Profile.rtf | Company profile (HQ, sector, ownership registry, price snapshot) | Latest | 2026-08-14 | Medium (jurisdiction/sector confirmation) |
| Oracle Corporation NYSE ORCL Customers.rtf | Customer list | Latest | 2026-08-14 | Low |
| Oracle Corporation NYSE ORCL Suppliers.rtf | Supplier list | Latest | 2026-08-14 | Low |

No `data/ORCL/external/` folder exists in this pool — Section 1A (External Data) is omitted.

Pool extraction: `python3 .claude/tools/extract_pool.py "data/ORCL/" "analyses/ORCL_2026-08-14/_pool_extracts"` ran clean — **11 workbooks → 56 tabs, 66 extract files, 0 failures** [`_pool_extracts/manifest.md`]. Every tab above is reconciled against the manifest; no workbook is left as a single opaque row.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Proxy / DEF 14A | **Not in pool.** The FY26 10-K states Items 10–14 (directors, compensation, ownership, related-party, principal-accountant fees) are "incorporated by reference" from the **2026 Proxy Statement**, which "will be filed with the U.S. Securities and Exchange Commission within 120 days of the registrant's fiscal year ended [May 31, 2026]" [FY26 10-K, p.741 and Items 10–14, lines 2358–2665]. That deadline is ~Sept 28, 2026 — after this run's date (Aug 14, 2026), so the proxy genuinely does not yet exist, not merely "missing from the pool." | Not filed yet |
| Annual filing | Oracle_Corporation_-_Form_10-K(Jun-22-2026).doc | FY26, ended May-31-2026, filed Jun-22-2026 | ~2 |
| Compensation disclosure | Not in pool (incorporated by reference to unfiled 2026 Proxy Statement) | — | — |
| Ownership / insider-transaction data | Oracle Corporation NYSE ORCL Public Ownership History.xls + Insider Trading.xls + Summary.rtf | Insider trades through 2026-06-26; ownership snapshot columns through Mar-31-2026/"Latest" | <2 |
| Shareholder letter | Not in pool — Oracle does not publish an annual chairman/CEO shareholder letter in this pool; nearest substitute is the Q4 FY26 earnings-call transcript | Jun-10-2026 | 2 |
| Transcript | Oracle Corporation, Q4 2026 Earnings Call, Jun 10, 2026.rtf | Q4 FY26 (Jun-10-2026) | 2 |
| 8-K (management changes) | No standalone 8-K file, but the Key Developments export carries the equivalent disclosure: "Oracle Corporation Announces Executive and Board Changes, Effective September 22, 2025" (Safra Catz → Executive Vice Chair; Clayton Magouyrk and Michael Sicilia promoted to co-CEO and Board; Douglas Kehring promoted to EVP/Principal Financial Officer) [Oracle Corporation NYSE ORCL Key Developments.xls, "Executive/Board Change – Other", 2025-09-22]; also referenced directly in the FY26 10-K's Item 10 executive-officer bios (line ~23356 onward) | 11 (event date) |

## 3. Governance Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Proxy / DEF 14A | N | Not filed yet (2026 Proxy Statement due within 120 days of FYE, i.e. by ~Sept-28-2026); FY26 10-K Items 10–14 defer to it | Comp, ownership, board, related-party |
| Compensation disclosure (metrics/weights) | N | No SCT, no LTIP metric/weight table anywhere in the pool | Incentive alignment |
| Beneficial ownership table | Y | Oracle Corporation NYSE ORCL Public Ownership Summary.rtf + Public Ownership History.xls | Skin in the game, control |
| Insider-transaction data (buys/sells) | Y | Oracle Corporation NYSE ORCL Public Ownership Insider Trading.xls (2004–2026, Form-4-sourced) | Conviction signal |
| Board composition / independence | Partial | Insider Trading tab carries director names + CIQ-assigned titles (e.g. "Chizen, Bruce R. (Lead Independent Director)"; "Boskin, Michael J. (Independent Director)"), and FY26 10-K Item 10 lists executive officers — but there is no full board roster, no formal independence determination, no committee membership table (that lives in the unfiled proxy) | Board quality, entrenchment |
| Related-party disclosure | Partial | FY26 10-K, Notes to Consolidated Financial Statements, "Related Party Disclosures" — states only that ASC 850 equity-method investees (e.g. Ampere Computing, sold to SoftBank Nov-25-2025) are related parties, with no transaction dollar amounts; Item 13 (the fuller related-party/director-independence disclosure) defers to the unfiled proxy | Value leakage |
| Control structure (dual-class / blocs) | Y | Public Company Profile.rtf + Ownership Summary: single common-stock class; co-founder/Executive Chair Lawrence J. Ellison holds ~40.45% ("Individuals/Insiders") per Ownership Summary — a large, stable insider bloc but not a dual-class/super-voting structure | Minority-shareholder rights |
| Prior shareholder letters / guidance | Partial | No shareholder letter; guidance history available via OracleCorporationNYSEORCLEstimatesReport.xls "Guidance" tab and the two earnings-call transcripts (Q3, Q4 FY26) | Promise-vs-delivery |
| M&A / buyback / dividend history | Y | Oracle Corporation NYSE ORCL Financials_Annual.xls (Cash Flow, Capital Structure tabs, FY2016A–FY2026A) + FY26 10-K disclosures (repurchase, dividend, Mandatory Convertible Preferred, ATM program) | Capital-allocation scorecard |
| Management tenure / turnover | Y | FY26 10-K Item 10 executive-officer bios + Key Developments "Executive/Board Change" event (Sept-22-2025 CEO transition; CFO transition to Hilary Maxson, per business-model cross-module read, Apr-2026) | Stability and competence |
| Transcripts | Y | Q3 FY26 (Mar-10-2026) and Q4 FY26 (Jun-10-2026) earnings-call transcripts | Candor and tone |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/11_capital-allocation-governance.md | Y |
| business-model/01_disqualifier-scan.md | Y |
| business-model/12_red-flags-sweep.md | Y |
| business-model/02_business-identity.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/04_guidance-consensus.md | Y |

All six cross-module inputs exist on the filesystem at `analyses/ORCL_2026-08-14/business-model/` and `analyses/ORCL_2026-08-14/earnings/`. Notably, `business-model/11_capital-allocation-governance.md` has already done substantial governance-adjacent groundwork this module should build on, not repeat: it scored capital allocation 42/100, flagged the Sept-2025 CEO transition (Safra Catz → Executive Vice Chair; co-CEOs Magouyrk/Sicilia) and the CFO change (to Hilary Maxson, ex-Schneider Electric, Apr-2026) landing inside the same fiscal year as a 54% one-year debt increase, a debt-funded dividend, and an S&P downgrade to BBB- (Jul-9-2026). `business-model/12_red-flags-sweep.md` additionally routes an unresolved securities class action (filed Feb-3-2026, D. Delaware, alleging misleading statements about Oracle Cloud Infrastructure) and a Netherlands GDPR privacy class action (adverse non-binding Advocate General opinion, Jan-30-2026, Dutch Supreme Court judgment scheduled Jun-28-2026) as candor/disconfirmation-relevant items for this module.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No proxy / compensation disclosure | Y | 03, 99 | incentive alignment max 50; usefulness max 70 |
| No ownership / insider-transaction data | N — ownership and insider data are both present and rich (2004–2026) | 04, 99 | not applied |
| No board disclosure | Y (partial — no formal independence determination or committee table; only names/titles from the insider-trading export and 10-K executive-officer bios) | 05, 99 | board read not assessable at full depth; agent 05 must state its board-independence read is CIQ-title-derived, not proxy-sourced |
| No multi-year history | N — Financials_Annual.xls covers FY2016A–FY2026A (10 years) and Ownership History covers 2004–2026 | 02 | not applied |
| No transcripts / prior letters | Partial (transcripts present; no shareholder letter) | 01, 06 | promise-vs-delivery and candor read may lean on transcripts + Guidance tab rather than a letter; no additional cap beyond the standing MODULE_RULES guidance |

## 5A. Jurisdiction & Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States (incorporated in Delaware) | [FY26 10-K, cover page, Delaware incorporation] |
| Exchange | NYSE | [Oracle Corporation NYSE ORCL Public Company Profile.rtf, "Ticker: ORCL (NYSE)"] |
| Filing regime | US SEC (10-K / 10-Q / DEF 14A / Form 4 / 8-K-equivalent event disclosures) | [FY26 10-K throughout; Key Developments export] |
| Sector | Systems Software (enterprise IT / cloud infrastructure) | [Oracle Corporation NYSE ORCL Public Company Profile.rtf, "Primary Industry Classification: Systems Software"] |
| Sector-specific governance overlay required? | N — MODULE_RULES.md's sector overlays cover Banks/NBFCs/insurers, IT services (Indian outsourcers), Pharma, Infra/real estate, and Holding companies/conglomerates. Oracle is a US enterprise-software/cloud company, not an Indian IT-services outsourcer or any of the other listed overlay sectors, so the standard governance lens (CFO/PAT, working-capital, capital allocation) applies, not a sector overlay. | Inference, not from filings — sector-overlay applicability judgment based on MODULE_RULES.md's defined overlay list |
| Document language(s) | English (all documents in the pool) | Direct observation across all extracts |

Note: one Key Developments row (the Jul-23-2026 AGM notice) refers to **Oracle Financial Services Software Limited (BSE:532466)** — a separately listed Indian subsidiary, not the NYSE:ORCL parent this module rates. That row and its INR dividend figures are NOT evidence about the parent-entity board, comp, or dividend policy and must not be conflated with ORCL governance facts by downstream agents.

## 5B. Source Coverage Matrix

| Governance Need | Best Available Source | Period | Confidence 1–5 | Missing? | Replacement Source |
|---|---|---|---:|---|---|
| Board composition | FY26 10-K Item 10 (executive officers) + Insider Trading tab director names/titles | FY26 / 2026-06-26 | 3 | Partial (no full board list, no committee table) | 2026 Proxy Statement (not yet filed) |
| Compensation | None | — | — | Y | 2026 Proxy Statement (not yet filed) |
| Ownership | Public Ownership Summary.rtf + History.xls | Latest / 2004–2026 | 5 | N | — |
| Insider trades | Public Ownership Insider Trading.xls | 2004-06 to 2026-06 | 5 | N | — |
| Related-party transactions | FY26 10-K, Notes, "Related Party Disclosures" (ASC 850, equity-method investees only, no $ amounts) | FY26 | 3 | Partial (no dollar figures, no full RPT table) | 2026 Proxy Statement Item 13 (not yet filed) |
| Auditor report | FY26 10-K, Report of Independent Registered Public Accounting Firm (E&Y, unqualified, auditor since 2002) | FY26 | 5 | N | — |
| Secretarial / compliance report | Not applicable (US regime — no SEBI-style secretarial audit) | — | — | N/A | — |
| AGM voting | Not in pool (2026 AGM not yet held; no prior-year voting-results 8-K in pool) | — | — | Y | Future Item 5.07 8-K / 2026 Proxy Statement |
| Capital-allocation history | Financials_Annual.xls (Cash Flow, Capital Structure Summary/Details tabs) + FY26 10-K | FY2016A–FY2026A | 5 | N | — |
| Legal / regulatory cases | FY26 10-K, Note 15 (Legal Proceedings) — securities class action (Feb-2026) and Netherlands GDPR class action | FY26, ongoing | 4 | N | — |

## 5C. Data Freshness

| Source | Period | As-of Date | Age | Stale? | Impact |
|---|---|---|---|---|---|
| FY26 10-K | FY26 (ended May-31-2026) | 2026-06-22 (filed) | ~2 months | No | Current annual filing — governs |
| Q3 FY26 10-Q | Q3 FY26 (ended Feb-28-2026) | 2026-03-11 (filed) | ~5 months | No | Superseded by 10-K for FY26 figures; still useful for interim trend detail |
| Q4 FY26 earnings call | Jun-10-2026 | Jun-10-2026 | ~2 months | No | Most recent management commentary in pool |
| Ownership History / Insider Trading | Through Jun-26-2026 / Mar-31-2026 | 2026-08-13/14 (vendor pull date) | <1 month | No | Current |
| 2026 Proxy Statement | Would cover FY26 comp/board/RPT | Not yet filed (due by ~Sept-28-2026) | N/A | N/A — does not exist yet, not a stale document | Drives the "No" on compensation/full-board/RPT-detail rows above |

Source manifest: writing to CSV is not supported by this agent's toolset in this run — CSV export is **pending**; the table above (Sections 5B/5C) stands in as the markdown equivalent.

## 6. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** Ownership, insider-transaction data, capital-allocation history, and management-turnover evidence are all strong and multi-year, but there is no proxy/DEF 14A (compensation table, formal board-independence determination, committee structure, and a fully quantified related-party table) — the 2026 Proxy Statement has not yet been filed as of this run's date.
- **Specialists that can run:** management track record (01), capital allocation (02), ownership and insider behavior (04), candor and disclosure quality (06) — all on strong evidence. Incentives/compensation (03) and board/shareholder rights (05) can run but on a materially thinner evidentiary base and must apply the caps below.
- **Hard disqualifier already flagged by business-model/01_disqualifier-scan?** N — no disqualifier triggered; however, `business-model/12_red-flags-sweep.md` and `01_disqualifier-scan.md` both route an unresolved securities class action (filed Feb-3-2026) as a soft candor/integrity signal for this module to weigh, not a lock.
- **Active partial-data caps:**
  - No proxy / compensation disclosure → incentive alignment max 50; overall usefulness max 70 (agent 03, synthesis 99)
  - No full board disclosure (independence determination, committee table) → board/shareholder-rights read limited to what CIQ insider-trading titles and the 10-K executive-officer section show; agent 05 states this explicitly and does not claim a formal independence percentage it cannot source
- **Critical missing items:**
  - 2026 Proxy Statement (DEF 14A) — not yet filed; carries compensation tables (Item 11), full board/committee/independence detail (Item 10/13), and the quantified related-party-transaction table (Item 13)
- **Single highest-value missing document:** 2026 Proxy Statement (DEF 14A) — once filed (due ~Sept-28-2026), it would resolve both the incentive-alignment and board-and-shareholder-rights caps in one document.
