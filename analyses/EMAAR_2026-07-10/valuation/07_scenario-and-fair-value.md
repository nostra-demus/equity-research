# Scenario & Fair Value — EMAR (Emaar Properties PJSC, DFM: EMAAR)

*Dubai/UAE hybrid real-estate business — ~80% build-to-sell off-plan development (operating-company-like), ~15% mall leasing + ~5% hospitality (recurring-income, REIT-like). IFRS; reporting currency **AED** (dirham pegged to the US dollar at 3.6725, so AED↔USD carries negligible currency risk). Anchors taken verbatim from `01_price-and-capital-structure.md` §7: price **AED 12.20** (US$3.32, last close, **pool-verified**, as-of 2026-06-28), fully diluted shares **8,838.789849m**, market cap **≈ AED 107,818m**, canonical **broad** net cash **AED 24,969m** (strict §15 net cash AED 2,115m), broad EV **≈ AED 96,657m**, LTM EBITDA **AED 25,200.7m**, book value **AED 10.16/share**. **Price-state = `pool-verified`** (12 days stale — a data-quality caveat, not a no-price trigger), so the price-relative metrics in §4 ARE assessable. This report reconciles methods `02`–`06` into one base-case fair-value POINT plus bull/base/bear LEVELS; it does NOT assign probabilities, weight returns, size a position, or rate the stock — those belong to the master synthesizer.*

*Plain-English note (first use): **fair-value level** = an estimate of what a share is worth, one number per case; **margin of safety** = how far today's price sits below the base-case worth (the cushion); **downside to bear** = how far price would fall if the bad case happens (a loss measure — higher is worse); **EV/EBITDA** = enterprise value ÷ operating cash profit; **P/E** = price ÷ earnings per share; **P/BV** = price ÷ accounting net worth per share; **through-cycle** = averaged across boom and bust, not read at a single peak year; **warranted multiple** = the multiple the business actually deserves given quality, cyclicality and its owner.*

---

## 1. Method Summary

Business type from `00`/`01` = **Operating with a real-estate/NAV overlay** (a hybrid developer-plus-annuity, close to a holding company). Per the Business-Type Method Map the value-producing set is **02 (own-history multiples), 03 (relative/peers), 04 (intrinsic DCF), 06 (sum-of-the-parts)**; reverse-DCF (05) is a cross-check, not a weighted value. All four value-producing methods are valid for this type — none is zero-weighted for invalidity — but `02`'s **reversion exhibit** is zero-weighted because its own producer marked it *illustrative-only* (see below).

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | **AED 12.5** base ("no re-rate"); reversion exhibit AED 9.6–22.4 *(illustrative-only, zero-weighted)* | Low | **15%** | The 4-year multiple window is **entirely an up-cycle** (no Dubai downturn in it), so its means are up-cycle means, not through-cycle norms, and the base metric is a **record peak**. `02` explicitly marks its reversion table *illustrative-only* and hands `07` a near-circular "hold the current multiple" point (~AED 12.5 ≈ price). Lowest weight; reversion figures excluded. |
| Relative / peers (03) | **AED 16.9** base (warranted 5.5x LTM EV/EBITDA, on peak metrics); ~AED 11.5–12.6 once earnings normalized | Low–Medium | **20%** | Only **one** clean comparable (Aldar — same city, cycle, currency, audited). The other nine are private (DAMAC/Sobha — no public multiples) or China/HK names whose collapsed earnings inflate their multiples. A single clean comp is thin, and the base is struck on **peak** LTM EBITDA. |
| Intrinsic DCF (04) | **AED 18** central (AED 17.2 economic-NCI / AED 19.2 book-NCI); grid AED 15–22 | Medium | **30%** | FCFF DCF on **normalized mid-cycle** (not peak) earnings — the correct method for a cyclical, and terminal value is only **36% of EV** (not terminal-dominated, a confidence plus). Docked from top weight because it does **not** model the government-owner value-trap discount and swings ~AED 1/share per 2pp of mid-cycle margin. |
| Reverse-DCF (05) | *(implied, not a value)* — price implies FCFF **−13.4%/yr** for a decade and a ~**21%** through-cycle margin | Medium | n/a | Cross-check only. Inverts `04`'s exact model: tells us the market prices structural runoff and pays **64%** of `04`'s intrinsic — i.e. expectations are undemanding — but is not an independent fair value. |
| Sum-of-the-parts (06) | **AED 16.77** base (after a 20% holdco/state-owner discount); band AED 11.0–23.8 | Medium | **35%** | Highest weight: this is a **multi-segment hybrid** where a wholly-owned, recurring-rent **mall annuity (~22% of profit, ~AED 76.8bn EV)** is masked inside a cyclical developer priced on one blended 3.8x multiple. SOTP is the designated method for a holding-company-like structure **and is the only method that already applies the RF-OWN-004 government-owner discount**. |

Weights sum to **100%** across the four value-producing, business-type-valid methods. Reverse-DCF is a cross-check, not a weighted input.

---

## 2. Triangulation & Reconciliation

### Method football field (the honest cross-method spread — not pre-blended)

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | Base **AED 12.5**; illustrative reversion **AED 9.6–22.4** | Low | 15% | Up-cycle-only window; peak base metric; reversion illustrative-only; value-trap flag |
| Relative / peers (03) | Base **AED 16.9**; warranted-multiple band **AED 14.1–17.2**; normalized **AED 11.5–12.6** | Low–Med | 20% | One clean comp (Aldar); rest private/China-distorted; peak metrics |
| Intrinsic DCF (04) | Central **AED 18** (17.2–19.2); grid **AED 15–22**; runoff floor **AED 13–15** | Medium | 30% | Normalized mid-cycle FCFF; TV only 36% of EV; value-trap unmodeled |
| Sum-of-the-parts (06) | Base **AED 16.77**; band **AED 11.0–23.8** | Medium | 35% | Captures masked wholly-owned mall annuity; applies 20% state-owner discount |
| *Reverse-DCF (05, cross-check)* | *Market prices FCFF −13.4%/yr, ~21% margin — pays 64% of `04` intrinsic (too pessimistic on fundamentals)* | Medium | n/a | *Inverts `04`; "what's priced in", not a value* |

**True high-to-low dispersion across value-producing methods: ~AED 9.6 (02 P/BV cycle-robust / 06 bear) to ~AED 22–23.8 (04 grid high / 06 bull)** — a spread well over 40%. The base point below is reconciled FROM this spread; it is not smeared into a fake mid-band.

### The >40% spread IS the headline finding

The base points alone span **AED 12.5 → AED 18 = a 44% spread** (`04` 18 vs `02` 12.5), so cross-method disagreement is the lead result (Reconciliation Gate 6). The disagreement is not random noise — it is **one question**: do you value Emaar on its **assets** (SOTP + DCF-terminal + book → ~AED 17–18), or on **normalized through-cycle earnings at a warranted multiple** (→ ~AED 11–12.6)? Today's price (AED 12.20) sits squarely in the through-cycle-earnings camp; the asset methods say materially more. The reverse-DCF (`05`) adjudicates the tie-breaker: at AED 12.20 the market prices free cash flow to **shrink ~13%/yr for a decade** and the through-cycle operating margin to settle near **21% — below Emaar's own FY2021 trough (23.5%) and below audited peer Aldar (27.2%)**. That is pricing **structural impairment**, which the AED 163.4bn sold backlog (3.3× revenue, ~94% sold), the wholly-owned mall annuity and the net-cash balance sheet do not support — so on fundamentals fair value is **above** price. The catch is structural, not fundamental: the **RF-OWN-004 government controller** (Government of Dubai / Dubai Holding group, 29.73%; board government-staffed; IAS 24 hides the largest related-party channel) is a value-indifferent city-builder, and a misaligned owner can keep a below-intrinsic price below intrinsic indefinitely [`management-governance/99`; `04_ownership-and-insider-behavior` §Filter 6].

### Base-case fair value = a single POINT: AED 15.0

The mechanically-weighted blend of the four base points (15% × 12.5 + 20% × 16.9 + 30% × 18 + 35% × 16.77) = **AED 16.52** (executed snippet, §below). I publish the base **AED 1.52 (−9.2%) lower, at AED 15.0**, and state the reason rather than re-anchor silently: two of the four inputs — `04` (AED 18) and `03`'s headline (AED 16.9) — are struck on **peak LTM metrics** and carry **no** government-owner discount, whereas only `06` (20% discount) and `02` (no-re-rate) embed the RF-OWN-004 value trap. AED 15.0 applies that value-trap discount more evenly across the blend and pulls toward the through-cycle-normalized cluster — a **disclosed conservative adjustment** (Core Principle 6; §24 Filter 6), not a lens swap. The judgement in one line: I trust `06` (SOTP) most because it is the only method that both surfaces the masked wholly-owned mall annuity **and** already prices the state-owner discount, with `04`'s normalized DCF as the corroborating asset check; the own-history and peer-normalized reads (~AED 12) keep me from underwriting the full asset value the government owner has no interest in crystallising. AED 15.0 sits below consensus (AED 17.07 mean / 17.50 median) and below a full reversion to Emaar's own ~7.4x median P/E — deliberately, because the earnings base is a peak and the owner is misaligned.

---

## 3. Bull / Base / Bear Fair-Value Levels

Each case is a **single derived fair-value LEVEL (a point)** off one coherent assumption set. Default **12-month convergence horizon (to ~mid-2027)**; note that under the government-owner value trap the *timing* of convergence (especially the bull's asset-value recognition) can run longer than 12 months even if the *level* is right. The cross-method dispersion is the §2 football field; the bull-to-bear spread is the range. Operating drivers cite `earnings/07_earnings-sensitivity.md`; the warranted multiple ties to `business-model/07`, `09`.

| Case | Fair Value / Share (point) | Implied Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---|---|
| **Bull** | **AED 21.00** | ~6.9x LTM / ~9–10x normalized EV/EBITDA; ~9.8x P/E; 2.1x P/BV | 12m (~mid-2027) | Dubai up-cycle **extends past FY2028**; mid-cycle EBIT margin **holds ~37%** (the cheap legacy-land spread persists longer than guided); RE recognition **+12%** and pre-sales **+20%** [earnings/07 bull]; and the market gives **partial credit** to the masked wholly-owned mall annuity — a re-rate from 3.8x → ~6x LTM EV/EBITDA, still **below** Aldar's 8.3x. Anchored on `04`'s 37%-margin grid (AED 20–22) and a de-rated `06` bull. |
| **Base** | **AED 15.00** | ~4.8x LTM / **~6.7x normalized** EV/EBITDA; ~7.0x P/E; 1.5x P/BV | 12m (~mid-2027) | Dubai cycle **normalizes off the FY2025 peak** (consensus −14.8% long-term growth) but the AED 163.4bn backlog (94% sold) converts on schedule; through-cycle EBIT margin **~35%**; net cash + the wholly-owned mall annuity credited; a **partial (not full)** value-trap discount. Needs only a modest warranted re-rate 3.8x → ~4.8x LTM EV/EBITDA. |
| **Bear** | **AED 9.75** | ~0.96x book *(flow multiples distorted at a trough — read on book)* | 12m (~mid-2027) | A **genuine Dubai downturn** (prior-trough base rate below), not a mild dip: developer bookings/earnings **−~35% off peak**, mall net operating income softens with cap rates widening, valued ~0.95x book on **strict** net cash. = the **worse of** the cyclical through-cycle trough and the structural-reset runoff (below). |

**Bear = a true through-cycle trough, cited (not a dip off the peak).** Emaar's own 4-year multiple/earnings window (2022–2026) is **all up-cycle**, and `earnings/07`'s near-term bear moves (EPS −0.04 to −0.16) are **backlog-buffered up-cycle years** — the module itself flags the medium-term (2027–29) demand hit at an *illustrative* **−0.30 to −0.50+ EPS** and names the base rate as **Dubai boom-bust: ~50% peak-to-trough prices in 2008–09, ~35% in 2015–2019** [earnings/07 §4, §6; `business-model/07` cyclicality row; `10_external-dependency` §1]. So I widen the bear to that documented prior-downturn: developer earnings −~35% (deeper than `06`'s −20% "mild" bear at AED 11.04), landing at **AED 9.75 = 0.96x book**, at `02`'s cycle-robust P/BV anchor (0.94x median → AED 9.55). The trough does **not** reach the 2015–20 low of ~0.67x book (≈ AED 6.8) because the modern balance sheet — **AED 25bn net cash and the wholly-owned Emaar Malls annuity** (~98% occupancy, recurring rent) — is a far stronger floor than Emaar carried into prior downturns; net cash + malls − minority alone underpin ~AED 6–8/share before any developer, land-bank or hotel value.

**Structural-reset / permanent-impairment (avoid-ruin) — computed, and why it is NOT the headline bear here.** The trigger **fires**: `business-model/09` returns a **Narrow moat on an *eroding* economic trajectory** (the cheap-land spread narrows — gross margin 63%→55%, guided "low 50s"; a new 15% DMTT tax permanently lowers after-tax returns; through-cycle ROIC ~7.5–9.5% sits **at/below** the ~11–12% cost of capital, clearing it only at the peak). Critically this is an **economic** fade, **not** a disruption/obsolescence case — the disruption Filter 5 does **NOT** trip (business-quality rate-of-change **72/100**, well above 40) [`09` §5; `07_business-quality` §4]. So the correct reset is `04`'s **declining-perpetuity runoff** (g = 0%, terminal EBIT margin faded toward Aldar's ~28%), an **EV-based** reset bridged with `01`'s canonical net-cash anchor:

```
impaired operating EV = PV(explicit FCFF 96,600) + PV(runoff TV 39,893) = AED 136,493m
bridge (EV-based; net debt is NEGATIVE = net cash, so ADD):
  136,493 + net cash 24,969 + associates 7,529 − minority 13,808 = equity 155,182 → AED 17.56/sh (book-NCI)
  economic-minority basis (NCI ~21% of EV) → AED 15.9/sh; with 5.0x exit → ~AED 15.0/sh (matches 04 §5)
=> structural-reset ≈ AED 15–17.6
```
Because the eroding moat is a **slow economic fade cushioned near-term by the sold backlog, the mall annuity and net cash**, the structural-reset (~AED 15) is **milder** than the cyclical trough (~AED 9.75). Per the graduated worse-of rule, on a confirmed-eroding moat the headline Bear is the **WORSE (lower)** of the two — so **the cyclical trough (AED 9.75) is the headline Bear**, and the structural-reset (~AED 15) is carried here and to `99`/Kill-Criteria as the labelled **avoid-ruin / permanent-impairment reference** (the multi-year economic-fade floor, which here happens to sit *above* the 12-month cyclical trough). The reset per-share reconciles to its stated method (04's runoff), its impaired driver (28% terminal margin, no excess return), and `01`'s net-cash anchor. *(No probabilities — that is the master synthesizer's job.)*

---

## 4. Margin of Safety & Downside (two separate metrics)

Price-state = **`pool-verified`**, so both price-relative metrics are assessable (per MODULE_RULES Calculation-Standards 11, formulas verbatim).

| Metric | Value |
|---|---:|
| Current price | **AED 12.20** (US$3.32, as-of 2026-06-28) |
| Base-case fair value (point) | **AED 15.00** |
| Bear-case fair value | **AED 9.75** |
| Implied upside to base case = (base FV − price) / price | **+23.0%** |
| **Margin of safety** = (base FV − price) / base FV — *the cushion* | **+18.7%** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **+20.1%** |

Margin of safety (+18.7% discount of price to base fair value) and downside-to-bear (+20.1% loss if the Dubai cycle troughs) are **different numbers measuring different things** — reported separately, neither used as a proxy for the other. The near-symmetry (≈19% cushion vs ≈20% loss-to-trough) is itself the read: the cushion to the base case is roughly matched by the fall to a true cyclical trough, so the margin of safety is real but not wide once the cycle is respected.

---

## 5. Warranted-Multiple Check

At **AED 15.0** the base implies **~4.8x LTM EV/EBITDA (≈6.7x on through-cycle EBITDA) and ~7.0x LTM P/E** — a *modest* re-rate from today's 3.8x / 5.7x that stays **below** Emaar's own ~6.5x EV/EBITDA and ~7.4x P/E medians and **below** Aldar's 8.3x / 8.5x, so the base does **not** require a multiple the business has never earned; it is warranted by the net-cash balance sheet, the wholly-owned mall annuity, the #1 Dubai brand/land position and BBB+/Baa1 ratings. **But value-trap risk is explicit and mandatory here (RF-OWN-004, §24 Filter 6):** the controller is the **Government of Dubai (Dubai Holding, 29.73%)**, a value-indifferent city-builder with every "independent" director a government official and the largest related-party channel unquantified — under such an owner persistent cheapness is a **trap, not a margin of safety**, so the base deliberately withholds the full asset value (SOTP AED 16.77 / DCF AED 18) and the bear assumes **no** re-rating the owner will not pursue. A low multiple sitting on **record cycle-peak earnings** that consensus already marks down (−14.8% long-term growth; forward P/E above trailing) reinforces the caution: the "0th-percentile" discount is partly a peak-earnings and misaligned-owner artefact, not a clean mispricing.

---

## 6. Fair-Value Read

Bull **AED 21** / base **AED 15.0** / bear **AED 9.75** (12-month levels), off a base point reconciled down from a AED 16.5 mechanical blend for the peak-earnings content and the government-owner value trap. Against the pool-verified AED 12.20 price the **margin of safety is +18.7%** (the cushion to base) and the separate **downside-to-bear is +20.1%** (the loss to a genuine Dubai trough) — a real but not wide cushion, roughly matched by the fall to a true cyclical low. **SOTP (`06`) drives the answer** — it alone surfaces the masked wholly-owned mall annuity (~AED 76.8bn EV, ~79% of today's entire enterprise value from 22% of profit) and already prices the state-owner discount — with `04`'s normalized DCF corroborating the ~AED 17–18 asset value and `05` confirming the market prices structural runoff that the backlog, malls and net cash do not support. The single biggest swing factor between bull and bear is **Dubai residential demand / the developer margin through the cycle** (a ~AED 11 swing turns on whether the mid-cycle EBIT margin holds ~37% or the cycle troughs ~35% off-peak), gated throughout by whether the misaligned Government-of-Dubai owner ever lets the masked value close — the reason the levels stop here and the bet is left to the master synthesizer.

*Executed-snippet provenance: the weighted blend (AED 16.52), the published levels and their implied multiples, the margin-of-safety / downside-to-bear metrics, and the structural-reset EV→equity bridge were all produced by a Python snippet (command + output shown in the working log), not by hand. Anchors (price AED 12.20, shares 8,838.789849m, broad net cash AED 24,969m, minority AED 13,808m, LTM EBITDA AED 25,200.7m, book AED 10.16) match `01` §7 verbatim.*
