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
- `.claude/agents/screener/` — the **screener swarm** (a second, nested swarm: idea generation). `SWARM.md` is its manifest (id, cyan color, unit `signal`, run-root template, routing contract, stage source policy); its modules nest one level deeper (`signal-gate/`, `thesis-structure/`, `edge-definition/`, `candidate-surfacing/`), each with the same `NN_*.md` + `99_*-synthesis.md` + `MODULE_RULES.md` convention. Invisible to the research roster (its glob is one-level).
- `.claude/commands/screener/` — `/screener:signal`, `/screener:sweep`, `/screener:handoff`, `/screener:agent`.
- `frameworks/screener/` — `SCREENER_PIPELINE.md` (the screener's adaptation of MODULE_PIPELINE.md) + the JSON Schemas (`intake`, `signal_payload`, `thesis_record`, `candidates`, `board_index`).
- `screener/` — the screener's stores: `runs/<SIG-ID>/` (one folder per signal), `ledger/` (append-only events + locked theses + candidates + handoffs), `inbox/` (sweep results awaiting a human), `board/index.json` (the one machine-readable board state, rebuilt by `scripts/update_board_index.py`). A committed FIXTURE run (`SIG-20260610-a3f2c81d`) is the golden example of every artifact.
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

## The screener swarm (idea generation)

The screener is a SECOND swarm that sits in front of the research swarm: it turns raw market signals (headlines, filings, price moves, human observations) into locked, machine-routable thesis records and shortlists of candidate companies — which a human then sends into `/research:full`.

```
/screener:sweep                       # scan approved sources -> fill the signal Inbox (no analysis spend)
/screener:signal "<headline or URL>"  # run ONE signal through the whole gauntlet
/screener:handoff <THESIS_ID> <TICKER>  # seed data/<TICKER>/ with the locked thesis memo (idempotent)
/screener:agent <module> <agent> <SIG_ID>  # re-run one orb into an existing signal run
```

The pipeline (each stage gated by the SWARM.md routing contract):

1. **signal-gate** — Gate 0 (approved-source firewall, A/B grading, ledger dedup) + the ten-step Phase 0.1 gauntlet (relevance → event types → entities → similarity vs the event ledger → fact delta → confirmation upgrade → pairwise classification → novelty → canonical action → **materiality 0–100**), plus a parallel generic-media check that caps materiality on market-cap roundups, index summaries, gainers/losers lists, and other generic commentary with no quantified, company-specific insight. Routing: PROMOTE ≥ 70 / PARK 40–69 / LOG.
2. **thesis-structure** — Phase 1 M0.1–M0.5: sterile event statement (no causal language) → 2–6 already-occurred, quantified world changes → beneficiary blast-radius map (GICS industries, NO tickers, 4×25 impact matrix → primary/secondary/parked) → horizon + observable expiry → the falsification kill switch.
3. **edge-definition** — M0.6: consensus (sympathetic) → market-implied dashboard → variant perception (numeric departure + evidenced coverage gap) → mispricing reason (3 verifiable facts) → convergence trigger (dated, 4-step mechanism) → **edge score** (0.40/0.30/0.30 blend, formula printed). Routing: < 60 watchlist_no_edge / 60–80 provisional / > 80 full_machine. The record LOCKS here.
4. **candidate-surfacing** — runs only for provisional/full_machine: maps carry-forward industries to listed companies (tickers allowed for the first time), ranks by exposure purity, surfaces the shortlist deck.

A terminal routing (watchlist_*, PARK, LOG) is a valid result, not a failure — the screener is a rejection machine first (`CLAUDE.md` §24). Handoff writes `data/<TICKER>/screener_thesis_<id>.md` (labelled engine-generated, user-note tier) and never auto-launches the research run — the human confirms that spend separately.

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
