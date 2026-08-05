# M0.6.4 Mispricing Reason — SIG-20260804-da21208a

## 1. Primary Category

- **primary_category:** complexity
- **primary_category_rationale:** The mechanism M0.6.3 found — marginal incentive spend running above the average rate, and GMV growth splitting 81% user-count / 14% per-user-spend — is not a number Grab publishes or any sell-side note carries. Getting to it means pulling incentive dollars and GMV from two separate quarterly releases, computing the period-over-period change by hand, and then cross-checking that against segment-level incentive figures that sit in different sections of the same release (Facts 1–3 below). The raw numbers are all already public — nothing is stale, which rules out timing — so the reason this isn't priced is that the standard workflow of updating a model off Grab's own pre-computed blended ratio never performs the extra subtraction step, not that the data is missing or hard to find.

## 2. The Three Verifiable Facts

1. **evidence_verifiable_fact_1:** Grab's Q2 2026 earnings release states the on-demand incentive ratio only as a single blended level with the company's own year-over-year comparison already done for the reader — "on-demand incentives as a proportion of on-demand GMV increased 72bp YoY to 10.9%." No line in the release computes an incremental (marginal-dollar-over-marginal-GMV) ratio; getting that number means separately pulling the raw incentive-dollar and GMV figures from this release and from the prior-year Q2 2025 filing and doing the subtraction and division independently. — *verify via:* Grab Q2 2026 press release, grab.com, 2026-08-04; Grab Q2 2025 Form 6-K, SEC EDGAR CIK 1855612, filed August 2025.
2. **evidence_verifiable_fact_2:** The release reports GMV, MTU, and GMV-per-MTU growth and the incentive-ratio figures in separate "segment highlights" subsections for Mobility, Deliveries, and Financial Services, rather than in one table that ties incentive dollars directly to which growth driver — new users or existing-user spend — they funded. Confirmed by a direct read of the release's own section structure. — *verify via:* Grab Q2 2026 press release, grab.com, 2026-08-04 (section headers "Mobility," "Deliveries," "Financial Services").
3. **evidence_verifiable_fact_3:** The single 10.9% group-level incentive ratio cited elsewhere in this record is itself a blend of two segments moving at different speeds: Deliveries incentives ran 11.9% of GMV in Q2 2026 (up from 11.3%), while Mobility incentives ran 8.8% of GMV (up from 7.8%). A reader has to break out this segment split before the marginal-intensity mechanism can be correctly attributed to demand growth versus fuel-crisis driver support, and the group average does not show it on its own. — *verify via:* Grab Q2 2026 results, segment highlights, reported in "Grab Q2 2026 slides: EBITDA surges 54% as profitability accelerates," Investing.com, 2026-08-04, cross-checked against the grab.com press release of the same date.

## 3. Secondary Categories

| Category | Rationale |
|---|---|
| behavioral | Zero Hold/Sell ratings across 26 analysts (M0.6.1) shows the Street anchors on Grab's own pre-computed, already-favorable blended ratio and "record results" framing rather than recomputing a marginal figure; breaking from 25 peers to flag a subtler growth-quality read carries a career-risk cost that reinforces the anchor (M0.6.1 entrenchment_note). |
| mandate_constraint | GRAB's status as the largest Nasdaq-listed Southeast Asia platform stock makes it a default or required holding in regional-growth and EM-tech mandates (M0.6.1 entrenchment_note); a mandate-driven holder owns the name regardless of the incentive-intensity math, which weakens the incentive for that holder base to do the segment-level disaggregation in Fact 3. |

## 4. Verdict

Verdict: complexity — 3/3 facts verifiable
