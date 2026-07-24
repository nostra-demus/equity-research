# valuation Module Dossier — TSLA

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-07-24T18:58:27Z
- Module folder: `valuation`
- Contents: 1 module synthesis + 8 specialist outputs = 9 files

## Table of Contents

- [valuation — module synthesis](#valuation-module-synthesis) — `99_valuation-synthesis.md`
- [valuation / 00_valuation-data-triage.md](#valuation-00-valuation-data-triage-md) — `00_valuation-data-triage.md`
- [valuation / 01_price-and-capital-structure.md](#valuation-01-price-and-capital-structure-md) — `01_price-and-capital-structure.md`
- [valuation / 02_multiples-own-history.md](#valuation-02-multiples-own-history-md) — `02_multiples-own-history.md`
- [valuation / 03_relative-valuation-peers.md](#valuation-03-relative-valuation-peers-md) — `03_relative-valuation-peers.md`
- [valuation / 04_intrinsic-dcf.md](#valuation-04-intrinsic-dcf-md) — `04_intrinsic-dcf.md`
- [valuation / 05_reverse-dcf.md](#valuation-05-reverse-dcf-md) — `05_reverse-dcf.md`
- [valuation / 06_sum-of-the-parts.md](#valuation-06-sum-of-the-parts-md) — `06_sum-of-the-parts.md`
- [valuation / 07_scenario-and-fair-value.md](#valuation-07-scenario-and-fair-value-md) — `07_scenario-and-fair-value.md`


---

## valuation — module synthesis

_Source: `99_valuation-synthesis.md`_

# Valuation Module — TSLA (Synthesis)

## Abstract

Tesla is materially overvalued: the triangulated base-case fair value of about $32 a share sits roughly 90% below the $319.69 current price (2026-07-23, pool-verified), driven by peer relative valuation and segment sum-of-the-parts, which independently converge near $40–41, cross-checked by a terminal-dominated discounted-cash-flow (DCF) read of $8.02. Bull and bear fair-value levels span $336.08 (a persistence of Tesla's own historical trading multiple) to $6.86 (a structural reset tied to an eroding, unproven return on capital). The current price implies a seven-year free-cash-flow growth rate of 68.9% — a pace no automaker has ever sustained and one that would require capturing most of the global auto industry, per the reverse-DCF. There is no margin of safety (−887.7%, a large embedded premium, not a cushion), and the loss to the bear case is 97.9%. The premium rests on unmonetized autonomy optionality, not filed segment economics.

## 1. Valuation Verdict

- **Verdict:** Materially overvalued
- **Base-case fair value (point, per share):** $32.37 (≈$32.4)
- **Current price:** $319.69 (2026-07-23, last close, `pool-verified`, fresh — 1 calendar day old, no staleness cap)
- **Bull / Base / Bear fair-value levels (points):** Bull $336.08 / Base $32.37 / Bear (headline, structural reset) $6.86 — a secondary cyclical-trough bear input of $20.90 is shown as the nearer-term (12-month) marker; the structural reset is the graduated, worse-of headline because the moat trajectory is confirmed **eroding**, not merely unproven
- **Cross-method dispersion (football field, low–high):** $8.02 (intrinsic DCF, base) to $286.5 (own-history multiples, base point) — a roughly 35x top-to-bottom spread across the four value-producing methods' base points; own-history's own internal range (six multiples reverted) stretches further, $92.4–$417.4
- Valuation attractiveness /100 *(higher = cheaper)*: **5** — price sits far above every triangulated method; there is no discount to fair value on any economically-grounded basis
- Margin of safety /100 *(higher = better)*: **2** — margin of safety is −887.7% (a large embedded premium, not a cushion)
- Valuation confidence /100: **58** — capped at 60 by the terminal-value->75%-of-EV trigger in `04`'s Gordon-growth base case (125.2% of EV); set just under the cap given the otherwise rich, current data pool and the explicit (not silent) reconciliation of the wide cross-method dispersion
- Downside risk /100 *(higher = worse)*: **96** — the loss to the bear case (structural reset) is 97.9% of the current price
- Data quality /100: **90** — `00`'s own sufficiency verdict is "Sufficient," no partial-data caps bind, price/estimates/peers/capital-structure/cash-flow are all present and 0–1 month current
- Overall usefulness /100: **88**
- Dominant valuation method (one line): peer relative valuation (`03`) and segment sum-of-the-parts (`06`), which converge independently near $40–41/share despite different construction methods, blended with a capped-weight DCF cross-check (`04`) into the ≈$32 base; Tesla's own-history multiples (`02`) are explicitly excluded from the base blend as a circular anchor (see §3)
- What's priced in (one line): a 68.9% compound annual free-cash-flow growth rate sustained for 7 years — or, equivalently, capturing 75–100%+ of the entire global automotive industry by FY2032 — which the reverse-DCF (`05`) finds has no precedent in Tesla's own history (best-ever sustained rate: 51–71% for at most 2 years, followed by deceleration to an outright FY2025 revenue decline)
- Biggest valuation risk (one line): the price depends entirely on the market continuing to extend an optionality premium for unmonetized robotaxi/Optimus/FSD ambitions that carry zero segment or revenue-line disclosure — and that same autonomy narrative is the subject of an unresolved federal securities-fraud class action naming the CEO personally (RF-MGT-005, `management-governance/99`), which sits directly under the bull case's central assumption

## 1A. Module Disconfirmation

- **Strongest bear point:** the reverse-DCF (`05`) shows the current price requires a 68.9% seven-year FCF CAGR — a level Tesla has sustained for at most two years (51–71%, off a depressed pandemic base) before decelerating every year since, including an outright FY2025 revenue decline — and a market-ceiling check finds this would require Tesla to capture 75–100%+ of the entire global automotive industry by FY2032, a share no automaker has ever held. Combined with a base-case fair value of $32.37 (a −887.7% margin of safety) and a 97.9% downside to the bear case, this is the single most damaging finding in the module.
- **Strongest bull point (steelman):** Tesla's own 5-year median NTM EV/Sales multiple (11.50x) has persisted through multiple business cycles despite the earnings-based multiples (P/E, EV/EBIT, EV/EBITDA) sitting at their own historical ceiling — if the market continues to extend that same optionality credit (rewarded by a further ~10% delivery beat, within the observed single-quarter swing range), the bull case reaches $336.08/share, essentially flat to today's price. `business-model/09_moat.md` also scores Technology/IP at 50/100 — the one component of the moat test that is not weak — so the underlying technology asset is not valuation fiction, only unmonetized.
- **Single killer risk:** continued failure of robotaxi/FSD/Optimus to convert into disclosed revenue, combined with the confirmed **eroding** moat trajectory (return on capital falling every year for three straight years, gap to WACC widening), triggers the $6.86 structural-reset bear — and the unresolved federal securities-fraud class action (RF-MGT-005) sits on the exact same autonomy claims the entire bull case depends on; if that suit survives its pending motion to dismiss, it directly threatens the trust the optionality premium requires.
- **Disconfirming evidence already visible:** `03` (peers) and `06` (SOTP) converge independently near $40–41/share on named, economically-matched comparables (Ford/GM for Automotive, Fluence Energy for the storage segment) despite being built by two different methods; `business-model/09_moat.md` finds "No moat proven" with return on capital 210–885 basis points below cost of capital on every basis computed, including the 5-year through-cycle average; and `management-governance/99` finds the current management has not delivered per-share value from a 141% growth in invested capital (EBIT fell 33%, diluted EPS fell 70% since FY2021–FY2025 peaks) and has not repurchased a single share in any year despite positive free cash flow every year.

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | Sufficient — all core valuation inputs present and current, no caps bind | Pool is unusually rich: price, consensus, peers, capital structure, and cash flow are all 0–1 month current |
| price-and-capital-structure | Price $319.69, `pool-verified`, fresh; EV $1,235,847.8mm | Fully diluted share count (≈4,252.5mm) is an approximation — no options/RSU strike schedule found in the pool; flagged as inference |
| multiples-own-history | Current sits at or above its own 5-year ceiling on EV/EBIT (100th percentile) and P/E (100th percentile); mid-range on EV/Sales (39th percentile) | The earnings-based multiples look rich mostly because the earnings denominator collapsed (EBIT margin 16.8%→4.1%, EPS $4.30→$1.08), not because the market is paying more for a stable dollar of earnings — the least distorted reversion (EV/Sales to median) still implies −10.4% |
| relative-valuation-peers | Trades at a ~800–2,300% premium to a core peer median across every multiple in the pool, unsupported by the quality evidence | Quality-adjusted base-case implied value ≈$40.19/share (1.3x NTM EV/Sales, a deliberate 40% premium to the 0.93x peer median) vs $319.69 current price |
| intrinsic-dcf | Base-case intrinsic value $8.02/share; terminal value 125.2% of EV (terminal-dominated, low-confidence) | The entire positive enterprise value comes from the terminal — the explicit 7-year forecast period has a *negative* PV (−$8,989mm) because guided capex (>$25bn floor, "growing for the next two to three years") swamps profitability |
| reverse-dcf | Price implies a 68.9% 7-year FCF CAGR, or ≈9.3 years at Tesla's own best-ever growth rate | A market-ceiling sanity check shows this implies Tesla capturing 75–100%+ of the entire global automotive industry by FY2032 — a share no automaker has ever held |
| sum-of-the-parts | Base-case SOTP value $41.09/share (blended 1.38x forward EV/Sales across two segments) | Tesla's own consolidated NTM EV/Sales (11.15x) is roughly 8x the blended segment-level multiple named peers command for the same disclosed economics — ~90% of Tesla's EV is not explained by the Automotive or Energy segment as filed |
| scenario-and-fair-value | Base-case fair value ≈$32.37/share; bull $336.08 / bear (headline) $6.86 | Every method in the football field, even the richest, sits far below the $319.69 current price — the 35x method-to-method spread is itself the finding |

## 3. Reconciliation

**Lead with the spread: the football field spans roughly 35x, from $8.02 (intrinsic DCF) to $286.5 (own-history multiples), before even reaching the bull/bear scenario levels ($336.08 / $6.86).** This dwarfs the module's 40% disagreement-flag threshold by an order of magnitude, and `07` treats the gap explicitly rather than averaging it away.

The disagreement is reconciled, not left standing: `02`'s own-history reversion ($286.5 base) reverts Tesla's price to Tesla's *own* historical trading multiple — a band that this research program's own evidence (the reverse-DCF's 68.9% implied-CAGR finding; `business-model/09_moat.md`'s "No moat proven, eroding" verdict; `business-model/07_business-quality.md`'s 33/100 quality score) shows has never been validated against underlying economics. Using it as a majority-weighted anchor would make the base case circular — "TSLA is worth what TSLA has always traded for." `07` therefore excludes `02` from the weighted base (0% weight) and repurposes it as the bull-case input (a persistence, not an expansion, of history). `03` (peers, $40.19) and `06` (SOTP, $41.09) converge independently within 2% of each other despite different construction methods — the strongest corroborating signal in the module — and carry 45%/30% of the base weight. `04` (DCF, $8.02) is a genuine cash-flow-grounded cross-check but is capped at 25% weight because its own terminal value is 125.2% of EV, driven by a guided multi-year capex supercycle that makes the explicit forecast period cash-negative in present-value terms; the gap between `04` and `03`/`06` is explained (terminal-year capex/D&A still absorbing the tail of the buildout), not silently split. `05` (reverse-DCF) is not a weighted method but corroborates the whole picture from the opposite direction — the growth required to justify $319.69 has no precedent in Tesla's own history.

Even after this reconciliation, a residual, explained gap remains between `04` ($8.02) and `03`/`06` (~$40): this is disclosed as the DCF's own terminal-method sensitivity (an exit-multiple cross-check inside `04` itself reaches $18.30–$39.07, much closer to `03`/`06`) rather than left as an unexplained divergence.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N — price is `pool-verified`, fresh | — | Not applicable |
| No consensus / forward estimates | N — full consensus present (target price, EPS, revenue, EBITDA, forward multiples through FY2033E) | — | Not applicable |
| No peer data | N — 10 named peers with LTM & NTM multiples present | — | Not applicable |
| Only one valuation method usable | N — own-history, peers, DCF, reverse-DCF, and SOTP all ran | — | Not applicable |
| No cash flow AND DCF is only method | N — cash-flow statement present FY2017–FY2025A and quarterly; multiple methods ran | — | Not applicable |
| SOTP not possible for multi-segment | N — SOTP ran fully (two-segment build, not collapsed) | — | Not applicable |
| Methods disagree >40% unreconciled | N — the >40% (here, ~35x) disagreement is explicitly reconciled in `07`/§3 above (02 excluded with stated reasoning; 04's gap to 03/06 explained via terminal-method sensitivity), not silently averaged | — | Not applicable (see §3 for the residual, explained gap that remains) |
| Terminal value >75% of DCF EV | **Y** — `04`'s base-case Gordon terminal value is 125.2% of enterprise value | Valuation confidence | Max 60 |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | N — `management-governance/99_management-governance-synthesis.md` tested and did not trip this filter (not government-controlled, not a listed subsidiary, not an unrelated conglomerate) | — | Not applicable |

Most restrictive applicable cap: **valuation confidence, max 60** (terminal-value trigger). Final confidence score set at 58, just under the cap, reflecting the pool's otherwise strong completeness against the genuine residual method disagreement.

## 5. Fair-Value Summary

The bull/base/bear fair-value levels are $336.08 / $32.37 / $6.86, with the base point driven by peer relative valuation (`03`, $40.19) and segment sum-of-the-parts (`06`, $41.09) — two independently-built methods that converge within 2% of each other and together carry 75% of the base-case weight, blended down modestly by a capped-weight intrinsic DCF (`04`, $8.02). The current price ($319.69) implies a seven-year free-cash-flow growth rate of 68.9%, a pace that would require Tesla to capture the large majority of the entire global automotive industry by FY2032; nothing in Tesla's own delivery, revenue, or margin history — a two-year growth burst followed by deceleration to an outright FY2025 revenue decline — supports that as achievable. The margin of safety is −887.7% (price sits far above base fair value; there is no cushion, only a large embedded premium), and the downside to the bear case (a structural reset triggered by the moat module's confirmed "eroding" return-on-capital trajectory) is 97.9% — these are two distinct, both-severe reads, not one number. This is not primarily a value-trap read in the traditional sense (a cheap multiple the business does not deserve): it is the mirror image — an expensive multiple with no proportionate economic support this research program can find, resting on unmonetized robotaxi/Optimus/FSD optionality that carries zero disclosed revenue and sits, per `management-governance/99`, under an unresolved securities-fraud class action naming the CEO personally on the exact autonomy claims the premium depends on.

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Materially overvalued | A disclosed robotaxi/Optimus/FSD revenue line with a credible near-term path to profitability, closing the gap `06` finds between the ~1.4x segment-level multiple and the ~11x consolidated multiple; a sustained return on capital rising above the ~12.4% cost of capital (reversing the "eroding" trajectory `09_moat.md` finds); a large price decline toward the $32–41 triangulated base without a matching fundamental deterioration | A durable re-rating of the earnings-based multiples on genuine margin recovery toward the FY2021–2022 range (12.1%–16.8% EBIT margin) *delivered*, not guided; resolution of the securities-fraud class action in Tesla's favor removing the overhang on the autonomy narrative; disclosed segment economics for robotaxi/Optimus that justify a materially higher multiple than Ford/GM/Fluence-analog comparables | A standalone segment or revenue disclosure for robotaxi/Optimus/FSD/AI-compute; the options/RSU strike schedule (to firm up the fully-diluted share count); the current bylaws exhibit (governance module's own highest-priority follow-up, relevant to any capital-return/buyback scenario) |

## 7. Note To The Final Synthesizer

- Bull/base/bear fair-value levels: **$336.08 / $32.37 / $6.86** (base point). Dominant method: peer relative valuation (`03`) and segment sum-of-the-parts (`06`), which converge independently near $40–41/share; own-history multiples (`02`, $286.5) are excluded from the base as a circular anchor and repurposed as the bull-case driver.
- What the price implies: a 68.9% seven-year FCF CAGR (or ≈9.3 years at Tesla's own best-ever growth rate), which the reverse-DCF (`05`) finds is not achievable — it would require capturing 75–100%+ of the global automotive industry by FY2032, a share no automaker has ever held.
- Margin of safety: **−887.7%** (no cushion; a large embedded premium instead). Downside to bear (structural reset): **97.9%**; bear-case value **$6.86/share**.
- This is genuine overvaluation risk, not the classic value-trap pattern (a cheap multiple the business does not deserve): the risk runs the other way — an expensive multiple the business's filed economics do not support, resting on unmonetized robotaxi/Optimus/FSD optionality. No RF-OWN-004 structurally-misaligned-owner trigger applies (`management-governance/99` tested and did not trip it), so this finding rests entirely on fundamentals evidence, not an ownership-structure discount.
- Trust `03` (peers) and `06` (SOTP) most for this company — they converge independently on different construction methods. Discount `02` (own-history) as a base-case input — it is circular for a stock whose own multiple history has never been validated against economics — but it is the right input for framing the bull case (persistence of history). Treat `04` (DCF) as directionally corroborating but low-confidence given its terminal dominance (125.2% of EV).
- Partial-data caps: only one binds — the terminal-value->75%-of-EV trigger caps valuation confidence at 60 (final score 58). No price cap applies; the price is `pool-verified` and fresh.
- Biggest missing data point (single highest-value next request): a disclosed options/RSU outstanding-and-strike schedule, to replace the approximate (TSM-proxy) fully diluted share count (≈4,252.5mm) with a rules-based figure — this affects every per-share output in this module.
- **Explicit handoff:** the master synthesizer's "Valuation and Peer Mispricing" section should defer to this synthesis. The bull/base/bear fair-value LEVELS here ($336.08 / $32.37 / $6.86) are the inputs for the master's probability-weighted scenario model — this module assigns no probabilities and makes no rating or position-sizing call; those are the master synthesizer's to make.

## 8. Simple Summary

- Expensive, not cheap: the triangulated base-case fair value (≈$32/share) sits about 90% below the $319.69 current price.
- Bull/base/bear fair-value levels: **$336.08 / $32.37 / $6.86** per share.
- What the market is pricing in: a 68.9% compound annual free-cash-flow growth rate for 7 straight years — a pace that would require capturing most of the entire global auto industry, something no automaker has ever done.
- Downside: the bear case (a structural reset tied to an eroding, unproven return on capital) is $6.86/share — a 97.9% loss from today's price.
- The method to trust most: peer relative valuation and segment sum-of-the-parts, which independently land within 2% of each other (~$40–41/share).
- This looks like the reverse of a value trap: an expensive stock whose premium has no proportionate economic support this research program can find, resting on unmonetized robotaxi/Optimus/FSD ambitions — and that same autonomy story sits under an unresolved securities-fraud lawsuit naming the CEO.
- A current, pool-verified price was available ($319.69, 1 day old) — no price gap here; the real gap is the fully-diluted share count, which is an approximation pending an options/RSU schedule.
- This module is useful for the master synthesizer: the data pool is rich, the caps are minimal, and multiple independently-built methods converge on the same conclusion.



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — TSLA

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| Tesla_Inc_-_Form_10-KA(Apr-30-2026).doc | Annual filing (Part III-only amendment) | FY ended Dec-31-2025 | Jul 24, 2026 (Drive sync date — not the reporting period; do not treat as document age) | Medium (governance/Part III content only — no Item 8 financial statements; see note below) |
| Tesla_Inc_-_Form_10-Q(Jul-23-2026).doc | Quarterly filing | Quarter ended Jun-30-2026 | Jul 24, 2026 (sync date) | High |
| Annual_Report_TSLA-Q4-2025.pdf | Shareholder update deck (with GAAP balance sheet, income statement, cash-flow statement embedded) | Q4 & FY2025 (ended Dec-31-2025) | Jul 24, 2026 (sync date) | High |
| Annual_Report_TSLA-Q4-2024.pdf | Shareholder update deck (prior year, same format) | Q4 & FY2024 (ended Dec-31-2024) | Jul 24, 2026 (sync date) | Medium (superseded by FY2025 deck for levels; useful for trend) |
| TSLA-Q1-2026-Update.pdf | Shareholder update deck | Quarter ended Mar-31-2026 | Jul 24, 2026 (sync date) | Medium (superseded by Q2 2026 deck) |
| TSLA-Q2-2026-Update.pdf | Shareholder update deck | Quarter ended Jun-30-2026 | Jul 24, 2026 (sync date) | High |
| Tesla, Inc., Q1 2026 Earnings Call, Apr 22, 2026.rtf | Transcript | Q1 2026 (call date Apr-22-2026) | Jul 24, 2026 (sync date) | Medium |
| Tesla, Inc., Q2 2026 Earnings Call, Jul 22, 2026.rtf | Transcript | Q2 2026 (call date Jul-22-2026) | Jul 24, 2026 (sync date) | Medium |
| Company Comparable Analysis Tesla Inc .xls → **Financial Data** | Multiples / current-price / peer export (tab) | As-of 2026-07-24 (LTM through latest filing) | Jul 24, 2026 (sync date) | High — current price, shares out., market cap, EV, LTM & NTM fundamentals for TSLA + 10 peers |
| Company Comparable Analysis Tesla Inc .xls → **Trading Multiples** | Peer/comps export (tab) | As-of 2026-07-24 | Jul 24, 2026 | High — LTM & NTM multiples, TSLA vs. 10 named peers |
| Company Comparable Analysis Tesla Inc .xls → **Operating Statistics** | Peer/comps export (tab) | As-of 2026-07-24 | Jul 24, 2026 | Medium |
| Company Comparable Analysis Tesla Inc .xls → **Business Description** | Peer/comps export (tab) | As-of 2026-07-24 | Jul 24, 2026 | Low |
| Company Comparable Analysis Tesla Inc .xls → **Implied Valuation** | Multiples/implied-valuation export (tab) | As-of 2026-07-24 | Jul 24, 2026 | High |
| Company Comparable Analysis Tesla Inc .xls → **Valuation Chart** | Peer/comps export (tab) | As-of 2026-07-24 | Jul 24, 2026 | Low |
| Company Comparable Analysis Tesla Inc .xls → **Credit Health Panel** | Capital-structure/credit export (tab) | LTM through Jun-30-2026 | Jul 24, 2026 | Medium |
| Company Comparable Analysis Tesla Inc .xls → **Disclaimer** | Boilerplate (tab) | — | Jul 24, 2026 | Low |
| Short_Interest_12m_TSLA.xls → **Chart 1 with Data** | Short-interest / positioning export (tab) | Trailing 12 months to Jul-2026 | Jul 24, 2026 | Low |
| Short_Interest_12m_TSLA.xls → **Attributions** | Boilerplate (tab) | — | Jul 24, 2026 | Low |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls → **Summary** | Capital-structure / credit export (tab) | LTM ended Jun-30-2026 (financials updated Jul-23-2026) | Jul 24, 2026 | High — peer credit-health ranking (31 auto peers), S&P rating (BBB) |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls → **Financials** | Capital-structure export (tab) | Multi-period through Jun-30-2026 | Jul 24, 2026 | Medium |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls → **Operational Metrics Charts** | Chart data (tab) | Multi-period | Jul 24, 2026 | Low |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls → **Solvency Metrics Charts** | Chart data (tab) | Multi-period | Jul 24, 2026 | Low |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls → **Liquidity Metrics Charts** | Chart data (tab) | Multi-period | Jul 24, 2026 | Low |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls → **Disclaimer** | Boilerplate (tab) | — | Jul 24, 2026 | Low |
| Tesla Inc NasdaqGS TSLA Customers.xls → **Customers** | Segment/customer disclosure export (tab) | As disclosed, last 2 years | Jul 24, 2026 | Low (concentration/segment context, not valuation-critical) |
| Tesla Inc NasdaqGS TSLA Events Calendar.xls → **Events Calendar** | Catalyst calendar export (tab) | Forward-looking | Jul 24, 2026 | Low |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls → **Key Stats** | Income-statement summary export (tab) | FY2017–FY2025A + LTM (Jun-30-2026) + FY2026E | Jul 24, 2026 | High |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls → **Income Statement** | Income statement export (tab) | FY2017–FY2025A | Jul 24, 2026 | High |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls → **Balance Sheet** | Balance sheet export (tab) | FY2017–FY2025A | Jul 24, 2026 | High |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls → **Cash Flow** | Cash-flow export (tab) | FY2017–FY2025A | Jul 24, 2026 | High |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls → **Multiples** | Own-history multiples export (tab) | FY2017–FY2025A + LTM | Jul 24, 2026 | High |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls → **Historical Capitalization** | Capital-structure / market-cap history export (tab) | Quarterly, 2017Q1–2026Q2 | Jul 24, 2026 | High — own-history EV/market-cap band |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls → **Capital Structure Summary** | Capital-structure export (tab) | FY2017–FY2025A + Q2 2026 | Jul 24, 2026 | High — net debt, debt mix, credit ratios |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls → **Capital Structure Details** | Capital-structure export (tab) | FY2017–FY2025A + Q2 2026 | Jul 24, 2026 | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls → **Ratios** | Ratio export (tab) | FY2017–FY2025A | Jul 24, 2026 | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls → **Supplemental** | Supplemental data export (tab) | FY2017–FY2025A | Jul 24, 2026 | Low |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls → **Industry Specific** | Auto-industry KPI export (tab) | FY2017–FY2025A | Jul 24, 2026 | Low |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls → **Pension OPEB** | Pension/OPEB export (tab) | FY2017–FY2025A | Jul 24, 2026 | Low |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls → **Segments** | Segment revenue/EBIT export (tab) | FY2017–FY2025A | Jul 24, 2026 | High — Automotive vs. Energy Generation & Storage |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls → **Key Stats / Income Statement / Balance Sheet / Cash Flow / Multiples / Historical Capitalization / Capital Structure Summary / Capital Structure Details / Ratios / Supplemental / Industry Specific / Pension OPEB / Segments** (12 tabs) | Quarterly equivalents of the annual workbook's 12 tabs | Quarterly, extends through Jun-30-2026 | Jul 24, 2026 | High — enables LTM computation |
| Tesla Inc NasdaqGS TSLA Key Developments.xls → **Key Developments** | Event/news log export (tab) | Multi-year | Jul 24, 2026 | Low |
| Tesla Inc NasdaqGS TSLA Public Company Profile.rtf | Company profile | Current | Jul 24, 2026 | Low |
| Tesla Inc NasdaqGS TSLA Public Ownership History.xls → **History** | Ownership history export (tab) | Multi-year, per-filer | Jul 24, 2026 | Low (governance-relevant, not a valuation driver) |
| Tesla Inc NasdaqGS TSLA Public Ownership Insider Trading.xls → **Insider Trading** | Insider-trading export (tab) | Multi-year | Jul 24, 2026 | Low |
| Tesla Inc NasdaqGS TSLA Public Ownership Summary.rtf | Ownership summary | Current (as-of latest shares out.) | Jul 24, 2026 | Medium — share-count / holder-mix cross-check |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls → **Consensus** | Consensus / estimate export (tab) | Current-quarter/FY/NTM as of Jul-24-2026; FQ3 2026 release date Oct-21-2026 | Jul 24, 2026 | High — target price, EPS/revenue/EBITDA consensus, recommendation mix |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls → **Recent Changes** | Estimate-revisions export (tab) | Trailing revisions | Jul 24, 2026 | Medium |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls → **Guidance** | Company-guidance export (tab) | Forward | Jul 24, 2026 | Medium |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls → **Multiples** | Consensus/forward multiples export (tab) | NTM, FY2026–FY2033E | Jul 24, 2026 | High — forward TEV/Rev, TEV/EBITDA, TEV/EBIT, P/E, PEG, P/BV |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls → **Surprise** | Earnings-surprise export (tab) | Trailing quarters | Jul 24, 2026 | Low |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls → **Trends** | Estimate-trend export (tab) | Trailing/forward | Jul 24, 2026 | Low |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls → **Revisions** | Estimate-revisions export (tab) | Trailing/forward | Jul 24, 2026 | Low |

No `external/` documents are present in this pool (`data/TSLA/external/` does not exist) — Section 1A is omitted since there is nothing to list.

**Note on the annual filing:** the 10-K/A in the pool is a **Part III-only amendment** (it explicitly references "Part II, Item 8 of the Original Form 10-K" rather than restating the financial statements) — it does not itself carry Item 8 (financial statements). The original FY2025 10-K text is not in the pool. However, the FY2025 audited-basis income statement, balance sheet, cash-flow statement, and segment data are fully available via the CIQ Financials_Annual export ("Restatement: Latest Filings," period ended Dec-31-2025), and the Q4/FY2025 shareholder update deck (`Annual_Report_TSLA-Q4-2025.pdf`) separately reproduces a GAAP balance sheet, income statement, and cash-flow statement (lines "BALANCE SHEET," "STATEMENT OF CASH FLOWS"). This satisfies the earnings-base requirement; downstream agents should cite the CIQ export or the deck for any FY2025 GAAP figure — not "the 10-K" — since the 10-K's own Item 8 text is absent from the pool (bad-extraction distinction, not a missing filing per §20/§27).

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States — NasdaqGS:TSLA | 10-Q cover page: "SECURITIES AND EXCHANGE COMMISSION... FORM 10-Q"; CIQ header "NasdaqGS:TSLA" throughout |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | 10-Q and 10-K/A both filed under "SECURITIES EXCHANGE ACT OF 1934" |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | Q2 2026 10-Q, Item 1 "Financial Statements" (Condensed Consolidated Statements of Operations); CIQ Consensus tab header "Acctg. Standard: US GAAP" |
| Reporting currency (and scale) | USD, reported in millions | CIQ Financials_Annual "In Millions of the reported currency"; Q4/FY2025 update deck "($ in millions...)" |
| Fiscal-year end | December 31 (calendar fiscal year) | 10-K/A: "For the fiscal year ended December 31, 2025"; 10-Q: "For the quarterly period ended June 30, 2026" |
| Document language(s) | English (all documents) | All PDFs, RTFs, .doc (mhtml) filings, and CIQ workbook tabs are in English — §27's language provisions are not triggered |

TSLA is a US domestic filer; standard US SEC document names (10-K/A, 10-Q) apply directly — no local-equivalent mapping is needed.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (governance-only; financials via CIQ/deck) | Tesla_Inc_-_Form_10-KA(Apr-30-2026).doc | FY ended Dec-31-2025 (filed Apr-30-2026) | ~3 months since filing; ~7 months since period-end |
| Quarterly filing | Tesla_Inc_-_Form_10-Q(Jul-23-2026).doc | Quarter ended Jun-30-2026 (filed Jul-23-2026) | ~1 day since filing |
| Capital structure / balance sheet | Tesla Inc NasdaqGS TSLA Financials_Annual.xls (Capital Structure Summary tab; also Financials_Quarterly for the Jun-30-2026 column) | Balance sheet as of Jun-30-2026 | 0 months (matches the 10-Q period) |
| Consensus / estimate export | Tesla,IncNasdaqGSTSLAEstimatesReport.xls (Consensus tab) | As-of Jul-24-2026 (today); next release Oct-21-2026 | 0 months |
| Multiples export | Tesla,IncNasdaqGSTSLAEstimatesReport.xls (Multiples tab) — forward; Tesla Inc NasdaqGS TSLA Financials_Annual.xls (Multiples tab) — trailing/own-history | As-of Jul-24-2026 (forward); through FY2025A + LTM (own-history) | 0 months (forward); ~1 month (LTM through Jun-30-2026) |
| Peer / comps export | Company Comparable Analysis Tesla Inc .xls (Trading Multiples / Financial Data tabs) | As-of 2026-07-24 | 0 months |
| Current price (IBKR / Capital IQ) | Company Comparable Analysis Tesla Inc .xls (Financial Data tab) — Day Close Price Latest = $319.69 | 2026-07-23 (LTM Filing Date, Income Statement column for TSLA row) | 0 months (1 day old) |
| Cash flow statement | Tesla Inc NasdaqGS TSLA Financials_Annual.xls (Cash Flow tab); Financials_Quarterly for LTM build | FY2017–FY2025A (annual); quarterly through Jun-30-2026 | ~1 month (LTM through Jun-30-2026) |
| Segment data | Tesla Inc NasdaqGS TSLA Financials_Annual.xls (Segments tab) | FY2017–FY2025A (Automotive; Energy Generation and Storage) | ~7 months (latest annual segment split, FY2025) |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | Company Comparable Analysis Tesla Inc .xls, Financial Data tab — $319.69, as-of 2026-07-23 (1 day old); cross-checked by Historical Capitalization tab's last column (Pricing as of 2026-07-23, $319.69) | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | Company Comparable Analysis Tesla Inc .xls, Financial Data tab — Shares Outstanding Latest 3,949.5mm; Historical Capitalization tab confirms 3,755.7mm basic shares out. at Jun-30-2026 (note: CIQ "Shares Outstanding Latest" of 3,949.5mm appears to already reflect a more current/diluted count than the historical-cap column's basic count — reconcile in `01`) | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Partial | CIQ Financials_Annual "Historical Capitalization" tab is Basic-dilution-labeled; no separate options/RSU/convertible dilution schedule tab was found in this pool's workbooks (10-Q Note on EPS/dilutive securities would carry this detail but was not independently confirmed in the extract) | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y | business-model/02_business-identity.md §3: vertically integrated EV manufacturer + energy storage; generic operating-company read confirmed, no sector overlay match | Determines which valuation methods are valid |
| Total debt, cash, minority/preferred | Y | Tesla Inc NasdaqGS TSLA Financials_Annual.xls, Capital Structure Summary tab — Total Debt $16,080mm, Cash & ST Investments $43,524mm, Net Debt -$27,444mm, Total Minority Interest $661mm, no preferred equity, all at Jun-30-2026 | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | Tesla Inc NasdaqGS TSLA Financials_Annual.xls, Key Stats / Income Statement tabs — FY2025A and LTM (Jun-30-2026) both present | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | Tesla Inc NasdaqGS TSLA Financials_Annual.xls, Cash Flow tab (FY2017–FY2025A); Financials_Quarterly Cash Flow tab enables LTM build; Annual_Report_TSLA-Q4-2025.pdf also reproduces a GAAP cash-flow statement | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | Tesla,IncNasdaqGSTSLAEstimatesReport.xls, Consensus tab — target price $409.81 mean/$440 median (39-40 estimates), NTM EPS $1.91, NTM revenue $110,859.9mm, NTM EBITDA $17,331.02mm | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | Tesla Inc NasdaqGS TSLA Financials_Annual.xls, Multiples tab + Historical Capitalization tab (quarterly EV/market cap since 2017) | Own-history re-rating read |
| Peer / comps data | Y | Company Comparable Analysis Tesla Inc .xls, Trading Multiples / Financial Data tabs — 10 named peers (Ford, GM, Rivian, NVIDIA, Honda, Mercedes-Benz, Renault, Lucid, Kia, Stellantis) with LTM & NTM multiples; also cross-checked by Credit Health Panel's 31-company auto-peer set | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Partial | Tesla Inc NasdaqGS TSLA Financials_Annual.xls, Segments tab — Automotive vs. Energy Generation and Storage revenue AND gross profit before tax are both present through FY2025A; a full segment EBIT/operating-income line (post opex, not just gross profit) was not confirmed in the extract head shown | Sum-of-the-parts |
| Dividend / buyback data | Y (dividend N/A — company pays none; buyback data present) | Tesla Inc NasdaqGS TSLA Financials_Annual.xls, Capital Structure/Supplemental tabs and Cash Flow tab (financing-activities section) carry share-repurchase history; Tesla does not pay a dividend (confirmed by earnings-module cross-read, no dividend line in Key Stats) | Shareholder-yield read |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/03_segment-map.md | Y |
| business-model/08_competitive-map.md | Y |
| business-model/07_business-quality.md | Y |
| business-model/09_moat.md | Y |
| business-model/10_external-dependency.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/04_guidance-consensus.md | Y |
| earnings/03_margin-drivers.md | Y |
| earnings/07_earnings-sensitivity.md | Y |
| earnings/06_earnings-quality.md | Y |

All ten cross-module files exist on the filesystem in `analyses/TSLA_2026-07-24/business-model/` and `analyses/TSLA_2026-07-24/earnings/` (confirmed by directory listing). `analyses/TSLA_2026-07-24/management-governance/` also exists and is available for the RF-OWN-004 unaligned-owner read, even though it is not one of the two cross-module paths this triage is scoped to check: `management-governance/99_management-governance-synthesis.md` states Filter 6 (unaligned owner, RF-OWN-004) was tested and **not tripped** — TSLA is not government-controlled, not a listed subsidiary of a value-maximizing parent, and not an unrelated conglomerate. Note for `07`/`99`: the governance module *does* flag an unresolved integrity signal (RF-MGT-005, an unresolved federal securities-fraud class action naming the CEO personally) that caps the overall investment rating at "Watchlist" — this is a synthesis-layer/master-synthesizer concern per §13/§24 Filter 1, not a valuation-method availability issue, but it should be carried forward as context for the final valuation-attractiveness read (a cheap multiple should not be read as a pure re-rating opportunity while this is unresolved).

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N — pool-verified price ($319.69, as-of 2026-07-23, CIQ Comparable-Analysis export) is present and 1 day old | 01, 05, 07, 99 | Not applicable |
| No consensus / forward estimates | N — full consensus (target price, EPS, revenue, EBITDA, forward multiples through FY2033E) is present | 02, 03, 04, 05 | Not applicable |
| No peer data | N — 10 named peers with LTM & NTM multiples present (Trading Multiples tab), plus a 31-company credit-health peer set | 03, 06 | Not applicable |
| No segment-level data | Partial — segment revenue and gross-profit-before-tax exist for both segments (Automotive; Energy Generation and Storage) through FY2025A, but a segment-level operating-EBIT line was not confirmed in the extract; flag for `06` to verify against the 10-Q segment note before running SOTP | 06 | If segment EBIT (not just gross profit) cannot be sourced, `06` should state the limitation and consider using segment revenue × a segment-appropriate EV/Sales multiple as a fallback, flagged low-confidence |
| No balance sheet / capital structure | N — full capital-structure data (debt, cash, minority interest, no preferred) present through Jun-30-2026 | 01, 04, 06 | Not applicable |
| No cash flow statement | N — cash-flow statement present FY2017–FY2025A (annual) and quarterly through Jun-30-2026 (enables LTM) | 04 | Not applicable |

No caps bind. This pool is unusually rich for valuation purposes — all five core inputs (price, estimates, peers, capital structure, cash flow) are present and current (0–1 month old, except the FY2025 segment split at ~7 months, which is normal for annual-only disclosure).

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Financials_Annual "Multiples" tab + Historical Capitalization tab give a full quarterly EV/market-cap and multiple history back to 2017 |
| Peer relative valuation | Y | None | 10 named peers (Ford, GM, Rivian, NVIDIA, Honda, Mercedes-Benz, Renault, Lucid, Kia, Stellantis) with LTM & NTM TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/E, P/TangBV in the Comparable Analysis workbook |
| Intrinsic DCF (Operating FCFF) | Y | None | CFO and capex both disclosed (Cash Flow tab, annual + quarterly); consensus provides the near-term forecast path; WACC inputs (rf, ERP, beta, cost of debt) must be sourced independently per MODULE_RULES DCF standard, but no filing-side blocker exists |
| Reverse DCF | Y (conditional on `04` running first) | None from the data pool itself — depends on `04`'s output per MODULE_RULES layer sequencing, not on data availability | Current price is pool-verified, so "what's priced in" is computable once `04` establishes the canonical WACC and normalized FCF base |
| SOTP | Partial | Segment operating EBIT (vs. gross profit) not yet confirmed | Two reportable segments exist (Automotive; Energy Generation and Storage) with revenue and gross-profit data; `06` should verify whether a segment operating-income line is disclosed in the 10-Q/10-K segment note before committing to a full SOTP build — if not found, a revenue-multiple-based SOTP is the fallback, flagged low-confidence per the Segment/SOTP Rule |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** All four sufficiency-rule ingredients are present and current — a usable earnings/cash-flow base (income statement AND cash flow through Jun-30-2026), capital-structure data (full net-debt bridge as of Jun-30-2026), a pool-verified current price ($319.69, 1 day old), AND multiple forward-looking/relative inputs (consensus estimates, forward multiples, and a 10-name peer comp set) — well beyond the "at least one" bar.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic DCF (Operating FCFF), reverse-DCF (after `04`), and SOTP (conditional — pending confirmation of segment operating EBIT; a revenue-multiple fallback is available if not found).
- **Active partial-data caps:** None — no MODULE_RULES.md Partial-Data or Score-Cap row is triggered by this pool.
- **Critical missing items:** None blocking. Two items for downstream agents to verify, not to treat as gaps: (1) confirm segment-level **operating EBIT** (not just gross profit before tax) in the 10-Q/10-K segment note before running SOTP — `06` should state explicitly whether it found this or is using the gross-profit/revenue-multiple fallback; (2) reconcile the CIQ "Shares Outstanding Latest" figure (3,949.5mm) against the Historical Capitalization tab's basic count (3,755.7mm at Jun-30-2026) and the 10-Q cover-page share count in `01` — the two differ by ~194mm shares and the discrepancy should be resolved (likely a more recent "as of filing date" count vs. the quarter-end balance-sheet count) rather than silently picked.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — TSLA

**Reporting standard:** US GAAP. **Reporting currency:** US Dollar (USD), figures in millions except per-share items. **Fiscal year end:** December 31. **Jurisdiction:** US SEC domestic filer (NasdaqGS:TSLA) — standard US form names apply directly [Form 10-Q, Jul-23-2026, cover page; valuation/00_valuation-data-triage.md §1A].

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | $319.69 | Company Comparable Analysis Tesla Inc .xls, Financial Data tab ("Day Close Price Latest") — cross-checked against Financials_Annual.xls, Historical Capitalization tab ("Pricing as of" column, last close = $319.69) | 2026-07-23 |
| Currency | USD | Same sources | — |
| Price basis | Last close (exchange close price, not intraday) | Company Comparable Analysis Tesla Inc .xls, Financial Data tab header ("Day Close Price Latest") | 2026-07-23 |

**Price state: `pool-verified`.** This price is a Capital IQ comparable-analysis export figure, cross-confirmed by a second independent CIQ tab (Historical Capitalization) showing the identical $319.69 close for the identical date. It is not a web quote and is not indicative.

**Price staleness (quantitative).** Run date is 2026-07-24; price as-of date is 2026-07-23. Age = 1 calendar day ≈ 1 trading day — well inside the 5-trading-day threshold. No refresh was needed and none was attempted; the price is fresh. No staleness cap applies to valuation confidence.

The export's own "As-Of Date" field (2026-07-24T00:00:00, i.e., the export/template date) is distinct from the quote's own dated close (2026-07-23) — the quote carries its own explicit as-of date, so this is not the "download-date-only" case; the price is `pool-verified` with a confirmed, dated as-of, not merely "unconfirmed."

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | 3,949,547,394 (≈3,949.5mm) | Form 10-Q (Jul-23-2026) cover page: "As of July 16, 2026, there were 3,949,547,394 shares of the registrant's common stock outstanding" — cross-confirmed by (a) the same 10-Q's balance sheet, "Common stock ... 3,949 ... shares issued and outstanding" as of June 30, 2026; (b) Tesla Inc NasdaqGS TSLA Public Ownership Summary.rtf, "Total ... 3,949,547,394"; (c) Company Comparable Analysis Tesla Inc .xls, Financial Data tab, "Shares Outstanding Latest" = 3,949.5mm |
| Diluted weighted-average shares (period) | 3,540mm (Q2 2026, three months ended Jun-30-2026); 3,538mm (six months ended Jun-30-2026) | Form 10-Q (Jul-23-2026), EPS reconciliation note: basic weighted-average 3,237mm (Q2) / 3,235mm (H1) + stock-based-awards dilution add of 303mm (Q2) / 303mm (H1) = diluted 3,540mm / 3,538mm |
| Options/RSUs count (if disclosed) | Not separately disclosed in this pool's extract | 10-Q references an "Equity Incentive Plans" note, but a detailed options/RSU-outstanding schedule with strike prices was not found in the extracted text; only the anti-dilutive-exclusion count (12mm, Q2 2026) and the basic-to-diluted weighted-average gap (303mm) are disclosed |
| Convertibles / potential shares (if disclosed) | $0 outstanding | Tesla Inc NasdaqGS TSLA Financials_Annual.xls, Capital Structure Summary tab — "Total Convertible Debt" = 0 for FY2024 and FY2025 (last convertible debt was $37mm in FY2023, now fully retired/converted) |
| **Fully diluted shares (approx., TSM proxy)** | **≈4,252.5mm** | Basic O/S (3,949.5mm) + a flat dilution addback of 303mm (the Q2 2026 income-statement basic-to-diluted weighted-average gap, applied as a proxy since no options/RSU strike schedule is available) + 0 convertibles. **Inference, not from filings** — see limitation below |
| Share count used for market cap | 3,949,547,394 (3,949.5mm) | Cover-page/balance-sheet count, per Fully Diluted Equity Rule 1 (most recent "as of" count, not the period weighted-average) |
| Share count used for per-share fair value | ≈4,252.5mm (approx. fully diluted) — limitation labeled | See note below |

**Material finding — CIQ's own "Historical Capitalization" tab is stale for the latest quarter.** That tab's Jun-30-2026 "Shares Out." column reads 3,755.723871mm (labeled "Dilution: Basic"), which is inconsistent with the 10-Q's own balance sheet figure for the identical date (3,949mm issued and outstanding) and with the cover page, Public Ownership Summary, and the Financial Data tab (all 3,949.5mm). The 10-Q's own statement of stockholders' equity explains the gap: shares outstanding rose from 3,755mm (Mar-31-2026) to 3,949mm (Jun-30-2026) — a 194mm-share increase in one quarter from "issuance of common stock for equity incentive awards and acquisitions, net of transaction costs" [Form 10-Q, Jul-23-2026, Condensed Consolidated Statement of Stockholders' Equity]. The Historical Capitalization tab's Jun-30-2026 column appears to have carried forward a prior-period share count rather than the quarter's actual balance-sheet figure — a vendor data-lag/bad-extraction issue on CIQ's side (not a real data gap; §20). **This report does not use the Historical Capitalization tab's Jun-30-2026 share count** for that reason; the 10-Q's own primary-source count (3,949.5mm), independently confirmed by three other sources, is used instead.

**Basic vs. fully diluted gap and its cause.** The 194mm-share increase concentrated late in Q2 2026 (tied to "equity incentive awards and acquisitions" per the filing) means the quarter's diluted weighted-average (3,540mm) sits BELOW the current point-in-time basic count (3,949.5mm) — a weighted average necessarily lags a large, back-loaded increase in the share base. Using the disclosed diluted weighted-average directly as the per-share-fair-value count would understate the current share base (a diluted count cannot legitimately be lower than the current basic count). This report therefore uses basic O/S plus a flat TSM-style dilution addback (303mm, the quarter's own basic-to-diluted gap) as the per-share-fair-value proxy (≈4,252.5mm), labeled **Inference, not from filings** — a genuine limitation, since no options/RSU outstanding-and-strike schedule was found in this pool to build a rules-based treasury-stock-method count. Downstream agents should treat the true fully diluted count as lying in the 3,950mm–4,300mm range pending that schedule, and should flag if a later filing's 10-K options/RSU note narrows it.

Only 12mm stock-based-award shares were anti-dilutive (excluded) in Q2 2026 — immaterial to the overall count.

## 3. Market Capitalization

`Market cap = share count × current price = 3,949,547,394 × $319.69 = $1,262,630.8mm (≈$1.263 trillion)`

This ties out exactly to Company Comparable Analysis Tesla Inc .xls, Financial Data tab, "Market Capitalization Latest" = $1,262,630.8mm [same source as price and share count above], confirming CIQ used the identical 3,949.5mm share count (not the stale Historical Capitalization figure).

## 4. Enterprise Value Bridge

| Component | Amount ($mm) | Source |
|---|---:|---|
| Market capitalization | 1,262,630.8 | Section 3 above |
| + Total debt (see breakdown below) | 16,080 | Tesla Inc NasdaqGS TSLA Financials_Annual.xls, Capital Structure Summary tab, "Total Debt Outstanding," period ended Jun-30-2026 |
| + Minority / non-controlling interest | 661 | Same source, "Total Minority Interest," Jun-30-2026 |
| + Preferred equity | 0 (none outstanding) | Same source ("Pref. Equity" = "-" every period shown); confirmed no preferred stock on the 10-Q balance sheet |
| + Operating lease liabilities | *(already included in Total Debt above — see breakdown)* | — |
| + Underfunded pension / other long-term obligations | Not applicable — no pension/OPEB disclosed | Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls, Pension/OPEB tab: "No Data Available" |
| − Cash & equivalents + ST investments (broad, canonical — see cash-quality test below) | (43,524) | Same Capital Structure Summary tab, "Total Cash & ST Investments," Jun-30-2026; also 10-Q, "we had $15.22 billion and $28.31 billion of cash and cash equivalents and short-term investments, respectively" |
| − Equity-method / strategic investments (NOT netted — see note) | — | See note below (SpaceX stake) |
| **= Enterprise value (EV)** | **1,235,847.8** | Ties exactly to Company Comparable Analysis Tesla Inc .xls, Financial Data tab, "Total Enterprise Value Latest" = 1,235,847.8 |

**Total debt breakdown (material disclosure — Total Debt is NOT "debt and finance leases" alone).** Tesla's own 10-Q balance sheet reports "Current portion of debt and finance leases" ($1,418mm) + "Debt and finance leases, net of current portion" ($7,924mm) = **$9,342mm** of debt and finance leases (the company's own filed line items). The CIQ $16,080mm "Total Debt" figure used above additionally folds in on-balance-sheet **operating lease liabilities** — "Operating lease liabilities, current portion" ($1,022mm) + "Operating lease liabilities" non-current ($5,716mm) = **$6,738mm** [Form 10-Q, Jul-23-2026, Condensed Consolidated Balance Sheet]. $9,342mm + $6,738mm = $16,080mm, reconciling exactly to the CIQ figure (also matching CIQ's own "Total Lease Liabilities" line of $7,019mm = $6,738mm operating + $281mm finance leases). **This report uses the $16,080mm figure (debt + finance leases + operating leases) as canonical**, for consistency with earnings/01_historical-financials.md's own net-debt figures (see Reconciliation Gate 1) — but the $9,342mm debt-and-finance-leases-only figure is the stricter filing-basis alternative and should be used instead if a downstream agent needs a leverage view that excludes capitalized operating leases. This is a disclosed, deliberate treatment, not a silent inflation.

**Cash quality check (before netting).** Of the $43,524mm "Cash & ST Investments" netted above: cash & equivalents ($15,219mm) consists of cash, CDs/time deposits, US government securities, commercial paper, and money-market funds — all disclosed by security type in the 10-Q's fair-value note, none of which are financial-subsidiary loan-book assets or long-tenor mark-to-market securities. Of the $28,305mm in short-term investments, $286mm (0.66% of the total, at Jun-30-2026) is disclosed as "held and restricted for our insurance business" [Form 10-Q, Jul-23-2026] — immaterial in size, so it is not carved out separately; EV is not shown "both ways" for this item because the restricted piece would move EV by <0.03%. Tesla's separate "Digital assets" line ($674mm, mostly Bitcoin) and its new $2.0 billion SpaceX equity stake (booked under "Long-term Investments," ~$3,007mm balance at Jun-30-2026, subject to sales restrictions until Dec-2026) are **NOT** part of "Cash & ST Investments" and are **NOT netted** into this EV bridge — they remain un-adjusted, non-operating assets sitting inside the equity side of the balance sheet. This is a disclosed adjustment NOT made; a downstream agent choosing to treat the SpaceX stake as a separately-valued non-operating asset should net it out of EV explicitly and cite this paragraph.

**Adjustments NOT made:** pensions/OPEB (none disclosed — not applicable, not merely omitted); the SpaceX equity-method-like investment and Bitcoin holding (named above, left inside the balance sheet rather than carved out of EV).

## 5. Net Debt & Leverage Snapshot

| Metric | Value ($mm) | Source |
|---|---:|---|
| Total debt (canonical, incl. finance + operating leases) | 16,080 | Capital Structure Summary tab, Jun-30-2026 |
| Total debt (filing-basis, debt + finance leases only, excl. operating leases) | 9,342 | Form 10-Q balance sheet, Jun-30-2026 |
| Cash & equivalents only | 15,219 | Form 10-Q balance sheet / Capital Structure Summary tab |
| Cash & ST investments (broad) | 43,524 | Same |
| **Net debt — strict basis** (Total debt canonical − cash & equiv. only) | **861** (net debt) | 16,080 − 15,219 = 861; matches earnings/01_historical-financials.md's own strict figure exactly |
| **Net debt — broad basis** (Total debt canonical − cash & ST investments) | **(27,444)** (net cash) | 16,080 − 43,524 = −27,444; matches CIQ's own "LTM Net Debt" field and earnings/01's broad figure |
| Net debt (strict) / LTM EBITDA | 0.08x | 861 / 10,755 (LTM EBITDA, GAAP-basis: Op. Income + D&A, per CIQ) [Company Comparable Analysis Tesla Inc .xls, Financial Data tab, "LTM EBITDA," period through Jun-30-2026] |
| Net debt (broad) / LTM EBITDA | (2.55x) (net cash position) | −27,444 / 10,755 |

Both bases are shown per CLAUDE.md §15 hygiene: the **strict** basis nets only cash & equivalents; the **broad** basis also nets short-term investments. Given the cash-quality check above (the ST-investment book is genuine, short-maturity, investment-grade paper with only a 0.66% restricted sliver), the broad basis is a reasonable reflection of true liquidity, but the strict basis is shown alongside per the hard rule and is the more conservative read — under the strict basis Tesla has flipped to a small net-debt position ($861mm) as of Jun-30-2026, a reversal from net cash in every prior year shown in the Historical Capitalization tab back to FY2021.

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | $21.99 | Total Common Equity $86,858mm ÷ 3,949mm basic shares (Jun-30-2026) [Capital Structure Summary tab / Form 10-Q balance sheet] — ties exactly to CIQ's own "LTM Tangible Book Value/Share" of $21.99 |
| Tangible book value per share | $21.99 (≈ book value per share) | Goodwill and other intangibles are effectively zero/not separately disclosed on Tesla's recent balance sheet, so tangible book value ≈ book value here [Financials_Quarterly.xls, Balance Sheet tab] |
| Net cash per share (broad basis) | $6.95 | $27,444mm net cash ÷ 3,949.5mm shares |
| Net debt per share (strict basis) | $0.22 (net debt) | $861mm net debt ÷ 3,949.5mm shares |

## 7. Anchor Summary (canonical numbers for downstream agents)

- **Current price: $319.69, as-of 2026-07-23 (last close), `pool-verified`.** Fresh (1 calendar day old); no staleness cap applies.
- **Share counts:** market-cap count = 3,949,547,394 (cover-page/balance-sheet, confirmed by three independent sources); per-share fair-value count = ≈4,252.5mm (approximate fully diluted, TSM-proxy, labeled inference — no options/RSU strike schedule was found in this pool).
- **Market cap: $1,262,630.8mm** (≈$1.263 trillion).
- **Enterprise value: $1,235,847.8mm** (broad cash basis, canonical) — or **$1,264,152.8mm** if only cash & equivalents (not short-term investments) are netted (strict basis).
- **Net debt: $861mm (strict basis, net debt) / −$27,444mm (broad basis, net cash)** — both at Jun-30-2026.
- **Reporting currency: USD.**
- **Key caveats:** (1) per-share fair-value share count is an approximation pending a full options/RSU outstanding-and-strike schedule; (2) CIQ's Historical Capitalization tab is stale for the latest quarter and must not be used for Jun-30-2026 share count; (3) Total Debt of $16,080mm includes $6,738mm of on-balance-sheet operating lease liabilities — the filing's own "debt and finance leases" line is $9,342mm; (4) the SpaceX equity stake (~$3,007mm) and Bitcoin holding ($674mm) are not netted into EV.

### Anchor Block (copy-forward)

- Price: $319.69 (2026-07-23, last close)
- Price-state: pool-verified
- Currency: USD
- Shares (market cap): 3,949,547,394 (Form 10-Q cover page, Jul-16-2026, cross-confirmed by balance sheet, Public Ownership Summary, and CIQ Financial Data tab)
- Shares (per-share fair value): ≈4,252.5mm (approximate fully diluted — basic O/S + 303mm TSM-proxy dilution addback; limitation: no options/RSU strike schedule found in pool — Inference, not from filings)
- Market cap: $1,262,630.8mm
- Net debt: $861mm (strict basis) / −$27,444mm (broad basis, net cash) — both at Jun-30-2026; canonical Total Debt of $16,080mm includes $6,738mm of operating lease liabilities (filing-only debt + finance leases = $9,342mm)
- EV: $1,235,847.8mm (broad cash basis, canonical) / $1,264,152.8mm (strict cash basis)
- Key caveats: approximate (not schedule-based) fully diluted share count; CIQ Historical Capitalization tab's Jun-30-2026 share count (3,755.7mm) is stale/wrong and was not used; Total Debt figure bundles operating lease liabilities — shown separately above; SpaceX stake and Bitcoin holding not netted into EV.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — TSLA

**Reporting currency: USD.** All anchor numbers (price, shares, market cap, EV, net debt) are taken verbatim from `01_price-and-capital-structure.md`: current price **$319.69** (2026-07-23, last close, `pool-verified`); market-cap share count **3,949,547,394**; approximate fully diluted (per-share fair-value) share count **≈4,252.5mm** (inference, no options/RSU strike schedule in pool); market cap **$1,262,630.8mm**; enterprise value **$1,235,847.8mm** (broad cash basis, canonical — netting cash & short-term investments); net debt **$861mm (strict)** / **−$27,444mm net cash (broad)**, both at Jun-30-2026 [`valuation/01_price-and-capital-structure.md`, §7].

Business type: Operating company (EV manufacturer + energy + services). Per the Business-Type Method Map, EV-based multiples (EV/Sales, EV/EBITDA, EV/EBIT), P/E, and FCF yield/P-FCF are the primary reads; P/Book is shown as a supplementary cross-check, not primary, for this asset-light-trending operating business.

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| EV / Sales | LTM | Revenue $103,619mm | **11.9x** | EV $1,235,847.8mm ÷ $103,619mm; ties to Financials_Annual.xls, Multiples tab, "TEV/LTM Total Revenue," Close, 2026-07-23 = 11.927x, and to Company Comparable Analysis Tesla Inc .xls, Trading Multiples tab, "TEV/Total Revenues LTM" = 11.9, As-Of 2026-07-24 |
| EV / Sales | NTM | NTM Revenue $110,859.9mm | **11.2x** | Tesla,IncNasdaqGSTSLAEstimatesReport.xls, Multiples tab, "NTM TEV/REV" = 11.148 |
| EV / EBITDA (GAAP, reported: Op. Income + D&A) | LTM | EBITDA $10,755mm | **114.9x** | EV $1,235,847.8mm ÷ $10,755mm = 114.9x; ties exactly to Financials_Annual.xls, Multiples tab, "TEV/LTM EBITDA," Close, 2026-07-23 = 114.909x. **Reconciliation flag:** Company Comparable Analysis Tesla Inc .xls, Trading Multiples tab shows a conflicting "TEV/EBITDA LTM" of 97.7 for the same company/date — the other three LTM multiples on that identical row (EV/Revenue 11.9, EV/EBIT 288.9, P/TangBV 14.5) all reconcile exactly to the anchor, so this is treated as a vendor inconsistency isolated to that one cell, not used here. Flagged, not silently overridden (CLAUDE.md §5) |
| EV / EBITDA | NTM | NTM EBITDA $17,331.0mm | **71.3x** | EstimatesReport.xls, Multiples tab, "NTM TEV/EBITDA" = 71.308; ties to Company Comparable Trading Multiples "NTM TEV/Forward EBITDA" = 71.31 |
| EV / EBIT | LTM | EBIT $4,278mm | **288.9x** | EV $1,235,847.8mm ÷ $4,278mm = 288.9x; ties to Financials_Annual.xls, Multiples tab, "TEV/LTM EBIT," Close, 2026-07-23 = 288.884x, and Company Comparable Trading Multiples "TEV/EBIT LTM" = 288.9 |
| EV / EBIT | NTM | — | **214.0x** | EstimatesReport.xls, Multiples tab, "NTM TEV/EBIT" = 213.957 |
| P / E (GAAP diluted) | LTM | EPS $1.08 | **296.1x** | $319.69 ÷ $1.08 = 296.0x; ties to Financials_Annual.xls, Multiples tab, "P/LTM EPS," Close, 2026-07-23 = 296.111x, and Company Comparable Trading Multiples "P/Diluted EPS Before Extra LTM" = 296.1 |
| P / E | NTM | NTM EPS $1.91 | **167.6x** | EstimatesReport.xls, Multiples tab, "NTM Forward P/E" = 167.596; Company Comparable Trading Multiples "NTM Forward P/E" = 167.6 |
| P / E | FY2026 (consensus) | FY2026E EPS (implied) | **174.9x** | EstimatesReport.xls, Multiples tab, "FY 2026 Price/Earnings" = 174.907 |
| P / Book (tangible ≈ book — negligible intangibles) | LTM | BVPS $21.99 | **14.5x** | $319.69 ÷ $21.99 = 14.5x; ties to Company Comparable Analysis, Trading Multiples tab, "P/TangBV LTM" = 14.5. **Reconciliation flag:** the Financials_Annual.xls Multiples tab's own quarterly "P/BV" time series shows a Close value of 11.914x for the identical 2026-07-23 date — inconsistent with both the anchor calc and the Company Comparable cross-check. Given `01`'s own finding that CIQ's Historical Capitalization tab carries a stale Jun-30-2026 share count for this company, this looks like the same vendor data-lag issue bleeding into the Multiples tab's final (partial) quarter column. Flagged; 14.5x is used as the reconciled figure |
| P / FCF (FCF = CFO − capex, per company's own definition) | LTM | FCF $5,762mm ($18,685mm CFO − $12,923mm capex) | **219.1x** | Market cap $1,262,630.8mm ÷ $5,762mm; FCF figure from `earnings/01_historical-financials.md` §1 (LTM/TTM table) |
| FCF yield | LTM | — | **0.46%** | $5,762mm ÷ $1,262,630.8mm |
| Dividend yield | — | — | **N/A — no dividend paid** | Tesla has never declared or paid a common dividend; no dividend line item found in Financials_Annual.xls or the Form 10-Q [Form 10-Q, Jul-23-2026; Financials_Annual.xls, Income Statement / Supplemental tabs] |

## 2. Historical Multiple Bands (3–5 years)

Basis: quarterly close-of-quarter multiples, 2021-Q2 through 2026-Q2 (22 quarterly observations) plus the current 2026-07-23 spot value, from Tesla Inc NasdaqGS TSLA Financials_Annual.xls, Multiples tab (quarterly frequency, "Close" row) [data through 2026-07-23]. P/FCF band uses annual fiscal-year-end market cap ÷ annual FCF, FY2021–FY2025 (5 observations), from Financials_Annual.xls Historical Capitalization tab (year-end market cap) and `earnings/01_historical-financials.md` (annual FCF), because no clean quarterly FCF series is available in this pool.

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| EV / Sales (LTM) | 5.01x | 12.15x | 11.50x | 22.61x | 11.93x | 39% |
| EV / EBITDA (LTM) | 22.36x | 78.76x | 65.66x | 138.70x | 114.91x | 80% |
| EV / EBIT (LTM) | 30.23x | 134.68x | 105.94x | 288.88x | 288.88x | 100% |
| P / E (LTM, GAAP diluted) | 37.97x | 117.24x | 85.58x | 296.11x | 296.11x | 100% |
| P / Book (LTM) | 8.94x | 18.98x | 17.26x | 39.22x | 14.5x | 18% |
| P / FCF (annual, FY21–FY25) | 72.49x | 213.51x | 196.01x | 359.54x | 219.13x | 51% |

Note on the EV/EBIT and P/E bands: the EV/EBIT quarterly series has several "NM" (not-meaningful) quarters in 2025Q4–2026Q1 that CIQ excludes from its own average/high/low/close calculation (likely a denominator-timing quirk); the band above uses the 19 valid quarters. The P/E series is NM for all quarters before 2022-Q1 (small/negative-EPS base in Tesla's early scaling years) and is built from the 16 valid quarters since. Both are labeled: fewer usable data points than the EV/Sales, EV/EBITDA, and P/Book bands (22 quarters each).

**Current sits at or above the historical maximum on EV/EBIT and P/E** — this is a genuine ceiling print, not a rounding artifact: on EV/EBIT the current 288.88x quarter is itself the new high of the 5-year window (barely above the prior 2021-Q2 high of 288.06x); on P/E the current 296.11x is likewise the new high (above the prior 2025-Q3 high of 265.12x).

## 3. Re-Rating / De-Rating Read

**EV/Sales — roughly mid-range, not re-rated.** Current 11.9x sits 1.8% below its own 5-year mean (12.15x) and 3.7% above its own median (11.50x) — essentially in line with its own history, the least distorted read available (Section 2 percentile: 39th). **P/Book — trading at a discount to its own history.** Current 14.5x is 23.6% below its own mean (18.98x) and 16.0% below its own median (17.26x); book value has compounded every year (retained earnings) while the multiple applied to it has come down. **EV/EBITDA, EV/EBIT, and P/E all sit at or above their own 5-year ceiling** — EV/EBITDA is 45.9% above its own mean (78.76x) and 75.0% above its own median (65.66x); EV/EBIT is 114.5% above its own mean and 172.6% above its own median; P/E is 152.6% above its own mean and 246.0% above its own median. The most likely reason is NOT that the price has made a new high in isolation — Tesla's price today ($319.69) sits below its own 2025-Q3/Q4 levels (the Historical Capitalization tab shows quarter-end closes of $448.98 and $416.56 in 2025-Q3/Q4) — but that the earnings base collapsed under it: GAAP EBIT margin fell from a 16.8% FY2022 peak to 4.1% LTM, and GAAP diluted EPS fell from a $4.30 FY2023 peak to $1.08 LTM, a 70%+ decline over three years, per `earnings/01_historical-financials.md` §1. A shrunk denominator against a still-large price is arithmetically a "re-rating" on the earnings-based multiples even without the market paying up for the same dollar of earnings — this is a denominator-compression story more than a pure valuation-expansion story, and it means these three multiples are the LEAST reliable own-history anchors for this company right now.

## 4. Implied Value from Reversion

Bridge convention (mirrors `01`'s canonical broad-basis EV bridge): implied market cap = implied EV − total debt ($16,080mm) − minority interest ($661mm) + cash & ST investments ($43,524mm) = implied EV + $26,783mm. Per-share values use the ≈4,252.5mm approximate fully diluted share count (`01`'s per-share fair-value count), except P/E and P/FCF-per-share reversions, which apply the multiple directly to the per-share metric.

| Multiple | Reversion Target (mean / median) | Implied EV or Equity Value | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| EV / Sales | Mean 12.15x | EV $1,258,971mm / Equity $1,285,754mm | $302.4 | −5.4% |
| EV / Sales | Median 11.50x | EV $1,191,619mm / Equity $1,218,402mm | $286.5 | **−10.4%** |
| EV / EBITDA | Mean 78.76x | EV $847,064mm / Equity $873,847mm | $205.5 | −35.7% |
| EV / EBITDA | Median 65.66x | EV $706,173mm / Equity $732,956mm | $172.4 | −46.1% |
| EV / EBIT | Mean 134.68x | EV $576,161mm / Equity $602,944mm | $141.8 | −55.6% |
| EV / EBIT | Median 105.94x | EV $453,211mm / Equity $479,994mm | $112.9 | −64.7% |
| P / E | Mean 117.24x | — (direct per-share) | $126.6 | −60.4% |
| P / E | Median 85.58x | — (direct per-share) | $92.4 | −71.1% |
| P / Book | Mean 18.98x | — (direct per-share) | $417.4 | +30.6% |
| P / Book | Median 17.26x | — (direct per-share) | $379.5 | +18.7% |
| P / FCF | Mean 213.51x | — (direct per-share, FCF/share $1.355) | $289.3 | −9.5% |
| P / FCF | Median 196.01x | — (direct per-share) | $265.6 | −16.9% |

**Base-case point (named): EV/Sales, own-median (11.50x) → implied price ≈ $286.5/share, −10.4% vs the current $319.69.** EV/Sales is named as the most reliable multiple here because it is the least distorted by the LTM margin/earnings collapse documented in Section 3 — it does not require assuming that Tesla's compressed EBIT margin (4.1% LTM vs. 16.8% FY2022 peak) or its GAAP EPS (down 70%+ from its FY2023 peak) reverts to old levels, only that revenue at its own historical sales multiple prices the business.

**Dispersion across the twelve reversion outputs above is enormous: $92.4/share (P/E, median) to $417.4/share (P/Book, mean)** — a >4.5x spread, i.e. this is the finding, not noise to be averaged away (CLAUDE.md §16, module Core Principle 2). The earnings-based multiples (EV/EBITDA, EV/EBIT, P/E) all imply large downside from reversion because they assume Tesla's margin/EPS base normalizes back up toward its own mean/median WITHOUT the multiple itself also normalizing — an internally inconsistent assumption once the denominator issue in Section 3 is taken into account (reverting a distorted multiple to its own mean, on a distorted metric, does not net out cleanly). P/Book implies material upside because the multiple has structurally compressed even as book value grew — a discount that could be resolved either by the multiple re-expanding (upside) or by the market simply not crediting near-term book-value growth (i.e., staying cheap on this basis).

**Reversion assumption check: NOT clearly supported for the earnings-based multiples.** Reverting EV/EBITDA, EV/EBIT, or P/E to their own means/medians implicitly assumes either (a) the multiple itself should shrink toward history while margins stay depressed (the reversion-to-mean-multiple case, which argues for a LOWER price, shown above), or (b) margins recover and the multiple stays high (not modeled here — that is `04_intrinsic-dcf`'s and `earnings/03_margin-drivers`' job, not this agent's). The management-governance module's own read (`99_management-governance-synthesis.md`) found the current management has not delivered per-share value from a doubling of invested capital (EBIT fell 33% and diluted EPS fell 70% since FY2021–FY2025) and has not repurchased shares despite positive FCF every year — this is a caution against assuming a clean, management-driven margin recovery is the mechanism that resolves the earnings-based multiples' current richness. RF-OWN-004 (structurally unaligned controlling owner, §24 Filter 6) was tested and **not triggered** for Tesla [`management-governance/99_management-governance-synthesis.md`], so no structural value-trap discount applies here — but the governance module's "Serious governance concerns" verdict (Governance Score 43/100, capital allocation concerns) is a real caveat on whether reversion to the OLD (2021–2022, high-margin) mean is a management-delivered outcome versus a market-priced hope.

## 5. Own-History Read

Tesla trades at or above the ceiling of its own 5-year range on EV/EBIT (288.9x, 100th percentile) and P/E (296.1x, 100th percentile), roughly mid-range on EV/Sales (39th percentile, −1.8% to its own mean), and at a discount on P/Book (18th percentile, −23.6% to its own mean) — the own-history read is not uniform, and averaging it into one verdict would hide the real story. The most defensible single reversion read — EV/Sales to its own median — implies about $286.5/share, a 10.4% de-rate from today's $319.69; the wider cross-multiple dispersion ($92 to $417/share) shows how sensitive this stock's own-history multiples are to which earnings line is used, because the earnings line itself has collapsed (GAAP EBIT margin 16.8%→4.1%, GAAP diluted EPS $4.30→$1.08 since 2022/2023 peaks) while the price has not fallen nearly as far. The single biggest caveat: the earnings-based multiples "look rich versus own history" mostly because the denominator shrank, not because the market is paying more for a stable dollar of earnings — reverting those specific multiples to their old mean assumes either the multiple compresses further (bearish) or margins recover to old levels first (a call this module does not make; see `earnings/03_margin-drivers` and `04_intrinsic-dcf`), and the management-governance module's own finding of no delivered per-share value creation and zero buybacks despite positive FCF is a reason for caution before assuming that recovery is management-driven.



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — TSLA

**Anchor (from `01_price-and-capital-structure.md`):** Price $319.69, as-of 2026-07-23, `pool-verified`. Market cap $1,262,630.8mm (3,949.5mm shares). EV $1,235,847.8mm (broad-cash-basis, canonical). Per-share fair-value share count ≈4,252.5mm (approximate fully diluted, TSM-proxy — Inference, not from filings).

## 1. Peer Set

The peer set comes from TWO sources, both used here: (a) the Capital IQ "Quick Comparable Analysis" export in the data pool (`Company Comparable Analysis Tesla Inc .xls`), which is CIQ's own default comp set for TSLA sorted by its proprietary relevancy score; and (b) `business-model/08_competitive-map.md`, which names Ford, GM, and BYD specifically from Tesla's own competitive position (BYD is not in the CIQ export and is web-sourced here). The CIQ export lists 10 peer companies plus Tesla ("Displaying 11 Companies"). One of the 10 (NVIDIA) is flagged below as not a genuine business comparable and is excluded from the "core" median used for the premium/discount and implied-value work in Sections 3–5; it is shown for reference only.

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Ford Motor Company | NYSE:F | US/global light-vehicle manufacturer, growing EV lineup (Mach-E, F-150 Lightning), competes directly with Tesla Automotive in North America [`08_competitive-map.md` §2] | Competitive-map (named) + CIQ default comp set |
| General Motors Company | NYSE:GM | US/global light-vehicle manufacturer with own EV lineup and large China JV presence, competes with Tesla Automotive in North America and China [`08_competitive-map.md` §2] | Competitive-map (named) + CIQ default comp set |
| BYD Company Limited | HKEX:1211 | The volume leader in global battery-electric vehicles — 2.26mm BEV units in 2025 vs Tesla's 1.64mm, 12.1% global BEV share vs Tesla's 8.8% [`08_competitive-map.md` §2, §3] | Competitive-map (named); **not in the CIQ export** — sourced from the web (`stockanalysis.com`, accessed 2026-07-24, unverified) |
| Honda Motor Co., Ltd. | TSE:7267 | Global light-vehicle manufacturer with an expanding EV/hybrid lineup, overlaps Tesla Automotive in multiple regions [`Company Comparable Analysis Tesla Inc .xls`, Business Description tab] | CIQ default comp set |
| Mercedes-Benz Group AG | XTRA:MBG | Premium global vehicle manufacturer with its own EV lineup (EQ series), overlaps Tesla's premium-price-point Automotive segment | CIQ default comp set |
| Renault SA | ENXTPA:RNO | Global light-vehicle manufacturer with EV models (Megane E-Tech, Scenic E-Tech), European-market overlap | CIQ default comp set |
| Kia Corporation | KOSE:A000270 | Global light-vehicle manufacturer with a fast-growing dedicated EV lineup (EV6, EV9), direct price-point overlap in several markets | CIQ default comp set |
| Stellantis N.V. | BIT:STLAM | Multi-brand global light-vehicle manufacturer (Jeep, Peugeot, Fiat, Ram) building out an EV transition, overlaps Tesla Automotive globally | CIQ default comp set |
| Rivian Automotive, Inc. | NasdaqGS:RIVN | US EV pure-play (trucks/SUVs), closest business-model analog to Tesla among the CIQ set (single-segment BEV manufacturer, pre-scale) | CIQ default comp set |
| Lucid Group, Inc. | NasdaqGS:LCID | US EV pure-play (luxury sedans/SUVs), same business-model analog as Rivian, earlier-stage and smaller | CIQ default comp set |
| NVIDIA Corporation | NasdaqGS:NVDA | **Flagged, not treated as a core peer.** A semiconductor/AI-compute company, not a vehicle manufacturer; included in CIQ's default set likely on relevancy-score/market-cap or AI-narrative grounds, not shared business economics. Shown in Section 2 for reference; excluded from the "core" peer median used in Sections 3–5 | CIQ default comp set (flagged exclusion) |

**No private peers requiring exclusion.** All named and CIQ-listed peers are publicly traded with disclosed multiples (BYD's via web, all others via the pool). The one limitation is BYD's absence from the pool's own CIQ export — the single most important competitor by BEV volume [`08_competitive-map.md` §5] has to be sourced externally and is labeled accordingly throughout.

## 2. Peer Multiples & Operating Stats

All figures data-as-of 2026-07-24 unless noted (BYD row: web-sourced, accessed 2026-07-24). LTM basis unless marked NTM. Source for all rows except BYD and the TSLA "reconciled" EV/EBITDA note: `Company Comparable Analysis Tesla Inc .xls`, Trading Multiples / Financial Data / Operating Statistics tabs.

| Company | P/E (LTM) | EV/EBITDA (LTM) | EV/EBIT (LTM) | EV/Sales (LTM) | FCF Yield | Rev Growth (LTM YoY) | EBITDA Margin (LTM) | ROIC | Total Debt/EBITDA (gross) | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **TSLA** | 296.1x | **114.9x** (reconciled — see flag below; CIQ's own Trading Multiples tab shows 97.7x) | 288.9x | 11.9x | 0.46% (TTM FCF $5,762M ÷ mkt cap $1,262,630.8M — own calc, `earnings/01`) | +11.75% | 10.4% | 2.75% (CIQ) / 3.15%–3.74% (own calc, `09_moat.md`) | 1.3x | 2026-07-23 |
| Ford (F) | NM | 36.0x | NM | 1.0x | Not disclosed in pool | +3.82% | 4.0% | Not disclosed in pool | 18.8x | 2026-04-30 |
| GM | 40.6x | 10.8x | 18.0x | 1.0x | Not disclosed in pool | −1.10% | 8.9% | Not disclosed in pool | 7.6x | 2026-07-21 |
| BYD (1211.HK) | 26.06x (web) | 7.23x (web) | Not sourced | 1.05x (web) | −11.07% (web — heavy 2026 capex, not steady-state) | Not sourced (LTM) | Not sourced | Not disclosed | Not sourced | 2026-07-24, **web-sourced, unverified** (stockanalysis.com) |
| Honda (7267) | NM | 16.1x | NM | 0.7x | Not disclosed in pool | +0.50% | 4.6% | Not disclosed in pool | 12.8x | 2026-06-18 |
| Mercedes-Benz (MBG) | 8.7x | 9.8x | 15.8x | 0.9x | Not disclosed in pool | −8.64% | 8.5% | Not disclosed in pool | 8.5x | 2026-04-29 |
| Renault (RNO) | NM | 14.8x | 42.8x | 1.0x | Not disclosed in pool | +3.01% | 10.4% | Not disclosed in pool | 11.4x | 2026-03-18 |
| Kia (A000270) | 7.2x | 2.6x | 3.4x | 0.3x | Not disclosed in pool | +5.83% | 9.7% | Not disclosed in pool | 0.2x | 2026-05-15 |
| Stellantis (STLAM) | NM | NM | NM | 0.2x | Not disclosed in pool | +3.76% | −0.7% | Not disclosed in pool | NM | 2026-04-30 |
| Rivian (RIVN) | NM | NM | NM | 4.4x | Not disclosed in pool | +10.43% | −54.9% | Not disclosed in pool | NM | 2026-04-30 |
| Lucid (LCID) | NM | NM | NM | 5.3x | Not disclosed in pool | +61.03% | −234.9% | Not disclosed in pool | NM | 2026-05-05 |
| NVIDIA (NVDA) — *flagged, not core* | 32.0x | 30.2x | 30.9x | 19.8x | Not disclosed in pool | +70.68% | 65.3% | Not disclosed in pool | 0.1x | 2026-05-20 |
| **Core peer median (9, excl. NVDA, excl. BYD — pool-sourced only)** | 23.9x (n=3: GM, Kia, +BYD would change this — see below) | 10.8x | 16.9x | 1.0x | n/a | 3.76% | 4.6% | n/a | 9.95x | 2026-07-24 |
| **Core peer median (10, excl. NVDA, incl. BYD)** | 26.06x | 10.8x | 16.9x | 1.0x | n/a | 3.76% | 4.6% | n/a | 9.95x | 2026-07-24 |
| **CIQ full-set median (10, incl. NVDA, per CIQ's own Summary Statistics row)** | 20.3x | 14.8x | 18.0x | 1.0x | n/a | 3.79% | 6.5% | n/a | 8.5x | 2026-07-24 |

**Material finding — internal CIQ inconsistency on TSLA's own LTM EV/EBITDA (flag, not silently overridden).** The Company Comparable Analysis export's own Trading Multiples tab shows TSLA's TEV/EBITDA LTM as 97.7x. Recomputing directly from the SAME workbook's Financial Data tab (EV $1,235,847.8mm ÷ LTM EBITDA $10,755mm) gives 114.9x — a materially different number using the export's own inputs. This 114.9x figure is independently confirmed by a second CIQ export, `Tesla Inc NasdaqGS TSLA Financials_Annual.xls`, Multiples tab, which shows "TEV/LTM EBITDA — Close" = 114.90914x for the identical date (2026-07-23) [`Tesla-Inc-NasdaqGS-TSLA-Financials_Annual__Multiples.txt`, row "TEV/LTM EBITDA — Close", 2026-07-23 column]. Two independent CIQ sources agree on 114.9x against the Comparable Analysis export's own Trading Multiples tab showing 97.7x for the same company, same date, same underlying EV and EBITDA figures published two tabs away in the same file — a vendor bad-extraction/inconsistency (CLAUDE.md §20), not a genuine difference in period or definition. **114.9x is used as canonical for TSLA's own LTM EV/EBITDA throughout this report; the peer-side EV/EBITDA figures in the same Trading Multiples tab were not independently re-derivable for each peer company in this pool and are used as-published — a labeled limitation.**

**FCF yield, ROIC, and revenue growth are not disclosed for the CIQ peer set in this pool** (only price, share count, EV, LTM/NTM revenue-EBITDA-EBIT-EPS, and the ratio set shown above are in the export). BYD's FCF yield (−11.07%) is heavily negative because of the company's 2026 capex ramp — not comparable to a steady-state read — and is shown for completeness, not used in the premium/discount math below (Section 3) given no matching CIQ-peer FCF-yield data exists to build a peer median.

## 3. Premium / Discount to Peer Median

Using the **core peer median (10 companies, excl. NVDA, incl. BYD where sourced)** as the reference. Positive = TSLA trades at a premium to the peer median.

| Multiple | Company (TSLA) | Peer Median (core) | Premium / (Discount) |
|---|---:|---:|---:|
| P/E, LTM | 296.1x | 26.06x (n=3 usable: GM, Kia, BYD — most peers NM on negative/thin LTM earnings) | **+1,036%** |
| EV/EBITDA, LTM (reconciled) | 114.9x | 10.8x | **+964%** |
| EV/EBIT, LTM | 288.9x | 16.9x | **+1,610%** |
| EV/Sales, LTM | 11.9x | 1.0x | **+990%** |
| P/Tangible BV, LTM | 14.5x | 1.2x | **+1,108%** |
| EV/Sales, NTM (forward) | 11.15x | 0.93x (n=9, excl. NVDA; BYD forward EV/Sales not sourced) | **+1,099%** |
| EV/EBITDA, NTM (forward) | 71.31x | 7.68x | **+828%** |
| Forward P/E, NTM | 167.6x | 6.93x (median of 8, incl. BYD's web-sourced forward P/E of 17.1x) | **+2,321%** |

**Is the gap typical or unusual? Not assessable.** The data pool contains only a single point-in-time snapshot of peer multiples (the Company Comparable Analysis export, "As-Of Date: 2026-07-24"). No historical time series of peer-relative multiples (TSLA's multiple against this same peer set at prior dates) exists in the pool, and a reliable, apples-to-apples multi-year peer-comp history is not practically reconstructable from web sources within this agent's scope. This report cannot say whether the current ~800–2,300% premium is wider or narrower than TSLA's typical premium to these peers over the past ~3 years — it can only report the current-point-in-time gap. This is a genuine data gap, not invented.

## 4. Is the Gap Warranted?

Two of the underlying business-model findings cut in opposite directions, and the honest read is that neither supports a premium anywhere near what is observed. On the positive side, Tesla's LTM gross margin (18.9%) and LTM EBITDA margin (10.4%) sit above the core peer median (12.85% gross margin implied from Operating Statistics; 4.6% EBITDA margin), LTM revenue growth (+11.75%) beats the peer median (+3.76%), and leverage is far lower (Total Debt/Capital 15.5% vs. peer median ~54%, Total Debt/EBITDA 1.3x vs. peer median ~10.0x) [`Company Comparable Analysis Tesla Inc .xls`, Operating Statistics tab; `01_price-and-capital-structure.md` §5] — real, evidenced advantages that argue for some premium. On the negative side, `09_moat.md` found **"No moat proven"**: Tesla's return on capital (2.75%–3.74% LTM, and only 8.3%–9.4% even on the more forgiving 5-year through-cycle average) sits below its estimated ~11.5% cost of capital by 210–885 basis points on every basis computed, and `07_business-quality.md` scored the aggregate quality **33/100 (Weak)**, anchored by margin stability (22/100 — operating margin has fallen every year for three straight years, from 16.8% in FY2022 to 4.1% LTM) and a "losing" competitive position against BYD on full-year-2025 global BEV volume share (8.8% vs. BYD's 12.1%) [`08_competitive-map.md` §3]. A ~900–2,300% multiple premium is not warranted by a business whose own moat module concludes its structural advantages "have not translated into economic value creation" and whose quality score sits in the bottom third of the scoring band. **Verdict: premium is unjustified (relative downside) on the disclosed automotive/EV business as currently measured** — with the explicit caveat that none of the named peers (Ford, GM, BYD, Honda, Mercedes-Benz, Renault, Kia, Stellantis, Rivian, Lucid) carries a comparable disclosed bet on autonomous driving (FSD/robotaxi) or humanoid robotics (Optimus), so a peer-multiple lens cannot price whatever optionality the market may be assigning to those unmonetized, zero-disclosed-revenue-line initiatives [`07_business-quality.md` row: Industry rate-of-change; `09_moat.md` §2, Technology/IP row] — that valuation question belongs to `04_intrinsic-dcf` / `06_sum-of-the-parts`, not to this peer-comp module.

## 5. Implied Value from Peer Multiples

**Quality adjustment applied (base case).** Given the genuine (but modest) evidenced advantages — higher gross/EBITDA margin, faster growth, far lower leverage — against the "no moat proven" / weak-quality-score evidence, a **1.3x NTM EV/Sales multiple** is used as the warranted base case: a 40% premium to the core peer median of 0.93x NTM EV/Sales, crediting the margin/growth/leverage edge but explicitly rejecting anything near the ~11–12x actually observed. EV/Sales is used as the named primary multiple because it is the least distorted by Tesla's currently near-zero net margin and thin LTM EPS base (the P/E and EV/EBIT multiples swing to extreme values on small denominators and are shown only as dispersion, not as the primary basis). This premium choice is **Inference, not from filings.**

| Multiple | Applied Peer Multiple | Implied EV or Equity | Implied Price/Share | vs Current Price ($319.69) |
|---|---:|---:|---:|---:|
| **NTM EV/Sales — quality-adjusted (BASE CASE, named primary)** | **1.3x** (peer median 0.93x × 1.4 premium) | EV $144,117.9M → Equity $170,900.9M | **$40.19** | **−87.4%** |
| NTM EV/Sales — raw peer median (no premium; sanity check) | 0.93x | EV $103,099.7M → Equity $129,882.7M | $30.54 | −90.4% |
| LTM EV/Sales — raw peer median | 1.0x | EV $103,619.0M → Equity $130,402.0M | $30.67 | −90.4% |
| NTM EV/EBITDA — raw peer median | 7.68x | EV $133,062.2M → Equity $159,845.2M | $37.59 | −88.2% |
| LTM EV/EBIT — raw peer median | 16.9x | EV $72,298.2M → Equity $99,081.2M | $23.30 | −92.7% |
| LTM P/Tangible BV — raw peer median | 1.2x | Equity multiple direct: $21.99/sh TangBV × 1.2 | $26.39 | −91.7% |
| NTM Forward P/E — raw peer median | 6.93x | Equity multiple direct: $1.91/sh NTM EPS × 6.93 | $13.23 | −95.9% |

Equity bridge used for EV-basis rows: `Implied equity = Implied EV − Total debt ($16,080M) − Minority interest ($661M) − Preferred ($0) + Cash & ST investments ($43,524M, broad canonical basis)` = `Implied EV + $26,783M`, divided by the ≈4,252.5mm per-share fair-value share count, both per `01_price-and-capital-structure.md` §4, §7. P/E and P/TangBV rows apply the multiple directly to the per-share metric (no EV bridge needed).

**Base-case point: ≈$40/share** (1.3x NTM EV/Sales, quality-adjusted). **Dispersion across methods: ≈$13–$40/share**, i.e. every peer-comp method — even the quality-adjusted one — implies a value 85–96% below the current $319.69 price. The dispersion is wide because Tesla's own multiples are currently most extreme on the metrics most sensitive to its thin near-term earnings (forward P/E, EV/EBIT), and narrowest on revenue-based multiples, which is why EV/Sales is used as the primary basis.

## 6. Relative Read

On every multiple available in this pool — LTM and NTM, price-based and enterprise-value-based — Tesla trades at a premium to its core auto/EV peer median of roughly 800% to 2,300%, and the quality evidence (a "No moat proven" verdict with return on capital 210–885 basis points below its own cost of capital, and a 33/100 "Weak" business-quality score anchored by three straight years of margin compression) does not support a premium of anywhere near that size. The base-case peer-multiple-implied value is **≈$40/share** (1.3x NTM EV/Sales, quality-adjusted for Tesla's real margin/growth/leverage edge over peers), with a cross-method dispersion of **≈$13–$40/share** — all of it far below the $319.69 current price. The one thing this peer-comp lens cannot price is whatever the market is paying for Tesla's unmonetized autonomous-driving and robotics bets, since no named peer carries a comparable disclosed initiative; that question belongs to the DCF and sum-of-the-parts methods downstream, not to this module.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — TSLA

**Business type:** Operating company (vertically-integrated EV manufacturer + energy storage; no sector overlay match) [`valuation/00_valuation-data-triage.md` §3; `business-model/02_business-identity.md` §3a]. The FCFF (free cash flow to the firm — cash generated by the whole business before any interest paid to lenders) DCF below is the correct primary intrinsic method per the Business-Type Method Map; no EV bridge substitution is needed. **Reporting standard:** US GAAP. **Reporting currency:** USD, figures in millions except per-share. **Fiscal year end:** Dec-31 [`valuation/01_price-and-capital-structure.md`].

**Anchor inputs used verbatim from `01_price-and-capital-structure.md`:** current price $319.69 (2026-07-23, pool-verified); per-share fair-value share count ≈4,252.5mm (approximate fully diluted, TSM-proxy — labeled inference, no options/RSU strike schedule found in pool); net debt $861mm (strict basis) and minority interest $661mm, both at Jun-30-2026.

---

## 1. FCF Base & Normalizations

**Base year: TTM (last twelve months) through Jun-30-2026** (Q3 2025 + Q4 2025 + Q1 2026 + Q2 2026), the latest period for which a full cash-flow statement exists [`earnings/01_historical-financials.md` §2].

| Item | Base-Year Value ($mm) | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | 103,619 | None | `earnings/01_historical-financials.md` §2, ties to CIQ LTM Jun-30-2026 |
| EBIT (GAAP operating income) | 4,372 | None | Same source — EBIT margin 4.22% |
| CFO | 18,685 | None | Same source |
| Capex (total, abs.) | 12,923 | None — company redefined capex from Q1 2025 to include energy-storage-system purchases; all periods shown are on this basis, not a mixed definition | Same source |
| **FCF (CFO − Capex)** | **5,762** | **None found.** `earnings/06_earnings-quality.md` §1 explicitly checked for a normalization trigger (a large one-off cash item or a company-defined add-back) and found none — Tesla's own FCF definition ("operating cash flow less capital expenditures") matches the plain default, so the reported figure is also the normalized figure | `earnings/06_earnings-quality.md` §1 |

**What is deliberately NOT smoothed away.** Two GAAP-P&L one-offs inflated headline net income in the trailing window — a $5,927mm non-cash deferred-tax valuation-allowance release (Q4 2023, outside this TTM window) and a $1,005mm SpaceX equity mark-to-market gain plus a $274mm California tax-valuation-allowance release (both Q2 2026) [`earnings/06_earnings-quality.md` §4–§5] — but none of these are cash items inside CFO, so none require a FCF adjustment; they are flagged here only so the base-year FCF is not mistaken for a GAAP-net-income-clean figure.

**The one real forward distortion is not a one-off to strip out of the base year — it is the single biggest driver of the entire forecast below.** Management guides FY2026 capex "more than $25 billion" (more than double FY2025's $8,527mm) and states capex "will grow for the next two to three years" to fund robotaxi, Optimus, a new semiconductor fab, solar manufacturing, and AI-compute buildout [Q2 2026 Earnings Call transcript, Jul 22, 2026, prepared remarks; `earnings/04_guidance-consensus.md` §2]. This already pushed quarterly FCF negative for the first time in eight quarters (Q2 2026: −$1,092mm) [`earnings/01_historical-financials.md` §3]. This is real, guided, forward capital spending — it is built directly into the explicit forecast (§4), not normalized out of the base year.

---

## 2. Forecast Assumptions

**Horizon: 7 years (FY2026–FY2032), plus terminal.** FY2026–FY2028 use Capital IQ consensus (cross-checked two ways: the Consensus tab's own revenue/EBITDA figures, and an independent back-solve of implied EBIT/EBITDA from the Estimates-Report Multiples tab's forward TEV/EBIT and TEV/EBITDA multiples applied to the canonical EV of $1,235,847.8mm). **FY2029–FY2032 and the terminal year are analyst assumptions, not company-guided** — built by explicitly rejecting the CIQ consensus's own long-dated tail (see note below).

**Why the consensus tail beyond FY2028 is rejected as a base case.** The same TEV/EBIT back-solve shows consensus revenue accelerating from $139,868mm (FY2028) to $598,932mm by FY2033 — a ~34% CAGR — with EBIT margin simultaneously expanding past 16% by FY2030 [`Tesla,IncNasdaqGSTSLAEstimatesReport.xls`, Multiples tab]. That trajectory embeds un-derisked robotaxi/Optimus monetization with **zero disclosed revenue line today** [`business-model/03_segment-map.md` §3], directly against `business-model/09_moat.md`'s finding of **"No moat proven"** (return on capital 2.75%–3.7% LTM vs ~11.5%–12.4% cost of capital) and `business-model/07_business-quality.md`'s **rate-of-change/disruption score of 30/100** (≤40, "closer to a sector/technology-cycle bet than a durable compounder," RF-BQ-005). This DCF does not adopt the consensus tail as its base case; FY2029+ is built independently and fades toward a no-excess-return terminal (§5).

| Assumption | FY2026 | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 | FY2032 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 11.2 | 13.4 | 17.0 | 10.0 | 8.0 | 6.0 | 5.0 | 1.0 | FY26–28: **consensus-derived** (CIQ EstimatesReport, Consensus tab: FY26 $105,415mm, FY27 $119,592mm, FY28 $139,868mm — the last a peer/consensus figure this report still treats as usable since its embedded EBIT margin, 7.7%, is not yet in the extreme tail). FY29–32: **analyst assumption**, fading well below consensus's own implied re-acceleration. Terminal: **analyst assumption**, financeable-growth-constrained (Gate 2, §5) |
| EBIT margin % | 4.4 | 6.1 | 7.7 | 8.0 | 8.3 | 8.5 | 8.5 | 8.5 | FY26–28: **consensus-derived** (back-solved: implied EBIT = canonical EV ÷ CIQ forward TEV/EBIT multiple — FY26 265.8x, FY27 169.4x, FY28 114.5x). FY29–32 + Terminal: **analyst assumption**, benchmarked to peer-normal (Ford 0.8%, GM 5.5%, both LTM EBIT margin [`business-model/09_moat.md` §3]) and Tesla's own FY2021 pre-cyclical-peak level (12.1% [`earnings/01_historical-financials.md` §1]) — landing above both peers (reflecting the evidenced, if not-yet-monetized, Technology/IP strength [`business-model/09_moat.md` §2, score 50/100]) but well below Tesla's own FY2021–FY2022 range (12.1%–16.8%), consistent with the Cyclicality Gate's ban on resetting near a recent peak |
| Tax rate % | 26 | 26 | 26 | 26 | 26 | 26 | 26 | 26 | **Normalized structural rate**, held flat. Reconciles to `business-model/09_moat.md`'s own canonical normalized rate (LTM effective 25.9%, FY2025 27.0%, both excluding the FY2023 anomaly where a $5,927mm one-time deferred-tax valuation-allowance release made the reported rate negative/NM) — this DCF and the moat module's ROIC test use the identical rate |
| Capex (% of revenue) | 24.9 | 22.0 | 18.0 | 13.0 | 10.5 | 9.5 | 8.8 | 8.8 | FY26: **consensus-derived** ($26,166.7mm [`earnings/04_guidance-consensus.md` §3], reaffirming management's "more than $25 billion" floor [Q2 2026 Earnings Call, Jul 22, 2026]). FY27–28: **analyst assumption**, extending management's own "capex will grow for the next two to three years" guidance in dollar terms before decelerating. FY29–32 + Terminal: **analyst assumption**, fading toward a normalized capital-intensity level, cross-checked so the Gate-2 financeable-growth cross-check (§5) lands within ~0.4pp of the modeled terminal g |
| Δ Working capital (days-based, % of revenue) | 0.4 | 0.6 | 0.8 | 0.5 | 0.5 | 0.4 | 0.3 | scales with revenue | **Days-based driver, held at FY2025 levels**: DSO 17.0 days, DIO 57.3 days, DPO 60.7 days [`earnings/06_earnings-quality.md` §3], applied against forecast revenue (DSO) and an assumed COGS ratio of 82% of revenue (DIO/DPO) → net operating working capital ≈3.89% of revenue. ΔNWC each year = 3.89% × ΔRevenue (shown in $mm in §4). This is NOT the flat absolute figure in `earnings/01`'s broader "Working Capital" row (Curr. Assets − Curr. Liabs., which is dominated by Tesla's own cash/ST-investment pile and is the wrong driver for a DCF) — this report uses the narrower operating-NWC (AR+Inventory−AP) days-based driver instead, per the working-capital hard rule |

**Working-capital sign check.** Revenue grows in every forecast year, and the NWC ratio is held flat (not mean-reverting), so the modeled NWC balance grows every year — this is a normal **positive**-working-capital business (cash conversion cycle +13.7 days [`earnings/06_earnings-quality.md` §3], not a negative-WC business), so ΔNWC **absorbs** cash every year, subtracting from FCF. This matches intuition (a growing manufacturer ties up more cash in receivables/inventory net of payables) and is shown with its sign in §4. Note `earnings/06_earnings-quality.md` §3 flags DSO has been *rising* (12.1→14.2→17.0 days, FY2023–FY2025) — holding the ratio flat rather than assuming further deterioration is the more conservative (not the downside) choice here.

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.7% | 10-year US Treasury yield, 4.71% on 2026-07-24. **Web-sourced, dated, labeled** |
| Equity-risk premium | 4.3% | Damodaran implied ERP estimate, Jan-2026 (4.23%, S&P 500 cash-flow-implied method). **Web-sourced, dated, labeled** |
| Beta | 1.80 | 5-year beta, disclosed on Tesla's own Capital IQ Public Company Profile, as of 2026-07-23 [`Tesla-Inc-NasdaqGS-TSLA-Public-Company-Profile`] — a specific, cited beta, satisfying the Gate-4 justification requirement for a cost of equity above `rf + 1.4×ERP` |
| Cost of equity (k_e = rf + β×ERP) | 12.44% | 4.7% + 1.80 × 4.3% |
| Pre-tax cost of debt | 6.00% | **Estimate**, not the raw book ratio. Tesla's actual interest-expense/average-total-debt ratio (LTM $334mm ÷ ~$15,400mm ≈ 2.2%) is not representative of Tesla's *marginal* cost of debt — it reflects legacy low-coupon obligations and a "Total Debt" figure that bundles $6,738mm of non-interest-bearing operating-lease liabilities [`valuation/01_price-and-capital-structure.md` §4]. Tesla is S&P-rated **BBB** [`Tesla-Inc-NasdaqGS-TSLA-Credit-Health-Panel__Summary`]. Estimate = 10-year UST (4.7%) + an estimated ~130bp BBB credit spread (2026 IG spreads are historically tight, ~77–80bp OAS on the investment-grade composite, itself skewed toward single-A; a modestly wider spread is used for a BBB-specific issuer). **Inference, not from filings** |
| Tax rate (for debt tax shield) | 26% | Same normalized rate as NOPAT (§2) |
| After-tax cost of debt | 4.44% | 6.00% × (1 − 26%) |
| Debt used for WACC weighting | $9,342mm | Filing-basis debt + finance leases only (excludes $6,738mm of operating-lease liabilities, which are not interest-bearing market debt priced like the cost-of-debt estimate above) [`valuation/01_price-and-capital-structure.md` §4] |
| Equity / debt weights (market value) | 99.27% equity / 0.73% debt | Market cap $1,262,630.8mm ÷ (market cap + $9,342mm debt) [`valuation/01_price-and-capital-structure.md` §3] |
| **WACC** | **12.38%** | `w_e·k_e + w_d·k_d·(1−t)` |

**Formula (executed, not eyeballed):**

```
$ python3 tsla_wacc.py
ke=12.4400%  kd_pretax=6.0000%  kd_at=4.4400%
we=99.2656%  wd=0.7344%
WACC = 99.2656%*12.4400% + 0.7344%*4.4400% = 12.3812%
Check: after-tax kd (4.4400%) <= WACC (12.3812%) < ke (12.4400%): True
```

`WACC = w_e·k_e + w_d·k_d·(1−t)`. No preferred equity exists [`valuation/01_price-and-capital-structure.md` §4], so the preferred term is omitted.

**Sanity bounds (MODULE_RULES Gate 4).** `after-tax k_d (4.44%) ≤ WACC (12.38%) < k_e (12.44%)` — confirmed, the assembly is valid (WACC sits strictly below the CAPM cost of equity, as it must for any levered firm). On the "implausibly high k_e for a developed-market large/mega-cap" check: `rf + 1.4×ERP = 4.7% + 1.4×4.3% = 10.72%`, and the computed `k_e` (12.44%) sits above that line — but Tesla's own disclosed 5-year beta of 1.80 is the specific, cited justification the rule requires (this is not an assumed high beta; it is Tesla's actual measured beta), so the higher cost of equity stands.

**Cross-check against the moat module's cost-of-capital estimate.** `business-model/09_moat.md` §3 independently estimated WACC ≈ 11.5% (same rf/beta logic, ERP 5.0% instead of 4.3%, and a different — lower, book-ratio-based — cost of debt). The gap to this report's 12.38% is ~0.9pp, comfortably inside the ~2pp tolerance in MODULE_RULES Gate 4, so a single WACC (not a dual grid spanning both) is used; the §7 sensitivity grid already flexes WACC ±1pp, which spans this gap.

---

## 4. Free Cash Flow Forecast & Discounting

**FCFF identity used:** `FCFF = NOPAT + D&A − Capex − ΔNWC` (built from the income statement and forecast balance sheet, since the forecast extends beyond the disclosed cash-flow statement) — MODULE_RULES Economic Consistency Gate 1, second definition. **Discounting convention: mid-year** (cash flows assumed to arrive, on average, mid-period; discounted at t−0.5) — the module default, used throughout.

| Year | Revenue | EBIT | NOPAT | D&A | Capex | ΔNWC | FCFF | Discount Factor (t−0.5) | PV of FCFF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026 | 105,415 | 4,649 | 3,440 | 9,445 | 26,248 | 412 | (13,775) | 0.9433 | (12,994) |
| FY2027 | 119,592 | 7,295 | 5,398 | 10,572 | 26,310 | 552 | (10,892) | 0.8394 | (9,142) |
| FY2028 | 139,868 | 10,784 | 7,980 | 13,763 | 25,176 | 789 | (4,223) | 0.7469 | (3,154) |
| FY2029 | 153,855 | 12,308 | 9,108 | 14,616 | 20,001 | 545 | 3,179 | 0.6646 | 2,113 |
| FY2030 | 166,163 | 13,792 | 10,206 | 14,955 | 17,447 | 479 | 7,234 | 0.5914 | 4,278 |
| FY2031 | 176,133 | 14,971 | 11,079 | 15,324 | 16,733 | 388 | 9,282 | 0.5262 | 4,884 |
| FY2032 | 184,940 | 15,720 | 11,633 | 15,720 | 16,275 | 343 | 10,735 | 0.4683 | 5,027 |

**Sum of PV of explicit FCFFs: −$8,989mm.**

**Reading the negative years.** FY2026–FY2028 show negative FCFF because the guided/consensus capex ramp (>$25bn floor, guided to keep growing) far exceeds NOPAT during the buildout — this is the direct, disclosed consequence of management's own capital-spending guidance (§1), not a modeling artifact. This is the single most consequential finding of this DCF (see §8).

**Executed calculation (WACC blend, FCFF path, PV sum):**

```
$ python3 tsla_dcf_forecast.py
    Year   Grw%    Revenue  EBIT%     EBIT    NOPAT     D&A    Capex   dNWC     FCFF
  FY2026  11.2%    105,415   4.4%    4,649    3,440   9,445   26,248    412  -13,775
  FY2027  13.4%    119,592   6.1%    7,295    5,398  10,572   26,310    552  -10,892
  FY2028  17.0%    139,868   7.7%   10,784    7,980  13,763   25,176    789   -4,223
  FY2029  10.0%    153,855   8.0%   12,308    9,108  14,616   20,001    545    3,179
  FY2030   8.0%    166,163   8.3%   13,792   10,206  14,955   17,447    479    7,234
  FY2031   6.0%    176,133   8.5%   14,971   11,079  15,324   16,733    388    9,282
  FY2032   5.0%    184,940   8.5%   15,720   11,633  15,720   16,275    343   10,735

FY2026: t=0.5 DF=0.9433 CF=-13,775 PV=-12,994
FY2027: t=1.5 DF=0.8394 CF=-10,892 PV=-9,142
FY2028: t=2.5 DF=0.7469 CF=-4,223 PV=-3,154
FY2029: t=3.5 DF=0.6646 CF=3,179 PV=2,113
FY2030: t=4.5 DF=0.5914 CF=7,234 PV=4,278
FY2031: t=5.5 DF=0.5262 CF=9,282 PV=4,884
FY2032: t=6.5 DF=0.4683 CF=10,735 PV=5,027
Sum PV explicit FCFF: -8988.9
```

---

## 5. Terminal Value

**Method: Gordon growth perpetuity**, cross-checked against an exit-multiple.

`TV = FCFF_(n+1) / (WACC − g) = FCFF_n × (1+g) / (WACC − g)`, where `FCFF_(n+1)` is the first cash flow after the explicit period (FY2033) and `g` is the perpetual nominal growth rate.

**Structural-decline / no-moat terminal trigger (CLAUDE.md §24 Filter 5; MODULE_RULES §5 hard rule).** Two triggers fire simultaneously here, both cited:
- `business-model/09_moat.md` §5: **"No moat proven"** — return on capital sits below cost of capital on every basis computed (LTM 2.75%–3.7% vs ~11.5%–12.4% WACC; even the 5-year through-cycle average, 8.3%–9.4%, sits below WACC). Per the hard rule, the **base** terminal must carry **no perpetual excess return**: no moat premium, growth faded to nominal-GDP-proxy levels.
- `business-model/09_moat.md` §5: **"Moat trajectory — eroding"** (ROIC fell every year for three straight years, gap to WACC widening) **AND** `business-model/07_business-quality.md`'s **rate-of-change/disruption score of 30/100** (≤40, RF-BQ-005) — both trigger the requirement to **also** build a separate declining-perpetuity/runoff terminal.

**Base terminal (no moat premium).** The mechanical Gordon calculation at the "nominal GDP-proxy" growth rate of 3.5% breaches the financeable-growth cross-check below by 2.79pp (see Gate-2 box) — so, per Gate 2's teeth, terminal g is **lowered to the financeable level: g = 1.0%** (nominal), not 3.5%. This is shown alongside the higher, rejected figure for transparency.

**Gate 2 — financeable-growth cross-check (executed):**

```
$ python3 tsla_dcf_terminal.py
Invested capital path (net-of-cash, rolled forward from the Jun-30-2026 anchor
of $88,380mm [business-model/09_moat.md §3]): [105595, 121886, 134088, 140018,
142990, 144787, 145685]
Terminal ROIC (NOPAT / beginning invested capital) = 8.03%
Terminal reinvestment rate ((capex - D&A + ΔNWC) / NOPAT) = 7.72%
Implied financeable growth (ROIC × reinvestment rate) = 0.62%
Modeled terminal g = 1.00%  ->  gap = 0.38pp (within the ~1.5pp tolerance — PASS)
```

At g = 3.5% the same check showed an implied financeable growth of only 0.71% — a 2.79pp gap, breaching the tolerance — which is why 3.5% is rejected as the base and 1.0% is used instead. **Terminal ROIC of 8.03% still sits below the 12.38% WACC** — this DCF does not assume Tesla ever earns a positive economic profit (return above cost of capital) even in its best-case explicit trajectory; the "no moat proven" finding is a structural cap on this model, not a stylized label.

**Base Gordon TV:**

| g | FCFF_(n+1) | TV (undiscounted) | PV of TV | EV (explicit + TV) | TV as % of EV |
|---|---:|---:|---:|---:|---:|
| 1.0% (**base, used**) | 10,842 | 95,265 | 44,609 | 35,620 | **125.2%** |
| 2.0% (illustrative) | 10,950 | 105,476 | 49,391 | 40,402 | 122.2% |
| 3.5% (mechanical, **rejected** — fails Gate 2) | 11,111 | 125,104 | 58,582 | 49,593 | 118.1% |

**Terminal value is 125.2% of enterprise value at the base g — a terminal-dominated, low-confidence DCF** (>75% flag, MODULE_RULES Gate 5). This happens because the sum of explicit-period PVs is *negative* (−$8,989mm, §4): the entire positive enterprise value comes from the terminal, and EV is the small residual between a large negative explicit PV and a large positive terminal PV — a fragile, assumption-sensitive result, disclosed explicitly rather than smoothed over.

**Exit-multiple cross-check (Gate 5's required "second lens").** Terminal EBITDA (FY2032, EBIT + D&A) = $31,440mm.

| Exit multiple (EV/EBITDA) | TV (undiscounted) | PV of TV | EV | Equity | Per-share |
|---:|---:|---:|---:|---:|---:|
| 6x | 188,638 | 88,333 | 79,344 | 77,822 | $18.30 |
| 8x | 251,518 | 117,777 | 108,788 | 107,266 | $25.22 |
| 10x | 314,397 | 147,221 | 138,232 | 136,710 | $32.15 |
| 12x | 377,277 | 176,665 | 167,676 | 166,154 | $39.07 |

**Reconciling the two lenses.** The exit-multiple cross-check (a plausible 6x–12x range for a mature, capital-intensive, no-moat-proven industrial business) produces per-share values 2–5x higher than the Gordon base ($8.02, §6). The gap is real, not an error: the Gordon method is tied directly to FY2032's still-elevated capex/D&A assumptions (the terminal *year* itself is still absorbing the tail of the capex supercycle), which depresses FCFF relative to a "normalized mature EBITDA" a multiple-based buyer would apply. **Both lenses are shown; neither is treated as the single answer — this divergence, not a false-precision point, is the finding** (MODULE_RULES Gate 5 / Reconciliation Gate 6). Even the top of the exit-multiple range ($39.07) sits far below the current price ($319.69) — see §8.

**Declining/runoff terminal (structural-impairment scenario — bear input, NOT the base).** Per the trigger above, a separate, more severe terminal is built: terminal EBIT margin fades further to **5.0%** (below the 8.5% base-case terminal margin, reflecting continued erosion rather than stabilization), D&A held at 8.0% of revenue, capex cut to 6.5% of revenue (capital discipline in a shrinking-return business), and `g = 1.0%` (nominal, at/below the long-run inflation proxy of ~2.5% — the rule's "at or below expected inflation" bound; a fuller multi-stage fade trending toward zero/negative growth beyond this single-stage Gordon proxy is directionally implied by the much lower margin and is not separately modeled here).

| | FCFF (terminal year) | TV (undiscounted) | PV of TV | EV | Equity | Per-share |
|---|---:|---:|---:|---:|---:|---:|
| Declining/runoff terminal | 9,545 | 84,704 | 39,664 | 30,675 | 29,153 | **$6.86** |

This is a **structural-impairment bear input for `07_scenario-and-fair-value`'s bear case and the master synthesizer's Kill Criteria** — it does not replace the base-case intrinsic value below.

---

## 6. DCF Output

| Step | Value ($mm, except per-share) |
|---|---:|
| PV of explicit FCFFs | (8,989) |
| + PV of terminal value (base, Gordon g=1.0%) | 44,609 |
| **= Enterprise value** | **35,620** |
| − Net debt (strict, per `01`) | 861 |
| − Minority / preferred (per `01`) | 661 |
| **= Equity value** | **34,098** |
| ÷ Diluted shares (per-share fair-value count, per `01`) | 4,252.5mm |
| **= Intrinsic value per share (base, Gordon)** | **$8.02** |
| vs current price ($319.69, 2026-07-23, pool-verified) | DCF base sits ~97.5% below current price — see §8 for why |

**Executed bridge calculation:**

```
$ python3 tsla_dcf_bridge.py
g=1.0%: FCFF_n+1=10,842 TV=95,265 PV_TV=44,609 EV=35,620 TV%EV=125.2%
Equity = EV - net_debt(861) - minority(661) = 35,620 - 861 - 661 = 34,098
Per share = 34,098 / 4,252.5mm = $8.02
```

---

## 7. Sensitivity Grid (per-share intrinsic value)

Gordon-growth method, WACC across columns, terminal growth down rows. Grid re-solves the full explicit-period PV sum at each WACC (not just the terminal), per the module standard.

| | WACC −1% (11.38%) | WACC (12.38%) | WACC +1% (13.38%) |
|---|---:|---:|---:|
| g +0.5% (1.5%) | $10.52 | $8.55 | $6.94 |
| g (1.0%, base) | $9.84 | $8.02 | $6.51 |
| g −0.5% (0.5%) | $9.23 | $7.53 | $6.12 |

No cell in this grid approaches `WACC − g ≤ 0` (the tightest gap is 11.38% − 1.5% = 9.88pp), so no cell requires an NM flag. **Dispersion: $6.12–$10.52 per share** around the $8.02 base — a narrow-looking range in isolation, but the exit-multiple cross-check (§5) shows the terminal *method* choice alone moves the answer to $18–$39, which is the more consequential sensitivity in this specific DCF.

---

## 8. Intrinsic Read

**Base-case intrinsic value: $8.02/share** (Gordon-growth method, WACC 12.38%, terminal g = 1.0% financeable-constrained), with a **$6.12–$10.52 dispersion** from the WACC/g grid (§7) and a materially higher **$18.30–$39.07** range from the exit-multiple cross-check (§5) — both shown because they disagree by more than the methods should, per Gate 5's terminal-dominance escalation (terminal value is 125% of enterprise value here). **Intrinsic confidence is capped Low**: this DCF hits three separate score-cap triggers at once — terminal value >75% of EV (max 60), cross-method disagreement >40% between the Gordon and exit-multiple lenses (max 55), and a forecast built substantially on analyst assumptions beyond FY2028 rather than company guidance (a self-built-forecast partial-data cap) — the most restrictive of these governs.

Even at the top of every lens shown here ($39.07, the 12x exit-multiple case), this DCF's fair value sits roughly 88% below the $319.69 current price (2026-07-23). This is not primarily a sign of a fragile model — it is the direct, disclosed consequence of three findings assembled elsewhere in this research: (1) Tesla's own guided capex supercycle (>$25bn floor, "growing for the next two to three years") swamps current profitability so completely that the explicit forecast period is cash-flow-negative in present-value terms; (2) `business-model/09_moat.md`'s "No moat proven" finding rules out assuming any perpetual excess return in the terminal, so no re-acceleration of margins toward the FY2022 cyclical peak (16.8% EBIT margin) is underwritten; and (3) none of the capital being spent on robotaxi, Optimus, or AI compute carries a disclosed revenue line yet [`business-model/03_segment-map.md` §3], so a cash-flow-only DCF cannot give it credit. **The single assumption this value is most sensitive to is the terminal method and the terminal-year capex/D&A level** — not the WACC or growth rate in isolation — since the entire positive enterprise value in the base case comes from a terminal value larger than the enterprise value itself.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — TSLA

**Method note.** This agent inverts `04_intrinsic-dcf.md`'s own model rather than building an independent one. The discount rate (WACC), the normalized free cash flow (FCF — cash the operating business throws off after the investment needed to run and grow it) base, the terminal growth rate, the forecast horizon, and the discounting convention are all taken **verbatim** from `04`, per the module's hard rule (MODULE_RULES Calculation Standard 9). Nothing here re-derives a WACC or uses a different FCF base — that would make the two DCFs non-comparable.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $319.69 (2026-07-23, `pool-verified`) | `01_price-and-capital-structure.md` §1 |
| Enterprise value (EV — the value of the whole business: what it would cost to buy all its equity and debt) | $1,235,847.8mm (canonical, broad cash basis) | `01_price-and-capital-structure.md` §4/§7. (Alternate: $1,264,152.8mm on the strict cash basis, 2.3% higher — using this alternate target moves the primary solve below from 68.9% to 69.5% implied CAGR, an immaterial difference; canonical broad-basis EV is used throughout.) |
| FCF (normalized) base | $5,762mm (TTM through Jun-30-2026) | `04_intrinsic-dcf.md` §1, verbatim — no normalization adjustment was found necessary (`earnings/06_earnings-quality.md` §1 checked and found no one-off or company-defined add-back distorting this figure) |
| Discount rate (WACC — the blended annual return the company must earn on its capital, given its mix of equity and debt, to justify the risk of investing in it) used | 12.38% (`k_e` = 12.44% = 4.7% risk-free rate + 1.80 beta × 4.3% equity-risk premium; after-tax cost of debt 4.44%; weights 99.27% equity / 0.73% debt) | `04_intrinsic-dcf.md` §3, verbatim |
| Terminal growth rate (g) | 1.0% nominal (financeable-growth-constrained — the mechanical 3.5% GDP-proxy rate was rejected because it required more reinvestment than Tesla's modeled return on capital could finance) | `04_intrinsic-dcf.md` §5, verbatim |
| Forecast horizon | 7 years (FY2026–FY2032) | `04_intrinsic-dcf.md` §2, verbatim |
| Discounting convention | Mid-year (cash flows assumed to land, on average, mid-period; discounted at t−0.5) | `04_intrinsic-dcf.md` §4, verbatim |

## 2. Implied Expectations

**What is held fixed:** WACC (12.38%), terminal growth (1.0%), the discounting convention (mid-year), the forecast horizon (7 years), and the FCF base ($5,762mm TTM). **What is solved for:** the constant annual FCF growth rate applied to the base for 7 years (with the cash flow at the end of year 7 feeding a Gordon-growth terminal value at the fixed 1.0% terminal g) that makes the present value of the whole stream equal today's enterprise value ($1,235,847.8mm).

**Executed solve (Python, `scipy.optimize.brentq`):**

```
$ python3 -c "
from scipy.optimize import brentq
WACC=0.1238; g_terminal=0.01; FCF0=5762.0; target_EV=1235847.8; years=7
def pv_ev(g):
    pv=0.0
    for t in range(1,years+1):
        pv += FCF0*(1+g)**t / (1+WACC)**(t-0.5)
    fcf_next = FCF0*(1+g)**years*(1+g_terminal)
    TV = fcf_next/(WACC-g_terminal)
    return pv + TV/((1+WACC)**(years-0.5))
root = brentq(lambda g: pv_ev(g)-target_EV, 0.5, 0.7, xtol=1e-10)
print('Implied 7yr FCF CAGR:', root, f'{root*100:.2f}%')
print('Check PV:', pv_ev(root))
"
Implied 7yr FCF CAGR: 0.688771303650395 68.88%
Check PV: 1235847.7999898933
```

At this root, PV of the 7-year explicit stream is $297,704mm and PV of the terminal value is $938,144mm — the terminal value is **75.9% of the implied EV**, above the module's 60% terminal-dominance trigger, so terminal `g` is also stressed in §4.

| What the Price Implies | Solved Value | What was held fixed |
|---|---:|---|
| Implied FCF CAGR over the 7-year horizon | **68.9%** | WACC 12.38%, terminal g 1.0%, FCF base $5,762mm, mid-year convention |
| Implied years of Tesla's own best-ever historical annual growth rate (51.4%, FY2022) needed before fading to the same 1.0% terminal | **≈9.3 years** | Same WACC/terminal-g/base/convention; growth rate fixed at Tesla's own FY2022 print instead of solved |
| Implied steady-state EBIT margin, holding `04`'s own guided/consensus revenue and capex path fixed (FY2026–FY2032 revenue $105bn→$185bn, per `04` §4) | **>100% of revenue — not solvable within the feasible [0,100%] range** | Same WACC/terminal-g/convention; `04`'s own revenue and capex dollars held fixed; solved for the flat EBIT margin applied to that revenue path instead of a growth rate |

**Executed solve for the second row (years-at-peak-growth):**

```
$ python3 -c "
WACC=0.1238; g_terminal=0.01; FCF0=5762.0; target=1235847.8; g_high=0.514
def total(N):
    pv=0.0
    for t in range(1,N+1):
        pv += FCF0*(1+g_high)**t/(1+WACC)**(t-0.5)
    fcf_next = FCF0*(1+g_high)**N*(1+g_terminal)
    TV = fcf_next/(WACC-g_terminal)
    return pv + TV/((1+WACC)**(N-0.5))
print(9, total(9)); print(10, total(10))
"
9 1115340.76
10 1510832.73
```
(Target 1,235,847.8 falls 30% of the way between the N=9 and N=10 values → **≈9.3 years**.)

**Executed solve for the third row (implied margin on `04`'s own revenue/capex path):**

```
$ python3 -c "
from scipy.optimize import brentq
WACC=0.1238; g_terminal=0.01; tax=0.26; target=1235847.8
years_data=[(105415,9445,26248,412),(119592,10572,26310,552),(139868,13763,25176,789),
            (153855,14616,20001,545),(166163,14955,17447,479),(176133,15324,16733,388),
            (184940,15720,16275,343)]
def total_pv(m):
    pv=0.0
    for t,(rev,da,capex,dnwc) in enumerate(years_data, start=1):
        fcff = rev*m*(1-tax)+da-capex-dnwc
        pv += fcff/(1+WACC)**(t-0.5)
    rev32=years_data[-1][0]; da32p=years_data[-1][1]/rev32; capex32p=years_data[-1][2]/rev32
    rev33=rev32*(1+g_terminal); da33=da32p*rev33; capex33=capex32p*rev33
    dnwc33=0.0389*(rev33-rev32)
    fcff33=rev33*m*(1-tax)+da33-capex33-dnwc33
    TV=fcff33/(WACC-g_terminal)
    return pv + TV/((1+WACC)**(7-0.5))
print(total_pv(1.00))   # margin = 100% of revenue, the theoretical ceiling
root=brentq(lambda m: total_pv(m)-target, 0.01, 5.0, xtol=1e-9)
print('Implied margin:', f'{root*100:.2f}%')
"
1026364.49
Implied margin: 119.49%
```

A 100%-of-revenue EBIT margin — every dollar of revenue converting straight to pre-tax profit, with zero cost of goods, opex, or overhead — still only reaches $1,026,364mm of PV, short of the $1,235,848mm target. The margin channel alone, on Tesla's own guided revenue path, **cannot** get to today's price at any economically possible level. This confirms growth (not margin) is the only lever the market could be pricing in, and §3 tests whether that lever is credible.

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied FCF CAGR = 68.9% sustained for 7 years | FY2021–FY2025 revenue CAGR = 15.2% (from $53,823mm to $94,827mm) [`earnings/01_historical-financials.md` §1]; FY2025 revenue growth was **negative** (−2.9%); TTM growth is +11.8% [`earnings/01` §2]. FCF itself has ranged $3,581mm (FY2024) to $7,561mm (FY2022) — a volatile, non-monotonic series with a 4-year CAGR of only ~5.7% [`earnings/01` §1] | `earnings/07_earnings-sensitivity.md` §2 sizes the six largest identified swing factors (FX, delivery volume, opex ratio, SBC, energy margin, regulatory credits) at $292mm–$1,640mm of annualized EBITDA impact each — on a base LTM EBITDA of $10,755mm, these are single-digit-percent moves, nowhere near the step-change implied by a 68.9% CAGR | **No** |
| ≈9.3 years of Tesla's own best-ever annual growth rate (51.4%, FY2022) | Tesla has sustained anything close to 50%+ growth for at most 2 consecutive years (FY2021 +70.7% off a depressed pandemic base, FY2022 +51.4%) before decelerating every single year since (FY2023 +18.8%, FY2024 +0.9%, FY2025 −2.9%) [`earnings/01` §1] | `business-model/09_moat.md` §5: "No moat proven" — return on capital (2.75%–3.7% LTM) sits below the ~11.5%–12.4% cost of capital, and the moat trajectory is **eroding**, not strengthening (ROIC fell every year for 3 straight years); `business-model/07_business-quality.md`'s rate-of-change/disruption score is 30/100 (RF-BQ-005) | **No** |
| >100%-of-revenue EBIT margin (holding `04`'s revenue path fixed) — economically impossible | Tesla's own best-ever EBIT margin was 16.8% (FY2022); it has fallen every year since to 4.6% (FY2025) [`earnings/01` §1] | `business-model/09_moat.md` §3: gross margin, EBIT margin, and ROIC have all deteriorated for three consecutive years; the FSD/robotaxi/Optimus technology asset "has not lifted the return on capital" and "carries no disclosed revenue line yet" | **No — not economically achievable at any level** |

The market's implied expectations are **aggressive**, not conservative or fair. Tesla's own best-documented historical growth (a two-year burst of 51–71% off a depressed base, immediately followed by deceleration every year through FY2025's outright revenue decline) sits far below the 62%–81% sustained CAGR band this solve requires (§4), and the earnings-module sensitivity evidence shows the currently-quantified swing factors moving profitability by low-single-digit percentages of EBITDA, not the multi-hundred-percent step-change the price requires. The moat module's own finding — return on capital below cost of capital, and falling for three straight years, with no evidenced monetization of the AI/robotics bet that would need to arrive to power this growth — directly contradicts the durability the price requires.

**Market-ceiling sanity check.** Tesla is an Operating business (not Financial/REIT), so the revenue-size test applies. Converting the primary solve (68.9% FCF CAGR) to a revenue trajectory — holding the current TTM FCF-to-revenue conversion (5.762/103.619 = 5.56%) flat, so FCF growth = revenue growth — implies revenue reaching **≈$4.06 trillion by FY2032** (year 7 of the horizon: $103,619mm × 1.6888^7). The global automotive market was estimated at **≈$2.75 trillion in 2025**, projected to reach roughly $3.3–5.3 trillion by 2030–2032 at a base-case ~3.5% CAGR (Mordor Intelligence market-size estimate, web-sourced, dated 2026; a low-tier, unverified input, cited because no better addressable-market figure exists in the pool). Even at the high end of that market-growth range, Tesla's implied FY2032 revenue would require capturing **75–100%+ of the entire global automotive industry** — a share no automaker in history has ever held (Tesla's own 2025 global BEV share was 8.8%, already below BYD's 12.1% [`business-model/09_moat.md` §5, citing `08_competitive-map.md` §3]). This is a kill signal on market-ceiling grounds alone, independent of the company-history read above: **the growth channel that could theoretically justify today's price requires Tesla to out-produce and out-sell the entire existing global automotive industry**, not merely take share from it. This check can only make the implied growth look harder, and it does — it does not offset the finding above.

## 4. Robustness

| Discount Rate | Implied FCF CAGR to Justify Price |
|---|---:|
| WACC −1% (11.38%) | 65.72% |
| WACC (12.38%, base) | 68.88% |
| WACC +1% (13.38%) | 71.90% |

Spread: **6.18 percentage points** (65.72%–71.90%).

| FCF Base | Implied FCF CAGR to Justify Price |
|---|---:|
| Low ($3,581mm — FY2024 annual trough, the lowest FCF year in the 5-year history) [`earnings/01_historical-financials.md` §1] | 81.38% |
| Base ($5,762mm — TTM through Jun-30-2026, the `04`-canonical base) | 68.88% |
| High ($7,561mm — FY2022 annual peak, the highest FCF year in the 5-year history) [`earnings/01` §1] | 62.07% |

Spread: **19.31 percentage points** (62.07%–81.38%) — roughly **3x** the WACC-driven spread.

**Terminal growth (g) ±0.5%** — shown because terminal value is 75.9% of the implied EV (§2), above the module's 60% terminal-dominance trigger:

| Terminal g | Implied FCF CAGR to Justify Price |
|---|---:|
| g −0.5% (0.5%) | 69.80% |
| g (1.0%, base) | 68.88% |
| g +0.5% (1.5%) | 67.91% |

Spread: **1.89 percentage points** (67.91%–69.80%) — the smallest of the three.

**Dominant sensitivity: the FCF base, not the discount rate.** The FCF-base swing (19.3pp) is more than 3x the WACC swing (6.2pp) and roughly 10x the terminal-g swing (1.9pp). This matters for the read in §3: even at the *most favorable* FCF-base reading (the FY2022 peak, $7,561mm) and the *most favorable* WACC (11.38%), the price still implies a 7-year FCF CAGR in the 55–65% range (interpolating the two grids) — still 3–4x above Tesla's own best-ever sustained multi-year growth rate (15.2% over FY2021–FY2025) and still requires the market-share-versus-global-auto-industry outcome flagged in §3. No combination of inputs inside a defensible range closes this gap.

## 5. What's-Priced-In Read

At $319.69, the market is pricing in a **68.9% compound annual FCF growth rate sustained for 7 years** (or, equivalently, Tesla's own best-ever historical growth rate of 51.4% sustained for roughly **9.3 years** — about 4-5x longer than the ~2 years it has ever actually sustained a rate near that before decelerating to outright revenue decline). That is **aggressive, bordering on unachievable**, because (1) it sits far outside Tesla's own 15.2% five-year historical revenue CAGR and outright FY2025 revenue decline, (2) the moat module finds return on capital below the cost of capital and falling for three straight years with "No moat proven," directly undercutting any durability argument for a multi-year hyper-growth run, and (3) the market-ceiling check shows the implied revenue trajectory would require Tesla to capture the majority-to-entirety of the current global automotive industry by FY2032, a share no automaker has ever held. The gap between this reverse-DCF's implied growth and what `04_intrinsic-dcf.md`'s own forward model treats as achievable (a base-case intrinsic value of $8.02/share, ~97.5% below the current price) is not a modeling artifact on either side — it is the same underlying finding read from both directions: the price is not being supported by anything this research program can find in Tesla's cash-flow economics today.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — TSLA

**Reporting standard:** US GAAP. **Reporting currency:** US Dollar (USD), figures in millions except per-share items. **Jurisdiction:** US SEC domestic filer — standard US form names apply [`01_price-and-capital-structure.md` §Header; `FY26 Q2 10-Q, Jul-23-2026, cover page`].

Tesla reports exactly two ASC 280 reportable segments — Automotive, and Energy Generation and Storage [`business-model/03_segment-map.md` §1, citing `FY26 Q2 10-Q, Note 14`]. On a revenue basis Automotive is close to the single-segment 85% threshold (86.5% of FY2025 revenue), but on the only profit split Tesla discloses — **segment gross profit** (Tesla allocates revenue, cost of revenue, and gross profit to segments; it does **not** allocate SG&A, R&D, operating income, or net income to either segment [`business-model/03_segment-map.md` §1 Note 1, §3]) — Automotive is 77.7% of FY2025 gross profit, **below** the 85% collapse threshold, and Energy's gross-profit share has nearly tripled in three years (6.5% → 15.1% → 22.2%, FY2023–FY2025) [`business-model/03_segment-map.md` §2]. This is therefore run as a genuine two-segment SOTP, not collapsed.

**Hard limitation carried through this whole report:** Tesla's own shareholder letters put heavy narrative weight on Robotaxi, Optimus (humanoid robot), Cybercab, and in-house AI-inference chips, but none of these carries any segment or revenue-line disclosure at all — "whatever capital and operating expense they consume is invisible inside the Automotive segment's numbers" [`business-model/03_segment-map.md` §3]. There is no third reportable segment to value. This SOTP can therefore only price the two disclosed segments; any value the market assigns to Robotaxi/Optimus/FSD software/AI chips sits entirely outside it — see §5.

## 1. Segment Inventory

Currency: USD millions. Fiscal year ended Dec-31. **"% of Total EBIT" cannot be computed** — Tesla discloses no segment-level operating income or EBIT (see limitation above). The denominator used below is **% of total reportable-segment gross profit** (Automotive gross profit + Energy gross profit = 100% of disclosed segment gross profit; there is no unallocated/"Other" bucket at the gross-profit line — segment revenue and gross profit sum exactly to consolidated totals in both FY2025A and Q2 FY26 [`business-model/03_segment-map.md` §3]).

| Segment | Revenue (FY2025A) | Gross Profit (FY2025A) | Gross Margin | % of Total Gross Profit | Source |
|---|---:|---:|---:|---:|---|
| Automotive (incl. Services-and-other sub-line) | $82,056mm | $13,292mm | 16.2% | 77.7% | `CIQ Financials_Annual export, Segments tab, FY2025`; `FY26 Q2 10-Q, Note 14` |
| Energy Generation and Storage | $12,771mm | $3,802mm | 29.8% | 22.2% | Same |
| **Total (reportable segments)** | **$94,827mm** | **$17,094mm** | **18.0%** | **100%** | Ties exactly to consolidated FY2025 revenue and gross profit |
| *Memo: unallocated SG&A + R&D (not segment-attributed)* | *n/a* | *($12,739mm)* | — | — | FY2025 Gross Profit $17,094mm − Operating Income $4,355mm = $12,739mm [`earnings/01_historical-financials.md` §1] — this cost sits below the segment note entirely; see §4 for how it is treated |
| *Memo: Robotaxi / Optimus / FSD software / AI chips* | *not disclosed* | *not disclosed* | — | — | No segment or revenue line exists [`business-model/03_segment-map.md` §1, §3] — excluded from this SOTP, see §5 |

No segment collapse: Automotive at 77.7% of disclosed gross profit is below the 85% threshold, and the trend (Energy's gross-profit share nearly tripling since FY2023) argues against treating this as an automotive-only story.

## 2. Segment Multiples & Comparables

**Forward basis:** FY+1 = FY2026E (calendar fiscal year). Tesla gives no segment-level guidance or consensus, so the FY2026E consolidated consensus revenue of $105,415mm (44–46 analysts) [`earnings/04_guidance-consensus.md` §1, §3, citing `EstimatesReport.xls, Consensus tab`] is split between segments using each segment's FY2025A revenue share (Automotive 86.53%, Energy 13.47%) — **Inference, not from filings**, since no segment-level consensus exists. This gives Automotive FY2026E revenue ≈ $91,218mm and Energy FY2026E revenue ≈ $14,197mm. **Sensitivity check:** using the most recent quarter's actual segment mix instead (Q2 FY26: Automotive 88.9% / Energy 11.1% [`business-model/03_segment-map.md` §1]) gives Automotive ≈ $93,696mm / Energy ≈ $11,719mm — a modestly higher Automotive weight, reflecting Energy's lumpy quarter-to-quarter deployment timing. The base case below uses the FY2025A full-year share as the more representative annual split.

| Segment | Metric Used | Multiple Applied (low/base/high) | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| Automotive | FY2026E segment revenue ($91,218mm) | 0.9x / 1.2x / 1.8x | Ford Motor Co. (NYSE:F); General Motors Co. (NYSE:GM) — primary; Rivian (NasdaqGS:RIVN), Lucid (NasdaqGS:LCID) — high-end reference only | Ford NTM TEV/Revenue 1.1x; GM NTM TEV/Revenue 0.93x; Rivian 2.86x; Lucid 3.03x | `Company Comparable Analysis Tesla Inc .xls, Trading Multiples tab, as-of 2026-07-24` |
| Energy Generation and Storage | FY2026E segment revenue ($14,197mm) | 1.5x / 2.5x / 3.5x | Fluence Energy, Inc. (NasdaqGS:FLNC) | ~1.03x EV/Sales (trailing and forward, roughly flat) | `Web: stockanalysis.com/stocks/flnc/statistics, 2026-07-24 (indicative, unverified)`; cross-checked against `Web: multiples.vc/public-comps/fluence-energy-valuation-multiples, 2026-07-24 (indicative, unverified)`, which shows LTM EV/Revenue 0.6x and last-FY 0.8x — the two web sources disagree on Fluence's exact market cap ($1.9–3.66bn across sources found), so this multiple is treated as directional, not precise |

**Why each comparable fits (business economics, not label):**
- **Ford / GM (primary Automotive comps):** both are scaled, capital-intensive vehicle manufacturers that are profitable at the operating line but on thin margins — Ford's LTM EBIT margin is 0.8% and GM's is 5.5% [`Company Comparable Analysis Tesla Inc .xls, Financial Data tab`], bracketing Tesla's own LTM Automotive-driving consolidated EBIT margin of 4.1% ($4,278mm / $103,619mm). Tesla's structurally higher gross margin (16.2% vs Ford 7.1% / GM 10.2% LTM) argues for a multiple above Ford/GM's own ~1.0x NTM EV/Revenue, but the bottom-line (EBIT-margin) evidence — Tesla currently sits *below* GM's EBIT margin — argues against a large premium. Base case 1.2x reflects a modest premium over the ~1.0x legacy-OEM anchor.
- **Rivian / Lucid (high-end reference only):** true pure-play battery-electric manufacturers, the closest product match to Tesla's Automotive segment, but both are loss-making and a fraction of Tesla's scale (LTM revenue $5.5bn and $1.4bn vs Tesla Automotive's ~$82bn) — their 2.9–3.0x NTM multiples price speculative future volume, not realized profitability, so they are used only to bound the high case, not as the primary match.
- **Fluence Energy (Energy comp):** an asset-light designer, manufacturer, and deployer of grid-scale battery energy storage systems — the closest available economic match to Tesla's Megapack-led Energy segment (same activity: design, build, and deploy utility-scale storage hardware), not a generic "clean energy" or residential-solar name. Fluence's own profitability (2% LTM EBITDA margin, near breakeven) is materially weaker than Tesla Energy's disclosed 29.8% FY2025 GAAP gross margin (management's own long-term normalization view is "mid- to low-20% range" gross margin [`earnings/04_guidance-consensus.md` §2]), so a premium to Fluence's ~1.0x multiple is applied rather than using it unadjusted.

**Trailing sanity check only (not fed to `07` as a weighted method):** applying the same base multiples (1.2x / 2.5x) to FY2025A actual segment revenue instead of the FY2026E forward estimate gives a gross EV of $130,395mm and an equity value of ~$37.67/share — close to, and slightly below, the forward-basis base case, consistent with the segments' modest forward growth.

## 3. Segment Valuation

Currency: USD millions.

| Segment | Metric Value (FY2026E) | Multiple (low/base/high) | Segment EV (low/base/high) |
|---|---:|---:|---:|
| Automotive | $91,218 | 0.9x / 1.2x / 1.8x | $82,096 / $109,462 / $164,192 |
| Energy Generation and Storage | $14,197 | 1.5x / 2.5x / 3.5x | $21,295 / $35,492 / $49,689 |
| **Gross enterprise value (sum)** | **$105,415** | *(blended base 1.38x)* | **$103,392 / $144,954 / $213,882** |

For context: Tesla's own consolidated NTM TEV/Forward Total Revenue is **11.15x** and LTM is **11.9x** [`Company Comparable Analysis Tesla Inc .xls, Trading Multiples tab`] — roughly **8x** the ~1.38x blended multiple this SOTP applies using named automotive and energy-storage peers. That gap is the central finding of this report (see §5).

## 4. Equity Bridge

All figures use `01_price-and-capital-structure.md`'s canonical anchors (Reconciliation Gate 1): the **broad** net-debt basis (nets short-term investments as well as cash & equivalents), which `01` itself designates canonical for its EV bridge, backed by its cash-quality check that Tesla's $28.3bn of short-term investments is genuine, largely unrestricted, investment-grade paper (only 0.66% restricted) [`01_price-and-capital-structure.md` §4, §5]. The strict basis ($861mm of net debt) is shown alongside per CLAUDE.md §15 hygiene.

**Net-cash sign discipline:** Tesla is net cash on the broad basis (net debt is a *negative* $27,444mm), so it is added back **once**, as a single positive line — not shown as a separate "net debt" deduction and a separate "net cash" add-back.

**Unallocated corporate costs (Gate 3 — no vanished bucket):** Tesla's FY2025 SG&A + R&D (below the segment gross-profit line, not attributed to either segment) was $12,739mm [`earnings/01_historical-financials.md` §1: Gross Profit $17,094mm − EBIT $4,355mm]. This SOTP does **not** add a separate capitalized-cost deduction for it, because the metric used — **EV/Sales**, not EV/Gross-Profit or EV/EBITDA — is a fully-loaded multiple: each named comparable's own EV/Revenue multiple already reflects that company's complete P&L, SG&A and R&D included. The multiple premium chosen for each Tesla segment (e.g., 1.2x vs Ford/GM's ~1.0x) is explicitly sized off Tesla's own bottom-line EBIT-margin evidence (§2), not off gross margin alone — so the corporate-cost drag is netted through the multiple choice, not dropped by assertion. This satisfies Reconciliation Gate 3 via the "metric already nets the corporate drag" path.

**Equity-method / strategic investments:** Tesla's ~$3,007mm SpaceX equity stake (booked as a long-term investment, sales-restricted until Dec-2026, explicitly **not** netted into `01`'s EV bridge) [`01_price-and-capital-structure.md` §4] is added back here as a non-operating financial asset, since it is not part of either reportable segment's operating economics. Tesla's ~$674mm Bitcoin/digital-assets holding is a further non-operating asset but is <0.3% of gross EV in every scenario and is not added separately (immaterial, consistent with `01`'s own 0.66%-restricted-cash materiality treatment).

| Step | Value ($mm) |
|---|---:|
| Gross enterprise value (base case) | 144,954 |
| − Capitalized unallocated corporate costs | $0 — already netted in the EV/Sales metric (see note above) |
| + Net cash (broad basis; net debt shown as negative, added back once) | +27,444 |
| − Minority interest | (661) |
| + Preferred | 0 |
| + Equity-method / strategic investments (SpaceX stake) | +3,007 |
| − Conglomerate / holdco discount | 0 — none applied (see note below) |
| **= Equity value (base case)** | **174,744** |
| ÷ Diluted shares (per-share fair-value count, approx. fully diluted — `01`'s TSM-proxy, Inference) | 4,252.5mm |
| **= SOTP value per share (base case)** | **$41.09** |
| Range (low–high, from segment multiple dispersion) | $31.32 (low) – $57.30 (high) |
| vs current price ($319.69, 2026-07-23, pool-verified [`01_price-and-capital-structure.md` §1]) | **−87.1%** (base case sits at ~13% of current price) |

**Conglomerate / holding-company discount: none applied.** Automotive and Energy are not separately governed or separately financed businesses — they share Gigafactories, one balance sheet, one board, one R&D and battery-manufacturing base, and no separate reporting/listing structure [`business-model/03_segment-map.md` §1, §3]. There is no structural holding-company complexity (cross-shareholdings, minority-listed subsidiaries, capital-allocation friction between the parts) to discount for; the discipline problem here is the opposite of a holdco discount — see §5.

## 5. SOTP Read

Valuing Tesla's two *disclosed* reportable segments on named, economically-matched forward multiples produces a base-case value of about **$41 per share** (range $31–$57 across the segment-multiple dispersion) against a current price of **$319.69** — the segment-based sum-of-the-parts explains roughly **13% of Tesla's current share price**, not the near-100% a healthy SOTP read would typically reconcile to. Automotive carries most of the segment-level value in absolute dollar terms (about 76% of the base-case gross EV), but Energy earns the richer multiple (2.5x vs 1.2x base) because its gross margin (29.8% FY2025A) and profit-share trend (nearly tripling since FY2023) are structurally healthier than Automotive's — Energy is the smaller segment but the higher-quality one on the data disclosed.

The blunt finding: this SOTP is not "hiding value behind a low multiple" in the usual sense — it is the reverse. Tesla's own consolidated NTM EV/Revenue (11.15x) sits at roughly **8 times** the blended multiple (~1.4x) that named, real-world automotive and battery-storage peers command for businesses with Automotive's and Energy's actual disclosed economics. Nearly nine-tenths of Tesla's enterprise value is therefore **not explained by the Automotive or Energy segment as filed** — it rests on Robotaxi, Optimus, FSD software, and AI-inference-chip ambitions that carry **zero segment or revenue-line disclosure** [`business-model/03_segment-map.md` §3] and cannot be priced by this method at all. Whether that ~$1.1 trillion of un-modeled value is justified is a question for the DCF (`04`), reverse-DCF (`05`), and scenario/fair-value (`07`) modules to take up explicitly — this module can only flag that the gap exists and is almost entirely attributable to businesses Tesla does not yet report.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — TSLA

**Anchors used verbatim from `01_price-and-capital-structure.md`:** current price **$319.69** (2026-07-23, last close, `pool-verified`, fresh — 1 calendar day old, no staleness cap); market-cap share count 3,949,547,394; per-share fair-value share count **≈4,252.5mm** (approximate fully diluted, TSM-proxy — Inference, not from filings); market cap $1,262,630.8mm; enterprise value $1,235,847.8mm (broad cash basis, canonical); net debt $861mm (strict) / net cash $27,444mm (broad), both Jun-30-2026. Reporting currency USD, US GAAP. Business type: **Operating company** (vertically-integrated EV manufacturer + energy storage) per the Business-Type Method Map — FCFF DCF and EV/EBITDA-EV/EBIT-P/E-FCF-yield multiples are the primary methods; SOTP is a supplementary lens for this two-segment operating business, not the primary method (that status is reserved for genuine holding companies).

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | $286.5 base-case point (EV/Sales, own median 11.50x); dispersion $92.4–$417.4 across the six multiples reverted | Low | **0%** (excluded from the weighted base — see below) | 02's own text already flags the earnings-based reversions (P/E, EV/EBIT, EV/EBITDA) as "NOT clearly supported" because Tesla's own denominator collapsed under a still-large price. Even its "least distorted" reading (EV/Sales to its own median) reverts price only to what TSLA has *itself* historically traded at — a circular anchor for a stock whose own multiple history is exactly what `05`'s reverse-DCF and `09`'s moat verdict show has never been earned economically (see §2 for the full reasoning). Retained in the football field for transparency and used as the input for the **bull** case (a re-rating/persistence of the market's own historical multiple), not the base. |
| Relative / peers (03) | $40.19 base-case point (1.3x NTM EV/Sales, quality-adjusted); dispersion $13.23–$40.19 | Medium | **45%** | Anchored to real, named comparables (Ford, GM, BYD, Fluence-analog via `06`) with matched business economics, and explicitly quality-adjusted for Tesla's genuine (if modest) margin/growth/leverage edge over peers — the most externally-grounded multiples read available |
| Intrinsic DCF (04) | $8.02 base (Gordon, WACC 12.38%, terminal g=1.0%); $6.12–$10.52 WACC/g dispersion; $18.30–$39.07 exit-multiple cross-check | Low (terminal >75% of EV, cross-method disagreement >40% between its own two lenses) | **25%** | Primary intrinsic method for an Operating business per the Method Map, and cash-flow-grounded rather than market-price-grounded, but capped in weight because the base case is terminal-dominated (125% of EV) and driven by a guided multi-year capex supercycle that swamps the explicit period |
| Reverse-DCF (05) | (implied, not a value) — price requires a 68.9% 7-year FCF CAGR, or ≈9.3 years at Tesla's own best-ever growth rate, or an economically impossible >100%-of-revenue EBIT margin | n/a | n/a | Cross-check only — confirms the gap between price and the weighted methods is not a modeling artefact: the market-ceiling test shows the implied growth would require Tesla to capture 75–100%+ of the entire global automotive industry by FY2032, a share no automaker has ever held |
| Sum-of-the-parts (06) | $41.09 base (blended 1.38x forward EV/Sales across two segments); range $31.32–$57.30 | Medium | **30%** | Segment-level, comparable-matched (Ford/GM for Automotive, Fluence for Energy), converges tightly with `03`'s peer-comp figure despite being built independently on a segment-by-segment basis — this convergence is itself corroborating evidence |

Weights sum to 100% across the **value-producing methods actually used in the weighted base point** (03, 04, 06). **02 is deliberately excluded (0% weight) from the base-point blend** — a stated, evidenced departure from the module's default "02+03 majority weight" policy (see §2 for the full justification). 04 and 06's combined weight (55%) exceeds the default ≈⅓ cross-check cap for the same stated reason. Reverse-DCF (05) is a cross-check, not a weighted input, per module rules.

## 2. Triangulation & Reconciliation

**Method football field (full dispersion, not narrowed):**

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| 02 Own-history multiples | $286.5 (point) / $92.4–$417.4 (range across 6 multiples) | Low | 0% | Circular anchor for this name (see below); shown for transparency and feeds the bull case only |
| 03 Relative valuation (peers) | $40.19 (point) / $13.23–$40.19 (range) | Medium | 45% | Externally grounded, quality-adjusted, named comparables |
| 04 Intrinsic DCF | $8.02 (point) / $6.12–$39.07 (range, incl. exit-multiple lens) | Low | 25% | Cash-flow-grounded but terminal-dominated and capex-supercycle-driven |
| 05 Reverse-DCF | n/a (cross-check: 68.9% 7yr FCF CAGR required) | n/a | n/a | Confirms the price-to-fundamentals gap is not a modeling artefact |
| 06 Sum-of-the-parts | $41.09 (point) / $31.32–$57.30 (range) | Medium | 30% | Segment-matched comparables; converges independently with 03 |

**The headline finding: this is not a >40% disagreement, it is roughly a 35x spread from top to bottom of the football field ($8.02 to $286.5), and every method — even the richest one — sits far below the $319.69 current price.** This dwarfs the module's 40% disagreement-flag threshold by an order of magnitude and is the single most important fact in this report.

**Reconciliation judgement and the stated departure from the mechanical weighting policy.** The module's default rule for an Operating company with estimates is that `02` (own-history) and `03` (peers) — the two "multiples" methods — jointly carry the majority weight, with `04`/`06` capped as minority cross-checks. That default assumes 02 and 03 broadly agree, or at least both reference an independent notion of what the business is worth. Here they diverge by roughly 7x ($286.5 vs $40.19), and the reason is diagnosable, not noise: `02`'s reversion reverts Tesla's *current* price to Tesla's *own* historical multiple band — a band that has itself never been validated against underlying economics. Three independent pieces of evidence in this same research program show that Tesla's own trading history reflects an unproven optionality premium rather than a demonstrated warranted level: (1) `05`'s reverse-DCF finds the current price requires a 7-year FCF CAGR of 68.9% — beyond anything Tesla has ever sustained (its best 2-year burst was 51–71% off a depressed base, immediately followed by deceleration to an outright FY2025 revenue decline) — and a market-ceiling check showing this would require capturing 75–100%+ of the entire global automotive industry by FY2032; (2) `business-model/09_moat.md` finds **"No moat proven"** with return on capital 210–885 basis points below Tesla's own cost of capital on every basis computed, including the 5-year through-cycle average, and an explicitly **"eroding"** trajectory (ROIC falling every year for three straight years); (3) `business-model/07_business-quality.md` scores aggregate quality **33/100 (Weak)**, anchored by margin stability at 22/100, and flags the rate-of-change/disruption row at 30/100 (≤40, RF-BQ-005) — "closer to a sector/technology-cycle bet than a durable compounder." Given this weight of evidence, using 02's own-history reversion as a majority-weighted fair-value anchor would make the "base case" circular — TSLA is worth what TSLA has always traded for — which fails the triangulation standard. **02 is therefore weighted 0% in the base point** (shown in the football field for transparency, and repurposed as the input for the bull case, where a persistence of the market's own historical multiple *is* the relevant question). In its place, `03` (peer-comp, economically grounded) and `06` (segment SOTP, independently converging with 03 at ~$40–41 despite a different construction method) carry the majority of the weight, with `04` (DCF) a meaningful but capped cross-check given its own terminal-dominance caveat.

**Weighted base-case fair value (executed):**

```
$ python3 tsla_scenario.py
0.45*40.19 + 0.25*8.02 + 0.30*41.09 = 32.42
Implied base EV/Sales multiple: EV=111072 / NTM Rev 110859.9 = 1.002x
```

**Base-case fair value point: ≈$32.4/share** — this reconciles to a warranted NTM EV/Sales multiple of ≈1.0x, sitting almost exactly between `03`'s raw (no-premium) peer median (0.93x, $30.54/share) and its quality-adjusted premium (1.3x, $40.19/share), pulled down modestly by `04`'s capex-supercycle-driven DCF. This is a coherent, non-circular convergence of three independently-constructed methods (peer economics, segment economics, discounted cash flow), corroborated by the reverse-DCF finding that the current price requires unachievable growth.

## 3. Bull / Base / Bear Fair-Value Levels

Built as **NTM EV/Sales × NTM revenue** throughout (the least-distorted metric per both `02` and `03`, given Tesla's currently thin/volatile earnings base), each a single derived level, 12-month horizon unless stated otherwise.

**Executed calculation:**

```
$ python3 tsla_scenario.py
BULL:  NTM Rev 121,946 x 11.5x -> EV 1,402,378 -> Equity 1,429,161 -> $336.08/sh
BASE:  NTM Rev 110,860 x 1.0x  -> EV 110,860   -> Equity 137,643   -> $32.37/sh
BEAR (cyclical trough): NTM Rev 88,688 x 0.7x -> EV 62,082 -> Equity 88,865 -> $20.90/sh
Structural reset (04 declining/runoff terminal, EV-based): EV 30,675 - net debt 861 - minority 661 = equity 29,153 -> $6.86/sh
Headline Bear = worse(lower) of cyclical trough ($20.90) and structural reset ($6.86) = $6.86
```

(Equity bridge used throughout: `Equity = EV + $26,783mm`, the 02/03 broad-basis convention — implied EV − total debt $16,080mm − minority $661mm + cash & ST investments $43,524mm, per `01`'s canonical broad basis. `06`'s SOTP additionally adds back the ~$3,007mm SpaceX stake as a separate non-operating asset; that would add ≈$0.71/share to every level below — a disclosed, immaterial-to-the-conclusion limitation, not reconciled further here.)

| Case | Fair Value / Share (point) | Forward Metric (NTM Revenue) | Multiple (NTM EV/Sales) | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| **Bull** | **$336.08** | $121,946mm (base NTM revenue $110,860mm ×1.10, a delivery beat within the observed single-quarter swing range — Q2'26's 480,126 units vs Q1'26's 358,023 [`earnings/07_earnings-sensitivity.md` §2]) | **11.50x** (02's own 5-year median — a *persistence*, not an expansion, of the market's own historical valuation of this stock; still below 02's own 5-yr mean of 12.15x and max of 22.61x) | 12 months | Deliveries beat by ≈10% AND the market continues to value Tesla near its own 5-year median sales multiple (i.e., the growth/optionality premium the market has paid throughout Tesla's history persists) — this is not a re-rating beyond history, only a continuation of it |
| **Base** | **$32.37** (≈$32.4, ties to §2's triangulated point) | $110,860mm (NTM consensus revenue) [`02_multiples-own-history.md` §1, EstimatesReport.xls] | **1.00x** (blended/warranted — between 03's raw peer median 0.93x and its quality-adjusted 1.3x, discounted for 04's capex-supercycle drag) | 12 months | Consensus NTM revenue is delivered; the market re-prices Tesla toward what its actual disclosed economics (peer-comparable margin/growth/leverage edge, no proven moat) warrant, rather than continuing to price unmonetized robotaxi/Optimus/FSD optionality |
| **Bear (headline)** | **$6.86** (structural reset — see below; worse of the two bear inputs) | Reset EBIT margin 5.0% (below the 8.5% base-case terminal margin) on `04`'s own guided revenue/capex path, D&A 8.0% of revenue, capex 6.5% of revenue, g=1.0% [`04_intrinsic-dcf.md` §5] | Terminal EV/EBITDA implied ≈1.0x on the reset EBIT base (impaired terminal multiple) | 24–36 months (a permanent-impairment path, not a 12-month dip) | Automotive gross-margin erosion continues (16.2% FY2025 → further decline) rather than stabilizing as the regulatory-credit runoff completes; robotaxi/Optimus/FSD continue to consume capital without a matching return; BYD/Chinese-EV share gains continue (Tesla 8.8% vs BYD 12.1% global BEV share, FY2025 [`business-model/08_competitive-map.md` §3]) |

**Bear case — two inputs, headline is the worse (lower) of the two, per the confirmed eroding-moat trigger.**

1. **Cyclical through-cycle trough ($20.90/share).** NTM revenue at $88,688mm (base ×0.80, a 20% miss) × 0.70x NTM EV/Sales (compressed below `03`'s raw peer median of 0.93x, reflecting a demand downturn plus continued no-moat de-rating). This is wider than the ±10% single-variable move sized in `earnings/07_earnings-sensitivity.md` §2 because Tesla has **under one full standalone cycle** — its worst annual result to date (FY2025 revenue −2.9%, the only annual decline in its history [`earnings/01_historical-financials.md` §1]) may itself understate a genuine industry-wide downturn. Absent a Tesla-specific full-cycle precedent, the trough is widened using the **industry prior-downturn** as the named analog: global auto demand fell roughly 20–30% during the 2008–09 financial crisis and legacy OEMs (GM, Chrysler) required government support — an industry-level analog, not a Tesla-specific data point, and labeled as such (**Inference, not from filings**). The compressed 0.70x multiple reflects the moat module's own "No moat proven" / "eroding" verdict, i.e., a downturn removes any residual growth-premium credit the market currently extends.
2. **Structural reset / permanent-impairment floor ($6.86/share) — the avoid-ruin trigger.** `business-model/09_moat.md` returns **"No moat proven"** AND an explicitly **"eroding"** moat trajectory (ROIC fell every year for three straight years, gap to WACC widening, not narrowing), which trips the CLAUDE.md §24 Filter-5 structural-reset requirement. Per the graduated rule, **because the moat trajectory is confirmed eroding (not merely a bare unproven moat), the structural reset becomes the headline Bear** — the more likely down-leg here is genuine, not merely cyclical. This uses `04_intrinsic-dcf.md`'s own declining/runoff terminal (§5 of that report): terminal EBIT margin fades to 5.0% (below the already-conservative 8.5% base-case terminal margin), D&A held at 8.0% of revenue, capex cut to 6.5% of revenue, g=1.0% — an EV-based reset (impaired DCF EV = $30,675mm). Bridged per `01`'s canonical strict net-debt/minority anchor (net debt subtracted **before** dividing by shares, since this is an EV-based reset, not an already-equity multiple): `Equity = $30,675mm − $861mm (net debt, strict) − $661mm (minority) = $29,153mm`; `÷ 4,252.5mm shares = $6.86/share`. This reconciles exactly to `04`'s own published figure — no re-derivation needed, only the bridge is reproduced here for traceability.

**Headline Bear = $6.86/share** (the structural reset), because it is the lower (worse) of the two bear inputs and the moat trajectory is confirmed eroding, not merely unproven. The cyclical trough ($20.90) is shown alongside as the nearer-term (12-month) marker; the structural reset reflects a multi-year path and is dated accordingly.

No probabilities are assigned to bull/base/bear — that is the master synthesizer's task.

## 4. Margin of Safety & Downside (two separate metrics)

**Executed calculation:**

```
$ python3 tsla_scenario.py
Price: $319.69
Base FV: $32.37  Bear FV (headline): $6.86
Implied upside to base = (32.37-319.69)/319.69 = -89.9%
Margin of safety = (32.37-319.69)/32.37 = -887.7%
Downside to bear = (319.69-6.86)/319.69 = 97.9%
```

| Metric | Value |
|---|---:|
| Current price | $319.69 (2026-07-23, `pool-verified`, fresh — no staleness cap) |
| Base-case fair value (point) | $32.37/share |
| Bear-case fair value (headline, structural reset) | $6.86/share |
| Implied upside to base case = (base FV − price) / price | **−89.9%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−887.7%** (price sits far ABOVE base fair value; there is no cushion, only a large embedded premium) |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **97.9%** |

Both metrics are fully assessable: the price is `pool-verified` and fresh (1 calendar day old), so no cap applies. The two numbers are deliberately different and both severe in the same direction: at today's price, there is no margin-of-safety cushion by any method in this report's weighted base, and the loss to the bear case (structural reset) would be nearly total.

## 5. Warranted-Multiple Check

The base-case fair value (≈$32/share) implies a ≈1.0x NTM EV/Sales multiple — a multiple this business's own disclosed economics support: peer-comparable margin, growth, and leverage advantages (18.9% LTM gross margin vs Ford's 7.1%/GM's 10.2%; +11.75% LTM revenue growth vs peer median +3.76%; 15.5% debt/capital vs peer median ~54% [`03_relative-valuation-peers.md` §4]), set against a moat module verdict of **"No moat proven"** and an **"eroding"** trajectory, and a business-quality aggregate of 33/100. That is a defensible, deserved multiple — not a discount imposed for effect. By contrast, the current $319.69 price implies roughly **11.15x NTM EV/Sales** — a multiple that requires, per the reverse-DCF (`05`), a 68.9% seven-year FCF CAGR that Tesla has never sustained for more than two years and that would require capturing the majority-to-entirety of the global automotive industry by FY2032. **This is value-trap risk in reverse: the risk here is not a cheap stock that stays cheap, but an expensive stock whose premium is not supported by any economic evidence this research program can find** — the moat module's own language is that Tesla's structural advantages "have not translated into economic value creation." No RF-OWN-004 structurally-misaligned-owner trigger applies here (`management-governance/99_management-governance-synthesis.md` tested and did not trip it), so this finding rests entirely on the fundamentals evidence, not an ownership-structure caveat.

## 6. Fair-Value Read

Triangulating three independently-constructed, economically-grounded methods (peer comparables, segment sum-of-the-parts, and discounted cash flow — deliberately excluding Tesla's own circular multiple history from the weighted blend) produces a base-case fair value of **≈$32/share**, with a bull case of **$336/share** (if the market simply continues to pay what it has historically paid for this stock, rewarded by a delivery beat) and a headline bear case of **$6.86/share** (a structural reset, triggered because `business-model/09_moat.md` finds "No moat proven" on an explicitly **eroding** trajectory — the worse of that reset and a $20.90 cyclical through-cycle trough). Against today's $319.69 price, there is **no margin of safety** (−887.7%, i.e., a large embedded premium rather than a cushion) and a **97.9% downside to the bear case**. The relative-valuation (`03`) and sum-of-the-parts (`06`) methods drive this answer — they converge independently at $40–41/share despite different construction methods — while the reverse-DCF (`05`) corroborates the gap by showing the price requires growth that would need Tesla to out-produce the entire existing global automotive industry. The single biggest swing factor between bull and bear is not a company-specific operating lever but **whether the market continues to price Tesla's unmonetized robotaxi/Optimus/FSD optionality at anything like its historical multiple, or re-prices the stock toward what its disclosed, filed segment economics (Automotive and Energy alone) actually support** — a binary sentiment/narrative question this valuation module cannot resolve, only frame.
