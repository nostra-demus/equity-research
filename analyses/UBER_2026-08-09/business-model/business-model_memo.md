# Business Model Module Memo — UBER

**Date:** 2026-08-09

**Verdict: Average business — worth deeper work only if valuation is cheap** — capital-light and the only positive-margin name among its peers, but its return on capital has cleared its cost of capital for only one to two years and a $14.8bn debt-funded deal caps the governance score.

---

## Scores at a Glance

All scores are out of 100. One score is **inverted** (higher means worse) and is labelled.

| What is scored | Score | Source |
|---|---|---|
| Business clarity | 75 | `02_business-identity.md`, `03_segment-map.md` (offset by disclosure-quality 67 and a mid-stream segment-metric change) |
| Business quality | 46 | `07_business-quality.md` — mixed/average band, held down near 48 by the regulatory-dependence row |
| Moat | 60 | `09_moat.md` — Narrow moat, not Strong |
| External dependency risk **(inverted — higher is worse)** | 54 | `10_external-dependency.md` — "material exposure, mixed mitigation" |
| Capital allocation & governance | 50 | `11_capital-allocation-governance.md` — capped, see below |
| Data quality | 85 | `00_data-triage.md` — "Sufficient" |
| Overall usefulness | 62 | Synthesis §1 |

**Score caps applied (CLAUDE.md §24):**
- **Filter 4 — Serial acquirers: TRIPPED.** The pending $14.8bn Delivery Hero takeover, funded by a €14.2bn committed debt bridge (roughly 1.2x Uber's existing debt), caps **Capital allocation & governance at 50** and **Overall usefulness at 70**. Both applied.
- **Filter 5 — Fast-changing industry: TRIPPED** (`RF-BQ-005`, rate-of-change scored 32). Caps **Business quality at 65** — not binding, because the actual score (46) is already below it. Flags this as a sector / technology-cycle bet, not a durable compounder.
- **Filter 1 — Crooks / integrity: NOT tripped as a lock.** Two soft, unverified signals (the stopped Adjusted-EBITDA-to-GAAP reconciliation and an unadjudicated shareholder derivative suit) were routed to management-governance and cap conviction, not the verdict.
- **Capital-structure transaction cap: NOT applied on today's numbers.** Realized debt has barely moved ($12,302M Dec-2025 to $12,419M Mar-2026); the deal is not expected to close until H2 2027. Flagged as a near-term trigger: if the €14.2bn bridge is drawn, gross debt roughly doubles and this cap binds next run.

**No automatic disqualifier triggered** (0 of 8; 0 of 5 near-misses in band).

---

## What This Module Found

Uber runs a two-sided marketplace — an app that matches riders, eaters, and shippers with independent drivers, couriers, and carriers — and takes a fee (a "take rate," roughly 27% blended in FY2025) on each transaction without owning any vehicles [`02_business-identity.md`]. Mobility is the engine: 57.0% of FY2025 revenue and 69.1% of segment profit [`03_segment-map.md`].

The single most important positive is capital efficiency. Capex (spending on physical assets) runs about 0.6% of revenue — the strongest single quality factor at 85/100 — and Uber is the only one of its three named peers (Lyft, DiDi, Bolt) with a positive EBIT margin (operating profit as a share of sales), at 12.1% over the last twelve months versus Lyft -2.2% and DiDi -2.6% [`07_business-quality.md`; `09_moat.md`, §3]. Mobility's contribution margin on Gross Bookings — the profit left on each $1 booked — rose to 8.10 cents from 7.83 cents, FY24 to FY25 [`04_unit-economics.md`].

The single most important risk is durability. The moat's own economic test shows a 5-year average return on capital (ROIC — the profit earned on each dollar invested) of just +0.85% against an estimated ~9.7% cost of capital (what that money costs to raise); Uber has cleared that bar only in the last one to two years [`09_moat.md`, §3]. The company's own risk factors admit "well-established and low-cost alternatives... low barriers to entry, low switching costs" — riders and drivers switch platforms freely [`07_business-quality.md`, §1–2]. And driver reclassification as employees in a major market would, in Uber's own words, "fundamentally change" its business model, with no cost figure disclosed to size the shock [`06_value-chain.md`, §5]. This is an average business worth deeper work only if the price is cheap enough to pay for that risk.

---

## The Specialists, Briefly

- **data-triage:** Sufficient — FY25 10-K plus two FY26 10-Qs and two transcripts, all within 6 months; no investor deck, but not a blocker.
- **disqualifier-scan:** No disqualifier triggered (0 of 8); positive operating cash flow all four years ($642M to $10,099M, FY22–FY25).
- **business-identity:** Take-rate model (~27% blended) on $193.5bn FY25 Gross Bookings; a UK VAT reclassification cut reported Q2 FY26 revenue by $1.1bn even as bookings grew 24% — revenue is partly an accounting construct.
- **segment-map:** Mobility dominant (57.0% revenue / 69.1% segment profit); Freight is small and loss-making (-$33M FY25); segment-profit metric changed basis in Q1 FY26 (not directly comparable).
- **unit-economics:** Mobility creates value on the one disclosed proxy ($1 of Gross Bookings), 7.83%→8.10%; strict per-trip / per-driver economics are not disclosed and cannot be computed.
- **customer-geography:** No customer over 10% of revenue, but real geographic concentration — US&CAN (50.9%) + UK (20.4%) = 71.3% of FY25 revenue, none under long-term contract.
- **value-chain:** Mixed economic control; driver/courier reclassification is the single biggest bargaining risk; Freight is a squeezed pass-through (~-0.6% margin).
- **business-quality:** Aggregate 46/100; competitive intensity (28) and regulatory dependence (28) are the weakest; rate-of-change (32) trips Filter 5.
- **competitive-map:** Holding-to-gaining share vs. Lyft/DiDi/Bolt in the US; only peer with a positive EBIT margin (12.1%); consolidating a rival via the $14.8bn Delivery Hero deal.
- **moat:** Narrow moat, widening trajectory; 5-year average ROIC +0.85% vs. ~9.7% cost of capital, cleared only in the last 1–2 years.
- **external-dependency:** Partly externally driven; risk 54/100 (inverted); government/regulatory policy is the biggest lever (UK change cut one quarter's revenue by $1.1bn).
- **capital-allocation-governance:** Capital allocation concerns — capped at 50/100 (Filter 4); serial-acquirer pattern culminating in the debt-funded Delivery Hero takeover.
- **red-flags-sweep:** No new disqualifying flag, but a genuine accounting-quality pattern (`RF-RFS-001`) — a "non-recurring" legal/regulatory reserve excluded from Adjusted EBITDA at 17.3% (FY24) and 6.5% (FY25) of that metric for two straight years.

**Main disagreements the synthesis resolved (do not re-adjudicate):**
- Mobility FY2024 margin was cited as both 22.4% and 25.9%. The synthesis reconciled to **25.9%** (the recomputed $6,497M ÷ $25,087M); the 22.4% is an upstream transcription error and changes no verdict.
- Return on capital: vendor (CIQ) figure 9.4%/10.6% vs. own-calculated 14.7%. The synthesis keeps the **lower vendor figure** as primary, per the conservative default.

---

## What Would Change This Read

- **Upgrade toward "High-quality":** a Mobility-only unit-economics disclosure that proves payback (profit per rider/driver beats the cost to win them), and/or a full cycle — through a demand downturn — with return on capital sustained above the ~9.7% cost of capital.
- **Downgrade toward "Low-quality — avoid":** an adverse US driver-classification ruling (the US is 50.9% of FY2025 revenue), or the Delivery Hero deal drawing the full €14.2bn bridge while integration underperforms (this would also bind the capital-structure cap next run).

---

## Bottom Line

- **Verdict:** Average business — worth deeper work only if valuation is cheap. No disqualifier tripped; two rejector filters (serial acquirer, fast-changing industry) did.
- **Could be better than it looks:** capital-light model (capex ~0.6% of revenue), the only positive-EBIT-margin peer (12.1% LTM), and a Mobility contribution margin that is positive and rising (7.83%→8.10%).
- **Could be worse than it looks:** the margin-improvement story leans on an Adjusted EBITDA that excluded a recurring "non-recurring" cost line for two straight years, and whose full GAAP reconciliation Uber stopped publishing in Q1 FY2026.
- **What is missing:** a Mobility-only trip count (or driver-incentive spend per active driver) to test unit economics at the strict cost-to-win-versus-lifetime-value level, instead of the $1-of-Gross-Bookings proxy.
- **Watch next:** the pending $14.8bn Delivery Hero takeover and its €14.2bn debt bridge — if drawn, gross debt roughly doubles and the capital-structure cap binds; US driver-classification is the killer risk.

---

## Plain-English Glossary

- **Take rate:** the cut Uber keeps of each ride or delivery booked through the app (~27% blended, FY2025).
- **Gross Bookings:** the total dollar value of all rides and deliveries booked ($193.5bn, FY2025), before Uber's cut.
- **Contribution margin:** the profit left over on each $1 of bookings after the direct costs of serving it (8.10 cents on Mobility, FY2025).
- **Capex:** money spent on physical assets like equipment; ~0.6% of revenue here.
- **EBIT margin:** operating profit as a share of sales (12.1% over the last twelve months).
- **Adjusted EBITDA:** a company-defined profit measure that strips out certain costs; here it excluded a recurring "non-recurring" cost line for two years.
- **Return on capital (ROIC):** the profit earned on each dollar invested in the business (+0.85% five-year average).
- **Cost of capital:** what the money used to run the business costs to raise (estimated ~9.7%); a business only creates value when ROIC beats it.
- **Debt bridge:** short-term committed borrowing lined up to fund a deal (€14.2bn here); "drawing" it means actually borrowing the money.
