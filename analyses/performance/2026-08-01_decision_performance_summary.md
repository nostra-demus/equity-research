# Decision Calibration Scoreboard — 2026-08-01

**Scope:** all  
**Verdict:** Pre-data — 7 decisions, 7 reviews, 1 resolved forecasts, 1 resolved directional calls. Inventory, process metrics, and the flat error/pre-mortem tallies are reported; every skill metric (hit rate, Brier, Selected−Rejected spread) is below floor and explicitly withheld, not estimated.

> No skill verdict is possible yet: 1 directional and 1 forecast resolutions, both below floor. This is expected for a young ledger — the honest state is 'not yet knowable', and every skill metric (hit rate, Brier, basket spread) is withheld rather than estimated (CLAUDE.md §1/§11).

## Counts
- Decisions: **7**
- Reviews filed: **7**
- Forecasts resolved (Brier-scorable): **1** / floor 10
- Directional calls resolved (hit-rate-scorable): **1** / floor 10
- Effective sample: **2** independent (of 2 raw across 2 tickers)
- Return basis: **review-time benchmark-relative** (no market feed)

## Skill metrics (withheld below floor — this is the point)
- Benchmark-adjusted hit rate (integrity-gated): **withheld**
- Sequential e-value vs coin-flip: **1.5** (skill at ≥20.0) — e-value below 1/α, and/or below the N floor, and/or fewer than 10 distinct names — no skill claim (correct at this sample).
- Brier / reliability: **insufficient resolved forecasts (N=1; floor 10) — Brier/reliability withheld**
- Selected − Rejected spread: **withheld**

## Always-honest tallies (no floor — a count, not a rate)
- Error taxonomy (§20): {'bad base rate': 1, 'valuation multiple error': 1, 'bad causal inference': 1, 'false negative': 1}
- Pre-mortem outcomes (§5): {'not_applicable': 1, 'too_early': 2, 'vindicated': 0, 'contradicted': 1, 'partial': 0}
- ⚠️ **Pre-mortem FALSE COMFORT** (red-team missed a real risk) — 1 case(s): BG (2026-06-01, ad-hoc)

## Excluded from skill metrics (truth-integrity: provisional)
1 run(s) are flagged provisional (unverified, or an active finish-gate PROVISIONAL banner) and contribute to NONE of the skill numbers above (Brier, hit rate, cohort returns, e-value, months-to-significance). They remain in the Inventory below.

| Run | Ticker | verify-evidence verdict | finish-gate banner |
|---|---|---|---|
| analyses/TSLA_2026-07-25 | TSLA | Minor issues | yes |

## Inventory
| Ticker | Run | Decision | Basket | Integrity | Conf | Resolved fc | Dir hit | Latest review |
|---|---|---|---|---|---|---|---|---|
| AMZN | 2026-07-10 | Watchlist | Watchlist | unaudited | 57 | 0/5 | — | 2026-08-01 |
| BG | 2026-06-01 | Watchlist | Watchlist | verified | 46 | 0/6 | — | 2026-08-01 |
| EMAAR | 2026-07-10 | Watchlist | Watchlist | unaudited | 52 | 0/6 | — | — |
| HCG | 2026-06-01 | Avoid | Rejected | verified | 70 | 0/6 | ✓ | 2026-08-01 |
| NHY | 2026-07-19 | Watchlist | Watchlist | verified | 25.0 | 1/6 | — | 2026-08-01 |
| TMCV | 2026-06-07 | Watchlist | Watchlist | unaudited | 47 | 0/6 | — | 2026-07-13 |
| TSLA | 2026-07-25 | Short Candidate | Short | ⚠ provisional | 50.0 | 0/7 | — | — |

*N=7 decisions; 7 reviews filed; 1 forecasts resolved; 1 directional calls resolved. Floors: Brier ≥10 resolved, cohort ≥5/basket, hit rate ≥10 directional. Anything below its floor is withheld, not estimated (CLAUDE.md §11). 1 run(s) excluded from the above as truth-integrity 'provisional' (unverified or flagged) — see excluded_provisional; an 'unaudited' run (verify-evidence never ran) is NOT excluded.*
