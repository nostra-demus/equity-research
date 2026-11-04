# Run Failure

- ticker: GOOGL
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_refused
- stopped_at_utc: 2026-11-03T17:25:51.981Z

## Modules completed

- balance-sheet-survival
- business-model
- catalyst
- competitive-intel
- earnings
- management-governance
- valuation

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
Provider final message:
Completed and queued for trusted publication.

- Run: [GOOGL_2026-11-03](/Users/admin/nostra-prod/analyses/GOOGL_2026-11-03)
- Target: `master/synthesizer`; downstream cascade: none
- Seven modules validated as complete
- Decision: **Watchlist**, confidence **52/100**
- Gates: deterministic **PASS**; evidence **Minor issues**; pre-mortem **Survives**; expectations-gap **PASS**
- Admission: `not_applicable` due to unavailable canonical market evidence and no proven exploitable edge
- Outputs: [final thesis](/Users/admin/nostra-prod/analyses/GOOGL_2026-11-03/final_thesis.md), [memo](/Users/admin/nostra-prod/analyses/GOOGL_2026-11-03/memo.md), [audit dossier](/Users/admin/nostra-prod/analyses/GOOGL_2026-11-03/audit_dossier.md)
- Intake receipt: none
- Publication: `PUBLICATION_QUEUED=a4bbaea8-e22e-4d77-ae45-a90a0a4afc28`

The cockpit supervisor will publish and backfill the commit SHA after this process exits.

cockpit publication refused before its path list was frozen: DATA-CATALOGUE: FAIL — proposed publication has uncatalogued data: analyses/GOOGL_2026-11-03/expectations_gap_v3.json

Automatic resume is off for this run: the supervisor refused the publication for a reason that running it again cannot change. Fix the cause shown above, then resume it manually.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
