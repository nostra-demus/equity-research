# Scenario & Fair Value — HAIER (Haier Smart Home Co., Ltd., SHSE:600690)

**Anchor (verbatim from `01_price-and-capital-structure.md`):** Current price CNY 21.75 (A-shares, SHSE:600690, last close 2026-08-12, `pool-verified`, 1 trading day old — no staleness cap, no dual-price re-anchor needed). Diluted weighted-average shares (per-share fair-value count) 9,311.825848m. Net debt (broad, canonical) CNY −24,598.67m (net cash). Minority interest CNY 9,606.03m. Equity-bridge add-back used throughout = −Net debt − Minority = +CNY 14,992.64m. Currency: CNY (RMB) millions except per-share figures.

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | CNY 23.10–26.51 (illustrative reversion range) | Low — own producer marks this **illustrative-only** | **0%** | `02`'s own text: "no point or tight-range reversion target is asserted as a fair-value input," because the pool's own-multiple history is ~20 months, well short of the module's 3-year bar. Per the zero-weight rule (self-flagged non-value-producing), this is excluded from the weighted base point but shown in the football field (§2) and its min/mean/median/max band is still used to anchor the bull/base/bear multiples in §3 |
| Relative / peers (03) | CNY 22.08 (quality-adjusted EV/EBITDA base case) | Moderate–High | **68%** | Grounded in real, dated market comps (Midea, Gree; Whirlpool web-sourced). With `02` zero-weighted, `03` alone must carry the "multiples majority" the Scenario Construction Policy requires for an operating company with estimates. `03`'s own quality adjustment (7.35x vs peer-median 9.71x, haircut for Haier's 24%-below-peer EBITDA margin) is well evidenced by the moat/business-quality findings and lands almost exactly on `02`'s own 8-quarter mean/median (7.38x/7.34x) — two independent methods converging on the same multiple is the strongest signal in this triangulation |
| Intrinsic DCF (04) | CNY 29.84 (exit-multiple canonical, +37.2% vs price) | Moderate (producer-capped) | **17%** | Method Map primary for an Operating company, but `04` itself caps confidence at Moderate and flags its mechanically-correct WACC (4.10%) as "materially below the discount rate the market appears to actually apply to this stock" (own trading multiple never exceeded 10.1x EV/EBITDA). `05`'s reverse-DCF corroborates: a flat, no-growth FCF path only reconciles to price at a ~12.3% WACC. Capped per the Scenario Construction Policy (04+06 combined ≤ ≈⅓) rather than dragging the base down — here the DCF instead pulls the blend *up*, and the cap disciplines that pull the same way it would discipline a drag |
| Reverse-DCF (05) | (implied, not a value) — implies −6.48%/yr FCF/EBITDA contraction OR a WACC ≈12.3% is more realistic than `04`'s 4.10% | n/a | n/a | Cross-check only. Confirms the achievability question in §5, not a weighted input |
| Sum-of-the-parts (06) | CNY 23.86 (+9.7%); sensitivity range CNY 16.74–23.86 | Moderate | **15%** | `06`'s own producer flags this as "comp-fragile": 49% of gross EV comes from the Laundry segment priced on Midea's 12.71x derived multiple (Midea being a diversified conglomerate, an imperfect comp) — swapping to the cheapest domestic comp drops the value to CNY 16.74, a 23% swing on one assumption. Real but fragile; capped jointly with `04` at ≈⅓ combined |

Weights sum to 100% across value-producing methods (`03`, `04`, `06`). `02` is zero-weighted per its own illustrative-only flag (short 8-quarter history) and shown for transparency only. `05` is a cross-check, never a weighted input. `04` + `06` combined = 32%, inside the ≈≤⅓ cap (Scenario Construction & Method-Weighting Policy §1).

**Multiples-first applied.** Haier is an Operating company (Business-Type Method Map) with a usable forward metric (Capital IQ consensus FY2026E EBIT/EBITDA/EPS) and both an own-history band (`02`) and a peer set (`03`). Per policy, `02`+`03` together must carry the majority weight. Because `02` is self-flagged illustrative-only, `03` alone carries that majority (68%), and `04`/`06` are held to the capped cross-check role.

## 2. Triangulation & Reconciliation

**Method football field** (full high-to-low spread, not narrowed):

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| 02 Own-history multiples | CNY 23.10 – 26.51 (illustrative reversion only) | Low (illustrative-only) | 0% | Short 8-quarter history; shown for transparency and to anchor §3 multiples, not as a value input |
| 03 Relative/peers — quality-adj. base | CNY 22.08 | Moderate–High | 68% | See §1 |
| 03 Relative/peers — unadjusted peer-median dispersion | CNY 26.23 – 31.38 | Low–Moderate (mechanical, not the base case per `03`'s own read) | (inside 68%, not separately weighted) | Ceiling if Haier's margin fully converged to peer-normal — evidence does not yet support this |
| 04 Intrinsic DCF — canonical base | CNY 29.84 | Moderate (producer-capped) | 17% | See §1 |
| 04 DCF — primary sensitivity grid | CNY 25.88 – 34.11 | Moderate | (inside 17%) | WACC ±1pp × exit multiple 6.0x–8.0x |
| 04 DCF — structural-reset/runoff (bear input, see §3) | CNY 15.90 – 21.51 | Low (explicit worst-case construction) | (bear-case input, not base-point weight) | See §3 |
| 06 Sum-of-the-parts — base | CNY 23.86 | Moderate | 15% | See §1 |
| 06 SOTP — comp-swap sensitivity | CNY 16.74 – 23.86 | Low–Moderate | (inside 15%) | Laundry-segment comparable choice drives 43% of the spread |

**Weighted base-point calculation (executed):**

```
w03, w04, w06 = 0.68, 0.17, 0.15
v03, v04, v06 = 22.08, 29.84, 23.86   # CNY/share
blend = 0.68*22.08 + 0.17*29.84 + 0.15*23.86
      = 15.0144 + 5.0728 + 3.5790
      = 23.67   # CNY/share
```

**Base-case fair value (weighted triangulation point): CNY 23.67/share** (+8.8% vs the CNY 21.75 price). This is cross-checked in §3 by an independent forward-metric × multiple build, which lands at CNY 23.56 — a 0.5% gap, i.e. the two approaches for arriving at "base case" converge.

**Reconciliation judgement.** `03`'s peer-relative read is trusted most for the base point: it is the only method resting on real, dated market prices for named comparables, its margin-quality haircut is independently corroborated by the moat and business-quality modules (Haier's EBITDA margin genuinely sits 24% below the peer median, and the moat is independently rated "narrow" and "eroding" — not this agent's own assumption), and its quality-adjusted multiple (7.35x) converges almost exactly with `02`'s own 8-quarter mean/median (7.38x/7.34x) despite being derived by a completely different method — that convergence is the strongest signal in this dossier. `04`'s DCF is the clear outlier at +37.2%, and the divergence (35.1% above `03`, just under the 40% hard-disagreement trigger) is explained, not averaged away: `04`'s own producer flags its mechanically-correct WACC (4.10%, a product of China's sub-2% sovereign yield and Haier's 0.46 beta) as materially below the discount rate the market visibly applies (Haier's own trading multiple has never exceeded 10.1x EV/EBITDA), and `05`'s reverse-DCF corroborates from the other direction — a flat, no-growth FCF story only reconciles to today's price at a ~12.3% WACC, not 4.10%. This is a **low-WACC artefact pulling the DCF up**, the mirror image of the "low-DCF-drag" case the Scenario Construction Policy anticipates — the same capped-cross-check treatment (≤⅓ combined with `06`) disciplines it either way. `06`'s SOTP (CNY 23.86) sits close to the blended base but is flagged by its own producer as comp-fragile (one segment, one imperfect comparable, driving a 43% swing) — treated as corroborating, not load-bearing.

**Cross-method spread is real but does not clear the 40% hard trigger.** `04` vs `03`: (29.84 − 22.08)/22.08 = 35.1%. This is flagged and reconciled above (Reconciliation Gate 6) rather than silently blended.

## 3. Bull / Base / Bear Fair-Value Levels

Every case = forward FY2026E EBITDA × an EV/EBITDA multiple, bridged to equity using `01`'s canonical net-debt/minority anchor (`Equity = EV + CNY 14,992.64m`), divided by 9,311.825848m diluted weighted-average shares. Multiples are anchored to `02`'s own 8-quarter band (min 5.87x, mean 7.38x, median 7.34x, max 9.74x) — used here as a **band anchor for multiple selection only**, consistent with `02`'s own caveat that it is not a valid reversion-target value.

**Cyclicality Gate applied to the bear case.** Business-quality scores Haier's cyclicality at 34/100 and names FY2024 (9.12% ROIC, 7.66% EBIT margin) as a "subsidy-assisted cyclical high-water mark, not the sustainable run-rate" [`business-model/07_business-quality.md` §4]. The company's own 5-year EBIT-margin trough is **FY2021 at 5.91%** [`04_intrinsic-dcf.md` §2] — this is the through-cycle anchor used for `bear_cyclical` below, not a mild dip off the recent peak.

**Structural / permanent down-leg trigger fired.** `business-model/09_moat.md` §5 verdict: **"Moat trajectory: eroding"** — gross margin down 460bp over five years (30.9%→26.3%), ROIC down for two consecutive readings from its FY2024 peak (9.12%→7.97%→7.56%). Business-quality's rate-of-change/disruption row scores 72/100 (above the ~40 threshold), so this is a competitive/cost-erosion trigger, not a disruption trigger. Because the trajectory is **confirmed eroding** (not a bare "No moat proven" verdict), the structural-reset becomes the **headline Bear** — computed as the WORSE (lower) of `bear_structural` and `bear_cyclical` below, per the graduated rule. Both cases are shown separately and neither is merged into the other.

| Case | Fair Value / Share (point) | Forward Metric (FY2026E EBITDA, CNY mn) | Multiple (EV/EBITDA) | Horizon | What Must Be True |
|---|---:|---:|---:|---|---|
| **Bull** | **CNY 31.78** | 37,967.4 | 7.4x | 12-month | Raw-material excess-cost growth reverts to 0pp (consensus-basket input costs stop outrunning volume — earnings-sensitivity bull case, +CNY 5,350mn EBITDA) **AND** China domestic demand partially recovers to +5% YoY (subsidy-fade pain proves milder than the Q1-2026 −6.2% pace — +CNY 2,111mn EBITDA-equivalent) [`earnings/07_earnings-sensitivity.md` §2]. The multiple expands from base (6.7x) to 7.4x — at the quality-adjusted/own-history-mean ceiling (`03`'s 7.35x, `02`'s 7.38x mean), reflecting partial margin-gap closure versus Midea/Gree, **not** a re-rate to the full unadjusted peer median (9.71x), which the evidence does not support |
| **Base** | **CNY 23.56** (≈ CNY 23.67 triangulated, §2) | 30,506.36 (Capital IQ consensus, `02` §1) | 6.7x | 12-month | FY2026E consensus growth path holds roughly as guided (revenue +2.24%, EBITDA to ~CNY 30.5bn) — the same path `04`'s DCF forecasts explicitly. Multiple sits modestly above the current LTM print (6.75x) but well short of full reversion to `02`'s own mean (7.38x): the market keeps discounting Haier for its ongoing margin-erosion and consensus-cutting cycle (`02` §3: EPS cut ~14% over 6 months, two consecutive misses against an already-lowered bar), but stops discounting further |
| **Bear — cyclical trough** | **CNY 16.79** | 24,072.0 (FY2021 trough EBIT margin 5.91% applied to FY2026E consensus revenue CNY 309,110.7mn, + FY2025 D&A ratio) | 5.87x (own-history 8-quarter low) | 12-month | Commodity-cost pressure, competitive intensity and China property-cycle softness together erase the SG&A-driven margin gains posted since FY2021 — EBIT margin reverts fully to the company's own documented 5-year trough, not merely dips off the recent peak. Multiple compresses to the bottom of Haier's own trading range |
| **Bear — structural reset (HEADLINE)** | **CNY 15.90** | Terminal EBITDA CNY 23,440.1mn (FY2030, runoff) | 5.0x (below Haier's own low-end trading range — de-rated) | 24–36 month | Moat erosion continues without stabilizing: revenue growth cut to roughly half consensus, EBIT margin fades to **5.00% by FY2030 — below the FY2021 trough**, gross margin fades further (25.0%→23.8%), capex pulled back, working capital deteriorates (CCC +6.0d→+30.0d). Reproduced from `04_intrinsic-dcf.md` §5, its explicit structural-decline/runoff scenario, itself triggered by the same "eroding" moat verdict |

**Structural-reset bridge (executed, reproducing `04`'s EV-based reset with `01`'s canonical net-debt anchor — subtract net debt BEFORE dividing by shares):**
```
Runoff EV (impaired, EBITDA x de-rated multiple) = 23,440.1 x 5.0 = 117,200.7   (undiscounted TV)
PV(TV) = 97,795.1 ; PV(explicit runoff FCF) = 35,275.4
Impaired EV = 35,275.4 + 97,795.1 = 133,070.5
Equity = Impaired EV - Net debt(broad, canonical, -24,598.67) - Minority(9,606.03)
       = 133,070.5 + 24,598.67 - 9,606.03 = 148,063.14
Per-share = 148,063.14 / 9,311.825848 = CNY 15.90   (-26.9% vs price CNY 21.75)
```
This is an EV-based reset (impaired EBITDA × an EV multiple), so it is bridged with `01`'s canonical net-debt/minority anchor exactly as every other EV-based case in this report — no double subtraction, no equity-already-net double count.

**Headline Bear = worse of the two = CNY 15.90 (structural reset).** The cyclical trough (CNY 16.79) is milder; per the graduated rule the deeper case leads because the moat trajectory is confirmed eroding, not merely unproven. `bear_cyclical` (12-month) and `bear_structural` (24–36 month) are different horizons and are NOT blended — the structural case is a multi-year permanent-impairment path, the cyclical case a next-four-quarters risk.

**Bull-to-bear spread (the range):** CNY 15.90 (structural bear) to CNY 31.78 (bull) — a 2.0x span, driven overwhelmingly by whether Haier's margin erosion stabilizes (bull/base) or continues unchecked toward a new structural floor (bear-structural).

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price (2026-08-12, `pool-verified`, 1 trading day old) | CNY 21.75 |
| Base-case fair value (point, §2 weighted triangulation) | CNY 23.67 |
| Bear-case fair value (headline — structural reset) | CNY 15.90 |
| Bear-case fair value (cyclical trough, secondary) | CNY 16.79 |
| Implied upside to base case = (base FV − price) / price | **+8.8%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **+8.1%** |
| **Downside to bear** = (price − bear FV) / price — *inverted, higher = worse* (headline, structural) | **26.9%** |
| Downside to bear (cyclical trough, secondary) | 22.8% |

Both metrics are assessable — `01`'s price-state is `pool-verified` and the quote is 1 trading day old (no staleness cap). Margin of safety (8.1%) and downside-to-bear (26.9%) are deliberately different numbers: the cushion in the base case is modest, while the loss in the confirmed-eroding-moat bear case is a real quarter of the current price — the asymmetry itself is the finding (§6).

## 5. Warranted-Multiple Check

The base case implies a forward EV/EBITDA of 6.7x — below `02`'s own 8-quarter mean/median (7.38x/7.34x) and below `03`'s independently-derived quality-adjusted multiple (7.35x), which itself already prices in Haier's 24%-below-peer margin. This is a **conservative**, not an aggressive, warranted multiple: it does not require the market to forgive Haier's margin gap versus Midea/Gree, only to stop discounting it further than the current LTM level (6.75x). The bull case's 7.4x ceiling is capped at the quality-adjusted/own-history-mean level, deliberately short of the full unadjusted peer median (9.71x) that Haier has never earned. The one method that WOULD require a stretch is `04`'s DCF headline (+37.2%): it implies a 7.0x terminal multiple that is inside Haier's own trading history, so the multiple itself is not the issue — the issue is `04`'s own flagged, mechanically-too-low WACC (4.10% vs a market-implied ≈12.3% per `05`'s reverse-DCF), which is why `04` is capped at 17% weight rather than driving the base case. **Value-trap risk:** `02` itself flags that "this discount could be the market correctly pricing a lower structural earnings trajectory rather than a cyclical overreaction" — the moat module's independent "eroding" verdict corroborates that this is a live risk, not a footnote. No RF-OWN-004 structurally-misaligned-owner flag was found (`management-governance/99` — Haier Group Corporation is a collectively-owned enterprise, not government-controlled, not a value-maximizing parent's subsidiary, not a sprawling conglomerate), so the value-trap risk here is earnings-trajectory-driven, not ownership-driven.

## 6. Fair-Value Read

Base case is **CNY 23.67/share** (+8.8% vs the CNY 21.75 price), bull **CNY 31.78**, bear-cyclical **CNY 16.79**, and headline bear-structural **CNY 15.90** — a 2.0x bull-to-bear spread. Margin of safety in the base case is a modest **+8.1%**; downside to the headline (structural) bear case is a much larger **26.9%** — that asymmetry (small cushion, large drop) is the single most important number in this dossier, not either metric alone. The peer-relative method (`03`) drives the base point (68% weight) because it is the only method resting on real market prices and its quality-adjusted multiple independently converges with `02`'s own trading history — a rare two-method agreement in this dossier. The single biggest swing factor between bull and bear is **whether Haier's moat erosion (460bp gross-margin decline over five years, ROIC down for two straight readings from its FY2024 subsidy-assisted peak) stabilizes or continues**: stabilization plus a raw-material/China-demand tailwind produces the bull case at a modestly expanded multiple; continued erosion — the path the moat module's own verdict already flags as underway — produces the structural-reset bear case at a de-rated 5.0x multiple and a margin below even the company's own FY2021 trough. `04`'s high DCF headline (+37.2%) is a secondary consideration, not the driver: its own producer flags the WACC behind it as mechanically too low relative to what the market visibly pays for this stock.

