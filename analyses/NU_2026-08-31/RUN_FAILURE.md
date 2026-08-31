# Run Failure

- ticker: NU
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: valuation
- reason: codex_error
- stopped_at_utc: 2026-08-31T06:30:53.184Z

## Modules completed

- business-model
- competitive-intel
- earnings
- management-governance

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
Selected model is at capacity. Please try a different model.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
