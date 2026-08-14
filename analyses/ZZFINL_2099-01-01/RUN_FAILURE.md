# Run Failure

- ticker: ZZFINL
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: business-model
- reason: incomplete_publication
- stopped_at_utc: 2026-08-14T05:26:59.695Z

## Modules completed

(none)

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
The call was written but its final checks or publication did not finish. It will resume automatically.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
