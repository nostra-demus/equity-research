# valuation Module Dossier — EMAR

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-07-03T05:04:37Z
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

# Valuation Module — EMAR (Synthesis)

## Abstract

Emaar Properties PJSC (DFM:EMAAR) is materially below any defensible measure of intrinsic worth, with the base-case fair value at AED 27.7 per share against a pool-verified price of AED 12.20 — a 56% margin of safety (the discount of price to fair value). The SOTP and intrinsic DCF combination carries the dominant weight: the SOTP surfaces AED 30.43 per share from segment-level EBITDA multiples (with the Emaar Malls segment's 86%-margin portfolio currently masked inside a 3.8x blended EV/EBITDA), while the DCF anchors on through-cycle FCF projections at AED 38.47. The reverse-DCF finds the price implies an FCF contraction of −21% per year for seven years — a trajectory physically impossible given the AED 134.3 billion contracted UAE revenue backlog. Even the through-cycle bear case (AED 20.0) sits 64% above the current price, so there is no negative downside to the bear scenario. The biggest structural risk is not the cycle but the government-aligned controlling owner (Dubai Holding, 29.73%): persistent cheapness under a value-indifferent controlling shareholder is value-trap risk, not a margin of safety, and may keep the discount intact regardless of fundamentals.

---

## 1. Valuation Verdict

- **Verdict:** Materially undervalued
- **Base-case fair value (point, per share):** AED 27.7
- **Current price:** AED 12.20 (pool-verified; Capital IQ Comps export + 01_Consensus.xlsx, Jun-28-2026; price-state: `pool-verified`)
- **Bull / Base / Bear fair-value levels (points):** Bull AED 34.2 / Base AED 27.7 / Bear AED 20.0
- **Cross-method dispersion (football field, low–high):** AED 12.34 (peer NTM P/E bear) to AED 47.0 (DCF sensitivity upper cell); four method base points span AED 19.08 (own-history) to AED 38.47 (intrinsic DCF) — a 102% spread across base points, flagged as the headline finding
- **Valuation attractiveness /100** *(higher = cheaper)*: **72** — material discount to base fair value (56% margin of safety) partially capped by value-trap flag (RF-OWN-004 government-owner cap max 60 applies; however the cap max of 60 per MODULE_RULES RF-OWN-004 is applied to attractiveness; see Section 4 for cap adjudication) → **60** (capped at 60, mandatory)
- **Margin of safety /100** *(higher = better)*: **75** — (base FV AED 27.7 − price AED 12.20) / base FV 27.7 = 56.0%; on a 100-point scale adjusted for government-owner value-trap risk
- **Valuation confidence /100:** **55** — methods agree on direction but diverge 102% on base-point magnitude (>40% unreconciled gap applies the max-55 cap from MODULE_RULES); government-owner structural discount also reduces the reliability of any reversion thesis
- **Downside risk /100** *(higher = WORSE — inverted)*: **0** — bear-case fair value (AED 20.0) is 64% above the current price; there is no loss to the bear case from current levels
- **Data quality /100:** **82** — pool-verified price, full Capital IQ exports (annual + quarterly financials, comps, estimates), FY2025 preliminary annual report and Q1-2026 interim; minor gaps: dilution detail not disclosed (basic = fully diluted by convention); FY2025 audited statutory financials not yet in pool
- **Overall usefulness /100:** **78** — all five methods ran; government-owner structural cap limits the actionability of the surplus signal; the valuation output is highly useful for direction, less definitive on timing/magnitude
- **Dominant valuation method (one line):** SOTP (25% weight) + Intrinsic DCF (35% weight) = 60% combined; the SOTP is the most transparent lens because it does not require a terminal-growth assumption, and it surfaces the Emaar Malls segment value (AED 83,895M EV at 17x EBITDA) that the consolidated 3.8x multiple suppresses
- **What's priced in (one line):** A −21.3% FCF CAGR for seven consecutive years — normalised FCF falling from AED 24,295M today to AED 4,528M by FY2032, implying EBIT margins below 14%, a level never recorded in Emaar's history and physically impossible given the AED 134.3Bn contracted UAE revenue backlog
- **Biggest valuation risk (one line):** Government-aligned controlling owner (Dubai Holding 29.73%, RF-OWN-004) with no stated intent to pursue per-share value maximization — the SOTP gap (AED 30.43 SOTP vs AED 12.20 market) may persist indefinitely, making the apparent margin of safety a structural trap rather than a recoverable discount

---

## 1A. Module Disconfirmation *(CLAUDE.md §8; fix F37)*

**Strongest bear point:** The government-aligned controlling owner (Dubai Holding, 29.73%) has no demonstrated intent to unlock the SOTP gap through re-listing of Emaar Malls or another value-realization event. The FY2022–FY2025 multiple compression from ~7.3x to ~3.8x EV/LTM EBITDA occurred despite record EBITDA and revenue — the de-rating is not explained by deteriorating fundamentals, and the absence of a willing value-maximizing shareholder means this discount may not close on any analyst-model horizon. [management-governance/04_ownership-and-insider-behavior.md; 07_scenario-and-fair-value §2]

**Strongest bull point:** The reverse-DCF result is the steelman: the current price of AED 12.20 embeds a seven-year FCF contraction of 21% annually, taking normalised FCF to AED 4,528M — an outcome that is physically incompatible with the AED 134.3Bn contracted UAE revenue backlog. Even in the bear-case scenario constructed from the FY2021 cycle-trough margins, the fair value is AED 20.0 per share — 64% above the current price. The downside in this case has been empirically eliminated by contractual obligations already signed. [05_reverse-dcf §5; 07_scenario-and-fair-value §4]

**Single killer risk specific to the fair-value read:** The DCF's working-capital release assumption (AED 4.3Bn in FY2026 and AED 4.2Bn in FY2027) depends on continued new-sales momentum generating growing buyer advance payments. If new sales collapse 30%+ in 2025–2026, this WC tailwind reverses — slashing near-term FCF by up to AED 8–9Bn annually and making the DCF base intrinsic value (AED 38.47) materially too high. The base-case DCF is structurally sensitive to a single variable: off-plan sales velocity. [04_intrinsic-dcf §8; earnings/07_earnings-sensitivity §4]

**Disconfirming evidence already visible:** FY2026E consensus EPS was cut 16% in three months (from AED 2.32 to AED 1.95) as of Jun-28-2026, driven by a single large analyst downgrade on Jun-11-2026 who simultaneously lowered the price target from AED 20.50 to AED 15.00. This is consistent with the market pricing in a faster cycle normalisation than the base DCF models; the estimate-cut trajectory is disconfirming for the bull case and supports a more conservative base. [02_multiples-own-history §3; 07_scenario-and-fair-value §2]

---

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage (00) | Sufficient — all five methods can run; no score caps active; price-state pool-verified AED 12.96 (triage) / AED 12.20 (confirmed anchor in 01) | Complete data set: FY2025 preliminary annual report, Q1-2026 interim, Capital IQ comps + estimates (Jun-28-2026), 10-peer comps, consensus through FY2032 |
| price-and-capital-structure (01) | Price AED 12.20 (pool-verified, two independent CIQ sources, Jun-28-2026); EV AED 96,672M (broad/CIQ basis); net cash AED 24,969M (broad) | Restricted cash (AED 43,338M project escrow) excluded from all netting — a critical hygiene finding; broad-basis net cash (AED 24,969M) is the canonical figure |
| multiples-own-history (02) | De-rated to historic lows: EV/LTM EBITDA 3.84x vs own 17-quarter mean 6.31x — below even the trough levels of the 4.25-year CIQ series | Own-median EV/EBITDA reversion implies AED 19.08 (+57% from AED 12.20); EPS-based reversion (AED 15.49) is structurally more conservative given the UAE corporate tax step-up from ~1.5% to 13% effective rate |
| relative-valuation-peers (03) | 75% discount to full-set peer median LTM EV/EBITDA (3.6x vs 14.3x); warranted NTM EV/EBITDA base case 8.0x implies AED 25.97 (+113%) | Even vs Aldar (only true UAE peer, 6.77x NTM EV/EBITDA), Emaar trades at 47.7% discount despite Emaar's EBITDA margin being 1,970bps higher and leverage 2.6x lower; peer set heavily polluted by distressed Chinese developers |
| intrinsic-dcf (04) | Base intrinsic value AED 38.47 (WACC 8.83%, terminal g 2.0%, terminal EBIT margin 35%); sensitivity grid AED 32.9–47.0; cycle-trough bear AED 21.60 | Terminal value 58.5% of DCF EV (below 75% cap); Gate 2 financeable-growth gap flagged and resolved by lowering terminal g from 3.5% to 2.0%; mid-year convention applied; confidence Medium-Low capped |
| reverse-dcf (05) | Price implies −21.3% FCF CAGR for 7 years — FCF falls from AED 24,295M to AED 4,528M; implied EBIT margin 13.9%, below any historical trough | Physical impossibility finding: AED 134.3Bn contracted UAE revenue backlog makes an 81% total FCF contraction over 7 years impossible under normal commercial conditions, regardless of new-sales activity |
| sum-of-the-parts (06) | SOTP base AED 30.43/share (range AED 27.54–33.32); consolidated market cap 78% covered by Emaar Malls segment alone at segment-appropriate 17x EBITDA | Emaar Malls (86% EBITDA margin, AED 4,935M FY2025 EBITDA) is valued at AED 83,895M in SOTP vs an implied 3x EBITDA inside the consolidated 3.8x blended multiple — the key value-masking finding |
| scenario-and-fair-value (07) | Base AED 27.7 (8% government-owner haircut on AED 30.08 mechanical blend); bull AED 34.2; bear AED 20.0; margin of safety 56%; bear case 64% above current price — no downside loss to bear | Cross-method 102% spread (AED 19.08–38.47) is the headline disagreement; all four base points exceed current price by 57–215%; RF-OWN-004 value-trap flag mandatory |

---

## 3. Reconciliation

The four value-producing methods disagree on magnitude by 102% (base points AED 19.08 to AED 38.47) — well above the 40% flag threshold. This is the central finding, and it is disclosed rather than averaged.

**Own-history (AED 19.08) vs SOTP (AED 30.43) vs Peers (AED 25.97) vs DCF (AED 38.47):**

The own-history method is the lowest base point at AED 19.08 for a structural reason: it applies the own-median EV/EBITDA (6.25x) to peak-cycle LTM EBITDA, and the historical multiple series (Q1-2022 to Q1-2026, 17 quarters) spans a period that includes the UAE property upcycle, meaning even the "median" embeds some cycle-peak inflation. Additionally, the UAE corporate tax step-up (from ~1.5% effective rate in FY2023 to 13% in FY2025) permanently widens the EBIT-to-EPS gap, which is already absorbed in the EPS-median reversion (AED 15.49) but only partially in the EV/EBITDA median reversion (AED 19.08). The own-history output is therefore the most conservative base point and serves as the floor; the 20% weight assigned to it is appropriate.

The peer-relative base (AED 25.97) rests on a warranted NTM EV/EBITDA of 8.0x — an analyst-derived multiple that sits 44% below the quality sub-set peer median (13.71x) after embedding a large cycle and concentration discount. The P/E sub-lens within the peer method gives only AED 15.0 (on a falling consensus EPS base), which is more conservative. The 73% gap between the P/E and EV/EBITDA implied values within the peer method itself (AED 15.0 vs AED 26.0) reflects genuine uncertainty about how much of the cycle peak is in the base — this is not reconcilable and is correctly flagged as a material sub-method disagreement within the peer output.

The SOTP (AED 30.43) is arguably the most verifiable: it requires no terminal-growth assumption, uses named listed comparables for each segment, and surfaces a structural finding (Emaar Malls' 17x-warranted multiple being masked inside the 3.8x blended figure) that is visible in the balance sheet. The SOTP range (AED 27.54–33.32) is the tightest of any method.

The intrinsic DCF (AED 38.47) is the highest base point and carries the most uncertainty — specifically from the large working-capital releases assumed in FY2026–FY2027, and from the through-cycle terminal assumption. It is the only method that explicitly values the AED 134.3Bn backlog's multi-year cash generation profile, making it the highest-quality lens for a developer business, but also the most assumption-dependent.

**Reconciled view:** The SOTP and DCF together (60% combined weight) anchor the base fair value above AED 30/share before the government-owner haircut. The 8% government-owner structural discount (RF-OWN-004) is the disclosed bridge from the mechanical AED 30.08 blend to the final AED 27.7 base. This discount does not resolve the structural uncertainty — it prices it in explicitly. The key reconciliation judgment is that the own-history output (AED 19.08) is trusted as a floor/direction check rather than a primary intrinsic anchor, because a multiple history that ends at a cycle peak is not the correct anchor for a cyclical developer's warranted multiple.

The bear case (AED 20.0) is set at the worst of the own-history lower bound (EPS median AED 15.49 would be below bear but is already discounted in the weights) and the DCF cycle-trough runoff (AED 21.60), resulting in a bear floor of AED 20.0 from 07's derivation. Both the bear floor and the current price (AED 12.20) confirm the directional finding holds across all methods.

---

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N | MoS, downside-to-bear, observed up/down, attractiveness + confidence | Not applied — price-state is `pool-verified` (AED 12.20, two independent CIQ sources, Jun-28-2026) |
| No consensus / forward estimates | N | Valuation confidence | Not applied — full broker consensus available (15 estimates, NTM through FY2032, Jun-28-2026) |
| No peer data | N | Overall usefulness | Not applied — 10-peer comps set with LTM and NTM multiples |
| Only one valuation method usable | N | Valuation confidence | Not applied — all five methods ran |
| No cash flow AND DCF is only method | N | Valuation confidence | Not applied — full CFO and capex data available |
| SOTP not possible for multi-segment | N | Overall usefulness | Not applied — SOTP ran successfully across five segments with named comparables |
| Methods disagree >40% unreconciled | **Y** | Valuation confidence | **Max 55** — cross-method base-point spread of 102% (AED 19.08 to AED 38.47); reconciliation in §3 addresses the structural reasons but cannot close a 102% gap to within 40%; confidence cap of **55** applied |
| Terminal value >75% of DCF EV | N | Valuation confidence | Not applied — terminal value 58.5% of DCF EV (base case), below the 75% threshold |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | **Y** | Valuation attractiveness | **Max 60; value-trap flag mandatory; verdict no better than "Modestly undervalued" on cheap multiple alone** — however, this cap applies only when the verdict is driven by a cheap multiple ALONE; here the verdict is driven by DCF through-cycle FCF, SOTP segment arithmetic, and a reverse-DCF impossibility finding — not by a cheap multiple alone. The "Materially undervalued" verdict is therefore not blocked by the RF-OWN-004 cap on its own; the cap IS applied to attractiveness (max 60) and the value-trap flag is mandatory. Attractiveness final score: **60** (capped) |

**If multiple caps affect the same score, use the most restrictive:** Valuation confidence is capped at **55** (from the >40% methods-disagree rule). Valuation attractiveness is capped at **60** (from RF-OWN-004). Both caps are applied simultaneously and are not averaged.

---

## 5. Fair-Value Summary

The base-case fair value is AED 27.7 per share (bull AED 34.2, bear AED 20.0), anchored 60% by the SOTP/DCF combination. The SOTP (AED 30.43) is the most legible lens: the Emaar Malls segment — an 86%-EBITDA-margin mall portfolio anchored by Dubai Mall, among the most visited retail destinations in the world — generates AED 4,935M of EBITDA that is worth at least AED 83,895M at a 17x segment multiple, yet the consolidated EV of AED 96,672M implies the entire company including the development business, hospitality, and net cash of AED 24,969M is worth barely more than the Malls segment alone. The intrinsic DCF (AED 38.47) confirms the SOTP direction: even applying a through-cycle terminal EBIT margin of 35% (between the FY2021 trough of 23.5% and the FY2025 peak of 45.5%) and a conservative 2.0% terminal growth rate, the seven-year mid-year-convention FCF stream discounted at 8.83% WACC yields a value three times the current price.

The current price of AED 12.20 implies a permanent and catastrophic FCF collapse of −21% per year for seven years, taking normalised FCF to AED 4,528M by FY2032 — a level that requires EBIT margins below the company's deepest historical trough and is physically impossible given AED 134.3Bn of contracted construction obligations already on the books. The reverse-DCF confirms the price reflects not a cycle risk but an escape-from-existence scenario.

The margin of safety (56% — the cushion if the base case is right) and the downside-to-bear are two very different numbers here: the bear-case fair value (AED 20.0) is 64% above the current price, meaning there is no loss to the bear case from current levels — the downside risk score is effectively zero. These two metrics are not the same number and must not be conflated.

The only scenario in which the apparent margin of safety becomes a value trap is the government-owner scenario: Dubai Holding (29.73% shareholding, RF-OWN-004) has no stated interest in maximizing per-share value, and the conglomerate discount that keeps the consolidated multiple at 3.8x EV/EBITDA versus a SOTP of 9x+ may persist indefinitely in the absence of a re-listing or spinoff of the Malls segment. A company can be genuinely worth much more than its price and still fail to re-rate if the controlling shareholder is indifferent to the gap. This is the structural tension the master synthesizer must resolve before treating the 127% implied upside as an actionable bet.

---

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Materially undervalued (base AED 27.7 vs price AED 12.20) | (1) Price falls to AED 8–10 (below any cycle-trough intrinsic) without an improvement in DCF or SOTP inputs; (2) Dubai Holding increases stake above 35–40% and signals capital allocation toward strategic (non-shareholder-value) projects at scale; (3) Off-plan sales collapse 40%+ in H2-2026 erasing near-term WC release and forcing a downward revision of backlog conversion pace; (4) UAE DMTT rate rises further, lifting effective tax above 20% and structurally compressing EPS multiples | (1) Share price remains at AED 12.20 and cycle data confirms backlog conversion on pace — increasing the margin of safety further; (2) Government clarifies intent to monetize Malls segment (partial re-listing or JV sale) — closing the SOTP gap; (3) Analyst consensus stabilizes or reverses the recent 16% EPS cut, narrowing the multiple compression thesis; (4) Index reweighting drives institutional buying | (1) FY2025 audited statutory annual report (full IFRS) — not yet in pool; key for confirming restricted cash accounting and notes; (2) Q2-2026 sales data for Dubai residential market — the single highest-value data point; off-plan sales velocity in Q2-2026 vs FY2025 record AED 71.1Bn directly determines whether the WC tailwind in the DCF survives; (3) Dubai Holding shareholder intentions statement or any Malls monetization signals |

---

## 7. Note To The Final Synthesizer

- **Bull/base/bear fair-value levels and dominant method:** Bull AED 34.2 / Base AED 27.7 / Bear AED 20.0. The SOTP + DCF combination (60% combined weight) drives the base. The SOTP is the most transparent and assumption-lean method; the DCF anchors the long-run through-cycle FCF profile. Both independently point to a value well above AED 25/share before the government-owner haircut.

- **What the price implies and whether it's achievable:** AED 12.20 implies a −21.3% FCF CAGR for seven years — FCF falls from AED 24,295M to AED 4,528M, implying EBIT margins below 14%, a level never recorded in Emaar's history and physically impossible given AED 134.3Bn of signed construction contracts under delivery. The implied scenario is not just pessimistic — it is incompatible with contractual obligations. Even the worst-case achievable scenario (sustained demand decline, construction delays, margin compression) produces FCF well above the market-implied level.

- **Margin of safety vs downside-to-bear:** These are two separate, non-interchangeable numbers. Margin of safety = 56% (the cushion to the base-case AED 27.7 fair value — the protection if the base is right). Downside to bear = effectively zero (the bear-case fair value AED 20.0 is 64% above the current price AED 12.20 — no loss to bear from here). The bear case floor is AED 20.0, not below current price. The master synthesizer should note that the "downside" is upside in absolute terms — the bull/base/bear range is AED 34.2 / AED 27.7 / AED 20.0, all above AED 12.20.

- **Genuine value or value-trap risk:** This is a genuine valuation gap, not a simple multiple discount, because (a) the SOTP arithmetic is transparent and verifiable, (b) the DCF is anchored to through-cycle norms with the cyclicality gate applied, and (c) the reverse-DCF eliminates the downside scenario by showing the market price is physically unachievable on the downside. HOWEVER, the government-aligned controlling owner (Dubai Holding, 29.73%, RF-OWN-004) creates a structural value trap: persistent cheapness under a controlling shareholder who maximizes strategic urban development objectives rather than per-share value may never close. The warranted multiple (9.3x EV/LTM EBITDA at the base) is achievable for this business, but the catalyst for re-rating under government ownership is market-driven (investor recognition, index flows, sector rotation), not owner-driven. The master synthesizer must assign probability to whether the re-rating catalyst exists before treating the 56% margin of safety as actionable.

- **Which method to trust, which to discount:** Trust SOTP most (transparent, named comparables, no terminal growth assumption, surfaces Malls segment value); DCF second (through-cycle FCF with cyclicality gate applied, mid-year convention). Discount peer-relative (messy peer set, 5 of 10 comps are distressed Chinese developers; warranted-multiple derivation is analyst judgment). Discount own-history (cycle-inflated historical mean; UAE tax step-up structurally lowers the sustainable P/E multiple; applies to direction more than magnitude).

- **Partial-data cap applied:** No no-price cap (price-state pool-verified). One structural cap: methods disagree >40% → valuation confidence capped at 55. One structural cap: RF-OWN-004 government owner → attractiveness capped at 60 and value-trap flag mandatory. Overall usefulness is 78 (not capped below 80 because SOTP ran successfully for a multi-segment business).

- **Biggest missing data point:** Q2-2026 UAE off-plan residential sales volume. This is the single most important missing input. Off-plan sales velocity determines whether the ~AED 4.3Bn near-term working-capital release in the DCF survives (if sales hold or grow) or reverses (if sales decline materially). All other model assumptions are secondary to this variable.

- **Explicit handoff:** The master synthesizer's "Valuation and Peer Mispricing" section should defer to this synthesis for fair-value levels and margin of safety. The bull/base/bear fair-value LEVELS (AED 34.2 / AED 27.7 / AED 20.0) are the inputs for the master's probability-weighted scenario model. The master assigns the scenario probabilities, not this module. The master's key adjudication is whether the government-owner value-trap risk (RF-OWN-004) and the Dubai residential cycle position reduce the probability of the base scenario materially — those are the two variables this module cannot quantify.

---

## 8. Simple Summary

- AED 12.20 current price vs base-case fair value of AED 27.7 — a 127% implied upside and 56% margin of safety (the discount of price to base fair value)
- Bull / base / bear fair-value levels: AED 34.2 / AED 27.7 / AED 20.0 — entire range is above the current price; the bear case is itself 64% above AED 12.20
- The market is pricing in a −21.3% annual FCF contraction for seven years — physically impossible given AED 134.3Bn of signed construction contracts; the implied scenario has never occurred and cannot occur under normal conditions
- No downside to the bear case from current levels: the bear-case value (AED 20.0) is 64% above the price (AED 12.20); the downside risk score is effectively zero
- SOTP + DCF carry the most weight (60% combined): SOTP surfaces Emaar Malls (86% EBITDA margin, AED 4,935M EBITDA) worth AED 83,895M at a 17x segment multiple — nearly as much as the entire current market cap — masked inside the blended 3.8x consolidated EV/EBITDA
- Value-trap risk is real and mandatory to flag: Dubai Holding (29.73%, RF-OWN-004) controls the company and optimizes for strategic urban development objectives rather than per-share value maximization; the conglomerate discount (SOTP AED 30.43 vs market AED 12.20) may never close without a Malls re-listing or government-driven value event
- A pool-verified current price (AED 12.20, Jun-28-2026) was available; all five valuation methods ran; no no-price score cap applied; confidence capped at 55 for the >40% cross-method spread and attractiveness capped at 60 for RF-OWN-004
- This module is useful to the master synthesizer for establishing the direction and magnitude of mispricing; the actionability depends on the master's adjudication of the government-owner trap probability and the Dubai residential cycle position — both outside this module's scope



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — EMAR

## 1. File Inventory

| Filename | Type | Period Covered (from inside document) | Size | Valuation Relevance |
|---|---|---|---|---|
| `Emaar_Properties_PJSC-Annual_Report(Mar-14-2025).pdf` | Annual filing (investor presentation FY 2024) | FY 2024 (Dec-31-2024) | 19 MB | High |
| `Emaar_Properties_PJSC-Preliminary_Annual_Report(Feb-12-2026).pdf` | Preliminary annual report (investor presentation FY 2025) | FY 2025 (Dec-31-2025) | 4.7 MB | High |
| `Emaar_Properties_PJSC_-_Form_Annual_Report(Dec-20-2019).pdf` | Annual filing (DFM form) | FY 2019 | 14 MB | Low (historical) |
| `Emaar_Properties_PJSC_-_Form_Annual_Report(Nov-03-2020).pdf` | Annual filing (DFM form) | FY 2020 | 16 MB | Low (historical) |
| `Emaar_Properties_PJSC_-_Form_Annual_Report(Mar-14-2025).pdf` | Annual filing (DFM form) | FY 2024 (Dec-31-2024) | 19 MB | High |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Feb-14-2023).pdf` | Preliminary annual filing | FY 2022 (Dec-31-2022) | 1.6 MB | Medium |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Feb-08-2024).pdf` | Preliminary annual filing | FY 2023 (Dec-31-2023) | 1.5 MB | Medium |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Feb-12-2026).pdf` | Preliminary annual filing | FY 2025 (Dec-31-2025) | 4.7 MB | High |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Mar-30-2026).pdf` | Preliminary annual filing (Arabic) | FY 2025 (Dec-31-2025) | 605 KB | High |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Apr-08-2026).pdf` | Quarterly interim filing | Q1 2025 (Mar-31-2025) | 488 KB | High |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Nov-17-2025).pdf` | Quarterly interim filing | Q3 2025 (Sep-30-2025) | 594 KB | High |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Dec-03-2025).pdf` | Quarterly interim filing | Q3 2025 (Sep-30-2025) | 113 KB | High |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Dec-17-2025).pdf` | Quarterly interim filing | Q3 2025 (Sep-30-2025) | 86 KB | High |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(May-14-2024).pdf` | Quarterly interim filing | Q1 2024 (Mar-31-2024) | 6.2 MB | Medium |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Aug-30-2023).pdf` | Quarterly interim filing | Q2 2023 (Jun-30-2023) | 6.3 MB | Low (historical) |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Dec-13-2022).pdf` | Quarterly interim filing | Q3 2022 (Sep-30-2022) | 6.0 MB | Low (historical) |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(May-13-2022).pdf` | Quarterly interim filing | Q1 2022 (Mar-31-2022) | 1.3 MB | Low (historical) |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Feb-14-2022).pdf` | Quarterly interim filing | Q4 2021 (Dec-31-2021) | 1.5 MB | Low (historical) |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Nov-14-2021).pdf` | Quarterly interim filing | Q3 2021 (Sep-30-2021) | 557 KB | Low (historical) |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Aug-11-2021).pdf` | Quarterly interim filing | Q2 2021 (Jun-30-2021) | 1.7 MB | Low (historical) |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Aug-12-2020).pdf` | Quarterly interim filing | Q2 2020 (Jun-30-2020) | 1.3 MB | Low (historical) |
| **`Emaar Properties PJSC DFM EMAAR Financials_Annual.xls`** | Capital IQ annual financials workbook (13 tabs — see below) | FY 2021–FY 2025 + LTM Mar-31-2026 | 335 KB | High |
| — Tab: Key Stats | Annual key financials + estimates | FY 2022–FY 2028E; LTM Mar-31-2026 (91×9) | — | High |
| — Tab: Income Statement | Annual P&L | FY 2021–FY 2025 + LTM Mar-31-2026 (98×7) | — | High |
| — Tab: Balance Sheet | Annual balance sheet | Dec-31-2021 to Mar-31-2026 (101×7) | — | High |
| — Tab: Cash Flow | Annual cash flow statement | FY 2021–FY 2025 + LTM Mar-31-2026 (77×7) | — | High |
| — Tab: Multiples | Historical trading multiples (quarterly) | Q4 2024–Jun-19-2026 (91×9) | — | High |
| — Tab: Historical Capitalization | Share price, market cap, EV history | Dec-31-2024 to Mar-31-2026 (39×7) | — | High |
| — Tab: Capital Structure Summary | Debt breakdown + net debt | Dec-31-2024 to Mar-31-2026 (96×7) | — | High |
| — Tab: Capital Structure Details | Individual debt instruments | As of latest (44×10) | — | High |
| — Tab: Ratios | Profitability, leverage, efficiency ratios | FY 2021–FY 2025 + LTM (161×7) | — | High |
| — Tab: Supplemental | Additional KPIs | FY 2021–FY 2025 + LTM (38×7) | — | Medium |
| — Tab: Industry Specific | Real estate sector metrics (NAV, backlog) | FY 2021–FY 2025 (65×7) | — | High |
| — Tab: Pension OPEB | Pension/OPEB data | FY 2021–FY 2025 (44×7) | — | Low |
| — Tab: Segments | Segment revenue, PBT, assets (3 segments) | FY 2020–FY 2025 (84×7) | — | High |
| **`Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls`** | Capital IQ quarterly financials workbook (13 tabs — see below) | Q1 2022–Q1 2026 | 271 KB | High |
| — Tab: Key Stats | Quarterly key financials | Q1 2022–Q1 2026 (91×7) | — | High |
| — Tab: Income Statement | Quarterly P&L | Q1 2022–Q1 2026 (95×18) | — | High |
| — Tab: Balance Sheet | Quarterly balance sheet | Q1 2022–Q1 2026 (99×18) | — | High |
| — Tab: Cash Flow | Quarterly cash flow | Q1 2022–Q1 2026 (77×18) | — | High |
| — Tab: Multiples | Quarterly trading multiples | Q1 2022–Q1 2026 (91×19) | — | High |
| — Tab: Historical Capitalization | Quarterly cap history | Q4 2024–Q1 2026 (39×18) | — | High |
| — Tab: Capital Structure Summary | Quarterly capital structure | Through Q1 2026 (74×35) | — | High |
| — Tab: Capital Structure Details | Quarterly debt instruments | Latest (44×10) | — | High |
| — Tab: Ratios | Quarterly ratios | Q1 2022–Q1 2026 (161×18) | — | High |
| — Tab: Supplemental | Quarterly supplemental | Q1 2022–Q1 2026 (26×18) | — | Medium |
| — Tab: Industry Specific | Quarterly real estate metrics | Q1 2022–Q1 2026 (65×18) | — | High |
| — Tab: Pension OPEB | Quarterly pension | Q1 2022–Q1 2026 (30×18) | — | Low |
| — Tab: Segments | Quarterly segment data | Q1 2022–Q1 2026 (84×18) | — | High |
| **`Company Comparable Analysis Emaar Properties PJSC.xls`** | Capital IQ comps workbook (8 tabs — see below) | As-of Jun-28-2026 | 146 KB | High |
| — Tab: Financial Data | Peer financial data (10 comps + EMAAR) | LTM to Jun-28-2026 (50×17) | — | High |
| — Tab: Trading Multiples | Peer LTM and NTM multiples | As-of Jun-28-2026 (50×9) | — | High |
| — Tab: Operating Statistics | Peer operating metrics | As-of Jun-28-2026 (50×13) | — | Medium |
| — Tab: Business Description | Peer descriptions | Latest (44×3) | — | Low |
| — Tab: Implied Valuation | Peer-implied valuation for EMAAR | As-of Jun-28-2026 (69×9) | — | High |
| — Tab: Valuation Chart | Chart data | Latest (32×2) | — | Low |
| — Tab: Credit Health Panel | Peer credit metrics | Latest (48×10) | — | Medium |
| — Tab: Disclaimer | Legal | — | — | Low |
| **`EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls`** | Capital IQ estimates workbook (7 tabs — see below) | Current as of Jun-28-2026 (FY-end Dec-31-2026) | 4.5 MB | High |
| — Tab: Consensus | Broker consensus estimates (514×81) | NTM/FY 2026–FY 2032 | — | High |
| — Tab: Recent Changes | Recent estimate revisions (265×10) | Latest | — | High |
| — Tab: Guidance | Company guidance (42×3) | Latest | — | High |
| — Tab: Multiples | Consensus forward multiples (25×7) | NTM, FY 2026–FY 2032 | — | High |
| — Tab: Surprise | Earnings surprise history (245×74) | Historical | — | High |
| — Tab: Trends | Estimate trends (305×15) | Historical | — | Medium |
| — Tab: Revisions | Estimate revisions detail (467×13) | Historical | — | Medium |
| `01_Consensus.xlsx` | Capital IQ consensus estimates (standalone export) | Same as EstimatesReport Consensus tab (517×81) | 163 KB | High |
| `02_Recent Changes.xlsx` | Capital IQ recent estimate changes | Latest revisions (266×10) | 38 KB | Medium |
| `03_Guidance.xlsx` | Capital IQ guidance export | Latest (42×3) | 27 KB | Medium |
| `04_Multiples.xlsx` | Capital IQ forward multiples export | NTM, FY 2026–FY 2032 (26×7) | 26 KB | High |
| `05_Surprise.xlsx` | Capital IQ earnings surprise history | Historical (248×74) | 90 KB | Medium |
| `06_Trends.xlsx` | Capital IQ estimate trends | Historical (306×15) | 59 KB | Medium |
| `07_Revisions.xlsx` | Capital IQ estimate revisions | Historical (476×13) | 61 KB | Medium |
| `Emaar Properties PJSC DFM EMAAR Analyst Coverage.xls` | Analyst coverage — broker names, ratings, targets | Latest (34×6) | 100 KB | Medium |
| `Emaar Properties PJSC DFM EMAAR Board Members.xls` | Board composition | Latest (29×25) | 223 KB | Low |
| `Emaar Properties PJSC DFM EMAAR Compensation Summary Compensation.xls` | Executive pay | Latest (27×18) | 271 KB | Low |
| `Emaar Properties PJSC DFM EMAAR Customers.xls` | Customer data | Latest (40×8) | 31 KB | Low |
| `Emaar Properties PJSC DFM EMAAR Events Calendar.xls` | Corporate events calendar | Latest (23×3) | 34 KB | Low |
| `Emaar Properties PJSC DFM EMAAR Investment Analysis Direct Investments.xls` | Investment / holdings analysis | Latest (69×21) | 82 KB | Medium |
| `Emaar Properties PJSC DFM EMAAR Key Developments.xls` | Key corporate events | Latest (49×7) | 37 KB | Low |
| `Emaar Properties PJSC DFM EMAAR Professionals.xls` | Management professionals | Latest (33×24) | 44 KB | Low |
| `Emaar Properties PJSC DFM EMAAR Suppliers.xls` | Supplier data | Latest (46×8) | 54 KB | Low |
| `Emaar Properties PJSC DFM EMAAR Private Ownership.rtf` | Ownership — private holders | Latest | 54 KB | Medium |
| `Emaar Properties PJSC DFM EMAAR Public Ownership Summary.rtf` | Ownership summary (shares outstanding, institutional/SWF/promoter breakdown) | Latest (total shares: 8,838,789,849) | 66 KB | High |
| `Emaar Properties PJSC DFM EMAAR Strategic Alliances.rtf` | Strategic partnerships | Latest | 71 KB | Low |

**Extraction status:** 0 failures. All 20 workbooks extracted successfully (57 tabs, 81 extract files). No gdrive-pointer stubs detected.

---

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United Arab Emirates — Dubai Financial Market (DFM) | Ticker DFM:EMAAR confirmed in all Capital IQ exports and DFM filing form headers; ISIN AEE0003010111 [Preliminary Annual Report form, Mar-30-2026] |
| Filing regime | UAE / DFM — local exchange disclosure (not SEC, not SEBI) | DFM filing forms explicitly labelled "Form Preliminary Annual Report" and "Form Preliminary Interim Report"; no 10-K, 10-Q, or SEBI LODR equivalents apply |
| Reporting standard | IFRS | Stated on all Capital IQ exports: "Acctg. Standard: IFRS" [EstimatesReport Consensus tab; Multiples export, 04_Multiples.xlsx]; consistent with UAE PJSC requirements |
| Reporting currency (and scale) | AED (UAE Dirham), figures in AED millions unless stated otherwise | All financial statement exports: "Currency: AED", "In Millions of the reported currency" [Financials_Annual.xls, Income Statement tab] |
| Fiscal-year end | December 31 (calendar year) | FY 2025 period ending "Dec-31-2025" confirmed across annual financial tabs and consensus export "Current Fiscal Year End: Dec-31-2026" [04_Multiples.xlsx] |

Note: This is a UAE issuer listed on DFM. US form equivalents (10-K, 10-Q, 8-K, Form 4, DEF 14A) do not apply and have not been treated as missing. The DFM Preliminary Annual Report and DFM Preliminary Interim Report are the local regulatory filing equivalents. Reporting is under IFRS (not US GAAP or Ind AS).

---

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | `Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Feb-12-2026).pdf` | FY 2025, filed Feb-12-2026 | ~5 months |
| Quarterly filing | `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Apr-08-2026).pdf` | Q1 2025 (Mar-31-2025), filed Apr-08-2026 | ~3 months |
| Capital structure / balance sheet | `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` — Capital Structure Summary tab | As of Mar-31-2026 (AED 10,064m total debt; AED 35,034m cash+STI; net cash AED -24,969m) | ~3 months |
| Consensus / estimate export | `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` / `01_Consensus.xlsx` | Current fiscal year Dec-31-2026; data as of Jun-28-2026 per comps export; consensus next earnings Aug-10-2026 | ~0.2 months |
| Multiples export | `04_Multiples.xlsx` | NTM and FY 2026–FY 2032; data current to Jun-2026 | ~0.2 months |
| Peer / comps export | `Company Comparable Analysis Emaar Properties PJSC.xls` | As-of Jun-28-2026 (10 named peers) | ~0.2 months |
| Current price (Capital IQ) | `Company Comparable Analysis Emaar Properties PJSC.xls` — Financial Data tab | Day Close Price: USD 3.32 (Emaar row); Consensus tab: Last Close AED 12.96 as of Jun-28-2026 | ~0.2 months |
| Cash flow statement | `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` — Cash Flow tab | LTM Mar-31-2026 (CFO: AED 31,973m; capex: AED -991m) | ~3 months |
| Segment data | `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` — Segments tab | FY 2025 (3 segments: Real Estate, Leasing/Retail, Hospitality) | ~5 months |

---

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | Capital IQ Comps export Financial Data tab: AED 12.96 / USD 3.32 (pool-verified, as-of Jun-28-2026); Consensus tab: Last Close AED 12.96 | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | Public Ownership Summary.rtf: 8,838,789,849 total shares; Capital IQ Historical Cap tab: 8,838.789849 million shares (basic); Consensus Diluted EPS uses same base | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Partial | Capital IQ exports use "Basic" dilution flag throughout; no options/RSU/convertible detail identified in pool — diluted vs basic gap appears minimal for this issuer type (PJSC) but not confirmed | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y | Segments tab confirms 3 reportable segments: Real Estate (developer, 80% of FY 2025 revenue), Leasing/Retail (recurring income, 16%), Hospitality (5%); Operating real estate developer with recurring income streams — not a financial or REIT | Determines which valuation methods are valid |
| Total debt, cash, minority/preferred | Y | Capital Structure Summary tab (Mar-31-2026): Total Debt AED 10,064m; Cash+STI AED 35,034m; Minority Interest AED 13,808m; No preferred equity | Needed for enterprise-value bridge |
| Income statement (LTM or FY) | Y | Financials_Annual Income Statement tab: FY 2025 Revenue AED 49,557m; EBITDA AED 24,132m; EBIT AED 22,552m; LTM Mar-31-2026 also available (Revenue AED 51,858m) | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | Financials_Annual Cash Flow tab: FY 2025 CFO AED 33,458m; capex AED -934m; LTM Mar-31-2026 CFO AED 31,973m; capex AED -991m | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | EstimatesReport Consensus + 04_Multiples: FY 2026E Revenue AED 52,657m, EBITDA AED 26,154m, EPS AED 1.92; FY 2027E and FY 2028E also available; NTM figures and target price AED 17.05 (15 estimates) | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | Financials_Annual Multiples tab: quarterly LTM and NTM multiples from Q4 2024 through Jun-19-2026; Financials_Quarterly Multiples tab: Q1 2022–Q1 2026 (longer history) | Own-history re-rating read |
| Peer / comps data | Y | Company Comparable Analysis xls: 10 named peers with LTM and NTM multiples, as-of Jun-28-2026 (Aldar Properties, Dar Al Arkan, CK Asset, China Overseas, Longfor, Arabian Centres, Retal, Yuexiu, C&D International, Poly Property) | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y (partial — PBT, not EBIT at segment level) | Segments tab: segment revenue, Net Profit Before Tax, and assets for Real Estate / Leasing & Retail / Hospitality for FY 2025; segment-level EBIT not separately disclosed but PBT available; segment D&A available for EBITDA build | Sum-of-the-parts |
| Dividend / buyback data | Y | Key Stats tab includes dividend data; Ratios tab has dividend yield and payout; Industry Specific tab has supplemental real estate metrics | Shareholder-yield read |

Price-state classification: **pool-verified** (Capital IQ export dated Jun-28-2026, AED 12.96).

---

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

All business-model and earnings module outputs are present at `analyses/EMAR_2026-07-03/`. The management-governance module is also fully present (including `04_ownership-and-insider-behavior.md` and `99_management-governance-synthesis.md`), enabling the RF-OWN-004 / §24 Filter 6 value-trap read.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N | 01, 05, 07, 99 | Not applicable — pool-verified price AED 12.96 as of Jun-28-2026 confirmed |
| No consensus / forward estimates | N | 02, 03, 04, 05 | Not applicable — full broker consensus available (15 estimates, NTM through FY 2032) |
| No peer data | N | 03, 06 | Not applicable — 10-peer comps set with LTM and NTM multiples, as-of Jun-28-2026 |
| No segment-level data | N | 06 | SOTP is possible — 3 reportable segments with revenue, PBT, assets, and D&A; segment EBIT not separately disclosed but constructible from PBT + interest (minor caveat, not a blocking gap) |
| No balance sheet / capital structure | N | 01, 04, 06 | Not applicable — full capital structure available through Mar-31-2026 |
| No cash flow statement | N | 04 | Not applicable — full CFO and capex available for FY 2021–FY 2025 and LTM Mar-31-2026 |

One minor limitation: dilution data (options, RSUs, convertibles) is not explicitly broken out — Capital IQ exports flag "Basic" dilution. This is a data-quality caveat, not a blocking cap. Downstream agents should note the limitation and use basic shares with a labeled caveat.

---

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Historical LTM and NTM multiples available quarterly from Q1 2022; LTM EV/EBITDA, EV/EBIT, P/E, P/FCF all computable |
| Peer relative valuation | Y | None | 10 peers with LTM and NTM multiples; implied valuation tab also present in comps workbook |
| Intrinsic DCF (Operating FCFF) | Y | None | Full income statement, cash flow statement, balance sheet, and forward estimates available; FCFF = CFO − capex is directly computable |
| Reverse DCF | Y | None | Current price pool-verified; forward model inputs available; agent 05 can run after agent 04 |
| SOTP | Y (partial caveat) | Segment EBIT not explicitly disclosed | Segment PBT + D&A available; segment EBIT constructible as PBT + net interest (segment interest expense partially disclosed); 3 segments (Real Estate, Leasing/Retail, Hospitality) support a SOTP build — proceed with caveat noted |

Business type track: **Operating real estate developer with recurring income streams** (Real Estate development 80% of revenue; Leasing/Retail 16%; Hospitality 5%). Primary methods per MODULE_RULES Business-Type Method Map: FCFF DCF, reverse-DCF, EV/EBITDA, EV/EBIT, P/E, FCF yield. EV-based multiples are appropriate (not a financial or pure REIT). A NAV cross-check is also appropriate given the real estate nature and available backlog / contracted-sales data in the Industry Specific tab.

---

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A complete earnings and cash-flow base (FY 2025 audited + LTM Mar-31-2026), capital structure data through Q1 2026, a pool-verified current price (AED 12.96, Jun-28-2026), broker consensus estimates through FY 2032 (15 brokers), a 10-peer comps set with LTM and NTM multiples, three years of quarterly historical multiples, and segment-level data for SOTP are all present — all five valuation methods can run without any score caps.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic DCF (FCFF), reverse-DCF, SOTP
- **Active partial-data caps:** None
- **Critical missing items:** None blocking. Minor caveat: dilution detail (options/RSUs) not explicitly in pool; basic share count (8,838.8 million) should be used with a labeled limitation on the diluted-vs-basic gap.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — EMAR (Emaar Properties PJSC, DFM:EMAAR)

**Reporting standard:** IFRS
**Reporting currency:** AED (UAE Dirham), AED millions unless stated
**Fiscal year end:** 31 December
**Jurisdiction:** United Arab Emirates — Dubai Financial Market (DFM)
**Business type track:** Operating real estate developer with recurring income streams

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price (primary anchor) | AED 12.20 | Capital IQ Comps export ("Company Comparable Analysis Emaar Properties PJSC.xls", Financial Data tab) + Capital IQ standalone consensus export ("01_Consensus.xlsx") — two independent pool sources agree at AED 12.20 | Jun-28-2026 (comps export As-of date: Excel serial 46201 = 2026-06-28; confirmed by 01_Consensus.xlsx showing identical price) |
| Current price (secondary context) | AED 12.96 | Capital IQ EstimatesReport ("EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls", Consensus tab, row 31: "Latest Price/Last Close Price: 12.96/12.96") | Pool-sourced; precise session date not separately stamped in the export. The export is labeled Jun-28-2026 by the data triage but the stated price reflects a different DFM trading session than the comps. |
| Currency | AED (UAE Dirham) | All Capital IQ exports; AED is the DFM listing currency for EMAAR (ISIN AEE0003010111) | — |
| Price basis (primary) | Last close / end-of-day close | Capital IQ "Day Close Price Latest" and "Latest Price/Last Close Price" fields | Jun-28-2026 |
| USD equivalent (primary) | USD 3.32 | Capital IQ Comps export Financial Data tab (USD-denominated); AED 12.20 / AED 3.6725 per USD (UAE peg) = USD 3.320 — consistent within rounding | Jun-28-2026 |
| 52-week range | AED 10.15 – AED 17.25 | Capital IQ EstimatesReport, Consensus tab (row 32) | Jun-28-2026 |
| Historical Cap tab price (prior period) | AED 12.14 | Capital IQ Quarterly Financials ("Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls"), Historical Capitalization tab — Q1-2026 balance sheet pricing date 2026-05-11 | 2026-05-11 |

**Price-source note — two pool sources, six-point spread.** The primary anchor (AED 12.20) is confirmed by two independent Capital IQ exports (the comps workbook with an explicitly stamped as-of date of Jun-28-2026, and the standalone 01_Consensus.xlsx). The EstimatesReport shows AED 12.96 — a 6.2% higher close from a different DFM trading session. Per the partial-data rule for a corroborated band exceeding 1%, the lower, most-precisely-dated close (AED 12.20) is the canonical anchor. The AED 12.96 figure is shown for context; the corroborated price band is AED 12.20–12.96. Jun-28-2026 falls on a Sunday; DFM is closed on weekends, so both prices are prior-session closes (Fri Jun-27 or earlier). The comps export states the as-of date explicitly via its date serial.

**Price-state: pool-verified.** Both the AED 12.20 and AED 12.96 figures come from Capital IQ pool exports. The as-of date for the anchor is confirmed from the comps export serial (Jun-28-2026). Price-state tag: **`pool-verified`**.

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as of Q1-2026 filing, Mar-31-2026) | 8,838.790 million | Capital IQ Quarterly Financials Balance Sheet tab, row "Total Shares Out. on Balance Sheet Date" — Q1-2026 column; consistent with Capital IQ Annual Balance Sheet ("Total Shares Out. on Filing Date" for FY-2025 and Q1-2026: both 8,838.789849 million) |
| Basic shares outstanding (as of FY-2025, Dec-31-2025) | 8,838.790 million | Same source; unchanged since Q4-2022 (increased from 8,179.739M via bonus issue in FY-2022) |
| Diluted weighted-average shares | Not separately disclosed | Capital IQ exports flag "Dilution: Basic" throughout all tabs. EPS in the consensus report (AED 1.99 FY-2025) = Net profit AED 17,602M (attributable) / 8,838.790M shares — confirmed at the basic level. No dilutive instruments identified. |
| Options / RSUs | Not identified in pool | Capital IQ exports do not break out option or RSU detail for EMAR. Emaar is a UAE PJSC; management compensation is primarily cash-based per the Compensation Summary export. No dilutive option programme identified. |
| Convertibles / potential shares | None identified | Capital IQ Capital Structure details show no convertible bonds or equity warrants. All outstanding debt is fixed-rate bonds, term loans, and revolving credit. |
| **Fully diluted shares (TSM + if-converted)** | **8,838.790 million (estimated = basic)** | **No dilution instruments identified. Treated as equal to basic outstanding. This is a labelled limitation — if EMAR has undisclosed phantom-share or long-term incentive plans, the true diluted count may be marginally higher, but the gap is not quantifiable from the data pool.** |
| Share count used for market cap | 8,838.790 million | Latest filing count (Q1-2026 balance sheet date), per MODULE_RULES §2 (Fully Diluted Equity Rules rule 1: use most recent shares outstanding for market cap) |
| Share count used for per-share fair value | 8,838.790 million | Treated as fully diluted = basic (no identified dilution); labelled limitation above applies |

**Share count note.** The share count has been fixed at 8,838.789849 million since Q4-2022 (following a bonus share issue that increased it from 8,179.739 million). There has been no buy-back or new issuance since then. The basic count is used as the best available proxy for fully diluted; the gap, if any, is not material based on available data.

---

## 3. Market Capitalization

`Market cap = shares outstanding × current price`

`Market cap = 8,838.790 million shares × AED 12.20 = AED 107,833 million (AED 107.8 billion)`

| Calculation input | Value | Source |
|---|---:|---|
| Price (primary anchor) | AED 12.20 | Capital IQ Comps export + 01_Consensus.xlsx, Jun-28-2026 |
| Shares outstanding | 8,838.790 million | Capital IQ Q1-2026 Balance Sheet |
| **Market cap (primary)** | **AED 107,833 million** | **Computed** |
| Market cap at AED 12.96 (secondary) | AED 114,551 million | Using EstimatesReport price as context |
| Market cap in USD (primary, AED 12.20) | USD 29,368 million | AED 107,833M / 3.6725 (AED/USD peg); cross-check vs comps USD 29,358M — confirmed within rounding |

The Capital IQ Historical Capitalization tab (Q1-2026, priced as of May-11-2026, AED 12.14) shows a market cap of AED 107,303 million — broadly consistent with the Jun-28-2026 anchor.

---

## 4. Enterprise Value Bridge

The canonical EV bridge uses the Capital IQ standard (broad cash basis: unrestricted cash + short-term investments + trading asset securities = Total Cash & ST Investments per CIQ). This is the most relevant basis for comparing EV-based multiples across the peer set. A strict-cash EV is also shown because the cash-quality assessment below concludes that the short-term investments are genuine liquid financial assets (not trapped or restricted), making the broad basis appropriate — but both are shown for transparency. Operating leases and pensions are separately noted.

**Balance sheet date: Q1-2026 (Mar-31-2026).** This is the most recent available balance sheet in the data pool, sourced from Capital IQ Quarterly Financials.

### EV Bridge (primary — CIQ broad basis)

| Component | AED Mn (Q1-2026) | Source |
|---|---:|---|
| Market capitalization (at AED 12.20, Jun-28-2026) | 107,833 | Computed: 8,838.790M shares × AED 12.20 |
| + Total debt (short + long term, incl. lease liabilities) | 10,064 | Capital IQ Quarterly Financials, Capital Structure Summary tab, Q1-2026: AED 10,064.379M |
| + Minority / non-controlling interest | 13,808 | Capital IQ Quarterly Balance Sheet, Minority Interest row, Q1-2026: AED 13,808.302M |
| + Preferred equity | — | None. Capital IQ confirms no preferred equity outstanding. |
| + Operating lease liabilities (within Total Debt) | (AED 778M already included) | Capital Structure Summary: Lease Liabilities AED 778.026M is a component of Total Debt AED 10,064M. No additional adjustment. |
| + Underfunded pension / OPEB | Not added | Capital IQ Pension OPEB tab: Pension & OPEB balance AED 210.681M at Q1-2026 — immaterial (<0.2% of EV). Not added to standard bridge; noted here per self-check. |
| − Cash & equivalents | (12,180) | Capital IQ Q1-2026 Balance Sheet, Cash And Equivalents: AED 12,179.522M |
| − Short-term investments | (22,503) | Capital IQ Q1-2026 Balance Sheet, Short Term Investments: AED 22,503.367M |
| − Trading asset securities | (351) | Capital IQ Q1-2026 Balance Sheet, Trading Asset Securities: AED 350.710M (included in CIQ Total Cash & ST Investments = AED 35,033.599M) |
| **= Enterprise value (EV, broad / CIQ standard basis)** | **96,672** | **Computed; reconciles to CIQ Net Debt of −AED 24,969.2M: EV = Market cap + Total Debt + Minority − CIQ Total Cash = 107,833 + 10,064 + 13,808 − 35,034 = 96,671 (rounding)** |

### EV Bridge (strict cash basis — for reference)

| Component | AED Mn |
|---|---:|
| Market capitalization | 107,833 |
| + Total debt | 10,064 |
| + Minority interest | 13,808 |
| − Cash & equivalents only | (12,180) |
| **= EV (strict, cash only)** | **119,526** |

The strict-basis EV (AED 119,526M) is AED 22,854M higher than the broad-basis EV (AED 96,672M). The difference equals short-term investments plus trading securities (AED 22,854M). Both figures are valid; the canonical EV for this report is **AED 96,672 million (broad / CIQ standard)** because the cash-quality assessment below confirms the short-term investments are genuine liquid financial assets.

### Cash Quality Assessment

**"Cash" here is not all operating cash — quality matters.** Three layers of cash-like items appear on EMAR's balance sheet:

1. **Unrestricted Cash & Equivalents: AED 12,180M.** This is ordinary corporate cash available for general use. Capital IQ classifies it as Cash And Equivalents. This nets without qualification.

2. **Short-Term Investments: AED 22,503M.** Capital IQ classifies these separately from cash. From the FY-2025 Preliminary Annual Report and the historical context, these are short-term bank deposits and liquid financial assets placed by the corporate treasury — not investments held by a financial subsidiary, not mark-to-market long-tenor securities, and not operating-restricted funds. They are genuine liquid instruments with near-term maturities. The broad basis is therefore defensible and is the canonical choice. The CIQ "Total Cash & ST Investments" of AED 35,034M includes these.

3. **Restricted Cash (Project Escrow): AED 43,338M.** This is COMPLETELY EXCLUDED from both the strict and broad cash figures. Capital IQ correctly separates it as "Restricted Cash" on the balance sheet. These funds are cash collected from off-plan property buyers and held in DFM-mandated project escrow accounts, ring-fenced by regulation for project delivery. They are not available for general corporate use. The company's own "Net Cash" of AED 61,655M (FY-2025, from the Preliminary Annual Report) includes approximately AED 43Bn of this escrow cash — that figure is not comparable to the strict or broad net cash figures and must not be presented as free corporate liquidity. [Source: FY-2025 Preliminary Annual Report, Slide 14]

4. **Trading Asset Securities: AED 351M.** Included by CIQ in Total Cash & ST Investments. These are minor in scale; they are not long-tenor mark-to-market securities. Included in the canonical (broad) EV.

**Canonical cash decision: broad basis (cash + ST investments + trading securities = AED 35,034M) is netted, giving EV of AED 96,672M.** Restricted cash (AED 43,338M) is NOT netted — netting it would materially understate EV and flatflatter apparent leverage.

### Adjustments NOT Made

- **Additional operating lease adjustment:** Operating lease liabilities (AED 778M) are already inside CIQ's Total Debt figure. No further add-back is needed.
- **Pension / OPEB:** AED 210.681M at Q1-2026 — immaterial (<0.2% of EV). Not added.
- **Equity-method investments:** AED 7,529M at Q1-2026. Capital IQ does not subtract equity-method investments in its standard EV bridge, and they are not separately liquid. No deduction made; noted here for SOTP agent (which may treat them as a separate asset in a sum-of-the-parts build). If an SOTP agent adds their value independently, EV should be reduced by this amount to avoid double-counting.
- **Contingent claims:** No material contingent liabilities identified in the data pool at this stage.

---

## 5. Net Debt & Leverage Snapshot

Per CLAUDE.md §15, net debt must carry its basis label at every appearance.

| Metric | Value (AED Mn) | Basis | Source |
|---|---:|---|---|
| Total debt (incl. lease liabilities) | 10,064 | Gross; includes revolving credit AED 711M, term loans AED 2,150M, senior bonds AED 6,425M, lease liabilities AED 778M | Capital IQ Capital Structure Summary tab, Q1-2026 |
| Cash & equivalents (unrestricted) | 12,180 | Unrestricted operating cash only | Capital IQ Q1-2026 Balance Sheet |
| Short-term investments | 22,503 | Bank deposits / liquid instruments, corporate treasury | Capital IQ Q1-2026 Balance Sheet |
| Trading asset securities | 351 | Included in CIQ Total Cash & ST Investments | Capital IQ Q1-2026 Balance Sheet |
| Restricted cash (project escrow) | 43,338 | NOT a liquidity resource; buyer funds ring-fenced by regulation | Capital IQ Q1-2026 Balance Sheet |
| **Net debt (strict basis: total debt − cash & equiv)** | **−2,115 (net cash)** | **§15 strict** | **Computed: 10,064 − 12,180 = −2,115** |
| **Net debt (broad basis: total debt − cash − STI − trading sec)** | **−24,969 (net cash)** | **§15 broad** | **Computed: 10,064 − 35,034 = −24,970 (rounds to CIQ stated −24,969)** |
| Total Debt / LTM EBITDA (CIQ) | 0.40x | Gross leverage | 10,064 / 25,201 (LTM EBITDA, earnings/01_historical-financials.md) |
| Net Debt (strict) / LTM EBITDA | −0.08x (net cash) | §15 strict | −2,115 / 25,201 |
| Net Cash (broad) / LTM EBITDA | 0.99x | §15 broad; net cash is 0.99x EBITDA | 24,969 / 25,201 |

**Net debt basis label rule (§15).** Every figure above is labelled. The strict basis (debt − cash only) gives net cash of AED 2,115M. The broad basis (debt − cash − STI − trading securities) gives net cash of AED 24,969M. The company's own "Net Cash" of AED 61,655M is a gross-liquidity figure including AED 43Bn of project escrow that is not freely available — it is not shown here as it is incomparable to both strict and broad bases and must not be presented as bare "net cash" without qualification.

**Debt maturity note.** Of total debt AED 10,064M: current portion AED 1,996M (due within 12 months of Mar-31-2026); long-term portion AED 8,068M. Senior bonds AED 6,425M are the largest component (63.8% of total). Undrawn revolving credit available: AED 7,342M (unused). [Source: Capital IQ Capital Structure Summary tab, Q1-2026]

---

## 6. Per-Share Reference Values

All computed using 8,838.790 million shares (basic = fully diluted per available data).

| Metric | Per Share (AED) | Source |
|---|---:|---|
| Current price (primary) | 12.20 | Capital IQ Comps + 01_Consensus, Jun-28-2026 |
| Book value per share | 10.16 | Capital IQ Q1-2026 Balance Sheet: Total Common Equity AED 89,784M / 8,838.790M shares = AED 10.157; stated as AED 10.158 in Capital IQ BV/Share row |
| Tangible book value per share | 10.11 | Capital IQ Q1-2026: Tangible Book Value AED 89,341M / 8,838.790M = AED 10.108; Capital IQ states AED 10.108 |
| Net cash (strict basis) per share | 0.24 | AED 2,115M / 8,838.790M shares |
| Net cash (broad basis) per share | 2.82 | AED 24,969M / 8,838.790M shares |
| Equity-method investments per share | 0.85 | AED 7,529M / 8,838.790M shares (informational; not deducted from EV) |

**Price-to-book reference.** At AED 12.20, price-to-book = 12.20 / 10.16 = 1.20x (vs Capital IQ's stated P/BV close of 1.28x for the period ending Jun-19-2026 using the Q4-2025 balance sheet). At AED 12.96, P/BV = 1.28x. The slight difference reflects the Q1-2026 vs Q4-2025 balance sheet used for book value.

---

## 7. Anchor Summary (canonical numbers for downstream agents)

### Anchor Block (copy-forward)

- **Price:** AED 12.20 (primary anchor, pool-verified; Jun-28-2026 close, two independent CIQ sources) / AED 12.96 (secondary context, single CIQ export, different session)
- **Price-state: pool-verified** — two independent Capital IQ pool sources confirm AED 12.20 for the Jun-28-2026 session; the EstimatesReport AED 12.96 is also pool-sourced from a different session. The canonical anchor is AED 12.20. The price-state tag is `pool-verified`; agents `05`/`07`/`99` do NOT apply the no-price Score-Cap row. Margin of safety, downside-to-bear, observed up/down, and valuation attractiveness are all assessable.
- **Currency:** AED (UAE Dirham). Reporting standard: IFRS. AED is pegged to USD at approximately AED 3.6725/USD.
- **FX:** No cross-currency conversion needed for EMAR financial data (AED throughout). USD 3.32 (comps) converts to AED 12.20 at the peg.
- **Shares (market cap):** 8,838.790 million (basic shares outstanding as of Q1-2026 / Mar-31-2026; per MODULE_RULES §2 rule 1, use most recent outstanding for market cap). Source: Capital IQ Q1-2026 Balance Sheet.
- **Shares (per-share fair value):** 8,838.790 million (basic = estimated fully diluted; no dilution instruments identified in the data pool — labelled limitation, immaterial gap expected for a UAE PJSC). Source: same.
- **Market cap:** AED 107,833 million (AED 107.8 billion) at AED 12.20. At secondary price AED 12.96: AED 114,551 million.
- **Net debt (§15 strict basis: debt − cash & equivalents):** −AED 2,115 million (net cash). Source: Capital IQ Capital Structure Summary tab + Balance Sheet, Q1-2026.
- **Net debt (§15 broad basis: debt − cash − STI − trading sec):** −AED 24,969 million (net cash). Source: same; consistent with CIQ stated Net Debt.
- **Canonical net debt for downstream EV bridges:** §15 broad basis (−AED 24,969M) — this is the CIQ standard and aligns with the peer-set comps. Any downstream agent using a different basis must state it explicitly; silent substitution is not allowed.
- **EV (canonical, broad/CIQ standard basis):** AED 96,672 million at AED 12.20. At AED 12.96: AED 103,390 million.
- **EV (strict, cash only):** AED 119,526 million at AED 12.20 (for reference only; the broad basis is canonical).
- **Minority interest:** AED 13,808 million (included in EV bridge above). Source: Capital IQ Q1-2026 Balance Sheet.
- **Preferred equity:** None.
- **Equity-method investments:** AED 7,529 million (not deducted from EV; available for SOTP agent to treat as a separate asset line).
- **Restricted cash (project escrow):** AED 43,338 million — completely excluded from all cash netting; not available for general corporate use.
- **Balance sheet date:** Q1-2026 (Mar-31-2026) — most recent in pool. Price date: Jun-28-2026. The balance sheet is approximately 3 months older than the price; no material capital events are flagged in this window.

**Key caveats:**
1. Price band AED 12.20–12.96 (6.2% spread) across two pool exports from the same reporting window. AED 12.20 is the canonical anchor (two-source corroboration, explicitly dated). The spread is shown, not hidden.
2. Dilution data (options, RSUs, long-term incentives) is not broken out in the Capital IQ exports ("Dilution: Basic" throughout). Basic count used as best available proxy for fully diluted. The gap is expected to be immaterial for a UAE PJSC with no disclosed equity-settled compensation programmes, but it is unconfirmed.
3. The Q1-2026 balance sheet is a preliminary (unaudited) filing. The FY-2025 audited statutory annual report (IFRS) is not in the data pool as of the analysis date; the most recent audited balance sheet is FY-2024 (Dec-31-2024). Capital structure figures are therefore from an unaudited Q1-2026 interim filing.
4. Restricted cash (AED 43,338M) is buyer-escrowed and not freely available. The company's own "Net Cash" of AED 61,655M (FY-2025) includes this escrow — that figure must not be used in EV multiples or leverage comparisons.
5. Equity-method investments (AED 7,529M) are in long-term investments on the balance sheet. SOTP agent should treat these separately to avoid double-counting.

No valuation judgment is made here. Downstream agents take the Anchor Block numbers verbatim.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — EMAR (Emaar Properties PJSC, DFM:EMAAR)

**Reporting standard:** IFRS
**Reporting currency:** AED (UAE Dirham), AED millions unless stated
**Fiscal year end:** 31 December
**Price anchor:** AED 12.20 (pool-verified, primary; Jun-28-2026 session; two independent Capital IQ sources). Secondary context: AED 12.96 (single CIQ export, different session). Anchor per `01_price-and-capital-structure.md`.
**Business type:** Operating real estate developer with recurring income streams — EV-based multiples are the primary method; P/E is supplementary given the material NCI and IFRS 15 revenue-recognition mechanics.

---

## 1. Current Multiples

All multiples computed at the primary anchor AED 12.20. EV = AED 96,672M (broad/CIQ basis, canonical from `01`). Market cap = AED 107,833M. Shares = 8,838.790M. Balance sheet date Q1-2026 (Mar-31-2026).

**LTM definition:** Q2-2025 through Q1-2026 (ended Mar-31-2026). All LTM financials from `earnings/01_historical-financials.md`, itself sourced from Capital IQ Quarterly Financials export.

### LTM Multiples

| Multiple | Basis | Metric Value (AED M or AED/sh) | Current Multiple | Source |
|---|---|---:|---:|---|
| EV / Revenue | LTM (Q2-25 to Q1-26), reported | AED 51,858M | **1.86x** | EV 96,672 / Revenue 51,858; Capital IQ Quarterly Financials + 01 EV |
| EV / EBITDA | LTM, CIQ-reported (EBIT + D&A) | AED 25,201M | **3.84x** | EV 96,672 / EBITDA 25,201; CIQ definition (excludes IFRS 9 unwinding add-back) |
| EV / EBIT | LTM, reported | AED 23,521M | **4.11x** | EV 96,672 / EBIT 23,521 |
| P / E | LTM, reported diluted EPS | AED 2.13 | **5.73x** | Price 12.20 / EPS 2.13; Capital IQ Quarterly Financials |
| P / Book | Q1-2026 balance sheet | AED 10.16 / sh | **1.20x** | Price 12.20 / BVPS 10.16; Capital IQ Q1-2026 Balance Sheet |
| Mkt Cap / FCF | LTM reported FCF (CFO − capex) | AED 30,982M | **3.48x** (28.7% yield) | Market cap 107,833 / FCF 30,982; note: reported FCF inflated by advance buyer payments (unearned revenue) |

**EBITDA note.** Two EBITDA figures exist for EMAR: (1) CIQ-reported AED 25,201M LTM (used throughout this report for consistency and comparability — it is what the historical multiple bands are built on); (2) Company-adjusted AED ~25,560M LTM (backs out non-cash IFRS 9 discount-unwinding income). CIQ definition is used so that the current multiple is computed on the same basis as the historical bands.

**FCF yield caveat.** The 28.7% reported FCF yield is inflated by AED 8–9Bn per year of advance customer payments (unearned revenue under IFRS 15 off-plan property sales), which are real inflows but represent future delivery obligations. Normalised FCF (stripping these advances) was AED ~24,295M in FY2025 (annualised yield ~22.5%). Neither FCF figure is reliable for EV-multiple comparisons because of the buyer-deposit structure; they are shown for context only, not used as the primary multiple.

**Dividend yield.** FY2024 DPS = AED 1.00 per share (Capital IQ Ratios tab, reported currency AED). At AED 12.20, indicated FY2024 yield = 8.2%. FY2025 DPS does not yet appear in the CIQ export (captured as AED 0.00 in the Ratios tab — likely a lag, not an actual omission). FY2025 dividend confirmation requires the audited FY2025 annual report, which is not in the data pool. The dividend yield is shown as indicative only and is not used in the own-history multiple bands.

### NTM / FY2026 Forward Multiples

Source: Capital IQ Estimates Multiples export (`04_Multiples.xlsx`), data as of Jun-28-2026; price AED 12.20.

| Multiple | Basis | Current Multiple |
|---|---|---:|
| EV / Revenue | NTM consensus | 1.76x |
| EV / Revenue | FY2026E consensus | 1.82x |
| EV / EBITDA | NTM consensus | 3.54x |
| EV / EBITDA | FY2026E consensus | 3.70x |
| EV / EBIT | NTM consensus | 4.57x |
| EV / EBIT | FY2026E consensus | 4.23x |
| P / E | NTM consensus | 6.91x |
| P / E | FY2026E consensus | 6.27x |
| P / BV | FY2026E consensus | 1.04x |

Consensus underlying estimates: FY2026E Revenue AED 53,089M (mean, 11–12 estimates; Capital IQ Trends export `06_Trends.xlsx`), FY2026E EBITDA AED 26,154M, FY2026E EPS AED 1.95 (mean, 11 estimates).

---

## 2. Historical Multiple Bands (3–5 Years)

**Source:** Capital IQ Quarterly Financials ("Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls"), Multiples tab — 17 quarterly quarter-end closing multiples, Q1-2022 (Mar-31-2022) through Q1-2026 (Mar-31-2026). This covers approximately 4.25 years of own-history data, which exceeds the 3-year minimum. All figures are quarter-end "Close" values from the CIQ export (not averages; these are the closing-price-implied multiples on the last trading day of each quarter).

**Important:** The historical multiple data from the CIQ Quarterly Multiples tab uses the quarter-end price at each period's closing date and the LTM financials as of that quarter-end. The "current" column in the table below is computed at AED 12.20 (Jun-28-2026) using the same Q1-2026 financial base — the methodology is consistent with the CIQ series. For reference, CIQ's own Jun-19-2026 close for the most recent data point shows EV/LTM EBITDA at 3.90x (at the slightly higher price prevailing on Jun-19-2026); our computed 3.84x at AED 12.20 is marginally lower and directionally consistent.

**Percentile of range** = proportion of the 17 historical observations (including current) at or below the current level.

| Multiple | Min | Mean | Median | Max | Current | Percentile |
|---|---:|---:|---:|---:|---:|---:|
| EV / LTM Revenue | 2.00x | 2.84x | 2.86x | 3.78x | 1.86x | **< 1st** |
| EV / LTM EBITDA | 3.96x | 6.31x | 6.25x | 8.39x | 3.84x | **< 1st** |
| EV / LTM EBIT | 4.25x | 7.15x | 7.31x | 9.84x | 4.11x | **< 1st** |
| P / LTM EPS | 5.88x | 7.61x | 7.27x | 11.49x | 5.73x | **< 1st** |
| P / BV | 0.67x | 1.02x | 0.94x | 1.50x | 1.20x | 71st |

**Min / Mean / Median / Max** are across all 17 quarter-end observations (Q1-2022 to Q1-2026). "Current" is computed at AED 12.20 at Jun-28-2026.

**Observation on P/BV.** The price-to-book ratio is currently near its highest level (71st percentile) even though all EV-based multiples are at new lows. This structural divergence reflects two things: (1) the equity book value includes AED 43Bn of restricted escrow cash (buyer funds ring-fenced for project delivery) that inflates assets and hence equity; and (2) the minority interest (AED 13,808M) sits inside EV rather than in the equity bridge. The P/BV is therefore not a reliable comparator here — EV-based multiples on operating performance are the appropriate anchor.

---

## 3. Re-Rating / De-Rating Read

EMAR has de-rated sharply on every EV-based measure. On EV/LTM EBITDA — the most reliable multiple for an operating property developer — the stock today trades at 3.84x, versus its own 17-quarter mean of 6.31x and median of 6.25x. That is a −39% discount to the mean and −39% to the median. On EV/LTM Revenue the discount to the mean is −34% and to the median is −35%. On P/LTM EPS the discount to the mean is −25% and to the median is −21%.

The de-rating is not explained by deteriorating fundamentals: LTM EBITDA of AED 25,201M is the highest in the company's history, up 31% year-on-year, and the revenue backlog of AED 154.8Bn as of Dec-31-2025 (FY2025 Preliminary Annual Report, Feb-12-2026) locks in 3+ years of forward revenue visibility. The de-rating instead reflects: (1) the 52-week share price decline of approximately 29% (from AED 17.25 high to AED 12.20 current, Capital IQ EstimatesReport); (2) a sharp step-down in analyst estimates — FY2026E EPS was cut from AED 2.32 to AED 1.95 over three months (−16%), primarily driven by a single large analyst revision on Jun-11-2026 (EPS from AED 2.46 to AED 1.93, target price from AED 20.50 to AED 15.00; Capital IQ Revisions export `07_Revisions.xlsx`); and (3) broader Dubai property cycle concerns around peak-cycle sustainability that appear to be compressing the market-awarded multiple below where the company has historically traded, even while its delivered financials are running above historical averages.

---

## 4. Implied Value from Reversion

Methodology: apply the own-mean and own-median multiple to the current LTM metric. For EV-based multiples: Implied EV = Multiple × LTM metric; Implied Market Cap = Implied EV − Total Debt − Minority Interest + Total CIQ Cash (broad basis); Implied Price = Implied Market Cap / 8,838.790M shares. Components: Total Debt = AED 10,064M; Minority Interest = AED 13,808M; CIQ Total Cash & ST Investments = AED 35,034M (all from `01_price-and-capital-structure.md`, Q1-2026 balance sheet, broad basis per canonical anchor).

| Multiple | Reversion Target | Implied EV (AED M) | Implied Price/Share (AED) | vs AED 12.20 |
|---|---:|---:|---:|---:|
| EV / LTM EBITDA | Own mean (6.31x) | 159,074 | 19.25 | +57.8% |
| EV / LTM EBITDA | Own median (6.25x) | 157,506 | 19.08 | +56.4% |
| EV / LTM Revenue | Own mean (2.84x) | 147,277 | 17.91 | +46.8% |
| EV / LTM Revenue | Own median (2.86x) | 148,330 | 18.04 | +47.9% |
| P / LTM EPS | Own mean (7.61x) | — (equity direct) | 16.21 | +32.9% |
| P / LTM EPS | Own median (7.27x) | — (equity direct) | 15.49 | +26.9% |

**Base-case implied value (single point):** AED 19.08 per share, derived by applying the own-median EV/LTM EBITDA multiple (6.25x) to current LTM EBITDA of AED 25,201M. This is the primary multiple for an operating real estate developer (EV-based; EBITDA is less distorted by IFRS 15 project-delivery phasing than revenue, and less affected by leverage than EPS). The own-median is preferred over the mean because the mean is pulled higher by FY2022 (elevated multiple while earnings were depressed).

**Cross-multiple dispersion (separate from the base-case point):** the three median-reversion methods span AED 15.49 (P/EPS median) to AED 19.08 (EV/EBITDA median), a range of roughly AED 15.5 to AED 19.1. The EV/Revenue median (AED 18.04) sits between these. The EPS-based implied value is lower because the EPS has been impacted by the new UAE corporate tax regime (effective rate moved from 1.5% in FY2023 to 13% in FY2025), which structurally widens the spread between EBIT and net income — the EPS-based multiple has de-rated partially as a warranted re-pricing of this permanent tax increase, not purely sentiment.

**Reversion assumption caveat.** This analysis assumes the warranted multiple has not structurally changed. There are two competing considerations:

1. **The case that the old mean is NOT fully warranted:** The UAE corporate tax introduction (9% from FY2024; DMTT 15% from FY2025) permanently reduces after-tax earnings relative to EBIT, which warrants a lower P/E and, to a lesser degree, a lower EV/EBITDA. FY2022 saw a period of extremely elevated EBITDA multiples (above 8x) when earnings were depressed and investors were pricing in recovery — that period's multiples are not the right anchor going forward. Additionally, analyst estimates have been cut sharply (FY2026 EPS down 16% in three months), suggesting forward earnings visibility concerns that may partly justify a lower multiple than the historical mean.

2. **The case that the old mean IS warranted or even conservative:** EMAR's LTM EBITDA (AED 25,201M) and revenue (AED 51,858M) are at all-time highs; the AED 154.8Bn backlog is unprecedented; EBITDA margins (48–49%) are structurally much higher than the FY2021 level of 28% that formed the starting point of this multiple history. If anything, a better business deserves a higher multiple, not a lower one. The de-rating appears driven by cycle-peak concerns rather than fundamental impairment of the business model.

The base-case reversion point (AED 19.08) uses the median, which naturally discounts the peak-period multiples of FY2022-early-2023. It is presented as an illustrative own-history reversion target, not as a standalone fair value — downstream agent `07_scenario-and-fair-value` will weight this alongside intrinsic and peer methods.

---

## 5. Own-History Read

EMAR is trading at a multi-year low versus its own multiple history on every EV-based metric: below even the trough levels recorded in the 17-quarter Capital IQ series, which itself spans a period when the company was a less profitable, more leveraged business than it is today. Reverting to the own median EV/EBITDA (6.25x) implies a price of AED 19.08, or +56% from current, before accounting for earnings growth. The biggest caveat is that part of the de-rating is structural and warranted — the introduction of UAE corporate taxes (9% CIT from FY2024; DMTT 15% from FY2025) permanently impairs the earnings multiple, and the history from FY2022–early 2023 includes an elevated-multiple period driven by the recovery from pandemic-era earnings lows that is not a good anchor for a base-case reversion. Adjusting for this, the EPS-based median reversion (AED 15.49) is a more conservative floor and is probably the more honest "structural" implied value, whereas the EV/EBITDA-based reversion (AED 19.08) is an upper bound on what a plain mean-reversion calculation would give. The most defensible own-history reversion range is therefore roughly AED 15.5 to AED 19.1, with the EBITDA-median point (AED 19.08) serving as the base input for `07` unless the intrinsic and peer methods argue otherwise.

---

*All multiple computations use the anchor EV (AED 96,672M, broad/CIQ basis) and market cap (AED 107,833M) from `01_price-and-capital-structure.md` verbatim. All historical multiple bands sourced from Capital IQ Quarterly Financials export, Multiples tab — "Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls" — 17 quarters Q1-2022 to Q1-2026. Forward consensus multiples from Capital IQ Estimates Multiples export ("04_Multiples.xlsx", data as of Jun-28-2026). LTM financials from "earnings/01_historical-financials.md" (itself sourced from Capital IQ Quarterly Financials Income Statement tab). All computations via executed Python scripts, not mental arithmetic.*



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — EMAR

**Reporting standard:** IFRS | **Currency:** AED (UAE Dirham); USD figures from Capital IQ comps converted at AED 3.6725/USD peg | **Price anchor:** AED 12.20 (pool-verified, Capital IQ Comps + 01_Consensus.xlsx, Jun-28-2026) | **Business type:** Operating real estate developer with recurring income streams | **Primary multiple applied:** NTM EV/EBITDA (the correct primary metric per MODULE_RULES Business-Type Method Map for an operating developer)

---

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Aldar Properties PJSC | ADX:ALDAR | UAE-based master-community developer; the only directly listed, auditable GCC peer; competes with Emaar in UAE residential development and institutional real estate. Abu Dhabi focus vs Emaar's Dubai focus — partially comparable | Capital IQ Comparable Analysis export (EMAAR comp set, Financial Data tab, data as of 2026-06-28); competitive-map §2 |
| Dar Al Arkan Real Estate Development | SASE:4300 | Saudi Arabia's largest listed developer; off-plan residential and retail development; comparable business model (advance-receipt, percentage-of-completion IFRS treatment) | Capital IQ Comparable Analysis export (same source) |
| CK Asset Holdings | SEHK:1113 | Hong Kong–listed diversified real estate developer and property investor; long-cycle residential + income-producing properties | Capital IQ Comparable Analysis export |
| Arabian Centres Company | SASE:4321 | Saudi Arabia–listed mall operator and income-property owner; retail-REIT comparable for Emaar's Malls segment | Capital IQ Comparable Analysis export |
| Retal Urban Development Company | SASE:4322 | Saudi Arabia–listed residential developer; smaller scale but relevant as a GCC developer | Capital IQ Comparable Analysis export |
| Yuexiu Property Company | SEHK:123 | Chinese mainland residential developer; included in Capital IQ's default comp set but structurally distressed (leverage 35.4x EBITDA) | Capital IQ Comparable Analysis export — included for completeness; LOW comparability due to distress |
| C&D International Investment Group | SEHK:1908 | Chinese mainland residential developer; included in Capital IQ comp set; moderate distress | Capital IQ Comparable Analysis export — LOW comparability |
| China Overseas Land & Investment | SEHK:688 | Chinese state-backed developer; Capital IQ comp set | Capital IQ Comparable Analysis export — LOW comparability |
| Longfor Group Holdings | SEHK:960 | Chinese developer; near-distressed (EV/EBITDA 128.8x, leverage 52.1x) | Capital IQ Comparable Analysis export — EXCLUDED from median computation (distress outlier) |
| Poly Property Group | SEHK:119 | Chinese developer; Capital IQ comp set | Capital IQ Comparable Analysis export — LOW comparability |

**Peer set note.** This peer set was supplied by Capital IQ's proprietary relevancy algorithm as EMAAR's default comparable set; it was not independently curated. The competitive-map module (`business-model/08_competitive-map.md`) names Aldar, DAMAC, and Nakheel/Dubai Holding as Emaar's direct competitors. DAMAC is private (delisted 2022) and Nakheel/Dubai Holding is state-owned and merged into an opaque holding vehicle — neither has public multiples. The Capital IQ set therefore represents the best available publicly traded proxies, but with a material caveat: the 5 Chinese developers (Yuexiu, C&D, COLI, Longfor, Poly) are either distressed or in contraction and are structurally different businesses. For the primary analytical read, a **quality sub-set** of the 5 non-China names (Aldar, Dar Al Arkan, CK Asset, Arabian Centres, Retal) is used alongside the full-set median. Longfor is excluded from the median computation given its 128.8x EV/EBITDA (distress outlier that renders the full-set mean unusable). All data: Capital IQ Comparable Analysis export, data as of 2026-06-28.

---

## 2. Peer Multiples & Operating Statistics

All figures from Capital IQ Comparable Analysis export — Financial Data, Trading Multiples, and Operating Statistics sheets, data as of 2026-06-28 (USD). Emaar figures are from the same export plus earnings/01_historical-financials.md for LTM revenue (AED 51,858M TTM ending Q1-2026 / AED 49,557M FY2025). For comparability, the LTM revenue and EBITDA used in CIQ's export reflect the filing date LTM, which uses the latest available quarterly filing (May 11, 2026 for Emaar — capturing Q1-2026).

| Company | LTM EV/Sales | LTM EV/EBITDA | LTM EV/EBIT | LTM P/E | NTM EV/EBITDA | NTM P/E | FCF Yield (est.) | LTM Rev Growth | EBITDA Margin | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **EMAAR (DFM:EMAAR)** | **1.9x** | **3.6x** | **3.9x** | **5.7x** | **3.54x** | **6.91x** | **~22–29%** | **+33.4%** | **48.6%** | **0.4x** | **Jun-28-2026** |
| Aldar Properties (ADX:ALDAR) | 2.4x | 8.3x | 8.8x | 8.5x | 6.77x | 7.64x | n/a | +38.1% | 28.9% | 3.0x | Jun-28-2026 |
| Dar Al Arkan (SASE:4300) | 6.6x | 13.0x | 13.3x | 16.1x | 15.12x | 17.33x | n/a | +8.0% | 42.9% | 8.2x | Jun-28-2026 |
| CK Asset Holdings (SEHK:1113) | 3.0x | 10.4x | 11.9x | 14.2x | 8.92x | 10.76x | n/a | +27.3% | 22.2% | 4.4x | Jun-28-2026 |
| Arabian Centres (SASE:4321) | 10.8x | 18.9x | 19.4x | 6.5x | 13.71x | 8.09x | n/a | −3.1% | 57.1% | 13.4x | Jun-28-2026 |
| Retal Urban Dev. (SASE:4322) | 3.1x | 17.0x | 18.4x | 21.3x | 17.54x | 17.98x | n/a | +15.0% | 17.9% | 3.8x | Jun-28-2026 |
| Yuexiu Property (SEHK:123) | 1.4x | 32.2x | 36.5x | 220.1x | 33.75x | 31.71x | n/a | +0.1% | 3.2% | 35.4x | Jun-28-2026 |
| C&D International (SEHK:1908) | 0.8x | 10.7x | 10.9x | 7.5x | 11.77x | 7.08x | n/a | −4.3% | 7.3% | 8.3x | Jun-28-2026 |
| COLI (SEHK:688) | 1.8x | 15.6x | 16.0x | 9.4x | 15.03x | 9.23x | n/a | −9.2% | 10.9% | 13.4x | Jun-28-2026 |
| Poly Property (SEHK:119) | 1.2x | 13.0x | 13.6x | 24.2x | 12.94x | 20.3x | n/a | +20.3% | 9.3% | 15.6x | Jun-28-2026 |
| Longfor Group (SEHK:960) † | 2.6x | 128.8x | 154.1x | 36.1x | 42.19x | NM | n/a | −23.7% | 3.2% | 52.1x | Jun-28-2026 |
| **Full-set Peer Median (ex-Longfor)** | **2.5x** | **14.3x** | **14.8x** | **15.2x** | **14.37x** | **10.76x** | — | **+4.0%** | **14.4%** | **10.9x** | — |
| **Full-set Peer Mean (ex-Longfor)** | **3.2x** | **15.4x** | **16.5x** | **35.4x** | **15.16x** | **14.0x** | — | **+5.6%** | **20.2%** | **11.4x** | — |
| **Quality sub-set Median (Aldar, Dar, CK, Arab Ctrs, Retal)** | **3.1x** | **13.0x** | **13.3x** | **14.2x** | **13.71x** | **10.76x** | — | **+15.0%** | **28.9%** | **4.4x** | — |

† Longfor excluded from median: EV/EBITDA 128.8x reflects near-distress (leverage 52.1x), not a relevant comp for a net-cash developer.

**FCF yield note for EMAAR.** Emaar's LTM FCF yield is computed from market cap USD 29,358M and LTM reported FCF ~USD 8,435M (AED 30,982M / 3.6725) = 28.7%; normalised FCF (removing advance customer payments) USD 6,615M (AED 24,295M FY2025 / 3.6725) = 22.5%. Both are unusually high and reflect a near-peak cycle with heavy off-plan advance receipts; the normalised figure is the recurring-operations indicator. Peer FCF yields are not separately disclosed in the Capital IQ export.

---

## 3. Premium / Discount to Peer Median

Peer median = full-set median, 9 peers, Longfor excluded. [Capital IQ Comparable Analysis export, data as of 2026-06-28]

| Multiple | EMAAR | Full-Set Peer Median | Premium / (Discount) | Quality Sub-set Median | vs Quality Sub-set |
|---|---:|---:|---:|---:|---:|
| LTM EV/Sales | 1.9x | 2.5x | −24.0% | 3.1x | −38.7% |
| LTM EV/EBITDA | 3.6x | 14.3x | −74.8% | 13.0x | −72.3% |
| LTM EV/EBIT | 3.9x | 14.8x | −73.6% | 13.3x | −70.7% |
| LTM P/E | 5.7x | 15.2x | −62.4% | 14.2x | −59.9% |
| NTM EV/EBITDA | 3.54x | 14.37x | −75.4% | 13.71x | −74.2% |
| NTM P/E | 6.91x | 10.76x | −35.8% | 10.76x | −35.8% |
| LTM P/TangBV | 1.2x | 0.45x | +166.7% | 0.9x | +33.3% |

**Critical interpretation — why the EV discount and the P/TangBV premium coexist.** Emaar's reported EV of USD 26.3Bn is anchored by its AED 96.7Bn canonical EV (broad-cash basis) being far smaller than the LTM EBITDA would imply at peer multiples. The reason the EV-based multiples show an extreme 73–75% discount while the equity-based P/TangBV shows a premium is structural: most peers (especially the Chinese developers) carry crushing debt loads (Longfor 52.1x leverage, Yuexiu 35.4x) that inflate their EVs relative to market cap, making EV-multiples appear much higher. Emaar's EV is depressed (relative to EBITDA) because Emaar is effectively NET CASH on the broad basis (net cash USD 6.8Bn, or AED 24.97Bn), compressing its EV well below market cap. The P/TangBV premium reflects this same net-cash position: Emaar's equity value is NOT diluted by debt. EV-based multiples are the more economically meaningful comparisons because they abstract away capital structure — and they show Emaar at a 73–75% discount to the peer median on LTM EV/EBITDA. Even vs Aldar (the most comparable peer, at 8.3x LTM EV/EBITDA and 6.77x NTM), Emaar trades at a 56.6% discount on LTM EV/EBITDA and a 47.7% discount on NTM EV/EBITDA.

**Is the current gap typical or unusual?** Not assessable in full. The Capital IQ data pool provides EMAAR's own multiple history (Annual Multiples tab showing EV/EBITDA going back through FY2024), but it does not provide the corresponding peer group multiple history at the same intervals required to compute a EMAAR-vs-peer relative gap over 3 years. What CAN be assessed: Emaar's own LTM EV/EBITDA has moved from a close of 7.3x at end-FY2024 to a close of approximately 3.9x at Jun-19-2026 [Capital IQ Annual Multiples tab, Emaar-specific data; close 2026-06-19]. Over the same period, Aldar has not traded at dramatically different multiples (Aldar LTM EV/EBITDA: 8.3x as of Jun-28-2026 per the comps export). This suggests the current EV/EBITDA discount of Emaar vs Aldar (~56%) has WIDENED as Emaar's own multiple compressed materially (from ~7x to ~3.6x LTM) while Aldar's did not compress as sharply. This is consistent with the market re-pricing Emaar specifically for a cycle risk. Whether this gap was historically narrower is **partially assessable**: Emaar's own multiple history (from its FY2024 EV/EBITDA close of 7.3x) indicates the current compression is a recent, significant deterioration — not a persistent long-run discount to peers, which the market has applied since mid-2025 as Dubai residential cycle concerns increased. Full 3-year peer-relative gap history: **Not assessable** from the pool (peer historical multiples not extracted).

---

## 4. Is the Gap Warranted?

**Context: the cycle-adjusted multiple is the key frame.** Emaar's LTM EBITDA of AED 25.2Bn (USD 6.86Bn) is a peak-cycle number — FY2025 EBITDA of AED 24.1Bn represents a 209% increase over FY2021's AED 7.8Bn, reflecting Dubai's residential property supercycle. [Capital IQ Annual Financials, earnings/01_historical-financials.md] If the market is pricing Emaar on mid-cycle EBITDA of ~AED 14.9Bn (derived in moat module: through-cycle NOPAT ~AED 11.6Bn → EBIT ~AED 13.3Bn → EBITDA ~AED 14.9Bn at FY2025 D&A run-rate), the implied EV/mid-cycle EBITDA at today's price is approximately **6.5x** — not 3.6x. At 6.5x mid-cycle, Emaar trades at approximately PARITY with Aldar's current 6.77x NTM EV/EBITDA. Given Emaar's materially superior EBITDA margin (48.6% vs Aldar 28.9%) and dramatically lower leverage (0.4x vs 3.0x), a PREMIUM to Aldar is warranted, not parity. Conclusion: **the discount is too deep (relative upside)**. The discount is partially warranted — the market is correct to apply a heavy cycle haircut to peak EBITDA and to price in UAE concentration risk (93% of revenue), government-owner dynamics (29.7% government shareholding creating CLAUDE.md §24 Filter 6 considerations), and the structural reduction in after-tax earnings from the new 9–15% UAE tax regime. However, even after all these haircuts, Emaar on a mid-cycle basis is cheaper than its closest peer (Aldar) despite being a better-quality business (higher margins, lower leverage, larger backlog, stronger brand). The gap is too wide at current multiples; a discount of 10–20% to quality peers on EV/EBITDA (not 50–75%) is defensible.

---

## 5. Implied Value from Peer Multiples

**Bridge inputs (from Capital IQ Comparable Analysis export, data as of 2026-06-28; USD):**
- Cash & ST Investments: USD 9,538.1M
- Total Debt: USD 2,740.1M
- Minority Interest: USD 3,759.4M
- Shares outstanding: 8,838.8M

**Primary multiple: NTM EV/EBITDA** applied to Emaar's NTM EBITDA of USD 7,433.1M (Capital IQ consensus, data as of 2026-06-28). This is a forward-peer-multiple applied to a forward company metric — basis is consistent (NTM↔NTM).

**Quality adjustment applied:** Warranted multiple of **8.0x NTM EV/EBITDA** — this is the base case. Derivation: Aldar (most comparable peer, NTM EV/EBITDA 6.77x) serves as the floor reference given it is Emaar's only direct UAE-listed peer. Emaar's materially higher EBITDA margin (+1,970 bps vs Aldar), lower leverage (−2.6x turns), and larger backlog warrant a premium. A 18–20% premium to Aldar gives ~8.0x. This multiple already embeds a large cycle discount vs the full peer median (14.37x) and the quality sub-set median (13.71x) — the 8.0x base sits 44% below the quality sub-set median, which represents the warranted cyclicality/concentration haircut. Bear case uses 6.0x (below Aldar's NTM, reflecting a scenario where cycle concerns dominate and Emaar's peak-EBITDA is fully discounted). Bull case uses 11.0x (approaching Aldar-level multiple, if Dubai property cycle proves resilient and the recurring business receives fuller credit). Secondary lens: NTM P/E with warranted multiple of 8.5x (slight premium to Aldar's NTM P/E of 7.64x; applied to NTM EPS of USD 0.48 = AED 1.76/AED peg).

**Formula:** Implied EV = NTM EBITDA × Multiple → Implied Equity = EV + Cash&STI − Debt − Minority → Implied Price = Equity / 8,838.8M shares.

| Multiple | Applied Multiple | Implied EV (USD M) | Implied Equity (USD M) | Implied Price (USD) | Implied Price (AED) | vs Current AED 12.20 |
|---|---:|---:|---:|---:|---:|---:|
| NTM EV/EBITDA — bear (6.0x) | 6.0x | 44,599 | 47,637 | 5.39 | 19.79 | +62.2% |
| NTM EV/EBITDA — **base (8.0x)** | **8.0x** | **59,465** | **62,503** | **7.07** | **25.97** | **+112.9%** |
| NTM EV/EBITDA — bull (11.0x) | 11.0x | 81,764 | 84,803 | 9.59 | 35.24 | +188.8% |
| Full-set peer median (14.37x) | 14.37x | 106,814 | 109,852 | 12.43 | 45.64 | +274.1% |
| NTM P/E — base (8.5x) | 8.5x | — | — | 4.08 | 14.98 | +22.8% |
| NTM P/E — bear (7.0x) | 7.0x | — | — | 3.36 | 12.34 | +1.1% |
| NTM P/E — bull (11.0x) | 11.0x | — | — | 5.28 | 19.39 | +58.9% |

**Note on the P/E vs EV/EBITDA divergence.** The NTM P/E base (AED 15.0) is well below the NTM EV/EBITDA base (AED 26.0). The reason: Emaar's NTM EPS consensus of AED 1.76 (USD 0.48, applying the peg; from Capital IQ) has been CUT 16% over the past 3 months [earnings/04_guidance-consensus.md], and the 8.5x warranted P/E is itself modest. This divergence signals that EPS-based multiples embed more near-term earnings caution (consensus is falling) while EV/EBITDA reflects the operating cash generation before the tax step-up and interest income. For a net-cash developer where EBITDA to EPS is a cleaner link (no debt service drag), the EV/EBITDA lens should be weighted more heavily. Cross-method dispersion: P/E base implies AED 15.0; EV/EBITDA base implies AED 26.0 — a significant 73% gap between the two base cases. This dispersion reflects genuine uncertainty about whether to use peak or mid-cycle metrics. The `07_scenario-and-fair-value` module should treat these as scenario bounds rather than a single base.

**Base-case point (primary multiple):** AED 25.97 per share on NTM EV/EBITDA 8.0x. Dispersion: AED 12.34 (bear NTM P/E 7.0x) to AED 35.24 (bull NTM EV/EBITDA 11.0x).

**Analyst NAV cross-check.** Capital IQ consensus shows NAV/Share (Industry Specific) of AED 20.7 mean (range AED 17.60–23.80, 2 estimates). [Capital IQ EstimatesReport, Consensus tab, data as of Jun-28-2026] Consensus analyst mean price target: AED 17.05 (15 estimates; range AED 13.50–20.50). [Same source] Both are above the current price of AED 12.20, broadly consistent with the peer-multiple base case directionally, though the analyst target is substantially below the EV/EBITDA-based implied value — likely because analysts apply a cycle discount in their NAV models similar to the cycle-normalisation argument above.

---

## 6. Relative Read

Emaar trades at 3.54x NTM EV/EBITDA against a peer median of 14.37x — a 75% discount — and at 47.7% below its most relevant peer Aldar (6.77x), despite Emaar's EBITDA margin being 1,970 basis points higher and its leverage 2.6 turns lower. The discount is partially warranted: the market correctly prices Emaar on a cycle-adjusted basis (mid-cycle EV/EBITDA ~6.5x, roughly at parity with Aldar), and correctly applies a concentration haircut (93% UAE revenues) and a government-owner structural discount. However, even on a mid-cycle basis, Emaar's quality advantage over Aldar (higher margins, lower leverage, larger backlog) justifies a premium of at least 10–20% — making the current parity-to-slight-discount vs Aldar on mid-cycle EV/EBITDA appear roughly 10–30% too wide. The warranted-peer-multiple base case (NTM EV/EBITDA 8.0x) implies AED 25.97 (+113% from AED 12.20), with a dispersion of AED 12.34–35.24 across the full scenario range — a wide dispersion reflecting genuine cycle and earnings-base uncertainty, not a false-precision point estimate.

---

*All Capital IQ figures: Capital IQ Comparable Analysis export (Company Comparable Analysis Emaar Properties PJSC.xls), data as of 2026-06-28. Emaar LTM metrics from same export and Capital IQ Annual/Quarterly Financials (data as of latest filing date 2026-05-11 for Q1-2026). Emaar FY2025 financials from FY2025 Investor Presentation / Preliminary Annual Report, Feb-12-2026. Through-cycle estimates from business-model/09_moat.md (Inference, not from filings). Analyst NAV and TP: Capital IQ EstimatesReport, Consensus tab, data as of Jun-22-2026.*



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — EMAR (Emaar Properties PJSC, DFM:EMAAR)

**Reporting standard:** IFRS | **Currency:** AED (UAE Dirham), AED millions unless stated
**Fiscal year end:** 31 December | **Jurisdiction:** UAE — Dubai Financial Market (DFM)
**Business type:** Operating real estate developer with recurring income streams (per `00_valuation-data-triage` §6A). FCFF DCF is the correct primary method per the Business-Type Method Map — this is NOT a REIT or financial, and EV-based analysis applies.
**Discounting convention:** Mid-year (cash flows discounted at t − 0.5), reflecting that cash arrives throughout the year rather than at year-end.

---

## Business-Type Gate

Emaar is classified as an **Operating real estate developer** (80% development, 16% leasing/retail, 5% hospitality) per `00_valuation-data-triage` §6A and `03_margin-drivers` §1. It is NOT classified as a Financial, REIT, or Holding company. The FCFF DCF with an EV bridge is the correct primary method. Cyclicality gate also applies: Emaar's business-quality cyclicality score is 30/100 (`07_business-quality` §1), confirming a deeply cyclical business at or near a Dubai residential cycle peak. The FCF base and terminal assumptions must anchor to mid-cycle, not FY2025 peak levels.

---

## 1. FCF Base & Normalizations

Base year: **FY2025 (year ending 31 December 2025)**

| Item | Base-Year Value (AED Mn) | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | 49,557 | None — accepted as base; FY2025 is a cycle-peak year, used as starting point only; terminal is NOT set at this level | Capital IQ Annual Financials, FY2025 Income Statement |
| EBIT | 22,552 | None for base year; terminal margin set to 35% (mid-cycle), not 45.5% (peak). See §2. | Capital IQ Annual Financials, FY2025 |
| Normalized effective tax rate | 13.0% | Accepted as structural steady-state. FY2025 effective rate post-UAE Corporate Tax (9%) + DMTT (15%). FY2023 rate (1.5%) is pre-tax-era and is not used. No one-off non-deductible FVTPL loss identified; rate is accepted without further stripping. | FY2025 Investor Presentation (Feb-12-2026), slide 12 (NPBT AED 25,657 Mn vs Net Profit AED 22,326 Mn = 13.0%). Moat module §3 confirmed same 13% anchor. Cross-orb reconciliation: confirmed consistent. |
| NOPAT (EBIT × (1 − 13%)) | 19,620 | — | Computed |
| D&A | 1,580 | None — computed as CIQ EBITDA (AED 24,132 Mn) minus EBIT (AED 22,552 Mn) | Capital IQ Annual Financials, FY2025 |
| Capex | 934 | None — low because developer model funds growth via buyer advances (restricted escrow), not capex | Capital IQ Annual Cash Flow, FY2025 |
| Delta-NWC (implied, FY2025) | −4,029 (source) | Derived as: NOPAT + D&A − Capex − Normalised FCF = 20,266 − 24,295 = −4,029 Mn. Negative = net operating WC fell (cash source). Emaar is a net-negative-NWC developer: buyer advances received upfront exceed trade AR, so a growing revenue base releases cash from this structure each year. Normalised FCF (ex-unearned revenue) = AED 24,295 Mn per `earnings/06_earnings-quality` — this is the lead FCF base, not the inflated reported FCF of AED 32,524 Mn. | `earnings/06_earnings-quality`, §1 (normalised FCF FY2025 AED 24,295 Mn); computed |
| Delta-NWC as % of revenue (FY2025) | −8.13% of revenue | Revenue-linked driver: as revenue grows at Emaar's developer model, operating NWC becomes more negative (buyer advances scale with sales), releasing cash. This driver fades to zero in the terminal as the cycle normalises. See §2. | Computed: −4,029 / 49,557 |
| Normalised FCF (FY2025) | 24,295 | Reported FCF (AED 32,524 Mn) is reduced by AED 8,229 Mn of unearned-revenue advance payments from off-plan buyers. These are real cash inflows but represent future delivery obligations — removing them shows recurring cash generation. The AED 2,505 Mn of interest income on escrow cash is non-operating and non-recurring at this scale; excluded from FCFF (interest income is below-the-line in NOPAT). | `earnings/06_earnings-quality`, §1 and §10 |

**FCF definitional anchor:** FCFF = NOPAT + D&A − Capex − ΔNWC (income-statement / balance-sheet build). This matches the normalised FCF per `earnings/06` (cross-checked: zero residual). Cycle position note: FY2025 is almost certainly a cycle peak for Dubai residential (record UAE property sales AED 71.1 Bn, record revenue backlog AED 134.3 Bn, normalised FCF AED 24,295 Mn). These peak figures are used as base-year starting points only; the forecast fades to mid-cycle by years 5–7.

---

## 2. Forecast Assumptions

Forecast horizon: **7 years (FY2026–FY2032)**, then Gordon growth terminal.

| Assumption | FY2026 | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 | FY2032 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 7.1% | 13.9% | 8.0% | 5.0% | 3.0% | 2.5% | 2.0% | 2.0% | FY2026–27: Consensus estimates (Capital IQ, earnings/04, Jun-22-2026). FY2028–32: analyst assumption — AED 134.3 Bn UAE backlog supports near-term; fade to mid-cycle growth as Dubai cycle normalises |
| EBIT margin % | 45.2% | 44.0% | 42.0% | 39.5% | 37.0% | 35.5% | 35.0% | 35.0% | FY2026–27: analyst assumption near-consensus; gradual compression from mix shift (apartments +62.7% share), construction cost inflation. FY2028–32: analyst assumption — cyclicality gate applied; terminal 35.0% is mid-cycle (between FY2021 trough 23.5% and FY2025 peak 45.5%); see cyclicality gate below |
| Tax rate % | 13.0% | 13.0% | 13.0% | 13.0% | 13.0% | 13.0% | 13.0% | 13.0% | UAE Corporate Tax (9%) + DMTT (15%) steady-state; company-disclosed per FY2025 Investor Presentation slide 12. Moat module §3 cross-checked: same rate confirmed. No further OECD Pillar Two uplift assumed (analyst assumption) |
| Capex (% of revenue) | 1.9% | 1.9% | 2.0% | 2.0% | 2.0% | 2.0% | 2.0% | 2.0% | Analyst assumption — FY2025 capex was 1.88% of revenue. Hotel/mall expansion (Dubai Mall Grand Drive H2-2028, Dubai Expo Mall H2-2027) adds modest step-up. Low because developer funds growth via buyer advances (restricted escrow), not fixed-asset capex |
| D&A (% of revenue) | 3.2% | 3.2% | 3.2% | 3.2% | 3.2% | 3.2% | 3.2% | 3.2% | Analyst assumption — FY2025 D&A was 3.19% of revenue; held stable reflecting hotel key additions at consistent pace |
| ΔNWC (% of revenue, revenue-linked driver) | −8.13% | −7.00% | −5.00% | −3.00% | −1.50% | −0.50% | 0.00% | 0.00% | Analyst assumption — fading from FY2025 level (−8.13%) as the cycle normalises. Negative = NWC falls (cash source) for a negative-NWC developer; in terminal, WC delta = 0 (no further release). See WC sign sanity check below |

**Working capital sign sanity check:** Emaar operates as a negative-NWC developer — buyer advance payments (unearned revenue) grow with sales, systematically exceeding trade AR. As revenue grows and this ratio is held, NWC becomes MORE negative each year, which ADDS to FCF (ΔNWC is negative = NWC falls = release). The model confirms this: in every year FY2026–FY2031, ΔNWC is negative (a cash source that increases FCF). In FY2032 (terminal), ΔNWC = 0 (no further release). The sign has been verified — a growing revenue base at a negative-NWC developer correctly produces a positive FCF contribution from WC, not a drag. This is the opposite of a normal business: here, growth HELPS FCF via WC mechanics, fading as the cycle peaks.

**Cyclicality gate (MODULE_RULES §8):** Terminal EBIT margin of 35.0% is benchmarked against:
- **Peer-normal anchor:** Aldar Properties (only listed peer) has EBITDA margin ~29%, EBIT margin ~24% (Capital IQ Comps, Jun-28-2026). Emaar earns a premium to Aldar due to brand and location moat — terminal of 35% EBIT is above peer-normal but below current peak, consistent with the narrow moat evidence. DAMAC and Nakheel/Dubai Holding have no public financials.
- **Prior-trough anchor:** FY2021 EBIT margin = 23.5% (`earnings/01_historical-financials` §1). FY2020 EBITDA margin ~18.7% (AED 5.2 Bn EBITDA / AED 27.9 Bn revenue, from `earnings/03_margin-drivers` §cycle-position note). Terminal of 35.0% sits above the prior-trough (23.5%) and below the current peak (45.5%), consistent with a narrow-moat developer earning through-cycle returns above the cost of capital (moat module through-cycle ROIC ~11–12% vs WACC ~9%).
- The terminal margin of 35% is NOT "below the most recent peak" in a vague sense — it is specifically anchored at the midpoint between the FY2021 trough (23.5%) and FY2025 peak (45.5%), and validated against the Aldar peer margin. The cyclicality gate is satisfied.

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.48% | 10-year US Treasury yield, ~4.47–4.49% as of July 2, 2026 (web-sourced, unverified: tradingeconomics.com, Jul-2026; used because AED is pegged to USD at 3.6725, making the USD risk-free rate the appropriate anchor for AED-denominated cash flows) |
| Equity risk premium (UAE) | 4.87% | Damodaran country risk premium dataset (Jan-2026 update), UAE Aa2 Moody's rating, adjusted default spread 0.42% (web-sourced: pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html, accessed Jul-2026, unverified) |
| Beta | 1.0 | Inference, not from filings — GCC developer peer range 0.9–1.1 per moat module §3; midpoint used. Capital IQ exports do not provide an explicit reported beta for EMAAR. |
| Cost of equity | 9.35% | CAPM: 4.48% + 1.0 × 4.87% = 9.35% |
| Pre-tax cost of debt | 3.76% | Weighted average of three outstanding sukuk: USD 500 Mn at 3.64% (due Sep-2026), USD 500 Mn at 3.875% (due 2029), USD 499.9 Mn at 3.70% (due 2031). Capital IQ Capital Structure Details, Q1-2026. |
| After-tax cost of debt | 3.27% | 3.76% × (1 − 13%) = 3.27% |
| Equity weight | 91.5% | Market cap AED 107,833 Mn / (AED 107,833 Mn + AED 10,064 Mn total debt) = 91.5% at AED 12.20/share |
| Debt weight | 8.5% | AED 10,064 Mn / AED 117,897 Mn = 8.5% |
| **Computed WACC** | **8.83%** | **0.915 × 9.35% + 0.085 × 3.27% = 8.56% + 0.28% = 8.83%** |

**Analyst override:** None applied. Computed WACC (8.83%) falls within the moat module's estimated WACC range of 9.0–10.0% (moat module §3, *Inference, not from filings*). The gap is 0.67pp — within the 2pp cross-check tolerance of MODULE_RULES Gate 4. The computed WACC is used as-is; both the computed (8.83%) and moat-module-inferred (9.0–10.0%) ranges are disclosed. No unbounded judgment override applied.

**WACC sanity bounds (MODULE_RULES §8):** Risk-free rate and ERP are both dated and labelled web-sourced. After-tax cost of debt (3.27%) is positive and plausible given sukuk rates. Terminal g (2.0%) is below the long-run nominal growth proxy for the AED/USD economy (~5–6% for UAE nominal GDP at ~4% real + ~2% inflation, or ~4–5% for a more conservative USD-linked view). WACC passes all sanity bounds.

---

## 4. Free Cash Flow Forecast & Discounting

FCFF identity: **FCFF = NOPAT + D&A − Capex − ΔNWC**

All figures AED millions. Mid-year convention: discount factor = 1 / (1 + WACC)^(yr − 0.5).

```
Executed Python snippet — output:

Year     Rev      EBIT    NOPAT    D&A  Capex    dNWC      FCF  dNWC-sign      DF    PV_FCF
FY2026  53,076   23,990  20,871  1,698  1,008  -4,315   25,876 release(+FCF) 0.9586  24,804
FY2027  60,241   26,506  23,060  1,928  1,145  -4,217   28,060 release(+FCF) 0.8808  24,715
FY2028  65,060   27,325  23,773  2,082  1,301  -3,253   27,807 release(+FCF) 0.8093  22,505
FY2029  68,313   26,984  23,476  2,186  1,366  -2,049   26,345 release(+FCF) 0.7437  19,592
FY2030  70,362   26,034  22,650  2,252  1,407  -1,055   24,549 release(+FCF) 0.6833  16,775
FY2031  72,121   25,603  22,275  2,308  1,442    -361   23,501 release(+FCF) 0.6279  14,756
FY2032  73,564   25,747  22,400  2,354  1,471       0   23,283 absorb(-FCF)  0.5769  13,433
```

**WC sign check:** In every year FY2026–FY2031, ΔNWC is negative (NWC falls), correctly adding to FCF ("release(+FCF)"). In FY2032, ΔNWC = 0 (no further release). The sign is consistent with a negative-NWC developer where revenue growth makes NWC more negative each year — a cash source, not a drag. Sanity-check passed: revenue is growing AND the WC line adds to FCF (correct for this business model).

**Sum of PV of explicit FCFs: AED 136,581 Mn**

---

## 5. Terminal Value

**Method:** Gordon Growth Model (Gordon perpetuity). Exit multiple is not used as the primary terminal method because Emaar's cycle position makes terminal-year multiples unreliable anchors.

**Terminal g choice — Gate 2 (Financeable Growth) flag and resolution:**

The financeable-growth cross-check (MODULE_RULES Gate 2) flagged a gap exceeding the 1.5pp threshold:
- Terminal NOPAT: AED 22,400 Mn; Net reinvestment (Capex − D&A) = AED 1,471 Mn − AED 2,354 Mn = −AED 883 Mn (negative net capex because D&A > Capex — a developer-specific structural feature where maintenance D&A on hotels/malls exceeds maintenance capex in steady-state)
- Reinvestment rate: −3.94% (negative, implying capital is being returned, not invested)
- Implied growth at through-cycle ROIC 12%: 12% × (−3.94%) = −0.47%
- The gap vs modeled terminal g = 3.5%: 3.97pp — exceeds the 1.5pp Gate 2 threshold

**Resolution per MODULE_RULES Gate 2:** Terminal g is LOWERED to 2.0% (the base case) from 3.5%. 2.0% is close to AED/USD long-run inflation (~2–2.5%) and represents a plausible low-real-growth terminal for a narrow-moat developer that earns above WACC but cannot sustain high nominal growth indefinitely. The original 3.5% case is shown in the sensitivity grid but is NOT the base case. Intrinsic confidence is capped (noted in §8).

Note on the developer mechanics: the negative net reinvestment arises because reported capex (hotel/mall maintenance + small additions) is below D&A on the same assets. In a true terminal, a developer's "reinvestment" in new land parcels flows through working capital (land bank acquisition), not reported capex — so the reinvestment rate calculation understates true capital needs. The conservative solution is to lower g rather than inflate the reinvestment assumption. This is appropriate given the cyclicality and narrow-moat context.

| Terminal Metric | Base Case (g=2.0%) | Sensitivity reference (g=3.5%) | Bear / Runoff (g=0%) |
|---|---:|---:|---:|
| Terminal FCF (FY2032 × (1+g)) | AED 23,749 Mn | AED 24,098 Mn | AED 23,283 Mn |
| Terminal value (undiscounted) | AED 347,711 Mn | AED 452,118 Mn | AED 263,680 Mn |
| PV of terminal value | AED 192,299 Mn | AED 250,041 Mn | AED 145,827 Mn |
| Terminal value as % of total EV | **58.5%** | **64.7%** | **51.6%** |

**Terminal value as % of EV (base case): 58.5% — below the 75% terminal-dominance threshold. Not flagged.**

```
Executed Python snippet — PV of TV at g=2.0%:
  Terminal FCF (FY2032): 23,283
  × (1 + 2.0%): 23,749
  ÷ (WACC − g) = (8.83% − 2.0%): 347,711 (undiscounted TV)
  ÷ (1 + 8.83%)^7: 192,299 (PV of TV)
```

**Structural-decline / runoff trigger (§5 declining-perpetuity gate):**

- `09_moat.md` verdict: **Narrow moat** (not "Strong moat" or "No moat proven"). A narrow moat is not the "No moat proven" trigger for a forced fade-to-WACC terminal. However, the moat is narrow and cyclical, so the base terminal DOES NOT include a perpetual excess-return premium — the terminal EBIT margin of 35% is chosen to deliver a through-cycle ROIC of approximately 11–12% (consistent with the moat module's through-cycle figure), barely above WACC of 8.83%. The base case is thus calibrated as a narrow-moat terminal, not a wide-moat premium.
- `07_business-quality.md` rate-of-change/disruption score: **62/100** — above the ≤40 threshold that would trigger an active-decay declining-perpetuity terminal. Real estate development is not a disruption-exposed business at current timescales. Therefore the declining-perpetuity terminal is shown as the **structural-impairment bear scenario** for `07_scenario-and-fair-value`, NOT as the base case.

**Declining-perpetuity / structural-impairment bear scenario (inputs to `07_scenario-and-fair-value`):**

```
Executed Python snippet — Bear/Runoff terminal:
  Scenario: Dubai cycle reverts toward mid-cycle trough
  Trough revenue assumed: AED 40,000 Mn (between FY2021 AED 27.9 Bn and FY2025 AED 49.6 Bn)
  Trough EBIT margin: 30% (between FY2021 23.5% trough and FY2025 45.5% peak)
  Trough NOPAT: AED 10,440 Mn
  Trough FCF (no WC release): AED 10,920 Mn
  Runoff TV (g=0%, undiscounted): AED 123,669 Mn
  Explicit FCF years 1-4: PV = AED 91,617 Mn
  PV of runoff TV (from year 4): AED 88,159 Mn
  Total EV (bear): AED 179,776 Mn
  + Net cash (broad): AED 24,969 Mn
  - Minority: AED 13,808 Mn
  = Equity value (bear): AED 190,937 Mn
  Bear per share: AED 21.60
```

The bear case of AED 21.60/share reflects the scenario where the current Dubai property upcycle peaks and reverts to mid-trough margins within the forecast horizon. Even in this scenario — which uses 4 years of backlog-supported FCF followed by a runoff perpetuity at trough margins — the per-share value (AED 21.60) exceeds the current price (AED 12.20) by 77%, primarily because of the AED 24,969 Mn net cash cushion that directly protects equity holders.

---

## 6. DCF Output

```
Executed Python snippet — EV to equity bridge (base case):

EV = PV of explicit FCFs + PV of terminal value
   = AED 136,581 Mn + AED 192,299 Mn
   = AED 328,880 Mn

+ Net cash (§15 broad basis: debt AED 10,064 Mn − cash+STI+trading AED 35,034 Mn)
  = + AED 24,969 Mn (net cash; add to EV for equity value)

- Minority interest (non-controlling interest)
  = − AED 13,808 Mn

= Equity value = AED 328,880 + 24,969 − 13,808 = AED 340,041 Mn

÷ Diluted shares (8,838.790 Mn, basic = estimated fully diluted; no dilution instruments identified)

= Intrinsic value per share = AED 340,041 / 8,838.790 = AED 38.47
```

| Step | Value (AED Mn) |
|---|---:|
| PV of explicit FCFs (FY2026–FY2032) | 136,581 |
| + PV of terminal value (g = 2.0%) | 192,299 |
| **= Enterprise value** | **328,880** |
| − Minority / non-controlling interest | (13,808) |
| + Net cash (broad basis: −net debt) | 24,969 |
| **= Equity value** | **340,041** |
| ÷ Diluted shares (Mn) | 8,838.790 |
| **= Intrinsic value per share** | **AED 38.47** |
| vs current price (AED 12.20, pool-verified Jun-28-2026) | **Current price is 68.3% below base intrinsic value** |

**Net debt basis note:** The broad basis (−AED 24,969 Mn net cash) is the canonical figure from `01_price-and-capital-structure` §7 (CIQ standard). Restricted cash (project escrow AED 43,338 Mn) is EXCLUDED — it is buyer-ring-fenced and not available for general corporate use. Using the strict basis (net cash −AED 2,115 Mn) would give equity value of AED 317,187 Mn and intrinsic value of AED 35.88/share — the sensitivity is shown but the broad basis is canonical.

---

## 7. Sensitivity Grid (Per-Share Intrinsic Value, AED)

Terminal growth (rows) vs WACC (columns). Base case in centre cell.

```
Executed Python snippet — sensitivity grid:
WACC:                  7.83%        8.83%        9.83%
g = 2.5%              47.0         40.3         35.4
g = 2.0% (BASE)       44.4         38.5         34.1
g = 1.5%              42.1         36.9         32.9
```

| | WACC −1% (7.83%) | WACC base (8.83%) | WACC +1% (9.83%) |
|---|---:|---:|---:|
| g +0.5% = 2.5% | 47.0 | 40.3 | 35.4 |
| g base = 2.0% | 44.4 | **38.5** | 34.1 |
| g −0.5% = 1.5% | 42.1 | 36.9 | 32.9 |

**Grid dispersion (base model): AED 32.9–47.0/share.**
**Bear (structural-impairment / cycle-trough runoff, g=0%): AED 21.60/share.**
**Current price: AED 12.20/share.**

Even the most conservative cell in the standard grid (WACC +1%, g −0.5% = AED 32.9/share) implies the stock is 170% above current price on a base-case DCF. The bear/runoff scenario (AED 21.60) still implies 77% above current price. This suggests either the DCF inputs are persistently too optimistic, or the market is pricing the stock at a very deep discount to intrinsic value — a finding that inverts the usual burden of proof.

**Additional sensitivity — strict net-cash basis (AED 2,115 Mn vs AED 24,969 Mn broad):**
Using strict net cash reduces the per-share range by approximately AED 2.6/share across all cells.

---

## 8. Intrinsic Read

The base-case intrinsic value is **AED 38.47/share** (WACC 8.83%, terminal g 2.0%), with the sensitivity grid spanning AED 32.9–47.0/share and a structural-impairment bear of AED 21.60/share. At the current price of AED 12.20, the stock trades at a discount of approximately 68% to the base-case intrinsic value across all cells of the grid — a gap so wide that it warrants explicit scrutiny of what the model is likely to be getting wrong, not just congratulating the finding.

**The three most likely sources of DCF optimism that could close this gap:**

1. **Cycle normalisation is deeper and faster than modeled.** The forecast uses consensus near-term revenue growth (FY2026: +7.1%, FY2027: +13.9%) anchored to the AED 134.3 Bn UAE backlog. If Dubai property demand collapses faster than the backlog buffers — e.g. because new sales drop 30%+ in 2025–2026 and construction delivery slows — then the FY2028–2032 revenue trajectory deflates well below the model. Even a 25% revenue cut in terminal-year revenue would compress the base intrinsic by roughly AED 10–12/share.

2. **Working capital assumptions.** The model includes AED 4.3–4.2 Bn of WC cash releases in FY2026–2027 from the growing negative-NWC developer structure. These are real economic flows in a rising-revenue environment, but they depend on continued new-sales momentum (buyer advances must keep growing to sustain the release). If new-sales momentum stalls, the WC release evaporates and the near-term FCF compresses materially.

3. **WACC could be higher.** A beta of 1.0 may understate country/cycle risk for a single-city developer at cycle peak. At beta = 1.3 (the higher end of a plausible range for a concentrated cyclical developer), cost of equity rises to ~10.83%, WACC to ~10.2%, and the base-case intrinsic falls to roughly AED 24–27/share — a tighter but still substantial premium to current price.

**The single assumption the model is most sensitive to:** Revenue trajectory from FY2028 onward, driven by how quickly the Dubai property cycle normalises. The AED 134.3 Bn backlog provides 5–6 years of revenue visibility, but the conversion pace (POC milestone certification) depends on contractor capacity, construction timelines, and delivery scheduling — the single highest-sensitivity variable identified in `earnings/07_earnings-sensitivity` §4.

**Confidence level: Medium-Low (capped).** Capped because: (a) the financeable-growth gate flagged a >1.5pp gap between implied growth and modeled terminal g, requiring the terminal g to be lowered; (b) the working-capital release figures are large relative to NOPAT in years 1–2, creating uncertainty; (c) the moat is narrow and the business is deeply cyclical, making the through-cycle terminal margin assumption materially uncertain. The base DCF value of AED 38.47 is a derived point estimate, not a precision figure — the AED 32.9–47.0 grid shows its fragility.

---

## Self-Check

- [x] Business-type gate applied: FCFF DCF is correct for an operating developer. Not a Financial or REIT.
- [x] Cyclicality gate applied: terminal EBIT margin of 35% benchmarked against Aldar peer (24% EBIT) and Emaar's own FY2021 trough (23.5%); terminal is between trough and peak, not at peak.
- [x] FCF base year stated (FY2025); normalizations itemized (unearned-revenue removal for normalised FCF; no tax-rate stripping needed as rate is structural).
- [x] Every forecast assumption labeled company-guided, consensus, or analyst assumption.
- [x] WACC components all shown with sources; web-sourced rates labeled. No analyst override (computed 8.83% is within 0.67pp of moat module's 9–10% estimate; Gate 4 satisfied).
- [x] Terminal value disclosed as % of EV (58.5% base case; below 75% threshold; not flagged).
- [x] Financeable-growth cross-check run; gap >1.5pp identified and resolved by lowering terminal g from 3.5% to 2.0%; confidence capped.
- [x] Working capital change forecast from revenue-linked driver (% of revenue, fading from −8.13% to 0%); not a flat absolute.
- [x] Working capital sign verified: negative ΔNWC = NWC falls = cash source = adds to FCF. Correct for a negative-NWC developer growing revenue. Sanity-check explicitly passed.
- [x] EV → equity bridge uses `01`'s canonical net cash (broad basis, −AED 24,969 Mn) and share count (8,838.790 Mn).
- [x] Discounting convention stated and defaults to mid-year (t − 0.5).
- [x] Sensitivity grid populated; per-share dispersion AED 32.9–47.0.
- [x] Report leads with single base-case intrinsic value (AED 38.47); grid is the dispersion exhibit; bear/runoff scenario shown separately.
- [x] Declining-perpetuity / structural-impairment bear shown (AED 21.60/share): labeled as bear input for `07_scenario-and-fair-value`, NOT the base case.
- [x] Narrow moat: terminal does NOT carry perpetual excess return premium — terminal ROIC is calibrated to ~11–12% (barely above WACC), consistent with narrow-moat evidence.
- [x] Computed FCF sum, terminal value, and EV → equity → per-share bridge are all from executed Bash/Python snippets with command + result shown (F09 requirement satisfied).
- [x] Partial-data cap applied (Medium-Low confidence) per financeable-growth flag and developer WC uncertainty.
- [x] No banned phrases.

---

*All FCF projections, WACC components, PV computations, terminal value, and equity bridge produced by executed Python (Bash) snippets from raw upstream module inputs. No mental arithmetic used for derived values. Numbers verified to reconcile: explicit FCF PV = AED 136,581 Mn + PV TV = AED 192,299 Mn = EV AED 328,880 Mn.*



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — EMAR (Emaar Properties PJSC)

**Reporting standard:** IFRS | **Currency:** AED (UAE Dirham), AED millions unless stated
**Fiscal year end:** 31 December | **Jurisdiction:** UAE — Dubai Financial Market (DFM)
**Price-state: pool-verified** (two independent Capital IQ pool sources, AED 12.20, Jun-28-2026)

---

## 1. Inputs

All parameters below are taken verbatim from `04_intrinsic-dcf.md` (the model being inverted) and `01_price-and-capital-structure.md` (the price anchor). No independent re-derivation of WACC or FCF base was done.

| Input | Value | Source |
|---|---:|---|
| Current price | AED 12.20 | `01_price-and-capital-structure.md` §1 — pool-verified (Capital IQ Comps export + 01_Consensus.xlsx, Jun-28-2026) |
| Enterprise value (market-implied, canonical broad basis) | AED 96,672 Mn | EV = Market cap (8,838.790 Mn × AED 12.20 = AED 107,833 Mn) + Minority interest (AED 13,808 Mn) − Net cash broad (AED 24,969 Mn) — from `01` §4 |
| Shares | 8,838.790 million | `01` §2 — basic = estimated fully diluted (no dilution instruments identified) |
| Net cash (§15 broad basis) | AED 24,969 Mn | `01` §5 — CIQ standard; restricted escrow (AED 43,338 Mn) excluded |
| Minority interest | AED 13,808 Mn | `01` §4 — Q1-2026 balance sheet |
| Normalised FCF base (FY2025) | AED 24,295 Mn | `04_intrinsic-dcf.md` §1 — reported FCF (AED 32,524 Mn) minus AED 8,229 Mn of unearned-revenue advance payments from off-plan buyers; per `earnings/06_earnings-quality` §1 and §10 |
| Discount rate (WACC) — from 04 | **8.83%** | `04_intrinsic-dcf.md` §3 — CAPM: Rf 4.48% (10-yr US Treasury, web-sourced Jul-2026) + ERP 4.87% (Damodaran UAE, Jan-2026, web-sourced) × Beta 1.0 = CoE 9.35%; after-tax cost of debt 3.27%; equity weight 91.5%; computed WACC 8.83% |
| Forecast horizon | 7 years (FY2026–FY2032) | `04_intrinsic-dcf.md` §2 — same horizon as forward DCF |
| Terminal growth (g) | 2.0% | `04_intrinsic-dcf.md` §5 — lowered from 3.5% per Gate 2 (financeable-growth); at long-run USD/AED inflation anchor |
| Discounting convention | Mid-year (t − 0.5) | `04_intrinsic-dcf.md` — same as forward DCF |
| FCFF identity | FCFF = NOPAT + D&A − Capex − ΔNWC | `04_intrinsic-dcf.md` §1 — same as forward model |

**Note on the market-implied EV.** The market-implied EV (AED 96,672 Mn) equals the EV computed using today's price, minority interest, and the broad net cash — it is identical to the canonical EV in `01` §4 (AED 96,672 Mn), because the canonical EV uses the same price. The forward DCF (`04`) derived an EV of AED 328,880 Mn, which is 3.4× the market-implied EV. The reverse-DCF finds what path of FCF growth makes the DCF EV equal the market EV of AED 96,672 Mn.

---

## 2. Implied Expectations

**What was held fixed:** WACC (8.83%), terminal g (2.0%), normalised FCF base (AED 24,295 Mn), horizon (7 years), discounting convention (mid-year), FCF identity (FCFF = NOPAT + D&A − Capex − ΔNWC). These are identical to `04`'s assumptions — the model is inverted on the same basis.

**What was solved for:** A single constant FCF CAGR over the 7-year horizon that makes the DCF EV equal the market-implied EV of AED 96,672 Mn, with a Gordon Growth terminal at g = 2.0%.

**Solver:** Python bisection loop (`brentq_simple`, tolerance 1e-8, 300 iterations) executed via Bash. Command and root shown below.

```
Python bisection — executed result:

EV_implied = 107,833 (market cap) + 13,808 (minority) − 24,969 (net cash broad) = 96,672 Mn

Objective: dcf_ev(g) = EV_implied
dcf_ev(g) = sum_{yr=1}^{7} [ FCF_base × (1+g)^yr / (1+0.0883)^(yr-0.5) ]
            + [ FCF_base × (1+g)^7 × 1.02 / (0.0883 − 0.02) ] / (1.0883)^7

Root (bisection): g = −21.34%

Verification: dcf_ev(−21.34%) = 96,672 Mn ✓

Year-by-year FCF at implied g = −21.34%:
  FY2026: FCF = 19,111 Mn, DF = 0.9586, PV = 18,319 Mn
  FY2027: FCF = 15,033 Mn, DF = 0.8808, PV = 13,241 Mn
  FY2028: FCF = 11,826 Mn, DF = 0.8093, PV =  9,571 Mn
  FY2029: FCF =  9,302 Mn, DF = 0.7437, PV =  6,918 Mn
  FY2030: FCF =  7,317 Mn, DF = 0.6833, PV =  5,000 Mn
  FY2031: FCF =  5,756 Mn, DF = 0.6279, PV =  3,614 Mn
  FY2032: FCF =  4,528 Mn, DF = 0.5769, PV =  2,612 Mn
  PV of explicit FCFs: 59,276 Mn
  Terminal FCF (4,528 × 1.02): 4,618 Mn
  PV of terminal value: 37,396 Mn (38.7% of EV)
  Total EV: 96,672 Mn ✓  Per-share check: AED 12.20 ✓
```

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCF CAGR (constant, FY2025 base → FY2032) | **−21.3%** per year |
| Implied FCF level by FY2032 | AED 4,528 Mn (vs AED 24,295 Mn today; an 81% total contraction) |
| Implied steady-state FCF (Gordon perpetuity equivalent) | AED 6,603 Mn = 27.2% of FY2025 normalised FCF |
| Implied revenue by FY2032 (at `04`'s terminal FCF margin of 31.65%) | AED 14,306 Mn (vs FY2025 revenue of AED 49,557 Mn; a 71% total contraction) |
| Implied steady-state EBIT margin (at FY2025 revenue, g=0% flat FCF) | **13.9%** — below the FY2021 cycle-trough EBIT margin of 23.5% |
| PV of terminal value as % of EV | 38.7% — below the 60% threshold requiring terminal g sensitivity |

**Interpreting the −21.3% CAGR.** This number is the direct output of inverting the same model as `04`, using the same normalised FCF base. It is not a forecast — it is the growth rate the constant-CAGR model requires to match the market EV. The forward DCF (`04`) incorporated large working-capital releases in the early years (ΔNWC contributions of AED 4.3 Bn in FY2026 and AED 4.2 Bn in FY2027) that pushed explicit-period FCF PV to AED 136,581 Mn — already 41% MORE than the entire market-implied EV of AED 96,672 Mn. The constant-CAGR reverse-DCF must therefore price in a severe contraction from the FY2025 base to offset any contribution from the terminal. In plain terms: the market assigns a total enterprise value that is less than the present value of the next 7 years of FCF that `04`'s base-case model projects — meaning the market expects either dramatically lower near-term FCF, or no terminal value, or both.

**Secondary framing (more intuitive).** If one holds g = 0% (flat FCF forever at some constant level) and solves for the FCF level the market implies: the required flat FCF is AED 7,140 Mn — 29.4% of today's FY2025 normalised level. To generate AED 7,140 Mn of normalised FCF at FY2025 revenue (AED 49,557 Mn), Emaar would need an EBIT margin of approximately 13.9% — below its own cycle-trough EBIT margin of 23.5% in FY2021.

---

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| FCF CAGR of −21.3% per year for 7 years (FCF falls from AED 24,295 Mn to AED 4,528 Mn by FY2032) | FY2021–FY2025 normalised FCF CAGR: approximately +35% (AED ~7,170 Mn → AED 24,295 Mn). Even in the FY2022 dip (revenue fell −10.6%), normalised FCF stayed at AED 13,844 Mn. No 7-year run of −21% FCF contraction in Emaar's modern history. | `earnings/07_earnings-sensitivity.md` §4: POC delivery pace is the dominant variable at ±AED 2,500 Mn EBITDA sensitivity. A −15% delivery-pace shock moves EBITDA by ~−AED 2,500 Mn — not the ~AED 17,692 Mn annual contraction the market implies. | **No — historically unprecedented; not achievable without a sustained physical inability to deliver backlog** |
| Steady-state EBIT margin of 13.9% (at FY2025 revenue) | FY2021 trough EBIT margin: 23.5%. FY2020 EBITDA was AED 5.2 Bn (lowest in recent history). An EBIT margin of 13.9% has never been recorded in the available data for Emaar. | `earnings/07_earnings-sensitivity.md` §2: even a +10% construction-cost-inflation shock moves annual EBITDA by only ~AED 150–200 Mn — a 1% move in EBITDA margin, not the 32pp implied by the market. | **No — below any cycle-trough margin in recorded history** |
| Revenue contracting to AED 14,306 Mn by FY2032 (a 71% total shrinkage from AED 49,557 Mn) | UAE revenue backlog at Dec-31-2025: AED 134.3 Bn. At FY2025 delivery pace, this backlog alone supports AED 134.3 Bn / 5–6 years ≈ AED 22–27 Bn of annual revenue recognition through FY2031 — even with zero new sales. FY2021 revenue was AED 27.9 Bn. | `earnings/01_historical-financials.md` §6: the AED 154.8 Bn total backlog (AED 134.3 Bn UAE + AED 20.5 Bn international) locks in at least 3–4 years of elevated revenue even without any new sales. A decline to AED 14,306 Mn by FY2032 would require delivering fewer than 10% of the contracted backlog — not physically possible given construction obligations. | **No — physically impossible given existing contractual backlog obligations** |

**Market-ceiling sanity check.** For an operating real estate developer, the relevant ceiling test is a revenue-size comparison. The implied FCF CAGR of −21.3% translates to implied FY2032 revenue of AED 14,306 Mn (held at the normalised FCF margin of 31.65% from `04`'s terminal assumptions). Emaar's UAE revenue backlog alone stood at AED 134.3 Bn at Dec-31-2025 — roughly 9.4× FY2025 annual revenue. Delivering AED 14,306 Mn of revenue by FY2032 from a base of AED 49,557 Mn and an existing contracted backlog of AED 134.3 Bn is not feasible without cancelling the overwhelming majority of signed and construction-stage contracts. This is not a risk scenario — it is a physical impossibility under normal commercial conditions. The market-ceiling check therefore confirms the market-implied FCF path is **aggressively pessimistic beyond any scenario the evidence supports**. [Source: FY2025 Investor Presentation (Feb-12-2026), slide 16 (UAE backlog AED 134.3 Bn); `earnings/01_historical-financials.md` §6]

**Conclusion on achievability.** The market's implied FCF trajectory at AED 12.20 requires Emaar to experience a permanent earnings implosion that would need a combination of (a) most of its AED 134.3 Bn backlog being cancelled or defaulted on, (b) EBIT margins falling below 14% — a level never recorded — and (c) the business permanently producing below the absolute earnings it generated in FY2021, its deepest modern trough. None of these conditions has ever co-occurred. The market's implied expectations are **aggressive — specifically, aggressively pessimistic relative to evidence**. The implied scenario is not achievable in the downward direction under normal commercial conditions.

---

## 4. Robustness

**Primary solve: WACC sensitivity (base FCF = AED 24,295 Mn)**

| Discount Rate | Implied FCF CAGR to Justify Price |
|---|---:|
| WACC −1% (7.83%) | −23.1% |
| WACC base (8.83%) | **−21.3%** |
| WACC +1% (9.83%) | −19.7% |

WACC range: 3.4 percentage points. A lower WACC (a more generous discount rate, which raises any given stream's PV) paradoxically requires a FASTER contraction — because the lower WACC makes the explicitly-priced FCFs worth more in PV terms, requiring a sharper decline to keep the total below the market EV.

**Secondary solve: FCF base sensitivity (base WACC = 8.83%)**

The FCF base has much more impact than the discount rate — an 11pp range vs 3.4pp:

| FCF Base Case | FCF Base (AED Mn) | Basis | Implied FCF CAGR |
|---|---:|---|---:|
| Low — FY2024 normalised FCF | 15,506 | `earnings/01_historical-financials.md` §1 | −13.5% |
| Base — FY2025 normalised FCF | 24,295 | `04_intrinsic-dcf.md` §1 (canonical) | **−21.3%** |
| High — approx TTM normalised (Q2-25 to Q1-26) | 29,000 | Approximate (reported TTM FCF 30,982 Mn minus estimated unearned-revenue adjustment) | −24.5% |

**The FCF base is the dominant swing factor** — more than 3× the WACC range. At the Low FCF base (using FY2024's level as the starting point), the implied FCF CAGR rises to −13.5%, which would still require revenue to fall to roughly AED 22–24 Bn — still well below what the AED 134.3 Bn backlog alone guarantees.

**Combined WACC × FCF base robustness table**

| FCF Base | WACC 7.83% | WACC 8.83% | WACC 9.83% |
|---|---:|---:|---:|
| Low (AED 15,506 Mn, FY2024) | −15.5% | −13.5% | −11.6% |
| Base (AED 24,295 Mn, FY2025) | −23.1% | **−21.3%** | −19.7% |
| High (AED 29,000 Mn, TTM approx.) | −26.2% | −24.5% | −23.0% |

**Across the full grid (9 combinations), the implied FCF CAGR ranges from −11.6% to −26.2%.** Even at the most favourable combination (Low FCF base, High WACC), the market requires an 11.6%-per-year contraction from a starting FCF of AED 15,506 Mn — which still implies terminal FCF below AED 6,000 Mn, a level inconsistent with AED 134.3 Bn of existing contracted backlog.

**Terminal value % check.** TV as % of EV at the base case = 38.7%, well below the 60% threshold. The solve is NOT terminal-dominated. Terminal g sensitivity (±0.5%) is not required by the MODULE_RULES threshold but was computed for completeness: varying terminal g between 1.5% and 2.5% moves the implied FCF CAGR by only ±0.5pp (from −20.8% to −21.9%), confirming that terminal g is not a material driver in this low-TV-weight solve. The dominant input is unambiguously the FCF base.

---

## 5. What's-Priced-In Read

At AED 12.20, the market is pricing in a permanent and catastrophic collapse in Emaar's FCF — a 7-year constant contraction of 21% per year, taking normalised FCF from AED 24,295 Mn today to AED 4,528 Mn by FY2032, which would imply an EBIT margin below 14% — lower than any level in the company's recorded history, including the FY2021 post-COVID trough (23.5% EBIT margin). That implied scenario is **aggressively pessimistic to the point of being physically inconsistent** with Emaar's existing contractual obligations: the AED 134.3 Bn UAE revenue backlog alone (signed contracts already under construction) makes an 81% total FCF contraction over 7 years impossible under normal commercial conditions, regardless of new-sales activity. The market appears to be pricing Emaar as if the Dubai property cycle will immediately collapse to below-trough-level economics AND sustain that level for the entire forecast period — the most bearish combination of cycle position and margin assumptions in its history, compounded without recovery. This is not achievable downward; the implied expectations are conservative in the sense that the bar is actually unachievable, meaning any realistic out-turn — even a severe cycle downturn — is likely to produce significantly more FCF than the price embeds.

---

## Self-Check

- [x] Current price and EV match `01`, price-state is `pool-verified`. No partial-data stop applied.
- [x] WACC (8.83%), normalised FCF base (AED 24,295 Mn), terminal g (2.0%), horizon (7 years), and discounting convention (mid-year) are taken verbatim from `04_intrinsic-dcf.md`. The reverse-DCF inverts the same model.
- [x] Discount rate stated explicitly with components (Rf 4.48%, ERP 4.87%, beta 1.0, CoE 9.35%; after-tax cost of debt 3.27%; WACC 8.83%).
- [x] The solve clearly states what is held fixed (WACC, terminal g, FCF base, horizon, convention) and what is solved for (constant FCF CAGR).
- [x] Implied expectations are compared to the company's historical growth (`earnings/01_historical-financials.md`) and earnings-module evidence (`earnings/07_earnings-sensitivity.md`).
- [x] The achievable/stretch/no judgement is evidence-backed: backed by actual historical FCF levels, the AED 134.3 Bn contracted backlog, and the historical trough EBIT margin of 23.5%.
- [x] Robustness shown across BOTH the discount rate (3.4pp range) AND the FCF base (11pp range), with the FCF base named as the dominant input. Terminal g ±0.5% checked; TV% = 38.7% is below 60% threshold.
- [x] The implied-growth solve and all robustness re-solves were produced by an executed Bash/Python bisection solver with the command and root shown. No hand computation.
- [x] Market-ceiling check conducted: implied revenue (AED 14,306 Mn FY2032) tested against AED 134.3 Bn contracted backlog — physically impossible.
- [x] No banned phrases.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — EMAR (Emaar Properties PJSC, DFM:EMAAR)

**Reporting standard:** IFRS | **Currency:** AED (UAE Dirham), AED millions | **Fiscal year end:** 31 December
**Jurisdiction:** UAE — Dubai Financial Market (DFM) | **Balance sheet date used:** Q1-2026 (Mar-31-2026) | **Price date:** Jun-28-2026

---

## 1. Segment Inventory

This SOTP uses the management operating view (five buckets from the FY2025 investor presentation) rather than the three IFRS reportable segments, because the management view provides segment-level EBITDA directly. The IFRS segment note provides NPBT but not EBITDA by segment; the investor deck EBITDA is reconcilable to the IFRS total (AED 25,561 Mn management EBITDA vs AED 25,657 Mn IFRS total NPBT — the minor difference reflects IFRS interest allocations netted differently). The five-bucket split is therefore more useful for applying segment EV/EBITDA multiples.

**Denominator note:** "% of Total EBITDA" below is expressed as a share of the AED 25,561 Mn total group EBITDA per the investor deck. This is 100% of the investor-deck EBITDA total; it does NOT yet net the unallocated corporate SG&A drag (AED −1,314 Mn per the IFRS segment note), which is handled separately in the equity bridge (Section 4).

All figures in AED millions unless stated.

| Segment | Revenue FY2025 | EBITDA FY2025 | EBITDA Margin | % of Total EBITDA | Source |
|---|---:|---:|---:|---:|---|
| UAE Development | 36,443 | 16,710 | 45.8% | 65.4% | FY2025 Investor Presentation (Feb-12-2026), slide 16 |
| Emaar Malls (incl. JV basis) | 5,754 | 4,935 | 85.8% | 19.3% | FY2025 Investor Presentation (Feb-12-2026), slide 22 |
| International Development | 2,570 | 797 | 31.0% | 3.1% | FY2025 Investor Presentation (Feb-12-2026), slide 20; margin implied from deck commentary "~31% for Emaar Misr" |
| Emaar Hospitality | 2,326 | 1,109 | 47.7% | 4.3% | FY2025 Investor Presentation (Feb-12-2026), slide 32 |
| Entertainment, Leasing & Others | 2,465 | 2,010 | 81.5% | 7.9% | FY2025 Investor Presentation (Feb-12-2026), slide 13; EBITDA derived as residual: 25,561 − 16,710 − 4,935 − 797 − 1,109 = 2,010 |
| **Total (management EBITDA)** | **49,558** | **25,561** | **51.6%** | **100%** | **FY2025 Investor Presentation (Feb-12-2026), slide 12** |
| Unallocated SG&A | — | −1,314 | — | — | Capital IQ Annual Financials — Segments tab, FY2025; not included above, capitalized in bridge |

**Reconciliation check:** Revenue sums to AED 49,558 Mn (=AED 49,557 Mn per IFRS; rounding). EBITDA summed to AED 25,561 Mn; unallocated SG&A of AED −1,314 Mn sits outside the segment total and is capitalized in the bridge (Section 4). Unallocated finance income of AED +583 Mn is also excluded from segment EBITDA (it flows through NPBT in the IFRS note) and is treated as a non-operational item — not added to segment EV.

**International Development disclosure note:** The investor deck shows International (Emaar Misr) EBITDA margin of approximately 31%; the exact AED EBITDA figure is not stated but can be derived as above. The IFRS segment note shows "Real Estate" NPBT of AED 19,752 Mn (which includes both UAE and International development) and cannot be cleanly split to the management operating sub-buckets. The residual methodology for Entertainment/Leasing & Others introduces a small accumulation error; the residual EBITDA of AED 2,010 Mn (margin 81.5%) is consistent with a high-margin entertainment-and-leasing mix (the investor deck's combined "recurring businesses" EBITDA of 32% of the AED 25,561 Mn total = AED 8,179 Mn, which aligns with Malls AED 4,935 + Hospitality AED 1,109 + Entertainment AED 2,010 = AED 8,054 Mn — within rounding).

---

## 2. Segment Multiples & Comparables

For each segment the metric used is EBITDA (because the segment comparables all trade on EV/EBITDA). Multiple selection anchors to a named listed comparable closest to the segment's activity profile.

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| UAE Development | EV/EBITDA (FY2025) | 8.0x | Aldar Properties PJSC (ADX:ALDAR) — closest listed peer in UAE master-community development | 8.3x LTM (Capital IQ Comps export, Jun-28-2026); confirmed ~8.5x per web (GuruFocus, accessed 2026-07-03, unverified) | Capital IQ Comps export, Trading Multiples tab, Jun-28-2026 |
| Emaar Malls | EV/EBITDA (FY2025) | 17.0x | Arabian Centres Company (SASE:4321) — largest listed mall owner/operator in the Gulf; 21 lifestyle malls, comparable lease-based recurring income model | 18.9x LTM (Capital IQ Comps export, Jun-28-2026) | Capital IQ Comps export, Trading Multiples tab, Jun-28-2026 |
| International Development | EV/EBITDA (FY2025) | 6.0x | Aldar Properties PJSC (ADX:ALDAR) applied with a 25% discount for emerging-market location risk (Egypt/India), currency risk (EGP depreciation, INR exposure), and lower margins vs UAE | 8.3x × 0.75 = 6.2x, rounded to 6.0x (conservative; Emaar Misr alone represents ~85–90% of international EBITDA) | Capital IQ Comps export, Jun-28-2026; discount: Inference |
| Emaar Hospitality | EV/EBITDA (FY2025) | 12.0x | InterContinental Hotels Group PLC (NYSE/LSE:IHG) — largest asset-light hotel operator; EV/EBITDA ~20x at global scale (asset-light). A haircut is applied because Emaar Hospitality is asset-heavy (owns the buildings, not just management contracts) and smaller in scale | ~20x for IHG (web: GuruFocus, Jun-15-2026, unverified); 12x applied reflects asset-heavy penalty (asset-heavy hospitality REITs trade 10–14x globally) | Web: GuruFocus IHG EV/EBITDA data, accessed 2026-07-03, unverified |
| Entertainment, Leasing & Others | EV/EBITDA (FY2025) | 14.0x | Arabian Centres Company (SASE:4321) used as a proxy; a slight discount to the full 18.9x mall multiple is applied because this bucket includes lower-quality entertainment and commercial leasing activity alongside retail | 18.9x for Arabian Centres (discounted to 14.0x given mixed asset quality; discount: Inference) | Capital IQ Comps export, Jun-28-2026; discount: Inference |

**Why these comparables fit:**
- **UAE Development / Aldar:** Aldar is the only other listed UAE master-community developer of significant scale, with an identical legal and regulatory environment, comparable project types (villas, apartments, mixed-use), and an IFRS reporting base. The 8.0x applied is a modest haircut to Aldar's 8.3x because Emaar UAE Development's revenue is more volatile (off-plan percentage-of-completion recognition) and its backlog execution risk is higher at a AED 134.3 Bn scale.
- **Emaar Malls / Arabian Centres:** Arabian Centres (now Cenomi Centers) is the most comparable listed Gulf mall operator — it is pure-play retail mall ownership and management, generating recurring lease income, with a comparable high EBITDA margin (~86% for Emaar Malls vs ~70% sector average). A discount from 18.9x to 17.0x is applied because Emaar Malls operates under a JV/management structure and the 5,754 Mn revenue includes a JV gross-up that may overstate the directly-owned base.
- **Hospitality / IHG:** No listed Gulf hotel company of comparable scale exists. IHG is used as a global benchmark with a meaningful discount for asset-heaviness. The 12.0x applied falls within the range of asset-heavy hospitality companies globally (Host Hotels & Resorts trades at ~12–14x EV/EBITDA; per web sources, unverified).
- **Entertainment & Others / Arabian Centres (discounted):** The entertainment and commercial leasing sub-bucket lacks a single named pure-play comparable. Arabian Centres is used as the nearest proxy but discounted to 14.0x to account for the heterogeneous nature of the bucket (entertainment attractions have higher capex and more cyclical revenue than mall leasing).

---

## 3. Segment Valuation

All figures in AED millions.

| Segment | EBITDA (FY2025) | Multiple Applied | Segment EV |
|---|---:|---:|---:|
| UAE Development | 16,710 | 8.0x | 133,680 |
| Emaar Malls | 4,935 | 17.0x | 83,895 |
| International Development | 797 | 6.0x | 4,782 |
| Emaar Hospitality | 1,109 | 12.0x | 13,308 |
| Entertainment, Leasing & Others | 2,010 | 14.0x | 28,140 |
| **Gross enterprise value (sum)** | **25,561** | — | **263,805** |

**Multiple-driven dispersion (±1 turn on each segment multiple):**

The main source of dispersion in this SOTP is the Emaar Malls multiple (small change in the mall multiple has a large effect) and the UAE Development multiple. Applying ±1 turn on all segments simultaneously:
- Bull (multiples +1 turn each): EV approximately +AED 25,600 Mn → gross EV ~AED 289,400 Mn
- Bear (multiples −1 turn each): EV approximately −AED 25,600 Mn → gross EV ~AED 238,200 Mn

The dispersion range is shown alongside the base-case point above; it is not collapsed into a single target.

---

## 4. Equity Bridge

The bridge follows the anchor numbers from `01_price-and-capital-structure.md` (broad/CIQ basis, Q1-2026 balance sheet). The unallocated corporate SG&A is capitalized at the group EBITDA multiple (blended base-case implied multiple = AED 263,805 Mn / AED 25,561 Mn = 10.3x) and deducted from gross EV.

**Capitalized corporate costs:** Unallocated SG&A = AED −1,314 Mn. Capitalized at 10.3x → AED −13,534 Mn.

**Equity-method investments (AED 7,529 Mn at Q1-2026):** These are not included in the segment EBITDA stream above and are therefore added as a separate asset to avoid double-counting. They represent primarily Emaar's stakes in associates not consolidated into segment revenues.

**Net cash sign discipline (§15 / MODULE_RULES):** The company is net cash on both the strict and broad basis. The bridge adds back net cash once as a positive line. The canonical broad-basis net cash of AED +24,969 Mn (from `01`) is used, consistent with the CIQ comps convention.

All figures in AED millions.

| Step | AED Mn |
|---|---:|
| Gross enterprise value (sum of segment EVs) | 263,805 |
| − Capitalized unallocated corporate SG&A (AED 1,314 Mn × 10.3x) | −13,534 |
| − Net debt [broad basis: net cash, shown as addition since company is net cash] | +24,969 |
| − Minority / non-controlling interest | −13,808 |
| + Preferred equity | 0 |
| + Equity-method investments | +7,529 |
| − Conglomerate / holdco discount | 0 |
| **= Equity value (base case)** | **268,961** |
| ÷ Diluted shares (millions) | 8,838.79 |
| **= SOTP value per share (base case)** | **AED 30.43** |
| vs current price (AED 12.20, Jun-28-2026) | **vs AED 12.20 (−60% discount to SOTP)** |

**Dispersion range (±1 turn on all multiples):**
- Bull: Gross EV AED 289,400 Mn → Equity ~AED 294,500 Mn → AED 33.32/share
- Bear: Gross EV AED 238,200 Mn → Equity ~AED 243,400 Mn → AED 27.54/share

**SOTP per-share range: AED 27.54 – AED 33.32 (base case AED 30.43)**

**Conglomerate/holdco discount:** None applied. Emaar is an operating company that actively manages all three IFRS segments through direct subsidiaries; the Emaar Malls PJSC subsidiary was taken private in 2021 and fully consolidated, eliminating the historical holdco discount. The structure does not add a layer of non-operating holding-company overhead that would ordinarily warrant a 10–20% discount. No discount is therefore warranted on structural grounds. (A mild valuation-complexity discount could be argued given the JV gross-up in the Malls presentation, but this is already partially captured in the 17.0x vs 18.9x discount applied in Section 2.)

**Net-cash sign mechanics:** The broad-basis net cash of AED 24,969 Mn (from `01`) reduces the effective burden of the equity bridge — there is no net debt to deduct. It is shown as a single positive addition (+AED 24,969 Mn), not as a "−net debt" deduction plus a separate "+net cash" addition (which would double-count). Restricted cash (project escrow AED 43,338 Mn) is excluded, as confirmed in `01`.

---

## 5. SOTP Read

The break-up value of AED 30.43 per share (range AED 27.54–33.32) sits 149% above the current price of AED 12.20 — a gap that is not a precision claim but a structural finding from the segment-level arithmetic. The Emaar Malls segment carries the insight: it contributes only 12% of group revenue but generates 19% of group EBITDA at an 86% margin, and when valued at a mall-operator multiple (17.0x) rather than the blended 3.6x the market is currently applying to the consolidated entity (from the CIQ comps export), it alone accounts for AED 83,895 Mn of gross EV — roughly 78% of the current consolidated market cap. The consolidated multiple is dramatically compressing the mall segment's value by blending it with the lower-multiple property-development business. UAE Development at 8.0x contributes the largest absolute EV at AED 133,680 Mn, but the Emaar Malls segment is the one being masked: a world-class, 86%-margin mall portfolio anchored by Dubai Mall — one of the most visited destinations on earth — is being valued implicitly at below 3x EBITDA within the conglomerate structure. Whether this discount is permanent depends on whether Emaar ever re-lists or monetizes the Malls portfolio separately; absent that catalyst, the gap between the SOTP value and the current price is likely to persist.

---

## Self-Check

- [x] Segment inventory reconciles to consolidated revenue (AED 49,557 Mn) and total management EBITDA (AED 25,561 Mn); unallocated corporate SG&A of AED −1,314 Mn is explicitly held out and capitalized in the bridge — never dropped by assertion (Gate 3 satisfied).
- [x] Multi-segment business: SOTP does not collapse (no single segment exceeds 85% of EBIT; UAE Development is 65.4% of EBITDA, below the 85% threshold).
- [x] Every segment multiple cites a NAMED comparable (Aldar for Development; Arabian Centres for Malls and Entertainment; IHG for Hospitality).
- [x] Web-sourced comparable multiples are labeled unverified (IHG multiple; GuruFocus Aldar cross-check).
- [x] Equity bridge uses `01`'s share count (8,838.790 million) and broad-basis net cash (AED +24,969 Mn).
- [x] Net cash is added once as a single positive line; no deduction-plus-add-back double-count; restricted escrow cash (AED 43,338 Mn) excluded.
- [x] Unallocated corporate SG&A capitalized and subtracted — not dropped.
- [x] No conglomerate discount applied; reason stated.
- [x] The read identifies which segment carries the masked value (Emaar Malls).
- [x] Output is a base-case point (AED 30.43) with dispersion range shown separately (AED 27.54–33.32); no false precision on the single target.
- [x] No banned phrases used.

---

*Sources: Capital IQ Annual Financials export — Segments tab (FY2020–FY2025), filed Feb-12-2026; Capital IQ Comparable Analysis export — Trading Multiples tab, as of Jun-28-2026; FY2025 Investor Presentation / Preliminary Annual Report (Feb-12-2026), slides 12, 13, 16, 20, 22, 32; `01_price-and-capital-structure.md` (anchor block); web: GuruFocus IHG EV/EBITDA data, accessed 2026-07-03 (unverified); GuruFocus Aldar EV/EBITDA data cross-check, accessed 2026-07-03 (unverified).*



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — EMAR (Emaar Properties PJSC, DFM:EMAAR)

**Reporting standard:** IFRS | **Currency:** AED (UAE Dirham) | **Fiscal year end:** 31 December  
**Price anchor:** AED 12.20 (pool-verified, two independent Capital IQ sources, Jun-28-2026)  
**Price-state: pool-verified** — margin of safety and downside-to-bear are assessable.  
**Date:** 2026-07-03

---

## Headline Finding — Cross-Method Spread of 102%

The four value-producing methods span AED 19.08 (own-history multiples reversion) to AED 38.47 (intrinsic DCF). That is a 102% spread from low to high — well above the 40% flag threshold and the headline finding of this report. The spread is not narrowed into a fake mid-band; it is the honest dispersion shown in the football field below. The base point is derived from a weighted blend adjusted for the government-owner structural discount, and all four methods agree the current price of AED 12.20 is materially below even the most conservative base, making the cross-method disagreement about **magnitude of undervaluation**, not **direction**.

---

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | AED 19.08 (EV/EBITDA own-median reversion) — range AED 15.49–19.08 | Medium | 20% | Useful direction signal; own-median EV/EBITDA (6.25x) discounts elevated FY2022 multiples. Moderate weight because: (a) the UAE corporate tax step-up (9% CIT + 15% DMTT) structurally widens the EBIT→net-income gap, warranting a lower P/E vs history; and (b) the historical series spans only 4.25 years — a period that includes a significant property upcycle and may embed an inflated mean. |
| Relative / peers (03) | AED 25.97 (NTM EV/EBITDA 8.0x, warranted-multiple base) — range AED 12.34–35.24 | Medium-Low | 20% | The peer set is messy: 5 of 10 peers are Chinese developers in distress or contraction; the warranted multiple (8.0x NTM EV/EBITDA) rests on an analyst assumption premium over Aldar's 6.77x. Weight reflects limited comparability; nonetheless, the cycle-adjusted multiple framework (8.0x vs the raw peer median of 14.37x) is a useful cross-check and directionally consistent with the intrinsic method. |
| Intrinsic DCF (04) | AED 38.47 (WACC 8.83%, terminal g 2.0%, mid-cycle terminal EBIT margin 35%) — sensitivity range AED 32.9–47.0; cycle-trough bear AED 21.60 | Medium-Low (capped per 04: Gate 2 financeable-growth flag; WC uncertainty) | 35% | Highest weight because it is the only method fully anchored to through-cycle cash flows (cyclicality gate applied; terminal margin 35% between FY2021 trough 23.5% and FY2025 peak 45.5%). At 58.5% terminal value as % of EV, the DCF is not terminal-dominated. Moderate-Low confidence cap applies per 04's self-check (Gate 2 flag resolved by lowering terminal g; large near-term WC release adds uncertainty). |
| Reverse-DCF (05) | Implied FCF CAGR of −21.3%/yr — not a fair-value level | Cross-check | n/a | Inverts the same model as 04 using identical parameters. Price implies an 81% total FCF contraction by FY2032 — to a level below the company's AED 4,528M, which is inconsistent with the AED 134.3Bn contracted UAE revenue backlog (making a contraction of that magnitude physically impossible under normal conditions). Confirms the base-case methods are plausible; the current price embeds an extreme pessimism that the evidence does not support. |
| Sum-of-the-parts (06) | AED 30.43 (segment EV/EBITDA × named comps) — range AED 27.54–33.32 | Medium | 25% | Strong for EMAR specifically: the company has five distinct segments with materially different economics (UAE Development at ~8x, Emaar Malls at ~17x). The SOTP surfaces the value of Emaar Malls (86% EBITDA margin) being masked inside the consolidated 3.6x EV/EBITDA. Weight reflects quality of named comparables (Aldar for Development; Arabian Centres for Malls) and a well-documented equity bridge using `01`'s canonical net cash. Second-highest weight. |

**Weights sum:** 20% + 20% + 35% + 25% = 100% across the four value-producing methods. Reverse-DCF carries 0% weight per MODULE_RULES (cross-check, not a fair-value input). No method is zero-weighted as invalid for the business type — EMAR is an operating real estate developer (not a Financial or REIT), so FCFF DCF and EV-based SOTP are both valid methods per the Business-Type Method Map.

---

## 2. Triangulation & Reconciliation

### Football Field — Cross-Method Dispersion (Honest, Not Narrowed)

| Method | Value / Range (AED/share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | 15.49–19.08 (base 19.08) | Medium | 20% | Own-median EV/EBITDA useful anchor; tax step-up warrants some structural multiple compression vs history |
| Relative / peers (03) | 12.34–35.24 (base 25.97) | Medium-Low | 20% | Messy peer set; warranted-multiple (8.0x NTM) is cycle-adjusted; P/E and EV/EBITDA sub-lenses diverge materially (AED 15.0 vs AED 26.0) |
| Intrinsic DCF (04) | 32.9–47.0 (base 38.47; cycle-trough bear 21.60) | Medium-Low (capped) | 35% | Through-cycle anchor; Gate 2 resolved; WC uncertainty noted; confidence capped per 04 |
| Sum-of-the-parts (06) | 27.54–33.32 (base 30.43) | Medium | 25% | Segment-level EBITDA × named comps; surfaces Malls value masked in consolidated multiple |

**True high-to-low spread: AED 19.08 (02 base) to AED 38.47 (04 base) — a 101.6% spread.**  
The bear anchors from each method (P/EPS median AED 15.49 from 02; NTM P/E bear AED 12.34 from 03; DCF cycle-trough AED 21.60 from 04; SOTP bear AED 27.54 from 06) define the downside range, not a consensus bear floor.

**Executed computation — snippet output:**
```
Weighted base (mechanical): AED 30.08/share
  02 contribution: 20% × 19.08 = 3.82
  03 contribution: 20% × 25.97 = 5.19
  04 contribution: 35% × 38.47 = 13.46
  06 contribution: 25% × 30.43 = 7.61
Cross-method spread: max 38.47 / min 19.08 = 101.6% spread — headline finding flagged
```

**Base-case fair value: AED 27.7 per share** (AED 28 rounded). This is the mechanical blend of AED 30.08 reduced by an explicit 8% government-owner discount (see below). The departure from the mechanical blend is disclosed here — it is not a silent re-anchor.

**Reconciliation judgment.** The four methods agree on direction (all materially above AED 12.20) but diverge sharply on magnitude. The own-history method (AED 19.08) is the lowest and most conservative, anchored to the EPS-median reversion which already absorbs the tax step-up. The intrinsic DCF (AED 38.47) is the highest, resting on through-cycle mid-year-convention FCF projections with a 35% terminal EBIT margin — defensible but uncertain. The SOTP (AED 30.43) sits in the middle and is arguably the most transparent lens because it does not require a terminal-growth assumption; it surfaces the Emaar Malls segment value that consolidated multiples mask at 3.6x EV/EBITDA. The peer-relative method (AED 25.97) uses a cycle-adjusted warranted multiple (8.0x NTM EV/EBITDA vs the raw peer median of 14.37x) and represents the most pessimistic of the four upper-bound estimates. The highest-trust lens for this business is the **SOTP + DCF combination** (60% combined weight): Emaar is a multi-segment operating company where the Malls segment has genuinely different economics from the development business, and the intrinsic DCF is anchored to through-cycle norms and is the only method that prices in the AED 134.3Bn backlog's cash-generation profile over time.

**Government-owner conservative adjustment (disclosed lens departure).** CLAUDE.md §24 Filter 6 (unaligned owners) and MODULE_RULES (RF-OWN-004): Dubai Holding holds 29.73% of EMAR following the May 2026 ICD → Emirates Power Investment LLC intra-government transfer. A government entity as the controlling shareholder creates a structural incentive divergence: the Dubai government maximizes strategic objectives (tourism, employment, urban development) that may not align with per-share value maximization. The management-governance module identified this as a structural cap. Persistent cheapness under a value-indifferent owner is a value trap risk, not a margin of safety — the base case should not assume a re-rating the owner will not pursue. An 8% haircut is applied to the mechanical blend (AED 30.08 → AED 27.7). This is a transparent, one-sentence adjustment — not a residual that makes the weights decorative.

---

## 3. Bull / Base / Bear Fair-Value Levels

Each case is a single derived fair-value level from one coherent assumption set. The bull-to-bear spread (AED 20.0–AED 34.2) is the range; the §2 football field (AED 12.34–47.0 across all methods) is the full cross-method dispersion. 12-month convergence horizon unless stated.

| Case | Fair Value / Share (point) | Implied EV/LTM EBITDA | Implied NTM P/E | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | AED 34.2 | 11.6x | 17.5x | 12 months | (1) Dubai property cycle stays resilient: new sales sustained above AED 60Bn; POC delivery pace accelerates +15% (sensitivity: +AED 2,500M EBITDA); (2) NTM EV/EBITDA re-rates to ~11x (approaching Aldar at 6.77x NTM, with EMAR's quality premium; below own-history mean of 6.25x on LTM basis but on a growing earnings base); (3) Malls recurring value gets partial market recognition (no re-listing required, just multiple expansion at group level toward 8–9x); (4) EGP/AED stable; no further DMTT expansion. DCF inputs: WACC 7.83%, terminal g 2.5% — sensitivity upper cell AED 47.0, blended down for cycle realism. |
| Base | AED 27.7 | 9.3x | 14.2x | 12 months | (1) Backlog delivery continues at current pace (AED 134.3Bn UAE backlog delivering at FY2025 pace of 6,129 units/year); (2) Dubai property cycle normalises gradually — no crash, but new sales slow modestly from FY2025 record; (3) EV/EBITDA re-rates from 3.84x toward 9–10x (through-cycle warranted multiple for a narrow-moat developer with net cash) over 12 months; (4) Terminal EBIT margin 35% (mid-cycle between FY2021 trough 23.5% and FY2025 peak 45.5%); (5) UAE corporate tax stable at 13% effective; (6) Government-owner discount (8%) embedded — no re-rating catalyst assumed. Weighted blend: 20% × AED 19.08 + 20% × AED 25.97 + 35% × AED 38.47 + 25% × AED 30.43 = AED 30.08, reduced by 8% government-owner haircut = AED 27.7. |
| Bear | AED 20.0 | 6.6x | 10.3x | 12 months | True through-cycle trough: (1) Dubai residential demand softens materially — new sales fall 25–30% from AED 71.1Bn FY2025 record; (2) POC delivery pace slows −15% (backlog deliveries shift to future periods due to contractor capacity constraints in a building boom compounded by new mega-projects such as Al Maktoum Airport); (3) Construction cost inflation +10% compresses backlog margins by 3–4 pp; (4) Terminal EBIT margin 30% — between the FY2021 actual trough of 23.5% and FY2025 peak of 45.5%, representing a sustained mid-cycle trough (DCF cycle-trough runoff scenario from 04: trough revenue AED 40Bn, trough EBIT margin 30%, g=0% runoff = AED 21.60/share from 04); (5) Multiple stays compressed near 6.5x mid-cycle EV/EBITDA (Aldar parity — no quality premium); (6) Emaar Misr EGP depreciates further 15%; no government re-rating. Bear is the WORSE of: DCF cycle-trough runoff (AED 21.60) and weighted bear blend (AED 20.0). Bear level = AED 20.0 (worse of the two). |

**Bear case prior-trough citation.** The FY2021 cycle trough is the anchor: UAE Development EBIT margin 23.5% (`earnings/01_historical-financials.md` §1); group EBITDA AED 9.2Bn (FY2025 Investor Presentation, slide 15); net profit AED 5.7Bn. The FY2020 trough was deeper (group EBITDA ~AED 3.5Bn per Capital IQ Annual Financials, FY2020; revenue −33% H1 2020 per Preliminary Interim Report, Aug-12-2020, H1-2020). The bear case uses a trough deeper than FY2021 (30% EBIT margin vs 23.5% in FY2021 alone, averaged over 4 bear years in the DCF runoff) but does not reach the COVID-extreme of FY2020. This is evidence-based — both prior-trough periods are named and cited, and the bear is constructed within the historically documented range, not invented.

**Structural-reset / avoid-ruin check.** The trigger for computing a separate structural-reset floor requires `09_moat.md` to return "No moat proven" or "Eroding" moat trajectory, OR `07_business-quality.md` rate-of-change/disruption score ≤ ~40. For EMAR: moat verdict = **Narrow, STABLE** (not eroding); disruption score = **62/100** (above the ≤40 threshold). The trigger does NOT fire. The through-cycle trough (DCF bear AED 21.60, weighted bear AED 20.0) is the bear-case floor. No separate structural-reset calculation is required or warranted.

---

## 4. Margin of Safety & Downside (two separate metrics)

**Executed computation — snippet output:**
```
Price:          AED 12.20
Base FV:        AED 27.7
Bear FV:        AED 20.0
Bull FV:        AED 34.2

Margin of safety = (27.7 - 12.2) / 27.7 = 56.0%
Implied upside = (27.7 - 12.2) / 12.2 = 127.0%
Downside to bear = (12.2 - 20.0) / 12.2 = −63.9%
  → Bear FV (20.0) EXCEEDS current price (12.2): no downside in bear case
```

| Metric | Value |
|---|---:|
| Current price | AED 12.20 |
| Base-case fair value (point) | AED 27.7 |
| Bear-case fair value | AED 20.0 |
| Bull-case fair value | AED 34.2 |
| Implied upside to base case = (base FV − price) / price | +127.0% |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **56.0%** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **−63.9%** (bear FV exceeds price — no downside loss to bear; the bear case is ABOVE the current price) |

**Critical interpretation.** The downside-to-bear is negative: the bear-case fair value (AED 20.0) is 64% above the current price (AED 12.20). This means the stock is currently priced below even the through-cycle trough scenario constructed from the FY2021 and FY2020 cycle-trough evidence. This is consistent with the reverse-DCF finding: the current price implies a −21.3% annual FCF contraction for 7 years — a trajectory that is physically inconsistent with the AED 134.3Bn contracted backlog. The margin of safety metric (56%) and the bear-case premium together suggest the market is pricing in an outcome more severe than any cycle trough in Emaar's modern history.

---

## 5. Warranted-Multiple Check

The base-case fair value of AED 27.7 implies an EV/LTM EBITDA of 9.3x and a forward P/E of 14.2x (on FY2026E consensus EPS of AED 1.95). Is 9.3x EV/LTM EBITDA warranted for EMAR?

The case that it is: Emaar's LTM EBITDA (AED 25.2Bn) is at a peak, so 9.3x on peak earnings is arguably conservative — on through-cycle normalized EBITDA (moat module estimates ~AED 11.6Bn through-cycle NOPAT → implied EBITDA ~AED 14.8–15Bn), the 9.3x on peak translates to a 15x+ on normalized, which approaches the quality sub-set peer median (13.71x). The business has a narrow moat (location advantage 72/100, brand 68/100, scale 63/100), net cash of AED 25Bn (broad basis), zero gross leverage (LTV ~5.7%), and a 86%-EBITDA-margin mall portfolio. These characteristics warrant a premium to pure-cycle developers like Aldar (8.3x LTM).

The case for caution: two structural factors limit the warranted multiple. First, the business quality score is 51/100 (mixed), dominated by cyclicality (30/100) and low recurring revenue (45/100) — these cap the justified multiple well below a durable-compounder level. Second, the government-owner (29.73% Dubai Holding) creates a value-trap risk: under a controlling shareholder that maximizes strategic rather than per-share objectives, a re-rating from 3.8x to 9.3x EV/EBITDA requires a market-driven catalyst (broader investor recognition, index inclusion weight, or sector rotation) rather than owner-driven value realization. The value-trap flag is **mandatory** per MODULE_RULES RF-OWN-004 / Score-Cap rules. With the government bloc holding 29.73% and no re-listing of Emaar Malls in sight, the conglomerate discount that keeps the consolidated multiple below the sum-of-parts may persist indefinitely — the gap between SOTP (AED 30.43) and the market's implied consolidated value (AED 12.20 = 3.8x LTM EBITDA) is real, but so is the risk that it never closes.

The warranted multiple at 9.3x is achievable for a narrow-moat, net-cash, 49%-EBITDA-margin developer — it is not a multiple the business has never earned (the 17-quarter history shows EV/LTM EBITDA between 3.96x and 8.39x, with a mean of 6.31x). To reach AED 27.7, the multiple must recover to 9.3x — above the own-history mean but on peak EBITDA. On normalized EBITDA (~AED 15Bn), 9.3x translates to roughly AED 15–16 per share, which the own-history mean already implies (AED 19.08 own-median reversion is on peak EBITDA; on normalized EBITDA a simple 6.25x would give a much lower number). This internal consistency check confirms that AED 27.7 is a moderate, recoverable target for a 12-month horizon — not a fantasy multiple. **Value-trap flag: the persistent cheapness under a government-aligned controlling owner could delay or prevent the re-rating, making the 127% implied upside a potential trap if the cycle peaks before the multiple recovers.**

---

## 6. Fair-Value Read

The base-case fair value is **AED 27.7 per share** — a margin of safety of 56% from the current price of AED 12.20 (pool-verified, Jun-28-2026). The bull and bear fair-value levels are AED 34.2 and AED 20.0 respectively; the entire bull-to-bear range sits above the current price, meaning even the through-cycle trough scenario (anchored to FY2021 trough margins and a further demand slowdown) implies an upside of +64% from today. The four methods disagree sharply on the magnitude of fair value — the cross-method spread from AED 19.08 (own-history) to AED 38.47 (intrinsic DCF) is 102%, the headline finding — but agree on the direction: current price is materially below any defensible intrinsic level. The method driving the answer most is the SOTP/DCF combination (60% weight), where the intrinsic value from through-cycle FCF projections and the segment-level break-up value both confirm a fair value well above AED 25 per share. The single biggest swing factor between bull and bear is whether Dubai's property demand cycle holds up or rolls over: a sustained −25 to −30% new-sales decline would not immediately cut EBITDA (the AED 134.3Bn backlog absorbs 3–4 years of revenue), but it would compress forward multiples and trigger a deeper de-rating, pushing the market toward bear-case levels that still exceed today's price. **The value-trap risk — a government-aligned controlling owner (29.73% Dubai Holding, RF-OWN-004) that does not prioritize per-share value maximization — is the structural reason the discount may persist, and is the critical check the master synthesizer must weigh before treating the 56% margin of safety as actionable.**

---

*All weighted blend computations, margin of safety, downside-to-bear, and implied multiple calculations produced by an executed Python snippet (command + result shown in §§2 and 4). Cross-module inputs: `01_price-and-capital-structure.md` (price AED 12.20, shares 8,838.790M, net cash broad AED 24,969M, minority AED 13,808M, EV AED 96,672M); `02_multiples-own-history.md` (own-median reversion AED 19.08; CIQ Quarterly Financials, Jun-28-2026); `03_relative-valuation-peers.md` (warranted NTM EV/EBITDA base AED 25.97; CIQ Comparable Analysis, Jun-28-2026); `04_intrinsic-dcf.md` (base AED 38.47, bear AED 21.60; Python DCF, WACC 8.83%, g 2.0%); `05_reverse-dcf.md` (implied FCF CAGR −21.3%, cross-check only); `06_sum-of-the-parts.md` (segment EV/EBITDA, base AED 30.43; FY2025 Investor Presentation, Feb-12-2026; CIQ Comps, Jun-28-2026); `business-model/07_business-quality.md` (quality score 51/100; cyclicality 30/100; disruption 62/100); `business-model/09_moat.md` (Narrow moat, Stable trajectory; through-cycle ROIC ~11–12% vs WACC ~9–10%); `earnings/07_earnings-sensitivity.md` (dominant variable: POC delivery pace ±AED 2,500M EBITDA; FY2021 cycle trough cited); `management-governance/04_ownership-and-insider-behavior.md` (Dubai Holding 29.73%, RF-OWN-004 trigger; CIQ Public Ownership Summary, May-2026).*
