# Run Failure

- ticker: NU
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-01T01:38:02.671Z

## Modules completed

- business-model
- catalyst
- competitive-intel
- earnings
- management-governance
- valuation

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
cockpit publication cannot delete terminal data: analyses/NU_2026-08-31/balance-sheet-survival/execution_provenance.receipt.json

Provider final message:
Completed the continuation for `analyses/NU_2026-08-31`.

- Target: `master/synthesizer`; no module syntheses or specialists rerun.
- Decision: **Avoid**, confidence 58/100.
- Modules: six completed; balance-sheet-survival ended fail-fast with `Insufficient data`.
- [memo.md](/Users/admin/nostra-prod/analyses/NU_2026-08-31/memo.md): validated, 3,186 words.
- [audit_dossier.md](/Users/admin/nostra-prod/analyses/NU_2026-08-31/audit_dossier.md): validated, 47 sections.
- [final_thesis.md](/Users/admin/nostra-prod/analyses/NU_2026-08-31/final_thesis.md) and [decision_record.json](/Users/admin/nostra-prod/analyses/NU_2026-08-31/decision_record.json) remained unchanged.
- Integrity: `GATE: PROVISIONAL`; verification found Material issues, 39/100. Pre-mortem verdict: `Thesis broken`, recommended confidence 58→0.
- Idea assessment: `not_assessable`; admission `not_applicable` because canonical NU market history was unavailable.
- Intake receipt: none.
- Completion barrier: passed; zero live children.

Publication was accepted by the trusted cockpit supervisor:

`PUBLICATION_QUEUED=a3ee1e02-6b30-499e-aaa3-191f763caf07`

No commit SHA is available yet; the supervisor will publish and backfill it after process exit.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
