# Governance Data Triage — INDIAMART

No `ciq_facts.json` and no `relationships.json` sidecar exists for this run under `analyses/INDIAMART_2026-08-20/_pool_extracts/` — every figure below is this agent's own sourced read of the CIQ workbook extracts and the primary filings. No `data/INDIAMART/external/` folder exists — no externally sourced research to inventory (Section 1A omitted). `extract_pool.py` reports the pool as fresh: 38 workbooks → 81 tabs, 128 extract files, **0 failures** (`_pool_extracts/manifest.json`, all 85 sources `status: ok`) — nothing in this pool counts as missing on extraction grounds.

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified (Drive sync — not authoritative; period is read from inside each document) | Governance Relevance |
|---|---|---|---|---|
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf | Full statutory Annual Report (Integrated AR FY2025-26: Board's Report, Corporate Governance Report, MR-3 Secretarial Audit Report, AGM Notice w/ e-voting, financial statements + notes, BRSR) | FY ended 31-Mar-2026; 27th AGM notice for 29-Jun-2026 | pool sync date, not authoritative | High |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf | Exchange filing: audited standalone+consolidated financials + Auditor's Report only (no Board's Report/CG Report) | Q4/FY ended 31-Mar-2026 | pool sync | Medium (financials/auditor opinion only) |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-29-2025).pdf | Prior-year equivalent — audited financials + Auditor's Report | FY ended 31-Mar-2025 | pool sync | Medium |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Annual_Report(Apr-30-2026).pdf | Preliminary/board-approved results, pre-AGM | FY ended 31-Mar-2026 | pool sync | Low-Medium (superseded by final AR above) |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-18-2025).pdf | Quarterly results (SEBI LODR Reg 33) | Q1 FY26 (Jun-2025) | pool sync | Medium |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Oct-17-2025).pdf | Quarterly results | Q2 FY26 (Sep-2025) | pool sync | Medium |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jan-20-2026).pdf | Quarterly results | Q3 FY26 (Dec-2025) | pool sync | Medium |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf | Quarterly results | Q1 FY27 (Jun-2026) | pool sync | Medium |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Apr-29-2025 / Jan-21-2025 / Jan-22-2025 / Jul-18-2025 / Apr-30-2026 / Jan-20-2026 / Oct-17-2025 / Jul-21-2026).pdf (8 files) | Pre-final board-approved quarterly results | Various quarters FY25–FY27 | pool sync | Low (superseded by final Interim/Annual Report filings above) |
| IndiaMART InterMESH Limited NSEI INDIAMART Board Members.xls | CIQ workbook — current board roster, bios, other directorships (27×25) | Current as of extraction (~Aug-2026) | pool sync | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Committees.xls | CIQ workbook — committee membership (Audit, Comp, CG, Finance, Investment, Nominating, Other, Risk) (73×2) | Current | pool sync | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Compensation Summary Compensation.xls | CIQ workbook — director/KMP compensation 2022–2025 (41×42) | FY2022–FY2025 (calendar-labelled) | pool sync | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Auditors.xls | CIQ workbook — statutory auditor history FY2015–FY2026, opinion type (22×5) | FY2015–FY2026 | pool sync | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Public Ownership Summary.rtf | CIQ — institutional/individual/VC-PE ownership breakdown, top holders, buy/sell activity | As of Mar-31-2026 / Aug-2026 | pool sync | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Private Ownership.rtf | CIQ — current/prior PE/VC investors (Elevation Capital, Intel Capital, WestBridge, Accion, Amadeus) | Current | pool sync | Medium (ownership context) |
| IndiaMART InterMESH Limited NSEI INDIAMART Corporate Timeline.xls | CIQ — key developments, recent window (board changes, dividends, AGM, private placements, new subsidiary) (48×4) | Feb-2026 to Aug-2026 | pool sync | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Key Developments.xls | CIQ — historical key developments, longer window (49×6) | Multi-year | pool sync | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Public Company Profile.rtf | CIQ — company snapshot, key professionals, key board members, subsidiaries/investments, "List of Credit Ratings" placeholder | Current, quote as of ~Aug-2026 | pool sync | Medium |
| IndiaMART InterMESH Limited (NSEI_INDIAMART) Corporate Structure Tree.xls | CIQ workbook — subsidiary tree, ownership %, investor stakes (3 tabs: main tree, Filtered Count, Aggregates) | Current | pool sync | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Customers.xls | CIQ — disclosed customer relationships (24×6) | Current | pool sync | Low-Medium (RPT/business context) |
| IndiaMART InterMESH Limited NSEI INDIAMART Suppliers.xls | CIQ — disclosed supplier relationships (71×8) | Current | pool sync | Low-Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Investment Analysis Co Investors.xls | CIQ — co-investor list (71×3) | Current | pool sync | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Investment Analysis Direct Investments.xls | CIQ — direct investment/portfolio-company detail (37×21) | Current | pool sync | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Strategic Alliances.xls | CIQ — alliances (19×5) | Current | pool sync | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Transaction Advisors.xls | CIQ — deal advisors (47×5) | Historical | pool sync | Low |
| Transaction Summary M A Private Placements.xls | CIQ — M&A/private-placement transaction log (subsidiary/associate funding rounds) (49×14) | Multi-year | pool sync | Medium (capital-allocation history) |
| Transaction Summary Public Offerings.xls | CIQ — public offering history (15×8) | Multi-year | pool sync | Low-Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Comparable M A Transactions.xls | CIQ — peer M&A comps (16×9) | N/A (peer data) | pool sync | Low (valuation, not governance) |
| Company Comparable Analysis IndiaMART InterMESH Limited.xls (8 tabs: Financial Data, Trading Multiples, Operating Statistics, Business Description, Implied Valuation, Valuation Chart, Credit Health Panel, Disclaimer) | CIQ — comps analysis workbook | Current | pool sync | Low (valuation-focused) |
| IndiaMART InterMESH Limited NSEI INDIAMART Credit Health Panel.xls (6 tabs: Summary, Financials, Operational-Metrics-Charts, Solvency-Metrics-Charts, Liquidity-Metrics-Charts, Disclaimer) | CIQ — credit/solvency panel | Current | pool sync | Low (balance-sheet module territory) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls / Financials (1).xls (13 tabs each: Balance Sheet, Capital Structure Details/Summary, Cash Flow, Historical Capitalization, Income Statement, Industry-Specific, Key Stats, Multiples, Pension OPEB, Ratios, Segments, Supplemental) | CIQ — full financial-statement extracts | Multi-year history | pool sync | Medium (capital-allocation scorecard inputs) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Balance Sheet / Capital Structure Details / Capital Structure Summary / Cash Flow / Income Statement / Income Statement (1) / Key Stats / Pension OPEB / Ratios / Segments / Supplemental.xls (11 standalone single-tab files, duplicative of the above) | CIQ — same data, individually exported | Multi-year | pool sync | Low (redundant with Financials.xls) |
| IndiaMART InterMESH Limited NSEI INDIAMART Fixed Income Securities Summary.xls | CIQ — debt securities summary (13×24) | Current | pool sync | Low |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls (6 tabs: Consensus, Multiples, Recent Changes, Revisions, Surprise, Trends) / EstimatesReport (1).xls (1 tab: Consensus) | CIQ — consensus estimates | Current | pool sync | Low (earnings-module territory) |
| IndiaMART InterMESH Limited NSEI INDIAMART Competitors.xls | CIQ — competitor list (54×8) | Current | pool sync | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Products.xls | CIQ — product list (18×5) | Current | pool sync | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Events Calendar.xls | CIQ — upcoming events (42×3) | Forward-looking | pool sync | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Industry Classifications.rtf | CIQ — industry classification | Current | pool sync | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Long Business Description.rtf | CIQ — business description | Current | pool sync | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Offices.rtf | CIQ — office locations | Current | pool sync | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Professionals.rtf | CIQ — professionals list | Current | pool sync | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Analyst Coverage.rtf | CIQ — sell-side analyst coverage list | Current | pool sync | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Transcripts.xls | CIQ — transcript index/metadata (44×3) | Multi-year | pool sync | Low (index only; the actual transcripts are the separate PDFs below) |
| IndiaMART InterMESH Limited, Q3 2021 through Q1 2027 Earnings Call PDFs (22 files, Jan-2021 to Jul-2026) | Earnings-call transcripts | Quarterly, Q3 FY21–Q1 FY27, most recent 21-Jul-2026 | pool sync | Medium (candor / promise-vs-delivery) |
| IndiaMART InterMESH Limited - ShareholderAnalyst Call.pdf | Shareholder/analyst call transcript (S&P Capital IQ transcription) | **Thursday, June 20, 2024** — read directly from the PDF's own cover page; this is a distinct, earlier event from the 27th AGM held 29-Jun-2026 that Corporate Timeline.xls separately logs as a "Shareholder/Analyst Call" event with no accompanying transcript PDF in this pool | pool sync | Medium (candor at a shareholder call; note it is 26 months stale relative to run date, not current) |
| Memos 2026-08-14 10-10-38/INDIAMART - Full Dossier.md, INDIAMART - Investment Thesis.md, INDIAMART - Memo.md | Prior synthesized research output (an earlier engine run's own dossier/thesis/memo artifacts, not a primary company disclosure) | As of ~14-Aug-2026 | 2026-08-14 | Low — not a governance source; secondary/derived, never cited as evidence |
| Memos 2026-08-14 10-10-38/.nostradamus_output | Metadata file | — | 2026-08-14 | None |

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months, vs 2026-08-20) |
|---|---|---|---|
| Proxy / AGM-Notice equivalent (India) | IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf — AGM Notice + Corporate Governance Report section | 27th AGM notice for 29-Jun-2026 / FY ended 31-Mar-2026 | ~1.8 (report date) |
| Annual filing | IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf | FY ended 31-Mar-2026 | ~1.8 (report date) / ~4.7 (FY-end) |
| Compensation disclosure | Compensation Summary Compensation.xls (CIQ) — corroborated by the AR's own KMP-compensation note (Note 33(ii)) and Corporate Governance Report remuneration table | FY2022–FY2025 (CIQ) / FY ended 31-Mar-2026 (AR Note 33(ii)) | ~1.8 (AR) |
| Ownership / insider-transaction data | Public Ownership Summary.rtf / Private Ownership.rtf (CIQ) | Institutional as of 31-Mar-2026; top-holder snapshot as of 31-Mar/21-Jul-2026; insider buy/sell window rolling to mid-Aug-2026 | <1 |
| Shareholder letter | Not a separate document type in this pool; MD&A / CEO message embedded in the Integrated Annual Report | FY ended 31-Mar-2026 | ~1.8 |
| Transcript | IndiaMART InterMESH Limited, Q1 2027 Earnings Call, Jul 21, 2026.pdf | Q1 FY27 (quarter ended 30-Jun-2026) | ~1.0 |
| 8-K equivalent (management changes) | Corporate Timeline.xls / Key Developments.xls — "Cessation of Dhruv Prakash as Non-Executive Non-Independent Director," effective from the conclusion of the 27th AGM, 29-Jun-2026 | 29-Jun-2026 | ~1.8 |

## 3. Governance Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Proxy / DEF 14A (India: AGM Notice + Corporate Governance Report) | Y | Annual Report (Jun-02-2026), 27th AGM Notice + "Report on Corporate Governance" section | Comp, ownership, board, related-party |
| Compensation disclosure (metrics/weights) | Y (amounts fully disclosed; incentive-metric/weight narrative partial) | AR Note 33(ii) KMP compensation; CIQ Compensation Summary; Corporate Governance Report remuneration table | Incentive alignment |
| Beneficial ownership table | Y | AR shareholding pattern (Promoter & Promoter Group 49.17%, 18 entities as at 31-Mar-2026); CIQ Public Ownership Summary (top holders, institutional %) | Skin in the game, control |
| Insider-transaction data (buys/sells) | Y | CIQ Public Ownership Summary — Individuals/Insiders activity, Top Buyers/Sellers | Conviction signal |
| Board composition / independence | Y | CIQ Board Members.xls (9 current members incl. 1 Observer); AR Corporate Governance Report | Board quality, entrenchment |
| Related-party disclosure | Y | AR Note 33 "Related party transactions" — full counterparty list + amounts (KMP comp, rent, tax-consultancy, dividend, associate investments) | Value leakage |
| Control structure (dual-class / blocs) | Y (single-class; founder bloc identified) | AR shareholding pattern; CIQ Top Holders (Dinesh Chandra Agarwal 29.09%, Brijesh Kumar Agrawal 19.99%) | Minority-shareholder rights |
| Prior shareholder letters / guidance | Partial — no standalone US-style letter series; MD&A/CEO message in AR + 22 quarterly transcripts + 1 (stale, Jun-2024) shareholder/analyst-call transcript stand in | AR; earnings-call transcripts Q3 FY21–Q1 FY27 | Promise-vs-delivery |
| M&A / buyback / dividend history | Y | Corporate Timeline (dividends, special dividend); Transaction Summary M&A Private Placements; Transaction Summary Public Offerings | Capital-allocation scorecard |
| Management tenure / turnover | Y | CIQ Board Members (founder tenure "1999-Present"); Corporate Timeline (director cessation 29-Jun-2026); Compensation Summary (Former SVP/CFO/Secretary rows) | Stability and competence |
| Transcripts | Y | 22 quarterly earnings-call PDFs (Q3 FY21–Q1 FY27) + 1 shareholder/analyst call (Jun-2024, stale) | Candor and tone |
| Auditor's report + annexures (CARO / KAMs / IFC) | Y | AR — Independent Auditor's Report (consolidated + standalone), CARO reference (holding + subsidiaries), Internal Financial Controls section, Key Audit Matter on Busy Infotech/Livekeeping goodwill | Audit quality (08) |
| Auditor-fee disclosure (audit vs non-audit) | Y (partial) | AR Note 24 "Payment to Auditors" — Audit fee ₹9.02mn + Reimbursement ₹0.86mn = ₹9.88mn (FY26) vs ₹9.11mn (FY25); no separate non-audit-services line disclosed — 08 to assess whether that means zero non-audit fees or non-disclosure | Auditor independence (08) |
| Secretarial audit report (India: MR-3) | Y | AR Annexure-5, "Form No. MR-3, Secretarial Audit Report for FY ended 31-Mar-2026" — flags a Designated Person's pledge without pre-clearance and a closed-window one-share trade | Compliance assurance (08) |
| Related-party NOTE with counterparties + amounts | Y | AR Note 33 — Mansa Enterprises Pvt Ltd (rent ₹6.85mn), S R Dinodia & Co LLP (tax consultancy ₹1.70mn), KMP dividend ₹1,413.43mn, associate investments (Fleetx ₹410mn FY26, Truckhall/Edgewise FY25), family trusts/HUF | RPT quantification (09) |
| Contingent-liabilities & commitments note | Y | AR Note 35 (standalone)/36 (consolidated) "Contingent liabilities and commitments" — includes ₹219.18mn + ₹101.90mn contested GST/service-tax demands | Off-P&L exposure (10) |
| ≥2 consecutive annual financials | Y | AR Jun-02-2026 (FY26) + Apr-29-2025 (FY25) audited statements, plus CIQ Financials workbooks with multi-year history | Beneish/Dechow forensic battery (11) |
| Shareholding-pattern history (quarters, pledge column) | Partial | AR gives one point-in-time SEBI-format shareholding-pattern snapshot (as of FY26-end) with a boilerplate confirmation of no promoter share pledge; no multi-quarter pledge-trend table in this pool. CIQ Public Ownership gives quarterly institutional-flow snapshots but not the SEBI pledge-% column | Ownership trend + pledge (04) |
| AGM/EGM voting results (scrutinizer reports) | **Y (partial) — corrected from the prior triage's "N"** | AR discloses the full **Postal Ballot** result declared 29-Aug-2025 (scrutinizer Deepak Kukreja, DMK Associates), with both resolutions' vote counts and percentages: (1) appointment of Vasuta Agarwal as Independent Director — 99.9968% in favour; (2) related-party office-or-profit appointment of Amit Agarwal — 78.2829% in favour / 21.7171% against [FY26 Annual Report, Jun-02-2026, "Postal Ballot" section, p.~137]. The **27th AGM itself** (held 29-Jun-2026) has its Notice + e-voting mechanics in the pool but its own declared resolution results/scrutinizer report are NOT in the pool — only the AGM Notice and one post-AGM director-cessation announcement | Minority dissent (05) |
| Exchange announcements history (fines, Reg 30 events) | Y | Corporate Timeline / Key Developments (board changes, private placements, dividend actions, new-subsidiary incorporation); AR states no SEBI/exchange monetary penalties in the last 3 years | Compliance hygiene (12) |
| Rating-agency reports / actions | N, and explained | AR Annexure ("List of all credit ratings obtained by the Company") states **"Not Applicable"** — consistent with the company's debt-free, net-cash balance sheet [FY26 Annual Report, Corporate Governance Report, item (l)]; CIQ Public Company Profile separately confirms "No S&P Global Ratings Credit Ratings data available." This is a company-level absence of debt requiring a rating, not a pool extraction gap | Rating conduct (12) |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/11_capital-allocation-governance.md | Y — `analyses/INDIAMART_2026-08-14/business-model/11_capital-allocation-governance.md` (score 74/100; serial minority-stake venture pattern noted, not the debt-funded/near-value §24 Filter 4 cap trigger; 21.7% shareholder dissent on the Amit Agarwal RPT postal ballot) |
| business-model/01_disqualifier-scan.md | Y — no hard disqualifier triggered (auditor unqualified FY24–FY26; promoter pledge not disclosed as a % and treated as ~0%, well under the 50% threshold; RPT purchases 0.72%/sales 0.11% of totals, well under the 20–25% near-miss band); a soft integrity note (unnamed Designated Person share-pledge pre-clearance lapse + one-share closed-window trade) is logged but explicitly stated not to meet the §24 Filter 1 hard-lock bar |
| business-model/12_red-flags-sweep.md | Y — new flags relevant to this module: buyer-side funnel stagnation (management-confirmed, severity 55/100), new lending subsidiary IndiaMART Finance Limited diversifying into credit risk (severity 40/100), founder key-person concentration with no disclosed succession plan (severity 35/100), underfunded gratuity plan (severity 15/100, immaterial) |
| business-model/02_business-identity.md | Y — `analyses/INDIAMART_2026-08-14/business-model/02_business-identity.md` |
| earnings/06_earnings-quality.md | Y — `analyses/INDIAMART_2026-08-14/earnings/06_earnings-quality.md` |
| earnings/04_guidance-consensus.md | Y — `analyses/INDIAMART_2026-08-14/earnings/04_guidance-consensus.md` |
| balance-sheet-survival/05_off-balance-sheet-and-contingencies.md | Y — `analyses/INDIAMART_2026-08-14/balance-sheet-survival/05_off-balance-sheet-and-contingencies.md` (not in this module's `depends_on`; agent 10 self-resolves this path per MODULE_RULES) |
| balance-sheet-survival/01_capital-structure-and-leverage.md | Y — `analyses/INDIAMART_2026-08-14/balance-sheet-survival/01_capital-structure-and-leverage.md` (agent 11 self-resolves this path) |

All cross-module inputs this module reads are present for this run, dated 2026-08-14 against a data pool that is unchanged from this 2026-08-20 run (same `data/INDIAMART/` files, same 0-failure extraction). Downstream specialists should read the 2026-08-14 business-model and earnings outputs directly rather than treating them as absent.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No proxy / compensation disclosure | N — full AGM Notice + Corporate Governance Report + KMP compensation note present | 03, 99 | Not applied |
| No ownership / insider-transaction data | N — CIQ ownership + AR shareholding pattern both present | 04, 99 | Not applied |
| No board disclosure | N — CIQ Board Members + Committees + AR Corporate Governance Report present | 05, 99 | Not applied |
| No multi-year history | N — Compensation FY2022–FY2025, Auditors FY2015–FY2026, Financials multi-year, 22 quarterly transcripts | 02 | Not applied |
| No transcripts / prior letters | N — 22 earnings-call transcripts + 1 shareholder/analyst call (dated Jun-2024, stale — flag its staleness, not its absence); no separate US-style "shareholder letter" series exists for this issuer type, MD&A/CEO message substitutes | 01, 06 | Not applied (MD&A/CEO message + transcripts used as the promise-vs-delivery record instead of a shareholder-letter series — jurisdictional substitution, not a gap) |
| No related-party note | N — AR Note 33 fully quantified | 09, 99 | Not applied |
| No contingent-liability note | N — AR Note 35/36 present | 10, 99 | Not applied |
| No auditor-fee / audit-detail disclosure | N — AR Note 24 gives audit fee vs reimbursement split; flag that no distinct non-audit-fee line is shown | 08, 99 | Not applied as a data gap; 08 records the absence-of-non-audit-fee-line as its own finding to investigate, not as Not Available |
| Under 2 years of financials | N — FY26 and FY25 audited statements both present, plus longer CIQ history | 11, 99 | Not applied |
| Legal/regulatory databases unreachable (web sweep could not run) | Not yet determined at triage — this triage does not itself run the web/database sweep; 07/12/99 to state their own coverage status | 07, 12, 99 | To be set by 07/12 |
| No company website (D-1 unreachable), other discovery sources available | N — company website (www.indiamart.com) is recorded in the pool (Public Company Profile; AR footer) | 07 | Not applied |
| Discovery loop cannot run at all | N — company website, CIN (L74899DL1999PLC101534), and registered-office address are all present in the pool | 07, 99 | Not applied |
| No AGM scrutinizer / voting-result report | **Partial** — the FY26 Postal Ballot's scrutinizer result IS in the pool (see Section 3), but the 27th AGM's own resolutions' declared results are not | 05, 99 | Board/shareholder-democracy read (05) uses the Postal Ballot result (including the 21.72%-against RPT vote) as its dissent evidence; notes the 27th AGM's own results as Not Available for this run — does not block the rest of 05 |
| No credit-rating-agency report | Y, but explained by the company's own disclosure (no debt to rate) | 12, 99 | Rating-conduct sub-item of regulatory/legal sweep marked Not Applicable (company states "Not Applicable" itself) rather than Not Available; balance-sheet-survival module's own solvency read is unaffected |

## 5E. Person & Entity Register (feeds 07 — Hard Rule)

### 5E.1 Person Register

| # | Name | Identifier (DIN / registry ID, if disclosed) | Role | Category (Director / KMP / Promoter individual / Former) | Source (filing + section) |
|---|---|---|---|---|---|
| 1 | Dinesh Chandra Agarwal | Not disclosed in the extracted board/KMP tables (DIN not captured in this extract's CIQ tab; likely disclosed in AR signature blocks not fully captured) | Founder, CEO, MD & Director; Promoter | Director / KMP / Promoter individual | CIQ Board Members.xls; AR Note 33(b) KMP list; AR shareholding pattern (Top Holder, 29.09%/17,492,084 shares as of 31-Mar-2026) |
| 2 | Brijesh Kumar Agrawal | Not disclosed in this extract | Co-Founder & Whole-Time Director; Promoter | Director / KMP / Promoter individual | CIQ Board Members.xls; AR Note 33(b); AR shareholding pattern (19.99%/12,022,004 shares) |
| 3 | Manoj Bhargava | DIN: 08267536 | Group General Counsel, Company Secretary & Whole Time Director; Compliance Officer until 21-Jan-2025 | Director / KMP | CIQ Board Members.xls; AR signature block ("Manoj Bhargava... DIN: 08267536, Membership No: F5164"); AR Note 33(b) |
| 4 | Vasuta Agarwal | DIN: 07480674 | Independent Director (Additional Director w.e.f. 18-Jul-2025, confirmed by Postal Ballot 29-Aug-2025, 99.9968% in favour); Chairman of Risk Committee | Director | AR Annexure-5 (MR-3); AR Postal Ballot result; CIQ Board Members.xls; CIQ Committees.xls |
| 5 | Sandeep Kumar Barasia | Not disclosed in this extract (referenced as "Sandeep Barasiya" in AR KMP list, likely transliteration variant) | Independent Director w.e.f. 29-Apr-2025; Chairman of Corporate Governance Committee; Member of Audit Committee | Director | CIQ Board Members.xls; AR Note 33(b); CIQ Committees.xls |
| 6 | Vivek Narayan Gour | Not disclosed in this extract | Non-Executive Independent Director since 30-Apr-2018; Chairman of Audit, Compensation, Corporate Governance and Nominating Committees | Director | CIQ Board Members.xls; CIQ Committees.xls; AR Note 33(b) |
| 7 | Pallavi Dinodia Gupta | DIN: 06566637 | Lead Independent Director (since 24-Mar-2023); Independent Director since 20-Oct-2022, re-appointed FY26; Chairman of Compensation, Nominating, Risk Committees | Director | AR Annexure-5 (MR-3); CIQ Board Members.xls; CIQ Committees.xls; AR Note 33(b) |
| 8 | Manish Vij | Not disclosed in this extract | Non-Executive Independent Director w.e.f. 21-Jan-2025; Chairman of Finance & Investment Committees | Director | CIQ Board Members.xls; CIQ Committees.xls; AR Note 33(b) |
| 9 | Amit Behl | Not disclosed (non-director) | Observer (Board Observer, not a formal director) | Director (Observer category) | CIQ Board Members.xls |
| 10 | Jitin Diwan | Not disclosed in this extract | Chief Financial Officer (w.e.f. 15-Jun-2024) | KMP | CIQ Compensation Summary; AR Note 33(b); Public Company Profile Key Professionals |
| 11 | Dinesh Gulati | Not disclosed | Chief Operating Officer | KMP | CIQ Compensation Summary; Public Company Profile |
| 12 | Sudhir Gupta | Not disclosed | Senior Vice President of Finance & Accounts | KMP | CIQ Compensation Summary; Public Company Profile |
| 13 | Nikhil S. Prabhakar | Not disclosed | Senior VP & Chief Information Officer | KMP | CIQ Compensation Summary; Public Company Profile |
| 14 | Kushal Maheshwari | Not disclosed | Head of Treasury & Investor Relations | KMP | Public Company Profile |
| 15 | Vasudha Bagri | Not disclosed | Compliance Officer (w.e.f. 22-Jan-2025); announced the FY26 Postal Ballot result on 29-Aug-2025 | KMP | Public Company Profile; AR Note 33(b); AR Postal Ballot section |
| 16 | Saurabh Deep Singla | Not disclosed | Chief Human Resources Officer | KMP | Public Company Profile |
| 17 | Vikas Aggarwal | Not disclosed | National Head of Client Servicing Division | KMP | Public Company Profile |
| 18 | Abhishek Bhartia | Not disclosed | Senior Vice President | KMP | CIQ Compensation Summary; Public Company Profile |
| 19 | Prateek Chandra | Not disclosed | Former Chief Financial Officer (upto 14-Jun-2024); "Chief Strategy Officer" per CIQ Compensation | Former KMP | AR Note 33(b); CIQ Compensation Summary |
| 20 | Dhruv Prakash | DIN: 05124958 | Former Non-Executive Non-Independent Director — ceased 29-Jun-2026 at conclusion of 27th AGM | Former | Corporate Timeline.xls / Key Developments.xls (Cessation announcement, 29-Jun-2026) |
| 21 | Rajesh Sawhney | Not disclosed | Former Independent Director — ceased to be member up to 23-Sep-2025 | Former | AR Note 33(b); CIQ Compensation Summary |
| 22 | Aakash Chaudhry | Not disclosed | Former Independent Non-Executive Director — up to 21-Jan-2025 | Former | AR Note 33(b); CIQ Compensation Summary |
| 23 | Mahendra Kumar Chouhan | Not disclosed | Former Independent Director | Former | CIQ Compensation Summary |
| 24 | Elizabeth Lucy Chapman | Not disclosed | Former Non-Executive Independent Director | Former | CIQ Compensation Summary |
| 25 | Parag Agarawal | Not disclosed | Former Senior Vice President | Former | CIQ Compensation Summary |
| 26 | Vivek Agrawal | Not disclosed | Former Chief Information Officer | Former | CIQ Compensation Summary |
| 27 | Anil Dwivedi | Not disclosed | Former Secretary | Former | CIQ Compensation Summary |
| 28 | Dinesh Gulati, Amarinder Singh Dhaliwal, Amit Jain, Sunil Parolia, Devendra Singh, Abhishek Thard, Vikas Deep Verma | Not disclosed | Senior Vice Presidents (various functions) | Former/Current KMP-adjacent (several show only historical-year compensation, implying departure or role change not separately confirmed) | CIQ Compensation Summary |
| 29 | Bharat Agarwal, Chetna Agarwal, Gunjan Agarwal, Anand Kumar Agrawal, Meena Agrawal, Pankaj Agarwal, Naresh Chandra Agrawal, Prakash Chandra Agrawal, Shravani Prakash, Anjani Prakash, Amit Agarwal, Pradeep Dinodia | Not disclosed | Relatives of KMP (Related Party register, not board/executive roles); Amit Agarwal separately holds an "office or place of profit" that required and received a Postal Ballot (78.28% in favour / 21.72% against) | Promoter/KMP-relative individual | AR Note 33(c) "Relatives of Key Management Personnel"; AR Postal Ballot section |
| — | UNNAMED — Internal Auditor | Not disclosed | AR text references "[name/firm partially cut off]... appointed as an Internal Auditor of the..." — firm name not fully captured in this extract | UNNAMED role | AR text (Board's Report, internal-audit section) |

### 5E.2 Entity Register

| # | Entity | Registry identifier (CIN / company number), if disclosed | Relationship as disclosed | Source (filing + section) |
|---|---|---|---|---|
| 1 | Tradezeal Online Private Limited | Not disclosed in this extract | Subsidiary | AR Note 33(a); CIQ Corporate Structure Tree |
| 2 | Busy Infotech Private Limited (formerly Tolexo Online Private Limited) | Not disclosed | Subsidiary (renamed Apr-2023); incorporated 31-May-2005; goodwill on this CGU (₹4,122.34mn) is a Key Audit Matter | AR Note 33(a) / KAM section; CIQ Corporate Structure Tree; CIQ Public Company Profile |
| 3 | Pay With Indiamart Private Limited | Not disclosed | Subsidiary | AR Note 33(a) |
| 4 | Livekeeping Technologies Private Limited (formerly Finlite Technologies Private Limited) | Not disclosed | Subsidiary; goodwill on this CGU (₹420.38mn) is a Key Audit Matter | AR Note 33(a) / KAM section; CIQ Corporate Structure Tree |
| 5 | Livekeeping Private Limited | Not disclosed | Subsidiary of Livekeeping Technologies — struck off w.e.f. 29-Oct-2024 | AR Note 33(a) |
| 6 | IIL Digital Private Limited | Not disclosed | Subsidiary, incorporated 27-Aug-2024 | AR Note 33(a) |
| 7 | Biztradeshows | Not disclosed | Subsidiary (incorporated 2003) | CIQ Corporate Structure Tree; CIQ Public Company Profile |
| 8 | PlayCez Technologies Private Limited | Not disclosed | Subsidiary of Biztradeshows (100%) | CIQ Corporate Structure Tree |
| 9 | Indiamart Employee Benefit Trust | Not disclosed | Related party — administered trust for employee share-based payment plans | AR Note 33(e); CIQ Corporate Structure Tree |
| 10 | IndiaMART Finance Limited | **CIN: U69200MH2025PTC440515** | Newly incorporated wholly-owned subsidiary (Certificate of Incorporation dated 04-Aug-2026) — financial-services entity for user working-capital needs; a strategic-scope expansion into credit risk flagged in `business-model/12_red-flags-sweep` | AR text (near line 5374); Corporate Timeline.xls / Key Developments.xls (04-Aug-2026 and 21-Jul-2026 entries) |
| 11 | Simply Vyapar Apps Private Limited | Not disclosed | Associate — generating a growing net loss (−₹547.72mn FY26 per `business-model/segment-map`) | AR Note 33(a) |
| 12 | Truckhall Private Limited | Not disclosed | Associate (investment ₹100mn in FY25); incorporated 22-Jan-2015 | AR Note 33(a) / Note 33 transaction table |
| 13 | Fleetx Technologies Private Limited | Not disclosed | Associate w.e.f. 11-Apr-2025; further funding ₹649.876mn on 27-Jul-2026 (25.8% stake); incorporated 24-Jul-2017 | AR Note 33(a); Corporate Timeline (27-Jul-2026 entry) |
| 14 | Agillos E-Commerce Private Limited | Not disclosed | Associate — received ₹1.18bn funding round 18-Mar-2026 incl. IndiaMART participation | AR Note 33(a); Corporate Timeline (18-Mar-2026 entry) |
| 15 | Edgewise Technologies Private Limited | Not disclosed | Associate (investment ₹50mn in FY25) | AR Note 33(a) |
| 16 | IB Monotaro Private Limited | Not disclosed | Associate | AR Note 33(a) |
| 17 | Adansa Solutions Private Limited | Not disclosed | Associate | AR Note 33(a) |
| 18 | Mobisy Technologies Private Limited | Not disclosed | Associate | AR Note 33(a) |
| 19 | Mansa Enterprises Private Limited | Not disclosed | Entity where KMP exercise significant influence — rent & related expenses ₹6.85mn FY26 | AR Note 33(d)/(transaction table) |
| 20 | S R Dinodia & Co LLP | Not disclosed | Entity where KMP exercise significant influence — tax consultancy/litigation support ₹1.70mn FY26 (linked to Lead Independent Director Pallavi Dinodia Gupta's family name) | AR Note 33(d)/(transaction table) |
| 21 | Dinesh Chandra Agarwal HUF; Nanpara Family Trust; Nanpara Business Trust; Hamirwasia Business Trust; Hamirwasia Family Trust | Not disclosed | Entities where KMP exercise significant influence (promoter-linked family trusts/HUF) | AR Note 33(d) |
| 22 | Assotech Business Cresterra (Corporate/Administrative Office building, Noida) | Not applicable — not an operating entity | Shared corporate-office address for all directors per CIQ Board Members; distinct from the registered office (see 5E.3) | CIQ Board Members.xls; AR cover/signature pages |
| 23 | Busy Infotech Pvt Ltd. / Shiprocket Limited / Kaya Limited / EIH Associated Hotels Limited / MakeMyTrip Limited / Affle 3i Limited / Lumax Industries Limited / Voith Paper Fabrics India Limited / Filatex India Limited / SVG Media Private Limited etc. | Various (listed entities carry NSE/BSE tickers, e.g. NSEI:DELHIVERY, NSEI:PAYTM) | Other-directorship entities of IndiaMART's own independent directors (external board seats, not RPT counterparties per se — network-mapping input for 07) | CIQ Board Members.xls (bio narrative) |

### 5E.3 Company identity & lineage anchors (feeds 07's discovery loop)

| Anchor | Value | Source |
|---|---|---|
| Registry identifier (CIN / company number / CIK) | **CIN: L74899DL1999PLC101534** — corrected from the prior triage's "Not in pool"; found in the AR cover page, signature blocks, Corporate Governance Report item 1, and BRSR | FY26 Annual Report (Jun-02-2026), multiple pages incl. cover, Corporate Governance Report item "1. Corporate Identity Number (CIN) of the Listed Entity," BRSR intro; NSE ticker INDIAMART, BSE scrip 542726 also disclosed |
| Incorporation date | Not given as an explicit dd-mm-yyyy date in the extracted text; the CIN's embedded year is 1999, consistent with the founder's tenure "since September 13, 1999" and the company's own "incorporated in 1999" / "Year Founded: 1999" statements | CIQ Board Members.xls; CIQ Public Company Profile |
| Any founding year the company CLAIMS | 1999 ("founded IndiaMART InterMESH Limited in 1999"; CIN also carries "1999") | CIQ Board Members.xls; CIQ Public Company Profile; CIN itself |
| Former names, if disclosed anywhere in the pool | Not in pool for the parent entity itself; subsidiary Busy Infotech Private Limited was formerly Tolexo Online Private Limited (renamed Apr-2023); subsidiary Livekeeping Technologies was formerly Finlite Technologies Private Limited | AR Note 33(a); CIQ Public Company Profile |
| Company website URL | www.indiamart.com | CIQ Public Company Profile; AR footer |
| Principal brand / product names the company trades under | IndiaMART (B2B marketplace); Live Keeping / Tally-sync app (via Livekeeping subsidiary); BUSY accounting software (via Busy Infotech) | CIQ Public Company Profile; CIQ Corporate Structure Tree |
| Registered-office address | **1st Floor, 29-Daryaganj, Netaji Subhash Marg, New Delhi-110002** — corrected from the prior triage, which reported the Noida Corporate/Administrative Office address as the registered office. The AR states both explicitly and separately: "Regd. Office: 1st Floor, 29-Daryaganj, Netaji Subhash Marg, New Delhi-110002" and "Corp. Office: 6th Floor, Tower 2, Assotech Business Cresterra, Plot No. 22, Sector-135, Noida-201305, U.P." — CIQ Board Members.xls carries only the Noida corporate-office address | AR cover page, Corporate Governance Report item "4. Registered office address," multiple signature blocks; CIQ Board Members.xls (corporate office only) |

No founding-year/incorporation-date mismatch is evident in the pool (both read 1999) — no predecessor-entity LEAD to flag for the parent. (IndiaMART Finance Limited, the new financial-services subsidiary, carries its own CIN — U69200MH2025PTC440515 — and is correctly a 2025-incorporated new entity, not a lineage concern.)

## 5A. Jurisdiction & Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | India | NSE/BSE filings throughout |
| Exchange | NSE (ticker INDIAMART) and BSE (scrip 542726) | AR Jun-02-2026 header addressed "To, BSE Limited (BSE: 542726) / National Stock Exchange of India Limited (NSE: INDIAMART)" |
| Filing regime | India — SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015 + Companies Act, 2013 | AR: "SEBI Listing Regulations," Secretarial Audit under Section 204(1) Companies Act 2013, Regulation 33 quarterly results, Regulation 44 postal ballot |
| Sector | Internet/B2B e-commerce marketplace (CIQ classifies as "Trading Companies and Distributors" / "Interactive Media and Services" for subsidiaries) | CIQ Public Company Profile; Industry Classifications.rtf |
| Sector-specific governance overlay required? | N — no financial-services, banking, or state-owned-enterprise overlay needed for the core marketplace business today; note the newly incorporated IndiaMART Finance Limited (industry-classified "Financial Services," CIN U69200MH2025PTC440515) may bring a lending-related overlay into a future run once it is operational — this run treats it as a capital-allocation/red-flag item, not a segment requiring a banking-overlay read | Corporate Timeline.xls (04-Aug-2026 entry); business-model/12_red-flags-sweep |
| Document language(s) | English throughout (AR, transcripts, CIQ exports) | Direct inspection of all extracted text |

## 5B. Source Coverage Matrix

| Governance Need | Best Available Source | Period | Confidence 1–5 | Missing? | Replacement Source |
|---|---|---|---|---|---|
| Board composition | AR Corporate Governance Report + CIQ Board Members.xls | FY26 / current | 5 | N | — |
| Compensation | AR Note 33(ii) KMP compensation + CIQ Compensation Summary | FY2022–FY26 | 5 | N | — |
| Ownership | AR shareholding pattern + CIQ Public Ownership Summary | FY26-end / Aug-2026 | 5 | N | — |
| Insider trades | CIQ Public Ownership Summary (Individuals/Insiders activity, Top Buyers/Sellers) | Rolling window to mid-Aug-2026 | 4 | N | — |
| Related-party transactions | AR Note 33 (full counterparty + amount table) | FY26 vs FY25 | 5 | N | — |
| Auditor report | AR Independent Auditor's Report (consol. + standalone) | FY26 | 5 | N | — |
| Secretarial / compliance report | AR Annexure-5, Form MR-3 | FY26 | 5 | N | — |
| AGM voting | AR Postal Ballot result (scrutinizer, 29-Aug-2025) — best available; the 27th AGM's own resolution-level result is not present | FY26 (Postal Ballot within the year; 27th AGM itself 29-Jun-2026 not covered) | 4 for the Postal Ballot / 1 for the 27th AGM's own results | Y (27th AGM's own declared result specifically) | None in pool for the 27th AGM specifically — would need the post-AGM BSE/NSE voting-result filing |
| Capital-allocation history | Transaction Summary M&A Private Placements + Corporate Timeline (dividends) + CIQ Financials | Multi-year | 4 | N | — |
| Legal / regulatory cases | AR compliance-history statement (no monetary penalties in last 3 years) + Secretarial Audit findings (Designated-Person lapses); no separate litigation register | FY26 (3-year lookback stated) | 3 | Partial | Would benefit from a dedicated exchange-announcements/litigation export |

## 5C. Data Freshness

| Source | Period | As-of Date | Age | Stale? | Impact |
|---|---|---|---|---|---|
| Annual Report (Jun-02-2026) — full CG Report, MR-3, RPT note, Postal Ballot result | FY ended 31-Mar-2026 | Filed Jun-2026; AGM notice for 29-Jun-2026 | ~1.8 months to run date | No | None — current governance-year disclosure |
| CIQ Board Members / Committees | Current roster | Extraction date (~Aug-2026) | <1 month | No | None |
| CIQ Compensation Summary | FY2022–FY2025 | Most recent column FY2025 | Compensation for FY26 is only in the AR note, not yet in this CIQ export | No — AR fills the gap | AR Note 33(ii) supplies the FY26 figure the CIQ workbook does not yet carry |
| CIQ Public Ownership Summary | Institutional as of 31-Mar-2026; top holders as of 21-Jul-2026/31-Mar-2026 | Market-value calc as of ~mid-Aug-2026 | Current | No | None |
| Earnings-call transcripts | Q3 FY21 through Q1 FY27 (Jul-21-2026) | Most recent call 21-Jul-2026 | <1 month | No | None |
| Shareholder/Analyst Call PDF | Dated Thursday, June 20, 2024 (transcribed by S&P Capital IQ) | 20-Jun-2024 | **~26 months** | **Yes** | This is the only shareholder/analyst-call-format document in the pool; it materially predates the current run and should not be read as reflecting the company's current tone or promises — Corporate Timeline.xls logs a later (29-Jun-2026) "Shareholder/Analyst Call" event around the 27th AGM with no accompanying transcript in this pool, so that more recent event's content is Not Available |

Source manifest CSV export: pending (framework file-output not exercised in this run; the tables above serve as the manifest).

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A full India statutory Annual Report (AGM Notice, Corporate Governance Report, MR-3 Secretarial Audit Report, quantified related-party note, contingent-liabilities note, auditor's report and fee disclosure, and a Postal Ballot voting result) plus current CIQ board/committee/compensation/ownership exports and a multi-year capital-allocation and compensation history are all present, satisfying every leg of the Sufficient rule.
- **Specialists that can run:** management track record, capital allocation, incentives, ownership, board, candor, people dossiers (07, seeded per 5E), audit quality (08), RPT/group forensics (09), contingent liabilities (10), accounting forensics (11, ≥2 years financials available), regulatory/legal sweep (12, with the 27th-AGM-result and credit-rating caveats below)
- **Hard disqualifier already flagged by business-model/01_disqualifier-scan?** N — no disqualifier triggered (`business-model/01_disqualifier-scan.md`, Section 3: "Any disqualifier triggered: N"). A soft integrity note is logged and relayed for weighing, not locking: an unnamed Designated Person's share-pledge pre-clearance lapse and a closed-window one-share trade (Secretarial Audit Report), plus the 21.72%-against Postal Ballot vote on the Amit Agarwal related-party office-of-profit appointment (`business-model/11_capital-allocation-governance`) — neither meets the §24 Filter 1 hard-lock bar per the disqualifier scan's own adjudication, but both are live inputs for agents 03/05/06/09.
- **Active partial-data caps:** None triggered at Sufficient. Two narrow gaps are carried forward for individual specialists to record as Not Available on their own line, without capping the overall module verdict: (1) no declared voting result/scrutinizer report specifically for the 27th AGM (29-Jun-2026) — 05 uses the FY26 Postal Ballot result (which does exist, with a quantified 21.72%-against vote) as its dissent evidence instead; (2) no rating-agency report in the pool, explained by the company's own "Not Applicable" disclosure (debt-free balance sheet) — 12 records rating conduct as Not Applicable, not Not Available.
- **Critical missing items:** None blocking.
- **Single highest-value missing document:** The 27th AGM's (29-Jun-2026) own scrutinizer's report / declared e-voting result — would let 05 quantify minority-shareholder dissent on the current-year AGM resolutions specifically (director re-appointments, auditor ratification), complementing the FY26 Postal Ballot result already in hand.
