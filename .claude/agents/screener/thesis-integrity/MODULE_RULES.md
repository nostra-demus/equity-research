# MODULE_RULES — thesis-integrity (Screener swarm)

These rules bind every agent in `.claude/agents/screener/thesis-integrity/`. The root `CLAUDE.md` and `.claude/agents/screener/SWARM.md` apply in full; the stricter rule wins.

## What this module is

The screener's adversarial gate — the disconfirmation test `CLAUDE.md` §8 already requires of every thesis, applied mechanically to a just-locked `thesis_record.json` **before** `candidate-surfacing` spends real ticker-mapping work naming companies against it. It is the screener-scoped twin of `research/verify-evidence` + `research/pre-mortem`, sized to what a screener thesis actually carries (no full data pool, no `decision_record.json` — the locked `M0_1`–`M0_6_6` blocks and the run's own source packet are the entire evidence base).

Everything before this module builds the case FOR the thesis. This module is the only place in the pipeline whose job is to build the case against it, on the record, before a human ever sees a company name.

## Preconditions (binding)

- `thesis_record.json` exists, `meta.locked: true`, and `M0_6_6.routing_outcome` ∈ {provisional, full_machine}. Any other state → this module must not run (the orchestrator enforces it; if invoked anyway, stop and report). This is the SAME precondition `candidate-surfacing` uses — both modules only ever see a thesis that cleared M0.6.6.
- `thesis_record.json` is **read-only**. `meta.locked: true` means no field may be overwritten (SWARM.md §4) — this module never attempts to amend it, never appends to `version_history`. It writes its own separate, append-only artifact (`thesis_integrity_review.json`) and lets the orchestrator's routing-contract gate (`frameworks/screener/SCREENER_PIPELINE.md`) decide whether the pipeline continues.

## The two inviolable rules (mirrors `research/pre-mortem.md`)

1. **This module can only hold the thesis back — never boost it.** It has no power to raise the edge score, upgrade the routing, or add conviction. Its only two effects are: let the pipeline continue (`Routing: Proceed`), or stop it (`Routing: watchlist_integrity_downgrade` / `watchlist_integrity_broken`).
2. **Attack the load-bearing claims, not the phrasing.** A weak sentence with strong evidence behind it is not a finding; a strong sentence with no verifiable fact behind it is. Every attack in the report names the specific `M0_x` field it targets.

## Attack discipline

- **The fireproof kill-switch check is the single most important test.** `M0_5.falsification_sentence` was written and graded by the SAME pipeline that built the bull case (`thesis-structure/05_falsification.md`'s "uncomfortable check" is self-graded). Re-derive it independently: given `monitorable_threshold_rate`/`_unit`/`_date` and the `M0_4` horizon, would a plausible bear-case path actually cross that threshold before the horizon closes — or is the bar set so far from any realistic outcome that the thesis could never actually be killed in time to matter? A threshold that is technically falsifiable but practically unreachable inside the horizon is functionally unfalsifiable and must be flagged `is_fireproof: true`.
- **Citation spot-check, not a full audit.** Pick the 3-5 most load-bearing NUMERIC claims (the primary `M0_2` world-change magnitude, the `M0_6_1` consensus numeric anchor, the key `M0_6_4` verifiable fact) and re-confirm them — via the run's own `sources` packet first, then WebSearch/WebFetch against the swarm's approved-source policy (`SWARM.md` `sources.thesis_structure` / `sources.edge_definition`) only where the packet doesn't already carry a checkable citation. This is a spot-check on the handful of numbers the rating actually depends on, not a claim-by-claim audit of the whole record (that scale of work belongs to a full evidence audit, which the screener swarm does not run — see Remaining limitations in the PR that introduced this module).
- **Base-rate discipline (`CLAUDE.md` §9).** Judge the implied magnitude and timeline against a plausible outside view for this class of event. A forecast that requires an outsized, unprecedented move needs unusually strong evidence, not optimism.
- **Never grade on prose quality.** A vivid `bear_case_steelman` with no cited fact behind it is worth nothing; a plain sentence backed by a verified number outranks it.

## Verdict and routing (binding mapping — never deviate)

| Verdict | Meaning | `Routing:` value |
|---|---|---|
| `Survives` | The bear case is real but the thesis holds; nothing here should stop candidate-surfacing. | `Proceed` |
| `Survives with haircut` | The thesis holds, but a human should discount the edge score at review time (note the discount; never edit `M0_6_6.final_score`). | `Proceed` |
| `Does not survive — downgrade` | The bear case dominates, or the edge is not actually real (a restated consensus dressed as a variant). | `watchlist_integrity_downgrade` |
| `Thesis broken` | The kill-switch is effectively already triggered, is fireproof (`is_fireproof: true`) with no genuine test, or the load-bearing claim fails the citation spot-check. | `watchlist_integrity_broken` |

`watchlist_integrity_downgrade` and `watchlist_integrity_broken` are both in `SWARM.md`'s `routing.terminal` set: either one stops the pipeline before `candidate-surfacing` runs. The locked thesis fields (`meta`, every `M0_x` block) stay at their original `provisional`/`full_machine` state forever — this module never rewrites them — but the orchestrator (`.claude/commands/screener/signal.md` step 6) additively records this review's outcome on the ledger copy right after reading it (`scripts/screener_patch_integrity_review.py`), so the board and `screener_calibrate.py` can see the gate ran and what it found, without this module ever touching a locked field itself. A human can always override and continue by hand.

## Output discipline

- `thesis_integrity_review.json` per `frameworks/screener/thesis_integrity_review.schema.json`, written to `screener/runs/{SIG_ID}/thesis_integrity_review.json`. If a review already exists (a re-run), do NOT overwrite — write `_v2`, `_v3`, … (mirrors `research/pre-mortem.md`'s append-only convention). This module writes ONLY this file — never `screener/ledger/theses/<thesis_id>.json` (the orchestrator's job, per above).
- The synthesis report ends with `## Machine Output` + `## Routing`, per every other module in this swarm.
- §5 citations on every attack that rests on a checkable fact. Banned: asserting a claim is wrong without naming the source that shows it.

## Writing Standard

`SWARM.md` §8 plain-English rules apply to every prose section. The `confidence_note` is the one sentence a human reading the board sees — no jargon, no `M0_x` codes, no "fireproof"/"steelman" without a one-clause plain explanation the first time it appears.
