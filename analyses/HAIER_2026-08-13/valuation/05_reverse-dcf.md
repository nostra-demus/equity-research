# Reverse DCF — What's Priced In — HAIER (Haier Smart Home Co., Ltd., SHSE:600690)

This report inverts `04_intrinsic-dcf.md`'s own discounted-cash-flow (DCF) model — a method that estimates value by discounting future cash flows back to today's money — rather than building a new one. Instead of forecasting cash flows and deriving a fair value, it starts from today's price and solves backwards: holding `04`'s discount rate (the WACC, or weighted average cost of capital — the blended annual return debt and equity holders require) and its terminal method fixed, what growth or margin does the price require? This is the standard "reverse-DCF" or "what's priced in" read.

## 1. Inputs

All figures carried forward verbatim from `valuation/01_price-and-capital-structure.md` (price, EV) and `valuation/04_intrinsic-dcf.md` (WACC, FCF base, terminal method) — no independent WACC or base is derived here, per the module's reverse-DCF standard (this agent's job is to invert the same model `04` already built, not build a second one).

| Input | Value | Source |
|---|---:|---|
| Current price | CNY 21.75 (A-shares, SHSE:600690, 2026-08-12 close, `pool-verified`) | `01` §1 |
| Enterprise value (EV) — broad cash basis, canonical | CNY 175,100.70mn | `01` §4, §7 (= market cap 190,093.35 + debt 42,076.81 + minority 9,606.03 − cash & ST investments 66,675.48) |
| FCF base (FY2025 actual, CFO − total capex) | CNY 17,151.3mn | `04` §1, verbatim (`earnings/01_historical-financials.md` §1) |
| EBITDA base (FY2025 actual) | CNY 26,543.4mn (EBIT 20,866.8 + D&A 5,676.6) | `04` §1, verbatim |
| Discount rate (WACC) used | **4.10%** (precise: 4.1045%) — risk-free rate 1.70% (China 10-yr govt bond, web-sourced, dated) + beta 0.46 × equity-risk premium 6.50% → cost of equity 4.69%; after-tax cost of debt 1.459%; weights 81.88% equity / 18.12% debt (market-value) | `04` §3, verbatim |
| Forecast horizon | 5 years explicit (FY2026–FY2030) | `04` §2, §4, verbatim |
| Terminal method | **Exit multiple: 7.0x terminal EV/EBITDA** (midpoint of Haier's own trailing TEV/EBITDA trading range, 5.9x–10.1x over the last six quarters) — this is `04`'s **canonical** terminal method, not Gordon-growth perpetuity. `04` §5 explicitly flagged Gordon growth as "unreliable" at this WACC: even a conservative 2.0% terminal growth rate blows up into an implied 24.7x terminal multiple that Haier has never traded at. Because the canonical model's terminal value is driven by a **multiple**, not a growth rate, this reverse-DCF varies the **exit multiple** (not "terminal g") in the robustness section (§4) — the parameter that actually drives `04`'s terminal value. | `04` §5, verbatim |
| Terminal value as % of EV (at the primary solve below) | 63.4% — above the 60% threshold that requires a terminal-parameter stress test (§4) | Computed, this report |

**What is held fixed vs solved for (stated once, applies throughout §2):** WACC (4.10%), the 5-year horizon, the terminal exit multiple (7.0x), and the discounting convention (mid-year, cash flows arrive on average mid-period — the same convention `04` uses) are all held fixed at `04`'s values. The **growth rate applied uniformly to FCF and EBITDA** is the variable solved for, using an executed root-finder (`scipy.optimize.brentq`) against the target: PV(explicit FCFs) + PV(terminal value) = current EV (CNY 175,100.70mn).

## 2. Implied Expectations

**Executed solver (command and output):**
```python
from scipy.optimize import brentq
WACC = 0.041045; MULT = 7.0; HORIZON = 5; EV_TARGET = 175100.70
FCF0 = 17151.3; EBITDA0 = 26543.4

def pv_total(g, wacc=WACC, mult=MULT, ebitda0=EBITDA0, fcf0=FCF0, n=HORIZON):
    pv = sum(fcf0*(1+g)**t / (1+wacc)**(t-0.5) for t in range(1, n+1))
    tv = ebitda0*(1+g)**n*mult
    return pv + tv/(1+wacc)**(n-0.5)

g_primary = brentq(lambda g: pv_total(g) - EV_TARGET, -0.30, 0.30)
# --- output ---
# Implied uniform FCF/EBITDA CAGR = -6.476%
# Check: pv_total(-0.06476) = 175,100.70  (matches EV_TARGET exactly)
```

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCF/EBITDA CAGR over the 5-year horizon (uniform annual rate, base FCF/EBITDA, base WACC, base 7.0x multiple) | **−6.48% per year** (a sustained decline, not a slower-growth story) |
| Implied years of above-trend growth before the terminal multiple applies (fade model) | **Not solvable at any N ≥ 0** — see note below |
| Implied steady-state EBIT margin (holding `04`'s own consensus revenue path fixed, solving margin instead of growth) | **4.40%** |

**Fade-model note.** The classic "years of above-average growth" construction (grow at the consensus rate, then apply the terminal multiple after N years) was tested and does not reconcile to the price at any N ≥ 0. Even applying the 7.0x terminal multiple **immediately**, to today's EBITDA, with **zero** explicit years of cash flow in between, produces an EV of roughly CNY 189,600–191,500mn — still above the current CNY 175,100.70mn EV. Executed check:
```
N=0.1 years -> EV = 191,488.1   (already above EV_TARGET = 175,100.70)
```
This means no story built on positive-or-flat growth followed by the 7.0x multiple can rationalize today's price — the price only reconciles if cash flow itself shrinks over the forecast window (the −6.48%/yr result above), or if the terminal multiple / margin is compressed well below `04`'s base assumptions (see the EBIT-margin solve and §4).

**Second solve — implied EBIT margin, holding `04`'s own consensus revenue path fixed.** Instead of flexing growth, this holds `04`'s actual FY2026–FY2030 consensus revenue forecast (CNY 309,110.7mn → 384,795.0mn), D&A%, capex%, working-capital path, and tax rate (14.1%) exactly as `04` built them, and solves for a single uniform EBIT margin (replacing `04`'s 6.60%→6.90% ramp) that reconciles PV to the current EV:
```python
# revenue, D&A, capex, ΔNWC lists taken verbatim from 04's FY2026-2030 forecast table
m_solution = brentq(lambda m: pv_at_margin(m) - EV_TARGET, -0.05, 0.10)
# --- output ---
# Implied uniform EBIT margin = 4.403%
# FY2026E FCF at implied margin = 6,735.3   (vs 04's consensus-margin FY2026E FCF of 12,569.4)
# FY2030E FCF at implied margin = 8,918.5   (vs 04's consensus-margin FY2030E FCF of 17,172.5)
```

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied FCF/EBITDA CAGR = **−6.48%/yr**, cumulative −28.4% by FY2030 | Revenue never posted a full-year decline in FY2021–FY2025 (+7.25%, +12.57%, +4.31%, +5.71%; 4-yr revenue CAGR +7.42%). FCF fell in only one year of five (FY2022, −24.06% YoY) and fully rebounded the next year (+32.8% FY2023); 4-yr FCF CAGR is +1.97%, not negative. The worst *quarterly* revenue print on record is Q1 2026's −6.86% YoY — a single quarter, not a trend (`earnings/01_historical-financials.md` §1, §3, §6) | Earnings-sensitivity's largest single-variable bear case (raw-material cost inflation) is a **one-year** EBITDA hit of −RMB5,350mn (~−20% of base EBITDA) — large, but a one-off shock case, not a construct for five consecutive years of decline; the sensitivity module never models a sustained multi-year contraction of this magnitude (`earnings/07_earnings-sensitivity.md` §2, §4) | **No** — a 5-year sustained decline of this depth has no precedent in Haier's disclosed history and is not what even the earnings module's own bear-case variables build toward |
| Implied steady-state EBIT margin = **4.40%** (holding consensus revenue growth) | 5-year EBIT margin range: 5.91% (FY2021 trough) to 7.66% (FY2024 cyclical peak); FY2025 actual 6.90% (`earnings/01_historical-financials.md` §1) | `04`'s own explicitly-constructed structural-decline/runoff scenario — triggered by the moat module's "eroding" verdict — fades margin to **5.00%** by FY2030, still 60bp *above* the 4.40% this solve requires, and that runoff scenario also cuts revenue growth and the exit multiple to 5.0x at the same time (`04` §5; `business-model/09_moat.md` §5) | **Stretch / No** — 4.40% would be a new all-time low for Haier, ~150bp below its own FY2021 trough, and more pessimistic than the DCF module's own dedicated worst-case construction |

**Judgement.** Both solves point the same direction: at `04`'s own WACC (4.10%) and terminal multiple (7.0x), today's price is not paying for slower growth — it is pricing in either a sustained five-year cash-flow *contraction* with no precedent in Haier's five-year history, or a margin collapse below the company's own worst historical year and below its own DCF module's dedicated bear case. Judged purely on the literal math, that reads as **aggressive on the pessimism side** — the market appears to be pricing in more damage than the evidence supports, which (if the WACC used is the right one) would be a genuine undervaluation signal, consistent with `04`'s own base-case finding of +37.2% upside using the consensus growth path at the same WACC and multiple.

**But this finding carries a load-bearing caveat, not a footnote.** `04` §3 itself flags that its mechanically-computed 4.10% WACC — a product of China's sub-2% sovereign bond yield and Haier's low 0.46 beta — is "materially below the discount rate the market appears to actually apply to this stock," citing Haier's own trading multiple (5.9x–10.1x TEV/EBITDA) as evidence the market prices this stock more conservatively than CAPM says it should. This report's own supplementary check confirms the same thing from the other direction: solving for the WACC that reconciles the price **at zero FCF growth** (a flat, no-decline trajectory) gives **≈12.3%**, and at Haier's own actual 4-year historical FCF CAGR (+1.97%/yr) gives **≈14.85%** — both far more plausible discount rates for a Chinese industrial than 4.10%, and far more plausible growth assumptions than a 6.5%-a-year decline. *Inference, not from filings* — these are this agent's own supplementary solves, shown for interpretation only, not substituted for the required "hold WACC fixed" primary solve above. In other words: the "aggressive pessimism" finding is at least partly a mechanical artefact of the DCF's unusually low WACC (the same artefact that made `04`'s own Gordon-growth terminal value unusable), not necessarily evidence that the market has mispriced Haier's actual prospects. Both readings are shown; neither should be taken as the whole story on its own.

**Market-ceiling sanity check — not applicable.** This check exists to test whether an implied *growth* rate requires an implausible market-share gain (§3 of the agent brief); it can only make an implied acceleration look harder, never easier. Because the primary finding here is an implied **decline** (or a margin *compression*), not an implied growth acceleration, there is no market-share ceiling to test against — a shrinking or margin-compressing company requires no market-share gain at all. The check is skipped for this structural reason, not because market-size data is unavailable.

## 4. Robustness

**Discount rate:**

| Discount Rate | Implied FCF/EBITDA CAGR to Justify Price |
|---|---:|
| WACC − 1% (3.10%) | −7.27%/yr |
| WACC (4.10%, base) | **−6.48%/yr** |
| WACC + 1% (5.10%) | −5.69%/yr |

Spread across the WACC band: 1.58 percentage points (pp).

**FCF/EBITDA base** (low/base/high band sourced from `earnings/07_earnings-sensitivity.md` §2, §4's single highest-magnitude variable — raw-material commodity cost inflation, ±RMB5,350mn EBITDA, tax-adjusted at `04`'s normalized 14.1% rate to a ±RMB4,595.7mn FCF-equivalent swing; a simplification that ignores any capex/working-capital offset, labelled):

| FCF Base | Value (CNY mn) | Implied FCF/EBITDA CAGR to Justify Price |
|---|---:|---:|
| Low (base − raw-material bear-case impact, after-tax) | 12,555.6 (EBITDA 21,193.4) | −0.72%/yr |
| Base (FY2025 actual, `04`'s base) | 17,151.3 (EBITDA 26,543.4) | **−6.48%/yr** |
| High (base + raw-material bull-case impact, after-tax) | 21,746.9 (EBITDA 31,893.4) | −10.99%/yr |

Spread across the FCF-base band: 10.28pp — **more than 6x the WACC band's spread.** As in prior modules, **the FCF base is the dominant sensitivity, not the discount rate**: whether the implied expectation reads as "roughly flat" (−0.7%/yr, at the high end of the plausible near-term FCF base) or "a severe multi-year contraction" (−11.0%/yr, at the low end) depends far more on which year's cash flow is treated as the true run-rate than on any reasonable WACC move.

**Terminal-value stress (required — TV is 63.4% of EV at the primary solve, above the 60% threshold).** Because `04`'s canonical terminal method is an **exit multiple**, not Gordon-growth perpetuity (§1), this report varies the **exit multiple** ±1.0x in place of "terminal g ±0.5%" — the parameter that actually drives `04`'s terminal value:

| Exit Multiple | Implied FCF/EBITDA CAGR to Justify Price |
|---|---:|
| 6.0x (−1.0x) | −4.30%/yr |
| 7.0x (base) | **−6.48%/yr** |
| 8.0x (+1.0x) | −8.37%/yr |

Spread across the multiple band: 4.07pp — between the WACC-driven spread and the FCF-base-driven spread. **Ranking the three: FCF base (10.28pp) > exit multiple (4.07pp) > WACC (1.58pp).** The FCF base is by a wide margin the input this solve is most sensitive to.

## 5. What's-Priced-In Read

At CNY 21.75, and holding `04`'s own WACC (4.10%) and terminal 7.0x exit multiple fixed, the market is pricing in a **sustained ~6.5%-a-year contraction in FCF and EBITDA through FY2030** (cumulative −28.4%) — or, equivalently, an EBIT margin collapsing to 4.40%, a new low below Haier's own FY2021 trough (5.91%) and below `04`'s own dedicated structural-decline bear case (5.00%). Neither has a precedent in Haier's disclosed five-year history, where revenue has never posted a full-year decline and FCF fell in only one of five years before fully rebounding — so, taken literally, this reads as **aggressive on the pessimism side**, consistent with `04`'s own base-case DCF finding of +37.2% upside on the consensus growth path.

That said, the finding is entangled with a mechanical quirk this report cannot fully separate out: `04` itself flags its 4.10% WACC as unusually low relative to the discount rate Haier's own trading history implies (5.9x–10.1x EV/EBITDA), and this report's own supplementary check shows that a flat, no-growth FCF trajectory reconciles to today's price at a WACC of ~12.3% — a far more ordinary discount rate for a China-listed industrial than 4.10%. The honest read is therefore two-sided: **either** the market is pricing genuine, historically-unprecedented pessimism into Haier's cash flows, which would be a real margin-of-safety signal, **or** the market is simply discounting ordinary (even flat) cash flows at a materially higher rate than `04`'s CAPM-derived WACC — in which case this reverse-DCF's "aggressive decline" finding is largely an artefact of the low-WACC model it is required to invert, not proof of a genuine mispricing. This report cannot adjudicate between the two without a directly observed market discount rate; the master synthesizer should weigh this alongside `04`'s own low-WACC caveat and the cross-method dispersion in `07`, not treat the −6.48%/yr figure as a standalone conviction driver.
