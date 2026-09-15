> Targeted correction published 2026-09-15. Operating forecasts and the $106.79 price remain dated 2026-09-14. This report replaces the affected valuation output; unaffected modules are reused with lineage in `maintenance_lineage.json`. No new specialist execution is claimed.

# AKAM — Scenario and fair-value adjudication

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

## Decision

Avoid at the dated $106.79 price, with raw conviction 50/100 and effective conviction 40/100 after the cumulative ten-point adversarial haircut. The model shows conditional downside, but its joint +43.64% bull, one-method dependence, period-average shares and unobserved current marginal debt cost forbid high confidence. Do not count sensitivities, sell-side targets or a broad peer median as independent corroboration.
