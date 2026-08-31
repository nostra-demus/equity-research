# Run Failure

- ticker: NU
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-08-31T23:44:17.005Z

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
Continuation completed for `analyses/NU_2026-08-31`.

- Target: `master/synthesizer`; its completed thesis and decision record were preserved. No synthesis cascade was rerun.
- Decision: **Avoid** — operating execution is good, but US$14.30 exceeds every company-underwritten fair-value case.
- [memo.md](/Users/admin/nostra-prod/analyses/NU_2026-08-31/memo.md): generated and validated, 3,496 words.
- [audit_dossier.md](/Users/admin/nostra-prod/analyses/NU_2026-08-31/audit_dossier.md): generated and validated, 47 source artifacts and 1.40 MB.
- Finish gate: **PASS**.
- Evidence audit: **Minor issues, no blocking findings**.
- Pre-mortem: **Survives**, confidence 53→53.
- Expectations-gap: **PASS**; edge remains weak and not exploitable.
- [idea_admission.json](/Users/admin/nostra-prod/analyses/NU_2026-08-31/idea_admission.json): `not_applicable` because provider-bound NU market history was unavailable.
- [RUN_METADATA.md](/Users/admin/nostra-prod/analyses/NU_2026-08-31/RUN_METADATA.md): updated from final disk state.
- Intake receipt: none.
- Completion barrier: passed with zero live subagents and all required artifacts valid.

Tracked cockpit publication was accepted:

`PUBLICATION_QUEUED=fbe7fcd2-80dc-42e9-9370-eab103cf505d`

No commit SHA is reported yet; the trusted supervisor will commit and push after the provider processes exit.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
