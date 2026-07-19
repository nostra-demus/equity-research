# Reverse DCF — What's Priced In — NHY (Norsk Hydro ASA, Oslo Børs: NHY)

Reporting standard: IFRS Accounting Standards as adopted by the EU. Reporting / trading currency: Norwegian krone (NOK million, except per-share figures in NOK). No cross-currency conversion is used anywhere in this report.

**Price-state check (gate).** `01_price-and-capital-structure.md` §7 tags the current price as **pool-verified** (NOK 84.96, 2026-07-17, Capital IQ last close, 2 calendar days / ~1.4 trading days old — well inside the 5-trading-day freshness threshold). This clears the partial-data gate — the agent runs.

**Model-inversion gate.** This report inverts `04_intrinsic-dcf.md` verbatim: the same WACC (7.50%, override), the same 5-year explicit horizon (FY2026–FY2030) with mid-year discounting, the same Gordon-growth terminal rate (`g` = 2.5% nominal), and the same normalized FY2025 FCF base and revenue/capex/net-working-capital build that `04` used. No independent WACC or base was re-derived.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | NOK 84.96 (2026-07-17, last close) | `01_price-and-capital-structure.md` §1, pool-verified |
| Enterprise value (target for this solve) | NOK 192,384mm (cash-quality adjusted, canonical) | `01_price-and-capital-structure.md` §4, §7 — Market cap 166,970 + Total debt 33,754 + Minority 7,495 − freely-available cash 15,835 |
| FCF (normalized) base, FY2025 | NOK 11,729mm (module-standard: CFO − total capex) | `04_intrinsic-dcf.md` §1, "Lead figure, per CLAUDE.md §15" |
| Discount rate (WACC) used | 7.50% (override; computed WACC = 6.91%, within ±1.5pp tolerance; both sit inside Hydro's own disclosed 6.475%–8.225% post-tax impairment-testing WACC band) | `04_intrinsic-dcf.md` §3 |
| Terminal growth `g` | 2.5% nominal (Gordon perpetuity, base case) | `04_intrinsic-dcf.md` §5 |
| Forecast horizon | 5 years (FY2026–FY2030) explicit, mid-year discounting (t = 0.5…4.5) | `04_intrinsic-dcf.md` §2, §4 |
| `04`'s own terminal-value share of EV | 78.1% — terminal-dominated, low-confidence per `MODULE_RULES.md` | `04_intrinsic-dcf.md` §5 |

## 2. Implied Expectations

Two solves were run, both anchored to `04`'s exact WACC, horizon, mid-year convention, and terminal `g`, and both targeting the same EV (NOK 192,384mm). Both were computed with an executed Python bisection solver (`brentq`-style root-find), not by hand. Command and output:

```
python3 - <<'PY'
def brentq_simple(f, lo, hi, tol=1e-10, maxiter=200):
    flo, fhi = f(lo), f(hi)
    for _ in range(maxiter):
        mid = (lo+hi)/2; fm = f(mid)
        if abs(fm) < tol: return mid
        if flo*fm < 0: hi, fhi = mid, fm
        else: lo, flo = mid, fm
    return (lo+hi)/2

WACC, g_term, EV_target = 0.075, 0.025, 192384.0
FCFF0_base = 11729.0

def ev_from_g(g, FCFF0=FCFF0_base, wacc=WACC, gt=g_term):
    pv = sum(FCFF0*(1+g)**t/(1+wacc)**(t-0.5) for t in range(1,6))
    tv = FCFF0*(1+g)**5*(1+gt)/(wacc-gt)
    return pv + tv/(1+wacc)**4.5

g_implied = brentq_simple(lambda g: ev_from_g(g)-EV_target, -0.20, 0.60)
print("Primary: implied 5yr FCF CAGR =", round(g_implied*100,3), "%")
PY
```
Output: **Primary implied 5-year FCF CAGR (off the NOK 11,729mm FY2025 base) = −3.21%.** Check: EV at that growth rate reproduces the NOK 192,384mm target exactly.

A second, more granular solve holds `04`'s own revenue path (Capital IQ consensus FY2026–28, analyst-extrapolated FY2029–30), D&A path, guided capex path, and 13.18%-of-revenue net-working-capital build all fixed, and instead solves for the single uniform Adjusted EBITDA margin (replacing `04`'s 14.0%/13.0%/13.0%/13.0%/13.0% fading schedule) that reproduces the same target EV:

```
[same brentq_simple helper]
revenue = [213366, 218955, 219215, 223599, 228071]  # 04's own FY2026-30 path
da = [10782, 10929, 11078, 11300, 11500]; capex = [13500,15000,15000,15000,15000]
tax = 0.30; nwc_pct = 0.131792; rev0 = 207971.0  # FY2025 actual
def ev_from_margin(m, wacc=0.075, gt=0.025):
    pv, prev_rev, fcffs = 0.0, rev0, []
    for i in range(5):
        rev = revenue[i]; ebitda = rev*m; ebit = ebitda-da[i]
        nopat = ebit*(1-tax); dnwc = nwc_pct*(rev-prev_rev)
        fcff = nopat+da[i]-capex[i]-dnwc; fcffs.append(fcff)
        pv += fcff/(1+wacc)**(i+1-0.5); prev_rev = rev
    tv = fcffs[-1]*(1+gt)/(wacc-gt)
    return pv + tv/(1+wacc)**4.5
m_implied = brentq_simple(lambda m: ev_from_margin(m)-192384.0, 0.02, 0.45)
print("Secondary: implied uniform Adj. EBITDA margin =", round(m_implied*100,2), "%")
```
Output: **Secondary implied uniform Adjusted EBITDA margin = 14.02%.** Check: EV at that margin reproduces NOK 192,384mm exactly. Converted to an EBIT margin using the same D&A path, this is an **implied terminal EBIT margin of ~9.0%** (14.02% EBITDA margin on FY2030 revenue of NOK 228,071mm, less NOK 11,500mm D&A, ÷ 228,071 = 8.98%).

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCF CAGR over the 5-yr horizon (off FY2025 FCF base, NOK 11,729mm) | **−3.21%** |
| Implied uniform Adjusted EBITDA margin, FY2026–30 (replacing `04`'s 14%→13% fade) | **14.02%** |
| Implied uniform EBIT margin (same build) | **~9.0%** |
| Implied years of above-GDP growth (fade model) | **Not meaningful here** — see note below |

**What was held fixed / what was solved for.** Both solves hold WACC (7.50%), the mid-year discounting convention, the 5-year horizon, and terminal `g` (2.5%) fixed at `04`'s exact values. The primary solve holds the FY2025 FCF base fixed and solves for a single compounding growth rate applied to it. The secondary solve instead holds `04`'s own revenue, D&A, capex, and net-working-capital assumptions fixed and solves for the one margin variable `04` itself flagged as the most consequential assumption (§8 of `04`). **No "years of above-GDP growth" fade-model solve is shown as a headline number**: the primary solve already returns a *negative* growth rate, meaning the price does not require any above-trend growth phase at all — fabricating a fade-model year-count on top of a negative growth solve would imply a supernormal phase that isn't there, so this row is explicitly left blank rather than invented.

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| FCF CAGR = −3.21% off the FY2025 base (NOK 11,729mm) | FY2021–25 FCF ranged NOK 1,801mm (FY2024) to NOK 19,733mm (FY2022) — no stable trend, 5-yr average NOK 10,031mm [`earnings/01_historical-financials.md` §1] | FCF volatility itself, not a growth trend, is the dominant historical pattern | Undemanding in isolation — but see note below on why this reading understates the real ask |
| Uniform Adjusted EBITDA margin = 14.02% sustained FY2026–30 | FY2025 actual Adjusted EBITDA margin = 13.9% (28,889/207,971); FY2023 cyclical trough = 11.5%; FY2024 = 12.9% [`earnings/01_historical-financials.md` §1, §4] | `earnings/03_margin-drivers.md` §8 and `earnings/07_earnings-sensitivity.md` §4 both flag the Q1 2026 print (17.2%) as a Middle East supply-shock spike, explicitly "not durable" / expected to "normalize." Only 67% of Q2 2026 primary production is hedged, at USD 3,000/mt — above the FY2023–25 realized band (USD 2,218–2,573/mt) but below the quarter-end spot (USD 3,467/mt), i.e. the company's own forward book already prices a partial, not full, reversion | **Stretch** |

**Reconciling the two solves.** The primary (FCF-CAGR) solve looks undemanding — even a modest FCF decline off the FY2025 base clears the price — but that reading is misleading in isolation: FY2025's FCF (NOK 11,729mm) was itself inflated by a favorable working-capital swing versus FY2024 (NOK 1,801mm), and `04`'s own explicit-forecast FY2026 FCFF (NOK 9,933mm, built bottom-up from revenue/margin/capex) is already ~15% below the FY2025 CFO−capex figure before any market-implied growth is layered on — the two are different FCF definitions (CFO−capex vs NOPAT+D&A−Capex−ΔNWC) sitting at different levels, a limitation of using FY2025's reported figure as a single-point base. The margin solve is built consistently on `04`'s own bottom-up FCFF definition and revenue/capex/NWC path, and is the more reliable read: it says the price requires Hydro to hold its FY2025 actual margin (13.9%) roughly flat indefinitely — **not** the Q1 2026 shock print (17.2%) and **not** even the sell-side consensus embedded in Capital IQ (17.0%/17.3%/16.3% for FY2026–28, which `04` itself overrode as extrapolating a non-run-rate print) — but **above** `04`'s own 13.0% "mid-cycle" anchor, which was deliberately set between the FY2023 trough (11.5%) and the FY2025 actual (13.9%).

In 2–4 sentences: the market's implied expectation is **not** that Hydro grows — it is that Hydro's margin stays exactly where it already sits (13.9%, FY2025 actual) rather than fading toward `04`'s more conservative 13.0% mid-cycle anchor, a difference of about 90bps of Adjusted EBITDA margin held across the whole forecast and terminal period. That is a real ask, not a trivial one: the two upstream earnings modules that examined the current elevated pricing environment both independently call it non-durable, and the company's own forward hedge book (67% of Q2 2026 volume booked below spot) shows the market for physical metal itself already discounting some reversion. This sits between "conservative" and "aggressive" — it does not require the shock to persist, but it does require it not to fully fade to the trough-adjusted mid-cycle Hydro's own DCF assumes, which is a **Stretch**, not a **Yes**.

**Market-ceiling sanity check (commodity-producer adaptation — one-directional).** NHY is a commodity/cyclical operating company (Business-Type Method Map), so a revenue-share-of-TAM test is the wrong tool — Hydro is an LME price-taker on the bulk of its volume, not a share-gaining consumer brand, so revenue growth here is overwhelmingly a price/mix story, not a market-share-capture story. The correct proxy, per the rule's instruction to "substitute the appropriate scale," is the **physical volume/capacity ceiling**: global primary aluminium consumption ex-China is running +1.2% YoY (Q1 2026) and full-year 2026 European extrusion demand growth is guided at only ~1% [`earnings/02_revenue-drivers.md` §Table, citing `first-quarter-report-2026.pdf` p.12, p.16]. `04`'s own revenue path (NOK 213,366mm → 228,071mm, FY2026–30, a ~1.6%/yr CAGR) sits modestly above this physical-demand growth rate but within a plausible band once price/inflation is layered on — it does **not** require Hydro to capture share it has never held. This check therefore does not add an independent kill signal on top of the margin-durability finding above: the achievability question here is about price/cost spread (margin), not about physical volume or market share, and the sanity check confirms the volume assumption in `04`'s own build is not the aggressive part of the ask.

## 4. Robustness

All figures are the primary (FCF-CAGR) solve unless noted, executed via the same Python bisection solver.

| Discount Rate | Implied 5-yr FCF CAGR to Justify Price |
|---|---:|
| WACC − 1% (6.5%) | −7.65% |
| WACC (7.5%, used) | −3.21% |
| WACC + 1% (8.5%) | +0.65% |

| FCF Base (NOK mm) | Implied 5-yr FCF CAGR |
|---|---:|
| Low — 5-yr average FCF, FY2021–25 (NOK 10,031mm) [`earnings/01_historical-financials.md` §1] | +0.21% |
| Base — FY2025 module-standard FCF (NOK 11,729mm) [`04_intrinsic-dcf.md` §1] | −3.21% |
| High — company's own FCF APM, FY2025 (NOK 13,034mm) [`04_intrinsic-dcf.md` §1] | −5.47% |

**Terminal `g` ±0.5% (required — `04`'s own terminal value is 78.1% of EV, well above the ~60% trigger):**

| Terminal `g` | Implied 5-yr FCF CAGR |
|---|---:|
| `g` = 2.0% | −1.55% |
| `g` = 2.5% (used) | −3.21% |
| `g` = 3.0% | −5.03% |

**Which input dominates.** Spread across the three levers: WACC ±1% moves the implied growth rate by **8.30pp** (−7.65% to +0.65%); the FCF-base low/high band moves it by **5.68pp** (+0.21% to −5.47%); terminal `g` ±0.5% moves it by **3.48pp** (−1.55% to −5.03%). For NHY, **WACC is the dominant lever**, not the FCF base — the reverse of the typical cross-company pattern this framework has previously found — because `04`'s DCF is terminal-value-dominated (78.1% of EV sits in the Gordon-growth terminal), and WACC is the single input that discounts that entire terminal block. The margin solve corroborates this: the implied margin needed ranges from 12.76% (WACC 6.5%) to 15.26% (WACC 8.5%), a 2.5pp swing on a ±1% WACC move — a large swing on the single assumption `04` itself already flagged as the one the base case is "most sensitive to."

## 5. What's-Priced-In Read

At NOK 84.96, the market is pricing in Hydro holding its FY2025 actual Adjusted EBITDA margin (13.9%) roughly flat through FY2030 and into perpetuity — about 90bps above `04`'s own 13.0% mid-cycle anchor and well above the FY2023 cyclical trough (11.5%) — while requiring essentially no FCF growth off an already-elevated FY2025 base (implied CAGR −3.21%). That is a **Stretch, tilting aggressive**: it does not need the Q1 2026 Middle East supply-shock spike (17.2% margin) or the current sell-side consensus (~17% FY2026–28) to persist, but it does need the current cycle position to sit durably above `04`'s own conservative trough-adjusted anchor — a bet two upstream earnings modules independently call non-durable, and one the company's own forward hedge book (67% of Q2 2026 volume booked below spot) already partially discounts. Because the DCF is terminal-dominated (78.1% of EV), the single biggest swing factor in this read is WACC, not the near-term growth path — an 8.3pp swing in implied growth across a ±1% WACC band versus a 5.7pp swing across the FCF-base band — so the "what's priced in" verdict is really a joint bet on Hydro's discount rate staying near 7.5% (inside its own disclosed impairment-testing band) **and** its margin not fading toward `04`'s mid-cycle anchor; if either assumption reverts to `04`'s own more conservative base case, the current price loses its support.
