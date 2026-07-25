# Reverse DCF — What's Priced In — TSLA

**Method note.** This agent inverts `04_intrinsic-dcf.md`'s own model rather than building an independent one. The discount rate (WACC), the normalized free cash flow (FCF — cash the operating business throws off after the investment needed to run and grow it) base, the terminal growth rate, the forecast horizon, and the discounting convention are all taken **verbatim** from `04`, per the module's hard rule (MODULE_RULES Calculation Standard 9). Nothing here re-derives a WACC or uses a different FCF base — that would make the two DCFs non-comparable.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $319.69 (2026-07-23, `pool-verified`) | `01_price-and-capital-structure.md` §1 |
| Enterprise value (EV — the value of the whole business: what it would cost to buy all its equity and debt) | $1,235,847.8mm (canonical, broad cash basis) | `01_price-and-capital-structure.md` §4/§7. (Alternate: $1,264,152.8mm on the strict cash basis, 2.3% higher — using this alternate target moves the primary solve below from 68.9% to 69.5% implied CAGR, an immaterial difference; canonical broad-basis EV is used throughout.) |
| FCF (normalized) base | $5,762mm (TTM through Jun-30-2026) | `04_intrinsic-dcf.md` §1, verbatim — no normalization adjustment was found necessary (`earnings/06_earnings-quality.md` §1 checked and found no one-off or company-defined add-back distorting this figure) |
| Discount rate (WACC — the blended annual return the company must earn on its capital, given its mix of equity and debt, to justify the risk of investing in it) used | 12.38% (`k_e` = 12.44% = 4.7% risk-free rate + 1.80 beta × 4.3% equity-risk premium; after-tax cost of debt 4.44%; weights 99.27% equity / 0.73% debt) | `04_intrinsic-dcf.md` §3, verbatim |
| Terminal growth rate (g) | 1.0% nominal (financeable-growth-constrained — the mechanical 3.5% GDP-proxy rate was rejected because it required more reinvestment than Tesla's modeled return on capital could finance) | `04_intrinsic-dcf.md` §5, verbatim |
| Forecast horizon | 7 years (FY2026–FY2032) | `04_intrinsic-dcf.md` §2, verbatim |
| Discounting convention | Mid-year (cash flows assumed to land, on average, mid-period; discounted at t−0.5) | `04_intrinsic-dcf.md` §4, verbatim |

## 2. Implied Expectations

**What is held fixed:** WACC (12.38%), terminal growth (1.0%), the discounting convention (mid-year), the forecast horizon (7 years), and the FCF base ($5,762mm TTM). **What is solved for:** the constant annual FCF growth rate applied to the base for 7 years (with the cash flow at the end of year 7 feeding a Gordon-growth terminal value at the fixed 1.0% terminal g) that makes the present value of the whole stream equal today's enterprise value ($1,235,847.8mm).

**Executed solve (Python, `scipy.optimize.brentq`):**

```
$ python3 -c "
from scipy.optimize import brentq
WACC=0.1238; g_terminal=0.01; FCF0=5762.0; target_EV=1235847.8; years=7
def pv_ev(g):
    pv=0.0
    for t in range(1,years+1):
        pv += FCF0*(1+g)**t / (1+WACC)**(t-0.5)
    fcf_next = FCF0*(1+g)**years*(1+g_terminal)
    TV = fcf_next/(WACC-g_terminal)
    return pv + TV/((1+WACC)**(years-0.5))
root = brentq(lambda g: pv_ev(g)-target_EV, 0.5, 0.7, xtol=1e-10)
print('Implied 7yr FCF CAGR:', root, f'{root*100:.2f}%')
print('Check PV:', pv_ev(root))
"
Implied 7yr FCF CAGR: 0.688771303650395 68.88%
Check PV: 1235847.7999898933
```

At this root, PV of the 7-year explicit stream is $297,704mm and PV of the terminal value is $938,144mm — the terminal value is **75.9% of the implied EV**, above the module's 60% terminal-dominance trigger, so terminal `g` is also stressed in §4.

| What the Price Implies | Solved Value | What was held fixed |
|---|---:|---|
| Implied FCF CAGR over the 7-year horizon | **68.9%** | WACC 12.38%, terminal g 1.0%, FCF base $5,762mm, mid-year convention |
| Implied years of Tesla's own best-ever historical annual growth rate (51.4%, FY2022) needed before fading to the same 1.0% terminal | **≈9.3 years** | Same WACC/terminal-g/base/convention; growth rate fixed at Tesla's own FY2022 print instead of solved |
| Implied steady-state EBIT margin, holding `04`'s own guided/consensus revenue and capex path fixed (FY2026–FY2032 revenue $105bn→$185bn, per `04` §4) | **>100% of revenue — not solvable within the feasible [0,100%] range** | Same WACC/terminal-g/convention; `04`'s own revenue and capex dollars held fixed; solved for the flat EBIT margin applied to that revenue path instead of a growth rate |

**Executed solve for the second row (years-at-peak-growth):**

```
$ python3 -c "
WACC=0.1238; g_terminal=0.01; FCF0=5762.0; target=1235847.8; g_high=0.514
def total(N):
    pv=0.0
    for t in range(1,N+1):
        pv += FCF0*(1+g_high)**t/(1+WACC)**(t-0.5)
    fcf_next = FCF0*(1+g_high)**N*(1+g_terminal)
    TV = fcf_next/(WACC-g_terminal)
    return pv + TV/((1+WACC)**(N-0.5))
print(9, total(9)); print(10, total(10))
"
9 1115340.76
10 1510832.73
```
(Target 1,235,847.8 falls 30% of the way between the N=9 and N=10 values → **≈9.3 years**.)

**Executed solve for the third row (implied margin on `04`'s own revenue/capex path):**

```
$ python3 -c "
from scipy.optimize import brentq
WACC=0.1238; g_terminal=0.01; tax=0.26; target=1235847.8
years_data=[(105415,9445,26248,412),(119592,10572,26310,552),(139868,13763,25176,789),
            (153855,14616,20001,545),(166163,14955,17447,479),(176133,15324,16733,388),
            (184940,15720,16275,343)]
def total_pv(m):
    pv=0.0
    for t,(rev,da,capex,dnwc) in enumerate(years_data, start=1):
        fcff = rev*m*(1-tax)+da-capex-dnwc
        pv += fcff/(1+WACC)**(t-0.5)
    rev32=years_data[-1][0]; da32p=years_data[-1][1]/rev32; capex32p=years_data[-1][2]/rev32
    rev33=rev32*(1+g_terminal); da33=da32p*rev33; capex33=capex32p*rev33
    dnwc33=0.0389*(rev33-rev32)
    fcff33=rev33*m*(1-tax)+da33-capex33-dnwc33
    TV=fcff33/(WACC-g_terminal)
    return pv + TV/((1+WACC)**(7-0.5))
print(total_pv(1.00))   # margin = 100% of revenue, the theoretical ceiling
root=brentq(lambda m: total_pv(m)-target, 0.01, 5.0, xtol=1e-9)
print('Implied margin:', f'{root*100:.2f}%')
"
1026364.49
Implied margin: 119.49%
```

A 100%-of-revenue EBIT margin — every dollar of revenue converting straight to pre-tax profit, with zero cost of goods, opex, or overhead — still only reaches $1,026,364mm of PV, short of the $1,235,848mm target. The margin channel alone, on Tesla's own guided revenue path, **cannot** get to today's price at any economically possible level. This confirms growth (not margin) is the only lever the market could be pricing in, and §3 tests whether that lever is credible.

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied FCF CAGR = 68.9% sustained for 7 years | FY2021–FY2025 revenue CAGR = 15.2% (from $53,823mm to $94,827mm) [`earnings/01_historical-financials.md` §1]; FY2025 revenue growth was **negative** (−2.9%); TTM growth is +11.8% [`earnings/01` §2]. FCF itself has ranged $3,581mm (FY2024) to $7,561mm (FY2022) — a volatile, non-monotonic series with a 4-year CAGR of only ~5.7% [`earnings/01` §1] | `earnings/07_earnings-sensitivity.md` §2 sizes the six largest identified swing factors (FX, delivery volume, opex ratio, SBC, energy margin, regulatory credits) at $292mm–$1,640mm of annualized EBITDA impact each — on a base LTM EBITDA of $10,755mm, these are single-digit-percent moves, nowhere near the step-change implied by a 68.9% CAGR | **No** |
| ≈9.3 years of Tesla's own best-ever annual growth rate (51.4%, FY2022) | Tesla has sustained anything close to 50%+ growth for at most 2 consecutive years (FY2021 +70.7% off a depressed pandemic base, FY2022 +51.4%) before decelerating every single year since (FY2023 +18.8%, FY2024 +0.9%, FY2025 −2.9%) [`earnings/01` §1] | `business-model/09_moat.md` §5: "No moat proven" — return on capital (2.75%–3.7% LTM) sits below the ~11.5%–12.4% cost of capital, and the moat trajectory is **eroding**, not strengthening (ROIC fell every year for 3 straight years); `business-model/07_business-quality.md`'s rate-of-change/disruption score is 30/100 (RF-BQ-005) | **No** |
| >100%-of-revenue EBIT margin (holding `04`'s revenue path fixed) — economically impossible | Tesla's own best-ever EBIT margin was 16.8% (FY2022); it has fallen every year since to 4.6% (FY2025) [`earnings/01` §1] | `business-model/09_moat.md` §3: gross margin, EBIT margin, and ROIC have all deteriorated for three consecutive years; the FSD/robotaxi/Optimus technology asset "has not lifted the return on capital" and "carries no disclosed revenue line yet" | **No — not economically achievable at any level** |

The market's implied expectations are **aggressive**, not conservative or fair. Tesla's own best-documented historical growth (a two-year burst of 51–71% off a depressed base, immediately followed by deceleration every year through FY2025's outright revenue decline) sits far below the 62%–81% sustained CAGR band this solve requires (§4), and the earnings-module sensitivity evidence shows the currently-quantified swing factors moving profitability by low-single-digit percentages of EBITDA, not the multi-hundred-percent step-change the price requires. The moat module's own finding — return on capital below cost of capital, and falling for three straight years, with no evidenced monetization of the AI/robotics bet that would need to arrive to power this growth — directly contradicts the durability the price requires.

**Market-ceiling sanity check.** Tesla is an Operating business (not Financial/REIT), so the revenue-size test applies. Converting the primary solve (68.9% FCF CAGR) to a revenue trajectory — holding the current TTM FCF-to-revenue conversion (5.762/103.619 = 5.56%) flat, so FCF growth = revenue growth — implies revenue reaching **≈$4.06 trillion by FY2032** (year 7 of the horizon: $103,619mm × 1.6888^7). The global automotive market was estimated at **≈$2.75 trillion in 2025**, projected to reach roughly $3.3–5.3 trillion by 2030–2032 at a base-case ~3.5% CAGR (Mordor Intelligence market-size estimate, web-sourced, dated 2026; a low-tier, unverified input, cited because no better addressable-market figure exists in the pool). Even at the high end of that market-growth range, Tesla's implied FY2032 revenue would require capturing **75–100%+ of the entire global automotive industry** — a share no automaker in history has ever held (Tesla's own 2025 global BEV share was 8.8%, already below BYD's 12.1% [`business-model/09_moat.md` §5, citing `08_competitive-map.md` §3]). This is a kill signal on market-ceiling grounds alone, independent of the company-history read above: **the growth channel that could theoretically justify today's price requires Tesla to out-produce and out-sell the entire existing global automotive industry**, not merely take share from it. This check can only make the implied growth look harder, and it does — it does not offset the finding above.

## 4. Robustness

| Discount Rate | Implied FCF CAGR to Justify Price |
|---|---:|
| WACC −1% (11.38%) | 65.72% |
| WACC (12.38%, base) | 68.88% |
| WACC +1% (13.38%) | 71.90% |

Spread: **6.18 percentage points** (65.72%–71.90%).

| FCF Base | Implied FCF CAGR to Justify Price |
|---|---:|
| Low ($3,581mm — FY2024 annual trough, the lowest FCF year in the 5-year history) [`earnings/01_historical-financials.md` §1] | 81.38% |
| Base ($5,762mm — TTM through Jun-30-2026, the `04`-canonical base) | 68.88% |
| High ($7,561mm — FY2022 annual peak, the highest FCF year in the 5-year history) [`earnings/01` §1] | 62.07% |

Spread: **19.31 percentage points** (62.07%–81.38%) — roughly **3x** the WACC-driven spread.

**Terminal growth (g) ±0.5%** — shown because terminal value is 75.9% of the implied EV (§2), above the module's 60% terminal-dominance trigger:

| Terminal g | Implied FCF CAGR to Justify Price |
|---|---:|
| g −0.5% (0.5%) | 69.80% |
| g (1.0%, base) | 68.88% |
| g +0.5% (1.5%) | 67.91% |

Spread: **1.89 percentage points** (67.91%–69.80%) — the smallest of the three.

**Dominant sensitivity: the FCF base, not the discount rate.** The FCF-base swing (19.3pp) is more than 3x the WACC swing (6.2pp) and roughly 10x the terminal-g swing (1.9pp). This matters for the read in §3: even at the *most favorable* FCF-base reading (the FY2022 peak, $7,561mm) and the *most favorable* WACC (11.38%), the price still implies a 7-year FCF CAGR in the 55–65% range (interpolating the two grids) — still 3–4x above Tesla's own best-ever sustained multi-year growth rate (15.2% over FY2021–FY2025) and still requires the market-share-versus-global-auto-industry outcome flagged in §3. No combination of inputs inside a defensible range closes this gap.

## 5. What's-Priced-In Read

At $319.69, the market is pricing in a **68.9% compound annual FCF growth rate sustained for 7 years** (or, equivalently, Tesla's own best-ever historical growth rate of 51.4% sustained for roughly **9.3 years** — about 4-5x longer than the ~2 years it has ever actually sustained a rate near that before decelerating to outright revenue decline). That is **aggressive, bordering on unachievable**, because (1) it sits far outside Tesla's own 15.2% five-year historical revenue CAGR and outright FY2025 revenue decline, (2) the moat module finds return on capital below the cost of capital and falling for three straight years with "No moat proven," directly undercutting any durability argument for a multi-year hyper-growth run, and (3) the market-ceiling check shows the implied revenue trajectory would require Tesla to capture the majority-to-entirety of the current global automotive industry by FY2032, a share no automaker has ever held. The gap between this reverse-DCF's implied growth and what `04_intrinsic-dcf.md`'s own forward model treats as achievable (a base-case intrinsic value of $8.02/share, ~97.5% below the current price) is not a modeling artifact on either side — it is the same underlying finding read from both directions: the price is not being supported by anything this research program can find in Tesla's cash-flow economics today.
