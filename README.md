# Equity Research

A self-discovering multi-agent equity research system. Specialists are organised into modules (`business-model`, `earnings`, `valuation`, `balance-sheet-survival`, `management-governance`, …); each module runs its own layered pipeline; a master synthesizer reconciles everything into a final buy-side thesis.

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
4. For each module **in dependency order** (topologically sorted from each module's `depends_on:` frontmatter; ties broken alphabetically), follows the shared pipeline in `frameworks/MODULE_PIPELINE.md` to discover the module's specialists, dispatch them in parallel by layer, strip confirmation blocks, and write outputs to `analyses/<TICKER>_<DATE>/<module>/`.
5. Per-module fail-fast aborts the module but **not** the whole run; the master synthesizer still runs as long as at least one module completes.
6. Invokes the master synthesizer to produce `analyses/<TICKER>_<DATE>/final_thesis.md`.
7. Commits the run in two commits on `main` and pushes both: a run-artifacts commit containing every file written during the run, then a metadata-backfill commit that writes the run-artifacts commit's SHA into `RUN_METADATA.md`. Per `CLAUDE.md` git policy: main only, no branches, no PRs.

To run only one module: `/research:business-model <TICKER>`, `/research:earnings <TICKER>`, `/research:balance-sheet-survival <TICKER>`, `/research:management-governance <TICKER>`, or `/research:valuation <TICKER>`. The valuation, balance-sheet-survival, and management-governance modules read business-model and earnings outputs as cross-module context, so they run after those under `/research:full`; run them standalone only after the upstream modules have run for the ticker (they will still proceed independently if not).

## Post-run discipline & the decision-ledger feedback loop

Every `/research:full` run emits **two** artifacts: `final_thesis.md` (the human memo) and `decision_record.json` (a machine-readable ledger entry; schema in `frameworks/DECISION_LEDGER.md`). A set of **read-only, append-only** commands then audit, sharpen, and track each decision — grounded in `CLAUDE.md` and `frameworks/DECISION_LEDGER.md`. None of them edit `final_thesis.md`, `decision_record.json`, or module outputs; each appends its own report and commits to `main`.

- `/research:verify-evidence <run|ticker>` — truth audit: every rating-driver number traced to the data pool, the scenario/EV/net-debt math reconciled, and anchors checked for consistency across modules → `verification_report.json`.
- `/research:pre-mortem <run|ticker>` — adversarial red-team (`CLAUDE.md` §8): assume the thesis failed and explain why, steelman the bear case, attack the kill criteria and the claimed edge, check the base rate, recommend a confidence haircut (can only hold or lower conviction) → `pre_mortem.json`.
- `/research:expectations-gap <run|ticker>` — Mauboussin / Marks: what the price implies (consensus + reverse-DCF) vs the engine's view, the gap, and whether a real evidence-backed edge exists (`CLAUDE.md` §7) → `expectations_gap.json`.
- `/research:review-decisions <run|ticker|due|all> [window]` — append-only outcome reviews at 30/90/180/365d that resolve forecasts, classify thesis status, and separate luck from skill → `reviews/<date>_<window>_decision_review.json`.
- `/research:calibrate [scope]` — aggregate the whole ledger: selected-vs-rejected basket spread, hit rate, confidence/probability calibration (Brier), per-module accuracy, and process metrics. Refuses to quote metrics it cannot yet support → `analyses/performance/<date>_*`.
- `/research:eval [run|all]` — deterministic regression harness: assert the schema, contract, and math invariants hold across the committed runs (the fixtures), so a framework/agent/command change cannot silently regress the engine → `analyses/eval/<date>_eval_report.json`.

The phases of the decision-ledger feedback loop and their status are tracked in `frameworks/DECISION_LEDGER.md`.

## Adding agents and modules

- **New specialist in an existing module:** drop `.claude/agents/<module>/NN_name.md` with `name`/`description`/`tools`/`layer`/`fail_fast` frontmatter. The module's pipeline auto-discovers it. See `frameworks/HOW_TO_ADD_AN_AGENT.md`. To deactivate without deleting, rename to `_NN_name.md`.
- **New module:** create `.claude/agents/<module>/` with specialists and a `99_<module>-synthesis.md`. Declare its cross-module reads via `depends_on:` on that synthesis file (e.g. `depends_on: [business-model, earnings]`, or `[]` for a foundational module) — `/research:full` auto-discovers the module via the synthesis-agent glob, topologically sorts it by `depends_on`, and auto-builds its cross-module context. **No orchestrator edit needed.** Optionally add a standalone command at `.claude/commands/research/<module>.md` mirroring the existing module commands.

## Where to put data

Drop source documents under `data/<TICKER>/` in the synced Google Drive folder. The orchestrator reads from there; specialists are passed the data folder path at invocation time.

## Where outputs land

Every run writes to `analyses/<TICKER>_<DATE>/`:

- `RUN_METADATA.md` — run-level metadata
- `<module>/NN_name.md` — each specialist's output, preserving the discovery order
- `<module>/99_<module>-synthesis.md` — each module's synthesis
- `final_thesis.md` — the master synthesizer's final buy-side thesis
- `decision_record.json` — machine-readable decision-ledger entry (schema in `frameworks/DECISION_LEDGER.md`)
- `verification_report.json` / `pre_mortem.json` / `expectations_gap.json` — append-only post-run audit reports (present once those commands have run)
- `reviews/<date>_<window>_decision_review.json` — append-only outcome reviews

Cross-run reports land outside any single run folder: `analyses/performance/<date>_*` (calibration / cohort) and `analyses/eval/<date>_eval_report.json` (regression harness).
