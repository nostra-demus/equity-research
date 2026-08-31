# Run Failure

- ticker: META
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: business-model
- reason: api_error_429
- stopped_at_utc: 2026-08-31T06:51:57.834Z

## Modules completed

(none)

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
You've hit your weekly limit · resets Sep 2 at 11:30am (Asia/Calcutta)
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
