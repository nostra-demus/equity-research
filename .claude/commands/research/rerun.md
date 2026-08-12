---
description: Re-run ONE orb into the latest existing run, then re-run everything downstream of it (its module synthesis, every dependent module's synthesis, then the master thesis + memo + audit dossier) and commit. For refreshing a finished run after new data lands.
argument-hint: MODULE AGENT TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You re-run a single orb **and the synthesis chain its output flows into**, reusing every other existing output. `$ARGUMENTS` is `<MODULE> <AGENT> <TICKER>` (three space-separated tokens).

Use this after dropping new data into `data/<TICKER>/` to refresh one orb and everything downstream of it without re-running the whole pipeline. You re-run ONLY: the selected orb, then its module's `99_*-synthesis.md`, then each downstream module's `99_*-synthesis.md` (every module that transitively `depends_on` the selected orb's module), then the master synthesizer, then the memo and audit dossier. You do **NOT** re-run sibling specialists or downstream modules' specialists — their inputs did not change; only the synthesis that consumes the refreshed upstream is re-run (this matches the data-flow arrows in the cockpit graph).

Unlike `/research:agent` (one orb, no commit), this **commits once** at the end, because it rewrites the run's headline thesis. Because this rewrites the decision of record, the master synthesizer step always ends with `/research:full`'s deterministic finish-gate (Step 8A) before commit — the same math/cap reconciliation a fresh full run gets, at zero added LLM cost. Execute every step in order.

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

### 3A. Refuse to mutate a sealed Ideas run

Before any extraction, Task call, or write, check for `<RUN_ROOT>/idea_projection_manifest.json` or
`<RUN_ROOT>/idea_admission.json`. If either exists, STOP and report:

> This run is sealed by its ex-ante Ideas projection/admission and cannot be rerun in place. Start a new
> dated `/research:full <TICKER>` run for the new evidence. The old forecast and negative/positive
> admission result must remain byte-stable for honest outcome calibration.

Do not delete the seal, rewrite an audit, refresh the pool extract inside that run, or treat a sealed
`not_applicable`/`not_admitted` result as permission to retry. This guard applies equally to master-only,
module, and specialist reruns. Unsealed legacy/incomplete runs continue through the steps below.

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

**Refresh the deterministic sidecar first — this is the only refresh the master-target path gets.** A `master synthesizer` rerun skips steps 5–7 (step 1 / step 4 jump straight here), so the Step-5 refresh never runs for it; yet the synthesizer now treats `<RUN_ROOT>/_pool_extracts/ciq_facts.json` as authoritative for scorecard and `decision_record` anchors. Without this, a master-only rerun after new data lands would tie the final thesis to the ORIGINAL run's stale CIQ facts. Run `frameworks/MODULE_PIPELINE.md` Step 1.5 once now — `python3 .claude/tools/extract_pool.py "data/<TICKER>/" "<RUN_ROOT>/_pool_extracts"` — which regenerates `ciq_facts.json` when the data changed (idempotent: it skips when the manifest is newer than every source, so on the normal cascade path — where Step 5 already refreshed it — this second call costs nothing).

Dispatch a single Task call (per `/research:full` step 10):

- `subagent_type: "synthesizer"`
- > Synthesize the analyses in <RUN_ROOT>/. Output the final thesis to <RUN_ROOT>/final_thesis.md.

Wait for it. Treat as failed if `<RUN_ROOT>/final_thesis.md` does not exist when it returns (if so, STOP before committing and report the failure).

## 8A. Deterministic finish-gate (ALL master reruns — fix F-RRGATE)

Run this step **unconditionally**, whether or not `.defer_module_memos` is present — for every rerun that rewrites `final_thesis.md` + `decision_record.json`, not only the per-module-chain case Step 9B already covers. Only if `<RUN_ROOT>/final_thesis.md` exists (Step 8 succeeded).

**The gap this closes:** until now, `/research:full` Step 10B's finish-gate (deterministic scenario-math + §7/§11/§14 cap reconciliation, stamping `final_thesis.md` PROVISIONAL on a break) only ran for a fresh full run or the rare per-module-chain path (Step 9B, gated on `.defer_module_memos`). A **standalone** `/research:rerun` — the ordinary way an existing ticker's thesis gets refreshed after new data lands, and the far more common path in practice — skipped it entirely: the rewritten `decision_record.json`/`final_thesis.md` shipped straight to `main` with zero re-validation, relying solely on a human remembering to run `eval.py` afterward. `EMAAR_2026-07-03` (produced by exactly this standalone-rerun path) is a live, currently-committed instance of a rerun that shipped with no finish-gate at all — the whole of Step 10B was skipped, so neither the deterministic math/cap check (10B.1) nor the LLM audits (10B.2) ran; it already fails `eval.py` check O (a Selected/Short-basket decision missing `verification_report.json`/`pre_mortem.json`). Step 8A closes only the **deterministic half** of that hole for every future rerun: it re-derives the math and caps (10B.1) and can stamp `final_thesis.md` PROVISIONAL. It does **not** generate the two missing audit reports — that is 10B.2, still reserved for the per-module-chain path in Step 9B — so it does not retroactively repair EMAAR (a separate data-stream fix per §25/§28). Its point is narrower and unconditional: after this change no routine rerun ships with its scenario-math, §7/§11/§14 caps, or §24 rejector-filter caps unchecked, the way EMAAR's did — the §24 gap (10B.1 originally re-derived only the scenario math and §7/§11/§14 caps, not §24) is closed separately; see `scripts/rating_caps.py`.

Run `/research:full` **Step 10B.1 verbatim** against `<RUN_ROOT>` (deterministic, no LLM, no added cost) — it re-derives the §10 scenario math, the §7/§11/§14 caps, the §24 rejector-filter conviction caps (Filters 1/2/4/5/6, via `scripts/rating_caps.py`), the §13 cross-module forensic-mosaic conviction cap (via `scripts/rating_caps.py`), the Headline Scorecard ↔ decision_record.json reconciliation plus red-flag severity reconciliation (via `scripts/headline_checks.py`), and the §10 scenario-span check, sign-check presence gate, and §10 conjunction-disclosure check (via `scripts/scenario_integrity_checks.py`) straight from `decision_record.json`, `final_thesis.md`, and the module synthesis/specialist files, and idempotently stamps (or clears) a PROVISIONAL banner on `final_thesis.md`. Record the printed `GATE:` line for Step 11.

This step deliberately stops at 10B.1. The LLM audit trio (10B.2 verify-evidence + pre-mortem, 10B.3 expectations-gap) stays reserved for `/research:full` and the per-module-chain path in Step 9B below — forcing three more LLM passes onto every lightweight single-orb rerun is a materially larger cost/latency tradeoff that deserves its own deliberate call, not a bundled default here.

## 9. Regenerate the memo and audit dossier

Only if `<RUN_ROOT>/final_thesis.md` exists. These keep the three tiers in sync with the refreshed thesis (per `/research:full` step 10A):

- **Memo** — dispatch one Task call: `subagent_type: "memo-writer"`, message: `Read <RUN_ROOT>/final_thesis.md and <RUN_ROOT>/decision_record.json and write the ~10-page colleague memo to <RUN_ROOT>/memo.md.` If `memo.md` is absent afterward, record it as failed but do not abort.
- **Audit dossier** — run the deterministic Bash/Python concatenation from `/research:full` step 10A.2 **verbatim**, with `RUN_ROOT="<RUN_ROOT>"`. It is read-only on run artifacts, writes only `audit_dossier.md`, and must never abort the run.

## 9A. Generate deferred module memos (per-module-chain runs only)

Check for the marker file `<RUN_ROOT>/.defer_module_memos` (`test -f`). If it is **absent**, skip this entire step — a normal `/research:rerun` already refreshed each cascade module's memo inline in step 7, and a standalone full run handles its own memos. If it is **present**, a `/research:full` per-module **chain** run deferred its per-module memos so they stayed off the parallel critical path, and you generate them now, after the thesis — they are leaf outputs nothing else reads (the master reads each `99_*-synthesis.md`; every dossier excludes `*_memo.md`), so this is output-neutral.

For **every** module folder `<RUN_ROOT>/<module>/` that has a `99_*-synthesis.md`, dispatch a `module-memo-writer` Task — **regenerate unconditionally**; do NOT skip a module whose `<module>_memo.md` already exists (a re-run into the same dated folder rewrote the synthesis, so a stale memo must be refreshed, not left in place). **Issue all of these calls in a single message so they run concurrently** — they are independent, so batched they cost about one memo's time. Each message is:

> Read `<RUN_ROOT>/<module>/99_<...>-synthesis.md` and write the module memo to `<RUN_ROOT>/<module>/<module>_memo.md`. Condense only what the synthesis already carries — do not add new analysis, numbers, or evidence, and do not change its verdict, scores, or caps. The saved file must start with its `#` header and contain no chat-confirmation block. Do not write any other file and do not run git.

Each is best-effort: a module memo that fails to write is recorded as `failed` but never aborts the rerun (the `99_*-synthesis.md` is the module's decision of record). When done, **leave the `.defer_module_memos` marker in place** — Step 9B (below) reads it, runs the finish-gate, and removes it before the commit. The commit step (10) then commits the whole run folder including these newly generated memos, but never the marker.

## 9B. Full-run LLM audit trio + RUN_METADATA (per-module-chain runs only)

Check for the marker file `<RUN_ROOT>/.defer_module_memos` (`test -f`). If it is **absent**, skip this entire step — a standalone `/research:rerun` already got the deterministic finish-gate unconditionally in Step 8A, stays a single lightweight commit, and does NOT also get the expensive LLM audit trio. If it is **present**, this master rerun is the **terminal step of a `/research:full` per-module chain**, so the chained full must ship the SAME integrity-gated, eval-complete artifact set as a monolithic `/research:full` run (a chained full is a full run — it must not skip the ship-path integrity checks the monolithic path runs). Do both, then remove the marker:

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

2. **Integrity finish-gate (LLM audit trio)** — Step 8A above already ran 10B.1 unconditionally for this rerun, so this step covers only the two LLM audits. Run `/research:full`'s **Step 10B.2 and 10B.3 verbatim** against `<RUN_ROOT>` (with `RUN_ROOT="<RUN_ROOT>"`), exactly as Step 9 above reuses `/research:full` step 10A.2: **10B.2** (verify-evidence → `verification_report.json`, pre-mortem → `pre_mortem.json`, and the haircut propagation that patches `decision_record.json`), then **10B.3** (expectations-gap → `expectations_gap.json`, and the independent §7 edge-consistency cross-check against `decision_record.json`'s confidence_score). Produce ONLY the report JSON in each command — skip each command's own commit step; Step 10 below commits the whole run folder in one place. Record the printed `GATE-VERIFY:` / `GATE-EXPECTATIONS:` lines for the report (Step 11) — a `PROVISIONAL` result is surfaced loudly, never hidden.

Then **delete the marker so it is never committed, and drop any stale failure note** — the run has now completed, so a break-time `RUN_FAILURE.md` (written by the server when an earlier attempt broke) must NOT ride along in this success commit: `rm -f "<RUN_ROOT>/.defer_module_memos" "<RUN_ROOT>/RUN_FAILURE.md"`.

## 10. Commit and push to main (one commit)

Per repo `CLAUDE.md` git policy: commit straight to `main`, no branches, no PRs.

Commit through the serialized helper (global git lock so concurrent companies don't collide; commits only this run folder; pushes):

```
bash scripts/commit-run.sh "Re-run: <TICKER> <MODULE>/<AGENT> + downstream <DATE>" -- "<RUN_ROOT>/"
```

Capture the commit SHA (`git rev-parse HEAD`). This is a single commit. Every rerun — standalone or chained — now carries the Step 8A deterministic finish-gate result. A **standalone** `/research:rerun` does not backfill `RUN_METADATA` and does not get the LLM audit trio (Step 9B was skipped); a **per-module-chain** master step backfilled `RUN_METADATA` and ran the LLM audit trio in Step 9B, so its commit ships the same eval-complete artifact set as a monolithic `/research:full`.

## 11. Report

Print: the resolved `<RUN_ROOT>`; the target orb that was re-run; the ordered cascade of syntheses re-run (and that each cascade module's `<M>_memo.md` + `<M>_dossier.md` tiers were refreshed); whether the master thesis, memo, and audit dossier regenerated; the master thesis's one-line decision/verdict; the Step 8A finish-gate `GATE:` result (every rerun); for a per-module-chain master step, additionally the `GATE-VERIFY:` / `GATE-EXPECTATIONS:` results and whether `RUN_METADATA.md` / `verification_report.json` / `pre_mortem.json` were written (Step 9B); and the commit SHA pushed to `origin/main`.

---

## Hard rules

- Discover everything (agents, layers, `depends_on`, cascade order) from the files and frontmatter — never hardcode module or agent names. The cascade is derived entirely from `depends_on`, exactly like `/research:full`.
- Re-run ONLY the selected orb and the `99` syntheses in the cascade (plus master + tiers). Never re-run sibling specialists or any downstream module's specialists — reuse their existing outputs.
- Re-run the cascade syntheses strictly in topological order so each reads already-refreshed upstream.
- Mutate the latest EXISTING **unsealed** run folder. A projection/admission seal is an absolute stop;
  new evidence then requires a new dated full run.
- Exactly one commit at the end. The individual agents must not commit.
- Step 8A's deterministic finish-gate runs for EVERY rerun, standalone or chained — never skip it just because `.defer_module_memos` is absent. Only the LLM audit trio (verify-evidence + pre-mortem + expectations-gap, Step 9B) stays reserved for the per-module-chain path.
