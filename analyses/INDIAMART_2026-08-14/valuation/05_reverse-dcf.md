# Reverse DCF — What's Priced In — INDIAMART

**Business type:** Operating (India-focused, subscription-funded B2B online marketplace; single reportable segment on the >85%-of-EBIT test) [`04_intrinsic-dcf.md` header; `06_sum-of-the-parts.md` §1]. Per the Business-Type Method Map, this is a standard FCFF/enterprise-value (EV) reverse-DCF — not an equity-direct DDM/residual-income model (that map applies only to Financials/REITs).

**Reconciliation to `04`.** This agent inverts `04_intrinsic-dcf.md`'s own model exactly, per MODULE_RULES Calculation Standard 9: same WACC (10.02%, used), same normalized FY26 FCF base build, same terminal method (exit multiple, 12.0x, `04`'s headline base case), same terminal growth assumption (5.5%, used only to step revenue to the Year-9 terminal-EBITDA calculation), same 8-year horizon (FY27–FY34), and the same mid-year discounting convention. Nothing here is re-derived independently.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | ₹1,784.60 (2026-08-12 close, pool-verified) | `01_price-and-capital-structure.md` §1, §7 |
| Enterprise value (EV) — broad basis, canonical | ₹73,644.05mn (₹7,364.40 crore) | `01_price-and-capital-structure.md` §4, §7 — this is the target the reverse-DCF solves against |
| FCF base (FY26, normalized, NOPAT-and-driver-built) | ₹6,716.64mn (reconciles to reported CFO − capex of ₹6,872.19mn within ~2.3%) | `04_intrinsic-dcf.md` §1 (used verbatim) |
| Discount rate (WACC) used | 10.02% (≈10.0%) — CAPM cost of equity 10.07% (rf 6.85% + β 0.44 × ERP 7.31%) blended with after-tax cost of debt 5.61% at 99.03%/0.97% equity/debt weights | `04_intrinsic-dcf.md` §3 (used verbatim; mechanically-computed alternative at β=0.26 was 8.72% — not used, per `04`'s own override discipline) |
| Terminal growth (g, Gordon; used to step Yr9 revenue for the terminal-EBITDA calc) | 5.5% | `04_intrinsic-dcf.md` §5 |
| Terminal method (headline) | Exit multiple, 12.0x terminal EV/EBITDA (below IndiaMART's own current ~14.15x actual multiple) | `04_intrinsic-dcf.md` §5 |
| Forecast horizon | 8 explicit years (FY27–FY34) | `04_intrinsic-dcf.md` §2 |
| Discounting convention | Mid-year for explicit FCFs (t−0.5), full-year for terminal value | `04_intrinsic-dcf.md` §4 |
| EBIT margin path (held fixed as the primary solve's model) | 31.9% (FY27) fading to 28.0% terminal | `04_intrinsic-dcf.md` §2 |
| Tax rate, capex %, NWC ratio (held fixed) | 25.17% tax; 0.5% of revenue capex; NWC = −82.32% of revenue, applied to Δrevenue | `04_intrinsic-dcf.md` §1–§2 |

## 2. Implied Expectations

**What was held fixed:** WACC (10.02%), the 8-year horizon, the terminal method and multiple (12.0x exit EV/EBITDA), the terminal-growth step (5.5%, used only to project Yr9 revenue for the terminal-EBITDA calculation), the normalized FY26 FCF base, the EBIT-margin fade schedule from `04` (31.9%→28.0%), the tax rate (25.17%), capex (0.5% of revenue) and the NWC ratio (−82.32% of revenue). **What was solved for:** a single flat revenue-growth rate applied uniformly across all 8 explicit years, such that the resulting FCFF stream's present value plus the present value of the terminal value equals today's EV (₹73,644.05mn, broad basis, matching `01`'s canonical bridge). Executed via `scipy.optimize.brentq` — command and root shown below.

```
$ python3 reverse_dcf.py
PRIMARY SOLVE: implied flat revenue/FCFF CAGR = 5.995%  (EV check = 73644.05 vs target 73644.05)
Implied FY34 (Yr8) revenue = 24999.6 vs FY26 actual 15690.42
04's own base-case revenue CAGR (declining schedule) = 7.130% -> FY34 revenue 27222.8
At primary solve g=5.995%: PV(FCFF)=30741.2, PV(TV)=42902.9, TV%EV=58.3%
```

Because the model's EBIT margin (and hence FCFF/revenue conversion) is held at `04`'s fixed schedule, the solved growth rate is simultaneously the implied revenue CAGR and the implied FCFF CAGR — they are the same number under this construction.

A secondary solve holds `04`'s own revenue-growth schedule fixed (9.6% fading to 5.5%) and instead solves for the flat EBIT margin (applied uniformly to all 8 years plus the terminal year) that reproduces the same EV target:

```
Implied flat EBIT margin (all years + terminal) to hit EV target,
holding 04's revenue schedule fixed: 25.76%
(for reference: 04's own margin path fades 31.9% -> 28.0%; FY26 actual 31.97%;
peer-normal 25.3%; company prior trough 24.44-24.64%)
```

| What the Price Implies | Solved Value |
|---|---:|
| Implied flat revenue/FCFF CAGR over the 8-year horizon (margins held at `04`'s schedule) | **5.995% (≈6.0%)** |
| Implied years of growth above India's long-run nominal-GDP proxy (~10–11%, per `04`'s own terminal-growth ceiling discussion) | **0 years** — the implied 6.0% CAGR sits below the GDP proxy in every explicit year, so the price does not require even a single year of above-trend growth |
| Implied steady-state EBIT margin (holding `04`'s own revenue-growth schedule fixed instead) | **25.76%** — sits between the peer-normal anchor (Just Dial, 25.3% LTM EBIT margin) and modestly above the company's own FY23/FY24 prior-trough margin (24.44%/24.64%), well below FY26's actual 31.97% |

Both solves point the same direction: the price is built on an assumption set below the company's own recent operating levels, not above them.

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied revenue CAGR = 6.0% (flat, 8yr) | FY22→FY26 revenue CAGR = 20.13% (4yr); annual YoY decelerating 30.78% (FY23) → 21.45% (FY24) → 16.01% (FY25) → 13.02% (FY26); latest TTM +12.75%; latest quarter (Q1 FY27) +11.37% YoY, the softest of the last 8 quarters [`earnings/01_historical-financials.md` §1, §2, §6] | ARPU has grown ~8–9%/yr for 4 straight years [`earnings/07_earnings-sensitivity.md` §2, Row "ARPU / price realization"]; on its own, continued 8%/yr ARPU growth would already clear the implied 6.0% revenue bar even if paying-supplier count is flat to mildly negative (see §4 market-ceiling decomposition below) | **Yes — the bar reads as conservative.** Even the company's own already-decelerated latest quarter (11.37%) sits nearly double the implied 8-year CAGR |
| Implied steady-state EBIT margin (secondary solve) = 25.76% | FY26 actual EBIT margin 31.97%; 5-year range 24.44% (FY23 trough) to 39.27% (FY22 pandemic peak) [`earnings/01_historical-financials.md` §1] | `business-model/09_moat.md` §3 anchors terminal margin between the peer-normal 25.3% (Just Dial) and the company's own 24.44–24.64% prior trough; `04`'s own terminal assumption (28.0%) already sits above both anchors | **Yes.** 25.76% sits inside the peer/trough-anchored range `04` itself validated, and below every margin the company has reported in the last 4 years |

The market's implied expectations read as **conservative, not aggressive**. A flat 6.0% revenue CAGR is below every annual growth rate the company has posted in the last five years, below its most recent (already-slowing) quarterly print, and below India's long-run nominal-GDP growth proxy in every single year of the forecast — meaning the price does not require the deceleration trend (30.78%→...→11.37%) to bottom out anywhere near the current pace; it can continue falling well past it and the price would still be justified. This is consistent with `04`'s own finding that base-case intrinsic value (₹1,903/share, +6.7% vs price) sits modestly above today's price on the identical assumption set [`04_intrinsic-dcf.md` §8].

**Market-ceiling sanity check.** No dollar-denominated total-addressable-market figure exists in the data pool for India's B2B SME lead-generation/marketplace category, so this check uses the best available proxy: paying-supplier count against India's Udyam-registered-enterprise universe (a low-tier, filing-cited proxy, not a revenue-based TAM — CLAUDE.md §4). The implied 6.0% revenue CAGR is decomposed into ARPU growth × paying-supplier growth, holding ARPU at its observed 4-year ~8%/yr trend [`earnings/07_earnings-sensitivity.md` §2]:

```
Implied subscriber (paying-supplier) net-add CAGR needed if ARPU grows at historical ~8%/yr: -1.856%
Implied paying-supplier count at FY34 (Yr8): 189,379 vs current 220,000
vs Udyam-registered enterprise universe (FY26): 79,400,000
  -> implied penetration = 0.239% (current penetration = 0.277%)
```

The market's implied 6.0% growth bar does not require capturing *more* of the addressable Udyam-registered base (79.4mn enterprises, `business-model/10_external-dependency.md` §1) — it is consistent with paying-supplier count actually *shrinking* modestly (to 189,379 from 220,000 today) if ARPU keeps compounding at its historical rate, and with penetration of the addressable base falling, not rising. Since this check can only ever raise the bar on an implied growth read, and here it finds no capture constraint at all, it does not change the "conservative" verdict above — there is no market-ceiling kill signal on this evidence.

## 4. Robustness

| Discount Rate | Implied Revenue/FCF CAGR to Justify Price |
|---|---:|
| WACC −1% (9.02%) | 5.207% |
| WACC (10.02%, used) | 5.995% |
| WACC +1% (11.02%) | 6.782% |
| *Addendum:* WACC = 13.0% (`04`'s flagged "conventional beta" midpoint, §3/§6) | 8.337% — still below India's ~10–11% nominal-GDP proxy and below the company's own FY26/TTM growth |

```
$ python3 reverse_dcf.py
WACC=9.02%  -> implied CAGR = 5.207%
WACC=10.02%  -> implied CAGR = 5.995%
WACC=11.02%  -> implied CAGR = 6.782%
```

| FCF Base | Implied Revenue/FCF CAGR to Justify Price |
|---|---:|
| Low / Base (normalized constructed, ₹6,716.64mn — `04`'s own base) | 5.995% |
| High (literal reported CFO − capex, ₹6,872.19mn, +2.3%) | 5.677% |

```
Low (normalized constructed, =04 base): scale=1.00000 -> implied CAGR = 5.995%
High (literal reported CFO-capex): scale=1.02316 -> implied CAGR = 5.677%
```

**Limitation on the FCF-base band:** `04` derives only a normalized-vs-literal-reported reconciliation for the FY26 base year (a ~2.3% spread), not a separate bear/bull FCF-base scenario — no broader band exists upstream to test against, so this row likely understates the true range of FCF-base uncertainty; it is not invented here per the instruction to reuse only figures `04` already derived.

Terminal value is 58.3% of EV at the primary solve — just under the ~60% threshold that would make a terminal-`g` sensitivity mandatory, but close enough (and `04`'s own Gordon cross-check sits at 69.5% of EV) that it is shown for prudence:

| Terminal g | Implied Revenue/FCF CAGR to Justify Price |
|---|---:|
| g − 0.5% (5.0%) | 6.034% |
| g (5.5%, used) | 5.995% |
| g + 0.5% (6.0%) | 5.957% |

```
terminal g=5.00% -> implied CAGR = 6.034%
terminal g=5.50% -> implied CAGR = 5.995%
terminal g=6.00% -> implied CAGR = 5.957%
```

**Dominant input:** the discount rate (WACC), not the FCF base or terminal `g`. A ±1pp WACC move shifts the implied CAGR by roughly ∓0.8pp (a ~1.6pp swing across the 2pp WACC range tested), while the FCF-base band shifts it by only 0.32pp (5.995%→5.677%) and terminal-`g` ±0.5% moves it by under 0.04pp — negligible, because the headline terminal method here is a fixed exit multiple (12.0x), not a Gordon perpetuity, so `g` only has a second-order effect (stepping Yr9 revenue before applying the fixed multiple). This mirrors `04`'s own §8 finding that the single most consequential input to this stock's valuation is the beta/WACC estimate, not the growth or margin path — the same instability that flips `04`'s intrinsic read from "+6.7% above price" to "below price" at WACC 13.0% also compresses (but, per the addendum row above, does not reverse) the "conservative pricing" read here.

## 5. What's-Priced-In Read

At ₹1,784.60, the market is pricing in roughly **6.0% flat revenue growth (compound annual growth rate — CAGR) over the next 8 years (FY27–FY34)** on `04`'s own margin, tax, capex and working-capital assumptions. That is **conservative**: it is below every annual growth rate IndiaMART has posted in the last five years (30.78% down to 13.02%), below its most recent, already-decelerated quarter (11.37% YoY), below India's own long-run nominal-GDP growth proxy (~10–11%) in every single forecast year, and it does not require capturing any additional share of the addressable Udyam-registered SME base — continued ARPU growth alone at the company's observed 4-year ~8%/yr pace would clear the bar even with a modestly shrinking paying-supplier count. The read is most sensitive to the WACC/beta estimate (`04`'s own flagged instability, β 0.24–0.91 across vendors) rather than to growth or margin, but even at the higher, "conventional-beta" WACC (13.0%) the implied bar (8.3%) stays below trend growth. Because the implied expectations sit below what the company's own recent history and the earnings-module driver evidence suggest is achievable, this reads as a modest source of upside, not downside — consistent with, and reinforcing, `04`'s own base-case intrinsic read of +6.7% above price.
