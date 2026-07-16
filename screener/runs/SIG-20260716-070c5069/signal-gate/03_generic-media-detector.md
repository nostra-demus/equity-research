# Generic Media Detection — SIG-20260716-070c5069

## 1. Category Detection

| Category | Tagged | Evidence (one line) |
|---|---|---|
| market_cap_roundup | no | Not a company market-cap aggregate at all — the figure is total Dubai residential sales value (AED 225.7bn), and zero companies are named [Outlook Business, 2026-07-16]. |
| index_movement_summary | no | No index (Nifty/Sensex/S&P-type) is the subject; the metric is a housing-transactions value statistic, not an index level or points move. |
| top_gainers_losers | no | No ranked list of names, gainers, or losers appears anywhere in the article. |
| generic_market_close | no | Not a "markets closed higher/lower" daily-wrap; it is a half-year real-estate market statistic. |
| many_companies_no_thesis | no | Zero companies are named (relevance report confirms "no single company is the subject") — the 4+ company threshold cannot be met. |
| lacks_specificity_quantifiability | yes | The only stated cause — "regional geopolitical tension"/"West Asia conflict" — is never tied to a specific named event, date, or magnitude, and Anarock's own CEO calls the effect "sentiment-driven, not structural" [Outlook Business, 2026-07-16]; combined with zero company-specific content, the 16% figure has no checkable, attributable single-entity driver. |

## 2. Scores

| Field | Score | One-line reason |
|---|---|---|
| specificity_score | 8 | Covers an entire city's residential market with no company, ticker, or distinguishable single-entity thesis named. |
| quantifiability_score | 25 | A real, checkable number exists (16% YoY decline to AED 225.7bn [Outlook Business, 2026-07-16]), but its stated cause is vague regional "tension" with no named event/date/magnitude and is explicitly downgraded by Anarock's CEO to "sentiment-driven, not structural." |
| investability_score | 8 | No company or ticker is named, so a PM reading this cannot change any single position on the fact alone; the source's own commentary frames the move as non-structural. |

## 3. Verdict

- **is_generic_media:** true
- **generic_media_reason:** `lacks_specificity_quantifiability` is matched — the article is a city-wide Dubai housing-sales aggregate naming zero companies, and its only offered cause ("regional geopolitical tension") is vague and undated, with Anarock's own CEO calling the effect "sentiment-driven, not structural" rather than an attributable, checkable driver.

Verdict: true, specificity 8, quantifiability 25, investability 8
