# Decision Performance & Calibration — 2026-07-13

**Scope:** all · **Verdict:** Pre-data — 5 decisions on the ledger, 3 with a first review filed, 0 resolved forecasts.

**Sample:** 5 decisions · 3 reviews · 0 resolved forecasts.

> N=5 decision(s), 3 review(s), 0 resolved forecast(s). Below the floors for reliable metrics (cohort spread needs >=5 reviewed names/basket; Brier/reliability needs >=10 resolved forecasts). Per CLAUDE.md §11, cohort returns and calibration are NOT computed (would be false precision). Process metrics below are computed (no outcomes needed).

## Ledger inventory

| Ticker | Run | Decision | Basket | Conf | DataSuff | Verify | Pre-mortem (haircut) | Exp-gap (edge) | Forecasts (resolved) | Reviews | 30d return (bmk-rel) |
|---|---|---|---|---:|---:|---|---|---|---:|---:|---|
| HCG | 2026-06-01 | Avoid | Rejected | 70 | 69 | Clean/90 | Survives w/ haircut (6) | overvalued (48) | 6 (0) | 1 | -6.8% (-10.1%) |
| BG | 2026-06-01 | Watchlist | Watchlist | 46 | 68 | Clean/100 | Survives (0) | overvalued (32) | 6 (0) | 1 | n/a — no pool price |
| AMZN | 2026-07-10 | Watchlist | Watchlist | 57 | 82 | not audited | not audited | not audited (own edge_score 35) | 5 (0) | 0 | pending (30d due 2026-08-09) |
| EMAAR | 2026-07-03 | Starter Position Only | Selected | 52 | 72 | not audited | not audited | not audited (own edge_score 40) | 6 (0) | 0 | pending (30d due 2026-08-02) |
| TMCV | 2026-06-07 | Watchlist | Watchlist | 47 | 68 | not audited | not audited | not audited | 6 (0) | 1 | +14.37% (+11.94%) |

## Process metrics (computed now — no outcomes needed)

- Basket distribution: Selected 1 · Watchlist 3 · Rejected 1 · Short 0 · Insufficient 0
- Thesis-type distribution (normalized): Company-specific 4 · Policy-conditional 3 · Sector-cycle 3 · Commodity-conditional 1 (TMCV's source record carries lowercase values — a casing defect, not a semantic gap)
- Avg confidence: 54.4 · Avg data-sufficiency: 71.8
- Avg verification integrity: 95.0 (N=2 audited: HCG 90, BG 100) — both verdict Clean
- Avg pre-mortem haircut: 3.0 (N=2 audited) — verdicts: Survives 1, Survives with haircut 1
- Edge scores (expectations-gap audit only, N=2): [48, 32], avg 40.0. AMZN (35) and EMAAR (40) carry their own module-internal edge_score in decision_record.json but have not yet had a standalone expectations-gap audit run — not mixed into this average.
- Unsupported-claim / Material-or-Failed-verification rate: 0/2 audited (both Clean)
- AMZN, EMAAR, and TMCV have no verification_report.json / pre_mortem.json / expectations_gap.json yet; only HCG and BG have the full audit trio.

## Cohort returns & calibration

Not computed — insufficient resolved history.

- **Cohort return spread (Selected − Rejected):** insufficient. Rejected has 1 reviewed name (HCG, -6.8% absolute / -10.1% benchmark-relative at 30d); Selected (EMAAR) has 0 reviews yet; Watchlist has 2 reviewed names (BG — no computable return, entry price was never pool-verified; TMCV — +14.37% absolute / +11.94% benchmark-relative). All three baskets are far below the ≥5-reviewed-names floor.
- **Hit rate / false-positive / false-negative rate:** not computable — no decision has reached a resolved outcome yet.
- **Brier score / reliability by probability band:** insufficient (N=0 resolved forecasts). Across the 3 reviewed decisions' 18 forecast_ledger entries (HCG 6, BG 6, TMCV 6), every single one resolved to "still open" or "not assessable" as of its review date — none has been confirmed or falsified.
- **Calibration by owner_module / by forecast_type:** not attempted — the flat floor (≥10 resolved forecasts) isn't met, so the per-slice floors (also ≥10 each) can't be either.
- **Confidence calibration (do higher-confidence decisions realize better outcomes):** insufficient — no outcomes yet.

## Per-module calibration (qualitative, from review notes)

- **HCG (Avoid → Rejected):** Valuation and management-governance jointly drove the call. At 30d, price is down 6.8% vs NIFTY 50 up 3.3% — directionally consistent with the "modestly overvalued, no margin of safety" verdict, but 40 days is too early on a 12-month thesis. No module has yet missed a key variable. The FY26 audited annual report (the single highest-value pending catalyst) has not landed.
- **BG (Watchlist):** Too early to attribute. No forecast has resolved and no red flag has materialized or cleared. Valuation is the most load-bearing module for the call and is the one most directly (if only sentimentally) challenged so far — analyst consensus has grown more bullish (Strong Buy, avg PT $139.30) since the decision, even though this is not primary evidence per CLAUDE.md §4.
- **TMCV (Watchlist):** Price rallied +14.37% (+11.94% benchmark-relative) in 5 weeks — but neither of the two named binary risks (Iveco financing structure, TMF Holdings AGM opposition) has actually resolved. The review explicitly flags this as sentiment/momentum, not evidence the valuation or catalyst modules were wrong, and defers real attribution to the 90d checkpoint (2026-09-05).
- **AMZN, EMAAR:** Pending first review (2026-08-09 and 2026-08-02 respectively).

## Data-sufficiency verdict

**Pre-data.** 5 decisions on the ledger; 3 have a first (30d) review filed; 0 forecast_ledger entries have resolved across any of them. Cohort return spreads and Brier/reliability calibration require samples the engine does not yet have (≥5 reviewed names per basket; ≥10 resolved forecasts) — both are reported as insufficient rather than estimated. The most useful read right now is structural, not statistical: the learning loop is running (decisions → reviews → forecast tracking), but every open forecast in the ledger is still genuinely open. The next informative checkpoints are HCG/BG's 90d reviews (2026-08-30 both) and TMCV's 90d review (2026-09-05), which will be the first to capture resolved earnings prints and the Iveco/AGM binaries.

## Outputs

- `analyses/performance/2026-07-13_calibration_summary.json`
- `analyses/performance/2026-07-13_decision_performance_summary.md`
