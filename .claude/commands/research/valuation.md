---
description: Run the valuation module's layered pipeline on a ticker. Self-discovers agents from .claude/agents/valuation/. Reads business-model, earnings, and management-governance outputs as cross-module context.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for the valuation module, invoked standalone (not via `/research:full`). The ticker is `$ARGUMENTS`.

This command runs only the valuation module's pipeline and commits its output. To run all modules end-to-end with the master synthesizer, use `/research:full $ARGUMENTS` instead.

The valuation module depends on the business-model, earnings, AND management-governance modules: it reads segment/peer/quality context from business-model, forward-estimate context from earnings, and the ownership / §24 Filter-6 value-trap read from management-governance (`04_ownership-and-insider-behavior` + the synthesis — see `.claude/agents/valuation/MODULE_RULES.md`). Under `/research:full` all three run before valuation (the synthesis declares `depends_on: [business-model, earnings, management-governance]`, so the parallel scheduler orders valuation after them and the cockpit requires them complete). A standalone run still proceeds if one is absent — each agent falls back to its own read of the data pool, and for the value-trap read defers the final adjudication to the master synthesizer — but the analysis is stronger when all three have run for this ticker.

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

## 4. Resolve cross-module paths (business-model AND earnings)

The valuation agents optionally read prior `business-model` and `earnings` module outputs for the same ticker. Resolve the upstream folder of each via Bash — **prefer THIS run's date `analyses/${ARGUMENTS}_<DATE>/`; only fall back to the latest prior-dated run (and then state "using prior-run upstream dated X" in your output) when this run lacks that module (fix F30):**

```
ls -1d analyses/${ARGUMENTS}_*/business-model/ 2>/dev/null | sort -r | head -n 1
ls -1d analyses/${ARGUMENTS}_*/earnings/ 2>/dev/null | sort -r | head -n 1
```

Capture the first result as `<BUSINESS_MODEL_PATH>` and the second as `<EARNINGS_PATH>`. The `sort -r | head -n 1` selects the latest folder by directory name, which sorts correctly thanks to the `YYYY-MM-DD` date format embedded in the path. If a command returns an empty string, treat that module as `not available`.

Build the cross-module context string `<CROSS_MODULE_CONTEXT>` from what is available:

- Both available: `Business-model cross-module path: <BUSINESS_MODEL_PATH>. Earnings cross-module path: <EARNINGS_PATH>.`
- Only business-model: `Business-model cross-module path: <BUSINESS_MODEL_PATH>.`
- Only earnings: `Earnings cross-module path: <EARNINGS_PATH>.`
- Neither: the literal string `none`.

Per `.claude/agents/valuation/MODULE_RULES.md`, agents that need a path will parse it from the cross-module-context string; agents that don't need it will ignore it.

**Management-governance is NOT resolved here** (by design). The agents that need the §24 Filter-6 ownership / value-trap read (`02_multiples-own-history`, `99_valuation-synthesis`) read it directly from this run root (`<RUN_ROOT>/management-governance/`) per `MODULE_RULES.md` — under `/research:full` it ran first and is present; in a standalone run those agents proceed independently and say so if it is absent. The cross-module-context string carries only the business-model/earnings paths because those support the prior-run fallback above.

## 5. Run the shared module pipeline

Follow every step in `frameworks/MODULE_PIPELINE.md` with these inputs:

- `<TICKER>` = `$ARGUMENTS`
- `<DATE>` = the `<DATE>` resolved in step 1
- `<MODULE>` = `valuation`
- `<RUN_ROOT>` = the run root from step 3
- `<CROSS_MODULE_CONTEXT>` = the string from step 4

The pipeline will discover agents at `.claude/agents/valuation/[0-9][0-9]_*.md`, group them by `layer`, dispatch each layer in parallel, persist each output to `<RUN_ROOT>/valuation/` per the persistence contract (Modes A/B/C — self-persist via `Write`/`Bash`, else inline fallback) in `frameworks/MODULE_PIPELINE.md`, verify each output file after every layer, and apply fail-fast checks. Do not assume all specialist reports return inline.

## 6. Standalone fail-fast handling

If the pipeline returns `fail_fast_triggered = true`:

- Do NOT proceed to step 7 (commit). Report the abort to the user, including which agent triggered it and the path of its output file.
- Stop here.

This is the standalone behavior. Under `/research:full`, fail-fast in one module does not abort the whole run.

## 7. Commit and push to main

Per repo `CLAUDE.md` git policy: commit straight to `main`. No branches. No PRs.

Commit through the serialized helper (global git lock; commits only this pathspec; pushes):

```
bash scripts/commit-run.sh "Valuation run: ${ARGUMENTS} <DATE>" -- "analyses/${ARGUMENTS}_<DATE>/valuation/"
```

Capture the commit SHA from `git rev-parse HEAD`.

## 8. Report

Print a final summary to the user containing:

- Number of agents discovered and per-layer breakdown (count + names per layer)
- Which cross-module paths were resolved (business-model, earnings, both, or neither) and the folders used
- Names of any agents that failed (or "none")
- Whether a fail-fast abort was triggered, and by whom (if applicable)
- Full path to the synthesizer's output: `analyses/${ARGUMENTS}_<DATE>/valuation/99_valuation-synthesis.md` (or note that it did not run, if aborted)
- The commit SHA pushed to `origin/main`

---

## Hard rules

- Do not hardcode agent names in this orchestrator. The discovery + dispatch loop lives in `frameworks/MODULE_PIPELINE.md` and is fully data-driven.
- Adding a new file like `.claude/agents/valuation/08_credit-implied-value.md` with `layer: 2` in its frontmatter must require zero changes to this command — it should automatically be picked up, run in layer 2, and written to `analyses/${ARGUMENTS}_<DATE>/valuation/08_credit-implied-value.md`.
