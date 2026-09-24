# Intrinsic DCF — V

Visa Inc. (NYSE: V) is an operating company, so this is an FCFF (free cash flow to the firm) DCF with an EV-to-equity bridge. Visa reports under U.S. GAAP in USD and has a September fiscal year-end. All dollar amounts below are USD millions except per-share values. The decision line is V on the NYSE in USD. [Visa Q3 FY26 Form 10-Q, cover and pp. 3–4]

## 1. FCF Base & Normalizations

Base period: LTM ended 30 June 2026. The first fully forward year discounted is FY27 because FY26 ends 30 September 2026, only seven days after the valuation date. FY26E is used only as the near-term operating anchor.

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | $44,488 | None; reported LTM | [Capital IQ Financials Quarterly workbook, Income Statement, LTM 30-Jun-2026 — vendor export; `ciq_facts.json` `multi_year_trajectory`] |
| EBIT / operating income | $26,996 | None. This is GAAP operating income, not the higher vendor special-item-excluding EBIT series. | [Visa FY25 Form 10-K, p. 60; Visa Q3 FY26 Form 10-Q, p. 4; LTM build in Earnings 01] |
| D&A | $1,342 | Derived as $28,338 GAAP-derived EBITDA less $26,996 GAAP EBIT. | [Visa FY25 Form 10-K, pp. 60, 65; Visa Q3 FY26 Form 10-Q, pp. 4, 10; Earnings 01, §2] |
| Cash from operations (CFO) | $22,580 | None. The CIQ facts sidecar reports this as present and it matches the LTM cash-flow workbook read. | [CIQ Financials → Cash Flow “Cash from Ops.”, LTM 30-Jun-2026; `ciq_facts.json` `ltm_ocf_m`] |
| Total capex | $1,567 | None; purchases of property, equipment and technology. | [Visa FY25 Form 10-K, p. 65; Visa Q3 FY26 Form 10-Q, p. 10; Earnings 01, §2] |
| Reported FCF | $21,013 | `CFO − total capex = $22,580 − $1,567`. No cash-flow add-back is made: recurring litigation exclusions and operating-balance movements are not proven non-recurring. | [CIQ Financials → Cash Flow, LTM 30-Jun-2026; Visa FY25 Form 10-K, p. 65; Earnings 06, §§1, 4–5] |
| Normalized NOPAT tax rate | 17.6% | Uses the moat module’s canonical normalized rate: FY22–FY24 effective-tax average (17.53%, 17.89%, 17.45%). This strips the FY26 nine-month $351m deferred-tax benefit and $217m tax-position benefit that reduced the reported rate. | [Visa FY25 Form 10-K, p. 60; Visa Q3 FY26 Form 10-Q, Note 15, p. 24; Business Model 09, §3] |
| Implied LTM operating working-capital cash absorption | $1,007 | Residual reconciliation: `$26,996 × (1 − 17.6%) + $1,342 − $1,567 − $21,013 = $1,007`. It includes broad operating-balance movements, not a clean receivables/inventory/payables cycle. | [Visa Q3 FY26 Form 10-Q, p. 10; Earnings 06, §§1–3; calculation] |

The FCFF identity is `NOPAT + D&A − capex − ΔNWC`. It reconciles to the reported LTM `CFO − capex` base above. Visa's nine-month FY26 cash flow included a $3,621m deterioration in operating asset/liability movements, including litigation and settlement payables; I do not call this a permanent cash-flow adjustment. [Visa Q3 FY26 Form 10-Q, p. 10; Earnings 06, §10]

## 2. Forecast Assumptions

FY26E revenue is the direct $45,743.58m FY26 consensus, not a sum of quarterly estimates. The cash flows discounted below start in FY27. Every analyst assumption is labelled; no peer-derived inputs are used.

| Assumption | FY26E anchor (not discounted) | FY27 / Yr1 | FY28 / Yr2 | FY29 / Yr3 | FY30 / Yr4 | FY31 / Yr5 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 14.4% (VC) | 12.0% (AA) | 10.0% (AA) | 8.0% (AA) | 6.0% (AA) | 5.0% (AA) | 3.0% (AA) | FY26E is Capital IQ consensus. FY27–FY31 and terminal are **analyst assumptions, not company-guided**, declining from the 14.4% LTM growth and FY26 consensus as the payments-volume base grows. [Capital IQ Estimates → Consensus, FY2026; Visa Q3 FY26 Form 10-Q, p. 4; Earnings 01, §2] |
| EBIT margin % | 62.0% (AA) | 62.5% (AA) | 63.0% (AA) | 63.0% (AA) | 63.0% (AA) | 63.0% (AA) | 63.0% (AA) | **Analyst assumptions, not company-guided.** They sit below FY24's 65.7% GAAP margin but above FY25's 60.0% and the June LTM's 60.7%; the modest recovery assumes slower operating-expense growth but does not erase regulatory, incentive, litigation, or marketing risk. [Visa FY25 Form 10-K, p. 60; Visa Q3 FY26 Form 10-Q, pp. 4, 34–35; Q3 FY26 presentation, pp. 20–21] |
| Tax rate % | 17.6% (FN) | 17.6% (FN) | 17.6% (FN) | 17.6% (FN) | 17.6% (FN) | 17.6% (FN) | 17.6% (FN) | Canonical normalized rate from Business Model 09; see §1. It is not the FY26 reported nine-month rate. [Visa Q3 FY26 Form 10-Q, Note 15, p. 24; Business Model 09, §3] |
| D&A (% of revenue) | 3.0% (AA) | 3.0% (AA) | 3.0% (AA) | 3.0% (AA) | 3.0% (AA) | 3.0% (AA) | Embedded in terminal reinvestment (AA) | **Analyst assumption, not company-guided,** anchored to LTM GAAP-derived D&A of 3.0% of revenue. [Earnings 01, §2] |
| Capex (% of revenue) | 3.5% (AA) | 3.5% (AA) | 3.5% (AA) | 3.5% (AA) | 3.5% (AA) | 3.5% (AA) | Embedded in terminal reinvestment (AA) | **Analyst assumption, not company-guided,** anchored to FY25 3.7% and LTM 3.5% total capex/revenue. [Visa FY25 Form 10-K, pp. 60, 65; Earnings 01, §§1–2] |
| Δ Working capital (% of revenue) | 2.2% (AA) | 1.5% (AA) | 1.0% (AA) | 0.7% (AA) | 0.5% (AA) | 0.4% (AA) | Terminal reinvestment is 13.39% of NOPAT (AA), not this line | **Analyst assumptions, not company-guided.** Each is a positive cash absorption tied to revenue, not a flat dollar amount. The glide path starts below the inferred 2.26% LTM cash drag but gives no working-capital release; FY25 DSO rose from 26.0 to 28.5 days and the broad cash-flow movements are volatile. [Visa FY25 Form 10-K, p. 59; Visa Q3 FY26 Form 10-Q, p. 10; Earnings 06, §§2–3] |

`VC` = vendor consensus, `FN` = filing-normalized calculation, and `AA` = analyst assumption. The revenue path is deliberately below the 13.5% CIQ long-term growth consensus field after FY27; that field is an estimate-based vendor measure, not a company forecast. Visa's Q3 guidance was only low-double-digit to low-teens GAAP nominal revenue growth for FQ4, while the then-current Street FQ4 revenue bar was 18.9% growth. [Capital IQ Estimates → Consensus, Guidance and Revisions, FY2026 / FQ4 FY2026; Q3 FY26 presentation, pp. 20–21; Earnings 04, §§1–3]

Intrinsic confidence: **Low.** The FCF base is reported, but only FY26 has a direct consensus anchor; the FY27–FY31 operating path and the working-capital glide path are analyst-built. The 74.3% terminal-value share adds further model risk.

## 3. Discount Rate (WACC)

WACC is the blended return required by equity, debt, and preferred capital. The computed 9.04% is used; there is no analyst override. The risk-free rate and ERP are web-sourced and therefore unverified under the source hierarchy.

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 5.11% | U.S. 10-year constant-maturity Treasury on 23-Sep-2026. [Web: U.S. Treasury Daily Treasury Par Yield Curve, 2026-09-23, indicative/unverified] |
| Equity-risk premium | 4.14% | U.S. implied ERP, trailing-12-month adjusted-payout measure, 1-Sep-2026. [Web: Aswath Damodaran, Equity Risk Premiums, 2026-09-01, indicative/unverified] |
| Beta | 1.00 used; 0.76 raw five-year CIQ beta | The raw beta is below 0.8, and CIQ does not disclose the index. Visa has price, client-incentive, consumer-cycle, FX, and regulatory exposure, so I apply the required 1.00 floor rather than rely on the raw local-index measurement. | [Capital IQ Public Company Profile, Beta 5Y, created 17-Aug-2026; Business Model 07, competitive-intensity and regulatory-dependence rows; Business Model 10, §§1, 3] |
| Cost of equity | 9.25% | `5.11% + 1.00 × 4.14%` |
| Pre-tax cost of debt | 3.80% | Conservative proxy for the low end of Visa's February 2026 fixed-note coupons (3.80%–4.70%); commercial paper was 3.77% at 30-Jun-2026. This is not represented as the weighted-average rate on all debt. [Visa Q3 FY26 Form 10-Q, Note 8, pp. 17–18] |
| Tax rate | 17.60% | Same normalized rate as NOPAT. [Business Model 09, §3] |
| Equity / debt / preferred weights | 96.482% / 3.444% / 0.074% | $668,435.9m market cap, $23,858m debt, and $514m preferred book value proxy. [Capital IQ Comps → Financial Data, 17-Aug-2026; Visa Q3 FY26 Form 10-Q, pp. 4, 17–18, 22–23; Valuation 01, §§3–4] |
| Preferred cost | 9.25% | No preferred market yield is disclosed; cost-of-equity proxy, immaterial at 0.074% of capital. **Analyst assumption, not company-guided.** |
| **WACC** | **9.04%** | **Computed below** |

Formula: `WACC = w_e·k_e + w_d·k_d·(1 − t) + w_p·k_p`.

The low-side floors are cleared: `k_e − rf = 4.14 percentage points`; used beta is 1.00, above the 0.8 floor; and no country-risk premium is added deliberately because Visa's USD cash flows are global rather than concentrated in a single emerging/non-reserve-currency market. The raw 0.76 beta is shown rather than hidden. The high-side check also clears: 9.25% cost of equity is below `5.11% + 1.4 × 4.14% = 10.91%`. After-tax debt cost is 3.13%, so `3.13% ≤ 9.04% < 9.25%` holds.

## 3A. Cost-of-Capital Reality Test

| Reference | Rate | Source (cite per §5) | Gap vs model WACC |
|---|---:|---|---:|
| Model WACC (CAPM build, §3) | 9.04% | This agent, §3 | — |
| Scope-matched group discount rate | Group discount rate not disclosed | Visa's filings do not disclose a listed-group WACC, cost of equity, or impairment rate for the group cash flows being valued. | Not assessable |
| Other disclosed rate (comparator only) | 4.11% | FY25 operating-lease weighted-average discount rate. It values lease obligations, not Visa's group operating cash flows; U.S.-dollar, lease-liability, post-tax basis is not disclosed. [Visa FY25 Form 10-K, Note 9, p. 82] | (4.93)pp |
| Market-implied rate | Runs after this agent — reconcile in 05_reverse-dcf | No reverse-DCF output exists yet. | Not assessable |
| Trailing FCF yield / earnings yield | 3.14% / 3.24% | FCF yield is `$21,013 / $668,436`; earnings yield is `1 / 30.9x`. These are equity yields, not direct WACC substitutes. [Visa FY25 Form 10-K, p. 65; Capital IQ Comps → Financial Data, 17-Aug-2026; `ciq_facts.json` `pe_ltm_current_x`; calculation] | (5.90)pp / (5.80)pp |
| Peer / industry cost of capital | Not assessable | No source-bound peer/industry cost-of-capital input was available. | Not assessable |

Escalation branch: not triggered. There is no scope-matched company rate, and the reverse-DCF runs after this report; the model WACC is also 1.24pp above, not below, the 7.8% preliminary moat-module CAPM inference that used the unadjusted 0.76 beta. [Business Model 09, §3]

## 4. Free Cash Flow Forecast & Discounting

Mid-year convention is used: FY27–FY31 cash flows are discounted at `t − 0.5`, because they are earned through each fiscal year. FCF is `NOPAT + D&A − capex − ΔNWC`. D&A, included in the formula but not repeated in the required table columns, is $1,537m, $1,691m, $1,826m, $1,935m, and $2,032m for FY27–FY31 respectively.

| Year | Revenue | EBIT | NOPAT | Capex | ΔWC | FCF | Discount Factor | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FY27 | $51,233 | $32,021 | $26,385 | $1,793 | $768 | $25,360 | 0.957654 | $24,286 |
| FY28 | $56,356 | $35,504 | $29,256 | $1,972 | $564 | $28,410 | 0.878265 | $24,952 |
| FY29 | $60,865 | $38,345 | $31,596 | $2,130 | $426 | $30,866 | 0.805457 | $24,861 |
| FY30 | $64,516 | $40,645 | $33,492 | $2,258 | $323 | $32,847 | 0.738685 | $24,263 |
| FY31 | $67,742 | $42,678 | $35,166 | $2,371 | $271 | $34,557 | 0.677449 | $23,410 |

Each modeled `ΔNWC` is positive, so it is a cash use and correctly reduces FCF. The forecast does not hold a flat absolute working-capital charge: FY27's $768m is 1.5% of revenue and FY31's $271m is 0.4% of revenue. It does not assume a release of cash from the operating-balance movements.

Sum of PV of explicit FCFs: **$121,773m**.

Executed calculation (Python 3.12; all values in USD millions except per-share output):

```bash
/usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -c 'rf,erp,beta,kd,t,e,d,p=.0511,.0414,1.,.038,.176,668435.9,23858.,514.;ke=rf+beta*erp;we,wd,wp=e/(e+d+p),d/(e+d+p),p/(e+d+p);w=we*ke+wd*kd*(1-t)+wp*ke;r=[51232.810,56356.091,60864.578,64516.452,67742.274];m=[.625,.63,.63,.63,.63];n=[a*b*(1-t) for a,b in zip(r,m)];f=[x+a*.03-a*.035-a*b for x,a,b in zip(n,r,[.015,.010,.007,.005,.004])];df=[1/(1+w)**(i-.5) for i in range(1,6)];pv=sum(x*y for x,y in zip(f,df));g,roic=.03,.224;f6=n[-1]*(1+g)*(1-g/roic);tv=f6/(w-g);pvtv=tv*df[-1];ev=pv+pvtv;eq=ev-11499-514;print(f"wacc={w:.4%}; pv_explicit={pv:.3f}; fcff_32={f6:.3f}; tv={tv:.3f}; pv_tv={pvtv:.3f}; ev={ev:.3f}; equity={eq:.3f}; per_share={eq/1898:.3f}")'
```

```text
wacc=9.0393%; pv_explicit=121772.691; fcff_32=31370.285; tv=519436.741; pv_tv=351891.776; ev=473664.468; equity=461651.468; per_share=243.230
```

## 5. Terminal Value

Method: Gordon growth with a financeable-growth adjustment. The standard formula is `TV = FCFF_(n+1) / (WACC − g) = FCFF_n × (1 + g) / (WACC − g)`. Here, the terminal `FCFF_(n+1)` is first made financeable: `FCFF_32 = NOPAT_32 × (1 − g / ROIC)`. At the conservative 22.4% moat-module ROIC, 3.0% terminal growth requires 13.39% reinvestment.

- FY32 NOPAT: `$35,166 × 1.03 = $36,221m`.
- Terminal reinvestment: `$36,221 × (3.0% / 22.4%) = $4,851m`.
- Terminal FCFF: `$36,221 − $4,851 = $31,370m`.
- Terminal value: `$31,370 / (9.0393% − 3.0%) = $519,437m`.
- PV of terminal value: `$351,892m`.
- **Terminal value as % of total EV: 74.3%.** It is just below the 75% terminal-dominance trigger, but still makes the WACC and terminal-reinvestment assumptions the main sources of dispersion.

The financeable-growth check is binding. FY31's explicit net capex plus working-capital investment is only `$2,371 − $2,032 + $271 = $610m`, whereas the terminal steady-state calculation requires $4,851m of reinvestment. The $4,241m gap is not ignored: it is the reason terminal FCFF is $31,370m rather than a mechanical FY31 FCF grown by 3%. This is an inference from the ROIC-and-reinvestment formula, not a filing disclosure. [Business Model 09, §3; calculation]

The Gordon value implies a terminal `EV / EBITDA` of 11.28x (`$519,437 / $46,050`). That is below the 21.6x current CIQ LTM EV/EBITDA read, so the exit-multiple cross-check does not rely on retaining the current multiple in perpetuity. It is a mechanical check only: the admitted evidence does not provide an independent mature-network exit-multiple anchor. [CIQ Financials → Multiples “TEV/LTM EBITDA”, latest; `ciq_facts.json` `ev_ebitda_current_x`; calculation]

Structural-decline / runoff trigger: **not fired.** Business Model 09 finds a strong moat with a stable, not widening, trajectory, and Business Model 07 scores disruption risk at 55/100, above the ≤40 runoff trigger. The base therefore permits excess returns but uses a 3.0% nominal USD terminal growth rate and 22.4% rather than the higher current ROIC read. [Business Model 09, §§3, 5; Business Model 07, industry rate-of-change row]

## 6. DCF Output

| Step | Value |
|---|---:|
| PV of explicit FCFs | $121,773m |
| + PV of terminal value | $351,892m |
| **= Enterprise value** | **$473,664m** |
| − Net debt | ($11,499m) strict basis |
| − Minority / preferred | ($514m) preferred; no separately reported NCI |
| **= Equity value** | **$461,651m** |
| ÷ Diluted shares | 1,898m |
| **= Intrinsic value per share** | **$243.23** |
| vs current price | $364.15 pool close, 17-Aug-2026: **(33.2%)**; price is 26 trading days stale. Fresh $361.52 web context gives **(32.7%)**, but is unverified. |

The bridge uses the canonical strict net debt of `$23,858m debt − $12,359m cash equivalents = $11,499m`, not CIQ's $10,066m broad basis that also nets current investment securities. The per-share denominator is the 1,898m Q3 diluted weighted-average Class-A-equivalent count. [Visa Q3 FY26 Form 10-Q, pp. 4, 14, 17–18, Note 12; Valuation 01, §§2, 5, 7]

## 7. Sensitivity Grid (per-share intrinsic value)

WACC across columns, terminal growth down rows. Every cell retains the financeable terminal reinvestment rate of `g / 22.4%`; no cell has a near-zero `WACC − g` denominator.

| | WACC 8.04% | WACC 9.04% | WACC 10.04% |
|---|---:|---:|---:|
| g 3.5% | $311.02 | $255.71 | $217.27 |
| g 3.0% | $290.92 | $243.23 | $209.06 |
| g 2.5% | $274.39 | $232.61 | $201.90 |

## 8. Intrinsic Read

The base-case intrinsic value is **$243.23 per V share**, with a $201.90–$311.02 sensitivity dispersion; it is 33.2% below the stale $364.15 pool close and 32.7% below the fresh but unverified $361.52 web close. The model is most sensitive to the 9.04% WACC and the terminal reinvestment needed to make even 3.0% perpetual growth financeable, not to the explicit FY27–FY31 revenue path.
