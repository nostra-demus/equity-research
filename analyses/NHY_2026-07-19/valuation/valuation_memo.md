# Valuation Module Memo — NHY

**Verdict: Fairly valued** — the base-case fair value (NOK 81.83) sits 3.7% below the current price (NOK 84.96), inside the ±10% "fairly valued" band, with no cushion and real downside skew.

Memo date: 2026-07-19.

---

## Scores at a Glance

Every score below is carried verbatim from the module synthesis (§1). "/100" throughout. Note the inverted scores, where higher means worse.

| Score | Value /100 | Note |
|---|---|---|
| Valuation attractiveness *(higher = cheaper)* | **38** | Price sits slightly above fair value (−3.7% implied upside). Capped at max 60 by the unaligned-owner flag, but the actual read is well under that ceiling. |
| Margin of safety *(higher = better)* | **30** | Cushion is negative (−3.83%): price is above, not below, base fair value. |
| Valuation confidence | **56** | Capped at max 60 by terminal-value dominance (the far-future value is 78.1% of the DCF total). |
| Downside risk *(inverted — higher = WORSE)* | **68** | Price is 46.9% above the bear-case value — a large, real drop if that case plays out. |
| Data quality | **75** | Full data pool (price, consensus, peers, segments, cash flow all present and dated), tempered by a vendor data error every specialist had to catch and correct. |
| Overall usefulness | **79** | |

**Score caps applied (synthesis §4):**
- **Terminal-value dominance cap** — max 60 on valuation confidence. The DCF's far-future ("terminal") value is 78.1% of the whole DCF, above the 75% trigger. This is the binding cap; final confidence of 56 sits under it.
- **Misaligned controlling-owner cap (RF-OWN-004, §24 Filter 6)** — max 60 on valuation attractiveness, plus a mandatory value-trap flag and a verdict ceiling. The Norwegian State's 34.49% stake is held for industrial-policy reasons, not per-share value; the Board declined to adopt takeover-bid-handling principles because of it. The actual attractiveness read (38) is already under this ceiling.

**§24 Avoid-Big-Risks filters tripped:** Filter 6 (unaligned owner) — tripped, as above. No other caps bind.

---

## What This Module Found

Norsk Hydro is fairly valued, not cheap. The base-case fair value of NOK 81.83 per share is 3.7% below the NOK 84.96 price (2026-07-17, pool-verified), so there is no margin of safety — the safety cushion is negative at −3.83% (price sits above fair value, not below it) [`07` §2].

The most important driver is sum-of-the-parts — valuing each business segment separately and adding them up. It carries the most weight (40%) because it is built entirely on Hydro's own audited segment earnings and its total enterprise value (the whole business, debt plus equity) ties within 0.3% of the group figure — the least forecasting guesswork of any method here [`06` §4]. It lands essentially at today's price (−0.4%), meaning the market is not obviously mispricing a hidden segment.

The single most important risk is a structural, not merely cyclical, erosion of Hydro's cost advantage. Its Extrusions unit's operating (EBIT) margin fell from about 4% (2020–2023) to −2.2% in 2025, with five European plants proposed for closure, and the business-model module calls a mid-cost-curve upstream competitor arriving within a few years "a live possibility, not a tail risk" [`07` structural down-leg]. That case drives the bear value of NOK 45.12 — 46.9% below today's price.

The setup is asymmetric: 26.8% upside to the bull case (NOK 107.70, which needs today's Middle East supply-shock margin and multiple to both persist) against 46.9% downside to the bear case. What the price bakes in is that Hydro's FY2025 actual profit margin (13.9% of sales as Adjusted EBITDA) holds roughly flat rather than fading to the DCF's 13.0% mid-cycle anchor — a "Stretch, tilting aggressive" ask that two earnings modules independently call non-durable [`05` §5].

---

## The Specialists, Briefly

- **Data triage:** Sufficient — all five valuation methods can run; only a minor gap (no discrete dilution schedule) [`00`].
- **Price & capital structure:** Price pool-verified at NOK 84.96 (2026-07-17); enterprise value NOK 192,384mm, net debt (total debt minus usable cash) NOK 17,919mm after stripping out NOK 4,829mm of cash the company itself says cannot service debt [`01`].
- **Own-history multiples:** Illustrative only (13-month history, short of the 3-year bar) and zero-weighted; the apparent "re-rating" is a mechanical artifact of a depressed Q4 2025 earnings trough, not a real business re-rating [`02`].
- **Relative valuation (peers):** NOK 93.70 base (+10.2% vs price); the raw vendor screen's ~49%–52% discount is a data-reclassification error specific to Hydro's accounting format — restated on audited figures, those multiples flip to a premium [`03`].
- **Intrinsic DCF (discounted future cash flows):** NOK 70.14 base (−17.4% vs price); terminal value is 78.1% of the total, so it is terminal-dominated and low-confidence by the module's own rule; its structural-runoff case produces the NOK 45.12 bear [`04`].
- **Reverse-DCF (what the price already assumes):** Price implies the FY2025 margin (13.9%) holding, not growth (implied 5-year free-cash-flow growth of −3.21%) — a Stretch, not a Yes [`05`].
- **Sum-of-the-parts:** NOK 84.63 base (−0.4% vs price); Aluminium Metal carries 58.7% of enterprise value on just 7.1% of revenue; ties to group EV within 0.3% [`06`].
- **Scenario & fair value:** Weighted base NOK 81.83; Bull NOK 107.70 / Bear NOK 45.12; margin of safety −3.83%, downside to bear 46.89% [`07`].

**Main disagreement (§3):** The three weighted methods span 33.6% — DCF NOK 70.14 (low) to peer relative NOK 93.70 (high), with SOTP NOK 84.63 between. This is under the 40% "must-lead-with-it" threshold, so no extra confidence cap, but it is the central question. The synthesis resolves it by trusting SOTP most (audited segment data, tightest tie to group EV), the DCF second (the mandated method for this commodity/cyclical business, but terminal-heavy), and the peer method least (it stacks a discretionary FX rate and a discretionary 10% quality discount on an imperfect peer set).

---

## What Would Change This Read

From the synthesis's own trigger table (§6):

- **Would make it cheaper (open a real margin of safety):** the profit margin confirmed fading toward the 13.0% mid-cycle anchor (or the 11.5% FY2023 trough) while the price does not correct in advance; or evidence the Extrusions restructuring (five plant closures) is delivering ahead of plan.
- **Would make it more expensive:** confirmation that the Middle East supply-shock aluminium premium persists structurally (e.g. a durable Strait of Hormuz-related curtailment), validating the price-implied 13.9%–14.0% margin; or a formal Board statement on takeover-bid-handling principles, or evidence the Norwegian State supports value-accretive action, which would remove the unaligned-owner cap.
- **Data that would settle it:** Q2 2026 results (due 2026-07-22, three days after this run) — the first read on whether the Q1 2026 margin spike is fading or persisting; a 3-year own-history multiple series; a disclosed dilution schedule.

---

## Bottom Line

- **Verdict: Fairly valued.** Base fair value NOK 81.83 is 3.7% below the NOK 84.96 price — no margin of safety (cushion −3.83%).
- **Could be better than it looks:** on clean, restated multiples, NHY trades an 18%–35% discount to peers despite lower debt, implying a NOK 93.70 peer-based value (+10.2%) even after a conservative 10% quality discount [`03` §3–§5].
- **Could be worse than it looks:** the bear case is structural, not cyclical — confirmed moat erosion (Extrusions margin −2.2% in 2025, five plants slated to close) puts fair value 46.9% below today's price.
- **Missing evidence:** Q2 2026 results (due 2026-07-22) — the first hard read on whether the elevated Q1 margin this whole valuation pivots on is fading or holding. This is the single highest-value next data request.
- **One thing to watch next:** that Q2 margin print. And note the value-trap risk — the Norwegian State's 34.5% stake is held for industrial-policy, not per-share-value, reasons, so any apparent discount may never close.

---

## Plain-English Glossary

- **Fair value:** an estimate of what a share is really worth, against which the market price is judged.
- **Margin of safety:** how far below fair value the price sits — the cushion protecting a buyer if the estimate is wrong. Here it is negative.
- **Enterprise value (EV):** the value of the whole business — equity plus debt, minus usable cash.
- **Net debt:** total debt minus cash that can actually service it.
- **Adjusted EBITDA / margin:** a rough profit measure before interest, tax, depreciation and one-offs; the margin is that profit as a share of sales.
- **EBIT margin:** operating profit (before interest and tax) as a share of sales.
- **DCF (discounted cash flow):** valuing a business by its future cash, discounted back to today.
- **Terminal value:** the slice of a DCF that comes from all years beyond the explicit forecast — here 78.1% of the total, which is why confidence is capped.
- **Reverse-DCF:** working backwards from the price to see what growth or margin the market is already assuming.
- **Sum-of-the-parts (SOTP):** valuing each business segment separately and adding them up.
- **Multiples (EV/EBITDA, P/E, EV/Sales):** price expressed as a ratio to a profit or sales figure, used to compare against peers or history.
- **Re-rating:** the market paying a higher multiple for the same earnings.
- **Free-cash-flow (FCF) growth (CAGR):** the yearly growth rate of the cash the business throws off after spending.
- **Value trap:** a stock that looks cheap but stays cheap because something structural stops the gap from closing.
