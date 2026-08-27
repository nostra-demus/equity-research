# Earnings Data Triage — META

Extraction note: the canonical pre-extraction step (`extract_pool.py`) had already been run for this ticker/date pair before this session (output at `analyses/META_2026-08-27/_pool_extracts/`, generated 2026-08-27). Its manifest reports 24 pool files (10 workbooks split into 53 tabs) → 67 extract files, **0 extraction failures**. That existing manifest is used below as the authoritative inventory; no source in this pool is in a `fail` / `fallback-text` / `missing-dependency` state. No `ciq_facts.json` or `relationships.json` sidecar is present in `_pool_extracts/`, so headline numbers below are this agent's own sourced read of the raw extracts, not a pinned sidecar reconciliation. No `data/META/external/` folder exists, so there is no External Data section (Section 1A omitted).

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | [FY25 Form 10-K, cover / Item 1] |
| Exchange | Nasdaq Global Select Market (ticker META, Class A common stock) | [FY25 Form 10-K, cover] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | [FY25 Form 10-K, cover; Q2 2026 Form 10-Q, cover] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | [Q2 2026 Form 10-Q, Note 1 — Basis of Presentation] |
| Reporting currency | USD | [FY25 Form 10-K; Q2 2026 Form 10-Q, consolidated statements] |
| Fiscal-year end | 31 December | [FY25 Form 10-K, cover] |
| Document language(s) | English (all pool documents) | [All filings, transcripts, decks, and CIQ exports] |

US SEC forms are the correct regime here — this is a US-domiciled, US-listed issuer, so 10-K / 10-Q / 8-K-exhibit press releases and DEF 14A are the native local documents, not placeholders for a non-US equivalent.

## 1. File Inventory

Periods below are read from each document's own content (period-end / "as of" / fiscal-year lines), not the Drive-sync modification timestamp on disk (all pool files show a 2026-08-26 sync stamp regardless of the underlying document's actual vintage).

| Filename | Type | Period Covered | Last Modified (Drive sync) | Earnings Relevance |
|---|---|---|---|---|
| Meta_Platforms_Inc_-_Form_10-K(Jan-29-2026).doc | Annual filing — Form 10-K | FY2025, ended 2025-12-31; filed 2026-01-29 | 2026-08-26 | High |
| Meta_Platforms_Inc_-_Form_10-Q(Jul-30-2026).doc | Quarterly filing — Form 10-Q | Q2 2026, ended 2026-06-30; filed 2026-07-30 | 2026-08-26 | High |
| Meta_Platforms_Inc_-_Form_DEF_14A(Apr-16-2026).doc | Proxy / governance filing — DEF 14A | 2026 annual meeting proxy; filed 2026-04-16 | 2026-08-26 | Low (governance/comp, not earnings-driver data) |
| Meta Platforms, Inc., Q4 2025 Earnings Call, Jan 28, 2026.rtf | Earnings transcript (verbatim, CIQ) | Q4 & FY2025, ended 2025-12-31; call 2026-01-28 | 2026-08-26 | High |
| Meta Platforms, Inc., Q1 2026 Earnings Call, Apr 29, 2026.rtf | Earnings transcript (verbatim, CIQ) | Q1 2026, ended 2026-03-31; call 2026-04-29 | 2026-08-26 | High |
| Meta Platforms, Inc., Q2 2026 Earnings Call, Jul 29, 2026.rtf | Earnings transcript (verbatim, CIQ) | Q2 2026, ended 2026-06-30; call 2026-07-29 | 2026-08-26 | High |
| Meta-03-31-2026-Exhibit-99-1_Q1_Press Release.pdf | Earnings press release (SEC Ex-99.1) | Q1 2026, ended 2026-03-31; released 2026-04-29 | 2026-08-26 | High |
| Meta-06-30-2026-Exhibit-99-1_Q2_Press Release.pdf | Earnings press release (SEC Ex-99.1) | Q2 2026, ended 2026-06-30; released 2026-07-29 | 2026-08-26 | High |
| Earnings-Presentation-Q1-2026.pdf | Investor deck | Q1 2026, ended 2026-03-31 | 2026-08-26 | High |
| Earnings-Presentation-Q2-2026.pdf | Investor deck | Q2 2026, ended 2026-06-30 | 2026-08-26 | High |
| MetaPlatforms,IncNasdaqGSMETAEstimatesReport.xls — tab: Consensus (477×69) | Consensus / estimate export (CIQ) | FY2026/FY2027 estimates; target price, LT growth, recommendation mix | 2026-08-26 | High |
| MetaPlatforms,IncNasdaqGSMETAEstimatesReport.xls — tab: Recent Changes (265×10) | Consensus / estimate export (CIQ) | FY2026/FY2027 estimate changes | 2026-08-26 | High |
| MetaPlatforms,IncNasdaqGSMETAEstimatesReport.xls — tab: Guidance (86×54) | Guidance export (CIQ) | Guidance history 2012–2026; latest issued 2026-07-29 for Q3 2026 / FY2026 | 2026-08-26 | High |
| MetaPlatforms,IncNasdaqGSMETAEstimatesReport.xls — tab: Multiples (26×7) | Estimate multiples export (CIQ) | FY2026/FY2027 estimate multiples | 2026-08-26 | Medium |
| MetaPlatforms,IncNasdaqGSMETAEstimatesReport.xls — tab: Surprise (208×59) | Beat/miss history export (CIQ) | Historical quarters through Q2 2026; forward Q3 2026 | 2026-08-26 | High |
| MetaPlatforms,IncNasdaqGSMETAEstimatesReport.xls — tab: Trends (332×22) | Estimate trend export (CIQ) | FY2026/FY2027 estimate trend data | 2026-08-26 | High |
| MetaPlatforms,IncNasdaqGSMETAEstimatesReport.xls — tab: Revisions (491×21) | Estimate revisions export (CIQ) | Revision counts, last 1/2/3 months, through file date | 2026-08-26 | High |
| Meta Platforms Inc NasdaqGS META Financials_Annual.xls — tab: Key Stats (97×12) | CIQ annual financials export | FY2017–FY2025; LTM through 2026-06-30 | 2026-08-26 | Medium |
| Meta Platforms Inc NasdaqGS META Financials_Annual.xls — tab: Income Statement (119×11) | CIQ annual financials export | FY2017–FY2025; LTM through 2026-06-30 | 2026-08-26 | High |
| Meta Platforms Inc NasdaqGS META Financials_Annual.xls — tab: Balance Sheet (91×11) | CIQ annual financials export | FY2017–FY2025 | 2026-08-26 | High |
| Meta Platforms Inc NasdaqGS META Financials_Annual.xls — tab: Cash Flow (73×11) | CIQ annual financials export | FY2017–FY2025; LTM through 2026-06-30 | 2026-08-26 | High |
| Meta Platforms Inc NasdaqGS META Financials_Annual.xls — tab: Multiples (91×41) | CIQ annual financials export | FY2017–FY2025 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Financials_Annual.xls — tab: Historical Capitalization (39×39) | CIQ annual financials export | Through 2026-06-30 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Financials_Annual.xls — tab: Capital Structure Summary (102×21) | CIQ annual financials export | FY2017–FY2025 | 2026-08-26 | Medium |
| Meta Platforms Inc NasdaqGS META Financials_Annual.xls — tab: Capital Structure Details (45×10) | CIQ annual financials export | Latest through 2026-06-30 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Financials_Annual.xls — tab: Ratios (161×11) | CIQ annual financials export | FY2017–FY2025 | 2026-08-26 | Medium |
| Meta Platforms Inc NasdaqGS META Financials_Annual.xls — tab: Supplemental (55×10) | CIQ annual financials export | FY2017–FY2025 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Financials_Annual.xls — tab: Industry Specific (15×6) | CIQ annual financials export | FY2017–FY2025 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Financials_Annual.xls — tab: Pension OPEB (15×6) | CIQ annual financials export | FY2017–FY2025 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Financials_Annual.xls — tab: Segments (81×10) | CIQ annual financials export | FY2017–FY2025; LTM through 2026-06-30 | 2026-08-26 | High |
| Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — tab: Key Stats (97×12) | CIQ quarterly financials export | Q1 2017–Q2 2026; current share price shown ($570.05) | 2026-08-26 | Medium |
| Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — tab: Income Statement (115×39) | CIQ quarterly financials export | Q1 2017–Q2 2026 | 2026-08-26 | High |
| Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — tab: Balance Sheet (90×39) | CIQ quarterly financials export | Q1 2017–Q2 2026 | 2026-08-26 | High |
| Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — tab: Cash Flow (73×39) | CIQ quarterly financials export | Q1 2017–Q2 2026 | 2026-08-26 | High |
| Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — tab: Multiples (91×41) | CIQ quarterly financials export | Q1 2017–Q2 2026 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — tab: Historical Capitalization (39×39) | CIQ quarterly financials export | Through 2026-06-30 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — tab: Capital Structure Summary (72×77) | CIQ quarterly financials export | Quarterly through 2026-06-30 | 2026-08-26 | Medium |
| Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — tab: Capital Structure Details (45×10) | CIQ quarterly financials export | Latest through 2026-06-30 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — tab: Ratios (161×39) | CIQ quarterly financials export | Q1 2017–Q2 2026 | 2026-08-26 | Medium |
| Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — tab: Supplemental (43×39) | CIQ quarterly financials export | Q1 2017–Q2 2026 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — tab: Industry Specific (15×6) | CIQ quarterly financials export | Q1 2017–Q2 2026 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — tab: Pension OPEB (15×6) | CIQ quarterly financials export | Q1 2017–Q2 2026 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — tab: Segments (77×39) | CIQ quarterly financials export | Q1 2017–Q2 2026 | 2026-08-26 | High |
| Meta Platforms Inc NasdaqGS META Key Developments.xls — tab: Key Developments (271×7) | Key-developments export (CIQ) | Latest dated item 2026-07-29 | 2026-08-26 | Medium (catalysts/events context) |
| Meta Platforms Inc NasdaqGS META Events Calendar.xls — tab: Events Calendar (65×3) | Events-calendar export (CIQ) | Calendar year 2026; next release date shown | 2026-08-26 | Medium (next-earnings-date confirmation) |
| Meta Platforms Inc NasdaqGS META Credit Health Panel.xls — tab: Summary (43×11) | CIQ credit panel | LTM through 2026-06-30 | 2026-08-26 | Medium (leverage/liquidity context for cash-flow read) |
| Meta Platforms Inc NasdaqGS META Credit Health Panel.xls — tab: Financials (40×13) | CIQ credit panel | LTM through 2026-06-30 | 2026-08-26 | Medium |
| Meta Platforms Inc NasdaqGS META Credit Health Panel.xls — tab: Operational Metrics Charts (21×19) | CIQ credit panel | LTM through 2026-06-30 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Credit Health Panel.xls — tab: Solvency Metrics Charts (18×19) | CIQ credit panel | LTM through 2026-06-30 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Credit Health Panel.xls — tab: Liquidity Metrics Charts (15×19) | CIQ credit panel | LTM through 2026-06-30 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Credit Health Panel.xls — tab: Disclaimer (26×1) | CIQ credit panel | No period stated | 2026-08-26 | Low |
| Company Comparable Analysis Meta Platforms Inc .xls — tab: Financial Data (50×17) | CIQ peer-comparable export | As of 2026-08-26; Meta LTM through 2026-06-30 | 2026-08-26 | Low (peer/valuation, not earnings-driver data) |
| Company Comparable Analysis Meta Platforms Inc .xls — tab: Trading Multiples (50×9) | CIQ peer-comparable export | As of 2026-08-26 | 2026-08-26 | Low |
| Company Comparable Analysis Meta Platforms Inc .xls — tab: Operating Statistics (50×13) | CIQ peer-comparable export | As of 2026-08-26 | 2026-08-26 | Low |
| Company Comparable Analysis Meta Platforms Inc .xls — tab: Business Description (44×3) | CIQ peer-comparable export | As of 2026-08-26 | 2026-08-26 | Low |
| Company Comparable Analysis Meta Platforms Inc .xls — tab: Implied Valuation (69×9) | CIQ peer-comparable export | As of 2026-08-26 | 2026-08-26 | Low (out of earnings-module scope) |
| Company Comparable Analysis Meta Platforms Inc .xls — tab: Valuation Chart (32×2) | CIQ peer-comparable export | As of 2026-08-26 | 2026-08-26 | Low |
| Company Comparable Analysis Meta Platforms Inc .xls — tab: Credit Health Panel (48×10) | CIQ peer-comparable export | LTM through 2026-06-30 | 2026-08-26 | Low |
| Company Comparable Analysis Meta Platforms Inc .xls — tab: Disclaimer (26×1) | CIQ peer-comparable export | No period stated | 2026-08-26 | Low |
| META_Short_Interest_12m_Charting Excel Export … .xls — tab: Chart 1 with Data (284×2) | Short-interest data export | 2025-08-26 to 2026-08-25 | 2026-08-26 | Low (positioning, not earnings-driver data) |
| META_Short_Interest_12m_Charting Excel Export … .xls — tab: Attributions (45×1) | Short-interest data export | No period stated | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Customers.rtf | Business-relationship export (CIQ) | Recently disclosed within prior two years; no as-of stated | 2026-08-26 | Low (business-model relevance, not earnings) |
| Meta Platforms Inc NasdaqGS META Suppliers.rtf | Business-relationship export (CIQ) | Recently disclosed within prior two years; no as-of stated | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Public Company Profile.rtf | Company profile export (CIQ) | Current profile; no as-of stated | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Public Ownership History.xls — tab: History (6,877×6) | Ownership export (CIQ) | Q3 2025–Q2 2026 | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Public Ownership Insider Trading.xls — tab: Insider Trading (16,589×11) | Insider-trading export (CIQ) | All history; latest Form 4 filed 2026-08-19 | 2026-08-26 | Low (governance/red-flag relevance, not earnings-driver) |
| Meta Platforms Inc NasdaqGS META Public Ownership Summary.rtf | Ownership summary export (CIQ) | Current snapshot; no as-of stated | 2026-08-26 | Low |

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | Meta_Platforms_Inc_-_Form_10-K(Jan-29-2026).doc | FY2025, ended 2025-12-31 | 7.9 |
| Quarterly filing | Meta_Platforms_Inc_-_Form_10-Q(Jul-30-2026).doc | Q2 2026, ended 2026-06-30 | 1.9 |
| Earnings transcript | Meta Platforms, Inc., Q2 2026 Earnings Call, Jul 29, 2026.rtf (verbatim) | Q2 2026, call 2026-07-29 | 1.0 |
| Investor deck | Earnings-Presentation-Q2-2026.pdf | Q2 2026, ended 2026-06-30 | 1.9 |
| Consensus / estimate export | MetaPlatforms,IncNasdaqGSMETAEstimatesReport.xls — Consensus / Surprise / Revisions tabs | FY2026/FY2027 estimates; revision windows through file date (~2026-08-26) | ~0.0–1.0 |
| Cash flow data | Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — Cash Flow tab (also 10-Q, Q2 press release) | Q1 2017–Q2 2026 | 1.9 (latest quarter) |
| Guidance data | MetaPlatforms,IncNasdaqGSMETAEstimatesReport.xls — Guidance tab; also Q2 2026 press release / transcript outlook remarks | Latest guidance issued 2026-07-29 for Q3 2026 revenue ($61–64bn) and FY2026 operating-income framing | 1.0 |

## 2A. Transcript Subtype & Source Tier

All three earnings-call sources in the pool are **verbatim CIQ transcripts** (S&P Global Market Intelligence "Earnings Call Transcripts"), each carrying a Call Participants list, full Presentation section, and full Question and Answer section with named sell-side analysts (Morgan Stanley, JPMorgan, Goldman Sachs, BofA, Wells Fargo, Bernstein, Barclays) — not a sell-side research note. None is a "transcript proxy." Full trust applies to numbers, drivers, and tone/candor per the Transcript Sourcing & Fallback rule.

- Q4 2025 Earnings Call, Jan 28, 2026 — verbatim, full trust.
- Q1 2026 Earnings Call, Apr 29, 2026 — verbatim, full trust.
- Q2 2026 Earnings Call, Jul 29, 2026 — verbatim, full trust.

No sell-side / analyst "Earnings Call Insight" proxy document exists in this pool — none is needed, since three verbatim transcripts are present.

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | FY25 10-K; Q2 2026 10-Q; Q1/Q2 2026 press releases; CIQ Financials_Annual/Quarterly — Income Statement tabs | Needed for revenue, margin, EPS |
| Balance sheet | Y | FY25 10-K; Q2 2026 10-Q; CIQ Financials_Annual/Quarterly — Balance Sheet tabs | Needed for working capital and leverage |
| Cash flow statement | Y | FY25 10-K; Q2 2026 10-Q; CIQ Financials_Annual/Quarterly — Cash Flow tabs; Credit Health Panel | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Q2 2026 10-Q (ended 2026-06-30); Q2 2026 press release; Q2 2026 transcript; Q2 2026 investor deck | Needed for trend and setup |
| Last 8 quarters | Y | CIQ Financials_Quarterly.xls — Income Statement / Balance Sheet / Cash Flow / Segments tabs, Q1 2017–Q2 2026 (38+ quarters) | Needed for seasonality and inflection |
| Consensus estimates | Y | MetaPlatforms EstimatesReport.xls — Consensus tab (target price $754.84 mean, EPS/revenue estimates FY2026/FY2027) | Needed for market bar |
| Estimate revisions | Y | MetaPlatforms EstimatesReport.xls — Revisions tab (upward/downward counts, last 1/2/3 months) and Recent Changes tab | Needed for revision momentum |
| Earnings transcript | Y | Three verbatim CIQ transcripts: Q4 2025, Q1 2026, Q2 2026 | Needed for management tone and driver detail |
| Segment P&L | Y | Q2 2026 press release ("Segment Results" — Family of Apps / Reality Labs revenue and operating income); 10-K/10-Q segment notes; CIQ Financials — Segments tabs | Needed for mix shift |
| Current price | Y | CIQ Financials_Quarterly.xls — Key Stats tab, Share Price $570.05 (Class A/B, as of pool sync ~2026-08-26) | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y |
| 06_value-chain.md | Y |
| 10_external-dependency.md | Y |

The full business-model module (`analyses/META_2026-08-27/business-model/`) has already run and completed (00 through 99, plus dossier/memo), so segment structure, pricing-power context, and external-variable identification are all available for the earnings agents to read rather than re-derive independently.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N | 04, 05, 99 | Not applicable — Consensus, Recent Changes, Guidance, Surprise, Trends, and Revisions tabs are all present |
| No quarterly data | N | 01, 02, 03, 06 | Not applicable — 38+ quarters of CIQ quarterly financials plus the Q2 2026 10-Q are present |
| No VERBATIM transcript, sell-side proxy present | N | 02, 03, 04 | Not applicable — three verbatim CIQ transcripts are present; no proxy exists or is needed |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | Not applicable |
| No segment-level P&L | N | 02, 03, 99 | Not applicable — Family of Apps / Reality Labs P&L disclosed in filings, press releases, and CIQ Segments tabs |
| No cash flow statement | N | 06, 99 | Not applicable — full cash flow statements present at annual and quarterly frequency |
| No current price | N | 99 | Not applicable — current share price ($570.05) present in the CIQ Key Stats export |

No caps from this table bind. One softer note for downstream agents: the Consensus tab's headline overview block (target price, LT growth, recommendation mix) does not itself print an explicit "data as of" line, while the per-quarter Surprise sub-table is dated to the day before the Q2 2026 print (consensus "as of Jul-28-2026" ahead of the Jul-29-2026 release — expected, since that is the pre-earnings consensus the beat/miss was measured against). The Revisions tab's "Last Month" window (heavily downward — 45 of 58 analysts cut target price, 0 raised, in the month before the file's ~2026-08-26 sync) indicates the estimate set has been actively revised post-Q2-earnings and is current, not stale. `04_guidance-consensus` should still state the exact as-of date it reads for each headline consensus figure it cites, per the Calculation Standards' "label the source and data-as-of date" rule — this is a labelling instruction, not a data gap, and does not trigger the staleness cap.

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool contains an audited FY2025 Form 10-K (7.9 months old) and a Q2 2026 Form 10-Q (1.9 months old), a full run of verbatim CIQ earnings-call transcripts (Q4 2025, Q1 2026, Q2 2026), matching press releases and investor decks, 38+ quarters of income statement / balance sheet / cash flow / segment data, a consensus-and-guidance estimates export with revision history, and a current share price — every row of the Earnings Usability Check is Y and no Partial-Data cap binds.
- **Active partial-data caps:** None.
- **Critical missing items:** None.
