# Ideas: lead generation, qualification, and learning

The Ideas surface has two separate lanes. They must never be blended.

1. **News leads** are a cheap, high-recall skim of the ranked wire. They can suggest what to research.
   They are unverified, do not prove liquidity, and are not investment recommendations.
2. **Qualified 3–6 month ideas** come only from a completed full-research run, a deterministic market
   snapshot, a post-audit immutable `<RUN_ROOT>/idea_admission.json`, and every deterministic gate in
   `ui/server/src/qualified-ideas.ts`. A mutable assessment by itself can never enter the outcome cohort.

An empty lane is not one generic result. The live health contracts distinguish disabled, never run,
deferred, failed, successful-empty, no assessments yet, invalid assessments, and assessed-but-none-clear.
The UI must display the actual state and may never infer “nothing clears” from `ideas: []`.

## Producer contract: one assessment from every new full run

The master synthesizer writes a preliminary `<RUN_ROOT>/idea_3_6m.json`, then re-projects it once after
verification, pre-mortem, expectations-gap, and every deterministic mutation have finalized the standing
decision. The three audits run one final read-only time against those exact final bytes. Before those audits
finish, the preliminary artifact must be an honest `not_assessable` wrapper naming the pending post-audit
manifest/market capture; it cannot contain canonical market evidence because that evidence is not allowed
to exist yet. Its canonical JSON Schema is `idea-assessment.schema.json`.

- Write `schema_version: "idea-assessment/v1"` and exactly one wrapper per new dated run.
- `status: "candidate"` means the run produced a complete object for the runtime to judge. It does **not**
  mean the idea is qualified and must never contain a stored “passed” flag.
- Use `status: "not_assessable"`, `candidate: null`, and one or more specific `gaps` whenever any required
  field cannot be supported. Missing current price, measured liquidity, a 3–6 month bridge, a live dated
  catalyst, or a real loss case are each valid reasons. Do not fill them with inference.
- Do not edit or backfill an older run merely to populate the board. New evidence belongs in a new dated
  run; corrections and supersession remain append-only under `frameworks/DECISION_LEDGER.md` §4a.
- The artifact is a derivative of this run's thesis and decision record, not a second opinion. Every
  decision, score, red flag, edge claim, target, and catalyst must reconcile to those files and cite the
  source it actually came from in the root §5 format.
- The final candidate carries `decision_date` equal to the dated run and
  `projection_manifest_sha256` equal to the immutable post-audit manifest. It copies, without
  reinterpretation, the decision record's structured scenario, valuation-bridge, and selected-forecast
  authority described below.
- Final re-projection replaces the preliminary wrapper with a newly timestamped result. The final
  wrapper's `created_at` (and its candidate's matching `created_at`, when present) must be no earlier than
  the manifest's `created_at`. A final `not_assessable` wrapper must not retain its preliminary,
  pre-manifest timestamp; the freezer rejects that publication-order violation rather than freezing it as
  `not_applicable`.
- Set `candidate.policy_version: "ideas-policy/precal-v1"`. This freezes the admission rules used for
  later outcome calibration. Never edit the constants of an existing policy version; a real policy
  change adds a new version and preserves the old evaluator so history is not reclassified with hindsight.

Use stable identifiers:

- `assessment_id`: `<TICKER>-<YYYY-MM-DD>-3-6m`
- `candidate.idea_id`: `<TICKER>-<YYYY-MM-DD>-<long|short>-3-6m`
- `run_root`: the exact repo-relative `<RUN_ROOT>` for both wrapper and candidate.

The preliminary `not_assessable` wrapper has no `research` object. In a final candidate, set
`research.integrity_status` to `"unaudited"` (or `"provisional"` when the pinned thesis already carries
that stamp). A producer cannot bless itself; immutable admission resolves the pinned audit evidence and
the live reader projects that verified/provisional state. After all audits,
`scripts/create_idea_projection_manifest.py <RUN_ROOT>` pins the exact
`final_thesis.md`, `decision_record.json`, verification report, pre-mortem, and expectations-gap bytes.
It fails unless the decision record's ticker and decision date exactly match the ticker/date encoded by
the run folder, even when every audit repeats the same wrong identity.
Only then may market evidence be captured or a final candidate be written. After the manifest exists,
every pinned artifact is immutable: if an audit or pinned decision artifact needs to change, abandon that
projection and use a new dated run. `scripts/freeze_idea_admission.py` then binds the candidate, standing
decision authority, canonical market snapshot, manifest, and integrity digests. Both admission and
non-admission are first-writer-wins for that dated run. After a valid manifest exists, a final
`not_assessable` result is also frozen as `not_applicable`; the same run can never later replace that
negative assessment with a candidate. Manifest creation/validation failure is instead
`IDEA-ADMISSION: error`: stop without invoking the freezer and use a new dated run. A result with no valid
projection seal can never be represented as completed `not_applicable`.

Every object digest in the manifest, market snapshot, and admission uses one fail-closed cross-runtime
JSON byte contract (`scripts/canonical_json.py` and its TypeScript mirror). It sorts object names by UTF-16
code units, uses ECMAScript number/string spelling, normalizes negative zero to zero, and accepts only
finite numbers; any integer-valued magnitude outside JavaScript's safe range (`±(2^53−1)`) is rejected.
This is an intentionally restricted canonical-JSON subset, not merely “sorted keys” and not unrestricted
JCS. Producers must use the shared helper rather than recreate digest serialization locally.

Every final candidate writes `research.calibration_status: "pre_data"`. Calibration is owned by the
runtime's resolved, integrity-cleared outcome cohort. A producer cannot label its own probabilities
measured or calibrated.

## Candidate evidence

A candidate must contain all fields in the schema. These rules explain their meaning.

### Instrument, entry, liquidity, and ordinary move

- Identify one listed equity by ticker, company, exchange, three-letter currency, `asset_type: "equity"`,
  and direction. Indices, sectors, funds, and ticker-only ambiguous listings cannot qualify.
- The holding-period start is a future tradable session after final admission and no more than three
  calendar days after the source-bound quote and final projection. Evidence timestamps must be at or
  before projection/admission; a next-day close is not available early merely because its date exists.
- Liquidity uses a fixed recent 60-session window with at least 54 observed `close × volume` rows (90%
  coverage). Record window start/end, observed sessions, coverage, and the measured non-negative median.
  Record the exact USD conversion pair, USD-per-listing-currency rate, as-of, and source even for USD/USD.
  Record the
  measured non-negative median even when it is below USD 5 million: that is a complete candidate which the
  runtime must reject as too thin, not missing evidence. A listing lookup or market-cap estimate does not
  prove liquidity and remains `not_assessable`.
- `market_risk.ordinary_move_pct` means the **median absolute five-session split-adjusted price return**
  computed from at least 60 recent sessions. It is not an annualized volatility estimate. The span gate
  uses it to reject a “bull” case the stock can reach in one ordinary week.
- After `scripts/create_idea_projection_manifest.py <RUN_ROOT>` succeeds, run
  `python3 scripts/market_prices.py --write-idea-evidence <TICKER> <RUN_ROOT>` and copy its evidence fields
  exactly. The candidate carries both the manifest SHA-256 and the sidecar's canonical evidence SHA-256.
  Mixed-provider identity/basis conflicts, ticker collisions, sparse volume, future evidence, and missing
  FX fail closed. If this canonical snapshot is unavailable, mark the assessment not assessable; do not
  substitute a web quote.

The v1 execution contract has no borrow availability, recall risk, or borrow fee. Therefore a structurally
complete short can be represented and outcome-graded, but it cannot clear qualification in v1. Emit the
complete candidate so the runtime records that rejection. Use `not_assessable` only when one of the
evidence fields the artifact can carry is genuinely missing.

### Research and edge

- Copy the root decision exactly, including a conservative decision such as `Watchlist` or `Avoid`. Only
  `Strong Buy`, `Buy`, `Starter Position Only`, or `Short Candidate` is directionally actionable; the
  runtime rejects every other complete candidate as non-actionable.
- Record data sufficiency and the existing thesis edge score on their full 0–100 ranges. The runtime requires
  at least 70/100 data sufficiency and 50/100 edge; a lower measured score is a visible rejection, not an
  absent assessment.
- `edge_proof` must say what evidence makes the view different from what is priced in and how it can be
  falsified. A narrative, management adjective, or high confidence score is not proof.
- Carry every unresolved red flag and every hard rating cap. When a cap is active, set
  `hard_cap_active: true` and provide its non-empty reason; otherwise the reason must be `null`. Any active
  hard cap or Critical red flag blocks qualification. It does not make a fully evidenced candidate
  `not_assessable`, and it must never be omitted to make the candidate fit the schema.

The manifest-pinned independent audits are part of decision authority, not advisory prose. Normalize the
candidate from them exactly:

- `research.edge_score = min(decision_record.edge_score, expectations_gap.edge_score)`;
- begin hard-cap reasons with the trimmed `decision_record.rating_cap` when the decision record has a
  binding cap;
- when `pre_mortem.survives != true` or its trimmed `recommended_rating_cap` is non-empty, append
  `pre-mortem audit: <verdict>` and, when present, ` (<recommended_rating_cap>)`;
- when `expectations_gap.is_exploitable != true` or quality is not `Moderate`/`Strong`, append
  `expectations-gap audit found no proven exploitable edge (quality=<quality>, is_exploitable=<true|false>)`;
- join multiple reasons in that order with `; `. Set `hard_cap_active` to true exactly when at least one
  binding reason exists and copy that full joined string to `hard_cap_reason`; otherwise use false/null.

This means an independent no-edge or broken-thesis conclusion remains visible and blocks qualification
even at low self-reported confidence. A producer may not omit it, and the freezer recomputes it.

### Decision authority, horizon, catalyst, and falsifier

The final candidate is a projection, not a second place to exercise judgment. Before the post-audit
manifest is created, `decision_record.json` must carry:

- one integer `scenario_horizon_days` and one `idea_valuation_bridge` object with
  `source_horizon_days`, `method`, `convergence_fraction`, `rationale`, and `source`;
- three to seven scenarios with stable `scenario_id`, `label`, `probability`, `price_target`,
  `conditions`, `source`, and `joint_probability_basis`; and
- the one catalyst-bearing `forecast_ledger` row the candidate will select. That row has a stable
  `forecast_id`, `window_start`, `window_end`, `status_as_of`, `source_citation`, `metric`, `threshold`,
  at least two `causal_steps`, and `stock_bullish_trigger` / `stock_bearish_trigger`, in addition to the
  ordinary forecast-ledger fields.

The candidate maps authority exactly:

- each scenario keeps `scenario_id`, `label`, `conditions`, `source`, and `joint_probability_basis`;
  `probability_pct = decision probability` and `source_price_target = decision price_target`. Only the
  shorter-window `price_target` and its return are derived;
- `candidate.valuation_bridge` exactly equals `decision_record.idea_valuation_bridge`, and its
  `source_horizon_days` exactly equals `decision_record.scenario_horizon_days`;
- the catalyst maps `forecast_id`, `prediction → name`, window dates, `source_citation → source`,
  `status_as_of`, causal steps, and the stock bullish/bearish triggers, adding only the constant
  `status_at_admission: "scheduled_unresolved"`; and
- the falsifier maps `falsification_trigger → condition`, `metric`, `threshold`,
  `window_end → deadline`, and `source_citation → source` from that same forecast row.

The `forecast_id` must select exactly one open row. Missing or ambiguous authority makes the final
projection `not_assessable`; it is never filled from free prose.

- The holding window is one frozen end date 90–183 days after the start. Do not grade it at both 90 and
  180 days and do not write a vague range such as “3–6 months.”
- A source-bound catalyst window must sit inside that holding window and start after final admission.
  Carry `status_at_admission: "scheduled_unresolved"` plus a source-bound `status_as_of`; an in-progress
  window is insufficient because the result may already be public. Include at least two causal steps and
  symmetric bullish and bearish triggers.
- The falsifier must name an observable metric, threshold, deadline, and source and settle no later than
  the idea's own end date.
- A 12-month fair value is not a 3–6 month target. Every scenario carries `source_price_target`. For a
  longer source only `catalyst_partial_convergence` is allowed, and the runtime recomputes
  `price_target = entry + convergence_fraction × (source_price_target − entry)`. Same-horizon/event
  targets equal their source targets. A decorative fraction or unbounded “rerating” does not qualify.

### Scenario distribution and downside

Use three to seven mutually understandable outcomes. Probabilities must sum to 100%. For each scenario:

`position return = (target / entry − 1) × 100` for a long, with the sign reversed for a short.

If a stored `return_pct` is present, the runtime recomputes it and rejects a mismatch over 0.15 percentage
points. When one scenario joins multiple conditions, `joint_probability_basis` must explain why the
conjunction deserves that probability.

The current pre-data policy requires:

- at least 10% probability in a loss of 5% or one ordinary five-session move, whichever is larger;
- a favorable case spanning at least one ordinary five-session move;
- probability-weighted expected return of at least 10%;
- policy-adjusted expected return of at least 10% for the live board, after retaining only 35% of positive scenario returns and keeping losses in full;
- expected loss magnitude in the worst 20% of scenario probability no greater than 20%; and
- no scenario with a position loss greater than 35%.

Favorable probability mass inside the selected 20% contributes zero loss. It never offsets a rare
catastrophic state.

These are disclosed policy priors, not claimed empirical optima. The board does not collapse them into
one opaque score. Before ranking, it retains only 35% of every positive scenario return while keeping
losses in full until exact-horizon outcomes justify a different versioned policy. It then assigns
risk/return Pareto layers: another idea dominates only when it offers at least as much policy-adjusted
expected return with no more worst-20% loss, worst-case loss, or loss probability, and is strictly better
on at least one dimension. Within the same frontier, evidence confidence orders ideas before the remaining
return and risk tie-breakers; it cannot rescue an idea that is strictly dominated on risk and return.

## Outcome and calibration loop

The outcome runner consumes only the immutable post-audit admission and settles it once at its exact
horizon. Admission time, candidate digest, decision digest, and market-evidence digest are cohort keys;
later artifact edits or verification changes cannot select winners into (or losers out of) history.
It reuses `market-history/v1` from `scripts/market_prices.py`; raw/unadjusted history, identity mismatch,
missing delisting value, or missing endpoint blocks settlement rather than creating fake performance.

Each outcome records the position-signed return, maximum favorable and adverse excursion, scenario-range
coverage, terminal tail-loss breach, predicted-positive Brier score, signed and mean-absolute return
forecast error, and direction-aware beta-adjusted benchmark and sector excess where comparators exist.
The terminal tail test compares the horizon-end loss with the forecast's terminal worst-tail loss;
maximum adverse excursion remains a separate path-risk measure. All reported returns are price returns;
they exclude dividends, borrow costs, fees, and taxes.

Only an invalid immutable admission or a conflicting immutable cohort key is excluded from the frozen
outcome cohort. A forecast admitted with digest-valid, verified admission-time integrity remains in that
cohort after a later correction, supersession, or current source-artifact mismatch; those later facts
quarantine the **live** card but cannot select a known winner or loser out of the learning denominator.
Ordinary supersession therefore removes an idea from the live board without erasing its honest ex-ante
forecast. This is admission-time immutability, not a claim that the later correction is unimportant.

Calibration remains:

- `pre_data` with no resolved integrity-cleared outcomes;
- `insufficient` below 30 outcomes, 20 unique listings, or 80% benchmark coverage; and
- `measured` once those floors are met.

“Measured” means the Brier score and forecast errors can be judged. It does not mean the probabilities
are accurate, and the runtime does not auto-tune policy from a small cohort. A future `calibrated` label
requires a separate, explicit quality test; sample size alone can never grant it.

## Final post-audit publication sequence

1. Finish the first verification/pre-mortem/expectations-gap pass, propagate its deterministic decision
   changes, and finish every integrity stamp. Do not generate `memo.md`, module memos, or
   `audit_dossier.md` yet.
2. Rerun all three audits read-only into their next versioned reports. Each must name and hash the exact
   final thesis and decision bytes. Make no further change to either input.
3. Run `python3 scripts/create_idea_projection_manifest.py <RUN_ROOT>`. It is first-writer-wins and pins
   the exact post-audit artifacts. Do not edit a pinned artifact after this point. If creation or validation
   fails, record `IDEA-ADMISSION: error` and stop before market capture, re-projection, or the freezer. Keep
   the failed bytes and use a new dated run; do not convert a missing seal into `not_applicable`.
4. Perform the final re-projection only: capture canonical market evidence, then replace the preliminary
   assessment with a reconciled candidate or honest `not_assessable` wrapper. The candidate must carry
   the returned `projection_manifest_sha256` and exact structured decision authority. Timestamp the
   replacement at the final projection time, no earlier than the manifest; never preserve the
   preliminary wrapper's `created_at`.
5. Run, in order:

   ```bash
   python3 -m json.tool <RUN_ROOT>/idea_3_6m.json >/dev/null
   python3 scripts/validate_screener_json.py frameworks/ideas/idea-assessment.schema.json <RUN_ROOT>/idea_3_6m.json
   python3 scripts/freeze_idea_admission.py <RUN_ROOT>
   ```

   The last command is the single semantic admission gate and immutable first write. Under one directory
   lock it validates the manifest, market snapshot, structured decision authority, integrity, and
   publication times, then atomically writes `idea_admission.json`. `admitted` (exit 0), `not_admitted`
   (exit 3, with gaps), and `not_applicable` (exit 0) are all completed frozen outcomes; an
   exception/`error` is a validator failure. There is no non-writing preview and no second invocation in
   the publication path. Do not revise a candidate after the freezer returns.
   Recompute every scenario return, probability sum, expected return, loss probability, and worst-20%
   expected loss with code, not mental arithmetic.
6. A crash before the atomic rename leaves no completed gate; a crash after it must recover through the
   existing admission and may never re-project. This makes the rejection/not-applicable result durable at
   the same instant it first becomes observable. Report `admitted`, `not_admitted` with gaps, or
   `not_applicable` exactly.
   If recovery finds only the valid manifest, a final post-manifest `not_assessable` wrapper proceeds
   directly to the freezer even when market capture is absent—the missing snapshot may be its honest gap.
   Only the exact pre-manifest preliminary wrapper may re-project. If a canonical snapshot already exists
   because the producer died after its atomic rename but before replacing the wrapper, validate it
   idempotently with `--write-idea-evidence` and continue; an unreadable, mismatched, or non-canonical
   existing snapshot is not repairable. Other inconsistent partial states fail as `IDEA-ADMISSION: error`
   and require a new dated run.
7. Only after final reprojection/admission may the orchestrator generate derived memo and dossier files.
8. Before the freezer, if the producer finds a required value absent or cannot reconcile it, use an honest
   `not_assessable` wrapper naming the gaps. The producer returns before the orchestrator invokes the
   freezer and never sees the gate result. Never weaken a gate, mutate pinned audits, or repair an old
   result to fill the tab.
