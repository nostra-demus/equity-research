# Run Failure

- ticker: NU
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: balance-sheet-survival
- reason: codex_exit_5
- stopped_at_utc: 2026-08-30T15:39:36.176Z

## Modules completed

- business-model
- competitive-intel
- earnings
- management-governance

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
- Fail-fast: triggered by `solvency-data-triage`
- Synthesis: not run
- Commit SHA: none; step 7 is prohibited after fail-fast. The optional checkpoint also failed before publication because the host’s Apple developer tools are inactive.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
