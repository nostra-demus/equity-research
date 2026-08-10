---
description: Run the commodity macro-positioning module (macro drivers + positioning/flows) on a commodity. Self-discovers agents from .claude/agents/commodity/macro-positioning/.
argument-hint: COMMODITY
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for the commodity `macro-positioning` module, invoked standalone. The commodity is `$ARGUMENTS` (uppercase → `<COMMODITY>`). For all modules end-to-end use `/commodity:full $ARGUMENTS`.

## 1. Date + profile check
`date +%Y-%m-%d` → `<DATE>`. Confirm a `## <COMMODITY>` section in `frameworks/commodity/COMMODITY_PROFILES.md` (or a `data/<COMMODITY>/` folder); else STOP.

## 2. Create the run root
`mkdir -p "commodity/runs/<COMMODITY>"` → `<RUN_ROOT>`.

## 3. Run the shared module pipeline
Follow `frameworks/MODULE_PIPELINE.md` with `<TICKER>` = `<COMMODITY>`, `<DATE>`, `<MODULE>` = `macro-positioning`, `<RUN_ROOT>` = `commodity/runs/<COMMODITY>`, `<CROSS_MODULE_CONTEXT>` = `none`. SKIP Step 1.5 unless `data/<COMMODITY>/` has files; agents read the `## <COMMODITY>` profile and fetch live sources.

## 4. Compile signal evidence
Run `python3 scripts/commodity_signal_evidence.py "<RUN_ROOT>"`. Stop before commit on failure.

## 5. Commit
```
bash scripts/commit-run.sh "Commodity macro-positioning: <COMMODITY> <DATE>" -- "commodity/runs/<COMMODITY>/macro-positioning/" "commodity/runs/<COMMODITY>/signal_evidence.json"
```
Capture the SHA.

## 6. Report
Per-layer counts + names, failures, the synthesis path `commodity/runs/<COMMODITY>/macro-positioning/99_macro-positioning-synthesis.md`, and the commit SHA.

## Hard rules
Do not hardcode agent names. Write only inside `commodity/runs/<COMMODITY>/macro-positioning/` plus the deterministic `<RUN_ROOT>/signal_evidence.json` aggregate.
