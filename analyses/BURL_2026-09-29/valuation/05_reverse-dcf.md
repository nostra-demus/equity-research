# Reverse DCF — What's Priced In — BURL

Burlington Stores is a U.S. GAAP operating retailer. Amounts below are USD millions except per-share data and percentages. This report uses the same FCFF (free cash flow to all capital providers) mechanics, financial-debt EV bridge, five-year horizon, 2.5% terminal growth and mid-year discounting convention as `04_intrinsic-dcf`; it does not estimate a standalone fair value.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $254.69 at the September 28, 2026 NYSE close; pool-verified | [Capital IQ Comps→Financial Data, “Day Close Price Latest” (subject row), 2026-09-28; CIQ facts sidecar; Valuation 01 Price & Capital Structure, §1] |
| Enterprise value | $17,210.3m | Financial-debt EV: market cap $15,994.5m + financial debt $1,919.5m − cash $703.7m. [Valuation 01 Price & Capital Structure, §4] |
| FCFF base | $353.8m, FY2026 | First explicit FCFF in `04`’s NOPAT + D&A − capex − ΔNWC model. It is the fixed starting base for the primary solve. [Valuation 04 Intrinsic DCF, §4] |
| Discount rate (WACC) used | 10.2553% | CAPM cost of equity 11.1188%, after-tax debt cost 3.0602%, and 89.28% / 10.72% equity / debt weights. [Valuation 04 Intrinsic DCF, §§3–4] |
| Terminal growth | 2.5% | Gordon-growth terminal value. [Valuation 04 Intrinsic DCF, §§2, 5] |
| Forecast horizon and convention | FY2026–FY2030; five explicit years; mid-year discounting | Cash flows are discounted at `t − 0.5`. [Valuation 04 Intrinsic DCF, §4] |

`04` also reports $357.0m normalized operating FCF and $412.5m reported CFO-minus-capex FCF for the LTM. Those are cash-flow cross-checks, not the unlevered FCFF input, so neither replaces the $353.8m FCFF base in the primary solve. [Valuation 04 Intrinsic DCF, §1]

## 2. Implied Expectations

The primary solve holds the $353.8m FY2026 FCFF base, 10.2553% WACC, 2.5% terminal growth, five-year horizon and mid-year convention fixed. It solves one variable: a constant FY2026–FY2030 FCFF growth rate. The valuation equation is:

`EV(g) = Σ[t=1..5] $353.8 × (1 + g)^(t−1) / (1 + 10.2553%)^(t−0.5) + [$353.8 × (1 + g)^4 × 1.025 / (10.2553% − 2.5%)] / (1 + 10.2553%)^4.5`.

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCFF CAGR over FY2026–FY2030 | **46.75%** |
| Implied FY2030 FCFF | **$1,640.8m** |
| Implied years of above-terminal-growth cash-flow growth | **Five of five explicit years**; the primary solve has no separate fade stage before the 2.5% terminal rate |
| Implied steady-state EBIT margin | **13.85%** in a secondary solve that holds `04`’s revenue, D&A, capex, NWC, tax, WACC, terminal growth and convention fixed, then solves for one uniform FY2026–FY2030 EBIT margin |
| PV of terminal value / implied EV | **81.21%** in the primary growth solve |

The 46.75% result produces FCFF of $353.8m, $519.2m, $761.9m, $1,118.1m and $1,640.8m across FY2026–FY2030. It is a constant-growth expression of the price, not a claim that the market literally forecasts that exact annual pattern. The secondary 13.85% margin solve is an alternative way to meet the same EV with `04`’s revenue path; if only FY2030 margin were allowed to change while the first four `04` FCFF years stayed fixed, the required FY2030 EBIT margin rises to 15.48%. Both are inference from the model, not filing facts.

The primary price-equivalent FCFF growth requires $1,640.8m in FY2030, versus $850.5m in `04`’s base path: 92.9% higher. `04`’s own FY2026–FY2030 FCFF path compounds at 24.52%, less than the 46.75% constant-growth result. [Valuation 04 Intrinsic DCF, §4]

## 2A. Implied Discount Rate — the dual solve (always run this)

The mirror solve holds `04`’s exact FCFF path of $353.8m, $512.2m, $737.5m, $836.0m and $850.5m; its 2.5% terminal growth; five-year horizon; and mid-year convention fixed. It solves for the discount rate that gives the same $17,210.3m EV.

| Solve | Held fixed | Solved value |
|---|---|---:|
| Implied discount rate at `04`’s base-case cash flows | `04` FCFF path, terminal `g`, horizon and mid-year convention | **6.95%** |
| `04`’s model WACC (for comparison) | — | **10.26%** |
| Ratio (implied ÷ model) | — | **0.677x** |

The equivalent implied rate is 3.31 percentage points below the model WACC, not more than 1.5x above it; therefore the special “market prices a collapse” escalation does not apply. This result is the input for `04` §3A: it cuts toward either cash flows above `04`’s path or a lower required return, not toward a market-implied cash-flow collapse. [Valuation 04 Intrinsic DCF, §§3A, 4]

Price cannot identify which variable is wrong. If the debt cost and capital weights were mechanically retained, a 6.95% WACC would imply a 7.41% cost of equity and a residual 1.53% equity-risk premium at the model’s 1.42 beta and 5.24% risk-free rate. That is materially below the 4.14% ERP in `04`, so the lower-rate reading is not directly supported by the available risk inputs; this is an inference, not evidence that the market actually uses a 6.95% rate. No scope-matched company discount rate was disclosed to settle the question, and the 6.2% lease rate is not a group WACC comparator. [Valuation 04 Intrinsic DCF, §§3, 3A]

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| FCFF CAGR of 46.75% over FY2026–FY2030 | FCF was $149.0m, $376.1m, ($17.0m) and $171.6m in FY2022–FY2025, then $412.5m LTM. A multi-year FCF CAGR is not meaningful because FY2024 was negative. [Earnings 01 Historical Financials, §§1–2] | `04`’s cash path reaches $850.5m in FY2030, a 24.52% FY2026–FY2030 FCFF CAGR. Earnings sensitivities identify merchandise margin/markdowns and SG&A leverage as the largest quantified quarterly variables; the $55.5m Q2 tariff refund is planned to be reinvested rather than retained. [Valuation 04 Intrinsic DCF, §4; Earnings 07 Earnings Sensitivity, §§2–6] | **Stretch — not proven from available data.** |
| Uniform EBIT margin of 13.85% through FY2026–FY2030 | BURL’s CIQ-standard EBIT margin was 7.5% in FY2025 and 7.8% LTM. [Earnings 01 Historical Financials, §§1–2] | `04` uses 8.10%, 8.42%, 8.97%, 9.00% and 9.00% EBIT margins for FY2026–FY2030. BURL’s LTM 7.8% margin is below Ross’s 12.7% and TJX’s 12.2%; the moat report does not establish a sustained economic spread. [Valuation 04 Intrinsic DCF, §2; Business Model 09 Moat, §§3–5] | **Not proven; aggressive margin requirement.** |

The 46.75% FCFF requirement is aggressive against the cash-flow record and against `04`’s already growth-heavy 24.52% FCFF path. The comparison uses the same metric where possible: unstable reported FCF means it does not claim a false historical FCF CAGR, while revenue growth is only an indirect scale check. FY2022–FY2025 revenue grew at a 9.97% CAGR and FY2025-to-LTM revenue grew 5.62%; those figures do not by themselves test FCFF growth. [Earnings 01 Historical Financials, §§1–2]

The operating evidence does show possible levers—new stores, sourcing flexibility, merchandise margin and SG&A leverage—but it does not establish five years of 46.75% FCFF compounding or a 13.85% EBIT margin. The narrower structural moat, sub-peer current EBIT margin, consumer/markdown sensitivity and material store and supply-chain reinvestment make the requirement a stretch rather than a proven base case. [Business Model 09 Moat, §§3–5; Business Model 07 Business Quality, §§1–4; Earnings 07 Earnings Sensitivity, §§2–6]

### Market-ceiling sanity check

For an operating-business scale check only, holding FY2026 FCFF conversion fixed at 2.758% of `04`’s $12,828.7m revenue turns the 46.75% FCFF solve into a $59,495.4m FY2030 revenue equivalent, 363.8% above FY2026. This is an inference, not a forecast: a higher FCFF conversion would lower the revenue required. The frozen pool contains no credible, dated off-price/apparel addressable-market size or category-revenue series, so a market-share or incremental-market capture test is **not assessable** and is not invented. [Valuation 04 Intrinsic DCF, §§2, 4]

## 4. Robustness

| Discount Rate | Implied FCFF CAGR to Justify Price |
|---|---:|
| WACC −1% (9.2553%) | 40.91% |
| WACC (10.2553%) | 46.75% |
| WACC +1% (11.2553%) | 52.20% |

| FCFF starting-point robustness | Cash-flow base | Implied FCFF CAGR to Justify Price |
|---|---:|---:|
| Low / canonical | $353.8m FY2026 FCFF | 46.75% |
| Base / normalized operating-FCF cross-check | $357.0m | 46.39% |
| High / literal CFO-minus-capex FCF | $412.5m | 40.81% |

The $357.0m and $412.5m figures are mechanically stress-tested starting cash amounts only; they have different levered/unlevered definitions and do not replace `04`’s $353.8m FCFF base. Across the specified tests, WACC is the larger driver: the ±1 percentage-point WACC range changes implied growth by 11.29 percentage points, versus 5.94 points across the stated $353.8m–$412.5m cash-flow range. [Valuation 04 Intrinsic DCF, §§1, 4]

`04`’s terminal value is 74.35% of its EV and the primary reverse-growth solve is 81.21% terminal value, so terminal-growth robustness is required.

| Terminal growth | Implied FCFF CAGR to Justify Price |
|---|---:|
| 2.0% (−0.5%) | 48.91% |
| 2.5% | 46.75% |
| 3.0% (+0.5%) | 44.47% |

The following executed bisection solver produced the primary, robustness, dual-rate and margin roots above. It uses the exact mid-year convention from `04`.

```text
$ /usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
EV,W,g0=17210.3,.10255319,.025
F0=353.8
path=[353.8,512.2,737.5,836.0,850.5]
rev=[12828.72198,13975.10768,15420.00842,16191.008841,16838.649195]
da=[468.7047,527.82702,616.21611,.04*rev[3],.04*rev[4]]
cap=[875,.063*rev[1],.058*rev[2],.055*rev[3],.05624*rev[4]]
nwc=[11566.91*.012533]+[x*.012533 for x in rev]

def root(f,lo,hi):
    a,b=lo,hi; fa,fb=f(a),f(b)
    assert fa*fb<0,(fa,fb)
    for _ in range(250):
        m=(a+b)/2; fm=f(m)
        if fa*fm<=0:b,fb=m,fm
        else:a,fa=m,fm
    return (a+b)/2

def pvgrowth(x,w=W,b=F0,tg=g0):
    f=[b*(1+x)**i for i in range(5)]
    pv=sum(v/(1+w)**(i-.5) for i,v in enumerate(f,1))
    pvtv=f[-1]*(1+tg)/(w-tg)/(1+w)**4.5
    return pv+pvtv,pvtv,f

def pvpath(w):
    pv=sum(v/(1+w)**(i-.5) for i,v in enumerate(path,1))
    pvtv=path[-1]*(1+g0)/(w-g0)/(1+w)**4.5
    return pv+pvtv,pvtv

def pvmargin(m):
    f=[r*m*(1-.253)+d-c-(nwc[i+1]-nwc[i]) for i,(r,d,c) in enumerate(zip(rev,da,cap))]
    pv=sum(v/(1+W)**(i-.5) for i,v in enumerate(f,1))
    pvtv=f[-1]*(1+g0)/(W-g0)/(1+W)**4.5
    return pv+pvtv,pvtv,f

for name,w in [('WACC-1%',W-.01),('WACC',W),('WACC+1%',W+.01)]:
    x=root(lambda x:pvgrowth(x,w)[0]-EV,-.5,2); print(name,format(x,'.6%'))
for name,b in [('FY26_FCFF_low',353.8),('norm_operating_FCF_crosscheck',357),('reported_CFO_capex_FCF_high',412.5)]:
    x=root(lambda x:pvgrowth(x,W,b)[0]-EV,-.5,2); print(name,format(x,'.6%'))
for name,tg in [('terminal_g-0.5%',.02),('terminal_g',.025),('terminal_g+0.5%',.03)]:
    x=root(lambda x:pvgrowth(x,W,F0,tg)[0]-EV,-.5,2); print(name,format(x,'.6%'))
x=root(lambda x:pvgrowth(x)[0]-EV,-.5,2); ev,pvtv,f=pvgrowth(x)
r=root(lambda r:pvpath(r)[0]-EV,.0250001,.5)
m=root(lambda m:pvmargin(m)[0]-EV,0,.5); _,_,fm=pvmargin(m)
print('growth_root',format(x,'.10%'),'FY30_FCFF',format(f[-1],'.1f'),'TV_EV',format(pvtv/ev,'.2%'))
print('rate_root',format(r,'.10%'),'rate_ratio',format(r/W,'.3f')+'x')
print('margin_root',format(m,'.10%'),'FY30_FCFF',format(fm[-1],'.1f'))
PY
WACC-1% 40.907688%
WACC 46.748962%
WACC+1% 52.201876%
FY26_FCFF_low 46.748962%
norm_operating_FCF_crosscheck 46.394879%
reported_CFO_capex_FCF_high 40.807065%
terminal_g-0.5% 48.910327%
terminal_g 46.748962%
terminal_g+0.5% 44.472190%
growth_root 46.7489617700% FY30_FCFF 1640.8 TV_EV 81.21%
rate_root 6.9465166246% rate_ratio 0.677x
margin_root 13.8539329743% FY30_FCFF 1461.0
```

## 5. What's-Priced-In Read

At $254.69, the price requires a 46.75% FCFF CAGR from FY2026 through FY2030 on the same WACC, terminal growth and discounting convention as `04`, reaching $1.641bn of FY2030 FCFF. That is aggressive and not proven from the available data: it is 92.9% above `04`’s FY2030 FCFF path and the alternative revenue-path solve needs a 13.85% EBIT margin versus BURL’s 7.8% LTM margin. [Valuation 04 Intrinsic DCF, §§2, 4; Business Model 09 Moat, §3]

Holding `04`’s cash-flow path fixed instead reconciles the price at a 6.95% discount rate, 0.677x the model WACC, so the price reflects substantially stronger cash generation, a materially lower required return, or both; the available evidence supports neither explanation strongly enough to call the implied expectations conservative.
