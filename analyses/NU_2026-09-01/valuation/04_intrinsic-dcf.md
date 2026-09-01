# Intrinsic DCF — NU

**Method:** equity-direct residual income (RI), in USD per NYSE:NU Class A share. NU is a deposit-taking financial institution, so this is not an FCFF or enterprise-value model: loan, deposit, and funding movements make cash flow from operations an unsuitable distributable-cash-flow base. Net debt is not subtracted and no EV bridge is made. [NU valuation data triage, 2026-09-01, Business classification; NU earnings historical financials, 2026-09-01, lender cash-flow interpretation]

**Base point:** **US$7.65 per share**. The finite sensitivity range is **US$6.69–8.70 per share**. The decision-line price is **US$14.30 as of 2026-08-29** (Capital IQ's source-bound sidecar reports `status: present` and `value: 14.30` for `current_price`). [Capital IQ Comps → Financial Data, current export as of 2026-08-29; `data/NU/` `ciq_facts.json`, `current_price`]

**Model confidence: Low.** FY2026–FY2028 use vendor consensus, but FY2029–FY2030 and the fade are analyst assumptions; NU does not disclose a scope-matched group cost of equity. The $16.51% discount rate disclosed for a Brazilian investment-activities CGU is only a comparator, not a group rate.

## 1. Equity Base & Normalization

| Item | USD m except per share | Treatment |
|---|---:|---|
| Parent shareholders' equity, 2026-06-30 | 13,249.670 | Direct equity base; excludes non-controlling interests. [NU H1 FY2026 Interim Report, Statement of Financial Position] |
| H1 FY2026 diluted weighted-average shares | 4,908.841m | Per-share divisor. [NU H1 FY2026 Interim Report, Earnings per Share] |
| Opening book value per share | 2.6991 | $13,249.670m / 4,908.841m shares. |
| Decision-line price | 14.30 | NYSE:NU Class A, source-bound Capital IQ read. [Capital IQ Comps → Financial Data, current export as of 2026-08-29; `data/NU/` `ciq_facts.json`, `current_price`] |

This is an equity model. Deposits, loans, and the reported strict-basis net-cash position are already reflected in bank book equity; adding cash or subtracting debt again would double count the financial balance sheet. [NU valuation price and capital structure, 2026-09-01, Financial-institution treatment]

The current-book anchor is reportable common equity, rather than a vendor balance-sheet field. This follows the source hierarchy. Capital IQ's 4,830.7m shares-outstanding read agrees with issued shares but does not net treasury shares or capture the interim diluted weighted average, so it is not the divisor used here. [Capital IQ Comps → Financial Data, current export as of 2026-08-29; `data/NU/` `ciq_facts.json`, `shares_outstanding_m`; NU H1 FY2026 Interim Report, Earnings per Share]

## 2. Residual-Income Forecast Assumptions

Residual income is defined as:

`RI_t = EPS_t − (cost of equity × opening BVPS_t)`

| Fiscal year | EPS/share | Ending BVPS | Implied ROE on opening BVPS | RI/share | Basis |
|---|---:|---:|---:|---:|---|
| 2026 | 0.8482 | 3.1477 | 31.4% | 0.5199 | Capital IQ consensus |
| 2027 | 1.1101 | 4.1217 | 35.3% | 0.7272 | Capital IQ consensus |
| 2028 | 1.4595 | 5.2265 | 35.4% | 0.9582 | Capital IQ consensus |
| 2029 | 1.6000 | 6.5865 | 30.6% | 0.9643 | Analyst forecast and 85% net-book-retention assumption |
| 2030 | 1.7200 | 8.0485 | 26.1% | 0.9189 | Analyst forecast and 85% net-book-retention assumption |

FY2026–FY2028 EPS and BVPS are the source-bound consensus rows. [Capital IQ Estimates → Consensus, Fiscal Years, current export, revisions through 2026-08-26; `data/NU/` `NuHoldingsLtdNYSENUEstimatesReport__Consensus.txt`]

The FY2026 consensus needs H2 EPS of $0.4546 ($0.8482 less reported H1 diluted EPS of $0.3936), 15.5% above H1. It is therefore a forward analyst estimate, not an annualisation of the reported half. [Capital IQ Estimates → Consensus, Fiscal Years, current export, revisions through 2026-08-26; `data/NU/` `NuHoldingsLtdNYSENUEstimatesReport__Consensus.txt`; NU H1 FY2026 Interim Report, Earnings per Share]

FY2029–FY2030 deliberately do not adopt the one-estimate vendor rows ($1.73 and $1.95 EPS respectively). Instead, EPS growth fades to 9.6% in FY2029 and 7.5% in FY2030, with a 15% analyst non-retention allowance for share-based compensation, repurchases, and OCI; it is **not** a cash-dividend forecast. NU states that it has never paid a dividend and expects to retain earnings for the foreseeable future. [Capital IQ Estimates → Consensus, Fiscal Years, current export, estimate-count rows; `data/NU/` `NuHoldingsLtdNYSENUEstimatesReport__Consensus.txt`; NU FY2025 Form 20-F, Dividend and Dividend Policy]

The post-FY2028 ROE decline and finite fade reflect a narrow moat with trajectory not assessable, business-quality score 52/100, high regulatory and credit-cycle exposure, and earnings-volatility score 68/100 (inverted: higher is worse). This is a conservative analyst judgment, not management guidance. [NU business-model moat, 2026-09-01, conclusion; NU business-quality, 2026-09-01, scores; NU earnings sensitivity analysis, 2026-09-01, earnings-volatility score]

## 3. Cost of Equity

| Component | Input | Basis |
|---|---:|---|
| USD risk-free rate | 4.75% | U.S. 10-year CMT. [Web: U.S. Treasury Daily Treasury Par Yield Curve Rates, 2026-08-31, 10-year 4.75% — indicative, unverified] |
| Mature-market ERP | 4.23% | Damodaran January 2026 implied ERP. [Web: Damodaran Country Risk Premiums, updated 2026-01-05, mature-market ERP 4.23% — indicative, unverified] |
| Beta | 1.00 | Analyst assumption; no sourced pool beta is used. |
| Revenue-weighted country-risk premium | 3.18% | `91.4% × 3.24% (Brazil) + 6.7% × 2.46% (Mexico) + 2.0% × 2.85% (Colombia) = 3.183%`; source geographic weights sum to 100.1% because of rounding. [NU external-dependency analysis, 2026-09-01, geographic revenue; Web: Damodaran Country Risk Premiums, updated 2026-01-05, country premiums — indicative, unverified] |
| **Cost of equity** | **12.16%** | `4.75% + 1.00 × 4.23% + 3.183%` |

The low-side checks pass: `k_e − r_f = 7.41 percentage points`, above the 4pp floor, and beta is not set below 0.8. The explicit Brazil risk premium is material because Brazil represents 91.4% of the cited geographical-revenue measure. [NU external-dependency analysis, 2026-09-01, geographic revenue]

There is no WACC, debt weighting, or tax shield in this equity-direct bank model. Those are not omitted inputs: they are inapplicable to an RI valuation of common equity.

## 3A. Cost-of-Capital Reality Test

| Independent read | Rate / observation | Scope decision |
|---|---:|---|
| Model cost of equity | 12.16% | Base input, constructed above. |
| NU group disclosed cost of equity / impairment discount rate | Not disclosed | No scope-matched company rate is available in the pool. |
| FY2025 impairment comparator | 16.51% cost of equity; 3.69% perpetual growth | **Comparator only.** It applies to the Brazilian investment-activities CGU, not NU group common equity; it cannot anchor the model. [NU FY2025 Form 20-F, Note 4, goodwill impairment] |
| FY2026 consensus earnings yield | 5.93% (`$0.8482 / $14.30`) | A forward earnings yield, not a cost-of-equity estimate. [Capital IQ Estimates → Consensus, Fiscal Years, current export, revisions through 2026-08-26; `data/NU/` `NuHoldingsLtdNYSENUEstimatesReport__Consensus.txt`; Capital IQ Comps → Financial Data, current export as of 2026-08-29; `data/NU/` `ciq_facts.json`, `current_price`] |
| Market-implied rate | Pending reverse-DCF work | Not available to this module; it must not be invented. |

The 16.51% CGU rate is 4.35pp above the model rate, but its object and scope mismatch prevent it from being a valid direct comparator. Accordingly, the base rate uses explicit, sourced USD and country-risk components, a neutral analyst beta, and a ±100bp sensitivity. This is a scope limitation supporting the Low confidence label, not a silent override of the filing.

## 4. Residual-Income Forecast & Discounting

The equity value is:

`V_0 = BVPS_0 + Σ(RI_t / (1 + k_e)^t) + PV(continuing RI)`

The first two terms are $2.6991 current book and $2.8475 present value of FY2026–FY2030 residual income. The calculation below is the executed model exhibit; amounts are USD/share except aggregate equity value.

```text
INPUTS: shares_m=4908.841; BVPS_0=2.699144; country_risk=3.183180%; ke=12.163180%
FY2026: BV_begin=2.699144; EPS=0.84820; ROE=31.4248%; RI=0.519898
FY2027: BV_begin=3.147720; EPS=1.11006; ROE=35.2655%; RI=0.727197
FY2028: BV_begin=4.121740; EPS=1.45953; ROE=35.4105%; RI=0.958195
FY2029: BV_begin=5.226450; EPS=1.60000; ROE=30.6135%; RI=0.964297
FY2030: BV_begin=6.586450; EPS=1.72000; ROE=26.1142%; RI=0.918878
BASE: PV_explicit_RI=2.847488; CV_at_FY30=3.740434; PV_CV=2.107029; value_ps=7.653661; equity_m=37570.603; CV_pct=27.5297%
```

The high explicit-period ROEs are analyst-consensus-led through FY2028, not a claim that the rate is permanently sustainable. The forecast requires continued capital generation; reported local capital ratios and regulatory capital excess indicate current capacity, but they do not prove FY2029–FY2030 outcomes. [NU H1 FY2026 Interim Report, Regulatory capital disclosures; NU business-quality, 2026-09-01, regulatory and cyclicality assessment]

## 5. Continuing Value

The base case does **not** apply a perpetual-growth terminal value. Starting after FY2030, FY2030 residual income fades linearly over 15 calendar slots: FY2031 begins at `14/15 × FY2030 RI` and the FY2045 slot is zero. This produces a continuing value at FY2030 of **$3.7404/share**, discounted to **$2.1070/share** today. Continuing RI is **27.5%** of total intrinsic equity value, below the 75% terminal-contribution caution level.

The fade is intentionally conservative. A narrow moat with no established widening trajectory does not support assuming permanent excess returns. [NU business-model moat, 2026-09-01, moat assessment]

As a non-base upper-bound cross-check, preserving FY2030 RI forever yields $9.80/share at 0% residual-income growth, $10.74 at 2%, and $11.36 at 3%. Those outcomes assume persistent, non-fading excess returns and are not used as fair-value cases. Even the 3% perpetuity cross-check remains below the cited $14.30 market price.

## 6. Residual-Income Output

| Equity-direct bridge | USD m | USD/share |
|---|---:|---:|
| Current parent book equity | 13,249.7 | 2.6991 |
| PV of explicit FY2026–FY2030 RI | 13,977.9 | 2.8475 |
| PV of finite continuing RI | 10,343.1 | 2.1070 |
| **Intrinsic common equity value** | **37,570.6** | **7.6537** |
| Diluted share divisor | 4,908.841m | — |
| Current NYSE:NU price, 2026-08-29 | — | 14.30 |

There is no net-debt, cash, minority-interest, or EV-to-equity adjustment below this bridge. The starting point is parent common equity, and the model directly values the residual earnings attributable to that equity.

## 7. Sensitivity Grid

Each cell recomputes both residual income and discounting at the stated cost of equity. Values are USD/share.

| Finite RI fade \\ Cost of equity | 11.16% | 12.16% base | 13.16% |
|---|---:|---:|---:|
| 10 years | 7.60 | 7.12 | 6.69 |
| 15 years base | 8.23 | 7.65 | 7.13 |
| 20 years | 8.70 | 8.04 | 7.44 |

The sensitivity range remains below the $14.30 decision-line price. The model would require excess returns to persist materially longer or at a higher level than the already high FY2026–FY2030 forecast to reach the price; that is not proven by the available moat evidence. [NU business-model moat, 2026-09-01, narrow moat and trajectory not assessable]

## 8. Intrinsic Read

The equity-direct base point is **$7.65/share**, 46.5% below the $14.30 decision-line price (equivalently, price is 86.8% above this base intrinsic value). The mechanical sensitivity is $6.69–8.70/share. This is an intrinsic-value output, not a rating, recommendation, probability, or position-size instruction.

The key disconfirmation is durable evidence that NU can sustain material residual income beyond the 15-year fade despite credit-cycle, regulatory, and country-risk exposure. Conversely, an ECL-driven credit deterioration, capital constraint, or failure of the post-FY2028 earnings path would reduce the value. The current market price can be reconciled only with a substantially more durable excess-return assumption than this model uses; that assumption is **not proven from available data**.
