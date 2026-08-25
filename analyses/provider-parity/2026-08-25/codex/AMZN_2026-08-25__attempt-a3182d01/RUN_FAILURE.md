# Run Failure

- ticker: AMZN
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: business-model
- reason: publication_failed
- stopped_at_utc: 2026-08-25T10:45:29.901Z

## Modules completed

(none)

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
the provider exited without a supervisor-owned publication request

Provider final message:
Canary failed closed before any research write.

- Blocker: `/usr/bin/python3` cannot run because the host Xcode/Python runtime is missing. Temporary download and Homebrew fallback were denied by the sandbox.
- Therefore the required schema validation, research gates, audits, and immutable admission could not run unchanged.
- The run root remains uncontaminated: only the binding, publication marker, and `_pool_extracts/` cache exist.
- No agents ran, no research artifacts were written, no publication request was made, and no git command ran.

Run root: [AMZN canary](/Users/admin/nostra-prod/analyses/provider-parity/2026-08-25/codex/AMZN_2026-08-25__attempt-a3182d01)

Freeze receipt: [AMZN freeze receipt](/Users/admin/nostra-prod/analyses/provider-parity/freeze/AMZN_2026-08-25__attempt-a3182d01.json)

A working Python 3 executable is required before safely rerunning this untouched canary.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
