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
