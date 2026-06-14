---
description: Conviction loop — validate ONE checkpoint of a locked screener thesis and re-rate it. Spawns the checkpoint-validator (judgment against approved sources), feeds its verdict to the deterministic rescorer (scripts/screener_rescore.py), refreshes the board, and commits. Auto upgrades/downgrades/discards per the conviction state machine; a kill needs two sources; a graduation is gated while a kill is unresolved.
argument-hint: THESIS_ID CHECKPOINT_ID — e.g. THS-SIG-20260613-4bbcdeae-v1 CHK-4bbcdeae-06
allowed-tools: Read, Write, Glob, Grep, Bash, Task
---

You drive ONE checkpoint validation of the conviction loop (see `frameworks/screener/CONVICTION_LOOP.md`).
`$ARGUMENTS` = `THESIS_ID CHECKPOINT_ID`. Execute in order; do not skip.

## 1. Resolve

- `<NOW>` = `date -u +%Y-%m-%dT%H:%M:%SZ` (Bash).
- Parse `<THESIS_ID>` (matches `^THS-SIG-[0-9]{8}-[a-f0-9]{8}-v[0-9]+$`) and `<CHECKPOINT_ID>` (`^CHK-[a-f0-9]{8}-[0-9]{2}$`).
- Verify the thesis: `test -s screener/ledger/theses/<THESIS_ID>.json`. If missing, STOP: "No locked thesis <THESIS_ID>."
- Verify the checkpoint exists: `grep -F '"<CHECKPOINT_ID>"' screener/ledger/conviction/checkpoints.ndjson`. If missing, STOP: "No checkpoint <CHECKPOINT_ID> — run scripts/screener_emit_checkpoints.py <THESIS_ID> first."
- If `screener/ledger/conviction/conviction_state/<THESIS_ID>.json` is missing, run `python3 scripts/screener_emit_checkpoints.py <THESIS_ID>` to seed it.

## 2. Get the judgment (the validator agent)

Spawn the `screener-checkpoint-validator` subagent (Task tool) with a prompt that passes both ids:

> Validate the conviction checkpoint. THESIS_ID=`<THESIS_ID>` CHECKPOINT_ID=`<CHECKPOINT_ID>`. Follow your agent instructions exactly and return ONLY the JSON judgment.

Capture its final message as `<JUDGMENT>` — a JSON object with `verdict`, `observed_value`, `source_count`,
`prob`, `evidence[]`, `error_tag`, `note`. If it is not valid JSON, STOP and report the raw output (do not guess a verdict).

## 3. Re-score deterministically

Run the rescorer with the validator's judgment (it writes the validation_result + conviction_event +
updated conviction_state, enforces the two-source kill and the graduation gate, and recomputes
edge_score_live / conviction / velocity / rank — all the math, none of it from you):

```
python3 scripts/screener_rescore.py <THESIS_ID> <CHECKPOINT_ID> <verdict> \
  --observed "<observed_value or omit if null>" \
  --source-count <source_count> \
  --at "<NOW>" \
  --note "<note>" \
  --evidence-json '<the evidence array as compact JSON>' \
  --error-tag "<error_tag or omit>"
```

Pass `--prob <prob>` only if the judgment set a non-null `prob`. Capture the script's printed
transition line (e.g. `provisional(64) → strong(83) … GATE: kill pending → held below confirmed`).

## 4. Refresh the board + commit

- `python3 scripts/update_board_index.py` (folds the new conviction_state into the board the UI reads).
- Commit per CLAUDE.md §25 via the serialized helper:

```
bash scripts/commit-run.sh "Screener conviction: <THESIS_ID> <CHECKPOINT_ID> → <verdict>" -- \
  "screener/ledger/conviction/" "screener/board/"
```

Capture the SHA (`git rev-parse HEAD`).

## 5. Report

Print, in plain English (§21): the thesis headline; the checkpoint (metric + threshold + due date); the
validator's observed value + source count + cited sources; the rescorer's transition line (from→to
state, edge move, new §18 rating, conviction, velocity); whether a gate fired (kill pending → held
below confirmed; single-source breach → parked; two-source kill → discarded); and the commit SHA.

## Hard rules

- Never write the validation result or edit conviction_state yourself — only `scripts/screener_rescore.py`
  writes them, so the math stays deterministic (§12) and idempotent (re-running the same checkpoint+verdict
  on the same day dedupes).
- Never edit the locked thesis record. Never fabricate a value or a second source.
- `unresolved` is a valid outcome — record it (the script logs the check and leaves the checkpoint open).
- A discard is reversible: it lands in the Archived tray; a human restores it from the cockpit.
