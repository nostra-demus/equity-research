# Incremental Rerun — the early-cutoff cascade contract

This file is the single source of truth for how a rerun (`/research:rerun`, `/commodity:rerun`)
avoids paying for downstream work the new evidence provably did not change. Both rerun commands and
the cockpit server bind to the rules and the manifest schema here; neither redefines them.

The problem it solves: a rerun used to re-run the target orb and then EVERY transitively downstream
module synthesis, the master synthesizer, and every memo/dossier tier — strictly one at a time —
even when the refreshed output carried the exact same decision. For a business-model orb that was
~15 sequential LLM tasks (~$30+, over an hour of wall-clock) to fold in one news item that the
intake layer had already judged immaterial. The engine now stops the cascade at the first point
where it can PROVE nothing decision-bearing changed, runs whatever remains in dependency-ordered
concurrent waves, and reports honestly what it skipped and why.

---

## 1. Doctrine grounding — why this cutoff is legal

- **INTAKE.md §1 still stands:** advisory LLM judgment may never mark work fresh. The cutoff here
  involves NO LLM judgment. It is a deterministic comparison (`scripts/decision_surface.py`) of the
  old vs new version of an output the engine just paid to regenerate — the same class of check as
  byte-equality, which READINESS_GATE_DESIGN.md already blessed for hash-gated re-work.
- **The node itself always runs.** Early cutoff never skips the work the new evidence points at; it
  skips downstream RE-SYNTHESIS whose refreshed inputs are decision-identical to what that
  synthesis already read. This is the output-side twin of the intake plan's input-side scoping.
- **Fail toward blunt (CLAUDE.md §11/§24).** Any doubt — a parse failure, a missing old snapshot,
  an empty surface, an extractor error — counts as CHANGED and the cascade proceeds. A prune
  requires positive, deterministic proof of equality; silence or breakage never prunes.
- **Nothing is skipped silently (§5).** Every pruned node is recorded in the rerun manifest with
  its reason and the diff evidence, committed with the run. The cockpit shows pruned orbs as
  "skipped — upstream unchanged", never as done and never as missing.
- **§22 defines the surface.** Downstream synthesis layers adjudicate each module's *verdict,
  scores, caps, and red flags* — so those (plus the numeric anchors of the verdict block and any
  fenced machine-readable JSON) ARE the decision surface. Free prose is excluded because a
  regenerated report always rewords it; the surface is exactly the part that is stable when — and
  only when — the decision is stable.

## 2. The decision surface

`scripts/decision_surface.py` (pure, importable, selftested; CLI `extract` / `diff`) reduces a
report to:

| Field | What it captures | Stable across regeneration? |
| --- | --- | --- |
| `verdict` | the bold enum span of the `- **Verdict:**` line (not the rationale tail) | yes — module rules fix the category vocabulary |
| `scores` | every `<label> /100: <value>` bullet: value verbatim (number or "Not assessable"), inverted flag, inline cap tags/limits | yes — numbers and caps only |
| `cap_table` | Score Cap Application rows: trigger, Applied? Y/N, numeric caps | yes |
| `filter_statuses` | §24 filter lines (`Filter N … Tripped/Not tripped`) and standalone `… CAP: [NOT] triggered` lines | yes |
| `disqualifier` | disqualifier-check table Y-count, verdict-lock line, `Disqualifier triggered: Y/N` bullet | yes |
| `fired_tags` | RF-tags that fired as standalone lines (`rating_caps._tag_fired_standalone` semantics, imported — one source of truth) | yes |
| `numeric_anchors` | every labelled bullet in the Verdict section whose value carries digits, reduced to its digit tuple (fair-value levels, current price, red-flag counts…) | yes |
| `fenced_json` | named machine-readable fenced JSON blocks (e.g. `governance_summary.json`), parsed | yes |

Comparison rules:
- Byte-identical files are UNCHANGED without parsing (strongest proof, checked first).
- `parse_ok: false` on EITHER side ⇒ CHANGED (an unparseable report must never prune).
- An empty surface (no verdict AND no scores) is a parse failure by definition.
- CLI `diff` exit codes: `0` unchanged, `3` changed, `2` error — callers MUST treat `2` as changed.

## 3. Where pruning is legal — node rules

The cascade nodes are exactly what `downstreamCascade` derives from the discovered `depends_on`
graph (§26 — no hardcoded names): the target orb(s), each affected module's `99_*-synthesis.md`,
and (research swarm only) the master synthesizer.

1. **Target orbs always regenerate.** A rerun is a deliberate refresh (MODULE_PIPELINE Step 4A's
   presence-skip does not apply). Snapshot the old output to a temp path BEFORE dispatching; no
   snapshot ⇒ the orb counts as changed.
2. **The target's own module synthesis re-runs whenever the orb's output changed at all**
   (byte-inequality after the rerun). Specialist orb formats are free-form, so no surface-level
   judgment is made at the orb → own-99 edge — only byte-identity may prune it (rare, but free to
   check). The module-synthesis format is the standardized decision-of-record, which is why the
   surface comparison binds at 99-boundaries and not below.
3. **Dirty propagation between modules.** After a module's 99 re-runs, diff its old vs new
   decision surface: `changed` marks the module DIRTY, `unchanged` marks it CLEAN. A downstream
   cascade module re-runs its 99 iff at least one of its in-cascade dependencies is DIRTY; if every
   in-cascade dependency resolved CLEAN, the module is PRUNED (its inputs are decision-identical to
   what its existing synthesis already adjudicated — its own specialists were never re-run, so no
   other input of it moved). A pruned module is CLEAN for propagation purposes.
4. **The master synthesizer re-runs iff any module resolved DIRTY** (or the rerun targeted
   `master` directly). When master is pruned, the decision of record (`final_thesis.md` +
   `decision_record.json`) is untouched — so the deterministic finish-gate, the run memo, and the
   audit dossier are all correctly skipped too: there is nothing new to gate or re-project. When
   master re-runs, the finish-gate runs unconditionally, exactly as before.
5. **Tier refreshes follow bytes, not the cascade.** A module's memo + dossier refresh iff its
   `99_*-synthesis.md` bytes changed (a re-run that reproduced a byte-identical synthesis — or a
   pruned module — leaves its tiers alone; a changed synthesis must never keep a stale memo).
   All tier refreshes are batched off the critical path (§5 below).

## 4. Wave scheduling — parallelism inside one rerun session

The cascade runs as topological WAVES over the dirty set, all Task dispatches of a wave issued in a
single message (the established MODULE_PIPELINE Step 4A batching mechanism — the server does not
throttle in-session Task concurrency):

- **Wave 0:** all entry orbs, concurrently (they are distinct files; a multi-orb rerun pays one
  wave for N orbs).
- **Wave k:** every not-yet-decided cascade module whose in-cascade dependencies are all decided
  (DIRTY or CLEAN) — re-run the DIRTY-fed ones concurrently, prune the rest in the same pass.
  Strict `depends_on` topological order is preserved by construction: a module never runs before
  its cascade dependencies are decided.
- **Final wave:** master (research swarm), when §3.4 says it runs.

## 5. Off-critical-path tiers

After the last decision-bearing node, batch in ONE concurrent message: the module memos of every
byte-changed module + (if master re-ran) the run memo. The deterministic pieces — module dossiers,
the audit dossier, the Step-8A finish-gate — run alongside via Bash at zero LLM cost. Nothing
downstream reads a memo or dossier (the master reads `99_*-synthesis.md`; dossiers exclude memos),
so this is output-neutral — the same argument that already justifies `.defer_module_memos`.

## 6. The rerun manifest — schema `rerun_manifest/v1`

The orchestrator writes `<RUN_ROOT>/reruns/<DATE>_rerun_manifest.json` (append-only: `_v2`, `_v3`…
if the basename exists, exactly like intake plans) plus a short human-readable `.md` twin at the
end. Write the JSON at planning time and UPDATE it after every wave — the cockpit watches it live
to turn pruned nodes into "skipped" orbs and shrink the ETA. It is engine research-data (§25): it
commits with the run folder.

```json
{
  "schema": "rerun_manifest/v1",
  "ticker": "EMAAR",
  "run_root": "analyses/EMAAR_2026-07-10",
  "command": "/research:rerun business-model external-dependency EMAAR",
  "started_at": "2026-07-16T18:20:04Z",
  "updated_at": "2026-07-16T18:31:40Z",
  "entry_orbs": [
    { "module": "business-model", "agent": "external-dependency", "key": "business-model/10_external-dependency" }
  ],
  "nodes": [
    { "key": "business-model/10_external-dependency", "role": "target",
      "status": "done", "wave": 0, "output_changed": true, "surface_changed": true,
      "reasons": ["score 'external dependency risk': 63 → 66"] },
    { "key": "business-model/99_business-model-synthesis", "role": "synthesis",
      "status": "done", "wave": 1, "output_changed": true, "surface_changed": false, "reasons": [] },
    { "key": "earnings/99_earnings-synthesis", "role": "synthesis",
      "status": "pruned", "wave": null, "surface_changed": null,
      "pruned_because": "all in-cascade dependencies resolved CLEAN (business-model surface unchanged)" },
    { "key": "master/synthesizer", "role": "master",
      "status": "pruned", "wave": null, "surface_changed": null,
      "pruned_because": "no module resolved DIRTY — decision of record untouched" }
  ],
  "tiers": { "module_memos_refreshed": ["business-model"], "dossiers_refreshed": ["business-model"],
             "run_memo": "skipped — master pruned", "audit_dossier": "skipped — master pruned" },
  "result": { "llm_tasks_run": 2, "llm_tasks_pruned": 6, "decision_of_record_changed": false }
}
```

Rules:
- `key` uses the cockpit's expected-orb identity exactly: `<module>/<NN>_<slug>` for orbs and
  syntheses, `master/synthesizer` for the master. Keys come from the same discovery globs as the
  cascade — never hand-written names.
- `status` ∈ `planned | running | done | pruned | failed`. The server maps `pruned` → the orb
  status `skipped` and emits it live; `done`/`failed` stay owned by the file-watcher and stream
  signals, so the manifest only ANNOTATES — it can never mark real work done.
- `surface_changed: null` on nodes that never ran. Every `pruned` node carries `pruned_because`.
- The `.md` twin is a one-page §21 plain-English rendering of the same facts (what re-ran, what
  was skipped and why, what the decision of record did).

## 7. Multi-orb entry

One rerun may carry several entry orbs — the normal case for an intake plan that maps one document
onto two or three orbs. The command form appends pairs before the ticker:

```
/research:rerun <MODULE1> <AGENT1> [<MODULE2> <AGENT2> …] <TICKER>
```

(an odd token count ≥ 3; the legacy 3-token form is the 1-pair case). The cascade is the UNION of
each entry's cascade, deduplicated by key, syntheses in graph topological order, master once at the
end — computed by the same discovery the single-orb path uses. Entry orbs all run in Wave 0; a
module containing several entry orbs still re-runs its 99 once. Two entry orbs this way cost ONE
shared downstream cascade instead of two sequential full cascades (admission keeps reruns
subject-exclusive, so the alternative was strictly serial duplication of master + memo + commit).

## 8. Failure and resume semantics

- A node that FAILS (dispatch error, invalid output per MODULE_PIPELINE Step 4B after one retry)
  is recorded `failed` in the manifest; its module counts as DIRTY (fail toward blunt) but the
  orchestrator STOPS before the master step and reports, exactly as the blunt rerun did — a
  half-refreshed cascade must not rewrite the decision of record.
- The manifest is the audit trail of an interrupted rerun: `planned`/`running` rows show exactly
  where it stopped. A follow-up rerun starts fresh (new manifest version); it never trusts a prior
  manifest's prune decisions, because the pool may have changed since — every prune is re-proven
  from current bytes.

## 9. Swarm genericity (§26)

Everything above derives from the discovered graph (`depends_on` frontmatter, `NN_*.md` filename
shapes, `SWARM.md` manifests). The commodity swarm binds the same contract with its own run root
(`commodity/runs/<COMMODITY>`), no master node (its cascade tail is the terminal thesis module's
synthesis, which prunes by the same §3.3 rule), and dossier/memo tiers per its own pipeline. A
future swarm inherits the mechanism with zero engine-code edits.
