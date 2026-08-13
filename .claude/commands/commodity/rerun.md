---
description: Re-run ONE orb (or a whole module) into an EXISTING commodity run, then re-run everything downstream of it (its module synthesis, every dependent module's synthesis, the terminal commodity-thesis + decision_record) and commit. For folding fresh data/<COMMODITY>/ notes into a finished dossier.
argument-hint: MODULE [AGENT] COMMODITY [RUN_ROOT DECISION_FINGERPRINT [PLAN_PATH PLAN_SHA256 SOURCE_DECISION_FINGERPRINT]]
allowed-tools: Read, Write, Glob, Bash, Task
---

You re-run a target **and the synthesis chain its output flows into**, reusing every other existing output. This is the commodity-swarm analogue of `/research:rerun`. Use it after dropping a new note into `data/<COMMODITY>/` (e.g. a screener→commodity handoff, or a regional-focus note) to fold it into an existing commodity dossier without re-running the whole pipeline or hand-deleting synthesis files.

`$ARGUMENTS` is normally `<MODULE> [<AGENT>] <COMMODITY>`. The cockpit exact-call form appends both the
run and decision identity: `<MODULE> <AGENT> <COMMODITY> <EXACT_RUN_ROOT> <CURRENT_DECISION_FINGERPRINT>`.
An exact single-orb click from a live intake plan appends three more receipt-intent values:
`<PLAN_PATH> <PLAN_SHA256> <SOURCE_DECISION_FINGERPRINT>`. Exact forms always name an agent.
**AGENT is optional only when no exact root is supplied:**
- **2 tokens (`<MODULE> <COMMODITY>`) — whole-module rerun:** re-run ALL of the module's specialists (re-ingesting `data/<COMMODITY>/`), then cascade. This is the common post-note case — a supply/demand or macro note can affect any orb in the module, so refresh them all.
- **3 tokens (`<MODULE> <AGENT> <COMMODITY>`) — single-orb rerun:** re-run just that one orb, then cascade (parity with `/research:rerun`; this is what the cockpit's "Re-run ↻" button on an orb dispatches).

Unlike `/commodity:agent` (one orb, no commit), this **commits once** at the end, because it rewrites the terminal thesis. The commodity graph is flat — three parallel modules (`market-structure`, `supply-demand`, `macro-positioning`) all feed the terminal `commodity-thesis`; there is **no master synthesizer and no run-level memo/audit dossier** (those are research-only). Reuse `frameworks/MODULE_PIPELINE.md` for dispatch, binding `<TICKER>` = `<COMMODITY>` and `<RUN_ROOT>` = `commodity/runs/<COMMODITY>`. Execute every step in order.

---

## 1. Parse arguments

Split `$ARGUMENTS` on whitespace. Then:
- **8 tokens** → exact single-orb + intake receipt intent (the fields above).
- **5 tokens** → exact single-orb without an intake receipt.
- **3 tokens** → `<MODULE>` = first, `<AGENT>` = second, `<COMMODITY>` = third (single-orb mode).
- **2 tokens** → `<MODULE>` = first, `<COMMODITY>` = second, `<AGENT>` = *(none)* (whole-module mode).
- **any other count** → STOP with the form shown in the argument hint. A run root without its exact
  decision fingerprint is malformed.

In either exact form require every fingerprint to match `^sha256:[a-f0-9]{64}$`. In the 8-token form,
execute the deterministic preflight before Step 2 or any paid Task call:

```bash
python3 scripts/intake_execution_receipt.py preflight \
  --swarm commodity --subject "<COMMODITY>" --run-root "<EXACT_RUN_ROOT>" \
  --current-decision-fingerprint "<CURRENT_DECISION_FINGERPRINT>" \
  --plan-path "<PLAN_PATH>" --plan-sha256 "<PLAN_SHA256>" \
  --source-decision-fingerprint "<SOURCE_DECISION_FINGERPRINT>" \
  --module "<MODULE>" --agent "<AGENT>"
```

Only `INTAKE-RECEIPT-PREFLIGHT: OK` passes. On mismatch STOP without writing. Set
`<WRITE_INTAKE_RECEIPT>` true only for that validated 8-token form. Never reproduce the helper's hashes
or containment checks by hand.

Run `date +%Y-%m-%d` via Bash → `<DATE>`.

## 2. Verify the commodity is known

```
grep -n "^## <COMMODITY>\b" frameworks/commodity/COMMODITY_PROFILES.md
```

If there is no `## <COMMODITY>` section AND no `data/<COMMODITY>/` folder, STOP: add a `## <COMMODITY>` section to `frameworks/commodity/COMMODITY_PROFILES.md` first (the agents have no applicable-lens guidance without it).

## 3. Resolve the run root (existing only — never create)

`<RUN_ROOT>` = `commodity/runs/<COMMODITY>` (one stable folder per commodity — NOT date-stamped). If
`<EXACT_RUN_ROOT>` was supplied it must byte-equal this path; the root and decision file must be real
non-symlinks contained directly beneath the declared runs tree, or STOP without writing. Check it exists and has at least one finished module:

```
test -d "commodity/runs/<COMMODITY>" && ls -1 commodity/runs/<COMMODITY>/*/99_*-synthesis.md 2>/dev/null | head -n 1
```

If the folder is missing or has no `*/99_*-synthesis.md`, STOP: "No existing run to re-run for `<COMMODITY>`. Run `/commodity:full <COMMODITY>` first." A re-run mutates the existing run folder; it must not create one.

## 4. Discover modules + the dependency graph (data-driven — no hardcoding)

Glob `.claude/agents/commodity/*/99_*-synthesis.md`. For each, the parent folder name is the module; read its frontmatter `depends_on`. Topologically sort (alphabetical tie-break) — identical to `/commodity:full` step 4. Expect `market-structure`, `supply-demand`, `macro-positioning`, then terminal `commodity-thesis` (which `depends_on` the other three). Do NOT hardcode this list.

## 5. Validate the target and re-run it (re-ingesting the pool)

Confirm `<MODULE>` is one of the discovered modules; else STOP and list them. Then:

**Whole-module mode (no `<AGENT>`):** run the module's specialist pipeline via `frameworks/MODULE_PIPELINE.md` with `<TICKER>` = `<COMMODITY>`, `<MODULE>`, `<RUN_ROOT>` = `commodity/runs/<COMMODITY>`, `<CROSS_MODULE_CONTEXT>` built as in step 6 for THIS module's `depends_on`. **Run Step 1.5 (`extract_pool.py`) unconditionally** when `data/<COMMODITY>/` has files — re-ingesting the pool is the whole point. Do NOT run the module's `99_*-synthesis` here (it heads the cascade in step 6). Persist each specialist to its own output path; instruct agents **not to run git**.

**Single-orb mode (`<AGENT>` given):** glob `.claude/agents/commodity/<MODULE>/[0-9][0-9]_*.md`; select the file whose slug or frontmatter `name` = `<AGENT>` (else STOP and list valid names). Read its `name` (= `subagent_type`), `layer`, `<NN>`, `emits_signal_evidence`, `signal_families`, and `UPSTREAM_INPUTS`. Prerequisite-check each `REQUIRED` upstream against `<RUN_ROOT>` (`test -s`); if any is missing, STOP and say which. If this is the directly-targeted terminal `99`, FIRST run `bash scripts/refresh-swarm-pulse.sh commodity "<COMMODITY>"`, then compile `required_series_coverage.json` at the current UTC cutoff; the synthesis must hash those exact bytes. `PULSE-MISSING` is honest absence. Dispatch ONE Task (the `MODULE_PIPELINE.md` Step 4A template, data pool `data/<COMMODITY>/`, `<DATE>`, cross-module context), persisting the report to `<RUN_ROOT>/<MODULE>/<NN>_<AGENT_SLUG>.md` and, when declared, its sibling `.signals.json`, no confirmation block, **not running git**. Verify both per Step 4B; one recovery attempt if either fails. Note whether `<AGENT>` IS the module synthesis (`<NN>` = `99`) — if so, don't re-run it again in step 6. **If that directly-targeted `99` is the terminal `commodity-thesis-synthesis`, its own workflow just rewrote `<RUN_ROOT>/decision_record.json` even though the Step 6 downstream cascade is empty (nothing depends on the terminal) — record that `decision_record.json` was rewritten this invocation, so Step 6.5's finish-gate still fires (it keys off the record being rewritten, not off the cascade).**

After either mode, run `python3 scripts/commodity_signal_evidence.py "<RUN_ROOT>"`. Unless the terminal
`99` was the direct target (its coverage was frozen immediately before dispatch), also run
`bash scripts/refresh-swarm-pulse.sh commodity "<COMMODITY>"`, then run
`python3 scripts/commodity_profile_coverage.py "<RUN_ROOT>" --decision-time "$(date -u +%Y-%m-%dT%H:%M:%SZ)"`
exactly once for the downstream terminal to consume. Stop before the cascade on either compiler failure.
Never regenerate coverage after terminal synthesis; its decision record hashes those exact bytes.

## 6. Compute the downstream cascade and re-run each synthesis (data-driven)

Build `<CASCADE>` from the `depends_on` graph (step 4):
1. If the target is NOT already the module synthesis, start `<CASCADE>` with `<MODULE>` (its own `99` must re-read the refreshed target).
2. Add the **transitive downstream module set**: every module `M` whose `depends_on` (transitively) includes `<MODULE>`. For any of the three parallel modules that tail is exactly `{commodity-thesis}`; for `commodity-thesis` itself it is empty.
3. Order `<CASCADE>` in the topological order from step 4.

For each `<M>` in `<CASCADE>` order, first rerun `python3 scripts/commodity_signal_evidence.py "<RUN_ROOT>"`,
then dispatch ONE Task: `subagent_type` = `<M>`'s `99_*-synthesis` frontmatter `name`; build its
`<CROSS_MODULE_CONTEXT>` from `<M>`'s `depends_on` (one line per dependency whose `99_*-synthesis.md`
exists under `<RUN_ROOT>`); instruct it to read its module folder's specialist outputs under
`<RUN_ROOT>/<M>/` plus the cross-module paths and persist its refreshed synthesis to
`<RUN_ROOT>/<M>/99_<...>-synthesis.md`; **do not run git**. Verify per Step 4B. Then refresh that module's
two other tiers per `MODULE_PIPELINE.md` Step 4.9 (module memo via `module-memo-writer`, module dossier via
the Step 4.9B concatenation) — both best-effort, never abort.

**When `<M>` = `commodity-thesis`:** after it returns, confirm BOTH `<RUN_ROOT>/commodity-thesis/99_commodity-thesis-synthesis.md` AND `<RUN_ROOT>/decision_record.json` were rewritten (`test -s`). If `decision_record.json` is missing, STOP before committing and report the failure. Record that `decision_record.json` was rewritten this invocation (Step 6.5 keys off this).

There is no master synthesizer, run-level memo, or audit dossier to regenerate — the terminal `commodity-thesis` IS the deliverable.

## 6.5. Integrity finish-gate — pre-mortem haircut propagation

**Run this step iff `decision_record.json` was rewritten this invocation** — i.e. `commodity-thesis`'s `99` synthesis ran, whether it appeared in the Step 6 cascade (any rerun of a non-terminal module or orb, whose tail is `{commodity-thesis}`) OR it was the direct Step 5 target (`/commodity:rerun commodity-thesis commodity-thesis-synthesis <COMMODITY>`, whose cascade is empty because nothing depends on the terminal — the case Step 5's note flags). Keying off the *record being rewritten*, not off the cascade, is what stops a directly-rerun terminal verdict from shipping un-red-teamed. Under normal rerun semantics some upstream-or-terminal synthesis always re-runs, so this gate essentially always fires; only genuinely skip it if `decision_record.json` was NOT rewritten this invocation.

0. Before red-teaming, run `python3 scripts/commodity_forecast_contract.py "<RUN_ROOT>/decision_record.json"`.
It must verify the frozen coverage digest and every point-in-time resolver. On failure, STOP before
pre-mortem, archive or commit.

A freshly rewritten record is FRESH — a stale, un-red-teamed prior `pre_mortem.json` no longer describes this run's `action`/`confidence`, and the finish-gate's staleness guard (`scripts/commodity_pre_mortem_haircut.py`) will REJECT a prior report whose `original_action`/`original_confidence` no longer match, exiting nonzero rather than mislabeling the new call. Same gate as `commodity:full` step 5.5 (no backfill condition needed — this invocation just rewrote the record, so it is never "already audited"):

1. Before invoking the command below, capture whatever pre-mortem report already exists — a rerun almost always has one from before this cascade: `PRIOR_PM=$(ls -t "<RUN_ROOT>"/pre_mortem*.json 2>/dev/null | head -1)`.
2. Follow `.claude/commands/commodity/pre-mortem.md` against `<RUN_ROOT>` in full — produce ONLY `<RUN_ROOT>/pre_mortem*.json` (versioned `_v2`/`_v3`/… since a prior `pre_mortem.json` from before this re-run already exists; per its rule 1 it can only HOLD or LOWER conviction, never raise it). Skip its own step 7 commit — this command's step 7 below commits the whole run folder in one place.
3. **Haircut propagation** — patch `decision_record.json` with the pre-mortem's verdict via the shared, tested helper (identical to `commodity:full` step 5.5, and mirrors research/full.md 10B.2's F28/F28b). Pass `--prior` whenever step 1 found an existing report — this is the case where a rerun's own re-generation step could silently fail to write the new `_vN` file, leaving the OLD report still on disk with `action`/`confidence` values that happen to still match (nothing about the call changed); value-matching alone would then wrongly look like a fresh, clean pass. `--prior` proves step 2 actually produced something new rather than reusing that stale file:

```bash
python3 scripts/commodity_pre_mortem_haircut.py "<RUN_ROOT>" ${PRIOR_PM:+--prior "$PRIOR_PM"}
```

The helper **fails closed**: it exits `0` and prints `RATING-CAP:` only when it actually propagated a fresh, complete pre-mortem; on `no_pre_mortem` / `read_error` / `incomplete_pre_mortem` / `stale_pre_mortem` / `no_fresh_pre_mortem` it prints `GATE-FAIL:` and exits **nonzero**, leaving `decision_record.json` unpatched. Because this step just generated a fresh pre-mortem, a nonzero exit means the gate genuinely could not run — **STOP before the step 7 commit and report the `GATE-FAIL:` reason; do not ship a freshly rewritten but un-audited `decision_record.json`.** On success, record the printed `RATING-CAP:` line for step 8 (report).

4. **Immutable publication — after the fresh pre-mortem only.** Run:

```bash
python3 scripts/commodity_decision_archive.py "<RUN_ROOT>"
```

The helper create-only archives the exact reviewed record under
`<RUN_ROOT>/decisions/<DECISION_ID>/decision_record.json`, then atomically replaces the top-level current
projection with the identical record carrying `decision_id`. On `ARCHIVE-FAIL`, STOP before step 7; never
commit a rewritten decision without its immutable snapshot. Capture the `DECISION-ARCHIVE:` line.

## 6.6. Write the one-time intake receipt (only the validated 8-token form)

If `<WRITE_INTAKE_RECEIPT>` is false, skip this step and never infer a receipt. If true, after the
finish-gate and immutable archive succeeded run:

```bash
python3 scripts/intake_execution_receipt.py create \
  --swarm commodity --subject "<COMMODITY>" --run-root "<RUN_ROOT>" \
  --plan-path "<PLAN_PATH>" --plan-sha256 "<PLAN_SHA256>" \
  --source-decision-fingerprint "<SOURCE_DECISION_FINGERPRINT>" \
  --executed-against-decision-fingerprint "<CURRENT_DECISION_FINGERPRINT>" \
  --module "<MODULE>" --agent "<AGENT>"
```

Capture `INTAKE-RECEIPT: <PATH> <ID>` as `<INTAKE_RECEIPT_PATH>` / `<INTAKE_RECEIPT_ID>`. The helper
hashes the archived current decision and creates the receipt exclusively. A nonzero exit must STOP.

## 7. Commit and push to main (one commit)

Commodity run outputs are DATA (CLAUDE.md §25/§28 — the research-data stream). Commit once through the serialized helper (data pathspec only):

```
bash scripts/commit-run.sh "Commodity re-run: <COMMODITY> <MODULE>[/<AGENT>] + downstream <DATE>" -- "commodity/runs/<COMMODITY>/"
```

The same run-root pathspec includes `<INTAKE_RECEIPT_PATH>` when Step 6.6 ran. If `commit-run.sh` fails,
delete only that newly-created uncommitted receipt, report the failure, and STOP, using only:

```bash
python3 scripts/intake_execution_receipt.py cleanup \
  --receipt-path "<INTAKE_RECEIPT_PATH>" --receipt-id "<INTAKE_RECEIPT_ID>"
```

Capture the commit SHA (`git rev-parse HEAD`, or `NOOP=1` if nothing changed).

## 8. Report

Print: the run root; the target (module or module/agent) re-run; the cascade order actually run; which module memos/dossiers refreshed (or "failed", best-effort); the terminal dossier path `commodity/runs/<COMMODITY>/commodity-thesis/99_commodity-thesis-synthesis.md`, its **Action** verdict, and the one-line thesis; confirmation that `decision_record.json` was rewritten; **the integrity finish-gate result (step 6.5)** — the pre-mortem verdict, confidence haircut, and `post_mortem_action` cap; the immutable decision ID + archive path from `DECISION-ARCHIVE:`; the intake receipt path when Step 6.6 ran (otherwise `none`); or, on either gate failure, the reason and that the run HALTED before commit; the commit SHA pushed to `origin/main` (or NOOP).

---

## Hard rules

- Re-run ONLY the target (orb or whole module) and the synthesis chain its output flows into — never sibling modules' specialists whose inputs did not change.
- Never create a new run folder. Never run the full pipeline. Never re-run the whole swarm.
- The seeded note lives in `data/<COMMODITY>/` (the Drive pool, outside git) — the commit covers only `commodity/runs/<COMMODITY>/`.
- Whenever this command rewrites `decision_record.json`, step 6.5 re-red-teams it and then archives that
  exact reviewed record before commit. `commodity:pre-mortem.md` itself stays strictly read-only.
- A validated intake-plan intent writes one content-bound receipt before that same commit; no intent means
  no receipt. Never consume an orb from timestamps, latest-plan lookup, or server-local state.
