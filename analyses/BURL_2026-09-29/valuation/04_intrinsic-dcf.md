# Intrinsic DCF — BURL

Burlington Stores is an operating U.S. retailer, so this is an FCFF (free cash flow to all capital providers) DCF, followed by a financial-debt EV-to-equity bridge. It is not a bank, REIT, commodity producer, or holding company. The reporting currency is USD and the fiscal year ends on the Saturday closest to January 31. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Note 1 and Segment Reporting]

## 1. FCF Base & Normalizations

Base period is the latest twelve months to August 1, 2026; all amounts are USD millions unless stated otherwise. The DCF uses `FCFF = NOPAT + D&A − capex − ΔNWC`, rather than copying CFO minus capex, because CFO includes financing cash interest and the latest reported cash flow includes a non-recurring tariff refund.

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| Revenue — LTM | 12,198.6 | None; context only, as the forecast starts with forward consensus | [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Income Statement, LTM Aug. 1 2026] |
| EBIT — LTM, CIQ standard | 951.6 | Less $55.5 tariff refund recorded in Q2 cost of sales gives $896.1m normalized operating reference. The refund is not assumed to recur. | [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Income Statement, LTM Aug. 1 2026; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, MD&A—Tariff Refunds] |
| CFO — LTM | 1,415.5 | Vendor cash-from-operations read reconciles to the CIQ facts sidecar; not used as unlevered FCF. | [CIQ Financials→Cash Flow ‘Cash from Ops.’, LTM Aug. 1 2026; ciq_facts.json] |
| Capex — LTM cash paid for property and equipment | (1,002.9) | None | [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Cash Flow, LTM Aug. 1 2026] |
| Reported FCF — CFO less capex | 412.5 | Reported, levered operating-cash read; it is not the DCF FCFF base. | [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Cash Flow, LTM Aug. 1 2026] |
| Tariff-refund normalization | (55.5) | Conservative full-cash subtraction. The filing says Q2 operating cash flow benefited by $55.5m but does not separately disclose timing. | [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, MD&A—Liquidity and Capital Resources] |
| Normalized operating FCF | 357.0 | `412.5 − 55.5`; a cash-flow cross-check, not the FCFF valuation input. | [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Cash Flow, LTM Aug. 1 2026; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, MD&A—Tariff Refunds] |
| Operating NWC at FY2025 end | 145.0 | `receivables 111.2 + inventory 1,414.8 + prepaid/other 300.0 − payables 1,024.3 − other current liabilities 656.7`; cash, financial debt and operating-lease liabilities are excluded. This is 1.253% of FY2025 revenue and is the revenue-linked forecast driver. | [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Condensed Consolidated Balance Sheets, Jan. 31 2026 column] |
| Normalized tax rate | 25.3% | Local normalization: simple average of FY2024 25.4% and FY2025 25.2%. It excludes the lower interim rate, which the Q2 filing attributes partly to purchased federal energy tax credits. The moat output’s economic test was *Not assessable*, so it did not supply a canonical cross-module NOPAT rate. | [data/BURL/BURL_2025-Annual-Report.txt, MD&A—Income Taxes; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Note 7—Income Taxes] |

The CIQ facts sidecar confirms LTM CFO of $1,415.5m and separately labels its $107.4m levered FCF as after-interest, so that smaller vendor measure is not substituted for CFO less capex. [CIQ Financials→Cash Flow ‘Cash from Ops.’ and ‘Levered Free Cash Flow’, LTM Aug. 1 2026; ciq_facts.json]

## 2. Forecast Assumptions

Company fiscal years are used below: FY2026 ends January 30, 2027. CIQ labels the same year FY2027. Forecast revenue, EBIT and EBITDA for FY2026–FY2028 are the source-bound CIQ consensus workbook read; the later years are analyst assumptions, not company guidance. The FY2026 revenue and capex assumptions also sit inside management’s +10% to +11% sales guidance and about $875m capex, net of landlord allowances. [data/BURL/BurlingtonStores,IncNYSEBURLEstimatesReport.xls, Consensus sheet, company-level FY2027–FY2029; data/BURL/BURL_Q2_2026_Earnings_PR.pdf, Outlook, 2026-08-27]

| Assumption | FY2026 | FY2027 | FY2028 | FY2029 | FY2030 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 10.9% (CIQ consensus) | 8.9% (CIQ consensus) | 10.3% (CIQ consensus) | 5.0% (analyst assumption) | 4.0% (analyst assumption) | 2.5% (analyst assumption) | CIQ revenue consensus is $12,828.7m / $13,975.1m / $15,420.0m for FY2026–FY2028. Terminal growth is below CBO’s 2.7%–5.1% nominal-GDP range for 2036 and consistent with a mature U.S. retailer, not a company forecast. [data/BURL/BurlingtonStores,IncNYSEBURLEstimatesReport.xls, Consensus sheet; Web: CBO Budget and Economic Outlook 2026–2036, published 2026, unverified] |
| EBIT margin % | 8.10% (CIQ consensus) | 8.42% (CIQ consensus) | 8.97% (CIQ consensus) | 9.00% (analyst assumption) | 9.00% (analyst assumption) | 9.00%, then ROIC fades to WACC (analyst assumption) | The first three values are CIQ EBIT ÷ CIQ revenue. A 9.0% terminal margin is only modestly above FY2028 consensus, but above BURL’s 7.8% LTM CIQ EBIT margin and below the 12.2%–12.7% peer EBIT margins reported for TJX and Ross. [data/BURL/BurlingtonStores,IncNYSEBURLEstimatesReport.xls, Consensus sheet; analyses/BURL_2026-09-29/business-model/09_moat.md, §3] |
| Tax rate % | 25.3% (analyst normalization) | 25.3% (analyst normalization) | 25.3% (analyst normalization) | 25.3% (analyst normalization) | 25.3% (analyst normalization) | 25.3% (analyst normalization) | Local normalized rate described in §1; it removes the Q2 purchased-energy-credit effect. [data/BURL/BURL_2025-Annual-Report.txt, MD&A—Income Taxes; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Note 7—Income Taxes] |
| D&A (% of revenue) | 3.65% (CIQ consensus) | 3.78% (CIQ consensus) | 4.00% (CIQ consensus) | 4.00% (analyst assumption) | 4.00% (analyst assumption) | 4.00% (analyst assumption) | Derived as CIQ EBITDA less CIQ EBIT for FY2026–FY2028; held thereafter. New stores and supply-chain infrastructure raised Q2 D&A to 3.8% of sales. [data/BURL/BurlingtonStores,IncNYSEBURLEstimatesReport.xls, Consensus sheet; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Results of Operations] |
| Capex (% of revenue) | 6.82% (company-guided) | 6.30% (analyst assumption) | 5.80% (analyst assumption) | 5.50% (analyst assumption) | 5.62% (analyst assumption) | 5.62% (analyst assumption) | FY2026 is management’s $875m, net of landlord allowances. The terminal ratio is set so reinvestment finances 2.5% growth at a terminal ROIC equal to WACC; it does not assume excess returns forever. [data/BURL/BURL_Q2_2026_Earnings_PR.pdf, Outlook, 2026-08-27] |
| Operating NWC (% of revenue) | 1.253% (analyst assumption) | 1.253% (analyst assumption) | 1.253% (analyst assumption) | 1.253% (analyst assumption) | 1.253% (analyst assumption) | 1.253% (analyst assumption) | Held at the FY2025 operating-NWC/revenue ratio from the filing-based build in §1; this generates each year’s dollar change rather than holding a cash-flow amount flat. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Condensed Consolidated Balance Sheets, Jan. 31 2026 column] |

The 8.97% FY2028 CIQ EBIT margin is a vendor consensus, not a filing fact. It exceeds the company’s 7.8% LTM CIQ margin, while Q2 reported margin included a $55.5m tariff refund that management intends to reinvest over Q3 and Q4. The model therefore does not extend the refund, and its 9.0% later-year margin is an analyst assumption rather than an extrapolation of Q2’s reported margin. [CIQ Financials→Income Statement, LTM Aug. 1 2026; ciq_facts.json; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, MD&A—Tariff Refunds]

## 3. Discount Rate (WACC)

WACC is the blended required return for debt and equity capital. The market-value weights use the canonical $15.995bn equity market capitalization and $1.920bn financial debt from `01`; operating leases stay out of this bridge because lease expense is already inside EBIT. [analyses/BURL_2026-09-29/valuation/01_price-and-capital-structure.md, §§3–5]

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 5.24% | [Web: U.S. 10-year Treasury yield, 2026-09-28, unverified] |
| Equity-risk premium | 4.14% | [Web: Damodaran implied U.S. equity-risk premium, 2026-09-01, unverified] |
| Beta | 1.42 | Five-year CIQ beta; it is above the 0.8 cyclical-business floor and is not floored. [CIQ Comparable Analysis→Operating Statistics, as of 2026-09-28; analyses/BURL_2026-09-29/business-model/09_moat.md, §3] |
| Cost of equity | 11.12% | `5.24% + 1.42 × 4.14%` |
| Pre-tax cost of debt | 4.10% | Annualized Q2 interest expense of $78.636m ÷ $1,919.5m filing-based financial debt. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Statements of Income; analyses/BURL_2026-09-29/valuation/01_price-and-capital-structure.md, §4] |
| Tax rate | 25.3% | Local normalized rate in §1. |
| Equity / debt weights | 89.28% / 10.72% | $15.995bn market capitalization / $1.920bn financial debt; weights sum to 100.00%. [analyses/BURL_2026-09-29/valuation/01_price-and-capital-structure.md, §§3–4] |
| **WACC** | **10.26%** | `w_e·k_e + w_d·k_d·(1 − t)`; executed calculation in §4. |

The low-side checks pass: cost of equity less risk-free rate is 5.88 percentage points, above the 4-point floor; beta is 1.42; and no country-risk premium is added because BURL’s cash flows are U.S.-dollar and U.S.-based. There is no discretionary WACC override. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Segment Reporting]

## 3A. Cost-of-Capital Reality Test

| Reference | Rate | Source (cite per §5) | Gap vs model WACC |
|---|---:|---|---:|
| Model WACC (CAPM build, §3) | 10.26% | This agent, §3 | — |
| Scope-matched group discount rate | Group discount rate not disclosed | No group impairment WACC or cost-of-equity rate identified in the admitted 10-K/10-Q. | N/A |
| Other disclosed rate (comparator only) | 6.2% | U.S. operating-lease weighted-average discount rate; collateralized incremental borrowing-rate input, not a group WACC or group cash-flow rate. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Note 3—Lease Commitments] | (4.06)pp |
| Market-implied rate | Runs after this agent — reconcile in `05_reverse-dcf` | `05` inverts this model’s normalized inputs. | Pending |
| Trailing earnings yield / normalized operating-FCF yield | 4.37% / 2.23% | `$11.13 ÷ $254.69`; `$357.0m ÷ $15,994.5m`. These are equity yields, not WACC substitutes. [analyses/BURL_2026-09-29/earnings/01_historical-financials.md, §2; analyses/BURL_2026-09-29/valuation/01_price-and-capital-structure.md, §§1–3] | Not comparable |
| Peer / industry cost of capital | Not assessable | No dated peer WACC was in the admitted evidence. | N/A |

Escalation branch: not triggered. There is no scope-matched disclosed group rate, and the only filing rate is a lease incremental-borrowing comparator; the market-implied rate is sequenced to `05`.

## 4. Free Cash Flow Forecast & Discounting

Amounts are USD millions. Discounting uses the mid-year convention: each annual cash flow is discounted at `t − 0.5`, because it is assumed to arrive through the fiscal year rather than only at year-end. `ΔNWC` is calculated from the modeled NWC balance at a fixed 1.253% of revenue. It rises from $145.0m at FY2025 end to $160.8m in FY2026 and then to $211.0m in FY2030, so every `ΔNWC` is a cash use and is correctly subtracted from FCFF.

| Year | Revenue | EBIT | NOPAT | D&A | Capex | ΔWC | FCF | Discount Factor | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026 | 12,828.7 | 1,038.7 | 775.9 | 468.7 | (875.0) | (15.8) | 353.8 | 0.952358 | 337.0 |
| FY2027 | 13,975.1 | 1,176.9 | 879.1 | 527.8 | (880.4) | (14.4) | 512.2 | 0.863775 | 442.4 |
| FY2028 | 15,420.0 | 1,383.9 | 1,033.8 | 616.2 | (894.4) | (18.1) | 737.5 | 0.783432 | 577.8 |
| FY2029 | 16,191.0 | 1,457.2 | 1,088.5 | 647.6 | (890.5) | (9.7) | 836.0 | 0.710561 | 594.0 |
| FY2030 | 16,838.6 | 1,515.5 | 1,132.1 | 673.5 | (947.0) | (8.1) | 850.5 | 0.644469 | 548.1 |

The first three revenue, EBIT and D&A rows above are CIQ consensus. FY2026 capex is company guidance; later capex, revenue and margin rows are analyst assumptions stated in §2. [data/BURL/BurlingtonStores,IncNYSEBURLEstimatesReport.xls, Consensus sheet; data/BURL/BURL_Q2_2026_Earnings_PR.pdf, Outlook, 2026-08-27]

The executed calculation below pins the WACC assembly, discounted-FCF sum, terminal value and equity bridge. Units are USD millions except per-share value.

```text
$ /usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
rf, erp, beta, kd, tax = .0524, .0414, 1.42, .078636/1.9195, .253
we = 15.994532/(15.994532+1.9195); wd = 1-we; ke = rf+beta*erp
wacc = we*ke + wd*kd*(1-tax)
rev = [12828.72198,13975.10768,15420.00842,16191.008841,16838.649195]
ebit = [1038.71547,1176.87207,1383.90191,.09*rev[3],.09*rev[4]]
da = [468.7047,527.82702,616.21611,.04*rev[3],.04*rev[4]]
capex = [875,.063*rev[1],.058*rev[2],.055*rev[3],.05624*rev[4]]
nwc = [11566.91*.012533] + [r*.012533 for r in rev]
fcf = [e*(1-tax)+d-c-(nwc[i+1]-nwc[i]) for i,(e,d,c) in enumerate(zip(ebit,da,capex))]
pv = [f/(1+wacc)**(i-.5) for i,f in enumerate(fcf,1)]
tv = fcf[-1]*1.025/(wacc-.025); pvtv = tv/(1+wacc)**4.5; ev = sum(pv)+pvtv
equity = ev-1215.8; per_share = equity/63.896
print(f"CAPM k_e = {rf:.4%} + {beta:.2f} x {erp:.4%} = {ke:.4%}")
print(f"k_d = annualized Q2 interest $78.636m / financial debt $1,919.5m = {kd:.4%}; after-tax k_d = {kd*(1-tax):.4%}")
print(f"weights: w_e={we:.6%}, w_d={wd:.6%}, sum={we+wd:.6%}")
print(f"WACC = {we:.6f}*{ke:.6f} + {wd:.6f}*{kd:.6f}*(1-{tax:.3f}) = {wacc:.6%}")
print(f"sanity: after-tax k_d ({kd*(1-tax):.4%}) <= WACC ({wacc:.4%}) < k_e ({ke:.4%}) = {kd*(1-tax)<=wacc<ke}")
print(f"PV explicit FCF sum = {sum(pv):.1f}")
print(f"TV = FY2030 FCF {fcf[-1]:.1f} * (1+2.50%) / ({wacc:.4%}-2.50%) = {tv:.1f}")
print(f"PV TV = {pvtv:.1f}; EV = {ev:.1f}; TV/EV={pvtv/ev:.2%}")
print(f"Equity bridge: EV {ev:.1f} - strict net debt 1215.8 - minority 0 - preferred 0 = equity {equity:.1f}; / 63.896m = ${per_share:.2f}/share")
reinvestment = (capex[-1]-da[-1]+(nwc[-1]-nwc[-2]))/(ebit[-1]*(1-tax))
print(f"Terminal reinvestment = (capex {capex[-1]:.1f} - D&A {da[-1]:.1f} + dNWC {nwc[-1]-nwc[-2]:.1f}) / NOPAT {ebit[-1]*(1-tax):.1f} = {reinvestment:.2%}")
print(f"Financeable g = terminal ROIC {wacc:.4%} * reinvestment {reinvestment:.2%} = {wacc*reinvestment:.2%}")
PY
CAPM k_e = 5.2400% + 1.42 x 4.1400% = 11.1188%
k_d = annualized Q2 interest $78.636m / financial debt $1,919.5m = 4.0967%; after-tax k_d = 3.0602%
weights: w_e=89.284936%, w_d=10.715064%, sum=100.000000%
WACC = 0.892849*0.111188 + 0.107151*0.040967*(1-0.253) = 10.255319%
sanity: after-tax k_d (3.0602%) <= WACC (10.2553%) < k_e (11.1188%) = True

PV explicit FCF sum = 2499.3
TV = FY2030 FCF 850.5 * (1+2.50%) / (10.2553%-2.50%) = 11240.6
PV TV = 7244.2; EV = 9743.5; TV/EV=74.35%
Equity bridge: EV 9743.5 - strict net debt 1215.8 - minority 0 - preferred 0 = equity 8527.7; / 63.896m = $133.46/share

Terminal reinvestment = (capex 947.0 - D&A 673.5 + dNWC 8.1) / NOPAT 1132.1 = 24.87%
Financeable g = terminal ROIC 10.2553% * reinvestment 24.87% = 2.55%
```

Sum of PV of explicit FCFs: **$2,499.3m**.

## 5. Terminal Value

- **Method and formula:** Gordon growth. `TV = FCFF_(n+1) / (WACC − g) = FCFF_n × (1 + g) / (WACC − g)`. Here: `$850.5m × 1.025 / (10.2553% − 2.5%) = $11,240.6m`.
- **Terminal growth:** 2.5% nominal USD. It is below the WACC by 7.76 percentage points and below the cited CBO long-run nominal-GDP range. [Web: CBO Budget and Economic Outlook 2026–2036, published 2026, unverified]
- **Terminal value, undiscounted:** $11,240.6m.
- **PV of terminal value:** $7,244.2m.
- **Terminal value as % of total EV:** **74.35%**. This is just below the 75% terminal-dominance cap but remains the key fragility, as shown in §7.
- **Exit-multiple cross-check:** the Gordon terminal value implies `11,240.6 ÷ (1,515.5 + 673.5) = 5.14x` FY2030 EBITDA. That is below BURL’s 8.5x current LTM EV/EBITDA and the dated 7.1x peer-set median, so the continuing value does not rely on a high mature multiple. [CIQ Financials→Multiples ‘TEV/LTM EBITDA’ close; CIQ Comps→Trading Multiples ‘TEV/EBITDA LTM—Latest’, as of 2026-09-28; ciq_facts.json]
- **Terminal excess-return treatment:** the terminal ROIC is set equal to the 10.26% WACC, not above it. The upstream moat report calls the structural moat narrow but could not establish an economic spread; the trajectory is *not assessable*, not a finding of erosion. [analyses/BURL_2026-09-29/business-model/09_moat.md, §§3–5]
- **Runoff trigger:** not generated. The moat trajectory is not assessable and the business-quality rate-of-change/disruption score is 45, above the ≤40 trigger. [analyses/BURL_2026-09-29/business-model/09_moat.md, §5; analyses/BURL_2026-09-29/business-model/07_business-quality.md, §1]

The terminal financeability check holds: terminal reinvestment is 24.87%, and 10.2553% ROIC × 24.87% reinvestment = 2.55%, close to the 2.5% terminal growth assumption. No unquantified terminal-growth bridge is required.

## 6. DCF Output

| Step | Value |
|---|---:|
| PV of explicit FCFs | 2,499.3 |
| + PV of terminal value | 7,244.2 |
| **= Enterprise value** | **9,743.5** |
| − Net debt (strict basis) | (1,215.8) |
| − Minority / preferred | 0.0 |
| **= Equity value** | **8,527.7** |
| ÷ Diluted shares | 63.896m |
| **= Intrinsic value per share** | **$133.46** |
| vs current price | **$254.69; intrinsic value is 47.6% below price** |

The bridge uses the canonical $1.216bn strict net debt and 63.896m diluted weighted-average proxy from `01`, rather than the CIQ sidecar’s $5.202bn lease-inclusive vendor net-debt measure. [analyses/BURL_2026-09-29/valuation/01_price-and-capital-structure.md, §7; CIQ Financials→Balance Sheet ‘Net Debt’, Q2 Aug. 1 2026; ciq_facts.json]

## 7. Sensitivity Grid (per-share intrinsic value)

Terminal growth is down the rows and WACC across columns. All `WACC − g` gaps remain well above 0.5 percentage points, so no cell is invalid.

| | WACC −1% (9.26%) | WACC (10.26%) | WACC +1% (11.26%) |
|---|---:|---:|---:|
| g +0.5% (3.0%) | $168.23 | $141.87 | $121.90 |
| g (2.5%) | $156.68 | $133.46 | $115.57 |
| g −0.5% (2.0%) | $146.72 | $126.08 | $109.91 |

## 8. Intrinsic Read

The base-case intrinsic value is **$133.46 per BURL share**, versus a pool-verified $254.69 close on September 28, 2026; the WACC/growth grid spans **$109.91–$168.23**. The dominant assumption is not a refund-adjusted quarter: it is whether an off-price retailer can turn FY2026–FY2028 consensus EBIT growth into roughly $851m of FY2030 FCFF while still reinvesting about $947m in capex. The result is sensitive to the terminal value, which supplies 74.35% of EV, and it should be reconciled with the reverse-DCF’s market-implied return before synthesis.
