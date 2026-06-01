---
description: Aggregate the decision ledger into a performance + calibration summary — selected-vs-rejected basket spread, hit rate, confidence/probability calibration (Brier), per-module accuracy, and process metrics. Refuses to fake metrics on insufficient resolved history. Writes a dated decision_performance summary + calibration JSON.
argument-hint: [SCOPE]
allowed-tools: Read, Glob, Bash, Write
---

You are the **calibration engine** — the part of the system that makes it *learn*. The best forecasters are not the most accurate; they are the best **calibrated** and they **keep score** (Tetlock's superforecasters; Dalio's "pain + reflection = progress"). This command aggregates every decision record and its outcome reviews into a performance + calibration summary, so the engine can see whether its selected ideas beat its rejected ones and whether "70% confident" actually happens ~70% of the time.

It implements `frameworks/DECISION_LEDGER.md` **Phase 4** (cohort reporting) and the **§2 North Star metric** (Selected − Rejected basket return), plus the §9/§10 calibration discipline. It is the consumer end of the loop that `decision_record.json` (Phase 2) and `review-decisions` (Phase 3) feed.

**Hard discipline (CLAUDE.md §11):** calibration on a tiny sample is false precision. If there is insufficient **resolved** history, you must say so and **not** quote a Brier score or a basket spread — compute only what the data supports. You are READ-ONLY on all decision/review records; you write only a dated performance summary + calibration JSON (a *derived, regenerable* aggregate — not an immutable record). Arguments: `$ARGUMENTS`.

---

## 1. Resolve scope & gather the ledger

`$ARGUMENTS` is an optional `SCOPE`: empty/`all` → every decision record; a ticker → that ticker's records; `YYYY..YYYY` or a thesis-type token → filter accordingly (best-effort; default to `all`).

Discover with `Glob analyses/*/decision_record.json`. For each run, also gather (read-only): its review records `analyses/<run>/reviews/*_decision_review*.json`, and its audit reports if present — `verification_report.json`, `pre_mortem.json`, `expectations_gap.json`. Skip any decision record that fails to parse or lacks `ticker`/`decision`/`decision_date` (report why).

## 2. Build the ledger inventory

One row per decision: ticker, run_date, decision, basket (§3 mapping), confidence_score, data_sufficiency_score, thesis_type, plus the audit roll-up where present (verification verdict + integrity_score; pre-mortem verdict + confidence_haircut; expectations-gap direction + edge_score), and the count/status of its reviews.

## 3. Cohort performance (only where reviews with returns exist)

Per `DECISION_LEDGER` §2/§11, group decisions by basket (Selected / Rejected / Watchlist / Short / Insufficient) and compute, from the **review records** that carry returns:
- basket returns at each horizon (30/90/180/365d), benchmark- and sector-relative;
- **Selected − Rejected spread** (the North Star), and Selected − Watchlist;
- hit rate, false-positive rate (selected losers), false-negative rate (rejected winners).

Slice by thesis type and horizon where N allows. **If a basket has too few reviewed names to be meaningful (set a floor, e.g. < 5 reviewed decisions), do NOT quote its return — mark it "insufficient (N=k)."**

## 4. Calibration (only where resolved forecasts exist)

From resolved `forecast_results` across all review records:
- bucket each resolved forecast by its stated `CLAUDE.md` §10 probability band; compute the realized hit rate per band and a **reliability** read (is "Likely 60–75%" hitting ~60–75%?);
- compute a **Brier score** over resolved binary forecasts;
- **confidence calibration:** do higher-confidence *decisions* realize better outcomes than lower-confidence ones?

**Floor:** a Brier score or reliability curve needs a real sample (e.g. ≥ 10 resolved forecasts). Below it, report "insufficient resolved forecasts (N=k) — calibration not computed" rather than a misleading number.

## 5. Process metrics (computable now, no outcomes needed)

These need no realized returns and should always be computed when records exist:
- decision count; basket distribution; thesis-type distribution;
- average confidence and data-sufficiency scores;
- average verification integrity score; count of verify verdicts (Clean/Minor/Material/Failed);
- average pre-mortem confidence haircut; count of pre-mortem verdicts;
- edge-score distribution from expectations-gap;
- unsupported-claim / Material/Failed-verification rate (a leading quality signal even before outcomes).

## 6. Per-module calibration roll-up (§13)

Aggregate `module_calibration_notes` across review records → which module has been most predictive / most often missed the key variable, by sector / thesis type / horizon. If there are no reviews yet, state "pending first reviews."

## 7. Data-sufficiency verdict (§11)

State `n_decisions`, `n_reviews`, `n_resolved_forecasts`. Give an honest verdict:
- **Pre-data** — records exist but no/*too few* resolved reviews; report inventory + process metrics only.
- **Emerging** — some resolved history; report cohort/calibration with explicit small-N caveats.
- **Calibrated** — enough resolved history for reliable cohort spreads and a Brier score.

Never present cohort returns or calibration as reliable below the floors in §3/§4.

## 8. Write the outputs

Write a dated pair under `analyses/performance/` (create it): `<TODAY>_decision_performance_summary.md` (human-readable) and `<TODAY>_calibration_summary.json` (machine). `<TODAY>` = `date +%F`. These are derived/regenerable — a new date is a new snapshot; do not overwrite an existing dated file (use a `_v2` suffix if one already exists for today).

`calibration_summary.json` schema:

```
{
  "schema_version": "1.0",
  "generated_at": "",
  "scope": "",
  "n_decisions": null,
  "n_reviews": null,
  "n_resolved_forecasts": null,
  "inventory": [],
  "basket_distribution": {},
  "cohort_returns": {},
  "hit_rate": null,
  "selected_minus_rejected_pct": null,
  "calibration": {},
  "confidence_calibration": {},
  "process_metrics": {},
  "module_calibration": {},
  "data_sufficiency_note": "",
  "verdict": ""
}
```

Use `{}`/`null`/`"insufficient (N=k)"` for anything the data does not yet support. Validate: `python3 -m json.tool "<json_file>" >/tmp/calib_check.json`. Fix if invalid.

## 9. Human summary + git

Print: scope · N decisions / reviews / resolved forecasts · data-sufficiency verdict · the headline numbers that ARE supported (basket distribution, process metrics; cohort spread + Brier only if above the floor) · the single most useful read · output paths. Then commit straight to `main` (add only `analyses/performance/<TODAY>_*`), message `Calibrate ledger: <scope> — <verdict> (N=<n_decisions> decisions, <n_reviews> reviews)`, and push. Report the SHA.

---

## Hard rules

- **Never fake calibration.** Below the §3/§4 floors, report "insufficient (N=k)" — do not quote a Brier score or a basket spread that a tiny sample cannot support (§11).
- **Read-only on all decision/review records.** Writes only the dated `analyses/performance/` summary + JSON (derived, not an immutable record).
- **Process metrics are always honest to compute** (no outcomes needed) — surface them even pre-data, so the engine has a quality dashboard from day one.
- Grounded in `DECISION_LEDGER.md` §2/§9/§10/§11/§13; spawns no subagents; creates no dashboard/export layer (that is Phase 5).
