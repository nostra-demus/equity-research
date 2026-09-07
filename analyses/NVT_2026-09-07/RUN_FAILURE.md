# Run Failure

- ticker: NVT
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-07T20:22:57.198Z

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
hat absence. The FY2024 Form 10-K *inside this run's own frozen generation* carries Item 1 "Backlog of Orders by Segment" — Total **$749.3m (2024) vs $462.8m (2023), +61.9%** — and the CIQ Balance Sheet tab carries the same $749.3m plus FY2025 $2,349.9m. Three on-record Q2 statements pointing the other way (CFO: *"off to a really strong start here in Q3 on the order front"*; LTM order growth *"much higher"*; CEO framing the backlog fall as deliberate) appear nowhere in the thesis — a §3 failure to adjudicate the disagreeing number in the engine's own data.

Both audits judge the **direction** as surviving (it rests on reverse-DCF/DCF/comp evidence that never touches the order series — 6.21% implied cost of capital vs the company's own disclosed 10.0% WACC) while the **edge** does not: expectations-gap grades variant perception `Weak` / not exploitable, edge **26**/100 against the synthesizer's self-scored 46.

## To unblock

Two options, your call:

1. **Widen the Bash sandbox write allowlist** to the run root `/Users/admin/nostra-prod/analyses/NVT_2026-09-07/` (or at minimum permit new-file creation there), then re-run from `10B.4`: manifest → final re-projection → schema checks → freezer → memo/dossier → `RUN_METADATA` refresh → marker removal → single commit. Nothing needs redoing before that point; the audit set is already pinned to the current bytes.
2. **Treat it as a hard manifest failure** under `10B.4`'s literal branch and start a new dated `/research:full NVT` run. I'd argue against this: that branch is written for an audit set that cannot honestly bless the run, whereas here the creator never evaluated any content — it died on a permission error before reading a byte, and no manifest exists to have been repaired-and-retried.

I'd recommend (1). Separately, given what the audits found, the thesis's edge claim deserves a correction pass before this gets sealed as an ex-ante forecast — but that is a decision for you, not something I should fold into a rerun.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
