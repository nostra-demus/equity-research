# Run Failure

- ticker: NVT
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-16T10:53:13.009Z

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
erately did **not** work around this by hand-writing the manifest through the Write tool. Doing so would have created a projection seal that the freezer still could not complete — and a seal permanently blocks any in-place rerun (Step 3A), leaving the run unrecoverable except as a brand-new dated run. A blocked run is recoverable; a half-sealed one is not.

### Sequencing defect I found and fixed mid-run

The v2 audits caught that `decision_record.json` carried `integrity_gate: "pass"` while the thesis banner said verify-evidence = Failed — a thesis the engine would not stand behind being counted as a clean call. 10B.1b requires re-stamping after 10B.2 changes the banner, which I had not done. I re-stamped (now `provisional`, carrying the violation text), which changed the decision-record digest and invalidated the v2 pins, so I re-ran the full final audit set as v3 against the corrected bytes. All three v3 agents independently proved the stamp was the only byte-level change by reconstructing the v2 digest.

### Not done

- `idea_projection_manifest.json`, `idea_admission.json` — **blocked**
- `memo.md`, `audit_dossier.md` — deferred by design to Step 9B item 6, which runs *after* sealing; generating them now would freeze a pre-admission state
- `RUN_METADATA.md` final refresh (item 7)
- **No commit.** Step 9B item 5 mandates STOP before commit on a missing admission. Nothing was pushed; no `PUBLICATION_QUEUED` was requested.
- Markers `.defer_module_memos` and `.requires_idea_publication` correctly left in place — the latter is the server's proof publication did not finish.

All work is preserved on disk at `/Users/admin/nostra-prod/analyses/NVT_2026-09-07/`. To finish, the sandbox write allowlist needs to cover the run root (or at least `idea_projection_manifest.json`, `idea_admission.json`, and dot-prefixed temp files within it); I can then resume from manifest creation without redoing any analysis. Want me to prepare that as a settings change for you to approve?
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
