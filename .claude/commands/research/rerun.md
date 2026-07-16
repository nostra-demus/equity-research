---
description: Re-run one or more orbs into the latest existing run, then re-run ONLY the downstream synthesis chain the refreshed evidence actually changed (deterministic early cutoff per frameworks/INCREMENTAL_RERUN.md), in dependency-ordered concurrent waves, and commit. For refreshing a finished run after new data lands.
argument-hint: MODULE AGENT [MODULE AGENT ...] TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You re-run one or more target orbs **and the synthesis chain their refreshed output actually
invalidates**, reusing every other existing output. `$ARGUMENTS` is `<MODULE> <AGENT> [<MODULE>
<AGENT> ...] <TICKER>` — an odd number of space-separated tokens, ≥3: one or more module/agent
pairs followed by the ticker. The legacy 3-token form is the one-pair case.

Use this after dropping new data into `data/<TICKER>/` to refresh the affected orbs and everything
downstream of them without re-running the whole pipeline — and without re-running downstream work
the refresh provably did not change. `frameworks/INCREMENTAL_RERUN.md` is the governing contract
for the early-cutoff, wave-scheduling, and manifest rules used below; read it first and follow it
exactly. You re-run ONLY: the selected orbs (always — a rerun is a deliberate refresh), then each
affected module's `99_*-synthesis.md`, then each downstream module's `99_*-synthesis.md` **whose
in-cascade dependencies actually changed their decision surface**, then (only if any module
resolved DIRTY) the master synthesizer, then the memo and audit tiers of what changed. You do
**NOT** re-run sibling specialists or downstream modules' specialists — their inputs did not
change; and you do NOT re-run a downstream synthesis whose refreshed upstream is decision-identical
to what it already adjudicated (the deterministic proof is `scripts/decision_surface.py`; any parse
doubt counts as changed — fail toward blunt).

Unlike `/research:agent` (one orb, no commit), this **commits once** at the end. When the master
synthesizer re-runs, it rewrites the decision of record, so that path always ends with
`/research:full`'s deterministic finish-gate (Step 8A) before commit — the same math/cap
reconciliation a fresh full run gets, at zero added LLM cost. When the cascade is pruned before the
master, the decision of record is untouched and the commit ships the refreshed orbs + the rerun
manifest that proves why nothing else needed to run. Execute every step in order.

---

## 1. Parse arguments

Split `$ARGUMENTS` into tokens. If the count is even or < 3, STOP and give the form:
`/research:rerun <MODULE> <AGENT> [<MODULE> <AGENT> ...] <TICKER>`. The LAST token is `<TICKER>`;
the preceding tokens pair up as `<ENTRY_PAIRS>` = `[(MODULE, AGENT), ...]` (deduplicate identical
pairs).

Run `date +%Y-%m-%d` via Bash and capture `<DATE>`; also capture `<NOW>` = `date -u +%Y-%m-%dT%H:%M:%SZ`
(refresh `<NOW>` whenever you update the manifest).

`<MODULE> = master` (with `<AGENT> = synthesizer`) is the special **master target** — the Memo
itself. It must be the ONLY pair when present. For it, skip steps 5–7 and go straight to step 8
(the master target always re-runs; pruning never applies to an explicitly requested master).

## 2. Verify the data pool

```
ls -1 data/<TICKER>/ 2>/dev/null | head -n 1
```

If missing or empty, STOP: "No data found at `data/<TICKER>/`. Populate the Drive folder for this
ticker and re-run."

## 3. Resolve the run root (latest EXISTING run — never create one)

```
ls -1d analyses/<TICKER>_* 2>/dev/null | sort -r | head -n 1
```

Capture as `<RUN_ROOT>`. If empty, STOP: "No existing run to re-run for `<TICKER>`. Run a module or
the full pipeline first (`/research:full <TICKER>`)." A re-run mutates the latest existing run
folder; it must not create a new one.

## 4. Identify and classify the target orbs

If the master target (step 1), skip to step 8.

For EACH pair in `<ENTRY_PAIRS>`: glob `.claude/agents/<MODULE>/[0-9][0-9]_*.md`. If empty, STOP
and list the valid module directories under `.claude/agents/`. Select the file whose slug (between
`NN_` and `.md`) OR frontmatter `name` equals `<AGENT>`. If none match, STOP and list the valid
agent names for `<MODULE>`. From it read the frontmatter `name` (= `subagent_type`) and `layer`,
parse `<NN>` from the filename, and read the body's `UPSTREAM_INPUTS` block. The pair's output path
is `<TARGET_OUT>` = `<RUN_ROOT>/<MODULE>/<NN>_<AGENT_SLUG>.md`, and its cascade key is
`<MODULE>/<NN>_<AGENT_SLUG>`.

Note per pair whether the target **is the module synthesis** (`<NN>` = `99`). Such a target is
re-run in step 5 (Wave 0) and must NOT be re-run again in step 7 — its Wave-0 surface diff directly
decides its module's DIRTY/CLEAN state.

## 5. Re-run the target orbs (Wave 0) — snapshot, dispatch concurrently, diff

Confirm each `<RUN_ROOT>/<MODULE>/` exists (`mkdir -p` if not). Prerequisite check per pair: for
each `REQUIRED` entry in the target's `UPSTREAM_INPUTS`, resolve its `analyses/{TICKER}_{DATE}/...`
path against `<RUN_ROOT>` and `test -s`. If any required upstream is missing, STOP and report which
(the upstream layer/module must be run first); do not fabricate.

**Snapshot the old outputs first.** `SNAP_DIR=$(mktemp -d)`; for each pair,
`cp "<TARGET_OUT>" "$SNAP_DIR/<MODULE>__<NN>_<AGENT_SLUG>.md"` when the file exists (a missing old
output means the orb counts as changed — record that; never fabricate a snapshot).

Build `<CROSS_MODULE_CONTEXT>` per target module exactly as `frameworks/MODULE_PIPELINE.md`
Step 4A / `/research:full` step 8A specify: one sentence per `depends_on` module whose
`99_*-synthesis.md` exists under `<RUN_ROOT>`, in the form `<Dep> cross-module path:
<RUN_ROOT>/<dep>/.` (first letter capitalised). If none, the literal `none`.

**Refresh the deterministic sidecar first (so the dispatched agents don't cite stale facts).** A
rerun exists to fold in NEW data, and the Step 4A message tells the agent to trust
`<RUN_ROOT>/_pool_extracts/ciq_facts.json` as authoritative — but that file was written by the
ORIGINAL run and would be stale. Run `frameworks/MODULE_PIPELINE.md` Step 1.5 once now —
`python3 .claude/tools/extract_pool.py "data/<TICKER>/" "<RUN_ROOT>/_pool_extracts"` — which
re-extracts the pool and regenerates `ciq_facts.json` when the data changed (idempotent: it skips
when the manifest is newer than every source, so an unchanged pool costs nothing). Never dispatch
the trust-the-sidecar instruction against an unrefreshed sidecar.

**Write the initial rerun manifest** (schema and rules: `INCREMENTAL_RERUN.md` §6). Path:
`<RUN_ROOT>/reruns/<DATE>_rerun_manifest.json` (`mkdir -p "<RUN_ROOT>/reruns"`; if the basename
exists, suffix `_v2`, `_v3`, … — append-only, like intake plans). Populate `entry_orbs`, and
`nodes` with every cascade node from step 6 as `status: "planned"` (targets `role: "target"`,
syntheses `role: "synthesis"`, master `role: "master"`), keys in the cockpit's
`<module>/<NN>_<slug>` / `master/synthesizer` form. Update this file after every wave (set
`updated_at`); the cockpit watches it live.

**Dispatch ALL entry orbs in a single message** (one Task call per pair — they are independent
files; batched they cost about one orb's time). Each Task uses the message template in
`frameworks/MODULE_PIPELINE.md` Step 4A: `subagent_type` = the target's frontmatter `name`; pass
`<TICKER>`, `data/<TICKER>/`, `<DATE>`, and that module's `<CROSS_MODULE_CONTEXT>`; instruct the
agent to persist its complete clean report to `<TARGET_OUT>` (Mode A/B/C), starting with its `#`
header, no confirmation block, **and not to run git**. Then verify each per Step 4B (`test -s`,
starts with `#`, not truncated, no stray confirmation block); attempt one recovery per orb if it
fails. A target that still fails after recovery: mark its node `failed` in the manifest, treat its
module as DIRTY (fail toward blunt), and STOP after finishing this step's bookkeeping — report per
step 11 without touching the master (a half-refreshed cascade must not rewrite the decision of
record).

**Per-pair change check** (deterministic, zero LLM):
- `output_changed` = NOT `cmp -s "$SNAP_DIR/<...>.md" "<TARGET_OUT>"` (missing snapshot ⇒ `true`).
- Surface evidence for the audit trail:
  `python3 scripts/decision_surface.py diff "$SNAP_DIR/<...>.md" "<TARGET_OUT>"` — record its
  `reasons` and exit code (0 unchanged / 3 changed / 2 error ⇒ treat as changed).
Record both on the node (`status: "done"`, `wave: 0`) in the manifest. For a Wave-0 target that IS
its module's 99: its surface diff verdict directly sets that module DIRTY (changed / error) or
CLEAN (unchanged).

## 6. Compute the downstream cascade (data-driven — no hardcoding)

Discover modules and their `depends_on` exactly as `/research:full` step 4: glob
`.claude/agents/*/99_*-synthesis.md`, read each `depends_on` frontmatter, and topologically sort
(alphabetical tie-break).

Build `<CASCADE>` — the ordered set of module syntheses that MAY need re-running — as the UNION
over all entry pairs (dedup by module, keep topological order):

1. Each entry pair's own module (its `99` must adjudicate the refreshed target), unless the target
   IS the `99` (already run in Wave 0).
2. The **transitive downstream module set**: every module `M` such that some entry module is in
   `M`'s `depends_on`, plus every module that depends on one of those, transitively.

So for `business-model/segment-map` the cascade is `business-model, earnings,
balance-sheet-survival, management-governance, valuation, catalyst` (then master). For a
leaf-module orb it is just that module (then master). Two entry orbs share ONE merged cascade — the
downstream chain, the master, and the commit run once, not per orb.

## 7. Re-run the cascade in dependency-ordered waves with early cutoff

Track two sets: `DECIDED` (modules whose 99 outcome is known this rerun) and `DIRTY` (decided
modules whose decision surface changed). Initialise from Wave 0: every entry module whose target
was a specialist is UNDECIDED (its 99 hasn't run yet) but is **dirty-fed** — its 99 always re-runs
when its target's `output_changed` is true, and is pruned to CLEAN only on byte-identical target
output (`INCREMENTAL_RERUN.md` §3.2); every entry module whose target WAS the 99 is already
DECIDED per its Wave-0 surface diff.

Then loop (wave number `k` = 1, 2, …) until every `<CASCADE>` module is DECIDED:

- **Ready set:** every UNDECIDED cascade module whose in-cascade `depends_on` are all DECIDED
  (dependencies outside `<CASCADE>` were never touched — they impose nothing).
- **Split it:** a ready module re-runs iff it is dirty-fed (contains a changed entry target) or at
  least one of its in-cascade dependencies is in `DIRTY`. Otherwise **prune it**: mark the node
  `status: "pruned"` with `pruned_because` naming the CLEAN dependencies, count the module DECIDED
  + CLEAN, and do NOT dispatch anything for it. A prune requires positive proof — if any
  dependency's diff errored or is missing, that dependency counts as DIRTY (fail toward blunt).
- **Dispatch the re-run half concurrently in a single message** (one Task per module — the ready
  set is dependency-free among itself by construction, so strict topological order is preserved).
  For each module `<M>`: snapshot `cp "<RUN_ROOT>/<M>/99_<...>-synthesis.md" "$SNAP_DIR/..."`;
  locate `<M>`'s synthesis agent (glob `.claude/agents/<M>/99_*-synthesis.md`, frontmatter `name` =
  `subagent_type`); build `<M>`'s `<CROSS_MODULE_CONTEXT>` from its `depends_on` (step 5's rule);
  dispatch ONE Task (same Step 4A template): read its module folder's specialist outputs under
  `<RUN_ROOT>/<M>/` plus the cross-module paths, persist the refreshed synthesis to its `99_*`
  output path, **do not run git**. Verify per Step 4B (one recovery attempt). A synthesis that
  still fails: mark `failed`, treat `<M>` as DIRTY, finish the manifest bookkeeping, and STOP
  before the master (report per step 11).
- **Decide each re-run module:**
  `python3 scripts/decision_surface.py diff "$SNAP_DIR/..." "<RUN_ROOT>/<M>/99_<...>.md"` —
  exit 0 ⇒ DECIDED + CLEAN (`surface_changed: false`); exit 3 ⇒ DECIDED + DIRTY (record
  `reasons`); exit 2 ⇒ DECIDED + DIRTY (`reasons: ["surface diff error — treated as changed"]`).
  Also record `output_changed` (byte compare) — it drives the tier refreshes in step 9.
- **Update the manifest** (`updated_at`, node statuses/waves) after every wave.

Do NOT refresh module memos or dossiers inline here — step 9 batches every tier refresh off the
critical path (`INCREMENTAL_RERUN.md` §5). You re-run only the `99` synthesis of each dirty-fed
cascade module — never its specialists.

## 8. Re-run the master synthesizer — only if something is DIRTY

**Prune check first.** If `DIRTY` is empty after step 7 (every cascade module resolved CLEAN — the
refreshed orbs changed nothing decision-bearing), do NOT run the master: mark the
`master/synthesizer` node `pruned` (`pruned_because: "no module resolved DIRTY — decision of
record untouched"`), set `result.decision_of_record_changed: false`, skip step 8A (there is no
rewritten thesis to gate — `final_thesis.md` and `decision_record.json` are untouched), and go to
step 9. This is the honest fast path: the run's decision of record simply did not change, and the
manifest + refreshed orb outputs are the committed evidence.

Otherwise (any DIRTY module, or the explicit master target from step 1):

**Refresh the deterministic sidecar first — this is the only refresh the master-target path gets.**
A `master synthesizer` rerun skips steps 5–7 (step 1 / step 4 jump straight here), so the Step-5
refresh never runs for it; yet the synthesizer treats `<RUN_ROOT>/_pool_extracts/ciq_facts.json` as
authoritative for scorecard and `decision_record` anchors. Run `frameworks/MODULE_PIPELINE.md`
Step 1.5 once now — `python3 .claude/tools/extract_pool.py "data/<TICKER>/"
"<RUN_ROOT>/_pool_extracts"` (idempotent; on the normal cascade path — where Step 5 already
refreshed it — this second call costs nothing).

Dispatch a single Task call (per `/research:full` step 10):

- `subagent_type: "synthesizer"`
- > Synthesize the analyses in <RUN_ROOT>/. Output the final thesis to <RUN_ROOT>/final_thesis.md.

Wait for it. Treat as failed if `<RUN_ROOT>/final_thesis.md` does not exist when it returns (if so,
STOP before committing and report the failure). Mark the master node `done` and
`result.decision_of_record_changed: true` in the manifest.

## 8A. Deterministic finish-gate (EVERY master re-run — fix F-RRGATE)

Run this step **unconditionally whenever step 8 actually re-ran the master**, whether or not
`.defer_module_memos` is present — for every rerun that rewrites `final_thesis.md` +
`decision_record.json`. (When step 8 PRUNED the master, this step is correctly skipped: the gate
re-derives math and caps from the decision record, and that record was not rewritten — there is
nothing new to gate. The manifest records the prune; nothing is skipped silently.)

**The gap this closes:** the finish-gate (deterministic scenario-math + §7/§11/§14 cap
reconciliation, stamping `final_thesis.md` PROVISIONAL on a break) originally ran only for a fresh
full run or the per-module-chain path — a **standalone** `/research:rerun` (the ordinary way an
existing ticker's thesis gets refreshed, and the far more common path in practice) skipped it
entirely: the rewritten `decision_record.json`/`final_thesis.md` shipped straight to `main` with
zero re-validation. `EMAAR_2026-07-03` (produced by exactly this standalone-rerun path) is a live,
currently-committed instance — it already fails `eval.py` check O. This step closes the
**deterministic half** of that hole for every rerun that rewrites the thesis: it re-derives the
math and caps (10B.1) and can stamp `final_thesis.md` PROVISIONAL. It does **not** generate the
two missing audit reports — that is 10B.2, still reserved for the per-module-chain path in
Step 9B — so it does not retroactively repair EMAAR (a separate data-stream fix per §25/§28).

Run `/research:full` **Step 10B.1 verbatim** against `<RUN_ROOT>` (deterministic, no LLM, no added
cost) — it re-derives the §10 scenario math, the §7/§11/§14 caps, and the §24 rejector-filter
conviction caps (Filters 1/2/4/5/6, via `scripts/rating_caps.py`) straight from
`decision_record.json` and the module synthesis/specialist files, and idempotently stamps (or
clears) a PROVISIONAL banner on `final_thesis.md`. Record the printed `GATE:` line for Step 11.

This step deliberately stops at 10B.1. The LLM audit trio (10B.2 verify-evidence + pre-mortem,
10B.3 expectations-gap) stays reserved for `/research:full` and the per-module-chain path in
Step 9B below — forcing three more LLM passes onto every lightweight rerun is a materially larger
cost/latency tradeoff that deserves its own deliberate call, not a bundled default here.

## 9. Batch the memo and dossier tiers off the critical path

These keep every tier in sync with what actually changed (`INCREMENTAL_RERUN.md` §3.5/§5). A tier
refreshes iff its source's BYTES changed this rerun — a stale memo must never sit beside a
rewritten synthesis, and an untouched synthesis must not have its tiers churned:

- **LLM batch — issue ALL of these Task calls in a single message so they run concurrently**
  (batched they cost about one memo's time, not the sum):
  - one `module-memo-writer` Task per cascade module whose `99_*-synthesis.md` bytes changed
    (`output_changed` from step 7; a pruned module never qualifies): `Read
    <RUN_ROOT>/<M>/99_<...>-synthesis.md and write the module memo to
    <RUN_ROOT>/<M>/<M>_memo.md. Condense only what the synthesis carries; do not change its
    verdict, scores, or caps; the saved file starts with its # header and has no confirmation
    block; do not write any other file and do not run git.`
  - if step 8 re-ran the master: one `memo-writer` Task: `Read <RUN_ROOT>/final_thesis.md and
    <RUN_ROOT>/decision_record.json and write the ~10-page colleague memo to <RUN_ROOT>/memo.md.`
  Each is best-effort: a memo that fails to write is recorded as failed but never aborts the rerun
  (the synthesis / thesis is the decision of record).
- **Deterministic pieces (Bash, zero LLM, run them now — they can overlap the LLM batch):**
  - the module dossier concatenation from `frameworks/MODULE_PIPELINE.md` Step 4.9B **verbatim**
    for each byte-changed cascade module (`RUN_ROOT`, `MODULE` bound accordingly);
  - if step 8 re-ran the master: the audit-dossier concatenation from `/research:full`
    step 10A.2 **verbatim** with `RUN_ROOT="<RUN_ROOT>"`.
  Both are read-only on artifacts, write only their own output file, and must never abort the rerun.
- **Finalise the manifest**: fill `tiers` and `result` (`llm_tasks_run`, `llm_tasks_pruned`,
  `decision_of_record_changed`), set `updated_at`, and write the one-page plain-English `.md` twin
  (same basename) per `INCREMENTAL_RERUN.md` §6 — what re-ran, what was pruned and why (quote the
  diff `reasons`), what the decision of record did.

## 9A. Generate deferred module memos (per-module-chain runs only)

Check for the marker file `<RUN_ROOT>/.defer_module_memos` (`test -f`). If it is **absent**, skip
this entire step — a normal `/research:rerun` already refreshed the changed modules' memos in
step 9, and a standalone full run handles its own memos. If it is **present**, a `/research:full`
per-module **chain** run deferred its per-module memos so they stayed off the parallel critical
path, and you generate them now, after the thesis — they are leaf outputs nothing else reads (the
master reads each `99_*-synthesis.md`; every dossier excludes `*_memo.md`), so this is
output-neutral.

For **every** module folder `<RUN_ROOT>/<module>/` that has a `99_*-synthesis.md`, dispatch a
`module-memo-writer` Task — **regenerate unconditionally**; do NOT skip a module whose
`<module>_memo.md` already exists (a chain run wrote every synthesis fresh in this run, so every
memo must be regenerated — the step-9 bytes-changed rule is for the standalone path, where
untouched syntheses keep their memos). **Issue all of these calls in a single message so they run
concurrently** — they are independent, so batched they cost about one memo's time. Each message is:

> Read `<RUN_ROOT>/<module>/99_<...>-synthesis.md` and write the module memo to
> `<RUN_ROOT>/<module>/<module>_memo.md`. Condense only what the synthesis already carries — do not
> add new analysis, numbers, or evidence, and do not change its verdict, scores, or caps. The saved
> file must start with its `#` header and contain no chat-confirmation block. Do not write any
> other file and do not run git.

Each is best-effort: a module memo that fails to write is recorded as `failed` but never aborts the
rerun (the `99_*-synthesis.md` is the module's decision of record). When done, **leave the
`.defer_module_memos` marker in place** — Step 9B (below) reads it, runs the finish-gate, and
removes it before the commit. The commit step (10) then commits the whole run folder including
these newly generated memos, but never the marker.

## 9B. Full-run LLM audit trio + RUN_METADATA (per-module-chain runs only)

Check for the marker file `<RUN_ROOT>/.defer_module_memos` (`test -f`). If it is **absent**, skip
this entire step — a standalone `/research:rerun` already got the deterministic finish-gate in
Step 8A whenever it rewrote the thesis, stays a single lightweight commit, and does NOT also get
the expensive LLM audit trio. If it is **present**, this master rerun is the **terminal step of a
`/research:full` per-module chain**, so the chained full must ship the SAME integrity-gated,
eval-complete artifact set as a monolithic `/research:full` run (a chained full is a full run — it
must not skip the ship-path integrity checks the monolithic path runs). Do both, then remove the
marker:

1. **Backfill `RUN_METADATA.md`** — the per-module chain never ran `/research:full` step 7. If
`<RUN_ROOT>/RUN_METADATA.md` is absent, create it with the Write tool (a chain writes each module
in its own run, so only the essentials are known here):

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

2. **Integrity finish-gate (LLM audit trio)** — Step 8A above already ran 10B.1 for this rerun, so
this step covers only the two LLM audits. Run `/research:full`'s **Step 10B.2 and 10B.3 verbatim**
against `<RUN_ROOT>` (with `RUN_ROOT="<RUN_ROOT>"`), exactly as Step 9 above reuses
`/research:full` step 10A.2: **10B.2** (verify-evidence → `verification_report.json`, pre-mortem →
`pre_mortem.json`, and the haircut propagation that patches `decision_record.json`), then **10B.3**
(expectations-gap → `expectations_gap.json`, and the independent §7 edge-consistency cross-check
against `decision_record.json`'s confidence_score). Produce ONLY the report JSON in each command —
skip each command's own commit step; Step 10 below commits the whole run folder in one place.
Record the printed `GATE-VERIFY:` / `GATE-EXPECTATIONS:` lines for the report (Step 11) — a
`PROVISIONAL` result is surfaced loudly, never hidden.

Then **delete the marker so it is never committed, and drop any stale failure note** — the run has
now completed, so a break-time `RUN_FAILURE.md` (written by the server when an earlier attempt
broke) must NOT ride along in this success commit:
`rm -f "<RUN_ROOT>/.defer_module_memos" "<RUN_ROOT>/RUN_FAILURE.md"`.

## 10. Commit and push to main (one commit)

Per repo `CLAUDE.md` git policy: commit straight to `main`, no branches, no PRs.

Commit through the serialized helper (global git lock so concurrent companies don't collide;
commits only this run folder — which includes `reruns/` — ; pushes):

```
bash scripts/commit-run.sh "Re-run: <TICKER> <N> orb(s) + downstream (<R> re-run, <P> pruned) <DATE>" -- "<RUN_ROOT>/"
```

with `<N>` = entry orbs, `<R>` = LLM cascade tasks actually run, `<P>` = pruned nodes. Capture the
commit SHA (`git rev-parse HEAD`). This is a single commit. A **standalone** `/research:rerun`
does not backfill `RUN_METADATA` and does not get the LLM audit trio (Step 9B was skipped); a
**per-module-chain** master step backfilled `RUN_METADATA` and ran the LLM audit trio in Step 9B,
so its commit ships the same eval-complete artifact set as a monolithic `/research:full`.

## 11. Report

Print: the resolved `<RUN_ROOT>`; the entry orbs re-run and whether each changed
(bytes + decision surface, with the diff `reasons`); the wave-by-wave cascade — which syntheses
re-ran (DIRTY/CLEAN outcome each) and which were **pruned and why**; whether the master thesis,
memo, and audit dossier regenerated or were pruned; the master thesis's one-line decision/verdict
(unchanged if pruned — say so); the Step 8A finish-gate `GATE:` result (whenever the master
re-ran); for a per-module-chain master step, additionally the `GATE-VERIFY:` /
`GATE-EXPECTATIONS:` results and whether `RUN_METADATA.md` / `verification_report.json` /
`pre_mortem.json` were written (Step 9B); the manifest path; and the commit SHA pushed to
`origin/main`.

---

## Hard rules

- Discover everything (agents, layers, `depends_on`, cascade order) from the files and frontmatter
  — never hardcode module or agent names. The cascade is derived entirely from `depends_on`,
  exactly like `/research:full`.
- Re-run ONLY the selected orbs and the `99` syntheses of dirty-fed cascade modules (plus master +
  tiers when DIRTY). Never re-run sibling specialists or any downstream module's specialists —
  reuse their existing outputs.
- Early cutoff is DETERMINISTIC or it does not happen: a prune requires
  `scripts/decision_surface.py` proof (or byte-identity) on every relevant input; a parse failure,
  a missing snapshot, or a diff error counts as CHANGED (fail toward blunt,
  `frameworks/INCREMENTAL_RERUN.md` §1). No LLM judgment may prune a node.
- Every pruned node is recorded in the rerun manifest with its reason — nothing is skipped
  silently, and the manifest commits with the run (§5 provenance).
- Waves preserve strict topological order: a synthesis is dispatched only after every in-cascade
  dependency is DECIDED, and each wave's dispatches go out in a single message (concurrent Tasks).
- Mutate the latest EXISTING run folder. Never create a new run folder.
- Exactly one commit at the end. The individual agents must not commit.
- Step 8A's deterministic finish-gate runs for EVERY rerun that rewrites the decision of record,
  standalone or chained — never skip it when the master re-ran. A pruned master skips the gate
  precisely because the decision record was not rewritten; the manifest records that. Only the LLM
  audit trio (verify-evidence + pre-mortem + expectations-gap, Step 9B) stays reserved for the
  per-module-chain path.
- A failed target or synthesis stops the rerun BEFORE the master step — a half-refreshed cascade
  must never rewrite the decision of record.
