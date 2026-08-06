# Reverse DCF — What's Priced In — UBER

**Reporting standard:** US GAAP. **Currency:** USD millions unless per-share. **Source caveat (carried from `01` and `04`):** no primary 10-K/10-Q sits in `data/UBER/`; every historical figure is a Capital IQ vendor export (source-hierarchy tier 5), cited as "CIQ export." This report inverts the SAME model `04_intrinsic-dcf.md` built — it reuses `04`'s discount rate (WACC), normalized free cash flow (FCF, cash a business generates after the spending needed to keep running) base, terminal growth rate, forecast horizon, and discounting convention verbatim, per the Reconciliation Gate 9 hard rule. No values here are independently re-derived.

**Price-state check.** `01_price-and-capital-structure.md` tags the current price ($68.18, Aug-05-2026 close) **pool-verified** — corroborated across three independent Capital IQ exports and 1 trading day old at run date. This clears the partial-data gate: the reverse DCF can run.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $68.18 (Aug-05-2026 close) | `01_price-and-capital-structure.md` §1 — pool-verified |
| Enterprise value (EV, the value of the whole business — equity plus debt, minus cash) | $149,210.14mm | `01_price-and-capital-structure.md` §4 |
| Net debt (strict basis) | $9,340mm | `01_price-and-capital-structure.md` §5 |
| Minority interest | $1,083mm | `01_price-and-capital-structure.md` §4 |
| Diluted shares (per-share fair-value count) | 2,087.980mm | `01_price-and-capital-structure.md` §2 |
| Normalized FY2025 FCFF base (free cash flow to the firm — cash left after tax, reinvestment, and working-capital needs, before paying lenders or shareholders) — **`04`'s canonical figure, reused verbatim** | $4,526mm | `04_intrinsic-dcf.md` §1 (NOPAT + D&A − Capex − ΔNWC; SBC not added back — see `04` for the full bridge) |
| Discount rate (WACC — the blended return the business must clear on its capital, weighting equity and debt by market value) — **`04`'s canonical figure, reused verbatim** | 9.5857% (9.59%) | `04_intrinsic-dcf.md` §3 (CAPM cost of equity 10.35% at β=1.15, after-tax cost of debt 2.39%, market-value weights 90.4% equity / 9.6% debt) |
| Terminal growth rate (g) — **`04`'s canonical figure, reused verbatim** | 4.0% (nominal, ≈ US long-run GDP proxy) | `04_intrinsic-dcf.md` §5 |
| Forecast horizon — **`04`'s canonical horizon, reused verbatim** | 6 years (FY2026–FY2031); terminal starts FY2032 | `04_intrinsic-dcf.md` §2 |
| Discounting convention — **`04`'s canonical convention, reused verbatim** | Mid-year (cash flows assumed to land evenly through the year, discounted at t−0.5, not at year-end) | `04_intrinsic-dcf.md` §4 |
| `04`'s own base-case per-share intrinsic value (for context, not an input to this solve) | $82.87 (+21.5% vs. price) | `04_intrinsic-dcf.md` §6 |
| `04`'s terminal-value share of its EV | 77.1% (exceeds the 75% terminal-dominance threshold — flagged low-confidence in `04`; also exceeds this agent's own 60% threshold for a mandatory terminal-`g` sensitivity, applied in §4 below) | `04_intrinsic-dcf.md` §5 |

## 2. Implied Expectations

**What is held fixed:** the WACC (9.5857%), the terminal growth rate (4.0%), the 6-year explicit horizon, the mid-year discounting convention, and the normalized FY2025 FCFF base ($4,526mm) — all taken verbatim from `04`. **What is solved for:** the uniform annual FCFF growth rate applied to that base over FY2026–FY2031 (compounding into the same Gordon-growth terminal value at g=4.0%) that makes the present value of the cash-flow stream equal today's enterprise value ($149,210.14mm). This is a nonlinear root-find, executed with `scipy.optimize.brentq`, not estimated by hand.

**Executed solver — primary solve:**
```
python3 (scipy.optimize.brentq):
wacc = 0.0958557014174351; term_g = 0.04; base_fcff = 4526.0; target_ev = 149210.14; horizon = 6

def ev_at_g(g):
    pv = sum(base_fcff*(1+g)**t / (1+wacc)**(t-0.5) for t in range(1, horizon+1))
    fcff_n = base_fcff*(1+g)**horizon
    tv = fcff_n*(1+term_g)/(wacc-term_g)
    return pv + tv/(1+wacc)**(horizon-0.5)

g_solution = brentq(lambda g: ev_at_g(g)-target_ev, -0.5, 2.0)
# Output: g_solution = 0.14667862754183858 ; ev_at_g(g_solution) = 149210.14 (ties to target)
```

| What the Price Implies | Solved Value | What was held fixed |
|---|---:|---|
| Implied FCF (FCFF) CAGR over FY2026–FY2031 | **14.7%** | WACC 9.59%, terminal g 4.0%, 6-yr horizon, FCFF base $4,526mm, mid-year convention |
| Implied years of above-GDP-growth (two-stage fade model) | **~4.3 years** at `04`'s own consensus-anchored 18.6% FCFF CAGR, then an immediate step-down to the 4.0% terminal perpetuity | WACC, terminal g, FCFF base as above; explicit growth rate fixed at `04`'s own base-case FCFF CAGR (18.56%, FY2025→FY2031 in `04`'s model) rather than re-derived; solved for N years of that pace |
| Implied steady-state EBIT margin (holding the consensus revenue path fixed) | **12.8%** | WACC, terminal g, tax rate (24%), D&A (1.35% of revenue), capex (0.6% of revenue), ΔNWC schedule, and `04`'s consensus revenue path (FY2026 $57,830mm → FY2031 $100,247mm) all fixed at `04`'s values; the EBIT margin (uniform across FY2026–FY2031, replacing `04`'s ramping 13.5%→16.0% path) is solved for |

**Executed solver — implied steady-state margin:**
```
python3 (scipy.optimize.brentq):
revenue = {2026:57830,2027:66985,2028:76228,2029:84184,2030:92947,2031:100247}  # 04's consensus path, fixed
dnwc = {2026:295,2027:465,2028:469,2029:404,2030:445,2031:370}                  # 04's schedule, fixed
tax=0.24; wacc=0.0958557014174351; term_g=0.04

def ev_at_margin(margin):
    fcff = {}
    for y in revenue:
        nopat = revenue[y]*margin*(1-tax); da = 0.0135*revenue[y]; capex = 0.006*revenue[y]
        fcff[y] = nopat + da - capex - dnwc[y]
    pv = sum(fcff[y]/(1+wacc)**(i-0.5) for i,y in enumerate(sorted(fcff),1))
    tv = fcff[2031]*(1+term_g)/(wacc-term_g)
    return pv + tv/(1+wacc)**5.5

m = brentq(lambda m: ev_at_margin(m)-149210.14, 0.01, 0.5)
# Output: m = 0.12761783908473281 -> 12.76%, EV check ties to 149,210.14
```

The years-of-above-GDP-growth fade model uses a continuous root-find (full years at `04`'s 18.56% consensus FCFF pace, mid-year discounted, then an immediate perpetuity at the 4.0% terminal g); solved N = 4.32 years (`scipy.optimize.brentq` over the interval [3.5, 5.5], with fractional-year interpolation for the stub period).

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied FCFF CAGR = 14.7% (FY26–31) | Revenue CAGR FY2023–FY2025 = 18.1%; Adj. EBITDA (company-defined non-GAAP measure that adds back stock-based compensation and other items) CAGR FY2023–FY2025 = 46.8% (off a small base, decelerating: +105% FY24 → +42% FY25 → +18.5% LTM); most recent two quarters show revenue growth decelerating to +14.5% then +12.2% YoY [`earnings/01_historical-financials.md` §1, §3] | `04`'s own base case — anchored on Capital IQ consensus (47–52 analysts) — implies an **18.6% FCFF CAGR** over the identical horizon, i.e. the Street's own numbers assume MORE growth than the price requires [`04_intrinsic-dcf.md` §4, §8] | **Yes** — the price bar sits below both recent realized growth and consensus |
| Implied steady-state EBIT margin = 12.8% (on the consensus revenue path) | LTM actual EBIT margin = 12.1%; FY2025 = 10.7%; margin has expanded every year since FY2022 (-5.75% → 10.70%) [`earnings/01_historical-financials.md` §1] | `04`'s own base case plateaus the terminal EBIT margin at **16.0%** — a further ~320bps above what the price requires; `business-model/09_moat.md` flags the current margin level as a "recent peak," not a proven steady state, but even that caution only threatens the 16.0% assumption, not the much lower 12.8% bar priced in here | **Yes, and by a wide margin** — the price needs only ~65bps of further margin gain from the LTM level, not the ~390bps `04`'s base case assumes |
| Implied ~4.3 years of consensus-pace (18.6%) growth before fading to 4.0% | N/A (a modeling construct, not a historical series) | `04`'s explicit forecast holds a growth path consistent with ~18.6% FCFF CAGR for the FULL 6-year horizon; the price only requires ~4.3 of those 6 years at that pace | **Yes** — the price requires less duration of high growth than `04`'s own base case assumes, not more |

Uber's own recent trend argues these are conservative bars, not aggressive ones: revenue growth is decelerating (18.3% FY2025 → 12.2% latest quarter) but Adjusted EBITDA margin has expanded every single quarter for at least two years (15.11% → 19.86%, FQ3'24→FQ2'26) [`earnings/01_historical-financials.md` §3], and the earnings-sensitivity module's own bull/bear ranges (SG&A leverage ±$780mm, bookings-growth proxy ±$581mm, insurance-cost line ±$520mm on an $8,730mm FY2025 Adjusted EBITDA base) [`earnings/07_earnings-sensitivity.md` §2] bracket a swing wide enough to comfortably span the modest FCFF-growth and margin bars solved above. The single caveat: the SG&A-leverage tailwind — the largest quantified lever — has already started reversing in the LTM period (ratio ticked up 63bps off its FY2025 low) [`earnings/07_earnings-sensitivity.md` §3], so "achievable" here does not mean "assured."

**Market-ceiling sanity check.** Converting the 14.7% implied FCFF CAGR to a revenue trajectory (holding `04`'s margin/FCF-conversion ratios fixed, since FCFF, D&A, capex and ΔNWC all scale with revenue in that model, the ~14.7% FCFF CAGR maps to an approximately equal ~14.7% revenue CAGR): implied FY2031 revenue ≈ $118,248mm, versus `04`'s own consensus-based FY2031 revenue of $100,247mm. Converting FY2031 revenue to Gross Bookings (the total dollar value of trips/orders on the platform, of which Uber keeps a take-rate cut) at Uber's approximate current take rate (~24.5%, from Q2 FY2026's "$14,191mm revenue on >$58bn gross bookings" print [Q2 FY2026 transcript, prepared remarks, cited in `earnings/02_revenue-drivers.md`]) implies **~$483bn of FY2031 Gross Bookings**. Against a combined global ride-hailing + online food-delivery market sized at roughly $499bn–$744bn in 2026 (Web-sourced, dated 2026-08-06, unverified — a wide span across vendor reports including Fortune Business Insights, Grand View Research, and Mordor Intelligence, reflecting real methodology disagreement, not a single reliable TAM figure) and grown at a blended ~10% CAGR (within the cited 9–16% ride-hailing / 9–13% food-delivery ranges) to roughly $804bn–$1,198bn by 2031, Uber's implied FY2031 Gross Bookings would represent **~40–60% of that pool**, up from an implied current share of **~31–46%** (Uber's own ~$232bn annualized Gross Bookings run-rate, from the Q2 FY2026 print annualized, against the 2026 TAM range). This is a continuation of share gains already visible in the data (Uber's Gross Bookings grew 22% YoY in Q2 FY2026 [`earnings/02_revenue-drivers.md` §4] against the ~10% assumed market growth), not a demand for an implausible or unprecedented share capture — **this check does not tighten the verdict above; it does not flag a kill signal.** It is shown as a labelled, low-confidence sanity check given the wide (roughly 50%) spread across vendor TAM estimates — a market-size band this thin (CLAUDE.md §4, a low-tier input) cannot bear much analytical weight on its own, and the conclusion rests primarily on the company-history and earnings-module evidence above, not on this check.

## 4. Robustness

**Discount-rate sensitivity** (FCFF base held at `04`'s $4,526mm, terminal g held at 4.0%):

| Discount Rate | Implied FCFF CAGR to Justify Price |
|---|---:|
| WACC −1% (8.5857%) | 10.5% |
| WACC (9.5857%) | **14.7%** |
| WACC +1% (10.5857%) | 18.3% |

Spread: 7.8 percentage points (pp) across the ±1pp WACC band.

**FCFF-base sensitivity** (WACC and terminal g held fixed at `04`'s values). The low/high bounds are built off `earnings/07_earnings-sensitivity.md` §2's own bull/bear Adjusted EBITDA cases (bear $6,849mm / base $8,730mm / bull $10,611mm — the sum of the ±$581mm bookings-growth, ±$520mm insurance-cost, and ±$780mm SG&A-leverage swings on the FY2025 $8,730mm base), scaled by the same ratio `04` used to bridge FY2025 Adjusted EBITDA to its normalized FCFF base (4,526/8,730 = 0.5185), preserving `04`'s own normalization methodology rather than inventing a new one:

| FCFF Base | Value | Implied FCFF CAGR to Justify Price |
|---|---:|---:|
| Low (bear-case Adj. EBITDA $6,849mm × 0.5185) | $3,551mm | 19.8% |
| Base (`04`'s canonical figure) | $4,526mm | **14.7%** |
| High (bull-case Adj. EBITDA $10,611mm × 0.5185) | $5,501mm | 10.6% |

Spread: 9.2pp across the low/high FCFF-base band.

**Terminal-growth sensitivity** (required because `04`'s terminal value is 77.1% of its EV, above the 60% threshold that triggers this check; WACC and FCFF base held fixed at `04`'s values):

| Terminal g | Implied FCFF CAGR to Justify Price |
|---|---:|
| g −0.5% (3.5%) | 16.1% |
| g (4.0%) | **14.7%** |
| g +0.5% (4.5%) | 13.1% |

Spread: 3.1pp across the ±0.5pp terminal-g band.

**Which input dominates.** The **FCFF base is the larger swing factor** (9.2pp spread) versus the discount rate (7.8pp spread) and terminal g (3.1pp spread) — consistent with the pattern flagged across this valuation module's other outputs. This matters because the FCFF base is itself an assumption (SBC not added back, a narrow trade-receivables/payables working-capital proxy — see `04_intrinsic-dcf.md` §1), not an audited cash figure; the reported FY2025 FCF (CFO − capex) was actually $9,763mm, more than double `04`'s $4,526mm normalized base. If a reader believes the normalization is too conservative, the implied growth bar the price requires falls well below even the 10.6% "high-base" case shown above.

## 5. What's-Priced-In Read

At $68.18, the market is pricing in roughly 14.7% annual growth in free cash flow (FCFF) over FY2026–2031 — equivalent to holding the EBIT margin (operating profit as a share of revenue) at just ~12.8%, barely above the 12.1% level Uber already posted over the last twelve months — using the same 9.59% discount rate and 4.0% terminal growth rate `04`'s forward DCF used. That is conservative relative to what the evidence supports: it sits below `04`'s own consensus-anchored base case (18.6% FCFF CAGR and a 16.0% terminal margin, which produces a $82.87 fair value, +21.5% above price), below Uber's own recent Adjusted EBITDA and EBIT growth, and it does not require Uber to capture an implausible share of the global ride-hailing-and-delivery market (the implied ~40–60% share by 2031 continues, rather than accelerates, the trend already visible in the data). Because the implied expectations are below what the earnings-module evidence and `04`'s own consensus-based case say Uber can plausibly deliver, this reads as **upside**, not downside — consistent with, and reinforcing, `04`'s independent finding of a 21.5% gap between its intrinsic value and today's price.
