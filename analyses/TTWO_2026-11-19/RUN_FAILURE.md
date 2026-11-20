# Run Failure

- ticker: TTWO
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_refused
- stopped_at_utc: 2026-11-20T12:43:55.016Z

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
GATE-VERIFY:` **not available** — `verification_report.json` could not be written, so verify-evidence did not run
- `GATE-EXPECTATIONS:` **not available** — `expectations_gap.json` could not be written
- `pre_mortem.json` could not be written → **no confidence haircut, no `post_mortem_decision`** was applied
- the final immutable audit set (10B.3A) was not created
- **`IDEA-ADMISSION: error` — no `idea_admission.json` exists.** `idea_projection_manifest.json` and `idea_3_6m.json` are also denied

Consequently I left both markers in place: `.requires_idea_publication` (the server's proof publication did not finish) and `.defer_module_memos` (Step 9B's seven items did not all complete; it is gitignored and never committed). I did not delete either, and `RUN_FAILURE.md` did not exist.

`memo.md` and `audit_dossier.md` therefore reflect the **pre-audit, gate-passed** state. Both say so explicitly, as does `RUN_METADATA.md`. If the audits later move the decision or confidence, both tiers need regenerating from the sealed state.

**Intake receipt:** none (3-token form).
**Commit:** `PUBLICATION_QUEUED=61731ed5-bf50-4a67-81e9-295479646b34` — trusted supervisor publication is queued; the supervisor freezes the final bytes, stamps provenance, and performs the commit after all processes exit. No SHA is available to me, and Git is not reachable from this process by design.

**Per the command's own hard rule, this thesis-producing rerun is incomplete and must not be treated as done.** Finishing it needs an invocation whose write policy admits the audit and publication artifacts; the analytical work above is complete and committed-pending-supervisor.

Final research audits are missing, stale, or disagree with the published review outcome. Completed work is preserved; no automatic paid retry is allowed.

Automatic resume is off for this run: the supervisor refused the publication for a reason that running it again cannot change. Fix the cause shown above, then resume it manually.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
