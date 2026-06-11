# M0.6.4 Mispricing Reason — SIG-20260610-a3f2c81d

> FIXTURE — hand-crafted golden example; not a live run output.

## 1. Primary Category

- **primary_category:** complexity
- **primary_category_rationale:** Pricing the variant needs three layered per-lender datasets (borrowing mix + roll schedule, EBLR share, deposit beta) — cross-sectional work the day-one macro re-rating skipped. Not 'timing' alone: even updated models must DO the mix work.

## 2. The Three Verifiable Facts

1. **fact_1:** Day-one sub-index return dispersion across financials was under 80 bps despite opposite first-order funding effects — *verify via:* exchange sub-index closes, 2026-06-10.
2. **fact_2:** First-48h estimate revisions were sector-wide drifts, not funding-mix differentiated — *verify via:* aggregator revision logs, 2026-06-10/11.
3. **fact_3:** Houses' last published financials models predate 2026-06-10 (model dates visible on aggregators) — *verify via:* model date stamps.

## 3. Secondary Categories

| Category | Rationale |
|---|---|
| timing | Models update on results cadence; the mid-cycle cut enters models only after Q2 FY27 prints. |

## 4. Verdict

Verdict: complexity — 3/3 facts verifiable
