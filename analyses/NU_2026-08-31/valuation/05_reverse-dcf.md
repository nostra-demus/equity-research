# Reverse DCF — What's Priced In — NU

## 1. Inputs

NU is a deposit-taking financial institution, so an enterprise-value / FCFF reverse DCF would be the wrong tool. This report inverts the same equity-direct residual-income model used in `04_intrinsic-dcf`: book value plus earnings above the required return on equity. All amounts are US$ millions unless stated otherwise; NU reports under IFRS in US dollars. [FY2025 Form 20-F, cover page; Intrinsic Equity Value — NU, §§1–5]

| Input | Value | Source |
|---|---:|---|
| Decision line / current price | NU · NYSE · US$14.30, last close 2026-08-29; pool-verified | [Capital IQ Comps → Financial Data, subject row, as of 2026-08-29; `ciq_facts.json` `current_price`, authoritative workbook read] |
| Fully diluted shares | 4,908.841m | [H1 FY2026 reviewed interim financial statements, Note 9] |
| Price-implied equity value used in the equity model | US$70,196.4m = US$14.30 × 4,908.841m | Analyst calculation from the price and diluted-share inputs above |
| Enterprise value | Informational only: US$60,595.4m before the optional lease adjustment; not an intrinsic input for this lender | [Price & Capital Structure — NU, §7] |
| FCF base | Not applicable. CFO and FCF are not distributable-cash measures for a deposit-taking lender. | [Historical Financials — NU, §§1–2; Valuation MODULE_RULES, Business-Type Method Map] |
| Equity / earnings base used instead | Opening parent equity US$13,249.7m at 30 June 2026; H2 FY2026 net income US$2,240.0m; FY2027–30 net income path US$5,301.5m / 6,283.3m / 7,166.9m / 7,952.3m | [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.8; Intrinsic Equity Value — NU, §§1–2] |
| Discount rate used | 16.51% cost of equity, not WACC. It is Nu's disclosed rate for the Brazil-focused Investments-activities CGU, not a proven group-wide rate. | [FY2025 Form 20-F, Note 4, goodwill impairment analysis, pp.F-37–F-38; Intrinsic Equity Value — NU, §3] |
| Forecast horizon / timing | H2 FY2026 plus FY2027–30; terminal from FY2031; mid-year discounting from 30 June 2026 | [Intrinsic Equity Value — NU, §§2, 4–5] |
| Terminal assumptions | 20.0% terminal ROE, 3.0% residual-income growth and 85.0% terminal payout in `04`'s base model | [Intrinsic Equity Value — NU, §§2, 5] |

`04` values the same base path at US$5.55 per share, versus US$14.30 in the pool. This reverse solve therefore keeps its equity base, 16.51% cost of equity, 3.0% terminal growth and mid-year convention intact; it does not add the lender's informational EV bridge or cash balance. [Intrinsic Equity Value — NU, §§4–6; Price & Capital Structure — NU, §§4–7]

## 2. Implied Expectations

The primary solve holds the `04` explicit earnings path, cost of equity, terminal growth and timing fixed, then solves only for the terminal ROE that makes equity value equal the current share price. The secondary solve holds the 20.0% terminal ROE and the same discount-rate, terminal-growth and timing assumptions fixed, then solves a constant FY2027–FY2030 net-income CAGR starting from the FY2026 consensus net income of US$4,172.5m. These are alternative reconciliations, not assumptions to add together.

| What the Price Implies | Solved Value |
|---|---:|
| Implied terminal ROE, with `04`'s explicit earnings path unchanged | **47.36%** |
| Implied FY2027–FY2030 net-income CAGR, with terminal ROE held at `04`'s 20.0% | **80.89%** |
| Implied FY2030 net income in that constant-growth solve | **US$44,674.4m** |
| `04` base-path FY2026–FY2030 net-income CAGR, for comparison | 17.50% |

The 80.89% solve grows net income from US$4,172.5m in FY2026 to US$44,674.4m in FY2030, or 10.7 times the FY2026 starting amount. It also requires that FY2030 profit be 4.62 times `04`'s US$7,952.3m base-path FY2030 profit. [Capital IQ Estimates — Trends, FY2026 current; H1 FY2026 interim financial statements, Statement of Income, p.5; Intrinsic Equity Value — NU, §2]

Executed solver command and output:

```text
$ /usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
B0, sh, price, k0, tg = 13249.7, 4908.841, 14.30, .1651, .03
p04, period, t = [2240.0,5301.5,6283.3,7166.9,7952.3], [.5,1,1,1,1], [.25,1,2,3,4]
target = price*sh
def val(k, roe, ps=p04):
    b=B0; pv=0
    for ni, frac, tm in zip(ps, period, t):
        pv += (ni-k*b*frac)/(1+k)**tm; b += ni
    return B0+pv+(roe-k)*b/(k-tg)/(1+k)**4.5
def root(f, lo, hi):
    for _ in range(160):
        m=(lo+hi)/2
        if f(lo)*f(m)<=0: hi=m
        else: lo=m
    return (lo+hi)/2
roe = root(lambda x: val(k0,x)-target, k0+1e-7, 2)
fy26 = 1932.520+2240.0
def growth_path(h): return [2240.0]+[fy26*(1+h)**i for i in range(1,5)]
growth = root(lambda x: val(k0,.20,growth_path(x))-target, -.5, 2)
ke = root(lambda x: val(x,.20)-target, tg+1e-7, .6)
print(f'Primary terminal-ROE root = {roe:.8%}')
print(f'Constant FY2027–FY2030 net-income CAGR root = {growth:.8%}; FY2030 NI = {growth_path(growth)[-1]:.1f}')
print(f'Implied cost-of-equity root = {ke:.8%}; ratio to 04 = {ke/k0:.4f}x')
PY
Primary terminal-ROE root = 47.35637331%
Constant FY2027–FY2030 net-income CAGR root = 80.89022785%; FY2030 NI = 44674.4
Implied cost-of-equity root = 9.77721830%; ratio to 04 = 0.5922x
```

## 2A. Implied Discount Rate — the dual solve (always run this)

The mirror solve fixes every `04` base-case input: the H2 FY2026 and FY2027–30 earnings path, 20.0% terminal ROE, 3.0% terminal growth, no explicit-period distributions and the mid-year convention. It solves only the cost of equity.

| Solve | Held fixed | Solved value |
|---|---|---:|
| Implied cost of equity at `04`'s base-case earnings path | `04` earnings path, 20.0% terminal ROE, 3.0% terminal growth, horizon and convention | **9.78%** |
| `04` model cost of equity, for comparison | — | **16.51%** |
| Ratio (implied ÷ model) | — | **0.592x** |

The 9.78% root is 673bp below the 16.51% rate used in `04`, and 226bp below its illustrative 12.04% market build that already uses a 1.00 beta floor and Brazil total equity-risk premium. This does not establish that the market is wrong: it presents two readings. **Reading A — the cash flows are too low at a 16.51% hurdle:** the price requires the 47.36% terminal ROE or 80.89% explicit-profit growth described above. **Reading B — the applied rate is too high for NU's group equity:** the 16.51% filed rate is for one Brazil-focused CGU, not a group-wide hurdle. The available evidence does not prove which reading wins; it does show that a conclusion that the market is simply pricing a collapse would be unsupported. [FY2025 Form 20-F, Note 4, pp.F-37–F-38; Intrinsic Equity Value — NU, §3]

This 9.78% market-implied rate is an input to `04` §3A's cost-of-capital reality test. The output-path contract limits this agent to `05_reverse-dcf.md`, so `04` is not edited here; its owner should carry this number into the cross-check table.

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Terminal ROE of 47.36% | FY2025 IFRS ROE was 30.3%; the FY2022–FY2025 average was 17.2%, only 68bp above the same 16.51% filed hurdle. | The moat is narrow and provisionally widening; its return evidence is not a full credit-cycle proof. | **Stretch — not proven.** |
| FY2027–FY2030 net-income CAGR of 80.89%, with terminal ROE held at 20.0% | Diluted EPS grew from US$0.2121 in FY2023 to US$0.5846 in FY2025, a 66.0% CAGR from a low profit base; FY2026 consensus EPS of US$0.85 is 45.4% above FY2025. | Q2's risk-adjusted-NIM bridge included +178bp credit income and +115bp lower credit cost, but neither is disclosed as a durable dollar earnings coefficient. Risk expansion also increased early delinquency by 24bp and Q2 ECL was 46.4% above Q2 2025. | **No — not proven from available data.** |

FY2023–FY2025 EPS growth is the closest positive same-metric history, but it covers only two years after losses in FY2021–FY2022. It is therefore a judgment-informed comparison, not a measured four-year base rate. It falls 14.9 percentage points below the 80.89% requirement, and the required growth must persist for four fiscal years rather than two. [Historical Financials — NU, §§1, 6; Capital IQ Estimates — Trends, FY2026 current]

The latest operating drivers are mixed. The reported Q2 benefit from credit income and lower credit cost can support earnings, but the same risk expansion raised early delinquency, while a 100% downside macro weighting would increase the allowance by US$504.7m. The latter is an allowance sensitivity, not an EPS forecast, so it cannot be mechanically deducted from the reverse-DCF path. [Earnings Sensitivity — NU, §§2, 4–6; Q2 2026 Earnings Presentation, slides 16 and 18]

**Market-ceiling sanity check:** a revenue-TAM test is not meaningful for this lender. The pool gives FY2025 deposits of US$41.9bn, but no cited addressable loan-book, deposit-pool or asset-base estimate that can test the US-dollar earnings path on a matched basis. This check is **Not assessable**; it provides no favourable inference. [Moat — NU, §2]

## 4. Robustness

The continuing value is only 20.1% of total equity value in `04`, below the 60% threshold for a mandatory terminal-growth stress. The required terminal ROE is nevertheless materially rate-sensitive:

| Cost of Equity | Implied Terminal ROE to Justify US$14.30 |
|---|---:|
| 15.51% | 42.49% |
| 16.51% | 47.36% |
| 17.51% | 52.53% |

The executed solver returned 42.49310713%, 47.35637331% and 52.53243453% for those three rates. A 100bp lower rate reduces the required terminal ROE by 486bp; a 100bp higher rate increases it by 518bp.

| Explicit-earnings base stress | Implied Terminal ROE | Treatment |
|---|---:|---|
| `04` base path: H2 FY2026 US$2,240.0m; FY2027–30 US$5,301.5m / 6,283.3m / 7,166.9m / 7,952.3m | 47.36% | Base solve above. [Intrinsic Equity Value — NU, §2] |
| Low / high earnings-base band | Not assessable | `04` and the earnings module provide no filing-backed or consensus low/high earnings path. The allowance range is not an earnings coefficient, so applying it as a profit band would invent precision. [Earnings Sensitivity — NU, §§2–3] |

An evidence-backed comparison between discount-rate and earnings-base sensitivity is therefore not assessable. The rate alone moves the required terminal ROE by roughly five percentage points per 100bp, and the more important judgment is scope: the 16.51% rate is CGU-specific rather than a proven group cost of equity. No unsupported ±10% earnings stress is used.

## 5. What's-Priced-In Read

At US$14.30, applying `04`'s 16.51% cost of equity and its explicit earnings path requires a 47.36% terminal ROE. Alternatively, holding `04`'s 20.0% terminal ROE requires 80.89% annual net-income growth from FY2027 through FY2030, ending at US$44.7bn. Those are aggressive requirements versus FY2025's 30.3% ROE, the 17.2% four-year ROE average and the mixed credit evidence. [Moat — §§3–5; Earnings Sensitivity — §§2, 4]

The dual solve tempers that conclusion: the same `04` earnings path reconciles at a 9.78% cost of equity, while `04` uses a 16.51% rate that is filed but only for a Brazil-focused CGU. The reverse read is therefore **aggressive conditional on `04`'s discount rate**, not proof that the market is mispricing NU.
