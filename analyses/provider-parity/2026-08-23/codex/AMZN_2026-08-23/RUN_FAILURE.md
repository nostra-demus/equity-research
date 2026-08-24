# Run Failure

- ticker: AMZN
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: business-model
- reason: codex_exit_5
- stopped_at_utc: 2026-08-22T22:37:45.556Z

## Modules completed

(none)

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
Reading prompt from stdin...

Supervisor publication failed: the provider exited without a supervisor-owned publication request
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
