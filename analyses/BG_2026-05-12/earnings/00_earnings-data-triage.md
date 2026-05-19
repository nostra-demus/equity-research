# Earnings Data Triage — BG

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| bunge_10k.txt | Annual filing (10-K, text) | FY2025 (fiscal year ended Dec 31, 2025) | 2026-05-11 | High |
| bunge-2025-annual-report.pdf | Annual report (PDF) | FY2025 | 2026-05-11 | High |
| bunge_10q.txt | Quarterly filing (10-Q, text) | Q1 2026 (quarterly period ended March 31, 2026) | 2026-05-11 | High |
| bunge 10q.pdf | Quarterly filing (10-Q, PDF) | Q1 2026 | 2026-05-11 | High |
| q1_call.txt | Earnings transcript (text) | Q1 2026 call (April 29, 2026) | 2026-05-11 | High |
| q1-2026-bunge-limited-earnings-conference-call.pdf | Earnings transcript (PDF) | Q1 2026 call | 2026-05-11 | High |
| q1-2026-earnings-release.pdf | Quarterly earnings release / investor deck | Q1 2026 | 2026-05-11 | High |
| Consensus.xlsx | Consensus / estimate export | Current (as of May 9, 2026) | 2026-05-09 | High |
| Guidance.xlsx | Guidance data export | Current | 2026-05-09 | High |
| Multiples.xlsx | Valuation multiples export | Current | 2026-05-09 | Low |
| Recent Changes.xlsx | Estimate / data changes export | Current | 2026-05-09 | Medium |
| Revisions.xlsx | Estimate revisions export | Current | 2026-05-09 | High |
| Surprise.xlsx | Earnings surprise history export | Historical | 2026-05-09 | High |
| Trends.xlsx | Trend / time-series data export | Historical | 2026-05-09 | Medium |

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | bunge_10k.txt / bunge-2025-annual-report.pdf | FY2025 (year ended Dec 31, 2025) | ~4 |
| Quarterly filing | bunge_10q.txt / bunge 10q.pdf | Q1 2026 (ended March 31, 2026) | ~1 |
| Earnings transcript | q1_call.txt / q1-2026-bunge-limited-earnings-conference-call.pdf | Q1 2026 call (April 29, 2026) | ~0.5 |
| Investor deck | q1-2026-earnings-release.pdf | Q1 2026 | ~0.5 |
| Consensus / estimate export | Consensus.xlsx | As of May 9, 2026 | ~0.1 |
| Cash flow data | bunge_10k.txt (FY2025 cash flow statement) + bunge_10q.txt (Q1 2026 cash flow statement) | FY2025 + Q1 2026 | ~1–4 |
| Guidance data | Guidance.xlsx + q1-2026-earnings-release.pdf + q1_call.txt | Q1 2026 / FY2026 guidance | ~0.5 |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | bunge_10k.txt (FY2025), bunge_10q.txt (Q1 2026) | Needed for revenue, margin, EPS |
| Balance sheet | Y | bunge_10k.txt (FY2025), bunge_10q.txt (Q1 2026) | Needed for working capital and leverage |
| Cash flow statement | Y | bunge_10k.txt (FY2025), bunge_10q.txt (Q1 2026) | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | bunge_10q.txt, q1_call.txt, q1-2026-earnings-release.pdf | Needed for trend and setup |
| Last 8 quarters | N | 10-K provides FY2024 vs FY2025 plus Q1 2026; intermediate quarterly history limited within these filings; Trends.xlsx may carry history | Needed for seasonality and inflection |
| Consensus estimates | Y | Consensus.xlsx | Needed for market bar |
| Estimate revisions | Y | Revisions.xlsx, Recent Changes.xlsx | Needed for revision momentum |
| Earnings transcript | Y | q1_call.txt / q1-2026-bunge-limited-earnings-conference-call.pdf | Needed for management tone and driver detail |
| Segment P&L | Y | bunge_10k.txt and bunge_10q.txt (BG reports segments: Agribusiness, Refined and Specialty Oils, Milling, etc.) | Needed for mix shift |
| Current price | N | Not present in any file (Multiples.xlsx may carry implied price but not flagged as such) | Needed only for master-level stock reaction context |

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
| No current price | Y | 99 | 99 caps stock-reaction precision; earnings-only verdict |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** FY2025 10-K, Q1 2026 10-Q, Q1 2026 transcript, Q1 2026 earnings release, and full consensus/revisions/guidance/surprise exports are all present and recent (within 4 months), with full income statement, balance sheet, cash flow statement, and segment-level P&L available.
- **Active partial-data caps:** Not applicable (Sufficient verdict). One minor flag: no explicit current price file, which only constrains stock-reaction discussion at the synthesis layer (99); does not change overall verdict.
- **Critical missing items:** None for an earnings-setup analysis. Note: deep multi-year quarterly history (8 sequential quarters of standalone P&L) is not directly broken out in the filings; agents may need to reconstruct from FY2025 10-K + Q1 2026 10-Q + Trends.xlsx, or accept a shorter QoQ history window.
