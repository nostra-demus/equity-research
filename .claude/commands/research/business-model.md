---
description: Run the business-model module's layered pipeline on a ticker. Self-discovers agents from .claude/agents/business-model/.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for the business-model module, invoked standalone (not via `/research:full`). The ticker is `$ARGUMENTS`.

This command runs only the business-model module's pipeline and commits its output. To run all modules end-to-end with the master synthesizer, use `/research:full $ARGUMENTS` instead.

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

## 4. Run the shared module pipeline

Follow every step in `frameworks/MODULE_PIPELINE.md` with these inputs:

- `<TICKER>` = `$ARGUMENTS`
- `<DATE>` = the `<DATE>` resolved in step 1
- `<MODULE>` = `business-model`
- `<RUN_ROOT>` = the run root from step 3
- `<CROSS_MODULE_CONTEXT>` = `none` (business-model has no upstream module dependencies)

The pipeline will discover agents at `.claude/agents/business-model/[0-9][0-9]_*.md`, group them by `layer`, dispatch each layer in parallel, strip confirmation blocks, write outputs to `<RUN_ROOT>/business-model/`, and apply fail-fast checks.

## 5. Standalone fail-fast handling

If the pipeline returns `fail_fast_triggered = true`:

- Do NOT proceed to step 6 (commit). Report the abort to the user, including which agent triggered it and the path of its output file.
- Stop here.

This is the standalone behavior. Under `/research:full`, fail-fast in one module does not abort the whole run — that orchestrator owns its own commit step and continues to the next module.

## 6. Commit and push to main

Per repo `CLAUDE.md` git policy: commit straight to `main`. No branches. No PRs.

```
git add "analyses/${ARGUMENTS}_<DATE>/business-model/"
git commit -m "Business-model run: ${ARGUMENTS} <DATE>"
git push origin main
```

Capture the commit SHA from `git rev-parse HEAD`.

## 7. Report

Print a final summary to the user containing:

- Number of agents discovered and per-layer breakdown (count + names per layer)
- Names of any agents that failed (or "none")
- Whether a fail-fast abort was triggered, and by whom (if applicable)
- Full path to the synthesizer's output: `analyses/${ARGUMENTS}_<DATE>/business-model/99_business-model-synthesis.md` (or note that it did not run, if aborted)
- The commit SHA pushed to `origin/main`

---

## Hard rules

- Do not hardcode agent names in this orchestrator. The discovery + dispatch loop lives in `frameworks/MODULE_PIPELINE.md` and is fully data-driven.
- Adding a new file like `.claude/agents/business-model/13_supply-chain.md` with `layer: 2` in its frontmatter must require zero changes to this command — it should automatically be picked up, run in layer 2, and written to `analyses/${ARGUMENTS}_<DATE>/business-model/13_supply-chain.md`.
