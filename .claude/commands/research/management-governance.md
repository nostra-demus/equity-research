---
description: Run the management-governance module's layered pipeline on a ticker. Self-discovers agents from .claude/agents/management-governance/. Reads business-model and earnings outputs as cross-module context.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for the management-governance module, invoked standalone (not via `/research:full`). The ticker is `$ARGUMENTS`.

This command runs only the management-governance module's pipeline and commits its output. To run all modules end-to-end with the master synthesizer, use `/research:full $ARGUMENTS` instead.

The module reads prior business-model, earnings, and balance-sheet-survival outputs as cross-module context (notably `business-model/01_disqualifier-scan`, `11_capital-allocation-governance`, `earnings/06_earnings-quality`, `earnings/01_historical-financials`, and `balance-sheet-survival/05_off-balance-sheet-and-contingencies`). It still runs if they are absent — each agent falls back to its own read of the data pool — but the analysis is stronger when the upstream modules have run for this ticker.

Execute the steps below in order. Do not skip any.

---

## 1. Resolve the run root and date once

Resolve both values with this single mutually-exclusive branch. For a one-click exact resume
(`NOSTRA_EXACT_MODULE_RESUME=1`), **do not call `date` and do not rebuild the path from the wall clock**.
The cockpit has already reviewed, staged, published, locked, and fingerprinted one immutable target root.
Require and validate that child-only binding, then derive `<DATE>` from it. Only an ordinary standalone run
may read the local date:

```bash
if [ "${NOSTRA_EXACT_MODULE_RESUME:-}" = "1" ]; then
  EXACT_RUN_ROOT="${NOSTRA_EXACT_MODULE_RUN_ROOT:-}"
  DATE="${EXACT_RUN_ROOT##*_}"
  if [[ ! "$DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] \
     || [ "$EXACT_RUN_ROOT" != "analyses/${ARGUMENTS}_${DATE}" ]; then
    echo "Exact module resume is missing its valid immutable run-root binding; refusing to widen scope." >&2
    exit 1
  fi
  RUN_ROOT="$EXACT_RUN_ROOT"
elif [ -n "${NOSTRA_CONTINUATION_RUN_ROOT:-}" ]; then
  RUN_ROOT="$NOSTRA_CONTINUATION_RUN_ROOT"
  DATE="${RUN_ROOT##*_}"
  if [[ ! "$DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] \
     || [ "$RUN_ROOT" != "analyses/${ARGUMENTS}_${DATE}" ] \
     || [ ! -d "$RUN_ROOT" ] || [ -L "$RUN_ROOT" ]; then
    echo "Continue is missing its valid immutable saved-run binding; refusing to widen scope." >&2
    exit 1
  fi
else
  DATE="$(date +%Y-%m-%d)"
  RUN_ROOT="analyses/${ARGUMENTS}_${DATE}"
fi
```

Capture these values as `<DATE>` and `<RUN_ROOT>` and keep them unchanged for every later step. This is
required even if local midnight passes while the command is running.

## 2. Verify the data pool

Treat `data/$ARGUMENTS/` as the logical citation label. If `NOSTRA_FROZEN_EVIDENCE_ROOT` is set, require
the complete four-variable frozen binding named in `frameworks/MODULE_PIPELINE.md` Step 1.5, set the
filesystem `<DATA_PATH>` to that immutable evidence root, and **do not read `data/$ARGUMENTS/` at all**.
Otherwise set `<DATA_PATH>` to `data/$ARGUMENTS/` for this standalone workflow. Check that the resolved
`<DATA_PATH>` exists and contains at least one non-empty regular file. If not, STOP and report: "No data
found for `$ARGUMENTS`. Populate the Drive folder for this ticker and re-run." Step 4 performs the
canonical generation verification before any agent reads evidence.

## 3. Create the run root folder

```
mkdir -p "$RUN_ROOT"
```

## 4. Resolve cross-module paths (business-model, earnings, balance-sheet-survival)

The governance agents optionally read prior module outputs for the same ticker. Resolve the upstream folder of each via Bash — **prefer THIS run's `<RUN_ROOT>/`; only fall back to the latest prior-dated run (and then state "using prior-run upstream dated X" in your output) when this run lacks that module (fix F30). One-click exact resume is stricter: when `NOSTRA_EXACT_MODULE_RESUME=1`, use ONLY modules both named in the comma-separated `NOSTRA_EXACT_MODULE_INPUTS` allowlist and staged in the immutable `<RUN_ROOT>` bound in Step 1; never fall back across dated folders. Those current paths are the exact inputs the cockpit checkpointed, published, locked against concurrent writes, and fingerprinted before launch:**

```
if [ "${NOSTRA_EXACT_MODULE_RESUME:-}" = "1" ]; then
  EXACT_INPUTS=",${NOSTRA_EXACT_MODULE_INPUTS:-},"
  case "$EXACT_INPUTS" in *,business-model,*) BUSINESS_MODEL_PATH="$(test -d "$RUN_ROOT/business-model" && printf '%s' "$RUN_ROOT/business-model/")" ;; *) BUSINESS_MODEL_PATH="" ;; esac
  case "$EXACT_INPUTS" in *,earnings,*) EARNINGS_PATH="$(test -d "$RUN_ROOT/earnings" && printf '%s' "$RUN_ROOT/earnings/")" ;; *) EARNINGS_PATH="" ;; esac
  case "$EXACT_INPUTS" in *,balance-sheet-survival,*) BALANCE_SHEET_SURVIVAL_PATH="$(test -d "$RUN_ROOT/balance-sheet-survival" && printf '%s' "$RUN_ROOT/balance-sheet-survival/")" ;; *) BALANCE_SHEET_SURVIVAL_PATH="" ;; esac
else
  BUSINESS_MODEL_PATH="$(ls -1d analyses/${ARGUMENTS}_*/business-model/ 2>/dev/null | sort -r | head -n 1)"
  EARNINGS_PATH="$(ls -1d analyses/${ARGUMENTS}_*/earnings/ 2>/dev/null | sort -r | head -n 1)"
  BALANCE_SHEET_SURVIVAL_PATH="$(ls -1d analyses/${ARGUMENTS}_*/balance-sheet-survival/ 2>/dev/null | sort -r | head -n 1)"
fi
printf 'business-model=%s\nearnings=%s\nbalance-sheet-survival=%s\n' "$BUSINESS_MODEL_PATH" "$EARNINGS_PATH" "$BALANCE_SHEET_SURVIVAL_PATH"
```

Capture the results as `<BUSINESS_MODEL_PATH>`, `<EARNINGS_PATH>`, and `<BALANCE_SHEET_SURVIVAL_PATH>`. The `sort -r | head -n 1` selects the latest folder by directory name (the `YYYY-MM-DD` in the path sorts correctly). If a command returns an empty string, treat that module as `not available`.

Build the cross-module context string `<CROSS_MODULE_CONTEXT>` from what is available — one sentence per available module, concatenated in this order (dependency name, first letter capitalized):

- `Business-model cross-module path: <BUSINESS_MODEL_PATH>.`
- `Earnings cross-module path: <EARNINGS_PATH>.`
- `Balance-sheet-survival cross-module path: <BALANCE_SHEET_SURVIVAL_PATH>.`
- None available: the literal string `none`.

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

## 6A. Exact-resume synthesis gate

When `NOSTRA_EXACT_MODULE_RESUME=1`, the current discovered `99` synthesis must be both successful and
mechanically valid before any sidecar extraction or Git command:

1. Use the synthesis output path discovered by the shared pipeline; do not hardcode its filename.
2. If its one Task call returned an error for any reason, run
   `node scripts/agent-output-validity.mjs --quarantine-exact-synthesis "<SYNTHESIS_OUTPUT_PATH>"`
   even if the Task left a valid-looking file, then STOP before step 6B or step 7.
3. Otherwise run `node scripts/agent-output-validity.mjs "<SYNTHESIS_OUTPUT_PATH>"`. If it fails, run the
   same `--quarantine-exact-synthesis` command and STOP before step 6B or step 7.
4. If either quarantine command fails, still STOP. Never commit or publish an invalid/error synthesis.

The helper is bound to the server-approved exact run root, module, and current synthesis stem. This keeps
an errored or truncated `99` retryable: the next module-heading click can run only the missing summary.

## 6B. Write structured sidecar outputs

The synthesizer's labelled sidecar exports (its Section 9 fenced blocks — `governance_summary.json`, `governance_checklist.csv`, `people_register.csv`, `governance_findings.csv`, `red_flags.csv`, `source_log.csv`) are extracted and written to `<RUN_ROOT>/management-governance/` by the shared pipeline generically (`frameworks/MODULE_PIPELINE.md` Step 4.9C, which persists whatever filenames any module's `99_*-synthesis.md` labels) — do NOT re-extract them here, so full runs and standalone runs behave identically.

This command additionally writes `source_manifest.csv` from the triage (`00`) Source Coverage Matrix / Data Freshness tables if present — it is derived from the `00` triage, not a `99`-labelled fenced block, so the pipeline's generic step does not cover it. Write it to the same module folder. (Subagents return inline; the orchestrator owns this file IO. The step-7 `git add` of the module folder will include whatever sidecars were written.)

## 7. Commit and push to main

Per repo `CLAUDE.md` git policy: commit straight to `main`. No branches. No PRs.

Commit through the serialized helper (global git lock; commits only this pathspec; pushes):

```
bash scripts/commit-run.sh "Management-governance run: ${ARGUMENTS} <DATE>" -- "$RUN_ROOT/management-governance/"
```

Capture the commit SHA from `git rev-parse HEAD`.

## 8. Report

Print a final summary to the user containing:

- Number of agents discovered and per-layer breakdown (count + names per layer)
- Which cross-module paths were resolved (business-model, earnings, balance-sheet-survival) and the folders used
- Names of any agents that failed (or "none")
- Whether a fail-fast abort was triggered, and by whom (if applicable)
- Full path to the synthesizer's output: `<RUN_ROOT>/management-governance/99_management-governance-synthesis.md` (or note that it did not run, if aborted)
- The Non-Negotiable Gate result (PASS/FAIL) and the checklist coverage line from the synthesis
- Whether each structured output exists: `99_management-governance-synthesis.md`, `governance_summary.json`, `governance_checklist.csv`, `people_register.csv`, `governance_findings.csv`, `red_flags.csv`, `source_log.csv`, `source_manifest.csv` — list any that are missing or "pending"
- The commit SHA pushed to `origin/main`

---

## Hard rules

- Do not hardcode agent names in this orchestrator. The discovery + dispatch loop lives in `frameworks/MODULE_PIPELINE.md` and is fully data-driven.
- Adding a new file like `.claude/agents/management-governance/07_succession-and-key-person.md` with `layer: 2` in its frontmatter must require zero changes to this command — it should automatically be picked up, run in layer 2, and written to `<RUN_ROOT>/management-governance/07_succession-and-key-person.md`.
