# Intake Plan — WHEAT — 2026-07-20

**Run root:** `commodity/runs/WHEAT` · **Watermark:** `decision_record.json` (finished 2026-07-13)
**Verdict: scoped_rerun**

## Summary

Two tier-5 official/vendor feeds landed since the WHEAT run finished. The CFTC COT print (data as of
2026-07-14) shows managed-money short covering accelerated sharply beyond what the positioning-flows
orb captured — net short narrowed from -60,432 contracts (2026-07-01) to -34,887 contracts. That's
material to the crowded-short / squeeze-risk read that orb and the macro-positioning synthesis lean
on, so it clears the materiality gate and scopes to the positioning-flows orb, cascading to the
macro-positioning synthesis and the terminal commodity-thesis. The NOAA CPC ONI update is a lagging
monthly average that only restates the El Nino signal the weather-seasonality orb already has from a
more current source — noted, but it does not clear the gate.

## New documents

| Document | Provider / Tier | As of | Claim | Materiality | Clears gate? |
|---|---|---|---|---|---|
| `data/WHEAT/external/cftc/cot_wheat_srw_2026-07-14.json` | CFTC, tier 5 | 2026-07-14 | Managed-money net position -34,887 contracts (76,020 long / 110,907 short), net_change_wow +25,545 — accelerated short covering vs the orb's 2026-07-01 read of -60,432 | 78 | Yes |
| `data/WHEAT/external/noaa-cpc/oni_2026-06-01.json` | NOAA CPC, tier 5 | 2026-06-01 | ONI AMJ 2026 anomaly +0.98 (el_nino state) — a monthly 3-month-average print | 25 | No |

## Scoped rerun plan

| Re-run | Why | Cascades to |
|---|---|---|
| `/commodity:rerun macro-positioning commodity-positioning-flows WHEAT` | Fresh CFTC COT print for the exact contract/metric this orb tables (managed-money net length); the new print shows continued-short-covering acceleration the orb's July 1 data didn't capture | macro-positioning synthesis, commodity-thesis (terminal) |

## Watch (noted, not scoped)

- `data/WHEAT/external/noaa-cpc/oni_2026-06-01.json` — materiality 25 < gate (60). The weather-seasonality
  orb already cites a more current NOAA/CPC ENSO diagnostic (2026-07-09, Niño-3.4 weekly +1.2°C, 81%
  probability of a very strong El Niño Oct–Dec) — this monthly ONI average only restates that read.
