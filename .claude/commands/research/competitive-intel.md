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

## 1. Resolve the run root and date

If `NOSTRA_CONTINUATION_RUN_ROOT` is set, require it to equal `analyses/${ARGUMENTS}_YYYY-MM-DD`, require
that exact path to be a real existing directory (not a symlink), derive `<DATE>` from it, and keep it as
`<RUN_ROOT>`. Never call `date` or choose another folder in this mode. Otherwise run `date +%Y-%m-%d` and
capture `<DATE>`.

## 2. Verify the data pool

Treat `data/$ARGUMENTS/` as the logical citation label. If `NOSTRA_FROZEN_EVIDENCE_ROOT` is set, require
the complete four-variable frozen binding named in `frameworks/MODULE_PIPELINE.md` Step 1.5, set the
filesystem `<DATA_PATH>` to that immutable evidence root, and **do not read `data/$ARGUMENTS/` at all**.
Otherwise set `<DATA_PATH>` to `data/$ARGUMENTS/` for this standalone workflow. Check that the resolved
`<DATA_PATH>` exists and contains at least one non-empty regular file. If not, STOP and report: "No data
found for `$ARGUMENTS`. Populate the Drive folder for this ticker (including competitor transcripts under
`external/`) and re-run." Step 5 performs the canonical generation verification before any agent reads
evidence.

Note: the module does NOT abort if the pool has no competitor transcripts — the triage returns Insufficient and the module reports the coverage gap. Only an entirely empty resolved evidence root stops the command here.

## 3. Create the run root folder

When continuing, use the exact `<RUN_ROOT>` already bound in step 1 and do not create a folder. Otherwise:

```
mkdir -p "analyses/${ARGUMENTS}_<DATE>"
```

Capture `analyses/${ARGUMENTS}_<DATE>` as `<RUN_ROOT>`.

## 4. Resolve cross-module paths (business-model AND earnings)

This module declares `depends_on: [business-model, earnings]`: the peer set + segment-map come from `business-model/08_competitive-map.md` and `03_segment-map.md`, while the subject's next-filing basis and its own management claims (for the read-through target and the narrative triangulation) come from `earnings/*`. **When `NOSTRA_CONTINUATION_RUN_ROOT` is set (including every cockpit Full chain), use only completed dependencies inside this exact `<RUN_ROOT>`; omit a fail-fast-aborted dependency and never fall back to an older run.** A standalone module run may use the latest prior-dated completed dependency. In both modes, a dependency is completed only when its `99_<module>-synthesis.md` exists and is non-empty:

```
if [ -n "${NOSTRA_CONTINUATION_RUN_ROOT:-}" ]; then
  BUSINESS_MODEL_PATH="$(test -s "$NOSTRA_CONTINUATION_RUN_ROOT/business-model/99_business-model-synthesis.md" && printf '%s' "$NOSTRA_CONTINUATION_RUN_ROOT/business-model/")"
  EARNINGS_PATH="$(test -s "$NOSTRA_CONTINUATION_RUN_ROOT/earnings/99_earnings-synthesis.md" && printf '%s' "$NOSTRA_CONTINUATION_RUN_ROOT/earnings/")"
else
  BUSINESS_MODEL_PATH=""
  EARNINGS_PATH=""
  # newest-first, but skip any folder whose module synthesis is missing/empty
  for d in $(ls -1d analyses/${ARGUMENTS}_*/business-model/ 2>/dev/null | sort -r); do
    [ -s "${d}99_business-model-synthesis.md" ] && { BUSINESS_MODEL_PATH="$d"; break; }
  done
  for d in $(ls -1d analyses/${ARGUMENTS}_*/earnings/ 2>/dev/null | sort -r); do
    [ -s "${d}99_earnings-synthesis.md" ] && { EARNINGS_PATH="$d"; break; }
  done
fi
printf 'business-model=%s\nearnings=%s\n' "$BUSINESS_MODEL_PATH" "$EARNINGS_PATH"
```

Capture the labelled values as `<BUSINESS_MODEL_PATH>` and `<EARNINGS_PATH>`. Set either to `not available` if its value is empty (no completed run of that dependency exists yet).

Build the cross-module context string by joining one labelled sentence per resolved dependency (the exact format `frameworks/MODULE_PIPELINE.md` expects — the dependency name, first letter capitalised):

- Start with an empty list of sentences.
- If `<BUSINESS_MODEL_PATH>` is not `not available`, append: `Business-model cross-module path: <BUSINESS_MODEL_PATH>.`
- If `<EARNINGS_PATH>` is not `not available`, append: `Earnings cross-module path: <EARNINGS_PATH>.`
- `<CROSS_MODULE_CONTEXT>` = the appended sentences joined by a single space; if the list is empty (neither resolved), set it to the literal string `none`.

Agents parse the label(s) for the dependencies they read: the triage and read-through use the business-model peer set / segment-map and the earnings next-filing basis; narrative triangulation uses the earnings subject-claims. If a label is absent, the affected agent self-serves from the pool and flags it (a peer set self-selected without competitive-map caps the net read-through WEIGHT at Medium).

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
