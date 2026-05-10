# How to add an agent

Mechanical instructions for wiring a new specialist into the multi-agent research workflow. This file is about file-system mechanics only — what to write inside the prompt body is up to you.

## File location and naming

Save the agent at:

```
.claude/agents/NN-name.md
```

- `NN` is a two-digit number from `01` to `99`.
- `name` is a kebab-case slug. It becomes the agent's invocation name.
- Example: `.claude/agents/03-valuation.md` defines an agent invoked as `valuation`.

The orchestrator discovers specialists with the glob `.claude/agents/[0-9][0-9]-*.md`. Files that don't match (no two-digit prefix, or prefixed with anything else such as `_`) are ignored.

## Ordering

The `NN` prefix controls the alphabetical ordering of output files inside each run folder. Gaps are fine — `01`, `03`, `07` is a valid set. Pick numbers that leave room to insert agents later.

The synthesizer (`.claude/agents/synthesizer.md`) is invoked separately by the orchestrator after all numbered specialists complete. It does not need an `NN` prefix and must not have one.

## Required YAML frontmatter

Every agent file must begin with frontmatter containing these three fields:

```yaml
---
name: <slug matching the filename, e.g. valuation>
description: <one line describing what this specialist analyzes and when it runs>
tools: <comma-separated list of tools this agent is allowed to use>
---
```

The body of the file (everything after the closing `---`) is the agent's system prompt.

## Inputs the orchestrator passes at invocation time

When the orchestrator dispatches a specialist, it sends a user message containing four runtime values:

- `ticker` — the stock ticker being analyzed
- `data folder path` — absolute or repo-relative path to the data pool for this ticker (e.g. `data/<TICKER>/`)
- `output path` — exact path the agent must write its markdown output to (e.g. `analyses/<TICKER>_<DATE>/NN_name.md`)
- `date` — today's date in `YYYY-MM-DD` format

Write your prompt body so the agent treats these as inputs it will receive at invocation. Do not hardcode any ticker, date, or path inside the prompt body.

## Activation

To activate a new agent: save the file at `.claude/agents/NN-name.md` with the required frontmatter. No registration step, no edits to the orchestrator, no code changes. The orchestrator's glob picks it up on the next `/research:full` run.

## Temporary deactivation

To take an agent out of rotation without deleting it, rename it so it no longer matches `[0-9][0-9]-*.md`. The convention is to prefix with an underscore:

```
.claude/agents/07-macro.md   →   .claude/agents/_07-macro.md
```

The orchestrator's glob will skip it. Rename it back to re-enable.

## Permanent removal

Delete the file. Nothing else references it.
