# Intake plan — ALUMINIUM — 2026-07-20 (v2)

**Run root:** `commodity/runs/ALUMINIUM`
**Watermark:** `commodity/runs/ALUMINIUM/decision_record.json`
**Scanned at:** 2026-07-20T12:16:22Z

## Verdict: `scoped_rerun`

Three documents have landed since the finished run. A current LME COTR print (2026-07-10) directly
answers the decision record's own named highest-value data request — fund positioning is still net
long and essentially unchanged week-on-week, so the crowded-long risk persists rather than resolving,
and the macro-positioning module should be re-run to reflect it. A fresher direct-from-IAI China
production print (May 2026, already flagged in the prior intake plan and not yet re-run) confirms the
45 Mt policy cap is still binding at 100.3% of run-rate, warranting a commodity-supply re-run. A
Yunnan curtailment news scan came back with 0 matches, which is the expected off-season baseline, so
it stays a monitoring watch item only.

## New documents

| Document | Provider | Tier | As of | Materiality | Impact | Claim |
| --- | --- | --- | --- | --- | --- | --- |
| `external/lme/cotr_aluminium_2026-07-10.json` | LME | 5 | 2026-07-10 | 85 | mixed | Investment funds net long 131,005.79 lots (net_change_wow +250.56, essentially flat) — the fund long has not unwound since the Nov-2025 print the decision record called over eight months stale. |
| `external/iai/primary_production_2026-05-31.json` | IAI | 5 | 2026-05-31 | 78 | positive | China primary aluminium run-rate 45.15 Mt/yr, 100.34% of the 45 Mt policy-cap reference — fresher, direct-from-IAI vs. the AlCircle-routed figure the run cited. |
| `external/google-news/yunnan_curtailment_scan_2026-07-20.json` | Google News | 10 | 2026-07-20 | 8 | neutral | 0 matched headlines on Yunnan smelter curtailment in the last 30 days — the connector's own note flags this as the expected off-season baseline, not new information. |

## Scoped rerun plan

| Re-run | Module | Agent | Triggered by |
| --- | --- | --- | --- |
| `/commodity:rerun supply-demand commodity-supply ALUMINIUM` | supply-demand | commodity-supply | IAI primary-production print |
| `/commodity:rerun macro-positioning commodity-positioning-flows ALUMINIUM` | macro-positioning | commodity-positioning-flows | LME COTR print |

Both cascade to `commodity-thesis` (which writes `decision_record.json`) once their own module
synthesis re-runs.

## Watch (note only, no rerun)

- **Yunnan curtailment news scan** — tier-10, single-source, 0-match, explicitly the expected
  off-season baseline. Materiality 8 < gate (60). Keep watching into the Nov-2026 dry season; a
  matched headline there would warrant a fresh look, ideally corroborated by a second independent
  source before triggering a rerun.

---

No run was launched and no original document, module output, or `decision_record.json` was modified.
This plan only narrows and pre-fills what a human-approved `/commodity:rerun` would target.
