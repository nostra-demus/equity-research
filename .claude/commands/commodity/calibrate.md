---
description: Aggregate the commodity swarm's reviewed decisions into a hit-rate/calibration scoreboard — the commodity-scoped Phase 4 twin of /research:calibrate. Refuses to quote a hit rate on insufficient resolved history. Writes a dated calibration summary JSON + MD.
argument-hint: (no arguments)
allowed-tools: Read, Bash
---

You are the commodity swarm's **calibration engine**. Aggregate immutable decisions and exact-date tactical/strategic reviews. Headline action accuracy counts a decision at most once; horizon observations separately score the forecast distributions. Legacy reviews without valid probabilities never enter probability calibration.

The math is owned by a deterministic script so the numbers are exact and reproducible — a scoreboard is never re-derived in prose (which drifts). Your job is to run it, commit its output, and read the result back in plain English. No arguments.

## 1. Run the deterministic scoreboard

```
python3 scripts/commodity_calibrate.py --print
```

The script reads every immutable `commodity/runs/<COMMODITY>/decisions/<DECISION_ID>/decision_record.json`, legacy top-level fallback records, and append-only reviews — read-only. It writes the dated pair under `commodity/performance/`. It computes, each **withheld below its own floor**:

- **hit_rate** — vindicated / (vindicated + contradicted) across every commodity's resolved `action_outcome`s, gated at `MIN_DECISIVE` (10);
- **calibration_by_commodity** — a per-commodity `{hit_rate, n}` slice, gated at `MIN_SLICE_N` (5) — this is the slice the next thesis on that commodity checks before it can be flagged;
- **directional accuracy, mean absolute error, bias, multiclass Brier score, CRPS, range misses and maximum adverse excursion** from validated version-2 horizon reviews;
- the same forecast metrics by commodity, profile-owned family and horizon, with separate sample floors;
- the always-honest flat tallies — `error_taxonomy_distribution` (§20) and `decision_quality_distribution` (§10 luck-vs-skill) — counts, not rates, populated at any N.

The script reports unique decision count and horizon-observation count separately. Two horizons from one decision never become two headline calls. It reports how many legacy or malformed-probability reviews were excluded.

Do **not** compute or estimate any metric yourself, and do not "fill in" a value the script left `null` — the script owns the math and the small-N refusal.

## 2. Commit the output (DATA → main, per CLAUDE.md §25)

The calibration summary is a derived, regenerable aggregate (not immutable), so it commits straight to `main` via the serialized helper. Pass **only the two exact paths the script just printed** as `WROTE …` — never the whole `commodity/performance/` directory, so a concurrent in-flight output is never swept into this commit (§28 — `commit-run.sh` stages only the pathspecs it is handed):

```
bash scripts/commit-run.sh "Commodity calibrate: $(date +%Y-%m-%d)" -- <the two WROTE paths, e.g. commodity/performance/<TODAY>_calibration_summary.json commodity/performance/<TODAY>_calibration_summary.md>
```

Report the commit SHA.

## 3. Report in plain English (§21)

Read the printed JSON and say:
- the **verdict** line and the **honesty_statement**, verbatim in spirit;
- the counts — decisions, reviews filed, decisive vs too_early/partial/not_applicable;
- the hit rate IF it is above floor, else say how many decisive resolved calls exist vs the `MIN_DECISIVE` floor;
- every commodity whose `calibration_by_commodity` slice is a real `{hit_rate, n}` (not `"insufficient..."`) — name the commodity and its number;
- the overall forecast-calibration metrics when above their floor, plus every actionable commodity/family/horizon slice;
- the horizon-observation count and probability-exclusion count, explicitly distinguishing both from unique headline decisions;
- the leading `error_taxonomy_distribution` / `decision_quality_distribution` tag(s) if any count ≥ 2 — the one concrete "why the engine is wrong" read even in a Pre-data run, never gated by the floor.

## Hard rules

- **The script owns the math and the small-N refusal.** An honest empty scoreboard is the correct output until `/commodity:review` has resolved enough calls — never quote a hit rate the script left withheld.
- **Read-only on all decision/review records.** The command writes only the dated `commodity/performance/` pair (via the script) — a derived aggregate, not an immutable record.
- Grounded in `frameworks/DECISION_LEDGER.md` §9/§10/§11/§18/§20, applied to the commodity swarm's own schemas; spawns no subagents; creates no dashboard/export layer.
