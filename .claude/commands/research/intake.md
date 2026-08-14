---
description: Read the documents that landed since the last run and write a SCOPED rerun plan — which specific orbs the new evidence actually invalidates, instead of re-running everything. Recommend-only; launches nothing.
argument-hint: TICKER RUN_ROOT DECISION_FINGERPRINT
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

The argument is `$ARGUMENTS` — `<TICKER> <EXACT_RUN_ROOT> <DECISION_FINGERPRINT>`. All three values are
supplied by the cockpit from one exact selected call. The fingerprint is an opaque
`sha256:<64 lowercase hex>` decision identity; write it verbatim into the plan. Missing/invalid identity
must STOP before reading or writing — a legacy unbound plan may remain readable for audit, but can never
authorize a paid rerun. Execute the steps below in order.

---

## 1. Resolve the ticker and its exact decision-bound run root

`<TICKER>` = the first token of `$ARGUMENTS`, upper-cased. `<EXACT_RUN_ROOT>` = the second token and
`<DECISION_FINGERPRINT>` = the third. Require exactly three tokens and require the fingerprint to match
`^sha256:[a-f0-9]{64}$`; otherwise STOP as malformed. Resolve `<TODAY>` once: `date +%F`. Also capture
`<SCANNED_AT>` once, **NOW — before you list any documents in Step 2**, with Python so two scans inside
the same wall-clock second remain strictly ordered:

```bash
SCANNED_AT="$(python3 - <<'PY'
import datetime
print(datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"))
PY
)"
```

This is
the durable "as-of" watermark the cockpit uses to prove the analysis saw the whole pool (it survives the
git checkout/rebase that rewrites the plan file's own mtime). It MUST be taken *before* the Step 2 `find`,
never after writing the plan — a document that lands after this instant is correctly treated as unread.

Require `<EXACT_RUN_ROOT>` to match `analyses/<TICKER>_YYYY-MM-DD` exactly, be a
real direct child directory of `analyses/` (not a symlink), and carry `final_thesis.md` or an object-valued
`decision_record.json`; use that exact root. The object-valued decision record is required because it is
the decision the supplied fingerprint identifies. If any check fails, STOP without writing. Never fall
back to a newer or "latest" run.

- If there is **no** finished run root, STOP: print `No finished run for <TICKER> — nothing to scope against. Run the pipeline first.` and exit **without writing anything**. (Intake only makes sense against an existing thesis; a newer but incomplete run folder does not count.)
- The watermark is `<RUN_ROOT>/final_thesis.md` if present, else `<RUN_ROOT>/decision_record.json` (both are only ever written once the run is finished, so this is never a partial/in-progress file). Note which one was used in the plan `summary`.

```bash
WATERMARK="${RUN_ROOT}/final_thesis.md"
[ -f "$WATERMARK" ] || WATERMARK="${RUN_ROOT}/decision_record.json"
```

Also recover the **last evidence cursor** saved before this run began reading its source pool. Every full
run writes `intake/run_evidence_cursor.json` before it can launch a paid module. A scoped automatic update
has an even more precise earlier floor: the scoped runner copies the exact authorising plan and stamps
`staged_for_scoped_rerun: true`. Its `scanned_at` is the last instant at which the data pool was actually
listed. It is stronger than the new thesis file's later mtime: a second document can land while the scoped
run is working, before that thesis is written. Treating the new thesis as the floor would silently call that
second document old. Read only contained `intake/*_intake_plan*.json` files, require the boolean stamp and a
valid non-future UTC `scanned_at`, and choose the newest such stamp. If no scoped-plan cursor exists, require
the contained run cursor to match this ticker and run root and use its non-future `started_at`. A damaged
run cursor is unsafe: STOP instead of calling new evidence old.

```bash
EVIDENCE_CURSOR="$(python3 - "$RUN_ROOT" "$SCANNED_AT" <<'PY'
import datetime, glob, json, os, re, sys
root, scan_now = sys.argv[1:]
iso = re.compile(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$')
try:
    ceiling = datetime.datetime.fromisoformat(scan_now.replace('Z', '+00:00')).timestamp()
except Exception:
    raise SystemExit(0)
seen = []
for file in glob.glob(os.path.join(root, 'intake', '*_intake_plan*.json')):
    try:
        raw = json.load(open(file, encoding='utf-8'))
        stamp = raw.get('scanned_at')
        if raw.get('staged_for_scoped_rerun') is not True or not isinstance(stamp, str) or not iso.fullmatch(stamp):
            continue
        at = datetime.datetime.fromisoformat(stamp.replace('Z', '+00:00')).timestamp()
        if at <= ceiling:
            seen.append((at, stamp))
    except Exception:
        continue
if seen:
    print(max(seen)[1])
    raise SystemExit(0)
marker = os.path.join(root, 'intake', 'run_evidence_cursor.json')
try:
    raw = json.load(open(marker, encoding='utf-8'))
    stamp = raw.get('started_at')
    expected_ticker = os.path.basename(root).rsplit('_', 1)[0]
    if (raw.get('version') != 1 or raw.get('ticker') != expected_ticker or raw.get('run_root') != root
            or not isinstance(stamp, str) or not iso.fullmatch(stamp)):
        raise ValueError('bad run evidence cursor')
    at = datetime.datetime.fromisoformat(stamp.replace('Z', '+00:00')).timestamp()
    if at > ceiling:
        raise ValueError('future run evidence cursor')
    print(stamp)
except FileNotFoundError:
    # Legacy finished calls predate the run cursor. Re-read from local midnight of their run date;
    # duplicate evidence is safe, hiding evidence that landed during the old run is not.
    try:
        day = os.path.basename(root).rsplit('_', 1)[1]
        floor = datetime.datetime.strptime(day, '%Y-%m-%d').astimezone()
        print(floor.astimezone(datetime.timezone.utc).isoformat().replace('+00:00', 'Z'))
    except Exception:
        print('MISSING_RUN_EVIDENCE_CURSOR', file=sys.stderr)
        raise SystemExit(42)
except Exception:
    print('INVALID_RUN_EVIDENCE_CURSOR', file=sys.stderr)
    raise SystemExit(42)
PY
)"
CURSOR_STATUS=$?
if [ "$CURSOR_STATUS" -ne 0 ]; then
  echo "The saved run start point is damaged. Automatic intake stopped so it cannot skip new evidence."
  exit 1
fi
```

## 2. Find the documents that arrived since the run

List pool files newer than the recovered `$EVIDENCE_CURSOR` when it exists; otherwise use
`$WATERMARK`. Scan RECURSIVELY (so externally-ingested docs under
`data/<TICKER>/external/<provider>/` are seen — they are the most likely delta, `EXTERNAL_DATA.md`).
**Exclude engine-written output**: `extract_pool.py` marks a folder that holds the engine's own prior
output (a routed copy of `final_thesis.md`/memo/dossier saved back into the data folder) with a
sibling **file** named `.nostradamus_output` — never a directory by that name — so skip any file
whose OWN DIRECTORY contains that sentinel. Also skip a document's provenance sidecar
(`<file>.source.json`, `EXTERNAL_DATA.md` §3) — it is metadata about a document, not new evidence
itself:

The "arrived since the run" baseline must be DURABLE. A recovered evidence cursor is JSON content and
survives checkout/rebase. When there is no scoped-run cursor, `$WATERMARK` (`final_thesis.md`) lives under
`analyses/` (git-tracked), so a checkout/clone/worktree/rebase rewrites its mtime FORWARD to the
materialisation time — and `-newer` against a forward-bumped watermark would silently MISS every document
that landed between the real run and the checkout, writing a falsely-empty plan. Detect that (the
watermark's own mtime is dated later than the run FOLDER's date, which git cannot rewrite) and fall back
to the durable run-folder date; otherwise use the precise watermark:

```bash
RUN_DATE="$(basename "$RUN_ROOT" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | head -1)"
# Use max(mtime, ctime), matching the server's freshness proof. This catches a Drive/rsync file whose
# original mtime was preserved but whose local ctime proves it arrived after the last scan.
EVIDENCE_INDEX="$(mktemp)"
python3 - "$TICKER" "$WATERMARK" "$RUN_DATE" "$EVIDENCE_CURSOR" "$EVIDENCE_INDEX" <<'PY'
import datetime, json, os, pathlib, sys
ticker, watermark, run_date, cursor, index_path = sys.argv[1:]
if cursor:
    floor = datetime.datetime.fromisoformat(cursor.replace('Z', '+00:00')).timestamp()
else:
    wm = os.stat(watermark).st_mtime
    try:
        # Run-folder dates are local dates (the same contract as `date +%F`), so use local midnight.
        day = datetime.datetime.strptime(run_date, '%Y-%m-%d')
        floor = day.timestamp() if wm > (day + datetime.timedelta(days=1)).timestamp() - 1 else wm
    except Exception:
        floor = wm
pool = pathlib.Path('data') / ticker
rows = []
for file in sorted(pool.rglob('*')):
    try:
        if not file.is_file() or file.name.endswith('.source.json') or (file.parent / '.nostradamus_output').exists():
            continue
        stat = file.stat()
        arrival = max(stat.st_mtime, stat.st_ctime)
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
  ("No new documents since the last run."). Still write the file (so the cockpit can affirm "no new data —
  everything read and considered"), then go to Step 6. **`scanned_at` is not optional on this path** — it
  is exactly what lets the cockpit safely show that affirmative instead of staying silent.
- Note: a routed COPY's file date is its routing date, so an old document can still be "new to the
  engine" — that is correct (staleness means "the engine has not read this yet").

## 3. Refresh the extract sidecar and read each new document

Extract into a **throwaway temp directory**, never `${RUN_ROOT}/_pool_extracts` — that path is the
run's own canonical evidence cache other modules read from, and intake is recommend-only (the
Inviolable rules above: never touch the run's output). Writing there would mutate a committed run's evidence
cache outside the two-file commit this command makes, leaving the worktree with an uncommitted change
Step 7 never stages. A fresh temp dir is idempotent-enough for one intake pass and leaves no trace:

```bash
EXTRACT_TMP="$(mktemp -d)"
python3 .claude/tools/extract_pool.py "data/${TICKER}/" "$EXTRACT_TMP" 2>/dev/null || true
```

For each new document, gather from its `.source.json` sidecar (external docs) or the
`$EXTRACT_TMP/manifest.md` row (`provenance`): `provider`, `source_type`, `tier` (§4 map in
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
  document on a single specific orb, widen to EVERY orb in that module** (one `entry_orbs` row per
  `[0-9][0-9]_*.md` file the module has, not just its data-triage orb — a single-orb rerun does not
  re-run its siblings, `rerun.md`, so listing only data-triage would under-scope exactly this
  uncertain case) **and lower `confidence` on each** — never drop a material document silently.
- `why` — one plain-English sentence tying the document's content to that orb's declared inputs.
- `confidence` — 0–1, your certainty this orb (and not a neighbour) is the one the evidence hits.

**Tier discipline (`INTAKE.md` §5):** a tier-9 single-source anecdote (one channel check / one
expert call, N=1) **defaults to `note_only`** — clearing the materiality gate alone is NOT enough to
escape that default, since materiality only measures how much the claim would matter if true, not
whether one uncorroborated source is enough to believe it. It only earns an `entry_orbs` /
`rerun_plan.commands` recommendation when a SECOND, independent document in the pool (a different
provider/source_type, or a filing) makes the same claim — cite both in `why` when that happens. A
filing (tier 1–3) that changes a consumed number clears the gate on its own; it needs no
corroboration.

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
`""` for unknown strings, `[]`/`{}` for empties; never fabricate a value). Include `scan_date: "<TODAY>"`
and `scanned_at: "<SCANNED_AT>"` (the durable as-of watermark captured in Step 1), and author these
identity fields exactly: `schema_version: "1.1"`, `swarm: "research"`, `subject: "<TICKER>"`,
`ticker: "<TICKER>"`, `run_root: "<RUN_ROOT>"`, and
`decision_fingerprint: "<DECISION_FINGERPRINT>"`. These are **all required**,
including on the no-new-documents path. Copy the exact JSON array from `$EVIDENCE_INDEX` into the required
top-level `evidence_files` field without editing, summarising, or reordering it. Every row must appear
exactly once in `new_docs[]`; `rerun_plan.note_only[]` additionally references the subset that was read but
did not justify a rerun. A non-tier-9 document at or above the materiality gate must name at least one real
entry orb and have the matching command(s), each triggered by that exact path.
Then validate:

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
bash scripts/commit-run.sh "Intake plan: <TICKER> <SCAN_DATE>" -- "<JSON_PLAN_PATH>" "<MARKDOWN_PLAN_PATH>"
```

Substitute the two **exact literal paths printed in Step 6**. Do not use a wildcard, directory, or an
earlier same-day version: this commit belongs only to the JSON + markdown pair chosen by this turn.

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
- A tier-9 single-source note is `note_only` unless a second, independent document corroborates it.
- The schema and doctrine come from `frameworks/INTAKE.md`; this command does not redefine them.
