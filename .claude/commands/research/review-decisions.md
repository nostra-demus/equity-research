---
description: Review historical decision records and write append-only outcome review JSON files, each paired with a human-readable memo delta (what changed since the memo).
argument-hint: RUN_OR_TICKER_OR_DUE [WINDOW]
allowed-tools: Read, Write, Glob, Bash, WebSearch, WebFetch
---

You implement **Phase 3 of the decision-ledger feedback loop**. You review one or more existing `decision_record.json` files (emitted by the master synthesizer in Phase 2) and write **append-only** outcome review JSON files under each run folder.

`frameworks/DECISION_LEDGER.md` is the single source of truth. Read it first and follow it exactly:
- §7 — review windows and the questions each review answers
- §8 — the canonical outcome-review JSON schema and review-file path, **including the `memo_delta` block** (what changed since the memo) and its paired markdown
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

## 4. Resolve the review output paths (append-only)

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

The **paired memo-delta markdown** (§8) shares the basename: take the resolved review-JSON path and replace `_decision_review` with `_memo_delta` and `.json` with `.md` (any `_vN` suffix carries over) — e.g. `2026-07-01_30d_decision_review_v2.json` → `2026-07-01_30d_memo_delta_v2.md`.

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

## 11. Build the memo delta (`memo_delta`, §8)

Each review also answers: **"what changed since the original memo, and does it matter?"** — machine-readable in the review JSON's `memo_delta` block (schema: `DECISION_LEDGER.md` §8), human-readable in the paired markdown (Step 13). This is a **small update, not a re-run**: you compare new facts against the original memo; you never re-analyze, never update the financial model, never touch the originals.

- **The original memo** = `<RUN_ROOT>/memo.md` if present, else `final_thesis.md` (Part I plus its section headings).
- **Delta evidence, in `CLAUDE.md` §4 source order:**
  1. **Pool first.** Documents in the ticker's data pool (`data/<TICKER>/`) added or dated after `decision_date` — list them (`ls -lt data/<TICKER>/`), read the material ones, cite per §5. A pool source always beats a web source for the same fact.
  2. Newer run folders / module outputs for the same ticker, if any exist.
  3. The web-sourced outcome facts already gathered in Step 5 (price, benchmark, catalyst/risk outcomes) — already labelled source + date.
- Populate per §8:
  - `summary` — 2–4 sentences, the delta in plain English.
  - `thesis_delta_verdict` ∈ {`unchanged`, `strengthened`, `weakened`, `broken`, `too_early`}; it must not contradict `thesis_status`.
  - `changed_sections` — **material changes only**, each with: `section`, `original_claim`, `new_evidence`, `evidence_source` (a §5 citation **with a date** — required), `materiality_score` 0–100 (§12), `impact_direction`, `impacted_modules` (exact module folder names — discover the roster via Glob `.claude/agents/*/99_*-synthesis.md`, never guess a name), and when `rerun_recommended` is true, `rerun_reason` + an exact `rerun_command` (`/research:rerun <module> <agent> <TICKER>` for one orb; `/research:<module> <TICKER>` for a whole module). Recommend a re-run only when `materiality_score` ≥ 60 AND the change invalidates inputs that module relied on — not for every wiggle.
  - `stage_one_comment` — 100–200 words of **plain text** (no markdown), paste-ready for the Stage-One sheet: what changed, whether the thesis holds, what we would do.
  - `watch_items` — the specific things to watch before the next checkpoint (kill-criteria `monitor_via` fields, unresolved forecasts, pending catalysts). Note: `kill_criteria` exists in two shapes on disk — plain strings (older records) and structured objects with `condition`/`monitor_via`/`module_source` (newer) — handle both.
  - `management_questions` — 3–7 questions the delta raises for management or analysts.
  - `memo_delta_file` — the Step-4 markdown path (repo-relative).
- "Nothing material changed" / "too early" is a valid result — record it honestly with an empty `changed_sections` and keep everything SHORT. Never fabricate a delta.

## 12. Write the review JSON

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
  "module_calibration_notes": {},
  "memo_delta": {}
}
```

Fill: `ticker`, `original_decision_date` (= record `decision_date`), `review_date` (= `<TODAY>`), `review_window`, `original_decision` (= record `decision`), `basket` (= record `basket`), `entry_price` (= record `entry_price`, unchanged), the fields produced in Steps 5–10, and `memo_delta` = the full §8 block built in Step 11 (required for reviews filed on/after 2026-06-10). `lessons` is an array of short strings (the §7 answers, web-source labels, and the single most important takeaway).

Conventions (must hold): valid JSON; no markdown fences; no comments; no trailing commas; `null` for unknown numbers; `""` for unknown strings; `[]` for empty arrays; `{}` for empty objects. Never fabricate a value.

Write the file to the Step-4 output path with the Write tool (or a Bash heredoc if Write is unavailable), then validate:

```bash
python3 -m json.tool "<review_file>" >/tmp/review_check.json && echo "OK valid JSON" || echo "FAIL invalid JSON"
```

If validation fails, fix the content and rewrite before continuing. Do not commit an invalid review file.

## 13. Write the memo delta markdown

Write the paired markdown at the Step-4 memo-delta path — the human-readable tier of the SAME content. **Re-projection discipline:** no fact may appear here that is not in the review JSON. `CLAUDE.md` §21 plain English; every material claim cites source + date; target **2–3 pages, hard ceiling 4** (≤ ~1,600 words; the eval harness fails a delta above ~2,500 words). Structure:

```markdown
# <TICKER> Memo Delta — <REVIEW_DATE> (<WINDOW> review)

## 1. One-line verdict
Thesis status: <thesis_status> · Delta: <thesis_delta_verdict> · <the summary sentence>.

## 2. What changed since the original memo
New facts only, each with source + date. No generic market commentary unless it affects the thesis.

## 3. Did the original thesis play out?
What we expected · what actually happened · whether the stock moved for our reason or another reason (§10 luck-vs-skill).

## 4. Forecasts, catalysts, risks
Forecasts confirmed / falsified / still open; catalysts materialized / pending / delayed; risks materialized / not.

## 5. Section impact map
| Original section | Changed? | Materiality /100 | Why | Impacted module(s) | Re-run? |
One row per `changed_sections` entry; the Re-run column shows the exact `rerun_command`, or "no".

## 6. Stage-One sheet comment
The `stage_one_comment`, verbatim, as one paste-ready block.

## 7. Questions for management / analysts
The `management_questions` (3–7).

## 8. Watch before the next checkpoint
The `watch_items`, with dates where known.
```

Hard limits: do not update the financial model; do not restate the whole memo; do not change the original memo, thesis, or decision record. A "nothing material changed" delta is one page, not three.

## 14. Human-readable summary

After writing each review JSON + memo delta pair, print a short block:
- ticker
- run root
- review window
- review file path · memo delta file path
- thesis status · thesis delta verdict
- decision quality
- forecasts: counts of confirmed / falsified / expired / still open / not assessable
- changed sections: count, and how many carry a re-run recommendation (with the exact commands)
- the single key lesson
- confirmation that the original `decision_record.json` and `final_thesis.md` were NOT modified

If no records were due/found (e.g. mode `due` with nothing scheduled yet), say so plainly and exit without writing or committing anything.

## 15. Commit and push to main

Per repo `CLAUDE.md` git policy: commit straight to `main`. No branches. No PRs. Only `git add` the review files you created (never the original records):

```bash
bash scripts/commit-run.sh "Decision reviews: <N> review(s) on <REVIEW_DATE>" -- "analyses/*/reviews/*_decision_review*.json" "analyses/*/reviews/*_memo_delta*.md"
```

Capture and report the commit SHA from `git rev-parse HEAD`. If no review files were created, skip the commit entirely.

---

## Hard rules

- This command reads originals and writes only `analyses/<TICKER>_<DATE>/reviews/…_decision_review*.json` plus the paired `…_memo_delta*.md`. It never edits `decision_record.json`, `final_thesis.md`, `RUN_METADATA.md`, or any module output.
- Review files are append-only — existing reviews are never overwritten; collisions get a `_v2`, `_v3`, … suffix (Step 4); the memo delta carries the same suffix as its JSON.
- The memo delta is a comparison, not a re-run: it never updates the financial model and never re-does module work. A re-run is only ever a *recommendation*, named with its module(s) and exact command (`rerun_command`).
- The outcome-review schema and all doctrine come from `frameworks/DECISION_LEDGER.md`; this command does not redefine them.
- Web-sourced numbers are always labeled with source + date and treated as indicative/unverified; if they cannot be verified, the field is `null` with a caveat — the review is still created.
- This command spawns no subagents and creates no feedback-loop agent, dashboard, or cohort report (those are Phase 4/5).
