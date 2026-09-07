# Run Failure

- ticker: NU
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: management-governance
- reason: api_error_429
- stopped_at_utc: 2026-09-07T06:22:18.288Z

## Modules completed

- business-model
- competitive-intel
- earnings

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
You've hit your session limit · resets 1:20pm (Asia/Calcutta)
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
