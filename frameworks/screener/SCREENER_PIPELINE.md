# SCREENER_PIPELINE.md — Shared per-module pipeline for screener orchestrators

This adapts `frameworks/MODULE_PIPELINE.md` (the research swarm's pipeline) to the screener swarm. The discovery → dispatch → persist → verify loop is IDENTICAL — read MODULE_PIPELINE.md Steps 2, 3, 4A, 4B for the mechanics and apply them with the substitutions below. This file states only what differs.

**Who reads this:** the `/screener:*` orchestrator command files. Agents themselves never read it.

---

## Substitutions vs MODULE_PIPELINE.md

| MODULE_PIPELINE.md term | Screener value |
|---|---|
| `<TICKER>` | `<SIG_ID>` — the signal id (`SIG-YYYYMMDD-<8char_hash>`) |
| `<RUN_ROOT>` = `analyses/<TICKER>_<DATE>` | `<RUN_ROOT>` = `screener/runs/<SIG_ID>` |
| Agents root `.claude/agents/<MODULE>/` | `.claude/agents/screener/<MODULE>/` |
| `DATA_PATH` = `data/<TICKER>/` | none — the input is `<RUN_ROOT>/intake.json`, the ledger at `screener/ledger/`, and the web (per the swarm's stage source policy) |
| Step 1.5 workbook pre-extraction | **Skipped.** There is no per-ticker data pool. |
| Fail-fast verdict regex (`insufficient`) | The routing contract below |
| Module tiers (memo + dossier, Step 4.9) | **Skipped in v1.** The thesis record + board index are the machine tiers; the synthesis md is the readable tier. |

Task message template (replaces the MODULE_PIPELINE.md Step 4A message): substitute the first sentence with:

> Process screener signal <SIG_ID>. Run root: screener/runs/<SIG_ID>/. Intake file: screener/runs/<SIG_ID>/intake.json. Ledger root: screener/ledger/. Today's date: <DATE>. <CROSS_MODULE_CONTEXT — or omit if none>. Follow your system prompt and produce your complete report formatted exactly per your REPORT STRUCTURE section. Then persist it to the exact path `<OUTPUT_PATH>` …

…and continue with the SAME persistence contract wording as MODULE_PIPELINE.md Step 4A (Modes A/B/C, clean file, no chat-confirmation block, no git). Step 4B verification is identical (`test -s`, starts with `#`, no stray confirmation block).

`<CROSS_MODULE_CONTEXT>` for screener modules uses the same sentence form, e.g. `Signal-gate cross-module path: screener/runs/<SIG_ID>/signal-gate/.`

---

## The routing contract (replaces Step 4C fail-fast)

The swarm manifest (`.claude/agents/screener/SWARM.md` frontmatter `routing:`) defines the contract:

- Every module synthesis (and the Layer-0 intake gate) ends its report with a `## Routing` section containing greppable labelled lines — at minimum `Routing: <value>`; plus the module's own metrics (`Materiality: NN`, `Edge score: NN`, `Next module: <module-or-none>`).
- After each module completes, the orchestrator reads the synthesis output (for `signal-gate`, ALSO the `00` intake output, which can terminate early) and extracts the `Routing:` line:

```
grep -iE '^[*_[:space:]]*routing[*_:[:space:]]+' "<RUN_ROOT>/<MODULE>/<file>.md" | head -1
```

- If the value is in `routing.terminal` → **stop the pipeline** after this module. This is a valid, recorded outcome (a rejection is a result), not an error.
- If the value is in `routing.continue` → proceed to the next module in dependency order.
- `candidate-surfacing` additionally runs ONLY when the edge-definition routing is `provisional` or `full_machine`.
- Unknown routing value → treat as terminal, flag loudly in the final report (never guess "continue").

---

## Module order

Derived from each module's `99_*-synthesis.md` `depends_on`, exactly like `/research:full` step 4 (topological sort, alphabetical tiebreak), discovered via Glob `.claude/agents/screener/*/99_*-synthesis.md`. Today that yields: `signal-gate` → `thesis-structure` → `edge-definition` → `thesis-integrity` → `candidate-surfacing`. Never hardcode this order — derive it.

---

## State updates (after each module, owned by the orchestrator)

- After `signal-gate`: append the event line to `screener/ledger/events.ndjson` if the agent has not already done so (idempotent on `signal_id`; use `scripts/append-ndjson.sh`).
- After `edge-definition`: verify `<RUN_ROOT>/thesis_record.json` exists, is valid against the schema, has `locked: true`, and is copied to `screener/ledger/theses/<thesis_id>.json`.
- After `thesis-integrity`: verify `<RUN_ROOT>/thesis_integrity_review.json` (or its latest `_vN`) exists and is valid against the schema. It is a run-root audit artifact, like `pre_mortem.json` in the research swarm — but unlike `pre_mortem.json`, its verdict IS additively propagated onto the ledger copy of the thesis it reviewed: run `python3 scripts/screener_patch_integrity_review.py <THESIS_ID>` (mirrors `/research:full` step 10B.2's pre-mortem → `decision_record.json` propagation). It writes only a new top-level `integrity_review` key on `screener/ledger/theses/<thesis_id>.json` — `meta`, `locked`, and every `M0_x` field stay frozen, and `<RUN_ROOT>/thesis_record.json` is never touched. Without this, `update_board_index.py` and `screener_calibrate.py` have no way to see that the gate ran at all, let alone what it found (see `.claude/commands/screener/signal.md` step 6).
- After `candidate-surfacing`: verify `<RUN_ROOT>/candidates.json` exists and is copied to `screener/ledger/candidates/<thesis_id>.json`.
- After EVERY module (including a terminal stop): refresh the board index:

```
python3 scripts/update_board_index.py
```

It rebuilds `screener/board/index.json` deterministically from the ledger + run folders (never trust an agent to hand-edit board JSON).

---

## Hard rules

- Same as MODULE_PIPELINE.md: no hardcoded agent names; new `NN_*.md` files with `layer:` frontmatter are picked up automatically; the pipeline writes only inside `<RUN_ROOT>/<MODULE>/` (plus the run-root JSON artifacts its syntheses own and the ledger/board updates listed above).
- A terminal routing is reported as a completed pipeline with that routing — never as a failure.

## Publication schema admission

The supervisor and `scripts/commit-run.sh` use the same trusted publication contract from `SWARM.md`.
`schemas_root` names a canonical, contained, non-symlink repository directory. A schema-bearing manifest
also declares `publication_schemas`, a list of strings in either form:

```yaml
publication_schemas:
  - "run:signal_payload.json=signal_payload.schema.json"
  - "run:thesis_integrity_review_v*.json=thesis_integrity_review.schema.json"
  - "ledger:theses/*.json=thesis_record.schema.json"
  - "ledger:conviction/conviction_state/*.json=conviction.schema.json"
```

The left path is relative to the declared run root or ledger root. Wildcards match within one path
component; version globs describe only existing files. The right path is relative to `schemas_root`.
Payload fields never choose schemas. Missing declarations on a schema-bearing manifest, missing or
ambiguous schemas, traversal, symlinked program paths, and external schema references fail closed.
The canonical dependency-free checker supports the schemas' internal references. An explicit
`publication_schemas: []` delegates to an existing stronger swarm-specific validator; it is not schema
approval. The commodity archive path declares this delegation and retains all its own checks.

An existing auxiliary command may use a different execution root from the canonical signal template.
`publication_auxiliary_roots` explicitly binds each such execution kind to its root pattern:

```yaml
publication_auxiliary_roots:
  - "conviction=screener/ledger/conviction/runs/CHK-????????-??"
  - "sweep=screener/inbox"
  - "handoff=screener/ledger"
```

The supervisor supplies its admitted parent swarm, execution kind, and display unit through
`--schema-swarm`, `--schema-kind`, and `--schema-unit` alongside `--schema-contract`. All three are
required together. The unit must match the owning manifest's `unit`; it does not classify the execution
kind (a conviction run still has the signal display unit). The shared resolver always classifies a
canonical template root first, including when an auxiliary kind is supplied. Only a unique explicit
auxiliary kind/root match returns `classification: auxiliary`, `declared: false`, and no run-stage
artifacts. Canonical roots return `classification: canonical`. Unknown, mismatched, ambiguous, malformed,
or linked roots fail closed, including a missing leaf beneath an existing linked ancestor. A raw
`--schema-contract` call without parent context never grants auxiliary status. This classification
does not affect `--records`, `--select`, or `--check`: new or changed mapped ledger leaves, including
conviction-state leaves, still receive their exact frozen/index validation.

Before a tracked attempt starts, the supervisor records baselines for the declared run artifacts. Before
its first durable publication mutation, it selects only artifacts authored by that attempt and validates
their frozen bytes, including any proposed ledger projection, through
`decision_publication_gate.py --schema-records`. An explicit preflight accepts no empty or unmapped list.
A valid early stop need not have a fresh thesis; a stale retained thesis is preserved and does not become
fresh merely because the command stopped early.

The supervisor rechecks exact snapshot bytes before sealing a publication receipt. `commit-run.sh`
rechecks the exact Git-index blobs using the same resolver. Changed schema-bearing artifacts cannot bypass
the first check by changing later, and unchanged malformed history is never regraded. Shared derived boards
are not schema-admission targets: their historical entries remain subject to the separate existing review
and repair procedures. Every future swarm opts in through trusted manifest metadata rather than a central
swarm-name or artifact-name registry.

`conviction.schema.json` covers the individual derived state leaves written by
`screener_emit_checkpoints.py` and `screener_rescore.py`; newly changed leaves are included in exact
snapshot/index validation. The row definitions for checkpoints, validations, and conviction events remain
with those deterministic transaction writers. This admission gate does not retrovalidate whole NDJSON
histories or claim that snapshot validation alone proves every earlier projection write was schema-checked.

The standalone deterministic writers additionally use the same gate's `admit_schema_records` callable
inside their repository mutation transaction, from source reading through the first write. They supply
the exact mapped bytes they actually consumed, retaining the regular HEAD-identical input exemption;
an exempt historical input is not a new schema approval. Planned new conviction-state images are checked
strictly, including images recovered from the journal. The seeder plans and judges the entire selected
batch before appending any checkpoint or event, including terminal archive and recovery paths. The
rescorer judges both normal and retry projections before their writes. The board builder judges its
actually consumed mapped inputs before opening its output file, without regrading its historical output
rows or treating unmapped candidate/NDJSON stores as checked. Explicit empty or unmapped callable pairs
fail closed; a board build consuming no mapped inputs reports that limited check as not applicable.
Consumed bytes, schema bindings and HEAD must remain unchanged through admission, while the mutation
lease remains held through publication. Exact snapshot/index checks still run afterward independently.
