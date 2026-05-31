---
description: Run the full equity research workflow on a ticker. Self-discovers modules from .claude/agents/*/99_*-synthesis.md and dispatches each module's pipeline, then the master synthesizer.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the master orchestrator for a self-discovering multi-module equity research workflow. The ticker is `$ARGUMENTS`.

This orchestrator:
1. Discovers modules dynamically (does not hardcode `business-model` / `earnings` / any future module).
2. Writes `RUN_METADATA.md` before any module runs.
3. Runs each module's pipeline inline, using the shared pipeline defined in `frameworks/MODULE_PIPELINE.md`.
4. Continues past per-module fail-fast aborts; aborts the whole run only if **every** module aborts.
5. Invokes the master synthesizer once all modules finish.
6. Makes **two** commits on `main` per run (per repo `CLAUDE.md` git policy: one run-artifacts commit, then one metadata-backfill commit that fills in the commit SHA of the first one). Per-module commits do NOT happen under this orchestrator — they only happen when a module command is invoked standalone.

Execute the steps below in order. Do not skip any.

---

## 1. Resolve today's date

Run `date +%Y-%m-%d` via Bash and capture the result as `<DATE>`. Use this exact string everywhere `<DATE>` appears below.

Also capture `<STARTED_AT>` from `date -u +%Y-%m-%dT%H:%M:%SZ` for the metadata file.

---

## 2. Verify the data pool

Check that `data/$ARGUMENTS/` exists and contains at least one file:

```
ls -1 data/$ARGUMENTS/ 2>/dev/null | head -n 1
```

If the directory is missing or empty, STOP. Tell the user: "No data found at `data/$ARGUMENTS/`. Populate the Drive folder for this ticker and re-run." Do not proceed to any later step.

---

## 3. Create the run root folder

```
mkdir -p "analyses/${ARGUMENTS}_<DATE>"
```

Capture the path `analyses/${ARGUMENTS}_<DATE>` as `<RUN_ROOT>`. Every module and the master synthesizer will write inside this folder. Use `${ARGUMENTS}_<DATE>` (with braces) in Bash to avoid the `$ARGUMENTS_<DATE>` shell-parse ambiguity.

---

## 4. Discover runnable modules

Use the Glob tool with pattern `.claude/agents/*/99_*-synthesis.md`.

For each matched file, extract `<module>` as the parent directory's basename (e.g. `business-model`, `earnings`). A module is "runnable" precisely when it has a `99_*-synthesis.md` agent.

If the glob returns zero matches, STOP and tell the user: "No runnable modules found under `.claude/agents/*/`. Add at least one module with a `99_*-synthesis.md` agent."

### Module ordering (dependency-driven)

For each discovered module, read `depends_on` from its `99_*-synthesis.md` frontmatter — a list of module names it consumes (treat a missing or empty `depends_on` as no dependencies). Ignore any listed dependency that is not itself a discovered runnable module (treat it as absent).

Order the modules by a **topological sort** of that dependency graph: a module runs only AFTER every module in its `depends_on`. Among modules whose dependencies are all already placed, pick the next in **alphabetical order** (stable and deterministic). If a dependency cycle makes a topological order impossible, fall back to alphabetical order and note the cycle in `RUN_METADATA.md`.

(With today's modules this yields: business-model → earnings → balance-sheet-survival → management-governance → valuation. No module name is hardcoded — the order is derived entirely from `depends_on`.)

Capture the ordered list as `<MODULES_PLANNED>`, and keep each module's `depends_on` list (used in step 8A).

---

## 5. Resolve prior run reference

```
ls -1d analyses/${ARGUMENTS}_* 2>/dev/null | sort -r | grep -v "^analyses/${ARGUMENTS}_<DATE>$" | head -n 1
```

Capture the result as `<PRIOR_RUN>`. If empty, set it to the literal string `none`.

---

## 6. Capture repo SHA

```
git rev-parse HEAD
```

Capture the result as `<REPO_SHA>`.

---

## 7. Write RUN_METADATA.md (initial)

Use the Write tool to create `<RUN_ROOT>/RUN_METADATA.md` with the following content (substitute values literally):

```
# Run Metadata

- ticker: $ARGUMENTS
- run_date: <DATE>
- started_at: <STARTED_AT>
- orchestrator: /research:full
- repo_sha: <REPO_SHA>
- data_folder: data/$ARGUMENTS/
- prior_run: <PRIOR_RUN>

## Source files

<one line per file from `ls -1 data/$ARGUMENTS/`>

## Modules planned

<one line per module from <MODULES_PLANNED>>

## Modules completed

(filled in at end of run)

## Modules aborted

(filled in at end of run)

## Synthesizer status

(filled in at end of run)

## Commit SHA

(filled in at end of run)
```

---

## 8. Run each module sequentially

For each module in `<MODULES_PLANNED>` (in the order from step 4):

### 8A. Build cross-module context

Build `<CROSS_MODULE_CONTEXT>` for this module from its `depends_on` list (captured in step 4), naming only dependencies that **completed in THIS run**:

1. For each module name `<dep>` in this module's `depends_on`, check whether `<RUN_ROOT>/<dep>/99_<dep>-synthesis.md` exists (i.e. it completed in this run).
2. For each `<dep>` that completed, produce the sentence: `<Dep> cross-module path: <RUN_ROOT>/<dep>/.` — where `<Dep>` is the dependency name with its first letter capitalized (`business-model` → `Business-model`, `earnings` → `Earnings`). This is the label format every dependent agent parses.
3. Join the sentences with a single space to form `<CROSS_MODULE_CONTEXT>`.
4. If this module has no `depends_on`, or none of its dependencies completed in this run, set `<CROSS_MODULE_CONTEXT>` to the literal string `none`.

**Important:** always use the **current run's** paths, never an older run's. Do not fall back to `ls analyses/${ARGUMENTS}_*/<dep>/ | sort -r | head -n 1` here — that is the standalone commands' behavior. Within a `/research:full` run the current run's path is the only correct value, and a dependency that aborted in this run is simply omitted (or yields `none` if it was the only dependency).

### 8B. Invoke the shared pipeline

Follow every step in `frameworks/MODULE_PIPELINE.md` with these inputs:

- `<TICKER>` = `$ARGUMENTS`
- `<DATE>` = the `<DATE>` resolved in step 1
- `<MODULE>` = the current module name
- `<RUN_ROOT>` = the run root from step 3
- `<CROSS_MODULE_CONTEXT>` = the string from step 8A

### 8C. Record outcome

After the shared pipeline returns:

- If `fail_fast_triggered = true`: record this module under "Modules aborted" with a brief note (which agent triggered, output file path). **Continue to the next module — do not abort the whole run.**
- Else, if all expected agents wrote files including the module's `99_*-synthesis.md`: record this module under "Modules completed".
- Else (partial failure with no fail-fast): record under "Modules aborted" with the failed agent names.

---

## 9. Decide whether to invoke master synthesizer

After all modules complete:

- If **at least one** module is in "Modules completed", proceed to step 10.
- If **every** module is in "Modules aborted", skip steps 10–11; jump to step 12 (commit) with `Synthesizer status: skipped (all modules aborted)` written into `RUN_METADATA.md`.

---

## 10. Run the master synthesizer

Dispatch a single Task call:

- `subagent_type: "synthesizer"`
- User message:

  > Synthesize the analyses in <RUN_ROOT>/. Output the final thesis to <RUN_ROOT>/final_thesis.md.

Wait for it to complete. Treat the synthesizer as failed if `<RUN_ROOT>/final_thesis.md` does not exist when it returns.

---

## 11. Update RUN_METADATA.md (final)

Rewrite `<RUN_ROOT>/RUN_METADATA.md` via the Write tool to fill in the placeholder sections. Read the current file first, then issue a single Write call with the full new content. (This command does not have access to the Edit tool — see the `allowed-tools` frontmatter.) Fill in:

- "Modules completed": list (one per line)
- "Modules aborted": list with brief note per entry (one per line)
- "Synthesizer status": `succeeded` (if `final_thesis.md` exists), `failed` (if it does not), or `skipped (all modules aborted)`
- "Commit SHA": leave as `(to be filled after commit)` — you'll patch it post-commit in step 12.

---

## 12. Commit and push to main

Per repo `CLAUDE.md` git policy: commit straight to `main`. No branches. No PRs.

```
git add "analyses/${ARGUMENTS}_<DATE>/"
git commit -m "Research run: ${ARGUMENTS} <DATE>"
git push origin main
```

Capture the commit SHA from `git rev-parse HEAD` and patch the "Commit SHA" field in `RUN_METADATA.md` by rewriting that file via the Write tool (read it, substitute the SHA in place of `(to be filled after commit)`, write the full new content). Do not use `git commit --amend` — per `CLAUDE.md` spirit, prefer new commits over amends. Add the SHA patch as a follow-up commit:

```
git add "analyses/${ARGUMENTS}_<DATE>/RUN_METADATA.md"
git commit -m "Backfill commit SHA in RUN_METADATA for ${ARGUMENTS} <DATE>"
git push origin main
```

(The two-commit approach is intentional: it keeps the run-artifacts commit clean of metadata about itself.)

---

## 13. Report

Print a final summary to the user containing:

- Number of modules discovered and their names
- Per-module status: `completed` / `aborted (fail-fast at <agent>)` / `aborted (failures: <names>)`
- Whether the master synthesizer ran and whether `final_thesis.md` exists
- Path to `final_thesis.md` (or note that it was skipped)
- The two commit SHAs pushed to `origin/main`

---

## Hard rules

- Do not hardcode any module name. Run order (step 4) and cross-module context (step 8A) are both derived from each module's `depends_on:` frontmatter — adding a module requires only its files plus its `depends_on` list, with zero edits to this orchestrator.
- Adding a new module — e.g. dropping `.claude/agents/valuation/` with specialists and a `99_valuation-synthesis.md` — must require zero changes to this orchestrator beyond optionally updating the ordering rule in step 4 if cross-module dependencies need it.
- Never invoke another slash command from within this command. The shared pipeline is followed *inline* via the instructions in `frameworks/MODULE_PIPELINE.md`; the standalone module commands at `.claude/commands/research/<module>.md` are NOT called.
- Exactly two commits per run: one run-artifacts commit and one metadata-backfill commit that fills in the commit SHA of the first. Per-module commits do not happen here.
