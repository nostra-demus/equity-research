# Reverse DCF — What's Priced In — V

## 1. Inputs

Visa Inc. is an operating company reporting in USD under U.S. GAAP. This reverse DCF uses the exact enterprise-value (EV) framework, strict-cash EV bridge, five-year horizon, 3.0% terminal growth, and mid-year discounting convention used in `04_intrinsic-dcf`. The price is pool-verified, so the reverse solve can run, but it is 26 U.S. trading days stale; it remains the canonical anchor and brings the valuation-confidence maximum of 60. [Valuation 01, §§1, 4, 7; Capital IQ Comps → Financial Data, Visa subject row, 2026-08-17; `ciq_facts.json` `current_price`]

| Input | Value | Source |
|---|---:|---|
| Current price | $364.15 per V share, NYSE, day close on 2026-08-17; pool-verified but 26 trading days stale | [Capital IQ Comps → Financial Data, Visa subject row, 2026-08-17; `ciq_facts.json` `current_price`; Valuation 01, §§1, 7] |
| Enterprise value | $680,448.9m, strict-cash basis | [Valuation 01, §§4, 7; Visa Q3 FY26 Form 10-Q, pp. 4, 14, 17–18] |
| FCF base | $21,013m LTM to 2026-06-30: $22,580m CFO − $1,567m total capex; no cash-flow normalization/add-back | [Valuation 04, §1; CIQ Financials → Cash Flow, LTM 2026-06-30; `ciq_facts.json` `ltm_ocf_m`] |
| Discount rate (WACC) used | 9.04%: 5.11% risk-free rate + 1.00 beta × 4.14% ERP, with debt and preferred weights | [Valuation 04, §3] |
| Forecast horizon | Five fiscal years, FY27–FY31; mid-year discounting | [Valuation 04, §4] |
| Terminal inputs held fixed | 3.0% terminal growth and 22.4% ROIC; terminal FCFF is reduced for the reinvestment needed to fund terminal growth | [Valuation 04, §5; Business Model 09, §3] |

The reported and normalized FCF base are the same $21,013m because `04` made no add-back. This matters for the base sensitivity below: a separate low/high normalized-base band does not exist in the forward DCF and is not invented here. [Valuation 04, §1]

## 2. Implied Expectations

The primary solve holds the 9.04% WACC, 3.0% terminal growth, 22.4% terminal ROIC, five-year horizon, mid-year convention, 62.5%/63.0% EBIT-margin path, 17.6% tax rate, 3.0% D&A/revenue, 3.5% capex/revenue, and the FY27–FY31 working-capital path fixed. It solves one uniform addition to each of `04`'s annual revenue-growth rates (12%, 10%, 8%, 6%, 5%). This keeps the same operating DCF mechanics rather than substituting a flat, independently derived FCF model. *Inference, not from filings.* [Valuation 04, §§2, 4–5]

Executed solver (Python 3.12; USD millions; bisection root finding):

```bash
/usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -c 'EV=680448.9;w=.090393;tg=.03;ro=.224;R0=45743.58;gs=[.12,.10,.08,.06,.05];ms=[.625,.63,.63,.63,.63];wc=[.015,.01,.007,.005,.004];tax=.176
def M(d,w=w,tg=tg):
 R=R0;fs=[];ns=[]
 for a,m,q in zip(gs,ms,wc): R*=1+a+d;n=R*m*(1-tax);ns+=[n];fs+=[n+R*.03-R*.035-R*q]
 df=[1/(1+w)**(i-.5) for i in range(1,6)];f6=ns[-1]*(1+tg)*(1-tg/ro);return sum(a*b for a,b in zip(fs,df))+f6/(w-tg)*df[-1],R,fs[-1]
def B(F,l,h):
 for _ in range(200):
  z=(l+h)/2
  if F(l)*F(z)<=0:h=z
  else:l=z
 return (l+h)/2
d=B(lambda x:M(x)[0]-EV,-.2,.5);x=M(d);print(f"growth_delta={d:.6%}; implied_FCF_CAGR={(x[2]/21013)**.2-1:.6%}; FY31_revenue={x[1]:.3f}; FY31_FCF={x[2]:.3f}; EV={x[0]:.3f}")
fs=[25360,28410,30866,32847,34557];f6=31370.285
def E(r):
 df=[1/(1+r)**(i-.5) for i in range(1,6)];return sum(a*b for a,b in zip(fs,df))+f6/(r-tg)*df[-1]
r=B(lambda x:E(x)-EV,.031,.25);print(f"implied_WACC={r:.6%}; ratio_to_model={r/w:.6%}; EV={E(r):.3f}")'
```

Root returned: `growth_delta=9.019646%; implied_FCF_CAGR=19.674024%; FY31_revenue=101114.906; FY31_FCF=51580.736; EV=680448.900`.

| What the Price Implies | Solved Value |
|---|---:|
| Uniform addition to `04`'s FY27–FY31 revenue-growth path | +9.02 percentage points |
| Implied annual revenue growth, FY27 / FY28 / FY29 / FY30 / FY31 | 21.02% / 19.02% / 17.02% / 15.02% / 14.02% |
| Implied revenue CAGR, FY26E anchor to FY31 | 17.2%: $45,744m to $101,115m |
| Implied FCF CAGR over the five forecast years | 19.67%: `(FY31 FCF $51,581m / LTM FCF $21,013m)^(1/5) − 1` |
| Implied years of above-GDP growth | Five years; every solved revenue-growth year is 14.0% or higher before the 3.0% terminal rate |
| Implied steady-state EBIT margin | 63.0%, **held fixed**, not solved |
| Terminal-value share of EV in the price-matched solve | 77.2% |

This is a demanding conditional result, not a forecast: at `04`'s discount rate, the price needs Visa to grow revenue to roughly $101.1bn by FY31 while retaining the DCF's 63.0% EBIT margin. The terminal-value share exceeds 60%, so the terminal-growth re-solve is required and shown in §4. [Valuation 04, §§2, 5]

## 2A. Implied Discount Rate — the dual solve (always run this)

The mirror solve holds `04`'s exact base-case FCFF path ($25,360m, $28,410m, $30,866m, $32,847m, and $34,557m for FY27–FY31), terminal FCFF of $31,370m, 3.0% terminal growth, five-year horizon, and mid-year convention fixed. It solves the discount rate that makes those cash flows equal the same $680,448.9m EV. [Valuation 04, §§4–6]

The same executed command in §2 then runs `E(r)`, which discounts the five stated FCFFs at `t − 0.5` and adds `31,370.285 / (r − 3.0%)` at FY31.

Root returned: `implied_WACC=7.154710%; ratio_to_model=79.151153%; EV=680448.900`.

| Solve | Held fixed | Solved value |
|---|---|---:|
| Implied discount rate at `04`'s base-case cash flows | `04` FCFF path, terminal g, five-year horizon, mid-year convention | 7.15% |
| `04`'s model WACC (for comparison) | — | 9.04% |
| Ratio (implied ÷ model) | — | 0.79x |

For `04` §3A, the market-implied rate is **7.15%**, 1.89 percentage points below the 9.04% model WACC; it cuts toward a lower required return if `04`'s base cash-flow path is accepted. The 0.79x ratio does not meet the >1.5x escalation threshold, and `04`'s WACC cleared its stated low-side floors; therefore this result does not support an assertion that the market is pricing an unprecedented cash-flow collapse. It exposes the two valid readings of the valuation equation instead: either cash flows are higher than `04`'s base path, or the appropriate rate is lower than 9.04%. There is no scope-matched company-disclosed group rate in the admitted evidence to choose between them conclusively. [Valuation 04, §§3–3A]

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| FCF CAGR of 19.67% for five forecast years | FCF rose from $14,522m in FY21 to $21,577m in FY25, a 10.4% CAGR on the same CFO-minus-capex definition; latest LTM FCF of $21,013m was down 4.8% year on year. [Capital IQ Financials Annual → Cash Flow, FY21/FY25; Earnings 01, §§1–2] | The largest quantified operating bound is only a one-quarter, non-additive $329m pre-tax effect for a 3% change in payment volume/transactions; it is an inference, not management guidance. [Earnings 07, §§2–4] | **Stretch / not proven** |
| Revenue CAGR of 17.2% to $101,115m in FY31 | Revenue rose from $24,105m in FY21 to $40,000m in FY25, a 13.5% CAGR; LTM revenue was $44,488m, up 14.4%. [Capital IQ Financials Annual → Income Statement, FY21/FY25; Earnings 01, §§1–2] | Capital IQ's FY27–FY31 revenue estimates run from $50,770m to $74,249m. The latter is a one-estimate FY31 field and is not a strong forecast anchor, but it is $26,866m below the reverse-solved FY31 revenue. [Capital IQ Estimates → Consensus, FY27–FY31] | **Stretch / not proven** |
| Maintain 63.0% EBIT margin while growing revenue at 14%–21% | FY24 GAAP EBIT margin was 65.7%, FY25 was 60.0% after a $2,562m litigation provision, and June LTM was 60.7%. [Earnings 01, §§1–2] | Client-incentive intensity rose about 119 bps year on year; Q3 marketing expense was up $228m year on year, and the drivers overlap rather than add cleanly. [Earnings 07, §2] | **Not proven** |
| Sustain above-GDP growth for all five years | Visa has a two-sided network of roughly 12bn credentials and more than 175m merchant locations; its moat read is stable, not confirmed widening. [Business Model 09, §§2, 5] | Payment volume/transactions grew 9%–10% in the Q3 reference period, but management cited unusually elevated June/July retail promotion and days mix. [Earnings 07, §§3–4] | **Stretch** |

The market's implied FCF growth is aggressive **if 9.04% is the right WACC**: 19.67% exceeds the FY21–FY25 reported-FCF CAGR by 9.3 percentage points, while the most recent LTM FCF fell 4.8%. Visa's network and high returns on capital support sustained growth, but the supplied evidence describes the moat as stable rather than widening and does not prove five years of 14%–21% revenue growth at a 63% margin. [Earnings 01, §§1–2, 6; Earnings 07, §§2–4; Business Model 09, §§2–5]

**Market-ceiling sanity check.** Not assessable — the admitted evidence has no credible addressable-market revenue total. Visa's disclosed payment volume and credential/merchant counts are not revenue TAMs, so treating them as a revenue ceiling would be a category error. The check is omitted rather than invented; it could only have made the implied-growth requirement harder. [Business Model 09, §§2, 5]

## 4. Robustness

Each result below was re-solved by the same executed bisection solver rather than calculated by hand. [Executed Python output below; Valuation 04, §§2, 4–5]

```text
WACC-1: delta=4.523040%; FCF_CAGR=15.081039%; FY31_revenue=83144.703; EV=680448.900
WACC:   delta=9.019646%; FCF_CAGR=19.674024%; FY31_revenue=101114.906; EV=680448.900
WACC+1: delta=13.044441%; FCF_CAGR=23.785014%; FY31_revenue=119717.063; EV=680448.900
g-0.5:  delta=10.188321%; FCF_CAGR=20.867734%; FY31_revenue=106259.460; EV=680448.900
g+0.5:  delta=7.732002%; FCF_CAGR=18.358790%; FY31_revenue=95679.368; EV=680448.900
```

| Discount Rate | Implied FCF CAGR to Justify Price |
|---|---:|
| WACC −1%: 8.04% | 15.08% |
| WACC: 9.04% | 19.67% |
| WACC +1%: 10.04% | 23.79% |

| Terminal growth rate | Implied FCF CAGR to Justify Price |
|---|---:|
| 2.5% | 20.87% |
| 3.0% | 19.67% |
| 3.5% | 18.36% |

| FCF-base case | Normalized FCF base used | Implied FCF CAGR | Interpretation |
|---|---:|---:|---|
| Low | Not separately derived; $21,013m | 19.67% | `04` reports no lower normalized base. |
| Base | $21,013m | 19.67% | Reported CFO − capex; no add-back. |
| High | Not separately derived; $21,013m | 19.67% | `04` reports no higher normalized base. |

The FCF-base comparison is **not assessable** because `04` defines only one normalized base; the identical rows are deliberate, not a claim of zero cash-flow uncertainty. A base-band sensitivity would require a sourced normalized alternative and must not be fabricated here. Among the defined re-solves, WACC is the larger driver: a ±1.0-point move changes implied FCF CAGR by 4.11–4.59 percentage points from the base, versus 1.19–1.32 points for terminal growth ±0.5%. [Valuation 04, §§1, 5, 7]

## 5. What's-Priced-In Read

At the stale but pool-verified $364.15 V price, **conditional on `04`'s 9.04% WACC**, the market is pricing roughly 19.67% FCF CAGR across the five forecast years, with FY31 revenue of about $101.1bn and a 63.0% EBIT margin. That is aggressive relative to Visa's 10.4% FY21–FY25 reported-FCF CAGR, latest LTM FCF decline, and the evidence that its moat is stable rather than confirmed widening. [Earnings 01, §§1–2; Business Model 09, §5]

The dual solve prevents a one-sided conclusion: `04`'s exact base cash-flow path also reconciles to today's EV at a 7.15% discount rate rather than 9.04%. The available evidence does not prove which assumption is wrong, so this is a conditional priced-in warning, not a final valuation verdict. [Valuation 04, §§3–6]
