# Investment Decision Feedback Loop Framework

This is the **specification / doctrine layer** for turning every final thesis into a measurable, auditable decision the engine can learn from. It defines the decision-record schema, paper-trade rules, basket tracking, forecast and outcome review, and the post-mortem / calibration loop.

It is cross-cutting doctrine, subordinate to the root `CLAUDE.md` (the Institutional Investing Constitution). It does **not** duplicate doctrine that already lives there — it references it: decision set (§18), probability bands (§10), data sufficiency (§11), thesis type (§14), forecast ledger (§19), error taxonomy (§20). On any conflict, the stricter, more conservative, more evidence-based rule wins.

> **Status — Phase 2 complete, validated live.** Phase 1 (this framework) and Phase 2 (the master synthesizer emits `decision_record.json` beside `final_thesis.md`) are both done, and the chain has been validated end-to-end on a real `/research:full BG` run (`analyses/BG_2026-06-01/`). **Phase 3 — review command added, not yet run:** `.claude/commands/research/review-decisions.md` reads existing `decision_record.json` files and writes append-only review JSON, each paired (for reviews filed on/after 2026-06-10) with a human-readable **memo delta** — a 2–3 page "what changed since the memo" update (§8); it has not been run yet (no scheduled review window is due). See **Current Implementation Status** below and the **Future Integration Plan** (§15). A feedback-loop agent does not exist yet.

## Current Implementation Status

| Phase | Status | Evidence | Notes |
|---|---|---|---|
| Phase 1 — Ledger framework | Complete | `frameworks/DECISION_LEDGER.md` | Doctrine / spec layer (this file) |
| Phase 2 — Synthesizer emits decision record | Complete | `analyses/BG_2026-06-01/decision_record.json` | Validated on BG; the synthesizer self-writes both `final_thesis.md` and `decision_record.json` |
| Phase 3 — Review command | Command added — not yet run | `.claude/commands/research/review-decisions.md` | Authored this build; first review run pending (BG's earliest scheduled window is 2026-07-01) |
| Phase 4 — Cohort + calibration | Command added — pre-data | `.claude/commands/research/calibrate.md` | Computes ledger inventory + process metrics now; selected-minus-rejected spread + Brier await resolved reviews |
| Phase 5 — Calls tracker / viewing layer | Complete | `GET /api/calls` + `/research:track` | Read-only aggregation over records + reviews (§15 Phase 5) |

## BG Live Validation Record

The first end-to-end proof that the ledger works on real data — the `/research:full BG` run on 2026-06-01:

- **Ticker:** BG (Bunge Global SA) · **Run root:** `analyses/BG_2026-06-01/`
- **Modules completed:** 5 / 5 (business-model, earnings, balance-sheet-survival, management-governance, valuation), 49 specialists, no fail-fast abort.
- **Decision:** Watchlist (confidence 46/100, data sufficiency 68/100; thesis type commodity- / policy-conditional).
- **entry_price:** `null` — no pool-sourced current price existed; per §4 **no paper trade was created**, and `notes` recorded the indicative/web-price caveat.
- **Forecast ledger:** present (6 entries, each with a confirmation and a falsification trigger).
- **Review schedule:** 30d / 90d / 180d / 365d present (`2026-07-01 / 2026-08-30 / 2026-11-28 / 2027-06-01`).
- **Schema:** all **38** top-level fields present; valid JSON; correct field types; `module_scores` populated for all five modules; `red_flags` and `missing_data` populated.
- **Consistency:** matched `final_thesis.md` Part I (decision, scores, expected return, downside, risk/reward, thesis type, killer risk, rating cap).
- **Commits:** run-artifacts `d3a645f`; metadata-backfill `302eb36`. (Post-run pipeline hardening — persistence Modes A/B/C in `frameworks/MODULE_PIPELINE.md` — landed separately as `1b5cb0b`.)

This is why the schema in §5 is treated as proven and is preserved unchanged.

## Why This Matters

The engine cannot become high-accuracy merely by writing better reports. A better-written thesis that is never checked against what actually happened teaches the engine nothing. To improve, it must **compare each decision against its outcome, classify why it was right or wrong** (luck vs skill, §10; error taxonomy, §12), and feed that back into module weights, rating caps, confidence, and data-sufficiency calibration over time. Phase 2 made decisions **recordable**; Phase 3 makes them **reviewable** — and only the review loop turns research output into measured judgment.

---

## 1. Purpose

The engine should not only **produce** research — it should **learn from its decisions over time**.

Core idea — for every final thesis, track:
- what the engine **selected**,
- what the engine **rejected**,
- what it put on **watchlist**,
- the **paper trades**,
- the **forecasts**,
- what **actually happened**,
- a classification of **why** the engine was right or wrong,

and use that record to **calibrate** future modules, ratings, confidence, and data sufficiency.

**The objective is not to optimize for short-term price movement alone. The objective is to improve investment judgment.**

---

## 2. North Star Metric

The long-term question the engine asks about itself:

> **"Do selected ideas outperform rejected ideas after adjusting for benchmark, sector, thesis type, and time horizon?"**

**Primary metric:** `Selected Basket Return − Rejected Basket Return`.

Also track:
- selected vs **watchlist** spread,
- selected vs **benchmark** return,
- selected vs **sector** return,
- rejected basket **avoided loss / opportunity cost**,
- **short candidate** performance (if applicable).

---

## 3. Decision Universe

Every final thesis classifies the stock into one of the `CLAUDE.md` §18 decision buckets, and each decision maps to exactly one basket and a paper treatment:

| Final Decision | Basket | Paper Treatment |
|---|---|---|
| Strong Buy | Selected | Paper long |
| Buy | Selected | Paper long |
| Starter Position Only | Selected | Small paper long |
| Watchlist | Watchlist | No trade, track opportunity cost |
| Avoid | Rejected | No trade, track avoided/foregone return |
| Short Candidate | Short | Paper short |
| Pair Trade / Hedge Required | Pair Trade | Paper pair only if hedge is specified |
| Insufficient Data — Refuse To Rate | Insufficient Data | No trade, track process quality only |

Rules: one decision → one basket (no double-counting). "Pair Trade / Hedge Required" enters the Pair Trade basket only if a concrete hedge/second leg is named; otherwise it is tracked as Watchlist and flagged. "Insufficient Data — Refuse To Rate" is not a failure — it is tracked for process quality, never for return.

---

## 4. Paper Trade Rules

Paper trades are **simulated research outcomes, not real orders**.

- Paper trades are for **process feedback only**.
- They do **not** imply actual execution.
- Entry price = the **current price used in the final thesis**.
- **If current price is missing, do NOT create a paper trade.**
- Record the **source** and **date/time** of the price.
- Record **currency**.
- Record **benchmark**.
- Record **sector benchmark** if available.
- Record intended **time horizon**.
- Record **expected return** and **downside** from the final thesis.
- Record **confidence** and **data sufficiency**.
- **No hindsight edits** except through explicit review records (§8).
- **Never overwrite** original decision records.

---

## 5. Decision Record Schema

The canonical `decision_record.json` the synthesizer emits — one per final thesis, written to `<RUN_ROOT>/decision_record.json` alongside `final_thesis.md` (Phase 2, live since the BG run). This schema is **proven** — it validated cleanly on BG — and is preserved unchanged.

```json
{
  "schema_version": "1.0",
  "ticker": "",
  "company_name": "",
  "exchange": "",
  "currency": "",
  "decision_date": "",
  "run_root": "",
  "final_thesis_path": "",
  "decision": "",
  "suggested_action": "",
  "paper_treatment": "",
  "basket": "",
  "entry_price": null,
  "entry_price_source": "",
  "entry_price_timestamp": "",
  "benchmark": "",
  "sector_benchmark": "",
  "time_horizon": "",
  "expected_return_pct": null,
  "downside_risk_pct": null,
  "risk_reward": null,
  "scenarios": [],
  "confidence_score": null,
  "data_sufficiency_score": null,
  "rating_cap": "",
  "thesis_type": [],
  "variant_perception_summary": "",
  "what_everyone_knows": "",
  "what_is_priced_in": "",
  "what_market_may_be_missing": "",
  "edge_score": null,
  "edge_proof": "",
  "killer_risk": "",
  "kill_criteria": [],
  "forecast_ledger": [],
  "module_scores": {},
  "red_flags": [],
  "missing_data": [],
  "review_schedule": {
    "30d": "",
    "90d": "",
    "180d": "",
    "365d": ""
  },
  "created_by": "synthesizer",
  "notes": "",
  "post_review_confidence_score": null,
  "confidence_haircut": null,
  "pre_mortem_verdict": ""
}
```

The three `post_review_*` fields are **additive and optional** — the synthesizer never sets them; the finish-gate step 10B.2 in `/research:full` patches them in-place after the pre-mortem runs. Older records (`decision_date` before 2026-06-12) omit them; every downstream consumer (calibrate, track, review-decisions) falls back to `confidence_score` when these fields are absent.

**Field definitions:**

| Field | Required? | Description | Source |
|---|---|---|---|
| `schema_version` | Yes | Schema version for forward compatibility ("1.0"). | This framework |
| `ticker` | Yes | Ticker / instrument symbol. | Run metadata |
| `company_name` | Yes | Legal / common company name. | Business-model module |
| `exchange` | Recommended | Listing exchange (e.g. NSE, NYSE). | Run metadata / filings |
| `currency` | Yes | Reporting / price currency (ISO). | Price anchor |
| `decision_date` | Yes | Date the thesis was finalized (YYYY-MM-DD). | Run date |
| `run_root` | Yes | Path to the run folder, `analyses/<TICKER>_<DATE>`. | Orchestrator |
| `final_thesis_path` | Yes | Path to `final_thesis.md`. | Orchestrator |
| `decision` | Yes | One of the §3 / `CLAUDE.md` §18 buckets. | Part I Headline Scorecard |
| `suggested_action` | Yes | Plain-English action (e.g. "Start small, add below X"). | Part I |
| `paper_treatment` | Yes (derived) | Paper treatment per the §3 mapping. | §3 mapping of `decision` |
| `basket` | Yes (derived) | Basket per the §3 mapping. | §3 mapping of `decision` |
| `entry_price` | Conditional | Current price used in the thesis; `null` if missing (then no paper trade, §4). | Price anchor |
| `entry_price_source` | Conditional | Source of the price (required if `entry_price` set). | Price anchor |
| `entry_price_timestamp` | Conditional | Date/time of the price (required if `entry_price` set). | Price anchor |
| `benchmark` | Yes | Benchmark index for relative return. | Thesis / convention |
| `sector_benchmark` | Recommended | Sector index, if available. | Thesis / convention |
| `time_horizon` | Yes | Intended horizon (e.g. "12–18m"). | Part I |
| `expected_return_pct` | Recommended | Base-case expected return, if quantified. | Part I / valuation |
| `downside_risk_pct` | Recommended | Bear-case downside, if quantified. | Part I / valuation |
| `risk_reward` | Recommended | Risk/reward ratio. | Part I |
| `scenarios` | Recommended (additive) | Array of §8 scenario rows: `{label, probability, return_pct, price_target}`; probabilities sum to 100. Lets the eval harness deterministically recompute `expected_return_pct` / `risk_reward` instead of trusting hand arithmetic (fix F08/F12). Backward-compatible — older records omit it; the math gate only activates for runs dated on/after 2026-06-08. | Part I / §8 Scenario Model |
| `confidence_score` | Yes | Confidence /100. | Part I |
| `data_sufficiency_score` | Yes | Data sufficiency /100 (`CLAUDE.md` §11). | Part I / gate |
| `rating_cap` | Conditional | Any rating cap applied, else "". | Rating Cap Rules |
| `thesis_type` | Yes | Array of thesis types (`CLAUDE.md` §14). | Part I |
| `variant_perception_summary` | Yes | One-paragraph variant perception. | Part I |
| `what_everyone_knows` | Recommended | Consensus view. | Part I variant perception |
| `what_is_priced_in` | Recommended | What the price implies. | Part I variant perception |
| `what_market_may_be_missing` | Recommended | The claimed edge. | Part I variant perception |
| `edge_score` | Additive (required for runs ≥ 2026-06-15) | Strength of *proven* variant perception, 0–100 (`CLAUDE.md` §7) — how well evidence proves the engine is genuinely different, not whether an edge story can be told. Near 0 when `what_market_may_be_missing` is consensus restated; high only when `edge_proof` is falsifiable and evidence-backed. **Binds the confidence cap** (synthesizer Confidence Scoring Rules): confidence may not exceed 60 unless `edge_score` ≥ 50 on a falsifiable `edge_proof`. | Part I Headline Scorecard / variant perception |
| `edge_proof` | Additive (required for runs ≥ 2026-06-15) | `CLAUDE.md` §7 item 4 — the specific, falsifiable evidence that would prove the edge is real (and is therefore checkable at a later review). `""` when no edge is claimed. | Part I variant perception |
| `killer_risk` | Yes | The single risk most likely to break the thesis. | Part I |
| `kill_criteria` | Yes | Array of conditions that would invalidate the thesis. | Thesis Kill Criteria table |
| `forecast_ledger` | Conditional | Array of forecast objects (§6); `[]` if none reliable. | Forecast Ledger |
| `module_scores` | Yes | Object: module name → score/verdict. | Module Scorecard |
| `red_flags` | Yes | Array of carried Critical/High red flags (with IDs). | Red-flag register |
| `missing_data` | Yes | Array of key data gaps / next-data requests. | Gate evidence inventory |
| `review_schedule` | Yes | Target review dates at 30/90/180/365d from `decision_date`. | Computed (§7) |
| `created_by` | Yes | Emitter ("synthesizer"). | Convention |
| `notes` | Optional | Free-text caveats. | Synthesizer |
| `post_review_confidence_score` | Additive | Confidence /100 after the in-path pre-mortem red-team. Set by the finish-gate (step 10B.2) — never by the synthesizer. `null` when no pre-mortem ran or no haircut applied. Downstream tools (calibrate, track) prefer this over `confidence_score` when present: it is the engine's best estimate of its own conviction after adversarial stress-testing. | Finish-gate patch (fix F28) |
| `confidence_haircut` | Additive | Points of confidence removed by the pre-mortem (`confidence_score − post_review_confidence_score`). 0 if the thesis survived without haircut; `null` if no pre-mortem ran. | Finish-gate patch (fix F28) |
| `pre_mortem_verdict` | Additive | The pre-mortem's verdict string (e.g. "Survives with haircut", "Does not survive — downgrade"). `""` if no pre-mortem ran. | Finish-gate patch (fix F28) |

Rules: keep field names exactly as above. Absent values are `null` (numbers), `""` (strings), or `[]`/`{}` — never fabricated.

**`edge_score` / `edge_proof` are additive** (introduced 2026-06-15) — they complete the `CLAUDE.md` §7 variant structure (consensus → priced-in → edge → *proof of edge*) and make the edge mechanical, so the confidence cap can bind to a number and the review loop can later grade it. Records dated before 2026-06-15 omit them; downstream consumers fall back to the narrative `variant_perception_*` fields and `confidence_score`. `schema_version` stays "1.0" — the same additive convention as `scenarios[]` and the `post_review_*` fields.

---

## 6. Forecast Ledger Schema

Each element of `decision_record.forecast_ledger` — the machine-readable form of the synthesizer's Forecast Ledger (`CLAUDE.md` §19):

```json
{
  "prediction": "",
  "probability": null,
  "time_window": "",
  "evidence_today": "",
  "confirmation_trigger": "",
  "falsification_trigger": "",
  "owner_module": "",
  "confidence_score": null,
  "status": "open"
}
```

Rules:
- Only include forecasts with enough evidence.
- `probability` must follow the `CLAUDE.md` §10 probability bands.
- Every forecast must have a **confirmation** trigger and a **falsification** trigger.
- Forecasts must be reviewable later (resolved only via review records, §8 — `status` ∈ {open, confirmed, falsified, expired}).
- If no reliable forecast can be created, say why (and leave `forecast_ledger` as `[]`).

---

## 7. Review Schedule

Standard review windows: **30 days · 90 days · 180 days · 365 days** from `decision_date`.

For long-duration theses, also allow: **24 months · 36 months**.

Each review answers:
- What happened to the stock?
- What happened relative to the benchmark?
- What happened relative to the sector?
- Did the original thesis play out?
- Did the catalyst happen?
- Were the forecasts right?
- Did the risks materialize?
- Was the decision right for the **right reason**?
- Was the decision right for the **wrong reason**?
- Was the decision wrong **despite good process**?
- Was the decision wrong **because of bad process**?

---

## 8. Outcome Review Schema

Reviews are append-only files at:

```
analyses/<TICKER>_<DATE>/reviews/<REVIEW_DATE>_<WINDOW>_decision_review.json
```

Each references the original decision; the original decision record is never edited.

```json
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

`review_window` ∈ {30d, 90d, 180d, 365d, 24m, 36m, ad-hoc, post-mortem}. `thesis_status` ∈ {on-track, at-risk, confirmed, broken, expired}. `decision_quality` records the §10 luck-vs-skill verdict. `error_taxonomy` is populated only when the call went wrong (§12).

### Memo delta (`memo_delta`) — what changed since the memo (additive; required for reviews filed on/after 2026-06-10)

Each review also answers the question a PM actually asks at a checkpoint: **"what changed since the original memo, and does it matter?"** The machine-readable answer is the review JSON's `memo_delta` object; its human-readable twin is a paired **Memo Delta Review** markdown (target 2–3 pages, hard ceiling 4) written beside the review JSON at:

```
analyses/<TICKER>_<DATE>/reviews/<REVIEW_DATE>_<WINDOW>_memo_delta.md
```

(same basename as its review JSON — `_decision_review.json` → `_memo_delta.md` — including any `_v2`/`_v3` suffix).

```json
"memo_delta": {
  "summary": "",
  "thesis_delta_verdict": "",
  "stage_one_comment": "",
  "changed_sections": [
    {
      "section": "",
      "original_claim": "",
      "new_evidence": "",
      "evidence_source": "",
      "materiality_score": null,
      "impact_direction": "",
      "impacted_modules": [],
      "rerun_recommended": false,
      "rerun_reason": "",
      "rerun_command": ""
    }
  ],
  "watch_items": [],
  "management_questions": [],
  "memo_delta_file": ""
}
```

Rules:

- `thesis_delta_verdict` ∈ {`unchanged`, `strengthened`, `weakened`, `broken`, `too_early`} — how the new facts move the original thesis. It is distinct from `thesis_status` (where the thesis stands) and the two must not contradict each other.
- `changed_sections` lists **only material changes** versus the original memo (`memo.md` if the run has one, else `final_thesis.md`). Each entry carries: `section` (the original memo/thesis section), `original_claim`, `new_evidence` (the new fact), `evidence_source` (a §5-style citation **with a date** — required), `materiality_score` 0–100 (§12 calibration), `impact_direction` ∈ {positive, negative, mixed, neutral}, `impacted_modules` (exact module folder names from the agent roster), and `rerun_recommended` — when true, also `rerun_reason` plus a copy-pasteable `rerun_command` (`/research:rerun <module> <agent> <TICKER>` for one orb, `/research:<module> <TICKER>` for a whole module). **No re-run recommendation without naming the impacted module(s).**
- `stage_one_comment`: a 100–200-word **plain-text** comment (no markdown) suitable for pasting straight into the Stage-One sheet.
- `watch_items`: the specific things to watch before the next checkpoint. `management_questions`: 3–7 questions the delta raises.
- `memo_delta_file`: repo-relative path to the paired markdown.
- The JSON block is the machine record; the markdown is a **re-projection** of it (memo-writer discipline — no fact may appear in the markdown that is not in the review JSON). "Nothing material changed" / "too early" is a valid, SHORT delta — never pad it.
- The memo delta **never** updates the financial model, the original memo, `final_thesis.md`, or `decision_record.json`. It may *recommend* re-running a module or orb; the re-run itself is a separate, explicit action.
- Additive: `schema_version` stays "1.0". Reviews filed before 2026-06-10 omit the block (same convention as the decision-record `scenarios[]` field).

---

## 9. Outcome Metrics

**Price / return metrics:**
- absolute return
- benchmark-relative return
- sector-relative return
- selected basket return
- rejected basket return
- selected minus rejected spread
- selected minus watchlist spread
- hit rate
- false positive rate
- false negative rate

**Research quality metrics:**
- thesis accuracy
- forecast accuracy
- catalyst accuracy
- risk accuracy
- valuation accuracy
- timing accuracy
- data sufficiency calibration
- confidence calibration

**Process metrics:**
- unsupported claim rate
- missing data rate
- red-flag override rate
- rating cap override rate
- stale data rate

---

## 10. Thesis Accuracy vs Price Accuracy

**Do not judge the engine only by stock price movement.** Separate the price outcome from the thesis outcome:

| Price Outcome | Thesis Outcome | Interpretation |
|---|---|---|
| Right | Right | Skill — the engine saw what others missed and it played out. Reinforce. |
| Right | Wrong | Luck — the call paid but for a reason the engine did not identify. Do not reward; flag as a calibration warning. |
| Wrong | Right | Good process, bad luck / too early — thesis sound but price hasn't followed (timing or exogenous). Do not punish process; check the horizon. |
| Wrong | Wrong | Genuine miss — both the call and the reasoning were off. Attribute via the error taxonomy (§12). |

A good process can lose money short term. A bad process can make money short term. **The feedback loop must distinguish luck from skill** — it tracks thesis accuracy and price accuracy separately and never lets one stand in for the other.

---

## 11. Selected vs Rejected Basket Analysis

Cohort analysis. For any research batch or period, group decisions into:
- Selected Basket
- Rejected Basket
- Watchlist Basket
- Short Basket
- Insufficient Data Basket

Measure for each cohort:
- 30d returns
- 90d returns
- 180d returns
- 365d returns
- benchmark-relative returns
- sector-relative returns
- hit rate
- drawdown
- upside capture
- downside capture

**Core question: did the engine's selected names beat its rejected names?** (benchmark- and sector-adjusted, sliced by thesis type and horizon).

---

## 12. Error Taxonomy Integration

Use the error taxonomy from `CLAUDE.md` §20. When a call is wrong, classify it:
- missing data
- stale data
- bad source
- bad extraction
- bad math
- bad base rate
- bad causal inference
- management deception
- exogenous shock
- timing error
- valuation multiple error
- ignored red flag

Plus these feedback-loop-specific categories:
- **false positive:** engine selected a bad idea
- **false negative:** engine rejected a good idea
- **thesis drift:** the original thesis changed without an explicit update
- **catalyst delay:** thesis may be right but the timing was wrong
- **beta confusion:** market/sector beta drove the outcome, not the thesis

---

## 13. Module Calibration

How reviews feed back into modules. For each decision review, identify:
- Which module was **most responsible** for the decision?
- Which module was **most accurate**?
- Which module **missed the key variable**?
- Which module **overruled another correctly**?
- Which module **overruled another incorrectly**?
- Did **valuation** matter most?
- Did **earnings** matter most?
- Did **governance** matter most?
- Did **balance-sheet survival** matter most?
- Did **business quality** matter most?

Output: `module_calibration_notes` (the object in the review record, §8).

Purpose: over time, identify which modules deserve more weight **by sector, thesis type, and time horizon**.

---

## 14. Guardrails Against Bad Incentives

- Do **not** optimize the engine for 30-day price movement.
- Do **not** reward lucky outcomes without thesis accuracy.
- Do **not** punish good process for exogenous shocks.
- Do **not** let P&L override evidence quality.
- Do **not** convert paper trades into real trades.
- Do **not** create hindsight edits to original decisions.
- Do **not** ignore rejected winners; classify them as possible **false negatives**.
- Do **not** ignore selected losers; classify them as possible **false positives**.
- Do **not** treat "Avoid" as a short unless the final decision was explicitly "Short Candidate."

---

## 15. Future Integration Plan

- **Phase 1 — Create `frameworks/DECISION_LEDGER.md`** — **Complete.**
- **Phase 2 — Upgrade `.claude/agents/synthesizer.md` to emit `<RUN_ROOT>/decision_record.json`** — **Complete and validated on BG** (`analyses/BG_2026-06-01/decision_record.json`; see the BG Live Validation Record above).
- **Phase 3 — Add the review command `.claude/commands/research/review-decisions.md`** — **Command added (not yet run).** Reads historical `decision_record.json` files and writes append-only review JSON (acceptance criteria below). First run is pending until a scheduled review window comes due. **Memo Delta Review (added 2026-06-10):** each review also populates the §8 `memo_delta` block and writes the paired `<REVIEW_DATE>_<WINDOW>_memo_delta.md` beside the review JSON — the 2–3 page human-readable "what changed since the memo" tier. The review JSON stays the machine source of truth; the markdown is a derived re-projection of it, append-only like the JSON.
- **Phase 4 — Aggregate cohort + calibration reporting** (`/research:calibrate` → `analyses/performance/<DATE>_decision_performance_summary.md` + `_calibration_summary.json`) — **Command added (pre-data).** Computes ledger inventory + process metrics now; the selected-minus-rejected spread, hit rate, and the Brier/reliability calibration compute once enough resolved reviews exist (the §3/§4 floors in the command).
- **Phase 5 — Calls-tracker dashboard / viewing layer** — **Added.** A **read-only viewing/aggregation layer** over the records and reviews — the place to see every call the engine made and what has happened to the company since, as time moves forward. Two twinned surfaces: the cockpit's live **Calls** view (`GET /api/calls`) and the downloadable **`/research:track`** command (writes dated `analyses/tracking/<DATE>_calls_tracker.{md,json}`, like Phase 4's `analyses/performance/` outputs). Both build, per call, a timeline of the scheduled review checkpoints (30d/90d/180d/365d) plus any ad-hoc reviews, each marked **done / due / overdue / upcoming** using the **same rule as `.claude/hooks/review_due.py`** and `review-decisions` Step 3 (local date, lexical ISO compare, `*_<window>_decision_review*.json` glob) — so the hook, the command, the API, and the static snapshot never disagree. **Inviolable:** this layer **never edits** any `decision_record.json`, `final_thesis.md`, or review file; it writes only the derived, regenerable dashboard under `analyses/tracking/`. The live **"Update now"** trigger delegates to Phase 3 `/research:review-decisions <ticker> ad-hoc` (it files an append-only review) — there is **no parallel review framework**. Both surfaces also carry, per done checkpoint, the review's `memo_delta_file` and `stage_one_comment` (§8), so the human-readable delta is one click from the timeline.

### Phase 3 — Review Command Acceptance Criteria

The review command (`.claude/commands/research/review-decisions.md`), when it is built, must:

- inspect existing `decision_record.json` files;
- **never overwrite or edit** original decision records;
- create **append-only** review files at `analyses/<TICKER>_<DATE>/reviews/<REVIEW_DATE>_<WINDOW>_decision_review.json`;
- follow the outcome review schema in §8;
- compare stock return vs **benchmark** and vs **sector** when price data is available;
- resolve each forecast-ledger item as **confirmed / falsified / expired / still open**;
- classify thesis status as **on-track / at-risk / confirmed / broken / expired**;
- **separate the price outcome from the thesis outcome**;
- classify **luck vs skill** using the §10 matrix;
- populate the **error taxonomy** (§12) only when the call was wrong;
- produce **module calibration notes** (§13);
- populate the §8 `memo_delta` block and write the paired memo-delta markdown (reviews filed on/after 2026-06-10) — a re-run recommendation must name its module(s) and the exact command;
- never update the financial model, the original memo, or any module output from a review;
- **not edit `decision_record.json`**;
- **not edit `final_thesis.md`**;
- commit directly to `main` and push (per `CLAUDE.md` git policy).

---

## 16. Compatibility With Existing Architecture

- This framework **complements** `CLAUDE.md`; it does **not** replace it.
- It does **not** replace module-specific `MODULE_RULES.md`.
- It does **not** change the existing `/research:full <TICKER>` contract.
- The synthesizer writes `decision_record.json` **in addition to** `final_thesis.md`, never instead of it (Phase 2 — live and validated on BG).
- Existing analyses remain valid.
- On any conflict with a module rule, the stricter / more conservative / more evidence-based rule wins.

---

## 17. Phase 2 Acceptance Criteria — Synthesizer Integration (met and validated on BG)

These were the Phase 2 acceptance criteria. **All are now met by the current synthesizer and were verified on the BG run** (`analyses/BG_2026-06-01/`):
- final thesis still writes to `final_thesis.md` — ✓
- decision record writes to `decision_record.json` — ✓
- if price is missing, the paper trade is not created — ✓ (BG: `entry_price` null, no paper trade)
- selected/rejected/watchlist basket mapping follows this framework (§3) — ✓ (BG: Watchlist → Watchlist basket → "No trade, track opportunity cost")
- forecast ledger is copied into the decision record — ✓ (BG: 6 entries)
- kill criteria are copied into the decision record — ✓
- no original decision record is overwritten — ✓ (one record per dated run; append-only review records arrive in Phase 3)
- review dates are generated from the decision date — ✓ (BG: 30/90/180/365d from 2026-06-01)
