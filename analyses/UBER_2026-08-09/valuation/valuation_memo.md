# Valuation Module Memo — UBER

**Verdict: Fairly valued** — base-case fair value is $74.77 versus a $68.18 price, a 9.7% gap that sits just inside the ±10% "fairly valued" band, not a clear bargain.

Memo date: 2026-08-09.

---

## Scores at a Glance

All scores are out of 100. Source: `99_valuation-synthesis.md` §1.

| Score | Value | Note |
|---|---|---|
| Valuation attractiveness *(higher = cheaper)* | 54 | Real but thin upside (+9.7% to base); not a deep discount |
| Margin of safety *(higher = better)* | 38 | 8.82% cushion to base fair value — a modest buffer, not a real margin of safety (the extra cushion below fair value that protects you if you are wrong) |
| Valuation confidence | 66 | Three forward methods cluster within a 15.4% band; the outlier method is explained, not a live disagreement |
| Downside risk *(inverted — higher = worse)* | 58 | 30.7% down to the 12-month bear, 36.4% to the structural-reset floor |
| Data quality | 87 | Full financials, consensus, peers, segments present; only minor gaps |
| Overall usefulness | 83 | Complete data, four methods, explicit reconciliation |

**Fair-value levels:** Bull $104.17 / Base $74.77 / Bear $47.24 (12-month), plus a separate $43.38 structural-reset floor (24–36 months) if autonomous-vehicle disruption hits.

**Score caps applied:** none. The synthesis walked through every possible cap trigger (§4) and none binds this run — price is pool-verified, consensus and peer data are present, four methods ran, and terminal value is below the danger threshold.

**§24 Avoid-Big-Risks filters tripped:** none. Filter 6 (misaligned controlling owner) was tested and did not trip — the governance module found no controlling shareholder (largest holders PIF 3.578% and BlackRock 7.417%, both minority).

---

## What This Module Found

Uber trades close to fair value. Base fair value of $74.77 is only 9.7% above the $68.18 close (2026-08-06, pool-verified), landing inside the "fairly valued" band rather than showing a real mispricing.

The single most important driver is the peer-relative EV/EBITDA read (enterprise value — the whole company's price including debt — divided by cash operating profit). It carries 38% of the base-case weight and points to $75.75/share. Its credibility comes from an independent cross-check: the scenario construction's own implied multiple (13.04x) lands within 1.2% of the peer read's 13.2x from a completely different starting point — the strongest piece of triangulation in the report [§1A, §3].

What the market is pricing in is conservative, not aggressive: just a 5.05% ten-year free-cash-flow growth rate (the cash left after running and investing in the business) and a 10.78% steady-state profit margin that Uber's trailing 12 months (12.13%) has already beaten [§5].

The single most important risk is on the downside and asymmetric. The margin of safety to the base case is a thin 8.82%, while the drop to the 12-month bear case is a much larger 30.7% (36.4% to the structural-reset floor) [§1, §5]. The biggest specific risk is the pending, debt-funded Delivery Hero acquisition (~$14.8bn, partly funded by a new €14.2bn bridge facility — a short-term loan). None of the fair-value levels above reflect it, and it could raise net debt (total debt minus cash) materially once it closes [§1].

---

## The Specialists, Briefly

- **valuation-data-triage** → Data sufficient; every method can run, no partial-data caps.
- **price-and-capital-structure** → Price $68.18 (2026-08-06); enterprise value $149,684.7M; net debt $9,340M (strict basis — total debt minus cash). A $3,773M Delivery Hero equity stake sits outside the standard EV bridge.
- **multiples-own-history** → Uber's own EV/Sales history implies $87.37/share (+28.1%); other multiples excluded as distorted. The recent de-rating (paying a lower multiple) has real causes, not just sentiment.
- **relative-valuation-peers** → Quality- and growth-adjusted peer EV/EBITDA implies $75.75/share (+11.1%); the discount to peers is mostly explained by slower growth, not worse quality.
- **intrinsic-dcf** → Base-case DCF value $79.82/share (+17.1%), self-capped Low–Medium confidence.
- **reverse-dcf** → Price implies a 5.05% 10-year cash-flow growth rate — conservative versus history.
- **sum-of-the-parts** → Base SOTP $48.22/share (−29.3% vs. price); dragged by one comp choice and a real $52.3bn corporate-overhead deduction.
- **scenario-and-fair-value** → Bull $104.17 / Base $74.77 / Bear $47.24, floor $43.38; the cross-method spread is reconciled, not averaged.

**Most important disagreement:** the sum-of-the-parts method reads $48.22, 35.5% below the $74.77 base. The synthesis resolved this (§3): 74.2% of the SOTP's swing comes from a single Mobility comparable choice (Lyft at 7.94x vs. DiDi at 16.58x), and the rest from a real, filed $52.3bn corporate-overhead cost. Because the SOTP is capped at 18% weight, its low reading pulls the published base only 1.3% below the peer read. The synthesis carried this as a caution, not a verdict change — I do not re-adjudicate it.

---

## What Would Change This Read

From §6:

- **Cheaper (toward the $87.37 own-history figure):** revenue/gross-bookings growth reaccelerating toward the ~25% bull pace, or the driver/courier payment ratio improving materially, without the multiple compressing; or a materially lower price with fair value unchanged.
- **More expensive:** growth decelerating further alongside a worsening driver/courier payment ratio, plus the Delivery Hero bridge facility being drawn and raising net debt materially; or a price rally with fair value unchanged.
- **Data that would sharpen the call:** post-close Delivery Hero balance-sheet and P&L detail; a segment-level consensus estimate (currently absent); a longer peer-multiple time series to judge whether today's discount to peers is normal.

---

## Bottom Line

- **Verdict: Fairly valued** — $74.77 base against $68.18, a 9.7% gap inside the fairly-valued band.
- **Why it could be better than it looks:** two independent warranted-multiple reads (peer 13.2x and own-model 13.04x) agree within 1.2%, and the price only demands a conservative 5.05% cash-flow growth rate Uber has already beaten.
- **Why it could be worse:** the risk/reward is downside-skewed — 8.82% cushion up to base versus 30.7% down to the bear (36.4% to the AV-disruption floor).
- **What is missing:** post-close Delivery Hero deal terms and the drawn amount of the €14.2bn bridge facility — the single largest unmodeled risk; none of the fair-value levels reflect the deal.
- **The one thing to watch next:** the Delivery Hero close and how much of the bridge facility is drawn, since it could raise net debt materially.

---

## Plain-English Glossary

- **Fair value** — an estimate of what a share is actually worth, versus what it currently trades at.
- **EV/EBITDA (enterprise value / cash operating profit)** — the whole company's price, including debt, measured against the cash profit it earns before interest, tax, and non-cash charges.
- **Margin of safety** — the extra cushion below fair value that protects you if your estimate is wrong.
- **Free cash flow (FCF)** — the cash a business has left after running itself and investing to grow.
- **Net debt (strict basis)** — total borrowings minus cash on hand.
- **Enterprise value / EV bridge** — the full takeover cost of a company: market value of shares plus debt, minus cash.
- **DCF (discounted cash flow)** — a valuation that sums a company's expected future cash, adjusted for the fact that money later is worth less than money now.
- **Reverse-DCF ("what's priced in")** — running a DCF backwards to see what growth rate today's price already assumes.
- **De-rating** — when the market decides to pay a lower multiple for the same earnings.
- **Sum-of-the-parts (SOTP)** — valuing each business segment separately, then adding them up.
- **Terminal value** — the estimated value of all cash flows beyond the explicit forecast years in a DCF.
- **Bridge facility** — a short-term loan used to fund a deal until permanent financing is arranged.
