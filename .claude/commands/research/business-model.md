---
description: Run the business-model module's layered pipeline on a ticker. Self-discovers agents from .claude/agents/business-model/.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for the business-model module. The ticker is `$ARGUMENTS`. This module's specialists live in `.claude/agents/business-model/` and are organised into ordered layers via `layer:` frontmatter. You must discover them — never hardcode their names.

Execute the steps below in order. Do not skip any.

## 1. Resolve today's date

Run `date +%Y-%m-%d` via Bash and capture the result as `<DATE>`. Use this exact string everywhere `<DATE>` appears below.

## 2. Verify the data pool

Check that `data/$ARGUMENTS/` exists and contains at least one file:

```
ls -1 data/$ARGUMENTS/ 2>/dev/null | head -n 1
```

If the directory is missing or empty, STOP. Tell the user: "No data found at `data/$ARGUMENTS/`. Populate the Drive folder for this ticker and re-run." Do not proceed to any later step.

## 3. Create the run output folder

```
mkdir -p analyses/$ARGUMENTS_<DATE>/business-model
```

This is the single output folder for this run. Every agent in this module writes into it.

## 4. Discover agents

Use the Glob tool with pattern `.claude/agents/business-model/[0-9][0-9]_*.md` to list every agent file in this module.

For each matched file:

1. Parse the basename to extract:
   - `<NN>` — the two-digit prefix (e.g. `00`, `07`, `99`)
   - `<name>` — the slug between `<NN>_` and `.md` (e.g. `data-triage`, `moat`)
2. Read the file's YAML frontmatter (the block between the first two `---` lines) and extract:
   - `name` — the agent's invocation name (used as `subagent_type` for Task)
   - `layer` — integer layer number; if missing, treat as `999` and warn
   - `fail_fast` — boolean; default `false` if absent

Keep a list of discovered agents with: file path, `<NN>`, `<name>`, `name`, `layer`, `fail_fast`.

If the glob returns zero matches, STOP and tell the user: "No business-model agents found at `.claude/agents/business-model/[0-9][0-9]_*.md`."

## 5. Group agents by layer

Group the discovered agents by their `layer` field. Sort the layer keys ascending (0, 1, 2, …). The synthesizer (`99_business-model-synthesis.md`, `layer: 5`) is treated as the final layer regardless of how many other layers exist — this falls out of ascending sort because it has the highest layer number, but rely on the sort, not on the specific number `5`.

## 6. Execute layers in order

For each layer, in ascending order:

1. For every agent in that layer, dispatch a Task tool call with:
   - `subagent_type: "<name>"` (the value from the frontmatter)
   - User message (substitute `$ARGUMENTS`, `<DATE>`, `<NN>`, `<name>` literally):

     > Analyze ticker $ARGUMENTS. Data pool path: data/$ARGUMENTS/. Output path: analyses/$ARGUMENTS_<DATE>/business-model/<NN>_<name>.md. Today's date: <DATE>. Follow your system prompt and write your output to the specified path.

   Issue every Task call for the layer in a single message so they run concurrently. Wait for all of them to return before moving on.

2. After the layer's agents have returned, check fail-fast. For any agent in this layer with `fail_fast: true`:
   - Read its output file `analyses/$ARGUMENTS_<DATE>/business-model/<NN>_<name>.md`.
   - If the file contents contain the string `"Verdict: Insufficient data"` (case-insensitive match), ABORT the entire run. Do not dispatch any later layer. Report to the user which agent triggered the abort, the path of its output file, and that no synthesizer ran.

3. Track which agents in the layer succeeded and which failed. An agent failed if either (a) its Task call returned an error, or (b) the expected output file does not exist after it returns.

4. Move on to the next layer only after all of the current layer's agents have returned.

## 7. Commit and push to main

Per repo `CLAUDE.md` git policy, commit straight to `main` — no branches, no PRs.

```
git add analyses/$ARGUMENTS_<DATE>/business-model/
git commit -m "Business-model run: $ARGUMENTS <DATE>"
git push origin main
```

Capture the commit SHA from `git rev-parse HEAD`.

## 8. Report

Print a final summary to the user containing:

- Number of agents discovered
- Per-layer breakdown: layer number, count, and names of agents that ran in each layer
- Names of any agents that failed (or "none")
- Whether a fail-fast abort was triggered, and by whom (if applicable)
- Full path to the synthesizer's output: `analyses/$ARGUMENTS_<DATE>/business-model/99_business-model-synthesis.md` (or note that it did not run, if aborted)
- The commit SHA pushed to `origin/main`

## Hard rules

- Do not hardcode any agent name in this orchestrator. Every agent invocation, output filename, and layer assignment is derived from the discovered files and their frontmatter.
- Adding a new file like `.claude/agents/business-model/13_supply-chain.md` with `layer: 2` in its frontmatter must require zero changes to this orchestrator — it should automatically be picked up, run in layer 2, and written to `analyses/$ARGUMENTS_<DATE>/business-model/13_supply-chain.md`.
