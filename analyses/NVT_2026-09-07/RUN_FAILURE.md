# Run Failure

- ticker: NVT
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-08T00:14:16.819Z

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
it set, the post-audit projection manifest, and `freeze_idea_admission.py`, which must create `idea_admission.json` and take a directory lock on the run root

Per the command's hard rule, a per-module chain with no valid `idea_admission.json` is incomplete and must never be reported as done, and a freezer that cannot run is a STOP before commit. So I ran no `commit-run.sh` and there is **no commit SHA**. `.requires_idea_publication` and `.defer_module_memos` both remain in place — the server's own proof that publication did not finish.

`eval.py` confirms the state: the only failing check is `A_structural` (missing `RUN_METADATA.md`); `L_three_tiers` and `Q_module_tiers` now pass.

## Two things you should know

**Five module dossiers are stubs, not dossiers.** Module dossiers were missing across all 7 modules (the pipeline's Step 4.9B tier, which should have been produced during each module's own run). I generated them; `catalyst` and `competitive-intel` are genuine. The other five exceeded the single-write ceiling once Bash was denied, and the sub-agent left honestly-labelled `ASSEMBLY FAILED — this file is NOT the dossier` stubs (1.7–2.5 KB) at those paths. They are not misleading to a reader, but they **do satisfy `eval` check Q by existence alone**, so that check's PASS overstates the run. This attempt also cost roughly $38 of the session budget for little return — the fix is a config change, not more model work: add `analyses/**/*_dossier.md` to the Bash sandbox write allowlist, after which one deterministic `python3` run rebuilds all seven in seconds with zero model involvement.

**Two retrospective advisories** on this run (informational, not gating): `forecast_ledger[5]` came due 2026-09-07 and is still open, and `kill_criteria[4]`'s 2026-03-31 monitor event passed unchecked.

To finish the chain, either re-launch this master step with the write grant widened to the run root, or have the supervisor perform the projection/admission and metadata steps itself.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
