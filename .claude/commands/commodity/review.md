---
description: Review a commodity's decision_record.json against what actually happened — the commodity swarm's twin of /research:review-decisions. Writes an append-only decision review JSON.
argument-hint: COMMODITY_OR_DUE [WINDOW]
allowed-tools: Read, Write, Glob, Bash, WebSearch, WebFetch
---

You implement the commodity swarm's learning loop — the twin of `frameworks/DECISION_LEDGER.md` Phase 3 (`/research:review-decisions`), scoped to the commodity swarm's simpler single-verdict `decision_record.json` (no entry_price/basket/forecast_ledger — `frameworks/commodity/decision_record.schema.json` explains why). You review one or more existing `commodity/runs/<COMMODITY>/decision_record.json` files and write **append-only** outcome-review JSON files beside them.

`frameworks/commodity/decision_review.schema.json` is the canonical schema — read it first. Reuse, do not reinvent, the doctrine it already carries: `DECISION_LEDGER.md` §7 (review cadence), §10 (luck vs skill), §12 (error taxonomy, also `CLAUDE.md` §20). Do not invent a parallel schema or a parallel review framework.

**Why this command exists.** Every commodity run ends at a single `Action:` verdict (Buy / Hold / Trim / Avoid / Research More) written once to `decision_record.json` and never checked again — the research and screener swarms both closed this loop long ago (`/research:review-decisions` + `/research:calibrate`; `/screener:validate` + `/screener:calibrate`); the commodity swarm had nothing. `CLAUDE.md` §19: "a forecast that cannot be checked later is not a forecast." An `Action:` verdict is exactly that kind of forecast.

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

`<WINDOW_ARG>`, if present, must be one of `30d` / `90d` / `180d` / `365d` / `ad-hoc`. Anything else: ignore and warn.

Resolve `<TODAY>` once: `date +%F`.

## 2. Discover decision records

Glob `commodity/runs/*/decision_record.json`. Validate each: parse as JSON and confirm it carries `swarm == "commodity"`, `commodity`, `decision_date`, `action`. Skip and note any that fail to parse or are missing a required field — never attempt to repair the original.

Narrow by mode:
- **mode `commodity`:** `commodity/runs/<TARGET>/decision_record.json`. If absent, STOP and report "No decision record for commodity `<TARGET>`."
- **mode `all`:** every validated record.
- **mode `due`:** every `(commodity, window)` pair the Step 3 helper marks `DUE` — but if `<WINDOW_ARG>` was supplied, restrict to that window only (so `/commodity:review due 30d` acts on the due 30d checkpoints, not every due window).

## 3. Compute review windows (no stored schedule — derive it)

Unlike the research swarm's `decision_record.json`, the commodity schema carries **no `review_schedule` field** (`frameworks/commodity/decision_record.schema.json` — deliberately smaller shape). Reuse the exact same cadence as `DECISION_LEDGER.md` §7 (30d / 90d / 180d / 365d) computed directly from `decision_date`, rather than inventing a different cadence or a new stored field on the frozen record:

```bash
python3 - <<'PY'
import json, glob, os, datetime
today_d = datetime.date.today()            # platform-independent; no `date` subprocess
today = today_d.isoformat()
WINDOWS = {"30d": 30, "90d": 90, "180d": 180, "365d": 365}
for f in sorted(glob.glob("commodity/runs/*/decision_record.json")):
    try:
        d = json.load(open(f))
    except Exception as e:
        print("SKIP invalid_json", f, str(e)[:80]); continue
    req = ["swarm", "commodity", "decision_date", "action"]
    miss = [k for k in req if k not in d]
    if miss:
        print("SKIP missing_fields", f, ",".join(miss)); continue
    if d.get("swarm") != "commodity":
        print("SKIP wrong_swarm", f); continue
    run_dir = os.path.dirname(f)
    dec_date = d["decision_date"]
    try:
        dec_d = datetime.date.fromisoformat(dec_date)
    except (ValueError, TypeError) as e:
        # decision_record.schema.json only regex-checks decision_date's shape (YYYY-MM-DD), so a
        # value like "2026-99-99" is schema-legal but not a real calendar date. Skip just THIS
        # commodity and keep scanning — one bad record must never abort the whole due scan.
        print("SKIP bad_decision_date", f, str(e)[:80]); continue
    for w, offset in WINDOWS.items():
        due_date = dec_d + datetime.timedelta(days=offset)
        due = due_date <= today_d
        # A window counts as REVIEWED only if an existing review for THIS decision covers it —
        # matched on original_decision_date, not just the filename window. commodity:rerun reuses
        # the stable run folder and rewrites decision_record.json with a NEW decision_date, so a
        # stale review from the prior (since-rewritten) decision must NOT suppress the new
        # decision's checkpoints.
        existing = []
        for r in glob.glob(os.path.join(run_dir, "reviews", "*_%s_decision_review*.json" % w)):
            try:
                rv = json.load(open(r))
            except Exception:
                continue
            if isinstance(rv, dict) and rv.get("original_decision_date") == dec_date:
                existing.append(r)
        status = "DUE" if (due and not existing) else ("REVIEWED" if existing else "NOT_DUE")
        print(status, run_dir, w, str(due_date), "today="+today)
PY
```

Use the `DUE` lines to drive mode `due` — filtered to `<WINDOW_ARG>` when one was supplied (drop every `DUE` pair whose window isn't the requested one). `REVIEWED` windows are skipped (append-only). In mode `commodity`/`all` with no `<WINDOW_ARG>`: use the earliest `DUE` window if one exists, else `ad-hoc` — an early honest check-in is allowed and useful (mirrors `DECISION_LEDGER.md`'s `ad-hoc` window), but it can only ever land `action_outcome: too_early` for anything not yet resolvable; do not force a verdict a window this young cannot support.

## 4. Resolve the review output path (append-only)

```
commodity/runs/<COMMODITY>/reviews/<REVIEW_DATE>_<WINDOW>_decision_review.json
```

`mkdir -p "commodity/runs/<COMMODITY>/reviews"`. If the target path exists, do not overwrite — use `_v2`, `_v3`, … (find the next free suffix with Bash, same pattern as `/research:review-decisions.md` Step 4).

## 5. Gather the review price and level checks

Read the original `decision_record.json` (read-only). Pull `current_price` (the anchor — copy verbatim into `reference_price`, never re-derive it), `key_levels`, `key_risks`, `thesis_summary`, `action`, `confidence`, `benchmark`.

Use WebSearch/WebFetch to find the commodity's current price as of `<REVIEW_DATE>`, from a source at or above the tier the original run cited (prefer the same `benchmark` instrument — e.g. LBMA/COMEX for gold, CME/CBOT for wheat, ICE/LME for copper — per `CLAUDE.md` §4 and this swarm's `sources.preferred` list in `SWARM.md`). Label the source and date. If no verifiable price can be found, set `review_price.value` to `null` and say so in `notes` — do not fabricate a number, and do not silently skip the rest of the review.

Compute, where `review_price.value` is known:
- `absolute_return_pct` = `(review_price.value − reference_price.value) / reference_price.value × 100`.
- `price_vs_levels.support_breached` = review_price closed below `key_levels.support` at any point in the window (best-effort from available data — a single spot check if that is all that is findable; say so in `detail`).
- `price_vs_levels.resistance_breached` = analogous, above `key_levels.resistance`.
- `price_vs_levels.within_fair_value_range` = whether `review_price.value` sits inside `key_levels.fair_value_range` (best-effort parse of that free-text range; `null` if unparseable, with `detail` explaining why).

## 6. Resolve risk results

For each entry in the original `key_risks[]`, produce one `risk_results` item: `status` ∈ `materialized` / `not_materialized` / `partial` / `pending` (pending = window too short to tell), with a one-line `evidence` citation (source + date, or "no new evidence found as of `<REVIEW_DATE>`").

## 7. Classify thesis status

`thesis_status` ∈ `on-track` / `at-risk` / `confirmed` / `broken` / `expired`, based on `thesis_summary`, the risk results, and the price/level checks. This is the input `action_outcome` (Step 8) depends on — do not skip ahead.

## 8. Classify the action outcome

Read this table **in order** (first match wins), same discipline as `DECISION_LEDGER.md` §8's `pre_mortem_check.outcome_vs_verdict` table:

| Original `action` | Condition | `action_outcome` |
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

Follow `frameworks/commodity/decision_review.schema.json` exactly — do not drift, do not add fields it does not define. `lessons` is an array of short strings: the single most important takeaway, plus any web-source labels used. `notes` carries any boundary-case justification for `action_outcome` and any caveats.

Validate before continuing:

```bash
python3 -m json.tool "<review_file>" >/tmp/commodity_review_check.json && echo "OK valid JSON" || echo "FAIL invalid JSON"
python3 scripts/validate_screener_json.py frameworks/commodity/decision_review.schema.json "<review_file>"
```

Fix and rewrite if either fails. Do not commit an invalid or non-conformant review file.

## 12. Human-readable summary

Print: commodity · run root · review window · review file path · thesis status · action outcome · decision quality · risk results (materialized/not/partial/pending counts) · the single key lesson · confirmation `decision_record.json` was NOT modified.

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

- Reads `decision_record.json` (and, best-effort, sibling module outputs for volatility context) read-only; writes only `commodity/runs/<COMMODITY>/reviews/*_decision_review*.json`.
- Append-only: an existing review file is never overwritten; a re-review of the same window gets a `_vN` suffix.
- No fabricated prices, returns, or evidence — unresolvable fields are `null`/empty with a caveat, never guessed.
- `frameworks/commodity/decision_review.schema.json` and `DECISION_LEDGER.md` §7/§10/§12 are the only doctrine sources; this command does not redefine them.
- This command spawns no subagents and builds no calibration/dashboard layer — that is the natural next phase, once enough reviews exist to aggregate (mirrors how `/research:calibrate` followed `/research:review-decisions` by a separate PR in the research swarm's own history).
