---
description: Run the management-governance module's layered pipeline on a ticker. Self-discovers agents from .claude/agents/management-governance/. Reads business-model and earnings outputs as cross-module context.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for the management-governance module, invoked standalone (not via `/research:full`). The ticker is `$ARGUMENTS`.

This command runs only the management-governance module's pipeline and commits its output. To run all modules end-to-end with the master synthesizer, use `/research:full $ARGUMENTS` instead.

The module reads prior business-model and earnings outputs as cross-module context (notably `business-model/01_disqualifier-scan`, `11_capital-allocation-governance`, and `earnings/06_earnings-quality`). It still runs if they are absent — each agent falls back to its own read of the data pool — but the analysis is stronger when the upstream modules have run for this ticker.

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

## 4. Resolve cross-module paths (business-model, earnings)

The governance agents optionally read prior module outputs for the same ticker. Resolve the most recent run folder of each via Bash:

```
ls -1d analyses/${ARGUMENTS}_*/business-model/ 2>/dev/null | sort -r | head -n 1
ls -1d analyses/${ARGUMENTS}_*/earnings/ 2>/dev/null | sort -r | head -n 1
```

Capture the results as `<BUSINESS_MODEL_PATH>` and `<EARNINGS_PATH>`. The `sort -r | head -n 1` selects the latest folder by directory name (the `YYYY-MM-DD` in the path sorts correctly). If a command returns an empty string, treat that module as `not available`.

Build the cross-module context string `<CROSS_MODULE_CONTEXT>` from what is available:

- Both available: `Business-model cross-module path: <BUSINESS_MODEL_PATH>. Earnings cross-module path: <EARNINGS_PATH>.`
- Only business-model: `Business-model cross-module path: <BUSINESS_MODEL_PATH>.`
- Only earnings: `Earnings cross-module path: <EARNINGS_PATH>.`
- Neither: the literal string `none`.

Per `.claude/agents/management-governance/MODULE_RULES.md`, agents that need a path will parse it from the cross-module-context string; agents that don't need it will ignore it.

## 5. Run the shared module pipeline

Follow every step in `frameworks/MODULE_PIPELINE.md` with these inputs:

- `<TICKER>` = `$ARGUMENTS`
- `<DATE>` = the `<DATE>` resolved in step 1
- `<MODULE>` = `management-governance`
- `<RUN_ROOT>` = the run root from step 3
- `<CROSS_MODULE_CONTEXT>` = the string from step 4

The pipeline will discover agents at `.claude/agents/management-governance/[0-9][0-9]_*.md`, group them by `layer`, dispatch each layer in parallel, persist each output to `<RUN_ROOT>/management-governance/` per the persistence contract (Modes A/B/C — self-persist via `Write`/`Bash`, else inline fallback) in `frameworks/MODULE_PIPELINE.md`, verify each output file after every layer, and apply fail-fast checks. Do not assume all specialist reports return inline.

## 6. Standalone fail-fast handling

If the pipeline returns `fail_fast_triggered = true`:

- Do NOT proceed to step 7 (commit). Report the abort to the user, including which agent triggered it and the path of its output file.
- Stop here.

This is the standalone behavior. Under `/research:full`, fail-fast in one module does not abort the whole run.

## 6B. Write structured sidecar outputs

After the synthesizer (`99`) completes, extract the fenced code blocks it emitted (its Section 9, labeled `governance_summary.json`, `governance_findings.csv`, `red_flags.csv`, `source_log.csv`) and Write each to `analyses/${ARGUMENTS}_<DATE>/management-governance/` under that exact filename. Also write `source_manifest.csv` from the triage (`00`) Source Coverage Matrix / Data Freshness tables if present. For any block the synthesizer marked "pending" or did not emit, skip that file and record it as a missing output. (Subagents return inline; the orchestrator owns this file IO. The step-7 `git add` of the module folder will include whatever sidecars were written.)

## 7. Commit and push to main

Per repo `CLAUDE.md` git policy: commit straight to `main`. No branches. No PRs.

Commit through the serialized helper (global git lock; commits only this pathspec; pushes):

```
bash scripts/commit-run.sh "Management-governance run: ${ARGUMENTS} <DATE>" -- "analyses/${ARGUMENTS}_<DATE>/management-governance/"
```

Capture the commit SHA from `git rev-parse HEAD`.

## 8. Report

Print a final summary to the user containing:

- Number of agents discovered and per-layer breakdown (count + names per layer)
- Which cross-module paths were resolved (business-model, earnings) and the folders used
- Names of any agents that failed (or "none")
- Whether a fail-fast abort was triggered, and by whom (if applicable)
- Full path to the synthesizer's output: `analyses/${ARGUMENTS}_<DATE>/management-governance/99_management-governance-synthesis.md` (or note that it did not run, if aborted)
- Whether each structured output exists: `99_management-governance-synthesis.md`, `governance_summary.json`, `governance_findings.csv`, `red_flags.csv`, `source_log.csv`, `source_manifest.csv` — list any that are missing or "pending"
- The commit SHA pushed to `origin/main`

---

## Hard rules

- Do not hardcode agent names in this orchestrator. The discovery + dispatch loop lives in `frameworks/MODULE_PIPELINE.md` and is fully data-driven.
- Adding a new file like `.claude/agents/management-governance/07_succession-and-key-person.md` with `layer: 2` in its frontmatter must require zero changes to this command — it should automatically be picked up, run in layer 2, and written to `analyses/${ARGUMENTS}_<DATE>/management-governance/07_succession-and-key-person.md`.
