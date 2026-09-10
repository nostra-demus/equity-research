# Run Failure

- ticker: NVT
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-10T08:18:43.972Z

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
ra-prod/analyses/NVT_2026-09-07/.idea-projection-manifest-qm02bwhc.json'"}
```

The sandbox allows Bash to write only four *pre-existing* filenames in the run root (`final_thesis.md`, `decision_record.json`, `memo.md`, `audit_dossier.md`). Both `create_idea_projection_manifest.py` and `freeze_idea_admission.py` must `mkstemp(dir=<run root>)` then atomically rename — that is the first-writer-wins seal, and neither offers a relocation option. The Write tool can create files there (that is how the audit JSONs and `RUN_METADATA.md` landed), but these are locked deterministic writers and I will not hand-roll a projection manifest or an admission result — a fabricated seal is exactly what the freezer exists to prevent.

Per 10B.4 and Step 9B item 5 I stopped before market capture, re-projection, the freezer, the master memo/dossier (9B.6), the metadata refresh (9B.7), and **the commit**. Nothing was mutated or retried. Both markers remain in place, including `.requires_idea_publication` — the server's proof that publication did not finish. No commit SHA; no intake receipt (3-token form).

**This run is not done and must not be recorded as done.** To finish it, the sandbox needs write access to the run-root *directory* — `/Users/admin/nostra-prod/analyses/NVT_2026-09-07/` and its `/private/tmp/nostra-claude-workspace-P3ICvD/` twin — rather than the four named files. With that in place the chain resumes cleanly at 10B.4, since the manifest pins bytes that are already final and digest-stable. I'd rather you make that call than have me widen anything myself.

One inconsistency worth your attention regardless: `decision_record.integrity_gate` reads `status: "pass"` while the thesis banner reads *Material issues*. Both are correct about different gates (10B.1b stamps only the deterministic math/cap gate), but both final auditors flagged the pair as misleading to anything reading the record alone — and `10B.3A` forbade me from writing over those inputs once the final audits ran.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
