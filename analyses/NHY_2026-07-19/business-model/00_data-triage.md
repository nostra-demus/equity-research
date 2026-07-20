# Data Triage — NHY

## 1. File Inventory

Multi-tab workbooks were pre-extracted via `.claude/tools/extract_pool.py` (fresh run: 5 workbooks -> 36 tabs, 45 extract files, 0 failures — `_pool_extracts/manifest.md`, `manifest.json`). No `ciq_facts.json` sidecar is present in `_pool_extracts/`, so all Capital IQ figures below are read directly from the workbook tab extracts, not from a pinned facts file.

| Filename | Type | Period Covered | Last Modified | Notes |
|---|---|---|---|---|
| integrated-annual-report-2025.pdf | Annual filing (Norwegian statutory Annual Report, IFRS) | FY2025 (year ended 31 Dec 2025) | 2026-07-18 (Drive sync date, not filing date) | Board's Report + audited consolidated financial statements + Governance + Sustainability; period confirmed inside document (p.44/1531/1686 show FY2025/2024/2023 columns; note 8.2 references IFRS) |
| first-quarter-report-2026.pdf | Quarterly filing (SEBI-LODR-equivalent interim report under Oslo Børs continuing obligations) | Q1 2026 (ended 31 Mar 2026), approved by Board 28 Apr 2026 | 2026-07-18 | Adjusted EBITDA NOK 8,668m vs NOK 9,516m Q1 2025; states board-approval date inside document, not modified date |
| Norsk Hydro ASA, Q1 2026 Earnings Call, Apr 29, 2026.pdf | Earnings transcript | FQ1 2026 (call held 29 Apr 2026) | 2026-07-18 | S&P Capital IQ transcript; consensus as of Apr-29-2026 |
| Norsk Hydro ASA, Q4 2025 Earnings Call, Feb 13, 2026.pdf | Earnings transcript | FQ4 2025 / FY2025 (call held 13 Feb 2026) | 2026-07-18 | S&P Capital IQ transcript; consensus as of Feb-12-2026 |
| nhy-presentation-q1-2026.pdf | Investor deck | Q1 2026, presented 29 Apr 2026 by CEO Eivind Kallevik | 2026-07-18 | Companion deck to Q1 2026 report/call |
| nhy-investor-day-2025.pdf | Investor deck | Investor Day, London, 27 Nov 2025 | 2026-07-18 | Strategy-level deck, forward-looking; not a results deck |
| NorskHydroASAOBNHY_PublicCompany.pdf | Data export (Capital IQ company profile) | Trailing 12M through Mar-31-2026A, plus FY2026E/FY2027E estimates | 2026-07-18 | Key stats, segment revenue, forward multiples, top holders |
| Norsk Hydro ASA OB NHY Board Members.rtf | Data export (Capital IQ governance data) | Current as of extraction (board tenure/appointment years shown, several through 2026-2027 terms) | 2026-07-18 | Board roster, tenure, ownership |
| Norsk Hydro ASA OB NHY Customers.rtf | Data export (Capital IQ relationship data) | "Recently disclosed customers only (within the last two years)" | 2026-07-18 | Named counterparties/relationships, sourced to third-party filings |
| Company Comparable Analysis Norsk Hydro ASA.xls -- Financial Data | Data export (Capital IQ comps workbook, tab) | Multi-year financial data, comparable set | 2026-07-18 | 50x17 |
| Company Comparable Analysis Norsk Hydro ASA.xls -- Trading Multiples | Data export (tab) | Current multiples | 2026-07-18 | 50x9 |
| Company Comparable Analysis Norsk Hydro ASA.xls -- Operating Statistics | Data export (tab) | Operating stats, comparable set | 2026-07-18 | 50x13 |
| Company Comparable Analysis Norsk Hydro ASA.xls -- Business Description | Data export (tab) | n/a (descriptive) | 2026-07-18 | 44x3 |
| Company Comparable Analysis Norsk Hydro ASA.xls -- Implied Valuation | Data export (tab) | Current comps-implied valuation | 2026-07-18 | 69x9 |
| Company Comparable Analysis Norsk Hydro ASA.xls -- Valuation Chart | Data export (tab) | Current | 2026-07-18 | 32x2 |
| Company Comparable Analysis Norsk Hydro ASA.xls -- Credit Health Panel | Data export (tab) | Current credit metrics | 2026-07-18 | 48x10 |
| Company Comparable Analysis Norsk Hydro ASA.xls -- Disclaimer | Data export (tab) | n/a | 2026-07-18 | 26x1 |
| Norsk Hydro ASA OB NHY Financials.xls -- Key Stats | Data export (tab) | Multi-period key stats | 2026-07-18 | 91x9 |
| Norsk Hydro ASA OB NHY Financials.xls -- Income Statement | Data export (tab) | Multi-year income statement | 2026-07-18 | 111x7 |
| Norsk Hydro ASA OB NHY Financials.xls -- Balance Sheet | Data export (tab) | Multi-year balance sheet | 2026-07-18 | 100x7 |
| Norsk Hydro ASA OB NHY Financials.xls -- Cash Flow | Data export (tab) | Multi-year cash flow | 2026-07-18 | 76x7 |
| Norsk Hydro ASA OB NHY Financials.xls -- Multiples | Data export (tab) | Multi-year multiples | 2026-07-18 | 90x8 |
| Norsk Hydro ASA OB NHY Financials.xls -- Historical Capitalization | Data export (tab) | Historical | 2026-07-18 | 39x7 |
| Norsk Hydro ASA OB NHY Financials.xls -- Capital Structure Summary | Data export (tab) | Current/historical capital structure | 2026-07-18 | 90x7 |
| Norsk Hydro ASA OB NHY Financials.xls -- Capital Structure Details | Data export (tab) | Debt instrument detail | 2026-07-18 | 42x10 |
| Norsk Hydro ASA OB NHY Financials.xls -- Ratios | Data export (tab) | Multi-year ratios | 2026-07-18 | 161x7 |
| Norsk Hydro ASA OB NHY Financials.xls -- Supplemental | Data export (tab) | Supplemental line items | 2026-07-18 | 38x7 |
| Norsk Hydro ASA OB NHY Financials.xls -- Industry Specific | Data export (tab) | Aluminum-industry metrics | 2026-07-18 | 15x6 |
| Norsk Hydro ASA OB NHY Financials.xls -- Pension OPEB | Data export (tab) | Pension/OPEB detail | 2026-07-18 | 186x7 |
| Norsk Hydro ASA OB NHY Financials.xls -- Segments | Data export (tab) | Multi-year segment data | 2026-07-18 | 202x7 |
| Norsk Hydro ASA OB NHY Products.xls -- Products | Data export (tab) | Product/segment mix | 2026-07-18 | 69x5 |
| NorskHydroASAOBNHYEstimatesReport.xls -- Consensus | Data export (tab) | Consensus estimates | 2026-07-18 | 739x117 |
| NorskHydroASAOBNHYEstimatesReport.xls -- Recent Changes | Data export (tab) | Recent estimate revisions | 2026-07-18 | 265x10 |
| NorskHydroASAOBNHYEstimatesReport.xls -- Guidance | Data export (tab) | Management guidance history | 2026-07-18 | 52x25 |
| NorskHydroASAOBNHYEstimatesReport.xls -- Multiples | Data export (tab) | Consensus-based multiples | 2026-07-18 | 22x7 |
| NorskHydroASAOBNHYEstimatesReport.xls -- Surprise | Data export (tab) | Historical earnings surprise | 2026-07-18 | 368x106 |
| NorskHydroASAOBNHYEstimatesReport.xls -- Trends | Data export (tab) | Estimate trends | 2026-07-18 | 380x16 |
| NorskHydroASAOBNHYEstimatesReport.xls -- Revisions | Data export (tab) | Estimate revisions detail | 2026-07-18 | 565x16 |
| NorskHydroASAOBNHYEstimatesReport (1).xls -- Consensus/Recent Changes/Guidance/Multiples/Surprise/Trends/Revisions (7 tabs) | Data export (duplicate export, tab-for-tab) | Same as above | 2026-07-18 | Row/col counts identical to the non-"(1)" file — appears to be a duplicate pull of the same estimates workbook, not a separate vintage; both are listed for completeness |

## 1A. External Data

No `data/NHY/external/` directory exists in the pool. No external documents (alt-data panels, expert calls, channel checks, broker research, paid-API pulls) are present. This section is empty by inventory, not by omission.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | integrated-annual-report-2025.pdf | FY2025 (year ended 31 Dec 2025) | ~6.6 (vs 2026-07-19) |
| Quarterly filing | first-quarter-report-2026.pdf | Q1 2026 (ended 31 Mar 2026, board-approved 28 Apr 2026) | ~2.7 |
| Earnings transcript | Norsk Hydro ASA, Q1 2026 Earnings Call, Apr 29, 2026.pdf | FQ1 2026 (call 29 Apr 2026) | ~2.7 |
| Investor deck | nhy-presentation-q1-2026.pdf | Q1 2026 (presented 29 Apr 2026) | ~2.7 |
| Data export | NorskHydroASAOBNHY_PublicCompany.pdf (Capital IQ) | TTM through Mar-31-2026A, plus FY2026E/FY2027E | ~2.7 (as-of basis) |

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | Norway | "traded on the Oslo Stock Exchange (OSE) during 2025" [integrated-annual-report-2025.pdf, p.2972]; incorporated 1905 in NO [Capital IQ Public Company profile] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | Other — Norway / Oslo Børs continuing obligations (EU Transparency Directive-equivalent regime; no US SEC or India SEBI filings apply) | Company profile: "Incorporated: 1905 in NO"; board and operations addresses overwhelmingly Oslo, Norway [Board Members export] |
| Reporting standard (US GAAP / IFRS / Ind AS) | IFRS | "provided to supplement the sensitivity analysis required by IFRS, included in note 8.2 Financial instruments" [integrated-annual-report-2025.pdf, p.1752-1753] |
| Reporting currency + fiscal-year end | NOK (Norwegian krone); fiscal year ends 31 December | "Adjusted EBITDA NOK billion" and NOK-denominated tables throughout [integrated-annual-report-2025.pdf]; "Currency: NOK" [both earnings-call transcripts]; FY2025 = year ended 31 Dec per annual-report period columns |
| Document language(s) | English (all filings, decks, transcripts, and Capital IQ exports reviewed are in English; no non-English source documents were found in this pool) | Direct reading of all extracts in `_pool_extracts/` |

Downstream agents should read the Norwegian statutory Annual Report (Board's Report + audited IFRS consolidated financial statements + Notes) as the Tier-1 source, and the interim quarterly report under Oslo Børs continuing obligations as the Tier-2 source, per CLAUDE.md §27. No US SEC forms (10-K, 8-K, S-1) exist for this issuer and none should be flagged as "missing" — the local Norwegian equivalents are present and current.

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has an audited FY2025 annual report (~6.6 months old, inside the 18-month window) plus a Q1 2026 quarterly report, earnings call transcript, and investor deck (~2.7 months old, inside the 6-month window), satisfying both legs of the sufficiency rule.
- **Critical missing items:** None required for sufficiency. Note for downstream agents: the two `NorskHydroASAOBNHYEstimatesReport` workbooks (with and without "(1)") appear to be duplicate pulls of the same estimates export (identical tab structure and row/col counts) rather than two distinct vintages — treat them as one source, not corroborating independent data points.
