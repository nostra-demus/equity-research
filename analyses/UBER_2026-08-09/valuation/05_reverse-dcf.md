# Reverse DCF — What's Priced In — UBER

Reporting standard: US GAAP. Reporting currency: USD millions, except per-share figures. This agent inverts the SAME model as `valuation/04_intrinsic-dcf.md` — the same WACC, the same terminal growth rate, the same 10-year horizon, and the same mid-year discounting convention are used verbatim below. The FCF base is rebuilt at the Year-0 (FY2025A) anchor point using `04`'s own stated formula (NOPAT + D&A − Capex + working-capital cash source), because `04` publishes this base only from Year 1 forward; the construction is cross-validated against `04`'s own Year-1 figure below (§1).

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $68.18 (2026-08-06, last close, pool-verified) | `01_price-and-capital-structure.md` §1 |
| Enterprise value (current, market) | $149,684.7M | `01_price-and-capital-structure.md` §4 (ties to CIQ TEV with no plug) |
| Net debt (broad basis, canonical) | $9,340M | `01` §5 |
| FCF (unlevered FCFF) base, Year 0 (FY2025A) | **$7,006.4M** | Rebuilt using `04`'s exact formula: NOPAT ($5,565M EBIT × (1−21%) = $4,396.4M) + D&A ($719M) − Capex ($336M) + working-capital cash source ($2,227M, FY2025 disclosed CFO-bridge figure) = $7,006.4M. EBIT, tax rate, D&A, Capex and the WC figure are all taken verbatim from `04_intrinsic-dcf.md` §1–2 and `business-model/09_moat.md` §3 (D&A) |
| Discount rate (WACC) | **9.20%** (9.203%) | Taken verbatim from `04_intrinsic-dcf.md` §3: k_e 9.83% (CAPM: rf 4.65% + β1.15 × ERP 4.5%), after-tax k_d 3.32%, weights 90.43%/9.57% by market value |
| Terminal growth (g) | **3.5%** (nominal) | Verbatim from `04` §5 |
| Forecast horizon | 10 years (FY2026E–FY2035E) | Verbatim from `04` §2, §4 |
| Discounting convention | Mid-year (t − 0.5) | Verbatim from `04` §4 |

**Cross-validation of the Year-0 FCFF construction.** Growing the $7,006.4M base at 04's own implied Year-1 growth rate reproduces 04's own Year-1 FCFF almost exactly: $7,006.4M × (1 + 12.08%) = $7,852.0M vs. 04's reported Year-1 FCFF of $7,852.2M — a ~$0.2M rounding difference. This confirms the Year-0 base is built on the identical methodology as the rest of 04's forecast, not an independent re-derivation.

## 2. Implied Expectations

**What was held fixed:** WACC (9.20%), terminal growth (3.5%), the 10-year horizon, mid-year discounting, and the FY2025A FCFF base ($7,006.4M). **What was solved for:** a single constant annual FCFF growth rate (applied uniformly across all 10 explicit years) that makes the present value of the forecast (explicit FCFFs + Gordon-growth terminal value) equal today's EV ($149,684.7M) — solved with `scipy.optimize.brentq`. Two secondary solves follow the same target-EV logic with a different variable held free.

**Executed solver (primary solve):**
```
$ python3 -c "
from scipy.optimize import brentq
WACC=0.09203; g_term=0.035; target_EV=149684.7; FCFF0=7006.4
def df(t): return 1/(1+WACC)**(t-0.5)
def ev(g):
    pv=sum(FCFF0*(1+g)**t*df(t) for t in range(1,11))
    fcff10=FCFF0*(1+g)**10
    tv=fcff10*(1+g_term)/(WACC-g_term)
    return pv+tv*df(10)
g=brentq(lambda g: ev(g)-target_EV, -0.3, 0.6, xtol=1e-8)
print('implied g=', round(g*100,3),'%  EV check=', round(ev(g),1))
"
implied g= 5.049 %  EV check= 149684.7
```
Terminal value = 60.2% of the solved EV — just above the ~60% dominance threshold, so §4 below also stresses terminal g ±0.5%.

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCF CAGR over the 10-year horizon (constant, WACC 9.20%, terminal g 3.5%) | **5.05%** |
| Implied years of above-GDP growth (fade model: FCFF grows at 12% — 04's own Year-1 FCFF growth rate — for N years, then drops straight to the 3.5% terminal rate forever) | **~1.5 years** |
| Implied steady-state EBIT margin (holding 04's own revenue, capex, D&A and working-capital $ path fixed; solving for a single constant margin instead of 04's 12.5%→13.2%→12.8% ramp) | **10.78%** |

**Fade-model solver (secondary):**
```
$ python3 -c "
WACC=0.09203; g_term=0.035; target_EV=149684.7; FCFF0=7006.4; g_high=0.12
def df(t): return 1/(1+WACC)**(t-0.5)
def ev(N):
    pv=0.0; fcff=FCFF0
    for t in range(1,N+1):
        fcff=FCFF0*(1+g_high)**t; pv+=fcff*df(t)
    tv=fcff*(1+g_term)/(WACC-g_term)
    return pv+tv*df(N)
print('N=1:',round(ev(1),1),' N=2:',round(ev(2),1),' target:',target_EV)
"
N=1: 143789.4   N=2: 154981.5   target: 149684.7
```
Linear interpolation between N=1 ($143,789.4M) and N=2 ($154,981.5M) against the $149,684.7M target gives **N ≈ 1.53 years**.

**Margin solver (secondary):**
```
$ python3 -c "
from scipy.optimize import brentq
WACC=0.09203; g_term=0.035; target_EV=149684.7; tax=0.21
rev=[57842.9,67039.9,75084.7,82593.2,89613.6,96334.6,102596.4,108239.2,113651.1,118765.4]
da=[752.0,938.6,1126.3,1404.1,1702.7,1926.7,2154.5,2381.3,2500.3,2612.8]
capex=[347.1,536.3,750.8,1073.7,1433.8,1734.0,2051.9,2273.0,2500.3,2612.8]
wc=[1735.3,1676.0,1651.9,1651.9,1613.0,1541.4,1436.3,1298.9,1250.2,1187.7]
def df(t): return 1/(1+WACC)**(t-0.5)
def ev(m):
    pv=0.0; fcffs=[]
    for i in range(10):
        f=rev[i]*m*(1-tax)+da[i]-capex[i]+wc[i]; fcffs.append(f); pv+=f*df(i+1)
    tv=fcffs[-1]*(1+g_term)/(WACC-g_term)
    return pv+tv*df(10)
m=brentq(lambda m: ev(m)-target_EV, -0.2, 0.6, xtol=1e-9)
print('implied margin=', round(m*100,3),'%')
"
implied margin= 10.777 %
```

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied FCFF CAGR = 5.05% (10yr) | Revenue CAGR FY2023→FY2025 = 18.1%; FCF (CFO−Capex) CAGR FY2023→FY2025 = 70.4% (inflated by the post-loss margin recovery, not a repeatable base rate). 04's own base-case forecast — built off a fading revenue path (11.2%→4.5%) and a margin ramp to 13.2% — implies a 6.54% FCFF CAGR over the same 10 years | `earnings/01` §6: revenue growth decelerating from ~17–18% (FY23–25) to +14.5%/+12.2% headline YoY in the last two quarters, but Gross Bookings growth has stayed above 20% constant-currency for 4 consecutive quarters, and `earnings/07` ranks Driver/Courier payment ratio and volume growth as currently favorable trends | **Yes — well within reach.** Even 04's own conservative, fading 10-year forecast (6.54%) clears the 5.05% the price requires |
| Implied years of above-GDP growth ≈ 1.5 years (at a 12% FCFF growth phase, 04's own Yr-1 rate) | N/A (forward-looking) | `business-model/09_moat.md` §5: moat verdict **Narrow, but widening** — ROIC has been above the ~9.7% estimated WACC for the last 1–2 years (FY2024 +6.0%, FY2025 +9.4%, LTM +10.6%), though the 5-year through-cycle average (+0.85%) remains below WACC. `business-model/07_business-quality.md` scores industry rate-of-change/disruption risk (AV) at 32/100 — a real but longer-dated risk, not one with evidence of crystallizing inside 1.5 years | **Yes, conservative.** 04's own base case explicitly assumes 10 full years of above-GDP-adjacent growth (revenue growth stays at or above 4.5% through Year 10); nothing in the moat or business-quality evidence points to growth collapsing to GDP-level within ~1.5 years — the AV-disruption risk that could eventually cap growth is a multi-year, not an 18-month, risk per the same evidence |
| Implied steady-state EBIT margin = 10.78% | FY2025A actual EBIT margin = 10.70% (already achieved); TTM (Jun-30-2026) actual EBIT margin = 12.13% (already 143bps above the implied level); Q2 FY26 quarterly EBIT margin ≈13.3% | `earnings/03_margin-drivers.md` (cited in 04 §2): genuine ex-UK cost-of-revenue leverage of +377bps in Q2 FY26 alone; Mobility segment Adjusted EBITDA margin rose 22.4%→26.6% FY24→FY25 | **Yes — already exceeded.** The price does not require any further margin expansion beyond what Uber had already delivered by FY2025A, and the business is already running materially above that level on a trailing basis |

**Judgment.** On all three tests, the price is pricing in less than what the company has already delivered or than 04's own base-case forecast assumes. The implied 5.05% FCFF CAGR sits well below both the 18.1% historical revenue CAGR (FY2023–2025) and 04's own 6.54% base-case FCFF CAGR; the implied ~1.5 years of above-GDP growth is a small fraction of the 10 years of above-GDP-adjacent growth 04's own model assumes, with no evidence in the moat or business-quality modules of growth collapsing that fast; and the implied 10.78% steady-state EBIT margin is a level Uber has already surpassed on a trailing basis (TTM 12.13%). This reads as **conservative**, not aggressive — consistent with 04's own finding that its base-case intrinsic value ($79.82) sits +17.1% above the current price.

**Market-ceiling sanity check.** Uber is an operating (not financial/REIT) business, so a revenue-size test applies. Holding the FCFF/Revenue conversion ratio fixed at FY2025A's 13.47%, the primary 5.05% FCFF CAGR translates to an implied Revenue CAGR of **5.05%** (identical, since the ratio is held fixed) and an implied FY2035E revenue of **~$85.1bn** (vs. $52.0bn in FY2025A). Uber's own current disclosed run-rate already dwarfs this: Q2 FY26 quarterly Gross Bookings were $58.0bn [Q2 FY26 10-Q], an annualized pace of roughly $220–230bn, several multiples of the $85.1bn revenue figure the price implies for a decade out. Third-party estimates of the global ride-hailing addressable market for 2026 found via web search range from roughly $55bn to $335bn across six vendor reports — a ~6x dispersion with no disclosed common methodology, and several estimates already sit below Uber's own current global Mobility Gross Bookings alone — so this market-ceiling test cannot be applied with numeric precision and no specific TAM figure is used as a hard constraint (CLAUDE.md §4, low-tier input). Qualitatively, since the implied revenue trajectory is a small fraction of Uber's own already-realized scale, this check does not push the read toward "aggressive" — consistent with the rule that it can only raise the bar, this one simply does not bind.

## 4. Robustness

| Discount Rate | Implied FCF CAGR to Justify Price |
|---|---:|
| WACC −1% (8.20%) | 2.63% |
| WACC (9.20%, base) | 5.05% |
| WACC +1% (10.20%) | 7.21% |

**FCF-base stress (dominant sensitivity).** Three definitions of the FY2025A/TTM FCFF base, all built on 04's own formula, all holding WACC (9.20%) and terminal g (3.5%) fixed:

| FCF Base (definition) | FCFF₀ | Implied FCF CAGR |
|---|---:|---:|
| Low — FY2025A, working-capital cash source stripped out entirely (the method-tension case 04 §5 itself flags: NOPAT + D&A − Capex, no WC add-back) | $4,779.4M | 10.02% |
| Base — FY2025A, 04's full methodology (NOPAT + D&A − Capex + WC source) | $7,006.4M | 5.05% |
| High — TTM (Jun-30-2026), same methodology | $7,986.0M | 3.35% |

**The FCF base is the dominant sensitivity, not the discount rate.** The WACC ±1pp band swings the implied CAGR by 4.58 points (2.63%–7.21%, a range straddling the 5.05% base); the FCF-base band swings it by 6.67 points (3.35%–10.02%) — a wider spread from a plausible, evidence-grounded set of base-year definitions than from a full 1-point move in the discount rate. This matches 04's own observation that Uber's disclosed working-capital cash source (the self-insurance-reserve buildup) creates real method sensitivity in the base year, not just in the terminal value.

**Terminal-g stress (triggered — TV = 60.2% of EV, above the ~60% threshold).**

| Terminal g | Implied FCF CAGR to Justify Price |
|---|---:|
| g = 3.0% (−0.5pp) | 5.74% |
| g = 3.5% (base) | 5.05% |
| g = 4.0% (+0.5pp) | 4.29% |

Terminal g moves the answer by about 1.45 points across a full 1-point range — smaller than either the WACC or FCF-base bands, but not negligible given the primary solve's own TV share sits right at the escalation threshold.

## 5. What's-Priced-In Read

At $68.18, the market is pricing in roughly 5.05% annual free-cash-flow growth over the next 10 years, only about 1.5 years of above-GDP growth before the model must fall to a permanent 3.5% terminal rate, and a steady-state operating margin (10.78%) Uber's trailing 12 months (12.13%) has already beaten. That is **conservative**: it sits below both the company's own 18.1% two-year historical revenue CAGR and 04's own base-case forecast (6.54% FCFF CAGR, +17.1% fair value premium to price), and the moat and business-quality evidence show no basis for growth collapsing to GDP-level within 18 months. The FCF-base definition, not the discount rate, is what would most change this read — using a TTM-based, working-capital-inclusive base instead of the FY2025A anchor drops the implied hurdle to 3.35%, an even easier bar; only stripping out the disclosed working-capital cash source entirely (04's own flagged method tension) pushes the implied hurdle up to 10.02%, still below the 18.1% historical rate. On balance, the market's implied expectations for UBER look conservative relative to what the company has already delivered — this is a valuation-layer input for `07_scenario-and-fair-value`, not a standalone verdict.
