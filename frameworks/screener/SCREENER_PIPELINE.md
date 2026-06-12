# SCREENER_PIPELINE.md — Shared per-module pipeline for screener orchestrators

This adapts `frameworks/MODULE_PIPELINE.md` (the research swarm's pipeline) to the screener swarm. The discovery → dispatch → persist → verify loop is IDENTICAL — read MODULE_PIPELINE.md Steps 2, 3, 4A, 4B for the mechanics and apply them with the substitutions below. This file states only what differs.

**Who reads this:** the `/screener:*` orchestrator command files. Agents themselves never read it.

---

## Substitutions vs MODULE_PIPELINE.md

| MODULE_PIPELINE.md term | Screener value |
|---|---|
| `<TICKER>` | `<SIG_ID>` — the signal id (`SIG-YYYYMMDD-<8char_hash>`) |
| `<RUN_ROOT>` = `analyses/<TICKER>_<DATE>` | `<RUN_ROOT>` = `screener/runs/<SIG_ID>` |
| Agents root `.claude/agents/<MODULE>/` | `.claude/agents/screener/<MODULE>/` |
| `DATA_PATH` = `data/<TICKER>/` | none — the input is `<RUN_ROOT>/intake.json`, the ledger at `screener/ledger/`, and the web (per the swarm's stage source policy) |
| Step 1.5 workbook pre-extraction | **Skipped.** There is no per-ticker data pool. |
| Fail-fast verdict regex (`insufficient`) | The routing contract below |
| Module tiers (memo + dossier, Step 4.9) | **Skipped in v1.** The thesis record + board index are the machine tiers; the synthesis md is the readable tier. |

Task message template (replaces the MODULE_PIPELINE.md Step 4A message): substitute the first sentence with:

> Process screener signal <SIG_ID>. Run root: screener/runs/<SIG_ID>/. Intake file: screener/runs/<SIG_ID>/intake.json. Ledger root: screener/ledger/. Today's date: <DATE>. <CROSS_MODULE_CONTEXT — or omit if none>. Follow your system prompt and produce your complete report formatted exactly per your REPORT STRUCTURE section. Then persist it to the exact path `<OUTPUT_PATH>` …

…and continue with the SAME persistence contract wording as MODULE_PIPELINE.md Step 4A (Modes A/B/C, clean file, no chat-confirmation block, no git). Step 4B verification is identical (`test -s`, starts with `#`, no stray confirmation block).

`<CROSS_MODULE_CONTEXT>` for screener modules uses the same sentence form, e.g. `Signal-gate cross-module path: screener/runs/<SIG_ID>/signal-gate/.`

---

## The routing contract (replaces Step 4C fail-fast)

The swarm manifest (`.claude/agents/screener/SWARM.md` frontmatter `routing:`) defines the contract:

- Every module synthesis (and the Layer-0 intake gate) ends its report with a `## Routing` section containing greppable labelled lines — at minimum `Routing: <value>`; plus the module's own metrics (`Materiality: NN`, `Edge score: NN`, `Next module: <module-or-none>`).
- After each module completes, the orchestrator reads the synthesis output (for `signal-gate`, ALSO the `00` intake output, which can terminate early) and extracts the `Routing:` line:

```
grep -iE '^[*_[:space:]]*routing[*_:[:space:]]+' "<RUN_ROOT>/<MODULE>/<file>.md" | head -1
```

- If the value is in `routing.terminal` → **stop the pipeline** after this module. This is a valid, recorded outcome (a rejection is a result), not an error.
- If the value is in `routing.continue` → proceed to the next module in dependency order.
- `candidate-surfacing` additionally runs ONLY when the edge-definition routing is `provisional` or `full_machine`.
- Unknown routing value → treat as terminal, flag loudly in the final report (never guess "continue").

---

## Module order

Derived from each module's `99_*-synthesis.md` `depends_on`, exactly like `/research:full` step 4 (topological sort, alphabetical tiebreak), discovered via Glob `.claude/agents/screener/*/99_*-synthesis.md`. Today that yields: `signal-gate` → `thesis-structure` → `edge-definition` → `candidate-surfacing`. Never hardcode this order — derive it.

---

## State updates (after each module, owned by the orchestrator)

- After `signal-gate`: append the event line to `screener/ledger/events.ndjson` if the agent has not already done so (idempotent on `signal_id`; use `scripts/append-ndjson.sh`).
- After `edge-definition`: verify `<RUN_ROOT>/thesis_record.json` exists, is valid against the schema, has `locked: true`, and is copied to `screener/ledger/theses/<thesis_id>.json`.
- After `candidate-surfacing`: verify `<RUN_ROOT>/candidates.json` exists and is copied to `screener/ledger/candidates/<thesis_id>.json`.
- After EVERY module (including a terminal stop): refresh the board index:

```
python3 scripts/update_board_index.py
```

It rebuilds `screener/board/index.json` deterministically from the ledger + run folders (never trust an agent to hand-edit board JSON).

---

## Hard rules

- Same as MODULE_PIPELINE.md: no hardcoded agent names; new `NN_*.md` files with `layer:` frontmatter are picked up automatically; the pipeline writes only inside `<RUN_ROOT>/<MODULE>/` (plus the run-root JSON artifacts its syntheses own and the ledger/board updates listed above).
- A terminal routing is reported as a completed pipeline with that routing — never as a failure.
