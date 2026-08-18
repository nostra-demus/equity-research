---
description: Run the competitive-intelligence module's layered pipeline on a ticker — benchmark the subject against its competitors' earnings-call transcripts. Self-discovers agents from .claude/agents/competitive-intel/.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for the competitive-intelligence module, invoked standalone (not via `/research:full`). The ticker is `$ARGUMENTS`.

This command runs only the competitive-intel module's pipeline and commits its output. To run all modules end-to-end with the master synthesizer, use `/research:full $ARGUMENTS` instead.

The module reads the COMPETITOR earnings-call transcripts the user has dropped into the subject's pool (`data/$ARGUMENTS/external/**`, e.g. Capital IQ "Competitor Transcripts") and benchmarks them against the subject — the read-through to the subject's next print, the peer × dimension matrix and dispersion, and the cross-examination of the subject's own narrative against the peers.

Execute the steps below in order. Do not skip any.

---

## 1. Resolve today's date

Run `date +%Y-%m-%d` via Bash and capture the result as `<DATE>`.

## 2. Verify the data pool

Check that `data/$ARGUMENTS/` exists and contains at least one file:

```
ls -1 data/$ARGUMENTS/ 2>/dev/null | head -n 1
```

If the directory is missing or empty, STOP. Tell the user: "No data found at `data/$ARGUMENTS/`. Populate the Drive folder for this ticker (including the competitor transcripts under `external/`) and re-run."

Note: the module does NOT abort if the pool has no competitor transcripts — the triage returns Insufficient and the module reports the coverage gap. Only an entirely empty pool stops the command here.

## 3. Create the run root folder

```
mkdir -p "analyses/${ARGUMENTS}_<DATE>"
```

Capture `analyses/${ARGUMENTS}_<DATE>` as `<RUN_ROOT>`.

## 4. Resolve business-model cross-module path

The peer set is inherited from `business-model/08_competitive-map.md`. Resolve the business-model upstream folder — prefer THIS run's date, else the latest prior-dated run (and then state "using prior-run business-model dated X"):

```
ls -1d analyses/${ARGUMENTS}_*/business-model/ 2>/dev/null | sort -r | head -n 1
```

Capture as `<BUSINESS_MODEL_PATH>`. If empty, set it to `not available`.

Build the cross-module context string:

- If `<BUSINESS_MODEL_PATH>` is `not available`: `<CROSS_MODULE_CONTEXT>` = `none`.
- Otherwise: `<CROSS_MODULE_CONTEXT>` = the literal text `Business-model cross-module path: <BUSINESS_MODEL_PATH>` (with the path substituted).

The triage and read-through agents parse this label for the peer set and segment-map; if it is `none` they self-select the peer set from the pool and flag it.

## 5. Run the shared module pipeline

Follow every step in `frameworks/MODULE_PIPELINE.md` with these inputs:

- `<TICKER>` = `$ARGUMENTS`
- `<DATE>` = the `<DATE>` from step 1
- `<MODULE>` = `competitive-intel`
- `<RUN_ROOT>` = the run root from step 3
- `<CROSS_MODULE_CONTEXT>` = the string from step 4

The pipeline discovers agents at `.claude/agents/competitive-intel/[0-9][0-9]_*.md`, groups them by `layer`, dispatches each layer in parallel, persists each output to `<RUN_ROOT>/competitive-intel/`, verifies each output file, and applies fail-fast checks. The triage is `fail_fast: false`, so the module always runs to synthesis even when no competitor transcripts are present.

## 6. Commit and push to main

Per repo `CLAUDE.md` git policy: research-data output commits straight to `main` (§25). No branches, no PRs for the data output.

Commit through the serialized helper (global git lock; commits only this pathspec; pushes):

```
bash scripts/commit-run.sh "Competitive-intel run: ${ARGUMENTS} <DATE>" -- "analyses/${ARGUMENTS}_<DATE>/competitive-intel/"
```

Capture the commit SHA from `git rev-parse HEAD`.

## 7. Report

Print a final summary containing:

- Number of agents discovered and per-layer breakdown
- Whether a business-model cross-module path was resolved (and which folder) or the peer set was self-selected
- Names of any agents that failed (or "none")
- The triage verdict (Sufficient / Partial / Insufficient) and the coverage-of-exposure line
- Full path to the synthesizer's output: `analyses/${ARGUMENTS}_<DATE>/competitive-intel/99_competitive-intel-synthesis.md`
- The commit SHA pushed to `origin/main`

---

## Hard rules

- Do not hardcode agent names in this orchestrator. The discovery + dispatch loop lives in `frameworks/MODULE_PIPELINE.md` and is fully data-driven.
- Adding a new file like `.claude/agents/competitive-intel/05_new-orb.md` with `layer: 2` must require zero changes to this command — it is picked up automatically.
