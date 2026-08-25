# Run Failure

- ticker: AMZN
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: business-model
- reason: publication_failed
- stopped_at_utc: 2026-08-25T08:55:48.521Z

## Modules completed

(none)

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
the provider exited without a supervisor-owned publication request

Provider final message:
Canary aborted at the fail-closed preflight.

- Cockpit mode and publication capability: present
- Freeze receipt and binding schemas: valid
- Ticker, run root, receipt, Codex profile, decision date, snapshot, and frozen price anchor: correctly bound
- Frozen price: USD 238.34 as of 2026-07-01
- Failure: the run root contains `.requires_idea_publication` and `_pool_extracts/` in addition to `.provider-parity-input.json`

The contract requires the run root to contain only the binding before starting. I wrote no artifacts, launched no agents, ran no Git commands, and did not call `commit-run.sh`.

Run root: [AMZN_2026-08-25](/Users/admin/nostra-prod/analyses/provider-parity/2026-08-25/codex/AMZN_2026-08-25)  
Freeze receipt: [AMZN_2026-08-25.json](/Users/admin/nostra-prod/analyses/provider-parity/freeze/AMZN_2026-08-25.json)

A fresh supervisor-created run root containing only `.provider-parity-input.json` is required.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
