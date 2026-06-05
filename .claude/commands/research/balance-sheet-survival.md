---
description: Run the balance-sheet-survival module's layered pipeline on a ticker. Self-discovers agents from .claude/agents/balance-sheet-survival/. Reads business-model, earnings, and (if present) valuation outputs as cross-module context.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for the balance-sheet-survival module, invoked standalone (not via `/research:full`). The ticker is `$ARGUMENTS`.

This command runs only the balance-sheet-survival module's pipeline and commits its output. To run all modules end-to-end with the master synthesizer, use `/research:full $ARGUMENTS` instead.

The module reads prior business-model and earnings outputs (and valuation, if present) as cross-module context. It still runs if they are absent — each agent falls back to its own read of the data pool — but the analysis is stronger when the upstream modules have run for this ticker.

Execute the steps below in order. Do not skip any.

---

## 1. Resolve today's date

Run `date +%Y-%m-%d` via Bash and capture the result as `<DATE>`.

## 2. Verify the data pool

Check that `data/$ARGUMENTS/` exists and contains at least one file:

```
ls -1 data/$ARGUMENTS/ 2>/dev/null | head -n 1
```

If the directory is missing or empty, STOP. Tell the user: "No data found at `data/$ARGUMENTS/`. Populate the Drive folder for this ticker and re-run."

## 3. Create the run root folder

```
mkdir -p "analyses/${ARGUMENTS}_<DATE>"
```

Capture `analyses/${ARGUMENTS}_<DATE>` as `<RUN_ROOT>`.

## 4. Resolve cross-module paths (business-model, earnings, valuation)

The solvency agents optionally read prior module outputs for the same ticker. Resolve the most recent run folder of each via Bash:

```
ls -1d analyses/${ARGUMENTS}_*/business-model/ 2>/dev/null | sort -r | head -n 1
ls -1d analyses/${ARGUMENTS}_*/earnings/ 2>/dev/null | sort -r | head -n 1
ls -1d analyses/${ARGUMENTS}_*/valuation/ 2>/dev/null | sort -r | head -n 1
```

Capture the results as `<BUSINESS_MODEL_PATH>`, `<EARNINGS_PATH>`, and `<VALUATION_PATH>`. The `sort -r | head -n 1` selects the latest folder by directory name (the `YYYY-MM-DD` in the path sorts correctly). If a command returns an empty string, treat that module as `not available`.

Build the cross-module context string `<CROSS_MODULE_CONTEXT>` by joining one well-formed sentence per available module, e.g.:

`Business-model cross-module path: <BUSINESS_MODEL_PATH>. Earnings cross-module path: <EARNINGS_PATH>. Valuation cross-module path: <VALUATION_PATH>.`

Include only the modules that resolved to a real path. If none resolved, set `<CROSS_MODULE_CONTEXT>` to the literal string `none`.

Per `.claude/agents/balance-sheet-survival/MODULE_RULES.md`, agents that need a path will parse it from the cross-module-context string; agents that don't need it will ignore it.

## 5. Run the shared module pipeline

Follow every step in `frameworks/MODULE_PIPELINE.md` with these inputs:

- `<TICKER>` = `$ARGUMENTS`
- `<DATE>` = the `<DATE>` resolved in step 1
- `<MODULE>` = `balance-sheet-survival`
- `<RUN_ROOT>` = the run root from step 3
- `<CROSS_MODULE_CONTEXT>` = the string from step 4

The pipeline will discover agents at `.claude/agents/balance-sheet-survival/[0-9][0-9]_*.md`, group them by `layer`, dispatch each layer in parallel, persist each output to `<RUN_ROOT>/balance-sheet-survival/` per the persistence contract (Modes A/B/C — self-persist via `Write`/`Bash`, else inline fallback) in `frameworks/MODULE_PIPELINE.md`, verify each output file after every layer, and apply fail-fast checks. Do not assume all specialist reports return inline.

## 6. Standalone fail-fast handling

If the pipeline returns `fail_fast_triggered = true`:

- Do NOT proceed to step 7 (commit). Report the abort to the user, including which agent triggered it and the path of its output file.
- Stop here.

This is the standalone behavior. Under `/research:full`, fail-fast in one module does not abort the whole run.

## 7. Commit and push to main

Per repo `CLAUDE.md` git policy: commit straight to `main`. No branches. No PRs.

Commit through the serialized helper (global git lock; commits only this pathspec; pushes):

```
bash scripts/commit-run.sh "Balance-sheet-survival run: ${ARGUMENTS} <DATE>" -- "analyses/${ARGUMENTS}_<DATE>/balance-sheet-survival/"
```

Capture the commit SHA from `git rev-parse HEAD`.

## 8. Report

Print a final summary to the user containing:

- Number of agents discovered and per-layer breakdown (count + names per layer)
- Which cross-module paths were resolved (business-model, earnings, valuation) and the folders used
- Names of any agents that failed (or "none")
- Whether a fail-fast abort was triggered, and by whom (if applicable)
- Full path to the synthesizer's output: `analyses/${ARGUMENTS}_<DATE>/balance-sheet-survival/99_balance-sheet-survival-synthesis.md` (or note that it did not run, if aborted)
- The commit SHA pushed to `origin/main`

---

## Hard rules

- Do not hardcode agent names in this orchestrator. The discovery + dispatch loop lives in `frameworks/MODULE_PIPELINE.md` and is fully data-driven.
- Adding a new file like `.claude/agents/balance-sheet-survival/07_rating-migration.md` with `layer: 2` in its frontmatter must require zero changes to this command — it should automatically be picked up, run in layer 2, and written to `analyses/${ARGUMENTS}_<DATE>/balance-sheet-survival/07_rating-migration.md`.
