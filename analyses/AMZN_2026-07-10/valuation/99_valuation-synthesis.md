# Valuation Module — AMZN (Synthesis)

## Abstract

Amazon (AMZN) is modestly overvalued at $238.34, trading 13.5% above the base-case fair value of $210 per share. The bull / base / bear fair-value levels are $247 / $210 / $146, driven primarily by the sum-of-the-parts analysis (40% weight), which anchors on audited FY2025 segment EBIT and finds the current price sits 40% above the trailing breakup value of the business. The reverse-DCF shows the market is pricing in 16.4% annual profit growth for a full decade — plausible for three to five years given AWS growing at 28%, but aggressive as a ten-year requirement. The margin of safety is negative at −13.5%, while the downside to the bear case is 38.7% — a loss from $238 to $146 — driven by a simultaneous AWS deceleration, D&A step-up, and multiple compression. At today's price, no cushion exists against a base-case miss; the stock is a bet on excellent, not merely good, execution.

---

## 1. Valuation Verdict

- **Verdict:** Modestly overvalued
- **Base-case fair value (point, per share):** $210
- **Current price:** $238.34 (July 1, 2026 last close, pool-verified; Capital IQ Key Stats, three-way cross-confirmed)
- **Bull / Base / Bear fair-value levels (points):** $247 / $210 / $146
- **Cross-method dispersion (football field, low–high):**
  - Gordon DCF (04, floor): $104/share
  - SOTP bear (06): $129/share
  - SOTP base (06): $170/share
  - DCF exit 10x (04): $207/share
  - SOTP bull (06): $221/share
  - Peers (03, NTM EV/EBITDA 13x warranted): $258/share
  - Peers / NTM EV/Sales (03, high end): $284/share
  - *Full football field (value-producing methods):* $104 – $284/share
  - *Excluding Gordon DCF floor (primary working range):* $129 – $284/share
- **Valuation attractiveness /100** *(higher = cheaper)*: **38**
- **Margin of safety /100** *(higher = better)*: **0** (negative; price exceeds base fair value; no cushion exists)
- **Valuation confidence /100:** **55** (capped at 60 due to terminal value > 75% of DCF EV; further capped at 55 due to cross-method spread > 40% unreconciled on the full range including the Gordon floor)
- **Downside risk /100** *(higher = worse — inverted score)*: **72** (38.7% downside to the bear case of $146)
- **Data quality /100:** **88** (all five methods ran; pool-verified price; 53–57 broker consensus; full segment data through FY2025; three audited annual reports; 10-Q through Q1 2026; fresh peer comp set as of July 1, 2026; zero extraction failures)
- **Overall usefulness /100:** **78**
- **Dominant valuation method (one line):** SOTP at $170 (40% weight) — the most transparent and reproducible method, anchored on audited FY2025 segment EBIT; AWS alone accounts for 66% of the gross enterprise value in the base case, making the SOTP the clearest lens for a multi-segment conglomerate where cloud and retail warrant structurally different multiples.
- **What's priced in (one line):** At $238.34, the market prices 16.4% annual NOPAT growth for ten years — implying $3.27T in revenue and $304B in NOPAT by FY2035, versus the base-case DCF forecast of $2.01T revenue and $207B NOPAT; aggressive as a decade-long requirement, plausible for three to five years given AWS at 28% growth. [05_reverse-dcf.md §2, §5]
- **Biggest valuation risk (one line):** The D&A step-up from the $170B+ annualized AI capex wave — the single highest-impact EBIT variable — runs 6–24 months ahead of customer billings; if the billing lag extends to the long end, EBIT is simultaneously compressed and the multiple contracts, producing a 38.7% downside to $146. [07_earnings-sensitivity.md §3 via 07_scenario-and-fair-value.md §3]

---

## 1A. Module Disconfirmation *(CLAUDE.md §8)*

- **Strongest bear point:** The SOTP on audited FY2025 EBIT ($170 base, $129 bear) finds the current price is 40%–85% above trailing breakup value, meaning almost the entire current market cap rests on future earnings the business has not yet delivered. If AWS growth decelerates from 28% to 20% while the D&A step-up runs at the worst-case 24-month billing lag, consolidated EBIT in FY2026–FY2027 could fall well below consensus ($103.8B FY2026 consensus EBIT), and the multiple would compress simultaneously. [06_sum-of-the-parts.md §4; 07_scenario-and-fair-value.md §3]

- **Strongest bull point:** On a pure forward-multiple basis, the peer-warranted NTM EV/EBITDA of 13.0x (a 14% premium to the heterogeneous peer median for a business with AWS at $364B backlog growing at 28%) implies $258/share — 8% above today. The current price of 11.9x NTM EV/EBITDA is actually *below* the warranted multiple for a company with AWS quality and growth. If D&A absorption follows the short-lag scenario (6–12 months), FCF recovers faster than consensus and the multiple holds or expands to the bull 14x. [03_relative-valuation-peers.md §5–6; 07_scenario-and-fair-value.md §3]

- **Single killer risk:** Terminal-value dominance (79.9% of DCF EV from the Gordon terminal) means the intrinsic value rests almost entirely on assumptions about Amazon's competitive position and growth rate in 2035 — a decade out. Any material change to the terminal multiple (from 10x to 8x EV/EBITDA at FY2035) shaves $38/share from the DCF anchor; if the moat erodes (09_moat.md currently finds a narrow moat with ROIC of 9.0% below WACC of 10.4–11.2%), the entire valuation framework shifts down. [04_intrinsic-dcf.md §5; 09_moat.md §5]

- **Disconfirming evidence already visible:** Through-cycle ROIC (9.0%) is below WACC (10.4–11.2%), meaning Amazon has not yet proven it earns above its cost of capital on a through-cycle basis — a business at or below its cost of capital does not warrant an open-ended premium. The strict FCF turned negative in LTM (CFO $148.5B minus capex $151.0B = −$2.5B), confirming the investment cycle is consuming all free cash flow and then some. [09_moat.md §3; 01_price-and-capital-structure.md §3]

---

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | Sufficient — all five methods can run; no partial-data caps apply | Pool-verified price $238.34; full consensus from 53–57 brokers through FY2028E; zero extraction failures across 44 sources |
| price-and-capital-structure | Price-state: pool-verified ($238.34, July 1, 2026); EV $2,656,300M | Amazon holds $12.5B net cash on the strict basis (financial debt only) but $92.5B net debt on the broad basis (including $104.9B lease liabilities); new Q1 2026 bond issuances of ~$53.8B pre-fund AI capex |
| multiples-own-history | AMZN sits at the 13th–26th percentile of its own 18-month multiple band on forward metrics (EV/NTM EBITDA 11.93x vs 18-month median 12.96x; −8%) | Own-history window of only 18 months is too short for reliable reversion — Amazon's structural earnings inflection (EBIT margin from 2.6% FY2022 to 13.1% Q1 2026) means pre-2024 multiples are not a valid comparator; flagged as "illustrative only, not a fair-value input" |
| relative-valuation-peers | Base-case peer fair value: $258/share (NTM EV/EBITDA at warranted 13.0x); current price is 8.1% below warranted — slight discount on the peer method alone | AMZN trades at just 4.6% NTM EV/EBITDA premium to a peer median pulled down by low-margin physical retailers; the peer discount vs. megacap-tech-quality peers is misleading — the warranted premium is ~13x vs current 11.93x |
| intrinsic-dcf | Gordon base: $104/share (128% premium of price to Gordon intrinsic); exit-multiple anchor: $207/share (10x FY2035 EBITDA at WACC 10.4%) | Gordon DCF is terminal-dominated (TV = 79.9%) and produces a structurally depressed number due to three years of deeply negative FCF (FY2026–FY2028) compounded at 10.4%; exit-multiple is the more informative lens: current price implies 10–12x FY2035 EBITDA, requiring execution across a full decade |
| reverse-dcf | Market prices in 16.4% NOPAT CAGR for 10 years (FY2026–FY2035), implying NOPAT of $304B and revenue of $3.27T by FY2035 | Aggressive for the full decade; plausible for 3–5 years given AWS at 28% growth; D&A step-up timing is the dominant swing input — a 41.75% implied growth rate would result from using the company-disclosed FCF ($11.2B) instead of normalized NOPAT ($66.6B), confirming the FCF base is the most sensitive input |
| sum-of-the-parts | SOTP base: $170/share (FY2025 audited EBIT: 28x/20x/15x); LTM base ~$182; bull $221; bear $129; current price is 40% above the FY2025 base SOTP | AWS generates 66% of gross EV at the base case ($1.277T of $1.941T) on 57% of EBIT but only 18% of revenue; the current $238 price is almost entirely a bet on AWS multiple expansion or AWS EBIT growth beyond what FY2025 reflects; North America and International together contribute only $664B to gross EV |
| scenario-and-fair-value | Bull/Base/Bear: $247/$210/$146; margin of safety −13.5%; downside to bear 38.7% | Blended base fair value $210 (35% peers × $258 + 25% DCF exit × $207 + 40% SOTP × $170); method dispersion 148% (Gordon to peers), narrowing to 52% once Gordon is replaced by exit multiple; D&A step-up timing is the dominant swing factor between scenarios |

---

## 3. Reconciliation

**Methods disagree materially — the full method dispersion of 148% (Gordon DCF $104 to peers $258) exceeds the 40% flag threshold.**

The three primary working methods (peers at $258, DCF exit at $207, SOTP at $170) still span 52% from SOTP to peers, which also exceeds the 40% flag. This disagreement is genuine but structurally explained:

**SOTP ($170, base) vs. Peers ($258):** The $88/share gap reflects a timing difference, not a disagreement about Amazon's value as a business. SOTP anchors on audited FY2025 trailing EBIT ($79.975B) and applies segment multiples — producing the trailing breakup value. Peers anchor on FY2026 consensus NTM EBITDA ($222.6B, +43% above FY2025 GAAP EBITDA) and assign a quality-adjusted multiple to that forward earnings power. The 43% EBITDA growth priced into consensus is the bridge between $170 and $258 — the SOTP will approach the peer implied value if and when FY2026 EBITDA is delivered. SOTP is trusted most as the conservative floor; peers as the forward upper bound.

**DCF exit ($207) bridges the gap** — by using the exit-multiple framework applied to the 10-year terminal EBITDA ($563B), it incorporates both the current capex cycle drag and the eventual franchise value. The Gordon DCF ($104) is treated as a methodological floor, not a fair value, because the deep negative FCFs in FY2026–FY2028 are an artifact of the timing mismatch between capex recognition and revenue billing, not a permanent impairment. The Gordon method is retained in the football field for transparency but excluded from the weighted blend at `07`'s direction.

**Reconciled view:** Trust the SOTP most for the floor (audited, segment-level data, transparent multiples), peers for the forward ceiling, and DCF exit as the franchise value bridge. Base fair value $210 is the honest weighted blend of these three methods. The divergence above $210 and below $258 is real and should not be averaged away — it represents the uncertainty in whether FY2026 earnings delivery materializes as consensus projects.

---

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | **N** | MoS, downside-to-bear, observed up/down, attractiveness + confidence | Not triggered; price-state is `pool-verified` ($238.34, July 1, 2026 Capital IQ, three-way cross-confirmed) |
| No consensus / forward estimates | **N** | Valuation confidence | Not triggered; 53–57 broker consensus through FY2028E present in pool |
| No peer data | **N** | Overall usefulness | Not triggered; 10-peer comp set as of July 1, 2026 in pool |
| Only one valuation method usable | **N** | Valuation confidence | Not triggered; all five methods ran |
| No cash flow AND DCF is only method | **N** | Valuation confidence | Not triggered; full cash flow statement through LTM Mar-31-2026 present |
| SOTP not possible for multi-segment | **N** | Overall usefulness | Not triggered; SOTP ran on three segments (AWS 57% of EBIT — below the 85% collapse threshold) |
| Methods disagree >40% unreconciled | **Y** | Valuation confidence | Cap at 55; the dispersion spans 148% (Gordon to peers) and 52% (SOTP to peers) — both exceed 40%; the reconciliation in §3 explains the structural driver but does not fully resolve it into a single agreed number; cap applied |
| Terminal value >75% of DCF EV | **Y** | Valuation confidence | Cap at 60; Gordon DCF TV = 79.9% of EV (04_intrinsic-dcf.md §5); this cap is dominated by the methods-disagree cap of 55 |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | **N** | Valuation attractiveness | Not triggered; Amazon is widely held with no government controller, no parent-subsidiary conflict, and no unrelated conglomerate structure; founder alignment via Jeff Bezos ~9.5% stake (inference, not pool-verified) |

**Multiple caps on the same score:** Methods-disagree cap (55) is more restrictive than the terminal-dominance cap (60) — final confidence cap is **55**.

---

## 5. Fair-Value Summary

The bull / base / bear fair-value levels are $247 / $210 / $146, with the SOTP at $170 (40% weight) driving the base case below the current price. AWS generates 66% of the gross enterprise value in the base SOTP despite contributing only 18% of revenue — the stock is effectively a leveraged bet on the AWS cloud franchise. The peer-forward method at $258 (35% weight) anchors on FY2026 consensus NTM EBITDA ($222.6B) and shows that the current 11.9x NTM EV/EBITDA is modestly below the warranted 13.0x — meaning on a purely forward-multiple basis the stock is not overpriced. The tension is between the trailing-EBIT breakup value ($170) and the forward-earnings power ($258); the $210 base is the honest compromise weighted toward the trailing anchor.

At $238.34, the current price implies 10.7x NTM EV/EBITDA on the blended basis — below the warranted 13x on the peer method but above what the trailing SOTP supports. The reverse-DCF shows the market is pricing 16.4% NOPAT CAGR for a decade, requiring $3.27T in revenue by FY2035; that is aggressive for a 10-year window but plausible for 3–5 years given AWS growing at 28% and a $364B backlog.

The margin of safety is negative at −13.5%: the stock trades 13.5% above the $210 base case, meaning there is no cushion if the base case is right. The downside to the bear case is 38.7%: a fall from $238 to $146 requires simultaneous AWS deceleration (28% → 20%), D&A step-up at the worst-case billing lag, advertising softening to 12% growth, and a multiple compression to 10.5x NTM EV/EBITDA. These three risks are correlated — they all move together in an adverse macro or execution scenario — making the bear case more likely than its individual probabilities suggest.

This is not value-trap risk in the classical sense: Amazon has no misaligned owner, no government controller, no holdco structure, and no structural impediment to earnings realization. The risk is execution risk — specifically, whether the AI capex wave ($170B+ annualized) monetizes within 6–12 months (the bull) or 18–24 months (the bear). At the current price, the market has priced in near-perfect execution with no room for the base case, let alone the bear.

---

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Modestly overvalued | Stock falls to $185–$200 without a change in fundamentals (bringing it to parity with or below the $210 base); OR FY2026 EBITDA comes in materially above the $211B consensus, closing the gap between the trailing SOTP and the forward multiple | Stock continues rising while fundamentals deteriorate — widening the gap above $247 without incremental evidence of AWS acceleration or margin expansion delivering ahead of schedule | Q2 2026 results (segment EBIT update — especially AWS growth trajectory and D&A rate); management Q2 guidance on capex cadence and billing-lag commentary |
| — | AWS decelerates below 25% growth (the 28% Q1 2026 trajectory reverses); D&A as a percent of AWS revenue rises faster than consensus (the billing-lag worst case materializes) | AWS accelerates beyond 30% growth; D&A as a share of revenue stabilizes or falls (billing lag shorter than 12 months); advertising re-rates toward software-like multiples on standalone potential | FY2026 Q2–Q3 AWS revenue growth and T&I cost-per-unit trajectory; any announcement about AWS pricing or capacity commitments |
| — | A material earnings miss vs. consensus (FY2026 EBIT below $95B) combined with a macro-driven multiple compression (broad market de-rate from AI capex concerns) | A strategic announcement — AWS spin-out or tracking stock; healthcare / physical retail restructuring that makes segments visible and separately valued — that unlocks the SOTP discount to the sum of parts | AWS standalone profitability disclosures at segment level (currently disclosed only within the three reportable segments); any capex guidance revision |

---

## 7. Note To The Final Synthesizer

- **Fair-value levels:** Bull $247 / Base $210 / Bear $146 per share. The base case rests on a 35/25/40 blend of peers (NTM EV/EBITDA, warranted 13x, $258), DCF exit-multiple (10x FY2035 EBITDA, $207), and SOTP (FY2025 audited EBIT at 28x/20x/15x, $170). No single method is clean; the SOTP at $170 is the most grounded anchor on today's earnings, and the peers at $258 reflect where the stock should trade if FY2026 consensus is delivered.

- **What's priced in:** The market is pricing 16.4% NOPAT CAGR for ten years, implying $3.27T in revenue by FY2035 — plausible for 3–5 years (AWS at 28% growth, $364B backlog), aggressive for a full decade. The current 11.9x NTM EV/EBITDA is modestly below the peer-warranted 13.0x — meaning if the base case is delivered, the stock is actually cheap on a forward multiple basis. The risk is not that the multiple is wrong, but that the earnings trajectory doesn't arrive.

- **Margin of safety vs. downside-to-bear:** Margin of safety = −13.5% (the stock is 13.5% above the $210 base fair value; no cushion). Downside to the bear = 38.7% (a fall from $238 to $146 if AWS decelerates, D&A step-up hits at the worst-case lag, and the multiple compresses). These are two separate reads: one tells you there is no cushion at today's price; the other tells you how much you can lose in the bad scenario. Both need to reach the master synthesizer separately.

- **Execution risk, not value-trap risk:** Amazon is not a value trap on ownership grounds. No government controller, no parent-subsidiary conflict, no unrelated conglomerate structure. RF-OWN-004 does not apply. The risk is that the current price prices in successful execution of the largest single capital-expenditure program in Amazon's history ($170B+ annualized for AI infrastructure). The warranted multiple exists if AWS grows as projected; the bear-case multiple (10.5x) is below the peer median precisely because execution misses carry a double-hit: lower earnings AND lower multiple simultaneously.

- **Which method to trust:** SOTP first (audited FY2025 segment EBIT, transparent multiples, grounded in reported numbers). Peer NTM EV/EBITDA second (forward earnings power, but peer set is heterogeneous — warranted-multiple adjustment of +1.59x above raw median is required). DCF exit multiple third (franchise value, but heavily dependent on 10-year revenue path). Gordon DCF last — treat as a floor ($104), not a fair value; the negative FCF in FY2026–FY2028 compounding at 10.4% mechanically destroys PV in a way that doesn't reflect the business's franchise value.

- **No partial-data cap applied** — all five methods ran, price is pool-verified, consensus is full (53–57 brokers). The confidence cap at 55 is driven by the >40% method dispersion and the terminal-value dominance of the DCF — both structural features of this company at this point in the investment cycle, not data gaps.

- **Highest-value next data request:** Q2 2026 earnings results (expected July/August 2026) — specifically (a) AWS revenue growth trajectory (will it sustain above 28% or begin decelerating?), (b) technology and infrastructure cost as a percent of revenue (the D&A step-up magnitude and billing-lag timing), and (c) management's FY2026 capex guidance update. These three data points would allow the scenario-and-fair-value model to narrow the $101/share bull-to-bear spread meaningfully.

- **Explicit handoff:** The master synthesizer's "Valuation and Peer Mispricing" section should defer to this synthesis for all fair-value inputs. The bull / base / bear fair-value levels ($247 / $210 / $146), the margin of safety (−13.5%), and the downside-to-bear (38.7%) are the inputs for the master's probability-weighted scenario model. The master synthesizer assigns the scenario probabilities and computes the probability-weighted return — that work does not belong here. This module's conclusion: the stock is modestly overvalued at $238.34, with no cushion against the base case and significant downside (38.7%) to the bear.

---

## 8. Simple Summary

- Amazon trades at $238.34, which is 13.5% above the base-case fair value of $210; the verdict is **modestly overvalued**
- Bull / Base / Bear fair-value levels: **$247 / $210 / $146**; bull-to-bear spread of $101/share
- The market is pricing 16.4% NOPAT growth per year for ten years — plausible for 3–5 years given AWS at 28% growth, aggressive as a full-decade requirement
- Downside to the bear is 38.7% (a fall from $238 to $146); upside to the bull is only +3.6% ($247); the asymmetry is notable — but the master synthesizer owns the probability weighting
- The method that matters most: **SOTP** ($170/share, 40% weight), anchored on audited FY2025 segment EBIT; AWS alone generates 66% of the gross enterprise value at base-case multiples, making this fundamentally an AWS valuation story
- No value-trap risk from ownership: no government controller, no misaligned parent, RF-OWN-004 not triggered; the risk is execution risk on the AI capex buildout
- Current price ($238.34) is pool-verified (July 1, 2026 last close, Capital IQ, three-way cross-confirmed); all price-relative scores are unlocked
- This module is useful to the master synthesizer (Overall usefulness 78/100); the key limit is the >40% method dispersion that caps confidence at 55, which is a feature of the AI investment cycle rather than a data gap
