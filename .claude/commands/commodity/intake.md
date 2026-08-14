---
description: Read the documents that landed since the last commodity run and write a SCOPED rerun plan — which specific orbs the new evidence actually invalidates, instead of re-running the whole dossier. Recommend-only; launches nothing.
argument-hint: COMMODITY RUN_ROOT DECISION_FINGERPRINT
allowed-tools: Read, Write, Glob, Grep, Bash
---

You implement **document intake for the commodity swarm** — the commodity-scoped twin of
`/research:intake`. You read the documents that have arrived in a commodity's data pool **since its
last finished run**, judge what each one bears on, and write an **append-only scoped rerun plan** — the
minimal set of `/commodity:rerun` commands the new evidence justifies, instead of the blunt "the whole
dossier is stale, re-run everything" default.

`frameworks/INTAKE.md` is the single source of truth for the schema and the rules — the SAME schema the
research swarm uses (this command only changes the run-root, watermark, roster namespace, and rerun
command namespace). Read it first and follow it exactly.

**Inviolable rules (from `INTAKE.md` §1 / `CLAUDE.md` §24):**
- **Recommend-only.** You write ONE plan file pair and print a summary. You NEVER launch a run, never
  edit `decision_record.json`, the dossier, or any module output, and never touch the data pool.
- **Augment the floor, never replace it.** Your plan narrows attention and pre-fills the rerun; it can
  never declare a module "fresh". The staleness floor stays authoritative.
- **Fail toward blunt.** If you are unsure which orb an important document invalidates, widen to the
  whole module. Never under-scope a material change.
- **No source = no claim** (§3). Every entry cites the document it came from.
- This command spawns no subagents.

The argument is `$ARGUMENTS` — `<COMMODITY> <EXACT_RUN_ROOT> <DECISION_FINGERPRINT>` (for example,
`WHEAT commodity/runs/WHEAT sha256:…`). All three values come from one cockpit-selected call. Missing or
invalid identity must STOP before any read/write; a legacy unbound plan stays audit-readable but can never
authorize a paid rerun. Execute the steps below in order.

---

## 1. Resolve the commodity and its run root

`<COMMODITY>` = the first token of `$ARGUMENTS`, upper-cased. `<EXACT_RUN_ROOT>` is the second token and
`<DECISION_FINGERPRINT>` the third. Require exactly three tokens and require the fingerprint to match
`^sha256:[a-f0-9]{64}$`; otherwise STOP. Resolve `<TODAY>` once: `date +%F`. Also capture
`<SCANNED_AT>` once, **NOW — before you list any documents in Step 2**, using Python so two scans inside
one wall-clock second remain strictly ordered. This is
the durable "as-of" witness the cockpit uses to prove the analysis saw the whole pool (it survives a Git
checkout/rebase that rewrites the plan file's own mtime). It MUST be taken before the Step 2 `find`, never
after the scan or while writing the plan — a document that lands after this instant is correctly unread.

```bash
TODAY="$(date +%F)"
SCANNED_AT="$(python3 - <<'PY'
import datetime
print(datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"))
PY
)"
```

A commodity has ONE run folder (not dated): `commodity/runs/<COMMODITY>/`. `<EXACT_RUN_ROOT>` MUST
byte-equal that path; require the folder and decision file to be real non-symlinks directly
under the declared runs tree, or STOP without writing. It counts as a FINISHED run
only once it carries a `decision_record.json` (the commodity terminal artifact — there is no
`final_thesis.md` outside research):

```bash
RUN_ROOT="commodity/runs/${COMMODITY}"
if [ ! -f "$RUN_ROOT/decision_record.json" ]; then RUN_ROOT=""; fi
echo "$RUN_ROOT"
```

- If there is **no** finished run (`decision_record.json` absent), STOP: print
  `No finished run for <COMMODITY> — nothing to scope against. Run /commodity:full first.` and exit
  **without writing anything**.
- The watermark is `<RUN_ROOT>/decision_record.json` (written only once the run is finished):

```bash
WATERMARK="${RUN_ROOT}/decision_record.json"
```

## 2. Find the documents that arrived since the run

List pool files newer than the run, RECURSIVELY (so externally-ingested docs under
`data/<COMMODITY>/external/<provider>/` are seen — they are the most likely delta, and exactly what a
connector writes, `EXTERNAL_DATA.md` §7). **Exclude engine-written output** (skip any file whose OWN
directory contains a `.nostradamus_output` sentinel file) and a document's provenance sidecar
(`<file>.source.json`, metadata not evidence):

The "arrived since the run" baseline must be DURABLE. `$WATERMARK` is Git-tracked, so a
checkout/clone/worktree/rebase can rewrite its mtime FORWARD and make a plain `-newer "$WATERMARK"`
silently miss documents that really arrived after the decision. A singleton run has no date in its folder
name, so read the terminal record's own `decision_date` (JSON content survives materialisation). If the
watermark's mtime is later than that decision day, treat it as rewritten and fall back to the start of the
decision date. Otherwise keep the precise watermark boundary. If `decision_date` is absent or malformed,
do not invent one; use the watermark and make the plan `insufficient` if that leaves the delta unknowable.

```bash
RUN_DATE="$(python3 - "$WATERMARK" <<'PY'
import datetime, json, re, sys
try:
    value = json.load(open(sys.argv[1], encoding="utf-8")).get("decision_date", "")
    valid = isinstance(value, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", value)
    valid = valid and datetime.date.fromisoformat(value) <= datetime.date.today()
    print(value if valid else "")
except Exception:
    print("")
PY
)"
EVIDENCE_INDEX="$(mktemp)"
python3 - "$COMMODITY" "$WATERMARK" "$RUN_DATE" "$EVIDENCE_INDEX" <<'PY'
import datetime, json, os, pathlib, sys
commodity, watermark, run_date, index_path = sys.argv[1:]
wm = os.stat(watermark).st_mtime
try:
    day = datetime.datetime.strptime(run_date, '%Y-%m-%d')
    floor = day.timestamp() if wm > (day + datetime.timedelta(days=1)).timestamp() - 1 else wm
except Exception:
    floor = wm
rows = []
for file in sorted((pathlib.Path('data') / commodity).rglob('*')):
    try:
        if not file.is_file() or file.name.endswith('.source.json') or (file.parent / '.nostradamus_output').exists():
            continue
        stat = file.stat(); arrival = max(stat.st_mtime, stat.st_ctime)
        if arrival > floor:
            print(file.as_posix())
            rows.append({'path': file.as_posix(), 'arrival_ms': int(arrival * 1000)})
    except OSError:
        continue
with open(index_path, 'w', encoding='utf-8') as out:
    json.dump(rows, out, separators=(',', ':'))
PY
```

- If **no** new documents: write a plan with `verdict: "note_only"`, empty `new_docs`, empty
  `rerun_plan.commands`, `scan_date: "<TODAY>"`, `scanned_at: "<SCANNED_AT>"`, and a one-line `summary`
  ("No new documents since the last run."). Still write the file (so the cockpit can safely affirm
  "no new data — everything read and considered"), then go to Step 6. **`scanned_at` is required on this
  empty path** — without it the server must fail closed and prompt another analysis.
- A routed/connector COPY's file date is its write date, so an old-as-of document can still be "new to
  the engine" — that is correct (staleness means "the engine has not read this yet").

## 3. Refresh the extract sidecar and read each new document

Extract into a **throwaway temp directory**, never the run's own `_pool_extracts` (recommend-only —
never mutate the run's evidence cache):

```bash
EXTRACT_TMP="$(mktemp -d)"
python3 .claude/tools/extract_pool.py "data/${COMMODITY}/" "$EXTRACT_TMP" 2>/dev/null || true
```

For each new document, gather from its `.source.json` sidecar (external/connector docs) or the
`$EXTRACT_TMP/manifest.md` row (`provenance`): `provider`, `source_type`, `tier` (§4 map in
`EXTERNAL_DATA.md`), and `as_of` (the DATA coverage date, read from inside the document — never the file
mtime). Read the extract to learn what the document actually says — a one-sentence `claims_summary` (the
concrete, quantified change), a `materiality_score` (0–100, §12), and an `impact_direction`.

## 4. Map each document to the specific orbs it invalidates

This is the intelligence. **Discover the commodity roster** — never guess a name:

```bash
# commodity modules + their synthesis; then each module's orbs
ls -1 .claude/agents/commodity/*/99_*-synthesis.md
```

For each module folder `.claude/agents/commodity/<module>/`, the orbs are its `[0-9][0-9]_*.md` files.
Read each candidate orb's `description:` frontmatter and its body's **`WHAT TO READ`**,
`UPSTREAM_INPUTS`, and `depends_on` blocks. Match the document's actual content to the orbs whose
declared inputs it bears on. Typical commodity mapping: a positioning/COT feed → `macro-positioning`; a
supply/demand/stocks or weather feed → `supply-demand`; a price/curve feed → `market-structure`.

For each document, emit `entry_orbs: [{module, agent, why, confidence}]`:
- `module` / `agent` MUST be a real commodity folder name and a real orb `name:` in the discovered
  roster. **Validate each against the roster before writing it. If you cannot confidently place a
  material document on a single specific orb, widen to EVERY orb in that module** (one `entry_orbs` row
  per `[0-9][0-9]_*.md` the module has) **and lower `confidence` on each** — never drop a material
  document silently.
- `why` — one plain-English sentence tying the document's content to that orb's declared inputs.
- `confidence` — 0–1, your certainty this orb (and not a neighbour) is the one the evidence hits.

**Tier discipline (`INTAKE.md` §5):** a tier-9 single-source note (one channel check / one expert call,
N=1) **defaults to `note_only`** — clearing the materiality gate alone is not enough. It earns a rerun
recommendation only when a SECOND, independent document corroborates it (cite both). An official/vendor
feed (tier 5, e.g. a connector-written USDA/NOAA/CFTC pull) that changes a consumed number clears the
gate on its own.

## 5. Derive the scoped rerun plan

- `materiality_gate` = 60.
- `rerun_plan.entry_orbs` = the union, across all documents, of `entry_orbs` whose `materiality_score`
  ≥ gate (dedup identical `{module, agent}`).
- `rerun_plan.commands[]` = one `/commodity:rerun <module> <agent> <COMMODITY>` per unique entry orb,
  each with `module`, `agent`, `triggered_by` (the document paths), and a **proposed** `cascade_modules`
  (the server recomputes it authoritatively from the live DAG, so an approximate list is acceptable).
  Order upstream-module-first.
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
echo "$out"
```

Write the JSON to that path with the Write tool using the **exact** `intake_plan.json` schema from
`INTAKE.md` §3 — with `ticker` set to `<COMMODITY>` and every rerun command in the `/commodity:rerun …`
namespace (valid JSON; no fences/comments/trailing commas; `null`/`""`/`[]` for unknowns; never
fabricate). Include `scan_date: "<TODAY>"` and `scanned_at: "<SCANNED_AT>"`, plus the exact identity
fields `schema_version: "1.1"`, `swarm: "commodity"`, `subject: "<COMMODITY>"`,
`ticker: "<COMMODITY>"`, `run_root: "<RUN_ROOT>"`, and
`decision_fingerprint: "<DECISION_FINGERPRINT>"` — the durable witnesses
captured before Step 2 — on **every** plan, including `note_only` and `insufficient`. Copy the exact JSON
array from `$EVIDENCE_INDEX` into required top-level `evidence_files` without editing or reordering it;
put every row exactly once in `new_docs[]`, then reference the immaterial subset in
`rerun_plan.note_only[]`. A non-tier-9 document at or above the gate must name a real entry orb and its
matching triggered command. Then validate:

```bash
python3 -m json.tool "$out" >/dev/null && echo "OK valid JSON" || echo "FAIL invalid JSON"
```

If invalid, fix and rewrite. Write the paired markdown twin (`…_intake_plan.md`, same basename, `_vN`
carried over) — the human-readable tier of the SAME content (no fact not in the JSON; `CLAUDE.md` §21
plain English; ≤ ~1 page). Structure mirrors `/research:intake` Step 6 (Verdict · New documents table ·
Scoped rerun plan · Watch), with `/commodity:rerun …` in the Re-run column.

## 7. Print the summary and commit

Print a short block: commodity · run root · # new docs · # that clear the gate · the scoped commands ·
the JSON + md paths · confirmation that NO run was launched and NO original was modified.

Commit ONLY the two plan files (engine research-data output — the `intake/` artifacts are data, not code,
so per `CLAUDE.md` §25 they commit straight to main via `commit-run.sh`; never `git add` anything else):

```bash
bash scripts/commit-run.sh "Commodity intake plan: <COMMODITY> <TODAY>" -- "${RUN_ROOT}/intake/*_intake_plan*.json" "${RUN_ROOT}/intake/*_intake_plan*.md"
```

Report the commit SHA. If no plan file was written (Step 1 stop), skip the commit.

---

## Hard rules

- Reads pool documents + the run's own output; writes ONLY `<RUN_ROOT>/intake/…_intake_plan.json` and
  the paired `…_intake_plan.md`. Never edits `decision_record.json`, module output, or the data pool.
- Recommend-only: it launches no run and edits no dossier. A rerun is only ever a *named command* in the
  plan; the human (or the gated auto-rescore loop, within its spend cap) fires it.
- Every `module`/`agent` in the plan is a real discovered `commodity/*` roster name — validate before writing.
- Never under-scope a material document: when unsure, widen (whole module) and lower confidence.
- A tier-9 single-source note is `note_only` unless a second, independent document corroborates it.
- The schema and doctrine come from `frameworks/INTAKE.md`; this command does not redefine them.
