# Run Failure

- ticker: NVT
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-07T21:45:41.278Z

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
ication_report_v2.json`, `pre_mortem_v2.json`, `expectations_gap_v2.json`.

**Step 9A:** all 7 deferred module memos generated and validated.

### The run is incomplete — `IDEA-ADMISSION: error`

`create_idea_projection_manifest.py` failed (exit 2): `Operation not permitted` creating its atomic temp file. This is an **environment write-permission denial, not a data or logic failure** — the sandbox write allowlist for this run directory covers only `final_thesis.md`, `memo.md`, `audit_dossier.md`, and `decision_record.json`. It reproduced identically on an independent second attempt, and direct `git` is blocked the same way.

Per 10B.4 this is a hard stop, so I performed **no** market capture, final re-projection, schema replacement, freezer invocation, or derived-output recovery. Therefore:
- No `idea_projection_manifest.json`, no `idea_admission.json` — the run is **not sealed**.
- `idea_3_6m.json` remains the preliminary pre-audit `not_assessable` wrapper and must not be read as final.
- The deferred master **`memo.md` and `audit_dossier.md` were not generated** (items 6–7 of Step 9B) — they may only be built from sealed final state.
- Both markers deliberately left in place: `.requires_idea_publication` and `.defer_module_memos`.

I recorded all of this in `RUN_METADATA.md` rather than letting the metadata imply completeness. 10B.4 prohibits repairing in place and retrying this dated projection — once the write permission for the run directory is fixed, this needs a genuinely new dated run.

**Intake receipt:** none (3-token form). **Commit:** `PUBLICATION_QUEUED=62d3eaf5-43bc-45f4-85c3-f506cb8d3051` — queued to the trusted supervisor; no SHA is available to me in cockpit mode, and the bytes are preserved as 10B.4 requires.

One judgment call worth your attention: I committed rather than withholding, because 10B.4 says to preserve the failed run bytes and the markers keep the cockpit's own incompleteness signal intact. **This must not be reported as a done run.**
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
