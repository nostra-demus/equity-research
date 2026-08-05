# Scenario & Fair Value — SMPL

Anchors used verbatim from `01_price-and-capital-structure.md`: current price **$11.33** (close, Aug-04-2026, price-state **pool-verified**, fresh — 2 calendar days old, no staleness cap); shares for per-share fair value **89,934,884** (fully diluted); net debt **$324.58M** (strict basis: total debt $448.46M − cash $123.88M). Business type: **Operating** (branded, asset-light consumer-packaged-food company) per the Business-Type Method Map — FCFF DCF, EV/EBITDA, EV/Sales, P/E and FCF yield are all valid; no Financial/REIT override applies. Reporting currency USD throughout.

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | $37.74 (median-reversion point; range $33.08–$51.31) | Low, as a fair-value input | **0%** | **Zero-weighted.** `02`'s own producer states this table is "shown as the mechanical own-history sanity check the module rules require, not as a defensible fair-value input on its own" — the old multiples were earned by a business growing revenue every year for five years with a stable-to-expanding margin; the current business has four straight quarters of revenue decline, ~330bps of margin compression, a $391.9M impairment, and a CEO departure. Self-flagged non-value-producing; carried in the football field only |
| Relative / peers (03) | $13.76 (quality-adjusted NTM EV/EBITDA; dispersion $11.86–$13.76 on the reliable EV/Sales & EV/EBITDA subset) | Medium (only 1 of 10 comps — BellRing — is a true category peer; the 18% quality haircut is a stated judgment call, not mechanical) | **60%** | Carries the majority weight per the Method-Weighting Policy's multiples-first rule for an Operating business with a usable forward metric and a peer multiple set. With `02` excluded (self-flagged, above) and `06` excluded (self-flagged as non-independent, below), `03` is the sole surviving multiples-camp method, so it alone must carry the "majority" role `02`+`03` would normally share |
| Intrinsic DCF (04) | $17.53 (Gordon TV, WACC 7.93%, terminal g 1.0% after the Gate-2 financeable-growth correction; sensitivity grid $14.18–$22.72) | Medium (terminal value is 66.4% of EV — flagged but below the 75% low-confidence line; corroborated by an independent 8.0x exit-multiple cross-check at $16.91) | **40%** | Elevated above the standard ≤⅓ cross-check cap for a stated reason: with `02` zero-weighted, `03` alone cannot fill the full "majority" role the policy expects from the multiples camp, so `04` — the only other value-producing method — is weighted above the default cross-check ceiling rather than left an under-weighted afterthought. Still held below `03` because DCF here is terminal-value-dominated |
| Reverse-DCF (05) | (implied, not a value) — market prices in a −9.08%/yr FCF decline for 6 straight years, or an 11.4% steady-state EBIT margin held indefinitely | n/a | n/a | Cross-check only, per the rules — informs whether the base case (and even the bear cases below) is achievable against the evidence; not a weighted input |
| Sum-of-the-parts (06) | $16.71 (base, BellRing 8.39x NTM EV/EBITDA on NTM Adj. EBITDA $217.78M; range $12.83–$17.51) | Medium-low, as an independent input | **0%** | **Zero-weighted.** SMPL is a single GAAP reportable segment with brand-level revenue but zero brand-level profit disclosure — a genuine SOTP cannot be built. `06`'s own producer states: "treat this as a labelled sanity check that corroborates the peer-relative-valuation method (`03`)... should not both be counted as separate legs of a triangulation." Carried in the football field only |

Weights sum to 100% across the two value-producing methods valid for this business type and not self-flagged as non-independent/illustrative-only (`03` and `04`). `02` and `06` are self-excluded by their own producers, not by this agent's discretion, and remain visible in the §2 football field for transparency. Reverse-DCF (`05`) is a cross-check, not a weighted input.

## 2. Triangulation & Reconciliation

**Method football field** (honest cross-method spread — not narrowed):

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| 02 — Own-history multiples | $37.74 point; $33.08–$51.31 range | Low (as a fair-value input) | 0% | Self-flagged not a defensible fair-value input — reversion to the old multiple set assumes an intact growth/margin profile the evidence says no longer holds |
| 03 — Relative / peers | $13.76 point; $11.86–$13.76 reliable range ($16.67–$18.02 low-confidence extension) | Medium | 60% | Sole surviving multiples-camp method; carries the multiples-first majority |
| 04 — Intrinsic DCF | $17.53 point; $14.18–$22.72 sensitivity range | Medium | 40% | Only other value-producing method; elevated cross-check weight (stated reason above) |
| 05 — Reverse-DCF | Not a value — implied −9.08%/yr FCF CAGR (6 yrs) | n/a | n/a | Cross-check only |
| 06 — SOTP (collapsed) | $16.71 point; $12.83–$17.51 range | Medium-low | 0% | Self-flagged as corroborating `03`, not independent (mechanically the same calculation on the same consolidated inputs) |

**Base-case fair value (single point): $15.27/share** — a 60/40 weighted blend of `03` ($13.76 × 0.60 = $8.26) and `04` ($17.53 × 0.40 = $7.01):
```
base_point = 0.60*13.76 + 0.40*17.53 = 8.256 + 7.012 = 15.27
```
**Reconciliation judgement:** the two value-producing methods disagree by 27.4% ($13.76 vs $17.53 — `(17.53-13.76)/13.76`), below the 40% hard-flag threshold but wide enough to note explicitly. `04`'s higher read is not a "low-DCF drag" case that needs defending down — if anything the DCF sits *above* the peer-relative read, and it is internally corroborated (its implied terminal EV/EBITDA of 8.4x sits close to the peer median of 8.72x, and the Gordon-formula base is cross-checked against an independent 8.0x exit-multiple lens at $16.91, within $0.62 of the DCF's own $17.53). The more material disagreement is between the two *excluded* methods (`02` at $37.74) and the two weighted ones — that gap is the headline finding below, not the 03-vs-04 gap.

**Headline finding — the >40% spread lives entirely in the rejected own-history reversion, not in the weighted methods.** `02`'s mechanical reversion point ($37.74, +233% vs price) sits 174% above `03`'s peer-relative read ($13.76) and 115% above `04`'s DCF ($17.53) — a spread that would be alarming if `02` were a live input. It is not: `02`'s own agent explicitly rejects it as "not underwritten as achievable," citing four straight quarters of revenue decline, ~330bps margin compression, a $391.9M impairment, and a CEO departure — the same evidence this report's own weighted methods (`03`'s quality-discounted peer multiple, `04`'s no-moat WACC/terminal fade) already price in. `06` ($16.71) sits close to `04` (4.9% apart) and is explicitly a peer-relative echo, not independent corroboration. Net: the two methods actually doing triangulation work — peers and intrinsic DCF — agree within 27%, both meaningfully above the current price; the wide "football field" number is a rejected historical ceiling, not a live disagreement.

## 3. Bull / Base / Bear Fair-Value Levels

All cases use **NTM (~FY2027) Adjusted EBITDA** as the forward metric (company non-GAAP, consensus base of $218.42M per `03`) and an **EV/NTM-Adjusted-EBITDA** multiple, bridged with `01`'s canonical net debt ($324.58M, strict basis) and 89,934,884 fully diluted shares. Horizon: 12 months (≈ Aug-2027) for Base/Bull/Bear-operating; 24–36 months for the separately-labeled structural-reset case.

| Case | Fair Value / Share (point) | Forward Metric (NTM Adj. EBITDA) | Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| **Bull** | **$21.98** | $264.5M | 8.70x | 12 mo (~Aug-2027) | Commodity input costs ease vs. the FY2026 guide (+$27.0M EBITDA, within the company's own 3-yr observed gross-margin-swing band [`earnings/07_earnings-sensitivity.md` §2]) + Quest re-accelerates to +8% YoY from the current +1.1% (+$11.4M) + the Sept-2026 price increase lands at the low end of management's elasticity range (0.7x, +$7.7M) — a coherent "turnaround proven" story, not five independent draws. Multiple expands to the plain (un-discounted) peer median (8.72x ≈ 8.70x used), i.e. the 18% quality haircut `03` currently applies closes entirely because the evidence behind it (weak margin stability, no moat, negative growth) is no longer present |
| **Base** | **$15.27** | $218.42M (unchanged, consensus) | 7.77x | 12 mo (~Aug-2027) | The weighted triangulation point above. Multiple is the blend of `03`'s quality-adjusted peer multiple (7.15x) and `04`'s DCF-implied multiple (8.70x) at the same 60/40 weights — i.e. neither the full quality discount persists nor does it fully close; margin stabilizes near the TTM trough, Atkins decline moderates on schedule, no major re-rating catalyst fires |
| **Bear (operating, headline)** | **$8.42** | $177.4M | 6.10x | 12 mo (~Aug-2027) | Commodity costs worsen further vs. guide (−$27.0M) + Quest bar softness deepens as the CEO himself flagged for FY2027, Quest growth falling to −5% YoY (−$10.1M) + Atkins decline deepens to −30% YoY rather than easing (−$3.9M) — a single coherent "turnaround stalls" narrative (weak demand + unrelieved cost pressure), not five independent negative draws. Multiple compresses to SMPL's own 5-year floor (6.11x, `02`'s own-history band — used as 6.10x for consistency with the current spot multiple), reflecting continued erosion with no re-rating catalyst |
| **Bear (structural reset / avoid-ruin floor)** | **$13.09** | — (EV-based DCF reset, see bridge below) | — | 24–36 mo | Permanent, not cyclical, share loss: Atkins/OWYN terminal margin fades to 14.5% (below the TTM trough) and the terminal perpetuity turns **negative** (g = −1.0%), reflecting continued, non-recovering share loss inside SMPL's own dominant Quest segment (`business-model/09_moat.md` §5: consolidated retail takeaway −6.7% in FQ3 FY26 vs. a category growing +10%) |

**Both columns stated for every case; direction check:** Bull raises both the metric (+21.1% vs. base) and the multiple (+12.0% vs. base) — same direction. Bear (operating) lowers both the metric (−18.8% vs. base) and the multiple (−21.5% vs. base) — same direction. Neither case moves the metric while holding or inverting the multiple.

**Bull multiple not reached toward `02`'s own-history band, and why (cited reason, per the hard-rule carve-out):** `02`'s own agent explicitly disclaims its 5-year band (mean 14.81x, median 15.85x EV/EBITDA) as achievable — that band was earned by a five-year uninterrupted grower with a stable-to-expanding margin, a profile the evidence says the current business does not have. Reaching toward it for the bull case would violate the same "warranted-multiple" discipline `02` itself applies. The bull case instead anchors its multiple expansion on an evidenced, currently-observed re-rate (the plain peer median, 8.72x) — a specific, cited alternative, not an invented ceiling.

### Structural-reset bridge (executed)

`04_intrinsic-dcf.md` §5 independently built this as a declining-perpetuity DCF terminal (moat-trajectory trigger — see §3 below); reproduced here to confirm the bridge:

```
$ python3 -c "
pv_explicit = 638.2
pv_tv_runoff = 863.6
ev = pv_explicit + pv_tv_runoff
net_debt = 324.58
equity = ev - net_debt
shares = 89.934884
print('EV =', ev, ' Equity =', equity, ' Per share =', round(equity/shares,2))
"
EV = 1501.8   Equity = 1177.2   Per share = 13.09
```
Method: EV-based reset (impaired terminal EBIT/EBITDA via a declining Gordon perpetuity), bridged with `01`'s canonical net debt ($324.58M) subtracted **before** dividing by shares — matches the requirement that an EV-based reset use the canonical net-debt anchor, not an equity-multiple double-count.

### Which case is the headline Bear (graduated rule)

`business-model/09_moat.md` §5 delivers **both** triggers simultaneously: verdict **"No moat proven"** AND moat trajectory **"eroding"** (gross margin down 4 of 5 years; return on capital drifting from ~7.1% to 6.0% TTM; SMPL losing share within its own dominant Quest segment even as the category grows). A confirmed-eroding trajectory makes the structural reset headline-Bear-eligible, computed as the **worse (lower) of** the structural reset and the 12-month operating deterioration case:
```
worse_of(8.42, 13.09) = 8.42
```
**The operating case ($8.42) is worse than the structural reset ($13.09), so it is the headline Bear** — the deeper near-term deterioration case is not overridden by the milder multi-year reset. The structural reset ($13.09) is carried forward as the labelled avoid-ruin floor for `master-synthesizer` Kill Criteria, not discarded: it is materially above today's price, which is itself notable (see §6) — even SMPL's own permanent-impairment path does not currently imply downside from $11.33.

**No probabilities assigned to any case** — that is the master synthesizer's job.

**Note on "cyclical trough" methodology (why this Bear is not built on a prior-recession trough):** SMPL is not classified Commodity/Cyclical under the Business-Type Method Map, and `business-model/07_business-quality.md` scores its cyclicality factor 65/100 — "packaged food/snacking has historically been a defensive, low-macro-cyclicality category for this company," with revenue growing every fiscal year from FY2017 through FY2025 and the current decline attributed by management to **brand-specific** (Atkins) distribution losses, not a macro downturn. There is no prior recession-driven down-cycle in the company's own history to anchor a trough to (nor a clean predecessor/segment history — Atkins itself pre-dates the 2017 reverse-merger, but no standalone financials for that era exist in the pool). The operating Bear above is therefore built from the earnings-sensitivity module's own "further deterioration from the current documented trough" inputs (`earnings/07_earnings-sensitivity.md` §2), not a cyclical-trough construct — the correct methodology given this business is not evidenced to be macro-cyclical.

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | $11.33 (close, Aug-04-2026, pool-verified) |
| Base-case fair value (point) | $15.27 |
| Bear-case fair value (headline, operating) | $8.42 |
| Bear-case fair value (structural reset / avoid-ruin floor) | $13.09 |
| Implied upside to base case = (base FV − price) / price | **+34.8%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **25.8%** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* (using the headline $8.42 bear) | **25.7%** |

```
margin_of_safety = (15.27-11.33)/15.27 = 0.258 -> 25.8%
implied_upside    = (15.27-11.33)/11.33 = 0.348 -> 34.8%
downside_to_bear   = (11.33-8.42)/11.33 = 0.257 -> 25.7%
```

These are two different numbers, not restatements of one another: the cushion to the base case (25.8%) and the loss to the headline bear case (25.7%) happen to land close in magnitude here, but they measure different things — one is a discount to a fair-value point, the other is a loss from today's price. Neither substitutes for the other.

**A note the reader should not skip:** the structural-reset avoid-ruin floor ($13.09) sits *above* today's price ($11.33, +15.5%) — even SMPL's own labeled permanent-impairment scenario does not currently price in downside from the current level. This is consistent with `05_reverse-dcf.md`'s independent finding that the market is pricing in a decline path (−9.08%/yr FCF for 6 straight years) more severe than even `04`'s own structural-bear input.

## 5. Warranted-Multiple Check

The base-case fair value implies a **7.77x EV/NTM-Adjusted-EBITDA** multiple — below the peer median (8.72x), below BellRing's own 8.39x, and far below SMPL's own 5-year historical mean (14.81x, explicitly rejected as achievable by `02`). Given `business-model/07_business-quality.md`'s 40/100 (Weak) aggregate quality score, a "No moat proven" verdict with an explicitly "eroding" trajectory (`business-model/09_moat.md` §5), and LTM revenue growth of −4.5% against a peer median of +0.3%, a sub-peer-median multiple is what the evidence supports — this is not a case of upside requiring a multiple the business has never earned. The bull case's 8.70x multiple asks for less than that: it requires the currently-observed 18% quality discount to close, not for SMPL to reach a premium above its category peer. No unaligned-controlling-owner value-trap flag applies (`management-governance` confirms RF-OWN-004 / §24 Filter 6 is Not Applicable — SMPL is widely held, largest holder BlackRock at ~14.8% passive [`02_multiples-own-history.md` §5]), so persistent cheapness here is read as a fundamentals-driven discount to be tested against evidence, not an ownership-driven trap.

## 6. Fair-Value Read

Base-case fair value is **$15.27/share** (+34.8% vs. the $11.33 price; 25.8% margin of safety), bracketed by a **bull of $21.98** (a proven-turnaround case, +94.0% vs. price) and a **headline bear of $8.42** (a "turnaround stalls" 12-month deterioration case, −25.7% downside to bear) — with a separately-labeled structural-reset/avoid-ruin floor of **$13.09** that, notably, still sits above today's price. The two value-producing methods — peer-relative ($13.76) and intrinsic DCF ($17.53) — agree within 27%, both above the current price; the much wider apparent dispersion in the football field ($33–$51 from `02`'s own-history reversion) is explicitly disclaimed by its own producer and does not drive the base point. The intrinsic DCF is the marginally larger swing factor in the blend (40% weight, terminal-value-heavy at 66.4% of EV), but it is corroborated by an independent exit-multiple cross-check ($16.91) and by the reverse-DCF finding that today's price already embeds a deeper, more sustained decline (−9.08%/yr FCF for 6 years) than the company's own guidance shape or `04`'s own bear case supports. The single biggest swing factor between bull and bear is **whether the September-2026 price increase lands with volume losses at or below management's own stated elasticity assumption, and whether Quest's growth (63.7% of sales) re-accelerates or the current bar-category softness deepens** — both variables move the operating case by double-digit millions of Adjusted EBITDA in either direction and are unresolved as of this run.
