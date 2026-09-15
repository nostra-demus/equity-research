> Targeted correction published 2026-09-15. Operating forecasts and the $106.79 price remain dated 2026-09-14. This report replaces the affected valuation output; unaffected modules are reused with lineage in `maintenance_lineage.json`. No new specialist execution is claimed.

# AKAM — Corrected conditional cash-flow valuation

## 1. Scope, source discipline and limitations

This correction fixes the known share/debt mismatch and binds the previously absent market input evidence. It retains the original operating forecasts, price and scenario probabilities to isolate those integrity defects. Forecasts are **inference, not from filings**. None becomes a fact because an audit checks the arithmetic.

The enterprise model uses CFO minus cash purchases of property/equipment and capitalized internal-use software as its cash-flow proxy. **It is not fully unlevered FCFF**: reported CFO includes cash interest. The original “FCFF” label overstated the model. Historical convertible accounting interest is also an imperfect debt-cost proxy. The reported values below are conditional sensitivity outputs, not a fully market-calibrated fair-value determination. Those model limitations, a single weighted method and a large terminal share keep effective conviction at 40/100. No lease-specific discount rate is represented as a company-wide cost of capital.

## 2. Evidence-bound inputs

| Input | Value | Source and status |
|---|---:|---|
| Price | $106.79, 2026-09-14 | Capital IQ Comps Financial Data, dated vendor observation |
| Economic diluted working shares | 148.333m | 153.686m GAAP diluted − 5.353m note-hedge benefit; Q2 Form 10-Q, Note 13 p.25 and MD&A p.39 |
| Strict net debt, carrying basis | $6,082.571m | Q2 Form 10-Q, balance sheet p.3 and Note 7 p.19 |
| Risk-free input used | 4.83%, 2026-09-09 | U.S. Treasury daily par yields, 10-year column; independently corroborated by Federal Reserve H.15; dated September 9, not September 14 |
| Equity risk premium used | 4.23% | Damodaran Historical Implied Equity Risk Premiums, January 2026 update, 2025 row, implied ERP (FCFE) column |
| Beta | 1.00 | Explicit analyst assumption; the old unverified 0.63 Yahoo observation is not an input or justification |
| Equity return proxy | 9.06% | 4.83% + 1.00 × 4.23%, derived |
| Historical debt-interest ratio | 0.5528403% | Annualized principal-weighted effective-interest estimate $42.237m / $7,640m principal, derived from the five Q2 2026 tranches; Note 7 pp.17–19; not FY2025 reported interest or current marginal debt yield |
| Tax rate | 19.0% | Retained normalized model assumption, not a forecast filing fact |
| Weights | 66.9869% equity / 33.0131% debt | $15,345.7m current market equity and $7,562.8m carrying debt; mixed measurement bases, not full market-value weights |

Source URLs, acquisition dates, source page digests and exact fact excerpts are recorded in `market_input_evidence.json`. The risk-free observation and ERP are verified source facts; choosing their dates and combining them with beta, tax, weights and debt-cost proxies remains analyst judgment.

The conditional blended rate is **6.2168482786% = [15345.7/(15345.7+7562.8)]×9.06% + [7562.8/(15345.7+7562.8)]×(42.237/7640)×(1−19%)**. This is a reproducible model input, not proof that investors currently demand precisely that return. The filing's $8,674.998m debt fair value includes conversion economics; replacing debt weights with that amount without a matched hedge/option treatment would not by itself solve the economic limitation.

## 3. Retained explicit forecast, USD millions

| Year | 2026 | 2027 | 2028 | 2029 | 2030 |
|---|---:|---:|---:|---:|---:|
| Revenue | 4,491.3 | 5,078.7 | 5,662.3 | 6,115.3 | 6,482.3 |
| CFO margin | 30.0% | 31.0% | 32.0% | 33.0% | 33.5% |
| Cash capex / revenue | 20.0% | 20.0% | 19.5% | 19.0% | 18.5% |
| GAAP EBIT margin | 10.5% | 12.0% | 13.0% | 13.5% | 14.0% |
| Cash proxy, full year | 449.1 | 558.7 | 707.8 | 856.1 | 972.3 |
| Cash actually discounted | 227.926 H2 | 558.7 | 707.8 | 856.1 | 972.3 |
| Discount time, years | 0.25 | 1 | 2 | 3 | 4 |

The 2026–2028 revenue anchors come from the original Capital IQ Estimates Report, Consensus worksheet carried in the September 14 source set; the worksheet has no explicit snapshot date, so its vintage is undated; the later revenues, margins, capex ratios and timing are retained analyst inferences. The H2 stub subtracts already realized cash; it is not a second full year. The reported source LTM strict FCF is $629.879m. The source genealogy is preserved in the original valuation/04 and historical-financials module; the maintenance lineage identifies every reused report.

## 4. Terminal and base arithmetic

The original financeable-growth build is retained: reinvestment proxy **$94.8m = 1,199.2 − 1,134.4 + 30.0**, divided by **$735.1m** terminal NOPAT, times the faded terminal ROIC equal to the model rate. Thus **g = 0.8017374736%**. These terminal inputs are model assumptions. ROIC fading to the blended rate does not assert a durable excess-return franchise.

`PV explicit = Σ cash[t]/(1+w)^time[t] = $2,856.171761m`.

`PV terminal = 972.3×(1+g)/(w−g)/(1+w)^4.5 = $13,797.188826m`.

`Enterprise value = $16,653.360587m; less $6,082.571m strict net debt = $10,570.789587m equity; /148.333m = $71.263910 per share`.

Terminal value is **82.849277%** of enterprise value. The original 82.2% label was arithmetically wrong. It remains above the 75% low-confidence threshold. The 4.5-year terminal timing is held consistent in all forward and reverse solves, distinct from the explicit cash discount times.

## 5. Matched reverse solves and genuine upside span

At the same 148.333m working shares and debt basis, the $106.79 price targets $21,923.05207m EV. Holding the model rate and terminal growth constant requires **16.9744503%** annual cash-proxy growth from $629.879m. The stub and annual sequence is **$340.621957m / $796.881324m / $932.147549m / $1,090.374471m / $1,275.459544m**. FY2030 cash margin is **19.676034%** on $6,482.3m revenue. A forward recalculation returns $106.79.

Alternatively, holding the base cash path and terminal growth constant requires a **4.9553250163%** rate; a forward recalculation also returns $106.79. This is an implied parameter, not an independently observed rate.

Combining both good outcomes produces the bull execution case. That is a conjunction: improved cash conversion and a lower required return must occur together. Neither alone supports the joint $153.3925 target. The 10% probability is judgment on that conjunction, not a claim of measured frequency. A strong CIS cash-conversion report can affect both drivers, but this dependence is uncertain.

## 6. Four scenarios — full common basis

| Case | Judgment probability | Conditional rate | Terminal growth | EV $m | Equity $m | Price | Return from $106.79 |
|---|---:|---:|---:|---:|---:|---:|---:|
| bull_execution | 10% | 4.955325% | 0.801737% | 28,835.744515 | 22,753.173515 | $153.392526 | +43.639410% |
| bull_dcf_sensitivity | 15% | 5.216848% | 1.301737% | 22,935.651177 | 16,853.080177 | $113.616526 | +6.392477% |
| base | 45% | 6.216848% | 0.801737% | 16,653.360587 | 10,570.789587 | $71.263910 | -33.267244% |
| bear_cyclical | 30% | 7.216848% | 0.301737% | 13,098.035661 | 7,015.464661 | $47.295374 | -55.711795% |

All four subtract $6,082.571m and use 148.333m economic working shares. All prices are below the first $155.02 warrant strike. The sensitivity bull uses the base cash path with a rate 1 point lower and growth 0.5 points higher; the bear uses the base path with a rate 1 point higher and growth 0.5 points lower. The bear does not also reduce explicit cash: operating weakness is represented through cash durability and required return, so do not double-count an unmodeled cash decline in describing it.

Weighted target **$78.63910317 = 10%×153.3925257 + 15%×113.6165262 + 45%×71.2639102 + 30%×47.2953737**. Expected return **−26.36098589% = 78.63910317/106.79−1**, equal to the weighted scenario returns. Probabilities total 100%. Downside risk is positive **55.71179543%**. Expected-reward/downside ratio is **−0.47316705**; bull-upside/bear-downside is a different statistic, **0.78330647**. Margin of safety uses value as denominator: **−49.85144619% = (71.26391017−106.79)/71.26391017**.

The +43.64% joint bull passes the span test. The $113.62 sensitivity grid point alone does not represent the full upside distribution. Probabilities are retained judgment, not fitted frequencies. A separate declining-perpetuity structural check uses $2,856.171761m explicit PV + $8,450.298764m terminal PV = $11,306.470525m EV: less $6,082.571m gives $5,223.899525m equity, or **$35.21738**, over 24–36 months. It is not a member of the 12-month probability distribution.

## 7. Sensitivities and valuation validity

Replacing carrying debt with principal lowers the base to **$70.743648** and the joint bull to **$152.872264**. The difference is $0.520262 per share.

The September 14 Treasury 10-year rate is **4.97%**, versus the explicitly dated September 9 input 4.83%. Substitution raises the conditional blended rate to **6.310630%** and gives base **$69.276256** at fixed terminal growth, or **$69.487581** when financeable growth is rederived to 0.813832%. These are sensitivities; neither silently replaces the dated original-input correction.

At fixed terminal growth and base cash, rate assumptions of 4% / 5% / 6% / 7% / 8% / 9% / 10% give prices **$152.4502 / $105.1652 / $76.1365 / $56.5245 / $42.4018 / $31.7573 / $23.4548**. These are hypothetical rate choices, not market evidence. Keeping the original weights and equity return but replacing the 0.55284% historical debt-interest proxy with hypothetical 4.83% / 6% / 8% debt costs gives model rates 7.360586% / 7.673451% / 8.208263% and prices **$50.930676 / $46.557132 / $39.945047**. This exposes how favorable the original cheap-debt assumption already is; it does not establish which marginal rate is correct.

The model earns no second-method credit from those sensitivities. Own-history has too few observations; the prior broad peer basket has mismatched economics. Additional peer workbooks were present in the September 15 extraction, so their absence is not asserted. A new matched peer valuation has not been performed in this targeted correction. The highest-value next test remains a complete independent valuation using matched dates, capital structures, forward earnings definitions and a warranted multiple. Conditional negative expected return is a low-confidence rejection of the long, not proof of a short opportunity.

## 8. Reproduction and evidence

`corrected_model.json` retains unrounded outputs. `reproduce_model.py` contains all inputs, discounting, root solves and warrant treatment. Its historical narrow-correction section is diagnostic only; the **matched_scenarios** and **matched_aggregate** fields are the authoritative corrected distribution. No model-output number is attributed to a filing. The calculation is independently reviewed against the filing and the final master decision.
