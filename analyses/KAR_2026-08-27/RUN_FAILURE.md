# Run Failure

- ticker: KAR
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: management-governance
- reason: api_error_429
- stopped_at_utc: 2026-08-27T15:00:03.431Z

## Modules completed

- balance-sheet-survival
- business-model
- competitive-intel
- earnings

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
You've hit your session limit · resets 10:20pm (Asia/Calcutta)
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
