# Scenario & Fair Value — ORCL

Reporting standard: US GAAP. Currency: USD (millions, except per-share). Fiscal year end May-31. All anchors (price, shares, net debt, EV) copied verbatim from `01_price-and-capital-structure.md`: current price **$153.94** (Aug-13-2026, 02:26 PM GMT-5, delayed NYSE quote, Capital IQ pool export, **price-state: pool-verified**, 1 trading day old — no staleness cap applies); diluted shares (per-share fair-value basis) **2,914M** (GAAP diluted weighted-average, the disclosure-clean default `02`/`03`/`04`/`06` all use); net debt (strict basis, canonical) **$136,143M**; minority interest **$548M**; preferred equity (carrying value) **$4,954M**.

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | $151.27 (EV/EBIT LTM, CIQ-basis median reversion) | Medium-High | 40% | Clean EV-based read (avoids the EBITDAR-basis reconciliation and the GAAP-P/E one-off-gain distortion); Oracle sits close to its own 5-year median on the least-distorted multiples. Carries majority weight per the Multiples-First Hard Rule for an operating company with usable forward estimates. |
| Relative / peers (03) | $148.70 (NTM EV/EBITDA, quality-adjusted 11.5x) | Medium | 40% | A genuine, evidenced peer set (10 CIQ names, cross-checked against Oracle's own 10-K-named competitors), with an explicit, cited downward adjustment for leverage (Total Debt/EBITDA 5.0x vs peer median 1.1x) and moat-erosion evidence. Carries majority weight alongside `02` per the same hard rule. |
| Intrinsic DCF (04) | $68.92 (Gordon-growth terminal, base case) | Low-Medium (capped — terminal value 80.7% of EV, >75% threshold) | 20% | Valid cross-check, not primary, per the Multiples-First Hard Rule (04+06 combined capped at ≈≤⅓; 06 = 0%, so 04 alone sits at 20%, inside the cap). Weighted meaningfully — not zero — because three independent lenses (this DCF, `05` reverse-DCF, and `business-model/09_moat.md`'s eroding-trajectory finding) converge on the same caution, which is real evidence, not an artifact of one terminal-value choice. |
| Reverse-DCF (05) | (implied, not a value) — price implies a 22.6% FY26–34 revenue CAGR, a +51.3% FY27 print (vs. management's own +33.6% guide), and a 61.9% terminal EBIT margin with no peer precedent | High (mechanics); "aggressive, bordering on unachievable" (conclusion) | n/a | Cross-check only — informs whether the base case is achievable, does not enter the weighted blend. |
| Sum-of-the-parts (06) | $212.01 (raw peer-parity ceiling, base case) | Low as a fair-value input | 0% (zero-weighted) | Cloud & Software is 86.9% of revenue / 90.7% of segment profit — Oracle is effectively single-segment, and `06` itself states its own base case "should be read as a peer-parity ceiling, not a base fair value" and that the leverage/negative-FCF-adjusted read (`03`'s $148.70) "is the more defensible one." Per this module's own producer-flagged "collapsed / single-segment sanity-check only" language, it is excluded from the weighted base point and shown in the football field only. |

Weights sum to 100% across the value-producing, business-type-valid methods (`02`, `03`, `04`); `06` is zero-weighted per its own single-segment collapse note (Segment/SOTP Rule) and shown for transparency only. `05` is a cross-check, never a weighted value.

**Multiples-first applied.** ORCL is an **Operating** business (Business-Type Method Map) with a usable NTM/FY2027 consensus (41-analyst) EPS/EBITDA base and both an own-history (`02`) and peer (`03`) multiple set, so `02`+`03` carry the majority weight (80% combined) and `04` is capped as a minority cross-check (20%, within the ≈≤⅓ ceiling since `06`=0%). No stated reason elevates `04` or `06` to primary here — Oracle is not a multi-segment conglomerate (`06` §1 confirms the single-segment collapse) and a usable forward multiple exists (so the "no usable forward multiple" exception does not apply).

## 2. Triangulation & Reconciliation

### Method football field (full dispersion, not narrowed)

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| 02 Own-history multiples | **$151.27** base; EV-based dispersion $140.47–$174.72 (medians→means); GAAP-P/E rows $181.08–$196.12 shown but flagged unreliable (one-off-gain-inflated EPS base), not used in the base or the dispersion | Medium-High | 40% | See §1 |
| 03 Peers | **$148.70** quality-adjusted base; raw peer-median dispersion $118.10–$191.75 | Medium | 40% | See §1 |
| 04 Intrinsic DCF | **$68.92** Gordon-terminal base; sensitivity grid $52.37–$89.50 (WACC±1%, g±0.5%); exit-multiple cross-check **$112.36** (9.0x terminal EV/EBITDA); declining-perpetuity/structural-impairment terminal **$31.44** (labelled bear input, not the base) | Low-Medium (capped ≤60, terminal-dominated) | 20% | See §1 |
| 06 SOTP | **$212.01** raw peer-parity-ceiling base; range $207.89–$216.13 | Low (as a fair-value input) | 0% | See §1 |

**Headline finding — the spread is the story.** Across the three weighted methods alone, `02` ($151.27) sits **119.5% above** `04`'s DCF base ($68.92) — more than triple the 40% Reconciliation-Gate tolerance. Including the (zero-weighted, but shown-for-transparency) `06` SOTP ceiling ($212.01), the full football field runs from **$68.92 to $212.01**, a **207.7% high-to-low spread**. This is not averaged away.

**Executed base-point calculation (Python):**
```
w02, w03, w04 = 0.40, 0.40, 0.20
base = 0.40*151.27 + 0.40*148.70 + 0.20*68.92
     = 60.508 + 59.480 + 13.784
     = 133.77  ->  BASE-CASE FAIR VALUE = $133.77/share
```

**Reconciliation judgement.** The multiples methods (`02`, `03`) are trusted more for the CENTRAL tendency — both use forward/trailing metrics the market actually prices off, and both independently land within 2 points of each other ($151.27 vs $148.70) despite being built from completely different data (own 5-year history vs a 10-name peer set). But the DCF's much lower read is not dismissed as an outlier: it is corroborated by two other independent lenses in this same run — `05`'s reverse-DCF finds the current price already requires a 51.3% FY27 revenue beat against Oracle's own just-issued +33.6% guide and a 61.9% terminal EBIT margin with no peer precedent (best peer: Microsoft 46.8%), and `business-model/09_moat.md` independently verdicts the moat trajectory **eroding** (return on capital 12.35%→8.22% over four years, now at or below the ~11.2% estimated cost of capital). Three independent methods pointing the same direction is evidence, not noise, so `04` is weighted at 20% (not zero, not equal-weighted) — enough to pull the blended base ($133.77) **below** both multiples methods individually, which is the honest output of the policy-mandated weighting, not a silent drag: the departure from a pure 02/03 average (~$150.0) to $133.77 is disclosed here and its cause (the `04`/`05`/`09` convergence) is named, not hidden. `06`'s $212.01 ceiling is excluded from the blend entirely (see §1) but is shown because it usefully brackets the OPTIMISTIC end of the football field — it is close to the Bull case derived independently in §3 below, a cross-check that the Bull level is not arbitrary.

**Base-case fair value (the point): $133.77/share.**

## 3. Bull / Base / Bear Fair-Value Levels

All cases use NTM/FY2027 consensus EBITDA ($49,996M, the same base `02` and `03` reference) as the forward metric, and the own-history NTM EV/EBITDA band from `02` §2 (min 10.46x, mean 14.71x, median 13.73x, max 24.30x, current 11.65x) as the multiple anchor. Metric deltas for Bull/Bear are drawn from `earnings/07_earnings-sensitivity.md`'s named variables, deliberately excluding rows flagged there as mechanically overlapping (customer-concentration and OCI/RPO-conversion-pace are "two lenses on the same underlying exposure" per that report's §5 — only one of the pair is stacked per case) and excluding operating-expense leverage (which `earnings/07` §5 notes moved in the OPPOSITE direction to gross margin in FY26 itself, so stacking both in the same direction is not disciplined). Horizon default: 12 months (through ~Aug-2027) for Bull/Base/Bear-cyclical; the structural reset carries its own 24–36 month horizon (see below).

| Case | Fair Value / Share (point) | Forward Metric (NTM EBITDA) | Multiple | Horizon | What Must Be True |
|---|---:|---:|---:|---|---|
| Bull | **$212.67** | $54,384M (base +$3,159M gross-margin recovery, reversing FY26's 469bps step-down, + $1,229M from OCI/RPO conversion running ~15% above current run-rate) | 14.0x (expanded toward the own-history NTM mean of 14.71x, vs 11.65x today) | 12 months (~Aug-2027) | Gross margin snaps back toward FY25 levels as data-center capacity hits full contracted revenue (management's own "improves rapidly" claim materializes); the four >$8bn AI-infrastructure customers (AMD, Meta, NVIDIA, OpenAI, TikTok, xAI) keep converting RPO on or ahead of schedule with no pullback; the market re-rates the stock back toward its 5-year mean multiple on growing confidence the AI-capex build is paying off, and the moat-erosion trend (ROIC vs WACC) begins to stabilize rather than widen. Cross-checks closely against `06`'s independently-derived $212.01 peer-parity-ceiling read. |
| Base | **$133.77** | $49,996M (consensus, unchanged — the weighted blend, not a re-derived metric; see §2) | 10.63x (implied by the blended value; below today's actual 11.65x and near the own-history NTM band floor of 10.46x) | 12 months (~Aug-2027) | Consensus NTM EBITDA is roughly achieved, but the market continues to price Oracle's leverage (Net Debt/EBITDA 4.46x, ~4.5–6x the peer median) and its confirmed-eroding return on capital at a discount to its own recent multiple and to peers — i.e., no further de-rating beyond what the DCF and reverse-DCF evidence already argues for, but no re-rating either. |
| Bear — cyclical trough (bear_cyclical) | **$94.62** | $39,900M (base −$6,937M customer/counterparty concentration pullback [one or more of the four >$8bn named customers cuts contracted RPO ~20%] − $3,159M further gross-margin compression [FY27 margin steps down another 469bps beyond FY26's already-lower exit level, consistent with management's own guided, unquantified step-down]) | 10.46x (compressed to the own-history NTM band floor — no expansion beyond the disclosed 5-year range, since real distress evidence exists but is not extreme enough to justify going below the historical floor) | 12 months (~Aug-2027) | A near-term AI-infrastructure demand shock: at least one of the four named mega-customers pulls back materially on contracted capacity (the single largest earnings-sensitivity risk per `earnings/07` §4, with "no disclosed upside mirror of comparable size"), and the FY27 gross-margin step-down management has already flagged qualitatively lands harder than guided. This is a 12-month print-driven miss, not a permanent-impairment scenario. |
| Bear — structural reset (bear_structural) — **HEADLINE BEAR** | **$31.44** | Terminal EBIT margin 22.0% (below Oracle's own FY23 GAAP trough of 27.4%) × revenue base, terminal ROIC 7.0% (below WACC — value-destructive reinvestment), g = 1.5% nominal | Declining-perpetuity DCF (not a metric×multiple construction — see bridge below) | 24–36 months (a multi-year permanent-impairment path, not a 12-month marker) | The moat module's already-**confirmed eroding** trajectory (ROIC 12.35%→8.22% over four straight years, now at/below the ~11.2% estimated cost of capital) does not stabilize: OCI never develops AWS/Azure-level scale or switching-cost economics and becomes a fully commoditized, price-competed infrastructure line with no margin protection, while the legacy software-support annuity (the one part of the business with a real, evidenced moat) keeps shrinking as a share of revenue faster than OCI can build a comparable-margin replacement. |

**Bull/Base/Bear multiple discipline check.** Bull multiple (14.0x) ≥ Base implied multiple (10.63x) ≥ Bear-cyclical multiple (10.46x) — expansion in Bull, compression in Bear, both anchored inside `02`'s own-history NTM band (10.46x–24.30x); metric and multiple move the same direction within each case (both up in Bull, both down in Bear-cyclical). The structural reset is deliberately NOT built on a metric×multiple basis — per the Business-Type Method Map, an impaired terminal DCF is the correct operating-company reset method, not a forced EBITDA×multiple.

**Structural-reset bridge — executed and reconciled to the canonical net-debt anchor (Python):**
```
# Re-verifying 04's declining-perpetuity / runoff terminal (04 sec 5c), business-type-appropriate
# method for an Operating company (impaired FCFF DCF), bridged with 01's canonical STRICT net debt.
pv_explicit_fcf   = 66163      # $M, PV of FY27-FY34 explicit FCFs (same base-case explicit path as 04)
pv_tv_runoff      = 167104     # $M, PV of the g=1.5%, term_margin=22.0%, term_ROIC=7.0% runoff terminal
ev_runoff = pv_explicit_fcf + pv_tv_runoff
#        = 66163 + 167104 = 233267   (EV-based reset -> bridge via 01's canonical net debt)
net_debt, minority, preferred = 136143, 548, 4954   # 01's canonical STRICT basis, subtracted BEFORE /shares
equity_runoff = ev_runoff - net_debt - minority - preferred
#             = 233267 - 136143 - 548 - 4954 = 91622
shares = 2914
price_runoff = equity_runoff / shares
#            = 91622 / 2914 = 31.44   ->  STRUCTURAL-RESET FAIR VALUE = $31.44/share
```
This reconciles exactly to `04_intrinsic-dcf.md` §5c and §6 — no double-subtraction of net debt, since the reset value here is an enterprise value (impaired FCFF), bridged once with the canonical strict net-debt figure.

**Which case is the headline Bear.** `business-model/09_moat.md` §5 states the moat trajectory is **confirmed eroding** (not a bare "No moat proven" verdict — Oracle has a real, evidenced switching-cost moat in its legacy annuity, but the consolidated business's return on capital has moved the wrong way for four straight years). `04_intrinsic-dcf.md` — the DCF whose base case fades terminal ROIC to WACC (no persistent excess return assumed) — IS included in this module's weighted blend (20%, not excluded), so the "keep the reset as an avoid-ruin floor rather than the headline" carve-out does not apply here. Per the graduated billing rule, a confirmed-eroding trajectory with a weighted DCF already reflecting the lost excess return means the structural reset becomes the **headline Bear**, billed as the **worse (lower) of** the two down-legs: structural reset ($31.44) vs cyclical trough ($94.62) → **$31.44 is the headline Bear.** The cyclical trough ($94.62, 12-month) remains a distinct, separately-labelled, fully-computed case above — it is not merged into the headline, and both reach this report on their own terms with their own horizons.

No probabilities are assigned to any case above — that is the master synthesizer's task.

## 4. Margin of Safety & Downside (two separate metrics)

**Executed calculation (Python):**
```
price = 153.94
base  = 133.77
bear_headline = 31.44   # structural reset, the headline Bear per §3
bear_cyclical = 94.62   # shown for context, not used in the headline metric below

implied_upside   = (base - price) / price          # = (133.77-153.94)/153.94 = -0.1310 -> -13.10%
margin_of_safety = (base - price) / base            # = (133.77-153.94)/133.77 = -0.1508 -> -15.08%
downside_to_bear  = (price - bear_headline) / price  # = (153.94-31.44)/153.94  = 0.7958  -> 79.58%
downside_to_bear_cyclical = (price - bear_cyclical) / price  # context only = (153.94-94.62)/153.94 = 0.3854 -> 38.54%
```

| Metric | Value |
|---|---:|
| Current price (Aug-13-2026, pool-verified) | $153.94 |
| Base-case fair value (point) | $133.77 |
| Bear-case fair value — **headline (structural reset, 24–36mo)** | $31.44 |
| Bear-case fair value — cyclical trough (12mo, context) | $94.62 |
| Implied upside to base case = (base FV − price) / price | **−13.10%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−15.08%** (negative — no cushion; price sits above the base-case fair value) |
| **Downside to bear** = (price − bear FV) / price — *inverted, higher = worse* (headline/structural) | **79.58%** |
| Downside to bear (cyclical trough only, context) | 38.54% |

Both metrics require, and have, a **pool-verified** price. Margin of safety and downside-to-bear are two separate numbers reported here — the margin of safety is negative (the stock trades ABOVE this report's base-case fair value, so there is no cushion, not a small one), while downside-to-bear is a large positive (inverted) number precisely because the headline bear reflects the structural-reset path, not a shallow cyclical dip.

## 5. Warranted-Multiple Check

The base case implies a **~10.63x NTM EV/EBITDA** multiple — below today's actual traded multiple (11.65x) and near the floor of Oracle's own 5-year NTM EV/EBITDA range (10.46x–24.30x). This is not a "cheap" read: `business-model/09_moat.md` verdicts a **narrow, eroding** moat (return on capital 8.5–10.5% own-computed, at or modestly below the ~11.2% estimated cost of capital, declining for four straight years), and `business-model/07_business-quality.md` scores capital intensity 12/100 and industry rate-of-change/disruption risk 33/100 (≤40, the CLAUDE.md §24 Filter-5 fast-changing-industry condition) — a business that has not proven it earns above its cost of capital does not warrant a premium multiple, and the base case does not assume one. The management-governance module's §24 Filter 6 (structurally misaligned controlling owner) does **not** trip — founder Larry Ellison (40.21% of vote) is an engaged, value-aligned Executive Chair/CTO, not a value-indifferent controller — so persistent cheapness would not be a value-trap issue here; but the finding runs the OTHER way in this case: the base-case read shows the stock priced **above**, not below, a defensible fair value, so the relevant flag is not "value trap masking cheapness" but "the current price already requires the market's most optimistic, least-evidenced growth assumptions (per `05`'s reverse-DCF: a 51.3% FY27 print vs. a 33.6% guide, and a 61.9% terminal margin with no peer precedent) to be true."

## 6. Fair-Value Read

The base-case fair value is **$133.77/share**, roughly 13% below the current $153.94 price (margin of safety **−15.1%** — no cushion). Bull is **$212.67/share** (+38.2%, requiring sustained mega-customer RPO conversion plus a re-rating back to Oracle's own 5-year mean multiple, and cross-checking closely against `06`'s independent $212.01 SOTP ceiling). The headline Bear is the **structural reset at $31.44/share** (downside-to-bear **79.6%**) — billed as headline rather than the milder cyclical trough ($94.62, −38.5% context case) because `business-model/09_moat.md` **confirms** an eroding moat trajectory and this module's weighted DCF (20% weight, not excluded) already prices in the lost excess-return path. The dominant swing factor between Bull and the headline Bear is not a single input but a converging one: whether Oracle's ~$638bn RPO backlog and its concentrated, four-mega-customer AI-infrastructure bet converts to cash-generative, margin-protected revenue fast enough to reverse four straight years of declining return on capital — or whether it entrenches a permanently lower-margin, more commoditized infrastructure business under a still-shrinking legacy annuity. The method disagreement itself is the headline finding of this report: `02`/`03` (multiples, 80% combined weight) land within 2 points of each other (~$150), while `04`'s DCF (20% weight) sits 119.5% below them and `06`'s raw SOTP (0% weight, shown only) sits 40.4% above them — a 208% high-to-low football field that is corroborated, not contradicted, by `05`'s independent reverse-DCF finding that today's price already requires growth and margin assumptions with no historical or peer precedent.
