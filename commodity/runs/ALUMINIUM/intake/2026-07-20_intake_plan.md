# Commodity intake plan — ALUMINIUM — 2026-07-20

**Verdict: scoped_rerun**

Since the last finished run (`commodity/runs/ALUMINIUM/decision_record.json`, decided 2026-07-18),
2 new documents landed in the data pool. One clears the rerun bar; one does not.

## Summary

One tier-5 IAI production print (May 2026, direct from the primary body) confirms China's primary
aluminium run-rate is at 100.3% of the 45 Mt policy cap the decision record's deficit thesis depends
on — fresher than the AlCircle-routed figure the run cited, so it warrants re-running
`commodity-supply` and its downstream supply-demand synthesis and commodity-thesis. One tier-10
Yunnan curtailment news scan came back with 0 matches, which the connector itself flags as the
expected off-season baseline rather than new information, so it stays a monitoring watch item, not a
rerun trigger.

## New documents

| Document | Provider / Tier | As of | What it says | Materiality | Direction |
| --- | --- | --- | --- | --- | --- |
| `data/ALUMINIUM/external/iai/primary_production_2026-05-31.json` | IAI, tier 5 (paid API) | 2026-05-31 | China primary aluminium production 3,835 kt in May 2026 (world 6,159 kt) — an annualised run-rate of 45.15 Mt, 100.34% of the 45 Mt analyst-reference cap. The decision record's own IAI figure was routed via AlCircle and published 2026-01-26; this is a fresher, direct print. China YoY +2.24%. | 78 | positive (reinforces the deficit thesis) |
| `data/ALUMINIUM/external/google-news/yunnan_curtailment_scan_2026-07-20.json` | Google News, tier 10 (web, unverified) | 2026-07-20 | 30-day headline scan (3 queries) for Yunnan smelter curtailment / power rationing: 0 matches. The connector's own note calls this the expected off-season baseline (the dry-season window that matters is roughly Nov–Apr), not an all-clear. | 8 | neutral |

## Scoped rerun plan

| Module | Agent | Re-run | Why | Triggered by |
| --- | --- | --- | --- | --- |
| supply-demand | commodity-supply | `/commodity:rerun supply-demand commodity-supply ALUMINIUM` | Maps production by region from primary bodies; the fresh IAI print confirms the China 45 Mt cap is still binding, the structural pillar under the deficit thesis and the "China's binding 45 Mt cap" risk line. | `data/ALUMINIUM/external/iai/primary_production_2026-05-31.json` |

Proposed cascade (server recomputes authoritatively from the live DAG): `supply-demand` synthesis →
`commodity-thesis` synthesis (which writes `decision_record.json`). `market-structure` and
`macro-positioning` are unaffected by this document.

## Watch — not rerun

- `data/ALUMINIUM/external/google-news/yunnan_curtailment_scan_2026-07-20.json` — tier-10
  single-source web scan, null (0-match) result explicitly labelled the expected off-season
  baseline. Materiality 8 < gate of 60. Not a second independent source corroborating anything.
  Keep as a monitoring watch item for the Nov-2026 dry season — the decision record already lists a
  repeat Yunnan curtailment as a forward risk; re-scan closer to the Nov–Apr window.

---

No run was launched. No original document, module output, or `decision_record.json` was modified —
this plan only narrows attention for a future `/commodity:rerun`.
