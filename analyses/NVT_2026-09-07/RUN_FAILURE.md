# Run Failure

- ticker: NVT
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-10T09:42:32.803Z

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
l hashing and first-writer semantics by hand — so there is no legitimate workaround. The audit JSONs landed only because sub-agents wrote them through the harness Write tool.

Per 10B.4 and Step 9B item 5 I stopped: **`IDEA-ADMISSION: error`**, no commit, nothing published. `.defer_module_memos` and `.requires_idea_publication` are both intentionally left in place — the latter is the server's proof that immutable publication did not finish. `master memo.md` and `audit_dossier.md` were deliberately **not** generated, since 9B.6 requires them to derive from the sealed final state.

**Headline (unsealed):** Avoid / Rejected — expected return −29.3%, downside +59.2%, R/R −0.50, conviction 31.2 (post‑mortem 26.2), edge 45, data sufficiency 63. Thesis carries the PROVISIONAL/UNVERIFIED banner.

**Two findings you should see, independently reached by all three v2 audits:** the thesis asserts six times, as a §3 closed-list absolute, that the backlog figure "exists in no filing, at any level, in any period" — the FY2024 10‑K carries a filed *Backlog of Orders by Segment* table (Total $749.3m vs $462.8m), and three of the run's own modules cite it. Separately, the haircut propagated into `decision_record.json` but not into the thesis, which still headlines conviction 31.2. Independent edge came in at **30/100, Weak, not exploitable** versus the self-reported 45.

**Two things I own:** a `_probe.json` I created to diagnose the write policy is stuck in the run root — Bash `rm` is denied, and neither I nor a sub-agent can delete it. And the 7 module `*_dossier.md` tiers are absent (blocked by the same restriction); they were outside this rerun's scope anyway, since a master target skips Step 7.

To finish, this needs a session whose sandbox allows writes under `analyses/NVT_2026-09-07/` — then 9B.5 through Step 10 can run unchanged. Given the confirmed evidence defect, re-running the master synthesizer first is worth considering, since sealing pins these exact bytes permanently.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
