---
description: Run the earnings module's layered pipeline on a ticker. Self-discovers agents from .claude/agents/earnings/.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for the earnings module, invoked standalone (not via `/research:full`). The ticker is `$ARGUMENTS`.

This command runs only the earnings module's pipeline and commits its output. To run all modules end-to-end with the master synthesizer, use `/research:full $ARGUMENTS` instead.

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

## 4. Resolve business-model cross-module path

Several earnings agents (specifically `revenue-drivers`, `margin-drivers`, `earnings-sensitivity`, and the synthesizer) optionally read prior `business-model` module outputs for the same ticker. Resolve the most recent business-model run folder via Bash:

```
ls -1d analyses/${ARGUMENTS}_*/business-model/ 2>/dev/null | sort -r | head -n 1
```

Capture the result as `<BUSINESS_MODEL_PATH>`. The `sort -r | head -n 1` selects the latest folder by directory name, which sorts correctly thanks to the `YYYY-MM-DD` date format embedded in the path. If the command returns an empty string (no prior business-model run for this ticker), set `<BUSINESS_MODEL_PATH>` to the literal string `not available`.

Build the cross-module context string:

- If `<BUSINESS_MODEL_PATH>` is `not available`: `<CROSS_MODULE_CONTEXT>` = `none`.
- Otherwise: `<CROSS_MODULE_CONTEXT>` = the literal text `Business-model cross-module path: <BUSINESS_MODEL_PATH>` (with `<BUSINESS_MODEL_PATH>` substituted).

Per `.claude/agents/earnings/MODULE_RULES.md`, agents that need the path will parse it from the cross-module-context string; agents that don't need it will ignore it.

## 5. Run the shared module pipeline

Follow every step in `frameworks/MODULE_PIPELINE.md` with these inputs:

- `<TICKER>` = `$ARGUMENTS`
- `<DATE>` = the `<DATE>` resolved in step 1
- `<MODULE>` = `earnings`
- `<RUN_ROOT>` = the run root from step 3
- `<CROSS_MODULE_CONTEXT>` = the string from step 4

The pipeline will discover agents at `.claude/agents/earnings/[0-9][0-9]_*.md`, group them by `layer`, dispatch each layer in parallel, persist each output to `<RUN_ROOT>/earnings/` per the persistence contract (Modes A/B/C — self-persist via `Write`/`Bash`, else inline fallback) in `frameworks/MODULE_PIPELINE.md`, verify each output file after every layer, and apply fail-fast checks. Do not assume all specialist reports return inline.

## 6. Standalone fail-fast handling

If the pipeline returns `fail_fast_triggered = true`:

- Do NOT proceed to step 7 (commit). Report the abort to the user, including which agent triggered it and the path of its output file.
- Stop here.

This is the standalone behavior. Under `/research:full`, fail-fast in one module does not abort the whole run.

## 7. Commit and push to main

Per repo `CLAUDE.md` git policy: commit straight to `main`. No branches. No PRs.

```
git add "analyses/${ARGUMENTS}_<DATE>/earnings/"
git commit -m "Earnings run: ${ARGUMENTS} <DATE>"
git push origin main
```

Capture the commit SHA from `git rev-parse HEAD`.

## 8. Report

Print a final summary to the user containing:

- Number of agents discovered and per-layer breakdown (count + names per layer)
- Whether a business-model cross-module path was resolved (and which folder, if so) or whether agents proceeded independently because none was available
- Names of any agents that failed (or "none")
- Whether a fail-fast abort was triggered, and by whom (if applicable)
- Full path to the synthesizer's output: `analyses/${ARGUMENTS}_<DATE>/earnings/99_earnings-synthesis.md` (or note that it did not run, if aborted)
- The commit SHA pushed to `origin/main`

---

## Hard rules

- Do not hardcode agent names in this orchestrator. The discovery + dispatch loop lives in `frameworks/MODULE_PIPELINE.md` and is fully data-driven.
- Adding a new file like `.claude/agents/earnings/13_supply-chain.md` with `layer: 2` in its frontmatter must require zero changes to this command — it should automatically be picked up, run in layer 2, and written to `analyses/${ARGUMENTS}_<DATE>/earnings/13_supply-chain.md`.
