# Reverse DCF — What's Priced In — GOOGL

Alphabet is an operating company reporting under US GAAP in USD. Amounts are USD millions unless stated otherwise. This is an enterprise-value (EV) reverse-DCF for GOOGL, the Nasdaq Class A common-stock line.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $278.99, 2026-11-03; pool-verified | [CIQ facts sidecar, `current_price` = $278.99; source ref: CIQ Comps→Financial Data “Day Close Price Latest,” as of 2026-11-03] |
| Enterprise value | $3,523,015 | [Valuation Price & Capital Structure — GOOGL, §4; Q3 FY2026 Form 10-Q, Notes 4, 6, 7 and 11] |
| Normalized FCFF base | $164,932 in FY2031 | [Intrinsic DCF — GOOGL, §1 and §4] |
| Discount rate (WACC) used | 10.3705% | [Intrinsic DCF — GOOGL, §3] |
| Forecast horizon | Six years; mid-year discounting | [Intrinsic DCF — GOOGL, §4] |
| Terminal growth | 2.5% | [Intrinsic DCF — GOOGL, §5] |

The $164.932bn FCFF (free cash flow to all capital providers) base is the forward DCF's normalized post-build FY2031 cash flow. It is used verbatim rather than the literal TTM $19.747bn FCF or FY2025 $73.266bn FCF, because the latter two include the current AI-capex build and `04` identifies FY2031 as the reverse-DCF reference. [Intrinsic DCF — GOOGL, §1; data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025, Consolidated Statements of Cash Flows, p.51; CIQ facts sidecar, `ltm_ocf_m` = $179,551m, source ref: CIQ Financials→Cash Flow, LTM Sep-30-2026]

## 2. Implied Expectations

The primary normalised-base solve holds the $164.932bn FCFF base, 10.3705% WACC, 2.5% terminal growth, six-year horizon, and mid-year convention fixed. It solves `x` in:

`EV = Σ[FCFF₀ × (1 + x)^t / (1 + WACC)^(t − 0.5)] + [FCFF₀ × (1 + x)^6 × (1 + g) / (WACC − g)] / (1 + WACC)^5.5`, for `t = 1…6`.

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCFF CAGR over the six-year normalised horizon | **11.78%** |
| Implied years of above-terminal growth | **Six years** at 11.78%, before the 2.5% terminal fade |
| Implied steady-state EBIT margin | **Not separately solved**; `04`'s 31.0% is held fixed for the cash-flow conversion |
| FCFF in year six | $321,811 |
| Terminal value as a share of solved EV | 69.1% |

This is a cash-flow-growth solve, not a margin solve. The $321.811bn year-six FCFF is $164.932bn × 1.117848^6; the terminal FCFF is $329.856bn after 2.5% growth. Terminal value is more than 60% of EV, so the terminal-growth sensitivity is shown in §4. The primary solve does not force a CAGR from FY2026's negative $32.277bn FCFF, which would be mathematically meaningless; the full FY2026–FY2031 path is instead used without alteration in the dual discount-rate solve below. [Intrinsic DCF — GOOGL, §§1, 4 and 5]

Executed bisection solver (Python 3.12; amounts in USD millions):

```text
$ /usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -c "EV=3523015.; W=.103705; TG=.025; N=6; B=164931.976; F=[-32277.063,17451.048,63679.325,113247.525,146723.324,164931.976];
def pg(x,w=W,b=B,g=TG):
 f=[b*(1+x)**t for t in range(1,N+1)]; return sum(v/(1+w)**(t-.5) for t,v in enumerate(f,1))+f[-1]*(1+g)/(w-g)/(1+w)**(N-.5)
def pp(w): return sum(v/(1+w)**(t-.5) for t,v in enumerate(F,1))+F[-1]*(1+TG)/(w-TG)/(1+w)**(N-.5)
def root(fn,lo,hi):
 flo=fn(lo)-EV
 for _ in range(300):
  m=(lo+hi)/2
  if flo*(fn(m)-EV)<=0: hi=m
  else: lo=m; flo=fn(lo)-EV
 return (lo+hi)/2
print(root(lambda x:pg(x),-.9,1)); print(root(pp,.026,.5))"
0.11784784950044391
0.06315989564080118
```

The first root is 11.7848%; it reproduces the $3,523,015m EV. The second root is the 6.3160% dual solve in §2A. The same executed solver produced every rate, base, and terminal-growth re-solve in §4.

## 2A. Implied Discount Rate — the dual solve (always run this)

| Solve | Held fixed | Solved value |
|---|---|---:|
| Implied discount rate at `04`'s base-case cash flows | `04`'s FY2026–FY2031 FCFF path, 2.5% terminal growth, six-year mid-year convention | **6.32%** |
| `04`'s model WACC (for comparison) | — | **10.37%** |
| Ratio (implied ÷ model) | — | **0.61×** |

The full `04` path values to $1,552,577m at 10.3705%, matching `04`; it reaches the current EV only at a 6.3160% discount rate. This is the market-implied-rate input for the pending row in `04` §3A. [Intrinsic DCF — GOOGL, §§3–5]

The 0.61× ratio is below, not above, the 1.5× escalation threshold. It therefore does not support the claim that the market prices an unprecedented cash-flow collapse. It also does not validate 6.32% as Alphabet's WACC: keeping `04`'s debt and preferred weights fixed would imply an equity cost of roughly 6.40%, only 1.11 percentage points above its 5.29% risk-free rate, below `04`'s 4-point equity-risk-premium floor. *Inference, not from filings.* The evidence-backed read is that the price needs cash flows above `04`'s path, a lower required return than `04` uses, or both; this reverse solve cannot distinguish the mix. [Intrinsic DCF — GOOGL, §3 and §3A]

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| 11.78% FCFF CAGR for six normalised years, after the current capex build | Reported FCF was $69.495bn in FY2023, $72.764bn in FY2024, and $73.266bn in FY2025: 2.68% CAGR. TTM Sep-2026 FCF was $19.747bn, down 73.2% year on year as capex rose 105.2%. | Search demand is the largest recurring EBIT lever in the sensitivity work: a static ±10% Q3 Search-revenue stress changes EBIT by ±$2.576bn. Cloud revenue rose 103% year on year in Q3, but higher depreciation, third-party compute and data-centre costs remain live constraints. These are sensitivities, not cash-flow forecasts. | **Stretch** |
| Sustain 31.0% EBIT margin and about 20.15% FCFF/revenue conversion while growing cash flow | FY2025 EBIT margin was 32.0%; nine-month FY2026 operating margin was 33.9%. This supports the margin level, but does not prove the post-build FCF conversion. | The earnings work identifies infrastructure cost and R&D as each having a static ±$1.276bn Q3 EBIT effect per 100bp change; management has flagged depreciation and compute-cost pressure. | **Stretch** |

The FCF comparison is matched to FCF, not revenue: historical FCF has been broadly flat, while the price needs 11.78% normalised FCFF growth. Revenue grew 14.48% CAGR in FY2023–FY2025, but that is not evidence that FCF can grow at the same rate while capex remains elevated. [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2023–FY2025, Consolidated Statements of Cash Flows and Income, pp.49–51; Historical Financials — GOOGL, §§1–2]

The business case is not disproven: Cloud revenue and contracted backlog can support post-build growth. But the moat read is narrow and stable rather than widening; vendor ROIC fell from 19.3% in FY2025 to 15.6% LTM September 2026 as cash conversion also declined. The next FY2026 full-year ROIC on the same basis is the clean disconfirmation point: recovery above FY2025's 19.3% would support the cash-flow premise; a further fall below 15.6% would weaken it. [Earnings Sensitivity — GOOGL, §§2–4; Moat — GOOGL, §§3 and 5]

Market-ceiling sanity check: holding `04`'s FY2031 FCFF/revenue conversion fixed at 20.15% ($164.932bn ÷ $818.531bn), the $321.811bn year-six FCFF requirement translates to roughly $1.597tn of revenue. *Inference, not from filings.* The admitted pool has no credible total addressable market for Alphabet's combined advertising, cloud, subscriptions, devices, and Other Bets businesses, so a market-share ceiling cannot be tested without inventing a TAM. This check therefore provides no upside support. [Intrinsic DCF — GOOGL, §§2 and 4]

## 4. Robustness

| Discount Rate | Implied FCFF CAGR to Justify Price |
|---|---:|
| WACC −1%: 9.3705% | 8.88% |
| WACC: 10.3705% | 11.78% |
| WACC +1%: 11.3705% | 14.47% |

| FCFF Starting Base | Basis | Implied FCFF CAGR to Justify Price |
|---|---|---:|
| $19,747 | Literal TTM FCF | 63.96% |
| $73,266 | Literal FY2025 reported FCF | 29.97% |
| $164,932 | `04` normalized FY2031 FCFF — primary-model base | 11.78% |

| Terminal Growth | Implied FCFF CAGR to Justify Price |
|---|---:|
| 2.0% | 12.76% |
| 2.5% | 11.78% |
| 3.0% | 10.74% |

The FCF-base choice is the dominant input: the literal-TTM-to-normalised-base range changes the solved growth rate by 52.18 percentage points, versus 5.60 points for WACC ±1% and 2.02 points for terminal growth ±0.5%. The literal FCF rows are not replacements for `04`'s normalized base; they show why the conclusion depends on the assumed success of the capex normalization. [Intrinsic DCF — GOOGL, §§1, 4 and 5; data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025, Consolidated Statements of Cash Flows, p.51; CIQ facts sidecar, `ltm_ocf_m`, source ref: CIQ Financials→Cash Flow, LTM Sep-30-2026]

## 5. What's-Priced-In Read

At $278.99, the market price requires 11.78% annual FCFF growth for six years from `04`'s $164.932bn normalised post-build base, with a 2.5% terminal growth rate and a 10.3705% WACC. That is **stretch**, not conservative: it is well above the 2.68% FY2023–FY2025 reported-FCF CAGR, and it relies on AI capex falling from its current intensity while returns on the new capacity improve. [CIQ facts sidecar, `current_price`; Intrinsic DCF — GOOGL, §§1–5; Historical Financials — GOOGL, §1]

The price is not a clean signal that the market is pessimistic. Holding `04`'s full cash-flow path fixed instead gives a 6.32% implied discount rate, but that rate would violate `04`'s equity-risk-premium floor; the evidence therefore points to a cash-flow expectation above `04`'s base, not a defensible conclusion that the market has mispriced a collapse.
