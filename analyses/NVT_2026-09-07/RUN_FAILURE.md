# Run Failure

- ticker: NVT
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-08T05:19:09.767Z

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
ission, master memo/dossier not regenerated, `RUN_METADATA.md` not refreshed from sealed state |
| Step 10 commit | **Not run.** Bytes are preserved on disk under `/Users/admin/nostra-prod/analyses/NVT_2026-09-07/`. |

Markers `.defer_module_memos` and `.requires_idea_publication` are deliberately left in place — the second is the server's proof publication did not finish.

**Thesis verdict:** Avoid · conviction 33 (post-review 25) · basket Rejected · rating cap "Watchlist" from §24 Filter 4. Published PROVISIONAL/UNVERIFIED.

### One finding worth your attention before this run is sealed

All three final audits independently landed on the same defect. The dossier asserts, four times and as an absolute, that *"no filed backlog series exists at any level in any period"* — and builds kill criterion 2, the §17 trigger test, a Claim-Quality-Ledger downgrade, forecast `FC-NVT-BACKLOG-2026Q3` and a `data_needs` item on that absence. The FY24 10-K in the run's own frozen corpus has a *"Backlog of Orders by Segment"* table (total $749.3m vs $462.8m, +61.9%), and the CIQ balance-sheet tab in the same generation carries an annual Order Backlog row ($749.3m → $2,349.9m). Both point up. It is a §20 bad-extraction error hardened into a §3 strong-verdict claim, and it sits under the run's only Critical red flag. The Avoid's *direction* survives all three audits (the reverse-DCF requires +21.8% FCF growth for nine years against a disclosed 10.0% WACC); its *urgency* does not.

Two smaller items also stayed open across both verification passes: the §24 Filter 4 line `$3,017.2m ÷ $2,091m = 158.3%` is mixed-basis (144.3% on that denominator), and a §6 peer row labelled "Net debt / EBITDA 1.51x" reconciles only to *gross* debt / EBITDA against canonical net leverage of 1.15x strict.

Sealing as-is would freeze those into the ex-ante forecast record. Fixing them requires a new dated run, not an in-place edit — so it is worth deciding that before you widen the sandbox and let me resume.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
