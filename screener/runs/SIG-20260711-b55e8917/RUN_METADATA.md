# RUN_METADATA — SIG-20260711-b55e8917

| Field | Value |
|---|---|
| Signal ID | SIG-20260711-b55e8917 |
| Headline | Prediction: Carvana's New-Car Business Will Work. Early Numbers Are Stunning. |
| Source | The Motley Fool |
| Date | 2026-07-11 |
| Started (original) | 2026-07-11T15:16:34Z |
| Resumed | 2026-07-12T13:29:01Z |
| Finished | 2026-07-12T13:57:00Z (approx) |
| Repo SHA at resume | 89f9773c1b14047d204d393b95f63d48f862ed7f |

## Override Applied

**signal-gate override: LOG → PROMOTE (human override_promote)**

The prior run (2026-07-11) incorrectly recorded "No `override_promote` in intake" — but `intake.json` carries `"override_promote": true`. Per the pipeline routing contract, a LOG routing at signal-gate with `override_promote: true` is treated as a continue. The full gauntlet (thesis-structure → edge-definition → candidate-surfacing) was run on 2026-07-12.

## Module Outcomes

| Module | Status | Routing |
|---|---|---|
| signal-gate | Completed (prior run, reused) | LOG → PROMOTE (human override) |
| thesis-structure | Completed 2026-07-12 | Proceed |
| edge-definition | Completed 2026-07-12 | provisional |
| candidate-surfacing | Completed 2026-07-12 | — (terminal, candidates written) |

## Final Result

- **Routing:** provisional
- **Edge score:** 61
- **Thesis ID:** THS-SIG-20260711-b55e8917-v1
- **Candidates:** 6 (top: CVNA 88/100)
- **Status reason:** The Stellantis one-store-per-12-month acquisition cap limits Carvana's new-car optionality to ~$1.6–$6.2B EV value against a ~$53.8B disruption premium baked into the stock — a gap no major sell-side firm has published a cap-adjusted model for. The thesis is provisional (not full_machine) because the market may be paying that premium for durable used-car dominance rather than new-car optionality, and that attribution cannot be proven until the July 29, 2026 Q2 earnings call.

## Key Dates

- **Convergence trigger:** Carvana Q2 2026 earnings call — July 29, 2026 (scheduled, proven timing, 17 days away)
- **Falsification threshold:** <350 new-vehicle units/month average across all seven acquired stores by 2026-10-31
- **Thesis expiry:** Carvana Q2 2026 8-K (SEC EDGAR CIK 0001690820, expected late July 2026)

## Candidate Shortlist

| Rank | Ticker | Exposure Score | Direction | Notes |
|---|---|---|---|---|
| 1 | CVNA | 88 | Long | Primary expression — 100% business overlap with thesis mechanism |
| 2 | KMX | 72 | Long | Large-cap used-car peer, beneficiary of same digital shift |
| 3 | AN | 55 | Short | Traditional dealership group, harmed if Carvana's model scales |
| 4 | LAD | 52 | Short | Same harm vector as AN; less pure |
| 5 | STLA | 45 | Long | Partial beneficiary — Carvana is their fastest-growing franchise channel |
| 6 | ALLY | 38 | Long | Financing partner; indirect beneficiary |

## Notes

- Conviction checkpoints seeded via `scripts/screener_emit_checkpoints.py THS-SIG-20260711-b55e8917-v1`
- Board index refreshed (12 signals, 9 theses)
- `screener/ledger/theses/THS-SIG-20260711-b55e8917-v1.json` — confirmed present
- `screener/ledger/candidates/THS-SIG-20260711-b55e8917-v1.json` — confirmed present
