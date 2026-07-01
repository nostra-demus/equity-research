---
description: Run a SINGLE commodity specialist agent of one module on a commodity, into the commodity's run folder. Self-discovers the agent from .claude/agents/commodity/<MODULE>/. Checks prerequisites; does NOT commit.
argument-hint: MODULE AGENT COMMODITY
allowed-tools: Read, Write, Glob, Bash, Task
---

You run exactly ONE commodity specialist agent — for iterative work and the cockpit's single-agent launches. `$ARGUMENTS` is `<MODULE> <AGENT> <COMMODITY>` (three space-separated tokens).

This is NOT a module or full-pipeline run. It dispatches one agent into the commodity's run folder and does not commit. To run a whole module use `/commodity:<module> <COMMODITY>`; for everything use `/commodity:full <COMMODITY>`.

Execute the steps below in order.

---

## 1. Parse arguments

Split `$ARGUMENTS` into `<MODULE>`, `<AGENT>`, `<COMMODITY>` (uppercase the commodity). If fewer than three tokens, STOP and give the form: `/commodity:agent <MODULE> <AGENT> <COMMODITY>`. Run `date +%Y-%m-%d` → `<DATE>`.

## 2. Discover the agent file

Glob `.claude/agents/commodity/<MODULE>/[0-9][0-9]_*.md`. If nothing, STOP and report that `<MODULE>` is not a valid commodity module (list the folders under `.claude/agents/commodity/`).

Select the file whose slug (between `NN_` and `.md`) OR frontmatter `name` equals `<AGENT>`. If none match, STOP and list the valid `name` values for `<MODULE>`. From the matched file read the frontmatter `name` (= `subagent_type`) and `layer`, parse `<NN>`, and read the body's `UPSTREAM_INPUTS` block.

## 3. Resolve the run root

`<RUN_ROOT>` = `commodity/runs/<COMMODITY>` (one stable folder per commodity). `mkdir -p "<RUN_ROOT>/<MODULE>"`. The output path is `<OUTPUT_PATH>` = `<RUN_ROOT>/<MODULE>/<NN>_<AGENT_SLUG>.md`.

## 4. Prerequisite check (do not fabricate upstream)

For each `REQUIRED` entry in the agent's `UPSTREAM_INPUTS`, resolve its `commodity/runs/{COMMODITY}/...` path against `<RUN_ROOT>` and check with `test -s`. If all exist, proceed. If any is missing, STOP by default and report exactly which is missing and to run the upstream module first (`/commodity:<module> <COMMODITY>`). Do not invent upstream content.

## 5. Build cross-module context

One sentence per upstream module folder that exists under `<RUN_ROOT>`, `<Dep> cross-module path: <RUN_ROOT>/<dep>/.` (capitalize the dep's first letter). If none apply, set `<CROSS_MODULE_CONTEXT>` = `none`.

## 6. Dispatch the single agent

Issue exactly ONE Task call using the `frameworks/MODULE_PIPELINE.md` Step 4A message template, binding `<TICKER>` = `<COMMODITY>` and data pool path `data/<COMMODITY>/` (the agent reads the `## <COMMODITY>` profile section itself and fetches live sources). Pass `<DATE>` and `<CROSS_MODULE_CONTEXT>` verbatim (unless `none`); instruct the agent to persist ONLY its report to `<OUTPUT_PATH>` (Mode A/B/C), with no chat-confirmation block, and **not to run git or commit**.

## 7. Verify + report — do NOT commit

Per `frameworks/MODULE_PIPELINE.md` Step 4B verify `<OUTPUT_PATH>` (`test -s`, starts with `#`, not truncated, no stray confirmation block); one recovery attempt if needed. Then print `<RUN_ROOT>`, `<OUTPUT_PATH>`, whether prerequisites were satisfied, and the agent's one-line Verdict. Do NOT run git — the cockpit/user own when a single output is committed.

---

## Hard rules

- Do not hardcode agent names or layers — discover them from the file + frontmatter.
- Write only `<OUTPUT_PATH>`. Do not modify sibling files or another commodity's folder. Do not commit or push.
