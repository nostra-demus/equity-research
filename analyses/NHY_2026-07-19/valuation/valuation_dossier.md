# valuation Module Dossier — NHY

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-07-19T16:42:19Z
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

# Valuation Module — NHY (Synthesis)

## Abstract

Norsk Hydro screens as fairly valued, not cheap: the triangulated base-case fair value of NOK 81.83 per share sits 3.7% below the NOK 84.96 price (2026-07-17, pool-verified), inside the ±10% "fairly valued" band. Bull is NOK 107.70 (+26.8%, requires the current Middle East supply-shock margin and multiple to both persist), Bear is NOK 45.12 (−46.9%, a structural, not cyclical, impairment of Hydro's upstream cost-curve advantage and Extrusions), and sum-of-the-parts — the most tightly reconciled method, tying within 0.3% of consolidated enterprise value — drives the base. The price implies Hydro's margin holds near its FY2025 actual (13.9%) rather than fading to the DCF's 13.0% mid-cycle anchor, a stretch two earnings modules call non-durable. There is no margin of safety today (−3.8% cushion); the real asymmetry is 46.9% downside to the bear case against 26.8% upside to bull. A structurally misaligned controlling owner (the Norwegian State, 34.5%) means any apparent peer-relative discount cannot be read as a clean re-rating case — this is fair value with real downside skew, not a bargain.

## 1. Valuation Verdict

- **Verdict:** Fairly valued
- **Base-case fair value (point, per share):** NOK 81.83 [`07_scenario-and-fair-value.md` §2]
- **Current price:** NOK 84.96, as of 2026-07-17 (last close, pool-verified) [`01_price-and-capital-structure.md` §1]
- **Bull / Base / Bear fair-value levels (points):** Bull NOK 107.70 (+26.8% vs price) / Base NOK 81.83 (−3.7% vs price) / Bear NOK 45.12 (−46.9% vs price, structural reset — headline) [`07` §3]
- **Cross-method dispersion (football field, low–high):** Weighted-method base points cluster NOK 70.14 (intrinsic DCF) to NOK 93.70 (peer relative), a 33.6% spread — under the 40% "must-lead-with-it" threshold but the central reconciliation question. The wider internal-sensitivity extremes (DCF sensitivity floor NOK 52.51 to full peer-parity ceiling NOK 134.10) are shown for transparency only and are not treated as the decision-relevant dispersion [`07` §2]. SOTP's own named-comparable range is NOK 78.27–106.47.
- Valuation attractiveness /100 *(higher = cheaper)*: **38** — the base case shows price sitting slightly *above*, not below, fair value (−3.7% implied upside); further capped at max 60 by the RF-OWN-004 unaligned-owner flag, but the actual read is well under that ceiling
- Margin of safety /100 *(higher = better)*: **30** — cushion is negative (−3.83%): price is priced above, not below, the base-case fair value
- Valuation confidence /100: **56** — capped at max 60 by DCF terminal dominance (terminal value = 78.1% of DCF EV); further tempered by the pervasive Capital IQ EBITDA/EBIT reclassification error (flagged and corrected downstream, but a real cross-check burden) and a discretionary FX/quality-discount stack in the peer method
- Downside risk /100 *(higher = WORSE)*: **68** — 46.9% distance from price to the bear-case (structural-reset) value is a large, real downside
- Data quality /100: **75** — comprehensive pool (price, consensus, peers, segments, cash flow all present and dated), tempered by the material CIQ vendor EBITDA/EBIT mismatch that every specialist had to independently detect and correct
- Overall usefulness /100: **79**
- Dominant valuation method (one line): Sum-of-the-parts (40% weight) — built entirely on Hydro's own audited segment Adjusted EBITDA disclosures, and its gross enterprise value ties within 0.3% of the consolidated canonical EV bridge, the least forecasting judgment of any method here [`06_sum-of-the-parts.md` §4]
- What's priced in (one line): The market is pricing Hydro's FY2025 actual Adjusted EBITDA margin (13.9%) holding roughly flat through FY2030 and into perpetuity — not growth (implied 5-year FCF CAGR −3.21%) — a "Stretch, tilting aggressive" ask that two upstream earnings modules independently call non-durable [`05_reverse-dcf.md` §5]
- Biggest valuation risk (one line): The moat's own eroding trajectory (Extrusions EBIT margin −2.2% in 2025, five plants proposed for closure; upstream cost-curve advantage exposed to Chinese/Gulf capacity growth) drives the 46.9%-downside structural bear case, and is a live possibility per the business-model module, not a tail risk [`07` §3, structural down-leg]

## 1A. Module Disconfirmation

- **Strongest bear point:** The reverse-DCF shows the price already requires Hydro's *elevated* FY2025 margin (13.9%) to persist rather than fade to the DCF's own 13.0% mid-cycle anchor — a real, not trivial, ask that two upstream earnings modules independently flag as resting on a non-durable Middle East supply shock, while the company's own forward hedge book (67% of Q2 2026 volume booked below spot) already partially discounts reversion [`05_reverse-dcf.md` §3, §5].
- **Strongest bull point:** On the multiples independently verified clean (NTM EV/EBITDA, EV/Sales, forward P/E — all cross-checked against consensus and audited figures, not the corrupted CIQ vendor LTM basis), NHY trades an 18%–35% discount to its peer median despite a materially lower leverage profile and a mid-pack-to-superior restated EBITDA margin, implying a NOK 93.70 relative-value base case (+10.2% vs price) even after a conservative 10% quality discount [`03_relative-valuation-peers.md` §3–§5].
- **Single killer risk:** Confirmed (not merely unproven) moat erosion — Hydro Extrusions' EBIT margin fell from ~4% (2020–2023) to −2.2% (2025) with five European plants proposed for closure, and the business-model module's own competitive-intensity read calls a mid-cost-curve upstream competitor within a few years "a live possibility, not a tail risk" [`07_scenario-and-fair-value.md`, structural down-leg, citing `business-model/09_moat.md`, `business-model/07_business-quality.md`].
- **Disconfirming evidence already visible:** SOTP — the most tightly-reconciled method — ties within 0.3% of the consolidated EV bridge using only audited segment data and sits essentially at the current price (−0.4%), meaning there is no proven variant perception of a hidden segment being mispriced by the market; this argues against the peer method's +10.2% read being an easy, closable gap [`06_sum-of-the-parts.md` §5].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | Sufficient — all five valuation methods can run, no active partial-data caps | Only a minor completeness gap (no discrete dilution schedule); everything else needed for price, DCF, peers, SOTP, and reverse-DCF is present and dated |
| price-and-capital-structure | Price pool-verified at NOK 84.96 (2026-07-17); canonical EV NOK 192,384mm, net debt NOK 17,919mm (cash-quality adjusted) | The headline Capital IQ cash figure includes NOK 4,829mm the company itself says is unavailable to service debt (captive insurance + derivatives collateral) — using the adjusted, not headline, EV/net-debt is canonical for every downstream agent |
| multiples-own-history | Own-history read is illustrative-only (13-month history, well short of the 3-year bar) — zero-weighted in `07` | The trailing "re-rating" (LTM P/E at the 85th percentile of its own short range) is a mechanical artifact of a depressed Q4 2025 earnings trough, not a genuine business re-rating; NTM P/E sits at only the 15th percentile of the same window |
| relative-valuation-peers | NOK 93.70 base case (+10.2% vs price) on a quality-adjusted NTM EV/EBITDA of 5.6x; dispersion NOK 72–134 | The raw vendor LTM EV/EBITDA/EBIT screen shows a spurious ~49%–52% discount — a Capital IQ reclassification error specific to Hydro's IFRS format; restated on audited figures, those same multiples flip to a *premium* |
| intrinsic-dcf | NOK 70.14 base case (−17.4% vs price); sensitivity grid NOK 52.51–102.81 | Terminal value is 78.1% of EV — terminal-dominated and low-confidence by the module's own rule — with a structural runoff terminal (moat-erosion trigger) producing NOK 45.12/share, the input for `07`'s headline bear |
| reverse-dcf | Price implies −3.21% 5-yr FCF CAGR, or a uniform 14.02% Adjusted EBITDA margin held through FY2030+ | The undemanding-looking growth ask is misleading in isolation — the more reliable margin-based solve shows the price needs the FY2025 actual margin (13.9%) to hold, not fade to the DCF's 13.0% mid-cycle anchor — a Stretch, not a Yes |
| sum-of-the-parts | NOK 84.63 base case (−0.4% vs price); dispersion NOK 78.27–106.47 | Aluminium Metal (primary smelting) carries 58.7% of gross enterprise value on only 7.1% of group revenue — the upstream-margin concentration pattern; gross EV ties to the consolidated canonical EV within 0.3% |
| scenario-and-fair-value | Weighted base NOK 81.83 (−3.7% vs price); Bull NOK 107.70 / Bear NOK 45.12 (headline, structural) | Margin of safety is negative (−3.83%); downside to bear is 46.89% — an asymmetric risk/reward the master synthesizer must weigh, not a cushion |

## 3. Reconciliation

The three weighted, value-producing methods disagree by 33.6% at the base-case level — DCF NOK 70.14 (low) to peer relative NOK 93.70 (high), with SOTP NOK 84.63 in between — under the module's 40% "must-lead-with-it" threshold, so this is not an unreconciled disagreement requiring a hard confidence cap on its own, but it is the central question this report resolves. `07`'s own reconciliation judgement is adopted here: SOTP is trusted most (40% weight) because it rests entirely on Hydro's own audited segment disclosures and ties within 0.3% of the consolidated canonical EV — the least forecasting judgment of the three. DCF is trusted second (35% weight) as the Business-Type Method Map's mandated primary method for a commodity/cyclical name, but its terminal-value dominance (78.1% of EV) and wide WACC/g sensitivity earn it real, not top, weight. Peer relative valuation is trusted least (25% weight) because its NOK 93.70 base case stacks two of this report's own judgment calls — an inferred NOK/USD 9.63 FX rate and a discretionary 10% quality discount — on top of an imperfect comp set (only RUSAL, Chalco, and Hindalco are Hydro's own named peers). The own-history multiples method (`02`) is excluded from the weighted blend entirely, per its own "illustrative-only" flag on a 13-month history. Methods broadly agree once weighted — fair value clusters at **NOK 81.83**, dispersion **NOK 70.14–93.70** (weighted-method base points) / **NOK 45.12–107.70** (bull/base/bear scenario levels).

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N — price is pool-verified (NOK 84.96, 2026-07-17) | — | Not applicable |
| No consensus / forward estimates | N — consensus present through FY2030E | — | Not applicable |
| No peer data | N — 10-company comp set present, as-of 2026-07-18 | — | Not applicable |
| Only one valuation method usable | N — five methods ran (own-history, peer, DCF, reverse-DCF, SOTP) | — | Not applicable |
| No cash flow AND DCF is only method | N — cash flow statement present and DCF is one of three weighted methods | — | Not applicable |
| SOTP not possible for multi-segment | N — SOTP ran fully (5 reportable segments, no >85% single-segment threshold) | — | Not applicable |
| Methods disagree >40% unreconciled | N — weighted base-case spread is 33.6% (below the 40% threshold), and it is explicitly reconciled in §3 | — | Not applicable |
| Terminal value >75% of DCF EV | **Y** — DCF terminal value is 78.1% of DCF EV [`04_intrinsic-dcf.md` §5] | Valuation confidence | Max 60 |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | **Y** — Norwegian State's 34.49% stake held for industrial-policy reasons, not per-share value; Board declined takeover-bid-handling principles because of it [`management-governance/99_management-governance-synthesis.md`, RF-OWN-004] | Valuation attractiveness; verdict ceiling | Attractiveness max 60 (actual read, 38, is already under this ceiling); value-trap flag mandatory (applied throughout §1–§7); verdict may not be better than "Modestly undervalued" on a cheap multiple alone (moot here — the verdict is "Fairly valued," not an undervalued call driven by a cheap multiple) |

No other caps bind. Where multiple caps could affect the same score, the terminal-dominance cap (max 60) is the binding, most restrictive constraint on valuation confidence; the final confidence score of 56 sits under that cap.

## 5. Fair-Value Summary

The bull/base/bear fair-value levels are NOK 107.70 / NOK 81.83 / NOK 45.12, with sum-of-the-parts the single method driving the base — it is the only one of the three weighted methods tied to audited, segment-level disclosures rather than a forecast or a discretionary discount, and it lands within 0.3% of the consolidated enterprise-value bridge. The current price (NOK 84.96) implies the market needs Hydro's FY2025 actual Adjusted EBITDA margin (13.9%) to hold roughly flat rather than fade toward the DCF's conservative 13.0% mid-cycle anchor — achievable in the sense that it does not require the current Middle East supply-shock aluminium-price spike to persist in full, but a real stretch given two earnings-module reads independently call the current elevated margin non-durable and the company's own forward hedge book already prices in partial reversion. The margin of safety is negative (−3.83% — price sits above, not below, base fair value), while the downside to the bear case is a real 46.89% — these are two separate reads, and together they describe an asymmetric setup (26.8% upside to bull vs 46.9% downside to bear) rather than a cushioned entry point. Any apparent cheapness in the peer-relative read (NOK 93.70 base, +10.2% vs price, or the wider 18%–35% discount on clean multiples before the quality adjustment) carries genuine value-trap risk: the business-model module scores Hydro's moat as narrow and eroding (Extrusions EBIT margin −2.2% in 2025, upstream cost-curve advantage exposed to Chinese/Gulf capacity growth), and the Norwegian State's 34.49% stake is held for industrial-policy reasons with no mandate to close a valuation gap — a structurally misaligned owner (RF-OWN-004) under which persistent cheapness does not self-correct.

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Fairly valued | Adjusted EBITDA margin confirmed fading toward the DCF's 13.0% mid-cycle anchor (or the FY2023 trough of 11.5%) while price does not correct in advance — would push the base case (SOTP/DCF-weighted) further below price and open a real margin of safety; evidence that the Extrusions restructuring (five plant closures) is delivering ahead of plan would also lift SOTP's Extrusions segment multiple range off its low end | Confirmation that the Middle East supply-shock aluminium-price premium persists structurally (e.g., a durable Strait of Hormuz-related supply curtailment) — this would validate the reverse-DCF's implied 13.9%–14.0% margin ask and pull the DCF and peer base cases up toward the SOTP/Bull range; a formal Board statement on takeover-bid-handling principles or evidence the Norwegian State supports value-accretive action would also remove the RF-OWN-004 attractiveness cap | Q2 2026 results (due 2026-07-22, three days after this run) — the first read on whether the Q1 2026 margin spike is fading toward `04`'s anchor or persisting; a longer (3-year) own-history multiple series to make `02`'s reversion read decision-relevant; a disclosed dilution schedule for the founder/subscription certificates |

## 7. Note To The Final Synthesizer

- Bull/base/bear fair-value levels: NOK 107.70 / NOK 81.83 / NOK 45.12 per share. Sum-of-the-parts (40% weight) is the dominant method — audited segment data, ties within 0.3% of consolidated EV.
- The price implies Hydro's FY2025 actual margin (13.9%) holds flat, not growth (implied FCF CAGR −3.21%) — a "Stretch, tilting aggressive" ask per the reverse-DCF, achievable only if the current cyclically-elevated pricing environment does not fully normalize.
- Margin of safety: **−3.83%** (no cushion — price sits above base fair value). Downside to bear: **46.89%** (bear-case value NOK 45.12). These are separate reads: modest apparent overvaluation on the base case, paired with a large asymmetric downside if the structural (not merely cyclical) moat-erosion case plays out.
- This is genuine value-trap risk, not a clean margin-of-safety opportunity: the peer-relative method's apparent 18%–35% discount on clean multiples is only partly explained by fundamentals (shrinking revenue, narrow/eroding moat) and is capped by RF-OWN-004 — the Norwegian State's 34.49% stake is held for industrial-policy reasons (retaining HQ/technology functions in Norway), not per-share value maximization, and the Board has declined to adopt takeover-bid-handling principles because of the stake's size. Persistent cheapness under this owner does not self-correct.
- Trust sum-of-the-parts most (audited segment data, tightest reconciliation to consolidated EV); trust the DCF second (mandated primary method for this business type, but terminal-dominated at 78.1% of EV); discount the peer-relative base case somewhat (it stacks a discretionary FX conversion and a discretionary quality discount); do not use the own-history multiples reversion figures as a fair-value input at all (13-month history, explicitly zero-weighted).
- No partial-data caps bind on the price/margin-of-safety/downside reads — the price is pool-verified and fresh (2 calendar days old). The only cap applied is the terminal-dominance cap on valuation confidence (max 60, DCF terminal value = 78.1% of EV) and the RF-OWN-004 attractiveness cap (max 60, non-binding given the actual read of 38).
- Biggest missing data point (single highest-value next data request): Q2 2026 results, due 2026-07-22 (three days after this run) — the first hard evidence on whether the Q1 2026 margin spike this whole valuation pivots on is fading toward the DCF's 13.0% mid-cycle anchor or persisting toward the price-implied 13.9%–14.0% level.
- **Explicit handoff:** the master synthesizer's "Valuation and Peer Mispricing" section should defer to this synthesis. The bull/base/bear fair-value levels here (NOK 107.70 / 81.83 / 45.12) are the inputs for the master's probability-weighted scenario model — this module does not assign probabilities, compute a probability-weighted return, or issue a rating.

## 8. Simple Summary

- Not cheap: the base-case fair value (NOK 81.83) is 3.7% *below* the current price (NOK 84.96) — fairly valued, no margin of safety.
- Bull NOK 107.70 (+26.8%) / Base NOK 81.83 (−3.7%) / Bear NOK 45.12 (−46.9%, structural, not just cyclical).
- The market is pricing Hydro's current elevated margin (13.9%) to hold flat, not to grow — a real but not extreme stretch.
- The downside sits in a structural moat-erosion case (Extrusions decline, upstream cost-curve pressure from Chinese/Gulf capacity) — 46.9% below today's price if it plays out.
- Trust sum-of-the-parts most for this company — it's built on audited segment data and matches the consolidated enterprise value almost exactly.
- Value-trap risk is real: the Norwegian State's 34.5% stake is held for industrial-policy, not per-share-value, reasons, so any apparent discount may never close.
- A pool-verified current price was available (NOK 84.96, 2026-07-17) — no price gap here.
- This module is useful for the master synthesizer: five methods ran, are reconciled, and produce a coherent, evidence-cited fair-value range with an explicit asymmetric-risk read.



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — NHY

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| Company Comparable Analysis Norsk Hydro ASA.xls — tab: Financial Data | Peer/comps export | LTM, as of 2026-07-18 | 2026-07-18 (sync) | High |
| Company Comparable Analysis Norsk Hydro ASA.xls — tab: Trading Multiples | Multiples export (peer) | LTM / NTM, as of 2026-07-18 | 2026-07-18 (sync) | High |
| Company Comparable Analysis Norsk Hydro ASA.xls — tab: Operating Statistics | Peer/comps export | LTM, as of 2026-07-18 | 2026-07-18 (sync) | Medium |
| Company Comparable Analysis Norsk Hydro ASA.xls — tab: Business Description | Peer/comps export (qualitative) | as of 2026-07-18 | 2026-07-18 (sync) | Low |
| Company Comparable Analysis Norsk Hydro ASA.xls — tab: Implied Valuation | Multiples-implied valuation export | LTM/NTM, as of 2026-07-18 | 2026-07-18 (sync) | High |
| Company Comparable Analysis Norsk Hydro ASA.xls — tab: Valuation Chart | Multiples export (chart data) | as of 2026-07-18 | 2026-07-18 (sync) | Low |
| Company Comparable Analysis Norsk Hydro ASA.xls — tab: Credit Health Panel | Capital-structure/credit export | as of 2026-07-18 | 2026-07-18 (sync) | Medium |
| Company Comparable Analysis Norsk Hydro ASA.xls — tab: Disclaimer | Other | — | 2026-07-18 (sync) | Low |
| Norsk Hydro ASA OB NHY Board Members.rtf | Governance note | current | 2026-07-18 (sync) | Low |
| Norsk Hydro ASA OB NHY Customers.rtf | Business note | current | 2026-07-18 (sync) | Low |
| Norsk Hydro ASA OB NHY Financials.xls — tab: Key Stats | Capital structure + current price + summary financials | FY2022A–FY2028E, price as of 2026-07-17/18 | 2026-07-18 (sync) | High |
| Norsk Hydro ASA OB NHY Financials.xls — tab: Income Statement | Annual/quarterly filing data (income statement) | FY2021A–LTM Mar-2026 | 2026-07-18 (sync) | High |
| Norsk Hydro ASA OB NHY Financials.xls — tab: Balance Sheet | Capital-structure data | FY2021A–LTM Mar-2026 | 2026-07-18 (sync) | High |
| Norsk Hydro ASA OB NHY Financials.xls — tab: Cash Flow | Cash flow data | FY2021A–LTM Mar-2026 | 2026-07-18 (sync) | High |
| Norsk Hydro ASA OB NHY Financials.xls — tab: Multiples | Own-history multiples export | FY2021A–LTM Mar-2026 | 2026-07-18 (sync) | High |
| Norsk Hydro ASA OB NHY Financials.xls — tab: Historical Capitalization | Capital structure / market-cap-EV bridge (quarterly) | Dec-2024 – Mar-2026, price as of Apr-29-2026 | 2026-07-18 (sync) | High |
| Norsk Hydro ASA OB NHY Financials.xls — tab: Capital Structure Summary | Capital-structure data | annual series | 2026-07-18 (sync) | High |
| Norsk Hydro ASA OB NHY Financials.xls — tab: Capital Structure Details | Capital-structure data (debt detail) | current | 2026-07-18 (sync) | Medium |
| Norsk Hydro ASA OB NHY Financials.xls — tab: Ratios | Own-history ratios/multiples | FY2021A–LTM Mar-2026 | 2026-07-18 (sync) | High |
| Norsk Hydro ASA OB NHY Financials.xls — tab: Supplemental | Supplemental financial data | current | 2026-07-18 (sync) | Low |
| Norsk Hydro ASA OB NHY Financials.xls — tab: Industry Specific | Commodity/operating data | current | 2026-07-18 (sync) | Medium |
| Norsk Hydro ASA OB NHY Financials.xls — tab: Pension OPEB | Balance-sheet detail (pension) | current | 2026-07-18 (sync) | Low |
| Norsk Hydro ASA OB NHY Financials.xls — tab: Segments | Segment data | FY2020–FY2025 | 2026-07-18 (sync) | High |
| Norsk Hydro ASA OB NHY Products.xls — tab: Products | Business/product note | current | 2026-07-18 (sync) | Low |
| Norsk Hydro ASA, Q1 2026 Earnings Call, Apr 29, 2026.pdf | Transcript | Q1 2026 | 2026-07-18 (sync) | Medium |
| Norsk Hydro ASA, Q4 2025 Earnings Call, Feb 13, 2026.pdf | Transcript | Q4 2025 / FY2025 | 2026-07-18 (sync) | Medium |
| NorskHydroASAOBNHYEstimatesReport (1).xls — tab: Consensus | Consensus/estimate export | current | 2026-07-18 (sync) | High |
| NorskHydroASAOBNHYEstimatesReport (1).xls — tab: Recent Changes | Consensus/estimate export | current | 2026-07-18 (sync) | Medium |
| NorskHydroASAOBNHYEstimatesReport (1).xls — tab: Guidance | Consensus/estimate export (mgmt guidance vs consensus) | FY2009–FY2030 series, current fiscal year end Dec-31-2026 | 2026-07-18 (sync) | High |
| NorskHydroASAOBNHYEstimatesReport (1).xls — tab: Multiples | Consensus multiples export | NTM/FY2026–2029 | 2026-07-18 (sync) | High |
| NorskHydroASAOBNHYEstimatesReport (1).xls — tab: Surprise | Consensus/estimate export (beat-miss) | current | 2026-07-18 (sync) | Medium |
| NorskHydroASAOBNHYEstimatesReport (1).xls — tab: Trends | Consensus/estimate export | current | 2026-07-18 (sync) | Medium |
| NorskHydroASAOBNHYEstimatesReport (1).xls — tab: Revisions | Consensus/estimate export | current | 2026-07-18 (sync) | Medium |
| NorskHydroASAOBNHYEstimatesReport.xls (7 tabs, identical content to the "(1)" file — duplicate download, verified byte-identical extracts, differing only in source filename) | Consensus/estimate export | current | 2026-07-18 (sync) | High (duplicate of above) |
| NorskHydroASAOBNHY_PublicCompany.pdf | Current-price source + summary snapshot (Capital IQ) | Price as of Jul-17-2026 | 2026-07-18 (sync) | High |
| annual2025.txt | Annual filing (Integrated Annual Report 2025, plain-text render) | FY2025 (year ended Dec-31-2025) | 2026-07-18 (sync) | High |
| first-quarter-report-2026.pdf | Quarterly filing (Q1 2026 report) | Q1 2026 (ended Mar-31-2026) | 2026-07-18 (sync) | High |
| fq2026.txt | Quarterly filing (Q1 2026 report, plain-text render, duplicate of PDF) | Q1 2026 | 2026-07-18 (sync) | High |
| integrated-annual-report-2025.pdf | Annual filing (Integrated Annual Report 2025, duplicate of annual2025.txt) | FY2025 | 2026-07-18 (sync) | High |
| nhy-investor-day-2025.pdf | Investor deck | 2025 Capital Markets/Investor Day | 2026-07-18 (sync) | Medium |
| nhy-presentation-q1-2026.pdf | Investor deck | Q1 2026 | 2026-07-18 (sync) | Medium |

Note on multi-tab workbooks: `.claude/tools/extract_pool.py` was run and reports "fresh — 36 tabs across 5 workbook(s), 45 extract(s)". `manifest.json` shows 0 failures across all 5 workbooks — every tab extracted successfully (no `fail` / `fallback-text` / `missing-dependency` status). No `ciq_facts.json` sidecar exists in `_pool_extracts/`, so all figures below are the agent's own sourced read of the workbook tabs. No `data/NHY/external/` folder exists — there is no externally sourced research in this pool, so Section 1A (External Data) is omitted per instructions.

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | Norway — Oslo Stock Exchange (Oslo Børs), ticker OB:NHY | Integrated Annual Report 2025: "traded on the Oslo Stock Exchange (OSE) during 2025..."; "...Oslo Børs." |
| Filing regime | Norway / EU-listed issuer (Oslo Børs continuing obligations, EU Transparency/Market Abuse regime) — no US SEC forms; local equivalents used (Integrated Annual Report, Quarterly Report, stock-exchange announcements) | Integrated Annual Report 2025 cover and governance section |
| Reporting standard | IFRS | Integrated Annual Report 2025: "The consolidated financial statements of Norsk Hydro ASA and its subsidiaries are prepared in accordance with IFRS" |
| Reporting currency (and scale) | NOK (Norwegian krone), millions | Norsk Hydro ASA OB NHY Financials.xls, all tabs header "Currency: NOK"; Integrated Annual Report 2025 financials in NOK million |
| Fiscal-year end | December 31 | NorskHydroASAOBNHYEstimatesReport.xls, Multiples tab: "Current Fiscal Year End: Dec-31-2026"; Key Stats tab annual columns end Dec-31 |
| Document language(s) | English (all pool documents, including the Integrated Annual Report and Q1 2026 Report, are in English) | Direct inspection of all extracts |

For a Norwegian issuer, US forms (10-K, 10-Q, 8-K, Form 4) are correctly absent — the local equivalents (Integrated Annual Report, First Quarter Report, earnings-call transcripts, investor-day deck) are present and used instead, per CLAUDE.md §27.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | annual2025.txt / integrated-annual-report-2025.pdf | FY2025 (year ended Dec-31-2025) | ~7 |
| Quarterly filing | first-quarter-report-2026.pdf / fq2026.txt | Q1 2026 (ended Mar-31-2026) | ~4 |
| Capital structure / balance sheet | Norsk Hydro ASA OB NHY Financials.xls — Balance Sheet / Historical Capitalization tabs | LTM Mar-31-2026 | ~4 |
| Consensus / estimate export | NorskHydroASAOBNHYEstimatesReport (1).xls — Consensus / Guidance tabs | FY2026E–FY2030E, guidance dated 2026-02-13, next release Jul-22-2026 | current |
| Multiples export | Norsk Hydro ASA OB NHY Financials.xls — Multiples tab; NorskHydroASAOBNHYEstimatesReport.xls — Multiples tab | current (FYE Dec-31-2026 basis) | current |
| Peer / comps export | Company Comparable Analysis Norsk Hydro ASA.xls — Trading Multiples / Implied Valuation tabs | As-Of Date 2026-07-18 | <1 |
| Current price (IBKR / Capital IQ) | NorskHydroASAOBNHY_PublicCompany.pdf ("Last (Delayed) 84.96", "Share Price as of Jul-17-2026"); corroborated by Norsk Hydro ASA OB NHY Financials.xls Key Stats tab (Share Price 84.96) | Jul-17-2026 | <1 |
| Cash flow statement | Norsk Hydro ASA OB NHY Financials.xls — Cash Flow tab | LTM Mar-31-2026 | ~4 |
| Segment data | Norsk Hydro ASA OB NHY Financials.xls — Segments tab (FY2020–FY2025); also Integrated Annual Report 2025, segment notes (Hydro Bauxite & Alumina, Hydro Aluminium Metal, Hydro Metal Markets, Hydro Extrusions, Hydro Energy) | FY2025 | ~7 |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | NorskHydroASAOBNHY_PublicCompany.pdf, "Share Price as of Jul-17-2026: 84.96" (NOK); corroborated by Financials.xls Key Stats tab | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | Financials.xls Key Stats tab: "Shares Out. 1965.27833" (mm, basic); Diluted EPS series present in Key Stats implies a diluted count is derivable — dilution basis is Basic per tab header, so diluted count must be confirmed at extraction stage by downstream agents | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | N | Not found in the pool as a discrete options/RSU schedule; Key Stats and Historical Capitalization tabs report on a Basic dilution basis only | Needed for fully diluted per-share fair value — downstream agents should flag this gap and use Basic shares with a caveat |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y | Integrated Annual Report 2025 (segments: Bauxite & Alumina, Aluminium Metal, Metal Markets, Extrusions, Energy); Company Comparable Analysis peer set is aluminum/mining producers | Determines which valuation methods are valid — NHY is an integrated commodity (aluminum/energy) operating company |
| Total debt, cash, minority/preferred | Y | Financials.xls Key Stats / Historical Capitalization tabs: Total Debt 33,754; Cash & ST Investments 20,664; Minority Interest 7,495; Pref. Equity nil (all NOK mm, as of Mar-31-2026) | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | Financials.xls Income Statement tab, FY2021A–LTM Mar-2026 | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | Financials.xls Cash Flow tab, FY2021A–LTM Mar-2026 | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | NorskHydroASAOBNHYEstimatesReport.xls Consensus / Guidance / Multiples tabs, FY2026E–FY2030E | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | Financials.xls Multiples tab and Ratios tab, FY2021A–LTM Mar-2026 | Own-history re-rating read |
| Peer / comps data | Y | Company Comparable Analysis Norsk Hydro ASA.xls — Trading Multiples / Operating Statistics / Implied Valuation tabs, 10-company comp set (Anglo American, Boliden, Shandong Hongqiao, ProfilGruppen, Grupa Kety, Antofagasta, Rusal, Constellium, Hindalco, Chalco), as of 2026-07-18 | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y | Financials.xls Segments tab, FY2020–FY2025 by Business Segment; Integrated Annual Report 2025 segment notes | Sum-of-the-parts |
| Dividend / buyback data | Y | Financials.xls Ratios tab, "Dividend per Share" rows across the annual series | Shareholder-yield read |

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

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N — current price is available (84.96 NOK, as of Jul-17-2026) | 01, 05, 07, 99 | Not applicable |
| No consensus / forward estimates | N — consensus and guidance data are present through FY2030E | 02, 03, 04, 05 | Not applicable |
| No peer data | N — a 10-company comp set with trading multiples and implied valuation is present, as of 2026-07-18 | 03, 06 | Not applicable |
| No segment-level data | N — segment revenue/EBIT by business (5 segments) is present for FY2020–FY2025 | 06 | Not applicable |
| No balance sheet / capital structure | N — balance sheet and capital-structure tabs are present through LTM Mar-31-2026 | 01, 04, 06 | Not applicable |
| No cash flow statement | N — cash flow statement is present through LTM Mar-31-2026 | 04 | Not applicable |

No partial-data caps from the standard checklist bind. The one residual gap noted below (fully diluted share count) is a minor completeness item, not a sufficiency-rule trigger, since Basic shares out. and Diluted EPS are both available and the difference is expected to be small for this issuer.

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Financials.xls Multiples/Ratios tabs give FY2021A–LTM Mar-2026 TEV/EBITDA, P/E, P/BV history |
| Peer relative valuation | Y | None | 10-company aluminum/mining/metals comp set with LTM and NTM multiples, as of 2026-07-18; Implied Valuation tab already computes an implied price-per-share range |
| Intrinsic DCF (Operating FCFF) | Y | None | Income statement, cash flow statement, and consensus near-term estimates (FY2026E–FY2029E) all present to build a near-term FCFF path; capital structure present for the EV-to-equity bridge |
| Reverse DCF | Y | None | Current price, share count, and financial base all present to back out market-implied assumptions |
| SOTP | Y | None | 5 reporting segments (Bauxite & Alumina, Aluminium Metal, Metal Markets, Extrusions, Energy) with segment revenue/EBIT for FY2020–FY2025; peer multiples exist for at least the upstream aluminum comps to anchor a segment-multiple approach — note the peer comp set is aluminum/mining generalists, not a clean per-segment (e.g. pure-play Energy) match, so SOTP segment multiples will carry a comparability caveat for the Extrusions and Energy segments specifically |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A complete earnings base (income statement and cash flow statement through LTM Mar-2026), full capital-structure data for the EV bridge, forward consensus estimates through FY2030E, a 10-company peer/comps export with implied valuation, segment-level data for SOTP, and a current price dated Jul-17-2026 are all present in the pool.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic DCF (Operating FCFF), reverse-DCF, sum-of-the-parts (SOTP; caveat on segment-comp fit for Extrusions and Energy).
- **Active partial-data caps:** None.
- **Critical missing items:** None. One minor completeness gap — a discrete options/RSU/convertible dilution schedule was not found in the pool (share/EPS data is on a Basic-dilution basis in the Capital IQ tabs); downstream valuation agents should use the Diluted EPS series already present (Key Stats tab) for per-share reconciliation and flag if a fully diluted share count materially differs from Basic shares outstanding, but this does not block any of the five valuation methods above.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — NHY (Norsk Hydro ASA, Oslo Børs: NHY)

Reporting standard: IFRS. Reporting / trading currency: Norwegian krone (NOK). Fiscal year end: December 31. [FY2025 Integrated Annual Report — "The consolidated financial statements of Norsk Hydro ASA and its subsidiaries are prepared in accordance with IFRS"; NorskHydroASAOBNHYEstimatesReport.xls, Multiples tab, "Current Fiscal Year End: Dec-31-2026"]. No cross-currency conversion is needed anywhere in this report — price, balance sheet, and income statement are all in NOK.

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | NOK 84.96 | Capital IQ Public Company Capsule (Norsk Hydro ASA OB NHY_PublicCompany export) / Capital IQ Key Stats tab (Norsk Hydro ASA OB NHY Financials.xls) | 2026-07-17 |
| Currency | NOK | Same | — |
| Price basis (last close / intraday / indicative) | Last close ("Last (Delayed)" = "Previous Close" = 84.96 on the export) | Same | 2026-07-17 |

**Price staleness.** Run date 2026-07-19 minus quote as-of 2026-07-17 = 2 calendar days ≈ 1.4 trading days (calendar days × 5/7). This is well inside the 5-trading-day freshness threshold — no refresh attempt was needed and none was performed. The price is **pool-verified**, not stale, and no staleness cap applies.

The export itself timestamps the quote ("Share Price as of Jul-17-2026") — this is a true quote as-of date, not merely a file-download date (the export's own creation stamp, "Date Created: Jul-18-2026," is one day later and is the vendor's compile date, not the price date). No web price was needed or used.

Note: Capital IQ's separate "Historical Capitalization" tab links a different price (NOK 103.45) to the Mar-31-2026 balance-sheet date, dated "pricing as of" the Q1 2026 filing date (2026-04-29) — that is a filing-date-linked historical snapshot, not the current price, and is not used here. Section 4 below deliberately pairs the CURRENT price (84.96, 2026-07-17) with the LATEST available balance sheet (Mar-31-2026, since Norsk Hydro's Q2 2026 results are not yet released — next release is 2026-07-22, three days after this run).

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | 1,965,278,330 (1,965.28 million), unchanged from Dec-31-2025 to Mar-31-2026 | FY2025 Integrated Annual Report, Note 7.6 (Shareholders' Equity) — Dec-31-2025 count; cross-checked against Q1 2026 report, "Total number of outstanding shares (million)" = 1,965 as of Mar-31-2026, and Capital IQ Key Stats / Balance Sheet tabs (Shares Out. 1,965.27833) |
| Diluted weighted-average shares (period) | Q1 2026: 1,965 million; FY2025: 1,970,106,821 (1,970.11 million) | Q1 2026 report, income statement, "Weighted average number of outstanding shares (million)"; FY2025 Integrated Annual Report, Note 7.6, "Earnings per share" |
| Options/RSUs count (if disclosed) | Not separately disclosed as material; company states dilution is immaterial (see below) | FY2025 Integrated Annual Report, Note 7.6 |
| Convertibles / potential shares (if disclosed) | Founder certificates and subscription certificates exist (entitle holders to participate in future capital increases) — company discloses these as a technical dilutive element but states no material effect | FY2025 Integrated Annual Report, Note 7.6: "Hydro's outstanding founder certificates and subscription certificates entitle the holders to participate in any share capital increase... These certificates represent dilutive elements for the earnings per share computation," immediately following: "There are no significant diluting elements." |
| **Fully diluted shares (TSM + if-converted)** | 1,965.28 million (≈ basic; no material dilution) | FY2025 Integrated Annual Report, Note 7.6; Q1 2026 report, income-statement footnote: "Basic earnings per share are computed using the weighted average number of ordinary shares outstanding. There were no significant diluting elements." |
| Share count used for market cap | 1,965.28 million (as-of Mar-31-2026 / Jul-17-2026 count, unchanged) | Same |
| Share count used for per-share fair value | 1,965.28 million | Same |

Norsk Hydro's own disclosure states basic and diluted EPS are computed off the same weighted-average share count in both the FY2025 annual report and the Q1 2026 interim report ("There were no significant diluting elements"). The founder/subscription certificates are a real but immaterial dilutive instrument — no strike prices, conversion ratios, or headcounts are disclosed for them, so a treasury-stock-method or if-converted adjustment cannot be built; this is a limitation, but the gap is not expected to be material given the company's own "no significant diluting elements" language. Basic shares outstanding are therefore used for both market cap and per-share fair value, labeled as the fully diluted proxy.

## 3. Market Capitalization

`Market cap = share count × current price = 1,965.28 million × NOK 84.96 = NOK 166,970 million`

(Capital IQ's own precomputed figure: NOK 166,970.05 million — matches to rounding.) [Capital IQ Key Stats tab / Public Company Capsule, "Market Capitalization," as of 2026-07-17]

## 4. Enterprise Value Bridge

Balance-sheet items below are as of Mar-31-2026 (Q1 2026), the latest available balance sheet — paired with the current price (2026-07-17). Norsk Hydro's Q2 2026 results are due 2026-07-22.

| Component | Amount (NOK mm) | Source |
|---|---:|---|
| Market capitalization | 166,970 | Section 3 above |
| + Total debt (short + long term, incl. lease liabilities) | 33,754 | Capital IQ Balance Sheet / Capital Structure Summary tabs, "Total Debt," Mar-31-2026; Q1 2026 report balance sheet — short-term debt 5,102 + long-term debt 28,652 = 33,754 (lease liabilities of NOK 4,305mm at Dec-31-2025 are folded into this total per the Capital Structure Details tab; company does not separately break out lease liabilities at Mar-31-2026) |
| + Minority / non-controlling interest | 7,495 | Capital IQ Balance Sheet tab, "Minority Interest," Mar-31-2026; Q1 2026 report balance sheet |
| + Preferred equity | 0 (none outstanding) | Capital IQ Capital Structure tabs — "Pref. Equity: —" |
| + Operating lease liabilities (separate add) | Not applicable — already inside Total Debt | See note above |
| + Underfunded pension / other long-term obligations | Not added (see below) | — |
| − Cash & equivalents (+ ST investments) — **headline / vendor basis** | (20,664) | Capital IQ Balance Sheet tab: Cash and Equivalents 11,251 + Short Term Investments 9,413 = 20,664, Mar-31-2026; Q1 2026 report balance sheet |
| **= Enterprise value (EV) — headline** | **187,555** | Formula above; matches Capital IQ's own precomputed TEV of NOK 187,555.05 mm |

**Cash quality — a materially different, more conservative EV.** The headline NOK 20,664mm "cash & ST investments" line nets in two blocks the company itself says are not freely available to service group debt:
- **NOK 1,390mm** held in Norsk Hydro's captive insurance subsidiary, Industriforsikring AS. The company's own words: "Cash and cash equivalents and short-term investments in Hydro's captive insurance company... are assumed to not be available to service or repay future Hydro debt, and are therefore excluded from the measure adjusted net debt." [Q1 2026 report, "Adjusted net debt" note, footnote 3]
- **NOK 3,439mm** posted as collateral for short-term and long-term liabilities — restricted, mainly tied to derivatives used for risk management. [Q1 2026 report, "Adjusted net debt" note, footnote 2]

Netting only the freely available balance (20,664 − 1,390 − 3,439 = **NOK 15,835mm**) gives:

| Component | Amount (NOK mm) |
|---|---:|
| Market capitalization | 166,970 |
| + Total debt | 33,754 |
| + Minority interest | 7,495 |
| − Cash quality-adjusted (freely available cash & ST investments) | (15,835) |
| **= Enterprise value — cash-quality adjusted** | **192,384** |

**This cash-quality-adjusted EV (NOK 192,384 million) is the canonical figure for this report**, per the conservative default (CLAUDE.md §4/§6): the captive-insurance balance and the derivatives-collateral balance are not cash the group could use to pay down debt, by the company's own admission, so treating them as ordinary netting cash understates EV by roughly NOK 4,829 million (~2.6% of the headline EV) and flatters net debt by the same amount. The headline vendor figure (NOK 187,555 million) is shown alongside because it is what Capital IQ and most screens will display by default — downstream agents should use the NOK 192,384 million adjusted figure unless they have a specific reason to prefer the headline.

**Adjustments NOT made:**
- **Pension:** Norsk Hydro carries a Pension & Other Post-Retirement Benefits liability of NOK 8,496mm (Mar-31-2026, already inside Total Liabilities) and separately discloses a "Net pension asset (obligation) at fair value, net of expected tax benefit" of +NOK 1,373mm in its own "Adjusted net debt" APM — i.e., the company treats its pension position as broadly funded, not a material debt-like add-on. This report does not add pension obligations to the EV bridge; the balance-sheet pension liability is already captured inside standard liabilities, not inside "Total Debt."
- **Equity-method investments:** NOK 21,654mm of long-term/equity-method investments (Mar-31-2026) — including Hydro's stake in the Qatalum smelter joint venture — sit inside total assets and are not netted separately from EV here. These are operating joint ventures integral to segment economics (reported within the Hydro Aluminium Metal segment), not passive financial holdings, so following Capital IQ's own treatment, they are left inside the consolidated asset base rather than carved out.
- **Contingent liabilities / other provisions:** not added; no separate quantified contingent-liability figure was identified as EV-bridge-relevant in this pass.

## 5. Net Debt & Leverage Snapshot

LTM EBITDA (through Mar-31-2026) = NOK 47,604mm [Capital IQ Key Stats tab, "EBITDA," LTM 12 months Mar-31-2026A — this is the company's reported (unadjusted) EBITDA, not Hydro's own "Adjusted EBIT"-based measure].

| Metric | Value (NOK mm) | Basis | Source |
|---|---:|---|---|
| Total debt | 33,754 | — | Section 4 |
| Cash & ST investments (headline) | 20,664 | broad (§15) | Section 4 |
| Freely available cash (adjusted) | 15,835 | — | Section 4 |
| Net debt — strict (debt − cash & equivalents only, excl. ST investments) | 22,503 | strict | Balance Sheet tab: 33,754 − 11,251 |
| Net debt — broad / headline (debt − cash & ST investments) | 13,090 | broad | Capital IQ Balance Sheet / Capital Structure Summary tabs, "Net Debt," Mar-31-2026 |
| **Net debt — cash-quality adjusted (canonical for this report)** | **17,919** | broad, ex-trapped balances | 33,754 − 15,835 |
| Company's own "Net debt" APM (nets cash + ST investments, LT-liability collateral only) | 12,860 | company-defined | Q1 2026 report, "Adjusted net debt" note: "Net debt" row = (12,860) |
| Company's own "Adjusted net debt" APM (further nets ST+LT collateral, excludes captive-insurance cash, nets pension asset and other provisions) | (21,579) i.e. net cash | company-defined, broadest | Q1 2026 report, "Adjusted net debt" note |
| Net debt (broad) / LTM EBITDA | 0.27x | GAAP/reported EBITDA | 13,090 / 47,604 |
| Net debt (cash-quality adjusted) / LTM EBITDA | 0.38x | GAAP/reported EBITDA | 17,919 / 47,604 |

Norsk Hydro discloses its own "Net debt" and "Adjusted net debt" alternative performance measures (APMs), which differ from both the strict and broad §15 definitions used above because the company's APMs also net collateral, pension, and provisions. None of these three readings ("Net debt" broad/headline, "Net debt" cash-quality adjusted, or the company's own APMs) should be assumed interchangeable — each is labeled above every time it is used, per CLAUDE.md §15.

## 6. Per-Share Reference Values

All per-share figures use 1,965.28 million shares (Section 2), NOK, as of Mar-31-2026.

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | NOK 52.17 | Book Value of Common Equity NOK 102,510mm ÷ 1,965.28mm shares [Capital IQ Balance Sheet tab, "Book Value/Share," Mar-31-2026: 52.17 — matches] |
| Tangible book value per share | NOK 48.45 | Tangible Book Value NOK 95,216mm ÷ 1,965.28mm shares [Capital IQ Balance Sheet tab, "Tangible Book Value/Share," Mar-31-2026: 48.46 — matches to rounding] |
| Net debt per share (broad / headline) | NOK 6.66 | 13,090 / 1,965.28 |
| Net debt per share (cash-quality adjusted, canonical) | NOK 9.12 | 17,919 / 1,965.28 |

## 7. Anchor Summary (canonical numbers for downstream agents)

- Current price: NOK 84.96, as of 2026-07-17 (last close, Capital IQ)
- Share counts: 1,965.28 million used for BOTH market cap and per-share fair value (basic ≈ fully diluted; company states no significant diluting elements)
- Market cap: NOK 166,970 million
- Enterprise value: NOK 192,384 million (cash-quality adjusted, canonical) — headline/vendor figure is NOK 187,555 million (do not use without the adjustment note)
- Net debt: NOK 17,919 million (cash-quality adjusted, canonical) — headline/vendor "broad" figure is NOK 13,090 million; strict (cash & equivalents only) is NOK 22,503 million
- Reporting currency: NOK (no FX conversion anywhere in this report)

Key caveats for downstream agents: (1) the EV/net-debt bridge uses a canonical cash-quality adjustment that nets out NOK 1,390mm of captive-insurance cash and NOK 3,439mm of derivatives collateral — always use the "cash-quality adjusted" row, not the raw Capital IQ headline, unless explicitly reconciling to the vendor number; (2) the balance sheet (Mar-31-2026) is about 3.5 months older than the price (Jul-17-2026) because Q2 2026 results have not yet been released (due 2026-07-22) — the capital structure will refresh within days of this report; (3) dilution instruments (founder/subscription certificates) exist but are undisclosed in size — labeled a limitation, not expected to be material.

### Anchor Block (copy-forward)

- Price: NOK 84.96 (2026-07-17, last close)
- Price-state: pool-verified
- Currency: NOK
- Shares (market cap): 1,965.28 million (FY2025 Annual Report Note 7.6 / Q1 2026 report / Capital IQ — as-of Mar-31-2026, unchanged through pricing date)
- Shares (per-share fair value): 1,965.28 million (same source; no material dilution)
- Market cap: NOK 166,970 million
- Net debt: NOK 17,919 million (cash-quality adjusted, canonical; headline/vendor broad figure NOK 13,090 million; strict figure NOK 22,503 million)
- EV: NOK 192,384 million (cash-quality adjusted, canonical; headline/vendor figure NOK 187,555 million)
- Key caveats: EV/net-debt bridge is cash-quality adjusted (nets out captive-insurance cash and derivatives collateral that the company itself says are unavailable to repay debt) — always cite the adjusted figure; balance sheet is Mar-31-2026, ~3.5 months older than the price, and refreshes with Q2 2026 results due 2026-07-22; dilution-instrument sizing (founder/subscription certificates) is undisclosed, labeled a limitation.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — NHY

Reporting currency: **Norwegian krone (NOK)**, all figures in NOK million except per-share items, matching `01_price-and-capital-structure.md`. Business type: integrated commodity (aluminium/energy) operating company [`analyses/NHY_2026-07-19/valuation/00_valuation-data-triage.md`]. Per the Business-Type Method Map, EV-based multiples (EV/EBITDA, EV/EBIT, EV/Sales) plus P/E and FCF yield are the primary read for a commodity/cyclical name; P/B and dividend yield are shown as supplementary context, not primary.

**Anchors used (verbatim from `01_price-and-capital-structure.md`):** price NOK 84.96 (2026-07-17, pool-verified last close); shares 1,965.28 million; market cap NOK 166,970 million; EV NOK 192,384 million (cash-quality-adjusted, canonical — headline/vendor EV NOK 187,555 million); net debt NOK 17,919 million (cash-quality-adjusted, canonical); minority interest NOK 7,495 million.

**Critical data-quality flag carried into this report (read before the tables).** `earnings/01_historical-financials.md` documented that Capital IQ's own EBITDA/EBIT fields in the `Norsk Hydro ASA OB NHY Financials.xls` Income Statement/Key Stats tabs do **not** reconcile to the company's own audited EBITDA/EBIT (e.g. FY2025: CIQ EBITDA 51,454 vs company-reported/audited EBITDA 25,696 — CIQ's figure is roughly double; FY2025 CIQ EBIT 41,218 vs audited EBIT 14,401 — nearly triple). That earnings-module finding traced the gap to a CIQ income-statement reclassification mismatch specific to Hydro's IFRS "nature of expense" format, not a real economic item. Revenue, diluted EPS, CFO, and capex reconcile cleanly between CIQ and the audited filings; EBITDA and EBIT sourced from the same `Financials.xls` workbook do not. This means: (a) `01_price-and-capital-structure.md`'s own "LTM EBITDA = NOK 47,604mm" (used there for its leverage snapshot, sourced to the same CIQ Key Stats field) is on the same unreconciled CIQ basis, not the audited basis — flagged here as a cross-module divergence, not silently overridden; (b) every EV/EBITDA and EV/EBIT multiple pulled directly from the CIQ Multiples/Key Stats tabs (both the "current" column and the historical time series) sits on this unreconciled vendor basis; (c) this report computes a second, audited-basis EV/EBITDA and EV/EBIT using `earnings/01`'s company-reported figures, and keeps the two bases clearly separated throughout — they are never averaged or substituted for one another.

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E (reported EPS) | LTM (through 31-Mar-2026) | EPS NOK 3.11 (diluted, reported) | **27.32x** | `earnings/01_historical-financials.md` §2 (TTM EPS 3.11, reconciled to CIQ); price/shares from `01` |
| P / E (reported EPS) | NTM (FY2026E consensus) | EPS NOK 8.80 | **9.65x** (CIQ's own NTM close: 9.14x, see note¹) | `earnings/04_guidance-consensus.md` (consensus as of 2026-07-15); CIQ Estimates Report Multiples tab, NTM column: 9.14x |
| P / E (reported EPS) | FY2026E | EPS NOK 8.80 | **9.65x** | CIQ Estimates Report Multiples tab, FY2026 column |
| EV / EBITDA — **CIQ vendor basis (unreconciled, see flag above)** | LTM | CIQ "EBITDA" NOK 47,604mm | **3.92x** (CIQ close, headline-EV basis; 4.04x on this report's canonical EV) | Capital IQ Multiples tab, `Financials.xls`, close value 2026-07-17 |
| EV / EBITDA — **audited / company-reported basis** | LTM | EBITDA NOK 21,976mm | **8.76x** | `earnings/01_historical-financials.md` §2 (TTM EBITDA, company-reported); EV from `01` |
| EV / EBITDA — CIQ vendor basis | NTM | CIQ NTM EBITDA (consensus) | **5.13x** | CIQ Estimates Report Multiples tab, NTM column |
| EV / EBITDA — CIQ vendor basis | FY2026E | CIQ FY2026E EBITDA NOK 36,330mm | **5.16x** | CIQ Estimates Report Multiples tab, FY2026 column |
| EV / EBIT — **CIQ vendor basis (unreconciled)** | LTM | CIQ "EBIT" NOK 37,290mm | **5.00x** (CIQ close, headline-EV basis; 5.16x on canonical EV) | Capital IQ Multiples tab, close value 2026-07-17 |
| EV / EBIT — **audited / company-reported basis** | LTM | EBIT NOK 10,781mm | **17.84x** | `earnings/01_historical-financials.md` §2; EV from `01` |
| EV / EBIT — CIQ vendor basis | FY2026E | CIQ FY2026E EBIT | **7.29x** | CIQ Estimates Report Multiples tab, FY2026 column |
| EV / Sales | LTM (Revenue reconciles cleanly) | Revenue NOK 201,266mm | **0.93x** (CIQ close, headline-EV basis; 0.96x on canonical EV) | Capital IQ Multiples tab, close 2026-07-17; revenue cross-checked in `earnings/01` |
| EV / Sales | FY2026E | Revenue NOK 213,366mm (consensus) | **0.88x** | CIQ Estimates Report Multiples tab, FY2026 column |
| P / Book | LTM | Book value/share NOK 52.17 | **1.63x** | `01_price-and-capital-structure.md` §6; price from `01` |
| P / Tangible Book | LTM | Tangible BV/share NOK 48.45 | **1.75x** | `01_price-and-capital-structure.md` §6 |
| P / FCF (module-standard, CFO − capex) | LTM (through 31-Mar-2026) | FCF NOK 5,810mm → NOK 2.96/sh | **28.74x** (FCF yield 3.48%) | `earnings/01_historical-financials.md` §2 |
| P / FCF, for comparison | FY2025 (full year) | FCF NOK 11,729mm → NOK 5.97/sh | **14.24x** (FCF yield 7.03%) | `earnings/01_historical-financials.md` §1 |
| Dividend yield | LTM (current) | — | **3.5%** | Capital IQ Public Company Capsule, `NorskHydroASAOBNHY_PublicCompany.pdf`, as of 2026-07-18 |

¹ The 9.65x figure uses `earnings/04`'s consensus EPS snapshot (as of 2026-07-15, NOK 8.80). CIQ's own Multiples-tab NTM P/E close on 2026-07-17 is 9.14x (implied NTM EPS ≈ NOK 9.29) — a ~5.6% gap most likely reflecting a slightly different consensus pull-date between the two CIQ exports in the pool, not a basis error. Both are shown; the historical-band percentile work in Section 2 uses the CIQ Multiples-tab series consistently (9.14x) so the current point and the band are drawn from the same source.

**Reported vs adjusted, stated once:** all P/E figures above use reported (non-APM) diluted EPS. The company's own "Adjusted EPS" APM (which excludes unrealized LME/power-derivative mark-to-market swings) was NOK 5.02 for FY2025 versus reported NOK 3.41 [`earnings/01_historical-financials.md` §4] — a materially different number. This report does not use the Adjusted-EPS APM for its P/E multiples because no adjusted-EPS time series exists in the CIQ Multiples tab to build a comparable historical band; flagged as a limitation, not a substitution.

## 2. Historical Multiple Bands

**This is not a 3–5 year band.** The only multi-period multiple time series in the data pool is Capital IQ's quarterly Multiples tab, which covers six data points from 2025-06-30 to 2026-07-17 — **about 13 months**, well under the 3-year threshold in the partial-data rule. No longer multiple history (5-year Capital IQ multiples export, annual multiples commentary in the annual report/investor deck) exists anywhere in the pool. Per the partial-data rule for a short own-history: the table below is shown for a **directional "where in its short range it sits" read only** — the mean/median are not treated as a fair-value reversion target (Section 4 is illustrative-only, not a `07` input).

Quarter-end close values, `Norsk Hydro ASA OB NHY Financials.xls`, Multiples tab (Jun-25, Sep-25, Dec-25, Mar-26, Jun-26, Jul-17-26):

| Multiple | Min | Mean | Median | Max | Current | Percentile of (13-month) Range |
|---|---:|---:|---:|---:|---:|---:|
| EV / Sales (LTM) | 0.64x | 0.86x | 0.87x | 1.06x | 0.93x | ~69th |
| EV / EBITDA (LTM, **CIQ vendor basis**) | 2.39x | 3.41x | 3.47x | 4.29x | 3.92x | ~81st |
| EV / EBIT (LTM, **CIQ vendor basis**) | 2.91x | 4.24x | 4.34x | 5.35x | 5.00x | ~86th |
| P / E (LTM, reported EPS) | 11.83x | 21.02x | 20.69x | 30.06x | 27.32x | ~85th |
| P / Book | 1.11x | 1.55x | 1.57x | 2.02x | 1.63x | ~57th |
| P / E (NTM, consensus EPS) | 8.20x | 10.73x | 10.40x | 14.71x | 9.14x | ~15th |
| EV / EBITDA (NTM, **CIQ vendor basis**) | 4.84x | 5.54x | 5.26x | 6.98x | 5.13x | ~13th |

No historical band could be built for EV/EBITDA or EV/EBIT on the **audited basis** (the 8.76x / 17.84x current figures in Section 1): the pool's company-reported quarterly EBITDA/EBIT series is incomplete (only Q1'25, Q4'25, and Q1'26 are individually disclosed — Q2'25 and Q3'25 are not in the pool, per `earnings/01_historical-financials.md` §3), so a quarterly audited-basis EV/EBITDA time series cannot be constructed. This is a genuine data gap, not an estimate. No historical band was built for P/FCF or dividend yield either — CIQ's own "Levered FCF" field shows the same reclassification-scale symptom as EBITDA/EBIT (its implied FY2025 levered FCF of ~NOK 25,800mm does not match either the module-standard FCF of NOK 11,729mm or the company's own FCF APM of NOK 13,034mm), so that series is not trusted for a P/FCF band, and no dividend-yield time series exists in the pool.

## 3. Re-Rating / De-Rating Read

The three most reliable multiples here are **P/E (LTM and NTM)**, because diluted EPS reconciles cleanly to the audited filings, and **EV/Sales**, because revenue also reconciles cleanly — EV/EBITDA and EV/EBIT on the CIQ vendor basis are directionally usable (the company/CIQ EBITDA ratio has stayed roughly stable at ~0.48–0.51x across FY2023–FY2025, so the *trend* is probably informative even though the *level* is not) but are not used for the headline read below.

The stock has re-rated up sharply on a trailing basis and re-rated down on a forward basis over the same 13 months, and the two moves have the same cause. LTM P/E sits at the 85th percentile of its own 13-month range, a +30% premium to its own mean (21.02x) and +32% to its own median (20.69x) [(27.32−21.02)/21.02 = +30.0%; (27.32−20.69)/20.69 = +32.1%]. But NTM P/E sits at only the 15th percentile of the same window, a −15% discount to its own mean and −12% to its own median [(9.14−10.73)/10.73 = −14.8%; (9.14−10.40)/10.40 = −12.1%]. EV/Sales (LTM), the cleanest EV-based read, sits mid-to-high in its range at the 69th percentile, +8.4% above its own mean and +6.6% above its own median — a real but far more modest re-rating than the P/E read suggests.

The trailing "re-rating" is mostly a denominator effect from a cyclical earnings trough, not a re-pricing of the business. LTM EPS (NOK 3.11) is depressed by a near-loss Q4 2025 (EPS NOK −1.20 on a large unrealized LME-derivative timing loss) [`earnings/01_historical-financials.md` §3, §6], which mechanically inflates the trailing P/E even as the price moved less. NTM P/E's low percentile confirms this: on the earnings level the Street actually expects over the next twelve months, the multiple sits near the bottom of its own recent range, not the top. EV/Sales — unaffected by this earnings-cycle distortion — shows the more modest, probably more honest, re-rating: up, but not dramatically, from where it traded a year ago. **The warranted multiple has not obviously structurally changed** (no evidence of a moat improvement or a permanent step-up in returns from the business-model/earnings modules reviewed for this report); what changed is where LTM earnings sit in the aluminium price cycle.

## 4. Implied Value from Reversion — Illustrative Only, Not a `07` Fair-Value Input

Own history here is ~13 months, well short of the ~3-year threshold. Per the partial-data rule, the figures below are a **directional illustration of what reversion to the recent 13-month range would imply**, not a mean/median point or tight range for the master valuation triangulation in `07_scenario-and-fair-value`. Do not treat any single number below as a base-case fair value.

| Multiple | Reversion Target (13-mo mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price (NOK 84.96) |
|---|---:|---:|---:|---:|
| P / E (LTM) | mean 21.02x / median 20.69x | — (direct per-share) | NOK 65.37 / NOK 64.33 | −23.1% / −24.3% |
| P / E (NTM) | mean 10.73x / median 10.40x | — (direct per-share) | NOK 94.44 / NOK 91.54 | +11.2% / +7.7% |
| EV / Sales (LTM) | mean 0.86x / median 0.87x | EV NOK 172,975mm / 175,942mm → equity NOK 147,561mm / 150,528mm | NOK 75.07 / NOK 76.58 | −11.6% / −9.9% |
| P / Book | mean 1.55x / median 1.57x | — (direct per-share) | NOK 81.10 / NOK 81.91 | −4.5% / −3.6% |
| EV / EBITDA (LTM, CIQ vendor basis — flagged) | mean 3.41x / median 3.47x | EV NOK 162,214mm / 165,358mm → equity NOK 136,800mm / 139,944mm | NOK 69.61 / NOK 71.21 | −18.1% / −16.2% |
| EV / EBIT (LTM, CIQ vendor basis — flagged) | mean 4.24x / median 4.34x | EV NOK 158,264mm / 161,720mm → equity NOK 132,850mm / 136,306mm | NOK 67.60 / NOK 69.35 | −20.4% / −18.4% |

Illustrative single point (named, not a fair-value input): the own-median P/E (LTM), the most reliable single reconciled multiple, implies NOK 64.33/share, −24.3% versus the current price. **This point should not be read in isolation** — the own-median NTM P/E, using the same reconciled EPS line but the forward earnings level, implies NOK 91.54/share, +7.7% versus current price. The dispersion across the six method/basis combinations above runs from NOK 64.33 to NOK 94.44/share (−24.3% to +11.2% versus current price), and the LTM-vs-NTM P/E split is the single biggest driver of that spread — it is a cycle-position effect (Section 3), not six independent views of fair value. Reversion assumes the warranted multiple has not structurally changed; business-model/earnings evidence reviewed here supports treating the LTM-basis discount signal with caution (depressed trailing earnings) and gives no positive evidence of a genuine quality/moat re-rating on the NTM-basis premium either.

## 5. Own-History Read

On a 13-month lookback — the only history in the pool, and short of the 3-year bar this analysis is built for — Norsk Hydro's stock has re-rated up hard on trailing earnings (LTM P/E at the 85th percentile of its own range, +30% to its own mean) but sits cheap on forward earnings (NTM P/E at the 15th percentile, −15% to its own mean); EV/Sales, the cleanest EV-based read, shows a real but modest premium (+8% to mean). The single biggest caveat is that this whole trailing-vs-forward split is a mechanical artifact of a depressed LTM earnings base (a near-loss Q4 2025 quarter) rather than a genuine business re-rating — reverting the LTM P/E to its own mean would imply a ~23% lower share price, while reverting the NTM P/E to its own mean implies an ~11% higher one, and neither should be trusted as a standalone fair-value read given how little history backs either number.

A second, structural caveat applies on top of the short-history one: the management-governance module flagged the Norwegian State's 34.49% controlling stake as a structurally misaligned owner (RF-OWN-004, CLAUDE.md §24 Filter 6) — the State's own stated rationale for the holding is retaining head-office and technology functions in Norway, an industrial-policy objective, not per-share value maximization, and the Board has declined to adopt takeover-bid-handling principles specifically because of the size of that stake [`management-governance/99_management-governance-synthesis.md`, RF-OWN-004]. Per the module rules, this caps valuation attractiveness at 60 and means a cheap-looking multiple here (the NTM P/E discount, or any future dip back toward the 13-month low) cannot be read as an automatic margin of safety: if the multiple is depressed for cycle or control-related reasons the State has no mandate to correct, reversion to even this short own-history mean is not the base case, only one illustrative possibility among several.



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — NHY

Reporting currency for NHY's own anchor figures: NOK (per `01_price-and-capital-structure.md`). The peer comp workbook (Capital IQ) is denominated in USD. An FX rate of **NOK/USD ≈ 9.63** is used to convert USD comp figures to NOK — this rate is derived, not filed: cross-checked two ways from the comp workbook itself (NHY share price 84.96 NOK ÷ 8.82 USD = 9.633; NHY market cap NOK 166,970mm ÷ USD 17,324.5mm = 9.638) [Company Comparable Analysis Norsk Hydro ASA.xls, Financial Data tab, as of 2026-07-18]. *Inference (FX rate), not from filings — internally cross-validated to within 0.05 of itself.* Multiples themselves (ratios) are currency-invariant and need no conversion; only the implied-price-per-share figures in §5 are converted.

**Data-quality flag carried forward from `earnings/01_historical-financials.md` (read before the tables below).** The Capital IQ "EBITDA" and "EBIT" fields used throughout the peer comp workbook for NHY (LTM EBITDA USD 4,939.3mm ≈ NOK 47,585mm; LTM EBIT USD 3,869.1mm) do **not** reconcile to Hydro's own audited/reported figures (TTM reported EBITDA NOK 21,976mm, TTM reported EBIT NOK 10,781mm, through Mar-2026) [earnings/01_historical-financials.md §1 data-quality note, §2; first-quarter-report-2026.pdf; Integrated Annual Report 2025, p.140]. This is a Capital IQ income-statement reclassification mismatch specific to Hydro's IFRS "nature of expense" format, not a real economic item — it inflates NHY's EBITDA/EBIT denominator roughly 1.7x–2.2x versus the audited basis, making NHY's **LTM** TEV/EBITDA and TEV/EBIT multiples in the comp workbook look artificially low. The same corrupted EBITDA figure also feeds `01_price-and-capital-structure.md`'s LTM EBITDA of NOK 47,604mm (Key Stats tab) — that figure is **not** company-reported EBITDA despite its label there; this is flagged here for reconciliation, not silently overridden. Per CLAUDE.md §4/§5 (audited filing over vendor for the same metric), this report restates NHY's own LTM EV/EBITDA and EV/EBIT using the company's audited TTM EBITDA/EBIT wherever the LTM basis is used (§2–§3 below), while peer LTM EBITDA/EBIT figures remain the unverified CIQ vendor basis (their own audited filings are outside this pool) — a basis-comparability caveat stated explicitly wherever it applies. **NTM (forward) EBITDA is unaffected**: NHY's NTM EBITDA (Capital IQ, USD 3,793.59mm ≈ NOK 36,548mm) cross-checks almost exactly to the FY2026E consensus Adjusted EBITDA of NOK 36,330mm found independently in the Estimates Report Guidance tab [NorskHydroASAOBNHYEstimatesReport (1).xls, Guidance tab] — this is a clean, consensus-sourced forward figure, not the corrupted LTM reclassification. Revenue, EPS, and book value fields for NHY are also unaffected (spot-checked exactly against audited figures in `earnings/01_historical-financials.md` §1). **Practical effect: trust NTM multiples, EV/Sales, and P/E for NHY in this report; do not trust the raw LTM EV/EBITDA or LTM EV/EBIT vendor figures for NHY without the restatement below.**

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| United Company RUSAL | SEHK:486 | Integrated bauxite-alumina-aluminium producer, same chain as Hydro's Bauxite & Alumina + Aluminium Metal segments; larger volume (LTM revenue USD 14,812mm vs Hydro USD 20,883mm — 0.71x), far weaker margin (LTM EBITDA margin 7.0% vs Hydro 23.7% on the same CIQ basis) and much higher leverage (Total Debt/EBITDA 9.3x vs Hydro 0.7x) | **Core** — named directly in Hydro's own FY2025 remuneration/TSR peer group AND present in the CIQ relevancy-scored comp set [`business-model/08_competitive-map.md`, Competitor A; integrated-annual-report-2025.pdf, p.2992] |
| Aluminum Corporation of China ("Chalco") | SEHK:2600 | Bauxite-alumina-aluminium-energy integrated producer, largest-revenue peer (1.7x Hydro), state-linked, China-domestic-demand-driven | **Core** — named in Hydro's own TSR peer group AND in the CIQ set [`08_competitive-map.md`, Competitor B] |
| Hindalco Industries | BSE:500440 | Integrated aluminium (upstream + downstream Extrusions-equivalent) plus copper via Novelis; overlaps Hydro's Aluminium Metal and Extrusions segments most directly of the three core peers | **Core** — named in Hydro's own TSR peer group AND in the CIQ set [`08_competitive-map.md`, Competitor C] |
| Anglo American plc | LSE:AAL | Diversified miner (copper, iron ore, platinum group metals, some metallurgical coal) — touches aluminium-adjacent commodity cycles but is not an aluminium producer | Broader CIQ relevancy-scored set only — not in Hydro's own named peer group |
| Antofagasta plc | LSE:ANTO | Copper-focused miner, no material aluminium exposure | Broader CIQ set only |
| Boliden AB | OM:BOL | Base-metals/zinc-copper smelter and miner, some aluminium-adjacent smelting economics but not a primary-aluminium producer | Broader CIQ set only |
| Shandong Hongqiao Aluminum | SZSE:002379 | China-based integrated bauxite-alumina-aluminium producer, direct business overlap | Broader CIQ set only (not in Hydro's disclosed TSR peer list, but a direct aluminium-chain match) |
| Constellium SE | NYSE:CSTM | Downstream rolled/extruded aluminium products, primarily automotive/aerospace/packaging — closest match to Hydro Extrusions specifically, not the upstream chain | Broader CIQ set only |
| Grupa Kety S.A. | WSE:KTY | Polish aluminium extrusion/systems producer — downstream match to Hydro Extrusions | Broader CIQ set only |
| ProfilGruppen AB | OM:PROF B | Small Swedish aluminium extrusion producer — downstream match to Hydro Extrusions, smallest peer by scale | Broader CIQ set only |

**Source of the set.** The full 10-company set is Hydro's own Capital IQ-generated "Quick Comparable Analysis," relevancy-scored by Capital IQ's proprietary algorithm, not hand-picked by Hydro [Company Comparable Analysis Norsk Hydro ASA.xls, Business Description tab, as of 2026-07-18]. Three of the ten (RUSAL, Chalco, Hindalco) also appear in Hydro's own disclosed remuneration/TSR benchmarking peer group [integrated-annual-report-2025.pdf, p.2992], making them the most credible primary-aluminium-chain matches — the diversified miners (Anglo American, Antofagasta, Boliden) only touch aluminium tangentially or not at all, and three names (Constellium, Grupa Kety, ProfilGruppen) are downstream-extrusion-only businesses, a partial match to Hydro's smallest, currently loss-making Extrusions segment rather than to the group as a whole [`08_competitive-map.md` §2, §4].

**Named peers with no public multiples in this pool.** Hydro's TSR peer group also names Alcoa, Century Aluminum, Kaiser Aluminum, National Aluminium Co. (Nalco), and Tredegar Corporation [integrated-annual-report-2025.pdf, p.2992]. None of these five appear in this pool's Capital IQ comp export. This is a completeness gap, not a peer-data cap under the module's partial-data rule (a 10-company comp set with LTM/NTM multiples is present and the triage verdict is "Sufficient" — `00_valuation-data-triage.md` §5–§6); the five missing names are flagged here rather than web-sourced, since the existing 10-company set is judged adequate to establish a peer median.

## 2. Peer Multiples & Operating Stats

All figures from the Capital IQ Quick Comparable Analysis export, as of 2026-07-18, unless noted [Company Comparable Analysis Norsk Hydro ASA.xls, Trading Multiples / Operating Statistics / Financial Data tabs].

| Company | P/E (LTM) | EV/EBITDA (LTM) | EV/EBIT (LTM) | EV/Sales (LTM) | FCF Yield | Rev Growth (LTM YoY) | EBITDA Margin (LTM) | ROIC / Return on Capital | Total Debt/EBITDA (LTM) | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **NHY** (vendor basis) | 27.3x | 3.9x¹ | 5.0x¹ | 0.9x | 3.5%³ (equity, TTM) | −5.6% | 23.7%¹ | Adj. RoaCE 10.2% FY25 / 13.3% 5-yr avg⁴ | 0.7x¹ | 2026-07-18 (vendor); ¹restated below |
| Anglo American (AAL) | NM | 10.2x | 15.9x | 3.5x | n/a | +4.5% | 32.2% | n/a | 2.5x | 2026-07-18 |
| Boliden (BOL) | 13.0x | 6.4x | 10.6x | 1.6x | n/a | +9.1% | 24.4% | n/a | 0.9x | 2026-07-18 |
| Shandong Hongqiao (002379) | 12.0x | 7.3x | 8.4x | 1.5x | n/a | −16.5% | 20.9% | n/a | 0.7x | 2026-07-18 |
| ProfilGruppen (PROF B) | 5.7x | 3.3x | 4.8x | 0.4x | n/a | −3.6% | 11.5% | n/a | 0.4x | 2026-07-18 |
| Grupa Kety (KTY) | 21.1x | 13.1x | 16.8x | 2.5x | n/a | +4.9% | 19.0% | n/a | 1.3x | 2026-07-18 |
| Antofagasta (ANTO) | 34.9x | 10.4x | 15.6x | 6.2x | n/a | +30.4% | 57.2% | n/a | 1.5x | 2026-07-18 |
| RUSAL (486) | NM | 8.1x | 12.6x | 0.9x | n/a | +22.6% | 7.0% | ROE ~6.9% — web, unverified⁵ | 9.3x | 2026-07-18 |
| Constellium (CSTM) | 9.1x | 6.0x | 9.2x | 0.6x | n/a | +20.1% | 10.6% | n/a | 2.1x | 2026-07-18 |
| Hindalco (500440) | 15.6x | 7.9x | 10.5x | 1.0x | n/a | +15.3% | 12.9% | ROCE ~14.6% / ROE ~13.9% — web, unverified⁵ | 2.8x | 2026-07-18 |
| Chalco (2600) | 7.8x | 4.6x | 5.9x | 0.9x | n/a | −0.05% | 18.6% | ROE ~18.6% / ROIC ~10.1% — web, unverified⁵ | 1.3x | 2026-07-18 |
| **Peer median** | **12.5x** | **7.6x** | **10.5x** | **1.3x** | n/a | **+7.0%** | **18.8%** | n/a (insufficient clean data) | **1.4x** | 2026-07-18 |

¹ **Restated NHY figures (company-reported, audited basis) — the figures this report treats as authoritative for NHY's own LTM EV/EBITDA, EV/EBIT and EBITDA margin, per the data-quality flag above:**
- TTM (through Mar-2026) reported EBITDA NOK 21,976mm; reported EBIT NOK 10,781mm [earnings/01_historical-financials.md §2, sourced to first-quarter-report-2026.pdf + Integrated Annual Report 2025]
- Canonical EV (cash-quality adjusted) NOK 192,384mm [`01_price-and-capital-structure.md` §4]
- **Restated EV/EBITDA = 192,384 / 21,976 = 8.75x** (vs vendor 3.9x)
- **Restated EV/EBIT = 192,384 / 10,781 = 17.84x** (vs vendor 5.0x)
- **Restated EBITDA margin (TTM reported) = 21,976 / 201,265 (TTM revenue) = 10.9%**; FY2025 Adjusted EBITDA margin = 28,889 / 207,971 = 13.9% (vs vendor's 23.7%, which uses the corrupted EBITDA)
- Peer figures in this table remain the unverified CIQ vendor basis — their audited annual reports are outside this pool, so a fully "clean-to-clean" comparison cannot be built; this is a residual limitation, not a claim that peer figures are also wrong.

² NTM (forward) multiples are unaffected by the data-quality issue (verified against independent consensus data — see header note) and are used as the primary comparison basis in §3 and §5: NHY NTM TEV/Fwd Revenue 0.85x, NTM TEV/Fwd EBITDA 5.13x, NTM Forward P/E 9.14x [Company Comparable Analysis Norsk Hydro ASA.xls, Trading Multiples tab]; peer medians: NTM TEV/Fwd Revenue 1.3x, NTM TEV/Fwd EBITDA 6.25x, NTM Forward P/E 11.5x (same tab).

³ FCF yield (equity) = TTM FCF (CFO − capex, module-standard definition) NOK 5,810mm ÷ market cap NOK 166,970mm = 3.5% [earnings/01_historical-financials.md §2; `01_price-and-capital-structure.md` §3]. Not available for peers — the CIQ comp export's Trading Multiples and Operating Statistics tabs carry no FCF or unlevered-FCF line for the comp set; not web-sourced in this pass given the multiple set is otherwise sufficient to establish a peer median.

⁴ NHY return-on-capital figure is Hydro's own disclosed Adjusted Return on average Capital Employed (RoaCE), not a CIQ field — the CIQ "Return on Capital %" field for Hydro (18.0% FY2025) uses a different EBIT definition that does not reconcile to Hydro's own segment EBIT and is not preferred, per `business-model/09_moat.md` §3. Reported (unadjusted) RoaCE was 7.2% FY2025 — below the 10.2% Adjusted figure.

⁵ Peer ROE/ROIC/ROCE figures for RUSAL, Hindalco and Chalco are dated web reads, not each company's own primary filing in this pool, carried forward from `business-model/08_competitive-map.md` and `09_moat.md` [Web: wisesheets.io / gurufocus.com / alphaspread.com aggregator pages, accessed 2026-07-19, unverified]. The remaining 6 peers have no return-on-capital figure available in this pool and are not web-sourced here — labeled "n/a," not guessed.

## 3. Premium / Discount to Peer Median

| Multiple | Company | Peer Median | Premium / (Discount) | Reliability |
|---|---:|---:|---:|---|
| LTM EV/EBITDA — vendor basis | 3.9x | 7.6x | **(48.7%)** discount | **Unreliable — see restated row below** |
| LTM EV/EBITDA — restated (company-reported EBITDA) | 8.75x | 7.6x | **+15.1%** premium | Higher confidence for NHY's own figure; peer side still unverified CIQ basis |
| LTM EV/EBIT — vendor basis | 5.0x | 10.5x | **(52.4%)** discount | **Unreliable — see restated row below** |
| LTM EV/EBIT — restated (company-reported EBIT) | 17.84x | 10.5x | **+69.9%** premium | NHY's TTM reported EBIT (NOK 10,781mm) is itself trough-depressed (−25.1% YoY per `earnings/01_historical-financials.md` §2) — treat this reading as low-confidence in both directions, shown for completeness, not used in §5 |
| LTM TEV/Sales | 0.9x | 1.3x | **(30.8%)** discount | Reliable — revenue confirmed clean against audited figures |
| NTM TEV/Fwd Revenue | 0.85x | 1.3x | **(34.6%)** discount | Reliable |
| NTM TEV/Fwd EBITDA | 5.13x | 6.25x | **(17.9%)** discount | Reliable — cross-checked to independent FY2026E consensus Adjusted EBITDA |
| LTM P/E | 27.3x | 12.5x | **+118.4%** premium | Real, not a data error — but driven by a genuinely depressed trailing EPS (see §4), not a rich price |
| NTM Forward P/E | 9.14x | 11.5x | **(20.5%)** discount | Reliable — EPS confirmed clean against audited figures |
| LTM P/TangBV | 1.8x | 2.5x | **(28.0%)** discount | Reliable |

**Formula used throughout:** `Premium/(Discount) = (Company multiple − Peer median) / Peer median`. Positive = premium (company multiple above peer median); negative = discount.

**Central finding of this section.** The raw vendor LTM EV/EBITDA and EV/EBIT screens make NHY look deeply discounted (−49% to −52%) versus peers, but this is a data artifact traced to a Capital IQ income-statement reclassification error specific to Hydro (see header note) — restated on Hydro's own audited EBITDA/EBIT, NHY actually screens at a **premium** on those two multiples. The multiples that are independently verified clean (LTM/NTM EV/Sales, NTM EV/EBITDA, NTM P/E, P/TangBV) converge on a materially narrower and directionally consistent **18%–35% discount** to peer median — this cluster, not the vendor LTM EV/EBITDA/EBIT screen, is the reading this report treats as decision-relevant.

**Is the gap typical or unusual?** **Not assessable.** The peer comp workbook is a single point-in-time snapshot (as-of 2026-07-18); no historical time series of peer multiples exists in this pool, so the current discount cannot be placed against the company's own ~3-year relative-gap history to these specific peers. NHY's own multiple has moved sharply in isolation — its own TEV/LTM EBITDA (vendor basis) rose from 2.4x (quarter ended Jun-2025) to 3.9x (as of Jul-2026), and its own P/LTM EPS rose from 13.5x to 27.3x over the same window [Norsk Hydro ASA OB NHY Financials.xls, Multiples tab] — but without the peer median at each of those historical dates, whether the *gap to peers* widened, narrowed, or stayed constant cannot be determined from this pool. This own-history trajectory is the proper subject of `02_multiples-own-history`, not this module.

## 4. Is the Gap Warranted?

On the multiples judged reliable (§3), NHY trades at an 18%–35% discount to the peer median while carrying a materially better EBITDA margin on a like-for-like restated basis (TTM reported margin 10.9%, or FY2025 Adjusted margin 13.9%, sits mid-pack against peer EBITDA margins that range 7.0%–57.2% on the unverified CIQ basis) and a much lower leverage profile (Total Debt/EBITDA 0.7x vendor / ~1.5x restated vs peer median 1.4x, with several peers — RUSAL 9.3x, Constellium 2.1x, Hindalco 2.8x — carrying materially more debt) [Table §2; `07_business-quality.md` capital-intensity and moat evidence]. Two factors argue the discount is at least partly deserved and should not be read as a clean re-rating case: revenue is shrinking (−5.6% LTM vs peer median +7.0%, and TTM revenue −3.2% independently per `earnings/01_historical-financials.md`) against a peer set where most names are growing, and the business-model module scored NHY's moat as **narrow and eroding** (cost advantage/natural-resource access score 62–66/100 but the group's return on capital sits only modestly above its cost-of-capital proxy through the cycle — 13.3% vs a 10% target — and below it on the latest unadjusted year, 7.2% vs 10%) [`09_moat.md` §3, §5]. A further, non-fundamental factor caps how much of the gap can be read as an exploitable opportunity: the Norwegian State's 34.5% stake is disclosed as held for industrial-policy reasons (retaining HQ/technology in Norway), not per-share value maximization — a structurally unaligned controlling owner flagged as RF-OWN-004 under CLAUDE.md §24 Filter 6 [`management-governance/99_management-governance-synthesis.md`, RF-OWN-004]; per this module's own rules, persistent cheapness under such an owner is a value-trap signal, not a clean margin of safety, and this report does not treat the full observed discount as straightforwardly closable. **Net conclusion: the discount is too deep relative to NHY's margin and leverage profile (relative upside on fundamentals), but the RF-OWN-004 unaligned-owner flag and the negative-growth/eroding-moat evidence mean this should not be read as a clean re-rating case — value-trap risk is flagged explicitly, and any attractiveness reading here is subject to the module's own RF-OWN-004 score cap applied downstream.**

## 5. Implied Value from Peer Multiples

**Primary/base-case multiple: NTM (forward) EV/EBITDA.** Chosen because it is EV-based (removes cross-peer leverage distortion), forward-looking (avoids the LTM trough visible in Q4 2025's derivative-driven EBITDA collapse), and independently verified clean (cross-checks to the FY2026E consensus Adjusted EBITDA of NOK 36,330mm — see header note), unlike the vendor LTM EV/EBITDA field.

**Quality adjustment applied to the base case.** Peer median NTM EV/EBITDA is 6.25x. This report applies a **10% discount** to that median — smaller than the raw observed 17.9% discount — reflecting the offsetting evidence in §4: negative revenue growth, a narrow/eroding moat, and the RF-OWN-004 unaligned-owner flag argue for *some* discount to peer median, while NHY's materially lower leverage and mid-pack-to-superior restated margin argue against the full 17.9% gap. **Warranted multiple: 6.25x × 0.90 = 5.6x** (labeled *Inference, not from filings* — the discount percentage is this agent's judgment call, not a disclosed figure).

| Multiple | Applied Peer Multiple | Basis | Implied EV (USD mm) | Implied Equity (USD mm) | Implied Price/Share | vs Current Price (NOK 84.96) |
|---|---:|---|---:|---:|---:|---:|
| **NTM EV/EBITDA — quality-adjusted (BASE CASE)** | 5.6x | Warranted (10% below peer median 6.25x) | 21,244 | 19,108 | **NOK 93.7** (USD 9.72 × FX 9.63) | **+10.2%** |
| NTM EV/EBITDA — raw peer median (unadjusted) | 6.25x | Full peer parity, no quality discount | 23,710 | 21,574 | NOK 105.8 | +24.5% |
| NTM EV/Fwd Revenue — raw peer median | 1.3x | Full peer parity, no quality discount | 29,600 | 27,464 | NOK 134.1 | +57.8% |
| NTM Forward P/E — raw peer median | 11.5x | Full peer parity, no quality discount (applied to NHY's NOK forward EPS 9.30, back-solved from vendor NTM P/E 9.14x on NOK 84.96) | — (equity multiple, no EV bridge) | — | NOK 106.9 | +25.9% |
| LTM P/TangBV — raw peer median | 2.5x | Full peer parity, no quality discount | — (equity multiple) | — | NOK 119.2 | +40.3% |
| LTM EV/EBITDA — restated company-reported basis, applied to CIQ peer median | 7.6x (CIQ peer median, LTM) | Company's own audited TTM EBITDA (NOK 21,976mm) × CIQ peer median (peer side unverified) | — | NOK equity 141,604mm | NOK 72.1 | **(15.1%)** |

**Reconciliation of the spread.** The five reliable-basis reads span roughly NOK 72 to NOK 134 (a −15% to +58% range around the current price) — a wide spread that itself is a finding, consistent with Core Principle 2 (methods disagreeing by this much must be reconciled, not averaged). The low end (restated LTM EV/EBITDA, NOK 72, implying NHY is already slightly rich) uses NHY's own trough-period TTM EBIT/EBITDA against an unverified peer LTM median; the high end (raw EV/Sales and P/TangBV parity, NOK 119–134) assumes NHY should trade at the *full, unadjusted* peer median with no discount at all for its weaker growth, narrower/eroding moat, or unaligned owner — a position this report does not adopt (§4). The **base-case point (NOK 93.7, +10.2% vs current price)** sits inside this range, deliberately closer to the low end, because it is the only row that both (a) uses an independently verified clean metric (NTM EV/EBITDA) and (b) explicitly prices in the quality/ownership discount argued in §4, rather than assuming full peer parity or relying on NHY's own trough-period trailing EBIT/EBITDA.

## 6. Relative Read

On the multiples this report can verify against audited figures — NTM EV/EBITDA, EV/Sales, and forward P/E — NHY trades 18%–35% below the peer median (peer set: Anglo American, Boliden, Shandong Hongqiao, ProfilGruppen, Grupa Kety, Antofagasta, RUSAL, Constellium, Hindalco, Chalco; core matches RUSAL/Chalco/Hindalco), a discount only partly explained by NHY's shrinking revenue (−5.6% LTM vs peer median +7.0%) and its narrow, eroding moat, while its restated EBITDA margin and materially lower leverage argue against the full gap. The raw vendor LTM EV/EBITDA and EV/EBIT screen (a headline ~49%–52% discount) is unreliable for this company — restated on Hydro's own audited EBITDA/EBIT, those same two multiples flip to a premium, so this report weights the verified NTM/Sales/P/E cluster, not the vendor LTM screen. The base-case implied value is **NOK 93.7 per share (+10.2% vs the current NOK 84.96 price)** on a quality-adjusted NTM EV/EBITDA of 5.6x, with cross-method dispersion spanning roughly NOK 72 to NOK 134 (−15% to +58%); the RF-OWN-004 flag (a Norwegian State stake held for industrial-policy, not per-share-value, reasons) means this gap should be read as **relative upside constrained by a value-trap risk**, not a clean re-rating case.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — NHY (Norsk Hydro ASA, Oslo Børs: NHY)

Reporting standard: IFRS Accounting Standards as adopted by the EU. Reporting / trading currency: Norwegian krone (NOK million, except per-share figures in NOK). Fiscal year end: December 31 [Integrated Annual Report 2025, p.140]. All figures below are NOK unless stated otherwise. No cross-currency conversion is used anywhere in this report.

**Business-Type Gate.** `00_valuation-data-triage.md` and `business-model/02_business-identity.md` classify Norsk Hydro as an integrated **commodity / cyclical** operating company (bauxite → alumina → primary aluminium → recycling/extrusions, plus a captive power business), confirmed independently by `business-model/07_business-quality.md` (Commodity dependence score 12/100, Cyclicality score 15/100 — both inverted-low, i.e. very high dependence/cyclicality) and `business-model/10_external-dependency.md` (External Dependency Risk Score 74/100, inverted-high). Per `MODULE_RULES.md`'s Business-Type Method Map, this means an **FCFF DCF on a normalized mid-cycle FCF base** — never a single peak or trough year — which is the method used throughout this report (the Cyclicality Gate, §1 and §5 below).

**Moat-trajectory trigger (CLAUDE.md §24 Filter 5 / avoid-ruin).** `business-model/09_moat.md` verdict is **Narrow moat, trajectory eroding** — group return on capital sits only modestly above its cost-of-capital proxy through the cycle (13.3% 5-yr average Adjusted RoaCE vs a 10% target) and is at/below it on the latest year and unadjusted basis, and the moat's own downstream leg (Hydro Extrusions) is in documented structural decline (EBIT margin ~4% in 2020–2023 to −2.2% in 2025, five plants proposed for closure). This is **not** "No moat proven" (a moat is evidenced), so the terminal is not forced to zero excess return; but the "eroding" trajectory trips the second trigger, so §5 below carries **both** a standard Gordon-growth terminal (the base case) **and** a labelled declining-perpetuity / runoff terminal (the structural-impairment scenario, for `07`'s bear case and the master synthesizer's Kill Criteria — not a replacement for the base).

**Tax-rate reconciliation (Gate — canonical rate).** `business-model/09_moat.md` §3 explicitly states it "uses [Hydro's own standardized 30 percent] rate as the anchor for any normalized NOPAT read, for consistency with `valuation/04_intrinsic-dcf` where that module runs." This DCF uses that **same 30% standardized tax rate** throughout for NOPAT, matching the moat module's canonical figure — no divergence to reconcile. Hydro's own actual effective tax rate is far more volatile (24.3% in 2021 to 57.2% in 2023 to 39.5% in 2025) [Integrated Annual Report 2025, Note on adjusted net income; `09_moat.md` §3], which is why the company itself, and this report, use the standardized 30% rate for any normalized/adjusted earnings read instead.

---

## 1. FCF Base & Normalizations

Base year: **FY2025 (year ended 31-Dec-2025)**, audited, IFRS. Norsk Hydro's IFRS income statement uses a "nature of expense" format with no COGS/EBITDA subtotal; the CIQ vendor workbook's own EBITDA/EBIT reclassification for this company does **not** reconcile to the audited figures (a ~NOK 27bn gap flagged in `earnings/01_historical-financials.md`), so this report uses the company's own audited/disclosed EBITDA, EBIT and Adjusted-EBITDA/EBIT Alternative Performance Measures (APMs) throughout — never the CIQ Income-Statement-tab reclassification.

| Item | Base-Year Value (NOK mn) | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | 207,971 | None | [Integrated Annual Report 2025, p.140] |
| EBITDA — reported (audited) | 25,696 | — | [Integrated Annual Report 2025, p.36, "Other performance measures"] |
| EBITDA — **Adjusted (used as FCF-base anchor)** | 28,889 | +3,193: strips unrealized LME/power/raw-material derivative mark-to-market timing (+1,956), rationalization & closure costs (+1,795), impairment (equity-accounted investees, +444), transaction-related gains (−429), FX and other (−129) | [Integrated Annual Report 2025, p.36] |
| EBIT — reported (audited) | 14,401 | — | [Integrated Annual Report 2025, p.140] |
| EBIT — **Adjusted** | 18,663 | As above, plus PP&E/goodwill impairment (+1,069) | [Integrated Annual Report 2025, p.36] |
| CFO | 23,311 | None | [Financials.xls, Cash Flow tab] |
| Capex (cash-flow-statement, "Purchases of PP&E") | 11,582 | Module-standard FCF definition uses this narrower figure, not the company's broader Capex APM (NOK 12,097m, includes other long-term investments net of investment grants) | [Financials.xls, Cash Flow tab; `earnings/06_earnings-quality.md` §1 fn.3] |
| **FCF (module-standard: CFO − total capex)** | 11,729 | Lead figure, per CLAUDE.md §15 | [`earnings/01_historical-financials.md` §1] |
| Company's own "Free Cash Flow" APM | 13,034 | Nets derivative collateral and short-term-investment purchases/sales — a different, disclosed, non-standard definition, shown for completeness, not used as the DCF base | [Integrated Annual Report 2025, "Free cash flow" APM table, p.233; `earnings/06_earnings-quality.md` §1] |
| Effective tax rate (reported, actual) | 39.5% | Not used — volatile 24.3%–57.2% across FY2021–2025 | [Financials.xls, Income Statement tab] |
| **Normalized tax rate used for NOPAT (canonical, reconciled to `09_moat.md`)** | **30%** | Company's own standardized rate for tax-effecting adjusting items; adopted here to match the moat module's canonical normalized-NOPAT rate | [Integrated Annual Report 2025, Note on adjusted net income; `business-model/09_moat.md` §3] |

**Cyclicality normalization (Cyclicality Gate).** FY2025's Adjusted EBITDA margin (13.9%) is **not** used as a flat terminal assumption. It is benchmarked against:
- **Company's own prior-trough:** FY2023 Adjusted EBITDA margin of **11.5%** (22,258 / 193,619) — a genuine cyclical trough year in which group net-income margin collapsed to 1.85% and ROE to 2.6% [`business-model/07_business-quality.md`, Margin stability row].
- **A recent, explicitly non-run-rate peak:** Q1 2026 Adjusted EBITDA margin of **17.2%**, driven by a Middle East geopolitical supply shock (Strait of Hormuz closure, ~9% of global aluminium output curtailed) that both the margin-drivers and earnings-sensitivity modules flag as **not durable** [`earnings/03_margin-drivers.md` §8; `earnings/07_earnings-sensitivity.md` §4].
- **Peer-normal:** **not usable on a reconciled basis.** The peer comp set's EBITDA margins (Company Comparable Analysis workbook) are computed on CapIQ's standardized reclassification, the same reclassification flagged as unreliable for Hydro specifically (§ above) — comparing NHY's own audited-basis margin to peers' CIQ-standardized margin would not be apples-to-apples. Per the Cyclicality Gate's explicit fallback ("If no peer data is available... benchmark against the prior-trough and the company's own through-cycle history alone, and say so"), this report benchmarks against the prior-trough (11.5%) and FY2024/FY2025 actuals (12.9%/13.9%) only.

The forecast (§2) fades toward a **13.0% terminal Adjusted EBITDA margin** — above the FY2023 trough, below the FY2025 actual and well below the Q1'26 shock print — as the mid-cycle anchor.

---

## 2. Forecast Assumptions

5-year explicit forecast (FY2026–FY2030). Reasoning for stopping at 5 years: the model reaches its flat, mid-cycle "terminal" margin by Yr2 (13.0%) and holds it through Yr5 — extending the explicit window further would not add information, only more discounted repetitions of the same run-rate assumption.

| Assumption | FY2026 | FY2027 | FY2028 | FY2029 | FY2030 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---|
| Revenue (NOK mn) | 213,366 | 218,955 | 219,215 | 223,599 | 228,071 | +2.5%/yr | FY2026–28: Capital IQ consensus mean [`NorskHydroASAOBNHYEstimatesReport.xls`, Consensus tab, "Revenue," as of 2026-07-15]. FY2029–30: consensus coverage thins to 1–2 analysts by FY2029 (low-confidence tail) — **analyst assumption, not company-guided**: +2.0%/yr nominal off FY2028, roughly global aluminium demand growth + inflation |
| Adjusted EBITDA margin % | 14.0% | 13.0% | 13.0% | 13.0% | 13.0% | 13.0% | **Analyst assumption, not company-guided** — overrides Capital IQ consensus margin (17.0%/17.3%/16.3% for FY2026–28, `NorskHydroASAOBNHYEstimatesReport.xls` Consensus tab), which extrapolates the Q1 2026 geopolitical-shock margin (17.2%, flagged non-run-rate by `earnings/03_margin-drivers.md` §8) into the full-year numbers. FY2026 (14.0%) allows partial persistence of the H1 2026 tailwind before the guided Q2 2026 cost headwinds (energy +NOK 200–300mn, carbon +NOK 150–250mn q/q) bite [`earnings/04_guidance-consensus.md` §2]; FY2027 onward fades to the 13.0% mid-cycle anchor (§1) |
| Tax rate % (normalized, NOPAT) | 30% | 30% | 30% | 30% | 30% | 30% | Company's own standardized rate; canonical, reconciled to `business-model/09_moat.md` §3 |
| D&A (NOK mn) | 10,782 | 10,929 | 11,078 | 11,300 | 11,500 | ~11,500 | FY2026–28: Capital IQ consensus [`...Consensus.txt`, "Depreciation & Amortization" row]. FY2029–30: **analyst assumption** — extrapolated at the same ~NOK 150–200mn/yr pace, consistent with the guided capex step-up |
| Capex (NOK mn, absolute) | 13,500 | 15,000 | 15,000 | 15,000 | 15,000 | ~15,000 | **Company-guided** total capex, issued 2026-02-13, through FY2030 [`NorskHydroASAOBNHYEstimatesReport.xls`, Guidance tab]. Of this, guided maintenance capex is NOK 9,000mn (FY2026) then NOK 8,500mn (FY2027–30) — the balance (~NOK 4,500–6,500mn/yr) is a disclosed **growth-capex step-up** versus the FY2021–2025 average of ~NOK 10.9bn/yr |
| Capex (% of revenue) | 6.33% | 6.85% | 6.84% | 6.71% | 6.58% | ~6.6% | Derived from the two rows above |
| Δ Working capital driver | NWC = 13.18% of revenue (days-based) | | | | | 13.18% of revenue | **Revenue-linked, days-based** — DSO 33.0 days, DIO 76.8 days, DPO 53.2 days, all held at their FY2025 levels [`earnings/06_earnings-quality.md` §3]; COGS (Raw material & energy expense) held at 64.0% of revenue, its FY2025 ratio [`earnings/03_margin-drivers.md` Table B]. NWC% = DSO/365 + (COGS%)×(DIO−DPO)/365 = 33.0/365 + 0.64×(76.8−53.2)/365 = **13.1792%** of revenue. **Analyst assumption** (holding days flat) |

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.38% | Web: Norway 10-year government bond yield, 2026-07-10 [tradingeconomics.com] — indicative, unverified, dated |
| Equity-risk premium | 4.50% | Web: Damodaran implied US/mature-market ERP ≈4.23% (Jan-2026 data update), rounded to 4.5% as a small conservative buffer; Norway is Aaa/AAA-rated (equal to or better than the US), so mature-market ERP is applied directly with ~0 incremental country-risk premium — indicative, unverified, Norway-specific 2026 dataset not directly retrievable |
| Beta (levered) | 0.70 | Web: 5-year monthly beta, widely reported (Yahoo Finance and aggregators), accessed 2026-07-19 — indicative, unverified. **Flagged as a limitation:** this looks low for a commodity cyclical (cross-checked against `earnings/07_earnings-sensitivity.md`'s Earnings Volatility Score of 70/100, inverted-high, and `business-model/07_business-quality.md`'s Cyclicality score of 15/100, inverted-low) — this is the stated reason for the WACC override below |
| Cost of equity (CAPM) | 7.53% | `Ke = Rf + β×ERP = 4.38% + 0.70×4.50% = 7.53%` |
| Pre-tax cost of debt | 5.50% | Analyst estimate, not from filings — blends Hydro's disclosed fixed coupons (European Green Bond, EUR-denominated, 3.750%; Sustainability Linked Bond (NOK) 5.257% fixed; a second Sustainability Linked Bond at 3-month NIBOR+2.000% floating) against its sub-2x leverage target and low Net Debt/EBITDA (0.7x FY2025) [Financials.xls, Capital Structure Details tab]. Cross-check: FY2025 interest expense (NOK 2,357mn) ÷ total debt (NOK 33,754mn) implies ~6.98%, but this figure folds in lease-liability interest (leases sit inside Total Debt per `01`'s EV bridge) and is not used directly, as it likely overstates the funded-debt cost |
| Tax rate (for debt tax shield) | 30% | Same normalized/canonical rate as NOPAT (§1) |
| After-tax cost of debt | 3.85% | `Kd_at = 5.50%×(1−0.30) = 3.85%` |
| Equity weight (market value) | 83.18% | `we = E/(E+D) = 166,970 / (166,970+33,754)` [`01_price-and-capital-structure.md` §3–4] |
| Debt weight (market value, book proxy) | 16.82% | `wd = D/(E+D) = 33,754 / (166,970+33,754)` [same] |
| **WACC — computed** | **6.91%** | `WACC = we×Ke + wd×Kd_at = 0.8318×7.53% + 0.1682×3.85% = 6.264% + 0.648% = 6.91%` |
| **WACC — used (override)** | **7.50%** | See override note below |

**Formula (pinned):** `WACC = w_e·k_e + w_d·k_d·(1−t)` — no preferred equity outstanding [`01_price-and-capital-structure.md` §4], so no `w_p·k_p` term.

**WACC override (discipline per `MODULE_RULES.md` Gate 4).** Computed WACC is 6.91%; the WACC **used** in this DCF is **7.50%** — an override of **+0.59pp**, within the ±1.5pp tolerance. Justification (one sentence): the sourced beta (0.70) looks low for a business the earnings-sensitivity and business-quality modules independently score as highly cyclical and externally-driven, so WACC is nudged toward the midpoint of Hydro's own disclosed impairment-testing cost-of-capital range. **Cross-check against the moat module (Gate 4):** `business-model/09_moat.md` §3 reports Hydro's own disclosed pre-tax nominal WACC range of 9.25%–11.75% (used for goodwill/asset impairment testing), which converts to a post-tax range of **6.475%–8.225%** at the same 30% standardized tax rate. Both the computed (6.91%) and the used (7.50%) WACC sit comfortably inside this company-disclosed band — no divergence >2pp, so no dual-WACC grid is required (though the §7 sensitivity grid already spans 6.5%–8.5%, bracketing the full company-disclosed range).

---

## 4. Free Cash Flow Forecast & Discounting

Discounting convention: **mid-year** (t = 0.5, 1.5, 2.5, 3.5, 4.5) — cash flows are assumed to arrive evenly through each year, not in a lump at year-end, which is the more realistic assumption for a continuously-operating industrial producer.

| Year | Revenue | EBITDA (13–14% margin) | EBIT | NOPAT (30% tax) | Capex | ΔNWC | FCFF | Discount Factor (t, WACC 7.50%) | PV of FCFF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026 | 213,366 | 29,871 | 19,089 | 13,362 | 13,500 | 711 | 9,933 | 0.96449 (t=0.5) | 9,581 |
| FY2027 | 218,955 | 28,464 | 17,535 | 12,275 | 15,000 | 737 | 7,467 | 0.89720 (t=1.5) | 6,699 |
| FY2028 | 219,215 | 28,498 | 17,420 | 12,194 | 15,000 | 34 | 8,238 | 0.83460 (t=2.5) | 6,875 |
| FY2029 | 223,599 | 29,068 | 17,768 | 12,438 | 15,000 | 578 | 8,160 | 0.77637 (t=3.5) | 6,335 |
| FY2030 | 228,071 | 29,649 | 18,149 | 12,704 | 15,000 | 589 | 8,615 | 0.72221 (t=4.5) | 6,222 |

**FCFF identity used:** `FCFF = NOPAT + D&A − Capex − ΔNWC` (built from the income statement / balance sheet, not `CFO − capex`, because the forecast is built up from revenue/margin/capex/WC assumptions, not a projected cash-flow statement). **Working-capital sign check:** Hydro carries ordinary (positive) net working capital, not a negative-WC structure — revenue growth increases NWC (33.0-day receivables, 76.8-day inventory outweighing 53.2-day payables), which **consumes** cash, so ΔNWC is correctly **subtracted** every year above; there is no negative-WC cash-release dynamic to check for here.

**Sum of PV of explicit FCFs: NOK 35,712 million.**

Executed snippet (WACC blend, PV-of-FCF sum, terminal value, EV→equity→per-share bridge):

```
=== WACC BLEND ===
Ke = rf + beta*ERP = 0.0438 + 0.7*0.045 = 0.07530
Kd_pretax = 0.055, Kd_at = Kd_pretax*(1-tax) = 0.03850
we = E/(E+D) = 0.83184, wd = D/(E+D) = 0.16816
WACC_computed = we*ke + wd*kd_at = 0.83184*0.07530 + 0.16816*0.03850 = 0.06911
WACC_used (override) = 0.07500

=== DISCOUNTING (mid-year convention, WACC_used) ===
Year 1 (2026): FCFF=9933, t=0.5, DF=1/(1+0.075)^0.5=0.96449, PV=9581
Year 2 (2027): FCFF=7467, t=1.5, DF=1/(1+0.075)^1.5=0.89720, PV=6699
Year 3 (2028): FCFF=8238, t=2.5, DF=1/(1+0.075)^2.5=0.83460, PV=6875
Year 4 (2029): FCFF=8160, t=3.5, DF=1/(1+0.075)^3.5=0.77637, PV=6335
Year 5 (2030): FCFF=8615, t=4.5, DF=1/(1+0.075)^4.5=0.72221, PV=6222
Sum PV explicit FCFs = 35712

=== TERMINAL VALUE (Gordon growth) ===
FCFF_Yr5 = 8615, g = 0.025, WACC = 0.075
TV = FCFF5*(1+g)/(WACC-g) = 8615*1.025/(0.075-0.025) = 176609
Discounted at Yr5 mid-year factor (t=4.5, same as last explicit CF) = 0.72221
PV of TV = 127549

Enterprise Value = PV(explicit) + PV(TV) = 35712 + 127549 = 163261
TV as % of EV = 78.1%

=== EV -> EQUITY -> PER SHARE ===
EV = 163261
- Net debt (canonical, cash-quality adj.) = 17919.0
- Minority interest = 7495.0
- Preferred = 0.0
= Equity value = 137847
/ Shares = 1965.28
= Per-share intrinsic value (base) = 70.14
vs current price 84.96 -> below by -17.4%

=== FINANCEABLE GROWTH CROSS-CHECK (Gate 2) ===
Yr3 reinvestment rate = (capex-D&A+dNWC)/NOPAT = (15000-11078+34)/12194 = 32.4%
Implied growth = ROIC(9%) * reinvestment rate = 2.92%
Modeled terminal g = 2.5% -> gap = 0.42pp (within ~1.5pp tolerance: YES)

=== EXIT MULTIPLE CROSS-CHECK ===
Terminal (Yr5) EBITDA = 29649
Implied exit multiple = TV/Terminal EBITDA = 176609/29649 = 5.96x
Peer NTM EV/EBITDA range (Company Comparable Analysis workbook, Trading Multiples tab, as of 2026-07-18): 3.53x-11.46x,
peer mean (ex-NHY, ex-blank) ~6.71x; NHY's own current NTM EV/EBITDA = 5.13x

=== DECLINING-PERPETUITY / RUNOFF TERMINAL ===
Runoff terminal EBITDA margin = 9.0% (below FY2023 cyclical trough of 11.5%)
Runoff EBITDA = 228071*0.09 = 20526
Runoff EBIT = 20526-11500 = 9026
Runoff NOPAT = 9026*(1-0.3) = 6318
Runoff FCFF = NOPAT+D&A-Capex(maintenance only)-dNWC = 6318+11500-8500-0 = 9318
Runoff g (nominal, below inflation, trending negative) = -1.0%
Runoff TV = FCFF*(1+g)/(WACC-g) = 9318*0.99/(0.075-(-0.01)) = 108533
PV of runoff TV = 78383
Runoff EV = PV(explicit, SAME as base) + PV(runoff TV) = 35712+78383 = 114095
Runoff equity value = 114095-17919.0-7495.0 = 88681
Runoff per-share = 45.12

=== SENSITIVITY GRID (per-share) ===
WACC columns: [6.5, 7.5, 8.5]
g=3.0%: [102.81, 77.7, 61.73]
g=2.5%: [90.25, 70.14, 56.74]
g=2.0%: [80.48, 63.95, 52.51]
```

(Script: Python 3, executed via Bash — `we`, `wd` from `01_price-and-capital-structure.md` §3–4; `net_debt`=17,919 and `minority`=7,495 from the same file's canonical, cash-quality-adjusted anchor; `shares`=1,965.28mn from the same file's Anchor Block.)

---

## 5. Terminal Value

**Method: Gordon growth perpetuity (base case).**

`TV = FCFF_{n+1} / (WACC − g) = FCFF_5 × (1+g) / (WACC − g)`, where `FCFF_5` = NOK 8,615mn (FY2030, the last explicit-forecast year) and `g` = 2.5% nominal (**analyst assumption, not company-guided** — roughly Norway's inflation target and a reasonable long-run nominal growth proxy for a mature, globally-traded commodity).

`TV = 8,615 × 1.025 / (0.075 − 0.025) = 8,830 / 0.050 = NOK 176,609 million` (undiscounted, as of end-FY2030).

`WACC − g` = 7.50% − 2.50% = **5.0pp**, comfortably positive — well clear of the near-zero-denominator danger zone. In the §7 sensitivity grid, the widest g (3.0%) against the lowest WACC (6.5%) still leaves a 3.5pp gap — no grid cell approaches `WACC − g ≤ 0`, so no cell is marked NM.

- **Terminal value (undiscounted): NOK 176,609 million.**
- **PV of terminal value (discounted at the Yr5 mid-year factor, t=4.5, per the stated convention): NOK 127,549 million.**
- **Terminal value as % of total EV: 78.1%.** This **exceeds the 75% threshold** — the DCF is **terminal-dominated and low-confidence** per `MODULE_RULES.md`'s Reconciliation/Score-Cap rules (valuation confidence capped at 60 downstream). Per Gate 5, a second lens is required and provided below.

**Exit-multiple cross-check (Gate 5, required because TV > 75% of EV).** The Gordon-growth TV implies an exit multiple of `TV / Terminal EBITDA = 176,609 / 29,649 = 5.96x` EV/EBITDA. This sits below the peer mean NTM EV/EBITDA (~6.71x, across Anglo American, Boliden, Shandong Hongqiao, Grupa Kęty, Antofagasta, Constellium, Hindalco, Chalco — Company Comparable Analysis workbook, Trading Multiples tab, as of 2026-07-18) and modestly above Hydro's own current NTM EV/EBITDA (5.13x, same source). An implied terminal multiple below the peer average and only slightly above Hydro's own current multiple is a sane, non-aggressive terminal assumption — it does not require Hydro to re-rate to a premium multiple to justify the terminal value.

**Structural-decline / runoff terminal (moat-trajectory trigger, avoid-ruin Filter 5).** Because `business-model/09_moat.md` reports the moat trajectory as **eroding** (not merely "unproven"), a second, labelled terminal is built alongside the base case — the structural-impairment scenario, not a replacement for §6's headline:

- Terminal EBITDA margin faded to **9.0%** — below the FY2023 cyclical trough (11.5%), reflecting a *structural*, not merely cyclical, impairment: continued Extrusions decline, and the upstream cost-curve advantage eroding as Chinese/Gulf capacity expands (flagged as "a live possibility, not a tail risk" by `business-model/07_business-quality.md`'s Competitive intensity row).
- Capex cut to **maintenance-only** (NOK 8,500mn/yr, the guided FY2027–30 maintenance figure) — a declining business does not keep funding growth capex.
- **`g` = −1.0% nominal** — below Norway's ~2.5% inflation target and trending negative, i.e. genuine real AND nominal decline, on the same nominal basis as the rest of this DCF (not a real-rate substitution).
- `TV_runoff = 9,318 × 0.99 / (0.075 − (−0.01)) = 9,225 / 0.085 = NOK 108,533 million` (undiscounted); PV = NOK 78,383 million.
- Resulting **runoff intrinsic value: NOK 45.12/share** (§4 snippet) — a ~36% haircut to the base-case NOK 70.14/share. This is the structural-reset bear input for `07_scenario-and-fair-value` and the master synthesizer's Kill Criteria; it is **not** this module's headline base case.

---

## 6. DCF Output

| Step | Value (NOK mn, unless per-share) |
|---|---:|
| PV of explicit FCFs | 35,712 |
| + PV of terminal value (Gordon, base case) | 127,549 |
| **= Enterprise value** | **163,261** |
| − Net debt (canonical, cash-quality adjusted, `01`) | 17,919 |
| − Minority interest (`01`) | 7,495 |
| − Preferred | 0 |
| **= Equity value** | **137,847** |
| ÷ Diluted shares (`01` anchor, ≈basic; no material dilution) | 1,965.28 million |
| **= Intrinsic value per share (base case)** | **NOK 70.14** |
| vs current price (NOK 84.96, 2026-07-17, `01`) | **−17.4%** (DCF base sits below the traded price) |
| Memo: runoff / structural-decline terminal, per-share | NOK 45.12 (−46.9% vs price) |

---

## 7. Sensitivity Grid (per-share intrinsic value, base-case Gordon terminal)

WACC across columns, terminal growth down rows. No cell approaches `WACC − g ≤ 0` (minimum gap in this grid is 3.5pp, at WACC 6.5% / g 3.0%), so all nine cells are valid.

| | WACC 6.5% | WACC 7.5% (used) | WACC 8.5% |
|---|---:|---:|---:|
| g = 3.0% | NOK 102.81 | NOK 77.70 | NOK 61.73 |
| g = 2.5% (base) | NOK 90.25 | **NOK 70.14** | NOK 56.74 |
| g = 2.0% | NOK 80.48 | NOK 63.95 | NOK 52.51 |

Range across the full grid: **NOK 52.51 – NOK 102.81**, a wide spread reflecting the terminal-value dominance (78.1% of EV) flagged in §5 — small changes in WACC or `g` move the answer a great deal. The current price (NOK 84.96) sits inside the upper portion of this grid (above the base-case NOK 70.14, below only the two lowest-WACC/highest-g corner cells), which is consistent with the market pricing in either a lower discount rate than this report's 7.50%, a higher terminal growth rate, or a terminal margin closer to the elevated (Middle-East-shock-driven) recent print than the 13.0% mid-cycle anchor used here.

---

## 8. Intrinsic Read

The base-case DCF intrinsic value is **NOK 70.14 per share** — about 17% below the current NOK 84.96 price (2026-07-17) — built on a mid-cycle 13.0% Adjusted EBITDA margin (between the FY2023 trough of 11.5% and the FY2025 actual of 13.9%, deliberately below the Q1 2026 geopolitical-shock print of 17.2% that both the margin-drivers and guidance-consensus modules flag as not durable) and a 7.50% WACC that sits inside Hydro's own disclosed impairment-testing cost-of-capital band. The sensitivity grid shows how fragile that point is, not a second answer: across a ±1pp WACC and ±0.5pp terminal-growth range the value swings from NOK 52.51 to NOK 102.81 — a function of the terminal value being 78.1% of total enterprise value (terminal-dominated, per §5) in a company whose own moat is eroding at the segment level (Extrusions) even as the upstream chain still earns above its cost of capital. The single assumption this value is most sensitive to is the **terminal Adjusted EBITDA margin / WACC pairing**: if the market is instead pricing something closer to the currently-elevated, shock-driven margin persisting (consensus's own FY2026–28 estimates imply 16–17% margins, not this report's 13%), that alone would largely close the gap to the current price — making the read a bet on whether the Middle East supply-shock aluminium price premium is durable, which the earnings-sensitivity module's own ranking (§4 of that report) says is the single largest, least-controllable lever on this company's earnings.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — NHY (Norsk Hydro ASA, Oslo Børs: NHY)

Reporting standard: IFRS Accounting Standards as adopted by the EU. Reporting / trading currency: Norwegian krone (NOK million, except per-share figures in NOK). No cross-currency conversion is used anywhere in this report.

**Price-state check (gate).** `01_price-and-capital-structure.md` §7 tags the current price as **pool-verified** (NOK 84.96, 2026-07-17, Capital IQ last close, 2 calendar days / ~1.4 trading days old — well inside the 5-trading-day freshness threshold). This clears the partial-data gate — the agent runs.

**Model-inversion gate.** This report inverts `04_intrinsic-dcf.md` verbatim: the same WACC (7.50%, override), the same 5-year explicit horizon (FY2026–FY2030) with mid-year discounting, the same Gordon-growth terminal rate (`g` = 2.5% nominal), and the same normalized FY2025 FCF base and revenue/capex/net-working-capital build that `04` used. No independent WACC or base was re-derived.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | NOK 84.96 (2026-07-17, last close) | `01_price-and-capital-structure.md` §1, pool-verified |
| Enterprise value (target for this solve) | NOK 192,384mm (cash-quality adjusted, canonical) | `01_price-and-capital-structure.md` §4, §7 — Market cap 166,970 + Total debt 33,754 + Minority 7,495 − freely-available cash 15,835 |
| FCF (normalized) base, FY2025 | NOK 11,729mm (module-standard: CFO − total capex) | `04_intrinsic-dcf.md` §1, "Lead figure, per CLAUDE.md §15" |
| Discount rate (WACC) used | 7.50% (override; computed WACC = 6.91%, within ±1.5pp tolerance; both sit inside Hydro's own disclosed 6.475%–8.225% post-tax impairment-testing WACC band) | `04_intrinsic-dcf.md` §3 |
| Terminal growth `g` | 2.5% nominal (Gordon perpetuity, base case) | `04_intrinsic-dcf.md` §5 |
| Forecast horizon | 5 years (FY2026–FY2030) explicit, mid-year discounting (t = 0.5…4.5) | `04_intrinsic-dcf.md` §2, §4 |
| `04`'s own terminal-value share of EV | 78.1% — terminal-dominated, low-confidence per `MODULE_RULES.md` | `04_intrinsic-dcf.md` §5 |

## 2. Implied Expectations

Two solves were run, both anchored to `04`'s exact WACC, horizon, mid-year convention, and terminal `g`, and both targeting the same EV (NOK 192,384mm). Both were computed with an executed Python bisection solver (`brentq`-style root-find), not by hand. Command and output:

```
python3 - <<'PY'
def brentq_simple(f, lo, hi, tol=1e-10, maxiter=200):
    flo, fhi = f(lo), f(hi)
    for _ in range(maxiter):
        mid = (lo+hi)/2; fm = f(mid)
        if abs(fm) < tol: return mid
        if flo*fm < 0: hi, fhi = mid, fm
        else: lo, flo = mid, fm
    return (lo+hi)/2

WACC, g_term, EV_target = 0.075, 0.025, 192384.0
FCFF0_base = 11729.0

def ev_from_g(g, FCFF0=FCFF0_base, wacc=WACC, gt=g_term):
    pv = sum(FCFF0*(1+g)**t/(1+wacc)**(t-0.5) for t in range(1,6))
    tv = FCFF0*(1+g)**5*(1+gt)/(wacc-gt)
    return pv + tv/(1+wacc)**4.5

g_implied = brentq_simple(lambda g: ev_from_g(g)-EV_target, -0.20, 0.60)
print("Primary: implied 5yr FCF CAGR =", round(g_implied*100,3), "%")
PY
```
Output: **Primary implied 5-year FCF CAGR (off the NOK 11,729mm FY2025 base) = −3.21%.** Check: EV at that growth rate reproduces the NOK 192,384mm target exactly.

A second, more granular solve holds `04`'s own revenue path (Capital IQ consensus FY2026–28, analyst-extrapolated FY2029–30), D&A path, guided capex path, and 13.18%-of-revenue net-working-capital build all fixed, and instead solves for the single uniform Adjusted EBITDA margin (replacing `04`'s 14.0%/13.0%/13.0%/13.0%/13.0% fading schedule) that reproduces the same target EV:

```
[same brentq_simple helper]
revenue = [213366, 218955, 219215, 223599, 228071]  # 04's own FY2026-30 path
da = [10782, 10929, 11078, 11300, 11500]; capex = [13500,15000,15000,15000,15000]
tax = 0.30; nwc_pct = 0.131792; rev0 = 207971.0  # FY2025 actual
def ev_from_margin(m, wacc=0.075, gt=0.025):
    pv, prev_rev, fcffs = 0.0, rev0, []
    for i in range(5):
        rev = revenue[i]; ebitda = rev*m; ebit = ebitda-da[i]
        nopat = ebit*(1-tax); dnwc = nwc_pct*(rev-prev_rev)
        fcff = nopat+da[i]-capex[i]-dnwc; fcffs.append(fcff)
        pv += fcff/(1+wacc)**(i+1-0.5); prev_rev = rev
    tv = fcffs[-1]*(1+gt)/(wacc-gt)
    return pv + tv/(1+wacc)**4.5
m_implied = brentq_simple(lambda m: ev_from_margin(m)-192384.0, 0.02, 0.45)
print("Secondary: implied uniform Adj. EBITDA margin =", round(m_implied*100,2), "%")
```
Output: **Secondary implied uniform Adjusted EBITDA margin = 14.02%.** Check: EV at that margin reproduces NOK 192,384mm exactly. Converted to an EBIT margin using the same D&A path, this is an **implied terminal EBIT margin of ~9.0%** (14.02% EBITDA margin on FY2030 revenue of NOK 228,071mm, less NOK 11,500mm D&A, ÷ 228,071 = 8.98%).

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCF CAGR over the 5-yr horizon (off FY2025 FCF base, NOK 11,729mm) | **−3.21%** |
| Implied uniform Adjusted EBITDA margin, FY2026–30 (replacing `04`'s 14%→13% fade) | **14.02%** |
| Implied uniform EBIT margin (same build) | **~9.0%** |
| Implied years of above-GDP growth (fade model) | **Not meaningful here** — see note below |

**What was held fixed / what was solved for.** Both solves hold WACC (7.50%), the mid-year discounting convention, the 5-year horizon, and terminal `g` (2.5%) fixed at `04`'s exact values. The primary solve holds the FY2025 FCF base fixed and solves for a single compounding growth rate applied to it. The secondary solve instead holds `04`'s own revenue, D&A, capex, and net-working-capital assumptions fixed and solves for the one margin variable `04` itself flagged as the most consequential assumption (§8 of `04`). **No "years of above-GDP growth" fade-model solve is shown as a headline number**: the primary solve already returns a *negative* growth rate, meaning the price does not require any above-trend growth phase at all — fabricating a fade-model year-count on top of a negative growth solve would imply a supernormal phase that isn't there, so this row is explicitly left blank rather than invented.

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| FCF CAGR = −3.21% off the FY2025 base (NOK 11,729mm) | FY2021–25 FCF ranged NOK 1,801mm (FY2024) to NOK 19,733mm (FY2022) — no stable trend, 5-yr average NOK 10,031mm [`earnings/01_historical-financials.md` §1] | FCF volatility itself, not a growth trend, is the dominant historical pattern | Undemanding in isolation — but see note below on why this reading understates the real ask |
| Uniform Adjusted EBITDA margin = 14.02% sustained FY2026–30 | FY2025 actual Adjusted EBITDA margin = 13.9% (28,889/207,971); FY2023 cyclical trough = 11.5%; FY2024 = 12.9% [`earnings/01_historical-financials.md` §1, §4] | `earnings/03_margin-drivers.md` §8 and `earnings/07_earnings-sensitivity.md` §4 both flag the Q1 2026 print (17.2%) as a Middle East supply-shock spike, explicitly "not durable" / expected to "normalize." Only 67% of Q2 2026 primary production is hedged, at USD 3,000/mt — above the FY2023–25 realized band (USD 2,218–2,573/mt) but below the quarter-end spot (USD 3,467/mt), i.e. the company's own forward book already prices a partial, not full, reversion | **Stretch** |

**Reconciling the two solves.** The primary (FCF-CAGR) solve looks undemanding — even a modest FCF decline off the FY2025 base clears the price — but that reading is misleading in isolation: FY2025's FCF (NOK 11,729mm) was itself inflated by a favorable working-capital swing versus FY2024 (NOK 1,801mm), and `04`'s own explicit-forecast FY2026 FCFF (NOK 9,933mm, built bottom-up from revenue/margin/capex) is already ~15% below the FY2025 CFO−capex figure before any market-implied growth is layered on — the two are different FCF definitions (CFO−capex vs NOPAT+D&A−Capex−ΔNWC) sitting at different levels, a limitation of using FY2025's reported figure as a single-point base. The margin solve is built consistently on `04`'s own bottom-up FCFF definition and revenue/capex/NWC path, and is the more reliable read: it says the price requires Hydro to hold its FY2025 actual margin (13.9%) roughly flat indefinitely — **not** the Q1 2026 shock print (17.2%) and **not** even the sell-side consensus embedded in Capital IQ (17.0%/17.3%/16.3% for FY2026–28, which `04` itself overrode as extrapolating a non-run-rate print) — but **above** `04`'s own 13.0% "mid-cycle" anchor, which was deliberately set between the FY2023 trough (11.5%) and the FY2025 actual (13.9%).

In 2–4 sentences: the market's implied expectation is **not** that Hydro grows — it is that Hydro's margin stays exactly where it already sits (13.9%, FY2025 actual) rather than fading toward `04`'s more conservative 13.0% mid-cycle anchor, a difference of about 90bps of Adjusted EBITDA margin held across the whole forecast and terminal period. That is a real ask, not a trivial one: the two upstream earnings modules that examined the current elevated pricing environment both independently call it non-durable, and the company's own forward hedge book (67% of Q2 2026 volume booked below spot) shows the market for physical metal itself already discounting some reversion. This sits between "conservative" and "aggressive" — it does not require the shock to persist, but it does require it not to fully fade to the trough-adjusted mid-cycle Hydro's own DCF assumes, which is a **Stretch**, not a **Yes**.

**Market-ceiling sanity check (commodity-producer adaptation — one-directional).** NHY is a commodity/cyclical operating company (Business-Type Method Map), so a revenue-share-of-TAM test is the wrong tool — Hydro is an LME price-taker on the bulk of its volume, not a share-gaining consumer brand, so revenue growth here is overwhelmingly a price/mix story, not a market-share-capture story. The correct proxy, per the rule's instruction to "substitute the appropriate scale," is the **physical volume/capacity ceiling**: global primary aluminium consumption ex-China is running +1.2% YoY (Q1 2026) and full-year 2026 European extrusion demand growth is guided at only ~1% [`earnings/02_revenue-drivers.md` §Table, citing `first-quarter-report-2026.pdf` p.12, p.16]. `04`'s own revenue path (NOK 213,366mm → 228,071mm, FY2026–30, a ~1.6%/yr CAGR) sits modestly above this physical-demand growth rate but within a plausible band once price/inflation is layered on — it does **not** require Hydro to capture share it has never held. This check therefore does not add an independent kill signal on top of the margin-durability finding above: the achievability question here is about price/cost spread (margin), not about physical volume or market share, and the sanity check confirms the volume assumption in `04`'s own build is not the aggressive part of the ask.

## 4. Robustness

All figures are the primary (FCF-CAGR) solve unless noted, executed via the same Python bisection solver.

| Discount Rate | Implied 5-yr FCF CAGR to Justify Price |
|---|---:|
| WACC − 1% (6.5%) | −7.65% |
| WACC (7.5%, used) | −3.21% |
| WACC + 1% (8.5%) | +0.65% |

| FCF Base (NOK mm) | Implied 5-yr FCF CAGR |
|---|---:|
| Low — 5-yr average FCF, FY2021–25 (NOK 10,031mm) [`earnings/01_historical-financials.md` §1] | +0.21% |
| Base — FY2025 module-standard FCF (NOK 11,729mm) [`04_intrinsic-dcf.md` §1] | −3.21% |
| High — company's own FCF APM, FY2025 (NOK 13,034mm) [`04_intrinsic-dcf.md` §1] | −5.47% |

**Terminal `g` ±0.5% (required — `04`'s own terminal value is 78.1% of EV, well above the ~60% trigger):**

| Terminal `g` | Implied 5-yr FCF CAGR |
|---|---:|
| `g` = 2.0% | −1.55% |
| `g` = 2.5% (used) | −3.21% |
| `g` = 3.0% | −5.03% |

**Which input dominates.** Spread across the three levers: WACC ±1% moves the implied growth rate by **8.30pp** (−7.65% to +0.65%); the FCF-base low/high band moves it by **5.68pp** (+0.21% to −5.47%); terminal `g` ±0.5% moves it by **3.48pp** (−1.55% to −5.03%). For NHY, **WACC is the dominant lever**, not the FCF base — the reverse of the typical cross-company pattern this framework has previously found — because `04`'s DCF is terminal-value-dominated (78.1% of EV sits in the Gordon-growth terminal), and WACC is the single input that discounts that entire terminal block. The margin solve corroborates this: the implied margin needed ranges from 12.76% (WACC 6.5%) to 15.26% (WACC 8.5%), a 2.5pp swing on a ±1% WACC move — a large swing on the single assumption `04` itself already flagged as the one the base case is "most sensitive to."

## 5. What's-Priced-In Read

At NOK 84.96, the market is pricing in Hydro holding its FY2025 actual Adjusted EBITDA margin (13.9%) roughly flat through FY2030 and into perpetuity — about 90bps above `04`'s own 13.0% mid-cycle anchor and well above the FY2023 cyclical trough (11.5%) — while requiring essentially no FCF growth off an already-elevated FY2025 base (implied CAGR −3.21%). That is a **Stretch, tilting aggressive**: it does not need the Q1 2026 Middle East supply-shock spike (17.2% margin) or the current sell-side consensus (~17% FY2026–28) to persist, but it does need the current cycle position to sit durably above `04`'s own conservative trough-adjusted anchor — a bet two upstream earnings modules independently call non-durable, and one the company's own forward hedge book (67% of Q2 2026 volume booked below spot) already partially discounts. Because the DCF is terminal-dominated (78.1% of EV), the single biggest swing factor in this read is WACC, not the near-term growth path — an 8.3pp swing in implied growth across a ±1% WACC band versus a 5.7pp swing across the FCF-base band — so the "what's priced in" verdict is really a joint bet on Hydro's discount rate staying near 7.5% (inside its own disclosed impairment-testing band) **and** its margin not fading toward `04`'s mid-cycle anchor; if either assumption reverts to `04`'s own more conservative base case, the current price loses its support.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — NHY

Reporting standard: IFRS. Reporting currency: Norwegian krone (NOK). Fiscal year end: 31 December. Norsk Hydro is a genuinely multi-segment integrated aluminium producer — no segment exceeds the 85% single-segment threshold on either revenue or profit [`analyses/NHY_2026-07-19/business-model/03_segment-map.md`, §2] — so the full breakup is run rather than collapsed.

**Data-vendor flag (read before the numbers below).** Capital IQ's own "Key Stats" tab reports NHY's LTM EBITDA (through Mar-31-2026) at NOK 47,604m and FY2025 EBIT at NOK 41,218m — both roughly 1.6x–2.9x higher than the company's own filed figures (FY2025 group Adjusted EBITDA NOK 28,889m per the Alternative Performance Measures note; FY2025 reported EBIT NOK 14,401m per the income statement) [Norsk Hydro ASA OB NHY Financials.xls, Key Stats tab vs FY2025 Integrated Annual Report, Alternative Performance Measures p.232-233 and income statement]. This is a vendor/filing mismatch, not a real earnings difference — the CIQ revenue line (LTM NOK 201,266m) does independently reconcile to the sum of the company's own segment revenue [Q1 2026 report, Note 2, p.26], so only the EBITDA/EBIT vendor lines are affected. Per CLAUDE.md §4/§5 (filings beat vendor exports; cite the source the number actually came from), this SOTP builds every segment metric from Hydro's own segment note and quarterly disclosures, not from the CIQ Key Stats aggregate.

## 1. Segment Inventory

FY2025 (year ended 31 Dec 2025), NOK million, as reported in Note 1.4 "Operating and geographic segment information" and the Alternative Performance Measures note. Revenue is **external revenue** (the line that sums to consolidated revenue). Profit is **Adjusted EBITDA by segment** — management's own segment performance measure, used here (rather than reported EBIT) because reported EBIT is negative for two segments in FY2025 (Metal Markets, Extrusions) on one-off impairment/restructuring charges, which would make a multiple meaningless. "% of Total Adjusted EBITDA" denominator is **group Adjusted EBITDA, NOK 28,889m**, which already includes the "Other and Eliminations" bucket below — nothing is dropped, and the six rows sum to ~100%.

| Segment | Revenue (external) | Adj. EBITDA | Margin (Adj. EBITDA / total segment revenue, incl. internal) | % of Total Adj. EBITDA | Source |
|---|---:|---:|---:|---:|---|
| Hydro Bauxite & Alumina | 34,470 | 9,339 | 18.5% | 32.3% | FY2025 Integrated Annual Report, Note 1.4 p.149-151 / APM p.232-233 |
| Hydro Energy | 4,986 | 4,152 | 33.1% | 14.4% | Same |
| Hydro Aluminium Metal | 14,762 | 11,409 | 19.9% | 39.5% | Same |
| Hydro Metal Markets | 75,675 | 360 | 0.4% | 1.2% | Same |
| Hydro Extrusions | 78,062 | 3,479 | 4.4% | 12.0% | Same |
| Other and Eliminations (captive insurance + unallocated corporate) | 16 | 151 | n/a (revenue line is a large net elimination, not economically meaningful) | 0.5% | Same |
| **Total** | **207,971** | **28,889** | 13.9% (group) | **~100%** (28,889 of 28,889; rounds to 99.9% in filing-cited component sum) | — |

Reported (unadjusted) EBIT for context, same source: Bauxite & Alumina NOK 6,130m (12.1% margin), Energy NOK 3,617m, Aluminium Metal NOK 7,036m, Metal Markets **NOK -612m**, Extrusions **NOK -1,734m**, Other NOK -36m, group total NOK 14,401m. The two negative-EBIT segments are exactly why Adjusted EBITDA, not reported EBIT, is the SOTP metric.

**"Other and Eliminations" is not dropped.** It is small (0.5% of group Adjusted EBITDA) but it houses NOK 17,254m of assets (8.3% of the group's NOK 208,295m total assets) — mostly the captive insurance subsidiary, Industriforsikring — per `03_segment-map.md`, §3. It is carried through and separately valued in §3 below (Reconciliation Gate 3: no vanished bucket).

## 2. Segment Multiples & Comparables

Segment metric used throughout: **LTM Adjusted EBITDA** (12 months to 31-Mar-2026), computed as `FY2025 − Q1 2025 + Q1 2026` from the company's own disclosed segment Adjusted EBITDA [FY2025 Integrated Annual Report, APM p.232-233; Q1 2026 report, p.279/371/450/551/623 (segment "Adjusted EBITDA" lines) and Q1 2025 comparatives in the same tables]. This matches the **LTM basis** of the Capital IQ peer trading multiples (as-of 2026-07-18), so metric and multiple use the same window. See §3 for the LTM figures.

Peer multiples are LTM TEV/EBITDA from Hydro's own Capital IQ comparable-company set (drawn from Hydro's own named remuneration/TSR peer group where possible) [Company Comparable Analysis Norsk Hydro ASA.xls, Trading Multiples tab, as-of 2026-07-18]. No comparable exists in-pool for Hydro Energy (a captive hydropower generator) or a true metals-trading/distribution business, so those two rows use a named web-sourced peer, labeled unverified.

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| Hydro Bauxite & Alumina | LTM Adj. EBITDA | 4.6x | Aluminum Corporation of China Ltd "Chalco" (SEHK:2600) — integrated bauxite mining, alumina refining, primary aluminium and captive power, the closest full-chain structural match among Hydro's own named peers | 4.6x LTM EV/EBITDA | CIQ Trading Multiples tab, as-of 2026-07-18 |
| Hydro Energy | LTM Adj. EBITDA | 7.5x | VERBUND AG (WBAG:VER, Austria) — ~90%+ hydropower generator, the closest available pure-play hydro peer (not in Hydro's own named comp set; no power pure-play exists there) | ~7.5x EV/EBITDA (7.5x–7.6x across two aggregator reads) | Web: stockanalysis.com, VERBUND AG (VIE:VER) Statistics & Valuation Metrics, accessed 2026-07-19 (unverified, undated as-of within the page) |
| Hydro Aluminium Metal | LTM Adj. EBITDA | 8.1x | United Company RUSAL (SEHK:486) — overwhelmingly upstream bauxite-alumina-primary-metal, minimal downstream, the closest match to a smelting/casting-only segment | 8.1x LTM EV/EBITDA | CIQ Trading Multiples tab, as-of 2026-07-18 |
| Hydro Metal Markets | LTM Adj. EBITDA | 3.3x | ProfilGruppen AB (OM:PROF B) — the lowest-multiple named aluminium peer in Hydro's own comp set; used as an imperfect proxy for a low-margin, high-volume metal-sales/trading/recycling business because no true metals-distribution pure-play exists in the pool or in Hydro's own named peer group | 3.3x LTM EV/EBITDA | CIQ Trading Multiples tab, as-of 2026-07-18 |
| Hydro Extrusions | LTM Adj. EBITDA | 6.0x | Constellium SE (NYSE:CSTM) — European/North American aluminium extruder, closest scale, geography and end-market match (both exposed to the 2024-2026 European/NA construction and auto downturn) | 6.0x LTM EV/EBITDA | CIQ Trading Multiples tab, as-of 2026-07-18 |
| Other and Eliminations | LTM Adj. EBITDA | 3.9x | Norsk Hydro's own consolidated LTM EV/EBITDA — used as a conservative default because no comparable exists for a captive-insurance-plus-corporate-eliminations bucket | 3.9x LTM EV/EBITDA (NHY consolidated) | CIQ Trading Multiples tab, as-of 2026-07-18 |

**Cross-check comparables used only for the dispersion band in §3** (not the base case): Hindalco Industries (BSE:500440), 7.9x LTM EV/EBITDA, named in Hydro's own TSR peer group — close to RUSAL's 8.1x, so Aluminium Metal's range is tight (7.9x–8.1x). Grupa Kety S.A. (WSE:KTY), 13.1x, and ProfilGruppen, 3.3x — both named in Hydro's own TSR peer group — bracket Extrusions' 6.0x base case widely (extrusion peer multiples span 3.3x–13.1x, the widest spread in the set). Fortum Oyj (HEL:FORTUM), ~11.5x EV/EBITDA [Web: alphaspread.com, accessed 2026-07-19, unverified] is a diversified Nordic generator (hydro + nuclear + other) — a weaker pure-play match than Verbund, shown only as a directional cross-check for Energy, not used in the range.

## 3. Segment Valuation

LTM Adjusted EBITDA by segment (12 months to 31-Mar-2026) = FY2025 − Q1 2025 + Q1 2026, all figures from the company's own segment Adjusted EBITDA disclosures cited in §2:

| Segment | LTM Adj. EBITDA (NOK mm) | Multiple | Segment EV (NOK mm) |
|---|---:|---:|---:|
| Hydro Bauxite & Alumina | 4,951 (9,339 − 5,135 + 747) | 4.6x | 22,775 |
| Hydro Energy | 3,759 (4,152 − 1,180 + 787) | 7.5x | 28,193 |
| Hydro Aluminium Metal | 13,897 (11,409 − 2,546 + 5,034) | 8.1x | 112,566 |
| Hydro Metal Markets | 915 (360 − (−14) + 541) | 3.3x | 3,020 |
| Hydro Extrusions | 3,604 (3,479 − 1,174 + 1,299) | 6.0x | 21,624 |
| Other and Eliminations | 916 (151 − (−505) + 260) | 3.9x | 3,572 |
| **Gross enterprise value (sum)** | **28,042** (ties to Hydro's own disclosed group LTM Adjusted EBITDA of NOK 28,041m: FY2025 28,889 − Q1 2025 9,516 + Q1 2026 8,668) | — | **191,750** |

**Dispersion band (named-comparable range, not a fabricated stretch).** Only two segments have a genuine multi-comparable spread in the named peer set: Bauxite & Alumina (Chalco 4.6x vs RUSAL 8.1x) and Extrusions (ProfilGruppen 3.3x vs Grupa Kety 13.1x). Flexing those two segments to their peer-set extremes while holding the rest at base:
- **Low gross EV** ≈ NOK 179,238m (Extrusions at ProfilGruppen 3.3x, Aluminium Metal at the lower cross-check Hindalco 7.9x)
- **Base gross EV** ≈ NOK 191,750m (table above)
- **High gross EV** ≈ NOK 234,665m (Bauxite & Alumina at RUSAL 8.1x, Extrusions at Grupa Kety 13.1x)

Metal Markets, Energy and Other are held fixed across the band — each has only one usable named comparable, so there is no evidence-based way to flex them without fabricating a second peer (banned under this module's rules).

## 4. Equity Bridge

Net debt and minority interest are taken **verbatim** from `01_price-and-capital-structure.md` (Reconciliation Gate 1) — the cash-quality-adjusted, canonical figures, not the CIQ headline.

| Step | Value (NOK mm) |
|---|---:|
| Gross enterprise value (base case, §3) | 191,750 |
| − Capitalized unallocated corporate costs | 0 — the "Other and Eliminations" bucket is already valued and included inside the NOK 191,750m gross EV above (NOK 3,572m of it); it is not a separate drag to subtract again (that would double-count) |
| − Net debt (cash-quality adjusted, canonical per `01`) | (17,919) |
| − Minority / preferred | (7,495) minority; NOK 0 preferred (none outstanding) |
| + Equity-method investments | 0 — Qatalum's equity-accounted profit share (NOK 336m Q1 2026 / NOK 1,067m FY2025) is already embedded inside Hydro Aluminium Metal's reported Adjusted EBITDA used in §3, consistent with `01`'s own treatment of leaving equity-method investments inside segment economics rather than carving them out separately |
| − Conglomerate / holdco discount | 0 — Hydro is a single operating company with five internally-run divisions, not a legal holding company with separately listed subsidiaries; there is no structural minority-squeeze or trapped-cash-at-the-sub issue to discount for, and the base-case SOTP gross EV (NOK 191,750m) already sits within 0.3% of `01`'s own consolidated, cash-quality-adjusted EV (NOK 192,384m) — adding a discount on top would double-count against a gap that is not there |
| **= Equity value (base case)** | **166,335** |
| ÷ Diluted shares (per `01`) | 1,965.28 million |
| **= SOTP value per share (base case)** | **NOK 84.63** |
| vs current price (NOK 84.96, 2026-07-17, per `01`) | **-0.4%** (SOTP base case sits essentially at the current price) |

Applying the same bridge (− NOK 17,919m net debt, − NOK 7,495m minority) to the low and high gross-EV cases from §3:
- **Low SOTP/share** ≈ NOK 78.27 (low gross EV NOK 179,238m → equity NOK 153,824m ÷ 1,965.28m shares)
- **High SOTP/share** ≈ NOK 106.47 (high gross EV NOK 234,665m → equity NOK 209,251m ÷ 1,965.28m shares)

This is a base-case point (NOK 84.63/share) with the named-comparable dispersion shown separately (NOK 78.27–106.47), not a false-precision single number.

## 5. SOTP Read

The base-case breakup value, NOK 84.63/share, sits within 0.4% of the current price (NOK 84.96, 2026-07-17) — the market is already pricing Norsk Hydro almost exactly at the sum of its five segments valued on named aluminium-sector peer multiples, so there is no proven variant perception here of a segment being hidden by the consolidated multiple. Hydro Aluminium Metal (primary smelting) carries the value: at 8.1x its NOK 13,897m LTM Adjusted EBITDA it is worth NOK 112,566m — 58.7% of the NOK 191,750m gross enterprise value — despite generating only 7.1% of group external revenue, the classic upstream-margin pattern already flagged in `03_segment-map.md`. Hydro Metal Markets (36.4% of revenue) and Hydro Extrusions (37.5% of revenue, currently loss-making on reported EBIT) together produce 73.9% of revenue but only NOK 24,644m — 12.9% — of gross EV; a buyer paying for "the biggest two lines on the income statement" without adjusting for segment mix would be paying for volume, not profit. The widest source of disagreement in this SOTP is Extrusions' peer multiple (3.3x–13.1x across three named, equally-credible European extrusion peers), which alone swings the per-share value by roughly NOK 9 in either direction — a genuine cross-method uncertainty, not a rounding error, and one that will matter more if Extrusions' current restructuring (five European plants proposed for closure) either succeeds or fails to restore positive reported EBIT.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — NHY (Norsk Hydro ASA, Oslo Børs: NHY)

Reporting currency: Norwegian krone (NOK million, per-share figures in NOK). Price anchor: NOK 84.96, 2026-07-17 last close, pool-verified [`01_price-and-capital-structure.md` §1, §7]. Shares (per-share fair value basis): 1,965.28 million. Canonical net debt: NOK 17,919mm (cash-quality adjusted); canonical minority interest: NOK 7,495mm; canonical EV: NOK 192,384mm [`01` §4, §7]. All bull/base/bear levels below use these anchors verbatim (Reconciliation Gate 1).

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | NOK 64.33–94.44 (illustrative range; own-median LTM P/E point NOK 64.33) | Low — own producer flags this **"illustrative-only, not a `07` input"**: history is ~13 months, well short of the 3-year bar, and the split is a mechanical LTM-vs-NTM cycle-position artifact, not two independent views | **0% (zero-weighted, own-producer flag)** | `02` explicitly states its Section 4 reversion figures are illustrative-only and must not be treated as a base-case fair-value input — carried into the football field below for transparency, excluded from the weighted base point per the module's own zero-weight rule |
| Relative / peers (03) | NOK 93.7 (base, quality-adjusted NTM EV/EBITDA); dispersion NOK 72–134 across basis/comp readings | Medium — the NTM EV/EBITDA, EV/Sales, and forward P/E cluster is independently cross-checked against consensus and audited figures, but the base case stacks two judgment calls: an inferred NOK/USD 9.63 FX rate and a discretionary 10% quality discount off the peer median | **25%** | Real, verified signal (NTM basis is clean), but the peer set is imperfect (only RUSAL/Chalco/Hindalco are Hydro's own named TSR peers; the rest are broader CIQ-relevancy matches, several diversified miners or downstream-extrusion-only) and the base case rests on this report's own discretionary discount, not a disclosed figure |
| Intrinsic DCF (04) | NOK 70.14 (base, mid-cycle 13.0% Adj. EBITDA margin); sensitivity grid NOK 52.51–102.81 | Medium — capped near 60/100 by the module's own terminal-dominance rule (TV = 78.1% of EV); WACC/g grid swings the answer by ~2x | **35%** | The Business-Type Method Map's **primary intrinsic method for a commodity/cyclical operating company**; correctly normalizes the FCF base to a mid-cycle margin (13.0%, between the FY2023 trough 11.5% and the FY2025 actual 13.9%) rather than extrapolating the Q1 2026 Middle East supply-shock print — but terminal dominance and extreme rate sensitivity earn it real weight, not top weight |
| Reverse-DCF (05) | (implied, not a value) — price implies a 5-yr FCF CAGR of −3.21% off the FY2025 base, or a uniform Adjusted EBITDA margin of 14.02% held through FY2030+ | n/a | n/a | Cross-check only: confirms the price is *not* demanding growth, but is demanding the FY2025 actual margin (13.9%) hold roughly flat rather than fade to `04`'s 13.0% mid-cycle anchor — a **Stretch**, per `05`'s own read, not a **Yes** |
| Sum-of-the-parts (06) | NOK 84.63 (base); dispersion NOK 78.27–106.47 (named-comparable range) | High — segment metrics are Hydro's own audited Note 1.4 disclosures; gross EV (NOK 191,750mm) ties to `01`'s consolidated canonical EV (NOK 192,384mm) within 0.3%, no plug | **40%** | Norsk Hydro is genuinely multi-segment (no segment >85% of EBIT — `03_segment-map.md`), making SOTP mandatory and, on the evidence, the most tightly-reconciled method here: it uses only named comparables tied to audited segment Adjusted EBITDA, with the smallest gap to the consolidated EV bridge of any method in this report |

Weights sum to 100% across the three value-producing, valid-for-type methods (03, 04, 06). `02` is zero-weighted per its own "illustrative-only" flag (Workflow step 3). `05` is a cross-check, never a weighted value (module rule).

## 2. Triangulation & Reconciliation

**Method football field (the honest cross-method spread — not narrowed):**

| Method | Value / Range (NOK/share) | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| 02 Own-history multiples | 64.33–94.44 (illustrative point 64.33) | Low | 0% | Own-producer "illustrative-only" flag — 13-month history |
| 03 Relative / peers | 93.7 base (72–134 full dispersion) | Medium | 25% | Clean NTM cluster, but FX + discretionary discount stacked on an imperfect comp set |
| 04 Intrinsic DCF | 70.14 base (52.51–102.81 sensitivity grid) | Medium (confidence capped ~60) | 35% | Primary method for the business type; terminal-dominated (78.1% of EV) |
| 05 Reverse-DCF | n/a — implied margin 14.02% / implied FCF CAGR −3.21% | n/a | n/a | Cross-check, not a value |
| 06 Sum-of-the-parts | 84.63 base (78.27–106.47 named-comparable range) | High | 40% | Ties to consolidated EV within 0.3%; audited segment data throughout |

The base-case points cluster in a NOK 70.14–93.70 band — a 33.6% spread between the low (DCF) and high (peers) — under the module's 40% "must-lead-with-it" threshold, but still the central reconciliation question of this report. The much wider extremes shown in each method's own internal range (DCF sensitivity floor NOK 52.51 to peer full-parity ceiling NOK 134.1, a 155% spread) are **not** treated as the decision-relevant dispersion — they are sensitivity/no-discount edge cases inside each method, not three independent fair-value opinions, and are shown here for transparency only.

**Weighted base-case point, computed:**

```
Weighted base = 0.35 x 70.14 (DCF) + 0.40 x 84.63 (SOTP) + 0.25 x 93.7 (peers)
             = 24.549 + 33.852 + 23.425
             = NOK 81.83 / share
```

**Reconciliation judgement (3–5 sentences).** SOTP is trusted most because it is built entirely from Hydro's own audited segment disclosures and its gross enterprise value lands within 0.3% of `01`'s consolidated canonical EV — the least amount of forecasting judgment of the three methods. The DCF is trusted second, both because it is the Business-Type Method Map's mandated primary method for a commodity/cyclical name and because it deliberately normalizes the FY2025 earnings base to a mid-cycle margin rather than chasing the Q1 2026 Middle East supply-shock print — but its own terminal-value dominance (78.1% of EV) and the wide WACC/g sensitivity grid earn it a real, not top, weight. Peer relative valuation is trusted least: its NOK 93.7 base case is the only one of the three that depends on this report's own discretionary judgment call (a 10% quality discount to the peer median) stacked on an inferred FX conversion, rather than on a figure the market or the filings actually disclose. The three base points diverge chiefly because they answer slightly different questions — DCF prices Hydro's own cash generation at a conservative mid-cycle margin, SOTP prices its segments at what the market currently pays for comparable pure-plays, and peers price the *consolidated* business against a basket that is only a partial structural match — and the weighted blend (NOK 81.83) sits, by construction, closer to the two more-reliable methods (SOTP and DCF) than to peers.

## 3. Bull / Base / Bear Fair-Value Levels

All three levels are DCF-consistency-checked (same WACC 7.50%, same 5-year explicit horizon FY2026–2030, mid-year discounting, same revenue/capex/D&A/working-capital build as `04`'s canonical model) so that the only lever that changes between cases is the operating driver named — this isolates what each scenario actually requires, rather than mixing methods inside one column. Horizon: 12 months (price convergence window) for Base and Bull; the Bear level reflects a structural (multi-year) impairment path priced today, labelled below.

| Case | Fair Value / Share (point) | Implied EV/FY2025-Adj-EBITDA | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---|---|
| Bull | **NOK 107.70** | 8.21x (7.17x on FY2026E EBITDA) | 12-month | Adjusted EBITDA margin sustains **15.5%** through FY2026–2030 (above the what's-priced-in 14.02% from `05`, and above the FY2025 actual 13.9%) — i.e. the current Middle East LME price spike and the widened recycling/premium spread only partially fade rather than normalize, consistent with the **bull** cases of the top two earnings-sensitivity variables (LME price +USD 300/mt persists; recycling spread +20% vs Q1'26) [`earnings/07_earnings-sensitivity.md` §2]. Also requires the market to keep paying a multiple (8.2x) near NHY's own current elevated LTM restated multiple (8.75x) rather than reverting toward the 5.6–6.25x peer-anchored range — a genuine stretch on **both** margin and multiple simultaneously |
| Base | **NOK 81.83** | 6.45x | 12-month | Weighted blend (§2): Adjusted EBITDA margin fades to `04`'s 13.0% mid-cycle anchor (between the FY2023 trough 11.5% and FY2025 actual 13.9%); peer-relative multiple sits at the quality-adjusted 5.6x NTM EV/EBITDA (10% discount to the 6.25x peer median, reflecting negative revenue growth, the narrow/eroding moat, and the RF-OWN-004 unaligned-owner flag — `03` §4); segment-level SOTP multiples hold at their named-comparable base (RUSAL 8.1x on Aluminium Metal, Chalco 4.6x on Bauxite & Alumina, Constellium 6.0x on Extrusions — `06` §2) |
| Bear | **NOK 45.12** (structural reset — see below; billed as headline per the eroding-moat rule) | 3.95x | Structural / multi-year, priced today | See "Structural / permanent down-leg" below — this is **not** a mild dip off the recent peak |

**Cyclical through-cycle trough (shown for comparison, not the headline).** A separate, purely cyclical bear — margin held at the FY2023 documented trough (11.5% Adjusted EBITDA margin, the genuine cyclical low: group net-income margin collapsed to 1.85% and ROE to 2.6% that year — `04` §1, `business-model/07_business-quality.md`) sustained through the same 5-year explicit window with the same WACC/g — computes to **NOK 46.43/share** (executed Python, same DCF build as `04`, margin substituted for the fade schedule):

```
BEAR-CYCLICAL (11.5% uniform margin, FY2023 trough): PV explicit=24,575; TV(undisc)=127,517; PV(TV)=92,094
EV=116,669 -> Equity=91,255 (- net debt 17,919 - minority 7,495) -> Per-share = NOK 46.43
```

This is 1.3 NOK/share (2.8%) above the structural reset — close, but the structural reset is worse and is the one this report bills as the headline Bear (see below).

### Structural / permanent down-leg (avoid-ruin — distinct from the cyclical trough)

**Trigger check.** `business-model/09_moat.md` returns **Narrow moat, trajectory eroding** — not "No moat proven," but the eroding-trajectory leg of the trigger fires: Hydro Extrusions' EBIT margin fell from ~4% (2020–2023) to −2.2% (2025), five European plants are proposed for closure, and the module's own competitive-intensity row (score 45/100) flags "a mid-cost-curve competitor a few years from now is a live possibility, not a tail risk" for the upstream cost-curve position that carries the whole group's above-cost-of-capital read. The disruption-flag threshold (`business-model/07_business-quality.md`'s rate-of-change row) does **not** separately fire — it scored 68/100, comfortably above the ≤40 threshold — so this is the eroding-moat trigger alone, not a fast-changing-industry trigger.

**Which case it becomes.** Because the moat trajectory is **confirmed eroding** (not a bare "unproven" verdict), the structural reset is billed as the **headline Bear**, and per the rule it is the **worse (lower) of** the structural reset and the cyclical through-cycle trough computed above — NOK 45.12 (structural reset) vs NOK 46.43 (cyclical trough); the structural reset is lower and is used. This billing is also supported (not merely permitted) here because `04`'s DCF — the method that carries the moat's terminal-fade information — **is** included in the weighted triangulation (35% weight, §1), so the eroding-moat's lost excess return is already partially reflected in the Base case; the structural reset is not being asked to carry an un-reflected impairment alone.

**Method and bridge (reproducing `04`'s own executed build, EV-based reset, bridged with `01`'s canonical net debt).** Business type is operating (commodity/cyclical), so the appropriate reset method is an impaired FCFF DCF: the explicit FY2026–2030 forecast is held at `04`'s own base-case margin path (this is a *terminal*, not near-term, impairment — the near-term years are not assumed to collapse), but the **terminal** is rebuilt on a structurally-lower normalized margin, maintenance-only capex, and a declining (not growing) perpetuity:

```
Impaired driver: terminal Adjusted EBITDA margin cut to 9.0% (below the FY2023 cyclical trough of 11.5%) —
  reflecting continued Extrusions structural decline plus the upstream cost-curve advantage eroding as
  Chinese/Gulf capacity expands [business-model/07_business-quality.md, competitive-intensity row].
Capex cut to maintenance-only: NOK 8,500mn/yr (the guided FY2027-30 maintenance figure, vs guided total capex ~15,000).
Terminal g = -1.0% nominal (genuine real AND nominal decline, on the same nominal basis as the rest of the DCF).

Runoff EBITDA (FY2030 revenue base) = 228,071 x 0.09 = 20,526
Runoff EBIT = 20,526 - 11,500 (D&A) = 9,026
Runoff NOPAT (30% tax) = 9,026 x 0.70 = 6,318
Runoff FCFF = 6,318 + 11,500 - 8,500 - 0(dNWC) = 9,318
Runoff TV = 9,318 x 0.99 / (0.075 - (-0.01)) = NOK 108,533mm (undiscounted)
PV of runoff TV (mid-year Yr5 factor 0.72221) = NOK 78,383mm

Runoff EV = PV(explicit, base-case path, SAME as Base) + PV(runoff TV) = 35,712 + 78,383 = NOK 114,095mm
- Net debt (01's canonical, cash-quality adjusted) = 17,919
- Minority interest (01's canonical) = 7,495
= Equity value = NOK 88,681mm
/ Shares (1,965.28mm) = NOK 45.12/share
```

[Reproduced and cross-checked against `04_intrinsic-dcf.md` §4–§5]

This is an **EV-based reset** (impaired FCFF DCF), so the bridge correctly subtracts `01`'s canonical net debt and minority interest before dividing by shares — it is not an equity-multiple reset, so no double-count risk applies. The result (NOK 45.12/share, a 46.9% downside from the current price) reconciles to its stated method (impaired terminal DCF), its stated driver (9.0% terminal margin / maintenance capex / −1.0% declining perpetuity), and the canonical net-debt anchor.

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | NOK 84.96 (2026-07-17, pool-verified last close) |
| Base-case fair value (point) | NOK 81.83 |
| Bear-case fair value (headline, structural reset) | NOK 45.12 |
| Implied upside to base case = (base FV − price) / price | **−3.68%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−3.83%** (price sits *above* base fair value — no cushion; the base case implies modest overvaluation, not undervaluation) |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **46.89%** (structural-reset bear); memo: **45.35%** on the purely cyclical-trough bear (secondary, not headline) |

```
mos = (81.83 - 84.96) / 81.83 = -3.83%
upside_base = (81.83 - 84.96) / 84.96 = -3.68%
downside_to_bear = (84.96 - 45.12) / 84.96 = 46.89%
```

Both metrics are computed from `01`'s pool-verified price (NOK 84.96, 2 calendar days old, well inside the 5-trading-day freshness threshold — no staleness cap applies).

## 5. Warranted-Multiple Check

The base case implies an EV/FY2025-Adjusted-EBITDA of 6.45x — modestly above both independently-derived warranted-multiple anchors in this report: `03`'s own quality-adjusted peer multiple (5.6x NTM EV/EBITDA, already discounted 10% below the 6.25x peer median for negative revenue growth, the narrow/eroding moat, and the unaligned-owner flag) and `04`'s own DCF-implied exit multiple (5.96x, the multiple its Gordon-growth terminal value implies). This gap is not large, but it is real — the base case is pulled slightly above those two anchors by SOTP's segment-sum arithmetic, where Aluminium Metal alone (58.7% of SOTP's gross EV on 7.1% of group revenue — `06` §5) is priced at RUSAL's 8.1x. **Value-trap flag (mandatory, RF-OWN-004):** the management-governance module flagged the Norwegian State's 34.49% stake as a structurally misaligned controlling owner (RF-OWN-004, CLAUDE.md §24 Filter 6) — held for an explicit industrial-policy mandate (retaining head-office/technology functions in Norway), not per-share value maximization, and the Board has declined to adopt takeover-bid-handling principles because of the size of that stake. Per the module's own score-cap rule, this caps valuation attractiveness at 60 and means any of the apparent peer-relative discount cannot be read as a clean re-rating case — a value-value-indifferent owner has no mandate to close it, and the bear case above does not assume a re-rating the State will not pursue.

## 6. Fair-Value Read

The three fair-value levels are Bull NOK 107.70 (+26.8% vs price; requires margin *and* multiple to both stay near their current cyclically-elevated readings), Base NOK 81.83 (−3.7% vs price; a triangulated blend anchored on mid-cycle margins and a peer-quality-adjusted multiple), and Bear NOK 45.12 (−46.9% vs price; a structural, not merely cyclical, impairment of the terminal value, billed as the headline Bear because the moat trajectory is independently confirmed eroding, not merely unproven). The margin of safety at today's price is **negative (−3.8%)** — the base case argues Hydro is priced slightly above, not below, its blended fair value — while the downside to the bear case is a real 46.9%, an asymmetry that should be read together, not separately. Sum-of-the-parts drives the answer: it carries the heaviest weight (40%) because it ties within 0.3% of the consolidated EV using only audited segment data, and it is also the method sitting closest to today's price (−0.4%), which is why the market does not look mispriced on a base-case view even though the DCF alone reads −17.4% below price. The single biggest swing factor between bull and bear is the **Adjusted EBITDA margin path** (15.5% sustained vs a structurally-impaired 9.0% terminal) — itself downstream of whether the Middle East supply-shock aluminium-price spike persists, fades to `04`'s 13.0% mid-cycle anchor, or is compounded by a genuine, evidenced erosion of Hydro's upstream cost-curve advantage and Extrusions' already-negative margin.
