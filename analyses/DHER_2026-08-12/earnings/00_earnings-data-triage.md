# Earnings Data Triage — DHER

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | Germany | Annual Report states listing on the "Prime Standard segment of the Frankfurt Stock Exchange" [FY24 Annual Report, cover/corporate governance section]; ticker XTRA:DHER (Deutsche Börse Xetra) confirmed across all Capital IQ exports |
| Exchange | Deutsche Börse Xetra (Prime Standard, Frankfurt Stock Exchange) | Capital IQ workbook headers: "Delivery Hero SE (XTRA:DHER)" [all CIQ tabs] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | Other — EU/Germany, SE (Societas Europaea) regulated under German/EU disclosure rules (BaFin) | No US SEC forms or India SEBI filings in the pool; local documents present are the German-regime Annual Report and S&P CIQ earnings/trading-statement call transcripts standing in for interim disclosure |
| Reporting standard (US GAAP / IFRS / Ind AS) | IFRS as adopted by the EU, consolidated | FY24 Annual Report text: "International Financial Reporting Standards (IFRS) as adopted by the [EU]"; Capital IQ Estimates workbook header: "Acctg. Standard: IFRS" [DeliveryHeroSEXTRADHEREstimatesReport.xls, Consensus tab] |
| Reporting currency | EUR | CIQ Financials workbook: "Currency: Reported Currency ... EUR" [Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet / Income Statement / Cash Flow tabs]; Annual Report tables in "EUR million" |
| Fiscal-year end | December 31 | CIQ workbooks: "For the Fiscal Period Ending ... Dec-31-2025" [Income Statement, Balance Sheet, Cash Flow tabs]; "Current Fiscal Year End: Dec-31-2026" [Estimates workbook, Consensus/Guidance/Surprise/Trends/Revisions tabs] |
| Document language(s) | English (all documents in the pool — Annual Report, transcripts, Capital IQ exports) | Direct read of all extracted files; no non-English document encountered, so §27's "language is not a data gap" is not triggered either way |

Downstream agents should read the Annual Report as the Tier-1 audited source (§4) for FY2024, and treat the FY2025/FQ1 2026 figures sourced from the CIQ workbook and earnings-call transcripts as Tier-5/Tier-6 pending an audited FY2025 filing. **DHER is currently subject to a live, announced acquisition offer from Uber** (M&A Call transcript, Jul 16, 2026) — the earnings module should flag guidance/consensus reads as occurring inside an active M&A situation, not steady-state standalone commentary.

## 1. File Inventory

Multi-tab workbooks were pre-extracted with `.claude/tools/extract_pool.py` (`analyses/DHER_2026-08-12/_pool_extracts/`, manifest: 3 workbooks → 28 tabs, 37 extract files, 0 failures — none of the three workbooks failed or fell back). Every workbook tab is listed as its own row, reconciled against `_pool_extracts/manifest.md`.

| Filename | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf | Annual filing (Annual Report incl. Combined Management Report + audited IFRS consolidated financials + Auditor's Report) | FY2024 (year ended Dec-31-2024); published Apr 25, 2025 | Aug 10, 2025 (Drive sync date — not authoritative, F23) | High |
| Delivery_Hero_SE_-_Form_Annual_Report(Apr-25-2025).pdf | Annual filing — byte-identical duplicate (MD5-identical to the file above) | Same as above | Aug 10, 2025 (sync date) | High (same document, counted once) |
| Delivery Hero SE, 2025 Earnings Call, Mar 26, 2026.pdf | Earnings transcript — verbatim (S&P CIQ FY2025 full-year earnings call, prepared remarks + Q&A) | FY2025 actuals (Revenue €14,059.6m vs. consensus €14,212.8m; EPS Normalized €(1.32) vs. consensus €0.51); call held Mar 26, 2026 | Aug 10, 2025 (sync date) | High — reports FY2025 actuals ahead of any FY2025 audited annual report being in the pool |
| Delivery Hero SE, Q1 2026 Sales_ Trading Statement Call, Apr 30, 2026.pdf | Earnings transcript — verbatim (S&P CIQ Sales/Trading Statement Call, prepared remarks + Q&A); quarterly-equivalent | Q1 2026 (call held Apr 30, 2026) | Aug 10, 2025 (sync date) | High — closest surrogate in the pool for a Q1 2026 quarterly filing; no interim financial-statement filing itself is present |
| Uber Technologies, Inc., Delivery Hero SE - M&A Call.pdf | Deal / M&A transcript — verbatim (S&P CIQ), NOT an earnings call | Call held Jul 16, 2026 | Aug 10, 2025 (sync date) | Medium — material event overlay (announced acquisition offer), not itself an earnings source; most recent document in the pool by call date |
| Delivery Hero SE XTRA DHER Analyst Coverage.rtf | Data export (sell-side coverage list — names/ratings/targets only, not an earnings-call summary) | Undated snapshot | Aug 10, 2025 (sync date) | Low — not a transcript proxy (no call-summary content), just a coverage roster |
| Delivery Hero SE XTRA DHER Competitors.rtf | Data export (competitor list) | Undated snapshot | Aug 10, 2025 (sync date) | Low |
| Delivery Hero SE XTRA DHER Customers.rtf | Data export (customer relationships) | Undated snapshot | Aug 8, 2025 (sync date) | Low |
| Delivery Hero SE XTRA DHER Fixed Income Securities Summary.rtf | Data export (debt securities) | Undated snapshot | Aug 10, 2025 (sync date) | Low for earnings; relevant to balance-sheet-survival module |
| Company Comparable Analysis Delivery Hero SE.xls — Financial Data | Data export (workbook tab) | Multi-year financials, USD, As-Of 2026-08-10 | same | Medium |
| Company Comparable Analysis Delivery Hero SE.xls — Trading Multiples | Data export (workbook tab) | As-Of 2026-08-10 | same | Medium |
| Company Comparable Analysis Delivery Hero SE.xls — Operating Statistics | Data export (workbook tab) | As-Of 2026-08-10 | same | Low |
| Company Comparable Analysis Delivery Hero SE.xls — Business Description | Data export (workbook tab) | As-Of 2026-08-10 | same | Low |
| Company Comparable Analysis Delivery Hero SE.xls — Implied Valuation | Data export (workbook tab) | As-Of 2026-08-10 | same | Low (out of scope for earnings) |
| Company Comparable Analysis Delivery Hero SE.xls — Valuation Chart | Data export (workbook tab) | As-Of 2026-08-10 | same | Low |
| Company Comparable Analysis Delivery Hero SE.xls — Credit Health Panel | Data export (workbook tab) | As-Of 2026-08-10 | same | Low |
| Company Comparable Analysis Delivery Hero SE.xls — Disclaimer | Data export (workbook tab) | n/a | same | n/a |
| Delivery Hero SE XTRA DHER Financials.xls — Key Stats | Data export (workbook tab) | Annual, Dec-31-2021A → Dec-31-2027E, EUR; includes current Share Price €37.2 and Market Cap | Aug 10, 2025 (sync date) | High |
| Delivery Hero SE XTRA DHER Financials.xls — Income Statement | Data export (workbook tab) | Annual, Dec-31-2020 (Restated) → Dec-31-2025, EUR | same | High |
| Delivery Hero SE XTRA DHER Financials.xls — Balance Sheet | Data export (workbook tab) | Annual, Dec-31-2020 (Restated) → Dec-31-2025, EUR | same | High |
| Delivery Hero SE XTRA DHER Financials.xls — Cash Flow | Data export (workbook tab) | Annual, Dec-31-2020 (Restated) → Dec-31-2025, EUR | same | High |
| Delivery Hero SE XTRA DHER Financials.xls — Multiples | Data export (workbook tab) | — | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Historical Capitalization | Data export (workbook tab) | EUR | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Capital Structure Summary | Data export (workbook tab) | EUR | same | Medium |
| Delivery Hero SE XTRA DHER Financials.xls — Capital Structure Details | Data export (workbook tab) | EUR | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Ratios | Data export (workbook tab) | — | same | Medium |
| Delivery Hero SE XTRA DHER Financials.xls — Supplemental | Data export (workbook tab) | EUR | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Industry Specific | Data export (workbook tab) | EUR | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Pension OPEB | Data export (workbook tab) | EUR | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Segments | Data export (workbook tab) | Annual, restated series, Dec-31-2020 → Dec-31-2025, EUR | same | High — segment GMV/revenue/Adj. EBITDA by region (Asia, MENA, Europe, Americas, Integrated Verticals) |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Consensus | Data export (workbook tab) | Annual FY estimates + quarterly (FQ) actual/estimate series from FQ3 2017 through FQ4 2026; current fiscal-year end Dec-31-2026, next print FQ2 2026 due Aug-27-2026 | Aug 10, 2025 (sync date) | High — includes recommendation mix (Hold, mean 2.86), target price mean €37.97, and quarterly Revenue actuals through FQ1 2026 |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Recent Changes | Data export (workbook tab) | — | same | Medium |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Guidance | Data export (workbook tab) | Historical formal-guidance-vs-actual, FY2017–FY2022 populated; FY2023–FY2026 rows blank (no formal numeric guidance range captured for those years in this export) | same | Medium |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Multiples | Data export (workbook tab) | Current Fiscal Year End: Dec-31-2026 | same | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Surprise | Data export (workbook tab) | Annual EPS Normalized / EPS GAAP surprise history FY2017–FY2025 (Announced Dates through 2026-03-25) | same | High — beat/miss history |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Trends | Data export (workbook tab) | EPS Normalized estimate-revision trend by vintage (current, 1/2/3/6/9/12/18 months ago), FY2026–FY2035 | same | High — revision momentum |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Revisions | Data export (workbook tab) | Analyst count / upward-downward revision counts by month, FY2026–FY2035 | same | High — revision momentum |

Note on "Last Modified": these are Drive-sync timestamps (Aug 8–10, 2025), not document dates. Per fix F23, document currency is taken from dates printed inside each document. Several documents (the Q1 2026 call, the M&A call, and the Comparable Analysis "As-Of Date: 2026-08-10") post-date the sync timestamp, confirming the sync date is not a reliable freshness signal and is not used for the sufficiency read below.

No `ciq_facts.json` sidecar exists at `analyses/DHER_2026-08-12/_pool_extracts/ciq_facts.json`. Headline figures cited in this triage are this agent's own sourced read of the workbooks/filings/transcripts, each individually cited.

## 1A. External Data

Not applicable — no `data/DHER/external/` directory exists in this pool. No externally sourced research (alt-data panels, expert calls, channel checks, broker research) is present; nothing here affects the sufficiency verdict.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months, to 2026-08-12) |
|---|---|---|---|
| Annual filing | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf | FY2024 (year ended Dec-31-2024); published Apr 25, 2025 | ~15.6 months from publish date; ~19.4 months from period end — no FY2025 audited annual report is present |
| Quarterly filing | None present (no standalone interim financial-statement filing in the pool) | — | — |
| Earnings transcript | Delivery Hero SE, Q1 2026 Sales/Trading Statement Call, Apr 30, 2026.pdf (verbatim) | Q1 2026 | ~3.4 months |
| Earnings transcript (secondary, full-year) | Delivery Hero SE, 2025 Earnings Call, Mar 26, 2026.pdf (verbatim) | FY2025 actuals | ~4.6 months |
| Investor deck | None present | — | — |
| Consensus / estimate export | DeliveryHeroSEXTRADHEREstimatesReport.xls — Consensus tab | FY2026E, target price mean €37.97 as of consensus data | ~0.1 months (CIQ export, exact "data as of" not separately timestamped beyond FQ2 2026 release date field) |
| Cash flow data | Delivery Hero SE XTRA DHER Financials.xls — Cash Flow tab | Annual through Dec-31-2025 | Latest column FY2025 (audited-equivalent via CIQ, actual not audited filing) |
| Guidance data | DeliveryHeroSEXTRADHEREstimatesReport.xls — Guidance tab | Populated FY2017–FY2022; FY2023–FY2026 rows blank in this export | — |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | Delivery Hero SE XTRA DHER Financials.xls, Income Statement tab (annual, through FY2025), and FY24 Annual Report (audited) | Needed for revenue, margin, EPS |
| Balance sheet | Y | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab (annual, through Dec-31-2025), and FY24 Annual Report (audited) | Needed for working capital and leverage |
| Cash flow statement | Y | Delivery Hero SE XTRA DHER Financials.xls, Cash Flow tab (annual, through FY2025), and FY24 Annual Report (audited) | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y (partial) | DeliveryHeroSEXTRADHEREstimatesReport.xls, Consensus tab — quarterly Revenue actuals through FQ1 2026 (Mar 2026); plus Q1 2026 Sales/Trading Statement Call transcript (Apr 30, 2026) for qualitative colour. No FQ2 2026 print yet (scheduled Aug-27-2026, after this run's data cutoff) | Needed for trend and setup |
| Last 8 quarters | Y (partial) | DeliveryHeroSEXTRADHEREstimatesReport.xls, Consensus/Surprise tabs — quarterly Revenue series runs FQ1 2025 through FQ1 2026 actuals (and further back, non-contiguous for some quarters, e.g. FQ4 2024 blank); EBITDA quarterly is sparse/mostly blank in recent quarters — no full 8-quarter EBITDA/margin series is populated in this export | Needed for seasonality and inflection |
| Consensus estimates | Y | DeliveryHeroSEXTRADHEREstimatesReport.xls, Consensus tab — Target Price mean €37.97, Recommendation Hold (2.86), FY2026E/FY2027E EPS and revenue | Needed for market bar |
| Estimate revisions | Y | DeliveryHeroSEXTRADHEREstimatesReport.xls, Trends and Revisions tabs — EPS Normalized estimate history by vintage, analyst upward/downward revision counts | Needed for revision momentum |
| Earnings transcript | Y (verbatim) | Delivery Hero SE, 2025 Earnings Call (Mar 26, 2026) and Q1 2026 Sales/Trading Statement Call (Apr 30, 2026) — both S&P CIQ verbatim transcripts with prepared remarks and Q&A | Needed for management tone and driver detail |
| Segment P&L | Y | Delivery Hero SE XTRA DHER Financials.xls, Segments tab — GMV/revenue/Adj. EBITDA by region (Asia, MENA, Europe, Americas, Integrated Verticals), annual through FY2025; also business-model `03_segment-map.md` | Needed for mix shift |
| Current price | Y | Delivery Hero SE XTRA DHER Financials.xls, Key Stats tab — "Latest Capitalization": Share Price €37.2, Market Capitalization €11,299.3m | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y |
| 06_value-chain.md | Y |
| 10_external-dependency.md | Y |

The full business-model module has completed (00 through 99, plus dossier) at `analyses/DHER_2026-08-12/business-model/`. That module's `00_data-triage.md` independently confirms the same jurisdiction/regime findings and flags the live Uber M&A call as a material overlay — consistent with this triage.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus data IS present (CIQ Estimates workbook, Consensus/Trends/Revisions/Surprise tabs) | 04, 05, 99 | None |
| No quarterly data | N (partial) — quarterly Revenue actuals present through FQ1 2026, but no standalone quarterly financial-statement filing and no full 8-quarter EBITDA/margin series | 01, 02, 03, 06 | No score cap triggered (quarterly data is not absent, only thinner than a filed 10-Q/quarterly-results equivalent would give); note the gap explicitly when doing QoQ/seasonality work |
| No VERBATIM transcript, sell-side proxy present | N — verbatim transcripts ARE present (both the FY2025 Earnings Call and the Q1 2026 Sales/Trading Statement Call are S&P CIQ verbatim call transcripts, not sell-side proxies) | 02, 03, 04 | None |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | None |
| No segment-level P&L | N — Segments tab (CIQ) and business-model `03_segment-map.md` both provide segment revenue/Adj. EBITDA by region | 02, 03, 99 | None |
| No cash flow statement | N — annual cash flow statement present through FY2025 (CIQ) and FY2024 (audited Annual Report) | 06, 99 | None |
| No current price | N — Share Price €37.2 / Market Cap €11,299.3m present (Key Stats tab, "Latest Capitalization") | 99 | None |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has an audited annual filing (FY24 Annual Report, published Apr-25-2025, inside the sufficiency window) AND two verbatim earnings-call transcripts inside the last 5 months (FY2025 results call, Mar-26-2026; Q1 2026 trading-statement call, Apr-30-2026) AND a full income statement, balance sheet, and cash flow statement (through FY2025 via the CIQ workbook, through FY2024 via the audited filing) — both legs of the sufficiency rule (annual + quarterly/transcript, and the three core statements) are met, plus segment P&L, consensus estimates, revision history, and a current price.
- **Active partial-data caps:** None triggered — this is not a Partial verdict.
- **Critical missing items (do not block the verdict, but downstream agents should account for them):**
  - No audited FY2025 annual report is present. The only FY2025 full-year numbers in the pool come from the verbatim earnings-call transcript (Tier 6, per this module's source hierarchy) and the Capital IQ workbook exports (Tier 5), not an audited Tier-1 filing. The FY2024 Annual Report remains the most recent Tier-1 source and its numbers are ~19.4 months old relative to today.
  - No standalone quarterly/interim financial-statement filing is present — the closest surrogate is the Q1 2026 "Sales/Trading Statement Call" transcript plus quarterly Revenue actuals in the CIQ Consensus tab. Quarterly EBITDA/margin data is sparse (mostly blank) in the exported series, so a clean, contiguous 8-quarter EBITDA/margin trend is not directly available — agents doing QoQ/seasonality work on margins should state this limitation rather than interpolate.
  - No investor presentation/deck is present in the pool.
  - No `external/` documents and no `ciq_facts.json` sidecar exist for this ticker/date.
  - DHER is currently the subject of an announced acquisition offer from Uber (M&A Call transcript, Jul 16, 2026, ~0.9 months old — the most recent document in the pool). Downstream agents (especially 04_guidance-consensus, 05_beat-miss-setup, and 99_earnings-synthesis) should treat any post-Jul-16-2026 guidance, consensus, or price commentary as occurring inside a live M&A situation and flag it accordingly, rather than reading it as a steady-state standalone earnings setup.
