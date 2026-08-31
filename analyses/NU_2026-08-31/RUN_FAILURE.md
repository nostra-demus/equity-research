# Run Failure

- ticker: NU
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-08-31T19:03:14.705Z

## Modules completed

- business-model
- catalyst
- competitive-intel
- earnings
- management-governance
- valuation

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
cockpit publication cannot delete terminal data: analyses/NU_2026-08-31/RUN_FAILURE.md

Provider final message:
Rerun completed for `analyses/NU_2026-08-31`.

- Target: `master/synthesizer`
- Cascade: none; master-only rerun
- Decision: **Avoid** — no position and no short; confidence 57/100, data sufficiency 66/100
- Six module syntheses retained and their memos refreshed. Balance-sheet survival ended intentionally as `fail_fast_insufficient`.
- `GATE: PASS`
- `GATE-VERIFY: PASS` — Minor issues, 74/100
- Pre-mortem: Survives; confidence 57→57, no haircut
- `GATE-EXPECTATIONS: PASS` — edge Weak and not exploitable
- `IDEA-ADMISSION: not_applicable` due missing market history, no 3–6 month valuation bridge, no machine-resolvable forecast, and no proven exploitable edge
- Intake receipt: none

Artifacts:

- [Final thesis](/Users/admin/nostra-prod/analyses/NU_2026-08-31/final_thesis.md)
- [Colleague memo](/Users/admin/nostra-prod/analyses/NU_2026-08-31/memo.md)
- [Audit dossier](/Users/admin/nostra-prod/analyses/NU_2026-08-31/audit_dossier.md)
- [Run metadata](/Users/admin/nostra-prod/analyses/NU_2026-08-31/RUN_METADATA.md)
- [Idea admission](/Users/admin/nostra-prod/analyses/NU_2026-08-31/idea_admission.json)

Publication queued successfully:

`PUBLICATION_QUEUED=d2c9d625-d17a-46d2-a84f-c09c4344f404`

The trusted cockpit supervisor will publish and backfill the verified commit SHA; no SHA was guessed or read prematurely.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
