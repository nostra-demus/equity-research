---
description: Review historical decision records and write append-only outcome review JSON files.
argument-hint: RUN_OR_TICKER_OR_DUE [WINDOW]
allowed-tools: Read, Write, Glob, Bash, WebSearch, WebFetch
---

You implement **Phase 3 of the decision-ledger feedback loop**. You review one or more existing `decision_record.json` files (emitted by the master synthesizer in Phase 2) and write **append-only** outcome review JSON files under each run folder.

`frameworks/DECISION_LEDGER.md` is the single source of truth. Read it first and follow it exactly:
- §7 — review windows and the questions each review answers
- §8 — the canonical outcome-review JSON schema and review-file path
- §10 — separating price outcome from thesis outcome (luck vs skill)
- §12 — error taxonomy (also `CLAUDE.md` §20)
- §13 — module calibration notes

Do not invent a parallel review framework. Do not change any schema. The arguments are `$ARGUMENTS`.

**Inviolable rules (repeated from `DECISION_LEDGER.md` §4/§8):**
- NEVER edit, overwrite, or re-emit `decision_record.json`.
- NEVER edit `final_thesis.md` or any original module output.
- Review files are **append-only**: a new review never overwrites an existing one.
- You own the git commit; do not ask agents/subagents to write anything (this command spawns none).

Execute the steps below in order.

---

## 1. Parse arguments and select a mode

`$ARGUMENTS` is `RUN_OR_TICKER_OR_DUE [WINDOW]`. Split into the first token (`<TARGET>`) and an optional second token (`<WINDOW_ARG>`).

Classify `<TARGET>` into a mode (choose the safest interpretation; do not prompt the user unless truly impossible to resolve):

- `<TARGET>` is empty → **mode `due`** (safest: act only on what is scheduled and unreviewed).
- `<TARGET>` == `due` → **mode `due`**.
- `<TARGET>` == `all` → **mode `all`**.
- `<TARGET>` starts with `analyses/`, contains a `/`, or is an existing directory → **mode `run`** (explicit run root). Strip any trailing slash.
- otherwise → **mode `ticker`** (treat `<TARGET>` as a ticker symbol).

`<WINDOW_ARG>`, if present, must be one of: `30d`, `90d`, `180d`, `365d`, `24m`, `36m`, `ad-hoc`, `post-mortem` (§7/§8). If it is anything else, ignore it and warn.

Resolve `<TODAY>` once: `date +%F` → `YYYY-MM-DD`.

## 2. Discover decision records

Always discover via Glob `analyses/*/decision_record.json`, then narrow by mode:

- **mode `run`:** use exactly `<TARGET>/decision_record.json`.
- **mode `ticker`:** pick the latest run via `ls -1 analyses/<TARGET>_*/decision_record.json 2>/dev/null | sort -r | head -n 1` (the `YYYY-MM-DD` in the path sorts correctly). If none, STOP and report "No decision record found for ticker `<TARGET>`."
- **mode `all`:** every `analyses/*/decision_record.json` from the Glob.
- **mode `due`:** every `(run_root, window)` pair whose `review_schedule[window]` date is `<= <TODAY>` AND has no existing review file for that window (see the helper in Step 3).

**Validate each candidate record.** Read the JSON and confirm it parses and contains: `schema_version`, `ticker`, `decision_date`, `decision`, `review_schedule`, `forecast_ledger`, `run_root`, `final_thesis_path`. If a candidate fails to parse or is missing any of these, **skip it** and record the reason in the final summary. Do not attempt to repair `decision_record.json`.

## 3. Determine the review window(s) for each record

- If `<WINDOW_ARG>` was provided (mode `run` / `ticker`): use it.
- mode `due`: each due, unreviewed scheduled window produced by the helper below is its own review.
- mode `all` with no window: for each record, choose the **earliest due unreviewed** scheduled window; if none is due, use `ad-hoc`.
- single record (mode `run` / `ticker`) with no window: same rule — earliest due unreviewed scheduled window, else `ad-hoc`.

Recommended discovery + due/duplicate check (run via Bash; deterministic, no overwrite risk):

```bash
python3 - <<'PY'
import json, glob, os, subprocess
today = subprocess.check_output(["date","+%F"]).decode().strip()
def isdate(s):
    return isinstance(s,str) and len(s)==10 and s[4]=='-' and s[7]=='-'
for f in sorted(glob.glob("analyses/*/decision_record.json")):
    try:
        d = json.load(open(f))
    except Exception as e:
        print("SKIP invalid_json", f, str(e)[:80]); continue
    req = ["schema_version","ticker","decision_date","decision","review_schedule","forecast_ledger","run_root","final_thesis_path"]
    miss = [k for k in req if k not in d]
    if miss:
        print("SKIP missing_fields", f, ",".join(miss)); continue
    rr = d.get("run_root") or os.path.dirname(f)
    sched = d.get("review_schedule") or {}
    for w, dt in sched.items():
        if not isdate(dt): 
            continue
        due = dt <= today
        existing = glob.glob(os.path.join(rr, "reviews", "*_%s_decision_review*.json" % w))
        status = "DUE" if (due and not existing) else ("REVIEWED" if existing else "NOT_DUE")
        print(status, rr, w, dt, "today="+today)
PY
```

Use the `DUE` lines to drive mode `due`. `REVIEWED` windows are skipped (append-only — never re-review the same window unless the user explicitly asks with an explicit window, in which case Step 4 versions the file).

## 4. Resolve the review output path (append-only)

Per `DECISION_LEDGER.md` §8, the review path is:

```
analyses/<TICKER>_<DATE>/reviews/<REVIEW_DATE>_<WINDOW>_decision_review.json
```

where `analyses/<TICKER>_<DATE>` = the record's `run_root`, `<REVIEW_DATE>` = `<TODAY>`, `<WINDOW>` = the resolved window.

- `mkdir -p "<RUN_ROOT>/reviews"`.
- If `<REVIEW_DATE>_<WINDOW>_decision_review.json` does **not** exist → that is the output path.
- If it **already exists**, DO NOT overwrite. Use the next available suffix: `<REVIEW_DATE>_<WINDOW>_decision_review_v2.json`, then `_v3`, etc. Find the next free suffix with Bash, e.g.:

```bash
base="<RUN_ROOT>/reviews/<REVIEW_DATE>_<WINDOW>_decision_review"
out="${base}.json"; n=2
while [ -e "$out" ]; do out="${base}_v${n}.json"; n=$((n+1)); done
echo "$out"
```

## 5. Gather review evidence

For each record being reviewed, Read:
- the original `decision_record.json` (read-only),
- the original `final_thesis.md` at `final_thesis_path` (read-only — for Part I, the catalyst calendar, risk register, kill criteria),
- `<RUN_ROOT>/RUN_METADATA.md` if present.

Pull from the decision record: `decision`, `basket`, `entry_price`, `entry_price_source`, `entry_price_timestamp`, `benchmark`, `sector_benchmark`, `time_horizon`, `forecast_ledger`, `kill_criteria`, `red_flags`, `missing_data`, `notes`, `decision_date`.

**Price / return handling:**
- **If `entry_price` is `null`:** do NOT compute a return and do NOT fake a paper trade. Keep `review_price`, `absolute_return_pct`, `benchmark_return_pct`, `sector_return_pct`, and both relative-return fields `null`. Still review thesis status, forecast status, missing data, and process quality. Note in `lessons` that no entry price existed so price-quality is not assessable (consistent with the original record's missing-price caveat).
- **If `entry_price` exists:** attempt to gather, via WebSearch/WebFetch, a current/review price for the ticker as of `<REVIEW_DATE>`, plus benchmark and sector-benchmark total returns over the same window. Compute:
  - `absolute_return_pct` = (review_price − entry_price) / entry_price × 100
  - `benchmark_relative_return_pct` = `absolute_return_pct` − `benchmark_return_pct`
  - `sector_relative_return_pct` = `absolute_return_pct` − `sector_return_pct`
  - For a Short basket, the paper return is inverse; for Watchlist/Rejected/Insufficient baskets, track opportunity cost (no executed paper trade), per §3/§11.
  - **Label every web-sourced value** with its source and date in `lessons` (e.g. "review price $X via <source>, <date>, indicative/unverified"). If a value cannot be verified, set that field `null` and explain in `lessons`; never publish an unsourced number.

Use WebSearch/WebFetch ONLY for current/review prices, benchmark/sector returns, or specific outcome facts (did the catalyst happen, did the risk materialize). If web access is unavailable, the review is **still created** with `null` return fields and a clear caveat in `lessons` plus an entry in the record's-gaps narrative.

## 6. Resolve forecasts (`forecast_results`)

For each item in the record's `forecast_ledger`, produce one `forecast_results` entry classifying its `status` as one of:
- `confirmed`
- `falsified`
- `expired`
- `still open`
- `not assessable`

Judge using the forecast's `time_window`, `confirmation_trigger`, `falsification_trigger`, and `evidence_today` against what is now known. Do not force a result if the review date is too early or evidence is missing — use `still open` (window not elapsed) or `not assessable` (no evidence), with a one-line reason. Each `forecast_results` element should carry: the prediction (or a short reference to it), the resolved `status`, the `evidence` used, and an `as_of` date.

## 7. Classify thesis status (`thesis_status`)

One of: `on-track`, `at-risk`, `confirmed`, `broken`, `expired` (§8). Base it on the original thesis, the kill criteria (did any trigger?), the forecast results, catalyst/risk evidence, the decision-record `notes`, and `final_thesis.md` Part I. Answer the §7 review questions in `lessons`.

- `catalyst_results`: for each catalyst in the thesis's catalyst calendar, mark materialized / not / pending with evidence.
- `risk_results`: for each Critical/High risk or red flag, mark materialized / not / pending with evidence.

## 8. Separate price outcome from thesis outcome (`decision_quality`)

Follow `DECISION_LEDGER.md` §10. Classify `decision_quality` as one of:
- `skill` — price right and thesis right
- `luck` — price right but thesis wrong
- `good process / bad luck or too early` — price wrong but thesis still right
- `genuine miss` — price wrong and thesis wrong
- `not assessable` — insufficient data or no entry price

If `entry_price` is `null`, default `decision_quality` to `not assessable` (no price outcome to judge), but still complete `thesis_status`, forecasts, and process review.

## 9. Error taxonomy (`error_taxonomy`)

Populate `error_taxonomy` **only** if the call went wrong, or the thesis is `broken`/`at-risk` for a process reason. Otherwise leave it `[]`. Use the taxonomy from `CLAUDE.md` §20 + `DECISION_LEDGER.md` §12:
`missing data`, `stale data`, `bad source`, `bad extraction`, `bad math`, `bad base rate`, `bad causal inference`, `management deception`, `exogenous shock`, `timing error`, `valuation multiple error`, `ignored red flag`, `false positive`, `false negative`, `thesis drift`, `catalyst delay`, `beta confusion`.

A `not assessable` or `on-track`/`confirmed` review with a sound process should have an empty `error_taxonomy`.

## 10. Module calibration notes (`module_calibration_notes`)

Populate `module_calibration_notes` as a JSON object (§13). Address, where evidence allows:
- which module was **most responsible** for the original decision (from `module_scores` / the thesis);
- which module looks **most accurate** so far;
- which module **missed the key variable**, if any;
- whether **valuation / earnings / governance / balance-sheet-survival / business-quality** mattered most to the realized outcome;
- whether `confidence_score` / `data_sufficiency_score` should have been higher or lower in hindsight.

If there is not enough evidence yet (e.g. an early `30d` review), say so explicitly in the object rather than guessing.

## 11. Write the review JSON

Use the **exact** outcome-review schema from `DECISION_LEDGER.md` §8 (do not drift; extra fields only if clearly useful):

```
{
  "schema_version": "1.0",
  "ticker": "",
  "original_decision_date": "",
  "review_date": "",
  "review_window": "",
  "original_decision": "",
  "basket": "",
  "entry_price": null,
  "review_price": null,
  "absolute_return_pct": null,
  "benchmark_return_pct": null,
  "sector_return_pct": null,
  "benchmark_relative_return_pct": null,
  "sector_relative_return_pct": null,
  "thesis_status": "",
  "forecast_results": [],
  "catalyst_results": [],
  "risk_results": [],
  "decision_quality": "",
  "error_taxonomy": [],
  "lessons": [],
  "module_calibration_notes": {}
}
```

Fill: `ticker`, `original_decision_date` (= record `decision_date`), `review_date` (= `<TODAY>`), `review_window`, `original_decision` (= record `decision`), `basket` (= record `basket`), `entry_price` (= record `entry_price`, unchanged), and the fields produced in Steps 5–10. `lessons` is an array of short strings (the §7 answers, web-source labels, and the single most important takeaway).

Conventions (must hold): valid JSON; no markdown fences; no comments; no trailing commas; `null` for unknown numbers; `""` for unknown strings; `[]` for empty arrays; `{}` for empty objects. Never fabricate a value.

Write the file to the Step-4 output path with the Write tool (or a Bash heredoc if Write is unavailable), then validate:

```bash
python3 -m json.tool "<review_file>" >/tmp/review_check.json && echo "OK valid JSON" || echo "FAIL invalid JSON"
```

If validation fails, fix the content and rewrite before continuing. Do not commit an invalid review file.

## 12. Human-readable summary

After writing each review JSON, print a short block:
- ticker
- run root
- review window
- review file path
- thesis status
- decision quality
- forecasts: counts of confirmed / falsified / expired / still open / not assessable
- the single key lesson
- confirmation that the original `decision_record.json` and `final_thesis.md` were NOT modified

If no records were due/found (e.g. mode `due` with nothing scheduled yet), say so plainly and exit without writing or committing anything.

## 13. Commit and push to main

Per repo `CLAUDE.md` git policy: commit straight to `main`. No branches. No PRs. Only `git add` the review files you created (never the original records):

```bash
git add analyses/*/reviews/*_decision_review*.json
git commit -m "Decision reviews: <N> review(s) on <REVIEW_DATE>"
git push origin main
```

Capture and report the commit SHA from `git rev-parse HEAD`. If no review files were created, skip the commit entirely.

---

## Hard rules

- This command reads originals and writes only `analyses/<TICKER>_<DATE>/reviews/…_decision_review*.json`. It never edits `decision_record.json`, `final_thesis.md`, `RUN_METADATA.md`, or any module output.
- Review files are append-only — existing reviews are never overwritten; collisions get a `_v2`, `_v3`, … suffix (Step 4).
- The outcome-review schema and all doctrine come from `frameworks/DECISION_LEDGER.md`; this command does not redefine them.
- Web-sourced numbers are always labeled with source + date and treated as indicative/unverified; if they cannot be verified, the field is `null` with a caveat — the review is still created.
- This command spawns no subagents and creates no feedback-loop agent, dashboard, or cohort report (those are Phase 4/5).
