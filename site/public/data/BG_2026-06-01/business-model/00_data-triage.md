# Data Triage — BG

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Notes |
|---|---|---|---|---|
| bunge_10k.txt | Annual filing (10-K) | FY2025, fiscal year ended Dec 31, 2025 | 2026-05-11 | Bunge Global SA. Text extract. Internal ref states FY2024 10-K filed 2026-02-20, so this FY2025 10-K filed ~Feb 2026. Share count 193,509,080 as of Feb 17, 2026. Covers Viterra combination. |
| bunge-2025-annual-report.pdf | Annual filing (10-K / annual report) | FY2025, year ended Dec 31, 2025 | 2026-05-11 | "2025 Annual Report" cover confirmed. PDF version of the same FY2025 annual filing as bunge_10k.txt. |
| bunge_10q.txt | Quarterly filing (10-Q) | Q1 2026, quarterly period ended Mar 31, 2026 | 2026-05-11 | Bunge Global SA. Text extract. Share count 194,018,115 as of Apr 27, 2026. |
| bunge 10q.pdf | Quarterly filing (10-Q) | Q1 2026, quarterly period ended Mar 31, 2026 | 2026-05-11 | PDF version of the same Q1 2026 10-Q as bunge_10q.txt (cover page confirmed). |
| q1_call.txt | Earnings transcript | Q1 2026 call, April 29, 2026 | 2026-05-11 | Full transcript text. Participants: Heckman (CEO), Neppl (CFO), Haden (IR). |
| q1-2026-bunge-limited-earnings-conference-call.pdf | Earnings transcript | Q1 2026 call, April 29, 2026 | 2026-05-11 | PDF version of the same Q1 2026 transcript as q1_call.txt. |
| q1-2026-earnings-release.pdf | Quarterly earnings release | Q1 2026 results, dated April 29, 2026 | 2026-05-11 | Press release. Q1 GAAP diluted EPS $0.35 (vs $1.48 PY); adjusted $1.83. FY adjusted EPS outlook raised to $9.00–$9.50 from $7.50–$8.00. |
| Consensus.xlsx | Data export (vendor estimates) | Snapshot as of 2026-05-09 | 2026-05-09 | Consensus estimates export. Content date from file metadata. |
| Guidance.xlsx | Data export (vendor) | Snapshot as of 2026-05-09 | 2026-05-09 | Company/consensus guidance export. |
| Multiples.xlsx | Data export (vendor valuation) | Snapshot as of 2026-05-09 | 2026-05-09 | Valuation multiples export. |
| Recent Changes.xlsx | Data export (vendor) | Snapshot as of 2026-05-09 | 2026-05-09 | Estimate-change export. |
| Revisions.xlsx | Data export (vendor) | Snapshot as of 2026-05-09 | 2026-05-09 | Estimate-revisions export. |
| Surprise.xlsx | Data export (vendor) | Snapshot as of 2026-05-09 | 2026-05-09 | Earnings-surprise history export. |
| Trends.xlsx | Data export (vendor) | Snapshot as of 2026-05-09 | 2026-05-09 | Estimate-trend export. |

Notes on duplicates: three filings are each present in two formats (10-K as .txt + .pdf; 10-Q as .txt + .pdf; Q1 transcript as .txt + .pdf). Downstream agents should treat each pair as a single source, preferring the text extract for parsing. No investor deck and no user-note files are present in the pool.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | bunge_10k.txt / bunge-2025-annual-report.pdf | FY2025 (year ended Dec 31, 2025) | ~5 from period-end; ~3–4 from ~Feb 2026 filing |
| Quarterly filing | bunge_10q.txt / bunge 10q.pdf | Q1 2026 (period ended Mar 31, 2026) | ~2 |
| Earnings transcript | q1_call.txt / q1-2026-bunge-limited-earnings-conference-call.pdf | Q1 2026 call (Apr 29, 2026) | ~1 |
| Investor deck | None in pool | — | — |
| Data export | Consensus.xlsx (+ 6 others) | Snapshot 2026-05-09 | <1 |

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool contains a FY2025 10-K (year ended Dec 31, 2025 — well inside 18 months) plus a Q1 2026 10-Q, a Q1 2026 earnings transcript, and a Q1 2026 release (all dated Mar–Apr 2026, well inside 6 months), satisfying both legs of the sufficiency rule.
- **Critical missing items:** None blocking (verdict is Sufficient). Minor gaps for downstream awareness: no standalone investor presentation / deck, and no user-note file. Vendor data exports are present but reflect a 2026-05-09 snapshot that predates any newer market moves.