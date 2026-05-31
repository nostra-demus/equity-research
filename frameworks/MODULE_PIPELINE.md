# MODULE_PIPELINE.md — Shared per-module pipeline for research orchestrators

This document defines the **inline pipeline** that every research module follows when invoked by an orchestrator (`/research:full`, `/research:business-model`, `/research:earnings`, and any future module orchestrators).

It exists to keep one source of truth for the per-module discovery → dispatch → strip → write → fail-fast loop, so that adding a new module or changing the loop logic does not require synchronised edits across three or more command files.

**Who reads this:** the orchestrator command files cite this document. Agents themselves never read it.

---

## Inputs to the pipeline

A calling orchestrator that follows this document must have these values resolved *before* entering the pipeline:

- `<TICKER>` — the ticker argument
- `<DATE>` — `YYYY-MM-DD`, captured from `date +%Y-%m-%d`
- `<MODULE>` — the module name (e.g. `business-model`, `earnings`). Used as a directory name under `.claude/agents/` and as the subfolder name under `analyses/<TICKER>_<DATE>/`.
- `<RUN_ROOT>` — `analyses/<TICKER>_<DATE>` (the top-level run folder; same for every module in the run).
- `<CROSS_MODULE_CONTEXT>` — a string the orchestrator will paste verbatim into every agent's Task message. Use this to surface paths of *already-completed* upstream modules in the same run (e.g. business-model path when running earnings). If no cross-module data applies, set this to the literal string `none`.

The pipeline returns a structured status the orchestrator can act on:
- `agents_run` — list of agent names successfully dispatched and saved
- `agents_failed` — list of agent names where Task call errored or returned no usable content
- `fail_fast_triggered` — boolean, plus the agent name and output-file path if true

---

## Step 1 — Create the module output folder

```
mkdir -p <RUN_ROOT>/<MODULE>
```

This is the only folder this module writes to.

---

## Step 2 — Discover agents

Use the Glob tool with pattern `.claude/agents/<MODULE>/[0-9][0-9]_*.md`.

For each matched file:

1. Parse the basename to extract:
   - `<NN>` — the two-digit prefix (e.g. `00`, `07`, `99`)
   - `<name>` — the slug between `<NN>_` and `.md` (e.g. `data-triage`, `moat`)
2. Read the file's YAML frontmatter (the block between the first two `---` lines) and extract:
   - `name` — the agent's invocation name (used as `subagent_type` for Task)
   - `layer` — integer layer number; if missing, treat as `999` and warn
   - `fail_fast` — boolean; default `false` if absent

Keep an in-memory list of discovered agents: `{file_path, NN, name, subagent_type, layer, fail_fast}`.

If the glob returns zero matches, STOP this module and report to the caller: "No agents found at `.claude/agents/<MODULE>/[0-9][0-9]_*.md`."

---

## Step 3 — Group agents by layer

Group the discovered agents by their `layer` field. Sort the layer keys ascending (0, 1, 2, …). Each module's `99_*-synthesis.md` typically has the highest layer number and therefore runs last via ascending sort — rely on the sort, not on the specific number.

---

## Step 4 — Execute layers in order

For each layer, in ascending order, perform Step 4A → Step 4B → Step 4C, then advance to the next layer.

### Step 4A — Dispatch agents

For every agent in this layer, dispatch a Task tool call with:

- `subagent_type: "<name>"` (the value from the frontmatter)
- User message — assemble the body based on `<CROSS_MODULE_CONTEXT>`:

  **If `<CROSS_MODULE_CONTEXT>` is the literal string `none`:**

  > Analyze ticker <TICKER>. Data pool path: data/<TICKER>/. Today's date: <DATE>. Follow your system prompt and produce your complete report as your final assistant message, formatted exactly per your REPORT STRUCTURE section. Return the report inline — do not attempt to write any files.

  **Otherwise, paste `<CROSS_MODULE_CONTEXT>` verbatim as its own sentence before the "Follow your system prompt..." sentence:**

  > Analyze ticker <TICKER>. Data pool path: data/<TICKER>/. Today's date: <DATE>. <CROSS_MODULE_CONTEXT>. Follow your system prompt and produce your complete report as your final assistant message, formatted exactly per your REPORT STRUCTURE section. Return the report inline — do not attempt to write any files.

Issue every Task call for the layer in a single message so they run concurrently. Wait for all of them to return before moving on to Step 4B.

> **Note on cross-module context format.** The caller builds the cross-module context string from the module's `depends_on` list (see `/research:full` step 8A): one sentence per dependency that completed in the run, in the form `<Dep> cross-module path: <PATH>.` — the dependency's module name with its first letter capitalized (e.g. `Business-model cross-module path: …`, `Earnings cross-module path: …`). Agents parse the label(s) for the dependencies they read and ignore the rest. The shared pipeline does NOT add a label of its own — it pastes the caller's string verbatim. A new module declares what it reads via `depends_on` on its `99_*-synthesis.md`; its agents look for those deps' labels.

### Step 4B — Capture, strip confirmation block, and write files

The Task framework forces subagents to return their reports as inline chat messages rather than writing files. The orchestrator owns file IO. Each agent's response also ends with a chat-confirmation block (Agent / Output / Verdict / Biggest finding) intended for the orchestrator, not for the saved report — Step 4B strips that block so each saved file ends with the final substantive section of the report (e.g., a `## 5. ...` section), not with the confirmation block. Anything trailing the confirmation block (sources lists, file-path appendices, etc.) is also discarded.

After all of this layer's agents have returned, for each agent:

- Determine the output path: `<RUN_ROOT>/<MODULE>/<NN>_<name>.md`.
- Start from the COMPLETE final assistant message returned by that agent's Task call. Within the report body itself, do not edit, summarize, or reformat — preserve every line of substantive content verbatim.
- Strip the trailing chat-confirmation block, applying these rules in order:
  1. Locate the LAST line in the content matching the regex `^Agent:\s*\S+\s*$` (case-sensitive: literal `Agent:`, optional whitespace, a single non-empty token, optional trailing whitespace, end of line).
  2. If such a line exists, inspect the next 5 lines after it. Confirm the block is a real chat-confirmation block by verifying that those 5 lines contain at least one line matching `^(\*\*)?Output:`, at least one matching `^(\*\*)?Verdict:`, and at least one matching `^(\*\*)?Biggest finding:` (case-sensitive labels, optional `**` markdown-bold prefix, order flexible).
  3. If the `Agent:` line is found AND all three companion-label patterns are present, truncate the content to everything BEFORE the matched `Agent:` line. Then trim the truncated tail: repeatedly drop the last line if it is empty, contains only whitespace, contains only `---`, or is a fence line (only three backticks, optionally surrounded by whitespace). Stop when the last line is none of those.
  4. If no `Agent:` line is found OR the companion-label triple is incomplete, use the content unchanged. Do not error.
- Use the Write tool to save the cleaned content to OUTPUT_PATH. Issue all Write calls for this layer in a single message so they run in parallel.
- After this layer's writes complete, verify each saved file by running this Bash check (substituting the actual path): `tail -20 "<output_path>" | grep -qE '^Agent:[[:space:]]+\S+[[:space:]]*$' && echo "WARN: stray confirmation block in <output_path>" || true`. If WARN fires for any file, re-apply the strip rules to that agent's original returned content and re-Write the file.

Track which agents in the layer succeeded and which failed. An agent failed if either (a) its Task call returned an error, or (b) the agent returned no usable report content (e.g., refusal, empty message).

### Step 4C — Fail-fast post-processing

For any agent in this layer with `fail_fast: true` (today only the per-module data-triage agent in Layer 0):

- Read the file you just wrote at `<RUN_ROOT>/<MODULE>/<NN>_<name>.md`.
- Test for an "insufficient data" verdict with this case-insensitive, markdown-tolerant Bash check (exit 0 = match): `grep -iqE 'verdict[*_:[:space:]]*insufficient[[:space:]]+data' "<RUN_ROOT>/<MODULE>/<NN>_<name>.md"`. The character class `[*_:[:space:]]*` between "verdict" and "insufficient data" tolerates any asterisks, underscores, colons, and whitespace — so `**Verdict:** Insufficient data`, `Verdict: Insufficient data`, `_Verdict_ insufficient data`, and similar all match.
- If the regex matches, the **module aborts**: do not dispatch any later layer for this module. Return control to the caller with `fail_fast_triggered = true`, the agent name, and the output-file path. **It is the caller's responsibility to decide what happens next** (abort the whole run, or continue with other modules).

If no fail-fast trigger fires (or the layer has no fail-fast agents), proceed to the next layer.

---

## Step 5 — Return status to the caller

After all layers complete (or after a fail-fast abort), the pipeline ends. The caller is expected to:

- Inspect the returned status and decide on commits / further dispatch / synthesis.
- Handle any per-module logging, summary reporting, or cross-module path propagation.

This document deliberately says nothing about git, commits, or downstream synthesis — those are the caller's responsibility.

---

## Hard rules (apply regardless of caller)

- Do not hardcode any agent name. Every agent invocation, output filename, and layer assignment is derived from the discovered files and their frontmatter.
- Adding a new file like `.claude/agents/<MODULE>/13_supply-chain.md` with `layer: 2` in its frontmatter must require zero changes to this pipeline — it should automatically be picked up, run in layer 2, and written to `<RUN_ROOT>/<MODULE>/13_supply-chain.md`.
- The pipeline writes files only inside `<RUN_ROOT>/<MODULE>/`. It does not touch other module folders or the run-root itself.
