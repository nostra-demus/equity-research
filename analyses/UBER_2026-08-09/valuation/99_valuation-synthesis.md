# Valuation Module — UBER (Synthesis)

## Abstract

UBER sits close to fairly valued: the base-case fair value of $74.77/share is only 9.7% above the $68.18 price (2026-08-06, pool-verified), just inside the ±10% "fairly valued" band rather than a clear mispricing. Bull/base/bear fair-value levels of $104.17 / $74.77 / $47.24 (12-month), plus a longer-dated $43.38 structural-reset floor, are driven mainly by the peer-relative EV/EBITDA read (38% weight), which converges within 1.2% of an independent own-history-based warranted-multiple check. The price implies just a 5.05% ten-year free-cash-flow growth rate and a steady-state margin Uber has already beaten on a trailing basis — a conservative, achievable bar, not an aggressive one. The margin of safety is a thin 8.82% cushion to the base case, against a much larger 30.7% downside to the 12-month bear (36.4% to the structural-reset floor) — the risk/reward already looks downside-skewed on a one-year view. No misaligned-owner value-trap risk applies here; the cheapness, such as it is, looks modest and largely explained rather than a trap. Verdict: Fairly valued.

## 1. Valuation Verdict

- **Verdict:** Fairly valued
- **Base-case fair value (point, per share):** $74.77
- **Current price:** $68.18 (2026-08-06, last close, pool-verified — corroborated by two independent Capital IQ exports)
- **Bull / Base / Bear fair-value levels (points):** Bull $104.17 / Base $74.77 / Bear $47.24 (12-month horizon), plus a separately-labelled structural-reset (AV-disruption) avoid-ruin floor of $43.38 (24–36 month horizon)
- **Cross-method dispersion (football field, low–high):** $48.22 (sum-of-the-parts base) to $87.37 (own-history EV/Sales median reversion) across the four base-case method points — an 81.2% point-to-point spread, explained below (Section 3), not silently averaged
- Valuation attractiveness /100 *(higher = cheaper)*: **54** — a real but thin upside (+9.7% to base), inside the "fairly valued" band; not a deep discount
- Margin of safety /100 *(higher = better)*: **38** — 8.82% cushion to base fair value is a modest buffer, not a real margin of safety
- Valuation confidence /100: **66** — the three forward-looking methods (peers, DCF, own-history) cluster within a 15.4% band ($75.75–$87.37); only the fresh SOTP is an outlier, and it is explained (comp-selection artifact + a real, filed corporate-overhead deduction) and capped at 18% weight, not a live unreconciled disagreement
- Downside risk /100 *(higher = worse)*: **58** — 30.7% downside to the 12-month bear, 36.4% to the structural-reset floor; a real, evidence-grounded downside, not a tail-only risk
- Data quality /100: **87** — full income statement, cash flow, capital structure, consensus, peer comps, and segment data all present in the pool; only minor gaps (no forward Freight comp, a small ~0.3% share-count inconsistency across sub-agents)
- Overall usefulness /100: **83**
- Dominant valuation method (one line): Peer-relative NTM EV/EBITDA (`03`, 38% weight) — it isolates a warranted multiple net of both Uber's own revenue-multiple premium and GAAP EPS's mark-to-market noise, and cross-checks within 1.2% of the base case's own independently-built EV/Sales-implied multiple
- What's priced in (one line): A 5.05% ten-year FCF CAGR, ~1.5 years of above-GDP growth, and a 10.78% steady-state EBIT margin — all below what Uber has already delivered or what `04`'s own base-case DCF assumes; the market is pricing in conservative, not aggressive, expectations
- Biggest valuation risk (one line): The pending, debt-funded Delivery Hero acquisition (~$14.8bn, funded partly by a new €14.2bn bridge facility) is not reflected in any fair-value level above and could raise net debt materially once it closes

## 1A. Module Disconfirmation

- **Strongest bear point:** The freshly-rerun SOTP (`06`) values Uber at $48.22/share, 35.5% below the published base case — and even though the gap is explained as mostly comp-selection sensitivity plus a real corporate-overhead deduction, the $52.3bn capitalized unallocated-corporate-cost subtraction is itself a genuine, filed, audited cost, not a modeling artifact, and it alone swings per-share value by roughly $25 [`06_sum-of-the-parts.md` §4–5].
- **Strongest bull point:** Two independently-derived warranted-multiple reads — the peer-relative quality-and-growth-adjusted NTM EV/EBITDA (13.2x, `03`) and the base-case EV/Sales scenario construction's own implied multiple (13.04x, `07` §5) — converge within 1.2% of each other from completely different starting points, which is a genuine cross-check, not model-fitting [`03_relative-valuation-peers.md` §5; `07_scenario-and-fair-value.md` §5].
- **Single killer risk:** The undisclosed autonomous-vehicle P&L/capex cost — Uber's own 10-K frames AV as a competitive threat it "may fail to offer... at competitive scale... before competitors," Waymo already runs an independent commercialized robotaxi fleet, and `business-model/07_business-quality.md` scores industry disruption risk 32/100, which is what drives the $43.38 structural-reset floor (a 36.4% downside from price) [`04_intrinsic-dcf.md` §5; `07_scenario-and-fair-value.md` §3].
- **Disconfirming evidence already visible:** `02` itself flags that Uber's own EV/Sales de-rating (from a 5-year mean/median of 3.44x–3.55x to a current 2.71x) has real, cited fundamental causes — decelerating revenue growth (18.3%→12.2% YoY) and releveraging (0.82x→~1.3x net debt/EBITDA) — not pure sentiment, meaning a full reversion to the own-history median ($87.37) may not be earned [`02_multiples-own-history.md` §3, §4].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | Sufficient — every method in the map can run, no active partial-data caps | Full pool coverage: price, consensus, peers, segments, cash flow all present |
| price-and-capital-structure | Pool-verified price $68.18 (2026-08-06); EV $149,684.7M; net debt $9,340M (strict basis) | ~1 trading day old — no staleness cap; $3,773M of equity-method investments (new Delivery Hero stake) sit outside the canonical EV bridge |
| multiples-own-history | EV/Sales reversion implies $87.37/share (+28.1%); EV/EBITDA/EBIT/P-FCF history excluded as base-effect distorted | Only EV/Sales offers a clean, undistorted 5-year band; the de-rating has real fundamental causes, not just sentiment |
| relative-valuation-peers | Quality-and-growth-adjusted NTM EV/EBITDA (13.2x) implies $75.75/share (+11.1%) | Forward EV/EBITDA discount to peers (−17.5%) is largely explained by Uber's slower growth vs. DoorDash/Grab, not inferior quality |
| intrinsic-dcf | Base-case DCF value $79.82/share (+17.1%), self-capped Low–Medium confidence | Terminal value 59.5% of EV; disclosed working-capital cash source breaks the standard financeable-growth cross-check |
| reverse-dcf | Price implies a 5.05% 10-yr FCF CAGR — conservative vs. history and vs. `04`'s own base case | The FCF-base definition (not the discount rate) is the dominant sensitivity on what's priced in |
| sum-of-the-parts | Freshly rerun: base SOTP $48.22/share (−29.3% vs. price), dispersion $31.46–$83.99 | 74.2% of the base-to-high spread is driven by a single Mobility-comp choice (Lyft vs. DiDi); a real $52.3bn corporate-overhead deduction also drags the figure down |
| scenario-and-fair-value | Bull $104.17 / Base $74.77 / Bear $47.24, structural-reset floor $43.38 | 81.2% cross-method base-case spread is reconciled (comp-artifact + capped weighting), not silently averaged; margin of safety only 8.82% |

## 3. Reconciliation

**Headline number, and why it is not the finding on its own.** The four value-producing methods' base-case points span $48.22 (SOTP) to $87.37 (own-history EV/Sales), an 81.2% point-to-point spread — well above the 40% Reconciliation Gate 6 tolerance on a raw-spread basis. `07` does not silently average this away, and neither does this synthesis: it reconciles the gap with two named, evidence-based drivers, and the drivers matter more than the raw percentage.

1. **Comp-selection sensitivity inside the SOTP, not new economic information.** Swapping only the Mobility comparable — Lyft (7.94x NTM EV/EBITDA) for DiDi (16.58x) — moves `06`'s own output from $48.22 to $83.99, a 74.2% swing from a single input choice among two comparables Uber's own 10-K names directly as competitors [`06_sum-of-the-parts.md` §2–3]. Neither Mobility's nor Delivery's own unit economics changed between those two SOTP readings — both segments run at materially higher margins than either peer set (`06` §5) — so most of the SOTP's distance from the other three methods is a choice-of-yardstick artifact, not a signal the business is worth less.
2. **A real, filed cost that a segment-only view must net out in full.** The $52.3bn capitalized unallocated-corporate-cost deduction (Corporate G&A + Platform R&D, annualized and capitalized at Uber's own blended multiple) is not an assumption — it is a line-itemized, audited cost that swings the SOTP per-share result by roughly $25 on its own [`06_sum-of-the-parts.md` §4]. This is the one piece of the SOTP gap that is not merely a comp artifact, and it is a legitimate reason the SOTP reads lower than a segment-only sum would suggest.

**How the published base case handles this.** Per the Scenario Construction & Method-Weighting Policy, `04` (DCF) and `06` (SOTP) are capped at a combined ≈⅓ weight for this Operating business with a usable forward multiple — `02`+`03` (own-history and peer multiples) carry the 67% majority. At `06`'s capped 18% weight, its $48.22 outlier pulls the mechanically-weighted blend only 1.3% below `03`'s own $75.75 peer-relative read — the policy visibly did its job: the published $74.77 base is not the $67.80 that a naive average of $48.22 and $87.37 would produce, and it stays anchored on the two forward-looking, majority-weighted methods.

**The three methods that matter most for the base case actually agree closely.** Own-history ($87.37), peers ($75.75), and DCF ($79.82) cluster within a 15.4% band once the outlier SOTP is set aside — a real, if modest, convergence. `03` (peer-relative) is trusted most because it independently isolates a warranted multiple net of Uber's own revenue-multiple premium (which double-counts if EV/Sales is used bluntly) and net of GAAP EPS's mark-to-market noise (which distorts P/E). The base-case scenario construction's own EV/Sales-implied multiple (13.04x) lands within 1.2% of `03`'s 13.2x from a completely independent starting point — the strongest single piece of triangulation in this report.

**Methods broadly agree at the base point once the policy weighting is applied — fair value clusters at $74.77, with the wider $48.22–$87.37 football field explained above rather than averaged away.**

**Minor data-hygiene note (not a fair-value driver).** `02`, `03`, `04`, and `07` use a self-derived fully diluted share count of ≈2,056.327M for per-share fair-value outputs, while `01`'s own exact GAAP diluted weighted-average figure is 2,050.225M (used correctly by `06`) — a ~0.3% mismatch, immaterial to any conclusion here but noted per Reconciliation Gate 4 rather than silently blended.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N — price is pool-verified ($68.18, 2026-08-06) | MoS, downside-to-bear, observed up/down, attractiveness + confidence | Not applied |
| No consensus / forward estimates | N — CIQ consensus present (NTM revenue, EBITDA, EPS) | Valuation confidence | Not applied |
| No peer data | N — 4-name curated peer set (Lyft, DoorDash, DiDi, Grab) present | Overall usefulness | Not applied |
| Only one valuation method usable | N — four value-producing methods ran (02/03/04/06) | Valuation confidence | Not applied |
| No cash flow AND DCF is only method | N — cash flow statement present; DCF is one of four methods | Valuation confidence | Not applied |
| SOTP not possible for multi-segment | N — SOTP ran fully (Mobility/Delivery/Freight) | Overall usefulness | Not applied |
| Methods disagree >40% unreconciled | **Judgment call: N — disagreement is present (81.2%) but IS reconciled** (Section 3: named drivers — comp-selection artifact + a real corporate-overhead deduction — plus the ≤⅓ weighting cap that visibly limits the outlier's effect on the published base to 1.3%) | Valuation confidence | Not applied as a hard cap; reflected instead in the confidence score (66, not higher) rather than a mechanical 55-cap |
| Terminal value >75% of DCF EV | N — DCF terminal value is 59.5% of EV, below the 75% threshold | Valuation confidence | Not applied |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | N — management-governance module found no controlling shareholder (PIF 3.578%, BlackRock 7.417%, both minority) | Valuation attractiveness | Not applied |

No hard cap binds this run. Valuation confidence (66) reflects, by judgment rather than a mechanical cap, that the 81.2% raw spread — while reconciled with named, cited drivers — is still a real source of residual uncertainty (the corporate-overhead deduction and the comp-choice sensitivity are both genuine, not resolved to a single number), so confidence sits in the "Strong" band's lower half rather than higher.

## 5. Fair-Value Summary

The bull/base/bear fair-value levels are $104.17 / $74.77 / $47.24 (12-month), with a separate $43.38 structural-reset floor on a 24–36 month horizon, and the single method driving the base case is the peer-relative NTM EV/EBITDA read (`03`) — chosen because it isolates a warranted multiple net of the two distortions that afflict Uber's other multiples (its own revenue-multiple premium, and GAAP EPS's mark-to-market noise from minority equity stakes). The current $68.18 price implies just a 5.05% ten-year FCF growth rate and a 10.78% steady-state margin Uber's trailing 12 months (12.13%) has already exceeded — an achievable, even conservative, bar against the company's own delivered results and `04`'s own base-case forecast (`05`). The margin of safety to the base case is a thin 8.82% — a real but modest cushion, not a deep discount — while the downside to the 12-month bear is a much larger 30.7% (36.4% to the structural-reset floor), an asymmetry this module states but does not weight or size. This does not read as a value trap in the classic sense (no misaligned controlling owner, and the segments individually outperform their own peer sets on margin), but the cheap-looking SOTP read is a real caution: Uber's own history shows the market has recently, and for cited fundamental reasons (decelerating growth, releveraging, a pending debt-funded acquisition), chosen not to pay the multiple it once did, so a bull case resting on a full reversion to the 5-year own-history median ($87.37) should be treated with real skepticism rather than assumed.

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Fairly valued | Revenue/Gross-Bookings growth reaccelerating toward the ~25% pace in `earnings/07`'s bull case, or the driver/courier payment ratio improving materially, without the multiple compressing — would push the base case toward the $87.37 own-history reversion figure; a materially lower price with fair value unchanged | Growth decelerating further alongside a worsening driver/courier payment ratio (`07`'s bear combination) plus the Delivery Hero bridge facility being drawn and raising net debt materially; a price rally with fair value unchanged | Post-close Delivery Hero balance-sheet and P&L detail; a segment-level consensus estimate (currently absent, forcing `06` to annualize a single half-year); a longer peer-multiple time series to judge whether today's premium/discount to peers is typical or unusual |

## 7. Note To The Final Synthesizer

- Bull/base/bear fair-value levels: $104.17 / $74.77 / $47.24 (12-month), plus a separately-labelled $43.38 structural-reset (AV-disruption) floor on a 24–36 month horizon. The dominant method behind the base case is peer-relative NTM EV/EBITDA (`03`, 38% weight), cross-checked within 1.2% by the scenario construction's own independently-derived EV/Sales-implied multiple.
- What the price implies: a 5.05% ten-year FCF CAGR, ~1.5 years of above-GDP growth, and a 10.78% steady-state EBIT margin — all below what Uber has already delivered (TTM EBIT margin 12.13%) or what `04`'s own base-case DCF assumes (6.54% FCFF CAGR). This reads as achievable, not aggressive.
- Margin of safety to base case: 8.82% (a thin cushion). Downside to the 12-month bear: 30.71%. Downside to the 24–36 month structural-reset floor: 36.37%. The downside anchor for kill-criteria purposes should be the bear-case value ($47.24) for the near-term and the structural-reset floor ($43.38) for the AV-disruption tail risk specifically.
- Genuine value or value-trap risk: not a classic value trap (no misaligned controlling owner per the management-governance module; both operating segments individually outperform their named peer sets on margin), but the SOTP's low reading is a real caution against assuming a full reversion to the 5-year own-history multiple — `02` itself documents cited fundamental reasons (decelerating growth, releveraging, a pending debt-funded acquisition) the market may not be mispricing.
- Method to trust / discount: trust the peer-relative EV/EBITDA read (`03`) most; discount the SOTP's absolute level (`06`) as a standalone fair-value signal (it is dominated by a single comp-choice and a large but real corporate-overhead deduction) while treating its underlying finding — Delivery is worth more per dollar of forward earnings than Mobility, on peer multiples — as informative context. `04`'s DCF is a useful cross-check but self-capped Low–Medium confidence due to a working-capital-driven method tension in its financeable-growth check.
- Partial-data caps: none applied. Price is pool-verified and fresh (~1 trading day old); no confidence cap from staleness, consensus, peer-data, method-count, cash-flow, SOTP-collapse, terminal-dominance, or ownership triggers. The 81.2% raw cross-method spread was judged reconciled (named drivers + policy-capped weighting), not left as an unexplained disagreement, and is instead reflected in a moderate (66) rather than high confidence score.
- Biggest missing data point (single highest-value next request): post-close Delivery Hero deal terms and the drawn amount of the €14.2bn bridge facility — none of the fair-value levels above reflect this pending, debt-funded acquisition, and it is the single largest unmodeled risk to every level in this report.
- **Explicit handoff:** the master synthesizer's "Valuation and Peer Mispricing" section should defer to this synthesis. The bull/base/bear fair-value levels above ($104.17 / $74.77 / $47.24, plus the $43.38 structural-reset floor) are the inputs for the master's own probability-weighted scenario model — this module assigns no probabilities and computes no expected return; that belongs to the master synthesizer.

## 8. Simple Summary

- Not clearly cheap or expensive: base fair value is $74.77 against a $68.18 price, a 9.7% gap — just inside "fairly valued."
- Bull $104.17 / Base $74.77 / Bear $47.24 (12-month), plus a $43.38 longer-horizon structural-reset floor if the autonomous-vehicle risk crystallizes.
- The market is pricing in modest growth: a 5.05% ten-year cash-flow growth rate, below what Uber has already delivered.
- Downside is bigger than the upside on a one-year view: 30.7% down to the bear case versus 8.82% of cushion to the base case.
- The peer-multiple method (EV/EBITDA against Lyft, DoorDash, DiDi, Grab) is the one to trust most here — it lines up almost exactly with an independent own-history-based check.
- Not a classic value trap — no controlling owner problem, and both segments individually beat their peer sets on margin — but the sum-of-the-parts read is a real caution against assuming the stock reverts fully to its old, richer multiple.
- A pool-verified current price was available ($68.18, 2026-08-06) — no missing-price gap this run.
- This module is directly useful to the master synthesizer: complete data, four independently-run methods, and an explicit reconciliation of the one method (SOTP) that disagrees most.
