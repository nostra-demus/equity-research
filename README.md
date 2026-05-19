# Equity Research

A self-discovering multi-agent equity research system. Specialists are organised into modules (`business-model`, `earnings`, …); each module runs its own layered pipeline; a master synthesizer reconciles everything into a final buy-side thesis.

## Directory layout

- `.claude/agents/<module>/` — specialists for one module (e.g. `business-model/`, `earnings/`). Each module folder also contains a `MODULE_RULES.md` and a `99_*-synthesis.md` (the module's own synthesizer).
- `.claude/agents/synthesizer.md` — master synthesizer. Reads every `99_*-synthesis.md` in the run folder and produces the final thesis.
- `.claude/commands/research/full.md` — the `/research:full` master orchestrator. Auto-discovers modules via `.claude/agents/*/99_*-synthesis.md`.
- `.claude/commands/research/<module>.md` — per-module standalone orchestrator (e.g. `business-model.md`, `earnings.md`). Useful for re-running just one module.
- `frameworks/MODULE_PIPELINE.md` — the shared per-module discovery / dispatch / strip / write / fail-fast loop. Every orchestrator (`full.md`, `business-model.md`, `earnings.md`, …) follows this document so the loop is defined in one place.
- `frameworks/HOW_TO_ADD_AN_AGENT.md` — how to add a new specialist to a module.
- `data/` — symlink to a Google Drive folder. Source documents (filings, transcripts, models, notes) live under `data/<TICKER>/`. Not committed.
- `analyses/<TICKER>_<YYYY-MM-DD>/` — one folder per run. Contains `RUN_METADATA.md`, one subfolder per module with that module's specialist outputs, and the synthesizer's `final_thesis.md`.
- `watchlist/`, `positions/` — manual notes, separate from automated runs.
- `CLAUDE.md` — cross-cutting investing standards and git policy every agent must follow.

## Running a research workflow

```
/research:full <TICKER>
```

The master orchestrator:
1. Verifies `data/<TICKER>/` exists and has files.
2. Creates `analyses/<TICKER>_<DATE>/` and writes `RUN_METADATA.md` (ticker, date, repo SHA, source files, modules planned, prior run).
3. Discovers runnable modules via `Glob .claude/agents/*/99_*-synthesis.md`.
4. For each module (business-model first, then earnings, then others alphabetically), follows the shared pipeline in `frameworks/MODULE_PIPELINE.md` to discover the module's specialists, dispatch them in parallel by layer, strip confirmation blocks, and write outputs to `analyses/<TICKER>_<DATE>/<module>/`.
5. Per-module fail-fast aborts the module but **not** the whole run; the master synthesizer still runs as long as at least one module completes.
6. Invokes the master synthesizer to produce `analyses/<TICKER>_<DATE>/final_thesis.md`.
7. Commits the run in two commits on `main` and pushes both: a run-artifacts commit containing every file written during the run, then a metadata-backfill commit that writes the run-artifacts commit's SHA into `RUN_METADATA.md`. Per `CLAUDE.md` git policy: main only, no branches, no PRs.

To run only one module: `/research:business-model <TICKER>` or `/research:earnings <TICKER>`.

## Adding agents and modules

- **New specialist in an existing module:** drop `.claude/agents/<module>/NN_name.md` with `name`/`description`/`tools`/`layer`/`fail_fast` frontmatter. The module's pipeline auto-discovers it. See `frameworks/HOW_TO_ADD_AN_AGENT.md`. To deactivate without deleting, rename to `_NN_name.md`.
- **New module:** create `.claude/agents/<module>/` with specialists and a `99_<module>-synthesis.md`. `/research:full` will auto-discover the module via the synthesis-agent glob. Optionally add a standalone command at `.claude/commands/research/<module>.md` mirroring the existing module commands.

## Where to put data

Drop source documents under `data/<TICKER>/` in the synced Google Drive folder. The orchestrator reads from there; specialists are passed the data folder path at invocation time.

## Where outputs land

Every run writes to `analyses/<TICKER>_<DATE>/`:

- `RUN_METADATA.md` — run-level metadata
- `<module>/NN_name.md` — each specialist's output, preserving the discovery order
- `<module>/99_<module>-synthesis.md` — each module's synthesis
- `final_thesis.md` — the master synthesizer's final buy-side thesis
