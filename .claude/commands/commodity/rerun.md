---
description: Re-run ONE orb (or a whole module) into an EXISTING commodity run, then re-run ONLY the downstream synthesis chain the refreshed evidence actually changed (deterministic early cutoff per frameworks/INCREMENTAL_RERUN.md — the terminal commodity-thesis + decision_record are pruned when nothing decision-bearing moved) and commit. For folding fresh data/<COMMODITY>/ notes into a finished dossier.
argument-hint: MODULE [AGENT] COMMODITY
allowed-tools: Read, Write, Glob, Bash, Task
---

You re-run a target **and the synthesis chain its refreshed output actually invalidates**, reusing every other existing output. This is the commodity-swarm analogue of `/research:rerun`, and it binds the same incremental contract — `frameworks/INCREMENTAL_RERUN.md` (early cutoff via `scripts/decision_surface.py`, fail-toward-changed, the rerun manifest) — read it first. Use it after dropping a new note into `data/<COMMODITY>/` (e.g. a screener→commodity handoff, or a regional-focus note) to fold it into an existing commodity dossier without re-running the whole pipeline or hand-deleting synthesis files — and without rewriting the terminal thesis when the note provably changed nothing decision-bearing.

`$ARGUMENTS` is `<MODULE> [<AGENT>] <COMMODITY>` — the last token is always the commodity. **AGENT is optional:**
- **2 tokens (`<MODULE> <COMMODITY>`) — whole-module rerun:** re-run ALL of the module's specialists (re-ingesting `data/<COMMODITY>/`), then cascade. This is the common post-note case — a supply/demand or macro note can affect any orb in the module, so refresh them all.
- **3 tokens (`<MODULE> <AGENT> <COMMODITY>`) — single-orb rerun:** re-run just that one orb, then cascade (parity with `/research:rerun`; this is what the cockpit's "Re-run ↻" button on an orb dispatches).

Unlike `/commodity:agent` (one orb, no commit), this **commits once** at the end, because it rewrites the terminal thesis. The commodity graph is flat — three parallel modules (`market-structure`, `supply-demand`, `macro-positioning`) all feed the terminal `commodity-thesis`; there is **no master synthesizer and no run-level memo/audit dossier** (those are research-only). Reuse `frameworks/MODULE_PIPELINE.md` for dispatch, binding `<TICKER>` = `<COMMODITY>` and `<RUN_ROOT>` = `commodity/runs/<COMMODITY>`. Execute every step in order.

---

## 1. Parse arguments

Split `$ARGUMENTS` on whitespace. The **last** token is `<COMMODITY>` (uppercase it, e.g. `sugar` → `SUGAR`). Then:
- **3 tokens** → `<MODULE>` = first, `<AGENT>` = second (single-orb mode).
- **2 tokens** → `<MODULE>` = first, `<AGENT>` = *(none)* (whole-module mode).
- **fewer than 2** → STOP with the form: `/commodity:rerun <MODULE> [<AGENT>] <COMMODITY>`.

Run `date +%Y-%m-%d` via Bash → `<DATE>`.

## 2. Verify the commodity is known

```
grep -n "^## <COMMODITY>\b" frameworks/commodity/COMMODITY_PROFILES.md
```

If there is no `## <COMMODITY>` section AND no `data/<COMMODITY>/` folder, STOP: add a `## <COMMODITY>` section to `frameworks/commodity/COMMODITY_PROFILES.md` first (the agents have no applicable-lens guidance without it).

## 3. Resolve the run root (existing only — never create)

`<RUN_ROOT>` = `commodity/runs/<COMMODITY>` (one stable folder per commodity — NOT date-stamped). Check it exists and has at least one finished module:

```
test -d "commodity/runs/<COMMODITY>" && ls -1 commodity/runs/<COMMODITY>/*/99_*-synthesis.md 2>/dev/null | head -n 1
```

If the folder is missing or has no `*/99_*-synthesis.md`, STOP: "No existing run to re-run for `<COMMODITY>`. Run `/commodity:full <COMMODITY>` first." A re-run mutates the existing run folder; it must not create one.

## 4. Discover modules + the dependency graph (data-driven — no hardcoding)

Glob `.claude/agents/commodity/*/99_*-synthesis.md`. For each, the parent folder name is the module; read its frontmatter `depends_on`. Topologically sort (alphabetical tie-break) — identical to `/commodity:full` step 4. Expect `market-structure`, `supply-demand`, `macro-positioning`, then terminal `commodity-thesis` (which `depends_on` the other three). Do NOT hardcode this list.

## 5. Validate the target and re-run it (re-ingesting the pool)

Confirm `<MODULE>` is one of the discovered modules; else STOP and list them. Then:

**Snapshot the old outputs first** (`INCREMENTAL_RERUN.md` §3.1): `SNAP_DIR=$(mktemp -d)`; copy every file this step will regenerate — the target orb(s) in single-orb mode, the module's `[0-9][0-9]_*.md` specialists in whole-module mode — into `$SNAP_DIR` when they exist (a missing old output counts as changed; never fabricate a snapshot). Also snapshot each cascade module's `99_*-synthesis.md` before step 6 re-runs it.

**Write the initial rerun manifest** (`INCREMENTAL_RERUN.md` §6): `<RUN_ROOT>/reruns/<DATE>_rerun_manifest.json` (`mkdir -p`; `_v2`, `_v3`… if the basename exists), with `entry_orbs` (the target orb, or every specialist in whole-module mode), every cascade node as `status: "planned"`, and keys in the `<module>/<NN>_<slug>` form. Update it after every stage; the cockpit watches it live.

**Whole-module mode (no `<AGENT>`):** run the module's specialist pipeline via `frameworks/MODULE_PIPELINE.md` with `<TICKER>` = `<COMMODITY>`, `<MODULE>`, `<RUN_ROOT>` = `commodity/runs/<COMMODITY>`, `<CROSS_MODULE_CONTEXT>` built as in step 6 for THIS module's `depends_on`. **Run Step 1.5 (`extract_pool.py`) unconditionally** when `data/<COMMODITY>/` has files — re-ingesting the pool is the whole point. Do NOT run the module's `99_*-synthesis` here (it heads the cascade in step 6). Persist each specialist to its own output path; instruct agents **not to run git**.

**Single-orb mode (`<AGENT>` given):** glob `.claude/agents/commodity/<MODULE>/[0-9][0-9]_*.md`; select the file whose slug or frontmatter `name` = `<AGENT>` (else STOP and list valid names). Read its `name` (= `subagent_type`), `layer`, `<NN>`, and `UPSTREAM_INPUTS`. Prerequisite-check each `REQUIRED` upstream against `<RUN_ROOT>` (`test -s`); if any is missing, STOP and say which. Dispatch ONE Task (the `MODULE_PIPELINE.md` Step 4A template, data pool `data/<COMMODITY>/`, `<DATE>`, cross-module context), persisting ONLY the report to `<RUN_ROOT>/<MODULE>/<NN>_<AGENT_SLUG>.md`, no confirmation block, **not running git**. Verify per Step 4B; one recovery attempt if it fails. Note whether `<AGENT>` IS the module synthesis (`<NN>` = `99`) — if so, don't re-run it again in step 6 (its surface diff below directly decides the module's DIRTY/CLEAN state).

**Per-target change check** (deterministic, zero LLM): for each regenerated file, record in the manifest `output_changed` (`cmp -s` against its snapshot; missing snapshot ⇒ changed) and the `scripts/decision_surface.py diff` reasons/exit code (0 unchanged / 3 changed / 2 error ⇒ changed) as audit evidence.

## 6. Compute the downstream cascade and re-run each synthesis (data-driven)

Build `<CASCADE>` from the `depends_on` graph (step 4):
1. If the target is NOT already the module synthesis, start `<CASCADE>` with `<MODULE>` (its own `99` must re-read the refreshed target).
2. Add the **transitive downstream module set**: every module `M` whose `depends_on` (transitively) includes `<MODULE>`. For any of the three parallel modules that tail is exactly `{commodity-thesis}`; for `commodity-thesis` itself it is empty.
3. Order `<CASCADE>` in the topological order from step 4.

Walk `<CASCADE>` in order **with the `INCREMENTAL_RERUN.md` §3 dirty gate at every step**:

- **The target's own module `99` re-runs iff any of its regenerated inputs changed bytes** (the step-5 `output_changed` checks; a byte-identical regeneration — rare but free to prove — prunes it). When it re-runs: snapshot its old `99` first, dispatch ONE Task (`subagent_type` = `<M>`'s `99_*-synthesis` frontmatter `name`; `<CROSS_MODULE_CONTEXT>` from `<M>`'s `depends_on`, one line per dependency whose `99_*-synthesis.md` exists under `<RUN_ROOT>`; read its module folder's specialist outputs under `<RUN_ROOT>/<M>/` plus the cross-module paths; persist to `<RUN_ROOT>/<M>/99_<...>-synthesis.md`; **do not run git**). Verify per Step 4B (one recovery; a still-failed synthesis marks the node `failed`, counts DIRTY, and STOPS the rerun before the terminal thesis). Then decide the module: `python3 scripts/decision_surface.py diff "$SNAP_DIR/<...>99.md" "<RUN_ROOT>/<M>/99_<...>.md"` — exit 0 ⇒ CLEAN, exit 3 or 2 ⇒ DIRTY (record the reasons in the manifest).
- **Each downstream module re-runs its `99` iff at least one in-cascade dependency resolved DIRTY**; otherwise **prune it** — mark the node `status: "pruned"` with `pruned_because` naming the CLEAN dependencies, and do not dispatch it. For `commodity-thesis` a prune means the dossier's Action verdict and `decision_record.json` are untouched — the honest fast path when the note changed nothing decision-bearing; the manifest is the committed proof.
- **Tier refreshes follow bytes:** after the cascade, refresh module memo + dossier (per `MODULE_PIPELINE.md` Step 4.9, memos batched in one concurrent message) ONLY for modules whose `99_*-synthesis.md` bytes changed — both best-effort, never abort. Then finalise the manifest (`tiers`, `result`, `updated_at`) and write its one-page `.md` twin.

**When `commodity-thesis` re-runs:** after it returns, confirm BOTH `<RUN_ROOT>/commodity-thesis/99_commodity-thesis-synthesis.md` AND `<RUN_ROOT>/decision_record.json` were rewritten (`test -s`). If `decision_record.json` is missing, STOP before committing and report the failure.

There is no master synthesizer, run-level memo, or audit dossier to regenerate — the terminal `commodity-thesis` IS the deliverable.

## 7. Commit and push to main (one commit)

Commodity run outputs are DATA (CLAUDE.md §25/§28 — the research-data stream). Commit once through the serialized helper (data pathspec only):

```
bash scripts/commit-run.sh "Commodity re-run: <COMMODITY> <MODULE>[/<AGENT>] + downstream (<R> re-run, <P> pruned) <DATE>" -- "commodity/runs/<COMMODITY>/"
```

with `<R>` = LLM cascade tasks actually run and `<P>` = pruned nodes. Capture the commit SHA (`git rev-parse HEAD`, or `NOOP=1` if nothing changed). The run-folder pathspec includes `reruns/` — the manifest ships with the run.

## 8. Report

Print: the run root; the target (module or module/agent) re-run and whether it changed (bytes + decision surface, with the diff reasons); the cascade — which syntheses re-ran (DIRTY/CLEAN each) and which were **pruned and why**; which module memos/dossiers refreshed (or "failed", best-effort); the terminal dossier path `commodity/runs/<COMMODITY>/commodity-thesis/99_commodity-thesis-synthesis.md`, its **Action** verdict (unchanged if pruned — say so), and the one-line thesis; whether `decision_record.json` was rewritten or untouched; the manifest path; the commit SHA pushed to `origin/main` (or NOOP).

---

## Hard rules

- Re-run ONLY the target (orb or whole module) and the dirty-fed synthesis chain its output flows into — never sibling modules' specialists whose inputs did not change, and never a downstream synthesis whose refreshed inputs are decision-identical (`frameworks/INCREMENTAL_RERUN.md`).
- Early cutoff is DETERMINISTIC or it does not happen: a prune requires `scripts/decision_surface.py` proof (or byte-identity); a parse failure, missing snapshot, or diff error counts as CHANGED — fail toward blunt. No LLM judgment may prune a node.
- Every pruned node is recorded in the rerun manifest with its reason — nothing is skipped silently; the manifest commits with the run.
- A failed specialist or synthesis stops the rerun BEFORE the terminal thesis — a half-refreshed cascade must never rewrite `decision_record.json`.
- Never create a new run folder. Never run the full pipeline. Never re-run the whole swarm.
- The seeded note lives in `data/<COMMODITY>/` (the Drive pool, outside git) — the commit covers only `commodity/runs/<COMMODITY>/`.
