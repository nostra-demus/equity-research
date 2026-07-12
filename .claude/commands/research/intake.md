---
description: Read the documents that landed since the last run and write a SCOPED rerun plan — which specific orbs the new evidence actually invalidates, instead of re-running everything. Recommend-only; launches nothing.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Grep, Bash
---

You implement **document intake**: you read the documents that have arrived in a ticker's data pool
**since its last finished run**, judge what each one bears on, and write an **append-only scoped
rerun plan** — the minimal set of `/research:rerun` commands the new evidence justifies, instead of
the blunt "the whole run is stale, re-run everything" default.

`frameworks/INTAKE.md` is the single source of truth for the schema and the rules. Read it first and
follow it exactly. This command is a **document-first generalisation** of `review-decisions.md`
Step 11 (`memo_delta.changed_sections[]`) — reuse that judgment logic; do not invent a parallel one.

**Inviolable rules (from `INTAKE.md` §1 / `CLAUDE.md` §24):**
- **Recommend-only.** You write ONE plan file pair and print a summary. You NEVER launch a run,
  never edit `decision_record.json`, `final_thesis.md`, or any module output, and never touch the
  data pool.
- **Augment the floor, never replace it.** Your plan narrows attention and pre-fills the rerun; it
  can never declare a module "fresh". The staleness floor stays authoritative.
- **Fail toward blunt.** If you are unsure which orb an important document invalidates, widen to the
  whole module (or recommend re-running everything stale). Never under-scope a material change.
- **No source = no claim** (§3). Every entry cites the document it came from.
- This command spawns no subagents.

The argument is `$ARGUMENTS` — a single `<TICKER>`. Execute the steps below in order.

---

## 1. Resolve the ticker and the latest run root

`<TICKER>` = the first token of `$ARGUMENTS`, upper-cased. Resolve `<TODAY>` once: `date +%F`.

Find the **latest finished run root** for the ticker:

```bash
RUN_ROOT="$(ls -1d analyses/${TICKER}_*/ 2>/dev/null | sort -r | head -n 1 | sed 's:/$::')"
echo "$RUN_ROOT"
```

- If there is **no** run root, STOP: print `No finished run for <TICKER> — nothing to scope against. Run the pipeline first.` and exit **without writing anything**. (Intake only makes sense against an existing thesis.)
- The watermark is `<RUN_ROOT>/final_thesis.md`. If it is absent (an incomplete run), fall back to the newest `*.md` under `<RUN_ROOT>` as the watermark and note it in the plan `summary`.

## 2. Find the documents that arrived since the run

List pool files newer than the watermark, RECURSIVELY (so externally-ingested docs under
`data/<TICKER>/external/<provider>/` are seen — they are the most likely delta, `EXTERNAL_DATA.md`).
**Exclude engine-written output folders**: any directory carrying a `.nostradamus_output` sentinel
is the engine's own prior output, never new evidence (the same exclusion `extract_pool.py` applies).

```bash
find "data/${TICKER}/" -type f -newer "${RUN_ROOT}/final_thesis.md" \
  -not -path '*/.nostradamus_output/*' \
  -not -name '.source.json' 2>/dev/null | sort
```

- If **no** new documents: write a plan with `verdict: "note_only"`, empty `new_docs`, empty
  `rerun_plan.commands`, and a one-line `summary` ("No new documents since the last run."). Still
  write the file (so the cockpit can show "nothing to re-run"), then go to Step 6.
- Note: a routed COPY's file date is its routing date, so an old document can still be "new to the
  engine" — that is correct (staleness means "the engine has not read this yet").

## 3. Refresh the extract sidecar and read each new document

Refresh the deterministic extract once (idempotent), then read each new doc's extract + provenance:

```bash
python3 .claude/tools/extract_pool.py "data/${TICKER}/" "${RUN_ROOT}/_pool_extracts" 2>/dev/null || true
```

For each new document, gather from its `.source.json` sidecar (external docs) or the
`_pool_extracts/manifest.md` row (`provenance`): `provider`, `source_type`, `tier` (§4 map in
`EXTERNAL_DATA.md`), and `as_of` (the DATA coverage date, read from inside the document — never the
file mtime). A plain filing with no sidecar takes the tier its document TYPE earns (CLAUDE.md §4/§27:
audited annual = tier 1, interim = tier 2, deck = tier 7, etc.). Read the extract to learn what the
document actually says — a one-sentence `claims_summary` (the concrete, quantified change), a
`materiality_score` (0–100, §12), and an `impact_direction`.

## 4. Map each document to the specific orbs it invalidates

This is the intelligence. **Discover the roster** — never guess a name:

```bash
# modules + their synthesis; then each module's orbs
ls -1 .claude/agents/*/99_*-synthesis.md
```

For each module folder `.claude/agents/<module>/`, the orbs are its `[0-9][0-9]_*.md` files. Read
each candidate orb's `description:` frontmatter and its body's **`WHAT TO READ (priority for this
agent)`**, `UPSTREAM_INPUTS`, and `depends_on` blocks. Match the document's actual content to the
orbs whose declared inputs it bears on — exactly the judgment `review-decisions` Step 11 makes to
fill `impacted_modules`, but at **orb** granularity.

For each document, emit `entry_orbs: [{module, agent, why, confidence}]`:
- `module` / `agent` MUST be a real folder name and a real orb `name:` in the discovered roster.
  **Validate each against the roster before writing it. If you cannot confidently place a material
  document on a specific orb, widen to that module's most-upstream relevant orb (or list the module's
  data-triage orb) and lower `confidence`** — never drop a material document silently.
- `why` — one plain-English sentence tying the document's content to that orb's declared inputs.
- `confidence` — 0–1, your certainty this orb (and not a neighbour) is the one the evidence hits.

**Tier discipline (`INTAKE.md` §5):** a tier-9 single-source anecdote (one channel check / one
expert call, N=1) does NOT by itself force a rerun of a filing-anchored number — it can raise a
question, so record it under `note_only` with its materiality unless it is corroborated or clears
the gate. A filing (tier 1–3) that changes a consumed number clears the gate readily.

## 5. Derive the scoped rerun plan

- `materiality_gate` = 60.
- `rerun_plan.entry_orbs` = the union, across all documents, of `entry_orbs` whose
  `materiality_score` ≥ gate (dedup identical `{module, agent}`).
- `rerun_plan.commands[]` = one `/research:rerun <module> <agent> <TICKER>` per unique entry orb,
  each with `module`, `agent`, `triggered_by` (the document paths), and a **proposed**
  `cascade_modules` (the downstream modules — you may compute it, but the server recomputes it
  authoritatively, so an approximate list is acceptable). Order upstream-module-first.
- Documents below the gate (or tier-9 single-source) → `rerun_plan.note_only[]` with a `reason`.
- `verdict`: `scoped_rerun` if any command; `note_only` if docs exist but none clear the gate;
  `insufficient` if the run/data can't support a judgment.
- `summary`: 2–4 plain-English sentences — what landed, what it bears on, the scoped recommendation.

## 6. Write the plan (append-only) and validate

Per `INTAKE.md` §2, write BOTH files under `<RUN_ROOT>/intake/`:

```bash
mkdir -p "${RUN_ROOT}/intake"
base="${RUN_ROOT}/intake/${TODAY}_intake_plan"
out="${base}.json"; n=2
while [ -e "$out" ]; do out="${base}_v${n}.json"; n=$((n+1)); done
echo "$out"     # the JSON path; the .md twin shares the basename with .json -> .md
```

Write the JSON to that path with the Write tool using the **exact** `intake_plan.json` schema from
`INTAKE.md` §3 (valid JSON; no fences, comments, or trailing commas; `null` for unknown numbers,
`""` for unknown strings, `[]`/`{}` for empties; never fabricate a value). Then validate:

```bash
python3 -m json.tool "$out" >/dev/null && echo "OK valid JSON" || echo "FAIL invalid JSON"
```

If invalid, fix and rewrite before continuing. Write the paired markdown twin (`…_intake_plan.md`,
same basename, `_vN` carried over) — the human-readable tier of the SAME content (no fact not in the
JSON; `CLAUDE.md` §21 plain English; ≤ ~1 page). Structure:

```markdown
# <TICKER> Document Intake — <SCAN_DATE>

## Verdict
<verdict> · <summary>

## New documents since the last run (<RUN_ROOT>)
| Document | Provider · type · §4 tier · as-of | Materiality /100 | Bears on (orb) | Re-run? |
One row per new_doc; the Re-run column shows the exact command, "note only", or "widen: <module>".

## Scoped rerun plan
The ordered `/research:rerun` commands, each with its one-line reason. If none: "Nothing clears the
materiality gate — keep the current thesis; watch items below."

## Watch (note-only)
The tier-9 / below-gate documents and why they don't (yet) move the thesis.
```

## 7. Print the summary and commit

Print a short block: ticker · run root · # new docs · # that clear the gate · the scoped commands ·
the JSON + md paths · confirmation that NO run was launched and NO original was modified.

Commit ONLY the two plan files you created (this is engine research-data output — the `intake/`
artifacts, like `reviews/`, are data, not code — so per `CLAUDE.md` §25 they commit straight to main
via `commit-run.sh`; never `git add` anything else):

```bash
bash scripts/commit-run.sh "Intake plan: <TICKER> <SCAN_DATE>" -- "${RUN_ROOT}/intake/*_intake_plan*.json" "${RUN_ROOT}/intake/*_intake_plan*.md"
```

Report the commit SHA. If no plan file was written (Step 1 stop), skip the commit.

---

## Hard rules

- Reads pool documents + the run's own output; writes ONLY `<RUN_ROOT>/intake/…_intake_plan.json`
  and the paired `…_intake_plan.md`. Never edits `decision_record.json`, `final_thesis.md`, module
  output, or the data pool.
- Recommend-only: it launches no run and edits no thesis. A rerun is only ever a *named command* in
  the plan; the human clicks it.
- Every `module`/`agent` in the plan is a real discovered roster name — validate before writing.
- Never under-scope a material document: when unsure, widen (whole module) and lower confidence.
- A tier-9 single-source note is `note_only` unless corroborated or clearing the gate.
- The schema and doctrine come from `frameworks/INTAKE.md`; this command does not redefine them.
