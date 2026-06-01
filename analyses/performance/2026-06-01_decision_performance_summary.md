# Decision Performance & Calibration — 2026-06-01

**Scope:** all · **Verdict:** Pre-data — learning loop live; inventory + process metrics computed; calibration awaits resolved reviews.

**Sample:** 2 decision · 0 reviews · 0 resolved forecasts.

> N=2 decision(s), 0 review(s), 0 resolved forecast(s). Below the floors for reliable metrics (cohort spread needs >=5 reviewed names/basket; Brier/reliability needs >=10 resolved forecasts). Per CLAUDE.md §11, cohort returns and calibration are NOT computed (would be false precision). Process metrics below are computed (no outcomes needed). First scheduled review: BG 30d due 2026-07-01.

## Ledger inventory

| Ticker | Run | Decision | Basket | Conf | DataSuff | Verify | Pre-mortem (haircut) | Exp-gap (edge) | Forecasts | Reviews |
|---|---|---|---|---:|---:|---|---|---|---:|---:|
| BG | 2026-06-01 | Watchlist | Watchlist | 46 | 68 | Clean/100 | Survives (0) | overvalued (32) | 6 | 0 |
| HCG | 2026-06-01 | Avoid | Rejected | 70 | 69 | None/None | None (None) | None (None) | 6 | 0 |

## Process metrics (computed now — no outcomes needed)

- Basket distribution: {'Watchlist': 1, 'Rejected': 1}
- Thesis-type distribution: {'Commodity-conditional': 1, 'Policy-conditional': 2, 'Company-specific': 1}
- Avg confidence: 58.0 · Avg data-sufficiency: 68.5
- Avg verification integrity: 100.0 · verdicts: {'Clean': 1}
- Avg pre-mortem haircut: 0.0 · verdicts: {'Survives': 1}
- Edge scores: [32] (avg 32.0)

## Cohort returns & calibration

Not computed — insufficient resolved history (see note). Selected−Rejected spread, hit rate, and the Brier/reliability calibration populate once enough reviews resolve (first: BG 30d, 2026-07-01).

## Per-module calibration

Pending first reviews.
