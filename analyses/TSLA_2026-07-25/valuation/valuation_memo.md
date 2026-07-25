# Valuation Module Memo — TSLA

**Verdict: Materially overvalued** — the triangulated base-case fair value of about $32 a share sits roughly 90% below the $319.69 price, and no economically-grounded method finds any discount.

Memo date: 2026-07-25

## Scores at a Glance

Every score below is carried verbatim from the module synthesis (§1). Each is out of 100.

| Score | Value | Notes |
|---|---|---|
| Valuation attractiveness *(higher = cheaper)* | **5** | Price sits far above every triangulated method; no discount to fair value on any grounded basis |
| Margin of safety *(higher = better)* | **2** | Margin of safety is −887.7% — how far price sits above fair value; a large embedded premium, not a cushion |
| Valuation confidence | **58** | Capped at 60 by the terminal-value trigger (see caps below); set just under the cap |
| Downside risk *(inverted — higher = worse)* | **96** | Loss to the bear case is 97.9% of today's price |
| Data quality | **90** | Sufficiency verdict "Sufficient"; price, estimates, peers, capital structure, and cash flow all present and 0–1 month current |
| Overall usefulness | **88** | Rich data pool, minimal caps, multiple methods converge |

**Score caps applied:** one binds — terminal value (the value assumed after the explicit forecast years) is 125.2% of enterprise value (the whole company's value to all investors) in the DCF, above the 75%-of-EV trigger. This caps valuation confidence at 60 (final score 58). No price cap applies — the price is verified against the data pool and fresh.

**§24 Avoid-Big-Risks filters:** the misaligned controlling owner filter (Filter 6) was tested by the management-governance module and did **not** trip (Tesla is not government-controlled, not a listed subsidiary, not an unrelated conglomerate). This finding rests on fundamentals, not an ownership-structure discount.

## What This Module Found

Tesla trades at $319.69 (2026-07-23, last close, pool-verified, one day old). Against that, the triangulated base-case fair value is $32.37 a share — about 90% below the current price [scenario-and-fair-value, `07`].

The two methods the module trusts most independently converge near $40–41 a share despite being built differently: peer relative valuation (comparing Tesla to named rivals like Ford, GM, and Fluence Energy for the storage business) lands at $40.19 [`03`], and segment sum-of-the-parts (valuing each business line separately) lands at $41.09 [`06`]. They agree within 2% of each other — the strongest corroborating signal in the module.

The single most important driver is what the current price requires to be true. The reverse-DCF (working backwards from the price to the growth it assumes) finds the price implies a 68.9% compound annual free-cash-flow growth rate — the yearly growth in cash the business throws off after spending — sustained for seven straight years [`05`]. A market-ceiling check shows this would require Tesla to capture 75–100%+ of the entire global auto industry by FY2032, a share no automaker has ever held. Tesla's own best-ever run was 51–71% for at most two years, off a depressed pandemic base, followed by deceleration every year since — including an outright revenue decline in FY2025.

The single most important risk is that the premium rests on unmonetized robotaxi/Optimus/FSD optionality (autonomy ambitions that carry zero disclosed segment or revenue-line economics) — and that same autonomy narrative is the subject of an unresolved federal securities-fraud class action naming the CEO personally (RF-MGT-005, from the management-governance module), sitting directly under the bull case's central assumption.

## The Specialists, Briefly

- **valuation-data-triage** → Sufficient: all core valuation inputs present and current, no caps bind; the pool is unusually rich.
- **price-and-capital-structure** → Price $319.69, pool-verified, fresh; enterprise value $1,235,847.8mm. The fully diluted share count (~4,252.5mm) is an approximation — no options/RSU strike schedule was in the pool, so it is flagged as inference.
- **multiples-own-history** → Tesla sits at or above its own 5-year ceiling on earnings-based multiples, but mostly because the earnings denominator collapsed (EBIT margin — operating profit as a share of sales — fell 16.8%→4.1%; EPS $4.30→$1.08), not because the market pays more for a stable dollar of earnings.
- **relative-valuation-peers** → Trades at a ~800–2,300% premium to the core peer median across every multiple; quality-adjusted implied value ~$40.19/share.
- **intrinsic-dcf** → Base-case value $8.02/share; terminal value is 125.2% of enterprise value. The explicit 7-year forecast has a *negative* present value because guided capex (>$25bn floor, growing 2–3 years) swamps profitability — the entire positive value comes from the terminal assumption.
- **reverse-dcf** → Price implies a 68.9% 7-year free-cash-flow growth rate; a sanity check shows that means capturing most of the global auto industry by FY2032.
- **sum-of-the-parts** → Base-case $41.09/share; ~90% of Tesla's enterprise value is not explained by the Automotive or Energy segment as filed.
- **scenario-and-fair-value** → Base fair value ~$32.37; bull $336.08 / bear (headline) $6.86. Even the richest method sits far below the current price.

**Biggest disagreement and how it was resolved:** the methods span roughly 35x, from $8.02 (intrinsic DCF) to $286.5 (own-history multiples). This was reconciled, not averaged. The synthesis excluded own-history multiples from the base blend (0% weight) as a circular anchor — "TSLA is worth what TSLA has always traded for," a band never validated against economics — and repurposed it as the bull-case input. Peers (45%) and SOTP (30%) carry most of the base weight; the DCF is capped at 25% because its own terminal value dominates. The residual gap between the DCF ($8.02) and peers/SOTP (~$40) is disclosed as the DCF's terminal-method sensitivity, not left standing.

## What Would Change This Read

**Would make it cheaper (toward the $32–41 base):**
- A disclosed robotaxi/Optimus/FSD revenue line with a credible near-term path to profit, closing the gap between the ~1.4x segment multiple and the ~11x consolidated multiple.
- A sustained return on capital (profit earned per dollar invested) rising above the ~12.4% cost of capital (what that money costs to raise), reversing the "eroding" trajectory the moat module found.
- A large price decline toward the triangulated base without matching fundamental deterioration.

**Would make it more expensive:**
- A durable re-rating on genuine margin recovery toward the FY2021–2022 range (12.1%–16.8% EBIT margin) *delivered*, not guided.
- Resolution of the securities-fraud class action in Tesla's favor, removing the overhang on the autonomy narrative.
- Disclosed segment economics for robotaxi/Optimus that justify a materially higher multiple than Ford/GM/Fluence-analog comparables.

**Data needed:** a standalone segment or revenue disclosure for robotaxi/Optimus/FSD/AI-compute; the options/RSU strike schedule (to firm up the fully diluted share count); the current bylaws exhibit.

## Bottom Line

- **Verdict:** Materially overvalued — base-case fair value ~$32.37 vs $319.69 price, roughly 90% below.
- **Why it could be better than it looks:** if the market keeps extending the same optionality credit (Tesla's own 5-year median EV/Sales of 11.50x has persisted through cycles), the bull case reaches $336.08 — essentially flat to today. The moat's Technology/IP scores 50/100, so the tech asset is unmonetized, not fiction.
- **Why it could be worse:** the bear case is a structural reset to $6.86/share — a 97.9% loss — triggered by the confirmed eroding return-on-capital trajectory and continued failure of autonomy to convert into disclosed revenue.
- **What evidence is missing:** the fully diluted share count (~4,252.5mm) is an approximation pending an options/RSU strike schedule — the single highest-value next request, since it affects every per-share number here. Price is not a gap.
- **What to watch next:** any disclosed robotaxi/Optimus/FSD revenue line, and the pending motion to dismiss on the securities-fraud class action that sits under the entire bull case.

## Plain-English Glossary

- **Fair value:** the module's estimate of what a share is worth, versus what it trades for.
- **Margin of safety:** the gap between fair value and price; negative here means price is above fair value (a premium), not below it (a cushion).
- **Enterprise value (EV):** the value of the whole company to all its investors — equity plus debt, less cash.
- **Terminal value:** in a DCF, the value assigned to all years beyond the explicit forecast; when it dominates, the valuation leans heavily on distant assumptions.
- **Free-cash-flow growth rate:** the yearly growth in the cash the business generates after spending on operations and equipment.
- **Reverse-DCF:** working backwards from the current price to the growth rate the price assumes.
- **EBIT margin:** operating profit as a share of sales.
- **Return on capital / cost of capital:** the profit earned per dollar invested, versus what that money costs to raise; below-cost returns destroy value.
- **Sum-of-the-parts (SOTP):** valuing each business line separately, then adding them.
- **Peer relative valuation:** pricing a company off the multiples that comparable named rivals trade at.
