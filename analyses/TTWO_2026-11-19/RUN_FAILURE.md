# Run Failure

- ticker: TTWO
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: management-governance
- reason: error_max_budget_usd
- stopped_at_utc: 2026-11-20T07:13:00.025Z

## Modules completed

- balance-sheet-survival
- business-model
- competitive-intel
- earnings

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
Stopped at the spend ceiling for a module run: $120.18 of $120. Nothing crashed — it ran out of allowance. Raise ENGINE_MODULE_BUDGET_USD, or re-run the remaining orbs individually.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
