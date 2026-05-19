# Earnings Data Triage — BG

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| bunge-2025-annual-report.pdf | Annual report | FY2025 (calendar 2025) | 2026-05-11 | High |
| bunge_10k.txt | Annual filing (text) | FY2025 10-K | 2026-05-11 | High |
| bunge 10q.pdf | Quarterly filing | Q1 2026 10-Q | 2026-05-11 | High |
| bunge_10q.txt | Quarterly filing (text) | Q1 2026 10-Q | 2026-05-11 | High |
| q1-2026-earnings-release.pdf | Earnings release | Q1 2026 | 2026-05-11 | High |
| q1-2026-bunge-limited-earnings-conference-call.pdf | Earnings transcript | Q1 2026 | 2026-05-11 | High |
| q1_call.txt | Earnings transcript (text) | Q1 2026 | 2026-05-11 | High |
| Consensus.xlsx | Consensus / estimate export | Current estimates | 2026-05-09 | High |
| Guidance.xlsx | Guidance data export | Company guidance | 2026-05-09 | High |
| Revisions.xlsx | Estimate revisions export | Revision history | 2026-05-09 | High |
| Surprise.xlsx | Beat/miss history export | Historical surprises | 2026-05-09 | High |
| Trends.xlsx | Estimate trend export | Estimate trends over time | 2026-05-09 | High |
| Recent Changes.xlsx | Recent estimate changes export | Recent revisions | 2026-05-09 | High |
| Multiples.xlsx | Valuation multiples export | Multiples | 2026-05-09 | Low (valuation, not earnings) |

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | bunge_10k.txt / bunge-2025-annual-report.pdf | FY2025 (10-K) | ~4 |
| Quarterly filing | bunge_10q.txt / bunge 10q.pdf | Q1 2026 | ~1 |
| Earnings transcript | q1_call.txt / q1-2026-bunge-limited-earnings-conference-call.pdf | Q1 2026 | ~1 |
| Investor deck | Not present (earnings release present in lieu) | Q1 2026 release | ~1 |
| Consensus / estimate export | Consensus.xlsx | As of 2026-05-09 | <1 |
| Cash flow data | Embedded in bunge_10k.txt / bunge_10q.txt | FY2025 + Q1 2026 | ~1–4 |
| Guidance data | Guidance.xlsx + q1-2026-earnings-release.pdf | Current FY guidance | <1 |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | bunge_10k.txt (FY2025), bunge_10q.txt (Q1 2026) | Needed for revenue, margin, EPS |
| Balance sheet | Y | bunge_10k.txt, bunge_10q.txt | Needed for working capital and leverage |
| Cash flow statement | Y | bunge_10k.txt, bunge_10q.txt | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | bunge_10q.txt, q1-2026-earnings-release.pdf | Needed for trend and setup |
| Last 8 quarters | Partial | 10-K has annual + Q1 2026 10-Q has prior-year comp; Trends.xlsx, Surprise.xlsx | Needed for seasonality and inflection |
| Consensus estimates | Y | Consensus.xlsx | Needed for market bar |
| Estimate revisions | Y | Revisions.xlsx, Recent Changes.xlsx, Trends.xlsx | Needed for revision momentum |
| Earnings transcript | Y | q1_call.txt | Needed for management tone and driver detail |
| Segment P&L | Y | bunge_10k.txt, bunge_10q.txt (segment notes) | Needed for mix shift |
| Current price | N | Not present in data pool | Needed only for master-level stock reaction context |

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
| No quarterly data | N | 01, 02, 03, 06 | None |
| No earnings transcript | N | 02, 03, 04 | None |
| No segment-level P&L | N | 02, 03, 99 | None |
| No cash flow statement | N | 06, 99 | None |
| No current price | Y | 99 | 99: do not discuss stock reaction precision; earnings-only verdict |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** FY2025 10-K and Q1 2026 10-Q both present in text plus PDF form, Q1 2026 transcript and earnings release available, and a complete consensus/revisions/surprise/guidance/trends data set is available — income statement, balance sheet, cash flow statement, segment P&L, transcript, and consensus all in hand.
- **Active partial-data caps:** None (only minor flag: current price absent, which affects 99-level stock-reaction discussion only, not earnings analysis itself).
- **Critical missing items:** None for earnings analysis. Lack of standalone investor deck is mitigated by the Q1 2026 earnings release PDF. Lack of historical quarter-by-quarter detail beyond what 10-K/10-Q comp tables and Surprise/Trends exports provide may modestly constrain 8-quarter seasonality work but does not block any analysis.
