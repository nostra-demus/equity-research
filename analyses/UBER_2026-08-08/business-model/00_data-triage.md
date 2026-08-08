# Data Triage — UBER

## 1. File Inventory

Note on process: `.claude/tools/extract_pool.py` was run against `data/UBER/` (output confirmed already fresh at `analyses/UBER_2026-08-08/_pool_extracts/`) before this inventory was built, per the pre-extraction step required for multi-tab workbooks. Manifest totals: 7 workbooks → 51 tabs; 65 extract files; 0 failures (`_pool_extracts/manifest.json`, `manifest.md`). No source is in a `fail`/`fallback-text`/`missing-dependency` state — nothing is treated as missing due to extraction failure. No `ciq_facts.json` sidecar exists in `_pool_extracts/`, so all figures below are the author's own sourced read, not a pinned deterministic parse.

Period covered is taken from text INSIDE each document (fix F23), not file "Last Modified" — the pool was Drive-synced on 2026-08-06/07/08, so modified dates cluster in the last two days regardless of the underlying document's actual vintage. All filings and both earnings calls are dated 2026, so in this pool the two happen to be close, but the rule below still applies document-by-document.

| Filename | Type | Period Covered | Last Modified | Notes |
|---|---|---|---|---|
| Uber_Technologies_Inc_-_Form_10-K(Feb-13-2026).doc | Annual filing (10-K) | FY ended Dec 31, 2025 (filed Feb 13, 2026) | 2026-08-08 (sync date) | Audited; 3-year comparatives (FY23–FY25). PwC opinion covers FY25 balance sheet + ICFR. |
| Uber_Technologies_Inc_-_Form_10-Q(May-06-2026).doc | Quarterly filing (10-Q) | Three months ended Mar 31, 2026 (Q1 FY26) | 2026-08-08 (sync date) | Filed May 6, 2026. |
| Uber_Technologies_Inc_-_Form_10-Q(Aug-05-2026).doc | Quarterly filing (10-Q) | Three months ended Jun 30, 2026 (Q2 FY26) | 2026-08-08 (sync date) | Filed Aug 5, 2026 — most recent quarterly filing, 3 days before this triage date. |
| Uber Technologies, Inc., Q1 2026 Earnings Call, May 06, 2026.rtf | Earnings transcript | Q1 FY26 (call held May 6, 2026) | 2026-08-07 (sync date) | Prepared remarks + Q&A. |
| Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.rtf | Earnings transcript | Q2 FY26 (call held Aug 5, 2026) | 2026-08-07 (sync date) | Most recent transcript — 3 days before this triage date. |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Key Stats | Data export (Capital IQ) | Multi-year annual history | 2026-08-07 (sync date) | Tab of 12-tab workbook. |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Income Statement | Data export (Capital IQ) | Multi-year annual history | 2026-08-07 (sync date) | 120×12 |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Balance Sheet | Data export (Capital IQ) | Multi-year annual history | 2026-08-07 (sync date) | 103×12 |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Cash Flow | Data export (Capital IQ) | Multi-year annual history | 2026-08-07 (sync date) | 80×12 |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Multiples | Data export (Capital IQ) | Multi-year annual history | 2026-08-07 (sync date) | 91×32 |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Historical Capitalization | Data export (Capital IQ) | Multi-year annual history | 2026-08-07 (sync date) | 39×32 |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Capital Structure Summary | Data export (Capital IQ) | Multi-year annual history | 2026-08-07 (sync date) | 114×23 |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Capital Structure Details | Data export (Capital IQ) | Multi-year annual history | 2026-08-07 (sync date) | 46×10 |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Ratios | Data export (Capital IQ) | Multi-year annual history | 2026-08-07 (sync date) | 161×12 |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Supplemental | Data export (Capital IQ) | Multi-year annual history | 2026-08-07 (sync date) | 78×11 |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Industry Specific | Data export (Capital IQ) | Multi-year annual history | 2026-08-07 (sync date) | 15×6 |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Pension OPEB | Data export (Capital IQ) | Multi-year annual history | 2026-08-07 (sync date) | 15×6, N/A — Uber has no pension/OPEB plan |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls — Segments | Data export (Capital IQ) | Multi-year annual history — Mobility / Delivery / Freight | 2026-08-07 (sync date) | 63×11; matches 10-K's 3-segment structure |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Key Stats | Data export (Capital IQ) | Multi-quarter history | 2026-08-07 (sync date) | Tab of 11-tab workbook |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Income Statement | Data export (Capital IQ) | Multi-quarter history | 2026-08-07 (sync date) | 117×35 |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Balance Sheet | Data export (Capital IQ) | Multi-quarter history | 2026-08-07 (sync date) | 101×35 |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Cash Flow | Data export (Capital IQ) | Multi-quarter history | 2026-08-07 (sync date) | 77×35 |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Multiples | Data export (Capital IQ) | Multi-quarter history | 2026-08-07 (sync date) | 91×32 |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Historical Capitalization | Data export (Capital IQ) | Multi-quarter history | 2026-08-07 (sync date) | 39×32 |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Capital Structure Summary | Data export (Capital IQ) | Multi-quarter history | 2026-08-07 (sync date) | 84×67 |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Capital Structure Details | Data export (Capital IQ) | Multi-quarter history | 2026-08-07 (sync date) | 46×10 |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Ratios | Data export (Capital IQ) | Multi-quarter history | 2026-08-07 (sync date) | 161×35 |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Supplemental | Data export (Capital IQ) | Multi-quarter history | 2026-08-07 (sync date) | 55×35 |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Industry Specific | Data export (Capital IQ) | Multi-quarter history | 2026-08-07 (sync date) | 15×6 |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Pension OPEB | Data export (Capital IQ) | Multi-quarter history | 2026-08-07 (sync date) | 15×6, N/A |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls — Segments | Data export (Capital IQ) | Multi-quarter, Mobility/Delivery/Freight | 2026-08-07 (sync date) | 70×35 |
| Company Comparable Analysis Uber Technologies Inc.xls — Financial Data | Data export (Capital IQ comps) | Peer comp set, latest available quarter/FY | 2026-08-06 (sync date) | 50×17 |
| Company Comparable Analysis Uber Technologies Inc.xls — Trading Multiples | Data export (Capital IQ comps) | Peer comp set | 2026-08-06 (sync date) | 50×9 |
| Company Comparable Analysis Uber Technologies Inc.xls — Operating Statistics | Data export (Capital IQ comps) | Peer comp set | 2026-08-06 (sync date) | 50×13 |
| Company Comparable Analysis Uber Technologies Inc.xls — Business Description | Data export (Capital IQ comps) | Static company description | 2026-08-06 (sync date) | 44×3 |
| Company Comparable Analysis Uber Technologies Inc.xls — Implied Valuation | Data export (Capital IQ comps) | Peer comp set | 2026-08-06 (sync date) | 69×9 |
| Company Comparable Analysis Uber Technologies Inc.xls — Valuation Chart | Data export (Capital IQ comps) | Peer comp set | 2026-08-06 (sync date) | 32×2 |
| Company Comparable Analysis Uber Technologies Inc.xls — Credit Health Panel | Data export (Capital IQ comps) | Peer comp set | 2026-08-06 (sync date) | 47×10 |
| Company Comparable Analysis Uber Technologies Inc.xls — Disclaimer | Data export (Capital IQ comps) | n/a | 2026-08-06 (sync date) | 26×1, boilerplate |
| Short Iinterest_12m_Uber.xls — Chart 1 with Data | Data export (Capital IQ) | Trailing 12 months of short-interest data | 2026-08-08 (sync date) | 284×2 |
| Short Iinterest_12m_Uber.xls — Attributions | Data export (Capital IQ) | n/a | 2026-08-08 (sync date) | 45×1, boilerplate |
| Uber Technologies Inc NYSE UBER Events Calendar.xls — Events Calendar | Data export (Capital IQ) | Forward events calendar | 2026-08-08 (sync date) | 36×3 |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Consensus | Data export (Capital IQ estimates) | Forward consensus estimates, as of export date | 2026-08-06 (sync date) | 447×41 |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Recent Changes | Data export (Capital IQ estimates) | Recent estimate revisions | 2026-08-06 (sync date) | 265×10 |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Guidance | Data export (Capital IQ estimates) | Management guidance history | 2026-08-06 (sync date) | 109×29 |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Multiples | Data export (Capital IQ estimates) | Forward multiples | 2026-08-06 (sync date) | 26×7 |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Surprise | Data export (Capital IQ estimates) | Earnings-surprise history | 2026-08-06 (sync date) | 211×31 |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Trends | Data export (Capital IQ estimates) | Estimate trend history | 2026-08-06 (sync date) | 303×21 |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Revisions | Data export (Capital IQ estimates) | Estimate revision history | 2026-08-06 (sync date) | 467×21 |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — [all 7 tabs] | Data export (Capital IQ estimates) | Identical to the above workbook (diff confirmed byte-identical except internal source filename header) | 2026-08-08 (sync date) | Duplicate export of the same file, re-synced 2 days later — not a distinct source |
| UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | Data export (Capital IQ, combined report) | Snapshot as of export | 2026-08-06 (sync date) | Landscape-format combined CIQ summary report |
| Uber Technologies Inc NYSE UBER Public Company Profile.rtf | Data export (Capital IQ) | Snapshot as of export | 2026-08-08 (sync date) | Company profile/overview |
| Uber Technologies Inc NYSE UBER Analyst Coverage.rtf | Data export (Capital IQ) | Snapshot as of export | 2026-08-06 (sync date) | Sell-side coverage list |
| Uber Technologies Inc NYSE UBER Board Members.rtf | Data export (Capital IQ) | Snapshot as of export | 2026-08-06 (sync date) | Governance data |
| Uber Technologies Inc NYSE UBER Professionals.rtf | Data export (Capital IQ) | Snapshot as of export | 2026-08-06 (sync date) | Management/officer bios |
| Uber Technologies Inc NYSE UBER Customers.rtf | Data export (Capital IQ) | Snapshot as of export | 2026-08-07 (sync date) | Named customer relationships |
| Uber Technologies Inc NYSE UBER Suppliers.rtf | Data export (Capital IQ) | Snapshot as of export | 2026-08-07 (sync date) | Named supplier relationships |
| Uber Technologies Inc NYSE UBER Products.rtf | Data export (Capital IQ) | Snapshot as of export | 2026-08-06 (sync date) | Product/segment descriptions |
| Uber Technologies Inc NYSE UBER Key Developments.rtf | Data export (Capital IQ, news/events log) | Multi-year event log | 2026-08-07 (sync date) | Largest single extract (364KB) — M&A, litigation, management changes, etc. |

`data/UBER/external/` does not exist — no externally sourced research in this pool. Section 1A is omitted.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months, vs. 2026-08-08) |
|---|---|---|---|
| Annual filing | Uber_Technologies_Inc_-_Form_10-K(Feb-13-2026).doc | FY ended Dec 31, 2025 | ~7 months since FYE; ~6 months since filing |
| Quarterly filing | Uber_Technologies_Inc_-_Form_10-Q(Aug-05-2026).doc | Three months ended Jun 30, 2026 | ~1.3 months since quarter-end; 3 days since filing |
| Earnings transcript | Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.rtf | Q2 FY26 (call Aug 5, 2026) | 3 days |
| Investor deck | None in pool | — | — |
| Data export | UberTechnologies,IncNYSEUBEREstimatesReport.xls / Financials_Quarterly.xls / Financials_Annual.xls (Capital IQ) | Multi-period, exported 2026-08-06/07 | ~2 days since export |

No standalone investor-presentation deck is present in the pool. This is not disqualifying for the sufficiency rule below — the Q2 FY26 earnings transcript (3 days old) and the Q2 FY26 10-Q (3 days old) both independently satisfy the "recent quarterly/transcript" leg.

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States (NYSE: UBER) | Ticker and exchange throughout Capital IQ exports; 10-K cover page |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | Form 10-K / 10-Q filed with the SEC |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | 10-K auditor's report: "in conformity with accounting principles generally accepted in the United States of America" |
| Reporting currency + fiscal-year end | USD; fiscal year ends December 31 | 10-K: "fiscal year ended December 31, 2025"; all financial statements in $ |
| Document language(s) | English (all documents) | All filings, transcripts, and Capital IQ exports are in English — no non-English source in this pool |

Standard US filer regime — no §27 local-equivalent mapping needed.

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has an annual filing (FY25 10-K, filed Feb 13, 2026, ~6 months old) well inside 18 months, AND a quarterly filing plus an earnings transcript both dated Aug 5, 2026 — 3 days before this triage — well inside 6 months, so both legs of the sufficiency rule are independently met with wide margin.
- **Critical missing items:** None. (No investor deck is present, but the rule does not require one when a recent quarterly filing and transcript both exist; note this as a minor gap only, not a sufficiency blocker.)
