PDFs can't be rendered, but filenames are explicit and consistent: "bunge-2025-annual-report" (FY2025 annual), "bunge 10q" (a 10-Q filing — paired with the Q1 2026 release, presumably the Q1 2026 10-Q), and "q1-2026" earnings release + transcript. I'll proceed with filename-based classification per the rules (filenames are the available metadata; no fabrication of pages).

Here is the report.

---

# Data Triage — BG

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Notes |
|---|---|---|---|---|
| bunge-2025-annual-report.pdf | Annual filing (annual report / 10-K) | FY2025 | 2026-05-11 | 2.39 MB; primary annual source |
| bunge 10q.pdf | Quarterly filing (10-Q) | Q1 FY2026 (inferred from pairing with Q1-2026 release; period not verified in body) | 2026-05-11 | 839 KB |
| q1-2026-earnings-release.pdf | Quarterly earnings release | Q1 FY2026 | 2026-05-11 | 930 KB |
| q1-2026-bunge-limited-earnings-conference-call.pdf | Earnings transcript | Q1 FY2026 | 2026-05-11 | 271 KB |
| Consensus.xlsx | Data export (consensus estimates) | n/a — external dataset | 2026-05-09 | 229 KB |
| Guidance.xlsx | Data export (company guidance history) | n/a — external dataset | 2026-05-09 | 57 KB |
| Multiples.xlsx | Data export (valuation multiples) | n/a — external dataset | 2026-05-09 | 27 KB |
| Recent Changes.xlsx | Data export (estimate changes) | n/a — external dataset | 2026-05-09 | 39 KB |
| Revisions.xlsx | Data export (estimate revisions) | n/a — external dataset | 2026-05-09 | 65 KB |
| Surprise.xlsx | Data export (earnings surprise history) | n/a — external dataset | 2026-05-09 | 120 KB |
| Trends.xlsx | Data export (estimate / KPI trends) | n/a — external dataset | 2026-05-09 | 60 KB |

## 2. Most Recent Sources

Today's date: 2026-05-11. Period ages computed from the latest period the document describes.

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | bunge-2025-annual-report.pdf | FY2025 (year ended Dec 2025) | ~4 |
| Quarterly filing | bunge 10q.pdf | Q1 FY2026 (inferred, paired with Q1 2026 release) | ~1–2 |
| Earnings transcript | q1-2026-bunge-limited-earnings-conference-call.pdf | Q1 FY2026 | ~1–2 |
| Investor deck | — | — | — (none in pool) |
| Data export | Consensus.xlsx, Guidance.xlsx, Multiples.xlsx, Recent Changes.xlsx, Revisions.xlsx, Surprise.xlsx, Trends.xlsx | as of 2026-05-09 export date | ~0 |

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** Pool contains a FY2025 annual report (~4 months old, well inside the 18-month window) plus a Q1 FY2026 10-Q, earnings release, and earnings call transcript (all ~1–2 months old, well inside the 6-month window).
- **Critical missing items:** None blocking. Worth noting (not disqualifying): no investor presentation / investor deck is in the pool — downstream agents that lean on segment slides or strategy decks (e.g., segment-map, business-quality) will need to work from the 10-K and transcript instead.

---

```
Agent: data-triage
Output: analyses/BG_2026-05-11/business-model/00_data-triage.md (not written — returned inline per instructions)
Verdict: Data pool Sufficient
Biggest finding: FY2025 annual report + Q1 FY2026 10-Q, release, and transcript all present; no investor deck in pool.
```
