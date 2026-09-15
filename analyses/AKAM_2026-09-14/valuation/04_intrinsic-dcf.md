# Intrinsic DCF — AKAM

AKAM is an operating business, so the valuation method is an FCFF-style DCF with an EV-to-equity bridge. It reports under U.S. GAAP in USD; all amounts below are USD millions except per-share data. This is a cash-flow cross-check, not a view of what the current price implies.

## 1. FCF Base & Normalizations

The cash-flow anchor is the LTM period ended 30 June 2026. I use the module's cash identity, `FCFF approximation = CFO − total cash capex`, because a cash-flow statement exists. NOPAT is shown as a profitability and terminal-financeability control, but it is not added again to FCF; doing so would double count items already in CFO. The DCF counts only the estimated H2 FY2026 cash flow because the latest cash balance already includes H1 FY2026.

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | 4,322.8 | LTM to 30 Jun. 2026; no normalization. | [FY2025 Form 10-K, Consolidated Statements of Income, p.54; Q2 FY2026 Form 10-Q, Statements of Income, p.5] |
| GAAP EBIT | 455.7 | LTM operating income. It is used only as a margin control, because future consensus EBITDA/EBIT definitions are not reconciled to GAAP. | [FY2025 Form 10-K, p.54; Q2 FY2026 Form 10-Q, p.5] |
| CFO | 1,447.2 | LTM CFO; H1 FY2026 CFO was 638.8 versus 710.3 a year earlier, so the first forecast CFO margin is below LTM. | [FY2025 Form 10-K, Statements of Cash Flows, pp.55–56; Q2 FY2026 Form 10-Q, pp.7–8; CIQ Financials → Cash Flow, LTM Jun. 2026 — vendor export, reconciled] |
| Total cash capex | (817.3) | Purchases of property/equipment plus capitalized internal-use software. It is the filing-based cash-capex definition, not management's unreconciled “CapEx” measure. | [FY2025 Form 10-K, p.55; Q2 FY2026 Form 10-Q, p.7] |
| Reported FCF | 629.9 | `1,447.2 − 817.3`; this is the observed cash benchmark. No one-off cash inflow was identified. | [FY2025 Form 10-K, pp.55–56; Q2 FY2026 Form 10-Q, pp.7–8] |
| Operating working capital | 522.5 at FY2025 | The forecast uses NWC as a percentage of revenue. The FY2025 build is receivables + prepaids − payables − accrued expenses excluding income taxes − deferred revenue − other current liabilities. | [Capital IQ Financials → Balance Sheet, FY2025 — vendor export; Earnings Historical Financials, §1] |
| Tax rate for NOPAT and WACC | 19.0% | Normalized model rate. It excludes the H1 FY2026 16.4% reported rate because the filing identifies excess SBC tax benefits, a state-credit valuation-allowance change, and R&D-credit benefits. The FY2026–FY2029 consensus effective-tax-rate series is about 19%; this is a modeling assumption, not company guidance. | [Q2 FY2026 Form 10-Q, Note 12, p.24; Capital IQ Estimates → Consensus, Effective Tax Rate, FY2026–FY2029 — vendor export] |

FY2025 reported FCF was $699.3m, while LTM FCF fell to $629.9m. The lower LTM base is the conservative starting point. Stock-based compensation remains a material limitation: FY2025 SBC was $459.4m and H1 FY2026 SBC was $275.0m. CFO adds it back as a non-cash charge, while the per-share bridge uses the latest disclosed diluted shares; future award dilution cannot be rebuilt from the pool. [FY2025 Form 10-K, pp.34, 54–56; Q2 FY2026 Form 10-Q, Note 13, p.24]

## 2. Forecast Assumptions

`C` = direct Capital IQ consensus estimate; `A` = analyst assumption, not company-guided. The FY2026–FY2028 revenue cells use consensus; the export has no single workbook snapshot date, so its current figures carry that freshness limitation. The FY2026 company revenue range is $4,445m–$4,530m, and the FY2026 consensus value of $4,491.3m sits within it. [Q2 FY2026 earnings release, Financial guidance, p.2; Capital IQ Estimates → Consensus, FY2026–FY2028 — vendor export]

| Assumption | FY2026E | FY2027E | FY2028E | FY2029E | FY2030E | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 6.7% (C) | 13.1% (C) | 11.5% (C) | 8.0% (A) | 6.0% (A) | 0.8% (A) | FY2026–FY2028 revenue is $4,491.3m / $5,078.7m / $5,662.3m from consensus. FY2029–FY2030 fade as the CIS ramp matures. [Capital IQ Estimates → Consensus, FY2026–FY2028 — vendor export; Q2 FY2026 earnings call, prepared remarks and Q&A] |
| GAAP EBIT margin % | 10.5% (A) | 12.0% (A) | 13.0% (A) | 13.5% (A) | 14.0% (A) | 14.0%, but return on capital fades to WACC (A) | Starts at LTM GAAP EBIT margin of 10.5%; FY2030 remains below FY2023's 16.7%. Q2 FY2026 GAAP EBIT margin was 7.3%, so the recovery is an assumption, not guidance. [FY2025 Form 10-K, p.54; Q2 FY2026 Form 10-Q, p.5] |
| Tax rate % | 19.0% (A) | 19.0% (A) | 19.0% (A) | 19.0% (A) | 19.0% (A) | 19.0% (A) | Normalized rate described in §1; excludes the disclosed H1 FY2026 discrete benefits. [Q2 FY2026 Form 10-Q, Note 12, p.24] |
| CFO (% of revenue) | 30.0% (A) | 31.0% (A) | 32.0% (A) | 33.0% (A) | 33.5% (A) | 33.5% (A) | H1 FY2026 CFO margin was 29.4%; LTM was 33.5%. The path assumes cash conversion returns only to the LTM level, not above it. [FY2025 Form 10-K, pp.55–56; Q2 FY2026 Form 10-Q, pp.7–8] |
| Cash capex (% of revenue) | 20.0% (A) | 20.0% (A) | 19.5% (A) | 19.0% (A) | 18.5% (A) | 18.5% (A) | LTM filing-based cash capex was 18.9% of revenue. Management's roughly 40%-of-revenue FY2026 “CapEx” guide is not used as the same metric because the company does not reconcile it to cash capex. [Q2 FY2026 Form 10-Q, p.7; Q2 FY2026 earnings call, CFO prepared remarks] |
| NWC (% of revenue) | 13.0% (A) | 12.5% (A) | 12.0% (A) | 11.7% (A) | 11.5% (A) | 11.5% (A) | Begins near the FY2025 12.4% working-capital base, then improves modestly. It is a revenue-linked driver, not a flat-dollar assumption. [Capital IQ Financials → Balance Sheet, FY2025 — vendor export; Earnings Quality, §3] |

The forecast deliberately does not use FY2026 consensus EBITDA or EBIT as if it were GAAP. The vendor's FY2026 EBITDA forecast is $1,749.3m, materially above the LTM vendor figure of $1,079.9m, while management guides non-GAAP operating margin rather than GAAP margin. There is no supplied reconciliation proving that those forward measures equal the GAAP-derived EBITDA or EBIT used in the historical report. [Capital IQ Estimates → Consensus, FY2026 — vendor export; Q2 FY2026 earnings release, Financial guidance, p.2]

## 3. Discount Rate (WACC)

WACC is the blended cost of debt and equity — the return both lenders and shareholders require. I use market-value weights and the same 19.0% normalized tax rate as NOPAT. There is no discretionary WACC override.

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.83% | [Web: U.S. Treasury daily par yield curve, 10-year Treasury, 2026-09-09 (unverified)](https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?field_tdr_date_value_month=202609&type=daily_treasury_yield_curve) |
| Equity-risk premium | 4.23% | [Web: Damodaran U.S. implied ERP, data update 2026-01-09 (unverified)](https://pages.stern.nyu.edu/adamodar/New_Home_Page/datacurrent.html) |
| Beta | 1.00 used | Raw AKAM beta was 0.63 on a five-year monthly window versus the S&P 500; it is floored at 1.00 because Akamai is price-competed and carries material data-centre capacity exposure. [Web: Yahoo Finance, AKAM, 5Y monthly beta versus S&P 500, accessed 2026-09-14 (unverified)](https://finance.yahoo.com/quote/AKAM/?p=AKAM); [Q2 FY2026 Form 10-Q, MD&A—Revenue and Cost of Revenue, pp.30–32] |
| Cost of equity | 9.06% | `4.83% + 1.00 × 4.23%` |
| Pre-tax cost of debt | 0.55% | Principal-weighted effective interest rate on the five convertible-note tranches: $42.237m annualized effective interest ÷ $7,640m principal. [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–20] |
| Tax rate | 19.0% | Normalized tax rate in §1. |
| Equity / debt weights | 66.99% / 33.01% | $15,345.7m market capitalization and $7,562.8m filing carrying debt. [Price & Capital Structure, §§3–4; Q2 FY2026 Form 10-Q, pp.3–4] |
| **WACC** | **6.22%** | `0.669869 × 9.06% + 0.330131 × 0.55% × (1 − 19.0%)` |

The required bounds pass: after-tax debt cost is 0.45% ≤ WACC 6.22% < cost of equity 9.06%; `k_e − r_f` is 4.23 percentage points; and 9.06% is below `4.83% + 1.4 × 4.23% = 10.75%`. No country-risk premium is added. This is a deliberate choice, not an assertion of zero country risk: AKAM reports in USD and the pool does not show cash flows concentrated in an emerging or non-reserve-currency market, though international revenue was 50% of Q2 revenue. [Q2 FY2026 Form 10-Q, p.31]

## 3A. Cost-of-Capital Reality Test

| Reference | Rate | Source (cite per §5) | Gap vs model WACC |
|---|---:|---|---:|
| Model WACC (CAPM build, §3) | 6.22% | This agent, §3 | — |
| Scope-matched group discount rate | **Group discount rate not disclosed** | The 10-K describes annual goodwill testing for one reporting unit but does not disclose a group WACC, cost of equity, or impairment discount rate. [FY2025 Form 10-K, Goodwill and Acquired Intangible Assets; Q2 FY2026 Form 10-Q, Note 5] | N/A |
| Other disclosed rate — comparator only | 3.6% / 4.4% / 5.1% | Real-estate, co-location, and data-centre operating-lease discount rates. These are obligation-specific lease rates, not a group WACC or cost of equity. [FY2025 Form 10-K, Note 15 (Leases), p.80] | −2.6pp / −1.8pp / −1.1pp |
| Market-implied rate | Not available | `05_reverse-dcf` runs after this report and must test the same cash-flow base and WACC. | N/A |
| Trailing FCF yield / earnings yield | 4.10% / 2.58% | `629.9 ÷ 15,345.7` and `$2.75 LTM GAAP EPS ÷ $106.79`; equity yields are cross-checks, not directly comparable to WACC. [Historical Financials, §2; Price & Capital Structure, §§1–3] | N/A |
| Peer / industry cost of capital | Not proven from available data | No scope-matched peer WACC is present in the frozen pool. | N/A |

**Escalation branch:** no `RF-VAL-003` trigger is testable at this point: a scope-matched group rate is not disclosed and the market-implied rate belongs to the later reverse-DCF. The low coupon cost of debt reflects existing convertibles; it is not evidence that new debt could be raised at 0.55%.

## 4. Free Cash Flow Forecast & Discounting

The operational rows are full fiscal-year forecasts. The first discounted cash-flow row uses only H2 FY2026: full-year forecast FCF of $449.1m less reported H1 FCF of $221.2m (`$638.8m CFO − $417.6m cash capex`). This prevents cash already reflected in the 30 June 2026 balance sheet from being counted twice. Cash flows are discounted from the last filed balance-sheet date using mid-period timing: 0.25 years for H2 FY2026, then 1.0, 2.0, 3.0, and 4.0 years for FY2027–FY2030. The price is 14 September 2026, so the June balance-sheet/September-price mismatch remains a stated limitation. [Q2 FY2026 Form 10-Q, pp.3, 7–8; Price & Capital Structure, §1]

| Year | Revenue | EBIT | NOPAT | CFO | Capex | ΔNWC | Full-year FCF | DCF cash used | Discount Factor | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026E | 4,491.3 | 471.6 | 382.0 | 1,347.4 | (898.3) | +61.4 | 449.1 | 227.9 (H2 only) | 0.985035 | 224.5 |
| FY2027E | 5,078.7 | 609.4 | 493.7 | 1,574.4 | (1,015.7) | +51.0 | 558.7 | 558.7 | 0.941471 | 526.0 |
| FY2028E | 5,662.3 | 736.1 | 596.2 | 1,812.0 | (1,104.2) | +44.6 | 707.8 | 707.8 | 0.886367 | 627.4 |
| FY2029E | 6,115.3 | 825.6 | 668.7 | 2,018.1 | (1,161.9) | +36.0 | 856.1 | 856.1 | 0.834489 | 714.4 |
| FY2030E | 6,482.3 | 907.5 | 735.1 | 2,171.6 | (1,199.2) | +30.0 | 972.3 | 972.3 | 0.785646 | 763.9 |

`Full-year FCF = CFO − cash capex`. NOPAT, D&A, and working capital are not separately added into that FCF row because CFO already contains their cash effect. D&A is 17.0% / 17.5% / 18.0% / 18.0% / 17.5% of revenue in FY2026–FY2030, respectively, and is used only for the terminal financeability check.

**Working-capital sign check:** modeled NWC increases from $522.5m at FY2025 to $583.9m, $634.8m, $679.5m, $715.5m, and $745.5m. The annual changes shown as +$61.4m, +$51.0m, +$44.6m, +$36.0m, and +$30.0m are cash absorptions, so they lower CFO; they are not subtracted a second time from FCF. The NWC/revenue ratio falls, but NWC still rises in dollars because revenue grows. This is the required actual-path sign, not an inference from the ratio alone.

Sum of PV of explicit FCFs: **$2,856.2m**.

Executed Bash calculation and raw output:

```bash
awk 'BEGIN{rf=.0483;erp=.0423;beta=1;ke=rf+beta*erp;kd=42.237/7640;t=.19;we=15345.7/(15345.7+7562.8);wd=1-we;w=we*ke+wd*kd*(1-t);split("227.926 558.7 707.8 856.1 972.3",f," ");split(".25 1 2 3 4",tt," ");pv=0;for(i=1;i<=5;i++)pv+=f[i]/(1+w)^tt[i];g=w*((1199.2-1134.4+30.0)/735.1);tv=f[5]*(1+g)/(w-g);pvtv=tv/(1+w)^4.5;ev=pv+pvtv;eq=ev-6082.6;ps=eq/153.686;printf("WACC blend: we=%.6f, ke=%.6f, wd=%.6f, kd_after_tax=%.6f, WACC=%.6f\n",we,ke,wd,kd*(1-t),w);printf("PV explicit FCF=%.1f; terminal g=%.4f; TV=%.1f; PV TV=%.1f; EV=%.1f\n",pv,g,tv,pvtv,ev);printf("EV-to-equity: EV %.1f - strict net debt 6082.6 = equity %.1f; / diluted shares 153.686 = $%.2f/share\n",ev,eq,ps)}'
```

```text
WACC blend: we=0.669869, ke=0.090600, wd=0.330131, kd_after_tax=0.004478, WACC=0.062168
PV explicit FCF=2856.2; terminal g=0.0080; TV=18099.3; PV TV=13797.2; EV=16653.4
EV-to-equity: EV 16653.4 - strict net debt 6082.6 = equity 10570.8; / diluted shares 153.686 = $68.78/share
```

## 5. Terminal Value

- **Base method — Gordon growth:** `TV = FCFF_(n+1) / (WACC − g) = 972.3 × (1 + 0.80%) / (6.2168% − 0.80%) = $18,099.3m`.
- **Why terminal growth is only 0.80%:** terminal reinvestment is `(capex − D&A + ΔNWC) / NOPAT = (1,199.2 − 1,134.4 + 30.0) / 735.1 = 12.89%`. With terminal ROIC faded to the 6.22% WACC because no moat is proven, financeable nominal growth is `6.22% × 12.89% = 0.80%`. This is 0.7 percentage points below long-run nominal GDP assumptions, but avoids assuming a perpetual excess return that the upstream moat read does not support. [Business-model Moat, §§3 and 5]
- Terminal value (undiscounted): **$18,099.3m**.
- PV of terminal value: **$13,797.2m**.
- **Terminal value as % of total EV: 82.2%.** This is above the 75% threshold: the DCF is terminal-dominated and low confidence.
- **Exit-multiple cross-check:** FY2030 modeled EBITDA is $2,041.9m (`$907.5m EBIT + $1,134.4m D&A`). An 8.0x exit value gives $16,335.2m terminal value, $12,452.5m PV, and **$60.03 per share**. The Gordon value implies 8.86x terminal EBITDA. The current CIQ LTM EV/EBITDA read is 13.4x, but it uses a vendor EBITDA definition that differs from the GAAP-derived series and its six-close own-history range is low confidence; the 8.0x check is therefore an analyst cross-check, not a peer-derived target. [CIQ Financials → Multiples, latest and six closes — vendor export; Historical Financials, §1]

**Structural-decline / runoff terminal — separate bear input, not the base:** the moat report says *“No moat proven — trajectory eroding”* with a material cash-conversion contradiction, and Business Quality scores rate-of-change/disruption at 35/100. That activates a separate structural-reset terminal. I model FY2031 FCF at $800m (about a 12% FCF margin after a fade from FY2030's 15% margin and a GAAP EBIT-margin fade toward 10%) and `g = −1.0%` nominal thereafter. Its terminal value is $11,085.2m, PV is $8,450.3m, and the resulting per-share value is **$33.99**. This is an inference, not from filings, and it is not silently substituted for the base Gordon case. [Business-model Moat, §5; Business-model Business Quality, §4]

## 6. DCF Output

| Step | Value |
|---|---:|
| PV of explicit FCFs | 2,856.2 |
| + PV of terminal value | 13,797.2 |
| **= Enterprise value** | **16,653.4** |
| − Net debt (strict basis) | (6,082.6) |
| − Minority / preferred | 0.0 |
| **= Equity value** | **10,570.8** |
| ÷ Diluted shares | 153.686m |
| **= Intrinsic value per share** | **$68.78** |
| vs current price | **$38.01 below $106.79 (−35.6%)** |

The bridge uses the canonical filing-based strict net debt of $6,082.6m and the Q2 diluted weighted-average share count of 153.686m. The denominator is not a point-in-time fully diluted count; the filing does not disclose the current award population and strikes needed to rebuild one. [Price & Capital Structure, §§2, 5, and 7; Q2 FY2026 Form 10-Q, Note 13, p.24]

## 7. Sensitivity Grid (per-share intrinsic value)

WACC across columns; terminal growth down rows. All cells are valid: the smallest `WACC − g` is 3.92 percentage points, well above the 0.5 percentage-point invalidity guard.

| | WACC −1% (5.22%) | WACC (6.22%) | WACC +1% (7.22%) |
|---|---:|---:|---:|
| g +0.5% (1.30%) | $109.66 | $78.40 | $57.77 |
| g (0.80%) | $94.34 | **$68.78** | $51.24 |
| g −0.5% (0.30%) | $82.14 | $60.79 | $45.65 |

## 8. Intrinsic Read

**Base intrinsic value is $68.78 per share**, versus the dated pool-verified price of $106.79; the $45.65–$109.66 sensitivity grid is the dispersion exhibit, not a substitute for that point. The biggest sensitivity is terminal value, which supplies 82.2% of EV; the $60.03 exit-multiple cross-check and the $33.99 structural-runoff input show why this DCF should carry low confidence rather than a precise conclusion. The model's key operating assumption is that cash conversion returns from H1 FY2026's 29.4% CFO margin to the LTM 33.5% level while cash capex declines from 20.0% to 18.5% of revenue; that recovery is not proven from filings.
