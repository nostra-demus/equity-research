---
description: Re-run ONE orb into the latest existing run, then re-run everything downstream of it (its module synthesis, every dependent module's synthesis, then the master thesis + memo + audit dossier) and commit. For refreshing a finished run after new data lands.
argument-hint: MODULE AGENT TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You re-run a single orb **and the synthesis chain its output flows into**, reusing every other existing output. `$ARGUMENTS` is `<MODULE> <AGENT> <TICKER>` (three space-separated tokens).

Use this after dropping new data into `data/<TICKER>/` to refresh one orb and everything downstream of it without re-running the whole pipeline. You re-run ONLY: the selected orb, then its module's `99_*-synthesis.md`, then each downstream module's `99_*-synthesis.md` (every module that transitively `depends_on` the selected orb's module), then the master synthesizer, then the memo and audit dossier. You do **NOT** re-run sibling specialists or downstream modules' specialists — their inputs did not change; only the synthesis that consumes the refreshed upstream is re-run (this matches the data-flow arrows in the cockpit graph).

Unlike `/research:agent` (one orb, no commit), this **commits once** at the end, because it rewrites the run's headline thesis. Execute every step in order.

---

## 1. Parse arguments

Split `$ARGUMENTS` into `<MODULE>`, `<AGENT>`, `<TICKER>`. If fewer than three tokens, STOP and give the form: `/research:rerun <MODULE> <AGENT> <TICKER>`.

Run `date +%Y-%m-%d` via Bash and capture `<DATE>`.

`<MODULE> = master` (with `<AGENT> = synthesizer`) is the special **master target** — the Memo itself. For it, skip steps 5–7 and go straight to step 8.

## 2. Verify the data pool

```
ls -1 data/<TICKER>/ 2>/dev/null | head -n 1
```

If missing or empty, STOP: "No data found at `data/<TICKER>/`. Populate the Drive folder for this ticker and re-run."

## 3. Resolve the run root (latest EXISTING run — never create one)

```
ls -1d analyses/<TICKER>_* 2>/dev/null | sort -r | head -n 1
```

Capture as `<RUN_ROOT>`. If empty, STOP: "No existing run to re-run for `<TICKER>`. Run a module or the full pipeline first (`/research:full <TICKER>`)." A re-run mutates the latest existing run folder; it must not create a new one.

## 4. Identify and classify the target orb

If the master target (step 1), skip to step 8.

Otherwise glob `.claude/agents/<MODULE>/[0-9][0-9]_*.md`. If empty, STOP and list the valid module directories under `.claude/agents/`.

Select the file whose slug (between `NN_` and `.md`) OR frontmatter `name` equals `<AGENT>`. If none match, STOP and list the valid agent names for `<MODULE>`. From it read the frontmatter `name` (= `subagent_type`) and `layer`, parse `<NN>` from the filename, and read the body's `UPSTREAM_INPUTS` block. The target's output path is `<TARGET_OUT>` = `<RUN_ROOT>/<MODULE>/<NN>_<AGENT_SLUG>.md`.

Note whether the target **is the module synthesis** (`<NN>` = `99`). If so, you will re-run it in step 5 and must NOT re-run it again in step 7.

## 5. Re-run the target orb

Confirm `<RUN_ROOT>/<MODULE>/` exists (`mkdir -p` it if not). Prerequisite check: for each `REQUIRED` entry in the target's `UPSTREAM_INPUTS`, resolve its `analyses/{TICKER}_{DATE}/...` path against `<RUN_ROOT>` and `test -s`. If any required upstream is missing, STOP and report which (the upstream layer/module must be run first); do not fabricate.

Build `<CROSS_MODULE_CONTEXT>` exactly as `frameworks/MODULE_PIPELINE.md` Step 4A / `/research:full` step 8A specify: one sentence per `depends_on` module whose `99_*-synthesis.md` exists under `<RUN_ROOT>`, in the form `<Dep> cross-module path: <RUN_ROOT>/<dep>/.` (first letter capitalised). If none, the literal `none`.

**Refresh the deterministic sidecar first (so the dispatched agent doesn't cite stale facts).** A rerun exists to fold in NEW data, and the Step 4A message tells the agent to trust `<RUN_ROOT>/_pool_extracts/ciq_facts.json` as authoritative — but that file was written by the ORIGINAL run and would be stale. Run `frameworks/MODULE_PIPELINE.md` Step 1.5 once now — `python3 .claude/tools/extract_pool.py "data/<TICKER>/" "<RUN_ROOT>/_pool_extracts"` — which re-extracts the pool and regenerates `ciq_facts.json` when the data changed (idempotent: it skips when the manifest is newer than every source, so an unchanged pool costs nothing). Never dispatch the trust-the-sidecar instruction against an unrefreshed sidecar.

Dispatch exactly ONE Task call using the message template in `frameworks/MODULE_PIPELINE.md` Step 4A: `subagent_type` = the target's frontmatter `name`; pass `<TICKER>`, `data/<TICKER>/`, `<DATE>`, and `<CROSS_MODULE_CONTEXT>`; instruct the agent to persist its complete clean report to `<TARGET_OUT>` (Mode A/B/C), starting with its `#` header, no confirmation block, **and not to run git**. Then verify per Step 4B (`test -s`, starts with `#`, not truncated, no stray confirmation block); attempt one recovery if it fails.

## 6. Compute the downstream synthesis cascade (data-driven — no hardcoding)

Discover modules and their `depends_on` exactly as `/research:full` step 4: glob `.claude/agents/*/99_*-synthesis.md`, read each `depends_on` frontmatter, and topologically sort (alphabetical tie-break).

Then build `<CASCADE>` — the ordered list of module syntheses to re-run:

1. If the target is **not** the module synthesis, start `<CASCADE>` with `<MODULE>` (its own `99` must re-read the refreshed target).
2. Compute the **transitive downstream module set**: every module `M` such that `<MODULE>` is in `M`'s `depends_on`, plus every module that depends on one of those, transitively.
3. Append those downstream modules to `<CASCADE>` in the topological order from above.

So for `business-model/segment-map` the cascade is `business-model, earnings, balance-sheet-survival, management-governance, valuation, catalyst` (then master). For a leaf-module orb it is just that module (then master). Keep `<CASCADE>` in this order — each synthesis must run only after the upstream ones it reads have been refreshed.

## 7. Re-run each module synthesis in `<CASCADE>` order

For each `<M>` in `<CASCADE>`, in order:

- Locate `<M>`'s synthesis agent: glob `.claude/agents/<M>/99_*-synthesis.md`, read its frontmatter `name` (= `subagent_type`). Its output path is `<RUN_ROOT>/<M>/99_<...>-synthesis.md`.
- Build `<CROSS_MODULE_CONTEXT>` for `<M>` from its `depends_on` (step 5's rule) — naming every dependency whose `99_*-synthesis.md` exists under `<RUN_ROOT>` (all do, since this is a finished run; their upstream outputs were just refreshed earlier in the cascade).
- Dispatch ONE Task call (same template as step 5): `subagent_type` = the synthesis agent's `name`; instruct it to read its module folder's specialist outputs under `<RUN_ROOT>/<M>/` plus the cross-module paths, and persist its refreshed synthesis to its `99_*` output path; **do not run git**. Verify per Step 4B.
- **Refresh `<M>`'s two other module tiers** so they stay in sync with the refreshed synthesis (these are the module-level equivalent of step 9's run-level memo/dossier, per `frameworks/MODULE_PIPELINE.md` Step 4.9). Both are best-effort — never abort the rerun:
  - **Module memo** — dispatch one Task call: `subagent_type: "module-memo-writer"`, message: `Read <RUN_ROOT>/<M>/99_<...>-synthesis.md and write the module memo to <RUN_ROOT>/<M>/<M>_memo.md. Condense only what the synthesis carries; do not change its verdict, scores, or caps; the saved file starts with its # header and has no confirmation block; do not write any other file and do not run git.` If `<RUN_ROOT>/<M>/<M>_memo.md` is absent afterward, record it as failed but continue.
  - **Module dossier** — run the deterministic module-scoped Bash/Python concatenation from `frameworks/MODULE_PIPELINE.md` Step 4.9B **verbatim**, with `RUN_ROOT="<RUN_ROOT>"` and `MODULE="<M>"`. It is read-only on artifacts, writes only `<M>_dossier.md`, and must never abort the rerun.

You re-run only the `99` synthesis of each cascade module (then refresh that module's memo + dossier tiers) — never its specialists.

## 8. Re-run the master synthesizer

Dispatch a single Task call (per `/research:full` step 10):

- `subagent_type: "synthesizer"`
- > Synthesize the analyses in <RUN_ROOT>/. Output the final thesis to <RUN_ROOT>/final_thesis.md.

Wait for it. Treat as failed if `<RUN_ROOT>/final_thesis.md` does not exist when it returns (if so, STOP before committing and report the failure).

## 9. Regenerate the memo and audit dossier

Only if `<RUN_ROOT>/final_thesis.md` exists. These keep the three tiers in sync with the refreshed thesis (per `/research:full` step 10A):

- **Memo** — dispatch one Task call: `subagent_type: "memo-writer"`, message: `Read <RUN_ROOT>/final_thesis.md and <RUN_ROOT>/decision_record.json and write the ~10-page colleague memo to <RUN_ROOT>/memo.md.` If `memo.md` is absent afterward, record it as failed but do not abort.
- **Audit dossier** — run the deterministic Bash/Python concatenation from `/research:full` step 10A.2 **verbatim**, with `RUN_ROOT="<RUN_ROOT>"`. It is read-only on run artifacts, writes only `audit_dossier.md`, and must never abort the run.

## 9A. Generate deferred module memos (per-module-chain runs only)

Check for the marker file `<RUN_ROOT>/.defer_module_memos` (`test -f`). If it is **absent**, skip this entire step — a normal `/research:rerun` already refreshed each cascade module's memo inline in step 7, and a standalone full run handles its own memos. If it is **present**, a `/research:full` per-module **chain** run deferred its per-module memos so they stayed off the parallel critical path, and you generate them now, after the thesis — they are leaf outputs nothing else reads (the master reads each `99_*-synthesis.md`; every dossier excludes `*_memo.md`), so this is output-neutral.

For **every** module folder `<RUN_ROOT>/<module>/` that has a `99_*-synthesis.md`, dispatch a `module-memo-writer` Task — **regenerate unconditionally**; do NOT skip a module whose `<module>_memo.md` already exists (a re-run into the same dated folder rewrote the synthesis, so a stale memo must be refreshed, not left in place). **Issue all of these calls in a single message so they run concurrently** — they are independent, so batched they cost about one memo's time. Each message is:

> Read `<RUN_ROOT>/<module>/99_<...>-synthesis.md` and write the module memo to `<RUN_ROOT>/<module>/<module>_memo.md`. Condense only what the synthesis already carries — do not add new analysis, numbers, or evidence, and do not change its verdict, scores, or caps. The saved file must start with its `#` header and contain no chat-confirmation block. Do not write any other file and do not run git.

Each is best-effort: a module memo that fails to write is recorded as `failed` but never aborts the rerun (the `99_*-synthesis.md` is the module's decision of record). When done, **leave the `.defer_module_memos` marker in place** — Step 9B (below) reads it, runs the finish-gate, and removes it before the commit. The commit step (10) then commits the whole run folder including these newly generated memos, but never the marker.

## 9B. Full-run finish-gate + RUN_METADATA (per-module-chain runs only)

Check for the marker file `<RUN_ROOT>/.defer_module_memos` (`test -f`). If it is **absent**, skip this entire step — a standalone `/research:rerun` stays a single lightweight commit and does NOT re-run the finish-gate. If it is **present**, this master rerun is the **terminal step of a `/research:full` per-module chain**, so the chained full must ship the SAME integrity-gated, eval-complete artifact set as a monolithic `/research:full` run (a chained full is a full run — it must not skip the ship-path integrity checks the monolithic path runs). Do both, then remove the marker:

1. **Backfill `RUN_METADATA.md`** — the per-module chain never ran `/research:full` step 7. If `<RUN_ROOT>/RUN_METADATA.md` is absent, create it with the Write tool (a chain writes each module in its own run, so only the essentials are known here):

```
# Run Metadata

- ticker: <TICKER>
- run_date: <DATE>
- orchestrator: /research:full (per-module chain)
- data_folder: data/<TICKER>/

## Modules completed

<one line per `<RUN_ROOT>/<module>/` that has a non-empty `99_*-synthesis.md`>

## Synthesizer status

completed (master re-run)
```

2. **Integrity finish-gate** — run `/research:full`'s **Step 10B verbatim** against `<RUN_ROOT>` (with `RUN_ROOT="<RUN_ROOT>"`), exactly as Step 9 above reuses `/research:full` step 10A.2: first **10B.1** (the deterministic validator that re-derives the §10 scenario math and the §7/§11/§14 caps and can stamp a PROVISIONAL banner on `final_thesis.md`), then **10B.2** (verify-evidence → `verification_report.json`, pre-mortem → `pre_mortem.json`, and the haircut propagation that patches `decision_record.json`), then **10B.3** (expectations-gap → `expectations_gap.json`, and the independent §7 edge-consistency cross-check against `decision_record.json`'s confidence_score). Produce ONLY the report JSON in each command — skip each command's own commit step; Step 10 below commits the whole run folder in one place. Record the printed `GATE:` / `GATE-VERIFY:` / `GATE-EXPECTATIONS:` lines for the report (Step 11) — a `PROVISIONAL` result is surfaced loudly, never hidden.

Then **delete the marker so it is never committed**: `rm -f "<RUN_ROOT>/.defer_module_memos"`.

## 10. Commit and push to main (one commit)

Per repo `CLAUDE.md` git policy: commit straight to `main`, no branches, no PRs.

Commit through the serialized helper (global git lock so concurrent companies don't collide; commits only this run folder; pushes):

```
bash scripts/commit-run.sh "Re-run: <TICKER> <MODULE>/<AGENT> + downstream <DATE>" -- "<RUN_ROOT>/"
```

Capture the commit SHA (`git rev-parse HEAD`). This is a single commit. A **standalone** `/research:rerun` does not backfill `RUN_METADATA` (Step 9B was skipped); a **per-module-chain** master step backfilled `RUN_METADATA` and ran the finish-gate in Step 9B, so its commit ships the same eval-complete artifact set as a monolithic `/research:full`.

## 11. Report

Print: the resolved `<RUN_ROOT>`; the target orb that was re-run; the ordered cascade of syntheses re-run (and that each cascade module's `<M>_memo.md` + `<M>_dossier.md` tiers were refreshed); whether the master thesis, memo, and audit dossier regenerated; the master thesis's one-line decision/verdict; for a per-module-chain master step, the finish-gate `GATE:` result and whether `RUN_METADATA.md` / `verification_report.json` / `pre_mortem.json` were written (Step 9B); and the commit SHA pushed to `origin/main`.

---

## Hard rules

- Discover everything (agents, layers, `depends_on`, cascade order) from the files and frontmatter — never hardcode module or agent names. The cascade is derived entirely from `depends_on`, exactly like `/research:full`.
- Re-run ONLY the selected orb and the `99` syntheses in the cascade (plus master + tiers). Never re-run sibling specialists or any downstream module's specialists — reuse their existing outputs.
- Re-run the cascade syntheses strictly in topological order so each reads already-refreshed upstream.
- Mutate the latest EXISTING run folder. Never create a new run folder.
- Exactly one commit at the end. The individual agents must not commit.
