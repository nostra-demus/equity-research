# Run Failure

- ticker: NVT
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-16T07:32:27.840Z

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
ission stops before commit. So I did **not** run the freezer, did **not** regenerate the master memo/dossier (9B.6), did **not** refresh RUN_METADATA from final state (9B.7), and did **not** commit. I did not hand-write the manifest — that is forbidden and would forge the projection seal.

**No commit SHA. No `PUBLICATION_QUEUED`. Intake receipt: none (3-token form).**

### State is clean for resumption

- `.defer_module_memos` and `.requires_idea_publication` both still present — the server's correct proof that publication did not finish. I removed neither.
- No `idea_projection_manifest.json`, no `idea_admission.json` — nothing sealed, nothing corrupted.
- Pinned inputs unchanged since the final audits: `final_thesis.md` `6bc66602…5505c`, `decision_record.json` `0d946d6e…2b89e1`.

### To finish this run

Add the run-root directory (or `idea_projection_manifest.json` plus the `.idea-projection-manifest-*.json` temp glob) to the sandbox write allowlist, then resume from 10B.4 — manifest → final re-projection → `freeze_idea_admission.py` → master memo/dossier → RUN_METADATA refresh → commit. Because nothing is sealed and the inputs are byte-stable, resumption is valid; a new dated run is not required.

Two things to flag:

1. **The v2 pre-mortem supersedes the recorded haircut.** It recommends confidence **22** (haircut 9 from 31, cumulative — explicitly *not* additive to the recorded 25). `decision_record.json` still carries the v1 haircut of 6, correctly, because 10B.3A bars any writer over the pinned inputs after the final audits. The freezer reads the final audit directly, so this resolves itself on resumption — but do not re-run haircut propagation by hand first.
2. **A sub-agent left `analyses/NVT_2026-09-07/.scratch/build_pm2.py`** (54KB, inert). The sandbox denies unlink under `analyses/`, so I could not remove it, and `git` is unavailable in this sandbox so I could not verify whether it is ignored. It should be removed or excluded before the eventual commit.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
