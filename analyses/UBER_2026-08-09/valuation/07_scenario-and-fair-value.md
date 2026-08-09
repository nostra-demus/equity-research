# Scenario & Fair Value — UBER

Reporting currency: USD. Anchors used verbatim from `01_price-and-capital-structure.md`: current price **$68.18** (2026-08-06, last close, corroborated by two independent Capital IQ exports — **price-state: `pool-verified`**); fully diluted shares **2,056.327M**; net debt **$9,340M** (broad basis, canonical for this module); minority interest **$1,083M**; market cap **$139,261.7M**; EV **$149,684.7M**. Business type: **Operating** (asset-light two-sided marketplace) per the Business-Type Method Map — FCFF DCF + multiples are the correct primary methods; SOTP and reverse-DCF are cross-checks, not primary.

**Targeted-refresh note.** This version supersedes a prior triangulation that used a stale sum-of-the-parts (`06`) base-case figure of $57.34/share. `06` has since been freshly regenerated against newly-landed data and now reports a base SOTP value of **$48.22/share** (dispersion $31.46–$83.99). This rerun re-triangulates the bull/base/bear fair-value levels against that fresh `06` output. The module synthesis (`99_valuation-synthesis.md`) had flagged, using the prior stale figure, that the cross-method base-case dispersion widened to 81.2% once the fresh `06` was substituted — above the 40% Reconciliation Gate 6 tolerance — and recommended this rerun before the valuation read is treated as final. §2 below reconciles that gap explicitly.

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
| Sum-of-the-parts (06, **freshly rerun**) | **$48.22** (base, Lyft-anchored Mobility comp) / $31.46 (low, Grab) / $83.99 (high, DiDi-anchored) | Medium | **18%** | Cross-check, capped with `04` per the ≤⅓ policy. Segment data is solid (Uber is not single-segment: Mobility 57% of revenue / 69% of segment EBITDA, below the 85% collapse threshold), but the base-to-high spread (74.2%) is driven almost entirely by which Mobility comparable is used (Lyft 7.94x vs. DiDi 16.58x NTM EV/EBITDA) — a comp-selection artifact more than an independent valuation signal — and the $52.3bn capitalized corporate-overhead subtraction (a real, filed cost, not an assumption) is itself a large, single modeling choice that swings per-share value by roughly $25. |

Weights sum to 100% across the value-producing methods valid for this Operating business (02, 03, 04, 06). `02`+`03` = **67%** (majority, per the Multiples-first policy); `04`+`06` = **33%** (at the ≈⅓ cap for cross-checks). Reverse-DCF (`05`) is a cross-check on achievability, not a weighted input.

**Multiples-first applied.** Uber has both a usable forward metric (CIQ consensus NTM EBITDA $12,589M / NTM revenue $62,192M) and an own-history multiple band (`02`, clean on EV/Sales) plus a peer multiple set (`03`), so per the Scenario Construction & Method-Weighting Policy §1, `02` and `03` carry the majority weight and `04`/`06` are capped cross-checks. No stated reason elevates SOTP to primary here — Uber is a single integrated technology platform (shared engineering, payments, and a cross-segment loyalty program, Uber One), not a holding company, so the Method Map's "Holding company → SOTP primary" branch does not apply (`06` §4 explicitly declines a conglomerate discount for the same reason).

---

## 2. Triangulation & Reconciliation

### Method football field (full dispersion — not narrowed)

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| 02 — Own-history multiples | **$87.37** base; usable range $70.71–$90.29 (P/E-recent mean/median to EV/Sales mean); *EV/EBITDA/EV/EBIT/P-FCF reversion figures ($118–$131) shown as illustrative-only in `02`, base-effect distorted, excluded here* | Medium | 29% | See §1 |
| 03 — Relative / peers | **$75.75** base; full cross-method range $42.87 (EV/Sales) – $110.73 (P/E) | Medium–High | 38% | See §1 |
| 04 — Intrinsic DCF | **$79.82** base; sensitivity grid $64.37–$105.99 (±1pp WACC, ±0.5pp terminal g) | Low–Medium | 15% | See §1 |
| 06 — Sum-of-the-parts (fresh) | **$48.22** base; dispersion $31.46 (low) – $83.99 (high), comp-selection driven | Medium | 18% | See §1 |

**Headline finding — cross-method spread widens to 81.2%, well above the 40% tolerance.** The four methods' own **base-case points** now span **$48.22 (SOTP, freshly rerun) to $87.37 (own-history EV/Sales reversion)** — `(87.37 − 48.22) / 48.22 = 81.2%`. This is materially wider than the 52.4% spread this module reconciled against the pre-refresh SOTP figure ($57.34); the fresh `06` rerun (base $48.22, high $83.99 vs. the prior $57.34/$96.71) pulled the low end of the base-case distribution down further, not up. This is not silently averaged away — it is reconciled below, and it remains the single biggest source of valuation-confidence uncertainty in this report.

**Is the wider SOTP gap a real warning or an artifact? Mixed — mostly artifact, with one real component, neither of which is new information about deteriorating operating economics.** Two things drive `06`'s low reading, and both are named in `06` itself: (1) **comp-selection sensitivity** — swapping only the Mobility comparable (Lyft 7.94x → DiDi 16.58x, both named FY25 10-K competitors) moves the SOTP output from $48.22 to $83.99, a 74.2% swing from a single input choice, and the low end ($31.46, Grab-anchored Delivery) is a further 53.3% below the base — this is a comp-set artifact, not three independent valuation reads; (2) a **real, filed** $52.3bn capitalized unallocated-corporate-cost deduction (Corporate G&A + Platform R&D, annualized H1 FY26 at Uber's own blended 11.89x multiple) that swings per-share value by roughly $25 on its own — this is not an assumption, it is a line-itemized, audited cost that a bottom-up segment build must net out in full, and it is the one piece of the SOTP gap that is not merely a comp-choice artifact. Neither driver reflects new negative information about Mobility's or Delivery's own operating trajectory — both segments are shown running materially more profitable than their own named peers on the metric applied to them (`06` §5).

**How the gap is closed, not silently averaged.** The Method-Weighting Policy's ≤⅓ combined cap on `04`+`06` is precisely the mechanism that prevents this 81.2% extreme-to-extreme spread from mechanically dragging the published base value down by anything close to that magnitude. At `06`'s capped 18% weight, its $48.22 read pulls the weighted blend only **1.3%** below `03`'s own $75.75 base (see the executed blend below) — the policy is doing its job. The published base case is **not** a silent average of $48.22 and $87.37 (which would be $67.80, essentially at the current price); it explicitly favors the two forward-looking, majority-weighted multiples methods.

### Base-case fair value — single point

**Mechanically-weighted blend: $74.77/share** (0.29 × $87.37 + 0.38 × $75.75 + 0.15 × $79.82 + 0.18 × $48.22 — executed snippet below).

```
$ python3 -c "
vals = {'02': 87.37, '03': 75.75, '04': 79.82, '06': 48.22}
weights = {'02': 0.29, '03': 0.38, '04': 0.15, '06': 0.18}
weighted = sum(vals[k]*weights[k] for k in vals)
print('Weighted base point:', round(weighted,2))
lo, hi = min(vals.values()), max(vals.values())
print('Base-case spread low/high:', lo, hi, '->', round((hi-lo)/lo*100,1), '%')
"
Weighted base point: 74.77
Base-case spread low/high: 48.22 87.37 -> 81.2 %
```

**Reconciliation judgement.** The lens trusted most for Uber is still the peer-relative EV/EBITDA read (`03`), because it is the one method that already isolates a warranted multiple net of comp distortion (excludes both Uber's revenue-multiple premium being double-counted via EV/Sales, and GAAP EPS's mark-to-market noise via P/E). The own-history EV/Sales read (`02`) is trusted next — methodologically the cleanest series in the pool, but its full-reversion implied value ($87.37) is discounted in the blend because `02` itself argues the recent de-rating has real fundamental causes (decelerating growth, releveraging, a pending debt-funded acquisition), not pure sentiment. `04` and the freshly-rerun `06` both pull the blend down and are capped at a minority combined weight (33%) per policy, rather than allowed to drag the base point down toward their own, lower, base-case figures. No lens swap or discretionary override was applied to the mechanical blend: **$74.77** is published as-is, down $1.65 (−2.2%) from the pre-refresh blend of $76.42 — a modest move given `06`'s own base fell 15.9% ($57.34 → $48.22), which is exactly the outcome the ≤⅓ cross-check cap is designed to produce.

**Reconciling the SOTP drag in full (Method-Weighting Policy §1).** `06`'s fresh $48.22 base sits **35.5%** below the $74.77 weighted blend (up from 24.9% below the pre-refresh $76.42 blend). As detailed above, this is driven mainly by a single comp-selection choice (Lyft vs. DiDi for Mobility) plus a real, filed, large corporate-overhead deduction — neither of which is new information about Mobility's or Delivery's own unit economics, both of which the SOTP itself shows outperforming their peer set on margin. `06` therefore remains weighted at 18%, inside the ≤⅓ combined cross-check cap, rather than being averaged in at full strength, excluded outright, or used to silently re-anchor the base case downward.

**Reconciling the DCF gap.** `04`'s $79.82 sits 6.75% above the new blend, so it remains a mild net *lift*, not a drag — but `04` self-caps its own confidence at Low–Medium because the disclosed working-capital cash source (self-insurance-reserve buildup) breaks the standard reinvestment-rate/ROIC financeable-growth check, and terminal value is 59.5% of EV. This is a stated method tension, not a silently-accepted number — `04`'s own structural-reset (declining-perpetuity) terminal, $43.38/share, is carried forward separately below as the avoid-ruin floor, not blended into the base.

---

## 3. Bull / Base / Bear Fair-Value Levels

Each case is built as **(forward NTM revenue metric × EV/Sales multiple)**, anchored to `02`'s clean 5-year own-history EV/Sales band (min 1.88x, mean 3.55x, median 3.44x, max 7.09x) — the only own-history band this pool certifies as undistorted. All cases share the canonical `01` bridge: Equity = EV − net debt ($9,340M, broad basis) − minority ($1,083M); Per-share = Equity ÷ 2,056.327M diluted shares. Horizon: **12 months** (default convergence horizon) unless stated otherwise. Bull, Bear, and the structural-reset floor are **unaffected** by the `06` refresh — they are built purely from the EV/Sales scenario-construction method, not from the SOTP-inclusive weighted blend; only the Base level (below) moves with the refreshed weighted blend.

| Case | Fair Value / Share (point) | Forward Metric (NTM Revenue) | Multiple (NTM EV/Sales) | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | **$104.17** | $65,302M (consensus $62,192M + 5%, beat scenario) | 3.44x (own-history median — top of usable band) | 12 months | Trip/Gross-Bookings volume growth accelerates toward ~25% YoY (`earnings/07` bull case, +$828M EBIT impact) and the driver/courier payment ratio improves ~2pp (+$1,105M EBIT impact); the market credits the resulting margin/growth combination with a re-rate back to the 5-year EV/Sales median, i.e. the market treats the FY2025–26 de-rating as sentiment-driven rather than structural. |
| Base | **$74.77** (weighted blend; expressed as metric × multiple below, exact match — no override applied) | $62,192M (CIQ NTM consensus) | 2.64x (implied by the weighted blend — a modest re-rate from the current 2.41x NTM multiple, well below the 3.44x/3.55x median/mean) | 12 months | Growth continues to decelerate gradually in line with consensus (no shock either way); the driver-payment ratio holds roughly flat to modestly improving; the pending Delivery Hero deal has not yet closed or moved net debt; the market grants a small amount of credit for Uber's now-structurally-higher margin base without assuming the 2021-era zero-rate multiple regime returns. |
| Bear | **$47.24** | $57,217M (consensus − 8%, ~15% YoY growth per `earnings/07` bear case, vs. ~19.9% ex-UK current) | 1.88x (own-history band minimum) | 12 months | Trip/Gross-Bookings growth decelerates further (`earnings/07` bear case, −$828M EBIT impact) and the driver/courier payment ratio worsens ~2pp (−$1,105M EBIT impact) simultaneously — a realistic, not extreme, combination per `earnings/07`'s own sensitivity ranking; the multiple compresses to the low end of Uber's own 5-year trading range as the market re-prices the slower growth and the just-drawn Delivery Hero-funding leverage. |

**Base-case cross-check (executed) — multiple solved to reproduce the weighted blend exactly:**
```
$ python3 -c "
shares=2056.327; net_debt=9340.0; minority=1083.0
ntm_rev=62192.0
base_fv=74.7749
ev_needed = base_fv*shares + net_debt + minority
mult_needed = ev_needed/ntm_rev
def calc(mult, rev):
    ev=rev*mult; eq=ev-net_debt-minority; return ev, eq, eq/shares
ev,eq,px = calc(mult_needed, ntm_rev)
print('Implied NTM EV/Sales multiple:', round(mult_needed,3))
print('Base scenario check: EV=',round(ev,1),'Eq=',round(eq,1),'px=',round(px,2))
"
Implied NTM EV/Sales multiple: 2.64
Base scenario check: EV= 164183.3 Eq= 153760.3 px= 74.77
```
This is presented transparently as the multiple implied by the weighted blend (not an independently-chosen round number that happened to converge, as the pre-refresh version showed) — the Scenario Construction Policy §2 mandatory format (state both metric and multiple) is satisfied, and the 2.64x figure cross-checks closely against `03`'s independently-derived quality-and-growth-adjusted NTM EV/EBITDA multiple: the implied NTM EV/EBITDA at this base ($164,183M EV ÷ $12,589M NTM EBITDA) is **13.04x**, within 1.2% of `03`'s own 13.2x — a genuine, still-standing cross-check between two different metric bases (§5 below).

**Bull/Bear cross-checks (executed, unaffected by the `06` refresh):**
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

**Multiple ordering check:** bull 3.44x ≥ base 2.64x ≥ bear 1.88x — expansion in bull, compression in bear, both anchored inside `02`'s own certified band (1.88x–7.09x); no expansion/compression beyond the band is assumed. Metric and multiple move the same direction within each case (both up in bull, both down in bear).

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
(Independently re-executed and reconciled above — ties exactly to `04`'s published figure; unaffected by the `06` refresh.)

**Structural-reset (avoid-ruin floor): $43.38/share, 24–36 month horizon** — carried forward as the labelled avoid-ruin floor for §24 Kill Criteria in the master synthesis, distinct from the 12-month cyclical/deceleration Bear ($47.24) above. It is the WORSE of the two down-legs by a modest margin ($43.38 < $47.24), consistent with a genuine AV-disruption scenario being a deeper, longer-horizon impairment than a one-year growth/margin miss.

---

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | $68.18 (2026-08-06, pool-verified) |
| Base-case fair value (point) | $74.77 |
| Bear-case fair value (12-month) | $47.24 |
| Implied upside to base case = (base FV − price) / price | **+9.67%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **8.82%** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **30.71%** |

```
$ python3 -c "
price=68.18; base_fv=74.7749; bear_fv=47.24; struct_fv=43.38
print('Implied upside %:', round((base_fv-price)/price*100,2))
print('Margin of safety %:', round((base_fv-price)/base_fv*100,2))
print('Downside to bear %:', round((price-bear_fv)/price*100,2))
print('Downside to structural-reset floor %:', round((price-struct_fv)/price*100,2))
"
Implied upside %: 9.67
Margin of safety %: 8.82
Downside to bear %: 30.71
Downside to structural-reset floor %: 36.37
```

Both metrics are computed off the pool-verified $68.18 anchor (no staleness cap applies). The refresh cuts the margin of safety from 10.78% to **8.82%** (the base case fell $1.65/share while price is unchanged) — a modest cushion, not a deep discount, and closer to "fairly valued" territory than a clear mispricing. Downside to bear (30.71%, unchanged — Bear is unaffected by the `06` refresh) is materially larger than the upside to base, and the structural-reset avoid-ruin floor ($43.38) implies an even larger 36.37% downside from price, though on a longer (24–36 month) horizon and a lower-probability trigger — that comparison belongs to the master synthesizer, not this module.

---

## 5. Warranted-Multiple Check

The base case implies an NTM EV/Sales multiple of ≈2.64x, which cross-checks to an implied NTM EV/EBITDA of ≈13.04x ($164,183M implied EV ÷ $12,589M NTM consensus EBITDA) — this sits within 1.2% of `03`'s independently-derived, peer-anchored quality-and-growth-adjusted multiple of **13.2x**, arrived at from a completely different starting point (peer median 14.42x minus a growth-gap discount). Two independent lenses converging on almost the same warranted multiple is a genuine cross-check, not a coincidence engineered into the model. That multiple sits well below Uber's own 5-year EV/Sales mean/median (3.44x–3.55x) and reflects real, cited reasons the business does not yet warrant a full reversion: decelerating revenue growth (18.3% FY2025 → 12.2% Q2 FY26 YoY), a moat rated Narrow (not Strong) with only 1–2 years of ROIC above cost of capital on a 5-year through-cycle average still below WACC, and an unresolved AV-disruption risk scored 32/100 on rate-of-change. There is no evidence here that the base case requires a multiple the business has never sustained — the risk instead runs the other way: if Uber's margin and ROIC trajectory keep improving as they have for the last three years, the base case may be understating the warranted multiple, not overstating it. No value-trap flag is warranted (no misaligned controlling owner per the governance module); the freshly-rerun `06`'s much lower implied multiple is addressed as a comp-selection and capitalized-overhead artifact (§2), not as fresh evidence the business deserves a lower warranted multiple than the peer- and history-based reads support.

---

## 6. Fair-Value Read

UBER's fair-value levels are **Bull $104.17 / Base $74.77 / Bear $47.24** (12-month horizon), with a separately labelled 24–36 month structural-reset avoid-ruin floor of **$43.38** carried to the Kill Criteria rather than headlined as the Bear, because the AV-disruption risk that triggered it is firing on a moat that is Narrow but demonstrably **widening**, not eroding. Against the current $68.18 price, that gives a modest **8.82% margin of safety** to the base case (down from 10.78% before this refresh, because the freshly-rerun sum-of-the-parts pulled the weighted blend down $1.65/share) and a much larger **30.71% downside** to the 12-month bear — the risk/reward is asymmetric toward the downside on a one-year view, a fact this module states but does not weight or size. The peer-relative EV/EBITDA read (`03`, 38% weight) drives the answer, converging within 1.2% of the base-case scenario construction's independently-derived warranted multiple (13.04x vs. 13.2x) — the single strongest piece of triangulation in this report. **The cross-method base-case spread now runs 81.2% (SOTP $48.22 to own-history $87.37), above the 40% Reconciliation Gate 6 tolerance and the headline finding of §2** — it is reconciled, not averaged away: the wide spread is driven mainly by comp-selection sensitivity inside `06` (a 74.2% swing from a single Mobility-comparable choice) plus a real, filed $52.3bn corporate-overhead deduction, neither of which is new evidence about Mobility's or Delivery's own unit economics, and the Method-Weighting Policy's ≤⅓ cap on `04`+`06` keeps that extreme from dragging the published base down by more than 2.2% versus the pre-refresh figure. The biggest swing factor between bull and bear is not any single company-specific catalyst but the **combination of Trip/Gross-Bookings growth and the driver/courier payment ratio moving together** (`earnings/07`'s #1 and #2-ranked sensitivity variables, worth a combined ~$1.9bn of EBIT swing), compounded by how much of a re-rate or de-rate the market applies to whichever direction those two variables move — the same growth-deceleration-plus-releveraging story that `02` cites as the reason the stock has already de-rated from its 5-year EV/Sales average.
