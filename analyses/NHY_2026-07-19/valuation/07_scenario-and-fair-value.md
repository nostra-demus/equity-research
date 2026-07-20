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
