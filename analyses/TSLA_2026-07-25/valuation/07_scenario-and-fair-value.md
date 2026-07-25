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
