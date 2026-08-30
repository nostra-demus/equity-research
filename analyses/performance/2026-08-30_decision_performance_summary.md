# Decision Calibration Scoreboard — 2026-08-30

**Scope:** all  
**Verdict:** Pre-data — 14 decisions, 11 reviews, 3 resolved forecasts, 1 resolved directional calls. Inventory, process metrics, and the flat error/pre-mortem tallies are reported; every skill metric (hit rate, Brier, Selected−Rejected spread) is below floor and explicitly withheld, not estimated.

> No skill verdict is possible yet: 1 directional and 3 forecast resolutions, both below floor. This is expected for a young ledger — the honest state is 'not yet knowable', and every skill metric (hit rate, Brier, basket spread) is withheld rather than estimated (CLAUDE.md §1/§11).

## Counts
- Decisions: **14**
- Reviews filed: **11**
- Forecasts resolved (Brier-scorable): **3** / floor 10
- Directional calls resolved (hit-rate-scorable): **1** / floor 10
- Effective sample: **3** independent (of 4 raw across 3 tickers)
- Return basis: **review-time benchmark-relative** (no market feed)

## Skill metrics (withheld below floor — this is the point)
- Benchmark-adjusted hit rate (integrity-gated): **withheld**
- ↳ All-published-calls hit rate (integrity-blind, 1 provisional included): **withheld**
- Sequential e-value vs coin-flip: **1.5** (skill at ≥20.0) — e-value below 1/α, and/or below the N floor, and/or fewer than 10 distinct names — no skill claim (correct at this sample).
- Brier / reliability: **insufficient resolved forecasts (N=3; floor 10) — Brier/reliability withheld**
- Selected − Rejected spread: **withheld**

## Provider calibration (recorded cohorts only; never blended)
> No blended provider hit rate. Each recorded cohort is reported separately. A metric is comparable only when Claude and Codex independently clear that metric's existing floor at a matched horizon. No automated superiority ranking or confidence haircut is produced.

| Provider | Forecast calibration | Directional hit rate |
|---|---|---|
| Claude | withheld (N=0, tickers=0) | withheld (N=0, tickers=0) |
| Codex | withheld (N=0, tickers=0) | withheld (N=0, tickers=0) |

Mixed, partial, invalid, and legacy/unknown cohorts remain separate and are excluded from the recorded head-to-head: unknown_legacy.

**Comparison status:** withheld — Claude and Codex have not both independently cleared any applicable metric floor; provider ranking and provider-specific confidence haircuts are refused.

## Always-honest tallies (no floor — a count, not a rate)
- Error taxonomy (§20): {'bad base rate': 2, 'valuation multiple error': 2, 'bad causal inference': 2, 'false negative': 2, 'timing error': 1, 'catalyst delay': 1}
- Pre-mortem outcomes (§5): {'not_applicable': 3, 'too_early': 3, 'vindicated': 0, 'contradicted': 2, 'partial': 0}
- ⚠️ **Pre-mortem FALSE COMFORT** (red-team missed a real risk) — 2 case(s): BG (2026-06-01, ad-hoc), TSLA (2026-07-25, 30d)

## Excluded from skill metrics (truth-integrity: provisional)
7 run(s) are flagged provisional (unverified, or an active finish-gate PROVISIONAL banner) and contribute to NONE of the skill numbers above (Brier, hit rate, cohort returns, e-value, months-to-significance). They remain in the Inventory below.

| Run | Ticker | verify-evidence verdict | finish-gate banner |
|---|---|---|---|
| analyses/DHER_2026-08-12 | DHER | Material issues | yes |
| analyses/HAIER_2026-08-13 | HAIER | Minor issues | yes |
| analyses/INDIAMART_2026-08-14 | INDIAMART | — | yes |
| analyses/ORCL_2026-08-14 | ORCL | Material issues | — |
| analyses/TSLA_2026-07-25 | TSLA | Minor issues | yes |
| analyses/UBER_2026-08-06 | UBER | Material issues | yes |
| analyses/UBER_2026-08-09 | UBER | Material issues | yes |

## Inventory
| Ticker | Run | Decision | Basket | Provider cohort | Integrity | Conf | Resolved fc | Dir hit | Latest review |
|---|---|---|---|---|---|---|---|---|---|
| AMZN | 2026-07-10 | Watchlist | Watchlist | unknown_legacy | unaudited | 57 | 0/5 | — | 2026-08-09 |
| BG | 2026-06-01 | Watchlist | Watchlist | unknown_legacy | verified | 46 | 0/6 | — | 2026-08-01 |
| DHER | 2026-08-12 | Avoid | Rejected | unknown_legacy | ⚠ provisional | 27.0 | 0/6 | — | — |
| EMAAR | 2026-07-10 | Watchlist | Watchlist | unknown_legacy | unaudited | 52 | 2/6 | — | 2026-08-09 |
| HAIER | 2026-08-13 | Watchlist | Watchlist | unknown_legacy | ⚠ provisional | 35.0 | 0/5 | — | — |
| HCG | 2026-06-01 | Avoid | Rejected | unknown_legacy | verified | 70 | 0/6 | ✓ | 2026-08-01 |
| INDIAMART | 2026-08-14 | Watchlist | Watchlist | unknown_legacy | ⚠ provisional | 58 | 0/6 | — | — |
| NHY | 2026-07-19 | Watchlist | Watchlist | unknown_legacy | verified | 25.0 | 1/6 | — | 2026-08-21 |
| ORCL | 2026-08-14 | Watchlist | Watchlist | unknown_legacy | ⚠ provisional | 47.0 | 0/5 | — | — |
| SMPL | 2026-08-06 | Watchlist | Watchlist | unknown_legacy | verified | 30.0 | 0/5 | — | — |
| TMCV | 2026-06-07 | Watchlist | Watchlist | unknown_legacy | unaudited | 47 | 0/6 | — | 2026-07-13 |
| TSLA | 2026-07-25 | Short Candidate | Short | unknown_legacy | ⚠ provisional | 50.0 | 0/7 | ✗ | 2026-08-24 |
| UBER | 2026-08-06 | Watchlist | Watchlist | unknown_legacy | ⚠ provisional | 42.0 | 0/5 | — | — |
| UBER | 2026-08-09 | Watchlist | Watchlist | unknown_legacy | ⚠ provisional | 47 | 0/7 | — | — |

*N=14 decisions; 11 reviews filed; 3 forecasts resolved; 1 directional calls resolved. Floors: Brier ≥10 resolved, cohort ≥5/basket, hit rate ≥10 directional. Anything below its floor is withheld, not estimated (CLAUDE.md §11). 7 run(s) excluded from the above as truth-integrity 'provisional' (unverified or flagged) — see excluded_provisional; an 'unaudited' run (verify-evidence never ran) is NOT excluded.*
