# Equity Research

A self-discovering multi-agent equity research system. Each specialist agent analyzes a ticker from one angle; a synthesizer produces the final buy-side thesis.

## Directory layout

- `.claude/agents/` — specialist agent definitions (`NN-name.md`) plus `synthesizer.md`. The orchestrator auto-discovers any file matching `[0-9][0-9]-*.md`.
- `.claude/commands/research/full.md` — the `/research:full` orchestrator slash command.
- `data/` — symlink to a Google Drive folder. Source documents (filings, transcripts, models, notes) live under `data/<TICKER>/`. Not committed.
- `analyses/` — one folder per run: `analyses/<TICKER>_<YYYY-MM-DD>/` containing each specialist's output and the synthesizer's `final_thesis.md`.
- `frameworks/` — reusable process docs (e.g. `HOW_TO_ADD_AN_AGENT.md`).
- `watchlist/`, `positions/` — manual notes, separate from automated runs.
- `CLAUDE.md` — cross-cutting investing standards every agent must follow.

## Running a research workflow

```
/research:full <TICKER>
```

The orchestrator:
1. Verifies `data/<TICKER>/` exists and has files.
2. Creates `analyses/<TICKER>_<DATE>/`.
3. Globs `.claude/agents/[0-9][0-9]-*.md`, dispatches each as a parallel sub-agent.
4. Runs the `synthesizer` agent over their outputs.
5. Commits everything on `claude/research-<TICKER>-<DATE>` and opens a PR to `main`.

## Adding agents

See `frameworks/HOW_TO_ADD_AN_AGENT.md`. TL;DR: drop a file at `.claude/agents/NN-name.md` with `name`/`description`/`tools` frontmatter — no other registration. To deactivate without deleting, rename to `_NN-name.md`.

## Where to put data

Drop source documents under `data/<TICKER>/` in the synced Google Drive folder. The orchestrator reads from there; specialists are passed the data folder path at invocation time.

## Where outputs land

Every run writes to `analyses/<TICKER>_<DATE>/`. Specialist files are named `NN_name.md` (preserving the discovery order); the synthesized thesis is `final_thesis.md`.
