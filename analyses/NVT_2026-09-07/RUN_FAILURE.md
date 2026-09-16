# Run Failure

- ticker: NVT
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-16T08:41:11.810Z

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
on
```

This is a session-provisioning gap, not a data or content failure: the allowlist matches a *standalone* master rerun, but `.requires_idea_publication` means this run is the terminal step of a chained full, which must additionally seal an ex-ante idea. (The sub-agents' audit JSONs landed because the Write tool has a separate path; the deterministic scripts must run under Bash.) The manifest was never created, so first-writer-wins is unconsumed and a retry after the sandbox is widened is clean — this does **not** require a new dated run.

I did not hand-build the manifest or admission. Both encode canonical digest, decision-authority and timestamp reconciliation under a directory lock; reproducing that by hand would fabricate the seal the gate exists to prove.

### Consequently not done, deliberately

- **9B.6 — `memo.md` / `audit_dossier.md`:** these must be generated *from the sealed final state*. Writing them now would freeze the preliminary Ideas state, which the ordering exists to prevent.
- **9B.7 — final `RUN_METADATA.md` refresh:** the backfill stands; the final admission status does not exist yet.
- **Markers left in place:** `.defer_module_memos` and `.requires_idea_publication` — the server's proof publication did not finish. Removing either would misreport the run as complete.
- **Step 10 — no commit.** Step 9B.5 requires stopping before commit when admission is missing, and a per-module chain with no valid `idea_admission.json` must never be reported as done. Nothing was pushed; no `PUBLICATION_QUEUED` line exists.

**`IDEA-ADMISSION: error`** — `[Errno 1] Operation not permitted: '/Users/admin/nostra-prod/analyses/NVT_2026-09-07/.idea-projection-manifest-*.json'`
**Commit SHA: none.** **Intake receipt: none** (3-token form).

To finish, the session needs Bash write access to `analyses/NVT_2026-09-07/` (or at least those three filenames). Once that's granted I can resume at 9B.5 and complete items 5–7 plus the commit without redoing any paid work.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
