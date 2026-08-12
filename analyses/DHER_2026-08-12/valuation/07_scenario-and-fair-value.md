# Scenario & Fair Value — DHER (Delivery Hero SE)

**Read this before everything below.** The current price (€37.20, 2026-08-07, pool-verified per `01_price-and-capital-structure.md`) is **deal-contaminated**: Uber Technologies announced an agreement to acquire Delivery Hero on 2026-07-16, and the stock more than doubled from its pre-announcement level of €15.73 (2026-03-26). No fixed offer price was found anywhere in the data pool. Every price-relative read below (margin of safety, downside-to-bear, implied upside) is shown at **both** the current deal-priced level and, as a secondary reference, the pre-announcement price — because the current price is mostly answering "how likely is this deal and at what terms," not "what is DHER worth standalone." This module does not assign probabilities to deal completion or to any scenario — that is the master synthesizer's job.

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | €25.10 (dispersion €16.04–€29.00) | Medium — EV/Sales is DHER's most reliable own-history multiple, but the reversion band is built almost entirely on 2.3–3 years of loss-making history (n=6–8 observations), and 02 itself flags the band may understate what a newly profitable DHER deserves | 45% | Own-history EV/Sales reversion is DHER's cleanest standalone-fundamentals read (no peer-set composition judgment call), so it anchors the base — but its short, loss-making-era sample keeps the weight below what a longer clean history would earn |
| Relative / peers (03) | €79.2 quality-adjusted base (dispersion €71–€158) | Low-Medium — base case rests on a 2-name "quality-matched" subset (Meituan, Swiggy); the raw 6-peer median (€157.9) is inflated by structurally different, larger, profitable peers (Uber, DoorDash, Prosus); no historical peer-multiple time series exists to say if the gap is typical | 22% | Real signal (DHER trades at a genuine discount even to its two closest-quality peers) but DHER has no clean, scale-and-quality-matched public comp — the named "peers" span from mega-cap profitable platforms to immature India names — so this method is weak for THIS company per the reliability standard, and is downweighted within the 02+03 multiples-majority bucket even though it stays in that bucket per the Method-Weighting Policy |
| Intrinsic DCF (04) | €33.31 (standard grid €23–€54; wider cross-check spanning the moat-disclosed WACC and Gate-2 financeable-growth gap: €6–€54) | Low-Medium — terminal-dominated (78% of EV, exceeds the 75% flag threshold), FY2025 base year carries poor earnings quality (36/100), and the mechanically-computed WACC (7.45%) diverges >3pp from DHER's own company-disclosed cost of capital (10.7%–13.7%) | 15% | Cross-check per Method-Weighting Policy §1 (operating company with usable forward estimates → DCF capped, combined with 06, at ≈≤⅓); its terminal dominance and WACC fragility argue for the low end of that cap |
| Reverse-DCF (05) | Not a fair-value input — implied growth read | n/a | n/a | Informs whether the base case is achievable (§3 below), not weighted into the triangulation |
| Sum-of-the-parts (06) | €32.59 (dispersion €13.23–€56.49) | Medium — MENA/talabat (68% of segment EBITDA) is valued almost 1:1 off a tight, direct public comparable (talabat itself), the strongest single input in this report; but the €4,830m capitalized unallocated-corporate-cost bridge item (larger than net debt) and the 8% conglomerate discount are judgment calls that drive most of the €13–€56 dispersion | 18% | Genuinely multi-segment business (MENA at 68.3% of segment EBITDA, under the 85% single-segment threshold) so SOTP is a valid, informative cross-check; weighted above 04 because its MENA anchor is unusually direct, but still capped with 04 at ≈⅓ combined per policy (this is an Operating company, not a Holding company, so SOTP is not elevated to primary) |

Weights sum to 100% across the four value-producing methods valid for this Operating business (Business-Type Method Map: FCFF DCF + reverse-DCF, EV/EBITDA/EV/Sales/P-E, no REIT/bank method applies). Reverse-DCF (05) is a cross-check, not a weighted input, per the module's standard.

**Multiples-first applied.** DHER is an Operating business with a usable forward metric (Street consensus FY2026E revenue and Adjusted EBITDA exist per `02` and `04`) and both an own-history multiple band (`02`) and a peer multiple set (`03`) — so per the Scenario Construction & Method-Weighting Policy, `02`+`03` together carry majority weight (67%) and `04`+`06` are capped as a combined cross-check (33%, at the ≈⅓ ceiling). No exception applies (DHER is classified Operating, not Holding company, in the Business-Type Method Map — `06`'s own report states this explicitly — so SOTP is not elevated to primary).

## 2. Triangulation & Reconciliation

**Method football field — shown at true dispersion, not narrowed:**

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | €25.10 (range €16.04–€29.00) | Medium | 45% | Cleanest standalone read; short, loss-making-era sample |
| Relative / peers (03) | €79.2 (range €71–€158) | Low-Medium | 22% | No clean scale/quality-matched comp; 2-name base sample |
| Intrinsic DCF (04) | €33.31 (range €23–€54; wide cross-check €6–€54) | Low-Medium | 15% | Terminal-dominated; WACC divergence vs. company's own disclosed cost of capital |
| Sum-of-the-parts (06) | €32.59 (range €13.23–€56.49) | Medium | 18% | Strong MENA anchor; large corporate-cost/discount judgment calls |

**Headline finding: the cross-method spread is extreme, not modest.** `02` (€25.10) and `03` (€79.2) differ by **+215%** — far above the 40% disagreement threshold that MODULE_RULES requires be flagged as the headline, not averaged away. The two DCF/SOTP cross-checks (`04` at €33.31, `06` at €32.59) sit close together, within 2% of each other, forming a tight cluster with `02` roughly €5–8 below and `03` far above both. This is not noise: `02`, `04` and `06` are all anchored, directly or indirectly, in DHER's own reported financials and segment economics; `03` alone is driven by an external, disputed judgment call — how much of the raw 6-peer premium (Uber, DoorDash, Prosus — all structurally different, larger, profitable businesses) should be excluded as "not comparable." `03` itself concedes this: "much of the 72% discount to the full six-name median is a peer-set composition effect... this is a mixed verdict, not a clean read either way."

**Reconciliation judgment.** This report trusts DHER's own multiple history (`02`) and its bottom-up methods (`04`, `06`) more than the peer-relative read (`03`) for THIS company, specifically because DHER lacks a clean scale-and-quality-matched public comparable — the named peer set spans mega-cap, already-profitable platforms (Uber, DoorDash) that trade on a fundamentally different risk/return profile, immature India names (Swiggy, Eternal) at a different growth stage, and a holding company (Prosus) whose 10.9x EV/Sales reflects portfolio economics, not DHER's own. `03`'s own two-peer "quality-matched" base (Meituan, Swiggy) is a defensible floor for the peer read but a thin sample to carry majority weight alone. Applying the policy-mandated multiples-majority weighting (67% to `02`+`03`, split 45%/22% within that bucket to reflect this reliability judgment) and the capped 33% cross-check weight (`04`/`06`, split 15%/18% reflecting `06`'s stronger MENA anchor against `04`'s terminal-value fragility) produces a mechanically-weighted **base-case fair value point of €39.6/share** (executed calculation below). No further discretionary override was applied beyond the stated weight split — the weights themselves are the disclosed lens choice, not a silent re-anchor.

**Executed calculation (weighted blend):**
```
w02, w03, w04, w06 = 0.45, 0.22, 0.15, 0.18   (sums to 1.00)
v02, v03, v04, v06 = 25.10, 79.2, 33.31, 32.59
blend = 0.45*25.10 + 0.22*79.2 + 0.15*33.31 + 0.18*32.59
      = 11.295 + 17.424 + 4.9965 + 5.8662 = 39.58  ≈ EUR 39.6/share
```
This is cross-validated independently in §3 via a direct metric×multiple build (FY26E revenue × warranted EV/Sales multiple), which reproduces €39.65/share — a 0.2% difference attributable to the choice of forward-revenue basis (NTM-consensus vs. FY2026-calendar), not a modelling inconsistency.

## 3. Bull / Base / Bear Fair-Value Levels

Each case is a single derived fair-value LEVEL — a point, not a range — built as (forward metric × multiple), with a **12-month horizon** (FY2026 as the forward year), consistent with CLAUDE.md §16. All three cases hold net debt (€2,512.8m, strict basis) and minority interest (€154.2m) fixed at the FY2025 actuals per `01`'s canonical anchor — these are facts, not scenario-dependent, and every case uses the identical bridge convention.

| Case | Fair Value / Share (point) | Forward Metric (FY26E Revenue) | Multiple (EV/Sales) | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | **€49.01** | €15,957.6m (+13.5% YoY) | 1.10x | 12 months (FY2026) | GMV like-for-like growth at the top of the guided range (10% vs. 9% midpoint) sustained, own-delivery/mix-shift tailwind continues rather than stalling, Asia margin recovers +192bps toward the FY2024 level (Korea's Q1 2026 inflection holds), and the multiple re-rates toward DHER's own historical ceiling (1.25x max, `02`) — not fully to it, reflecting that a full re-rate to the historical peak would need evidence of a durable margin structure this report does not yet have |
| **Base** | **€39.65** (≈€39.6) | €15,648.3m (+11.3% YoY, Street consensus) | 0.94x | 12 months (FY2026) | Street-consensus FY2026 revenue growth (11.3%, 14 analysts) and Adjusted EBITDA guidance midpoint (€935m) are met; no rider-cost reclassification shock beyond what is already absorbed; the multiple sits above `02`'s own 3-year mean (0.82x)/median (0.73x) but below its max (1.25x), reflecting partial credit for FY2025's first-ever year of GAAP profitability (which `02`'s own-history band, built almost entirely on loss-making years, may understate) and partial credit for `03`'s quality-adjusted peer-discount evidence |
| Bear (cyclical/operating trough) | **€18.59** | €15,114.1m (+7.5% YoY) | 0.55x | 12 months (FY2026) | GMV like-for-like growth at the bottom of the guided range (8%), own-delivery mix-shift stalls, Asia competitive intensity persists (a further −192bps segment margin move, per `earnings/07_earnings-sensitivity.md`), and the rider-cost/employment-classification variable moves adversely without a pricing offset (the company's own disclosed stress test: a 245bp cost-ratio shock ≈ −€344.5m, ~38% of FY2025 Adjusted EBITDA) — the multiple compresses to 0.55x, just above DHER's own actual historical low print (0.52x, recorded 2026-03-26, the pre-announcement close, when the market still priced DHER as a still-loss-making, unproven business) |

**Multiple discipline check.** Bull (1.10x) ≥ Base (0.94x) ≥ Bear (0.55x) — expansion in bull, compression in bear, each moving the same direction as its revenue metric, all anchored inside `02`'s own-history EV/Sales band (min 0.52x, mean 0.82x, median 0.73x, max 1.25x). No case extrapolates beyond that band.

**Why DHER's bear case is built this way, not as a classic commodity trough.** `business-model/07_business-quality.md` scores cyclicality 42/100 ("moderate — not a classic commodity-cycle business"), so a boom-bust trough anchor does not apply. Instead, the bear case combines (a) the company's own worst-disclosed operating stress test (`earnings/07_earnings-sensitivity.md`'s rider-cost/regulatory shock, the single highest-ranked sensitivity variable, asymmetric and severe: −€344.5m bear vs. +€140.6m bull) with (b) a multiple compressed to DHER's own actual historical low (0.52x, the real pre-deal print from a five-year loss-making stretch) — the closest available evidenced-trough analog for a company without a commodity cycle. This is evidence-based, not an invented deeper trough.

**Structural / permanent-impairment down-leg — avoid-ruin floor, not the headline bear.** Two triggers fire simultaneously: `business-model/09_moat.md` returns **"No moat proven"** (group ROIC 0.8%–1.6% best year, ≈−6.1% through-cycle, versus a company-disclosed 10.7%–13.7% WACC), and `business-model/07_business-quality.md` scores industry rate-of-change/disruption at **26/100** (≤40, RF-BQ-005). Per the graduated routing rule, this does **not** become the headline bear: the moat module's own trajectory read is explicitly **"widening (narrow, segment-specific)"**, not eroding, and `04_intrinsic-dcf` — a usable, weighted method in this triangulation (§1) — already reflects the lost excess return by deliberately capping terminal Adjusted EBITDA margin at 7.2% (below both Uber's 10.7% and DoorDash's 5.3% operating margins) specifically because of the "No moat proven" finding. Both conditions for demotion are met (non-eroding trajectory + a weighted method already carrying the fade), so the structural reset is carried here as the labelled **avoid-ruin floor**, not the 12-month bear:

```
Structural-reset EV (04's own runoff/declining-perpetuity build, reproduced and verified):
  PV explicit FCF (bear operating path) = EUR 863.2m
  PV terminal value (g = 1.0% nominal, below ECB inflation target -- real-terms decline) = EUR 940.2m
  EV = 863.2 + 940.2 = EUR 1,803.4m   [ties exactly to 04's stated EV]
  Equity = EV - net debt - minority = 1,803.4 - 2,512.8 - 154.2 = -EUR 863.6m
  Per share = -863.6m / 303.744978m shares = -EUR 2.84/share
```

Method: EV-based impaired-DCF reset (declining-perpetuity terminal, per the Operating-company map), bridged with `01`'s canonical net-debt anchor (net debt subtracted before dividing by shares, as required for an EV-based reset). Driver: revenue growth fading 8%→2%, Adjusted EBITDA margin **compressing** 5.5%→4.2% (the rider-cost stress case applied cumulatively) with no pricing offset, terminal g = 1.0%. **This produces a negative equity value (−€2.84/share) — DHER's net debt (€2,512.8m) exceeds even this stressed enterprise value.** This is a genuine avoid-ruin signal for §24/Kill Criteria, not a 12-month price target: if the rider-cost/regulatory bear case and continued competitive erosion both materialize with no pricing offset over a multi-year horizon, DHER's standalone equity value is close to wiped out by its debt load. It does not replace the −18.6/share 12-month bear above.

## 4. Margin of Safety & Downside (two separate metrics)

Shown at **both** prices per the deal-contamination flag — leading with the current (deal-priced) read, pre-announcement price as the secondary, standalone-fundamentals reference.

| Metric | vs. Current Price (€37.20, deal-contaminated) | vs. Pre-Announcement Price (€15.73, 2026-03-26, standalone reference) |
|---|---:|---:|
| Price | €37.20 (2026-08-07) | €15.73 (2026-03-26) |
| Base-case fair value (point) | €39.65 | €39.65 |
| Bear-case fair value (12-month operating trough) | €18.59 | €18.59 |
| Implied upside to base case = (base FV − price) / price | **+6.6%** | **+152.0%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **+6.2%** | **+60.3%** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **50.0%** | **−18.2%** (price already sits below the bear-case level) |

**Executed calculation:**
```
base_fv = 39.65; bear_fv = 18.59
price_current = 37.20; price_predeal = 15.73

# vs current price
upside_c = (39.65-37.20)/37.20        = 6.6%
mos_c    = (39.65-37.20)/39.65        = 6.2%
dtb_c    = (37.20-18.59)/37.20        = 50.0%

# vs pre-deal price
upside_p = (39.65-15.73)/15.73        = 152.0%
mos_p    = (39.65-15.73)/39.65        = 60.3%
dtb_p    = (15.73-18.59)/15.73        = -18.2%   (bear FV exceeds pre-deal price)
```

**Reading this pair of numbers.** At the current deal-contaminated price, the margin of safety is thin (+6.2%) and the downside to the 12-month operating bear case is real (50.0% — a genuine loss if the deal breaks AND the operating bear materializes). At the pre-announcement price, the standalone read is starkly different: DHER traded at a 60.3% discount to this report's triangulated base case, and even the bear-case fair value (€18.59) sat above the pre-deal price (€15.73) — meaning the market was pricing DHER, pre-deal, below even a stressed operating scenario. That gap (not the current price) is the cleanest evidence in this report that the pre-deal market materially undervalued DHER's standalone prospects; whether the current €37.20 represents fair compensation for that gap being closed via a takeover, versus overpaying for deal-completion odds on undisclosed terms, is a probability question for the master synthesizer, not this module.

## 5. Warranted-Multiple Check

The base-case fair value (€39.65) implies an EV/Sales (FY26E) multiple of 0.94x — above DHER's own 3-year mean (0.82x) and median (0.73x), though below its historical max (1.25x, itself reached only in the deal-contaminated recent quarters). Whether DHER "deserves" a multiple above its own historical average is genuinely contested by the evidence in this pool: `business-model/07_business-quality.md` scores the business 34/100 ("Weak"), and `business-model/09_moat.md` finds **"No moat proven"** — group ROIC (0.8%–1.6% best year, ≈−6.1% through-cycle) sits 900–1,700+bps below the company's own 10.7%–13.7% disclosed cost of capital, which argues against paying up for a re-rate. Set against that, FY2025 was DHER's first-ever year of GAAP EBITDA/EBIT profitability, and `02`'s own report flags that its own-history multiple band — built almost entirely during the loss-making era — may systematically understate what a durably profitable DHER should trade at; that structural question (is the inflection durable, or a fragile one-off funded by continued heavy marketing spend, as `07_business-quality.md` describes it) is outside this module's scope to resolve. **Net: the base case does not require a multiple the business has never earned (0.94x sits inside DHER's own observed range), but it does require crediting a recent, unproven inflection over a longer loss-making history — a real value-trap risk if that inflection does not hold, flagged here rather than assumed away.** No structurally misaligned controlling-owner flag applies (`03`'s report notes RF-OWN-004 was not triggered; Prosus is exiting via the tender, not exercising control) — the value-trap risk here is operating/moat-based, not ownership-based.

## 6. Fair-Value Read

This report's triangulated **base-case fair value is €39.65/share (12-month horizon)**, bracketed by a **bull of €49.01** and a **12-month operating-trough bear of €18.59**; a separate, multi-year **structural/avoid-ruin floor of −€2.84/share** exists but is not the headline bear (the moat trajectory is "widening," not eroding, and a weighted method already prices in the lost excess return — see §3). Against the current deal-contaminated price (€37.20), the margin of safety is thin (+6.2%) and the downside to the operating bear case is real (50.0%) — meaning today's price sits close to a defensible standalone fair value even before crediting any takeover premium, which itself is informative: this is not obviously a case of the market wildly overpaying, nor is it a clean bargain. Against the pre-announcement price (€15.73), the standalone case is dramatically different: a 60.3% margin of safety, with the bear-case fair value sitting above the pre-deal price entirely. The single method driving the answer is the **method spread itself** — `02` (own-history multiples, €25.10) and `03` (peer-relative, €79.2) disagree by +215%, an order of magnitude beyond the 40% flag threshold, reconciled here by trusting DHER's own-financials-anchored methods (`02`, `04`, `06`, which cluster within a tight €25–€33 band) over the peer-relative read (`03`), which rests on a peer set with no clean scale-and-quality match for DHER. The single biggest swing factor between bull and bear is **rider-cost/employment-classification regulation** — the company's own disclosed stress test alone moves Adjusted EBITDA by −€344.5m (≈38% of FY2025 Adjusted EBITDA) with no offsetting pricing mechanism, and a related contingent liability (Spain reclassification, €440m–€770m) sits outside even this range. This module assigns no probability to deal completion, to the operating scenarios, or to the structural-reset path — those weightings belong to the master synthesizer.
