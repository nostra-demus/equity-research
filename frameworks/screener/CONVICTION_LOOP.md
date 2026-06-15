# The Conviction Loop — the screener's live book (Phase 3)

This is the locked design for the screener's closed monitoring loop: the layer that keeps
every locked thesis alive, checks its own pre-stated proof points on the dates they are due,
re-rates the idea up or down on cited evidence, and re-ranks a momentum leaderboard — so the
desk mostly watches ideas climb from a basic idea toward a great one.

It sits **on top of** the existing screener (signal-gate → thesis-structure → edge-definition →
candidate-surfacing). It adds nothing to how a thesis is *made*; it adds what happens *after*
a thesis locks. It follows the institutional doctrine (`CLAUDE.md`): §8 (disconfirmation as a
*live* test), §18 (the allowed decision set is the rating vocabulary), §19 (a forecast that can
be checked later), §20 (error taxonomy), §24 (rejecting is a valued output), §21 (plain English
on every surface), §26 (zero-touch — almost: see "One honest engine edit").

---

## 1. North star (the owner's words)

> If we like an idea and it's on the watchlist, some tracked things must move it up, down, or
> discard it. Those things are noted down. Specific agents validate them at the right time and
> date. Once validated, the thesis is **automatically** upgraded or downgraded in the sell-side
> language analysts use, and its leaderboard rank changes. The user mostly sees ideas getting
> upgraded — and the *rate* of upgrade — so we know an idea is coming to fruition.

The things to track are **not new**: a locked `thesis_record.json` already names them —
the kill-switch metric and date (M0.5), the convergence trigger and date (M0.6.5), the
observable expiry (M0.4). This loop turns those into dated **checkpoints** and acts on them.

## 2. The three decisions (owner-confirmed)

1. **Automatic + safe-by-design.** Everything moves on its own so the desk just watches — BUT a
   *kill* only fires when **two approved sources agree** on a literal-match breach, and any
   archived idea is **one click to restore** (a "soft discard").
2. **Both presentations.** The card leads with plain progress ("passed 3 of 5 proof points,
   climbing fast") and a one-word trajectory; the precise edge-velocity (`+N/30d`) drives the
   ranking and the sparkline under the hood.
3. **Build the whole loop, end to end** — all five phases (§9).

## 3. The conviction state machine

Nine engine states. The locked `meta.status` (`provisional` / `full_machine` / `watchlist_*`)
is **never overwritten**; conviction lives in a parallel engine-owned snapshot (§5). Each state
carries a §18 sell-side rating so "where it sits" reads at a glance.

| State | Plain meaning | §18 rating |
| --- | --- | --- |
| `watching` | Liked, no proven edge yet (live edge < 60). Waiting for checkpoints to prove or kill it. | Watchlist |
| `provisional` | Early idea — real but unconfirmed edge (60–80). | Starter Position Only (Speculative) |
| `strong` | Strong idea — edge > 80, not yet validated by a checkpoint. | Buy / Short Candidate |
| `confirmed` | A scheduled check came back our way (metric printed right, or the trigger fired AND worked). | Strong Buy / Short Candidate |
| `fading` | A check came back against us but did not kill it — demoted, not dead. One more miss can end it. | Hold / Reduce → Watchlist |
| `handed_off` | Graduated into deep research. The only human-gated step by default. | Buy — under coverage |
| `falsified_discarded` | A kill-switch metric crossed its threshold (two-source confirmed) or the kill sentence tripped. Dead by its own rule, kept visible. | Avoid / Cover — terminal |
| `expired_unproven` | The deadline / observable expiry passed with neither confirmation nor kill. Window closed. | Insufficient Data — Refuse To Rate (closed) |

Two **overlays** (flags on any non-terminal state, never a lane of their own — they freeze the
rating so a rotting idea can never look alive):

- `stale` — a checkpoint's by-date passed with **no** validation on record. Loud amber; rating frozen.
- `insufficient_to_validate` — the validator ran but **no approved source** yielded the real number.
  We refuse to rate rather than fake it (§1, §11). One single-source kill breach also lands here
  (not a discard) until a second source confirms.

### Transitions (evidence-cited, append-only, never averaged)

- `watching → provisional → strong`: a validation lifts `edge_score_live` across a band **with at
  least one confirming checkpoint** — never a bare score bump.
- `* → confirmed`: the **primary** M0.6.5 trigger resolves confirmed with its 4-step mechanism
  visible, OR the M0.5 primary metric prints on the bullish side of its threshold.
- `* → fading`: a check comes back against us short of the hard kill threshold; live edge drops a band.
- `fading → provisional/strong/confirmed`: a later check reverses the read — recovery is a distinct,
  rewarded event (the trajectory is what the user watches).
- `* → falsified_discarded`: the primary kill metric is observed AT/PAST its threshold **by two
  approved sources** (literal match each), or the falsification sentence is observed true. One
  critical falsifier caps and terminates — never averaged (§12/§13/§24). **Soft discard**: archived
  + frozen, one human click restores.
- `* → expired_unproven`: M0.4 expiry observed true, or the last open checkpoint's date / horizon-end
  passes with no confirm and no breach.
- `strong/confirmed → handed_off`: live edge > 80 sustained AND the user clicks Hand to research
  (`screener:handoff`, idempotent). **Gated** by the kill-resolve rule below.
- `any → any lane (human)`: the existing `POST /api/screener/thesis/:id/move`. The human always wins;
  `override_stale` flips if a later auto-transition disagrees. Engine moves do **not** use this path.

### Two hard gates (the red-team's must-fixes)

- **No graduation before the kill resolves.** A thesis cannot enter `confirmed` *or* `handed_off`
  while any `kill_metric` checkpoint with `due_at ≤ horizon_end` is still unresolved. (Intel: the
  trigger resolves 2026-07-23 but the kill date is 2026-09-14 — so a confirming Q2 print holds it at
  `strong`, and handoff is blocked, until the kill window closes. No $300 research run on an idea
  whose kill-switch hasn't been tested.)
- **Two-source kill.** `falsified_discarded` requires two approved sources agreeing on a
  literal-match breach. A single-source breach → `insufficient_to_validate` (parks, never discards).

## 4. What gets tracked — the checkpoints

At lock, one `checkpoint` row is emitted per tracked field of the locked record:

| `kind` | Source field(s) | What | Can kill? |
| --- | --- | --- | --- |
| `kill_metric` | `M0_5.monitorable_metric_1` + `monitorable_threshold_rate`/`_unit`/`_date` | The load-bearing falsifier and its numeric threshold + by-date. | **Yes** (two-source) |
| `secondary_metric` | `M0_5.monitorable_metric_2` | Corroborating metric. Threshold parsed from text if present (e.g. Intel "≥14 of 48"), else a directional read. | No (adjusts conviction) |
| `secondary_falsifier` | `M0_5.secondary_falsifiers[]` (+ `probability_estimate`) | The live §8 disconfirmation list. | No (haircut by probability) |
| `convergence_trigger` | `M0_6_5.trigger_name` + `trigger_date_range` + `causal_mechanism` | The main upgrade engine: did the event happen AND did the 4-step mechanism play out? | No (drives upgrade) |
| `secondary_trigger` | `M0_6_5.secondary_triggers[]` (+ `probability`) | Backup catalysts with their own dates. | No |
| `expiry` | `M0_4.expiry_condition` + `horizon` + `monitoring_frequency` | The loop's clock and stop. | Terminal (expire) |

`due_at` is a concrete ISO date. M0.6.5 `trigger_date_range` is free text (e.g. "August 1 – August
22, 2026 …") — the scheduler resolves it to the **end-of-range** ISO. `monitoring_frequency` is free
text — parsed to a coarse cadence (`daily`/`weekly`/`monthly`/`quarterly`, default `weekly`).

## 5. Data model (engine-owned, separate from the human override path)

Why separate: `MOVE_TARGETS` (the human-override lanes) is only 4 values and `moveThesis` uses a
random id, so the engine writing through it would break idempotency and can't express 9 states. The
engine instead owns its own ledgers; the board merges them (a human override still wins).

- `screener/ledger/conviction/checkpoints.ndjson` — **the calendar**, append-only, idempotency key
  `thesis_id::checkpoint_id`. One row per tracked thing: `{checkpoint_id (CHK-<thesis8>-NN),
  thesis_id, source_field, kind, metric_name, threshold, operator (lt|lte|gt|gte|eq|na), unit,
  direction (bullish_if_above|bullish_if_below|binary), due_at, trigger_type, cadence, wire_keywords[],
  predicted_prob, status (scheduled|dispatched|resolved|skipped), scheduled_task_id, created_at}`.
- `screener/ledger/conviction/conviction.ndjson` — **the tick ledger**, append-only, audit + trajectory.
  Two row types:
  - `validation_result`: `{row_type, checkpoint_id, thesis_id, source_field, observed_value, threshold,
    unit, verdict (confirmed|partial|against|breached_kill|unresolved), distance_to_threshold,
    cited_evidence[{url,source,grade,retrieved_at}], source_count, predicted_prob, realized (0|1),
    error_taxonomy_tag, checked_at}`.
  - `conviction_event`: `{row_type, thesis_id, at, kind (upgrade|downgrade|discard|hold|recover|expire),
    from_state, to_state, edge_locked, edge_score_live, subscores_before, subscores_after, conviction,
    sell_side_rating, triggering_checkpoint_id, evidence_refs[], plain_note}`.
- `screener/ledger/conviction/conviction_state/<thesis_id>.json` — **derived, regenerable** snapshot the
  board reads: `{state, sell_side_rating, edge_locked, edge_score_live, conviction, upgrade_velocity,
  trajectory_enum (accelerating|steady|stalling|decaying), rank_score, proximity_pct,
  progress_confirmed, progress_total, validated (bool), trajectory[] (sparkline points),
  next_checkpoint, stale, insufficient, archived, history[] }`.
- `screener/ledger/conviction/<date>_conviction_calibration.json` — dated track record (P5).
- `frameworks/screener/conviction.schema.json` — validates all of the above (extends
  `scripts/validate_screener_json.py`).

The locked `thesis_record.json` is **never modified** — conviction is a pure parallel projection.

## 6. Re-scoring math (deterministic — no vibes, §12)

Keep the locked M0.6.6 sub-scores as a frozen baseline; compute a parallel `edge_score_live` by
re-running the **exact locked formula** with validated reality moving the sub-scores:

```
edge_score_live = clamp(0, 100, 0.40·variant + 0.30·mispricing + 0.30·trigger_clarity)
```

Each checkpoint moves the one sub-score it evidences, by a fixed evidence-derived amount:

| Event | Sub-score move |
| --- | --- |
| primary `convergence_trigger` confirmed-and-worked | `trigger_clarity += 30` |
| primary `kill_metric` prints our way (bullish side) | `mispricing += 20`, `variant += 20` |
| `secondary_trigger` / `secondary_metric` confirmed | relevant sub-score `+= 10` |
| primary metric *against* but not killed | `mispricing -= 15`, `variant -= 15` |
| `secondary_falsifier` fires (against) | relevant sub-score `-= round(40 · probability_estimate)` |
| trigger event happened but mechanism did **not** play out | `trigger_clarity -= 10` |

Then **cap the per-event edge change**: `|Δedge| ≤ 20` on a confirm, `≤ 15` on a miss, halved on a
`partial`. So no single print can fabricate a "great" idea.

**Conviction** (what the rating uses) applies a §11 data-sufficiency cap:

```
conviction = round(edge_score_live · data_sufficiency_factor)
```

`data_sufficiency_factor` is deterministic from the latest validation:
`1.0` (≥2 approved sources, literal match) · `0.85` (1 approved source) · `0.7` (directional/qualitative
read) · `0.6` (only an unverified-but-labelled market source, or a `partial`).

`severity` of a fired secondary falsifier = its locked `probability_estimate` (a high-probability
falsifier hurts more; can terminate if it equals or implies the primary kill).

## 7. The leaderboard and "rate of upgrade" (de-gamed)

**Rate of upgrade = `upgrade_velocity`** = change in `edge_score_live` per 30 days, from the tick
series: `(edge_now − edge_at_or_before(now − 30d)) / elapsed_days × 30`. Signed. It is a *slope of
edge*, not a count of checkpoints — so it cannot be spiked by authoring many checkpoints.

Shown three ways (decision 2): a per-card plain headline ("passed 3 of 5 proof points, climbing")
+ a `+N/30d` badge; a transform-only SVG sparkline; and one **book-level** number —
"Book is upgrading at +N/30d this week" = mean velocity across live theses.

`trajectory_enum` (accelerating | steady | stalling | decaying) = sign + second-difference of the last
three ticks.

**RankScore** orders the board:

```
RankScore = 0.50·edge_score_live + 0.30·momentum_norm + 0.20·proximity_pct
momentum_norm = clamp(0, 100, 50 + 2.5·upgrade_velocity)     # 0 vel → 50, +20/30d → 100
proximity_pct = 100 · (Σ confirmed checkpoint weights) / (Σ all checkpoint weights)
                where weight = 3 for primary kill_metric & convergence_trigger, else 1
```

De-gaming guards: velocity is count-independent; `proximity` weights the load-bearing checkpoints
×3 so confirming an easy secondary trigger (e.g. Intel's certain hyperscaler-earnings window,
`p=1.0`) barely moves it; a `validated=false` thesis uses `edge_locked`, gets `momentum=0`, is
visually tagged "not yet tested", and ties break **validated-before-unvalidated** then soonest
`next_checkpoint` — so a fresh high-locked idea cannot masquerade as a confirmed climber. Terminal
states leave the live leaderboard for the Archived tray but stay in the track record (§24).

## 8. Scheduling (calendar-primary, wire-accelerated, tick-reconciled)

Three layers, all already in the repo, converging on one validator:

1. **Calendar (spine).** At lock, the scheduler registers one `scheduled-tasks` one-time `fireAt`
   per dated checkpoint, prompt `/screener:validate <thesis_id> <checkpoint_id>`; plus one recurring
   `monitoring_frequency` cron for interim/expiry reads.
2. **Wire (accelerant).** The existing news scheduler emits entities/themes on `newsBus`; a small
   subscriber matches a fresh firewall-passed item against an open checkpoint's `wire_keywords` and
   fires that validator **early — never later, never replacing** the calendar fire. Bounded by a
   per-checkpoint wire-fire cap + a relevance pre-check + the daily validate budget.
3. **Reconciler (crash-safe).** The news tick calls `dispatchDueConvictionChecks()` once: fire any
   `due_at ≤ now && status == scheduled` checkpoint — catches dates that passed while the app was
   down and self-heals a missed `fireAt`. Idempotent on `checkpoint_id`, throttled, env-gated
   `CONVICTION_LOOP_ENABLED`.

Staleness is derived in `update_board_index.py` at **every** board build (not only by the sweep),
so a missed sweep can never leave a passed-date idea showing a live rating.

Cost guards: `screener-validate` LaunchKind ≈ $10 / 60 turns (mirrors `handoff`); a daily validate
budget cap; a `max-concurrent-validators` throttle; the wire path fires only on the checkpoint's
evidence class, never on every issuer mention.

## 9. One honest engine edit (not fully zero-touch)

The board builder must learn to read `conviction_state` and the new ledgers, and the funnel needs the
new counts. That is a real edit to `scripts/update_board_index.py` + `board_index.schema.json` + the
frontend, plus one `LaunchKind` in `config.ts`/`launcher.ts` and one `conviction-dispatch.ts` call in
the news scheduler. Everything else — the five conviction agents, the three commands — is a
self-discovered module folder under `.claude/agents/screener/conviction/` (§26), `name: screener-*`.

## 10. Phased build

1. **P1 — data spine + a real (flat) Live Book.** `conviction.schema.json`; emit checkpoints at lock;
   backfill the 3 live theses; extend the board builder + schema; ship LiveBook + ConvictionCard +
   sparkline reading the new fields, flat. No automation yet.
2. **P2 — the conviction module, fired by hand.** The 5 agents + `/screener:validate`. Prove the loop
   manually end-to-end on a backfilled checkpoint.
3. **P3 — auto-fire.** Scheduler `fireAt` + recurring cron + `conviction-dispatch.ts` reconciler +
   `/screener:checkpoint-sweep` + the two hard gates.
4. **P4 — momentum leaderboard + the polish that sells it.** RankScore ordering; book banner;
   trajectory badges; FLIP re-rank; "Why it moved" popover; checkpoint timeline; Archived/restore tray.
5. **P5 — track record / calibrate.** `/screener:calibrate`: hit rate, lock→confirm time,
   Selected-minus-Discarded edge, Brier (resolved-N ≥ 10 floor), error-taxonomy, false-discard rate.

## 11. Worked example — Intel (`THS-SIG-20260613-4bbcdeae-v1`, locked edge 64, provisional)

Checkpoints emitted at lock:

- `kill_metric` — Intel Q2 2026 DC+AI revenue, `lt 4.85 USD_B`, due `2026-09-14`. Can kill (two-source).
- `secondary_metric` — analyst Buy count, threshold parsed `gte 14 of 48`, due `2026-09-14`.
- `secondary_falsifier` ×3 — Buy count ≤10 (`p=0.35`), hyperscaler procurement-shift disclosure (`p=0.20`),
  Foundry < $4.86B (`p=0.18`).
- `convergence_trigger` — Intel Q2 2026 earnings print, due `2026-07-23` (end-of-range), scheduled.
- `secondary_trigger` ×4 — pre-announce (`p=0.12`), hyperscaler Q2 commentary (`p=1.0`), Citi walk-back
  (`p=0.15`), foundry 18A yield filing (`p=0.10`).
- `expiry` — Q2 2026 earnings published; horizon `medium_weeks_3months`; cadence `weekly`.

Loop behaviour: on 2026-07-23 the validator reads the real DC+AI print from Intel's 8-K (SEC EDGAR).
If it prints ≥ $4.85B with the mechanism playing out → `mispricing/variant += 20`, edge climbs (capped
+20), state → `strong` (NOT `confirmed`, and handoff stays blocked, because the kill window runs to
2026-09-14). If it prints < $4.85B and a second approved source confirms → `falsified_discarded`,
archived with the kill reason + an error-taxonomy tag, one click to restore. A single-source sub-$4.85B
read → `insufficient_to_validate`, parked for a second source. Either way the card's sparkline gains a
point and the plain note reads, e.g., "Upgrading to Buy: Q2 DC+AI printed $5.4B vs our $4.85B kill-line
— the inflection held."
