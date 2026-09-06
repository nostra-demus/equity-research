# Run Failure

- ticker: NU
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: management-governance
- reason: publication_failed
- stopped_at_utc: 2026-09-06T17:27:24.243Z

## Modules completed

- business-model
- competitive-intel
- earnings

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
rnance NU`**

- **Run root:** `analyses/NU_2026-09-06` (cockpit Continue chain, immutable binding validated)
- **Evidence:** frozen four-variable binding verified — generation `f9081efa…f2be`, `raw_prefix: raw/NU` matches the evidence root, no symlinks, 115 non-empty sources. The live `data/NU/` path is used only as a citation label and was never read.
- **Cross-module context:** business-model ✅, earnings ✅, balance-sheet-survival ❌ (its folder is empty in this run root — omitted, no fallback to older dated runs).
- **Agents discovered:** 14 — layer 0: 1, layer 1: 2, layer 2: 10, layer 3: 1 (synthesis).
- **Memory runtime:** `shadow` mode; packet compilation is being rejected by the memory service, so per `MEMORY_RUNTIME.md` §1 the error is recorded and agents dispatch without memory packets. This does not gate the module.
- **Layer 0 complete:** triage verdict **Sufficient** — no fail-fast. It did flag binding caps: no network in this sandbox, so the external legal/registry sweep can't run (People & network integrity capped at 65, legal/regulatory risk floored at 40, confidence capped at 70); per-individual pay is undisclosed under the Cayman/FPI exemption; no AGM vote tallies exist while the founder holds 74.4% of votes. Layer checkpoint queued for publication.
- **Layer 1 running now:** `management-and-track-record` and `people-integrity-dossiers`, dispatched concurrently. Both were told explicitly that outbound network is blocked, to run the filings-based half of their mandate in full, and to declare the database sweep as an honest coverage gap rather than stalling.

I'll dispatch Layer 2's ten specialists once Layer 1 verifies, then the synthesis, sidecars, and commit. One thing worth flagging now: the network block is a real constraint on this module specifically — agents `07` and `12` are the two whose mandates lean hardest on external legal/regulator databases, so their coverage will be filings-only and the synthesis will carry the caps the triage declared.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
