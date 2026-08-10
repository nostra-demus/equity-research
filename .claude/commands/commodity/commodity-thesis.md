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
First refresh the shared production pulse and compile the machine coverage gate:
`bash scripts/refresh-swarm-pulse.sh commodity "<COMMODITY>"`.
`PULSE-MISSING` is honest absence and must not be replaced with a scraped or inferred quote.
`python3 scripts/commodity_profile_coverage.py "<RUN_ROOT>" --decision-time "$(date -u +%Y-%m-%dT%H:%M:%SZ)"`.
Stop on `PROFILE-COVERAGE-FAIL`; incomplete coverage is valid and forces abstention downstream. Then follow
`frameworks/MODULE_PIPELINE.md` with `<TICKER>` = `<COMMODITY>`, `<DATE>`, `<MODULE>` = `commodity-thesis`,
`<RUN_ROOT>` = `commodity/runs/<COMMODITY>`, and `<CROSS_MODULE_CONTEXT>` as built. SKIP Step 1.5. The
terminal synthesis writes both its `99_commodity-thesis-synthesis.md` (with the `Action:` Routing block)
and `commodity/runs/<COMMODITY>/decision_record.json`. Run
`python3 scripts/commodity_forecast_contract.py "<RUN_ROOT>/decision_record.json"`; stop before commit on
any failure.

## 5. Independent finish-gate + immutable publication

Capture any prior report:
`PRIOR_PM=$(ls -t "<RUN_ROOT>"/pre_mortem*.json 2>/dev/null | head -1)`.
Run `.claude/commands/commodity/pre-mortem.md` against `<RUN_ROOT>` in full, producing a fresh
`pre_mortem*.json`, but skip that command's own commit. Then apply the deterministic cap:

```
python3 scripts/commodity_pre_mortem_haircut.py "<RUN_ROOT>" ${PRIOR_PM:+--prior "$PRIOR_PM"}
```

On any `GATE-FAIL`, STOP before archive or commit. On success, archive the exact reviewed record before
updating the UI projection:

```
python3 scripts/commodity_decision_archive.py "<RUN_ROOT>"
```

On `ARCHIVE-FAIL`, STOP before commit. Record the `RATING-CAP:` and `DECISION-ARCHIVE:` lines.

## 6. Commit

Commit the whole run root so the dossier, frozen coverage, pre-mortem and immutable decision snapshot
travel together:

```
bash scripts/commit-run.sh "Commodity thesis: <COMMODITY> <DATE>" -- "commodity/runs/<COMMODITY>/"
```

Capture the SHA.

## 7. Report

Failures (or none), the dossier path `commodity/runs/<COMMODITY>/commodity-thesis/99_commodity-thesis-synthesis.md`,
its **Action** verdict, the pre-mortem cap, immutable decision ID/archive path, confirmation
`decision_record.json` was written, and the commit SHA.

## Hard rules
Do not hardcode agent names. Write only inside `commodity/runs/<COMMODITY>/`. Never commit an unaudited
or unarchived terminal decision.
