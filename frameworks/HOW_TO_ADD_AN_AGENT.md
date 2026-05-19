# How to add an agent (or a new module)

Mechanical instructions for wiring a new specialist — or an entirely new module — into the multi-agent research workflow. This file is about file-system mechanics only; what to write inside the prompt body is up to you.

## Architecture recap

Specialists live inside modules. Each module is a folder under `.claude/agents/`:

```
.claude/agents/
├── business-model/
│   ├── 00_data-triage.md
│   ├── 01_disqualifier-scan.md
│   ├── …
│   └── 99_business-model-synthesis.md
├── earnings/
│   ├── 00_earnings-data-triage.md
│   ├── …
│   └── 99_earnings-synthesis.md
└── synthesizer.md          ← master synthesizer (not a module specialist)
```

Two glob patterns drive discovery:

- **Module discovery** (`/research:full`): `.claude/agents/*/99_*-synthesis.md`. A module is "runnable" precisely when it contains a `99_<module>-synthesis.md` agent.
- **Specialist discovery within a module** (the shared pipeline in `frameworks/MODULE_PIPELINE.md`): `.claude/agents/<module>/[0-9][0-9]_*.md`.

Both globs use **underscore** between the two-digit prefix and the slug. Old hyphen-style names (`NN-name.md`) are no longer recognised — anything matching the old pattern at the top level of `.claude/agents/` will be ignored.

---

## Adding a specialist to an existing module

### 1. Pick a path and name

Save the agent at:

```
.claude/agents/<module>/NN_name.md
```

- `<module>` is the folder name of an existing module (e.g. `business-model`, `earnings`).
- `NN` is a two-digit number from `00` to `99`. Pick something that fits the layering of the module — look at the existing files and the `layer:` values in their frontmatter.
- `name` is a kebab-case slug. It becomes the agent's `subagent_type` and the basename of its output file.
- Example: `.claude/agents/business-model/13_supply-chain.md` defines an agent invoked as `supply-chain` (whatever its `name:` frontmatter says) whose output lands at `analyses/<TICKER>_<DATE>/business-model/13_supply-chain.md`.

### 2. Required YAML frontmatter

Every specialist file must begin with frontmatter containing these five fields:

```yaml
---
name: <slug used as subagent_type — typically the same kebab slug as the filename, e.g. supply-chain>
description: <one line describing what this specialist analyzes>
tools: <comma-separated list of tools this agent is allowed to use>
layer: <integer; agents in the same layer run in parallel, ascending layers run sequentially>
fail_fast: <true|false; true means: if this agent emits "Verdict: insufficient data", the module aborts>
---
```

Notes:
- `layer: 0` is the typical home for the data-triage / fail-fast gate.
- Set `fail_fast: false` unless you have a specific reason. The data-triage agents are the only `fail_fast: true` cases today.
- The body of the file (everything after the closing `---`) is the agent's system prompt.

### 3. Inputs the pipeline passes at invocation

When the shared pipeline dispatches a specialist, the Task user message contains:

- `ticker` — the stock ticker being analyzed
- `data pool path` — `data/<TICKER>/`
- `date` — today's date in `YYYY-MM-DD` format
- `cross-module context` (optional) — a verbatim sentence the calling orchestrator chose to pass (e.g. `Business-model cross-module path: analyses/<TICKER>_<DATE>/business-model/`). If no upstream-module context applies, this sentence is absent.

Write your prompt body so the agent treats these as inputs it will receive at invocation. Do not hardcode any ticker, date, or path inside the prompt body. The pipeline writes the file to disk after the agent returns its report inline — agents must NOT attempt to write files themselves.

### 4. Activation

Save the file. The next `/research:full <TICKER>` or `/research:<module> <TICKER>` run picks it up via the per-module glob (`.claude/agents/<module>/[0-9][0-9]_*.md`). No registration step, no edits to any orchestrator, no code changes.

### 5. Temporary deactivation

To take an agent out of rotation without deleting it, rename it so it no longer matches `[0-9][0-9]_*.md`. The convention is to prefix with an underscore:

```
.claude/agents/business-model/07_business-quality.md
  → .claude/agents/business-model/_07_business-quality.md
```

The pipeline's glob will skip it. Rename it back to re-enable.

### 6. Permanent removal

Delete the file. Nothing else references it.

---

## Adding a new module

A "new module" is a new folder under `.claude/agents/` that contains its own specialists and its own synthesis agent.

### 1. Create the module folder and specialists

```
.claude/agents/<new-module>/
├── 00_<new-module>-data-triage.md   ← layer: 0, fail_fast: true (recommended)
├── 01_<first-specialist>.md
├── …
├── 99_<new-module>-synthesis.md     ← layer: <highest>, fail_fast: false
└── MODULE_RULES.md                   ← optional but recommended; cross-cutting rules for this module's agents
```

The `99_<new-module>-synthesis.md` file is what makes the module discoverable by `/research:full`. Its `name:` frontmatter is the subagent type the orchestrator will invoke. Its body should read every other specialist's output in the same module folder and produce the consolidated module synthesis.

### 2. Use the existing modules as templates

`.claude/agents/business-model/` and `.claude/agents/earnings/` are working references. Copy the layering pattern (data-triage at layer 0, specialists in middle layers, synthesis at the highest layer) and the frontmatter conventions.

### 3. (Optional) Add a standalone command

If you want to be able to run the module on its own, add a slash command at `.claude/commands/research/<new-module>.md` modelled on `.claude/commands/research/business-model.md` or `.claude/commands/research/earnings.md`. Per the repo convention, the standalone command computes any cross-module context, follows `frameworks/MODULE_PIPELINE.md`, and commits its own output.

Even without a standalone command, the module will still run end-to-end under `/research:full`.

### 4. Module ordering under /research:full

Today the master orchestrator's ordering rule is hardcoded: `business-model` first, then `earnings`, then everything else alphabetical. If your new module needs to run before another module — or read from a module other than `business-model` — update the ordering rule in `.claude/commands/research/full.md` (step 4) and, when the time comes, migrate to the `depends_on:` metadata convention noted in that file's TODO.
