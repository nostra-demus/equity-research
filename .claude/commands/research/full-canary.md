---
description: Operator-only frozen-input full equity canary launched by the cockpit parity supervisor
argument-hint: TICKER RUN_ROOT FREEZE_RECEIPT
allowed-tools: Read, Write, Glob, Grep, Bash, Task
---

# Frozen provider-parity full canary

Arguments: `$ARGUMENTS`

This command is not a normal user workflow. It may run only when `NOSTRA_COCKPIT_RUN=1` and the live
cockpit supervisor supplied its publication endpoint/capability. Require exactly three whitespace-free,
repository-relative arguments: `<TICKER> <RUN_ROOT> <FREEZE_RECEIPT>`. Fail before writing if any is absent.

Read all of `.claude/commands/research/full.md`, the exact `<RUN_ROOT>/.provider-parity-input.json`, and
`<FREEZE_RECEIPT>`. Validate both JSON contracts with `scripts/provider_parity_freeze.py`'s checked-in
schemas. Require the binding to name this exact ticker, run root, freeze receipt, provider runtime profile,
and frozen decision date. This is the ONE terminal adjudicator after the provider-neutral supervisor has
completed the discovered module DAG. By provider start `<RUN_ROOT>` contains the immutable binding, its
required `.requires_idea_publication` and `.defer_module_memos` markers, the deterministic `_pool_extracts/`
readiness cache, and one folder for every currently discovered module. A human-approved degraded-data launch
may additionally have `readiness_override.json`. Require every discovered module's canonical `99_*` synthesis
to exist and pass the artifact validator before continuing. Treat only those completed module folders and
exact supervisor support paths as expected. Fail if any module is missing/partial, or if any terminal
artifact, failure/interruption marker, or other unexpected top-level entry already exists. The snapshot root
in the receipt must be the exact `data/<TICKER>` directory.

Then execute the complete `/research:full` workflow, with these narrow substitutions taking precedence:

- `<TICKER>` is the first argument. `<RUN_ROOT>` is the exact second argument; never construct or write
  `analyses/<TICKER>_<today>`. Use the binding's frozen `decision_date` everywhere the normal workflow uses
  today's decision/run date.
- Treat the completed module set as the current frozen run, not as a prior decision. Never select a prior
  run; set `<PRIOR_RUN>` to `none`. Do not read another analysis root as research context. Follow the normal
  completed-module skip rule, then perform the master synthesis, memos, finish gates, audits, decision record,
  metadata, and terminal publication against this exact root.
- Use only the frozen `data/<TICKER>` snapshot and the receipt's exact price anchor. Do not fetch or use
  newer web evidence, a newer price, or a different data directory. A missing required input remains missing.
- Preserve `.provider-parity-input.json` byte-for-byte. Every research output, module folder, synthesis,
  audit, memo, decision record, and metadata file goes below the exact `<RUN_ROOT>`.
- Do not run git, commit, push, or backfill a commit SHA. In final metadata write
  `Commit SHA: provider-parity canary — not committed`.
- Replace all normal commit steps with exactly one final call after every output and final metadata write:
  `bash scripts/commit-run.sh "Provider parity canary: <TICKER> <FROZEN_DATE>" -- "<RUN_ROOT>/"`.
  In cockpit mode the supervisor converts this request to deterministic provenance stamping plus a
  supervisor receipt without changing HEAD. A failed/refused request fails the canary.

All evidence, math, rejection, sufficiency, synthesis, validation and audit requirements in `full.md`
otherwise apply unchanged. Report the exact run root and freeze receipt; do not claim a git commit.
