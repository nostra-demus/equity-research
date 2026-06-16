# Conviction loop — module rules

The conviction loop is the screener's **post-lock lifecycle**: it keeps a locked thesis alive, checks
its own pre-stated proof points on their due dates, and auto-moves its rung. Full design:
`frameworks/screener/CONVICTION_LOOP.md`. The root `CLAUDE.md` and the screener `SWARM.md` apply in full.

## Not a signal-pipeline module — on purpose

This folder is **not** a gauntlet stage. There is deliberately **no `99_*-synthesis.md`** here, so
`/screener:signal` (which globs `screener/*/99_*-synthesis.md`) never runs it. The loop runs on its own
clock, per checkpoint, driven by `/screener:validate` (and, Phase 3, the scheduler + wire-trigger
dispatcher). Adding a `99_` file here would wrongly fire validation at signal time.

## Judgment is an agent; math and writes are deterministic scripts

The loop splits cleanly so every move is explainable from evidence, never LLM arithmetic (§12):

- **`scripts/screener_emit_checkpoints.py`** — at lock, parses the locked M0.4/M0.5/M0.6.5 fields into
  `checkpoints.ndjson` rows + a flat `conviction_state`. Deterministic, no LLM. Hooked from
  `/screener:signal` step 6 when edge-definition produced a locked record.
- **`20_checkpoint-validator.md`** (`screener-checkpoint-validator`) — the ONLY agent. Fetches the real
  value of one checkpoint from approved sources, judges it against the locked threshold with a literal
  match, counts agreeing sources, returns a JSON verdict. **Writes nothing.**
- **`scripts/screener_rescore.py`** — takes the verdict, replays the frozen M0.6.6 sub-scores + cited
  per-checkpoint deltas into `edge_score_live`, maps to the state machine + §18 rating, enforces the two
  hard gates, writes the `validation_result` + `conviction_event` + new `conviction_state`. All the math.
- **`/screener:validate`** — orchestrates validator → rescorer → board → commit.

(The earlier design sketched a 5-agent module; the implementation is leaner because emission, re-scoring,
and state are deterministic — agents are used only where genuine judgment is needed, which is stronger
under §12, not weaker.)

## The two hard gates (never relaxed)

1. **Two-source kill.** `falsified_discarded` requires two approved sources agreeing on a literal-match
   breach. A single-source breach PARKS the idea (`insufficient` overlay), never discards it. Enforced in
   `screener_rescore.py` and required by the validator's two-source rule.
2. **No graduation before the kill resolves.** A thesis cannot reach `confirmed` (or be handed off) while
   any `kill_metric` checkpoint due within the horizon is unresolved — even if the convergence trigger
   already confirmed. Enforced in `screener_rescore.py` (`kill_pending`).

## Standing doctrine

- Never edit a locked thesis record; conviction is a parallel projection (§ thesis lock).
- A discard / expiry is a **valued output** (§24) and stays visible in the Archived tray, with its kill
  reason + a §20 error-taxonomy tag; a discard is reversible by a human.
- A missed by-date freezes the rating (`stale`) — a rotting idea never looks alive (§1, §8).
- `unresolved` is honest and valid — refuse to fabricate a value (§3, §11).
- Plain English on every surface the board shows (§21): the `plain_note` is one jargon-free sentence
  that cites the real number. SWARM.md §8 applies to all validator prose beyond the `plain_note` too —
  the "note" field in the JSON verdict is one plain sentence; any surrounding reasoning is 2–3 sentences
  maximum. Write for someone who can read the number but doesn't know what a checkpoint is.
- Engine moves are written to the conviction ledgers, **not** through the human override path
  (`overrides.ndjson` / `moveThesis`) — a human's move always wins and is never confused with the engine's.
