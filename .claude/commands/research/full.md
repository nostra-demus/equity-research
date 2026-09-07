---
description: Run the full equity research workflow on a ticker. Self-discovers modules from .claude/agents/*/99_*-synthesis.md and dispatches each module's pipeline, then the master synthesizer.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the master orchestrator for a self-discovering multi-module equity research workflow. The ticker is `$ARGUMENTS`.

This orchestrator:
1. Discovers modules dynamically (does not hardcode `business-model` / `earnings` / any future module).
2. Writes `RUN_METADATA.md` before any module runs.
3. Runs each module's pipeline inline, using the shared pipeline defined in `frameworks/MODULE_PIPELINE.md`.
4. Continues past per-module fail-fast aborts; aborts the whole run only if **every** module aborts.
5. Invokes the master synthesizer once all modules finish, completes the integrity audits and immutable Ideas admission, then generates two derived output tiers beside the deep-dive thesis — a ~10-page plain-English colleague `memo.md` and a deterministic, lossless `audit_dossier.md` (every agent and sub-agent output concatenated). Three tiers from one run: memo (share) → `final_thesis.md` (deep dive) → `audit_dossier.md` (audit everything).
6. Makes **two** commits on `main` per run (per repo `CLAUDE.md` git policy: one run-artifacts commit, then one metadata-backfill commit that fills in the commit SHA of the first one). Per-module commits do NOT happen under this orchestrator — they only happen when a module command is invoked standalone.

Execute the applicable steps below in order. The only skips are the explicit sealed-recovery routes in
step 3A; they protect immutable research rather than weakening the workflow.

---

## 1. Resolve the run date

For a cockpit Continue, read `NOSTRA_CONTINUATION_RUN_ROOT`, require it to equal
`analyses/${ARGUMENTS}_YYYY-MM-DD`, require that exact path to be a real existing directory (not a symlink),
and derive `<DATE>` from its suffix. Do not call `date` or choose a newer folder. For an ordinary new run,
run `date +%Y-%m-%d`. Capture one `<DATE>` and keep it unchanged everywhere below.

Also capture `<STARTED_AT>` from `date -u +%Y-%m-%dT%H:%M:%SZ` for the metadata file.

---

## 2. Bind and verify the data pool

Treat `data/$ARGUMENTS/` as `<LOGICAL_DATA_PATH>`, the stable citation label. Resolve `<DATA_PATH>` before
reading any evidence:

- If `NOSTRA_FROZEN_EVIDENCE_ROOT` is set, require the complete supervisor binding:
  `NOSTRA_FROZEN_POOL_DATA_PATH`, `NOSTRA_FROZEN_POOL_OUT_DIR`,
  `NOSTRA_FROZEN_POOL_GENERATION`, and `NOSTRA_FROZEN_EVIDENCE_ROOT`. This is an isolated,
  supervisor-verified read capability. Do not run `extract_pool.py`, rebuild the extraction, or inspect
  the live data/original extraction paths in this mode. Set
  `<GENERATION_ROOT>` to
  `$NOSTRA_FROZEN_POOL_OUT_DIR/.extract-generations/$NOSTRA_FROZEN_POOL_GENERATION` and `<DATA_PATH>` to
  `$NOSTRA_FROZEN_EVIDENCE_ROOT`; require that evidence root to equal the verified generation manifest's
  `raw_prefix` inside that exact generation. In frozen mode, never list, stat, grep, open, or otherwise read
  `<LOGICAL_DATA_PATH>` or the original `<RUN_ROOT>/_pool_extracts/` tree — they are outside the capability,
  and there is no live-pool fallback.
- Otherwise set `<DATA_PATH>` to `<LOGICAL_DATA_PATH>` for the normal standalone workflow.

Check that the resolved `<DATA_PATH>` exists and contains at least one file. If it is missing or empty, STOP.
Tell the user: "No data found for `$ARGUMENTS`. Populate the Drive folder for this ticker and re-run." Do not
proceed to any later step. Every later reference to the data pool means `<DATA_PATH>`; citations still use
logical `data/$ARGUMENTS/...` labels.

---

## 3. Create the run root folder

For a cockpit Continue, capture the already-validated `NOSTRA_CONTINUATION_RUN_ROOT` as `<RUN_ROOT>` and
do not create or switch folders. Otherwise create and capture `analyses/${ARGUMENTS}_<DATE>` as before:

```
mkdir -p "analyses/${ARGUMENTS}_<DATE>"
```

Every module and the master synthesizer writes inside this one folder. Use `${ARGUMENTS}_<DATE>` (with
braces) in Bash to avoid the `$ARGUMENTS_<DATE>` shell-parse ambiguity.

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
  synthesis, deterministic stamps, or audits. Skip to step 10B.4 and classify the assessment before doing
  anything else:
  - a schema-valid final `candidate`, newly timestamped no earlier than the manifest, may continue directly
    to parse/schema/freezer only when its canonical market snapshot exists and matches the manifest;
  - a schema-valid final `not_assessable` wrapper, newly timestamped no earlier than the manifest and no
    longer carrying the exact preliminary pending-manifest gap, continues directly to parse/schema/freezer.
    It does not require a market snapshot: snapshot unavailability may be the honest final gap;
  - only the exact preliminary `not_assessable` wrapper with its pre-manifest timestamp and no market
    snapshot may run the final re-projection Task; and
  - any other combination records `IDEA-ADMISSION: error`, preserves the bytes, and requires a new dated run.
  Under the atomic sequence in step 10B.4, any completed semantic gate already has
  `idea_admission.json`; if that file appears at any point, stop this branch and restart under
  `admission_sealed` rather than re-projecting.
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
ls -1d analyses/${ARGUMENTS}_* 2>/dev/null | sort -r | grep -v "^analyses/${ARGUMENTS}_<DATE>$" | head -n 1
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

- ticker: $ARGUMENTS
- run_date: <DATE>
- started_at: <STARTED_AT>
- orchestrator: /research:full
- repo_sha: <REPO_SHA>
- data_folder: data/$ARGUMENTS/ (logical citation label)
- evidence_root: <DATA_PATH>
- evidence_generation: <GENERATION_ROOT or standalone-pending>
- prior_run: <PRIOR_RUN>

## Source files

<one line per file from the resolved `<DATA_PATH>`; never inspect the live logical path in frozen mode>

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

## Commit SHA

(filled in at end of run)
```

---

## 8. Run each module sequentially

**This step is RESUMABLE.** A re-launched run reuses every module a prior attempt already finished, so a run broken by a plan-limit pause, a dropped connection, or a reboot picks up where it stopped instead of redoing paid work. A fresh run has an empty run root, so nothing is skipped and the whole pipeline runs. (The server's per-module chaining seeds the same skip from disk; this keeps the monolithic path consistent.)

For each module in `<MODULES_PLANNED>` (in the order from step 4):

- **Already finished? Skip it.** If `<RUN_ROOT>/<MODULE>/99_<MODULE>-synthesis.md` exists and is non-empty (`test -s`), this module completed in a prior attempt. When `NOSTRA_MEMORY_MODE=enforced`, first discover that module's analytical files and run `frameworks/MEMORY_RUNTIME.md` Step 4 for every expected output; skip the module only when every exact byte set returns `attested: true`. Otherwise enter the shared pipeline, which reuses each individually attested output and dispatches only the missing/unattested work. In `shadow`, record missing receipts without widening the paid scope. Treat a fully reusable module as completed for the cross-module context of later modules (8A), and move to the next module. (A partial, half-written module — anything short of a non-empty `99_<MODULE>-synthesis.md` — is NOT trusted: re-run it.)

### 8A. Build cross-module context

Build `<CROSS_MODULE_CONTEXT>` for this module from its `depends_on` list (captured in step 4), naming only dependencies that **completed in this run root** (whether just run, or reused from a prior interrupted attempt — same run folder either way):

1. For each module name `<dep>` in this module's `depends_on`, check whether `<RUN_ROOT>/<dep>/99_<dep>-synthesis.md` exists (i.e. it is finished in this run root).
2. For each `<dep>` that completed, produce the sentence: `<Dep> cross-module path: <RUN_ROOT>/<dep>/.` — where `<Dep>` is the dependency name with its first letter capitalized (`business-model` → `Business-model`, `earnings` → `Earnings`). This is the label format every dependent agent parses.
3. Join the sentences with a single space to form `<CROSS_MODULE_CONTEXT>`.
4. If this module has no `depends_on`, or none of its dependencies completed in this run, set `<CROSS_MODULE_CONTEXT>` to the literal string `none`.

**Important:** always use the **current run's** paths, never an older run's. Do not fall back to `ls analyses/${ARGUMENTS}_*/<dep>/ | sort -r | head -n 1` here — that is the standalone commands' behavior. Within a `/research:full` run the current run's path is the only correct value, and a dependency that aborted in this run is simply omitted (or yields `none` if it was the only dependency).

### 8B. Invoke the shared pipeline

Follow every step in `frameworks/MODULE_PIPELINE.md` with these inputs:

- `<TICKER>` = `$ARGUMENTS`
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

Before the Task call, compile and append the `master/synthesizer` packet and declaration obligations from
`frameworks/MEMORY_RUNTIME.md`. In enforced mode, compilation failure stops before paid dispatch.

Dispatch a single Task call:

- `subagent_type: "synthesizer"`
- User message:

  > Synthesize the analyses in <RUN_ROOT>/. Output the final thesis to <RUN_ROOT>/final_thesis.md.

Wait for it to complete. Treat the synthesizer as failed if `<RUN_ROOT>/final_thesis.md` does not exist when it returns.
After the normal file check passes, attest the returned declaration with agent key `master/synthesizer`
and output `final_thesis.md` under `frameworks/MEMORY_RUNTIME.md`. An enforced attestation failure stops
before any idea assessment, audit, projection, or admission step. The later post-seal final idea
re-projection is memory-blind because it is a publication-integrity writer, not a new analytical pass.

**10.0 — Preliminary idea-assessment existence and schema gate (forward runs only).** If the thesis exists,
the same synthesizer must also have written `<RUN_ROOT>/idea_3_6m.json`. This is an early completeness
check only. Step 10B.4 re-projects it from the post-audit decision and is the only version eligible for
immutable admission. Run:

`python3 scripts/validate_screener_json.py frameworks/ideas/idea-assessment.schema.json <RUN_ROOT>/idea_3_6m.json`

- The preliminary result must be `not_assessable` with `candidate: null` and must name the pending
  post-audit projection manifest/canonical market evidence. Canonical market evidence cannot be written
  before the manifest, so a preliminary `candidate` is a production defect even when it passes JSON
  Schema. Replace it with the minimal honest `not_assessable` wrapper for this run and the gap
  `"Pending post-audit projection manifest and canonical market evidence."`, then rerun the validator.
  Do not run `--write-idea-evidence`, upgrade it, or reach into an older run to fill the board.
- If the file is missing, write one minimal `idea-assessment/v1` wrapper for THIS run with
  `status: "not_assessable"`, `candidate: null`, and the single gap `"Master synthesizer did not emit the required 3–6 month assessment."`; use the current ticker/run root, company `null`, current UTC time, and stable assessment id `<TICKER>-<DATE>-3-6m`. Then rerun the validator. This fallback records the production defect without inventing an idea.
- If a present file fails schema validation, do not call it healthy and do not silently repair its
  candidate. Record `invalid (schema gate failed)` for step 11 and surface the validator errors in step 13.

---

## 10A. Memo and audit-dossier procedure (DEFERRED until after 10B.4)

**Do not execute any 10A substep at this point.** Keep this procedure as the canonical generation
instructions, but execute it only when step 10C invokes it after the final idea re-projection and atomic
semantic admission. This ordering prevents `memo.md`, module memos, or
`audit_dossier.md` from freezing the preliminary idea state.

When step 10C invokes this procedure, run it only if `<RUN_ROOT>/final_thesis.md` exists (the synthesizer succeeded). If the synthesizer was skipped because every module aborted, skip the procedure entirely and record both tiers as `skipped (no final thesis)` in step 11.

These are the other two tiers of the run, written **beside** `final_thesis.md` so the step-12 commit (`git add "analyses/${ARGUMENTS}_<DATE>/"`) picks them up automatically — no extra commit:

- `memo.md` — the ~10-page, plain-English colleague memo (the shareable tier).
- `audit_dossier.md` — the deterministic, lossless concatenation of every artifact in the run (the audit tier).

### 10A.0 — Module memos (deferred batch, LLM, via the `module-memo-writer` agent)

In a full run the per-module memos were deferred from step 8 (Step 4.9A was skipped) so they don't pause the pipeline ~2.5 min after each module. When step 10C invokes this procedure, generate them from the final post-admission artifact set. They are leaf outputs nothing else reads.

For **every** module folder `<RUN_ROOT>/<module>/` that has a `99_*-synthesis.md`, dispatch a `module-memo-writer` Task — **regenerate unconditionally**; do NOT skip a module just because a `<module>_memo.md` already exists. Derived memos are deliberately outside the sealed admission set and a recovery may have left one partial or stale. The module synthesis itself is never rewritten after sealing. **Issue all of these Task calls in a single message so they run concurrently** — the memos are independent, so batched they cost about one memo's time, not the sum of six. For each such module the user message is:

> Read `<RUN_ROOT>/<module>/99_<...>-synthesis.md` and write the module memo to `<RUN_ROOT>/<module>/<module>_memo.md`. Condense only what the synthesis already carries — do not add new analysis, numbers, or evidence, and do not change its verdict, scores, or caps. The saved file must start with its `#` header and contain no chat-confirmation block. Do not write any other file and do not run git.

Best-effort: a module memo that fails to write is recorded as `failed` for that module but never aborts the run (the `99_*-synthesis.md` is the module's decision of record). Order does not matter versus the audit dossier (10A.2), which already excludes `*_memo.md`.

### 10A.1 — Memo (LLM, via the memo-writer agent)

Dispatch a single Task call:

- `subagent_type: "memo-writer"`
- User message:

  > Read <RUN_ROOT>/final_thesis.md and <RUN_ROOT>/decision_record.json and write the ~10-page colleague memo to <RUN_ROOT>/memo.md.

Wait for it to complete. If `<RUN_ROOT>/memo.md` does not exist when it returns, record the memo as `failed` in step 11 — but do **NOT** fail the run. The memo is a derived convenience tier; `final_thesis.md` is the decision of record.

### 10A.2 — Audit dossier (deterministic, no LLM)

The audit dossier is a mechanical, lossless concatenation — never an LLM rewrite — so nothing can be omitted or paraphrased. Build it with this Bash step. It is read-only on every run artifact, writes only `audit_dossier.md`, is best-effort, and must never abort the run:

```bash
RUN_ROOT="analyses/${ARGUMENTS}_<DATE>" python3 - <<'PY'
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

Run this via Bash. It re-derives the §10 scenario math from `decision_record.json` (same identities as `eval` harness check M), the missing-price / score-range caps, the §11 data-sufficiency ↔ decision cap (check Y), the §7 edge gate (check V), the §14 external-variable conviction cap (check Z), the §24 rejector-filter conviction caps — Filters 1/2/4/5/6 (checks AC/AD/AE/AF, via `scripts/rating_caps.py`) — the §13 cross-module forensic-mosaic conviction cap (check AQ, via `scripts/rating_caps.py`) — the §16 Sector Cycle Reality Test compounding cap on the valuation module's own stated confidence score (check BB, via `scripts/rating_caps.py`) — the Headline Scorecard ↔ decision_record.json reconciliation, the Decision Audit Trail structural check, and red-flag severity reconciliation (checks AI/AJ/AK, via `scripts/headline_checks.py`) — the §10 scenario-span check, sign-check presence gate, and §10 conjunction-disclosure check (checks AT/AU/AV, via `scripts/scenario_integrity_checks.py`) — the §10 HARD GATE 13 probability-basis presence/form check on every probability-bearing `scenarios[]`/`forecast_ledger[]` row (check BC, same module) — HARD GATE 11's kill-criteria trigger-test schema presence, that every `kill_criteria[]` row carries `comparable_basis` and `fired_last_two_periods` (check BA, same module) — and the §8 bear-case / bull-case sanity checks, that a Selected/conviction long's bear-labelled scenario is a genuine loss and a Short Candidate's bull-labelled scenario is a genuine loss to the short (checks AM/AR, same module). Prepends a PROVISIONAL banner to `final_thesis.md` if any inconsistency is found:

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
# check BB — §16 Sector Cycle Reality Test compounding cap (live pre-publish; mirrors eval.py check
# BB via scripts/rating_caps.py, same shared detection module as AC/AD/AE/AF above). Mechanizes
# valuation/MODULE_RULES.md's Sector Cycle Reality Test compounding rule (CLAUDE.md §16): when
# 02_multiples-own-history AND 03_relative-valuation-peers both flag their reference point
# cycle-elevated/depressed in the SAME direction (standalone RF-VAL-001/RF-VAL-002 tags), their
# agreement is one shared sector cycle counted twice, not independent corroboration — 99's own
# stated "Valuation confidence /100" must not exceed 55. Unlike AC/AD/AE/AF/AQ, this caps a NUMERIC
# score parsed from 99_valuation-synthesis.md's own text, not the decision enum, so it is checked
# unconditionally here (not folded into `viol.extend(... or [])` against `dec`).
_v02_txt = _read_orb("valuation", "02_*.md")
_v03_txt = _read_orb("valuation", "03_*.md")
_v99_txt = _read_orb("valuation", "99_*-synthesis.md")
# [PR#629 review fix] gate BB on the LIVE execution date, not `ddte` (decision_date). A /research:rerun
# mutates the existing run folder and its decision_date stays pinned to that folder's original
# pre-BB_DATE YYYY-MM-DD suffix (synthesizer.md) — it never advances on rerun. Passing `ddte` would make
# BB permanently N/A on the ordinary rerun path even when 02/03 freshly emit RF-VAL-001/002 (they run
# under today's prompts) and 99 states a confidence above 55, silently bypassing the very cap this check
# exists to enforce (CLAUDE.md §11: caps are applied, never silently overridden). This mirrors the exact
# AT/AU/AV `_live_date` precedent below; retrospective eval.py check BB correctly keeps the true
# decision_date. Defined here (first live-gate use) and reused by the AT/AU/AV block below.
_live_date = datetime.date.today().isoformat()
viol.extend(rc.eval_bb_sector_cycle_compounding_cap(_live_date, _v02_txt, _v03_txt, _v99_txt) or [])
# check BD — §16 Cost-of-Capital Reality Test escalation (live pre-publish; mirrors eval.py check BD
# via scripts/rating_caps.py, same shared detection module as BB above). Mechanizes
# valuation/MODULE_RULES.md's Cost-of-Capital Reality Test escalation rule (CLAUDE.md §16): when
# 04_intrinsic-dcf's model WACC is presumed wrong (>~3pp below a scope-matched disclosed rate, or
# below ~two-thirds of the market-implied rate), the agent must name which of the three allowed
# escalation branches — (a) rebuild, (b) re-run at the scope-matched rate, (c) mark a labelled
# cross-check — it took, via the standalone `RF-VAL-003` tag (§3A). An untagged/unnamed escalation is
# a structural defect the same class as BB's untagged sector-cycle flag: uses `_live_date`, the same
# rerun-safe reasoning as BB just above (rerun.md Step 8A runs this file verbatim; decision_date stays
# pinned on a rerun so gating on it would make this check permanently N/A on the ordinary rerun path).
_v04_txt = _read_orb("valuation", "04_*.md")
viol.extend(rc.eval_bd_cost_of_capital_reality_test(_live_date, _v04_txt) or [])
# check BE — §15 driver-attribution residual, earnings decomposition/bridge (live pre-publish; mirrors
# eval.py check BE via scripts/rating_caps.py, same shared detection module as BB above). Mechanizes
# earnings/MODULE_RULES.md's Driver Attribution rule (CLAUDE.md §15): 02_revenue-drivers.md §6a and
# 03_margin-drivers.md §7a must each declare, as a standalone RF-EARN-001/RF-EARN-002 tag, either the
# reconciled explained/residual/total figures (arithmetically verified here) or a stated reason the
# decomposition/bridge was not possible — never silently omitted. Unlike BB, this is a structural
# completeness check, not a conditional-trigger cap: tag absence itself is a violation whenever the
# specialist ran. Uses the same `_live_date` as BB above, for the identical rerun reason (a
# /research:rerun's decision_date stays pinned to the run's original pre-BE_DATE suffix).
_e02_txt = _read_orb("earnings", "02_*.md")
_e03_txt = _read_orb("earnings", "03_*.md")
viol.extend(rc.eval_be_driver_attribution_residual(_live_date, _e02_txt, _e03_txt) or [])
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
# module — AJ, the Decision Audit Trail structural check, is wired in right below this block
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
# check AJ — Decision Audit Trail structural check (live pre-publish; mirrors eval.py check AJ via
# scripts/headline_checks.py, the same shared module as AI/AK above, reusing the already-loaded
# `_thesis_text_ak`). CLAUDE.md §8/§22 require the Part II "Decision Audit Trail" table — the
# per-decision-driver bull/bear adjudication, "which side wins and why" — but until now that was
# enforced only by synthesizer.md prompt instruction (Step 5), with NO mechanical check that a run
# actually ships it present and populated. A synthesizer could regress to an empty or token table
# (the exact "summarize, don't adjudicate" failure §22 warns against) and nothing before this would
# catch it. AJ existed in eval.py since 2026-07-10 but, like AM/AR before this same fix, was never
# moved into an importable module, so the live gate could never call it — a thesis could ship with
# no Decision Audit Trail section (or one with blank adjudication cells), print `GATE: PASS`, and
# commit straight to `main` (CLAUDE.md §25/§28), undetected until a later manual `/research:eval`
# run. Moving it into headline_checks.py (see that module) closes that hole the same way it was
# already closed for AI/AK. Uses `ddte`, matching how AI/AK are gated on this same line above (not
# `_live_date`) — AJ_DATE, like AI_DATE/AK_DATE, predates every run old enough for a rerun-on-stale-
# decision_date edge case to matter in practice.
viol.extend(hc.eval_aj_decision_audit_trail(ddte, _thesis_text_ak) or [])
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
# pre-rollout runs). `_live_date` is defined once in the BB cap block above (first live-gate use) and
# reused here — the same execution-date rationale, one source of truth.
viol.extend(sic.eval_at_scenario_span(_live_date, scen) or [])
viol.extend(sic.eval_au_sign_check_recorded(_live_date, body) or [])
viol.extend(sic.eval_av_conjunction_disclosure(_live_date, scen) or [])
# check BC — §10 HARD GATE 13 probability-basis presence/form (live pre-publish; mirrors eval.py check
# BC via the same scenario_integrity_checks.py module as AT/AU/AV above). synthesizer.md §8/§9 already
# instruct every probability in the Scenario Model, Risk Register, and Forecast Ledger to state its
# basis as `empirical (n=X over {window})` / `base rate: {class, source}` / `judgment` — this was, until
# now, a mandatory HARD GATE enforced by nothing: no schema field, no check, in either decision_record.json
# array that structurally carries a probability. Same gap class check BA closed for HARD GATE 11's
# kill-criteria triggers. Uses `_live_date` for the same reason AT/AU/AV do (a rerun re-checks what SHIPS
# on this execution, not when the thesis was first decided).
viol.extend(sic.eval_bc_probability_basis_stated(_live_date, scen, d.get("forecast_ledger")) or [])
# check BA — HARD GATE 11 kill-criteria trigger-test schema presence (live pre-publish; mirrors
# eval.py check BA via the same scenario_integrity_checks.py module as AT/AU/AV/BC above). Every
# kill_criteria[] row must carry comparable_basis (the like-for-like period/basis the trigger is
# measured against) and fired_last_two_periods (bool) — HARD GATE 11's "capable of failing" test.
# check BA has graded committed runs retrospectively since 2026-08-22, but — unlike AT/AU/AV/BC —
# it was defined only inside scripts/eval.py, so the live gate could never call it: a run could
# ship a kill_criteria[] row missing either field, print GATE: PASS, and commit straight to `main`
# (CLAUDE.md §25/§28), undetected until a later manual `eval.py` run. Moving the function into
# scenario_integrity_checks.py (see that module) closes the same hole already closed for
# §24/§13/AI/AK/AP/§10 above, for the one remaining check that had it. Uses `_live_date` for the
# same reason AT/AU/AV/BC do (a rerun re-checks what SHIPS on this execution, not when the thesis
# was first decided).
#
# check BA (companion) — kill_criteria CONTAINER presence (live pre-publish). eval_ba below returns
# N/A (None) for an absent / null / empty / non-list kill_criteria, EXACTLY as its retrospective twin
# does: eval.py defers those shapes to schema check B (kill_criteria ∈ REQ ∩ ARRAYS — a present list)
# and check P (disconfirmation: "a thesis needs at least one falsification trigger"). But the live gate
# mirrors NEITHER B nor P for kill_criteria, so without this guard an absent / null / [] / non-list
# kill_criteria (a whole thesis with NO falsification trigger) sails past eval_ba's `or []` and prints
# GATE: PASS — the §8 / HARD GATE 11 hole check BA exists to close, left open for the one shape BA is
# deliberately silent on. Faithful to check P's `_kc_text`, MINUS one thing: a plain-string row OR a
# {condition,...} object row with a RECOGNIZED trigger field counts as present; a list of only-blank
# entries counts as empty. Gated on SCEN_DATE via `_live_date`, exactly as check P is gated on ddte and
# AT/AU/AV/BC/BA are gated live.
#
# [Codex P1 fix] deliberately does NOT mirror check P's arbitrary-string-value fallback
# (`" ".join(str(v) for v in k.values() if isinstance(v, str))`). A row can legitimately carry OTHER
# string fields that are not the trigger condition itself — comparable_basis (HARD GATE 11's own
# like-for-like basis text) being the concrete case: `{"comparable_basis": "...", "fired_last_two_periods":
# true}` satisfies eval_ba's schema-presence check below but states no kill condition at all. The old
# fallback would grab comparable_basis's string value as if it were the trigger text and count the row
# present, so a thesis with a fully-formed BA schema and zero stated falsification trigger could still
# print GATE: PASS. Requiring one of the seven RECOGNIZED trigger fields closes that — the row must name
# what invalidates the thesis, not merely carry BA's two bookkeeping fields.
_BA_SCEN_DATE = "2026-06-08"   # eval.py SCEN_DATE — check P's forward-looking floor for the disconfirmation gate
def _kc_present_text(k):        # mirrors eval.py check P's _kc_text, minus the arbitrary-string fallback (see above)
    if isinstance(k, str): return k.strip()
    if isinstance(k, dict):
        for f in ("condition", "criterion", "trigger", "what_invalidates", "kill_criterion", "description", "text"):
            v = k.get(f)
            if isinstance(v, str) and v.strip(): return v.strip()
    return ""
if _isdate(_live_date) and _live_date >= _BA_SCEN_DATE:
    _kc_live = d.get("kill_criteria")
    if not isinstance(_kc_live, list) or not [t for t in (_kc_present_text(k) for k in _kc_live) if t]:
        viol.append("kill_criteria is absent/empty/non-list — §8 disconfirmation / HARD GATE 11 requires at least "
                    "one falsification trigger; the live gate had no kill_criteria-presence check, so an omitted/empty "
                    "array printed GATE: PASS (mirrors eval.py schema check B + check P)")
viol.extend(sic.eval_ba_kill_criteria_trigger_test(_live_date, d.get("kill_criteria")) or [])
# checks AM/AR — §8 bear-case / bull-case sanity (live pre-publish; mirrors eval.py checks AM/AR
# via scripts/scenario_integrity_checks.py, the same shared module as AT/AU/AV/BC/BA above).
# CLAUDE.md §8 requires every thesis to state "the strongest bear case" (and, by the same
# disconfirmation standard applied to a short, the strongest bull case) — a "bear" scenario that
# is itself a GAIN never actually tested that requirement. The named worked failure:
# EMAAR_2026-07-03 published a "Starter Position Only" conviction long whose bear-labelled
# scenario carried a price_target ABOVE entry_price (bear +63.9%, no capital loss) — a Selected
# thesis that had never priced a genuine loss scenario, undetected until a later manual
# `/research:eval` run, even though several OTHER checks (AF, AT/AU/AV) were built and wired into
# this same live gate specifically in response to that same EMAAR run. AM/AR existed in eval.py
# since 2026-07-17 / 2026-07-25 but, unlike AT/AU/AV/BC/BA, were never moved into this importable
# module, so the live gate could never call them — a Selected long could ship with an all-upside
# "bear" case (or a Short Candidate with an all-downside "bull" case), print `GATE: PASS`, and
# commit straight to `main` (CLAUDE.md §25/§28), undetected until a later manual eval.py run.
# Moving them here (see scenario_integrity_checks.py) closes that hole the same way it was
# already closed for §10/HARD GATE 11/HARD GATE 13. Uses `_live_date` for the same reason
# AT/AU/AV/BC/BA do — a rerun re-checks what SHIPS on this execution, not when the thesis was
# first decided.
viol.extend(sic.eval_am_bear_case_sanity(_live_date, dec, scen, d.get("entry_price")) or [])
viol.extend(sic.eval_ar_short_bull_case_sanity(_live_date, dec, scen, d.get("entry_price")) or [])
if viol:
    banner = ("> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**\n> "
              + "; ".join(viol) + "\n>\n> Resolve the flagged issue(s) before relying on these numbers — see each violation above for the required action. (CLAUDE.md §7/§10/§11/§13/§14/§21; finish-gate.)\n\n")
    open(ft, "w", encoding="utf-8").write(banner + body)
    print("GATE: PROVISIONAL — " + "; ".join(viol))
else:
    open(ft, "w", encoding="utf-8").write(body)   # write back the cleaned thesis (strips any now-stale banner)
    print("GATE: PASS — scenario math, score ranges, §11 data-sufficiency cap, §7 edge gate, §14 external-variable cap, §24 Filter 1/2/4/5/6 rejector-filter caps, §13 cross-module forensic-mosaic cap, Headline Scorecard reconciliation (§10/§21), Decision Audit Trail structural check (§8/§22), red-flag severity reconciliation (§13), §10 scenario-span + conjunction-disclosure checks, sign-check presence, HARD GATE 13 probability-basis presence, and HARD GATE 11 kill-criteria presence + trigger-test schema all satisfied")
PY
```

Record the printed `GATE:` line for step 11 ("Integrity gate") and step 13 (report). A `PROVISIONAL` result must be surfaced loudly in the report — it is never silently dropped.

### 10B.1a — Remediate once, then re-gate (do NOT ship a fixable break)

The gate never aborts the run — a thesis is always produced — but "always produced" was never meant to mean "shipped broken without trying". Almost every violation 10B.1 emits is **mechanically fixable in one pass by the agent that wrote the numbers**: a recorded scenario level that disagrees with `forward_metric × multiple`, a missing SIGN CHECK line, an empty `joint_probability_basis` on a multi-condition scenario, a scorecard figure that does not match `decision_record.json`. Shipping those flagged is a choice, not a constraint.

So: **if 10B.1 printed `GATE: PROVISIONAL`, run exactly one remediation pass before continuing.**

Every Task in this remediation step rewrites an analytical decision artifact. Before each dispatch,
compile and append the exact agent packet and declaration obligations from `frameworks/MEMORY_RUNTIME.md`;
after the normal output checks pass, attest the new exact bytes under that agent's ordinary key
(`master/synthesizer` or `valuation/99_valuation-synthesis`). In `enforced` mode, any compile or
attestation failure stops before re-gating or committing. In `shadow`, record the missing/failed receipt
as usual. A pre-remediation attestation never authorizes rewritten bytes.

1. Split the verbatim violation list before any dispatch. A **BB violation** is one whose text starts
   `§16 Sector Cycle Reality Test compounding trigger fired`; every other entry is a **master-owned
   violation**. Pass only the master-owned list to `.claude/agents/synthesizer.md`. If that list is empty,
   skip this initial master pass. This exclusion is mandatory: the master does not own valuation `99`,
   and letting it react to BB before the module correction can change downstream scores from stale inputs.
   For a non-empty master-owned list, re-dispatch the master against the same `<RUN_ROOT>` with: *"The
   finish-gate rejected these specific numbers. Fix the underlying figures in `final_thesis.md` AND
   `decision_record.json` so they reconcile — do not restate the thesis, do not re-run modules, and do not
   weaken a threshold merely to clear a check. If a violation is genuinely not fixable from the available
   evidence (the input it needs does not exist in the pool), leave it and say in one line why it is
   unfixable."*

   - **Route BB only to the valuation owner.** BB reads the "Valuation confidence /100" stated in
     `<RUN_ROOT>/valuation/99_*-synthesis.md` (see `_read_orb("valuation", "99_*-synthesis.md")` in
     10B.1), not a value owned by the master. When the BB list is non-empty, first resolve its exact `99`
     path using the same glob. If no non-empty file exists, do not create a snapshot and do not dispatch
     valuation synthesis: the missing required input is not remediable in place, so leave BB PROVISIONAL
     for the second gate. Never regenerate a missing valuation module inside this finish-gate loop.

   - When the exact valuation `99` exists, save its bytes to a `mktemp` path outside `<RUN_ROOT>`, then
     re-dispatch `.claude/agents/valuation/99_valuation-synthesis.md` against the same run with: *"Both
     `02` and `03` flagged the same-direction sector-cycle distortion; per MODULE_RULES.md Score Cap Rules
     the combined base-case Valuation confidence is capped at 55. In the existing report, change only (1)
     the single Valuation confidence /100 line in the §1 Verdict block and (2) the single §4 Score Cap
     Application table row whose trigger begins `Sector Cycle Reality Test flags`, marking Applied? `Y`
     and recording the max-55 combined cap. Preserve every other byte: do not recompose the report,
     change its verdict, fair-value levels, other scores, evidence, sidecars, or any other file. If you
     genuinely believe the distortion is otherwise reconciled and the score should stand, leave both
     lines unchanged and say in one line why — that remains an honest PROVISIONAL."*

   - After the normal output check, enforce byte scope before attestation. In both saved and rewritten
     text, locate exactly one `Valuation confidence /100` line inside §1 and exactly one Markdown table
     row containing `Sector Cycle Reality Test flags`. Replace those two complete lines with distinct,
     identical sentinels in both copies. Also verify that the rewritten confidence is a whole score at or
     below 55 and that the rewritten cap row's Applied? cell is `Y`. If either copy has zero/multiple
     matches, either postcondition fails, or the sentinel-normalized bytes differ anywhere, atomically
     restore the saved original, delete the temporary file, do not attest, do not refresh derived tiers,
     and leave BB PROVISIONAL. Otherwise attest the new exact `99` bytes and delete the temporary file
     immediately. Only these two synchronized line changes are authorized.

   - If that scoped valuation correction succeeded, immediately refresh every derived valuation tier
     before the master consumes it: run `frameworks/MODULE_PIPELINE.md` Step 4.9B verbatim with
     `MODULE="valuation"` to rebuild `valuation_dossier.md`, and Step 4.9C to refresh labelled synthesis
     sidecars. A standalone `/research:rerun` also regenerates `valuation_memo.md` now with
     `module-memo-writer`; `/research:full` defers it to Step 10C, and a chained full rerun defers it to
     `/research:rerun` Step 9A. Then run one master propagation pass with: *"The valuation module synthesis
     lowered its stated Valuation confidence to the §16 compounding cap and marked that cap applied.
     Propagate the corrected score into `final_thesis.md`'s valuation chapter and into
     `decision_record.json` (module_scores plus any headline figure that echoes it) so the published
     outputs match the capped module file — do not re-run modules, restate the thesis, or change any other
     number."* Skip this propagation when valuation was absent, refused the correction, or failed the
     byte-scope guard. Without the derived-tier refresh and this post-module propagation, the second gate
     can pass while reader-facing outputs still carry the pre-cap score.
2. Re-run 10B.1 verbatim. Its banner logic is idempotent — it strips the old banner and re-stamps only what still fails.
3. Run this loop **once**. If violations remain after the second gate, ship PROVISIONAL with the remaining reasons; that is now an honest record of what could not be fixed rather than of what nobody tried to fix.

Record both gate lines (`GATE:` before and after) for step 13, plus which violations the remediation pass cleared.

### 10B.1b — Stamp the gate result into `decision_record.json` (so the flag cannot be lost)

The PROVISIONAL banner lives only at the top of `final_thesis.md`. Everything else downstream — the decision ledger, `/research:track`, the cockpit, the calibration harness, anyone reading `decision_record.json` directly — reads the record, sees clean numbers, and has no idea the engine flagged them. That is how a thesis the engine itself would not stand behind gets counted as a clean call. Close it by writing the verdict where the machines actually look:

```bash
python3 - <<'PY'
import json, os, re
RUN_ROOT = os.environ["RUN_ROOT"]
dr_path = os.path.join(RUN_ROOT, "decision_record.json")
ft_path = os.path.join(RUN_ROOT, "final_thesis.md")
if os.path.exists(dr_path):
    with open(dr_path, "r", encoding="utf-8") as f:
        d = json.load(f)
    reasons, status = [], "pass"
    if os.path.exists(ft_path):
        with open(ft_path, "r", encoding="utf-8") as f:
            head = f.read(4000)
        if "PROVISIONAL — the automated finish-gate" in head:
            status = "provisional"
            # the banner is one blockquote; reasons are '; '-joined on its second line
            m = re.search(r"^> ⚠️ \*\*PROVISIONAL[^\n]*\n> (.+?)\n>\n", head, re.S | re.M)
            # "; " is the exact inverse of the banner's '"; ".join(viol)' — do NOT split on a bare ";",
            # which would shred any violation whose own text contains one.
            if m: reasons = [r.strip() for r in m.group(1).replace("\n> ", " ").split("; ") if r.strip()]
    d["integrity_gate"] = {"status": status, "violations": reasons, "gate": "research:full step 10B"}
    with open(dr_path, "w", encoding="utf-8") as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
    print(f"GATE-STAMP: integrity_gate.status={status} ({len(reasons)} violation(s)) → decision_record.json")
else:
    print("GATE-STAMP: no decision_record.json — nothing to stamp")
PY
```

`integrity_gate` is additive, so existing readers are unaffected; any consumer that wants to distinguish a clean call from a flagged one now can. Run this AFTER 10B.1a's re-gate (and again after 10B.2's stamps, if those change the banner) so the recorded status matches the banner actually shipped.

### 10B.2 — Integrity audit + red-team (deeper, LLM)

Then run the two standing audits IN the ship path, so the no-source-no-claim and §8 disconfirmation guarantees are enforced rather than left optional:

- **Verify-evidence** — follow `.claude/commands/research/verify-evidence.md` against `<RUN_ROOT>`, producing `<RUN_ROOT>/verification_report.json` (every rating-driver number traced to the pool; scenario/EV math reconciled).
- **Pre-mortem** — follow `.claude/commands/research/pre-mortem.md` against `<RUN_ROOT>`, producing `<RUN_ROOT>/pre_mortem.json` (adversarial red-team; can only HOLD or LOWER conviction).

Produce ONLY the report JSON in each — **skip each command's own commit step**; full.md's step 12 commits the entire run folder (these reports included) in one place. Then:

**Haircut propagation — patch `decision_record.json` with the pre-mortem's verdict** (fix F28). Run this immediately after `pre_mortem.json` is written:

```bash
python3 - "<RUN_ROOT>" <<'PY'
import json, glob, os, re, sys
run = sys.argv[1]
dr_path = os.path.join(run, "decision_record.json")
# find the latest pre_mortem (versioned as _v2, _v3, ...)
pms = sorted(glob.glob(os.path.join(run, "pre_mortem*.json")),
             key=lambda x: int(re.search(r"_v(\d+)\.json$", x).group(1)) if re.search(r"_v(\d+)\.json$", x) else 1)
if not pms: print("HAIRCUT: no pre_mortem.json found — skipping"); sys.exit(0)
try:
    pm = json.load(open(pms[-1], encoding="utf-8"))
    dr = json.load(open(dr_path, encoding="utf-8"))
except Exception as e: print(f"HAIRCUT: read error ({e}) — skipping"); sys.exit(0)
rec_conf   = pm.get("recommended_confidence")
verdict    = pm.get("verdict") or ""
orig_conf  = dr.get("confidence_score")
def _isnum(x): return isinstance(x, (int, float)) and not isinstance(x, bool)
# DERIVE the haircut from the confidence delta this propagation exists to enforce — do NOT trust a
# possibly-null/zeroed self-reported `confidence_haircut` to decide whether a haircut happened. A null
# field paired with a lowered `recommended_confidence` is a REAL cut, and `… or 0` would silently bury it
# (writing confidence_haircut=0 while post_review_confidence_score reflects the real cut). Mirrors
# scripts/eval.py check S exactly, so full.md writes the same haircut the gate re-derives (fix F28).
pm_orig    = pm.get("original_confidence")
if not _isnum(pm_orig): pm_orig = orig_conf
haircut    = pm.get("confidence_haircut")
if not _isnum(haircut):
    haircut = (pm_orig - rec_conf) if (_isnum(pm_orig) and _isnum(rec_conf)) else 0
dr["confidence_haircut"]        = haircut
dr["pre_mortem_verdict"]        = verdict
dr["post_review_confidence_score"] = rec_conf
# Post-mortem rating-cap propagation — fix F28b.
# A terminal pre-mortem verdict ("Thesis broken" / "Does not survive — downgrade") means the thesis
# does not hold as a conviction position. The original `decision` and `basket` fields (the synthesizer's
# immutable call, locked to final_thesis.md) stay unchanged so eval check I still passes; we instead
# add the two new additive fields `post_mortem_decision` + `post_mortem_basket` that the calibration and
# track commands prefer when present (size already gates long-eligibility on the pre-mortem verdict
# directly, so it needs no separate basket override). Eval check U asserts these are set consistently.
TERMINAL = {"Thesis broken", "Does not survive — downgrade"}
orig_dec  = dr.get("decision") or ""
orig_bask = dr.get("basket")   or ""
if verdict in TERMINAL and orig_bask in ("Selected", "Short"):
    dr["post_mortem_decision"] = "Watchlist"
    dr["post_mortem_basket"]   = "Watchlist"
    print(f"RATING-CAP: terminal pre-mortem '{verdict}' on '{orig_dec}' ({orig_bask}) → post_mortem_decision=Watchlist")
else:
    dr["post_mortem_decision"] = orig_dec
    dr["post_mortem_basket"]   = orig_bask
    print(f"RATING-CAP: non-terminal or already-conservative pre-mortem ('{verdict}') — post_mortem_decision={orig_dec!r}")
with open(dr_path, "w", encoding="utf-8") as f:
    json.dump(dr, f, indent=2, ensure_ascii=False)
if isinstance(haircut, (int, float)) and haircut > 0:
    print(f"HAIRCUT: confidence {orig_conf} → {rec_conf} (−{haircut}pt) | pre-mortem: '{verdict}'")
else:
    print(f"HAIRCUT: no reduction (pre-mortem: '{verdict}'; confidence stays {orig_conf})")
PY
```

Record BOTH the `RATING-CAP:` and `HAIRCUT:` lines for step 11 ("Integrity gate"). If the pre-mortem applied a haircut and/or a rating cap, the RUN_METADATA integrity-gate entry should read e.g. `pre-mortem: Survives with haircut (confidence 70 → 64); RATING-CAP: non-terminal` or `pre-mortem: Thesis broken (confidence 65 → 20); RATING-CAP: terminal → post_mortem_decision=Watchlist`.

**Stamp the thesis PROVISIONAL on a missing or non-clean truth-integrity audit (finish-gate F30).** A `Failed` / `Material issues` verdict — OR a verify-evidence that did not run at all — must mark the published thesis UNVERIFIED, not merely be noted in step 13. This is the exact hole the TMCV 2026-06-14 run fell through: no `verification_report.json` was produced and the thesis shipped clean, so all of its citation/anchor/math defects went unflagged. Run this deterministic stamp AFTER verify-evidence + pre-mortem complete; it composes with the 10B.1 banner (merges reasons) and is idempotent across re-runs:

```bash
python3 - "<RUN_ROOT>" <<'PY'
import json, glob, os, re, sys
run = sys.argv[1]
ft = os.path.join(run, "final_thesis.md")
MARK = "PROVISIONAL — the automated finish-gate"
# Latest truth-integrity report (versioned _v2/_v3…). MISSING or NOT-clean => PROVISIONAL.
# Exact-name match only (verification_report.json or _v<n>), so an auxiliary like verification_report_summary_v2.json
# is NOT mistaken for a report version; then sort by VERSION NUMBER, not lexically, so _v10 lands after _v2.
_vn = lambda p: int(re.search(r"_v(\d+)\.json$", p).group(1)) if re.search(r"_v(\d+)\.json$", p) else 1
vrs = sorted([p for p in glob.glob(os.path.join(run, "verification_report*.json"))
              if re.fullmatch(r"verification_report(_v\d+)?", os.path.basename(p)[:-5])], key=_vn)
verify_reason = None
if not vrs:
    verify_reason = "truth-integrity audit did NOT run (no verification_report.json) — citations, anchors, and §10/§15 math are unverified"
else:
    try:
        v = json.load(open(vrs[-1], encoding="utf-8"))
        verdict = (v.get("verdict") or "").strip()
        # fail-CLOSED: anything that is not an explicit Clean / Minor-issues pass is PROVISIONAL —
        # that covers Material issues, Failed, AND any blank / Error / Aborted / schema-drift verdict.
        if verdict not in ("Clean", "Minor issues"):
            verify_reason = f"verify-evidence verdict = {verdict or '(blank/unknown)'} (not Clean/Minor — integrity {v.get('integrity_score')}/100, see {os.path.basename(vrs[-1])})"
    except Exception as e:
        verify_reason = f"verification_report.json unreadable ({e}) — truth-integrity not confirmed"
# Strip any existing finish-gate banner (from 10B.1), recover its reasons, merge, re-stamp (idempotent).
reasons, body = [], open(ft, encoding="utf-8").read()
lines = body.split("\n"); i = 0
while i < len(lines) and lines[i].strip() == "": i += 1
if i < len(lines) and lines[i].startswith(">") and MARK in "\n".join(lines[i:i+6]):
    blk = []
    while i < len(lines) and lines[i].startswith(">"): blk.append(lines[i]); i += 1
    while i < len(lines) and lines[i].strip() == "": i += 1
    body = "\n".join(lines[i:])
    # Keep 10B.1's freshly-derived math reasons; DROP any stale verify-reason (re-derived below) so re-runs don't accumulate.
    if len(blk) >= 2:
        reasons = [r.strip() for r in blk[1].lstrip("> ").split(";")
                   if r.strip() and not any(t in r for t in ("verify-evidence", "truth-integrity audit", "verification_report"))]
if verify_reason and verify_reason not in reasons: reasons.append(verify_reason)
if reasons:
    banner = ("> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**\n> "
              + "; ".join(reasons) + "\n>\n> Resolve the flagged items — re-run the synthesizer §14 math and/or the truth-integrity audit (`/research:verify-evidence`) — and re-publish before relying on these numbers. (CLAUDE.md §5/§10/§15; finish-gate F01/F17/F30.)\n\n")
    open(ft, "w", encoding="utf-8").write(banner + body)
    print("GATE-VERIFY: PROVISIONAL — " + "; ".join(reasons))
else:
    open(ft, "w", encoding="utf-8").write(body)
    print("GATE-VERIFY: PASS — truth-integrity audit cleared (verdict Clean/Minor)")
PY
```

Record the printed `GATE-VERIFY:` line for step 11 ("Integrity gate") and step 13. A `PROVISIONAL` result here carries the same weight as a 10B.1 math break — the published thesis is UNVERIFIED until the flagged items are resolved. The deeper audits still never *abort* the run (a thesis is always produced), but a run that did not clear truth-integrity is **published with the PROVISIONAL banner, never clean** — "not run" is no longer a silent pass.

### 10B.3 — Expectations-gap audit (independent §7 edge check, fix F-EG)

`research:expectations-gap` was, until now, the one member of the audit trio (verify-evidence, pre-mortem, expectations-gap) never invoked in the ship path — it existed and worked, but nothing called it, so real committed runs almost never carried an `expectations_gap.json`. That left a real hole: the 10B.1 §7 edge gate (check V) only verifies the synthesizer's OWN self-reported `edge_score` / `edge_proof` are internally consistent — it cannot catch a self-graded "proven edge" when an INDEPENDENT re-read of the same reverse-DCF/consensus/scenario evidence would show no real variant perception. This closes that hole exactly the way pre-mortem independently red-teams confidence instead of trusting the synthesizer's own assessment.

Follow `.claude/commands/research/expectations-gap.md` against `<RUN_ROOT>`, producing `<RUN_ROOT>/expectations_gap.json` — **skip its own commit step**; step 12 below commits the whole run folder. This never aborts the run.

Then run this deterministic cross-check:

```bash
python3 - "<RUN_ROOT>" <<'PY'
import json, glob, os, re, sys
run = sys.argv[1]
dr_path = os.path.join(run, "decision_record.json"); ft = os.path.join(run, "final_thesis.md")
_vn = lambda p: int(re.search(r"_v(\d+)\.json$", p).group(1)) if re.search(r"_v(\d+)\.json$", p) else 1
egs = sorted([p for p in glob.glob(os.path.join(run, "expectations_gap*.json"))
              if re.fullmatch(r"expectations_gap(_v\d+)?", os.path.basename(p)[:-5])], key=_vn)
MARK = "PROVISIONAL — the automated finish-gate"
_isnum = lambda x: isinstance(x, (int, float)) and not isinstance(x, bool)
reason = None
try: dr = json.load(open(dr_path, encoding="utf-8"))
except Exception as e: dr = {}
cf = dr.get("confidence_score")
if egs:
    try:
        eg = json.load(open(egs[-1], encoding="utf-8"))
        vpq = str(eg.get("variant_perception_quality") or "").strip().lower()
        no_edge = vpq in ("", "none", "weak") or eg.get("is_exploitable") is False
        if no_edge and _isnum(cf) and cf > 60:
            reason = (f"expectations-gap audit found variant_perception_quality={eg.get('variant_perception_quality')!r} "
                       f"/ is_exploitable={eg.get('is_exploitable')!r} (no independently-proven edge) but "
                       f"confidence_score={cf} > 60 — §7 bans a confident rating on unproven variant perception")
    except Exception as e:
        reason = f"expectations_gap.json unreadable ({e}) — §7 edge audit not confirmed"
elif _isnum(cf) and cf > 60:
    reason = (f"expectations-gap audit did NOT run (no expectations_gap.json) but confidence_score={cf} > 60 — "
               "§7 requires the variant-perception edge be independently confirmed before shipping high conviction")
if reason:
    body = open(ft, encoding="utf-8").read()
    lines = body.split("\n"); i = 0
    while i < len(lines) and lines[i].strip() == "": i += 1
    reasons = []
    if i < len(lines) and lines[i].startswith(">") and MARK in "\n".join(lines[i:i+6]):
        blk = []
        while i < len(lines) and lines[i].startswith(">"): blk.append(lines[i]); i += 1
        while i < len(lines) and lines[i].strip() == "": i += 1
        body = "\n".join(lines[i:])
        if len(blk) >= 2:
            reasons = [r.strip() for r in blk[1].lstrip("> ").split(";")
                       if r.strip() and "expectations-gap audit" not in r]
    reasons.append(reason)
    banner = ("> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**\n> "
              + "; ".join(reasons) + "\n>\n> Resolve the flagged items before relying on these numbers. (CLAUDE.md §7; finish-gate F-EG.)\n\n")
    open(ft, "w", encoding="utf-8").write(banner + body)
    print("GATE-EXPECTATIONS: PROVISIONAL — " + reason)
else:
    print("GATE-EXPECTATIONS: PASS — expectations-gap audit found no confidence/edge contradiction"
          + (" (no expectations_gap.json — confidence not above 60, so not required)" if not egs else ""))
PY
```

Record the printed `GATE-EXPECTATIONS:` line for step 11 ("Integrity gate") and step 13. This carries the same weight as the 10B.1/10B.2 stamps — a `PROVISIONAL` result here means a confident rating shipped with no independently-confirmed variant perception, the exact "fake variant perception" CLAUDE.md §7 bans.

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

### 10B.3A — Final immutable audit set

The propagation and provisional-stamp steps above mutate `decision_record.json` and/or `final_thesis.md`
after the first audit pass. Therefore the earlier reports are diagnostic history, not admission authority.
Now rerun all three read-only audits against the final exact bytes, producing their next append-only
versions (`verification_report_vN.json`, `pre_mortem_vN.json`, and `expectations_gap_vN.json`):

1. follow `.claude/commands/research/verify-evidence.md`;
2. follow `.claude/commands/research/pre-mortem.md`;
3. follow `.claude/commands/research/expectations-gap.md`.

Skip each audit command's commit step. Every final report must carry the exact repo-relative thesis and
decision paths plus lowercase SHA-256 digests of both input files. From this point until manifest creation,
do not run haircut propagation, a provisional stamp, synthesis, or any other writer over those inputs.
These final audit conclusions are authoritative even when they are adverse: the admission freezer uses the
pre-mortem verdict/cap and expectations-gap quality/exploitability/edge score directly. A malformed,
missing, stale-input, or internally inconsistent final audit makes manifest creation fail closed.

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
match the ticker/date encoded by `<RUN_ROOT>` exactly; an internally consistent audit set cannot bless the
wrong listing or dated cohort. If it fails, record `IDEA-ADMISSION: error` with the exact manifest
error and STOP before market capture, final re-projection, parse/schema replacement, the freezer, or
derived-output recovery. A missing/invalid projection seal cannot honestly become `not_applicable`.
Preserve the failed run bytes and start a genuinely new dated run; never repair the audit/decision in
place and retry this dated projection. Once creation succeeds, none of the pinned artifacts may be edited.
A changed audit or decision artifact requires a new dated run, never an overwrite of the manifest or a
mutation followed by retry.

After manifest creation succeeds, dispatch one final Task call.

- `subagent_type: "synthesizer"`
- User message:

  > Final idea re-projection only for `<RUN_ROOT>`. A digest-valid post-audit
  > `idea_projection_manifest.json` already exists. Do not edit the thesis, decision record, module
  > outputs, audit files, or manifest. Re-read the manifest-pinned standing/post-mortem decision and final
  > integrity state, including the final pre-mortem and expectations-gap conclusions. Normalize
  > `research.edge_score` to the lower of the decision-record and expectations-gap scores. Any final
  > pre-mortem non-survival/rating cap or expectations-gap result without a Moderate/Strong proven
  > exploitable edge is a binding hard cap; copy the exact canonical reason defined in
  > `frameworks/ideas/README.md`. Run the canonical `--write-idea-evidence` command, then replace only this run's
  > `idea_3_6m.json` with a reconciled candidate or honest `not_assessable` result under
  > `frameworks/ideas/README.md`. A candidate must carry the manifest digest and exact decision authority:
  > set the replacement wrapper's `created_at` (and a candidate's `created_at`) to this final projection
  > time, no earlier than the manifest's `created_at`; never retain the preliminary wrapper's pre-manifest
  > timestamp. Then carry
  > `decision_date`; stable scenario ids, conditions, sources, probabilities and conjunction bases; the
  > exact `idea_valuation_bridge`, whose `source_horizon_days` equals `scenario_horizon_days`; and one
  > machine-resolvable forecast selected by
  > `forecast_id`, including its dates, source, metric/threshold, causal steps, and bullish/bearish triggers.

After it returns, run the parse and JSON Schema checks first:

```bash
python3 -m json.tool <RUN_ROOT>/idea_3_6m.json >/dev/null
python3 scripts/validate_screener_json.py frameworks/ideas/idea-assessment.schema.json <RUN_ROOT>/idea_3_6m.json
```

If JSON parsing or Schema validation fails, replace the broken final projection with one minimal
`not_assessable` wrapper for this run whose gap names that production failure and whose `created_at` is the
current final-projection time, no earlier than the manifest's `created_at`; never copy the preliminary
wrapper's timestamp. Then rerun parse + Schema before proceeding. This is fail-closed quarantine before
any semantic result exists, not a candidate repair. Once both checks pass, invoke the locked first-writer
freezer exactly once:

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

Only now execute the complete deferred procedure in step 10A (10A.0, 10A.1, and 10A.2). Regenerate the
derived files unconditionally when their procedure says to do so; an older memo or dossier from a resumed
run is stale. This is deliberately after final re-projection and admission, so no derived output can freeze
or present the preliminary Ideas state as final.

---

## 11. Update RUN_METADATA.md (final)

Rewrite `<RUN_ROOT>/RUN_METADATA.md` via the Write tool to fill in the placeholder sections. Read the current file first, then issue a single Write call with the full new content. (This command does not have access to the Edit tool — see the `allowed-tools` frontmatter.) **Derive every status below from the ACTUAL on-disk artifact set — glob the run folder — NOT from in-run tracking (fix F07).** On a resume / second completion pass the in-run state is stale, and the metadata must describe *what actually shipped* (a TMCV run once recorded "aborted, synthesizer skipped" while a complete `final_thesis.md`, `memo.md`, `decision_record.json`, and module syntheses were present on disk). Concretely: "Modules completed" = the modules whose `<RUN_ROOT>/<module>/99_*-synthesis.md` exists on disk; "Synthesizer status" = test `final_thesis.md` on disk; same for memo / dossier. **Guard:** if `final_thesis.md` exists you may NOT write "skipped/aborted" for the synthesizer — re-derive from disk. Fill in:

- "Modules completed": list (one per line)
- "Modules aborted": list with brief note per entry (one per line)
- "Synthesizer status": `succeeded` (if `final_thesis.md` exists), `failed` (if it does not), or `skipped (all modules aborted)`
- "Memo status": `succeeded` (if `memo.md` exists), `failed`, or `skipped (no final thesis)`
- "Audit dossier status": `succeeded` (if `audit_dossier.md` exists), `failed`, or `skipped (no final thesis)`
- "3–6 month idea assessment": `candidate — admitted`, `candidate — not admitted (<reason>)`,
  `not_assessable`, `error (<admission validator reason>)`, `invalid (final schema gate failed)`, or
  `skipped (no final thesis)`, derived from the final step-10B.4 artifact/admission snapshot — never from
  whether the Ideas UI happens to be populated
- "Integrity gate": the step-10B result — the `GATE: PASS|PROVISIONAL|ERROR` line from 10B.1, the verify-evidence verdict and the pre-mortem verdict / any confidence haircut from 10B.2, and the `GATE-EXPECTATIONS: PASS|PROVISIONAL` line from 10B.3 (e.g. `PASS; verify-evidence: Verified; pre-mortem: Survives (confidence 70→64); expectations-gap: PASS`). If 10B was skipped because no `final_thesis.md` exists, write `skipped (no final thesis)`.
- "Commit SHA": leave as `(to be filled after commit)` — you'll patch it post-commit in step 12.

---

## 12. Commit and push to main

Per repo `CLAUDE.md` git policy: commit straight to `main`. No branches. No PRs.

First drop any stale failure note — the run has now completed, so a break-time `RUN_FAILURE.md` (written by the server if an earlier attempt of this run broke) must NOT ride along in the success commit:

```
rm -f "analyses/${ARGUMENTS}_<DATE>/RUN_FAILURE.md"
```

Commit through the serialized helper (it holds a global git lock so concurrent companies don't collide on `.git/index.lock`, commits only this run folder, and pushes):

```
bash scripts/commit-run.sh "Research run: ${ARGUMENTS} <DATE>" -- "analyses/${ARGUMENTS}_<DATE>/"
```

In a tracked cockpit run (`NOSTRA_COCKPIT_RUN=1`), the helper prints `PUBLICATION_QUEUED=<intent-id>`. Stop the Git work here and leave the exact `(to be filled after commit)` placeholder untouched. After this process and all of its sub-agents have exited, the trusted cockpit supervisor publishes the frozen run, captures the verified primary SHA, rewrites only `RUN_METADATA.md`, and publishes the second backfill commit. A model process must never guess, read, or patch that SHA.

Outside the cockpit, the helper prints `COMMIT_SHA=<sha>` on success, or `NOOP=1` if nothing was staged (if `NOOP=1`, there is nothing to backfill — skip the rest of this step). Capture `<sha>` from that line and patch the "Commit SHA" field in `RUN_METADATA.md` by rewriting that file via the Write tool (read it, substitute `<sha>` in place of `(to be filled after commit)`, write the full new content). Do not use `git commit --amend`. Add the SHA patch as a second commit through the same helper:

```
bash scripts/commit-run.sh "Backfill commit SHA in RUN_METADATA for ${ARGUMENTS} <DATE>" -- "analyses/${ARGUMENTS}_<DATE>/RUN_METADATA.md"
```

(The two-commit approach is intentional: it keeps the run-artifacts commit clean of metadata about itself.)

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
- The two commit SHAs pushed to `origin/main`

---

## Hard rules

- Do not hardcode any module name. Run order (step 4) and cross-module context (step 8A) are both derived from each module's `depends_on:` frontmatter — adding a module requires only its files plus its `depends_on` list, with zero edits to this orchestrator.
- Adding a new module — e.g. dropping `.claude/agents/valuation/` with specialists and a `99_valuation-synthesis.md` — must require zero changes to this orchestrator beyond optionally updating the ordering rule in step 4 if cross-module dependencies need it.
- Never invoke another slash command from within this command. The shared pipeline is followed *inline* via the instructions in `frameworks/MODULE_PIPELINE.md`; the standalone module commands at `.claude/commands/research/<module>.md` are NOT called.
- Exactly two commits per run: one run-artifacts commit and one metadata-backfill commit that fills in the commit SHA of the first. Per-module commits do not happen here.
