# Governance Data Triage — DHER

**Context note (carried from `business-model/00_data-triage` and `01_disqualifier-scan`):** Delivery Hero SE is currently the subject of a live, announced acquisition offer from Uber Technologies (M&A call held Jul 16, 2026), with reference shareholder Prosus/Naspers "irrevocably committed to tender its stake" [Uber Technologies, Inc., Delivery Hero SE - M&A Call, Jul 16 2026, p.4]. This is not a steady-state standalone company at report date — later specialists should read the stewardship record with that overlay. Separately, `business-model/01_disqualifier-scan` triggered a hard disqualifier (auditor-flagged, subsidiary-level going-concern note on Glovo Spain tied to a €440–770m contingent social-security liability; Group opinion unmodified) — see Section 6.

## 1. File Inventory

Multi-tab workbooks were pre-extracted with `.claude/tools/extract_pool.py` (`analyses/DHER_2026-08-12/_pool_extracts/`; manifest: 3 workbooks → 28 tabs, 37 extract files, 0 failures — reconciled against `_pool_extracts/manifest.md` and `manifest.json`, all sources `status: ok`). No `ciq_facts.json` sidecar exists in this pool — headline governance figures below are this agent's own sourced read of the filing and the workbooks.

| Filename | Type | Period Covered | Last Modified (sync date — not authoritative, F23) | Governance Relevance |
|---|---|---|---|---|
| Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf | Annual filing — Annual Report (Combined Management Report + Corporate Governance Statement + Compensation Report 2024 + Report of the Supervisory Board + audited IFRS consolidated financial statements incl. Note 10 Related-Party Disclosures + Independent Auditor's Report) | FY2024 (year ended Dec-31-2024); published Apr 25, 2025 | Aug 10, 2025 (sync date) | High — this single document is the proxy-equivalent, comp disclosure, board disclosure, and related-party disclosure all at once (German two-tier board / GCGC regime). |
| Delivery_Hero_SE_-_Form_Annual_Report(Apr-25-2025).pdf | Annual filing — duplicate | Same as above | Aug 10, 2025 (sync date) | High — byte-identical (MD5 match) to the file above; same source, counted once. |
| Delivery Hero SE, 2025 Earnings Call, Mar 26, 2026.pdf | Earnings transcript (FY2025 full-year results call) | FY2025 actuals; call held Mar 26, 2026 | Aug 10, 2025 (sync date) | Medium — candor/tone read, promise-vs-delivery on FY2025 targets set at FY2024 reporting. |
| Delivery Hero SE, Q1 2026 Sales_ Trading Statement Call, Apr 30, 2026.pdf | Quarterly-equivalent transcript (trading/sales statement call) | Q1 2026; call held Apr 30, 2026 | Aug 10, 2025 (sync date) | Medium — closest surrogate for an interim filing; candor/tone read. |
| Uber Technologies, Inc., Delivery Hero SE - M&A Call.pdf | Deal / M&A transcript | Call held Jul 16, 2026 | Aug 10, 2025 (sync date) | Medium — reveals reference-shareholder (Prosus/Naspers) intent to tender, a direct ownership/control-structure signal for the current period. |
| Delivery Hero SE XTRA DHER Analyst Coverage.rtf | Data export (sell-side coverage list) | Undated snapshot (live target prices, e.g. Morningstar €36.00, mwb research €41.50 Sell) | Aug 10, 2025 (sync date) | Low — not a governance source; peer/analyst context only. |
| Delivery Hero SE XTRA DHER Competitors.rtf | Data export (competitor list) | Undated snapshot | Aug 10, 2025 (sync date) | Low — for peer benchmarking of governance metrics, not a governance source itself. |
| Delivery Hero SE XTRA DHER Customers.rtf | Data export (customer relationships) | Undated snapshot | Aug 8, 2025 (sync date) | Low — not governance-relevant. |
| Delivery Hero SE XTRA DHER Fixed Income Securities Summary.rtf | Data export (debt securities) | Undated snapshot | Aug 10, 2025 (sync date) | Low — balance-sheet-survival module territory; only tangential to governance (debt used for what). |
| Company Comparable Analysis Delivery Hero SE.xls — Financial Data | Data export (workbook tab) | Multi-year, USD; As-Of Date 2026-08-10 | same | Low — capital-allocation cross-check only (no ownership/comp fields). |
| Company Comparable Analysis Delivery Hero SE.xls — Trading Multiples | Data export (workbook tab) | As of 2026-08-10 | same | Low |
| Company Comparable Analysis Delivery Hero SE.xls — Operating Statistics | Data export (workbook tab) | As of 2026-08-10 | same | Low |
| Company Comparable Analysis Delivery Hero SE.xls — Business Description | Data export (workbook tab) | As of 2026-08-10 | same | Low |
| Company Comparable Analysis Delivery Hero SE.xls — Implied Valuation | Data export (workbook tab) | As of 2026-08-10 | same | Low — out of scope for this module. |
| Company Comparable Analysis Delivery Hero SE.xls — Valuation Chart | Data export (workbook tab) | As of 2026-08-10 | same | Low |
| Company Comparable Analysis Delivery Hero SE.xls — Credit Health Panel | Data export (workbook tab) | As of 2026-08-10 | same | Low — debt/survival context. |
| Company Comparable Analysis Delivery Hero SE.xls — Disclaimer | Data export (workbook tab) | n/a | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Key Stats | Data export (workbook tab) | Annual, Dec-31-2021A → Dec-31-2027E, EUR | Aug 10, 2025 (sync date) | Low — no ownership/insider fields found. |
| Delivery Hero SE XTRA DHER Financials.xls — Income Statement | Data export (workbook tab) | Annual, Dec-31-2020 (Restated) → FY2025A, EUR | same | Medium — capital-allocation scorecard (goodwill impairments, SBC expense). |
| Delivery Hero SE XTRA DHER Financials.xls — Balance Sheet | Data export (workbook tab) | Annual, Dec-31-2020 (Restated) → Dec-31-2025, EUR | same | Medium — share count trajectory (dilution), treasury shares. |
| Delivery Hero SE XTRA DHER Financials.xls — Cash Flow | Data export (workbook tab) | Annual, EUR | same | High — capital-allocation scorecard input: acquisitions, dividends (nil), buybacks (nil), capex vs D&A. |
| Delivery Hero SE XTRA DHER Financials.xls — Multiples | Data export (workbook tab) | — | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Historical Capitalization | Data export (workbook tab) | EUR | same | Medium — share-count/dilution history. |
| Delivery Hero SE XTRA DHER Financials.xls — Capital Structure Summary | Data export (workbook tab) | EUR | same | Medium — net debt trajectory (capital-allocation lens). |
| Delivery Hero SE XTRA DHER Financials.xls — Capital Structure Details | Data export (workbook tab) | EUR | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Ratios | Data export (workbook tab) | — | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Supplemental | Data export (workbook tab) | EUR | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Industry Specific | Data export (workbook tab) | EUR | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Pension OPEB | Data export (workbook tab) | EUR | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Segments | Data export (workbook tab) | Annual, restated series, EUR | same | Low — business-model territory. |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Consensus | Data export (workbook tab) | Consolidated, IFRS | Aug 10, 2025 (sync date) | Low — earnings-module territory. |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Recent Changes | Data export (workbook tab) | — | same | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Guidance | Data export (workbook tab) | — | same | Low — candor cross-check (guidance vs actual) feeds `06_candor-and-disclosure-quality`. |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Multiples | Data export (workbook tab) | Current FYE Dec-31-2026 | same | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Surprise | Data export (workbook tab) | — | same | Low — beat/miss history, candor cross-check. |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Trends | Data export (workbook tab) | — | same | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Revisions | Data export (workbook tab) | — | same | Low |

No `data/DHER/external/` directory exists in this pool — no externally sourced research (alt-data, expert calls, broker notes) is present.

## 1A. External Data

Not applicable — no `data/DHER/external/` folder present in this pool. No rows to report; the sufficiency verdict below is unaffected by external data by construction.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months, to 2026-08-12) |
|---|---|---|---|
| Proxy / DEF 14A (local equivalent: Corporate Governance Statement + Compensation Report 2024 + Report of the Supervisory Board, bundled in the Annual Report) | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf | FY2024; published Apr 25, 2025 | ~15.6 months from publish date |
| Annual filing | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf | FY2024 (year ended Dec-31-2024) | ~15.6 months (publish) / ~19.4 months (period-end) |
| Compensation disclosure | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf, "Compensation Report 2024" section | FY2024 (Management Board & Supervisory Board pay) | ~15.6 months |
| Ownership / insider-transaction data | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf, "Shareholdings exceeding 10% of voting rights" (WpHG voting-rights notifications) | End of reporting period (Dec-31-2024) | ~15.6 months (proxy for a live 12-month insider-transaction read — see Section 5) |
| Shareholder letter | Not present (German AktG regime does not require one; the Management Board's letter/foreword inside the Annual Report substitutes) | FY2024 | ~15.6 months |
| Transcript | Uber Technologies, Inc., Delivery Hero SE - M&A Call.pdf | Jul 16, 2026 | ~0.9 months |
| Transcript (operating) | Delivery Hero SE, Q1 2026 Sales_ Trading Statement Call, Apr 30, 2026.pdf | Q1 2026 | ~3.4 months |
| 8-K equivalent (material-event / management-change disclosure) | Not present as a standalone filing — CFO change (Emmanuel Thomassin departure, Marie-Anne Popp appointment Jan 2025) is disclosed inside the Annual Report's Related-Party Disclosures note | Disclosed as of FY2024 Annual Report | ~15.6 months |

## 3. Governance Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Proxy / DEF 14A (local equivalent) | Y | Annual Report — Corporate Governance Statement + Compensation Report 2024 + Report of the Supervisory Board [FY24 Annual Report, pp.19–41] | Comp, ownership, board, related-party — all present in this bundled German-regime document |
| Compensation disclosure (metrics/weights) | Y | Compensation Report 2024, audited by KPMG per Section 162 AktG [FY24 Annual Report, p.41 onward]; Related-Party note quantifies Management/Supervisory Board remuneration (€2.7m Management Board total, 2024) [Note 10] | Incentive alignment — states STI/LTIP structure and 2024 ESG-target linkage |
| Beneficial ownership table | Y (partial form) | "Shareholdings exceeding 10% of voting rights" — Naspers Limited / MIH Food Holdings B.V. disclosed via WpHG voting-rights notification [FY24 Annual Report, p.32–33] | Skin in the game, control — German regime discloses via statutory >3%/5%/10% voting-rights notification threshold, not a full US-style beneficial-ownership table; sub-10% holders are referenced to the company's website Voting Rights Notifications page, not reproduced in-document |
| Insider-transaction data (buys/sells) | N | Annual Report references MAR Article 19(11) closed-period obligations for "persons who exercise managerial duties" [p.32] but does NOT reproduce an actual PDMR transaction table (dates/shares/prices) in the extracted text | Conviction signal — process is disclosed, but no buy/sell transaction log is in the pool; this is a genuine gap (see Section 5) |
| Board composition / independence | Y | Supervisory Board = 8 members (4 shareholder representatives incl. independence assessment under Sec. 100(5) AktG/GCGC, 4 employee representatives); individual director "independent" status stated (e.g. Roger Rabalais) [FY24 Annual Report, pp.19–20, p.1288 region] | Board quality, entrenchment |
| Related-party disclosure | Y | Note 10, "Related-Party Disclosures" — Management Board / Supervisory Board members named individually with occupations/other directorships, key-management-personnel remuneration table, receivables/liabilities to related parties, "Result from Transactions with Other Related Parties" table (€27.8m expenses from associates, 2024) [FY24 Annual Report, Note 10, pp.206–207] | Value leakage — quantified and named |
| Control structure (dual-class / blocs) | Y | "There are no different share classes... no shares with special rights conferring powers of control" but Naspers/MIH Food Holdings holds >10% of voting rights [FY24 Annual Report, p.32]; Uber M&A call (Jul 16 2026) states Prosus/Naspers "irrevocably committed to tender its stake" [Uber-DHER M&A Call, p.4] | Minority-shareholder rights — single-class share structure, but one reference shareholder's tender commitment is now a live control-structure event |
| Prior shareholder letters / guidance | Y | Capital IQ Estimates workbook — Guidance and Surprise tabs; FY2025/Q1 2026 transcripts report actuals against prior targets | Promise-vs-delivery |
| M&A / buyback / dividend history | Y | Cash Flow tab (acquisitions, zero dividends, zero buybacks 2020–2025); Annual Report Note on Acquisitions and Divestitures (Woowa Brothers, Glovo, Hungerstation NCI buyout) [Delivery Hero SE XTRA DHER Financials.xls, Cash Flow tab; FY24 Annual Report, p.~164] | Capital-allocation scorecard |
| Management tenure / turnover | Y | Management Board composition table — CFO Emmanuel Thomassin departed end-June 2024, Marie-Anne Popp appointed CFO Jan 2025; Supervisory Board Chair change to Kristin Skogen Lund (June 2024) [FY24 Annual Report, Note 10 (a)/(b), p.206] | Stability and competence |
| Transcripts | Y | FY2025 Earnings Call (Mar 26, 2026), Q1 2026 Trading Statement Call (Apr 30, 2026), Uber M&A Call (Jul 16, 2026) | Candor and tone |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/11_capital-allocation-governance.md | Y |
| business-model/01_disqualifier-scan.md | Y — disqualifier triggered (see Section 6) |
| business-model/12_red-flags-sweep.md | Y |
| business-model/02_business-identity.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/04_guidance-consensus.md | Y |

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No proxy / compensation disclosure | N — compensation disclosure is present and detailed (Compensation Report 2024, KPMG-audited) | 03, 99 | Not applied |
| No ownership / insider-transaction data | Y (partial) — the beneficial-ownership read is limited to the >10% WpHG threshold (one holder, Naspers/MIH) with no full institutional/insider table, AND no actual PDMR buy/sell transaction log is in the pool (only the closed-period disclosure obligation) | 04, 99 | Shareholder friendliness max 60 (ownership/insider-behavior read limited per MODULE_RULES) |
| No board disclosure | N — board composition, independence assessments, and Supervisory Board activity log are present in detail | 05, 99 | Not applied |
| No multi-year history | N — Cash Flow / Balance Sheet / Income Statement workbook tabs cover 2020–2025 (six years) for the capital-allocation scorecard | 02 | Not applied |
| No transcripts / prior letters | N — three transcripts present (FY2025 call, Q1 2026 call, M&A call), plus Capital IQ Guidance/Surprise tabs for promise-vs-delivery | 01, 06 | Not applied |

## 5A. Jurisdiction & Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | Germany | "Prime Standard segment of the Frankfurt Stock Exchange" [FY24 Annual Report, Corporate Governance section]; ticker XTRA:DHER (Deutsche Börse Xetra) across all Capital IQ exports |
| Exchange | Deutsche Börse Xetra, Prime Standard (Frankfurt Stock Exchange) | Same as above |
| Filing regime (US SEC / India SEBI-LODR / UK / Singapore / Other) | Other — Germany / EU (SE — Societas Europaea; German Stock Corporation Act (AktG), SE Regulation, German Corporate Governance Code (GCGC), regulated by BaFin) | Annual Report cites AktG (Sections 84–85, 162, 176), SE Regulation (Sections 9, 39, 46), WpHG (Sections 32–34), and the GCGC throughout the Corporate Governance and Compensation Report sections |
| Sector | Online food-delivery / quick-commerce marketplace (consumer internet platform) | Business Description tab [Company Comparable Analysis Delivery Hero SE.xls]; Annual Report segment structure (Asia, MENA, Europe, Americas, Integrated Verticals) |
| Sector-specific governance overlay required? (Y/N + which) | N — none of the MODULE_RULES sector overlays (banks/NBFC, IT services, pharma, infra/real estate, holdco/conglomerate) apply; standard consumer-internet-platform governance lens applies (RPT, board independence, incentive alignment, M&A discipline per §24 Filter 4 given the multi-deal history) | MODULE_RULES.md Sector-Specific Governance Overlays section |
| Document language(s) | English (Annual Report, all transcripts, all Capital IQ exports) — no non-English documents in this pool; per CLAUDE.md §27 this would not be a gap even if present | Direct read of all extracted files |

For a German SE under the two-tier board system, the local proxy-equivalent is the Annual Report's Corporate Governance Statement + Compensation Report + Report of the Supervisory Board (all present and bundled in one document); the ownership-equivalent is the WpHG voting-rights notification disclosure (present, but only above the 10% threshold as reproduced in-document); the board-equivalent is the Supervisory Board (Aufsichtsrat) composition and independence assessment (present in detail). No US DEF 14A / Form 4 / 10-K should be expected or marked "missing" — none of the local equivalents are absent.

## Language is not a data gap (CLAUDE.md §27)

All documents in this pool are in English; no translation issue arises. Noted per instructions — no downgrade applied and none would apply even for a non-English filing.

## External data (frameworks/EXTERNAL_DATA.md)

No `data/DHER/external/` folder exists in this pool. No external documents to inventory; the sufficiency verdict is unaffected by this absence.

## 5B. Source Coverage Matrix

| Governance Need | Best Available Source | Period | Confidence 1–5 | Missing? | Replacement Source |
|---|---|---|---|---|---|
| Board composition | FY24 Annual Report, Corporate Governance Statement / Note 10(b) | FY2024 | 5 | N | — |
| Compensation | FY24 Annual Report, Compensation Report 2024 (KPMG-audited) | FY2024 | 5 | N | — |
| Ownership | FY24 Annual Report, "Shareholdings exceeding 10% of voting rights" (WpHG notification) | As of Dec-31-2024 | 3 | Partial — only the >10% holder (Naspers/MIH) is reproduced in-text; full shareholder register not in pool | Company's own "Voting Rights Notifications" webpage (referenced but not in pool) — Web source, would need dating/labelling as unverified if pulled |
| Insider trades | Not present (only the MAR Art. 19(11) closed-period obligation is described, no transaction log) | — | 0 | Y | BaFin/company ad-hoc PDMR-notification disclosures (not in pool) — would be Web-sourced, unverified |
| Related-party transactions | FY24 Annual Report, Note 10 "Related-Party Disclosures" | FY2024 | 5 | N | — |
| Auditor report | FY24 Annual Report, Independent Auditor's Report (KPMG) | FY2024 | 5 | N | — |
| Secretarial / compliance report | FY24 Annual Report, Corporate Governance Statement — Declaration of Compliance with the GCGC (Section 161 AktG) | FY2024 | 5 | N | — |
| AGM voting | FY24 Annual Report — 2024 AGM (June 19, 2024) result cited for Compensation Report 2023 approval (93.05% majority); no full AGM voting-results table for all resolutions in the extracted text | FY2024 (2024 AGM covering 2023 items) | 3 | Partial — one resolution's vote result is quoted, not a complete AGM voting table | Company AGM voting-results disclosure (referenced, not in pool) |
| Capital-allocation history | Delivery Hero SE XTRA DHER Financials.xls — Cash Flow / Balance Sheet / Historical Capitalization tabs | FY2020–FY2025 | 5 | N | — |
| Legal / regulatory cases | FY24 Annual Report, Independent Auditor's Report — Glovo Spain social-security investigation / going-concern note; European Commission formal investigation references | FY2024 (ongoing as of report date) | 5 | N | — |

## 5C. Data Freshness

| Source | Period | As-of Date | Age | Stale? | Impact |
|---|---|---|---|---|---|
| Annual Report (proxy/comp/board/RPT-equivalent) | FY2024 | Published Apr 25, 2025 | ~15.6 months (publish) / ~19.4 months (period-end) | Somewhat — no FY2025 audited annual report is in the pool, so the compensation/board/RPT read is one full fiscal year behind the most recent transcript-reported actuals | Incentive-alignment and RPT reads rest on FY2024 data; FY2025 comp structure changes (if any) are not directly evidenced, only inferable from transcripts |
| FY2025 Earnings Call transcript | FY2025 actuals | Mar 26, 2026 | ~4.6 months | No | Candor/promise-vs-delivery read is current |
| Q1 2026 Trading Statement Call | Q1 2026 | Apr 30, 2026 | ~3.4 months | No | Current operating-tone read |
| Uber M&A Call | Live deal | Jul 16, 2026 | ~0.9 months | No | Most current document in the pool; direct evidence of reference-shareholder tender intent |
| Ownership (>10% WpHG notification) | As of Dec-31-2024 | Inside FY24 Annual Report | ~19.4 months (period-end) | Somewhat — but the Uber M&A call (0.9 months old) provides a fresher, more material ownership/control signal (Naspers/Prosus tender commitment) that supersedes the FY2024 static disclosure for the CURRENT control-structure read | Ownership specialist (04) should lead with the M&A-call tender-commitment evidence for current control read, and use the FY24 WpHG notification for the historical >10% holder identity |

CSV export: `analyses/DHER_2026-08-12/management-governance/source_manifest.csv` — pending (this environment does not support a separate file write from this subagent per its output-path restriction; the table above is the authoritative source manifest for this run).

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A proxy-equivalent/compensation disclosure (Annual Report's Compensation Report + Corporate Governance Statement), an ownership disclosure (WpHG >10% voting-rights notification plus a live M&A-call tender-commitment signal), and a board/related-party disclosure (Supervisory Board composition + independence + Note 10) are all present, together with a six-year (2020–2025) capital-allocation history in the Capital IQ workbooks — so all six specialists can run.
- **Specialists that can run:** management track record (01), capital allocation (02), incentives/compensation (03), ownership and insider behavior (04 — with the cap below), board and shareholder rights (05), candor and disclosure quality (06)
- **Hard disqualifier already flagged by business-model/01_disqualifier-scan?** Y — auditor-flagged, subsidiary-level going-concern note (Glovo Spain, social-security investigation, contingent liability €440–770m; Group-level opinion unmodified) [FY24 Annual Report, Independent Auditor's Report, pp.222–223]. Per MODULE_RULES.md Disqualifier Deference and Score Cap Rules, downstream synthesis must apply the Governance-risk floor (≥80) and cap the stewardship verdict at no better than "Serious governance concerns," regardless of the otherwise-detailed disclosure record documented above.
- **Active partial-data caps:**
  - Ownership/insider-transaction read is limited to the single >10% WpHG-notification holder (Naspers/MIH Food Holdings) as reproduced in the Annual Report; no full beneficial-ownership table and no PDMR buy/sell transaction log are in the pool — apply **Shareholder friendliness max 60** per MODULE_RULES.md Score Cap Rules ("No ownership / insider-transaction data").
- **Critical missing items:**
  - No PDMR (insider) transaction log — only the MAR Article 19(11) closed-period obligation is disclosed, not actual buy/sell records.
  - No full AGM voting-results table across all resolutions (only the Compensation Report 2023 approval vote, 93.05%, is quoted).
  - No FY2025 audited Annual Report — compensation, board, and related-party disclosures rest on FY2024 data (~19.4 months stale at period-end), one full fiscal year behind the transcript-reported FY2025 actuals.
- **Single highest-value missing document:** A PDMR (insider) transaction disclosure log covering 2025–2026 (buys/sells by Management Board and Supervisory Board members), to give the ownership specialist (04) a direct conviction signal ahead of the Uber tender offer.
