# Data Triage — DHER

## 1. File Inventory

Multi-tab workbooks were pre-extracted with `.claude/tools/extract_pool.py` (`analyses/DHER_2026-08-12/_pool_extracts/`, manifest: 3 workbooks → 28 tabs, 37 extract files, 0 failures). Every workbook tab is listed as its own row below, reconciled against `_pool_extracts/manifest.md`.

| Filename | Type | Period Covered | Last Modified (file sync date — not authoritative, see below) | Notes |
|---|---|---|---|---|
| Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf | Annual filing (Annual Report incl. Combined Management Report + audited IFRS consolidated financials) | FY2024 (year ended Dec-31-2024); published Apr 25, 2025 | Aug 10, 2025 (sync date) | Period/publish date parsed from inside the document (cover page "Annual Report 2024"). Prime Standard, Frankfurt Stock Exchange, IFRS as adopted by EU. |
| Delivery_Hero_SE_-_Form_Annual_Report(Apr-25-2025).pdf | Annual filing — duplicate | Same as above | Aug 10, 2025 (sync date) | Byte-identical to the file above (MD5 `de5039425dc3dea73de9b698daf100f1`) — same document under a second filename, not a second source. Counted once for sufficiency. |
| Delivery Hero SE, 2025 Earnings Call, Mar 26, 2026.pdf | Earnings transcript (FY2025 full-year results call) | FY2025 actuals (revenue €14,059.6m vs. consensus €14,212.8m, EPS normalized €(1.32)); call held Mar 26, 2026 | Aug 10, 2025 (sync date) | S&P Capital IQ transcript. Reports FY2025 actual results ahead of any FY2025 audited annual report being present in this pool. |
| Delivery Hero SE, Q1 2026 Sales_ Trading Statement Call, Apr 30, 2026.pdf | Quarterly-equivalent transcript (trading/sales statement call) | Q1 2026; call held Apr 30, 2026 | Aug 10, 2025 (sync date) | Closest surrogate in the pool for a Q1 2026 quarterly filing; no interim financial-statement filing (Zwischenmitteilung/Quartalsmitteilung) itself is present. |
| Uber Technologies, Inc., Delivery Hero SE - M&A Call.pdf | Deal / M&A transcript | Call held Jul 16, 2026, covering Uber's announced acquisition offer for Delivery Hero | Aug 10, 2025 (sync date) | Most recent document in the pool by call date. Material event: Uber CEO Dara Khosrowshahi and CFO Balaji Krishnamurthy discuss the announced acquisition of Delivery Hero. Downstream agents should treat this as a live M&A situation, not a steady-state standalone thesis. |
| Delivery Hero SE XTRA DHER Analyst Coverage.rtf | Data export (sell-side coverage list) | Undated snapshot (no as-of date printed in-document; contains live target prices/ratings, e.g. Morningstar €36.00, mwb research €41.50 Sell) | Aug 10, 2025 (sync date) | 21 contributors listed; most "Not Entitled" (no visible target/rating in this export). |
| Delivery Hero SE XTRA DHER Competitors.rtf | Data export (competitor list) | Undated snapshot | Aug 10, 2025 (sync date) | 58.8k chars — large competitor/peer dataset. |
| Delivery Hero SE XTRA DHER Customers.rtf | Data export (customer relationships) | Undated snapshot | Aug 8, 2025 (sync date) | — |
| Delivery Hero SE XTRA DHER Fixed Income Securities Summary.rtf | Data export (debt securities) | Undated snapshot | Aug 10, 2025 (sync date) | Relevant to balance-sheet-survival module; noted here for completeness. |
| Company Comparable Analysis Delivery Hero SE.xls — Financial Data | Data export (workbook tab) | Multi-year financials, USD | As-Of Date: 2026-08-10 (stated inside workbook) | 50×17 |
| Company Comparable Analysis Delivery Hero SE.xls — Trading Multiples | Data export (workbook tab) | As of 2026-08-10 | same | 50×9 |
| Company Comparable Analysis Delivery Hero SE.xls — Operating Statistics | Data export (workbook tab) | As of 2026-08-10 | same | 50×13 |
| Company Comparable Analysis Delivery Hero SE.xls — Business Description | Data export (workbook tab) | As of 2026-08-10 | same | 44×3 |
| Company Comparable Analysis Delivery Hero SE.xls — Implied Valuation | Data export (workbook tab) | As of 2026-08-10 | same | 69×9 |
| Company Comparable Analysis Delivery Hero SE.xls — Valuation Chart | Data export (workbook tab) | As of 2026-08-10 | same | 32×2 |
| Company Comparable Analysis Delivery Hero SE.xls — Credit Health Panel | Data export (workbook tab) | As of 2026-08-10 | same | 48×10 |
| Company Comparable Analysis Delivery Hero SE.xls — Disclaimer | Data export (workbook tab) | n/a | same | 26×1 |
| Delivery Hero SE XTRA DHER Financials.xls — Key Stats | Data export (workbook tab) | Annual, Dec-31-2021A → Dec-31-2027E, EUR (trading currency) | Aug 10, 2025 (sync date) | 90×9 |
| Delivery Hero SE XTRA DHER Financials.xls — Income Statement | Data export (workbook tab) | Annual, Dec-31-2020 (Restated) → most recent actual (FY2025A per Key Stats tab), EUR | same | 112×7 |
| Delivery Hero SE XTRA DHER Financials.xls — Balance Sheet | Data export (workbook tab) | Annual, Dec-31-2020 (Restated) → Dec-31-2025, EUR | same | 98×7 |
| Delivery Hero SE XTRA DHER Financials.xls — Cash Flow | Data export (workbook tab) | Annual, EUR | same | 76×7 |
| Delivery Hero SE XTRA DHER Financials.xls — Multiples | Data export (workbook tab) | — | same | 90×8 |
| Delivery Hero SE XTRA DHER Financials.xls — Historical Capitalization | Data export (workbook tab) | EUR | same | 39×7 |
| Delivery Hero SE XTRA DHER Financials.xls — Capital Structure Summary | Data export (workbook tab) | EUR | same | 99×7 |
| Delivery Hero SE XTRA DHER Financials.xls — Capital Structure Details | Data export (workbook tab) | EUR | same | 43×10 |
| Delivery Hero SE XTRA DHER Financials.xls — Ratios | Data export (workbook tab) | — | same | 161×7 |
| Delivery Hero SE XTRA DHER Financials.xls — Supplemental | Data export (workbook tab) | EUR | same | 59×7 |
| Delivery Hero SE XTRA DHER Financials.xls — Industry Specific | Data export (workbook tab) | EUR | same | 15×6 |
| Delivery Hero SE XTRA DHER Financials.xls — Pension OPEB | Data export (workbook tab) | EUR | same | 110×7 |
| Delivery Hero SE XTRA DHER Financials.xls — Segments | Data export (workbook tab) | Annual, restated series, EUR | same | 64×7 — segment-level GMV/revenue/Adj. EBITDA by region (Asia, MENA, Europe, Americas, Integrated Verticals) |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Consensus | Data export (workbook tab) | Consolidated, IFRS, reported currency (Today's Spot Rate conversion) | Aug 10, 2025 (sync date) | 534×31 |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Recent Changes | Data export (workbook tab) | — | same | 265×10 |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Guidance | Data export (workbook tab) | — | same | 55×13 |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Multiples | Data export (workbook tab) | Current Fiscal Year End: Dec-31-2026 | same | 26×7 |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Surprise | Data export (workbook tab) | — | same | 262×28 |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Trends | Data export (workbook tab) | — | same | 411×16 |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Revisions | Data export (workbook tab) | — | same | 625×16 |

Note on "Last Modified": these are Drive-sync timestamps (Aug 8–10, 2025), not document dates. Per fix F23, actual document currency is taken from dates printed inside each document (cover pages, "As-Of Date" fields, transcript headers) — several of these documents (the Q1 2026 call, the M&A call, and the Comparable Analysis "As-Of Date: 2026-08-10") post-date the sync timestamp, confirming the sync date is not a reliable freshness signal here and must not be used for the sufficiency read.

No `ciq_facts.json` sidecar exists at `analyses/DHER_2026-08-12/_pool_extracts/ciq_facts.json` — headline figures below are the agent's own sourced read of the workbooks/filings.

No `data/DHER/external/` directory exists — no externally sourced research (alt-data, expert calls, broker notes) is in this pool.

## 1A. External Data

Not applicable — no `data/DHER/external/` folder present in this pool.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months, from date inside document to 2026-08-12) |
|---|---|---|---|
| Annual filing | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf | FY2024 (year ended Dec-31-2024); published Apr 25, 2025 | ~15.6 months from publish date (~19.4 months from period end — the audited FY2024 numbers themselves are that old; no FY2025 audited annual report is present in the pool) |
| Quarterly filing | None present | — | Not in pool — closest surrogate is the Q1 2026 trading-statement call transcript below |
| Earnings transcript | Delivery Hero SE, Q1 2026 Sales/Trading Statement Call, Apr 30, 2026.pdf | Q1 2026 | ~3.4 months |
| Earnings transcript (secondary, full-year) | Delivery Hero SE, 2025 Earnings Call, Mar 26, 2026.pdf | FY2025 actuals | ~4.6 months |
| Deal / M&A transcript (most recent document overall) | Uber Technologies, Inc., Delivery Hero SE - M&A Call.pdf | Jul 16, 2026 | ~0.9 months |
| Investor deck | None present | — | Not in pool |
| Data export | Company Comparable Analysis Delivery Hero SE.xls (all tabs) | As-Of Date 2026-08-10 | ~0.1 months |

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | Germany | Annual Report: "Prime Standard segment of the Frankfurt Stock Exchange" [FY24 Annual Report, p.~1439-line region of Corporate Governance section]; ticker XTRA:DHER (Deutsche Börse Xetra) confirmed across all Capital IQ exports |
| Filing regime | Other (EU / Germany — SE, Societas Europaea, regulated by BaFin) — not US SEC, not India SEBI | Local-equivalent documents in the pool: Annual Report (Geschäftsbericht-equivalent, combined Board's/Management Report + audited consolidated financial statements + Independent Auditor's Report + Supervisory Board report), sales/trading-statement call standing in for interim disclosure |
| Reporting standard | IFRS (as adopted by the EU), consolidated | Annual Report text: "...International Financial Reporting Standards (IFRS) as adopted by the [EU]..." [FY24 Annual Report]; Capital IQ Estimates workbook header: "Acctg. Standard: IFRS" [DeliveryHeroSEXTRADHEREstimatesReport.xls, Consensus tab] |
| Reporting currency + fiscal-year end | EUR; fiscal year ends Dec-31 | Annual Report "EUR million" tables (GMV, Segment Revenue, Adj. EBITDA) [FY24 Annual Report, "At a Glance" / "Key Figures"]; CIQ Financials workbook "Currency: Reported Currency ... EUR" [Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab] |
| Document language(s) | English (Annual Report, transcripts, all Capital IQ exports are in English — no non-English-language documents encountered in this pool; language is not a data gap per CLAUDE.md §27 regardless) | Direct read of all extracted files |

Downstream agents should read the Annual Report as the Tier-1 audited source (§4) for FY2024, treat the FY2025/Q1 2026 figures from the earnings-call transcripts as Tier-6 (transcript) until/unless an audited FY2025 filing is located, and flag the July 2026 Uber M&A call as a live, unresolved corporate-action overlay on any standalone business-model or valuation read.

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has one audited annual filing published 15.6 months ago (Apr 25, 2025, covering FY2024 — inside the 18-month window) AND multiple transcripts inside the last 6 months (Q1 2026 trading-statement call, 3.4 months old; the Jul 16, 2026 Uber M&A call, 0.9 months old), so both legs of the sufficiency rule are met.
- **Critical missing items (do not block the verdict, but downstream agents should account for them):**
  - No audited FY2025 annual report is present — the only FY2025 numbers in the pool come from an earnings-call transcript (Tier 6) and Capital IQ workbook exports (Tier 5), not an audited filing. The FY2024 Annual Report is the most recent Tier-1 source and its numbers are ~19.4 months stale relative to today.
  - No standalone quarterly/interim financial-statement filing is present (only a "Sales/Trading Statement Call" transcript for Q1 2026) — treat any Q1 2026 figures as transcript-sourced, not filing-sourced.
  - No investor presentation/deck is present in the pool.
  - The pool contains no `external/` documents and no `ciq_facts.json` sidecar.
  - The Jul 16, 2026 Uber acquisition-offer call means DHER is currently the subject of an announced M&A transaction — downstream modules (especially valuation, catalysts, and capital-allocation-governance) must treat this as a live deal situation, not a steady-state standalone company, and should flag it rather than analyze DHER as if no offer were outstanding.
