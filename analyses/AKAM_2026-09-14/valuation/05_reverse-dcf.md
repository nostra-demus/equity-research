# Reverse DCF — What's Priced In — AKAM

AKAM is an operating business. This reverse discounted-cash-flow (DCF) analysis values enterprise cash flows, then compares them with the pool-verified enterprise value. Akamai reports under U.S. GAAP in USD; all amounts are USD millions except per-share data and percentages.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $106.79 at the 14 Sep. 2026 close; pool-verified | [CIQ Comps → Financial Data, “Day Close Price Latest,” data as of 2026-09-14; `ciq_facts.json`, `current_price`, present; Price & Capital Structure, §1] |
| Enterprise value | $21,428.3 | `$15,345.7m` market cap + `$7,562.8m` filing debt − `$1,480.3m` cash and equivalents; operating leases excluded. [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; Price & Capital Structure, §§3–4] |
| FCF base | $629.9 LTM to 30 Jun. 2026 | Free cash flow (FCF, cash from operations less cash capex) = `$1,447.2m − $817.3m`; no one-off normalization was identified. [FY2025 Form 10-K, Statements of Cash Flows, pp.55–56; Q2 FY2026 Form 10-Q, Statements of Cash Flows, pp.7–8; Intrinsic DCF, §1] |
| Discount rate (WACC) used | 6.2168% | Used verbatim from `04`: 9.06% cost of equity, 0.45% after-tax debt cost, and 66.99% / 33.01% equity/debt weights. [Intrinsic DCF, §3] |
| Terminal growth | 0.80% | Used verbatim from `04`; it is the model's financeable growth after return on capital fades to WACC. [Intrinsic DCF, §5] |
| Forecast horizon (years) | H2 FY2026 through FY2030; five cash-flow slots, terminal value discounted 4.5 years from 30 Jun. 2026 | Same dates and mid-period timing as `04`: 0.25, 1, 2, 3, and 4 years for explicit cash flows. [Intrinsic DCF, §4] |

The price state is **pool-verified**, so the reverse-DCF can run. The enterprise-value bridge uses the filing-based strict debt-and-cash basis from `01`, not CIQ's lease- and investment-inclusive net-debt field. [Price & Capital Structure, §§4–5 and Anchor Block]

## 2. Implied Expectations

I held the $629.9m LTM FCF base, 6.2168% WACC, 0.80% terminal growth, five cash-flow slots, and `04`'s timing convention fixed. I solved only for one annual FCF growth rate, `x`. The cash-flow sequence is `0.5 × base × (1+x)^0.5` for H2 FY2026, then `base × (1+x)^1.5` through `base × (1+x)^4.5` for FY2027–FY2030; terminal value is discounted at 4.5 years exactly as in `04`. This is an inference from the DCF inputs, not a filing forecast.

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCF CAGR over the horizon | **16.35%** a year |
| Implied H2 FY2026 / FY2027 / FY2028 / FY2029 / FY2030 FCF | $339.7m / $790.5m / $919.8m / $1,070.2m / **$1,245.1m** |
| Implied period of above-terminal growth | 4.5 years at 16.35%, before the model fades to 0.80% terminal growth |
| Implied FY2030 FCF margin if `04`'s $6,482.3m revenue path is held | **19.21%**, versus `04`'s 15.00% FY2030 FCF margin |

The executed root-find was:

```bash
/usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
B,EV,w,tg=629.9,21428.3,.062168,.008
t=[.25,1,2,3,4]
def root(f,lo,hi):
    for _ in range(200):
        m=(lo+hi)/2
        if f(lo)*f(m)<=0: hi=m
        else: lo=m
    return (lo+hi)/2
def ev_g(g,W=w,base=B,term=tg):
    c=[.5*base*(1+g)**.5]+[base*(1+g)**(i+.5) for i in range(1,5)]
    return sum(x/(1+W)**u for x,u in zip(c,t))+c[-1]*(1+term)/(W-term)/(1+W)**4.5
def ev_w(W):
    c=[227.9,558.7,707.8,856.1,972.3]
    return sum(x/(1+W)**u for x,u in zip(c,t))+c[-1]*(1+tg)/(W-tg)/(1+W)**4.5
g=root(lambda x:ev_g(x)-EV,-.9,.5)
wi=root(lambda x:ev_w(x)-EV,tg+1e-6,.5)
print(f'FCF_CAGR={g:.8%}; EV={ev_g(g):.1f}')
print(f'IMPLIED_WACC={wi:.8%}; EV={ev_w(wi):.1f}; ratio={wi/w:.4f}')
PY
```

```text
FCF_CAGR=16.34956885%; EV=21428.3
IMPLIED_WACC=5.04657045%; EV=21428.3; ratio=0.8118
```

The primary solve's terminal-value present value is $17,662.9m, or **82.4%** of EV. Its terminal dependence makes terminal-growth sensitivity necessary and limits precision.

## 2A. Implied Discount Rate — the dual solve (always run this)

| Solve | Held fixed | Solved value |
|---|---|---:|
| Implied discount rate at `04`'s base-case cash flows | `04`'s $227.9m / $558.7m / $707.8m / $856.1m / $972.3m cash-flow path, 0.80% terminal growth, and its timing convention | **5.05%** |
| `04`'s model WACC (for comparison) | — | **6.22%** |
| Ratio (implied ÷ model) | — | **0.81x** |

The 5.05% dual solve is 1.17 percentage points below `04`'s 6.22% WACC, so it cuts **against** the model WACC: with `04`'s cash-flow path unchanged, the current EV only reconciles at a lower required return. The 0.81x ratio is not the >1.5x trigger for the two-reading escalation. It therefore does not support a claim that the market is pricing a cash-flow collapse. The two non-exclusive explanations are a lower market-required return or more cash than `04` forecasts; the fixed-WACC solve quantifies the latter at 16.35% FCF CAGR.

For `04` §3A, the handoff is: **market-implied WACC 5.05%, 0.81x the 6.22% model WACC, cutting against the model rate but not triggering the >1.5x escalation.** `04` found no scope-matched group discount rate in the filings; lease discount rates are obligation-specific comparators, not a group WACC. [FY2025 Form 10-K, Note 15 (Leases), p.80; Intrinsic DCF, §3A]

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| 16.35% annual FCF growth to $1,245.1m in FY2030 | FCF was $618.4m in FY2023, $833.9m in FY2024, $699.3m in FY2025, and $629.9m LTM. FY2023–FY2025 FCF CAGR was 6.34%; LTM FCF was 9.92% below FY2025. [Historical Financials, §§1–2] | Q2 FY2026 revenue grew 5.4% year on year, while GAAP-derived EBITDA fell 18.7%. Security revenue grew 10% and CIS grew 39%, but category margins and their conversion into FCF are not disclosed; cost and payroll ratios are rising faster than revenue. [Earnings Sensitivity, §§1–3; Q2 FY2026 Form 10-Q, pp.5, 23, 30, 32–34] | **Stretch — not proven from available data** |
| 19.21% FY2030 FCF margin if `04` revenue is retained | LTM FCF margin was 14.57%. The `04` path reaches a 15.00% FY2030 FCF margin, not 19.21%. [Historical Financials, §2; Intrinsic DCF, §4] | The latest earnings evidence shows Q2 gross margin down 331 bps year on year and an expense-ratio increase of 441 bps. A margin recovery is possible but not demonstrated. [Historical Financials, §§3 and 6; Earnings Sensitivity, §2] | **Stretch — not proven from available data** |

At a fixed LTM FCF margin of 14.57%, the $1,245.1m FY2030 FCF requirement converts to **$8.545bn** of revenue, 31.8% above `04`'s $6.482bn FY2030 revenue path. Alternatively, holding `04`'s revenue path demands the 19.21% FCF margin above. This conversion is **inference, not from filings**; it shows the two possible ways to meet the price, not a company forecast.

The market-ceiling test cannot be completed credibly: the frozen pool has no dated addressable-market estimate or market-share series for Akamai's blended Delivery, Security, and CIS businesses. The filing discusses competition and potential market-share loss, while the business-model work specifically says market share is not disclosed. I therefore do not invent a TAM or use this check to support upside. [FY2025 Form 10-K, Item 1—Competition, p.8; Business-model Moat, §§4–5]

The implied 16.35% FCF CAGR is aggressive against the matched FCF history, not merely against revenue growth. It is not impossible: Security and CIS are growing, but the evidence does not establish their margins, and delivery pricing, capacity timing, payroll/SBC, and cost of revenue are current offsets. The moat read is also qualified: network scale exists, but no economic moat is proven; profit-economics measures eroded while cash conversion improved, so erosion is not confirmed across every metric. [Business-model Moat, §§2–5]

## 4. Robustness

| Discount Rate | Implied FCF CAGR to Justify Price |
|---|---:|
| WACC −1% (5.2168%) | 10.72% |
| WACC (6.2168%) | 16.35% |
| WACC +1% (7.2168%) | 21.34% |

| FCF-base sensitivity, same cash definition | FCF Base | Implied FCF CAGR to Justify Price |
|---|---:|---:|
| Low — H1 FY2026 annualized stress | $442.4m = $221.2m H1 FCF × 2 | 26.46% |
| Base — LTM | $629.9m | 16.35% |
| High — FY2025 actual | $699.3m | 13.49% |

The base sensitivity uses only the cash bases already stated in `04`: actual H1 FY2026 FCF, LTM FCF, and FY2025 FCF, each as CFO less total cash capex. The H1 annualization is a mechanical downside bound, not a forecast. [Intrinsic DCF, §§1 and 4]

| Terminal Growth | Implied FCF CAGR to Justify Price |
|---|---:|
| 0.30% (base −0.5%) | 18.48% |
| 0.80% (base) | 16.35% |
| 1.30% (base +0.5%) | 14.05% |

Across the observed FCF-base band, implied growth moves 13.0 percentage points (26.46% to 13.49%), slightly more than the 10.6-point movement across WACC ±1%. The FCF base is therefore the larger sensitivity in this run. Terminal growth also matters because terminal value is 82.4% of EV: a ±0.5% change moves implied growth by 4.4 percentage points.

## 5. What's-Priced-In Read

At $106.79, the market prices **16.35% annual FCF growth for 4.5 years**, from $629.9m LTM to roughly $1.245bn in FY2030, while retaining a 6.2168% WACC and 0.80% terminal growth. That is **aggressive**, because the matching FCF record was volatile—6.34% CAGR in FY2023–FY2025 and a 9.92% LTM decline—while Q2 FY2026 showed rising revenue but falling GAAP-derived EBITDA. [Historical Financials, §§1–3; Earnings Sensitivity, §§1–3]

There is no evidence-backed reason to call the requirement impossible, but it needs either revenue of about $8.545bn at the LTM FCF margin or a 19.21% FCF margin on `04`'s FY2030 revenue path. Both are above the supplied base path and are not proven from available data. The reverse-DCF therefore offers no evidence-based upside from the current price.
