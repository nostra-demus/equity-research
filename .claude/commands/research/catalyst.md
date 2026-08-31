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
found for `$ARGUMENTS`. Populate the Drive folder for this ticker and re-run." Step 5 performs the
canonical generation verification before any agent reads evidence.

## 3. Create the run root folder

When continuing, use the exact `<RUN_ROOT>` already bound in step 1 and do not create a folder. Otherwise:

```
mkdir -p "analyses/${ARGUMENTS}_<DATE>"
```

Capture `analyses/${ARGUMENTS}_<DATE>` as `<RUN_ROOT>`.

## 4. Resolve cross-module paths (all five upstream modules)

The catalyst agents optionally read prior module outputs for the same ticker. **When `NOSTRA_CONTINUATION_RUN_ROOT` is set (including every cockpit Full chain), resolve only non-empty syntheses inside this exact `<RUN_ROOT>`; omit fail-fast-aborted dependencies and never fall back to older runs.** A standalone module run may fall back to the latest prior-dated completed dependency:

```
if [ -n "${NOSTRA_CONTINUATION_RUN_ROOT:-}" ]; then
  for m in business-model earnings balance-sheet-survival management-governance valuation; do
    MODULE_PATH="$(test -s "$NOSTRA_CONTINUATION_RUN_ROOT/$m/99_${m}-synthesis.md" && printf '%s' "$NOSTRA_CONTINUATION_RUN_ROOT/$m/")"
    printf '%s=%s\n' "$m" "$MODULE_PATH"
  done
else
  for m in business-model earnings balance-sheet-survival management-governance valuation; do
    MODULE_PATH=""
    for d in $(ls -1d analyses/${ARGUMENTS}_*/${m}/ 2>/dev/null | sort -r); do
      [ -s "${d}99_${m}-synthesis.md" ] && { MODULE_PATH="$d"; break; }
    done
    printf '%s=%s\n' "$m" "$MODULE_PATH"
  done
fi
```

Capture each value by its module label. The newest-first loops select the latest completed folders by directory name, which sorts correctly thanks to the `YYYY-MM-DD` date format in the path. If a value is empty, treat that module as `not available`.

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
