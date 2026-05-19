# Data Triage — BG

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Notes |
|---|---|---|---|---|
| bunge-2025-annual-report.pdf | Annual filing (annual report) | FY2025 (year ended Dec 31, 2025) | 2026-05-11 | 2.3 MB; includes CEO letter referencing 2026 Investor Day and Viterra combination |
| bunge_10k.txt | Annual filing (10-K, text) | FY2025 (year ended Dec 31, 2025) | 2026-05-11 | 818 KB text extraction of the 10-K |
| bunge 10q.pdf | Quarterly filing (10-Q) | Q1 2026 (quarter ended Mar 31, 2026) | 2026-05-11 | 820 KB |
| bunge_10q.txt | Quarterly filing (10-Q, text) | Q1 2026 (quarter ended Mar 31, 2026) | 2026-05-11 | 344 KB text extraction of the 10-Q |
| q1-2026-bunge-limited-earnings-conference-call.pdf | Earnings transcript | Q1 2026 call, dated Apr 29, 2026 | 2026-05-11 | 264 KB |
| q1_call.txt | Earnings transcript (text) | Q1 2026 call, dated Apr 29, 2026 | 2026-05-11 | 43 KB text extraction of the call |
| q1-2026-earnings-release.pdf | Earnings release | Q1 2026 | 2026-05-11 | 908 KB; companion to the call |
| Consensus.xlsx | Data export | As of ~May 9, 2026 | 2026-05-09 | 224 KB; sell-side consensus data |
| Guidance.xlsx | Data export | As of ~May 9, 2026 | 2026-05-09 | 55 KB; company guidance history |
| Multiples.xlsx | Data export | As of ~May 9, 2026 | 2026-05-09 | 26 KB; valuation multiples |
| Recent Changes.xlsx | Data export | As of ~May 9, 2026 | 2026-05-09 | 38 KB; recent estimate changes |
| Revisions.xlsx | Data export | As of ~May 9, 2026 | 2026-05-09 | 63 KB; analyst revisions |
| Surprise.xlsx | Data export | As of ~May 9, 2026 | 2026-05-09 | 117 KB; earnings surprise history |
| Trends.xlsx | Data export | As of ~May 9, 2026 | 2026-05-09 | 59 KB; estimate trend data |

No dedicated investor deck file is present. No user notes file is present.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | bunge-2025-annual-report.pdf (and bunge_10k.txt) | FY2025, ended Dec 31, 2025 | ~5 months since period-end |
| Quarterly filing | bunge 10q.pdf (and bunge_10q.txt) | Q1 2026, ended Mar 31, 2026 | ~2 months since period-end |
| Earnings transcript | q1-2026-bunge-limited-earnings-conference-call.pdf (and q1_call.txt) | Q1 2026 call, Apr 29, 2026 | <1 month |
| Investor deck | None | — | — |
| Data export | Consensus.xlsx, Guidance.xlsx, Multiples.xlsx, Recent Changes.xlsx, Revisions.xlsx, Surprise.xlsx, Trends.xlsx | As of ~May 9, 2026 | <1 month |

Note: the FY2025 annual report references a "2026 Investor Day" in the CEO letter, but no investor-day deck file is present in `DATA_PATH`.

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** FY2025 10-K and annual report (period-end ~5 months ago) plus Q1 2026 10-Q, Q1 2026 earnings release, and Q1 2026 earnings call transcript (all <1 month old) easily clear the "annual within 18 months AND quarterly/transcript within 6 months" bar.
- **Critical missing items:** N/A (Sufficient). For information only: no investor-day or analyst-day deck file is present despite a CEO-letter reference to the 2026 Investor Day; downstream agents that would benefit from segment/strategy slides should rely on the 10-K, 10-Q, and transcript instead.
