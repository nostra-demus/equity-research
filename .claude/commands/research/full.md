---
description: Run the full equity research workflow on a ticker. Self-discovers modules from .claude/agents/*/99_*-synthesis.md and dispatches each module's pipeline, then the master synthesizer.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the master orchestrator for a self-discovering multi-module equity research workflow. Parse
`$ARGUMENTS` as one required `<TICKER>` token and, only when supplied, one optional
`<EXACT_RECOVERY_RUN_ROOT>` token. Reject any other arity. The optional root must exactly equal
`analyses/<TICKER>_YYYY-MM-DD`, already exist as a real non-symlink directory, and is an internal crash-
recovery target selected by the server; it is never a request to create or overwrite an arbitrary run.

When the optional exact root is present, prove the server binding **before any write or Task call**. Run
the following check with the two parsed tokens substituted literally. Any failure is a hard stop. Ordinary
interactive `/research:full` invocations do not receive these environment bindings and therefore cannot
select a historical root with hindsight:

```bash
python3 - "<TICKER>" "<EXACT_RECOVERY_RUN_ROOT>" <<'PY'
import hashlib, json, os, pathlib, re, sys
from scripts.canonical_json import canonical_json_bytes

ticker, target = sys.argv[1:]
source = os.environ.get('ENGINE_AUTOMATIC_RECOVERY_SOURCE_ROOT', '')
plan_path = os.environ.get('ENGINE_AUTOMATIC_RECOVERY_PLAN_PATH', '')
plan_sha = os.environ.get('ENGINE_AUTOMATIC_RECOVERY_PLAN_SHA256', '')
fingerprint = os.environ.get('ENGINE_AUTOMATIC_RECOVERY_DECISION_FINGERPRINT', '')
if os.environ.get('ENGINE_AUTOMATIC_RECOVERY_ROOT') != target:
    raise SystemExit('FULL-RECOVERY: missing server root authority')
if not re.fullmatch(rf'analyses/{re.escape(ticker)}_\d{{4}}-\d{{2}}-\d{{2}}', target):
    raise SystemExit('FULL-RECOVERY: unsafe target')
if not re.fullmatch(rf'analyses/{re.escape(ticker)}_\d{{4}}-\d{{2}}-\d{{2}}', source):
    raise SystemExit('FULL-RECOVERY: unsafe source')
if not re.fullmatch(r'sha256:[a-f0-9]{64}', plan_sha) or not re.fullmatch(r'sha256:[a-f0-9]{64}', fingerprint):
    raise SystemExit('FULL-RECOVERY: invalid immutable identity')
repo = pathlib.Path.cwd().resolve(strict=True)
target_real = (repo / target).resolve(strict=True)
source_real = (repo / source).resolve(strict=True)
if target_real.parent != (repo / 'analyses').resolve(strict=True) or source_real.parent != target_real.parent:
    raise SystemExit('FULL-RECOVERY: run root escaped analyses')
source_plan = (repo / plan_path).resolve(strict=True)
if source_plan.parent != source_real / 'intake' or source_plan.name != pathlib.Path(plan_path).name:
    raise SystemExit('FULL-RECOVERY: source plan escaped its run')
staged_plan = (target_real / 'intake' / source_plan.name).resolve(strict=True)
if staged_plan.parent != target_real / 'intake':
    raise SystemExit('FULL-RECOVERY: staged plan escaped its run')
with source_plan.open(encoding='utf-8') as fh: authored = json.load(fh)
with staged_plan.open(encoding='utf-8') as fh: staged = json.load(fh)
def digest(value):
    value = dict(value)
    value.pop('staged_for_scoped_rerun', None)
    return 'sha256:' + hashlib.sha256(canonical_json_bytes(value)).hexdigest()
if (authored.get('staged_for_scoped_rerun') is True or staged.get('staged_for_scoped_rerun') is not True
        or authored.get('run_root') != source or staged.get('run_root') != source
        or authored.get('decision_fingerprint') != fingerprint
        or staged.get('decision_fingerprint') != fingerprint
        or digest(authored) != plan_sha or digest(staged) != plan_sha):
    raise SystemExit('FULL-RECOVERY: exact staged plan binding changed')
print('FULL-RECOVERY: exact server binding verified')
PY
```

This orchestrator:
1. Discovers modules dynamically (does not hardcode `business-model` / `earnings` / any future module).
2. Writes `RUN_METADATA.md` before any module runs.
3. Runs each module's pipeline inline, using the shared pipeline defined in `frameworks/MODULE_PIPELINE.md`.
4. Continues past per-module fail-fast aborts; aborts the whole run only if **every** module aborts.
5. Invokes the master synthesizer once all modules finish, completes the integrity audits and immutable Ideas admission, then generates two derived output tiers beside the deep-dive thesis — a ~10-page plain-English colleague `memo.md` and a deterministic, lossless `audit_dossier.md` (every agent and sub-agent output concatenated). Three tiers from one run: memo (share) → `final_thesis.md` (deep dive) → `audit_dossier.md` (audit everything).
6. Makes **one** path-confined commit on `main` per run (per repo `CLAUDE.md` git policy). The commit SHA is reported by `commit-run.sh` and is already reconstructable from Git; it is not written back into its own input tree. Per-module commits do NOT happen under this orchestrator — they only happen when a module command is invoked standalone.

Execute the applicable steps below in order. The only skips are the explicit sealed-recovery routes in
step 3A; they protect immutable research rather than weakening the workflow.

---

## 1. Resolve today's date

Without an exact recovery root, run `date +%Y-%m-%d` via Bash and capture the result as `<DATE>`. With an
exact recovery root, derive `<DATE>` only from its final `YYYY-MM-DD` suffix. Use this exact string
everywhere `<DATE>` appears below.

Also capture `<STARTED_AT>` from `date -u +%Y-%m-%dT%H:%M:%SZ` for the metadata file.

---

## 2. Verify the data pool

Check that `data/<TICKER>/` exists and contains at least one file:

```
ls -1 data/<TICKER>/ 2>/dev/null | head -n 1
```

If the directory is missing or empty, STOP. Tell the user: "No data found at `data/<TICKER>/`. Populate the Drive folder for this ticker and re-run." Do not proceed to any later step.

---

## 3. Create the run root folder

Without an exact recovery root only:

```
mkdir -p "analyses/<TICKER>_<DATE>"
```

Without an exact recovery root, capture `analyses/<TICKER>_<DATE>` as `<RUN_ROOT>`. With an exact recovery
root, set `<RUN_ROOT>` to that already-existing path and do not create a different dated folder. Every
module and the master synthesizer writes inside this one bound folder.

### 3A. Detect and protect a sealed run

Before writing metadata or dispatching any paid research task, inspect `<RUN_ROOT>`:

- If `idea_admission.json` exists, set `<RECOVERY_MODE>` to `admission_sealed`. Run
  `python3 scripts/freeze_idea_admission.py <RUN_ROOT>` idempotently to verify the immutable record and
  its current pinned inputs. Accept `admitted` / `not_applicable` (exit 0) and `not_admitted` (exit 3) as
  valid sealed results; any other exit is a validation failure. Do not rerun a module, synthesizer,
  deterministic thesis stamp, audit, market
  capture, or final projection. Skip directly to step 10C, which may rebuild only derived memo/dossier
  files, then finish metadata/commit recovery. A failed validation records `IDEA-ADMISSION: error` and is
  a hard stop: preserve the sealed bytes and require a genuinely new dated run for new research.
- Else, if `idea_projection_manifest.json` exists, set `<RECOVERY_MODE>` to `projection_sealed`. Run
  `python3 scripts/create_idea_projection_manifest.py <RUN_ROOT>` and require `status: existing`. If that
  validation fails, record `IDEA-ADMISSION: error` and stop before market capture, re-projection, the
  freezer, or derived-output recovery; preserve the bytes and use a new dated run. Do not rerun modules,
  synthesis, deterministic stamps, or audits. Run `python3 scripts/research_paid_completion.py
  projection-recover <RUN_ROOT>` before inspecting the assessment. That helper is the sole recovery
  writer: it validates a fsynced attempt whose unique staged output binds the exact manifest and the
  still-byte-identical preliminary wrapper, then exact-hash promotes a valid staged final output or writes
  the deterministic fail-closed fallback for an invalid staged Task output. It never attributes canonical
  bytes by mtime. Unknown/changed canonical bytes remain untouched and are a hard stop. Skip to step 10B.4
  and classify the assessment before doing anything else:
  - a schema-valid final `candidate`, newly timestamped no earlier than the manifest, may continue directly
    to parse/schema/freezer only when its canonical market snapshot exists and matches the manifest;
  - a schema-valid final `not_assessable` wrapper, newly timestamped no earlier than the manifest and no
    longer carrying the exact preliminary pending-manifest gap, continues directly to parse/schema/freezer.
    It does not require a market snapshot: snapshot unavailability may be the honest final gap;
  - only the exact preliminary `not_assessable` wrapper with its pre-manifest timestamp may run the final
    re-projection Task. Require `projection-recover` to report `preliminary_armed` and use its exact
    `output_path`; for `preliminary_unarmed`, first run `projection-arm` and use that exact `output_path`.
    Never recompute the attempt path. If `idea_market_evidence.json` already exists (the process may have died after the
    canonical snapshot rename but before replacing the wrapper), first run
    `python3 scripts/market_prices.py --write-idea-evidence <TICKER> <RUN_ROOT>` and require its immutable
    manifest/listing/digest validation to succeed. If the snapshot is absent, the final Task creates it in
    the ordinary path. An unreadable, mismatched, or non-canonical existing snapshot is a hard stop; and
  - any other combination records `IDEA-ADMISSION: error`, preserves the bytes, and requires a new dated run.
  Under the atomic sequence in step 10B.4, any completed semantic gate already has
  `idea_admission.json`; if that file appears at any point, stop this branch and restart under
  `admission_sealed` rather than re-projecting.
- Else, in an exact recovery root only, if either master attempt/promotion marker exists, OR neither paid
  completion seal exists and any of `final_thesis.md`, `decision_record.json`, or `idea_3_6m.json` exists,
  run `python3
  scripts/research_paid_completion.py master-recover <RUN_ROOT>` **before** terminal-pair recovery. A
  `promoted` / `complete_current` result continues immediately into the following paid-seal/terminal-pair branch
  against the now-canonical trio (do not select this master branch a second time). A
  `terminal_pair_recovery` result means the schema-valid canonical trio is paid work but has no completion
  receipt matching today's evidence inputs (including a valid legacy/unreceipted trio): preserve it, skip
  steps 4–10, and enter the same terminal-pair recovery below. Full-run crash recovery must never request
  replacement merely because the pool manifest, CIQ sidecar, module, or generator changed during
  downtime. An `armed_ready` /
  `retry_ready` result sets `<RECOVERY_MODE>` to `master_recovery`, captures its exact `output_dir` and
  `staged_outputs`, skips steps 4–9, and resumes at step 10. The Task reads the canonical run but writes
  only those attempt-owned paths. Malformed, partial, or wrong-identity canonical bytes are never attempt
  output and are a hard stop; only files inside the unique recorded staging directory may be retired.
  `replace_needed` is not a valid result from this default command: it is reserved for the explicit
  `/research:rerun` contract using `master-recover --replacement-requested`, and must never be converted
  into a replacement Task here.
- Else, in an exact recovery root only, if either paid-completion seal exists OR both `final_thesis.md` and
  `decision_record.json` are non-empty, do not rerun modules or the master synthesizer. Recovery is selected
  by the strongest durable boundary, in this order:
  1. If `final_audit_inputs.json` exists, run `python3 scripts/research_paid_completion.py audit-plan
     <RUN_ROOT>`. Require `status: sealed`; set `<RECOVERY_MODE>` to `final_audit_recovery`, skip steps 4–10
     and 10B.1–10B.3-prewrite, and resume at 10B.3A. The final plan reuses each exact latest canonical final
     audit and launches only missing/stale kinds.
  2. Else if `diagnostic_audit_inputs.json` exists, run `python3
     scripts/research_paid_completion.py diagnostic-plan <RUN_ROOT>`. A validation error, including unknown
     live thesis/decision bytes, is a hard stop and the bytes must be preserved. If it reports `status:
     derived_checkpointed`, set `<RECOVERY_MODE>` to `diagnostic_checkpoint_recovery`, skip steps 4–10 and
     10B.1–10B.3-prewrite, and resume at 10B.3A. If it reports `status: input_sealed`, set
     `<RECOVERY_MODE>` to `diagnostic_recovery`, skip steps 4–10 and 10B.1, and resume at 10B.2. An
     `input_state: transform_incomplete` is an exact intent-authorized crash state: 10B.2 revalidates the
     already-complete reports and `diagnostic-transform` finishes only the staged missing replacement. No
     restore or writer may overwrite bytes outside that intent's enumerated input/output hashes.
  3. Else require both terminal files to be non-empty, parse and require `ticker == <TICKER>`, `run_root ==
     <RUN_ROOT>`, and `decision_date == <DATE>`, then run `python3 scripts/research_paid_completion.py
     diagnostic-plan <RUN_ROOT>` and require `status: unsealed`. Set `<RECOVERY_MODE>` to
     `terminal_pair_recovery`. Do not rerun modules or the master synthesizer; skip steps 4–10 and resume at
     10B.1.

  Any malformed/mismatched seal, snapshot, journal, report, checkpoint, or terminal pair is unsafe and must
  stop; never reinterpret it as a fresh run. If the exact root has neither pair nor a paid-completion seal,
  normal resumable steps 4–10 continue and reuse every finished module already present.
- Otherwise set `<RECOVERY_MODE>` to `fresh` and continue normally.

A manifest seals every artifact it pins. An admission seals the assessment result as well, including
`not_applicable`. Same-day convenience is never permission to rewrite an ex-ante forecast after later
information or a gate result is visible.

---

## 4. Discover runnable modules

Use the Glob tool with pattern `.claude/agents/*/99_*-synthesis.md`.

For each matched file, extract `<module>` as the parent directory's basename (e.g. `business-model`, `earnings`). A module is "runnable" precisely when it has a `99_*-synthesis.md` agent.

If the glob returns zero matches, STOP and tell the user: "No runnable modules found under `.claude/agents/*/`. Add at least one module with a `99_*-synthesis.md` agent."

### Module ordering (dependency-driven)

For each discovered module, read `depends_on` from its `99_*-synthesis.md` frontmatter — a list of module names it consumes (treat a missing or empty `depends_on` as no dependencies). Ignore any listed dependency that is not itself a discovered runnable module (treat it as absent).

Order the modules by a **topological sort** of that dependency graph: a module runs only AFTER every module in its `depends_on`. Among modules whose dependencies are all already placed, pick the next in **alphabetical order** (stable and deterministic). If a dependency cycle makes a topological order impossible, fall back to alphabetical order and note the cycle in `RUN_METADATA.md`.

(With today's modules this yields: business-model → earnings → balance-sheet-survival → management-governance → valuation. No module name is hardcoded — the order is derived entirely from `depends_on`.)

Capture the ordered list as `<MODULES_PLANNED>`, and keep each module's `depends_on` list (used in step 8A).

---

## 5. Resolve prior run reference

```
ls -1d analyses/<TICKER>_* 2>/dev/null | sort -r | grep -v "^<RUN_ROOT>$" | head -n 1
```

Capture the result as `<PRIOR_RUN>`. If empty, set it to the literal string `none`.

---

## 6. Capture repo SHA

```
git rev-parse HEAD
```

Capture the result as `<REPO_SHA>`.

---

## 7. Write RUN_METADATA.md (initial)

For a fresh run, use the Write tool to create `<RUN_ROOT>/RUN_METADATA.md` with the following content
(substitute values literally). In either sealed recovery mode, preserve the existing metadata and update
only the final recovery/status fields after the immutable validation succeeds:

```
# Run Metadata

- ticker: <TICKER>
- run_date: <DATE>
- started_at: <STARTED_AT>
- orchestrator: /research:full
- repo_sha: <REPO_SHA>
- data_folder: data/<TICKER>/
- prior_run: <PRIOR_RUN>

## Source files

<one line per file from `ls -1 data/<TICKER>/`>

## Modules planned

<one line per module from <MODULES_PLANNED>>

## Modules completed

(filled in at end of run)

## Modules aborted

(filled in at end of run)

## Synthesizer status

(filled in at end of run)

## Memo status

(filled in at end of run)

## Audit dossier status

(filled in at end of run)

## Integrity gate

(filled in at end of run)

## Publication

(filled in at end of run)

```

---

## 8. Run each module sequentially

**This step is RESUMABLE.** A re-launched run reuses every module a prior attempt already finished, so a run broken by a plan-limit pause, a dropped connection, or a reboot picks up where it stopped instead of redoing paid work. A fresh run has an empty run root, so nothing is skipped and the whole pipeline runs. (The server's per-module chaining seeds the same skip from disk; this keeps the monolithic path consistent.)

For each module in `<MODULES_PLANNED>` (in the order from step 4):

- **Already finished? Skip it.** If `<RUN_ROOT>/<MODULE>/99_<MODULE>-synthesis.md` exists and is non-empty (`test -s`), this module completed in a prior attempt — do NOT re-dispatch it. Treat it as completed for the cross-module context of later modules (8A), and move to the next module. (A partial, half-written module — anything short of a non-empty `99_<MODULE>-synthesis.md` — is NOT trusted: re-run it.)

### 8A. Build cross-module context

Build `<CROSS_MODULE_CONTEXT>` for this module from its `depends_on` list (captured in step 4), naming only dependencies that **completed in this run root** (whether just run, or reused from a prior interrupted attempt — same run folder either way):

1. For each module name `<dep>` in this module's `depends_on`, check whether `<RUN_ROOT>/<dep>/99_<dep>-synthesis.md` exists (i.e. it is finished in this run root).
2. For each `<dep>` that completed, produce the sentence: `<Dep> cross-module path: <RUN_ROOT>/<dep>/.` — where `<Dep>` is the dependency name with its first letter capitalized (`business-model` → `Business-model`, `earnings` → `Earnings`). This is the label format every dependent agent parses.
3. Join the sentences with a single space to form `<CROSS_MODULE_CONTEXT>`.
4. If this module has no `depends_on`, or none of its dependencies completed in this run, set `<CROSS_MODULE_CONTEXT>` to the literal string `none`.

**Important:** always use the **current run's** paths, never an older run's. Do not fall back to `ls analyses/<TICKER>_*/<dep>/ | sort -r | head -n 1` here — that is the standalone commands' behavior. Within a `/research:full` run the current run's path is the only correct value, and a dependency that aborted in this run is simply omitted (or yields `none` if it was the only dependency).

### 8B. Invoke the shared pipeline

Follow every step in `frameworks/MODULE_PIPELINE.md` with these inputs:

- `<TICKER>` = the `<TICKER>` parsed from the arguments
- `<DATE>` = the `<DATE>` resolved in step 1
- `<MODULE>` = the current module name
- `<RUN_ROOT>` = the run root from step 3
- `<CROSS_MODULE_CONTEXT>` = the string from step 8A

**Defer the module memo (speed, output-neutral).** When you follow `MODULE_PIPELINE.md` Step 4.9 for this module, do Step 4.9B (the deterministic module dossier) but **skip Step 4.9A (the LLM module memo)** — in a `/research:full` run the per-module memos are generated together in one batch in **Step 10C** (after final Ideas admission). Nothing downstream reads a module memo (the master reads each `99_*-synthesis.md`, and every dossier already excludes `*_memo.md`), so this changes only *when* a memo is written, never its content — and it stops the pipeline pausing ~2.5 min after every module.

### 8C. Record outcome

After the shared pipeline returns:

- If `fail_fast_triggered = true`: record this module under "Modules aborted" with a brief note (which agent triggered, output file path). **Continue to the next module — do not abort the whole run.**
- Else, if all expected agents wrote files including the module's `99_*-synthesis.md`: record this module under "Modules completed".
- Else (partial failure with no fail-fast): record under "Modules aborted" with the failed agent names.

---

## 9. Decide whether to invoke master synthesizer

After all modules complete:

- If **at least one** module is in "Modules completed", proceed to step 10.
- If **every** module is in "Modules aborted", skip steps 10–11; jump to step 12 (commit) with `Synthesizer status: skipped (all modules aborted)` written into `RUN_METADATA.md`.

---

## 10. Run the master synthesizer

Before dispatch, unless `<RECOVERY_MODE>` is `master_recovery`, run:

```bash
python3 scripts/research_paid_completion.py master-arm <RUN_ROOT>
```

Require `status: armed|existing|rearmed` and capture the returned `<MASTER_OUTPUT_DIR>` and exact
`staged_outputs`. In `master_recovery`, use only the directory and paths returned by the preceding
`master-recover`; never recompute them. The attempt binds every module `99` synthesis, the synthesizer
contract, `_pool_extracts/manifest.json` and `_pool_extracts/ciq_facts.json` when present, and contained
scoped intake plans when present.

Dispatch a single Task call:

- `subagent_type: "synthesizer"`
- User message:

  > Master synthesis with two separate path authorities. CANONICAL_RUN_ROOT is `<RUN_ROOT>`: read module
  > inputs only from that canonical root, and keep every embedded `run_root`, `decision_date`,
  > `final_thesis_path`, assessment id, ticker, and other identity field bound to it. MASTER_OUTPUT_DIR is
  > the exact helper-returned `<MASTER_OUTPUT_DIR>`: write exactly `final_thesis.md`,
  > `decision_record.json`, and the preliminary `idea_3_6m.json` there. Do not infer canonical identity
  > from MASTER_OUTPUT_DIR. Do not write or edit any canonical terminal path and do not run git.

Wait for it, then run `python3 scripts/research_paid_completion.py master-recover <RUN_ROOT>`. Only
`promoted` / `complete_current` permits step 10.0. `armed_ready` / `retry_ready` means the Task produced no complete
valid staged trio: use the newly returned exact output directory for at most one recovery Task with the
same two-authority message, then run `master-recover` again. If it still does not promote, stop and leave
the attempt for exact-root recovery. Never inspect, copy, or repair a partial staged pair by hand. The
helper validates a `#` thesis, canonical decision identity/path, and exact preliminary assessment, fsyncs
the three output hashes before CAS promotion, and resumes a crash between canonical renames. A third
canonical hash is unsafe and is never overwritten.

**10.0 — Preliminary idea-assessment existence and schema gate (forward runs only).** Only after
`master-recover` promoted the complete trio, the canonical `<RUN_ROOT>/idea_3_6m.json` is eligible. This is an early completeness
check only. Step 10B.4 re-projects it from the post-audit decision and is the only version eligible for
immutable admission. Run:

`python3 scripts/validate_screener_json.py frameworks/ideas/idea-assessment.schema.json <RUN_ROOT>/idea_3_6m.json`

- The preliminary result must be `not_assessable` with `candidate: null` and must name the pending
  post-audit projection manifest/canonical market evidence. Canonical market evidence cannot be written
  before the manifest, so a preliminary `candidate` is a production defect even when it passes JSON
  Schema. STOP and preserve it: the helper's promoted master trio can only contain the exact preliminary
  wrapper, so a canonical candidate here proves bypass or later damage. Do not write a fallback, run
  `--write-idea-evidence`, upgrade it, or reach into an older run to fill the board.
- If the canonical file is missing, malformed, wrong-identity, or not the exact preliminary wrapper, the
  master promotion contract was bypassed or damaged. STOP and preserve it; never synthesize a canonical
  fallback for a partial master attempt.
- If a present file fails schema validation, do not call it healthy and do not silently repair its
  candidate. Record `invalid (schema gate failed)` for step 11 and surface the validator errors in step 13.

---

## 10A. Memo and audit-dossier procedure (DEFERRED until after 10B.4)

**Do not execute any 10A substep at this point.** Keep this procedure as the canonical generation
instructions, but execute it only when step 10C invokes it after the final idea re-projection and atomic
semantic admission. This ordering prevents `memo.md`, module memos, or
`audit_dossier.md` from freezing the preliminary idea state.

When step 10C invokes this procedure, run it only if `<RUN_ROOT>/final_thesis.md` exists (the synthesizer succeeded). If the synthesizer was skipped because every module aborted, skip the procedure entirely and record both tiers as `skipped (no final thesis)` in step 11.

Before any paid memo Task, require the immutable admission and projection authority and compute the
per-output recovery plan:

```bash
python3 scripts/research_paid_completion.py memo-promote <RUN_ROOT>
python3 scripts/research_paid_completion.py memo-plan <RUN_ROOT>
```

The helper validates the admission and manifest rather than trusting their presence. Each target is
content-addressed over the exact authority bytes, exact source-file SHA-256 digest(s), output path,
generator name/version, and generator-spec digest. `action: reuse` is valid only when a matching fsynced
receipt and the exact current output hash both pass the persisted memo-content checks: decision/verdict
reconciliation, the generator contract's required section topology, conservative word/byte floors, a
top-level `#` header, a closed fence set, and no chat-confirmation block. `memo-promote` is model-free: it
can create a missing receipt only when a complete output was written after an fsynced, content-addressed
attempt that binds this exact authority/source/output/generator work spec. Thus a kill after the Task wrote
the file but before the parent ran `memo-seal` does not buy the Task again. A pre-existing, truncated,
unarmed, stale-authority, or unchanged output is never promoted. An authority-validation error is a hard
stop: never weaken an immutable seal in order to regenerate a convenience output.

These are the other two tiers of the run, written **beside** `final_thesis.md` so the step-12 commit of
`<RUN_ROOT>/` picks them up automatically — no extra commit:

- `memo.md` — the ~10-page, plain-English colleague memo (the shareable tier).
- `audit_dossier.md` — the deterministic, lossless concatenation of every artifact in the run (the audit tier).

### 10A.0 — Module memos (deferred batch, LLM, via the `module-memo-writer` agent)

In a full run the per-module memos were deferred from step 8 (Step 4.9A was skipped) so they don't pause the pipeline ~2.5 min after each module. When step 10C invokes this procedure, generate them from the final post-admission artifact set. They are leaf outputs nothing else reads.

From the `memo-plan` result, select only `work_kind: module_memo` targets with `action: run`. Reuse every
`action: reuse` target without a Task call. Before issuing any selected Task, durably arm every selected
target individually:

```bash
python3 scripts/research_paid_completion.py memo-arm <RUN_ROOT> 'module:<module>'
```

Every arm must succeed before dispatch. **Then issue all required module Task calls in a single message so
they run concurrently** — the memos are independent, so batched they cost about one memo's time, not the
sum of six. For each selected module the user message is:

> Read `<RUN_ROOT>/<module>/99_<...>-synthesis.md` and write the module memo to `<RUN_ROOT>/<module>/<module>_memo.md`. Condense only what the synthesis already carries — do not add new analysis, numbers, or evidence, and do not change its verdict, scores, or caps. The saved file must start with its `#` header and contain no chat-confirmation block. Do not write any other file and do not run git.

Immediately after each Task returns, validate and durably acknowledge that one output:

```bash
python3 scripts/research_paid_completion.py memo-seal <RUN_ROOT> 'module:<module>'
```

This writes the content-addressed receipt with a temp-file + atomic rename, fsyncs the receipt and its
directory, and never blesses a partial/stale output. If sealing rejects a returned output, rerun `memo-arm`
for only that target, retry only that individual module Task once, then rerun `memo-seal`; do not replay
successful siblings. A module memo or
receipt that still fails is recorded as `failed` for that module but never aborts the run (the
`99_*-synthesis.md` is the module's decision of record). Do not manufacture a receipt. On recovery, rerun
`memo-promote` before `memo-plan`, then dispatch only the individual targets still marked `run`; a receipt
completed before the crash or safely promoted from an armed complete output is never paid for twice. Order
does not matter versus the audit dossier (10A.2), which already excludes `*_memo.md` and completion files.

### 10A.1 — Memo (LLM, via the memo-writer agent)

Rerun `python3 scripts/research_paid_completion.py memo-plan <RUN_ROOT>` after the module batch. If the
`top-level` target is `action: reuse`, do not dispatch a Task. If it is `action: run`, dispatch a single
Task call only after:

```bash
python3 scripts/research_paid_completion.py memo-arm <RUN_ROOT> top-level
```

Then dispatch:

- `subagent_type: "memo-writer"`
- User message:

  > Read <RUN_ROOT>/final_thesis.md and <RUN_ROOT>/decision_record.json and write the ~10-page colleague memo to <RUN_ROOT>/memo.md.

Wait for it to complete, then run:

```bash
python3 scripts/research_paid_completion.py memo-seal <RUN_ROOT> top-level
```

If sealing rejects the returned output, re-arm, retry only this top-level Task once, and rerun `memo-seal`.
If the Task or seal still fails, record the memo as `failed` in step 11 — but do **NOT** fail the run. A bare
`memo.md` is not success without its exact receipt. The memo is a derived convenience tier;
`final_thesis.md` is the decision of record. A recovery first runs `memo-promote`, and reruns this paid Task
only while the following `memo-plan` continues to mark `top-level` as `action: run`.

### 10A.2 — Audit dossier (deterministic, no LLM)

The audit dossier is a mechanical, lossless concatenation — never an LLM rewrite — so nothing can be omitted or paraphrased. Build it with this Bash step. It is read-only on every run artifact, writes only `audit_dossier.md`, is best-effort, and must never abort the run:

```bash
RUN_ROOT="<RUN_ROOT>" python3 - <<'PY'
import os, glob, re, datetime
RUN = os.environ["RUN_ROOT"]
OUT = os.path.join(RUN, "audit_dossier.md")
def slug(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
def read(p):
    try: return open(p, encoding="utf-8", errors="replace").read()
    except Exception: return None
# discover modules = run subfolders that carry a 99_*-synthesis.md
mods = {os.path.basename(os.path.dirname(s)): s
        for s in glob.glob(os.path.join(RUN, "*", "99_*-synthesis.md"))}
# run order = topological sort by each module's agent-spec depends_on, alpha tie-break (mirrors step 4)
def deps(m):
    sp = glob.glob(os.path.join(".claude/agents", m, "99_*-synthesis.md"))
    if not sp: return []
    parts = (read(sp[0]) or "").split("---")
    fm = parts[1] if len(parts) >= 3 else ""
    out, lines = [], fm.splitlines()
    for i, ln in enumerate(lines):
        mm = re.match(r"\s*depends_on:\s*(.*)$", ln)
        if not mm: continue
        inline = mm.group(1).strip()
        if inline and inline not in ("|", ">", "[]"):
            out += re.findall(r"[A-Za-z0-9_-]+", inline)
        for ln2 in lines[i+1:]:
            if re.match(r"\s*-\s*\S", ln2): out += re.findall(r"[A-Za-z0-9_-]+", ln2)
            elif re.match(r"\s*\w+\s*:", ln2): break
        break
    return [n for n in out if n in mods]
ordered, remaining = [], set(mods)
while remaining:
    cand = sorted(m for m in remaining if all((d in ordered) or (d not in mods) for d in deps(m)))
    if not cand: cand = sorted(remaining)
    ordered.append(cand[0]); remaining.discard(cand[0])
# collect: final_thesis first, then per module the 99 synthesis, then 00..NN sub-agents ascending
sections, gaps = [], []
ft = os.path.join(RUN, "final_thesis.md")
if os.path.exists(ft): sections.append(("Final Thesis (decision)", "final_thesis.md", ft))
else: gaps.append("final_thesis.md missing")
n_syn = n_sub = 0
for m in ordered:
    files = glob.glob(os.path.join(RUN, m, "*.md"))
    # the module's own memo/dossier tiers are derived condensations of these same files — exclude them
    # so the run-level dossier does not double-include each module's memo and full module-dossier.
    files = [f for f in files if not re.search(r"_(memo|dossier)\.md$", os.path.basename(f))]
    syn = sorted(f for f in files if re.search(r"99_.*-synthesis\.md$", os.path.basename(f)))
    subs = sorted(f for f in files if f not in syn)  # 00_,01_,...,NN_ zero-padded => lexical == numeric
    for f in syn:
        sections.append((f"{m} — module synthesis", os.path.relpath(f, RUN), f)); n_syn += 1
    for f in subs:
        sections.append((f"{m} / {os.path.basename(f)}", os.path.relpath(f, RUN), f)); n_sub += 1
now = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
ticker = os.path.basename(RUN).rsplit("_", 1)[0]
H = [f"# Audit Dossier — {ticker}\n",
     "> Deterministic, lossless concatenation of every artifact in this research run — the final thesis, "
     "each module synthesis, and every sub-agent output, in run order. Generated mechanically by "
     "`/research:full` (no LLM rewriting), so nothing is omitted or paraphrased. This is the \"see "
     "everything\" audit tier; the decision lives in `final_thesis.md` and the colleague summary in `memo.md`.\n",
     f"- Generated: {now}",
     f"- Run root: `{RUN}`",
     f"- Module run order: {', '.join(ordered) if ordered else '(none)'}",
     f"- Contents: 1 final thesis + {n_syn} module syntheses + {n_sub} sub-agent outputs = {len(sections)} files"]
if gaps: H.append(f"- Assembly notes: {'; '.join(gaps)}")
H.append("\n## Table of Contents\n")
for title, src, _ in sections:
    H.append(f"- [{title}](#{slug(title)}) — `{src}`")
parts = ["\n".join(H)]
for title, src, path in sections:
    body = read(path)
    if body is None:
        gaps.append(f"unreadable: {src}"); body = "_(file could not be read)_"
    parts.append(f"\n\n---\n\n## {title}\n\n_Source: `{src}`_\n\n{body.rstrip()}\n")
open(OUT, "w", encoding="utf-8").write("\n".join(parts))
print(f"WROTE {OUT} ({len(sections)} sections, {os.path.getsize(OUT)} bytes)"
      + (f"; gaps: {'; '.join(gaps)}" if gaps else ""))
PY
```

If the script errors for any reason, record the audit dossier as `failed` in step 11 and continue — never abort the run over the audit tier.

---

## 10B. Integrity finish-gate (BEFORE commit) — fix F01/F17

Run this step only if `<RUN_ROOT>/final_thesis.md` and `<RUN_ROOT>/decision_record.json` exist. **This is the backstop that makes the run's numbers trustworthy before they are committed and read** — previously the no-source-no-claim and §10 math re-checks lived only in optional, after-the-fact commands, so a confidently-wrong or fabricated-number thesis could ship clean. Two parts; neither aborts the run (the thesis AND the gate result are always committed, so a failure is visible, never hidden).

### 10B.1 — Deterministic validator (always runs; can stamp the thesis PROVISIONAL)

Run this via Bash. It re-derives the §10 scenario math from `decision_record.json` (same identities as `eval` harness check M), the missing-price / score-range caps, the §11 data-sufficiency ↔ decision cap (check Y), the §7 edge gate (check V), the §14 external-variable conviction cap (check Z), the §24 rejector-filter conviction caps — Filters 1/2/4/5/6 (checks AC/AD/AE/AF, via `scripts/rating_caps.py`) — the §13 cross-module forensic-mosaic conviction cap (check AQ, via `scripts/rating_caps.py`) — the Headline Scorecard ↔ decision_record.json reconciliation plus red-flag severity reconciliation (checks AI/AK, via `scripts/headline_checks.py`) — and the §10 scenario-span check, sign-check presence gate, and §10 conjunction-disclosure check (checks AT/AU/AV, via `scripts/scenario_integrity_checks.py`). Prepends a PROVISIONAL banner to `final_thesis.md` if any inconsistency is found:

```bash
python3 - "<RUN_ROOT>" <<'PY'
import json, glob, os, re, sys, datetime
run = sys.argv[1]
dr = os.path.join(run, "decision_record.json"); ft = os.path.join(run, "final_thesis.md")
viol = []
try: d = json.load(open(dr))
except Exception as e: print("GATE: ERROR — decision_record.json unreadable:", e); sys.exit(0)
# _isnum mirrors eval.py isnum() (numeric, bool excluded); shared by the scenario-math block below AND the
# score-range / data-sufficiency / edge / external-variable checks further down.
_isnum = lambda v: isinstance(v, (int, float)) and not isinstance(v, bool)
scen = d.get("scenarios")
if isinstance(scen, list) and scen:
    try:
        probs = [float(s["probability"]) for s in scen]; rets = [float(s["return_pct"]) for s in scen]
        if abs(sum(probs) - 100) > 0.5: viol.append(f"scenario probabilities sum to {round(sum(probs),2)} != 100")
        # PARITY with eval.py check M — this LIVE finish-gate used to re-derive ONLY prob-sum + expected_return,
        # so a wrong risk_reward / ER-from-target / downside shipped clean until a later (CI/manual) eval. It now
        # mirrors check M FAITHFULLY (expected_return sign-flip + relative tolerance, all-or-none price targets,
        # ER-from-target, risk_reward, downside, MoS). Direction-aware: a short's adverse case is the price RISING,
        # so worst = max(target) and the return signs invert — do NOT apply the long price formula to a short.
        er = d.get("expected_return_pct"); calc = sum(p/100.0*r for p, r in zip(probs, rets))
        if _isnum(er):
            _erflip = (abs(er) > 0.25 and abs(calc) > 0.25 and (er > 0) != (calc > 0))
            if abs(er - calc) > max(1.0, abs(calc)*0.05) or _erflip:
                viol.append(f"headline expected_return_pct={er} != Sum(p*ret)={round(calc,2)} from scenarios")
        ep = d.get("entry_price"); tgts = [s.get("price_target") for s in scen]; have_t = [_isnum(t) for t in tgts]
        short = (d.get("decision") == "Short Candidate")
        if _isnum(ep) and ep and any(t is not None for t in tgts) and not all(have_t):
            viol.append("price_target present on some scenarios but not all numeric — cannot reconcile target / risk-reward")
        if _isnum(ep) and ep and all(have_t):
            pwt = sum(p/100.0*t for p, t in zip(probs, tgts)); worst = max(tgts) if short else min(tgts)
            er_t = ((ep-pwt) if short else (pwt-ep))/ep*100.0
            _tflip = (abs(er_t) > 0.25 and abs(calc) > 0.25 and (er_t > 0) != (calc > 0))
            if abs(er_t - calc) > max(1.5, abs(calc)*0.05) or _tflip:
                viol.append(f"ER_from_target={round(er_t,2)} != Sum(p*ret)={round(calc,2)}")
            rr = d.get("risk_reward")
            if (worst > ep if short else ep > worst):   # a real adverse case exists → risk/reward is derivable
                crr = ((ep-pwt)/(worst-ep)) if short else ((pwt-ep)/(ep-worst))
                if not _isnum(rr):
                    viol.append(f"risk_reward null but derivable from scenarios = {round(crr,2)} — must be published when price targets are used")
                elif abs(rr-crr) > max(0.15, abs(crr)*0.12): viol.append(f"risk_reward={rr} != calc={round(crr,2)} from scenarios")
        # downside = worst-case (bear) position return, negated: −min(return_pct). Position-signed, so min() is the
        # worst case for BOTH long and short. A scenarios[] run that leaves downside_risk_pct null (but derivable) FAILs.
        cdr = -min(rets); dr = d.get("downside_risk_pct")
        if not _isnum(dr):
            viol.append(f"downside_risk_pct is null but derivable from scenarios = {round(cdr,2)} — the synthesizer must publish it")
        else:
            _flip = (abs(dr) > 0.25 and abs(cdr) > 0.25 and (dr > 0) != (cdr > 0))
            if abs(dr-cdr) > max(1.0, abs(cdr)*0.05) or _flip: viol.append(f"downside_risk_pct={dr} != -min(scenario return)={round(cdr,2)}")
        # margin_of_safety_pct — discount of price to the BASE-case fair value: (base FV − price)/base FV, base FV =
        # the base-labelled scenario's price_target. Direction-UNIFORM (price levels, not position-signed returns) — a
        # short (base FV < price) yields a negative MoS on the SAME formula, no branch. Reconciles a PRESENT value and
        # fails a non-numeric or non-re-derivable one; a null is allowed here (the eval-side check M enforces
        # "required-when-derivable" once the schema/synthesizer emit lands — the live gate does NOT require it, so it
        # cannot spuriously fail every run in the window before that emit merges).
        mos = d.get("margin_of_safety_pct")
        _base = next((s for s in scen if str(s.get("label","")).strip().lower() == "base"), None)
        bfv = _base.get("price_target") if isinstance(_base, dict) else None
        if _isnum(mos):
            if _isnum(ep) and ep and _isnum(bfv) and bfv:
                cmos = (bfv-ep)/bfv*100.0
                _mflip = (abs(mos) > 0.25 and abs(cmos) > 0.25 and (mos > 0) != (cmos > 0))
                if abs(mos-cmos) > max(1.0, abs(cmos)*0.05) or _mflip: viol.append(f"margin_of_safety_pct={mos} != (base FV − price)/base FV={round(cmos,2)}")
            else:
                viol.append("margin_of_safety_pct present but not re-derivable — no base-labelled scenario price_target")
        elif mos is not None:
            viol.append(f"margin_of_safety_pct={mos!r} is present but not a number")
    except Exception as e: viol.append(f"scenarios[] unparseable: {e}")
elif d.get("expected_return_pct") is not None:
    viol.append("expected_return_pct is set but scenarios[] is missing — the math cannot be re-derived")
if d.get("entry_price") is None and not re.search(r"(price|not assessable|paper trade)", (d.get("notes") or "").lower()):
    viol.append("entry_price is null but notes do not flag the missing/indicative price (margin of safety must be Not assessable)")
for k in ("confidence_score", "data_sufficiency_score"):
    v = d.get(k)
    # [review fix r3481332826] mirror eval.py check E (numeric hygiene, always-apply): a present-but-non-numeric
    # score (e.g. the JSON string "75") must FAIL CLOSED. The old test only caught numeric-out-of-range, so a
    # string score slipped past BOTH this loop and the _isnum-guarded edge gate below and printed GATE: PASS —
    # while eval check E rejects the same record post-commit. bool is excluded (eval isnum excludes it too).
    if v is not None and not _isnum(v):
        viol.append(f"{k}={v!r} is present but not a number — eval check E requires a numeric /100 score; a non-numeric value fails closed (PROVISIONAL)")
    elif _isnum(v) and not (0 <= v <= 100): viol.append(f"{k}={v} outside 0–100")
# check Y — §11 data-sufficiency ↔ decision cap (always-apply; mirrors eval.py check Y).
# A conviction decision on thin data ships as confidently as one on strong data — the synthesizer is
# instructed to enforce this cap, but without a gate the instruction has no teeth.
def _isdate(s):  # mirrors eval.py isdate(): a non-string / malformed value fails closed (False) instead of crashing the ship gate
    try: datetime.date.fromisoformat(s); return True
    except Exception: return False
_CONVICTION = {"Strong Buy", "Buy", "Starter Position Only", "Short Candidate"}
# [review fix r3479582220] a truthy non-string `decision` (list/dict) is coerced to "" so the membership
# tests below (`dec in _CONVICTION` / `dec in _ABOVE_STARTER`, both against sets) can never raise
# TypeError: unhashable type and crash the ship path — the same fail-closed treatment already given to
# edge_proof / decision_date. A present-but-non-string decision is malformed and FAILS CLOSED (PROVISIONAL),
# never a crash and never a silent PASS.
_dec = d.get("decision"); dec = _dec if isinstance(_dec, str) else ""; ds = d.get("data_sufficiency_score")
if _dec is not None and not isinstance(_dec, str):
    viol.append(f"decision={_dec!r} is not a string — §18 requires one of the allowed decision strings; a non-string decision is malformed and fails closed (PROVISIONAL)")
if _isnum(ds):
    if ds < 30 and dec != "Insufficient Data — Refuse To Rate":
        viol.append(f"data_sufficiency_score={ds} < 30 (§11 insufficient) but decision={dec!r} — §18 requires 'Insufficient Data — Refuse To Rate'")
    elif 30 <= ds < 50 and dec in _CONVICTION:
        viol.append(f"data_sufficiency_score={ds} in 30–49 (§11 weak) but decision={dec!r} is conviction — §11 caps at Watchlist; conviction requires score ≥ 50")
elif dec in _CONVICTION:
    viol.append(f"data_sufficiency_score absent/non-numeric ({ds!r}) but decision={dec!r} is conviction — §11 requires a /100 sufficiency score")
# check V — §7 edge gate; forward-looking from 2026-06-15; mirrors ALL THREE eval.py check-V conditions.
# (1) edge_score, when present, must be 0–100; (2) a claimed edge (edge_score ≥ 50) needs a non-empty,
# falsifiable edge_proof; (3) confidence >60 requires a proven edge — restated consensus is not an edge.
# A non-string decision_date or non-string edge_proof fails closed (PROVISIONAL), never crashes the ship path.
ddte = d.get("decision_date")
# B2 mirror (eval.py:607-609, always-apply): decision_date must be a real ISO date. _isdate() stops a malformed
# truthy date from crashing the §7/§14 forward gates, but a missing/invalid date must still FAIL CLOSED here —
# eval B2 rejects it post-commit, so flag it rather than silently skip the gates and print PASS.
if not _isdate(ddte):
    viol.append(f"decision_date={ddte!r} is not a valid ISO date (YYYY-MM-DD) — eval B2 requires a real date; the §7/§14 forward-looking gates cannot be evaluated without it")
if _isdate(ddte) and ddte >= "2026-06-15":
    es = d.get("edge_score"); _ep = d.get("edge_proof"); ep = _ep.strip() if isinstance(_ep, str) else ""; cf = d.get("confidence_score")
    if es is not None and not (_isnum(es) and 0 <= es <= 100):
        viol.append(f"edge_score={es!r} not a 0–100 number — §7 edge gate")
    if _isnum(es) and es >= 50 and not ep:
        viol.append(f"edge_score={es} ≥50 but edge_proof empty/non-string — a proven edge needs a falsifiable test (§7)")
    if _isnum(cf) and cf > 60 and not (_isnum(es) and es >= 50 and ep):
        viol.append(f"confidence_score={cf} >60 but edge not proven (edge_score={es!r}, edge_proof={'set' if ep else 'empty'}) — §7 edge gate: confidence >60 requires edge_score ≥ 50 + non-empty edge_proof")
# check Z — §14 thesis_type enum + external-variable conviction cap; forward-looking from 2026-06-21;
# mirrors ALL of eval.py eval_z_thesis_type_cap: an empty array, or an off-enum / non-string / wrong-casing
# value, FAILs (it breaks thesis-type calibration); and an external-variable thesis with no proven edge must
# not carry a conviction rating above 'Starter Position Only'. [review fix r3479582208] a present-but-non-list
# thesis_type (e.g. the string "Macro-conditional"), AND an absent/null thesis_type [review fix r3481332820],
# FAIL CLOSED here: eval schema check B (thesis_type ∈ REQ ∩ ARRAYS) rejects a missing/null/non-list value
# post-commit, so the gate must not skip the §14 cap and print PASS on a record eval fails.
if _isdate(ddte) and ddte >= "2026-06-21":
    tt = d.get("thesis_type"); es_z = d.get("edge_score")
    _ENUM = {"Company-specific", "Sector-cycle", "Macro-conditional", "Policy-conditional",
             "Commodity-conditional", "FX / rates", "Liquidity / positioning", "Governance turnaround",
             "Balance-sheet survival", "Pair trade / hedge", "Insufficient data"}
    _EXTERNAL = {"Macro-conditional", "Policy-conditional", "Commodity-conditional", "FX / rates", "Liquidity / positioning"}
    _ABOVE_STARTER = {"Strong Buy", "Buy", "Short Candidate"}
    if not isinstance(tt, list):
        viol.append(f"thesis_type={tt!r} is absent or not a list — CLAUDE.md §14 requires an array classification and eval schema check B (thesis_type ∈ REQ ∩ ARRAYS) rejects a missing/null/non-list thesis_type; the §14 external-variable cap cannot be evaluated on a mis-typed value")
    elif isinstance(tt, list):
        _unknown = [t for t in tt if not isinstance(t, str) or t not in _ENUM]
        if not tt:
            viol.append("thesis_type is empty — CLAUDE.md §14 requires every thesis to classify itself as one of the closed-set types (e.g. 'Insufficient data')")
        elif _unknown:
            viol.append(f"thesis_type contains value(s) not in the CLAUDE.md §14 closed enum: {_unknown} — use exact canonical strings (case-sensitive)")
        elif any(t in _EXTERNAL for t in tt) and dec in _ABOVE_STARTER and not (_isnum(es_z) and es_z >= 50):
            viol.append(f"thesis_type={tt} includes external-variable type(s) but edge_score={es_z!r} <50 and decision={dec!r} exceeds 'Starter Position Only' — §14 cap")
# check AI tail — post-split two-number confidence; forward-looking from 2026-07-11; mirrors the post-split
# block of eval.py check AI. The split (scripts/confidence.py) makes conviction/analysis_confidence REQUIRED
# numeric /100 fields and forces confidence_score == conviction (the §7 edge gate above + eval both read
# confidence_score). Without this, a live run can print GATE: PASS and commit a decision_record — DATA that
# goes straight to main per §28, bypassing PR CI — whose split fields are missing / out-of-range / stale,
# only to fail a later manual eval. This is the ONLY gate on that DATA, so mirror the check here.
if _isdate(ddte) and ddte >= "2026-07-11":
    cv = d.get("conviction"); au = d.get("analysis_confidence"); cf_s = d.get("confidence_score")
    for _f, _v in (("conviction", cv), ("analysis_confidence", au)):
        if not _isnum(_v):
            viol.append(f"post-split run (>=2026-07-11): {_f}={_v!r} must be a number from scripts/confidence.py — a null/absent value means the scorer did not run")
        elif not (0 <= _v <= 100):
            viol.append(f"post-split run: {_f}={_v} outside 0–100 (§12 — all scores are 0–100)")
    if _isnum(cv) and not _isnum(cf_s):
        viol.append(f"post-split run: conviction={cv} set but confidence_score={cf_s!r} is null — set confidence_score=conviction (backward-compat; the §7 gate + eval read confidence_score)")
    elif _isnum(cv) and _isnum(cf_s) and abs(float(cf_s)-float(cv)) > 0.5:
        viol.append(f"post-split run: confidence_score={cf_s} must equal conviction={cv} (backward-compat; the §7 gate reads confidence_score, so a split lets an unproven high-conviction thesis ship)")
# check AC/AD/AE/AF — §24 rejector-filter conviction caps (live pre-publish; mirrors eval.py
# checks AC/AD/AE/AF via scripts/rating_caps.py, the shared detection module). Until this block
# existed, these caps — CLAUDE.md §24 Filters 1/2/4/5/6, made explicit in synthesizer.md's Rating
# Cap Rules — were enforced only by prose instruction to the synthesizer (Pre-Write Gate 4A) plus
# a POST-HOC eval.py check nobody was required to run before commit. EMAAR_2026-07-03 is a live,
# currently-committed proof of the hole: its management-governance synthesis fired RF-OWN-004
# (§24 Filter 6, unaligned controlling owner) and the published decision was "Starter Position
# Only" — one notch above the doctrine's own "maximum Watchlist" cap — undetected until a later
# manual `/research:eval` run, and even then only advisory (the run lacks RUN_METADATA.md). This
# block closes that hole for every future run, standalone rerun included (rerun.md Step 8A runs
# this file verbatim), the same way the checks above already close it for §7/§11/§14.
sys.path.insert(0, "scripts")
import rating_caps as rc
def _read_orb(mod_dir, pat):
    # Resolve each §24 input to the SAME file eval.py's checks read (its `_read_synth_text` uses
    # `99_*-synthesis.md`, `_read_specialist_text` the `NN_*.md` specialist), so the live gate and the
    # retrospective grader can never see different text for the same run.
    gg = glob.glob(os.path.join(run, mod_dir, pat))
    if not gg: return None
    try:
        with open(gg[0], encoding="utf-8") as f: return f.read()
    except Exception: return None
_bm_txt = _read_orb("business-model", "99_*-synthesis.md")
_bq_txt = _read_orb("business-model", "07_*.md")
_mg_txt = _read_orb("management-governance", "99_*-synthesis.md")
_track_txt = _read_orb("management-governance", "01_*.md")
_tt24 = d.get("thesis_type"); _es24 = d.get("edge_score")
if rc.eval_ac_turnaround_cap(dec, ddte, _tt24) == "fail":
    viol.append(f"thesis_type={_tt24!r} includes '{rc.TURNAROUND_TYPE}' but decision={dec!r} exceeds the cap "
                f"(synthesizer.md Rating Cap Rules: max 'Starter Position Only' for turnaround thesis "
                f"without ≥2–3 yrs delivered inflection; CLAUDE.md §24 Filter 2)")
viol.extend(rc.eval_ad_filter_4_6_cap(dec, ddte, _bm_txt, _mg_txt) or [])
viol.extend(rc.eval_ae_filter5_cap(dec, ddte, _bm_txt, _es24, _bq_txt) or [])
viol.extend(rc.eval_af_filter1_integrity_cap(dec, ddte, _mg_txt, _track_txt) or [])
# check AQ — §13 cross-module forensic-mosaic conviction cap (live pre-publish; mirrors eval.py check
# AQ via scripts/rating_caps.py, same shared detection module as AC/AD/AE/AF above). Mechanizes
# synthesizer.md Pre-Write Gate step 4B's "3+ distinct forensic tags across 2+ modules compound into
# a single High accounting-integrity flag" mosaic check for the earnings, balance-sheet-survival, and
# management-governance modules (RF-EQ-001/002, RF-OBS-001, RF-DISC-001/002, RF-REG-002).
_aq_synth = {
    "earnings": _read_orb("earnings", "99_*-synthesis.md"),
    "balance-sheet-survival": _read_orb("balance-sheet-survival", "99_*-synthesis.md"),
    "management-governance": _mg_txt,  # already read above; same file, avoid a duplicate glob/read
}
_aq_spec = {
    "earnings": _read_orb("earnings", "06_*.md"),
    "balance-sheet-survival": _read_orb("balance-sheet-survival", "05_*.md"),
    "management-governance": _read_orb("management-governance", "06_*.md"),
}
viol.extend(rc.eval_aq_forensic_mosaic_cap(dec, ddte, _aq_synth, _aq_spec) or [])
# checks AI/AK — Headline Scorecard reconciliation + red-flag severity reconciliation (live
# pre-publish; mirrors eval.py checks AI/AK via scripts/headline_checks.py, the shared detection
# module — same pattern as rating_caps.py above). Until this block existed, these two checks
# existed ONLY as post-hoc eval.py checks nobody was required to run before commit, and both
# defect classes have already shipped to `main` clean: TMCV_2026-06-07/final_thesis.md's Headline
# Scorecard read "Expected return +4.3%" while its own decision_record.json carried
# expected_return_pct=-4.4 (AI's defect class — the scenario-math block above only re-derives
# decision_record.json's INTERNAL consistency, it never opens final_thesis.md to check the PROSE
# a reader actually sees); AMZN_2026-07-10/final_thesis.md ships with its earnings module
# declaring 2 Critical red flags while decision_record.json's red_flags array carries zero
# Critical entries and the Headline Scorecard's 'Rating cap' cell explicitly denies one exists —
# a direct CLAUDE.md §13 violation (AK's defect class). Both sat undetected until a later manual
# `/research:eval` run. This block closes that hole for every future run, standalone rerun
# included (rerun.md Step 8A runs this file verbatim), the same way the block above already
# closes it for §24.
import headline_checks as hc
_thesis_text_ak = open(ft, encoding="utf-8").read()
_module_texts_ak = {}
for _sp in glob.glob(os.path.join(run, "*", "99_*-synthesis.md")):
    _mod = os.path.basename(os.path.dirname(_sp))
    try:
        with open(_sp, encoding="utf-8") as _f: _module_texts_ak[_mod] = _f.read()
    except Exception: pass
viol.extend(hc.eval_ai_headline_reconciliation(ddte, d, _thesis_text_ak) or [])
viol.extend(hc.eval_ak_red_flag_severity_reconciliation(ddte, d, _thesis_text_ak, _module_texts_ak) or [])
# AP valuation-summary lever-sidecar integrity (pre-publish; SAME pure core as eval.py check AP, via
# scripts/valuation_summary_checks.py). valuation_summary.json is §25 DATA that reaches main WITHOUT CI, so
# a malformed or decision_record-contradicting sidecar would drive the cockpit Playground with levers that
# disagree with the committed thesis before the retrospective eval ever runs — stamp PROVISIONAL now.
# Soft-presence: a run that emits no sidecar is N/A, never a violation.
import valuation_summary_checks as vsc
_vs_path = os.path.join(run, "valuation", "valuation_summary.json")
if os.path.exists(_vs_path):
    # soft-presence is only for an ABSENT file; a present-but-unreadable/invalid sidecar is an integrity
    # failure (else a truncated JSON would collapse to None and PASS the gate, shipping a broken lever set).
    try: _vs_sidecar = json.load(open(_vs_path, encoding="utf-8"))
    except Exception as _e: viol.append(f"valuation_summary.json exists but is not readable/valid JSON ({_e}) — integrity failure, not soft-absence")
    else: viol.extend(vsc.eval_ap_valuation_summary_integrity(_vs_sidecar, d) or [])
# checks AT/AU/AV — §10 scenario-span check, sign-check presence, §10 conjunction-disclosure check
# (live pre-publish; mirrors eval.py checks AT/AU/AV via scripts/scenario_integrity_checks.py, the
# same shared-detection-module pattern as rating_caps.py / headline_checks.py / valuation_summary_checks.py
# above). Until this block existed, these three were post-hoc eval.py checks nobody was required to run
# before commit — the exact hole already closed for §24/§13/AI/AK/AP. The defect class is the CLAUDE.md
# §10 worked example itself: AMZN_2026-07-10 shipped a scenario set (bull +3.6% / base -11.9% / bear
# -38.7%) that summed to 100% and reconciled perfectly (the scenario-math block above would have PASSED
# it), yet its best case sat inside one ordinary week's move — no case in the set contained the good
# quarter that actually happened, and the stock closed 15% up two days later, above the entire
# distribution (AT). That same bull case needed four conditions to hold at once with no written basis
# for why they would move together (AV). And the thesis headlined a margin story the engine's own
# margin-drivers module contradicted, with no line anywhere recording the disagreement (AU). All three
# sat undetected until a later manual `/research:eval` run. This block closes that hole for every future
# run, standalone rerun included (rerun.md Step 8A runs this file verbatim), the same way the blocks
# above already close it for §24/§13/AI/AK/AP.
# [PR#427 review fix] idempotent banner: ALWAYS strip any prior finish-gate banner first, computed HERE
# (before AT/AU/AV run) rather than after, and reused both for the write-back below AND as the AU input.
# A retry on a thesis that previously failed AU still carries the generated PROVISIONAL banner, whose own
# violation TEXT contains the phrase "SIGN CHECK" ("the thesis records no SIGN CHECK against...") — the
# presence-only AU regex would match that banner wording and report the check as satisfied even though the
# underlying thesis body never added a real sign-check line. Stripping first closes that false-pass.
body = _thesis_text_ak
lines = body.split("\n"); i = 0
while i < len(lines) and lines[i].strip() == "": i += 1
if i < len(lines) and lines[i].startswith(">") and "PROVISIONAL — the automated finish-gate" in "\n".join(lines[i:i+6]):
    while i < len(lines) and lines[i].startswith(">"): i += 1      # drop the old blockquote banner
    while i < len(lines) and lines[i].strip() == "": i += 1        # and its blank separator
    body = "\n".join(lines[i:])
import scenario_integrity_checks as sic
# [PR#427 review fix] gate applicability uses the LIVE execution date, not `ddte` (decision_date). A
# rerun mutates the latest EXISTING run folder rather than creating a new one (rerun.md §3), and
# decision_date is pinned to that folder's original YYYY-MM-DD suffix (synthesizer.md's decision_date
# row) — it never advances on rerun. Gating AT/AU/AV on `ddte` would make them permanently N/A for every
# rerun of a run folder dated before the AT_DATE/AU_DATE/AV_DATE rollout, defeating the point of wiring
# them into the LIVE, pre-publish gate: they exist to check what ships on THIS execution, not to re-judge
# when the thesis was first decided (that retrospective distinction stays correct in eval.py, which grades
# already-committed history and must keep using the true decision_date to avoid retroactively flagging
# pre-rollout runs).
_live_date = datetime.date.today().isoformat()
viol.extend(sic.eval_at_scenario_span(_live_date, scen) or [])
viol.extend(sic.eval_au_sign_check_recorded(_live_date, body) or [])
viol.extend(sic.eval_av_conjunction_disclosure(_live_date, scen) or [])
if viol:
    banner = ("> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**\n> "
              + "; ".join(viol) + "\n>\n> Resolve the flagged issue(s) before relying on these numbers — see each violation above for the required action. (CLAUDE.md §7/§10/§11/§13/§14/§21; finish-gate.)\n\n")
    open(ft, "w", encoding="utf-8").write(banner + body)
    print("GATE: PROVISIONAL — " + "; ".join(viol))
else:
    open(ft, "w", encoding="utf-8").write(body)   # write back the cleaned thesis (strips any now-stale banner)
    print("GATE: PASS — scenario math, score ranges, §11 data-sufficiency cap, §7 edge gate, §14 external-variable cap, §24 Filter 1/2/4/5/6 rejector-filter caps, §13 cross-module forensic-mosaic cap, Headline Scorecard reconciliation (§10/§21), red-flag severity reconciliation (§13), §10 scenario-span + conjunction-disclosure checks, and sign-check presence all satisfied")
PY
```

Record the printed `GATE:` line for step 11 ("Integrity gate") and step 13 (report). A `PROVISIONAL` result must be surfaced loudly in the report — it is never silently dropped.

### 10B.2 — Integrity audit + red-team (deeper, LLM)

The diagnostic pass is paid work too. Cross its first-writer-wins boundary before dispatching any audit:

```bash
python3 scripts/research_paid_completion.py diagnostic-seal <RUN_ROOT>
python3 scripts/research_paid_completion.py diagnostic-plan <RUN_ROOT>
```

The seal snapshots the exact post-10B.1 thesis/decision bytes and reserves the next append-only version for
all three audit kinds. For `input_state: ready`, dispatch only audit rows with `action: run`, using each
row's exact `next_output_path`; `action: reuse` is a canonical, strict-schema report whose identity, paths,
conclusion invariants, and two input SHA-256 bindings match the diagnostic snapshots. The three kinds are:

- **Verify-evidence** — follow `.claude/commands/research/verify-evidence.md`; every rating-driver number is
  traced to the pool and scenario/EV math reconciled.
- **Pre-mortem** — follow `.claude/commands/research/pre-mortem.md`; adversarial red-team that can only hold
  or lower conviction.
- **Expectations-gap** — follow `.claude/commands/research/expectations-gap.md`; independent §7 edge check,
  rather than trusting the synthesizer's self-graded variant perception.

Produce only each report JSON at the planned path and skip every command's commit step. The missing kinds
may run concurrently. After they return, rerun `diagnostic-plan`; retry only an individual still-invalid
kind once at its newly planned path, never its successful siblings. A newer malformed canonical version is
authoritative for recovery classification; never fall back to an older valid version. While `input_state`
is `ready`, then require:

```bash
python3 scripts/research_paid_completion.py diagnostic-require-complete <RUN_ROOT>
```

If recovery reports `input_state: transformed` or `transform_incomplete`, the fsynced transform intent
already binds the exact diagnostic reports and staged outputs; dispatch no diagnostic Task, skip the
ready-state `diagnostic-require-complete` command, and continue with `diagnostic-transform` below. Unknown
live bytes never qualify for either state and are a hard stop.

### 10B.3 — Deterministic audit propagation and edge stamps

Apply the pre-mortem haircut/rating-cap propagation, truth-integrity PROVISIONAL merge, and expectations-gap
§7 PROVISIONAL merge through the shared deterministic helper:

```bash
python3 scripts/research_paid_completion.py diagnostic-transform <RUN_ROOT>
```

This command reproduces the required F28/F28b/F30/F-EG rules: it derives a missing self-reported haircut
from the confidence delta; preserves the original decision while applying the `TERMINAL` pre-mortem set to
the additive `post_mortem_decision` / `post_mortem_basket` cap fields; treats every verification result
outside Clean/Minor issues as unverified; and stamps a high-confidence thesis when independent expectations
work says the edge is None/Weak or not exploitable. It prints and returns the exact `RATING-CAP:`, `HAIRCUT:`,
`GATE-VERIFY:`, and `GATE-EXPECTATIONS:` lines for steps 11 and 13.

Before either live file is replaced, the helper deterministically renders both outputs from the immutable
diagnostic snapshots + exact report hashes, writes/fsyncs content-addressed output snapshots, and atomically
writes an intent binding every allowed input/output SHA. A crash may therefore leave only an enumerated
input/output combination, which the same command finishes model-free. Any other live bytes are preserved
and fail closed; there is no blind restore.

### 10B.3-prewrite — Validate decision-guidance routes before sealing

For a fresh, still-unsealed run, validate the exact final `decision_record.json` against the versioned
data-needs contract and today's self-discovered research orb roster:

```bash
python3 scripts/eval.py --data-needs-prewrite "<RUN_ROOT>/decision_record.json"
```

On `DATA-NEEDS-PREWRITE: FAIL`, STOP before 10B.3A, manifest creation, admission, or commit. Fix the
unsealed decision record by rerunning the synthesizer; do not delete a valid need just to pass. This gate
is deliberately creation-time only. A sealed/recovery path never regrades an immutable historical route
against today's mutable roster.

After the visible prewrite pass, durably checkpoint the exact transform intent, diagnostic report hashes,
derived thesis/decision hashes, and prewrite result:

```bash
python3 scripts/research_paid_completion.py diagnostic-checkpoint <RUN_ROOT>
```

The checkpoint command runs `eval.py --data-needs-prewrite` itself and refuses to write on failure; prompt
ordering alone is not completion proof. It binds the validator digest and the exact derived decision SHA in
its fsynced receipt. On recovery a valid checkpoint is historical creation-time authority and is not
regraded against a later mutable orb roster.

### 10B.3A — Final immutable audit set

The propagation and provisional-stamp steps above mutate `decision_record.json` and/or `final_thesis.md`
after the first audit pass. Therefore the earlier reports are diagnostic history, not admission authority.
First cross the durable final-pass boundary:

```bash
python3 scripts/research_paid_completion.py audit-seal <RUN_ROOT>
```

This first-writer-wins seal records the exact final `final_thesis.md` and `decision_record.json` SHA-256
digests and reserves, per audit kind, the minimum next append-only version. It prevents a same-byte
diagnostic report from being mistaken for the required final pass. When the diagnostic protocol exists,
`audit-seal` itself requires the exact transform/prewrite checkpoint; it cannot be crossed by prompt order
or by three merely well-shaped diagnostic reports. If a valid seal already exists (the
`final_audit_recovery` path), the helper returns `status: existing`; any digest/identity mismatch is a hard
stop. From this point until projection-manifest creation, do not run haircut propagation, a provisional
stamp, synthesis, a deterministic gate writer, or any other writer over the two sealed inputs.

Then compute the exact paid-work plan:

```bash
python3 scripts/research_paid_completion.py audit-plan <RUN_ROOT>
```

For each of `verification`, `pre_mortem`, and `expectations_gap`:

- `action: reuse` means the **latest canonical version** is at or above its reserved final version and
  passes the shared manifest-grade validator: canonical 1.0 schema, exact ticker/run identity, exact
  repo-relative thesis/decision paths, exact lowercase SHA-256 bindings to both sealed files, and the
  kind-specific conclusion invariants. Do not dispatch that paid Task.
- `action: run` means only that kind is missing/stale/invalid. Follow its command file
  (`verify-evidence.md`, `pre-mortem.md`, or `expectations-gap.md`) and bind it to the plan's exact
  `next_output_path`; skip the command's commit step. Required kinds may be issued together in one message
  so they run concurrently. Never overwrite or delete an older report.

After the required Tasks return, rerun `audit-plan`. If a newly returned kind is still `action: run`, its
output is not completion proof; retry only that individual kind once at the newly reported
`next_output_path`. If it remains invalid/missing, STOP before projection rather than paying for the
already-valid sibling kinds again. A newer malformed/stale canonical version always wins for recovery
classification: never fall back to an older valid version. This preserves the projection manifest's
fail-closed latest-version semantics.

Finally require the complete exact set:

```bash
python3 scripts/research_paid_completion.py audit-require-complete <RUN_ROOT>
python3 scripts/research_paid_completion.py projection-require-complete <RUN_ROOT>
```

These final audit conclusions are authoritative even when adverse: the admission freezer uses the
pre-mortem verdict/cap and expectations-gap quality/exploitability/edge score directly. A malformed,
missing, stale-input, or internally inconsistent final audit makes this gate and manifest creation fail
closed. A crash after any one of the three reports is recovered by its own validated report; only the
remaining audit kinds launch again. `projection-require-complete` is the shared pre-promotion contract for
the orchestrator and server recovery: exit 0 plus JSON `status: complete` proves the diagnostic checkpoint
(when journaled), final input seal, and all three exact final reports. No report-presence heuristic may
replace it.

---

### 10B.4 — Final idea re-projection and immutable admission

The preliminary assessment predates the pre-mortem and expectations-gap audits. It must never remain a
`Buy` after those gates lower the standing decision, and a later clean verification must never backdate a
forecast after its result is visible. First pin the final on-disk record, then re-project and freeze once.

Create the first-writer-wins post-audit manifest:

```bash
python3 scripts/create_idea_projection_manifest.py <RUN_ROOT>
```

It pins the exact bytes of `final_thesis.md`, `decision_record.json`, the canonical verification report,
pre-mortem, and expectations-gap audit. It also requires `decision_record.ticker` and `decision_date` to
match the ticker/date encoded by `<RUN_ROOT>` exactly. For a journaled run, manifest creation additionally
requires the valid diagnostic checkpoint, `final_audit_inputs.json`, and a complete receipt-valid final
trio; a crash-time promoter can never promote the diagnostic trio alone. An internally consistent audit
set cannot bless the wrong listing or dated cohort. If it fails, record `IDEA-ADMISSION: error` with the exact manifest
error and STOP before market capture, final re-projection, parse/schema replacement, the freezer, or
derived-output recovery. A missing/invalid projection seal cannot honestly become `not_applicable`.
Preserve the failed run bytes and start a genuinely new dated run; never repair the audit/decision in
place and retry this dated projection. Once creation succeeds, none of the pinned artifacts may be edited.
A changed audit or decision artifact requires a new dated run, never an overwrite of the manifest or a
mutation followed by retry. Unless `projection_sealed` recovery already returned `promoted`, `complete`,
or `schema_valid` for a final wrapper, run `python3 scripts/research_paid_completion.py projection-arm
<RUN_ROOT>`, require `status: armed|existing`, and capture its exact `<PROJECTION_OUTPUT_PATH>`. The fsynced
attempt binds the raw manifest bytes and raw canonical preliminary-wrapper bytes and creates one unique
contained staging path. Never derive that path yourself.

After manifest creation succeeds, dispatch one final Task call only when the recovery state is the exact
preliminary wrapper; an already final/promoted recovery skips directly to the canonical parse/schema gate.

- `subagent_type: "synthesizer"`
- User message:

  > Final idea re-projection only. CANONICAL_RUN_ROOT is `<RUN_ROOT>` and the only assessment write target
  > is the exact helper-returned `<PROJECTION_OUTPUT_PATH>`. A digest-valid post-audit
  > `idea_projection_manifest.json` already exists. Do not edit the thesis, decision record, module
  > outputs, audit files, or manifest. Re-read the manifest-pinned standing/post-mortem decision and final
  > integrity state, including the final pre-mortem and expectations-gap conclusions. Normalize
  > `research.edge_score` to the lower of the decision-record and expectations-gap scores. Any final
  > pre-mortem non-survival/rating cap or expectations-gap result without a Moderate/Strong proven
  > exploitable edge is a binding hard cap; copy the exact canonical reason defined in
  > `frameworks/ideas/README.md`. Run the canonical `--write-idea-evidence` command against the canonical
  > root (the market snapshot remains canonical), then write the reconciled candidate or honest
  > `not_assessable` result only to `<PROJECTION_OUTPUT_PATH>` under
  > `frameworks/ideas/README.md`. A candidate must carry the manifest digest and exact decision authority:
  > set the replacement wrapper's `created_at` (and a candidate's `created_at`) to this final projection
  > time, no earlier than the manifest's `created_at`; never retain the preliminary wrapper's pre-manifest
  > timestamp. Then carry
  > `decision_date`; stable scenario ids, conditions, sources, probabilities and conjunction bases; the
  > exact `idea_valuation_bridge`, whose `source_horizon_days` equals `scenario_horizon_days`; and one
  > machine-resolvable forecast selected by
  > `forecast_id`, including its dates, source, metric/threshold, causal steps, and bullish/bearish triggers.

After it returns, run `python3 scripts/research_paid_completion.py projection-recover <RUN_ROOT>`. It
requires the canonical preliminary bytes still to equal the attempt, validates the unique staged output,
and fsyncs an exact promotion intent before the one-file canonical rename. A parse/schema-invalid staged
regular file is attempt-owned: the helper preserves its digest, writes the deterministic minimal
`not_assessable` fallback using the attempt timestamp, and promotes that instead. If the Task wrote no
staged output, `preliminary_armed` permits at most one retry to the same exact output path; otherwise any
error is a hard stop. It never replaces malformed or changed canonical bytes. Only after `promoted` /
`complete`, run the canonical parse and JSON Schema checks:

```bash
python3 -m json.tool <RUN_ROOT>/idea_3_6m.json >/dev/null
python3 scripts/validate_screener_json.py frameworks/ideas/idea-assessment.schema.json <RUN_ROOT>/idea_3_6m.json
```

If the promoted canonical file now fails either check, the durable promotion/completion authority or live
bytes were damaged. STOP and preserve it; never hand-repair canonical output. Once both checks pass,
invoke the locked first-writer freezer exactly once:

```bash
python3 scripts/freeze_idea_admission.py <RUN_ROOT>
```

That one command performs the complete manifest, market, decision-authority, integrity, and timestamp
reconciliation and atomically writes immutable `<RUN_ROOT>/idea_admission.json` under the same directory
lock. Treat `admitted` (exit 0), `not_admitted` (exit 3, with gaps), and `not_applicable` (exit 0) as
completed outcomes. A complete candidate can honestly fail the later policy ranker and still be admitted
by this semantic freezer; do not weaken it merely to force qualification. Any exception, `error`, unreadable
result, or unexpected exit is a validator failure: report it and do not mutate or retry the assessment.

There is deliberately no non-writing semantic preview. Once the command exposes a gate result, the same
locked operation has already frozen it, so a crash cannot leave a visible rejection that recovery later
re-projects. A crash before the atomic rename leaves no completed gate; a crash after it is recovered only
through the `admission_sealed` branch. A non-admission is an honest result and does not abort the research
run, but it must be reported with its gaps. Never delete or overwrite any frozen result after a later audit;
only a new dated run may make a new ex-ante forecast.

Record `IDEA-ADMISSION: admitted|not_admitted|not_applicable|error` plus the specific gaps for step 11 and
step 13. The live Ideas board and outcome loop consume only a digest-valid `admitted` snapshot; they never
reconstruct history from a mutable assessment or current verification report.

---

## 10C. Generate the memo and audit dossier from final state

Only now execute the complete deferred procedure in step 10A (10A.0, 10A.1, and 10A.2). The memo planner
reuses only exact receipt-backed module/top-level memo outputs and reruns missing/invalid targets
individually. Continue to rebuild the deterministic audit dossier mechanically on every pass; it is cheap,
contains no paid inference, and still excludes memo/receipt files. This is deliberately after final
re-projection and admission, so no derived output can freeze or present the preliminary Ideas state as
final.

---

## 11. Update RUN_METADATA.md (final)

Rewrite `<RUN_ROOT>/RUN_METADATA.md` via the Write tool to fill in the placeholder sections. Read the current file first, then issue a single Write call with the full new content. (This command does not have access to the Edit tool — see the `allowed-tools` frontmatter.) **Derive every status below from the ACTUAL on-disk artifact set — glob the run folder — NOT from in-run tracking (fix F07).** On a resume / second completion pass the in-run state is stale, and the metadata must describe *what actually shipped* (a TMCV run once recorded "aborted, synthesizer skipped" while a complete `final_thesis.md`, `memo.md`, `decision_record.json`, and module syntheses were present on disk). Concretely: "Modules completed" = the modules whose `<RUN_ROOT>/<module>/99_*-synthesis.md` exists on disk; "Synthesizer status" = test `final_thesis.md` on disk; same for memo / dossier. **Guard:** if `final_thesis.md` exists you may NOT write "skipped/aborted" for the synthesizer — re-derive from disk. Fill in:

- "Modules completed": list (one per line)
- "Modules aborted": list with brief note per entry (one per line)
- "Synthesizer status": `succeeded` (if `final_thesis.md` exists), `failed` (if it does not), or `skipped (all modules aborted)`
- "Memo status": `succeeded` only if the final `memo-plan` reports the `top-level` target as
  `action: reuse` (an exact output + receipt), `failed` if the file/receipt pair is absent or invalid, or
  `skipped (no final thesis)`
- "Audit dossier status": `succeeded` (if `audit_dossier.md` exists), `failed`, or `skipped (no final thesis)`
- "3–6 month idea assessment": `candidate — admitted`, `candidate — not admitted (<reason>)`,
  `not_assessable`, `error (<admission validator reason>)`, `invalid (final schema gate failed)`, or
  `skipped (no final thesis)`, derived from the final step-10B.4 artifact/admission snapshot — never from
  whether the Ideas UI happens to be populated
- "Integrity gate": the step-10B result — the `GATE: PASS|PROVISIONAL|ERROR` line from 10B.1, the verify-evidence verdict and the pre-mortem verdict / any confidence haircut from 10B.2, and the `GATE-EXPECTATIONS: PASS|PROVISIONAL` line from 10B.3 (e.g. `PASS; verify-evidence: Verified; pre-mortem: Survives (confidence 70→64); expectations-gap: PASS`). If 10B was skipped because no `final_thesis.md` exists, write `skipped (no final thesis)`.
- "Publication": write the exact line `ready for one path-confined commit` only after every final gate,
  audit, immutable projection, memo, and dossier step above has finished. This line is the terminal producer
  seal used for crash-safe publication recovery; never write it to a partial or pre-audit run.

---

## 12. Commit and push to main

Per repo `CLAUDE.md` git policy: commit straight to `main`. No branches. No PRs.

First drop any stale failure note — the run has now completed, so a break-time `RUN_FAILURE.md` (written by the server if an earlier attempt of this run broke) must NOT ride along in the success commit:

```
rm -f "<RUN_ROOT>/RUN_FAILURE.md"
```

Commit through the serialized helper (it holds a global git lock so concurrent companies don't collide on `.git/index.lock`, commits only this run folder, and pushes):

```
bash scripts/commit-run.sh "Research run: <TICKER> <DATE>" -- "<RUN_ROOT>/"
```

The helper prints `COMMIT_SHA=<sha>` on success, or `NOOP=1` if nothing was staged. Capture and report that SHA. Do not rewrite `RUN_METADATA.md` after the commit: the saved Git commit itself is the authority, and avoiding a circular SHA backfill removes a second failure window in which a complete call could remain private to one machine.

---

## 13. Report

Print a final summary to the user containing:

- Number of modules discovered and their names
- Per-module status: `completed` / `aborted (fail-fast at <agent>)` / `aborted (failures: <names>)`
- Whether the master synthesizer ran and whether `final_thesis.md` exists
- The final `<RUN_ROOT>/idea_3_6m.json` plus step-10B.4 admission status (`candidate — admitted`,
  `candidate — not admitted` with gaps, honest `not_assessable`, `error` with the validator reason, or
  invalid with the schema error); never describe a missing/invalid/unadmitted artifact as “none clear”
- **The integrity finish-gate result (step 10B):** the `GATE: PASS|PROVISIONAL` line, the verify-evidence verdict, any pre-mortem confidence haircut, and the `GATE-EXPECTATIONS:` result (10B.3). If any of these is `PROVISIONAL` or verify-evidence is `Failed`, say so prominently — the published thesis carries a PROVISIONAL banner and its numbers are not yet trusted.
- The three output tiers and their paths: `<RUN_ROOT>/memo.md` (~10-page colleague memo), `<RUN_ROOT>/final_thesis.md` (deep-dive thesis), `<RUN_ROOT>/audit_dossier.md` (full audit concatenation) — noting any that were skipped or failed
- The commit SHA pushed to `origin/main`

---

## Hard rules

- Do not hardcode any module name. Run order (step 4) and cross-module context (step 8A) are both derived from each module's `depends_on:` frontmatter — adding a module requires only its files plus its `depends_on` list, with zero edits to this orchestrator.
- Adding a new module — e.g. dropping `.claude/agents/valuation/` with specialists and a `99_valuation-synthesis.md` — must require zero changes to this orchestrator beyond optionally updating the ordering rule in step 4 if cross-module dependencies need it.
- Never invoke another slash command from within this command. The shared pipeline is followed *inline* via the instructions in `frameworks/MODULE_PIPELINE.md`; the standalone module commands at `.claude/commands/research/<module>.md` are NOT called.
- Exactly one path-confined run-artifacts commit per run. Per-module commits do not happen here.
