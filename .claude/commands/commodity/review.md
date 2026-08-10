---
description: Review a commodity's decision_record.json against what actually happened — the commodity swarm's twin of /research:review-decisions. Writes an append-only decision review JSON.
argument-hint: COMMODITY_OR_DUE [WINDOW]
allowed-tools: Read, Write, Glob, Bash, WebSearch, WebFetch
---

You implement the commodity swarm's learning loop — the twin of `frameworks/DECISION_LEDGER.md` Phase 3 (`/research:review-decisions`). Fresh archived decisions carry independent tactical and strategic forecasts. Review each horizon once, on its exact target date, against implementable total return. Legacy records retain their original 30d/90d/180d/365d path. Write **append-only** outcome-review JSON files beside the run.

`frameworks/commodity/decision_review.schema.json` is the canonical schema — read it first. Reuse, do not reinvent, the doctrine it already carries: `DECISION_LEDGER.md` §7 (review cadence), §10 (luck vs skill), §12 (error taxonomy, also `CLAUDE.md` §20). Do not invent a parallel schema or a parallel review framework.

**Why this command exists.** `CLAUDE.md` §19 says a forecast that cannot be checked later is not a forecast. A fresh commodity decision is one headline call with two horizon observations. Review both, but never count them as two independent headline calls.

**Inviolable rules:**
- NEVER edit, overwrite, or re-emit `decision_record.json`, `99_commodity-thesis-synthesis.md`, or any other module output.
- Review files are **append-only**: a new review never overwrites an existing one.
- You own the git commit; this command spawns no subagents.
- No fabricated numbers. A price, return, or evidence claim you cannot verify is `null`/empty with a caveat in `notes`, never guessed.

Execute the steps in order. Arguments: `$ARGUMENTS`.

---

## 1. Parse arguments and select a mode

`$ARGUMENTS` is `COMMODITY_OR_DUE [WINDOW]`. Split into `<TARGET>` and an optional `<WINDOW_ARG>`.

- `<TARGET>` empty, or `due` → **mode `due`** (safest — act only on what is scheduled and unreviewed).
- `<TARGET>` == `all` → **mode `all`**.
- otherwise → **mode `commodity`**, treating `<TARGET>` as the commodity id (upper-cased to match `^[A-Z0-9_]+$`).

`<WINDOW_ARG>`, if present, must be one of `tactical` / `strategic` / `30d` / `90d` / `180d` / `365d` / `ad-hoc`. Anything else: ignore and warn. Fresh archived decisions accept only `tactical` or `strategic`; the dated windows are legacy-only.

Resolve `<TODAY>` once: `date +%F`.

## 2. Discover immutable decisions

Glob `commodity/runs/*/decisions/*/decision_record.json` first. A fresh candidate must parse and carry `swarm == "commodity"`, a matching `decision_id`, `commodity`, `decision_date`, `action`, and `forecast_horizons`. The archive is the grading source; never use the mutable top-level UI projection for a fresh review. If a run has no valid archived dual-horizon decision, fall back to its legacy top-level `decision_record.json` and the old cadence.

Narrow by mode after discovery. In `due`, use every decision/horizon pair Step 3 marks `DUE`. In `commodity` and `all`, include only matching commodities. A supplied window filters the emitted pairs.

## 3. Compute exact horizon due dates

For fresh archives, the due date is stored in each assessable horizon's `target_date`; do not derive it from the current top-level record and do not round it to a standard checkpoint. A `not_assessable` horizon has no probabilistic outcome to grade and is skipped. Match an existing fresh review by `decision_id` plus `forecast_horizon`, not filename or commodity alone:

```bash
python3 - <<'PY'
import json, glob, os, datetime, sys
sys.path.insert(0, "scripts")
from validate_screener_json import Checker, check_commodity_review_anchors
today_d = datetime.date.today()            # platform-independent; no `date` subprocess
today = today_d.isoformat()
schema = json.load(open("frameworks/commodity/decision_review.schema.json"))
review_files = glob.glob("commodity/runs/*/reviews/*_decision_review*.json")
reviews = []
for path in review_files:
    try:
        value = json.load(open(path))
        checker = Checker(schema); checker.check(schema, value, "")
        if isinstance(value, dict) and not checker.errors and not check_commodity_review_anchors(path):
            reviews.append(value)
        else:
            print("INVALID_REVIEW_DOES_NOT_SUPPRESS_DUE", path)
    except Exception: pass
fresh_commodities = set()
for f in sorted(glob.glob("commodity/runs/*/decisions/*/decision_record.json")):
    try:
        d = json.load(open(f))
        decision_id, commodity = d["decision_id"], d["commodity"]
        if os.path.basename(os.path.dirname(f)) != decision_id or d.get("swarm") != "commodity": raise ValueError("identity")
        fresh_commodities.add(commodity)
        for name in ("tactical", "strategic"):
            horizon = d.get("forecast_horizons", {}).get(name, {})
            if horizon.get("status") != "assessable":
                print("SKIP_NOT_ASSESSABLE", commodity, decision_id, name); continue
            target = datetime.date.fromisoformat(horizon["target_date"])
            existing = any(r.get("schema_version") == "2.0" and r.get("decision_id") == decision_id and r.get("forecast_horizon") == name for r in reviews)
            status = "REVIEWED" if existing else ("DUE" if target <= today_d else "NOT_DUE")
            print(status, commodity, decision_id, name, target.isoformat(), "today="+today)
    except Exception as e:
        print("SKIP invalid_archive", f, str(e)[:80])

# Legacy fallback only where no fresh archived decision exists.
WINDOWS = {"30d": 30, "90d": 90, "180d": 180, "365d": 365}
for f in sorted(glob.glob("commodity/runs/*/decision_record.json")):
    try:
        d = json.load(open(f)); commodity = d["commodity"]
        if commodity in fresh_commodities: continue
        decision_date = datetime.date.fromisoformat(d["decision_date"])
        for name, offset in WINDOWS.items():
            target = decision_date + datetime.timedelta(days=offset)
            existing = any(r.get("schema_version") == "1.0" and r.get("commodity") == commodity and r.get("original_decision_date") == d["decision_date"] and r.get("review_window") == name for r in reviews)
            status = "REVIEWED" if existing else ("DUE" if target <= today_d else "NOT_DUE")
            print(status, commodity, "legacy", name, target.isoformat(), "today="+today)
    except Exception as e:
        print("SKIP invalid_legacy", f, str(e)[:80])
PY
```

Use only `DUE` lines in mode `due`. `REVIEWED` pairs are skipped. Fresh horizons are never reviewed early or as `ad-hoc`: exact target-date outcomes are the calibration observations. The legacy fallback retains its earlier `ad-hoc` behavior only when explicitly requested.

## 4. Resolve the review output path (append-only)

```
commodity/runs/<COMMODITY>/reviews/<REVIEW_DATE>_<WINDOW>_decision_review.json
```

`mkdir -p "commodity/runs/<COMMODITY>/reviews"`. If the target path exists, do not overwrite — use `_v2`, `_v3`, … (find the next free suffix with Bash, same pattern as `/research:review-decisions.md` Step 4).

## 5. Gather the review price and level checks

For a fresh review, read only `commodity/runs/<COMMODITY>/decisions/<DECISION_ID>/decision_record.json`. Copy `current_price` into `reference_price`, and select exactly one assessable `forecast_horizons.<HORIZON>` object. Write schema `2.0`, `decision_id`, `forecast_horizon`, `review_window` equal to that horizon name, and copy its exact `target_date`. Set `outcome_as_of` to that same date. Legacy reviews continue to read their top-level record and write schema `1.0`.

Two distinct action/confidence values, kept separate — do NOT conflate them:

- **Frozen anchors → the review's `original_action` / `original_confidence` fields.** These are copied **verbatim from the record's own `action` / `confidence`** (the raw, pre-cap fields), never from the post-mortem fields. `scripts/validate_screener_json.py` **requires** `review.original_action == record.action` and `review.original_confidence == record.confidence`; writing the post-mortem values here makes the review fail validation, so the frozen anchor stays raw — it records what the swarm originally published.
- **Effective graded call → used only in Step 8's outcome table and Step 9, never written into a schema field.** For grading, **prefer `post_mortem_action` / `post_review_confidence_score` when present**, else fall back to `action` / `confidence`. A completed finish-gate pre-mortem (`commodity:full` step 5.5 / `commodity:rerun` step 6.5) can cap the original call to a more cautious action and a lower confidence — grading against the pre-cap `action` would credit or fault a call the engine no longer actually stands behind. This is a grading input, not a stored field: note in `notes` when the graded action differs from `original_action` (i.e. a cap fired). Mirrors `scripts/calibrate.py`'s `basket_of()`/`confidence_of()` preference for the research swarm (fix F28), which likewise reads the capped value for grading while the frozen record keeps its raw fields.

Use WebSearch/WebFetch to measure the benchmark at the **exact `target_date` cutoff**, from a source at or above the tier the original run cited. The review may be filed later. `outcome_as_of` remains the exact target date; `review_price.as_of` is the latest official close/settlement on or before that cutoff. It may be up to four calendar days earlier only for a documented weekend/market closure and can never be later. Do not silently substitute today's price. A fresh review without a verifiable cutoff price and implementable-return components is not filed or calibrated; report the unresolved pair and leave it due. A legacy review may retain the schema-1.0 null-price behavior.

Compute, where `review_price.value` is known:
- `absolute_return_pct` = `(review_price.value − reference_price.value) / reference_price.value × 100`.
- For schema 2.0, write `realized_return_components_pct`: that price return plus realised roll return, collateral return, fees and FX adjustment for the implementable benchmark named in the decision. Their arithmetic sum is `implementable_return_pct`. For all five inputs, `realized_return_component_sources` must carry the exact provider, stable dataset/series IDs, sha256 vintage ID, observation date, publication/retrieval timestamps and calculation basis. Observation and publication may not be after the target cutoff; retrieval may not be after the review date. Never treat spot price return as implementable total return or use a later revised vintage.
- For schema 2.0, write `max_adverse_excursion_pct`, the worst implementable return reached from the anchor through the target date, plus the same structured point-in-time identity in `max_adverse_excursion_source`. It is non-positive and cannot be better than a negative final return.
- Set `scenario_outcome` to the archived bear/base/bull scenario whose `implementable_return_pct` is closest to the realised implementable return; ties resolve bear, then base, then bull. Set `range_miss` to `below`, `inside`, or `above` from the minimum and maximum archived scenario returns.
- `price_vs_levels.support_breached` = review_price closed below `key_levels.support` at any point in the window (best-effort from available data — a single spot check if that is all that is findable; say so in `detail`).
- `price_vs_levels.resistance_breached` = analogous, above `key_levels.resistance`.
- `price_vs_levels.within_fair_value_range` = whether `review_price.value` sits inside `key_levels.fair_value_range` (best-effort parse of that free-text range; `null` if unparseable, with `detail` explaining why).

## 6. Resolve risk results

For each entry in the original `key_risks[]`, produce one `risk_results` item: `status` ∈ `materialized` / `not_materialized` / `partial` / `pending` (pending = window too short to tell), with a one-line `evidence` citation (source + date, or "no new evidence found as of `<REVIEW_DATE>`").

## 7. Classify thesis status

`thesis_status` ∈ `on-track` / `at-risk` / `confirmed` / `broken` / `expired`, based on `thesis_summary`, the risk results, and the price/level checks. This is the input `action_outcome` (Step 8) depends on — do not skip ahead.

## 8. Classify the action outcome

Read this table **in order** (first match wins), same discipline as `DECISION_LEDGER.md` §8's `pre_mortem_check.outcome_vs_verdict` table. "`action`" below is the Step 5 value (`post_mortem_action` when present, else the record's own `action`) — grade the call the engine actually stood behind, not a pre-cap call it no longer holds:

| `action` | Condition | `action_outcome` |
|---|---|---|
| `Research More` | genuinely new primary data landed since `decision_date` that would let the swarm re-run to a real verdict | `vindicated` (the call to wait was right — there was real information still missing) |
| `Research More` | no new data landed, or a directional call could have been made just as well with what already existed | `contradicted` |
| `Buy` | `support_breached` and/or `thesis_status` is `broken` | `contradicted` (a broken thesis is not vindicated by a price that merely rose — §24/§10: luck at best, not skill — so this row is tested BEFORE the price-rose row below) |
| `Buy` | price rose materially and/or `thesis_status` is `confirmed` | `vindicated` |
| `Avoid` / `Trim` | price fell materially and/or a flagged key risk `materialized` | `vindicated` |
| `Avoid` / `Trim` | price rallied through `resistance_breached` with no key risk materializing | `contradicted` |
| `Hold` | price stayed within the `key_levels` range and `thesis_status` is `on-track`/`confirmed` | `vindicated` (a `Hold` predicts stability — staying in range over the window IS the call playing out) |
| `Hold` | price broke decisively through `support`/`resistance` in a way `Buy`/`Avoid` would have captured and `Hold` missed | `contradicted` |
| any | `thesis_status` is `on-track` and nothing above resolved (a directional call whose price has not yet moved) | `too_early` |
| anything not cleanly matched above | — | `partial`, and explain the split in `notes` |

"Materially" is a judgment call, not a fixed percentage — anchor it to the specific commodity's own recent volatility (visible in the original run's `market-structure` output if still on disk) rather than a generic threshold. Never force `vindicated`/`contradicted` past what the evidence actually shows; `too_early`/`partial` are honest, valid outcomes.

## 9. Decision quality (luck vs skill)

`decision_quality` per `DECISION_LEDGER.md` §10, applied to price outcome vs `thesis_status`:
- `skill` — price outcome and thesis right together.
- `luck` — price outcome favorable but the thesis reasoning was wrong (`action_outcome: contradicted` paired with a favorable price move, or vice versa).
- `good process / bad luck or too early` — thesis sound, price hasn't followed / horizon too short.
- `genuine miss` — both wrong.
- `not assessable` — insufficient data (e.g. no verifiable review price).

## 10. Error taxonomy

Populate `error_taxonomy` **only** when the call went wrong (`action_outcome: contradicted`, or `thesis_status` ∈ `at-risk`/`broken` for a process reason). Use the closed list in `decision_review.schema.json` (`CLAUDE.md` §20 / `DECISION_LEDGER.md` §12). Otherwise leave `[]`.

## 11. Write the review JSON

Follow `frameworks/commodity/decision_review.schema.json` exactly. Fresh reviews use version 2.0 and must include the immutable decision/horizon identity, exact target-date identity, six realised return components with sources, maximum adverse excursion with its source, nearest scenario outcome and range miss. Legacy reviews remain version 1.0. `lessons` is an array of short strings; `notes` carries boundary-case justification and source caveats.

Validate before continuing:

```bash
python3 -m json.tool "<review_file>" >/tmp/commodity_review_check.json && echo "OK valid JSON" || echo "FAIL invalid JSON"
python3 scripts/validate_screener_json.py frameworks/commodity/decision_review.schema.json "<review_file>"
```

Fix and rewrite if either fails. Do not commit an invalid or non-conformant review file.

## 12. Human-readable summary

Print: commodity · decision ID (or legacy) · horizon/window · exact target date · review file path · implementable total return · maximum adverse excursion · scenario outcome/range miss · thesis status · action outcome · decision quality · the single key lesson · confirmation no decision record was modified.

If no records were due/found (mode `due` with nothing scheduled yet), say so plainly and exit without writing or committing anything.

## 13. Commit and push to main

Per `CLAUDE.md` git policy — this writes only under `commodity/runs/<COMMODITY>/reviews/`, the same data stream `commodity:full`/`commodity:rerun` already commit straight to `main` via `commit-run.sh`.

Stage **only the exact review files this run wrote** (the paths resolved in Step 4), listed explicitly — never a `commodity/runs/*/reviews/*` wildcard. `commit-run.sh` stages precisely the pathspecs it is handed (`git add -- "$@"`), so a wildcard would sweep in any *other* commodity's uncommitted review left by a concurrent or aborted run, breaking the per-run commit isolation the helper exists to preserve:

```bash
# one path per review actually written this run (Step 4), e.g. for a due-mode run that reviewed COPPER + GOLD:
bash scripts/commit-run.sh "Commodity review: <N> review(s) on <REVIEW_DATE>" -- \
  "commodity/runs/COPPER/reviews/<REVIEW_DATE>_<WINDOW>_decision_review.json" \
  "commodity/runs/GOLD/reviews/<REVIEW_DATE>_<WINDOW>_decision_review.json"
```

Report the commit SHA from `git rev-parse HEAD`. If no review files were created, skip the commit.

---

## Hard rules

- Reads immutable archived decisions first (legacy top-level records only for legacy fallback) and sibling market evidence read-only; writes only `commodity/runs/<COMMODITY>/reviews/*_decision_review*.json`.
- Append-only: an existing review file is never overwritten; a re-review of the same window gets a `_vN` suffix.
- No fabricated prices, returns, or evidence. A fresh target-date outcome missing any implementable-return component remains due rather than entering calibration with a spot-only proxy.
- `frameworks/commodity/decision_review.schema.json` and `DECISION_LEDGER.md` §7/§10/§12 are the only doctrine sources; this command does not redefine them.
- This command spawns no subagents and builds no calibration/dashboard layer itself — `/commodity:calibrate` (`scripts/commodity_calibrate.py`) is that next phase, aggregating whatever reviews this command has filed into a hit-rate scoreboard that `99_commodity-thesis-synthesis.md` reads back on every subsequent run (`frameworks/DECISION_LEDGER.md` §18, commodity twin).
