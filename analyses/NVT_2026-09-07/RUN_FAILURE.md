# Run Failure

- ticker: NVT
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-10T13:28:43.998Z

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
sh, and only the freezer may remove it.

### Not done
`idea_projection_manifest.json`, `idea_admission.json`, master `memo.md`, `audit_dossier.md`, the Step 9B item 7 metadata refresh, and the commit. Module *dossiers* are also absent for all 7 modules — the chain never ran `MODULE_PIPELINE` Step 4.9B (which is required on every run, deferral suppresses only the memo); I attempted the deterministic rebuild and it hit the same EPERM.

### Two findings you should see regardless
1. **The truth-integrity audit failed hard** — `Material issues`, integrity **14/100** (v1) and **0/100** (v2). The critical finding: the thesis asserts in six places that *"there is no filed order, backlog or book-to-bill series anywhere in this pool, at any period"*. That is false. The FY2024 10-K Item 1 p.2 carries **"Backlog of Orders by Segment"** ($749.3m FY2024 vs $462.8m FY2023, +61.9%), and the CIQ Balance Sheet extends it to **$2,349.9m FY2025**. Two of the run's own sub-agents found it and wrote the correct hedge; the synthesis layer inverted it into an absolute — a §3 qualifier-drop on the one variable the thesis turns on. Put on one axis, the "order turn" largely dissolves: the book sits +6.4% above the last filed point.
2. **The v2 audits moved against the thesis** — pre-mortem haircut widened to 11.0 (41.8 → 30.8) and expectations-gap downgraded to `Weak` / edge **27** (from Moderate / 43). Those v2 conclusions are the ones the freezer would consume, and they were never propagated (correctly — 10B.3A forbids writers after the final audit set).

**To resume:** grant write access to `analyses/NVT_2026-09-07/` (not just the four files) and re-run this command; Steps 1–9B.4 are idempotent and the audits will re-version. Given finding 1, the more defensible route is a new dated `/research:full NVT` run — the backlog error is load-bearing on the edge score, the kill criteria, and the sufficiency read, and this run is still unsealed so nothing forces the flawed forecast into the record.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
