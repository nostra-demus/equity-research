---
description: Run the commodity market-structure module (identity, instruments, price trend, futures curve) on a commodity. Self-discovers agents from .claude/agents/commodity/market-structure/.
argument-hint: COMMODITY
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for the commodity `market-structure` module, invoked standalone. The commodity is `$ARGUMENTS` (uppercase it → `<COMMODITY>`). To run all modules end-to-end use `/commodity:full $ARGUMENTS`.

Execute in order:

## 1. Date + profile check
Run `date +%Y-%m-%d` → `<DATE>`. Confirm a `## <COMMODITY>` section exists in `frameworks/commodity/COMMODITY_PROFILES.md` (or a `data/<COMMODITY>/` folder). If neither, STOP and tell the user to add a profile section first.

## 2. Create the run root
`mkdir -p "commodity/runs/<COMMODITY>"` → `<RUN_ROOT>`.

## 3. Run the shared module pipeline
Follow `frameworks/MODULE_PIPELINE.md` with `<TICKER>` = `<COMMODITY>`, `<DATE>`, `<MODULE>` = `market-structure`, `<RUN_ROOT>` = `commodity/runs/<COMMODITY>`, `<CROSS_MODULE_CONTEXT>` = `none`. Commodity deviations: SKIP Step 1.5 (`extract_pool.py`) unless `data/<COMMODITY>/` has files; the agents read the `## <COMMODITY>` profile section and fetch live public sources.

## 4. Fail-fast
This module has a `fail_fast` Layer-0 triage (`commodity-triage`). If the pipeline returns `fail_fast_triggered = true`, do NOT commit — report the abort (which agent, its output path) and stop.

## 5. Commit
```
bash scripts/commit-run.sh "Commodity market-structure: <COMMODITY> <DATE>" -- "commodity/runs/<COMMODITY>/market-structure/"
```
Capture the SHA (`COMMIT_SHA=…` or `NOOP=1`).

## 6. Report
Per-layer agent counts + names, any failures, fail-fast status, the synthesis path `commodity/runs/<COMMODITY>/market-structure/99_market-structure-synthesis.md`, and the commit SHA.

## Hard rules
Do not hardcode agent names — the discovery/dispatch loop lives in `frameworks/MODULE_PIPELINE.md`. Write only inside `commodity/runs/<COMMODITY>/market-structure/`.
