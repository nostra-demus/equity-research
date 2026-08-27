# Run Failure

- ticker: META
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: management-governance
- reason: publication_failed
- stopped_at_utc: 2026-08-27T19:12:44.024Z

## Modules completed

- balance-sheet-survival
- business-model
- competitive-intel
- earnings

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
the provider exited without a supervisor-owned publication request

Provider final message:
01_management-and-track-record has completed. Waiting for 07_people-integrity-dossiers to finish before advancing to Layer 2.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
