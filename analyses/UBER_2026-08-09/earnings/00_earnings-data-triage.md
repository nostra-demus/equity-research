# Earnings Data Triage — UBER

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | Delaware incorporation; principal office San Francisco, CA [FY25 10-K, cover page] |
| Exchange | New York Stock Exchange (NYSE: UBER) | [FY25 10-K, cover page; Q2 FY26 10-Q, cover page] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | 10-K / 10-Q filed under Section 13/15(d) of the Securities Exchange Act of 1934, Commission File No. 001-38902 [FY25 10-K, cover page] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | "in conformity with accounting principles generally accepted in the United States of America" [FY25 10-K, auditor's report]; CIQ Consensus tab header confirms "Acctg. Standard: US GAAP" [UberTechnologies,IncNYSEUBEREstimatesReport.xls, Consensus tab] |
| Reporting currency | USD | Consolidated financial statements stated in USD [FY25 10-K; Q2 FY26 10-Q] |
| Fiscal-year end | December 31 | "For the fiscal year ended December 31, 2025" [FY25 10-K, cover page] |
| Document language(s) | English (all documents) | All filings, transcripts, and CIQ exports in the pool are in English — no non-English documents present |

No jurisdiction mismatch. Uber is a Delaware-incorporated, NYSE-listed US filer, so US SEC forms (10-K, 10-Q) are the correct primary source and are all present in the pool.

## 1. File Inventory

Multi-tab workbooks were pre-extracted via `extract_pool.py` (fresh, no rebuild needed — 51 tabs across 7 workbooks, 65 extracts). All 21 sources report `status: ok` in `_pool_extracts/manifest.json` — no extraction failures, fallback-text, or missing-dependency states. Every tab is listed below as its own row.

| Filename (parent) / Tab | Type | Period Covered | Last Modified (Drive sync date — not authoritative; see period column) | Earnings Relevance |
|---|---|---|---|---|
| Uber_Technologies_Inc_-_Form_10-K(Feb-13-2026).doc | Annual filing (10-K) | FY ended Dec-31-2025 | Aug 8 21:42 (sync date) | High |
| Uber_Technologies_Inc_-_Form_10-Q(May-06-2026).doc | Quarterly filing (10-Q) | Quarter ended Mar-31-2026 (Q1 FY26) | Aug 8 21:42 (sync date) | High |
| Uber_Technologies_Inc_-_Form_10-Q(Aug-05-2026).doc | Quarterly filing (10-Q) | Quarter ended Jun-30-2026 (Q2 FY26) | Aug 8 21:42 (sync date) | High |
| Uber Technologies, Inc., Q1 2026 Earnings Call, May 06, 2026.rtf | Verbatim transcript | FQ1 2026 (call date May-06-2026) | Aug 7 00:23 (sync date) | High |
| Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.rtf | Verbatim transcript | FQ2 2026 (call date Aug-05-2026) | Aug 7 00:23 (sync date) | High |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls → Income Statement | Data export (annual financials) | FY2018–FY2025 | Aug 7 00:24 (sync date) | High |
| …→ Balance Sheet | Data export | FY2018–FY2025 | " | High |
| …→ Cash Flow | Data export | FY2018–FY2025 | " | High |
| …→ Segments | Data export (segment P&L) | FY2018–FY2025 (Segment Adjusted EBITDA basis) | " | High |
| …→ Ratios | Data export | FY2018–FY2025 | " | Medium |
| …→ Key Stats | Data export | FY2018–FY2025 | " | Medium |
| …→ Multiples | Data export | FY2018–FY2025 | " | Low |
| …→ Capital Structure Summary | Data export | FY2018–FY2025 | " | Medium |
| …→ Capital Structure Details | Data export | FY2018–FY2025 | " | Low |
| …→ Historical Capitalization | Data export | FY2018–FY2025 | " | Low |
| …→ Supplemental | Data export | FY2018–FY2025 | " | Low |
| …→ Industry-Specific | Data export | FY2018–FY2025 | " | Low |
| …→ Pension-OPEB | Data export | FY2018–FY2025 | " | Low |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Income Statement | Data export (quarterly financials) | Q1 2018–Q2 2026 (Jun-30-2026), incl. a "Press Release" flagged Q2 2026 column | Aug 7 00:26 (sync date) | High |
| …→ Balance Sheet | Data export | Q1 2018–Q2 2026 | " | High |
| …→ Cash Flow | Data export | Q1 2018–Q2 2026 | " | High |
| …→ Segments | Data export (segment P&L) | Q1 2018–Q2 2026 | " | High |
| …→ Ratios | Data export | Q1 2018–Q2 2026 | " | Medium |
| …→ Key Stats | Data export | Q1 2018–Q2 2026 | " | Medium |
| …→ Multiples | Data export | Q1 2018–Q2 2026 | " | Low |
| …→ Capital Structure Summary | Data export | Q1 2018–Q2 2026 | " | Medium |
| …→ Capital Structure Details | Data export | Q1 2018–Q2 2026 | " | Low |
| …→ Historical Capitalization | Data export | Q1 2018–Q2 2026 | " | Low |
| …→ Supplemental | Data export | Q1 2018–Q2 2026 | " | Low |
| …→ Industry-Specific | Data export | Q1 2018–Q2 2026 | " | Low |
| …→ Pension-OPEB | Data export | Q1 2018–Q2 2026 | " | Low |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls → Consensus | Consensus/estimate export | Consensus as of Aug-05-2026 10:04 AM GMT | Aug 6 20:23 (sync date) | High |
| …→ Guidance | Guidance data | Guidance dates through FQ3 2026 (Aug-05-2026 guidance date) | " | High |
| …→ Recent Changes | Estimate revision data | Through Aug-2026 | " | High |
| …→ Revisions | Estimate revision data | Through Aug-2026 | " | High |
| …→ Surprise | Earnings surprise history | Through FQ2 2026 actual (reported Aug-05-2026) | " | High |
| …→ Trends | Estimate trend data | Through Aug-2026 | " | Medium |
| …→ Multiples | Consensus multiples | As of Aug-05-2026 | " | Low |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls → [same 7 tabs] | Consensus/estimate export (duplicate) | Same content as above — byte-identical extract text (only the internal "SOURCE:" filename tag differs); confirmed via diff of extracted tabs | Aug 8 21:40 (sync date) | Duplicate of above — treated as one source, not double-counted |
| Company Comparable Analysis Uber Technologies Inc.xls → Financial Data | Data export (comps) | LTM as of Jun-30-2026 | Aug 6 20:24 (sync date) | Medium |
| …→ Trading Multiples | Data export (comps) | As of pricing date | " | Low |
| …→ Operating Statistics | Data export (comps) | LTM as of Jun-30-2026 | " | Low |
| …→ Business Description | Data export | Current | " | Low |
| …→ Implied Valuation | Data export (comps-implied valuation) | Current | " | Low |
| …→ Valuation Chart | Data export | Current | " | Low |
| …→ Credit Health Panel | Data export (credit metrics) | Current | " | Medium |
| …→ Disclaimer | Boilerplate | n/a | " | Low |
| Short Iinterest_12m_Uber.xls → Chart 1 with Data | Data export (short interest) | Trailing 12 months to Aug-2026 | Aug 8 22:00 (sync date) | Low |
| …→ Attributions | Boilerplate | n/a | " | Low |
| Uber Technologies Inc NYSE UBER Events Calendar.xls → Events Calendar | Data export (calendar) | 2026 (through Nov-03-2026 est. earnings date) | Aug 8 21:43 (sync date) | Medium |
| UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | Data export (company profile) | Current, market cap/price as of Aug-05-2026 | Aug 6 20:28 (sync date) | Medium |
| Uber Technologies Inc NYSE UBER Public Company Profile.rtf | Data export (company profile) | Current, TEV/market cap price as of Aug-05-2026 | Aug 8 22:00 (sync date) | Low |
| Uber Technologies Inc NYSE UBER Analyst Coverage.rtf | Data export (sell-side coverage list) | Current | Aug 6 20:27 (sync date) | Low |
| Uber Technologies Inc NYSE UBER Board Members.rtf | Data export (governance) | Current | Aug 6 20:32 (sync date) | Low (out of earnings scope) |
| Uber Technologies Inc NYSE UBER Customers.rtf | Data export | Current | Aug 7 00:25 (sync date) | Low |
| Uber Technologies Inc NYSE UBER Products.rtf | Data export | Current | Aug 6 20:27 (sync date) | Low |
| Uber Technologies Inc NYSE UBER Professionals.rtf | Data export (management roster) | Current | Aug 6 20:32 (sync date) | Low |
| Uber Technologies Inc NYSE UBER Suppliers.rtf | Data export | Current | Aug 7 00:25 (sync date) | Low |
| Uber Technologies Inc NYSE UBER Key Developments.rtf | User/vendor note (news log) | Rolling news log through Aug-2026 | Aug 7 00:25 (sync date) | Medium |

No external data (`data/UBER/external/`) is present in this pool — Section 1A is omitted.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months, vs 2026-08-09) |
|---|---|---|---|
| Annual filing | Uber_Technologies_Inc_-_Form_10-K(Feb-13-2026).doc | FY ended Dec-31-2025 | ~7.2 months since period end; filed Feb-13-2026 (~5.9 months ago) |
| Quarterly filing | Uber_Technologies_Inc_-_Form_10-Q(Aug-05-2026).doc | Quarter ended Jun-30-2026 (Q2 FY26) | ~1.3 months since period end; filed Aug-05-2026 (4 days ago) |
| Earnings transcript | Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.rtf | FQ2 2026 call, Aug-05-2026 | 4 days |
| Investor deck | Not present in pool | — | — |
| Consensus / estimate export | UberTechnologies,IncNYSEUBEREstimatesReport.xls → Consensus | Consensus as of Aug-05-2026 10:04 AM GMT | 4 days |
| Cash flow data | Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Cash Flow | Through Q2 2026 (Jun-30-2026) | ~1.3 months |
| Guidance data | UberTechnologies,IncNYSEUBEREstimatesReport.xls → Guidance | FQ3 2026 guidance issued Aug-05-2026 (EPS Normalized 0.84–0.88) | 4 days |

No standalone investor deck is present in the data pool (confirmed also by business-model `00_data-triage.md` and `03_segment-map.md §3`). This is a gap for management-facing visual/strategic framing, but not a blocker: the verbatim transcripts and filings substitute for driver detail.

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | FY25 10-K; Q2 FY26 10-Q; CIQ Financials_Quarterly.xls → Income Statement (Q1 2018–Q2 2026) | Needed for revenue, margin, EPS |
| Balance sheet | Y | FY25 10-K; Q2 FY26 10-Q; CIQ Financials_Quarterly.xls → Balance Sheet | Needed for working capital and leverage |
| Cash flow statement | Y | FY25 10-K; Q2 FY26 10-Q; CIQ Financials_Quarterly.xls → Cash Flow (Q1 2018–Q2 2026) | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Q2 FY26 10-Q (period ended Jun-30-2026, filed Aug-05-2026); Q2 FY26 earnings call same day | Needed for trend and setup |
| Last 8 quarters | Y | CIQ Financials_Quarterly.xls (Income Statement/Balance Sheet/Cash Flow/Segments back to Q1 2018 — far more than 8 quarters) | Needed for seasonality and inflection |
| Consensus estimates | Y | CIQ Estimates Report → Consensus tab, as of Aug-05-2026 (same day as latest 10-Q) | Needed for market bar |
| Estimate revisions | Y | CIQ Estimates Report → Recent Changes and Revisions tabs | Needed for revision momentum |
| Earnings transcript | Y | Q1 FY26 (May-06-2026) and Q2 FY26 (Aug-05-2026) verbatim CIQ call transcripts, both with Call Participants / Presentation / Q&A sections | Needed for management tone and driver detail |
| Segment P&L | Y | FY25 10-K Note 13; CIQ Financials_Quarterly.xls / Financials_Annual.xls → Segments tabs (Mobility / Delivery / Freight, both revenue and profit); note the profit metric changed from Segment Adjusted EBITDA to Segment Operating Income effective Q1 FY26 (Q2 FY26 10-Q, Note 10) — a measurement-basis break flagged for downstream agents | Needed for mix shift |
| Current price | Y | UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf and Public Company Profile.rtf — "TEV and Market Cap are calculated using a close price as of Aug-05-2026" | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y — present at `analyses/UBER_2026-08-09/business-model/03_segment-map.md`; provides FY25 and H1 FY26 segment revenue/profit splits (Mobility/Delivery/Freight) with the Segment Adjusted EBITDA → Segment Operating Income basis-change flag already documented |
| 06_value-chain.md | Y — present at `analyses/UBER_2026-08-09/business-model/06_value-chain.md` |
| 10_external-dependency.md | Y — present at `analyses/UBER_2026-08-09/business-model/10_external-dependency.md` |

The full business-model module (00 through 99, including the synthesis and dossier) has already run and is available for the earnings module to read.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus is present and fresh (as of Aug-05-2026, same day as the latest 10-Q) | 04, 05, 99 | Not applied |
| No quarterly data | N — quarterly data runs Q1 2018 through Q2 2026 | 01, 02, 03, 06 | Not applied |
| No VERBATIM transcript, sell-side proxy present | N — Q1 FY26 and Q2 FY26 are both verbatim CIQ call transcripts (Call Participants / Presentation / Q&A), not sell-side proxies | 02, 03, 04 | Not applied |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | Not applied |
| No segment-level P&L | N — segment revenue and profit are disclosed (10-K Note 13; CIQ Segments tabs); note the FY25 Segment Adjusted EBITDA figures are NOT directly comparable to the FY26 Segment Operating Income figures without re-basing — flag for `02`/`03`, not a data-absence cap | 02, 03, 99 | Not applied (a methodology-break flag, not a missing-data cap) |
| No cash flow statement | N — cash flow statement present in filings and CIQ export back to Q1 2018 | 06, 99 | Not applied |
| No current price | N — close price as of Aug-05-2026 present in CIQ company-profile exports | 99 | Not applied |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has the latest annual filing (FY25 10-K, filed Feb-13-2026), the latest quarterly filing (Q2 FY26 10-Q, period ended Jun-30-2026, filed Aug-05-2026), a verbatim earnings-call transcript for the same quarter (Aug-05-2026), and complete income statement / balance sheet / cash flow / segment data back to 2018 — all extraction statuses are `ok` with none of the six partial-data flags triggered.
- **Active partial-data caps:** None.
- **Critical missing items:** None. Only a minor, non-blocking gap: no standalone investor deck is present in the pool (management commentary is instead sourced from the verbatim transcripts and filings, which fill that role at a higher trust tier per the module's source hierarchy). Downstream agents should also note the FY26 segment-profit-metric change (Segment Adjusted EBITDA → Segment Operating Income, effective Q1 FY26) when building any FY25-vs-FY26 segment margin bridge — it is a measurement-basis break, not a data gap, and re-basing is required before comparing across the two periods.
