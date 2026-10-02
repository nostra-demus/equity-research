# Run Failure

- ticker: BURL
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: after business-model (its synthesis shipped)
- reason: publication_failed
- stopped_at_utc: 2026-10-02T14:41:52.871Z

## Modules completed

- business-model

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
published commit identity does not match repository HEAD

Provider final message:
Completed the BURL business-model module.

- Verdict: **Average business — worth deeper work only if valuation is cheap**
- Agents discovered: 14
  - Layer 0: 1 — data-triage
  - Layer 1: 6 — disqualifier-scan, business-identity, segment-map, customer-geography, external-dependency, capital-allocation-governance
  - Layer 2: 4 — unit-economics, value-chain, business-quality, competitive-map
  - Layer 3: 2 — moat, red-flags-sweep
  - Layer 4: 1 — business-model-synthesis
- Failed agents: none
- Fail-fast triggered: no; triage verdict was Sufficient
- Synthesis: [99_business-model-synthesis.md](/Users/admin/nostra-prod/analyses/BURL_2026-10-02/business-model/99_business-model-synthesis.md)
- Dossier: [business-model_dossier.md](/Users/admin/nostra-prod/analyses/BURL_2026-10-02/business-model/business-model_dossier.md)
- All 14 required artifacts passed the final mechanical validation barrier.

Publication is queued under tracked-cockpit intent `be17216e-4aa9-46d3-8483-bac52e221ce9`. No commit SHA exists yet; the trusted supervisor will freeze the final bytes and publish after this run exits.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
