<!-- resumed-from: analyses/UBER_2026-08-08 | run-date: 2026-08-08 -->

# Scoped re-run — balance-sheet-survival

> New data invalidated part of this module, so it is **staged for a scoped rerun, not a rebuild from
> scratch**. The finished specialist orbs were carried verbatim from the run below; the orbs `00_solvency-data-triage.md`, `01_capital-structure-and-leverage.md`, `02_maturity-wall-and-refinancing.md`, `03_liquidity-runway.md`, `04_coverage-and-covenants.md`, `05_off-balance-sheet-and-contingencies.md`, `06_downside-stress-test.md` and this module's synthesis
> are scoped to re-run against the refreshed pool for THIS run.
>
> **This note is written at staging time, before the rerun executes.** It records what was carried and
> what is scoped to run — it is not a claim that the rerun has finished. If the launch never starts, or
> this module's agent aborts, the work above was never actually refreshed; this module's own
> `99_*-synthesis.md` (present or not) is the ground truth for whether it completed.

- Carried from: `analyses/UBER_2026-08-08` (run dated 2026-08-08)
- Copied into: `analyses/UBER_2026-08-09`
- The carried orbs keep the vintage of the run that produced them, not this run's date.

**How to read this.** The intake plan that scoped these holes rides in THIS run root
(`intake/*_intake_plan.json`, copied verbatim from the run whose analysis produced it); it names the
documents that landed and the exact orbs they invalidate. This module is scoped to re-run exactly those
plus its synthesis, and every module downstream of it is scoped to re-run its synthesis. The rest of the
run is carried, priced and stamped.
