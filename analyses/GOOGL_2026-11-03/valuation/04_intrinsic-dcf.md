# Intrinsic DCF — GOOGL

Alphabet is an operating company reporting under US GAAP in USD, so an FCFF DCF is the applicable intrinsic method. The decision line is GOOGL on Nasdaq Global Select Market, and all per-share amounts use 12,368m fully diluted shares. [analyses/GOOGL_2026-11-03/valuation/00_valuation-data-triage.md, §§1A and 3; analyses/GOOGL_2026-11-03/valuation/01_price-and-capital-structure.md, §§1–2]

## 1. FCF Base & Normalizations

Base year is FY2025; figures are USD millions unless stated otherwise. FCF means CFO less total capex. The model does not extrapolate FY2025's $73.266bn FCF because FY2026 capex is guided/estimated near $200bn; it explicitly models that investment period.

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| FY2025 revenue | 402,836 | Reported base for the FY2026 consensus-growth calculation. | [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025, Consolidated Statements of Income, p.49] |
| FY2025 CFO | 164,713 | Reported; no quantified one-off cash receipt is available to remove. | [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025, Consolidated Statements of Cash Flows, p.51] |
| FY2025 capex | (91,447) | Total property-and-equipment purchases; maintenance/growth split is not disclosed. | [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025, Consolidated Statements of Cash Flows, p.51] |
| **FY2025 FCF (CFO − capex)** | **73,266** | Historical reference only; not treated as a steady-state run rate. | [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025, Consolidated Statements of Cash Flows, p.51] |
| TTM Sep-2026 CFO | 179,551 | CIQ sidecar's authoritative workbook read; reconciles to the earnings module. | [CIQ facts sidecar, `ltm_ocf_m` = 179,551, CIQ Financials→Cash Flow, LTM Sep-30-2026] |
| TTM Sep-2026 capex / FCF | (159,804) / 19,747 | Reported CFO-minus-capex run rate; its fall is driven by capex, not a cash-collection failure. | [CIQ Financials→Cash Flow, LTM Sep-30-2026 — vendor export; analyses/GOOGL_2026-11-03/earnings/01_historical-financials.md, §2] |
| Normalized tax rate for NOPAT | 16.0% | Uses the moat module's canonical rounded FY2023–FY2025 effective-tax-rate average (13.9%, 16.4%, 16.8%). It avoids treating FY2025's legal/tax distortions as the permanent rate. | [analyses/GOOGL_2026-11-03/business-model/09_moat.md, §3; data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, Note 14] |
| FY2025 operating NWC | (23,550) | Calculated as receivables + inventory + other current assets less current liabilities, excluding cash and marketable securities; this is the forecast driver, not total balance-sheet working capital. | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Consolidated Balance Sheets, p.4] |
| Canonical forward FCF path | FY2026 FCFF (32,277); FY2031 FCFF 164,932 | Analyst model output, not a filing figure. The FY2026 trough reflects the $201.207bn capex consensus; the FY2031 level is the normalized post-build reference that `05_reverse-dcf` should invert with this report's WACC. | [Capital IQ Estimates Report — Consensus, FY2026 capex; analyses/GOOGL_2026-11-03/earnings/04_guidance-consensus.md, §§2–3] |

The FY2026 GAAP net-income run rate is not used as an operating-cash-flow base: nine-month FY2026 other income included $127.3bn of equity-security gains, mostly unrealised. FCFF is therefore built from EBIT after normalized tax, not from GAAP EPS. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Note 3 and Consolidated Statements of Income; analyses/GOOGL_2026-11-03/earnings/06_earnings-quality.md, §§5 and 10]

## 2. Forecast Assumptions

`C` = company-guided or CIQ consensus; `A` = analyst assumption, not company-guided. FY2026 revenue and capex are consensus; Alphabet supplied no numeric revenue, EBIT, or EPS guide. All later forecast cells marked `A` are deliberately conservative fades rather than filing forecasts.

| Assumption | FY2026 | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 24.0% C | 17.0% A | 14.0% A | 11.0% A | 8.0% A | 2.5% A | 2.5% A | FY2026 revenue consensus is $499.429bn; the later fade is an analyst assumption below the sidecar's 13.1% mean long-term growth by FY2029 and at a mature nominal rate by FY2031. [Capital IQ Estimates→Consensus, FY2026; CIQ facts sidecar, `consensus_view`] |
| EBIT margin % | 31.0% A | 31.5% A | 31.75% A | 31.5% A | 31.0% A | 31.0% A | 31.0% A | Below 33.9% nine-month FY2026 operating margin because management cited depreciation, third-party compute and data-centre operating-cost pressure; it does not presume the legal-cost comparison repeats. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, nine months FY2026, Consolidated Statements of Income and Item 2; analyses/GOOGL_2026-11-03/earnings/03_margin-drivers.md, §§3, 8] |
| Tax rate % | 16.0% A | 16.0% A | 16.0% A | 16.0% A | 16.0% A | 16.0% A | 16.0% A | Canonical normalized-tax rate from the moat module; see §1. |
| D&A (% of revenue) | 7.5% A | 9.0% A | 10.5% A | 11.5% A | 12.0% A | 12.0% A | 12.0% A | Fades upward from LTM D&A implied by CIQ EBITDA less reported EBIT as the current data-centre build enters service. [CIQ facts sidecar, `ltm_ebitda_m` = 185,516, CIQ Financials→Income Statement, LTM Sep-30-2026; Q3 FY2026 Form 10-Q, Consolidated Statements of Income] |
| Capex (% of revenue) | 40.3% C | 33.0% A | 28.0% A | 23.0% A | 20.0% A | 18.0% A | 18.0% A | FY2026 consensus capex is $201.207bn, within management's $195bn–$205bn range. The later decline is an analyst assumption; it remains above FY2025's 22.7% until FY2030. [Capital IQ Estimates Report — Consensus and Guidance, FY2026; Q3 2026 earnings call, prepared remarks; FY2025 Form 10-K, Item 7] |
| Ending operating NWC (% of revenue, used to derive ΔNWC) | (5.0%) A | (4.8%) A | (4.6%) A | (4.5%) A | (4.5%) A | (4.5%) A | (4.5%) A | Starts near the FY2025 operating-NWC ratio of (5.8%) and gradually normalizes as TPU inventory rises. Receivable days were stable near 52 while inventory became material in FY2026. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Cash Flows; analyses/GOOGL_2026-11-03/earnings/06_earnings-quality.md, §3] |

The NWC path is revenue-linked. Forecast NWC remains negative, but it becomes more negative in dollars as revenue grows; therefore `ΔNWC` is negative and adds cash to FCFF. This is a calculated cash effect, not an assumption that growth automatically releases cash.

## 3. Discount Rate (WACC)

WACC is the blended required return of common equity, debt, and preferred equity. All weights are market-value weights; the unrounded weights sum to 100.00%. No discretionary override is applied: the computed 10.37% is the used WACC.

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 5.29% | [Web: Damodaran implied-ERP update, 2026-11-01, US Treasury rate for USD — unverified] |
| Equity-risk premium | 4.41% | [Web: Damodaran implied-ERP update, 2026-11-01, trailing-12-month adjusted-payout implied US ERP — unverified] |
| Beta | 1.21 | [Web: Yahoo Finance, GOOGL five-year monthly beta, retrieved 2026-11-03 — unverified] |
| Cost of equity, `k_e = rf + beta × ERP` | 10.63% | 5.29% + 1.21 × 4.41%; calculated from rows above. |
| Pre-tax cost of debt, `k_d` | 5.00% | Analyst approximation within Alphabet's disclosed effective-rate ranges on outstanding 2026 USD notes (3.93%–6.57%); not a bond-market yield. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Note 6 (Debt), p.26] |
| Normalized tax rate | 16.00% | Same 16.0% NOPAT rate as §1. [Business Model Moat — GOOGL, §3] |
| After-tax cost of debt | 4.20% | 5.00% × (1 − 16.0%). |
| Common-equity weight | 95.86% | $3,424.603bn market cap ÷ ($3,424.603bn + $129.823bn debt + $18.023bn preferred). [Valuation Price & Capital Structure — GOOGL, §§3–4] |
| Debt weight | 3.63% | $129.823bn canonical filing debt, including finance leases. [Valuation Price & Capital Structure — GOOGL, §4] |
| Preferred-equity weight / cost | 0.50% / 6.25% | Mandatory-convertible preferred carrying value / stated coupon. [Q3 FY2026 Form 10-Q, Note 11; Valuation Price & Capital Structure — GOOGL, §4] |
| **WACC** | **10.37%** | Executed formula below. |

The arithmetic bounds pass: after-tax `k_d` of 4.20% ≤ WACC of 10.37% < CAPM `k_e` of 10.63%. The equity premium over the USD risk-free rate is 5.34 percentage points, above the ~4-point floor. The beta source uses a five-year monthly window; Alphabet is USD-reporting and globally diversified, so no emerging/single-country risk premium is added. [Web: Yahoo Finance, GOOGL five-year monthly beta, retrieved 2026-11-03 — unverified; FY2025 Form 10-K, Item 1 — international operations]

## 3A. Cost-of-Capital Reality Test

| Reference | Rate | Source (cite per §5) | Gap vs model WACC |
|---|---:|---|---:|
| Model WACC (CAPM build, §3) | 10.37% | This report, §3 | — |
| Scope-matched group discount rate | **Group discount rate not disclosed** | No filing-disclosed rate was found for the listed group's USD operating cash flows, on a WACC basis. | NM |
| Other disclosed rate (comparator only) | 3.93%–6.57% effective rates | Alphabet 2026 USD note tranches; debt instruments, not the group's cost of equity or WACC. [Q3 FY2026 Form 10-Q, Note 6 (Debt), p.26] | (6.44) to (3.80)pp |
| Market-implied rate | Runs after this agent — reconcile in `05_reverse-dcf`. | `05` must invert the same 16.0% tax base, FCFF path, and 10.37% WACC. | Pending |
| Trailing FCF yield / GAAP earnings yield | 0.58% / 6.87% | $19.747bn TTM FCF ÷ $3,424.603bn market cap; $19.17 LTM EPS ÷ $278.99. GAAP EPS is distorted by investment gains, so neither is a WACC anchor. [CIQ Financials→Cash Flow, LTM Sep-30-2026; CIQ facts sidecar, `current_price`; analyses/GOOGL_2026-11-03/earnings/06_earnings-quality.md, §10] |
| Peer / industry cost of capital | Not assessable | No dated, scope-matched peer WACC is in the admitted evidence. | NM |

Escalation: not triggered. No scope-matched group rate is disclosed, and the reverse-DCF market-rate comparison is sequenced after this report; `05` must test it rather than treating the comparator debt rates as a group WACC.

## 4. Free Cash Flow Forecast & Discounting

FCFF = NOPAT + D&A − capex − ΔNWC. Discounting uses the mid-year convention: cash arrives through each year, so the factor is `1 / (1 + WACC)^(t − 0.5)`.

| Year | Revenue | EBIT | NOPAT | Capex | ΔWC | FCF | Discount Factor | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026 | 499,429 | 154,823 | 130,051 | (201,207) | (1,421) | (32,277) | 0.9519 | (30,723) |
| FY2027 | 584,332 | 184,065 | 154,614 | (192,830) | (3,076) | 17,451 | 0.8624 | 15,050 |
| FY2028 | 666,138 | 211,499 | 177,659 | (186,519) | (2,594) | 63,679 | 0.7814 | 49,759 |
| FY2029 | 739,414 | 232,915 | 195,649 | (170,065) | (2,631) | 113,248 | 0.7080 | 80,177 |
| FY2030 | 798,567 | 247,556 | 207,947 | (159,713) | (2,662) | 146,723 | 0.6415 | 94,117 |
| FY2031 | 818,531 | 253,745 | 213,145 | (147,336) | (898) | 164,932 | 0.5812 | 95,857 |

D&A is included in FCFF but omitted from the compact table: it is $37.457bn/$52.590bn/$69.945bn/$85.033bn/$95.828bn/$98.224bn in FY2026–FY2031, respectively. It is derived from the §2 percentages. A negative `ΔNWC` adds cash: for example, FY2027 NWC moves from $(24.971)bn to $(28.048)bn, so `ΔNWC = −$3.076bn` and FCFF receives a $3.076bn cash release. The modeled sign therefore matches the modeled balance-sheet path.

Sum of PV of explicit FCFs: **$304.231bn**.

The following is the executed calculation for the WACC blend, explicit-FCF PV sum, terminal value, and EV-to-equity bridge. Amounts are USD millions.

```text
$ awk 'BEGIN { we=.958615; wd=.036340; wp=.005045; ke=.106261; kd=.05; tax=.16; kp=.0625; wacc=we*ke+wd*kd*(1-tax)+wp*kp; f[1]=-32277.063; f[2]=17451.048; f[3]=63679.325; f[4]=113247.525; f[5]=146723.324; f[6]=164931.976; for(i=1;i<=6;i++){pv=f[i]/(1+wacc)^(i-.5); sum+=pv}; g=.025; tv=f[6]*(1+g)/(wacc-g); pvtv=tv/(1+wacc)^5.5; ev=sum+pvtv; equity=ev-73489-6900-18023; per=equity/12368; exit_tv=351968.279*9; exit_pv=exit_tv/(1+wacc)^5.5; exit_ev=sum+exit_pv; exit_per=(exit_ev-73489-6900-18023)/12368; printf "WACC = %.6f*%.6f + %.6f*%.6f*(1-%.2f) + %.6f*%.6f = %.6f (%.2f%%)\n",we,ke,wd,kd,tax,wp,kp,wacc,100*wacc; printf "PV explicit FCF = %.3f\nFCF_2032 = %.3f\nTV = %.3f\nPV TV = %.3f\nEV = %.3f\nEquity = %.3f\nPer share = %.2f\nExit-9x per share = %.2f\n",sum,f[6]*(1+g),tv,pvtv,ev,equity,per,exit_per }'
WACC = 0.958615*0.106261 + 0.036340*0.050000*(1-0.16) + 0.005045*0.062500 = 0.103705 (10.37%)
PV explicit FCF = 304231.122
FCF_2032 = 169055.275
TV = 2147961.580
PV TV = 1248346.061
EV = 1552577.183
Equity = 1454165.183
Per share = 117.57
Exit-9x per share = 165.49
```

## 5. Terminal Value

Base terminal value uses Gordon growth:

`TV = FCFF_{2032} / (WACC − g) = FCFF_{2031} × (1 + g) / (WACC − g)`

`= $164.932bn × 1.025 / (10.3705% − 2.5%) = $2,147.962bn`.

The 2.5% nominal `g` is an analyst assumption below the $-denominated risk-free rate and is intended to represent a mature cash-flow fade, not a claim that AI growth persists forever. The `WACC − g` spread is 7.87 percentage points, so no sensitivity cell nears a denominator failure.

- Terminal value, undiscounted: **$2,147.962bn**.
- PV of terminal value: **$1,248.346bn**.
- **Terminal value as % of EV: 80.4%.** This exceeds the 75% limit: the DCF is terminal-dominated and has low intrinsic confidence.
- The Gordon terminal implies **6.10× FY2031 EBITDA**. An exit-multiple cross-check at 9.0× FY2031 EBITDA produces **$165.49 per share**. The 9.0× is an analyst assumption, below the current 17.4× LTM EV/EBITDA and peer median 15.5×; it is a sensitivity comparator, not a second base value. [CIQ facts sidecar, `ev_ebitda_current_x` and `peer_ev_ebitda`, CIQ Comps, 2026-11-03]

Financeability check: the terminal path requires a 22.1% reinvestment rate, `(capex − D&A + ΔNWC) / NOPAT`, and implies terminal ROIC of 11.33%, or only about 96bp above WACC. Thus the model fades the present return advantage rather than retaining a large perpetual excess return. [analyses/GOOGL_2026-11-03/business-model/09_moat.md, §§3 and 5]

**Structural-decline / runoff terminal (bear input; not the base intrinsic):** the business-quality rate-of-change score is 40/100, meeting the declining-perpetuity trigger. A structural-reset terminal fades FY2031 EBIT margin to 27.0%, holds capex at 20.0% of revenue, lets operating-NWC improve to (4.0%) of revenue (a $3.194bn cash use), and uses 1.0% nominal growth. It yields FY2031 FCFF of $116.966bn, PV of terminal value $732.759bn, and **$73.63 per share** after the same strict debt, minority, preferred, and diluted-share bridge. This is a 24–36 month structural-reset sensitivity for `07_scenario-and-fair-value`, not a silent replacement for the most-likely base. [analyses/GOOGL_2026-11-03/business-model/07_business-quality.md, §§1 and 4]

## 6. DCF Output

| Step | Value |
|---|---:|
| PV of explicit FCFs | 304,231 |
| + PV of terminal value | 1,248,346 |
| **= Enterprise value** | **1,552,577** |
| − Net debt, strict basis | (73,489) |
| − Minority interest | (6,900) |
| − Preferred equity | (18,023) |
| **= Equity value** | **1,454,165** |
| ÷ Fully diluted shares (m) | 12,368 |
| **= Intrinsic value per GOOGL share** | **$117.57** |
| vs pool-verified GOOGL price of $278.99, 2026-11-03 | **(57.9%)** |

The bridge uses the valuation anchor's canonical strict $73.489bn net debt (including finance leases and only cash equivalents), $6.900bn non-controlling interest, $18.023bn preferred claim, and 12.368bn diluted shares. It does not add the $208.764bn marketable-securities balance as cash because the anchor did not establish a separately realizable non-operating portion. [analyses/GOOGL_2026-11-03/valuation/01_price-and-capital-structure.md, §§2, 4, 5 and 7]

## 7. Sensitivity Grid (per-share intrinsic value)

WACC across columns, terminal growth down rows. Every cell has `WACC − g` comfortably above 0.5 percentage points.

| | WACC 9.37% | WACC 10.37% | WACC 11.37% |
|---|---:|---:|---:|
| g 3.0% | $149.41 | $124.95 | $106.42 |
| g 2.5% | $139.22 | $117.57 | $100.89 |
| g 2.0% | $130.43 | $111.08 | $95.95 |

## 8. Intrinsic Read

**Base intrinsic value is $117.57 per GOOGL share; the WACC/terminal-growth grid spans $95.95–$149.41, versus the pool-verified $278.99 price on 2026-11-03.** The point is most sensitive to whether roughly $200bn of FY2026 capex can fade from 40.3% to 18.0% of revenue while EBIT margin settles near 31.0%; terminal value still supplies 80.4% of EV, so this DCF is a low-confidence cross-check rather than a standalone fair-value conclusion. The $73.63 structural-reset sensitivity shows the permanent-impairment outcome if AI economics and the margin fade worsen.
