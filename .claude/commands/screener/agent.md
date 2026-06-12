---
description: Run a SINGLE screener agent into an EXISTING signal run (orb-level rerun/iteration). Self-discovers the agent from .claude/agents/screener/<MODULE>/. Checks prerequisites; does NOT commit.
argument-hint: MODULE AGENT SIG_ID
allowed-tools: Read, Write, Glob, Grep, Bash, Task
---

You are the single-agent runner for the screener swarm. Arguments: `$ARGUMENTS` (MODULE, AGENT, SIG_ID).

Mirror of `/research:agent`, adapted to the screener: iterate one orb inside an existing signal run without re-running the pipeline or committing.

---

## 1. Parse and resolve

- `<MODULE>` `<AGENT>` `<SIG_ID>` from the arguments. `date +%Y-%m-%d` → `<DATE>`.
- `<RUN_ROOT>` = `screener/runs/<SIG_ID>`. Require `test -d <RUN_ROOT>` and `test -s <RUN_ROOT>/intake.json` — else STOP ("no such signal run").

## 2. Discover the agent

Glob `.claude/agents/screener/<MODULE>/[0-9][0-9]_*.md`; find the file whose frontmatter `name` or slug matches `<AGENT>`. None → STOP listing available agents. Parse `name`, `NN`, `layer`. `<OUTPUT_PATH>` = `<RUN_ROOT>/<MODULE>/<NN>_<slug>.md`.

## 3. Prerequisite check

From the agent body's `UPSTREAM_INPUTS` block, collect REQUIRED paths (substitute `{SIG_ID}`). `test -s` each; any missing → STOP, list them, and name the command that produces them (usually `/screener:signal <SIG_ID>` to that stage).

**Lock guard:** if `<RUN_ROOT>/thesis_record.json` exists with `meta.locked: true`, agents in `thesis-structure` and `edge-definition` may NOT be re-run (the record is locked; §-lock rule in SWARM.md). STOP and explain — candidate-surfacing agents and signal-gate agents remain re-runnable (signal-gate reruns only refresh the payload/report; they never unlock a record).

## 4. Dispatch

`mkdir -p <RUN_ROOT>/<MODULE>`. One Task call, `subagent_type: <name>`, with the SCREENER_PIPELINE.md task message (signal id, run root, intake path, ledger root, date, cross-module context built from the run's existing synthesis files, the OUTPUT_PATH persistence contract — Modes A/B/C, clean file, no confirmation block, no git).

## 5. Verify

`test -s <OUTPUT_PATH>`; starts with `#`; no stray confirmation block in the last 20 lines (MODULE_PIPELINE.md Step 4B checks). Recover per the pipeline if not.

## 6. Refresh derived state (no commit)

If the agent was a synthesis that rewrites JSON state (signal payload / candidates), re-run `python3 scripts/update_board_index.py`. Do NOT commit — this command is for iteration; the next `/screener:signal` or a manual commit picks the changes up.

## 7. Report

Print: agent, output path, its `Verdict:`/`Routing:` line, and what downstream artifacts are now stale (every later module's outputs in this run) — suggest the rerun order.
