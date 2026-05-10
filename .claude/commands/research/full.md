---
description: Run a full equity research workflow on a ticker. Self-discovers all specialist agents in .claude/agents/.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for a self-discovering multi-agent equity research workflow. The ticker is `$ARGUMENTS`.

Execute the following steps in order. Do not skip steps, and do not invent specialists that aren't on disk.

## 1. Resolve today's date

Run `date +%Y-%m-%d` via Bash and capture the result as `<DATE>`. Use this exact string everywhere `<DATE>` appears below.

## 2. Verify the data pool

Check that `data/$ARGUMENTS/` exists and contains at least one file:

```
ls -1 data/$ARGUMENTS/ 2>/dev/null | head -n 1
```

If the directory is missing or empty, STOP. Tell the user: "No data found at `data/$ARGUMENTS/`. Drop source documents (filings, transcripts, models, notes) into that folder and re-run." Do not proceed to any later step.

## 3. Create the run output folder

```
mkdir -p analyses/$ARGUMENTS_<DATE>
```

This is the single output folder for this run. Every specialist and the synthesizer will write into it.

## 4. Discover specialist agents

Use the Glob tool with pattern `.claude/agents/[0-9][0-9]-*.md` to list every specialist agent file. This pattern intentionally excludes `synthesizer.md` and any underscore-prefixed (deactivated) agents.

For each matched file, parse the basename to extract:
- `NN` — the two-digit prefix (e.g. `01`, `07`, `23`)
- `{name}` — the slug between `NN-` and `.md` (e.g. `business-model`, `valuation`)

The agent's invocation name is `{name}` (the same string Claude Code uses to look up sub-agents in `.claude/agents/`).

If the glob returns zero matches, STOP and tell the user: "No specialist agents found. Add at least one `.claude/agents/NN-name.md` file (see `frameworks/HOW_TO_ADD_AN_AGENT.md`) and re-run."

## 5. Run all specialists concurrently

For each discovered agent, dispatch a Task tool call with `subagent_type: "{name}"` and the following user message — substitute `$ARGUMENTS`, `<DATE>`, `{NN}`, and `{name}` literally:

> Analyze ticker $ARGUMENTS. Data pool path: data/$ARGUMENTS/. Output path: analyses/$ARGUMENTS_<DATE>/{NN}_{name}.md. Today's date: <DATE>. Follow your system prompt and write your output to the specified path.

Issue every Task call in a single message so they run in parallel. Wait for all of them to return before moving on.

Track which specialists succeeded and which failed. A specialist is considered to have failed if either (a) the Task call returned an error, or (b) the expected output file `analyses/$ARGUMENTS_<DATE>/{NN}_{name}.md` does not exist after it returns.

## 6. Run the synthesizer

After all specialists have returned, dispatch a single Task call with `subagent_type: "synthesizer"` and this user message:

> Synthesize the analyses in analyses/$ARGUMENTS_<DATE>/. Output the final thesis to analyses/$ARGUMENTS_<DATE>/final_thesis.md.

Wait for it to complete. Treat the synthesizer as failed if `analyses/$ARGUMENTS_<DATE>/final_thesis.md` does not exist when it returns.

## 7. Commit and push to main

Run via Bash:

```
git add analyses/$ARGUMENTS_<DATE>/
git commit -m "Research run: $ARGUMENTS <DATE>"
git push origin main
```

Capture the commit SHA from `git rev-parse HEAD` (or the `git commit` output).

## 8. Report

Print a final summary to the user:

- Number of specialists discovered and run
- Names of any specialists that failed (or "none")
- Whether the synthesizer succeeded
- Path to `analyses/$ARGUMENTS_<DATE>/final_thesis.md`
- The commit SHA pushed to `origin/main`
