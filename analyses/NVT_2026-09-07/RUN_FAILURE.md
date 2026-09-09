# Run Failure

- ticker: NVT
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-09T23:27:33.287Z

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
esolve outside the workspace. This session's Bash sandbox permits creating only four filenames there (`final_thesis.md`, `decision_record.json`, `memo.md`, `audit_dossier.md`). `create_idea_projection_manifest.py:241` and `freeze_idea_admission.py:393` both `mkstemp(dir=...)` + `os.replace` inside the run root, so neither can run. `git` is blocked too, so Step 10 could not have committed regardless. This is an environment capability gap, not a research defect.

I did not hand-write the manifest (that would reproduce the canonical hashing by hand and bypass the first-writer-wins lock), did not record `not_applicable` (the command forbids it for a missing seal), and left `.requires_idea_publication` and `.defer_module_memos` in place. Diagnosis written to `analyses/NVT_2026-09-07/RUN_FAILURE.md`.

## Two things worth your attention

**The thesis is PROVISIONAL and the audits are adverse.** Standing decision is **Avoid** (Rejected basket, conviction 23.2, post-review 17.2). Both verify-evidence passes returned *Material issues*.

**A real defect was found, corrected, and then partly recreated.** The thesis asserted four times that no filed order/backlog series existed; the FY2024 10-K carries a `Backlog of Orders by Segment` table ($749.3m vs $462.8m) and the correction cut *against* the thesis (`edge_score` 38 → 30). But `pre_mortem_v2` then found the corrected text's new absolute — "no filed *quarterly* series" — is also false: RPO of $2,591.0m (2026-03-31) and $2.5bn (2026-06-30) sit in consecutive 10-Qs. Step 10B.3A forbids any writer after the final audit set, so this stands unacted-on by design. The load-bearing demand claim has now been mis-graded twice, which is a §20 bad-extraction pattern rather than a slip.

To finish: re-run this master step where the sandbox permits the manifest/admission writers and `git` inside the run folder. If the pinned bytes need to change to address those findings, that requires a new dated run — not an in-place repair of this one.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
