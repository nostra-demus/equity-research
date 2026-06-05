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

You re-run only the `99` synthesis of each cascade module — never its specialists.

## 8. Re-run the master synthesizer

Dispatch a single Task call (per `/research:full` step 10):

- `subagent_type: "synthesizer"`
- > Synthesize the analyses in <RUN_ROOT>/. Output the final thesis to <RUN_ROOT>/final_thesis.md.

Wait for it. Treat as failed if `<RUN_ROOT>/final_thesis.md` does not exist when it returns (if so, STOP before committing and report the failure).

## 9. Regenerate the memo and audit dossier

Only if `<RUN_ROOT>/final_thesis.md` exists. These keep the three tiers in sync with the refreshed thesis (per `/research:full` step 10A):

- **Memo** — dispatch one Task call: `subagent_type: "memo-writer"`, message: `Read <RUN_ROOT>/final_thesis.md and <RUN_ROOT>/decision_record.json and write the ~10-page colleague memo to <RUN_ROOT>/memo.md.` If `memo.md` is absent afterward, record it as failed but do not abort.
- **Audit dossier** — run the deterministic Bash/Python concatenation from `/research:full` step 10A.2 **verbatim**, with `RUN_ROOT="<RUN_ROOT>"`. It is read-only on run artifacts, writes only `audit_dossier.md`, and must never abort the run.

## 10. Commit and push to main (one commit)

Per repo `CLAUDE.md` git policy: commit straight to `main`, no branches, no PRs.

```
git add "<RUN_ROOT>/"
git commit -m "Re-run: <TICKER> <MODULE>/<AGENT> + downstream <DATE>"
git push origin main
```

Capture the commit SHA (`git rev-parse HEAD`). Unlike `/research:full`, this is a single commit — do not backfill RUN_METADATA.

## 11. Report

Print: the resolved `<RUN_ROOT>`; the target orb that was re-run; the ordered cascade of syntheses re-run; whether the master thesis, memo, and audit dossier regenerated; the master thesis's one-line decision/verdict; and the commit SHA pushed to `origin/main`.

---

## Hard rules

- Discover everything (agents, layers, `depends_on`, cascade order) from the files and frontmatter — never hardcode module or agent names. The cascade is derived entirely from `depends_on`, exactly like `/research:full`.
- Re-run ONLY the selected orb and the `99` syntheses in the cascade (plus master + tiers). Never re-run sibling specialists or any downstream module's specialists — reuse their existing outputs.
- Re-run the cascade syntheses strictly in topological order so each reads already-refreshed upstream.
- Mutate the latest EXISTING run folder. Never create a new run folder.
- Exactly one commit at the end. The individual agents must not commit.
