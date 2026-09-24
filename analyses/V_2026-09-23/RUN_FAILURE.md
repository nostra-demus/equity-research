# Run Failure

- ticker: V
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: valuation
- reason: out_of_credits
- stopped_at_utc: 2026-09-24T01:36:20.486Z

## Modules completed

- balance-sheet-survival
- business-model
- competitive-intel
- earnings
- management-governance

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
You've hit your usage limit. Visit https://chatgpt.com/codex/settings/usage to purchase more credits or try again at Sep 27th, 2026 12:20 PM.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
