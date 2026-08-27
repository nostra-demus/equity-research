# Run Failure

- ticker: AMZN
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master synthesis
- reason: codex_incomplete_orchestration
- stopped_at_utc: 2026-08-26T13:49:12.487Z

## Modules completed

- balance-sheet-survival
- business-model
- catalyst
- competitive-intel
- earnings
- management-governance
- valuation

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
Codex ended its parent orchestration before the canonical completion barrier passed.

The command stopped before its terminal deliverable was accepted.

Provider final message:
Blocked by a checked-in contract mismatch; publication was not queued.

- All 7 modules, 64 module artifacts, final thesis, memo, dossier, decision record, and frozen-input digests validated.
- Integrity gate passed; verification reported Minor issues, and pre-mortem survived at 51/100 confidence.
- [RUN_METADATA.md](/Users/admin/nostra-prod/analyses/provider-parity/2026-08-26/codex/AMZN_2026-08-26__attempt-bfd6c9d6e21372d6/RUN_METADATA.md:110) now records the actual failure.
- The [Ideas schema](/Users/admin/nostra-prod/frameworks/ideas/idea-assessment.schema.json:22), [manifest creator](/Users/admin/nostra-prod/scripts/create_idea_projection_manifest.py:265), and [admission freezer](/Users/admin/nostra-prod/scripts/freeze_idea_admission.py:650) accept only flat `analyses/<TICKER>_<DATE>` roots. The canary requires its exact nested, attempt-suffixed root.
- Consequently `.requires_idea_publication` cannot be cleared, and the cockpit intentionally keeps `RUN_METADATA.md` unresolved while that marker remains. No admission was fabricated or marker deleted.
- Native child barrier: zero live or unresolved children.
- Commit/publication: none; `Commit SHA: provider-parity canary — not committed`.

Run root: [AMZN canary run](/Users/admin/nostra-prod/analyses/provider-parity/2026-08-26/codex/AMZN_2026-08-26__attempt-bfd6c9d6e21372d6)

Freeze receipt: [frozen receipt](/Users/admin/nostra-prod/analyses/provider-parity/2026-08-26/freeze/AMZN_2026-08-26__attempt-bfd6c9d6e21372d6.json)

Completing this requires a code PR reconciling provider-parity run-root syntax with the Ideas schema and admission tools.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
