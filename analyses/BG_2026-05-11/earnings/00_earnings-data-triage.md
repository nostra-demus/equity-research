# Earnings Data Triage — BG

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| bunge-2025-annual-report.pdf | Annual filing (annual report) | FY 2025 | 2026-05-11 | High |
| bunge_10k.txt | Annual filing (10-K text) | FY 2025 | 2026-05-11 | High |
| bunge 10q.pdf | Quarterly filing (10-Q PDF) | Q1 2026 | 2026-05-11 | High |
| bunge_10q.txt | Quarterly filing (10-Q text) | Q1 2026 | 2026-05-11 | High |
| q1-2026-earnings-release.pdf | Quarterly earnings release | Q1 2026 | 2026-05-11 | High |
| q1-2026-bunge-limited-earnings-conference-call.pdf | Earnings transcript (PDF) | Q1 2026 | 2026-05-11 | High |
| q1_call.txt | Earnings transcript (text) | Q1 2026 | 2026-05-11 | High |
| Consensus.xlsx | Consensus / estimate export | Forward consensus snapshot | 2026-05-09 | High |
| Revisions.xlsx | Estimate revisions export | Estimate revision history | 2026-05-09 | High |
| Surprise.xlsx | Beat/miss history export | Historical surprise data | 2026-05-09 | High |
| Trends.xlsx | Estimate trends export | Estimate trend history | 2026-05-09 | High |
| Guidance.xlsx | Guidance data export | Company guidance history | 2026-05-09 | High |
| Recent Changes.xlsx | Recent estimate changes export | Recent estimate changes | 2026-05-09 | Medium |
| Multiples.xlsx | Valuation multiples export | Trading multiples | 2026-05-09 | Low |

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | bunge-2025-annual-report.pdf / bunge_10k.txt | FY 2025 | ~4 months (assuming FY-end Dec 2025) |
| Quarterly filing | bunge 10q.pdf / bunge_10q.txt | Q1 2026 | ~1 month |
| Earnings transcript | q1-2026-bunge-limited-earnings-conference-call.pdf / q1_call.txt | Q1 2026 | ~1 month |
| Investor deck | Not available | — | — |
| Consensus / estimate export | Consensus.xlsx | As of 2026-05-09 | 0 |
| Cash flow data | Inside 10-K (bunge_10k.txt) and 10-Q (bunge_10q.txt) | FY 2025 + Q1 2026 | ~1 month |
| Guidance data | Guidance.xlsx + Q1 2026 transcript / release | Current | 0–1 month |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | 10-K (bunge_10k.txt), 10-Q (bunge_10q.txt), Q1 2026 release | Needed for revenue, margin, EPS |
| Balance sheet | Y | 10-K (bunge_10k.txt), 10-Q (bunge_10q.txt) | Needed for working capital and leverage |
| Cash flow statement | Y | 10-K (bunge_10k.txt), 10-Q (bunge_10q.txt) | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Q1 2026 10-Q + release + transcript | Needed for trend and setup |
| Last 8 quarters | Y | 10-K FY 2025 historicals + Q1 2026 10-Q comparatives (likely partial — quarterly history depends on 10-K supplementary disclosures and may need reconstruction) | Needed for seasonality and inflection |
| Consensus estimates | Y | Consensus.xlsx | Needed for market bar |
| Estimate revisions | Y | Revisions.xlsx, Trends.xlsx, Recent Changes.xlsx | Needed for revision momentum |
| Earnings transcript | Y | q1-2026-bunge-limited-earnings-conference-call.pdf / q1_call.txt | Needed for management tone and driver detail |
| Segment P&L | Y | 10-K segment note + 10-Q + Q1 2026 release (Bunge reports Agribusiness, Refined and Specialty Oils, Milling, Corporate & Other) | Needed for mix shift |
| Current price | N | Not in data pool | Needed only for master-level stock reaction context |

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
| No current price | Y | 99 | Earnings-only verdict in 99; no stock-reaction precision |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** Recent FY 2025 annual report and 10-K, Q1 2026 10-Q with earnings release and conference call transcript, full income statement / balance sheet / cash flow statement, segment disclosures, plus consensus, revisions, surprise, trends, and guidance exports are all present.
- **Active partial-data caps:** None binding on Layers 0–3. The only missing item is current stock price, which affects only 99's stock-reaction commentary (no score cap).
- **Critical missing items:**
  - Current stock price (limits stock-reaction precision in synthesis only)
  - Standalone investor deck (non-blocking; transcript and earnings release cover management narrative)
