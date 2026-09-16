# Run Failure

- ticker: NVT
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-16T13:05:16.842Z

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
sier.md`, `decision_record.json` — which is precisely `ROOT_ARTIFACTS_RERUN` in `ui/server/src/launcher.ts:1945`. The cockpit classified this launch as a `rerun`, and `launcher.ts:968-978` states the supervisor validates those artifacts, then stamps, commits, clears `.requires_idea_publication`, and sets `publicationCompleted`. So sealing is the supervisor's post-process step here, not the provider's; `/research:rerun` Step 9B item 5 assumes a non-cockpit context. I did not work around it, and I left both `.requires_idea_publication` and `.defer_module_memos` in place — the freezer alone may remove the former, and the latter marks that item 5 did not complete in-process.

**Per the command's own hard rule, this per-module chain has no valid `idea_admission.json` and is therefore not done.** If the supervisor's publication step does not produce it, that seal needs a separate operator action.

**Two pre-existing gaps I observed but did not fix** (both outside this master-target path's scope):

1. **Module dossier tier is 0 of 7** — `MODULE_PIPELINE.md` Step 4.9B never produced `<module>_dossier.md` in any of the chain's module runs. The master-target path skips Step 7, which is what would otherwise refresh that tier.
2. The PROVISIONAL banner and `integrity_gate.violations` cite `verification_report.json` at 17/100, while the authoritative final audit is v2 at 11/100 — 10B.3A's immutability rule forbids re-stamping after the final audit set exists.

**The thesis ships PROVISIONAL / UNVERIFIED.** The `Avoid` call itself is well-supported and unanimously survived all three audits, but the supporting figures carry material defects — foremost that the dossier asserts six-to-seven times that no filed order-book figure exists, while the frozen pool contains at least four (including $2,591.0m RPO in the Q1 FY26 10-Q Note 2). Correcting that strengthens the bear case but removes the framing the edge paragraph rests on. All four known defects are itemised in `RUN_METADATA.md`.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
