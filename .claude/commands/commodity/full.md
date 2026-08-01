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

## 5.5. Integrity finish-gate — pre-mortem haircut propagation

`commodity-thesis-synthesis` is both advocate and judge of its own `Action:` call — nothing independently tested that verdict before this step existed (`commodity:pre-mortem`'s own rationale). This closes that gap the same way `research:full` step 10B.2 closes it for equity calls (fix F28/F28b), adapted to the commodity swarm's stable one-folder-per-commodity model (no dated re-runs to key a "did this run just happen" check off of).

**Run this step iff EITHER:**
- (a) the terminal `commodity-thesis` module was completed FRESH in step 5 of THIS invocation (its resume check did not skip it), **or**
- (b) it was skip-resumed as already-done, but `<RUN_ROOT>/decision_record.json` has no `post_review_confidence_score` field yet — a pre-existing run that predates this gate, backfilled once on its next invocation.

Otherwise (already done AND already carries `post_review_confidence_score`) skip this step entirely — an already-audited, unchanged run must not accumulate a fresh pre-mortem version on every resume-only call.

When the step runs:

1. Follow `.claude/commands/commodity/pre-mortem.md` against `<RUN_ROOT>` in full — produce ONLY `<RUN_ROOT>/pre_mortem*.json` (adversarial red-team; per its rule 1 it can only HOLD or LOWER conviction, never raise it). Skip its own step 7 commit — this command's step 6 below commits the whole run folder in one place.
2. **Haircut propagation** — patch `decision_record.json` with the pre-mortem's verdict via the shared, tested helper (mirrors research/full.md 10B.2's F28/F28b exactly, in the commodity schema — `action`/`confidence`, not `decision`/`basket`/`confidence_score`):

```bash
python3 scripts/commodity_pre_mortem_haircut.py "<RUN_ROOT>"
```

The helper **fails closed**: it exits `0` and prints `RATING-CAP:` only when it actually propagated a fresh pre-mortem; on `no_pre_mortem` / `read_error` / `stale_pre_mortem` it prints `GATE-FAIL:` and exits **nonzero**, leaving `decision_record.json` unpatched. Because step 1 just generated a fresh pre-mortem against this run, a nonzero exit means the integrity gate genuinely could not run — **STOP before the step 6 commit and report the `GATE-FAIL:` reason; do not ship a `decision_record.json` whose `Action:` verdict was never red-teamed.** On success, record the printed `RATING-CAP:` line for step 7 (report). The patch is additive — `confidence_haircut`, `pre_mortem_verdict`, `post_review_confidence_score`, `post_mortem_action` — and never rewrites the synthesizer's own original `action`/`confidence` fields (CLAUDE.md §18/§22: caps are applied, never silently overridden; the original call stays visible for audit). The cap is enforced deterministically by the helper (a would-be conviction RAISE from a mis-authored pre-mortem is clamped/rejected), not trusted from the LLM-authored report.

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
- **The integrity finish-gate result (step 5.5):** the `RATING-CAP:` line — the pre-mortem verdict, the confidence haircut (if any), and the `post_mortem_action` cap (if any); or "not run (already audited)" if step 5.5 was skipped; or, if the helper exited nonzero, the `GATE-FAIL:` reason and the fact that the run was HALTED before commit (no unaudited record shipped).
- The commit SHA pushed to `origin/main` (or NOOP).

---

## Hard rules

- Do not hardcode module or agent names — everything is discovered from the folders + frontmatter, exactly like `/research:full` and `frameworks/MODULE_PIPELINE.md`.
- Adding a new module folder `.claude/agents/commodity/<new>/` (with a `99_<new>-synthesis.md` carrying `depends_on`) must require zero changes to this command.
- Write only inside `commodity/runs/<COMMODITY>/`. Do not touch other commodities or any company run.
- The integrity finish-gate (step 5.5) is the ONLY step in this command that mutates `decision_record.json` after the terminal module wrote it. `commodity:pre-mortem.md` itself stays strictly read-only — the mutation lives here, exactly mirroring the research swarm's split between `research:pre-mortem.md` (read-only) and `research:full.md` step 10B.2 (the mutator).
