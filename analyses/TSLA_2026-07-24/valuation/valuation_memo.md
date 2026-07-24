# Valuation Module Memo — TSLA

**Verdict: Materially overvalued** — the fair value we can support (~$32 a share) sits about 90% below the $319.69 market price, and the price only works if Tesla grows cash flow faster than any automaker ever has.

Memo date: 2026-07-25. Source: `99_valuation-synthesis.md` (module synthesis, already adjudicated).

---

## Scores at a Glance

Every score is out of 100 and carried verbatim from the synthesis. "Inverted" means a higher number is worse.

| Score | Value | Direction | Source |
|---|---|---|---|
| Valuation attractiveness (higher = cheaper) | **5** | higher is better | `99` §1 |
| Margin of safety (the cushion between price and fair value) | **2** | higher is better | `99` §1 |
| Valuation confidence | **58** | higher is better | `99` §1 |
| Downside risk | **96** | **inverted** — higher is worse | `99` §1 |
| Data quality | **90** | higher is better | `99` §1 |
| Overall usefulness | **88** | higher is better | `99` §1 |

**Score caps applied:** one binds — terminal value (the value assumed to sit beyond the explicit forecast, here 125.2% of enterprise value) tripped the ">75% of EV" trigger in the DCF, capping valuation confidence at 60 (final 58) [`99` §4]. No price cap (price is pool-verified and 1 day old). No consensus, peer, single-method, or SOTP caps.

**§24 Avoid-Big-Risks filters:** the misaligned-owner filter (Filter 6, RF-OWN-004) was tested and **did not trip** — Tesla is not government-controlled, not a listed subsidiary, not an unrelated conglomerate [`99` §4]. So this read rests on fundamentals, not an ownership discount. No other §24 filter is carried in this module.

---

## What This Module Found

Tesla is expensive, not cheap. Three methods built in different ways all land far below the market price: peer comparison (~$40 a share), segment sum-of-the-parts (~$41), and a cash-flow (DCF) model ($8.02). Blended, the base-case fair value is about $32.37 — roughly 90% below the $319.69 close (2026-07-23, pool-verified) [`99` §1, §5].

The single most important driver: the market price only makes sense if Tesla grows its free cash flow (the spare cash the business throws off) by 68.9% a year, every year, for seven years. A reverse-DCF (working backwards from the price to the growth it assumes) shows that would mean Tesla capturing 75–100%+ of the entire global auto industry by FY2032 — a share no carmaker has ever held. Tesla's own best-ever pace was 51–71% for at most two years, and then growth slowed every year since, ending in an outright revenue decline in FY2025 [`99` §1A, `05`].

The single most important risk: the premium rests entirely on autonomy hopes — robotaxi, Optimus, and FSD — that carry zero disclosed revenue in the filings. That same autonomy story is the subject of an unresolved federal securities-fraud class action naming the CEO personally (RF-MGT-005, from the management-governance module), sitting directly under the bull case's central assumption [`99` §1, §1A].

There is no margin of safety: it is −887.7% (a large embedded premium, not a cushion). The loss to the bear case is 97.9% [`99` §1, §5]. These are two distinct severe reads, not one number.

---

## The Specialists, Briefly

- **Data triage:** Sufficient — price, consensus, peers, capital structure, and cash flow are all present and 0–1 month current; no caps bind [`00`].
- **Price and capital structure:** Price $319.69, pool-verified, fresh; enterprise value ~$1,235,848mm. The fully-diluted share count (~4,252.5mm) is an approximation — no options/RSU strike schedule in the pool, flagged as inference [`01`].
- **Multiples vs own history:** Sits at or above its own 5-year ceiling on earnings-based multiples, but that is mostly because earnings collapsed (EBIT margin 16.8%→4.1%, EPS $4.30→$1.08), not because buyers pay more for a stable dollar of profit [`02`].
- **Relative valuation (peers):** Trades ~800–2,300% above the peer median on every multiple; quality-adjusted implied value ~$40.19 a share [`03`].
- **Intrinsic DCF:** Base value $8.02 a share; the entire positive value comes from the terminal (125.2% of EV) because the guided multi-year capex build makes the explicit 7-year forecast cash-negative in present value [`04`].
- **Reverse DCF:** The price implies a 68.9% seven-year free-cash-flow growth rate — capturing most of the global auto industry [`05`].
- **Sum-of-the-parts:** Base value $41.09 a share; ~90% of Tesla's enterprise value is not explained by the Automotive or Energy segment as filed [`06`].
- **Scenario and fair value:** Base ~$32.37; bull $336.08 / bear $6.86. Every method sits far below the current price [`07`].

**Most important disagreement:** the methods span roughly 35x, from $8.02 (DCF) to $286.5 (own-history multiples). The synthesis reconciles this rather than averaging it — it excludes own-history multiples from the base (using Tesla's own past multiple would be circular, "TSLA is worth what TSLA always traded for") and repurposes it as the bull case. Peers ($40.19) and SOTP ($41.09) converge within 2% and carry most of the base weight; the DCF is capped at 25% weight because its value is terminal-dominated [`99` §3].

---

## What Would Change This Read

| Would make it cheaper (less overvalued) | Would make it more expensive (justify a higher price) |
|---|---|
| A disclosed robotaxi/Optimus/FSD revenue line with a credible near-term path to profit | A durable re-rating on genuine margin recovery toward FY2021–2022 (12.1%–16.8% EBIT margin) actually **delivered**, not guided |
| Return on capital rising above the ~12.4% cost of capital (reversing the "eroding" trajectory the moat module found) | Resolution of the securities-fraud class action in Tesla's favor, removing the overhang on the autonomy story |
| A large price decline toward the $32–41 triangulated base without matching fundamental deterioration | Disclosed segment economics for robotaxi/Optimus that justify a multiple well above Ford/GM/Fluence-analog peers |

Data needed: a standalone segment/revenue disclosure for robotaxi/Optimus/FSD/AI-compute; the options/RSU strike schedule (to firm up the share count); the current bylaws exhibit [`99` §6].

---

## Bottom Line

- **Verdict:** materially overvalued — base-case fair value ~$32 a share vs a $319.69 price, about 90% lower [`99` §1].
- **Biggest reason it could be better than it looks:** if the market keeps extending the same autonomy credit, the bull case reaches $336.08 (roughly flat to today), and the underlying technology asset is not fiction — the moat module scores Technology/IP 50/100, the one non-weak component [`99` §1A].
- **Biggest reason it could be worse:** continued failure of robotaxi/FSD/Optimus to turn into disclosed revenue, plus a confirmed eroding return on capital, triggers the $6.86 structural-reset bear — a 97.9% loss [`99` §1A, §5].
- **What evidence is missing:** the fully-diluted share count is an approximation (~4,252.5mm) pending an options/RSU strike schedule — it affects every per-share number here [`99` §7].
- **One thing to watch next:** whether the securities-fraud class action (RF-MGT-005) survives its pending motion to dismiss — it sits on the exact autonomy claims the entire bull case depends on [`99` §1A].

---

## Plain-English Glossary

Terms used in this memo, in order of first appearance:

- **Fair value:** what the business is worth per share on the evidence, versus what the market charges.
- **Free cash flow:** the spare cash the business generates after running and investing in itself.
- **Reverse-DCF:** working backwards from the share price to the growth rate the price silently assumes.
- **Margin of safety:** the cushion (or, here, the gap) between the price you pay and fair value; negative means you are paying a premium, not getting a discount.
- **Enterprise value (EV):** the whole-company price tag — equity plus debt, less cash.
- **DCF (discounted cash flow):** valuing a business by its future cash, pulled back to today's money.
- **Terminal value:** the slice of a DCF that sits beyond the explicit forecast years; when it is most of the value, the model is fragile.
- **EBIT margin:** operating profit as a share of sales.
- **Return on capital / cost of capital:** the profit earned on each dollar invested, versus what that money costs to raise; earning less than it costs destroys value.
- **Sum-of-the-parts (SOTP):** valuing each business segment separately, then adding them up.
