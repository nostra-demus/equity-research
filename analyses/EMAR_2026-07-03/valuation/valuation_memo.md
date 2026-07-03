# Valuation Module Memo — EMAR

**Verdict:** Materially undervalued — base-case fair value AED 27.7 vs pool-verified price AED 12.20 (56% discount of price to fair value), but a value-trap flag applies because the controlling owner (Dubai Holding, 29.73%) may not act to close the gap.

**Memo date:** 2026-07-03

---

## Scores at a Glance

| Score | Value /100 | Notes |
|---|---|---|
| Valuation attractiveness (higher = cheaper) | **60 (capped)** | Raw read 72; RF-OWN-004 (government-owner) cap max 60 applied |
| Margin of safety (higher = better) | 75 | Base fair value AED 27.7 vs price AED 12.20 = 56% discount |
| Valuation confidence | **55 (capped)** | Max-55 cap: methods disagree 102% across base points (rule: >40% unreconciled gap) |
| Downside risk (**inverted** — higher = worse) | 0 | Bear-case fair value AED 20.0 is 64% above the price; no loss to bear |
| Data quality | 82 | Pool-verified price, full Capital IQ exports, FY2025 preliminary + Q1-2026 interim; FY2025 audited statutory not yet in pool |
| Overall usefulness | 78 | All five methods ran; owner cap limits actionability |

**Score caps applied:**
- Valuation confidence capped at 55 — cross-method base-point spread of 102% (AED 19.08 to AED 38.47) exceeds the 40% flag.
- Valuation attractiveness capped at 60 — RF-OWN-004, misaligned controlling owner (CLAUDE.md §24 Filter 6); value-trap flag mandatory.

**§24 Avoid-Big-Risks filters tripped:** Filter 6 — Unaligned owners (Dubai Holding 29.73%, no stated intent to maximize per-share value).

---

## What This Module Found

Emaar trades at AED 12.20 against a base fair value of AED 27.7 — a 127% implied upside and a 56% margin of safety (the discount of price to fair value). Every one of four independent value-producing methods lands above the current price: own-history AED 19.08, peer-relative AED 25.97, SOTP (sum-of-the-parts, valuing each business segment separately) AED 30.43, and intrinsic DCF (discounted cash flow, the present value of forecast free cash) AED 38.47. The SOTP is the most legible finding: the Emaar Malls segment alone — 86% EBITDA margin (earnings before interest, tax, depreciation and amortisation; a rough proxy for cash profit), AED 4,935M FY2025 EBITDA — is worth around AED 83,895M at a 17x segment multiple, close to the entire current market value, yet the whole consolidated group trades at just 3.8x EV/EBITDA (enterprise value — the price to buy the whole business net of cash — divided by EBITDA).

The single most important driver is the reverse-DCF finding: the AED 12.20 price implies FCF (free cash flow, cash left after running the business and reinvesting) shrinks 21.3% per year for seven straight years, from AED 24,295M today to AED 4,528M by FY2032. That trajectory is physically impossible given AED 134.3Bn of signed UAE construction contracts already on the books.

The single most important risk is not the property cycle. It is that Dubai Holding, the 29.73% controlling shareholder, is government-aligned and has no stated interest in per-share value maximization. The conglomerate discount may persist indefinitely — a value trap rather than a recoverable gap. This is why the attractiveness score is capped at 60 despite the arithmetic. [Sources cited in the synthesis: 07_scenario-and-fair-value §2/§4; 05_reverse-dcf §5; 06_sum-of-the-parts; management-governance/04_ownership-and-insider-behavior.md]

---

## The Specialists, Briefly

- **Data triage (00):** All five methods can run; no readiness caps active.
- **Price and capital structure (01):** Price AED 12.20 pool-verified; EV AED 96,672M; net cash AED 24,969M on the broad basis (nets short-term investments against debt). Restricted cash of AED 43,338M (project escrow — money held for buyers, not the company's) excluded from netting.
- **Multiples own-history (02):** EV/LTM EBITDA of 3.84x sits below the 4.25-year mean of 6.31x — historic-low de-rating (the market paying less for the same earnings).
- **Peers (03):** 75% discount to peer median LTM EV/EBITDA (3.6x vs 14.3x); Emaar trades 47.7% below the only true UAE peer, Aldar, despite higher margins and lower leverage. Peer set polluted by distressed Chinese developers.
- **Intrinsic DCF (04):** Base AED 38.47 at 8.83% WACC (weighted average cost of capital — what the money the business uses costs to raise) and 2.0% terminal growth. Terminal value 58.5% of DCF EV (below the 75% cap).
- **Reverse-DCF (05):** Price implies −21.3% FCF CAGR for seven years — physically impossible given the AED 134.3Bn backlog.
- **SOTP (06):** Base AED 30.43; Emaar Malls alone worth AED 83,895M — 78% of the consolidated market cap masked inside the 3.8x blended multiple.
- **Scenario and fair value (07):** Base AED 27.7 after an 8% government-owner haircut on the mechanical AED 30.08 blend.

**Most important disagreement:** The four base points span 102% — from AED 19.08 (own-history) to AED 38.47 (DCF). The synthesis resolves this by treating own-history as a floor (its historical multiples include a cycle peak, and the UAE corporate tax step-up from ~1.5% to 13% permanently compresses P/E) and anchoring the base on SOTP + DCF (60% combined weight). The gap is disclosed, not averaged away.

---

## What Would Change This Read

**Would make it cheaper (more attractive):**
- Price falls to AED 8–10 without a change in DCF or SOTP inputs.
- Off-plan sales collapse 40%+ in H2-2026, wiping the near-term working-capital release.
- Dubai Holding raises stake above 35–40% with signals toward strategic (non-shareholder-value) uses.
- UAE effective tax rises further above ~20%.

**Would make it less attractive (or close the gap):**
- Price stays at AED 12.20 while cycle data confirms the backlog is converting on pace (increases margin of safety).
- Government clarifies intent to monetise the Malls segment (partial re-listing or JV sale).
- Analyst consensus stops cutting or reverses the recent 16% EPS cut.
- Index reweighting drives institutional buying.

**Data needed to move the read:**
- FY2025 audited statutory annual report (full IFRS) — confirms restricted cash accounting.
- Q2-2026 Dubai off-plan residential sales volume — the single most important missing data point; determines whether the DCF's working-capital tailwind survives.
- Any Dubai Holding statement on Malls monetisation intent.

---

## Bottom Line

- **Verdict:** Materially undervalued — base AED 27.7, current AED 12.20, 56% margin of safety.
- **Biggest reason it could be better than it looks:** The bear-case fair value (AED 20.0) is itself 64% above the current price — the reverse-DCF shows the market's implied scenario is physically impossible given the AED 134.3Bn contracted backlog. There is effectively no downside to the bear.
- **Biggest reason it could be worse:** Dubai Holding (29.73%, RF-OWN-004) is government-aligned with no stated per-share-value objective. The SOTP gap may persist indefinitely — a genuine value trap, not a margin of safety, unless a Malls re-listing or similar owner-driven catalyst appears.
- **Missing evidence:** Q2-2026 UAE off-plan sales volume; FY2025 audited statutory filing; Dubai Holding intent on Malls monetisation.
- **What to watch next:** Q2-2026 off-plan sales velocity vs the FY2025 record AED 71.1Bn — the single variable the DCF is most sensitive to.

---

## Plain-English Glossary

- **EBITDA** — earnings before interest, tax, depreciation and amortisation; a rough proxy for cash profit from operations.
- **EV / EV/EBITDA** — enterprise value (the price to buy the whole business net of cash) divided by EBITDA; a multiple showing what the market pays for each unit of cash profit.
- **FCF** — free cash flow; cash left after running the business and reinvesting in it.
- **DCF** — discounted cash flow; a valuation built by discounting forecast future free cash back to today.
- **Reverse-DCF** — running a DCF backwards from the current price to see what future cash flow the market is implicitly assuming.
- **SOTP** — sum-of-the-parts; valuing each business segment separately and adding them up.
- **WACC** — weighted average cost of capital; what the money the business uses costs to raise (debt + equity blended).
- **Margin of safety** — the cushion between a conservative fair value and the current price.
- **Net cash (broad basis)** — cash and short-term investments minus total debt; the broader basis nets in liquid investments alongside cash.
- **Restricted cash** — cash the company is not free to spend (here, buyer escrow for projects under construction).
- **De-rating** — when the market pays less for the same earnings; the multiple compresses.
