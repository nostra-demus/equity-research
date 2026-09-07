# Run Failure

- ticker: NVT
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-07T16:43:35.299Z

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
–4):** `RUN_METADATA.md` backfilled; the LLM audit trio ran; haircut propagated; the final immutable audit set (`verification_report_v2`, `pre_mortem_v2`, `expectations_gap_v2`) written against byte-stable inputs, each pinning the exact digests.
**Blocked (items 5–7):** projection manifest, final re-projection, freezer, master `memo.md` + `audit_dossier.md`, and the final `RUN_METADATA.md` refresh. Markers not removed.

**Also done:** all seven module memos regenerated (Step 9A). Module *dossiers* are outside Step 9A's scope — only `catalyst` and `valuation` have one; the other five modules never got one from the chain.

**Memory:** mode `shadow`; `research_memory_client.py compile --agent-key master/synthesizer` exited 1 (`memory request rejected`). Per MEMORY_RUNTIME §1 that was recorded and the ordinary no-memory Task dispatched — non-blocking in shadow.

**Intake receipt:** none (3-token form).
**Publication:** `PUBLICATION_QUEUED=c902dc32-73b5-4ea0-99c5-df187f4c20da` — no SHA available to me by design.

**Two things worth your attention.** The thesis ships with a `PROVISIONAL` banner: verify-evidence scored 0/100, its lead finding being that the thesis asserts five times that the order-book series *"exists in NO filing, at any level, in any period"* while the FY2024 10-K carries a filed segment-level backlog table ($749.3m vs $462.8m, +61.9%) — the final pre-mortem additionally surfaced a CIQ FY2025 row of $2,349.9m. Both audits flag this as a §20 bad-extraction defect undercutting a load-bearing edge claim. That is a substantive finding, independent of the timestamp bug.

To finish publication, the doctrine's remedy is a genuinely new dated `/research:full NVT` run, not a patch of this one. If you'd rather fix the timestamp defect at its source, the durable fix is in the expectations-gap command/agent contract so `performed_at` is always emitted timezone-aware — that's a code change and would go through the §28 PR path. Tell me which you want and I'll proceed.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
