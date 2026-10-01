# Valuation Module Memo — BURL

**Verdict: Fairly valued — the $254.69 price is 7.46% above the $237.01 base fair value, leaving no margin-of-safety cushion.**

**Memo date:** 2026-09-30

## Scores at a Glance

| Score | Result | Basis carried from the synthesis |
|---|---:|---|
| Valuation attractiveness /100 (**higher = cheaper**) | **40** | The base implies 6.94% downside from price, although the peer method alone implies 10.5% upside. [Valuation 03 Relative Valuation, §5; Valuation 07 Scenario & Fair Value, §§2 and 4] |
| Margin of safety /100 (**higher = better**) | **30** | Margin of safety—the price discount to base fair value—is **(7.46%)**, meaning the price is above the base and no cushion exists. [Valuation 07 Scenario & Fair Value, §4] |
| Valuation confidence /100 | **50** | Valid methods span $133.46–$302.88, a 126.94% spread measured from the low; this triggers a hard maximum of 55. [Valuation 00 Data Triage, §§3–6; Valuation 07 Scenario & Fair Value, §§1–2] |
| Downside risk /100 (**inverted — higher is worse**) | **88** | Downside to the $66.31 cyclical-trough bear value is 73.96%. [Valuation 07 Scenario & Fair Value, §§3–4] |
| Data quality /100 | **88** | Core inputs and a fresh price are present, but the vendor enterprise-value series does not reconcile and the fully diluted share count is a period-average proxy. [Valuation 00 Data Triage, §§3–6; Valuation 01 Price & Capital Structure, §§2 and 4; Valuation 02 Own History, §1] |
| Overall usefulness /100 | **78** | The module provides testable fair-value levels and a market-implied expectations read, but peer and cash-flow methods disagree sharply. [Valuation 05 Reverse DCF, §5; Valuation 07 Scenario & Fair Value, §§2–6] |

**Score cap:** The $133.46–$302.88 valid-method field exceeds 40%, so valuation confidence is capped at **55** and finishes at **50**. No price, consensus, peer, terminal-value, controlling-owner, or sector-cycle flag applies. The price is one trading day old, so the stale-price cap does not apply. [Valuation 01 Price & Capital Structure, §§1 and 7; Valuation 07 Scenario & Fair Value, §§1–2]

**§24 Avoid-Big-Risks filters:** None tripped. The misaligned-controlling-owner filter does not apply because ownership is dispersed, with one vote per share and no controller. [Management-Governance 04 Ownership & Insider Behavior, §4]

## What This Module Found

BURL's pool-verified NYSE close was $254.69 on September 28, 2026. The 12-month fair-value levels are $370.63 bull, $237.01 base, and $66.31 cyclical-trough bear; the bear is a recoverable trough case, not a permanent-impairment case. [Capital IQ Comps, Financial Data, subject row, 2026-09-28; Valuation 07 Scenario & Fair Value, §§2–3]

The base is a 70% weight on the $281.39 matched-peer next-twelve-month price-to-earnings value and a 30% weight on the $133.46 discounted-cash-flow value. That produces $237.01. On the module's margin-of-safety convention, the current price is 7.46% above base; moving from the current price down to base is a 6.94% loss. [Valuation 03 Relative Valuation, §5; Valuation 04 Intrinsic DCF, §§6–8; Valuation 07 Scenario & Fair Value, §§2 and 4]

The peer method leads because it uses $12.06 of next-twelve-month EPS and a 23.333x P/E multiple, retaining a 10% discount to the direct-peer median for Ross and TJX. It avoids the inconsistent lease treatment in enterprise-value multiples. [Capital IQ Comps, Financial Data and Trading Multiples, as of 2026-09-28; Valuation 03 Relative Valuation, §§4–5]

The discounted-cash-flow model is the necessary downside check. Its value is $133.46, with a $109.91–$168.23 sensitivity range, and terminal value supplies 74.35% of enterprise value, leaving the result sensitive to capital spending and later cash conversion. [Valuation 04 Intrinsic DCF, §§5–8]

At $254.69, the reverse DCF—which solves for what the market price assumes—requires 46.75% annual free cash flow to the firm growth through FY2030 to $1.641bn, or a 13.85% EBIT margin, meaning operating profit before interest and tax. Neither is proven; latest-twelve-month EBIT margin is 7.8%. [Valuation 04 Intrinsic DCF, §§6–8; Valuation 05 Reverse DCF, §§2–5]

The biggest risk is that store and supply-chain spending does not turn earnings growth into durable cash flow. That is why the peer value is $281.39 while the DCF is $133.46; if growth capex does not fall or generate later cash flow, the peer-led base is too high. [Valuation 04 Intrinsic DCF, §§2 and 4–8; Valuation 07 Scenario & Fair Value, §2]

Own-history sensitivities of $317.03–$438.53 receive no weight because their share and enterprise-value bases do not reconcile, while sum-of-the-parts adds nothing for a one-segment company. Sector-level multiple history is also unavailable, so neither BURL's old band nor today's peer median is proven to be a stable anchor. [Valuation 02 Own History, §§1 and 4–6; Valuation 03 Relative Valuation, §6; Valuation 06 Sum-of-the-Parts, §5]

## The Specialists, Briefly

| Specialist | Brief finding |
|---|---|
| valuation-data-triage | **Sufficient; no active partial-data cap:** price, forward estimates, peers, cash flow, and capital structure are present; sum-of-the-parts is inapplicable because BURL has one segment. [Valuation 00 Data Triage, §§3–6] |
| price-and-capital-structure | **Pool-verified anchor available:** price is $254.69, canonical strict net debt is $1.216bn, and enterprise value is $17.210bn; CIQ's $5.202bn net debt is a separate lease-inclusive measure. [Valuation 01 Price & Capital Structure, §§1 and 4–7] |
| multiples-own-history | **De-rated, but reversion is not an admissible base:** mechanical values are $317.03 on enterprise value to sales and $438.53 on P/E, but vendor enterprise-value and historical share bases do not reconcile. [Valuation 02 Own History, §§3–6] |
| relative-valuation-peers | **The peer gap is wider than warranted after a 10% durability discount:** matched next-twelve-month P/E gives $281.39; the $302.88 enterprise value to EBITDA check depends on a lease-inclusive vendor bridge. [Valuation 03 Relative Valuation, §§4–7] |
| intrinsic-dcf | **Intrinsic value is $133.46 per share:** the range is $109.91–$168.23, and terminal value is 74.35% of enterprise value. [Valuation 04 Intrinsic DCF, §§5–8] |
| reverse-dcf | **Current expectations are aggressive and not proven:** price requires 46.75% annual free-cash-flow growth through FY2030 or a 13.85% steady-state EBIT margin; holding the base cash path fixed implies a 6.95% discount rate. [Valuation 05 Reverse DCF, §§2–5] |
| sum-of-the-parts | **Single-segment — SOTP collapses:** one U.S. off-price segment accounts for all reportable revenue and profit, so a breakup would duplicate the peer method. [Valuation 06 Sum-of-the-Parts, §§1–5] |
| scenario-and-fair-value | **$370.63 bull / $237.01 base / $66.31 cyclical-trough bear:** the base is 6.94% below price, with a negative 7.46% margin of safety and 73.96% downside to bear. [Valuation 07 Scenario & Fair Value, §§2–6] |

The central reconciliation is the gap between $281.39 from peer P/E and $133.46 from DCF. The synthesis resolves it with the explicit 70% peer / 30% DCF blend to $237.01, while the 126.94% field spread caps confidence rather than being averaged away. [Valuation 03 Relative Valuation, §5; Valuation 04 Intrinsic DCF, §§6–8; Valuation 07 Scenario & Fair Value, §§1–2]

## What Would Change This Read

| Current verdict | What would make it cheaper | What would make it more expensive | Data needed |
|---|---|---|---|
| Fairly valued — $237.01 base versus $254.69 price | A lower price while $12.06 next-twelve-month EPS and the 19.65x base-equivalent P/E remain intact, or realised cash flow begins tracking above the DCF path without higher capital needs. | Next-twelve-month EPS below $12.06, stalled margin gains, or capex staying near the current 6%–7% of sales range would weaken cash conversion and the warranted multiple. | One matched forward cash-flow dataset with consensus capex, working capital, and free cash flow to the firm through FY2030, including analyst counts, to test the $850.5m DCF path against the $1.641bn price-implied requirement. [Valuation 04 Intrinsic DCF, §§2–4; Valuation 05 Reverse DCF, §2] |

## Bottom Line

- **Verdict:** Fairly valued. The $254.69 price sits above the $237.01 base, so there is no margin-of-safety cushion.
- **Why it could be better than it looks:** Even after a 10% durability discount to direct peers, matched next-twelve-month P/E gives $281.39, 10.5% above price. [Valuation 03 Relative Valuation, §§4–5]
- **Why it could be worse:** The DCF is $133.46, 47.6% below price, and the $66.31 cyclical-trough bear implies 73.96% downside. [Valuation 04 Intrinsic DCF, §§6–8; Valuation 07 Scenario & Fair Value, §§3–4]
- **What is missing:** Sector-level multiple history and a matched consensus capex, working-capital, and free-cash-flow dataset through FY2030 with analyst counts.
- **One thing to watch next:** Whether realised cash flow begins to track above the $850.5m FY2030 DCF path without higher capital needs; the price-implied requirement is $1.641bn.

## Plain-English Glossary

- **Margin of safety:** The discount between the market price and estimated base fair value.
- **Next-twelve-month P/E:** Price divided by expected earnings per share over the next twelve months.
- **Discounted cash flow (DCF):** A valuation that converts expected future cash flows into today's value.
- **Free cash flow to the firm (FCFF):** Cash available to both debt and equity providers after operating needs and investment.
- **EBIT margin:** Operating profit before interest and tax as a share of sales.
- **Enterprise value:** Equity value plus financial debt minus cash on the stated basis.
- **EV/EBITDA:** Enterprise value divided by earnings before interest, tax, depreciation, and amortisation.
- **Terminal value:** The estimated value of cash flows beyond the explicit forecast period.
- **Sum-of-the-parts (SOTP):** Valuing separate business segments individually and adding them together.
- **Reverse DCF:** Solving for the growth, margin, or discount-rate assumptions implied by the current market price.
