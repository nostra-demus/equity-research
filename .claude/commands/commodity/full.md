---
description: Run the full commodity research pipeline on a commodity (e.g. GOLD, SUGAR). Self-discovers modules from .claude/agents/commodity/*/99_*-synthesis.md, dispatches each module's pipeline in dependency order, and ends at the terminal commodity-thesis module (which emits the Action verdict + writes decision_record.json). Commits the dossier.
argument-hint: COMMODITY
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for a full commodity research run. The commodity is `$ARGUMENTS` (uppercase it, e.g. `gold` → `GOLD`).

This is the commodity-swarm analogue of `/research:full`. Its unit of work is a COMMODITY, not a ticker. There is NO master synthesizer — the terminal `commodity-thesis` module IS the deliverable, and its `Action:` verdict is the run's outcome. Reuse `frameworks/MODULE_PIPELINE.md` for each module, binding `<TICKER>` = `<COMMODITY>` and `<RUN_ROOT>` = `commodity/runs/<COMMODITY>`.

Execute the steps below in order. Do not skip any.

---

## 1. Parse the commodity + date

Uppercase `$ARGUMENTS` to `<COMMODITY>`. Run `date +%Y-%m-%d` via Bash → `<DATE>`.

## 2. Verify the commodity is known

The per-commodity lenses/instruments/sources live in `frameworks/commodity/COMMODITY_PROFILES.md`. Confirm it has a section for this commodity:

```
grep -n "^## <COMMODITY>\b" frameworks/commodity/COMMODITY_PROFILES.md
```

If there is no `## <COMMODITY>` section AND no `data/<COMMODITY>/` folder, STOP: tell the user to add a `## <COMMODITY>` section to `frameworks/commodity/COMMODITY_PROFILES.md` (instruments, applicable lenses, priority sources, recurring reports) first. (An optional `data/<COMMODITY>/` folder may hold user notes; the agents otherwise fetch live public sources.)

## 3. Create the run root

```
mkdir -p "commodity/runs/<COMMODITY>"
```

Capture `commodity/runs/<COMMODITY>` as `<RUN_ROOT>`. (One stable run folder per commodity — NOT date-stamped; a re-run refreshes it in place and resumes past finished modules.)

## 4. Discover modules + dependency order

Glob `.claude/agents/commodity/*/99_*-synthesis.md`. For each, the parent folder name is the module; read its frontmatter `depends_on`. Topologically sort the modules by `depends_on` (alphabetical tiebreak) — mirrors `/research:full`. Expect: `market-structure`, `supply-demand`, `macro-positioning`, then terminal `commodity-thesis` (which depends on the other three). Do NOT hardcode this list — derive it from the discovered graph.

## 5. Run each module in order (resume-aware)

For each module in topo order:

1. **Resume check:** if `<RUN_ROOT>/<module>/99_<module>-synthesis.md` already exists and is non-empty (`test -s`), SKIP this module (a prior run finished it) and treat it as done for cross-module context.
2. **Cross-module context:** build `<CROSS_MODULE_CONTEXT>` exactly as `frameworks/MODULE_PIPELINE.md` Step 4A specifies — one sentence per dependency module that is DONE in this run, `<Dep> cross-module path: <RUN_ROOT>/<dep>/.` (capitalize the dep's first letter). If the module has no deps, set it to `none`.
3. **Run the module pipeline:** follow `frameworks/MODULE_PIPELINE.md` with `<TICKER>` = `<COMMODITY>`, `<DATE>`, `<MODULE>` = the module, `<RUN_ROOT>` = `commodity/runs/<COMMODITY>`, and `<CROSS_MODULE_CONTEXT>` as built. **Commodity deviations:** (a) SKIP Step 1.5 (`extract_pool.py`) unless `data/<COMMODITY>/` exists with files — commodity runs read the profile + live public sources, not an uploaded pool; (b) in the Step 4A Task message the "Data pool path: data/<COMMODITY>/" line is fine — the agents read the `## <COMMODITY>` profile section themselves and fetch primary sources.
4. **Fail-fast:** if the module's Layer-0 triage returns Insufficient (only `market-structure` has a `fail_fast` triage), the pipeline reports `fail_fast_triggered = true`. Stop the run: commit what exists (step 6) and report the abort — do NOT run downstream modules, since the commodity could not be identified/priced.

## 6. Commit the dossier

Commodity run outputs are DATA (CLAUDE.md §25/§28 — the research-data stream). Commit through the serialized helper (data pathspec only):

```
bash scripts/commit-run.sh "Commodity run: <COMMODITY> <DATE>" -- "commodity/runs/<COMMODITY>/"
```

Capture the commit SHA from `git rev-parse HEAD` (the helper prints `COMMIT_SHA=…`, or `NOOP=1` if nothing changed).

## 7. Report

Print a final summary:

- The modules run (and any skipped-because-already-done), with per-module 99-synthesis paths.
- Any agents that failed (or "none"), and whether a fail-fast abort fired.
- The terminal dossier: `commodity/runs/<COMMODITY>/commodity-thesis/99_commodity-thesis-synthesis.md`, its **Action** verdict (Buy / Hold / Trim / Avoid / Research More), and the one-line thesis.
- Confirmation that `commodity/runs/<COMMODITY>/decision_record.json` was written.
- The commit SHA pushed to `origin/main` (or NOOP).

---

## Hard rules

- Do not hardcode module or agent names — everything is discovered from the folders + frontmatter, exactly like `/research:full` and `frameworks/MODULE_PIPELINE.md`.
- Adding a new module folder `.claude/agents/commodity/<new>/` (with a `99_<new>-synthesis.md` carrying `depends_on`) must require zero changes to this command.
- Write only inside `commodity/runs/<COMMODITY>/`. Do not touch other commodities or any company run.
