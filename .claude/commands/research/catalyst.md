---
description: Run the catalyst module's layered pipeline on a ticker. Self-discovers agents from .claude/agents/catalyst/. Reads business-model, earnings, balance-sheet-survival, management-governance, and valuation outputs as cross-module context to build the §17 catalyst calendar.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for the catalyst module, invoked standalone (not via `/research:full`). The ticker is `$ARGUMENTS`.

This command runs only the catalyst module's pipeline and commits its output. To run all modules end-to-end with the master synthesizer, use `/research:full $ARGUMENTS` instead.

The catalyst module is the bottom-up implementation of `CLAUDE.md` §17 Catalyst Discipline. It depends on ALL other modules (business-model, earnings, balance-sheet-survival, management-governance, valuation) — it aggregates scheduled events from each. It still runs if they are absent — each agent falls back to its own read of the data pool — but the calendar is stronger when the upstream modules have run for this ticker.

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

## 4. Resolve cross-module paths (all five upstream modules)

The catalyst agents optionally read prior module outputs for the same ticker. Resolve the most recent run folder of each via Bash:

```
ls -1d analyses/${ARGUMENTS}_*/business-model/ 2>/dev/null | sort -r | head -n 1
ls -1d analyses/${ARGUMENTS}_*/earnings/ 2>/dev/null | sort -r | head -n 1
ls -1d analyses/${ARGUMENTS}_*/balance-sheet-survival/ 2>/dev/null | sort -r | head -n 1
ls -1d analyses/${ARGUMENTS}_*/management-governance/ 2>/dev/null | sort -r | head -n 1
ls -1d analyses/${ARGUMENTS}_*/valuation/ 2>/dev/null | sort -r | head -n 1
```

Capture each first result. The `sort -r | head -n 1` selects the latest folder by directory name, which sorts correctly thanks to the `YYYY-MM-DD` date format in the path. If a command returns an empty string, treat that module as `not available`.

Build the cross-module context string `<CROSS_MODULE_CONTEXT>` by joining one sentence per AVAILABLE module, each capitalized as the agents expect:

- `Business-model cross-module path: <BUSINESS_MODEL_PATH>.`
- `Earnings cross-module path: <EARNINGS_PATH>.`
- `Balance-sheet-survival cross-module path: <BALANCE_SHEET_SURVIVAL_PATH>.`
- `Management-governance cross-module path: <MANAGEMENT_GOVERNANCE_PATH>.`
- `Valuation cross-module path: <VALUATION_PATH>.`

If none are available, use the literal string `none`. Per `.claude/agents/catalyst/MODULE_RULES.md`, agents parse the labels for the modules they read and ignore the rest.

## 5. Run the shared module pipeline

Follow every step in `frameworks/MODULE_PIPELINE.md` with these inputs:

- `<TICKER>` = `$ARGUMENTS`
- `<DATE>` = the `<DATE>` resolved in step 1
- `<MODULE>` = `catalyst`
- `<RUN_ROOT>` = the run root from step 3
- `<CROSS_MODULE_CONTEXT>` = the string from step 4

The pipeline will discover agents at `.claude/agents/catalyst/[0-9][0-9]_*.md`, group them by `layer`, dispatch each layer in parallel, persist each output to `<RUN_ROOT>/catalyst/` per the persistence contract (Modes A/B/C) in `frameworks/MODULE_PIPELINE.md`, verify each output file after every layer, and apply fail-fast checks. Do not assume all specialist reports return inline.

Note: the catalyst module's layer-0 triage does NOT fail-fast — "No proven catalyst yet" is a valid, decision-useful result, not an abort.

## 6. Standalone fail-fast handling

If the pipeline returns `fail_fast_triggered = true` (not expected for this module, since its triage is non-aborting):

- Do NOT proceed to step 7 (commit). Report the abort to the user, including which agent triggered it and the path of its output file.
- Stop here.

Under `/research:full`, fail-fast in one module does not abort the whole run.

## 7. Commit and push to main

Per repo `CLAUDE.md` git policy: commit straight to `main`. No branches. No PRs.

Commit through the serialized helper (global git lock; commits only this pathspec; pushes):

```
bash scripts/commit-run.sh "Catalyst run: ${ARGUMENTS} <DATE>" -- "analyses/${ARGUMENTS}_<DATE>/catalyst/"
```

Capture the commit SHA from `git rev-parse HEAD`.

## 8. Report

Print a final summary to the user containing:

- Number of agents discovered and per-layer breakdown (count + names per layer)
- Which cross-module paths were resolved (which of the five modules, and the folders used)
- Names of any agents that failed (or "none")
- Full path to the synthesizer's output: `analyses/${ARGUMENTS}_<DATE>/catalyst/99_catalyst-synthesis.md`
- The commit SHA pushed to `origin/main`

---

## Hard rules

- Do not hardcode agent names in this orchestrator. The discovery + dispatch loop lives in `frameworks/MODULE_PIPELINE.md` and is fully data-driven.
- Adding a new file like `.claude/agents/catalyst/02_event-probability.md` with `layer: 1` in its frontmatter must require zero changes to this command — it should automatically be picked up and written to `analyses/${ARGUMENTS}_<DATE>/catalyst/02_event-probability.md`.
