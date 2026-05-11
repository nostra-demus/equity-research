# Earnings Data Triage — BG

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| bunge-2025-annual-report.pdf | Annual report (PDF) | FY2025 (year ended Dec 31, 2025) | 2026-05-11 | High |
| bunge_10k.txt | Annual filing (10-K, text) | FY2025 (year ended Dec 31, 2025) | 2026-05-11 | High |
| bunge 10q.pdf | Quarterly filing (10-Q, PDF) | Q1 2026 (quarter ended Mar 31, 2026) | 2026-05-11 | High |
| bunge_10q.txt | Quarterly filing (10-Q, text) | Q1 2026 (quarter ended Mar 31, 2026) | 2026-05-11 | High |
| q1-2026-bunge-limited-earnings-conference-call.pdf | Earnings transcript | Q1 2026 (call Apr 29, 2026) | 2026-05-11 | High |
| q1_call.txt | Earnings transcript (text) | Q1 2026 (call Apr 29, 2026) | 2026-05-11 | High |
| q1-2026-earnings-release.pdf | Earnings release / investor deck | Q1 2026 | 2026-05-11 | High |
| Consensus.xlsx | Consensus / estimate export | As of May 9, 2026 | 2026-05-09 | High |
| Guidance.xlsx | Guidance data export | As of May 9, 2026 | 2026-05-09 | High |
| Multiples.xlsx | Data export (valuation multiples) | As of May 9, 2026 | 2026-05-09 | Low |
| Recent Changes.xlsx | Data export (recent revisions/changes) | As of May 9, 2026 | 2026-05-09 | Medium |
| Revisions.xlsx | Estimate revisions export | As of May 9, 2026 | 2026-05-09 | High |
| Surprise.xlsx | Earnings surprise history export | As of May 9, 2026 | 2026-05-09 | High |
| Trends.xlsx | Estimate trend / data export | As of May 9, 2026 | 2026-05-09 | High |

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | bunge_10k.txt (and bunge-2025-annual-report.pdf) | FY2025 (FYE Dec 31, 2025) | ~4 months since fiscal year-end |
| Quarterly filing | bunge_10q.txt (and bunge 10q.pdf) | Q1 2026 (QE Mar 31, 2026) | ~1 month since quarter-end |
| Earnings transcript | q1_call.txt (and q1-2026-bunge-limited-earnings-conference-call.pdf) | Q1 2026 call (Apr 29, 2026) | ~0.4 months |
| Investor deck | q1-2026-earnings-release.pdf | Q1 2026 | ~0.4 months |
| Consensus / estimate export | Consensus.xlsx | As of May 9, 2026 | ~0.07 months |
| Cash flow data | bunge_10q.txt + bunge_10k.txt | Q1 2026 + FY2025 | ~1 month / ~4 months |
| Guidance data | Guidance.xlsx + q1-2026-earnings-release.pdf | As of May 9, 2026 / Q1 2026 | ~0.07 months / ~0.4 months |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | FY2025 10-K (bunge_10k.txt); Q1 2026 10-Q (bunge_10q.txt) — Condensed Consolidated Statements of Income (Loss) | Needed for revenue, margin, EPS |
| Balance sheet | Y | FY2025 10-K; Q1 2026 10-Q — Condensed Consolidated Balance Sheets | Needed for working capital and leverage |
| Cash flow statement | Y | FY2025 10-K; Q1 2026 10-Q — Condensed Consolidated Statements of Cash Flows (Operating activities confirmed in 10-Q) | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Q1 2026 10-Q (QE Mar 31, 2026) | Needed for trend and setup |
| Last 8 quarters | N | Only Q1 2026 10-Q in pool; FY2025 10-K provides annual not quarterly history; Trends.xlsx and Surprise.xlsx may contain quarterly history (data export) | Needed for seasonality and inflection |
| Consensus estimates | Y | Consensus.xlsx (as of May 9, 2026) | Needed for market bar |
| Estimate revisions | Y | Revisions.xlsx, Recent Changes.xlsx, Trends.xlsx | Needed for revision momentum |
| Earnings transcript | Y | q1_call.txt (Apr 29, 2026 Q1 2026 call) | Needed for management tone and driver detail |
| Segment P&L | Y | FY2025 10-K — four reportable segments disclosed (Soybean Processing and Refining, Softseed Processing and Refining, Other Oilseeds Processing and Refining, Grain Merchandising and Milling) | Needed for mix shift |
| Current price | N | Multiples.xlsx may contain valuation but no explicit "current price" file confirmed | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y |
| 06_value-chain.md | Y |
| 10_external-dependency.md | Y |

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N | 04, 05, 99 | None |
| No quarterly data | N | 01, 02, 03, 06 | None (Q1 2026 10-Q available; full 8-quarter history limited but Trends.xlsx/Surprise.xlsx exports provide quarterly history) |
| No earnings transcript | N | 02, 03, 04 | None |
| No segment-level P&L | N | 02, 03, 99 | None (four reportable segments disclosed in 10-K) |
| No cash flow statement | N | 06, 99 | None |
| No current price | Y | 99 | Stock-reaction precision unavailable; earnings-only verdict at master level |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** FY2025 10-K, Q1 2026 10-Q, Q1 2026 transcript, Q1 2026 earnings release, consensus, guidance, revisions, surprise history, and trend data are all present; income statement, balance sheet, and cash flow statement are all available at both annual and quarterly granularity, with four-segment P&L disclosure.
- **Active partial-data caps:** None binding on earnings module agents (01–07, 99). Note: explicit current-price file not present — affects only master-level stock-reaction context in synthesizer; does not cap any earnings module score.
- **Critical missing items:** None at the level required for earnings analysis. Minor limitation: full eight-quarter as-reported quarterly P&L history would need to be reconstructed from Trends.xlsx / Surprise.xlsx data exports rather than pulled from filings, since only the most recent 10-Q is in the pool.
