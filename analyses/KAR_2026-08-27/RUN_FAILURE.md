# Run Failure

- ticker: KAR
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: business-model
- reason: publication_failed
- stopped_at_utc: 2026-08-27T09:59:48.546Z

## Modules completed

(none)

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
the provider exited without a supervisor-owned publication request

Provider final message:
Unknown command: /research:business-model
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
