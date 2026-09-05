---
description: Re-run ONE orb into the latest existing run, then re-run everything downstream of it (its module synthesis, every dependent module's synthesis, then the master thesis + memo + audit dossier) and commit. For refreshing a finished run after new data lands.
argument-hint: MODULE AGENT TICKER [RUN_ROOT DECISION_FINGERPRINT [PLAN_PATH PLAN_SHA256 SOURCE_DECISION_FINGERPRINT]]
allowed-tools: Read, Write, Glob, Bash, Task
---

You re-run a single orb **and the synthesis chain its output flows into**, reusing every other existing output.
`$ARGUMENTS` has one of three exact shapes:

- 3 tokens: `<MODULE> <AGENT> <TICKER>` (ordinary direct CLI rerun; no intake receipt);
- 5 tokens: add `<EXACT_RUN_ROOT> <CURRENT_DECISION_FINGERPRINT>` (cockpit exact-call rerun); or
- 8 tokens: add, after those five, `<PLAN_PATH> <PLAN_SHA256> <SOURCE_DECISION_FINGERPRINT>` (an exact
  single-orb click from a live intake plan; write one one-time-consumption receipt).

The exact forms must never replace the named run with a newer one discovered later.

Use this after dropping new data into `data/<TICKER>/` to refresh one orb and everything downstream of it without re-running the whole pipeline. You re-run ONLY: the selected orb, then its module's `99_*-synthesis.md`, then each downstream module's `99_*-synthesis.md` (every module that transitively `depends_on` the selected orb's module), then the master synthesizer, then the memo and audit dossier. You do **NOT** re-run sibling specialists or downstream modules' specialists — their inputs did not change; only the synthesis that consumes the refreshed upstream is re-run (this matches the data-flow arrows in the cockpit graph).

Unlike `/research:agent` (one orb, no commit), this **commits once** at the end, because it rewrites the run's headline thesis. Because this rewrites the decision of record, the master synthesizer step always ends with `/research:full`'s deterministic finish-gate (Step 8A) before commit — the same math/cap reconciliation a fresh full run gets, at zero added LLM cost. Execute every step in order.

---

## 1. Parse arguments

Split `$ARGUMENTS` using the 3/5/8-token forms above. Any other count must STOP. In either exact form,
require every supplied fingerprint to match `^sha256:[a-f0-9]{64}$`; a run root without its current
fingerprint is malformed. In the 8-token form, execute `frameworks/INTAKE.md` §7's deterministic plan
path/hash/source-fingerprint/orb preflight **before Step 2 or any paid Task call**:

```bash
python3 scripts/intake_execution_receipt.py preflight \
  --swarm research --subject "<TICKER>" --run-root "<EXACT_RUN_ROOT>" \
  --current-decision-fingerprint "<CURRENT_DECISION_FINGERPRINT>" \
  --plan-path "<PLAN_PATH>" --plan-sha256 "<PLAN_SHA256>" \
  --source-decision-fingerprint "<SOURCE_DECISION_FINGERPRINT>" \
  --module "<MODULE>" --agent "<AGENT>"
```

Only `INTAKE-RECEIPT-PREFLIGHT: OK` passes. On mismatch, STOP without writing. Set
`<WRITE_INTAKE_RECEIPT>` true only for that validated 8-token form. Never reproduce the helper's
canonical hashing or containment checks by hand.

When `NOSTRA_CONTINUATION_RUN_ROOT` is set, require it to equal `analyses/<TICKER>_YYYY-MM-DD`, require
that exact path to be a real existing directory (not a symlink), and derive `<DATE>` from its suffix. Do
not call `date` or select a newer run in this mode. Otherwise run `date +%Y-%m-%d` and capture `<DATE>`.

`<MODULE> = master` (with `<AGENT> = synthesizer`) is the special **master target** — the Memo itself. For it, skip steps 5–7 and go straight to step 8.

## 2. Bind and verify the data pool

Treat `data/<TICKER>/` as `<LOGICAL_DATA_PATH>`, the stable citation label. If
`NOSTRA_FROZEN_EVIDENCE_ROOT` is set, require the complete four-variable supervisor binding named in
`frameworks/MODULE_PIPELINE.md` Step 1.5, set the filesystem `<DATA_PATH>` to that immutable evidence
root, and **do not read `data/<TICKER>/` at all**. Otherwise set `<DATA_PATH>` to
`<LOGICAL_DATA_PATH>` for the standalone workflow. Check that the resolved `<DATA_PATH>` exists and
contains at least one non-empty regular file. If not, STOP: "No data found for `<TICKER>`. Populate the
Drive folder for this ticker and re-run."

## 3. Resolve the run root (latest EXISTING run — never create one)

When `NOSTRA_CONTINUATION_RUN_ROOT` is present, use that already-validated path exactly as `<RUN_ROOT>`.
Never fall back to latest, and never require a decision record merely to finish an interrupted unsealed run.
Otherwise, when `<EXACT_RUN_ROOT>` is present, require it to match `analyses/<TICKER>_YYYY-MM-DD`, be a real direct
child directory of `analyses/` (neither it nor its decision file may be a symlink), and carry an object
`decision_record.json`; use it exactly or STOP. Never fall back to latest. Otherwise resolve with:

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

**Refresh or verify the deterministic sidecar first (so the dispatched agent doesn't cite stale facts).**
Run `frameworks/MODULE_PIPELINE.md` Step 1.5 once with the Step-2 `<DATA_PATH>` and the exact extractor
output it resolves. In standalone mode this refreshes changed live data. In frozen Full/Continue mode it
must verify and reuse only `NOSTRA_FROZEN_POOL_GENERATION`; it must never rebuild from or read the live
pool. Never dispatch the trust-the-sidecar instruction against an unverified generation.

Dispatch exactly ONE Task call using the message template in `frameworks/MODULE_PIPELINE.md` Step 4A:
`subagent_type` = the target's frontmatter `name`; pass `<TICKER>`, the resolved `<DATA_PATH>`, `<DATE>`,
and `<CROSS_MODULE_CONTEXT>`; instruct the agent to persist its complete clean report to `<TARGET_OUT>`
(Mode A/B/C), starting with its `#` header, no confirmation block, **and not to run git**. Citations still
use logical `data/<TICKER>/...` labels. Then verify per Step 4B (`test -s`, starts with `#`, not truncated,
no stray confirmation block); attempt one recovery if it fails.

Compile and append the target packet before this Task, then attest its declaration after persistence, using
`frameworks/MEMORY_RUNTIME.md` with key `<MODULE>/<NN>_<AGENT_SLUG>`. Enforced failures stop this rerun.

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
- Compile the synthesis packet before dispatch and attest it after verification using
  `frameworks/MEMORY_RUNTIME.md` and key `<M>/99_<synthesis-slug>`. Enforced failures stop the cascade.
- **Refresh `<M>`'s two other module tiers** so they stay in sync with the refreshed synthesis (these are the module-level equivalent of step 9's run-level memo/dossier, per `frameworks/MODULE_PIPELINE.md` Step 4.9). Both are best-effort — never abort the rerun:
  - **Module memo** — dispatch one Task call: `subagent_type: "module-memo-writer"`, message: `Read <RUN_ROOT>/<M>/99_<...>-synthesis.md and write the module memo to <RUN_ROOT>/<M>/<M>_memo.md. Condense only what the synthesis carries; do not change its verdict, scores, or caps; the saved file starts with its # header and has no confirmation block; do not write any other file and do not run git.` If `<RUN_ROOT>/<M>/<M>_memo.md` is absent afterward, record it as failed but continue.
  - **Module dossier** — run the deterministic module-scoped Bash/Python concatenation from `frameworks/MODULE_PIPELINE.md` Step 4.9B **verbatim**, with `RUN_ROOT="<RUN_ROOT>"` and `MODULE="<M>"`. It is read-only on artifacts, writes only `<M>_dossier.md`, and must never abort the rerun.

You re-run only the `99` synthesis of each cascade module (then refresh that module's memo + dossier tiers) — never its specialists.

## 8. Re-run the master synthesizer

**Refresh or verify the deterministic sidecar first — this is the only such check the master-target path
gets.** A `master synthesizer` rerun skips steps 5–7. Run `frameworks/MODULE_PIPELINE.md` Step 1.5 once
with the Step-2 `<DATA_PATH>` and its exact extractor output. Standalone reruns refresh changed live data;
frozen Full/Continue chains verify and reuse only the admitted generation without reading Drive. On a
normal cascade this is an idempotent second verification.

Before dispatch, build `<MODULE_TERMINAL_OUTCOMES>` from this exact run root. For every discovered module,
record exactly one of:

- `synthesis — <RUN_ROOT>/<module>/99_*-synthesis.md` when the canonical synthesis is non-empty; or
- `fail_fast_insufficient — <RUN_ROOT>/<module>/00_*.md` only when that discovered `00` agent's
  frontmatter declares `fail_fast: true` and the exact non-empty output has one unconflicted canonical
  `Verdict: Insufficient` / `Verdict: Insufficient data` carrier line; or
- `missing` otherwise.

This is terminal outcome typing, not a new completion heuristic. A `fail_fast_insufficient` module is an
intentional completed capped outcome, not a crash and not a synthesis. Never infer it from an arbitrary
`00` file, checklist prose, or a previous run. Append the complete typed roster to the Task message so the
master can distinguish a deliberate data refusal from an interrupted module.

Dispatch a single Task call (per `/research:full` step 10):

- `subagent_type: "synthesizer"`
- > Synthesize the analyses in <RUN_ROOT>/. Output the final thesis to <RUN_ROOT>/final_thesis.md. The
    filesystem evidence root for this invocation is <DATA_PATH>, the verified generation root is
    <GENERATION_ROOT>, and deterministic CIQ facts are at <GENERATION_ROOT>/ciq_facts.json in frozen mode
    (otherwise <RUN_ROOT>/_pool_extracts/ciq_facts.json). Keep citations labelled data/<TICKER>/.... If the
    frozen supervisor quartet is present, require these paths to match it; do not read live data/<TICKER>/
    or any mutable fixed-name projection under <RUN_ROOT>/_pool_extracts/. Module terminal outcomes for
    this exact invocation: <MODULE_TERMINAL_OUTCOMES>.

Before dispatch, compile and append `master/synthesizer` under `frameworks/MEMORY_RUNTIME.md`; after
`final_thesis.md` passes its ordinary existence/output checks, attest the declaration with output
`final_thesis.md`. Enforced failure stops before the finish gate or commit.

Wait for it. Treat as failed if `<RUN_ROOT>/final_thesis.md` does not exist when it returns (if so, STOP before committing and report the failure).

## 8A. Deterministic finish-gate (ALL master reruns — fix F-RRGATE)

Run this step **unconditionally**, whether or not `.defer_module_memos` is present — for every rerun that rewrites `final_thesis.md` + `decision_record.json`, not only the per-module-chain case Step 9B already covers. Only if `<RUN_ROOT>/final_thesis.md` exists (Step 8 succeeded).

**The gap this closes:** until now, `/research:full` Step 10B's finish-gate (deterministic scenario-math + §7/§11/§14 cap reconciliation, stamping `final_thesis.md` PROVISIONAL on a break) only ran for a fresh full run or the rare per-module-chain path (Step 9B, gated on `.defer_module_memos`). A **standalone** `/research:rerun` — the ordinary way an existing ticker's thesis gets refreshed after new data lands, and the far more common path in practice — skipped it entirely: the rewritten `decision_record.json`/`final_thesis.md` shipped straight to `main` with zero re-validation, relying solely on a human remembering to run `eval.py` afterward. `EMAAR_2026-07-03` (produced by exactly this standalone-rerun path) is a live, currently-committed instance of a rerun that shipped with no finish-gate at all — the whole of Step 10B was skipped, so neither the deterministic math/cap check (10B.1) nor the LLM audits (10B.2) ran; it already fails `eval.py` check O (a Selected/Short-basket decision missing `verification_report.json`/`pre_mortem.json`). Step 8A closes only the **deterministic half** of that hole for every future rerun: it re-derives the math and caps (10B.1) and can stamp `final_thesis.md` PROVISIONAL. It does **not** generate the two missing audit reports — that is 10B.2, still reserved for the per-module-chain path in Step 9B — so it does not retroactively repair EMAAR (a separate data-stream fix per §25/§28). Its point is narrower and unconditional: after this change no routine rerun ships with its scenario-math, §7/§11/§14 caps, or §24 rejector-filter caps unchecked, the way EMAAR's did — the §24 gap (10B.1 originally re-derived only the scenario math and §7/§11/§14 caps, not §24) is closed separately; see `scripts/rating_caps.py`.

Run `/research:full` **Steps 10B.1, 10B.1a, and 10B.1b verbatim** against `<RUN_ROOT>` (deterministic, no LLM, no added cost). **10B.1** re-derives the §10 scenario math, the §7/§11/§14 caps, the §24 rejector-filter conviction caps (Filters 1/2/4/5/6, via `scripts/rating_caps.py`), the §13 cross-module forensic-mosaic conviction cap (via `scripts/rating_caps.py`), the §16 Sector Cycle Reality Test compounding cap on the valuation module's own stated confidence score (via `scripts/rating_caps.py`), the §16 Cost-of-Capital Reality Test escalation-branch check on `04_intrinsic-dcf`'s `RF-VAL-003` tag (via `scripts/rating_caps.py`), the Headline Scorecard ↔ decision_record.json reconciliation plus red-flag severity reconciliation (via `scripts/headline_checks.py`), the §10 scenario-span check, sign-check presence gate, and §10 conjunction-disclosure check (via `scripts/scenario_integrity_checks.py`), the §10 HARD GATE 13 probability-basis presence/form check on every probability-bearing `scenarios[]`/`forecast_ledger[]` row (same module), HARD GATE 11's kill-criteria trigger-test schema presence on every `kill_criteria[]` row (same module), and the §8 bear-case / bull-case sanity checks on a Selected/conviction long or Short Candidate's scenario set (checks AM/AR, same module) straight from `decision_record.json`, `final_thesis.md`, and the module synthesis/specialist files, and idempotently stamps (or clears) a PROVISIONAL banner on `final_thesis.md`. **10B.1a** is the single remediation-and-re-gate pass, so a mechanically fixable break gets one fix attempt rather than shipping flagged. **10B.1b** stamps `integrity_gate` into `decision_record.json`, so a flagged rerun cannot be read as a clean call by the ledger, the tracker, or the calibration harness. Record the printed `GATE:` line (post-remediation) for Step 11.

This step deliberately stops at 10B.1. The LLM audit trio (10B.2 verify-evidence + pre-mortem, 10B.3 expectations-gap) stays reserved for `/research:full` and the per-module-chain path in Step 9B below — forcing three more LLM passes onto every lightweight single-orb rerun is a materially larger cost/latency tradeoff that deserves its own deliberate call, not a bundled default here.

## 9. Regenerate the memo and audit dossier

Only if `<RUN_ROOT>/final_thesis.md` exists. If `<RUN_ROOT>/.defer_module_memos` is present, this is the
terminal step of a per-module full chain: **defer the master memo and dossier to Step 9B**, after the final
audits and immutable admission, so they cannot preserve the preliminary pre-audit state. Otherwise these
keep the three tiers in sync with the refreshed standalone-rerun thesis (per `/research:full` step 10A):

- **Memo** — dispatch one Task call: `subagent_type: "memo-writer"`, message: `Read <RUN_ROOT>/final_thesis.md and <RUN_ROOT>/decision_record.json and write the ~10-page colleague memo to <RUN_ROOT>/memo.md.` If `memo.md` is absent afterward, record it as failed but do not abort.
- **Audit dossier** — run the deterministic Bash/Python concatenation from `/research:full` step 10A.2 **verbatim**, with `RUN_ROOT="<RUN_ROOT>"`. It is read-only on run artifacts, writes only `audit_dossier.md`, and must never abort the run.

## 9A. Generate deferred module memos (per-module-chain runs only)

Check for the marker file `<RUN_ROOT>/.defer_module_memos` (`test -f`). If it is **absent**, skip this entire step — a normal `/research:rerun` already refreshed each cascade module's memo inline in step 7, and a standalone full run handles its own memos. If it is **present**, a `/research:full` per-module **chain** run deferred its per-module memos so they stayed off the parallel critical path, and you generate them now, after the thesis — they are leaf outputs nothing else reads (the master reads each `99_*-synthesis.md`; every dossier excludes `*_memo.md`), so this is output-neutral.

For **every** module folder `<RUN_ROOT>/<module>/` that has a `99_*-synthesis.md`, dispatch a `module-memo-writer` Task — **regenerate unconditionally**; do NOT skip a module whose `<module>_memo.md` already exists (a re-run into the same dated folder rewrote the synthesis, so a stale memo must be refreshed, not left in place). **Issue all of these calls in a single message so they run concurrently** — they are independent, so batched they cost about one memo's time. Each message is:

> Read `<RUN_ROOT>/<module>/99_<...>-synthesis.md` and write the module memo to `<RUN_ROOT>/<module>/<module>_memo.md`. Condense only what the synthesis already carries — do not add new analysis, numbers, or evidence, and do not change its verdict, scores, or caps. The saved file must start with its `#` header and contain no chat-confirmation block. Do not write any other file and do not run git.

Each is best-effort: a module memo that fails to write is recorded as `failed` but never aborts the rerun (the `99_*-synthesis.md` is the module's decision of record). When done, **leave the `.defer_module_memos` marker in place** — Step 9B (below) reads it, runs the finish-gate, and removes it before the commit. The commit step (10) then commits the whole run folder including these newly generated memos, but never the marker.

## 9B. Full-run LLM audit trio + RUN_METADATA (per-module-chain runs only)

Check for the marker file `<RUN_ROOT>/.defer_module_memos` (`test -f`). If it is **absent**, skip this entire step — a standalone `/research:rerun` already got the deterministic finish-gate unconditionally in Step 8A, stays a single lightweight commit, and does NOT also get the expensive LLM audit trio. If it is **present**, this master rerun is the **terminal step of a `/research:full` per-module chain**, so the chained full must ship the SAME integrity-gated, eval-complete artifact set as a monolithic `/research:full` run (a chained full is a full run — it must not skip the ship-path integrity checks the monolithic path runs). Complete every item in order, then remove the marker:

1. **Backfill `RUN_METADATA.md`** — the per-module chain never ran `/research:full` step 7. If `<RUN_ROOT>/RUN_METADATA.md` is absent, create it with the Write tool (a chain writes each module in its own run, so only the essentials are known here):

```
# Run Metadata

- ticker: <TICKER>
- run_date: <DATE>
- orchestrator: /research:full (per-module chain)
- data_folder: data/<TICKER>/

## Modules completed

<one line per discovered module from `<MODULE_TERMINAL_OUTCOMES>`, including its terminal type and exact
artifact path; include `fail_fast_insufficient` modules rather than omitting or relabelling them>

## Synthesizer status

completed (master re-run)
```

2. **Integrity finish-gate (LLM audit trio)** — Step 8A above already ran 10B.1 unconditionally for this
   rerun. Run `/research:full`'s **Step 10B.2 and 10B.3 verbatim** against `<RUN_ROOT>` (with
   `RUN_ROOT="<RUN_ROOT>"`): verification, pre-mortem plus haircut propagation, then expectations-gap and
   its §7 edge-consistency check. Produce only each report JSON; skip each command's commit step. Record
   `GATE-VERIFY:` / `GATE-EXPECTATIONS:` for Step 11.

3. **Publication-time route gate** — run `/research:full` **Step 10B.3-prewrite verbatim**. On failure,
   STOP while the run is still unsealed. Do not proceed to final audits, projection, admission, or commit.

4. **Final immutable audit set** — run `/research:full` **Step 10B.3A verbatim**. The earlier reports are
   diagnostic history because haircut/stamp propagation may have changed the thesis or decision. The
   append-only final audit versions must pin those exact final bytes before any projection manifest exists.

5. **Final idea publication** — run `/research:full` **Step 10B.4 verbatim**: create the post-audit
   projection manifest, perform the final re-projection and market-evidence capture, validate the assessment,
   and invoke `freeze_idea_admission.py`. Treat `admitted`, `not_admitted`, and `not_applicable` as completed
   outcomes; any missing/malformed admission or unexpected freezer exit must STOP before commit. The freezer
   alone removes `<RUN_ROOT>/.requires_idea_publication` after atomically writing or revalidating the frozen
   result. Never remove that completion marker by hand.

6. **Regenerate the master memo and audit dossier from the sealed final state** — now run Step 9's memo
   writer and deterministic dossier procedure. The derived outputs must follow the post-audit decision and
   final admission, not the preliminary projection.

7. **Refresh `RUN_METADATA.md` from the final disk state** — apply `/research:full` Step 11's metadata
   update so the final admission status, integrity results, and completed output set describe what was
   actually sealed, not the preliminary backfill from item 1.

Only after all seven items complete, **delete the memo-deferral marker and drop any stale failure note**:
`rm -f "<RUN_ROOT>/.defer_module_memos" "<RUN_ROOT>/RUN_FAILURE.md"`. Never include
`.requires_idea_publication` in this command; its continued presence is the server's proof that immutable
publication did not finish.

## 9C. Publication-time data-needs route gate

For a per-module full chain, Step 9B already ran this gate before sealing; **do not rerun it against the
immutable record**. For a standalone rerun only, after every applicable finish-gate writer above and before
the commit, validate the final unsealed decision record against the versioned data-needs contract and
today's self-discovered research orb roster:

```bash
python3 scripts/eval.py --data-needs-prewrite "<RUN_ROOT>/decision_record.json"
```

On `DATA-NEEDS-PREWRITE: FAIL`, STOP before commit and report the exact error. Rerun the synthesizer to
repair the unsealed record; never silently drop a real need. Historical/sealed records are not regraded
against today's mutable roster.

## 9D. Write the one-time intake receipt (only the validated 8-token form)

If `<WRITE_INTAKE_RECEIPT>` is false, skip this step and do not create or infer any receipt. If true,
run the deterministic writer after every decision-writing/gating step succeeded:

```bash
python3 scripts/intake_execution_receipt.py create \
  --swarm research --subject "<TICKER>" --run-root "<RUN_ROOT>" \
  --plan-path "<PLAN_PATH>" --plan-sha256 "<PLAN_SHA256>" \
  --source-decision-fingerprint "<SOURCE_DECISION_FINGERPRINT>" \
  --executed-against-decision-fingerprint "<CURRENT_DECISION_FINGERPRINT>" \
  --module "<MODULE>" --agent "<AGENT>"
```

Capture `INTAKE-RECEIPT: <PATH> <ID>` as `<INTAKE_RECEIPT_PATH>` / `<INTAKE_RECEIPT_ID>`. The helper
applies research corrections before hashing the result and creates the file exclusively. A nonzero exit
must STOP before commit.

## 10. Commit and push to main (one commit)

Per repo `CLAUDE.md` git policy: commit straight to `main`, no branches, no PRs.

Commit through the serialized helper (global git lock so concurrent companies don't collide; commits only this run folder; pushes):

```
bash scripts/commit-run.sh "Re-run: <TICKER> <MODULE>/<AGENT> + downstream <DATE>" -- "<RUN_ROOT>/"
```

This same run-root pathspec includes `<INTAKE_RECEIPT_PATH>` when Step 9D ran. If `commit-run.sh` fails,
delete only that newly-created uncommitted receipt, report the failed commit, and STOP. Never leave an
uncommitted file that could look like consumption proof. Use only:

```bash
python3 scripts/intake_execution_receipt.py cleanup \
  --receipt-path "<INTAKE_RECEIPT_PATH>" --receipt-id "<INTAKE_RECEIPT_ID>"
```

Capture the commit SHA (`git rev-parse HEAD`). This is a single commit. Every rerun — standalone or chained — now carries the Step 8A deterministic finish-gate result. A **standalone** `/research:rerun` does not backfill `RUN_METADATA` and does not get the LLM audit trio (Step 9B was skipped); a **per-module-chain** master step backfilled `RUN_METADATA` and ran the LLM audit trio in Step 9B, so its commit ships the same eval-complete artifact set as a monolithic `/research:full`.

## 11. Report

Print: the resolved `<RUN_ROOT>`; the target orb that was re-run; the ordered cascade of syntheses re-run (and that each cascade module's `<M>_memo.md` + `<M>_dossier.md` tiers were refreshed); whether the master thesis, memo, and audit dossier regenerated; the master thesis's one-line decision/verdict; the Step 8A finish-gate `GATE:` result (every rerun); for a per-module-chain master step, additionally the `GATE-VERIFY:` / `GATE-EXPECTATIONS:` results, the final `IDEA-ADMISSION: admitted|not_admitted|not_applicable|error` status and gaps, and whether `RUN_METADATA.md` plus the final audit/admission artifacts were written (Step 9B); the intake receipt path when Step 9D ran (otherwise `none`); and the commit SHA pushed to `origin/main`. A per-module chain with no valid `idea_admission.json` is incomplete and must never be reported as done.

---

## Hard rules

- Discover everything (agents, layers, `depends_on`, cascade order) from the files and frontmatter — never hardcode module or agent names. The cascade is derived entirely from `depends_on`, exactly like `/research:full`.
- Re-run ONLY the selected orb and the `99` syntheses in the cascade (plus master + tiers). Never re-run sibling specialists or any downstream module's specialists — reuse their existing outputs.
- Re-run the cascade syntheses strictly in topological order so each reads already-refreshed upstream.
- Mutate the latest EXISTING **unsealed** run folder. A projection/admission seal is an absolute stop;
  new evidence then requires a new dated full run.
- Exactly one commit at the end. The individual agents must not commit.
- A validated intake-plan intent writes exactly one content-bound receipt before that same commit; no
  intent means no receipt. Never consume an orb from timestamps, latest-plan lookup, or server memory.
- Step 8A's deterministic finish-gate runs for EVERY rerun, standalone or chained — never skip it just because `.defer_module_memos` is absent. Only the LLM audit trio (verify-evidence + pre-mortem + expectations-gap, Step 9B) stays reserved for the per-module-chain path.
