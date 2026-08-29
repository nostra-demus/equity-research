---
description: Run the full commodity research pipeline on a commodity (e.g. GOLD, SUGAR). Self-discovers modules from .claude/agents/commodity/*/99_*-synthesis.md, dispatches each module's pipeline in dependency order, and ends at the terminal commodity-thesis module (which emits the Action verdict + writes decision_record.json). Commits the dossier.
argument-hint: COMMODITY
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the orchestrator for a full commodity research run. The commodity is `$ARGUMENTS` (uppercase it, e.g. `gold` → `GOLD`).

This is the commodity-swarm analogue of `/research:full`. Its unit of work is a COMMODITY, not a ticker. There is NO master synthesizer — the terminal `commodity-thesis` module IS the deliverable, and its `Action:` verdict is the run's outcome. Reuse `frameworks/MODULE_PIPELINE.md` for each module, binding `<TICKER>` = `<COMMODITY>` and `<RUN_ROOT>` = `commodity/runs/<COMMODITY>`.

Execute the steps below in order. Do not skip any.

---

## 1. Parse the commodity + date

Uppercase `$ARGUMENTS` to `<COMMODITY>`. Run `date +%Y-%m-%d` via Bash → `<DATE>`.

## 2. Verify the commodity is known

The per-commodity lenses/instruments/sources live in `frameworks/commodity/COMMODITY_PROFILES.md`. Confirm it has a section for this commodity:

```
grep -n "^## <COMMODITY>\b" frameworks/commodity/COMMODITY_PROFILES.md
```

If there is no `## <COMMODITY>` section AND no `data/<COMMODITY>/` folder, STOP: tell the user to add a `## <COMMODITY>` section to `frameworks/commodity/COMMODITY_PROFILES.md` (instruments, applicable lenses, priority sources, recurring reports) first. (An optional `data/<COMMODITY>/` folder may hold user notes. Runtime evidence comes from accepted vintages and the lawful shared market routes declared by the profile, not from point-in-time methodology reports.)

## 3. Create the run root

```
mkdir -p "commodity/runs/<COMMODITY>" "data/<COMMODITY>"
```

Capture `commodity/runs/<COMMODITY>` as `<RUN_ROOT>`. (One stable run folder per commodity — NOT date-stamped; a re-run refreshes it in place and resumes past finished modules.)
The validated foreground commodity flow also creates its subject pool so a first automatic refresh can
publish. This does not weaken the background runner's pool gate; background sweeps still cannot invent subjects.

## 3.5. Refresh feeds + evidence preflight before any orb dispatch

Refresh only the automatic connectors declared for this commodity, then refresh its quote:

```bash
python3 .claude/tools/run_connectors.py --subject "<COMMODITY>"
bash scripts/refresh-swarm-pulse.sh commodity "<COMMODITY>"
```

If the connector refresh exits `75`, another sweep owns the connector lock. STOP this invocation and retry
Step 3.5 after that sweep finishes. Never continue to the pulse refresh or evidence preflight after exit `75`:
the scoped refresh did not run, so preflight could otherwise reject usable evidence that is still being published.

Connector failures are not permission to substitute an unreviewed scrape. They remain visible as missing,
stalled, suspect, or unavailable evidence. Now run the non-publishing preflight at one captured UTC cutoff:

```bash
PREFLIGHT_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
python3 scripts/commodity_profile_coverage.py "<RUN_ROOT>" --preflight --decision-time "$PREFLIGHT_TIME"
```

This mode writes nothing and does not freeze the terminal coverage artifacts. If it exits `2`, zero required
series are usable: STOP before every research orb, report the exact status counts and affected owner orbs,
and point the user to `python3 scripts/commodity_feed_plan.py "<COMMODITY>" --gaps-only`. Spending the full
swarm budget cannot turn zero evidence into a forecast. Exit `0` permits the run to continue; partial evidence
remains subject to the terminal sufficiency caps and can still end in `Research More`.

When preflight exits `0`, compare this exact decision-time view with the prior frozen coverage before any
resume decision:

```bash
EVIDENCE_DELTA_JSON="$(python3 scripts/commodity_evidence_delta.py "<RUN_ROOT>" --decision-time "$PREFLIGHT_TIME")"
EVIDENCE_INVALIDATED_MODULES="$(printf '%s' "$EVIDENCE_DELTA_JSON" | python3 -c 'import json,sys; print(" ".join(json.load(sys.stdin)["modules"]))')"
```

If either command fails, STOP. Print the changed need IDs, owner orbs, and invalidated modules. This snapshot
writes nothing. It is the evidence-staleness floor for every resume decision below.

## 4. Discover modules + dependency order

Glob `.claude/agents/commodity/*/99_*-synthesis.md`. For each, the parent folder name is the module; read its frontmatter `depends_on`. Topologically sort the modules by `depends_on` (alphabetical tiebreak) — mirrors `/research:full`. Expect: `market-structure`, `supply-demand`, `macro-positioning`, then terminal `commodity-thesis` (which depends on the other three). Do NOT hardcode this list — derive it from the discovered graph.

## 5. Run each module in order (resume-aware)

For each module in topo order:

1. **Resume check — COMPLETE and CURRENT, not merely present.** A module is skippable only when a prior run genuinely finished the work this run would do. "Its synthesis file exists" is not that test, and using it let a module stay `done` forever: the GOLD run's `supply-demand` and `commodity-thesis` syntheses were written before `04_commodity-supply-security` and `02_commodity-cost-curve-fair-value` existed, so every later `/commodity:full GOLD` skipped both modules and those two orbs never ran — while the dossier's own pre-mortem was separately noting the cost-curve orb's absence as a reason its margin of safety was not durable. A stale module survives precisely because it is stale.

   Skip the module ONLY if ALL FIVE hold; otherwise re-run it in full:
   - (a) `<RUN_ROOT>/<module>/99_<module>-synthesis.md` exists and is non-empty;
   - (b) **every orb the module currently declares** has a non-empty output in the run folder — derived from the discovered roster (`.claude/agents/commodity/<module>/[0-9][0-9]_*.md`, excluding `99_`), never a hardcoded list, so an orb added later invalidates the module automatically with no edit here (§26);
   - (c) the synthesis is **at least as new as** every one of those orb outputs and every dependency module's synthesis — so an orb re-run on its own (`/commodity:rerun`), or an upstream module re-run in this pass, forces this module to be re-adjudicated instead of leaving a synthesis that never saw its own inputs.
   - (d) every orb declaring `emits_signal_evidence: true` has its sibling `.signals.json`, and that
     sidecar is not newer than the synthesis. A legacy markdown-only orb is incomplete under the current
     contract and must rerun; a refreshed sidecar must flow through synthesis before the module is current.
   - (e) `<module>` is absent from `<EVIDENCE_INVALIDATED_MODULES>`. A new vintage, changed usability state,
     or removed profile need invalidates its owning module even when old output files are newer on disk.

   (b) is the load-bearing test and is fully durable: it compares file EXISTENCE against the live roster. (c) compares mtimes, which are **not durable across a fresh clone** (every file lands with the checkout time), so on a freshly cloned tree (c) simply never fires and the check degrades to (a)+(b) — weaker, never wrong. On the persistent checkout the engine actually runs from, mtimes are real and (c) does its job.

```bash
# prints SKIP or RERUN:<reason> for <module>
MOD=<module>; RR=<RUN_ROOT>; SYN="$RR/$MOD/99_$MOD-synthesis.md"
case " $EVIDENCE_INVALIDATED_MODULES " in *" $MOD "*) echo "RERUN:evidence-changed";; *)
if [ ! -s "$SYN" ]; then echo "RERUN:no-synthesis"; else
  reason=""
  for f in .claude/agents/commodity/"$MOD"/[0-9][0-9]_*.md; do
    orb=$(basename "$f" .md); case "$orb" in 99_*) continue;; esac
    [ -s "$RR/$MOD/$orb.md" ] || reason="${reason}missing-orb:$orb "
    [ -s "$RR/$MOD/$orb.md" ] && [ "$RR/$MOD/$orb.md" -nt "$SYN" ] && reason="${reason}orb-newer:$orb "
    if grep -qE '^emits_signal_evidence:[[:space:]]*true[[:space:]]*$' "$f"; then
      [ -s "$RR/$MOD/$orb.signals.json" ] || reason="${reason}missing-signal-sidecar:$orb "
      [ -s "$RR/$MOD/$orb.signals.json" ] && [ "$RR/$MOD/$orb.signals.json" -nt "$SYN" ] && reason="${reason}signal-newer:$orb "
    fi
  done
  for dep in <deps of this module>; do
    [ -s "$RR/$dep/99_$dep-synthesis.md" ] && [ "$RR/$dep/99_$dep-synthesis.md" -nt "$SYN" ] && reason="${reason}dep-newer:$dep "
  done
  [ -n "$reason" ] && echo "RERUN:$reason" || echo "SKIP"
fi
;; esac
```

   Report each module's SKIP / RERUN decision and its reason in step 7 — a resume that silently skipped a module carrying a missing orb is exactly the failure this check exists to make visible. The evidence delta covers accepted profile-series changes; `/commodity:intake` separately covers user documents and notes landing in `data/<COMMODITY>/`. Neither substitutes for the other.
2. **Cross-module context:** build `<CROSS_MODULE_CONTEXT>` exactly as `frameworks/MODULE_PIPELINE.md` Step 4A specifies — one sentence per dependency module that is DONE in this run, `<Dep> cross-module path: <RUN_ROOT>/<dep>/.` (capitalize the dep's first letter). If the module has no deps, set it to `none`.
3. **Run the module pipeline:** follow `frameworks/MODULE_PIPELINE.md` with `<TICKER>` = `<COMMODITY>`, `<DATE>`, `<MODULE>` = the module, `<RUN_ROOT>` = `commodity/runs/<COMMODITY>`, and `<CROSS_MODULE_CONTEXT>` as built. **Commodity deviations:** (a) SKIP Step 1.5 (`extract_pool.py`) unless `data/<COMMODITY>/` exists with files; (b) in the Step 4A Task message the "Data pool path: data/<COMMODITY>/" line is fine — agents read the profile, consume current accepted connector vintages and lawful shared market routes first, and use live public facts only as explicitly unvintaged context. Connector existence or URL reachability never raises sufficiency. WILTW and report-derived assertions are forbidden runtime inputs.
4. **Compile evidence; freeze coverage once for the terminal:** after every module decision, including
   `SKIP`, run `python3 scripts/commodity_signal_evidence.py "<RUN_ROOT>"`. Any
   `SIGNAL-EVIDENCE-FAIL` stops before the next module. Immediately BEFORE the terminal synthesis resume
   decision, do NOT refresh feeds or the pulse again: admitting evidence after its owner module ran would
   bind fresh vintages to stale conclusions. Run `python3 scripts/commodity_profile_coverage.py "<RUN_ROOT>"
   --decision-time "$PREFLIGHT_TIME"` exactly once. It freezes the same evidence view used by the staleness
   check and binds every profile-required series to a vintage knowable at that cutoff. Compute its byte digest.
   The terminal record's `decision_date` must equal the UTC date inside this frozen `decision_time`. If an
   existing `decision_record.json` does not carry
   that exact digest, force the terminal module to `RERUN:coverage-changed` even when its ordinary mtime
   checks said `SKIP`. Do NOT regenerate the coverage artifact after terminal synthesis: the terminal
   hashes those exact bytes. Any `PROFILE-COVERAGE-FAIL` stops before terminal synthesis. Incomplete
   coverage is valid, but forces both horizons to `not_assessable` and `Research More` unless a proven
   critical risk forces `Avoid`.
5. **Fail-fast:** if the module's Layer-0 triage returns Insufficient (only `market-structure` has a `fail_fast` triage), the pipeline reports `fail_fast_triggered = true`. Stop the run: commit what exists (step 6) and report the abort — do NOT run downstream modules, since the commodity could not be identified/priced.

## 5.5. Integrity finish-gate — pre-mortem haircut propagation

`commodity-thesis-synthesis` is both advocate and judge of its own `Action:` call — nothing independently tested that verdict before this step existed (`commodity:pre-mortem`'s own rationale). This closes that gap the same way `research:full` step 10B.2 closes it for equity calls (fix F28/F28b), adapted to the commodity swarm's stable one-folder-per-commodity model (no dated re-runs to key a "did this run just happen" check off of).

**Run this step iff EITHER:**
- (a) the terminal `commodity-thesis` module was completed FRESH in step 5 of THIS invocation (its resume check did not skip it), **or**
- (b) it was skip-resumed as already-done, but `<RUN_ROOT>/decision_record.json` has no `post_review_confidence_score` field yet — a pre-existing run that predates this gate, backfilled once on its next invocation.

Otherwise (already done AND already carries `post_review_confidence_score`) skip this step entirely — an already-audited, unchanged run must not accumulate a fresh pre-mortem version on every resume-only call.

When the step runs:

1. Run `python3 scripts/commodity_forecast_contract.py "<RUN_ROOT>/decision_record.json"`. It re-resolves
   every `usable` row at the frozen decision cutoff and proves the artifact digest, profile, dual-horizon
   math and action. On failure, STOP before pre-mortem or commit.
2. Before invoking the command below, capture whatever pre-mortem report already exists (case (b) — the backfill of a pre-existing run — routinely already has one; case (a) usually does not): `PRIOR_PM=$(ls -t "<RUN_ROOT>"/pre_mortem*.json 2>/dev/null | head -1)`.
3. Follow `.claude/commands/commodity/pre-mortem.md` against `<RUN_ROOT>` in full — produce ONLY `<RUN_ROOT>/pre_mortem*.json` (adversarial red-team; per its rule 1 it can only HOLD or LOWER conviction, never raise it). Skip its own step 7 commit — this command's step 6 below commits the whole run folder in one place.
4. **Haircut propagation** — patch `decision_record.json` with the pre-mortem's verdict via the shared, tested helper (mirrors research/full.md 10B.2's F28/F28b exactly, in the commodity schema — `action`/`confidence`, not `decision`/`basket`/`confidence_score`). Pass `--prior` whenever step 2 found an existing report — the helper proves step 3 actually wrote a NEW one rather than silently reusing that old file (a `no_fresh_pre_mortem` gate failure otherwise indistinguishable from a genuine, value-consistent report):

```bash
python3 scripts/commodity_pre_mortem_haircut.py "<RUN_ROOT>" ${PRIOR_PM:+--prior "$PRIOR_PM"}
```

The helper **fails closed**: it exits `0` and prints `RATING-CAP:` only when it actually propagated a fresh, complete pre-mortem; on `no_pre_mortem` / `read_error` / `incomplete_pre_mortem` / `stale_pre_mortem` / `no_fresh_pre_mortem` it prints `GATE-FAIL:` and exits **nonzero**, leaving `decision_record.json` unpatched. Because step 2 just generated a fresh pre-mortem against this run, a nonzero exit means the integrity gate genuinely could not run — **STOP before the step 6 commit and report the `GATE-FAIL:` reason; do not ship a `decision_record.json` whose `Action:` verdict was never red-teamed.** On success, record the printed `RATING-CAP:` line for step 7 (report). The patch is additive — `confidence_haircut`, `pre_mortem_verdict`, `post_review_confidence_score`, `post_mortem_action`, `post_mortem_target_exposure_risk_units` — and never rewrites the synthesizer's own original `action`/`confidence` fields (CLAUDE.md §18/§22: caps are applied, never silently overridden; the original call stays visible for audit). The cap is enforced deterministically by the helper (a would-be conviction RAISE from a mis-authored pre-mortem is clamped/rejected), not trusted from the LLM-authored report.

5. **Immutable decision publication — only after the record has a completed red-team.** Run this whenever
step 5.5 ran OR the already-audited current record has no `decision_id` yet (one-time archive backfill).
Archive the exact reviewed record, then atomically update the top-level UI projection:

```bash
python3 scripts/commodity_decision_archive.py "<RUN_ROOT>"
```

This helper writes `<RUN_ROOT>/decisions/<DECISION_ID>/decision_record.json` create-only, then replaces
`<RUN_ROOT>/decision_record.json` with the identical record carrying that content-derived `decision_id`.
It is archive-first: a crash may leave the prior UI projection in place, but can never publish a projection
without its immutable snapshot. On `ARCHIVE-FAIL`, STOP before commit. Record the `DECISION-ARCHIVE:` line.

## 6. Commit the dossier

Commodity run outputs are DATA (CLAUDE.md §25/§28 — the research-data stream). Commit through the serialized helper (data pathspec only):

```
bash scripts/commit-run.sh "Commodity run: <COMMODITY> <DATE>" -- "commodity/runs/<COMMODITY>/"
```

Capture the commit SHA from `git rev-parse HEAD` (the helper prints `COMMIT_SHA=…`, or `NOOP=1` if nothing changed).

## 7. Report

Print a final summary:

- The modules run, with per-module 99-synthesis paths, and **each module's step-5.1 resume decision with its reason** — `SKIP` (complete and current) or `RERUN:<reason>` (`no-synthesis`, `missing-orb:<orb>`, `missing-signal-sidecar:<orb>`, `orb-newer:<orb>`, `signal-newer:<orb>`, `dep-newer:<module>`). Naming the reason is the point: a resume that skipped a module because its synthesis merely existed, while an orb or evidence sidecar declared for that module had never run, is the silent failure step 5.1 exists to surface.
- Any agents that failed (or "none"), and whether a fail-fast abort fired.
- The terminal dossier: `commodity/runs/<COMMODITY>/commodity-thesis/99_commodity-thesis-synthesis.md`, its **Action** verdict (Buy / Hold / Trim / Avoid / Research More), and the one-line thesis.
- Confirmation that `commodity/runs/<COMMODITY>/decision_record.json` was written.
- **The integrity finish-gate result (step 5.5):** the `RATING-CAP:` line — the pre-mortem verdict, the confidence haircut (if any), and the `post_mortem_action` cap (if any); or "not run (already audited)" if step 5.5 was skipped; or, if the helper exited nonzero, the `GATE-FAIL:` reason and the fact that the run was HALTED before commit (no unaudited record shipped).
- **The immutable publication result:** decision ID + archive path from `DECISION-ARCHIVE:`, or "already
  archived and unchanged" only when an existing `decision_id` resolves to an identical archive; an archive
  failure halts before commit.
- The commit SHA pushed to `origin/main` (or NOOP).

---

## Hard rules

- Do not hardcode module or agent names — everything is discovered from the folders + frontmatter, exactly like `/research:full` and `frameworks/MODULE_PIPELINE.md`.
- Adding a new module folder `.claude/agents/commodity/<new>/` (with a `99_<new>-synthesis.md` carrying `depends_on`) must require zero changes to this command.
- Research outputs write only inside `commodity/runs/<COMMODITY>/`. The sole exception is step 3.5's
  reviewed connector publisher, scoped by `--subject <COMMODITY>`; it may update only that commodity's
  canonical feed vintages/projections and connector health ledger. Do not touch other commodity pools or
  any company run.
- After the terminal module writes `decision_record.json`, only step 5.5 may mutate it: first the deterministic
  pre-mortem cap, then immutable archive/publication. `commodity:pre-mortem.md` itself stays read-only.
