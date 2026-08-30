---
description: Run the business-model module's layered pipeline on a ticker. Self-discovers agents from .claude/agents/business-model/.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for the business-model module, invoked standalone (not via `/research:full`). The ticker is `$ARGUMENTS`.

This command runs only the business-model module's pipeline and commits its output. To run all modules end-to-end with the master synthesizer, use `/research:full $ARGUMENTS` instead.

Execute the steps below in order. Do not skip any.

---

## 1. Resolve the run root and date

If `NOSTRA_CONTINUATION_RUN_ROOT` is set, require it to equal `analyses/${ARGUMENTS}_YYYY-MM-DD`, require
that exact path to be a real existing directory (not a symlink), derive `<DATE>` from it, and keep it as
`<RUN_ROOT>`. Never call `date` or choose another folder in this mode. Otherwise run `date +%Y-%m-%d` and
capture `<DATE>`.

## 2. Verify the data pool

Treat `data/$ARGUMENTS/` as the logical citation label. If `NOSTRA_FROZEN_EVIDENCE_ROOT` is set, require
the complete four-variable frozen binding named in `frameworks/MODULE_PIPELINE.md` Step 1.5, set the
filesystem `<DATA_PATH>` to that immutable evidence root, and **do not read `data/$ARGUMENTS/` at all**.
Otherwise set `<DATA_PATH>` to `data/$ARGUMENTS/` for this standalone workflow. Check that the resolved
`<DATA_PATH>` exists and contains at least one non-empty regular file. If not, STOP and report: "No data
found for `$ARGUMENTS`. Populate the Drive folder for this ticker and re-run." Step 4 performs the
canonical generation verification before any agent reads evidence.

## 3. Create the run root folder

When continuing, use the exact `<RUN_ROOT>` already bound in step 1 and do not create a folder. Otherwise:

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

The pipeline will discover agents at `.claude/agents/business-model/[0-9][0-9]_*.md`, group them by `layer`, dispatch each layer in parallel, persist each output to `<RUN_ROOT>/business-model/` per the persistence contract (Modes A/B/C — self-persist via `Write`/`Bash`, else inline fallback) in `frameworks/MODULE_PIPELINE.md`, verify each output file after every layer, and apply fail-fast checks. Do not assume all specialist reports return inline.

## 5. Standalone fail-fast handling

If the pipeline returns `fail_fast_triggered = true`:

- Do NOT proceed to step 6 (commit). Report the abort to the user, including which agent triggered it and the path of its output file.
- Stop here.

This is the standalone behavior. Under `/research:full`, fail-fast in one module does not abort the whole run — that orchestrator owns its own commit step and continues to the next module.

## 6. Commit and push to main

Per repo `CLAUDE.md` git policy: commit straight to `main`. No branches. No PRs.

Commit through the serialized helper (it holds a global git lock so concurrent companies don't collide, commits only this pathspec, and pushes):

```
bash scripts/commit-run.sh "Business-model run: ${ARGUMENTS} <DATE>" -- "analyses/${ARGUMENTS}_<DATE>/business-model/"
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
