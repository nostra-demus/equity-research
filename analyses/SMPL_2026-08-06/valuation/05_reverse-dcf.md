# Reverse DCF — What's Priced In — SMPL

Business-type gate: SMPL is an **Operating** business (branded, asset-light consumer-packaged-food company) [`00_valuation-data-triage.md` §1A; `business-model/02_business-identity.md`] — the standard FCFF reverse-DCF applies, not a DDM/residual-income equity-direct model. Price-state is **pool-verified** ($11.33, close, Aug-04-2026) [`01_price-and-capital-structure.md` §1] — the partial-data stop does not apply.

This report inverts the SAME model as `04_intrinsic-dcf.md`: it holds `04`'s WACC (7.93%), terminal growth (1.0%), 6-year explicit horizon (FY2026–FY2031), and mid-year discounting convention fixed and verbatim, and solves backward for the FCF path today's enterprise value actually requires.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $11.33 (close, Aug-04-2026) | `01_price-and-capital-structure.md` §1, price-state: pool-verified |
| Enterprise value (EV) | $1,326.84M | `01_price-and-capital-structure.md` §4 (market cap $1,002.26M + funded debt $397.04M + operating leases $51.43M − cash $123.88M) |
| FCF base (FY2025, "year 0") | $151.2M (normalized FCFF, `04`'s identity) | Derived below, matching `04`'s own FCFF construction |
| Discount rate (WACC) used | 7.93% | `04_intrinsic-dcf.md` §3, verbatim (CAPM: kₑ 9.58% incl. 3.0pp small-cap size premium, after-tax kd 4.24%, weights 69.1%/30.9%) |
| Terminal growth (g) | 1.0% | `04_intrinsic-dcf.md` §5, verbatim (financeable-growth-corrected from an initial 3.0% nominal-GDP default per the Gate-2 reinvestment cross-check) |
| Forecast horizon | 6 years (FY2026–FY2031) | `04_intrinsic-dcf.md` §2, verbatim |
| Discounting convention | Mid-year for explicit FCFs (t−0.5); terminal value discounted at the full final year (t=6, not 5.5) | `04_intrinsic-dcf.md` §4–§5, matched exactly (discount factors 0.9626…0.6573 for t=1..6; TV factor 0.6327 = 1/1.0793⁶) |

**FCF base derivation (held to `04`'s own FCFF identity — `NOPAT + D&A − Capex − ΔNWC − SBC` — applied to the FY2025 base year, not re-derived):**
```
NOPAT_2025      = 217.8 × (1−0.25)              = 163.35   (Normalized EBIT from 04 §1, 25% tax rate from 04 §2)
+ D&A_2025      = 177.9 (GAAP EBITDA) − 156.9 (GAAP EBIT) = 21.0   (earnings/01 §1)
− Capex_2025    = 20.5                                     (earnings/01 §1)
− ΔNWC_2025     = 329.1 − 331.7 = −2.6 (a release, so −ΔNWC = +2.6)  (earnings/01 §1, FY25 vs FY24 NWC)
− SBC_2025      = 15.3                                     (earnings/01 §4, FY2025 disclosed SBC)
= FCF0          = 163.35 + 21.0 − 20.5 + 2.6 − 15.3 = 151.15 ≈ $151.2M
```
Two alternate FCF0 anchors are carried through §4 as robustness bands: FY2025 **reported** FCF (CFO − Capex) = $157.9M [`earnings/01_historical-financials.md` §1], and the **latest TTM** FCF (to May-30-26) = $119.4M [`earnings/01_historical-financials.md` §2] — the current trough, per `business-model/07_business-quality.md`'s "multi-year trough, not a cyclical peak" finding.

## 2. Implied Expectations

**What was held fixed:** WACC (7.93%), terminal g (1.0%), horizon (6 years), discounting convention (all from `04`, verbatim) and the FY2025 normalized FCF0 ($151.2M). **What was solved for:** a single constant annual FCF growth rate `g` applied to FCF0 for 6 years, such that the resulting present value (explicit FCFs discounted mid-year + Gordon-growth terminal value on the year-6 FCF, discounted at the full final year) equals today's EV of $1,326.84M.

**Executed solver (Python, `scipy.optimize.brentq`):**
```
def f(g):
    pv_explicit = sum(FCF0*(1+g)**t / (1+WACC)**(t-0.5) for t in range(1,7))
    fcf6 = FCF0*(1+g)**6
    tv = fcf6*(1+0.01)/(0.0793-0.01)
    pv_tv = tv/(1+0.0793)**6
    return (pv_explicit + pv_tv) - 1326.84
g_implied = brentq(f, -0.5, 0.9)
```
**Root returned: g = −9.08%** (FCF0 = $151.15M normalized FY2025 base).

Cross-check outputs from the same run: PV of explicit FCFs = $539.45M, PV of terminal value = $787.39M, EV = $1,326.84M (ties exactly), terminal value = **59.3% of EV** — near the 60% terminal-dominance threshold, so terminal-g robustness is shown in §4.

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCF CAGR over the 6-year horizon (FY2026–FY2031) | **−9.08% per year** |
| Implied years of above-GDP (or even flat) FCF growth priced in | **Zero** — the solved path is a continuous decline in every one of the 6 explicit years, not a trough-then-recovery shape |
| Implied steady-state EBIT margin (holding `04`'s own revenue path fixed — see below) | **11.4%** |

**Sanity check — flat FCF, no decline at all.** Running the identical solver with `g = 0` (FCF held flat at the $151.2M FY2025 level for all 6 years, same WACC and terminal g) produces an EV of **$2,121.1M** — both above `04`'s own base-case EV ($1,901.3M) and far above the current $1,326.84M EV. **The price does not even embed a "flatline forever" scenario; it requires a full six years of continuous decline.**

**Secondary solve — implied steady-state EBIT margin.** Holding `04`'s own revenue path fixed (FY26 −6.9%, FY27 −4.5% [company guidance / Street consensus], FY28–31 fading to +1.0% to +3.0% [`04`'s analyst assumption]) and `04`'s own D&A%, capex%, SBC%, and 22.7%-of-revenue working-capital ratio, the constant EBIT margin that reproduces today's EV is **11.4%** — solved the same way (`brentq` on the margin variable, same discounting). That sits *below* both the TTM trough of 10.7% normalized EBIT margin (close to it) and well below `04`'s own terminal assumption of 15.5% and FY2025's normalized 15.0%. In other words: even if revenue recovers on schedule exactly as `04` assumes, the price still requires operating margins to stay pinned near today's trough — not recover — for the full horizon.

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied FCF CAGR = −9.08%/yr for 6 straight years (FY26–FY31) | FY2021–FY2025 FCF CAGR = **+5.8%/yr** ($126.2M → $157.9M); revenue CAGR over the same period = **+9.6%/yr** — five straight years of GAAP growth before the last four quarters turned negative [`earnings/01_historical-financials.md` §1, §6] | FY2026 guidance is −6.9% revenue and FY2027 consensus is −4.5% (still being cut, revision breadth −6) [`earnings/04_guidance-consensus.md`, per `04_intrinsic-dcf.md` §2] — genuinely supports 1–2 years of comparable-magnitude decline, but **`04`'s own analyst-built forecast has revenue re-accelerating to +1% to +3% by FY2028–31**, and `earnings/07_earnings-sensitivity.md` §2 shows Quest (63.7% of sales) still growing +1.1% YoY, a September-2026 price increase not yet in effect, and management flagging Atkins comps as "becoming more favorable" from FY27 | **Stretch to No** — the first 1–2 years are within the guided/consensus range; sustaining that pace for 4 more years contradicts both `04`'s own forecast shape and the earnings-module driver evidence |
| Implied steady-state EBIT margin = 11.4% (holding `04`'s revenue path) | FY2021 margin 17.7%, falling to FY2025's 10.8% GAAP / 15.0% normalized; TTM normalized margin 10.7% (a documented multi-year trough, not a peak) [`earnings/01_historical-financials.md` §1–§2; `business-model/07_business-quality.md` §4] | `04`'s own terminal assumption is 15.5%, benchmarked between the TTM trough (16.9% Adj. EBITDA basis) and FY2024 (20.2%) — deliberately **not** management's own "~20%" aspirational target [`04_intrinsic-dcf.md` §2 Cyclicality Gate note] | **Stretch** — 11.4% sits close to but marginally below the documented trough; it requires the current trough to persist indefinitely with no recovery even after the September-2026 price increase and Atkins comp-easing that management itself flags |

In 2–4 sentences: the market's implied expectations are **aggressive on the downside**, not conservative. A one-to-two-year continuation of the currently guided decline is well evidenced (FY26 guidance −6.9%, FY27 consensus −4.5%, still being cut), but the priced-in path requires that pace of decline — or a margin pinned at the trough — to run unbroken for a full six years, which is a materially harsher outcome than `04`'s own analyst-built forecast (revenue recovering to +1–3% growth from FY28, margin recovering to 15.5%) and than the company's own five-year pre-2025 history (+9.6%/yr revenue CAGR, +5.8%/yr FCF CAGR). **Market-ceiling check (Operating business, per §5 of the framework): not meaningful here and not run — the priced-in path is a *decline*, not a growth path requiring incremental market-share capture, so there is no addressable-market ceiling to test against; the check exists to make implied growth look harder, and there is no growth to stress-test.** The only ceiling worth naming in the opposite direction: `04`'s own **structural-reset/runoff bear case** — a labeled, permanent-share-loss scenario with a 14.5% terminal margin and −1% perpetual decline [`04_intrinsic-dcf.md` §5] — still computes to **$13.09/share**, above today's $11.33 price. The market is pricing in something worse than even `04`'s own structural-bear input.

## 4. Robustness

**FCF base.**

| FCF Base (FY2025, "year 0") | Implied FCF CAGR to Justify Price |
|---|---:|
| TTM trough (latest 39wk, $119.4M) | **−4.56%/yr** |
| FY2025 normalized (base, $151.2M — `04`'s FCFF identity) | **−9.08%/yr** |
| FY2025 reported (CFO − Capex, $157.9M) | **−9.91%/yr** |

**Discount rate.**

| Discount Rate | Implied FCF CAGR to Justify Price |
|---|---:|
| WACC −1pp (6.93%) | **−11.64%/yr** |
| WACC (base, 7.93%) | **−9.08%/yr** |
| WACC +1pp (8.93%) | **−6.75%/yr** |

**Terminal growth** (shown because base-solve terminal value = 59.3% of EV, near the ~60% dominance threshold, and `04`'s own base case carries TV at 66.4% of EV):

| Terminal g | Implied FCF CAGR to Justify Price |
|---|---:|
| g − 0.5pp (0.5%) | **−8.24%/yr** |
| g (base, 1.0%) | **−9.08%/yr** |
| g + 0.5pp (1.5%) | **−9.98%/yr** |

**Executed commands and roots** (same `brentq` solver as §2, parameter swept): FCF0 sweep → `{119.4: -4.56%, 151.15: -9.08%, 157.9: -9.91%}`; WACC sweep → `{0.0693: -11.64%, 0.0793: -9.08%, 0.0893: -6.75%}`; terminal-g sweep → `{0.005: -8.24%, 0.01: -9.08%, 0.015: -9.98%}`.

**Which input dominates:** the **FCF base** spans the implied-growth solve by **5.35 percentage points** (−4.56% to −9.91%) across its low/base/high band; the **WACC** spans it by **4.89 percentage points** (−11.64% to −6.75%) across ±1pp; **terminal g** spans it by only **1.74 percentage points** (−8.24% to −9.98%) across ±0.5pp. The FCF base is the marginally larger swing factor here, with WACC close behind and terminal g the least sensitive of the three — consistent with the general pattern that the base, not the discount rate, usually does the most work in a reverse-DCF read.

## 5. What's-Priced-In Read

At $11.33, the market is pricing in a **normalized FCF decline of roughly 9% a year for six straight years** (FY2026–FY2031) off a $151M FY2025 base — not a return to flat, let alone growth, and (on the margin-holding-revenue-fixed solve) an operating margin pinned near today's documented trough indefinitely. That is more severe than what the evidence supports past the next 1–2 years: SMPL's own FY2026 guidance (−6.9% revenue) and FY2027 consensus (−4.5%, still being cut) justify roughly that pace of decline near-term, but not for four more years on top of it — `04`'s own analyst-built DCF forecast has revenue recovering to +1–3% growth from FY2028, and even `04`'s labeled structural-reset/permanent-share-loss bear case ($13.09/share) still sits above today's price. This reads as **aggressive on the downside** — the market may be pricing a deeper, more durable decline than the company's own guidance shape, the earnings-module driver evidence (Quest still growing, an unlanded September-2026 price increase, easing Atkins comps), or `04`'s own bear case support — which is consistent with `04`'s independently-derived +54.7% intrinsic upside. The flip side is real and documented, not dismissed: a 68/100 (high) earnings-volatility score, negative FY2027 estimate-revision breadth, zero commodity hedges, and an "eroding" moat trajectory (`business-model/09_moat.md` §5) mean a milder version of this decline path is a live, evidenced risk — just not, on the evidence gathered here, the full six-year, no-recovery path the current price requires.
