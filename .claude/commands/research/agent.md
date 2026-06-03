---
description: Run a SINGLE specialist agent of one module on a ticker, into the latest/active run folder. Self-discovers the agent from .claude/agents/<MODULE>/. Checks prerequisites; does NOT commit.
argument-hint: MODULE AGENT TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You run exactly ONE specialist agent — for iterative work and for the cockpit UI's single-agent launches. `$ARGUMENTS` is `<MODULE> <AGENT> <TICKER>` (three space-separated tokens).

This is NOT a module or full-pipeline run. It dispatches one agent into an existing (or freshly created) run folder and does not commit. To run a whole module use `/research:<module> <TICKER>`; for everything use `/research:full <TICKER>`.

Execute the steps below in order. Do not skip any.

---

## 1. Parse arguments

Split `$ARGUMENTS` into `<MODULE>`, `<AGENT>`, `<TICKER>` (in that order). If fewer than three tokens are present, STOP and tell the user the required form: `/research:agent <MODULE> <AGENT> <TICKER>`.

Run `date +%Y-%m-%d` via Bash and capture `<DATE>`.

## 2. Verify the data pool

```
ls -1 data/<TICKER>/ 2>/dev/null | head -n 1
```

If the directory is missing or empty, STOP. Tell the user: "No data found at `data/<TICKER>/`. Populate the Drive folder for this ticker and re-run."

## 3. Discover the agent file

Glob `.claude/agents/<MODULE>/[0-9][0-9]_*.md`. If the glob returns nothing, STOP and report that `<MODULE>` is not a valid module (list the module directories under `.claude/agents/`).

Select the one file whose slug (the part between `NN_` and `.md`) OR whose frontmatter `name` equals `<AGENT>`. If none match, STOP and report the valid agent names for `<MODULE>` (their frontmatter `name` values).

From the matched file read the frontmatter `name` (= the `subagent_type`) and `layer`, and parse `<NN>` from the filename. Read the agent body's `UPSTREAM_INPUTS` block.

## 4. Resolve the run root

- If `analyses/<TICKER>_<DATE>/` already exists, use it as `<RUN_ROOT>` (today's active run).
- Else resolve the LATEST prior run: `ls -1d analyses/<TICKER>_* 2>/dev/null | sort -r | head -n1`. If one exists, use it as `<RUN_ROOT>`.
- Else `mkdir -p "analyses/<TICKER>_<DATE>"` and use that.

Set `<MODULE_DIR>` = `<RUN_ROOT>/<MODULE>` and `mkdir -p "<MODULE_DIR>"`. The agent's output path is `<OUTPUT_PATH>` = `<MODULE_DIR>/<NN>_<AGENT_SLUG>.md`.

## 5. Prerequisite check (do not fabricate upstream)

For each entry in the agent's `UPSTREAM_INPUTS` marked `REQUIRED`, resolve its `analyses/{TICKER}_{DATE}/...` path against `<RUN_ROOT>` (substituting the real run root). Check each with `test -s`.

- If ALL required upstream files exist, proceed.
- If ANY required upstream file is missing, STOP by default. Report exactly which prerequisite is missing and that the caller should run the upstream layer/module first (e.g. `/research:<module> <TICKER>`). Do not invent upstream content. (The agent's own `DEPENDENCIES` note describes its degraded-mode header; only proceed in degraded mode if the user explicitly asks.)

State the prerequisite-satisfied status in your final report either way.

## 6. Build cross-module context

Construct `<CROSS_MODULE_CONTEXT>` exactly as `frameworks/MODULE_PIPELINE.md` Step 4A / `/research:full` step 8A specify: one sentence per upstream module folder that exists under `<RUN_ROOT>`, in the form `<Dep> cross-module path: <RUN_ROOT>/<dep>/.` (capitalize the dependency's first letter — e.g. `Business-model cross-module path: …`, `Earnings cross-module path: …`). If none apply, set it to the literal string `none`.

## 7. Dispatch the single agent

Issue exactly ONE Task call using the EXACT message template from `frameworks/MODULE_PIPELINE.md` Step 4A:

- `subagent_type` = the agent's frontmatter `name`
- Pass `<TICKER>`, `data/<TICKER>/`, `<DATE>`, and `<CROSS_MODULE_CONTEXT>` (verbatim, unless `none`), and instruct the agent to persist its complete clean report to `<OUTPUT_PATH>` via Mode A (`Write`) / Mode B (`Bash` heredoc) / Mode C (inline fallback). The saved file must contain ONLY the report, starting with its top-level `#` header — no chat-confirmation block. Tell the agent explicitly: **do not run git or commit anything.**

## 8. Verify the output file

Per `frameworks/MODULE_PIPELINE.md` Step 4B: confirm `test -s "<OUTPUT_PATH>"`, that it starts with a `#` header, that it is not truncated, and that it has no stray confirmation block. If verification fails, attempt one recovery (ask the agent to re-persist a clean file, or write its inline return as Mode C).

## 9. Report — do NOT commit

Single-agent runs are iterative; committing one file per agent would spam `main`. Do NOT run git. Print a final summary:

- The resolved `<RUN_ROOT>` and `<OUTPUT_PATH>`
- Whether prerequisites were satisfied (and which were missing, if any)
- The agent's one-line Verdict (from its report)

---

## Hard rules

- Do not hardcode agent names or layers — everything is discovered from the file and its frontmatter, exactly like `frameworks/MODULE_PIPELINE.md`.
- Write only `<OUTPUT_PATH>`. Do not modify sibling files or any other module's folder.
- Do not commit or push. The cockpit and the user own when a single-agent output gets committed.
