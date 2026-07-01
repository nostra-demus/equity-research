---
description: Run the terminal commodity-thesis module (catalysts + the action-discipline dossier) on a commodity. Reads the three upstream module syntheses, emits the Action verdict, and writes decision_record.json. Self-discovers agents from .claude/agents/commodity/commodity-thesis/.
argument-hint: COMMODITY
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for the terminal commodity `commodity-thesis` module, invoked standalone. The commodity is `$ARGUMENTS` (uppercase → `<COMMODITY>`). This module `depends_on` `market-structure`, `supply-demand`, and `macro-positioning`; normally run it via `/commodity:full $ARGUMENTS`.

## 1. Date + profile check
`date +%Y-%m-%d` → `<DATE>`. Confirm a `## <COMMODITY>` section in `frameworks/commodity/COMMODITY_PROFILES.md`; else STOP.

## 2. Run root + dependency check
`<RUN_ROOT>` = `commodity/runs/<COMMODITY>` (`mkdir -p`). Check the three upstream syntheses exist:
```
for m in market-structure supply-demand macro-positioning; do test -s "commodity/runs/<COMMODITY>/$m/99_$m-synthesis.md" || echo "MISSING $m"; done
```
If any is MISSING, warn the user that the thesis will run with lower conviction (the synthesis agent handles missing upstream by lowering conviction, not fabricating) — or suggest `/commodity:full <COMMODITY>` first.

## 3. Build cross-module context
One sentence per upstream module folder present under `<RUN_ROOT>`: `Market-structure cross-module path: <RUN_ROOT>/market-structure/.` etc. (capitalize the first letter). If none present, `none`.

## 4. Run the shared module pipeline
Follow `frameworks/MODULE_PIPELINE.md` with `<TICKER>` = `<COMMODITY>`, `<DATE>`, `<MODULE>` = `commodity-thesis`, `<RUN_ROOT>` = `commodity/runs/<COMMODITY>`, and `<CROSS_MODULE_CONTEXT>` as built. SKIP Step 1.5. The terminal synthesis writes both its `99_commodity-thesis-synthesis.md` (with the `Action:` Routing block) and `commodity/runs/<COMMODITY>/decision_record.json`.

## 5. Commit
Commit BOTH the module folder and the run-root decision record:
```
bash scripts/commit-run.sh "Commodity thesis: <COMMODITY> <DATE>" -- "commodity/runs/<COMMODITY>/commodity-thesis/" "commodity/runs/<COMMODITY>/decision_record.json"
```
Capture the SHA.

## 6. Report
Failures (or none), the dossier path `commodity/runs/<COMMODITY>/commodity-thesis/99_commodity-thesis-synthesis.md`, its **Action** verdict, confirmation `decision_record.json` was written, and the commit SHA.

## Hard rules
Do not hardcode agent names. Write only inside `commodity/runs/<COMMODITY>/` (this module's folder + the run-root decision record).
