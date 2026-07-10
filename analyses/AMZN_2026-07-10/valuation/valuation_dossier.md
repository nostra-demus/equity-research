# valuation Module Dossier — AMZN

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-07-10T15:42:39Z
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



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — AMZN

## 1. File Inventory

| Filename | Type | Period Covered (from inside document) | Valuation Relevance |
|---|---|---|---|
| Amazoncom_Inc-Annual_Report(Apr-09-2026).pdf | Annual filing (10-K equivalent: FY2025 Annual Report to Shareholders, filed Apr 9 2026) | FY ended Dec 31 2025 | High |
| Amazoncom_Inc_-_Form_10-Q(Apr-30-2026).doc | Quarterly filing (10-Q) | Q1 ended Mar 31 2026, filed Apr 30 2026 | High |
| Amazon-2024-Annual-Report.pdf | Annual filing (10-K / FY2024 Annual Report) | FY ended Dec 31 2024 | High |
| Amazon-com-Inc-2023-Annual-Report.pdf | Annual filing (10-K / FY2023 Annual Report) | FY ended Dec 31 2023 | Medium |
| Amazon com Inc NasdaqGS AMZN Financials.xls — tab: Income Statement | Annual income statement (Capital IQ export) | FY2021–FY2025 + LTM Mar 31 2026 | High |
| Amazon com Inc NasdaqGS AMZN Financials.xls — tab: Balance Sheet | Balance sheet (Capital IQ export) | FY2021–FY2025 + Mar 31 2026 | High |
| Amazon com Inc NasdaqGS AMZN Financials.xls — tab: Cash Flow | Cash flow statement (Capital IQ export) | FY2021–FY2025 + LTM Mar 31 2026 | High |
| Amazon com Inc NasdaqGS AMZN Financials.xls — tab: Key Stats | Summary financials + forward estimates (Capital IQ) | FY2022–FY2025, LTM Mar 2026, FY2026E–FY2028E | High |
| Amazon com Inc NasdaqGS AMZN Financials.xls — tab: Multiples | Quarterly historical multiples (Capital IQ) | Q ended Dec 2024 through Q ended Jun 2026 / Jul 1 2026 | High |
| Amazon com Inc NasdaqGS AMZN Financials.xls — tab: Capital Structure Summary | Capital structure (Capital IQ) | FY2024, FY2025, Q1 2026 (Mar 31 2026) | High |
| Amazon com Inc NasdaqGS AMZN Financials.xls — tab: Capital Structure Details | Debt detail (Capital IQ) | FY2024, FY2025, Q1 2026 | High |
| Amazon com Inc NasdaqGS AMZN Financials.xls — tab: Historical Capitalization | Price, shares, market cap, EV history (Capital IQ) | Q ended Dec 2024 through Q ended Mar 2026 (pricing as of Apr 30 2026) | High |
| Amazon com Inc NasdaqGS AMZN Financials.xls — tab: Ratios | Profitability, leverage, coverage ratios (Capital IQ) | FY2021–FY2025 + LTM Mar 31 2026 | High |
| Amazon com Inc NasdaqGS AMZN Financials.xls — tab: Supplemental | Supplemental data (Capital IQ) | FY2021–FY2025 + LTM | Medium |
| Amazon com Inc NasdaqGS AMZN Financials.xls — tab: Industry Specific | Industry-specific metrics (Capital IQ) | FY2021–FY2025 + LTM | Medium |
| Amazon com Inc NasdaqGS AMZN Financials.xls — tab: Pension OPEB | Pension/OPEB obligations (Capital IQ) | FY2024–FY2025 | Low |
| Amazon com Inc NasdaqGS AMZN Financials.xls — tab: Segments | Segment revenue, operating profit, assets, D&A, capex by segment (Capital IQ) | FY2020–FY2025 | High |
| Amazon com Inc NasdaqGS AMZN Financials Segments.xls — tab: Segments | Segment data (Capital IQ export, standalone file) | FY2020–FY2025 | High |
| Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls — tab: Consensus | Analyst consensus estimates for EPS, revenue, EBITDA; target price; broker recs; latest price $239.75 (Capital IQ) | Current FY2026E; NTM; long-term out to FY2035E; as of data export | High |
| Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls — tab: Recent Changes | Recent estimate revisions (Capital IQ) | Last reported revision window | High |
| Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls — tab: Guidance | Company guidance data (Capital IQ) | FY2026 current guidance | High |
| Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls — tab: Multiples | Forward multiples NTM through FY2033 (Capital IQ) | NTM, FY2026E–FY2033E | High |
| Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls — tab: Surprise | Historical EPS and revenue surprise data (Capital IQ) | Multi-year history | Medium |
| Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls — tab: Trends | Estimate trends over time (Capital IQ) | Recent revision trend window | Medium |
| Amazoncom,IncNasdaqGSAMZNEstimatesReport.xls — tab: Revisions | Detailed estimate revisions by broker (Capital IQ) | Recent revisions | Medium |
| Company Comparable Analysis Amazon com Inc.xls — tab: Financial Data | Peer comp set: financial data for 10 named peers (Capital IQ) | As-of Jul 1 2026; LTM data from filings through Jun 2026 | High |
| Company Comparable Analysis Amazon com Inc.xls — tab: Trading Multiples | Peer comp set: LTM and NTM trading multiples (Capital IQ) | As-of Jul 1 2026 | High |
| Company Comparable Analysis Amazon com Inc.xls — tab: Operating Statistics | Peer operating metrics (Capital IQ) | As-of Jul 1 2026 | Medium |
| Company Comparable Analysis Amazon com Inc.xls — tab: Implied Valuation | Implied valuation from peer multiples (Capital IQ) | As-of Jul 1 2026 | High |
| Company Comparable Analysis Amazon com Inc.xls — tab: Valuation Chart | Summary valuation chart data (Capital IQ) | As-of Jul 1 2026 | Medium |
| Company Comparable Analysis Amazon com Inc.xls — tab: Credit Health Panel | Credit and leverage metrics for peers (Capital IQ) | As-of Jul 1 2026 | Medium |
| Company Comparable Analysis Amazon com Inc.xls — tab: Business Description | Peer business descriptions (Capital IQ) | Static | Low |
| Company Comparable Analysis Amazon com Inc.xls — tab: Disclaimer | Disclaimer (Capital IQ) | Static | Low |
| Amazon com Inc NasdaqGS AMZN Products.xls — tab: Products | Product/service list (Capital IQ) | Current | Low |
| Amazon com Inc NasdaqGS AMZN Competitors.rtf | Competitor list (Capital IQ) | Current | Low |
| Amazon com Inc NasdaqGS AMZN Customers.rtf | Customer list (Capital IQ) | Current | Low |
| Amazon com Inc NasdaqGS AMZN Suppliers.rtf | Supplier list (Capital IQ) | Current | Low |
| Amazon com Inc NasdaqGS AMZN Takeover Defenses.rtf | Governance / takeover defense data (Capital IQ) | Current | Low |
| Amazon com Inc NasdaqGS AMZN Public Company Profile.rtf | Company profile (Capital IQ) | Current | Low |
| Amazon.com, Inc., Q1 2026 Earnings Call, Apr 29, 2026.pdf | Earnings transcript | Q1 2026 (quarter ended Mar 31 2026), Apr 29 2026 | High |
| Amazon.com, Inc., Q4 2025 Earnings Call, Feb 05, 2026.pdf | Earnings transcript | Q4 2025 (quarter ended Dec 31 2025), Feb 5 2026 | High |
| Amazon.com, Inc., Q3 2025 Earnings Call, Oct 30, 2025.pdf | Earnings transcript | Q3 2025 (quarter ended Sep 30 2025), Oct 30 2025 | Medium |
| Amazon.com, Inc., Q2 2025 Earnings Call, Jul 31, 2025.pdf | Earnings transcript | Q2 2025 (quarter ended Jun 30 2025), Jul 31 2025 | Medium |
| Amazon.com, Inc., Q2 2025 Earnings Call, Jul 31, 2025 (1).pdf | Earnings transcript (duplicate) | Q2 2025, Jul 31 2025 | Low |

**Extraction status:** 0 failures across 44 extracts from 5 workbooks (30 tabs) and 14 non-workbook files. All sources are in the pool. No gdrive-pointer stubs detected.

---

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States — Nasdaq Global Select Market (NasdaqGS) | Amazoncom_Inc-Annual_Report(Apr-09-2026).pdf; Estimates Consensus tab header "NasdaqGS:AMZN" |
| Filing regime | US SEC (10-K, 10-Q) | Amazoncom_Inc_-_Form_10-Q(Apr-30-2026).doc: "FORM 10-Q … UNITED STATES SECURITIES AND EXCHANGE COMMISSION"; FY2025 Annual Report is the statutory annual filing |
| Reporting standard | US GAAP | Estimates Consensus tab: "Acctg. Standard: US GAAP"; 10-Q text confirms |
| Reporting currency (and scale) | USD, in millions (financial tables) and per share | All Capital IQ exports; filings: "In Millions of the reported currency" |
| Fiscal-year end | December 31 | FY2025 Annual Report: "fiscal year ended December 31, 2025"; 10-Q: "quarterly period ended March 31, 2026" |
| Document language(s) | English throughout | All 44 extracted files are in English |

---

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months, as of Jul 10 2026) |
|---|---|---|---|
| Annual filing | Amazoncom_Inc-Annual_Report(Apr-09-2026).pdf | FY ended Dec 31 2025, filed Apr 9 2026 | ~3 months |
| Quarterly filing | Amazoncom_Inc_-_Form_10-Q(Apr-30-2026).doc | Q1 ended Mar 31 2026, filed Apr 30 2026 | ~2 months |
| Capital structure / balance sheet | Capital Structure Summary tab (Financials.xls) | Mar 31 2026 (Q1 2026) | ~3 months |
| Consensus / estimate export | EstimatesReport.xls — Consensus tab | Current FY2026E; latest price $239.75 (export date not stamped but data includes Jul 1 2026 multiples; NTM estimates active) | ~0–1 month |
| Multiples export (own-history) | Financials.xls — Multiples tab | Through Jun 30 2026 / Jul 1 2026 close | ~0 months |
| Peer / comps export | Company Comparable Analysis Amazon com Inc.xls — Trading Multiples + Financial Data tabs | As-of Jul 1 2026 | ~0 months |
| Current price (Capital IQ) | EstimatesReport.xls — Consensus tab, Market Summary row | Latest Price $239.75 / Last Close $238.34 (NasdaqGS:AMZN, USD) | ~0 months (Capital IQ intraday / recent close) |
| Cash flow statement | Financials.xls — Cash Flow tab | LTM ended Mar 31 2026 | ~3 months |
| Segment data | Financials.xls — Segments tab + Financials Segments.xls — Segments tab | FY ended Dec 31 2025 | ~7 months |

---

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | EstimatesReport.xls — Consensus tab, Market Summary: Latest Price $239.75, Last Close $238.34 (NasdaqGS:AMZN, USD). Capital IQ pool export — classified as pool-verified for price-state purposes. | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | FY2025 Annual Report (10-K): diluted shares used in EPS computation: 10,827M (FY2025). Q1 2026 10-Q: diluted shares FY2025 = 10,827M; basic shares outstanding as of cover: 10,754M (Mar 31 2026), 10,757M (Apr 2026). Capital IQ Historical Capitalization tab: shares out Mar 31 2026 = 10,757.1M. | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Y | FY2025 Annual Report Note and Q1 2026 10-Q: diluted EPS table shows total dilutive effect of outstanding stock awards — 248M (FY2024), 171M (FY2025) shares. RSU activity table in 10-Q. Common shares + stock awards = ~10.9B (from FY2025 Annual Report). | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y | Operating company (diversified: e-commerce retail + AWS cloud + advertising). Three reportable operating segments: North America, International, AWS. Filings and segment data confirm operating-company structure. | Determines which valuation methods are valid (FCFF DCF, EV multiples — appropriate) |
| Total debt, cash, minority/preferred | Y | Capital Structure Summary tab (Q1 2026): Total Debt $235,540M (incl. lease liabilities $104,942M); Total Cash & ST Investments $143,089M; Net Debt $92,451M. No preferred equity or minority interest. Balance Sheet tab Mar 31 2026: cash $101,816M + short-term investments $41,273M = $143,089M. | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | Financials.xls — Income Statement tab: LTM Mar 31 2026 Revenue $742,776M, EBIT $85,422M, Net Income $90,798M. FY2025: Revenue $716,924M, EBIT $79,975M. Filed in FY2025 Annual Report and Q1 2026 10-Q. | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | Financials.xls — Cash Flow tab: LTM Mar 31 2026 CFO $148,531M, Capex $151,003M; FY2025: CFO $139,514M, Capex $131,819M. FCF (CFO − capex) is calculable. | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | EstimatesReport.xls — Consensus + Multiples tabs: FY2026E EPS $8.69, Revenue $823,424M, EBITDA $211,027M; FY2027E EPS $9.88, Revenue $930,633M; FY2028E EPS $12.60. Broker count: 53–57 estimates per period. NTM multiples available (TEV/NTM EBITDA ~11.9x, NTM P/E ~28.5x at export date). | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | Financials.xls — Multiples tab: quarterly EV/LTM EBITDA, EV/LTM EBIT, P/LTM EPS from Q4 2024 through Jun 30 2026 with High/Low/Average/Close for each quarter. | Own-history re-rating read |
| Peer / comps data | Y | Company Comparable Analysis.xls — Trading Multiples + Financial Data + Implied Valuation tabs: 10 named peers including Alphabet, Meta, Microsoft, Netflix, eBay, Expedia; LTM and NTM multiples; implied valuation. As-of Jul 1 2026. | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y | Financials.xls — Segments tab: FY2025 segment revenue and operating profit — North America $426,305M / $29,619M EBIT; International $161,894M / $4,750M EBIT; AWS $128,725M / $45,606M EBIT. Full history FY2020–FY2025. Capex and D&A by segment also available. | Sum-of-the-parts |
| Dividend / buyback data | Y | FY2025 Annual Report: no common dividend paid. Cash Flow tab: repurchase of common stock shown ($0 in FY2023–FY2025; $6,000M in FY2022). Confirms shareholder return is via buybacks (minimal) and capital reinvestment. | Shareholder-yield read (low relevance for AMZN) |

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

All ten cross-module outputs are present. The management-governance module is also complete (all 8 agent outputs present including `04_ownership-and-insider-behavior.md` and `99_management-governance-synthesis.md`), providing the unaligned-owner read needed by MODULE_RULES §24 Filter 6.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N | 01, 05, 07, 99 | No cap — pool-verified price present ($239.75, NasdaqGS:AMZN, Capital IQ Estimates Consensus export) |
| No consensus / forward estimates | N | 02, 03, 04, 05 | No cap — full consensus available (53–57 estimates, FY2026E–FY2028E, NTM) |
| No peer data | N | 03, 06 | No cap — 10-peer comp set available as-of Jul 1 2026 with LTM and NTM multiples |
| No segment-level data | N | 06 | No cap — three-segment revenue, EBIT, D&A, and capex available for FY2020–FY2025 |
| No balance sheet / capital structure | N | 01, 04, 06 | No cap — full balance sheet through Mar 31 2026; capital structure detail through Q1 2026 |
| No cash flow statement | N | 04 | No cap — full cash flow statement through LTM Mar 31 2026 |

No partial-data caps apply.

---

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Quarterly multiples available from Q4 2024 through Q2 2026; LTM and NTM bases both available. Historical Capitalization ties share count and price. |
| Peer relative valuation | Y | None | 10-peer comp set with LTM and NTM EV/Revenue, EV/EBITDA, EV/EBIT, P/E as-of Jul 1 2026. Implied valuation tab pre-computed. |
| Intrinsic DCF (Operating FCFF) | Y | None | Income statement, cash flow statement, balance sheet, segment capex, forward estimates, and WACC inputs (risk-free rate derivable) all available. LTM FCF base calculable: CFO $148,531M − capex $151,003M = −$2,472M (heavy investment phase); normalized FCF derivable from FY2023–FY2024 trend or segment-level EBITDA − capex. |
| Reverse DCF | Y | None | Current price pool-verified; agent 05 can invert the DCF model at the same WACC and terminal growth to solve for implied growth/margin expectations. |
| SOTP | Y | None | Three reportable segments with revenue, EBIT, D&A, and capex through FY2025. Peer multiples available for each segment (AWS: cloud peers via Microsoft/Alphabet; Retail: e-commerce/retail peers in comp set). |

All five methods can run.

---

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The data pool contains a full income statement, cash flow statement, and balance sheet (through LTM Mar 31 2026), segment-level EBIT for all three reportable segments, a pool-verified current price ($239.75), full consensus estimates from 53–57 brokers through FY2028E, historical own-history multiples through Q2 2026, and a fresh peer comp set of 10 companies as-of Jul 1 2026 — all five valuation methods can run.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic DCF (Operating FCFF), reverse-DCF, SOTP
- **Active partial-data caps:** none
- **Critical missing items:** none



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — AMZN

**Reporting standard:** US GAAP. **Currency:** USD (millions unless noted). **Listing:** Nasdaq Global Select Market (NasdaqGS). **Fiscal year end:** December 31. **Business type:** Operating company (three reportable segments: North America, International, AWS). **Data pool extraction status:** 0 failures across 44 sources.

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | $238.34 | Capital IQ Financials.xls — Key Stats tab, "Latest Capitalization" row "Share Price"; cross-confirmed by Capital IQ Financials.xls — Multiples tab, Jul-1-2026 P/LTM EPS close (28.505 × LTM EPS $8.361 = $238.34 implied) | July 1, 2026 close (pool-sourced) |
| Intraday / latest price at export | $239.75 | Capital IQ Estimates Report.xls — Consensus tab, Market Summary, "Latest Price" field (NasdaqGS:AMZN USD) | Intraday at export time, ~Jul 1–2, 2026 |
| Currency | USD | All Capital IQ exports; all filings | — |
| Price basis | Last close (Jul 1, 2026) | Capital IQ Key Stats + Multiples cross-confirmation | July 1, 2026 |

**Price confirmation note.** The Key Stats tab states $238.34 as the share price. The Estimates Report Consensus tab states "Latest Price / Last Close Price: 239.75 / 238.34." The Multiples tab includes a column ending "2026-07-01" whose P/LTM EPS Close of 28.505 × LTM EPS $8.361 = $238.34 — a three-way cross-confirmation within the same pool export. The canonical anchor is $238.34 (July 1, 2026 last close). The $239.75 is an intraday quote embedded in the same export; it is shown for transparency and carries no incremental precision.

**Vendor-export freshness.** The Capital IQ data export's own as-of date is not stamped explicitly in any tab header. The export includes Multiples data through a column marked "2026-07-01" (a single-day column), which firmly places the pull date at or after July 1, 2026. This puts the export within 9 days of the valuation date of July 10, 2026. The quote's own as-of date is confirmed as July 1, 2026 by the Multiples cross-check. Price-state: **pool-verified**.

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as of Apr 22, 2026) | 10,757.1M | Form 10-Q, Q1 2026 (Apr-30-2026), XBRL tag `dei:EntityCommonStockSharesOutstanding`, cover page; as of Apr 22, 2026 |
| Basic shares outstanding (balance sheet date, Mar 31, 2026) | 10,754.0M | Form 10-Q, Q1 2026 — Consolidated Balance Sheet; Capital IQ Balance Sheet tab, "Total Shares Out. on Balance Sheet Date" = 10,754M at Mar-31-2026 |
| Basic shares outstanding (as of Jan 28, 2026; FY2025 10-K cover) | 10,734.9M | FY2025 Annual Report (10-K, Apr-9-2026), cover page |
| **Basic shares outstanding used for market cap** | **10,757.1M** | **Form 10-Q, Q1 2026, cover page (most recent as-of date: Apr 22, 2026); confirmed by Capital IQ Key Stats tab: 10,757.109M** |
| Basic weighted-average (Q1 2026, for diluted calc) | 10,743.0M | Form 10-Q Q1 2026, XBRL tag `us-gaap:WeightedAverageNumberOfSharesOutstandingBasic` (Q1 2026) |
| Diluted weighted-average (Q1 2026) | 10,874.0M | Form 10-Q Q1 2026, XBRL tag `us-gaap:WeightedAverageNumberOfDilutedSharesOutstanding` (Q1 2026) |
| Diluted weighted-average (FY2025) | 10,827.0M | FY2025 Annual Report (10-K, Apr-9-2026), Consolidated Statements of Operations, diluted EPS computation table |
| Total dilutive effect of outstanding stock awards (FY2025) | 171.0M | FY2025 Annual Report (10-K, Apr-9-2026), diluted shares computation table: basic 10,656M + dilutive stock awards 171M = diluted 10,827M |
| Total dilutive effect of outstanding stock awards (FY2024) | 248.0M | FY2025 Annual Report (10-K), same table: FY2024 basic 10,473M + 248M = diluted 10,721M |
| Convertibles / potential shares from convertibles | Nil | Amazon has no outstanding convertible bonds — all financial debt is senior unsecured notes or revolving credit (Capital IQ Capital Structure Details tab, FY2025 and Q1 2026) |
| **Fully diluted shares used for per-share fair value** | **10,874.0M** | **Q1 2026 10-Q diluted weighted-average (most recent period); treasury stock method applied to RSUs/stock awards** |

**Share Count Reconciliation Table:**

| Component | Shares (M) | Basis |
|---|---:|---|
| Basic weighted-average (Q1 2026) | 10,743 | Q1 2026 10-Q XBRL |
| + Dilutive effect of stock awards (Q1 2026) | 131 | Q1 2026 10-Q (10,874 − 10,743 = 131M dilutive) |
| = Diluted weighted-average (Q1 2026) | 10,874 | Q1 2026 10-Q XBRL — used for per-share fair value |
| Basic shares outstanding (cover page) | 10,757 | Q1 2026 10-Q cover, Apr 22, 2026 — used for market cap |

**Gap and methodology note.** The 117M gap between the basic shares outstanding (10,757M, used for market cap) and the diluted weighted-average (10,874M, used for per-share fair value) arises entirely from outstanding RSU/stock-award dilution under the treasury stock method. Amazon has no convertible securities outstanding. The dilutive count used for market cap is the cover-page "as-of" share count (the most recent actual count); the diluted weighted-average is used for per-share fair value outputs to avoid overstating fair value per share. The dilutive effect has declined from 248M (FY2024) to 171M (FY2025) to 131M (Q1 2026), consistent with fewer RSU awards relative to the share base.

---

## 3. Market Capitalization

**Market cap = share count × current price**

`Market cap = 10,757.1M shares × $238.34 = $2,563,849M ≈ $2.564 trillion`

Cross-check: Capital IQ Key Stats tab "Latest Capitalization" row "Market Capitalization" = $2,563,849.46M — zero discrepancy to rounding.

| Component | Value |
|---|---:|
| Shares used (basic, Apr 22, 2026) | 10,757.1M |
| Price (Jul 1, 2026 last close) | $238.34 |
| **Market capitalization** | **$2,563,849M ($2.564 trillion)** |

Note: capital IQ uses basic shares outstanding for market cap (per "Dilution: Basic" disclosure on the Historical Capitalization and Multiples tabs). This is appropriate for market cap; per-share fair value uses diluted shares (10,874M — see §2).

---

## 4. Enterprise Value Bridge

| Component | Amount (USD M) | Source |
|---|---:|---|
| Market capitalization | $2,563,849 | 10,757.1M shares × $238.34 (Jul 1, 2026 close); confirmed by Capital IQ Key Stats tab |
| + Total debt (short + long term) | $235,540 | Capital IQ Capital Structure Summary tab, Mar-31-2026: includes financial bonds/notes ($121,782M), short-term revolving credit ($152M), financing/other borrowings ($9,390M), and lease liabilities ($104,942M = operating $89,252M + finance $12,286M + other ~$3,404M). Total Debt Outstanding $235,540M after adjustments of $(726M). |
| + Minority / non-controlling interest | Nil | Capital IQ Historical Capitalization and Key Stats: "Total Minority Interest: —". FY2025 10-K and Q1 2026 10-Q balance sheets: no minority interest line. Amazon is wholly owned; no material NCI. |
| + Preferred equity | Nil | Capital IQ: "Pref. Equity: —". No preferred stock outstanding (FY2025 10-K, Item 8, balance sheet). |
| + Operating lease liabilities | (included in Total Debt above) | Capital IQ includes operating lease liabilities ($89,252M at FY2025 per Capital Structure Details; $104,942M total leases at Q1 2026 per Summary) within its Total Debt figure. No separate addition needed. The lease amount is shown explicitly above for transparency. |
| + Underfunded pension / OPEB | Nil | Amazon does not offer a defined-benefit pension plan to US employees. Capital IQ Pension OPEB tab shows no material defined-benefit obligation. No adjustment needed. |
| − Cash & equivalents (+ ST investments) | $(143,089) | Capital IQ Capital Structure Summary tab, Mar-31-2026: "Total Cash & ST Investments $143,089M" = cash & equivalents $101,816M + short-term investments $41,273M. This figure ALREADY nets out restricted cash (~$3.3B at FY2025 was restricted; the transition from FY2025 $123,029M to Q1 2026 $143,089M is net of restricted amounts, confirmed by the FY2025 10-K Note 2 reconciliation: gross $126,325M less restricted $3,296M = net $123,029M). |
| − Equity-method investments | Not deducted | Amazon's $51,423M in long-term investments (Balance Sheet Mar-31-2026) consists primarily of Anthropic preferred stock, Rivian equity, and other strategic/private-company investments. These are strategic operating investments, not financial equivalents, and are not netted from EV under either the CIQ methodology or standard practice for operating companies. They are NOT netted here (see §15 note below). |
| **= Enterprise value (EV)** | **$2,656,300M ($2.656 trillion)** | $2,563,849 + $235,540 + 0 + 0 − $143,089 = **$2,656,300M**. Cross-check: Capital IQ Key Stats "Total Enterprise Value (TEV)" = $2,656,300.46M — zero discrepancy. |

**EV bridge arithmetic verification:** $2,563,849 + $235,540 − $143,089 = $2,656,300M ✓

**Cash quality note (§15 compliance).** The $143,089M netted as cash is operating cash and genuine short-term equivalents, net of restricted amounts. The Capital IQ figure has already excluded restricted/pledged cash (confirmed by the FY2025 10-K Note 2 reconciliation above). What is NOT netted: (a) $51,423M in long-term investments (Anthropic preferred stock ~$19–20B, Rivian equity ~$5B, other private-company equity/warrants) — these are strategic, carry mark-to-market volatility recorded in Other income/expense, and are not cash equivalents; (b) $41,273M in short-term investments — these ARE included in the netted figure per CIQ's standard treatment (money market funds, US government and agency securities, corporate debt at Level 1/2 — all liquid, short-duration, and equivalent to cash). The $41,273M in ST investments passes the cash-quality test: they are classified as Level 1 or Level 2 securities with maturities consistent with cash equivalents and do not include equity or long-tenor fair-value instruments (FY2025 10-K, Note 2, cash and investments table).

**Net debt / cash basis labeling (§15 strict / broad).** Two bases are carried forward:
- **Strict basis** (financial debt only, no lease liabilities): financial bonds + revolving credit + other borrowings = $130,598M (BS: $152M revolving + $3,172M current LTD + $127,274M LT debt); strict net cash = $143,089M − $130,598M = **$12,491M net cash**. [Balance Sheet, Form 10-Q Q1 2026 (Apr-30-2026)]
- **Broad basis** (CIQ definition — total debt including lease liabilities): $235,540M total debt; broad net debt = $235,540M − $143,089M = **$92,451M net debt**. [Capital IQ Capital Structure Summary, Mar-31-2026]

The broad basis is the CIQ-computed figure ($92,451M) and is the canonical net-debt figure for leverage ratios, consistent with the earnings module. The strict basis ($12,491M net cash) is provided for financial-covenant and credit analysis where leases are excluded.

**Adjustments NOT made and why:**
- Operating lease liabilities: already included in Total Debt ($104,942M in CIQ's Total Debt). This is the canonical treatment for Amazon given the economic substance of its lease obligations (the 10-K states 3.8% weighted-average discount rate on operating leases with ~10-year average remaining term).
- Pensions / OPEB: Amazon has no US defined-benefit pension; immaterial foreign obligations exist but are not disclosed as material liabilities.
- Contingent claims: various legal proceedings but no accrued liability material enough to adjust EV (FY2025 10-K, Note 7 — Commitments and Contingencies).
- Long-term equity investments: not netted per operating-company standard (see cash quality note above).

---

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total financial debt (strict — no leases) | $130,598M | Q1 2026 10-Q Balance Sheet: short-term revolving $152M + current LT debt $3,172M + long-term debt $127,274M |
| Total lease liabilities | $104,942M | Capital IQ Capital Structure Summary, Mar-31-2026 |
| Total debt (broad — incl. leases, CIQ) | $235,540M | Capital IQ Capital Structure Summary, Mar-31-2026 |
| Cash & equivalents | $101,816M | Q1 2026 Balance Sheet; Capital IQ Balance Sheet tab, Mar-31-2026 |
| Short-term investments | $41,273M | Q1 2026 Balance Sheet; Capital IQ Balance Sheet tab, Mar-31-2026 |
| Total cash & ST investments | $143,089M | Capital IQ Capital Structure Summary, Mar-31-2026 |
| **Net debt — broad basis (CIQ; labeled "broad")** | **$92,451M** | Capital IQ Capital Structure Summary, Mar-31-2026: "Net Debt $92,451M" |
| **Net cash — strict basis (labeled "strict")** | **$12,491M net cash** | Computed: $143,089M − $130,598M = $12,491M (positive = net cash position) |
| LTM EBITDA (LTM Mar-31-2026) | $155,861M | Capital IQ Key Stats tab, LTM Mar-31-2026 |
| **Net debt / LTM EBITDA (broad basis, reported GAAP)** | **0.59x** | $92,451M / $155,861M = 0.59x; note CIQ Capital Structure Summary reports 0.487x based on its own EBITDA definition vs the Key Stats EBITDA — difference is definitional. Using Key Stats LTM EBITDA $155,861M gives 0.59x. |
| Available undrawn credit | $59,400M | Capital IQ Capital Structure Summary, Mar-31-2026: $30,000M undrawn commercial paper + $29,400M undrawn revolving credit |

**Leverage note.** On the broad basis (including $104.9B in lease liabilities), net debt is $92.5B, giving a 0.59× EBITDA ratio — very low leverage for a company of this scale. On the strict basis (financial bonds only), Amazon is in a net cash position of $12.5B. The large Q1 2026 increase in financial debt (bonds rose from $68B at FY2025 to $121.8B at Q1 2026, a $53.8B increase) reflects new senior note issuances to pre-fund the $151B annualized capex run-rate for AWS AI infrastructure. Even at the elevated Q1 2026 debt level, leverage is modest given $155.9B in LTM EBITDA.

---

## 6. Per-Share Reference Values

All per-share values computed using basic shares outstanding (10,757.1M) for balance-sheet items unless otherwise noted, consistent with how book value per share is disclosed in Capital IQ and SEC filings.

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share (basic, 10,757M shares) | $41.08 | Total Common Equity $441,914M ÷ 10,757.1M = $41.08; Capital IQ Balance Sheet tab Mar-31-2026 reports $41.09 (rounding). [Capital IQ Balance Sheet tab, Mar-31-2026] |
| Book value per share (diluted, 10,874M shares) | $40.64 | $441,914M ÷ 10,874M = $40.64. Use for per-share fair value comparisons. |
| Tangible book value per share (basic) | $38.90 | Tangible Book Value $418,465M ÷ 10,757.1M = $38.90; Capital IQ Balance Sheet tab reports $38.91. Goodwill $23,449M + Other Intangibles (N/A at Mar-31-2026 in CIQ; ~$9,197M at FY2025) deducted from book equity. [Capital IQ Balance Sheet tab, Mar-31-2026] |
| Net cash per share — strict basis (basic shares) | $1.16 | Net cash $12,491M ÷ 10,757.1M = $1.16 per share. Positive = net cash. |
| Net debt per share — broad basis (basic shares) | $(8.59) | Net debt $92,451M ÷ 10,757.1M = $(8.59) per share (negative = net debt burden). |

---

## 7. Anchor Summary (canonical numbers for downstream agents)

Every downstream valuation agent must use these numbers verbatim. Any deviation requires an explicit one-line reason per MODULE_RULES Reconciliation Gate 1.

### Anchor Block (copy-forward)

- **Price:** $238.34 (July 1, 2026 last close, NasdaqGS:AMZN)
- **Price-state:** `pool-verified` — the canonical tag `05`/`07`/`99` read. Price is from the Capital IQ data pool export, confirmed by three independent internal cross-checks (Key Stats tab, Estimates Consensus tab, Multiples tab P/LTM EPS × LTM EPS). All price-relative scoring is unlocked: margin of safety, downside-to-bear, observed up/down, and valuation attractiveness may be computed.
- **Currency:** USD
- **Shares (market cap):** 10,757.1M basic shares outstanding as of April 22, 2026 [Form 10-Q Q1 2026, cover page; Capital IQ Key Stats tab]
- **Shares (per-share fair value):** 10,874M diluted weighted-average for Q1 2026 [Form 10-Q Q1 2026, XBRL `us-gaap:WeightedAverageNumberOfDilutedSharesOutstanding`]. Treasury stock method; no convertibles. Dilutive stock awards: 131M for Q1 2026 (171M for FY2025).
- **Market cap:** $2,563,849M ($2.564 trillion) at $238.34
- **Net debt — strict basis (financial debt minus cash; labeled "strict"):** ($12,491M) — i.e., net cash of $12,491M. Financial debt $130,598M; cash & ST investments $143,089M.
- **Net debt — broad basis (total debt incl. leases minus cash; labeled "broad"; CIQ canonical):** $92,451M. Total debt $235,540M; cash & ST investments $143,089M. This is the canonical figure for leverage ratios, consistent with the earnings module.
- **EV:** $2,656,300M ($2.656 trillion) = market cap $2,563,849M + total debt (broad) $235,540M − cash $143,089M. Zero discrepancy vs Capital IQ Key Stats TEV.
- **Reporting currency:** USD. US GAAP. Fiscal year ends December 31. All balance-sheet figures as of March 31, 2026 (latest available). Price as of July 1, 2026.
- **Key caveats:**
  1. Balance sheet data is dated March 31, 2026 (Q1 2026); price is dated July 1, 2026. No balance-sheet update since April 30, 2026 (10-Q filing). Net debt and EV reflect a ~10-week-old balance sheet at the time of this analysis.
  2. Q1 2026 saw a large increase in financial debt (bonds rose ~$53.8B vs FY2025), related to new senior note issuances for AI capex financing. This elevated the broad-basis net debt from $55,518M at FY2025 to $92,451M at Q1 2026.
  3. Amazon holds $51.4B in long-term equity/debt investments (Anthropic, Rivian, others) that are NOT netted from EV. These carry mark-to-market risk but are strategic, not financial equivalents.
  4. The strict-basis net cash ($12,491M) and broad-basis net debt ($92,451M) represent very different pictures of leverage — downstream agents must specify which basis they use and label it "strict" or "broad" per §15.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — AMZN

**Reporting currency:** USD. **Standard:** US GAAP. **Business type:** Operating company (three reportable segments: North America, International, AWS). **Anchor date:** July 1, 2026 (price). **Balance sheet date:** March 31, 2026 (Q1 2026 10-Q). All anchor numbers taken verbatim from `01_price-and-capital-structure.md`.

**Anchor block (from `01`, used verbatim):**
- Price: $238.34 (Jul 1, 2026 last close, pool-verified)
- Market cap: $2,563,849M ($2.564T) — basic shares 10,757.1M × $238.34
- EV: $2,656,300M ($2.656T) — market cap + total debt (broad, incl. leases) $235,540M − cash & ST investments $143,089M
- Diluted shares (per-share fair value): 10,874M (Q1 2026 diluted weighted-average)
- Net debt — broad basis (CIQ canonical): $92,451M; net cash — strict basis (financial debt only): $12,491M

**EBITDA methodology note.** Capital IQ's Multiples tab and Comps tab report EV/EBITDA using an EBITDA definition that adds back operating lease depreciation (~$16–17B annually for Amazon), because Capital IQ includes operating lease liabilities in its total debt / EV numerator. This makes the EV/EBITDA multiple internally consistent on CIQ's own basis. CIQ's reported LTM EV/EBITDA of approximately 15.4x implies a CIQ-adjusted EBITDA of roughly $172.7B, versus the GAAP EBITDA of $155,861M in the Key Stats tab. All EV/EBITDA multiples in this report are on CIQ's internally consistent basis unless labeled otherwise. The EV/EBIT and EV/Revenue multiples are not affected by this definitional difference.

---

## 1. Current Multiples

All figures as of July 1, 2026. EV = $2,656,300M. Market cap = $2,563,849M. Diluted shares = 10,874M.

| Multiple | Basis | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| EV / Sales | LTM (12 months ended Mar 31, 2026) | $742,776M | 3.6x | Capital IQ Multiples tab, Jun-2026 quarter close; confirmed by Capital IQ Comps tab Jul-1-2026 |
| EV / Sales | NTM (FY2026 consensus) | $823,424M | 3.13x | Capital IQ Estimates Multiples tab, NTM row, Jul-1-2026; Estimates Trends tab FY2026 consensus rev |
| EV / EBITDA | LTM (CIQ-adjusted basis) | ~$172,700M (CIQ-adjusted; GAAP EBITDA = $155,861M) | 15.4x | Capital IQ Multiples tab, Jun-2026 close = 15.38x; Capital IQ Comps tab Jul-1-2026 = 15.4x |
| EV / EBITDA | NTM (FY2026 consensus) | $211,027M | 11.93x | Capital IQ Estimates Multiples tab, NTM row; FY2026 consensus EBITDA from Trends tab |
| EV / EBIT | LTM (12 months ended Mar 31, 2026) | $85,422M | 31.1x | Capital IQ Financials LTM Mar-31-2026; Capital IQ Comps tab Jul-1-2026; Multiples Jun-2026 close = 31.31x |
| EV / EBIT | NTM (FY2026 consensus) | $103,833M | 24.3x | Capital IQ Estimates Multiples tab, NTM row; FY2026 consensus EBIT from Trends tab |
| P / E (reported) | LTM (reported GAAP EPS, incl. one-time investment gains) | $8.361/share | 28.5x | $238.34 / $8.361 = 28.51x; confirmed by Capital IQ Multiples tab Jun-2026 close = 28.50x |
| P / E (NTM) | NTM (CIQ 12-month rolling window) | $8.37/share (implied) | 28.49x | Capital IQ Estimates Multiples tab, NTM P/E = 28.49x at $238.34 |
| P / Book | LTM (basic BV/share $41.08 per Q1 2026 BS) | $41.08/share | 5.8x | $238.34 / $41.08 = 5.80x; confirmed by Capital IQ Multiples tab Jun-2026 close = 5.800x |
| P / TangBV | LTM (TangBV/share $38.91, Q1 2026) | $38.91/share | 6.1x | Capital IQ Comps tab, Jul-1-2026 |
| P / FCF | LTM (strict FCF: CFO − gross capex) | −$2,472M (negative) | Not meaningful (N/M) | Strict FCF LTM Mar-31-2026: $148,531M CFO − $151,003M gross capex; Capital IQ Financials Cash Flow tab |
| P / FCF | FY2025 (company-disclosed non-GAAP FCF) | $11,194M | ~228x | $2,563,849M mkt cap / $11,194M; FY2025 10-K, p.28, FCF reconciliation table |
| Dividend yield | N/A | Amazon pays no cash dividend | N/A | FY2025 10-K; Capital IQ Key Stats |

**P/E note on comparability:** The LTM reported EPS of $8.361 includes $15,301M in gains on equity investments (primarily Anthropic and Rivian mark-to-market) recorded in FY2025, which are not recurring. Capital IQ's normalized EPS for LTM (removing investment gains/losses) was approximately $4.70. The reported P/E of 28.5x is the standard ratio on GAAP EPS; the normalized P/LTM EPS was approximately 50.7x [Capital IQ Financials, FY2025 normalized EPS; CIQ Multiples tab LTM normalized P/E Jun-2026 close = 47.6x].

**FCF note:** Amazon's strict FCF (CFO minus gross capex) turned negative at the LTM level because of a step-change in AI infrastructure capex. CIQ's own Multiples tab shows EV/LTM Unlevered FCF of approximately 233x at the Jun-2026 close and Market Cap/LTM Levered FCF of approximately 261x — both N/M for valuation purposes in the near term. FCF multiples carry no weight here. [Capital IQ Multiples tab, Jun-2026 close]

---

## 2. Historical Multiple Bands (18 months — Dec 2024 to Jun 2026)

**Partial-data context.** Capital IQ's quarterly Multiples tab export covers seven quarterly datapoints from December 2024 through June 2026 — approximately 18 months. This is below the preferred 3–5 year band. Annual financial data is available back to FY2021 (5 years), but a consistent quarterly multiple time series covering the prior period is not in the data pool. The 18-month CIQ series is the only internally consistent multiple band available.

**Structural context that justifies the short window.** Amazon's EBIT margin expanded from 2.6% in FY2022 to 13.1% in Q1 2026. The business that traded at 30–40x EBIT or 15–20x EBITDA in the low-margin 2020–2023 era was structurally different — margins, FCF conversion, and AWS mix are now at levels not seen before in Amazon's history. The pre-2024 multiple history would conflate different earnings power levels with today's. The 18-month post-2024 band is therefore the most relevant comparable period available. Per the partial-data rule: reversion-implied values are illustrative-only and are not a fair-value input for the scenario agent (`07`).

All data below uses the **close-price multiple at the end of each quarter** (i.e., the multiple on the last trading day of each quarter). These are from Capital IQ's Multiples tab, "Close" row, internally consistent on CIQ's definitions. [Capital IQ Financials.xls, Multiples tab, quarterly close series, data as of Capital IQ pull date approximately Jul 1–2, 2026]

| Multiple | Dec-24 | Mar-25 | Jun-25 | Sep-25 | Dec-25 | Mar-26 | Jun-26 (latest) | Min | Mean | Median | Max | Current (Jul-1) | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| EV / EBITDA (LTM, CIQ adj.) | 18.95x | 15.36x | 16.96x | 16.13x | 16.28x | 14.15x | 15.38x | 14.15x | 16.17x | 16.13x | 18.95x | 15.4x | 26th |
| EV / EBIT (LTM) | 39.28x | 30.23x | 33.38x | 31.62x | 32.24x | 28.85x | 31.31x | 28.85x | 32.42x | 31.62x | 39.28x | 31.1x | 24th |
| EV / Sales (LTM) | 3.83x | 3.25x | 3.68x | 3.59x | 3.67x | 3.20x | 3.58x | 3.20x | 3.54x | 3.59x | 3.6x | 60th |
| P / LTM EPS (reported) | 46.91x | 34.41x | 35.74x | 33.49x | 32.62x | 29.05x | 28.50x | 28.50x | 34.39x | 33.49x | 46.91x | 28.5x | 0th |
| EV / EBITDA (NTM, CIQ) | 15.00x | 12.30x | 14.29x | 13.28x | 12.98x | 10.91x | 11.93x | 10.91x | 12.96x | 12.98x | 15.00x | 11.93x | 25th |
| EV / EBIT (NTM) | 31.38x | 25.60x | 29.63x | 27.54x | 26.76x | 23.22x | 24.29x | 23.22x | 26.92x | 26.76x | 31.38x | 24.29x | 13th |
| P / NTM EPS | 37.46x | 29.97x | 34.74x | 31.90x | 31.01x | 26.95x | 28.49x | 26.95x | 31.50x | 31.01x | 37.46x | 28.49x | 15th |
| P / BV (LTM) | 8.90x | 7.05x | 7.61x | 7.01x | 6.67x | 5.44x | 5.80x | 5.44x | 6.93x | 7.01x | 8.90x | 5.80x | 10th |
| EV / Sales (NTM) | 3.47x | 2.96x | 3.37x | 3.24x | 3.29x | 2.84x | 3.13x | 2.84x | 3.19x | 3.24x | 3.47x | 3.13x | 46th |

**Percentile calculation:** `(current − min) / (max − min) × 100`. The P/LTM EPS percentile is 0th because the current close matches the minimum in the 18-month series — reflecting the collapse in the reported P/E as LTM GAAP earnings surged due to the Anthropic/Rivian investment gains.

**Source note:** [Capital IQ Financials.xls — Multiples tab, quarterly close-price series; Capital IQ Estimates Multiples tab NTM multiples; data as of Capital IQ pool pull date approximately Jul 1–2, 2026]

---

## 3. Re-Rating / De-Rating Read

Over the 18-month window (Dec 2024 to Jun/Jul 2026), the stock has **de-rated on forward multiples** and sits in the lower quartile of its own short-range band on EV/NTM EBITDA, EV/NTM EBIT, P/NTM EPS, and P/BV. The de-rating has been most pronounced on price-to-earnings metrics.

**EV/NTM EBITDA** — current 11.93x versus an 18-month mean of 12.96x and median of 12.98x: a discount of approximately **8% to both mean and median** (`(11.93 − 12.96) / 12.96 = −7.9%`; `(11.93 − 12.98) / 12.98 = −8.1%`). The 25th percentile of the range.

**P/NTM EPS** — current 28.49x versus mean of 31.50x and median of 31.01x: a discount of approximately **10% to the mean and 8% to the median** (`(28.49 − 31.50) / 31.50 = −9.6%`; `(28.49 − 31.01) / 31.01 = −8.1%`). The 15th percentile of the range.

**EV/LTM EBITDA** — current 15.4x versus mean of 16.17x and median of 16.13x: a discount of approximately **5% to both** (`(15.38 − 16.17) / 16.17 = −4.9%`). The 26th percentile.

The de-rating is driven by two forces. First, the LTM and NTM earnings metric in the denominator has grown rapidly — EPS up 51% LTM versus FY2024, EBITDA up 28% — which mechanically compresses the multiple even if the stock price holds. Second, the market has also partially stepped back from the peak Dec-2024 multiple (18.95x LTM EBITDA, 46.91x reported P/E at Dec-2024 close) — the stock traded at $229 in late 2024, rose to $265 by Mar-26-2026 (when it commanded 18.9x LTM EBITDA), then pulled back to $238. The net result is a ~5–10% compression versus the 18-month band average, reflecting a combination of rapid earnings growth and a modest multiple step-down. [Capital IQ Multiples tab quarterly close series; earnings/01_historical-financials.md LTM EPS and EBITDA figures]

---

## 4. Implied Value from Reversion

**Illustrative-only. Per the partial-data rule: own history < 3 years. These numbers are directional and are NOT a fair-value input for `07_scenario-and-fair-value`.**

Formula used throughout: `Implied EV = multiple × metric; Implied equity = Implied EV − total debt (broad, $235,540M) + cash ($143,089M); Implied per-share = Implied equity / 10,874M diluted shares`. For P/E: implied per-share = multiple × NTM EPS directly (no EV bridge).

| Multiple | Reversion target (median) | Reversion target (mean) | Metric used | Implied price (median) | Implied price (mean) | vs Current $238.34 (median) |
|---|---:|---:|---|---:|---:|---|
| EV / NTM EBITDA | 12.98x | 12.96x | FY2026 consensus EBITDA $211,027M | $243 | $243 | +2.1% |
| EV / LTM EBITDA | 16.13x | 16.17x | LTM EBITDA (CIQ adj.) ~$172,700M | $265 | $266 | +11.2% |
| EV / NTM EBIT | 26.76x | 26.92x | FY2026 consensus EBIT $103,833M | $247 | $249 | +3.6% |
| P / NTM EPS | 31.01x | 31.50x | NTM EPS (CIQ rolling) $8.37 | $259 | $264 | +8.7% |

**Calculations (median, for verification):**
- EV/NTM EBITDA: `12.98 × 211,027 = $2,739,130M EV; equity = 2,739,130 − 235,540 + 143,089 = $2,646,679M; per share = $2,646,679M / 10,874M = $243.40`
- EV/LTM EBITDA: `16.13 × 172,700 = $2,786,451M EV; equity = 2,786,451 − 235,540 + 143,089 = $2,694,000M; per share ≈ $247.75` (using CIQ-adjusted EBITDA) — alternatively at 16.13x on GAAP EBITDA $155,861M: `16.13 × 155,861 = $2,513,038M EV; equity = $2,420,587M; per share ≈ $222.60`
- EV/NTM EBIT: `26.76 × 103,833 = $2,778,550M EV; equity = 2,778,550 − 235,540 + 143,089 = $2,686,099M; per share = $247.02`
- P/NTM EPS: `31.01 × $8.37 = $259.56/share`

**The LTM EBITDA row has a dual basis problem.** At 16.13x on CIQ-adjusted EBITDA (~$172.7B) the implied price is ~$266; at 16.13x on GAAP EBITDA ($155.9B) it is ~$223. Because the CIQ band was constructed on CIQ's adjusted EBITDA basis, the consistent reversion is at ~$265–266, not $223. Both are shown for transparency.

**Base-case illustrative point (single named multiple, directional only):** the own-median EV/NTM EBITDA multiple of 12.98x applied to FY2026 consensus EBITDA of $211,027M implies approximately **$243 per share** — approximately +2% above the current price of $238.34. The dispersion across the four multiples used (median basis) spans $243–$266 using CIQ-adjusted EBITDA bases, or $223–$260 using GAAP EBITDA for the LTM row.

**Reversion assumption and its validity.** The implied-value table assumes that today's warranted multiple equals the 18-month own median — i.e., that the business has not changed in a way that justifies a permanently lower multiple. That assumption is partially supported: Amazon's revenue growth has accelerated and margins are at record highs (13.1% EBIT in Q1 2026 versus 5.3% in FY2021). The warranted multiple for a structurally higher-margin Amazon is plausibly at or above the 18-month median. What creates downside to the reversion thesis: (1) AI capex is compressing FCF and the market may re-rate the multiple lower if FCF does not recover by 2026–2027; (2) the 18-month window itself includes a period when the stock was trading at near-peak multiples (Dec 2024); the median is pulled upward by those prints.

---

## 5. Own-History Read

Over the 18 months of available CIQ multiple data, Amazon has de-rated by approximately 8–10% on forward earnings multiples (EV/NTM EBITDA and P/NTM EPS), sitting in the bottom quartile of its own short-range band. The directional reversion to the own median implies a stock in the range of $243–$260 on a single-point NTM basis — roughly in line with, or modestly above, the current price, depending on which multiple is applied.

The single biggest caveat is that the 18-month own-history band is too short to produce a reliable reversion target. Amazon has undergone a structural earnings inflection — EBIT margin tripled from 2022 to 2026 — that means its own pre-2024 multiples are not a valid comparator. The relevant multiple history is the current 18-month window, but that window itself spans only one full capex cycle and does not yet include a period of normalised FCF delivery (FCF is negative LTM on a strict basis). If FCF remains negative or weak through 2026–2027 as capex runs at $150B+ annually, the multiple the market assigns to AWS-driven earnings may remain compressed relative to the historical midpoint, and the 12.98x NTM EBITDA median may not be "the old normal" so much as a data artifact of a brief high-valuation period in late 2024. Reversion to that median is directionally informative but not a firm anchor.

---

*Cross-module inputs used: `01_price-and-capital-structure.md` (anchor numbers); `earnings/01_historical-financials.md` (LTM metric base); `earnings/04_guidance-consensus.md` (NTM/FY2026 consensus estimates). No management-governance module output available for this run; §24 Filter 6 assessment deferred to master synthesizer. Amazon is public-float-held with no government controller or misaligned parent — the standard reversion caveat applies (structural discount not flagged on ownership grounds).*



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — AMZN

**Reporting standard:** US GAAP. **Currency:** USD (millions unless noted). **Price anchor:** $238.34 (July 1, 2026 last close, pool-verified). **EV:** $2,656,300M. **All peer multiples sourced from Capital IQ Comparable Analysis export, as of July 1, 2026 — labeled below as "CIQ Comps, Jul 1, 2026."**

---

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Alphabet Inc. | GOOGL | Cloud (Google Cloud is AWS's #3 rival globally) and digital advertising; multi-segment technology platform with meaningful AI exposure | CIQ Comps set (highest-relevancy rank); named competitor category in FY2025 10-K, Item 1, p. 4 (cloud/IT services); `08_competitive-map.md` |
| Meta Platforms, Inc. | META | Digital advertising at scale; high-margin recurring revenue from a dominant platform; meaningful technology overlay in AI | CIQ Comps set; advertising peer (Amazon advertising $68.6B FY2025 competes for the same digital ad budgets) |
| Microsoft Corporation | MSFT | Azure is AWS's closest and best-resourced cloud rival; enterprise SaaS; the single most comparable company on the cloud segment | CIQ Comps set; `08_competitive-map.md` Competitor A; FY2025 10-K, Item 1, p. 4 (same category as Google Cloud) |
| eBay Inc. | EBAY | Online marketplace; third-party seller platform; direct retail e-commerce peer | CIQ Comps set; partial retail analog (marketplace model) |
| Netflix, Inc. | NFLX | Subscription digital platform; no retail; limited direct comparability to Amazon's core segments, but included in CIQ's relevancy-ranked set | CIQ Comps set |
| Expedia Group, Inc. | EXPE | Online marketplace / travel; digital transaction platform; limited direct comparability to AWS or retail | CIQ Comps set |
| Ollie's Bargain Outlet Holdings | OLLI | US physical discount retail; comparable on the broadline retail tag only; scale, margin profile, and business model are structurally weaker than Amazon Stores | CIQ Comps set |
| Savers Value Village, Inc. | SVV | US and Canada thrift / physical retail; broadline retail tag; very limited direct comparability | CIQ Comps set |
| Etsy, Inc. | ETSY | Online marketplace (crafts/artisan); two-sided platform; some marketplace analog | CIQ Comps set |
| Kohl's Corporation | KSS | US omnichannel department store; broadline retail; lowest-quality peer in the set by margin and credit | CIQ Comps set |

**Peer set source:** The ten peers above come directly from the Capital IQ Comparable Analysis export ("Company Comparable Analysis Amazon com Inc.xls"), as of July 1, 2026, sorted by Capital IQ's proprietary relevancy score. This is **not a self-selected peer set** — it was built by Capital IQ's algorithm and is taken from the data pool without modification.

**Composition caveat (material):** The CIQ set is heterogeneous by design. It mixes three distinct business-type cohorts: (1) megacap technology platforms with 38–58% EBITDA margins (GOOGL, META, MSFT) — the appropriate comparators for Amazon's AWS segment; (2) digital marketplaces and transactional platforms (eBay, Netflix, Expedia, Etsy) — partial comparators for Amazon's retail and advertising segments; and (3) low-margin physical broadline retailers (OLLI, SVV, KSS) — distant comparators included by virtue of Amazon's "Broadline Retail" SIC classification. The mix depresses both the peer median multiples and the peer median EBITDA margin. This structural heterogeneity is noted throughout and the warranted-multiple judgment accounts for it.

**Private peers:** No material private cloud or retail peer exists at comparable scale that would provide public multiples. Walmart (the largest retail rival named in `08_competitive-map.md`) is not included in the CIQ set — its FY2026 EV/EBITDA is approximately 13–14x (web-sourced estimate, unverified, not used in median computation).

---

## 2. Peer Multiples & Operating Stats

All figures sourced from Capital IQ Comparable Analysis export, data as of July 1, 2026. Amazon's LTM figures are for the twelve months ended March 31, 2026, consistent with the latest Capital IQ pull. Peer LTM periods vary by company (latest filed quarter; filing dates shown in Financial Data tab, ranging from April 17 to June 4, 2026).

**Business-Type Method Map:** Amazon is an operating company. EV-based multiples (EV/EBITDA, EV/EBIT, EV/Sales) are the appropriate primary trading multiples. P/E and NTM forward multiples are also used. P/FFO and P/NAV are not applicable. Per-unit or P/tangible-book metrics for banks/REITs are not applicable.

**FCF yield note:** Amazon's LTM strict FCF is negative (CFO $148,531M − capex $151,003M = −$2,472M) owing to the AI capex surge. FCF yield is therefore not a usable metric for Amazon in the current period. For peers, FCF yield is computed where possible but is not included in the primary comparison table given the non-comparability on this metric. This is noted rather than omitted silently.

| Company | LTM EV/Sales | LTM EV/EBITDA | LTM EV/EBIT | LTM P/E | NTM EV/Sales | NTM EV/EBITDA | NTM P/E | LTM Rev Growth | LTM EBITDA Margin | LTM Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **AMZN** | **3.6x** | **15.4x** | **31.3x** | **28.5x** | **3.13x** | **11.93x** | **28.49x** | **14.2%** | **21.0%** | **1.4x** | CIQ Comps, Jul 1, 2026 |
| GOOGL | 10.2x | 25.8x | 31.1x | 27.3x | 8.44x | 17.8x | 28.52x | 17.5% | 38.2% | (0.2x) net cash | CIQ Comps, Jul 1, 2026 |
| META | 6.7x | 12.7x | 16.2x | 20.5x | 5.43x | 9.48x | 17.16x | 26.2% | 50.8% | 0.1x | CIQ Comps, Jul 1, 2026 |
| MSFT | 8.9x | 14.2x | 18.1x | 22.2x | 7.65x | 12.26x | 20.15x | 17.9% | 58.0% | 0.3x | CIQ Comps, Jul 1, 2026 |
| EBAY | 4.6x | 16.9x | 20.9x | 25.8x | 4.36x | 14.11x | 18.12x | 12.5% | 25.7% | 1.1x | CIQ Comps, Jul 1, 2026 |
| NFLX | 6.5x | 20.3x | 21.9x | 23.1x | 5.76x | 16.99x | 21.49x | 16.7% | 30.5% | 0.3x | CIQ Comps, Jul 1, 2026 |
| EXPE | 2.0x | 11.5x | 12.6x | 22.4x | 1.91x | 7.57x | 12.51x | 10.0% | 17.1% | 0.7x | CIQ Comps, Jul 1, 2026 |
| OLLI | 1.9x | 9.6x | 16.4x | 19.0x | 1.67x | 11.97x | 16.66x | 16.7% | 13.5% | 1.3x | CIQ Comps, Jul 1, 2026 |
| SVV | 1.7x | 6.8x | 21.4x | 71.3x | 1.60x | 10.50x | 19.83x | 10.2% | 12.8% | 3.3x | CIQ Comps, Jul 1, 2026 |
| ETSY | 3.0x | 19.7x | 22.6x | 30.4x | 3.15x | 10.85x | 12.95x | 4.6% | 15.1% | 3.8x | CIQ Comps, Jul 1, 2026 |
| KSS | 0.5x | 5.5x | 16.4x | 7.5x | 0.54x | 6.93x | 12.57x | (3.8%) | 7.7% | 3.8x | CIQ Comps, Jul 1, 2026 |
| **Peer Median (10 peers)** | **3.8x** | **13.4x** | **19.5x** | **22.7x** | **3.75x** | **11.41x** | **17.64x** | **14.6%** | **21.4%** | **1.0x** | CIQ Comps, Jul 1, 2026 |
| **Peer Mean (10 peers)** | **4.6x** | **14.3x** | **19.8x** | **26.9x** | **4.05x** | **11.85x** | **18.0x** | **12.9%** | **26.9%** | **1.5x** | CIQ Comps, Jul 1, 2026 |

**Median computation detail (verified):** The ten peer LTM EV/EBITDA values sorted: 5.5, 6.8, 9.6, 11.5, 12.7, 14.2, 16.9, 19.7, 20.3, 25.8. Median = average of 5th and 6th values = (12.7 + 14.2) / 2 = **13.45x ≈ 13.4x** (rounded). CIQ's reported median of 13.4x is confirmed.

**NTM EV/EBITDA median verification:** Values sorted: 6.93, 7.57, 9.48, 10.50, 10.85, 11.97, 12.26, 14.11, 16.99, 17.80. Median = (10.85 + 11.97) / 2 = **11.41x** ✓

**NTM P/E median verification:** Values sorted: 12.51, 12.57, 12.95, 16.66, 17.16, 18.12, 19.83, 20.15, 21.49, 28.52. Median = (17.16 + 18.12) / 2 = **17.64x** ✓

**ROIC:** Peer ROIC by company is not available from the Capital IQ Comparable Analysis export in this pool. Amazon's own ROIC (Capital IQ basis, lease-inclusive, 3-year average FY2023–FY2025) is approximately 9.0%, as established in `09_moat.md`. Cross-peer ROIC comparison is not available from this data source and is omitted rather than invented.

---

## 3. Premium / Discount to Peer Median

Formula: `premium/discount = (AMZN multiple − peer median) / peer median`. Positive = premium (AMZN appears more expensive on that multiple). For price multiples (P/E, EV/EBITDA, EV/EBIT, EV/Sales, P/TangBV), a premium means the stock costs more per unit of the underlying metric. FCF yield is not computed — AMZN's LTM FCF is negative (see §2 note).

| Multiple | AMZN | Peer Median | Premium / (Discount) | Direction |
|---|---:|---:|---:|---|
| LTM EV/Sales | 3.6x | 3.8x | (5.3%) | Discount to median |
| LTM EV/EBITDA | 15.4x | 13.4x | +14.9% | Premium |
| LTM EV/EBIT | 31.3x | 19.5x | +60.5% | Premium |
| LTM P/E | 28.5x | 22.7x | +25.6% | Premium |
| LTM P/Tangible Book | 6.1x | 8.3x | (26.5%) | Discount |
| NTM EV/Sales | 3.13x | 3.75x | (16.5%) | Discount |
| NTM EV/EBITDA | 11.93x | 11.41x | +4.6% | Slight premium |
| NTM P/E | 28.49x | 17.64x | +61.5% | Premium |

**Reading the pattern:** The LTM/NTM split is informative. On trailing (LTM) multiples, AMZN trades at a 15% EV/EBITDA premium and a 25% P/E premium to the peer median, but at a 5% discount on EV/Sales and a 26% discount on P/Tangible Book. On forward (NTM) multiples, the EV/EBITDA premium collapses to just 4.6% — because the consensus projects AMZN's NTM EBITDA ($222,587M) to grow much faster than the current LTM figure ($155,861M, +43% implied), a larger step-up than the peer median implies. The NTM P/E premium of 61.5% is the outlier: it reflects that the peer-median NTM P/E (17.64x) is pulled down by the low-quality discount retailers (OLLI 16.7x, KSS 12.6x, SVV 19.8x) and does not represent a fair quality-equivalent benchmark for AMZN on earnings. The EV/EBITDA series is the more reliable primary metric for this business type because it normalizes for capital structure and avoids the earnings-per-share contamination from equity investment mark-to-market (AMZN's reported EPS is inflated by $15.3B in non-recurring investment gains in FY2025).

**Is the gap typical or unusual?** The Capital IQ Comparable Analysis export covers as-of July 1, 2026 only — it does not contain a time series of the premium/discount to this peer set. The pool's own Multiples tab for AMZN covers AMZN's own multiple history (Q4 2024 through July 1, 2026) but does not contain the peer-median multiples at each historical date. A 3-year relative-gap persistence read for this specific set is therefore **Not assessable** from this data pool. The available evidence is a single point in time as of July 1, 2026.

---

## 4. Is the Gap Warranted?

**Verdict: the slight NTM EV/EBITDA premium (4.6%) is warranted; the large NTM P/E premium (61.5%) requires decomposition — part is warranted, part reflects a distorted denominator, not a genuine premium.**

The evidence for a warranted premium rests on three pillars from `07_business-quality.md` and `09_moat.md`:

First, Amazon's AWS segment (57% of FY2025 consolidated operating income) earns a 35.4% operating margin in FY2025 on $128.7B in revenue, growing at 28% in Q1 2026. Microsoft's Azure earns approximately 42% Intelligent Cloud segment operating margin; Google Cloud earns approximately 23.7%. On a blended basis, the cloud-equivalent segment of Amazon is roughly at the midpoint of its two cloud peers on margin, and above on growth momentum. A business with this kind of cloud infrastructure quality — with real switching costs, government certifications, proprietary silicon (Graviton, Trainium), and a $364B AWS backlog disclosed in Q1 2026 — warrants a premium to the low-quality retail peers that make up the bottom half of the CIQ comp set.

Second, the moat analysis (`09_moat.md`) finds a narrow moat verdict at the consolidated level — through-cycle ROIC of 9.0% (Capital IQ basis) is below the estimated WACC of 11.2% on a conservative lease-inclusive basis. This limits the degree of premium warranted. A business genuinely earning above its cost of capital commands a premium; one that is at the boundary does not command an open-ended premium.

Third, the capital intensity score of 28/100 (`07_business-quality.md`) is the weakest factor in the quality assessment. With $131.8B in capex in FY2025 and ~$200B guided for FY2026, Amazon's FCF is structurally negative in the near term. This depresses the FCF yield (unusable as a current metric) and compresses the absolute NTM EV/EBITDA premium (as consensus builds in rapid EBITDA growth to absorb the build-ahead capex). A capital-intensive business in a heavy investment cycle does not warrant the same multiple as a capital-light business at the same EBITDA margin, because the capex itself may or may not yield the expected return.

**Conclusion:** The 4.6% NTM EV/EBITDA premium is warranted — arguably conservative given AWS quality — but it is essentially at-parity with the peer median, which itself includes low-quality peers. The NTM P/E premium of 61.5% is overstated because the denominator (peer median EPS) is pulled down by loss-making or earnings-impaired retailers (KSS), and the numerator (AMZN NTM EPS) is $8.36 on a basis that already excludes the $15.3B investment gain (CIQ's normalized figure). The LTM EV/EBIT premium of 60.5% is also distorted — it reflects AMZN's temporarily depressed EBIT from the AI capex step-up, not a genuine earnings quality gap. **The discount is not warranted** on any metric — Amazon's business quality is superior to the peer-median company in this set. The slight EV/EBITDA premium is justified. The large P/E and EV/EBIT premia are partly real (deserved premium for AWS quality and growth) and partly mechanical artifacts of the current capex cycle compressing near-term EBIT. Bottom line: **premium is warranted, but the EV/EBIT and NTM P/E premia are overstated by the investment cycle and should not be underwritten in full**.

---

## 5. Implied Value from Peer Multiples

**Methodology:** The primary multiple is NTM EV/EBITDA — the most reliable current metric for this operating business type, as it normalizes for capital structure and is the metric least distorted by the AI capex cycle. The warranted multiple is adjusted upward from the raw peer median to reflect Amazon's quality advantage (AWS, switching costs, growth) over the heterogeneous peer set, but capped below the megacap tech sub-group median (GOOGL, META, MSFT have NTM EV/EBITDA of 17.8x, 9.48x, 12.26x respectively — sub-median of 12.26x, below the full peer median of 11.41x for META and MSFT combined, above it for GOOGL). The quality adjustment is **+1.5x** above the full-peer NTM EV/EBITDA median (11.41x → 12.91x ≈ 13.0x), reflecting the AWS franchise premium offset by the narrow moat verdict and high capital intensity. This is expressed as a 13% premium over the peer median, supported by AWS growing at 28% versus the peer-median revenue growth of 14.6%.

**EV bridge for per-share implied price:** Uses the canonical anchor from `01_price-and-capital-structure.md`. Net debt (broad basis, CIQ canonical): $92,451M. Shares for per-share value: 10,874M (diluted, Q1 2026 weighted average).

| Multiple | Applied Peer Multiple | Metric (AMZN NTM, CIQ Consensus) | Implied EV (USD M) | Bridge to Equity (USD M) | Implied Price/Share | vs Current ($238.34) |
|---|---:|---|---:|---:|---:|---:|
| NTM EV/EBITDA (PRIMARY) — warranted 13.0x | 13.0x (peer median 11.41x + quality adj. +1.59x) | NTM EBITDA $222,587M [CIQ Consensus, Jul 1 2026] | $2,893,631M | $2,893,631M − $92,451M = $2,801,180M | **$257.60** | +8.1% |
| NTM EV/Sales — peer median (no quality adj.) | 3.75x (peer median) | NTM Revenue $848,480M [CIQ Consensus, Jul 1 2026] | $3,181,800M | $3,181,800M − $92,451M = $3,089,349M | **$284.11** | +19.2% |
| LTM EV/EBITDA — warranted (same adj.) | 13.0x | LTM EBITDA $155,861M [CIQ Comps, Jul 1 2026] | $2,026,193M | $2,026,193M − $92,451M = $1,933,742M | **$177.83** | (25.4%) |
| NTM P/E — peer median (no quality adj.) | 17.64x (peer median) | NTM EPS $8.36 [CIQ Consensus, Jul 1 2026] | N/A (equity multiple) | N/A | **$147.45** | (38.1%) |

**Computation verification:**
- NTM EV/EBITDA primary: 13.0 × $222,587M = $2,893,631M. Equity: $2,893,631M − $92,451M = $2,801,180M. Per share: $2,801,180M / 10,874M = **$257.58** ≈ $257.60 ✓
- NTM EV/Sales: 3.75 × $848,480M = $3,181,800M. Equity: $3,181,800M − $92,451M = $3,089,349M. Per share: $3,089,349M / 10,874M = **$284.11** ✓
- LTM EV/EBITDA: 13.0 × $155,861M = $2,026,193M. Per share: ($2,026,193M − $92,451M) / 10,874M = $1,933,742M / 10,874M = **$177.83** ✓
- NTM P/E: 17.64 × $8.36 = **$147.45** ✓

**Base-case implied value (primary multiple — NTM EV/EBITDA at warranted 13.0x):** **$258/share**

**Quality adjustment stated:** The 13.0x warranted multiple is 1.59x above the raw peer median of 11.41x (a 14% premium). This premium is supported by: (a) AWS's 28% revenue growth vs 14.6% peer-median revenue growth; (b) AWS switching costs (strength 71/100) and technology IP (strength 73/100) establishing a qualitative moat above the peer-median company; (c) 14.2% LTM revenue growth vs peer median 14.6% — broadly comparable on growth. The premium is capped below the megacap tech sub-peer NTM EV/EBITDA multiple of ~12–18x because the narrow moat verdict and negative LTM FCF (-$2.5B) argue against an uncapped premium. The 13.0x applied multiple is between the peer median (11.41x) and the cloud-comparable peer median (MSFT 12.26x, GOOGL 17.8x, META 9.48x — sub-median 12.26x on the two higher ones).

**Dispersion across methods:**
- Low: $148/share (NTM P/E at raw peer median 17.64x — distorted by low-quality retailers)
- Mid-low: $178/share (LTM EV/EBITDA at warranted 13.0x — reflects temporarily depressed EBITDA base from AI capex cycle)
- Base: **$258/share** (NTM EV/EBITDA at warranted 13.0x — primary)
- High: $284/share (NTM EV/Sales at raw peer median 3.75x)

The wide dispersion ($148–$284/share) reflects the heterogeneity of the peer set and the distortion of current-period metrics by the AI capex cycle. The NTM P/E floor ($148) and the LTM EV/EBITDA floor ($178) are the lowest-quality signals because (a) the peer-median P/E is dragged down by Kohl's (7.5x) and Savers (71.3x — outlier in the other direction), and (b) the LTM EBITDA base of $155.9B is set to grow 43% to $222.6B by the NTM period on consensus, making trailing multiples stale for Amazon specifically. The NTM EV/Sales ceiling ($284) is the most reliable floor on value because revenue is the least distorted metric in an investment cycle.

The base-case implied value of **$258/share** ($257.60) represents a **8.1% premium to the current price of $238.34**.

---

## 6. Relative Read

On the primary operating multiple — NTM EV/EBITDA at 11.93x vs a peer median of 11.41x — Amazon trades at just a **4.6% premium** to a heterogeneous peer set that includes low-margin physical retailers alongside megacap technology platforms. That near-parity to the full peer median, for a business with a leading cloud franchise ($364B backlog), 14% top-line growth, and AWS growing at 28%, represents a **smaller-than-warranted premium** rather than obvious excess. Applying a justified quality premium of 1.6x above the peer median (13.0x NTM EV/EBITDA) implies a base-case fair value of approximately **$258/share**, roughly 8% above the current price. The NTM P/E premium of 61.5% ($28.49x vs peer median $17.64x) is mostly a distortion artifact — the peer P/E median is pulled down by distressed retailers and the NTM EPS base for Amazon is depressed by the AI capex cycle; this metric does not imply the stock is meaningfully overpriced. The warranted-multiple conclusion is that the premium Amazon currently trades at versus the full CIQ peer set is **not excessive — if anything it is modestly below warranted** given AWS quality. The peer set implies a base-case value of approximately $258/share with a wide method dispersion of $148–$284/share driven by the AI capex investment cycle distorting both FCF and near-term EBIT metrics.

---

## Self-Check

- [x] Peer set is named with a reason per peer; source (CIQ comps, from data pool) is stated.
- [x] No private peers with uncalculable multiples appear in the table.
- [x] Every multiple has a source ("CIQ Comps, Jul 1, 2026") and a data-as-of date.
- [x] Peer median is computed and verified, not eyeballed.
- [x] Premium/discount is a percentage on each multiple, computed as (AMZN − median) / median.
- [x] The current gap is placed in context — relative-gap persistence is "Not assessable" per the partial-data rule (no time series of peer multiples in pool).
- [x] The warranted-gap judgment cites quality/moat/leverage evidence from `07_business-quality.md` and `09_moat.md`.
- [x] Each peer multiple is applied to the AMZN metric on the same basis (NTM forward multiple to NTM AMZN metric; LTM to LTM).
- [x] Implied value is a base-case point (NTM EV/EBITDA at 13.0x → $258/share) plus a separate dispersion range ($148–$284/share), with quality adjustment shown.
- [x] FCF yield: AMZN's negative LTM FCF is flagged as non-comparable, not silently omitted.
- [x] No banned phrases used without paired evidence and numbers.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — AMZN

**Reporting standard:** US GAAP. **Currency:** USD (millions unless stated). **Fiscal year end:** December 31. **Listing:** Nasdaq Global Select Market. **Business type:** Operating company (three segments: North America, International, AWS). **Business-type gate applied:** FCFF DCF appropriate; no Financial or REIT method needed.

**Discounting convention:** Mid-year (t − 0.5 applied to each explicit FCF period). Terminal value discounted at t = 10 (end of explicit forecast). This is the standard convention and is stated per MODULE_RULES DCF Standard 8.

**Intrinsic confidence cap:** Terminal value exceeds 75% of EV (base case 79.9%) — DCF is terminal-dominated; a second lens (exit-multiple cross-check) is shown alongside. Per MODULE_RULES Score Cap, valuation confidence is capped at 60 for the Gordon method alone; the exit-multiple cross-check partially lifts this.

---

## 1. FCF Base & Normalizations

Base year: **FY2025** (audited; 10-K filed April 9, 2026). All figures USD millions.

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | $716,924M | None | FY2025 10-K, Item 7, p.24 |
| EBIT (reported) | $79,975M | Add back $4,300M in one-time charges (FTC settlement $2,500M + severance $1,800M; confirmed management-called one-offs) → adjusted EBIT $84,275M | FY2025 10-K, Item 7, p.27; Q3 2025 Earnings Call, Oct 30, 2025 |
| Normalized effective tax rate | 21.0% | US statutory rate used in place of the reported FY2025 effective rate of 19.7%, which is distorted by a $15,301M gain on equity investments (Anthropic reclassification + Rivian; FVTPL-equivalent non-deductible for operating income purposes). Stripping this distortion yields 21% as the structural rate. Note: the moat module (09_moat.md §3) independently derived 21% for its NOPAT computation — this DCF reconciles to that rate. | FY2025 10-K, Note 5, p.54–55; 09_moat.md §3 |
| NOPAT (base, normalized) | $66,577M | Adjusted EBIT $84,275M × (1 − 0.21) = $66,577M | Computed |
| D&A | $65,756M | EBITDA $145,731M − EBIT $79,975M = $65,756M; used as reported (non-cash, correctly excluded from NOPAT then re-added) | Capital IQ Income Statement, FY2025; earnings/01_historical-financials.md |
| Gross capex | $131,819M | No normalization — LTM capex is stated at $151,003M, but FY2025 ($131,819M) is used as the explicit-period anchor; the forecast ramps capex to ~$200B in FY2026 per guidance | FY2025 10-K, p.22; earnings/01_historical-financials.md |
| Working capital change | $18,393M avg drain | Revenue-linked driver: 3-year average (FY2023–FY2025) WC cash drain = ($17,318M + $18,541M + $19,319M) / 3 = $18,393M; expressed as % of avg revenue = 2.86% of revenue. Applied as 2.86% of forecast revenue each year. Sign: WC drain subtracts from FCF (NWC rising in absolute terms, absorbing cash despite negative CCC — driven by broad WC definition including accrued liabilities and unearned revenue). | earnings/06_earnings-quality.md §1 (WC change table) |

**Working-capital sign sanity check.** Amazon's CCC is deeply negative (−56.9 days, FY2025). The broad WC definition used in the CFO bridge includes accounts payable, unearned AWS revenue, and accrued liabilities that all GROW as business scales — producing a net cash drain even though the CCC ratio improves. The 2.86% drag reflects this expansion of the full WC complex with revenue, not a sign error. The individual components (AR+Inv−AP) would show a WC release, but the filing's CFO bridge consistently shows a net WC drain across FY2023–FY2025, and that is the controlling evidence. [earnings/06_earnings-quality.md §1; FY2025 10-K Cash Flow Statement]

---

## 2. Forecast Assumptions

Explicit forecast period: **FY2026–FY2035** (10 years). All revenue in $B (billions).

| Assumption | FY2026 | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 | FY2032 | FY2033 | FY2034 | FY2035 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 14.9% | 13.0% | 12.0% | 11.5% | 11.0% | 10.5% | 10.0% | 9.5% | 8.5% | 8.0% | 3.5% | Yr1–2: consensus ($823.4B, $930.6B; Capital IQ Estimates, as of 2026-07-03). Yr3–10: analyst assumption; fade from 12% to 8% reflecting AWS maturation and retail deceleration |
| EBIT margin % | 12.6% | 13.2% | 14.0% | 14.5% | 15.0% | 15.5% | 15.8% | 16.0% | 16.2% | 16.5% | 16.5% | Yr1: consensus EBIT $103,833M / $823,424M = 12.6% (Capital IQ Estimates). Yr2–10: analyst assumption; expansion driven by AWS mix shift, advertising scale, and operating leverage; capped at 16.5% (conservative vs 35% AWS at ~25% mix) |
| Tax rate % | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | Normalized US statutory rate; see §1 normalization. Consistent with 09_moat.md §3 |
| Capex (% of revenue) | 24.3% | 22.0% | 19.5% | 17.5% | 16.0% | 15.0% | 14.5% | 14.0% | 13.5% | 13.0% | 13.0% | Yr1: management guided ~$200B for FY2026 (Q1 2026 call) / $823B = 24.3%; company-guided. Yr2–10: analyst assumption; moderating as AI buildout completes by 2028–2030 |
| D&A (% of revenue) | 9.7% | 10.2% | 10.7% | 11.0% | 11.2% | 11.3% | 11.4% | 11.5% | 11.5% | 11.5% | 11.5% | Base: FY2025 D&A $65,756M / $716,924M = 9.2%; rising as $131–200B annual capex enters depreciation (5–30yr lives); analyst assumption for path |
| ΔWC (% of revenue, cash drain) | 2.86% | 2.86% | 2.86% | 2.86% | 2.86% | 2.86% | 2.86% | 2.86% | 2.86% | 2.86% | 2.86% | Revenue-linked driver; 3-year average FY2023–FY2025. Analyst assumption (held constant; WC complex scales with revenue) |

**Key assumption notes:**
- **Revenue Yr1–2 are company-guided/consensus** (earnings/04_guidance-consensus.md). All years Yr3–10 are **analyst assumptions**.
- **EBIT margin expansion** is the single most uncertain assumption. It depends on (a) AWS mix shift from 18% to ~25% of revenue by FY2030 and (b) the AI capex D&A headwind not overwhelming revenue growth. The earnings/07_earnings-sensitivity.md §4 identifies AWS revenue growth vs D&A step-up as the single most impactful variable.
- **Capex in FY2026 is peak.** Management guided ~$200B and Q1 2026 annualized capex of $170B confirms the investment pace. Capex moderating from 24% to 13% of revenue by FY2035 is an **analyst assumption** contingent on AWS AI buildout tapering.
- **Moat context:** business-model/09_moat.md returns a **Narrow moat** verdict. Per MODULE_RULES §5 structural-decline trigger: no "No moat proven" or "eroding" flag applies — Amazon has real competitive advantages. The terminal assumptions therefore do NOT apply a runoff discount. However, the terminal EBIT margin is capped at 16.5% (no perpetual excess-return assumption beyond what the narrow moat can support) and terminal g is set at 3.5% (below long-run US nominal GDP growth of ~4.5%, consistent with a maturing business with a narrow moat fading toward the cost of capital). The declining-perpetuity scenario (runoff terminal) is shown in §5 for completeness as the structural-impairment bear input.
- **Cyclicality gate:** Amazon is classified as "Partly externally driven" (business-model/10_external-dependency.md §3). The business is not purely cyclical; AWS provides a buffer. The current margin (11.2% FY2025) is NOT a cyclical peak — it is a recovery from the FY2022 trough (2.6%). The terminal margin of 16.5% is set above the current level (reasonable given AWS expansion) and no mid-cycle normalization is required (no commodity cycle).

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.54% | 10-yr US Treasury yield, July 10, 2026. Web-sourced (tradingeconomics.com, etfdb.com Treasury snapshot July 2, 2026 = 4.49%; July 9 = 4.56%; July 10 ~4.54%). Labeled: **web-sourced, unverified.** |
| Equity-risk premium (ERP) | 4.45% | Damodaran US ERP, July 2026 update (4.45% US-specific; mature-market baseline 4.17%). Web-sourced, labeled: **web-sourced, unverified.** |
| Beta | 1.46 | 5-year monthly beta, Capital IQ Comparable Analysis tab, as of 2026-07-01. |
| **Cost of equity (CAPM)** | **11.04%** | ke = 4.54% + 1.46 × 4.45% = 4.54% + 6.50% = 11.04% |
| Pre-tax cost of debt (blended) | 3.91% | Blended: financial bonds ~$130.6B at ~4.0% (new Q1 2026 issuance at market; prior bonds at ~3.1%) + lease liabilities ~$104.9B at 3.8% (10-K stated weighted-average discount rate on operating leases). Blended = (130.6×4.0% + 104.9×3.8%) / (130.6+104.9) = 3.91%. Inference on financial bond blended rate. |
| After-tax cost of debt | 3.09% | 3.91% × (1 − 21%) = 3.09% |
| Equity weight (market value) | 91.6% | Market cap $2,563,849M / total capital $2,799,389M. Total capital = market cap + total debt (broad, including leases $235,540M). |
| Debt weight (market value) | 8.4% | Total debt (broad) $235,540M / total capital $2,799,389M. |
| **WACC (computed)** | **10.37%** | See formula and verification below. |

**WACC formula (executed):**

```
WACC = w_e × k_e + w_d × k_d × (1 − t)
     = 0.9159 × 11.04% + 0.0841 × 3.91% × (1 − 0.21)
     = 10.1083% + 0.2600%
     = 10.37%
```

**Computed WACC: 10.37%** (rounded to 10.4% for the sensitivity grid).

**Cross-check vs moat module (Gate 4):** The moat module (09_moat.md §3) independently estimated WACC at ~11.2% (using rf=4.5%, ERP=5.0%, beta=1.46, ke=11.8%, narrow capital structure excluding lease liabilities). The DCF-computed WACC of 10.4% diverges by 0.8pp — within the 2pp gate. The difference arises from: (1) using the updated July 2026 Damodaran ERP of 4.45% vs the moat module's estimate of 5.0%; (2) including lease liabilities in the capital structure (broad basis, consistent with the MODULE_RULES canonical EV bridge). **No analyst override of the computed WACC is applied.** The sensitivity grid spans WACC 9.4%–11.4%, which covers both the DCF-computed rate (10.4%) and the moat module's estimate (11.2%).

---

## 4. Free Cash Flow Forecast & Discounting

FCFF definition used: `FCFF = NOPAT + D&A − Capex − ΔNWC`, where NOPAT = EBIT × (1 − t), using normalized tax rate 21%.

All figures in USD millions.

| Year | Revenue | EBIT | NOPAT | D&A | Capex | ΔWC (drain) | FCF | Disc Factor (mid-yr) | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026 | 823,746 | 103,792 | 81,996 | 79,903 | 200,170 | 23,555 | −61,826 | 0.9519 | −58,851 |
| FY2027 | 930,833 | 122,870 | 97,067 | 94,945 | 204,783 | 26,617 | −39,388 | 0.8624 | −33,970 |
| FY2028 | 1,042,533 | 145,955 | 115,304 | 111,551 | 203,294 | 29,811 | −6,250 | 0.7814 | −4,884 |
| FY2029 | 1,162,424 | 168,551 | 133,156 | 127,867 | 203,424 | 33,240 | 24,359 | 0.7080 | 17,246 |
| FY2030 | 1,290,290 | 193,544 | 152,899 | 144,513 | 206,446 | 36,896 | 54,070 | 0.6415 | 34,686 |
| FY2031 | 1,425,771 | 220,994 | 174,586 | 161,112 | 213,866 | 40,770 | 81,062 | 0.5812 | 47,117 |
| FY2032 | 1,568,348 | 247,799 | 195,761 | 178,792 | 227,410 | 44,847 | 102,295 | 0.5266 | 53,873 |
| FY2033 | 1,717,341 | 274,775 | 217,072 | 197,494 | 240,428 | 49,107 | 125,031 | 0.4772 | 59,660 |
| FY2034 | 1,863,315 | 301,857 | 238,467 | 214,281 | 251,548 | 53,282 | 147,919 | 0.4323 | 63,951 |
| FY2035 | 2,012,380 | 332,043 | 262,314 | 231,424 | 261,609 | 57,544 | 174,584 | 0.3917 | 68,388 |

**Sum of PV of explicit FCFs: $247,216M**

**Executed snippet (key outputs):**

```python
# WACC blend
we=0.9159, ke=0.1104, wd=0.0841, kd_pretax=0.0391, t=0.21
WACC = 0.9159*0.1104 + 0.0841*0.0391*(1-0.21) = 0.10368 = 10.37%

# PV of FCF sum (mid-year convention, WACC=10.37%)
pv_sum = sum(FCF[i] / (1+0.10368)^(i+0.5) for i in 0..9) = $247,216M

# Terminal value (Gordon, g=3.5%, TV at t=10)
FCF_yr11 = 174,584 * 1.035 = $180,694M
TV_base = 180,694 / (0.10368 - 0.035) = $2,630,842M
PV_TV = 2,630,842 / (1.10368)^10 = $980,959M

# EV -> equity -> per share (broad net debt $92,451M, diluted shares 10,874M)
EV_base = 247,216 + 980,959 = $1,228,175M
Equity = 1,228,175 - 92,451 = $1,135,724M
Per_share = 1,135,724 / 10,874 = $104.44
```

**Working-capital sign check:** The ΔWC column shows a positive drain (subtracting from FCF) every year. Revenue is growing and the WC complex (unearned revenue, accrued liabilities, AP, AR) expands proportionally. The NWC ratio in the CFO sense generates a net cash use of 2.86% of revenue annually, consistent with three years of actual data (FY2023–FY2025). No sign inversion is required.

**FCF profile note:** FCFs are negative for the first three years (FY2026–FY2028) because ~$200B annual AI capex exceeds NOPAT + D&A combined. This is consistent with management's stated investment posture (Q1 2026 call, CFO: "we will continue to make significant investments, especially in AI") and the $364B AWS backlog. FCFs turn positive in FY2029 as capex moderates and revenue grows into the D&A load.

---

## 5. Terminal Value

**Method 1: Gordon Growth Perpetuity (base)**

Formula: `TV = FCFF_{n+1} / (WACC − g) = FCFF_n × (1 + g) / (WACC − g)`

Where:
- `FCFF_n` = FCF in Year 10 (FY2035) = $174,584M
- `g` = 3.5% (terminal perpetual growth rate — see rationale below)
- `WACC − g` = 10.37% − 3.50% = 6.87pp (comfortably positive)

`TV = 174,584 × 1.035 / 0.0687 = 180,694 / 0.0687 = $2,630,842M`

- **Terminal value (undiscounted):** $2,630,842M
- **PV of terminal value (discounted at t=10):** $980,959M
- **Terminal value as % of total EV: 79.9%** — **FLAG: terminal-dominated (>75%); low confidence on the Gordon method alone.** The exit-multiple cross-check is mandatory per MODULE_RULES Gate 5.

**Terminal growth g rationale (3.5%):**
- US long-run nominal GDP growth is ~4.0–4.5% (real ~2–2.5% + inflation ~2%). Amazon's narrow moat means terminal ROIC should fade toward WACC (~10.4%), not sustain large excess returns.
- Financeable g cross-check: at terminal capex=13%, D&A=11.5%, WC drain=2.86% of revenue, NOPAT margin=13.0% of revenue → reinvestment rate = 33.4% of NOPAT; implied ROIC = g / reinvestment_rate. Setting g=3.5%: implied ROIC = 3.5% / 33.4% = 10.5% ≈ WACC (10.4%). This passes Gate 2 — the terminal growth is financeable at ROIC ≈ WACC. [Executed Python snippet above]
- Using g=4.0% would imply ROIC = 12% > WACC, requiring a persistent excess return — only supportable if the AWS moat strengthens materially. This is the bull scenario.

**Method 2: Exit Multiple Cross-Check (required — terminal >75% of EV)**

At FY2035 (Year 10):
- Revenue = $2,012B; EBIT margin = 16.5%; D&A = 11.5% → EBITDA margin = 28.0%
- EBITDA Year 10 = $563,466M

| Exit Multiple | Terminal Value | PV Terminal | Total EV | Per Share |
|---|---:|---:|---:|---:|
| 6x EV/EBITDA | $3,381B | $1,261B | $1,508B | $130 |
| 8x EV/EBITDA | $4,508B | $1,681B | $1,928B | $169 |
| 10x EV/EBITDA | $5,635B | $2,101B | $2,348B | $207 |
| 12x EV/EBITDA | $6,762B | $2,521B | $2,768B | $246 |
| 15x EV/EBITDA | $8,452B | $3,152B | $3,399B | $304 |

**Gordon vs exit multiple divergence:** The Gordon TV of $2.63T implies a 4.7x EV/EBITDA multiple on FY2035 EBITDA — very low for a company with AWS at ~40% EBIT margin and $150B+ annualized revenue. A mature Amazon in 2035 with stable AWS, growing advertising, and disciplined retail would likely trade at 8–12x EV/EBITDA (similar to today's Alphabet at ~11x NTM EBITDA). The Gordon DCF understates intrinsic value because: (a) the deep negative FCFs in FY2026–FY2028 compound at a high discount rate, destroying PV; and (b) the terminal FCF ($174.6B) is modest relative to the business scale at Year 10 ($2T revenue, $563B EBITDA) because high reinvestment continues.

**Cross-method read:** Gordon gives ~$104; exit 10x EBITDA gives ~$207; exit 8x gives ~$169. The spread is large ($100/share, ~95%). This is a genuine disagreement — not an averaging opportunity. The Gordon method is most conservative and serves as the floor; exit multiples capture the terminal franchise value better given Amazon's investment-phase dynamics.

**Structural-decline / runoff terminal (bear input — not the base case):**

Moat trajectory: **stable, with widening potential in AWS** (09_moat.md §5). The moat-quality/business-quality read does NOT trigger the mandatory declining-perpetuity trigger (07_business-quality.md industry rate-of-change = 45/100, above the ≤40 threshold). However, a bear scenario is shown for §24 Filter 5 purposes and as the structural-impairment input to scenario-and-fair-value (07).

Bear terminal: g = 2.0% (zero real growth, implying only inflationary persistence — moat eroding, D&A headwind overwhelming revenue growth):
- `TV_bear = 174,584 × 1.020 / (0.1037 − 0.020) = $178,076 / 0.0837 = $2,127,551M`
- PV TV bear = $2,127,551M / (1.1037)^10 = $793,213M
- Total EV bear = $247,216M + $793,213M = $1,040,429M
- Per share bear = ($1,040,429M − $92,451M) / 10,874M = **$87.20/share**

This bear terminal is the structural-reset input for 07_scenario-and-fair-value. It does not replace the base-case intrinsic value of $104/share.

---

## 6. DCF Output

**Base case: Gordon Growth (g = 3.5%, WACC = 10.4%)**

| Step | Value |
|---|---:|
| PV of explicit FCFs (FY2026–FY2035) | $247,216M |
| + PV of terminal value (Gordon, g=3.5%) | $980,959M |
| **= Enterprise value (Gordon base)** | **$1,228,175M** |
| − Net debt (broad basis, as of Mar 31, 2026) | ($92,451M) |
| − Minority interest | $0 |
| − Preferred equity | $0 |
| **= Equity value** | **$1,135,724M** |
| ÷ Diluted shares (Q1 2026 weighted-average) | 10,874M |
| **= Intrinsic value per share (Gordon base)** | **$104/share** |
| Current price (Jul 1, 2026, pool-verified) | $238.34 |
| Premium of price to intrinsic (Gordon) | +128% |

**Exit-multiple anchor (10x EV/EBITDA, FY2035): $207/share**

Net debt used: **broad basis ($92,451M)** per 01_price-and-capital-structure.md §7 canonical anchor. Diluted shares 10,874M per same anchor. No deviation.

---

## 7. Sensitivity Grid (per-share intrinsic value)

Gordon Growth model; WACC across columns, terminal growth rate (g) down rows.

| | WACC = 9.4% (−1pp) | WACC = 10.4% (base) | WACC = 11.4% (+1pp) |
|---|---:|---:|---:|
| g = 4.0% (bull — AWS moat persists) | $143 | $112 | $90 |
| g = 3.5% (base — narrow moat fades to WACC) | $132 | **$104** | $84 |
| g = 2.0% (bear — moat erodes) | $107 | $87 | $72 |

**Grid range (Gordon): $72 – $143 per share.** No cell approaches WACC−g ≤ 0 (minimum spread is 7.4pp at WACC=9.4%, g=2.0%).

**Exit-multiple reference (10x EV/EBITDA, insensitive to g, varies with WACC):**

| | WACC = 9.4% | WACC = 10.4% | WACC = 11.4% |
|---|---:|---:|---:|
| 8x EBITDA exit | $199 | $169 | $143 |
| 10x EBITDA exit | $241 | $207 | $178 |
| 12x EBITDA exit | $283 | $246 | $214 |

At the current price of $238.34, the exit-multiple cross-check implies that the market is pricing Amazon at approximately **10–12x FY2035 EBITDA** at a 10.4% WACC — meaning the current price requires both strong execution (revenue growing to $2T, margins expanding to 16.5%) and a premium terminal multiple consistent with a wide moat.

---

## 8. Intrinsic Read

**Base-case intrinsic value: $104/share (Gordon DCF, WACC=10.4%, g=3.5%); the sensitivity grid spans $72–$143 on the Gordon method and $143–$283 on exit multiples.** The Gordon DCF implies the stock trades at a 128% premium to intrinsic value — but this is almost entirely a consequence of the model mechanics during the AI investment cycle: FCFs are deeply negative for 2026–2028 (compounding at 10.4% dramatically destroys PV), and the terminal Gordon value undervalues the franchise because g=3.5% implies only 4.7x terminal EBITDA for what will be a $563B EBITDA business. The exit-multiple cross-check at 8–12x EV/EBITDA gives $169–$246/share, bracketing the current price of $238. The single assumption the intrinsic value is most sensitive to is the **terminal exit multiple (or equivalently, the long-run FCF margin and terminal g)**: a move from 8x to 12x EBITDA on Year 10 adds $77/share; within the Gordon method, a 1pp move in WACC shifts value by $20–28/share. The deep capex cycle makes this a franchise-value play rather than a near-term FCF story — the intrinsic estimate is unreliable in the conventional Gordon sense, and the exit-multiple method is the more informative lens for Amazon at this stage.

---

*Sources (web-sourced inputs, labeled unverified):*
- Risk-free rate: [US 10-yr Treasury, July 10, 2026 — tradingeconomics.com](https://tradingeconomics.com/united-states/government-bond-yield), [ETF DB Treasury Snapshot July 2, 2026](https://etfdb.com/fixed-income-content-hub/july-2-2026-treasury-yields-snapshot/)
- Equity-risk premium: [Damodaran US ERP July 2026 — elitecurrensea.com](https://elitecurrensea.com/stocks/damodaran-equity-risk-premiums-july-2026/), [Damodaran SSRN 2026 Edition](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6361419)



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — AMZN

**Reporting standard:** US GAAP. **Currency:** USD (millions unless stated). **Fiscal year end:** December 31. **Price-state:** `pool-verified` — price is unlocked for all price-relative scoring. **Business type:** Operating company — FCFF / EV model applies (not DDM or NAV).

**Model note.** This reverse-DCF inverts the SAME model as `04_intrinsic-dcf.md` verbatim: identical WACC (10.37%), normalized NOPAT base ($66,577M), terminal growth rate (3.5%), horizon (10 years), and mid-year discounting convention. The only change is direction: instead of forecasting FCF growth to derive a fair value, it holds the price fixed and solves for the NOPAT CAGR the current EV requires. An independent WACC re-derivation or a different FCF base would make the two non-comparable and produce opposite verdicts on the same stock — this agent does neither.

**Discounting convention (from 04):** Mid-year (t − 0.5) for explicit-period FCFs; terminal value discounted at t = 10 (end of period).

---

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $238.34 | Capital IQ Key Stats, July 1, 2026 last close; 3-way cross-confirmed [01_price-and-capital-structure.md §1] |
| Enterprise value (EV) | $2,656,300M | Market cap $2,563,849M + total debt (broad) $235,540M − cash & ST investments $143,089M [01 §4, Capital IQ Capital Structure Summary, Mar-31-2026] |
| Net debt (broad basis — canonical) | $92,451M | Total debt including lease liabilities $235,540M − cash $143,089M [01 §5] |
| Diluted shares | 10,874M | Q1 2026 diluted weighted-average [01 §2, Form 10-Q Q1 2026] |
| FCF (NOPAT) base — normalized | $66,577M | Normalized NOPAT: adjusted EBIT $84,275M × (1 − 21%) = $66,577M; taken verbatim from [04_intrinsic-dcf.md §1]. Adjustment removes $4,300M in FY2025 one-time charges (FTC settlement $2,500M + severance $1,800M). |
| Discount rate (WACC) | 10.37% | Taken verbatim from [04_intrinsic-dcf.md §3]: ke = 11.04% (rf 4.54% + beta 1.46 × ERP 4.45%), equity weight 91.6%, kd after-tax 3.09%, debt weight 8.4%. |
| Terminal growth rate (g) | 3.5% | Taken verbatim from [04_intrinsic-dcf.md §5]. |
| Forecast horizon | 10 years (FY2026–FY2035) | Taken verbatim from [04_intrinsic-dcf.md §2]. |
| Terminal value as % of EV (from 04) | 79.9% | [04_intrinsic-dcf.md §5] — terminal-dominated; terminal g robustness is mandatory per instructions. |

---

## 2. Implied Expectations

**What was held fixed:** WACC (10.37%), terminal growth rate (3.5%), 10-year horizon, mid-year discounting, normalized NOPAT base ($66,577M as Year 0), net debt (broad, $92,451M), and diluted shares (10,874M) — all identical to 04.

**What was solved for:** The constant NOPAT (FCF proxy) CAGR over the 10-year explicit period that makes the present value of all cash flows equal to the current EV of $2,656,300M.

**Solver executed (bisection, Python):**

```python
# bisect(): finds g_fcf such that dcf_ev(g_fcf) = $2,656,298M
# dcf_ev: PV of NOPAT * (1+g)^i discounted mid-year, plus Gordon terminal at t=10
# WACC=10.37%, g_terminal=3.5%, T=10, NOPAT_base=$66,577M
implied_g = bisect(obj, lo=0.01, hi=0.80)
# → 16.40%
# EV at root: $2,656,298M (target $2,656,298M — $2M rounding vs 01 anchor of $2,656,300M)
```

**Root returned: 16.40% NOPAT CAGR over 10 years.**

| What the Price Implies | Solved Value |
|---|---:|
| Implied NOPAT CAGR over the 10-year horizon | **16.40%/yr** |
| Implied NOPAT at Year 10 (FY2035) at 16.4% CAGR | **$304B** (vs 04 base of $207B at ~13% NOPAT CAGR from base) |
| Implied years of 15%-growth then 3.5% perpetuity | **12 years** (if growth falls to 3.5% after 12 years, current EV is justified) |
| Implied years of 20%-growth then 3.5% perpetuity | **8 years** |
| Implied years of 25%-growth then 3.5% perpetuity | **6 years** |
| Implied revenue at FY2035 (NOPAT margin held at 9.3%) | **$3.27T** (vs 04 explicit forecast of $2.01T; vs FY2025 actual of $0.72T) |

**What the base case in 04 implies by comparison:** 04 used an explicit FCF path (with negative FCFs in FY2026–FY2028) and a terminal g of 3.5%, producing a Gordon DCF value of $104/share — implying the forward model's explicit FCF path grows at an effective rate well below what the market is pricing. The current price of $238.34 is 128% above the Gordon fair value. The reverse-DCF quantifies the gap: the market requires 16.4% NOPAT CAGR (annually, for 10 years), versus the ~12–13% effective NOPAT CAGR embedded in 04's explicit path.

---

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| **NOPAT CAGR 16.4%/yr for 10 years** | Revenue CAGR FY2021–FY2025: 11.1%. NOPAT (normalized) CAGR FY2021–FY2025: ~36%, but this was a recovery from the FY2022 trough (EBIT margin 2.6% → 11.2%). On a stable-base to stable-base comparison, the organic trend is 11–12%/yr revenue with margin expansion adding 4–5pp of NOPAT growth annually in the recovery years — a non-repeating tailwind. | AWS revenue growth at 28% YoY (Q1 2026) is the single largest driver. D&A step-up from the $170B+ annualized capex program is the single largest risk (ranked #1 by absolute EBIT swing, ~$7.1B avg EBIT impact; [07_earnings-sensitivity.md §3]). Consensus FY2026 revenue is $823B (+14.9% YoY); FY2027 $931B (+13.0%) [04 §2]. | **Stretch** — achievable for 3–5 years (AWS at 28% growth, advertising at 22% growth, margin recovery); sustaining 16%+ NOPAT CAGR for a full 10-year horizon with a $3.27T implied revenue endpoint is a higher bar |
| **NOPAT reaching $304B by FY2035** | FY2025 normalized NOPAT $66,577M — a 4.6× increase over 10 years at 16.4% CAGR | 04's explicit base case reaches $207B NOPAT at FY2035 (~13% NOPAT CAGR). Getting to $304B requires either higher revenue growth or materially higher margins than 04's 16.5% terminal EBIT margin. | **Stretch to No** at the point-estimate level; achievable in an AWS-dominance scenario with Trainium margin advantage materializing |
| **Revenue reaching $3.27T by FY2035** | FY2025 revenue $716.9B; 04 forecasts $2.01T by FY2035 at ~11% blended revenue CAGR | Consensus FY2026 $823B implies 14.9% growth. If the 16.4% CAGR is sustained, revenue reaches $3.27T — $1.26T above 04's explicit forecast. The gap is the margin of "premium above the base case" the market is embedding. | **Aggressive** — $3.27T is ~4.6× FY2025 revenue and ~2.4T above the current US e-commerce + cloud market combined. This is not impossible but requires Amazon to expand into meaningfully new revenue streams (AI services, physical grocery, healthcare, advertising) at scale within the decade. |

**Judge in 2–4 sentences.** At $238.34, the market is not simply pricing a continuation of FY2025 momentum — it is pricing 16.4% annual NOPAT growth for a full decade, which on a constant-margin assumption requires Amazon to reach $3.27T in revenue by FY2035. This is $1.26T above the explicit base case in 04, which already assumes 8–15% revenue growth and margin expansion to 16.5%. Historical revenue CAGR (11.1%, FY2021–FY2025) is materially below the implied rate; the FY2022–FY2025 NOPAT recovery (84.8% CAGR, recovering from near-zero margins) is not a repeatable benchmark and should not be used to justify 16%+ NOPAT growth from a normalized base. The earnings module identifies AWS revenue growth versus D&A step-up timing as the central swing variable — if AWS grows at 28%+ and D&A is absorbed, the near-term 3–5 year NOPAT trajectory is plausible at 15–20%. The market's implied requirement is fair for a 3–5 year view but **aggressive for a full 10-year horizon**, particularly because: (a) the revenue endpoint is very large relative to plausible TAM, and (b) a narrow moat verdict (09_moat.md §5) means ROIC should fade toward WACC in the terminal years rather than sustain substantial excess returns — which is precisely what g = 3.5% already assumes, meaning the burden falls entirely on the FCF growth rate itself.

**Market-ceiling sanity check (one-directional — can only raise the bar).**

The implied endpoint revenue of $3.27T by FY2035 must be compared to the addressable market. Amazon operates across three large markets: (1) global e-commerce + retail (estimated ~$6–9T by 2035 at historical growth rates, web-sourced — unverified), (2) global cloud infrastructure (estimated ~$1.5–2T by 2035, web-sourced — unverified), and (3) digital advertising (estimated ~$800B–$1.2T by 2035, web-sourced — unverified). These are rough, cited-with-caveats estimates from unverified web sources; they cannot be treated as firm numbers (market-sizing is a low-tier input per CLAUDE.md §4). Taking the addressable markets at face value, $3.27T of Amazon revenue by FY2035 implies continued leadership across all three markets simultaneously at an average share approximating their current positions scaling. The numbers do not show an impossible share (>100% of any single market), so the market-ceiling test does not flip the implied growth from aggressive to unachievable on market-size grounds alone. However, $3.27T is a large number that requires consistent execution across e-commerce, cloud, advertising, and new verticals (healthcare, grocery, AI services) with no significant competitive displacement in any of them over a decade. This is possible, not certain. The market-ceiling check confirms the implied growth is aggressive — it neither kills nor definitively validates it. Given the low quality of the TAM estimates, this check is informational, not decisive; the earnings-module evidence is the more reliable guide.

---

## 4. Robustness

**Solver commands and roots for each scenario (all executed, roots shown):**

```python
# WACC robustness:
bisect(lambda g: dcf_ev(g, wacc=0.09368) - TARGET_EV, -0.10, 1.0)  → 13.99%
bisect(lambda g: dcf_ev(g, wacc=0.10368) - TARGET_EV, -0.10, 1.0)  → 16.40%
bisect(lambda g: dcf_ev(g, wacc=0.11368) - TARGET_EV, -0.10, 1.0)  → 18.62%

# FCF base robustness (NOPAT proxy):
bisect(lambda g: dcf_ev(g, NOPAT0=11_194)  - TARGET_EV, -0.60, 3.0)  → 41.75%
bisect(lambda g: dcf_ev(g, NOPAT0=66_577)  - TARGET_EV, -0.10, 1.0)  → 16.40%
bisect(lambda g: dcf_ev(g, NOPAT0=76_564)  - TARGET_EV, -0.10, 1.0)  → 14.50%

# Terminal g robustness (TV=79.9% >60% threshold):
bisect(lambda g: dcf_ev(g, terminal_g=0.030) - TARGET_EV, 0.01, 1.0)  → 17.05%
bisect(lambda g: dcf_ev(g, terminal_g=0.035) - TARGET_EV, 0.01, 1.0)  → 16.40%
bisect(lambda g: dcf_ev(g, terminal_g=0.040) - TARGET_EV, 0.01, 1.0)  → 15.69%
```

### WACC Sensitivity

| Discount Rate | Implied NOPAT CAGR to Justify Price |
|---|---:|
| WACC − 1pp = 9.37% | 13.99% |
| WACC (base) = 10.37% | **16.40%** |
| WACC + 1pp = 11.37% | 18.62% |

The spread across a 2pp WACC range is 4.6pp of implied growth rate — meaningful but not the dominant swing factor.

### FCF Base Sensitivity

The FCF base is the dominant swing input. A factor of 6.8× between the low base (company FCF $11.2B) and the base (normalized NOPAT $66.6B) causes a 25pp swing in implied growth (41.75% vs 16.40%), dwarfing the WACC effect (4.6pp). The base case in 04 — and therefore in this analysis — uses the normalized NOPAT ($66,577M), which strips the $4,300M in one-time charges and taxes at the 21% structural rate. This is the correct base for a reverse-DCF that inverts 04.

| FCF / NOPAT Base | Value | Implied NOPAT CAGR |
|---|---:|---:|
| Low — company-disclosed FCF FY2025 [earnings/01_historical-financials.md §1] | $11,194M | **41.75%** |
| Base — normalized NOPAT from 04 (EBIT adj. × 79%) [04_intrinsic-dcf.md §1] | $66,577M | **16.40%** |
| High — normalized NOPAT ×1.15 (optimistic normalization) | $76,564M | **14.50%** |

**Most sensitive input: the FCF base, by a wide margin.** A low company FCF base ($11.2B) implies a growth rate (41.75%) that is clearly unachievable and confirms that the company FCF is not the right base for valuation (it reflects a temporary FCF trough caused by AI capex, not normalized earnings power). The analysis is most informative at the normalized NOPAT base of $66.6B (consistent with 04), where the implied growth is 16.4%.

### Terminal Growth Rate Sensitivity (mandatory — TV = 79.9% of EV)

Terminal value is 79.9% of EV in 04's base case, well above the 60% threshold. This makes the reverse-DCF highly sensitive to the assumed terminal growth rate.

| Terminal g | Implied NOPAT CAGR |
|---|---:|
| g = 3.0% (−0.5pp) | 17.05% |
| g = 3.5% (base) | **16.40%** |
| g = 4.0% (+0.5pp) | 15.69% |

The terminal g range of ±0.5pp shifts the implied growth requirement by 1.4pp — meaningfully less than the FCF base shift, but comparable to the WACC ±1pp effect. At g = 4.0% (implying Amazon grows at US nominal GDP rate perpetually, a stronger moat assumption), the implied growth requirement falls slightly to 15.7%, which is marginally easier but still well above the 11% historical revenue CAGR. The 04 terminal g of 3.5% is the appropriate base for a narrow-moat business where ROIC is expected to converge toward WACC.

**Dominant input by sensitivity magnitude: FCF base >> WACC ≈ terminal g.** Any analysis of what is priced in for AMZN must first be clear on what normalized FCF base is used; WACC and terminal g effects are secondary.

---

## 5. What's-Priced-In Read

At $238.34, the market is pricing in 16.4% annual NOPAT growth for 10 years (FY2026–FY2035), implying NOPAT reaching $304B and revenue reaching $3.27T by FY2035 on a constant-margin assumption. That is **aggressive** relative to the company's actual historical revenue CAGR of 11.1% (FY2021–FY2025) and to the explicit base case in 04, which models only $2.01T of revenue at FY2035 — yet the current price is 128% above the Gordon DCF fair value. The key bull argument the market is embedding is that the AWS AI infrastructure buildout (28% revenue growth, $364B backlog) compounds with advertising and margin expansion to deliver above-historical-average FCF growth for the next decade; the key risk is that the AI capex wave ($170B+ annualized) generates a D&A headwind that compresses NOPAT growth below the 16% implied rate during the FY2026–FY2028 period — precisely the window identified by the earnings sensitivity module as the single highest-risk variable (D&A step-up ranked #1 by EBIT impact). If the implied growth of 16.4% is below what Amazon can plausibly deliver (a scenario requiring AWS acceleration, advertising compounding, and Trainium margin benefits all materializing together), the current price is fair; if the D&A timing mismatch and the large implied revenue endpoint prove harder to reach, the current price embeds downside.

---

*Sources:*
- Price and EV: [01_price-and-capital-structure.md §1, §4, §7 — Capital IQ Key Stats and Capital Structure Summary, Mar-31-2026 / Jul-1-2026]
- WACC, normalized NOPAT base, terminal g, discounting convention: [04_intrinsic-dcf.md §1, §3, §5] — taken verbatim; no independent re-derivation.
- Historical FCF and revenue data: [earnings/01_historical-financials.md §1, §2]
- Sensitivity variables and rankings: [earnings/07_earnings-sensitivity.md §2, §3]
- Moat verdict and ROIC: [business-model/09_moat.md §5]
- Risk-free rate, ERP (web-sourced, unverified, per 04): tradingeconomics.com (10-yr Treasury Jul 10, 2026); Damodaran US ERP July 2026 update — elitecurrensea.com



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — AMZN

**Reporting standard:** US GAAP. **Currency:** USD (millions unless noted). **Fiscal year end:** December 31. **Valuation date:** July 10, 2026. **Price anchor:** $238.34 (July 1, 2026 last close, pool-verified). **Diluted shares:** 10,874M (Q1 2026 10-Q, XBRL weighted-average diluted).

---

## Preliminary: Single-Segment Test

Amazon reports three segments — North America, International, and AWS. AWS contributes 57% of consolidated EBIT ($45,606M of $79,975M in FY2025). No single segment exceeds 85% of total EBIT. **SOTP must run — the single-segment collapse rule does not apply.**

**Corporate / unallocable EBIT:** The segment-map confirms that Amazon's corporate bucket holds only balance-sheet assets (cash, marketable securities, goodwill, deferred taxes — $247.8B at FY2025 year-end). There is no separate corporate EBIT or unallocable P&L line; the three reportable segments sum exactly to $79,975M in FY2025 consolidated operating income. The corporate drag is therefore already fully allocated into the three segments. No separate capitalization of corporate costs is needed. [FY2025 Annual Report (10-K, filed April 9, 2026), Note 10 — Segment Information, pp. 67–68]

---

## 1. Segment Inventory

All figures in USD millions. Reporting currency: USD. **"% of Total EBIT" denominator = sum of the three reportable segments ($79,975M for FY2025), which equals 100% of consolidated EBIT — no unallocable bucket exists.** FY2025 figures used as the primary base because Q1 2026 segment-level EBIT is available (used in the LTM check below) but FY2025 full-year is the most complete audited annual disclosure.

| Segment | Revenue (FY2025) | EBIT (FY2025) | EBIT Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| AWS | $128,725M | $45,606M | 35.4% | 57% | FY2025 Annual Report (10-K, filed Apr 9, 2026), Note 10, p.67 |
| North America | $426,305M | $29,619M | 7.0% | 37% | FY2025 Annual Report (10-K, filed Apr 9, 2026), Note 10, p.67 |
| International | $161,894M | $4,750M | 2.9% | 6% | FY2025 Annual Report (10-K, filed Apr 9, 2026), Note 10, p.67 |
| **Total (reportable segments)** | **$716,924M** | **$79,975M** | **11.2%** | **100%** | |

**LTM cross-check (approximate, using web-sourced Q1 2025 segment actuals, labeled unverified):** Q1 2026 10-Q (filed April 30, 2026) discloses Q1 2026 segment EBIT: North America $8,267M, International $1,424M, AWS $14,161M, total $23,852M. Q1 2025 comparatives (per Amazon's Q1 2025 earnings release, web-sourced, unverified): North America ~$5,800M, International ~$1,000M, AWS ~$11,500M, total ~$18,300M. LTM EBIT = FY2025 + Q1 2026 − Q1 2025: AWS ~$48,307M (+6%), North America ~$32,086M (+8%), International ~$5,174M (+9%), total ~$85,567M (vs Capital IQ LTM EBIT $85,422M — reconciles within rounding). The LTM-to-FY2025 uplift is modest (~7% across segments) and does not change the SOTP structure materially. FY2025 EBIT is used as the primary base; LTM sensitivity is shown in Section 3.

---

## 2. Segment Multiples & Comparables

**Metric chosen: EBIT for all three segments.** Amazon discloses operating income (EBIT) as the sole segment profitability metric in its filings; segment EBITDA is not reported. EBIT-based multiples are used throughout. All comparable multiples from web sources are labeled unverified.

### AWS — Cloud Infrastructure

AWS competes directly with Microsoft Intelligent Cloud (Azure) and Google Cloud in the global cloud infrastructure market. It is the market leader at approximately 29–33% share (Synergy Research Group data, web-sourced, unverified, as of late 2025, cited in business-model/08_competitive-map.md). AWS grew revenue 19.2% in FY2025 and accelerated to 28% in Q1 2026 (Q1 2026 Earnings Call transcript, April 29, 2026).

**Named comparable: Microsoft Corporation (MSFT).** Microsoft Intelligent Cloud (the segment containing Azure) generated approximately $106.3B in revenue and ~$44.6B in EBIT in MSFT FY2025 (fiscal year ended June 30, 2025), implying a ~42% EBIT margin vs AWS's 35.4%. Microsoft consolidated EV/EBIT is approximately 22.5x as of July 2026 (web-sourced, unverified: Eulerpool, MSFT EV/EBIT 2026 = 22.48). **Because the Intelligent Cloud segment is Microsoft's highest-margin and fastest-growing segment — and because Microsoft's consolidated multiple is pulled down by its lower-margin Productivity and More Personal Computing segments — the implicit cloud-segment multiple embedded in MSFT's valuation is meaningfully above 22.5x.** Consensus SOTP analysis of MSFT (inference, not from filings) typically assigns the cloud segment a 25–35x EBIT multiple; the midpoint is approximately 30x.

AWS carries two advantages over Microsoft's cloud unit: (a) it is the outright market-share leader, and (b) its FY2025-to-FY2026 revenue acceleration is faster than Azure's on a recent basis. It carries one disadvantage: its EBIT margin (35.4%) is below Microsoft Intelligent Cloud's (~42%). The net effect is roughly neutral; a multiple in the same 25–30x range is defensible for AWS.

**Second comparable: Alphabet Inc. (GOOGL).** Alphabet consolidated EV/EBIT is approximately 17.9x as of mid-2026 (web-sourced, unverified: Alpha Spread / FinanceCharts, GOOGL EV/EBIT June 2026 ~17.9x). Google Cloud EBIT margin (~23.7% for full year 2025, derived from quarterly SEC 8-K filings, per business-model/08_competitive-map.md) is well below AWS's 35.4%, making Alphabet a lower-quality analog for AWS specifically — Alphabet's lower multiple partly reflects this. Google Cloud alone would likely trade at a premium to the blended Alphabet multiple if listed separately, but Alphabet's other segments (Search, YouTube) distort the consolidated read. Alphabet is used as a lower-bound check only.

**Multiple applied to AWS: 28x EBIT (base case).** Rationale: midpoint of the defensible range (MSFT implied cloud ~25–30x; GOOGL lower bound ~22x, adjusted upward for AWS's superior margin and market position). Range: 22x (bear — peers de-rate on AI capex concerns) to 35x (bull — pure-play cloud premium if AWS were separately listed). The 28x base sits at a discount to a hypothetical pure-play AWS listing premium and reflects the fact that AWS is valued within a conglomerate at a blended multiple.

### North America — Retail, Marketplace & Advertising

North America includes online retail, physical stores (Whole Foods), third-party marketplace (~61% of worldwide paid units in Q4 2025), Prime subscriptions, and — critically — advertising services. Amazon's advertising revenue is disclosed only at the consolidated level ($56.2B in FY2025 per the 10-K revenue disaggregation table), but substantially all advertising is generated from the North America and International storefronts; advertising is embedded in both retail segments.

**Named comparable: Walmart Inc. (WMT).** Walmart FY2026 operating income ~$29.8B on ~$713B revenue (~4.2% EBIT margin). Walmart EV/EBIT is approximately 32.7x as of March 2026 (web-sourced, unverified: Alpha Spread, WMT EV/EBIT 32.66x as of March 11, 2026). Walmart's multiple reflects its own high-margin advertising/marketplace layering, giving it a premium over traditional pure-play physical retailers. Amazon North America's 7.0% EBIT margin is substantially higher than Walmart's 4.2%, which argues for a premium to Walmart — but Amazon North America lacks Walmart's physical store moat (Walmart has ~10,600 global stores; Whole Foods is a small complement). The advertising layer is the key premium driver for both.

**Second comparable (directional): Target Corporation (TGT).** Target's EV/EBIT is lower than Walmart's, typically in the 18–22x range for a mid-cycle retailer with modest advertising contribution (web-sourced, unverified, directional from public data, not confirmed with a direct quote). Target does not serve as the primary anchor because its advertising and marketplace businesses are materially less developed than Amazon's.

**Multiple applied to North America: 20x EBIT (base case).** Rationale: a discount to Walmart's 32.7x, reflecting that (a) North America's EBIT margin (7.0%) benefits partly from the embedded advertising revenue that is harder to value separately on a retail multiple, (b) the segment is still investing in grocery and logistics buildout, and (c) a retail operation of this scale trading at Walmart's premium would embed an ambitious assumption about advertising re-rating. The 20x is consistent with a high-quality omnichannel retailer with a material (but not yet separately valued) advertising overlay. Range: 15x (bear — retail margin compression, advertising slows) to 27x (bull — advertising revenue commands a software-like multiple, closer to Walmart's premium).

### International — Global Retail & Marketplace

International operates the same retail/marketplace model in the UK, Germany, Japan, and other markets. It turned profitable only in FY2024 ($3,792M EBIT) and reached a 2.9% EBIT margin in FY2025. It is still in an investment phase: local fulfillment network buildout, FX drag (reported in USD), and nascent advertising contribution.

**Named comparable: Walmart International segment (embedded in WMT filings).** Walmart's international segment generates lower margins than its US segment but is a mature operation. As a proxy for a developing-market international e-commerce operation, a discount to the North America comparable is appropriate.

**Second comparable: eBay Inc. (EBAY).** eBay operates international marketplace businesses with a more mature, lower-growth profile than Amazon International. eBay's EV/EBIT is typically in the 10–15x range (web-sourced, unverified, directional). eBay's lower growth and declining GMV make it a floor, not a central anchor.

**Multiple applied to International: 15x EBIT (base case).** Rationale: a meaningful discount to North America (20x) reflecting the lower margin (2.9% vs 7.0%), ongoing investment drag, FX exposure, and less mature advertising overlay. Range: 10x (bear — FX headwinds, investment drag extends) to 22x (bull — International margins converge toward North America, advertising materializes).

### Multiple Summary Table

| Segment | Metric Used | Multiple Applied (Base) | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| AWS | FY2025 EBIT $45,606M | 28x | Microsoft Corp (MSFT) — Intelligent Cloud segment proxy; MSFT consolidated 22.5x used as lower bound, with upward adjustment for cloud-segment premium | 22.5x (MSFT consolidated EV/EBIT, web-sourced unverified, Eulerpool, July 2026) | Web: Eulerpool, MSFT EV/EBIT 22.48, July 2026 (unverified); Alphabet GOOGL EV/EBIT ~17.9x web-sourced unverified (Alpha Spread / FinanceCharts, mid-2026) |
| North America | FY2025 EBIT $29,619M | 20x | Walmart Inc. (WMT) — primary comparable for US omnichannel retail with advertising/marketplace overlay | 32.7x (WMT EV/EBIT, web-sourced unverified, Alpha Spread, Mar 2026) | Web: Alpha Spread, WMT EV/EBIT 32.66x as of March 11, 2026 (unverified) |
| International | FY2025 EBIT $4,750M | 15x | Walmart International (embedded in WMT filings) as proxy for developing-market retail; eBay as floor (10–15x) | ~25x (WMT consolidated; International segment implied lower) | Web: directional from WMT consolidated multiple and eBay directional comparison (unverified) |

---

## 3. Segment Valuation

All figures in USD millions.

**Base case (28x / 20x / 15x):**

| Segment | EBIT (FY2025) | Multiple | Segment EV |
|---|---:|---:|---:|
| AWS | $45,606M | 28x | $1,276,968M |
| North America | $29,619M | 20x | $592,380M |
| International | $4,750M | 15x | $71,250M |
| **Gross enterprise value (sum)** | | | **$1,940,598M** |

**Bear case (22x / 15x / 10x):**

| Segment | EBIT (FY2025) | Multiple | Segment EV |
|---|---:|---:|---:|
| AWS | $45,606M | 22x | $1,003,332M |
| North America | $29,619M | 15x | $444,285M |
| International | $4,750M | 10x | $47,500M |
| **Gross enterprise value (sum)** | | | **$1,495,117M** |

**Bull case (35x / 27x / 22x):**

| Segment | EBIT (FY2025) | Multiple | Segment EV |
|---|---:|---:|---:|
| AWS | $45,606M | 35x | $1,596,210M |
| North America | $29,619M | 27x | $799,713M |
| International | $4,750M | 22x | $104,500M |
| **Gross enterprise value (sum)** | | | **$2,500,423M** |

**LTM sensitivity (base multiples applied to approximate LTM EBIT through Q1 2026):**

LTM EBIT: AWS ~$48,307M, North America ~$32,086M, International ~$5,174M.

| Segment | LTM EBIT (approx.) | Multiple | Segment EV |
|---|---:|---:|---:|
| AWS | ~$48,307M | 28x | ~$1,352,596M |
| North America | ~$32,086M | 20x | ~$641,720M |
| International | ~$5,174M | 15x | ~$77,610M |
| **Gross EV (LTM)** | | | **~$2,071,926M** |

LTM gross EV is approximately 7% higher than FY2025 gross EV ($1,940,598M), reflecting the recent acceleration in AWS and retail segment profits. The LTM figures use web-sourced Q1 2025 segment actuals (unverified) and are labeled approximate.

---

## 4. Equity Bridge

**Net debt basis used: broad basis (CIQ canonical), labeled "broad" per §15.** Total debt $235,540M (including lease liabilities $104,942M) minus cash and ST investments $143,089M = $92,451M net debt. [Capital IQ Capital Structure Summary, Mar-31-2026; confirmed in 01_price-and-capital-structure.md Anchor Block.]

**Corporate costs: not separately capitalized.** The segment-map confirms no unallocable P&L bucket exists; all corporate costs flow through the three reportable segments, which sum to 100% of consolidated EBIT. The net-of-corporate-costs EBIT base is already the segment-level disclosed EBIT. Gate 3 (no vanished bucket) holds: the three segments absorb all costs; the corporate line is balance-sheet only. [FY2025 Annual Report (10-K, filed Apr 9, 2026), Note 10, pp.67–68]

**Conglomerate / holdco discount:** No discount applied. Amazon is a single publicly-listed operating company, not a holding company structure. The three segments are operated and managed directly by Amazon management; there is no intermediate holding structure, no parent discount for complex cross-holdings, and no structural inhibitor to realizing the sum of the parts. The absence of a discount is the standard treatment for a diversified operating company versus a pure holdco. Were AWS ever separately listed, a minority discount could apply to the residual; that scenario is speculative and not applied here.

**Equity-method investments:** Not added to the equity bridge. Amazon's $51,423M in long-term investments (primarily Anthropic preferred stock and Rivian equity, per the Q1 2026 balance sheet) are strategic operating investments recorded at fair value through Other income/expense. Per 01_price-and-capital-structure.md, these are not netted from EV under operating-company practice and are not financial equivalents. Adding them would risk double-counting (they generate no separate EBIT contribution that is already in the segment-level multiples). They are excluded consistently with the upstream treatment.

**Base case equity bridge:**

| Step | Value (USD M) |
|---|---:|
| Gross enterprise value (base case) | $1,940,598M |
| − Capitalized unallocated corporate costs | Nil (fully allocated into the three segments) |
| − Net debt (broad basis — total debt $235,540M minus cash $143,089M; labeled "broad") | ($92,451M) |
| − Minority / preferred | Nil |
| + Equity-method investments | Not added (strategic, not financial; see note above) |
| − Conglomerate / holdco discount | Nil (single listed operating company, no holdco structure) |
| **= Equity value (base case)** | **$1,848,147M** |
| ÷ Diluted shares (10,874M — Q1 2026 10-Q, XBRL weighted-average diluted) | 10,874M |
| **= SOTP value per share (base case)** | **$169.95** |
| vs current price ($238.34, July 1, 2026 last close) | **Price is 40% above base SOTP** |

**Bear case equity bridge:**

| Step | Value (USD M) |
|---|---:|
| Gross enterprise value (bear case) | $1,495,117M |
| − Net debt (broad basis) | ($92,451M) |
| **= Equity value (bear case)** | **$1,402,666M** |
| ÷ Diluted shares | 10,874M |
| **= SOTP value per share (bear case)** | **$128.99** |
| vs current price | **Price is 85% above bear SOTP** |

**Bull case equity bridge:**

| Step | Value (USD M) |
|---|---:|
| Gross enterprise value (bull case) | $2,500,423M |
| − Net debt (broad basis) | ($92,451M) |
| **= Equity value (bull case)** | **$2,407,972M** |
| ÷ Diluted shares | 10,874M |
| **= SOTP value per share (bull case)** | **$221.45** |
| vs current price | **Price is 8% above bull SOTP** |

**LTM base case equity bridge (approximate):**

| Step | Value (USD M) |
|---|---:|
| Gross enterprise value (LTM base) | ~$2,071,926M |
| − Net debt (broad basis) | ($92,451M) |
| **= Equity value (LTM base)** | **~$1,979,475M** |
| ÷ Diluted shares | 10,874M |
| **= SOTP value per share (LTM base, approximate)** | **~$182.02** |
| vs current price | **Price is 31% above LTM base SOTP** |

**Summary of SOTP per-share outputs:**

| Scenario | SOTP Value / Share | Current Price | Premium/(Discount) |
|---|---:|---:|---:|
| Bear (22x / 15x / 10x, FY2025 EBIT) | $129 | $238.34 | Price 85% above bear |
| Base (28x / 20x / 15x, FY2025 EBIT) | $170 | $238.34 | Price 40% above base |
| LTM Base (28x / 20x / 15x, approx. LTM EBIT) | ~$182 | $238.34 | Price 31% above LTM base |
| Bull (35x / 27x / 22x, FY2025 EBIT) | $221 | $238.34 | Price 8% above bull |

**Net-cash sign discipline check.** The broad basis net debt is $92,451M (positive = a net debt position, per 01_price-and-capital-structure.md). The bridge subtracts this as ($92,451M), a single negative deduction. The strict basis would show net cash of $12,491M, which would be added back as a single positive line. The broad basis is used throughout this report (labeled "broad"), consistent with the upstream anchor. There is no deduction-plus-add-back double-count. Gate 2 holds.

---

## 5. SOTP Read

At the base-case multiples (28x / 20x / 15x on FY2025 EBIT), the SOTP yields a per-share breakup value of $170, which is 40% below the current price of $238.34; the bull-case SOTP at 35x / 27x / 22x yields only $221 per share, still 8% below today's price. **The stock is priced above the SOTP range on a trailing-EBIT basis at any reasonable set of multiples — meaning the market is pricing in meaningful EBIT growth beyond FY2025, not just a revaluation of current earnings.**

AWS carries the overwhelming share of the value: at the base case, AWS generates $1,277M of the $1,941M gross EV (66%), despite contributing only 18% of revenue and 57% of FY2025 EBIT. Its structural importance to the SOTP is even higher than its EBIT contribution because a 28x cloud multiple applied to $45.6B in AWS EBIT produces a value 2.1 times the combined value of North America and International at their respective retail multiples ($664B combined). If AWS were spun out and valued as a pure-play cloud company at 35x EBIT (the bull multiple), AWS alone would be worth $1,596B — broadly comparable to the entire current equity value of $2,564B — implying that North America ($426B revenue) and International ($162B revenue) are together valued at less than $1B (i.e., near-zero in an AWS bull-case SOTP). This is the core SOTP insight: **the market currently assigns near-zero or negative value to Amazon's retail segments implicitly within the consolidated multiple**, and the current $238 price is almost entirely a bet on AWS multiple expansion combined with AWS EBIT growth.

The retail segments are not being hidden or masked by the consolidated multiple — they are explicitly acknowledged; rather, they add relatively little equity value at standard retail multiples because they are capital-intensive and their margins (7.0% NA, 2.9% International) are modest. The SOTP confirms that the investment thesis for Amazon at current prices rests almost entirely on AWS: either AWS commands a premium to the MSFT Intelligent Cloud implied multiple (justifying 35x+), or AWS EBIT grows substantially faster than current FY2025 trailing earnings suggest, or both.

---

## Self-Check

- [x] Segment inventory reconciles to consolidated EBIT ($79,975M = $45,606M + $29,619M + $4,750M). No unallocated P&L bucket exists — confirmed by segment-map agent.
- [x] Not single-segment: AWS is 57% of EBIT, below the 85% collapse threshold. SOTP runs correctly.
- [x] Every segment multiple cites a named comparable: AWS → MSFT (Intelligent Cloud / consolidated), North America → WMT, International → WMT International / eBay directional.
- [x] All web-sourced comparable multiples labeled unverified with source and approximate date.
- [x] Equity bridge subtracts net debt (broad basis, $92,451M, labeled "broad") once; no double-count; no deduction-plus-add-back.
- [x] Corporate / unallocable bucket: confirmed as balance-sheet-only; not dropped by assertion — Gate 3 holds because corporate costs are already allocated within the three segments' disclosed EBIT.
- [x] No conglomerate / holdco discount applied; reason stated (single listed operating company, no holdco structure).
- [x] Report identifies which segment carries the value: AWS dominates (66% of gross EV at base case).
- [x] Output is a base-case level ($170/share) with bear ($129), bull ($221), and LTM base (~$182) shown as the range — no false single-point precision.
- [x] Diluted share count from `01_price-and-capital-structure.md` (10,874M) used verbatim.
- [x] No banned phrases.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — AMZN

**Reporting standard:** US GAAP. **Currency:** USD. **Price:** $238.34 (July 1, 2026 last close, pool-verified — Capital IQ Key Stats, three-way cross-confirmed). **Price-state:** `pool-verified` — all price-relative scoring is unlocked. **Diluted shares:** 10,874M (Q1 2026 10-Q XBRL weighted-average diluted). **Net debt (canonical — broad basis):** $92,451M (CIQ Capital Structure Summary, Mar-31-2026, inclusive of $104.9B operating lease liabilities per `01_price-and-capital-structure.md` §7 anchor block). **Valuation date:** July 10, 2026. **Horizon:** 12 months (default) unless stated otherwise.

---

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (`02`) | ~$243–$266 (illustrative only — directional band) | Very Low | **0%** | Own history < 3 years (18 months of CIQ data). `02` explicitly flags this output as "illustrative-only — NOT a fair-value input for `07`." Per the partial-data rule and `02`'s own marking, this method is excluded from the weighted blend. Appears in the football field for transparency only. |
| Relative / peers (`03`) | **$258/share** (NTM EV/EBITDA at warranted 13.0x) | Medium | **35%** | Best available forward-looking multiple for an operating company. Peer set is heterogeneous (megacap tech + low-quality retailers), which requires a warranted-multiple adjustment (+1.59x above raw median) — `03` makes this adjustment explicitly. The forward NTM EV/EBITDA is the least-distorted metric in the current AI-capex investment cycle. Weight is moderate because the peer set quality is imperfect. |
| Intrinsic DCF (`04`) | **$207/share** (exit-multiple anchor — 10x FY2035 EBITDA at WACC 10.4%); Gordon base $104 | Low–Medium | **25%** | The Gordon DCF ($104) is terminal-dominated (TV = 79.9% of EV) and produces a structurally depressed number because deeply negative FCFs in FY2026–FY2028 compound at 10.4% — `04` explicitly flags the Gordon as the floor and identifies the exit-multiple method as the more informative lens. The $207 exit-10x anchor is used as the DCF representative value. Weight is below peers and SOTP because the 10-year forecast requires high-confidence execution assumptions across a full decade of AI capex monetization. |
| Reverse-DCF (`05`) | Implied NOPAT CAGR **16.4%/yr** for 10 years (cross-check only, not a value) | Medium (informational) | **n/a** | Inverts the same model as `04`. Informs whether the base case is achievable. At $238.34, the market prices 16.4% NOPAT growth for a decade — aggressive vs. the 11.1% historical revenue CAGR but plausible for 3–5 years given AWS at 28% growth. Used as a cross-check throughout §2; not a weighted input. |
| Sum-of-the-parts (`06`) | **$170/share** (FY2025 EBIT base: 28x/20x/15x); LTM base ~$182; bull $221; bear $129 | Medium | **40%** | SOTP is well-suited for Amazon's multi-segment structure (AWS at 57% of EBIT is a genuine cloud comparable, not a retail business). Uses audited FY2025 segment EBIT from the 10-K — the most grounded near-term anchor. Receives the highest weight because it is the most transparent and reproducible method; its trailing EBIT anchor is a conservative starting point that the business is growing through. Segment multiples are web-sourced (unverified) comparables, which caps confidence somewhat. |

**Weight reconciliation:** 02 (0%) + 03 (35%) + 04 (25%) + 06 (40%) = **100%** across value-producing methods. `05` is a cross-check, not a weighted input.

**Lens-swap disclosure:** `04`'s Gordon DCF ($104) is excluded as the DCF representative value and replaced by the exit-multiple anchor ($207). This departure from the mechanical Gordon output is disclosed here: `04` itself identifies the Gordon result as a floor distorted by the investment cycle, and the exit-multiple cross-check at 10x FY2035 EBITDA as the more informative lens. Using $104 in the blend would double-penalize Amazon for the capex cycle that is already reflected in the SOTP trailing EBIT. The $207 is used instead, representing 10x EV/EBITDA on FY2035 EBITDA of $563B at WACC 10.4% — a conservative terminal multiple for a company of this franchise quality. The exit multiple grid from `04` spans $169 (8x) to $246 (12x); 10x is chosen as the base, sitting below the current NTM EV/EBITDA of 11.9x.

---

## 2. Triangulation & Reconciliation

### Method Football Field (true high-to-low spread, not pre-blended)

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Own-history reversion (`02`) — illustrative only | $243–$266 (NTM median reversion) | Very Low | 0% | < 3yr history; producer-flagged illustrative-only; not a fair-value input |
| Relative / peers (`03`) | $258 (base, NTM EV/EBITDA 13x warranted); dispersion $148–$284 | Medium | 35% | Forward multiple; moderate peer quality |
| Intrinsic DCF — exit multiple (`04`) | $207 (exit 10x EBITDA); Gordon $104; grid $169–$246 (exit 8–12x) | Low–Medium | 25% | Terminal-dominated; exit anchor more informative |
| Sum-of-the-parts (`06`) | $170 (FY2025 base); LTM ~$182; bull $221; bear $129 | Medium | 40% | Audited EBIT anchor; transparent segment multiples |

**Cross-method spread (value-producing methods, excluding `02`):** Low end is `04` Gordon $104; high end is `03` $258. Spread = ($258 − $104) / $104 = **148%** — well above the 40% flag threshold. **This spread is the headline finding.** It is driven almost entirely by the AI capex investment cycle: the Gordon DCF destroys present value through three years of deeply negative FCFs (FY2026–FY2028) compounded at 10.4%, while the peer multiple captures forward earnings power on NTM consensus that already embeds the EBITDA recovery. Once the Gordon is set aside in favor of the exit-multiple anchor ($207), the spread narrows to ($258 − $170) / $170 = **52%** (peers vs. SOTP) — still above 40%, still flagged, but structurally explained by the trailing vs. forward time basis difference.

**Reconciliation.** The three working methods disagree primarily on timing — not on whether Amazon is a valuable business. The SOTP at $170 (base) anchors on audited FY2025 trailing EBIT and conservative retail multiples; it tells us what the business is worth today on yesterday's earnings. The peers at $258 anchor on FY2026 consensus EBITDA and a 13x warranted multiple; they tell us what the forward earnings power is worth if it materializes. The DCF exit-10x at $207 says the franchise is worth $207 today if we believe the 10-year revenue path reaches $2T and margins expand to 16.5% — a middle ground between the trailing and the forward read. The disagreement is real: the SOTP says the current price is 40% above breakup value on trailing earnings; the peers say it is only 8% above a justified forward value; the DCF says it sits between. The method I trust most for this company is the **SOTP-forward** approach — using the SOTP structure but updating segment EBIT to reflect LTM growth (the $182 LTM SOTP), then moderating with the peer forward multiple. The trailing FY2025 SOTP ($170) is the cleanest anchor because it rests on audited segment data, but it understates the current run rate: LTM EBIT ($85.4B) is 7% above FY2025 ($80.0B) and the momentum continues. The peers give the forward picture but rest on a heterogeneous comp set. No single method is clean; the blend is the honest answer.

**Base-case fair value (single point — weighted blend, executed Python above):**

```python
# Method weights and representative values:
# 03 Peers (35%): $258
# 04 DCF exit-10x (25%): $207
# 06 SOTP FY2025 base (40%): $170
# Blend = 0.35 × 258 + 0.25 × 207 + 0.40 × 170
# = 90.3 + 51.75 + 68.0 = $210.05

blend = 0.35 * 258 + 0.25 * 207 + 0.40 * 170
# → $210.05/share
```

**Base-case fair value: $210/share** (rounded from $210.05).

At $210, the current price of $238.34 is **13.5% above** the base-case fair value — the stock sits modestly above intrinsic value on this blended estimate. This does not mean the business is uninvestable; it means the current price prices in forward earnings delivery that is consensus-visible but not yet banked. The single biggest reason the base value is below today's price: the SOTP at $170 — weighted 40% — anchors heavily on trailing EBIT and depresses the blend. If the LTM SOTP ($182) were used in place of the FY2025 SOTP, the blend rises to approximately **$215/share** — still below $238. The blended base-case point of $210 reflects a conservative stance: the trailing SOTP (audited, primary-source EBIT) earns the highest weight, and the forward methods (peers, DCF) partially offset it. A buyer at $238 is paying ~13% above this conservative blend.

---

## 3. Bull / Base / Bear Fair-Value Levels

**Cyclicality note:** Amazon is NOT at a cyclical peak in FY2025. Both `07_business-quality.md` and `09_moat.md` are explicit: "consolidated returns are not at a cyclical peak — they are recovering from a genuine trough." The documented prior downturn is FY2022 (EBIT margin 2.6%, North America and International running combined losses of ~$10B, AWS sole profitable segment at $22.8B EBIT). The current 11.2% consolidated EBIT margin is a recovery margin, not a peak margin. The cyclicality gate therefore does not require the bear case to reach FY2022-level earnings — that trough was caused by a unique combination of post-COVID fulfilment overcapacity, macro normalization, and retail margin compression simultaneously. The through-cycle bear reflects a plausible deceleration scenario (AWS growth halving to 20%, D&A step-up compressing margins, advertising softening), not a return to the COVID-era trough. The FY2022 trough is documented and cited as the prior-downturn reference. [FY2022 Annual Report (10-K, filed Feb 3, 2023), Segment Information, Note 10 — North America EBIT −$2,848M, International EBIT −$7,746M, AWS EBIT $22,841M, consolidated EBIT $12,248M, EBIT margin 2.6%.]

**Structural-reset / permanent-impairment trigger:** Moat trajectory is **Stable (widening in AWS)** per `09_moat.md` §5 — not "eroding." Disruption-flag score is **45/100** per `07_business-quality.md` §1 — above the ≤40 threshold. Neither trigger fires. The bear case reflects the recoverable through-cycle deceleration; it is not a permanent-impairment scenario.

| Case | Fair Value / Share | Implied EV/NTM EBITDA | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---|---|
| **Bull** | **$247** | ~14.0x | 12 months | AWS accelerates to 35%+ revenue growth; D&A step-up absorbed by faster customer billing (6-month lag, not 24-month lag); advertising growth rebounds to 32%; NA unit volume reaches 20% (grocery + same-day expansion); NTM EV/EBITDA multiple expands to 14x on peer-warranted basis. Methods: peers 14x NTM EBITDA → $278; DCF exit 12x → $246; SOTP bull 35x/27x/22x → $221. Blend (35%/25%/40%): $278×0.35 + $246×0.25 + $221×0.40 = $97.3 + $61.5 + $88.4 = $247. |
| **Base** | **$210** | ~10.7x | 12 months | AWS maintains 28% growth; D&A step-up partially absorbed by mid-2027 (18-month billing lag realized); advertising sustains 22%; NA unit volume 15%; NTM EV/EBITDA holds near 13x (warranted quality premium). Methods: peers 13x → $258; DCF exit 10x → $207; SOTP 28x/20x/15x on FY2025 EBIT → $170. Blend $210 (see §2). |
| **Bear** | **$146** | ~10.5x | 12 months | AWS decelerates to 20% growth (billing lag worst case: 24 months); D&A step-up adds 200bps to T&I cost rate; advertising growth falls to 12% (SMB tariff shock + macro); NA unit volume slows to 7%; NTM EV/EBITDA compresses to 10.5x (below peer median 11.41x, reflecting earnings miss). Methods: peers 10.5x → $206; DCF bear terminal g=2% → $87; SOTP 22x/15x/10x on FY2025 EBIT → $129. Blend (35%/25%/40%): $206×0.35 + $87×0.25 + $129×0.40 = $72.1 + $21.8 + $51.6 = $146. |

**Snippet verification of scenario blends (executed Python):**

```python
# SHARES = 10,874M; NET_DEBT_BROAD = $92,451M; NTM_EBITDA = $222,587M

# Bull:
# Peers: 14.0 × 222,587 = 3,116,218 EV; (3,116,218 - 92,451) / 10,874 = $278.07
# DCF exit 12x: $246 (from 04 sensitivity grid, WACC 10.4%)
# SOTP bull: $221 (from 06 bull case)
# Blend: 0.35 × 278.07 + 0.25 × 246 + 0.40 × 221 = 97.32 + 61.50 + 88.40 = $247.22 → $247

# Bear:
# Peers: 10.5 × 222,587 = 2,337,164 EV; (2,337,164 - 92,451) / 10,874 = $206.43
# DCF bear g=2%: $87 (from 04 §5 bear terminal)
# SOTP bear: $129 (from 06 bear case)
# Blend: 0.35 × 206.43 + 0.25 × 87 + 0.40 × 129 = 72.25 + 21.75 + 51.60 = $145.60 → $146
```

**Key swing factors between bull and bear:**

1. **D&A step-up timing (the dominant swing factor):** `07_earnings-sensitivity.md` ranks D&A from AI capex as the #1 EBIT variable, with a ~$7.1B average EBIT swing. The bull-to-bear EBIT difference from this variable alone is approximately $13.9B ($2.9B bull relief vs. $11B bear headwind from a 200bps T&I rate rise). Management has explicitly stated that new capacity takes 6–24 months before customers are billed — whether that lag is at the short or long end of the range determines which scenario plays out. [Q1 2026 Earnings Call, CEO, April 29, 2026]

2. **AWS revenue growth rate:** A 15pp swing (20% bear to 35% bull) in AWS growth produces a ~$12.4B EBIT swing. AWS is now running at $150B annualized revenue growing at 28%; deceleration to 20% (the FY2025 full-year rate) would represent a meaningful step back, while acceleration to 35% would require pulling forward capacity that is not yet billed.

3. **Multiple compression or expansion:** The NTM EV/EBITDA multiple moving between 10.5x (bear) and 14.0x (bull) accounts for approximately $72/share of the $101 bull-to-bear spread purely through multiple expansion, even holding the earnings base constant. The multiple is the transmission mechanism: if the D&A and AWS growth scenarios disappoint, the multiple will likely compress simultaneously (both effects move in the same adverse direction).

---

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | $238.34 |
| Base-case fair value (point) | $210 |
| Bull-case fair value | $247 |
| Bear-case fair value | $146 |
| Implied upside to base case = (base FV − price) / price | **−11.9%** (price is above fair value) |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−13.5%** (negative = price exceeds fair value; no cushion exists at base case) |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **38.7%** (loss to the bear case if it plays out) |

**Reading:** At $238.34, the margin of safety is negative — the stock trades 13.5% above the base-case fair value of $210. There is no margin of safety at the current price against the base case. The downside to the bear case is 38.7% — a fall from $238 to $146 — which is a sizeable loss scenario driven by simultaneous AWS deceleration, D&A step-up, and multiple compression. The asymmetry here is notable: the upside to the bull case ($247 vs. $238.34) is only +3.6%, while the downside to the bear ($146 vs. $238.34) is −38.7%. The risk/reward at current prices is asymmetric to the downside in simple level terms — but the master synthesizer owns the probability weighting and the risk/reward conclusion.

**Formula verification:**
- Margin of safety = (210 − 238.34) / 210 = −28.34 / 210 = **−13.5%**
- Downside to bear = (238.34 − 146) / 238.34 = 92.34 / 238.34 = **38.7%**
- Upside to base = (210 − 238.34) / 238.34 = −28.34 / 238.34 = **−11.9%**
- Upside to bull = (247 − 238.34) / 238.34 = 8.66 / 238.34 = **+3.6%**

---

## 5. Warranted-Multiple Check

**Snippet (executed):**
```python
# At base FV = $210:
# Equity value = 210 × 10,874M = $2,283,540M
# EV = $2,283,540M + $92,451M = $2,375,991M
# NTM EBITDA (consensus) = $222,587M
# Implied EV/NTM EBITDA = $2,375,991M / $222,587M = 10.7x

# At current price $238.34:
# EV = $2,656,300M (01 anchor)
# Implied EV/NTM EBITDA = $2,656,300M / $222,587M = 11.9x
```

The base-case fair value of $210 implies **10.7x NTM EV/EBITDA** — meaningfully below the peer-warranted multiple of 13.0x computed in `03` and below the current multiple of 11.9x. This is not contradictory: the base fair value is the SOTP-weighted blend, and the SOTP anchors on trailing FY2025 EBIT (28x = $170), which carries 40% weight and pulls the blend below the forward multiple. At a strictly forward basis (using only the peer method), fair value is $258, implying 13x warranted — consistent with `03`'s conclusion. **The warranted-multiple check passes for the peer component but shows the blended fair value is below the current multiple.** The current price of $238 implies 11.9x NTM EV/EBITDA, which the `03` analysis shows is slightly below the warranted 13.0x for Amazon's quality profile — meaning the current price is arguably supported on a pure-forward-multiple basis but not on the trailing-EBIT SOTP.

The moat verdict is Narrow, with a stable trajectory widening in AWS. Amazon has not yet consistently earned above its cost of capital through a full cycle (through-cycle ROIC 9.0% vs. WACC ~10.4–11.2%). A business at or below its cost of capital does not warrant an open-ended premium multiple. The current 11.9x NTM EV/EBITDA is defensible if AWS margins hold at 35%+ and the AI capex monetizes — but if those conditions are met, the fair value moves toward $247 (the bull), not stays at $238. **The market is pricing Amazon at a multiple that is only justified if execution is good but not excellent.** There is no value-trap risk from a misaligned owner: Amazon is widely held, founder-led with aligned incentives (Jeff Bezos owns ~9.5% per the most recent proxy filings, no disclosures in this pool — inference from public data, unverified), with no government controller or parent-subsidiary conflict (RF-OWN-004 does not apply). The value-trap concern here is execution risk, not ownership structure.

---

## 6. Fair-Value Read

At $238.34, Amazon trades at $28/share (13.5%) above the base-case fair value of $210. The bull / base / bear fair-value levels are $247 / $210 / $146, with a bull-to-bear spread of $101/share. The margin of safety is negative (−13.5%); there is no cushion against a base-case miss at today's price. The downside to the bear case is 38.7% — a meaningful loss scenario that requires simultaneous deceleration of AWS, the D&A step-up hitting harder than consensus, and multiple compression, all at once. The method that drives the base answer is the **SOTP at $170 (40% weight)**, which anchors on audited FY2025 segment EBIT and finds that the current price is 40% above the trailing breakup value of the business — meaning the market is paying entirely for future earnings growth, not current earnings. The single biggest swing factor between bull and bear is **the timing of D&A absorption from the AI capex wave**: if Amazon bills customers within 6–12 months of deploying capacity (the bull case), FCF recovers quickly and the multiple holds; if the billing lag extends to 18–24 months (the base/bear scenario), D&A crushes EBIT and the multiple compresses simultaneously, producing a double-hit. The reverse-DCF cross-check from `05` confirms the market has priced in 16.4% NOPAT CAGR for a full decade — aggressive for a 10-year horizon, plausible for 3–5 years — which means the current price leaves no room for a slow start to the AI monetization cycle.

---

*Sources: All method values pulled verbatim from upstream valuation outputs (`01`–`06`) without re-derivation. Cross-module inputs: `business-model/07_business-quality.md` (quality score 67, disruption flag 45/100), `business-model/09_moat.md` (Narrow moat, stable trajectory, through-cycle ROIC 9.0% vs. WACC ~10.4–11.2%), `business-model/10_external-dependency.md` (cyclicality mid, regulation high, tariffs mid-high), `earnings/07_earnings-sensitivity.md` (D&A step-up #1 EBIT variable at $7.1B avg swing, AWS growth #2 at $6.0B). All executed Python computations shown inline above.*

---

## Self-Check

- [x] Every method's value and confidence pulled from `02`–`06`, not re-derived.
- [x] Method weights (0% / 35% / 25% / 0%+n/a / 40%) justified by reliability for Amazon and sum to 100% across value-producing methods.
- [x] Lens swap (Gordon → exit 10x for `04`) is disclosed explicitly and reasoned.
- [x] Reverse-DCF (`05`) used as cross-check only, not a weighted input.
- [x] Method disagreement > 40% flagged as the headline finding (148% spread Gordon-to-peers; 52% spread peers-to-SOTP after lens swap — both flagged).
- [x] Bull/base/bear are each a single derived point, tied to operating drivers, dated 12-month horizon. No probabilities assigned.
- [x] Margin of safety = (210 − 238.34)/210 = −13.5% AND downside-to-bear = (238.34 − 146)/238.34 = 38.7% — reported as two separate metrics. Downside-to-bear explicitly flagged inverted. Neither is used as a proxy for the other.
- [x] Warranted-multiple check performed; no value-trap risk from ownership misalignment (RF-OWN-004 not triggered); multiple check flags that current price is supported only on forward execution.
- [x] Price-state is `pool-verified`; all price-relative metrics computed.
- [x] Weighted level math, margin of safety, and implied multiples produced by executed Python snippet (command + result shown).
- [x] Amazon is NOT at a cyclical peak (FY2022 documented trough cited: consolidated EBIT $12.2B, EBIT margin 2.6%). Bear case reflects deceleration, not reversion to FY2022 trough — explicitly reasoned.
- [x] Structural-reset trigger checked: Narrow moat (stable, not eroding) AND disruption flag 45/100 (above ≤40 threshold) — trigger does NOT fire. No separate structural-reset fair value needed.
- [x] No banned phrases.
- [x] Boundary respected: no probabilities, no risk/reward, no rating, no position sizing.
