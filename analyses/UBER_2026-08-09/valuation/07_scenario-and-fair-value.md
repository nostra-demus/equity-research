# Scenario & Fair Value — UBER

Reporting currency: USD. Anchors used verbatim from `01_price-and-capital-structure.md`: current price **$68.18** (2026-08-06, last close, corroborated by two independent Capital IQ exports — **price-state: `pool-verified`**); fully diluted shares **2,056.327M**; net debt **$9,340M** (broad basis, canonical for this module); minority interest **$1,083M**; market cap **$139,261.7M**; EV **$149,684.7M**. Business type: **Operating** (asset-light two-sided marketplace) per the Business-Type Method Map — FCFF DCF + multiples are the correct primary methods; SOTP and reverse-DCF are cross-checks, not primary.

**Price freshness.** Run date 2026-08-09 minus quote as-of date 2026-08-06 = ~1 trading day (only 2026-08-07 intervenes; 08-08/09 is a weekend) — well inside the 5-trading-day threshold. No staleness cap applies and no dual-price presentation is required.

**Material item not modeled below** (carried from `01` §4 and every upstream agent): Uber signed a Business Combination Agreement on 2026-07-16 to acquire Delivery Hero SE (~$14.8bn implied equity value), funded partly by a new €14.2bn bridge credit facility. Neither the acquisition nor the bridge facility is reflected in the Jun-30-2026 balance sheet anchors used throughout this report; if drawn, net debt could rise materially. This is a real forward risk to every fair-value level below, not yet priced into any of them.

**Governance cross-check.** No structurally misaligned controlling owner is flagged for Uber — the management-governance module (`analyses/UBER_2026-08-08/management-governance/99_management-governance-synthesis.md`) found RF-OWN-004 **not** triggered (no controlling shareholder; PIF 3.578% and BlackRock 7.417% are both minority holders). The mandatory §24 Filter 6 value-trap language therefore does not automatically apply, though a serial-acquirer flag (RF-CAP-004, ~12 deals since IPO) is carried forward as context for the Delivery Hero risk above.

---

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | **$87.37** (EV/Sales, 5yr median reversion) | Medium | **29%** | The only clean, undistorted own-history band (5yr EV/Sales) — EV/EBITDA, EV/EBIT, and P/E history are self-flagged by `02` as base-effect-distorted (Uber only turned GAAP-profitable in 2023) and excluded as fair-value inputs. Weighted below full (not top) because `02` itself flags real doubt that full reversion is warranted — decelerating growth, releveraging (0.82x → ~1.3x net debt/EBITDA), and the pending debt-funded Delivery Hero deal are cited, cited reasons the market may not be mispricing. |
| Relative / peers (03) | **$75.75** (NTM EV/EBITDA, quality-and-growth-adjusted 13.2x) | Medium–High | **38%** | Forward-looking, and `03` itself explicitly reconciles a >40% cross-method spread (EV/Sales −37% to P/E +62%) down to a single defensible metric (EV/EBITDA — least distorted by either Uber's own revenue-multiple premium or GAAP EPS mark-to-market noise). Highest weight because it best isolates a warranted multiple net of named peer-comp distortions. |
| Intrinsic DCF (04) | **$79.82** | Low–Medium (self-capped) | **15%** | Cross-check per the Method-Weighting Policy (Operating company with a usable forward multiple ⇒ 02+03 majority, 04+06 combined ≤ ⅓). `04` itself caps confidence: terminal value is 59.5% of EV, and the disclosed working-capital cash source breaks the standard financeable-growth cross-check (modeled reinvestment rate goes negative), which `04` flags rather than papering over. |
| Reverse-DCF (05) | (implied, not a value) — 5.05% implied 10-yr FCFF CAGR, ~1.5 yrs of above-GDP growth, 10.78% implied steady-state EBIT margin | n/a | n/a | Cross-check only. Reads as **conservative**: the price implies less growth (5.05% FCFF CAGR) than `04`'s own base case (6.54%) or Uber's FY2023–2025 revenue CAGR (18.1%), and a steady-state margin (10.78%) Uber's TTM (12.13%) has already exceeded. Informs — does not set — the base case: it argues the base point is not aggressive. |
| Sum-of-the-parts (06) | **$57.34** (base, Lyft-anchored Mobility comp) / $96.71 (high, DiDi-anchored) | Medium | **18%** | Cross-check, capped with `04` per the ≤⅓ policy. Segment data is solid (Uber is not single-segment: Mobility 57% of revenue / 69% of segment EBITDA, below the 85% collapse threshold), but the wide $57–$97 base-to-high spread is driven almost entirely by which Mobility comparable is used (Lyft 7.94x vs. DiDi 16.58x NTM EV/EBITDA) — a comp-selection artifact more than an independent valuation signal — and the $51.8bn capitalized corporate-overhead subtraction is itself a large, single modeling choice. |

Weights sum to 100% across the value-producing methods valid for this Operating business (02, 03, 04, 06). `02`+`03` = **67%** (majority, per the Multiples-first policy); `04`+`06` = **33%** (at the ≈⅓ cap for cross-checks). Reverse-DCF (`05`) is a cross-check on achievability, not a weighted input.

**Multiples-first applied.** Uber has both a usable forward metric (CIQ consensus NTM EBITDA $12,589M / NTM revenue $62,192M) and an own-history multiple band (`02`, clean on EV/Sales) plus a peer multiple set (`03`), so per the Scenario Construction & Method-Weighting Policy §1, `02` and `03` carry the majority weight and `04`/`06` are capped cross-checks. No stated reason elevates SOTP to primary here — Uber is a single integrated technology platform (shared engineering, payments, and a cross-segment loyalty program, Uber One), not a holding company, so the Method Map's "Holding company → SOTP primary" branch does not apply (`06` §4 explicitly declines a conglomerate discount for the same reason).

---

## 2. Triangulation & Reconciliation

### Method football field (full dispersion — not narrowed)

| Method | Value / Range | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| 02 — Own-history multiples | **$87.37** base; usable range $70.71–$90.29 (P/E-recent mean/median to EV/Sales mean); *EV/EBITDA/EV/EBIT/P-FCF reversion figures ($118–$131) shown as illustrative-only in `02`, base-effect distorted, excluded here* | Medium | 29% | See §1 |
| 03 — Relative / peers | **$75.75** base; full cross-method range $42.87 (EV/Sales) – $110.73 (P/E) | Medium–High | 38% | See §1 |
| 04 — Intrinsic DCF | **$79.82** base; sensitivity grid $64.37–$105.99 (±1pp WACC, ±0.5pp terminal g) | Low–Medium | 15% | See §1 |
| 06 — Sum-of-the-parts | **$57.34** base – $96.71 high (comp-selection driven) | Medium | 18% | See §1 |

**Headline finding — cross-method spread exceeds the 40% tolerance.** The four methods' own **base-case points** span $57.34 (SOTP) to $87.37 (own-history EV/Sales reversion) — a **52.4%** spread ((87.37−57.34)/57.34), well above the Reconciliation Gate 6 tolerance. This is not silently averaged away: it is reconciled explicitly below and flagged as the single biggest source of valuation-confidence uncertainty in this report. The two "outlier" methods (02 high, 06 low) both admit their own caveats — `02` doubts full reversion is warranted; `06`'s low end is a single comp-choice (Lyft vs. DiDi for Mobility), not an independent read — which is why neither is weighted above 38%.

### Base-case fair value — single point

**Mechanically-weighted blend: $76.42/share** (0.29 × $87.37 + 0.38 × $75.75 + 0.15 × $79.82 + 0.18 × $57.34 — executed snippet below).

```
$ python3 -c "
vals = {'02': 87.37, '03': 75.75, '04': 79.82, '06': 57.34}
weights = {'02': 0.29, '03': 0.38, '04': 0.15, '06': 0.18}
weighted = sum(vals[k]*weights[k] for k in vals)
print('Weighted base point:', round(weighted,2))
"
Weighted base point: 76.42
```

**Reconciliation judgement.** The lens trusted most for Uber is the peer-relative EV/EBITDA read (`03`), because it is the one method that already isolates a warranted multiple net of comp distortion (excludes both Uber's revenue-multiple premium being double-counted via EV/Sales, and GAAP EPS's mark-to-market noise via P/E). The own-history EV/Sales read (`02`) is trusted next — it is methodologically the cleanest series in the pool, but its full-reversion implied value ($87.37) is discounted in the blend because `02` itself argues the recent de-rating has real fundamental causes (decelerating growth, releveraging, a pending debt-funded acquisition), not pure sentiment. `04` and `06` pull the blend down modestly and are capped at a minority combined weight per policy rather than allowed to silently drag the base point — see below. No lens swap or discretionary override was applied to the mechanical blend: **$76.42** is published as-is.

**Reconciling the SOTP drag (Method-Weighting Policy §1).** `06`'s $57.34 base sits 24.9% below the weighted blend. This is not a warning about Uber's operating economics — it is a comp-selection artifact: swapping only the Mobility comparable (Lyft 7.94x → DiDi 16.58x, both named peers) moves the SOTP output from $57.34 to $96.71, a $39/share, 69% swing from one input. The other driver — capitalizing $4.4bn of annualized corporate overhead at Uber's own blended multiple (11.89x) to subtract $51.8bn, roughly a third of the entire market cap — is a stated modeling convention (there being no better-disclosed segment-level corporate-cost multiple), not new negative information about the business. `06` is therefore weighted at 18%, inside the ≤⅓ combined cross-check cap, rather than being averaged in at full strength or excluded outright.

**Reconciling the DCF gap.** `04`'s $79.82 sits close to (7.6% above) the blend, so it is not a material drag — but `04` self-caps its own confidence at Low–Medium because the disclosed working-capital cash source (self-insurance-reserve buildup) breaks the standard reinvestment-rate/ROIC financeable-growth check, and terminal value is 59.5% of EV. This is a stated method tension, not a silently-accepted number — `04`'s own structural-reset (declining-perpetuity) terminal, $43.38/share, is carried forward separately below as the avoid-ruin floor, not blended into the base.

---

## 3. Bull / Base / Bear Fair-Value Levels

Each case is built as **(forward NTM revenue metric × EV/Sales multiple)**, anchored to `02`'s clean 5-year own-history EV/Sales band (min 1.88x, mean 3.55x, median 3.44x, max 7.09x) — the only own-history band this pool certifies as undistorted. All cases share the canonical `01` bridge: Equity = EV − net debt ($9,340M, broad basis) − minority ($1,083M); Per-share = Equity ÷ 2,056.327M diluted shares. Horizon: **12 months** (default convergence horizon) unless stated otherwise.

| Case | Fair Value / Share (point) | Forward Metric (NTM Revenue) | Multiple (NTM EV/Sales) | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | **$104.17** | $65,302M (consensus $62,192M + 5%, beat scenario) | 3.44x (own-history median — top of usable band) | 12 months | Trip/Gross-Bookings volume growth accelerates toward ~25% YoY (`earnings/07` bull case, +$828M EBIT impact) and the driver/courier payment ratio improves ~2pp (+$1,105M EBIT impact); the market credits the resulting margin/growth combination with a re-rate back to the 5-year EV/Sales median, i.e. the market treats the FY2025–26 de-rating as sentiment-driven rather than structural. |
| Base | **$76.42** (weighted blend; scenario-construction cross-check below reproduces $76.29, a 0.17% match — no override applied) | $62,192M (CIQ NTM consensus) | ≈2.69x (modest re-rate from the current 2.41x NTM multiple, well below the 3.44x/3.55x median/mean) | 12 months | Growth continues to decelerate gradually in line with consensus (no shock either way); the driver-payment ratio holds roughly flat to modestly improving; the pending Delivery Hero deal has not yet closed or moved net debt; the market grants a small amount of credit for Uber's now-structurally-higher margin base without assuming the 2021-era zero-rate multiple regime returns. |
| Bear | **$47.24** | $57,217M (consensus − 8%, ~15% YoY growth per `earnings/07` bear case, vs. ~19.9% ex-UK current) | 1.88x (own-history band minimum) | 12 months | Trip/Gross-Bookings growth decelerates further (`earnings/07` bear case, −$828M EBIT impact) and the driver/courier payment ratio worsens ~2pp (−$1,105M EBIT impact) simultaneously — a realistic, not extreme, combination per `earnings/07`'s own sensitivity ranking; the multiple compresses to the low end of Uber's own 5-year trading range as the market re-prices the slower growth and the just-drawn Delivery Hero-funding leverage. |

**Base-case cross-check (executed):**
```
$ python3 -c "
shares=2056.327; net_debt=9340.0; minority=1083.0
def calc(mult, rev):
    ev=rev*mult; eq=ev-net_debt-minority; return ev, eq, eq/shares
ev,eq,px = calc(2.69, 62192.0)
print('Base scenario check: EV=',round(ev,1),'Eq=',round(eq,1),'px=',round(px,2))
"
Base scenario check: EV= 167296.5 Eq= 156873.5 px= 76.29
```
The metric×multiple scenario construction ($76.29) lands within 0.2% of the mechanically-weighted base ($76.42) — the two approaches converge independently, which is itself evidence the base point is not an artifact of either construction method alone.

**Bull/Bear cross-checks (executed):**
```
$ python3 -c "
shares=2056.327; net_debt=9340.0; minority=1083.0
def calc(mult, rev):
    ev=rev*mult; eq=ev-net_debt-minority; return ev, eq, eq/shares
ev,eq,px = calc(3.44, 62192.0*1.05)
print('Bull: EV=',round(ev,1),'Eq=',round(eq,1),'px=',round(px,2))
ev,eq,px = calc(1.88, 62192.0*0.92)
print('Bear: EV=',round(ev,1),'Eq=',round(eq,1),'px=',round(px,2))
"
Bull: EV= 224637.5 Eq= 214214.5 px= 104.17
Bear: EV= 107567.3 Eq= 97144.3 px= 47.24
```

**Multiple ordering check:** bull 3.44x ≥ base 2.69x ≥ bear 1.88x — expansion in bull, compression in bear, both anchored inside `02`'s own certified band (1.88x–7.09x); no expansion/compression beyond the band is assumed. Metric and multiple move the same direction within each case (both up in bull, both down in bear).

**On the "true through-cycle trough" question.** Uber is classified **Operating**, not Commodity/cyclical, on the Business-Type Method Map, so the Hard Rule requiring a bear case anchored to a cited prior-downturn trough does not mechanically bind here. That said, `business-model/07_business-quality.md` and `09_moat.md` both flag that Uber's FY2025/TTM margins are "near-peak, post-recovery readings" and that the company **has not been tested by a demand shock while already GAAP-profitable** — its only severe demand shock on record, COVID (FY2020, revenue −14.3% per `09_moat.md` §3), landed while the company was still deeply loss-making. The Bear case above (a graduated deceleration to ~15% YoY growth plus multiple compression to the historical floor) is therefore a **realistic, evidence-grounded downturn**, not a worst-case demand contraction — if a COVID-scale demand shock recurred against today's profitable cost base, the resulting hit would plausibly be more severe than this 12-month Bear captures. That tail is what the structural-reset case below (and `04`'s DCF sensitivity grid low corner, $64.37) partially addresses; it is flagged here as an explicit limitation, not smoothed over.

### Structural-reset / avoid-ruin floor — NOT the headline Bear

**Trigger check.** `business-model/07_business-quality.md` scores industry rate-of-change / disruption risk at **32/100** (≤ the ~40 threshold, CLAUDE.md §24 Filter 5) — Uber's own 10-K frames autonomous-vehicle technology as a competitive threat ("may fail to offer autonomous vehicle technologies... before competitors"), with Waymo already running an independent commercialized robotaxi fleet. This trips the declining-perpetuity structural-reset trigger.

**Which case it becomes.** `business-model/09_moat.md` verdicts Uber's moat **Narrow** with trajectory **Widening** (not eroding — CIQ Return on Capital rose from −4.9% FY2022 to +10.6% LTM, EBIT margin from −5.7% to +12.1% over the same run) — this is the "disruption-flag firing on an otherwise intact (here, improving) moat" case, not a confirmed-eroding moat and not a bare unproven-moat verdict. Per the Hard Rule, this routes the structural-reset to the **labelled avoid-ruin floor**, not the headline 12-month Bear — the demotion is unconditional here (the moat is intact/widening, so no `04`-fade pre-condition is owed).

**The computed reset (from `04_intrinsic-dcf.md` §5, method: operating-company EV-based reset — reset EBIT margin × revenue × an impaired terminal multiple, bridged with `01`'s canonical net debt).** EBIT margin faded from Year 5 (11.0%) to Year 10 (7.0%) — versus the base case's 13.2%→12.8% — reflecting an AV-driven competitive/take-rate compression scenario, with terminal g dropped to 1.0% (a structurally impaired, non-recovering franchise):

```
EV (stressed) = Sum PV stressed FCFF + PV(stressed TV) = 58,248.5 + 41,377.6 = 99,626.1
Equity = EV(stressed) - net debt (broad, canonical) - minority = 99,626.1 - 9,340.0 - 1,083.0 = 89,203.1
Per-share (structural-reset) = 89,203.1 / 2,056.327 = 43.38
```
(Independently re-executed and reconciled above — ties exactly to `04`'s published figure.)

**Structural-reset (avoid-ruin floor): $43.38/share, 24–36 month horizon** — carried forward as the labelled avoid-ruin floor for §24 Kill Criteria in the master synthesis, distinct from the 12-month cyclical/deceleration Bear ($47.24) above. It is the WORSE of the two down-legs by a modest margin ($43.38 < $47.24), consistent with a genuine AV-disruption scenario being a deeper, longer-horizon impairment than a one-year growth/margin miss.

---

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | $68.18 (2026-08-06, pool-verified) |
| Base-case fair value (point) | $76.42 |
| Bear-case fair value (12-month) | $47.24 |
| Implied upside to base case = (base FV − price) / price | **+12.09%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **10.78%** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **30.71%** |

```
$ python3 -c "
price=68.18; base_fv=76.42; bear_fv=47.24
print('Implied upside %:', round((base_fv-price)/price*100,2))
print('Margin of safety %:', round((base_fv-price)/base_fv*100,2))
print('Downside to bear %:', round((price-bear_fv)/price*100,2))
"
Implied upside %: 12.09
Margin of safety %: 10.78
Downside to bear %: 30.71
```

Both metrics are computed off the pool-verified $68.18 anchor (no staleness cap applies). Margin of safety (10.78%) is a modest cushion, not a deep discount — the base case is only modestly above price, so this is closer to "fairly valued/modestly undervalued" territory than a clear mispricing. Downside to bear (30.71%) is materially larger than the upside to base, and the structural-reset avoid-ruin floor ($43.38) implies an even larger 36.4% downside from price, though on a longer (24–36 month) horizon and a lower-probability trigger — that comparison belongs to the master synthesizer, not this module.

---

## 5. Warranted-Multiple Check

The base case implies an NTM EV/Sales multiple of ≈2.69x, which cross-checks to an implied NTM EV/EBITDA of ≈13.3x ($167,296.5M implied EV ÷ $12,589M NTM consensus EBITDA) — this is almost exactly `03`'s independently-derived, peer-anchored quality-and-growth-adjusted multiple of **13.2x**, arrived at from a completely different starting point (peer median 14.42x minus a growth-gap discount). Two independent lenses converging on the same warranted multiple is a genuine cross-check, not a coincidence engineered into the model. That multiple sits well below Uber's own 5-year EV/Sales mean/median (3.44x–3.55x) and reflects real, cited reasons the business does not yet warrant a full reversion: decelerating revenue growth (18.3% FY2025 → 12.2% Q2 FY26 YoY), a moat rated Narrow (not Strong) with only 1–2 years of ROIC above cost of capital on a 5-year through-cycle average still below WACC, and an unresolved AV-disruption risk scored 32/100 on rate-of-change. There is no evidence here that the base case requires a multiple the business has never sustained — the risk instead runs the other way: if Uber's margin and ROIC trajectory keep improving as they have for the last three years, the base case may be understating the warranted multiple, not overstating it. No value-trap flag is warranted (no misaligned controlling owner per the governance module).

---

## 6. Fair-Value Read

UBER's fair-value levels are **Bull $104.17 / Base $76.42 / Bear $47.24** (12-month horizon), with a separately labelled 24–36 month structural-reset avoid-ruin floor of **$43.38** carried to the Kill Criteria rather than headlined as the Bear, because the AV-disruption risk that triggered it is firing on a moat that is Narrow but demonstrably **widening**, not eroding. Against the current $68.18 price, that gives a modest 10.78% margin of safety to the base case and a much larger 30.71% downside to the 12-month bear — the risk/reward is asymmetric toward the downside on a one-year view, a fact this module states but does not weight or size. The peer-relative EV/EBITDA read (`03`, 38% weight) drives the answer, converging almost exactly with the base-case scenario construction's independently-derived warranted multiple (13.2x–13.3x) — the single strongest piece of triangulation in this report. The biggest swing factor between bull and bear is not any single company-specific catalyst but the **combination of Trip/Gross-Bookings growth and the driver/courier payment ratio moving together** (`earnings/07`'s #1 and #2-ranked sensitivity variables, worth a combined ~$1.9bn of EBIT swing), compounded by how much of a re-rate or de-rate the market applies to whichever direction those two variables move — the same growth-deceleration-plus-releveraging story that `02` cites as the reason the stock has already de-rated from its 5-year EV/Sales average.
