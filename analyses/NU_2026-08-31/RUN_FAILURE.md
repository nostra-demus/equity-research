# Run Failure

- ticker: NU
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-08-31T11:08:37.321Z

## Modules completed

- business-model
- catalyst
- competitive-intel
- earnings
- management-governance
- valuation

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
the provider exited without a supervisor-owned publication request

Provider final message:
Completed `analyses/NU_2026-08-31`.

- Preserved [final_thesis.md](/Users/admin/nostra-prod/analyses/NU_2026-08-31/final_thesis.md) and [decision_record.json](/Users/admin/nostra-prod/analyses/NU_2026-08-31/decision_record.json).
- Generated and validated [memo.md](/Users/admin/nostra-prod/analyses/NU_2026-08-31/memo.md), approximately 3,900 words.
- Generated and validated [audit_dossier.md](/Users/admin/nostra-prod/analyses/NU_2026-08-31/audit_dossier.md), containing 49 source sections.
- Decision: **Avoid**.
- Integrity remains **PROVISIONAL** because the required “Suggested sizing” scorecard field is missing.
- All child agents reached terminal status.

Trusted cockpit publication queued: `63374eb8-fc74-441a-9e4b-da8201ff327a`.

No commit SHA is reported—the supervisor publishes and backfills it after this process exits.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
