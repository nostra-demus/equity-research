# Document Intake — the scoped-rerun plan contract

Who reads this: each swarm's `<command_ns>:intake` command (including
`.claude/commands/research/intake.md`), the server intake reader (`ui/server/src/intake.ts`), the
cockpit intake surface, and any future swarm that ships its own `intake` command. It defines how the
engine turns **newly-arrived documents** into an
**intelligent, scoped rerun plan** — instead of the blunt "the whole run is stale, re-run
everything" default.

Why this exists: when a new document lands in a subject's data pool (a filing, a channel-check PDF in
`external/<provider>/`, an expert-call note), the pool's newest-file date jumps and
`completion.ts stalenessOf()` marks **every** earlier-vintage module `stale`. That is safe but
blunt — a single distributor channel check usually bears on one or two orbs, not all six modules.
This contract lets the engine READ the new evidence and say "of the modules the floor flags stale,
here is the minimal set that actually needs re-running, and why." It is a generalisation of
`review-decisions.md` Step 11 (`memo_delta.changed_sections[]`), re-pointed to be **document-first**
and decoupled from the decision-ledger outcome review.

---

## 1. The one inviolable rule — augment the floor, never replace it

The staleness floor (`ui/server/src/completion.ts` `stalenessOf()` / `thesisPlan()`) is a deliberate
over-approximation: any pool file newer than a module's vintage → `stale`. It can over-flag, but it
**cannot** falsely call something fresh — that is its safety property (CLAUDE.md §11, §24).

An LLM document→orb mapper is a **judgment** that can false-negative (miss an orb the new data
actually invalidated). Therefore the intake plan never weakens the deterministic floor:

- It NEVER moves a module from `stale` to `done`. The floor's per-module `state` is unchanged and
  the stale badges stay visible.
- It narrows the rerun to the exact invalidated orbs only after the server independently validates
  the evidence inventory, source decision, live roster, dependency cascade, owner lease, and budget.
  The "re-run everything stale" escape hatch remains available as an optional operator override.
- **Fail toward blunt.** Low mapper confidence, an unvalidatable module/agent name, or a
  missing/over-budget analysis → the plan widens to blanket-stale. Never away from it.
- **Automatic means no routine click.** The intake analysis runs automatically when new evidence
  arrives. A validated material plan then launches the exact scoped rerun automatically through the
  single-owner, fenced, budgeted executor. Unsafe, ambiguous, corrupt, or over-budget work stops and
  reports Needs attention; it never broadens or spends by guessing. Manual launch remains an override,
  not a required step.

---

## 2. Where the plan lives

The command writes into the **run root it is invalidating**, under the swarm manifest's
`run_root_template` (append-only, scan-dated):

```
analyses/<TICKER>_<DATE>/intake/<SCAN_DATE>_intake_plan.json     the machine-readable plan
analyses/<TICKER>_<DATE>/intake/<SCAN_DATE>_intake_plan.md       the human-readable twin

# A manifest-declared singleton swarm follows the same contract, for example:
commodity/runs/<COMMODITY>/intake/<SCAN_DATE>_intake_plan.json
commodity/runs/<COMMODITY>/intake/<SCAN_DATE>_intake_plan.md
```

Mirrors the proven `reviews/` pattern exactly: co-located with the run it is about, **never
overwritten** (`_v2`, `_v3`, … on a same-day collision), and swept into the audit dossier via the
`.md` twin. It is NOT written into the data pool (`data/`) — the pool is input evidence, and writing
engine output there would risk the `.nostradamus_output` recursion the delta scan guards against.

The server resolves the run through the selected swarm's manifest, reads its latest
`intake/*_intake_plan.json`, **re-validates and re-expands it authoritatively** (§4), and serves it at
`GET /api/intake/:subject?swarm=<swarm-id>`. An optional contained `runRoot` query selects the exact
historical run the cockpit is showing; it never silently falls back to a different run.

---

## 3. The `intake_plan.json` schema (v1.1)

```json
{
  "schema_version": "1.1",
  "swarm": "research",
  "subject": "AMZN",
  "ticker": "AMZN",
  "run_root": "analyses/AMZN_2026-07-04",
  "decision_fingerprint": "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "scan_date": "2026-07-12",
  "scanned_at": "2026-07-12T09:14:02.137Z",
  "evidence_files": [
    {"path": "data/AMZN/external/yipitdata/panel_q2.xlsx", "arrival_ms": 1783847642000},
    {"path": "data/AMZN/external/tegus/call_2026-07-02.txt", "arrival_ms": 1783847642100}
  ],
  "watermark": "analyses/AMZN_2026-07-04/final_thesis.md",
  "new_docs": [
    {
      "path": "data/AMZN/external/yipitdata/panel_q2.xlsx",
      "sha256": "…",
      "provider": "YipitData",
      "source_type": "alt_data_panel",
      "tier": 5,
      "as_of": "2026-06-30",
      "claims_summary": "Q2 NA online-store GMV +11% y/y, decelerating vs Q1 +14%.",
      "materiality_score": 72,
      "impact_direction": "negative",
      "entry_orbs": [
        { "module": "earnings", "agent": "revenue-drivers",
          "why": "The panel is the leading read on NA GMV, which revenue-drivers models directly (its WHAT-TO-READ lists alt-data panels).",
          "confidence": 0.8 }
      ]
    },
    {
      "path": "data/AMZN/external/tegus/call_2026-07-02.txt",
      "sha256": "…",
      "provider": "Tegus",
      "source_type": "expert_call",
      "tier": 9,
      "as_of": "2026-07-02",
      "claims_summary": "One customer described stable demand; this is colour, not a filing-backed change.",
      "materiality_score": 38,
      "impact_direction": "neutral",
      "entry_orbs": []
    }
  ],
  "rerun_plan": {
    "materiality_gate": 60,
    "entry_orbs": [ { "module": "earnings", "agent": "revenue-drivers" } ],
    "commands": [
      { "command": "/research:rerun earnings revenue-drivers AMZN",
        "module": "earnings", "agent": "revenue-drivers",
        "cascade_modules": ["earnings","balance-sheet-survival","management-governance","valuation","catalyst"],
        "triggered_by": ["data/AMZN/external/yipitdata/panel_q2.xlsx"] }
    ],
    "note_only": [
      { "path": "data/AMZN/external/tegus/call_2026-07-02.txt", "reason": "tier-9 single expert call, colour only, materiality 38 < gate" }
    ]
  },
  "verdict": "scoped_rerun",
  "summary": "One alt-data panel (tier 5) materially decelerates the NA GMV read; scope to earnings/revenue-drivers + downstream. One expert-call note judged immaterial."
}
```

**Field notes**

- `run_root` / `watermark` — the run this plan invalidates and the `-newer` basis (its
  terminal artifact, such as research `final_thesis.md` or a singleton swarm's
  `decision_record.json`). Both are repo-relative. The reader does not trust the file's `run_root`; it
  stamps the manifest-resolved, contained root onto the response.
- `decision_fingerprint` — required exact identity of the decision this plan was scoped against,
  supplied by the server/launcher as `sha256:<64 lowercase hex>` and authored verbatim. The reader
  independently recomputes the selected decision fingerprint. A missing, malformed, or stale fingerprint
  does not erase history: the plan remains visible for audit, but exposes zero paid-rerun commands until
  new-data analysis writes a fresh v1.1 plan. HTTP must never silently attach/rebind this field.
- `ticker` — schema-v1's compatibility name for the subject id. It is a ticker in research and the
  selected unit (for example, a commodity id) in another swarm. The reader also stamps explicit
  `swarm` and `subject` fields on its response, while retaining `ticker` for existing clients.
- `scan_date` / `scanned_at` — when the analysis read the pool. `scan_date` is the calendar day;
  `scanned_at` is a canonical UTC wall-clock with milliseconds (or finer), captured **before** the document
  scan using Python rather than whole-second `date`. These
  are the plan's own **durable** freshness witnesses: the plan file lives under a Git-tracked runs tree,
  so its filesystem mtime is rewritten forward by any checkout/clone/worktree/rebase and cannot prove when
  the analysis ran — but `scanned_at`, being JSON content, survives. The server uses it for `pool_current`
  (§4). Required on every plan, **including the no-new-documents plan** — it is what lets the cockpit safely
  affirm "no new data — everything read and considered" instead of staying silent.
- **A run does not erase its evidence cursor.** Before an ordinary full run launches any paid module, the
  launcher durably writes `intake/run_evidence_cursor.json`. `carryForwardScoped` also copies its authorising
  plan into the new run with `staged_for_scoped_rerun: true`. The next intake uses the copied plan's newest
  valid `scanned_at`, or otherwise the run cursor's `started_at`, as its discovery floor — never the later
  mtime of the new thesis. This guarantees that a second document landing while any run is in flight remains
  new and gets its own intake decision.
  File discovery uses `max(mtime, ctime)`, matching the server, so preserved source mtimes cannot hide a
  locally-arrived file.
- `new_docs[]` — one row per document newer than the watermark. `provider` / `source_type` / `tier`
  / `as_of` come from the doc's `.source.json` sidecar or the extract manifest `provenance`
  (`frameworks/EXTERNAL_DATA.md`); a plain (non-external) filing has `external: false`-style nulls
  and a `tier` inferred from its document type (CLAUDE.md §4).
- `evidence_files[]` — the deterministic scanner's complete list of eligible pool files newer than the
  recovered run cursor, captured before any LLM classification. Each row has the canonical repo-relative
  `path` and integer `arrival_ms = floor(max(mtimeMs, ctimeMs))`. The server independently re-lists the
  pool and requires every eligible path through the plan's `scanned_at` to occur exactly once here and in
  `new_docs[]`. `rerun_plan.note_only[]` then references the subset judged immaterial; it never replaces
  the full `new_docs[]` evidence row. This is the no-omission witness: a valid-looking model
  response cannot silently call a real filing “nothing changed.” It is required, including as `[]` on a
  genuinely empty delta.
- `materiality_score` (0–100) + `impact_direction` (`positive | negative | mixed | neutral`) — same
  calibration as `review-decisions` Step 11 / `DECISION_LEDGER.md` §8, so the two surfaces stay
  comparable.
- `entry_orbs[]` — the specific orbs the document's evidence bears on, each with a plain-English
  `why` and a `confidence` (0–1). **Every `module`/`agent` name is discovered from the selected
  swarm's roster** (flat research modules or nested manifest-swarm modules), never guessed.
- `rerun_plan.commands[]` — the derived, ordered `/<command_ns>:rerun` commands. The command *proposes*
  `cascade_modules`, but **the server recomputes them authoritatively** from
  `roster.ts downstreamCascade` at read time (single source of truth — a hand-written cascade can
  never drift from the live DAG).
- `rerun_plan.note_only[]` — references to `new_docs[]` documents seen and judged immaterial (below the gate, or a tier-9
  single-source anecdote): recorded honestly, no rerun. `verdict: "note_only"` when nothing clears
  the gate; `"insufficient"` when the run/data can't support a judgment.

---

## 4. How the server consumes it (validation + re-expansion)

`ui/server/src/intake.ts` `readIntakePlan(subject, { swarmId?, runRoot? })` is the authoritative
reader (`swarmId` defaults to research for backward compatibility). It:

1. Normalizes the subject through the shared manifest-aware subject contract (research keeps its strict
   exchange-symbol grammar; another swarm may use the longer manifest subject grammar), then resolves its
   concrete run directory from the selected swarm's `runs_root`, `run_root_template`, and `placeholder`.
   Without `runRoot`, display reads prefer the newest finished intake baseline: research preserves its
   command's historical rule that either a contained `final_thesis.md` **or** object
   `decision_record.json` is finished; a manifest swarm requires its exact object
   `decision_record.json`. Research alone falls back to its newest staged/in-flight folder when no run has
   ever finished, preserving scoped-retry behavior; another swarm without its decision returns `null`.
   With `runRoot`, the exact root must be inside that swarm's real runs tree **and** match the manifest
   template for this exact subject. Traversal, a symlink escape, another subject's root, another swarm's
   root, an unknown swarm, or a missing root returns `null` — never a fallback. The sibling
   `latestPlanFileFor(subject, { swarmId?, runRoot? })` uses newest-run-wins when no exact root is supplied,
   preserving research scoped-staging retries. Plan files and their `intake/` directory are also
   realpath-contained beneath that exact run.
2. **Freezes and validates identity/evidence paths.** Schema-v1 `ticker` and any explicit `subject` /
   `swarm` must exactly match the server-selected, manifest-normalized identity. The response is stamped
   with that `swarm`, `subject`, compatibility `ticker`, and contained `run_root`; conflicting prompt text
   fails the whole plan closed. Every `new_docs[].path`, `commands[].triggered_by[]`, and
   `note_only[].path` must be a canonical repo-relative descendant of the configured
   `data/<subject>/` pool. Absolute paths, `.`/`..` aliases, double-slash aliases, control characters,
   cross-subject paths, directories, and nested symlink redirects return `null`; a canonical audit path
   whose file was removed after analysis may remain.
3. **Validates every name against that swarm's discovered roster** (`listModuleNames` /
   `agentNamesForModule`, both passed `swarmId`). An `entry_orb` or command naming an unknown
   module/agent is **dropped**,
   and that document is widened to blanket-stale (a `widened` note), never emitted as a launchable
   bad command (fail-closed — the mapper cannot hallucinate a `/research:rerun badmodule …`).
4. **Rebuilds the command string** from the manifest's `command_ns`, the validated module/agent, and
   the server-selected subject; the prompt-written `command` is never trusted. It also recomputes
   `cascade_modules` from `downstreamCascade(module, agent, swarmId)` — the same selected-swarm DAG
   the rerun command and admission use.
5. **Stamps `pool_current`** (derived, never trusted from the file): `true` iff the pool has gained nothing
   since the analysis read it — i.e. this analysis provably accounts for the whole current pool. This is
   the safety gate on the cockpit's affirmative *"no new data — everything's been read and considered"*
   message: that line may only be shown when `new_docs` is empty **and** `pool_current` is `true`. When a
   file lands after the analysis, `pool_current` is `false` and the cockpit prompts a re-analysis instead —
   so a document dropped after the last check is **never** reported as "nothing new" (§1 fail-toward-blunt).
   The freshness witness is **durable, never the plan file's mtime**: run-tree mtimes are rewritten
   forward by any git checkout/clone/worktree/rebase (a fresh deploy tree, a standby-failover checkout) —
   always toward a falsely-fresh verdict — while `data/` mtimes are durable. `pool_current` is `true` only
   when **both** hold: (a) the plan's own recorded `scanned_at` (precise) — or `scan_date` (date-granular,
   **strict** — a same-day file counts as unread) for older plans — proves nothing landed since the analysis
   read the pool (over `dataPoolNewest`'s `max(mtime, ctime)`, so a doc dropped in with a preserved-older
   mtime still counts via its local ctime); AND (b) the **durable staleness floor** agrees — no pool file is
   dated after the run's durable vintage. A dated run gets that vintage from a date-valued token in its
   manifest `run_root_template` (never from date-looking subject text); a singleton run gets it from a
   strictly valid terminal-record `decision_date`. (b) is the belt-and-suspenders for the
   fact that the command's own `find -newer <terminal-artifact>` discovery baseline is itself non-durable
   (the watermark's mtime is bumped the same way), so the command falls back to the run/decision date when
   it detects a bumped watermark, and
   the server never lets the dock's "all considered" contradict the stale badges the floor already shows.
   Fail-safe by construction: any doubt (no witness, a future stamp, a missing singleton
   `decision_date`, or a floor disagreement) resolves to `false` — a re-analysis nudge, never a false
   affirmative.
6. **Binds actionability and one-time use to content, not server memory.** The reader hashes the canonical
   raw plan as `plan_sha256` (sorted-key JSON, excluding only the server's
   `staged_for_scoped_rerun` copy flag), stamps its canonical repo-relative `plan_path`, and exposes
   `actionable: true` only when the authored `decision_fingerprint` is still the exact decision authority.
   A successful exact **single-orb** rerun writes an append-only receipt under
   `<RUN_ROOT>/intake/receipts/` before the same `commit-run.sh` call that commits the refreshed decision.
   The receipt uses `schema_version: "intake-execution-receipt/1"` and binds: its own canonical SHA-256
   `receipt_id`; swarm/subject/run root; source plan path + plan SHA-256; source decision fingerprint; the
   exact decision fingerprint the orb executed against; exact executed `{module, agent}` pair(s);
   canonical UTC completion time; and the resulting decision
   fingerprint/id (id is nullable). The reader accepts only contained regular files with the exact schema,
   a valid self-hash/filename prefix, the same plan hash/source identity, and roster-valid orbs that occur
   in that plan. It removes only those proved commands. Thus one orb cannot be bought twice, a partial plan
   retains its other orbs, a same-byte decision is still consumed, and a tampered receipt proves nothing.
   Ordinary graph reruns not launched from a matching live plan write no receipt.

   Research's **scoped batch** keeps its separate durable proof: `carryForwardScoped` copies this exact plan
   into the staging root with `staged_for_scoped_rerun: true`; only that root's completed terminal pair
   retires the copied plan. Its source fingerprint remains the authority while staging is incomplete, so a
   failed/in-flight batch can be retried. It does not mint per-orb receipts or alter `/research:full`.

The response is advisory across every swarm. A roster-valid commodity plan therefore exposes rebuilt
`/commodity:rerun …` commands and its `swarm: "commodity"` identity, but it does **not** enable research's
copy-forward batch staging. Commodity keeps its singleton run root and executes only through its existing
single rerun command path. A server/UI must gate any batch executor separately from plan readability; the
presence of a generic intake plan is not permission to copy or stage a non-research run.

The plan the server serves is therefore always roster-consistent, even if the command drifted.

---

## 5. Materiality & tier gating (recap)

- Recommend a rerun only when `materiality_score` ≥ `materiality_gate` (default 60) AND the change
  invalidates inputs the orb relied on — not for every wiggle (identical to `review-decisions`
  Step 11).
- A **tier-9 single-source** anecdote (one channel check / one expert call, N=1) defaults to
  `note_only` — it can *raise a question* against a filing-anchored number but does not by itself
  force a rerun of it (CLAUDE.md §4; `EXTERNAL_DATA.md` §4). It still appears as a `new_doc` and the
  floor still marks the run stale; the *recommended action* is calibrated to the tier.
- A filing (tier 1–3) that changes a number an orb consumes clears the gate readily.
- A **screener-bridged event** (`screener_event_<EVENT_ID>.md`, written automatically for an exact
  tracked-company match or optionally by "Send to research" — `ui/server/src/research-bridge.ts`) is
  source-aware. An event the news firewall classified as `primary_filing` keeps its official filing /
  exchange-disclosure provenance and primary-source URL. It may clear the gate when its headline or
  lede identifies a material changed input, so the affected web-capable orb can open, read, and cite
  the linked disclosure. The note is only a locator: no thesis claim may cite it instead of the filing.
  Every other bridged event self-declares **tier 10** (dated web source, unverified). It appears as a
  `new_doc`, the floor marks the run stale, and a single uncorroborated wire claim defaults to
  `note_only` unless a filing or second **independent** source in the pool backs the same fact (the
  note's "Related wire coverage" section lists leads to check). Independence is by ORIGIN, not by
  file: the note's own "Screener
  enrichment" section (the engine's inference from the same article — §6 level 1, never citable as
  the source), another outlet's syndicated copy of the same story (the note records its
  `Story cluster` id; the bridge already refuses to write two notes for one cluster), and a
  `screener_thesis_*.md` handoff memo built on the same event all share one origin — together they
  are ONE source, not corroboration. Exact automatic routing remains opt-in and single-owner
  (`SCREENER_RESEARCH_BRIDGE=1`); every route is logged. Once a new note lands, intake and any exact
  validated rerun proceed automatically. A manual send follows the same pipeline.

---

## 6. Zero-touch (CLAUDE.md §26)

No swarm family, module, or agent name is hardcoded in the server reader. It derives command namespace,
run-root shape, roster, and dependency DAG from the selected manifest and discovered graph. The command
discovers the roster and reads each orb's own `description:` / `WHAT TO READ` / `depends_on`; the server
validates/expands via `roster.ts`. A future swarm that ships its own `<ns>:intake` command and writes the
same schema into its manifest-owned run root gets the same read surface for free. Whether that swarm
supports individual reruns, batch reruns, or recommendation-only display remains an explicit routing
capability outside this schema — never inferred from a family name in `intake.ts`.

---

## 7. Exact single-orb execution receipt (writer protocol)

The cockpit may append an intake receipt intent to an exact rerun command:

```
/<namespace>:rerun <MODULE> <AGENT> <SUBJECT> <RUN_ROOT> <CURRENT_DECISION_FINGERPRINT> \
  <PLAN_PATH> <PLAN_SHA256> <SOURCE_DECISION_FINGERPRINT>
```

Before the first paid Task call, the rerun command must fail closed unless all of these hold:

- the three fingerprints have the exact `sha256:<64 lowercase hex>` shape;
- recomputing the exact current decision fingerprint from `<RUN_ROOT>` (with research corrections applied)
  byte-equals `CURRENT_DECISION_FINGERPRINT`;
- `PLAN_PATH` is a canonical repo-relative regular non-symlink directly in `<RUN_ROOT>/intake/`;
- parsing the plan yields an object whose `decision_fingerprint` byte-equals
  `SOURCE_DECISION_FINGERPRINT`;
- `PLAN_SHA256` equals SHA-256 of canonical sorted-key JSON for that object after deleting only
  `staged_for_scoped_rerun` (if present); and
- the plan contains the exact roster-valid `{module, agent}` command about to run.

These checks MUST be performed by `scripts/intake_execution_receipt.py preflight`; prompt prose never
reimplements them. The helper also validates every committed prior receipt, requires a contiguous chain
from the source plan decision to `CURRENT_DECISION_FINGERPRINT`, and refuses an orb already proved.

If no receipt intent was appended, the rerun follows its ordinary graph-refresh path and writes no intake
receipt. Never infer a plan by looking for “latest” inside the command.

After all terminal synthesis, finish-gate, and archive steps succeed—but immediately before the one
`commit-run.sh` call—the command writes exactly one create-only JSON file under
`<RUN_ROOT>/intake/receipts/`. It computes the resulting decision fingerprint by the same recipe as the
server: `sha256(run_root + "\n" + canonical_json(effective_decision_record))`; research first applies
`scripts.ledger_records.load_one(RUN_ROOT)`, while another swarm uses its terminal current record. The
payload is exactly:

```json
{
  "schema_version": "intake-execution-receipt/1",
  "receipt_id": "sha256:<hash of every other field in this object>",
  "swarm": "research",
  "subject": "AMZN",
  "run_root": "analyses/AMZN_2026-07-04",
  "plan_path": "analyses/AMZN_2026-07-04/intake/2026-07-12_intake_plan.json",
  "plan_sha256": "sha256:<64 lowercase hex>",
  "source_decision_fingerprint": "sha256:<64 lowercase hex>",
  "executed_against_decision_fingerprint": "sha256:<the exact current decision before this rerun>",
  "executed_orbs": [{ "module": "earnings", "agent": "revenue-drivers" }],
  "completed_at": "2026-07-12T10:03:14.219Z",
  "result_decision_fingerprint": "sha256:<64 lowercase hex>",
  "result_decision_id": null
}
```

Use canonical sorted-key JSON for both hashes. Filename:
`YYYYMMDDTHHMMSSmmmZ_<first-12-hex-of-receipt-id>.json`. Create the receipts directory only after
re-validating that `intake/` is a real direct child and is not a symlink; create the receipt with exclusive
create semantics (never overwrite). Include it in the **same run-root commit** as the rerun. If the commit
fails, delete the uncommitted receipt and report failure. The server independently requires its exact bytes
to exist in Git `HEAD`, so a crash between write and commit cannot consume an orb.
The command MUST use `scripts/intake_execution_receipt.py create` (including
`--executed-against-decision-fingerprint`) and `cleanup`; the helper exclusively creates/unlinks by a
no-follow directory handle. Before creating it re-reads committed history, rejects duplicate plan/orb
spend, and requires the prior chain to end at the executed-against fingerprint. The server counts only a
valid contiguous prefix ending at the current effective decision; a reverted/diverged chain freezes the
plan for re-analysis and never credits a later branch's orb.
