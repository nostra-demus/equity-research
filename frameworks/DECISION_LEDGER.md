# Investment Decision Feedback Loop Framework

This is the **specification / doctrine layer** for turning every final thesis into a measurable, auditable decision the engine can learn from. It defines the decision-record schema, paper-trade rules, basket tracking, forecast and outcome review, and the post-mortem / calibration loop.

It is cross-cutting doctrine, subordinate to the root `CLAUDE.md` (the Institutional Investing Constitution). It does **not** duplicate doctrine that already lives there — it references it: decision set (§18), probability bands (§10), data sufficiency (§11), thesis type (§14), forecast ledger (§19), error taxonomy (§20). On any conflict, the stricter, more conservative, more evidence-based rule wins.

> **Status — Phase 2 complete, validated live.** Phase 1 (this framework) and Phase 2 (the master synthesizer emits `decision_record.json` beside `final_thesis.md`) are both done, and the chain has been validated end-to-end on a real `/research:full BG` run (`analyses/BG_2026-06-01/`). **Phase 3 — review command added, not yet run:** `.claude/commands/research/review-decisions.md` reads existing `decision_record.json` files and writes append-only review JSON, each paired (for reviews filed on/after 2026-06-10) with a human-readable **memo delta** — a 2–3 page "what changed since the memo" update (§8); it has not been run yet (no scheduled review window is due). **Phase 6 — calibration feedback gate added, forward-looking:** the synthesizer now reads the latest `analyses/performance/*_calibration_summary.json` and, once real (non-pre-data) calibration signal exists for a module used in the current run, applies a bounded confidence haircut and records it in `decision_record.json` (§18). This closes the loop Phase 4 opened — Phase 4 could always compute calibration; nothing consumed it until now. See **Current Implementation Status** below and the **Future Integration Plan** (§15). A feedback-loop agent does not exist yet.

## Current Implementation Status

| Phase | Status | Evidence | Notes |
|---|---|---|---|
| Phase 1 — Ledger framework | Complete | `frameworks/DECISION_LEDGER.md` | Doctrine / spec layer (this file) |
| Phase 2 — Synthesizer emits decision record | Complete | `analyses/BG_2026-06-01/decision_record.json` | Validated on BG; the synthesizer self-writes both `final_thesis.md` and `decision_record.json` |
| Phase 3 — Review command | Command added — not yet run | `.claude/commands/research/review-decisions.md` | Authored this build; first review run pending (BG's earliest scheduled window is 2026-07-01) |
| Phase 4 — Cohort + calibration | Command added — pre-data | `.claude/commands/research/calibrate.md` | Computes ledger inventory + process metrics now; selected-minus-rejected spread + Brier await resolved reviews |
| Phase 5 — Calls tracker / viewing layer | Complete | `GET /api/calls` + `/research:track` | Read-only aggregation over records + reviews (§15 Phase 5) |
| Phase 6 — Calibration feedback gate | Added — forward-looking, pre-data | `.claude/agents/synthesizer.md` Pre-Write Gate 4C; `scripts/eval.py` check AG | Mechanically wired now, before real calibration signal exists, so the first run to see resolved calibration data does not silently skip it (§18) |

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

## 4a. Append-Only Correction Layer

§4's "never overwrite" is absolute — a committed `decision_record.json` is frozen forever. But a
committed record can still carry a defect that would **corrupt the calibration scoreboard** if read
verbatim: a superseded duplicate (two live calls for one ticker), a decimal-fraction probability
that turns 60% into 0.6% in a Brier score, an inconsistent `downside_risk_pct` sign. The only
sanctioned way to correct these without editing the frozen file is the **same mechanism §8 already
uses for outcomes** — an append-only sidecar — generalised from outcomes to record-level
corrections.

**The sidecar.** A run may carry `analyses/<RUN>/corrections.json` (schema `corrections/v1`),
append-only and machine-readable, with any subset of:
- `superseded_by: { run_root, reason, date }` — this run has been corrected-away by a later run; it
  is **dropped from the standing set** (it is not a live call). Use this when a re-run replaces a
  defective decision (e.g. a §24-cap violation corrected to a lower rating).
- `errata: [ { field, kind, reason, evidence } ]` — a field the reader must normalise on read.
  `kind ∈ { scale_fix, sign_fix, shape_fix, math_reconcile, note_clear }`. `scale_fix` restores a
  decimal probability to the 0–100 scale; `sign_fix` normalises a loss magnitude to
  positive-means-loss; `shape_fix` coerces a legacy list shape to the canonical object shape;
  `math_reconcile` / `note_clear` are documentation-only (they record a prose defect — e.g. a
  `final_thesis.md` headline that contradicts its own model — without any numeric transform). Where
  the defect is in `final_thesis.md` prose that a human reads directly, the correction may ALSO be a
  one-time, hand-authored **erratum banner** prepended to `final_thesis.md`: a clearly-marked
  `> **ERRATUM (appended …)**` blockquote that states the correct value and leaves the analysis body
  untouched — an appended note, never a rewrite. This is NOT auto-managed: no code re-stamps or
  de-duplicates it (the `/research:full` finish-gate strips only its OWN `PROVISIONAL` blockquote, so
  a distinctly-marked `ERRATUM` banner survives untouched). A future re-synthesis that rewrites
  `final_thesis.md` drops the banner; the `corrections.json` erratum is the durable record, and the
  banner is re-applied by hand if still needed.
- `metadata_recovery: { reason, evidence, post_review_confidence_score, confidence_haircut,
  execution_provenance, runtime_evidence }` — an append-only recovery for publication metadata that
  was provably omitted. It is accepted only when the frozen record has none of those fields, the
  confidence arithmetic reconciles, the canonical runtime projection validates, and the recovered
  recorded attempt is present in the named task-runtime evidence. It never overrides a published value.

**Inviolable properties.** The frozen `decision_record.json` is **never touched** — the sidecar is
the only thing written, and it only ever grows. A correction must be **explicit and declared**: a
missing or malformed sidecar changes nothing (fail toward the frozen original), and a reader never
infers a correction silently. The transform for each `kind` is **deterministic**.

**One resolver, every reader.** `scripts/ledger_records.py` (`load_standing_records()` /
`--standing-json`) is the authoritative resolver: it drops superseded runs and applies errata on
read, and `/research:track`, `/research:calibrate`, and `/research:size` iterate **its** standing
set instead of a raw `analyses/*/decision_record.json` glob. The cockpit's live Calls view
(`GET /api/calls`) resolves through the byte-for-byte mirror `ui/server/src/ledger-corrections.ts`
(a shared fixture, `ui/server/test/ledger-corrections.test.ts`, locks the two implementations
together). `scripts/eval.py` deliberately does NOT drop superseded runs — every committed folder is still
evaluated and remains visible as a structural fixture. A valid superseded run is historical rather than
standing, so its recorded failures are advisory and do not block release of its corrected replacement. A
replacement is valid only when its terminal decision record, thesis, memo, audit dossier, and validated
runtime provenance all exist and agree on the exact run root; source and target tickers must match and the
target decision must be newer. A decision record alone cannot retire a call.
A malformed, incomplete, dangling, or circular supersession fails closed and remains release-gating. The evaluator also
validates that a Selected/Short call is never left standing with a corrected-away twin.

This layer only corrects **integrity defects** — a duplicate, a scale, a sign, a self-contradiction
the record already proves. It is **not** a channel for changing a decision with hindsight (that is
§8's review + `memo_delta`, which recommends a fresh re-run and never edits the record either).

---

## 5. Decision Record Schema

The canonical `decision_record.json` the synthesizer emits — one per final thesis, written to `<RUN_ROOT>/decision_record.json` alongside `final_thesis.md` (Phase 2, live since the BG run). Its 1.0 base is **proven** — it validated cleanly on BG — and later capabilities use explicitly documented additive fields so older records remain readable.

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
  "scenario_horizon_days": null,
  "expected_return_pct": null,
  "downside_risk_pct": null,
  "margin_of_safety_pct": null,
  "risk_reward": null,
  "scenarios": [],
  "idea_valuation_bridge": null,
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
  "data_needs_schema_version": "2.0",
  "data_needs": [],
  "review_schedule": {
    "30d": "",
    "90d": "",
    "180d": "",
    "365d": ""
  },
  "created_by": "synthesizer",
  "execution_provenance": {
    "schema_version": "1.0",
    "source": "cockpit_runtime",
    "coverage": "cockpit_top_level_processes",
    "provider_mode": "single_provider",
    "profile_key": "codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh",
    "decision_author": {
      "attempt_id": "uuid",
      "provider": "codex",
      "model": "gpt-5.6-sol",
      "reasoning_level": "max",
      "attribution": "recorded"
    },
    "contributors": [],
    "cli_versions": {}
  },
  "notes": "",
  "post_review_confidence_score": null,
  "confidence_haircut": null,
  "pre_mortem_verdict": "",
  "business_type": "",
  "primary_valuation_method": "",
  "confidence_inputs": null,
  "analysis_confidence": null,
  "conviction": null,
  "sizing_hint": null,
  "confidence_breakdown": null
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
| `scenario_horizon_days` | Additive (required for final Ideas projection) | Exact integer horizon, in calendar days, of the source scenario targets. This is authority for the Ideas bridge, not the holding-period range. | §8 Scenario Model |
| `expected_return_pct` | Recommended | Base-case expected return, if quantified. | Part I / valuation |
| `downside_risk_pct` | Recommended | Bear-case downside, if quantified. | Part I / valuation |
| `margin_of_safety_pct` | Required once derivable (additive) | Discount of price to the **base-case** fair value, in percentage points = `((base FV − price) / base FV) × 100`; `null` ONLY when there is no pool-verified price ("Not assessable"). Direction-uniform (built from price levels, not returns) — a short candidate yields a negative MoS. The eval harness re-derives it from the `base`-labelled `scenarios[]` target (check M) and, for runs dated on/after 2026-07-10, FAILS a `null` value that is derivable from `entry_price` + the base scenario's `price_target` — it is not optional once assessable. Backward-compatible — older records omit it. | Part I / valuation |
| `risk_reward` | Recommended | Risk/reward ratio. | Part I |
| `scenarios` | Recommended (additive; structured authority required for final Ideas projection) | Array of §8 scenario rows. Existing math fields remain, and every forward Ideas-eligible row also carries stable `scenario_id`, non-empty `conditions`, a concrete `source`, `probability_basis` (`CLAUDE.md` §10 HARD GATE 13 — `empirical (n=X over {window})` / `base rate: {class, source}` / `judgment`, required on every row that carries a `probability`), and `joint_probability_basis` (string when the case joins conditions; otherwise `null` — a distinct field from `probability_basis`, see below). Probabilities sum to 100. See the structured shape below. | Part I / §8 Scenario Model |
| `idea_valuation_bridge` | Additive (required for final Ideas projection) | One object `{source_horizon_days, method, convergence_fraction, rationale, source}` that binds the scenario target horizon to the 3–6 month projection. `source_horizon_days` exactly equals `scenario_horizon_days`; this object is copied byte-for-byte to `candidate.valuation_bridge`. | §8 Scenario Model / valuation |
| `confidence_score` | Yes | Confidence /100. | Part I |
| `data_sufficiency_score` | Yes | Data sufficiency /100 (`CLAUDE.md` §11). | Part I / gate |
| `rating_cap` | Conditional | Any rating cap applied, else "". | Rating Cap Rules |
| `thesis_type` | Yes | Array of thesis types (`CLAUDE.md` §14). Values must come from the closed set, case-exact (the eval harness enforces this from 2026-06-21): `"Company-specific"`, `"Sector-cycle"`, `"Macro-conditional"`, `"Policy-conditional"`, `"Commodity-conditional"`, `"FX / rates"`, `"Liquidity / positioning"`, `"Governance turnaround"`, `"Balance-sheet survival"`, `"Pair trade / hedge"`, `"Insufficient data"`. When ANY value is external-variable-dominant (Macro/Policy/Commodity/FX/Liquidity) and `edge_score` < 50, the synthesizer caps the rating at `"Starter Position Only"` or below. | Part I |
| `variant_perception_summary` | Yes | One-paragraph variant perception. | Part I |
| `what_everyone_knows` | Recommended | Consensus view. | Part I variant perception |
| `what_is_priced_in` | Recommended | What the price implies. | Part I variant perception |
| `what_market_may_be_missing` | Recommended | The claimed edge. | Part I variant perception |
| `edge_score` | Additive (required for runs ≥ 2026-06-15) | Strength of *proven* variant perception, 0–100 (`CLAUDE.md` §7) — how well evidence proves the engine is genuinely different, not whether an edge story can be told. Near 0 when `what_market_may_be_missing` is consensus restated; high only when `edge_proof` is falsifiable and evidence-backed. **Binds the confidence cap** (synthesizer Confidence Scoring Rules): confidence may not exceed 60 unless `edge_score` ≥ 50 on a falsifiable `edge_proof`. | Part I Headline Scorecard / variant perception |
| `edge_proof` | Additive (required for runs ≥ 2026-06-15) | `CLAUDE.md` §7 item 4 — the specific, falsifiable evidence that would prove the edge is real (and is therefore checkable at a later review). `""` when no edge is claimed. | Part I variant perception |
| `killer_risk` | Yes | The single risk most likely to break the thesis. | Part I |
| `kill_criteria` | Yes (object shape additive, required for publications ≥ 2026-08-22) | Array of conditions that would invalidate the thesis. Each entry is an **object** of the form `{"condition": "", "comparable_basis": "", "stub_arithmetic": null, "fired_last_two_periods": false, "monitor": "", "module_source": ""}`: `condition` (string) is the criterion text — the corpus-canonical key the canonicalizers emit and `run-diff.ts` maps (use `condition`, not `criterion`); `comparable_basis` (string) is the like-for-like period/basis the trigger is measured against; `fired_last_two_periods` (bool) is the literal backtest fact — would this trigger, as written, have been satisfied on each of the last two reported periods (HARD GATE 11 / `CLAUDE.md` §17 checks 1 and 3); `stub_arithmetic` is `null` when no part of the period has yet reported. A publication dated ≥2026-08-22 that omits `comparable_basis` or `fired_last_two_periods` on any row fails `scripts/eval.py` check BA. Legacy plain-string rows remain valid on older records; `AW_kill_criteria_overdue` still reads either shape. | Thesis Kill Criteria table |
| `forecast_ledger` | Conditional | Array of forecast objects (§6); `[]` if none reliable. | Forecast Ledger |
| `module_scores` | Yes | Object: module name → score/verdict. | Module Scorecard |
| `red_flags` | Yes | Array of carried Critical/High red flags (with IDs). | Red-flag register |
| `missing_data` | Yes | Array of key data gaps / next-data requests. | Gate evidence inventory |
| `data_needs_schema_version` | Additive (required for publications ≥ 2026-08-14) | Exact discriminator `"2.0"`. Every new publication emits it even when `data_needs` is empty, including a rerun that preserves an older `decision_date`; genuinely older records without it retain the v1/no-structured-guidance meaning. | This framework |
| `data_needs` | Additive (required for publications ≥ 2026-08-14) | Ranked machine guidance for at most five missing observations that actively cap the decision. `[]` means the synthesizer checked and found none; see the exact v2 contract below. | Pre-Write Gate / module evidence gaps |
| `review_schedule` | Yes | Target review dates at 30/90/180/365d from `decision_date`. | Computed (§7) |
| `created_by` | Yes | Emitter ("synthesizer"). | Convention |
| `execution_provenance` | Runtime-owned (required for cockpit terminal publications after rollout) | Separately versioned provider/model/reasoning provenance projected from the supervisor's canonical attempt stream. It never changes `created_by`, which continues to name the emitter role. | Cockpit supervisor + deterministic publication gate |
| `notes` | Optional | Free-text caveats. | Synthesizer |
| `post_review_confidence_score` | Additive | Confidence /100 after the in-path pre-mortem red-team. Set by the finish-gate (step 10B.2) — never by the synthesizer. `null` when no pre-mortem ran or no haircut applied. Downstream tools (calibrate, track) prefer this over `confidence_score` when present: it is the engine's best estimate of its own conviction after adversarial stress-testing. | Finish-gate patch (fix F28) |
| `confidence_haircut` | Additive | Points of confidence removed by the pre-mortem (`confidence_score − post_review_confidence_score`). 0 if the thesis survived without haircut; `null` if no pre-mortem ran. | Finish-gate patch (fix F28) |
| `pre_mortem_verdict` | Additive | The pre-mortem's verdict string (e.g. "Survives with haircut", "Does not survive — downgrade"). `""` if no pre-mortem ran. | Finish-gate patch (fix F28) |
| `business_type` | Additive (required for runs ≥ 2026-06-18) | The sector overlay classification from `SECTOR_OVERLAYS.md` (e.g. "Bank / lender", "SaaS / subscription software", "Generic operating company"). Enables Phase 4 calibration to slice accuracy by sector and allows the eval harness (check W) to mechanically verify the valuation method is not forbidden for this type. `""` when business-identity output is absent. | Business-model `02_business-identity` output |
| `primary_valuation_method` | Additive (required for runs ≥ 2026-06-18) | The primary valuation method the valuation module applied (e.g. "DDM / residual income", "NAV + DDM", "FCFF DCF", "mid-cycle FCFF DCF"). Must not be a method that `SECTOR_OVERLAYS.md` forbids for the classified `business_type`. | Valuation module synthesis |
| `confidence_inputs` | Additive (for runs ≥ 2026-07-11) | The synthesizer's recorded judgments the scorer consumes: `{data_sufficiency, corroboration, evidence_tier, staleness_penalty, edge_score, edge_proof_present, decision, modules_absent[], critical_governance_unresolved, catalyst_timing_weak, rating_cap_ceiling, downgrades[], calibration_haircut}`. Lets the finish-gate re-derive `conviction`. | Synthesizer |
| `analysis_confidence` | Additive (for runs ≥ 2026-07-11) | "Understanding" /100 — evidence-quality-only measure of how well the situation is understood (direction-agnostic), from `scripts/confidence.py`. Built from `data_sufficiency_score` (50%) + cross-module corroboration + source tier. Not a buy signal. | Synthesizer via `scripts/confidence.py` |
| `conviction` | Additive (for runs ≥ 2026-07-11) | /100 — direction-aware conviction (how much to bet). Deterministic replacement for `confidence_score`: long/hedge edge-gated (§7), Avoid/Short evidence-gated, Watchlist non-committal, refuse-to-rate floored (§11). `confidence_score` is set equal to this for backward compatibility. | Synthesizer via `scripts/confidence.py` |
| `sizing_hint` | Additive (for runs ≥ 2026-07-11) | `{band, action}` — plain action/size band derived from `conviction` + `decision`. | `scripts/confidence.py` |
| `confidence_breakdown` | Additive (for runs ≥ 2026-07-11) | The step-by-step build (base → evidence → caps → downgrades → final) so `conviction` is auditable and re-derivable. | `scripts/confidence.py` |

Rules: keep field names exactly as above. Absent values are `null` (numbers), `""` (strings), or `[]`/`{}` — never fabricated.

### Execution provenance v1 (runtime-owned; new cockpit publications only)

`execution_provenance` is additive, with its own `schema_version: "1.0"`; the record's top-level
`schema_version` remains `"1.0"`. The model does not write this object. The shared run supervisor records
each process attempt in its private state and pipes those canonical rows directly to
`scripts/execution_provenance.py` before validation and `commit-run.sh`; provider children never receive
an authoritative manifest path. A committed `execution_provenance.receipt.json` carries durable lineage
for later chains and cross-machine resumes. The commit fails when a cockpit terminal record is missing the
stamp or when an existing stamp disagrees with the supervisor rows. Commodity records face the same projection
before archive hashing, so the immutable decision ID commits to provenance rather than accepting a later
patch.

The exact object is:

```json
{
  "schema_version": "1.0",
  "source": "cockpit_runtime",
  "coverage": "cockpit_top_level_processes",
  "provider_mode": "single_provider",
  "profile_key": "codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh",
  "decision_author": {
    "attempt_id": "uuid",
    "provider": "codex",
    "model": "gpt-5.6-sol",
    "reasoning_level": "max",
    "attribution": "recorded"
  },
  "contributors": [
    {
      "provider": "codex",
      "model": "gpt-5.6-terra",
      "reasoning_level": "xhigh",
      "attribution": "configured",
      "scopes": ["specialists"]
    }
  ],
  "cli_versions": {"codex": "codex-cli ..."}
}
```

- `provider_mode` is exactly `single_provider`, `mixed_provider`, `partially_observed`, or `unknown`.
- `decision_author` is the terminal adjudicator that authored the verdict and probabilities. `recorded`
  means runtime telemetry proved the exact provider/model/reasoning tuple; `configured` means the tuple is
  known from an immutable nested-agent policy but the child runtime did not expose model telemetry.
- `contributors` groups every retained execution profile and the scopes it affected. A cross-provider
  resume is always `mixed_provider`; the record is never credited wholesale to the provider that happened
  to finish it.
- `profile_key` is stable for a configured pipeline. Mixed profiles are explicitly prefixed `mixed|`.
- Authentication material, account identifiers, session identifiers, prompts/transcripts, and other
  secrets are forbidden from both the manifest and the record projection.
- Historical records are frozen. A missing object may be classified only in a derived sensitivity view as
  `legacy_inferred_claude` when cockpit history proves sole-Claude execution; otherwise it is
  `unknown_legacy`. Neither group enters the recorded Claude-versus-Codex comparison.

`created_by: "synthesizer"` remains mandatory and unchanged: it names the emitter role, not the provider.

### Data-needs decision guidance v2 (required for new publications from 2026-08-14)

`missing_data[]` remains the full human-readable gap inventory. `data_needs[]` is its smaller,
machine-actionable decision queue. Every record newly published on or after 2026-08-14 must carry both
`data_needs_schema_version: "2.0"` and `data_needs`, including a rerun whose original `decision_date`
is older and an explicit empty array when no missing observation currently caps the call.
Legacy records without the discriminator remain valid and are never reinterpreted as v2.

Each v2 entry has exactly this shape (`next_release` is the only optional field):

```json
{
  "need_id": "filed-segment-margin",
  "priority": 1,
  "series": "Quarterly filed segment revenue and operating profit for the cloud segment",
  "why_it_caps": "the segment margin that drives the bull case is not disclosed in the available interim filing",
  "expected_impact": {
    "if_supportive": "a filed margin above the scenario threshold would strengthen the operating-leverage case, subject to cash conversion",
    "if_adverse": "a filed margin below the threshold would weaken or reject the bull case"
  },
  "filing_required": true,
  "entry_orbs": [
    {
      "module": "earnings",
      "agent": "margin-drivers",
      "why": "this orb owns the segment-margin bridge",
      "confidence": 0.96
    }
  ],
  "suggested_source": {
    "name": "Company quarterly exchange filing",
    "acquisition": "manual",
    "access": "public",
    "licensing_basis": "official public filing; confirm the applicable exchange terms when acquired"
  },
  "tier": 5,
  "cadence": "quarterly",
  "next_release": "2026-10-29"
}
```

Contract:

- Emit no more than five entries. Rank by **decision value**, not expected score lift. Priority `1` is the
  single missing observation most likely to change or reject the action, or to resolve the largest active
  cap. Source quality and feasibility break ties. The array itself is ordered by integer priority exactly
  `1, 2, ... N`; `data_needs[0]` is priority `1`, and `1` cannot be omitted.
- `series` says exactly what is missing. `why_it_caps` names the unresolved question and the cap already
  active today. `expected_impact.if_supportive` and `.if_adverse` are both required and conditional.
  Evidence can strengthen, weaken, or leave the decision unchanged. It never guarantees or mechanically
  lifts a rating, score, or conviction, and no numeric/promised conviction lift is allowed. Do not promise
  an upgrade/downgrade or write any numeric confidence/conviction claim, including `100%`.
- `entry_orbs` contains one or more exact `{module, agent, why, confidence}` objects. Module and agent names
  come from the discovered roster. `confidence` is routing confidence on a 0–1 scale, not investment
  conviction. V2 has no module-only `entry_modules` shortcut.
- `suggested_source` is a hint, not evidence that a source exists or that its rights are cleared. It contains
  exactly `{name, acquisition, access, licensing_basis}`. `acquisition` is one of `official_api`,
  `free_key_api`, `paid_api`, `scrape`, or `manual`; `access` is one of `public`, `licensed`, `restricted`,
  or `unknown`. `licensing_basis` says what is known or `unknown`. No URL appears anywhere in a v2 need.
- `filing_required: true` means only the statutory filing can close the gap and the item is not connector-
  dispatchable. `tier` is the source-hint ceiling (`5`, `9`, or `10`, never filing grade); `cadence` is one
  of `twelve_hourly`, `daily`, `weekly`, `monthly`, `quarterly`, `semiannual`, `annual`, or `event_driven`.
  `next_release`, if known from a schedule, is a real `YYYY-MM-DD` date on or after `decision_date`;
  otherwise omit it.
- V2 entries are exact: no URLs, `cap_lifted`, `entry_modules`, extra source fields, endpoint/schema/host
  details, or connector implementation promises. Those belong to later discovery, rights review, and build
  steps. A source hint can be wrong; obtaining data can leave the thesis unchanged.

This is an additive sub-contract: the record's top-level `schema_version` remains `"1.0"`. The dedicated
discriminator changes only `data_needs[]`, avoiding an ambiguous silent reinterpretation of older entries.

**Structured scenario authority for the final Ideas projection (additive).** A forward run that will be
re-projected into a final 3–6 month candidate uses this exact decision-record shape:

```json
{
  "scenario_horizon_days": 365,
  "scenarios": [
    {
      "scenario_id": "base-demand-normalises",
      "label": "base",
      "probability": 50,
      "probability_basis": "base rate: sector-median beat rate over the last 8 reported quarters, Capital IQ",
      "return_pct": 12.4,
      "price_target": 112.4,
      "conditions": ["Demand follows the filed base case"],
      "source": "Q1 FY27 results, exchange filing 2026-07-29, outlook section",
      "joint_probability_basis": null
    },
    {
      "scenario_id": "bull-demand-and-margin",
      "label": "bull",
      "probability": 25,
      "probability_basis": "empirical (n=9 over the last 9 reported quarters)",
      "return_pct": 35.0,
      "price_target": 135.0,
      "conditions": ["Demand exceeds the filed base case", "Gross margin clears the cited threshold"],
      "source": "Q1 FY27 results, exchange filing 2026-07-29; valuation synthesis §8",
      "joint_probability_basis": "The two conditions share the same volume-led operating-leverage driver."
    },
    {
      "scenario_id": "bear-demand-miss",
      "label": "bear",
      "probability": 25,
      "probability_basis": "judgment",
      "return_pct": -25.0,
      "price_target": 75.0,
      "conditions": ["Demand misses the filed downside threshold"],
      "source": "Q1 FY27 results, exchange filing 2026-07-29, risk section",
      "joint_probability_basis": null
    }
  ],
  "idea_valuation_bridge": {
    "source_horizon_days": 365,
    "method": "catalyst_partial_convergence",
    "convergence_fraction": 0.3,
    "rationale": "The dated catalyst can reveal part, but not all, of the one-year valuation gap.",
    "source": "Q1 FY27 results, exchange filing 2026-07-29; valuation synthesis §8"
  }
}
```

There are three to seven scenarios, ids and labels are unique, probabilities sum to 100, and each
scenario has at least one condition. `joint_probability_basis` is required as a non-empty explanation
when multiple independent conditions must hold simultaneously; otherwise it is `null`.

**`probability_basis` (additive, introduced 2026-08-29) is a separate field from `joint_probability_basis`
and required on every scenario row, per `CLAUDE.md` §10 HARD GATE 13.** It states one of three forms:
`"empirical (n=X over {window})"` (a measured frequency, only where `X` is at least 8 observations —
CLAUDE.md §10: "a probability computed from fewer than roughly eight observations ... is judgment
informed by that sample ... never present it as a measured frequency"), `"base rate: {named reference
class, source}"`, or `"judgment"`. Where `joint_probability_basis` explains why several SIMULTANEOUS
conditions move together (and is `null` for a single-condition case), `probability_basis` explains where
the PROBABILITY NUMBER ITSELF came from, and applies to every row regardless of how many conditions it
has. The two fields answer different questions and a scenario can require both. `scripts/eval.py` check
BC (mirrored live in `/research:full` Step 10B.1 via `scripts/scenario_integrity_checks.py`) fails a run
dated on/after 2026-08-29 that omits `probability_basis` on any row carrying a `probability`, whose text
matches none of the three forms, or whose `empirical` claim understates its own sub-8 sample size. Records
dated before 2026-08-29 omit the field; downstream consumers treat absence as unclassified. `schema_version`
stays `"1.0"` — the same additive convention as `conditions[]` / `joint_probability_basis`.

For Ideas,
`decision_record.scenarios[].price_target` is the source-horizon target. The final candidate preserves it
as `source_price_target` and computes its separate shorter-window `price_target` only through the exact
`idea_valuation_bridge`. The candidate copies ids, labels, probabilities, conditions, sources, and
conjunction bases exactly; it cannot silently author a new distribution.

**`edge_score` / `edge_proof` are additive** (introduced 2026-06-15) — they complete the `CLAUDE.md` §7 variant structure (consensus → priced-in → edge → *proof of edge*) and make the edge mechanical, so the confidence cap can bind to a number and the review loop can later grade it. Records dated before 2026-06-15 omit them; downstream consumers fall back to the narrative `variant_perception_*` fields and `confidence_score`. `schema_version` stays "1.0" — the same additive convention as `scenarios[]` and the `post_review_*` fields.

**`business_type` / `primary_valuation_method` are additive** (introduced 2026-06-18) — they make the sector overlay classification and the chosen valuation method machine-readable so Phase 4 can slice calibration by sector type and the eval harness (check W) can verify the method is not forbidden for the sector per `SECTOR_OVERLAYS.md`. Records dated before 2026-06-18 omit them; downstream consumers treat absence as `""`. `schema_version` stays "1.0".

**`confidence_inputs` / `analysis_confidence` / `conviction` / `sizing_hint` / `confidence_breakdown` are additive** (introduced 2026-07-11) — they split the single LLM-asserted `confidence_score` into a deterministic, auditable two-number scheme computed by `scripts/confidence.py`: `analysis_confidence` ("understanding" — evidence quality, direction-agnostic) and `conviction` (how much to bet, direction-aware). `conviction` is the drop-in successor to `confidence_score` (which the synthesizer sets equal to it for backward compatibility); the eval harness reconciles the scorecard `Conviction /100` against the JSON (check AI); `confidence_inputs` is recorded so a later gate can re-derive `conviction` from first principles (the `reconcile()` in `scripts/confidence.py`). Records dated before 2026-07-11 omit these; downstream consumers fall back to `confidence_score`. The numeric weights in `confidence.py` are uncalibrated priors (isolated in its `CONST` block) pending Phase-4/6 calibration — this makes the number auditable, not yet a validated probability. `schema_version` stays "1.0".

**`scenario_horizon_days` / structured scenario authority / `idea_valuation_bridge` and the selected
forecast fields are additive** (introduced 2026-08-03). They make the source distribution, shorter-window
bridge, and dated catalyst machine-resolvable before any candidate exists. Older records may omit them;
such a record remains readable by ledger consumers but is `not_assessable` for a new Ideas admission.
These fields do not change the standing thesis or its scenario math. They prevent the downstream
projection from inventing ids, conditions, sources, targets, probabilities, or catalyst/falsifier terms.
`schema_version` stays `"1.0"`.

**`margin_of_safety_pct` is additive** (introduced 2026-07-10) — the valuation module's margin of safety, `((base FV − price) / base FV) × 100`, made machine-readable so the eval harness (check M) can re-derive it from the `base`-labelled `scenarios[]` target instead of trusting the prose. It is `null` ONLY when there is no pool-verified price ("Not assessable") — for runs dated on/after 2026-07-10 the gate FAILS a `null` value that `entry_price` + the base scenario's `price_target` make derivable, so it is required once assessable, not merely reconciled when present. Records dated before 2026-07-10 omit it; downstream consumers treat absence as unquantified. `schema_version` stays "1.0" — the same additive convention as `scenarios[]` / `edge_score`.

---

## 6. Forecast Ledger Schema

Each element of `decision_record.forecast_ledger` — the machine-readable form of the synthesizer's Forecast Ledger (`CLAUDE.md` §19):

```json
{
  "forecast_id": "FC-TICKER-RESULTS-2026Q4",
  "prediction": "The next filed result will report volume growth of at least 12% year over year.",
  "probability": 65,
  "probability_basis": "empirical (n=11 over the last 11 reported quarters)",
  "time_window": "2026-11-01 to 2026-11-15",
  "window_start": "2026-11-01T00:00:00Z",
  "window_end": "2026-11-15T23:59:59Z",
  "status_as_of": "2026-08-03T09:00:00Z",
  "evidence_today": "Q1 FY27 results, exchange filing 2026-07-29, operating metrics",
  "source_citation": "Company results calendar, exchange filing 2026-07-29",
  "metric": "Reported volume growth",
  "threshold": "At least 12% year over year",
  "causal_steps": [
    "The filed result reports the source-bound volume metric.",
    "The reported result changes the market's matching earnings estimate."
  ],
  "confirmation_trigger": "Reported volume growth is at least 12% year over year.",
  "falsification_trigger": "Reported volume growth is below 5% year over year.",
  "stock_bullish_trigger": "The filed metric clears 12% and consensus earnings revisions rise.",
  "stock_bearish_trigger": "The filed metric is below 5% or consensus earnings revisions fall.",
  "owner_module": "earnings",
  "confidence_score": 65,
  "status": "open",
  "forecast_type": "catalyst_or_estimate_revision"
}
```

Rules:
- Only include forecasts with enough evidence.
- `probability` must be a **number in [0, 100]** using the §10 percentage-point scale — Remote: 0–10, Very unlikely: 10–25, Unlikely: 25–45, Toss-up: 45–60, Likely: 60–75, Very likely: 75–90, Almost certain: 90–100. A decimal-fraction value (e.g. `0.6` instead of `60`) is a defect: it looks like a correct probability but silently corrupts Phase 4 Brier-score computation, which treats the input as a percentage (60% becomes 0.6%). `null` is allowed when no reliable probability estimate can be made, but the entry cannot contribute to Brier-score calibration. Eval check T2 (landing 2026-06-22) enforces this: non-numeric values, values outside [0, 100], and values in the open interval (0, 1) all FAIL.
- Every forecast must have a **confirmation** trigger and a **falsification** trigger.
- A forecast selected by a final Ideas candidate has one stable `forecast_id` and must also carry
  machine-readable `window_start`, `window_end`, and `status_as_of` timestamps; one exact
  `source_citation`; an observable `metric` and `threshold`; at least two non-empty `causal_steps`; and
  symmetric `stock_bullish_trigger` / `stock_bearish_trigger`. Its `status` must still be `"open"` when
  selected. `candidate.catalyst.forecast_id` selects exactly one such row. Catalyst and falsifier fields
  are copied mechanically from that row, so no free-prose catalyst can be introduced during projection.
- Forecasts must be reviewable later (resolved only via review records, §8 — `status` ∈ {open, confirmed, falsified, expired}).
- If no reliable forecast can be created, say why (and leave `forecast_ledger` as `[]`).
- `forecast_type` (**additive, introduced 2026-07-01**) tags what KIND of forecast this is, from a closed set: `revenue`, `margin_or_cost`, `earnings_eps`, `cash_flow`, `valuation_or_price_return`, `balance_sheet_or_solvency`, `governance_or_accounting`, `catalyst_or_estimate_revision`, `other`. This is orthogonal to `owner_module` (which module wrote the forecast) — a single module (e.g. earnings) routinely produces more than one forecast_type (a revenue call and a margin call behave differently under Phase 4 calibration and can fail for different reasons). Its purpose is to let `/research:calibrate` answer "which KIND of forecast is the engine systematically over/under-confident on," not just which module — a flat, unsliced Brier score hides that pattern no matter how much history accumulates. `""` (empty string) or the field's absence is allowed and treated identically — records dated before 2026-07-01 omit it; downstream consumers (calibrate) bucket those as "untagged" and never fabricate a type. Eval check T (the `T_forecast_ledger_quality` check) validates it against the closed enum, case-exact, when present, for runs dated on/after 2026-07-01 — same forward-looking-gate convention as check T2 for `probability`.
- **`owner_module`, `confidence_score`, and `evidence_today` are REQUIRED on every entry**, not optional extras — CLAUDE.md §19 lists all 8 fields (prediction, probability, time window, evidence today, confirmation trigger, falsification trigger, owner module, confidence score) as what "each ledger entry records." `owner_module` must be one of the discovered module roster names (self-discovered from `.claude/agents/*/99_*-synthesis.md` directory names per §26 — never hardcoded) and is what `/research:calibrate`'s `calibration_by_module` slices on; `confidence_score` must be a number in [0, 100] per §12; `evidence_today` must be non-empty and is what `/research:review-decisions`' luck-vs-skill judgment (§10 below) reads to see what was known AT THE TIME the forecast was made, not read back with hindsight. Eval check T (`eval_forecast_entry_completeness`, `OWNERCONF_DATE=2026-08-06`) enforces all three, same forward-looking-gate convention as T2/T3 above — a run dated before that predates the gate and is N/A.
- **`probability_basis` (additive, introduced 2026-08-29) is REQUIRED whenever `probability` is set** — CLAUDE.md §10 HARD GATE 13 applies to "every probability in §9 Risk Register and the Forecast Ledger," not only the §8 Scenario Model. Same three-form contract as `scenarios[].probability_basis` above (`"empirical (n=X over {window})"` with X ≥ 8, `"base rate: {class, source}"`, or `"judgment"`). Eval check BC (`eval_bc_probability_basis_stated`, `BC_DATE=2026-08-29`) enforces it on this array too, same forward-looking-gate convention — a run dated before that predates the gate and is N/A. Records omitting it are read as unclassified, never as a satisfied HARD GATE 13.

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
  "tracking_price": null,
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
  "action_now": {},
  "confidence_update": {},
  "next_check": {},
  "learning": {},
  "memo_delta": {},
  "pre_mortem_check": {}
}
```

`review_window` ∈ {30d, 90d, 180d, 365d, 24m, 36m, ad-hoc, post-mortem}. `thesis_status` ∈ {on-track, at-risk, confirmed, broken, expired}. `decision_quality` records the §10 luck-vs-skill verdict. `error_taxonomy` is populated only when the call went wrong (§12).

### Decision-memory fields — what to do and what the engine must learn (additive; required for reviews filed on/after 2026-08-23)

These fields turn an outcome review into a usable next decision without changing the frozen original:

```json
"action_now": {
  "label": "Keep watching",
  "reason": "The original Watchlist caution was confirmed; no new evidence clears the entry bar."
},
"confidence_update": {
  "before": 72,
  "after": 54,
  "change_reason": "Sales missed the dated threshold and the thesis weakened."
},
"next_check": {
  "date": "2026-10-08",
  "label": "Q3 results and pre-sales check",
  "trigger": "Test whether pre-sales growth recovers above the original threshold."
},
"learning": {
  "why_right_or_wrong": "The Watchlist call was right because the exact warning sign appeared.",
  "error_source": "",
  "rule_for_future": "Do not upgrade a property-cycle call before its dated pre-sales test clears.",
  "future_research_check": "Recheck pre-sales growth and backlog before discussing entry."
}
```

Rules:

- `action_now.label` is exactly one of `Hold`, `Add`, `Exit`, `Stay away`, `Keep watching`. It is the action **at review time**, not a rewrite of the original call. `Add` requires positive new evidence and a still-valid valuation/risk bar; never infer it from a rising price alone.
- `confidence_update.before` is the frozen decision-time conviction shown by the final published call (including a decision-time pre-mortem haircut). `after` is the review-time conviction that the **current action/thesis read** is correct. Both are 0–100 or `null`; never manufacture a number when the review lacks enough evidence. `change_reason` names the evidence that moved it.
- `next_check` names the event, metric, or filing — never only a date. `date` is ISO when proven, else `null`; `label` remains specific even if timing is unknown.
- `learning.why_right_or_wrong` separates price result from thesis result. `error_source` uses the §12 taxonomy when there was a miss, otherwise `""`. `rule_for_future` is a reusable process lesson. `future_research_check` is the exact assumption the next Research or Screener chat must recheck before answering.
- The information partition still applies. Outcome explanation may use post-decision facts. A claim that the original process was bad, and every `rule_for_future` based on that claim, must be supported only by evidence knowable on or before `decision_date`. Never teach the engine a hindsight lesson.
- The original `decision_record.json` remains immutable. These fields are append-only review evidence. Consumers must repeat the frozen original rating exactly; a `Watchlist`, `Avoid`, or `Stay away` call must never be described as “Nostra said enter.”

`tracking_price` (additive; review-file-only, never written to the frozen decision record) — the return anchor for a call whose `entry_price` is `null` (§4 barred a web/indicative price from populating the frozen record, so an entry-based return is otherwise impossible). It is a block `{ price, source, as_of, currency, established_at_window }`, source- and date-labelled (indicative/unverified is acceptable). The **first** review that finds a usable price establishes it; **every later window reuses that earliest block verbatim** so all windows measure from one fixed anchor, not a moving one. When `tracking_price` carries the return, `absolute_return_pct` = (review_price − tracking_price.price) / tracking_price.price × 100 and every `entry_price`-derived field stays `null`. `null` whenever `entry_price` exists or no usable price was found. `/research:calibrate` reads it so a null-entry call still enters the hit-rate and cohort math instead of being silently dropped.

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

### Pre-mortem check (`pre_mortem_check`) — audit-of-the-auditor (additive; required for reviews filed on/after 2026-07-17)

The finish-gate's pre-mortem (`/research:full` step 10B.2, `.claude/commands/research/pre-mortem.md`) writes its own falsifiable prediction on every conviction-basket run: a `verdict` (`Survives` / `Survives with haircut` / `Does not survive — downgrade` / `Thesis broken`), a `killer_risk`, and a per-criterion `kill_criteria_attack[]` — then that verdict is never checked again. `CLAUDE.md` §19 is explicit: "a forecast that cannot be checked later is not a forecast." Until this block existed, the pre-mortem's verdict was exactly that — unchecked. This closes the loop, and it is the one place the engine measures whether its own red-team layer is adding signal or just adding a haircut nobody verifies.

```json
"pre_mortem_check": {
  "pre_mortem_file": "",
  "pre_mortem_verdict": "",
  "pre_mortem_confidence_haircut": null,
  "outcome_vs_verdict": "",
  "notes": ""
}
```

Rules:

- `pre_mortem_file`: repo-relative path to the pre-mortem report actually read (the highest `_vN` under `<RUN_ROOT>/pre_mortem*.json`), or `""` if none exists.
- `pre_mortem_verdict` / `pre_mortem_confidence_haircut`: copied verbatim from that file — what the pre-mortem CLAIMED, not what this review is judging.
- `outcome_vs_verdict` ∈ {`not_applicable`, `too_early`, `vindicated`, `contradicted`, `partial`}:
  - `not_applicable` — no `pre_mortem*.json` exists in the run root. This value is reserved for exactly that case; it must never be used when a pre-mortem file exists but the reviewer simply didn't check it.
  - `too_early` — a pre-mortem exists, but this review's own `thesis_status` is still `on-track` with nothing in `risk_results` yet resolved either way.
  - `vindicated` — the pre-mortem's verdict correctly anticipated a **resolved** outcome: a `Survives`/`Survives with haircut` verdict paired with `thesis_status` = `confirmed` and the pre-mortem's own `killer_risk` reading `not materialized` in `risk_results`; OR a `Does not survive — downgrade`/`Thesis broken` verdict paired with `thesis_status` ∈ {`at-risk`, `broken`}. A still-`on-track` thesis is **never** vindication — nothing has resolved either way yet, so it is `too_early`. (Crediting the red-team on an unresolved 30d/90d review is precisely the false confidence this block exists to measure; `not assessable` is by definition unresolved and can never vindicate.)
  - `contradicted` — the pre-mortem's verdict was wrong, in either of the two directions an audit layer can fail: **false comfort** (`Survives`/`Survives with haircut` paired with `thesis_status` ∈ {`at-risk`, `broken`}, or the pre-mortem's own `killer_risk` shows materialized/at-risk in `risk_results` — the red-team missed the actual proximate cause); or **excess caution** (`Does not survive — downgrade`/`Thesis broken` paired with `thesis_status` = `confirmed` — the red-team would have killed a call that played out fine, the same false-negative cost §24 warns against).
  - `partial` — mixed signal that does not cleanly fit the above; `notes` must explain the split.
- `notes`: 1–3 sentences. For `vindicated`/`contradicted`, name the specific `kill_criteria_attack` item (if any) that drove the read — this is the diagnostic payoff, not a formality.
- Additive: `schema_version` stays "1.0". Reviews filed before 2026-07-17 omit the block.

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
- pre-mortem calibration (was the red-team's `Survives` / `downgrade` verdict later vindicated or contradicted — §8 `pre_mortem_check`)

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
- **Phase 4 — Aggregate cohort + calibration reporting** (`/research:calibrate` → `analyses/performance/<DATE>_decision_performance_summary.md` + `_calibration_summary.json`) — **Command added (pre-data).** Computes ledger inventory + process metrics now; the selected-minus-rejected spread, hit rate, and the Brier/reliability calibration compute once enough resolved reviews exist (the §3/§4 floors in the command). **Error-taxonomy tally added (2026-07-16):** the command previously computed accuracy (Brier, hit rate, calibration_by_module/forecast_type) but never touched the §12/CLAUDE.md §20 `error_taxonomy` field that `review-decisions` was already populating on every review — so the ledger could tell the engine *that* it was wrong, never *why*, in aggregate. `/research:calibrate` §5 now tallies `error_taxonomy` across all review records into `error_taxonomy_distribution`, a flat count exempt from the resolved-history floor (mirroring the screener swarm's `scripts/screener_calibrate.py`, which already tallies its own `error_taxonomy_tag` the same way) — so the dominant error category surfaces from the first tagged miss, not after ten of them. **Truth-integrity gate added (2026-07-30):** every standing run's Brier/hit-rate/cohort-return contribution is now gated on its own truth-integrity status — see §18a below.
- **Phase 5 — Calls-tracker dashboard / viewing layer** — **Added.** A **read-only viewing/aggregation layer** over the records and reviews — the place to see every call the engine made and what has happened to the company since, as time moves forward. Two twinned surfaces: the cockpit's live **Calls** view (`GET /api/calls`) and the downloadable **`/research:track`** command (writes dated `analyses/tracking/<DATE>_calls_tracker.{md,json}`, like Phase 4's `analyses/performance/` outputs). Both build, per call, a timeline of the scheduled review checkpoints (30d/90d/180d/365d) plus any ad-hoc reviews, each marked **done / due / overdue / upcoming** using the **same rule as `.claude/hooks/review_due.py`** and `review-decisions` Step 3 (local date, lexical ISO compare, `*_<window>_decision_review*.json` glob) — so the hook, the command, the API, and the static snapshot never disagree. **Inviolable:** this layer **never edits** any `decision_record.json`, `final_thesis.md`, or review file; it writes only the derived, regenerable dashboard under `analyses/tracking/`. The live **"Update now"** trigger delegates to Phase 3 `/research:review-decisions <ticker> ad-hoc` (it files an append-only review) — there is **no parallel review framework**. Both surfaces also carry, per done checkpoint, the review's `memo_delta_file` and `stage_one_comment` (§8), so the human-readable delta is one click from the timeline.
- **Phase 6 — Calibration feedback gate** — **Added (forward-looking, pre-data).** Phases 1–5 make decisions recordable, reviewable, aggregable, and viewable — but until now, nothing closed the loop back into the synthesizer that writes the *next* decision. `/research:calibrate` could always compute `calibration_by_module` / `calibration_by_forecast_type`, but no agent ever read the file it wrote. The synthesizer (`.claude/agents/synthesizer.md` Pre-Write Gate 4C) now reads the latest `analyses/performance/*_calibration_summary.json` dated on/before its own run and, where a module used in the current run has a non-"insufficient" calibration slice showing poor calibration, applies a bounded confidence haircut and records the check (whether or not it fired) in a new additive `decision_record.json` field, `calibration_feedback` (§18). `scripts/eval.py` check AG guards this mechanically so the gate cannot be silently skipped once real calibration data exists. Landed intentionally while the ledger is still pre-data (0 resolved reviews) so the wiring is proven correct — always recording a `not_available`/`pre_data` status honestly — before BG's and HCG's first 30-day reviews (due 2026-07-01) produce the first real signal.

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

---

## 18. Calibration Feedback Gate (Phase 6)

Phase 4 (`/research:calibrate`) can compute whether the engine's stated confidence matches realized outcomes, sliced by `owner_module`, by `forecast_type`, and by `thesis_type` (§6, §13, `CLAUDE.md` §14) — plus a flat, unsliced tally of WHY past calls went wrong, `error_taxonomy_distribution` (§12, `CLAUDE.md` §20). Until this section, that computation was a dead end: it was written to `analyses/performance/<DATE>_calibration_summary.json` and never read again. A calibration loop that only measures and never acts is not a learning loop (§1, `CLAUDE.md` §19) — this section closes it, for all four.

**Where it runs.** The master synthesizer (`.claude/agents/synthesizer.md`), as Pre-Write Gate step 4C, immediately after the §24 rejector-filter audit (4A) and the forensic roll-up (4B) and before the contradiction audit (5).

**What it reads.** `Glob analyses/performance/*_calibration_summary.json`, filtered to files whose `<DATE>` filename prefix is **on or before the current run's own decision date** (a synthesizer can only act on calibration history that existed at the time it ran — never a future snapshot), then take the latest such file (ties broken by filename, so a `_v2` correction wins over its base file for the same date, matching the versioning convention `/research:calibrate` already uses). Call the parsed JSON (or `None`, if no qualifying file exists) the **as-of calibration summary**.

**What it does.**

1. If no as-of calibration summary exists: `status = "not_available"`. No adjustment. This is the expected, honest state until the first calibration snapshot lands.
2. If one exists but its top-level `"verdict"` starts with `"Pre-data"` (§4/§7 of `/research:calibrate` — too few resolved reviews or resolved forecasts to compute a real slice) **AND no `error_taxonomy_distribution` category in it already has count ≥ 2**: `status = "pre_data"`. No adjustment. If the verdict is Pre-data but a leading error-taxonomy category already exists, do **not** stop here — proceed to step 6 below, which is never gated by this floor (steps 3–5 still do not apply, since the module/forecast-type/thesis-type slices genuinely have no usable signal below their own floor).
3. Otherwise, for **every module whose `99_*-synthesis.md` this run actually read** (self-discovered from the run folder per `CLAUDE.md` §26 — never a hardcoded module list, so a future module is covered automatically), look up `calibration_by_module[<module folder name>]`:
   - Skip (cannot act on) any entry that is the string `"insufficient (N=k)"` — below its own floor.
   - A real slice **flags** the module when its Brier score is worse than the naive always-toss-up baseline (`brier > 0.25`), OR its realized hit rate for its dominant stated confidence band falls outside that band's own §10 range by more than 20 percentage points on either side.
4. Then, for **every distinct `forecast_type` value appearing in THIS run's own `forecast_ledger`** (the array this synthesizer is about to write to `decision_record.json` — never the historical corpus), look up `calibration_by_forecast_type[<forecast_type>]` in the same as-of summary (mapping a null/blank `forecast_type` to the key `"untagged"` first — that is where `scripts/calibrate.py`'s `_slice_key` buckets it, per the `forecast_type` field note above, so a raw `null`/`""` lookup would miss its own slice), using the identical rule as step 3: skip `"insufficient (N=k)"`, flag on `brier > 0.25` or a >20-point band miss. **This is a real, independent trigger, not a transparency-only read** — a module can be clean while the forecast TYPES this thesis actually leans on (e.g. every `catalyst_or_estimate_revision` call across the ledger) are systematically overconfident, and step 3 alone would miss that.
5. Then, for **every distinct value in THIS run's own `thesis_type[]`** (the array this synthesizer is about to write per `CLAUDE.md` §14 — never the historical corpus), look up `calibration_by_thesis_type[<value>]` in the same as-of summary, using the identical rule: skip `"insufficient (N=k, tickers=t)"`, flag on `brier > 0.25` or a >20-point band miss. `scripts/calibrate.py` builds this slice as **multi-label** — a decision record tagged `["Company-specific", "Governance turnaround"]` counts toward BOTH slices, never just one — so this is the mechanism that finally lets `CLAUDE.md` §24 Filter 2's "a turnaround thesis carries a base-rate penalty" draw on the engine's OWN historical turnaround hit rate, not only a generic external base rate. Independent trigger, same reasoning as step 4: a module and every forecast type this thesis leans on can be clean while its own thesis-type category (e.g. every "Governance turnaround" call the engine has ever made) is systematically overconfident.
6. **Then, the error-taxonomy trigger — a different SHAPE of check, not a fourth slice-match.** Steps 3–5 each match a VALUE that appears in THIS run (a module used, a forecast type, a thesis type) against a calibration slice keyed by that same value. `error_taxonomy_distribution` (§12, `CLAUDE.md` §20) has no such per-run dimension — it is a flat, standing tally of WHY the engine's past calls went wrong, computed by `/research:calibrate` since Phase 4 but, until this step, read back only in that command's own human-facing narration (`.claude/commands/research/calibrate.md` step 3: "the leading `error_taxonomy_distribution` tag(s) if any count ≥ 2 ... never gated by the floor"), never by anything that changes behavior on a live run. **This step runs regardless of whether step 2 already found the overall verdict `"Pre-data"`** — the module/forecast-type/thesis-type slices in steps 3–5 genuinely have no usable signal below their own floor and stay skipped in that case, but the error-taxonomy tally is honest at any N, so a Pre-data run with an already-leading category is not exempt. Find every **leading category** — a key in the as-of summary's `error_taxonomy_distribution` with count ≥ 2 (the same threshold the narration step already uses, reused rather than inventing a new one). Write `error_defense_evidence` as an object **whenever this step runs at all — even `{}` when no category is currently leading** — so an absent object is never indistinguishable from a synthesizer that skipped the check entirely. For **each** leading category, this synthesizer must write one entry in `error_defense_evidence[<category>]`: a concrete, cited sentence naming the specific check, module finding, or artifact from THIS run that guards against that exact failure mode recurring (e.g. `"bad extraction (n=6) → verify-evidence audit (analyses/<TICKER>_<DATE>/verify_evidence/verification_report.json) found 0 unverified Level 4-5 citations across 41 checked claims"`), OR — if no such genuine defense exists — the literal string `"no defense evidence found"`. A category whose entry is that literal admission is a leading-category flag: add it to `leading_error_categories_flagged`, and add **only** categories that are actually leading right now — flagging an unrelated or stale category is not a valid trigger and must not be used to claim the haircut is traceable. This cannot be faked past a mechanical check (a vague, uncited sentence fails exactly like an admitted absence), but it also cannot verify the cited defense is TRUE — that stays a judgment call the synthesizer is accountable for, same limit as steps 3–5's Brier/hit-rate reads.
7. If **any** module (step 3) OR **any** forecast type (step 4) OR **any** thesis type (step 5) OR **any** leading error-taxonomy category (step 6) is flagged: `status = "applied"`. Apply a single, fixed **8-point confidence haircut** — one bounded, auditable constant shared by all four triggers, never additive (a module flag, a forecast-type flag, a thesis-type flag, and a leading-error-category flag together still cost 8 points, not 32) and never stacked per extra flag within any list. Name every flagged module in `modules_flagged`, every flagged forecast type in `flagged_forecast_types`, every flagged thesis type in `flagged_thesis_types`, and every flagged category in `leading_error_categories_flagged`, each with the Brier score / hit-rate numbers or the "no defense evidence found" admission that flagged it, in both the Pre-Write Gate output and the Confidence Scoring Rules "Additional downgrades" list.
8. If checked (every step among 3–6 that actually applied — step 6 always applies once the summary exists; steps 3–5 apply once the overall verdict has cleared its own Pre-data floor) and nothing is flagged in any of them: `status = "checked_no_action"`. No haircut — but the check still ran and is recorded, so a silent skip is distinguishable from an honest clean check. (This is also how a Pre-data-but-errtax-active run resolves cleanly: steps 3–5 are inapplicable below their own floor, but step 6 ran and found nothing to flag, so the overall status is `"checked_no_action"`, never `"pre_data"`.)

**What it must never do.** It must never *raise* confidence. A module with unusually good historical calibration is not evidence this specific thesis is more likely correct — asymmetry matters here exactly as it does in the Confidence Scoring Rules generally (§12 `CLAUDE.md`: high scores require specific, cited evidence for THIS thesis, not a borrowed track record). It must never invent numbers: `brier`/`hit_rate` come only from the as-of calibration summary's own computed fields, never estimated.

**Schema addition (`decision_record.json`, additive — the Phase 2 schema in §5 is otherwise preserved unchanged):**

```json
"calibration_feedback": {
  "source_summary": "analyses/performance/<DATE>_calibration_summary.json",
  "status": "not_available",
  "haircut_points": 0,
  "modules_flagged": [],
  "flagged_forecast_types": [],
  "flagged_thesis_types": [],
  "leading_error_categories_flagged": [],
  "error_defense_evidence": {},
  "rationale": ""
}
```

- `source_summary`: path to the as-of calibration summary used, or `null` if `status` is `"not_available"`.
- `status`: exactly one of `not_available` / `pre_data` / `checked_no_action` / `applied`.
- `haircut_points`: `0` unless `status == "applied"`, in which case the fixed constant (`8`).
- `modules_flagged`: the module folder names that triggered the haircut via step 3; `[]` unless a module flagged.
- `flagged_forecast_types` (additive, introduced 2026-07-23 — closes the gap where `calibration_by_forecast_type` was computed by `/research:calibrate` since Phase 4 but never read back by this gate): the `forecast_type` values from THIS run's own forecast ledger that triggered the haircut via step 4; `[]` unless a forecast type flagged. Records dated before 2026-07-23 omit it; treat absence as `[]`.
- `flagged_thesis_types` (additive, introduced 2026-07-27 — closes the twin gap where `calibration_by_thesis_type` did not exist at all until now, so `CLAUDE.md` §24 Filter 2's turnaround base-rate penalty had no way to draw on the engine's own historical turnaround hit rate): the `thesis_type[]` values from THIS run that triggered the haircut via step 5; `[]` unless a thesis type flagged. Records dated before 2026-07-27 omit it; treat absence as `[]`.
- `error_defense_evidence` (additive, introduced 2026-07-29): an object keyed by every leading `error_taxonomy_distribution` category (count ≥ 2) in the as-of summary, whether or not it ends up flagged — one entry per category, per step 6. `{}` when the as-of summary has no leading category yet (the common early state). Records dated before 2026-07-29 omit it.
- `leading_error_categories_flagged` (additive, introduced 2026-07-29 — closes the third instance of the same "measured but never consumed" gap: `error_taxonomy_distribution` has been computed by `/research:calibrate` since Phase 4 but was read back only in that command's own prose narration, never by anything that changes behavior on a live run): the `error_taxonomy_distribution` category names from the as-of summary whose `error_defense_evidence` entry is the literal admission `"no defense evidence found"`, per step 6; `[]` unless a category flagged. Records dated before 2026-07-29 omit it; treat absence as `[]`.
- `status == "applied"` requires **at least one** of `modules_flagged` / `flagged_forecast_types` / `flagged_thesis_types` / `leading_error_categories_flagged` to be non-empty (any one can carry the flag alone; the others are not required to be non-empty when one already justifies the haircut).
- `rationale`: one or two sentences naming the as-of summary's verdict and, when checked, the Brier score / hit-rate numbers of whichever module(s), forecast type(s), and/or thesis type(s) actually flagged, plus any leading error-taxonomy category that flagged on an admitted "no defense evidence found" — plain enough that a reviewer can verify the haircut without opening the calibration summary.

**Regression protection.** `scripts/eval.py` check AG enforces, for runs dated on/after the gate's rollout date, that `decision_record.json` carries a well-formed `calibration_feedback` object whose `status` is consistent with whether an as-of calibration summary exists and what its verdict says — the same mechanical, forward-looking-gate pattern already used for checks AC–AF (§24 filters). A run that has an as-of calibration summary available but omits `calibration_feedback` entirely fails the suite: the gate cannot be silently dropped once real calibration data exists. On/after `AG_FTYPE_DATE` (2026-07-23), the check also enforces that an `"applied"` status is traceable to a non-empty `modules_flagged` OR a non-empty `flagged_forecast_types` — an `"applied"` haircut backed by neither now fails the suite, so the forecast-type trigger cannot be silently skipped either. On/after `AG_TTYPE_DATE` (2026-07-27), the same traceability requirement extends to `flagged_thesis_types` (an `"applied"` haircut may now be backed by any of the three lists), and a `"checked_no_action"` status must carry an empty `flagged_thesis_types` — so the thesis-type trigger gets the identical regression protection the forecast-type trigger already has. On/after `AG_ERRTAX_DATE` (2026-07-29), the same traceability requirement extends to `leading_error_categories_flagged`, and `"checked_no_action"` must likewise carry it present and empty; `error_defense_evidence` must be present as an object (`{}` at minimum) whenever this step applies at all — **not only when a category is currently leading** — so an absent object cannot hide behind a Pre-data-looking run with no leading categories yet; whenever the as-of summary DOES have any leading `error_taxonomy_distribution` category (count ≥ 2), the check additionally enforces that `error_defense_evidence` carries a non-trivial (≥ 20 character) entry for every such category, and that a category's presence in `leading_error_categories_flagged` is exactly consistent with its `error_defense_evidence` entry being the literal `"no defense evidence found"` — a category cannot be flagged while claiming a real defense, or clean while admitting it has none. Every entry in `leading_error_categories_flagged` must also be a string that names a category the as-of summary's own `error_taxonomy_distribution` is ACTUALLY leading right now — a malformed (non-string) entry is reported as a violation rather than crashing the check, and a well-formed but unrelated or stale category name is rejected as not traceable, so flagging an irrelevant category can never substitute for defending (or admitting no defense against) a real one. And — closing the gap where an overall Pre-data verdict previously excused skipping this step entirely — the check's own `status` expectation is no longer a blind function of the as-of summary's top-level verdict: a `"Pre-data"` verdict only permits `status = "pre_data"` when the summary ALSO carries no leading error-taxonomy category; once one exists, `status` must be `"checked_no_action"` or `"applied"` even while the module/forecast-type/thesis-type slices remain genuinely below their own floor. Eval.py cannot judge whether a cited defense is TRUE (that stays a human/reviewer judgment call, same limit as the Brier/hit-rate reads above); it can only verify one was written, and that the record does not contradict itself. The check further enforces that the recorded `haircut_points` is exactly the fixed `8`-point constant when `status == "applied"` (any other positive value fails — the haircut is a single bounded constant, not a free magnitude), and — whenever the run records `confidence_inputs.calibration_haircut` (present for runs ≥ 2026-07-11) — that this scorer input equals the recorded haircut (`8` when `applied`, `0` otherwise). Without that last tie, an `"applied"` haircut could be recorded here yet never subtracted from conviction by `scripts/confidence.py` — the "measured but never acted on" dead-end this whole gate exists to close.

**Why 8 points, why not per-slice compounding.** A larger or per-module-additive haircut would let a noisy early slice (small-N, per §4/§11 floors already gating whether a slice is even "insufficient") swing confidence by more than the evidence supports. A fixed, disclosed, single-application constant keeps the adjustment auditable and prevents the gate from becoming a second, uncontrolled rating-cap mechanism alongside the Rating Cap Rules. As real calibration history accumulates (post the first 30-day reviews, due 2026-07-01), this constant should be revisited against realized Brier/hit-rate evidence — not tightened or loosened on intuition.

**Commodity-swarm twin (added 2026-07-21).** The research swarm closed this loop first (Phase 4 → Phase 6, above); the screener swarm already had its own (`screener:calibrate` → the conviction rescorer). The commodity swarm had `commodity:review` (Phase 3 — it could judge one past `Action:` verdict) but nothing aggregated those reviews or fed them back — `commodity/review.md`'s own closing line named this as the deliberate next step. `scripts/commodity_calibrate.py` (Phase 4) + `.claude/commands/commodity/calibrate.md` mirror this section exactly, sliced by `calibration_by_commodity` instead of `calibration_by_module` (the commodity swarm has one terminal synthesis, not several upstream modules to slice by); `.claude/agents/commodity/commodity-thesis/99_commodity-thesis-synthesis.md` WORKFLOW step 4 is the Phase-6 gate itself, and `scripts/validate_screener_json.py`'s `check_commodity_calibration_gate` is the commodity-scoped twin of `eval.py` check AG (rollout date `COMMODITY_CALIBRATION_GATE_DATE = "2026-07-21"` — the four commodity runs committed before this date are N/A, not violations). See `frameworks/commodity/decision_record.schema.json`'s `calibration_feedback` property for the (near-identical) schema addition.

**Commodity-swarm error-taxonomy extension (added 2026-08-10).** The commodity twin above landed 2026-07-21 — eight days *before* the research swarm gained the error-taxonomy trigger (step 6 above, `AG_ERRTAX_DATE = "2026-07-29"`) — and was never backported: `scripts/commodity_calibrate.py` has computed `error_taxonomy_distribution` since it shipped, but it was read back only in `.claude/commands/commodity/calibrate.md` step 3's human-facing narration ("the leading `error_taxonomy_distribution` / `decision_quality_distribution` tag(s) if any count ≥ 2 ... never gated by the floor") — never by a gate that changes behavior on a live commodity run. The exact "measured but never consumed" gap this section's `error_defense_evidence` / `leading_error_categories_flagged` fields already closed for research, closed here on the identical design: `99_commodity-thesis-synthesis.md` WORKFLOW step 4 now carries a second, independent trigger alongside the original hit-rate slice — every leading `error_taxonomy_distribution` category (count ≥ 2) in the as-of `commodity/performance/<DATE>_calibration_summary.json` must carry a concrete, cited defense in `calibration_feedback.error_defense_evidence`, or the admitted literal `"no defense evidence found"` (in which case the category is added to `calibration_feedback.leading_error_categories_flagged`). Either trigger — a flagged commodity hit-rate slice OR a flagged leading error-taxonomy category — independently justifies the same fixed, non-additive 8-point haircut; a `"Pre-data"` as-of verdict no longer excuses skipping the error-taxonomy check once a category is already leading (mirrors this section's step 6 exactly). `frameworks/commodity/decision_record.schema.json`'s `calibration_feedback` property carries the two additive fields; `scripts/validate_screener_json.py`'s `check_commodity_calibration_gate` enforces them forward-looking from `COMMODITY_CALIBRATION_ERRTAX_DATE = "2026-08-10"`, with a fixture-free selftest truth table (`_selftest_calibration_gate`, run via `--selftest`) covering every new branch since `--fixture`'s four committed pre-gate commodity runs cannot reach them.

---

## 18a. Truth-Integrity Exclusion — Verify-Evidence Feeds The Scoreboard (added 2026-07-30)

`/research:verify-evidence` (CLAUDE.md §3/§5/§6/§10/§15) audits a finished run's citations, math, and cross-module anchors, and the `/research:full` finish-gate stamps `final_thesis.md` **PROVISIONAL** when that audit is missing or not Clean/Minor. Until this section, that signal was a dead end: `verification_report.json` and the PROVISIONAL banner sat in the run folder, read by nothing downstream. `scripts/calibrate.py`'s Brier/hit-rate corpus and `/research:track`'s calls-tracker dashboard both scored and displayed a PROVISIONAL run identically to a Clean-verified one — a run the engine itself had flagged as possibly wrong could inflate or deflate the very calibration numbers Phase 6 (§18) reads back into the next synthesizer, and a human scanning the tracker had no way to tell a flagged call from a verified one.

**What it does.** `scripts/ledger_records.py`'s `resolve_integrity_status(run_dir)` reads the SAME two signals the finish-gate itself checks — the PROVISIONAL banner text in `final_thesis.md`, and the latest `verification_report*.json`'s `verdict` — and attaches one of three statuses to every `load_standing_records()` entry (`entry["integrity"]`), resolved once and consumed consistently everywhere, exactly like corrections/supersession (§4a) already are:
- **`verified`** — a verification report exists with verdict Clean/Minor issues, and no PROVISIONAL banner.
- **`provisional`** — the PROVISIONAL banner is present, OR a verification report exists with any other verdict (Material issues / Failed / unreadable — fail-closed, mirroring the finish-gate's own fail-closed rule at `/research:full` step 10B.2).
- **`unaudited`** — neither signal exists: verify-evidence never ran on this run (most runs before the audit trio existed, or a standalone module run). This is **not** evidence of a defect (CLAUDE.md §11 — an absent input is not the input's own failure) and is never treated the same as `provisional`.

**Where it is consumed.**
- `scripts/calibrate.py` (Phase 4) excludes every `provisional` run's forecasts and returns from `all_pairs` / `directional` / `basket_returns` / `basket_window_returns` / `cluster_by_ticker` — so a flagged run contributes to NONE of Brier, reliability bands, `calibration_by_module`/`forecast_type`/`thesis_type`, hit rate, the Selected−Rejected spread, the sequential e-value, or months-to-significance. It still appears in `inventory` (each row carrying its own `integrity_status`) and in the process metrics — never hidden, per CLAUDE.md §11 — and every excluded run is named in the new `excluded_provisional` field (`{n, runs: [{run_root, ticker, verdict, banner}], reason}`). An `unaudited` run is scored exactly as before.
- `/research:track` (Phase 5) surfaces `integrity_status` / `integrity_verdict` per call, in the JSON, the "All calls" table (a `⚠ UNVERIFIED` marker on the Verdict cell), and the per-company section (an explicit unverified callout naming the command to resolve it).
- **The live cockpit (added 2026-07-31).** `GET /api/calls` (`ui/server/src/outputs.ts::listAllCalls`) now calls `ui/server/src/ledger-corrections.ts`'s `resolveIntegrityStatusForRun()` — a byte-for-byte mirror of `resolve_integrity_status()`, locked against the same selftest cases via `ui/server/test/ledger-corrections.test.ts` (the same shared-fixture discipline §4a already uses for the corrections layer). Each call row now carries `integrity_status` / `integrity_verdict` / `integrity_banner`, and `CallsTracker.tsx` renders a `⚠ UNVERIFIED` badge on a provisional call, so the live dashboard — the one surface a human actually checks in real time — can no longer show a flagged run identically to a verified one. The same pass closed two sibling gaps in the same file, of the same root cause (the live view predating fields the Python side already preferred on read): `listAllCalls` now prefers `post_mortem_decision`/`post_mortem_basket` over the synthesizer's original fields when a terminal pre-mortem verdict capped the call (fix F28b — surfaced as a `⚠ CAPPED` badge), and prefers `post_review_confidence_score` over `confidence_score` when present (fix F28), exactly matching `/research:track`'s existing read-time preferences (`ledger-corrections.ts`'s `resolveDisplayFields()`).

**Why this belongs here, not only in verify-evidence itself.** Phase 6 (§18) already reads `calibration_by_module`/`forecast_type`/`thesis_type` back into the NEXT synthesizer's confidence score. Before this section, that feedback loop could be corrupted at its source by a single unverified run with badly mis-cited numbers — a Material/Failed run's fabricated-or-miscited return would silently move the Brier score every future run's Phase 6 gate reads. Gating calibrate.py at the ledger layer (not just flagging the individual run) means the corruption is caught exactly once, upstream of every consumer, instead of needing a parallel exclusion rule wired into calibrate.py, track.md, and any future consumer separately.

**What it does not yet do.** The corrected TS resolver (`resolveIntegrityStatusForRun`) is READ-only display wiring for the live Calls panel — it does not gate any live scoring surface the way `scripts/calibrate.py` gates Phase 4 (there is no TS-side equivalent of Brier/hit-rate computation to gate). If a future live scoring surface is added to the cockpit, it must exclude `provisional` runs the same way `calibrate.py` does, not just display the badge.
- review dates are generated from the decision date — ✓ (BG: 30/90/180/365d from 2026-06-01)

---

## 19. Qualified 3–6 Month Projection (forward runs; additive)

Every new `/research:full` run writes `<RUN_ROOT>/idea_3_6m.json` beside the immutable
`decision_record.json`. The preliminary wrapper is replaceable only once by the final post-audit
projection, whose only job is to ask
whether the standing research decision can be expressed honestly as one executable 90–183 day
distribution. The additive decision-authority fields in §5–6 exist specifically so the projection can be
mechanical rather than a second opinion.

The producer and runtime contract is canonical in `frameworks/ideas/README.md` and
`frameworks/ideas/idea-assessment.schema.json`. Before audits, the master synthesizer writes an explicit
preliminary `not_assessable` wrapper because no canonical market capture may precede the post-audit
manifest. After all decision/stamp mutations, the three audits rerun read-only and bind their conclusions
to the exact final thesis/decision hashes. Only then does the orchestrator create
`idea_projection_manifest.json`; the final re-projection then writes either one complete `candidate` or
an explicit `not_assessable` result with named gaps. The candidate carries the manifest digest and copies
the exact structured decision authority. Manifest validation also binds `ticker` and `decision_date` to
the exact ticker/date encoded by the run folder; matching audits cannot authorize a wrong-listing or
wrong-date record. After JSON Schema validation, the directory-locked freezer
performs semantic admission and the immutable first write in one atomic operation; there is no preview
result that can be retried after a crash. The runtime then rechecks current integrity, corrections,
supersession, identity, quote freshness, measured liquidity, evidence, caps, catalyst timing, horizon
bridge, scenario math, expected return, and worst-tail loss. A producer cannot store a pass or rank. The
freezer writes the first final result for every status, including a `not_applicable` snapshot for
`not_assessable`; the same run never gets a second attempt after seeing a gate or later market result.
This final negative requires a valid projection manifest. Manifest creation/validation failure is an
`IDEA-ADMISSION: error` hard stop, never a completed `not_applicable` result; the next attempt uses a new
dated run. The final replacement assessment is newly timestamped no earlier than that valid manifest; a
preliminary pre-manifest `created_at` cannot be carried into a frozen `not_applicable` result.

This projection follows the same immutability rule as the ledger:

- no prior dated run's `decision_record.json` or `final_thesis.md` is edited to create an idea; the
  current run's deterministic finish-gate changes must all finish before the manifest;
- once `idea_projection_manifest.json` exists, none of its pinned thesis, decision, or audit artifacts is
  edited; any changed audit requires a new dated run;
- module, single-agent, master-rerun, and standalone-audit entrypoints refuse writes into a sealed run;
- once `idea_admission.json` exists, its positive, rejected, or not-applicable assessment is immutable;
- no older dated run is backfilled merely to make the Ideas board look populated;
- new evidence creates a new dated run, and the newest standing assessment per listing is what the
  live board evaluates; and
- corrections/supersession and truth-integrity status are resolved on read, so a stale derivative cannot
  retain a clean label after its source run changes.

The outcome lane settles each qualified idea once at its own exact end date using source-bound,
split-adjusted market history. It never grades one forecast at both 90 and 180 days. Only an invalid
immutable admission or conflicting immutable cohort key is excluded from this frozen cohort. Later
corrections, supersession, or current source-artifact drift quarantine the live call but do not erase a
forecast whose admission-time integrity and digests were valid; allowing those later facts to remove a
known winner or loser would create survival bias. Calibration remains `pre_data` / `insufficient` until
the sample and benchmark coverage floors clear. The first post-floor label is `measured`, not
`calibrated`: sample size makes Brier and
signed/absolute forecast-error diagnostics judgeable; it does not prove the probabilities accurate.
