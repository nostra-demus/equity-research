# Run Failure

- ticker: NVT
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-09T12:11:59.186Z

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
 glob the pipeline reads. Please delete both before the run is retried.

### The finding you should see regardless

All three final audits independently reached the same conclusion, and it is rating-driving. `final_thesis.md` asserts in roughly eight places that no filed order/backlog series exists "at any level, in any period" — and in §9A calls that series the single piece of evidence that would move it most. **That is false against the bound generation.** The FY2024 10-K Item 1 files "Backlog of Orders by Segment" (Total $749.3m vs $462.8m, +61.9%), and the CIQ workbook carries an `Order Backlog` row (749.3 / 2,349.9).

This is a synthesis-layer failure, not extraction: `business-model/02`, `business-model/09`, `earnings/03` and `earnings/06` all found, cited and used the series with the correct narrow qualifier ("filed only annually"), which hardened into an absolute on the way up (§3). The series also runs *opposite* to the verdict — +61.9%, then +213.6%, with Jun-2026 ~$2.5bn about 6% above the last filed year-end — against the rounded −3.8% sequential step the Critical demand flag rests on, which `earnings/03` says sits inside its source's rounding. The run states that flag is why this is Avoid rather than Watchlist.

`verify-evidence` v2: **Failed, integrity 0/100**. `expectations_gap_v2`: quality **Weak**, `is_exploitable` **false**, edge **18**. `pre_mortem_v2`: **Survives with haircut**, 39.8 → 31.8. The valuation legs (reverse-DCF, WACC, EV bridge, scenario math) verified clean and are independent of the defect — the *direction* of the Avoid holds; the stated evidentiary basis for the Avoid-vs-Watchlist notch does not.

Because the run is sealed-blocked, none of this is committed. Given 10B.4 forbids repairing a dated projection in place, the backlog defect is best fixed by a new dated `/research:full NVT` run rather than another rerun into this folder. Want me to raise the sandbox-vs-freezer incompatibility as the primary blocker for the operator first?
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
